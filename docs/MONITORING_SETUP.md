# Monitoring and Error Tracking Setup

This document describes the monitoring and error tracking infrastructure for the AI FutureLinks Platform.

## Overview

The platform uses multiple monitoring solutions to ensure production reliability:

1. **Vercel Analytics** - Web analytics and performance tracking
2. **Vercel Speed Insights** - Real User Monitoring (RUM) for Core Web Vitals
3. **Sentry** - Error tracking and performance monitoring
4. **Custom Metrics Dashboard** - API usage and system health monitoring

## Requirements

This setup fulfills the following requirements:
- **Requirement 11.1**: Usage Tracking and Display
- **Requirement 11.5**: Real-time usage metric updates

## Components

### 1. Vercel Analytics

**Purpose**: Track page views, user interactions, and conversion metrics.

**Integration**: Automatically enabled via `@vercel/analytics` package in `app/layout.tsx`.

**Features**:
- Page view tracking
- Custom event tracking
- User journey analysis
- Geographic distribution

**Access**: View analytics in the Vercel dashboard at https://vercel.com/dashboard/analytics

### 2. Vercel Speed Insights

**Purpose**: Monitor Core Web Vitals and real user performance metrics.

**Integration**: Automatically enabled via `@vercel/speed-insights` package in `app/layout.tsx`.

**Metrics Tracked**:
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)

**Access**: View Speed Insights in the Vercel dashboard at https://vercel.com/dashboard/speed-insights

### 3. Sentry Error Tracking

**Purpose**: Capture and track errors, exceptions, and performance issues.

**Integration**: Configured via Sentry wizard with the following files:
- `sentry.server.config.ts` - Server-side error tracking
- `sentry.edge.config.ts` - Edge runtime error tracking
- `instrumentation.ts` - Server instrumentation
- `instrumentation-client.ts` - Client instrumentation
- `app/global-error.tsx` - Global error boundary

**Features**:
- Automatic error capture
- Stack trace analysis
- User context tracking
- Performance monitoring
- Session replay
- Application logs

**Configuration**:
```typescript
// Environment variables required
SENTRY_DSN=<your-sentry-dsn>
SENTRY_ORG=<your-sentry-org>
SENTRY_PROJECT=<your-sentry-project>
SENTRY_AUTH_TOKEN=<your-auth-token>
```

**Access**: View errors and performance at https://sentry.io/

### 4. Custom Monitoring Dashboard

**Purpose**: Display real-time system health and API usage metrics.

**Location**: `/admin/monitoring`

**Features**:
- System health status indicator
- Error rate monitoring
- Average response time tracking
- Active API keys count
- Automated alerts for:
  - High error rate (>5%)
  - Slow response times (>5s)
  - No API keys configured
  - Low traffic anomalies

**API Endpoint**: `GET /api/admin/monitoring`

**Response Format**:
```json
{
  "metrics": {
    "errorRate": 0.02,
    "avgResponseTime": 1234,
    "totalRequests": 1000,
    "failedRequests": 20,
    "activeAPIKeys": 3,
    "lastUpdated": "2024-01-15T10:30:00Z"
  },
  "alerts": [
    {
      "id": "high-error-rate",
      "severity": "warning",
      "message": "Error rate is 5.2% (threshold: 5%)",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Monitoring Utilities

The `lib/monitoring.ts` module provides utilities for tracking metrics and errors:

### Error Logging

```typescript
import { logError, ErrorSeverity } from '@/lib/monitoring';

try {
  // Your code
} catch (error) {
  logError(error, { context: 'additional info' }, ErrorSeverity.ERROR);
}
```

### Metric Tracking

```typescript
import { trackMetric, MetricType } from '@/lib/monitoring';

trackMetric(MetricType.API_REQUEST, duration, {
  endpoint: '/api/proxy',
  status: '200',
});
```

### Performance Monitoring

```typescript
import { withPerformanceMonitoring } from '@/lib/monitoring';

const result = await withPerformanceMonitoring(
  'database-query',
  async () => {
    return await prisma.user.findMany();
  },
  { operation: 'findMany' }
);
```

### User Context

```typescript
import { setUserContext, clearUserContext } from '@/lib/monitoring';

// On login
setUserContext(userId, email, role);

// On logout
clearUserContext();
```

## Alert Thresholds

The monitoring system generates alerts based on the following thresholds:

| Metric | Warning | Critical |
|--------|---------|----------|
| Error Rate | >5% | >10% |
| Response Time | >5s | >10s |
| API Keys | N/A | 0 keys |
| Traffic | <10 requests/24h | N/A |

## Integration with API Routes

All API routes automatically track:
- Request duration
- Success/failure status
- Error details
- User context

Example integration in proxy route:

```typescript
import { trackProxyRequest } from '@/lib/monitoring';

// Track successful request
trackProxyRequest(provider, duration, tokensUsed);

// Track failed request
trackProxyRequest(provider, duration, undefined, error);
```

## Vercel Integration

### Setting up Sentry on Vercel

1. Install the Sentry Vercel integration:
   - Go to https://vercel.com/integrations/sentry
   - Click "Add Integration"
   - Select your project
   - Authorize the integration

2. The integration automatically:
   - Sets up environment variables
   - Configures source maps upload
   - Links deployments to Sentry releases

### Environment Variables

Required environment variables for production:

```bash
# Sentry
SENTRY_DSN=<your-dsn>
SENTRY_ORG=<your-org>
SENTRY_PROJECT=<your-project>
SENTRY_AUTH_TOKEN=<your-token>

# Optional: Disable Sentry in development
NEXT_PUBLIC_SENTRY_ENABLED=true
```

## Testing Monitoring

### Test Sentry Integration

Visit `/sentry-example-page` to trigger test errors and verify Sentry is working.

### Test Custom Monitoring

1. Navigate to `/admin/monitoring`
2. Verify metrics are displayed
3. Check that auto-refresh works (every 10 seconds)
4. Trigger alerts by:
   - Removing all API keys (critical alert)
   - Making failed requests (error rate alert)

## Best Practices

1. **Error Context**: Always include relevant context when logging errors
2. **User Privacy**: Never log sensitive user data (passwords, API keys)
3. **Performance**: Use performance monitoring for critical operations
4. **Alerts**: Configure alert notifications in Sentry for critical issues
5. **Regular Review**: Check monitoring dashboards daily for anomalies

## Troubleshooting

### Sentry Not Capturing Errors

1. Check that `SENTRY_DSN` is set correctly
2. Verify Sentry is initialized in `instrumentation.ts`
3. Check browser console for Sentry initialization errors
4. Ensure source maps are uploaded for production builds

### Monitoring Dashboard Not Loading

1. Verify admin session is active
2. Check database connection
3. Review browser console for API errors
4. Verify `/api/admin/monitoring` endpoint is accessible

### Missing Metrics

1. Ensure usage logs are being created in the database
2. Check that API keys have `lastUsedAt` timestamps
3. Verify date range filters are not excluding data
4. Review database query performance

## Additional Resources

- [Vercel Analytics Documentation](https://vercel.com/docs/analytics)
- [Vercel Speed Insights Documentation](https://vercel.com/docs/speed-insights)
- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
