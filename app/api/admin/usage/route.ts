import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-setup';
import { prisma } from '@/lib/prisma';

/**
 * API Route for Usage Metrics
 * 
 * GET: Retrieve usage metrics with optional date filters
 * 
 * Requirements: 11.2, 11.5, 11.6
 */

export async function GET(request: NextRequest) {
  try {
    // Validate admin session
    const session = await auth();
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Admin access required' } },
        { status: 401 }
      );
    }

    // Parse query parameters for date filtering
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Query usage logs with aggregation by API key
    const usageLogs = await prisma.usageLog.findMany({
      where: Object.keys(dateFilter).length > 0 ? {
        timestamp: dateFilter
      } : undefined,
      include: {
        apiKey: {
          select: {
            id: true,
            provider: true,
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    // Aggregate metrics by API key
    const metricsMap = new Map<string, {
      apiKeyId: string;
      provider: string;
      totalRequests: number;
      lastRequestAt: Date | null;
    }>();

    for (const log of usageLogs) {
      const existing = metricsMap.get(log.apiKeyId);
      if (existing) {
        existing.totalRequests += 1;
        if (!existing.lastRequestAt || log.timestamp > existing.lastRequestAt) {
          existing.lastRequestAt = log.timestamp;
        }
      } else {
        metricsMap.set(log.apiKeyId, {
          apiKeyId: log.apiKeyId,
          provider: log.apiKey.provider,
          totalRequests: 1,
          lastRequestAt: log.timestamp,
        });
      }
    }

    // Convert map to array
    const metrics = Array.from(metricsMap.values());

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Error fetching usage metrics:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch usage metrics',
        },
      },
      { status: 500 }
    );
  }
}
