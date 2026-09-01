import { apiClient } from './client'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  fullName: string
  role: 'BUYER' | 'SELLER'
}

interface TokenResponse {
  token: string
}

export async function login(payload: LoginPayload): Promise<string> {
  // Backend's LoginDTO field is literally named "username", even though it holds an email.
  const { data } = await apiClient.post<TokenResponse>('/auth/login', {
    username: payload.email,
    password: payload.password,
  })
  return data.token
}

export async function register(payload: RegisterPayload): Promise<void> {
  // Backend returns a token here (auto-login), but the product decision is to
  // ignore it and send the user to /login instead of signing them in directly.
  await apiClient.post<TokenResponse>('/auth/register', payload)
}
