'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SubscriptionCard } from '@/features/billing/components/subscription-card';
import { BillingHistory } from '@/features/billing/components/billing-history';
import { Button } from '@/shared/ui/button';
import { PermissionGuard } from '@/shared/components/permission-guard';
import { PERMISSIONS } from '@/shared/lib/permissions';
import { Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import type { BillingSummary } from '@/features/billing/types/billing-types';

export default function BillingPage() {
  const router = useRouter();
  const [billingSummary, setBillingSummary] = useState<BillingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  useEffect(() => {
    fetchBillingSummary();
  }, []);

  const fetchBillingSummary = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/billing/subscription');
      
      if (!response.ok) {
        throw new Error('Failed to fetch billing information');
      }

      const data: BillingSummary = await response.json();
      setBillingSummary(data);
    } catch (err) {
      console.error('Error fetching billing summary:', err);
      setError('Failed to load billing information');
      toast.error('Failed to load billing information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const handleDowngrade = () => {
    // Implement downgrade logic
    toast.info('Contact support to downgrade your plan');
  };

  const handleManageBilling = async () => {
    try {
      setIsPortalLoading(true);
      
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/dashboard/billing`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      console.error('Error creating portal session:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to open billing portal');
      setIsPortalLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
            <p className="text-muted-foreground mt-2">
              Manage your subscription and view billing history
            </p>
          </div>

          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !billingSummary) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
            <p className="text-muted-foreground mt-2">
              Manage your subscription and view billing history
            </p>
          </div>

          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">{error || 'Unable to load billing information'}</p>
              <button
                onClick={fetchBillingSummary}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
          <p className="text-muted-foreground mt-2">
            Manage your subscription and view billing history
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Subscription Card */}
          <div className="space-y-4">
            <SubscriptionCard
              billingSummary={billingSummary}
              onUpgrade={handleUpgrade}
              onDowngrade={handleDowngrade}
            />
            
            {/* Manage Billing Button */}
            {billingSummary.subscription && (
              <PermissionGuard permission={PERMISSIONS.BILLING_PORTAL}>
                <Button
                  onClick={handleManageBilling}
                  disabled={isPortalLoading}
                  className="w-full"
                  variant="outline"
                >
                  {isPortalLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Opening Portal...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Manage Subscription
                    </>
                  )}
                </Button>
              </PermissionGuard>
            )}
          </div>

          {/* Placeholder for future features */}
          <div className="space-y-6">
            {/* Could add payment methods, usage details, etc. */}
          </div>
        </div>

        {/* Billing History */}
        <div className="mt-6">
          <BillingHistory limit={10} />
        </div>
      </div>
    </div>
  );
}
