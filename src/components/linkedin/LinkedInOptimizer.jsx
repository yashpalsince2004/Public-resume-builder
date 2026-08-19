import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';

export default function LinkedInOptimizer() {
  const { profile, credits, deductCredits, refundCredits, addToast, CREDIT_COSTS } = useApp();
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [report, setReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const cost = CREDIT_COSTS.linkedin_optimization || 10;

  const handleOptimize = async () => {
    if (!linkedinUrl.trim()) {
      addToast('Please enter your LinkedIn profile URL.', 'warning');
      return;
    }

    if (credits < cost) {
      addToast(`Insufficient credits! You need ${cost} credits for LinkedIn optimization.`, 'error');
      return;
    }

    const costRes = await deductCredits(cost, 'linkedin_optimization');
    if (!costRes.success) return;

    setIsGenerating(true);

    try {
      const apiKey = import.meta.env.PUBLIC_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';
      if (!apiKey) throw new Error('Gemini API key missing');

      const roleStr = targetRole || profile?.title || 'Senior Software Engineer';

      const prompt = `You are a Senior Technical Recruiter & LinkedIn Branding Strategist.
Optimize LinkedIn profile copy for a candidate targeting ${roleStr} positions.

CANDIDATE FACTS:
Name: ${profile.name || 'Candidate'}
Current Title: ${profile.title || ''}
Summary: ${profile.summary || ''}
Skills: ${(profile.skills || []).join(', ')}
Experience: ${JSON.stringify(profile.experience || [])}
LinkedIn URL: ${linkedinUrl}

Return a strict JSON object with NO markdown wrapper:
{
  "score": 88,
  "headline": "High-impact recruiter-optimized 220-char LinkedIn Headline...",
  "about": "Engaging About section telling candidate's career story and key achievements...",
  "recommendedSkills": ["TopSkill1", "TopSkill2", "TopSkill3", "TopSkill4", "TopSkill5"]
}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
        })
      });

      if (!res.ok) throw new Error('Gemini API failed');
      const data = await res.json();
      const cleanJson = (data.candidates?.[0]?.content?.parts?.[0]?.text || '{}').replace(/```json/gi, '').replace(/```/g, '').trim();
      setReport(JSON.parse(cleanJson));
      addToast('LinkedIn profile scored and rewritten!', 'success');
    } catch (err) {
      await refundCredits(cost, 'linkedin_optimization');
      addToast('Optimization failed. Credits refunded.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    addToast(`${label} copied to clipboard!`, 'info');
  };

  return (
    <div className="linkedin-page">
      {/* Header */}
      <div className="li-head">
        <div>
          <h1 className="li-title">LinkedIn optimizer</h1>
          <p className="li-sub">
            Score your profile free, then generate a recruiter-optimized rewrite from your resume.
          </p>
        </div>

        <a href="/app/dashboard" className="li-back-link">
          ← Dashboard
        </a>
      </div>

      {/* Main Card */}
      <div className="li-card">
        <div className="li-field-group">
          <label className="li-field-label">LinkedIn profile URL *</label>
          <input
            type="text"
            className="li-text-input"
            placeholder="https://www.linkedin.com/in/you/"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
          />
          <span className="li-field-help">
            We pull your live headline and About straight from your profile, then score and rewrite it.
          </span>
        </div>

        <div className="li-field-group">
          <label className="li-field-label">Target role (optional)</label>
          <input
            type="text"
            className="li-text-input"
            placeholder="Senior Machine Learning Engineer"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
          />
          <span className="li-field-help">
            Add a role to score how well your profile fits it — the score changes per role. Leave blank for a general profile score.
          </span>
        </div>

        <div style={{ marginTop: '24px' }}>
          <button
            className="li-score-btn"
            onClick={handleOptimize}
            disabled={isGenerating}
          >
            {isGenerating ? 'Scoring profile...' : 'Get my score'}
          </button>
        </div>
      </div>

      {/* Results */}
      {report && (
        <div className="li-results animate-fade-in">
          <div className="li-results-head">
            <div className="li-score-badge">Score: {report.score}/100</div>
            <h3 style={{ fontSize: '18px', color: 'var(--ds-text-primary)', margin: 0 }}>Optimized Copy</h3>
          </div>

          <div className="li-result-box">
            <div className="result-field-head">
              <strong>Headline</strong>
              <button className="copy-sm-btn" onClick={() => copyText(report.headline, 'Headline')}>Copy</button>
            </div>
            <div className="result-text">{report.headline}</div>
          </div>

          <div className="li-result-box">
            <div className="result-field-head">
              <strong>About Section</strong>
              <button className="copy-sm-btn" onClick={() => copyText(report.about, 'About section')}>Copy</button>
            </div>
            <textarea
              className="result-textarea"
              rows={6}
              value={report.about}
              onChange={(e) => setReport({ ...report, about: e.target.value })}
            />
          </div>
        </div>
      )}

      <style>{`
        .linkedin-page {
          max-width: 900px;
        }

        .li-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 28px;
        }
        .li-title {
          font-size: 26px;
          font-weight: 700;
          color: var(--ds-text-primary);
          margin: 0 0 6px 0;
        }
        .li-sub {
          font-size: 14px;
          color: var(--ds-text-secondary);
          margin: 0;
        }
        .li-back-link {
          font-size: 13px;
          color: var(--ds-text-muted);
          text-decoration: none;
        }
        .li-back-link:hover {
          color: var(--ds-text-primary);
        }

        .li-card {
          background: var(--ds-surface);
          border: 1px solid var(--ds-border);
          border-radius: 16px;
          padding: 28px;
          margin-bottom: 32px;
        }
        .li-field-group {
          margin-bottom: 20px;
        }
        .li-field-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: var(--ds-text-primary);
          margin-bottom: 8px;
        }
        .li-text-input {
          width: 100%;
          background: var(--ds-surface-secondary);
          border: 1px solid var(--ds-border);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 14px;
          color: var(--ds-text-primary);
          outline: none;
        }
        .li-text-input:focus {
          border-color: #3b82f6;
        }
        .li-field-help {
          display: block;
          font-size: 12px;
          color: var(--ds-text-muted);
          margin-top: 6px;
        }

        .li-score-btn {
          padding: 10px 22px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: var(--ds-radius-pill);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .li-score-btn:hover {
          background: #2563eb;
        }

        /* Results */
        .li-results {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .li-results-head {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .li-score-badge {
          padding: 6px 14px;
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          font-size: 14px;
          font-weight: 700;
          border-radius: var(--ds-radius-pill);
        }
        .li-result-box {
          background: var(--ds-surface);
          border: 1px solid var(--ds-border);
          border-radius: 12px;
          padding: 20px;
        }
        .result-field-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 14px;
          color: var(--ds-text-primary);
        }
        .copy-sm-btn {
          padding: 4px 10px;
          background: var(--ds-surface-secondary);
          border: 1px solid var(--ds-border);
          color: var(--ds-text-primary);
          border-radius: var(--ds-radius-pill);
          font-size: 12px;
          cursor: pointer;
        }
        .result-text {
          font-size: 14px;
          color: var(--ds-text-secondary);
          line-height: 1.5;
        }
        .result-textarea {
          width: 100%;
          background: var(--ds-surface-secondary);
          border: 1px solid var(--ds-border);
          border-radius: 8px;
          padding: 10px;
          color: var(--ds-text-primary);
          font-size: 14px;
          outline: none;
          resize: vertical;
        }
      `}</style>
    </div>
  );
}
