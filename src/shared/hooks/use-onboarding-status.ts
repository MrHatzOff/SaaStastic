'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

interface OnboardingStatus {
  isLoading: boolean;
  needsOnboarding: boolean;
  hasCompany: boolean;
  companyName?: string;
}

/**
 * Hook to check if user needs to complete onboarding
 * More flexible than middleware - components can decide what to do
 */
export function useOnboardingStatus(): OnboardingStatus {
  const { userId, isLoaded } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus>({
    isLoading: true,
    needsOnboarding: false,
    hasCompany: false,
  });

  useEffect(() => {
    async function checkOnboardingStatus() {
      if (!isLoaded || !userId) {
        setStatus({
          isLoading: false,
          needsOnboarding: false,
          hasCompany: false,
        });
        return;
      }

      try {
        const response = await fetch('/api/user/onboarding-status');
        
        if (response.ok) {
          const data = await response.json();
          setStatus({
            isLoading: false,
            needsOnboarding: !data.hasCompany,
            hasCompany: data.hasCompany,
            companyName: data.companyName,
          });
        } else {
          // If API fails, assume needs onboarding
          setStatus({
            isLoading: false,
            needsOnboarding: true,
            hasCompany: false,
          });
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
        setStatus({
          isLoading: false,
          needsOnboarding: true,
          hasCompany: false,
        });
      }
    }

    checkOnboardingStatus();
  }, [userId, isLoaded]);

  return status;
}
