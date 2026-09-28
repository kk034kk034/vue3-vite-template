import { defineStore } from 'pinia'
import { getService, timeSlots } from './catalog'
import { isoDate, nowStamp, upcomingWeekdays } from './format'
import type { Appointment, CaseFee, CaseStatus, GovCase } from './types'

const storageKey = 'gov-aaa-demo-v1'

interface PersistedState {
  version: 1
  cases: GovCase[]
  appointments: Appointment[]
}

function nextId(prefix: string, current: string[]) {
  const numbers = current.map((id) => Number(id.slice(-6))).filter((value) => Number.isFinite(value))
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1
  return `${prefix}-${String(next).padStart(6, '0')}`
}

function createSeed(): PersistedState {
  const visitDay = upcomingWeekdays(1)[0] || isoDate(1)
  const feeDeadline = upcomingWeekdays(6).at(-1) || isoDate(10)

  const cases: GovCase[] = [
    {
      id: 'GV114-000128',
      serviceId: 'disability-card',
      applicantName: '陳安心',
      nationalId: 'A123456789',
      phone: '0912000111',
      email: 'an@example.tw',
      address: '示範市中正路 1 號',
      details: { certificateNo: '不詳', reason: 'lost' },
      attachments: [{ purpose: '國民身分證正反面', names: ['id-front.txt'] }],
      status: 'supplement',
      createdAt: '2026-09-12 09:20',
      supplementNote: '請補上兩吋照片。照片可以是示意檔，檔名會被記錄，檔案本身不會上傳。',
      timeline: [
        { at: '2026-09-12 09:20', title: '已收件', detail: '線上申請已受理，編號 GV114-000128。' },
        { at: '2026-09-16 14:05', title: '待補正', detail: '缺兩吋照片，審查暫停。' },
      ],
      fee: null,
    },
    {
      id: 'GV114-000086',
      serviceId: 'welfare-subsidy',
      applicantName: '林宜君',
      nationalId: 'B123456780',
      phone: '0922000222',
      email: '',
      address: '示範市民族路 8 號',
      details: { householdSize: '3', monthlyIncome: '28000', account: '000-000000000000' },
      attachments: [
        { purpose: '國民身分證正反面', names: ['id.txt'] },
        { purpose: '全戶戶籍資料', names: ['household.txt'] },
        { purpose: '最近三個月收入證明', names: ['income.txt'] },
      ],
      status: 'reviewing',
      createdAt: '2026-09-08 11:02',
      timeline: [
        { at: '2026-09-08 11:02', title: '已收件', detail: '文件數量符合申請項目。' },
        { at: '2026-09-18 16:40', title: '審核中', detail: '承辦人員正在核對收入與戶籍。' },
      ],
      fee: null,
    },
    {
      id: 'GV114-000041',
      serviceId: 'facility-permit',
      applicantName: '張文彥',
      nationalId: 'C123456781',
      phone: '0933000333',
      email: 'wen@example.tw',
      address: '示範市和平路 20 號',
      details: {
        facility: 'hall',
        startDate: '2026-10-20',
        endDate: '2026-10-20',
        purpose: '社區閱讀會，約 30 人，不售票。',
      },
      attachments: [
        { purpose: '活動計畫摘要', names: ['plan.txt'] },
        { purpose: '保險證明', names: ['insurance.txt'] },
      ],
      status: 'approved',
      createdAt: '2026-08-21 10:18',
      decisionNote: '同意使用市民活動中心禮堂。請於活動結束後回復場地原狀。',
      timeline: [
        { at: '2026-08-21 10:18', title: '已收件', detail: '已收到使用申請。' },
        { at: '2026-09-02 15:00', title: '已核准', detail: '使用許可已核准，規費已繳清。' },
      ],
      fee: {
        item: '活動中心禮堂使用規費',
        amount: 1200,
        deadline: '2026-09-15',
        paid: true,
        method: '轉帳（示範）',
        paidAt: '2026-09-04 09:12',
      },
    },
    {
      id: 'GV114-000203',
      serviceId: 'facility-permit',
      applicantName: '黃秋月',
      nationalId: 'D123456782',
      phone: '0944000444',
      email: '',
      address: '示範市新生路 5 號',
      details: {
        facility: 'park',
        startDate: '2026-11-02',
        endDate: '2026-11-02',
        purpose: '鄰里音樂會，約 80 人，免費入場。',
      },
      attachments: [
        { purpose: '活動計畫摘要', names: ['concert.txt'] },
        { purpose: '保險證明', names: ['cover.txt'] },
      ],
      status: 'approved',
      createdAt: '2026-09-20 13:44',
      decisionNote: '同意使用中正公園草地。請先完成規費示範繳納，許可才算生效。',
      timeline: [
        { at: '2026-09-20 13:44', title: '已收件', detail: '已收到場地申請。' },
        { at: '2026-09-25 11:20', title: '已核准', detail: '審查通過，等待繳納使用規費。' },
      ],
      fee: {
        item: '公園場地使用規費',
        amount: 1200,
        deadline: feeDeadline,
        paid: false,
      },
    },
    {
      id: 'GV114-000156',
      serviceId: 'business-change',
      applicantName: '王大為',
      nationalId: 'E123456783',
      phone: '0955000555',
      email: 'dawei@example.tw',
      address: '示範市忠孝路 9 號',
      details: { ban: '12345675', changeItem: 'address', changeDetail: '示範市市府路 3 號' },
      attachments: [
        { purpose: '登記抄本', names: ['registry.txt'] },
        { purpose: '負責人身分證明', names: ['owner.txt'] },
      ],
      status: 'rejected',
      createdAt: '2026-08-02 09:00',
      decisionNote: '統一編號與登記抄本的商號名稱不一致，本次不予變更。可更正後重新申請。',
      timeline: [
        { at: '2026-08-02 09:00', title: '已收件', detail: '已收到變更申請。' },
        { at: '2026-08-12 17:10', title: '未核准', detail: '登記資料與申請內容不符。' },
      ],
      fee: null,
    },
  ]

  const appointments: Appointment[] = [
    {
      id: 'AP114-000017',
      serviceId: 'welfare-subsidy',
      date: visitDay,
      slot: timeSlots[0] || '09:00–09:30',
      name: '林宜君',
      nationalId: 'B123456780',
      phone: '0922000222',
      note: '諮詢收入文件要準備哪些。',
      createdAt: '2026-09-22 08:40',
    },
  ]

  return { version: 1, cases, appointments }
}

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return createSeed()
    const parsed = JSON.parse(raw) as PersistedState
    if (parsed.version !== 1 || !Array.isArray(parsed.cases) || !Array.isArray(parsed.appointments)) {
      return createSeed()
    }
    return parsed
  } catch {
    return createSeed()
  }
}

