<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { services, timeSlots } from '../catalog'
import { formatDateWithWeek, param, upcomingWeekdays } from '../format'
import { useGovStore } from '../store'
import type { Appointment, FieldError } from '../types'
import { isValidNationalId } from '../validate'

const route = useRoute()
const store = useGovStore()
const dates = upcomingWeekdays(6)
const phase = ref<'edit' | 'review' | 'done'>('edit')
const errors = ref<FieldError[]>([])
const errorBox = ref<HTMLElement | null>(null)
const done = ref<Appointment | null>(null)
const confirmed = ref(false)

const form = reactive({
  serviceId: '',
  date: '',
  slot: '',
  name: '',
  nationalId: '',
  phone: '',
  note: '',
})

const initialService = param(route.query.service)
if (services.some((item) => item.id === initialService)) form.serviceId = initialService

watch(
  () => [form.serviceId, form.date, form.slot, form.name, form.nationalId, form.phone, form.note],
  (next, previous) => {
    if (previous && next.every((value, index) => value === previous[index])) return
    if (form.date && form.slot && store.slotTaken(form.date, form.slot)) {
      form.slot = ''
      return
    }
    confirmed.value = false
    if (phase.value === 'review') phase.value = 'edit'
  },
)

const serviceName = computed(() => services.find((item) => item.id === form.serviceId)?.name || '未選擇')

function errorOf(id: string) {
  return errors.value.find((item) => item.id === id)?.message || ''
}

function described(id: string) {
  return [errorOf(id) ? `${id}-error` : '', `${id}-help`].filter(Boolean).join(' ')
}

function validate() {
  const nextErrors: FieldError[] = []
  if (!form.serviceId) nextErrors.push({ id: 'visitService', message: '請選擇要辦理的服務。' })
  if (!form.date || !dates.includes(form.date)) {
    nextErrors.push({ id: 'visitDate', message: '請選擇下面列出的其中一個平日。' })
  }
  if (!form.slot) nextErrors.push({ id: 'visitSlot', message: '請選擇一個尚未額滿的時段。' })
  if (form.date && form.slot && store.slotTaken(form.date, form.slot)) {
    nextErrors.push({ id: 'visitSlot', message: '這個時段剛被預約。請改選其他時段。' })
  }
  if (form.name.trim().length < 2) nextErrors.push({ id: 'visitName', message: '請填姓名至少 2 個字。示範可填「陳安心」。' })
  if (!isValidNationalId(form.nationalId)) {
    nextErrors.push({ id: 'visitId', message: '身分證格式不正確。示範可填 A123456789。' })
  }
  if (!/^09[0-9]{8}$/.test(form.phone.trim())) {
    nextErrors.push({ id: 'visitPhone', message: '請填 09 開頭的 10 碼手機，例如 0912000111。' })
  }
  return nextErrors
}

async function review() {
  const nextErrors = validate()
  errors.value = nextErrors
  if (nextErrors.length) {
    await nextTick()
    errorBox.value?.focus()
    return
  }
  phase.value = 'review'
  await nextTick()
  document.getElementById('review-title')?.focus()
}

async function book() {
  if (!confirmed.value) {
    errors.value = [{ id: 'visitConfirm', message: '請勾選確認預約內容。勾選前不會建立預約。' }]
    await nextTick()
    errorBox.value?.focus()
    return
  }
  const nextErrors = validate()
  if (nextErrors.length) {
    phase.value = 'edit'
    errors.value = nextErrors
    await nextTick()
    errorBox.value?.focus()
    return
  }
  done.value = store.bookAppointment({
    serviceId: form.serviceId,
    date: form.date,
    slot: form.slot,
    name: form.name.trim(),
    nationalId: form.nationalId,
    phone: form.phone.trim(),
    note: form.note.trim(),
  })
  phase.value = 'done'
  document.title = `預約 ${done.value.id} | 示範市民服務`
  await nextTick()
  document.getElementById('page-title')?.focus()
}

function backToEdit() {
  phase.value = 'edit'
  errors.value = []
}
</script>

