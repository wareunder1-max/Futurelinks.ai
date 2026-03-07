import { handlers } from '@/lib/auth-setup';

/**
 * NextAuth.js v5 API Route Handler
 * 
 * This route handles all NextAuth.js authentication requests:
 * - /api/auth/signin - Sign in page
 * - /api/auth/signout - Sign out
 * - /api/auth/callback/* - OAuth callbacks
 * - /api/auth/session - Get current session
 * - /api/auth/csrf - CSRF token
 * - /api/auth/providers - List available providers
 * 
 * Configuration is defined in lib/auth.config.ts
 * 
 * Supported authentication methods:
 * - Google OAuth (public users)
 * - Email magic links (public users)
 * - Username/password credentials (admin users)
 */

export const { GET, POST } = handlers;
