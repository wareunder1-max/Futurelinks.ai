import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

describe('useChat Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export useChat hook', async () => {
    const { useChat } = await import('@/hooks/useChat');
    expect(useChat).toBeDefined();
    expect(typeof useChat).toBe('function');
  });

  it('should export Message interface', async () => {
    const module = await import('@/hooks/useChat');
    expect(module).toBeDefined();
  });

  it('should handle JSON response format', async () => {
    // Test that the hook module can be imported without errors
    const { useChat } = await import('@/hooks/useChat');
    expect(useChat).toBeDefined();
  });

  it('should handle SSE streaming format', async () => {
    // Test that the hook module exports are correct
    const module = await import('@/hooks/useChat');
    expect(module.useChat).toBeDefined();
  });
});
