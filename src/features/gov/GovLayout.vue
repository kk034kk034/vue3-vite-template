<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { a11y, setContrast, setFont, setSpacing, type ContrastMode, type FontScale, type SpacingMode } from './a11y'
import { agency, getForm, getService } from './catalog'
import { param } from './format'
import './gov.css'

const route = useRoute()
const router = useRouter()
const keyword = ref('')

const navItems = [
  { name: 'gov-home', label: '服務總覽' },
  { name: 'gov-query', label: '案件查詢' },
  { name: 'gov-appointments', label: '臨櫃預約' },
  { name: 'gov-fees', label: '規費繳納' },
  { name: 'gov-forms', label: '表單下載' },
  { name: 'gov-faq', label: '常見問答' },
]

function focusPageTitle() {
  if (route.hash) return
  document.getElementById('page-title')?.focus()
}

onMounted(async () => {
  await nextTick()
  focusPageTitle()
})

watch(
  () => route.path,
  async () => {
    await nextTick()
    focusPageTitle()
  },
  { flush: 'post' },
)

const crumbs = computed(() => {
  const home = { label: '服務總覽', to: '/services' }
  const current = (label: string) => [{ ...home, to: '/services' }, { label, to: '' }]
  const service = getService(param(route.params.serviceId))
  const form = getForm(param(route.params.formId))

  switch (route.name) {
    case 'gov-home':
      return [{ label: '服務總覽', to: '' }]
    case 'gov-service':
      return [...current(service?.name || '服務說明').slice(0, 1), { label: service?.name || '服務說明', to: '' }]
    case 'gov-apply':
      return [
        home,
        { label: service?.name || '服務說明', to: service ? `/services/items/${service.id}` : '' },
        { label: '線上申請', to: '' },
      ]
    case 'gov-query':
      return current('案件查詢')
    case 'gov-case':
      return [home, { label: '案件查詢', to: '/services/query' }, { label: param(route.params.caseId) || '案件', to: '' }]
    case 'gov-appointments':
      return current('臨櫃預約')
    case 'gov-fees':
      return current('規費繳納')
    case 'gov-search':
      return current('搜尋')
    case 'gov-faq':
      return current('常見問答')
    case 'gov-guide':
      return current('網站導覽')
    case 'gov-accessibility':
      return current('無障礙聲明')
    case 'gov-forms':
      return current('表單下載')
    case 'gov-form':
      return [home, { label: '表單下載', to: '/services/forms' }, { label: form?.name || '表單', to: '' }]
    default:
      return current('市民服務')
  }
})

function isCurrent(name: string) {
  if (route.name === name) return true
  return name === 'gov-forms' && route.name === 'gov-form'
}

function onSearch() {
  const q = keyword.value.trim()
  router.push({ name: 'gov-search', query: q ? { q } : {} })
}

function chooseFont(value: FontScale) {
  setFont(value)
}

function chooseContrast(value: ContrastMode) {
  setContrast(value)
}

function chooseSpacing(value: SpacingMode) {
  setSpacing(value)
}
</script>

