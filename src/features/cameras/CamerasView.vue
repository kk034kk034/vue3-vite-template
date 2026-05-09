<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppI18n } from '@/shared/i18n'
import {
  fetchCameras,
  fetchCameraGroups,
  createCamera,
  updateCamera,
  deleteCamera,
  createCameraGroup,
  type Camera,
  type CameraGroup,
} from './api'

const { t } = useAppI18n()

const cameras = ref<Camera[]>([])
const groups = ref<CameraGroup[]>([])
const loading = ref(false)
const activeTab = ref<'cameras' | 'groups'>('cameras')

// Camera form
const showCamForm = ref(false)
const editingCam = ref<Camera | null>(null)
const camForm = ref({ name: '', rtsp_url: '', location: '', camera_group_id: '', organization_id: 1 })

// Group form
const showGroupForm = ref(false)
const groupForm = ref({ name: '', description: '', organization_id: 1 })

async function loadAll() {
  loading.value = true
  try {
    ;[cameras.value, groups.value] = await Promise.all([
      fetchCameras({ organization_id: 1 }),
      fetchCameraGroups({ organization_id: 1 }),
    ])
  } finally {
    loading.value = false
  }
}

function openNewCam() {
  editingCam.value = null
  camForm.value = { name: '', rtsp_url: '', location: '', camera_group_id: '', organization_id: 1 }
  showCamForm.value = true
}

function openEditCam(cam: Camera) {
  editingCam.value = cam
  camForm.value = {
    name: cam.name,
    rtsp_url: cam.rtsp_url,
    location: cam.location || '',
    camera_group_id: cam.camera_group_id ? String(cam.camera_group_id) : '',
    organization_id: cam.organization_id,
  }
  showCamForm.value = true
}

async function saveCam() {
  const payload = {
    name: camForm.value.name,
    rtsp_url: camForm.value.rtsp_url,
    location: camForm.value.location || undefined,
    camera_group_id: camForm.value.camera_group_id ? Number(camForm.value.camera_group_id) : undefined,
    organization_id: camForm.value.organization_id,
  }
  if (editingCam.value) {
    await updateCamera(editingCam.value.id, payload)
  } else {
    await createCamera(payload)
  }
  showCamForm.value = false
  await loadAll()
}

async function removeCam(id: number) {
  if (!confirm('確定刪除此攝影機？')) return
  await deleteCamera(id)
  await loadAll()
}

async function toggleActive(cam: Camera) {
  await updateCamera(cam.id, { is_active: !cam.is_active })
  await loadAll()
}

async function saveGroup() {
  await createCameraGroup({
    name: groupForm.value.name,
    organization_id: groupForm.value.organization_id,
    description: groupForm.value.description || undefined,
  })
  showGroupForm.value = false
  await loadAll()
}

onMounted(loadAll)
</script>

