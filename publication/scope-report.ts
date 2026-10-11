import type { PublicationEntry } from './publication.js'

export const publicationScopeStart = '<!-- generated: publication-manifest:start -->'
export const publicationScopeEnd = '<!-- generated: publication-manifest:end -->'

function cell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim()
}

export function renderPublicationScope(entries: readonly PublicationEntry[]): string {
  const rows = entries.map((entry, index) => {
    const adapter = entry.adapter ?? '—'
    return `| ${index + 1} | ${cell(entry.kind)} | ${cell(entry.title)} | \`${entry.source}\` | \`${adapter}\` |`
  })

  return [
    publicationScopeStart,
    '> Generated from `publication/publication.ts`. Do not hand-edit this table; run `npm run publication:scope:update` after changing the Working Edition manifest.',
    '',
    '| # | Kind | Publication title | Primary source | Adapter |',
    '|---:|---|---|---|---|',
    ...rows,
    publicationScopeEnd
  ].join('\n')
}

export function replacePublicationScope(markdown: string, generated: string): string {
  const start = markdown.indexOf(publicationScopeStart)
  const end = markdown.indexOf(publicationScopeEnd)

  if (start < 0 || end < start) {
    throw new Error('Publication scope crosswalk is missing generated manifest markers.')
  }
  if (markdown.indexOf(publicationScopeStart, start + publicationScopeStart.length) >= 0) {
    throw new Error('Publication scope crosswalk contains duplicate generated manifest start markers.')
  }
  if (markdown.indexOf(publicationScopeEnd, end + publicationScopeEnd.length) >= 0) {
    throw new Error('Publication scope crosswalk contains duplicate generated manifest end markers.')
  }

  return `${markdown.slice(0, start)}${generated}${markdown.slice(end + publicationScopeEnd.length)}`
}

export function readPublicationScope(markdown: string): string {
  const start = markdown.indexOf(publicationScopeStart)
  const end = markdown.indexOf(publicationScopeEnd)
  if (start < 0 || end < start) {
    throw new Error('Publication scope crosswalk is missing generated manifest markers.')
  }
  return markdown.slice(start, end + publicationScopeEnd.length)
}
