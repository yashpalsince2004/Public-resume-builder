import { useEffect, useRef } from 'react';
import { getScoreColor, getScoreLabel } from '../engine/atsScorer.js';

/**
 * ATS Score Panel Component
 *
 * Displays animated circular score ring, section breakdowns,
 * keyword coverage, and improvement suggestions.
 */
export default function ATSScorePanel({ score, matchReport, onRegenerate }) {
  const ringRef = useRef(null);

  // Animate the SVG ring on mount
  useEffect(() => {
    if (ringRef.current) {
      const circumference = 2 * Math.PI * 45;
      const offset = circumference - (score.overall / 100) * circumference;
      ringRef.current.style.strokeDashoffset = offset;
    }
  }, [score.overall]);

  const scoreColor = getScoreColor(score.overall);
  const scoreLabel = getScoreLabel(score.overall);

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'tip': return '💡';
      case 'info': return 'ℹ️';
      default: return '📌';
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'var(--color-danger)';
      case 'medium': return 'var(--color-warning)';
      case 'low': return 'var(--color-info)';
      default: return 'var(--text-tertiary)';
    }
  };

  return (
    <div className="ats-panel">
      {/* Score Ring */}
      <div className="score-ring-section glass-card-static">
        <div className="score-ring-container">
          <svg width="140" height="140" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="6"
            />
            {/* Score ring */}
            <circle
              ref={ringRef}
              cx="50" cy="50" r="45"
              fill="none"
              stroke={scoreColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45}`}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          </svg>
          <div className="score-ring-value">
            <span className="score-number" style={{ color: scoreColor }}>{score.overall}</span>
            <span className="score-label">/ 100</span>
          </div>
        </div>
        <div className="score-meta">
          <span className="score-grade" style={{ color: scoreColor }}>{score.grade}</span>
          <span className="score-quality">{scoreLabel}</span>
        </div>
      </div>

      {/* Section Breakdown */}
      <div className="score-breakdown glass-card-static">
        <h3 className="panel-title">📊 Score Breakdown</h3>
        {Object.entries(score.breakdown).map(([key, section]) => (
          <div key={key} className="breakdown-item">
            <div className="breakdown-header">
              <span className="breakdown-label">{section.label}</span>
              <span className="breakdown-value" style={{ color: getScoreColor(section.score) }}>
                {section.score}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className={`progress-fill ${section.score >= 70 ? 'high' : section.score >= 40 ? 'mid' : 'low'}`}
                style={{ width: `${section.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Keyword Coverage */}
      <div className="keyword-coverage glass-card-static">
        <h3 className="panel-title">🔑 Keyword Coverage</h3>
        <div className="coverage-stats">
          <div className="coverage-stat">
            <span className="coverage-number" style={{ color: 'var(--color-success)' }}>
              {score.keywordCoverage.matched}
            </span>
            <span className="coverage-label">Matched</span>
          </div>
          <div className="coverage-stat">
            <span className="coverage-number" style={{ color: 'var(--color-warning)' }}>
              {score.keywordCoverage.partial}
            </span>
            <span className="coverage-label">Partial</span>
          </div>
          <div className="coverage-stat">
            <span className="coverage-number" style={{ color: 'var(--color-danger)' }}>
              {score.keywordCoverage.missing}
            </span>
            <span className="coverage-label">Missing</span>
          </div>
          <div className="coverage-stat">
            <span className="coverage-number" style={{ color: 'var(--text-secondary)' }}>
              {score.keywordCoverage.total}
            </span>
            <span className="coverage-label">Total</span>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {score.suggestions.length > 0 && (
        <div className="suggestions glass-card-static">
          <h3 className="panel-title">💡 Improvement Tips</h3>
          <div className="suggestions-list">
            {score.suggestions.map((suggestion, i) => (
              <div key={i} className="suggestion-item">
                <div className="suggestion-header">
                  <span className="suggestion-icon">{getSuggestionIcon(suggestion.type)}</span>
                  <span className="suggestion-title">{suggestion.title}</span>
                  <span
                    className="suggestion-impact"
                    style={{ color: getImpactColor(suggestion.impact) }}
                  >
                    {suggestion.impact}
                  </span>
                </div>
                <p className="suggestion-desc">{suggestion.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regenerate */}
      <button type="button" className="btn btn-secondary w-full" onClick={onRegenerate}>
        🔄 Regenerate Resume
      </button>

      <style>{`
        .ats-panel {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .panel-title {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--space-md);
        }

        /* Score Ring */
        .score-ring-section {
          text-align: center;
          padding: var(--space-xl);
        }

        .score-ring-container {
          position: relative;
          width: 140px;
          height: 140px;
          margin: 0 auto var(--space-md);
        }

        .score-ring-value {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .score-number {
          font-family: var(--font-mono);
          font-size: 2.25rem;
          font-weight: 700;
          line-height: 1;
        }

        .score-label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-tertiary);
          margin-top: 0.125rem;
        }

        .score-meta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.125rem;
        }

        .score-grade {
          font-family: var(--font-mono);
          font-size: 1.25rem;
          font-weight: 700;
        }

        .score-quality {
          font-size: 0.8125rem;
          color: var(--text-secondary);
        }

        /* Breakdown */
        .breakdown-item {
          margin-bottom: var(--space-md);
        }

        .breakdown-item:last-child {
          margin-bottom: 0;
        }

        .breakdown-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.375rem;
        }

        .breakdown-label {
          font-size: 0.8125rem;
          color: var(--text-secondary);
        }

        .breakdown-value {
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          font-weight: 600;
        }

        /* Coverage */
        .coverage-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-sm);
          text-align: center;
        }

        .coverage-stat {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .coverage-number {
          font-family: var(--font-mono);
          font-size: 1.5rem;
          font-weight: 700;
        }

        .coverage-label {
          font-size: 0.6875rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Suggestions */
        .suggestions-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .suggestion-item {
          padding: var(--space-sm) 0;
          border-bottom: 1px solid var(--border-glass);
        }

        .suggestion-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .suggestion-header {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: 0.375rem;
        }

        .suggestion-icon {
          font-size: 1rem;
        }

        .suggestion-title {
          flex: 1;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .suggestion-impact {
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .suggestion-desc {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
