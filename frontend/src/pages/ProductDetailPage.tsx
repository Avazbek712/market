import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import * as categoriesApi from '../api/categories'
import type { Category } from '../api/categories'
import { extractErrorMessage } from '../api/errors'
import * as productsApi from '../api/products'
import type { Product } from '../api/products'
import { ChevronLeftIcon } from '../components/ActionIcons'
import { BoxIcon } from '../components/DecorativeIcons'
import PublicLayout from '../components/PublicLayout'
import Spinner from '../components/Spinner'

export default function ProductDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setActiveImage(0)

    async function load() {
      try {
        const [productResult] = await Promise.all([
          productsApi.getProduct(Number(id)),
          categoriesApi.listCategories().then(setCategories).catch(() => undefined),
        ])
        if (!cancelled) setProduct(productResult)
      } catch (err) {
        if (!cancelled) setError(extractErrorMessage(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [id])

  const categoryName = categories.find((c) => c.id === product?.categoryId)?.name

  return (
    <PublicLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-accent-600"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          {t('productDetail.back')}
        </Link>

        {loading && <Spinner />}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-50 text-accent-400">
              <BoxIcon className="h-7 w-7" />
            </div>
            <p className="text-sm text-slate-500">{error}</p>
          </div>
        )}

        {!loading && !error && product && (
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <div className="aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-accent-50">
                {product.imageIds.length > 0 ? (
                  <img
                    src={productsApi.fileUrl(product.imageIds[activeImage])}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-accent-300">
                    <BoxIcon className="h-16 w-16" />
                  </div>
                )}
              </div>
              {product.imageIds.length > 1 && (
                <div className="mt-3 flex gap-2">
                  {product.imageIds.map((imageId, index) => (
                    <button
                      key={imageId}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                        index === activeImage ? 'border-accent-500' : 'border-transparent'
                      }`}
                    >
                      <img src={productsApi.fileUrl(imageId)} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{product.name}</h1>
              {categoryName && <p className="mt-1 text-sm text-slate-500">{categoryName}</p>}
              <p className="mt-4 text-3xl font-semibold text-accent-600">
                {t('catalog.priceValue', { price: product.price })}
              </p>

              <p className="mt-2 text-sm font-medium text-slate-600">
                {product.quantity > 0
                  ? t('productDetail.inStock', { count: product.quantity })
                  : t('productDetail.outOfStock')}
              </p>

              {product.description && <p className="mt-6 whitespace-pre-line text-slate-700">{product.description}</p>}

              {product.sellerName && (
                <p className="mt-6 text-sm text-slate-500">
                  {t('productDetail.seller')}: <span className="font-medium text-slate-700">{product.sellerName}</span>
                </p>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </PublicLayout>
  )
}
