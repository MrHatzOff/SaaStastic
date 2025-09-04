# Deployment Guide

This guide covers deploying your multi-tenant SaaS application to production environments.

## 🚀 Quick Deploy to Vercel

### Prerequisites
- GitHub repository with your code
- Vercel account
- PostgreSQL database (Neon, Supabase, or other provider)
- Clerk account for authentication

### 1. Database Setup

#### Option A: Neon (Recommended)
1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection strings:
   - `DATABASE_URL` (pooled connection)
   - `DIRECT_URL` (direct connection)

#### Option B: Supabase
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings > Database

#### Option C: Railway
1. Create account at [railway.app](https://railway.app)
2. Deploy PostgreSQL service
3. Copy connection variables

### 2. Clerk Authentication Setup

1. Create account at [clerk.dev](https://clerk.dev)
2. Create new application
3. Configure authentication methods
4. Copy API keys:
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

### 3. Deploy to Vercel

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the project

2. **Configure Environment Variables**
   ```bash
   # Database
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."
   
   # Authentication
   CLERK_SECRET_KEY="sk_live_..."
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
   
   # App Configuration
   NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
   NODE_ENV="production"
   ```

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Run database migrations (see below)

### 4. Database Migration

After deployment, run migrations:

```bash
# Using Vercel CLI
npx vercel env pull .env.local
npx prisma migrate deploy
npx prisma generate

# Or using the Vercel dashboard
# Add a build command: "npx prisma migrate deploy && next build"
```

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - DIRECT_URL=${DIRECT_URL}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=saastastic
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Deploy Commands

```bash
# Build and run
docker-compose up --build

# Run migrations
docker-compose exec app npx prisma migrate deploy

# View logs
docker-compose logs -f app
```

## ☁️ AWS Deployment

### Using AWS App Runner

1. **Create ECR Repository**
```bash
aws ecr create-repository --repository-name saastastic
```

2. **Build and Push Image**
```bash
# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t saastastic .

# Tag image
docker tag saastastic:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/saastastic:latest

# Push image
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/saastastic:latest
```

3. **Create App Runner Service**
```bash
aws apprunner create-service --cli-input-json file://apprunner-config.json
```

### App Runner Configuration

```json
{
  "ServiceName": "saastastic",
  "SourceConfiguration": {
    "ImageRepository": {
      "ImageIdentifier": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/saastastic:latest",
      "ImageConfiguration": {
        "Port": "3000",
        "RuntimeEnvironmentVariables": {
          "NODE_ENV": "production",
          "DATABASE_URL": "postgresql://...",
          "CLERK_SECRET_KEY": "sk_live_..."
        }
      },
      "ImageRepositoryType": "ECR"
    },
    "AutoDeploymentsEnabled": true
  },
  "InstanceConfiguration": {
    "Cpu": "0.25 vCPU",
    "Memory": "0.5 GB"
  }
}
```

## 🔧 Environment Configuration

### Production Environment Variables

```bash
# Required
DATABASE_URL="postgresql://user:password@host:port/database"
DIRECT_URL="postgresql://user:password@host:port/database"
CLERK_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Optional but Recommended
SENTRY_DSN="https://..."
NEXT_PUBLIC_SENTRY_DSN="https://..."
RATE_LIMIT_REDIS_URL="redis://..."

# Email (if using)
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"

# File Storage (if using)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"

# Feature Flags
ENABLE_ANALYTICS="true"
ENABLE_DEBUG_LOGGING="false"
```

### Security Configuration

```bash
# Generate secure secrets
NEXTAUTH_SECRET=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)

# Set secure headers
FORCE_HTTPS="true"
SECURE_COOKIES="true"
```

## 📊 Monitoring & Observability

### Sentry Error Tracking

1. **Setup Sentry**
```bash
npm install @sentry/nextjs
```

2. **Configure Sentry**
```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

3. **Add to Environment**
```bash
SENTRY_DSN="https://your-dsn@sentry.io/project-id"
NEXT_PUBLIC_SENTRY_DSN="https://your-dsn@sentry.io/project-id"
```

### Uptime Monitoring

#### Using Uptime Robot
1. Create account at [uptimerobot.com](https://uptimerobot.com)
2. Add HTTP(s) monitor for your domain
3. Set up alerts via email/SMS

#### Using Pingdom
1. Create account at [pingdom.com](https://pingdom.com)
2. Create uptime check
3. Configure alert contacts

### Performance Monitoring

#### Vercel Analytics
```bash
npm install @vercel/analytics
```

```javascript
// pages/_app.js
import { Analytics } from '@vercel/analytics/react'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  )
}
```

## 🔒 Security Checklist

### Pre-Deployment Security

- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] API keys have minimal permissions
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] CSRF protection implemented

### Post-Deployment Security

- [ ] Security scanning completed
- [ ] Penetration testing performed
- [ ] Monitoring alerts configured
- [ ] Backup strategy implemented
- [ ] Incident response plan created
- [ ] Access logs monitored
- [ ] Regular security updates scheduled

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### Database Migrations

```yaml
# .github/workflows/migrate.yml
name: Database Migration

