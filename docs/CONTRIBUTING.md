# Contributing Guide

Thank you for your interest in contributing to this multi-tenant SaaS boilerplate! This guide will help you get started with development and ensure consistency across the codebase.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Git
- Code editor (VS Code recommended)

### Development Setup

1. **Fork and Clone**
```bash
git clone https://github.com/your-username/saastastic.git
cd saastastic
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Database Setup**
```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

5. **Start Development**
```bash
npm run dev
```

## 📁 Project Structure

Understanding the project structure is crucial for effective contributions:

```
├── /core                    # Core business logic
│   ├── /auth               # Authentication & company context
│   ├── /db                 # Database client & tenant isolation
│   └── /automation         # Background jobs & workflows
├── /modules                # Feature modules
│   ├── /company           # Company management
│   ├── /finance           # Financial features
│   └── /shared            # Shared components & utilities
├── /src                    # Next.js application
│   ├── /app               # App router pages & API routes
│   ├── /components        # Reusable UI components
│   └── /lib               # Utilities & configurations
├── /docs                   # Documentation
└── /prisma                # Database schema & migrations
```

## 🏗️ Architecture Principles

### Multi-Tenancy First
- Every feature must respect tenant isolation
- Use `withApiMiddleware` with `requireCompany: true`
- Always use `useCurrentCompany()` in components
- Never bypass tenant scoping

### Security by Design
- Input validation on all endpoints
- Rate limiting on public APIs
- Proper error handling without data leakage
- Audit trails for sensitive operations

### Performance Optimized
- Database queries with proper indexes
- Component lazy loading where appropriate
- Optimistic updates in UI
- Efficient caching strategies

## 🔧 Development Workflow

### 1. Issue Assignment
- Check existing issues or create a new one
- Get issue assigned before starting work
- Discuss approach for complex features

### 2. Branch Naming
```bash
# Feature branches
git checkout -b feature/customer-management

# Bug fixes
git checkout -b fix/tenant-isolation-bug

# Documentation
git checkout -b docs/api-documentation
```

### 3. Development Process
- Write tests first (TDD approach)
- Implement feature with proper error handling
- Update documentation if needed
- Test multi-tenant isolation
- Verify performance impact

### 4. Commit Messages
Follow conventional commits format:

```bash
# Features
git commit -m "feat(customers): add customer creation API"

# Bug fixes
git commit -m "fix(auth): resolve company context issue"

# Documentation
git commit -m "docs(api): add customer endpoints documentation"

# Refactoring
git commit -m "refactor(db): optimize tenant query performance"
```

## 🧪 Testing Guidelines

### Unit Tests
```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- customer.test.ts

# Watch mode
npm run test:watch
```

### Integration Tests
```bash
# Run E2E tests
npm run test:e2e

# Run specific E2E test
npm run test:e2e -- customers.spec.ts
```

### Testing Multi-Tenancy
Every feature must include tenant isolation tests:

```typescript
describe('Customer API - Tenant Isolation', () => {
  it('should only return customers for current company', async () => {
    // Create customers for different companies
    await createCustomer({ companyId: 'company-1', name: 'Customer 1' })
    await createCustomer({ companyId: 'company-2', name: 'Customer 2' })
    
    // Set company context
    setTenantContext({ companyId: 'company-1', userId: 'user-1' })
    
    // Fetch customers
    const customers = await db.customer.findMany()
    
    // Should only see company-1 customers
    expect(customers).toHaveLength(1)
    expect(customers[0].name).toBe('Customer 1')
  })
})
```

## 📝 Code Standards

### TypeScript
- Use strict TypeScript configuration
- Define proper interfaces for all data structures
- Avoid `any` type unless absolutely necessary
- Use proper generic types

```typescript
// Good
interface Customer {
  id: string
  name: string
  email?: string
  companyId: string
}

// Bad
const customer: any = { ... }
```

### React Components
- Use functional components with hooks
- Implement proper error boundaries
- Use TypeScript for props
- Follow naming conventions

```typescript
// Good
interface CustomerCardProps {
  customer: Customer
  onEdit: (id: string) => void
}

export function CustomerCard({ customer, onEdit }: CustomerCardProps) {
  const company = useCurrentCompany()
  // Component logic
}
```

### API Routes
- Always use `withApiMiddleware`
- Implement proper validation
- Return consistent response format
- Handle errors gracefully

