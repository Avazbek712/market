import { useTranslation } from 'react-i18next'
import DashboardLayout from '../components/DashboardLayout'
import ProductManager from '../components/ProductManager'

export default function SellerDashboard() {
  const { t } = useTranslation()

  return (
    <DashboardLayout wide>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">{t('dashboard.seller.title')}</h1>
        <p className="text-sm text-slate-600">{t('dashboard.seller.subtitle')}</p>
      </div>
      <ProductManager />
    </DashboardLayout>
  )
}
