import type { FieldDef, FieldError, GovService } from './types'
import { isoDate } from './format'

const letterCode: Record<string, number> = {
  A: 10,
  B: 11,
  C: 12,
  D: 13,
  E: 14,
  F: 15,
  G: 16,
  H: 17,
  I: 34,
  J: 18,
  K: 19,
  L: 20,
  M: 21,
  N: 22,
  O: 35,
  P: 23,
  Q: 24,
  R: 25,
  S: 26,
  T: 27,
  U: 28,
  V: 29,
  W: 32,
  X: 30,
  Y: 31,
  Z: 33,
}

export function isValidNationalId(raw: string) {
  const id = raw.trim().toUpperCase()
  if (!/^[A-Z][0-9]{9}$/.test(id)) return false
  const code = letterCode[id[0]]
  if (!code) return false
  const digits = [Math.floor(code / 10), code % 10, ...id.slice(1).split('').map(Number)]
  const weights = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1]
  const sum = digits.reduce((total, digit, index) => total + digit * weights[index], 0)
  return sum % 10 === 0
}

export function isValidBan(raw: string) {
  if (!/^[0-9]{8}$/.test(raw)) return false
  const weights = [1, 2, 1, 2, 1, 2, 4, 1]
  const products = raw.split('').map((char, index) => Number(char) * weights[index])
  const sum = products.reduce((total, product) => {
    const ones = Math.floor(product / 10) + (product % 10)
    return total + (ones === 10 ? 1 : ones)
  }, 0)
  if (sum % 5 === 0) return true
  return raw[6] === '7' && (sum + 1) % 5 === 0
}

export function validateIdentity(input: {
  name: string
  nationalId: string
  phone: string
  email: string
  address: string
}): FieldError[] {
  const errors: FieldError[] = []
  const name = input.name.trim()
  if (name.length < 2) {
    errors.push({ id: 'name', message: '請填真實姓名欄位至少 2 個字。示範可填「陳安心」。' })
  }
  if (!isValidNationalId(input.nationalId)) {
    errors.push({
      id: 'nationalId',
      message: '身分證格式不正確。第一碼為英文字母，後面 9 碼數字。示範可填 A123456789。',
    })
  }
  if (!/^09[0-9]{8}$/.test(input.phone.trim())) {
    errors.push({ id: 'phone', message: '請填 09 開頭的 10 碼手機，例如 0912000111。中間不要加橫線。' })
  }
  if (input.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.push({ id: 'email', message: '電子郵件需要包含 @ 與網域，例如 name@example.tw。沒有信箱可以留白。' })
  }
  if (input.address.trim().length < 6) {
    errors.push({ id: 'address', message: '請填通訊地址，至少包含路名與號碼。示範可填「示範市中正路 1 號」。' })
  }
  return errors
}

export function validateDetails(service: GovService, details: Record<string, string>): FieldError[] {
  const errors: FieldError[] = []
  for (const field of service.fields) {
    const value = (details[field.key] || '').trim()
    if (field.required && !value) {
      errors.push({ id: field.key, message: `請填寫${field.label}。${field.help}` })
      continue
    }
    errors.push(...validateField(service, field, value, details))
  }
  return errors
}

function validateField(
  service: GovService,
  field: FieldDef,
  value: string,
  details: Record<string, string>,
): FieldError[] {
  if (!value) return []
  if (field.key === 'householdSize') {
    const count = Number(value)
    if (!Number.isInteger(count) || count < 1 || count > 20) {
      return [{ id: field.key, message: '共同生活人口請填 1 到 20 的整數。' }]
    }
  }
  if (field.key === 'monthlyIncome') {
    const income = Number(value)
    if (!Number.isFinite(income) || income < 0) {
      return [{ id: field.key, message: '每月收入請填 0 或正數，不要加逗號或「元」。' }]
    }
  }
  if (field.key === 'account' && !/^[0-9-]{8,20}$/.test(value)) {
    return [{ id: field.key, message: '帳號請用數字，可用一條橫線。示範請填 000-000000000000。' }]
  }
  if (field.key === 'ban' && !isValidBan(value)) {
    return [{ id: field.key, message: '統一編號應為 8 碼且符合檢查碼。示範可填 12345675。' }]
  }
  if (field.key === 'purpose' && value.length < 10) {
    return [{ id: field.key, message: '使用目的請再寫清楚一點，至少 10 個字，包含活動名稱即可。' }]
  }
  if (field.key === 'reason' && field.type === 'textarea' && value.length < 8) {
    return [{ id: field.key, message: '異議理由請至少寫 8 個字，補充時間、地點或當時情形。' }]
  }
  if (field.key === 'changeDetail' && value.length < 4) {
    return [{ id: field.key, message: '請寫出變更後的內容，不要只填「變更」。' }]
  }
  if (field.type === 'date') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return [{ id: field.key, message: '日期格式請用西元年-月-日，例如 2026-10-01。' }]
    }
    if (value < isoDate(0)) {
      return [{ id: field.key, message: '請選擇今天或今天以後的日期。' }]
    }
  }
  if (service.id === 'facility-permit' && field.key === 'endDate') {
    const start = details.startDate
    if (start && value < start) {
      return [{ id: 'endDate', message: '結束日期不可早於開始日期。請改日期，或兩天填同一天。' }]
    }
  }
  return []
}

export function isCaseNumber(value: string) {
  return /^GV114-[0-9]{6}$/.test(value.trim().toUpperCase())
}
