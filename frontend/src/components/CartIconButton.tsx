import { AnimatePresence, motion } from 'motion/react'
import type { Ref } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useCart } from '../cart/CartContext'
import { useCartFly } from '../cart/CartFlyContext'
import { ShoppingBagIcon } from './DecorativeIcons'

export default function CartIconButton() {
  const { t } = useTranslation()
  const { status, hasPermission } = useAuth()
  const { itemCount } = useCart()
  const { cartIconRef } = useCartFly()

  if (status !== 'authenticated' || !hasPermission('CART_MANAGE')) {
    return null
  }

  return (
    <span ref={cartIconRef as Ref<HTMLSpanElement>} className="relative inline-flex">
      <Link
        to="/buyer"
        aria-label={t('cart.title')}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-strong text-content-secondary transition-colors hover:border-accent-300 hover:bg-accent-50 hover:text-accent-600 dark:hover:bg-accent-900/40"
      >
        <ShoppingBagIcon className="h-4 w-4" />
      </Link>
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            key={itemCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
            className="pointer-events-none absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-semibold text-white"
          >
            {itemCount}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
