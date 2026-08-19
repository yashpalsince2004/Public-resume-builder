import { useState, useCallback, useRef } from 'react';
import { readTextFromFile, parseResumeWithGemini } from '../utils/resumeParser.js';

/**
 * Profile Form Component — Strictly Aligned with DESIGN-apple.md
 * Multi-card structured intake for candidate resume details with Drag & Drop auto-fill.
 */

const EMPTY_EXPERIENCE = { title: '', company: '', location: '', startDate: '', endDate: '', bullets: [''] };
const EMPTY_PROJECT = { name: '', description: '', technologies: [], link: '', highlights: [''] };
const EMPTY_EDUCATION = { degree: '', field: '', institution: '', year: '', gpa: '', coursework: [] };
const EMPTY_CERTIFICATION = { name: '', issuer: '', date: '' };

const DEFAULT_PROFILE = {
  name: '', email: '', phone: '', location: '',
  linkedin: '', github: '', portfolio: '',
  summary: '', title: '',
  skills: [],
  experience: [],
  projects: [],
  education: [],
  certifications: [],
  achievements: [],
};

const normalizeProfile = (p) => ({
  ...DEFAULT_PROFILE,
  ...(p || {}),
  skills: Array.isArray(p?.skills) ? p.skills : [],
  experience: Array.isArray(p?.experience) ? p.experience : [],
  projects: Array.isArray(p?.projects) ? p.projects : [],
  education: Array.isArray(p?.education) ? p.education : [],
  certifications: Array.isArray(p?.certifications) ? p.certifications : [],
  achievements: Array.isArray(p?.achievements) ? p.achievements : [],
});

