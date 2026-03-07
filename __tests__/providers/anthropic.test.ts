/**
 * Tests for Anthropic Provider
 * 
 * Validates Anthropic request transformation and API call functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transformToAnthropic, callAnthropic, type StandardMessage } from '@/lib/providers/anthropic';

describe('Anthropic Provider', () => {
  describe('transformToAnthropic', () => {
    it('should transform simple message without history', () => {
      const message = 'Hello, AI!';
      const result = transformToAnthropic(message);

      expect(result.model).toBe('claude-3-sonnet-20240229');
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toEqual({
        role: 'user',
        content: 'Hello, AI!',
      });
      expect(result.stream).toBe(true);
      expect(result.temperature).toBe(0.7);
      expect(result.max_tokens).toBe(4096);
    });

    it('should transform message with conversation history', () => {
      const message = 'What is 2+2?';
      const history: StandardMessage[] = [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ];

      const result = transformToAnthropic(message, history);

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
      const result = transformToAnthropic(message, undefined, 'claude-3-opus-20240229');

      expect(result.model).toBe('claude-3-opus-20240229');
    });

    it('should handle empty conversation history', () => {
      const message = 'Test message';
      const result = transformToAnthropic(message, []);

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content).toBe('Test message');
    });
  });

  describe('callAnthropic', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    it('should make correct API call with proper headers', async () => {
      const mockResponse = new Response(JSON.stringify({ content: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      const apiKey = 'test-api-key';
      const request = {
        model: 'claude-3-sonnet-20240229',
        messages: [{ role: 'user' as const, content: 'Hello' }],
        max_tokens: 4096,
        stream: true,
        temperature: 0.7,
      };

      const response = await callAnthropic(apiKey, request);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'test-api-key',
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify(request),
        }
      );

      expect(response.ok).toBe(true);
    });

    it('should throw error on API failure', async () => {
      const mockResponse = new Response('Invalid API key', {
        status: 401,
        statusText: 'Unauthorized',
      });

      vi.mocked(global.fetch).mockResolvedValue(mockResponse);

      const apiKey = 'invalid-key';
      const request = {
        model: 'claude-3-sonnet-20240229',
        messages: [{ role: 'user' as const, content: 'Hello' }],
        max_tokens: 4096,
        stream: true,
      };

      await expect(callAnthropic(apiKey, request)).rejects.toThrow(
        'Anthropic API error: 401 Unauthorized'
      );
    });
  });
});
