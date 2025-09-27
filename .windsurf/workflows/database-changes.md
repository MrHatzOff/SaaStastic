---
name: database-changes
description: Guidelines for making database schema changes
priority: high
trigger: manual
---

# 🗃 Database Change Guide

## 📝 Prisma Schema Pattern

```prisma
model YourModel {
  // Required fields
  id          String   @id @default(cuid())
  companyId   String   @map("company_id")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at") // Soft delete
  createdBy   String?  @map("created_by")
  updatedBy   String?  @map("updated_by")
  
  // Your fields here
  name        String
  
  // Relations
  company     Company  @relation(fields: [companyId], references: [id])
  
  // Indexes
  @@index([companyId])
  
  // Map to database table
  @@map("your_model")
}
```

## 🛠 Making Changes

### 1. Create a Migration
```bash
# Create a new migration
npx prisma migrate dev --name add_your_feature

# Apply pending migrations
npx prisma migrate deploy
```

### 2. Update Prisma Client
```bash
npx prisma generate
```

## 📌 Requirements

### 1. Required Fields
- `id`: Primary key (cuid)
- `companyId`: Tenant isolation
- `createdAt`: Record creation timestamp
- `updatedAt`: Last update timestamp
- `deletedAt`: Soft delete (nullable)
- `createdBy`: User who created
- `updatedBy`: User who last updated

### 2. Indexing
- Always index `companyId`
- Add indexes for frequently queried fields
- Consider composite indexes for common query patterns

### 3. Data Validation
- Use `@db.VarChar(255)` for strings with known max length
- Set appropriate `@default` values
- Use `@map` for database column names

## 🔄 Data Migrations

### 1. Create Migration File
```typescript
// prisma/seed/your-migration.ts
export async function migrateData(prisma: PrismaClient) {
  // Your data migration logic here
}
```

### 2. Run in Production
```typescript
// scripts/run-migration.ts
import { migrateData } from '../prisma/seed/your-migration';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await migrateData(prisma);
  console.log('Migration completed');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

## 🧪 Testing Changes

1. **Test Locally**
   ```bash
   npx prisma migrate dev --name test_migration
   npx prisma studio
   ```

2. **Verify in CI**
   ```yaml
   # .github/workflows/test.yml
   - name: Test Migrations
     run: npx prisma migrate deploy && npx prisma db seed
   ```

## 📚 Related Files
- `prisma/schema.prisma` - Main schema file
- `prisma/seed/` - Data migrations
- `scripts/run-migration.ts` - Migration runner

## 🔍 Common Issues
- Forgetting to add `companyId` to new models
- Missing indexes causing slow queries
- Not handling soft deletes in queries
- Forgetting to update related API endpoints
