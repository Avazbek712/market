import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import DashboardLayout from '../components/DashboardLayout'

export default function AdminDashboard() {
  const { t } = useTranslation()
  const { hasPermission } = useAuth()

  return (
    <DashboardLayout>
      <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="mb-1 text-xl font-semibold text-slate-900">{t('dashboard.admin.title')}</h1>
        <p className="mb-4 text-sm text-slate-600">{t('dashboard.admin.subtitle')}</p>

        {/* Demonstrates hasPermission()-gated UI — hiding this is UX only, the
            backend enforces the real ROLE_MANAGE check on the actual endpoint. */}
        {hasPermission('ROLE_MANAGE') && (
          <button
            type="button"
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
          >
            {t('dashboard.admin.manageRoles')}
          </button>
        )}
      </div>
    </DashboardLayout>
  )
}
