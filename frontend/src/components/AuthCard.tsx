import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  const { t } = useTranslation()

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -left-20 -top-24 h-72 w-72 rounded-full bg-accent-300/40 blur-3xl" />
        <div className="animate-blob absolute -right-16 top-1/4 h-80 w-80 rounded-full bg-accent-400/25 blur-3xl [animation-delay:3s]" />
        <div className="animate-blob absolute bottom-[-5rem] left-1/4 h-72 w-72 rounded-full bg-accent-200/40 blur-3xl [animation-delay:6s]" />
      </div>

      <div className="animate-fade-in-up relative w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white/80 p-8 shadow-xl shadow-accent-500/10 backdrop-blur-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 text-lg font-bold text-white shadow-lg shadow-accent-500/30">
            M
          </div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('common.appName')}</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}
