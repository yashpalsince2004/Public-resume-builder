/**
 * ATS Score Calculator
 *
 * Calculates detailed ATS match scores and generates actionable improvement suggestions.
 */

/**
 * Calculate comprehensive ATS score.
 *
 * @param {Object} matchReport - Output from resumeMatcher.matchProfile
 * @param {Array} keywords - Extracted JD keywords
 * @param {Object} profile - User profile JSON
 * @returns {Object} Detailed ATS scoring report
 */
export function calculateATSScore(matchReport, keywords, profile) {
  if (!matchReport || !keywords || !keywords.length) {
    return {
      overall: 0,
      breakdown: {},
      grade: 'F',
      suggestions: [],
      keywordCoverage: { matched: 0, partial: 0, missing: 0, total: 0 },
    };
  }

  // ── Section scores ──────────────────────────────────────────────────────
  const breakdown = {};

  // Skills match
  const skillsSection = matchReport.sections?.skills || { score: 0 };
  breakdown.skills = {
    score: Math.min(100, skillsSection.score),
    label: 'Skills Match',
    weight: 0.30,
  };

  // Experience relevance
  const expSection = matchReport.sections?.experience || { score: 0 };
  breakdown.experience = {
    score: Math.min(100, expSection.score),
    label: 'Experience Relevance',
    weight: 0.30,
  };

  // Projects relevance
  const projSection = matchReport.sections?.projects || { score: 0 };
  breakdown.projects = {
    score: Math.min(100, projSection.score),
    label: 'Projects Relevance',
    weight: 0.15,
  };

  // Keyword density (how many JD keywords appear in profile)
  const keywordDensity = Math.round(
    ((matchReport.matchedKeywords?.length || 0) / (keywords.length || 1)) * 100
  );
  breakdown.keywords = {
    score: Math.min(100, keywordDensity),
    label: 'Keyword Coverage',
    weight: 0.15,
  };

  // Profile completeness
  const completeness = calculateCompleteness(profile);
  breakdown.completeness = {
    score: completeness,
    label: 'Profile Completeness',
    weight: 0.10,
  };

  // ── Weighted overall score ──────────────────────────────────────────────
  let overall = 0;
  for (const section of Object.values(breakdown)) {
    overall += section.score * section.weight;
  }
  overall = Math.round(overall);

  // ── Grade ───────────────────────────────────────────────────────────────
  const grade = overall >= 90 ? 'A+' :
    overall >= 80 ? 'A' :
    overall >= 70 ? 'B+' :
    overall >= 60 ? 'B' :
    overall >= 50 ? 'C' :
    overall >= 40 ? 'D' : 'F';

  // ── Keyword coverage summary ────────────────────────────────────────────
  const keywordCoverage = {
    matched: matchReport.matchedKeywords?.length || 0,
    partial: matchReport.partialMatches?.length || 0,
    missing: matchReport.missingKeywords?.length || 0,
    total: keywords.length,
  };

  // ── Improvement suggestions ─────────────────────────────────────────────
  const suggestions = generateSuggestions(matchReport, keywords, profile, breakdown);

  return { overall, breakdown, grade, suggestions, keywordCoverage };
}

/**
 * Calculate profile completeness score.
 */
function calculateCompleteness(profile) {
  if (!profile) return 0;

  const checks = [
    { field: 'name', weight: 10 },
    { field: 'email', weight: 10 },
    { field: 'phone', weight: 5 },
    { field: 'summary', weight: 15 },
    { field: 'skills', weight: 15, isArray: true },
    { field: 'experience', weight: 20, isArray: true },
    { field: 'projects', weight: 10, isArray: true },
    { field: 'education', weight: 10, isArray: true },
    { field: 'certifications', weight: 5, isArray: true },
  ];

  let score = 0;
  for (const check of checks) {
    const value = profile[check.field] || profile.contact?.[check.field];
    if (check.isArray) {
      if (Array.isArray(value) && value.length > 0) score += check.weight;
    } else if (value && String(value).trim().length > 0) {
      score += check.weight;
    }
  }

  return score;
}

/**
 * Generate actionable improvement suggestions.
 */
