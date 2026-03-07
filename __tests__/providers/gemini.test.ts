/**
 * Tests for Gemini Provider
 * 
 * Validates Gemini request transformation and API call functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transformToGemini, callGemini, type StandardMessage } from '@/lib/providers/gemini';

describe('Gemini Provider', () => {
  describe('transformToGemini', () => {
    it('should transform simple message without history', () => {
      const message = 'Hello, AI!';
      const result = transformToGemini(message);

      expect(result.contents).toHaveLength(1);
      expect(result.contents[0]).toEqual({
        role: 'user',
        parts: [{ text: 'Hello, AI!' }],
      });
      expect(result.generationConfig).toEqual({
        temperature: 0.7,
        maxOutputTokens: 2048,
      });
    });

    it('should transform message with conversation history', () => {
      const message = 'What is 2+2?';
      const history: StandardMessage[] = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ];

      const result = transformToGemini(message, history);

      expect(result.contents).toHaveLength(3);
      expect(result.contents[0]).toEqual({
        role: 'user',
        parts: [{ text: 'Hello' }],
      });
      expect(result.contents[1]).toEqual({
        role: 'model',
        parts: [{ text: 'Hi there!' }],
      });
      expect(result.contents[2]).toEqual({
        role: 'user',
        parts: [{ text: 'What is 2+2?' }],
      });
    });

    it('should convert assistant role to model role', () => {
      const message = 'Follow up question';
      const history: StandardMessage[] = [
        { role: 'assistant', content: 'Previous response' },
      ];

      const result = transformToGemini(message, history);

      expect(result.contents[0].role).toBe('model');
    });

    it('should handle empty conversation history', () => {
      const message = 'Test message';
      const result = transformToGemini(message, []);

      expect(result.contents).toHaveLength(1);
      expect(result.contents[0].parts[0].text).toBe('Test message');
    });
  });

  describe('callGemini', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    it('should make correct API call with API key in URL', async () => {
      const mockResponse = new Response(JSON.stringify({ candidates: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      const apiKey = 'test-api-key';
      const request = {
        contents: [
          {
            role: 'user' as const,
            parts: [{ text: 'Hello' }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      };

      const response = await callGemini(apiKey, request);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent?key=test-api-key',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      expect(response.ok).toBe(true);
    });

    it('should use custom model when specified', async () => {
      const mockResponse = new Response(JSON.stringify({ candidates: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      const apiKey = 'test-api-key';
      const request = {
        contents: [
          {
            role: 'user' as const,
            parts: [{ text: 'Hello' }],
          },
        ],
      };

      await callGemini(apiKey, request, 'gemini-1.5-pro');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('gemini-1.5-pro:streamGenerateContent'),
        expect.any(Object)
      );
    });

    it('should throw error on API failure', async () => {
      const mockResponse = new Response('Invalid API key', {
        status: 400,
        statusText: 'Bad Request',
      });

      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      const apiKey = 'invalid-key';
      const request = {
        contents: [
          {
            role: 'user' as const,
            parts: [{ text: 'Hello' }],
          },
        ],
      };

      await expect(callGemini(apiKey, request)).rejects.toThrow(
        'Gemini API error: 400 Bad Request'
      );
    });
  });
});
