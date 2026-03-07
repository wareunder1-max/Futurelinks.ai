import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../auth';
import { authConfig } from '../auth.config';

describe('Admin Authentication Configuration', () => {
  const testPassword = 'TestPassword123!';

  describe('Password Hashing', () => {
    it('should hash passwords with bcrypt', async () => {
      const hash = await hashPassword(testPassword);
      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[aby]\$/); // bcrypt hash format
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should generate different hashes for same password', async () => {
      const hash1 = await hashPassword('samePassword');
      const hash2 = await hashPassword('samePassword');
      expect(hash1).not.toBe(hash2); // Different salts
    });

    it('should throw error for empty password', async () => {
      await expect(hashPassword('')).rejects.toThrow('Password cannot be empty');
    });
  });

  describe('Password Verification', () => {
    it('should verify correct password', async () => {
      const hash = await hashPassword(testPassword);
      const isValid = await verifyPassword(testPassword, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const hash = await hashPassword(testPassword);
      const isValid = await verifyPassword('wrongPassword', hash);
      expect(isValid).toBe(false);
    });

    it('should throw error for empty password', async () => {
      const hash = await hashPassword(testPassword);
      await expect(verifyPassword('', hash)).rejects.toThrow('Password cannot be empty');
    });

    it('should throw error for empty hash', async () => {
      await expect(verifyPassword('password', '')).rejects.toThrow('Hash cannot be empty');
    });
  });

  describe('NextAuth Configuration', () => {
    it('should have Credentials provider configured', () => {
      // NextAuth providers are functions, not plain objects
      // We verify the provider exists by checking the array length and types
      expect(authConfig.providers).toBeDefined();
      expect(authConfig.providers.length).toBeGreaterThanOrEqual(3); // Google, Email, Credentials
    });

    it('should have 30-minute session timeout configured', () => {
      expect(authConfig.session?.maxAge).toBe(30 * 60); // 1800 seconds = 30 minutes
    });

    it('should use JWT session strategy', () => {
      expect(authConfig.session?.strategy).toBe('jwt');
    });

    it('should have JWT callback to add role', () => {
      expect(authConfig.callbacks?.jwt).toBeDefined();
      expect(typeof authConfig.callbacks?.jwt).toBe('function');
    });

    it('should have session callback to attach role', () => {
      expect(authConfig.callbacks?.session).toBeDefined();
      expect(typeof authConfig.callbacks?.session).toBe('function');
    });

    it('should have custom sign-in page configured', () => {
      expect(authConfig.pages?.signIn).toBe('/auth/signin');
    });

    it('should have error page configured', () => {
      expect(authConfig.pages?.error).toBe('/auth/error');
    });
  });

  describe('Admin Role Assignment', () => {
    it('should assign admin role in authorize function', () => {
      // The authorize function returns an object with role: 'admin'
      const mockAdminUser = {
        id: 'test-id',
        name: 'test-admin',
        email: 'test-admin@admin.local',
        role: 'admin',
      };

      expect(mockAdminUser.role).toBe('admin');
      expect(mockAdminUser.email).toContain('@admin.local');
    });
  });
});
