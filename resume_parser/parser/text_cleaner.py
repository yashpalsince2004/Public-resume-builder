import re


# Header and footer noise regex patterns
NOISE_PATTERNS = [
    re.compile(r"^page\s+\d+(\s+of\s+\d+)?$", re.IGNORECASE),
    re.compile(r"^curriculum\s+vitae$", re.IGNORECASE),
    re.compile(r"^resume$", re.IGNORECASE),
]


def clean_text(raw_text: str) -> str:
    if not raw_text:
        return ""

    # 1. Convert CRLF to LF
    text = raw_text.replace("\r\n", "\n").replace("\r", "\n")

    # 2. Normalize Unicode quotation marks & dashes
    unicode_replacements = {
        "“": '"',
        "”": '"',
        "‘": "'",
        "’": "'",
        "´": "'",
        "`": "'",
        "–": "-",
        "—": "-",
        "•": "• ",
        "·": "• ",
    }
    for orig, repl in unicode_replacements.items():
        text = text.replace(orig, repl)

    # 3. Preserve printable chars + non-control unicode (e.g. Devanagari/Hindi, Accents)
    cleaned_chars = []
    for char in text:
        if char in ("\n", "\t") or (ord(char) >= 32 and ord(char) != 127):
            cleaned_chars.append(char)
        else:
            cleaned_chars.append(" ")
    text = "".join(cleaned_chars)

    # 4. Filter header/footer noise and collapse horizontal whitespace
    lines = text.split("\n")
    cleaned_lines = []
    for line in lines:
        cleaned_line = re.sub(r"[ \t]+", " ", line).strip()
        if not cleaned_line:
            cleaned_lines.append("")
            continue
        
        # Skip noise lines
        if any(pat.match(cleaned_line) for pat in NOISE_PATTERNS):
            continue

        cleaned_lines.append(cleaned_line)

    # 5. Collapse 3+ consecutive newlines to 2 newlines
    text = "\n".join(cleaned_lines)
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()
