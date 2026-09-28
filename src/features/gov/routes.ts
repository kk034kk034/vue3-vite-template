import type { RouteRecordRaw } from 'vue-router'
import GovLayout from './GovLayout.vue'

export const govRoutes: RouteRecordRaw = {
  path: '/services',
  component: GovLayout,
  meta: { public: true },
  children: [
    {
      path: '',
      name: 'gov-home',
      component: () => import('./views/HomeView.vue'),
    },
    {
      path: 'items/:serviceId',
      name: 'gov-service',
      component: () => import('./views/ServiceView.vue'),
    },
    {
      path: 'apply/:serviceId',
      name: 'gov-apply',
      component: () => import('./views/ApplyView.vue'),
    },
    {
      path: 'query',
      name: 'gov-query',
      component: () => import('./views/QueryView.vue'),
    },
    {
      path: 'cases/:caseId',
      name: 'gov-case',
      component: () => import('./views/CaseView.vue'),
    },
    {
      path: 'appointments',
      name: 'gov-appointments',
      component: () => import('./views/AppointmentView.vue'),
    },
    {
      path: 'fees',
      name: 'gov-fees',
      component: () => import('./views/FeeView.vue'),
    },
    {
      path: 'search',
      name: 'gov-search',
      component: () => import('./views/SearchView.vue'),
    },
    {
      path: 'faq',
      name: 'gov-faq',
      component: () => import('./views/FaqView.vue'),
    },
    {
      path: 'guide',
      name: 'gov-guide',
      component: () => import('./views/GuideView.vue'),
    },
    {
      path: 'accessibility',
      name: 'gov-accessibility',
      component: () => import('./views/StatementView.vue'),
    },
    {
      path: 'forms',
      name: 'gov-forms',
      component: () => import('./views/FormsView.vue'),
    },
    {
      path: 'forms/:formId',
      name: 'gov-form',
      component: () => import('./views/FormsView.vue'),
    },
  ],
}
