<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { demoCases, getService } from '../catalog'
import { formatDate, formatMoney, param } from '../format'
import { useGovStore } from '../store'
import { isCaseNumber } from '../validate'
import type { FieldError, GovCase } from '../types'

const route = useRoute()
const store = useGovStore()
const caseId = ref(param(route.query.case))
const last4 = ref('')
const method = ref('')
const confirmed = ref(false)
const errors = ref<FieldError[]>([])
const found = ref<GovCase | null>(null)
const looked = ref(false)
const message = ref('')
const errorBox = ref<HTMLElement | null>(null)

const feeDemo = demoCases.find((item) => item.scene.includes('繳費'))

watch(
  () => [caseId.value, last4.value, method.value],
  () => {
    confirmed.value = false
  },
)

function errorOf(id: string) {
  return errors.value.find((item) => item.id === id)?.message || ''
}

function described(id: string) {
  return [errorOf(id) ? `${id}-error` : '', `${id}-help`].filter(Boolean).join(' ')
}

const serviceName = computed(() => (found.value ? getService(found.value.serviceId)?.name : ''))

async function lookup() {
  const nextErrors: FieldError[] = []
  if (!isCaseNumber(caseId.value)) {
    nextErrors.push({ id: 'feeCaseId', message: '案件編號格式為 GV114- 加上 6 碼數字。待繳示範是 GV114-000203。' })
  }
  if (!/^[0-9]{4}$/.test(last4.value.trim())) {
    nextErrors.push({ id: 'feeLast4', message: '請填身分證後四碼。黃秋月的後四碼是 6782。' })
  }
  errors.value = nextErrors
  found.value = null
  looked.value = false
  message.value = ''
  if (nextErrors.length) {
    await nextTick()
    errorBox.value?.focus()
    return
  }
  looked.value = true
  found.value = store.caseByNumber(caseId.value, last4.value) || null
  if (!found.value) {
    errors.value = [
      {
        id: 'feeCaseId',
        message: `查無這筆案件。待繳規費示範是 ${feeDemo?.caseId || 'GV114-000203'}，後四碼 ${feeDemo?.last4 || '6782'}。`,
      },
    ]
    looked.value = false
    await nextTick()
    errorBox.value?.focus()
  }
}

async function pay() {
  if (!found.value?.fee || found.value.fee.paid) return
  const nextErrors: FieldError[] = []
  if (!method.value) nextErrors.push({ id: 'method', message: '請選擇一種繳費方式。三種都是示範，不會扣款。' })
  if (!confirmed.value) {
    nextErrors.push({
      id: 'feeConfirm',
      message: `請勾選確認，表示您要示範繳納 ${formatMoney(found.value.fee.amount)}。`,
    })
  }
  errors.value = nextErrors
  if (nextErrors.length) {
    await nextTick()
    errorBox.value?.focus()
    return
  }
  const updated = store.payFee(found.value.id, method.value)
  if (!updated) return
  found.value = updated
  message.value = `${updated.id} 已完成示範繳費，沒有實際扣款。`
  await nextTick()
  document.getElementById('pay-result')?.focus()
}
</script>

