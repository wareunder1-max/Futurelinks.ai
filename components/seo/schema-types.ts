/**
 * Type definitions for common Schema.org structured data types
 * These types provide type safety when creating JSON-LD schemas
 */

/**
 * Base Schema.org type with common properties
 */
interface SchemaBase {
  '@context': 'https://schema.org';
  '@type': string;
}

/**
 * Organization schema type
 * Used for representing the organization/company
 */
export interface OrganizationSchema extends SchemaBase {
  '@type': 'Organization';
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[]; // Social media profiles
  contactPoint?: {
    '@type': 'ContactPoint';
    telephone?: string;
    contactType?: string;
    email?: string;
  };
}

/**
 * WebSite schema type
 * Used for the main website
 */
export interface WebSiteSchema extends SchemaBase {
  '@type': 'WebSite';
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

/**
 * Person schema type
 * Used for author information
 */
export interface PersonSchema extends SchemaBase {
  '@type': 'Person';
  name: string;
  url?: string;
  image?: string;
  sameAs?: string[];
}

/**
 * ImageObject schema type
 * Used for images in other schemas
 */
export interface ImageObjectSchema extends SchemaBase {
  '@type': 'ImageObject';
  url: string;
  width?: number;
  height?: number;
  caption?: string;
}

/**
 * BlogPosting schema type
 * Used for blog post pages
 */
export interface BlogPostingSchema extends SchemaBase {
  '@type': 'BlogPosting';
  headline: string;
  author: PersonSchema | { '@type': 'Person'; name: string };
  datePublished: string; // ISO 8601 format
  dateModified: string; // ISO 8601 format
  image?: string | ImageObjectSchema;
  articleBody?: string;
  description?: string;
  keywords?: string | string[];
  publisher?: OrganizationSchema | { '@type': 'Organization'; name: string; logo?: ImageObjectSchema };
  mainEntityOfPage?: string;
}

/**
 * BreadcrumbList schema type
 * Used for breadcrumb navigation
 */
export interface BreadcrumbListSchema extends SchemaBase {
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item: string;
  }>;
}

/**
 * FAQPage schema type
 * Used for FAQ pages
 */
export interface FAQPageSchema extends SchemaBase {
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

/**
 * Article schema type
 * Used for article pages
 */
export interface ArticleSchema extends SchemaBase {
  '@type': 'Article';
  headline: string;
  author: PersonSchema | { '@type': 'Person'; name: string };
  datePublished: string;
  dateModified?: string;
  image?: string | ImageObjectSchema;
  articleBody?: string;
  description?: string;
  publisher?: OrganizationSchema;
}

/**
 * Union type of all supported schema types
 */
export type SchemaType =
  | OrganizationSchema
  | WebSiteSchema
  | PersonSchema
  | ImageObjectSchema
  | BlogPostingSchema
  | BreadcrumbListSchema
  | FAQPageSchema
  | ArticleSchema;
