<script setup lang="ts">
import { computed, watch } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { Bell, LogOut, Search, Settings } from 'lucide-vue-next'
import { appRoutes } from '@/routes/appRoutes'
import { useAppI18n } from '@/shared/i18n'
import { useSessionStore } from '@/shared/stores/session'

const route = useRoute()
const session = useSessionStore()
const { locale, localeOptions, t } = useAppI18n()

const visibleRoutes = computed(() => {
  return appRoutes.filter((item) => {
    const roles = item.meta?.roles
    return !roles || roles.some((role) => session.roles.includes(role))
  })
})

const pageTitle = computed(() => t(route.meta?.titleKey || 'routes.dashboard'))

watch(
  [pageTitle, locale],
  () => {
    document.title = `${pageTitle.value} | LN HEO`
  },
  { immediate: true },
)
</script>

<template>
  <div class="admin-shell">
    <aside class="sidebar">
      <RouterLink class="brand" to="/dashboard">
        <span class="brand-mark">LH</span>
        <span>
          <strong>{{ t('app.name') }}</strong>
          <small>{{ t('app.product') }}</small>
        </span>
      </RouterLink>

      <nav class="side-nav" aria-label="Primary">
        <RouterLink
          v-for="item in visibleRoutes"
          :key="item.name"
          class="nav-item"
          :to="{ name: item.name }"
        >
          <span class="nav-icon" :data-icon="item.meta?.icon"></span>
          <span>{{ t(item.meta?.titleKey || '') }}</span>
        </RouterLink>
      </nav>
    </aside>

    <div class="workspace">
      <header class="topbar">
        <div class="page-heading">
          <span>{{ t('app.name') }}</span>
          <h1>{{ pageTitle }}</h1>
        </div>

        <div class="topbar-actions">
          <label class="search-box">
            <Search :size="16" />
            <input type="search" :placeholder="t('app.search')" />
          </label>
          <select v-model="locale" class="language-select" :aria-label="t('app.language')">
            <option v-for="item in localeOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
          <button class="icon-button" type="button" :title="t('dashboard.todayAlerts')">
            <Bell :size="17" />
          </button>
          <button class="icon-button" type="button" :title="t('app.settings')">
            <Settings :size="17" />
          </button>
          <button class="user-button" type="button">
            <span>{{ session.user.name }}</span>
            <LogOut :size="15" />
          </button>
        </div>
      </header>

      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>
