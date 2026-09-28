export function param(value: unknown) {
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : ''
  return typeof value === 'string' ? value : ''
}

export function isoDate(offset: number) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + offset)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDate(iso: string) {
  const [year, month, day] = iso.split('-')
  if (!year || !month || !day) return iso
  return `${year}年${Number(month)}月${Number(day)}日`
}

export function formatDateWithWeek(iso: string) {
  const date = new Date(`${iso}T12:00:00`)
  const weeks = ['日', '一', '二', '三', '四', '五', '六']
  if (Number.isNaN(date.getTime())) return formatDate(iso)
  return `${formatDate(iso)}（星期${weeks[date.getDay()]}）`
}

export function upcomingWeekdays(count: number) {
  const dates: string[] = []
  let offset = 1
  while (dates.length < count && offset < 40) {
    const iso = isoDate(offset)
    const day = new Date(`${iso}T12:00:00`).getDay()
    if (day !== 0 && day !== 6) dates.push(iso)
    offset += 1
  }
  return dates
}

export function nowStamp() {
  const date = new Date()
  const iso = isoDate(0)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${iso} ${hours}:${minutes}`
}

export function maskNationalId(id: string) {
  if (id.length < 4) return id
  return `${id.slice(0, 2)}*****${id.slice(-2)}`
}

export function formatMoney(amount: number) {
  return `新臺幣 ${amount.toLocaleString('zh-TW')} 元`
}

export function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
