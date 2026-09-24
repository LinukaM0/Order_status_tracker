import db from '../db/database';
import { OrderStatus, WebhookEvent, Order, OrderWithHistory } from '../types';

export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  created: ['paid', 'cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export function isValidTransition(current: OrderStatus, next: OrderStatus): boolean {
  return VALID_TRANSITIONS[current].includes(next);
}

export function processWebhookEvent(event: WebhookEvent):
  | { result: 'accepted' }
  | { result: 'duplicate' }
  | { result: 'out_of_order' }
  | { result: 'invalid'; reason: string } {
  const now = new Date().toISOString();

  const seen = db
    .prepare('SELECT id FROM order_events WHERE eventId = ?')
    .get(event.eventId);

  if (seen) return { result: 'duplicate' };

  const order = db
    .prepare('SELECT * FROM orders WHERE id = ?')
    .get(event.orderId) as Order | undefined;

  if (!order) {
    if (event.status !== 'created') {
      return {
        result: 'invalid',
        reason: `Order ${event.orderId} does not exist. First event must be 'created', got '${event.status}'.`,
      };
    }

    db.transaction(() => {
      db.prepare(
        `INSERT INTO orders (id, status, createdAt, updatedAt) VALUES (?, ?, ?, ?)`
      ).run(event.orderId, 'created', now, now);

      db.prepare(
        `INSERT INTO order_events (eventId, orderId, status, timestamp, createdAt) VALUES (?, ?, ?, ?, ?)`
      ).run(event.eventId, event.orderId, event.status, event.timestamp, now);
    })();

    return { result: 'accepted' };
  }

  if (!isValidTransition(order.status, event.status)) {
    // If this event's timestamp is older than the latest stored event,
    // it arrived out of order — keep it in history but don't change status.
    const latest = db
      .prepare('SELECT timestamp FROM order_events WHERE orderId = ? ORDER BY timestamp DESC LIMIT 1')
      .get(event.orderId) as { timestamp: string } | undefined;

    if (latest && event.timestamp < latest.timestamp) {
      db.prepare(
        `INSERT INTO order_events (eventId, orderId, status, timestamp, createdAt) VALUES (?, ?, ?, ?, ?)`
      ).run(event.eventId, event.orderId, event.status, event.timestamp, now);

      return { result: 'out_of_order' };
    }

    return {
      result: 'invalid',
      reason: `Invalid transition for order ${event.orderId}: '${order.status}' -> '${event.status}'.`,
    };
  }

  db.transaction(() => {
    db.prepare(`UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?`)
      .run(event.status, now, event.orderId);

    db.prepare(
      `INSERT INTO order_events (eventId, orderId, status, timestamp, createdAt) VALUES (?, ?, ?, ?, ?)`
    ).run(event.eventId, event.orderId, event.status, event.timestamp, now);
  })();

  return { result: 'accepted' };
}

export function getAllOrders(status?: string): Order[] {
  if (status) {
    return db
      .prepare('SELECT * FROM orders WHERE status = ? ORDER BY createdAt DESC')
      .all(status) as Order[];
  }
  return db.prepare('SELECT * FROM orders ORDER BY createdAt DESC').all() as Order[];
}

export function getOrderById(orderId: string): OrderWithHistory | null {
  const order = db
    .prepare('SELECT * FROM orders WHERE id = ?')
    .get(orderId) as Order | undefined;

  if (!order) return null;

  const events = db
    .prepare('SELECT * FROM order_events WHERE orderId = ? ORDER BY timestamp ASC')
    .all(orderId);

  return { ...order, events } as OrderWithHistory;
}
