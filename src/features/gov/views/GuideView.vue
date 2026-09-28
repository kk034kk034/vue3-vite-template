<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { glossary, guidePages } from '../catalog'
import { useGovStore } from '../store'

const store = useGovStore()
const confirming = ref(false)
const message = ref('')
const messageRef = ref<HTMLElement | null>(null)

const keys = [
  { key: 'Alt + U', name: '跳至主選單' },
  { key: 'Alt + S', name: '跳至搜尋' },
  { key: 'Alt + C', name: '跳至主要內容' },
  { key: 'Alt + B', name: '跳至頁尾' },
]

async function resetDemo() {
  store.resetDemo()
  confirming.value = false
  message.value = '已還原示範資料。您在這台瀏覽器新建立的申請、補件、繳費與預約都已刪除。'
  await nextTick()
  messageRef.value?.focus()
}
</script>

<template>
  <div class="page">
    <h1 id="page-title" tabindex="-1">網站導覽</h1>
    <p class="lead">
      本站各頁都有相同的主選單、頁面路徑與頁尾。下面是所有公開頁面。案件內頁要從查詢結果進去，避免只靠編號打開。
    </p>

    <section class="section" aria-labelledby="map-title">
      <h2 id="map-title">全站頁面</h2>
      <ul class="results">
        <li v-for="page in guidePages" :key="page.href" class="card">
          <h3>
            <RouterLink :to="page.href">{{ page.title }}</RouterLink>
          </h3>
          <p>{{ page.text }}</p>
        </li>
      </ul>
    </section>

    <section class="section" aria-labelledby="keys-title">
      <h2 id="keys-title">快速鍵</h2>
      <p class="prose">
        快速鍵標在頁面最上方的跳頁連結。Windows 的 Chrome 與 Edge 多半是 Alt 加按鍵，Firefox 多半是 Alt + Shift 加按鍵。若按鍵被瀏覽器占用，請改用 Tab，跳頁連結會在第一個焦點出現。
      </p>
      <div class="table-wrap">
        <table class="data-table">
          <caption>
            本站快速鍵
          </caption>
          <thead>
            <tr>
              <th scope="col">按鍵</th>
              <th scope="col">前往</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in keys" :key="item.key">
              <th scope="row">{{ item.key }}</th>
              <td>{{ item.name }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section id="glossary" class="section" aria-labelledby="glossary-title">
      <h2 id="glossary-title">詞彙解釋</h2>
      <p>申請頁出現這些詞時，可以回到這裡看白話說明。</p>
      <dl class="glossary">
        <template v-for="entry in glossary" :key="entry.term">
          <dt>{{ entry.term }}</dt>
          <dd>{{ entry.definition }}</dd>
        </template>
      </dl>
    </section>

    <section class="section" aria-labelledby="reset-title">
      <h2 id="reset-title">還原示範資料</h2>
      <p class="prose">會刪除您在這台瀏覽器送出的申請、補件、預約與示範繳費，回到一開始的五件範例。正式資料庫不存在，所以沒有辦法復原已刪除的示範。</p>
      <button v-if="!confirming" class="btn btn-secondary" type="button" @click="confirming = true">還原示範資料</button>
      <div v-else class="alert alert-error">
        <p>確定要刪除這台瀏覽器裡新增的示範案件與預約嗎？</p>
        <div class="cluster">
          <button class="btn btn-primary" type="button" @click="resetDemo">確定還原</button>
          <button class="btn btn-secondary" type="button" @click="confirming = false">取消，保留資料</button>
        </div>
      </div>
      <p v-if="message" ref="messageRef" tabindex="-1" class="alert alert-ok" role="status">{{ message }}</p>
    </section>
  </div>
</template>
