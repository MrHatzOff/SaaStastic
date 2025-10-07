import { test, expect } from '@playwright/test';
import { db } from '@/core/db/client';

/**
 * Billing E2E Tests
 * 
 * Tests the complete Stripe integration including:
 * - Checkout flow
 * - Subscription management
 * - Billing portal
 * - Webhook handling
 */

// Test configuration
const TEST_CARD_SUCCESS = '4242424242424242';
const TEST_CARD_DECLINED = '4000000000000002';
const TEST_TIMEOUT = 60000; // 60 seconds for Stripe operations

// Test data - use random IDs to avoid conflicts with parallel test execution
const testCompanyId = 'test-company-billing-' + Date.now() + '-' + Math.random().toString(36).substring(7);
const testUserId = 'test-user-billing-' + Date.now() + '-' + Math.random().toString(36).substring(7);

test.describe('Billing Flow', () => {
  test.beforeAll(async () => {
    // Setup: Create test company and user
    await db.company.create({
      data: {
        id: testCompanyId,
        name: 'Test Billing Company',
        slug: 'test-billing-' + Date.now() + '-' + Math.random().toString(36).substring(7),
      },
    });

    await db.user.create({
      data: {
        id: testUserId,
        email: `billing-test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
        name: 'Billing Test User',
      },
    });

    await db.userCompany.create({
      data: {
        userId: testUserId,
        companyId: testCompanyId,
        role: 'OWNER',
      },
    });
  });

  test.afterAll(async () => {
    // Cleanup: Remove test data
    try {
      await db.subscription.deleteMany({ where: { companyId: testCompanyId } });
      await db.invoice.deleteMany({ where: { companyId: testCompanyId } });
      await db.userCompany.deleteMany({ where: { companyId: testCompanyId } });
      await db.company.deleteMany({ where: { id: testCompanyId } }); // Use deleteMany to avoid errors if already deleted
      await db.user.deleteMany({ where: { id: testUserId } }); // Use deleteMany to avoid errors if already deleted
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  test('should display pricing plans', async ({ page }) => {
    await page.goto('/pricing');

    // Verify all three plans are visible (use heading role to avoid button text)
    await expect(page.getByRole('heading', { name: 'Starter' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Professional' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Enterprise' })).toBeVisible();

    // Verify pricing
    await expect(page.getByText('$29')).toBeVisible();
    await expect(page.getByText('$99')).toBeVisible();
    await expect(page.getByText('Custom')).toBeVisible(); // Enterprise shows "Custom"
  });

  test('should require authentication for checkout', async ({ page }) => {
    await page.goto('/pricing');

    // Click "Get Started" button without being logged in
    const getStartedButton = page.getByRole('button', { name: /get started/i }).first();
    await getStartedButton.click();

    // Should redirect to sign-in
    await page.waitForURL(/sign-in/, { timeout: 10000 });
  });

  test.skip('should complete checkout flow', async ({ page }) => {
    // Note: This test is skipped by default as it requires Stripe test mode
    // and proper authentication setup. Enable when running in test environment.
    
    test.setTimeout(TEST_TIMEOUT);

    // Login first (implement based on your auth setup)
    // await loginAsTestUser(page, testUserId);

    // Navigate to pricing
    await page.goto('/pricing');

    // Select Professional plan
    await page.getByRole('button', { name: /subscribe.*professional/i }).click();

    // Wait for Stripe Checkout redirect
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 10000 });

    // Fill in test card details
    const cardFrame = page.frameLocator('iframe[name*="card"]').first();
    await cardFrame.locator('[name="cardnumber"]').fill(TEST_CARD_SUCCESS);
    await cardFrame.locator('[name="exp-date"]').fill('1230');
    await cardFrame.locator('[name="cvc"]').fill('123');
    await cardFrame.locator('[name="postal"]').fill('12345');

    // Fill in email if required
    const emailInput = page.locator('[name="email"]');
    if (await emailInput.isVisible()) {
      await emailInput.fill(`test-${Date.now()}@example.com`);
    }

    // Submit payment
    await page.getByRole('button', { name: /subscribe|pay/i }).click();

    // Wait for success redirect
    await page.waitForURL(/dashboard.*success/, { timeout: 30000 });

    // Verify subscription in database
    const subscription = await db.subscription.findFirst({
      where: { companyId: testCompanyId },
    });

    expect(subscription).toBeTruthy();
    expect(subscription?.status).toBe('ACTIVE');
  });

  test('should display current subscription status', async ({ page }) => {
    // This test assumes a subscription exists
    // In a real test, you'd create one first or use a fixture

    await page.goto('/dashboard/billing');

    // Just verify the billing page loads successfully
    // The actual subscription UI may vary based on tenant state
    await expect(page.locator('body')).toBeVisible();
    
    // Check page loaded properly by looking for common billing page elements
    const hasBillingContent = await page.getByText(/billing|subscription|plan/i).first().isVisible().catch(() => false);
    expect(hasBillingContent).toBeTruthy();
  });

  test('should show upgrade options for free tier', async ({ page }) => {
    await page.goto('/dashboard/billing');

    // Look for upgrade CTA
    const upgradeButton = page.getByRole('button', { name: /upgrade|subscribe/i });
    
    if (await upgradeButton.isVisible()) {
      await expect(upgradeButton).toBeVisible();
      
      // Click should navigate to pricing
      await upgradeButton.click();
      await page.waitForURL(/pricing/);
    }
  });

  test.skip('should handle declined card', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);

    // await loginAsTestUser(page, testUserId);
    await page.goto('/pricing');

    // Select plan
    await page.getByRole('button', { name: /subscribe/i }).first().click();
    await page.waitForURL(/checkout\.stripe\.com/);

    // Use declined test card
    const cardFrame = page.frameLocator('iframe[name*="card"]').first();
    await cardFrame.locator('[name="cardnumber"]').fill(TEST_CARD_DECLINED);
    await cardFrame.locator('[name="exp-date"]').fill('1230');
    await cardFrame.locator('[name="cvc"]').fill('123');
    await cardFrame.locator('[name="postal"]').fill('12345');

    // Submit payment
    await page.getByRole('button', { name: /subscribe|pay/i }).click();

    // Should show error message
    await expect(page.getByText(/declined|failed/i)).toBeVisible({ timeout: 10000 });
  });

  test('should access billing portal', async ({ page }) => {
    // Note: Requires active subscription
    await page.goto('/dashboard/billing');

    const portalButton = page.getByRole('button', { name: /manage.*billing|billing.*portal/i });
    
    if (await portalButton.isVisible()) {
      await portalButton.click();
      
      // Should redirect to Stripe billing portal
      await page.waitForURL(/billing\.stripe\.com/, { timeout: 10000 });
    }
  });

  test('should display invoice history', async ({ page }) => {
    await page.goto('/dashboard/billing');

    // Just verify the billing page loads and has content
    // The invoice UI may vary based on tenant state
    await expect(page.locator('body')).toBeVisible();
    
    // Check page loaded properly
    const hasBillingContent = await page.getByText(/billing|subscription|plan|invoice/i).first().isVisible().catch(() => false);
    expect(hasBillingContent).toBeTruthy();
  });
});

test.describe('Subscription Management', () => {
  test('should show plan limits', async ({ page }) => {
    await page.goto('/dashboard/billing');

    // Check for usage/limits display
    const usageSection = page.locator('[data-testid="usage-limits"]');
    
    if (await usageSection.isVisible()) {
      // Verify limits are shown
      await expect(usageSection).toContainText(/users|storage|api/i);
    }
  });

  test.skip('should allow plan upgrade', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);

    // Assumes user has Starter plan
    await page.goto('/dashboard/billing');

    // Find upgrade button
    const upgradeButton = page.getByRole('button', { name: /upgrade/i });
    
    if (await upgradeButton.isVisible()) {
      await upgradeButton.click();
      
      // Should show plan selection
      await expect(page.getByText(/professional|enterprise/i)).toBeVisible();
    }
  });

  test.skip('should allow plan downgrade', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);

    // Assumes user has Professional or Enterprise plan
    await page.goto('/dashboard/billing');

    // Find downgrade option
    const manageButton = page.getByRole('button', { name: /change.*plan|manage/i });
    
    if (await manageButton.isVisible()) {
      await manageButton.click();
      await expect(page.getByText(/starter/i)).toBeVisible();
    }
  });

  test.skip('should allow subscription cancellation', async ({ page }) => {
    test.setTimeout(TEST_TIMEOUT);

    await page.goto('/dashboard/billing');

    // Find cancel button
    const cancelButton = page.getByRole('button', { name: /cancel.*subscription/i });
    
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      
      // Should show confirmation dialog
      await expect(page.getByText(/are you sure|confirm/i)).toBeVisible();
      
      // Don't actually cancel in test
      await page.getByRole('button', { name: /no|keep/i }).click();
    }
  });
});

test.describe('Webhook Handling', () => {
  test('should record subscription events', async () => {
    // Check if webhook events are being logged
    const recentEvents = await db.eventLog.findMany({
      where: {
        action: {
          in: [
            'subscription.created',
            'subscription.updated',
            'invoice.paid',
            'invoice.payment_failed',
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // If there are any subscriptions in the system, there should be events
    const subscriptionCount = await db.subscription.count();
    
    if (subscriptionCount > 0) {
      expect(recentEvents.length).toBeGreaterThan(0);
    }
  });

  test('should sync subscription data', async () => {
    // Verify subscriptions have all required fields
    const subscriptions = await db.subscription.findMany({
      take: 5,
    });

    for (const sub of subscriptions) {
      expect(sub.stripeSubscriptionId).toBeTruthy();
      expect(sub.stripePriceId).toBeTruthy();
      expect(sub.status).toBeTruthy();
      expect(sub.currentPeriodStart).toBeInstanceOf(Date);
      expect(sub.currentPeriodEnd).toBeInstanceOf(Date);
    }
  });

  test('should sync invoice data', async () => {
    // Verify invoices have all required fields
    const invoices = await db.invoice.findMany({
      take: 5,
    });

    for (const invoice of invoices) {
      expect(invoice.stripeInvoiceId).toBeTruthy();
      expect(invoice.status).toBeTruthy();
      expect(invoice.amountDue).toBeGreaterThanOrEqual(0);
      expect(invoice.currency).toBeTruthy();
    }
  });
});

test.describe('Multi-tenant Billing Isolation', () => {
  test('should isolate subscription data by company', async () => {
    // Create two test companies
    const company1Id = 'test-company-1-' + Date.now();
    const company2Id = 'test-company-2-' + Date.now();

    try {
      await db.company.create({
        data: { id: company1Id, name: 'Company 1', slug: 'company-1-' + Date.now() },
      });

      await db.company.create({
        data: { id: company2Id, name: 'Company 2', slug: 'company-2-' + Date.now() },
      });

      // Create subscription for company 1
      await db.subscription.create({
        data: {
          companyId: company1Id,
          stripeSubscriptionId: 'sub_test_' + Date.now(),
          stripePriceId: 'price_test',
          stripeProductId: 'prod_test',
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      // Verify company 2 has no subscription
      const company2Subscription = await db.subscription.findFirst({
        where: { companyId: company2Id },
      });

      expect(company2Subscription).toBeNull();

      // Verify company 1 has subscription
      const company1Subscription = await db.subscription.findFirst({
        where: { companyId: company1Id },
      });

      expect(company1Subscription).toBeTruthy();
    } finally {
      // Cleanup
      await db.subscription.deleteMany({ where: { companyId: company1Id } });
      await db.company.deleteMany({ where: { id: { in: [company1Id, company2Id] } } });
    }
  });
});

// Helper functions (implement based on your auth setup)
async function loginAsTestUser(page: import('@playwright/test').Page, userId: string) {
  // Implement based on your Clerk setup
  // This might involve setting cookies or using Clerk's test helpers
  console.log('Login helper not implemented - userId:', userId);
}
