export type OrderStatus =
  | 'created'
  | 'paid'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface WebhookEvent {
  eventId: string;
  orderId: string;
  status: OrderStatus;
  timestamp: string; // ISO 8601
}

export interface Order {
  orderId: string;
  currentStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderEvent {
  id: number;
  eventId: string;
  orderId: string;
  status: OrderStatus;
  timestamp: string;
  receivedAt: string;
}

export interface OrderWithHistory extends Order {
  events: OrderEvent[];
}
