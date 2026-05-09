<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppI18n } from '@/shared/i18n'
import { fetchLogs, buildExportUrl, type AccessLog, type LogQuery } from './api'
import { fetchCameras } from '@/features/cameras/api'
import { fetchCameraGroups } from '@/features/cameras/api'
import type { Camera, CameraGroup } from '@/features/cameras/api'

const { t } = useAppI18n()

const logs = ref<AccessLog[]>([])
const total = ref(0)
const loading = ref(false)
const cameras = ref<Camera[]>([])
const groups = ref<CameraGroup[]>([])

const query = ref<LogQuery>({
  start_date: '',
  end_date: '',
  camera_id: undefined,
  camera_group_id: undefined,
  action: '',
  page: 1,
  limit: 50,
})

const ACTION_OPTIONS = [
  'token_create',
  'token_enable',
  'token_disable',
  'token_delete',
  'stream_play',
  'camera_create',
  'camera_update',
  'camera_delete',
  'group_create',
  'group_update',
  'group_delete',
  'permission_change',
]

async function loadLogs() {
  loading.value = true
  try {
    const params: LogQuery = { ...query.value }
    if (!params.start_date) delete params.start_date
    if (!params.end_date) delete params.end_date
    if (!params.camera_id) delete params.camera_id
    if (!params.camera_group_id) delete params.camera_group_id
    if (!params.action) delete params.action

    const res = await fetchLogs(params)
    logs.value = res.logs
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function doExport(format: 'xlsx' | 'csv') {
  const params: LogQuery & { format: 'xlsx' | 'csv' } = { ...query.value, format }
  if (!params.start_date) delete params.start_date
  if (!params.end_date) delete params.end_date
  if (!params.camera_id) delete params.camera_id
  if (!params.camera_group_id) delete params.camera_group_id
  if (!params.action) delete params.action
  window.open(buildExportUrl(params), '_blank')
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('zh-TW')
}

function prevPage() {
  if ((query.value.page ?? 1) > 1) {
    query.value.page = (query.value.page ?? 1) - 1
    loadLogs()
  }
}

function nextPage() {
  const limit = query.value.limit ?? 50
  if ((query.value.page ?? 1) * limit < total.value) {
    query.value.page = (query.value.page ?? 1) + 1
    loadLogs()
  }
}

onMounted(async () => {
  ;[cameras.value, groups.value] = await Promise.all([
    fetchCameras({ organization_id: 1 }),
    fetchCameraGroups({ organization_id: 1 }),
  ])
  await loadLogs()
})
</script>

<template>
  <section class="page-section">
    <div class="section-header">
      <div>
        <h2>{{ t('routes.report') }}</h2>
        <p>{{ t('report.subtitle') }}</p>
      </div>
      <div class="button-row">
        <button class="button secondary" type="button" @click="doExport('csv')">
          {{ t('report.exportCsv') }}
        </button>
        <button class="button primary" type="button" @click="doExport('xlsx')">
          {{ t('report.exportXlsx') }}
        </button>
      </div>
    </div>

    <!-- 篩選列 -->
    <div class="filter-bar">
      <label class="filter-item">
        {{ t('report.startDate') }}
        <input v-model="query.start_date" type="date" />
      </label>
      <label class="filter-item">
        {{ t('report.endDate') }}
        <input v-model="query.end_date" type="date" />
      </label>
      <label class="filter-item">
        {{ t('report.selectCamera') }}
        <select v-model="query.camera_id">
          <option :value="undefined">全部</option>
          <option v-for="c in cameras" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </label>
      <label class="filter-item">
        {{ t('report.selectGroup') }}
        <select v-model="query.camera_group_id">
          <option :value="undefined">全部</option>
          <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</option>
        </select>
      </label>
      <label class="filter-item">
        {{ t('report.selectAction') }}
        <select v-model="query.action">
          <option value="">{{ t('report.allActions') }}</option>
          <option v-for="a in ACTION_OPTIONS" :key="a" :value="a">{{ a }}</option>
        </select>
      </label>
      <button class="button primary" type="button" @click="loadLogs">{{ t('common.query') }}</button>
    </div>

    <!-- 結果表格 -->
    <div class="table-wrap">
      <div v-if="loading" class="loading-text">載入中...</div>
      <table v-else>
        <thead>
          <tr>
            <th>{{ t('report.time') }}</th>
            <th>{{ t('report.action') }}</th>
            <th>{{ t('report.user') }}</th>
            <th>{{ t('report.camera') }}</th>
            <th>{{ t('report.cameraGroup') }}</th>
            <th>{{ t('report.ipAddr') }}</th>
            <th>{{ t('report.detail') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id">
            <td class="nowrap">{{ formatTime(log.created_at) }}</td>
            <td><span class="pill">{{ log.action }}</span></td>
            <td>{{ log.user ? log.user.username : '—' }}</td>
            <td>{{ log.camera ? log.camera.name : '—' }}</td>
            <td>{{ log.camera_group ? log.camera_group.name : '—' }}</td>
            <td>{{ log.ip_addr || '—' }}</td>
            <td class="desc-cell">{{ log.description || '—' }}</td>
          </tr>
          <tr v-if="logs.length === 0">
            <td colspan="7" class="empty-row">無符合條件的記錄。</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分頁 -->
    <div class="pagination">
      <span>共 {{ total }} 筆</span>
      <button class="button secondary small" :disabled="(query.page ?? 1) <= 1" @click="prevPage">上一頁</button>
      <span>第 {{ query.page }} 頁</span>
      <button
        class="button secondary small"
        :disabled="(query.page ?? 1) * (query.limit ?? 50) >= total"
        @click="nextPage"
      >
        下一頁
      </button>
    </div>
  </section>
</template>

<style scoped>
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: flex-end;
  margin-bottom: 1rem;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.8rem;
}

.filter-item input,
.filter-item select {
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0.3rem 0.5rem;
  font-size: 0.875rem;
}

.nowrap {
  white-space: nowrap;
}

.desc-cell {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-row {
  text-align: center;
  color: var(--text-muted, #9ca3af);
  padding: 2rem 0;
}

.loading-text {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted, #9ca3af);
}

.pagination {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  font-size: 0.875rem;
}

.button.small {
  padding: 0.25rem 0.75rem;
  font-size: 0.8rem;
}
</style>
