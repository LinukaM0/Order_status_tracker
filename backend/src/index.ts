import express from 'express';
import morgan from 'morgan';
import webhookRouter from './routes/webhooks';
import ordersRouter from './routes/orders';

const app = express();

app.use(express.json());
app.use(morgan('dev'));

app.use('/webhooks', webhookRouter);
app.use('/orders', ordersRouter);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
