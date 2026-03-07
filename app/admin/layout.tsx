/**
 * Admin Layout with Session Protection and Navigation
 * 
 * This layout wraps all admin pages and provides:
 * - Session protection (redirects to login if not authenticated)
 * - Navigation menu (API Keys, Usage, Admins)
 * - Logout button
 * - Session timeout warning
 * 
 * Requirements: 7.5, 7.6
 */

import { SessionTimeoutWarning } from '@/components/admin/SessionTimeoutWarning';
import { auth } from '@/lib/auth-setup';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side session check
  const session = await auth();

  // Redirect to login if not authenticated or not admin
  if (!session || session.user.role !== 'admin') {
    redirect('/admin/login?error=unauthorized');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Session timeout warning banner */}
      <SessionTimeoutWarning />

      {/* Admin navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link
                href="/admin/keys"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-gray-300"
              >
                API Keys
              </Link>
              <Link
                href="/admin/usage"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-gray-300"
              >
                Usage
              </Link>
              <Link
                href="/admin/monitoring"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-gray-300"
              >
                Monitoring
              </Link>
              <Link
                href="/admin/admins"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-gray-300"
              >
                Admins
              </Link>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
                {session.user.name || session.user.email}
              </span>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="text-sm text-gray-700 hover:text-gray-900 font-medium"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer with session info */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-gray-500 text-center">
            Session timeout: 30 minutes of inactivity
          </p>
        </div>
      </footer>
    </div>
  );
}
