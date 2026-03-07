import { describe, it, expect } from 'vitest';
import { generateOrganizationSchema, generateWebSiteSchema } from '@/lib/seo/schemas';

/**
 * Tests for JSON-LD integration on the landing page
 * 
 * Validates: Requirements 18.2, 18.3, 18.8
 */
describe('Landing Page JSON-LD Integration', () => {
  describe('Organization Schema', () => {
    it('should generate valid Organization schema for landing page', () => {
      const schema = generateOrganizationSchema({
        name: 'AI FutureLinks',
        url: 'https://ai.futurelinks.art',
        logo: 'https://ai.futurelinks.art/logo.png',
        description: 'Model-agnostic AI workspace designed for the 2026 workflow',
      });

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Organization');
      expect(schema.name).toBe('AI FutureLinks');
      expect(schema.url).toBe('https://ai.futurelinks.art');
      expect(schema.logo).toBe('https://ai.futurelinks.art/logo.png');
      expect(schema.description).toBe('Model-agnostic AI workspace designed for the 2026 workflow');
    });

    it('should produce valid JSON when serialized', () => {
      const schema = generateOrganizationSchema({
        name: 'AI FutureLinks',
        url: 'https://ai.futurelinks.art',
        logo: 'https://ai.futurelinks.art/logo.png',
        description: 'Model-agnostic AI workspace designed for the 2026 workflow',
      });

      const jsonString = JSON.stringify(schema);
      const parsed = JSON.parse(jsonString);

      expect(parsed).toEqual(schema);
    });
  });

  describe('WebSite Schema', () => {
    it('should generate valid WebSite schema with search action', () => {
      const schema = generateWebSiteSchema({
        name: 'AI FutureLinks',
        url: 'https://ai.futurelinks.art',
        description: 'The first model-agnostic workspace designed for the 2026 workflow',
        searchUrl: 'https://ai.futurelinks.art/search?q={search_term_string}',
      });

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('WebSite');
      expect(schema.name).toBe('AI FutureLinks');
      expect(schema.url).toBe('https://ai.futurelinks.art');
      expect(schema.description).toBe('The first model-agnostic workspace designed for the 2026 workflow');
      expect(schema.potentialAction).toBeDefined();
      expect(schema.potentialAction?.['@type']).toBe('SearchAction');
      expect(schema.potentialAction?.target).toBe('https://ai.futurelinks.art/search?q={search_term_string}');
      expect(schema.potentialAction?.['query-input']).toBe('required name=search_term_string');
    });

    it('should produce valid JSON when serialized', () => {
      const schema = generateWebSiteSchema({
        name: 'AI FutureLinks',
        url: 'https://ai.futurelinks.art',
        description: 'The first model-agnostic workspace designed for the 2026 workflow',
        searchUrl: 'https://ai.futurelinks.art/search?q={search_term_string}',
      });

      const jsonString = JSON.stringify(schema);
      const parsed = JSON.parse(jsonString);

      expect(parsed).toEqual(schema);
    });
  });

  describe('Schema Integration', () => {
    it('should generate both schemas without conflicts', () => {
      const orgSchema = generateOrganizationSchema({
        name: 'AI FutureLinks',
        url: 'https://ai.futurelinks.art',
        logo: 'https://ai.futurelinks.art/logo.png',
        description: 'Model-agnostic AI workspace designed for the 2026 workflow',
      });

      const websiteSchema = generateWebSiteSchema({
        name: 'AI FutureLinks',
        url: 'https://ai.futurelinks.art',
        description: 'The first model-agnostic workspace designed for the 2026 workflow',
        searchUrl: 'https://ai.futurelinks.art/search?q={search_term_string}',
      });

      // Both schemas should be valid and independent
      expect(orgSchema['@type']).toBe('Organization');
      expect(websiteSchema['@type']).toBe('WebSite');
      
      // Both should serialize to valid JSON
      const orgJson = JSON.stringify(orgSchema);
      const websiteJson = JSON.stringify(websiteSchema);
      
      expect(() => JSON.parse(orgJson)).not.toThrow();
      expect(() => JSON.parse(websiteJson)).not.toThrow();
    });

    it('should have consistent URLs across schemas', () => {
      const baseUrl = 'https://ai.futurelinks.art';
      
      const orgSchema = generateOrganizationSchema({
        name: 'AI FutureLinks',
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description: 'Model-agnostic AI workspace designed for the 2026 workflow',
      });

      const websiteSchema = generateWebSiteSchema({
        name: 'AI FutureLinks',
        url: baseUrl,
        description: 'The first model-agnostic workspace designed for the 2026 workflow',
        searchUrl: `${baseUrl}/search?q={search_term_string}`,
      });

      expect(orgSchema.url).toBe(baseUrl);
      expect(websiteSchema.url).toBe(baseUrl);
    });
  });
});
