#!/usr/bin/env python3
"""Entry point: parse John Doe's CV, score it against the demo job
postings, rank the top 10, generate a rationale for each, and write the
JSON files apps/api reads at boot.

Usage (from repo root):
    python3 pipelines/generate_demo_data.py
    (or: npm run pipelines:seed)
"""

from __future__ import annotations

import json
from datetime import date, datetime, timezone
from pathlib import Path

from data.cv_raw import CV_TEXT
from data.job_postings import JOB_POSTINGS
from matching.parse_cv import parse_cv
from matching.rationale import generate_rationale
from matching.scoring import score_job

OUTPUT_DIR = Path(__file__).parent / "output"
PROFILE_ID = "profile-john-doe"
TOP_N = 10


def build_profile() -> dict:
    parsed = parse_cv(CV_TEXT)
    return {
        "id": PROFILE_ID,
        **parsed,
        "cv": {
            "fileName": "john_doe_cv.txt",
            "uploadedAt": datetime.now(timezone.utc).isoformat(),
            "rawText": CV_TEXT,
        },
    }


def build_matches(profile: dict) -> list[dict]:
    scored = []
    for job in JOB_POSTINGS:
        result = score_job(profile, job)
        scored.append((job, result))

    scored.sort(key=lambda pair: pair[1].total, reverse=True)
    top = scored[:TOP_N]

    matches = []
    for rank, (job, result) in enumerate(top, start=1):
        rationale = generate_rationale(profile, job, result)
        matches.append(
            {
                "jobId": job["id"],
                "profileId": profile["id"],
                "score": result.total,
                "scoreBreakdown": {
                    "skillOverlap": result.skill_overlap,
                    "titleSimilarity": result.title_similarity,
                    "seniorityFit": result.seniority_fit,
                    "experienceYearsFit": result.experience_years_fit,
                },
                "rank": rank,
                "rationale": rationale,
            }
        )
    return matches


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    profile = build_profile()
    matches = build_matches(profile)

    (OUTPUT_DIR / "profile.json").write_text(json.dumps(profile, indent=2))
    (OUTPUT_DIR / "jobs.json").write_text(json.dumps(JOB_POSTINGS, indent=2))
    (OUTPUT_DIR / "matches.json").write_text(
        json.dumps({"date": date.today().isoformat(), "matches": matches}, indent=2)
    )

    jobs_by_id = {job["id"]: job for job in JOB_POSTINGS}
    print(f"Generated {len(matches)} top matches for {profile['name']}:\n")
    for match in matches:
        job = jobs_by_id[match["jobId"]]
        print(
            f"  #{match['rank']:>2}  {round(match['score'] * 100):>3}%  "
            f"{job['title']} @ {job['company']}"
        )
    print(f"\nWrote profile.json, jobs.json, matches.json to {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
