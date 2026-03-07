/**
 * Admin Login Page Integration Tests
 * 
 * Verifies the admin login page exists and has correct structure
 * Requirements: 7.1, 7.2, 7.4
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Admin Login Page', () => {
  const adminLoginPagePath = join(process.cwd(), 'app', 'admin', 'login', 'page.tsx');
  
  it('should exist at app/admin/login/page.tsx', () => {
    expect(() => readFileSync(adminLoginPagePath, 'utf-8')).not.toThrow();
  });

  it('should be a client component', () => {
    const content = readFileSync(adminLoginPagePath, 'utf-8');
    expect(content).toContain("'use client'");
  });

  it('should import signIn from next-auth/react', () => {
    const content = readFileSync(adminLoginPagePath, 'utf-8');
    expect(content).toContain("import { signIn } from 'next-auth/react'");
  });

  it('should import useRouter from next/navigation', () => {
    const content = readFileSync(adminLoginPagePath, 'utf-8');
    expect(content).toContain("import { useRouter");
    expect(content).toContain("from 'next/navigation'");
  });

  it('should have username input field', () => {
    const content = readFileSync(adminLoginPagePath, 'utf-8');
    expect(content).toContain('id="username"');
    expect(content).toContain('type="text"');
  });

  it('should have password input field', () => {
    const content = readFileSync(adminLoginPagePath, 'utf-8');
    expect(content).toContain('id="password"');
    expect(content).toContain('type="password"');
  });

  it('should call signIn with admin-credentials provider', () => {
    const content = readFileSync(adminLoginPagePath, 'utf-8');
    expect(content).toContain("signIn('admin-credentials'");
  });

  it('should redirect to /admin/keys on success', () => {
    const content = readFileSync(adminLoginPagePath, 'utf-8');
    expect(content).toContain("router.push('/admin/keys')");
  });

  it('should have error state handling', () => {
    const content = readFileSync(adminLoginPagePath, 'utf-8');
    expect(content).toContain('error');
    expect(content).toContain('setError');
  });

  it('should have loading state', () => {
    const content = readFileSync(adminLoginPagePath, 'utf-8');
    expect(content).toContain('isLoading');
    expect(content).toContain('setIsLoading');
  });

  it('should use Tailwind CSS classes', () => {
    const content = readFileSync(adminLoginPagePath, 'utf-8');
    expect(content).toMatch(/className="[^"]*\b(flex|bg-|text-|border-|rounded|px-|py-)/);
  });

  it('should have form submit handler', () => {
    const content = readFileSync(adminLoginPagePath, 'utf-8');
    expect(content).toContain('handleSubmit');
    expect(content).toContain('onSubmit');
  });

  it('should validate username is not empty', () => {
    const content = readFileSync(adminLoginPagePath, 'utf-8');
    expect(content).toContain('username.trim()');
  });

  it('should validate password is not empty', () => {
    const content = readFileSync(adminLoginPagePath, 'utf-8');
    expect(content).toMatch(/if\s*\(\s*!password/);
  });

  it('should handle session timeout error from URL params', () => {
    const content = readFileSync(adminLoginPagePath, 'utf-8');
    expect(content).toContain('timeout');
    expect(content).toContain('session has expired');
  });

  it('should have Admin Login heading', () => {
    const content = readFileSync(adminLoginPagePath, 'utf-8');
    expect(content).toContain('Admin Login');
  });

  it('should export default component', () => {
    const content = readFileSync(adminLoginPagePath, 'utf-8');
    expect(content).toContain('export default');
  });

  it('should have requirements documentation', () => {
    const content = readFileSync(adminLoginPagePath, 'utf-8');
    expect(content).toContain('Requirements: 7.1, 7.2, 7.4');
  });
});
