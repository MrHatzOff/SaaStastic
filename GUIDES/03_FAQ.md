# ❓ Frequently Asked Questions

Quick answers to common questions about SaaStastic.

---

## 🚀 Getting Started

### **Q: What services do I need to use SaaStastic?**

**Required**:
- **PostgreSQL database** - Any provider works (Vercel, Supabase, Neon, Railway, or self-hosted)
- **Clerk** - Authentication (free tier available, ~5,000 users)
- **Stripe** - Payment processing (free, only pay transaction fees)

**Optional** (can disable or replace):
- **Sentry** - Error tracking (free tier: 5,000 errors/month)
- **Resend** - Email service (free tier: 100 emails/day)
- **Upstash Redis** - Rate limiting (free tier: 10,000 requests/day)

**Cost to start**: $0 - All services have generous free tiers.

---

### **Q: Can I use alternative services?**

**Yes!** SaaStastic is flexible:

| Service Type | What's Included | Alternatives |
|--------------|-----------------|--------------|
| **Database** | PostgreSQL + Prisma | Any PostgreSQL provider |
| **Auth** | Clerk | Could migrate to NextAuth, Auth0, etc. |
| **Payments** | Stripe | Tightly integrated, but could swap |
| **Email** | Resend | SendGrid, Postmark, AWS SES, Mailgun |
| **Error Tracking** | Sentry | Bugsnag, Rollbar, or disable completely |
| **Rate Limiting** | Upstash Redis | Any Redis, or disable for MVP |

**Note**: Clerk and Stripe are deeply integrated. Swapping them requires work, but the code is yours to modify.

---

### **Q: How long does setup take?**

**First-time setup**: ~25-30 minutes (if you have accounts ready)

**Breakdown**:
- Clone & install: 2 minutes
- Create accounts (Clerk, Stripe, DB): 10 minutes
- Configure environment variables: 5 minutes
- Run migrations & seed data: 2 minutes
- Deploy to Vercel: 5 minutes
- Test everything: 5 minutes

**Detailed guide**: See [SETUP_GUIDE.md](./SETUP_GUIDE.md)

---

## 💰 Pricing & Licensing

### **Q: What's included?**

**Everything**:
- ✅ Complete source code (no features held back)
- ✅ All 29 permissions and RBAC system
- ✅ Multi-tenant architecture
- ✅ Stripe billing integration
- ✅ Team management system
- ✅ 87 passing tests
- ✅ Complete documentation
- ✅ Future updates (depends on tier)

**Nothing is hidden or "coming soon"** - if it's in the README, it's in the code.

---

### **Q: How do updates work?**

**Depends on your license tier**:

| Tier | Updates | Duration |
|------|---------|----------|
| **Starter** | All updates | 12 months |
| **Professional** | All updates | 12 months |
| **Agency** | All updates | 12 months |
| **Enterprise** | All updates | While subscribed |
| **Forever** | All updates | Forever |

**How to update**:
```bash
# Add SaaStastic as remote
git remote add saastastic [repo-url]

# Pull updates
git fetch saastastic
git merge saastastic/main

# Resolve any conflicts
# Test your app
```

**After 12 months** (Starter/Pro/Agency):
- Your code keeps working forever
- No new updates unless you renew ($199-$997/year depending on tier)
- Can renew anytime to resume updates

---

### **Q: What support do I get?**

**Depends on your tier**:

| Tier | Support |
|------|---------|
| **Starter ($399)** | Community Discord only |
| **Professional ($997)** | 30 days email support + Discord |
| **Agency ($4,997)** | Priority email + Discord + 2 hours consulting |
| **Enterprise ($9,997/yr)** | 24-hour SLA + 10 hours consulting |
| **Forever ($20,000)** | Priority forever + 20 hours initial consulting |

**Community Discord**:
- Active community helping each other
- Share your builds, get feedback
- Learn from others' solutions

**Email support**:
- Technical questions answered
- Deployment help
- Integration guidance
- No custom development

**Consulting hours** (Agency+):
- Scheduled 1-on-1 calls
- Architecture review
- Custom feature guidance
- Code review

**Additional support packs available**:
- 5 hours: $497
- 10 hours: $897

---

### **Q: Can I use this for multiple projects?**

**Depends on your license**:

