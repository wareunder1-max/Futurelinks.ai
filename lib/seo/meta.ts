/**
 * Meta Tag Generator Utility
 * 
 * Generates SEO meta tags for Next.js metadata API
 * Validates tag length constraints per requirements 6.2-6.6
 */

export interface MetaTagsConfig {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl: string;
  type?: 'website' | 'article';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates title length (50-60 characters optimal)
 * Requirement 6.2: Title should be 50-60 characters
 */
export function validateTitle(title: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!title || title.trim().length === 0) {
    errors.push('Title cannot be empty');
  } else if (title.length < 50) {
    warnings.push(`Title is ${title.length} characters (recommended: 50-60)`);
  } else if (title.length > 60) {
    warnings.push(`Title is ${title.length} characters (recommended: 50-60)`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates description length (150-160 characters optimal)
 * Requirement 6.3: Description should be 150-160 characters
 */
export function validateDescription(description: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!description || description.trim().length === 0) {
    errors.push('Description cannot be empty');
  } else if (description.length < 150) {
    warnings.push(`Description is ${description.length} characters (recommended: 150-160)`);
  } else if (description.length > 160) {
    warnings.push(`Description is ${description.length} characters (recommended: 150-160)`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Generates complete meta tags for Next.js metadata API
 * Requirements 6.2, 6.3, 6.4, 6.5, 6.6
 */
export function generateMetaTags(config: MetaTagsConfig) {
  // Validate inputs
  const titleValidation = validateTitle(config.title);
  const descValidation = validateDescription(config.description);
  
  if (!titleValidation.isValid || !descValidation.isValid) {
    const allErrors = [...titleValidation.errors, ...descValidation.errors];
    throw new Error(`Meta tag validation failed: ${allErrors.join(', ')}`);
  }
  
  // Log warnings in development
  if (process.env.NODE_ENV === 'development') {
    const allWarnings = [...titleValidation.warnings, ...descValidation.warnings];
    if (allWarnings.length > 0) {
      console.warn('Meta tag warnings:', allWarnings);
    }
  }
  
  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords?.join(', '),
    openGraph: generateOpenGraphTags(config),
    twitter: generateTwitterCardTags(config),
    alternates: {
      canonical: config.canonicalUrl
    }
  };
}

/**
 * Generates Open Graph tags for social media sharing
 * Requirement 6.5: og:title, og:description, og:image, og:url, og:type
 */
export function generateOpenGraphTags(config: MetaTagsConfig) {
  return {
    title: config.title,
    description: config.description,
    url: config.canonicalUrl,
    type: config.type || 'website',
    images: [
      {
        url: config.ogImage || 'https://ai.futurelinks.art/og-default.png',
        width: 1200,
        height: 630,
        alt: config.title
      }
    ]
  };
}

/**
 * Generates Twitter Card tags for Twitter sharing
 * Requirement 6.6: twitter:card, twitter:title, twitter:description, twitter:image
 */
export function generateTwitterCardTags(config: MetaTagsConfig) {
  return {
    card: 'summary_large_image',
    title: config.title,
    description: config.description,
    images: [config.ogImage || 'https://ai.futurelinks.art/og-default.png']
  };
}
