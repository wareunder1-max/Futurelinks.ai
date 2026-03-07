/**
 * Google Gemini Provider
 * 
 * Transforms standardized request format to Gemini API format
 * Requirements: 4.3
 */

import { StandardMessage } from './types';

export interface GeminiContent {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface GeminiRequest {
  contents: GeminiContent[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
}

/**
 * Transform standardized request to Gemini API format
 * 
 * @param message - The user's current message
 * @param conversationHistory - Optional array of previous messages
 * @param model - Optional model selection (defaults to gemini-pro)
 * @returns Gemini-formatted request object
 */
export function transformToGemini(
  message: string,
  conversationHistory?: StandardMessage[],
  model?: string
): GeminiRequest {
  const contents: GeminiContent[] = [];

  // Add conversation history if provided
  if (conversationHistory && conversationHistory.length > 0) {
    for (const msg of conversationHistory) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }
  }

  // Add current user message
  contents.push({
    role: 'user',
    parts: [{ text: message }],
  });

  return {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };
}

/**
 * Make request to Gemini API
 * 
 * @param apiKey - Decrypted Gemini API key
 * @param request - Gemini-formatted request
 * @param model - Model name (defaults to gemini-pro)
 * @returns Response from Gemini API
 */
export async function callGemini(
  apiKey: string,
  request: GeminiRequest,
  model: string = 'gemini-pro'
): Promise<Response> {
  // Gemini uses streaming endpoint with API key in URL
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  return response;
}
