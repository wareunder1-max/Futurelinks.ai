/**
 * Monitoring and Error Tracking Utilities
 * 
 * This module provides utilities for monitoring application health,
 * tracking errors, and collecting metrics.
 * 
 * Requirements: 11.1, 11.5
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  FATAL = 'fatal',
}

/**
 * Metric types for tracking
 */
export enum MetricType {
  API_REQUEST = 'api_request',
  API_ERROR = 'api_error',
  DATABASE_QUERY = 'database_query',
  AUTHENTICATION = 'authentication',
  PROXY_REQUEST = 'proxy_request',
}

/**
 * Log an error to Sentry with context
 */
export function logError(
  error: Error,
  context?: Record<string, any>,
  severity: ErrorSeverity = ErrorSeverity.ERROR
) {
  Sentry.captureException(error, {
    level: severity,
    extra: context,
  });

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', error.message, context);
  }
}

/**
 * Log a message to Sentry
 */
export function logMessage(
  message: string,
  level: ErrorSeverity = ErrorSeverity.INFO,
  context?: Record<string, any>
) {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`[${level.toUpperCase()}]`, message, context);
  }
}

/**
 * Track a custom metric
 */
export function trackMetric(
  metricType: MetricType,
  value: number,
  tags?: Record<string, string>
) {
  // Log metric to Sentry as a message with context
  Sentry.captureMessage(`Metric: ${metricType}`, {
    level: 'info',
    extra: {
      metricType,
      value,
      tags,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('[Metric]', metricType, value, tags);
  }
}

/**
 * Track API request duration
 */
export function trackAPIRequest(
  endpoint: string,
  duration: number,
  statusCode: number,
  error?: Error
) {
  trackMetric(MetricType.API_REQUEST, duration, {
    endpoint,
    status: statusCode.toString(),
    success: error ? 'false' : 'true',
  });

  if (error) {
    logError(error, {
      endpoint,
      duration,
      statusCode,
    });
  }
}

/**
 * Track database query performance
 */
export function trackDatabaseQuery(
  operation: string,
  duration: number,
  error?: Error
) {
  trackMetric(MetricType.DATABASE_QUERY, duration, {
    operation,
    success: error ? 'false' : 'true',
  });

  if (error) {
    logError(error, {
      operation,
      duration,
    });
  }
}

/**
 * Track authentication events
 */
export function trackAuthentication(
  event: 'login' | 'logout' | 'failed_login',
  userType: 'user' | 'admin',
  context?: Record<string, any>
) {
  logMessage(`Authentication: ${event}`, ErrorSeverity.INFO, {
    event,
    userType,
    ...context,
  });
}

/**
 * Track AI proxy requests
 */
export function trackProxyRequest(
  provider: string,
  duration: number,
  tokensUsed?: number,
  error?: Error
) {
  trackMetric(MetricType.PROXY_REQUEST, duration, {
    provider,
    success: error ? 'false' : 'true',
  });

  if (tokensUsed) {
    trackMetric(MetricType.PROXY_REQUEST, tokensUsed, {
      provider,
      metric: 'tokens',
    });
  }

  if (error) {
    logError(error, {
      provider,
      duration,
      tokensUsed,
    }, ErrorSeverity.ERROR);
  }
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string, email?: string, role?: string) {
  Sentry.setUser({
    id: userId,
    email,
    role,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

/**
 * Performance monitoring wrapper for async functions
 */
export async function withPerformanceMonitoring<T>(
  operationName: string,
  operation: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    
    trackMetric(MetricType.API_REQUEST, duration, {
      operation: operationName,
      success: 'true',
      ...tags,
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    trackMetric(MetricType.API_REQUEST, duration, {
      operation: operationName,
      success: 'false',
      ...tags,
    });
    
    if (error instanceof Error) {
      logError(error, {
        operation: operationName,
        duration,
        ...tags,
      });
    }
    
    throw error;
  }
}
