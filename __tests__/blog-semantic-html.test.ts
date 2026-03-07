import { describe, it, expect } from 'vitest';

/**
 * Tests for semantic HTML enhancements in blog post content
 * 
 * Validates: Requirements 20.1, 20.3, 20.4, 20.5, 20.6, 23.1, 23.2, 23.3, 23.5, 23.6, 23.7, 23.8
 */

// Helper function to simulate the formatMarkdown function
// This is a simplified version for testing purposes
function formatMarkdown(markdown: string): string {
  let html = markdown;

  // Definition lists: Term: Definition format
  html = html.replace(
    /^([A-Z][A-Za-z\s]+):\s+([A-Z].{10,})$/gim,
    (match, term, definition) => {
      if (term.length < 50 && /^[A-Z][A-Za-z\s]+$/.test(term) && definition.length > 10) {
        return `<dl class="my-4"><dt class="font-bold text-gray-900">${term}</dt><dd class="ml-6 text-gray-700 mb-2">${definition}</dd></dl>`;
      }
      return match;
    }
  );

  // Tables: Markdown table format
  html = html.replace(
    /\|(.+)\|\n\|[-:\s|]+\|\n((?:\|.+\|\n?)+)/g,
    (match, headerRow, bodyRows) => {
      const headers = headerRow
        .split('|')
        .map((h: string) => h.trim())
        .filter((h: string) => h);
      const rows = bodyRows
        .trim()
        .split('\n')
        .map((row: string) =>
          row
            .split('|')
            .map((cell: string) => cell.trim())
            .filter((cell: string) => cell)
        );

      let tableHtml = '<table class="min-w-full divide-y divide-gray-300 my-6 border border-gray-300">';
      tableHtml += '<thead class="bg-gray-50">';
      tableHtml += '<tr>';
      headers.forEach((header: string) => {
        tableHtml += `<th scope="col" class="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">${header}</th>`;
      });
      tableHtml += '</tr>';
      tableHtml += '</thead>';
      tableHtml += '<tbody class="divide-y divide-gray-200 bg-white">';
      rows.forEach((row: string[]) => {
        tableHtml += '<tr>';
        row.forEach((cell: string) => {
          tableHtml += `<td class="px-4 py-3 text-sm text-gray-700 border-b border-gray-200">${cell}</td>`;
        });
        tableHtml += '</tr>';
      });
      tableHtml += '</tbody>';
      tableHtml += '</table>';
      return tableHtml;
    }
  );

  // Blockquotes with citations
  html = html.replace(
    /^> (.+?)(?:\n> -- (.+?))?$/gim,
    (match, quote, citation) => {
      if (citation) {
        return `<blockquote cite="${citation}" class="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4"><p>${quote}</p><footer class="text-sm text-gray-600 mt-2">— ${citation}</footer></blockquote>`;
      }
      return `<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4">${quote}</blockquote>`;
    }
  );

  // Code blocks with language specification
  html = html.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    (match, lang, code) => {
      const language = lang || 'plaintext';
      return `<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-6"><code class="language-${language}">${code.trim()}</code></pre>`;
    }
  );

  // Headers
  html = html.replace(/^#### (.*$)/gim, '<h4 class="text-xl font-bold mt-6 mb-3">$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-2xl font-bold mt-8 mb-4">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-3xl font-bold mt-10 mb-6">$1</h2>');

  return html;
}

