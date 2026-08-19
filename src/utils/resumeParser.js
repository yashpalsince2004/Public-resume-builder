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

export const EMPTY_PROFILE = {
  name: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  github: '',
  portfolio: '',
  title: '',
  summary: '',
  skills: [],
  experience: [],
  projects: [],
  education: [],
  certifications: [],
  achievements: [],
};

export async function readTextFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    if (file.name.endsWith('.json')) {
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read JSON file'));
      reader.readAsText(file);
      return;
    }

    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error('Failed to read file text'));
    reader.readAsText(file);
  });
}

export async function parseResumeWithGemini(rawText) {
  const apiKey = getApiKey();

  if (!apiKey) {
    return parseResumeFallback(rawText);
  }

  const prompt = `You are an expert Resume Parsing Engine & Recruiter ATS System.
Parse the following raw candidate resume text into a standardized JSON Candidate Profile.

RAW RESUME TEXT:
${rawText}

INSTRUCTIONS:
1. Extract personal details (name, email, phone, location, linkedin, github, portfolio).
2. Extract or summarize candidate's professional title and 3-4 sentence professional summary.
3. Extract technical and soft skills as a flat array of string items.
4. Extract work experience entries: title, company, location, startDate, endDate, and bullets array.
5. Extract project entries: name, link/url, description, technologies array, highlights bullets array.
6. Extract education entries: degree, field, institution, year, gpa, coursework array.
7. Extract certifications and achievements if present.

Return ONLY a strict JSON object with NO markdown syntax wrapper (no \`\`\`json):
{
  "name": "Full Name",
  "email": "email@domain.com",
  "phone": "+1 ...",
  "location": "City, Country",
  "linkedin": "https://linkedin.com/in/...",
  "github": "https://github.com/...",
  "portfolio": "https://...",
  "title": "Software Engineer / Job Title",
  "summary": "Professional summary...",
  "skills": ["Skill1", "Skill2", "Skill3"],
  "experience": [
    {
      "title": "Role Title",
      "company": "Company Name",
      "location": "Location",
      "startDate": "Start Date",
      "endDate": "End Date",
      "bullets": ["Bullet 1", "Bullet 2"]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "link": "URL",
      "description": "Short summary",
      "technologies": ["React", "Node.js"],
      "highlights": ["Highlight 1"]
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "institution": "University Name",
      "year": "2020 - 2024",
      "gpa": "3.8/4.0",
      "coursework": ["Data Structures", "Algorithms"]
    }
  ],
  "certifications": [
    { "name": "Cert Name", "issuer": "Issuer", "date": "Date" }
  ],
  "achievements": ["Achievement 1"]
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      return parseResumeFallback(rawText);
    }

    const data = await res.json();
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textOutput) {
      return parseResumeFallback(rawText);
    }

    const cleanJson = textOutput.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      ...EMPTY_PROFILE,
      ...parsed,
    };
  } catch (err) {
    return parseResumeFallback(rawText);
  }
}

export function parseResumeFallback(rawText) {
  try {
    const parsedJson = JSON.parse(rawText);
    if (typeof parsedJson === 'object' && parsedJson !== null) {
      return {
        ...EMPTY_PROFILE,
        ...parsedJson,
      };
    }
  } catch {
    // ignore
  }

  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = rawText.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const linkedinMatch = rawText.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/);
  const githubMatch = rawText.match(/https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+/);

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const name = lines[0] && lines[0].length < 40 ? lines[0] : 'Candidate';

  return {
    ...EMPTY_PROFILE,
    name: name,
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0] : '',
    linkedin: linkedinMatch ? linkedinMatch[0] : '',
    github: githubMatch ? githubMatch[0] : '',
    summary: lines.slice(1, 4).join(' '),
  };
}
