import { useState, useRef, useEffect } from 'react';
import { printResume, copyResumeText } from '../utils/printExport.js';
import { exportToWord } from '../utils/docxExport.js';
import { generateLatexResume, downloadLatexFile } from '../utils/latexGenerator.js';
import RateLimitModal from './RateLimitModal.jsx';
import {
  regenerateResumeToFixCritique,
  evaluateResumeWithGemini,
} from '../engine/geminiKeywordExtractor.js';

// Simple translations dictionary for header titles & section names matching template.tex
const TRANSLATIONS = {
  en: {
    title: 'Professional Summary',
    skills: 'Technologies',
    experience: 'Experience',
    projects: 'Projects',
    education: 'Education',
    certifications: 'Certifications',
    achievements: 'Achievements',
    present: 'Present',
  },
  es: {
    title: 'Resumen Profesional',
    skills: 'Tecnologías',
    experience: 'Experiencia',
    projects: 'Proyectos',
    education: 'Educación',
    certifications: 'Certificaciones',
    achievements: 'Logros',
    present: 'Presente',
  },
  fr: {
    title: 'Résumé Professionnel',
    skills: 'Technologies',
    experience: 'Expérience',
    projects: 'Projets',
    education: 'Éducation',
    certifications: 'Certifications',
    achievements: 'Réalisations',
    present: 'Présent',
  },
  de: {
    title: 'Berufliche Zusammenfassung',
    skills: 'Technologien',
    experience: 'Berufserfahrung',
    projects: 'Projekte',
    education: 'Ausbildung',
    certifications: 'Zertifizierungen',
    achievements: 'Erfolge',
    present: 'Heute',
  },
  hi: {
    title: 'प्रोफेशनल सारांश',
    skills: 'प्रौद्योगिकी',
    experience: 'अनुभव',
    projects: 'प्रोजेक्ट्स',
    education: 'शिक्षा',
    certifications: 'प्रमाणपत्र',
    achievements: 'उपलब्धियां',
    present: 'वर्तमान',
  },
};

const renderContactIcon = (type) => {
  switch (type) {
    case 'email':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="contact-icon">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
    case 'phone':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="contact-icon">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case 'location':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="contact-icon">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    case 'portfolio':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="contact-icon">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="contact-icon">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      );
    case 'github':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="contact-icon">
          <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
        </svg>
      );
    default:
      return null;
  }
};

