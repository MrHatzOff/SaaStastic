import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { StripeService } from '@/features/billing/services/stripe-service';
import { createCheckoutSessionSchema } from '@/features/billing/schemas/billing-schemas';
import { db } from '@/core/db/client';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createCheckoutSessionSchema.parse(body);

    // Convert plan name to price ID
    const planToPriceId: Record<string, string> = {
      'Starter': process.env.STRIPE_PRICE_STARTER_MONTHLY!,
      'Professional': process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY!,
      'Enterprise': process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY!,
    };

    const priceId = planToPriceId[validatedData.planName];
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Get user's company with proper authorization
    const userCompany = await db.userCompany.findFirst({
      where: {
        userId,
        role: { in: ['OWNER', 'ADMIN'] }, // Only owners and admins can manage billing
      },
      include: {
        company: true,
      },
    });

    if (!userCompany) {
      return NextResponse.json(
        { error: 'No company found or insufficient permissions. Please complete company setup first.' },
        { status: 403 }
      );
    }

    // Check if company already has an active subscription
    const existingSubscription = await db.subscription.findUnique({
      where: { companyId: userCompany.companyId },
    });

    if (existingSubscription && existingSubscription.status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'Company already has an active subscription' },
        { status: 400 }
      );
    }

    // Create checkout session
    const session = await StripeService.createCheckoutSession({
      priceId: priceId,
      companyId: userCompany.companyId,
      userId,
      successUrl: validatedData.successUrl,
      cancelUrl: validatedData.cancelUrl,
      trialDays: validatedData.trialDays,
    });

    // Log the action
    await db.eventLog.create({
      data: {
        action: 'billing.checkout_session_created',
        userId,
        companyId: userCompany.companyId,
        metadata: {
          sessionId: session.id,
          priceId: priceId,
          planName: validatedData.planName,
        },
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: unknown) {
    console.error('Checkout session creation error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: (error as unknown as { errors: unknown }).errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.name === 'BillingError') {
      return NextResponse.json(
        { error: error.message },
        { status: (error as unknown as { statusCode?: number }).statusCode || 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
