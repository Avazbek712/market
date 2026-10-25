import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as cartApi from '../api/cart'
import type { Cart } from '../api/cart'
import { useAuth } from '../auth/AuthContext'

interface CartContextValue {
  cart: Cart
  itemCount: number
  pendingProductIds: Set<number>
  addToCart: (productId: number, quantity?: number) => Promise<void>
  updateQuantity: (productId: number, quantity: number) => Promise<void>
  removeFromCart: (productId: number) => Promise<void>
}

const EMPTY_CART: Cart = { items: [], total: 0 }

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { status, hasPermission } = useAuth()
  const [cart, setCart] = useState<Cart>(EMPTY_CART)
  const [pendingProductIds, setPendingProductIds] = useState<Set<number>>(new Set())

  const eligible = status === 'authenticated' && hasPermission('CART_MANAGE')

  useEffect(() => {
    if (!eligible) {
      setCart(EMPTY_CART)
      return
    }
    let cancelled = false
    cartApi
      .getCart()
      .then((result) => {
        if (!cancelled) setCart(result)
      })
      .catch(() => {
        // Cart badge/state is best-effort on load — a failed fetch just leaves
        // the cart looking empty until the next successful mutation.
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligible])

  async function withPending(productId: number, action: () => Promise<Cart>) {
    setPendingProductIds((prev) => new Set(prev).add(productId))
    try {
      const updated = await action()
      setCart(updated)
    } finally {
      setPendingProductIds((prev) => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    }
  }

  async function addToCart(productId: number, quantity = 1) {
    await withPending(productId, () => cartApi.addCartItem(productId, quantity))
  }

  async function updateQuantity(productId: number, quantity: number) {
    await withPending(productId, () => cartApi.updateCartItemQuantity(productId, quantity))
  }

  async function removeFromCart(productId: number) {
    await withPending(productId, () => cartApi.removeCartItem(productId))
  }

  const itemCount = useMemo(() => cart.items.reduce((sum, item) => sum + item.quantity, 0), [cart])

  const value = useMemo<CartContextValue>(
    () => ({ cart, itemCount, pendingProductIds, addToCart, updateQuantity, removeFromCart }),
    [cart, itemCount, pendingProductIds],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return ctx
}
