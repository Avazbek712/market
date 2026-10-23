import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as favoritesApi from '../api/favorites'
import { useAuth } from '../auth/AuthContext'

interface FavoritesContextValue {
  isFavorite: (productId: number) => boolean
  isPending: (productId: number) => boolean
  toggleFavorite: (productId: number) => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

// Large enough that a personal favorites list fits in one page — this is only
// used to know which hearts should render filled, not to display the list
// itself (that's a separate, properly paginated fetch in BuyerDashboard).
const ALL_FAVORITES_PAGE_SIZE = 200

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { status, hasPermission } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set())
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())

  const eligible = status === 'authenticated' && hasPermission('FAVORITE_MANAGE')

  useEffect(() => {
    if (!eligible) {
      setFavoriteIds(new Set())
      return
    }
    let cancelled = false
    favoritesApi
      .listFavorites(0, ALL_FAVORITES_PAGE_SIZE)
      .then((result) => {
        if (cancelled) return
        setFavoriteIds(new Set(result.content.map((product) => product.id)))
      })
      .catch(() => {
        // Favorites state is a nice-to-have (filled hearts) — a failed fetch
        // just leaves hearts unfilled, not worth surfacing as an error.
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eligible])

  async function toggleFavorite(productId: number) {
    if (!eligible || pendingIds.has(productId)) return

    const wasFavorite = favoriteIds.has(productId)
    setPendingIds((prev) => new Set(prev).add(productId))
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      if (wasFavorite) next.delete(productId)
      else next.add(productId)
      return next
    })

    try {
      if (wasFavorite) {
        await favoritesApi.removeFavorite(productId)
      } else {
        await favoritesApi.addFavorite(productId)
      }
    } catch {
      // Revert the optimistic update if the request actually failed.
      setFavoriteIds((prev) => {
        const next = new Set(prev)
        if (wasFavorite) next.add(productId)
        else next.delete(productId)
        return next
      })
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    }
  }

  const value = useMemo<FavoritesContextValue>(
    () => ({
      isFavorite: (productId) => favoriteIds.has(productId),
      isPending: (productId) => pendingIds.has(productId),
      toggleFavorite,
    }),
    [favoriteIds, pendingIds],
  )

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext)
  if (!ctx) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return ctx
}
