import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as categoriesApi from '../api/categories'
import type { Category } from '../api/categories'
import * as productsApi from '../api/products'
import type { Product } from '../api/products'
import { ChevronLeftIcon, ChevronRightIcon } from '../components/ActionIcons'
import FiltersBar, { EMPTY_FILTERS, SORT_PARAM, type Filters } from '../components/FiltersBar'
import ProductGrid from '../components/ProductGrid'
import PublicLayout from '../components/PublicLayout'

const PAGE_SIZE = 12

export default function CatalogPage() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<Category[]>([])
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [page, setPage] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCategories() {
      try {
        setCategories(await categoriesApi.listCategories())
      } catch {
        // Category list is optional context for filtering — a failed load shouldn't block the catalog.
      }
    }
    void loadCategories()
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    productsApi
      .listProducts({
        page,
        size: PAGE_SIZE,
        sort: SORT_PARAM[filters.sort],
        categoryId: filters.categoryId ? Number(filters.categoryId) : undefined,
        search: filters.search || undefined,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      })
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
  }, [page, filters])

  function handleFiltersChange(next: Filters) {
    setFilters(next)
    setPage(0)
  }

  return (
    <PublicLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">{t('catalog.title')}</h1>
          <p className="text-sm text-slate-600">{t('catalog.subtitle')}</p>
        </div>

        <FiltersBar categories={categories} filters={filters} onChange={handleFiltersChange} />

        <ProductGrid products={products} categories={categories} loading={loading} />

        {!loading && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label={t('catalog.pagination.prev')}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition-colors hover:bg-accent-50 hover:text-accent-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <span className="text-sm text-slate-600">
              {t('catalog.pagination.pageInfo', { current: page + 1, total: totalPages })}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              aria-label={t('catalog.pagination.next')}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition-colors hover:bg-accent-50 hover:text-accent-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </motion.div>
    </PublicLayout>
  )
}
