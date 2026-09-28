import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import * as productsApi from '../api/products'
import type { Product } from '../api/products'
import { BoxIcon } from './DecorativeIcons'

export default function ProductCard({ product, categoryName }: { product: Product; categoryName?: string }) {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="h-full"
    >
      <Link
        to={`/products/${product.id}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur transition-shadow hover:shadow-lg hover:shadow-accent-500/10"
      >
        <div className="aspect-square w-full overflow-hidden bg-accent-50">
          {product.imageIds.length > 0 ? (
            <img
              src={productsApi.fileUrl(product.imageIds[0])}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-accent-300">
              <BoxIcon className="h-12 w-12" />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <p className="line-clamp-2 font-medium text-slate-900">{product.name}</p>
          {categoryName && <p className="text-xs text-slate-500">{categoryName}</p>}
          <p className="mt-auto pt-2 text-lg font-semibold text-accent-600">
            {t('catalog.priceValue', { price: product.price })}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
