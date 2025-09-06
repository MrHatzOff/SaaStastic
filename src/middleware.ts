import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

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

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes including authentication routes
  if (isPublicRoute(req)) {
    return;
  }

  // For all other routes, require authentication
  const { userId } = await auth();

  if (!userId) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
