-- Performance Optimization Migration
-- Task 15.3: Add indexes for optimized database queries
-- Requirements: 1.10, 4.6

-- Add composite indexes for common query patterns

-- Optimize API key selection queries (provider + lastUsedAt)
CREATE INDEX IF NOT EXISTS "APIKey_provider_lastUsedAt_idx" ON "APIKey"("provider", "lastUsedAt");

-- Optimize usage log queries (apiKeyId + timestamp for time-range queries)
CREATE INDEX IF NOT EXISTS "UsageLog_apiKeyId_timestamp_idx" ON "UsageLog"("apiKeyId", "timestamp");

-- Optimize blog post queries (publishedAt DESC for listing)
CREATE INDEX IF NOT EXISTS "BlogPost_publishedAt_desc_idx" ON "BlogPost"("publishedAt" DESC);

-- Optimize message queries (sessionId + timestamp for conversation history)
CREATE INDEX IF NOT EXISTS "Message_sessionId_timestamp_idx" ON "Message"("sessionId", "timestamp");

-- Optimize chat session queries (userId + updatedAt for recent sessions)
CREATE INDEX IF NOT EXISTS "ChatSession_userId_updatedAt_idx" ON "ChatSession"("userId", "updatedAt" DESC);

-- Add partial index for active API keys (lastUsedAt IS NOT NULL)
CREATE INDEX IF NOT EXISTS "APIKey_active_idx" ON "APIKey"("lastUsedAt") WHERE "lastUsedAt" IS NOT NULL;

-- Add covering index for usage metrics aggregation
CREATE INDEX IF NOT EXISTS "UsageLog_metrics_idx" ON "UsageLog"("apiKeyId", "timestamp", "tokensUsed", "requestDuration");
