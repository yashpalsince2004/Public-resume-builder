import { useState, useEffect } from 'react';
import defaultProfile from '../assets/profile.json';
import ProfileForm from './ProfileForm.jsx';
import BuilderApp from './BuilderApp.jsx';
import JobDescriptionInput from './JobDescriptionInput.jsx';
import ATSScorePanel from './ATSScorePanel.jsx';
import AuthModal from './AuthModal.jsx';
import {
  onAuthChange,
  signOutUser,
  getProfileFromFirestore,
  saveProfileToFirestore,
} from '../utils/firebaseService.js';
import { auth } from '../lib/firebase.js';

export default function OnboardingDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showExtensionBanner, setShowExtensionBanner] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  // Profile State
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

  // Job Description & ATS State
  const [jobDescription, setJobDescription] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('app_jd') || '';
    }
    return '';
  });

  const [coverLetterText, setCoverLetterText] = useState('');
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);

  // Enforce Dark Mode Theme for this component view
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('app_theme', 'dark');
    }
  }, []);

  // Firebase Auth Listener & Cloud Sync
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

  const handleSaveProfile = async (updatedProfile) => {
    setProfile(updatedProfile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_profile', JSON.stringify(updatedProfile));
    }

    const activeUser = currentUser || auth?.currentUser;
    if (activeUser) {
      setStatusMessage('✨ Syncing profile with Cloud...');
      saveProfileToFirestore(activeUser.uid, updatedProfile)
        .then(() => setStatusMessage('✨ Master profile saved to Cloud!'))
        .catch(() => setStatusMessage('⚠️ Saved locally. Cloud sync offline.'));
    } else {
      setStatusMessage('✨ Master profile updated locally.');
    }
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const handleGenerateCoverLetter = () => {
    setIsGeneratingCoverLetter(true);
    setTimeout(() => {
      const name = profile?.name || 'Applicant';
      const title = profile?.title || 'Software Engineer';
      const company = 'Target Company';

      const generated = `Dear Hiring Manager at ${company},\n\nI am writing to express my strong enthusiasm for the ${title} position. With a solid background in building scalable applications and optimizing user experiences, I am confident in my ability to deliver immediate value to your engineering team.\n\nIn my previous roles, I have consistently demonstrated a commitment to clean architecture, high-performance execution, and data-driven results. My expertise in candidate profile optimization and full-stack software development aligns directly with your team's mission.\n\nThank you for considering my application. I look forward to discussing how my technical skills and achievements make me a strong fit for your team.\n\nSincerely,\n${name}`;

      setCoverLetterText(generated);
      setIsGeneratingCoverLetter(false);
    }, 1200);
  };

  // User Display Name (e.g. YASH)
  const getUserFirstName = () => {
    if (profile?.name) {
      return profile.name.split(' ')[0].toUpperCase();
    }
    if (currentUser?.displayName) {
      return currentUser.displayName.split(' ')[0].toUpperCase();
    }
    if (currentUser?.email) {
      return currentUser.email.split('@')[0].toUpperCase();
    }
    return 'YASH';
  };

  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'master', label: 'Master Resume', icon: '📄' },
    { id: 'scan', label: 'Job Scan', icon: '🎯' },
    { id: 'cover_letter', label: 'Cover Letters', icon: '✉️' },
    { id: 'linkedin', label: 'LinkedIn', icon: '🔗' },
  ];

  const secondaryNavItems = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'plans', label: 'Plans & credits', icon: '💳' },
    { id: 'help', label: 'Help & feedback', icon: '❓' },
  ];

  return (
    <div className="dark-app-container">
      {/* Mobile Bar */}
      <div className="mobile-header-bar">
        <button
          type="button"
          className="mobile-toggle-btn"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        >
          ☰
        </button>
        <span className="mobile-logo-title">ResumeBuilder</span>
        <div className="credits-badge-sm">✦ 10 credits</div>
      </div>

      {/* Overlay for mobile drawer */}
      {isMobileSidebarOpen && (
        <div
          className="drawer-backdrop"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar Navigation */}
      <aside
        className={`sidebar-drawer ${isSidebarCollapsed ? 'collapsed' : ''} ${
          isMobileSidebarOpen ? 'mobile-open' : ''
        }`}
      >
        {/* Sidebar Header Brand */}
        <div className="sidebar-brand-row">
          <div className="brand-badge-box">
            <span className="brand-avatar-box">H</span>
            {!isSidebarCollapsed && (
              <span className="brand-logo-text">ResumeBuilder</span>
            )}
          </div>
          <button
            type="button"
            className="btn-collapse-toggle"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isSidebarCollapsed ? '›' : '‹'}
          </button>
        </div>

        {/* Primary CTA Button: Tailor a job */}
        <div className="sidebar-cta-wrap">
          <button
            type="button"
            className="btn-tailor-job-primary"
            onClick={() => {
              setActiveTab('scan');
              setIsMobileSidebarOpen(false);
            }}
          >
            <span className="sparkle-svg">🪄</span>
            {!isSidebarCollapsed && <span>Tailor a job</span>}
          </button>
        </div>

        {/* Navigation Menu Links */}
        <nav className="sidebar-menu">
          {mainNavItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`menu-item-link ${
                activeTab === item.id ? 'active' : ''
              }`}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileSidebarOpen(false);
              }}
              title={item.label}
            >
              <span className="menu-item-icon">{item.icon}</span>
              {!isSidebarCollapsed && (
                <span className="menu-item-text">{item.label}</span>
              )}
            </button>
          ))}

          <div className="menu-divider" />

          {secondaryNavItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`menu-item-link ${
                activeTab === item.id ? 'active' : ''
              }`}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileSidebarOpen(false);
              }}
              title={item.label}
            >
              <span className="menu-item-icon">{item.icon}</span>
              {!isSidebarCollapsed && (
                <span className="menu-item-text">{item.label}</span>
              )}
            </button>
          ))}

          <button
            type="button"
            className="menu-item-link"
            onClick={handleSignOut}
            title="Sign out"
          >
            <span className="menu-item-icon">🚪</span>
            {!isSidebarCollapsed && (
              <span className="menu-item-text">Sign out</span>
            )}
          </button>
        </nav>

        {/* Sidebar Footer User Name */}
        {!isSidebarCollapsed && (
          <div className="sidebar-footer-user">
            <span className="user-footer-name">{getUserFirstName()}</span>
          </div>
        )}
      </aside>

      {/* Main Workspace Area */}
      <main className="main-workspace-area">
        {/* Top Header Bar */}
        <header className="workspace-top-bar">
          <div className="top-bar-left">
            {statusMessage && (
              <div className="top-status-toast">{statusMessage}</div>
            )}
          </div>

          <div className="top-bar-right">
            <div className="credits-pill-badge">✦ 10 credits</div>
            <div className="user-avatar-circle">
              {getUserFirstName().charAt(0)}
            </div>
          </div>
        </header>

        {/* Dynamic Views */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-content-wrapper fade-in">
            {/* Greeting Header & Add Resume Button */}
            <div className="dashboard-hero-header">
              <div className="hero-text-col">
                <h1 className="dash-heading">Welcome, {getUserFirstName()}</h1>
                <p className="dash-subheading">
                  Tailor your master resume to any job in seconds — and watch
                  your ATS match score climb.
                </p>
              </div>

              <button
                type="button"
                className="btn-add-resume-primary"
                onClick={() => setActiveTab('master')}
              >
                Add your resume →
              </button>
            </div>

            {/* Extension Banner Card */}
            {showExtensionBanner && (
              <div className="extension-banner-card">
                <div className="ext-icon-box">
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>

                <div className="ext-text-box">
                  <h3 className="ext-title">
                    Install the ResumeBuilder extension
                  </h3>
                  <p className="ext-description">
                    Tailor your resume right from any job page — LinkedIn,
                    Indeed, Greenhouse — in one click.
                  </p>
                  <button
                    type="button"
                    className="btn-add-chrome-pill"
                    onClick={() =>
                      alert('ResumeBuilder Chrome Extension coming soon!')
                    }
                  >
                    Add to Chrome →
                  </button>
                </div>

                <button
                  type="button"
                  className="btn-close-banner"
                  onClick={() => setShowExtensionBanner(false)}
                  title="Dismiss banner"
                >
                  ✕
                </button>
              </div>
            )}

            {/* GET STARTED Section */}
            <div className="get-started-section">
              <h2 className="section-label-uppercase">GET STARTED</h2>

              <div className="get-started-cards-grid">
                {/* Step 1 */}
                <div className="start-step-card highlighted">
                  <div className="step-num-badge active">1</div>
                  <h3 className="step-card-title">Add your resume</h3>
                  <p className="step-card-desc">
                    Upload or paste your master resume — we parse it into an
                    editable profile.
                  </p>
                  <button
                    type="button"
                    className="btn-step-action-pill"
                    onClick={() => setActiveTab('master')}
                  >
                    Add resume →
                  </button>
                </div>

                {/* Step 2 */}
                <div className="start-step-card">
                  <div className="step-num-badge">2</div>
                  <h3 className="step-card-title">Tailor to a job</h3>
                  <p className="step-card-desc">
                    Paste a job description and generate an ATS-optimized
                    version.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="start-step-card">
                  <div className="step-num-badge">3</div>
                  <h3 className="step-card-title">Download your PDF</h3>
                  <p className="step-card-desc">
                    Get a clean, ATS-safe PDF ready to submit.
                  </p>
                </div>
              </div>
            </div>

            {/* Tailored Resumes Empty State */}
            <div className="tailored-resumes-section">
              <h2 className="section-title-bold">Tailored resumes</h2>

              <div className="empty-tailored-box">
                <h4 className="empty-title">No tailored resumes yet</h4>
                <p className="empty-desc">
                  Add your master resume first, then tailor it to any job.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'master' && (
          <div className="view-container fade-in">
            <div className="view-title-block">
              <h1 className="view-h1">Master Resume</h1>
              <p className="view-p">
                Edit your candidate profile JSON. Synced automatically with
                Firebase Cloud.
              </p>
            </div>
            <ProfileForm
              initialProfile={profile}
              onSubmit={handleSaveProfile}
            />
          </div>
        )}

        {activeTab === 'scan' && (
          <div className="view-container fade-in">
            <div className="view-title-block">
              <h1 className="view-h1">Job Scan (ATS)</h1>
              <p className="view-p">
                Paste your target job description to compute keyword match and
                ATS score.
              </p>
            </div>
            <JobDescriptionInput
              initialValue={jobDescription}
              onAnalyze={(text) => {
                setJobDescription(text);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('app_jd', text);
                }
                setStatusMessage('✨ Target job saved! Processing ATS scan...');
                setTimeout(() => setStatusMessage(''), 2500);
              }}
              onBack={() => setActiveTab('dashboard')}
            />

            {jobDescription && (
              <div style={{ marginTop: '32px' }}>
                <ATSScorePanel
                  score={88}
                  matchReport={{
                    matchScore: 88,
                    matchedKeywords: [
                      'React',
                      'JavaScript',
                      'Firebase',
                      'Tailwind',
                      'REST APIs',
                    ],
                    missingKeywords: ['Docker', 'GraphQL', 'Kubernetes'],
                    tailoredSummarySuggestion:
                      'Experienced Software Engineer with a track record of building high-performance ATS web applications.',
                  }}
                  onRegenerate={() => setActiveTab('master')}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'cover_letter' && (
          <div className="view-container fade-in">
            <div className="view-title-block">
              <h1 className="view-h1">Cover Letters</h1>
              <p className="view-p">
                Generate personalized cover letters for your target job
                applications.
              </p>
            </div>

            <div className="dark-card-box">
              <div className="card-top-actions">
                <h3 className="card-heading-title">Cover Letter Draft</h3>
                <button
                  type="button"
                  className="btn-add-resume-primary"
                  onClick={handleGenerateCoverLetter}
                  disabled={isGeneratingCoverLetter}
                >
                  {isGeneratingCoverLetter
                    ? 'Generating...'
                    : '✨ Generate Cover Letter'}
                </button>
              </div>

              {coverLetterText ? (
                <div>
                  <textarea
                    className="dark-textarea"
                    value={coverLetterText}
                    onChange={(e) => setCoverLetterText(e.target.value)}
                    rows={14}
                  />
                  <button
                    type="button"
                    className="btn-add-chrome-pill"
                    style={{ marginTop: '12px' }}
                    onClick={() =>
                      navigator.clipboard.writeText(coverLetterText)
                    }
                  >
                    📋 Copy Letter
                  </button>
                </div>
              ) : (
                <p className="dark-muted-p">
                  Click "Generate Cover Letter" to produce a draft tailored to
                  your profile and target job.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'linkedin' && (
          <div className="view-container fade-in">
            <div className="view-title-block">
              <h1 className="view-h1">LinkedIn Profile Optimizer</h1>
              <p className="view-p">
                Optimized headline and summary tailored for recruiter search.
              </p>
            </div>

            <div className="dark-card-box">
              <h3 className="card-heading-title">
                Recommended Recruiter Headline
              </h3>
              <div className="code-snippet-dark">
                {profile?.title || 'Software Engineer'} | Full-Stack
                Applications | React & Cloud Specialist
              </div>

              <h3 className="card-heading-title" style={{ marginTop: '24px' }}>
                Recommended About Section
              </h3>
              <div className="code-snippet-dark">
                {profile?.summary ||
                  'Results-oriented Software Engineer specializing in building modern web applications, cloud persistence, and high-conversion user experiences.'}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="view-container fade-in">
            <div className="view-title-block">
              <h1 className="view-h1">Candidate Profile</h1>
              <p className="view-p">
                Manage your user details and cloud persistence settings.
              </p>
            </div>
            <ProfileForm
              initialProfile={profile}
              onSubmit={handleSaveProfile}
            />
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="view-container fade-in">
            <div className="view-title-block">
              <h1 className="view-h1">Plans & Credits</h1>
              <p className="view-p">Manage your credits and subscription.</p>
            </div>

            <div className="dark-plans-grid">
              <div className="dark-plan-card">
                <span className="plan-badge-sm">Current</span>
                <h3 className="plan-name">Free Plan</h3>
                <div className="plan-price-num">$0</div>
                <p className="dark-muted-p">
                  10 Free Credits / Month included
                </p>
              </div>

              <div className="dark-plan-card active-pro">
                <span className="plan-badge-sm pro">Popular</span>
                <h3 className="plan-name">Pro Candidate</h3>
                <div className="plan-price-num">$12</div>
                <p className="dark-muted-p">Unlimited ATS scans & tailoring</p>
                <button
                  type="button"
                  className="btn-add-resume-primary"
                  style={{ marginTop: '16px', width: '100%' }}
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'help' && (
          <div className="view-container fade-in">
            <div className="view-title-block">
              <h1 className="view-h1">Help & Feedback</h1>
              <p className="view-p">
                Questions or issues? Send us your feedback.
              </p>
            </div>

            <div className="dark-card-box">
              <textarea
                className="dark-textarea"
                placeholder="Write your message or feature request..."
                rows={5}
              />
              <button
                type="button"
                className="btn-add-resume-primary"
                style={{ marginTop: '14px' }}
                onClick={() => alert('Feedback submitted!')}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        )}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setStatusMessage('✨ Signed in successfully!');
          setTimeout(() => setStatusMessage(''), 3000);
        }}
      />

      <style>{`
        /* Dark Theme Global Layout */
        .dark-app-container {
          display: flex;
          min-height: 100vh;
          background-color: #0f1015;
          color: #f3f4f6;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif;
        }

        .mobile-header-bar {
          display: none;
        }

        @media (max-width: 768px) {
          .mobile-header-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 56px;
            padding: 0 16px;
            background: #161822;
            border-bottom: 1px solid #282a38;
            z-index: 90;
          }

          .mobile-toggle-btn {
            background: none;
            border: none;
            color: #f3f4f6;
            font-size: 22px;
            cursor: pointer;
          }

          .mobile-logo-title {
            font-weight: 700;
            font-size: 16px;
          }

          .credits-badge-sm {
            font-size: 12px;
            background: rgba(59, 130, 246, 0.15);
            color: #60a5fa;
            padding: 4px 10px;
            border-radius: 9999px;
            border: 1px solid rgba(59, 130, 246, 0.3);
          }

          .dark-app-container {
            flex-direction: column;
            padding-top: 56px;
          }
        }

        .drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          z-index: 99;
        }

        /* Sidebar Styles */
        .sidebar-drawer {
          width: 250px;
          background-color: #141620;
          border-right: 1px solid #232534;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: 100;
          transition: width 0.2s ease, transform 0.25s ease;
        }

        .sidebar-drawer.collapsed {
          width: 76px;
        }

        @media (max-width: 768px) {
          .sidebar-drawer {
            transform: translateX(-100%);
          }
          .sidebar-drawer.mobile-open {
            transform: translateX(0);
            width: 250px !important;
          }
        }

        .sidebar-brand-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 18px;
          border-bottom: 1px solid #232534;
        }

        .brand-badge-box {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-avatar-box {
          width: 32px;
          height: 32px;
          background: #2563eb;
          color: #ffffff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 17px;
        }

        .brand-logo-text {
          font-size: 17px;
          font-weight: 700;
          letter-spacing: -0.4px;
          color: #ffffff;
        }

        .btn-collapse-toggle {
          background: none;
          border: none;
          color: #9ca3af;
          font-size: 18px;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .btn-collapse-toggle:hover {
          color: #ffffff;
          background: #232534;
        }

        /* Tailor Job Primary CTA */
        .sidebar-cta-wrap {
          padding: 16px 14px 8px;
        }

        .btn-tailor-job-primary {
          width: 100%;
          height: 44px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
          transition: transform 0.15s ease, opacity 0.15s ease;
        }

        .btn-tailor-job-primary:hover {
          opacity: 0.95;
          transform: translateY(-1px);
        }

        .btn-tailor-job-primary:active {
          transform: scale(0.98);
        }

        .sparkle-svg {
          font-size: 16px;
        }

        /* Menu Links */
        .sidebar-menu {
          flex: 1;
          padding: 12px 10px;
          overflow-y: auto;
        }

        .menu-item-link {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          margin-bottom: 4px;
          border: none;
          background: none;
          border-radius: 10px;
          color: #9ca3af;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
          text-align: left;
        }

        .menu-item-link:hover {
          background: #1e202d;
          color: #ffffff;
        }

        .menu-item-link.active {
          background: rgba(59, 130, 246, 0.16);
          color: #60a5fa;
          font-weight: 600;
        }

        .menu-item-icon {
          font-size: 17px;
          width: 22px;
          text-align: center;
        }

        .menu-divider {
          height: 1px;
          background: #232534;
          margin: 12px 6px;
        }

        .sidebar-footer-user {
          padding: 16px 20px;
          border-top: 1px solid #232534;
        }

        .user-footer-name {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: #6b7280;
        }

        /* Workspace Main Layout */
        .main-workspace-area {
          flex: 1;
          margin-left: 250px;
          min-height: 100vh;
          background-color: #0b0c10;
          display: flex;
          flex-direction: column;
          transition: margin-left 0.2s ease;
        }

        .sidebar-drawer.collapsed + .main-workspace-area {
          margin-left: 76px;
        }

        @media (max-width: 768px) {
          .main-workspace-area {
            margin-left: 0 !important;
          }
        }

        /* Top Bar */
        .workspace-top-bar {
          height: 64px;
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #1a1c27;
        }

        @media (max-width: 768px) {
          .workspace-top-bar {
            display: none;
          }
        }

        .top-status-toast {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 13px;
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .top-bar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .credits-pill-badge {
          font-size: 13px;
          font-weight: 500;
          padding: 6px 14px;
          border-radius: 9999px;
          background: #171924;
          border: 1px solid #282a3c;
          color: #d1d5db;
        }

        .user-avatar-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #2563eb;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 15px;
        }

        /* Dashboard Content Wrapper */
        .dashboard-content-wrapper {
          padding: 40px;
          max-width: 1040px;
          width: 100%;
        }

        @media (max-width: 768px) {
          .dashboard-content-wrapper {
            padding: 24px 16px;
          }
        }

        /* Hero Header */
        .dashboard-hero-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 32px;
        }

        @media (max-width: 640px) {
          .dashboard-hero-header {
            flex-direction: column;
          }
        }

        .dash-heading {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .dash-subheading {
          font-size: 15px;
          color: #9ca3af;
          max-width: 600px;
          line-height: 1.45;
        }

        .btn-add-resume-primary {
          background: #2563eb;
          color: #ffffff;
          border: none;
          padding: 10px 22px;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: transform 0.15s ease, background 0.15s ease;
        }

        .btn-add-resume-primary:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        /* Chrome Extension Banner Card */
        .extension-banner-card {
          background: rgba(37, 99, 235, 0.08);
          border: 1px solid rgba(59, 130, 246, 0.25);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          position: relative;
          margin-bottom: 36px;
        }

        .ext-icon-box {
          width: 44px;
          height: 44px;
          background: rgba(59, 130, 246, 0.15);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ext-text-box {
          flex: 1;
        }

        .ext-title {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 6px;
        }

        .ext-description {
          font-size: 14px;
          color: #9ca3af;
          margin-bottom: 16px;
          line-height: 1.4;
        }

        .btn-add-chrome-pill {
          background: #2563eb;
          color: #ffffff;
          border: none;
          padding: 8px 18px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .btn-add-chrome-pill:hover {
          background: #1d4ed8;
        }

        .btn-close-banner {
          background: none;
          border: none;
          color: #6b7280;
          font-size: 16px;
          cursor: pointer;
          padding: 4px;
        }

        .btn-close-banner:hover {
          color: #ffffff;
        }

        /* GET STARTED Section */
        .get-started-section {
          margin-bottom: 40px;
        }

        .section-label-uppercase {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 16px;
        }

        .get-started-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        @media (max-width: 840px) {
          .get-started-cards-grid {
            grid-template-columns: 1fr;
          }
        }

        .start-step-card {
          background: #141620;
          border: 1px solid #232534;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .start-step-card.highlighted {
          background: rgba(37, 99, 235, 0.06);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .step-num-badge {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #232534;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          margin-bottom: 14px;
        }

        .step-num-badge.active {
          background: #2563eb;
          color: #ffffff;
        }

        .step-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .step-card-desc {
          font-size: 13px;
          color: #9ca3af;
          line-height: 1.45;
          margin-bottom: 16px;
          flex: 1;
        }

        .btn-step-action-pill {
          background: #2563eb;
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        /* Tailored Resumes Section */
        .tailored-resumes-section {
          margin-top: 40px;
        }

        .section-title-bold {
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 16px;
        }

        .empty-tailored-box {
          background: #141620;
          border: 1px dashed #282a3c;
          border-radius: 16px;
          padding: 48px 24px;
          text-align: center;
        }

        .empty-title {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 6px;
        }

        .empty-desc {
          font-size: 14px;
          color: #9ca3af;
        }

        /* General View Container */
        .view-container {
          padding: 40px;
          max-width: 1000px;
        }

        @media (max-width: 768px) {
          .view-container {
            padding: 24px 16px;
          }
        }

        .view-title-block {
          margin-bottom: 28px;
        }

        .view-h1 {
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 6px;
        }

        .view-p {
          font-size: 15px;
          color: #9ca3af;
        }

        .dark-card-box {
          background: #141620;
          border: 1px solid #232534;
          border-radius: 16px;
          padding: 24px;
        }

        .card-top-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .card-heading-title {
          font-size: 16px;
          font-weight: 600;
          color: #ffffff;
        }

        .dark-textarea {
          width: 100%;
          background: #0b0c10;
          border: 1px solid #232534;
          border-radius: 10px;
          padding: 14px;
          color: #f3f4f6;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.5;
        }

        .dark-muted-p {
          color: #9ca3af;
          font-size: 14px;
        }

        .code-snippet-dark {
          background: #0b0c10;
          border: 1px solid #232534;
          border-radius: 10px;
          padding: 14px;
          font-size: 14px;
          color: #60a5fa;
          margin-top: 8px;
        }

        .dark-plans-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .dark-plan-card {
          background: #141620;
          border: 1px solid #232534;
          border-radius: 16px;
          padding: 28px;
        }

        .dark-plan-card.active-pro {
          border-color: #2563eb;
        }

        .plan-badge-sm {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 9999px;
          background: #232534;
          color: #9ca3af;
        }

        .plan-badge-sm.pro {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
        }

        .plan-name {
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          margin: 10px 0;
        }

        .plan-price-num {
          font-size: 32px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 12px;
        }

        .fade-in {
          animation: fadeIn 0.2s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
