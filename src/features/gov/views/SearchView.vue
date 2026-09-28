<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { searchContent } from '../catalog'
import { param } from '../format'

const route = useRoute()
const keyword = computed(() => param(route.query.q))
const hits = computed(() => searchContent(keyword.value))
</script>

<template>
  <div class="page">
    <h1 id="page-title" tabindex="-1">搜尋</h1>
    <p v-if="!keyword" class="lead">請在頁面上方的「搜尋服務與說明」輸入關鍵字，再按「搜尋」。打字時不會立刻離開本頁。</p>
    <template v-else>
      <p class="lead">關鍵字「{{ keyword }}」。</p>
      <p class="live" role="status">找到 {{ hits.length }} 筆結果。</p>
      <ul v-if="hits.length" class="results">
        <li v-for="hit in hits" :key="`${hit.href}-${hit.title}`" class="card">
          <h2>
            <RouterLink :to="hit.href">{{ hit.title }}</RouterLink>
          </h2>
          <p>{{ hit.excerpt }}</p>
        </li>
      </ul>
      <p v-else class="empty">沒有相符的服務或說明。可以試「補助」、「停車」或「補正」。</p>
    </template>
  </div>
</template>
