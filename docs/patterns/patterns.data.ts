import { createContentLoader } from 'vitepress'

export interface PatternIndexRecord {
  id: string
  title: string
  state: 'active' | 'retired'
  evidence: string
  scales: string[]
  domains: string[]
  url: string
}

export default createContentLoader(['*.md', 'retired/*.md'], {
  transform(pages): PatternIndexRecord[] {
    return pages
      .filter(({ frontmatter }) => frontmatter.kind === 'pattern' && frontmatter.id)
      .map(({ url, frontmatter }) => ({
        id: String(frontmatter.id),
        title: String(frontmatter.title),
        state: frontmatter.state === 'retired' ? 'retired' : 'active',
        evidence: String(frontmatter.evidence ?? 'unspecified'),
        scales: Array.isArray(frontmatter.scales) ? frontmatter.scales.map(String) : [],
        domains: Array.isArray(frontmatter.domains) ? frontmatter.domains.map(String) : [],
        url
      }))
      .sort((a, b) => a.id.localeCompare(b.id))
  }
})
