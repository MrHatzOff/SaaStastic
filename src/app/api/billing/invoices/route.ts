import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { StripeService } from '@/features/billing/services/stripe-service';
import { getInvoicesSchema } from '@/features/billing/schemas/billing-schemas';
import { db } from '@/core/db/client';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');
    const startingAfter = searchParams.get('startingAfter') || undefined;
    const endingBefore = searchParams.get('endingBefore') || undefined;

    // Validate parameters
    const validatedParams = getInvoicesSchema.parse({
      limit,
      startingAfter,
      endingBefore,
    });

    // Get user's company
    const userCompany = await db.userCompany.findFirst({
      where: {
        userId,
        role: { in: ['OWNER', 'ADMIN'] }, // Only owners and admins can view invoices
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

    // Get invoices from Stripe
    const invoices = await StripeService.getInvoices(
      userCompany.companyId,
      validatedParams.limit
    );

    return NextResponse.json({
      invoices,
      companyId: userCompany.companyId,
    });
  } catch (error: unknown) {
    console.error('Get invoices error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: (error as unknown as { errors: unknown }).errors },
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
      { error: error instanceof Error ? error.message : 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
