import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as categoriesApi from '../api/categories'
import type { Category } from '../api/categories'
import * as favoritesApi from '../api/favorites'
import * as productsApi from '../api/products'
import type { Product } from '../api/products'
import { ChevronLeftIcon, ChevronRightIcon, HeartIcon, MinusIcon, PlusIcon, TrashIcon } from '../components/ActionIcons'
import { useCart } from '../cart/CartContext'
import DashboardLayout from '../components/DashboardLayout'
import { BoxIcon, ShoppingBagIcon } from '../components/DecorativeIcons'
import ProductGrid from '../components/ProductGrid'

const PAGE_SIZE = 12

export default function BuyerDashboard() {
  const { t } = useTranslation()
  const { cart, updateQuantity, removeFromCart, pendingProductIds } = useCart()
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
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-900/40">
            <ShoppingBagIcon className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-content-primary">{t('cart.title')}</h2>
        </div>

        {cart.items.length === 0 ? (
          <p className="py-6 text-center text-sm text-content-secondary">{t('cart.empty')}</p>
        ) : (
          <div className="rounded-2xl border border-border-subtle bg-surface-raised/80 p-4 shadow-sm backdrop-blur">
            <ul className="space-y-2">
              <AnimatePresence initial={false}>
                {cart.items.map((item) => {
                  const pending = pendingProductIds.has(item.productId)
                  return (
                    <motion.li
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 48, rotate: 8, transition: { duration: 0.35, ease: 'easeIn' } }}
                      className="flex items-center gap-3 rounded-xl border border-border-subtle px-3 py-2.5"
                    >
                      {item.imageIds.length > 0 ? (
                        <img
                          src={productsApi.fileUrl(item.imageIds[0])}
                          alt={item.productName}
                          className="h-12 w-12 shrink-0 rounded-lg border border-border-subtle object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-900/40">
                          <BoxIcon className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-content-primary">{item.productName}</p>
                        <p className="text-sm text-content-secondary">
                          {t('catalog.priceValue', { price: item.price })}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            item.quantity > 1
                              ? void updateQuantity(item.productId, item.quantity - 1)
                              : void removeFromCart(item.productId)
                          }
                          aria-label={t('cart.remove')}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border-strong text-content-secondary transition-colors hover:bg-surface-sunken disabled:opacity-50"
                        >
                          <MinusIcon className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-medium text-content-primary">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => void updateQuantity(item.productId, item.quantity + 1)}
                          aria-label={t('cart.add')}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border-strong text-content-secondary transition-colors hover:bg-surface-sunken disabled:opacity-50"
                        >
                          <PlusIcon className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="w-20 shrink-0 text-right font-semibold text-brand-600 dark:text-brand-400">
                        {t('catalog.priceValue', { price: item.subtotal })}
                      </p>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => void removeFromCart(item.productId)}
                        aria-label={t('cart.remove')}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-content-secondary transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/30"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </ul>
            <div className="mt-3 flex items-center justify-between border-t border-border-subtle pt-3">
              <span className="font-medium text-content-primary">{t('cart.total')}</span>
              <span className="text-lg font-semibold text-brand-600 dark:text-brand-400">
                {t('catalog.priceValue', { price: cart.total })}
              </span>
            </div>
          </div>
        )}
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
