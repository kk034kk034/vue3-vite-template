import { request } from '@/shared/api/http'

export type DashboardSummary = {
  onlineDevices: number
  liveStreams: number
  todayAlerts: number
  gatewayLoad: number
}

export function getDashboardSummary() {
  return request<DashboardSummary>({
    method: 'GET',
    url: '/dashboard/summary',
  })
}
