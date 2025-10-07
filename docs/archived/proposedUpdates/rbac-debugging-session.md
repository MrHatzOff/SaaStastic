# RBAC Debugging & Testing Session

## 🚀 NEW SESSION ONBOARDING

### **MANDATORY READING** 
1. **`/docs/core/PRD_V2.md`** - Current project status and architecture overview
2. **`/docs/core/ARCHITECTURE_V2.md`** - Technical patterns and multi-tenant security
3. **`/docs/core/WINDSURF_RULES.md`** - Copy-paste ready development patterns

### **PROJECT CONTEXT**:
- **SaaStastic**: Production-ready multi-tenant B2B SaaS starter
- **Current Phase**: Phase 2B - Enterprise Team Management (95% complete)
- **Tech Stack**: Next.js 15, React 19, TypeScript 5, PostgreSQL, Prisma 6, Clerk Auth
- **Architecture**: Multi-tenant with strict RBAC (29 permissions, 4 role types)

### **CRITICAL SECURITY RULES** (Non-negotiable):
- ✅ ALL database queries MUST be scoped by `companyId`
- ✅ NO dev bypasses - use Clerk authentication only
- ✅ TypeScript strict mode - no `any` types in production code
- ✅ Multi-tenant isolation enforced at API middleware level

---

## 🐛 CURRENT ISSUE SUMMARY

### **Problem**: RBAC System Not Working in Production
**Symptoms**:
1. **403 Forbidden** on `/api/users/permissions?companyId=cmfpwxit80000ms90bateei4h`
2. **Bulk removal dialog** appears immediately on team page load
3. **Clerk routing error** - sign-in component configuration issue

**Error Details**:
```
XHR GET http://localhost:3000/api/users/permissions?companyId=cmfpwxit80000ms90bateei4h
[HTTP/1.1 403 Forbidden 412ms]

Clerk: The <SignIn/> component is not configured correctly.
The "/sign-in" route is not a catch-all route.
```

### **Database Status** ✅:
- User has OWNER role in UserCompany table
- RBAC system seeded with 29 permissions
- System roles created for all companies
- User ID: `user_32sB19ZNfcF9bCrgNztf0ZW33m7`
- Associated Company: `cmfrqoy6i0000mszkkth84pg1` (NOT `cmfpwxit80000ms90bateei4h`)

### **Root Cause Hypothesis**:
User is trying to access **wrong company** (`cmfpwxit80000ms90bateei4h` vs `cmfrqoy6i0000mszkkth84pg1`)

---

## 🎯 SESSION OBJECTIVES

### **Phase 1: Debug Current Issue** (30 minutes)
1. **Run Debug Script**: Execute `/scripts/debug-user.ts` to analyze user permissions
2. **Fix Company Context**: Ensure user is accessing correct company
3. **Fix Clerk Routing**: Resolve sign-in catch-all route configuration
4. **Test Permissions API**: Verify 403 error is resolved

### **Phase 2: Comprehensive RBAC Testing** (45 minutes)
1. **Permission Matrix Testing**: Test all 29 permissions across 4 role types
2. **UI Component Testing**: Verify PermissionGuard components work correctly
3. **API Endpoint Testing**: Test all RBAC-protected routes
4. **Team Management Testing**: Full workflow testing (invite, roles, removal)
5. **Edge Case Testing**: Invalid permissions, missing roles, etc.

### **Phase 3: Documentation Update** (30 minutes)
1. **Update Architecture Docs**: Reflect completed RBAC implementation
2. **Create RBAC Guide**: Comprehensive guide for developers
3. **Update API Documentation**: Document all permission requirements
4. **Create Testing Checklist**: Standardized RBAC testing procedures

---

## 🔧 DEBUGGING CHECKLIST

### **Immediate Actions**:
- [ ] Run `npx tsx scripts/debug-user.ts` to analyze user permissions
- [ ] Check company context in browser developer tools
- [ ] Verify Clerk sign-in route configuration
- [ ] Test permissions API with correct company ID

### **Files to Investigate**:
- `/src/shared/hooks/use-permissions.ts` - Permission fetching logic
- `/src/core/auth/company-provider.tsx` - Company context management
- `/src/app/sign-in/[[...sign-in]]/page.tsx` - Clerk routing
- `/src/shared/lib/rbac-middleware.ts` - Permission validation

### **Expected Outcomes**:
- [ ] User can access team management page without errors
- [ ] Permission guards work correctly (show/hide based on roles)
- [ ] Bulk operations only appear when appropriate
- [ ] All RBAC-protected APIs return proper responses

---

## 🧪 COMPREHENSIVE TESTING PLAN

### **A. Permission Matrix Testing**
Test each role against all permission categories:

