/**
 * Unit tests for Schema.org generator functions
 * 
 * These tests verify that the schema generators produce valid
 * Schema.org structured data with all required properties.
 */

import { describe, it, expect } from 'vitest';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateBlogPostingSchema,
  generateBreadcrumbListSchema,
  generateFAQPageSchema,
} from '@/lib/seo/schemas';

describe('Schema.org Generators', () => {
  describe('generateOrganizationSchema', () => {
    it('should generate basic organization schema with required fields', () => {
      const schema = generateOrganizationSchema({
        name: 'AI FutureLinks',
        url: 'https://ai.futurelinks.art',
      });

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Organization');
      expect(schema.name).toBe('AI FutureLinks');
      expect(schema.url).toBe('https://ai.futurelinks.art');
    });

    it('should include optional logo and description', () => {
      const schema = generateOrganizationSchema({
        name: 'AI FutureLinks',
        url: 'https://ai.futurelinks.art',
        logo: 'https://ai.futurelinks.art/logo.png',
        description: 'Model-agnostic AI workspace',
      });

      expect(schema.logo).toBe('https://ai.futurelinks.art/logo.png');
      expect(schema.description).toBe('Model-agnostic AI workspace');
    });

    it('should include social media profiles when provided', () => {
      const schema = generateOrganizationSchema({
        name: 'AI FutureLinks',
        url: 'https://ai.futurelinks.art',
        sameAs: [
          'https://twitter.com/aifuturelinks',
          'https://linkedin.com/company/aifuturelinks',
        ],
      });

      expect(schema.sameAs).toHaveLength(2);
      expect(schema.sameAs).toContain('https://twitter.com/aifuturelinks');
    });

    it('should include contact point when provided', () => {
      const schema = generateOrganizationSchema({
        name: 'AI FutureLinks',
        url: 'https://ai.futurelinks.art',
        contactPoint: {
          telephone: '+1-555-0123',
          contactType: 'customer service',
          email: 'support@futurelinks.art',
        },
      });

      expect(schema.contactPoint).toBeDefined();
      expect(schema.contactPoint?.['@type']).toBe('ContactPoint');
      expect(schema.contactPoint?.telephone).toBe('+1-555-0123');
    });
  });

  describe('generateWebSiteSchema', () => {
    it('should generate basic website schema with required fields', () => {
      const schema = generateWebSiteSchema({
        name: 'AI FutureLinks',
        url: 'https://ai.futurelinks.art',
      });

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('WebSite');
      expect(schema.name).toBe('AI FutureLinks');
      expect(schema.url).toBe('https://ai.futurelinks.art');
    });

    it('should include search action when searchUrl provided', () => {
      const schema = generateWebSiteSchema({
        name: 'AI FutureLinks',
        url: 'https://ai.futurelinks.art',
        searchUrl: 'https://ai.futurelinks.art/search?q={search_term_string}',
      });

      expect(schema.potentialAction).toBeDefined();
      expect(schema.potentialAction?.['@type']).toBe('SearchAction');
      expect(schema.potentialAction?.target).toBe(
        'https://ai.futurelinks.art/search?q={search_term_string}'
      );
      expect(schema.potentialAction?.['query-input']).toBe(
        'required name=search_term_string'
      );
    });

    it('should include description when provided', () => {
      const schema = generateWebSiteSchema({
        name: 'AI FutureLinks',
        url: 'https://ai.futurelinks.art',
        description: 'The evolution of the interface',
      });

      expect(schema.description).toBe('The evolution of the interface');
    });
  });

  describe('generateBlogPostingSchema', () => {
    it('should generate blog posting schema with required fields', () => {
      const schema = generateBlogPostingSchema({
        headline: 'Getting Started with AI',
        author: 'John Doe',
        datePublished: new Date('2024-01-15'),
        dateModified: new Date('2024-01-20'),
      });

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BlogPosting');
      expect(schema.headline).toBe('Getting Started with AI');
      expect(schema.author).toEqual({ '@type': 'Person', name: 'John Doe' });
      expect(schema.datePublished).toBe('2024-01-15T00:00:00.000Z');
      expect(schema.dateModified).toBe('2024-01-20T00:00:00.000Z');
    });

    it('should handle author as object with url', () => {
      const schema = generateBlogPostingSchema({
        headline: 'Test Article',
        author: { name: 'Jane Smith', url: 'https://example.com/jane' },
        datePublished: '2024-01-15T00:00:00.000Z',
        dateModified: '2024-01-20T00:00:00.000Z',
      });

      expect(schema.author).toEqual({
        '@type': 'Person',
        name: 'Jane Smith',
        url: 'https://example.com/jane',
      });
    });

    it('should include optional image and articleBody', () => {
      const schema = generateBlogPostingSchema({
        headline: 'Test Article',
        author: 'John Doe',
        datePublished: new Date('2024-01-15'),
        dateModified: new Date('2024-01-20'),
        image: 'https://example.com/image.jpg',
        articleBody: 'This is the full article content...',
      });

      expect(schema.image).toBe('https://example.com/image.jpg');
      expect(schema.articleBody).toBe('This is the full article content...');
    });

    it('should include keywords array', () => {
      const schema = generateBlogPostingSchema({
        headline: 'Test Article',
        author: 'John Doe',
        datePublished: new Date('2024-01-15'),
        dateModified: new Date('2024-01-20'),
        keywords: ['AI', 'machine learning', 'technology'],
      });

      expect(schema.keywords).toEqual(['AI', 'machine learning', 'technology']);
    });

    it('should include publisher information', () => {
      const schema = generateBlogPostingSchema({
        headline: 'Test Article',
        author: 'John Doe',
        datePublished: new Date('2024-01-15'),
        dateModified: new Date('2024-01-20'),
      });

      expect(schema.publisher).toBeDefined();
      expect(schema.publisher?.['@type']).toBe('Organization');
      expect(schema.publisher?.name).toBe('AI FutureLinks');
      expect(schema.publisher?.logo).toBeDefined();
    });

    it('should include mainEntityOfPage when url provided', () => {
      const schema = generateBlogPostingSchema({
        headline: 'Test Article',
        author: 'John Doe',
        datePublished: new Date('2024-01-15'),
        dateModified: new Date('2024-01-20'),
        url: 'https://ai.futurelinks.art/blog/test-article',
      });

      expect(schema.mainEntityOfPage).toBe(
        'https://ai.futurelinks.art/blog/test-article'
      );
    });
  });

  describe('generateBreadcrumbListSchema', () => {
    it('should generate breadcrumb list with correct positions', () => {
      const schema = generateBreadcrumbListSchema([
        { name: 'Home', url: 'https://ai.futurelinks.art' },
        { name: 'Blog', url: 'https://ai.futurelinks.art/blog' },
        {
          name: 'Article',
          url: 'https://ai.futurelinks.art/blog/article',
        },
      ]);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement).toHaveLength(3);

      expect(schema.itemListElement[0]).toEqual({
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://ai.futurelinks.art',
      });

      expect(schema.itemListElement[1]).toEqual({
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://ai.futurelinks.art/blog',
      });

      expect(schema.itemListElement[2]).toEqual({
        '@type': 'ListItem',
        position: 3,
        name: 'Article',
        item: 'https://ai.futurelinks.art/blog/article',
      });
    });

    it('should handle single breadcrumb item', () => {
      const schema = generateBreadcrumbListSchema([
        { name: 'Home', url: 'https://ai.futurelinks.art' },
      ]);

      expect(schema.itemListElement).toHaveLength(1);
      expect(schema.itemListElement[0].position).toBe(1);
    });

    it('should handle empty breadcrumb list', () => {
      const schema = generateBreadcrumbListSchema([]);

      expect(schema.itemListElement).toHaveLength(0);
    });
  });

  describe('generateFAQPageSchema', () => {
    it('should generate FAQ page schema with question-answer pairs', () => {
      const schema = generateFAQPageSchema([
        {
          question: 'What is AI FutureLinks?',
          answer: 'AI FutureLinks is a model-agnostic AI workspace.',
        },
        {
          question: 'How do I get started?',
          answer: 'Simply sign in with your Google account.',
        },
      ]);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('FAQPage');
      expect(schema.mainEntity).toHaveLength(2);

      expect(schema.mainEntity[0]).toEqual({
        '@type': 'Question',
        name: 'What is AI FutureLinks?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'AI FutureLinks is a model-agnostic AI workspace.',
        },
      });

      expect(schema.mainEntity[1]).toEqual({
        '@type': 'Question',
        name: 'How do I get started?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Simply sign in with your Google account.',
        },
      });
    });

    it('should handle single FAQ item', () => {
      const schema = generateFAQPageSchema([
        {
          question: 'What is this?',
          answer: 'This is a test.',
        },
      ]);

      expect(schema.mainEntity).toHaveLength(1);
    });

    it('should handle empty FAQ list', () => {
      const schema = generateFAQPageSchema([]);

      expect(schema.mainEntity).toHaveLength(0);
    });
  });
});
