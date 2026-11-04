import { apiClient } from './client'
import type { PageResponse } from './products'

export type OrderItemStatus = 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type PaymentStatus = 'UNPAID' | 'PAID'

export interface OrderItem {
  productId: number | null
  productName: string
  price: number
  quantity: number
  status: OrderItemStatus
}

export interface Order {
  id: number
  paymentStatus: PaymentStatus
  items: OrderItem[]
  total: number
  createdAt: string
}

export async function checkout(): Promise<Order> {
  const { data } = await apiClient.post<Order>('/orders/checkout')
  return data
}

export async function listMyOrders(page = 0, size = 10): Promise<PageResponse<Order>> {
  const { data } = await apiClient.get<PageResponse<Order>>('/orders', {
    params: { page, size, sort: 'createdAt,desc' },
  })
  return data
}
