import 'vue-router'

export type AppRole = 'admin' | 'operator' | 'viewer'

declare module 'vue-router' {
  interface RouteMeta {
    titleKey?: string
    icon?: string
    roles?: AppRole[]
    permissions?: string[]
  }
}
