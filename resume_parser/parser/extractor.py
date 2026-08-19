import re
from typing import Dict, List, Optional, Tuple
from parser.models import (
    CandidateInfo,
    LocationInfo,
    EducationItem,
    ExperienceItem,
    ProjectItem,
    CertificationItem,
)
from parser.skills_dictionary import extract_skills


# ── Location Dictionaries ──────────────────────────────────────────
INDIAN_CITIES = {
    "mumbai": ("Mumbai", "Maharashtra", "India"),
    "bengaluru": ("Bengaluru", "Karnataka", "India"),
    "bangalore": ("Bengaluru", "Karnataka", "India"),
    "delhi": ("Delhi", "Delhi", "India"),
    "new delhi": ("New Delhi", "Delhi", "India"),
    "pune": ("Pune", "Maharashtra", "India"),
    "hyderabad": ("Hyderabad", "Telangana", "India"),
    "chennai": ("Chennai", "Tamil Nadu", "India"),
    "kolkata": ("Kolkata", "West Bengal", "India"),
    "gurgaon": ("Gurugram", "Haryana", "India"),
    "gurugram": ("Gurugram", "Haryana", "India"),
    "noida": ("Noida", "Uttar Pradesh", "India"),
    "ahmedabad": ("Ahmedabad", "Gujarat", "India"),
    "jaipur": ("Jaipur", "Rajasthan", "India"),
    "surat": ("Surat", "Gujarat", "India"),
    "indore": ("Indore", "Madhya Pradesh", "India"),
    "chandigarh": ("Chandigarh", "Punjab", "India"),
    "kochi": ("Kochi", "Kerala", "India"),
    "trivandrum": ("Thiruvananthapuram", "Kerala", "India"),
    "thiruvananthapuram": ("Thiruvananthapuram", "Kerala", "India"),
}

INDIAN_STATES = [
    "Maharashtra", "Karnataka", "Delhi", "Telangana", "Tamil Nadu",
    "West Bengal", "Haryana", "Uttar Pradesh", "Gujarat", "Rajasthan",
    "Punjab", "Kerala", "Madhya Pradesh"
]


# ── Heading Normalization Map ──────────────────────────────────────
SECTION_HEADINGS = {
    "summary": ["summary", "profile", "objective", "about me", "professional summary"],
    "education": ["education", "academic background", "academic qualifications", "academics"],
    "experience": ["experience", "work experience", "employment history", "employment", "work history", "internships", "positions of responsibility"],
    "projects": ["projects", "key projects", "personal projects", "academic projects"],
    "skills": ["skills", "technical skills", "core competencies", "technologies", "tech stack"],
    "certifications": ["certifications", "certificates", "licenses"],
    "achievements": ["achievements", "awards", "honors", "accomplishments", "publications", "research"]
}


# ── Regex Patterns ─────────────────────────────────────────────────
EMAIL_REGEX = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")

PHONE_REGEX = re.compile(
    r"(?:\+\d{1,3}[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}|(?:\+\d{1,3}[-.\s]?)?\d{5}[-.\s]?\d{5}|\+\d{1,3}[-.\s]?\d{10}|\b\d{10}\b"
)

URL_REGEX = re.compile(r"https?://[^\s()<>]+(?:\([\w\d]+\)|([^[:punct:]\s]|/))")
DOMAIN_URL_REGEX = re.compile(r"(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:/[^\s]*)?")

DEGREE_PATTERNS = [
    "Bachelor of Engineering", "Bachelor of Technology", "Master of Technology",
    "Bachelor of Science", "Master of Science", "Bachelor of Computer Applications",
    "Master of Computer Applications", "Bachelor of Arts", "Master of Arts",
    "B.Tech", "B.E", "B.E.", "M.Tech", "M.E", "M.E.", "B.Sc", "M.Sc", "BCA", "MCA",
    "B.A", "M.A", "MBA", "Ph.D", "Diploma", "High School", "Class XII", "Class X"
]


def extract_candidate_info(text: str) -> CandidateInfo:
    """
    Main entry point for extracting candidate details from clean text.
    Uses strict deterministic rules and regex patterns.
    """
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    sections = segment_sections(lines)

    email = extract_email(text)
    phone = extract_phone(text)
    linkedin, github, portfolio = extract_urls(text)
    name = extract_name(lines, email, phone)
    location = extract_location(text)
    summary = extract_summary_text(sections.get("summary", []))
    skills = extract_skills(text)
    education = extract_education(sections.get("education", []))
    experience = extract_experience(sections.get("experience", []))
    projects = extract_projects(sections.get("projects", []))
    certifications = extract_certifications(sections.get("certifications", []))
    achievements = extract_achievements(sections.get("achievements", []))

    return CandidateInfo(
        name=name,
        email=email,
        phone=phone,
        linkedin=linkedin,
        github=github,
        portfolio=portfolio,
        location=location,
        summary=summary,
        skills=skills,
        education=education,
        experience=experience,
        projects=projects,
        certifications=certifications,
        achievements=achievements,
    )


