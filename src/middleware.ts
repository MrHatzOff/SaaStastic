import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/contact',
  '/pricing',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
  '/api/health',
]);

// Define routes that require company selection
const requiresCompanyRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/companies(.*)',
  '/api/customers(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // In development without Clerk keys, bypass authentication
  if (process.env.NODE_ENV === 'development' && !process.env.CLERK_SECRET_KEY) {
    return NextResponse.next();
  }

  const { userId, sessionClaims, redirectToSignIn } = await auth();
  
  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to sign-in
  if (!userId) {
    return redirectToSignIn();
  }

  // For routes requiring company context, check if user has selected a company
  if (requiresCompanyRoute(req)) {
    const companyId = (sessionClaims as any)?.metadata?.companyId;
    
    if (!companyId) {
      // For development, allow access to dashboard without company selection
      // In production, you might want to redirect to company selection
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.next();
      }
      // Redirect to company selection page
      return NextResponse.redirect(new URL('/select-company', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
