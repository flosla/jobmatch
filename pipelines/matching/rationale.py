"""MOCK LLM step: deterministic, templated match-rationale generation.

In production this step would call an Azure AI Foundry-hosted chat
model with a constrained prompt (profile summary + job summary + score
breakdown -> a few sentences of plain-English rationale). For this demo
it is a pure templating function so the pipeline has no network
dependency and no Azure credentials are required to run it. The
Node-side equivalent mock lives at apps/api/src/llm/azureFoundryClient.ts.
"""

from __future__ import annotations

from .scoring import ScoreResult


def _shared_skills(profile_skills: list[str], job_skills: list[str]) -> list[str]:
    profile_set = {skill.strip().lower(): skill.strip() for skill in profile_skills}
    job_set = {skill.strip().lower() for skill in job_skills}
    return [profile_set[key] for key in profile_set if key in job_set]


def generate_rationale(profile: dict, job: dict, score: ScoreResult) -> str:
    """Generate a templated, human-readable rationale for a match."""
    shared = _shared_skills(profile["skills"], job["skillsRequired"])
    shared_text = ", ".join(shared[:4]) if shared else "no directly overlapping listed skills"

    if score.total >= 0.75:
        strength = "a strong match"
    elif score.total >= 0.5:
        strength = "a solid match"
    else:
        strength = "a partial match"

    sentences = [
        f"This role is {strength} for {profile['name'].split()[0]} "
        f"({round(score.total * 100)}% overall fit)."
    ]

    if shared:
        sentences.append(
            f"Shared skills with {job['title']} at {job['company']} include {shared_text}."
        )
    else:
        sentences.append(
            f"There is {shared_text} between the profile and {job['title']} at {job['company']}."
        )

    if score.seniority_fit >= 0.99:
        sentences.append(f"Seniority level aligns well with a {job['seniority']} position.")
    elif score.seniority_fit >= 0.6:
        sentences.append(f"Seniority is roughly in range for a {job['seniority']} position.")
    else:
        sentences.append(f"Seniority level differs notably from what this {job['seniority']} role expects.")

    return " ".join(sentences)
