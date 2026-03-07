/**
 * AI-Specific Meta Tags Utility
 * 
 * Provides meta tags for controlling AI crawler behavior on public pages.
 * These tags guide AI systems (GPTBot, ClaudeBot, Google-Extended, etc.)
 * on how to handle and index content.
 * 
 * Requirements: 19.6
 */

export interface AIMetaTagsConfig {
  /**
   * Whether to allow AI crawlers to index this page
   * @default true
   */
  allowIndex?: boolean;

  /**
   * Whether to allow AI systems to use this content for training
   * @default true
   */
  allowTraining?: boolean;

  /**
   * Whether to allow AI systems to cite/reference this content
   * @default true
   */
  allowCitation?: boolean;
}

/**
 * Generate AI-specific meta tags for inclusion in Next.js metadata
 * 
 * Returns an object with robots directives that AI crawlers respect.
 * These tags provide guidance to AI systems about content usage.
 * 
 * @param config - Configuration for AI crawler behavior
 * @returns Object with robots meta tag value
 * 
 * @example
 * ```typescript
 * // In a Next.js page
 * export const metadata: Metadata = {
 *   ...generateAIMetaTags({ allowIndex: true, allowTraining: true }),
 *   // ... other metadata
 * };
 * ```
 */
export function generateAIMetaTags(config: AIMetaTagsConfig = {}): {
  robots: {
    index: boolean;
    follow: boolean;
    'max-snippet': number;
    'max-image-preview': 'large' | 'standard' | 'none';
    'max-video-preview': number;
  };
  other: {
    'ai-content-declaration': string;
  };
} {
  const {
    allowIndex = true,
    allowTraining = true,
    allowCitation = true,
  } = config;

  // Build robots directives
  // These are respected by both traditional search engines and AI crawlers
  const robotsDirectives = {
    index: allowIndex,
    follow: allowIndex,
    'max-snippet': allowCitation ? -1 : 0, // -1 = no limit, 0 = no snippet
    'max-image-preview': (allowCitation ? 'large' : 'none') as 'large' | 'standard' | 'none',
    'max-video-preview': allowCitation ? -1 : 0,
  };

  // AI content declaration meta tag
  // This is an emerging standard for declaring AI crawler permissions
  const aiDeclaration = [
    allowIndex ? 'indexable' : 'noindex',
    allowTraining ? 'trainable' : 'notrain',
    allowCitation ? 'citable' : 'nocite',
  ].join(', ');

  return {
    robots: robotsDirectives,
    other: {
      'ai-content-declaration': aiDeclaration,
    },
  };
}

/**
 * Default AI meta tags for public pages
 * Allows indexing, training, and citation by AI systems
 */
export const defaultAIMetaTags = generateAIMetaTags({
  allowIndex: true,
  allowTraining: true,
  allowCitation: true,
});

/**
 * Restrictive AI meta tags for sensitive content
 * Prevents AI training and citation while allowing indexing
 */
export const restrictiveAIMetaTags = generateAIMetaTags({
  allowIndex: true,
  allowTraining: false,
  allowCitation: false,
});

/**
 * Private AI meta tags for non-public content
 * Blocks all AI crawler access
 */
export const privateAIMetaTags = generateAIMetaTags({
  allowIndex: false,
  allowTraining: false,
  allowCitation: false,
});