| Tier | Projects | Transferable |
|------|----------|--------------|
| **Starter** | 1 project | No |
| **Professional** | 1 project | No |
| **Agency** | Unlimited client projects | No |
| **Enterprise** | Unlimited company projects | No |
| **Forever** | Unlimited projects forever | No |

**What counts as "1 project"?**
- One deployed SaaS application
- Can have dev/staging/production environments
- Multiple domains pointing to same app = still 1 project
- Same codebase for different clients = requires Agency or Enterprise

**Example scenarios**:
- ✅ Starter: Build your own SaaS product
- ✅ Professional: Build your company's SaaS product
- ✅ Agency: Build SaaS products for 10 different clients
- ✅ Enterprise: Build multiple products for your company
- ✅ Forever: Build unlimited products, sell to unlimited clients

---

### **Q: Can I customize and resell SaaStastic itself?**

**No** - You cannot:
- ❌ Resell SaaStastic as a boilerplate
- ❌ Rebrand and sell as "YourName Starter"
- ❌ Compete with SaaStastic directly

**Yes** - You CAN:
- ✅ Build SaaS products and sell them
- ✅ Build client projects (Agency tier)
- ✅ Modify the code completely
- ✅ White-label your products (Enterprise/Forever)
- ✅ Remove "Built with SaaStastic" footer (Pro+)

**Think of it like**: You can build and sell houses using blueprints you bought, but you can't sell copies of the blueprints themselves.

---

### **Q: What's your refund policy?**

**30-day money-back guarantee**:
- If you're not satisfied within 30 days, email us
- Full refund, no questions asked
- You must delete the code and stop using it

