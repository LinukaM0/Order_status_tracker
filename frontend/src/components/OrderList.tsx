import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadOrders, setStatusFilter } from '../store/ordersSlice';
import type { OrderStatus } from '../types';

const STATUSES: OrderStatus[] = ['created', 'paid', 'shipped', 'delivered', 'cancelled'];

export default function OrderList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { list, statusFilter, loading, error } = useAppSelector((s) => s.orders);

  useEffect(() => {
    dispatch(loadOrders(statusFilter || undefined));
  }, [dispatch, statusFilter]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setStatusFilter(e.target.value));
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Orders</h1>

      <label htmlFor="status-filter">Filter by status: </label>
      <select id="status-filter" value={statusFilter} onChange={handleFilterChange}>
        <option value="">All</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {list.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Status</th>
              <th>Created</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {list.map((order) => (
              <tr
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <td>{order.id}</td>
                <td>{order.status}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>{new Date(order.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
