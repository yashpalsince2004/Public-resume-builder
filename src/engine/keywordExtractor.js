/**
 * ATS Keyword Extractor
 *
 * Parses a job description and extracts scored keywords grouped by category.
 * Uses frequency analysis, positional weighting, and domain-aware phrase detection.
 */

// ── Common tech & domain phrases (treated as single tokens) ──────────────
const COMPOUND_PHRASES = [
  // AI / ML
  'machine learning', 'deep learning', 'natural language processing',
  'computer vision', 'reinforcement learning', 'large language models',
  'generative ai', 'artificial intelligence', 'data science', 'data engineering',
  'data analysis', 'data visualization', 'feature engineering',
  // Cloud & DevOps
  'amazon web services', 'google cloud platform', 'microsoft azure',
  'ci cd', 'ci/cd', 'continuous integration', 'continuous deployment',
  'infrastructure as code', 'site reliability',
  // Web / Mobile
  'full stack', 'front end', 'back end', 'react native', 'react js',
  'next js', 'node js', 'vue js', 'angular js', 'ruby on rails',
  'spring boot', 'express js', 'rest api', 'graphql api',
  'user experience', 'user interface', 'responsive design',
  // Databases
  'sql server', 'no sql', 'mongo db', 'postgre sql',
  // Soft skills / domain
  'project management', 'product management', 'agile methodology',
  'cross functional', 'problem solving', 'attention to detail',
  'team player', 'self starter', 'time management', 'communication skills',
  'stakeholder management', 'business intelligence', 'quality assurance',
  'test driven development', 'object oriented programming',
  'version control', 'code review',
];

// ── Stop-words to remove from keyword pool ───────────────────────────────
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'must',
  'about', 'above', 'after', 'again', 'against', 'all', 'am', 'any',
  'because', 'before', 'below', 'between', 'both', 'during', 'each',
  'few', 'further', 'get', 'got', 'he', 'her', 'here', 'him', 'his',
  'how', 'i', 'if', 'into', 'it', 'its', 'just', 'know', 'let', 'like',
  'me', 'more', 'most', 'my', 'no', 'nor', 'not', 'now', 'off', 'once',
  'only', 'other', 'our', 'out', 'over', 'own', 'per', 'same', 'she',
  'so', 'some', 'such', 'than', 'that', 'their', 'them', 'then', 'there',
  'these', 'they', 'this', 'those', 'through', 'too', 'under', 'until',
  'up', 'us', 'very', 'we', 'what', 'when', 'where', 'which', 'while',
  'who', 'whom', 'why', 'you', 'your', 'also', 'etc', 'including',
  'using', 'within', 'well', 'across', 'along', 'among', 'around',
  'work', 'working', 'ability', 'able', 'experience', 'role', 'looking',
  'join', 'team', 'company', 'opportunity', 'position', 'candidate',
  'ideal', 'strong', 'excellent', 'minimum', 'preferred', 'required',
  'requirements', 'qualifications', 'responsibilities', 'description',
  'years', 'year', 'plus', 'new', 'best', 'high', 'day',
]);

// ── Section heading patterns (help with positional weighting) ────────────
const SECTION_PATTERNS = {
  title: /^(?:job\s*title|position|role)\s*[:：]/im,
  requirements: /(?:requirements?|must\s*have|required|minimum\s*qualifications?)/i,
  preferred: /(?:nice\s*to\s*have|preferred|bonus|desired|plus)/i,
  responsibilities: /(?:responsibilities|duties|what\s*you.?ll\s*do|key\s*areas)/i,
  qualifications: /(?:qualifications?|education|degree)/i,
  skills: /(?:skills?|tech\s*stack|tools?|technologies)/i,
};

/**
 * Detect the likely role title from the first few lines of the JD.
 */
function extractRoleTitle(text) {
  const lines = text.split('\n').filter(l => l.trim().length > 0);

  // Check for explicit "Job Title: ..." or "Position: ..."
  for (const line of lines.slice(0, 10)) {
    const match = line.match(/(?:job\s*title|position|role)\s*[:：]\s*(.+)/i);
    if (match) return match[1].trim();
  }

  // Heuristic: first non-empty line that looks like a title (< 80 chars, no period)
  for (const line of lines.slice(0, 5)) {
    const clean = line.trim();
    if (clean.length > 5 && clean.length < 80 && !clean.includes('.') && !clean.match(/^(about|we|our|the|at|join)/i)) {
      return clean;
    }
  }

  return '';
}

/**
 * Split the JD into rough sections based on heading patterns.
 * Returns { sectionName: textContent }
 */
