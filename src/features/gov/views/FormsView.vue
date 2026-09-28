<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { forms, getForm, getService } from '../catalog'
import { downloadText, param } from '../format'

const route = useRoute()
const form = computed(() => getForm(param(route.params.formId)))
const serviceName = computed(() => (form.value ? getService(form.value.serviceId)?.name : ''))

function save() {
  if (!form.value) return
  downloadText(`${form.value.name}.txt`, form.value.body)
}
</script>

<template>
  <div class="page">
    <template v-if="!param(route.params.formId)">
      <h1 id="page-title" tabindex="-1">表單下載</h1>
      <p class="lead">紙本表單先在頁面上以文字呈現，再用按鈕下載純文字檔。沒有把表單做成圖片。</p>
      <ul class="results">
        <li v-for="item in forms" :key="item.id" class="card">
          <h2>{{ item.name }}</h2>
          <p>{{ item.description }}</p>
          <RouterLink :to="`/services/forms/${item.id}`">閱讀{{ item.name }}</RouterLink>
        </li>
      </ul>
    </template>

    <template v-else-if="form">
      <h1 id="page-title" tabindex="-1">{{ form.name }}</h1>
      <p class="lead">{{ form.description }}這份表單對應{{ serviceName }}。線上申請不必另交紙本。</p>
      <div class="cluster">
        <button class="btn btn-primary" type="button" @click="save">下載{{ form.name }}的純文字檔</button>
        <RouterLink v-if="form.serviceId" class="btn btn-secondary" :to="`/services/apply/${form.serviceId}`">
          改為線上申請{{ serviceName }}
        </RouterLink>
      </div>
      <article class="receipt" aria-label="表單內容">
        <pre class="form-text">{{ form.body }}</pre>
      </article>
    </template>

    <template v-else>
      <h1 id="page-title" tabindex="-1">找不到這份表單</h1>
      <p class="lead">請回表單列表重新選擇。</p>
      <RouterLink class="btn btn-primary" to="/services/forms">回到表單下載</RouterLink>
    </template>
  </div>
</template>
