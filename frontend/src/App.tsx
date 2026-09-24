import { Routes, Route } from 'react-router-dom';
import OrderList from './components/OrderList';
import OrderDetail from './components/OrderDetail';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<OrderList />} />
      <Route path="/orders/:id" element={<OrderDetail />} />
    </Routes>
  );
}
