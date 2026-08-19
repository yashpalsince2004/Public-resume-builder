import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';

export default function CoverLetterGenerator() {
  const { profile, credits, deductCredits, refundCredits, addToast, CREDIT_COSTS } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('Professional');
  const [coverLetters, setCoverLetters] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);

  const cost = CREDIT_COSTS.cover_letter || 2;

  const handleGenerate = async () => {
    if (!company.trim() || !role.trim()) {
      addToast('Please enter Company Name and Role Title.', 'warning');
      return;
    }

    if (credits < cost) {
      addToast(`Insufficient credits! You need ${cost} credits to generate a cover letter.`, 'error');
      return;
    }

    const costRes = await deductCredits(cost, 'cover_letter');
    if (!costRes.success) return;

    setIsGenerating(true);

    try {
      const apiKey = import.meta.env.PUBLIC_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';
      if (!apiKey) throw new Error('Gemini API key missing');

      const prompt = `You are an expert Executive Career Coach & Professional Cover Letter Writer.
Write a highly compelling, tailored, grounded Cover Letter for the candidate applying at ${company}.

CANDIDATE FACTS:
Name: ${profile.name || 'Candidate'}
Current Title: ${profile.title || 'Engineer'}
Summary: ${profile.summary || ''}
Skills: ${(profile.skills || []).join(', ')}
Experience: ${JSON.stringify(profile.experience || [])}

TARGET APPLICATION:
Company: ${company}
Role: ${role}
Job Description: ${jobDescription || 'N/A'}
Tone: ${tone}

Return ONLY raw cover letter text with paragraph breaks.`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 }
        })
      });

      if (!res.ok) throw new Error('Gemini API failed');
      const data = await res.json();
      const text = (data.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();

      const newLetter = {
        id: `cl_${Date.now()}`,
        company,
        role,
        text,
        createdAt: new Date().toISOString(),
      };

      setCoverLetters([newLetter, ...coverLetters]);
      setShowModal(false);
      setSelectedLetter(newLetter);
      setCompany('');
      setRole('');
      setJobDescription('');
      addToast('Cover letter generated!', 'success');
    } catch (err) {
      await refundCredits(cost, 'cover_letter');
      addToast('Generation failed. Credits refunded.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addToast('Cover letter copied to clipboard!', 'info');
  };

  return (
    <div className="cover-letters-page">
      {/* Header */}
      <div className="cl-head">
        <div>
          <h1 className="cl-title">Cover letters</h1>
          <p className="cl-sub">
            Every cover letter you've generated. Open one to edit, copy, or download it.
          </p>
        </div>

        <button
          className="cl-new-btn"
          onClick={() => setShowModal(true)}
        >
          New cover letter
        </button>
      </div>

      {/* Main List / Empty State */}
      {coverLetters.length === 0 ? (
        <div className="cl-empty-box">
          <h3 className="empty-title">No cover letters yet</h3>
          <p className="empty-sub">
            Generate a tailored cover letter from a job description and your master resume.
          </p>

          <button
            className="cl-new-btn center-btn"
            onClick={() => setShowModal(true)}
          >
            New cover letter
          </button>
        </div>
      ) : (
        <div className="cl-grid">
          {coverLetters.map((cl) => (
            <div key={cl.id} className="cl-card" onClick={() => setSelectedLetter(cl)}>
              <div className="cl-card-company">{cl.company}</div>
              <div className="cl-card-role">{cl.role}</div>
              <div className="cl-card-date">{new Date(cl.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}

      {/* New Cover Letter Modal */}
      {showModal && (
        <div className="ds-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ds-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--ds-text-primary)' }}>New Cover Letter</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div style={{ padding: '24px' }}>
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g. Google, Stripe"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role Title *</label>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="e.g. Senior Software Engineer"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job Description (Optional)</label>
                <textarea
                  className="modal-textarea"
                  rows={4}
                  placeholder="Paste job description for higher precision..."
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tone</label>
                <select
                  className="modal-input"
                  value={tone}
                  onChange={e => setTone(e.target.value)}
                >
                  <option value="Professional">Professional & Direct</option>
                  <option value="Confident">Confident & Impactful</option>
                  <option value="Technical">Technical & Precise</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button className="modal-cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="cl-new-btn" onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? 'Generating...' : 'Generate letter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Cover Letter Modal */}
      {selectedLetter && (
        <div className="ds-modal-overlay" onClick={() => setSelectedLetter(null)}>
          <div className="ds-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--ds-text-primary)' }}>{selectedLetter.company}</h3>
                <span style={{ fontSize: '13px', color: 'var(--ds-text-muted)' }}>{selectedLetter.role}</span>
              </div>
              <button className="modal-close" onClick={() => setSelectedLetter(null)}>✕</button>
            </div>

            <div style={{ padding: '24px' }}>
              <textarea
                className="modal-textarea"
                rows={14}
                value={selectedLetter.text}
                onChange={e => setSelectedLetter({ ...selectedLetter, text: e.target.value })}
                style={{ lineHeight: '1.6', fontFamily: 'var(--ds-font)' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button className="modal-cancel-btn" onClick={() => copyToClipboard(selectedLetter.text)}>Copy text</button>
                <button className="cl-new-btn" onClick={() => setSelectedLetter(null)}>Done</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .cover-letters-page {
          max-width: 900px;
        }

        .cl-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 28px;
        }
        .cl-title {
          font-size: 26px;
          font-weight: 700;
          color: var(--ds-text-primary);
          margin: 0 0 6px 0;
        }
        .cl-sub {
          font-size: 14px;
          color: var(--ds-text-secondary);
          margin: 0;
        }

        .cl-new-btn {
          display: inline-flex;
          align-items: center;
          padding: 10px 22px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: var(--ds-radius-pill);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }
        .cl-new-btn:hover {
          background: #2563eb;
        }
        .cl-new-btn.center-btn {
          margin-top: 20px;
        }

        /* Empty state */
        .cl-empty-box {
          background: var(--ds-surface);
          border: 1px dashed var(--ds-border-strong);
          border-radius: 16px;
          padding: 56px 24px;
          text-align: center;
        }
        .empty-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--ds-text-primary);
          margin: 0 0 6px 0;
        }
        .empty-sub {
          font-size: 13px;
          color: var(--ds-text-muted);
          margin: 0;
        }

        .cl-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .cl-card {
          background: var(--ds-surface);
          border: 1px solid var(--ds-border);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
        }
        .cl-card-company {
          font-size: 16px;
          font-weight: 600;
          color: var(--ds-text-primary);
          margin-bottom: 2px;
        }
        .cl-card-role {
          font-size: 13px;
          color: var(--ds-text-secondary);
          margin-bottom: 12px;
        }
        .cl-card-date {
          font-size: 11px;
          color: var(--ds-text-muted);
        }

        /* Modal elements */
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--ds-border);
        }
        .modal-close {
          background: none;
          border: none;
          color: var(--ds-text-muted);
          font-size: 18px;
          cursor: pointer;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: var(--ds-text-secondary);
          margin-bottom: 6px;
        }
        .modal-input {
          width: 100%;
          background: var(--ds-surface-secondary);
          border: 1px solid var(--ds-border);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          color: var(--ds-text-primary);
          outline: none;
        }
        .modal-textarea {
          width: 100%;
          background: var(--ds-surface-secondary);
          border: 1px solid var(--ds-border);
          border-radius: 10px;
          padding: 12px;
          font-size: 14px;
          color: var(--ds-text-primary);
          outline: none;
          resize: vertical;
        }
        .modal-cancel-btn {
          padding: 10px 20px;
          background: var(--ds-surface-secondary);
          border: 1px solid var(--ds-border);
          color: var(--ds-text-primary);
          border-radius: var(--ds-radius-pill);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
