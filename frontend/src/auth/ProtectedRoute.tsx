import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { Role } from '../api/user'
import Spinner from '../components/Spinner'
import { useAuth } from './AuthContext'
import { DASHBOARD_PATH } from './roles'

export default function ProtectedRoute({ allow, children }: { allow?: Role[]; children: ReactNode }) {
  const { status, me } = useAuth()

  if (status === 'loading') return <Spinner />
  if (status !== 'authenticated' || !me) return <Navigate to="/login" replace />
  if (allow && !allow.includes(me.role)) return <Navigate to={DASHBOARD_PATH[me.role]} replace />

  return <>{children}</>
}
