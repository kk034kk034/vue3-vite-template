import { request } from '@/shared/api/http'

export type Recording = {
  id: string
  camera: string
  startedAt: string
  endedAt: string
  type: 'continuous' | 'event' | 'motion'
  sizeBytes: number
}

export function searchRecordings(params: { camera?: string; siteId?: string; startedAt?: string; endedAt?: string }) {
  return request<Recording[]>({
    method: 'GET',
    url: '/recordings',
    params,
  })
}
