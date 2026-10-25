import { AnimatePresence, motion } from 'motion/react'
import { createContext, useContext, useRef, useState, type ReactNode, type RefObject } from 'react'

interface FlyingItem {
  id: number
  startRect: DOMRect
  endRect: DOMRect
  image?: string
}

interface CartFlyContextValue {
  cartIconRef: RefObject<HTMLElement | null>
  flyToCart: (source: HTMLElement, image?: string) => void
}

const CartFlyContext = createContext<CartFlyContextValue | null>(null)

const GHOST_SIZE = 36

function FlyingGhost({ item, onDone }: { item: FlyingItem; onDone: () => void }) {
  const { startRect, endRect, image } = item
  const startCenterX = startRect.left + startRect.width / 2 - GHOST_SIZE / 2
  const startCenterY = startRect.top + startRect.height / 2 - GHOST_SIZE / 2
  const deltaX = endRect.left + endRect.width / 2 - (startRect.left + startRect.width / 2)
  const deltaY = endRect.top + endRect.height / 2 - (startRect.top + startRect.height / 2)

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: startCenterX,
        top: startCenterY,
        width: GHOST_SIZE,
        height: GHOST_SIZE,
      }}
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{
        x: [0, deltaX * 0.5, deltaX],
        y: [0, Math.min(deltaY, -24), deltaY],
        scale: [1, 1.05, 0.2],
        opacity: [1, 1, 0.5],
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.65, times: [0, 0.45, 1], ease: 'easeIn' }}
      onAnimationComplete={onDone}
      className="overflow-hidden rounded-full border border-border-subtle bg-surface-raised shadow-lg"
    >
      {image ? (
        <img src={image} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full bg-brand-500" />
      )}
    </motion.div>
  )
}

export function CartFlyProvider({ children }: { children: ReactNode }) {
  const cartIconRef = useRef<HTMLElement | null>(null)
  const [items, setItems] = useState<FlyingItem[]>([])

  function flyToCart(source: HTMLElement, image?: string) {
    const target = cartIconRef.current
    if (!target || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const startRect = source.getBoundingClientRect()
    const endRect = target.getBoundingClientRect()
    setItems((prev) => [...prev, { id: Date.now() + Math.random(), startRect, endRect, image }])
  }

  function handleDone(id: number) {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <CartFlyContext.Provider value={{ cartIconRef, flyToCart }}>
      {children}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[999]">
        <AnimatePresence>
          {items.map((item) => (
            <FlyingGhost key={item.id} item={item} onDone={() => handleDone(item.id)} />
          ))}
        </AnimatePresence>
      </div>
    </CartFlyContext.Provider>
  )
}

export function useCartFly(): CartFlyContextValue {
  const ctx = useContext(CartFlyContext)
  if (!ctx) {
    throw new Error('useCartFly must be used within a CartFlyProvider')
  }
  return ctx
}
