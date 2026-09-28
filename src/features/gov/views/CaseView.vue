<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getService, optionLabel } from '../catalog'
import { formatDate, maskNationalId, param } from '../format'
import { useGovStore } from '../store'
import { caseStatusDetail, caseStatusLabel } from '../types'

const route = useRoute()
const store = useGovStore()
const record = computed(() => store.caseById(param(route.params.caseId)))
const service = computed(() => (record.value ? getService(record.value.serviceId) : undefined))

const note = ref('')
const fileNames = ref<string[]>([])
const error = ref('')
const message = ref('')
const showReceipt = ref(false)
const errorBox = ref<HTMLElement | null>(null)
const receiptTitle = ref<HTMLElement | null>(null)

function detailText(key: string, value: string) {
  if (!record.value) return value
  const field = service.value?.fields.find((item) => item.key === key)
  if (!field) return value
  if (field.type === 'select') return optionLabel(record.value.serviceId, key, value)
  if (field.type === 'date') return formatDate(value)
  if (key === 'monthlyIncome') return `${Number(value).toLocaleString('zh-TW')} 元`
  return value
}

function onFiles(event: Event) {
  const input = event.target as HTMLInputElement
  fileNames.value = [...(input.files || [])].map((file) => file.name)
  error.value = ''
}

async function submitSupplement() {
  if (!record.value) return
  if (!fileNames.value.length) {
    error.value = '請至少選擇一個檔案。此示範只記錄檔名，不會上傳內容。'
    await nextTick()
    errorBox.value?.focus()
    return
  }
  const purpose = record.value.supplementNote || '補正文件'
  const updated = store.addSupplement(
    record.value.id,
    [{ purpose, names: [...fileNames.value] }],
    note.value,
  )
  if (!updated) {
    error.value = '這件目前不是待補正，不能補件。'
    return
  }
  fileNames.value = []
  note.value = ''
  message.value = '已收到補件，案件回到審核中。'
  await nextTick()
  document.getElementById('case-status')?.focus()
}

async function toggleReceipt() {
  showReceipt.value = !showReceipt.value
  if (!showReceipt.value) return
  await nextTick()
  receiptTitle.value?.focus()
}
</script>

