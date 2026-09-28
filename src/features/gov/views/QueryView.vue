<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { RouterLink } from 'vue-router'
import DemoCaseTable from '../components/DemoCaseTable.vue'
import { useGovStore } from '../store'
import { isCaseNumber, isValidNationalId } from '../validate'
import { caseStatusLabel, type FieldError, type GovCase } from '../types'

const store = useGovStore()
const mode = ref<'number' | 'id'>('number')
const caseId = ref('')
const last4 = ref('')
const nationalId = ref('')
const errors = ref<FieldError[]>([])
const searched = ref(false)
const results = ref<GovCase[]>([])
const errorBox = ref<HTMLElement | null>(null)

const resultMessage = computed(() => {
  if (!searched.value || errors.value.length) return ''
  if (!results.value.length) return '查無符合的案件。'
  return `找到 ${results.value.length} 件案件。`
})

function errorOf(id: string) {
  return errors.value.find((item) => item.id === id)?.message || ''
}

function described(id: string) {
  return [errorOf(id) ? `${id}-error` : '', `${id}-help`].filter(Boolean).join(' ')
}

async function onSubmit() {
  const nextErrors: FieldError[] = []
  if (mode.value === 'number') {
    if (!isCaseNumber(caseId.value)) {
      nextErrors.push({
        id: 'caseId',
        message: '案件編號格式為 GV114- 加上 6 碼數字，例如 GV114-000128。',
      })
    }
    if (!/^[0-9]{4}$/.test(last4.value.trim())) {
      nextErrors.push({ id: 'last4', message: '請填身分證後四碼，只要 4 個數字，例如 6789。' })
    }
  } else if (!isValidNationalId(nationalId.value)) {
    nextErrors.push({
      id: 'nationalId',
      message: '身分證格式不正確。第一碼為英文字母，後面 9 碼數字。示範可填 A123456789。',
    })
  }

  errors.value = nextErrors
  searched.value = nextErrors.length === 0
  results.value = []
  if (nextErrors.length) {
    await nextTick()
    errorBox.value?.focus()
    return
  }

  results.value =
    mode.value === 'number'
      ? [store.caseByNumber(caseId.value, last4.value)].filter((item): item is GovCase => Boolean(item))
      : store.casesByNationalId(nationalId.value)

  if (!results.value.length) {
    errors.value = [
      {
        id: mode.value === 'number' ? 'caseId' : 'nationalId',
        message:
          mode.value === 'number'
            ? '查無符合的案件。請核對編號與後四碼。待補正示範是 GV114-000128，後四碼 6789。'
            : '這個身分證字號目前沒有案件。示範可查 A123456789。',
      },
    ]
    searched.value = false
    await nextTick()
    errorBox.value?.focus()
  }
}
</script>

<template>
  <div class="page">
    <h1 id="page-title" tabindex="-1">案件查詢</h1>
    <p class="lead">
      查詢不會在您選擇方式或打字時自動進行。請填完後按「查詢案件」。編號與後四碼都要相符，避免只憑編號看到別人的案件。
    </p>

    <form class="form" novalidate @submit.prevent="onSubmit">
      <fieldset class="fieldset">
        <legend>選擇查詢方式</legend>
        <label class="choice">
          <input v-model="mode" type="radio" name="query-mode" value="number" />
          以案件編號與身分證後四碼查詢
        </label>
        <label class="choice">
          <input v-model="mode" type="radio" name="query-mode" value="id" />
          以身分證字號查詢名下案件
        </label>
      </fieldset>

      <div v-if="errors.length" ref="errorBox" tabindex="-1" class="alert alert-error" role="alert">
        <h2>請修正以下欄位</h2>
        <ul>
          <li v-for="error in errors" :key="error.id">
            <a :href="`#${error.id}`">{{ error.message }}</a>
          </li>
        </ul>
      </div>

      <div v-if="mode === 'number'" class="fields">
        <div class="field">
          <label class="lbl" for="caseId">案件編號 <span class="req">必填</span></label>
          <input
            id="caseId"
            v-model="caseId"
            class="control"
            type="text"
            name="caseId"
            autocomplete="off"
            :aria-invalid="errorOf('caseId') ? 'true' : undefined"
            :aria-describedby="described('caseId')"
          />
          <p id="caseId-help" class="help">範例：GV114-000128。英文字母大小寫都可以。</p>
          <p v-if="errorOf('caseId')" id="caseId-error" class="error-text">錯誤：{{ errorOf('caseId') }}</p>
        </div>
        <div class="field">
          <label class="lbl" for="last4">身分證後四碼 <span class="req">必填</span></label>
          <input
            id="last4"
            v-model="last4"
            class="control"
            type="text"
            name="last4"
            inputmode="numeric"
            maxlength="4"
            autocomplete="off"
            :aria-invalid="errorOf('last4') ? 'true' : undefined"
            :aria-describedby="described('last4')"
          />
          <p id="last4-help" class="help">範例：6789。只要數字，不要包含英文字母。</p>
          <p v-if="errorOf('last4')" id="last4-error" class="error-text">錯誤：{{ errorOf('last4') }}</p>
        </div>
      </div>

      <div v-else class="fields">
        <div class="field">
          <label class="lbl" for="nationalId">身分證字號 <span class="req">必填</span></label>
          <input
            id="nationalId"
            v-model="nationalId"
            class="control"
            type="text"
            name="nationalId"
            autocomplete="off"
            :aria-invalid="errorOf('nationalId') ? 'true' : undefined"
            :aria-describedby="described('nationalId')"
          />
          <p id="nationalId-help" class="help">示範可填 A123456789。請不要填真實身分證。</p>
          <p v-if="errorOf('nationalId')" id="nationalId-error" class="error-text">
            錯誤：{{ errorOf('nationalId') }}
          </p>
        </div>
      </div>

      <button class="btn btn-primary" type="submit">查詢案件</button>
    </form>

    <p class="live" role="status">{{ resultMessage }}</p>

    <section v-if="searched" class="section" aria-labelledby="result-title">
      <h2 id="result-title">查詢結果</h2>
      <ul v-if="results.length" class="results">
        <li v-for="item in results" :key="item.id" class="card">
          <h3>{{ item.id }}</h3>
          <p>
            <span class="status-pill">{{ caseStatusLabel[item.status] }}</span>
          </p>
          <p>申請人 {{ item.applicantName }}，收件時間 {{ item.createdAt }}。</p>
          <RouterLink :to="`/services/cases/${item.id}`">查看案件 {{ item.id }} 的進度與補正說明</RouterLink>
        </li>
      </ul>
      <p v-else class="empty">沒有可列出的案件。</p>
    </section>

    <section class="section" aria-labelledby="samples-title">
      <h2 id="samples-title">示範資料</h2>
      <DemoCaseTable />
    </section>
  </div>
</template>
