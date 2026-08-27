"""Deterministic, section-based CV parser.

Splits raw CV text on known ALL-CAPS section headers (EDUCATION:,
EXPERIENCE:, SKILLS:) and extracts structured fields via line-level
regexes. This is a stand-in for a real CV/resume text-extraction step;
no LLM is involved here by design — extraction of clearly-delimited
fields like dates and headers is a textbook deterministic-parsing task.
"""

from __future__ import annotations

import re
from typing import Any

_SECTION_HEADER_RE = re.compile(r"^([A-Z][A-Z ]+):\s*$", re.MULTILINE)
_HEADER_LINE_RE = re.compile(r"^([\w .,()'-]+)\s\|\s([\w.+-]+@[\w.-]+)\s\|\s(\+?[\d() -]+)$")
_LINKS_LINE_RE = re.compile(r"^([\w.-]+\.[\w./-]+)\s\|\s([\w.-]+\.[\w./-]+)$")
_EDUCATION_LINE_RE = re.compile(
    r"^(?P<degree>.+?),\s(?P<institution>.+?),\s(?P<start>\d{4})-(?P<end>\d{4})$"
)
_EXPERIENCE_HEADER_RE = re.compile(
    r"^(?P<title>.+?),\s(?P<company>.+?),\s(?P<location>.+?),\s"
    r"(?P<start>\d{4}-\d{2})\sto\s(?P<end>Present|\d{4}-\d{2})$"
)


def _split_sections(raw_text: str) -> dict[str, str]:
    headers = list(_SECTION_HEADER_RE.finditer(raw_text))
    sections: dict[str, str] = {}
    for i, match in enumerate(headers):
        name = match.group(1).strip()
        body_start = match.end()
        body_end = headers[i + 1].start() if i + 1 < len(headers) else len(raw_text)
        sections[name] = raw_text[body_start:body_end].strip("\n")
    return sections


def _parse_header(raw_text: str) -> dict[str, Any]:
    lines = [line.strip() for line in raw_text.strip().splitlines() if line.strip()]
    name = lines[0] if lines else ""
    headline = lines[1] if len(lines) > 1 else ""

    location, email, phone = "", "", ""
    links: dict[str, str] = {}
    for line in lines[2:5]:
        contact_match = _HEADER_LINE_RE.match(line)
        if contact_match:
            location, email, phone = contact_match.groups()
            continue
        links_match = _LINKS_LINE_RE.match(line)
        if links_match:
            for part in links_match.groups():
                if "linkedin.com" in part:
                    links["linkedin"] = f"https://{part}"
                elif "github.com" in part:
                    links["github"] = f"https://{part}"

    return {
        "name": name,
        "headline": headline,
        "email": email,
        "phone": phone.strip(),
        "location": location,
        "links": links,
    }


def _parse_education(section_text: str) -> list[dict[str, Any]]:
    entries = []
    for line in section_text.splitlines():
        line = line.strip()
        if not line:
            continue
        match = _EDUCATION_LINE_RE.match(line)
        if not match:
            continue
        degree_full = match.group("degree")
        # "M.S. Computer Science (Machine Learning concentration)" -> degree="M.S.", field=rest
        degree_parts = degree_full.split(" ", 1)
        degree = degree_parts[0]
        field = degree_parts[1] if len(degree_parts) > 1 else ""
        entries.append(
            {
                "institution": match.group("institution"),
                "degree": degree,
                "field": re.sub(r"\s*\(.*?\)\s*", "", field).strip(),
                "startYear": int(match.group("start")),
                "endYear": int(match.group("end")),
            }
        )
    return entries


def _parse_experience(section_text: str) -> list[dict[str, Any]]:
    entries: list[dict[str, Any]] = []
    current: dict[str, Any] | None = None
    for raw_line in section_text.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        header_match = _EXPERIENCE_HEADER_RE.match(line)
        if header_match:
            if current is not None:
                entries.append(current)
            end = header_match.group("end")
            current = {
                "company": header_match.group("company"),
                "title": header_match.group("title"),
                "location": header_match.group("location"),
                "startDate": f"{header_match.group('start')}-01",
                "endDate": None if end == "Present" else f"{end}-01",
                "highlights": [],
            }
        elif line.startswith("-") and current is not None:
            current["highlights"].append(line.lstrip("- ").strip())
    if current is not None:
        entries.append(current)
    return entries


def _parse_skills(section_text: str) -> list[str]:
    joined = " ".join(line.strip() for line in section_text.splitlines() if line.strip())
    return [skill.strip() for skill in joined.split(",") if skill.strip()]


def parse_cv(raw_text: str) -> dict[str, Any]:
    """Parse raw CV text into structured profile fields.

    Returns a dict with keys: name, headline, email, phone, location,
    links, education, experience, skills. Does not include `id` or `cv`
    (the raw-text envelope) -- callers attach those separately.
    """
    sections = _split_sections(raw_text)
    header_text = raw_text[: raw_text.index("SUMMARY:")] if "SUMMARY:" in raw_text else raw_text
    header = _parse_header(header_text)

    return {
        **header,
        "education": _parse_education(sections.get("EDUCATION", "")),
        "experience": _parse_experience(sections.get("EXPERIENCE", "")),
        "skills": _parse_skills(sections.get("SKILLS", "")),
    }
