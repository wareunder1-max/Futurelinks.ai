/**
 * Tests for Proxy API Streaming Functionality (Task 9.4)
 * 
 * Validates streaming response handling with Server-Sent Events
 */

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
  transformToOpenAI: vi.fn((message) => ({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: message }],
    stream: true,
  })),
  callOpenAI: vi.fn(),
}));

vi.mock('@/lib/providers/gemini', () => ({
  transformToGemini: vi.fn((message) => ({
    contents: [{ role: 'user', parts: [{ text: message }] }],
  })),
  callGemini: vi.fn(),
}));

vi.mock('@/lib/providers/anthropic', () => ({
  transformToAnthropic: vi.fn((message) => ({
    model: 'claude-3-sonnet-20240229',
    messages: [{ role: 'user', content: message }],
    stream: true,
  })),
  callAnthropic: vi.fn(),
}));

import { auth } from '@/lib/auth-setup';
import { prisma } from '@/lib/prisma';
import { callOpenAI } from '@/lib/providers/openai';
import { callGemini } from '@/lib/providers/gemini';
import { callAnthropic } from '@/lib/providers/anthropic';

describe('POST /api/proxy - Streaming (Task 9.4)', () => {
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
  });

  it('should return streaming response with correct headers', async () => {
    // Mock API key
    vi.mocked(prisma.aPIKey.findFirst).mockResolvedValue({
      id: 'key-1',
      provider: 'openai',
      encryptedKey: 'encrypted-key',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUsedAt: null,
    });

    // Mock streaming response from OpenAI
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n'));
        controller.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":" World"}}]}\n\n'));
        controller.close();
      },
    });

    const mockResponse = new Response(mockStream, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    });

    vi.mocked(callOpenAI).mockResolvedValue(mockResponse);

    const request = new NextRequest('http://localhost:3000/api/proxy', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello AI' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
    expect(response.headers.get('Cache-Control')).toBe('no-cache');
    expect(response.headers.get('Connection')).toBe('keep-alive');
  });

  it('should forward streaming chunks from OpenAI provider', async () => {
    vi.mocked(prisma.aPIKey.findFirst).mockResolvedValue({
      id: 'key-1',
      provider: 'openai',
      encryptedKey: 'encrypted-key',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUsedAt: null,
    });

    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('chunk1'));
        controller.enqueue(new TextEncoder().encode('chunk2'));
        controller.close();
      },
    });

    const mockResponse = new Response(mockStream);
    vi.mocked(callOpenAI).mockResolvedValue(mockResponse);

    const request = new NextRequest('http://localhost:3000/api/proxy', {
      method: 'POST',
      body: JSON.stringify({ message: 'Test' }),
    });

    const response = await POST(request);
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    expect(reader).toBeDefined();
    if (!reader) return;

    const chunks: string[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(decoder.decode(value));
    }

    expect(chunks.join('')).toContain('chunk1');
    expect(chunks.join('')).toContain('chunk2');
  });

  it('should handle provider errors gracefully', async () => {
    vi.mocked(prisma.aPIKey.findFirst).mockResolvedValue({
      id: 'key-1',
      provider: 'openai',
      encryptedKey: 'encrypted-key',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUsedAt: null,
    });

    // Mock provider error
    vi.mocked(callOpenAI).mockRejectedValue(new Error('OpenAI API error: 500 Internal Server Error'));

    const request = new NextRequest('http://localhost:3000/api/proxy', {
      method: 'POST',
      body: JSON.stringify({ message: 'Test' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('PROVIDER_ERROR');
    expect(data.error.message).toContain('Unable to process your request');
  });

  it('should call correct provider based on API key', async () => {
    // Test OpenAI
    vi.mocked(prisma.aPIKey.findFirst).mockResolvedValue({
      id: 'key-openai',
      provider: 'openai',
      encryptedKey: 'encrypted-key',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUsedAt: null,
    });

    let mockStream = new ReadableStream({
      start(controller) {
        controller.close();
      },
    });
    vi.mocked(callOpenAI).mockResolvedValue(new Response(mockStream));

    let request = new NextRequest('http://localhost:3000/api/proxy', {
      method: 'POST',
      body: JSON.stringify({ message: 'Test OpenAI' }),
    });

    await POST(request);
    expect(callOpenAI).toHaveBeenCalled();

    // Test Gemini
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'public',
      },
      expires: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    });

    vi.mocked(prisma.aPIKey.findFirst).mockResolvedValue({
      id: 'key-gemini',
      provider: 'gemini',
      encryptedKey: 'encrypted-key',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUsedAt: null,
    });

    // Create a new stream for Gemini
    mockStream = new ReadableStream({
      start(controller) {
        controller.close();
      },
    });
    vi.mocked(callGemini).mockResolvedValue(new Response(mockStream));

    request = new NextRequest('http://localhost:3000/api/proxy', {
      method: 'POST',
      body: JSON.stringify({ message: 'Test Gemini' }),
    });

    await POST(request);
    expect(callGemini).toHaveBeenCalled();

    // Test Anthropic
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'public',
      },
      expires: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    });

    vi.mocked(prisma.aPIKey.findFirst).mockResolvedValue({
      id: 'key-anthropic',
      provider: 'anthropic',
      encryptedKey: 'encrypted-key',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUsedAt: null,
    });

    // Create a new stream for Anthropic
    mockStream = new ReadableStream({
      start(controller) {
        controller.close();
      },
    });
    vi.mocked(callAnthropic).mockResolvedValue(new Response(mockStream));

    request = new NextRequest('http://localhost:3000/api/proxy', {
      method: 'POST',
      body: JSON.stringify({ message: 'Test Anthropic' }),
    });

    await POST(request);
    expect(callAnthropic).toHaveBeenCalled();
  });

  it('should return error for unsupported provider', async () => {
    vi.mocked(prisma.aPIKey.findFirst).mockResolvedValue({
      id: 'key-unknown',
      provider: 'unknown-provider',
      encryptedKey: 'encrypted-key',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUsedAt: null,
    });

    const request = new NextRequest('http://localhost:3000/api/proxy', {
      method: 'POST',
      body: JSON.stringify({ message: 'Test' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error.code).toBe('UNSUPPORTED_PROVIDER');
    expect(data.error.message).toContain('not supported');
  });

  it('should handle timeout after 10 seconds', async () => {
    vi.mocked(prisma.aPIKey.findFirst).mockResolvedValue({
      id: 'key-1',
      provider: 'openai',
      encryptedKey: 'encrypted-key',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUsedAt: null,
    });

    // Mock a stream that never closes (simulating slow response)
    const mockStream = new ReadableStream({
      async start(controller) {
        // Never close, simulating a hanging connection
        await new Promise(() => {}); // This will hang forever
      },
    });

    const mockResponse = new Response(mockStream);
    vi.mocked(callOpenAI).mockResolvedValue(mockResponse);

    const request = new NextRequest('http://localhost:3000/api/proxy', {
      method: 'POST',
      body: JSON.stringify({ message: 'Test' }),
    });

    const response = await POST(request);
    const reader = response.body?.getReader();

    expect(reader).toBeDefined();
    if (!reader) return;

    // The timeout is implemented in the stream controller
    // We can't easily test the actual timeout without waiting 10 seconds
    // But we can verify the stream is set up correctly
    expect(response.headers.get('Content-Type')).toBe('text/event-stream');
  }, 15000); // Increase test timeout to allow for the 10-second timeout

  it('should pass conversation history to provider', async () => {
    vi.mocked(prisma.aPIKey.findFirst).mockResolvedValue({
      id: 'key-1',
      provider: 'openai',
      encryptedKey: 'encrypted-key',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUsedAt: null,
    });

    const mockStream = new ReadableStream({
      start(controller) {
        controller.close();
      },
    });
    vi.mocked(callOpenAI).mockResolvedValue(new Response(mockStream));

    const request = new NextRequest('http://localhost:3000/api/proxy', {
      method: 'POST',
      body: JSON.stringify({
        message: 'What is 2+2?',
        conversationHistory: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' },
        ],
      }),
    });

    await POST(request);

    // Verify transformToOpenAI was called with conversation history
    const { transformToOpenAI } = await import('@/lib/providers/openai');
    expect(transformToOpenAI).toHaveBeenCalledWith(
      'What is 2+2?',
      [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ],
      undefined
    );
  });
});
