import { readFileSync, renameSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { rewriteMarkdownPageLink } from '../project/site-routes.js'

/** Capture before copying: later source reads cannot authenticate an older copy. */
export function capturePublicationSourceSnapshot(
  sources: Iterable<string>, read: (source: string) => Buffer
): ReadonlyMap<string, string> {
  return new Map([...sources].map(source => [source, createHash('sha256').update(read(source)).digest('hex')]))
}

export function assertPublicationSourceSnapshot(
  snapshot: ReadonlyMap<string, string>, read: (source: string) => Buffer,
  boundary: 'canonical source' | 'copied source' = 'canonical source'
): void {
  for (const [source, before] of snapshot) {
    const after = createHash('sha256').update(read(source)).digest('hex')
    if (before !== after) throw new Error(`Preparation mutated ${boundary}: ${source}`)
  }
}

/** Use the site's source ownership and route mapping for links leaving a PDF. */
export function publicationSourceUrl(
  target: string,
  suffix: string,
  repoRoot: string,
  liveBaseUrl: string
): string {
  const route = rewriteMarkdownPageLink(`./${target}${suffix}`, 'README.md', repoRoot)
  // A leading site slash is relative to the deployment base, not the domain root.
  return new URL(route.replace(/^\//, ''), liveBaseUrl).href
}

/** The renderer must consume the adapted text, never the original source copy. */
export function renderPublicationMermaid(
  markdown: string,
  preparedPath: string,
  render: (inputPath: string, outputPath: string) => void
): string {
  if (!markdown.includes('```mermaid')) return markdown
  const renderedPath = `${preparedPath}.mmdc.md`
  writeFileSync(preparedPath, markdown)
  render(preparedPath, renderedPath)
  renameSync(renderedPath, preparedPath)
  return readFileSync(preparedPath, 'utf8')
}
