import { useState } from 'react';
import { Card } from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Textarea from '../ui/Textarea.jsx';
import { useApp } from '../../context/AppContext.jsx';

const FAQS = [
  {
    q: 'What is ATS and how is my score estimated?',
    a: 'ATS (Applicant Tracking System) is automated software used by recruiters to rank candidate resumes. ResumeBuilder estimates your match score using deterministic keyword analysis, skill overlap, experience alignment, and structural readiness.',
  },
  {
    q: 'Does the AI ever invent or fabricate experience?',
    a: 'No. ResumeBuilder operates on a strict Evidence-First principle. The AI only rewrites, reorders, and highlights verifiable background facts present in your Master Resume.',
  },
  {
    q: 'How do credits work?',
    a: 'Credits are deducted when you perform AI generation tasks (e.g. 3 credits for resume tailoring, 2 credits for cover letters). Job scans and PDF downloads are completely free (0 credits). If an AI operation fails, your credits are automatically refunded.',
  },
  {
    q: 'Can I edit the generated resume before downloading?',
    a: 'Yes! You have full inline editing control over every section, title, bullet point, and skill before exporting to PDF or DOCX.',
  },
  {
    q: 'How do I export my data or delete my account?',
    a: 'You can export your complete Master Resume as a JSON file at any time from Profile & Account settings. You also have full control to request account deletion.',
  },
];

export default function HelpPage() {
  const { addToast } = useApp();
  const [openFaq, setOpenFaq] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    addToast('Thank you for your feedback!', 'success');
    setFeedback('');
  };

  return (
    <div className="help-container">
      <div className="help-header">
        <h1 className="help-title">Help & Feedback</h1>
        <p className="help-subtitle">Frequently asked questions, product guidance, and customer support.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--ds-space-6)' }}>
        {/* FAQs */}
        <div>
          <h2 style={{ fontSize: 'var(--ds-text-lg)', fontWeight: 600, margin: '0 0 var(--ds-space-4)' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-3)' }}>
            {FAQS.map((faq, i) => (
              <Card key={i} padding={false}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    color: 'var(--ds-text-primary)',
                    fontSize: 'var(--ds-text-sm)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>{faq.q}</span>
                  <span style={{ fontSize: '18px', color: 'var(--ds-text-muted)' }}>{openFaq === i ? '−' : '+'}</span>
                </button>

                {openFaq === i && (
                  <div style={{ padding: '0 16px 16px 16px', fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-muted)', lineHeight: 1.6, borderTop: '1px solid var(--ds-border)' }}>
                    {faq.a}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Feedback Form */}
        <div>
          <Card>
            <h3 style={{ fontSize: 'var(--ds-text-md)', margin: '0 0 var(--ds-space-4)' }}>Send Feedback or Report Issue</h3>
            <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-4)' }}>
              <Input label="Your Email" placeholder="email@example.com" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
              <Textarea label="Feedback / Question" placeholder="Tell us how we can improve..." rows={5} value={feedback} onChange={e => setFeedback(e.target.value)} />
              <Button variant="primary" type="submit" fullWidth disabled={!feedback.trim()}>
                Submit Feedback
              </Button>
            </form>
          </Card>
        </div>
      </div>

      <style>{`
        .help-container { max-width: 1100px; }
        .help-header { margin-bottom: var(--ds-space-6); }
        .help-title { font-size: var(--ds-text-2xl); font-weight: 700; color: var(--ds-text-primary); margin: 0; }
        .help-subtitle { font-size: var(--ds-text-sm); color: var(--ds-text-muted); margin: 4px 0 0; }
        @media (max-width: 768px) { .help-container > div { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
