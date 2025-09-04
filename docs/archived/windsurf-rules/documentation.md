---
activation: manual
priority: low
description: "Documentation standards for writing and maintaining project documentation"
---

# Documentation Standards Rules

## Code Documentation Requirements

### JSDoc Standards
```typescript
/**
 * Creates a new user in the specified company context
 * @param userData - The user data to create
 * @param companyId - The company ID for tenant scoping
 * @returns Promise resolving to the created user
 * @throws {ValidationError} When user data is invalid
 * @throws {TenantError} When company access is denied
 */
export async function createUser(
  userData: CreateUserData,
  companyId: string
): Promise<User> {
  // Implementation
}
```

### Inline Documentation
- Complex business logic must be documented inline
- Database queries with complex joins require explanation
- Security-sensitive code must include security notes
- Performance optimizations must be documented

## API Documentation Standards

### OpenAPI/Swagger Requirements
- All API routes must have OpenAPI documentation
- Include example requests and responses
- Document all possible error codes
- Specify authentication requirements

### API Route Documentation Pattern
```typescript
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     security:
 *       - ClerkAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
```

## Project Documentation Standards

### Required Documentation Files
- **README.md**: Setup instructions and architecture overview
- **CONTRIBUTING.md**: Development workflow and standards
- **API.md**: Complete API documentation with examples
- **DEPLOYMENT.md**: Environment setup and deployment guide
- **AUTHENTICATION.md**: Authentication system documentation
- **TENANTING.md**: Multi-tenancy architecture guide

### Documentation Structure
```markdown
# Title

## Overview
Brief description of the component/feature

## Quick Start
Minimal setup instructions

## Detailed Guide
Step-by-step instructions

## API Reference
Technical details and examples

## Troubleshooting
Common issues and solutions

## See Also
Links to related documentation
```

## Database Documentation

### Schema Documentation
- All database models must have descriptive comments
- Complex relationships must be explained
- Migration files must include change rationale
- Index strategies must be documented

### Migration Documentation Pattern
```sql
-- Migration: Add user preferences table
-- Purpose: Store user-specific settings per company
-- Impact: No breaking changes, new optional feature
-- Rollback: Safe to rollback, no data dependencies

CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL, -- Clerk user ID
  company_id UUID NOT NULL REFERENCES companies(id),
  preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure one preference record per user per company
  UNIQUE(user_id, company_id)
);
```

## Changelog and Release Notes

### Changelog Format
```markdown
## [1.2.0] - 2024-01-15

### Added
- New company management UI
- Development company switcher for keyless mode

### Changed
- Updated authentication flow to support dev mode
- Improved error handling in API routes

### Fixed
- TypeScript errors in company API routes
- Authentication bypass in development

### Security
- Enhanced tenant isolation in database queries
```

### Release Documentation
- All releases must include migration guides
- Breaking changes require upgrade instructions
- New features need usage examples
- Performance improvements should include benchmarks
