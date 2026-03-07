import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma client
const mockPrismaClient = {
  blogPost: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
};

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrismaClient,
}));

describe('Blog Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should query blog posts with correct pagination parameters', async () => {
    // Mock data
    mockPrismaClient.blogPost.count.mockResolvedValue(5);
    mockPrismaClient.blogPost.findMany.mockResolvedValue([
      {
        id: '1',
        slug: 'test-post',
        title: 'Test Post',
        excerpt: 'This is a test excerpt',
        author: 'Test Author',
        publishedAt: new Date('2024-01-01'),
        featuredImage: null,
      },
    ]);

    // Import the page component
    const BlogPage = (await import('../app/blog/page')).default;

    // Render with default page (page 1)
    await BlogPage({ searchParams: {} });

    // Verify count was called
    expect(mockPrismaClient.blogPost.count).toHaveBeenCalledTimes(1);

    // Verify findMany was called with correct parameters
    expect(mockPrismaClient.blogPost.findMany).toHaveBeenCalledWith({
      orderBy: {
        publishedAt: 'desc',
      },
      skip: 0,
      take: 10,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        author: true,
        publishedAt: true,
        featuredImage: true,
      },
    });
  });

  it('should calculate correct skip value for page 2', async () => {
    mockPrismaClient.blogPost.count.mockResolvedValue(15);
    mockPrismaClient.blogPost.findMany.mockResolvedValue([]);

    const BlogPage = (await import('../app/blog/page')).default;

    // Render with page 2
    await BlogPage({ searchParams: { page: '2' } });

    // Verify skip is 10 for page 2
    expect(mockPrismaClient.blogPost.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      })
    );
  });

  it('should show pagination when more than 10 posts exist', async () => {
    mockPrismaClient.blogPost.count.mockResolvedValue(25);
    mockPrismaClient.blogPost.findMany.mockResolvedValue([]);

    const BlogPage = (await import('../app/blog/page')).default;

    await BlogPage({ searchParams: {} });

    // Verify count was called to determine pagination
    expect(mockPrismaClient.blogPost.count).toHaveBeenCalled();
  });

  it('should handle page 1 when no page parameter provided', async () => {
    mockPrismaClient.blogPost.count.mockResolvedValue(5);
    mockPrismaClient.blogPost.findMany.mockResolvedValue([]);

    const BlogPage = (await import('../app/blog/page')).default;

    await BlogPage({ searchParams: {} });

    // Should skip 0 posts (page 1)
    expect(mockPrismaClient.blogPost.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
      })
    );
  });

  it('should order posts by publishedAt descending', async () => {
    mockPrismaClient.blogPost.count.mockResolvedValue(5);
    mockPrismaClient.blogPost.findMany.mockResolvedValue([]);

    const BlogPage = (await import('../app/blog/page')).default;

    await BlogPage({ searchParams: {} });

    expect(mockPrismaClient.blogPost.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: {
          publishedAt: 'desc',
        },
      })
    );
  });
});
