import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} aria-hidden="true">
      <rect width="36" height="36" rx="10" className="fill-brand-500" />
      <path
        d="M11 14h14l-1.3 14H12.3L11 14Z"
        className="stroke-white"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 14v-2.2a3.5 3.5 0 0 1 7 0V14"
        className="stroke-white"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="27" cy="9.5" r="4" className="fill-accent-500" />
    </svg>
  )
}

export default function Logo({ className = '' }: { className?: string }) {
  const { t } = useTranslation()

  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <motion.span
        className="inline-flex"
        whileHover={{ rotate: -8, scale: 1.06 }}
        whileTap={{ scale: 0.93 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <LogoMark />
      </motion.span>
      <span className="font-heading text-lg font-semibold text-content-primary">{t('common.appName')}</span>
    </Link>
  )
}
