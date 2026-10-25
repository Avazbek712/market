import { AnimatePresence, motion } from 'motion/react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { useFavorites } from '../favorites/FavoritesContext'
import { HEART_PATH, HeartIcon } from './ActionIcons'

// A jagged line down the middle of the 24x24 viewBox, shared by both clip
// shapes below. Because both halves clip the exact same heart path along the
// exact same boundary, at rest (x/y/rotate all 0) the two halves line up
// pixel-perfect and read as one solid heart — only on exit do they split.
const BREAK_LINE = '12,1 9,6 15,9 8,13 14,17 10,21 12,23'

const heartbeatScale = [0.6, 1.3, 0.85, 1.15, 1]
const heartbeatTimes = [0, 0.3, 0.55, 0.8, 1]

function SplitHeart({ className }: { className?: string }) {
  const uid = useId()
  const leftClip = `heart-break-left-${uid}`
  const rightClip = `heart-break-right-${uid}`

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <clipPath id={leftClip}>
          <polygon points={`0,0 ${BREAK_LINE} 0,24`} />
        </clipPath>
        <clipPath id={rightClip}>
          <polygon points={`24,0 ${BREAK_LINE} 24,24`} />
        </clipPath>
      </defs>
      <motion.g
        clipPath={`url(#${leftClip})`}
        style={{ transformOrigin: '12px 12px' }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: heartbeatScale }}
        exit={{ x: -7, y: 12, rotate: -40, opacity: 0, transition: { duration: 0.45, ease: 'easeIn' } }}
        transition={{ duration: 0.45, times: heartbeatTimes }}
      >
        <path d={HEART_PATH} fill="currentColor" />
      </motion.g>
      <motion.g
        clipPath={`url(#${rightClip})`}
        style={{ transformOrigin: '12px 12px' }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: heartbeatScale }}
        exit={{ x: 7, y: 12, rotate: 40, opacity: 0, transition: { duration: 0.45, ease: 'easeIn' } }}
        transition={{ duration: 0.45, times: heartbeatTimes }}
      >
        <path d={HEART_PATH} fill="currentColor" />
      </motion.g>
    </svg>
  )
}

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
      <span className="relative block h-4 w-4">
        <AnimatePresence initial={false}>
          {favorited ? (
            <span key="filled" className="absolute inset-0">
              <SplitHeart className="h-4 w-4" />
            </span>
          ) : (
            <motion.span
              key="outline"
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <HeartIcon className="h-4 w-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  )
}
