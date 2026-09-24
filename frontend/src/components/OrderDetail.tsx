import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadOrderById, clearSelected } from '../store/ordersSlice';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';
import StatusBadge from './StatusBadge';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selected, loading, error } = useAppSelector((s) => s.orders);

  useEffect(() => {
    if (id) {
      dispatch(loadOrderById(id));
    }
    return () => {
      dispatch(clearSelected());
    };
  }, [dispatch, id]);

  const handleRetry = () => {
    if (id) dispatch(loadOrderById(id));
  };

  if (loading) {
    return (
      <div className="orders-container">
        <LoadingState message={`Loading details for order ${id || ''}...`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container">
        <button type="button" className="btn btn-secondary back-btn" onClick={() => navigate('/')}>
          ← Back to orders
        </button>
        <ErrorState message={error} onRetry={handleRetry} />
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="orders-container">
        <button type="button" className="btn btn-secondary back-btn" onClick={() => navigate('/')}>
          ← Back to orders
        </button>
        <EmptyState
          title="Order not found"
          description={`We couldn't locate an order with ID "${id}".`}
          actionText="Return to order list"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="detail-top-nav">
        <button type="button" className="btn btn-secondary back-btn" onClick={() => navigate('/')}>
          ← Back to orders
        </button>
      </div>

      <div className="order-summary-card">
        <div className="order-summary-header">
          <div>
            <span className="order-badge-label">Order Details</span>
            <h1 className="order-id-title">{selected.id}</h1>
          </div>
          <div className="order-summary-status">
            <StatusBadge status={selected.status} />
          </div>
        </div>

        <div className="order-meta-grid">
          <div className="meta-item">
            <span className="meta-label">Current Status</span>
            <span className="meta-value font-capitalize">{selected.status}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Created At</span>
            <span className="meta-value">{new Date(selected.createdAt).toLocaleString()}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Last Updated</span>
            <span className="meta-value">{new Date(selected.updatedAt).toLocaleString()}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Total Events</span>
            <span className="meta-value">{selected.events.length}</span>
          </div>
        </div>
      </div>

      <section className="events-section">
        <div className="section-header">
          <h2 className="section-title">Event Audit Trail</h2>
          <span className="section-subtitle">Chronological record of status updates received via webhook</span>
        </div>

        {selected.events.length === 0 ? (
          <EmptyState
            title="No event history"
            description="No webhook events have been recorded for this order yet."
          />
        ) : (
          <div className="table-card">
            <div className="table-responsive">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Event ID</th>
                    <th>Status Transition</th>
                    <th>Event Timestamp</th>
                    <th>Ingested At</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.events.map((event) => (
                    <tr key={event.id}>
                      <td className="font-mono">{event.eventId}</td>
                      <td>
                        <StatusBadge status={event.status} />
                      </td>
                      <td className="text-muted">{new Date(event.timestamp).toLocaleString()}</td>
                      <td className="text-muted">{new Date(event.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
