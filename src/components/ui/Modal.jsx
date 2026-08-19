import { useEffect, useCallback } from 'react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = '520px', className = '' }) {
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div className="ds-modal-overlay" onClick={onClose}>
      <div
        className={`ds-modal ${className}`}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="ds-modal-header">
          {title && <h2 className="ds-modal-title">{title}</h2>}
          <button
            className="ds-modal-close"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>
        <div className="ds-modal-body">
          {children}
        </div>
      </div>

      <style>{`
        .ds-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--ds-space-4);
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          animation: ds-fade-in 0.15s ease;
        }
        .ds-modal {
          width: 100%;
          background: var(--ds-surface);
          border: 1px solid var(--ds-border);
          border-radius: var(--ds-radius-xl);
          box-shadow: var(--ds-shadow-lg);
          animation: ds-slide-up 0.2s ease;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }
        .ds-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--ds-space-5) var(--ds-space-6);
          border-bottom: 1px solid var(--ds-border);
        }
        .ds-modal-title {
          font-size: var(--ds-text-lg);
          font-weight: 600;
          color: var(--ds-text-primary);
          margin: 0;
        }
        .ds-modal-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: transparent;
          border: none;
          border-radius: var(--ds-radius-sm);
          color: var(--ds-text-muted);
          cursor: pointer;
          transition: all var(--ds-transition);
        }
        .ds-modal-close:hover {
          background: var(--ds-surface-secondary);
          color: var(--ds-text-primary);
        }
        .ds-modal-body {
          padding: var(--ds-space-6);
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}
