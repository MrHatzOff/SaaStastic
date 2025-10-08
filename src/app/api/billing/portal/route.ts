import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { StripeService } from '@/features/billing/services/stripe-service';
import { createBillingPortalSchema } from '@/features/billing/schemas/billing-schemas';
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
    const validatedData = createBillingPortalSchema.parse(body);

    // Get user's company
    const userCompany = await db.userCompany.findFirst({
      where: {
        userId,
        role: { in: ['OWNER', 'ADMIN'] }, // Only owners and admins can access billing
      },
      include: {
        company: true,
      },
    });

    if (!userCompany) {
      return NextResponse.json(
        { error: 'No company found or insufficient permissions' },
        { status: 403 }
      );
    }

    // Create billing portal session
    const session = await StripeService.createBillingPortalSession(
      userCompany.companyId,
      validatedData.returnUrl
    );

    // Log the action
    await db.eventLog.create({
      data: {
        action: 'billing.portal_accessed',
        userId,
        companyId: userCompany.companyId,
        metadata: {
          returnUrl: validatedData.returnUrl,
        },
      },
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error: unknown) {
    // TODO: Replace with proper logging service in production
    // console.error('Billing portal session error:', error);

    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      const zodError = error as unknown as { errors: unknown[] };
      return NextResponse.json(
        { error: 'Invalid request data', details: zodError.errors },
        { status: 400 }
      );
    }

    // Handle custom billing errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'BillingError') {
      const billingError = error as { statusCode?: number };
      return NextResponse.json(
        { error: 'Billing service error' },
        { status: billingError.statusCode || 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}
