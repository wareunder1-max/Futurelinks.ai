/**
 * Anthropic Provider
 * 
 * Transforms standardized request format to Anthropic API format
 * Requirements: 4.3
 */

import { StandardMessage } from './types';

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AnthropicRequest {
  model: string;
  messages: AnthropicMessage[];
  max_tokens: number;
  stream?: boolean;
  temperature?: number;
}

/**
 * Transform standardized request to Anthropic API format
 * 
 * @param message - The user's current message
 * @param conversationHistory - Optional array of previous messages
 * @param model - Optional model selection (defaults to claude-3-sonnet-20240229)
 * @returns Anthropic-formatted request object
 */
export function transformToAnthropic(
  message: string,
  conversationHistory?: StandardMessage[],
  model?: string
): AnthropicRequest {
  const messages: AnthropicMessage[] = [];

  // Add conversation history if provided
  if (conversationHistory && conversationHistory.length > 0) {
    for (const msg of conversationHistory) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }
  }

  // Add current user message
  messages.push({
    role: 'user',
    content: message,
  });

  // Default to Claude 3 Sonnet if no model specified
  const selectedModel = model || 'claude-3-sonnet-20240229';

  return {
    model: selectedModel,
    messages,
    max_tokens: 4096,
    stream: true, // Enable streaming for real-time responses
    temperature: 0.7,
  };
}

/**
 * Make request to Anthropic API
 * 
 * @param apiKey - Decrypted Anthropic API key
 * @param request - Anthropic-formatted request
 * @returns Response from Anthropic API
 */
export async function callAnthropic(
  apiKey: string,
  request: AnthropicRequest
): Promise<Response> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
  }

  return response;
}
