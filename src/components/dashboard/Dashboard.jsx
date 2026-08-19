import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { Card } from '../ui/Card.jsx';

export default function Dashboard() {
  const { user, profile, applications } = useApp();
  const [showExtensionBanner, setShowExtensionBanner] = useState(true);

  const rawName = user?.displayName || profile?.name || 'Candidate';
  const firstName = rawName.split(' ')[0].toUpperCase();

  const hasMasterResume = Boolean(profile?.name && (profile?.skills?.length > 0 || profile?.summary || profile?.experience?.length > 0));
  const tailoredResumes = applications.filter(a => a.tailoredResume);

  return (
    <div className="dash-container">
      {/* Welcome Header */}
      <div className="dash-welcome-header">
        <div>
          <h1 className="dash-title">Welcome, {firstName}</h1>
          <p className="dash-subtitle">
            Tailor your master resume to any job in seconds — and watch your ATS match score climb.
          </p>
        </div>

        <a href="/app/master-resume" className="dash-add-resume-btn">
          Add your resume →
        </a>
      </div>

      {/* Extension Banner */}
      {showExtensionBanner && (
        <div className="dash-extension-banner">
          <div className="banner-left">
            <div className="banner-icon-box">
              🧩
            </div>
            <div>
              <h3 className="banner-title">Install the ResumeBuilder extension</h3>
              <p className="banner-desc">
                Tailor your resume right from any job page — LinkedIn, Indeed, Greenhouse — in one click.
              </p>
              <a
                href="https://chrome.google.com"
                target="_blank"
                rel="noreferrer"
                className="banner-chrome-btn"
              >
                Add to Chrome →
              </a>
            </div>
          </div>

          <button
            className="banner-close-btn"
            onClick={() => setShowExtensionBanner(false)}
            aria-label="Dismiss banner"
          >
            ✕
          </button>
        </div>
      )}

      {/* GET STARTED Grid */}
      <div className="dash-get-started-sec">
        <h4 className="dash-sec-label">GET STARTED</h4>

        <div className="dash-steps-grid">
          {/* Step 1 */}
          <div className={`dash-step-card ${hasMasterResume ? 'completed' : 'active'}`}>
            <div className="step-card-header">
              <span className="step-number-circle">1</span>
              <h3 className="step-card-title">Add your resume</h3>
            </div>
            <p className="step-card-desc">
              Upload or paste your master resume — we parse it into an editable profile.
            </p>

            <a href="/app/master-resume" className="step-card-btn">
              {hasMasterResume ? 'Edit resume →' : 'Add resume →'}
            </a>
          </div>

          {/* Step 2 */}
          <div className={`dash-step-card ${hasMasterResume ? 'active' : ''}`}>
            <div className="step-card-header">
              <span className="step-number-circle">2</span>
              <h3 className="step-card-title">Tailor to a job</h3>
            </div>
            <p className="step-card-desc">
              Paste a job description and generate an ATS-optimized version.
            </p>
          </div>

          {/* Step 3 */}
          <div className="dash-step-card">
            <div className="step-card-header">
              <span className="step-number-circle">3</span>
              <h3 className="step-card-title">Download your PDF</h3>
            </div>
            <p className="step-card-desc">
              Get a clean, ATS-safe PDF ready to submit.
            </p>
          </div>
        </div>
      </div>

      {/* Tailored Resumes Section */}
      <div className="dash-tailored-sec">
        <h3 className="dash-sec-title">Tailored resumes</h3>

        {tailoredResumes.length === 0 ? (
          <div className="dash-empty-box">
            <h4 className="empty-box-title">No tailored resumes yet</h4>
            <p className="empty-box-sub">
              Add your master resume first, then tailor it to any job.
            </p>
          </div>
        ) : (
          <div className="dash-tailored-grid">
            {tailoredResumes.map((app) => (
              <div key={app.id} className="tailored-item-card">
                <div>
                  <h4 className="tailored-company">{app.company}</h4>
                  <p className="tailored-role">{app.role}</p>
                </div>
                <div className="tailored-meta">
                  <span className="tailored-score">{app.atsScore}% ATS</span>
                  <a href={`/app/applications/${app.id}`} className="tailored-view-link">View →</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .dash-container {
          max-width: 1000px;
        }

        .dash-welcome-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 28px;
          gap: 20px;
        }
        .dash-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--ds-text-primary);
          margin: 0;
          letter-spacing: -0.4px;
        }
        .dash-subtitle {
          font-size: 15px;
          color: var(--ds-text-secondary);
          margin-top: 6px;
        }

        .dash-add-resume-btn {
          display: inline-flex;
          align-items: center;
          padding: 10px 20px;
          background: #3b82f6;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          border-radius: var(--ds-radius-pill);
          text-decoration: none;
          white-space: nowrap;
          transition: background 0.15s ease;
        }
        .dash-add-resume-btn:hover {
          background: #2563eb;
        }

        /* Extension Banner */
        .dash-extension-banner {
          position: relative;
          background: #141b2e;
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 36px;
        }
        .banner-left {
          display: flex;
          gap: 20px;
        }
        .banner-icon-box {
          width: 48px;
          height: 48px;
          background: #3b82f6;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }
        .banner-title {
          font-size: 17px;
          font-weight: 600;
          color: var(--ds-text-primary);
          margin: 0 0 6px 0;
        }
        .banner-desc {
          font-size: 14px;
          color: var(--ds-text-secondary);
          margin: 0 0 16px 0;
        }
        .banner-chrome-btn {
          display: inline-flex;
          align-items: center;
          padding: 8px 18px;
          background: #3b82f6;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          border-radius: var(--ds-radius-pill);
          text-decoration: none;
        }
        .banner-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          color: var(--ds-text-muted);
          cursor: pointer;
          font-size: 16px;
        }

        /* GET STARTED */
        .dash-get-started-sec {
          margin-bottom: 36px;
        }
        .dash-sec-label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
          color: var(--ds-text-muted);
          margin: 0 0 16px 0;
          text-transform: uppercase;
        }
        .dash-steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .dash-step-card {
          background: var(--ds-surface);
          border: 1px solid var(--ds-border);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 180px;
        }
        .dash-step-card.active {
          background: #171d30;
          border-color: rgba(59, 130, 246, 0.4);
        }
        .step-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }
        .step-number-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--ds-surface-secondary);
          color: var(--ds-text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .dash-step-card.active .step-number-circle {
          background: #3b82f6;
          color: #ffffff;
        }
        .step-card-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--ds-text-primary);
          margin: 0;
        }
        .step-card-desc {
          font-size: 13px;
          color: var(--ds-text-secondary);
          line-height: 1.5;
          margin: 0 0 16px 0;
        }
        .step-card-btn {
          display: inline-flex;
          align-items: center;
          padding: 8px 16px;
          background: #3b82f6;
          color: #ffffff;
          font-size: 13px;
          font-weight: 600;
          border-radius: var(--ds-radius-pill);
          text-decoration: none;
          width: fit-content;
        }

        /* Tailored Resumes */
        .dash-tailored-sec {
          margin-bottom: 24px;
        }
        .dash-sec-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--ds-text-primary);
          margin: 0 0 16px 0;
        }
        .dash-empty-box {
          background: var(--ds-surface);
          border: 1px dashed var(--ds-border-strong);
          border-radius: 16px;
          padding: 48px 24px;
          text-align: center;
        }
        .empty-box-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--ds-text-primary);
          margin: 0 0 6px 0;
        }
        .empty-box-sub {
          font-size: 13px;
          color: var(--ds-text-muted);
          margin: 0;
        }

        .dash-tailored-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .tailored-item-card {
          background: var(--ds-surface);
          border: 1px solid var(--ds-border);
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .tailored-company {
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 2px 0;
        }
        .tailored-role {
          font-size: 13px;
          color: var(--ds-text-muted);
          margin: 0;
        }
        .tailored-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .tailored-score {
          font-size: 13px;
          font-weight: 600;
          color: #10b981;
        }

        @media (max-width: 768px) {
          .dash-steps-grid {
            grid-template-columns: 1fr;
          }
          .dash-welcome-header {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