function splitSections(text) {
  const sections = { title: '', requirements: '', preferred: '', responsibilities: '', qualifications: '', skills: '', general: '' };
  let currentSection = 'general';

  for (const line of text.split('\n')) {
    for (const [name, pattern] of Object.entries(SECTION_PATTERNS)) {
      if (pattern.test(line)) {
        currentSection = name;
        break;
      }
    }
    sections[currentSection] += line + ' ';
  }

  return sections;
}

/**
 * Replace compound phrases with underscored versions so they stay as single tokens.
 */
function protectCompoundPhrases(text) {
  let result = text.toLowerCase();
  for (const phrase of COMPOUND_PHRASES) {
    const regex = new RegExp(phrase.replace(/[\/\-]/g, '[\\s/\\-]*'), 'gi');
    result = result.replace(regex, phrase.replace(/[\s/\-]+/g, '_'));
  }
  return result;
}

/**
 * Tokenize text into individual keywords, preserving protected compound phrases.
 */
function tokenize(text) {
  const protected_ = protectCompoundPhrases(text);
  return protected_
    .replace(/[^a-z0-9_#+.]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1)
    .map(t => t.replace(/_/g, ' '))
    .filter(t => !STOP_WORDS.has(t));
}

/**
 * Categorize a keyword based on common patterns.
 */
function categorizeKeyword(keyword) {
  const kw = keyword.toLowerCase();

  // Programming languages & frameworks
  const techPatterns = /^(python|java|javascript|typescript|c\+\+|c#|go|rust|ruby|php|swift|kotlin|scala|r|sql|html|css|react|angular|vue|node|django|flask|spring|laravel|rails|express|next|nuxt|svelte|tensorflow|pytorch|keras|docker|kubernetes|aws|azure|gcp|git|linux|bash|terraform|ansible|jenkins|jira|figma|sketch|tableau|power bi|excel|matlab|hadoop|spark|kafka|redis|mongodb|postgresql|mysql|elasticsearch|graphql|rest api|grpc)/;
  if (techPatterns.test(kw)) return 'technical_skill';

  // Soft skills
  const softPatterns = /^(leadership|communication|collaboration|teamwork|problem solving|analytical|creative|adaptable|mentor|presentation|negotiation|interpersonal|critical thinking|time management|organizational|attention to detail|self starter|proactive)/;
  if (softPatterns.test(kw)) return 'soft_skill';

  // Domain / methodology
  const domainPatterns = /^(agile|scrum|kanban|waterfall|devops|devsecops|microservices|serverless|machine learning|deep learning|data science|data engineering|cloud|security|compliance|gdpr|hipaa|soc|pci|iso|saas|b2b|b2c|fintech|healthtech|edtech|ecommerce|blockchain)/;
  if (domainPatterns.test(kw)) return 'domain';

  // Certifications
  const certPatterns = /^(certified|certification|certificate|cka|ckad|aws certified|pmp|csm|ccna|cissp|ceh|comptia)/;
  if (certPatterns.test(kw)) return 'certification';

  return 'general';
}

/**
 * Main extraction function.
 *
 * @param {string} jobDescription - Raw job description text
 * @returns {{ roleTitle: string, keywords: Array<{ keyword: string, weight: number, category: string, frequency: number }> }}
 */
export function extractKeywords(jobDescription) {
  if (!jobDescription || typeof jobDescription !== 'string') {
    return { roleTitle: '', keywords: [] };
  }

  const roleTitle = extractRoleTitle(jobDescription);
  const sections = splitSections(jobDescription);

  // Weight multipliers by section
  const sectionWeights = {
    title: 3.0,
    requirements: 2.5,
    skills: 2.5,
    qualifications: 2.0,
    responsibilities: 1.5,
    preferred: 1.2,
    general: 1.0,
  };

  // Count keywords with weighted frequency
  const keywordScores = {};

  for (const [sectionName, sectionText] of Object.entries(sections)) {
    const weight = sectionWeights[sectionName] || 1.0;
    const tokens = tokenize(sectionText);

    for (const token of tokens) {
      if (!keywordScores[token]) {
        keywordScores[token] = { keyword: token, weight: 0, frequency: 0, category: categorizeKeyword(token) };
      }
      keywordScores[token].frequency += 1;
      keywordScores[token].weight += weight;
    }
  }

  // Normalize and sort
  const keywords = Object.values(keywordScores)
    .map(k => ({
      ...k,
      weight: Math.round((k.weight + k.frequency * 0.5) * 100) / 100,
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 60); // top 60 keywords

  return { roleTitle, keywords };
}

/**
 * Group keywords by category for display.
 */
export function groupKeywordsByCategory(keywords) {
  const groups = {};
  for (const kw of keywords) {
    if (!groups[kw.category]) groups[kw.category] = [];
    groups[kw.category].push(kw);
  }
  return groups;
}
