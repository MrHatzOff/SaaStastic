# SaaStastic Windsurf Development Rules

## 🚨 **CRITICAL SECURITY RULES (NON-NEGOTIABLE)**

### Rule 1: Tenant Isolation
**EVERY database query MUST include companyId scoping**

```typescript
// ❌ NEVER DO THIS - Missing tenant scoping
const customers = await db.customer.findMany();

// ✅ ALWAYS DO THIS - Proper tenant scoping
const customers = await db.customer.findMany({
  where: { companyId: context.companyId }
});
```

### Rule 2: No Dev Bypasses
**ALL authentication MUST go through Clerk - NO shortcuts**

```typescript
// ❌ NEVER DO THIS - Bypassing auth
const userId = req.headers.get('x-user-id'); // Dangerous!

// ✅ ALWAYS DO THIS - Proper auth middleware
export const POST = withApiMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    // context.userId and context.companyId are validated by Clerk
  }
);
```

### Rule 3: Input Validation
**ALL inputs MUST be validated with Zod schemas**

```typescript
// ❌ NEVER DO THIS - No validation
const body = await req.json();
const result = await db.customer.create({ data: body });

// ✅ ALWAYS DO THIS - Zod validation
const data = createCustomerSchema.parse(await req.json());
const result = await db.customer.create({ data });
```

## 🏗️ **STANDARD PATTERNS (COPY-PASTE READY)**

### API Route Pattern
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withApiMiddleware, type ApiContext } from '@/lib/shared/api-middleware';
import { db } from '@/core/shared/db/client';
import { createSchema, updateSchema } from './schemas';

/**
 * GET /api/resource - List resources for current company
 */
export const GET = withApiMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    try {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      
      const [items, total] = await Promise.all([
        db.resource.findMany({
          where: { 
            companyId: context.companyId,
            deletedAt: null 
          },
          take: limit,
          skip: (page - 1) * limit,
          orderBy: { createdAt: 'desc' }
        }),
        db.resource.count({ 
          where: { 
            companyId: context.companyId,
            deletedAt: null 
          }
        })
      ]);

      return NextResponse.json({
        success: true,
        data: items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Resource GET error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch resources'
      }, { status: 500 });
    }
  }
);

/**
 * POST /api/resource - Create new resource
 */
export const POST = withApiMiddleware(
  async (req: NextRequest, context: ApiContext) => {
    try {
      const body = await req.json();
      const data = createSchema.parse(body);

      const resource = await db.resource.create({
        data: {
          ...data,
          companyId: context.companyId,
          createdBy: context.userId,
          updatedBy: context.userId
        }
      });

      // Log the action for audit
      await db.eventLog.create({
        data: {
          action: 'resource.created',
          userId: context.userId,
          companyId: context.companyId,
          metadata: {
            resourceId: resource.id,
            resourceName: resource.name
          }
        }
      });

      return NextResponse.json({
        success: true,
        data: resource,
        message: 'Resource created successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          success: false,
          error: 'Validation failed',
          details: error.errors
        }, { status: 400 });
      }

      console.error('Resource POST error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to create resource'
      }, { status: 500 });
    }
  }
);
```

### React Component Pattern
```typescript
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/ui/card';
import { LoadingSpinner } from '@/components/shared/ui/loading-spinner';
import { ErrorMessage } from '@/components/shared/ui/error-message';
import { useCurrentCompany } from '@/core/shared';

interface ResourceListProps {
  className?: string;
}

