'use client';

import { useAdminSessionTimeout } from '@/hooks/useAdminSessionTimeout';
import { useState, useEffect } from 'react';

/**
 * Session Timeout Warning Component
 * 
 * Displays a warning banner when admin session is about to expire.
 * Shows countdown timer and allows user to extend session by interacting.
 * 
 * Requirements: 14.2, 14.3, 14.4
 */
export function SessionTimeoutWarning() {
  const [isVisible, setIsVisible] = useState(false);
  const { showWarning, formatRemainingTime, updateActivity } = useAdminSessionTimeout({
    enabled: true,
    onWarning: () => {
      setIsVisible(true);
    },
  });

  useEffect(() => {
    if (!showWarning) {
      setIsVisible(false);
    }
  }, [showWarning]);

  const handleDismiss = () => {
    setIsVisible(false);
    updateActivity(); // Extend session
  };

  if (!isVisible || !showWarning) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-50 border-b-2 border-yellow-400 px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <svg
            className="h-6 w-6 text-yellow-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Your session will expire soon
            </p>
            <p className="text-xs text-yellow-700">
              Time remaining: {formatRemainingTime()}. Click anywhere to extend your session.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-yellow-600 hover:text-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded p-1"
          aria-label="Dismiss warning"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