def segment_sections(lines: List[str]) -> Dict[str, List[str]]:
    """
    Identifies section headings in line sequence and segments lines into section buckets.
    """
    sections: Dict[str, List[str]] = {}
    current_section: Optional[str] = None

    for line in lines:
        cleaned_line = line.strip().lower().rstrip(":")
        # Check if line matches a canonical section heading
        matched_section = None
        for canonical, aliases in SECTION_HEADINGS.items():
            if cleaned_line in aliases:
                matched_section = canonical
                break
        
        if matched_section:
            current_section = matched_section
            if current_section not in sections:
                sections[current_section] = []
        else:
            if current_section:
                sections[current_section].append(line)

    return sections


def extract_name(lines: List[str], email: Optional[str], phone: Optional[str]) -> Optional[str]:
    """
    Extracts name from top non-empty lines.
    Accepts 2-5 word title-case/Unicode strings excluding emails, URLs, and phones.
    """
    for line in lines[:5]:
        if EMAIL_REGEX.search(line) or PHONE_REGEX.search(line):
            continue
        if "http" in line.lower() or "linkedin" in line.lower() or "github" in line.lower():
            continue
        
        # Check if line is a section heading
        line_lower = line.lower().rstrip(":")
        is_heading = any(line_lower in aliases for aliases in SECTION_HEADINGS.values())
        if is_heading:
            continue

        words = line.split()
        if 2 <= len(words) <= 5:
            # Check title-case or non-lowercase Unicode words
            if all(w[0].isupper() or not w[0].islower() for w in words if w):
                return line.strip()

    return None


def extract_email(text: str) -> Optional[str]:
    match = EMAIL_REGEX.search(text)
    return match.group(0).strip() if match else None


def extract_phone(text: str) -> Optional[str]:
    match = PHONE_REGEX.search(text)
    if match:
        raw_phone = match.group(0).strip()
        # Clean multiple internal spaces
        normalized = re.sub(r"\s+", " ", raw_phone)
        return normalized
    return None


