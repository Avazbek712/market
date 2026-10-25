import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import * as productsApi from '../api/products'
import type { Product } from '../api/products'
import AddToCartButton from './AddToCartButton'
import { BoxIcon } from './DecorativeIcons'
import FavoriteButton from './FavoriteButton'

export default function ProductCard({ product, categoryName }: { product: Product; categoryName?: string }) {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="h-full"
    >
      <Link
        to={`/products/${product.id}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised/80 shadow-sm backdrop-blur transition-shadow hover:shadow-lg hover:shadow-accent-500/10"
      >
        <div className="relative aspect-square w-full overflow-hidden bg-accent-50 dark:bg-accent-900/30">
          <FavoriteButton productId={product.id} className="absolute right-2 top-2 z-10" />
          {product.imageIds.length > 0 ? (
            <motion.img
              src={productsApi.fileUrl(product.imageIds[0])}
              alt={product.name}
              className="h-full w-full object-cover"
              whileHover={{ scale: 1.06 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-accent-300">
              <BoxIcon className="h-12 w-12" />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <p className="line-clamp-2 font-medium text-content-primary">{product.name}</p>
          {categoryName && <p className="text-xs text-content-secondary">{categoryName}</p>}
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <p className="text-lg font-semibold text-brand-600 dark:text-brand-400">
              {t('catalog.priceValue', { price: product.price })}
            </p>
            <AddToCartButton
              productId={product.id}
              imageUrl={product.imageIds.length > 0 ? productsApi.fileUrl(product.imageIds[0]) : undefined}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
