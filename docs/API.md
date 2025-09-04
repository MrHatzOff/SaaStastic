# API Documentation

This document provides comprehensive API documentation for the SaaS boilerplate, including authentication, endpoints, and usage examples.

## 🔐 Authentication

All API endpoints (except public routes) require authentication via Clerk. The API uses session-based authentication with company context.

### Authentication Headers

```bash
# Requests are authenticated via Clerk session cookies
# No additional headers required when using the same domain
```

### Company Context

Most endpoints require a company context. Users must have selected a company before accessing tenant-specific endpoints.

```typescript
// Company context is automatically handled by middleware
// Users without company context are redirected to /select-company
```

## 🛡️ API Middleware

All API routes use standardized middleware for security and validation:

```typescript
export const GET = withApiMiddleware(handler, {
  requireAuth: true,        // Requires user authentication
  requireCompany: true,     // Requires company context (tenant isolation)
  allowedMethods: ['GET'],  // Allowed HTTP methods
  rateLimit: true,         // Enable rate limiting
  validateSchema: schema   // Request body validation schema
})
```

## 📊 Response Format

All API responses follow a consistent format:

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "path": "email",
      "message": "Valid email is required"
    }
  ]
}
```

## 🏢 Customer Management API

### GET /api/customers

List all customers for the current company.

**Authentication**: Required  
**Company Context**: Required  
**Rate Limited**: Yes

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "address": "123 Main St",
      "notes": "Important customer",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/customers

Create a new customer.

**Authentication**: Required  
**Company Context**: Required  
**Rate Limited**: Yes

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "notes": "Important customer"
}
```

**Validation Rules**:
- `name`: Required, minimum 1 character
- `email`: Optional, must be valid email format
- `phone`: Optional string
- `address`: Optional string
- `notes`: Optional string

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "cuid123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "notes": "Important customer",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "Customer created successfully"
}
```

### GET /api/customers/[id]

Get a specific customer by ID.

**Authentication**: Required  
**Company Context**: Required  
**Rate Limited**: Yes

**Parameters**:
- `id`: Customer ID (path parameter)

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "cuid123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "notes": "Important customer",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /api/customers/[id]

Update a customer.

**Authentication**: Required  
**Company Context**: Required  
**Rate Limited**: Yes

**Parameters**:
- `id`: Customer ID (path parameter)

**Request Body** (all fields optional):
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+0987654321",
  "address": "456 Oak Ave",
  "notes": "Updated notes"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "cuid123",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+0987654321",
    "address": "456 Oak Ave",
    "notes": "Updated notes",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-02T00:00:00Z"
  },
  "message": "Customer updated successfully"
}
```

### DELETE /api/customers/[id]

Soft delete a customer.

**Authentication**: Required  
**Company Context**: Required  
**Rate Limited**: Yes

**Parameters**:
- `id`: Customer ID (path parameter)

**Response**:
```json
{
  "success": true,
  "data": null,
  "message": "Customer deleted successfully"
}
```

## 🏢 Company Management API

### GET /api/companies

List companies for the current user.

**Authentication**: Required  
**Company Context**: Not required  
**Rate Limited**: Yes

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "company123",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "role": "OWNER"
    },
    {
      "id": "company456",
      "name": "Beta Inc",
      "slug": "beta-inc",
      "role": "ADMIN"
    }
  ]
}
```

### POST /api/companies

Create a new company.

**Authentication**: Required  
**Company Context**: Not required  
**Rate Limited**: Yes

**Request Body**:
```json
{
  "name": "My New Company",
  "slug": "my-new-company"
}
```

**Validation Rules**:
- `name`: Required, minimum 1 character
- `slug`: Required, must be unique, alphanumeric with hyphens

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "company789",
    "name": "My New Company",
    "slug": "my-new-company",
    "role": "OWNER"
  },
  "message": "Company created successfully"
}
```

## 🔍 Health Check API

### GET /api/health

Check API health status.

