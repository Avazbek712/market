import { motion } from 'motion/react'
import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { DASHBOARD_PATH } from '../auth/roles'
import CartIconButton from './CartIconButton'
import LanguageSwitcher from './LanguageSwitcher'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

const MotionLink = motion.create(Link)

function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let rafId: number
    let lenis: import('lenis').default | undefined
    let cancelled = false

    void import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return
      lenis = new Lenis()
      const raf = (time: number) => {
        lenis?.raf(time)
        rafId = requestAnimationFrame(raf)
      }
      rafId = requestAnimationFrame(raf)
    })

    return () => {
      cancelled = true
      if (rafId) cancelAnimationFrame(rafId)
      lenis?.destroy()
    }
  }, [])
}

export default function PublicLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const { status, me, logout } = useAuth()
  useSmoothScroll()

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
          <CartIconButton />
          {status === 'authenticated' && me ? (
            <>
              <span className="hidden text-sm text-content-secondary sm:inline">{me.fullName || me.email}</span>
              <MotionLink
                to={DASHBOARD_PATH[me.role]}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="rounded-lg border border-border-strong px-3 py-1.5 text-sm font-medium text-content-secondary transition-colors hover:border-accent-300 hover:bg-accent-50 hover:text-accent-600 dark:hover:bg-accent-900/40"
              >
                {t('catalog.header.dashboard')}
              </MotionLink>
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
            </>
          ) : (
            <>
              <MotionLink
                to="/login"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="rounded-lg border border-border-strong px-3 py-1.5 text-sm font-medium text-content-secondary transition-colors hover:border-accent-300 hover:bg-accent-50 hover:text-accent-600 dark:hover:bg-accent-900/40"
              >
                {t('catalog.header.login')}
              </MotionLink>
              <MotionLink
                to="/register"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-600"
              >
                {t('catalog.header.register')}
              </MotionLink>
            </>
          )}
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  )
}
