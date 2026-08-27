import type { JobPosting, Profile, ScoreBreakdown } from '@jobmatch/shared'
import { parseCv } from '../cv/parseCv.js'

export interface LlmClient {
  generateMatchRationale(input: {
    profile: Profile
    job: JobPosting
    scoreBreakdown: ScoreBreakdown
  }): Promise<string>
  extractCvFields(input: { rawText: string }): Promise<Partial<Omit<Profile, 'id' | 'cv'>>>
}

function sharedSkills(profileSkills: string[], jobSkills: string[]): string[] {
  const jobSet = new Set(jobSkills.map((s) => s.trim().toLowerCase()))
  return profileSkills.filter((s) => jobSet.has(s.trim().toLowerCase()))
}

/**
 * MOCK IMPLEMENTATION — a clearly-labeled stand-in for Azure AI Foundry.
 *
 * Makes no network calls and requires no credentials, so the demo runs
 * with zero external setup. Mirrors the templated-rationale approach in
 * pipelines/matching/rationale.py, but exercised live via
 * POST /api/matches/:jobId/rationale/regenerate to demonstrate the
 * Node-side integration point independently of the batch pipeline.
 */
export const mockAzureFoundryClient: LlmClient = {
  async generateMatchRationale({ profile, job, scoreBreakdown }) {
    const shared = sharedSkills(profile.skills, job.skillsRequired)
    const sharedText = shared.length > 0 ? shared.slice(0, 4).join(', ') : 'no directly overlapping listed skills'
    const firstName = profile.name.split(' ')[0]
    const overallPct = Math.round(
      (scoreBreakdown.skillOverlap * 0.5 +
        scoreBreakdown.titleSimilarity * 0.2 +
        scoreBreakdown.seniorityFit * 0.15 +
        scoreBreakdown.experienceYearsFit * 0.15) *
        100,
    )
    const strength = overallPct >= 75 ? 'a strong match' : overallPct >= 50 ? 'a solid match' : 'a partial match'
    return (
      `This role is ${strength} for ${firstName} (${overallPct}% overall fit). ` +
      `Shared skills with ${job.title} at ${job.company} include ${sharedText}. ` +
      `(Regenerated on demand via the mock Azure AI Foundry client.)`
    )
  },

  async extractCvFields({ rawText }) {
    return parseCv(rawText)
  },
}

/**
 * REAL INTEGRATION POINT — intentionally not implemented in this demo.
 *
 * A production wiring would construct a client against the Azure AI
 * Foundry model deployment's chat-completions endpoint (e.g. via
 * `@azure/ai-inference` or an OpenAI-compatible client pointed at the
 * Foundry endpoint), reading configuration from:
 *
 *   AZURE_AI_FOUNDRY_ENDPOINT           - Foundry project/resource endpoint
 *   AZURE_AI_FOUNDRY_API_KEY            - key, or use DefaultAzureCredential / managed identity
 *   AZURE_AI_FOUNDRY_DEPLOYMENT_NAME    - deployed model name (e.g. an Azure OpenAI GPT deployment)
 *   AZURE_AI_FOUNDRY_API_VERSION        - API version
 *
 * and would only be constructed when USE_REAL_AZURE_LLM=true. See
 * README.md "Mocked Azure AI Foundry integration" for the full design.
 * The exported `llmClient` below is always the mock — no code path in
 * this repo reaches Azure by default.
 */
export const llmClient: LlmClient = mockAzureFoundryClient
