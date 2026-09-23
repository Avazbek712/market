import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import LanguageSwitcher from './LanguageSwitcher'

export default function DashboardLayout({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const { t } = useTranslation()
  const { me, logout } = useAuth()

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-blob absolute -left-24 -top-32 h-96 w-96 rounded-full bg-accent-200/30 blur-3xl" />
        <div className="animate-blob absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-accent-100/40 blur-3xl [animation-delay:3s]" />
        <div className="animate-blob absolute bottom-[-6rem] left-1/3 h-72 w-72 rounded-full bg-accent-50 blur-3xl [animation-delay:6s]" />
      </div>

      <header className="relative z-10 flex items-center justify-between border-b border-slate-200 bg-white/70 px-6 py-4 backdrop-blur">
        <span className="text-lg font-semibold text-slate-900">{t('common.appName')}</span>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {me && <span className="hidden text-sm text-slate-500 sm:inline">{me.fullName || me.email}</span>}
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          >
            {t('common.logout')}
          </button>
        </div>
      </header>
      <main
        className={`animate-fade-in-up relative z-10 mx-auto px-6 py-10 ${wide ? 'max-w-5xl' : 'max-w-3xl'}`}
      >
        {children}
      </main>
    </div>
  )
}