#### **OWNER Role** (29 permissions):
- [ ] Organization: VIEW, UPDATE, DELETE, SETTINGS
- [ ] Billing: VIEW, UPDATE, PORTAL, INVOICES  
- [ ] Team: VIEW, INVITE, REMOVE, ROLE_UPDATE, SETTINGS
- [ ] Customer: CREATE, VIEW, UPDATE, DELETE, EXPORT
- [ ] API: KEY_CREATE, KEY_VIEW, KEY_DELETE
- [ ] Role: CREATE, VIEW, UPDATE, DELETE
- [ ] System: LOGS, IMPERSONATE, BACKUP, ADMIN_PANEL

#### **ADMIN Role** (25 permissions):
- [ ] All OWNER permissions except: ORG_DELETE, SYSTEM_IMPERSONATE, SYSTEM_BACKUP, SYSTEM_ADMIN_PANEL

#### **MEMBER Role** (7 permissions):
- [ ] Basic access: ORG_VIEW, TEAM_VIEW, CUSTOMER_VIEW, CUSTOMER_CREATE, CUSTOMER_UPDATE, API_KEY_VIEW, ROLE_VIEW

#### **VIEWER Role** (5 permissions):
- [ ] Read-only: ORG_VIEW, TEAM_VIEW, CUSTOMER_VIEW, API_KEY_VIEW, ROLE_VIEW

### **B. UI Component Testing**
- [ ] Team Members List: Bulk operations, role badges, permission-based buttons
- [ ] Invite Modal: Role selection, permission validation
- [ ] Activity Dashboard: System logs access, audit trail
- [ ] Navigation: Tab visibility based on permissions
- [ ] Settings Pages: Feature access control

### **C. API Endpoint Testing**
Test all RBAC-protected endpoints:
- [ ] `/api/users/permissions` - No specific permissions required
- [ ] `/api/users/team` - TEAM_VIEW permission
- [ ] `/api/users/team/[memberId]/role` - TEAM_ROLE_UPDATE permission
- [ ] `/api/companies/[id]` - ORG_VIEW permission
- [ ] `/api/billing/*` - Various billing permissions

### **D. Integration Testing**
- [ ] User signup → Company creation → Auto OWNER role assignment
- [ ] Team invitation → Role assignment → Permission inheritance
- [ ] Role changes → Permission updates → UI refresh
- [ ] Company switching → Permission context change

---

## 📚 DOCUMENTATION UPDATES NEEDED

### **Files to Update**:
1. **`/docs/core/ARCHITECTURE_V2.md`**:
   - Add RBAC implementation details
   - Document permission matrix
   - Update security patterns

2. **`/docs/core/api-reference.md`**:
   - Document permission requirements for each endpoint
   - Add RBAC middleware usage examples
   - Include error response formats

3. **Create `/docs/core/rbac-guide.md`**:
   - Complete developer guide for RBAC system
   - Permission definitions and usage
   - Role management best practices
   - Testing procedures

4. **Update `/docs/shared/features/team-management.md`**:
   - Document completed team management features
   - Include permission requirements
   - Add troubleshooting guide

### **New Documentation Needed**:
- **RBAC Testing Checklist**: Standardized testing procedures
- **Permission Troubleshooting Guide**: Common issues and solutions
- **Role Management Workflow**: Step-by-step admin procedures

---

## 🎉 SUCCESS CRITERIA

### **Debugging Complete When**:
- [ ] User can access `/dashboard/team` without errors
- [ ] Permissions API returns 200 with correct permissions
- [ ] Bulk removal dialog only appears when members selected
- [ ] All PermissionGuard components work correctly

### **Testing Complete When**:
- [ ] All 29 permissions tested across 4 role types
- [ ] All UI components respect permission boundaries
- [ ] All API endpoints enforce proper permissions
- [ ] Edge cases handled gracefully

### **Documentation Complete When**:
- [ ] RBAC implementation fully documented
- [ ] Developer guide available for team members
- [ ] API documentation includes permission requirements
- [ ] Testing procedures standardized

---

## 🚨 CRITICAL NOTES

### **DO NOT**:
- Bypass authentication or permission checks
- Use `any` types in TypeScript
- Modify core security patterns without review
- Skip multi-tenant scoping in database queries

### **ALWAYS**:
- Test with multiple user roles
- Verify company context isolation
- Check audit trail creation
- Validate error handling

### **REMEMBER**:
This is a **production-ready enterprise system**. Every permission check and security boundary is critical for multi-tenant isolation and compliance requirements.

---

*Session created: 2025-09-26 08:19 EST*  
*Estimated completion time: 2 hours*  
*Priority: HIGH - Blocking team management features*
