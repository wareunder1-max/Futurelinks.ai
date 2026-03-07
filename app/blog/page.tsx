import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getBlogListCanonicalUrl } from '@/lib/seo/canonical';
import { defaultAIMetaTags } from '@/lib/seo/ai-meta-tags';

// Force dynamic rendering since we need database access
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog - AI FutureLinks',
  description: 'Explore articles about AI, multi-model workflows, and the future of AI interfaces.',
  keywords: 'AI blog, multi-model AI, AI workspace, OpenAI, Google Gemini, AI tutorials',
  ...defaultAIMetaTags,
  openGraph: {
    title: 'Blog - AI FutureLinks',
    description: 'Explore articles about AI, multi-model workflows, and the future of AI interfaces.',
    url: getBlogListCanonicalUrl(),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - AI FutureLinks',
    description: 'Explore articles about AI, multi-model workflows, and the future of AI interfaces.',
  },
  alternates: {
    canonical: getBlogListCanonicalUrl(),
  },
};

const POSTS_PER_PAGE = 10;

interface BlogPageProps {
  searchParams: { page?: string };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const currentPage = parseInt(searchParams.page || '1', 10);
  const skip = (currentPage - 1) * POSTS_PER_PAGE;

  // Fetch total count for pagination
  const totalPosts = await prisma.blogPost.count();
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  // Fetch posts for current page
  const posts = await prisma.blogPost.findMany({
    orderBy: {
      publishedAt: 'desc',
    },
    skip,
    take: POSTS_PER_PAGE,
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

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Blog</h1>
          <p className="text-lg text-gray-600">
            Insights on AI, multi-model workflows, and the future of intelligent interfaces
          </p>
        </div>
      </header>

      {/* Blog Posts List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No blog posts available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  {post.featuredImage && (
                    <div className="aspect-video w-full bg-gray-200 overflow-hidden">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                      {post.title}
                    </h2>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <span>{post.author}</span>
                      <span className="mx-2">•</span>
                      <time dateTime={post.publishedAt.toISOString()}>
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-4">{post.excerpt}</p>
                    <span className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center">
                      Read more
                      <svg
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-12 flex justify-center items-center space-x-2" aria-label="Pagination">
            {/* Previous Button */}
            {currentPage > 1 ? (
              <Link
                href={`/blog?page=${currentPage - 1}`}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Previous
              </Link>
            ) : (
              <span className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-400 cursor-not-allowed">
                Previous
              </span>
            )}

            {/* Page Numbers */}
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1);

                if (!showPage) {
                  // Show ellipsis for skipped pages
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-3 py-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <Link
                    key={page}
                    href={`/blog?page=${page}`}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      page === currentPage
                        ? 'bg-blue-600 text-white font-medium'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </Link>
                );
              })}
            </div>

            {/* Next Button */}
            {currentPage < totalPages ? (
              <Link
                href={`/blog?page=${currentPage + 1}`}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Next
              </Link>
            ) : (
              <span className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-400 cursor-not-allowed">
                Next
              </span>
            )}
          </nav>
        )}
      </div>

      {/* Back to Home Link */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Home
        </Link>
      </div>
    </main>
  );
}
