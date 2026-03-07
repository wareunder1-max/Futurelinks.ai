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
      update: vi.fn(),
    },
    usageLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// Mock the encryption module
vi.mock('@/lib/encryption', () => ({
  decryptAPIKey: vi.fn((encrypted: string) => `decrypted-${encrypted}`),
}));

// Mock the provider modules
vi.mock('@/lib/providers/openai', () => ({
  transformToOpenAI: vi.fn((message) => ({ messages: [{ role: 'user', content: message }] })),
  callOpenAI: vi.fn(),
}));

vi.mock('@/lib/providers/gemini', () => ({
  transformToGemini: vi.fn((message) => ({ contents: [{ parts: [{ text: message }] }] })),
  callGemini: vi.fn(),
}));

vi.mock('@/lib/providers/anthropic', () => ({
  transformToAnthropic: vi.fn((message) => ({ messages: [{ role: 'user', content: message }] })),
  callAnthropic: vi.fn(),
}));

import { auth } from '@/lib/auth-setup';
import { prisma } from '@/lib/prisma';
import { callOpenAI } from '@/lib/providers/openai';

/**
 * Task 9.6: Usage Tracking Tests
 * 
 * These tests verify that:
 * 1. UsageLog entries are created after each proxy request
 * 2. APIKey.lastUsedAt field is updated
 * 3. Request duration is recorded
 * 4. Token usage is recorded when available
 * 
 * Requirements: 4.7, 11.1
 */
