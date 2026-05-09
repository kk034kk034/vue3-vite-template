<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppI18n } from '@/shared/i18n'
import {
  fetchTokens,
  createToken,
  enableToken,
  disableToken,
  deleteToken,
  type StreamToken,
  type TokenProtocol,
} from './api'
import { fetchCameras } from '@/features/cameras/api'
import type { Camera } from '@/features/cameras/api'

const { t } = useAppI18n()

const tokens = ref<StreamToken[]>([])
const total = ref(0)
const cameras = ref<Camera[]>([])
const loading = ref(false)
const showForm = ref(false)
const copiedId = ref<string | null>(null)

const form = ref({
  camera_id: '',
  protocol: 'all' as TokenProtocol,
  expires_in_hours: '',
  note: '',
})

const PROTOCOLS: { value: TokenProtocol; label: string }[] = [
  { value: 'all', label: t('streams.all') },
  { value: 'rtmp', label: 'RTMP' },
  { value: 'hls', label: 'HLS' },
  { value: 'mjpeg', label: 'M-JPEG' },
]

async function loadAll() {
  loading.value = true
  try {
    ;[cameras.value] = await Promise.all([fetchCameras({ organization_id: 1 })])
    const res = await fetchTokens({ limit: 50 })
    tokens.value = res.tokens
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function doCreate() {
  if (!form.value.camera_id) return
  await createToken({
    camera_id: Number(form.value.camera_id),
    protocol: form.value.protocol,
    expires_in_hours: form.value.expires_in_hours ? Number(form.value.expires_in_hours) : undefined,
    note: form.value.note || undefined,
  })
  showForm.value = false
  form.value = { camera_id: '', protocol: 'all', expires_in_hours: '', note: '' }
  await loadAll()
}

async function doEnable(id: number) {
  await enableToken(id)
  await loadAll()
}

async function doDisable(id: number) {
  await disableToken(id)
  await loadAll()
}

async function doDelete(id: number) {
  if (!confirm('確定刪除此 Token？刪除後 URL 立即失效。')) return
  await deleteToken(id)
  await loadAll()
}

function copyUrl(text: string, key: string) {
  navigator.clipboard.writeText(text)
  copiedId.value = key
  setTimeout(() => (copiedId.value = null), 1500)
}

function formatExpiry(token: StreamToken) {
  if (!token.expires_at) return t('streams.noExpiry')
  return new Date(token.expires_at).toLocaleString('zh-TW')
}

onMounted(loadAll)
</script>

<template>
  <section class="page-section">
    <div class="section-header">
      <div>
        <h2>{{ t('routes.streams') }}</h2>
        <p>{{ t('streams.subtitle') }}</p>
      </div>
      <button class="button primary" type="button" @click="showForm = true">
        {{ t('streams.addToken') }}
      </button>
    </div>

    <div v-if="loading" class="loading-text">載入中...</div>

    <!-- Token 列表 -->
    <div v-else class="token-list">
      <article v-for="tk in tokens" :key="tk.id" class="token-card">
        <div class="token-header">
          <div class="token-meta">
            <strong>{{ tk.camera?.name || `Camera #${tk.camera_id}` }}</strong>
            <span class="pill">{{ tk.protocol.toUpperCase() }}</span>
            <span :class="['pill', tk.is_enabled ? 'pill-good' : 'pill-warn']">
              {{ tk.is_enabled ? t('streams.enabled') : t('streams.disabled') }}
            </span>
          </div>
          <div class="token-actions">
            <button v-if="!tk.is_enabled" class="text-button" type="button" @click="doEnable(tk.id)">
              {{ t('common.enable') }}
            </button>
            <button v-else class="text-button" type="button" @click="doDisable(tk.id)">
              {{ t('common.disable') }}
            </button>
            <button class="text-button danger" type="button" @click="doDelete(tk.id)">
              {{ t('common.delete') }}
            </button>
          </div>
        </div>

        <div class="token-expiry">
          到期：{{ formatExpiry(tk) }}
          <span v-if="tk.note" class="note-text">｜ {{ tk.note }}</span>
        </div>

        <!-- URL 欄 -->
        <div v-if="tk.urls" class="url-rows">
          <div v-for="(url, proto) in tk.urls" :key="proto" class="url-row">
            <span class="proto-label">{{ proto.toUpperCase() }}</span>
            <code class="url-text">{{ url }}</code>
            <button
              :class="['copy-btn', { copied: copiedId === `${tk.id}-${proto}` }]"
              type="button"
              @click="copyUrl(url, `${tk.id}-${proto}`)"
            >
              {{ copiedId === `${tk.id}-${proto}` ? '已複製' : t('common.copy') }}
            </button>
          </div>
        </div>
      </article>

      <div v-if="tokens.length === 0" class="empty-row">
        尚無串流 Token，請點擊「生成 Token」。
      </div>
    </div>

    <!-- 建立 Token 表單 -->
    <div v-if="showForm" class="modal-mask">
      <div class="modal-box">
        <h3>{{ t('streams.addToken') }}</h3>
        <label>
          {{ t('streams.selectCamera') }}
          <select v-model="form.camera_id">
            <option value="">請選擇攝影機</option>
            <option v-for="c in cameras" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
          </select>
        </label>
        <label>
          {{ t('streams.protocol') }}
          <select v-model="form.protocol">
            <option v-for="p in PROTOCOLS" :key="p.value" :value="p.value">{{ p.label }}</option>
          </select>
        </label>
        <label>
          {{ t('streams.expiresIn') }}（留空 = 永不過期）
          <input v-model="form.expires_in_hours" type="number" min="1" placeholder="例：24" />
        </label>
        <label>
          {{ t('streams.tokenNote') }}
          <input v-model="form.note" type="text" placeholder="備註（選填）" />
        </label>
        <div class="modal-actions">
          <button class="button secondary" type="button" @click="showForm = false">
            {{ t('common.cancel') }}
          </button>
          <button class="button primary" type="button" :disabled="!form.camera_id" @click="doCreate">
            {{ t('common.confirm') }}
          </button>
        </div>
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

.token-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.token-card {
  background: var(--surface, #fff);
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 8px;
  padding: 1rem 1.25rem;
}

.token-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.token-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.token-actions {
  display: flex;
  gap: 0.5rem;
}

.text-button.danger {
  color: #dc2626;
}

.token-expiry {
  font-size: 0.8rem;
  color: var(--text-muted, #6b7280);
  margin-bottom: 0.75rem;
}

.note-text {
  font-style: italic;
}

.url-rows {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.url-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.proto-label {
  font-size: 0.75rem;
  font-weight: 600;
  width: 52px;
  color: var(--text-muted, #6b7280);
  flex-shrink: 0;
}

.url-text {
  font-size: 0.78rem;
  background: var(--bg-muted, #f3f4f6);
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.copy-btn {
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0.15rem 0.5rem;
  font-size: 0.78rem;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}

.copy-btn.copied {
  background: #d1fae5;
  border-color: #6ee7b7;
  color: #065f46;
}

.empty-row {
  text-align: center;
  color: var(--text-muted, #9ca3af);
  padding: 3rem 0;
}

.pill-good {
  background: #d1fae5;
  color: #065f46;
}

.pill-warn {
  background: #fef3c7;
  color: #92400e;
}

.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-box {
  background: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  width: min(440px, 95vw);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.modal-box h3 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
}

.modal-box label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
}

.modal-box input,
.modal-box select {
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 0.375rem 0.5rem;
  font-size: 0.875rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.25rem;
}
</style>
