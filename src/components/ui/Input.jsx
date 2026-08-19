import { forwardRef } from 'react';

const Input = forwardRef(function Input({
  label,
  error,
  hint,
  icon,
  size = 'md',
  fullWidth = true,
  className = '',
  style = {},
  ...props
}, ref) {
  const heights = { sm: '32px', md: '36px', lg: '40px' };

  return (
    <div className={`ds-input-group ${className}`} style={{ width: fullWidth ? '100%' : 'auto' }}>
      {label && <label className="ds-input-label">{label}</label>}
      <div className="ds-input-wrapper">
        {icon && <span className="ds-input-icon">{icon}</span>}
        <input
          ref={ref}
          className={`ds-input ${error ? 'ds-input--error' : ''}`}
          style={{ height: heights[size] || heights.md, ...style }}
          {...props}
        />
      </div>
      {error && <span className="ds-input-error">{error}</span>}
      {hint && !error && <span className="ds-input-hint">{hint}</span>}

      <style>{`
        .ds-input-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .ds-input-label {
          font-size: var(--ds-text-sm);
          font-weight: 500;
          color: var(--ds-text-secondary);
        }
        .ds-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .ds-input-icon {
          position: absolute;
          left: 10px;
          color: var(--ds-text-muted);
          font-size: var(--ds-text-sm);
          pointer-events: none;
        }
        .ds-input {
          width: 100%;
          padding: 0 12px;
          padding-left: ${icon ? '34px' : '12px'};
          font-family: var(--ds-font);
          font-size: var(--ds-text-sm);
          color: var(--ds-text-primary);
          background: var(--ds-surface);
          border: 1px solid var(--ds-border);
          border-radius: var(--ds-radius-md);
          outline: none;
          transition: border-color var(--ds-transition);
        }
        .ds-input:focus {
          border-color: var(--ds-accent);
          box-shadow: 0 0 0 2px var(--ds-accent-muted);
        }
        .ds-input::placeholder {
          color: var(--ds-text-muted);
        }
        .ds-input--error {
          border-color: var(--ds-error) !important;
        }
        .ds-input-error {
          font-size: var(--ds-text-xs);
          color: var(--ds-error);
        }
        .ds-input-hint {
          font-size: var(--ds-text-xs);
          color: var(--ds-text-muted);
        }
      `}</style>
    </div>
  );
});

export default Input;
