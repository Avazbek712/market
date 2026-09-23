import type { ComponentType, ReactNode, SVGProps } from 'react'
import { useTranslation } from 'react-i18next'
import { BoxIcon, ShoppingBagIcon, SparkleIcon, StarIcon, TagIcon } from './DecorativeIcons'

const FLOATERS: {
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  top: string
  left: string
  size: string
  duration: string
  delay: string
}[] = [
  { Icon: ShoppingBagIcon, top: '14%', left: '12%', size: 'h-12 w-12', duration: '7s', delay: '0s' },
  { Icon: TagIcon, top: '70%', left: '16%', size: 'h-9 w-9', duration: '6s', delay: '1.2s' },
  { Icon: BoxIcon, top: '20%', left: '78%', size: 'h-14 w-14', duration: '8s', delay: '0.6s' },
  { Icon: StarIcon, top: '78%', left: '74%', size: 'h-8 w-8', duration: '5.5s', delay: '2s' },
  { Icon: SparkleIcon, top: '46%', left: '52%', size: 'h-6 w-6', duration: '6.5s', delay: '3s' },
]

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
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-accent-600 via-accent-500 to-fuchsia-500 lg:flex">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-blob absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="animate-blob absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-fuchsia-300/20 blur-3xl [animation-delay:3s]" />
        </div>

        {FLOATERS.map(({ Icon, top, left, size, duration, delay }, index) => (
          <Icon
            key={index}
            aria-hidden="true"
            className={`animate-float pointer-events-none absolute ${size} text-white/70 drop-shadow-lg`}
            style={{ top, left, animationDuration: duration, animationDelay: delay }}
          />
        ))}

        <div className="relative z-10 max-w-sm px-10 text-center text-white">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl font-bold backdrop-blur-md">
            M
          </div>
          <h2 className="text-3xl font-bold">{t('common.appName')}</h2>
          <p className="mt-3 text-white/85">{t('auth.visual.tagline')}</p>
        </div>
      </div>

      <div className="relative flex w-full items-center justify-center overflow-hidden px-4 py-10 lg:w-1/2">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-blob absolute -left-20 -top-24 h-72 w-72 rounded-full bg-accent-300/30 blur-3xl" />
          <div className="animate-blob absolute -right-16 bottom-[-4rem] h-72 w-72 rounded-full bg-accent-200/30 blur-3xl [animation-delay:4s]" />
        </div>

        <div className="animate-fade-in-up relative w-full max-w-sm rounded-2xl border border-slate-200/80 bg-white/80 p-8 shadow-xl shadow-accent-500/10 backdrop-blur-xl">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 text-lg font-bold text-white shadow-lg shadow-accent-500/30 lg:hidden">
              M
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('common.appName')}</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
