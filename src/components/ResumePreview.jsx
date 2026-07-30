import { useRef, useState } from 'react';
import { exportToPDF, copyResumeText } from '../utils/pdfExport.js';

/**
 * Resume Preview Component
 *
 * Renders the generated resume in a clean, ATS-friendly format.
 * Supports PDF export and copy-to-clipboard.
 */
const renderContactIcon = (type) => {
  switch (type) {
    case 'email':
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="contact-icon">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
    case 'phone':
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="contact-icon">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case 'location':
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="contact-icon">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case 'portfolio':
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="contact-icon">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="contact-icon">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      );
    case 'github':
      return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="contact-icon">
          <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
        </svg>
      );
    default:
      return null;
  }
};

export default function ResumePreview({ resume, matchedKeywords, onBack }) {
  const resumeRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  if (!resume) return null;

  const { header, professionalTitle, summary, skills, experience, projects, education, certifications, achievements, links } = resume;

  // Build filename
  const pdfFilename = [
    header.name?.replace(/\s+/g, '_') || 'Resume',
    professionalTitle?.replace(/[^a-zA-Z0-9]/g, '_') || '',
  ].filter(Boolean).join('_');

  const handleExportPDF = async () => {
    if (!resumeRef.current || isExporting) return;
    setIsExporting(true);
    try {
      await exportToPDF(resumeRef.current, pdfFilename);
    } catch (err) {
      console.error('PDF export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    if (!resumeRef.current) return;
    const success = await copyResumeText(resumeRef.current);
    if (success) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Set of matched keywords for highlighting
  const matchedSet = new Set((matchedKeywords || []).map(kw => kw.keyword.toLowerCase()));

  return (
    <div className="preview-wrapper">
      {/* Action bar */}
      <div className="preview-actions">
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          ← Back
        </button>
        <div className="preview-actions-right">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCopy}
          >
            {copySuccess ? '✅ Copied!' : '📋 Copy Text'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            {isExporting ? '⏳ Exporting...' : '📄 Download PDF'}
          </button>
        </div>
      </div>

      {/* Resume Document */}
      <div className="resume-document-wrapper">
        <div className="resume-preview" ref={resumeRef}>
          {/* Header */}
          <div className="resume-header-section">
            <h1>{header.name}</h1>
            {professionalTitle && (
              <p className="resume-title-line">{professionalTitle}</p>
            )}
            <div className="sheet-contact-line">
              {[
                header.location && { type: 'location', label: header.location },
                header.email && { type: 'email', label: header.email },
                header.phone && { type: 'phone', label: header.phone },
                header.portfolio && { type: 'portfolio', label: header.portfolio },
                header.linkedin && { type: 'linkedin', label: header.linkedin },
                header.github && { type: 'github', label: header.github },
              ].filter(Boolean).map((item, idx) => (
                <span key={idx} className="contact-chunk">
                  {idx > 0 && <span className="contact-separator">|</span>}
                  <span className="contact-item">
                    {renderContactIcon(item.type)}
                    <span>{item.label}</span>
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Summary */}
          {summary && (
            <div>
              <h2>Professional Summary</h2>
              <p>{summary}</p>
            </div>
          )}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <div>
              <h2>Technical Skills</h2>
              <p>{skills.join('  •  ')}</p>
            </div>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <div>
              <h2>Professional Experience</h2>
              {experience.map((exp, i) => (
                <div key={i} className="resume-entry">
                  <div className="resume-entry-header">
                    <h3>{exp.title}{exp.company ? ` — ${exp.company}` : ''}</h3>
                    <span className="resume-date">
                      {[exp.startDate, exp.endDate].filter(Boolean).join(' – ')}
                    </span>
                  </div>
                  {exp.location && <p className="resume-location">{exp.location}</p>}
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul>
                      {exp.bullets.filter(Boolean).map((bullet, bi) => (
                        <li key={bi}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div>
              <h2>Projects</h2>
              {projects.map((proj, i) => (
                <div key={i} className="resume-entry">
                  <div className="resume-entry-header">
                    <h3>
                      {proj.name}
                      {proj.link && (
                        <span className="resume-link"> — {proj.link}</span>
                      )}
                    </h3>
                  </div>
                  {proj.description && <p>{proj.description}</p>}
                  {proj.technologies && proj.technologies.length > 0 && (
                    <p className="resume-tech"><strong>Technologies:</strong> {proj.technologies.join(', ')}</p>
                  )}
                  {proj.highlights && proj.highlights.length > 0 && (
                    <ul>
                      {proj.highlights.filter(Boolean).map((h, hi) => (
                        <li key={hi}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div>
              <h2>Education</h2>
              {education.map((edu, i) => (
                <div key={i} className="resume-entry">
                  <div className="resume-entry-header">
                    <h3>
                      {[edu.degree, edu.field].filter(Boolean).join(' in ')}
                      {edu.institution ? ` — ${edu.institution}` : ''}
                    </h3>
                    {edu.year && <span className="resume-date">{edu.year}</span>}
                  </div>
                  {edu.gpa && <p>GPA: {edu.gpa}</p>}
                  {edu.coursework && edu.coursework.length > 0 && (
                    <p><strong>Relevant Coursework:</strong> {edu.coursework.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <div>
              <h2>Certifications</h2>
              <ul>
                {certifications.map((cert, i) => (
                  <li key={i}>
                    {cert.name}
                    {cert.issuer ? ` — ${cert.issuer}` : ''}
                    {cert.date ? ` (${cert.date})` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Achievements */}
          {achievements && achievements.length > 0 && (
            <div>
              <h2>Achievements</h2>
              <ul>
                {achievements.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Links */}
          {links && Object.keys(links).length > 0 && (
            <div>
              <h2>Links</h2>
              <p>
                {Object.entries(links).map(([label, url], i) => (
                  <span key={i}>
                    {i > 0 && '  •  '}
                    <strong>{label}:</strong> {url}
                  </span>
                ))}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Matched keywords footer */}
      {matchedKeywords && matchedKeywords.length > 0 && (
        <div className="matched-keywords-footer glass-card-static">
          <h3 className="panel-title">✅ Keywords Found in Your Resume ({matchedKeywords.length})</h3>
          <div className="tags-container">
            {matchedKeywords.slice(0, 30).map((kw, i) => (
              <span key={i} className="tag tag-success">{kw.keyword}</span>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .preview-wrapper {
          display: flex;
          flex-direction: column;
          gap: var(--space-lg);
        }

        .preview-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: var(--space-sm);
        }

        .preview-actions-right {
          display: flex;
          gap: var(--space-sm);
        }

        .resume-document-wrapper {
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }

        /* Resume document internal styles */
        .resume-preview .resume-header-section {
          text-align: center;
          margin-bottom: 0.75rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .resume-preview .resume-title-line {
          font-size: 1.0625rem;
          font-weight: 500;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .resume-preview .resume-entry {
          margin-bottom: 0.75rem;
        }

        .resume-preview .resume-entry-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .resume-preview .resume-date {
          font-size: 0.8125rem;
          color: #6b7280;
          white-space: nowrap;
        }

        .resume-preview .resume-location {
          font-size: 0.8125rem;
          color: #6b7280;
          font-style: italic;
          margin-bottom: 0.25rem;
        }

        .resume-preview .resume-link {
          font-weight: 400;
          font-size: 0.8125rem;
          color: #6b7280;
        }

        .resume-preview .resume-tech {
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .matched-keywords-footer {
          margin-top: var(--space-sm);
        }

        .matched-keywords-footer .panel-title {
          margin-bottom: var(--space-sm);
          font-size: 0.875rem;
        }

        @media (max-width: 640px) {
          .preview-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .preview-actions-right {
            justify-content: stretch;
          }

          .preview-actions-right .btn {
            flex: 1;
          }

          .resume-preview .resume-entry-header {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
