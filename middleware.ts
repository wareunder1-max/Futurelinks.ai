import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateAdminSession } from './lib/admin-session';

/**
 * Next.js Middleware for security headers, HTTPS enforcement, and admin session management
 * 
 * This middleware:
 * 1. Enforces HTTPS in production by redirecting HTTP requests
 * 2. Adds security headers to all responses:
 *    - Content-Security-Policy (CSP) to prevent XSS attacks
 *    - X-Frame-Options to prevent clickjacking
 *    - X-Content-Type-Options to prevent MIME sniffing
 *    - Referrer-Policy for privacy
 *    - Permissions-Policy to control browser features
 * 3. Validates admin sessions and handles timeout for admin routes
 * 4. Extends session timeout on admin user activity
 * 
 * Requirements: 13.1, 13.2, 13.7, 14.1, 14.2, 14.3, 14.4, 14.5
 */
export async function middleware(request: NextRequest) {
  const { protocol, host, pathname, search } = request.nextUrl;

  // Admin Session Validation
  // Check if this is an admin route (excluding login page)
  const isAdminRoute = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');
  
  if (isAdminRoute) {
    const validation = await validateAdminSession(request);
    
    // If session is invalid or timed out, return the redirect response
    if (!validation.isValid && validation.response) {
      return validation.response;
    }
    
    // If session is valid, use the response with updated activity cookie
    if (validation.isValid && validation.response) {
      // Continue with security headers on the validated response
      const response = validation.response;
      addSecurityHeaders(response, protocol, host, pathname, search);
      return response;
    }
  }

  // HTTPS Redirect Logic (Production Only)
  // In production, redirect HTTP to HTTPS
  // Skip in development (localhost) and when already using HTTPS
  const isProduction = process.env.NODE_ENV === 'production';
  const isHttps = protocol === 'https:';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

  if (isProduction && !isHttps && !isLocalhost) {
    const httpsUrl = `https://${host}${pathname}${search}`;
    return NextResponse.redirect(httpsUrl, 301); // Permanent redirect
  }

  // Continue with the request
  const response = NextResponse.next();

  // Add security headers
  addSecurityHeaders(response, protocol, host, pathname, search);

  return response;
}

/**
 * Adds security headers to a response
 * 
 * @param response - The NextResponse to add headers to
 * @param protocol - Request protocol
 * @param host - Request host
 * @param pathname - Request pathname
 * @param search - Request search params
 */
function addSecurityHeaders(
  response: NextResponse,
  protocol: string,
  host: string,
  pathname: string,
  search: string
) {
  const isProduction = process.env.NODE_ENV === 'production';
  const isHttps = protocol === 'https:';

  // Security Headers
  
  // Content Security Policy (CSP)
  // Restricts sources for scripts, styles, images, etc. to prevent XSS
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval and unsafe-inline
    "style-src 'self' 'unsafe-inline'", // Tailwind and Next.js require unsafe-inline
    "img-src 'self' data: https:", // Allow images from self, data URIs, and HTTPS sources
    "font-src 'self' data:",
    "connect-src 'self' https://api.openai.com https://generativelanguage.googleapis.com https://api.anthropic.com", // AI provider APIs
    "frame-ancestors 'none'", // Prevent embedding in iframes (same as X-Frame-Options)
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', cspDirectives);

  // X-Frame-Options: Prevent clickjacking by disallowing iframe embedding
  response.headers.set('X-Frame-Options', 'DENY');

  // X-Content-Type-Options: Prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Referrer-Policy: Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy: Control browser features
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Strict-Transport-Security: Force HTTPS (only in production)
  if (isProduction) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
}

/**
 * Matcher configuration
 * Apply middleware to all routes except:
 * - Static files (_next/static)
 * - Image optimization (_next/image)
 * - Favicon and other public assets
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2)$).*)',
  ],
};
