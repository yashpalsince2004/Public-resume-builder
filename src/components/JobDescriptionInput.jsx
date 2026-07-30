import { useState } from 'react';
import { extractKeywords, groupKeywordsByCategory } from '../engine/keywordExtractor.js';

/**
 * Job Description Input Component
 *
 * Large textarea for pasting a JD, with keyword extraction preview
 * and an "Analyze & Generate" action button.
 */

const CATEGORY_LABELS = {
  technical_skill: { label: 'Technical Skills', color: 'tag-primary', icon: '⚙️' },
  soft_skill: { label: 'Soft Skills', color: 'tag-info', icon: '🤝' },
  domain: { label: 'Domain & Methods', color: 'tag-accent', icon: '📊' },
  certification: { label: 'Certifications', color: 'tag-warning', icon: '🏅' },
  general: { label: 'Other Keywords', color: 'tag-success', icon: '🔑' },
};

export default function JobDescriptionInput({ initialValue, onAnalyze, onBack, keywords: prevKeywords }) {
  const [jdText, setJdText] = useState(initialValue || '');
  const [previewKeywords, setPreviewKeywords] = useState(prevKeywords || null);
  const [roleTitle, setRoleTitle] = useState('');

  const charCount = jdText.length;

  const handlePreview = () => {
    if (jdText.trim().length < 20) return;
    const { roleTitle: title, keywords } = extractKeywords(jdText);
    setRoleTitle(title);
    setPreviewKeywords(keywords);
  };

  const handleAnalyze = () => {
    if (jdText.trim().length < 20) return;
    onAnalyze(jdText);
  };

  const groupedKeywords = previewKeywords ? groupKeywordsByCategory(previewKeywords) : null;

  return (
    <div className="jd-wrapper">
      <div className="jd-header">
        <h1 className="jd-title">Paste Job Description</h1>
        <p className="jd-subtitle">
          Paste the full job description below. We'll extract keywords and tailor your resume.
        </p>
      </div>

      <div className="glass-card-static jd-card">
        <div className="jd-textarea-header">
          <label className="form-label" htmlFor="jd-textarea">Job Description</label>
          <span className="jd-char-count">{charCount.toLocaleString()} characters</span>
        </div>

        <textarea
          id="jd-textarea"
          className="form-textarea jd-textarea"
          value={jdText}
          onChange={e => { setJdText(e.target.value); setPreviewKeywords(null); }}
          placeholder={`Paste the full job description here...\n\nExample:\nSenior Software Engineer\n\nWe're looking for an experienced engineer proficient in React, Node.js, and cloud technologies to join our platform team...\n\nRequirements:\n- 5+ years of experience\n- Strong TypeScript skills\n- Experience with AWS or GCP\n...`}
          rows={12}
        />

        <div className="jd-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePreview}
            disabled={jdText.trim().length < 20}
          >
            🔍 Preview Keywords
          </button>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={handleAnalyze}
            disabled={jdText.trim().length < 20}
          >
            ⚡ Analyze & Generate Resume
          </button>
        </div>
      </div>

      {/* Keyword Preview */}
      {groupedKeywords && (
        <div className="keywords-preview animate-fade-in-up">
          {roleTitle && (
            <div className="role-title-badge glass-card-static">
              <span className="role-title-icon">🎯</span>
              <div>
                <span className="role-title-label">Detected Role</span>
                <span className="role-title-value">{roleTitle}</span>
              </div>
            </div>
          )}

          <h2 className="section-heading">
            <span className="icon">🔑</span>
            Extracted Keywords ({previewKeywords.length})
          </h2>

          <div className="keyword-groups">
            {Object.entries(groupedKeywords).map(([category, keywords]) => {
              const config = CATEGORY_LABELS[category] || CATEGORY_LABELS.general;
              return (
                <div key={category} className="keyword-group glass-card-static">
                  <h3 className="keyword-group-title">
                    <span>{config.icon}</span> {config.label}
                    <span className="keyword-group-count">{keywords.length}</span>
                  </h3>
                  <div className="tags-container">
                    {keywords.map((kw, i) => (
                      <span key={i} className={`tag ${config.color}`} title={`Weight: ${kw.weight}`}>
                        {kw.keyword}
                        {kw.weight >= 4 && <span className="tag-hot">🔥</span>}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Back button */}
      <div className="jd-nav">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          ← Back to Profile
        </button>
      </div>

      <style>{`
        .jd-wrapper {
          max-width: 800px;
          margin: 0 auto;
        }

        .jd-header {
          text-align: center;
          margin-bottom: var(--space-2xl);
        }

        .jd-title {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: var(--space-sm);
        }

        .jd-subtitle {
          color: var(--text-secondary);
          font-size: 1.0625rem;
        }

        .jd-card {
          margin-bottom: var(--space-xl);
        }

        .jd-textarea-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-sm);
        }

        .jd-char-count {
          font-size: 0.75rem;
          font-family: var(--font-mono);
          color: var(--text-tertiary);
        }

        .jd-textarea {
          min-height: 280px;
          font-size: 0.9375rem;
          line-height: 1.7;
        }

        .jd-actions {
          display: flex;
          gap: var(--space-md);
          margin-top: var(--space-lg);
          justify-content: flex-end;
          flex-wrap: wrap;
        }

        .keywords-preview {
          margin-bottom: var(--space-xl);
        }

        .role-title-badge {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          margin-bottom: var(--space-xl);
          padding: var(--space-md) var(--space-lg);
        }

        .role-title-icon {
          font-size: 2rem;
        }

        .role-title-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .role-title-value {
          display: block;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .keyword-groups {
          display: grid;
          gap: var(--space-md);
        }

        .keyword-group {
          padding: var(--space-md) var(--space-lg);
        }

        .keyword-group-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: var(--space-sm);
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .keyword-group-count {
          font-size: 0.6875rem;
          background: rgba(255, 255, 255, 0.08);
          padding: 0.125rem 0.4rem;
          border-radius: var(--radius-full);
          font-weight: 600;
        }

        .tag-hot {
          margin-left: 0.25rem;
          font-size: 0.75rem;
        }

        .jd-nav {
          text-align: center;
          margin-top: var(--space-lg);
        }

        @media (max-width: 640px) {
          .jd-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
