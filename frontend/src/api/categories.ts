import { apiClient } from './client'

export interface Category {
  id: number
  name: string
  description: string | null
  parentId: number | null
}

export interface CategoryPayload {
  categoryName: string
  categoryDescription?: string
  parentId?: number
}

export async function listCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>('/categories')
  return data
}

export async function createCategory(payload: CategoryPayload): Promise<Category> {
  const { data } = await apiClient.post<Category>('/categories', payload)
  return data
}

export async function updateCategory(id: number, payload: CategoryPayload): Promise<Category> {
  const { data } = await apiClient.patch<Category>(`/categories/${id}`, payload)
  return data
}

export async function deleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/categories/${id}`)
}
