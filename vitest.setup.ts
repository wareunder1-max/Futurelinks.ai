import '@testing-library/jest-dom/vitest';
import { beforeEach, afterAll } from 'vitest';

// Set up test environment variables
process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

// Note: Database cleanup is available but not automatically run
// Import and use cleanupTestDb() manually in tests that need it
// This prevents database connection errors for tests that don't use the database

// Example usage in tests:
// import { cleanupTestDb } from './__tests__/setup/test-db';
// beforeEach(async () => {
//   await cleanupTestDb();
// });
