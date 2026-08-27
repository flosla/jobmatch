import type { Education, Experience, Profile } from '@jobmatch/shared'

/**
 * Deterministic, section-based CV text parser.
 *
 * TS port of pipelines/matching/parse_cv.py, used by POST /api/cv/parse-preview
 * so the demo's "re-upload CV" UI flow can run entirely on the Node side
 * without round-tripping through the Python pipeline. No LLM involved —
 * extracting clearly-delimited fields (headers, dates) is deterministic
 * parsing, not reasoning.
 */

const SECTION_HEADER_RE = /^([A-Z][A-Z ]+):\s*$/
const HEADER_LINE_RE = /^([\w .,()'-]+)\s\|\s([\w.+-]+@[\w.-]+)\s\|\s(\+?[\d() -]+)$/
const LINKS_LINE_RE = /^([\w.-]+\.[\w./-]+)\s\|\s([\w.-]+\.[\w./-]+)$/
const EDUCATION_LINE_RE = /^(.+?),\s(.+?),\s(\d{4})-(\d{4})$/
const EXPERIENCE_HEADER_RE = /^(.+?),\s(.+?),\s(.+?),\s(\d{4}-\d{2})\sto\s(Present|\d{4}-\d{2})$/

type ParsedCv = Partial<Omit<Profile, 'id' | 'cv'>>

function splitSections(rawText: string): Record<string, string> {
  const lines = rawText.split('\n')
  const headerIndices: Array<{ name: string; lineIndex: number }> = []
  lines.forEach((line, i) => {
    const match = SECTION_HEADER_RE.exec(line)
    if (match) headerIndices.push({ name: match[1]!.trim(), lineIndex: i })
  })

  const sections: Record<string, string> = {}
  headerIndices.forEach(({ name, lineIndex }, i) => {
    const end = i + 1 < headerIndices.length ? headerIndices[i + 1]!.lineIndex : lines.length
    sections[name] = lines.slice(lineIndex + 1, end).join('\n').trim()
  })
  return sections
}

function parseHeader(rawText: string): Pick<ParsedCv, 'name' | 'headline' | 'email' | 'phone' | 'location' | 'links'> {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean)
  const name = lines[0] ?? ''
  const headline = lines[1] ?? ''

  let location = ''
  let email = ''
  let phone = ''
  const links: { linkedin?: string; github?: string } = {}

  for (const line of lines.slice(2, 5)) {
    const contactMatch = HEADER_LINE_RE.exec(line)
    if (contactMatch) {
      location = contactMatch[1]!
      email = contactMatch[2]!
      phone = contactMatch[3]!.trim()
      continue
    }
    const linksMatch = LINKS_LINE_RE.exec(line)
    if (linksMatch) {
      for (const part of [linksMatch[1]!, linksMatch[2]!]) {
        if (part.includes('linkedin.com')) links.linkedin = `https://${part}`
        else if (part.includes('github.com')) links.github = `https://${part}`
      }
    }
  }

  return { name, headline, email, phone, location, links }
}

function parseEducation(sectionText: string): Education[] {
  const entries: Education[] = []
  for (const raw of sectionText.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    const match = EDUCATION_LINE_RE.exec(line)
    if (!match) continue
    const [, degreeFull, institution, start, end] = match as unknown as [string, string, string, string, string]
    const [degree, ...fieldParts] = degreeFull.split(' ')
    const field = fieldParts.join(' ').replace(/\s*\(.*?\)\s*/g, '').trim()
    entries.push({
      institution,
      degree: degree ?? '',
      field,
      startYear: Number(start),
      endYear: Number(end),
    })
  }
  return entries
}

function parseExperience(sectionText: string): Experience[] {
  const entries: Experience[] = []
  let current: Experience | null = null

  for (const raw of sectionText.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    const headerMatch = EXPERIENCE_HEADER_RE.exec(line)
    if (headerMatch) {
      if (current) entries.push(current)
      const [, title, company, location, start, end] = headerMatch as unknown as [
        string, string, string, string, string, string,
      ]
      current = {
        company,
        title,
        location,
        startDate: `${start}-01`,
        endDate: end === 'Present' ? null : `${end}-01`,
        highlights: [],
      }
    } else if (line.startsWith('-') && current) {
      current.highlights.push(line.replace(/^-+\s*/, ''))
    }
  }
  if (current) entries.push(current)
  return entries
}

function parseSkills(sectionText: string): string[] {
  const joined = sectionText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join(' ')
  return joined
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function parseCv(rawText: string): ParsedCv {
  const sections = splitSections(rawText)
  const summaryIdx = rawText.indexOf('SUMMARY:')
  const headerText = summaryIdx >= 0 ? rawText.slice(0, summaryIdx) : rawText
  const header = parseHeader(headerText)

  return {
    ...header,
    education: parseEducation(sections.EDUCATION ?? ''),
    experience: parseExperience(sections.EXPERIENCE ?? ''),
    skills: parseSkills(sections.SKILLS ?? ''),
  }
}
