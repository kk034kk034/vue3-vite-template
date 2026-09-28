import 'vue-router'

export type AppRole = 'admin' | 'operator' | 'viewer'

declare module 'vue-router' {
  interface RouteMeta {
    titleKey?: string
    icon?: string
    roles?: AppRole[]
    permissions?: string[]
    /** 不需登入即可進入，給市民服務入口與登入頁使用。 */
    public?: boolean
  }
}
