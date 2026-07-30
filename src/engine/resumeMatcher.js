/**
 * ATS Resume Matcher
 *
 * Compares extracted JD keywords against the user's profile JSON.
 * Produces a detailed match report with per-section scores and keyword coverage.
 */

/**
 * Normalize a string for comparison.
 */
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if a keyword exists within a text corpus.
 * Returns true for exact or partial matches.
 */
function containsKeyword(corpus, keyword) {
  const normalizedCorpus = normalize(corpus);
  const normalizedKeyword = normalize(keyword);
  if (!normalizedKeyword) return false;

  // Exact word boundary match
  const regex = new RegExp(`\\b${normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  return regex.test(normalizedCorpus);
}

/**
 * Build a text corpus from a profile section.
 */
function buildCorpus(profile, section) {
  switch (section) {
    case 'skills': {
      const skills = profile.skills || [];
      if (Array.isArray(skills)) return skills.join(' ');
      if (typeof skills === 'object') return Object.values(skills).flat().join(' ');
      return String(skills);
    }
    case 'experience': {
      return (profile.experience || [])
        .map(exp => [
          exp.title || exp.role || '',
          exp.company || '',
          exp.description || '',
          ...(exp.bullets || exp.highlights || exp.responsibilities || []),
        ].join(' '))
        .join(' ');
    }
    case 'projects': {
      return (profile.projects || [])
        .map(proj => [
          proj.name || proj.title || '',
          proj.description || '',
          ...(proj.technologies || proj.techStack || proj.tech || []),
          ...(proj.highlights || proj.bullets || []),
        ].join(' '))
        .join(' ');
    }
    case 'education': {
      return (profile.education || [])
        .map(edu => [
          edu.degree || '',
          edu.field || edu.major || '',
          edu.institution || edu.school || edu.university || '',
          ...(edu.coursework || []),
        ].join(' '))
        .join(' ');
    }
    case 'certifications': {
      return (profile.certifications || [])
        .map(cert => [
          typeof cert === 'string' ? cert : (cert.name || ''),
          typeof cert === 'string' ? '' : (cert.issuer || ''),
        ].join(' '))
        .join(' ');
    }
    default:
      return '';
  }
}

/**
 * Match profile against JD keywords.
 *
 * @param {{ keyword: string, weight: number, category: string }[]} keywords
 * @param {Object} profile - User profile JSON
 * @returns {Object} Match report
 */
export function matchProfile(keywords, profile) {
  if (!keywords || !keywords.length || !profile) {
    return {
      overallScore: 0,
      sections: {},
      matchedKeywords: [],
      missingKeywords: [],
      partialMatches: [],
    };
  }

  const sections = ['skills', 'experience', 'projects', 'education', 'certifications'];
  const sectionCorpus = {};
  for (const section of sections) {
    sectionCorpus[section] = buildCorpus(profile, section);
  }

  // Also check summary
  const summaryCorpus = normalize(profile.summary || profile.objective || '');

  // Full profile corpus for overall matching
  const fullCorpus = [summaryCorpus, ...Object.values(sectionCorpus)].join(' ');

  const matchedKeywords = [];
  const missingKeywords = [];
  const partialMatches = [];

  // Per-section match tracking
  const sectionMatches = {};
  for (const section of sections) {
    sectionMatches[section] = { matched: [], total: 0 };
  }

  for (const kw of keywords) {
    const isFullMatch = containsKeyword(fullCorpus, kw.keyword);

    if (isFullMatch) {
      const foundIn = [];
      for (const section of sections) {
        if (containsKeyword(sectionCorpus[section], kw.keyword)) {
          foundIn.push(section);
          sectionMatches[section].matched.push(kw.keyword);
        }
      }
      if (containsKeyword(summaryCorpus, kw.keyword)) {
        foundIn.push('summary');
      }
      matchedKeywords.push({ ...kw, foundIn });
    } else {
      // Check for partial matches (e.g., "react" matches "react native")
      const kwParts = kw.keyword.split(' ');
      const hasPartial = kwParts.length > 1 && kwParts.some(part => containsKeyword(fullCorpus, part));

      if (hasPartial) {
        partialMatches.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    }
  }

  // Calculate section scores
  const sectionScores = {};
  const sectionWeights = { skills: 0.35, experience: 0.30, projects: 0.15, education: 0.10, certifications: 0.10 };

  for (const section of sections) {
    const relevantKeywords = keywords.filter(kw => {
      if (section === 'skills') return ['technical_skill', 'domain', 'general'].includes(kw.category);
      if (section === 'certifications') return kw.category === 'certification';
      return true;
    });

    const matchCount = sectionMatches[section].matched.length;
    const total = relevantKeywords.length || 1;
    sectionScores[section] = {
      score: Math.round((matchCount / total) * 100),
      matched: sectionMatches[section].matched,
      total: relevantKeywords.length,
    };
  }

  // Overall score
  const totalWeight = keywords.reduce((sum, kw) => sum + kw.weight, 0);
  const matchedWeight = matchedKeywords.reduce((sum, kw) => sum + kw.weight, 0);
  const partialWeight = partialMatches.reduce((sum, kw) => sum + kw.weight * 0.3, 0);
  const overallScore = Math.min(100, Math.round(((matchedWeight + partialWeight) / (totalWeight || 1)) * 100));

  return {
    overallScore,
    sections: sectionScores,
    matchedKeywords,
    missingKeywords,
    partialMatches,
  };
}

/**
 * Rank experience entries by relevance to keywords.
 */
export function rankExperience(experience, keywords) {
  if (!experience || !keywords) return experience || [];

  const keywordSet = new Set(keywords.map(k => normalize(k.keyword)));

  return [...experience]
    .map(exp => {
      const corpus = normalize([
        exp.title || exp.role || '',
        exp.description || '',
        ...(exp.bullets || exp.highlights || exp.responsibilities || []),
      ].join(' '));

      let relevance = 0;
      for (const kw of keywordSet) {
        if (corpus.includes(kw)) relevance++;
      }
      return { ...exp, _relevance: relevance };
    })
    .sort((a, b) => b._relevance - a._relevance);
}

/**
 * Rank projects by relevance to keywords.
 */
export function rankProjects(projects, keywords) {
  if (!projects || !keywords) return projects || [];

  const keywordSet = new Set(keywords.map(k => normalize(k.keyword)));

  return [...projects]
    .map(proj => {
      const corpus = normalize([
        proj.name || proj.title || '',
        proj.description || '',
        ...(proj.technologies || proj.techStack || proj.tech || []),
        ...(proj.highlights || proj.bullets || []),
      ].join(' '));

      let relevance = 0;
      for (const kw of keywordSet) {
        if (corpus.includes(kw)) relevance++;
      }
      return { ...proj, _relevance: relevance };
    })
    .sort((a, b) => b._relevance - a._relevance);
}
