/**
 * Database Configuration and Connection Pooling
 * 
 * This module provides optimized database configuration for Vercel serverless deployment.
 * It implements connection pooling strategies to minimize database connection overhead
 * and improve query performance.
 * 
 * Requirements: 1.10, 4.6
 */

/**
 * Connection Pool Configuration
 * 
 * Vercel Postgres automatically handles connection pooling, but we can optimize
 * our Prisma client usage to work efficiently with serverless functions.
 * 
 * Key strategies:
 * 1. Reuse Prisma Client instances across function invocations
 * 2. Use connection pooling URL (DATABASE_URL with pgbouncer)
 * 3. Set appropriate connection limits
 * 4. Implement query timeouts
 */

export const DB_CONFIG = {
  // Connection pool settings
  connectionPool: {
    // Maximum number of connections in the pool
    // For Vercel, this should be conservative to avoid exhausting database connections
    maxConnections: 10,
    
    // Minimum number of connections to maintain
    minConnections: 2,
    
    // Connection timeout in milliseconds
    connectionTimeout: 10000, // 10 seconds
    
    // Idle timeout - how long a connection can be idle before being closed
    idleTimeout: 30000, // 30 seconds
    
    // Maximum lifetime of a connection
    maxLifetime: 3600000, // 1 hour
  },
  
  // Query optimization settings
  queryOptimization: {
    // Query timeout in milliseconds
    queryTimeout: 5000, // 5 seconds
    
    // Enable query logging in development
    logQueries: process.env.NODE_ENV === 'development',
    
    // Enable slow query logging (queries taking longer than this threshold)
    slowQueryThreshold: 1000, // 1 second
  },
  
  // Caching strategies
  caching: {
    // Enable query result caching for frequently accessed data
    enableQueryCache: true,
    
    // Cache TTL for different data types
    cacheTTL: {
      blogPosts: 300, // 5 minutes
      apiKeys: 60, // 1 minute
      usageMetrics: 30, // 30 seconds
      adminData: 60, // 1 minute
    },
  },
};

/**
 * Database Performance Monitoring
 * 
 * Tracks query performance and connection pool metrics
 */
export class DBPerformanceMonitor {
  private static queryTimes: number[] = [];
  private static slowQueries: Array<{ query: string; duration: number; timestamp: Date }> = [];
  
  /**
   * Record query execution time
   */
  static recordQuery(query: string, duration: number): void {
    this.queryTimes.push(duration);
    
    // Keep only last 100 queries
    if (this.queryTimes.length > 100) {
      this.queryTimes.shift();
    }
    
    // Track slow queries
    if (duration > DB_CONFIG.queryOptimization.slowQueryThreshold) {
      this.slowQueries.push({
        query,
        duration,
        timestamp: new Date(),
      });
      
      // Keep only last 50 slow queries
      if (this.slowQueries.length > 50) {
        this.slowQueries.shift();
      }
      
      // Log slow query in development
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[DB] Slow query detected (${duration}ms):`, query);
      }
    }
  }
  
  /**
   * Get average query time
   */
  static getAverageQueryTime(): number {
    if (this.queryTimes.length === 0) return 0;
    const sum = this.queryTimes.reduce((a, b) => a + b, 0);
    return sum / this.queryTimes.length;
  }
  
  /**
   * Get slow queries
   */
  static getSlowQueries(): Array<{ query: string; duration: number; timestamp: Date }> {
    return [...this.slowQueries];
  }
  
  /**
   * Clear metrics
   */
  static clearMetrics(): void {
    this.queryTimes = [];
    this.slowQueries = [];
  }
}

/**
 * Query Optimization Helpers
 * 
 * Provides utilities for optimizing common database queries
 */
export const QueryOptimizer = {
  /**
   * Optimize blog post queries with proper indexing
   */
  getBlogPostsOptimized: {
    // Use indexed fields for sorting and filtering
    orderBy: { publishedAt: 'desc' as const },
    
    // Select only necessary fields to reduce data transfer
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      author: true,
      publishedAt: true,
      featuredImage: true,
    },
  },
  
  /**
   * Optimize API key queries with proper indexing
   */
  getAPIKeysOptimized: {
    // Use indexed fields for sorting
    orderBy: { lastUsedAt: 'asc' as const },
    
    // Select only necessary fields
    select: {
      id: true,
      provider: true,
      encryptedKey: true,
      createdAt: true,
      updatedAt: true,
      lastUsedAt: true,
    },
  },
  
  /**
   * Optimize usage metrics queries with aggregation
   */
  getUsageMetricsOptimized: {
    // Use indexed fields for filtering
    where: {
      timestamp: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    },
    
    // Use indexed fields for sorting
    orderBy: { timestamp: 'desc' as const },
  },
};

/**
 * Connection Pool Health Check
 * 
 * Monitors database connection health
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    // Simple query to check database connectivity
    const { prisma } = await import('./prisma');
    await prisma.$queryRaw`SELECT 1`;
    
    const latency = Date.now() - startTime;
    
    return {
      healthy: true,
      latency,
    };
  } catch (error) {
    return {
      healthy: false,
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Database Optimization Tips
 * 
 * Best practices for database performance in serverless environments:
 * 
 * 1. Use connection pooling (DATABASE_URL with pgbouncer)
 * 2. Add indexes on frequently queried fields
 * 3. Use select to fetch only needed fields
 * 4. Implement query result caching for static data
 * 5. Use transactions for multiple related operations
 * 6. Monitor slow queries and optimize them
 * 7. Use batch operations for bulk inserts/updates
 * 8. Implement pagination for large result sets
 * 9. Use database-level aggregations instead of application-level
 * 10. Close connections properly in serverless functions
 */
