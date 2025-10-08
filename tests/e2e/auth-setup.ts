import { test as setup, expect } from '@playwright/test'
import { clerk } from '@clerk/testing/playwright'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') })

const authFile = 'playwright/.clerk/user.json'

/**
 * Authenticate with Clerk and save the auth state
 * 
 * This setup handles three possible post-signin scenarios:
 * 1. New user → redirects to /onboarding (company creation needed)
 * 2. Existing user without company → redirects to /onboarding
 * 3. Existing user with company → redirects to /dashboard
 * 
 * Company creation takes ~8-10 seconds due to RBAC provisioning (normal behavior)
 */
setup('authenticate', async ({ page }) => {
  const email = process.env.CLERK_TEST_USER_EMAIL
  const password = process.env.CLERK_TEST_USER_PASSWORD

  if (!email || !password) {
    throw new Error(
      'CLERK_TEST_USER_EMAIL and CLERK_TEST_USER_PASSWORD must be set in .env.test'
    )
  }

  console.log('🔐 Starting authentication flow...')
  console.log('📧 Test user:', email)

  // Navigate to sign-in page
  await page.goto('/sign-in')

  // Sign in using Clerk test helper
  console.log('📝 Signing in with Clerk...')
  await clerk.signIn({
    page,
    signInParams: {
      strategy: 'password',
      identifier: email,
      password: password,
    },
  })

  // Wait for navigation after sign-in (increased timeout for company creation)
  console.log('⏳ Waiting for navigation after sign-in...')
  
  // Wait for either dashboard or homepage (Clerk redirect might go to either)
  try {
    await page.waitForURL(/\/(dashboard|onboarding|$)/, { timeout: 60000 })
    console.log('✅ Navigation completed')
  } catch (e) {
    console.log('⚠️  Timeout waiting for URL change (user may already be on correct page), continuing anyway...')
  }
  
  await page.waitForTimeout(2000) // Buffer for page load
  
  const currentUrl = page.url()
  console.log('📍 Current URL after sign-in:', currentUrl)
  
  // Handle different post-signin scenarios
  if (currentUrl.includes('/onboarding')) {
    console.log('🏢 User needs to complete onboarding - checking for company setup form...')
    
    // Check if we're on company-setup page
    const companyNameInput = await page.locator('input[name="name"]').first()
    const isCompanySetupPage = await companyNameInput.isVisible().catch(() => false)
    
    if (isCompanySetupPage) {
      console.log('📋 Completing company setup form...')
      
      // Fill company setup form
      await companyNameInput.fill('Test Company E2E')
      
      // Submit the form
      const submitButton = page.locator('button[type="submit"]').first()
      await submitButton.click()
      
      // Wait for company creation (can take 8-10 seconds for RBAC provisioning)
      console.log('⏳ Waiting for company creation (RBAC provisioning ~8-10s)...')
      await page.waitForURL(/\/dashboard/, { timeout: 60000 })
      await page.waitForLoadState('networkidle', { timeout: 60000 })
      console.log('✅ Company created and user redirected to dashboard')
    } else {
      console.log('⚠️  Unexpected onboarding state - manual intervention may be required')
      throw new Error(`Onboarding page found but company setup not detected. URL: ${currentUrl}`)
    }
  } else if (currentUrl === 'http://localhost:3000/' || currentUrl.endsWith('/')) {
    // User landed on homepage (Clerk redirect URLs not configured properly)
    console.log('⚠️  User landed on homepage instead of dashboard')
    console.log('🔄 Navigating to dashboard manually...')
    
    // Navigate to dashboard manually
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle', { timeout: 30000 })
    console.log('✅ Manually navigated to dashboard')
  } else if (currentUrl.includes('/dashboard')) {
    console.log('✅ User correctly redirected to dashboard')
  }
  
  // Verify we're on the dashboard after everything
  const finalUrl = page.url()
  console.log('📍 Final URL:', finalUrl)
  
  const isAuthenticated = finalUrl.includes('/dashboard') || finalUrl.includes('/select-company')
  
  if (!isAuthenticated) {
    console.log('❌ Not on dashboard or select-company page')
    console.log('🔍 Attempting to navigate to dashboard one more time...')
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle', { timeout: 30000 })
    
    const retryUrl = page.url()
    if (!retryUrl.includes('/dashboard') && !retryUrl.includes('/select-company')) {
      throw new Error(`Authentication failed - unexpected final URL: ${retryUrl}. Expected /dashboard or /select-company`)
    }
    console.log('✅ Successfully navigated to dashboard after retry')
  }
  
  console.log('✅ Authentication successful')
  
  // Save the authenticated state
  await page.context().storageState({ path: authFile })

  console.log('✅ Authentication state saved to', authFile)
  console.log('🎉 Setup complete - tests can now run with this authenticated session')
})
