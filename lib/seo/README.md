# SEO Utilities

This directory contains utilities for implementing SEO best practices across the AI FutureLinks platform.

## Files

### `meta.ts`

Utilities for generating SEO-optimized meta tags for Next.js metadata API with validation for optimal length constraints.

**Requirements:** 6.2, 6.3, 6.4, 6.5, 6.6

#### Functions

- `generateMetaTags(config)` - Generate complete meta tags including title, description, keywords, Open Graph, Twitter Card, and canonical URL
- `generateOpenGraphTags(config)` - Generate Open Graph tags for social media sharing
- `generateTwitterCardTags(config)` - Generate Twitter Card tags
- `validateTitle(title)` - Validate title length (50-60 characters optimal)
- `validateDescription(description)` - Validate description length (150-160 characters optimal)

#### Usage

```typescript
import { generateMetaTags } from '@/lib/seo/meta';

export async function generateMetadata() {
  return generateMetaTags({
    title: 'AI FutureLinks - Model-Agnostic AI Workspace Platform',
    description: 'Toggle between OpenAI and Google Gemini in a single click. Watch your ideas come to life with real-time artifacts and integrated serverless storage.',
    keywords: ['AI workspace', 'multi-model AI', 'OpenAI', 'Google Gemini'],
    canonicalUrl: 'https://ai.futurelinks.art',
    ogImage: 'https://ai.futurelinks.art/og-image.png',
    type: 'website'
  });
}
```

#### Features

- Validates title length (50-60 characters for optimal SEO)
- Validates description length (150-160 characters for optimal SEO)
- Generates Open Graph tags (og:title, og:description, og:image, og:url, og:type)
- Generates Twitter Card tags (twitter:card, twitter:title, twitter:description, twitter:image)
- Includes canonical URL in metadata
- Default OG image: `https://ai.futurelinks.art/og-default.png`
- OG image dimensions: 1200x630 (optimal for social media)
- Development mode warnings for suboptimal lengths

See [META_TAGS.md](./META_TAGS.md) for detailed documentation.

### `canonical.ts`

Utilities for generating canonical URLs to prevent duplicate content issues and guide search engines and AI crawlers to authoritative content versions.

**Requirements:** 19.8, 6.12

#### Functions

- `generateCanonicalUrl(path: string): string` - Generate canonical URL for any path
- `getLandingPageCanonicalUrl(): string` - Get canonical URL for landing page
- `getBlogListCanonicalUrl(): string` - Get canonical URL for blog list page
- `getBlogPostCanonicalUrl(slug: string): string` - Get canonical URL for a blog post
- `getChatPageCanonicalUrl(): string` - Get canonical URL for chat page

#### Usage

```typescript
import { getBlogPostCanonicalUrl } from '@/lib/seo/canonical';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  return {
    alternates: {
      canonical: getBlogPostCanonicalUrl(params.slug),
    },
  };
}
```

#### Features

- Uses production domain: `https://ai.futurelinks.art`
- Normalizes paths (removes double slashes, trailing slashes)
- Ensures HTTPS protocol
- Consistent URL format across all pages

### `schemas.ts`

Utilities for generating Schema.org JSON-LD structured data for search engines and AI systems.

**Requirements:** 18.1, 18.2, 18.3, 18.4, 18.5, 18.6

#### Functions

- `generateOrganizationSchema(data)` - Generate Organization schema
- `generateWebSiteSchema(data)` - Generate WebSite schema with search action
- `generateBlogPostingSchema(data)` - Generate BlogPosting schema
- `generateBreadcrumbListSchema(items)` - Generate BreadcrumbList schema
- `generateFAQPageSchema(faqs)` - Generate FAQPage schema

#### Usage

```typescript
import { generateBlogPostingSchema } from '@/lib/seo/schemas';
import { JsonLd } from '@/components/seo/JsonLd';

export default function BlogPost({ post }) {
  const schema = generateBlogPostingSchema({
    headline: post.title,
    author: post.author,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    image: post.featuredImage,
    articleBody: post.content,
  });

  return (
    <>
      <JsonLd data={schema} />
      {/* Page content */}
    </>
  );
}
```

## Implementation Status

### Meta Tags

- ✅ Title validation (50-60 characters)
- ✅ Description validation (150-160 characters)
- ✅ Keywords generation
- ✅ Open Graph tags (og:title, og:description, og:image, og:url, og:type)
- ✅ Twitter Card tags (twitter:card, twitter:title, twitter:description, twitter:image)
- ✅ Canonical URL integration

### Canonical URLs

- ✅ Landing page (`app/page.tsx`)
- ✅ Blog list page (`app/blog/page.tsx`)
- ✅ Blog post detail page (`app/blog/[slug]/page.tsx`)
- ✅ Chat page (`app/chat/page.tsx`)

### JSON-LD Structured Data

- ✅ Organization schema (landing page)
- ✅ WebSite schema (landing page)
- ✅ BlogPosting schema (blog posts)
- ✅ BreadcrumbList schema (blog posts)
- ⏳ FAQPage schema (when FAQ content is added)

## Testing

Tests are located in `__tests__/`:

- `meta.test.ts` - Unit tests for meta tag generator utility
- `meta-integration.test.ts` - Integration tests for meta tags with Next.js pages
- `canonical-urls.test.ts` - Unit tests for canonical URL utility
- `canonical-urls-integration.test.ts` - Integration tests for page metadata
- `schemas.test.ts` - Unit tests for JSON-LD schema generators
- `json-ld.test.ts` - Tests for JsonLd component

Run tests:

```bash
npm test -- __tests__/meta.test.ts --run
npm test -- __tests__/meta-integration.test.ts --run
npm test -- __tests__/canonical-urls.test.ts --run
npm test -- __tests__/canonical-urls-integration.test.ts --run
```

## Best Practices

1. **Use optimal lengths** - Titles should be 50-60 characters, descriptions 150-160 characters
2. **Always use canonical URLs** - Every public page should have a canonical URL in metadata
3. **Use utility functions** - Don't hardcode URLs or meta tags, use the provided utility functions
4. **Include keywords** - Add 3-7 relevant keywords for SEO
5. **Use high-quality images** - OG images should be 1200x630 for optimal social media display
6. **Consistent format** - All canonical URLs use HTTPS and the production domain
7. **No trailing slashes** - Except for the root path (`/`)
8. **Include in Open Graph** - Canonical URLs should also be in Open Graph metadata
9. **Validate in development** - Pay attention to console warnings about suboptimal lengths

## References

- [Google Search Central - Canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Schema.org Documentation](https://schema.org/)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
