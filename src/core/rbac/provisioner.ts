import type { Prisma, PrismaClient } from '@prisma/client'

import { SYSTEM_ROLE_TEMPLATE_LIST } from './default-roles'

type ProvisioningClient = Prisma.TransactionClient | PrismaClient

const SYSTEM_PERMISSION_KEYS = (() => {
  const keys = new Set<string>()

  for (const template of SYSTEM_ROLE_TEMPLATE_LIST) {
    for (const permission of template.permissions) {
      keys.add(permission)
    }
  }

  return Array.from(keys)
})()

async function ensureSystemRoles(companyId: string, tx: ProvisioningClient) {
  const roleIdBySlug = new Map<string, string>()

  for (const template of SYSTEM_ROLE_TEMPLATE_LIST) {
    const updateData: Prisma.RoleModelUncheckedUpdateInput = {
      name: template.name,
      description: template.description,
      isSystem: template.isSystem,
      slug: template.slug
    }

    const createData: Prisma.RoleModelUncheckedCreateInput = {
      name: template.name,
      description: template.description,
      isSystem: template.isSystem,
      slug: template.slug,
      companyId
    }

    const role = await tx.roleModel.upsert({
      where: {
        name_companyId: {
          name: template.name,
          companyId
        }
      },
      update: updateData,
      create: createData
    })

    roleIdBySlug.set(template.slug, role.id)
  }

  return roleIdBySlug
}

async function syncRolePermissions(roleIdsBySlug: Map<string, string>, tx: ProvisioningClient) {
  const permissionRecords = await tx.permission.findMany({
    where: {
      key: {
        in: SYSTEM_PERMISSION_KEYS
      }
    },
    select: {
      id: true,
      key: true
    }
  })

  const permissionIdByKey = new Map(permissionRecords.map((record) => [record.key, record.id]))

  const missingPermissions = SYSTEM_PERMISSION_KEYS.filter((key) => !permissionIdByKey.has(key))

  if (missingPermissions.length > 0) {
    throw new Error(`Missing permission definitions for keys: ${missingPermissions.join(', ')}`)
  }

  for (const template of SYSTEM_ROLE_TEMPLATE_LIST) {
    const roleId = roleIdsBySlug.get(template.slug)

    if (!roleId) {
      throw new Error(`Unable to determine role ID for slug ${template.slug}`)
    }

    const permissionIds = template.permissions.map((permissionKey) => permissionIdByKey.get(permissionKey)!)

    await tx.roleModel.update({
      where: { id: roleId },
      data: {
        permissions: {
          set: permissionIds.map((id) => ({ id }))
        }
      }
    })
  }
}

export async function provisionSystemRolesForCompany(companyId: string, tx: ProvisioningClient) {
  if (!companyId) {
    throw new Error('companyId is required to provision system roles')
  }

  if (!tx) {
    throw new Error('Prisma transaction client is required to provision system roles')
  }

  const roleIdsBySlug = await ensureSystemRoles(companyId, tx)

  await syncRolePermissions(roleIdsBySlug, tx)

  return {
    companyId,
    roles: SYSTEM_ROLE_TEMPLATE_LIST.map((template) => {
      const roleId = roleIdsBySlug.get(template.slug)

      if (!roleId) {
        throw new Error(`Role ID missing for template ${template.slug}`)
      }

      return {
        key: template.key,
        slug: template.slug,
        roleId
      }
    })
  }
}
