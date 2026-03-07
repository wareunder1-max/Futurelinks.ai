# Testing Framework Documentation

## Overview

This project uses a comprehensive testing framework with:
- **Vitest** as the test runner
- **React Testing Library** for component testing
- **fast-check** for property-based testing
- **In-memory SQLite** for test database

## Test Structure

```
__tests__/
├── setup/              # Test setup and utilities
│   ├── test-db.ts      # Test database configuration
│   └── test-helpers.ts # Helper functions for tests
├── generators/         # fast-check generators
│   └── index.ts        # Domain-specific generators
├── unit/              # Unit tests (future)
├── property/          # Property-based tests (future)
├── integration/       # Integration tests (future)
└── *.test.ts(x)       # Current test files
```

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Database

The test database uses the configured Vercel Postgres database. For isolated testing, you should:
1. Use a separate test database (set TEST_DATABASE_URL in .env.test)
2. Or use transactions that rollback after each test
3. Or clean up test data after each test (current approach)

**Note**: For production-grade testing, consider setting up a dedicated test database or using SQLite for unit tests.

### Setup Functions

```typescript
import { getTestDb, setupTestDb, cleanupTestDb, disconnectTestDb } from './__tests__/setup/test-db';

// Get database instance
const db = getTestDb();

// Clean up all data (runs automatically before each test)
await cleanupTestDb();

// Disconnect (runs automatically after all tests)
await disconnectTestDb();
```

## Test Helpers

Helper functions for creating test data:

```typescript
import {
  createTestUser,
  createTestAdmin,
  createTestAPIKey,
  createTestBlogPost,
  createTestChatSession,
  createTestUsageLog,
  mockSession,
  waitFor,
} from './__tests__/setup/test-helpers';

// Create test user
const user = await createTestUser({
  email: 'test@example.com',
  name: 'Test User',
});

// Create test admin
const admin = await createTestAdmin({
  username: 'admin',
  password: 'password123',
});

// Mock session
const session = mockSession('user', { email: 'test@example.com' });
```

## Property-Based Testing

Use fast-check generators for property-based tests:

```typescript
import * as fc from 'fast-check';
import {
  apiKeyGenerator,
  userCredentialsGenerator,
  blogPostGenerator,
  messageGenerator,
  metaTagsGenerator,
} from './__tests__/generators';

// Example property test
test('any valid API key can be encrypted and decrypted', async () => {
  await fc.assert(
    fc.asyncProperty(apiKeyGenerator, async (apiKey) => {
      const encrypted = await encryptAPIKey(apiKey.keyValue);
      const decrypted = await decryptAPIKey(encrypted);
      expect(decrypted).toBe(apiKey.keyValue);
    }),
    { numRuns: 100 }
  );
});
```

## Available Generators

- `apiProviderGenerator` - API provider names (openai, gemini, anthropic)
- `apiKeyGenerator` - Complete API key objects
- `userCredentialsGenerator` - User credentials with email/password
- `adminCredentialsGenerator` - Admin credentials with username/password
- `blogPostGenerator` - Complete blog post data
- `messageGenerator` - Chat messages
- `usageMetricsGenerator` - Usage metrics data
- `metaTagsGenerator` - SEO meta tags
- `jsonLdSchemaGenerator` - JSON-LD schema objects
- `faqItemGenerator` - FAQ question/answer pairs
- `imageGenerator` - Image data with dimensions
- `viewportGenerator` - Viewport sizes (all devices)
- `mobileViewportGenerator` - Mobile viewport sizes
- `tabletViewportGenerator` - Tablet viewport sizes
- `desktopViewportGenerator` - Desktop viewport sizes
- `aiCrawlerGenerator` - AI crawler user agents
- `pagePathGenerator` - Page paths
- `publicPagePathGenerator` - Public page paths only

## Writing Tests

### Unit Tests

```typescript
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Component', () => {
  test('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Property-Based Tests

```typescript
import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';

describe('Property: Feature Name', () => {
  test('property description', async () => {
    await fc.assert(
      fc.asyncProperty(
        generator,
        async (input) => {
          // Test logic
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Tests

```typescript
import { describe, test, expect, beforeEach } from 'vitest';
import { createTestUser, createTestAPIKey } from './__tests__/setup/test-helpers';

describe('Integration: Feature Flow', () => {
  beforeEach(async () => {
    // Setup test data
  });

  test('complete flow works', async () => {
    // Test complete user flow
  });
});
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Database is automatically cleaned before each test
3. **Generators**: Use fast-check generators for property-based tests
4. **Helpers**: Use test helpers to create consistent test data
5. **Naming**: Use descriptive test names that explain what is being tested
6. **Coverage**: Aim for >80% code coverage
7. **Property Tests**: Run at least 100 iterations per property test
8. **Comments**: Include property numbers and requirement references in property tests

## Property Test Format

Each property test should include a comment with:
- Feature name
- Property number
- Property description
- Requirements validated

Example:
```typescript
// Feature: ai-api-management-dashboard
// Property 1: Successful Authentication Creates Session
// Validates: Requirements 2.3, 2.4
test('successful authentication creates session and redirects', async () => {
  // Test implementation
});
```

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:
1. Ensure Prisma schema is up to date: `npm run db:push`
2. Check that DATABASE_URL is set correctly
3. Try cleaning node_modules and reinstalling

### Test Timeouts

If tests timeout:
1. Increase timeout in vitest.config.ts
2. Check for unresolved promises
3. Ensure database cleanup is working

### Fast-check Failures

If property tests fail:
1. Check the seed value in the error message
2. Reproduce with: `fc.assert(..., { seed: <seed> })`
3. Use shrinking to find minimal failing case
4. Fix the implementation or adjust the property
