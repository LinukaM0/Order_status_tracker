import { Router, Request, Response } from 'express';
import { getAllOrders, getOrderById } from '../services/orderService';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { status } = req.query;
  const orders = getAllOrders(status as string | undefined);
  return res.json(orders);
});

router.get('/:id', (req: Request, res: Response) => {
  const order = getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: `Order '${req.params.id}' not found` });
  }
  return res.json(order);
});

export default router;
