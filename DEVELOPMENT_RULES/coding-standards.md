# Coding Standards Rules

**Purpose**: Coding standards and conventions for code review and active development in SaaStastic.

**Priority**: MEDIUM  
**Activation**: Manual (for code review and active development)

---

## Naming Conventions

### File and Component Naming
- **Components**: PascalCase (`UserProfile.tsx`, `CustomerCard.tsx`)
- **Functions/Variables**: camelCase (`getUserData`, `isAuthenticated`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRY_COUNT`)
- **Files**: kebab-case for non-components (`user-utils.ts`, `api-helpers.ts`)
- **Database**: snake_case for columns, PascalCase for models

### Examples
```typescript
// Component
export function UserProfileCard() { }

// Function
export function getUserById(id: string) { }

// Constant
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// File names
// user-service.ts
// customer-utils.ts
// api-middleware.ts
```

### Why These Conventions?
- **PascalCase for components**: React convention, easy to identify components
- **camelCase for functions**: JavaScript standard, readable
- **SCREAMING_SNAKE_CASE for constants**: Visually distinct, indicates immutability
- **kebab-case for files**: URL-friendly, consistent with web standards

---

## Code Organization

### Structure Requirements
- **Group by feature/domain, not by technical layer**
- Use barrel exports (`index.ts`) for clean imports
- Implement proper error boundaries for each major feature
- All API routes must include input validation and error handling
- Use TypeScript strict mode with no `any` types

### Feature Module Structure
```
src/features/custom/inventory/
├── components/
│   ├── InventoryList.tsx
│   ├── InventoryForm.tsx
│   └── InventoryCard.tsx
├── hooks/
│   ├── use-inventory.ts
│   └── use-inventory-form.ts
├── services/
│   ├── inventory-service.ts
│   └── inventory-validation.ts
├── types/
│   └── inventory.types.ts
├── lib/
│   └── inventory-utils.ts
└── index.ts  // Barrel export
```

### Import Organization
```typescript
// 1. External libraries (alphabetically)
import React from 'react'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// 2. Internal absolute imports (alphabetically)
import { db } from '@/core/db/client'
import { PERMISSIONS } from '@/shared/lib/permissions'
import type { User } from '@/types/user'

// 3. Relative imports (alphabetically)
import { UserCard } from './UserCard'
import { formatDate } from '../utils'

// 4. Styles (if any)
import styles from './component.module.css'
```

---

## API Design Patterns

### Server Actions Pattern
```typescript
// src/lib/actions/custom/inventory-actions.ts
'use server'

import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { db } from '@/core/db/client'

const createInventorySchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().positive(),
})

export async function createInventory(data: z.infer<typeof createInventorySchema>) {
  // 1. Authenticate
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  
  // 2. Get company context
  const userCompany = await db.userCompany.findFirst({
    where: { userId },
  })
  if (!userCompany) {
    throw new Error('No company context')
  }
  
  // 3. Validate input
  const validatedData = createInventorySchema.parse(data)
  
  // 4. Create record with tenant scoping
  const inventory = await db.inventory.create({
    data: {
      ...validatedData,
      companyId: userCompany.companyId,
      createdBy: userId,
    },
  })
  
  return { success: true, data: inventory }
}
```

### API Routes Pattern
```typescript
// src/app/api/custom/inventory/route.ts

import { withPermissions, PERMISSIONS } from '@/shared/lib'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/core/db/client'

const createSchema = z.object({
  name: z.string().min(1).max(255),
  quantity: z.number().int().min(0),
})

