'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * SignIn Component
 * 
 * Provides authentication UI for public users with:
 * - Google OAuth button
 * - Email authentication form (magic links)
 * - Error state handling
 * - Responsive design with Tailwind CSS
 * 
 * Features:
 * - Displays authentication errors from URL params
 * - Handles loading states during authentication
 * - Redirects to /chat after successful authentication
 * - Mobile-responsive with proper touch targets (44x44px minimum)
 * 
 * Requirements: 2.1, 2.5
 */
export function SignIn() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  // Get error from URL params (e.g., /auth/signin?error=OAuthSignin)
  const urlError = searchParams?.get('error');

  // Map NextAuth error codes to user-friendly messages
  const getErrorMessage = (errorCode: string | null) => {
    if (!errorCode) return null;
    
    const errorMessages: Record<string, string> = {
      OAuthSignin: 'Error connecting to authentication provider. Please try again.',
      OAuthCallback: 'Error during authentication. Please try again.',
      OAuthCreateAccount: 'Could not create account. Please try again.',
      EmailCreateAccount: 'Could not create account with this email.',
      Callback: 'Authentication callback failed. Please try again.',
      OAuthAccountNotLinked: 'This email is already associated with another account.',
      EmailSignin: 'Could not send email. Please check your email address.',
      CredentialsSignin: 'Invalid credentials. Please try again.',
      SessionRequired: 'Please sign in to access this page.',
      Default: 'An error occurred during authentication. Please try again.',
    };

    return errorMessages[errorCode] || errorMessages.Default;
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signIn('google', { callbackUrl: '/chat' });
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setIsEmailLoading(true);
      setError(null);
      
      const result = await signIn('nodemailer', {
        email,
        redirect: false,
        callbackUrl: '/chat',
      });

      if (result?.error) {
        setError('Failed to send email. Please try again.');
        setIsEmailLoading(false);
      } else {
        setEmailSent(true);
        setIsEmailLoading(false);
      }
    } catch (err) {
      setError('Failed to send email. Please try again.');
      setIsEmailLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Welcome to AI FutureLinks</h1>
        <p className="text-gray-600">Sign in to access the AI workspace</p>
      </div>

      {/* Error Display */}
      {(error || urlError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-800">
              {error || getErrorMessage(urlError)}
            </p>
          </div>
        </div>
      )}

      {/* Email Sent Success Message */}
      {emailSent && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4" role="status">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-green-800">
              <p className="font-medium">Check your email</p>
              <p className="mt-1">We sent a sign-in link to {email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Google OAuth Button */}
      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading || emailSent}
        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
        aria-label="Sign in with Google"
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5 text-gray-700"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>

      {/* Email Form */}
      <form onSubmit={handleEmailSignIn} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isEmailLoading || emailSent}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            placeholder="you@example.com"
            aria-describedby={error ? 'email-error' : undefined}
          />
        </div>

        <button
          type="submit"
          disabled={isEmailLoading || emailSent || !email}
          className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
          aria-label="Sign in with email"
        >
          {isEmailLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Sending...
            </span>
          ) : emailSent ? (
            'Email sent'
          ) : (
            'Continue with email'
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-gray-600">
        By signing in, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}
