import { useTranslation } from 'react-i18next'
import DashboardLayout from '../components/DashboardLayout'

export default function SellerDashboard() {
  const { t } = useTranslation()

  return (
    <DashboardLayout>
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-8">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3 9l1.5-5h15L21 9m-18 0v10a1 1 0 001 1h16a1 1 0 001-1V9m-18 0h18M9 13a2 2 0 104 0"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="mb-1 text-xl font-semibold text-slate-900">{t('dashboard.seller.title')}</h1>
        <p className="text-sm text-slate-600">{t('dashboard.seller.subtitle')}</p>
      </div>
    </DashboardLayout>
  )
}
