import { describe, it, expect } from 'vitest';
import robots from '../app/robots';

describe('robots.txt configuration', () => {
  it('should include all required AI crawler user-agents', () => {
    const config = robots();
    
    const userAgents = config.rules.map(rule => rule.userAgent);
    
    // Requirement 19.1: GPTBot
    expect(userAgents).toContain('GPTBot');
    
    // Requirement 19.2: Google-Extended
    expect(userAgents).toContain('Google-Extended');
    
    // Requirement 19.3: ClaudeBot
    expect(userAgents).toContain('ClaudeBot');
    
    // Requirement 19.4: CCBot
    expect(userAgents).toContain('CCBot');
    
    // Requirement 19.5: anthropic-ai
    expect(userAgents).toContain('anthropic-ai');
  });

  it('should allow AI crawlers to access public content', () => {
    const config = robots();
    
    const aiCrawlers = ['GPTBot', 'Google-Extended', 'ClaudeBot', 'CCBot', 'anthropic-ai'];
    
    aiCrawlers.forEach(crawler => {
      const rule = config.rules.find(r => r.userAgent === crawler);
      expect(rule).toBeDefined();
      expect(rule?.allow).toBe('/');
    });
  });

  it('should disallow AI crawlers from accessing admin and API routes', () => {
    const config = robots();
    
    const aiCrawlers = ['GPTBot', 'Google-Extended', 'ClaudeBot', 'CCBot', 'anthropic-ai'];
    
    aiCrawlers.forEach(crawler => {
      const rule = config.rules.find(r => r.userAgent === crawler);
      expect(rule).toBeDefined();
      expect(rule?.disallow).toContain('/admin/');
      expect(rule?.disallow).toContain('/api/');
    });
  });

  it('should include crawl-delay for all user-agents', () => {
    const config = robots();
    
    config.rules.forEach(rule => {
      expect(rule.crawlDelay).toBeDefined();
      expect(rule.crawlDelay).toBeGreaterThan(0);
    });
  });

  it('should include sitemap reference', () => {
    const config = robots();
    
    expect(config.sitemap).toBe('https://ai.futurelinks.art/sitemap.xml');
  });

  it('should have specific user-agent directives for each AI crawler (Requirement 19.7)', () => {
    const config = robots();
    
    const aiCrawlers = ['GPTBot', 'Google-Extended', 'ClaudeBot', 'CCBot', 'anthropic-ai'];
    
    aiCrawlers.forEach(crawler => {
      const rule = config.rules.find(r => r.userAgent === crawler);
      expect(rule).toBeDefined();
      expect(rule?.userAgent).toBe(crawler);
    });
  });

  it('should set appropriate crawl-delay for AI crawlers', () => {
    const config = robots();
    
    const aiCrawlers = ['GPTBot', 'Google-Extended', 'ClaudeBot', 'CCBot', 'anthropic-ai'];
    
    aiCrawlers.forEach(crawler => {
      const rule = config.rules.find(r => r.userAgent === crawler);
      expect(rule?.crawlDelay).toBe(2);
    });
  });

  it('should have a default rule for all user-agents', () => {
    const config = robots();
    
    const defaultRule = config.rules.find(r => r.userAgent === '*');
    expect(defaultRule).toBeDefined();
    expect(defaultRule?.allow).toBe('/');
    expect(defaultRule?.disallow).toContain('/admin/');
    expect(defaultRule?.disallow).toContain('/api/admin/');
    expect(defaultRule?.crawlDelay).toBe(1);
  });
});
