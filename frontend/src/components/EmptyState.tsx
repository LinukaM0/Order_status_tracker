import type { FC } from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: FC<EmptyStateProps> = ({
  title = 'No orders found',
  description = 'There are no orders matching your current criteria. Ingest order events via webhooks or adjust your filter.',
  actionText,
  onAction,
}) => {
  return (
    <div className="state-card empty-state">
      <div className="state-icon empty-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" fill="none" strokeWidth="1.75">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      </div>
      <h3 className="state-title">{title}</h3>
      <p className="state-description">{description}</p>
      {actionText && onAction && (
        <button type="button" className="btn btn-secondary" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
