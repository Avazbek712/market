import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as categoriesApi from '../api/categories'
import type { Category } from '../api/categories'
import * as favoritesApi from '../api/favorites'
import type { Product } from '../api/products'
import { ChevronLeftIcon, ChevronRightIcon, HeartIcon } from '../components/ActionIcons'
import DashboardLayout from '../components/DashboardLayout'
import ProductGrid from '../components/ProductGrid'

const PAGE_SIZE = 12

export default function BuyerDashboard() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    categoriesApi
      .listCategories()
      .then(setCategories)
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    favoritesApi
      .listFavorites(page, PAGE_SIZE)
      .then((result) => {
        if (cancelled) return
        setProducts(result.content)
        setTotalPages(result.totalPages)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [page])

  return (
    <DashboardLayout>
      <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-8 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
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
        <h1 className="mb-1 text-xl font-semibold text-content-primary">{t('dashboard.buyer.title')}</h1>
        <p className="text-sm text-content-secondary">{t('dashboard.buyer.subtitle')}</p>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/40">
            <HeartIcon filled className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-content-primary">{t('dashboard.buyer.favorites.title')}</h2>
        </div>

        {loading && products.length === 0 ? (
          <p className="py-6 text-center text-sm text-content-secondary">{t('dashboard.buyer.favorites.loading')}</p>
        ) : products.length === 0 ? (
          <p className="py-6 text-center text-sm text-content-secondary">{t('dashboard.buyer.favorites.empty')}</p>
        ) : (
          <>
            <ProductGrid products={products} categories={categories} loading={loading} />

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <motion.button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  aria-label={t('catalog.pagination.prev')}
                  whileHover={page === 0 ? undefined : { scale: 1.08 }}
                  whileTap={page === 0 ? undefined : { scale: 0.92 }}
                  transition={{ duration: 0.15 }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-strong text-content-secondary transition-colors hover:bg-accent-50 hover:text-accent-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-accent-900/40"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </motion.button>
                <span className="text-sm text-content-secondary">
                  {t('catalog.pagination.pageInfo', { current: page + 1, total: totalPages })}
                </span>
                <motion.button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  aria-label={t('catalog.pagination.next')}
                  whileHover={page >= totalPages - 1 ? undefined : { scale: 1.08 }}
                  whileTap={page >= totalPages - 1 ? undefined : { scale: 0.92 }}
                  transition={{ duration: 0.15 }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-strong text-content-secondary transition-colors hover:bg-accent-50 hover:text-accent-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-accent-900/40"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