<template>
  <div
    class="gov-portal"
    :data-font="a11y.font"
    :data-contrast="a11y.contrast"
    :data-spacing="a11y.spacing"
  >
    <div class="skip-links">
      <a class="skip-link" href="#gov-nav" accesskey="U">跳至主選單</a>
      <a class="skip-link" href="#gov-search" accesskey="S">跳至搜尋</a>
      <a class="skip-link" href="#gov-content" accesskey="C">跳至主要內容</a>
      <a class="skip-link" href="#gov-footer" accesskey="B">跳至頁尾</a>
    </div>

    <div class="utility">
      <fieldset class="choice-set">
        <legend>文字大小</legend>
        <label class="choice">
          <input type="radio" name="gov-font" value="md" :checked="a11y.font === 'md'" @change="chooseFont('md')" />
          一般
        </label>
        <label class="choice">
          <input type="radio" name="gov-font" value="lg" :checked="a11y.font === 'lg'" @change="chooseFont('lg')" />
          150%
        </label>
        <label class="choice">
          <input type="radio" name="gov-font" value="xl" :checked="a11y.font === 'xl'" @change="chooseFont('xl')" />
          200%
        </label>
      </fieldset>

      <fieldset class="choice-set">
        <legend>色彩</legend>
        <label class="choice">
          <input
            type="radio"
            name="gov-contrast"
            value="default"
            :checked="a11y.contrast === 'default'"
            @change="chooseContrast('default')"
          />
          一般
        </label>
        <label class="choice">
          <input
            type="radio"
            name="gov-contrast"
            value="high"
            :checked="a11y.contrast === 'high'"
            @change="chooseContrast('high')"
          />
          高對比
        </label>
        <label class="choice">
          <input
            type="radio"
            name="gov-contrast"
            value="plain"
            :checked="a11y.contrast === 'plain'"
            @change="chooseContrast('plain')"
          />
          瀏覽器色彩
        </label>
      </fieldset>

      <fieldset class="choice-set">
        <legend>行距</legend>
        <label class="choice">
          <input
            type="radio"
            name="gov-spacing"
            value="default"
            :checked="a11y.spacing === 'default'"
            @change="chooseSpacing('default')"
          />
          一般
        </label>
        <label class="choice">
          <input
            type="radio"
            name="gov-spacing"
            value="relaxed"
            :checked="a11y.spacing === 'relaxed'"
            @change="chooseSpacing('relaxed')"
          />
          加寬
        </label>
      </fieldset>

      <p class="utility-links">
        <RouterLink to="/services/guide">網站導覽與快速鍵</RouterLink>
        <RouterLink to="/services/accessibility">無障礙聲明</RouterLink>
      </p>
      <p class="live" role="status">{{ a11y.message }}</p>
    </div>

    <header class="site-header">
      <div class="header-inner">
        <RouterLink class="brand" to="/services">
          <span class="brand-kicker">示範機關</span>
          <span class="brand-title">{{ agency.name }}</span>
        </RouterLink>

        <form id="gov-search" class="header-search" role="search" @submit.prevent="onSearch">
          <label class="lbl" for="gov-search-input">搜尋服務與說明</label>
          <div class="search-row">
            <input id="gov-search-input" v-model="keyword" type="search" name="q" autocomplete="off" />
            <button class="btn btn-secondary" type="submit">搜尋</button>
          </div>
        </form>
      </div>

      <nav id="gov-nav" class="primary-nav" aria-label="主要">
        <ul class="nav-list">
          <li v-for="item in navItems" :key="item.name">
            <RouterLink v-slot="{ href, navigate }" custom :to="{ name: item.name }">
              <a class="nav-link" :href="href" :aria-current="isCurrent(item.name) ? 'page' : undefined" @click="navigate">
                {{ item.label }}
              </a>
            </RouterLink>
          </li>
        </ul>
      </nav>
    </header>

    <div class="demo-note">
      <p>
        <strong>這是無障礙流程示範。</strong>
        資料只存在這台瀏覽器，不會送到伺服器，也沒有法律效力。請用查詢頁上的示範身分，不要輸入真實證件或帳號。
      </p>
    </div>

    <div class="shell">
      <nav class="crumbs" aria-label="頁面路徑">
        <ol>
          <li v-for="(crumb, index) in crumbs" :key="`${crumb.label}-${index}`">
            <RouterLink v-if="crumb.to && index < crumbs.length - 1" :to="crumb.to">{{ crumb.label }}</RouterLink>
            <span v-else aria-current="page">{{ crumb.label }}</span>
          </li>
        </ol>
      </nav>

      <main id="gov-content" tabindex="-1">
        <RouterView />
      </main>
    </div>

    <footer id="gov-footer" class="site-footer">
      <div class="footer-grid">
        <section>
          <h2>聯絡{{ agency.name }}</h2>
          <p>{{ agency.office }}</p>
          <p>電話 <a :href="`tel:${agency.phone}`">{{ agency.phone }}</a></p>
          <p>信箱 <a :href="`mailto:${agency.email}`">{{ agency.email }}</a></p>
          <p>辦公時間：{{ agency.hours }}</p>
        </section>
        <nav aria-label="頁尾">
          <h2>其他說明</h2>
          <ul class="footer-links">
            <li><RouterLink to="/services/guide">網站導覽</RouterLink></li>
            <li><RouterLink to="/services/guide#glossary">詞彙解釋</RouterLink></li>
            <li><RouterLink to="/services/accessibility">無障礙聲明</RouterLink></li>
            <li><RouterLink to="/services/faq">常見問答</RouterLink></li>
            <li><RouterLink to="/dashboard">既有管理後台</RouterLink></li>
          </ul>
        </nav>
      </div>
      <p class="footer-meta">本頁依 WCAG 2.2 AAA 的常見作法設計，供流程示範。正式上線前仍須人工檢測。</p>
    </footer>
  </div>
</template>
