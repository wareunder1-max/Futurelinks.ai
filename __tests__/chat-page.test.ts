import { describe, it, expect, vi, beforeEach } from 'vitest';
import { redirect } from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock auth setup
const mockAuth = vi.fn();
vi.mock('@/lib/auth-setup', () => ({
  auth: mockAuth,
}));

// Mock ChatInterface component
vi.mock('@/components/chat/ChatInterface', () => ({
  ChatInterface: () => '<div>Chat Interface</div>',
}));

describe('Chat Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to sign-in when user is not authenticated', async () => {
    // Mock no session
    mockAuth.mockResolvedValue(null);

    // Mock redirect to throw (Next.js behavior)
    (redirect as any).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });

    // Import the page component
    const ChatPage = (await import('../app/chat/page')).default;

    // Render the page - expect it to throw due to redirect
    await expect(ChatPage()).rejects.toThrow();

    // Verify redirect was called with correct URL
    expect(redirect).toHaveBeenCalledWith('/api/auth/signin?callbackUrl=/chat');
  });

  it('should redirect to sign-in when session has no user', async () => {
    // Mock session without user
    mockAuth.mockResolvedValue({ user: null });

    // Mock redirect to throw (Next.js behavior)
    (redirect as any).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });

    const ChatPage = (await import('../app/chat/page')).default;

    await expect(ChatPage()).rejects.toThrow();

    expect(redirect).toHaveBeenCalledWith('/api/auth/signin?callbackUrl=/chat');
  });

  it('should redirect admin users to admin dashboard', async () => {
    // Mock admin session
    mockAuth.mockResolvedValue({
      user: {
        id: 'admin-123',
        email: 'admin@admin.local',
        name: 'Admin User',
        role: 'admin',
      },
    });

    // Mock redirect to throw (Next.js behavior)
    (redirect as any).mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });

    const ChatPage = (await import('../app/chat/page')).default;

    await expect(ChatPage()).rejects.toThrow();

    expect(redirect).toHaveBeenCalledWith('/admin/keys');
  });

  it('should render chat interface for authenticated public users', async () => {
    // Mock public user session
    mockAuth.mockResolvedValue({
      user: {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        role: 'public',
      },
    });

    const ChatPage = (await import('../app/chat/page')).default;

    // Should not redirect
    await ChatPage();

    expect(redirect).not.toHaveBeenCalled();
  });
});
