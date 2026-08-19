import { AppProvider, useApp } from '../../context/AppContext.jsx';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import ToastContainer from '../ui/Toast.jsx';
import AuthModal from '../AuthModal.jsx';
import { useState, useEffect } from 'react';

function AppShellInner({ children, activePath = '', title = '', breadcrumbs = [] }) {
  const { user, authLoading, sidebarCollapsed } = useApp();
  const [showAuth, setShowAuth] = useState(false);

  // Redirect to landing if not authenticated (after loading is done)
  useEffect(() => {
    if (!authLoading && !user) {
      // Show auth modal instead of redirecting
      setShowAuth(true);
    } else {
      setShowAuth(false);
    }
  }, [user, authLoading]);

  // Loading state
  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--ds-bg)',
        color: 'var(--ds-text-muted)',
        fontFamily: 'var(--ds-font)',
        fontSize: 'var(--ds-text-sm)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 32, height: 32,
            border: '2px solid var(--ds-border)',
            borderTopColor: 'var(--ds-accent)',
            borderRadius: '50%',
            animation: 'ds-spin 0.8s linear infinite',
            margin: '0 auto 12px',
          }} />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="ds-app-shell">
      <Sidebar activePath={activePath} />

      <div className={`ds-app-main ${sidebarCollapsed ? 'ds-app-main--expanded' : ''}`}>
        <Topbar title={title} breadcrumbs={breadcrumbs} />

        <main className="ds-app-content">
          {user ? children : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              color: 'var(--ds-text-muted)',
              fontSize: 'var(--ds-text-sm)',
            }}>
              Please sign in to access your career workspace.
            </div>
          )}
        </main>
      </div>

      <ToastContainer />

      <AuthModal
        isOpen={showAuth}
        onClose={() => {
          setShowAuth(false);
          // Redirect to landing if still not authed
          if (!user && typeof window !== 'undefined') {
            window.location.href = '/';
          }
        }}
        onSuccess={() => setShowAuth(false)}
      />

      <style>{`
        .ds-app-shell {
          display: flex;
          min-height: 100vh;
          background: var(--ds-bg);
        }
        .ds-app-main {
          flex: 1;
          margin-left: var(--ds-sidebar-width);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          transition: margin-left var(--ds-transition-slow);
        }
        .ds-app-main--expanded {
          margin-left: var(--ds-sidebar-collapsed);
        }
        .ds-app-content {
          flex: 1;
          padding: var(--ds-space-6) var(--ds-space-8);
          max-width: 1400px;
          width: 100%;
        }

        @media (max-width: 768px) {
          .ds-app-main,
          .ds-app-main--expanded {
            margin-left: 0;
          }
          .ds-app-content {
            padding: var(--ds-space-4);
          }
        }
      `}</style>
    </div>
  );
}

/** AppShell wraps children with AppProvider + Sidebar + Topbar + Toast */
export default function AppShell({ children, activePath = '', title = '', breadcrumbs = [] }) {
  return (
    <AppProvider>
      <AppShellInner
        activePath={activePath}
        title={title}
        breadcrumbs={breadcrumbs}
      >
        {children}
      </AppShellInner>
    </AppProvider>
  );
}
