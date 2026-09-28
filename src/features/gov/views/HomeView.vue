<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { announcements, services } from '../catalog'
import DemoCaseTable from '../components/DemoCaseTable.vue'
import { formatDate } from '../format'

const categories = [...new Set(services.map((item) => item.category))]

const actions = [
  {
    title: '我要申請',
    text: '從服務說明看應備文件與辦理天數，再進入多步驟申請。送出前會請您再確認一次。',
    to: '#catalog',
    link: '瀏覽可申請的服務',
  },
  {
    title: '我要查進度',
    text: '用案件編號與身分證後四碼查詢。狀態包含審核中、待補正、已核准與未核准。',
    to: '/services/query',
    link: '前往案件查詢',
  },
  {
    title: '我要補件',
    text: '待補正的案件會寫明缺什麼。可以在案件頁記錄補上的檔名。',
    to: '/services/cases/GV114-000128',
    link: '打開待補正的示範案件',
  },
  {
    title: '我要預約臨櫃',
    text: '選擇服務、平日日期與時段。已額滿的時段會標示文字，不能選。',
    to: '/services/appointments',
    link: '前往臨櫃預約',
  },
  {
    title: '我要繳費',
    text: '查詢待繳規費。確認金額與方式後才完成示範繳費，不會真正扣款。',
    to: '/services/fees',
    link: '前往規費繳納',
  },
  {
    title: '我要下載表單',
    text: '紙本申請書以文字顯示，可在頁面閱讀，也可以下載純文字檔。',
    to: '/services/forms',
    link: '前往表單下載',
  },
]
</script>

<template>
  <div class="page">
    <h1 id="page-title" tabindex="-1">市民服務總覽</h1>
    <p class="lead">
      這裡示範政府案件常見的申請、查詢、補件、預約與繳費。操作可以用鍵盤完成，文字對比、字級與行距可在頁面最上方調整。
    </p>

    <section class="section" aria-labelledby="actions-title">
      <h2 id="actions-title">依您要辦的事開始</h2>
      <ul class="action-grid">
        <li v-for="action in actions" :key="action.title" class="card">
          <h3>{{ action.title }}</h3>
          <p>{{ action.text }}</p>
          <a v-if="action.to.startsWith('#')" :href="action.to">{{ action.link }}</a>
          <RouterLink v-else :to="action.to">{{ action.link }}</RouterLink>
        </li>
      </ul>
    </section>

    <section id="catalog" class="section" aria-labelledby="catalog-title">
      <h2 id="catalog-title">依類別找服務</h2>
      <div v-for="category in categories" :key="category" class="category-block">
        <h3>{{ category }}</h3>
        <ul class="cards">
          <li v-for="service in services.filter((item) => item.category === category)" :key="service.id" class="card">
            <h4>{{ service.name }}</h4>
            <p>{{ service.summary }}</p>
            <p class="meta">辦理時間：{{ service.duration }}</p>
            <RouterLink :to="`/services/items/${service.id}`">查看{{ service.name }}的辦理說明</RouterLink>
          </li>
        </ul>
      </div>
    </section>

    <section class="section" aria-labelledby="news-title">
      <h2 id="news-title">公告</h2>
      <ul class="news-list">
        <li v-for="item in announcements" :key="item.id">
          <time :datetime="item.date">{{ formatDate(item.date) }}</time>
          <h3>{{ item.title }}</h3>
          <p>{{ item.body }}</p>
        </li>
      </ul>
    </section>

    <section class="section" aria-labelledby="sample-title">
      <h2 id="sample-title">可直接試的示範案件</h2>
      <p>完整編號與後四碼在「案件查詢」。下面先列出申請人，避免首頁表格在放大文字時過寬。</p>
      <DemoCaseTable compact />
      <p class="cluster">
        <RouterLink class="btn btn-primary" to="/services/query">使用這些資料查詢案件</RouterLink>
      </p>
    </section>
  </div>
</template>
