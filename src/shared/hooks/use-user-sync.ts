'use client';

import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

/**
 * Hook to ensure Clerk user is synced to our database
 * Should be called in the main app layout or provider
 */
export function useUserSync() {
  const { userId, isLoaded } = useAuth();

  useEffect(() => {
    async function syncUser() {
      if (!isLoaded || !userId) return;

      try {
        const response = await fetch('/api/auth/sync-user', {
          method: 'POST',
        });

        if (!response.ok) {
          console.error('Failed to sync user to database');
        }
      } catch (error) {
        console.error('User sync error:', error);
      }
    }

    syncUser();
  }, [userId, isLoaded]);
}
