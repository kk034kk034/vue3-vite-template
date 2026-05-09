<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppI18n } from '@/shared/i18n'
import { fetchMonitorStats, type MonitorStats } from '@/features/monitor/api'
import { fetchCameras } from '@/features/cameras/api'
import { fetchTokens } from '@/features/streams/api'

const { t } = useAppI18n()

const stats = ref<MonitorStats | null>(null)
const cameraCount = ref(0)
const tokenCount = ref(0)
const loading = ref(true)

async function loadData() {
  try {
    const [monitorRes, cameras, tokenRes] = await Promise.allSettled([
      fetchMonitorStats(),
      fetchCameras({ organization_id: 1 }),
      fetchTokens({ limit: 1 }),
    ])

    if (monitorRes.status === 'fulfilled') stats.value = monitorRes.value
    if (cameras.status === 'fulfilled') cameraCount.value = cameras.value.length
    if (tokenRes.status === 'fulfilled') tokenCount.value = tokenRes.value.total
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <section class="page-section">
    <div class="section-header">
      <div>
        <h2>{{ t('routes.dashboard') }}</h2>
        <p>{{ t('dashboard.subtitle') }}</p>
      </div>
    </div>

    <div v-if="loading" class="loading-text">載入中...</div>

    <template v-else>
      <!-- 核心指標 -->
      <div class="metric-grid">
        <article class="metric-card">
          <span class="status-dot good"></span>
          <strong>{{ cameraCount }}</strong>
          <span>{{ t('dashboard.onlineDevices') }}</span>
        </article>
        <article class="metric-card">
          <span class="status-dot good"></span>
          <strong>{{ stats?.concurrent_viewers ?? 0 }}</strong>
          <span>{{ t('dashboard.totalViewers') }}</span>
        </article>
        <article class="metric-card">
          <span :class="['status-dot', stats?.alerts?.length ? 'warn' : 'good']"></span>
          <strong>{{ stats?.alerts?.length ?? 0 }}</strong>
          <span>{{ t('dashboard.todayAlerts') }}</span>
        </article>
        <article class="metric-card">
          <span class="status-dot info"></span>
          <strong>{{ stats?.cpu_percent != null ? `${stats.cpu_percent.toFixed(1)}%` : '—' }}</strong>
          <span>{{ t('dashboard.cpuUsage') }}</span>
        </article>
        <article class="metric-card">
          <span class="status-dot info"></span>
          <strong>{{ stats?.memory_percent != null ? `${stats.memory_percent.toFixed(1)}%` : '—' }}</strong>
          <span>{{ t('dashboard.memUsage') }}</span>
        </article>
        <article class="metric-card">
          <span class="status-dot good"></span>
          <strong>{{ tokenCount }}</strong>
          <span>串流 Token 總數</span>
        </article>
      </div>

      <!-- 告警面板 -->
      <div class="data-panel">
        <div class="panel-title">{{ t('monitor.alerts') }}</div>
        <div v-if="!stats?.alerts?.length" class="no-alerts">
          ✓ {{ t('monitor.noAlerts') }}
        </div>
        <ul v-else class="event-list">
          <li v-for="a in stats!.alerts" :key="a.metric" class="alert-item">
            <span class="alert-dot"></span>
            {{ a.metric }} 當前值 {{ a.value }} 超過門檻 {{ a.threshold }}
          </li>
        </ul>
      </div>

      <!-- 即時串流狀態 -->
      <div class="data-panel">
        <div class="panel-title">{{ t('dashboard.liveStreams') }}（{{ stats?.stream_count ?? 0 }} 路）</div>
        <div v-if="!stats?.streams?.length" class="no-alerts">目前無活躍串流。</div>
        <ul v-else class="event-list">
          <li v-for="s in stats!.streams.slice(0, 5)" :key="s.stream_key">
            <code>{{ s.stream_key }}</code>
            ｜ 觀看 {{ s.viewers }} 人 ｜ {{ s.recv_kbps }} kbps
          </li>
        </ul>
      </div>
    </template>
  </section>
</template>

<style scoped>
.loading-text {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted, #9ca3af);
}

.data-panel {
  background: var(--surface, #fff);
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 8px;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
}

.panel-title {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.no-alerts {
  color: var(--text-muted, #6b7280);
  font-size: 0.875rem;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #b91c1c;
  font-size: 0.875rem;
  padding: 0.3rem 0;
}

.alert-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ef4444;
  flex-shrink: 0;
}

.event-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.event-list li {
  padding: 0.3rem 0;
  font-size: 0.875rem;
  border-bottom: 1px solid var(--border, #f3f4f6);
}

.event-list li:last-child {
  border-bottom: none;
}
</style>
