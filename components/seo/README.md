# SEO Components

This directory contains components and utilities for SEO optimization, including JSON-LD structured data support.

## JsonLd Component

The `JsonLd` component provides a type-safe way to embed Schema.org structured data in your pages using JSON-LD format.

### Features

- Type-safe props for different schema types
- Automatic JSON serialization and escaping
- Proper script tag generation
- Support for all Schema.org vocabulary types

### Basic Usage

```tsx
import { JsonLd } from '@/components/seo/JsonLd';

export default function Page() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'AI FutureLinks',
          url: 'https://ai.futurelinks.art',
          logo: 'https://ai.futurelinks.art/logo.png',
          description: 'Model-agnostic AI workspace for the 2026 workflow',
        }}
      />
      {/* Your page content */}
    </>
  );
}
```

### Type-Safe Usage

Use the provided TypeScript types for better type safety:

```tsx
import { JsonLd } from '@/components/seo/JsonLd';
import type { OrganizationSchema } from '@/components/seo/schema-types';

export default function Page() {
  const organizationData: OrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AI FutureLinks',
    url: 'https://ai.futurelinks.art',
    logo: 'https://ai.futurelinks.art/logo.png',
    description: 'Model-agnostic AI workspace',
  };

  return (
    <>
      <JsonLd data={organizationData} />
      {/* Your page content */}
    </>
  );
}
```

### Common Schema Examples

#### Organization Schema (Landing Page)

```tsx
import { JsonLd } from '@/components/seo/JsonLd';
import type { OrganizationSchema } from '@/components/seo/schema-types';

const organizationSchema: OrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AI FutureLinks',
  url: 'https://ai.futurelinks.art',
  logo: 'https://ai.futurelinks.art/logo.png',
  description: 'Model-agnostic AI workspace for the 2026 workflow',
  sameAs: [
    'https://twitter.com/aifuturelinks',
    'https://github.com/aifuturelinks',
  ],
};

<JsonLd data={organizationSchema} />
```

#### WebSite Schema (Landing Page)

```tsx
import { JsonLd } from '@/components/seo/JsonLd';
import type { WebSiteSchema } from '@/components/seo/schema-types';

const websiteSchema: WebSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AI FutureLinks',
  url: 'https://ai.futurelinks.art',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://ai.futurelinks.art/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

<JsonLd data={websiteSchema} />
```

#### BlogPosting Schema (Blog Post Page)

```tsx
import { JsonLd } from '@/components/seo/JsonLd';
import type { BlogPostingSchema } from '@/components/seo/schema-types';

const blogPostSchema: BlogPostingSchema = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: 'Getting Started with AI FutureLinks',
  author: {
    '@type': 'Person',
    name: 'AI FutureLinks Team',
  },
  datePublished: '2024-01-15T10:00:00Z',
  dateModified: '2024-01-20T15:30:00Z',
  image: 'https://ai.futurelinks.art/blog/getting-started.png',
  articleBody: 'Full article content here...',
  publisher: {
    '@type': 'Organization',
    name: 'AI FutureLinks',
    logo: {
      '@type': 'ImageObject',
      url: 'https://ai.futurelinks.art/logo.png',
    },
  },
};

<JsonLd data={blogPostSchema} />
```

#### BreadcrumbList Schema (Blog Post Page)

```tsx
import { JsonLd } from '@/components/seo/JsonLd';
import type { BreadcrumbListSchema } from '@/components/seo/schema-types';

const breadcrumbSchema: BreadcrumbListSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://ai.futurelinks.art',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Blog',
      item: 'https://ai.futurelinks.art/blog',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Getting Started',
      item: 'https://ai.futurelinks.art/blog/getting-started',
    },
  ],
};

<JsonLd data={breadcrumbSchema} />
```

#### FAQPage Schema (FAQ Page)

```tsx
import { JsonLd } from '@/components/seo/JsonLd';
import type { FAQPageSchema } from '@/components/seo/schema-types';

const faqSchema: FAQPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is AI FutureLinks?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AI FutureLinks is a model-agnostic AI workspace that allows you to switch between different AI providers like OpenAI and Google Gemini.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does it work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The platform acts as a proxy layer, routing your requests to external AI providers using admin-configured API keys.',
      },
    },
  ],
};

<JsonLd data={faqSchema} />
```

### Multiple Schemas on One Page

You can include multiple JSON-LD schemas on a single page:

```tsx
import { JsonLd } from '@/components/seo/JsonLd';

export default function BlogPostPage() {
  return (
    <>
      {/* Organization schema */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'AI FutureLinks',
          url: 'https://ai.futurelinks.art',
        }}
      />

      {/* BlogPosting schema */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: 'My Blog Post',
          author: { '@type': 'Person', name: 'Author Name' },
          datePublished: '2024-01-15T10:00:00Z',
          dateModified: '2024-01-20T15:30:00Z',
        }}
      />

      {/* Breadcrumb schema */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ai.futurelinks.art' },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://ai.futurelinks.art/blog' },
          ],
        }}
      />

      {/* Your page content */}
    </>
  );
}
```

### Security

The component uses React's `dangerouslySetInnerHTML` with `JSON.stringify()`, which automatically handles proper escaping of special characters. This prevents XSS vulnerabilities while embedding structured data.

### Validation

To validate your JSON-LD structured data:

1. Use Google's [Rich Results Test](https://search.google.com/test/rich-results)
2. Use Google's [Schema Markup Validator](https://validator.schema.org/)
3. Check the [Schema.org documentation](https://schema.org/) for specific schema types

### Requirements

This component validates the following requirements:
- **Requirement 18.1**: Implements JSON-LD structured data using Schema.org vocabulary
- **Requirement 18.8**: Embeds JSON-LD scripts in the head section of HTML documents

### Related Files

- `JsonLd.tsx` - The main component
- `schema-types.ts` - TypeScript type definitions for common Schema.org types
- `__tests__/json-ld.test.ts` - Unit tests for JSON serialization and escaping
