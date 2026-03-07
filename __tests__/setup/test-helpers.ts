import { hash } from 'bcryptjs';
import { getTestDb } from './test-db';

/**
 * Create a test user in the database
 */
export async function createTestUser(data: {
  email: string;
  name?: string;
  provider?: string;
}) {
  const db = getTestDb();
  return db.user.create({
    data: {
      email: data.email,
      name: data.name || 'Test User',
      provider: data.provider || 'email',
    },
  });
}

/**
 * Create a test admin in the database
 */
export async function createTestAdmin(data: {
  username: string;
  password: string;
}) {
  const db = getTestDb();
  const passwordHash = await hash(data.password, 12);
  
  return db.admin.create({
    data: {
      username: data.username,
      passwordHash,
    },
  });
}

/**
 * Create a test API key in the database
 */
export async function createTestAPIKey(data: {
  provider: string;
  encryptedKey: string;
}) {
  const db = getTestDb();
  return db.aPIKey.create({
    data: {
      provider: data.provider,
      encryptedKey: data.encryptedKey,
    },
  });
}

/**
 * Create a test blog post in the database
 */
export async function createTestBlogPost(data: {
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  metaDescription?: string;
  keywords?: string;
}) {
  const db = getTestDb();
  return db.blogPost.create({
    data: {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt || 'Test excerpt',
      content: data.content || 'Test content',
      metaDescription: data.metaDescription || 'Test meta description',
      keywords: data.keywords || '["test", "keywords"]',
      publishedAt: new Date(),
    },
  });
}

/**
 * Create a test chat session with messages
 */
export async function createTestChatSession(userId: string, messages: Array<{
  role: string;
  content: string;
}>) {
  const db = getTestDb();
  const session = await db.chatSession.create({
    data: {
      userId,
    },
  });

  for (const msg of messages) {
    await db.message.create({
      data: {
        sessionId: session.id,
        role: msg.role,
        content: msg.content,
      },
    });
  }

  return session;
}

/**
 * Create a test usage log entry
 */
export async function createTestUsageLog(data: {
  apiKeyId: string;
  tokensUsed?: number;
  requestDuration: number;
}) {
  const db = getTestDb();
  return db.usageLog.create({
    data: {
      apiKeyId: data.apiKeyId,
      tokensUsed: data.tokensUsed,
      requestDuration: data.requestDuration,
    },
  });
}

/**
 * Mock NextAuth session for testing
 */
export function mockSession(type: 'user' | 'admin', data?: any) {
  if (type === 'user') {
    return {
      user: {
        id: data?.id || 'test-user-id',
        email: data?.email || 'test@example.com',
        name: data?.name || 'Test User',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
  } else {
    return {
      user: {
        id: data?.id || 'test-admin-id',
        username: data?.username || 'admin',
        role: 'admin',
      },
      expires: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
  }
}

/**
 * Wait for a condition to be true (useful for async operations)
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}
