import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-setup';
import { prisma } from '@/lib/prisma';
import { decryptAPIKey } from '@/lib/encryption';
import { transformToOpenAI, callOpenAI } from '@/lib/providers/openai';
import { transformToGemini, callGemini } from '@/lib/providers/gemini';
import { transformToAnthropic, callAnthropic } from '@/lib/providers/anthropic';
import {
  ErrorCode,
  createErrorResponse,
  getStatusCode,
  handleError,
  logInfo,
  logWarning,
} from '@/lib/errors';
import { trackProxyRequest, trackAPIRequest } from '@/lib/monitoring';

/**
 * AI Proxy API Route
 * 
 * This route handles incoming chat requests from authenticated users,
 * validates their session, and parses the request body containing:
 * - message: The user's chat message
 * - conversationHistory: Optional array of previous messages
 * - model: Optional model selection (defaults to first available)
 * 
 * Requirements: 4.1, 13.6
 */

interface ProxyRequestBody {
  message: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
}

/**
 * POST /api/proxy
 * 
 * Handles AI chat requests from authenticated users
 */
export async function POST(request: NextRequest) {
  try {
    // Validate user session with NextAuth
    const session = await auth();

    if (!session || !session.user) {
      const errorResponse = createErrorResponse(ErrorCode.UNAUTHORIZED);
      return NextResponse.json(errorResponse, { status: getStatusCode(ErrorCode.UNAUTHORIZED) });
    }

    // Ensure user has public role (not admin)
    if (session.user.role !== 'public') {
      const errorResponse = createErrorResponse(
        ErrorCode.FORBIDDEN,
        'This endpoint is only accessible to public users.'
      );
      return NextResponse.json(errorResponse, { status: getStatusCode(ErrorCode.FORBIDDEN) });
    }

    // Parse request body
    let body: ProxyRequestBody;
    try {
      body = await request.json();
    } catch (parseError) {
      const errorResponse = createErrorResponse(
        ErrorCode.INVALID_REQUEST,
        'Invalid JSON in request body.'
      );
      return NextResponse.json(errorResponse, { status: getStatusCode(ErrorCode.INVALID_REQUEST) });
    }

    // Validate required fields
    if (!body.message || typeof body.message !== 'string') {
      const errorResponse = createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        'Message field is required and must be a string.'
      );
      return NextResponse.json(errorResponse, { status: getStatusCode(ErrorCode.VALIDATION_ERROR) });
    }

    // Validate message is not empty
    if (body.message.trim().length === 0) {
      const errorResponse = createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        'Message cannot be empty.'
      );
      return NextResponse.json(errorResponse, { status: getStatusCode(ErrorCode.VALIDATION_ERROR) });
    }

    // Validate conversationHistory if provided
    if (body.conversationHistory !== undefined) {
      if (!Array.isArray(body.conversationHistory)) {
        const errorResponse = createErrorResponse(
          ErrorCode.VALIDATION_ERROR,
          'conversationHistory must be an array.'
        );
        return NextResponse.json(errorResponse, { status: getStatusCode(ErrorCode.VALIDATION_ERROR) });
      }

      // Validate each message in history
      for (const msg of body.conversationHistory) {
        if (!msg.role || !msg.content) {
          const errorResponse = createErrorResponse(
            ErrorCode.VALIDATION_ERROR,
            'Each message in conversationHistory must have role and content.'
          );
          return NextResponse.json(errorResponse, { status: getStatusCode(ErrorCode.VALIDATION_ERROR) });
        }

        if (msg.role !== 'user' && msg.role !== 'assistant') {
          const errorResponse = createErrorResponse(
            ErrorCode.VALIDATION_ERROR,
            'Message role must be either "user" or "assistant".'
          );
          return NextResponse.json(errorResponse, { status: getStatusCode(ErrorCode.VALIDATION_ERROR) });
        }
      }
    }

    // Validate model if provided
    if (body.model !== undefined && typeof body.model !== 'string') {
      const errorResponse = createErrorResponse(
        ErrorCode.VALIDATION_ERROR,
        'Model must be a string.'
      );
      return NextResponse.json(errorResponse, { status: getStatusCode(ErrorCode.VALIDATION_ERROR) });
    }

    // Task 9.2: API key selection logic
    // Query APIKey table for available keys
    let selectedKey: {
      id: string;
      provider: string;
      encryptedKey: string;
      createdAt: Date;
      updatedAt: Date;
      lastUsedAt: Date | null;
    } | null = null;
    
    try {
      // If a specific provider/model is requested, try to find a matching key
      if (body.model) {
        // Map model names to providers
        const providerMap: Record<string, string> = {
          'gpt-4': 'openai',
          'gpt-3.5-turbo': 'openai',
          'gemini': 'gemini',
          'gemini-pro': 'gemini',
          'claude': 'anthropic',
          'claude-3': 'anthropic',
        };
        
        const requestedProvider = providerMap[body.model.toLowerCase()];
        
        if (requestedProvider) {
          // Try to find a key for the requested provider
          selectedKey = await prisma.aPIKey.findFirst({
            where: {
              provider: requestedProvider,
            },
            orderBy: {
              lastUsedAt: 'asc', // Prefer least recently used key for load balancing
            },
          });
        }
      }
      
      // If no specific provider key found, default to first available key
      if (!selectedKey) {
        selectedKey = await prisma.aPIKey.findFirst({
          orderBy: {
            lastUsedAt: 'asc', // Prefer least recently used key
          },
        });
      }
      
      // Handle case when no keys are available (503 error)
      if (!selectedKey) {
        const errorResponse = createErrorResponse(
          ErrorCode.NO_API_KEYS_AVAILABLE,
          'No API keys are currently available. Please contact the administrator.'
        );
        return NextResponse.json(errorResponse, { status: getStatusCode(ErrorCode.NO_API_KEYS_AVAILABLE) });
      }

      // TypeScript type guard: selectedKey is now guaranteed to be non-null
      const apiKey = selectedKey;
      
      // Decrypt the API key for use
      const decryptedKey = decryptAPIKey(apiKey.encryptedKey);
      
      // Log the selected key info (for debugging, don't log the actual key)
      logInfo(`Selected API key: ${apiKey.id} (provider: ${apiKey.provider})`, {
        userId: session.user.id,
        apiKeyId: apiKey.id,
        provider: apiKey.provider,
      });
      
      // Task 9.3 & 9.4: Transform request and forward to provider with streaming
      const requestStartTime = Date.now();
      let providerResponse: Response;

      try {
        // Transform request based on provider
        switch (apiKey.provider) {
          case 'openai': {
            const openaiRequest = transformToOpenAI(
              body.message,
              body.conversationHistory,
              body.model
            );
            providerResponse = await callOpenAI(decryptedKey, openaiRequest);
            break;
          }
          case 'gemini': {
            const geminiRequest = transformToGemini(
              body.message,
              body.conversationHistory,
              body.model
            );
            providerResponse = await callGemini(
              decryptedKey,
              geminiRequest,
              body.model || 'gemini-pro'
            );
            break;
          }
          case 'anthropic': {
            const anthropicRequest = transformToAnthropic(
              body.message,
              body.conversationHistory,
              body.model
            );
            providerResponse = await callAnthropic(decryptedKey, anthropicRequest);
            break;
          }
          default: {
            const errorResponse = createErrorResponse(
              ErrorCode.UNSUPPORTED_PROVIDER,
              `Provider ${apiKey.provider} is not supported.`
            );
            return NextResponse.json(errorResponse, { status: getStatusCode(ErrorCode.UNSUPPORTED_PROVIDER) });
          }
        }

        // Task 9.4: Stream response back to client using Server-Sent Events
        // Create a ReadableStream that forwards the provider's response
        const stream = new ReadableStream({
          async start(controller) {
            const reader = providerResponse.body?.getReader();
            const decoder = new TextDecoder();
            
            if (!reader) {
              controller.error(new Error('No response body from provider'));
              return;
            }

            try {
              // Set up 10-second timeout
              const timeoutId = setTimeout(() => {
                reader.cancel();
                controller.error(new Error('Request timeout after 10 seconds'));
              }, 10000);

              let totalTokens: number | null = null;

              while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                  clearTimeout(timeoutId);
                  controller.close();
                  break;
                }

                // Forward the chunk to the client
                const chunk = decoder.decode(value, { stream: true });
                controller.enqueue(new TextEncoder().encode(chunk));

                // Task 9.6: Try to extract token usage from provider response
                // Note: Token information is typically in the final chunk for streaming responses
                // This is a best-effort extraction and may not work for all providers
                try {
                  // For OpenAI, tokens are in the final chunk as JSON
                  if (chunk.includes('usage') && chunk.includes('total_tokens')) {
                    const match = chunk.match(/"total_tokens":\s*(\d+)/);
                    if (match) {
                      totalTokens = parseInt(match[1], 10);
                    }
                  }
                } catch (parseError) {
                  // Ignore parsing errors - token tracking is optional
                }
              }

              // Task 9.6: Record usage metrics after successful streaming
              const requestDuration = Date.now() - requestStartTime;
              logInfo(`Request completed in ${requestDuration}ms using key ${apiKey.id}`, {
                userId: session.user.id,
                apiKeyId: apiKey.id,
                requestDuration,
                tokensUsed: totalTokens,
              });
              
              // Track proxy request for monitoring
              trackProxyRequest(apiKey.provider, requestDuration, totalTokens || undefined);
              
              // Create UsageLog entry and update APIKey.lastUsedAt
              try {
                await prisma.$transaction([
                  // Create usage log entry
                  prisma.usageLog.create({
                    data: {
                      apiKeyId: apiKey.id,
                      timestamp: new Date(),
                      tokensUsed: totalTokens,
                      requestDuration: requestDuration,
                    },
                  }),
                  // Update API key's lastUsedAt field for load balancing
                  prisma.aPIKey.update({
                    where: { id: apiKey.id },
                    data: { lastUsedAt: new Date() },
                  }),
                ]);
                
                logInfo(`Usage logged: ${requestDuration}ms, ${totalTokens || 'unknown'} tokens`, {
                  userId: session.user.id,
                  apiKeyId: apiKey.id,
                  requestDuration,
                  tokensUsed: totalTokens,
                });
              } catch (logError) {
                // Log the error but don't fail the request
                logWarning('Failed to log usage metrics', {
                  userId: session.user.id,
                  apiKeyId: apiKey.id,
                  error: logError instanceof Error ? logError.message : String(logError),
                });
              }
              
            } catch (error) {
              logWarning('Streaming error occurred', {
                userId: session.user.id,
                apiKeyId: apiKey.id,
                error: error instanceof Error ? error.message : String(error),
              });
              controller.error(error);
            }
          },
        });

        // Return streaming response with appropriate headers
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });

      } catch (providerError: any) {
        // Task 9.4: Handle provider errors gracefully
        const requestDuration = Date.now() - requestStartTime;
        
        // Track failed proxy request
        trackProxyRequest(
          apiKey.provider,
          requestDuration,
          undefined,
          providerError instanceof Error ? providerError : new Error(String(providerError))
        );
        
        const errorResponse = handleError(
          providerError,
          ErrorCode.PROVIDER_ERROR,
          {
            userId: session.user.id,
            apiKeyId: selectedKey?.id,
            provider: selectedKey?.provider,
          },
          'Unable to process your request. Please try again later.'
        );
        
        return NextResponse.json(errorResponse, { status: getStatusCode(ErrorCode.PROVIDER_ERROR) });
      }
      
    } catch (error) {
      const errorResponse = handleError(
        error instanceof Error ? error : String(error),
        ErrorCode.KEY_SELECTION_ERROR,
        {
          userId: session.user.id,
        },
        'Failed to select an API key. Please try again later.'
      );
      
      return NextResponse.json(errorResponse, { status: getStatusCode(ErrorCode.KEY_SELECTION_ERROR) });
    }
  } catch (error) {
    const errorResponse = handleError(
      error instanceof Error ? error : String(error),
      ErrorCode.INTERNAL_ERROR,
      {
        path: request.url,
        method: request.method,
      },
      'An unexpected error occurred. Please try again later.'
    );

    return NextResponse.json(errorResponse, { status: getStatusCode(ErrorCode.INTERNAL_ERROR) });
  }
}
