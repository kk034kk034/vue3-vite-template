import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { appRoutes } from '@/routes/appRoutes'
import { t } from '@/shared/i18n'
import { useSessionStore } from '@/shared/stores/session'
import './types'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
  const routeTitle = to.meta?.titleKey ? t(to.meta.titleKey) : ''
  document.title = routeTitle ? `${routeTitle} | LN HEO` : 'LN HEO'
})

export default router
