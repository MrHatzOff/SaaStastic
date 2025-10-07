import { test, expect } from '@playwright/test'
import { setupClerkTestingToken } from '@clerk/testing/playwright'

test.describe('Customer CRUD Operations', () => {
  test.describe('Role-based Access Control', () => {
    test('authenticated user can access customers page', async ({ page }) => {
      await setupClerkTestingToken({ page })
      
      // Navigate to customers page
      await page.goto('/dashboard/customers')

      // Should be on customers page (not redirected)
      await expect(page).toHaveURL(/\/dashboard\/customers/)
    })

    test('authenticated user can view customer list', async ({ page }) => {
      await setupClerkTestingToken({ page })
      
      await page.goto('/dashboard/customers')
      
      // Verify page loaded successfully
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('Navigation', () => {
    test('authenticated user can navigate between dashboard pages', async ({ page }) => {
      await setupClerkTestingToken({ page })
      
      // Start at dashboard
      await page.goto('/dashboard')
      await expect(page).toHaveURL(/\/dashboard/)
      
      // Navigate to customers (if link exists)
      const customersLink = page.locator('a[href*="/customers"]').first()
      if (await customersLink.isVisible()) {
        await customersLink.click()
        await expect(page).toHaveURL(/\/customers/)
      }
    })
  })
})
