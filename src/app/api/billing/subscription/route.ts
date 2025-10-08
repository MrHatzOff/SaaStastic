import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/core/db/client';
import { SUBSCRIPTION_PLANS } from '@/features/billing/services/stripe-service';
import type { BillingSummary } from '@/features/billing/types/billing-types';

export async function GET() {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's company
    const userCompany = await db.userCompany.findFirst({
      where: { userId },
      include: { company: true },
    });

    if (!userCompany) {
      return NextResponse.json(
        { error: 'No company found' },
        { status: 404 }
      );
    }

    // Get subscription data from database
    const subscription = await db.subscription.findFirst({
      where: {
        companyId: userCompany.companyId,
        status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Build billing summary
    const billingSummary: BillingSummary = {
      currentPlan: subscription
        ? SUBSCRIPTION_PLANS.find((plan) => plan.stripePriceId === subscription.stripePriceId) || null
        : null,
      subscription: subscription
        ? {
            status: subscription.status.toLowerCase() as 'active' | 'trialing' | 'past_due',
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false,
            trialEnd: subscription.trialEnd || null,
          }
        : null,
      usage: {
        users: {
          current: await db.user.count({
            where: {
              companies: {
                some: { companyId: userCompany.companyId },
              },
            },
          }),
          limit: subscription
            ? SUBSCRIPTION_PLANS.find((plan) => plan.stripePriceId === subscription.stripePriceId)?.limits.users || 5
            : 5,
          percentage: 0, // Calculate below
        },
        storage: {
          current: 0, // Implement based on your storage tracking
          limit: subscription
            ? SUBSCRIPTION_PLANS.find((plan) => plan.stripePriceId === subscription.stripePriceId)?.limits.storage || 10
            : 10,
          percentage: 0,
        },
        apiCalls: {
          current: 0, // Implement based on your API call tracking
          limit: subscription
            ? SUBSCRIPTION_PLANS.find((plan) => plan.stripePriceId === subscription.stripePriceId)?.limits.apiCalls || 1000
            : 1000,
          percentage: 0,
        },
      },
      upcomingInvoice: null, // Could fetch from Stripe if needed
      paymentMethods: [], // Could fetch from Stripe if needed
    };

    // Calculate usage percentages
    if (billingSummary.usage.users.limit > 0) {
      billingSummary.usage.users.percentage = Math.round(
        (billingSummary.usage.users.current / billingSummary.usage.users.limit) * 100
      );
    }
    if (billingSummary.usage.storage.limit > 0) {
      billingSummary.usage.storage.percentage = Math.round(
        (billingSummary.usage.storage.current / billingSummary.usage.storage.limit) * 100
      );
    }
    if (billingSummary.usage.apiCalls.limit > 0) {
      billingSummary.usage.apiCalls.percentage = Math.round(
        (billingSummary.usage.apiCalls.current / billingSummary.usage.apiCalls.limit) * 100
      );
    }

    return NextResponse.json(billingSummary);
  } catch (error: unknown) {
    console.error('Get billing subscription error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch billing subscription' },
      { status: 500 }
    );
  }
}