on:
  workflow_dispatch:

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## 📈 Scaling Considerations

### Database Scaling

#### Read Replicas
```bash
# Configure read replica URL
DATABASE_READ_URL="postgresql://readonly-user:password@read-replica:5432/database"
```

#### Connection Pooling
```bash
# Use connection pooling
DATABASE_URL="postgresql://user:password@host:5432/database?pgbouncer=true"
```

### Application Scaling

#### Horizontal Scaling
- Use load balancers
- Implement session storage (Redis)
- Configure sticky sessions if needed

#### Vertical Scaling
- Monitor CPU and memory usage
- Upgrade instance sizes as needed
- Optimize database queries

### CDN Configuration

#### Vercel Edge Network
- Automatic global CDN
- Edge functions for dynamic content
- Image optimization

#### Cloudflare
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-domain.com'],
    loader: 'cloudflare',
    path: 'https://your-domain.com/cdn-cgi/image/',
  },
}
```

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run type-check
```

#### Database Connection Issues
```bash
# Test database connection
npx prisma db pull

# Check connection string format
# postgresql://user:password@host:port/database?sslmode=require
```

#### Environment Variable Issues
```bash
# Verify environment variables are set
echo $DATABASE_URL
echo $CLERK_SECRET_KEY

# Check for typos in variable names
# Ensure no trailing spaces or special characters
```

### Performance Issues

#### Slow Database Queries
```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_customers_company_id ON customers(company_id);
```

#### High Memory Usage
```bash
# Monitor memory usage
docker stats

# Optimize Node.js memory
NODE_OPTIONS="--max-old-space-size=1024"
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Security review completed
- [ ] Performance testing done
- [ ] Backup strategy in place

### Deployment
- [ ] Deploy to staging first
- [ ] Run database migrations
- [ ] Verify application starts
- [ ] Test critical user flows
- [ ] Check monitoring dashboards
- [ ] Verify SSL certificates

### Post-Deployment
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify all features working
- [ ] Test multi-tenant isolation
- [ ] Update documentation
- [ ] Notify stakeholders

---

## 🔐 Security Operations

### Environment Variable Rotation

#### API Keys Rotation Procedure
```bash
# 1. Generate new keys in respective services
# Clerk: Generate new keys in dashboard
# Database: Rotate credentials in Neon/Supabase
# Redis: Create new database in Upstash

# 2. Update environment variables
export CLERK_SECRET_KEY="sk_live_new_key_here"
export DATABASE_URL="postgresql://new-creds@..."

# 3. Test with new keys in staging
npm run test:e2e
npm run build

# 4. Deploy to production
# Vercel: Update environment variables in dashboard
# Other: Update deployment configuration

# 5. Verify application functionality
curl -I https://your-app.com/api/health

# 6. Revoke old keys (after 24h grace period)
# Clerk: Revoke old keys in dashboard
# Database: Disable old credentials
```

#### Automated Rotation (Recommended)
```yaml
# .github/workflows/rotate-secrets.yml
name: Rotate Secrets
on:
  schedule:
    - cron: '0 2 1 * *'  # Monthly on the 1st
  workflow_dispatch:

jobs:
  rotate:
    runs-on: ubuntu-latest
    steps:
      - name: Rotate Clerk Keys
        run: |
          # API call to Clerk to rotate keys
          curl -X POST https://api.clerk.dev/v1/keys/rotate \
            -H "Authorization: Bearer ${{ secrets.CLERK_API_KEY }}"
```

### Database Backup Strategy

#### Automated Daily Backups
```bash
# For Neon PostgreSQL
# Enable automated backups in Neon dashboard
# Retention: 7 days for daily, 30 days for weekly

# For Supabase
# Automatic backups included with paid plans
# Point-in-time recovery available
```

#### Manual Backup Procedure
```bash
# 1. Create backup
pg_dump "$DATABASE_URL" > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Compress backup
gzip backup_*.sql

# 3. Upload to secure storage
aws s3 cp backup_*.sql.gz s3://your-backup-bucket/

# 4. Verify backup integrity
gunzip -c backup_*.sql.gz | head -20
```

#### Backup Verification
```sql
-- Test backup restoration
CREATE DATABASE test_restore;
\connect test_restore
\i /path/to/backup.sql

