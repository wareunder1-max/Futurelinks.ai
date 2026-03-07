import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let blogUrls: MetadataRoute.Sitemap = [];

  try {
    // Fetch all published blog posts
    const posts = await prisma.blogPost.findMany({
      select: { 
        slug: true, 
        updatedAt: true 
      },
      orderBy: {
        publishedAt: 'desc'
      }
    });

    // Generate blog post URLs
    blogUrls = posts.map(post => ({
      url: `https://ai.futurelinks.art/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8
    }));
  } catch (error) {
    // If database is not available during build, skip blog URLs
    console.warn('Database not available during build, skipping blog URLs in sitemap');
  }

  // Return sitemap with all public pages
  return [
    {
      url: 'https://ai.futurelinks.art',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0
    },
    {
      url: 'https://ai.futurelinks.art/blog',
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9
    },
    {
      url: 'https://ai.futurelinks.art/chat',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7
    },
    ...blogUrls
  ];
}
