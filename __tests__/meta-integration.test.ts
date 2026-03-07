/**
 * Integration tests for meta tag generator with Next.js pages
 * Demonstrates real-world usage patterns
 */

import { describe, it, expect } from 'vitest';
import { generateMetaTags } from '../lib/seo/meta';

describe('Meta Tag Integration Tests', () => {
  describe('Landing Page', () => {
    it('should generate complete meta tags for landing page', () => {
      const metadata = generateMetaTags({
        title: 'AI FutureLinks - Model-Agnostic AI Workspace Platform',
        description: 'Toggle between OpenAI and Google Gemini in a single click. Watch your ideas come to life with real-time artifacts and integrated serverless storage.',
        keywords: [
          'model-agnostic AI workspace',
          'multi-model AI switching',
          'OpenAI vs Google Gemini comparison',
          'AI artifacts and code preview',
          'serverless AI project storage',
          '2026 AI workflow tools',
          'advanced AI interface'
        ],
        canonicalUrl: 'https://ai.futurelinks.art',
        ogImage: 'https://ai.futurelinks.art/og-landing.png',
        type: 'website'
      });

      // Verify all required fields
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
      expect(metadata.keywords).toContain('model-agnostic AI workspace');
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.twitter).toBeDefined();
      expect(metadata.alternates.canonical).toBe('https://ai.futurelinks.art');

      // Verify Open Graph
      expect(metadata.openGraph.type).toBe('website');
      expect(metadata.openGraph.url).toBe('https://ai.futurelinks.art');
      expect(metadata.openGraph.images[0].url).toBe('https://ai.futurelinks.art/og-landing.png');

      // Verify Twitter Card
      expect(metadata.twitter.card).toBe('summary_large_image');
    });
  });

  describe('Blog Post', () => {
    it('should generate complete meta tags for blog post', () => {
      const metadata = generateMetaTags({
        title: 'Understanding Multi-Model AI: OpenAI vs Google Gemini',
        description: 'Explore the differences between OpenAI and Google Gemini AI models. Learn when to use each model and how to switch between them seamlessly in your workflow.',
        keywords: [
          'OpenAI',
          'Google Gemini',
          'AI comparison',
          'multi-model AI',
          'AI workflow'
        ],
        canonicalUrl: 'https://ai.futurelinks.art/blog/openai-vs-gemini',
        ogImage: 'https://ai.futurelinks.art/blog/openai-vs-gemini-og.png',
        type: 'article'
      });

      // Verify article-specific fields
      expect(metadata.openGraph.type).toBe('article');
      expect(metadata.openGraph.url).toBe('https://ai.futurelinks.art/blog/openai-vs-gemini');
      
      // Verify SEO keywords
      expect(metadata.keywords).toContain('OpenAI');
      expect(metadata.keywords).toContain('Google Gemini');
    });

    it('should handle blog post without custom image', () => {
      const metadata = generateMetaTags({
        title: 'Getting Started with AI FutureLinks: A Complete Guide',
        description: 'Learn how to get started with AI FutureLinks platform. This comprehensive guide covers account setup, API configuration, and your first AI conversation.',
        keywords: ['AI tutorial', 'getting started', 'AI FutureLinks guide'],
        canonicalUrl: 'https://ai.futurelinks.art/blog/getting-started',
        type: 'article'
      });

      // Should use default image
      expect(metadata.openGraph.images[0].url).toBe('https://ai.futurelinks.art/og-default.png');
      expect(metadata.twitter.images[0]).toBe('https://ai.futurelinks.art/og-default.png');
    });
  });

  describe('Chat Interface', () => {
    it('should generate meta tags for chat page', () => {
      const metadata = generateMetaTags({
        title: 'AI Chat - FutureLinks Model-Agnostic Workspace Platform',
        description: 'Start chatting with multiple AI models in one interface. Switch between OpenAI, Google Gemini, and Anthropic Claude seamlessly. Your AI workspace awaits.',
        keywords: ['AI chat', 'multi-model chat', 'AI conversation', 'AI workspace'],
        canonicalUrl: 'https://ai.futurelinks.art/chat',
        type: 'website'
      });

      expect(metadata.title).toContain('AI Chat');
      expect(metadata.description).toContain('multiple AI models');
      expect(metadata.openGraph.type).toBe('website');
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimal configuration', () => {
      const metadata = generateMetaTags({
        title: 'AI FutureLinks - The Evolution of the AI Interface',
        description: 'Experience the next generation of AI interaction. Model-agnostic workspace designed for the 2026 workflow with seamless multi-model switching and real-time artifacts.',
        canonicalUrl: 'https://ai.futurelinks.art'
      });

      // Should use defaults
      expect(metadata.keywords).toBeUndefined();
      expect(metadata.openGraph.type).toBe('website');
      expect(metadata.openGraph.images[0].url).toBe('https://ai.futurelinks.art/og-default.png');
    });

    it('should handle long keyword lists', () => {
      const metadata = generateMetaTags({
        title: 'AI FutureLinks - Complete AI Workspace for Professionals',
        description: 'Professional AI workspace with multi-model support, real-time artifacts, serverless storage, and advanced features for power users. Try it free today.',
        keywords: [
          'AI workspace',
          'multi-model AI',
          'OpenAI',
          'Google Gemini',
          'Anthropic Claude',
          'AI artifacts',
          'serverless storage',
          'AI workflow',
          'professional AI tools',
          'AI platform'
        ],
        canonicalUrl: 'https://ai.futurelinks.art/features'
      });

      expect(metadata.keywords).toContain('AI workspace');
      expect(metadata.keywords).toContain('professional AI tools');
      expect(metadata.keywords?.split(', ').length).toBe(10);
    });

    it('should handle special characters in URLs', () => {
      const metadata = generateMetaTags({
        title: 'AI & ML: The Future of Technology - FutureLinks Guide',
        description: 'Discover how AI & machine learning are shaping the future. Learn about "next-gen" AI models, their capabilities, and how to leverage them in your workflow.',
        canonicalUrl: 'https://ai.futurelinks.art/blog/ai-ml-future?utm_source=social',
        keywords: ['AI & ML', 'machine learning', 'future tech']
      });

      expect(metadata.alternates.canonical).toContain('utm_source');
      expect(metadata.title).toContain('&');
      expect(metadata.description).toContain('"next-gen"');
    });
  });

  describe('SEO Optimization', () => {
    it('should generate tags optimized for search engines', () => {
      const metadata = generateMetaTags({
        title: 'AI FutureLinks: Multi-Model AI Workspace Platform 2024',
        description: 'Switch between OpenAI, Google Gemini, and Anthropic Claude in one workspace. Real-time artifacts, serverless storage, and AI features for professionals.',
        keywords: [
          'AI workspace 2024',
          'multi-model AI platform',
          'OpenAI Gemini Claude',
          'AI artifacts',
          'professional AI tools'
        ],
        canonicalUrl: 'https://ai.futurelinks.art',
        ogImage: 'https://ai.futurelinks.art/og-seo-optimized.png',
        type: 'website'
      });

      // Verify title length is optimal
      expect(metadata.title.length).toBeGreaterThanOrEqual(50);
      expect(metadata.title.length).toBeLessThanOrEqual(60);

      // Verify description length is optimal
      expect(metadata.description.length).toBeGreaterThanOrEqual(150);
      expect(metadata.description.length).toBeLessThanOrEqual(160);

      // Verify all social media tags present
      expect(metadata.openGraph.title).toBeDefined();
      expect(metadata.openGraph.description).toBeDefined();
      expect(metadata.openGraph.images).toHaveLength(1);
      expect(metadata.twitter.card).toBe('summary_large_image');
    });

    it('should include proper image dimensions for social media', () => {
      const metadata = generateMetaTags({
        title: 'AI FutureLinks - Model-Agnostic AI Workspace Platform',
        description: 'Toggle between OpenAI and Google Gemini in a single click. Watch your ideas come to life with real-time artifacts and integrated serverless storage.',
        canonicalUrl: 'https://ai.futurelinks.art',
        ogImage: 'https://ai.futurelinks.art/og-1200x630.png'
      });

      const ogImage = metadata.openGraph.images[0];
      expect(ogImage.width).toBe(1200);
      expect(ogImage.height).toBe(630);
      expect(ogImage.alt).toBe(metadata.title);
    });
  });

  describe('Next.js Metadata API Compatibility', () => {
    it('should return structure compatible with Next.js metadata', () => {
      const metadata = generateMetaTags({
        title: 'AI FutureLinks - Model-Agnostic AI Workspace Platform',
        description: 'Toggle between OpenAI and Google Gemini in a single click. Watch your ideas come to life with real-time artifacts and integrated serverless storage.',
        canonicalUrl: 'https://ai.futurelinks.art'
      });

      // Verify structure matches Next.js Metadata type
      expect(metadata).toHaveProperty('title');
      expect(metadata).toHaveProperty('description');
      expect(metadata).toHaveProperty('openGraph');
      expect(metadata).toHaveProperty('twitter');
      expect(metadata).toHaveProperty('alternates');

      // Verify nested structures
      expect(metadata.openGraph).toHaveProperty('title');
      expect(metadata.openGraph).toHaveProperty('description');
      expect(metadata.openGraph).toHaveProperty('url');
      expect(metadata.openGraph).toHaveProperty('type');
      expect(metadata.openGraph).toHaveProperty('images');

      expect(metadata.twitter).toHaveProperty('card');
      expect(metadata.twitter).toHaveProperty('title');
      expect(metadata.twitter).toHaveProperty('description');
      expect(metadata.twitter).toHaveProperty('images');

      expect(metadata.alternates).toHaveProperty('canonical');
    });
  });
});
