import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { Category } from '../api/categories'
import type { Product } from '../api/products'
import { BoxIcon } from './DecorativeIcons'
import ProductCard from './ProductCard'

const SKELETON_COUNT = 8

function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/60">
      <div className="aspect-square w-full animate-pulse bg-slate-200/70" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200/70" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200/70" />
        <div className="mt-auto h-5 w-1/2 animate-pulse rounded bg-slate-200/70" />
      </div>
    </div>
  )
}

export default function ProductGrid({
  products,
  categories,
  loading,
}: {
  products: Product[]
  categories: Category[]
  loading: boolean
}) {
  const { t } = useTranslation()

  function categoryName(categoryId: number | null) {
    return categories.find((c) => c.id === categoryId)?.name
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-50 text-accent-400">
          <BoxIcon className="h-7 w-7" />
        </div>
        <p className="text-sm text-slate-500">{t('catalog.empty')}</p>
      </div>
    )
  }

  return (
    <motion.div
      key={products.map((p) => p.id).join(',')}
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.04 } } }}
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} categoryName={categoryName(product.categoryId)} />
      ))}
    </motion.div>
  )
}