<template>
  <div class="page">
    <h1 id="page-title" tabindex="-1">規費繳納</h1>
    <p class="lead">先核對案件，再選擇方式並確認金額。按「完成示範繳費」之後才會入帳。這裡不會連到銀行。</p>

    <form class="form" novalidate @submit.prevent="lookup">
      <div v-if="errors.length" ref="errorBox" tabindex="-1" class="alert alert-error" role="alert">
        <h2>請修正以下欄位</h2>
        <ul>
          <li v-for="item in errors" :key="item.id">
            <a :href="`#${item.id}`">{{ item.message }}</a>
          </li>
        </ul>
      </div>

      <div class="fields">
        <div class="field">
          <label class="lbl" for="feeCaseId">案件編號 <span class="req">必填</span></label>
          <input
            id="feeCaseId"
            v-model="caseId"
            type="text"
            autocomplete="off"
            :aria-invalid="errorOf('feeCaseId') ? 'true' : undefined"
            :aria-describedby="described('feeCaseId')"
          />
          <p id="feeCaseId-help" class="help">待繳示範：GV114-000203。</p>
          <p v-if="errorOf('feeCaseId')" id="feeCaseId-error" class="error-text">錯誤：{{ errorOf('feeCaseId') }}</p>
        </div>
        <div class="field">
          <label class="lbl" for="feeLast4">身分證後四碼 <span class="req">必填</span></label>
          <input
            id="feeLast4"
            v-model="last4"
            type="text"
            inputmode="numeric"
            maxlength="4"
            autocomplete="off"
            :aria-invalid="errorOf('feeLast4') ? 'true' : undefined"
            :aria-describedby="described('feeLast4')"
          />
          <p id="feeLast4-help" class="help">黃秋月的後四碼是 6782。</p>
          <p v-if="errorOf('feeLast4')" id="feeLast4-error" class="error-text">錯誤：{{ errorOf('feeLast4') }}</p>
        </div>
      </div>
      <button class="btn btn-primary" type="submit">查詢規費</button>
    </form>

    <section v-if="looked && found" class="section" aria-labelledby="bill-title">
      <h2 id="bill-title">{{ found.id }} 的費用</h2>
      <p>{{ serviceName }}，申請人 {{ found.applicantName }}。</p>

      <div v-if="!found.fee" class="alert alert-ok">
        <p>這件沒有規費。</p>
        <RouterLink :to="`/services/cases/${found.id}`">回到案件 {{ found.id }}</RouterLink>
      </div>

      <template v-else>
        <div class="table-wrap">
          <table class="data-table">
            <caption>
              {{ found.id }} 的規費明細
            </caption>
            <thead>
              <tr>
                <th scope="col">項目</th>
                <th scope="col">金額</th>
                <th scope="col">期限</th>
                <th scope="col">狀態</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{{ found.fee.item }}</td>
                <td>{{ formatMoney(found.fee.amount) }}</td>
                <td>{{ formatDate(found.fee.deadline) }}</td>
                <td>{{ found.fee.paid ? '已繳納（示範）' : '尚未繳納' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="found.fee.paid" id="pay-result" tabindex="-1" class="alert alert-ok">
          <p>{{ message || `已於 ${found.fee.paidAt} 以${found.fee.method}繳納。` }}</p>
          <RouterLink :to="`/services/cases/${found.id}`">查看案件 {{ found.id }} 的進度</RouterLink>
        </div>

        <form v-else class="form" @submit.prevent="pay">
          <fieldset id="method" class="fieldset">
            <legend>繳費方式 <span class="req">必填</span></legend>
            <p id="method-help" class="help">請選一種。選了不會馬上扣款，還要勾選確認並按按鈕。</p>
            <label class="choice">
              <input v-model="method" type="radio" name="pay-method" value="信用卡（示範）" />
              信用卡（示範）
            </label>
            <label class="choice">
              <input v-model="method" type="radio" name="pay-method" value="轉帳（示範）" />
              轉帳（示範）
            </label>
            <label class="choice">
              <input v-model="method" type="radio" name="pay-method" value="超商代碼（示範）" />
              超商代碼（示範）
            </label>
            <p v-if="errorOf('method')" id="method-error" class="error-text">錯誤：{{ errorOf('method') }}</p>
          </fieldset>

          <div class="field">
            <label class="choice" for="feeConfirm">
              <input id="feeConfirm" v-model="confirmed" type="checkbox" />
              我確認示範繳納「{{ found.fee.item }}」{{ formatMoney(found.fee.amount) }}，並了解不會真正扣款。
            </label>
            <p v-if="errorOf('feeConfirm')" id="feeConfirm-error" class="error-text">錯誤：{{ errorOf('feeConfirm') }}</p>
          </div>

          <button class="btn btn-primary" type="submit">完成示範繳費</button>
        </form>
      </template>
    </section>
  </div>
</template>
