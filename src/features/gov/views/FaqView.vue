<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { faqs } from '../catalog'
import { param } from '../format'

const route = useRoute()
const openId = ref(param(route.hash).replace('#', ''))

watch(
  () => route.hash,
  async (hash) => {
    const id = hash.replace('#', '')
    if (!id) return
    openId.value = id
    await nextTick()
    document.getElementById(id)?.querySelector('button')?.focus()
  },
)

function toggle(id: string) {
  openId.value = openId.value === id ? '' : id
}
</script>

<template>
  <div class="page">
    <h1 id="page-title" tabindex="-1">常見問答</h1>
    <p class="lead">每個問題都是按鈕。展開後答案留在頁面上，不只在滑鼠移上去時出現。</p>
    <div class="accordion">
      <section v-for="item in faqs" :id="item.id" :key="item.id">
        <h2>
          <button
            type="button"
            :aria-expanded="openId === item.id"
            :aria-controls="`${item.id}-panel`"
            @click="toggle(item.id)"
          >
            {{ item.question }}
            <span>{{ openId === item.id ? '收合' : '展開' }}</span>
          </button>
        </h2>
        <div v-show="openId === item.id" :id="`${item.id}-panel`">
          <p v-for="(paragraph, index) in item.answer" :key="index">{{ paragraph }}</p>
        </div>
      </section>
    </div>
  </div>
</template>
