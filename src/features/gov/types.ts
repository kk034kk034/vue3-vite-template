export type CaseStatus = 'received' | 'reviewing' | 'supplement' | 'approved' | 'rejected'

export type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'date'

export interface FieldOption {
  value: string
  label: string
}

export interface FieldDef {
  key: string
  label: string
  type: FieldType
  required: boolean
  help: string
  options?: FieldOption[]
  autocomplete?: string
}

export interface GovService {
  id: string
  name: string
  category: string
  summary: string
  audience: string
  duration: string
  feeText: string
  documents: string[]
  fields: FieldDef[]
  keywords: string[]
}

export interface FormTemplate {
  id: string
  serviceId: string
  name: string
  description: string
  body: string
}

export interface FaqItem {
  id: string
  question: string
  answer: string[]
}

export interface GlossaryEntry {
  term: string
  definition: string
}

export interface TimelineEvent {
  at: string
  title: string
  detail: string
}

export interface CaseFee {
  item: string
  amount: number
  deadline: string
  paid: boolean
  method?: string
  paidAt?: string
}

export interface GovCase {
  id: string
  serviceId: string
  applicantName: string
  nationalId: string
  phone: string
  email: string
  address: string
  details: Record<string, string>
  attachments: { purpose: string; names: string[] }[]
  status: CaseStatus
  createdAt: string
  supplementNote?: string
  decisionNote?: string
  timeline: TimelineEvent[]
  fee: CaseFee | null
}

export interface Appointment {
  id: string
  serviceId: string
  date: string
  slot: string
  name: string
  nationalId: string
  phone: string
  note: string
  createdAt: string
}

export interface FieldError {
  id: string
  message: string
}

export const caseStatusLabel: Record<CaseStatus, string> = {
  received: '已收件',
  reviewing: '審核中',
  supplement: '待補正',
  approved: '已核准',
  rejected: '未核准',
}

export const caseStatusDetail: Record<CaseStatus, string> = {
  received: '本處已收到申請，尚未開始審查。',
  reviewing: '承辦人員正在審查資料。',
  supplement: '需要補齊或修正文件後，才會繼續審查。',
  approved: '申請已核准。若有規費，請依頁面期限繳納。',
  rejected: '申請未核准。原因寫在案件頁，可備齊資料後重新申請。',
}
