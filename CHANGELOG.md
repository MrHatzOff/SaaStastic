# Changelog

All notable changes to SaaStastic will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Comprehensive unit test suite with 100% passing tests (60/60)
- Permission helper functions: `checkPermission()`, `hasAnyPermission()`, `hasAllPermissions()`
- Manual Testing Guide for non-technical users
- Complete Stripe webhook handler test coverage

### Fixed
- E2E test company isolation issues (users now properly scoped to test companies)
- Vitest PostCSS configuration to prevent CSS processing errors
- TypeScript compatibility for test files
- Tenant isolation test assertions to match Prisma behavior

### Changed
- Webhook handler methods are now public static methods on `WebhookHandlers` class
- Permission naming convention regex updated to allow underscores and multi-level namespaces
- Improved test data mocking for Prisma operations

---

## [1.0.0-beta] - 2025-10-07

### Production Readiness
- ✅ All unit tests passing (60/60)
- ✅ E2E tests passing (27/30) - 3 intentionally skipped
- ✅ Multi-tenant security fully enforced
- ✅ RBAC system complete with 29 permissions
- ✅ Stripe integration fully functional

### Test Coverage
- RBAC Permission System (18 unit tests)
- Tenant Isolation (12 unit tests)
- Stripe Webhooks (15 unit tests)
- User Invitations (15 unit tests)
- Authentication E2E (3 tests)
- Billing E2E (14 tests including Stripe checkout)
- Company Management E2E (5 tests)
- Customer Management E2E (5 tests)

### Documentation
- Pre-deployment checklist updated with test status
- Manual testing guide created
- Webhook handler implementation documented
- Permission system helper functions documented

---

## [0.9.0] - 2025-10-06

### Added
- Complete RBAC system with role provisioning
- User invitation system with email notifications
- Stripe webhook handlers for subscription lifecycle
- Multi-tenant data isolation middleware
- Comprehensive E2E test suite with Playwright

### Security
- All API routes protected with permission middleware
- Tenant context properly enforced across all queries
- Input validation with Zod schemas
- Webhook signature verification

### Infrastructure
- Vitest configuration for unit testing
- Playwright configuration for E2E testing
- Test environment setup with proper isolation
- Database seed scripts for development

---

## [0.8.0] - 2025-10-05

### Added
- Clerk 6.x authentication integration
- Stripe checkout and billing portal
- Company creation and management
- Customer CRUD operations
- Dashboard with smart onboarding

### UI/UX
- Professional marketing pages
- Responsive design for all screen sizes
- Loading states and error handling
- Toast notifications for user feedback

---

## [0.7.0] - 2025-10-04

### Foundation
- Next.js 15 + React 19 + TypeScript setup
- PostgreSQL database with Prisma ORM
- TailwindCSS 4 styling system
- Multi-tenant architecture design

---

## Notes

### Skipped E2E Tests
The following E2E tests are intentionally skipped and require manual testing:
1. **Plan Upgrade** - Requires active subscription + webhook processing
2. **Plan Downgrade** - Requires active subscription + webhook processing  
3. **Subscription Cancellation** - Requires complex webhook flow

These scenarios are tested in staging environments before production deployment.

### TypeScript Compliance
- **Source Code**: 100% TypeScript compliant ✅
- **Generated Files**: 2 errors in `.next/types/` (Next.js generated, non-blocking)
- **Test Files**: Minor type casting for mock data (expected)

### Known Issues
- None blocking production deployment

---

*For detailed deployment instructions, see `PRE_DEPLOYMENT_CHECKLIST.md`*
