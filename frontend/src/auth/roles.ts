import type { Role } from '../api/user'

export const DASHBOARD_PATH: Record<Role, string> = {
  BUYER: '/buyer',
  SELLER: '/seller',
  ADMIN: '/admin',
}