export const useGovStore = defineStore('gov-services', {
  state: loadState,
  actions: {
    persist() {
      const payload: PersistedState = {
        version: 1,
        cases: this.cases,
        appointments: this.appointments,
      }
      localStorage.setItem(storageKey, JSON.stringify(payload))
    },
    resetDemo() {
      const seed = createSeed()
      this.cases = seed.cases
      this.appointments = seed.appointments
      this.persist()
    },
    casesByNationalId(nationalId: string) {
      const id = nationalId.trim().toUpperCase()
      return this.cases.filter((item) => item.nationalId === id)
    },
    caseByNumber(caseId: string, last4: string) {
      const id = caseId.trim().toUpperCase()
      return this.cases.find((item) => item.id === id && item.nationalId.slice(-4) === last4.trim())
    },
    caseById(caseId: string) {
      return this.cases.find((item) => item.id === caseId.trim().toUpperCase())
    },
    submitCase(input: {
      serviceId: string
      name: string
      nationalId: string
      phone: string
      email: string
      address: string
      details: Record<string, string>
      attachments: { purpose: string; names: string[] }[]
    }) {
      const record: GovCase = {
        id: nextId('GV114', this.cases.map((item) => item.id)),
        serviceId: input.serviceId,
        applicantName: input.name.trim(),
        nationalId: input.nationalId.trim().toUpperCase(),
        phone: input.phone.trim(),
        email: input.email.trim(),
        address: input.address.trim(),
        details: { ...input.details },
        attachments: input.attachments,
        status: 'received',
        createdAt: nowStamp(),
        timeline: [
          {
            at: nowStamp(),
            title: '已收件',
            detail: '這是示範收件。沒有承辦人會看到這份申請。',
          },
        ],
        fee: feeFor(input.serviceId),
      }
      this.cases.unshift(record)
      this.persist()
      return record
    },
    addSupplement(caseId: string, files: { purpose: string; names: string[] }[], note: string) {
      const record = this.caseById(caseId)
      if (!record || record.status !== 'supplement') return null
      record.attachments.push(...files)
      record.status = 'reviewing' satisfies CaseStatus
      record.supplementNote = undefined
      record.timeline.push({
        at: nowStamp(),
        title: '已補件',
        detail: note.trim() || '申請人已補充文件，恢復審查。',
      })
      this.persist()
      return record
    },
    payFee(caseId: string, method: string) {
      const record = this.caseById(caseId)
      if (!record?.fee || record.fee.paid) return null
      record.fee.paid = true
      record.fee.method = method
      record.fee.paidAt = nowStamp()
      record.timeline.push({
        at: record.fee.paidAt,
        title: '已繳費（示範）',
        detail: `已以「${method}」完成示範繳費，沒有實際扣款。`,
      })
      this.persist()
      return record
    },
    bookAppointment(input: Omit<Appointment, 'id' | 'createdAt'>) {
      const record: Appointment = {
        ...input,
        nationalId: input.nationalId.trim().toUpperCase(),
        id: nextId('AP114', this.appointments.map((item) => item.id)),
        createdAt: nowStamp(),
      }
      this.appointments.unshift(record)
      this.persist()
      return record
    },
    slotTaken(date: string, slot: string) {
      return this.appointments.some((item) => item.date === date && item.slot === slot)
    },
  },
})

function feeFor(serviceId: string): CaseFee | null {
  if (serviceId !== 'facility-permit' || !getService(serviceId)) return null
  return {
    item: '場地使用規費',
    amount: 1200,
    deadline: upcomingWeekdays(8).at(-1) || isoDate(14),
    paid: false,
  }
}
