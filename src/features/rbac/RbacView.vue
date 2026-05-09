<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAppI18n } from '@/shared/i18n'
import { http } from '@/shared/api/http'

const { t } = useAppI18n()

interface UserRoleItem {
  id: number
  user_id: number
  organization_id: number
  role_id: number
  user?: { id: number; username: string; email: string }
  role?: { id: number; name: string }
  organization?: { id: number; name: string }
}

const userRoles = ref<UserRoleItem[]>([])
const loading = ref(false)

// 新增角色表單
const showForm = ref(false)
const form = ref({ user_email: '', organization_id: '', role_name: 'groupViewer' })

const ROLE_OPTIONS = [
  { value: 'groupViewer', label: t('rbac.groupViewer') },
  { value: 'groupManager', label: t('rbac.groupManager') },
  { value: 'groupAdmin', label: t('rbac.groupAdmin') },
]

const ROLE_SCOPE: Record<string, string> = {
  groupAdmin: t('rbac.global'),
  groupManager: t('rbac.site'),
  groupViewer: t('rbac.device'),
}

const ROLE_PERMS: Record<string, string> = {
  groupAdmin: 'all:*',
  groupManager: 'camera:write, stream:write, site:write',
  groupViewer: 'camera:read, stream:read',
}

async function loadRoles() {
  loading.value = true
  try {
    const res = await http.get<{ userRoles: UserRoleItem[] }>('/v1/organization/user-roles')
    userRoles.value = res.data.userRoles || []
  } catch {
    // 後端 API 尚未實作時保留空陣列
  } finally {
    loading.value = false
  }
}

async function addRole() {
  try {
    await http.post('/v1/organization/user-roles', {
      user_email: form.value.user_email,
      organization_id: Number(form.value.organization_id),
      role_name: form.value.role_name,
    })
    showForm.value = false
    form.value = { user_email: '', organization_id: '', role_name: 'groupViewer' }
    await loadRoles()
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '新增失敗'
    alert(msg)
  }
}

async function removeRole(id: number) {
  if (!confirm('確定移除此使用者角色？')) return
  await http.delete(`/v1/organization/user-roles/${id}`)
  await loadRoles()
}

onMounted(loadRoles)
</script>

<template>
  <section class="page-section">
    <div class="section-header">
      <div>
        <h2>{{ t('routes.rbac') }}</h2>
        <p>{{ t('rbac.subtitle') }}</p>
      </div>
      <button class="button primary" type="button" @click="showForm = true">
        {{ t('rbac.add') }}
      </button>
    </div>

    <!-- 角色說明面板 -->
    <div class="data-panel role-legend">
      <div class="panel-title">角色說明</div>
      <div class="legend-grid">
        <div v-for="r in ROLE_OPTIONS" :key="r.value" class="legend-item">
          <strong>{{ r.label }}</strong>
          <span>{{ ROLE_PERMS[r.value] }}</span>
          <span class="pill">{{ ROLE_SCOPE[r.value] }}</span>
        </div>
      </div>
    </div>

    <!-- 使用者角色列表 -->
    <div class="table-wrap">
      <div v-if="loading" class="loading-text">載入中...</div>
      <table v-else>
        <thead>
          <tr>
            <th>使用者</th>
            <th>{{ t('rbac.role') }}</th>
            <th>{{ t('rbac.scope') }}</th>
            <th>{{ t('rbac.permissions') }}</th>
            <th>{{ t('common.action') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ur in userRoles" :key="ur.id">
            <td>
              <div>{{ ur.user?.username }}</div>
              <div class="sub-text">{{ ur.user?.email }}</div>
            </td>
            <td>
              <span class="pill">{{ ur.role?.name }}</span>
            </td>
            <td>{{ ROLE_SCOPE[ur.role?.name || ''] || '—' }}</td>
            <td>{{ ROLE_PERMS[ur.role?.name || ''] || '—' }}</td>
            <td>
              <button class="text-button danger" type="button" @click="removeRole(ur.id)">
                {{ t('common.delete') }}
              </button>
            </td>
          </tr>
          <tr v-if="userRoles.length === 0">
            <td colspan="5" class="empty-row">尚無角色指派記錄。</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 新增角色表單 -->
    <div v-if="showForm" class="modal-mask">
      <div class="modal-box">
        <h3>{{ t('rbac.add') }}</h3>
        <label>
          使用者 Email
          <input v-model="form.user_email" type="email" placeholder="user@example.com" />
        </label>
        <label>
          Organization ID
          <input v-model="form.organization_id" type="number" placeholder="1" />
        </label>
        <label>
          {{ t('rbac.role') }}
          <select v-model="form.role_name">
            <option v-for="r in ROLE_OPTIONS" :key="r.value" :value="r.value">{{ r.label }}</option>
          </select>
        </label>
        <div class="modal-actions">
          <button class="button secondary" type="button" @click="showForm = false">
            {{ t('common.cancel') }}
          </button>
          <button class="button primary" type="button" @click="addRole">
            {{ t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
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

.legend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
}

.legend-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.5rem 0.75rem;
  background: var(--bg-muted, #f9fafb);
  border-radius: 6px;
  font-size: 0.8rem;
}

.sub-text {
  font-size: 0.75rem;
  color: var(--text-muted, #6b7280);
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

.text-button.danger {
  color: #dc2626;
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
  width: min(400px, 95vw);
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
