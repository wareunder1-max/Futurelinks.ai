# AI-Specific Meta Tags

This document describes the AI-specific meta tags implementation for controlling AI crawler behavior on the AI FutureLinks platform.

## Overview

AI-specific meta tags provide guidance to AI systems (GPTBot, ClaudeBot, Google-Extended, CCBot, anthropic-ai) about how to handle and index content. These tags complement the robots.txt directives and provide page-level control over AI crawler behavior.

**Requirements:** 19.6

## Implementation

### Meta Tag Structure

The implementation uses two types of meta tags:

1. **Robots Meta Tags**: Standard robots directives that AI crawlers respect
2. **AI Content Declaration**: Custom meta tag for explicit AI crawler guidance

### Robots Directives

```typescript
{
  robots: {
    index: boolean,           // Allow/disallow indexing
    follow: boolean,          // Allow/disallow following links
    'max-snippet': number,    // Maximum text snippet length (-1 = unlimited, 0 = none)
    'max-image-preview': string, // Image preview size ('large', 'standard', 'none')
    'max-video-preview': number  // Maximum video preview length in seconds (-1 = unlimited)
  }
}
```

### AI Content Declaration

Custom meta tag format:
```html
<meta name="ai-content-declaration" content="indexable, trainable, citable" />
```

Values:
- **indexable/noindex**: Whether AI systems can index this content
- **trainable/notrain**: Whether AI systems can use this content for training
- **citable/nocite**: Whether AI systems can cite/reference this content

## Usage

### In Next.js Pages

Import and spread the AI meta tags into your metadata export:

```typescript
import { Metadata } from 'next';
import { defaultAIMetaTags } from '@/lib/seo/ai-meta-tags';

export const metadata: Metadata = {
  title: 'Your Page Title',
  description: 'Your page description',
  ...defaultAIMetaTags, // Add AI meta tags
  // ... other metadata
};
```

### Preset Configurations

Three preset configurations are available:

#### 1. Default (Permissive)
```typescript
import { defaultAIMetaTags } from '@/lib/seo/ai-meta-tags';
```
- Allows indexing, training, and citation
- Use for: Public content, blog posts, landing pages
- Declaration: `indexable, trainable, citable`

#### 2. Restrictive
```typescript
import { restrictiveAIMetaTags } from '@/lib/seo/ai-meta-tags';
```
- Allows indexing but prevents training and citation
- Use for: Sensitive content that should be discoverable but not used for training
- Declaration: `indexable, notrain, nocite`

#### 3. Private
```typescript
import { privateAIMetaTags } from '@/lib/seo/ai-meta-tags';
```
- Blocks all AI crawler access
- Use for: Admin pages, private content, authentication pages
- Declaration: `noindex, notrain, nocite`

### Custom Configuration

For custom control, use the `generateAIMetaTags()` function:

```typescript
import { generateAIMetaTags } from '@/lib/seo/ai-meta-tags';

const customTags = generateAIMetaTags({
  allowIndex: true,
  allowTraining: false,
  allowCitation: true,
});

export const metadata: Metadata = {
  // ... other metadata
  ...customTags,
};
```

## Current Implementation

All public pages include AI meta tags:

### Landing Page (`app/page.tsx`)
- Uses `defaultAIMetaTags`
- Allows full AI crawler access
- Enables indexing, training, and citation

### Blog List Page (`app/blog/page.tsx`)
- Uses `defaultAIMetaTags`
- Allows full AI crawler access
- Enables indexing, training, and citation

### Blog Post Detail Page (`app/blog/[slug]/page.tsx`)
- Uses `defaultAIMetaTags`
- Allows full AI crawler access
- Enables indexing, training, and citation
- Includes BlogPosting schema for enhanced AI understanding

### Chat Page (`app/chat/page.tsx`)
- Uses `defaultAIMetaTags`
- Allows full AI crawler access
- Enables indexing, training, and citation

## How AI Crawlers Use These Tags

### GPTBot (OpenAI)
- Respects robots meta tags
- Uses content for training and answering queries
- Honors `max-snippet` and `max-image-preview` directives

### ClaudeBot (Anthropic)
- Respects robots meta tags
- Uses content for training Claude models
- Honors indexing and snippet directives

### Google-Extended
- Respects robots meta tags
- Uses content for Bard/Gemini training
- Separate from Googlebot (traditional search)

### CCBot (Common Crawl)
- Respects robots meta tags
- Archives web content for AI training datasets
- Used by multiple AI companies

### anthropic-ai
- Respects robots meta tags
- Anthropic's research crawler
- Collects data for AI safety research

## Relationship with robots.txt

The AI meta tags work in conjunction with robots.txt:

- **robots.txt**: Site-wide directives for all pages
- **Meta tags**: Page-level overrides and additional guidance

Example robots.txt (already implemented in task 7.6):
```
User-agent: GPTBot
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: ClaudeBot
Allow: /
Disallow: /admin/
Disallow: /api/
```

## Testing

### Unit Tests
Location: `__tests__/ai-meta-tags.test.ts`

Tests the `generateAIMetaTags()` function and preset configurations.

### Integration Tests
Location: `__tests__/ai-meta-tags-integration.test.ts`

Verifies that AI meta tags are properly included in all public pages.

Run tests:
```bash
npm test -- __tests__/ai-meta-tags.test.ts --run
npm test -- __tests__/ai-meta-tags-integration.test.ts --run
```

## Best Practices

1. **Use Default Tags for Public Content**: Most public pages should use `defaultAIMetaTags` to maximize discoverability

2. **Be Consistent**: Use the same configuration across similar content types

3. **Consider Privacy**: Use `restrictiveAIMetaTags` or `privateAIMetaTags` for sensitive content

4. **Test Regularly**: Verify meta tags are present using browser dev tools or automated tests

5. **Monitor AI Crawler Traffic**: Check server logs for AI crawler activity to ensure tags are being respected

## Verification

To verify AI meta tags are present on a page:

1. Open the page in a browser
2. View page source (Ctrl+U or Cmd+U)
3. Look for meta tags in the `<head>` section:
   ```html
   <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
   <meta name="ai-content-declaration" content="indexable, trainable, citable" />
   ```

## Future Enhancements

Potential improvements for future iterations:

1. **Dynamic Configuration**: Allow per-post AI crawler settings in the CMS
2. **Analytics Integration**: Track which AI crawlers are accessing content
3. **Rate Limiting**: Implement crawler-specific rate limits
4. **Content Licensing**: Add licensing information for AI training usage
5. **Opt-out Mechanism**: Provide user-facing controls for AI crawler permissions

## References

- [OpenAI GPTBot Documentation](https://platform.openai.com/docs/gptbot)
- [Anthropic ClaudeBot Documentation](https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Google-Extended Documentation](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers)
- [Robots Meta Tag Specification](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)

## Support

For questions or issues related to AI meta tags:
1. Check this documentation
2. Review test files for examples
3. Consult the design document (section on AI Crawler Accessibility)
4. Review requirement 19.6 in requirements.md
