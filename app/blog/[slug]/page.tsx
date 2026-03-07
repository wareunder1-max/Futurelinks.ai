import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { JsonLd } from '@/components/seo/JsonLd';
import { generateBlogPostingSchema, generateBreadcrumbListSchema } from '@/lib/seo/schemas';
import { getBlogPostCanonicalUrl } from '@/lib/seo/canonical';
import { defaultAIMetaTags } from '@/lib/seo/ai-meta-tags';

// Force dynamic rendering since we need database access
export const dynamic = 'force-dynamic';

interface BlogPostPageProps {
  params: { slug: string };
}

// Generate static params for all blog posts at build time
export async function generateStaticParams() {
  try {
    const posts = await prisma.blogPost.findMany({
      select: {
        slug: true,
      },
    });

    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    // If database is not available during build, return empty array
    // Pages will be generated on-demand instead
    console.warn('Database not available during build, skipping static generation for blog posts');
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      metaDescription: true,
      keywords: true,
      featuredImage: true,
      author: true,
      publishedAt: true,
    },
  });

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const keywords = post.keywords ? JSON.parse(post.keywords) : [];
  const canonicalUrl = getBlogPostCanonicalUrl(params.slug);

  return {
    title: post.title,
    description: post.metaDescription,
    keywords: keywords.join(', '),
    authors: [{ name: post.author }],
    ...defaultAIMetaTags,
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: canonicalUrl,
      type: 'article',
      publishedTime: post.publishedAt.toISOString(),
      authors: [post.author],
      images: post.featuredImage
        ? [
            {
              url: post.featuredImage,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
  });

  if (!post) {
    notFound();
  }

  const keywords = post.keywords ? JSON.parse(post.keywords) : [];

  // Generate BlogPosting schema using the schema generator
  const blogPostingSchema = generateBlogPostingSchema({
    headline: post.title,
    author: post.author,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    image: post.featuredImage || 'https://ai.futurelinks.art/default-blog-image.png',
    articleBody: post.content,
    description: post.metaDescription,
    keywords: keywords,
    url: `https://ai.futurelinks.art/blog/${post.slug}`,
  });

  // Generate BreadcrumbList schema using the schema generator
  const breadcrumbSchema = generateBreadcrumbListSchema([
    { name: 'Home', url: 'https://ai.futurelinks.art' },
    { name: 'Blog', url: 'https://ai.futurelinks.art/blog' },
    { name: post.title, url: `https://ai.futurelinks.art/blog/${post.slug}` },
  ]);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <JsonLd data={blogPostingSchema} />
      <JsonLd data={breadcrumbSchema} />

      <main className="min-h-screen bg-gray-50">
        {/* Article Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb Navigation */}
            <nav className="mb-6 text-sm" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-gray-600">
                <li>
                  <Link href="/" className="hover:text-blue-600 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <span className="mx-2">/</span>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-blue-600 transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <span className="mx-2">/</span>
                </li>
                <li className="text-gray-900 font-medium" aria-current="page">
                  {post.title}
                </li>
              </ol>
            </nav>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{post.title}</h1>

            {/* Author and Date */}
            <div className="flex items-center text-gray-600 mb-4">
              <span className="font-medium">{post.author}</span>
              <span className="mx-3">•</span>
              <time dateTime={post.publishedAt.toISOString()}>
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              {post.updatedAt.getTime() !== post.publishedAt.getTime() && (
                <>
                  <span className="mx-3">•</span>
                  <span className="text-sm">
                    Updated:{' '}
                    {new Date(post.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </>
              )}
            </div>

            {/* Keywords */}
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword: string) => (
                  <span
                    key={keyword}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Featured Image - Optimized for CLS (Requirement 21.3) */}
        {post.featuredImage && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="relative aspect-video w-full bg-gray-200 rounded-lg overflow-hidden">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                className="object-cover"
                priority={false} // Not above the fold, so no priority
                loading="lazy" // Lazy load below-the-fold images (Requirement 21.4)
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <section className="prose prose-lg max-w-none">
            <div
              className="text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatMarkdown(post.content) }}
            />
          </section>
        </article>

        {/* Social Sharing Buttons */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Share this article</h2>
          <div className="flex flex-wrap gap-3">
            {/* Twitter/X Share */}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://ai.futurelinks.art/blog/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              aria-label="Share on Twitter"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </a>

            {/* LinkedIn Share */}
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://ai.futurelinks.art/blog/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
              aria-label="Share on LinkedIn"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Share on LinkedIn
            </a>

            {/* Facebook Share */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://ai.futurelinks.art/blog/${post.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Share on Facebook"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Share on Facebook
            </a>

            {/* Copy Link */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://ai.futurelinks.art/blog/${post.slug}`);
                alert('Link copied to clipboard!');
              }}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              aria-label="Copy link"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy Link
            </button>
          </div>
        </section>

        {/* Navigation */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <Link
            href="/blog"
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
            Back to Blog
          </Link>
        </div>
      </main>
    </>
  );
}

// Enhanced markdown-to-HTML converter with semantic HTML support
// Supports definition lists, tables, blockquotes with citations, and code blocks with language tags
function formatMarkdown(markdown: string): string {
  let html = markdown;

  // Definition lists: Term: Definition format
  // Example: "API Key: A credential string used to authenticate..."
  html = html.replace(
    /^([A-Z][A-Za-z\s]+):\s+([A-Z].{10,})$/gim,
    (match, term, definition) => {
      // Only convert if it looks like a definition:
      // - Term starts with capital letter and contains only letters/spaces
      // - Term is reasonably short (< 50 chars)
      // - Definition starts with capital letter and is substantial (> 10 chars)
      if (term.length < 50 && /^[A-Z][A-Za-z\s]+$/.test(term) && definition.length > 10) {
        return `<dl class="my-4"><dt class="font-bold text-gray-900">${term}</dt><dd class="ml-6 text-gray-700 mb-2">${definition}</dd></dl>`;
      }
      return match;
    }
  );

  // Tables: Markdown table format
  // | Header 1 | Header 2 |
  // |----------|----------|
  // | Cell 1   | Cell 2   |
  html = html.replace(
    /\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/g,
    (match, headerRow, bodyRows) => {
      const headers = headerRow
        .split('|')
        .map((h: string) => h.trim())
        .filter((h: string) => h);
      const rows = bodyRows
        .trim()
        .split('\n')
        .map((row: string) =>
          row
            .split('|')
            .map((cell: string) => cell.trim())
            .filter((cell: string) => cell)
        );

      let tableHtml = '<table class="min-w-full divide-y divide-gray-300 my-6 border border-gray-300">';
      tableHtml += '<thead class="bg-gray-50">';
      tableHtml += '<tr>';
      headers.forEach((header: string) => {
        tableHtml += `<th scope="col" class="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">${header}</th>`;
      });
      tableHtml += '</tr>';
      tableHtml += '</thead>';
      tableHtml += '<tbody class="divide-y divide-gray-200 bg-white">';
      rows.forEach((row: string[]) => {
        tableHtml += '<tr>';
        row.forEach((cell: string, index: number) => {
          tableHtml += `<td class="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">${cell}</td>`;
        });
        tableHtml += '</tr>';
      });
      tableHtml += '</tbody>';
      tableHtml += '</table>';
      return tableHtml;
    }
  );

  // Blockquotes with citations: > Quote text\n> -- Author, Source
  html = html.replace(
    /^> (.+?)(?:\n> -- (.+?))?$/gim,
    (match, quote, citation) => {
      if (citation) {
        return `<blockquote cite="${citation}" class="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4"><p>${quote}</p><footer class="text-sm text-gray-600 mt-2">— ${citation}</footer></blockquote>`;
      }
      return `<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4">${quote}</blockquote>`;
    }
  );

  // Code blocks with language specification
  html = html.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    (match, lang, code) => {
      const language = lang || 'plaintext';
      return `<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-6"><code class="language-${language}">${code.trim()}</code></pre>`;
    }
  );

  // Inline code
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">$1</code>'
  );

  // Headers (h4, h3, h2 - proper hierarchy)
  html = html.replace(/^#### (.*$)/gim, '<h4 class="text-xl font-bold mt-6 mb-3">$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold mt-8 mb-4">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mt-10 mb-6">$1</h2>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-blue-600 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Unordered lists
  html = html.replace(/^\* (.*$)/gim, '<li class="ml-6 mb-2">$1</li>');
  html = html.replace(/(<li class="ml-6 mb-2">[\s\S]*<\/li>)/, '<ul class="list-disc my-4">$1</ul>');

  // Ordered lists
  html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-6 mb-2">$1</li>');

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p class="mb-4">');
  html = '<p class="mb-4">' + html + '</p>';

  // Line breaks
  html = html.replace(/\n/g, '<br />');

  return html;
}
