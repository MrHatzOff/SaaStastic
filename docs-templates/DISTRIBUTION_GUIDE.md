# 📦 How to Create and Distribute SaaStastic

**Quick guide for creating clean customer distributions**

---

## 🎯 Overview

You have **two repositories**:

1. **Development Repo** (current) - Your complete workspace with all docs, notes, scripts
2. **Distribution Repo** (created) - Clean customer-facing version

**Never maintain both manually!** Use the automated script.

---

## ⚡ Quick Start

### 1. First-Time Setup (Do Once)

```powershell
# 1. Review what customer-facing README should say
code docs-templates/customer-README.md

# 2. Customize the commercial license
code docs-templates/LICENSE-COMMERCIAL.md

# 3. Test the distribution script in dry-run mode
.\create-distribution.ps1 -DryRun
```

**Review the output carefully!** Make sure:
- ✅ All source code is included
- ✅ Customer guides are included
- ❌ No launchPlan docs are included
- ❌ No internal scripts are included
- ❌ No Utilities folder is included

### 2. Create Distribution (Every Release)

```powershell
# Create clean distribution
.\create-distribution.ps1

# Navigate to distribution folder
cd ../saastastic-distribution

# Copy customer-facing README
cp ../saastastic/docs-templates/customer-README.md ./README.md

# Copy license file
cp ../saastastic/docs-templates/LICENSE-COMMERCIAL.md ./LICENSE

# Test that everything works
npm install
npm run dev
```

**Visit http://localhost:3000** and verify:
- ✅ App loads correctly
- ✅ Can create account
- ✅ Can create company
- ✅ Can access dashboard

### 3. Create GitHub Repository

```powershell
# Still in distribution folder
git init
git add .
git commit -m "SaaStastic v1.0.0 - Initial Distribution"

# Create PRIVATE repo on GitHub
# Name: saastastic-distribution
# Privacy: PRIVATE (critical!)

git remote add origin https://github.com/YOUR-USERNAME/saastastic-distribution.git
git branch -M main
git push -u origin main
```

**⚠️ CRITICAL**: Repository MUST be **private**!

---

## 📋 For Each Customer Purchase

### Option A: GitHub Collaborator (Professional+)

1. Go to GitHub repo settings
2. Click "Collaborators"
3. Click "Add people"
4. Enter customer's GitHub username
5. Select "Read" access
6. Send invitation

**Customer receives**:
- Read-only access to private repo
- Can clone, fork (to private), download
- Cannot push changes back to your repo

### Option B: ZIP Download (Starter Tier)

```powershell
# Create ZIP from distribution
cd ../saastastic-distribution
Compress-Archive -Path * -DestinationPath ../saastastic-v1.0.0.zip

# Upload to Lemon Squeezy/Gumroad
# Customer downloads after payment
```

### Option C: Dedicated Repo (Agency/Enterprise)

```powershell
# Create NEW repo for specific customer
# Name: saastastic-client-acmecorp

cd ../saastastic-distribution
git remote rename origin template
git remote add origin https://github.com/YOUR-USERNAME/saastastic-client-acmecorp.git
git push -u origin main

# Add customer as collaborator with Write access
# This allows them to customize and push changes
```

---

## 🔄 Updating Distributions

### When to Create New Distribution

- ✅ New version release (1.0.0 → 1.1.0)
- ✅ Major bug fixes
- ✅ New features completed
- ✅ Security patches
- ❌ NOT for every small change

### Update Workflow

```powershell
# 1. Update version in development repo
# Edit package.json: "version": "1.1.0"

# 2. Update CHANGELOG.md
# Document what changed

# 3. Create new distribution
.\create-distribution.ps1 -OutputPath "../saastastic-v1.1.0"

# 4. Copy templates
cd ../saastastic-v1.1.0
cp ../saastastic/docs-templates/customer-README.md ./README.md
cp ../saastastic/docs-templates/LICENSE-COMMERCIAL.md ./LICENSE

# 5. Push to distribution repo
git add .
git commit -m "Version 1.1.0 - [describe changes]"
git tag -a v1.1.0 -m "Version 1.1.0"
git push origin main --tags

# 6. Notify customers (based on tier)
# - Professional: Email notification (30 days)
# - Agency: Email + consulting call
# - Enterprise: Automatic updates via GitHub
```

---

## 📁 What Gets Distributed

### ✅ INCLUDED

**Source Code**:
- `/src/**` - All application code
- `/prisma/**` - Database schema
- `/public/**` - Static assets
- `/tests/**` - All tests

**Configuration**:
- All config files (tsconfig, next.config, etc.)
- `.env.example` - Example environment
- `package.json` - Dependencies

**Documentation**:
- `/docs/guides/**` - Customer guides
- `/docs/core/**` - Architecture docs (curated)
- `/docs/testing/**` - Test documentation
- `README.md` - Customer-facing README
- `LICENSE` - Commercial license

**Scripts**:
- `/scripts/seed-rbac.ts` - RBAC seeding (useful)

### ❌ EXCLUDED

