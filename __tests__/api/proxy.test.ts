import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/proxy/route';
import { NextRequest } from 'next/server';

// Mock the auth function
vi.mock('@/lib/auth-setup', () => ({
  auth: vi.fn(),
}));

// Mock the prisma client
vi.mock('@/lib/prisma', () => ({
  prisma: {
    aPIKey: {
      findFirst: vi.fn(),
    },
  },
}));

// Mock the encryption module
vi.mock('@/lib/encryption', () => ({
  decryptAPIKey: vi.fn((encrypted: string) => `decrypted-${encrypted}`),
}));

// Mock the provider modules
vi.mock('@/lib/providers/openai', () => ({
  transformToOpenAI: vi.fn((message: string) => ({ message })),
  callOpenAI: vi.fn(async () => new Response('{"response": "test"}', { status: 200 })),
}));

vi.mock('@/lib/providers/gemini', () => ({
  transformToGemini: vi.fn((message: string) => ({ message })),
  callGemini: vi.fn(async () => new Response('{"response": "test"}', { status: 200 })),
}));

vi.mock('@/lib/providers/anthropic', () => ({
  transformToAnthropic: vi.fn((message: string) => ({ message })),
  callAnthropic: vi.fn(async () => new Response('{"response": "test"}', { status: 200 })),
}));

import { auth } from '@/lib/auth-setup';
import { prisma } from '@/lib/prisma';

