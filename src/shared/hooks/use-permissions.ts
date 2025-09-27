/**
 * usePermissions Hook
 * 
 * Provides permission checking functionality for React components
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
 * Fetch user permissions from the API
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
 * Hook to get user permissions for the current company
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
 * Hook to check a specific permission (useful for conditional rendering)
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
 * Hook to check multiple permissions
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
