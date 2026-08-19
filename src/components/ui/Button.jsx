import { forwardRef } from 'react';

const VARIANTS = {
  primary: {
    background: 'var(--ds-accent)',
    color: '#fff',
    border: 'none',
    hoverBg: 'var(--ds-accent-hover)',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--ds-text-primary)',
    border: '1px solid var(--ds-border-strong)',
    hoverBg: 'var(--ds-surface-secondary)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--ds-text-secondary)',
    border: 'none',
    hoverBg: 'var(--ds-surface-secondary)',
  },
  danger: {
    background: 'var(--ds-error)',
    color: '#fff',
    border: 'none',
    hoverBg: '#dc2626',
  },
  success: {
    background: 'var(--ds-success)',
    color: '#fff',
    border: 'none',
    hoverBg: '#16a34a',
  },
};

const SIZES = {
  sm: { padding: '6px 12px', fontSize: 'var(--ds-text-xs)', height: '32px' },
  md: { padding: '8px 16px', fontSize: 'var(--ds-text-sm)', height: '36px' },
  lg: { padding: '10px 20px', fontSize: 'var(--ds-text-base)', height: '40px' },
};

const Button = forwardRef(function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  fullWidth = false,
  loading = false,
  disabled = false,
  style = {},
  className = '',
  ...props
}, ref) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: s.padding,
    height: s.height,
    fontSize: s.fontSize,
    fontFamily: 'var(--ds-font)',
    fontWeight: 500,
    lineHeight: 1,
    borderRadius: 'var(--ds-radius-md)',
    background: v.background,
    color: v.color,
    border: v.border,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all var(--ds-transition)',
    width: fullWidth ? '100%' : 'auto',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    ...style,
  };

  return (
    <button
      ref={ref}
      className={`ds-btn ${className}`}
      style={baseStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="ds-spinner" />}
      {!loading && icon && <span className="ds-btn-icon">{icon}</span>}
      {children}
      {iconRight && <span className="ds-btn-icon">{iconRight}</span>}

      <style>{`
        .ds-btn:hover:not(:disabled) {
          background: ${v.hoverBg} !important;
          transform: translateY(-1px);
        }
        .ds-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.98);
        }
        .ds-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: currentColor;
          border-radius: 50%;
          animation: ds-spin 0.6s linear infinite;
        }
      `}</style>
    </button>
  );
});

export default Button;
