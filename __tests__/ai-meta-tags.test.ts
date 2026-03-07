/**
 * Tests for AI-specific meta tags
 * 
 * Validates that AI crawler guidance meta tags are properly generated
 * and configured for different content types.
 * 
 * Requirements: 19.6
 */

import { describe, it, expect } from 'vitest';
import {
  generateAIMetaTags,
  defaultAIMetaTags,
  restrictiveAIMetaTags,
  privateAIMetaTags,
} from '@/lib/seo/ai-meta-tags';

describe('AI Meta Tags', () => {
  describe('generateAIMetaTags', () => {
    it('should generate default permissive tags', () => {
      const tags = generateAIMetaTags();

      expect(tags.robots.index).toBe(true);
      expect(tags.robots.follow).toBe(true);
      expect(tags.robots['max-snippet']).toBe(-1);
      expect(tags.robots['max-image-preview']).toBe('large');
      expect(tags.robots['max-video-preview']).toBe(-1);
      expect(tags.other['ai-content-declaration']).toBe('indexable, trainable, citable');
    });

    it('should generate restrictive tags when training disabled', () => {
      const tags = generateAIMetaTags({
        allowIndex: true,
        allowTraining: false,
        allowCitation: true,
      });

      expect(tags.robots.index).toBe(true);
      expect(tags.other['ai-content-declaration']).toBe('indexable, notrain, citable');
    });

    it('should generate private tags when indexing disabled', () => {
      const tags = generateAIMetaTags({
        allowIndex: false,
        allowTraining: false,
        allowCitation: false,
      });

      expect(tags.robots.index).toBe(false);
      expect(tags.robots.follow).toBe(false);
      expect(tags.robots['max-snippet']).toBe(0);
      expect(tags.robots['max-image-preview']).toBe('none');
      expect(tags.robots['max-video-preview']).toBe(0);
      expect(tags.other['ai-content-declaration']).toBe('noindex, notrain, nocite');
    });

    it('should disable snippets when citation not allowed', () => {
      const tags = generateAIMetaTags({
        allowIndex: true,
        allowTraining: true,
        allowCitation: false,
      });

      expect(tags.robots['max-snippet']).toBe(0);
      expect(tags.robots['max-image-preview']).toBe('none');
      expect(tags.robots['max-video-preview']).toBe(0);
      expect(tags.other['ai-content-declaration']).toContain('nocite');
    });
  });

  describe('Preset configurations', () => {
    it('should have correct default AI meta tags', () => {
      expect(defaultAIMetaTags.robots.index).toBe(true);
      expect(defaultAIMetaTags.robots.follow).toBe(true);
      expect(defaultAIMetaTags.other['ai-content-declaration']).toBe('indexable, trainable, citable');
    });

    it('should have correct restrictive AI meta tags', () => {
      expect(restrictiveAIMetaTags.robots.index).toBe(true);
      expect(restrictiveAIMetaTags.robots.follow).toBe(true);
      expect(restrictiveAIMetaTags.other['ai-content-declaration']).toBe('indexable, notrain, nocite');
    });

    it('should have correct private AI meta tags', () => {
      expect(privateAIMetaTags.robots.index).toBe(false);
      expect(privateAIMetaTags.robots.follow).toBe(false);
      expect(privateAIMetaTags.other['ai-content-declaration']).toBe('noindex, notrain, nocite');
    });
  });

  describe('AI content declaration format', () => {
    it('should include all three directives', () => {
      const tags = generateAIMetaTags();
      const declaration = tags.other['ai-content-declaration'];

      expect(declaration).toMatch(/indexable|noindex/);
      expect(declaration).toMatch(/trainable|notrain/);
      expect(declaration).toMatch(/citable|nocite/);
    });

    it('should use comma-separated format', () => {
      const tags = generateAIMetaTags();
      const declaration = tags.other['ai-content-declaration'];

      expect(declaration.split(', ')).toHaveLength(3);
    });
  });

  describe('Robots directives', () => {
    it('should set follow to match index', () => {
      const allowedTags = generateAIMetaTags({ allowIndex: true });
      const blockedTags = generateAIMetaTags({ allowIndex: false });

      expect(allowedTags.robots.index).toBe(allowedTags.robots.follow);
      expect(blockedTags.robots.index).toBe(blockedTags.robots.follow);
    });

    it('should set snippet limits based on citation permission', () => {
      const citableTags = generateAIMetaTags({ allowCitation: true });
      const noCiteTags = generateAIMetaTags({ allowCitation: false });

      expect(citableTags.robots['max-snippet']).toBe(-1);
      expect(noCiteTags.robots['max-snippet']).toBe(0);
    });

    it('should set image preview based on citation permission', () => {
      const citableTags = generateAIMetaTags({ allowCitation: true });
      const noCiteTags = generateAIMetaTags({ allowCitation: false });

      expect(citableTags.robots['max-image-preview']).toBe('large');
      expect(noCiteTags.robots['max-image-preview']).toBe('none');
    });

    it('should set video preview based on citation permission', () => {
      const citableTags = generateAIMetaTags({ allowCitation: true });
      const noCiteTags = generateAIMetaTags({ allowCitation: false });

      expect(citableTags.robots['max-video-preview']).toBe(-1);
      expect(noCiteTags.robots['max-video-preview']).toBe(0);
    });
  });
});
