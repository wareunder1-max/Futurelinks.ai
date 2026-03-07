/**
 * Example Admin Layout with Session Timeout
 * 
 * This is an example layout that demonstrates how to integrate
 * the session timeout warning component into admin pages.
 * 
 * To use this layout:
 * 1. Rename this file to layout.tsx
 * 2. Customize the navigation and styling as needed
 * 3. The SessionTimeoutWarning will automatically monitor and warn users
 * 
 * Requirements: 14.1, 14.2, 14.3, 14.4
 */

import { SessionTimeoutWarning } from '@/components/admin/SessionTimeoutWarning';
import { auth } from '@/lib/auth-setup';
import { redirect } from 'next/navigation';

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
              <a
                href="/admin/keys"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-gray-300"
              >
                API Keys
              </a>
              <a
                href="/admin/usage"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-gray-300"
              >
                Usage
              </a>
              <a
                href="/admin/admins"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-gray-300"
              >
                Admins
              </a>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
                {session.user.name}
              </span>
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  Sign out
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
