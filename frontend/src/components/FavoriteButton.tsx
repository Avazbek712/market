import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { useFavorites } from '../favorites/FavoritesContext'
import { HeartIcon } from './ActionIcons'

export default function FavoriteButton({ productId, className = '' }: { productId: number; className?: string }) {
  const { t } = useTranslation()
  const { status, hasPermission } = useAuth()
  const { isFavorite, isPending, toggleFavorite } = useFavorites()

  if (status !== 'authenticated' || !hasPermission('FAVORITE_MANAGE')) {
    return null
  }

  const favorited = isFavorite(productId)
  const pending = isPending(productId)

  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void toggleFavorite(productId)
      }}
      disabled={pending}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.88 }}
      transition={{ duration: 0.15 }}
      aria-label={favorited ? t('favorites.remove') : t('favorites.add')}
      aria-pressed={favorited}
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-surface-raised/90 shadow-sm backdrop-blur transition-colors disabled:opacity-60 ${
        favorited ? 'text-brand-500' : 'text-content-secondary hover:text-brand-500'
      } ${className}`}
    >
      <HeartIcon filled={favorited} className="h-4 w-4" />
    </motion.button>
  )
}
