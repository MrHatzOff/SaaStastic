# SaaStastic RBAC Setup Guide

## 🎯 Purpose
This guide walks SaaStastic adopters through enabling, configuring, and validating the built-in Role-Based Access Control (RBAC) system for their own SaaS product. It assumes you’ve already deployed the core application and migrated your database.

As of the September 2025 update, RBAC provisioning is handled by the shared helper `src/core/rbac/provisioner.ts`. Company creation flows (API + service) now call `provisionSystemRolesForCompany()` inside the same Prisma transaction so every tenant automatically receives system roles. The helper is idempotent, so you can call it from scripts or backfills without creating duplicates.

---

## 🔐 RBAC Overview
- **29 granular permissions** grouped across Organization, Billing, Team, Customer, API, System, and Role categories.
- **System roles** created per tenant: Owner, Admin, Member, Viewer (all customizable).
- **Automatic enforcement** in both API (`withPermissions`) and UI (`usePermissions`, `PermissionGuard`).
- **Audit-ready** with tenant scoping and permission metadata on every sensitive operation.

Reference for engineers: `docs/core/architecture/rbac-spec.md`

---

## 🧱 Prerequisites
- Database seeded with permissions and system roles (`npx tsx scripts/seed-rbac.ts`).
- Existing tenants migrated to the RBAC model (the seed script handles this).
- Clerk authentication and company context already configured (default SaaStastic setup).

---

## 🚀 Step-by-Step Setup

### 1. Seed Permissions & System Roles
```bash
npx tsx scripts/seed-rbac.ts
```
- Creates/updates all 29 permissions.
- Reuses the shared provisioning helper to upsert Owner/Admin/Member/Viewer roles for every company.
- Migrates legacy `UserCompany.role` values into the new role references.

### 2. Verify Role Assignments
Check that each tenant has the four baseline roles and that users now reference them. System roles are identified by slug (`system-owner`, `system-admin`, `system-member`, `system-viewer`):
```sql
SELECT r.name, COUNT(*)
FROM "roles" r
JOIN "user_companies" uc ON uc."roleId" = r.id
GROUP BY r.name;
```

### 3. Configure Invitations
When inviting new members, select the desired role. The default `InviteMemberModal` supports role assignment and respects RBAC permissions. Ensure the inviting user has `TEAM_INVITE`.

### 4. Customize Roles (Optional)
You can extend the role set per company:
- Clone/modify the role via Prisma `roleModel` (avoid reusing the `system-*` slug namespace).
- Assign a subset of permissions using the Prisma client or admin UI (future feature).
- Update `DEFAULT_ROLE_PERMISSIONS` if you want different defaults for future seeds.

### 5. Enforce Permissions in Custom Features
Use helpers in `src/shared/lib/` and `src/shared/hooks/`:
- **API routes:** wrap handlers with `withPermissions(handler, [PERMISSIONS.ACTION])`.
- **Client components:** use `usePermissions()` or `<PermissionGuard />` to show/hide UI.
- **Server utilities:** call `hasPermission(userId, companyId, permission)` when running background jobs.

### 6. Test the Matrix
Run through the Team Management page and confirm:
- Owner/Admin see management tabs and role changes.
- Member can manage customers but not billing or roles.
- Viewer has read-only visibility.

---

## 🧪 Validation Checklist
- **[ ]** Seed script completes without errors.
- **[ ]** Each company shows four system roles.
- **[ ]** `/api/users/permissions` responds with the correct permission array for each role.
- **[ ]** UI elements are hidden for users lacking required permissions.
- **[ ]** Role changes take effect immediately (refresh team page to confirm).
- **[ ]** Attempting restricted actions returns `403` with `Insufficient permissions`.

---

## 🛠 Troubleshooting
- **Permissions endpoint returns 403**: ensure the request includes the correct `companyId` (header or query) and the user belongs to that tenant.
- **Users missing roles**: rerun `scripts/seed-rbac.ts` to migrate any remaining legacy records.
- **UI still shows restricted buttons**: verify the component uses `<PermissionGuard>` or calls `hasPermission()`.
- **Custom roles not appearing**: confirm the new role has permissions attached and the user’s `roleId` points to it.

---

## 📚 Additional Resources
- `docs/core/architecture/rbac-spec.md` – Detailed RBAC architecture and patterns.
- `docs/core/technical-workflows.md` – End-to-end development workflows.
- `docs/shared/components/permission-guard.tsx` – Source of the guard component.
- `docs/users/guides/TENANTING.md` – Tenant onboarding best practices.

Keep this guide updated as you extend RBAC (custom roles, impersonation, audit tooling). Contributions welcomed via PR!