```typescript
// Good
export const POST = withApiMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    const { companyId, validatedData } = context
    const db = getTenantDb(companyId)
    
    const customer = await db.customer.create({
      data: validatedData
    })
    
    return successResponse(customer, 'Customer created')
  },
  {
    requireAuth: true,
    requireCompany: true,
    validateSchema: createCustomerSchema,
    rateLimit: true
  }
)
```

### Database Operations
- Never bypass tenant isolation
- Use proper error handling
- Implement soft deletes
- Add audit fields

```typescript
// Good - Automatic tenant scoping
const customers = await db.customer.findMany({
  where: { deletedAt: null }
})

// Bad - Manual tenant handling
const customers = await db.customer.findMany({
  where: { companyId: getCurrentCompanyId() }
})
```

## 🎨 UI/UX Guidelines

### Design System
- Use existing UI components from `/components/ui`
- Follow Tailwind CSS conventions
- Maintain consistent spacing and typography
- Ensure responsive design

### Accessibility
- Use semantic HTML elements
- Implement proper ARIA labels
- Ensure keyboard navigation
- Test with screen readers

### Performance
- Lazy load components when appropriate
- Optimize images and assets
- Use React.memo for expensive components
- Implement proper loading states

## 📚 Documentation

### Code Documentation
- Document complex business logic
- Add JSDoc comments for public APIs
- Include usage examples
- Explain multi-tenant considerations

```typescript
/**
 * Creates a new customer for the current company
 * 
 * @param customerData - Customer information
 * @returns Promise<Customer> - Created customer with company context
 * 
 * @example
 * ```typescript
 * const customer = await createCustomer({
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * })
 * ```
 */
export async function createCustomer(customerData: CreateCustomerData): Promise<Customer> {
  // Implementation
}
```

### API Documentation
- Update `/docs/API.md` for new endpoints
- Include request/response examples
- Document error cases
- Explain authentication requirements

### Feature Documentation
- Add feature overview to README
- Create detailed guides for complex features
- Include migration guides for breaking changes
- Update customization documentation

## 🔍 Code Review Process

### Before Submitting PR
- [ ] All tests pass
- [ ] Code follows style guidelines
- [ ] Multi-tenant isolation verified
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Performance impact considered

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Multi-tenant isolation tested
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or properly documented)
```

### Review Criteria
Reviewers will check for:
- Multi-tenant isolation compliance
- Security best practices
- Performance implications
- Code quality and maintainability
- Test coverage
- Documentation completeness

## 🚀 Release Process

### Version Numbering
We follow semantic versioning (SemVer):
- `MAJOR.MINOR.PATCH`
- Major: Breaking changes
- Minor: New features (backward compatible)
- Patch: Bug fixes

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Migration guides created (if needed)
- [ ] Performance benchmarks run
- [ ] Security review completed
- [ ] Changelog updated

## 🐛 Bug Reports

### Before Reporting
- Check existing issues
- Verify it's not a configuration issue
- Test with latest version
- Gather reproduction steps

### Bug Report Template
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Node.js version: [e.g. 18.17.0]
- Database: [e.g. PostgreSQL 15]

## Additional Context
Screenshots, logs, or other relevant information
```

## 💡 Feature Requests

### Before Requesting
- Check if feature already exists
- Search existing feature requests
- Consider if it fits the project scope
- Think about multi-tenant implications

### Feature Request Template
```markdown
## Feature Description
Clear description of the proposed feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this feature work?

## Multi-Tenant Considerations
How does this feature work with multiple tenants?

## Alternatives Considered
Other approaches you've considered

## Additional Context
Any other relevant information
```

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain professional communication

### Getting Help
- Check documentation first
- Search existing issues
- Ask questions in discussions
- Join our Discord community

### Recognition
Contributors will be recognized in:
- README contributors section
- Release notes
- Project documentation
- Community highlights

## 📋 Checklist for New Contributors

- [ ] Read this contributing guide
- [ ] Set up development environment
- [ ] Run tests successfully
- [ ] Understand multi-tenant architecture
- [ ] Review existing code patterns
- [ ] Join community discussions
- [ ] Pick a good first issue

## 🎯 Good First Issues

New contributors should look for issues labeled:
- `good first issue` - Simple, well-defined tasks
- `documentation` - Documentation improvements
- `bug` - Small bug fixes
- `enhancement` - Minor feature additions

Thank you for contributing to this project! Your efforts help make this boilerplate better for everyone building multi-tenant SaaS applications.
