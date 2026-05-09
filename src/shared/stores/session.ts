import { defineStore } from 'pinia'
import type { AppRole } from '@/router/types'

type UserSession = {
  name: string
  email: string
  roles: AppRole[]
  permissions: string[]
  accessToken: string | null
  refreshToken: string | null
}

const defaultSession: UserSession = {
  name: '',
  email: '',
  roles: [],
  permissions: [],
  accessToken: null,
  refreshToken: null,
}

export const useSessionStore = defineStore('session', {
  state: (): { user: UserSession } => ({
    user: {
      ...defaultSession,
      // 開發期間從 localStorage 恢復 token（重整不用重登）
      accessToken: localStorage.getItem('accessToken'),
      refreshToken: localStorage.getItem('refreshToken'),
      name: localStorage.getItem('userName') || '',
      email: localStorage.getItem('userEmail') || '',
      roles: (localStorage.getItem('userRoles')?.split(',') as AppRole[]) || [],
      permissions: [],
    },
  }),
  getters: {
    isLoggedIn: (state) => !!state.user.accessToken,
    roles: (state): AppRole[] => state.user.roles,
    can: (state) => (permission: string) => state.user.permissions.includes(permission),
  },
  actions: {
    setSession(payload: {
      accessToken: string
      refreshToken: string
      name: string
      email: string
      roles?: AppRole[]
    }) {
      this.user.accessToken = payload.accessToken
      this.user.refreshToken = payload.refreshToken
      this.user.name = payload.name
      this.user.email = payload.email
      this.user.roles = payload.roles ?? ['admin']
      localStorage.setItem('accessToken', payload.accessToken)
      localStorage.setItem('refreshToken', payload.refreshToken)
      localStorage.setItem('userName', payload.name)
      localStorage.setItem('userEmail', payload.email)
      localStorage.setItem('userRoles', (payload.roles ?? ['admin']).join(','))
    },
    clearSession() {
      this.user = { ...defaultSession }
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userName')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userRoles')
    },
  },
})
