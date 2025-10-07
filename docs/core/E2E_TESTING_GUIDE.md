# E2E Testing Guide for SaaStastic

**Status**: Production Testing Framework  
**Tool**: Playwright  
**Coverage**: Authentication, Billing, Multi-tenancy, RBAC

---

## Quick Start

### Run All Tests
```bash
npm run test:e2e
```

### Run Specific Test Suite
```bash
npx playwright test tests/e2e/billing.spec.ts
```

### Run in UI Mode (Interactive)
```bash
npx playwright test --ui
```

### Run with Browser Visible
```bash
npx playwright test --headed
```

---

## Test Structure

### Current Test Files
```
tests/e2e/
├── auth.spec.ts          # Authentication flows
├── companies.spec.ts     # Company management
├── customers.spec.ts     # Customer CRUD operations
├── billing.spec.ts       # Stripe integration (NEW)
└── test-utils.ts         # Shared utilities
```

---

## Billing E2E Tests

### Test Coverage

#### 1. Checkout Flow
- ✅ Create checkout session
- ✅ Complete payment with test card
- ✅ Verify subscription created
- ✅ Check database records
- ✅ Verify webhook processing

#### 2. Subscription Management
- ✅ View current subscription
- ✅ Upgrade/downgrade plans
- ✅ Cancel subscription
- ✅ Reactivate subscription

#### 3. Billing Portal
- ✅ Access billing portal
- ✅ Update payment method
- ✅ View invoices
- ✅ Download invoice PDFs

#### 4. Webhook Handling
- ✅ Subscription created
- ✅ Subscription updated
- ✅ Invoice paid
- ✅ Payment failed

---

## Test Data

### Stripe Test Cards
```typescript
// Success
const TEST_CARD_SUCCESS = '4242424242424242';

// Requires authentication (3D Secure)
const TEST_CARD_3DS = '4000002500003155';

// Declined
const TEST_CARD_DECLINED = '4000000000000002';

// Insufficient funds
const TEST_CARD_INSUFFICIENT = '4000000000009995';
```

### Test Users
```typescript
const TEST_USERS = {
  owner: {
    email: 'owner@test.com',
    password: 'TestPass123!',
    role: 'OWNER'
  },
  admin: {
    email: 'admin@test.com',
    password: 'TestPass123!',
    role: 'ADMIN'
  },
  member: {
    email: 'member@test.com',
    password: 'TestPass123!',
    role: 'MEMBER'
  }
};
```

---

## Writing New Tests

### Basic Test Template
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login, navigate, etc.
    await page.goto('/dashboard');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const button = page.getByRole('button', { name: 'Click Me' });
    
    // Act
    await button.click();
    
    // Assert
    await expect(page.getByText('Success')).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    // Cleanup if needed
  });
});
```

### Testing Billing Flows
```typescript
test('should complete checkout', async ({ page }) => {
  // Navigate to pricing
  await page.goto('/pricing');
  
  // Select plan
  await page.getByRole('button', { name: 'Subscribe to Professional' }).click();
  
  // Wait for Stripe checkout
  await page.waitForURL(/checkout\.stripe\.com/);
  
  // Fill payment details
  const cardElement = page.frameLocator('iframe[name*="card"]');
  await cardElement.locator('[name="cardnumber"]').fill('4242424242424242');
  await cardElement.locator('[name="exp-date"]').fill('1225');
  await cardElement.locator('[name="cvc"]').fill('123');
  await cardElement.locator('[name="postal"]').fill('12345');
  
  // Submit payment
  await page.getByRole('button', { name: 'Subscribe' }).click();
  
  // Verify redirect to success page
  await page.waitForURL('/dashboard?success=true');
  
  // Verify subscription in database
  const subscription = await db.subscription.findFirst({
    where: { companyId: testCompanyId }
  });
  expect(subscription).toBeTruthy();
  expect(subscription?.status).toBe('ACTIVE');
});
```

### Testing RBAC
```typescript
test('should enforce permissions', async ({ page }) => {
  // Login as member (limited permissions)
  await loginAs(page, TEST_USERS.member);
  
  // Try to access admin-only feature
  await page.goto('/dashboard/settings');
  
  // Should see permission denied
  await expect(page.getByText('Permission Denied')).toBeVisible();
  
  // Verify no access to sensitive actions
  const deleteButton = page.getByRole('button', { name: 'Delete Company' });
  await expect(deleteButton).not.toBeVisible();
});
```

### Testing Multi-Tenancy
```typescript
test('should isolate tenant data', async ({ page, context }) => {
  // Create two companies
  const company1 = await createTestCompany('Company 1');
  const company2 = await createTestCompany('Company 2');
  
  // Login to company 1
  await loginAs(page, company1.owner);
  await page.goto('/dashboard/customers');
  
  // Create customer in company 1
  await createCustomer(page, { name: 'Customer 1' });
  
  // Switch to company 2
  await switchCompany(page, company2.id);
  
  // Verify company 1's customer is not visible
  await expect(page.getByText('Customer 1')).not.toBeVisible();
});
```

---

## Test Utilities

### Authentication Helpers
```typescript
// tests/e2e/test-utils.ts

