/**
 * Gemini 3.6 Flash Integration Engine
 *
 * Provides:
 * 1. analyzeJdWithGemini(jobDescription) - Extracts role title, company info, exact requirements, and weighted keywords.
 * 2. generateTailoredResumeWithGemini(jobDescription, profile, geminiAnalysis) - Tailors candidate profile to JD with curated relevant skills.
 * 3. evaluateResumeWithGemini(jobDescription, resume) - Harsh ATS evaluator returning 0-100 score, grade, breakdown, and harsh critique points.
 * 4. regenerateResumeToFixCritique(jobDescription, currentResume, harshCritique, profile) - Regenerates resume to fix harsh ATS feedback points.
 */

// Helper to retrieve API key from env or window
function getApiKey() {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env.PUBLIC_GEMINI_API_KEY) return import.meta.env.PUBLIC_GEMINI_API_KEY;
    if (import.meta.env.GEMINI_API_KEY) return import.meta.env.GEMINI_API_KEY;
  }
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.PUBLIC_GEMINI_API_KEY) return process.env.PUBLIC_GEMINI_API_KEY;
    if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  }
  return '';
}

/**
 * 1. Analyze Job Description using Gemini 3.6 Flash
 */
export async function analyzeJdWithGemini(jobDescription) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('Gemini API key not found. Please set PUBLIC_GEMINI_API_KEY or GEMINI_API_KEY in .env file.');
  }

  const prompt = `You are an expert ATS (Applicant Tracking System) Analyst & Senior Technical Recruiter.
Analyze the following JOB DESCRIPTION thoroughly and extract key information into a structured JSON response.

JOB DESCRIPTION:
${jobDescription}

Return a strict JSON object with NO markdown syntax wrapper (no \`\`\`json):
{
  "roleTitle": "Exact or best-matching Job Title",
  "companyInfo": {
    "name": "Company Name if mentioned, or empty string",
    "domain": "Industry or domain area (e.g. Fintech, AI/ML, SaaS, E-commerce)",
    "about": "Brief 1-sentence company summary if available"
  },
  "exactRequirements": {
    "requiredSkills": ["skill1", "skill2", "skill3"],
    "preferredSkills": ["preferred1", "preferred2"],
    "experienceYears": "e.g. 0-2 years, 3+ years, Intern",
    "responsibilities": ["key responsibility 1", "key responsibility 2"],
    "qualifications": ["degree or background requirement"]
  },
  "keywords": [
    { "keyword": "Python", "weight": 5, "category": "technical_skill" },
    { "keyword": "REST APIs", "weight": 4, "category": "technical_skill" },
    { "keyword": "FastAPI", "weight": 4, "category": "framework" }
  ]
}`;

  const model = 'gemini-3.6-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errMsg = errorData.error?.message || `HTTP ${res.status}`;
    throw new Error(`Gemini 3.6 Flash API error: ${errMsg}`);
  }

  const data = await res.json();
  const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error('Gemini 3.6 Flash returned an empty response.');
  }

  const cleanJson = textOutput.replace(/```json/gi, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleanJson);

  return {
    roleTitle: parsed.roleTitle || '',
    companyInfo: parsed.companyInfo || { name: '', domain: '', about: '' },
    exactRequirements: parsed.exactRequirements || {
      requiredSkills: [],
      preferredSkills: [],
      experienceYears: '',
      responsibilities: [],
      qualifications: [],
    },
    keywords: (parsed.keywords || []).map(k => ({
      keyword: k.keyword,
      weight: k.weight || 3,
      category: k.category || 'technical_skill',
      frequency: 1,
    })),
  };
}

/**
 * 2. Generate ATS-Optimized Resume using Gemini 3.6 Flash
 */
export async function generateTailoredResumeWithGemini(jobDescription, profile, geminiAnalysis) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('Gemini API key not found in .env file.');
  }

  const prompt = `You are an expert ATS Resume Optimization Engine & Senior Technical Recruiter.
Tailor the candidate's profile to align perfectly with the target JOB DESCRIPTION, strictly adhering to the exact structural hierarchy, section ordering, and entry conventions of Example.tex (RenderCV standard).

EXACT STRUCTURE & SECTION ORDERING (Derived from Example.tex):
1. HEADER: Factual name, location, email, phone, portfolio, linkedin, github.
2. PROFILE / SUMMARY: A high-impact 3-4 sentence professional summary highlighting core technical domain, key production achievements, and alignment with the target role.
3. CATEGORIZED SKILLS: Categorize skills into logical groups (e.g., "Agentic AI", "Generative AI & LLMs", "Cloud & Azure", "Backend & APIs", "Vector Databases", "Frameworks & Tools", "Practices") with tailored skills under each category matching the JD requirements.
4. EDUCATION: Factual institution, degree, year, GPA, and relevant coursework list.
5. EXPERIENCE: Factual role, company, location, dates, and 3-4 metric-driven, impact-focused bullet points incorporating target JD keywords.
6. PROJECTS: Curate the 2-3 most relevant projects. For each project, provide a clear title, link, detailed bullet points highlighting technical architecture, and an explicit list of tools/technologies used ("Tools Used: ...").
7. CERTIFICATIONS & ACHIEVEMENTS: Include relevant certifications with name, issuer, date, and link.

CORE SCORING & TAILORING RULES:
1. Use ONLY factual background present in the candidate's profile. Do NOT invent new companies, degrees, dates, or non-existent jobs.
2. REPHRASE, REORDER, and ENHANCE the candidate's Profile Summary, Work Experience bullets, and Project Descriptions to match the target job description requirements.
3. WEAVE IN target Job Description keywords, action verbs, and responsibilities naturally into bullets and summary to maximize ATS keyword density.
4. Keep bullet points concise, metric-driven, and impact-focused.

TARGET JOB DESCRIPTION:
${jobDescription}

EXTRACTED ROLE & REQUIREMENTS:
Role Title: ${geminiAnalysis.roleTitle || ''}
Company: ${geminiAnalysis.companyInfo?.name || ''} (${geminiAnalysis.companyInfo?.domain || ''})
Required Skills: ${(geminiAnalysis.exactRequirements?.requiredSkills || []).join(', ')}
Responsibilities: ${(geminiAnalysis.exactRequirements?.responsibilities || []).join('; ')}
High Weight Keywords: ${(geminiAnalysis.keywords || []).map(k => k.keyword).join(', ')}

CANDIDATE PROFILE JSON:
${JSON.stringify(profile, null, 2)}

Return a strict JSON object matching this structure with no markdown wrapper:
{
  "header": {
    "name": "${profile.name}",
    "location": "${profile.location}",
    "email": "${profile.email}",
    "phone": "${profile.phone}",
    "portfolio": "${profile.portfolio}",
    "linkedin": "${profile.linkedin}",
    "github": "${profile.github}"
  },
  "professionalTitle": "${geminiAnalysis.roleTitle || profile.title || 'AI/ML Engineer'}",
  "summary": "Rephrased 3-4 sentence professional summary tailored to this exact job description with high keyword density.",
  "categorizedSkills": [
    { "category": "Agentic AI", "skills": ["Multi-Agent System Design", "LLM Reasoning & Planning", "MCP", "Prompt Engineering"] },
    { "category": "Generative AI & LLMs", "skills": ["OpenAI API", "Claude API", "Gemini API", "DeepSeek API", "RAG Pipelines"] },
    { "category": "Backend & APIs", "skills": ["Python", "FastAPI", "REST API Design", "Microservices Architecture"] },
    { "category": "Cloud & Infrastructure", "skills": ["AWS", "Docker", "Firebase Suite", "Git/GitHub"] }
  ],
  "skills": ["Python", "FastAPI", "REST APIs", "OpenAI API", "Claude API", "Gemini API", "AWS", "Docker", "Git"],
  "experience": [
    {
      "title": "Role Title",
      "company": "Company Name",
      "location": "Location",
      "startDate": "Start Date",
      "endDate": "End Date",
      "bullets": [
        "Rephrased action bullet integrating target JD keywords and metric impact...",
        "Bullet 2...",
        "Bullet 3..."
      ]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "link": "Project Link / URL",
      "url": "Project URL",
      "description": "Rephrased project summary highlighting alignment with JD requirements.",
      "technologies": ["Python", "FastAPI", "AWS", "Docker"],
      "highlights": [
        "Architected core multi-agent routing backend to process high-volume requests...",
        "Engineered resilient API endpoints with async handling...",
        "Tools Used: Python, FastAPI, AWS, Docker, REST APIs"
      ]
    }
  ],
  "education": ${JSON.stringify(profile.education || [])},
  "certifications": [
    { "name": "Research Paper Published — Multimodal Conversational AI System", "issuer": "Google", "url": "https://linkedin.com/..." },
    { "name": "AI Fluency: Framework and Foundations", "issuer": "Anthropic", "url": "https://verify.skilljar.com/..." },
    { "name": "Career Essentials in GitHub Professional Certificate", "issuer": "LinkedIn", "url": "https://linkedin.com/..." }
  ]
}`;

  const model = 'gemini-3.6-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errMsg = errorData.error?.message || `HTTP ${res.status}`;
    throw new Error(`Gemini 3.6 Flash Tailoring Error: ${errMsg}`);
  }

  const data = await res.json();
  const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error('Gemini 3.6 Flash returned an empty response.');
  }

  const cleanJson = textOutput.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleanJson);
}

/**
 * 3. Harsh ATS Evaluator using Gemini 3.6 Flash
 */
export async function evaluateResumeWithGemini(jobDescription, resume) {
  const apiKey = getApiKey();

  if (!apiKey) {
    return calculateFallbackAtsScore(jobDescription, resume);
  }

  const prompt = `You are an extremely strict, harsh enterprise ATS (Applicant Tracking System) Evaluator and Senior Technical Recruiter.
Evaluate the following RESUME against the target JOB DESCRIPTION with ruthless scrutiny.

EVALUATION CRITERIA:
1. Exact & Preferred Technical Skill Match (30 points)
2. Relevant Work & Internship Experience Alignment (30 points)
3. Project Relevance & Verifiable Technical Evidence (20 points)
4. Overall Keyword Density & Role Title Match (20 points)

HARSH EVALUATION INSTRUCTIONS:
- Deduct points aggressively for missing required JD keywords, vague bullet points without metrics, or bloated irrelevant skills.
- Grade strictly: 85-100 = A/A+, 75-84 = B/B+, 60-74 = C/C+, below 60 = Fail/D.
- Provide 3 to 5 specific, harsh critique points explaining exactly why points were lost and what needs fixing to achieve 90+ score.

JOB DESCRIPTION:
${jobDescription}

RESUME TO EVALUATE:
${JSON.stringify(resume, null, 2)}

Return a strict JSON object with NO markdown syntax wrapper (no \`\`\`json):
{
  "overall": 72,
  "grade": "C+",
  "breakdown": {
    "skillsMatch": { "label": "Technical Skills Match", "score": 68 },
    "experienceMatch": { "label": "Experience Alignment", "score": 62 },
    "projectEvidence": { "label": "Project Evidence", "score": 78 },
    "keywordDensity": { "label": "Keyword Density", "score": 75 }
  },
  "harshCritique": [
    "Failed to include core required keyword 'SQL' in the skills or experience section...",
    "Bullet points lack quantifiable metrics or key performance indicators...",
    "Skills section is bloated with irrelevant technologies diluting core domain focus."
  ]
}`;

  const model = 'gemini-3.6-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      console.warn('Gemini 3.6 Flash Evaluation HTTP error, using fallback evaluator.');
      return calculateFallbackAtsScore(jobDescription, resume);
    }

    const data = await res.json();
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textOutput) {
      return calculateFallbackAtsScore(jobDescription, resume);
    }

    const cleanJson = textOutput.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.warn('Gemini 3.6 Flash evaluation failed, using fallback evaluator:', err);
    return calculateFallbackAtsScore(jobDescription, resume);
  }
}

