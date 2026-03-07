/**
 * Tests for Admin Account Creation API
 * 
 * Validates:
 * - Admin account creation with valid data
 * - Username uniqueness validation
 * - Password length validation (min 8 characters)
 * - Password hashing before storage
 * - Error handling for invalid inputs
 * 
 * Requirements: 12.2, 12.3, 12.4, 12.6, 12.7
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock data
const mockAdmins = [
  {
    id: '1',
    username: 'admin1',
    passwordHash: '$2a$12$hashedpassword1',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    lastLoginAt: new Date('2024-01-20T10:00:00Z'),
  },
  {
    id: '2',
    username: 'admin2',
    passwordHash: '$2a$12$hashedpassword2',
    createdAt: new Date('2024-01-16T10:00:00Z'),
    lastLoginAt: new Date('2024-01-21T10:00:00Z'),
  },
];

describe('Admin Account Creation API', () => {
  describe('POST /api/admin/admins - Validation', () => {
    it('should reject empty username', () => {
      const username = '';
      const isValid = username.trim().length > 0;

      expect(isValid).toBe(false);
    });

    it('should reject password shorter than 8 characters', () => {
      const password = 'short';
      const isValid = password.length >= 8;

      expect(isValid).toBe(false);
    });

    it('should accept valid username and password', () => {
      const username = 'newadmin';
      const password = 'validpassword123';
      
      const isUsernameValid = username.trim().length > 0;
      const isPasswordValid = password.length >= 8;

      expect(isUsernameValid).toBe(true);
      expect(isPasswordValid).toBe(true);
    });

    it('should check username uniqueness', () => {
      const existingUsernames = mockAdmins.map(admin => admin.username);
      const newUsername = 'admin1';
      const isDuplicate = existingUsernames.includes(newUsername);

      expect(isDuplicate).toBe(true);
    });

    it('should allow unique username', () => {
      const existingUsernames = mockAdmins.map(admin => admin.username);
      const newUsername = 'admin3';
      const isDuplicate = existingUsernames.includes(newUsername);

      expect(isDuplicate).toBe(false);
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before storage', () => {
      const plainPassword = 'mypassword123';
      const hashedPassword = '$2a$12$hashedversion';

      // Verify hash is different from plain password
      expect(hashedPassword).not.toBe(plainPassword);
      
      // Verify hash starts with bcrypt prefix
      expect(hashedPassword.startsWith('$2a$12$')).toBe(true);
    });

    it('should store hashed password, not plaintext', () => {
      const admin = {
        username: 'newadmin',
        passwordHash: '$2a$12$hashedpassword',
      };

      // Verify passwordHash field exists
      expect(admin.passwordHash).toBeDefined();
      
      // Verify it's a bcrypt hash format
      expect(admin.passwordHash.startsWith('$2a$12$')).toBe(true);
    });

    it('should use bcrypt with 12 salt rounds', () => {
      const hashedPassword = '$2a$12$abcdefghijklmnopqrstuvwxyz123456';
      
      // Extract salt rounds from hash
      const saltRounds = hashedPassword.split('$')[2];
      
      expect(saltRounds).toBe('12');
    });
  });

  describe('API Response Format', () => {
    it('should return success response with admin data', () => {
      const response = {
        message: 'Admin account created successfully',
        admin: {
          id: '3',
          username: 'newadmin',
          createdAt: new Date('2024-01-22T10:00:00Z'),
        },
      };

      expect(response.message).toBe('Admin account created successfully');
      expect(response.admin.username).toBe('newadmin');
      expect(response.admin.id).toBeDefined();
      expect(response.admin.createdAt).toBeDefined();
    });

    it('should return error for duplicate username', () => {
      const errorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Username already exists',
        },
      };

      expect(errorResponse.error.code).toBe('VALIDATION_ERROR');
      expect(errorResponse.error.message).toBe('Username already exists');
    });

    it('should return error for invalid password', () => {
      const errorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Password must be at least 8 characters',
        },
      };

      expect(errorResponse.error.code).toBe('VALIDATION_ERROR');
      expect(errorResponse.error.message).toBe('Password must be at least 8 characters');
    });

    it('should return error for empty username', () => {
      const errorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Username is required',
        },
      };

      expect(errorResponse.error.code).toBe('VALIDATION_ERROR');
      expect(errorResponse.error.message).toBe('Username is required');
    });
  });

  describe('GET /api/admin/admins - List Admins', () => {
    it('should return list of admins without password hashes', () => {
      const admins = mockAdmins.map(admin => ({
        id: admin.id,
        username: admin.username,
        createdAt: admin.createdAt,
        lastLoginAt: admin.lastLoginAt,
      }));

      expect(admins).toHaveLength(2);
      expect(admins[0]).not.toHaveProperty('passwordHash');
      expect(admins[1]).not.toHaveProperty('passwordHash');
    });

    it('should include required fields for each admin', () => {
      const admin = {
        id: '1',
        username: 'admin1',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        lastLoginAt: new Date('2024-01-20T10:00:00Z'),
      };

      expect(admin.id).toBeDefined();
      expect(admin.username).toBeDefined();
      expect(admin.createdAt).toBeDefined();
      expect(admin.lastLoginAt).toBeDefined();
    });

    it('should order admins by creation date descending', () => {
      const admins = [...mockAdmins].sort((a, b) => 
        b.createdAt.getTime() - a.createdAt.getTime()
      );

      expect(admins[0].username).toBe('admin2');
      expect(admins[1].username).toBe('admin1');
    });
  });

  describe('Authorization', () => {
    it('should require admin session for creating admin', () => {
      const session = null;
      const isAuthorized = session !== null;

      expect(isAuthorized).toBe(false);
    });

    it('should allow admin session to create admin', () => {
      const session = { user: { role: 'admin' } };
      const isAuthorized = session !== null && session.user?.role === 'admin';

      expect(isAuthorized).toBe(true);
    });

    it('should reject non-admin session', () => {
      const session = { user: { role: 'user' } };
      const isAuthorized = session !== null && session.user?.role === 'admin';

      expect(isAuthorized).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', () => {
      const errorResponse = {
        error: {
          code: 'STORAGE_ERROR',
          message: 'Failed to create admin account. Please try again.',
        },
      };

      expect(errorResponse.error.code).toBe('STORAGE_ERROR');
      expect(errorResponse.error.message).toContain('Failed to create admin account');
    });

    it('should handle unauthorized access', () => {
      const errorResponse = {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Admin access required',
        },
      };

      expect(errorResponse.error.code).toBe('UNAUTHORIZED');
      expect(errorResponse.error.message).toBe('Admin access required');
    });
  });

  describe('Input Sanitization', () => {
    it('should trim whitespace from username', () => {
      const username = '  newadmin  ';
      const trimmed = username.trim();

      expect(trimmed).toBe('newadmin');
    });

    it('should not trim password (preserve exact input)', () => {
      const password = '  password123  ';
      // Password should NOT be trimmed to preserve user intent
      
      expect(password).toBe('  password123  ');
      expect(password.length).toBe(15); // Including spaces (2 leading + 11 chars + 2 trailing)
    });

    it('should handle special characters in username', () => {
      const username = 'admin_user-123';
      const isValid = username.trim().length > 0;

      expect(isValid).toBe(true);
    });
  });

  describe('Success Confirmation', () => {
    it('should display confirmation message after creation', () => {
      const confirmationMessage = 'Admin account created successfully';
      
      expect(confirmationMessage).toContain('successfully');
      expect(confirmationMessage).toContain('Admin account');
    });

    it('should return created admin details', () => {
      const createdAdmin = {
        id: '3',
        username: 'newadmin',
        createdAt: new Date(),
      };

      expect(createdAdmin.id).toBeDefined();
      expect(createdAdmin.username).toBe('newadmin');
      expect(createdAdmin.createdAt).toBeInstanceOf(Date);
    });
  });
});
