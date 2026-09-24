export type OrderStatus = 'created' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderEvent {
  id: number;
  eventId: string;
  orderId: string;
  status: OrderStatus;
  timestamp: string;
  createdAt: string;
}

export interface OrderWithHistory extends Order {
  events: OrderEvent[];
}
