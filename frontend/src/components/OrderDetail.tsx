import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadOrderById, clearSelected } from '../store/ordersSlice';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { selected, loading, error } = useAppSelector((s) => s.orders);

  useEffect(() => {
    if (id) dispatch(loadOrderById(id));
    return () => { dispatch(clearSelected()); };
  }, [dispatch, id]);

  if (loading) return <p>Loading order...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!selected) return <p>Order not found.</p>;

  return (
    <div>
      <button onClick={() => navigate('/')}>← Back to orders</button>

      <h1>Order {selected.id}</h1>
      <p>Current status: <strong>{selected.status}</strong></p>
      <p>Created: {new Date(selected.createdAt).toLocaleString()}</p>
      <p>Last updated: {new Date(selected.updatedAt).toLocaleString()}</p>

      <h2>Event History</h2>
      {selected.events.length === 0 ? (
        <p>No events recorded.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Event ID</th>
              <th>Status</th>
              <th>Event Time</th>
              <th>Received At</th>
            </tr>
          </thead>
          <tbody>
            {selected.events.map((event) => (
              <tr key={event.id}>
                <td>{event.eventId}</td>
                <td>{event.status}</td>
                <td>{new Date(event.timestamp).toLocaleString()}</td>
                <td>{new Date(event.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
