import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/core/db/client';

/**
 * Test Authentication Endpoint
 * 
 * WARNING: This endpoint should ONLY be available in development/test environments!
 * It bypasses normal authentication for E2E testing purposes.
 * 
 * Usage: GET /api/test/auth?userId=xxx&companyId=xxx
 */
export async function GET(request: NextRequest) {
  // CRITICAL: Only allow in development/test
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Test endpoints not available in production' },
      { status: 403 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const companyId = searchParams.get('companyId');

  if (!userId) {
    return NextResponse.json(
      { error: 'userId parameter required' },
      { status: 400 }
    );
  }

  try {
    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        companies: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If companyId provided, verify user has access
    let targetCompanyId = companyId;
    if (companyId) {
      const hasAccess = user.companies.some(uc => uc.companyId === companyId);
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'User does not have access to this company' },
          { status: 403 }
        );
      }
    } else {
      // Use first company if not specified
      targetCompanyId = user.companies[0]?.companyId;
    }

    if (!targetCompanyId) {
      return NextResponse.json(
        { error: 'User has no companies' },
        { status: 400 }
      );
    }

    // Create a test session
    // NOTE: This is a simplified mock. In a real implementation,
    // you'd create actual Clerk session tokens or use Clerk's test mode
    const response = NextResponse.redirect(
      new URL('/dashboard', request.url)
    );

    // Set mock session cookies
    response.cookies.set('__test_user_id', userId, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
    });

    response.cookies.set('__test_company_id', targetCompanyId, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Clear test session
 */
export async function DELETE() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Test endpoints not available in production' },
      { status: 403 }
    );
  }

  const response = NextResponse.json({ success: true });
  
  response.cookies.delete('__test_user_id');
  response.cookies.delete('__test_company_id');
  
  return response;
}
