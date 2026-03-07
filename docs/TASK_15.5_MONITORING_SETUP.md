# Task 15.5: Monitoring and Error Tracking Setup

## Overview

This task implements comprehensive monitoring and error tracking for the AI FutureLinks Platform to ensure production reliability and meet requirements 11.1 and 11.5.

## Completed Work

### 1. Vercel Analytics Integration

**Package**: `@vercel/analytics`

**Integration**: Added to `app/layout.tsx`

```typescript
import { Analytics } from '@vercel/analytics/react';

// In body
<Analytics />
```

**Features**:
- Automatic page view tracking
- Custom event tracking
- User journey analysis
- Geographic distribution
- Conversion metrics

**Access**: Vercel Dashboard → Analytics

### 2. Vercel Speed Insights Integration

**Package**: `@vercel/speed-insights`

**Integration**: Added to `app/layout.tsx`

```typescript
import { SpeedInsights } from '@vercel/speed-insights/next';

// In body
<SpeedInsights />
```

**Metrics Tracked**:
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)

**Access**: Vercel Dashboard → Speed Insights

### 3. Sentry Error Tracking

**Package**: `@sentry/nextjs`

**Configuration Files Created**:
- `sentry.server.config.ts` - Server-side error tracking
- `sentry.edge.config.ts` - Edge runtime error tracking
- `instrumentation.ts` - Server instrumentation
- `instrumentation-client.ts` - Client instrumentation
- `app/global-error.tsx` - Global error boundary
- `.env.sentry-build-plugin` - Build plugin configuration

**Features Enabled**:
- Automatic error capture
- Performance monitoring (tracing)
- Session replay
- Application logs
- Stack trace analysis
- User context tracking

**Environment Variables Required**:
```bash
SENTRY_DSN=<your-sentry-dsn>
SENTRY_ORG=<your-sentry-org>
SENTRY_PROJECT=<your-sentry-project>
SENTRY_AUTH_TOKEN=<your-auth-token>
NEXT_PUBLIC_SENTRY_ENABLED=true
```

### 4. Monitoring Utilities Library

**File**: `lib/monitoring.ts`

**Exports**:
- `logError()` - Log errors to Sentry with context
- `logMessage()` - Log messages with severity levels
- `trackMetric()` - Track custom metrics
- `trackAPIRequest()` - Track API request duration and status
- `trackDatabaseQuery()` - Track database query performance
- `trackAuthentication()` - Track authentication events
- `trackProxyRequest()` - Track AI proxy requests
- `setUserContext()` - Set user context for error tracking
- `clearUserContext()` - Clear user context on logout
- `addBreadcrumb()` - Add debugging breadcrumbs
- `withPerformanceMonitoring()` - Wrapper for async operations

**Usage Example**:
```typescript
import { trackProxyRequest, logError } from '@/lib/monitoring';

try {
  const result = await callAIProvider();
  trackProxyRequest(provider, duration, tokensUsed);
} catch (error) {
  trackProxyRequest(provider, duration, undefined, error);
  logError(error, { provider, duration });
}
```

### 5. Custom Monitoring Dashboard

**Component**: `components/admin/MonitoringDashboard.tsx`

**Page**: `app/admin/monitoring/page.tsx`

**API Route**: `app/api/admin/monitoring/route.ts`

**Features**:
- System health status indicator
- Real-time metrics display:
  - Error rate (%)
  - Average response time (ms)
  - Total requests (24h)
  - Failed requests count
  - Active API keys count
- Automated alerts:
  - High error rate (>5% warning, >10% critical)
  - Slow response times (>5s warning, >10s critical)
  - No API keys configured (critical)
  - Low traffic anomalies (info)
- Auto-refresh every 10 seconds
- Integration status indicators

**Access**: `/admin/monitoring` (admin authentication required)

### 6. API Route Integration

**Modified Files**:
- `app/api/proxy/route.ts` - Added monitoring for AI proxy requests

**Tracking Added**:
- Request duration tracking
- Success/failure status
- Token usage (when available)
- Provider-specific metrics
- Error logging with context

