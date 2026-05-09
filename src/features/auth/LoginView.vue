<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { http } from '@/shared/api/http'
import { useSessionStore } from '@/shared/stores/session'

const router = useRouter()
const session = useSessionStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function login() {
  if (!email.value || !password.value) {
    error.value = '請輸入帳號與密碼'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const res = await http.post<{ accessToken: string; refreshToken: string }>(
      '/v1/auth/login',
      { username: email.value, password: password.value },
    )
    session.setSession({
      accessToken: res.data.accessToken,
      refreshToken: res.data.refreshToken,
      name: email.value.split('@')[0],
      email: email.value,
      roles: ['admin'],
    })
    router.push('/dashboard')
  } catch {
    error.value = '帳號或密碼錯誤'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <span class="brand-mark">LH</span>
        <div>
          <strong>LN HEO</strong>
          <small>IoT 影像管理平台</small>
        </div>
      </div>

      <form class="login-form" @submit.prevent="login">
        <label>
          Email
          <input v-model="email" type="email" placeholder="admin@example.com" autocomplete="email" />
        </label>
        <label>
          密碼
          <input v-model="password" type="password" placeholder="••••••••" autocomplete="current-password" />
        </label>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <button class="button primary full" type="submit" :disabled="loading">
          {{ loading ? '登入中...' : '登入' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg, #f3f4f6);
}

.login-card {
  background: #fff;
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 12px;
  padding: 2rem;
  width: min(380px, 95vw);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: 0 4px 24px rgba(0,0,0,.07);
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-mark {
  width: 40px;
  height: 40px;
  background: var(--primary, #2563eb);
  color: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.login-brand strong {
  display: block;
  font-size: 1rem;
}

.login-brand small {
  font-size: 0.75rem;
  color: var(--text-muted, #6b7280);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.login-form label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.login-form input {
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.15s;
}

.login-form input:focus {
  border-color: var(--primary, #2563eb);
}

.error-msg {
  font-size: 0.8rem;
  color: #dc2626;
  margin: 0;
}

.button.full {
  width: 100%;
  justify-content: center;
  padding: 0.6rem;
  font-size: 0.9rem;
}
</style>
