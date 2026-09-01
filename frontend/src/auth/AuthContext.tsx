import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as authApi from '../api/auth'
import { TOKEN_STORAGE_KEY } from '../api/client'
import * as userApi from '../api/user'
import { onUnauthorized } from './authEvents'

type Status = 'loading' | 'authenticated' | 'anonymous'

interface AuthContextValue {
  status: Status
  me: userApi.Me | null
  login: (payload: authApi.LoginPayload) => Promise<userApi.Me>
  register: (payload: authApi.RegisterPayload) => Promise<void>
  logout: () => void
  hasPermission: (code: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading')
  const [me, setMe] = useState<userApi.Me | null>(null)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!token) {
      setStatus('anonymous')
      return
    }
    userApi
      .getMe()
      .then((profile) => {
        setMe(profile)
        setStatus('authenticated')
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        setStatus('anonymous')
      })
  }, [])

  useEffect(
    () =>
      onUnauthorized(() => {
        setMe(null)
        setStatus('anonymous')
      }),
    [],
  )

  async function login(payload: authApi.LoginPayload) {
    const token = await authApi.login(payload)
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    const profile = await userApi.getMe()
    setMe(profile)
    setStatus('authenticated')
    return profile
  }

  async function register(payload: authApi.RegisterPayload) {
    // Deliberately not persisting the token the backend returns — see frontend
    // integration spec: registration must not auto-login.
    await authApi.register(payload)
  }

  function logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setMe(null)
    setStatus('anonymous')
  }

  function hasPermission(code: string) {
    return me?.permissions.includes(code) ?? false
  }

  const value = useMemo<AuthContextValue>(
    () => ({ status, me, login, register, logout, hasPermission }),
    [status, me],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
