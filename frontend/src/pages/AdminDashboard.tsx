import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import CategoryManager from '../components/CategoryManager'
import DashboardLayout from '../components/DashboardLayout'
import { ShieldIcon, TagIcon } from '../components/DecorativeIcons'

type Section = 'categories' | 'roles'

export default function AdminDashboard() {
  const { t } = useTranslation()
  const { hasPermission } = useAuth()
  const [section, setSection] = useState<Section>('categories')

  const navItems: { id: Section; label: string; icon: ReactNode; visible: boolean }[] = [
    {
      id: 'categories',
      label: t('dashboard.admin.nav.categories'),
      icon: <TagIcon className="h-5 w-5" />,
      visible: hasPermission('CATEGORY_MANAGE'),
    },
    {
      id: 'roles',
      label: t('dashboard.admin.nav.roles'),
      icon: <ShieldIcon className="h-5 w-5" />,
      visible: hasPermission('ROLE_MANAGE'),
    },
  ]

  const visibleItems = navItems.filter((item) => item.visible)
  const activeSection = visibleItems.some((item) => item.id === section) ? section : visibleItems[0]?.id

  return (
    <DashboardLayout wide>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">{t('dashboard.admin.title')}</h1>
        <p className="text-sm text-slate-600">{t('dashboard.admin.subtitle')}</p>
      </div>

      {visibleItems.length > 0 && (
        <div className="flex flex-col gap-6 sm:flex-row">
          <nav className="flex shrink-0 gap-1.5 sm:w-48 sm:flex-col">
            {visibleItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  activeSection === item.id
                    ? 'bg-accent-500 text-white shadow-sm shadow-accent-500/30'
                    : 'text-slate-600 hover:bg-white/60'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="min-w-0 flex-1">
            {activeSection === 'categories' && <CategoryManager />}
            {activeSection === 'roles' && (
              <div className="animate-fade-in-up flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                  <ShieldIcon className="h-5 w-5" />
                </div>
                <p className="text-sm text-slate-500">{t('dashboard.admin.rolesComingSoon')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