**Example Integration**:
```typescript
import { trackProxyRequest } from '@/lib/monitoring';

// Track successful request
const duration = Date.now() - startTime;
trackProxyRequest(provider, duration, tokensUsed);

// Track failed request
trackProxyRequest(provider, duration, undefined, error);
```

### 7. Admin Navigation Update

**File**: `app/admin/layout.tsx`

**Change**: Added "Monitoring" link to admin navigation menu

```typescript
<Link href="/admin/monitoring">Monitoring</Link>
```

### 8. Documentation

**Files Created**:
- `docs/MONITORING_SETUP.md` - Comprehensive monitoring documentation
- `docs/TASK_15.5_MONITORING_SETUP.md` - This file

**Updated Files**:
- `.env.example` - Added Sentry environment variables

## Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Error Rate | >5% | >10% |
| Response Time | >5s | >10s |
| API Keys | N/A | 0 keys |
| Traffic | <10 requests/24h | N/A |

## Requirements Fulfilled

### Requirement 11.1: Usage Tracking and Display

✅ **Implemented**:
- Usage metrics collected for each API key
- Real-time display in admin dashboard
- Request count tracking
- Last used timestamp tracking
- Auto-refresh every 5 seconds (Usage Dashboard)
- Auto-refresh every 10 seconds (Monitoring Dashboard)

### Requirement 11.5: Real-time Usage Metric Updates

✅ **Implemented**:
- Polling-based real-time updates
- Usage Dashboard: 5-second refresh interval
- Monitoring Dashboard: 10-second refresh interval
- Metrics reflect changes within specified intervals

## Testing

### Test Sentry Integration

1. Visit `/sentry-example-page` to trigger test errors
2. Check Sentry dashboard for captured errors
3. Verify source maps are uploaded correctly

### Test Monitoring Dashboard

1. Navigate to `/admin/monitoring`
2. Verify metrics are displayed correctly
3. Check auto-refresh functionality
4. Trigger alerts by:
   - Removing all API keys (critical alert)
   - Making failed requests (error rate alert)

### Test Analytics

1. Navigate through the application
2. Check Vercel Analytics dashboard for page views
3. Verify Speed Insights shows Core Web Vitals data

## Deployment Checklist

### Vercel Environment Variables

Set the following in Vercel Dashboard → Settings → Environment Variables:

```bash
# Sentry
SENTRY_DSN=<your-dsn>
SENTRY_ORG=<your-org>
SENTRY_PROJECT=<your-project>
SENTRY_AUTH_TOKEN=<your-token>
NEXT_PUBLIC_SENTRY_ENABLED=true
```

### Vercel Integrations

1. **Sentry Integration**:
   - Go to https://vercel.com/integrations/sentry
   - Click "Add Integration"
   - Select your project
   - Authorize the integration
   - This automatically sets up environment variables and source maps

2. **Analytics**: Automatically enabled for all Vercel projects

3. **Speed Insights**: Automatically enabled for all Vercel projects

## Monitoring Best Practices

1. **Error Context**: Always include relevant context when logging errors
2. **User Privacy**: Never log sensitive data (passwords, API keys)
3. **Performance**: Use performance monitoring for critical operations
4. **Alerts**: Configure alert notifications in Sentry for critical issues
5. **Regular Review**: Check monitoring dashboards daily for anomalies

## Troubleshooting

### Sentry Not Capturing Errors

1. Check `SENTRY_DSN` is set correctly
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

## Next Steps

1. **Configure Sentry Alerts**: Set up email/Slack notifications for critical errors
2. **Custom Dashboards**: Create custom Sentry dashboards for specific metrics
3. **Performance Budgets**: Set up performance budgets in Vercel
4. **Log Aggregation**: Consider adding structured logging for better debugging
5. **Uptime Monitoring**: Add external uptime monitoring (e.g., UptimeRobot)

## Additional Resources

- [Vercel Analytics Documentation](https://vercel.com/docs/analytics)
- [Vercel Speed Insights Documentation](https://vercel.com/docs/speed-insights)
- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Monitoring Setup Guide](./MONITORING_SETUP.md)
