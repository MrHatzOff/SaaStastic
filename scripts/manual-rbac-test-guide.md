# Manual RBAC Testing Guide

## 🎯 Testing Objectives
Validate that our RBAC provisioner implementation works correctly in the live application.

## 🧪 Test Scenarios

### 1. Company Creation & Role Provisioning
**Objective**: Verify that creating a new company automatically provisions system roles.

**Steps**:
1. Open browser to `http://localhost:3000`
2. Sign in with Clerk (or create new account)
3. Navigate to company creation flow
4. Create a new company with name: `RBAC Test Company ${timestamp}`
5. **Expected Result**: 
   - Company created successfully
   - User automatically assigned Owner role
   - All 4 system roles (Owner, Admin, Member, Viewer) created in database

**Verification Queries**:
```sql
-- Check roles were created for the new company
SELECT r.name, r.slug, COUNT(p.id) as permission_count
FROM roles r
LEFT JOIN _RolePermissions rp ON r.id = rp.B
LEFT JOIN permissions p ON rp.A = p.id
WHERE r."companyId" = 'YOUR_COMPANY_ID'
GROUP BY r.id, r.name, r.slug
ORDER BY r.name;

-- Check user has Owner role assigned
SELECT uc.role, uc."roleId", r.name as role_name, r.slug
FROM "UserCompany" uc
LEFT JOIN roles r ON uc."roleId" = r.id
WHERE uc."companyId" = 'YOUR_COMPANY_ID';
```

### 2. Team Management Interface
**Objective**: Test the team management UI with RBAC integration.

**Steps**:
1. Navigate to `/dashboard/team`
2. Verify tabs are visible based on permissions:
   - Members tab (should be visible)
   - Activity tab (should be visible for Owner)
   - Roles tab (should be visible for Owner)
   - Settings tab (should be visible for Owner)
3. Test member invitation flow
4. Test role assignment changes

**Expected Results**:
- All tabs visible for Owner role
- Invitation modal works with role selection
- Role changes are properly saved and reflected

### 3. Permission Enforcement Testing
**Objective**: Verify API and UI permission guards work correctly.

**API Tests**:
```bash
# Test permissions API
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/users/permissions

# Expected: Returns all 29 permissions for Owner
```

**UI Tests**:
1. Check that permission-gated UI elements show/hide correctly
2. Test bulk operations (should be available for Owner/Admin)
3. Verify settings access is restricted appropriately

### 4. Multi-User Role Testing
**Objective**: Test different role permissions with multiple users.

**Setup**:
1. Invite a test user with Member role
2. Sign in as that user
3. Verify limited permissions

**Expected Results**:
- Member sees limited navigation options
- Member cannot access admin functions
- Permission guards work in both API and UI

## 🔍 Database Verification Queries

```sql
-- 1. Verify all companies have system roles
SELECT 
    c.name as company_name,
    COUNT(r.id) as role_count,
    STRING_AGG(r.name, ', ' ORDER BY r.name) as roles
FROM companies c
LEFT JOIN roles r ON c.id = r."companyId" AND r."isSystem" = true
GROUP BY c.id, c.name
HAVING COUNT(r.id) != 4;  -- Should return empty if all companies have 4 roles

-- 2. Verify permission assignments
SELECT 
    r.name as role_name,
    COUNT(p.id) as permission_count
FROM roles r
LEFT JOIN _RolePermissions rp ON r.id = rp.B
LEFT JOIN permissions p ON rp.A = p.id
WHERE r."isSystem" = true
GROUP BY r.id, r.name
ORDER BY permission_count DESC;

-- Expected counts:
-- Owner: 29 permissions
-- Admin: 25 permissions  
-- Member: 7 permissions
-- Viewer: 5 permissions

-- 3. Check for any users without roleId
SELECT 
    u.email,
    uc.role as legacy_role,
    uc."roleId",
    c.name as company_name
FROM "UserCompany" uc
JOIN users u ON uc."userId" = u.id
JOIN companies c ON uc."companyId" = c.id
WHERE uc."roleId" IS NULL;
-- Should return empty - all users should have roleId
```

## ✅ Success Criteria

### Company Creation
- [ ] New company creates 4 system roles automatically
- [ ] Owner user gets proper role assignment (both legacy + new)
- [ ] All roles have correct permission counts

### Team Management
- [ ] Team page loads without errors
- [ ] All tabs visible for Owner role
- [ ] Invitation flow works with role selection
- [ ] Role changes persist correctly

### Permission Enforcement
- [ ] API returns correct permissions for user role
- [ ] UI elements show/hide based on permissions
- [ ] Bulk operations respect role permissions

### Database Integrity
- [ ] All companies have exactly 4 system roles
- [ ] All roles have expected permission counts
- [ ] All users have roleId assigned

## 🚨 Common Issues to Watch For

1. **Missing Roles**: If company creation doesn't create all 4 roles
2. **Permission Mismatches**: If role permission counts are wrong
3. **UI Errors**: If permission guards cause React errors
4. **Database Inconsistency**: If some users lack roleId assignments

## 📝 Test Results Log

**Date**: September 27, 2025
**Tester**: [Your Name]
**Environment**: Development (localhost:3000)

### Test 1: Company Creation
- [ ] PASS / FAIL
- Notes: 

### Test 2: Team Management  
- [ ] PASS / FAIL
- Notes:

### Test 3: Permission Enforcement
- [ ] PASS / FAIL  
- Notes:

### Test 4: Database Verification
- [ ] PASS / FAIL
- Notes:

---
*Generated by RBAC Testing Suite - September 2025*
