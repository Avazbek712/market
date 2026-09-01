import { Navigate } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { useAuth } from './AuthContext'
import { DASHBOARD_PATH } from './roles'

export default function HomeRedirect() {
  const { status, me } = useAuth()

  if (status === 'loading') return <Spinner />
  if (status !== 'authenticated' || !me) return <Navigate to="/login" replace />

  return <Navigate to={DASHBOARD_PATH[me.role]} replace />
}
