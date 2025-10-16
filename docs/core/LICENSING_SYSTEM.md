# SaaStastic Licensing System

**Created**: October 9, 2025  
**Purpose**: Track customers who purchase SaaStastic boilerplate licenses

---

## Overview

This system manages your SaaStastic customers (developers who buy your boilerplate), NOT their end-users. It tracks licenses, support hours, and integrates with Lemon Squeezy for payments.

---

## Database Schema

### LicenseCustomer Model

Tracks each customer who purchases a SaaStastic license.

**Key Fields**:
- `email` - Customer email (unique)
- `tier` - License tier (STARTER, PROFESSIONAL, AGENCY, ENTERPRISE, FOREVER)
- `licenseKey` - Generated license key (format: `SAAS-{TIER}-{ID}-{HASH}`)
- `githubUsername` - For automatic repo invitations
- `supportHours` - Remaining 1-on-1 support hours
- `lemonSqueezyOrderId` - Links to Lemon Squeezy purchase

**License Tiers**:
```typescript
enum LicenseTier {
  STARTER      // $399 - 1 project, community support
  PROFESSIONAL // $997 - 1 project, 30 days email support
  AGENCY       // $4,997 - Unlimited projects, priority support
  ENTERPRISE   // $9,997/year - White-label, 24hr SLA
  FOREVER      // $20,000 - Lifetime everything
}
```

**Support Hours by Tier**:
- STARTER: 0 hours (community only)
- PROFESSIONAL: 0 hours (email support instead)
- AGENCY: 2 hours
- ENTERPRISE: 10 hours/year
- FOREVER: 20 hours initial

**Status Tracking**:
- `isActive` - Is license currently active?
- `isCancelled` - Has customer cancelled?
- `expiresAt` - When does license expire? (null = forever/lifetime)
- `renewalDate` - For Enterprise subscriptions

### SupportSession Model

Tracks 1-on-1 support sessions scheduled via Calendly.

**Key Fields**:
- `licenseCustomerId` - Links to customer
- `scheduledAt` - When session is scheduled
- `hoursUsed` - How many hours this consumed (usually 1)
- `status` - SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
- `notes` - Session notes for reference

---

## Integration Points

### Lemon Squeezy Webhook

**File**: `src/app/api/webhooks/lemonsqueezy/route.ts` (to be created Day 2)

**Handles**:
1. `order_created` - Create LicenseCustomer record
2. `subscription_created` - For Enterprise tier
3. `subscription_updated` - Renewal tracking
4. `subscription_cancelled` - Mark as cancelled

**Flow**:
```
1. Customer purchases on Lemon Squeezy
2. Webhook fires to your server
3. Create LicenseCustomer with generated license key
4. Invite to GitHub (if username provided)
5. Send welcome email with license key
6. Assign Discord role (if they join)
```

### License Key Generation

**Format**: `SAAS-{TIER}-{CUSTOMER_ID}-{PROJECT}-{HASH}`

**Examples**:
- `SAAS-STARTER-ABC123-001-XYZ789`
- `SAAS-AGENCY-DEF456-001-ABC123`
- `SAAS-FOREVER-GHI789-001-DEF456`

**Implementation**: See `src/lib/licensing/license-generator.ts` (to be created Day 2)

### GitHub Invitations

**File**: `src/lib/github/invite.ts` (to be created Day 2)

**Process**:
1. Customer provides GitHub username during checkout
2. After payment, automatically invite to private repo
3. Grant read-only access
4. Customer can clone and use the code

### Support Hour Management

**Tracking**:
- Initial hours set based on tier when customer created
- Deduct hours after each support session
- Email warning when hours < 2
- Option to purchase more via Support Packs ($497 for 5hr, $897 for 10hr)

**Calendly Integration**:
- Customer books session via Calendly
- Manually create SupportSession record
- Mark as COMPLETED after session
- Deduct hours from customer's balance

---

## API Routes (To Be Created)

### GET /api/licensing/verify
Verify a license key is valid and active.

**Request**:
```json
{
  "licenseKey": "SAAS-STARTER-ABC123-001-XYZ789"
}
```

**Response**:
```json
{
  "valid": true,
  "tier": "STARTER",
  "expiresAt": null,
  "supportHours": 0
}
```

### GET /api/licensing/customer/:id
Get customer details (for your internal use).

### POST /api/licensing/support/schedule
Create a support session record.

---

## Queries You'll Need

### Find Customer by Email
```typescript
const customer = await db.licenseCustomer.findUnique({
  where: { email: 'customer@example.com' }
});
```

### Check Support Hours
```typescript
const customer = await db.licenseCustomer.findUnique({
  where: { licenseKey: 'SAAS-...' },
  select: { supportHours: true }
});
```

### Get All Active Customers
```typescript
const customers = await db.licenseCustomer.findMany({
  where: { isActive: true },
  orderBy: { purchaseDate: 'desc' }
});
```

### Deduct Support Hour
```typescript
await db.$transaction(async (tx) => {
  // Create session record
  await tx.supportSession.create({
    data: {
      licenseCustomerId: customerId,
      scheduledAt: new Date(),
      hoursUsed: 1,
      status: 'COMPLETED'
    }
  });
  
  // Deduct hour
  await tx.licenseCustomer.update({
    where: { id: customerId },
    data: {
      supportHours: { decrement: 1 }
    }
  });
});
```

---

## Migration

The schema has been added to `prisma/schema.prisma`.

**Run Migration**:
```bash
npx prisma migrate dev --name add_licensing_system
```

**Generate Prisma Client**:
```bash
npx prisma generate
```

---

## Next Steps (Launch Plan)

**Day 1** (Complete):
- ✅ Database schema created

**Day 2** (Automation):
- [ ] Create `src/lib/licensing/license-generator.ts`
- [ ] Create `src/app/api/webhooks/lemonsqueezy/route.ts`
- [ ] Create `src/lib/github/invite.ts`
- [ ] Create welcome email template
- [ ] Test end-to-end flow

**Day 3** (Support):
- [ ] Set up Discord bot for license verification
- [ ] Set up Calendly for support sessions
- [ ] Create support hour tracking dashboard

---

## Security Considerations

1. **License Key Validation**: Always validate keys server-side, never trust client
2. **GitHub Token**: Store in environment variables, never commit
3. **Lemon Squeezy Webhook**: Verify signature on all webhook requests
4. **Customer Data**: This is YOUR customer data - protect it carefully

---

## Maintenance

**Monthly Tasks**:
- Review expiring licenses (Enterprise renewals)
- Check support hour balances
- Follow up with customers < 2 hours remaining

**Quarterly Tasks**:
- Analyze tier distribution
- Review support session feedback
- Consider adjusting pricing based on data

---

**Questions?** See `MASTER_LAUNCH_PLAN.md` for integration details.
