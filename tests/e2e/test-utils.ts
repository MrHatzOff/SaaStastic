import { test as base, expect, Page } from '@playwright/test'

/**
 * Test utilities for multi-tenant SaaS E2E testing
 */

// Test user roles for different scenarios
export const TEST_USERS = {
  OWNER: {
    email: 'owner@test.com',
    password: 'testpassword',
    role: 'OWNER' as const
  },
  ADMIN: {
    email: 'admin@test.com',
    password: 'testpassword',
    role: 'ADMIN' as const
  },
  MEMBER: {
    email: 'member@test.com',
    password: 'testpassword',
    role: 'MEMBER' as const
  }
}

// Extended test with authentication helpers
export const test = base.extend<{
  authenticatedPage: Page
}>({
  authenticatedPage: async ({ page }, testUse) => {
    // This would need to be implemented with Clerk Test mode
    // For now, just return the page
    await testUse(page)
  }
})

/**
 * Helper to create authenticated session for a specific user role
 */
export async function authenticateAs(page: Page, userRole: keyof typeof TEST_USERS) {
  const user = TEST_USERS[userRole]

  // Navigate to login page
  await page.goto('/')

  // This would need to be implemented with actual Clerk test mode
  // For now, this is a placeholder structure

  // Example implementation would be:
  // await page.fill('[data-testid="email-input"]', user.email)
  // await page.fill('[data-testid="password-input"]', user.password)
  // await page.click('[data-testid="sign-in-button"]')
  // await page.waitForURL('/dashboard')
}

/**
 * Helper to verify API response contains expected data
 */
export async function verifyApiResponse(response: { ok: () => boolean; status: () => number; json: () => Promise<unknown> }, expectedStatus: number = 200) {
  expect(response.ok()).toBe(true)
  expect(response.status()).toBe(expectedStatus)

  const data = await response.json()
  expect(data).toHaveProperty('success')
  return data
}

/**
 * Helper to test role-based access control
 */
export async function testRoleAccess(page: Page, endpoint: string, method: string, expectedStatus: number) {
  const requestMethod = method.toLowerCase() as 'get' | 'post' | 'put' | 'delete';
  const response = await page.request[requestMethod](endpoint)
  expect(response.status()).toBe(expectedStatus)
}

/**
 * Helper to create test data and clean up after tests
 */
export class TestDataHelper {
  private createdIds: string[] = []

  trackId(id: string) {
    this.createdIds.push(id)
  }

  async cleanup() {
    // Cleanup logic would go here
    // This would delete test data created during tests
    this.createdIds = []
  }
}
