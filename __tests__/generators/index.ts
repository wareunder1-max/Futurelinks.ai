import * as fc from 'fast-check';

/**
 * Generator for API provider names
 */
export const apiProviderGenerator = fc.constantFrom('openai', 'gemini', 'anthropic');

/**
 * Generator for API keys (realistic format)
 */
export const apiKeyGenerator = fc.record({
  provider: apiProviderGenerator,
  keyValue: fc.string({ minLength: 20, maxLength: 100 }),
});

/**
 * Generator for user credentials
 */
export const userCredentialsGenerator = fc.record({
  email: fc.emailAddress(),
  password: fc.string({ minLength: 8, maxLength: 50 }),
  name: fc.option(fc.string({ minLength: 2, maxLength: 50 })),
});

/**
 * Generator for admin credentials
 */
export const adminCredentialsGenerator = fc.record({
  username: fc.string({ minLength: 3, maxLength: 30 }),
  password: fc.string({ minLength: 8, maxLength: 50 }),
});

/**
 * Generator for blog post slugs (URL-safe)
 */
export const slugGenerator = fc
  .string({ minLength: 5, maxLength: 50 })
  .map(s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));

/**
 * Generator for blog posts
 */
export const blogPostGenerator = fc.record({
  title: fc.string({ minLength: 10, maxLength: 100 }),
  slug: slugGenerator,
  excerpt: fc.string({ minLength: 50, maxLength: 200 }),
  content: fc.string({ minLength: 100, maxLength: 5000 }),
  metaDescription: fc.string({ minLength: 150, maxLength: 160 }),
  keywords: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 3, maxLength: 10 }),
  author: fc.string({ minLength: 3, maxLength: 50 }),
  featuredImage: fc.option(fc.webUrl()),
});

/**
 * Generator for chat messages
 */
export const messageGenerator = fc.record({
  role: fc.constantFrom('user', 'assistant'),
  content: fc.string({ minLength: 1, maxLength: 1000 }),
});

/**
 * Generator for usage metrics
 */
export const usageMetricsGenerator = fc.record({
  tokensUsed: fc.option(fc.integer({ min: 1, max: 100000 })),
  requestDuration: fc.integer({ min: 100, max: 30000 }), // 100ms to 30s
});

/**
 * Generator for SEO meta tags
 */
export const metaTagsGenerator = fc.record({
  title: fc.string({ minLength: 50, maxLength: 60 }),
  description: fc.string({ minLength: 150, maxLength: 160 }),
  keywords: fc.array(fc.string({ minLength: 3, maxLength: 30 }), { minLength: 3, maxLength: 10 }),
  canonicalUrl: fc.webUrl(),
  ogImage: fc.webUrl(),
});

/**
 * Generator for JSON-LD schema types
 */
export const schemaTypeGenerator = fc.constantFrom(
  'Organization',
  'WebSite',
  'BlogPosting',
  'FAQPage',
  'BreadcrumbList'
);

/**
 * Generator for JSON-LD schemas
 */
export const jsonLdSchemaGenerator = fc.record({
  '@context': fc.constant('https://schema.org'),
  '@type': schemaTypeGenerator,
  name: fc.string({ minLength: 3, maxLength: 100 }),
  url: fc.webUrl(),
});

/**
 * Generator for FAQ items
 */
export const faqItemGenerator = fc.record({
  question: fc.string({ minLength: 10, maxLength: 200 }),
  answer: fc.string({ minLength: 20, maxLength: 500 }),
});

/**
 * Generator for image data
 */
export const imageGenerator = fc.record({
  src: fc.webUrl(),
  alt: fc.string({ minLength: 5, maxLength: 150 }),
  width: fc.integer({ min: 100, max: 3840 }),
  height: fc.integer({ min: 100, max: 2160 }),
});

/**
 * Generator for viewport sizes
 */
export const viewportGenerator = fc.record({
  width: fc.integer({ min: 320, max: 3840 }),
  height: fc.integer({ min: 568, max: 2160 }),
});

/**
 * Generator for mobile viewport sizes
 */
export const mobileViewportGenerator = fc.record({
  width: fc.integer({ min: 320, max: 767 }),
  height: fc.integer({ min: 568, max: 1024 }),
});

/**
 * Generator for tablet viewport sizes
 */
export const tabletViewportGenerator = fc.record({
  width: fc.integer({ min: 768, max: 1024 }),
  height: fc.integer({ min: 768, max: 1366 }),
});

/**
 * Generator for desktop viewport sizes
 */
export const desktopViewportGenerator = fc.record({
  width: fc.integer({ min: 1025, max: 3840 }),
  height: fc.integer({ min: 768, max: 2160 }),
});

/**
 * Generator for HTTP status codes
 */
export const httpStatusGenerator = fc.constantFrom(200, 201, 400, 401, 403, 404, 500, 503);

/**
 * Generator for error messages
 */
export const errorMessageGenerator = fc.string({ minLength: 10, maxLength: 200 });

/**
 * Generator for session tokens (JWT-like)
 */
export const sessionTokenGenerator = fc
  .string({ minLength: 100, maxLength: 200 })
  .map(s => Buffer.from(s).toString('base64'));

/**
 * Generator for timestamps
 */
export const timestampGenerator = fc.date({
  min: new Date('2024-01-01'),
  max: new Date('2026-12-31'),
});

/**
 * Generator for durations in milliseconds
 */
export const durationGenerator = fc.integer({ min: 0, max: 30000 });

/**
 * Generator for AI crawler user agents
 */
export const aiCrawlerGenerator = fc.constantFrom(
  'GPTBot',
  'Google-Extended',
  'ClaudeBot',
  'CCBot',
  'anthropic-ai'
);

/**
 * Generator for page paths
 */
export const pagePathGenerator = fc.constantFrom(
  '/',
  '/blog',
  '/chat',
  '/admin/login',
  '/admin/keys',
  '/admin/usage',
  '/admin/admins'
);

/**
 * Generator for public page paths
 */
export const publicPagePathGenerator = fc.constantFrom('/', '/blog', '/chat');
