import axios from 'axios';
import type { Order, OrderWithHistory } from '../types';

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

export async function fetchOrders(status?: string): Promise<Order[]> {
  const params = status ? { status } : {};
  const { data } = await api.get<Order[]>('/orders', { params });
  return data;
}

export async function fetchOrderById(id: string): Promise<OrderWithHistory> {
  const { data } = await api.get<OrderWithHistory>(`/orders/${id}`);
  return data;
}