def extract_urls(text: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """
    Extracts LinkedIn, GitHub, and Portfolio URLs.
    """
    linkedin = None
    github = None
    portfolio = None

    tokens = text.replace("\n", " ").replace("\t", " ").split()
    for token in tokens:
        clean_token = token.strip("(),;:[]'\"").rstrip(".")
        if "@" in clean_token:
            continue
        
        lower_token = clean_token.lower()
        if "linkedin.com" in lower_token:
            url = clean_token if clean_token.startswith("http") else "https://" + clean_token
            if not linkedin:
                linkedin = url
        elif "github.com" in lower_token:
            url = clean_token if clean_token.startswith("http") else "https://" + clean_token
            if not github:
                github = url
        elif (clean_token.startswith("http://") or clean_token.startswith("https://") or clean_token.startswith("www.")) and not portfolio:
            url = clean_token if clean_token.startswith("http") else "https://" + clean_token
            if not any(ext in lower_token for ext in [".pdf", ".doc", ".docx"]):
                portfolio = url

    return linkedin, github, portfolio


def extract_location(text: str) -> LocationInfo:
    """
    Matches city, state, country against deterministic dictionary.
    """
    text_lower = text.lower()
    
    for city_key, (city, state, country) in INDIAN_CITIES.items():
        if re.search(r"\b" + re.escape(city_key) + r"\b", text_lower):
            return LocationInfo(city=city, state=state, country=country)

    for state in INDIAN_STATES:
        if re.search(r"\b" + re.escape(state.lower()) + r"\b", text_lower):
            return LocationInfo(city=None, state=state, country="India")

    if "india" in text_lower:
        return LocationInfo(city=None, state=None, country="India")

    return LocationInfo(city=None, state=None, country=None)


def extract_summary_text(lines: List[str]) -> Optional[str]:
    if not lines:
        return None
    summary_text = " ".join([l.strip() for l in lines if l.strip()])
    return summary_text if summary_text else None


def extract_education(lines: List[str]) -> List[EducationItem]:
    if not lines:
        return []

    items: List[EducationItem] = []
    current_entry_lines: List[str] = []

    for line in lines:
        if any(deg.lower() in line.lower() for deg in DEGREE_PATTERNS):
            if current_entry_lines:
                item = parse_education_entry(current_entry_lines)
                if item:
                    items.append(item)
                current_entry_lines = []
        current_entry_lines.append(line)

    if current_entry_lines:
        item = parse_education_entry(current_entry_lines)
        if item:
            items.append(item)

    return items


def parse_education_entry(entry_lines: List[str]) -> Optional[EducationItem]:
    full_text = " ".join(entry_lines)
    degree = None
    for deg in DEGREE_PATTERNS:
        if deg.lower() in full_text.lower():
            degree = deg
            break

    if not degree:
        return None

    # Date / Year range matching
    date_match = re.search(r"\b(20\d{2}|19\d{2})\s*[-–\sto]+\s*(20\d{2}|19\d{2}|Present|Current)\b", full_text, re.IGNORECASE)
    start_date, end_date = None, None
    if date_match:
        start_date = date_match.group(1)
        end_date = date_match.group(2)

    # Grade / CGPA / Percentage
    grade_match = re.search(r"\b(CGPA|GPA|Percentage)?\s*:?\s*(\d{1,2}(?:\.\d{1,2})?\s*(?:/\s*10|/\s*4|%))\b", full_text, re.IGNORECASE)
    grade = grade_match.group(0).strip() if grade_match else None

    # Institution guessing
    inst_match = re.search(r"(?:at|from)\s+([A-Z][A-Za-z0-9\s&,.-]+?(?:University|Institute|College|School))", full_text)
    institution = inst_match.group(1).strip() if inst_match else None

    return EducationItem(
        institution=institution,
        degree=degree,
        field_of_study=None,
        start_date=start_date,
        end_date=end_date,
        grade=grade,
        location=None
    )


def extract_experience(lines: List[str]) -> List[ExperienceItem]:
    if not lines:
        return []

    items: List[ExperienceItem] = []
    current_entry_lines: List[str] = []

    for line in lines:
        # Simple heuristic: new experience entry line with dates or job roles
        if re.search(r"\b(20\d{2}|19\d{2})\s*[-–\sto]+\s*(20\d{2}|19\d{2}|Present|Current)\b", line, re.IGNORECASE):
            if current_entry_lines:
                item = parse_experience_entry(current_entry_lines)
                if item:
                    items.append(item)
                current_entry_lines = []
        current_entry_lines.append(line)

    if current_entry_lines:
        item = parse_experience_entry(current_entry_lines)
        if item:
            items.append(item)

    return items


def parse_experience_entry(entry_lines: List[str]) -> Optional[ExperienceItem]:
    if not entry_lines:
        return None

    header_line = entry_lines[0]
    description = [l.strip("•- ").strip() for l in entry_lines[1:] if l.strip()]

    date_match = re.search(r"\b(20\d{2}|19\d{2})\s*[-–\sto]+\s*(20\d{2}|19\d{2}|Present|Current)\b", header_line, re.IGNORECASE)
    start_date, end_date = None, None
    if date_match:
        start_date = date_match.group(1)
        end_date = date_match.group(2)

    return ExperienceItem(
        company=None,
        role=header_line.strip(),
        start_date=start_date,
        end_date=end_date,
        duration=None,
        location=None,
        description=description
    )


def extract_projects(lines: List[str]) -> List[ProjectItem]:
    if not lines:
        return []

    items: List[ProjectItem] = []
    current_title: Optional[str] = None
    current_bullets: List[str] = []

    for line in lines:
        if line.startswith("•") or line.startswith("-") or line.startswith("*"):
            current_bullets.append(line.strip("•-* ").strip())
        else:
            if current_title:
                techs = extract_skills(" ".join([current_title] + current_bullets))
                items.append(ProjectItem(title=current_title, technologies=techs, description=current_bullets))
                current_bullets = []
            current_title = line.strip()

    if current_title:
        techs = extract_skills(" ".join([current_title] + current_bullets))
        items.append(ProjectItem(title=current_title, technologies=techs, description=current_bullets))

    return items


def extract_certifications(lines: List[str]) -> List[CertificationItem]:
    if not lines:
        return []
    
    items: List[CertificationItem] = []
    for line in lines:
        if line.strip():
            items.append(CertificationItem(name=line.strip(), issuer=None, date=None))
    return items


def extract_achievements(lines: List[str]) -> List[str]:
    if not lines:
        return []
    return [l.strip("•-* ").strip() for l in lines if l.strip()]
