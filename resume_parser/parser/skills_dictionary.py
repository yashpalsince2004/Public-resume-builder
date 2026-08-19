import re
from typing import List

# Deterministic Skill Dictionary (Canonical Skill Names)
SKILLS_CATALOG = [
    # Programming Languages
    "Python", "Java", "C++", "C#", "C", "JavaScript", "TypeScript", "Go", "Golang", "Rust",
    "Ruby", "PHP", "Swift", "Kotlin", "Scala", "R", "Dart", "HTML", "CSS", "SQL", "Bash", "Shell",
    
    # Frameworks & Libraries
    "React", "React Native", "Angular", "Vue", "Vue.js", "Next.js", "Nuxt.js", "Svelte",
    "Flutter", "FastAPI", "Django", "Flask", "Express", "Node.js", "Spring Boot", "Spring",
    "TensorFlow", "PyTorch", "Keras", "OpenCV", "Scikit-Learn", "Pandas", "NumPy", "Tailwind CSS",
    "Bootstrap", "Redux", "GraphQL",
    
    # Databases
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Oracle", "Cassandra",
    "Elasticsearch", "Firebase", "DynamoDB", "MariaDB", "Supabase",
    
    # Tools, Platforms & DevOps
    "Git", "GitHub", "GitLab", "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Linux",
    "Figma", "VS Code", "PyCharm", "Postman", "Jenkins", "CI/CD", "Terraform", "Nginx",
    "Apache", "Jira", "Confluence", "Webpack", "Vite",
    
    # Concepts & Domains
    "REST API", "Microservices", "Agile", "Scrum", "Machine Learning", "Deep Learning",
    "Computer Vision", "Natural Language Processing", "NLP", "Data Science", "System Design",
    "OOP", "Object-Oriented Programming"
]


def extract_skills(text: str) -> List[str]:
    """
    Deterministically matches skills from SKILLS_CATALOG in text (case-insensitive).
    Returns unique skills, sorted alphabetically.
    """
    if not text:
        return []

    found_skills = set()
    for skill in SKILLS_CATALOG:
        # Build regex pattern handling special chars like C++, C#, .js, etc.
        escaped_skill = re.escape(skill)
        
        # Adjust boundaries for special C++ / C# / .js ending characters
        if skill.endswith("+") or skill.endswith("#"):
            pattern = rf"(?i)(?:^|[\s,.:;()/]){escaped_skill}(?:$|[\s,.:;()/])"
        else:
            pattern = rf"(?i)\b{escaped_skill}\b"

        if re.search(pattern, text):
            found_skills.add(skill)

    return sorted(list(found_skills))
