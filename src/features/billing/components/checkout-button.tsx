'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CheckoutButtonProps {
  planName: string;
  className?: string;
}

export function CheckoutButton({ planName, className }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleCheckout = async () => {
    // Check authentication first
    if (!isSignedIn) {
      toast.error('Please sign in to continue');
      router.push('/sign-in');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        
        // Handle specific error cases
        if (error.error?.includes('No company found') || error.error?.includes('complete company setup')) {
          toast.error('Please complete company setup first');
          window.location.href = '/onboarding/company-setup';
          return;
        }
        
        if (response.status === 401) {
          toast.error('Please sign in to continue');
          router.push('/sign-in');
          return;
        }
        
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      
      if (!url) {
        throw new Error('No checkout URL received');
      }
      
      // Redirect to Stripe Checkout
      window.location.href = url;
      
    } catch (error: unknown) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start checkout. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCheckout} 
      disabled={isLoading}
      className={`${className} bg-blue-600 hover:bg-blue-700 text-white font-medium`}
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        `Get Started with ${planName}`
      )}
    </Button>
  );
}