export default function ProfileForm({ initialProfile, onSubmit }) {
  const [profile, setProfile] = useState(() => normalizeProfile(initialProfile));
  const [skillInput, setSkillInput] = useState('');
  const [courseworkInput, setCourseworkInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [jsonImportOpen, setJsonImportOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');
  
  // Dropzone / File extraction states
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState('');
  const [parseError, setParseError] = useState('');
  
  const fileInputRef = useRef(null);

  const updateField = useCallback((field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  }, []);

  // ── Drag & Drop Resume Handlers ──
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processResumeFile = async (file) => {
    if (!file) return;
    setSelectedFile(file);
    setIsParsing(true);
    setParseError('');
    setParseStatus(`✨ Extracting candidate profile from ${file.name}...`);

    try {
      const rawText = await readTextFromFile(file);
      let parsed = null;
      if (file.name.endsWith('.json')) {
        try {
          parsed = JSON.parse(rawText);
        } catch {
          parsed = await parseResumeWithGemini(rawText);
        }
      } else {
        parsed = await parseResumeWithGemini(rawText);
      }

      if (parsed) {
        setProfile(normalizeProfile(parsed));
        setParseStatus(`✨ Extracted details from ${file.name}! All candidate input fields below have been auto-filled.`);
        setTimeout(() => setParseStatus(''), 5000);
      } else {
        setParseError('Could not extract details from resume. Please check file format.');
      }
    } catch (err) {
      console.error('Error processing resume file:', err);
      setParseError('Failed to read resume file text.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processResumeFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await processResumeFile(e.target.files[0]);
    }
  };

  // ── Skills ──
  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !(profile.skills || []).includes(trimmed)) {
      updateField('skills', [...(profile.skills || []), trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    updateField('skills', (profile.skills || []).filter(s => s !== skill));
  };

  // ── Experience ──
  const addExperience = () => {
    updateField('experience', [...(profile.experience || []), { ...EMPTY_EXPERIENCE, bullets: [''] }]);
  };

  const updateExperience = (index, field, value) => {
    const updated = [...(profile.experience || [])];
    updated[index] = { ...updated[index], [field]: value };
    setProfile(prev => ({ ...prev, experience: updated }));
  };

  const removeExperience = (index) => {
    updateField('experience', (profile.experience || []).filter((_, i) => i !== index));
  };

  const addBullet = (expIndex) => {
    const updated = [...(profile.experience || [])];
    updated[expIndex].bullets = [...(updated[expIndex].bullets || []), ''];
    setProfile(prev => ({ ...prev, experience: updated }));
  };

  const updateBullet = (expIndex, bulletIndex, value) => {
    const updated = [...(profile.experience || [])];
    updated[expIndex].bullets = [...(updated[expIndex].bullets || [])];
    updated[expIndex].bullets[bulletIndex] = value;
    setProfile(prev => ({ ...prev, experience: updated }));
  };

  const removeBullet = (expIndex, bulletIndex) => {
    const updated = [...(profile.experience || [])];
    updated[expIndex].bullets = (updated[expIndex].bullets || []).filter((_, i) => i !== bulletIndex);
    setProfile(prev => ({ ...prev, experience: updated }));
  };

  // ── Projects ──
  const addProject = () => {
    updateField('projects', [...(profile.projects || []), { ...EMPTY_PROJECT, technologies: [], highlights: [''] }]);
  };

  const updateProject = (index, field, value) => {
    const updated = [...(profile.projects || [])];
    updated[index] = { ...updated[index], [field]: value };
    setProfile(prev => ({ ...prev, projects: updated }));
  };

  const removeProject = (index) => {
    updateField('projects', (profile.projects || []).filter((_, i) => i !== index));
  };

  const addProjectHighlight = (projIndex) => {
    const updated = [...(profile.projects || [])];
    updated[projIndex].highlights = [...(updated[projIndex].highlights || []), ''];
    setProfile(prev => ({ ...prev, projects: updated }));
  };

  const updateProjectHighlight = (projIndex, hIndex, value) => {
    const updated = [...(profile.projects || [])];
    updated[projIndex].highlights = [...(updated[projIndex].highlights || [])];
    updated[projIndex].highlights[hIndex] = value;
    setProfile(prev => ({ ...prev, projects: updated }));
  };

  const removeProjectHighlight = (projIndex, hIndex) => {
    const updated = [...(profile.projects || [])];
    updated[projIndex].highlights = (updated[projIndex].highlights || []).filter((_, i) => i !== hIndex);
    setProfile(prev => ({ ...prev, projects: updated }));
  };

  const addTech = (projIndex) => {
    const trimmed = techInput.trim();
    if (trimmed) {
      const updated = [...(profile.projects || [])];
      if (!(updated[projIndex].technologies || []).includes(trimmed)) {
        updated[projIndex].technologies = [...(updated[projIndex].technologies || []), trimmed];
        setProfile(prev => ({ ...prev, projects: updated }));
      }
      setTechInput('');
    }
  };

  const removeTech = (projIndex, tech) => {
    const updated = [...(profile.projects || [])];
    updated[projIndex].technologies = (updated[projIndex].technologies || []).filter(t => t !== tech);
    setProfile(prev => ({ ...prev, projects: updated }));
  };

  // ── Education ──
  const addEducation = () => {
    updateField('education', [...(profile.education || []), { ...EMPTY_EDUCATION, coursework: [] }]);
  };

  const updateEducation = (index, field, value) => {
    const updated = [...(profile.education || [])];
    updated[index] = { ...updated[index], [field]: value };
    setProfile(prev => ({ ...prev, education: updated }));
  };

  const removeEducation = (index) => {
    updateField('education', (profile.education || []).filter((_, i) => i !== index));
  };

  const addCoursework = (eduIndex) => {
    const trimmed = courseworkInput.trim();
    if (trimmed) {
      const updated = [...(profile.education || [])];
      if (!(updated[eduIndex].coursework || []).includes(trimmed)) {
        updated[eduIndex].coursework = [...(updated[eduIndex].coursework || []), trimmed];
        setProfile(prev => ({ ...prev, education: updated }));
      }
      setCourseworkInput('');
    }
  };

  const removeCoursework = (eduIndex, course) => {
    const updated = [...(profile.education || [])];
    updated[eduIndex].coursework = (updated[eduIndex].coursework || []).filter(c => c !== course);
    setProfile(prev => ({ ...prev, education: updated }));
  };

  // ── Certifications ──
  const addCertification = () => {
    updateField('certifications', [...(profile.certifications || []), { ...EMPTY_CERTIFICATION }]);
  };

  const updateCertification = (index, field, value) => {
    const updated = [...(profile.certifications || [])];
    updated[index] = { ...updated[index], [field]: value };
    setProfile(prev => ({ ...prev, certifications: updated }));
  };

  const removeCertification = (index) => {
    updateField('certifications', (profile.certifications || []).filter((_, i) => i !== index));
  };

  // ── Achievements ──
  const addAchievement = () => {
    const trimmed = achievementInput.trim();
    if (trimmed && !(profile.achievements || []).includes(trimmed)) {
      updateField('achievements', [...(profile.achievements || []), trimmed]);
      setAchievementInput('');
    }
  };

  const removeAchievement = (index) => {
    updateField('achievements', (profile.achievements || []).filter((_, i) => i !== index));
  };

  // ── JSON Import/Export ──
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(profile, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(profile.name || 'candidate_profile').replace(/\s+/g, '_')}_profile.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSONText = () => {
    try {
      setJsonError('');
      const parsed = JSON.parse(jsonText);
      setProfile(normalizeProfile(parsed));
      setJsonImportOpen(false);
      setJsonText('');
    } catch (err) {
      setJsonError('Invalid JSON format. Please check syntax.');
    }
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(profile);
    }
  };

  return (
    <div className="apple-profile-form-container">
      {/* Resume File Extraction Dropzone (Dropbox) */}
      <div className="apple-form-card profile-dropzone-card">
        <div className="card-section-header dropzone-header">
          <div className="dropzone-title-area">
            <span className="section-icon">📄</span>
            <div>
              <h3>Auto-Fill Profile From Existing Resume</h3>
              <p className="dropzone-subtitle-header">
                Drop your PDF or Word resume to automatically extract candidate details and auto-fill all form fields below.
              </p>
            </div>
          </div>
          <div className="dropzone-actions">
            <button type="button" className="btn-apple-chip" onClick={() => setJsonImportOpen(!jsonImportOpen)}>
              📥 Import JSON
            </button>
            <button type="button" className="btn-apple-chip" onClick={handleExportJSON}>
              📤 Export JSON
            </button>
          </div>
        </div>

        <div
          className={`profile-dropzone ${dragActive ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="file-input-hidden"
            accept=".pdf,.docx,.txt,.json,.md"
            onChange={handleFileChange}
          />

          <div className="dropzone-content">
            <div className="upload-icon-circle">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <span className="dropzone-main-text">
              {selectedFile ? `Selected: ${selectedFile.name}` : 'Drag & drop your resume PDF or Word document here'}
            </span>
            <span className="dropzone-hint-text">Supports PDF, DOCX, TXT, JSON or Markdown</span>
            <button
              type="button"
              className="btn-apple-primary btn-browse-files"
              onClick={() => fileInputRef.current?.click()}
              disabled={isParsing}
            >
              {isParsing ? '✨ Extracting Profile...' : 'Browse Resume Files'}
            </button>
          </div>
        </div>

        {parseStatus && <div className="parse-status-banner">{parseStatus}</div>}
        {parseError && <div className="parse-error-banner">{parseError}</div>}
      </div>

      {jsonImportOpen && (
        <div className="apple-form-card json-panel">
          <h3>Paste Candidate JSON</h3>
          <textarea
            className="apple-textarea"
            rows={5}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='{"name": "John Doe", "email": "john@example.com", ...}'
          />
          {jsonError && <div className="json-error-pill">{jsonError}</div>}
          <div className="json-panel-actions">
            <button type="button" className="btn-apple-primary btn-sm" onClick={handleImportJSONText}>
              Apply JSON Profile
            </button>
            <button type="button" className="btn-apple-secondary btn-sm" onClick={() => setJsonImportOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitForm} className="apple-form-stack">
        {/* Section 1: Personal Information */}
        <div className="apple-form-card">
          <div className="card-section-header">
            <span className="section-icon">👤</span>
            <h3>Personal Information</h3>
          </div>

          <div className="form-grid-3">
            <div className="apple-input-group">
              <label className="apple-label">Full Name</label>
              <input
                type="text"
                className="apple-input"
                placeholder="e.g. Alex Johnson"
                value={profile.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>

            <div className="apple-input-group">
              <label className="apple-label">Professional Title</label>
              <input
                type="text"
                className="apple-input"
                placeholder="e.g. Senior Software Engineer"
                value={profile.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
              />
            </div>

            <div className="apple-input-group">
              <label className="apple-label">Email Address</label>
              <input
                type="email"
                className="apple-input"
                placeholder="alex@example.com"
                value={profile.email || ''}
                onChange={(e) => updateField('email', e.target.value)}
              />
            </div>

            <div className="apple-input-group">
              <label className="apple-label">Phone Number</label>
              <input
                type="text"
                className="apple-input"
                placeholder="+1 (555) 000-0000"
                value={profile.phone || ''}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </div>

            <div className="apple-input-group">
              <label className="apple-label">Location</label>
              <input
                type="text"
                className="apple-input"
                placeholder="San Francisco, CA"
                value={profile.location || ''}
                onChange={(e) => updateField('location', e.target.value)}
              />
            </div>

            <div className="apple-input-group">
              <label className="apple-label">LinkedIn URL</label>
              <input
                type="text"
                className="apple-input"
                placeholder="linkedin.com/in/alexjohnson"
                value={profile.linkedin || ''}
                onChange={(e) => updateField('linkedin', e.target.value)}
              />
            </div>

            <div className="apple-input-group">
              <label className="apple-label">GitHub URL</label>
              <input
                type="text"
                className="apple-input"
                placeholder="github.com/alexjohnson"
                value={profile.github || ''}
                onChange={(e) => updateField('github', e.target.value)}
              />
            </div>

            <div className="apple-input-group span-2">
              <label className="apple-label">Portfolio / Website</label>
              <input
                type="text"
                className="apple-input"
                placeholder="alexjohnson.dev"
                value={profile.portfolio || ''}
                onChange={(e) => updateField('portfolio', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Professional Summary */}
        <div className="apple-form-card">
          <div className="card-section-header">
            <span className="section-icon">📝</span>
            <h3>Professional Summary</h3>
          </div>
          <div className="apple-input-group">
            <label className="apple-label">Summary Overview</label>
            <textarea
              className="apple-textarea"
              rows={4}
              placeholder="Highlight 3-4 key technical achievements, leadership background, and career accomplishments..."
              value={profile.summary || ''}
              onChange={(e) => updateField('summary', e.target.value)}
            />
          </div>
        </div>

        {/* Section 3: Technical & Leadership Skills */}
        <div className="apple-form-card">
          <div className="card-section-header">
            <span className="section-icon">⚡</span>
            <h3>Skills & Technologies</h3>
          </div>

          <div className="apple-input-group">
            <label className="apple-label">Add Key Skills</label>
            <div className="tag-input-row">
              <input
                type="text"
                className="apple-input"
                placeholder="Type skill (e.g. Python, React, AWS, Distributed Systems) and press Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <button type="button" className="btn-apple-secondary btn-input-action" onClick={addSkill}>
                Add Skill
              </button>
            </div>

            <div className="tags-flex-container">
              {(profile.skills || []).map((skill, i) => (
                <span key={i} className="apple-pill-tag">
                  {skill}
                  <button type="button" className="tag-remove-btn" onClick={() => removeSkill(skill)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Work Experience */}
        <div className="apple-form-card">
          <div className="card-section-header">
            <span className="section-icon">💼</span>
            <h3>Work Experience</h3>
          </div>

          <div className="repeatable-stack">
            {(profile.experience || []).map((exp, i) => (
              <div key={i} className="repeatable-card-item">
                <div className="item-header">
                  <span className="item-badge">Position #{i + 1}</span>
                  <button type="button" className="btn-remove-item" onClick={() => removeExperience(i)}>
                    🗑 Remove Position
                  </button>
                </div>

                <div className="form-grid-2">
                  <div className="apple-input-group">
                    <label className="apple-label">Job Title</label>
                    <input
                      type="text"
                      className="apple-input"
                      placeholder="e.g. Senior Software Engineer"
                      value={exp.title || ''}
                      onChange={(e) => updateExperience(i, 'title', e.target.value)}
                    />
                  </div>

                  <div className="apple-input-group">
                    <label className="apple-label">Company Name</label>
                    <input
                      type="text"
                      className="apple-input"
                      placeholder="e.g. TechCorp Solutions"
                      value={exp.company || ''}
                      onChange={(e) => updateExperience(i, 'company', e.target.value)}
                    />
                  </div>

                  <div className="apple-input-group">
                    <label className="apple-label">Location</label>
                    <input
                      type="text"
                      className="apple-input"
                      placeholder="San Francisco, CA / Remote"
                      value={exp.location || ''}
                      onChange={(e) => updateExperience(i, 'location', e.target.value)}
                    />
                  </div>

                  <div className="form-grid-2-inner">
                    <div className="apple-input-group">
                      <label className="apple-label">Start Date</label>
                      <input
                        type="text"
                        className="apple-input"
                        placeholder="Jan 2021"
                        value={exp.startDate || ''}
                        onChange={(e) => updateExperience(i, 'startDate', e.target.value)}
                      />
                    </div>

                    <div className="apple-input-group">
                      <label className="apple-label">End Date</label>
                      <input
                        type="text"
                        className="apple-input"
                        placeholder="Present"
                        value={exp.endDate || ''}
                        onChange={(e) => updateExperience(i, 'endDate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="bullets-section">
                  <label className="apple-label">Key Achievements & Responsibilities (Action Verbs + Metrics)</label>
                  {(exp.bullets || []).map((bullet, bi) => (
                    <div key={bi} className="bullet-input-row">
                      <span className="bullet-dot">•</span>
                      <input
                        type="text"
                        className="apple-input bullet-input"
                        placeholder="Architected microservices boosting throughput by 40%..."
                        value={bullet}
                        onChange={(e) => updateBullet(i, bi, e.target.value)}
                      />
                      <button type="button" className="btn-remove-bullet" onClick={() => removeBullet(i, bi)}>
                        ✕
                      </button>
                    </div>
                  ))}
                  <button type="button" className="btn-apple-secondary btn-add-bullet" onClick={() => addBullet(i)}>
                    + Add Achievement Bullet
                  </button>
                </div>
              </div>
            ))}

            <button type="button" className="btn-apple-secondary btn-add-section" onClick={addExperience}>
              + Add Work Experience Position
            </button>
          </div>
        </div>

        {/* Section 5: Projects */}
        <div className="apple-form-card">
          <div className="card-section-header">
            <span className="section-icon">🚀</span>
            <h3>Key Projects</h3>
          </div>

          <div className="repeatable-stack">
            {(profile.projects || []).map((proj, i) => (
              <div key={i} className="repeatable-card-item">
                <div className="item-header">
                  <span className="item-badge">Project #{i + 1}</span>
                  <button type="button" className="btn-remove-item" onClick={() => removeProject(i)}>
                    🗑 Remove Project
                  </button>
                </div>

                <div className="form-grid-2">
                  <div className="apple-input-group">
                    <label className="apple-label">Project Name</label>
                    <input
                      type="text"
                      className="apple-input"
                      placeholder="e.g. Distributed Analytics Engine"
                      value={proj.name || ''}
                      onChange={(e) => updateProject(i, 'name', e.target.value)}
                    />
                  </div>

                  <div className="apple-input-group">
                    <label className="apple-label">Project Link</label>
                    <input
                      type="text"
                      className="apple-input"
                      placeholder="github.com/user/analytics-engine"
                      value={proj.link || ''}
                      onChange={(e) => updateProject(i, 'link', e.target.value)}
                    />
                  </div>
                </div>

                <div className="apple-input-group margin-top-sm">
                  <label className="apple-label">Project Description</label>
                  <textarea
                    className="apple-textarea"
                    rows={2}
                    placeholder="Short summary of project scope and business value..."
                    value={proj.description || ''}
                    onChange={(e) => updateProject(i, 'description', e.target.value)}
                  />
                </div>

                <div className="apple-input-group margin-top-sm">
                  <label className="apple-label">Technologies Used</label>
                  <div className="tag-input-row">
                    <input
                      type="text"
                      className="apple-input"
                      placeholder="e.g. Go, Docker, PostgreSQL"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTech(i);
                        }
                      }}
                    />
                    <button type="button" className="btn-apple-secondary btn-input-action" onClick={() => addTech(i)}>
                      Add Tech
                    </button>
                  </div>
                  <div className="tags-flex-container">
                    {(proj.technologies || []).map((t, ti) => (
                      <span key={ti} className="apple-pill-tag tag-tech">
                        {t}
                        <button type="button" className="tag-remove-btn" onClick={() => removeTech(i, t)}>
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bullets-section margin-top-sm">
                  <label className="apple-label">Highlight Bullets</label>
                  {(proj.highlights || []).map((h, hi) => (
                    <div key={hi} className="bullet-input-row">
                      <span className="bullet-dot">•</span>
                      <input
                        type="text"
                        className="apple-input bullet-input"
                        placeholder="Achieved sub-10ms response latency..."
                        value={h}
                        onChange={(e) => updateProjectHighlight(i, hi, e.target.value)}
                      />
                      <button type="button" className="btn-remove-bullet" onClick={() => removeProjectHighlight(i, hi)}>
                        ✕
                      </button>
                    </div>
                  ))}
                  <button type="button" className="btn-apple-secondary btn-add-bullet" onClick={() => addProjectHighlight(i)}>
                    + Add Highlight Bullet
                  </button>
                </div>
              </div>
            ))}

            <button type="button" className="btn-apple-secondary btn-add-section" onClick={addProject}>
              + Add Key Project
            </button>
          </div>
        </div>

        {/* Section 6: Education */}
        <div className="apple-form-card">
          <div className="card-section-header">
            <span className="section-icon">🎓</span>
            <h3>Education</h3>
          </div>

          <div className="repeatable-stack">
            {(profile.education || []).map((edu, i) => (
              <div key={i} className="repeatable-card-item">
                <div className="item-header">
                  <span className="item-badge">Education #{i + 1}</span>
                  <button type="button" className="btn-remove-item" onClick={() => removeEducation(i)}>
                    🗑 Remove Education
                  </button>
                </div>

                <div className="form-grid-3">
                  <div className="apple-input-group">
                    <label className="apple-label">Degree</label>
                    <input
                      type="text"
                      className="apple-input"
                      placeholder="e.g. Bachelor of Science"
                      value={edu.degree || ''}
                      onChange={(e) => updateEducation(i, 'degree', e.target.value)}
                    />
                  </div>

                  <div className="apple-input-group">
                    <label className="apple-label">Field of Study</label>
                    <input
                      type="text"
                      className="apple-input"
                      placeholder="e.g. Computer Science"
                      value={edu.field || ''}
                      onChange={(e) => updateEducation(i, 'field', e.target.value)}
                    />
                  </div>

                  <div className="apple-input-group">
                    <label className="apple-label">Institution</label>
                    <input
                      type="text"
                      className="apple-input"
                      placeholder="e.g. Stanford University"
                      value={edu.institution || ''}
                      onChange={(e) => updateEducation(i, 'institution', e.target.value)}
                    />
                  </div>

                  <div className="apple-input-group">
                    <label className="apple-label">Graduation Year</label>
                    <input
                      type="text"
                      className="apple-input"
                      placeholder="2023"
                      value={edu.year || ''}
                      onChange={(e) => updateEducation(i, 'year', e.target.value)}
                    />
                  </div>

                  <div className="apple-input-group">
                    <label className="apple-label">GPA (Optional)</label>
                    <input
                      type="text"
                      className="apple-input"
                      placeholder="3.9 / 4.0"
                      value={edu.gpa || ''}
                      onChange={(e) => updateEducation(i, 'gpa', e.target.value)}
                    />
                  </div>
                </div>

                <div className="apple-input-group margin-top-sm">
                  <label className="apple-label">Relevant Coursework</label>
                  <div className="tag-input-row">
                    <input
                      type="text"
                      className="apple-input"
                      placeholder="e.g. Operating Systems, Algorithms"
                      value={courseworkInput}
                      onChange={(e) => setCourseworkInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCoursework(i);
                        }
                      }}
                    />
                    <button type="button" className="btn-apple-secondary btn-input-action" onClick={() => addCoursework(i)}>
                      Add Course
                    </button>
                  </div>
                  <div className="tags-flex-container">
                    {(edu.coursework || []).map((c, ci) => (
                      <span key={ci} className="apple-pill-tag tag-course">
                        {c}
                        <button type="button" className="tag-remove-btn" onClick={() => removeCoursework(i, c)}>
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <button type="button" className="btn-apple-secondary btn-add-section" onClick={addEducation}>
              + Add Education
            </button>
          </div>
        </div>

        {/* Section 7: Achievements */}
        <div className="apple-form-card">
          <div className="card-section-header">
            <span className="section-icon">🏆</span>
            <h3>Achievements & Honors</h3>
          </div>

          <div className="apple-input-group">
            <label className="apple-label">Add Key Achievement</label>
            <div className="tag-input-row">
              <input
                type="text"
                className="apple-input"
                placeholder="e.g. Winner of National Cloud Hackathon 2023"
                value={achievementInput}
                onChange={(e) => setAchievementInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAchievement();
                  }
                }}
              />
              <button type="button" className="btn-apple-secondary btn-input-action" onClick={addAchievement}>
                Add Achievement
              </button>
            </div>
            <div className="achievements-list">
              {(profile.achievements || []).map((a, i) => (
                <div key={i} className="achievement-row">
                  <span className="achievement-bullet">🏆</span>
                  <span className="achievement-text">{a}</span>
                  <button type="button" className="btn-remove-bullet" onClick={() => removeAchievement(i)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 8: Certifications */}
        <div className="apple-form-card">
          <div className="card-section-header">
            <span className="section-icon">🏅</span>
            <h3>Certifications</h3>
          </div>

          <div className="repeatable-stack">
            {(profile.certifications || []).map((cert, i) => (
              <div key={i} className="form-grid-3 repeatable-card-item">
                <div className="apple-input-group">
                  <label className="apple-label">Certification Name</label>
                  <input
                    type="text"
                    className="apple-input"
                    placeholder="AWS Solutions Architect"
                    value={cert.name || ''}
                    onChange={(e) => updateCertification(i, 'name', e.target.value)}
                  />
                </div>
                <div className="apple-input-group">
                  <label className="apple-label">Issuer</label>
                  <input
                    type="text"
                    className="apple-input"
                    placeholder="Amazon Web Services"
                    value={cert.issuer || ''}
                    onChange={(e) => updateCertification(i, 'issuer', e.target.value)}
                  />
                </div>
                <div className="apple-input-group">
                  <label className="apple-label">Date Issued</label>
                  <input
                    type="text"
                    className="apple-input"
                    placeholder="2023"
                    value={cert.date || ''}
                    onChange={(e) => updateCertification(i, 'date', e.target.value)}
                  />
                </div>
                <button type="button" className="btn-remove-item span-full" onClick={() => removeCertification(i)}>
                  🗑 Remove Certification
                </button>
              </div>
            ))}

            <button type="button" className="btn-apple-secondary btn-add-section" onClick={addCertification}>
              + Add Certification
            </button>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="form-submit-bar">
          <button type="submit" className="btn-apple-primary btn-submit-large">
            Save Profile & Continue to Resume Builder →
          </button>
        </div>
      </form>

      <style>{`
        .apple-profile-form-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .profile-dropzone-card {
          margin-bottom: 8px;
        }

        .dropzone-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .dropzone-title-area {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .dropzone-subtitle-header {
          font-size: 14px;
          color: var(--color-body-muted);
          margin-top: 2px;
        }

        .dropzone-actions {
          display: flex;
          gap: 8px;
        }

        .profile-dropzone {
          border: 2px dashed var(--color-hairline);
          border-radius: var(--radius-md);
          padding: 28px 20px;
          text-align: center;
          background-color: var(--color-surface-tile-2);
          transition: border-color 0.2s ease, background 0.2s ease;
          position: relative;
        }

        .profile-dropzone.drag-over {
          border-color: var(--color-primary-on-dark);
          background: rgba(0, 102, 204, 0.1);
        }

        .file-input-hidden {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          opacity: 0;
          cursor: pointer;
        }

        .dropzone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .upload-icon-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(0, 102, 204, 0.15);
          color: var(--color-primary-on-dark);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dropzone-main-text {
          font-size: 17px;
          font-weight: 600;
          letter-spacing: -0.374px;
          color: var(--color-ink);
        }

        .dropzone-hint-text {
          font-size: 14px;
          color: var(--color-body-muted);
        }

        .btn-browse-files {
          margin-top: 6px;
          padding: 8px 20px !important;
          font-size: 14px !important;
        }

        .parse-status-banner {
          background: rgba(0, 102, 204, 0.15);
          color: var(--color-primary-on-dark);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          margin-top: 14px;
          text-align: center;
        }

        .parse-error-banner {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 14px;
          margin-top: 14px;
          text-align: center;
        }

        .btn-apple-chip {
          background-color: var(--color-surface-tile-2);
          border: 1px solid var(--color-hairline);
          color: var(--color-ink);
          border-radius: var(--radius-sm);
          padding: 8px 14px;
          font-size: 13px;
          cursor: pointer;
          transition: transform 0.15s ease, border-color 0.15s ease;
        }

        .btn-apple-chip:hover {
          border-color: var(--color-primary-on-dark);
          color: var(--color-primary-on-dark);
        }

        .btn-apple-chip:active {
          transform: scale(0.95);
        }

        .json-panel {
          padding: 20px;
        }

        .json-panel-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .btn-sm {
          padding: 8px 16px !important;
          font-size: 14px !important;
        }

        .json-error-pill {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          margin-top: 8px;
        }

        .apple-form-stack {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .apple-form-card {
          background-color: var(--color-surface-tile-1);
          border: 1px solid var(--color-hairline);
          border-radius: var(--radius-lg);
          padding: 28px;
          box-shadow: none;
        }

        .card-section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--color-hairline);
          padding-bottom: 12px;
        }

        .section-icon {
          font-size: 22px;
        }

        .card-section-header h3 {
          font-size: 21px;
          font-weight: 600;
          letter-spacing: -0.28px;
          color: var(--color-ink);
        }

        .form-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .form-grid-2-inner {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        @media (max-width: 800px) {
          .form-grid-3, .form-grid-2, .form-grid-2-inner {
            grid-template-columns: 1fr;
          }
        }

        .span-2 {
          grid-column: span 2;
        }

        .span-full {
          grid-column: 1 / -1;
        }

        .apple-input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .margin-top-sm {
          margin-top: 14px;
        }

        .margin-bottom-lg {
          margin-bottom: 24px;
        }

        .apple-label {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.224px;
          color: var(--color-body-muted);
        }

        .apple-input {
          width: 100%;
          height: 44px;
          padding: 0 14px;
          background-color: var(--color-input-bg);
          border: 1px solid var(--color-hairline);
          border-radius: var(--radius-sm);
          color: var(--color-ink);
          font-family: var(--font-text);
          font-size: 15px;
          letter-spacing: -0.374px;
          transition: border-color 0.15s ease;
        }

        .apple-input:focus {
          outline: 2px solid var(--color-primary-focus);
          border-color: transparent;
        }

        .apple-textarea {
          width: 100%;
          padding: 12px 14px;
          background-color: var(--color-input-bg);
          border: 1px solid var(--color-hairline);
          border-radius: var(--radius-sm);
          color: var(--color-ink);
          font-family: var(--font-text);
          font-size: 15px;
          line-height: 1.47;
          resize: vertical;
        }

        .apple-textarea:focus {
          outline: 2px solid var(--color-primary-focus);
          border-color: transparent;
        }

        .tag-input-row {
          display: flex;
          gap: 8px;
        }

        .btn-input-action {
          padding: 0 16px !important;
          height: 44px;
          font-size: 14px !important;
          flex-shrink: 0;
        }

        .tags-flex-container {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }

        .apple-pill-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: var(--radius-pill);
          background-color: rgba(0, 102, 204, 0.15);
          color: var(--color-primary-on-dark);
          font-size: 13px;
          font-weight: 500;
        }

        .tag-tech {
          background-color: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .tag-course {
          background-color: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .tag-remove-btn {
          background: none;
          border: none;
          color: inherit;
          font-size: 16px;
          cursor: pointer;
          padding: 0 2px;
        }

        .repeatable-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .repeatable-card-item {
          background-color: var(--color-surface-tile-2);
          border: 1px solid var(--color-hairline);
          border-radius: var(--radius-md);
          padding: 20px;
        }

        .item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .item-badge {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-primary-on-dark);
        }

        .btn-remove-item {
          background: none;
          border: 1px solid var(--color-hairline);
          color: #ef4444;
          padding: 4px 10px;
          border-radius: var(--radius-sm);
          font-size: 12px;
          cursor: pointer;
          transition: transform 0.15s ease;
        }

        .btn-remove-item:active {
          transform: scale(0.95);
        }

        .bullets-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 14px;
        }

        .bullet-input-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bullet-dot {
          color: var(--color-primary-on-dark);
          font-size: 18px;
          flex-shrink: 0;
        }

        .bullet-input {
          flex: 1;
        }

        .btn-remove-bullet {
          background: none;
          border: none;
          color: var(--color-body-muted);
          font-size: 16px;
          cursor: pointer;
          padding: 4px;
        }

        .btn-remove-bullet:hover {
          color: #ef4444;
        }

        .btn-add-bullet, .btn-add-section {
          align-self: flex-start;
          padding: 8px 16px !important;
          font-size: 14px !important;
          margin-top: 6px;
        }

        .btn-add-section {
          width: 100%;
          justify-content: center;
          display: flex;
        }

        .achievements-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 10px;
        }

        .achievement-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background-color: var(--color-surface-tile-2);
          border: 1px solid var(--color-hairline);
          border-radius: var(--radius-sm);
        }

        .achievement-text {
          flex: 1;
          font-size: 14px;
          color: var(--color-ink);
        }

        .form-submit-bar {
          text-align: center;
          margin-top: 16px;
        }

        .btn-submit-large {
          width: 100%;
          max-width: 480px;
          padding: 14px 28px;
          font-size: 18px;
          font-weight: 400;
          border-radius: var(--radius-pill);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
