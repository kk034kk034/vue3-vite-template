<script setup lang="ts">
import { computed } from 'vue'
import { useAppI18n } from '@/shared/i18n'

const { t } = useAppI18n()

const metrics = computed(() => [
  { label: t('dashboard.onlineDevices'), value: '128', tone: 'good' },
  { label: t('dashboard.liveStreams'), value: '42', tone: 'good' },
  { label: t('dashboard.todayAlerts'), value: '7', tone: 'warn' },
  { label: t('dashboard.gatewayLoad'), value: '68%', tone: 'info' },
])

const events = computed(() => [t('dashboard.event1'), t('dashboard.event2'), t('dashboard.event3')])
</script>

<template>
  <section class="page-section">
    <div class="section-header">
      <div>
        <h2>{{ t('routes.dashboard') }}</h2>
        <p>{{ t('dashboard.subtitle') }}</p>
      </div>
    </div>

    <div class="metric-grid">
      <article v-for="item in metrics" :key="item.label" class="metric-card">
        <span :class="['status-dot', item.tone]"></span>
        <strong>{{ item.value }}</strong>
        <span>{{ item.label }}</span>
      </article>
    </div>

    <div class="data-panel">
      <div class="panel-title">{{ t('dashboard.recentEvents') }}</div>
      <ul class="event-list">
        <li v-for="event in events" :key="event">{{ event }}</li>
      </ul>
    </div>
  </section>
</template>
