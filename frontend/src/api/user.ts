import { apiClient } from './client'

export type Role = 'BUYER' | 'SELLER' | 'ADMIN'

export interface Me {
  id: number
  email: string
  role: Role
  permissions: string[]
}

export async function getMe(): Promise<Me> {
  const { data } = await apiClient.get<Me>('/user/me')
  return data
}
