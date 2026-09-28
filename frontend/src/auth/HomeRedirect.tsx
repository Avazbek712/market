import { Navigate } from 'react-router-dom'
import CatalogPage from '../pages/CatalogPage'
import Spinner from '../components/Spinner'
import { useAuth } from './AuthContext'
import { DASHBOARD_PATH } from './roles'

export default function HomeRedirect() {
  const { status, me } = useAuth()

  if (status === 'loading') return <Spinner />

  // Guests and BUYERs share the same public catalog at "/"; SELLER/ADMIN
  // keep going straight to their dashboards, unchanged from before.
  if (status !== 'authenticated' || !me || me.role === 'BUYER') return <CatalogPage />

  return <Navigate to={DASHBOARD_PATH[me.role]} replace />
}
