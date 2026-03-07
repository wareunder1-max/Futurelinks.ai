/**
 * Admin Layout Tests
 * 
 * Tests for the admin layout component including:
 * - Session protection and redirects
 * - Navigation menu rendering
 * - Logout button functionality
 * 
 * Requirements: 7.5, 7.6
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('AdminLayout', () => {
  const adminLayoutPath = join(process.cwd(), 'app', 'admin', 'layout.tsx');
  
  it('should exist at app/admin/layout.tsx', () => {
    expect(() => readFileSync(adminLayoutPath, 'utf-8')).not.toThrow();
  });

  describe('Session Protection', () => {
    it('should import auth from lib/auth-setup', () => {
      const content = readFileSync(adminLayoutPath, 'utf-8');
      expect(content).toContain("import { auth } from '@/lib/auth-setup'");
    });

    it('should import redirect from next/navigation', () => {
      const content = readFileSync(adminLayoutPath, 'utf-8');
      expect(content).toContain("import { redirect } from 'next/navigation'");
    });

    it('should check for session', () => {
      const content = readFileSync(adminLayoutPath, 'utf-8');
      expect(content).toContain('await auth()');
    });

    it('should redirect to login if no session', () => {
      const content = readFileSync(adminLayoutPath, 'utf-8');
      expect(content).toContain("redirect('/admin/login?error=unauthorized')");
    });

    it('should check for admin role', () => {
      const content = readFileSync(adminLayoutPath, 'utf-8');
      expect(content).toContain("session.user.role !== 'admin'");
    });
  });

  describe('Navigation Menu', () => {
    it('should import Link from next/link', () => {
      const content = readFileSync(adminLayoutPath, 'utf-8');
      expect(content).toContain("import Link from 'next/link'");
    });

    it('should have API Keys navigation link', () => {
      const content = readFileSync(adminLayoutPath, 'utf-8');
      expect(content).toContain('href="/admin/keys"');
      expect(content).toContain('API Keys');
    });

    it('should have Usage navigation link', () => {
      const content = readFileSync(adminLayoutPath, 'utf-8');
      expect(content).toContain('href="/admin/usage"');
      expect(content).toContain('Usage');
    });

    it('should have Admins navigation link', () => {
      const content = readFileSync(adminLayoutPath, 'utf-8');
      expect(content).toContain('href="/admin/admins"');
      expect(content).toContain('Admins');
    });

    it('should display user name or email', () => {
      const content = readFileSync(adminLayoutPath, 'utf-8');
      expect(content).toContain('session.user.name');
      expect(content).toContain('session.user.email');
    });
  });

  describe('Logout Button', () => {
    it('should have logout form', () => {
      const content = readFileSync(adminLayoutPath, 'utf-8');
      expect(content).toContain('action="/api/auth/signout"');
      expect(content).toContain('method="POST"');
    });

    it('should have logout button', () => {
      const content = readFileSync(adminLayoutPath, 'utf-8');
      expect(content).toContain('type="submit"');
      expect(content).toContain('Logout');
    });
  });

  describe('Session Timeout Warning', () => {
    it('should import SessionTimeoutWarning component', () => {
      const content = readFileSync(adminLayoutPath, 'utf-8');
      expect(content).toContain("import { SessionTimeoutWarning } from '@/components/admin/SessionTimeoutWarning'");
    });

    it('should render SessionTimeoutWarning component', () => {
      const content = readFileSync(adminLayoutPath, 'utf-8');
      expect(content).toContain('<SessionTimeoutWarning />');
    });
  });

  describe('Layout Structure', () => {
    it('should be a server component (no use client directive)', () => {
      const content = readFileSync(adminLayoutPath, 'utf-8');
      expect(content).not.toContain("'use client'");
    });

    it('should accept children prop', () => {
      const content = readFileSync(adminLayoutPath, 'utf-8');
      expect(content).toContain('children: React.ReactNode');
    });

    it('should render children in main content area', () => {
      const content = readFileSync(adminLayoutPath, 'utf-8');
      expect(content).toContain('{children}');
    });

    it('should display session timeout information in footer', () => {
      const content = readFileSync(adminLayoutPath, 'utf-8');
      expect(content).toContain('Session timeout: 30 minutes of inactivity');
    });

    it('should use Tailwind CSS classes', () => {
      const content = readFileSync(adminLayoutPath, 'utf-8');
      expect(content).toMatch(/className="[^"]*\b(flex|bg-|text-|border-|rounded|px-|py-)/);
    });

    it('should export default component', () => {
      const content = readFileSync(adminLayoutPath, 'utf-8');
      expect(content).toContain('export default');
    });

    it('should have requirements documentation', () => {
      const content = readFileSync(adminLayoutPath, 'utf-8');
      expect(content).toContain('Requirements: 7.5, 7.6');
    });
  });
});
