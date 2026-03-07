'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

/**
 * AuthProvider Component
 * 
 * Wraps NextAuth.js SessionProvider to provide client-side session access
 * throughout the application. This component must be a client component
 * and should be added to the root layout.
 * 
 * Features:
 * - Provides session context to all child components
 * - Enables useSession() hook in client components
 * - Handles session state management and updates
 * 
 * Usage:
 * ```tsx
 * <AuthProvider>
 *   <YourApp />
 * </AuthProvider>
 * ```
 * 
 * Requirements: 2.6
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
