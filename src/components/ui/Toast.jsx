import { useApp } from '../../context/AppContext.jsx';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  const colors = {
    success: { border: 'var(--ds-success)', bg: 'var(--ds-success-muted)' },
    error: { border: 'var(--ds-error)', bg: 'var(--ds-error-muted)' },
    warning: { border: 'var(--ds-warning)', bg: 'var(--ds-warning-muted)' },
    info: { border: 'var(--ds-accent)', bg: 'var(--ds-accent-muted)' },
  };

  return (
    <div className="ds-toast-container">
      {toasts.map((toast) => {
        const c = colors[toast.type] || colors.info;
        return (
          <div
            key={toast.id}
            className="ds-toast"
            style={{
              borderLeft: `3px solid ${c.border}`,
            }}
          >
            <span className="ds-toast-icon" style={{ color: c.border }}>
              {icons[toast.type] || icons.info}
            </span>
            <span className="ds-toast-msg">{toast.message}</span>
            <button
              className="ds-toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        );
      })}

      <style>{`
        .ds-toast-container {
          position: fixed;
          top: var(--ds-space-4);
          right: var(--ds-space-4);
          z-index: 2000;
          display: flex;
          flex-direction: column;
          gap: var(--ds-space-2);
          max-width: 380px;
        }
        .ds-toast {
          display: flex;
          align-items: center;
          gap: var(--ds-space-3);
          padding: var(--ds-space-3) var(--ds-space-4);
          background: var(--ds-surface-elevated);
          border: 1px solid var(--ds-border);
          border-radius: var(--ds-radius-md);
          box-shadow: var(--ds-shadow-md);
          animation: ds-toast-in 0.2s ease;
          font-size: var(--ds-text-sm);
        }
        .ds-toast-icon {
          font-weight: 700;
          font-size: var(--ds-text-base);
          flex-shrink: 0;
        }
        .ds-toast-msg {
          flex: 1;
          color: var(--ds-text-primary);
        }
        .ds-toast-close {
          background: none;
          border: none;
          color: var(--ds-text-muted);
          cursor: pointer;
          font-size: 16px;
          padding: 2px;
          flex-shrink: 0;
        }
        .ds-toast-close:hover {
          color: var(--ds-text-primary);
        }
      `}</style>
    </div>
  );
}
