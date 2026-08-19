import { useApp } from '../../context/AppContext.jsx';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/app/dashboard', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  )},
  { id: 'master-resume', label: 'Master Resume', path: '/app/master-resume', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
  )},
  { id: 'job-scan', label: 'Job Scan', path: '/app/job-scan', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><path d="M11 8v6M8 11h6"/></svg>
  )},
  { id: 'cover-letters', label: 'Cover Letters', path: '/app/cover-letters', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
  )},
  { id: 'linkedin', label: 'LinkedIn', path: '/app/linkedin', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
  )},
];

const BOTTOM_ITEMS = [
  { id: 'profile', label: 'Profile', path: '/app/profile', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )},
  { id: 'plans-credits', label: 'Plans & credits', path: '/app/credits', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
  )},
  { id: 'help', label: 'Help & feedback', path: '/app/help', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  )},
];

export default function Sidebar({ activePath = '' }) {
  const { sidebarCollapsed, setSidebarCollapsed, handleSignOut, user, profile } = useApp();

  const username = (user?.displayName || profile?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User').toUpperCase();

  const isActive = (path) => {
    if (!activePath) return false;
    return activePath === path || activePath.startsWith(path + '/');
  };

  return (
    <>
      <aside className={`ds-sidebar ${sidebarCollapsed ? 'ds-sidebar--collapsed' : ''}`}>
        {/* Brand Header */}
        <div className="ds-sidebar-header">
          <a href="/app/dashboard" className="ds-sidebar-logo">
            <div className="ds-sidebar-logo-icon">R</div>
            {!sidebarCollapsed && <span className="ds-sidebar-logo-text">ResumeBuilder</span>}
          </a>
          <button
            className="ds-sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '›' : '‹'}
          </button>
        </div>

        {/* Prominent CTA Button */}
        <div className="ds-sidebar-cta-wrap">
          <a href="/app/tailor" className="ds-sidebar-cta-btn">
            <span className="ds-cta-icon">🪄</span>
            {!sidebarCollapsed && <span>Tailor a job</span>}
          </a>
        </div>

        {/* Main Navigation */}
        <nav className="ds-sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.path}
              className={`ds-sidebar-item ${isActive(item.path) ? 'ds-sidebar-item--active' : ''}`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="ds-sidebar-item-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="ds-sidebar-item-label">{item.label}</span>}
            </a>
          ))}
        </nav>

        {/* Divider */}
        <div className="ds-sidebar-divider" />

        {/* Bottom Navigation */}
        <nav className="ds-sidebar-bottom">
          {BOTTOM_ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.path}
              className={`ds-sidebar-item ${isActive(item.path) ? 'ds-sidebar-item--active' : ''}`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <span className="ds-sidebar-item-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="ds-sidebar-item-label">{item.label}</span>}
            </a>
          ))}

          {/* Sign Out */}
          <button
            className="ds-sidebar-item ds-sidebar-item--signout"
            onClick={handleSignOut}
            title={sidebarCollapsed ? 'Sign out' : undefined}
          >
            <span className="ds-sidebar-item-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </span>
            {!sidebarCollapsed && <span className="ds-sidebar-item-label">Sign out</span>}
          </button>
        </nav>

        {/* Bottom Small Username */}
        {!sidebarCollapsed && (
          <div className="ds-sidebar-user-footer">
            {username}
          </div>
        )}
      </aside>

      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div
          className="ds-sidebar-mobile-overlay"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <style>{`
        .ds-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: var(--ds-sidebar-width);
          background: var(--ds-sidebar-bg);
          border-right: 1px solid var(--ds-border);
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: width var(--ds-transition-slow);
          overflow-x: hidden;
        }
        .ds-sidebar--collapsed {
          width: var(--ds-sidebar-collapsed);
        }

        .ds-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 20px 12px 20px;
          flex-shrink: 0;
        }
        .ds-sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--ds-text-primary);
          font-weight: 700;
          font-size: 18px;
          white-space: nowrap;
          overflow: hidden;
          letter-spacing: -0.3px;
        }
        .ds-sidebar-logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: #111420;
          border: 1px solid var(--ds-border-strong);
          color: #ffffff;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 800;
          flex-shrink: 0;
        }
        .ds-sidebar-toggle {
          background: none;
          border: none;
          color: var(--ds-text-muted);
          cursor: pointer;
          padding: 4px 8px;
          font-size: 20px;
          flex-shrink: 0;
          border-radius: 6px;
          transition: color var(--ds-transition);
        }
        .ds-sidebar-toggle:hover {
          color: var(--ds-text-primary);
        }

        .ds-sidebar-cta-wrap {
          padding: 8px 16px 16px 16px;
          flex-shrink: 0;
        }
        .ds-sidebar-cta-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px 18px;
          background: #3b82f6;
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          border-radius: var(--ds-radius-pill);
          text-decoration: none;
          transition: background 0.15s ease, transform 0.15s ease;
          white-space: nowrap;
        }
        .ds-sidebar-cta-btn:hover {
          background: #2563eb;
        }
        .ds-sidebar-cta-btn:active {
          transform: scale(0.98);
        }
        .ds-cta-icon {
          font-size: 16px;
        }

        .ds-sidebar-nav {
          flex: 1;
          padding: 0 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
        }
        .ds-sidebar-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: var(--ds-radius-md);
          color: var(--ds-text-secondary);
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: all var(--ds-transition);
          white-space: nowrap;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          font-family: var(--ds-font);
        }
        .ds-sidebar-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--ds-text-primary);
        }
        .ds-sidebar-item--active {
          background: #1e2640 !important;
          color: #60a5fa !important;
          font-weight: 600;
        }
        .ds-sidebar-item-icon {
          width: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ds-sidebar-divider {
          height: 1px;
          background: var(--ds-border);
          margin: 12px 16px;
          flex-shrink: 0;
        }

        .ds-sidebar-bottom {
          padding: 0 12px 12px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex-shrink: 0;
        }

        .ds-sidebar-user-footer {
          padding: 12px 20px 20px 20px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.5px;
          color: var(--ds-text-muted);
          text-transform: uppercase;
        }

        /* Collapsed */
        .ds-sidebar--collapsed .ds-sidebar-cta-wrap {
          padding: 8px 12px 16px 12px;
        }
        .ds-sidebar--collapsed .ds-sidebar-cta-btn {
          padding: 10px;
          border-radius: 50%;
        }
        .ds-sidebar--collapsed .ds-sidebar-item {
          justify-content: center;
          padding: 10px;
        }

        /* Mobile */
        .ds-sidebar-mobile-overlay {
          display: none;
        }
        @media (max-width: 768px) {
          .ds-sidebar {
            transform: translateX(-100%);
            z-index: 200;
            width: var(--ds-sidebar-width) !important;
          }
          .ds-sidebar:not(.ds-sidebar--collapsed) {
            transform: translateX(0);
          }
          .ds-sidebar--collapsed {
            transform: translateX(-100%);
          }
          .ds-sidebar-mobile-overlay {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 199;
            background: rgba(0, 0, 0, 0.6);
          }
        }
      `}</style>
    </>
  );
}
