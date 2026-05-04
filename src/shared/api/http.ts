import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

export type ApiResponse<T> = {
  data: T
  success: boolean
  message?: string
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
})

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent('session:expired'))
    }

    return Promise.reject(error)
  },
)

export async function request<T>(config: AxiosRequestConfig) {
  const response = await http.request<ApiResponse<T>>(config)
  return response.data
}
