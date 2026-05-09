import { http } from '@/shared/api/http'

export interface Camera {
  id: number
  name: string
  rtsp_url: string
  stream_key: string
  camera_group_id: number | null
  location: string | null
  is_active: boolean
  organization_id: number
  camera_group?: { id: number; name: string }
  created_at: string
}

export interface CameraGroup {
  id: number
  name: string
  organization_id: number
  description: string | null
  cameras?: Camera[]
  created_at: string
}

export async function fetchCameras(params?: { organization_id?: number }) {
  const res = await http.get<{ cameras: Camera[] }>('/v1/camera', { params })
  return res.data.cameras
}

export async function createCamera(payload: {
  name: string
  rtsp_url: string
  organization_id: number
  camera_group_id?: number
  location?: string
}) {
  const res = await http.post<{ camera: Camera }>('/v1/camera', payload)
  return res.data.camera
}

export async function updateCamera(id: number, payload: Partial<Camera>) {
  const res = await http.put<{ camera: Camera }>(`/v1/camera/${id}`, payload)
  return res.data.camera
}

export async function deleteCamera(id: number) {
  await http.delete(`/v1/camera/${id}`)
}

export async function fetchCameraGroups(params?: { organization_id?: number }) {
  const res = await http.get<{ groups: CameraGroup[] }>('/v1/camera-group', { params })
  return res.data.groups
}

export async function createCameraGroup(payload: {
  name: string
  organization_id: number
  description?: string
}) {
  const res = await http.post<{ group: CameraGroup }>('/v1/camera-group', payload)
  return res.data.group
}

export async function updateCameraGroup(id: number, payload: Partial<CameraGroup>) {
  const res = await http.put<{ group: CameraGroup }>(`/v1/camera-group/${id}`, payload)
  return res.data.group
}

export async function deleteCameraGroup(id: number) {
  await http.delete(`/v1/camera-group/${id}`)
}
