import { apiClient } from './client'
import type { PageResponse, Product } from './products'

export async function listFavorites(page = 0, size = 20): Promise<PageResponse<Product>> {
  const { data } = await apiClient.get<PageResponse<Product>>('/favorites', { params: { page, size } })
  return data
}

export async function addFavorite(productId: number): Promise<void> {
  await apiClient.post(`/favorites/${productId}`)
}

export async function removeFavorite(productId: number): Promise<void> {
  await apiClient.delete(`/favorites/${productId}`)
}