/**
 * 4. Regenerate Resume to Fix Harsh ATS Feedback Points
 */
export async function regenerateResumeToFixCritique(jobDescription, currentResume, harshCritique, profile) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('Gemini API key not found in .env file.');
  }

  const critiqueList = (harshCritique || []).map((c, i) => `${i + 1}. ${c}`).join('\n');

  const prompt = `You are an expert ATS Resume Optimization Engine.
The previous resume version received the following HARSH ATS CRITIQUE feedback points from an enterprise ATS reviewer:

HARSH CRITIQUE POINTS TO FIX:
${critiqueList || '1. Strengthen bullet point metrics and keyword alignment.'}

JOB DESCRIPTION:
${jobDescription}

CURRENT RESUME VERSION:
${JSON.stringify(currentResume, null, 2)}

CANDIDATE PROFILE FACTS:
${JSON.stringify(profile, null, 2)}

REGENERATION TASK & RULES:
1. Specifically rewrite and enhance the resume to address EVERY harsh critique point listed above.
2. Curate a focused list of 8 to 14 skills directly relevant to the JD and role focus. Remove bloated/irrelevant skills.
3. Curate and include ONLY 3 to 5 certifications from the candidate's profile that are directly relevant to the target Job Description or its specific technical domain.
4. Select ONLY the 2 to 3 most relevant or relatable projects matching the target Job Description, required tech stack, or company domain.
5. In each project's "technologies" (Tools Used) and descriptions, explicitly emphasize and highlight the exact tech stack and tools required by the company in the Job Description.
6. Where bullets lacked metric impact or strong action verbs, strengthen them using true candidate profile facts.
7. Where technical keywords or tools were missing, weave them seamlessly into the summary, skills, projects, or experience bullets.
8. Do NOT fabricate non-existent companies, fake degrees, or false claims. Maintain strict truthfulness to the candidate profile.

Return a strict JSON object matching the resume structure with no markdown syntax:
{
  "header": ${JSON.stringify(currentResume.header)},
  "professionalTitle": "${currentResume.professionalTitle}",
  "summary": "Revised summary specifically resolving the critique points...",
  "skills": ["CuratedSkill1", "CuratedSkill2", "CuratedSkill3", "CuratedSkill4", "CuratedSkill5", "CuratedSkill6", "CuratedSkill7", "CuratedSkill8"],
  "experience": [
    {
      "title": "Role Title",
      "company": "Company Name",
      "location": "Location",
      "startDate": "Start Date",
      "endDate": "End Date",
      "bullets": [
        "Revised high-impact bullet point resolving critique point...",
        "Bullet 2...",
        "Bullet 3..."
      ]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "link": "Project Link",
      "url": "Project URL",
      "description": "Revised project description resolving critique point.",
      "technologies": ["tech1", "tech2"],
      "highlights": [
        "Revised achievement bullet..."
      ]
    }
  ],
  "education": ${JSON.stringify(currentResume.education || [])},
  "certifications": ["Relevant Certification 1", "Relevant Certification 2", "Relevant Certification 3"]
}`;

  const model = 'gemini-3.6-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errMsg = errorData.error?.message || `HTTP ${res.status}`;
    throw new Error(`Gemini 3.6 Flash Regeneration Error: ${errMsg}`);
  }

  const data = await res.json();
  const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error('Gemini 3.6 Flash returned an empty response.');
  }

  const cleanJson = textOutput.replace(/```json/gi, '').replace(/```/g, '').trim();
  return JSON.parse(cleanJson);
}

