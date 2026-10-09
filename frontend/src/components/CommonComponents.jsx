import React from 'react';
import { Scissors } from 'lucide-react';

export function LoadingSpinner({ text = 'Tailoring perfection...', size = 'medium' }) {
  const isLarge = size === 'large';
  return (
    <div className={`spinner-container ${isLarge ? 'spinner-large' : ''}`}>
      <div className="spinner-orbit">
        <div className="spinner-core">
          <Scissors className="spinner-icon" size={isLarge ? 28 : 20} />
        </div>
      </div>
      {text && <p className="spinner-text">{text}</p>}

      <style>{`
        .spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          gap: 1rem;
        }
        .spinner-large {
          min-height: 400px;
        }
        .spinner-orbit {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-full);
          border: 3px solid var(--soft-blush);
          border-top-color: var(--rose-accent);
          border-right-color: var(--deep-rose);
          animation: spinOrbit 1s infinite linear;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .spinner-core {
          color: var(--deep-rose);
          animation: counterSpin 1s infinite linear;
        }
        .spinner-text {
          font-family: var(--font-serif);
          font-style: italic;
          color: var(--text-muted);
          font-size: 0.95rem;
        }
        @keyframes spinOrbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes counterSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
      `}</style>
    </div>
  );
}

export function EmptyState({ icon: Icon = Scissors, title = 'No records found', description = 'There are no items to display at this moment.', actionText, onAction }) {
  return (
    <div className="empty-state-card studio-card">
      <div className="empty-icon-wrap">
        <Icon size={32} />
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-desc">{description}</p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm mt-3">
          {actionText}
        </button>
      )}

      <style>{`
        .empty-state-card {
          text-align: center;
          padding: 3.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: #ffffff;
        }
        .empty-icon-wrap {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-full);
          background: var(--soft-blush);
          color: var(--rose-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }
        .empty-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 0.5rem;
        }
        .empty-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
          max-width: 420px;
          line-height: 1.5;
        }
        .mt-3 {
          margin-top: 1.25rem;
        }
      `}</style>
    </div>
  );
}

export function ConfirmationModal({ isOpen, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, isDanger = false, isLoading = false }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay animate-fade">
      <div className="modal-dialog studio-card">
        <h3 className="modal-title font-serif">{title}</h3>
        <p className="modal-message">{message}</p>

        <div className="modal-actions">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="btn btn-outline btn-sm"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`btn btn-sm ${isDanger ? 'btn-danger' : 'btn-primary'}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(56, 39, 46, 0.45);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 1.5rem;
        }
        .modal-dialog {
          max-width: 460px;
          width: 100%;
          background: #ffffff;
          padding: 2rem;
          box-shadow: var(--shadow-lg);
        }
        .modal-title {
          font-size: 1.35rem;
          margin-bottom: 0.75rem;
          color: var(--text-main);
        }
        .modal-message {
          font-size: 0.925rem;
          color: var(--text-muted);
          margin-bottom: 1.75rem;
          line-height: 1.5;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }
        .btn-danger {
          background: var(--error);
          color: #ffffff;
          border: none;
        }
        .btn-danger:hover:not(:disabled) {
          background: #B71C1C;
        }
      `}</style>
    </div>
  );
}
