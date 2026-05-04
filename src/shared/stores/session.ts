import { defineStore } from 'pinia'
import type { AppRole } from '@/router/types'

type UserSession = {
  name: string
  roles: AppRole[]
  permissions: string[]
}

const defaultSession: UserSession = {
  name: 'Admin',
  roles: ['admin'],
  permissions: ['devices:write', 'streams:read', 'rbac:write'],
}

export const useSessionStore = defineStore('session', {
  state: () => ({
    user: defaultSession,
  }),
  getters: {
    roles: (state): AppRole[] => state.user.roles,
    can: (state) => (permission: string) => state.user.permissions.includes(permission),
  },
})