/**
 * Fallback ATS Evaluator if API fails
 */
function calculateFallbackAtsScore(jobDescription, resume) {
  if (!jobDescription || !resume) {
    return {
      overall: 0,
      grade: 'F',
      breakdown: {
        skillsMatch: { label: 'Technical Skills Match', score: 0 },
        experienceMatch: { label: 'Experience Alignment', score: 0 },
        projectEvidence: { label: 'Project Evidence', score: 0 },
        keywordDensity: { label: 'Keyword Density', score: 0 },
      },
      harshCritique: ['No job description or resume provided for evaluation.'],
    };
  }

  const text = JSON.stringify(resume).toLowerCase();
  const jdWords = jobDescription.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const uniqueJdWords = Array.from(new Set(jdWords));

  let matched = 0;
  uniqueJdWords.forEach(w => {
    if (text.includes(w)) matched++;
  });

  const ratio = uniqueJdWords.length > 0 ? matched / uniqueJdWords.length : 0.5;
  const overall = Math.min(95, Math.max(50, Math.round(ratio * 100 + 20)));

  return {
    overall,
    grade: overall >= 85 ? 'A' : overall >= 75 ? 'B+' : overall >= 65 ? 'C+' : 'D',
    breakdown: {
      skillsMatch: { label: 'Technical Skills Match', score: Math.min(100, overall + 2) },
      experienceMatch: { label: 'Experience Alignment', score: Math.max(40, overall - 5) },
      projectEvidence: { label: 'Project Evidence', score: Math.min(100, overall + 5) },
      keywordDensity: { label: 'Keyword Density', score: overall },
    },
    harshCritique: [
      'Resume requires tighter keyword alignment with required technical specifications.',
      'Enhance work experience bullet points with quantifiable performance metrics.',
      'Ensure skills section prioritizes core domain technologies expected for the role.',
    ],
  };
}
