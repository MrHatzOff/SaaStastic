/**
 * usePermissions Hook
 * 
 * React hook that provides permission checking functionality for components.
 * Fetches and caches user permissions from the API, provides helper functions
 * for checking permissions in UI logic.
 * 
 * @module usePermissions
 * @see docs/guides/RBAC_USAGE.md#using-permission-hooks
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { hasPermission, PERMISSIONS } = usePermissions();
 *   
 *   return (
 *     <div>
 *       {hasPermission(PERMISSIONS.CUSTOMER_CREATE) && (
 *         <button>Create Customer</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */

'use client';

import { useUser } from '@clerk/nextjs';
import { useCompany } from '@/core/auth/company-provider';
import { PERMISSIONS, type Permission } from '@/shared/lib/permissions';
import { useQuery } from '@tanstack/react-query';

interface UserPermissions {
  permissions: Permission[];
  loading: boolean;
  error: Error | null;
}

/**
 * Fetch user permissions from the API.
 * Internal helper function used by usePermissions hook.
 * 
 * @param companyId - The company ID to fetch permissions for
 * @returns Promise resolving to array of permission strings
 * @throws Error if API request fails
 * @internal
 */
async function fetchUserPermissions(companyId: string): Promise<Permission[]> {
  const response = await fetch(`/api/users/permissions?companyId=${companyId}`, {
    headers: {
      'x-company-id': companyId,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch permissions');
  }

  const data = await response.json();
  return data.permissions || [];
}

/**
 * Hook to get user permissions for the current company.
 * Automatically fetches permissions when user and company are loaded.
 * Caches results for 5 minutes to minimize API calls.
 * 
 * @returns Object containing:
 *   - permissions: Array of permission strings
 *   - loading: Boolean indicating if permissions are being fetched
 *   - error: Error object if fetch failed
 *   - hasPermission: Function to check single permission
 *   - hasAnyPermission: Function to check if user has any of specified permissions
 *   - hasAllPermissions: Function to check if user has all specified permissions
 *   - PERMISSIONS: Constants object with all available permissions
 * 
 * @example
 * ```typescript
 * function CustomerDashboard() {
 *   const { hasPermission, hasAnyPermission, loading, PERMISSIONS } = usePermissions();
 *   
 *   if (loading) return <Skeleton />;
 *   
 *   const canCreate = hasPermission(PERMISSIONS.CUSTOMER_CREATE);
 *   const canModify = hasAnyPermission([
 *     PERMISSIONS.CUSTOMER_UPDATE,
 *     PERMISSIONS.CUSTOMER_DELETE
 *   ]);
 *   
 *   return (
 *     <div>
 *       {canCreate && <CreateButton />}
 *       {canModify && <ModifyButton />}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @see {@link useHasPermission}
 * @see {@link useHasPermissions}
 * @see docs/guides/RBAC_USAGE.md#using-permission-hooks
 */
export function usePermissions(): UserPermissions & {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  PERMISSIONS: typeof PERMISSIONS;
} {
  const { user, isLoaded: userLoaded } = useUser();
  const { currentCompany } = useCompany();

  const {
    data: permissions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['permissions', user?.id, currentCompany?.id],
    queryFn: () => fetchUserPermissions(currentCompany!.id),
    enabled: userLoaded && !!user && !!currentCompany?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: Permission): boolean => {
    if (!permissions.length) return false;
    return permissions.includes(permission);
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
    if (!permissions.length || !requiredPermissions.length) return false;
    return requiredPermissions.some(permission => permissions.includes(permission));
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
    if (!permissions.length || !requiredPermissions.length) return false;
    return requiredPermissions.every(permission => permissions.includes(permission));
  };

  return {
    permissions,
    loading: isLoading || !userLoaded,
    error: error as Error | null,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    PERMISSIONS,
  };
}

/**
 * Hook to check a specific permission.
 * Convenience hook that returns a boolean for a single permission check.
 * Useful when you only need to check one permission.
 * 
 * @param permission - The permission string to check
 * @returns Object containing hasPermission boolean, loading state, and error
 * 
 * @example
 * ```typescript
 * function CreateCustomerButton() {
 *   const { hasPermission, loading } = useHasPermission(PERMISSIONS.CUSTOMER_CREATE);
 *   
 *   if (loading) return <Skeleton />;
 *   if (!hasPermission) return null;
 *   
 *   return <button>Create Customer</button>;
 * }
 * ```
 * 
 * @see {@link usePermissions}
 * @see {@link useHasPermissions}
 */
export function useHasPermission(permission: Permission): {
  hasPermission: boolean;
  loading: boolean;
  error: Error | null;
} {
  const { hasPermission, loading, error } = usePermissions();

  return {
    hasPermission: hasPermission(permission),
    loading,
    error,
  };
}

/**
 * Hook to check multiple permissions.
 * Returns true if user has any/all of the specified permissions based on mode.
 * 
 * @param permissions - Array of permission strings to check
 * @param mode - 'any' checks if user has at least one, 'all' requires all permissions
 * @returns Object containing hasPermissions boolean, loading state, and error
 * 
 * @example
 * ```typescript
 * function AdminPanel() {
 *   // User must have ALL these permissions
 *   const { hasPermissions: canManage } = useHasPermissions(
 *     [PERMISSIONS.ORG_UPDATE, PERMISSIONS.BILLING_UPDATE],
 *     'all'
 *   );
 *   
 *   // User needs ANY of these permissions
 *   const { hasPermissions: canModify } = useHasPermissions(
 *     [PERMISSIONS.CUSTOMER_UPDATE, PERMISSIONS.CUSTOMER_DELETE],
 *     'any'
 *   );
 *   
 *   return (
 *     <div>
 *       {canManage && <SettingsPanel />}
 *       {canModify && <ModifyActions />}
 *     </div>
 *   );
 * }
 * ```
 * 
 * @see {@link usePermissions}
 * @see {@link useHasPermission}
 */
export function useHasPermissions(
  permissions: Permission[],
  mode: 'any' | 'all' = 'all'
): {
  hasPermissions: boolean;
  loading: boolean;
  error: Error | null;
} {
  const { hasAnyPermission, hasAllPermissions, loading, error } = usePermissions();

  const hasPermissions = mode === 'any' 
    ? hasAnyPermission(permissions)
    : hasAllPermissions(permissions);

  return {
    hasPermissions,
    loading,
    error,
  };
}
