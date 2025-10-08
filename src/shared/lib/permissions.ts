/**
 * RBAC Permission System
 * 
 * This file defines all available permissions in the system.
 * Permissions follow the pattern: resource:action
 */

export const PERMISSIONS = {
  // Organization Management
  ORG_VIEW: 'org:view',
  ORG_UPDATE: 'org:update', 
  ORG_DELETE: 'org:delete',
  ORG_SETTINGS: 'org:settings',

  // Billing Management
  BILLING_VIEW: 'billing:view',
  BILLING_UPDATE: 'billing:update',
  BILLING_PORTAL: 'billing:portal',
  BILLING_INVOICES: 'billing:invoices',

  // Team Management
  TEAM_VIEW: 'team:view',
  TEAM_INVITE: 'team:invite',
  TEAM_REMOVE: 'team:remove',
  TEAM_ROLE_UPDATE: 'team:role:update',
  TEAM_SETTINGS: 'team:settings',

  // Customer Management
  CUSTOMER_CREATE: 'customer:create',
  CUSTOMER_VIEW: 'customer:view',
  CUSTOMER_UPDATE: 'customer:update',
  CUSTOMER_DELETE: 'customer:delete',
  CUSTOMER_EXPORT: 'customer:export',

  // API Key Management
  API_KEY_CREATE: 'api_key:create',
  API_KEY_VIEW: 'api_key:view',
  API_KEY_DELETE: 'api_key:delete',

  // System Administration (for future admin features)
  SYSTEM_LOGS: 'system:logs',
  SYSTEM_HEALTH: 'system:health',
  SYSTEM_IMPERSONATE: 'system:impersonate',

  // Role Management
  ROLE_CREATE: 'role:create',
  ROLE_VIEW: 'role:view',
  ROLE_UPDATE: 'role:update',
  ROLE_DELETE: 'role:delete',
  ROLE_ASSIGN: 'role:assign',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

/**
 * Permission Categories for UI grouping
 */
export const PERMISSION_CATEGORIES = {
  ORGANIZATION: 'Organization',
  BILLING: 'Billing',
  TEAM: 'Team',
  CUSTOMERS: 'Customers',
  API: 'API',
  SYSTEM: 'System',
  ROLES: 'Roles',
} as const;

export type PermissionCategory = typeof PERMISSION_CATEGORIES[keyof typeof PERMISSION_CATEGORIES];

/**
 * Permission definitions with metadata
 */
export const PERMISSION_DEFINITIONS: Record<Permission, {
  name: string;
  description: string;
  category: PermissionCategory;
  isSystem?: boolean;
}> = {
  // Organization
  [PERMISSIONS.ORG_VIEW]: {
    name: 'View Organization',
    description: 'View organization details and settings',
    category: PERMISSION_CATEGORIES.ORGANIZATION,
  },
  [PERMISSIONS.ORG_UPDATE]: {
    name: 'Update Organization',
    description: 'Update organization name, settings, and configuration',
    category: PERMISSION_CATEGORIES.ORGANIZATION,
  },
  [PERMISSIONS.ORG_DELETE]: {
    name: 'Delete Organization',
    description: 'Delete the organization (dangerous operation)',
    category: PERMISSION_CATEGORIES.ORGANIZATION,
  },
  [PERMISSIONS.ORG_SETTINGS]: {
    name: 'Manage Organization Settings',
    description: 'Access and modify organization-wide settings',
    category: PERMISSION_CATEGORIES.ORGANIZATION,
  },

  // Billing
  [PERMISSIONS.BILLING_VIEW]: {
    name: 'View Billing',
    description: 'View billing information, invoices, and subscription status',
    category: PERMISSION_CATEGORIES.BILLING,
  },
  [PERMISSIONS.BILLING_UPDATE]: {
    name: 'Update Billing',
    description: 'Update payment methods and billing information',
    category: PERMISSION_CATEGORIES.BILLING,
  },
  [PERMISSIONS.BILLING_PORTAL]: {
    name: 'Access Billing Portal',
    description: 'Access Stripe customer portal for self-service billing',
    category: PERMISSION_CATEGORIES.BILLING,
  },
  [PERMISSIONS.BILLING_INVOICES]: {
    name: 'Download Invoices',
    description: 'Download and view detailed billing invoices',
    category: PERMISSION_CATEGORIES.BILLING,
  },

  // Team
  [PERMISSIONS.TEAM_VIEW]: {
    name: 'View Team',
    description: 'View team members and their roles',
    category: PERMISSION_CATEGORIES.TEAM,
  },
  [PERMISSIONS.TEAM_INVITE]: {
    name: 'Invite Team Members',
    description: 'Send invitations to new team members',
    category: PERMISSION_CATEGORIES.TEAM,
  },
  [PERMISSIONS.TEAM_REMOVE]: {
    name: 'Remove Team Members',
    description: 'Remove team members from the organization',
    category: PERMISSION_CATEGORIES.TEAM,
  },
  [PERMISSIONS.TEAM_ROLE_UPDATE]: {
    name: 'Update Team Roles',
    description: 'Change roles and permissions of team members',
    category: PERMISSION_CATEGORIES.TEAM,
  },
  [PERMISSIONS.TEAM_SETTINGS]: {
    name: 'Manage Team Settings',
    description: 'Configure team-wide settings and policies',
    category: PERMISSION_CATEGORIES.TEAM,
  },

  // Customers
  [PERMISSIONS.CUSTOMER_CREATE]: {
    name: 'Create Customers',
    description: 'Add new customers to the system',
    category: PERMISSION_CATEGORIES.CUSTOMERS,
  },
  [PERMISSIONS.CUSTOMER_VIEW]: {
    name: 'View Customers',
    description: 'View customer information and details',
    category: PERMISSION_CATEGORIES.CUSTOMERS,
  },
  [PERMISSIONS.CUSTOMER_UPDATE]: {
    name: 'Update Customers',
    description: 'Edit customer information and details',
    category: PERMISSION_CATEGORIES.CUSTOMERS,
  },
  [PERMISSIONS.CUSTOMER_DELETE]: {
    name: 'Delete Customers',
    description: 'Remove customers from the system',
    category: PERMISSION_CATEGORIES.CUSTOMERS,
  },
  [PERMISSIONS.CUSTOMER_EXPORT]: {
    name: 'Export Customer Data',
    description: 'Export customer data for reporting and analysis',
    category: PERMISSION_CATEGORIES.CUSTOMERS,
  },

  // API Keys
  [PERMISSIONS.API_KEY_CREATE]: {
    name: 'Create API Keys',
    description: 'Generate new API keys for integrations',
    category: PERMISSION_CATEGORIES.API,
  },
  [PERMISSIONS.API_KEY_VIEW]: {
    name: 'View API Keys',
    description: 'View existing API keys and their permissions',
    category: PERMISSION_CATEGORIES.API,
  },
  [PERMISSIONS.API_KEY_DELETE]: {
    name: 'Delete API Keys',
    description: 'Revoke and delete API keys',
    category: PERMISSION_CATEGORIES.API,
  },

  // System (for future admin features)
  [PERMISSIONS.SYSTEM_LOGS]: {
    name: 'View System Logs',
    description: 'Access system logs and audit trails',
    category: PERMISSION_CATEGORIES.SYSTEM,
    isSystem: true,
  },
  [PERMISSIONS.SYSTEM_HEALTH]: {
    name: 'View System Health',
    description: 'Monitor system health and performance metrics',
    category: PERMISSION_CATEGORIES.SYSTEM,
    isSystem: true,
  },
  [PERMISSIONS.SYSTEM_IMPERSONATE]: {
    name: 'Impersonate Users',
    description: 'Impersonate users for support purposes',
    category: PERMISSION_CATEGORIES.SYSTEM,
    isSystem: true,
  },

  // Roles
  [PERMISSIONS.ROLE_CREATE]: {
    name: 'Create Roles',
    description: 'Create custom roles with specific permissions',
    category: PERMISSION_CATEGORIES.ROLES,
  },
  [PERMISSIONS.ROLE_VIEW]: {
    name: 'View Roles',
    description: 'View existing roles and their permissions',
    category: PERMISSION_CATEGORIES.ROLES,
  },
  [PERMISSIONS.ROLE_UPDATE]: {
    name: 'Update Roles',
    description: 'Modify role permissions and settings',
    category: PERMISSION_CATEGORIES.ROLES,
  },
  [PERMISSIONS.ROLE_DELETE]: {
    name: 'Delete Roles',
    description: 'Delete custom roles (system roles cannot be deleted)',
    category: PERMISSION_CATEGORIES.ROLES,
  },
  [PERMISSIONS.ROLE_ASSIGN]: {
    name: 'Assign Roles',
    description: 'Assign roles to team members',
    category: PERMISSION_CATEGORIES.ROLES,
  },
};

/**
 * Default role permission mappings
 * These will be used to create system roles during migration
 */
export const DEFAULT_ROLE_PERMISSIONS = {
  OWNER: [
    // Full access to everything
    ...Object.values(PERMISSIONS),
  ],
  ADMIN: [
    // Organization management (except delete)
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.ORG_UPDATE,
    PERMISSIONS.ORG_SETTINGS,
    
    // Full billing access
    PERMISSIONS.BILLING_VIEW,
    PERMISSIONS.BILLING_UPDATE,
    PERMISSIONS.BILLING_PORTAL,
    PERMISSIONS.BILLING_INVOICES,
    
    // Full team management
    PERMISSIONS.TEAM_VIEW,
    PERMISSIONS.TEAM_INVITE,
    PERMISSIONS.TEAM_REMOVE,
    PERMISSIONS.TEAM_ROLE_UPDATE,
    PERMISSIONS.TEAM_SETTINGS,
    
    // Full customer management
    PERMISSIONS.CUSTOMER_CREATE,
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.CUSTOMER_UPDATE,
    PERMISSIONS.CUSTOMER_DELETE,
    PERMISSIONS.CUSTOMER_EXPORT,
    
    // API key management
    PERMISSIONS.API_KEY_CREATE,
    PERMISSIONS.API_KEY_VIEW,
    PERMISSIONS.API_KEY_DELETE,
    
    // Role management
    PERMISSIONS.ROLE_CREATE,
    PERMISSIONS.ROLE_VIEW,
    PERMISSIONS.ROLE_UPDATE,
    PERMISSIONS.ROLE_DELETE,
    PERMISSIONS.ROLE_ASSIGN,
  ],
  MEMBER: [
    // Basic organization access
    PERMISSIONS.ORG_VIEW,
    
    // View billing
    PERMISSIONS.BILLING_VIEW,
    
    // Basic team access
    PERMISSIONS.TEAM_VIEW,
    
    // Customer management
    PERMISSIONS.CUSTOMER_CREATE,
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.CUSTOMER_UPDATE,
    
    // View roles
    PERMISSIONS.ROLE_VIEW,
  ],
  VIEWER: [
    // Read-only access
    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.BILLING_VIEW,
    PERMISSIONS.TEAM_VIEW,
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.ROLE_VIEW,
  ],
} as const;

/**
 * Helper Functions for Permission Checking
 */

/**
 * Check if user has a specific permission
 */
export function checkPermission(userPermissions: string[], requiredPermission: string): boolean {
  if (!requiredPermission) return false;
  if (userPermissions.includes('*')) return true; // Wildcard permission
  return userPermissions.includes(requiredPermission);
}

/**
 * Check if user has ANY of the required permissions
 */
export function hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
  if (requiredPermissions.length === 0) return true;
  if (userPermissions.includes('*')) return true;
  return requiredPermissions.some(permission => userPermissions.includes(permission));
}

/**
 * Check if user has ALL of the required permissions
 */
export function hasAllPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
  if (requiredPermissions.length === 0) return true;
  if (userPermissions.includes('*')) return true;
  return requiredPermissions.every(permission => userPermissions.includes(permission));
}