export const POST = withPermissions(
  async (req: NextRequest, context) => {
    try {
      // 1. Parse and validate input
      const body = await req.json()
      const data = createSchema.parse(body)
      
      // 2. Database operation with tenant scoping
      const inventory = await db.inventory.create({
        data: {
          ...data,
          companyId: context.companyId,
          createdBy: context.userId,
        },
      })
      
      // 3. Return success
      return NextResponse.json({ 
        success: true, 
        data: inventory 
      })
      
    } catch (error) {
      // 4. Handle errors appropriately
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid input', details: error.errors },
          { status: 400 }
        )
      }
      
      console.error('Error creating inventory:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  },
  [PERMISSIONS.CUSTOMER_CREATE] // Required permission
)
```

---

## TypeScript Standards

### Type Safety Requirements
- **Use TypeScript strict mode with no `any` types**
- All function parameters must be properly typed
- Use proper generics for reusable components
- Implement proper error types for API responses
- Prefer `unknown` over `any` when type is truly unknown

### Type Definition Patterns
```typescript
// Define types separately
interface User {
  id: string
  email: string
  name: string | null
}

// Use type for unions/intersections
type UserWithCompany = User & {
  companyId: string
  companyName: string
}

// Use generics for reusable types
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Infer types from Zod schemas
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  name: z.string(),
})

type UserInput = z.infer<typeof userSchema>
```

### Avoid `any` Type
```typescript
// ❌ BAD
function processData(data: any) {
  return data.value
}

// ✅ GOOD - Use generics
function processData<T extends { value: string }>(data: T) {
  return data.value
}

// ✅ GOOD - Use unknown for truly unknown types
function handleError(error: unknown) {
  if (error instanceof Error) {
    console.error(error.message)
  }
}
```

---

## Component Standards

### React Component Structure
```typescript
// src/features/custom/components/InventoryCard.tsx

import { useState } from 'react'
import { Card } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'

interface InventoryCardProps {
  id: string
  name: string
  quantity: number
  onUpdate?: (id: string, quantity: number) => Promise<void>
}

export function InventoryCard({ 
  id, 
  name, 
  quantity, 
  onUpdate 
}: InventoryCardProps) {
  // 1. Hooks first (useState, useEffect, custom hooks)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 2. Derived state
  const isLowStock = quantity < 10
  
  // 3. Event handlers
  const handleUpdate = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await onUpdate?.(id, quantity + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setLoading(false)
    }
  }
  
  // 4. Render
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className={isLowStock ? 'text-red-500' : 'text-gray-600'}>
        Quantity: {quantity}
      </p>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button onClick={handleUpdate} disabled={loading}>
        {loading ? 'Updating...' : 'Add Stock'}
      </Button>
    </Card>
  )
}
```

### Component Best Practices
- **Keep components small and focused** (< 200 lines)
- **Extract complex logic to hooks**
- **Use proper TypeScript interfaces for props**
- **Handle loading and error states**
- **Use semantic HTML elements**
- **Add accessibility attributes**

---

## Error Handling

### Error Handling Patterns
```typescript
// API Route Error Handling
try {
  const data = await riskyOperation()
  return NextResponse.json({ success: true, data })
} catch (error) {
  // Specific error types first
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    )
  }
  
  if (error instanceof PermissionError) {
    return NextResponse.json(
      { error: 'Permission denied' },
      { status: 403 }
    )
  }
  
  // Generic error last
  console.error('Unexpected error:', error)
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

### Component Error Handling
```typescript
// Component with error boundary
import { ErrorBoundary } from '@/shared/components/error-boundary'

export function FeaturePage() {
  return (
    <ErrorBoundary
      fallback={<div>Something went wrong. Please try again.</div>}
    >
      <FeatureContent />
    </ErrorBoundary>
  )
}
```

### Error Types
```typescript
// Define custom error classes
export class PermissionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PermissionError'
  }
}

export class TenantIsolationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TenantIsolationError'
  }
}
```

---

## Testing Standards

### Unit Test Structure
```typescript
// tests/unit/services/inventory-service.test.ts

import { describe, it, expect, beforeEach } from 'vitest'
import { inventoryService } from '@/features/custom/services/inventory-service'

describe('InventoryService', () => {
  beforeEach(() => {
    // Setup
  })
  
  it('should create inventory with tenant scoping', async () => {
    const result = await inventoryService.create({
      name: 'Widget',
      quantity: 100,
      companyId: 'test-company',
    })
    
    expect(result.companyId).toBe('test-company')
    expect(result.name).toBe('Widget')
  })
  
  it('should throw error for negative quantity', async () => {
    await expect(
      inventoryService.create({
        name: 'Widget',
        quantity: -1,
        companyId: 'test-company',
      })
    ).rejects.toThrow('Quantity must be positive')
  })
})
```

