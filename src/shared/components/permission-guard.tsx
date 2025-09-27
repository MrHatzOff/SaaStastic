/**
 * PermissionGuard Component
 * 
 * Conditionally renders children based on user permissions
 */

'use client';

import { ReactNode } from 'react';
import { usePermissions } from '@/shared/hooks/use-permissions';
import { type Permission } from '@/shared/lib/permissions';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  mode?: 'any' | 'all';
  fallback?: ReactNode;
  loading?: ReactNode;
  showLoading?: boolean;
}

/**
 * Guard component that shows/hides content based on user permissions
 */
export function PermissionGuard({
  children,
  permission,
  permissions = [],
  mode = 'all',
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();
  
  // Show loading state if permissions are still loading
  if (loading) {
    return <>{fallback}</>;
  }
  
  // Single permission check
  if (permission && permissions.length === 0) {
    return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
  }
  
  // Multiple permissions check
  if (permissions.length > 0 && !permission) {
    const hasRequiredPermissions = mode === 'any' 
      ? hasAnyPermission(permissions)
      : hasAllPermissions(permissions);
    return hasRequiredPermissions ? <>{children}</> : <>{fallback}</>;
  }
  
  // Invalid usage - must specify either permission or permissions
  if (!permission && permissions.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('PermissionGuard: Must specify either "permission" or "permissions" prop');
    }
    return <>{fallback}</>;
  }
  
  return <>{fallback}</>;
}

/**
 * Specialized guards for common use cases
 */

export function AdminGuard({ children, fallback = null }: { 
  children: ReactNode; 
  fallback?: ReactNode; 
}) {
  return (
    <PermissionGuard
      permissions={['org:update', 'team:invite', 'billing:update']}
      mode="any"
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function BillingGuard({ children, fallback = null }: { 
  children: ReactNode; 
  fallback?: ReactNode; 
}) {
  return (
    <PermissionGuard
      permission="billing:view"
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function TeamManagementGuard({ children, fallback = null }: { 
  children: ReactNode; 
  fallback?: ReactNode; 
}) {
  return (
    <PermissionGuard
      permissions={['team:invite', 'team:remove', 'team:role:update']}
      mode="any"
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function CustomerManagementGuard({ children, fallback = null }: { 
  children: ReactNode; 
  fallback?: ReactNode; 
}) {
  return (
    <PermissionGuard
      permission="customer:view"
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}
