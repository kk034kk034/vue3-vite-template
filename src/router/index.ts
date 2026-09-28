import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { govRoutes } from '@/features/gov/routes'
import { govDocumentTitle } from '@/features/gov/title'
import { appRoutes } from '@/routes/appRoutes'
import { t } from '@/shared/i18n'
import { useSessionStore } from '@/shared/stores/session'
import './types'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    govRoutes,
    {
      path: '/',
      component: AdminLayout,
      redirect: '/dashboard',
      children: appRoutes,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard',
    },
  ],
})

router.beforeEach((to) => {
  const session = useSessionStore()
  const roles = to.meta?.roles
  const permissions = to.meta?.permissions
  const hasRole = !roles?.length || roles.some((role) => session.roles.includes(role))
  const hasPermission =
    !permissions?.length || permissions.every((permission) => session.can(permission))

  if (!hasRole || !hasPermission) {
    return { name: 'dashboard' }
  }
})

router.afterEach((to) => {
  const govTitle = govDocumentTitle(to)
  if (govTitle) {
    document.title = `${govTitle} | 示範市民服務`
    return
  }
  const routeTitle = to.meta?.titleKey ? t(to.meta.titleKey) : ''
  document.title = routeTitle ? `${routeTitle} | LN HEO` : 'LN HEO'
})

export default router
