import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import * as productsApi from '../api/products'
import type { Product } from '../api/products'
import AddToCartButton from './AddToCartButton'
import { HeartIcon } from './ActionIcons'
import { BoxIcon, ShoppingBagIcon } from './DecorativeIcons'
import FavoriteButton from './FavoriteButton'

export default function ProductCard({ product, categoryName }: { product: Product; categoryName?: string }) {
  const { t } = useTranslation()
  const favoritesCount = product.favoritesCount ?? 0
  const ordersCount = product.ordersCount ?? 0

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

        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="line-clamp-2 min-h-10 text-base font-medium text-content-primary">{product.name}</p>
          {categoryName && <p className="-mt-1 text-xs text-content-secondary">{categoryName}</p>}

          <p className="text-lg font-semibold text-brand-600 dark:text-brand-400">
            {t('catalog.priceValue', { price: product.price })}
          </p>

          <div className="mt-auto flex items-end justify-between gap-3 pt-1">
            <span
              title={t('catalog.stats.orders', { count: ordersCount })}
              className="flex items-center gap-1 text-xs text-content-secondary"
            >
              <ShoppingBagIcon className="h-3.5 w-3.5" />
              {ordersCount}
            </span>

            <div className="flex flex-col items-end gap-0.5">
              <span
                title={t('catalog.stats.stock', { count: product.quantity })}
                className="flex items-center gap-1 text-sm font-semibold text-content-primary"
              >
                <BoxIcon className="h-4 w-4" />
                {product.quantity}
              </span>
              <span
                title={t('catalog.stats.favorites', { count: favoritesCount })}
                className="flex items-center gap-1 text-xs text-content-secondary"
              >
                <HeartIcon className="h-3.5 w-3.5" />
                {favoritesCount}
              </span>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <AddToCartButton
              productId={product.id}
              imageUrl={product.imageIds.length > 0 ? productsApi.fileUrl(product.imageIds[0]) : undefined}
              className="flex-1"
            />
            <FavoriteButton productId={product.id} />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
