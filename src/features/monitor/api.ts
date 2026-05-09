import { http } from '@/shared/api/http'

export interface StreamStat {
  stream_key: string
  viewers: number
  recv_kbps: number
  send_kbps: number
  alive_seconds: number
}

export interface MonitorAlert {
  metric: string
  value: number
  threshold: number
}

export interface MonitorStats {
  cpu_percent: number | null
  memory_percent: number | null
  concurrent_viewers: number
  total_bitrate_kbps: number
  stream_count: number
  streams: StreamStat[]
  alerts: MonitorAlert[]
}

export type MetricName = 'cpu_percent' | 'memory_percent' | 'concurrent_viewers' | 'bitrate_kbps'

export interface AlertThreshold {
  id: number
  metric_name: MetricName
  threshold_value: number
  organization_id: number | null
  is_active: boolean
}

export async function fetchMonitorStats() {
  const res = await http.get<MonitorStats>('/v1/monitor/stats')
  return res.data
}

export async function fetchThresholds() {
  const res = await http.get<{ thresholds: AlertThreshold[] }>('/v1/monitor/thresholds')
  return res.data.thresholds
}

export async function saveThreshold(payload: {
  metric_name: MetricName
  threshold_value: number
  organization_id?: number
  is_active?: boolean
}) {
  const res = await http.post<{ threshold: AlertThreshold }>('/v1/monitor/thresholds', payload)
  return res.data.threshold
}
