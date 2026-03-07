import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../auth';

describe('Password Hashing Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a valid password', async () => {
      const password = 'mySecurePassword123';
      const hash = await hashPassword(password);

      // Bcrypt hashes start with $2a$ or $2b$ followed by the cost factor
      expect(hash).toMatch(/^\$2[ab]\$12\$/);
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'samePassword';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      // Due to random salt, hashes should be different
      expect(hash1).not.toBe(hash2);
    });

    it('should throw error for empty password', async () => {
      await expect(hashPassword('')).rejects.toThrow('Password cannot be empty');
    });

    it('should throw error for whitespace-only password', async () => {
      await expect(hashPassword('   ')).rejects.toThrow('Password cannot be empty');
    });

    it('should hash passwords with special characters', async () => {
      const password = 'P@ssw0rd!#$%^&*()';
      const hash = await hashPassword(password);

      expect(hash).toMatch(/^\$2[ab]\$12\$/);
    });

    it('should hash long passwords', async () => {
      const password = 'a'.repeat(100);
      const hash = await hashPassword(password);

      expect(hash).toMatch(/^\$2[ab]\$12\$/);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'correctPassword123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'correctPassword123';
      const wrongPassword = 'wrongPassword456';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('should reject password with different case', async () => {
      const password = 'Password123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('password123', hash);

      expect(isValid).toBe(false);
    });

    it('should throw error for empty password', async () => {
      const hash = await hashPassword('validPassword');
      await expect(verifyPassword('', hash)).rejects.toThrow('Password cannot be empty');
    });

    it('should throw error for empty hash', async () => {
      await expect(verifyPassword('validPassword', '')).rejects.toThrow('Hash cannot be empty');
    });

    it('should throw error for whitespace-only password', async () => {
      const hash = await hashPassword('validPassword');
      await expect(verifyPassword('   ', hash)).rejects.toThrow('Password cannot be empty');
    });

    it('should throw error for whitespace-only hash', async () => {
      await expect(verifyPassword('validPassword', '   ')).rejects.toThrow('Hash cannot be empty');
    });

    it('should verify password with special characters', async () => {
      const password = 'P@ssw0rd!#$%^&*()';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should handle long passwords correctly', async () => {
      const password = 'a'.repeat(100);
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });
  });

  describe('Integration tests', () => {
    it('should handle complete hash and verify workflow', async () => {
      const password = 'adminPassword123!';
      
      // Hash the password
      const hash = await hashPassword(password);
      
      // Verify correct password
      expect(await verifyPassword(password, hash)).toBe(true);
      
      // Verify incorrect password
      expect(await verifyPassword('wrongPassword', hash)).toBe(false);
    });

    it('should work with minimum length password (8 chars)', async () => {
      const password = 'Pass123!';
      const hash = await hashPassword(password);
      
      expect(await verifyPassword(password, hash)).toBe(true);
    });
  });
});
