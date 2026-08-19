import { forwardRef } from 'react';

const Textarea = forwardRef(function Textarea({
  label,
  error,
  hint,
  rows = 4,
  fullWidth = true,
  className = '',
  style = {},
  ...props
}, ref) {
  return (
    <div className={`ds-textarea-group ${className}`} style={{ width: fullWidth ? '100%' : 'auto' }}>
      {label && <label className="ds-textarea-label">{label}</label>}
      <textarea
        ref={ref}
        className={`ds-textarea ${error ? 'ds-textarea--error' : ''}`}
        rows={rows}
        style={style}
        {...props}
      />
      {error && <span className="ds-textarea-error">{error}</span>}
      {hint && !error && <span className="ds-textarea-hint">{hint}</span>}

      <style>{`
        .ds-textarea-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .ds-textarea-label {
          font-size: var(--ds-text-sm);
          font-weight: 500;
          color: var(--ds-text-secondary);
        }
        .ds-textarea {
          width: 100%;
          padding: 10px 12px;
          font-family: var(--ds-font);
          font-size: var(--ds-text-sm);
          color: var(--ds-text-primary);
          background: var(--ds-surface);
          border: 1px solid var(--ds-border);
          border-radius: var(--ds-radius-md);
          outline: none;
          resize: vertical;
          line-height: 1.5;
          transition: border-color var(--ds-transition);
        }
        .ds-textarea:focus {
          border-color: var(--ds-accent);
          box-shadow: 0 0 0 2px var(--ds-accent-muted);
        }
        .ds-textarea::placeholder {
          color: var(--ds-text-muted);
        }
        .ds-textarea--error {
          border-color: var(--ds-error) !important;
        }
        .ds-textarea-error {
          font-size: var(--ds-text-xs);
          color: var(--ds-error);
        }
        .ds-textarea-hint {
          font-size: var(--ds-text-xs);
          color: var(--ds-text-muted);
        }
      `}</style>
    </div>
  );
});

export default Textarea;
