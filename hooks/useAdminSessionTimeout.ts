'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

/**
 * Admin Session Timeout Hook
 * 
 * Monitors admin session activity and provides:
 * - Automatic logout after 30 minutes of inactivity
 * - Warning notification before timeout
 * - Activity tracking to extend session
 * 
 * Requirements: 14.1, 14.2, 14.3, 14.4
 */

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_THRESHOLD = 5 * 60 * 1000; // Show warning 5 minutes before timeout

interface UseAdminSessionTimeoutOptions {
  enabled?: boolean;
  onWarning?: () => void;
  onTimeout?: () => void;
}

export function useAdminSessionTimeout(options: UseAdminSessionTimeoutOptions = {}) {
  const { enabled = true, onWarning, onTimeout } = options;
  const router = useRouter();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(SESSION_TIMEOUT);

  // Update last activity timestamp
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
    setShowWarning(false);
  }, []);

  // Handle session timeout
  const handleTimeout = useCallback(async () => {
    if (onTimeout) {
      onTimeout();
    }
    
    // Sign out and redirect to login with timeout message
    await signOut({ redirect: false });
    router.push('/admin/login?error=timeout');
  }, [onTimeout, router]);

  // Track user activity
  useEffect(() => {
    if (!enabled) return;

    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Throttle activity updates to avoid excessive state updates
    let throttleTimeout: NodeJS.Timeout | null = null;
    
    const handleActivity = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          updateActivity();
          throttleTimeout = null;
        }, 1000); // Update at most once per second
      }
    };

    // Add event listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, [enabled, updateActivity]);

  // Monitor session timeout
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastActivity;
      const remaining = SESSION_TIMEOUT - elapsed;

      setRemainingTime(remaining);

      // Session has timed out
      if (remaining <= 0) {
        clearInterval(interval);
        handleTimeout();
        return;
      }

      // Show warning when approaching timeout
      if (remaining <= WARNING_THRESHOLD && !showWarning) {
        setShowWarning(true);
        if (onWarning) {
          onWarning();
        }
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [enabled, lastActivity, showWarning, onWarning, handleTimeout]);

  // Format remaining time for display
  const formatRemainingTime = useCallback(() => {
    const minutes = Math.floor(remainingTime / 60000);
    const seconds = Math.floor((remainingTime % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [remainingTime]);

  return {
    showWarning,
    remainingTime,
    formatRemainingTime,
    updateActivity,
    isNearTimeout: remainingTime <= WARNING_THRESHOLD,
  };
}
