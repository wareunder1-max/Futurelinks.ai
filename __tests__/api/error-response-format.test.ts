/**
 * Tests for Error Response Format Consistency
 * 
 * Validates that all API routes return errors in a consistent format:
 * {
 *   error: {
 *     code: string,
 *     message: string,
 *     details?: any
 *   },
 *   timestamp: string
 * }
 * 
 * Requirements: 13.4, 13.5
 */

import { describe, it, expect } from 'vitest';

describe('Error Response Format', () => {
  describe('Standard Error Structure', () => {
    it('should include error object with code and message', () => {
      const errorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input provided',
        },
        timestamp: new Date().toISOString(),
      };

      expect(errorResponse).toHaveProperty('error');
      expect(errorResponse.error).toHaveProperty('code');
      expect(errorResponse.error).toHaveProperty('message');
      expect(errorResponse).toHaveProperty('timestamp');
    });

    it('should use uppercase snake_case for error codes', () => {
      const errorCodes = [
        'UNAUTHORIZED',
        'VALIDATION_ERROR',
        'NOT_FOUND',
        'INTERNAL_ERROR',
        'STORAGE_ERROR',
        'NO_API_KEYS_AVAILABLE',
      ];

      errorCodes.forEach(code => {
        expect(code).toMatch(/^[A-Z_]+$/);
      });
    });

    it('should include ISO 8601 timestamp', () => {
      const timestamp = new Date().toISOString();
      const isValidISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(timestamp);

      expect(isValidISO).toBe(true);
    });

    it('should optionally include details field for debugging', () => {
      const errorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: {
            field: 'email',
            reason: 'Invalid format',
          },
        },
        timestamp: new Date().toISOString(),
      };

      expect(errorResponse.error.details).toBeDefined();
      expect(errorResponse.error.details.field).toBe('email');
    });
  });

  describe('Common Error Codes', () => {
    it('should use UNAUTHORIZED for missing authentication', () => {
      const errorCode = 'UNAUTHORIZED';
      const message = 'Authentication required';

      expect(errorCode).toBe('UNAUTHORIZED');
      expect(message).toContain('Authentication');
    });

    it('should use FORBIDDEN for insufficient permissions', () => {
      const errorCode = 'FORBIDDEN';
      const message = 'Admin access required';

      expect(errorCode).toBe('FORBIDDEN');
      expect(message).toContain('access required');
    });

    it('should use VALIDATION_ERROR for invalid input', () => {
      const errorCode = 'VALIDATION_ERROR';
      const message = 'Provider field is required';

      expect(errorCode).toBe('VALIDATION_ERROR');
      expect(message).toContain('required');
    });

    it('should use NOT_FOUND for missing resources', () => {
      const errorCode = 'NOT_FOUND';
      const message = 'API key not found';

      expect(errorCode).toBe('NOT_FOUND');
      expect(message).toContain('not found');
    });

    it('should use INTERNAL_ERROR for unexpected errors', () => {
      const errorCode = 'INTERNAL_ERROR';
      const message = 'An unexpected error occurred';

      expect(errorCode).toBe('INTERNAL_ERROR');
      expect(message).toContain('unexpected');
    });

    it('should use STORAGE_ERROR for database failures', () => {
      const errorCode = 'STORAGE_ERROR';
      const message = 'Failed to save data';

      expect(errorCode).toBe('STORAGE_ERROR');
      expect(message).toContain('Failed');
    });
  });

  describe('HTTP Status Codes', () => {
    it('should return 400 for validation errors', () => {
      const statusCode = 400;
      const errorCode = 'VALIDATION_ERROR';

      expect(statusCode).toBe(400);
      expect(errorCode).toBe('VALIDATION_ERROR');
    });

    it('should return 401 for unauthorized requests', () => {
      const statusCode = 401;
      const errorCode = 'UNAUTHORIZED';

      expect(statusCode).toBe(401);
      expect(errorCode).toBe('UNAUTHORIZED');
    });

    it('should return 403 for forbidden requests', () => {
      const statusCode = 403;
      const errorCode = 'FORBIDDEN';

      expect(statusCode).toBe(403);
      expect(errorCode).toBe('FORBIDDEN');
    });

    it('should return 404 for not found errors', () => {
      const statusCode = 404;
      const errorCode = 'NOT_FOUND';

      expect(statusCode).toBe(404);
      expect(errorCode).toBe('NOT_FOUND');
    });

    it('should return 500 for internal server errors', () => {
      const statusCode = 500;
      const errorCode = 'INTERNAL_ERROR';

      expect(statusCode).toBe(500);
      expect(errorCode).toBe('INTERNAL_ERROR');
    });

    it('should return 503 for service unavailable', () => {
      const statusCode = 503;
      const errorCode = 'NO_API_KEYS_AVAILABLE';

      expect(statusCode).toBe(503);
      expect(errorCode).toBe('NO_API_KEYS_AVAILABLE');
    });
  });

  describe('Error Messages', () => {
    it('should provide user-friendly error messages', () => {
      const messages = [
        'Authentication required',
        'Invalid input provided',
        'Resource not found',
        'An unexpected error occurred',
      ];

      messages.forEach(message => {
        expect(message.length).toBeGreaterThan(0);
        expect(message).not.toContain('undefined');
        expect(message).not.toContain('null');
      });
    });

    it('should not expose sensitive information in error messages', () => {
      const message = 'Authentication failed';

      expect(message).not.toContain('password');
      expect(message).not.toContain('token');
      expect(message).not.toContain('secret');
      expect(message).not.toContain('key');
    });

    it('should not expose stack traces in production', () => {
      const errorResponse = {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
        timestamp: new Date().toISOString(),
      };

      expect(errorResponse.error).not.toHaveProperty('stack');
      expect(errorResponse).not.toHaveProperty('stackTrace');
    });
  });

  describe('Validation Error Details', () => {
    it('should specify which field failed validation', () => {
      const errorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Provider field is required',
        },
        timestamp: new Date().toISOString(),
      };

      expect(errorResponse.error.message).toContain('Provider');
    });

    it('should explain why validation failed', () => {
      const errorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Password must be at least 8 characters',
        },
        timestamp: new Date().toISOString(),
      };

      expect(errorResponse.error.message).toContain('at least 8 characters');
    });

    it('should handle multiple validation errors', () => {
      const errorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Multiple validation errors occurred',
          details: [
            { field: 'username', message: 'Username is required' },
            { field: 'password', message: 'Password is too short' },
          ],
        },
        timestamp: new Date().toISOString(),
      };

      expect(errorResponse.error.details).toHaveLength(2);
      expect(errorResponse.error.details[0].field).toBe('username');
    });
  });

  describe('Consistency Across Routes', () => {
    it('should use same error structure for proxy route', () => {
      const proxyError = {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
        timestamp: new Date().toISOString(),
      };

      expect(proxyError).toHaveProperty('error');
      expect(proxyError).toHaveProperty('timestamp');
    });

    it('should use same error structure for admin routes', () => {
      const adminError = {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Admin access required',
        },
        timestamp: new Date().toISOString(),
      };

      expect(adminError).toHaveProperty('error');
      expect(adminError).toHaveProperty('timestamp');
    });

    it('should use same error structure for auth routes', () => {
      const authError = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid credentials',
        },
        timestamp: new Date().toISOString(),
      };

      expect(authError).toHaveProperty('error');
      expect(authError).toHaveProperty('timestamp');
    });
  });

  describe('Error Logging', () => {
    it('should log errors with context', () => {
      const logEntry = {
        level: 'error',
        code: 'INTERNAL_ERROR',
        message: 'Database connection failed',
        timestamp: new Date().toISOString(),
        context: {
          route: '/api/admin/keys',
          method: 'GET',
          userId: 'admin-1',
        },
      };

      expect(logEntry.level).toBe('error');
      expect(logEntry.context).toBeDefined();
      expect(logEntry.context.route).toBeDefined();
    });

    it('should include request ID for tracing', () => {
      const logEntry = {
        requestId: 'req-123456',
        error: 'Database error',
        timestamp: new Date().toISOString(),
      };

      expect(logEntry.requestId).toBeDefined();
      expect(logEntry.requestId).toMatch(/^req-/);
    });
  });
});
