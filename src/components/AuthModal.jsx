import { useState } from 'react';
import { signInWithGooglePopup } from '../utils/firebaseService.js';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  if (!isOpen) return null;

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithGooglePopup();
      onSuccess(userCredential.user);
      onClose();
    } catch (err) {
      console.error('Google auth error:', err);
      let msg = err?.message || 'Google sign-in failed.';
      const code = err?.code || '';
      
      if (
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/cancelled-popup-request' ||
        msg.includes('popup-closed-by-user') ||
        msg.includes('Database is closing') ||
        msg.includes('closing/hidden')
      ) {
        msg = 'Sign-in popup was closed before completion. Please click again to sign in.';
      } else if (code === 'auth/popup-blocked' || msg.includes('popup-blocked')) {
        msg = 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
      } else if (code === 'auth/unauthorized-domain') {
        msg = 'This domain is not authorized in Firebase Console.';
      } else {
        msg = msg.replace(/^Firebase:\s*/i, '').replace(/\s*\(auth\/.*\)\.?$/i, '');
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="apple-modal-overlay">
      <div className="apple-modal-content auth-modal-box animate-fade-in">
        <div className="modal-header">
          <h2 className="modal-title">Resume Builder</h2>
        </div>

        <p className="auth-subtitle">
          Sign in to tailor your resume to any job.
        </p>

        {error && <div className="auth-error-banner">{error}</div>}

        <button
          type="button"
          className="btn-google-auth"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg className="google-icon" viewBox="0 0 24 24" width="18" height="18">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
        </button>

        <p className="auth-terms-notice">
          By continuing you agree to our Terms and Privacy Policy.
        </p>
      </div>

      <style>{`
        .auth-modal-box {
          max-width: 440px !important;
          padding: 32px;
          text-align: center;
        }

        .modal-header {
          display: flex;
          justify-content: center;
          margin-bottom: 6px;
        }

        .modal-title {
          font-size: 24px;
          font-weight: 600;
          letter-spacing: -0.374px;
          color: var(--color-ink);
          text-align: center;
        }

        .auth-subtitle {
          font-size: 14px;
          color: var(--color-body-muted);
          margin-bottom: 24px;
          line-height: 1.43;
          text-align: center;
        }

        .auth-error-banner {
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          margin-bottom: 16px;
        }

        .btn-google-auth {
          width: 100%;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: var(--color-surface-tile-2);
          border: 1px solid var(--color-hairline);
          border-radius: 9999px;
          color: var(--color-ink);
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: transform 0.15s ease, border-color 0.15s ease;
        }

        .btn-google-auth:hover {
          border-color: var(--color-primary);
        }

        .btn-google-auth:active {
          transform: scale(0.98);
        }

        .btn-google-auth:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .auth-terms-notice {
          margin-top: 20px;
          font-size: 11px;
          color: var(--color-body-muted);
          text-align: center;
          line-height: 1.4;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
}
