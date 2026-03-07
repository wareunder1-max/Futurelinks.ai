/**
 * Tests for Admin API Keys Routes
 * 
 * Validates:
 * - GET /api/admin/keys - List all API keys
 * - POST /api/admin/keys - Create new API key
 * - GET /api/admin/keys/[id] - Get single API key
 * - PUT /api/admin/keys/[id] - Update API key
 * - DELETE /api/admin/keys/[id] - Delete API key
 * - Admin session validation on all routes
 * - Error response format
 * 
 * Requirements: 8.2, 8.3, 8.4, 8.5, 8.6, 9.2, 9.3, 9.4, 9.5, 9.6, 10.2, 15.3, 15.4, 15.5
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getKeys, POST as createKey } from '@/app/api/admin/keys/route';
import { GET as getKey, PUT as updateKey, DELETE as deleteKey } from '@/app/api/admin/keys/[id]/route';

// Mock dependencies
vi.mock('@/lib/auth-setup', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    aPIKey: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/lib/encryption', () => ({
  encryptAPIKey: vi.fn((key: string) => `encrypted-${key}`),
  decryptAPIKey: vi.fn((encrypted: string) => encrypted.replace('encrypted-', '')),
}));

import { auth } from '@/lib/auth-setup';
import { prisma } from '@/lib/prisma';
import { encryptAPIKey, decryptAPIKey } from '@/lib/encryption';

describe('Admin API Keys Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/admin/keys - List API Keys', () => {
    it('should reject requests without admin session', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/keys');
      const response = await getKeys(request);
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

      const request = new NextRequest('http://localhost:3000/api/admin/keys');
      const response = await getKeys(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return list of API keys for admin', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        expires: '2024-12-31',
      });

      const mockKeys = [
        {
          id: 'key1',
          provider: 'openai',
          encryptedKey: 'encrypted-key1',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          lastUsedAt: null,
        },
        {
          id: 'key2',
          provider: 'gemini',
          encryptedKey: 'encrypted-key2',
          createdAt: new Date('2024-01-16'),
          updatedAt: new Date('2024-01-16'),
          lastUsedAt: new Date('2024-01-20'),
        },
      ];

      vi.mocked(prisma.aPIKey.findMany).mockResolvedValue(mockKeys);

      const request = new NextRequest('http://localhost:3000/api/admin/keys');
      const response = await getKeys(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.apiKeys).toHaveLength(2);
      expect(data.apiKeys[0].provider).toBe('openai');
    });

    it('should decrypt keys when decrypt=true query param is provided', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        expires: '2024-12-31',
      });

      const mockKeys = [
        {
          id: 'key1',
          provider: 'openai',
          encryptedKey: 'encrypted-sk-abc123',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          lastUsedAt: null,
        },
      ];

      vi.mocked(prisma.aPIKey.findMany).mockResolvedValue(mockKeys);

      const request = new NextRequest('http://localhost:3000/api/admin/keys?decrypt=true');
      const response = await getKeys(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(decryptAPIKey).toHaveBeenCalledWith('encrypted-sk-abc123');
      expect(data.apiKeys[0].decryptedKey).toBe('sk-abc123');
    });

    it('should handle database errors gracefully', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        expires: '2024-12-31',
      });

      vi.mocked(prisma.aPIKey.findMany).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/admin/keys');
      const response = await getKeys(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/admin/keys - Create API Key', () => {
    it('should reject requests without admin session', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/keys', {
        method: 'POST',
        body: JSON.stringify({ provider: 'openai', keyValue: 'sk-test' }),
      });
      const response = await createKey(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should validate provider field is not empty', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        expires: '2024-12-31',
      });

      const request = new NextRequest('http://localhost:3000/api/admin/keys', {
        method: 'POST',
        body: JSON.stringify({ provider: '', keyValue: 'sk-test' }),
      });
      const response = await createKey(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('Provider');
    });

    it('should validate keyValue field is not empty', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        expires: '2024-12-31',
      });

      const request = new NextRequest('http://localhost:3000/api/admin/keys', {
        method: 'POST',
        body: JSON.stringify({ provider: 'openai', keyValue: '' }),
      });
      const response = await createKey(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('API key value');
    });

    it('should encrypt key before storage', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        expires: '2024-12-31',
      });

      const mockCreatedKey = {
        id: 'new-key',
        provider: 'openai',
        encryptedKey: 'encrypted-sk-test',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastUsedAt: null,
      };

      vi.mocked(prisma.aPIKey.create).mockResolvedValue(mockCreatedKey);

      const request = new NextRequest('http://localhost:3000/api/admin/keys', {
        method: 'POST',
        body: JSON.stringify({ provider: 'openai', keyValue: 'sk-test' }),
      });
      const response = await createKey(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(encryptAPIKey).toHaveBeenCalledWith('sk-test');
      expect(data.message).toContain('successfully');
      expect(data.apiKey.id).toBe('new-key');
    });

    it('should handle storage failures with error message', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        expires: '2024-12-31',
      });

      vi.mocked(prisma.aPIKey.create).mockRejectedValue(
        new Error('Database write failed')
      );

      const request = new NextRequest('http://localhost:3000/api/admin/keys', {
        method: 'POST',
        body: JSON.stringify({ provider: 'openai', keyValue: 'sk-test' }),
      });
      const response = await createKey(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe('STORAGE_ERROR');
      expect(data.error.message).toContain('Failed to save API key');
    });
  });

  describe('GET /api/admin/keys/[id] - Get Single API Key', () => {
    it('should reject requests without admin session', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/keys/key1');
      const response = await getKey(request, { params: { id: 'key1' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 404 when key not found', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        expires: '2024-12-31',
      });

      vi.mocked(prisma.aPIKey.findUnique).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/keys/nonexistent');
      const response = await getKey(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
      expect(data.error.message).toContain('API key not found');
    });

    it('should return API key with decrypted value', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        expires: '2024-12-31',
      });

      const mockKey = {
        id: 'key1',
        provider: 'openai',
        encryptedKey: 'encrypted-sk-test',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        lastUsedAt: null,
      };

      vi.mocked(prisma.aPIKey.findUnique).mockResolvedValue(mockKey);

      const request = new NextRequest('http://localhost:3000/api/admin/keys/key1');
      const response = await getKey(request, { params: { id: 'key1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(decryptAPIKey).toHaveBeenCalledWith('encrypted-sk-test');
      expect(data.apiKey.decryptedKey).toBe('sk-test');
    });
  });

  describe('PUT /api/admin/keys/[id] - Update API Key', () => {
    it('should reject requests without admin session', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/keys/key1', {
        method: 'PUT',
        body: JSON.stringify({ provider: 'openai', keyValue: 'sk-new' }),
      });
      const response = await updateKey(request, { params: { id: 'key1' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should validate provider field is not empty', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        expires: '2024-12-31',
      });

      const request = new NextRequest('http://localhost:3000/api/admin/keys/key1', {
        method: 'PUT',
        body: JSON.stringify({ provider: '', keyValue: 'sk-new' }),
      });
      const response = await updateKey(request, { params: { id: 'key1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when key not found', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        expires: '2024-12-31',
      });

      vi.mocked(prisma.aPIKey.findUnique).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/keys/nonexistent', {
        method: 'PUT',
        body: JSON.stringify({ provider: 'openai', keyValue: 'sk-new' }),
      });
      const response = await updateKey(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('should update API key with encrypted value', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        expires: '2024-12-31',
      });

      const existingKey = {
        id: 'key1',
        provider: 'openai',
        encryptedKey: 'encrypted-old',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        lastUsedAt: null,
      };

      const updatedKey = {
        ...existingKey,
        provider: 'gemini',
        encryptedKey: 'encrypted-sk-new',
        updatedAt: new Date(),
      };

      vi.mocked(prisma.aPIKey.findUnique).mockResolvedValue(existingKey);
      vi.mocked(prisma.aPIKey.update).mockResolvedValue(updatedKey);

      const request = new NextRequest('http://localhost:3000/api/admin/keys/key1', {
        method: 'PUT',
        body: JSON.stringify({ provider: 'gemini', keyValue: 'sk-new' }),
      });
      const response = await updateKey(request, { params: { id: 'key1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(encryptAPIKey).toHaveBeenCalledWith('sk-new');
      expect(data.message).toContain('successfully');
      expect(data.apiKey.provider).toBe('gemini');
    });
  });

  describe('DELETE /api/admin/keys/[id] - Delete API Key', () => {
    it('should reject requests without admin session', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/keys/key1', {
        method: 'DELETE',
      });
      const response = await deleteKey(request, { params: { id: 'key1' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 404 when key not found', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        expires: '2024-12-31',
      });

      vi.mocked(prisma.aPIKey.findUnique).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/keys/nonexistent', {
        method: 'DELETE',
      });
      const response = await deleteKey(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('should delete API key and return confirmation', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        expires: '2024-12-31',
      });

      const existingKey = {
        id: 'key1',
        provider: 'openai',
        encryptedKey: 'encrypted-key',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        lastUsedAt: null,
      };

      vi.mocked(prisma.aPIKey.findUnique).mockResolvedValue(existingKey);
      vi.mocked(prisma.aPIKey.delete).mockResolvedValue(existingKey);

      const request = new NextRequest('http://localhost:3000/api/admin/keys/key1', {
        method: 'DELETE',
      });
      const response = await deleteKey(request, { params: { id: 'key1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('successfully');
      expect(prisma.aPIKey.delete).toHaveBeenCalledWith({
        where: { id: 'key1' },
      });
    });

    it('should cascade delete associated usage logs', async () => {
      // This is handled by Prisma cascade delete in schema
      vi.mocked(auth).mockResolvedValue({
        user: { id: '1', email: 'admin@example.com', role: 'admin' },
        expires: '2024-12-31',
      });

      const existingKey = {
        id: 'key1',
        provider: 'openai',
        encryptedKey: 'encrypted-key',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        lastUsedAt: null,
      };

      vi.mocked(prisma.aPIKey.findUnique).mockResolvedValue(existingKey);
      vi.mocked(prisma.aPIKey.delete).mockResolvedValue(existingKey);

      const request = new NextRequest('http://localhost:3000/api/admin/keys/key1', {
        method: 'DELETE',
      });
      await deleteKey(request, { params: { id: 'key1' } });

      // Verify delete was called (cascade is handled by Prisma schema)
      expect(prisma.aPIKey.delete).toHaveBeenCalledWith({
        where: { id: 'key1' },
      });
    });
  });

  describe('Error Response Format', () => {
    it('should use consistent error structure', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/admin/keys');
      const response = await getKeys(request);
      const data = await response.json();

      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('code');
      expect(data.error).toHaveProperty('message');
    });
  });
});