### Test Naming Convention
- Use descriptive test names: `should [expected behavior] when [condition]`
- Group related tests with `describe` blocks
- Test edge cases and error conditions
- Mock external dependencies

---

## Performance Guidelines

### Database Query Optimization
```typescript
// ❌ BAD - N+1 query problem
const users = await db.user.findMany()
for (const user of users) {
  const company = await db.company.findUnique({
    where: { id: user.companyId }
  })
}

// ✅ GOOD - Use include
const users = await db.user.findMany({
  include: {
    company: true
  }
})
```

### Component Performance
```typescript
import { memo, useMemo, useCallback } from 'react'

// Memoize expensive components
export const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  // Component implementation
})

// Memoize expensive calculations
function MyComponent({ items }) {
  const sortedItems = useMemo(
    () => items.sort((a, b) => a.value - b.value),
    [items]
  )
  
  // Memoize callbacks
  const handleClick = useCallback(() => {
    // Handle click
  }, [])
  
  return <div>...</div>
}
```

---

## Code Documentation

### JSDoc Comments
```typescript
/**
 * Creates a new inventory item with tenant scoping
 * 
 * @param data - Inventory item data
 * @param data.name - Name of the inventory item
 * @param data.quantity - Initial quantity
 * @param companyId - Company ID for tenant isolation
 * @returns Created inventory item with ID
 * @throws {ValidationError} If data is invalid
 * @throws {PermissionError} If user lacks permissions
 */
export async function createInventory(
  data: InventoryInput,
  companyId: string
): Promise<Inventory> {
  // Implementation
}
```

### Inline Comments
```typescript
// Use inline comments for complex logic
function calculateDiscount(price: number, customerTier: string) {
  // Apply tiered discount based on customer level
  // Bronze: 5%, Silver: 10%, Gold: 15%, Platinum: 20%
  const discountRate = TIER_DISCOUNTS[customerTier] || 0
  
  return price * (1 - discountRate)
}
```

---

## Git Commit Standards

### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

### Commit Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `test`: Test additions or fixes
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples
```
feat(inventory): add low stock alerts

Implemented automatic alerts when inventory falls below threshold.
Includes email notifications and dashboard warnings.

Closes #123
```

```
fix(auth): correct permission check in API middleware

The permission check was not properly scoping to company context.
Fixed by adding companyId validation.
```

---

## Code Review Checklist

Before submitting code for review:

- [ ] TypeScript compilation successful
- [ ] All tests passing
- [ ] Linting passed (no warnings)
- [ ] No `console.log` statements (use proper logging)
- [ ] No `any` types
- [ ] Multi-tenant isolation enforced
- [ ] Permission checks in place
- [ ] Input validation implemented
- [ ] Error handling complete
- [ ] Documentation updated
- [ ] Commit messages follow convention

---

## Anti-Patterns to Avoid

### Don't Do This
```typescript
// ❌ Using any
function process(data: any) { }

// ❌ Not handling errors
async function fetchData() {
  return await fetch('/api/data')
}

// ❌ Missing tenant scoping
const users = await db.user.findMany()

// ❌ Hardcoded values
if (user.role === 'admin') { }

// ❌ Mutable state
let globalCounter = 0
```

### Do This Instead
```typescript
// ✅ Proper typing
function process<T>(data: T) { }

// ✅ Error handling
async function fetchData() {
  try {
    const res = await fetch('/api/data')
    if (!res.ok) throw new Error('Fetch failed')
    return await res.json()
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}

// ✅ Tenant scoping
const users = await db.user.findMany({
  where: { companyId }
})

// ✅ Use constants
if (user.role === ROLES.ADMIN) { }

// ✅ Immutable state
const [counter, setCounter] = useState(0)
```

---

**Following these standards ensures consistent, maintainable, high-quality code across the SaaStastic codebase.**

**Last Updated**: October 14, 2025  
**Priority**: MEDIUM  
**Enforcement**: Manual (code review)
