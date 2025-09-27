---
name: api-development
description: Guidelines for developing API endpoints in SaaStastic
priority: medium
trigger: manual
---

# 🚀 API Development Guide

## 📝 Required Pattern

```typescript
import { withApiMiddleware } from '@/lib/shared/api-middleware';
import { z } from 'zod';

export const POST = withApiMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    // 1. Define validation schema
    const schema = z.object({
      name: z.string().min(2),
      // ... other fields
    });

    // 2. Validate input
    const data = schema.parse(await req.json());
    
    // 3. Execute with tenant isolation
    const result = await db.yourModel.create({
      data: { 
        ...data,
        companyId: context.companyId, // Auto-added by middleware
        createdBy: context.userId,    // Auto-added by middleware
      }
    });
    
    // 4. Return response
    return NextResponse.json({ success: true, data: result });
  }
);
```

## 📌 Key Requirements

### 1. Middleware
- Always use `withApiMiddleware`
- Access user context via `context` parameter
- No direct database access - use Prisma client

### 2. Validation
- Use Zod for all input validation
- Define schemas at the top of the file
- Return 400 for invalid inputs

### 3. Error Handling
```typescript
try {
  // Your code here
} catch (error) {
  console.error('API Error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

### 4. Response Format
```typescript
// Success
return NextResponse.json({ 
  success: true, 
  data: yourData 
});

// Error
return NextResponse.json(
  { 
    success: false, 
    error: 'Error message',
    code: 'ERROR_CODE' 
  },
  { status: 400 }
);
```

## 🧪 Testing

1. **Unit Tests**
   - Test validation logic
   - Test business logic
   - Mock database calls

2. **Integration Tests**
   - Test full request/response cycle
   - Verify database changes
   - Test error cases

## 📚 Related Files
- `lib/shared/api-middleware.ts` - Middleware implementation
- `lib/shared/validation.ts` - Shared validation schemas
- `tests/api/` - API test examples

## 🔍 Common Pitfalls
- Forgetting tenant isolation
- Missing input validation
- Not handling errors properly
- Exposing sensitive data in responses
