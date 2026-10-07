import { createContentLoader } from 'vitepress'

const PATTERN_ID = /^HSA-P-\d{3}$/
const relationshipFields = ['requires', 'completes', 'alternative_to', 'tension_with'] as const

type RelationshipField = (typeof relationshipFields)[number]
type PatternState = 'active' | 'retired'

export interface PatternReference {
  id: string
  relation: RelationshipField
}

export interface PatternIndexRecord {
  id: string
  title: string
  state: PatternState
  evidence: string
  scales: string[]
  domains: string[]
  url: string
  relationships: PatternReference[]
  referencedBy: PatternReference[]
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : []
}

export default createContentLoader(['*.md', 'retired/*.md'], {
  transform(pages): PatternIndexRecord[] {
    const patternPages = pages.filter(({ frontmatter }) => frontmatter.kind === 'pattern' && frontmatter.id)
    const errors: string[] = []
    const ids = new Set<string>()

    const records = patternPages.map(({ url, frontmatter }): PatternIndexRecord => {
      const id = String(frontmatter.id)
      const title = String(frontmatter.title ?? '')
      const rawState = String(frontmatter.state ?? '')
      const isRetiredLocation = url.includes('/retired/')

      if (!PATTERN_ID.test(id)) errors.push(`${url}: invalid pattern id "${id}"; expected HSA-P-xxx`)
      if (ids.has(id)) errors.push(`${url}: duplicate stable pattern id ${id}`)
      ids.add(id)

      if (rawState !== 'active' && rawState !== 'retired') {
        errors.push(`${url}: pattern state must be "active" or "retired"`)
      }

      if (isRetiredLocation && rawState !== 'retired') {
        errors.push(`${url}: files under retired/ must use state: retired`)
      }

      if (!isRetiredLocation && rawState !== 'active') {
        errors.push(`${url}: canonical root pattern pages must use state: active`)
      }

      const relationships = relationshipFields.flatMap((relation) =>
        stringArray(frontmatter[relation]).map((target) => ({ id: target, relation }))
      )

      return {
        id,
        title,
        state: rawState === 'retired' ? 'retired' : 'active',
        evidence: String(frontmatter.evidence ?? 'unspecified'),
        scales: stringArray(frontmatter.scales),
        domains: stringArray(frontmatter.domains),
        url,
        relationships,
        referencedBy: []
      }
    })

    const byId = new Map(records.map((record) => [record.id, record]))

    for (const record of records) {
      for (const reference of record.relationships) {
        if (reference.id === record.id) {
          errors.push(`${record.id}: ${reference.relation} cannot refer to itself`)
          continue
        }

        const target = byId.get(reference.id)
        if (!target) {
          errors.push(`${record.id}: ${reference.relation} references unknown pattern ${reference.id}`)
          continue
        }

        target.referencedBy.push({ id: record.id, relation: reference.relation })
      }
    }

    if (errors.length) {
      throw new Error(`Pattern-language metadata validation failed:\n${errors.map((error) => `  - ${error}`).join('\n')}`)
    }

    return records.sort((a, b) => a.id.localeCompare(b.id))
  }
})
