import { http } from '@/shared/api/http'

export type TokenProtocol = 'rtmp' | 'hls' | 'mjpeg' | 'all'

export interface StreamUrls {
  rtmp: string
  hls: string
  mjpeg: string
}

export interface StreamToken {
  id: number
  camera_id: number
  user_id: number
  token: string
  protocol: TokenProtocol
  expires_at: string | null
  is_enabled: boolean
  note: string | null
  created_at: string
  camera?: { id: number; name: string; stream_key: string }
  urls?: StreamUrls
}

export async function fetchTokens(params?: { camera_id?: number; page?: number; limit?: number }) {
  const res = await http.get<{ total: number; page: number; tokens: StreamToken[] }>('/v1/stream/tokens', { params })
  return res.data
}

export async function createToken(payload: {
  camera_id: number
  protocol?: TokenProtocol
  expires_in_hours?: number
  note?: string
}) {
  const res = await http.post<{ token: StreamToken; urls: StreamUrls }>('/v1/stream/tokens', payload)
  return res.data
}

export async function enableToken(id: number) {
  const res = await http.patch<{ token: StreamToken; urls: StreamUrls }>(`/v1/stream/tokens/${id}/enable`)
  return res.data
}

export async function disableToken(id: number) {
  await http.patch(`/v1/stream/tokens/${id}/disable`)
}

export async function deleteToken(id: number) {
  await http.delete(`/v1/stream/tokens/${id}`)
}