**After 30 days**: No refunds (you've had time to evaluate)

**Why so generous?** We're confident SaaStastic will save you months of work. If it doesn't, you shouldn't pay.

---

## 🛠️ Technical Questions

### **Q: Can I customize everything?**

**Yes!** You get the full source code:
- ✅ Modify any component or feature
- ✅ Add your own business logic
- ✅ Change styling completely
- ✅ Add/remove permissions
- ✅ Integrate your own services
- ✅ Deploy wherever you want

**It's your code now** - do whatever you need for your business.

**Common customizations**:
- Add custom permissions (guide: [CUSTOMIZING_PERMISSIONS.md](./CUSTOMIZING_PERMISSIONS.md))
- Extend team management (guide: [EXTENDING_TEAM_MANAGEMENT.md](./EXTENDING_TEAM_MANAGEMENT.md))
- Customize billing (guide: [STRIPE_CUSTOMIZATION.md](./STRIPE_CUSTOMIZATION.md))
- Add your features to `src/features/`

---

### **Q: Is this production-ready?**

**Yes!** SaaStastic is:
- ✅ **Battle-tested** - Based on patterns from real production apps
- ✅ **Secure** - Multi-tenant isolation, RBAC, audit logs, security headers
- ✅ **Tested** - 87 passing tests (60 unit + 27 E2E)
- ✅ **Type-safe** - 100% TypeScript strict mode compliance
- ✅ **Documented** - Comprehensive guides and API docs
- ✅ **Maintained** - Regular updates and bug fixes

**What "production-ready" means**:
- No "TODO" comments for critical features
- Security is built-in, not an afterthought
- Error handling is comprehensive
- Edge cases are handled
- Tests cover critical paths

**What you still need to do**:
- Add your specific business logic
- Configure your branding/design
- Set up production services (DB, Clerk, Stripe)
- Deploy to your hosting
- Add your domain

---

### **Q: What if I'm not familiar with the tech stack?**

**Learning curve depends on your background**:

**You'll be productive if you know**:
- React basics (components, hooks, state)
- TypeScript basics (types, interfaces)
- REST API concepts
- Basic SQL/database concepts

**You should learn first if you don't know**:
- JavaScript fundamentals
- React fundamentals
- How REST APIs work

**Resources to learn**:
- [Next.js Tutorial](https://nextjs.org/learn) - Official guide (free)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) - Official docs (free)
- [Prisma Getting Started](https://www.prisma.io/docs/getting-started) - Database ORM (free)

**Time to learn**: ~1-2 weeks if completely new to React/Next.js

**Good news**: The codebase follows consistent patterns. Once you understand one feature, you understand them all.

---

### **Q: How do I add my own features?**

**Pattern to follow**:

1. **Create feature directory**:
   ```bash
   mkdir -p src/features/your-feature/{components,hooks,types,utils}
   ```

2. **Add Prisma model**:
   ```prisma
   // prisma/schema.prisma
   model YourModel {
     id        String   @id @default(cuid())
     companyId String   // Required for multi-tenancy!
     name      String
     createdAt DateTime @default(now())
     
     company   Company  @relation(fields: [companyId], references: [id])
     @@index([companyId])
   }
   ```

3. **Create API route**:
   ```typescript
   // src/app/api/your-feature/route.ts
   import { withPermissions, PERMISSIONS } from '@/shared/lib';
   
   export const GET = withPermissions(
     async (req, { companyId }) => {
       const data = await db.yourModel.findMany({
         where: { companyId } // Always scope by company!
       });
       return NextResponse.json(data);
     },
     [PERMISSIONS.YOUR_PERMISSION]
   );
   ```

4. **Build UI component**:
   ```typescript
   // src/features/your-feature/components/your-component.tsx
   import { PermissionGuard } from '@/shared/components';
   
   export function YourComponent() {
     return (
       <PermissionGuard permission="your:permission">
         <div>Your feature here</div>
       </PermissionGuard>
     );
   }
   ```

**See the guides**: [RBAC_USAGE.md](./RBAC_USAGE.md), [CUSTOMIZING_PERMISSIONS.md](./CUSTOMIZING_PERMISSIONS.md)

---

### **Q: Does this work with my existing database?**

**Maybe** - depends on your situation:

**✅ Works if**:
- You're starting fresh (recommended)
- You can add `companyId` to all tables
- You're okay migrating data to new schema

**❌ Won't work if**:
- You need single-tenant architecture
- You can't modify existing schema
- You need to keep exact current structure

**Migration approach**:
1. Start with SaaStastic schema
2. Add your existing tables as Prisma models
3. Add `companyId` to all models
4. Write migration script to move data
5. Test multi-tenant isolation thoroughly

**Alternative**: Use SaaStastic for new app, migrate features over time

---

## 🔒 Security & Compliance

### **Q: Is multi-tenancy secure?**

**Yes!** Security is built-in at multiple layers:

**Database Level**:
- ✅ All queries automatically scoped by `companyId`
- ✅ Prisma middleware enforces tenant isolation
- ✅ Row-level security (data physically separated)

**API Level**:
- ✅ `withPermissions()` middleware checks auth + permissions
- ✅ All requests validate user belongs to company
- ✅ RBAC enforced on every endpoint

**UI Level**:
- ✅ `<PermissionGuard>` hides unauthorized features
- ✅ `usePermissions()` hook for conditional logic
- ✅ Client-side guards as UX, server validates

**Tested**:
- ✅ E2E tests verify tenant isolation
- ✅ Unit tests cover permission logic
- ✅ No data leakage between companies

**What you need to do**:
- Always include `companyId` in new models
- Always use `withPermissions()` for API routes
- Always scope queries by `companyId`
- Review the [RBAC_USAGE.md](./RBAC_USAGE.md) guide

---

### **Q: Is this GDPR/SOC2/HIPAA compliant?**

**Foundation is compliant-ready**:

**✅ Already included**:
- Audit logging (who did what, when)
- Data isolation (tenant separation)
- Role-based access control
- Soft deletes (data retention)
- Secure authentication (Clerk)

**🔧 You need to add**:
- Privacy policy and terms
- Cookie consent (if EU users)
- Data export functionality (GDPR right to access)
- Data deletion functionality (GDPR right to deletion)
- Backup and retention policies
- Encryption at rest (database provider setting)
- Business Associate Agreement (HIPAA only)

**Resources**:
- [GDPR Compliance Checklist](https://gdpr.eu/checklist/)
- [SOC 2 Requirements](https://www.aicpa.org/soc2)
- [HIPAA Compliance Guide](https://www.hhs.gov/hipaa/index.html)

**Recommendation**: Consult with a lawyer for your specific compliance needs. SaaStastic gives you the technical foundation, but legal requirements vary by industry and region.

---

## 💼 Business Questions

### **Q: Can I use this for client work?**

**Yes** - with Agency, Enterprise, or Forever tier:

| Tier | Client Projects |
|------|-----------------|
| Starter | ❌ No - single project for yourself |
| Professional | ❌ No - single project for your company |
| **Agency** | ✅ Yes - unlimited client projects |
| **Enterprise** | ✅ Yes - unlimited for your company |
| **Forever** | ✅ Yes - unlimited everything |

**Agency tier ($4,997)**:
- Build for as many clients as you want
- Each client's app counts as separate project
- You own the code, client owns their deployed app
- Can charge clients whatever you want

**What you can do**:
- ✅ Build SaaS products for clients
- ✅ Charge $20k-$100k per project
- ✅ Reuse SaaStastic for every project
- ✅ Keep making money from same investment

**ROI**: Pay $4,997 once, use for unlimited projects = huge savings

---

### **Q: Will you add feature X?**

**Maybe!** We actively maintain and improve SaaStastic.

**How new features are added**:
1. **Common requests** - If many customers ask, we prioritize
2. **Security/bug fixes** - Immediate priority
3. **Framework updates** - Keep dependencies current
4. **Enterprise features** - Advanced capabilities over time

**How to request**:
- Open [GitHub Discussion](https://github.com/your-org/saastastic/discussions)
- Explain use case and benefit
- Community votes on priority

**Current roadmap** (subject to change):
- Enhanced observability (logging, metrics)
- Advanced admin panel
- White-label customization tools
- Additional payment providers
- More authentication options

**You can also**:
- Build features yourself (it's your code!)
- Hire us for custom development
- Contribute back to the project

---

### **Q: What if I get stuck?**

**Multiple support channels**:

**1. Documentation** (always available):
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Complete setup
- [Troubleshooting section](./SETUP_GUIDE.md#troubleshooting) - 8 common issues
- Feature guides in `docs/guides/`

**2. Community Discord** (all tiers):
- Ask questions, get help from other users
- Share your builds
- Learn from others

**3. Email Support** (Pro tier and above):
- Technical questions answered
- Deployment guidance
- Integration help

**4. Consulting Hours** (Agency+):
- Scheduled calls for complex issues
- Architecture review
- Custom feature guidance

**5. GitHub Issues**:
- Report bugs
- Request features
- Check known issues

**Pro tip**: Search existing GitHub issues and discussions first - your question may already be answered!

---

## 🎯 Comparison Questions

### **Q: SaaStastic vs. building from scratch?**

| Aspect | Building from Scratch | SaaStastic |
|--------|----------------------|------------|
| **Time** | 4-6 months | 1-2 weeks |
| **Cost** | $135,000+ (dev time) | $399-$20,000 |
| **Risk** | High (unknown unknowns) | Low (tested code) |
| **Security** | Learn as you go | Built-in best practices |
| **Testing** | Write from scratch | 87 tests included |
| **Multi-tenancy** | Complex, error-prone | Battle-tested patterns |
| **RBAC** | 3-4 weeks to build | 29 permissions ready |
| **Documentation** | You write it | Comprehensive guides |

**Bottom line**: Build from scratch if you have unique requirements. Use SaaStastic if you want standard B2B SaaS features fast.

---

### **Q: SaaStastic vs. other boilerplates?**

**What makes SaaStastic different**:
- ✅ **Actually multi-tenant** - Most are single-tenant with "coming soon" promise
- ✅ **Real RBAC** - 29 permissions, not just "admin vs user"
- ✅ **Tested** - 87 passing tests; most have zero
- ✅ **Production-ready** - No "TODO" comments in critical paths
- ✅ **Comprehensive docs** - Not just a README
- ✅ **Modern stack** - Next.js 15, React 19, latest everything

**Comparison**:
- **ShipFast** ($299): Great for simple apps, no multi-tenancy or RBAC
- **Supastarter** ($399+): Good foundation, less comprehensive RBAC
- **Volca** ($4,500): Similar scope, older stack, less tested
- **SaaStastic**: Best for enterprise B2B with complex permissions

**Choose based on needs**:
- Simple SaaS → ShipFast
- Medium complexity → Supastarter
- **Enterprise B2B → SaaStastic**

---

## 🤔 Still Have Questions?

**Can't find your answer?**

1. 📖 Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Most technical questions answered
2. 💬 Ask in [GitHub Discussions](https://github.com/your-org/saastastic/discussions)
3. 📧 Email: support@saastastic.com
4. 🐦 Twitter: [@saastastic](https://twitter.com/saastastic)

**Before contacting support**, please:
- Search existing discussions/issues
- Check the relevant guide in `docs/guides/`
- Include: error messages, OS, Node version, what you tried

---

**Last Updated**: October 9, 2025