**Authentication**: Not required  
**Company Context**: Not required  
**Rate Limited**: No

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0"
  }
}
```

## 📝 Event Logging API

### POST /api/events

Log an application event.

**Authentication**: Required  
**Company Context**: Required  
**Rate Limited**: Yes

**Request Body**:
```json
{
  "action": "customer_created",
  "details": {
    "customerId": "cuid123",
    "customerName": "John Doe"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "event123",
    "action": "customer_created",
    "details": {
      "customerId": "cuid123",
      "customerName": "John Doe"
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

## ❌ Error Codes

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (company context required or insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Common Error Responses

#### Authentication Required
```json
{
  "success": false,
  "error": "Authentication required"
}
```

#### Company Context Required
```json
{
  "success": false,
  "error": "Company context required"
}
```

#### Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "path": "email",
      "message": "Valid email is required"
    }
  ]
}
```

#### Rate Limited
```json
{
  "success": false,
  "error": "Rate limit exceeded"
}
```

#### Resource Not Found
```json
{
  "success": false,
  "error": "Customer not found"
}
```

## 🚀 Usage Examples

### JavaScript/TypeScript

```typescript
// Fetch customers
const response = await fetch('/api/customers')
const { success, data, error } = await response.json()

if (success) {
  console.log('Customers:', data)
} else {
  console.error('Error:', error)
}

// Create customer
const newCustomer = {
  name: 'John Doe',
  email: 'john@example.com'
}

const response = await fetch('/api/customers', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(newCustomer)
})

const result = await response.json()
```

### React Hook Example

```typescript
import useSWR from 'swr'

function CustomerList() {
  const { data, error, isLoading } = useSWR('/api/customers')
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <ul>
      {data?.data?.map(customer => (
        <li key={customer.id}>{customer.name}</li>
      ))}
    </ul>
  )
}
```

### cURL Examples

```bash
# Get customers
curl -X GET "http://localhost:3000/api/customers" \
  -H "Cookie: __session=your-session-cookie"

# Create customer
curl -X POST "http://localhost:3000/api/customers" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=your-session-cookie" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'

# Update customer
curl -X PUT "http://localhost:3000/api/customers/cuid123" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=your-session-cookie" \
  -d '{
    "name": "Jane Doe"
  }'

# Delete customer
curl -X DELETE "http://localhost:3000/api/customers/cuid123" \
  -H "Cookie: __session=your-session-cookie"
```

## 🔒 Security Considerations

### Tenant Isolation
- All API endpoints automatically enforce tenant isolation
- Users can only access data belonging to their current company
- Cross-tenant data access is impossible through the API

### Rate Limiting
- API endpoints are rate limited to prevent abuse
- Limits are applied per IP address
- Rate limits can be configured via environment variables

### Input Validation
- All request bodies are validated using Zod schemas
- Invalid requests return detailed validation errors
- SQL injection and XSS attacks are prevented

### Error Handling
- Error messages don't leak sensitive information
- Stack traces are not exposed in production
- All errors are logged for monitoring

## 📊 Monitoring & Observability

### Logging
All API requests are logged with:
- Request method and path
- Response status code
- Response time
- User ID and company ID (if authenticated)
- Error details (if applicable)

### Metrics
Key metrics tracked:
- Request count per endpoint
- Response times
- Error rates
- Rate limit hits
- Tenant-specific usage

### Health Monitoring
- `/api/health` endpoint for uptime monitoring
- Database connectivity checks
- External service health checks

## 🚀 Extending the API

### Adding New Endpoints

1. **Create API Route**: Add new file in `/src/app/api/`
2. **Use Middleware**: Wrap handler with `withApiMiddleware`
3. **Define Schema**: Create Zod validation schema
4. **Add Tests**: Write unit and integration tests
5. **Update Documentation**: Add endpoint to this document

Example:
```typescript
// /src/app/api/products/route.ts
import { withApiMiddleware } from '@/lib/api-middleware'
import { z } from 'zod'

const createProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive()
})

export const POST = withApiMiddleware(
  async (req, context) => {
    const { companyId, validatedData } = context
    const db = getTenantDb(companyId)
    
    const product = await db.product.create({
      data: validatedData
    })
    
    return successResponse(product, 'Product created')
  },
  {
    requireAuth: true,
    requireCompany: true,
    validateSchema: createProductSchema,
    rateLimit: true
  }
)
```

### Custom Middleware

Add custom middleware for specific requirements:

```typescript
const withCustomValidation = (handler, options) => {
  return withApiMiddleware(
    async (req, context) => {
      // Custom validation logic
      if (!customCheck(context)) {
        throw new ApiError('Custom validation failed', 400)
      }
      
      return handler(req, context)
    },
    options
  )
}
```

This API documentation provides a complete reference for integrating with the SaaS boilerplate's backend services.