function generateSuggestions(matchReport, keywords, profile, breakdown) {
  const suggestions = [];

  // Missing high-weight keywords
  const criticalMissing = (matchReport.missingKeywords || [])
    .filter(kw => kw.weight >= 3)
    .slice(0, 5);

  if (criticalMissing.length > 0) {
    suggestions.push({
      type: 'warning',
      title: 'Missing Critical Keywords',
      description: `The job description emphasizes: ${criticalMissing.map(k => `"${k.keyword}"`).join(', ')}. These are NOT in your profile — add them only if they genuinely reflect your skills.`,
      impact: 'high',
    });
  }

  // Low skills match
  if (breakdown.skills?.score < 50) {
    suggestions.push({
      type: 'tip',
      title: 'Improve Skills Section',
      description: 'Your skills section covers less than half the JD requirements. Consider adding relevant skills you genuinely possess but may have overlooked.',
      impact: 'high',
    });
  }

  // No summary
  if (!profile.summary && !profile.objective) {
    suggestions.push({
      type: 'tip',
      title: 'Add a Professional Summary',
      description: 'A targeted 2–3 sentence summary at the top significantly improves ATS matching and recruiter engagement.',
      impact: 'medium',
    });
  }

  // Weak experience bullets
  const expBullets = (profile.experience || []).flatMap(e => e.bullets || e.highlights || e.responsibilities || []);
  const weakBullets = expBullets.filter(b =>
    b.toLowerCase().startsWith('responsible for') ||
    b.toLowerCase().startsWith('helped') ||
    b.toLowerCase().startsWith('worked on') ||
    b.length < 20
  );
  if (weakBullets.length > 0) {
    suggestions.push({
      type: 'tip',
      title: 'Strengthen Experience Bullets',
      description: `${weakBullets.length} bullet(s) use weak language. Start each with a strong action verb and include measurable outcomes where possible.`,
      impact: 'medium',
    });
  }

  // Low project relevance
  if (breakdown.projects?.score < 30 && (profile.projects || []).length > 0) {
    suggestions.push({
      type: 'info',
      title: 'Enhance Project Descriptions',
      description: 'Your projects have low keyword overlap with the JD. Add relevant technologies and outcomes to project descriptions.',
      impact: 'medium',
    });
  }

  // Missing certifications
  const certKeywords = keywords.filter(kw => kw.category === 'certification');
  if (certKeywords.length > 0 && (!profile.certifications || profile.certifications.length === 0)) {
    suggestions.push({
      type: 'info',
      title: 'Certifications Mentioned in JD',
      description: `The JD mentions: ${certKeywords.map(k => `"${k.keyword}"`).join(', ')}. If you hold any of these, add them to your profile.`,
      impact: 'low',
    });
  }

  // Profile completeness
  if (breakdown.completeness?.score < 70) {
    suggestions.push({
      type: 'info',
      title: 'Complete Your Profile',
      description: 'Fill in all profile sections (contact info, summary, skills, experience, education) for maximum ATS coverage.',
      impact: 'medium',
    });
  }

  // Partial matches (potential wins)
  const partials = (matchReport.partialMatches || []).slice(0, 3);
  if (partials.length > 0) {
    suggestions.push({
      type: 'tip',
      title: 'Close Matches Found',
      description: `Keywords like ${partials.map(k => `"${k.keyword}"`).join(', ')} partially match your profile. Review if you can add the exact terms.`,
      impact: 'medium',
    });
  }

  return suggestions.sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    return (impactOrder[a.impact] || 2) - (impactOrder[b.impact] || 2);
  });
}

/**
 * Get color for a score value.
 */
export function getScoreColor(score) {
  if (score >= 70) return '#10b981'; // green
  if (score >= 40) return '#f59e0b'; // yellow/amber
  return '#ef4444'; // red
}

/**
 * Get human-readable label for a score.
 */
export function getScoreLabel(score) {
  if (score >= 90) return 'Excellent Match';
  if (score >= 70) return 'Strong Match';
  if (score >= 50) return 'Good Match';
  if (score >= 30) return 'Fair Match';
  return 'Needs Improvement';
}
