<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAppI18n } from '@/shared/i18n'
import {
  fetchMonitorStats,
  fetchThresholds,
  saveThreshold,
  type MonitorStats,
  type AlertThreshold,
  type MetricName,
} from './api'

const { t } = useAppI18n()

const stats = ref<MonitorStats | null>(null)
const thresholds = ref<AlertThreshold[]>([])
const loading = ref(false)
const thresholdLoading = ref(false)
let pollTimer: ReturnType<typeof setInterval> | null = null

// 新增門檻表單
const newThreshold = ref<{ metric_name: MetricName; threshold_value: number }>({
  metric_name: 'cpu_percent',
  threshold_value: 80,
})

const METRIC_OPTIONS: { value: MetricName; label: string }[] = [
  { value: 'cpu_percent', label: 'CPU 使用率 (%)' },
  { value: 'memory_percent', label: '記憶體使用率 (%)' },
  { value: 'concurrent_viewers', label: '同時觀看人數' },
  { value: 'bitrate_kbps', label: '總流量 (kbps)' },
]

async function loadStats() {
  try {
    stats.value = await fetchMonitorStats()
  } catch {
    // SRS 未啟動時靜默
  }
}

async function loadThresholds() {
  thresholds.value = await fetchThresholds()
}

async function addThreshold() {
  thresholdLoading.value = true
  try {
    await saveThreshold(newThreshold.value)
    await loadThresholds()
  } finally {
    thresholdLoading.value = false
  }
}

function pct(v: number | null) {
  if (v === null) return '—'
  return `${v.toFixed(1)}%`
}

function alertClass(alerts: MonitorStats['alerts'], metric: string) {
  return alerts?.some((a) => a.metric === metric) ? 'metric-alert' : ''
}

onMounted(async () => {
  loading.value = true
  await Promise.all([loadStats(), loadThresholds()])
  loading.value = false
  pollTimer = setInterval(loadStats, 30000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>

<template>
  <section class="page-section">
    <div class="section-header">
      <div>
        <h2>{{ t('routes.monitor') }}</h2>
        <p>{{ t('monitor.subtitle') }}</p>
      </div>
    </div>

    <div v-if="loading" class="loading-text">載入中...</div>

    <template v-else-if="stats">
      <!-- 指標卡片 -->
      <div class="metric-grid">
        <article :class="['metric-card', alertClass(stats.alerts, 'cpu_percent')]">
          <strong>{{ pct(stats.cpu_percent) }}</strong>
          <span>{{ t('monitor.cpu') }}</span>
        </article>
        <article :class="['metric-card', alertClass(stats.alerts, 'memory_percent')]">
          <strong>{{ pct(stats.memory_percent) }}</strong>
          <span>{{ t('monitor.memory') }}</span>
        </article>
        <article :class="['metric-card', alertClass(stats.alerts, 'concurrent_viewers')]">
          <strong>{{ stats.concurrent_viewers }}</strong>
          <span>{{ t('monitor.viewers') }}</span>
        </article>
        <article :class="['metric-card', alertClass(stats.alerts, 'bitrate_kbps')]">
          <strong>{{ stats.total_bitrate_kbps.toLocaleString() }} kbps</strong>
          <span>{{ t('monitor.bitrate') }}</span>
        </article>
        <article class="metric-card">
          <strong>{{ stats.stream_count }}</strong>
          <span>{{ t('monitor.streamCount') }}</span>
        </article>
      </div>

      <!-- 告警 -->
      <div class="data-panel">
        <div class="panel-title">{{ t('monitor.alerts') }}</div>
        <div v-if="stats.alerts.length === 0" class="no-alerts">{{ t('monitor.noAlerts') }}</div>
        <ul v-else class="alert-list">
          <li v-for="a in stats.alerts" :key="a.metric" class="alert-item">
            <span class="alert-dot"></span>
            {{ a.metric }} = {{ a.value }} (門檻 {{ a.threshold }})
          </li>
        </ul>
      </div>

      <!-- 各路串流 -->
      <div class="data-panel">
        <div class="panel-title">{{ t('monitor.streamTable') }}</div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{{ t('monitor.streamKey') }}</th>
                <th>{{ t('monitor.streamViewers') }}</th>
                <th>{{ t('monitor.recvKbps') }}</th>
                <th>{{ t('monitor.sendKbps') }}</th>
                <th>{{ t('monitor.aliveSeconds') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in stats.streams" :key="s.stream_key">
                <td><code>{{ s.stream_key }}</code></td>
                <td>{{ s.viewers }}</td>
                <td>{{ s.recv_kbps }}</td>
                <td>{{ s.send_kbps }}</td>
                <td>{{ s.alive_seconds }}</td>
              </tr>
              <tr v-if="stats.streams.length === 0">
                <td colspan="5" class="empty-row">目前無活躍串流。</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <div v-else class="empty-row">無法取得 SRS 監控資料，請確認 SRS 服務是否運行。</div>

    <!-- 告警門檻設定 -->
    <div class="data-panel">
      <div class="panel-title">{{ t('monitor.thresholds') }}</div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ t('monitor.metric') }}</th>
              <th>{{ t('monitor.threshold') }}</th>
              <th>{{ t('common.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="th in thresholds" :key="th.id">
              <td>{{ th.metric_name }}</td>
              <td>{{ th.threshold_value }}</td>
              <td>
                <span :class="['pill', th.is_active ? 'pill-good' : 'pill-warn']">
                  {{ th.is_active ? t('common.enable') : t('common.disable') }}
                </span>
              </td>
            </tr>
            <tr v-if="thresholds.length === 0">
              <td colspan="3" class="empty-row">尚無門檻設定。</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 新增門檻表單 -->
      <div class="threshold-form">
        <select v-model="newThreshold.metric_name">
          <option v-for="m in METRIC_OPTIONS" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
        <input
          v-model.number="newThreshold.threshold_value"
          type="number"
          min="0"
          :placeholder="t('monitor.threshold')"
        />
        <button
          class="button primary"
          type="button"
          :disabled="thresholdLoading"
          @click="addThreshold"
        >
          {{ t('monitor.saveThreshold') }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.loading-text {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted, #9ca3af);
}

.metric-alert {
  border: 2px solid #ef4444 !important;
  background: #fef2f2 !important;
}

.no-alerts {
  padding: 0.75rem 0;
  color: var(--text-muted, #9ca3af);
  font-size: 0.875rem;
}

.alert-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0;
  font-size: 0.875rem;
  color: #b91c1c;
}

.alert-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  flex-shrink: 0;
}

.empty-row {
  text-align: center;
  color: var(--text-muted, #9ca3af);
  padding: 1.5rem 0;
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
  color: var(--text, #111827);
}

.pill-good {
  background: #d1fae5;
  color: #065f46;
}

.pill-warn {
  background: #fef3c7;
  color: #92400e;
}

.threshold-form {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.threshold-form select,
.threshold-form input {
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0.3rem 0.5rem;
  font-size: 0.875rem;
}

.threshold-form input {
  width: 120px;
}
</style>
