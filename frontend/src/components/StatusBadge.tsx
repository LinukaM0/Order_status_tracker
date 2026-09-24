import type { FC } from 'react';
import type { OrderStatus } from '../types';

interface StatusBadgeProps {
  status: OrderStatus;
}

export const StatusBadge: FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={`status-badge status-${status}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
};

export default StatusBadge;
