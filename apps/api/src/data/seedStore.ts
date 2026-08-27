import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  getMatchesResponseSchema,
  jobPostingSchema,
  profileSchema,
  type GetMatchesResponse,
  type JobPosting,
  type MatchWithJob,
  type Profile,
} from '@jobmatch/shared'

// apps/api/src/data -> repo root is four levels up.
const OUTPUT_DIR = resolve(import.meta.dirname, '../../../../pipelines/output')

function readSeedJson(fileName: string): unknown {
  const filePath = resolve(OUTPUT_DIR, fileName)
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(
        `Seed data not found at ${filePath}. Run \`npm run pipelines:seed\` from the repo root first.`,
      )
    }
    throw err
  }
}

class SeedStore {
  private profile: Profile
  private jobsById: Map<string, JobPosting>
  private matchesResponse: GetMatchesResponse
  private matchesByJobId: Map<string, MatchWithJob>

  constructor() {
    const rawJobs = readSeedJson('jobs.json') as unknown[]
    const jobs = rawJobs.map((job) => jobPostingSchema.parse(job))
    this.jobsById = new Map(jobs.map((job) => [job.id, job]))

    this.profile = profileSchema.parse(readSeedJson('profile.json'))

    const rawMatches = readSeedJson('matches.json') as { date: string; matches: Array<{ jobId: string }> }
    const matchesWithJob = rawMatches.matches.map((match) => {
      const job = this.jobsById.get(match.jobId)
      if (!job) {
        throw new Error(`matches.json references unknown jobId "${match.jobId}"`)
      }
      return { ...match, job }
    })
    this.matchesResponse = getMatchesResponseSchema.parse({
      date: rawMatches.date,
      matches: matchesWithJob,
    })
    this.matchesByJobId = new Map(this.matchesResponse.matches.map((m) => [m.jobId, m]))
  }

  getProfile(): Profile {
    return this.profile
  }

  updateProfile(patch: Partial<Omit<Profile, 'id' | 'cv'>>): Profile {
    this.profile = { ...this.profile, ...patch }
    return this.profile
  }

  getTodayMatches(): GetMatchesResponse {
    return this.matchesResponse
  }

  getMatch(jobId: string): MatchWithJob | undefined {
    return this.matchesByJobId.get(jobId)
  }

  getJob(id: string): JobPosting | undefined {
    return this.jobsById.get(id)
  }
}

export const seedStore = new SeedStore()
