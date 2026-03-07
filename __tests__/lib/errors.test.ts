/**
 * Unit tests for centralized error handling module
 * Tests error response formatting, logging, and status code mapping
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ErrorCode,
  createErrorResponse,
  getStatusCode,
  handleError,
  logError,
  logWarning,
  logInfo,
  type ErrorResponse,
  type ErrorContext,
} from '@/lib/errors';

describe('Error Handling Module', () => {
  // Store original console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleInfo = console.info;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Mock console methods
    console.error = vi.fn();
    console.warn = vi.fn();
    console.info = vi.fn();
  });

  afterEach(() => {
    // Restore console methods
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.info = originalConsoleInfo;
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('createErrorResponse', () => {
    it('should create error response with default message', () => {
      const response = createErrorResponse(ErrorCode.UNAUTHORIZED);

      expect(response).toMatchObject({
        error: {
          code: ErrorCode.UNAUTHORIZED,
          message: 'Authentication required. Please log in.',
        },
      });
      expect(response.timestamp).toBeDefined();
      expect(new Date(response.timestamp).getTime()).toBeGreaterThan(0);
    });

    it('should create error response with custom message', () => {
      const customMessage = 'Custom error message';
      const response = createErrorResponse(ErrorCode.VALIDATION_ERROR, customMessage);

      expect(response.error.message).toBe(customMessage);
      expect(response.error.code).toBe(ErrorCode.VALIDATION_ERROR);
    });

    it('should include details in development mode', () => {
      process.env.NODE_ENV = 'development';
      const details = { field: 'email', reason: 'invalid format' };
      const response = createErrorResponse(ErrorCode.VALIDATION_ERROR, undefined, details);

      expect(response.error.details).toEqual(details);
    });

    it('should exclude details in production mode', () => {
      process.env.NODE_ENV = 'production';
      const details = { field: 'email', reason: 'invalid format' };
      const response = createErrorResponse(ErrorCode.VALIDATION_ERROR, undefined, details);

      expect(response.error.details).toBeUndefined();
    });

    it('should create valid ISO timestamp', () => {
      const response = createErrorResponse(ErrorCode.INTERNAL_ERROR);
      const timestamp = new Date(response.timestamp);

      expect(timestamp.toISOString()).toBe(response.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(Date.now() - 1000);
    });
  });

  describe('getStatusCode', () => {
    it('should return 401 for authentication errors', () => {
      expect(getStatusCode(ErrorCode.UNAUTHORIZED)).toBe(401);
      expect(getStatusCode(ErrorCode.INVALID_CREDENTIALS)).toBe(401);
      expect(getStatusCode(ErrorCode.SESSION_EXPIRED)).toBe(401);
    });

    it('should return 403 for authorization errors', () => {
      expect(getStatusCode(ErrorCode.FORBIDDEN)).toBe(403);
      expect(getStatusCode(ErrorCode.INSUFFICIENT_PERMISSIONS)).toBe(403);
    });

    it('should return 400 for validation errors', () => {
      expect(getStatusCode(ErrorCode.INVALID_REQUEST)).toBe(400);
      expect(getStatusCode(ErrorCode.VALIDATION_ERROR)).toBe(400);
      expect(getStatusCode(ErrorCode.MISSING_REQUIRED_FIELD)).toBe(400);
    });

    it('should return 404 for not found errors', () => {
      expect(getStatusCode(ErrorCode.NOT_FOUND)).toBe(404);
      expect(getStatusCode(ErrorCode.RESOURCE_NOT_FOUND)).toBe(404);
    });

    it('should return 409 for conflict errors', () => {
      expect(getStatusCode(ErrorCode.CONFLICT)).toBe(409);
      expect(getStatusCode(ErrorCode.DUPLICATE_ENTRY)).toBe(409);
    });

    it('should return 500 for server errors', () => {
      expect(getStatusCode(ErrorCode.INTERNAL_ERROR)).toBe(500);
      expect(getStatusCode(ErrorCode.DATABASE_ERROR)).toBe(500);
      expect(getStatusCode(ErrorCode.PROVIDER_ERROR)).toBe(500);
    });

    it('should return 503 for service unavailable errors', () => {
      expect(getStatusCode(ErrorCode.SERVICE_UNAVAILABLE)).toBe(503);
      expect(getStatusCode(ErrorCode.NO_API_KEYS_AVAILABLE)).toBe(503);
    });
  });

  describe('logError', () => {
    it('should log error with Error object', () => {
      const error = new Error('Test error');
      const context: ErrorContext = { userId: '123', path: '/api/test' };

      logError(error, ErrorCode.INTERNAL_ERROR, context);

      expect(console.error).toHaveBeenCalledTimes(1);
      const logCall = (console.error as any).mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe('ERROR');
      expect(logEntry.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(logEntry.message).toBe('Test error');
      expect(logEntry.stack).toBeDefined();
      expect(logEntry.context).toEqual(context);
      expect(logEntry.timestamp).toBeDefined();
    });

    it('should log error with string message', () => {
      const errorMessage = 'String error message';
      const context: ErrorContext = { requestId: 'req-456' };

      logError(errorMessage, ErrorCode.VALIDATION_ERROR, context);

      expect(console.error).toHaveBeenCalledTimes(1);
      const logCall = (console.error as any).mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe('ERROR');
      expect(logEntry.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(logEntry.message).toBe(errorMessage);
      expect(logEntry.stack).toBeUndefined();
      expect(logEntry.context).toEqual(context);
    });

    it('should log error without context', () => {
      const error = new Error('No context error');

      logError(error, ErrorCode.DATABASE_ERROR);

      expect(console.error).toHaveBeenCalledTimes(1);
      const logCall = (console.error as any).mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.context).toBeUndefined();
    });
  });

  describe('logWarning', () => {
    it('should log warning with context', () => {
      const message = 'Warning message';
      const context: ErrorContext = { userId: '789' };

      logWarning(message, context);

      expect(console.warn).toHaveBeenCalledTimes(1);
      const logCall = (console.warn as any).mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe('WARN');
      expect(logEntry.message).toBe(message);
      expect(logEntry.context).toEqual(context);
      expect(logEntry.timestamp).toBeDefined();
    });

    it('should log warning without context', () => {
      const message = 'Simple warning';

      logWarning(message);

      expect(console.warn).toHaveBeenCalledTimes(1);
      const logCall = (console.warn as any).mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe('WARN');
      expect(logEntry.message).toBe(message);
      expect(logEntry.context).toBeUndefined();
    });
  });

  describe('logInfo', () => {
    it('should log info with context', () => {
      const message = 'Info message';
      const context: ErrorContext = { operation: 'test' };

      logInfo(message, context);

      expect(console.info).toHaveBeenCalledTimes(1);
      const logCall = (console.info as any).mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe('INFO');
      expect(logEntry.message).toBe(message);
      expect(logEntry.context).toEqual(context);
      expect(logEntry.timestamp).toBeDefined();
    });

    it('should log info without context', () => {
      const message = 'Simple info';

      logInfo(message);

      expect(console.info).toHaveBeenCalledTimes(1);
      const logCall = (console.info as any).mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry.level).toBe('INFO');
      expect(logEntry.message).toBe(message);
      expect(logEntry.context).toBeUndefined();
    });
  });

  describe('handleError', () => {
    it('should log error and return error response', () => {
      const error = new Error('Test error');
      const context: ErrorContext = { userId: '123' };

      const response = handleError(error, ErrorCode.PROVIDER_ERROR, context);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(response.error.code).toBe(ErrorCode.PROVIDER_ERROR);
      expect(response.error.message).toBe('AI provider error. Please try again.');
      expect(response.timestamp).toBeDefined();
    });

    it('should use custom message when provided', () => {
      const error = new Error('Test error');
      const customMessage = 'Custom error message';

      const response = handleError(error, ErrorCode.INTERNAL_ERROR, undefined, customMessage);

      expect(response.error.message).toBe(customMessage);
    });

    it('should include error details in development mode', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Test error');

      const response = handleError(error, ErrorCode.DATABASE_ERROR);

      expect(response.error.details).toBeDefined();
      expect(response.error.details.message).toBe('Test error');
      expect(response.error.details.stack).toBeDefined();
    });

    it('should exclude error details in production mode', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Test error');

      const response = handleError(error, ErrorCode.DATABASE_ERROR);

      expect(response.error.details).toBeUndefined();
    });

    it('should handle string errors', () => {
      const errorMessage = 'String error';

      const response = handleError(errorMessage, ErrorCode.ENCRYPTION_ERROR);

      expect(response.error.code).toBe(ErrorCode.ENCRYPTION_ERROR);
      expect(response.error.message).toBe('Encryption operation failed.');
    });
  });

  describe('Error response structure', () => {
    it('should have consistent structure across all error codes', () => {
      const errorCodes = Object.values(ErrorCode);

      errorCodes.forEach((code) => {
        const response = createErrorResponse(code);

        expect(response).toHaveProperty('error');
        expect(response.error).toHaveProperty('code');
        expect(response.error).toHaveProperty('message');
        expect(response).toHaveProperty('timestamp');
        expect(typeof response.error.code).toBe('string');
        expect(typeof response.error.message).toBe('string');
        expect(typeof response.timestamp).toBe('string');
      });
    });

    it('should have valid status codes for all error codes', () => {
      const errorCodes = Object.values(ErrorCode);

      errorCodes.forEach((code) => {
        const statusCode = getStatusCode(code);

        expect(statusCode).toBeGreaterThanOrEqual(400);
        expect(statusCode).toBeLessThan(600);
      });
    });
  });

  describe('Logging format', () => {
    it('should produce valid JSON logs', () => {
      const error = new Error('Test error');
      const context: ErrorContext = { userId: '123', requestId: 'req-456' };

      logError(error, ErrorCode.INTERNAL_ERROR, context);

      const logCall = (console.error as any).mock.calls[0][0];
      expect(() => JSON.parse(logCall)).not.toThrow();
    });

    it('should include all required fields in error logs', () => {
      const error = new Error('Test error');

      logError(error, ErrorCode.DATABASE_ERROR);

      const logCall = (console.error as any).mock.calls[0][0];
      const logEntry = JSON.parse(logCall);

      expect(logEntry).toHaveProperty('timestamp');
      expect(logEntry).toHaveProperty('level');
      expect(logEntry).toHaveProperty('code');
      expect(logEntry).toHaveProperty('message');
    });
  });
});