function getContactHref(type, label) {
  if (!label) return '#';
  if (type === 'email') return `mailto:${label}`;
  if (type === 'phone') return `tel:${label.replace(/[^0-9+]/g, '')}`;

  if (type === 'linkedin') {
    if (label.startsWith('http://') || label.startsWith('https://')) return label;
    if (label.includes('linkedin.com')) return `https://${label.replace(/^https?:\/\//, '')}`;
    const cleanUser = label.replace(/\/$/, '').replace(/^in\//, '');
    return `https://linkedin.com/in/${cleanUser}`;
  }

  if (type === 'github') {
    if (label.startsWith('http://') || label.startsWith('https://')) return label;
    if (label.includes('github.com')) return `https://${label.replace(/^https?:\/\//, '')}`;
    const cleanUser = label.replace(/\/$/, '');
    return `https://github.com/${cleanUser}`;
  }

  if (label.startsWith('http://') || label.startsWith('https://')) return label;
  return `https://${label.replace(/^(https?:\/\/)?/, '')}`;
}

function getContactDisplay(type, label) {
  if (!label) return '';
  if (type === 'email' || type === 'phone' || type === 'location') return label;

  const clean = label.replace(/^https?:\/\//, '').replace(/\/$/, '');

  if (type === 'linkedin' || type === 'github') {
    const parts = clean.split('/');
    const lastPart = parts[parts.length - 1] || clean;
    return lastPart;
  }

  return clean;
}

function formatDisplayLink(link) {
  if (!link || typeof link !== 'string') return '';
  const cleanLink = link.replace(/\/$/, '');
  const parts = cleanLink.split('/');
  return parts[parts.length - 1] || cleanLink;
}

function formatSafeList(items) {
  if (!items) return '';
  if (typeof items === 'string') return items;
  if (Array.isArray(items)) {
    return items
      .map(item => (typeof item === 'string' ? item : item?.name || item?.label || item?.skill || String(item || '')))
      .filter(Boolean)
      .join(', ');
  }
  if (typeof items === 'object') {
    return Object.values(items)
      .flat()
      .map(item => (typeof item === 'string' ? item : item?.name || item?.label || ''))
      .filter(Boolean)
      .join(', ');
  }
  return String(items);
}

/**
 * Dynamic A4 pagination calculator:
 * Determines section & item distribution so Page 1 is filled down to the margin
 * before spilling over to Page 2. If all content fits within 1 page height,
 * hasPage2Content is false and totalPages is 1.
 */
function calculateResumePagination({
  summary,
  safeEducation,
  safeExperience,
  safeProjects,
  safeSkills,
  safeCertifications,
}) {
  const headerLines = 4;
  const summaryLines = summary ? Math.ceil(summary.length / 90) + 2 : 0;
  const eduLines = safeEducation.reduce((acc, edu) => acc + 3 + (edu.coursework ? 1 : 0), 0) + (safeEducation.length > 0 ? 1 : 0);
  const expLines = safeExperience.reduce((acc, exp) => acc + 2 + (Array.isArray(exp.bullets) ? exp.bullets.filter(Boolean).length : 0), 0) + (safeExperience.length > 0 ? 1 : 0);

  const projLines = safeProjects.reduce((acc, proj) => {
    let count = 2;
    if (proj.description) count += Math.ceil(proj.description.length / 90);
    if (Array.isArray(proj.highlights)) count += proj.highlights.filter(Boolean).length;
    if (proj.technologies) count += 1;
    return acc + count;
  }, 0) + (safeProjects.length > 0 ? 1 : 0);

  const skillLines = (safeSkills && safeSkills.length > 0) ? 3 : 0;
  const certLines = safeCertifications.length > 0 ? (1 + safeCertifications.length) : 0;

  const page1BaseLines = headerLines + summaryLines + eduLines + expLines;
  const totalLines = page1BaseLines + projLines + skillLines + certLines;

  // Standard A4 page printable capacity (approx 54 lines of formatted text)
  const PAGE_1_CAPACITY = 54;

  if (totalLines <= PAGE_1_CAPACITY) {
    return {
      hasPage2Content: false,
      page1Projects: safeProjects,
      page2Projects: [],
      page1Skills: safeSkills,
      page2Skills: [],
      page1Certifications: safeCertifications,
      page2Certifications: [],
    };
  }

  // Multi-page resume: Distribute projects and sections between Page 1 and Page 2
  let currentLines = page1BaseLines + (safeProjects.length > 0 ? 1 : 0);
  const page1Projects = [];
  const page2Projects = [];

  safeProjects.forEach((proj) => {
    let pCount = 2;
    if (proj.description) pCount += Math.ceil(proj.description.length / 90);
    if (Array.isArray(proj.highlights)) pCount += proj.highlights.filter(Boolean).length;
    if (proj.technologies) pCount += 1;

    if (currentLines + pCount <= PAGE_1_CAPACITY && page2Projects.length === 0) {
      page1Projects.push(proj);
      currentLines += pCount;
    } else {
      page2Projects.push(proj);
    }
  });

  let page1Skills = [];
  let page2Skills = [];
  if (page2Projects.length === 0 && currentLines + skillLines <= PAGE_1_CAPACITY) {
    page1Skills = safeSkills;
    currentLines += skillLines;
  } else {
    page2Skills = safeSkills;
  }

  let page1Certifications = [];
  let page2Certifications = [];
  if (page2Projects.length === 0 && page2Skills.length === 0 && currentLines + certLines <= PAGE_1_CAPACITY) {
    page1Certifications = safeCertifications;
  } else {
    page2Certifications = safeCertifications;
  }

  const hasPage2Content = page2Projects.length > 0 || page2Skills.length > 0 || page2Certifications.length > 0;

  return {
    hasPage2Content,
    page1Projects,
    page2Projects,
    page1Skills,
    page2Skills,
    page1Certifications,
    page2Certifications,
  };
}

export default function ResumeBuilderScreen2({
  resume: initialResume,
  atsScore: initialAtsScore,
  jobDescription,
  profile,
  companyInfo,
  exactRequirements,
  onBackToEdit,
}) {
  const resumeRef = useRef(null);
  const [lang] = useState('en');
  const [isLatexModalOpen, setIsLatexModalOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [copied, setCopied] = useState(false);
  const [latexCopied, setLatexCopied] = useState(false);

  // A4 Page Slider State (0 = Page 1, 1 = Page 2)
  const [previewPage, setPreviewPage] = useState(0);

  // Resume Versions State
  const [versions, setVersions] = useState([
    {
      id: 1,
      label: `Version 1 (${initialAtsScore?.overall ?? 0}% ATS)`,
      resume: initialResume,
      atsScore: initialAtsScore,
    },
  ]);
  const [activeVersionIndex, setActiveVersionIndex] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState(null);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState('Rate limit exceeded');

  // Sync if initialResume changes from parent
  useEffect(() => {
    if (initialResume) {
      setVersions([
        {
          id: 1,
          label: `Version 1 (${initialAtsScore?.overall ?? 0}% ATS)`,
          resume: initialResume,
          atsScore: initialAtsScore,
        },
      ]);
      setActiveVersionIndex(0);
      setPreviewPage(0);
    }
  }, [initialResume, initialAtsScore]);

  const currentVersion = versions[activeVersionIndex] || versions[0];
  const resume = currentVersion?.resume || initialResume || {};
  const atsScore = currentVersion?.atsScore || initialAtsScore || {};
  const t = TRANSLATIONS.en;
  const { header = {}, professionalTitle = '', summary = '', skills = [], experience = [], projects = [], education = [], certifications = [] } = resume;

  // Fallbacks to profile.json to guarantee no section is lost
  const safeSkills = (Array.isArray(skills) && skills.length > 0) ? skills : (profile?.skills || []);
  const safeProjects = (Array.isArray(projects) && projects.length > 0) ? projects : (profile?.projects || []);
  const safeCertifications = (Array.isArray(certifications) && certifications.length > 0) ? certifications : (profile?.certifications || []);
  const safeExperience = (Array.isArray(experience) && experience.length > 0) ? experience : (profile?.experience || []);
  const safeEducation = (Array.isArray(education) && education.length > 0) ? education : (profile?.education || []);

  // Dynamic page calculation: Fill Page 1 down to margin before spilling to Page 2
  const {
    hasPage2Content,
    page1Projects,
    page2Projects,
    page1Skills,
    page2Skills,
    page1Certifications,
    page2Certifications,
  } = calculateResumePagination({
    summary,
    safeEducation,
    safeExperience,
    safeProjects,
    safeSkills,
    safeCertifications,
  });
  const totalPages = hasPage2Content ? 2 : 1;

  const scoreVal = atsScore?.overall ?? 0;
  const filename = `${header?.name || 'Resume'}_v${activeVersionIndex + 1}_${professionalTitle || 'Tailored'}`;
  const latexCode = generateLatexResume(resume);

  // Regenerate to address Harsh ATS Feedback
  const handleRegenerateToFix = async () => {
    if (isRegenerating || !jobDescription) return;

    setIsRegenerating(true);
    setRegenerateError(null);

    try {
      const revisedResume = await regenerateResumeToFixCritique(
        jobDescription,
        resume,
        atsScore?.harshCritique || [],
        profile
      );

      const newScore = await evaluateResumeWithGemini(jobDescription, revisedResume);

      const newVersionNum = versions.length + 1;
      const newVersionItem = {
        id: newVersionNum,
        label: `Version ${newVersionNum} (${newScore.overall}% ATS)`,
        resume: revisedResume,
        atsScore: newScore,
      };

      const updatedVersions = [...versions, newVersionItem];
      setVersions(updatedVersions);
      setActiveVersionIndex(updatedVersions.length - 1);
      setPreviewPage(0);
    } catch (err) {
      console.error('Regeneration error:', err);
      const msg = err.message || '';
      setRegenerateError(msg || 'Failed to regenerate resume');
      if (
        msg.toLowerCase().includes('quota') ||
        msg.toLowerCase().includes('rate') ||
        msg.toLowerCase().includes('429') ||
        msg.toLowerCase().includes('limit') ||
        msg.toLowerCase().includes('resource_exhausted')
      ) {
        setRateLimitMessage('Rate limit exceeded. Please wait a few moments and try again.');
        setShowRateLimitModal(true);
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  const handlePrevVersion = () => {
    if (activeVersionIndex > 0) {
      setActiveVersionIndex(activeVersionIndex - 1);
      setPreviewPage(0);
    }
  };

  const handleNextVersion = () => {
    if (activeVersionIndex < versions.length - 1) {
      setActiveVersionIndex(activeVersionIndex + 1);
      setPreviewPage(0);
    }
  };

  // PDF Export (Native Browser Vector Print Engine)
  const handlePdfDownload = () => {
    printResume();
  };

  // Word Export
  const handleWordDownload = async () => {
    if (isExportingWord) return;
    setIsExportingWord(true);
    try {
      await exportToWord(resume, filename);
    } catch (e) {
      console.error('Word export error:', e);
    } finally {
      setIsExportingWord(false);
    }
  };

  // LaTeX Download
  const handleLatexDownload = () => {
    downloadLatexFile(resume, filename);
  };

  // Copy LaTeX code to clipboard
  const handleCopyLatex = async () => {
    try {
      await navigator.clipboard.writeText(latexCode);
      setLatexCopied(true);
      setTimeout(() => setLatexCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  // Copy plaintext resume
  const handleCopyText = async () => {
    const success = await copyResumeText(resumeRef.current);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="screen-2-container animate-fade-in">
      {/* Top Bar Navigation */}
      <div className="screen-2-topbar">
        <button type="button" className="btn-apple-secondary" onClick={onBackToEdit}>
          ← Edit Job Description
        </button>

        <div className="topbar-right">
          <button type="button" className="btn-apple-utility" onClick={() => setIsLatexModalOpen(true)}>
            {'{ }'} View LaTeX Code
          </button>
          <button type="button" className="btn-apple-utility" onClick={handleCopyText}>
            {copied ? '✓ Copied' : '📋 Copy Text'}
          </button>
        </div>
      </div>

      {/* VERSION SLIDER / SWITCHER TOOLBAR */}
      <div className="version-switcher-bar apple-card">
        <div className="version-nav-info">
          <span className="version-title-tag">Resume Variations ({versions.length}):</span>
          <div className="version-tabs">
            {versions.map((ver, idx) => (
              <button
                key={ver.id}
                type="button"
                className={`version-tab-btn ${idx === activeVersionIndex ? 'active' : ''}`}
                onClick={() => {
                  setActiveVersionIndex(idx);
                  setPreviewPage(0);
                }}
              >
                {ver.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sliding Arrows for Versions */}
        <div className="version-slide-controls">
          <button
            type="button"
            className="btn-version-arrow"
            onClick={handlePrevVersion}
            disabled={activeVersionIndex === 0}
            title="Previous version"
          >
            ← Prev
          </button>
          <span className="version-counter">
            {activeVersionIndex + 1} / {versions.length}
          </span>
          <button
            type="button"
            className="btn-version-arrow"
            onClick={handleNextVersion}
            disabled={activeVersionIndex === versions.length - 1}
            title="Next version"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Wireframe Screen 2 Grid */}
      <div className="screen-2-grid">
        {/* CENTER: Resume Preview Box */}
        <div className="resume-preview-box apple-card">
          {/* Header row */}
          <div className="preview-top-toolbar">
            <div className="preview-version-heading">
              <span className="preview-heading-tag">Print Preview (1:1 A4 Pages)</span>
              <span className="active-v-badge">Version {activeVersionIndex + 1}</span>
            </div>
          </div>

          {/* A4 PRINT PREVIEW VIEWPORT & HOVER CONTROLS */}
          <div className="a4-preview-viewport">
            {/* FLOATING HOVER PAGE SWITCHER AT BOTTOM */}
            <div className="a4-page-hover-controls">
              <button
                type="button"
                className="btn-a4-page-arrow"
                onClick={() => setPreviewPage(0)}
                disabled={previewPage === 0}
                title="Go to Page 1"
              >
                ‹ Page 1
              </button>
              <span className="a4-page-indicator">
                Page {previewPage + 1} of {totalPages}
              </span>
              <button
                type="button"
                className="btn-a4-page-arrow"
                onClick={() => setPreviewPage(1)}
                disabled={previewPage === totalPages - 1}
                title="Go to Page 2"
              >
                Page 2 ›
              </button>
            </div>

            {/* PRINT PREVIEW CONTAINER (Ref for PDF Export) */}
            <div className="print-preview-container" ref={resumeRef}>
              {/* PAGE 1 STANDALONE A4 SHEET */}
              <div className={`a4-print-page page-1 ${previewPage === 0 ? 'show-page' : 'hide-page'}`}>
                {/* Header */}
                <div className="sheet-header">
                  <h1 className="sheet-name">{header.name}</h1>
                  <div className="sheet-contact-line">
                    {[
                      header.location && { type: 'location', label: header.location },
                      header.email && { type: 'email', label: header.email },
                      header.phone && { type: 'phone', label: header.phone },
                      header.portfolio && { type: 'portfolio', label: header.portfolio },
                      header.linkedin && { type: 'linkedin', label: header.linkedin },
                      header.github && { type: 'github', label: header.github },
                    ].filter(Boolean).map((item, idx) => {
                      const href = getContactHref(item.type, item.label);
                      const text = getContactDisplay(item.type, item.label);
                      const isLink = item.type !== 'location';

                      return (
                        <span key={idx} className="contact-item">
                          {renderContactIcon(item.type)}
                          {isLink ? (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="sheet-link">
                              {text}
                            </a>
                          ) : (
                            <span>{text}</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* 1. Professional Summary */}
                {summary && (
                  <div className="sheet-section">
                    <h2 className="sheet-section-title">{t.title}</h2>
                    <div className="onecolentry-box">
                      <p className="sheet-summary">{summary}</p>
                    </div>
                  </div>
                )}

                {/* 2. Education Section */}
                {safeEducation.length > 0 && (
                  <div className="sheet-section">
                    <h2 className="sheet-section-title">{t.education}</h2>
                    {safeEducation.map((edu, i) => (
                      <div key={i} className="sheet-entry">
                        <div className="entry-twocol-header">
                          <div className="entry-left-col">
                            <strong className="entry-title-bold">{edu.institution}</strong>
                            <div className="entry-sub-italics">{[edu.degree, edu.field].filter(Boolean).join(' in ')}</div>
                          </div>
                          <div className="entry-right-col">
                            <span className="entry-meta-italics">{edu.year}</span>
                          </div>
                        </div>

                        {(edu.gpa || (edu.coursework && edu.coursework.length > 0)) && (
                          <div className="onecolentry-box">
                            <ul className="entry-highlights-list">
                              {edu.gpa && <li>GPA: {edu.gpa}</li>}
                              {edu.coursework && formatSafeList(edu.coursework) && (
                                <li><strong>Coursework:</strong> {formatSafeList(edu.coursework)}</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. Experience Section */}
                {safeExperience.length > 0 && (
                  <div className="sheet-section">
                    <h2 className="sheet-section-title">{t.experience}</h2>
                    {safeExperience.map((exp, i) => (
                      <div key={i} className="sheet-entry">
                        <div className="entry-twocol-header">
                          <div className="entry-left-col">
                            <strong className="entry-title-bold">{exp.title}</strong>
                            {exp.company && <div className="entry-sub-italics">{exp.company}</div>}
                          </div>
                          <div className="entry-right-col">
                            {exp.location && <div className="entry-meta-italics">{exp.location}</div>}
                            <div className="entry-meta-italics">{[exp.startDate, exp.endDate].filter(Boolean).join(' – ')}</div>
                          </div>
                        </div>

                        {exp.bullets && Array.isArray(exp.bullets) && (
                          <div className="onecolentry-box">
                            <ul className="entry-highlights-list">
                              {exp.bullets.filter(Boolean).map((bullet, bi) => (
                                <li key={bi}>{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* 4. Projects Section on Page 1 */}
                {page1Projects.length > 0 && (
                  <div className="sheet-section">
                    <h2 className="sheet-section-title">{t.projects}</h2>
                    {page1Projects.map((proj, i) => (
                      <div key={i} className="sheet-entry">
                        <div className="entry-twocol-header">
                          <div className="entry-left-col">
                            <strong className="entry-title-bold">{proj.name}</strong>
                          </div>
                          {proj.link && typeof proj.link === 'string' && (
                            <div className="entry-right-col">
                              <a
                                href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="entry-meta-italics sheet-link"
                              >
                                {formatDisplayLink(proj.link)}
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="onecolentry-box">
                          <ul className="entry-highlights-list">
                            {proj.description && <li>{proj.description}</li>}
                            {proj.highlights && Array.isArray(proj.highlights) && proj.highlights.filter(Boolean).map((h, hi) => (
                              <li key={hi}>{h}</li>
                            ))}
                            {proj.technologies && formatSafeList(proj.technologies) && (
                              <li><strong>Tools Used:</strong> {formatSafeList(proj.technologies)}</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 5. Technologies Section on Page 1 */}
                {page1Skills.length > 0 && formatSafeList(page1Skills) && (
                  <div className="sheet-section">
                    <h2 className="sheet-section-title">{t.skills}</h2>
                    <div className="onecolentry-box">
                      <p className="sheet-skills"><strong>Skills:</strong> {formatSafeList(page1Skills)}</p>
                    </div>
                  </div>
                )}

                {/* 6. Certifications Section on Page 1 */}
                {page1Certifications.length > 0 && (
                  <div className="sheet-section">
                    <h2 className="sheet-section-title">{t.certifications}</h2>
                    <div className="onecolentry-box">
                      <ul className="entry-highlights-list">
                        {page1Certifications.map((cert, i) => {
                          const name = typeof cert === 'string' ? cert : cert?.name || cert?.title || String(cert || '');
                          const issuer = typeof cert === 'object' && cert ? cert.issuer : '';
                          const date = typeof cert === 'object' && cert ? cert.date : '';
                          return (
                            <li key={i}>
                              {name}{issuer ? ` — ${issuer}` : ''}{date ? ` (${date})` : ''}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* PAGE 2 STANDALONE A4 SHEET (Rendered ONLY if hasPage2Content is true) */}
              {hasPage2Content && (
                <div className={`a4-print-page page-2 ${previewPage === 1 ? 'show-page' : 'hide-page'}`}>
                  {/* Projects Section on Page 2 */}
                  {page2Projects.length > 0 && (
                    <div className="sheet-section">
                      <h2 className="sheet-section-title">{t.projects}</h2>
                      {page2Projects.map((proj, i) => (
                        <div key={i} className="sheet-entry">
                          <div className="entry-twocol-header">
                            <div className="entry-left-col">
                              <strong className="entry-title-bold">{proj.name}</strong>
                            </div>
                            {proj.link && typeof proj.link === 'string' && (
                              <div className="entry-right-col">
                                <a
                                  href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="entry-meta-italics sheet-link"
                                >
                                  {formatDisplayLink(proj.link)}
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="onecolentry-box">
                            <ul className="entry-highlights-list">
                              {proj.description && <li>{proj.description}</li>}
                              {proj.highlights && Array.isArray(proj.highlights) && proj.highlights.filter(Boolean).map((h, hi) => (
                                <li key={hi}>{h}</li>
                              ))}
                              {proj.technologies && formatSafeList(proj.technologies) && (
                                <li><strong>Tools Used:</strong> {formatSafeList(proj.technologies)}</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Technologies Section on Page 2 */}
                  {page2Skills.length > 0 && formatSafeList(page2Skills) && (
                    <div className="sheet-section">
                      <h2 className="sheet-section-title">{t.skills}</h2>
                      <div className="onecolentry-box">
                        <p className="sheet-skills"><strong>Skills:</strong> {formatSafeList(page2Skills)}</p>
                      </div>
                    </div>
                  )}

                  {/* Certifications Section on Page 2 */}
                  {page2Certifications.length > 0 && (
                    <div className="sheet-section">
                      <h2 className="sheet-section-title">{t.certifications}</h2>
                      <div className="onecolentry-box">
                        <ul className="entry-highlights-list">
                          {page2Certifications.map((cert, i) => {
                            const name = typeof cert === 'string' ? cert : cert?.name || cert?.title || String(cert || '');
                            const issuer = typeof cert === 'object' && cert ? cert.issuer : '';
                            const date = typeof cert === 'object' && cert ? cert.date : '';
                            return (
                              <li key={i}>
                                {name}{issuer ? ` — ${issuer}` : ''}{date ? ` (${date})` : ''}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="screen-2-right-panel">
          {/* PDF Button */}
          <button
            type="button"
            className="btn-apple-primary btn-action-card"
            onClick={handlePdfDownload}
            disabled={isExportingPdf}
          >
            <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <polyline points="9 15 12 18 15 15" />
            </svg>
            <span>{isExportingPdf ? 'Generating PDF...' : 'PDF'}</span>
          </button>

          {/* Word Button */}
          <button
            type="button"
            className="btn-apple-secondary btn-action-card"
            onClick={handleWordDownload}
            disabled={isExportingWord}
          >
            <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M8 13l2 4 2-4 2 4 2-4" />
            </svg>
            <span>{isExportingWord ? 'Generating Word...' : 'Word'}</span>
          </button>

          {/* LaTeX (.tex) Button */}
          <button
            type="button"
            className="btn-apple-secondary btn-action-card btn-latex"
            onClick={handleLatexDownload}
          >
            <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>LaTeX (.tex)</span>
          </button>

          {/* HARSH ATS SCORE CARD */}
          <div className="ats-score-card apple-card">
            <div className="score-main-display">
              <span className="score-value">{scoreVal}</span>
              <span className="score-denom">/100</span>
            </div>
            <div className="score-title">Strict ATS Score</div>

            <div className="score-badge-row">
              <span className={`score-badge ${scoreVal >= 80 ? 'good' : scoreVal >= 65 ? 'fair' : 'poor'}`}>
                {atsScore?.grade ? `Grade ${atsScore.grade}` : scoreVal >= 80 ? 'Good Match' : 'Strict Review'}
              </span>
            </div>

            {/* Breakdown bars */}
            {atsScore?.breakdown && (
              <div className="score-breakdown-list">
                {Object.entries(atsScore.breakdown).map(([k, item]) => (
                  <div key={k} className="score-bar-row">
                    <div className="bar-labels">
                      <span className="bar-title">{item.label}</span>
                      <span className="bar-score">{item.score}%</span>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Harsh Critique Feedback Points */}
            {atsScore?.harshCritique && atsScore.harshCritique.length > 0 && (
              <div className="harsh-critique-section">
                <div className="critique-header">🔥 Harsh ATS Feedback</div>
                <ul className="critique-list">
                  {atsScore.harshCritique.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>

                {/* REGENERATE TO FIX HARSH FEEDBACK BUTTON */}
                <div className="regenerate-critique-box">
                  <button
                    type="button"
                    className="btn-apple-primary btn-regenerate-critique"
                    onClick={handleRegenerateToFix}
                    disabled={isRegenerating}
                  >
                    {isRegenerating ? (
                      <>
                        <span className="loading-spinner">✨</span>
                        <span>Fixing ATS Feedback...</span>
                      </>
                    ) : (
                      <>
                        <span>✨ Regenerate to Fix ATS Feedback</span>
                      </>
                    )}
                  </button>
                  {regenerateError && (
                    <div className="regen-error-text">⚠️ {regenerateError}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Gemini AI Insights Card */}
          {(companyInfo || exactRequirements) && (
            <div className="ai-insights-card apple-card">
              <div className="insights-header">
                <span>✨ Gemini 3.6 Flash Analysis</span>
              </div>

              {companyInfo?.name && (
                <div className="insight-section">
                  <div className="insight-label">Company & Industry</div>
                  <div className="insight-val-bold">{companyInfo.name}</div>
                  {companyInfo.domain && <div className="insight-val-sub">{companyInfo.domain}</div>}
                </div>
              )}

              {exactRequirements?.experienceYears && (
                <div className="insight-section">
                  <div className="insight-label">Required Experience</div>
                  <div className="insight-val">{exactRequirements.experienceYears}</div>
                </div>
              )}

              {exactRequirements?.requiredSkills && exactRequirements.requiredSkills.length > 0 && (
                <div className="insight-section">
                  <div className="insight-label">Key Requirements</div>
                  <div className="ai-skill-tags">
                    {exactRequirements.requiredSkills.slice(0, 6).map((req, i) => (
                      <span key={i} className="ai-req-tag">{req}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* LATEX CODE VIEW MODAL */}
      {isLatexModalOpen && (
        <div className="apple-modal-overlay">
          <div className="apple-modal-content latex-modal-content animate-fade-in">
            <div className="modal-header">
              <h2 className="display-md">LaTeX Source Code (template.tex format)</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsLatexModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <p className="body-lead" style={{ marginBottom: '16px', fontSize: '14px' }}>
              Copy or download this compilable LaTeX code based on <code>template.tex</code> to compile with Overleaf, pdflatex, or RenderCV.
            </p>

            <textarea
              className="apple-textarea latex-code-area"
              value={latexCode}
              readOnly
              rows={18}
            />

            <div className="modal-actions">
              <button
                type="button"
                className="btn-apple-secondary"
                onClick={handleCopyLatex}
              >
                {latexCopied ? '✓ Copied LaTeX' : '📋 Copy LaTeX Code'}
              </button>
              <button
                type="button"
                className="btn-apple-primary"
                onClick={handleLatexDownload}
              >
                📥 Download .tex File
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .screen-2-container {
          max-width: 1200px;
          margin: 24px auto;
          padding: 0 16px;
        }

        .screen-2-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .topbar-right {
          display: flex;
          gap: 10px;
        }

        /* Version Switcher Bar */
        .version-switcher-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          margin-bottom: 20px;
          background-color: var(--color-canvas);
          border: 1px solid var(--color-hairline);
        }

        .version-nav-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .version-title-tag {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-body-muted);
        }

        .version-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
        }

        .version-tab-btn {
          font-size: 12px;
          font-weight: 500;
          padding: 4px 12px;
          border-radius: var(--radius-pill);
          background-color: var(--color-surface-tile-2);
          border: 1px solid var(--color-hairline);
          color: var(--color-ink);
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }

        .version-tab-btn.active {
          background-color: rgba(0, 102, 204, 0.18);
          color: var(--color-primary-on-dark);
          border-color: var(--color-primary-on-dark);
          font-weight: 600;
        }

        .version-slide-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-version-arrow {
          background: var(--color-surface-tile-2);
          border: 1px solid var(--color-hairline);
          color: var(--color-ink);
          font-size: 12px;
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .btn-version-arrow:hover:not(:disabled) {
          background-color: var(--color-surface-tile-1);
          color: var(--color-primary-on-dark);
        }

        .btn-version-arrow:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .version-counter {
          font-size: 12px;
          color: var(--color-body-muted);
          font-weight: 600;
        }

        .screen-2-grid {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 24px;
          align-items: start;
        }

        /* Preview Box & A4 Viewport */
        .resume-preview-box {
          padding: 24px;
          position: relative;
        }

        .preview-top-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--color-hairline);
        }

        .preview-version-heading {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .preview-heading-tag {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 600;
          color: var(--color-ink);
        }

        .active-v-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
          background-color: rgba(41, 151, 255, 0.15);
          color: var(--color-primary-on-dark);
        }

        /* A4 PRINT PREVIEW VIEWPORT & HOVER CONTROLS */
        .a4-preview-viewport {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .print-preview-container {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }

        /* STANDALONE A4 PRINT PAGES (Screen Preview) */
        @media screen {
          .a4-print-page {
            width: 100%;
            max-width: 800px;
            min-height: 1020px; /* Full A4 Paper Ratio */
            background-color: #ffffff;
            color: #000000;
            padding: 28px 48px !important; /* Equal 48px side margins, 28px top/bottom */
            box-sizing: border-box;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
            border-radius: var(--radius-sm);
            margin: 0 auto;
            font-family: 'Latin Modern Roman', 'Computer Modern', 'Georgia', serif;
          }

          .hide-page {
            display: none !important;
          }

          .show-page {
            display: block !important;
            animation: fadeIn 0.25s ease forwards;
          }
        }

        /* 100% NATIVE VECTOR PRINT (Fixed Uniform Margins on All Sides) */
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            width: 100% !important;
            height: 100% !important;
          }

          /* Hide all UI toolbars, sidebars, navigation, modals, and buttons */
          .screen-2-topbar,
          .screen-2-right-panel,
          .version-switcher-bar,
          .a4-page-hover-controls,
          .btn-apple-primary,
          .btn-apple-secondary,
          .btn-apple-utility,
          header,
          footer,
          nav {
            display: none !important;
            visibility: hidden !important;
          }

          /* Reset layout containers to zero margin/padding */
          .screen-2-container,
          .screen-2-main-grid,
          .a4-preview-viewport {
            position: static !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            background: transparent !important;
          }

          /* Anchor print container directly to top-left 0,0 of physical A4 page */
          .print-preview-container {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          /* A4 Page Formatting: Fixed uniform margins on all sides */
          .a4-print-page {
            width: 210mm !important;
            box-sizing: border-box !important;
            padding: 10mm 15mm !important; /* Fixed uniform margins: 10mm top/bottom, 15mm left/right */
            margin: 0 auto !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            page-break-after: always !important;
            break-after: page !important;
          }

          .a4-print-page:last-child,
          .a4-print-page:only-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }

          /* Force all pages to render sequentially during print */
          .show-page,
          .hide-page {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
        }

        /* Clickable Sheet Links */
        .sheet-link {
          color: #000000 !important;
          text-decoration: none !important;
          cursor: pointer !important;
        }

        .sheet-link:hover {
          text-decoration: underline !important;
        }

        .a4-page-hover-controls {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 40;
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(22, 22, 28, 0.94);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          padding: 6px 16px;
          border-radius: var(--radius-pill);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
        }

        .btn-a4-page-arrow {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: var(--radius-pill);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-a4-page-arrow:hover:not(:disabled) {
          background: var(--color-primary-on-dark);
          color: #ffffff;
          border-color: var(--color-primary-on-dark);
        }

        .btn-a4-page-arrow:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .a4-page-indicator {
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          letter-spacing: 0.03em;
          white-space: nowrap;
        }

        .sheet-header {
          text-align: center !important;
          margin-bottom: 8px;
          padding-bottom: 0px;
          border-bottom: none;
          width: 100% !important;
          display: block !important;
        }

        .sheet-name {
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 700;
          color: #000000;
          margin-bottom: 4px;
          text-align: center !important;
          display: block !important;
          width: 100% !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }

        .sheet-contact-line {
          display: flex !important;
          flex-wrap: nowrap !important;
          justify-content: center !important;
          align-items: center !important;
          text-align: center !important;
          gap: 0 14px !important;
          font-size: 12.1px;
          color: #000000;
          margin-top: 4px;
          width: 100% !important;
          margin-left: auto !important;
          margin-right: auto !important;
          white-space: nowrap !important;
        }

        .contact-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          margin-right: 0px;
        }

        .contact-icon {
          color: #000000;
          flex-shrink: 0;
          vertical-align: middle;
        }

        .sheet-section {
          margin-bottom: 6px;
          width: 100%;
          box-sizing: border-box;
        }

        .sheet-section-title {
          font-family: var(--font-display);
          font-size: 14.5px;
          font-weight: 700;
          color: #000000;
          border-bottom: 1.2px solid #000000;
          padding-bottom: 1px;
          margin-bottom: 3px;
          width: 100%;
          box-sizing: border-box;
          text-transform: none;
        }

        .onecolentry-box {
          padding-left: 4px;
          padding-right: 4px;
          width: 100%;
          box-sizing: border-box;
        }

        .sheet-summary, .sheet-skills {
          font-size: 12.5px;
          line-height: 1.35;
          color: #000000;
        }

        .sheet-entry {
          margin-bottom: 4px;
          width: 100%;
          box-sizing: border-box;
        }

        .entry-twocol-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-size: 13px;
          margin-bottom: 2px;
          padding-left: 4px;
          padding-right: 4px;
          width: 100%;
          box-sizing: border-box;
        }

        .entry-left-col {
          flex: 1 1 60%;
          max-width: 60%;
          text-align: left;
          padding-right: 8px;
          word-wrap: break-word;
        }

        .entry-title-bold {
          font-weight: 700;
          color: #000000;
        }

        .entry-sub-italics {
          font-style: italic;
          color: #000000;
          font-size: 12.5px;
        }

        .entry-right-col {
          flex: 0 0 40%;
          max-width: 40%;
          text-align: right;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .entry-meta-italics {
          font-style: italic;
          color: #000000;
          font-size: 12px;
        }

        .entry-highlights-list {
          padding-left: 14px;
          font-size: 12.5px;
          color: #000000;
          line-height: 1.35;
          margin-top: 2px;
          margin-bottom: 2px;
          list-style: none;
          list-style-type: none;
        }

        .entry-highlights-list li {
          position: relative;
          margin-bottom: 1.5px;
          padding-left: 2px;
        }

        .entry-highlights-list li::before {
          content: "•";
          position: absolute;
          left: -12px;
          top: 0;
          font-size: 11px;
          line-height: 1.4;
          color: #000000;
        }

        /* Right Panel Cards */
        .screen-2-right-panel {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .btn-action-card {
          width: 100%;
          height: 54px;
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 600;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .btn-latex {
          background-color: var(--color-surface-pearl);
          border-color: var(--color-hairline);
          color: var(--color-ink);
        }

        .btn-latex:hover {
          border-color: var(--color-primary-on-dark);
          color: var(--color-primary-on-dark);
        }

        .action-icon {
          width: 20px;
          height: 20px;
        }

        /* ATS Score Card Dark */
        .ats-score-card, .ai-insights-card {
          text-align: center;
          padding: 20px 16px;
        }

        .insights-header {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-primary-on-dark);
          margin-bottom: 14px;
          text-align: left;
        }

        .insight-section {
          text-align: left;
          margin-bottom: 12px;
        }

        .insight-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-body-muted);
          margin-bottom: 3px;
        }

        .insight-val-bold {
          font-size: 15px;
          font-weight: 700;
          color: var(--color-ink);
        }

        .insight-val-sub {
          font-size: 13px;
          color: var(--color-primary-on-dark);
        }

        .insight-val {
          font-size: 14px;
          color: var(--color-ink);
        }

        .ai-skill-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 4px;
        }

        .ai-req-tag {
          font-size: 11px;
          background-color: rgba(41, 151, 255, 0.12);
          color: var(--color-primary-on-dark);
          padding: 2px 6px;
          border-radius: var(--radius-pill);
        }

        .score-main-display {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 2px;
        }

        .score-value {
          font-family: var(--font-display);
          font-size: 48px;
          font-weight: 700;
          color: var(--color-primary-on-dark);
          line-height: 1;
        }

        .score-denom {
          font-size: 18px;
          color: var(--color-body-muted);
          font-weight: 500;
        }

        .score-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-body-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 4px;
          margin-bottom: 12px;
        }

        .score-badge {
          display: inline-block;
          font-size: 12px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: var(--radius-pill);
        }

        .score-badge.good {
          background-color: rgba(16, 185, 129, 0.15);
          color: var(--color-success);
        }

        .score-badge.fair {
          background-color: rgba(245, 158, 11, 0.15);
          color: var(--color-warning);
        }

        .score-badge.poor {
          background-color: rgba(239, 68, 68, 0.15);
          color: var(--color-danger);
        }

        .score-breakdown-list {
          margin-top: 20px;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .bar-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--color-body-muted);
          margin-bottom: 3px;
        }

        .bar-track {
          height: 6px;
          background-color: var(--color-input-bg);
          border-radius: var(--radius-pill);
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background-color: var(--color-primary-on-dark);
          border-radius: var(--radius-pill);
        }

        .harsh-critique-section {
          margin-top: 18px;
          padding-top: 14px;
          border-top: 1px solid var(--color-hairline);
          text-align: left;
        }

        .critique-header {
          font-size: 12px;
          font-weight: 700;
          color: var(--color-danger);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        .critique-list {
          padding-left: 16px;
          font-size: 12.5px;
          color: var(--color-body-muted);
          line-height: 1.4;
          margin-bottom: 14px;
        }

        .critique-list li {
          margin-bottom: 6px;
        }

        .regenerate-critique-box {
          margin-top: 12px;
        }

        .btn-regenerate-critique {
          width: 100%;
          font-size: 13px;
          padding: 10px 14px;
          justify-content: center;
        }

        .regen-error-text {
          margin-top: 6px;
          font-size: 12px;
          color: var(--color-danger);
        }

        .latex-modal-content {
          max-width: 800px;
        }

        .latex-code-area {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 13px;
          line-height: 1.5;
          white-space: pre;
        }

        @media (max-width: 900px) {
          .screen-2-grid {
            grid-template-columns: 1fr;
          }
        }

        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .screen-2-grid, .resume-preview-box, .a4-preview-viewport {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .hide-page {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
          }
          .a4-print-page {
            width: 8.5in !important;
            height: 11in !important;
            min-height: 11in !important;
            max-height: 11in !important;
            box-sizing: border-box !important;
            padding: 0.4in 0.5in !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            page-break-after: always !important;
            break-after: page !important;
            overflow: hidden !important;
          }
          .a4-print-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
          .screen-2-right-panel,
          .a4-page-hover-controls,
          .preview-top-toolbar,
          .btn-version-arrow,
          .version-counter,
          .screen-2-header-bar {
            display: none !important;
          }
        }
      `}</style>

      <RateLimitModal
        isOpen={showRateLimitModal}
        onClose={() => setShowRateLimitModal(false)}
        message={rateLimitMessage}
      />
    </div>
  );
}
