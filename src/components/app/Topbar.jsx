import { useApp } from '../../context/AppContext.jsx';
import { Badge } from '../ui/Card.jsx';

export default function Topbar({ title = '', breadcrumbs = [] }) {
  const { user, credits, sidebarCollapsed, setSidebarCollapsed } = useApp();

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <header className="ds-topbar">
      {/* Mobile hamburger */}
      <button
        className="ds-topbar-hamburger"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        aria-label="Toggle menu"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="3" y1="5" x2="17" y2="5" />
          <line x1="3" y1="10" x2="17" y2="10" />
          <line x1="3" y1="15" x2="17" y2="15" />
        </svg>
      </button>

      {/* Breadcrumbs */}
      <div className="ds-topbar-left">
        {breadcrumbs.length > 0 ? (
          <nav className="ds-topbar-breadcrumbs">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="ds-topbar-crumb">
                {i > 0 && <span className="ds-topbar-crumb-sep">/</span>}
                {crumb.href ? (
                  <a href={crumb.href}>{crumb.label}</a>
                ) : (
                  <span className="ds-topbar-crumb-current">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : title ? (
          <h1 className="ds-topbar-title">{title}</h1>
        ) : null}
      </div>

      {/* Right side */}
      <div className="ds-topbar-right">
        <a href="/app/credits" className="ds-topbar-credits" title="Credits remaining">
          <span className="ds-topbar-credits-icon">✦</span>
          <span>{credits}</span>
        </a>

        <div className="ds-topbar-user" title={displayName}>
          <div className="ds-topbar-avatar">{initials}</div>
        </div>
      </div>

      <style>{`
        .ds-topbar {
          position: sticky;
          top: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          gap: var(--ds-space-4);
          height: var(--ds-topbar-height);
          padding: 0 var(--ds-space-6);
          background: var(--ds-bg);
          border-bottom: 1px solid var(--ds-border);
        }

        .ds-topbar-hamburger {
          display: none;
          background: none;
          border: none;
          color: var(--ds-text-secondary);
          cursor: pointer;
          padding: 4px;
        }

        .ds-topbar-left {
          flex: 1;
          min-width: 0;
        }
        .ds-topbar-title {
          font-size: var(--ds-text-lg);
          font-weight: 600;
          color: var(--ds-text-primary);
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ds-topbar-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 2px;
          font-size: var(--ds-text-sm);
        }
        .ds-topbar-crumb a {
          color: var(--ds-text-muted);
          text-decoration: none;
        }
        .ds-topbar-crumb a:hover {
          color: var(--ds-text-secondary);
        }
        .ds-topbar-crumb-sep {
          color: var(--ds-text-muted);
          margin: 0 6px;
          font-size: 12px;
        }
        .ds-topbar-crumb-current {
          color: var(--ds-text-primary);
          font-weight: 500;
        }

        .ds-topbar-right {
          display: flex;
          align-items: center;
          gap: var(--ds-space-3);
          flex-shrink: 0;
        }

        .ds-topbar-credits {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 12px;
          border-radius: var(--ds-radius-pill);
          background: var(--ds-surface);
          border: 1px solid var(--ds-border);
          color: var(--ds-text-secondary);
          font-size: var(--ds-text-sm);
          font-weight: 500;
          text-decoration: none;
          transition: all var(--ds-transition);
        }
        .ds-topbar-credits:hover {
          border-color: var(--ds-accent);
          color: var(--ds-accent-text);
        }
        .ds-topbar-credits-icon {
          color: var(--ds-accent);
        }

        .ds-topbar-user {
          display: flex;
          align-items: center;
          gap: var(--ds-space-2);
        }
        .ds-topbar-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--ds-accent-muted);
          color: var(--ds-accent-text);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--ds-text-sm);
          font-weight: 600;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .ds-topbar-hamburger {
            display: flex;
          }
        }
      `}</style>
    </header>
  );
}