<template>
  <section class="page-section">
    <div class="section-header">
      <div>
        <h2>{{ t('routes.cameras') }}</h2>
        <p>{{ t('cameras.subtitle') }}</p>
      </div>
      <div class="button-row">
        <button class="button secondary" type="button" @click="showGroupForm = true">
          {{ t('cameras.addGroup') }}
        </button>
        <button class="button primary" type="button" @click="openNewCam">
          {{ t('cameras.add') }}
        </button>
      </div>
    </div>

    <!-- Tab 切換 -->
    <div class="tab-bar">
      <button
        :class="['tab-btn', { active: activeTab === 'cameras' }]"
        type="button"
        @click="activeTab = 'cameras'"
      >
        攝影機列表
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'groups' }]"
        type="button"
        @click="activeTab = 'groups'"
      >
        群組管理
      </button>
    </div>

    <!-- 攝影機列表 -->
    <div v-if="activeTab === 'cameras'" class="table-wrap">
      <div v-if="loading" class="loading-text">載入中...</div>
      <table v-else>
        <thead>
          <tr>
            <th>{{ t('common.name') }}</th>
            <th>{{ t('cameras.rtspUrl') }}</th>
            <th>{{ t('cameras.streamKey') }}</th>
            <th>{{ t('cameras.group') }}</th>
            <th>{{ t('cameras.location') }}</th>
            <th>{{ t('common.status') }}</th>
            <th>{{ t('common.action') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cam in cameras" :key="cam.id">
            <td>{{ cam.name }}</td>
            <td><code class="mono-text">{{ cam.rtsp_url }}</code></td>
            <td><code class="mono-text">{{ cam.stream_key }}</code></td>
            <td>{{ cam.camera_group?.name || t('cameras.noGroup') }}</td>
            <td>{{ cam.location || '—' }}</td>
            <td>
              <span :class="['pill', cam.is_active ? 'pill-good' : 'pill-warn']">
                {{ cam.is_active ? t('cameras.active') : t('cameras.inactive') }}
              </span>
            </td>
            <td class="action-cell">
              <button class="text-button" type="button" @click="openEditCam(cam)">
                {{ t('common.edit') }}
              </button>
              <button class="text-button" type="button" @click="toggleActive(cam)">
                {{ cam.is_active ? t('common.disable') : t('common.enable') }}
              </button>
              <button class="text-button danger" type="button" @click="removeCam(cam.id)">
                {{ t('common.delete') }}
              </button>
            </td>
          </tr>
          <tr v-if="cameras.length === 0">
            <td colspan="7" class="empty-row">尚無攝影機，請新增。</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 群組管理 -->
    <div v-else class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{{ t('cameras.groupName') }}</th>
            <th>{{ t('cameras.groupDesc') }}</th>
            <th>{{ t('cameras.camCount') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="g in groups" :key="g.id">
            <td>{{ g.name }}</td>
            <td>{{ g.description || '—' }}</td>
            <td>{{ g.cameras?.length ?? 0 }}</td>
          </tr>
          <tr v-if="groups.length === 0">
            <td colspan="3" class="empty-row">尚無群組，請新增。</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 攝影機表單 -->
    <div v-if="showCamForm" class="modal-mask">
      <div class="modal-box">
        <h3>{{ editingCam ? t('common.edit') : t('cameras.add') }}</h3>
        <label>
          {{ t('common.name') }}
          <input v-model="camForm.name" type="text" />
        </label>
        <label>
          {{ t('cameras.rtspUrl') }}
          <input v-model="camForm.rtsp_url" type="text" placeholder="rtsp://user:pass@ip:554/stream" />
        </label>
        <label>
          {{ t('cameras.location') }}
          <input v-model="camForm.location" type="text" />
        </label>
        <label>
          {{ t('cameras.group') }}
          <select v-model="camForm.camera_group_id">
            <option value="">{{ t('cameras.noGroup') }}</option>
            <option v-for="g in groups" :key="g.id" :value="String(g.id)">{{ g.name }}</option>
          </select>
        </label>
        <div class="modal-actions">
          <button class="button secondary" type="button" @click="showCamForm = false">
            {{ t('common.cancel') }}
          </button>
          <button class="button primary" type="button" @click="saveCam">
            {{ t('common.save') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 群組表單 -->
    <div v-if="showGroupForm" class="modal-mask">
      <div class="modal-box">
        <h3>{{ t('cameras.addGroup') }}</h3>
        <label>
          {{ t('cameras.groupName') }}
          <input v-model="groupForm.name" type="text" />
        </label>
        <label>
          {{ t('cameras.groupDesc') }}
          <input v-model="groupForm.description" type="text" />
        </label>
        <div class="modal-actions">
          <button class="button secondary" type="button" @click="showGroupForm = false">
            {{ t('common.cancel') }}
          </button>
          <button class="button primary" type="button" @click="saveGroup">
            {{ t('common.save') }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tab-bar {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--border, #e0e0e0);
  margin-bottom: 1rem;
}

.tab-btn {
  padding: 0.5rem 1.25rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--text-muted, #666);
  transition: color 0.15s, border-color 0.15s;
}

.tab-btn.active {
  color: var(--primary, #2563eb);
  border-bottom-color: var(--primary, #2563eb);
}

.action-cell {
  display: flex;
  gap: 0.5rem;
}

.text-button.danger {
  color: #dc2626;
}

.mono-text {
  font-size: 0.78rem;
  background: var(--bg-muted, #f3f4f6);
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

.pill-good {
  background: #d1fae5;
  color: #065f46;
}

.pill-warn {
  background: #fef3c7;
  color: #92400e;
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
  width: min(480px, 95vw);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.modal-box h3 {
  margin: 0 0 0.5rem;
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
  margin-top: 0.5rem;
}
</style>
