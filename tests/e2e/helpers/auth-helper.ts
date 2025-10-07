import { Page } from '@playwright/test';
import { db } from '@/core/db/client';

/**
 * Authentication Helper for E2E Tests
 * 
 * Provides utilities to authenticate users in Playwright tests
 * without going through the full Clerk UI flow.
 */

export interface TestUser {
  id: string;
  email: string;
  clerkId?: string;
  companyId?: string;
}

/**
 * Create a test user session by setting Clerk session cookies
 * 
 * NOTE: This is a simplified version. For production tests, you should:
 * 1. Use Clerk's test mode with real test users
 * 2. Or use Clerk's backend API to create sessions
 * 3. Or use a dedicated test authentication endpoint
 */
export async function loginAsTestUser(page: Page, userId: string): Promise<void> {
  // For now, navigate to a test auth endpoint that sets up the session
  // You'll need to create this endpoint in your app
  await page.goto(`/api/test/auth?userId=${userId}`);
  
  // Wait for redirect to dashboard
  await page.waitForURL(/dashboard/, { timeout: 5000 }).catch(() => {
    console.warn('Auth redirect timeout - user may not be authenticated');
  });
}

/**
 * Alternative: Use Clerk's test mode
 * 
 * This requires setting up Clerk in test mode and using their test tokens
 */
export async function loginWithClerkTestMode(page: Page, email: string): Promise<void> {
  // Navigate to sign-in
  await page.goto('/sign-in');
  
  // In Clerk test mode, you can use magic test emails
  // that automatically authenticate without verification
  await page.fill('input[name="identifier"]', email);
  await page.click('button[type="submit"]');
  
  // Wait for redirect
  await page.waitForURL(/dashboard|select-company/, { timeout: 10000 });
}

/**
 * Set up authentication state from database
 * 
 * This creates the necessary session state by:
 * 1. Creating a test user in the database
 * 2. Setting up their company relationship
 * 3. Creating a mock session
 */
export async function setupAuthenticatedSession(
  page: Page,
  options: {
    userId: string;
    email: string;
    companyId: string;
    role?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  }
): Promise<void> {
  const { userId, email, companyId, role = 'OWNER' } = options;

  // Ensure user exists in database
  await db.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email,
      name: 'Test User',
    },
    update: {},
  });

  // Ensure company relationship exists
  await db.userCompany.upsert({
    where: {
      userId_companyId: {
        userId,
        companyId,
      },
    },
    create: {
      userId,
      companyId,
      role,
    },
    update: {},
  });

  // Set session cookies (this is a simplified approach)
  // In production, you'd use Clerk's actual session format
  await page.context().addCookies([
    {
      name: '__session',
      value: `test-session-${userId}`,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
    {
      name: '__clerk_db_jwt',
      value: `test-jwt-${userId}`,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ]);

  // Navigate to dashboard to verify auth
  await page.goto('/dashboard');
}

/**
 * Logout helper
 */
export async function logout(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.goto('/');
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies();
  return cookies.some(c => c.name === '__session' || c.name.includes('clerk'));
}
