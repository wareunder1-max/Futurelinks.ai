# Meta Tag Generator Utility

## Overview

The meta tag generator utility provides functions for creating SEO-optimized meta tags for Next.js applications. It implements requirements 6.2-6.6 for traditional SEO optimization.

## Features

- **Title validation**: Ensures titles are 50-60 characters (optimal for search engines)
- **Description validation**: Ensures descriptions are 150-160 characters (optimal for search engines)
- **Open Graph tags**: Generates complete OG tags for social media sharing
- **Twitter Card tags**: Generates Twitter-specific meta tags
- **Canonical URLs**: Includes canonical URL in metadata
- **Type safety**: Full TypeScript support with interfaces

## Usage

### Basic Example

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

### Blog Post Example

```typescript
import { generateMetaTags } from '@/lib/seo/meta';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);
  
  return generateMetaTags({
    title: post.title,
    description: post.metaDescription,
    keywords: post.keywords,
    canonicalUrl: `https://ai.futurelinks.art/blog/${post.slug}`,
    ogImage: post.featuredImage,
    type: 'article'
  });
}
```

### Individual Tag Generators

You can also use individual tag generators:

```typescript
import { 
  generateOpenGraphTags, 
  generateTwitterCardTags 
} from '@/lib/seo/meta';

// Generate only Open Graph tags
const ogTags = generateOpenGraphTags({
  title: 'My Page Title',
  description: 'My page description',
  canonicalUrl: 'https://example.com/page',
  ogImage: 'https://example.com/image.png',
  type: 'article'
});

// Generate only Twitter Card tags
const twitterTags = generateTwitterCardTags({
  title: 'My Page Title',
  description: 'My page description',
  canonicalUrl: 'https://example.com/page',
  ogImage: 'https://example.com/image.png'
});
```

## Validation

The utility includes validation functions that check length constraints:

```typescript
import { validateTitle, validateDescription } from '@/lib/seo/meta';

// Validate title (50-60 chars optimal)
const titleResult = validateTitle('My Page Title');
if (!titleResult.isValid) {
  console.error('Title errors:', titleResult.errors);
}
if (titleResult.warnings.length > 0) {
  console.warn('Title warnings:', titleResult.warnings);
}

// Validate description (150-160 chars optimal)
const descResult = validateDescription('My page description...');
if (!descResult.isValid) {
  console.error('Description errors:', descResult.errors);
}
```

## Configuration Interface

```typescript
interface MetaTagsConfig {
  title: string;                    // Required: Page title
  description: string;              // Required: Page description
  keywords?: string[];              // Optional: SEO keywords
  ogImage?: string;                 // Optional: Social media image (defaults to og-default.png)
  canonicalUrl: string;             // Required: Canonical URL for the page
  type?: 'website' | 'article';     // Optional: Page type (defaults to 'website')
}
```

## Validation Rules

### Title (Requirement 6.2)
- **Required**: Cannot be empty
- **Optimal length**: 50-60 characters
- **Warnings**: Issued if outside optimal range
- **Errors**: Issued if empty or whitespace-only

### Description (Requirement 6.3)
- **Required**: Cannot be empty
- **Optimal length**: 150-160 characters
- **Warnings**: Issued if outside optimal range
- **Errors**: Issued if empty or whitespace-only

## Generated Tags

### Open Graph Tags (Requirement 6.5)
- `og:title` - Page title
- `og:description` - Page description
- `og:url` - Canonical URL
- `og:type` - Content type (website/article)
- `og:image` - Social media image (1200x630)
- `og:image:width` - Image width
- `og:image:height` - Image height
- `og:image:alt` - Image alt text

### Twitter Card Tags (Requirement 6.6)
- `twitter:card` - Card type (summary_large_image)
- `twitter:title` - Page title
- `twitter:description` - Page description
- `twitter:image` - Social media image

### Additional Tags
- `keywords` - Comma-separated keywords (Requirement 6.4)
- `canonical` - Canonical URL (Requirement 6.12)

## Default Values

- **Default OG Image**: `https://ai.futurelinks.art/og-default.png`
- **Default Type**: `website`
- **Twitter Card Type**: Always `summary_large_image`
- **OG Image Dimensions**: 1200x630 (optimal for social media)

## Development Mode

In development mode, the utility logs warnings to the console when titles or descriptions are outside the optimal range. These warnings are suppressed in production.

## Error Handling

The `generateMetaTags` function throws an error if validation fails:

```typescript
try {
  const tags = generateMetaTags(config);
} catch (error) {
  console.error('Meta tag generation failed:', error.message);
  // Handle error appropriately
}
```

## Best Practices

1. **Title Length**: Keep titles between 50-60 characters for optimal display in search results
2. **Description Length**: Keep descriptions between 150-160 characters for optimal display
3. **Keywords**: Include 3-7 relevant keywords for SEO
4. **Images**: Use high-quality images at 1200x630 resolution for social media
5. **Canonical URLs**: Always use absolute URLs with HTTPS
6. **Type Selection**: Use 'article' for blog posts, 'website' for other pages

## Testing

The utility includes comprehensive unit tests covering:
- Title validation (optimal length, too short, too long, empty)
- Description validation (optimal length, too short, too long, empty)
- Complete meta tag generation
- Open Graph tag generation
- Twitter Card tag generation
- Edge cases (exact boundaries, special characters, empty arrays)

Run tests with:
```bash
npm test -- __tests__/meta.test.ts
```

## Requirements Coverage

- **6.2**: Meta title tags with 50-60 character length ✓
- **6.3**: Meta description tags with 150-160 character length ✓
- **6.4**: Meta keywords tags ✓
- **6.5**: Open Graph tags (og:title, og:description, og:image, og:url, og:type) ✓
- **6.6**: Twitter Card tags (twitter:card, twitter:title, twitter:description, twitter:image) ✓
