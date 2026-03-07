import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import { auth } from '@/lib/auth-setup';
import { getChatPageCanonicalUrl } from '@/lib/seo/canonical';
import { defaultAIMetaTags } from '@/lib/seo/ai-meta-tags';
import { ChatSkeleton } from '@/components/ui/SkeletonLoader';

// Dynamic import for ChatInterface to reduce initial JavaScript bundle (Requirement 21.2 - FID optimization)
const ChatInterface = dynamic(
  () => import('@/components/chat/ChatInterface').then((mod) => ({ default: mod.ChatInterface })),
  {
    loading: () => <ChatSkeleton />,
  }
);

export const metadata: Metadata = {
  title: 'Chat - AI FutureLinks',
  description: 'Interact with AI using our model-agnostic workspace. Toggle between OpenAI and Google Gemini seamlessly.',
  ...defaultAIMetaTags,
  openGraph: {
    title: 'Chat - AI FutureLinks',
    description: 'Interact with AI using our model-agnostic workspace. Toggle between OpenAI and Google Gemini seamlessly.',
    url: getChatPageCanonicalUrl(),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chat - AI FutureLinks',
    description: 'Interact with AI using our model-agnostic workspace. Toggle between OpenAI and Google Gemini seamlessly.',
  },
  alternates: {
    canonical: getChatPageCanonicalUrl(),
  },
};

/**
 * Chat Interface Page
 * 
 * Main AI interaction interface for authenticated users.
 * 
 * Features:
 * - Session protection: redirects to sign-in if not authenticated
 * - Message display area with auto-scroll
 * - Multi-line textarea input
 * - Send button
 * - Loading state during API calls
 * - Responsive design with mobile touch targets (44x44px minimum)
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 16.6
 */
export default async function ChatPage() {
  // Check authentication status
  const session = await auth();

  // Redirect to sign-in if not authenticated (Requirement 3.5)
  if (!session?.user) {
    redirect('/api/auth/signin?callbackUrl=/chat');
  }

  // Only allow public users (not admin users)
  if (session.user.role === 'admin') {
    redirect('/admin/keys');
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-900">AI Chat</h1>
          <span className="text-sm text-gray-500">
            {session.user.name || session.user.email}
          </span>
        </div>
        <a
          href="/api/auth/signout"
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Sign out"
        >
          Sign out
        </a>
      </header>

      {/* Chat Interface Component */}
      <ChatInterface />
    </div>
  );
}
