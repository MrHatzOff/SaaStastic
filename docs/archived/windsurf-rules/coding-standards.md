---
activation: manual
priority: medium
description: "Coding standards and conventions for code review and active development"
---

# Coding Standards Rules

## Naming Conventions

### File and Component Naming
- **Components**: PascalCase (`UserProfile.tsx`)
- **Functions/Variables**: camelCase (`getUserData`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_BASE_URL`)
- **Files**: kebab-case for non-components (`user-utils.ts`)
- **Database**: snake_case for columns, PascalCase for models

## Code Organization

### Structure Requirements
- Group by feature/domain, not by technical layer
- Use barrel exports (`index.ts`) for clean imports
- Implement proper error boundaries for each major feature
- All API routes must include input validation and error handling
- Use TypeScript strict mode with no `any` types

## API Design Patterns

### Server Actions Pattern
```typescript
// Use this pattern for all server actions
export async function createUser(data: CreateUserSchema) {
  const validatedData = createUserSchema.parse(data);
  const { userId } = auth();
  // Implementation with proper error handling
}
```

### API Routes Pattern
```typescript
// Use this pattern for all API routes
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    // Implementation with tenant scoping
  } catch (error) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
}
```

## TypeScript Standards

### Type Safety Requirements
- Use TypeScript strict mode with no `any` types
- All function parameters must be properly typed
- Use proper generics for reusable components
- Implement proper error types for API responses

### Import Organization
```typescript
// 1. External libraries
import React from 'react'
import { NextRequest } from 'next/server'

// 2. Internal utilities and types
import { db } from '@/core/db/client'
import type { User } from '@/types/user'

// 3. Relative imports
import { UserCard } from './UserCard'
```

## Component Standards

### React Component Structure
```typescript
interface ComponentProps {
  // Props with proper types
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks first
  const [state, setState] = useState()
  
  // Event handlers
  const handleClick = () => {}
  
  // Render
  return <div>...</div>
}
```

### Error Handling
- All components must handle loading and error states
- Use proper error boundaries for feature isolation
- Implement graceful fallbacks for failed operations
