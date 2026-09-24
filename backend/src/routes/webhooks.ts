import { Router, Request, Response } from 'express';
import { processWebhookEvent } from '../services/orderService';
import { WebhookEvent, OrderStatus } from '../types';

const router = Router();

const VALID_STATUSES: OrderStatus[] = ['created', 'paid', 'shipped', 'delivered', 'cancelled'];

router.post('/orders', (req: Request, res: Response) => {
  const body = req.body as Partial<WebhookEvent>;

  if (!body.eventId || !body.orderId || !body.status || !body.timestamp) {
    return res.status(400).json({
      error: 'Missing required fields: eventId, orderId, status, timestamp',
    });
  }

  if (!VALID_STATUSES.includes(body.status as OrderStatus)) {
    return res.status(400).json({
      error: `Invalid status '${body.status}'. Must be one of: ${VALID_STATUSES.join(', ')}`,
    });
  }

  const outcome = processWebhookEvent(body as WebhookEvent);

  // Return 200 for duplicates and out-of-order events so the provider stops retrying
  if (outcome.result === 'duplicate' || outcome.result === 'out_of_order') {
    return res.status(200).json({ message: 'Event received' });
  }

  // 422 for transitions that violate the state machine (logged for debugging)
  if (outcome.result === 'invalid') {
    console.warn(`[webhook] rejected: ${outcome.reason}`);
    return res.status(422).json({ error: outcome.reason });
  }

  return res.status(200).json({ message: 'Event accepted' });
});

export default router;