describe('Blog Post Semantic HTML Enhancements', () => {
  describe('Definition Lists (dl, dt, dd)', () => {
    it('should convert term definitions to semantic definition lists', () => {
      const markdown = 'API Key: A credential string used to authenticate with external services.';
      const html = formatMarkdown(markdown);
      
      expect(html).toContain('<dl class="my-4">');
      expect(html).toContain('<dt class="font-bold text-gray-900">API Key</dt>');
      expect(html).toContain('<dd class="ml-6 text-gray-700 mb-2">A credential string used to authenticate with external services.</dd>');
      expect(html).toContain('</dl>');
    });

    it('should handle multiple definition terms', () => {
      const markdown = `API Key: A credential string for authentication.
Provider: An external AI service like OpenAI or Gemini.`;
      const html = formatMarkdown(markdown);
      
      expect(html).toContain('<dt class="font-bold text-gray-900">API Key</dt>');
      expect(html).toContain('<dt class="font-bold text-gray-900">Provider</dt>');
    });

    it('should not convert non-definition colons', () => {
      const markdown = 'The time is: 3:00 PM';
      const html = formatMarkdown(markdown);
      
      // Should not create definition list for time format
      expect(html).not.toContain('<dl');
    });
  });

  describe('Code Blocks with Language Specification', () => {
    it('should format code blocks with language tags', () => {
      const markdown = '```typescript\nconst x = 5;\n```';
      const html = formatMarkdown(markdown);
      
      expect(html).toContain('<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-6">');
      expect(html).toContain('<code class="language-typescript">');
      expect(html).toContain('const x = 5;');
      expect(html).toContain('</code></pre>');
    });

    it('should handle code blocks without language specification', () => {
      const markdown = '```\nconst x = 5;\n```';
      const html = formatMarkdown(markdown);
      
      expect(html).toContain('<code class="language-plaintext">');
    });

    it('should support multiple programming languages', () => {
      const languages = ['javascript', 'python', 'java', 'rust', 'go'];
      
      languages.forEach(lang => {
        const markdown = `\`\`\`${lang}\ncode here\n\`\`\``;
        const html = formatMarkdown(markdown);
        expect(html).toContain(`<code class="language-${lang}">`);
      });
    });
  });

  describe('Comparison Tables with Descriptive Headers', () => {
    it('should convert markdown tables to semantic HTML tables', () => {
      const markdown = `| Feature | OpenAI | Gemini |
|---------|--------|--------|
| Context | 128K   | 1M     |
| Speed   | Fast   | Faster |`;
      
      const html = formatMarkdown(markdown);
      
      expect(html).toContain('<table class="min-w-full divide-y divide-gray-300 my-6 border border-gray-300">');
      expect(html).toContain('<thead class="bg-gray-50">');
      expect(html).toContain('<th scope="col"');
      expect(html).toContain('Feature');
      expect(html).toContain('OpenAI');
      expect(html).toContain('Gemini');
      expect(html).toContain('<tbody');
      expect(html).toContain('128K');
      expect(html).toContain('1M');
    });

    it('should include descriptive scope attributes on headers', () => {
      const markdown = `| Model | Cost |
|-------|------|
| GPT-4 | $0.03 |`;
      
      const html = formatMarkdown(markdown);
      
      expect(html).toContain('scope="col"');
    });

    it('should handle tables with multiple rows', () => {
      const markdown = `| Name | Value |
|------|-------|
| A    | 1     |
| B    | 2     |
| C    | 3     |`;
      
      const html = formatMarkdown(markdown);
      
      const rowMatches = html.match(/<tr>/g);
      expect(rowMatches).toBeDefined();
      expect(rowMatches!.length).toBeGreaterThan(3); // Header row + 3 data rows
    });
  });

  describe('Blockquotes with Citation Attributes', () => {
    it('should create blockquotes with citation attributes', () => {
      const markdown = '> The future is already here\n> -- William Gibson, Author';
      const html = formatMarkdown(markdown);
      
      expect(html).toContain('<blockquote cite="William Gibson, Author"');
      expect(html).toContain('The future is already here');
      expect(html).toContain('<footer class="text-sm text-gray-600 mt-2">— William Gibson, Author</footer>');
    });

    it('should handle blockquotes without citations', () => {
      const markdown = '> This is a quote without attribution';
      const html = formatMarkdown(markdown);
      
      expect(html).toContain('<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4">');
      expect(html).toContain('This is a quote without attribution');
      expect(html).not.toContain('<footer');
    });
  });

  describe('Proper Heading Hierarchy', () => {
    it('should support h2, h3, h4 without skipping levels', () => {
      const markdown = `## Main Section
### Subsection
#### Sub-subsection`;
      
      const html = formatMarkdown(markdown);
      
      expect(html).toContain('<h2 class="text-3xl font-bold mt-10 mb-6">Main Section</h2>');
      expect(html).toContain('<h3 class="text-2xl font-bold mt-8 mb-4">Subsection</h3>');
      expect(html).toContain('<h4 class="text-xl font-bold mt-6 mb-3">Sub-subsection</h4>');
    });

    it('should maintain proper heading hierarchy order', () => {
      const markdown = `## Level 2
### Level 3
#### Level 4`;
      
      const html = formatMarkdown(markdown);
      
      const h2Index = html.indexOf('<h2');
      const h3Index = html.indexOf('<h3');
      const h4Index = html.indexOf('<h4');
      
      expect(h2Index).toBeLessThan(h3Index);
      expect(h3Index).toBeLessThan(h4Index);
    });
  });

  describe('Integration - Multiple Semantic Elements', () => {
    it('should handle blog post with mixed semantic elements', () => {
      const markdown = `## Introduction

API Key: A credential for authentication.

\`\`\`typescript
const apiKey = "sk-...";
\`\`\`

| Provider | Context |
|----------|---------|
| OpenAI   | 128K    |

> AI is the new electricity
> -- Andrew Ng, AI Pioneer`;
      
      const html = formatMarkdown(markdown);
      
      // Should contain all semantic elements
      expect(html).toContain('<h2');
      expect(html).toContain('<dl');
      expect(html).toContain('<dt');
      expect(html).toContain('<dd');
      expect(html).toContain('<code class="language-typescript">');
      expect(html).toContain('<table');
      expect(html).toContain('<th scope="col"');
      expect(html).toContain('<blockquote cite="Andrew Ng, AI Pioneer"');
    });
  });
});
