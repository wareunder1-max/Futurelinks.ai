/**
 * Tests for OpenAI Provider
 * 
 * Validates OpenAI request transformation and API call functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transformToOpenAI, callOpenAI, type StandardMessage } from '@/lib/providers/openai';

describe('OpenAI Provider', () => {
  describe('transformToOpenAI', () => {
    it('should transform simple message without history', () => {
      const message = 'Hello, AI!';
      const result = transformToOpenAI(message);

      expect(result.model).toBe('gpt-3.5-turbo');
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toEqual({
        role: 'user',
        content: 'Hello, AI!',
      });
      expect(result.stream).toBe(true);
      expect(result.temperature).toBe(0.7);
    });

    it('should transform message with conversation history', () => {
      const message = 'What is 2+2?';
      const history: StandardMessage[] = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ];

      const result = transformToOpenAI(message, history);

      expect(result.messages).toHaveLength(3);
      expect(result.messages[0]).toEqual({
        role: 'user',
        content: 'Hello',
      });
      expect(result.messages[1]).toEqual({
        role: 'assistant',
        content: 'Hi there!',
      });
      expect(result.messages[2]).toEqual({
        role: 'user',
        content: 'What is 2+2?',
      });
    });

    it('should use custom model when specified', () => {
      const message = 'Test message';
      const result = transformToOpenAI(message, undefined, 'gpt-4');

      expect(result.model).toBe('gpt-4');
    });

    it('should handle empty conversation history', () => {
      const message = 'Test message';
      const result = transformToOpenAI(message, []);

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content).toBe('Test message');
    });
  });

  describe('callOpenAI', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    it('should make correct API call with proper headers', async () => {
      const mockResponse = new Response(JSON.stringify({ choices: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      const apiKey = 'test-api-key';
      const request = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user' as const, content: 'Hello' }],
        stream: true,
        temperature: 0.7,
      };

      const response = await callOpenAI(apiKey, request);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key',
          },
          body: JSON.stringify(request),
        }
      );

      expect(response.ok).toBe(true);
    });

    it('should throw error on API failure', async () => {
      const mockResponse = new Response('Unauthorized', {
        status: 401,
        statusText: 'Unauthorized',
      });

      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      const apiKey = 'invalid-key';
      const request = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user' as const, content: 'Hello' }],
        stream: true,
      };

      await expect(callOpenAI(apiKey, request)).rejects.toThrow(
        'OpenAI API error: 401 Unauthorized'
      );
    });
  });
});
