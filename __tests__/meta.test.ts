/**
 * Unit tests for meta tag generator utility
 * Tests requirements 6.2, 6.3, 6.4, 6.5, 6.6
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateMetaTags,
  generateOpenGraphTags,
  generateTwitterCardTags,
  validateTitle,
  validateDescription,
  type MetaTagsConfig
} from '../lib/seo/meta';

describe('Meta Tag Generator', () => {
  describe('validateTitle', () => {
    it('should validate optimal title length (50-60 chars)', () => {
      const result = validateTitle('This is a perfect title with exactly 55 characters!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should warn when title is too short', () => {
      const result = validateTitle('Short title');
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('recommended: 50-60');
    });

    it('should warn when title is too long', () => {
      const result = validateTitle('This is a very long title that exceeds the recommended 60 character limit for SEO');
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('recommended: 50-60');
    });

    it('should error on empty title', () => {
      const result = validateTitle('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('cannot be empty');
    });

    it('should error on whitespace-only title', () => {
      const result = validateTitle('   ');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('validateDescription', () => {
    it('should validate optimal description length (150-160 chars)', () => {
      const desc = 'This is a perfect meta description that falls within the optimal range of 150 to 160 characters for search engine optimization and excellent user engagement.';
      const result = validateDescription(desc);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should warn when description is too short', () => {
      const result = validateDescription('Short description');
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('recommended: 150-160');
    });

    it('should warn when description is too long', () => {
      const desc = 'This is a very long meta description that significantly exceeds the recommended 160 character limit for search engine optimization, which may result in truncation in search results.';
      const result = validateDescription(desc);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0]).toContain('recommended: 150-160');
    });

    it('should error on empty description', () => {
      const result = validateDescription('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('cannot be empty');
    });
  });

  describe('generateMetaTags', () => {
    const validConfig: MetaTagsConfig = {
      title: 'AI FutureLinks - Model-Agnostic AI Workspace Platform',
      description: 'Toggle between OpenAI and Google Gemini in a single click. Watch your ideas come to life with real-time artifacts and integrated serverless storage.',
      keywords: ['AI workspace', 'multi-model AI', 'OpenAI', 'Google Gemini'],
      ogImage: 'https://ai.futurelinks.art/og-image.png',
      canonicalUrl: 'https://ai.futurelinks.art',
      type: 'website'
    };

    it('should generate complete meta tags with all fields', () => {
      const result = generateMetaTags(validConfig);
      
      expect(result.title).toBe(validConfig.title);
      expect(result.description).toBe(validConfig.description);
      expect(result.keywords).toBe('AI workspace, multi-model AI, OpenAI, Google Gemini');
      expect(result.openGraph).toBeDefined();
      expect(result.twitter).toBeDefined();
      expect(result.alternates.canonical).toBe(validConfig.canonicalUrl);
    });

    it('should throw error for invalid title', () => {
      const invalidConfig = { ...validConfig, title: '' };
      expect(() => generateMetaTags(invalidConfig)).toThrow('Meta tag validation failed');
    });

    it('should throw error for invalid description', () => {
      const invalidConfig = { ...validConfig, description: '' };
      expect(() => generateMetaTags(invalidConfig)).toThrow('Meta tag validation failed');
    });

    it('should handle optional keywords', () => {
      const configWithoutKeywords = { ...validConfig, keywords: undefined };
      const result = generateMetaTags(configWithoutKeywords);
      expect(result.keywords).toBeUndefined();
    });

    it('should log warnings in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const shortConfig = {
        ...validConfig,
        title: 'Short',
        description: 'Also short'
      };
      
      generateMetaTags(shortConfig);
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('should not log warnings in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const shortConfig = {
        ...validConfig,
        title: 'Short',
        description: 'Also short'
      };
      
      generateMetaTags(shortConfig);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('generateOpenGraphTags', () => {
    const config: MetaTagsConfig = {
      title: 'AI FutureLinks - Model-Agnostic AI Workspace Platform',
      description: 'Toggle between OpenAI and Google Gemini in a single click. Watch your ideas come to life with real-time artifacts and integrated serverless storage.',
      canonicalUrl: 'https://ai.futurelinks.art',
      ogImage: 'https://ai.futurelinks.art/og-image.png',
      type: 'article'
    };

    it('should generate all required Open Graph tags (Requirement 6.5)', () => {
      const result = generateOpenGraphTags(config);
      
      expect(result.title).toBe(config.title);
      expect(result.description).toBe(config.description);
      expect(result.url).toBe(config.canonicalUrl);
      expect(result.type).toBe('article');
      expect(result.images).toHaveLength(1);
    });

    it('should include og:image with proper dimensions', () => {
      const result = generateOpenGraphTags(config);
      
      expect(result.images[0].url).toBe(config.ogImage);
      expect(result.images[0].width).toBe(1200);
      expect(result.images[0].height).toBe(630);
      expect(result.images[0].alt).toBe(config.title);
    });

    it('should default to website type if not specified', () => {
      const configWithoutType = { ...config, type: undefined };
      const result = generateOpenGraphTags(configWithoutType);
      expect(result.type).toBe('website');
    });

    it('should use default image if ogImage not provided', () => {
      const configWithoutImage = { ...config, ogImage: undefined };
      const result = generateOpenGraphTags(configWithoutImage);
      expect(result.images[0].url).toBe('https://ai.futurelinks.art/og-default.png');
    });
  });

  describe('generateTwitterCardTags', () => {
    const config: MetaTagsConfig = {
      title: 'AI FutureLinks - Model-Agnostic AI Workspace Platform',
      description: 'Toggle between OpenAI and Google Gemini in a single click. Watch your ideas come to life with real-time artifacts and integrated serverless storage.',
      canonicalUrl: 'https://ai.futurelinks.art',
      ogImage: 'https://ai.futurelinks.art/twitter-card.png'
    };

    it('should generate all required Twitter Card tags (Requirement 6.6)', () => {
      const result = generateTwitterCardTags(config);
      
      expect(result.card).toBe('summary_large_image');
      expect(result.title).toBe(config.title);
      expect(result.description).toBe(config.description);
      expect(result.images).toHaveLength(1);
      expect(result.images[0]).toBe(config.ogImage);
    });

    it('should use default image if ogImage not provided', () => {
      const configWithoutImage = { ...config, ogImage: undefined };
      const result = generateTwitterCardTags(configWithoutImage);
      expect(result.images[0]).toBe('https://ai.futurelinks.art/og-default.png');
    });

    it('should always use summary_large_image card type', () => {
      const result = generateTwitterCardTags(config);
      expect(result.card).toBe('summary_large_image');
    });
  });

  describe('Edge cases', () => {
    it('should handle title at exactly 50 characters', () => {
      const title = '12345678901234567890123456789012345678901234567890'; // 50 chars
      const result = validateTitle(title);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle title at exactly 60 characters', () => {
      const title = '123456789012345678901234567890123456789012345678901234567890'; // 60 chars
      const result = validateTitle(title);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle description at exactly 150 characters', () => {
      const desc = '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'; // 150 chars
      const result = validateDescription(desc);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle description at exactly 160 characters', () => {
      const desc = '1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'; // 160 chars
      const result = validateDescription(desc);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle empty keywords array', () => {
      const config: MetaTagsConfig = {
        title: 'AI FutureLinks - Model-Agnostic AI Workspace Platform',
        description: 'Toggle between OpenAI and Google Gemini in a single click. Watch your ideas come to life with real-time artifacts and integrated serverless storage.',
        keywords: [],
        canonicalUrl: 'https://ai.futurelinks.art'
      };
      const result = generateMetaTags(config);
      expect(result.keywords).toBe('');
    });

    it('should handle special characters in title and description', () => {
      const config: MetaTagsConfig = {
        title: 'AI & ML: "The Future" of Tech (2024) - FutureLinks!',
        description: 'Explore AI & machine learning with quotes "like this" and special chars: @#$%. Learn how to build the future of technology with our platform today!',
        canonicalUrl: 'https://ai.futurelinks.art'
      };
      const result = generateMetaTags(config);
      expect(result.title).toContain('&');
      expect(result.description).toContain('"');
    });
  });
});
