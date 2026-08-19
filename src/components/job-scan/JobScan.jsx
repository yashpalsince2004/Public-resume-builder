import { useState } from 'react';
import { extractKeywords, groupKeywordsByCategory } from '../../engine/keywordExtractor.js';
import { matchProfile } from '../../engine/resumeMatcher.js';
import { calculateATSScore } from '../../engine/atsScorer.js';
import { useApp } from '../../context/AppContext.jsx';
import { Card, Badge, ScoreRing } from '../ui/Card.jsx';

export default function JobScan() {
  const { profile, addToast } = useApp();
  const [jobLink, setJobLink] = useState('');
  const [jobText, setJobText] = useState('');
  const [mode, setMode] = useState('link'); // 'link' | 'paste'
  const [report, setReport] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    const textToScan = mode === 'link' ? jobLink : jobText;

    if (!textToScan || textToScan.trim().length < 5) {
      addToast('Please enter a valid job link or paste description.', 'warning');
      return;
    }

    setIsScanning(true);
    try {
      const extracted = extractKeywords(textToScan);
      const matched = matchProfile(extracted.keywords, profile);
      const ats = calculateATSScore(matched, extracted.keywords, profile);

      setReport({
        roleTitle: extracted.roleTitle || 'Target Role',
        keywords: extracted.keywords,
        groupedKeywords: groupKeywordsByCategory(extracted.keywords),
        matchReport: matched,
        atsScore: ats,
      });
      addToast('Job match scan completed!', 'success');
    } catch (err) {
      addToast('Failed to scan job posting.', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="job-scan-page">
      {/* Titles */}
      <div className="scan-head">
        <h1 className="scan-title">Job match scan</h1>
        <p className="scan-sub">
          Add a job link (we'll read it) or paste the description to see how your résumé scores — and which keywords you're missing. Costs 1 credit.
        </p>
      </div>

      {/* Main Input Card */}
      <div className="scan-card">
        {mode === 'link' ? (
          <div className="scan-field-group">
            <label className="scan-field-label">Job posting link</label>
            <input
              type="text"
              className="scan-text-input"
              placeholder="https://company.com/careers/senior-engineer"
              value={jobLink}
              onChange={(e) => setJobLink(e.target.value)}
            />
            <span className="scan-field-help">
              Paste the link to the job posting — we'll read the description for you.
            </span>
          </div>
        ) : (
          <div className="scan-field-group">
            <label className="scan-field-label">Job description text</label>
            <textarea
              className="scan-textarea-input"
              rows={6}
              placeholder="Paste full job description text here..."
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
            />
            <span className="scan-field-help">
              Paste the full text of the job description.
            </span>
          </div>
        )}

        {/* Buttons */}
        <div className="scan-btn-row">
          <button
            className="scan-submit-btn"
            onClick={handleScan}
            disabled={isScanning}
          >
            {isScanning ? 'Scanning...' : 'Scan this job'}
          </button>

          <button
            className="scan-switch-btn"
            onClick={() => setMode(mode === 'link' ? 'paste' : 'link')}
          >
            {mode === 'link' ? 'or paste the description' : 'or use job posting link'}
          </button>
        </div>
      </div>

      {/* Results */}
      {report && (
        <div className="scan-report-sec animate-fade-in">
          <div className="scan-report-grid">
            <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <h3 style={{ fontSize: '16px', margin: '0 0 16px 0' }}>ATS Match Score</h3>
              <ScoreRing score={report.atsScore.overall} size={110} label={report.atsScore.grade} />
            </Card>

            <Card>
              <h3 style={{ fontSize: '16px', margin: '0 0 16px 0' }}>Extracted Keywords ({report.keywords.length})</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {report.keywords.slice(0, 30).map((kw, i) => {
                  const isMatched = report.matchReport.matchedKeywords.some(m => m.keyword.toLowerCase() === kw.keyword.toLowerCase());
                  return (
                    <Badge key={i} variant={isMatched ? 'success' : 'default'}>
                      {isMatched ? '✓ ' : ''}{kw.keyword}
                    </Badge>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      <style>{`
        .job-scan-page {
          max-width: 900px;
        }

        .scan-head {
          margin-bottom: 28px;
        }
        .scan-title {
          font-size: 26px;
          font-weight: 700;
          color: var(--ds-text-primary);
          margin: 0 0 6px 0;
        }
        .scan-sub {
          font-size: 14px;
          color: var(--ds-text-secondary);
          margin: 0;
        }

        .scan-card {
          background: var(--ds-surface);
          border: 1px solid var(--ds-border);
          border-radius: 16px;
          padding: 28px;
          margin-bottom: 32px;
        }
        .scan-field-group {
          margin-bottom: 24px;
        }
        .scan-field-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: var(--ds-text-primary);
          margin-bottom: 8px;
        }
        .scan-text-input {
          width: 100%;
          background: var(--ds-surface-secondary);
          border: 1px solid var(--ds-border);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 14px;
          color: var(--ds-text-primary);
          outline: none;
        }
        .scan-text-input:focus {
          border-color: #3b82f6;
        }
        .scan-textarea-input {
          width: 100%;
          background: var(--ds-surface-secondary);
          border: 1px solid var(--ds-border);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 14px;
          color: var(--ds-text-primary);
          outline: none;
          resize: vertical;
        }

        .scan-field-help {
          display: block;
          font-size: 12px;
          color: var(--ds-text-muted);
          margin-top: 6px;
        }

        .scan-btn-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .scan-submit-btn {
          padding: 10px 22px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: var(--ds-radius-pill);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .scan-submit-btn:hover {
          background: #2563eb;
        }
        .scan-switch-btn {
          background: none;
          border: none;
          color: var(--ds-text-secondary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: underline;
        }

        .scan-report-grid {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 20px;
        }
        @media (max-width: 768px) {
          .scan-report-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
