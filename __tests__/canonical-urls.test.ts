/**
 * Canonical URL Tests
 * 
 * Tests for canonical URL generation and implementation across all public pages.
 * 
 * Requirements: 19.8, 6.12
 */

import { describe, it, expect } from 'vitest';
import {
  generateCanonicalUrl,
  getLandingPageCanonicalUrl,
  getBlogListCanonicalUrl,
  getBlogPostCanonicalUrl,
  getChatPageCanonicalUrl,
} from '@/lib/seo/canonical';

describe('Canonical URL Utility', () => {
  const PRODUCTION_DOMAIN = 'https://ai.futurelinks.art';

  describe('generateCanonicalUrl', () => {
    it('should generate canonical URL for root path', () => {
      expect(generateCanonicalUrl('/')).toBe(`${PRODUCTION_DOMAIN}/`);
    });

    it('should generate canonical URL for path with leading slash', () => {
      expect(generateCanonicalUrl('/blog')).toBe(`${PRODUCTION_DOMAIN}/blog`);
    });

    it('should generate canonical URL for path without leading slash', () => {
      expect(generateCanonicalUrl('blog')).toBe(`${PRODUCTION_DOMAIN}/blog`);
    });

    it('should remove trailing slash from non-root paths', () => {
      expect(generateCanonicalUrl('/blog/')).toBe(`${PRODUCTION_DOMAIN}/blog`);
      expect(generateCanonicalUrl('/blog/my-post/')).toBe(`${PRODUCTION_DOMAIN}/blog/my-post`);
    });

    it('should preserve root path trailing slash', () => {
      expect(generateCanonicalUrl('/')).toBe(`${PRODUCTION_DOMAIN}/`);
    });

    it('should handle nested paths', () => {
      expect(generateCanonicalUrl('/blog/my-post')).toBe(`${PRODUCTION_DOMAIN}/blog/my-post`);
    });
  });

  describe('Page-specific canonical URL functions', () => {
    it('should generate landing page canonical URL', () => {
      expect(getLandingPageCanonicalUrl()).toBe(`${PRODUCTION_DOMAIN}/`);
    });

    it('should generate blog list canonical URL', () => {
      expect(getBlogListCanonicalUrl()).toBe(`${PRODUCTION_DOMAIN}/blog`);
    });

    it('should generate blog post canonical URL', () => {
      expect(getBlogPostCanonicalUrl('my-first-post')).toBe(
        `${PRODUCTION_DOMAIN}/blog/my-first-post`
      );
      expect(getBlogPostCanonicalUrl('ai-workspace-guide')).toBe(
        `${PRODUCTION_DOMAIN}/blog/ai-workspace-guide`
      );
    });

    it('should generate chat page canonical URL', () => {
      expect(getChatPageCanonicalUrl()).toBe(`${PRODUCTION_DOMAIN}/chat`);
    });
  });

  describe('Canonical URL format validation', () => {
    it('should always use HTTPS protocol', () => {
      const urls = [
        getLandingPageCanonicalUrl(),
        getBlogListCanonicalUrl(),
        getBlogPostCanonicalUrl('test'),
        getChatPageCanonicalUrl(),
      ];

      urls.forEach((url) => {
        expect(url).toMatch(/^https:\/\//);
      });
    });

    it('should always use production domain', () => {
      const urls = [
        getLandingPageCanonicalUrl(),
        getBlogListCanonicalUrl(),
        getBlogPostCanonicalUrl('test'),
        getChatPageCanonicalUrl(),
      ];

      urls.forEach((url) => {
        expect(url).toContain('ai.futurelinks.art');
      });
    });

    it('should not have double slashes in path', () => {
      const urls = [
        generateCanonicalUrl('/blog'),
        generateCanonicalUrl('//blog'),
        getBlogPostCanonicalUrl('test'),
      ];

      urls.forEach((url) => {
        // Should not have // except after protocol
        expect(url.replace('https://', '')).not.toContain('//');
      });
    });
  });
});
