<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getService, optionLabel } from '../catalog'
import { formatDate, maskNationalId, param } from '../format'
import { useGovStore } from '../store'
import type { FieldError, GovCase } from '../types'
import { validateDetails, validateIdentity } from '../validate'

const route = useRoute()
const store = useGovStore()
const service = computed(() => getService(param(route.params.serviceId)))
const step = ref(1)
const maxReached = ref(1)
const steps = ['申請人', '申請內容', '附件', '確認']
const errors = ref<FieldError[]>([])
const errorBox = ref<HTMLElement | null>(null)
const confirmed = ref(false)
const done = ref<GovCase | null>(null)

const applicant = reactive({
  name: '',
  nationalId: '',
  phone: '',
  email: '',
  address: '',
})
const details = reactive<Record<string, string>>({})
const files = reactive<Record<string, string[]>>({})

const identityIds = ['name', 'nationalId', 'phone', 'email', 'address']

watch(
  service,
  (item) => {
    if (!item) return
    for (const field of item.fields) {
      if (!(field.key in details)) details[field.key] = ''
    }
  },
  { immediate: true },
)

watch(
  [applicant, details, files],
  () => {
    confirmed.value = false
  },
  { deep: true },
)

function errorOf(id: string) {
  return errors.value.find((item) => item.id === id)?.message || ''
}

function described(id: string) {
  return [errorOf(id) ? `${id}-error` : '', `${id}-help`].filter(Boolean).join(' ')
}

function validateStep(target = step.value): FieldError[] {
  if (!service.value) return []
  if (target === 1) return validateIdentity(applicant)
  if (target === 2) return validateDetails(service.value, details)
  if (target === 3) {
    return service.value.documents.flatMap((doc, index) => {
      if ((files[doc] || []).length) return []
      return [{ id: `file-${index}`, message: `請選擇「${doc}」。此示範只記錄檔名，可選任何小檔。` }]
    })
  }
  if (target === 4 && !confirmed.value) {
    return [{ id: 'confirm', message: '請勾選「我已核對以上資料」，確認後才會送出。' }]
  }
  return []
}

function firstInvalidStep(all: FieldError[]) {
  if (all.some((item) => identityIds.includes(item.id))) return 1
  if (all.some((item) => !identityIds.includes(item.id) && !item.id.startsWith('file-') && item.id !== 'confirm')) {
    return 2
  }
  if (all.some((item) => item.id.startsWith('file-'))) return 3
  return 4
}

async function showErrors(nextErrors: FieldError[]) {
  errors.value = nextErrors
  await nextTick()
  errorBox.value?.focus()
}

async function goTo(next: number) {
  if (!service.value || done.value || next === step.value || next > maxReached.value + 1) return
  if (next > step.value) {
    for (let current = step.value; current < next; current += 1) {
      const invalid = validateStep(current)
      if (invalid.length) {
        step.value = current
        await showErrors(invalid)
        return
      }
    }
  }
  errors.value = []
  step.value = next
  maxReached.value = Math.max(maxReached.value, next)
  await nextTick()
  document.getElementById('step-title')?.focus()
}

async function onSubmit() {
  if (step.value < 4) {
    await goTo(step.value + 1)
    return
  }
  if (!service.value) return
  const all = [1, 2, 3, 4].flatMap((item) => validateStep(item))
  if (all.length) {
    step.value = firstInvalidStep(all)
    await showErrors(validateStep(step.value))
    return
  }
  done.value = store.submitCase({
    serviceId: service.value.id,
    name: applicant.name,
    nationalId: applicant.nationalId,
    phone: applicant.phone,
    email: applicant.email,
    address: applicant.address,
    details: { ...details },
    attachments: service.value.documents.map((purpose) => ({
      purpose,
      names: files[purpose] || [],
    })),
  })
  document.title = `已送出 ${done.value.id} | 示範市民服務`
  await nextTick()
  document.getElementById('page-title')?.focus()
}

function onFiles(event: Event, purpose: string, index: number) {
  const input = event.target as HTMLInputElement
  files[purpose] = [...(input.files || [])].map((file) => file.name)
  errors.value = errors.value.filter((item) => item.id !== `file-${index}`)
}

function shownDetail(key: string) {
  if (!service.value) return '未填'
  const field = service.value.fields.find((item) => item.key === key)
  const value = (details[key] || '').trim()
  if (!value) return '未填'
  if (field?.type === 'select') return optionLabel(service.value.id, key, value)
  if (field?.type === 'date') return formatDate(value)
  if (key === 'monthlyIncome') return `${Number(value).toLocaleString('zh-TW')} 元`
  return value
}
</script>

