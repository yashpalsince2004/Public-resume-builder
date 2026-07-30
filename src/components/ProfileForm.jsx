import { useState, useCallback, useRef } from 'react';

/**
 * Profile Form Component
 *
 * Multi-section accordion form for entering resume data.
 * Supports JSON import/export and live validation.
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

export default function ProfileForm({ initialProfile, onSubmit }) {
  const [profile, setProfile] = useState(initialProfile || { ...DEFAULT_PROFILE });
  const [expandedSections, setExpandedSections] = useState(new Set(['personal']));
  const [skillInput, setSkillInput] = useState('');
  const [courseworkInput, setCourseworkInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');
  const [techInput, setTechInput] = useState('');
  const [jsonImportOpen, setJsonImportOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState('');
  const fileInputRef = useRef(null);

  // ── Section toggle ──────────────────────────────────────────────
  const toggleSection = (section) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section); else next.add(section);
      return next;
    });
  };

  // ── Simple field updater ────────────────────────────────────────
  const updateField = useCallback((field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  }, []);

  // ── Skills ──────────────────────────────────────────────────────
  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !profile.skills.includes(trimmed)) {
      updateField('skills', [...profile.skills, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    updateField('skills', profile.skills.filter(s => s !== skill));
  };

  // ── Experience ──────────────────────────────────────────────────
  const addExperience = () => {
    updateField('experience', [...profile.experience, { ...EMPTY_EXPERIENCE, bullets: [''] }]);
  };

  const updateExperience = (index, field, value) => {
    const updated = [...profile.experience];
    updated[index] = { ...updated[index], [field]: value };
    setProfile(prev => ({ ...prev, experience: updated }));
  };

  const removeExperience = (index) => {
    updateField('experience', profile.experience.filter((_, i) => i !== index));
  };

  const addBullet = (expIndex) => {
    const updated = [...profile.experience];
    updated[expIndex].bullets = [...(updated[expIndex].bullets || []), ''];
    setProfile(prev => ({ ...prev, experience: updated }));
  };

  const updateBullet = (expIndex, bulletIndex, value) => {
    const updated = [...profile.experience];
    updated[expIndex].bullets = [...updated[expIndex].bullets];
    updated[expIndex].bullets[bulletIndex] = value;
    setProfile(prev => ({ ...prev, experience: updated }));
  };

  const removeBullet = (expIndex, bulletIndex) => {
    const updated = [...profile.experience];
    updated[expIndex].bullets = updated[expIndex].bullets.filter((_, i) => i !== bulletIndex);
    setProfile(prev => ({ ...prev, experience: updated }));
  };

  // ── Projects ────────────────────────────────────────────────────
  const addProject = () => {
    updateField('projects', [...profile.projects, { ...EMPTY_PROJECT, technologies: [], highlights: [''] }]);
  };

  const updateProject = (index, field, value) => {
    const updated = [...profile.projects];
    updated[index] = { ...updated[index], [field]: value };
    setProfile(prev => ({ ...prev, projects: updated }));
  };

  const removeProject = (index) => {
    updateField('projects', profile.projects.filter((_, i) => i !== index));
  };

  const addProjectHighlight = (projIndex) => {
    const updated = [...profile.projects];
    updated[projIndex].highlights = [...(updated[projIndex].highlights || []), ''];
    setProfile(prev => ({ ...prev, projects: updated }));
  };

  const updateProjectHighlight = (projIndex, hIndex, value) => {
    const updated = [...profile.projects];
    updated[projIndex].highlights = [...updated[projIndex].highlights];
    updated[projIndex].highlights[hIndex] = value;
    setProfile(prev => ({ ...prev, projects: updated }));
  };

  const removeProjectHighlight = (projIndex, hIndex) => {
    const updated = [...profile.projects];
    updated[projIndex].highlights = updated[projIndex].highlights.filter((_, i) => i !== hIndex);
    setProfile(prev => ({ ...prev, projects: updated }));
  };

  const addTech = (projIndex) => {
    const trimmed = techInput.trim();
    if (trimmed) {
      const updated = [...profile.projects];
      if (!updated[projIndex].technologies.includes(trimmed)) {
        updated[projIndex].technologies = [...updated[projIndex].technologies, trimmed];
        setProfile(prev => ({ ...prev, projects: updated }));
      }
      setTechInput('');
    }
  };

  const removeTech = (projIndex, tech) => {
    const updated = [...profile.projects];
    updated[projIndex].technologies = updated[projIndex].technologies.filter(t => t !== tech);
    setProfile(prev => ({ ...prev, projects: updated }));
  };

  // ── Education ───────────────────────────────────────────────────
  const addEducation = () => {
    updateField('education', [...profile.education, { ...EMPTY_EDUCATION, coursework: [] }]);
  };

  const updateEducation = (index, field, value) => {
    const updated = [...profile.education];
    updated[index] = { ...updated[index], [field]: value };
    setProfile(prev => ({ ...prev, education: updated }));
  };

  const removeEducation = (index) => {
    updateField('education', profile.education.filter((_, i) => i !== index));
  };

  const addCoursework = (eduIndex) => {
    const trimmed = courseworkInput.trim();
    if (trimmed) {
      const updated = [...profile.education];
      if (!updated[eduIndex].coursework.includes(trimmed)) {
        updated[eduIndex].coursework = [...(updated[eduIndex].coursework || []), trimmed];
        setProfile(prev => ({ ...prev, education: updated }));
      }
      setCourseworkInput('');
    }
  };

  const removeCoursework = (eduIndex, course) => {
    const updated = [...profile.education];
    updated[eduIndex].coursework = updated[eduIndex].coursework.filter(c => c !== course);
    setProfile(prev => ({ ...prev, education: updated }));
  };

  // ── Certifications ──────────────────────────────────────────────
  const addCertification = () => {
    updateField('certifications', [...profile.certifications, { ...EMPTY_CERTIFICATION }]);
  };

  const updateCertification = (index, field, value) => {
    const updated = [...profile.certifications];
    updated[index] = { ...updated[index], [field]: value };
    setProfile(prev => ({ ...prev, certifications: updated }));
  };

  const removeCertification = (index) => {
    updateField('certifications', profile.certifications.filter((_, i) => i !== index));
  };

  // ── Achievements ────────────────────────────────────────────────
  const addAchievement = () => {
    const trimmed = achievementInput.trim();
    if (trimmed) {
      updateField('achievements', [...profile.achievements, trimmed]);
      setAchievementInput('');
    }
  };

  const removeAchievement = (index) => {
    updateField('achievements', profile.achievements.filter((_, i) => i !== index));
  };

  // ── JSON Import/Export ──────────────────────────────────────────
  const handleJsonImport = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setProfile({ ...DEFAULT_PROFILE, ...parsed });
      setJsonImportOpen(false);
      setJsonError('');
      setJsonText('');
      // Expand all sections
      setExpandedSections(new Set(['personal', 'summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'achievements']));
    } catch (e) {
      setJsonError('Invalid JSON format. Please check and try again.');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          setProfile({ ...DEFAULT_PROFILE, ...parsed });
          setJsonImportOpen(false);
          setExpandedSections(new Set(['personal', 'summary', 'skills', 'experience', 'projects', 'education', 'certifications', 'achievements']));
        } catch (e) {
          setJsonError('Invalid JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.name || 'profile'}_resume_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Submit ──────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(profile);
  };

  // ── Section renderer ────────────────────────────────────────────
  const SectionAccordion = ({ id, title, icon, children, count }) => (
    <div className="accordion-section glass-card-static">
      <button
        type="button"
        className="accordion-header"
        onClick={() => toggleSection(id)}
        aria-expanded={expandedSections.has(id)}
      >
        <span className="accordion-title">
          <span className="accordion-icon">{icon}</span>
          {title}
          {count > 0 && <span className="accordion-count">{count}</span>}
        </span>
        <span className={`accordion-chevron ${expandedSections.has(id) ? 'open' : ''}`}>▾</span>
      </button>
      {expandedSections.has(id) && (
        <div className="accordion-body">{children}</div>
      )}
    </div>
  );

  return (
    <div className="profile-form-wrapper">
      <div className="profile-header">
        <h1 className="profile-title">Build Your Profile</h1>
        <p className="profile-subtitle">Enter your details or import from JSON to get started.</p>
        <div className="profile-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setJsonImportOpen(!jsonImportOpen)}
          >
            📥 Import JSON
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleExportJson}
          >
            📤 Export JSON
          </button>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => fileInputRef.current?.click()}
          >
            📂 Upload File
          </button>
        </div>
      </div>

      {/* JSON Import Panel */}
      {jsonImportOpen && (
        <div className="json-import-panel glass-card animate-fade-in-up">
          <h3>Paste your profile JSON</h3>
          <textarea
            className="form-textarea"
            value={jsonText}
            onChange={(e) => { setJsonText(e.target.value); setJsonError(''); }}
            placeholder='{"name": "John Doe", "email": "john@example.com", "skills": ["React", "Node.js"], ...}'
            rows={8}
          />
          {jsonError && <p className="form-error">{jsonError}</p>}
          <div className="json-import-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={handleJsonImport}>
              Import
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setJsonImportOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Personal Info */}
        <SectionAccordion id="personal" title="Personal Information" icon="👤">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="pf-name">Full Name</label>
              <input id="pf-name" className="form-input" value={profile.name} onChange={e => updateField('name', e.target.value)} placeholder="John Doe" autoComplete="name" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="pf-title">Professional Title</label>
              <input id="pf-title" className="form-input" value={profile.title || ''} onChange={e => updateField('title', e.target.value)} placeholder="Software Engineer" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="pf-email">Email</label>
              <input id="pf-email" className="form-input" type="email" value={profile.email} onChange={e => updateField('email', e.target.value)} placeholder="john@example.com" autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="pf-phone">Phone</label>
              <input id="pf-phone" className="form-input" type="tel" value={profile.phone} onChange={e => updateField('phone', e.target.value)} placeholder="+1 (555) 000-0000" autoComplete="tel" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="pf-location">Location</label>
              <input id="pf-location" className="form-input" value={profile.location} onChange={e => updateField('location', e.target.value)} placeholder="San Francisco, CA" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="pf-linkedin">LinkedIn</label>
              <input id="pf-linkedin" className="form-input" value={profile.linkedin} onChange={e => updateField('linkedin', e.target.value)} placeholder="linkedin.com/in/johndoe" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="pf-github">GitHub</label>
              <input id="pf-github" className="form-input" value={profile.github} onChange={e => updateField('github', e.target.value)} placeholder="github.com/johndoe" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="pf-portfolio">Portfolio</label>
              <input id="pf-portfolio" className="form-input" value={profile.portfolio} onChange={e => updateField('portfolio', e.target.value)} placeholder="johndoe.dev" />
            </div>
          </div>
        </SectionAccordion>

        {/* Summary */}
        <SectionAccordion id="summary" title="Professional Summary" icon="📝">
          <div className="form-group">
            <label className="form-label" htmlFor="pf-summary">Summary</label>
            <textarea id="pf-summary" className="form-textarea" value={profile.summary} onChange={e => updateField('summary', e.target.value)} placeholder="A brief professional summary highlighting your key strengths and career goals..." rows={4} />
          </div>
        </SectionAccordion>

        {/* Skills */}
        <SectionAccordion id="skills" title="Skills" icon="⚡" count={profile.skills.length}>
          <div className="form-group">
            <label className="form-label">Add Skills</label>
            <div className="tag-input-wrapper">
              <input
                className="form-input"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                placeholder="Type a skill and press Enter"
              />
              <button type="button" className="btn btn-primary btn-sm" onClick={addSkill}>Add</button>
            </div>
            <div className="tags-container">
              {profile.skills.map((skill, i) => (
                <span key={i} className="tag tag-primary">
                  {skill}
                  <span className="tag-close" onClick={() => removeSkill(skill)}>×</span>
                </span>
              ))}
            </div>
          </div>
        </SectionAccordion>

        {/* Experience */}
        <SectionAccordion id="experience" title="Work Experience" icon="💼" count={profile.experience.length}>
          {profile.experience.map((exp, i) => (
            <div key={i} className="repeatable-item">
              <div className="repeatable-header">
                <span className="repeatable-number">#{i + 1}</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeExperience(i)}>🗑 Remove</button>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Job Title</label>
                  <input className="form-input" value={exp.title} onChange={e => updateExperience(i, 'title', e.target.value)} placeholder="Software Engineer" />
                </div>
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input className="form-input" value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} placeholder="Google" />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-input" value={exp.location} onChange={e => updateExperience(i, 'location', e.target.value)} placeholder="Mountain View, CA" />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input className="form-input" value={exp.startDate} onChange={e => updateExperience(i, 'startDate', e.target.value)} placeholder="Jan 2022" />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input className="form-input" value={exp.endDate} onChange={e => updateExperience(i, 'endDate', e.target.value)} placeholder="Present" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Bullet Points</label>
                {(exp.bullets || []).map((bullet, bi) => (
                  <div key={bi} className="bullet-row">
                    <span className="bullet-dot">•</span>
                    <input className="form-input bullet-input" value={bullet} onChange={e => updateBullet(i, bi, e.target.value)} placeholder="Describe an achievement or responsibility..." />
                    <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => removeBullet(i, bi)}>×</button>
                  </div>
                ))}
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => addBullet(i)}>+ Add Bullet</button>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-secondary w-full" onClick={addExperience}>+ Add Experience</button>
        </SectionAccordion>

        {/* Projects */}
        <SectionAccordion id="projects" title="Projects" icon="🚀" count={profile.projects.length}>
          {profile.projects.map((proj, i) => (
            <div key={i} className="repeatable-item">
              <div className="repeatable-header">
                <span className="repeatable-number">#{i + 1}</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeProject(i)}>🗑 Remove</button>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Project Name</label>
                  <input className="form-input" value={proj.name} onChange={e => updateProject(i, 'name', e.target.value)} placeholder="AI Chatbot" />
                </div>
                <div className="form-group">
                  <label className="form-label">Link</label>
                  <input className="form-input" value={proj.link} onChange={e => updateProject(i, 'link', e.target.value)} placeholder="github.com/user/project" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={proj.description} onChange={e => updateProject(i, 'description', e.target.value)} placeholder="Brief description of the project..." rows={2} />
              </div>
              <div className="form-group">
                <label className="form-label">Technologies</label>
                <div className="tag-input-wrapper">
                  <input className="form-input" value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech(i); } }} placeholder="React, Python, etc." />
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => addTech(i)}>Add</button>
                </div>
                <div className="tags-container">
                  {(proj.technologies || []).map((tech, ti) => (
                    <span key={ti} className="tag tag-accent">
                      {tech}
                      <span className="tag-close" onClick={() => removeTech(i, tech)}>×</span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Highlights</label>
                {(proj.highlights || []).map((h, hi) => (
                  <div key={hi} className="bullet-row">
                    <span className="bullet-dot">•</span>
                    <input className="form-input bullet-input" value={h} onChange={e => updateProjectHighlight(i, hi, e.target.value)} placeholder="Key achievement or feature..." />
                    <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => removeProjectHighlight(i, hi)}>×</button>
                  </div>
                ))}
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => addProjectHighlight(i)}>+ Add Highlight</button>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-secondary w-full" onClick={addProject}>+ Add Project</button>
        </SectionAccordion>

        {/* Education */}
        <SectionAccordion id="education" title="Education" icon="🎓" count={profile.education.length}>
          {profile.education.map((edu, i) => (
            <div key={i} className="repeatable-item">
              <div className="repeatable-header">
                <span className="repeatable-number">#{i + 1}</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeEducation(i)}>🗑 Remove</button>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Degree</label>
                  <input className="form-input" value={edu.degree} onChange={e => updateEducation(i, 'degree', e.target.value)} placeholder="Bachelor of Science" />
                </div>
                <div className="form-group">
                  <label className="form-label">Field of Study</label>
                  <input className="form-input" value={edu.field} onChange={e => updateEducation(i, 'field', e.target.value)} placeholder="Computer Science" />
                </div>
                <div className="form-group">
                  <label className="form-label">Institution</label>
                  <input className="form-input" value={edu.institution} onChange={e => updateEducation(i, 'institution', e.target.value)} placeholder="MIT" />
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <input className="form-input" value={edu.year} onChange={e => updateEducation(i, 'year', e.target.value)} placeholder="2024" />
                </div>
                <div className="form-group">
                  <label className="form-label">GPA (optional)</label>
                  <input className="form-input" value={edu.gpa} onChange={e => updateEducation(i, 'gpa', e.target.value)} placeholder="3.8/4.0" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Relevant Coursework</label>
                <div className="tag-input-wrapper">
                  <input className="form-input" value={courseworkInput} onChange={e => setCourseworkInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCoursework(i); } }} placeholder="Data Structures, ML, etc." />
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => addCoursework(i)}>Add</button>
                </div>
                <div className="tags-container">
                  {(edu.coursework || []).map((c, ci) => (
                    <span key={ci} className="tag tag-info">
                      {c}
                      <span className="tag-close" onClick={() => removeCoursework(i, c)}>×</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-secondary w-full" onClick={addEducation}>+ Add Education</button>
        </SectionAccordion>

        {/* Certifications */}
        <SectionAccordion id="certifications" title="Certifications" icon="🏅" count={profile.certifications.length}>
          {profile.certifications.map((cert, i) => (
            <div key={i} className="repeatable-item">
              <div className="repeatable-header">
                <span className="repeatable-number">#{i + 1}</span>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeCertification(i)}>🗑 Remove</button>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" value={cert.name} onChange={e => updateCertification(i, 'name', e.target.value)} placeholder="AWS Solutions Architect" />
                </div>
                <div className="form-group">
                  <label className="form-label">Issuer</label>
                  <input className="form-input" value={cert.issuer} onChange={e => updateCertification(i, 'issuer', e.target.value)} placeholder="Amazon Web Services" />
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input className="form-input" value={cert.date} onChange={e => updateCertification(i, 'date', e.target.value)} placeholder="2024" />
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-secondary w-full" onClick={addCertification}>+ Add Certification</button>
        </SectionAccordion>

        {/* Achievements */}
        <SectionAccordion id="achievements" title="Achievements" icon="🏆" count={profile.achievements.length}>
          <div className="form-group">
            <div className="tag-input-wrapper">
              <input className="form-input" value={achievementInput} onChange={e => setAchievementInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAchievement(); } }} placeholder="Describe an achievement..." />
              <button type="button" className="btn btn-primary btn-sm" onClick={addAchievement}>Add</button>
            </div>
            <div className="achievements-list">
              {profile.achievements.map((a, i) => (
                <div key={i} className="achievement-item">
                  <span className="achievement-icon">🏆</span>
                  <span className="achievement-text">{a}</span>
                  <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => removeAchievement(i)}>×</button>
                </div>
              ))}
            </div>
          </div>
        </SectionAccordion>

        {/* Submit */}
        <div className="form-submit-section">
          <button type="submit" className="btn btn-primary btn-lg">
            Continue to Job Description →
          </button>
        </div>
      </form>

      <style>{`
        .profile-form-wrapper {
          max-width: 800px;
          margin: 0 auto;
        }

        .profile-header {
          text-align: center;
          margin-bottom: var(--space-2xl);
        }

        .profile-title {
          font-size: 2rem;
          font-weight: 800;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: var(--space-sm);
        }

        .profile-subtitle {
          color: var(--text-secondary);
          font-size: 1.0625rem;
          margin-bottom: var(--space-lg);
        }

        .profile-actions {
          display: flex;
          gap: var(--space-sm);
          justify-content: center;
          flex-wrap: wrap;
        }

        .json-import-panel {
          margin-bottom: var(--space-xl);
        }

        .json-import-panel h3 {
          margin-bottom: var(--space-md);
          font-weight: 600;
        }

        .json-import-actions {
          display: flex;
          gap: var(--space-sm);
          margin-top: var(--space-md);
        }

        .accordion-section {
          margin-bottom: var(--space-md);
          overflow: hidden;
        }

        .accordion-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-md) var(--space-lg);
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--font-body);
          color: var(--text-primary);
          font-size: 1rem;
          font-weight: 600;
          transition: background var(--transition-fast);
          margin: calc(-1 * var(--space-lg));
          margin-bottom: 0;
          width: calc(100% + 2 * var(--space-lg));
        }

        .accordion-header:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .accordion-title {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .accordion-icon {
          font-size: 1.125rem;
        }

        .accordion-count {
          background: var(--color-primary);
          color: white;
          font-size: 0.6875rem;
          font-weight: 700;
          padding: 0.125rem 0.5rem;
          border-radius: var(--radius-full);
        }

        .accordion-chevron {
          font-size: 1.25rem;
          transition: transform var(--transition-base);
          color: var(--text-tertiary);
        }

        .accordion-chevron.open {
          transform: rotate(180deg);
        }

        .accordion-body {
          padding-top: var(--space-lg);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: var(--space-md);
        }

        .tag-input-wrapper {
          display: flex;
          gap: var(--space-sm);
          margin-bottom: var(--space-sm);
        }

        .tag-input-wrapper .form-input {
          flex: 1;
        }

        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
          min-height: 1rem;
        }

        .repeatable-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-md);
          padding: var(--space-lg);
          margin-bottom: var(--space-md);
        }

        .repeatable-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-md);
        }

        .repeatable-number {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--color-primary-light);
        }

        .bullet-row {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-sm);
        }

        .bullet-dot {
          color: var(--color-primary-light);
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .bullet-input {
          flex: 1;
        }

        .achievements-list {
          margin-top: var(--space-md);
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .achievement-item {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-md);
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-md);
        }

        .achievement-text {
          flex: 1;
          font-size: 0.9375rem;
        }

        .form-submit-section {
          text-align: center;
          margin-top: var(--space-2xl);
        }

        @media (max-width: 640px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