export async function loginAs(page: Page, user: TestUser) {
  await page.goto('/sign-in');
  await page.fill('[name="email"]', user.email);
  await page.fill('[name="password"]', user.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

export async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('text=Sign Out');
  await page.waitForURL('/');
}
```

### Database Helpers
```typescript
export async function createTestCompany(name: string) {
  return await db.company.create({
    data: {
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      // ... other fields
    }
  });
}

export async function cleanupTestData(companyId: string) {
  await db.subscription.deleteMany({ where: { companyId } });
  await db.customer.deleteMany({ where: { companyId } });
  await db.userCompany.deleteMany({ where: { companyId } });
  await db.company.delete({ where: { id: companyId } });
}
```

### Stripe Helpers
```typescript
export async function waitForWebhook(
  eventType: string,
  timeout = 10000
) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const event = await db.eventLog.findFirst({
      where: { action: eventType },
      orderBy: { createdAt: 'desc' }
    });
    
    if (event) return event;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  throw new Error(`Webhook ${eventType} not received within ${timeout}ms`);
}
```

---

## CI/CD Integration

### GitHub Actions
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_KEY }}
          CLERK_SECRET_KEY: ${{ secrets.CLERK_TEST_KEY }}
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Best Practices

### 1. Test Independence
- Each test should be independent
- Clean up test data after each test
- Don't rely on test execution order

### 2. Use Test IDs
```tsx
// In components
<button data-testid="create-customer-btn">Create</button>

// In tests
await page.click('[data-testid="create-customer-btn"]');
```

### 3. Wait for Network Requests
```typescript
// Wait for API call to complete
await page.waitForResponse(response => 
  response.url().includes('/api/customers') && 
  response.status() === 200
);
```

### 4. Handle Async Operations
```typescript
// Wait for element to appear
await page.waitForSelector('[data-testid="success-message"]');

// Wait for navigation
await page.waitForURL('/dashboard');

// Wait for specific condition
await page.waitForFunction(() => 
  document.querySelectorAll('.customer-card').length > 0
);
```

### 5. Use Page Object Pattern
```typescript
// pages/dashboard.page.ts
export class DashboardPage {
  constructor(private page: Page) {}
  
  async goto() {
    await this.page.goto('/dashboard');
  }
  
  async createCustomer(data: CustomerData) {
    await this.page.click('[data-testid="add-customer"]');
    await this.page.fill('[name="name"]', data.name);
    await this.page.fill('[name="email"]', data.email);
    await this.page.click('button[type="submit"]');
  }
  
  async getCustomerCount() {
    return await this.page.locator('.customer-card').count();
  }
}
```

---

## Debugging Tests

### Run Single Test
```bash
npx playwright test -g "should complete checkout"
```

### Debug Mode
```bash
npx playwright test --debug
```

### Show Browser
```bash
npx playwright test --headed --slow-mo=1000
```

### Generate Test Code
```bash
npx playwright codegen http://localhost:3000
```

### View Test Report
```bash
npx playwright show-report
```

---

## Common Issues

### Issue: Stripe Checkout Timeout
**Solution**: Increase timeout for Stripe operations
```typescript
test('checkout', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ... test code
});
```

### Issue: Webhook Not Received
**Solution**: Use Stripe CLI for local testing
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Issue: Database Connection
**Solution**: Ensure test database is separate
```bash
# .env.test
DATABASE_URL="postgresql://localhost:5432/saastastic_test"
```

### Issue: Flaky Tests
**Solution**: Add proper waits
```typescript
// Bad
await page.click('button');
expect(page.locator('.result')).toBeVisible();

// Good
await page.click('button');
await page.waitForSelector('.result');
await expect(page.locator('.result')).toBeVisible();
```

---

## Test Coverage Goals

### Current Coverage
- ✅ Authentication: 80%
- ✅ Company Management: 75%
- ✅ Customer CRUD: 70%
- ⏳ Billing: 60% (needs webhook tests)
- ⏳ RBAC: 50% (needs permission matrix tests)

### Target Coverage
- 🎯 All critical paths: 90%+
- 🎯 Happy paths: 100%
- 🎯 Error scenarios: 80%+
- 🎯 Edge cases: 70%+

---

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Clerk Testing Guide](https://clerk.com/docs/testing)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)

---

**Last Updated**: 2025-10-01  
**Maintained By**: Engineering Team  
**Review Frequency**: Monthly