<template>
  <div class="page">
    <template v-if="service && !done">
      <h1 id="page-title" tabindex="-1">申請{{ service.name }}</h1>
      <p class="lead">
        共 4 步。每一題下面都有填寫說明。按「下一步」才會檢查這一步，送出前還會再看一次全部資料。檔案不會離開這台瀏覽器。
      </p>
      <p>
        不確定名詞時，請先看
        <RouterLink to="/services/guide#glossary">詞彙解釋</RouterLink>
        或
        <RouterLink to="/services/faq">常見問答</RouterLink>。
      </p>

      <ol class="steps" aria-label="申請步驟">
        <li v-for="(label, index) in steps" :key="label">
          <button
            type="button"
            :aria-current="step === index + 1 ? 'step' : undefined"
            :disabled="index + 1 > maxReached"
            @click="goTo(index + 1)"
          >
            <span class="vh">第 {{ index + 1 }} 步，共 4 步：</span>
            {{ label }}
          </button>
        </li>
      </ol>

      <form class="form" novalidate @submit.prevent="onSubmit">
        <div v-if="errors.length" ref="errorBox" tabindex="-1" class="alert alert-error" role="alert">
          <h2>請修正以下欄位</h2>
          <ul>
            <li v-for="item in errors" :key="item.id">
              <a :href="`#${item.id}`">{{ item.message }}</a>
            </li>
          </ul>
        </div>

        <section v-if="step === 1" aria-labelledby="step-title">
          <h2 id="step-title" tabindex="-1">第 1 步：申請人</h2>
          <div class="fields">
            <div class="field">
              <label class="lbl" for="name">姓名 <span class="req">必填</span></label>
              <input
                id="name"
                v-model="applicant.name"
                type="text"
                autocomplete="name"
                :aria-invalid="errorOf('name') ? 'true' : undefined"
                :aria-describedby="described('name')"
              />
              <p id="name-help" class="help">示範可填「陳安心」。至少 2 個字。</p>
              <p v-if="errorOf('name')" id="name-error" class="error-text">錯誤：{{ errorOf('name') }}</p>
            </div>
            <div class="field">
              <label class="lbl" for="nationalId">身分證字號 <span class="req">必填</span></label>
              <input
                id="nationalId"
                v-model="applicant.nationalId"
                type="text"
                autocomplete="off"
                autocapitalize="characters"
                :aria-invalid="errorOf('nationalId') ? 'true' : undefined"
                :aria-describedby="described('nationalId')"
              />
              <p id="nationalId-help" class="help">第一碼英文加大寫或小寫皆可，後 9 碼數字。示範可填 A123456789。</p>
              <p v-if="errorOf('nationalId')" id="nationalId-error" class="error-text">錯誤：{{ errorOf('nationalId') }}</p>
            </div>
            <div class="field">
              <label class="lbl" for="phone">手機 <span class="req">必填</span></label>
              <input
                id="phone"
                v-model="applicant.phone"
                type="tel"
                autocomplete="tel"
                inputmode="numeric"
                :aria-invalid="errorOf('phone') ? 'true' : undefined"
                :aria-describedby="described('phone')"
              />
              <p id="phone-help" class="help">09 開頭共 10 碼，不要加橫線。例如 0912000111。</p>
              <p v-if="errorOf('phone')" id="phone-error" class="error-text">錯誤：{{ errorOf('phone') }}</p>
            </div>
            <div class="field">
              <label class="lbl" for="email">電子郵件 <span class="opt">選填</span></label>
              <input
                id="email"
                v-model="applicant.email"
                type="email"
                autocomplete="email"
                :aria-invalid="errorOf('email') ? 'true' : undefined"
                :aria-describedby="described('email')"
              />
              <p id="email-help" class="help">沒有信箱請留白。若要填，請包含 @，例如 name@example.tw。</p>
              <p v-if="errorOf('email')" id="email-error" class="error-text">錯誤：{{ errorOf('email') }}</p>
            </div>
            <div class="field">
              <label class="lbl" for="address">通訊地址 <span class="req">必填</span></label>
              <input
                id="address"
                v-model="applicant.address"
                type="text"
                autocomplete="street-address"
                :aria-invalid="errorOf('address') ? 'true' : undefined"
                :aria-describedby="described('address')"
              />
              <p id="address-help" class="help">示範可填「示範市中正路 1 號」。</p>
              <p v-if="errorOf('address')" id="address-error" class="error-text">錯誤：{{ errorOf('address') }}</p>
            </div>
          </div>
        </section>

        <section v-else-if="step === 2" aria-labelledby="step-title">
          <h2 id="step-title" tabindex="-1">第 2 步：申請內容</h2>
          <div class="fields">
            <div v-for="field in service.fields" :key="field.key" class="field">
              <label class="lbl" :for="field.key">
                {{ field.label }}
                <span v-if="field.required" class="req">必填</span>
                <span v-else class="opt">選填</span>
              </label>
              <textarea
                v-if="field.type === 'textarea'"
                :id="field.key"
                v-model="details[field.key]"
                rows="5"
                :aria-invalid="errorOf(field.key) ? 'true' : undefined"
                :aria-describedby="described(field.key)"
              ></textarea>
              <select
                v-else-if="field.type === 'select'"
                :id="field.key"
                v-model="details[field.key]"
                :aria-invalid="errorOf(field.key) ? 'true' : undefined"
                :aria-describedby="described(field.key)"
              >
                <option value="">請選擇</option>
                <option v-for="option in field.options" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <input
                v-else
                :id="field.key"
                v-model="details[field.key]"
                :type="field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'"
                :autocomplete="field.autocomplete"
                :inputmode="field.type === 'number' ? 'numeric' : undefined"
                :aria-invalid="errorOf(field.key) ? 'true' : undefined"
                :aria-describedby="described(field.key)"
              />
              <p :id="`${field.key}-help`" class="help">{{ field.help }}</p>
              <p v-if="errorOf(field.key)" :id="`${field.key}-error`" class="error-text">錯誤：{{ errorOf(field.key) }}</p>
            </div>
          </div>
        </section>

        <section v-else-if="step === 3" aria-labelledby="step-title">
          <h2 id="step-title" tabindex="-1">第 3 步：附件</h2>
          <p class="help">每一項請選一個檔案。可以是空的文字檔。我們只保存檔名，用來示範補件與證明。</p>
          <div class="fields">
            <div v-for="(doc, index) in service.documents" :key="doc" class="field">
              <label class="lbl" :for="`file-${index}`">{{ doc }} <span class="req">必填</span></label>
              <input
                :id="`file-${index}`"
                type="file"
                :aria-invalid="errorOf(`file-${index}`) ? 'true' : undefined"
                :aria-describedby="described(`file-${index}`)"
                @change="onFiles($event, doc, index)"
              />
              <p :id="`file-${index}-help`" class="help">已選擇：{{ (files[doc] || []).join('、') || '尚未選擇' }}</p>
              <p v-if="errorOf(`file-${index}`)" :id="`file-${index}-error`" class="error-text">
                錯誤：{{ errorOf(`file-${index}`) }}
              </p>
            </div>
          </div>
        </section>

        <section v-else aria-labelledby="step-title">
          <h2 id="step-title" tabindex="-1">第 4 步：確認後送出</h2>
          <p>請逐項看過。若要修改，回到上面的步驟。勾選並按下按鈕後才會建立案件。</p>
          <div class="summary-box">
            <h3>申請人</h3>
            <dl class="dl-grid">
              <div>
                <dt>姓名</dt>
                <dd>{{ applicant.name }}</dd>
              </div>
              <div>
                <dt>身分證字號</dt>
                <dd>{{ maskNationalId(applicant.nationalId.trim().toUpperCase()) }}</dd>
              </div>
              <div>
                <dt>手機</dt>
                <dd>{{ applicant.phone }}</dd>
              </div>
              <div>
                <dt>電子郵件</dt>
                <dd>{{ applicant.email.trim() || '未填' }}</dd>
              </div>
              <div>
                <dt>地址</dt>
                <dd>{{ applicant.address }}</dd>
              </div>
              <div v-for="field in service.fields" :key="field.key">
                <dt>{{ field.label }}</dt>
                <dd>{{ shownDetail(field.key) }}</dd>
              </div>
            </dl>
            <h3>附件檔名</h3>
            <ul>
              <li v-for="doc in service.documents" :key="doc">{{ doc }}：{{ (files[doc] || []).join('、') || '未選' }}</li>
            </ul>
          </div>
          <div class="field">
            <label class="choice" for="confirm">
              <input id="confirm" v-model="confirmed" type="checkbox" :aria-describedby="described('confirm')" />
              我已核對以上資料，了解這只是示範、不會送出正式申請。
            </label>
            <p id="confirm-help" class="help">勾選後，按鈕才會通過檢查。</p>
            <p v-if="errorOf('confirm')" id="confirm-error" class="error-text">錯誤：{{ errorOf('confirm') }}</p>
          </div>
        </section>

        <div class="cluster">
          <button v-if="step > 1" class="btn btn-secondary" type="button" @click="goTo(step - 1)">返回上一步修改</button>
          <button class="btn btn-primary" type="submit">{{ step === 4 ? '確認送出申請' : '下一步' }}</button>
        </div>
      </form>
    </template>

    <template v-else-if="done && service">
      <h1 id="page-title" tabindex="-1">申請已送出</h1>
      <div class="alert alert-ok" role="status">
        <p>
          已建立案件 <strong>{{ done.id }}</strong>。請記下編號。狀態是「已收件」，沒有承辦人會看到這份資料。
        </p>
      </div>
      <p>身分證後四碼是 {{ done.nationalId.slice(-4) }}。查詢時兩欄都要填。</p>
      <div class="cluster">
        <RouterLink class="btn btn-primary" :to="`/services/cases/${done.id}`">查看案件 {{ done.id }} 的進度</RouterLink>
        <RouterLink class="btn btn-secondary" to="/services/query">前往案件查詢</RouterLink>
      </div>
    </template>

    <template v-else>
      <h1 id="page-title" tabindex="-1">找不到這項服務</h1>
      <p class="lead">無法開始申請。請回服務總覽重新選擇。</p>
      <RouterLink class="btn btn-primary" to="/services">回到服務總覽</RouterLink>
    </template>
  </div>
</template>
