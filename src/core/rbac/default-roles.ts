import { DEFAULT_ROLE_PERMISSIONS, type Permission } from '@/shared/lib/permissions'

export const SYSTEM_ROLE_SLUGS = {
  OWNER: 'system-owner',
  ADMIN: 'system-admin',
  MEMBER: 'system-member',
  VIEWER: 'system-viewer'
} as const

export type SystemRoleKey = keyof typeof SYSTEM_ROLE_SLUGS
export type SystemRoleSlug = (typeof SYSTEM_ROLE_SLUGS)[SystemRoleKey]

export interface SystemRoleTemplate {
  key: SystemRoleKey
  slug: SystemRoleSlug
  name: string
  description: string
  isSystem: true
  permissions: readonly Permission[]
}

export const SYSTEM_ROLE_TEMPLATES: Record<SystemRoleKey, SystemRoleTemplate> = {
  OWNER: {
    key: 'OWNER',
    slug: SYSTEM_ROLE_SLUGS.OWNER,
    name: 'Owner',
    description: 'Full access to all features and settings',
    isSystem: true,
    permissions: DEFAULT_ROLE_PERMISSIONS.OWNER
  },
  ADMIN: {
    key: 'ADMIN',
    slug: SYSTEM_ROLE_SLUGS.ADMIN,
    name: 'Admin',
    description: 'Administrative access with most permissions',
    isSystem: true,
    permissions: DEFAULT_ROLE_PERMISSIONS.ADMIN
  },
  MEMBER: {
    key: 'MEMBER',
    slug: SYSTEM_ROLE_SLUGS.MEMBER,
    name: 'Member',
    description: 'Standard member with core collaboration permissions',
    isSystem: true,
    permissions: DEFAULT_ROLE_PERMISSIONS.MEMBER
  },
  VIEWER: {
    key: 'VIEWER',
    slug: SYSTEM_ROLE_SLUGS.VIEWER,
    name: 'Viewer',
    description: 'Read-only access to organizational data',
    isSystem: true,
    permissions: DEFAULT_ROLE_PERMISSIONS.VIEWER
  }
} as const

export const SYSTEM_ROLE_KEYS = Object.keys(SYSTEM_ROLE_TEMPLATES) as SystemRoleKey[]
export const SYSTEM_ROLE_TEMPLATE_LIST = Object.values(SYSTEM_ROLE_TEMPLATES)
