import { useState, useCallback, useEffect } from 'react';
import AuthModal from './AuthModal.jsx';
import {
  onAuthChange,
  signOutUser,
  getProfileFromFirestore,
} from '../utils/firebaseService.js';

export default function LandingPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user);
      if (user && typeof window !== 'undefined') {
        const savedProfile = await getProfileFromFirestore(user.uid);
        if (savedProfile) {
          localStorage.setItem('app_profile', JSON.stringify(savedProfile));
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const getSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  };

  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('app_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
      return getSystemTheme();
    }
    return 'dark';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('app_theme', nextTheme);
      }
      return nextTheme;
    });
  }, []);

  // Central CTA handler: If logged in -> go to /onboarding; else open AuthModal
  const handleStartApplication = () => {
    if (currentUser) {
      if (typeof window !== 'undefined') {
        window.location.href = '/onboarding';
      }
      return;
    }
    setIsAuthModalOpen(true);
  };

  // Once sign-in completes in AuthModal, directly redirect to /onboarding
  const handleAuthSuccess = async (user) => {
    setCurrentUser(user);
    if (user && typeof window !== 'undefined') {
      const savedProfile = await getProfileFromFirestore(user.uid);
      if (savedProfile) {
        localStorage.setItem('app_profile', JSON.stringify(savedProfile));
      }
      window.location.href = '/onboarding';
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
  };

  return (
    <div className="landing-wrapper">
      {/* Top Apple Navigation Bar */}
      <header className="apple-nav">
        <div className="apple-nav-inner">
          <a href="/" className="apple-brand">
            <span className="brand-logo-icon">📄</span>
            <span>Resume Builder</span>
            <span className="public-build-tag">Public Build v1.0</span>
          </a>

          <div className="apple-nav-right">
            {currentUser ? (
              <div className="user-auth-badge">
                <span className="user-name">{currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}</span>
                <button
                  type="button"
                  className="btn-auth-logout"
                  onClick={handleSignOut}
                  title="Sign Out"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn-auth-signin"
                onClick={() => setIsAuthModalOpen(true)}
              >
                🔐 Sign In / Sync
              </button>
            )}

            <button
              type="button"
              className="btn-theme-toggle"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Headline & Central Action Button */}
      <main className="landing-main">
        <section className="hero-section-centered">
          <h1 className="hero-display-large">
            Craft Resumes That <br /> Win Top Interviews.
          </h1>

          <p className="hero-subtitle-centered">
           Build your ATS-optimized candidate profile step by step with automatic cloud persistence and instant AI-powered resume tailoring, all powered by MITRA.
          </p>

          <div className="hero-action-centered">
            <button
              type="button"
              className="btn-apple-primary btn-hero-central"
              onClick={handleStartApplication}
            >
              Start Application
            </button>
          </div>
        </section>

        {/* Feature Grid Highlights */}
        <section className="features-section">
          <h2 className="section-title">Built for High Conversion & Data Persistence</h2>
          <div className="features-grid">
            <div className="feature-tile">
              <div className="feature-icon">🎯</div>
              <h3>Strict ATS Score Engine</h3>
              <p>Evaluates keyword density, metrics, and role alignment against target Job Descriptions.</p>
            </div>

            <div className="feature-tile">
              <div className="feature-icon">☁️</div>
              <h3>Firebase Cloud Sync</h3>
              <p>Sign in to save your candidate profile JSON. Never re-enter your data for future job applications.</p>
            </div>

            <div className="feature-tile">
              <div className="feature-icon">⚡</div>
              <h3>Gemini 3.6 Flash Tailoring</h3>
              <p>Instant resume tailoring, summary polishing, and action-verb metric enhancements.</p>
            </div>

            <div className="feature-tile">
              <div className="feature-icon">📥</div>
              <h3>Multi-Format Export</h3>
              <p>Download ATS-friendly PDF, Microsoft Word (.docx), or professional RenderCV LaTeX code.</p>
            </div>
          </div>
        </section>
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <style>{`
        .landing-wrapper {
          min-height: 100vh;
          background-color: var(--color-canvas-parchment);
          color: var(--color-ink);
          display: flex;
          flex-direction: column;
        }

        .brand-logo-icon {
          font-size: 20px;
          margin-right: 6px;
        }

        .public-build-tag {
          font-size: 12px;
          font-weight: 400;
          letter-spacing: -0.12px;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
          background: rgba(0, 102, 204, 0.12);
          color: var(--color-primary-on-dark);
          margin-left: 8px;
        }

        .user-auth-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px;
          border-radius: var(--radius-pill);
          background: var(--color-surface-tile-2);
          border: 1px solid var(--color-hairline);
          font-size: 14px;
        }

        .user-name {
          font-weight: 500;
          letter-spacing: -0.224px;
          color: var(--color-ink);
          max-width: 160px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .btn-auth-signin, .btn-auth-logout {
          background: none;
          border: 1px solid var(--color-hairline);
          color: var(--color-ink);
          padding: 6px 14px;
          border-radius: var(--radius-pill);
          font-size: 14px;
          font-weight: 400;
          letter-spacing: -0.224px;
          cursor: pointer;
          transition: transform 0.15s ease, border-color 0.15s ease;
        }

        .btn-auth-signin:hover, .btn-auth-logout:hover {
          border-color: var(--color-primary-on-dark);
          color: var(--color-primary-on-dark);
        }

        .btn-auth-signin:active, .btn-auth-logout:active {
          transform: scale(0.95);
        }

        .landing-main {
          max-width: 1100px;
          margin: 0 auto;
          padding: 80px 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
        }

        .hero-section-centered {
          text-align: center;
          margin-bottom: 96px;
          max-width: 840px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          border-radius: var(--radius-pill);
          background: var(--color-surface-tile-2);
          border: 1px solid var(--color-hairline);
          font-size: 14px;
          font-weight: 400;
          color: var(--color-body-muted);
          margin-bottom: 28px;
        }

        .sparkle-icon {
          color: #f59e0b;
        }

        .hero-display-large {
          font-size: 56px;
          font-weight: 700;
          line-height: 1.07;
          letter-spacing: -0.015em;
          color: var(--color-ink);
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .hero-display-large {
            font-size: 40px;
          }
        }

        .hero-subtitle-centered {
          font-size: 21px;
          line-height: 1.43;
          letter-spacing: -0.374px;
          color: var(--color-body-muted);
          font-weight: 400;
          margin: 0 auto 36px;
          max-width: 680px;
        }

        .hero-action-centered {
          display: flex;
          justify-content: center;
        }

        .btn-hero-central {
          padding: 16px 40px;
          font-size: 20px;
          font-weight: 500;
          letter-spacing: -0.374px;
          border-radius: var(--radius-pill);
          box-shadow: 0 4px 20px rgba(0, 102, 204, 0.3);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .btn-hero-central:active {
          transform: scale(0.95);
        }

        .features-section {
          width: 100%;
          text-align: center;
        }

        .section-title {
          font-size: 32px;
          font-weight: 600;
          letter-spacing: -0.374px;
          margin-bottom: 36px;
          color: var(--color-ink);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        @media (max-width: 900px) {
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 500px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
        }

        .feature-tile {
          background: var(--color-surface-tile-1);
          border: 1px solid var(--color-hairline);
          border-radius: var(--radius-lg);
          padding: 28px 24px;
          text-align: left;
          box-shadow: none;
        }

        .feature-icon {
          font-size: 28px;
          margin-bottom: 14px;
        }

        .feature-tile h3 {
          font-size: 19px;
          font-weight: 600;
          letter-spacing: -0.28px;
          margin-bottom: 8px;
          color: var(--color-ink);
        }

        .feature-tile p {
          font-size: 14px;
          color: var(--color-body-muted);
          line-height: 1.43;
        }
      `}</style>
    </div>
  );
}
