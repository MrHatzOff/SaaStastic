# E2E Testing with Playwright and Clerk

This directory contains end-to-end tests for SaaStastic using Playwright with Clerk authentication.

## Setup

### Prerequisites

1. **Test user created in Clerk Dashboard** (Development instance)
   - Email and password authentication enabled
   - Test user credentials stored in `.env.test`

2. **Environment variables** in `.env.test`:
   ```bash
   # Clerk credentials
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   
   # Test user credentials
   CLERK_TEST_USER_EMAIL=playwright.tester@example.com
   CLERK_TEST_USER_PASSWORD=your_password_here
   CLERK_TEST_USER_ID=user_...
   ```

3. **Dependencies installed**:
   ```bash
   npm install
   ```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run specific test file
```bash
npx playwright test tests/e2e/auth.spec.ts
```

## How It Works

### Authentication Flow

1. **Global Setup** (`global-setup.ts`)
   - Runs once before all tests
   - Calls `clerkSetup()` to obtain a testing token from Clerk

2. **Auth Setup** (`auth-setup.ts`)
   - Runs as a setup project
   - Signs in with test user credentials
   - Saves authenticated state to `playwright/.clerk/user.json`

3. **Test Execution**
   - Tests load the saved auth state automatically
   - Each test starts with an authenticated session
   - Use `setupClerkTestingToken({ page })` for additional token setup if needed

### Project Structure

```
tests/e2e/
├── global-setup.ts       # Clerk testing token setup
├── auth-setup.ts         # Sign in and save auth state
├── auth.spec.ts          # Authentication tests
├── customers.spec.ts     # Customer CRUD tests
├── billing.spec.ts       # Billing flow tests
├── companies.spec.ts     # Company management tests
└── test-utils.ts         # Shared test utilities
```

## Writing Tests

### Basic authenticated test

```typescript
import { test, expect } from '@playwright/test'
import { setupClerkTestingToken } from '@clerk/testing/playwright'

test('my authenticated test', async ({ page }) => {
  // Setup Clerk testing token
  await setupClerkTestingToken({ page })
  
  // Navigate to protected page
  await page.goto('/dashboard')
  
  // Test your functionality
  await expect(page).toHaveURL(/\/dashboard/)
})
```

### Test without authentication

Tests run in the `chromium` project automatically have auth state loaded.
To test unauthenticated flows, you would need to create a separate project
without the `storageState` configuration.

## Troubleshooting

### Tests fail with authentication errors

1. Verify test user exists in Clerk Dashboard
2. Check `.env.test` has correct credentials
3. Ensure password matches exactly (including spaces)
4. Try deleting `playwright/.clerk/user.json` and re-running tests

### "Testing token not found" error

1. Ensure `@clerk/testing` is installed: `npm install -D @clerk/testing`
2. Check that `globalSetup` is configured in `playwright.config.ts`
3. Verify Clerk secret key is valid in `.env.test`

### Tests are slow

- Auth state is reused across tests, so sign-in only happens once
- Use `test.describe.configure({ mode: 'parallel' })` for parallel execution
- Consider using `test.skip()` for tests under development

## CI/CD Integration

For GitHub Actions or other CI environments:

1. Add Clerk credentials as secrets
2. Create test user programmatically or use existing dev user
3. Set environment variables in CI config:
   ```yaml
   env:
     CLERK_SECRET_KEY: ${{ secrets.CLERK_SECRET_KEY }}
     CLERK_TEST_USER_EMAIL: ${{ secrets.CLERK_TEST_USER_EMAIL }}
     CLERK_TEST_USER_PASSWORD: ${{ secrets.CLERK_TEST_USER_PASSWORD }}
   ```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Clerk Testing Documentation](https://clerk.com/docs/testing/playwright)
- [@clerk/testing Package](https://www.npmjs.com/package/@clerk/testing)
