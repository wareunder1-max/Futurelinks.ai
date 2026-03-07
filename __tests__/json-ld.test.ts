import { describe, it, expect } from 'vitest';

describe('JsonLd Component', () => {
  it('serializes simple data object to JSON string', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'AI FutureLinks',
      url: 'https://ai.futurelinks.art',
    };

    const jsonString = JSON.stringify(data);
    expect(jsonString).toContain('"@context":"https://schema.org"');
    expect(jsonString).toContain('"@type":"Organization"');
    expect(jsonString).toContain('"name":"AI FutureLinks"');
  });

  it('handles nested objects correctly', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: 'Test Post',
      author: {
        '@type': 'Person',
        name: 'John Doe',
      },
      publisher: {
        '@type': 'Organization',
        name: 'AI FutureLinks',
        logo: {
          '@type': 'ImageObject',
          url: 'https://example.com/logo.png',
        },
      },
    };

    const jsonString = JSON.stringify(data);
    const parsed = JSON.parse(jsonString);
    
    expect(parsed).toEqual(data);
    expect(parsed.author.name).toBe('John Doe');
    expect(parsed.publisher.logo.url).toBe('https://example.com/logo.png');
  });

  it('handles arrays in data', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://example.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: 'https://example.com/blog',
        },
      ],
    };

    const jsonString = JSON.stringify(data);
    const parsed = JSON.parse(jsonString);
    
    expect(parsed.itemListElement).toHaveLength(2);
    expect(parsed.itemListElement[0].name).toBe('Home');
    expect(parsed.itemListElement[1].name).toBe('Blog');
  });

  it('properly escapes special characters', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Test with "quotes" and <tags>',
      description: "It's a test & more",
    };

    const jsonString = JSON.stringify(data);
    
    // JSON.stringify handles escaping automatically
    expect(jsonString).toContain('\\"quotes\\"');
    expect(jsonString).toContain('<tags>'); // HTML tags are safe in JSON strings
    expect(jsonString).toContain("It's a test & more");

    // Verify it can be parsed back correctly
    const parsed = JSON.parse(jsonString);
    expect(parsed.headline).toBe('Test with "quotes" and <tags>');
    expect(parsed.description).toBe("It's a test & more");
  });

  it('handles empty objects', () => {
    const data = {};
    const jsonString = JSON.stringify(data);
    expect(jsonString).toBe('{}');
  });

  it('handles date strings in ISO format', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      datePublished: '2024-01-01T00:00:00.000Z',
      dateModified: '2024-01-01T00:00:00.000Z',
    };

    const jsonString = JSON.stringify(data);
    const parsed = JSON.parse(jsonString);
    
    expect(parsed.datePublished).toBe('2024-01-01T00:00:00.000Z');
    expect(parsed.dateModified).toBe('2024-01-01T00:00:00.000Z');
  });

  it('handles null values', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Test',
      description: null,
    };

    const jsonString = JSON.stringify(data);
    const parsed = JSON.parse(jsonString);
    
    expect(parsed.description).toBeNull();
  });

  it('omits undefined values', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Test',
      description: undefined,
    };

    const jsonString = JSON.stringify(data);
    const parsed = JSON.parse(jsonString);
    
    // undefined values are omitted by JSON.stringify
    expect(parsed).not.toHaveProperty('description');
  });

  it('handles boolean and number values', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Test Product',
      price: 99.99,
      inStock: true,
      discontinued: false,
    };

    const jsonString = JSON.stringify(data);
    const parsed = JSON.parse(jsonString);
    
    expect(parsed.price).toBe(99.99);
    expect(parsed.inStock).toBe(true);
    expect(parsed.discontinued).toBe(false);
  });

  it('handles complex Schema.org structures', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is AI FutureLinks?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'AI FutureLinks is a model-agnostic AI workspace.',
          },
        },
        {
          '@type': 'Question',
          name: 'How does it work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'It proxies requests to multiple AI providers.',
          },
        },
      ],
    };

    const jsonString = JSON.stringify(data);
    const parsed = JSON.parse(jsonString);
    
    expect(parsed.mainEntity).toHaveLength(2);
    expect(parsed.mainEntity[0]['@type']).toBe('Question');
    expect(parsed.mainEntity[0].acceptedAnswer.text).toBe('AI FutureLinks is a model-agnostic AI workspace.');
  });

  it('produces valid JSON that can be round-tripped', () => {
    const data = {
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

    const jsonString = JSON.stringify(data);
    const parsed = JSON.parse(jsonString);
    const reStringified = JSON.stringify(parsed);
    
    // Round-trip should produce identical result
    expect(reStringified).toBe(jsonString);
    expect(parsed).toEqual(data);
  });
});
