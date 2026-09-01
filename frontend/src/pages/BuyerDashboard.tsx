import { useTranslation } from 'react-i18next'
import DashboardLayout from '../components/DashboardLayout'

export default function BuyerDashboard() {
  const { t } = useTranslation()

  return (
    <DashboardLayout>
      <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6h15l-1.5 9h-12L6 6zm0 0L5 3H2m5 15a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm10 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="mb-1 text-xl font-semibold text-slate-900">{t('dashboard.buyer.title')}</h1>
        <p className="text-sm text-slate-600">{t('dashboard.buyer.subtitle')}</p>
      </div>
    </DashboardLayout>
  )
}
