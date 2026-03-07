/**
 * Canonical URL Utility
 * 
 * Generates canonical URLs for all public pages to prevent duplicate content issues
 * and guide search engines and AI crawlers to authoritative content versions.
 * 
 * Requirements: 19.8, 6.12
 */

const PRODUCTION_DOMAIN = 'https://ai.futurelinks.art';

/**
 * Generate canonical URL for a given path
 * 
 * @param path - The path relative to the domain (e.g., '/', '/blog', '/blog/my-post')
 * @returns The full canonical URL
 */
export function generateCanonicalUrl(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Remove any double slashes
  const cleanedPath = normalizedPath.replace(/\/+/g, '/');
  
  // Remove trailing slash unless it's the root path
  const finalPath = cleanedPath === '/' 
    ? cleanedPath 
    : cleanedPath.replace(/\/$/, '');
  
  return `${PRODUCTION_DOMAIN}${finalPath}`;
}

/**
 * Get canonical URL for the landing page
 */
export function getLandingPageCanonicalUrl(): string {
  return generateCanonicalUrl('/');
}

/**
 * Get canonical URL for the blog list page
 */
export function getBlogListCanonicalUrl(): string {
  return generateCanonicalUrl('/blog');
}

/**
 * Get canonical URL for a blog post
 * 
 * @param slug - The blog post slug
 */
export function getBlogPostCanonicalUrl(slug: string): string {
  return generateCanonicalUrl(`/blog/${slug}`);
}

/**
 * Get canonical URL for the chat page
 */
export function getChatPageCanonicalUrl(): string {
  return generateCanonicalUrl('/chat');
}
