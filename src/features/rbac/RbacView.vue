<script setup lang="ts">
import { computed } from 'vue'
import { useAppI18n } from '@/shared/i18n'

const { t } = useAppI18n()

const roles = computed(() => [
  { role: 'Admin', scope: t('rbac.global'), users: 3, permissions: 'all:*' },
  { role: 'Operator', scope: t('rbac.site'), users: 12, permissions: 'streams:read, devices:write' },
  { role: 'Viewer', scope: t('rbac.device'), users: 28, permissions: 'streams:read' },
])
</script>

<template>
  <section class="page-section">
    <div class="section-header">
      <div>
        <h2>{{ t('routes.rbac') }}</h2>
        <p>{{ t('rbac.subtitle') }}</p>
      </div>
      <button class="button primary" type="button">{{ t('rbac.add') }}</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{{ t('rbac.role') }}</th>
            <th>{{ t('rbac.scope') }}</th>
            <th>{{ t('rbac.users') }}</th>
            <th>{{ t('rbac.permissions') }}</th>
            <th>{{ t('common.edit') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in roles" :key="item.role">
            <td>{{ item.role }}</td>
            <td>{{ item.scope }}</td>
            <td>{{ item.users }}</td>
            <td>{{ item.permissions }}</td>
            <td><button class="text-button" type="button">{{ t('common.edit') }}</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
