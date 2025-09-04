import { test, expect } from '@playwright/test'

test.describe('Authentication & Authorization', () => {
  test('should redirect unauthenticated users to Clerk login', async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies()

    // Navigate to dashboard
    await page.goto('/dashboard')

    // Should be redirected to Clerk sign-in
    await expect(page).toHaveURL(/.*clerk\.com.*/)
  })

  test('should handle company selection flow', async ({ page }) => {
    // This test would require Clerk test mode setup
    // For now, just verify the select-company page exists
    await page.goto('/select-company')

    // Verify we're on the select company page
    await expect(page.locator('h1')).toContainText(/select.*company/i)
  })
})
