import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import ProfileForm from '../ProfileForm.jsx';
import { readTextFromFile, parseResumeWithGemini } from '../../utils/resumeParser.js';

export default function MasterResumeEditor() {
  const { profile, updateProfile, addToast } = useApp();
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste'
  const [pastedText, setPastedText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState('');
  const [showBlankForm, setShowBlankForm] = useState(false);

  const fileInputRef = useRef(null);

  const hasProfileData = Boolean(
    profile?.name ||
    profile?.skills?.length > 0 ||
    profile?.summary ||
    profile?.experience?.length > 0
  );

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleParseResume = async () => {
    let textToParse = '';

    if (activeTab === 'upload') {
      if (!selectedFile) {
        addToast('Please select a resume file (PDF, DOC, DOCX or TXT).', 'warning');
        return;
      }
      setIsParsing(true);
      setParseStatus(`Reading file ${selectedFile.name}...`);
      try {
        textToParse = await readTextFromFile(selectedFile);
      } catch (err) {
        addToast('Failed to read file text.', 'error');
        setIsParsing(false);
        return;
      }
    } else {
      if (!pastedText.trim()) {
        addToast('Please paste your resume text first.', 'warning');
        return;
      }
      textToParse = pastedText;
      setIsParsing(true);
    }

    setParseStatus('Parsing resume into structured profile with Gemini AI...');

    try {
      const parsed = await parseResumeWithGemini(textToParse);
      if (parsed) {
        updateProfile(parsed);
        setShowBlankForm(true);
        addToast('Resume parsed into Master Profile successfully!', 'success');
      } else {
        addToast('Could not extract details. Try editing manually.', 'warning');
      }
    } catch (err) {
      console.error('Parsing error:', err);
      addToast('Failed to parse resume.', 'error');
    } finally {
      setIsParsing(false);
      setParseStatus('');
    }
  };

  return (
    <div className="master-resume-page">
      {/* Stepper Header */}
      <div className="stepper-bar">
        <div className="step-item active">
          <span className="step-num">1</span>
          <span className="step-label">ADD RESUME</span>
        </div>
        <span className="step-arrow">→</span>
        <div className="step-item muted">
          <span className="step-num">2</span>
          <span className="step-label">TAILOR TO A JOB</span>
        </div>
        <span className="step-arrow">→</span>
        <div className="step-item muted">
          <span className="step-num">3</span>
          <span className="step-label">DOWNLOAD</span>
        </div>
      </div>

      {/* Main Titles */}
      <div className="master-head">
        <h1 className="master-title">Master Resume</h1>
        <p className="master-sub">
          Upload a file or paste your resume; we parse it into a structured profile you can edit and save.
        </p>
      </div>

      {/* Import Card */}
      <div className="import-card">
        {/* Tabs */}
        <div className="import-tabs">
          <button
            className={`import-tab ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload file
          </button>
          <button
            className={`import-tab ${activeTab === 'paste' ? 'active' : ''}`}
            onClick={() => setActiveTab('paste')}
          >
            Paste text
          </button>
        </div>

        {/* Tab Content */}
        <div className="import-body">
          {activeTab === 'upload' ? (
            <div
              className="dropzone-box"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.json"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <div className="dropzone-text">
                {selectedFile ? (
                  <strong style={{ color: '#60a5fa' }}>📄 {selectedFile.name}</strong>
                ) : (
                  <>
                    <strong className="drop-main">Click to choose a file</strong>
                    <span className="drop-sub">PDF, DOC, DOCX or TXT</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <textarea
              className="paste-textarea"
              placeholder="Paste your plain text resume here..."
              rows={6}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
            />
          )}

          {parseStatus && (
            <div className="parse-status-msg">
              ✨ {parseStatus}
            </div>
          )}

          <div style={{ marginTop: '16px' }}>
            <button
              className="parse-btn"
              onClick={handleParseResume}
              disabled={isParsing}
            >
              {isParsing ? 'Parsing resume...' : 'Parse resume'}
            </button>
          </div>
        </div>
      </div>

      {/* Structured Profile Section */}
      <div className="structured-section">
        <h2 className="structured-title">Structured profile</h2>

        {!hasProfileData && !showBlankForm ? (
          <div className="structured-empty-box">
            <span className="empty-text">No resume yet. Import above, or start from a blank form.</span>
            <button
              className="start-blank-btn"
              onClick={() => setShowBlankForm(true)}
            >
              Start blank
            </button>
          </div>
        ) : (
          <div className="structured-editor-box">
            <ProfileForm
              initialProfile={profile}
              onSubmit={(updated) => {
                updateProfile(updated);
                addToast('Master Profile saved!', 'success');
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        .master-resume-page {
          max-width: 900px;
        }

        /* Stepper */
        .stepper-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .step-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .step-item.active {
          color: var(--ds-text-primary);
        }
        .step-item.muted {
          color: var(--ds-text-muted);
        }
        .step-num {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
        }
        .step-item.active .step-num {
          background: #3b82f6;
          color: #ffffff;
        }
        .step-item.muted .step-num {
          background: var(--ds-surface-secondary);
          color: var(--ds-text-muted);
        }
        .step-arrow {
          color: var(--ds-text-muted);
          font-size: 12px;
        }

        .master-head {
          margin-bottom: 28px;
        }
        .master-title {
          font-size: 26px;
          font-weight: 700;
          color: var(--ds-text-primary);
          margin: 0 0 6px 0;
        }
        .master-sub {
          font-size: 14px;
          color: var(--ds-text-secondary);
          margin: 0;
        }

        /* Import Card */
        .import-card {
          background: var(--ds-surface);
          border: 1px solid var(--ds-border);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 36px;
        }
        .import-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          background: var(--ds-surface-secondary);
          padding: 4px;
          border-radius: 10px;
          width: fit-content;
        }
        .import-tab {
          padding: 8px 16px;
          background: none;
          border: none;
          color: var(--ds-text-muted);
          font-size: 13px;
          font-weight: 500;
          border-radius: 8px;
          cursor: pointer;
        }
        .import-tab.active {
          background: var(--ds-surface-elevated);
          color: var(--ds-text-primary);
          font-weight: 600;
        }

        .dropzone-box {
          border: 1px dashed var(--ds-border-strong);
          border-radius: 12px;
          padding: 36px 20px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.15s ease;
        }
        .dropzone-box:hover {
          border-color: #3b82f6;
        }
        .drop-main {
          display: block;
          font-size: 14px;
          color: var(--ds-text-primary);
          margin-bottom: 4px;
        }
        .drop-sub {
          font-size: 12px;
          color: var(--ds-text-muted);
        }

        .paste-textarea {
          width: 100%;
          background: var(--ds-surface-secondary);
          border: 1px solid var(--ds-border);
          border-radius: 12px;
          padding: 14px;
          color: var(--ds-text-primary);
          font-size: 14px;
          outline: none;
          resize: vertical;
        }

        .parse-status-msg {
          margin-top: 12px;
          font-size: 13px;
          color: #60a5fa;
        }

        .parse-btn {
          padding: 10px 22px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: var(--ds-radius-pill);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .parse-btn:disabled {
          opacity: 0.5;
        }

        /* Structured Profile */
        .structured-section {
          margin-top: 24px;
        }
        .structured-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--ds-text-primary);
          margin: 0 0 16px 0;
        }
        .structured-empty-box {
          background: var(--ds-surface);
          border: 1px dashed var(--ds-border-strong);
          border-radius: 16px;
          padding: 24px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .empty-text {
          font-size: 14px;
          color: var(--ds-text-muted);
        }
        .start-blank-btn {
          padding: 8px 18px;
          background: var(--ds-surface-secondary);
          border: 1px solid var(--ds-border);
          color: var(--ds-text-primary);
          border-radius: var(--ds-radius-pill);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
