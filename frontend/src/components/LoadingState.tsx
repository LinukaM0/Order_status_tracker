import type { FC } from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: FC<LoadingStateProps> = ({ message = 'Loading orders...' }) => {
  return (
    <div className="state-card loading-state" role="status" aria-live="polite">
      <div className="spinner-wrapper">
        <svg className="spinner" viewBox="0 0 50 50">
          <circle
            className="spinner-path"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="4"
          />
        </svg>
      </div>
      <p className="state-title">{message}</p>
      <div className="skeleton-container">
        <div className="skeleton-bar skeleton-title" />
        <div className="skeleton-bar skeleton-row" />
        <div className="skeleton-bar skeleton-row short" />
      </div>
    </div>
  );
};

export default LoadingState;
