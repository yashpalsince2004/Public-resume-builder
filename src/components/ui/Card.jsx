export function Card({ children, className = '', padding = true, hover = false, style = {}, ...props }) {
  return (
    <div
      className={`ds-card ${hover ? 'ds-card--hover' : ''} ${className}`}
      style={{
        background: 'var(--ds-surface)',
        border: '1px solid var(--ds-border)',
        borderRadius: 'var(--ds-radius-lg)',
        padding: padding ? 'var(--ds-space-6)' : '0',
        transition: 'border-color var(--ds-transition), transform var(--ds-transition)',
        ...style,
      }}
      {...props}
    >
      {children}
      <style>{`
        .ds-card--hover:hover {
          border-color: var(--ds-border-strong);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}

export function Badge({ children, variant = 'default', size = 'sm', style = {}, className = '' }) {
  const colors = {
    default: { bg: 'var(--ds-surface-secondary)', color: 'var(--ds-text-secondary)' },
    accent: { bg: 'var(--ds-accent-muted)', color: 'var(--ds-accent-text)' },
    success: { bg: 'var(--ds-success-muted)', color: 'var(--ds-success)' },
    warning: { bg: 'var(--ds-warning-muted)', color: 'var(--ds-warning)' },
    error: { bg: 'var(--ds-error-muted)', color: 'var(--ds-error)' },
    info: { bg: 'var(--ds-info-muted)', color: 'var(--ds-info)' },
  };
  const c = colors[variant] || colors.default;
  const sizes = { xs: '10px', sm: '11px', md: '12px' };

  return (
    <span
      className={`ds-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        fontSize: sizes[size] || sizes.sm,
        fontWeight: 500,
        borderRadius: 'var(--ds-radius-pill)',
        background: c.bg,
        color: c.color,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function Skeleton({ width = '100%', height = '20px', radius = 'var(--ds-radius-md)', className = '' }) {
  return (
    <div
      className={`ds-skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius: radius,
        background: 'var(--ds-surface-secondary)',
        animation: 'ds-pulse 1.5s ease-in-out infinite',
      }}
    />
  );
}

export function EmptyState({ icon, title, description, action, className = '' }) {
  return (
    <div
      className={`ds-empty ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--ds-space-16) var(--ds-space-8)',
        textAlign: 'center',
      }}
    >
      {icon && (
        <div style={{
          fontSize: '48px',
          marginBottom: 'var(--ds-space-4)',
          opacity: 0.4,
        }}>
          {icon}
        </div>
      )}
      {title && (
        <h3 style={{
          fontSize: 'var(--ds-text-lg)',
          fontWeight: 600,
          color: 'var(--ds-text-primary)',
          marginBottom: 'var(--ds-space-2)',
        }}>
          {title}
        </h3>
      )}
      {description && (
        <p style={{
          fontSize: 'var(--ds-text-sm)',
          color: 'var(--ds-text-muted)',
          maxWidth: '360px',
          marginBottom: action ? 'var(--ds-space-6)' : '0',
        }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

export function Tabs({ tabs, active, onChange, className = '' }) {
  return (
    <div
      className={`ds-tabs ${className}`}
      role="tablist"
      style={{
        display: 'flex',
        gap: '2px',
        background: 'var(--ds-surface)',
        border: '1px solid var(--ds-border)',
        borderRadius: 'var(--ds-radius-md)',
        padding: '3px',
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            flex: 1,
            padding: '6px 12px',
            fontSize: 'var(--ds-text-sm)',
            fontWeight: active === tab.id ? 600 : 400,
            fontFamily: 'var(--ds-font)',
            color: active === tab.id ? 'var(--ds-text-primary)' : 'var(--ds-text-muted)',
            background: active === tab.id ? 'var(--ds-surface-elevated)' : 'transparent',
            border: 'none',
            borderRadius: 'var(--ds-radius-sm)',
            cursor: 'pointer',
            transition: 'all var(--ds-transition)',
            whiteSpace: 'nowrap',
          }}
        >
          {tab.icon && <span style={{ marginRight: '6px' }}>{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && (
            <span style={{
              marginLeft: '6px',
              fontSize: '10px',
              padding: '1px 5px',
              borderRadius: 'var(--ds-radius-pill)',
              background: active === tab.id ? 'var(--ds-accent-muted)' : 'var(--ds-surface-secondary)',
              color: active === tab.id ? 'var(--ds-accent-text)' : 'var(--ds-text-muted)',
            }}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function ScoreRing({ score = 0, size = 100, strokeWidth = 6, label, className = '' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 85) return 'var(--ds-success)';
    if (s >= 70) return '#22d3ee';
    if (s >= 50) return 'var(--ds-warning)';
    return 'var(--ds-error)';
  };

  return (
    <div className={`ds-score-ring ${className}`} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--ds-surface-secondary)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--ds-text-primary)"
          fontSize={size * 0.28}
          fontWeight="700"
          fontFamily="var(--ds-font)"
        >
          {score}
        </text>
      </svg>
      {label && (
        <span style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-muted)', fontWeight: 500 }}>
          {label}
        </span>
      )}
    </div>
  );
}

export function ProgressBar({ value = 0, max = 100, height = 6, color, label, className = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = color || (pct >= 70 ? 'var(--ds-success)' : pct >= 40 ? 'var(--ds-warning)' : 'var(--ds-error)');

  return (
    <div className={`ds-progress ${className}`}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-secondary)' }}>{label}</span>
          <span style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-muted)', fontWeight: 600 }}>{Math.round(pct)}%</span>
        </div>
      )}
      <div style={{
        width: '100%',
        height: `${height}px`,
        background: 'var(--ds-surface-secondary)',
        borderRadius: `${height / 2}px`,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: barColor,
          borderRadius: `${height / 2}px`,
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );
}
