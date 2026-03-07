import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '../middleware';

// Mock the admin-session module
vi.mock('../lib/admin-session', () => ({
  validateAdminSession: vi.fn(async () => ({
    isValid: true,
    response: null,
  })),
}));

describe('Security Headers Middleware', () => {
  describe('Security Headers', () => {
    it('should add Content-Security-Policy header', async () => {
      const request = new NextRequest('http://localhost:3000/');
      const response = await middleware(request);

      const csp = response.headers.get('Content-Security-Policy');
      expect(csp).toBeDefined();
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
    });

    it('should add X-Frame-Options header', async () => {
      const request = new NextRequest('http://localhost:3000/');
      const response = await middleware(request);

      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('should add X-Content-Type-Options header', async () => {
      const request = new NextRequest('http://localhost:3000/');
      const response = await middleware(request);

      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });

    it('should add Referrer-Policy header', async () => {
      const request = new NextRequest('http://localhost:3000/');
      const response = await middleware(request);

      expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    });

    it('should add Permissions-Policy header', async () => {
      const request = new NextRequest('http://localhost:3000/');
      const response = await middleware(request);

      const permissionsPolicy = response.headers.get('Permissions-Policy');
      expect(permissionsPolicy).toBeDefined();
      expect(permissionsPolicy).toContain('camera=()');
      expect(permissionsPolicy).toContain('microphone=()');
    });

    it('should add all required security headers to any response', async () => {
      const request = new NextRequest('http://localhost:3000/some/path');
      const response = await middleware(request);

      // Verify all required headers are present
      expect(response.headers.get('Content-Security-Policy')).toBeDefined();
      expect(response.headers.get('X-Frame-Options')).toBeDefined();
      expect(response.headers.get('X-Content-Type-Options')).toBeDefined();
      expect(response.headers.get('Referrer-Policy')).toBeDefined();
      expect(response.headers.get('Permissions-Policy')).toBeDefined();
    });
  });

  describe('HTTPS Redirect', () => {
    let originalEnv: string | undefined;

    beforeEach(() => {
      originalEnv = process.env.NODE_ENV;
    });

    it('should redirect HTTP to HTTPS in production', async () => {
      process.env.NODE_ENV = 'production';
      
      const request = new NextRequest('http://example.com/test');
      const response = await middleware(request);

      expect(response.status).toBe(301);
      expect(response.headers.get('location')).toBe('https://example.com/test');
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should not redirect HTTPS requests in production', async () => {
      process.env.NODE_ENV = 'production';
      
      const request = new NextRequest('https://example.com/test');
      const response = await middleware(request);

      expect(response.status).not.toBe(301);
      expect(response.headers.get('location')).toBeNull();
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should not redirect localhost in production', async () => {
      process.env.NODE_ENV = 'production';
      
      const request = new NextRequest('http://localhost:3000/test');
      const response = await middleware(request);

      expect(response.status).not.toBe(301);
      expect(response.headers.get('location')).toBeNull();
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should not redirect in development', async () => {
      process.env.NODE_ENV = 'development';
      
      const request = new NextRequest('http://example.com/test');
      const response = await middleware(request);

      expect(response.status).not.toBe(301);
      expect(response.headers.get('location')).toBeNull();
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should preserve query parameters in redirect', async () => {
      process.env.NODE_ENV = 'production';
      
      const request = new NextRequest('http://example.com/test?foo=bar&baz=qux');
      const response = await middleware(request);

      expect(response.status).toBe(301);
      expect(response.headers.get('location')).toBe('https://example.com/test?foo=bar&baz=qux');
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('HSTS Header', () => {
    let originalEnv: string | undefined;

    beforeEach(() => {
      originalEnv = process.env.NODE_ENV;
    });

    it('should add Strict-Transport-Security header in production', async () => {
      process.env.NODE_ENV = 'production';
      
      const request = new NextRequest('https://example.com/');
      const response = await middleware(request);

      const hsts = response.headers.get('Strict-Transport-Security');
      expect(hsts).toBeDefined();
      expect(hsts).toContain('max-age=31536000');
      expect(hsts).toContain('includeSubDomains');
      expect(hsts).toContain('preload');
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should not add Strict-Transport-Security header in development', async () => {
      process.env.NODE_ENV = 'development';
      
      const request = new NextRequest('http://localhost:3000/');
      const response = await middleware(request);

      expect(response.headers.get('Strict-Transport-Security')).toBeNull();
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('CSP AI Provider Connections', () => {
    it('should allow connections to AI provider APIs', async () => {
      const request = new NextRequest('http://localhost:3000/');
      const response = await middleware(request);

      const csp = response.headers.get('Content-Security-Policy');
      expect(csp).toContain('https://api.openai.com');
      expect(csp).toContain('https://generativelanguage.googleapis.com');
      expect(csp).toContain('https://api.anthropic.com');
    });
  });
});
