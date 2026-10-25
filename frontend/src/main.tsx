import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './i18n.ts'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthContext.tsx'
import { CartProvider } from './cart/CartContext.tsx'
import { CartFlyProvider } from './cart/CartFlyContext.tsx'
import { FavoritesProvider } from './favorites/FavoritesContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider>
          <CartProvider>
            <CartFlyProvider>
              <App />
            </CartFlyProvider>
          </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