**Internal Docs** (72+ files):
- `/docs/archived/**` - Your history
- `/docs/launchPlan/**` - Your business plan
- `/docs/guidesForVibers/**` - LLM context
- `/docs/shared/**`, `/docs/users/**` - Old docs

**Development Scripts**:
- `scripts/debug-*.ts` - Debug tools
- `scripts/test-*.ts` - Test scripts
- `scripts/seed-sample-*.ts` - Sample data

**Utilities**:
- `/Utilities/**` - PowerShell scripts
- `cleanup-*.ps1` - Cleanup scripts
- `create-distribution.ps1` - Distribution script

**Personal Files**:
- Database dumps
- `.windsurf/` - IDE configuration
- `.env` files - Your credentials
- `.git/` - Your commit history

---

## 🔒 Security Checklist

Before every distribution, verify:

- [ ] No `.env` files with real credentials
- [ ] No API keys in code
- [ ] No database dumps
- [ ] No customer data
- [ ] No commit history exposed
- [ ] No pricing strategy documents
- [ ] No internal planning docs
- [ ] No TODO comments revealing plans
- [ ] Repository is PRIVATE
- [ ] License file is included

---

## 📊 Tier-Specific Delivery

### Starter ($399)
- **Delivery**: ZIP file download
- **Updates**: None
- **Support**: None
- **Process**:
  1. Create distribution
  2. Create ZIP
  3. Upload to Lemon Squeezy
  4. Customer downloads after payment

### Professional ($997)
- **Delivery**: GitHub collaborator (read-only)
- **Updates**: 30 days
- **Support**: Email
- **Process**:
  1. Create distribution repo
  2. Add customer as collaborator
  3. Notify customer via email
  4. Provide updates for 30 days

### Agency ($4,997)
- **Delivery**: GitHub collaborator OR dedicated repo
- **Updates**: 1 year
- **Support**: Priority + consulting call
- **Process**:
  1. Create dedicated repo (optional)
  2. Add customer with write access
  3. Schedule consulting call
  4. Provide updates for 1 year

### Enterprise ($9,997/year)
- **Delivery**: Dedicated private repo
- **Updates**: Lifetime
- **Support**: Priority + custom mods
- **Process**:
  1. Create dedicated repo
  2. Add customer with admin access
  3. Custom modifications as needed
  4. Ongoing support relationship

---

## 🚨 Common Mistakes to Avoid

### ❌ DON'T

1. **Give access to development repo** - Exposes all your internal docs
2. **Manually copy files** - Error-prone, time-consuming
3. **Make repo public** - Defeats the purpose of selling it
4. **Include `.env` files** - Security risk
5. **Skip testing distribution** - May be broken
6. **Use same repo for all customers** - No customization possible
7. **Forget to update LICENSE** - Legal issues

### ✅ DO

1. **Use automated script** - Fast, consistent, reliable
2. **Test every distribution** - Ensure it works
3. **Keep repos private** - Protect your product
4. **Version your releases** - Track what customers have
5. **Document what changed** - CHANGELOG.md
6. **Provide clear README** - Good first impression
7. **Set expectations** - Support levels per tier

---

## 📞 Support Questions Template

Create a support document for customers:

```markdown
# Support for SaaStastic Customers

## Your Tier: [Starter/Professional/Agency/Enterprise]

### Included Support
- [List what's included in their tier]

### Response Times
- Critical bugs: [X hours/days]
- Questions: [X hours/days]
- Feature requests: [Not included / Reviewed quarterly]

### How to Get Support
1. Check documentation first: [link to docs]
2. Search FAQ: [link to FAQ]
3. Email: support@yourdomain.com with:
   - Your tier
   - Clear description of issue
   - Steps to reproduce
   - Error messages (if any)

### Not Covered by Support
- Custom feature development (contact sales)
- Infrastructure/hosting issues
- Third-party service issues (Clerk, Stripe, etc.)
- Training on basic technologies (Next.js, React, etc.)
```

---

## ✅ Quick Checklist

Every time you create a distribution:

- [ ] Run `.\create-distribution.ps1 -DryRun` first
- [ ] Review excluded files list
- [ ] Create actual distribution
- [ ] Copy customer README
- [ ] Copy LICENSE file
- [ ] Test: `npm install && npm run dev`
- [ ] Verify app works completely
- [ ] Check for sensitive data
- [ ] Create/update GitHub repo
- [ ] Tag version (`git tag v1.0.0`)
- [ ] Deliver based on customer tier
- [ ] Update internal records

---

## 💡 Pro Tips

1. **Version Everything** - Use semantic versioning (1.0.0, 1.1.0, 2.0.0)
2. **Keep CHANGELOG** - Customers want to know what's new
3. **Test Before Distributing** - Broken distribution = bad reviews
4. **Automate Where Possible** - Scripts save time
5. **Document Your Process** - You'll forget details
6. **Set Clear Expectations** - Avoid support headaches
7. **Track Customer Versions** - Helps with support

---

**Ready to distribute?** Run `.\create-distribution.ps1 -DryRun` to get started!
