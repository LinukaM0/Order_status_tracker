import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadOrders, setStatusFilter } from '../store/ordersSlice';
import type { OrderStatus } from '../types';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';
import StatusBadge from './StatusBadge';

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

  const handleRetry = () => {
    dispatch(loadOrders(statusFilter || undefined));
  };

  return (
    <div className="orders-container">
      <header className="page-header">
        <div className="header-titles">
          <h1 className="page-title">Order Status Tracker</h1>
          <p className="page-subtitle">Monitor and inspect order lifecycle events in real time</p>
        </div>
        <div className="filter-wrapper">
          <label htmlFor="status-filter" className="filter-label">Filter by status</label>
          <select
            id="status-filter"
            className="filter-select"
            value={statusFilter}
            onChange={handleFilterChange}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </header>

      {loading && <LoadingState message="Loading orders from API..." />}

      {!loading && error && (
        <ErrorState message={error} onRetry={handleRetry} />
      )}

      {!loading && !error && list.length === 0 && (
        <EmptyState
          title={statusFilter ? `No ${statusFilter} orders` : 'No orders tracked yet'}
          description={
            statusFilter
              ? `There are currently no orders with status '${statusFilter}'. Change the filter to see other orders.`
              : 'The tracker is active. Send webhook events to http://localhost:3001/webhooks/orders to create and update orders.'
          }
          actionText={statusFilter ? 'Clear filter' : undefined}
          onAction={statusFilter ? () => dispatch(setStatusFilter('')) : undefined}
        />
      )}

      {!loading && !error && list.length > 0 && (
        <div className="table-card">
          <div className="table-meta">
            <span className="table-count">
              Showing <strong>{list.length}</strong> {list.length === 1 ? 'order' : 'orders'}
              {statusFilter ? ` (${statusFilter})` : ''}
            </span>
          </div>
          <div className="table-responsive">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {list.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="order-row"
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        navigate(`/orders/${order.id}`);
                      }
                    }}
                  >
                    <td className="font-mono font-medium">{order.id}</td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="text-muted">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="text-muted">{new Date(order.updatedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
