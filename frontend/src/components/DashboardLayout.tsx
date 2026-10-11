import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import LanguageSwitcher from './LanguageSwitcher'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

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

      <header className="relative z-10 flex items-center justify-between border-b border-border-subtle bg-surface-raised/70 px-6 py-4 backdrop-blur">
        <Logo />
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <LanguageSwitcher />
          {me && <span className="hidden text-sm text-content-secondary sm:inline">{me.fullName || me.email}</span>}
          <motion.button
            type="button"
            onClick={logout}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="rounded-lg border border-border-strong px-3 py-1.5 text-sm font-medium text-content-secondary transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
          >
            {t('common.logout')}
          </motion.button>
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
