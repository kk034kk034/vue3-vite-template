import { request } from '@/shared/api/http'

export type Device = {
  id: string
  name: string
  site: string
  type: string
  protocol: string
  status: string
}

export function listDevices() {
  return request<Device[]>({
    method: 'GET',
    url: '/devices',
  })
}
