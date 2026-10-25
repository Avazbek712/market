import { apiClient } from './client'

export interface CartItem {
  productId: number
  productName: string
  price: number
  quantity: number
  subtotal: number
  imageIds: number[]
}

export interface Cart {
  items: CartItem[]
  total: number
}

export async function getCart(): Promise<Cart> {
  const { data } = await apiClient.get<Cart>('/cart')
  return data
}

export async function addCartItem(productId: number, quantity: number): Promise<Cart> {
  const { data } = await apiClient.post<Cart>('/cart/items', { productId, quantity })
  return data
}

export async function updateCartItemQuantity(productId: number, quantity: number): Promise<Cart> {
  const { data } = await apiClient.patch<Cart>(`/cart/items/${productId}`, { quantity })
  return data
}

export async function removeCartItem(productId: number): Promise<Cart> {
  const { data } = await apiClient.delete<Cart>(`/cart/items/${productId}`)
  return data
}
