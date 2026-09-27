import { apiClient } from './client'

export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  quantity: number
  categoryId: number | null
  sellerId: number
  imageIds: number[]
}

export interface ProductPayload {
  name: string
  description?: string
  price: number
  quantity: number
  categoryId?: number
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export async function listProducts(page = 0, size = 20): Promise<PageResponse<Product>> {
  const { data } = await apiClient.get<PageResponse<Product>>('/products', { params: { page, size } })
  return data
}

export async function listMyProducts(page = 0, size = 50): Promise<PageResponse<Product>> {
  const { data } = await apiClient.get<PageResponse<Product>>('/products/mine', { params: { page, size } })
  return data
}

export async function createProduct(payload: ProductPayload, images: File[]): Promise<Product> {
  const formData = new FormData()
  formData.append('name', payload.name)
  if (payload.description) {
    formData.append('description', payload.description)
  }
  formData.append('price', String(payload.price))
  formData.append('quantity', String(payload.quantity))
  if (payload.categoryId != null) {
    formData.append('categoryId', String(payload.categoryId))
  }
  images.forEach((file) => formData.append('images', file))

  // Let the browser set the multipart Content-Type (with boundary) itself —
  // setting it manually here would omit the boundary and break parsing server-side.
  const { data } = await apiClient.post<Product>('/products', formData)
  return data
}

export async function updateProduct(id: number, payload: ProductPayload): Promise<Product> {
  const { data } = await apiClient.patch<Product>(`/products/${id}`, payload)
  return data
}

export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/products/${id}`)
}

export function fileUrl(id: number): string {
  return `/api/files/${id}`
}
