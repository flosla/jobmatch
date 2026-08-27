"""Deterministic CV-to-job scoring.

No LLM involved: the match score is a weighted blend of four
deterministically-computed sub-scores. The LLM-shaped step (turning a
score into a human-readable rationale) lives in rationale.py, kept
separate on purpose so "why did this match" reasoning can later be
swapped for a real Azure AI Foundry call without touching scoring math.
"""

from __future__ import annotations

import difflib
from dataclasses import dataclass
from datetime import date

_SENIORITY_ORDER = ["junior", "mid", "senior", "staff"]
_SENIORITY_MIN_YEARS = {"junior": 0, "mid": 2, "senior": 5, "staff": 8}

_WEIGHTS = {
    "skill_overlap": 0.50,
    "title_similarity": 0.20,
    "seniority_fit": 0.15,
    "experience_years_fit": 0.15,
}


@dataclass(frozen=True)
class ScoreResult:
    total: float
    skill_overlap: float
    title_similarity: float
    seniority_fit: float
    experience_years_fit: float


def _years_of_experience(experience: list[dict], as_of: date | None = None) -> float:
    as_of = as_of or date.today()
    total_months = 0
    for entry in experience:
        start_year, start_month = (int(part) for part in entry["startDate"].split("-")[:2])
        if entry["endDate"] is None:
            end_year, end_month = as_of.year, as_of.month
        else:
            end_year, end_month = (int(part) for part in entry["endDate"].split("-")[:2])
        total_months += (end_year - start_year) * 12 + (end_month - start_month)
    return round(total_months / 12, 1)


def _infer_seniority(years: float, most_recent_title: str) -> str:
    title_lower = most_recent_title.lower()
    if "staff" in title_lower or "principal" in title_lower:
        return "staff"
    if "senior" in title_lower or "sr." in title_lower:
        return "senior"
    if "junior" in title_lower or "jr." in title_lower:
        return "junior"
    if years >= _SENIORITY_MIN_YEARS["staff"]:
        return "staff"
    if years >= _SENIORITY_MIN_YEARS["senior"]:
        return "senior"
    if years >= _SENIORITY_MIN_YEARS["mid"]:
        return "mid"
    return "junior"


def _skill_overlap(profile_skills: list[str], job_skills: list[str]) -> float:
    if not job_skills:
        return 0.0
    profile_set = {skill.strip().lower() for skill in profile_skills}
    job_set = {skill.strip().lower() for skill in job_skills}
    overlap = profile_set & job_set
    return round(len(overlap) / len(job_set), 4)


def _title_similarity(profile_title: str, job_title: str) -> float:
    return round(
        difflib.SequenceMatcher(None, profile_title.lower(), job_title.lower()).ratio(), 4
    )


def _seniority_fit(profile_seniority: str, job_seniority: str) -> float:
    profile_idx = _SENIORITY_ORDER.index(profile_seniority)
    job_idx = _SENIORITY_ORDER.index(job_seniority)
    distance = abs(profile_idx - job_idx)
    max_distance = len(_SENIORITY_ORDER) - 1
    return round(1 - (distance / max_distance), 4)


def _experience_years_fit(years: float, job_seniority: str) -> float:
    required = _SENIORITY_MIN_YEARS[job_seniority]
    if years >= required:
        # Comfortably meets the bar; small penalty for being far past it (over-qualification).
        overshoot = max(0.0, years - required - 5)
        return round(max(0.5, 1 - overshoot / 20), 4)
    shortfall = required - years
    return round(max(0.0, 1 - shortfall / max(required, 1)), 4)


def score_job(profile: dict, job: dict) -> ScoreResult:
    """Compute a weighted, deterministic match score in [0, 1]."""
    years = _years_of_experience(profile["experience"])
    most_recent_title = profile["experience"][0]["title"] if profile["experience"] else profile.get("headline", "")
    profile_seniority = _infer_seniority(years, most_recent_title)

    skill_overlap = _skill_overlap(profile["skills"], job["skillsRequired"])
    title_similarity = _title_similarity(most_recent_title, job["title"])
    seniority_fit = _seniority_fit(profile_seniority, job["seniority"])
    experience_years_fit = _experience_years_fit(years, job["seniority"])

    total = (
        skill_overlap * _WEIGHTS["skill_overlap"]
        + title_similarity * _WEIGHTS["title_similarity"]
        + seniority_fit * _WEIGHTS["seniority_fit"]
        + experience_years_fit * _WEIGHTS["experience_years_fit"]
    )

    return ScoreResult(
        total=round(total, 4),
        skill_overlap=skill_overlap,
        title_similarity=title_similarity,
        seniority_fit=seniority_fit,
        experience_years_fit=experience_years_fit,
    )
