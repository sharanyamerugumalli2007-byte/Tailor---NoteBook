import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ErrorMessage = ({ message, onDismiss, retry }) => {
  if (!message) return null;

  return (
    <div style={{
      backgroundColor: 'var(--danger-bg)',
      border: '1px solid #fecaca',
      borderRadius: 'var(--radius-md)',
      padding: '0.85rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem',
      margin: '1rem 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <AlertCircle size={18} color="var(--danger)" />
        <span style={{ fontSize: '0.875rem', color: '#991b1b', fontWeight: 500 }}>
          {message}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {retry && (
          <button 
            type="button" 
            onClick={retry}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button 
            type="button" 
            onClick={onDismiss}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b' }}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
