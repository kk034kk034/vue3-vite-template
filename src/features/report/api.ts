import { http } from '@/shared/api/http'

export interface AccessLog {
  id: number
  action: string
  ip_addr: string | null
  description: string | null
  created_at: string
  user?: { id: number; username: string; email: string }
  camera?: { id: number; name: string }
  camera_group?: { id: number; name: string }
}

export interface LogQuery {
  start_date?: string
  end_date?: string
  camera_id?: number
  camera_group_id?: number
  action?: string
  page?: number
  limit?: number
}

export async function fetchLogs(params: LogQuery) {
  const res = await http.get<{ total: number; page: number; logs: AccessLog[] }>('/v1/report/logs', { params })
  return res.data
}

export function buildExportUrl(params: LogQuery & { format: 'xlsx' | 'csv' }) {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, String(v))
  })
  return `/api/v1/report/export?${q.toString()}`
}
