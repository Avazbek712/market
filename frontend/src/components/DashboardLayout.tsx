import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import LanguageSwitcher from './LanguageSwitcher'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const { me, logout } = useAuth()

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur">
        <span className="text-lg font-semibold text-slate-900">{t('common.appName')}</span>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {me && <span className="hidden text-sm text-slate-500 sm:inline">{me.email}</span>}
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          >
            {t('common.logout')}
          </button>
        </div>
      </header>
      <main className="animate-fade-in-up mx-auto max-w-3xl px-6 py-10">{children}</main>
    </div>
  )
}
