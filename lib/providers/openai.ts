/**
 * OpenAI Provider
 * 
 * Transforms standardized request format to OpenAI API format
 * Requirements: 4.3
 */

import { StandardMessage } from './types';

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

/**
 * Transform standardized request to OpenAI API format
 * 
 * @param message - The user's current message
 * @param conversationHistory - Optional array of previous messages
 * @param model - Optional model selection (defaults to gpt-3.5-turbo)
 * @returns OpenAI-formatted request object
 */
export function transformToOpenAI(
  message: string,
  conversationHistory?: StandardMessage[],
  model?: string
): OpenAIRequest {
  const messages: OpenAIMessage[] = [];

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

  // Default to gpt-3.5-turbo if no model specified
  const selectedModel = model || 'gpt-3.5-turbo';

  return {
    model: selectedModel,
    messages,
    stream: true, // Enable streaming for real-time responses
    temperature: 0.7,
  };
}

/**
 * Make request to OpenAI API
 * 
 * @param apiKey - Decrypted OpenAI API key
 * @param request - OpenAI-formatted request
 * @returns Response from OpenAI API
 */
export async function callOpenAI(
  apiKey: string,
  request: OpenAIRequest
): Promise<Response> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  return response;
}
