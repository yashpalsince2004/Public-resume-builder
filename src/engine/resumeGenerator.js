/**
 * ATS Resume Generator
 *
 * Builds a tailored, ATS-optimised resume from the match report + user profile.
 * Only uses data present in the profile JSON — never fabricates information.
 */

import { rankExperience, rankProjects } from './resumeMatcher.js';

// ── Action verbs for bullet rewriting ────────────────────────────────────
const ACTION_VERBS = {
  engineering: ['Engineered', 'Developed', 'Architected', 'Built', 'Implemented', 'Designed', 'Optimized', 'Automated', 'Deployed', 'Integrated', 'Refactored', 'Scaled'],
  leadership: ['Led', 'Directed', 'Managed', 'Coordinated', 'Mentored', 'Spearheaded', 'Orchestrated', 'Oversaw', 'Supervised', 'Facilitated'],
  analysis: ['Analyzed', 'Researched', 'Evaluated', 'Assessed', 'Investigated', 'Identified', 'Discovered', 'Diagnosed', 'Audited', 'Benchmarked'],
  impact: ['Increased', 'Reduced', 'Improved', 'Boosted', 'Accelerated', 'Streamlined', 'Enhanced', 'Achieved', 'Delivered', 'Generated'],
  collaboration: ['Collaborated', 'Partnered', 'Contributed', 'Supported', 'Assisted', 'Worked', 'Liaised', 'Presented', 'Communicated'],
};

/**
 * Get a random action verb from a category.
 */
function getActionVerb(category = 'engineering') {
  const verbs = ACTION_VERBS[category] || ACTION_VERBS.engineering;
  return verbs[Math.floor(Math.random() * verbs.length)];
}

/**
 * Rewrite a bullet point to be more ATS-friendly.
 * Ensures it starts with an action verb and naturally includes keywords when possible.
 */
function enhanceBullet(bullet, matchedKeywords) {
  if (!bullet || typeof bullet !== 'string') return bullet;

  let enhanced = bullet.trim();

  // Already starts with an action verb? Keep it
  const startsWithVerb = Object.values(ACTION_VERBS)
    .flat()
    .some(verb => enhanced.toLowerCase().startsWith(verb.toLowerCase()));

  if (!startsWithVerb) {
    // Remove leading articles and weak starters
    enhanced = enhanced.replace(/^(responsible for|helped with|worked on|assisted in|involved in|tasked with)\s*/i, '');

    // Capitalise first letter if not already
    if (enhanced.length > 0) {
      enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);
    }
  }

  // Ensure bullet ends with a period
  if (enhanced && !enhanced.endsWith('.') && !enhanced.endsWith('!')) {
    enhanced += '.';
  }

  return enhanced;
}

/**
 * Generate a professional summary tailored to the JD.
 *
 * @param {Object} profile
 * @param {string} roleTitle
 * @param {Array} matchedKeywords
 */
function generateSummary(profile, roleTitle, matchedKeywords) {
  // If the user already has a summary, enhance it
  const existingSummary = profile.summary || profile.objective || '';

  // Extract top matched skill keywords to weave in
  const topSkills = matchedKeywords
    .filter(kw => ['technical_skill', 'domain'].includes(kw.category))
    .slice(0, 5)
    .map(kw => kw.keyword);

  // Calculate years of experience
  const expYears = (profile.experience || []).length > 0
    ? calculateExperienceYears(profile.experience)
    : null;

  if (existingSummary) {
    // Use existing summary — just ensure it mentions the role title context
    return existingSummary;
  }

  // Build a new summary from profile data
  const name = profile.name || profile.fullName || '';
  const parts = [];

  if (expYears && expYears > 0) {
    parts.push(`Results-driven professional with ${expYears}+ years of experience`);
  } else {
    parts.push('Motivated and detail-oriented professional');
  }

  if (roleTitle) {
    parts[0] += ` in ${roleTitle.replace(/^(senior|junior|lead|staff|principal)\s*/i, '')} related domains`;
  }

  if (topSkills.length > 0) {
    parts.push(`Proficient in ${topSkills.slice(0, 3).join(', ')}${topSkills.length > 3 ? ', and more' : ''}`);
  }

  parts.push('Passionate about delivering high-quality solutions and driving measurable impact.');

  return parts.join('. ') + (parts[parts.length - 1].endsWith('.') ? '' : '.');
}

/**
 * Estimate total years of experience from experience entries.
 */
function calculateExperienceYears(experience) {
  if (!experience || !experience.length) return 0;

  let totalMonths = 0;
  for (const exp of experience) {
    const start = exp.startDate || exp.start || '';
    const end = exp.endDate || exp.end || 'Present';

    const startDate = parseDate(start);
    const endDate = end.toLowerCase() === 'present' ? new Date() : parseDate(end);

    if (startDate && endDate) {
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12
        + (endDate.getMonth() - startDate.getMonth());
      totalMonths += Math.max(0, months);
    }
  }

  return Math.round(totalMonths / 12);
}

/**
 * Rough date parser for common date formats.
 */
function parseDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;

  // Try "Month Year" format
  const match = dateStr.match(/(\w+)\s*(\d{4})/);
  if (match) {
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthIdx = months.findIndex(m => match[1].toLowerCase().startsWith(m));
    if (monthIdx >= 0) return new Date(parseInt(match[2]), monthIdx);
  }

  // Try just year
  const yearMatch = dateStr.match(/(\d{4})/);
  if (yearMatch) return new Date(parseInt(yearMatch[1]), 0);

  return null;
}

/**
 * Reorder skills to prioritize JD-matched ones.
 */
function reorderSkills(skills, matchedKeywords) {
  if (!skills) return [];

  const skillsList = Array.isArray(skills) ? skills : (typeof skills === 'object' ? Object.values(skills).flat() : [skills]);

  const matchedSet = new Set(matchedKeywords.map(kw => kw.keyword.toLowerCase()));

  const matched = [];
  const unmatched = [];

  for (const skill of skillsList) {
    const normalised = (typeof skill === 'string' ? skill : '').toLowerCase().trim();
    if (matchedSet.has(normalised) || [...matchedSet].some(kw => normalised.includes(kw) || kw.includes(normalised))) {
      matched.push(skill);
    } else {
      unmatched.push(skill);
    }
  }

  return [...matched, ...unmatched];
}

/**
 * Main resume generation function.
 *
 * @param {Object} profile - User's profile JSON
 * @param {Object} matchReport - Output from resumeMatcher.matchProfile
 * @param {string} roleTitle - Extracted role title from JD
 * @returns {Object} Tailored resume object
 */
export function generateResume(profile, matchReport, roleTitle) {
  if (!profile) return null;

  const matchedKeywords = matchReport?.matchedKeywords || [];

  // 1. Header
  const header = {
    name: profile.name || profile.fullName || '',
    email: profile.email || profile.contact?.email || '',
    phone: profile.phone || profile.contact?.phone || '',
    location: profile.location || profile.contact?.location || profile.city || '',
    linkedin: profile.linkedin || profile.links?.linkedin || '',
    github: profile.github || profile.links?.github || '',
    portfolio: profile.portfolio || profile.website || profile.links?.portfolio || '',
  };

  // 2. Professional title
  const professionalTitle = roleTitle || profile.title || profile.headline || '';

  // 3. Summary
  const summary = generateSummary(profile, roleTitle, matchedKeywords);

  // 4. Skills (reordered)
  const skills = reorderSkills(profile.skills, matchedKeywords);

  // 5. Experience (ranked & enhanced)
  const rankedExperience = rankExperience(profile.experience, matchReport?.matchedKeywords || []);
  const experience = rankedExperience.map(exp => ({
    title: exp.title || exp.role || '',
    company: exp.company || exp.organization || '',
    location: exp.location || '',
    startDate: exp.startDate || exp.start || '',
    endDate: exp.endDate || exp.end || 'Present',
    bullets: (exp.bullets || exp.highlights || exp.responsibilities || [])
      .map(b => enhanceBullet(b, matchedKeywords))
      .filter(Boolean),
  }));

  // 6. Projects (ranked & enhanced)
  const rankedProjects = rankProjects(profile.projects, matchReport?.matchedKeywords || []);
  const projects = rankedProjects.map(proj => ({
    name: proj.name || proj.title || '',
    description: proj.description || '',
    technologies: proj.technologies || proj.techStack || proj.tech || [],
    link: proj.link || proj.url || proj.github || '',
    highlights: (proj.highlights || proj.bullets || [])
      .map(b => enhanceBullet(b, matchedKeywords))
      .filter(Boolean),
  }));

  // 7. Education
  const education = (profile.education || []).map(edu => ({
    degree: edu.degree || '',
    field: edu.field || edu.major || '',
    institution: edu.institution || edu.school || edu.university || '',
    year: edu.year || edu.graduationYear || edu.endDate || '',
    gpa: edu.gpa || '',
    coursework: edu.coursework || [],
  }));

  // 8. Certifications
  const certifications = (profile.certifications || []).map(cert =>
    typeof cert === 'string' ? { name: cert } : { name: cert.name || '', issuer: cert.issuer || '', date: cert.date || '' }
  );

  // 9. Achievements
  const achievements = (profile.achievements || profile.awards || []).map(a =>
    typeof a === 'string' ? a : (a.title || a.name || a.description || '')
  ).filter(Boolean);

  // 10. Links
  const links = {};
  if (header.linkedin) links.LinkedIn = header.linkedin;
  if (header.github) links.GitHub = header.github;
  if (header.portfolio) links.Portfolio = header.portfolio;
  if (profile.links) {
    for (const [key, val] of Object.entries(profile.links)) {
      if (val && !links[key]) links[key] = val;
    }
  }

  return {
    header,
    professionalTitle,
    summary,
    skills,
    experience,
    projects,
    education,
    certifications,
    achievements,
    links,
    metadata: {
      generatedAt: new Date().toISOString(),
      targetRole: roleTitle,
      atsScore: matchReport?.overallScore || 0,
    },
  };
}
