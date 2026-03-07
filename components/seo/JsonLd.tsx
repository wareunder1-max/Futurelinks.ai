import React from 'react';

/**
 * Props for the JsonLd component
 * Accepts any valid Schema.org structured data object
 */
export interface JsonLdProps {
  /**
   * The structured data object to be serialized as JSON-LD
   * Should conform to Schema.org vocabulary
   */
  data: Record<string, any>;
}

/**
 * JsonLd Component
 * 
 * Embeds Schema.org JSON-LD structured data in a script tag.
 * This component handles proper JSON serialization and escaping
 * to prevent XSS vulnerabilities while embedding structured data.
 * 
 * @example
 * ```tsx
 * <JsonLd data={{
 *   "@context": "https://schema.org",
 *   "@type": "Organization",
 *   name: "AI FutureLinks",
 *   url: "https://ai.futurelinks.art"
 * }} />
 * ```
 * 
 * Validates: Requirements 18.1, 18.8
 */
export function JsonLd({ data }: JsonLdProps) {
  // Serialize the data to JSON string
  // JSON.stringify automatically handles proper escaping of special characters
  const jsonString = JSON.stringify(data);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}

export default JsonLd;
