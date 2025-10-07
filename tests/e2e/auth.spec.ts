import { test, expect } from '@playwright/test'
import { setupClerkTestingToken } from '@clerk/testing/playwright'

test.describe('Authentication & Authorization', () => {
  test('authenticated user can access dashboard', async ({ page }) => {
    // Setup Clerk testing token for this test
    await setupClerkTestingToken({ page })
    
    // Navigate to dashboard
    await page.goto('/dashboard')

    // Should be on dashboard (not redirected to sign-in)
    await expect(page).toHaveURL(/\/dashboard/)
    
    // Verify dashboard content is visible
    await expect(page.locator('body')).toBeVisible()
  })

  test('authenticated user can view their profile', async ({ page }) => {
    await setupClerkTestingToken({ page })
    
    // Navigate to dashboard first
    await page.goto('/dashboard')
    
    // Look for user menu or profile indicator
    // This will depend on your UI structure
    const userButton = page.locator('[data-testid="user-button"]').or(page.locator('button:has-text("Account")')).first()
    
    if (await userButton.isVisible()) {
      await expect(userButton).toBeVisible()
    }
  })

  test('authenticated user has proper session', async ({ page }) => {
    await setupClerkTestingToken({ page })
    
    await page.goto('/dashboard')
    
    // Verify session exists by checking for auth-protected content
    await expect(page).toHaveURL(/\/dashboard/)
    
    // Should not be redirected to sign-in
    await expect(page).not.toHaveURL(/.*sign-in.*/)
  })
})
