/**
 * Canonical URL Integration Tests
 * 
 * Tests to verify that canonical URLs are properly rendered in page metadata.
 * 
 * Requirements: 19.8, 6.12
 */

import { describe, it, expect } from 'vitest';

describe('Canonical URL Integration', () => {
  describe('Landing Page', () => {
    it('should export metadata with canonical URL', async () => {
      // Import the metadata from the landing page
      const { metadata } = await import('@/app/page');
      
      expect(metadata).toBeDefined();
      expect(metadata.alternates).toBeDefined();
      expect(metadata.alternates?.canonical).toBe('https://ai.futurelinks.art/');
    });

    it('should have canonical URL in Open Graph metadata', async () => {
      const { metadata } = await import('@/app/page');
      
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.url).toBe('https://ai.futurelinks.art/');
    });

    it('should have complete SEO metadata', async () => {
      const { metadata } = await import('@/app/page');
      
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
      expect(metadata.keywords).toBeDefined();
    });
  });

  describe('Blog List Page', () => {
    it('should export metadata with canonical URL', async () => {
      const { metadata } = await import('@/app/blog/page');
      
      expect(metadata).toBeDefined();
      expect(metadata.alternates).toBeDefined();
      expect(metadata.alternates?.canonical).toBe('https://ai.futurelinks.art/blog');
    });

    it('should have canonical URL in Open Graph metadata', async () => {
      const { metadata } = await import('@/app/blog/page');
      
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.url).toBe('https://ai.futurelinks.art/blog');
    });

    it('should have complete SEO metadata', async () => {
      const { metadata } = await import('@/app/blog/page');
      
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
      expect(metadata.keywords).toBeDefined();
    });
  });

  describe('Canonical URL Format', () => {
    it('should use HTTPS protocol for all pages', async () => {
      const pages = [
        await import('@/app/page'),
        await import('@/app/blog/page'),
      ];

      pages.forEach((page) => {
        const canonical = page.metadata?.alternates?.canonical;
        expect(canonical).toMatch(/^https:\/\//);
      });
    });

    it('should use production domain for all pages', async () => {
      const pages = [
        await import('@/app/page'),
        await import('@/app/blog/page'),
      ];

      pages.forEach((page) => {
        const canonical = page.metadata?.alternates?.canonical;
        expect(canonical).toContain('ai.futurelinks.art');
      });
    });

    it('should not have trailing slashes except for root', async () => {
      const blogMetadata = (await import('@/app/blog/page')).metadata;

      expect(blogMetadata?.alternates?.canonical).not.toMatch(/\/$/);
    });

    it('should have trailing slash for root path', async () => {
      const homeMetadata = (await import('@/app/page')).metadata;
      
      expect(homeMetadata?.alternates?.canonical).toBe('https://ai.futurelinks.art/');
    });
  });
});
