import { request } from '@/shared/api/http'
import type { AppRole } from '@/router/types'

export type RolePolicy = {
  id: AppRole
  name: string
  scope: 'global' | 'site' | 'device'
  permissions: string[]
}

export function listRolePolicies() {
  return request<RolePolicy[]>({
    method: 'GET',
    url: '/rbac/roles',
  })
}
