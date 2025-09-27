'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { CheckCircle2, AlertCircle, CreditCard, Calendar, Users, HardDrive, Zap } from 'lucide-react';
import { toast } from 'sonner';
import type { BillingSummary } from '../types/billing-types';

interface SubscriptionCardProps {
  billingSummary: BillingSummary;
  onUpgrade: () => void;
  onDowngrade?: () => void;
}

export function SubscriptionCard({ billingSummary, onUpgrade, onDowngrade }: SubscriptionCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleBillingPortal = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create billing portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error accessing billing portal:', error);
      toast.error('Failed to open billing portal');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Active', variant: 'default' as const },
      trialing: { label: 'Trial', variant: 'secondary' as const },
      past_due: { label: 'Past Due', variant: 'destructive' as const },
      canceled: { label: 'Canceled', variant: 'outline' as const },
      incomplete: { label: 'Incomplete', variant: 'outline' as const },
      unpaid: { label: 'Unpaid', variant: 'destructive' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: 'outline' as const,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  if (!billingSummary.subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>
            Choose a plan to get started with all premium features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            You&apos;re currently on the free tier with limited features.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={onUpgrade} className="w-full">
            Choose a Plan
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const { currentPlan, subscription, usage } = billingSummary;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{currentPlan?.name || 'Current Plan'}</CardTitle>
            <CardDescription>
              {currentPlan?.description || 'Manage your subscription'}
            </CardDescription>
          </div>
          {subscription && getStatusBadge(subscription.status)}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Plan Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Monthly Price</span>
            <span className="font-medium">
              {currentPlan ? formatCurrency(currentPlan.price) : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Billing Period</span>
            <span className="font-medium">
              {subscription && formatDate(subscription.currentPeriodEnd)}
            </span>
          </div>
          {subscription?.cancelAtPeriodEnd && (
            <div className="flex items-center gap-2 text-sm text-amber-600">
              <AlertCircle className="h-4 w-4" />
              <span>Subscription will cancel on {formatDate(subscription.currentPeriodEnd)}</span>
            </div>
          )}
        </div>

        {/* Usage Metrics */}
        {usage && Object.keys(usage).length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Usage This Period</h4>
            
            {usage.users && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Team Members</span>
                  </div>
                  <span className="text-muted-foreground">
                    {usage.users.current} / {usage.users.limit === -1 ? '∞' : usage.users.limit}
                  </span>
                </div>
                {usage.users.limit !== -1 && (
                  <Progress value={usage.users.percentage} className="h-2" />
                )}
              </div>
            )}

            {usage.storage && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <span>Storage</span>
                  </div>
                  <span className="text-muted-foreground">
                    {usage.storage.current} GB / {usage.storage.limit} GB
                  </span>
                </div>
                <Progress value={usage.storage.percentage} className="h-2" />
              </div>
            )}

            {usage.apiCalls && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span>API Calls</span>
                  </div>
                  <span className="text-muted-foreground">
                    {usage.apiCalls.current.toLocaleString()} / {usage.apiCalls.limit === -1 ? '∞' : usage.apiCalls.limit.toLocaleString()}
                  </span>
                </div>
                {usage.apiCalls.limit !== -1 && (
                  <Progress value={usage.apiCalls.percentage} className="h-2" />
                )}
              </div>
            )}
          </div>
        )}

        {/* Features */}
        {currentPlan?.features && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Included Features</h4>
            <ul className="space-y-1">
              {currentPlan.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Upcoming Invoice */}
        {billingSummary.upcomingInvoice && (
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Next payment</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {formatCurrency(billingSummary.upcomingInvoice.amountDue)}
                </p>
                <p className="text-xs text-muted-foreground">
                  on {formatDate(billingSummary.upcomingInvoice.dueDate)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleBillingPortal}
          disabled={isLoading}
          className="flex-1"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Manage Billing
        </Button>
        {subscription?.status === 'active' && !subscription.cancelAtPeriodEnd && (
          <Button
            variant="default"
            onClick={onUpgrade}
            className="flex-1"
          >
            Change Plan
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
