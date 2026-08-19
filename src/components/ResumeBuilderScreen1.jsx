import { useState, useEffect } from 'react';
import defaultProfile from '../assets/profile.json';
import ProfileForm from './ProfileForm.jsx';

/**
 * Screen 1: Resume Builder Input Page (Dark Theme + Gemini 3.6 Flash API)
 * Takes Job Description and queries Gemini API directly using key from .env file.
 */
export default function ResumeBuilderScreen1({
  profile,
  onUpdateProfile,
  jobDescription,
  onJdChange,
  onGenerate,
  isLoading,
  loadingStatus,
  error,
  autoOpenEditModal = false,
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(autoOpenEditModal);
  const [editFormData, setEditFormData] = useState(profile || defaultProfile);

  useEffect(() => {
    if (autoOpenEditModal) {
      setIsEditModalOpen(true);
    }
  }, [autoOpenEditModal]);

  const sampleJd = `Senior Full Stack Engineer — TechCorp Innovations (Fintech & Cloud Platforms)

About the Company:
TechCorp Innovations is a fast-growing enterprise fintech platform delivering real-time financial analytics and microservices to Fortune 500 institutions. We value engineering excellence, user-centric design, and scalable system architecture.

Role Summary:
We are seeking an experienced Senior Full Stack Engineer proficient in React, TypeScript, Node.js, and cloud architectures. You will lead the architecture of high-performance web applications, build RESTful APIs, and optimize client-side bundle performance.

Key Responsibilities:
- Architect scalable micro-frontend platforms and WebSockets streaming APIs
- Lead frontend and backend development using React, TypeScript, Node.js, and PostgreSQL
- Implement automated CI/CD pipelines, Docker containerization, and AWS infrastructure
- Optimize web performance, Web Vitals, and client-side load speeds

Requirements & Qualifications:
- 5+ years of experience in full stack software engineering
- Proficient in React, TypeScript, JavaScript (ES6+), Node.js, and GraphQL
- Hands-on experience with PostgreSQL, MongoDB, Docker, and AWS
- Bachelor's degree in Computer Science or equivalent practical experience
- Strong problem-solving, system design, and collaborative communication skills`;

  const [isFocused, setIsFocused] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const TYPING_PHRASES = [
    "Seeking Senior Full Stack Engineer proficient in React, Node.js & Cloud...",
    "Looking for AI/ML Engineer to build LLM & RAG pipelines with FastAPI...",
    "Hiring Backend Software Engineer with Python, Docker & PostgreSQL...",
    "Frontend Developer needed for high-performance TypeScript & Next.js apps...",
  ];

  useEffect(() => {
    if (jobDescription || isFocused) {
      setDisplayText('');
      return;
    }

    const currentPhrase = TYPING_PHRASES[phraseIndex];
    const speed = isDeleting ? 25 : 45;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentPhrase.substring(0, displayText.length + 1));
        if (displayText === currentPhrase) {
          setTimeout(() => setIsDeleting(true), 1800);
        }
      } else {
        setDisplayText(currentPhrase.substring(0, displayText.length - 1));
        if (displayText === '') {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % TYPING_PHRASES.length);
        }
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, phraseIndex, jobDescription, isFocused]);

  const handleInsertSample = () => {
    onJdChange(sampleJd);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    onUpdateProfile(editFormData);
    setIsEditModalOpen(false);
  };

  return (
    <div className="screen-1-container animate-fade-in">
      <div className="screen-1-grid">
        {/* LEFT BOX: Paste Job Description */}
        <div className="jd-box">
          <div className="box-title-row">
            <label htmlFor="jd-input" className="box-title">
              Job Description
            </label>

            <div className="jd-quick-actions">
              <button
                type="button"
                className="btn-apple-utility"
                onClick={handleInsertSample}
              >
                ✨ Sample JD
              </button>
              {jobDescription && (
                <button
                  type="button"
                  className="btn-apple-utility"
                  onClick={() => onJdChange('')}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="jd-textarea-wrapper">
            <textarea
              id="jd-input"
              className="apple-textarea jd-textarea"
              placeholder={isFocused || jobDescription ? "Paste the job description..." : ""}
              value={jobDescription}
              onChange={(e) => onJdChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              rows={14}
              disabled={isLoading}
            />
            {!jobDescription && !isFocused && (
              <div
                className="typing-placeholder-overlay"
                onClick={() => document.getElementById('jd-input')?.focus()}
              >
                <span className="typing-text">{displayText}</span>
                <span className="typing-cursor">|</span>
              </div>
            )}
          </div>

          <div className="jd-meta">
            <span>{jobDescription ? jobDescription.length : 0} characters</span>
          </div>
        </div>

        {/* RIGHT BOX: Details */}
        <div className="details-box">
          <div className="box-title-row">
            <span className="box-title">Details</span>
            <button
              type="button"
              className="edit-details-btn"
              onClick={() => {
                setEditFormData(profile);
                setIsEditModalOpen(true);
              }}
              title="Edit detail option"
            >
              <svg
                className="edit-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span className="edit-btn-text">Edit details</span>
            </button>
          </div>

          <div className="details-card-inner">
            <div className="detail-item">
              <span className="detail-bullet">•</span>
              <span className="detail-label">name:</span>
              <span className="detail-value">{profile.name || 'Not set'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-bullet">•</span>
              <span className="detail-label">phone:</span>
              <span className="detail-value">{profile.phone || 'Not set'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-bullet">•</span>
              <span className="detail-label">email:</span>
              <span className="detail-value">{profile.email || 'Not set'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-bullet">•</span>
              <span className="detail-label">linkedin:</span>
              <span className="detail-value">{profile.linkedin || 'Not set'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-bullet">•</span>
              <span className="detail-label">github:</span>
              <span className="detail-value">{profile.github || 'Not set'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-bullet">•</span>
              <span className="detail-label">portfolio:</span>
              <span className="detail-value">{profile.portfolio || 'Not set'}</span>
            </div>
          </div>


        </div>
      </div>



      {/* CENTER BOTTOM: Generate Button */}
      <div className="generate-bar">
        <button
          type="button"
          className="btn-apple-primary btn-generate"
          onClick={onGenerate}
          disabled={!jobDescription || jobDescription.trim().length < 10 || isLoading}
        >
          {isLoading ? (
            <>
              <span className="loading-spinner">✨</span>
              <span style={{ fontSize: '15px' }}>{loadingStatus || 'Analyzing with Gemini AI...'}</span>
            </>
          ) : (
            <>
              <span>Generate</span>
              <span className="generate-arrow">→</span>
            </>
          )}
        </button>
      </div>

      {/* EDIT DETAILS MODAL */}
      {isEditModalOpen && (
        <div className="apple-modal-overlay">
          <div className="apple-modal-content profile-form-modal animate-fade-in">
            <div className="modal-header">
              <h2 className="display-md">Candidate Profile Details</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsEditModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body-scroll">
              <ProfileForm
                initialProfile={profile}
                onSubmit={(updatedProf) => {
                  onUpdateProfile(updatedProf);
                  setIsEditModalOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .profile-form-modal {
          max-width: 900px !important;
          width: 92% !important;
          max-height: 90vh !important;
          display: flex;
          flex-direction: column;
          padding: 24px;
        }

        .modal-body-scroll {
          overflow-y: auto;
          padding-right: 8px;
          max-height: calc(90vh - 80px);
        }

        .screen-1-container {
          max-width: 1100px;
          margin: 32px auto;
          padding: 0 20px;
        }

        .title-with-badge {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .gemini-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
          background-color: rgba(41, 151, 255, 0.15);
          color: var(--color-primary-on-dark);
          border: 1px solid rgba(41, 151, 255, 0.25);
        }

        .screen-1-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          margin-bottom: 24px;
        }

        .jd-box {
          background-color: var(--color-canvas);
          border: 1px solid var(--color-hairline);
          border-radius: var(--radius-lg);
          padding: 24px;
        }

        .box-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .box-title {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 600;
          color: var(--color-ink);
        }

        .jd-quick-actions {
          display: flex;
          gap: 8px;
        }

        .jd-textarea-wrapper {
          position: relative;
          width: 100%;
        }

        .jd-textarea {
          min-height: 340px;
          resize: none;
          width: 100%;
        }

        .typing-placeholder-overlay {
          position: absolute;
          top: 16px;
          left: 18px;
          right: 18px;
          pointer-events: none;
          font-size: 15px;
          line-height: 1.5;
          color: var(--color-body-muted);
          opacity: 0.65;
          user-select: none;
          font-family: inherit;
          white-space: pre-wrap;
          word-break: break-word;
          cursor: text;
        }

        .typing-cursor {
          display: inline-block;
          margin-left: 2px;
          font-weight: 400;
          color: var(--color-primary-on-dark);
          animation: blink 0.7s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .jd-meta {
          margin-top: 8px;
          text-align: right;
          font-size: 13px;
          color: var(--color-body-muted);
        }

        /* Details Box Dark Theme */
        .details-box {
          background-color: var(--color-canvas);
          border: 1px solid var(--color-hairline);
          border-radius: var(--radius-lg);
          padding: 24px;
          display: flex;
          flex-direction: column;
        }

        .edit-details-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: var(--color-primary-on-dark);
          font-size: 14px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          transition: background-color 0.15s ease;
        }

        .edit-details-btn:hover {
          background-color: rgba(41, 151, 255, 0.12);
        }

        .edit-icon {
          width: 16px;
          height: 16px;
        }

        .details-card-inner {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 12px;
          margin-bottom: 24px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
        }

        .detail-bullet {
          color: var(--color-primary-on-dark);
          font-weight: bold;
        }

        .detail-label {
          color: var(--color-body-muted);
          font-weight: 500;
        }

        .detail-value {
          color: var(--color-ink);
          font-weight: 400;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .details-status-badge {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--color-success);
          background-color: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
        }

        .error-alert {
          background-color: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: var(--color-danger);
          padding: 12px 16px;
          border-radius: var(--radius-md);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
        }

        /* Generate Bar */
        .generate-bar {
          text-align: center;
          padding-top: 16px;
        }

        .btn-generate {
          min-width: 240px;
          font-size: 18px;
          padding: 14px 36px;
        }

        .generate-arrow {
          font-size: 20px;
          transition: transform 0.2s ease;
        }

        .btn-generate:hover .generate-arrow {
          transform: translateX(4px);
        }

        .loading-spinner {
          animation: pulse 1s infinite alternate;
        }

        /* Modal styling */
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .modal-close-btn {
          background: none;
          border: none;
          font-size: 20px;
          color: var(--color-body-muted);
          cursor: pointer;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .span-2 {
          grid-column: span 2;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-body-muted);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }

        @media (max-width: 860px) {
          .screen-1-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
