import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-setup';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/monitoring
 * 
 * Retrieves system monitoring metrics including:
 * - Error rates
 * - Performance metrics
 * - Active API keys count
 * - System health indicators
 * 
 * Requirements: 11.1, 11.5
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const session = await auth();
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Admin access required' } },
        { status: 401 }
      );
    }

    // Calculate time range (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get usage logs for the last 24 hours
    const recentLogs = await prisma.usageLog.findMany({
      where: {
        timestamp: {
          gte: oneDayAgo,
        },
      },
      select: {
        requestDuration: true,
        timestamp: true,
      },
    });

    // Calculate metrics
    const totalRequests = recentLogs.length;
    const avgResponseTime = totalRequests > 0
      ? recentLogs.reduce((sum, log) => sum + log.requestDuration, 0) / totalRequests
      : 0;

    // Count active API keys
    const activeAPIKeys = await prisma.aPIKey.count();

    // For error rate, we would need to track failed requests
    // For now, we'll estimate based on missing data or use a placeholder
    const failedRequests = 0; // This would be tracked in a real implementation
    const errorRate = totalRequests > 0 ? failedRequests / totalRequests : 0;

    // Generate alerts based on thresholds
    const alerts = [];

    // Alert if error rate is high (>5%)
    if (errorRate > 0.05) {
      alerts.push({
        id: 'high-error-rate',
        severity: errorRate > 0.1 ? 'critical' : 'warning',
        message: `Error rate is ${(errorRate * 100).toFixed(2)}% (threshold: 5%)`,
        timestamp: new Date(),
      });
    }

    // Alert if average response time is high (>5 seconds)
    if (avgResponseTime > 5000) {
      alerts.push({
        id: 'slow-response',
        severity: avgResponseTime > 10000 ? 'critical' : 'warning',
        message: `Average response time is ${(avgResponseTime / 1000).toFixed(2)}s (threshold: 5s)`,
        timestamp: new Date(),
      });
    }

    // Alert if no API keys are configured
    if (activeAPIKeys === 0) {
      alerts.push({
        id: 'no-api-keys',
        severity: 'critical',
        message: 'No API keys configured. Users cannot make requests.',
        timestamp: new Date(),
      });
    }

    // Alert if very few requests (possible system issue)
    if (totalRequests < 10 && totalRequests > 0) {
      alerts.push({
        id: 'low-traffic',
        severity: 'info',
        message: `Only ${totalRequests} requests in the last 24 hours`,
        timestamp: new Date(),
      });
    }

    const metrics = {
      errorRate,
      avgResponseTime,
      totalRequests,
      failedRequests,
      activeAPIKeys,
      lastUpdated: new Date(),
    };

    return NextResponse.json({
      metrics,
      alerts,
    });
  } catch (error) {
    console.error('Error fetching monitoring metrics:', error);
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch monitoring metrics',
        },
      },
      { status: 500 }
    );
  }
}
