import { describe, it, expect, beforeEach } from 'vitest';
import {
  isValidTransition,
  processWebhookEvent,
  VALID_TRANSITIONS,
} from '../src/services/orderService';
import db from '../src/db/database';

// Reset DB state before each test
beforeEach(() => {
  db.exec('DELETE FROM order_events; DELETE FROM orders;');
});

describe('isValidTransition', () => {
  it('allows forward transitions', () => {
    expect(isValidTransition('created', 'paid')).toBe(true);
    expect(isValidTransition('paid', 'shipped')).toBe(true);
    expect(isValidTransition('shipped', 'delivered')).toBe(true);
  });

  it('allows cancellation from created and paid', () => {
    expect(isValidTransition('created', 'cancelled')).toBe(true);
    expect(isValidTransition('paid', 'cancelled')).toBe(true);
  });

  it('rejects cancellation after shipped', () => {
    expect(isValidTransition('shipped', 'cancelled')).toBe(false);
    expect(isValidTransition('delivered', 'cancelled')).toBe(false);
  });

  it('rejects backward transitions', () => {
    expect(isValidTransition('paid', 'created')).toBe(false);
    expect(isValidTransition('shipped', 'paid')).toBe(false);
    expect(isValidTransition('delivered', 'shipped')).toBe(false);
  });

  it('rejects transitions from terminal states', () => {
    expect(isValidTransition('delivered', 'paid')).toBe(false);
    expect(isValidTransition('cancelled', 'paid')).toBe(false);
  });
});

describe('processWebhookEvent - idempotency', () => {
  it('returns duplicate when the same eventId is sent twice', () => {
    const event = {
      eventId: 'evt_1',
      orderId: 'ord_1',
      status: 'created' as const,
      timestamp: '2026-01-01T10:00:00Z',
    };

    processWebhookEvent(event);
    const result = processWebhookEvent(event);

    expect(result.result).toBe('duplicate');
  });

  it('does not create a second DB row on duplicate', () => {
    const event = {
      eventId: 'evt_dup',
      orderId: 'ord_dup',
      status: 'created' as const,
      timestamp: '2026-01-01T10:00:00Z',
    };

    processWebhookEvent(event);
    processWebhookEvent(event);

    const rows = db
      .prepare('SELECT * FROM order_events WHERE eventId = ?')
      .all('evt_dup');
    expect(rows).toHaveLength(1);
  });
});

describe('processWebhookEvent - valid transitions', () => {
  it('creates a new order on first created event', () => {
    const result = processWebhookEvent({
      eventId: 'evt_c1',
      orderId: 'ord_a',
      status: 'created',
      timestamp: '2026-01-01T10:00:00Z',
    });
    expect(result.result).toBe('accepted');
  });

  it('progresses order through the full happy path', () => {
    const orderId = 'ord_happy';
    const events = [
      { eventId: 'e1', status: 'created' as const, timestamp: '2026-01-01T10:00:00Z' },
      { eventId: 'e2', status: 'paid' as const,    timestamp: '2026-01-01T11:00:00Z' },
      { eventId: 'e3', status: 'shipped' as const, timestamp: '2026-01-01T12:00:00Z' },
      { eventId: 'e4', status: 'delivered' as const, timestamp: '2026-01-01T13:00:00Z' },
    ];

    for (const e of events) {
      const r = processWebhookEvent({ ...e, orderId });
      expect(r.result).toBe('accepted');
    }

    const order = db.prepare('SELECT status FROM orders WHERE id = ?').get(orderId) as { status: string };
    expect(order.status).toBe('delivered');
  });
});

describe('processWebhookEvent - invalid transitions', () => {
  it('rejects first event that is not created', () => {
    const result = processWebhookEvent({
      eventId: 'evt_bad',
      orderId: 'ord_new',
      status: 'paid',
      timestamp: '2026-01-01T10:00:00Z',
    });
    expect(result.result).toBe('invalid');
  });

  it('rejects a transition that skips a step', () => {
    processWebhookEvent({ eventId: 'e1', orderId: 'ord_skip', status: 'created', timestamp: '2026-01-01T10:00:00Z' });
    const result = processWebhookEvent({ eventId: 'e2', orderId: 'ord_skip', status: 'shipped', timestamp: '2026-01-01T11:00:00Z' });
    expect(result.result).toBe('invalid');
  });
});

describe('processWebhookEvent - out-of-order events', () => {
  it('stores a late-arriving event in history but does not change the order status', () => {
    const orderId = 'ord_oor';

    processWebhookEvent({ eventId: 'e1', orderId, status: 'created', timestamp: '2026-01-01T10:00:00Z' });
    processWebhookEvent({ eventId: 'e2', orderId, status: 'paid',    timestamp: '2026-01-01T11:00:00Z' });
    processWebhookEvent({ eventId: 'e3', orderId, status: 'shipped', timestamp: '2026-01-01T12:00:00Z' });

    // Simulate a late 'paid' event arriving after 'shipped'
    const result = processWebhookEvent({
      eventId: 'e_late',
      orderId,
      status: 'paid',
      timestamp: '2026-01-01T10:30:00Z', // older than shipped
    });

    expect(result.result).toBe('out_of_order');

    // Order status must remain 'shipped'
    const order = db.prepare('SELECT status FROM orders WHERE id = ?').get(orderId) as { status: string };
    expect(order.status).toBe('shipped');

    // Event must still be stored in history
    const events = db.prepare('SELECT * FROM order_events WHERE orderId = ?').all(orderId);
    expect(events).toHaveLength(4);
  });
});
