import type { RouteRecordRaw } from 'vue-router'

export const appRoutes: RouteRecordRaw[] = [
  {
    path: 'dashboard',
    name: 'dashboard',
    component: () => import('@/features/dashboard/DashboardView.vue'),
    meta: {
      titleKey: 'routes.dashboard',
      icon: 'data',
      roles: ['admin', 'operator'],
    },
  },
  {
    path: 'devices',
    name: 'devices',
    component: () => import('@/features/devices/DevicesView.vue'),
    meta: {
      titleKey: 'routes.devices',
      icon: 'device',
      roles: ['admin', 'operator'],
    },
  },
  {
    path: 'cameras',
    name: 'cameras',
    component: () => import('@/features/cameras/CamerasView.vue'),
    meta: {
      titleKey: 'routes.cameras',
      icon: 'video',
      roles: ['admin', 'operator'],
    },
  },
  {
    path: 'streams',
    name: 'streams',
    component: () => import('@/features/streams/StreamsView.vue'),
    meta: {
      titleKey: 'routes.streams',
      icon: 'link',
      roles: ['admin', 'operator'],
    },
  },
  {
    path: 'playback',
    name: 'playback',
    component: () => import('@/features/playback/PlaybackView.vue'),
    meta: {
      titleKey: 'routes.playback',
      icon: 'playback',
      roles: ['admin', 'operator'],
    },
  },
  {
    path: 'rbac',
    name: 'rbac',
    component: () => import('@/features/rbac/RbacView.vue'),
    meta: {
      titleKey: 'routes.rbac',
      icon: 'lock',
      roles: ['admin'],
    },
  },
  {
    path: 'report',
    name: 'report',
    component: () => import('@/features/report/ReportView.vue'),
    meta: {
      titleKey: 'routes.report',
      icon: 'report',
      roles: ['admin', 'operator'],
    },
  },
  {
    path: 'monitor',
    name: 'monitor',
    component: () => import('@/features/monitor/MonitorView.vue'),
    meta: {
      titleKey: 'routes.monitor',
      icon: 'monitor',
      roles: ['admin'],
    },
  },
]
