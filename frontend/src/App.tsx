import { Navigate, Route, Routes } from 'react-router-dom'
import HomeRedirect from './auth/HomeRedirect'
import ProtectedRoute from './auth/ProtectedRoute'
import AdminDashboard from './pages/AdminDashboard'
import BuyerDashboard from './pages/BuyerDashboard'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SellerDashboard from './pages/SellerDashboard'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<HomeRedirect />} />
      <Route
        path="/buyer"
        element={
          <ProtectedRoute allow={['BUYER']}>
            <BuyerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller"
        element={
          <ProtectedRoute allow={['SELLER']}>
            <SellerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allow={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