describe('POST /api/proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 when no session exists', async () => {
      // Mock no session
      vi.mocked(auth).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
      expect(data.error.message).toContain('Authentication required');
    });

    it('should return 403 when admin user tries to access', async () => {
      // Mock admin session
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: 'admin-1',
          name: 'Admin',
          email: 'admin@admin.local',
          role: 'admin',
        },
        expires: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      });

      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error.code).toBe('FORBIDDEN');
      expect(data.error.message).toContain('public users');
    });

    it('should accept request from authenticated public user', async () => {
      // Mock public user session
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'public',
        },
        expires: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      });

      // Mock available API key
      vi.mocked(prisma.aPIKey.findFirst).mockResolvedValue({
        id: 'key-1',
        provider: 'openai',
        encryptedKey: 'encrypted-key',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUsedAt: null,
      });

      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello AI' }),
      });

      const response = await POST(request);

      // Should return streaming response
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    });
  });

  describe('Request Body Validation', () => {
    beforeEach(() => {
      // Mock authenticated public user for all validation tests
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'public',
        },
        expires: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      });

      // Mock available API key for successful tests
      vi.mocked(prisma.aPIKey.findFirst).mockResolvedValue({
        id: 'key-1',
        provider: 'openai',
        encryptedKey: 'encrypted-key',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUsedAt: null,
      });
    });

    it('should return 400 for invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('INVALID_REQUEST');
    });

    it('should return 400 when message is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('Message field is required');
    });

    it('should return 400 when message is not a string', async () => {
      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({ message: 123 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('must be a string');
    });

    it('should return 400 when message is empty', async () => {
      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({ message: '   ' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('cannot be empty');
    });

    it('should accept valid message', async () => {
      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello AI' }),
      });

      const response = await POST(request);

      // Should return streaming response
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    });
  });

  describe('Conversation History Validation', () => {
    beforeEach(() => {
      // Mock authenticated public user
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'public',
        },
        expires: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      });

      // Mock available API key for successful tests
      vi.mocked(prisma.aPIKey.findFirst).mockResolvedValue({
        id: 'key-1',
        provider: 'openai',
        encryptedKey: 'encrypted-key',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUsedAt: null,
      });
    });

    it('should return 400 when conversationHistory is not an array', async () => {
      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Hello',
          conversationHistory: 'not an array',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('must be an array');
    });

    it('should return 400 when message in history is missing role', async () => {
      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Hello',
          conversationHistory: [{ content: 'Previous message' }],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('must have role and content');
    });

    it('should return 400 when message role is invalid', async () => {
      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Hello',
          conversationHistory: [
            { role: 'system', content: 'Invalid role' },
          ],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('user" or "assistant');
    });

    it('should accept valid conversation history', async () => {
      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Hello',
          conversationHistory: [
            { role: 'user', content: 'Previous question' },
            { role: 'assistant', content: 'Previous answer' },
          ],
        }),
      });

      const response = await POST(request);

      // Should return streaming response
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    });

    it('should accept empty conversation history', async () => {
      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Hello',
          conversationHistory: [],
        }),
      });

      const response = await POST(request);

      // Should return streaming response
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    });
  });

  describe('Model Validation', () => {
    beforeEach(() => {
      // Mock authenticated public user
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'public',
        },
        expires: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      });

      // Mock available API key for successful tests
      vi.mocked(prisma.aPIKey.findFirst).mockResolvedValue({
        id: 'key-1',
        provider: 'openai',
        encryptedKey: 'encrypted-key',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUsedAt: null,
      });
    });

    it('should return 400 when model is not a string', async () => {
      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Hello',
          model: 123,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('Model must be a string');
    });

    it('should accept valid model string', async () => {
      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Hello',
          model: 'gpt-4',
        }),
      });

      const response = await POST(request);

      // Should return streaming response
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    });

    it('should use default model when not provided', async () => {
      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Hello',
        }),
      });

      const response = await POST(request);

      // Should return streaming response
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    });
  });

  describe('Error Handling', () => {
    it('should include timestamp in error responses', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.timestamp).toBeDefined();
      expect(new Date(data.timestamp).getTime()).toBeGreaterThan(0);
    });

    it('should handle unexpected errors gracefully', async () => {
      // Mock auth to throw an error
      vi.mocked(auth).mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe('INTERNAL_ERROR');
      expect(data.error.message).toContain('unexpected error');
    });
  });

  describe('API Key Selection (Task 9.2)', () => {
    beforeEach(() => {
      // Mock authenticated public user
      vi.mocked(auth).mockResolvedValue({
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'public',
        },
        expires: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      });
    });

    it('should return 503 when no API keys are available', async () => {
      // Mock no API keys available
      vi.mocked(prisma.aPIKey.findFirst).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello AI' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error.code).toBe('NO_API_KEYS_AVAILABLE');
      expect(data.error.message).toContain('No API keys are currently available');
    });

    it('should select first available key when no model specified', async () => {
      // Mock available API key
      const mockKey = {
        id: 'key-1',
        provider: 'openai',
        encryptedKey: 'encrypted-key-data',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUsedAt: null,
      };
      vi.mocked(prisma.aPIKey.findFirst).mockResolvedValue(mockKey);

      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello AI' }),
      });

      const response = await POST(request);

      // Should return streaming response
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
      
      // Verify findFirst was called with correct ordering
      expect(prisma.aPIKey.findFirst).toHaveBeenCalledWith({
        orderBy: {
          lastUsedAt: 'asc',
        },
      });
    });

    it('should select key based on provider when model is specified', async () => {
      // Mock available API key for OpenAI
      const mockKey = {
        id: 'key-openai',
        provider: 'openai',
        encryptedKey: 'encrypted-openai-key',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUsedAt: null,
      };
      vi.mocked(prisma.aPIKey.findFirst).mockResolvedValue(mockKey);

      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({ 
          message: 'Hello AI',
          model: 'gpt-4',
        }),
      });

      const response = await POST(request);

      // Should return streaming response
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
      
      // Verify findFirst was called with provider filter
      expect(prisma.aPIKey.findFirst).toHaveBeenCalledWith({
        where: {
          provider: 'openai',
        },
        orderBy: {
          lastUsedAt: 'asc',
        },
      });
    });

    it('should map gpt-3.5-turbo to openai provider', async () => {
      const mockKey = {
        id: 'key-openai',
        provider: 'openai',
        encryptedKey: 'encrypted-openai-key',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUsedAt: null,
      };
      vi.mocked(prisma.aPIKey.findFirst).mockResolvedValue(mockKey);

      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({ 
          message: 'Hello AI',
          model: 'gpt-3.5-turbo',
        }),
      });

      await POST(request);

      expect(prisma.aPIKey.findFirst).toHaveBeenCalledWith({
        where: {
          provider: 'openai',
        },
        orderBy: {
          lastUsedAt: 'asc',
        },
      });
    });

    it('should map gemini models to gemini provider', async () => {
      const mockKey = {
        id: 'key-gemini',
        provider: 'gemini',
        encryptedKey: 'encrypted-gemini-key',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUsedAt: null,
      };
      vi.mocked(prisma.aPIKey.findFirst).mockResolvedValue(mockKey);

      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({ 
          message: 'Hello AI',
          model: 'gemini-pro',
        }),
      });

      await POST(request);

      expect(prisma.aPIKey.findFirst).toHaveBeenCalledWith({
        where: {
          provider: 'gemini',
        },
        orderBy: {
          lastUsedAt: 'asc',
        },
      });
    });

    it('should map claude models to anthropic provider', async () => {
      const mockKey = {
        id: 'key-anthropic',
        provider: 'anthropic',
        encryptedKey: 'encrypted-anthropic-key',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUsedAt: null,
      };
      vi.mocked(prisma.aPIKey.findFirst).mockResolvedValue(mockKey);

      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({ 
          message: 'Hello AI',
          model: 'claude-3',
        }),
      });

      await POST(request);

      expect(prisma.aPIKey.findFirst).toHaveBeenCalledWith({
        where: {
          provider: 'anthropic',
        },
        orderBy: {
          lastUsedAt: 'asc',
        },
      });
    });

    it('should fallback to any available key if provider-specific key not found', async () => {
      const mockKey = {
        id: 'key-fallback',
        provider: 'openai',
        encryptedKey: 'encrypted-fallback-key',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUsedAt: null,
      };
      
      // First call returns null (no gemini key), second call returns openai key
      vi.mocked(prisma.aPIKey.findFirst)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockKey);

      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({ 
          message: 'Hello AI',
          model: 'gemini-pro',
        }),
      });

      const response = await POST(request);

      // Should return streaming response
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/event-stream');
      
      // Verify two calls were made
      expect(prisma.aPIKey.findFirst).toHaveBeenCalledTimes(2);
    });

    it('should handle database errors during key selection', async () => {
      // Mock database error
      vi.mocked(prisma.aPIKey.findFirst).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello AI' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe('KEY_SELECTION_ERROR');
      expect(data.error.message).toContain('Failed to select an API key');
    });

    it('should prefer least recently used key for load balancing', async () => {
      const mockKey = {
        id: 'key-lru',
        provider: 'openai',
        encryptedKey: 'encrypted-key',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUsedAt: new Date('2024-01-01'),
      };
      vi.mocked(prisma.aPIKey.findFirst).mockResolvedValue(mockKey);

      const request = new NextRequest('http://localhost:3000/api/proxy', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello AI' }),
      });

      await POST(request);

      // Verify ordering by lastUsedAt ascending (least recently used first)
      expect(prisma.aPIKey.findFirst).toHaveBeenCalledWith({
        orderBy: {
          lastUsedAt: 'asc',
        },
      });
    });
  });
});
