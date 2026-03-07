/**
 * Admin Session Management Utilities
 * 
 * Provides utilities for managing admin session timeouts and activity tracking.
 * 
 * Requirements: 14.1, 14.2, 14.3, 14.4, 14.5
 */

import { auth } from './auth-setup';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Session timeout duration in milliseconds (30 minutes)
 */
export const ADMIN_SESSION_TIMEOUT = 30 * 60 * 1000;

/**
 * Cookie name for tracking last activity timestamp
 */
const LAST_ACTIVITY_COOKIE = 'admin_last_activity';

/**
 * Validates admin session and checks for timeout
 * 
 * This function:
 * 1. Checks if user has an active session
 * 2. Verifies the user has admin role
 * 3. Checks if session has timed out due to inactivity
 * 4. Updates last activity timestamp on valid requests
 * 
 * @param request - The incoming request
 * @returns Object with isValid flag and optional redirect response
 */
export async function validateAdminSession(request: NextRequest): Promise<{
  isValid: boolean;
  response?: NextResponse;
  session?: any;
}> {
  // Get current session
  const session = await auth();

  // No session exists
  if (!session || !session.user) {
    return {
      isValid: false,
      response: NextResponse.redirect(
        new URL('/admin/login?error=unauthorized', request.url)
      ),
    };
  }

  // Check if user is admin
  if (session.user.role !== 'admin') {
    return {
      isValid: false,
      response: NextResponse.redirect(
        new URL('/admin/login?error=unauthorized', request.url)
      ),
    };
  }

  // Check for session timeout based on last activity
  const lastActivityCookie = request.cookies.get(LAST_ACTIVITY_COOKIE);
  
  if (lastActivityCookie) {
    const lastActivity = parseInt(lastActivityCookie.value, 10);
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivity;

    // Session has timed out due to inactivity
    if (timeSinceLastActivity > ADMIN_SESSION_TIMEOUT) {
      // Create redirect response with timeout notification
      const response = NextResponse.redirect(
        new URL('/admin/login?error=timeout', request.url)
      );
      
      // Clear the last activity cookie
      response.cookies.delete(LAST_ACTIVITY_COOKIE);
      
      return {
        isValid: false,
        response,
      };
    }
  }

  // Session is valid - update last activity timestamp
  const response = NextResponse.next();
  response.cookies.set(LAST_ACTIVITY_COOKIE, Date.now().toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ADMIN_SESSION_TIMEOUT / 1000, // Convert to seconds
    path: '/admin',
  });

  return {
    isValid: true,
    response,
    session,
  };
}

/**
 * Checks if a session is an admin session
 * 
 * @param session - The session object from NextAuth
 * @returns True if session belongs to an admin user
 */
export function isAdminSession(session: any): boolean {
  return session?.user?.role === 'admin';
}

/**
 * Gets the remaining time until session timeout
 * 
 * @param lastActivity - Timestamp of last activity
 * @returns Remaining time in milliseconds, or 0 if expired
 */
export function getRemainingSessionTime(lastActivity: number): number {
  const now = Date.now();
  const elapsed = now - lastActivity;
  const remaining = ADMIN_SESSION_TIMEOUT - elapsed;
  return Math.max(0, remaining);
}

/**
 * Formats remaining time as human-readable string
 * 
 * @param milliseconds - Time in milliseconds
 * @returns Formatted string like "15 minutes" or "2 minutes"
 */
export function formatRemainingTime(milliseconds: number): string {
  const minutes = Math.ceil(milliseconds / 60000);
  if (minutes <= 0) return 'expired';
  if (minutes === 1) return '1 minute';
  return `${minutes} minutes`;
}
