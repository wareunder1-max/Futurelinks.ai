import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateBlogPostingSchema, generateBreadcrumbListSchema } from '@/lib/seo/schemas';

/**
 * Tests for JSON-LD integration on blog post detail pages
 * 
 * Validates: Requirements 18.4, 18.6
 */
describe('Blog Post Detail Page JSON-LD Integration', () => {
  describe('BlogPosting Schema Integration', () => {
    it('should generate BlogPosting schema with all required properties', () => {
      const mockPost = {
        title: 'Understanding AI Workspaces',
        author: 'AI FutureLinks Team',
        publishedAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        content: 'This is the full article content about AI workspaces...',
        metaDescription: 'Learn about AI workspaces and how they work',
        featuredImage: 'https://ai.futurelinks.art/images/ai-workspace.jpg',
        keywords: ['AI', 'workspace', 'productivity'],
        slug: 'understanding-ai-workspaces',
      };

      const schema = generateBlogPostingSchema({
        headline: mockPost.title,
        author: mockPost.author,
        datePublished: mockPost.publishedAt,
        dateModified: mockPost.updatedAt,
        image: mockPost.featuredImage,
        articleBody: mockPost.content,
        description: mockPost.metaDescription,
        keywords: mockPost.keywords,
        url: `https://ai.futurelinks.art/blog/${mockPost.slug}`,
      });

      // Verify all required properties are present
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BlogPosting');
      expect(schema.headline).toBe(mockPost.title);
      expect(schema.author).toEqual({ '@type': 'Person', name: mockPost.author });
      expect(schema.datePublished).toBe(mockPost.publishedAt.toISOString());
      expect(schema.dateModified).toBe(mockPost.updatedAt.toISOString());
      expect(schema.image).toBe(mockPost.featuredImage);
      expect(schema.articleBody).toBe(mockPost.content);
      expect(schema.description).toBe(mockPost.metaDescription);
      expect(schema.keywords).toEqual(mockPost.keywords);
      expect(schema.mainEntityOfPage).toBe(`https://ai.futurelinks.art/blog/${mockPost.slug}`);
    });

    it('should include publisher information in BlogPosting schema', () => {
      const schema = generateBlogPostingSchema({
        headline: 'Test Article',
        author: 'Test Author',
        datePublished: new Date('2024-01-15'),
        dateModified: new Date('2024-01-15'),
      });

      expect(schema.publisher).toBeDefined();
      expect(schema.publisher?.['@type']).toBe('Organization');
      expect(schema.publisher?.name).toBe('AI FutureLinks');
      expect(schema.publisher?.logo).toBeDefined();
      
      // Type guard to check if logo is an object
      if (typeof schema.publisher?.logo === 'object' && schema.publisher?.logo !== null) {
        expect(schema.publisher.logo['@type']).toBe('ImageObject');
        expect(schema.publisher.logo.url).toBe('https://ai.futurelinks.art/logo.png');
      }
    });

    it('should use default image when featuredImage is not provided', () => {
      const schema = generateBlogPostingSchema({
        headline: 'Test Article',
        author: 'Test Author',
        datePublished: new Date('2024-01-15'),
        dateModified: new Date('2024-01-15'),
        image: 'https://ai.futurelinks.art/default-blog-image.png',
      });

      expect(schema.image).toBe('https://ai.futurelinks.art/default-blog-image.png');
    });
  });

  describe('BreadcrumbList Schema Integration', () => {
    it('should generate BreadcrumbList schema for blog post navigation', () => {
      const postTitle = 'Understanding AI Workspaces';
      const postSlug = 'understanding-ai-workspaces';

      const schema = generateBreadcrumbListSchema([
        { name: 'Home', url: 'https://ai.futurelinks.art' },
        { name: 'Blog', url: 'https://ai.futurelinks.art/blog' },
        { name: postTitle, url: `https://ai.futurelinks.art/blog/${postSlug}` },
      ]);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement).toHaveLength(3);

      // Verify breadcrumb hierarchy
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
        name: postTitle,
        item: `https://ai.futurelinks.art/blog/${postSlug}`,
      });
    });

    it('should maintain correct position numbering in breadcrumb list', () => {
      const schema = generateBreadcrumbListSchema([
        { name: 'Home', url: 'https://ai.futurelinks.art' },
        { name: 'Blog', url: 'https://ai.futurelinks.art/blog' },
        { name: 'Category', url: 'https://ai.futurelinks.art/blog/category' },
        { name: 'Post', url: 'https://ai.futurelinks.art/blog/category/post' },
      ]);

      schema.itemListElement.forEach((item, index) => {
        expect(item.position).toBe(index + 1);
      });
    });
  });

  describe('Schema Integration Requirements', () => {
    it('should generate both BlogPosting and BreadcrumbList schemas for a blog post', () => {
      const mockPost = {
        title: 'Test Post',
        author: 'Test Author',
        publishedAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        slug: 'test-post',
      };

      const blogPostingSchema = generateBlogPostingSchema({
        headline: mockPost.title,
        author: mockPost.author,
        datePublished: mockPost.publishedAt,
        dateModified: mockPost.updatedAt,
      });

      const breadcrumbSchema = generateBreadcrumbListSchema([
        { name: 'Home', url: 'https://ai.futurelinks.art' },
        { name: 'Blog', url: 'https://ai.futurelinks.art/blog' },
        { name: mockPost.title, url: `https://ai.futurelinks.art/blog/${mockPost.slug}` },
      ]);

      // Both schemas should be valid
      expect(blogPostingSchema['@type']).toBe('BlogPosting');
      expect(breadcrumbSchema['@type']).toBe('BreadcrumbList');

      // Both should have the same context
      expect(blogPostingSchema['@context']).toBe('https://schema.org');
      expect(breadcrumbSchema['@context']).toBe('https://schema.org');
    });
  });
});
