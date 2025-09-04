---
activation: context
priority: medium
description: "Performance, testing, and quality standards activated when working on optimization or testing"
triggers: ["test", "spec", "performance", "benchmark", "optimize", "*.test.ts", "*.spec.ts", "playwright", "vitest"]
---

# Quality & Performance Rules

## Performance Standards

### Core Web Vitals Requirements
- LCP < 2.5s for all pages
- FID < 100ms for all interactions
- CLS < 0.1 for all page loads

### Database Performance
- All queries must be optimized with proper indexes
- Use pagination for large data sets (limit 50 items per page)
- Implement query result caching where appropriate
- Monitor query execution time in development

### Performance Anti-Patterns (Prohibited)
- Do not fetch data in components without proper loading states
- Do not create unnecessary re-renders with improper dependencies
- Do not use blocking operations in the main thread
- Do not load large datasets without virtualization

## Testing Requirements

### Unit Testing Standards
- All utility functions must have unit tests
- Database operations must have integration tests
- Use factories for test data generation
- Maintain >80% code coverage for critical paths

### Integration Testing
```typescript
// Example test pattern
describe('User API', () => {
  it('should create user with proper tenant scoping', async () => {
    const company = await createTestCompany()
    const userData = { name: 'Test User', email: 'test@example.com' }
    
    const result = await createUser(userData, company.id)
    
    expect(result.companyId).toBe(company.id)
  })
})
```

### E2E Testing Requirements
- Critical user flows must have E2E tests
- Multi-tenant isolation must be tested
- Authentication flows must be tested
- Test both development and production auth modes

### Test Organization
```
/tests/
  /unit/           # Vitest unit tests
  /integration/    # API integration tests
  /e2e/           # Playwright E2E tests
  /fixtures/      # Test data factories
```

## Code Quality Standards

### Development Tools Requirements
- **Testing**: Playwright for E2E, Vitest for unit tests
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Error Tracking**: Sentry for production error monitoring
- **Performance**: Bundle analyzer and Core Web Vitals monitoring

### Quality Gates
- All PRs must pass automated tests
- Code coverage must not decrease
- Bundle size increases require justification
- Performance regressions block deployment

## Monitoring & Observability

### Error Tracking
- All API routes must include proper error logging
- Client-side errors must be captured and reported
- Database errors must include query context
- Rate limiting violations must be logged

### Performance Monitoring
- Track Core Web Vitals in production
- Monitor API response times
- Alert on database query performance degradation
- Track user interaction metrics
