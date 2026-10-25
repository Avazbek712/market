import { motion } from 'motion/react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { useCart } from '../cart/CartContext'
import { useCartFly } from '../cart/CartFlyContext'
import { PlusIcon } from './ActionIcons'
import { ShoppingBagIcon } from './DecorativeIcons'

export default function AddToCartButton({
  productId,
  imageUrl,
  className = '',
  variant = 'icon',
}: {
  productId: number
  imageUrl?: string
  className?: string
  variant?: 'icon' | 'full'
}) {
  const { t } = useTranslation()
  const { status, hasPermission } = useAuth()
  const { addToCart, pendingProductIds } = useCart()
  const { flyToCart } = useCartFly()
  const buttonRef = useRef<HTMLButtonElement>(null)

  if (status !== 'authenticated' || !hasPermission('CART_MANAGE')) {
    return null
  }

  const pending = pendingProductIds.has(productId)

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (buttonRef.current) flyToCart(buttonRef.current, imageUrl)
    void addToCart(productId, 1)
  }

  if (variant === 'full') {
    return (
      <motion.button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        disabled={pending}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className={`flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-60 ${className}`}
      >
        <ShoppingBagIcon className="h-4 w-4" />
        {t('cart.add')}
      </motion.button>
    )
  }

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      disabled={pending}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.15 }}
      aria-label={t('cart.add')}
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white shadow-sm transition-colors hover:bg-brand-600 disabled:opacity-60 ${className}`}
    >
      <PlusIcon className="h-4 w-4" />
    </motion.button>
  )
}
