import { readFileSync, renameSync, writeFileSync } from 'node:fs'
import { rewriteMarkdownPageLink } from '../project/site-routes.js'

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
