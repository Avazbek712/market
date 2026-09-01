import axios from 'axios'
import { emitUnauthorized } from '../auth/authEvents'

export const TOKEN_STORAGE_KEY = 'mm_token'

export const apiClient = axios.create({
  baseURL: '/api',
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    // Missing/invalid/expired token is rejected by the security filter chain
    // before it ever reaches a controller, so there's no custom
    // AuthenticationEntryPoint and it comes back as a bare 403 with an empty
    // body — not 401. A real @PreAuthorize permission denial (valid session,
    // just lacking the permission) goes through GlobalExceptionHandler
    // instead and always has a JSON body, so we use that to tell the two
    // apart without needing a backend change.
    const isUnauthenticated = status === 401 || (status === 403 && !error.response?.data)
    if (isUnauthenticated) {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      emitUnauthorized()
    }
    return Promise.reject(error)
  },
)
