/**
 * Centralized error handling module for consistent error responses across all API routes
 * Requirement 4.5: API Failure Error Handling
 */

/**
 * Standard error response interface for all API routes
 */
export interface ErrorResponse {
  error: {
    code: string; // Machine-readable error code
    message: string; // User-friendly message
    details?: any; // Optional technical details (dev mode only)
  };
  timestamp: string;
}

/**
 * Standard error codes used across the application
 */
export enum ErrorCode {
  // Authentication errors (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  
  // Authorization errors (403)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Validation errors (400)
  INVALID_REQUEST = 'INVALID_REQUEST',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Resource errors (404)
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  
  // Conflict errors (409)
  CONFLICT = 'CONFLICT',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  
  // Server errors (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  ENCRYPTION_ERROR = 'ENCRYPTION_ERROR',
  
  // Service errors (503)
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  NO_API_KEYS_AVAILABLE = 'NO_API_KEYS_AVAILABLE',
  
  // Provider errors (500)
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  UNSUPPORTED_PROVIDER = 'UNSUPPORTED_PROVIDER',
  KEY_SELECTION_ERROR = 'KEY_SELECTION_ERROR',
}

/**
 * User-friendly error messages mapped to error codes
 */
const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.UNAUTHORIZED]: 'Authentication required. Please log in.',
  [ErrorCode.INVALID_CREDENTIALS]: 'Invalid username or password.',
  [ErrorCode.SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
  
  [ErrorCode.FORBIDDEN]: 'You do not have permission to access this resource.',
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions to perform this action.',
  
  [ErrorCode.INVALID_REQUEST]: 'Invalid request format.',
  [ErrorCode.VALIDATION_ERROR]: 'Validation failed. Please check your input.',
  [ErrorCode.MISSING_REQUIRED_FIELD]: 'Required field is missing.',
  
  [ErrorCode.NOT_FOUND]: 'Resource not found.',
  [ErrorCode.RESOURCE_NOT_FOUND]: 'The requested resource does not exist.',
  
  [ErrorCode.CONFLICT]: 'Request conflicts with existing data.',
  [ErrorCode.DUPLICATE_ENTRY]: 'An entry with this value already exists.',
  
  [ErrorCode.INTERNAL_ERROR]: 'An internal error occurred. Please try again later.',
  [ErrorCode.DATABASE_ERROR]: 'Database operation failed. Please try again.',
  [ErrorCode.ENCRYPTION_ERROR]: 'Encryption operation failed.',
  
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable. Please try again later.',
  [ErrorCode.NO_API_KEYS_AVAILABLE]: 'No API keys available. Please contact support.',
  
  [ErrorCode.PROVIDER_ERROR]: 'AI provider error. Please try again.',
  [ErrorCode.UNSUPPORTED_PROVIDER]: 'Unsupported AI provider.',
  [ErrorCode.KEY_SELECTION_ERROR]: 'Failed to select API key.',
};

/**
 * HTTP status codes mapped to error codes
 */
const ERROR_STATUS_CODES: Record<ErrorCode, number> = {
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.INVALID_CREDENTIALS]: 401,
  [ErrorCode.SESSION_EXPIRED]: 401,
  
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
  
  [ErrorCode.INVALID_REQUEST]: 400,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
  
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.RESOURCE_NOT_FOUND]: 404,
  
  [ErrorCode.CONFLICT]: 409,
  [ErrorCode.DUPLICATE_ENTRY]: 409,
  
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.ENCRYPTION_ERROR]: 500,
  
  [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.NO_API_KEYS_AVAILABLE]: 503,
  
  [ErrorCode.PROVIDER_ERROR]: 500,
  [ErrorCode.UNSUPPORTED_PROVIDER]: 500,
  [ErrorCode.KEY_SELECTION_ERROR]: 500,
};

/**
 * Error context for logging
 */
export interface ErrorContext {
  userId?: string;
  requestId?: string;
  path?: string;
  method?: string;
  [key: string]: any;
}

/**
 * Creates a formatted error response
 * 
 * @param code - Machine-readable error code
 * @param customMessage - Optional custom user-friendly message (overrides default)
 * @param details - Optional technical details (only included in development mode)
 * @returns Formatted ErrorResponse object
 */
export function createErrorResponse(
  code: ErrorCode,
  customMessage?: string,
  details?: any
): ErrorResponse {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    error: {
      code,
      message: customMessage || ERROR_MESSAGES[code],
      ...(isDevelopment && details ? { details } : {}),
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Gets the HTTP status code for an error code
 * 
 * @param code - Error code
 * @returns HTTP status code
 */
export function getStatusCode(code: ErrorCode): number {
  return ERROR_STATUS_CODES[code] || 500;
}

/**
 * Logs an error with context information
 * 
 * @param error - Error object or message
 * @param code - Error code
 * @param context - Additional context information
 */
export function logError(
  error: Error | string,
  code: ErrorCode,
  context?: ErrorContext
): void {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    code,
    message: errorMessage,
    ...(errorStack && { stack: errorStack }),
    ...(context && { context }),
  };
  
  // In production, this would integrate with a logging service (e.g., Sentry, DataDog)
  // For now, we use console.error with structured logging
  console.error(JSON.stringify(logEntry, null, 2));
}

/**
 * Logs a warning with context information
 * 
 * @param message - Warning message
 * @param context - Additional context information
 */
export function logWarning(message: string, context?: ErrorContext): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'WARN',
    message,
    ...(context && { context }),
  };
  
  console.warn(JSON.stringify(logEntry, null, 2));
}

/**
 * Logs an info message with context information
 * 
 * @param message - Info message
 * @param context - Additional context information
 */
export function logInfo(message: string, context?: ErrorContext): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'INFO',
    message,
    ...(context && { context }),
  };
  
  console.info(JSON.stringify(logEntry, null, 2));
}

/**
 * Helper function to create and log an error response
 * 
 * @param error - Error object or message
 * @param code - Error code
 * @param context - Additional context information
 * @param customMessage - Optional custom user-friendly message
 * @returns Formatted ErrorResponse object
 */
export function handleError(
  error: Error | string,
  code: ErrorCode,
  context?: ErrorContext,
  customMessage?: string
): ErrorResponse {
  logError(error, code, context);
  
  const details = error instanceof Error ? {
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  } : undefined;
  
  return createErrorResponse(code, customMessage, details);
}
