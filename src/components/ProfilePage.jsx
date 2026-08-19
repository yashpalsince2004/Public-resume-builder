import { useState, useCallback, useEffect } from 'react';
import defaultProfile from '../assets/profile.json';
import ProfileForm from './ProfileForm.jsx';
import AuthModal from './AuthModal.jsx';
import {
  onAuthChange,
  signOutUser,
  saveProfileToFirestore,
  getProfileFromFirestore,
} from '../utils/firebaseService.js';
import { auth } from '../lib/firebase.js';

export default function ProfilePage() {
  const [profile, setProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('app_profile');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // fallback
        }
      }
    }
    return defaultProfile;
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [pendingProfileToSave, setPendingProfileToSave] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user);
      if (user) {
        const savedProfile = await getProfileFromFirestore(user.uid);
        if (savedProfile) {
          setProfile(savedProfile);
          if (typeof window !== 'undefined') {
            localStorage.setItem('app_profile', JSON.stringify(savedProfile));
          }
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

  const handleSaveProfile = async (updatedProfile) => {
    setProfile(updatedProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_profile', JSON.stringify(updatedProfile));
    }

    const activeUser = currentUser || auth?.currentUser;

    if (activeUser) {
      setSaveStatus('✨ Candidate profile saved! Syncing with Firebase Cloud & redirecting to Dashboard...');
      saveProfileToFirestore(activeUser.uid, updatedProfile).catch(err => {
        console.warn('Background Firebase sync warning:', err);
      });
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/onboarding';
        }
      }, 500);
    } else {
      setPendingProfileToSave(updatedProfile);
      setSaveStatus('☁️ Please sign in to save your profile in JSON format to Firebase Cloud.');
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="profile-page-wrapper">
      <header className="apple-nav">
        <div className="apple-nav-inner">
          <a href="/" className="apple-brand" title="Back to Home">
            <span className="brand-arrow">←</span>
            <span>Resume Builder</span>
          </a>

          <div className="apple-nav-right">
            {currentUser ? (
              <div className="user-auth-badge">
                <span className="user-name">{currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}</span>
                <button
                  type="button"
                  className="btn-auth-logout"
                  onClick={() => signOutUser()}
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
                🔐 Sync Account
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
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
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
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="profile-main">
        <div className="profile-hero">
          <div className="step-pill">Step 1 of 2: Candidate Profile Setup</div>
          <h1 className="hero-display">Candidate Profile Setup</h1>
          <p className="hero-subtitle">
            Enter your personal information, work experience, education, skills, and key project metrics.
            Your profile is stored locally and synced to Firebase Cloud ☁️ so you never have to re-enter data.
          </p>
        </div>

        {saveStatus && <div className="save-status-banner">{saveStatus}</div>}

        <div className="profile-card-container">
          <ProfileForm
            initialProfile={profile}
            onSubmit={handleSaveProfile}
          />
        </div>
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={async (user) => {
          setCurrentUser(user);
          const profileToSave = pendingProfileToSave || profile;
          if (profileToSave) {
            setSaveStatus('☁️ Saving profile in JSON format to Firebase Cloud...');
            const res = await saveProfileToFirestore(user.uid, profileToSave);
            if (res && res.success) {
              setSaveStatus('✨ Profile saved in JSON format to Firebase! Redirecting to Dashboard...');
              setTimeout(() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/onboarding';
                }
              }, 800);
            } else {
              setSaveStatus(`⚠️ Firebase Firestore Error: ${res?.error || 'Failed to save'}. Check Firestore Rules in Firebase Console.`);
            }
          } else {
            const savedProfile = await getProfileFromFirestore(user.uid);
            if (savedProfile) {
              setProfile(savedProfile);
              if (typeof window !== 'undefined') {
                localStorage.setItem('app_profile', JSON.stringify(savedProfile));
              }
            }
          }
        }}
      />

      <style>{`
        .profile-page-wrapper {
          min-height: 100vh;
          background-color: var(--color-canvas-parchment);
          color: var(--color-ink);
        }

        .brand-arrow {
          margin-right: 6px;
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

        .user-email {
          font-weight: 400;
          color: var(--color-ink);
          max-width: 150px;
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
          cursor: pointer;
          transition: transform 0.15s ease;
        }

        .btn-auth-signin:hover, .btn-auth-logout:hover {
          border-color: var(--color-primary-on-dark);
          color: var(--color-primary-on-dark);
        }

        .btn-auth-signin:active, .btn-auth-logout:active {
          transform: scale(0.95);
        }

        .profile-main {
          max-width: 1000px;
          margin: 0 auto;
          padding: 40px 24px 80px;
        }

        .profile-hero {
          text-align: center;
          margin-bottom: 32px;
        }

        .step-pill {
          display: inline-block;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: var(--radius-pill);
          background: rgba(0, 102, 204, 0.15);
          color: var(--color-primary-on-dark);
          margin-bottom: 16px;
        }

        .hero-display {
          font-size: 40px;
          line-height: 1.1;
          letter-spacing: -0.374px;
          color: var(--color-ink);
          margin-bottom: 12px;
        }

        .hero-subtitle {
          max-width: 720px;
          margin: 0 auto;
          font-size: 17px;
          line-height: 1.47;
          letter-spacing: -0.374px;
          color: var(--color-body-muted);
        }

        .save-status-banner {
          background: rgba(0, 102, 204, 0.15);
          color: var(--color-primary-on-dark);
          padding: 12px 18px;
          border-radius: var(--radius-sm);
          font-size: 15px;
          text-align: center;
          margin-bottom: 24px;
        }

        .profile-card-container {
          background-color: transparent;
          border: none;
          padding: 0;
        }
      `}</style>
    </div>
  );
}