<template>
  <div class="page">
    <template v-if="record">
      <h1 id="page-title" tabindex="-1">案件 {{ record.id }}</h1>
      <p class="lead">{{ service?.name || '服務' }}。申請人 {{ record.applicantName }}，身分證 {{ maskNationalId(record.nationalId) }}。</p>

      <p id="case-status" tabindex="-1" class="status-line">
        <span class="status-pill">{{ caseStatusLabel[record.status] }}</span>
        {{ caseStatusDetail[record.status] }}
      </p>
      <p class="live" role="status">{{ message }}</p>

      <section v-if="record.supplementNote && record.status === 'supplement'" class="section" aria-labelledby="fix-title">
        <h2 id="fix-title">需要補正</h2>
        <p class="alert alert-error">{{ record.supplementNote }}</p>
        <form class="form" @submit.prevent="submitSupplement">
          <div class="field">
            <label class="lbl" for="supplement-files">補件檔案 <span class="req">必填</span></label>
            <input id="supplement-files" type="file" multiple @change="onFiles" />
            <p class="help">可選多個檔案。系統只記住檔名，例如 photo.txt。</p>
            <ul v-if="fileNames.length">
              <li v-for="name in fileNames" :key="name">已選擇 {{ name }}</li>
            </ul>
          </div>
          <div class="field">
            <label class="lbl" for="supplement-note">給承辦人員的說明 <span class="opt">選填</span></label>
            <textarea id="supplement-note" v-model="note" rows="4"></textarea>
            <p class="help">例如「補上兩吋照片」。沒有補充可以留白。</p>
          </div>
          <div v-if="error" ref="errorBox" tabindex="-1" class="alert alert-error" role="alert">錯誤：{{ error }}</div>
          <button class="btn btn-primary" type="submit">送出補件</button>
        </form>
      </section>

      <section v-if="record.decisionNote" class="section" aria-labelledby="decision-title">
        <h2 id="decision-title">審查結果說明</h2>
        <p class="prose">{{ record.decisionNote }}</p>
      </section>

      <section v-if="record.fee" class="section" aria-labelledby="fee-title">
        <h2 id="fee-title">規費</h2>
        <p>
          {{ record.fee.item }}，新臺幣 {{ record.fee.amount.toLocaleString('zh-TW') }} 元。
          <template v-if="record.fee.paid">已於 {{ record.fee.paidAt }} 以{{ record.fee.method }}繳納（示範）。</template>
          <template v-else>尚未繳納，期限 {{ formatDate(record.fee.deadline) }}。</template>
        </p>
        <RouterLink v-if="!record.fee.paid" class="btn btn-primary" :to="`/services/fees?case=${record.id}`">
          前往繳納案件 {{ record.id }} 的規費
        </RouterLink>
      </section>

      <section class="section" aria-labelledby="timeline-title">
        <h2 id="timeline-title">進度</h2>
        <ol class="timeline">
          <li v-for="(event, index) in record.timeline" :key="`${event.at}-${index}`">
            <h3>{{ event.title }}</h3>
            <p><time :datetime="event.at">{{ event.at }}</time></p>
            <p>{{ event.detail }}</p>
          </li>
        </ol>
      </section>

      <section class="section" aria-labelledby="content-title">
        <h2 id="content-title">申請內容</h2>
        <dl class="dl-grid">
          <div>
            <dt>電話</dt>
            <dd>{{ record.phone }}</dd>
          </div>
          <div>
            <dt>電子郵件</dt>
            <dd>{{ record.email || '未填' }}</dd>
          </div>
          <div>
            <dt>地址</dt>
            <dd>{{ record.address }}</dd>
          </div>
          <div v-for="(value, key) in record.details" :key="key">
            <dt>{{ service?.fields.find((item) => item.key === key)?.label || key }}</dt>
            <dd>{{ detailText(String(key), value) }}</dd>
          </div>
        </dl>
      </section>

      <section class="section" aria-labelledby="files-title">
        <h2 id="files-title">已記錄的檔名</h2>
        <ul>
          <li v-for="(file, index) in record.attachments" :key="`${file.purpose}-${index}`">
            {{ file.purpose }}：{{ file.names.join('、') }}
          </li>
        </ul>
      </section>

      <section class="section" aria-labelledby="receipt-action">
        <h2 id="receipt-action">收件證明</h2>
        <p>證明以文字顯示，可以直接朗讀或列印，不是圖片。</p>
        <button class="btn btn-secondary" type="button" :aria-expanded="showReceipt" aria-controls="receipt" @click="toggleReceipt">
          {{ showReceipt ? '隱藏收件證明' : '顯示收件證明' }}
        </button>
        <article v-if="showReceipt" id="receipt" class="receipt">
          <h3 id="receipt-title" ref="receiptTitle" tabindex="-1">收件證明 {{ record.id }}</h3>
          <p>{{ service?.name }}</p>
          <p>申請人 {{ record.applicantName }}（{{ maskNationalId(record.nationalId) }}）</p>
          <p>收件時間 {{ record.createdAt }}</p>
          <p>目前狀態 {{ caseStatusLabel[record.status] }}</p>
          <p>此證明僅供無障礙流程示範，不能當正式公文。</p>
        </article>
      </section>
    </template>

    <template v-else>
      <h1 id="page-title" tabindex="-1">找不到這件案件</h1>
      <p class="lead">請回案件查詢，用編號與身分證後四碼重新查。直接改網址不會通過核對。</p>
      <RouterLink class="btn btn-primary" to="/services/query">回到案件查詢</RouterLink>
    </template>
  </div>
</template>