export function ResourceList({ className }: ResourceListProps) {
  const { company } = useCurrentCompany();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  // Data fetching with proper error handling
  const { 
    data, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['resources', company.id, page],
    queryFn: async () => {
      const response = await fetch(`/api/resources?page=${page}&companyId=${company.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }
      return response.json();
    },
    enabled: !!company.id
  });

  // Mutation for actions
  const deleteMutation = useMutation({
    mutationFn: async (resourceId: string) => {
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete resource');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources', company.id] });
    }
  });

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <ErrorMessage 
            error={error instanceof Error ? error.message : 'An error occurred'} 
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Resources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data?.data?.map((resource: any) => (
            <div key={resource.id} className="flex items-center justify-between p-4 border rounded">
              <div>
                <h3 className="font-medium">{resource.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Created {new Date(resource.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteMutation.mutate(resource.id)}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Form Component Pattern
```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/shared/ui/button';
import { Input } from '@/components/shared/ui/input';
import { Label } from '@/components/shared/ui/label';
import { useCurrentCompany } from '@/core/shared';

// Zod schema for validation
const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address').optional(),
  description: z.string().max(500, 'Description too long').optional()
});

type FormData = z.infer<typeof formSchema>;

interface ResourceFormProps {
  onSuccess?: (resource: any) => void;
  onCancel?: () => void;
}

export function ResourceForm({ onSuccess, onCancel }: ResourceFormProps) {
  const { company } = useCurrentCompany();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create resource');
      }

      reset();
      onSuccess?.(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Enter resource name"
        />
        {errors.name && (
          <p className="text-red-600 text-sm">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="Enter email address"
        />
        {errors.email && (
          <p className="text-red-600 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Resource'}
        </Button>
      </div>
    </form>
  );
}
```

## 🔧 **UTILITY PATTERNS**

### Error Handling Pattern
```typescript
// Standard error handling for API routes
const handleApiError = (error: unknown) => {
  if (error instanceof z.ZodError) {
    return NextResponse.json({
      success: false,
      error: 'Validation failed',
      details: error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }))
    }, { status: 400 });
  }

  if (error instanceof Error) {
    console.error('API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }

  console.error('Unknown API Error:', error);
  return NextResponse.json({
    success: false,
    error: 'Internal server error'
  }, { status: 500 });
};
```

### Audit Logging Pattern
```typescript
// Standard audit logging for sensitive actions
const logAction = async (
  action: string,
  context: ApiContext,
  metadata: Record<string, any> = {}
) => {
  await db.eventLog.create({
    data: {
      action,
      userId: context.userId,
      companyId: context.companyId,
      metadata,
      timestamp: new Date(),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent
    }
  });
};

// Usage in API routes
await logAction('customer.created', context, {
  customerId: customer.id,
  customerEmail: customer.email
});
```

## 📋 **DEVELOPMENT CHECKLIST**

### Before Creating Any Component
- [ ] Does it need company context? Use `useCurrentCompany()`
- [ ] Does it handle loading states? Include `<LoadingSpinner />`
- [ ] Does it handle error states? Include `<ErrorMessage />`
- [ ] Are all props properly typed with TypeScript?
- [ ] Does it follow accessibility guidelines?

### Before Creating Any API Route
- [ ] Uses `withApiMiddleware` for authentication?
- [ ] Includes proper Zod validation?
- [ ] Scopes all queries with `companyId`?
- [ ] Includes audit logging for sensitive actions?
- [ ] Has comprehensive error handling?

### Before Committing Code
- [ ] No `console.log` statements in production code?
- [ ] No `any` types in TypeScript?
- [ ] All imports are used?
- [ ] Follows established naming conventions?
- [ ] Includes proper JSDoc comments?

## 🚨 **COMMON MISTAKES TO AVOID**

### Database Queries
```typescript
// ❌ Missing tenant scoping
const customers = await db.customer.findMany();

// ❌ Missing soft delete filtering
const customers = await db.customer.findMany({
  where: { companyId }
});

// ✅ Correct pattern
const customers = await db.customer.findMany({
  where: { 
    companyId: context.companyId,
    deletedAt: null 
  }
});
```

### Error Handling
```typescript
// ❌ Generic error without context
catch (error) {
  return NextResponse.json({ error: 'Error occurred' });
}

// ✅ Proper error handling with logging
catch (error: unknown) {
  console.error('Specific operation error:', error);
  const message = error instanceof Error ? error.message : 'Unknown error';
  return NextResponse.json({
    success: false,
    error: 'Failed to perform operation'
  }, { status: 500 });
}
```

### Component State
```typescript
// ❌ No loading/error states
function Component() {
  const { data } = useQuery({ queryKey: ['data'], queryFn: fetchData });
  return <div>{data?.map(item => <div key={item.id}>{item.name}</div>)}</div>;
}

// ✅ Proper state handling
function Component() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData
  });
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error.message} />;
  
  return (
    <div>
      {data?.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

---

*These rules ensure consistent, secure, and maintainable code across the SaaStastic codebase. Always follow these patterns for new development.*