describe('POST /api/proxy - Usage Tracking (Task 9.6)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

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

    // Mock available API key
    vi.mocked(prisma.aPIKey.findFirst).mockResolvedValue({
      id: 'key-1',
      provider: 'openai',
      encryptedKey: 'encrypted-key',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUsedAt: null,
    });

    // Mock successful transaction
    vi.mocked(prisma.$transaction).mockImplementation(async (operations: any[]) => {
      // Execute each operation in the transaction
      const results = [];
      for (const op of operations) {
        results.push(await op);
      }
      return results;
    });

    vi.mocked(prisma.usageLog.create).mockResolvedValue({
      id: 'log-1',
      apiKeyId: 'key-1',
      timestamp: new Date(),
      tokensUsed: null,
      requestDuration: 100,
    });

    vi.mocked(prisma.aPIKey.update).mockResolvedValue({
      id: 'key-1',
      provider: 'openai',
      encryptedKey: 'encrypted-key',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUsedAt: new Date(),
    });
  });

  it('should create UsageLog entry after successful request', async () => {
    // Mock streaming response from provider
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"content":"Hello"}\n\n'));
        controller.close();
      },
    });

    vi.mocked(callOpenAI).mockResolvedValue(
      new Response(mockStream, {
        headers: { 'Content-Type': 'text/event-stream' },
      })
    );

    const request = new NextRequest('http://localhost:3000/api/proxy', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello AI' }),
    });

    const response = await POST(request);

    // Consume the stream to trigger usage logging
    const reader = response.body?.getReader();
    if (reader) {
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }
    }

    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify UsageLog.create was called
    expect(prisma.usageLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          apiKeyId: 'key-1',
          timestamp: expect.any(Date),
          requestDuration: expect.any(Number),
        }),
      })
    );
  });

  it('should update APIKey.lastUsedAt field', async () => {
    // Mock streaming response from provider
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"content":"Hello"}\n\n'));
        controller.close();
      },
    });

    vi.mocked(callOpenAI).mockResolvedValue(
      new Response(mockStream, {
        headers: { 'Content-Type': 'text/event-stream' },
      })
    );

    const request = new NextRequest('http://localhost:3000/api/proxy', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello AI' }),
    });

    const response = await POST(request);

    // Consume the stream to trigger usage logging
    const reader = response.body?.getReader();
    if (reader) {
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }
    }

    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify APIKey.update was called with lastUsedAt
    expect(prisma.aPIKey.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'key-1' },
        data: expect.objectContaining({
          lastUsedAt: expect.any(Date),
        }),
      })
    );
  });

  it('should record request duration in milliseconds', async () => {
    // Mock streaming response with delay
    const mockStream = new ReadableStream({
      async start(controller) {
        await new Promise(resolve => setTimeout(resolve, 50));
        controller.enqueue(new TextEncoder().encode('data: {"content":"Hello"}\n\n'));
        controller.close();
      },
    });

    vi.mocked(callOpenAI).mockResolvedValue(
      new Response(mockStream, {
        headers: { 'Content-Type': 'text/event-stream' },
      })
    );

    const request = new NextRequest('http://localhost:3000/api/proxy', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello AI' }),
    });

    const response = await POST(request);

    // Consume the stream
    const reader = response.body?.getReader();
    if (reader) {
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }
    }

    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify requestDuration is a positive number
    expect(prisma.usageLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          requestDuration: expect.any(Number),
        }),
      })
    );

    const createCall = vi.mocked(prisma.usageLog.create).mock.calls[0][0];
    expect(createCall.data.requestDuration).toBeGreaterThan(0);
  });

  it('should record tokensUsed when available in response', async () => {
    // Mock streaming response with token usage information
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"content":"Hello"}\n\n'));
        controller.enqueue(
          new TextEncoder().encode('data: {"usage":{"total_tokens":150}}\n\n')
        );
        controller.close();
      },
    });

    vi.mocked(callOpenAI).mockResolvedValue(
      new Response(mockStream, {
        headers: { 'Content-Type': 'text/event-stream' },
      })
    );

    const request = new NextRequest('http://localhost:3000/api/proxy', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello AI' }),
    });

    const response = await POST(request);

    // Consume the stream
    const reader = response.body?.getReader();
    if (reader) {
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }
    }

    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify tokensUsed is recorded
    expect(prisma.usageLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tokensUsed: 150,
        }),
      })
    );
  });

  it('should set tokensUsed to null when not available', async () => {
    // Mock streaming response without token usage information
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"content":"Hello"}\n\n'));
        controller.close();
      },
    });

    vi.mocked(callOpenAI).mockResolvedValue(
      new Response(mockStream, {
        headers: { 'Content-Type': 'text/event-stream' },
      })
    );

    const request = new NextRequest('http://localhost:3000/api/proxy', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello AI' }),
    });

    const response = await POST(request);

    // Consume the stream
    const reader = response.body?.getReader();
    if (reader) {
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }
    }

    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify tokensUsed is null
    expect(prisma.usageLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tokensUsed: null,
        }),
      })
    );
  });

  it('should use transaction for atomic updates', async () => {
    // Mock streaming response
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"content":"Hello"}\n\n'));
        controller.close();
      },
    });

    vi.mocked(callOpenAI).mockResolvedValue(
      new Response(mockStream, {
        headers: { 'Content-Type': 'text/event-stream' },
      })
    );

    const request = new NextRequest('http://localhost:3000/api/proxy', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello AI' }),
    });

    const response = await POST(request);

    // Consume the stream
    const reader = response.body?.getReader();
    if (reader) {
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }
    }

    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify transaction was used
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('should not fail request if usage logging fails', async () => {
    // Mock streaming response
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"content":"Hello"}\n\n'));
        controller.close();
      },
    });

    vi.mocked(callOpenAI).mockResolvedValue(
      new Response(mockStream, {
        headers: { 'Content-Type': 'text/event-stream' },
      })
    );

    // Mock transaction failure
    vi.mocked(prisma.$transaction).mockRejectedValue(
      new Error('Database connection failed')
    );

    const request = new NextRequest('http://localhost:3000/api/proxy', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello AI' }),
    });

    const response = await POST(request);

    // Response should still be successful
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');

    // Consume the stream
    const reader = response.body?.getReader();
    if (reader) {
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }
    }

    // Wait for async operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify transaction was attempted
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});