-- Verify data integrity
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM "Company";
SELECT COUNT(*) FROM "Customer";
```

### Incident Response

#### Security Incident Procedure
1. **Detection**
   - Monitor alerts from Sentry, Vercel, database provider
   - Check application logs for suspicious activity
   - Review access logs for unauthorized attempts

2. **Containment**
   ```bash
   # Rotate all API keys immediately
   # Update environment variables
   # Redeploy application
   # Block suspicious IP addresses
   ```

3. **Investigation**
   ```bash
   # Check application logs
   npx vercel logs --follow
   
   # Query database for suspicious activity
   SELECT * FROM "EventLog" 
   WHERE created_at >= NOW() - INTERVAL '24 hours'
   ORDER BY created_at DESC;
   
   # Check rate limiting logs
   # Review Sentry error reports
   ```

4. **Recovery**
   - Restore from clean backup if needed
   - Update security patches
   - Implement additional security measures

5. **Post-Mortem**
   - Document incident details
   - Update security procedures
   - Train team on prevention

#### Application Downtime Procedure
```bash
# 1. Check application status
curl -f https://your-app.com/api/health || echo "App is down"

# 2. Check deployment status
npx vercel ls

# 3. Redeploy if needed
npx vercel --prod

# 4. Check database connectivity
psql "$DATABASE_URL" -c "SELECT 1;"

# 5. Monitor recovery
npx vercel logs --follow
```

## 📊 Monitoring & Alerting

### Application Monitoring

#### Health Check Endpoints
```typescript
// GET /api/health
export async function GET() {
  try {
    // Check database connectivity
    await db.$queryRaw`SELECT 1`
    
    // Check Redis connectivity (if used)
    // await redis.ping()
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
      environment: process.env.NODE_ENV
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error.message },
      { status: 503 }
    )
  }
}
```

### Alert Configuration

#### Sentry Alerts
- **Error Rate**: Alert when >5% of requests fail in 5 minutes
- **Performance**: Alert when P95 response time >2 seconds
- **New Errors**: Alert on new error types in production

#### Database Alerts
```sql
-- Monitor connection count
SELECT count(*) as connections FROM pg_stat_activity;

-- Monitor slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
WHERE mean_time > 1000 
ORDER BY mean_time DESC;

-- Monitor disk usage
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🔄 Maintenance Procedures

### Database Maintenance

#### Index Optimization
```sql
-- Analyze table statistics
ANALYZE;

-- Check for unused indexes
SELECT schemaname, tablename, indexname, idx_scan, pg_size_pretty(pg_relation_size(indexrelid))
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- Rebuild fragmented indexes
REINDEX TABLE CONCURRENTLY "Customer";
```

#### Cleanup Procedures
```sql
-- Clean up old soft-deleted records (be careful!)
DELETE FROM "Customer" 
WHERE "deletedAt" < NOW() - INTERVAL '90 days';

-- Vacuum database
VACUUM ANALYZE;

-- Update table statistics
ANALYZE VERBOSE;
```

### Application Maintenance

#### Dependency Updates
```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Test after updates
npm run test
npm run build

# Check for security vulnerabilities
npm audit
npm audit fix
```

## 📋 Operational Checklists

### Daily Operations
- [ ] Monitor error rates (<1%)
- [ ] Check database performance
- [ ] Review security logs
- [ ] Verify backup completion
- [ ] Monitor disk space usage

### Weekly Operations
- [ ] Update dependencies
- [ ] Review and rotate logs
- [ ] Check SSL certificate expiry
- [ ] Monitor user growth metrics
- [ ] Review performance metrics

### Monthly Operations
- [ ] Rotate API keys and credentials
- [ ] Review and optimize database indexes
- [ ] Update security patches
- [ ] Perform security assessment
- [ ] Review monitoring alerts

### Quarterly Operations
- [ ] Comprehensive security audit
- [ ] Performance optimization review
- [ ] Backup restoration testing
- [ ] Disaster recovery testing
- [ ] Compliance documentation review

## 🚨 Emergency Contacts

### Development Team
- **Lead Developer**: [name] - [email] - [phone]
- **DevOps Engineer**: [name] - [email] - [phone]
- **Security Officer**: [name] - [email] - [phone]

### Infrastructure Providers
- **Hosting**: Vercel Support - support@vercel.com
- **Database**: Neon Support - support@neon.tech
- **Authentication**: Clerk Support - support@clerk.dev
- **Monitoring**: Sentry Support - support@sentry.io

### Communication Channels
- **Incident Response**: #incidents Slack channel
- **Status Page**: status.yourcompany.com
- **Customer Communications**: support@yourcompany.com

---

This comprehensive operational guide ensures your SaaS application runs reliably and securely in production. Regular review and updates to these procedures will help maintain high availability and security standards.
