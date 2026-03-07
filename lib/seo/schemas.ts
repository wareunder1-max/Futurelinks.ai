/**
 * Schema.org JSON-LD Generator Functions
 * 
 * This module provides functions to generate Schema.org structured data
 * for various page types. These schemas help search engines and AI systems
 * understand and extract key information from our pages.
 * 
 * Validates: Requirements 18.2, 18.3, 18.4, 18.5, 18.6
 */

import type {
  OrganizationSchema,
  WebSiteSchema,
  BlogPostingSchema,
  BreadcrumbListSchema,
  FAQPageSchema,
  ImageObjectSchema,
} from '@/components/seo/schema-types';

/**
 * Configuration for Organization schema
 */
export interface OrganizationConfig {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
  contactPoint?: {
    telephone?: string;
    contactType?: string;
    email?: string;
  };
}

/**
 * Configuration for WebSite schema
 */
export interface WebSiteConfig {
  name: string;
  url: string;
  description?: string;
  searchUrl?: string;
}

/**
 * Configuration for BlogPosting schema
 */
export interface BlogPostingConfig {
  headline: string;
  author: string | { name: string; url?: string };
  datePublished: Date | string;
  dateModified: Date | string;
  image?: string;
  articleBody?: string;
  description?: string;
  keywords?: string[];
  url?: string;
}

/**
 * Configuration for BreadcrumbList schema
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Configuration for FAQPage schema
 */
export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Generate Organization schema
 * 
 * Creates a Schema.org Organization structured data object representing
 * the company/organization. This should be included on the landing page.
 * 
 * @param config - Organization configuration
 * @returns OrganizationSchema object
 * 
 * @example
 * ```ts
 * const schema = generateOrganizationSchema({
 *   name: "AI FutureLinks",
 *   url: "https://ai.futurelinks.art",
 *   logo: "https://ai.futurelinks.art/logo.png",
 *   description: "Model-agnostic AI workspace"
 * });
 * ```
 * 
 * Validates: Requirement 18.2
 */
export function generateOrganizationSchema(
  config: OrganizationConfig
): OrganizationSchema {
  const schema: OrganizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: config.name,
    url: config.url,
  };

  if (config.logo) {
    schema.logo = config.logo;
  }

  if (config.description) {
    schema.description = config.description;
  }

  if (config.sameAs && config.sameAs.length > 0) {
    schema.sameAs = config.sameAs;
  }

  if (config.contactPoint) {
    schema.contactPoint = {
      '@type': 'ContactPoint',
      ...config.contactPoint,
    };
  }

  return schema;
}

/**
 * Generate WebSite schema
 * 
 * Creates a Schema.org WebSite structured data object with search action.
 * This should be included on the landing page to enable site search in
 * search engine results.
 * 
 * @param config - WebSite configuration
 * @returns WebSiteSchema object
 * 
 * @example
 * ```ts
 * const schema = generateWebSiteSchema({
 *   name: "AI FutureLinks",
 *   url: "https://ai.futurelinks.art",
 *   searchUrl: "https://ai.futurelinks.art/search?q={search_term_string}"
 * });
 * ```
 * 
 * Validates: Requirement 18.3
 */
export function generateWebSiteSchema(config: WebSiteConfig): WebSiteSchema {
  const schema: WebSiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.name,
    url: config.url,
  };

  if (config.description) {
    schema.description = config.description;
  }

  if (config.searchUrl) {
    schema.potentialAction = {
      '@type': 'SearchAction',
      target: config.searchUrl,
      'query-input': 'required name=search_term_string',
    };
  }

  return schema;
}

/**
 * Generate BlogPosting schema
 * 
 * Creates a Schema.org BlogPosting structured data object for blog posts.
 * This helps search engines and AI systems understand the article content,
 * author, publication dates, and other metadata.
 * 
 * @param config - BlogPosting configuration
 * @returns BlogPostingSchema object
 * 
 * @example
 * ```ts
 * const schema = generateBlogPostingSchema({
 *   headline: "Getting Started with AI",
 *   author: "John Doe",
 *   datePublished: new Date("2024-01-15"),
 *   dateModified: new Date("2024-01-20"),
 *   image: "https://example.com/image.jpg",
 *   articleBody: "Full article content...",
 *   keywords: ["AI", "machine learning"]
 * });
 * ```
 * 
 * Validates: Requirement 18.4
 */
export function generateBlogPostingSchema(
  config: BlogPostingConfig
): BlogPostingSchema {
  // Convert dates to ISO 8601 format
  const datePublished =
    typeof config.datePublished === 'string'
      ? config.datePublished
      : config.datePublished.toISOString();

  const dateModified =
    typeof config.dateModified === 'string'
      ? config.dateModified
      : config.dateModified.toISOString();

  // Handle author - can be string or object
  const author =
    typeof config.author === 'string'
      ? { '@type': 'Person' as const, name: config.author }
      : { '@type': 'Person' as const, ...config.author };

  const schema: BlogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: config.headline,
    author,
    datePublished,
    dateModified,
  };

  if (config.image) {
    schema.image = config.image;
  }

  if (config.articleBody) {
    schema.articleBody = config.articleBody;
  }

  if (config.description) {
    schema.description = config.description;
  }

  if (config.keywords && config.keywords.length > 0) {
    schema.keywords = config.keywords;
  }

  if (config.url) {
    schema.mainEntityOfPage = config.url;
  }

  // Add publisher information (AI FutureLinks)
  schema.publisher = {
    '@type': 'Organization',
    name: 'AI FutureLinks',
    logo: {
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      url: 'https://ai.futurelinks.art/logo.png',
    },
  };

  return schema;
}

/**
 * Generate BreadcrumbList schema
 * 
 * Creates a Schema.org BreadcrumbList structured data object showing
 * the navigation hierarchy. This helps users and search engines understand
 * the page's position in the site structure.
 * 
 * @param items - Array of breadcrumb items in order from root to current page
 * @returns BreadcrumbListSchema object
 * 
 * @example
 * ```ts
 * const schema = generateBreadcrumbListSchema([
 *   { name: "Home", url: "https://ai.futurelinks.art" },
 *   { name: "Blog", url: "https://ai.futurelinks.art/blog" },
 *   { name: "Article Title", url: "https://ai.futurelinks.art/blog/article" }
 * ]);
 * ```
 * 
 * Validates: Requirement 18.6
 */
export function generateBreadcrumbListSchema(
  items: BreadcrumbItem[]
): BreadcrumbListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate FAQPage schema
 * 
 * Creates a Schema.org FAQPage structured data object with question-answer
 * pairs. This enables rich results in search engines showing FAQ content
 * directly in search results.
 * 
 * @param faqs - Array of FAQ items with questions and answers
 * @returns FAQPageSchema object
 * 
 * @example
 * ```ts
 * const schema = generateFAQPageSchema([
 *   {
 *     question: "What is AI FutureLinks?",
 *     answer: "AI FutureLinks is a model-agnostic AI workspace..."
 *   },
 *   {
 *     question: "How do I get started?",
 *     answer: "Simply sign in with your Google account..."
 *   }
 * ]);
 * ```
 * 
 * Validates: Requirement 18.5
 */
export function generateFAQPageSchema(faqs: FAQItem[]): FAQPageSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
