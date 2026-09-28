<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { forms, getService } from '../catalog'
import { param } from '../format'

const route = useRoute()
const service = computed(() => getService(param(route.params.serviceId)))
const relatedForms = computed(() => forms.filter((item) => item.serviceId === service.value?.id))
</script>

<template>
  <div class="page">
    <template v-if="service">
      <p class="tag">{{ service.category }}</p>
      <h1 id="page-title" tabindex="-1">{{ service.name }}</h1>
      <p class="lead">{{ service.summary }}</p>

      <div class="cluster">
        <RouterLink class="btn btn-primary" :to="`/services/apply/${service.id}`">
          線上申請{{ service.name }}
        </RouterLink>
        <RouterLink class="btn btn-secondary" :to="{ name: 'gov-appointments', query: { service: service.id } }">
          預約臨櫃辦理{{ service.name }}
        </RouterLink>
      </div>

      <section class="section" aria-labelledby="who-title">
        <h2 id="who-title">誰可以申請</h2>
        <p class="prose">{{ service.audience }}</p>
      </section>

      <section class="section" aria-labelledby="docs-title">
        <h2 id="docs-title">應備文件</h2>
        <ul>
          <li v-for="doc in service.documents" :key="doc">{{ doc }}</li>
        </ul>
      </section>

      <section class="section" aria-labelledby="time-title">
        <h2 id="time-title">時間與費用</h2>
        <dl class="dl-grid">
          <div>
            <dt>辦理時間</dt>
            <dd>{{ service.duration }}</dd>
          </div>
          <div>
            <dt>規費</dt>
            <dd>{{ service.feeText }}</dd>
          </div>
        </dl>
      </section>

      <section v-if="relatedForms.length" class="section" aria-labelledby="paper-title">
        <h2 id="paper-title">改用紙本</h2>
        <ul>
          <li v-for="form in relatedForms" :key="form.id">
            <RouterLink :to="`/services/forms/${form.id}`">閱讀並下載{{ form.name }}</RouterLink>
          </li>
        </ul>
      </section>
    </template>

    <template v-else>
      <h1 id="page-title" tabindex="-1">找不到這項服務</h1>
      <p class="lead">網址裡的服務代碼不存在。請回服務總覽重新選擇。</p>
      <RouterLink class="btn btn-primary" to="/services">回到服務總覽</RouterLink>
    </template>
  </div>
</template>
