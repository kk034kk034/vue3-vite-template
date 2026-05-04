import { request } from '@/shared/api/http'

export type StreamSession = {
  id: string
  deviceId: string
  name: string
  status: 'playing' | 'buffering' | 'fallback' | 'offline'
  playbackUrl: string
}

export function listStreamSessions() {
  return request<StreamSession[]>({
    method: 'GET',
    url: '/streams',
  })
}