<template>
  <div class="page">
    <template v-if="phase !== 'done'">
      <h1 id="page-title" tabindex="-1">臨櫃預約</h1>
      <p class="lead">
        先選服務、日期與時段，再填聯絡方式。按「檢視預約內容」只會進到確認，還不會預約成功。星期例假日不開放。
      </p>

      <form v-if="phase === 'edit'" class="form" novalidate @submit.prevent="review">
        <div v-if="errors.length" ref="errorBox" tabindex="-1" class="alert alert-error" role="alert">
          <h2>請修正以下欄位</h2>
          <ul>
            <li v-for="item in errors" :key="item.id">
              <a :href="`#${item.id}`">{{ item.message }}</a>
            </li>
          </ul>
        </div>

        <div class="field">
          <label class="lbl" for="visitService">服務 <span class="req">必填</span></label>
          <select
            id="visitService"
            v-model="form.serviceId"
            :aria-invalid="errorOf('visitService') ? 'true' : undefined"
            :aria-describedby="described('visitService')"
          >
            <option value="">請選擇</option>
            <option v-for="service in services" :key="service.id" :value="service.id">{{ service.name }}</option>
          </select>
          <p id="visitService-help" class="help">從服務說明頁進來時，會先幫您選好該項服務，仍可更改。</p>
          <p v-if="errorOf('visitService')" id="visitService-error" class="error-text">錯誤：{{ errorOf('visitService') }}</p>
        </div>

        <fieldset class="fieldset" :aria-describedby="described('visitDate')">
          <legend id="visitDate">日期 <span class="req">必填</span></legend>
          <p id="visitDate-help" class="help">只列出接下來的平日。請選其中一天。</p>
          <div class="slot-list">
            <label v-for="date in dates" :key="date" class="choice">
              <input v-model="form.date" type="radio" name="visit-date" :value="date" />
              {{ formatDateWithWeek(date) }}
            </label>
          </div>
          <p v-if="errorOf('visitDate')" id="visitDate-error" class="error-text">錯誤：{{ errorOf('visitDate') }}</p>
        </fieldset>

        <fieldset class="fieldset" :aria-describedby="described('visitSlot')">
          <legend id="visitSlot">時段 <span class="req">必填</span></legend>
          <p id="visitSlot-help" class="help">已額滿的時段不能選，並用文字標示，不只靠顏色。</p>
          <div class="slot-list">
            <label v-for="slot in timeSlots" :key="slot" class="choice">
              <input
                v-model="form.slot"
                type="radio"
                name="visit-slot"
                :value="slot"
                :disabled="Boolean(form.date) && store.slotTaken(form.date, slot)"
              />
              {{ slot }}
              <span v-if="form.date && store.slotTaken(form.date, slot)">已額滿</span>
            </label>
          </div>
          <p v-if="errorOf('visitSlot')" id="visitSlot-error" class="error-text">錯誤：{{ errorOf('visitSlot') }}</p>
        </fieldset>

        <div class="fields">
          <div class="field">
            <label class="lbl" for="visitName">姓名 <span class="req">必填</span></label>
            <input
              id="visitName"
              v-model="form.name"
              type="text"
              autocomplete="name"
              :aria-invalid="errorOf('visitName') ? 'true' : undefined"
              :aria-describedby="described('visitName')"
            />
            <p id="visitName-help" class="help">要到場的人。示範可填「陳安心」。</p>
            <p v-if="errorOf('visitName')" id="visitName-error" class="error-text">錯誤：{{ errorOf('visitName') }}</p>
          </div>
          <div class="field">
            <label class="lbl" for="visitId">身分證字號 <span class="req">必填</span></label>
            <input
              id="visitId"
              v-model="form.nationalId"
              type="text"
              autocomplete="off"
              :aria-invalid="errorOf('visitId') ? 'true' : undefined"
              :aria-describedby="described('visitId')"
            />
            <p id="visitId-help" class="help">示範可填 A123456789。</p>
            <p v-if="errorOf('visitId')" id="visitId-error" class="error-text">錯誤：{{ errorOf('visitId') }}</p>
          </div>
          <div class="field">
            <label class="lbl" for="visitPhone">手機 <span class="req">必填</span></label>
            <input
              id="visitPhone"
              v-model="form.phone"
              type="tel"
              autocomplete="tel"
              inputmode="numeric"
              :aria-invalid="errorOf('visitPhone') ? 'true' : undefined"
              :aria-describedby="described('visitPhone')"
            />
            <p id="visitPhone-help" class="help">09 開頭共 10 碼，例如 0912000111。</p>
            <p v-if="errorOf('visitPhone')" id="visitPhone-error" class="error-text">錯誤：{{ errorOf('visitPhone') }}</p>
          </div>
          <div class="field">
            <label class="lbl" for="visitNote">給櫃檯的話 <span class="opt">選填</span></label>
            <textarea id="visitNote" v-model="form.note" rows="4" aria-describedby="visitNote-help"></textarea>
            <p id="visitNote-help" class="help">例如需要的協助。可以留白。</p>
          </div>
        </div>

        <button class="btn btn-primary" type="submit">檢視預約內容</button>
      </form>

      <section v-else class="section" aria-labelledby="review-title">
        <h2 id="review-title" tabindex="-1">請確認預約</h2>
        <div v-if="errors.length" ref="errorBox" tabindex="-1" class="alert alert-error" role="alert">
          <p>{{ errors[0]?.message }}</p>
        </div>
        <dl class="dl-grid">
          <div>
            <dt>服務</dt>
            <dd>{{ serviceName }}</dd>
          </div>
          <div>
            <dt>日期</dt>
            <dd>{{ formatDateWithWeek(form.date) }}</dd>
          </div>
          <div>
            <dt>時段</dt>
            <dd>{{ form.slot }}</dd>
          </div>
          <div>
            <dt>姓名</dt>
            <dd>{{ form.name }}</dd>
          </div>
          <div>
            <dt>手機</dt>
            <dd>{{ form.phone }}</dd>
          </div>
          <div>
            <dt>給櫃檯的話</dt>
            <dd>{{ form.note.trim() || '未填' }}</dd>
          </div>
        </dl>
        <div class="field">
          <label class="choice" for="visitConfirm">
            <input id="visitConfirm" v-model="confirmed" type="checkbox" />
            我確認以上時間，了解這是示範預約，不會真的保留櫃檯人力。
          </label>
        </div>
        <div class="cluster">
          <button class="btn btn-secondary" type="button" @click="backToEdit">返回修改</button>
          <button class="btn btn-primary" type="button" @click="book">確認預約</button>
        </div>
      </section>
    </template>

    <template v-else-if="done">
      <h1 id="page-title" tabindex="-1">預約已成立</h1>
      <div class="alert alert-ok" role="status">
        <p>
          預約編號 <strong>{{ done.id }}</strong>。{{ serviceName }}，{{ formatDateWithWeek(done.date) }} {{ done.slot }}。
        </p>
      </div>
      <p>請自行記下編號。這個示範不會寄簡訊。</p>
      <RouterLink class="btn btn-secondary" to="/services">回到服務總覽</RouterLink>
    </template>
  </div>
</template>
