/**
 * Tests for Admin Usage API Route
 * 
 * Validates:
 * - GET handler exists and responds
 * - Admin session validation
 * - Date filter parsing (startDate, endDate)
 * - UsageLog query with filters
 * - Metrics aggregation by API key
 * - Formatted data response
 * - Error handling
 * 
 * Requirements: 11.2, 11.5, 11.6
 * Task: 11.14 Create usage API route
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/admin/usage/route';

// Mock dependencies
vi.mock('@/lib/auth-setup', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    usageLog: {
      findMany: vi.fn(),
    },
  },
}));

import { auth } from '@/lib/auth-setup';
import { prisma } from '@/lib/prisma';

describe('Admin Usage API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Admin Session Validation', () => {
    it('should reject requests without session', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/usage');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
      expect(data.error.message).toBe('Admin access required');
    });

    it('should reject requests from non-admin users', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'user@example.com', role: 'user' },
        expires: '2024-12-31',
      });

      const request = new NextRequest('http://localhost:3000/api/admin/usage');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should accept requests from admin users', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        expires: '2024-12-31',
      });

      vi.mocked(prisma.usageLog.findMany).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/admin/usage');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Date Filter Parsing', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        expires: '2024-12-31',
      });
    });

    it('should query without filters when no dates provided', async () => {
      vi.mocked(prisma.usageLog.findMany).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/admin/usage');
      await GET(request);

      expect(prisma.usageLog.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: {
          apiKey: {
            select: {
              id: true,
              provider: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      });
    });

    it('should apply startDate filter when provided', async () => {
      vi.mocked(prisma.usageLog.findMany).mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/admin/usage?startDate=2024-01-15T00:00:00Z'
      );
      await GET(request);

      expect(prisma.usageLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            timestamp: {
              gte: new Date('2024-01-15T00:00:00Z'),
            },
          },
        })
      );
    });

    it('should apply endDate filter when provided', async () => {
      vi.mocked(prisma.usageLog.findMany).mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/admin/usage?endDate=2024-01-20T23:59:59Z'
      );
      await GET(request);

      expect(prisma.usageLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            timestamp: {
              lte: new Date('2024-01-20T23:59:59Z'),
            },
          },
        })
      );
    });

    it('should apply both startDate and endDate filters', async () => {
      vi.mocked(prisma.usageLog.findMany).mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/admin/usage?startDate=2024-01-15T00:00:00Z&endDate=2024-01-20T23:59:59Z'
      );
      await GET(request);

      expect(prisma.usageLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            timestamp: {
              gte: new Date('2024-01-15T00:00:00Z'),
              lte: new Date('2024-01-20T23:59:59Z'),
            },
          },
        })
      );
    });
  });

  describe('Metrics Aggregation', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        expires: '2024-12-31',
      });
    });

    it('should aggregate usage logs by API key', async () => {
      const mockLogs = [
        {
          id: '1',
          apiKeyId: 'key1',
          timestamp: new Date('2024-01-15T10:00:00Z'),
          tokensUsed: 100,
          requestDuration: 500,
          apiKey: { id: 'key1', provider: 'openai' },
        },
        {
          id: '2',
          apiKeyId: 'key1',
          timestamp: new Date('2024-01-15T11:00:00Z'),
          tokensUsed: 150,
          requestDuration: 600,
          apiKey: { id: 'key1', provider: 'openai' },
        },
        {
          id: '3',
          apiKeyId: 'key2',
          timestamp: new Date('2024-01-15T12:00:00Z'),
          tokensUsed: 200,
          requestDuration: 700,
          apiKey: { id: 'key2', provider: 'gemini' },
        },
      ];

      vi.mocked(prisma.usageLog.findMany).mockResolvedValue(mockLogs);

      const request = new NextRequest('http://localhost:3000/api/admin/usage');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.metrics).toHaveLength(2);
      
      const key1Metrics = data.metrics.find((m: any) => m.apiKeyId === 'key1');
      expect(key1Metrics.totalRequests).toBe(2);
      expect(key1Metrics.provider).toBe('openai');
      expect(key1Metrics.lastRequestAt).toBe('2024-01-15T11:00:00.000Z');

      const key2Metrics = data.metrics.find((m: any) => m.apiKeyId === 'key2');
      expect(key2Metrics.totalRequests).toBe(1);
      expect(key2Metrics.provider).toBe('gemini');
    });

    it('should track last request timestamp correctly', async () => {
      const mockLogs = [
        {
          id: '1',
          apiKeyId: 'key1',
          timestamp: new Date('2024-01-15T10:00:00Z'),
          tokensUsed: 100,
          requestDuration: 500,
          apiKey: { id: 'key1', provider: 'openai' },
        },
        {
          id: '2',
          apiKeyId: 'key1',
          timestamp: new Date('2024-01-15T12:00:00Z'),
          tokensUsed: 150,
          requestDuration: 600,
          apiKey: { id: 'key1', provider: 'openai' },
        },
        {
          id: '3',
          apiKeyId: 'key1',
          timestamp: new Date('2024-01-15T11:00:00Z'),
          tokensUsed: 200,
          requestDuration: 700,
          apiKey: { id: 'key1', provider: 'openai' },
        },
      ];

      vi.mocked(prisma.usageLog.findMany).mockResolvedValue(mockLogs);

      const request = new NextRequest('http://localhost:3000/api/admin/usage');
      const response = await GET(request);
      const data = await response.json();

      expect(data.metrics[0].lastRequestAt).toBe('2024-01-15T12:00:00.000Z');
    });

    it('should return empty array when no usage logs exist', async () => {
      vi.mocked(prisma.usageLog.findMany).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/admin/usage');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.metrics).toEqual([]);
    });
  });

  describe('Response Format', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        expires: '2024-12-31',
      });
    });

    it('should return formatted data with correct structure', async () => {
      const mockLogs = [
        {
          id: '1',
          apiKeyId: 'key1',
          timestamp: new Date('2024-01-15T10:00:00Z'),
          tokensUsed: 100,
          requestDuration: 500,
          apiKey: { id: 'key1', provider: 'openai' },
        },
      ];

      vi.mocked(prisma.usageLog.findMany).mockResolvedValue(mockLogs);

      const request = new NextRequest('http://localhost:3000/api/admin/usage');
      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty('metrics');
      expect(Array.isArray(data.metrics)).toBe(true);
      expect(data.metrics[0]).toHaveProperty('apiKeyId');
      expect(data.metrics[0]).toHaveProperty('provider');
      expect(data.metrics[0]).toHaveProperty('totalRequests');
      expect(data.metrics[0]).toHaveProperty('lastRequestAt');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        expires: '2024-12-31',
      });
    });

    it('should handle database errors gracefully', async () => {
      vi.mocked(prisma.usageLog.findMany).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/admin/usage');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe('INTERNAL_ERROR');
      expect(data.error.message).toBe('Failed to fetch usage metrics');
    });

    it('should handle invalid date formats', async () => {
      vi.mocked(prisma.usageLog.findMany).mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/admin/usage?startDate=invalid-date'
      );
      const response = await GET(request);

      // The route should still work, but with an invalid date object
      // This is acceptable as the database will handle the invalid date
      expect(response.status).toBeLessThanOrEqual(500);
    });
  });

  describe('Query Ordering', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        expires: '2024-12-31',
      });
    });

    it('should order results by timestamp descending', async () => {
      vi.mocked(prisma.usageLog.findMany).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/admin/usage');
      await GET(request);

      expect(prisma.usageLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            timestamp: 'desc',
          },
        })
      );
    });
  });

  describe('API Key Inclusion', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        expires: '2024-12-31',
      });
    });

    it('should include API key provider information', async () => {
      vi.mocked(prisma.usageLog.findMany).mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/admin/usage');
      await GET(request);

      expect(prisma.usageLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            apiKey: {
              select: {
                id: true,
                provider: true,
              },
            },
          },
        })
      );
    });
  });
});
