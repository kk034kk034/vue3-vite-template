import type { RouteLocationNormalized } from 'vue-router'
import { getForm, getService } from './catalog'
import { param } from './format'

export function govDocumentTitle(to: RouteLocationNormalized) {
  if (!to.path.startsWith('/services')) return ''
  const service = getService(param(to.params.serviceId))
  const form = getForm(param(to.params.formId))

  switch (to.name) {
    case 'gov-home':
      return '服務總覽'
    case 'gov-service':
      return service?.name || '找不到服務'
    case 'gov-apply':
      return service ? `申請${service.name}` : '線上申請'
    case 'gov-query':
      return '案件查詢'
    case 'gov-case':
      return `案件 ${param(to.params.caseId)}`.trim()
    case 'gov-appointments':
      return '臨櫃預約'
    case 'gov-fees':
      return '規費繳納'
    case 'gov-search': {
      const keyword = param(to.query.q)
      return keyword ? `搜尋 ${keyword}` : '搜尋'
    }
    case 'gov-faq':
      return '常見問答'
    case 'gov-guide':
      return '網站導覽'
    case 'gov-accessibility':
      return '無障礙聲明'
    case 'gov-forms':
      return '表單下載'
    case 'gov-form':
      return form?.name || '找不到表單'
    default:
      return '市民服務'
  }
}
