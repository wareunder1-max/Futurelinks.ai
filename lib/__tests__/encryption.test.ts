import { describe, it, expect, beforeEach } from 'vitest';
import { encryptAPIKey, decryptAPIKey } from '../encryption';

describe('Encryption Utilities', () => {
  // Set up a test encryption key
  beforeEach(() => {
    // 32-byte (64 hex chars) test key
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  });

  describe('encryptAPIKey', () => {
    it('should encrypt a plaintext API key', () => {
      const plaintext = 'sk-test1234567890abcdef';
      const encrypted = encryptAPIKey(plaintext);
      
      // Should return a string with three colon-separated parts
      expect(encrypted).toMatch(/^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/);
      
      // Should not contain the plaintext
      expect(encrypted).not.toContain(plaintext);
    });

    it('should generate different ciphertexts for the same plaintext', () => {
      const plaintext = 'sk-test1234567890abcdef';
      const encrypted1 = encryptAPIKey(plaintext);
      const encrypted2 = encryptAPIKey(plaintext);
      
      // Different IVs should produce different ciphertexts
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should throw error for empty string', () => {
      expect(() => encryptAPIKey('')).toThrow('Cannot encrypt empty string');
    });

    it('should throw error if ENCRYPTION_KEY is not set', () => {
      delete process.env.ENCRYPTION_KEY;
      expect(() => encryptAPIKey('test')).toThrow('ENCRYPTION_KEY environment variable is not set');
    });

    it('should throw error if ENCRYPTION_KEY is wrong length', () => {
      process.env.ENCRYPTION_KEY = 'tooshort';
      expect(() => encryptAPIKey('test')).toThrow('ENCRYPTION_KEY must be 32 bytes');
    });
  });

  describe('decryptAPIKey', () => {
    it('should decrypt an encrypted API key', () => {
      const plaintext = 'sk-test1234567890abcdef';
      const encrypted = encryptAPIKey(plaintext);
      const decrypted = decryptAPIKey(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should handle various API key formats', () => {
      const testKeys = [
        'sk-1234567890',
        'AIzaSyABC123DEF456',
        'sk-proj-abcdefghijklmnopqrstuvwxyz',
        'very-long-api-key-with-special-chars-!@#$%^&*()',
      ];

      testKeys.forEach(key => {
        const encrypted = encryptAPIKey(key);
        const decrypted = decryptAPIKey(encrypted);
        expect(decrypted).toBe(key);
      });
    });

    it('should throw error for empty string', () => {
      expect(() => decryptAPIKey('')).toThrow('Cannot decrypt empty string');
    });

    it('should throw error for invalid format', () => {
      expect(() => decryptAPIKey('invalid')).toThrow('Invalid ciphertext format');
      expect(() => decryptAPIKey('only:two')).toThrow('Invalid ciphertext format');
      expect(() => decryptAPIKey('too:many:parts:here')).toThrow('Invalid ciphertext format');
    });

    it('should throw error for tampered data', () => {
      const plaintext = 'sk-test1234567890abcdef';
      const encrypted = encryptAPIKey(plaintext);
      
      // Tamper with the encrypted data
      const parts = encrypted.split(':');
      parts[1] = parts[1].replace(/a/g, 'b'); // Change some characters
      const tampered = parts.join(':');
      
      expect(() => decryptAPIKey(tampered)).toThrow('Decryption failed');
    });

    it('should throw error for wrong authentication tag', () => {
      const plaintext = 'sk-test1234567890abcdef';
      const encrypted = encryptAPIKey(plaintext);
      
      // Tamper with the auth tag
      const parts = encrypted.split(':');
      parts[2] = parts[2].replace(/a/g, 'b');
      const tampered = parts.join(':');
      
      expect(() => decryptAPIKey(tampered)).toThrow('Decryption failed');
    });
  });

  describe('Round-trip encryption', () => {
    it('should successfully encrypt and decrypt multiple times', () => {
      const plaintext = 'sk-test1234567890abcdef';
      
      // Encrypt and decrypt multiple times
      for (let i = 0; i < 10; i++) {
        const encrypted = encryptAPIKey(plaintext);
        const decrypted = decryptAPIKey(encrypted);
        expect(decrypted).toBe(plaintext);
      }
    });

    it('should handle Unicode characters', () => {
      const plaintext = 'key-with-unicode-🔑-emoji';
      const encrypted = encryptAPIKey(plaintext);
      const decrypted = decryptAPIKey(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });

    it('should handle very long API keys', () => {
      const plaintext = 'sk-' + 'a'.repeat(1000);
      const encrypted = encryptAPIKey(plaintext);
      const decrypted = decryptAPIKey(encrypted);
      
      expect(decrypted).toBe(plaintext);
    });
  });
});
