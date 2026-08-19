import { useState, useCallback, useEffect } from 'react';
import defaultProfile from '../assets/profile.json';
import ResumeBuilderScreen1 from './ResumeBuilderScreen1.jsx';
import ResumeBuilderScreen2 from './ResumeBuilderScreen2.jsx';
import RateLimitModal from './RateLimitModal.jsx';
import AuthModal from './AuthModal.jsx';
import {
  onAuthChange,
  signOutUser,
  saveProfileToFirestore,
  getProfileFromFirestore,
} from '../utils/firebaseService.js';
import {
  analyzeJdWithGemini,
  generateTailoredResumeWithGemini,
  evaluateResumeWithGemini,
} from '../engine/geminiKeywordExtractor.js';
import { matchProfile } from '../engine/resumeMatcher.js';

export default function BuilderApp({ initialStep = 0 }) {
  const [currentStep, setCurrentStep] = useState(initialStep);
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
  const [jobDescription, setJobDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [generatedResume, setGeneratedResume] = useState(null);
  const [atsScore, setATSScore] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState('');
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState('Rate limit exceeded');

  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/preview') || path.includes('/result')) {
        const cachedJd = localStorage.getItem('app_jd');
        if (cachedJd) {
          setJobDescription(cachedJd);
          handleGenerateResume(cachedJd, profile);
        }
      }
    }
  }, []);

  const handleUpdateProfile = useCallback(async (updatedProfile) => {
    setProfile(updatedProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_profile', JSON.stringify(updatedProfile));
    }
    if (currentUser) {
      await saveProfileToFirestore(currentUser.uid, updatedProfile);
    }
  }, [currentUser]);

  const handleGenerateResume = useCallback(async (jdText = jobDescription, currentProf = profile) => {
    if (!jdText || jdText.trim().length < 10) return;

    if (typeof window !== 'undefined') {
      localStorage.setItem('app_jd', jdText);
    }

    setIsLoading(true);
    setError('');

    try {
      setLoadingStatus('✨ Extracting keywords & requirements with Gemini 3.6 Flash...');
      const geminiAnalysis = await analyzeJdWithGemini(jdText);
      const matchReport = matchProfile(geminiAnalysis.keywords, currentProf);

      setLoadingStatus('✨ Gemini 3.6 Flash is tailoring profile summary, experience & projects for higher ATS score...');
      const tailoredResume = await generateTailoredResumeWithGemini(jdText, currentProf, geminiAnalysis);

      setLoadingStatus('✨ Gemini 3.6 Flash is evaluating strict ATS match score & feedback...');
      const harshScore = await evaluateResumeWithGemini(jdText, tailoredResume);

      setAnalysisResult({
        roleTitle: geminiAnalysis.roleTitle,
        companyInfo: geminiAnalysis.companyInfo,
        exactRequirements: geminiAnalysis.exactRequirements,
        keywords: geminiAnalysis.keywords,
        matchReport
      });
      setGeneratedResume(tailoredResume);
      setATSScore(harshScore);
      setCurrentStep(1);

      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Gemini API Error:', err);
      const msg = err.message || '';
      if (
        msg.toLowerCase().includes('quota') ||
        msg.toLowerCase().includes('rate') ||
        msg.toLowerCase().includes('429') ||
        msg.toLowerCase().includes('limit') ||
        msg.toLowerCase().includes('resource_exhausted')
      ) {
        setRateLimitMessage('Rate limit exceeded. Please wait a few moments and try again.');
      } else {
        setRateLimitMessage('Rate limit exceeded');
      }
      setShowRateLimitModal(true);
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  }, [jobDescription, profile]);

  const handleBackToEdit = useCallback(() => {
    setCurrentStep(0);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="builder-app-wrapper">
      <header className="apple-nav">
        <div className="apple-nav-inner">
          <a href="/" className="apple-brand" title="Return to Landing Page">
            <span className="brand-arrow">←</span>
            <span>Resume Builder</span>
          </a>

          <div className="apple-nav-right">
            <a href="/profile" className="btn-edit-profile" title="View & Edit Candidate Profile Setup">
              ✏️ Edit Profile
            </a>

            {currentUser ? (
              <div className="user-auth-badge">
                <span className="user-name">{currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}</span>
                <button
                  type="button"
                  className="btn-auth-logout"
                  onClick={() => signOutUser()}
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
                🔐 Sync Account
              </button>
            )}

            <div className="apple-nav-steps">
              <span className={`step-badge ${currentStep === 0 ? 'active' : ''}`}>
                1. Job Description & Candidate Info
              </span>
              <span className="step-arrow">→</span>
              <span className={`step-badge ${currentStep === 1 ? 'active' : ''}`}>
                2. Preview & ATS Score
              </span>
            </div>

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

      <main className="builder-main">
        {currentStep === 0 ? (
          <ResumeBuilderScreen1
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            jobDescription={jobDescription}
            onJdChange={setJobDescription}
            onGenerate={() => handleGenerateResume(jobDescription, profile)}
            isLoading={isLoading}
            loadingStatus={loadingStatus}
            error={error}
          />
        ) : (
          <ResumeBuilderScreen2
            resume={generatedResume}
            atsScore={atsScore}
            jobDescription={jobDescription}
            profile={profile}
            matchReport={analysisResult?.matchReport}
            companyInfo={analysisResult?.companyInfo}
            exactRequirements={analysisResult?.exactRequirements}
            onBackToEdit={handleBackToEdit}
          />
        )}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={async (user) => {
          setCurrentUser(user);
          const savedProfile = await getProfileFromFirestore(user.uid);
          if (savedProfile) {
            setProfile(savedProfile);
            if (typeof window !== 'undefined') {
              localStorage.setItem('app_profile', JSON.stringify(savedProfile));
            }
          }
        }}
      />

      <RateLimitModal
        isOpen={showRateLimitModal}
        onClose={() => setShowRateLimitModal(false)}
        message={rateLimitMessage}
      />

      <style>{`
        .builder-app-wrapper {
          min-height: 100vh;
          background-color: var(--color-canvas-parchment);
        }

        .brand-arrow {
          margin-right: 6px;
          font-weight: 600;
        }

        .btn-edit-profile {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: var(--radius-pill);
          background: var(--color-surface-tile-2);
          border: 1px solid var(--color-hairline);
          color: var(--color-ink);
          font-size: 13px;
          text-decoration: none;
          transition: transform 0.15s ease, border-color 0.15s ease;
        }

        .btn-edit-profile:hover {
          border-color: var(--color-primary-on-dark);
          color: var(--color-primary-on-dark);
        }

        .btn-edit-profile:active {
          transform: scale(0.95);
        }

        .user-auth-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px;
          border-radius: var(--radius-pill);
          background: var(--color-surface-tile-2);
          border: 1px solid var(--color-hairline);
          font-size: 13px;
        }

        .user-email {
          font-weight: 400;
          color: var(--color-ink);
          max-width: 140px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .btn-auth-signin, .btn-auth-logout {
          background: none;
          border: 1px solid var(--color-hairline);
          color: var(--color-ink);
          padding: 5px 11px;
          border-radius: var(--radius-pill);
          font-size: 12px;
          font-weight: 400;
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

        .apple-nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-left: auto;
        }

        .btn-theme-toggle {
          margin-left: auto;
          flex-shrink: 0;
        }

        .apple-nav-steps {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--color-body-muted);
        }

        .step-badge {
          padding: 4px 12px;
          border-radius: var(--radius-pill);
          transition: all 0.2s ease;
        }

        .step-badge.active {
          background-color: rgba(0, 102, 204, 0.18);
          color: var(--color-primary-on-dark);
          font-weight: 600;
        }

        .step-arrow {
          font-size: 12px;
          color: var(--color-body-muted);
        }

        @media (max-width: 640px) {
          .apple-nav-steps {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
