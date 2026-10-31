import { readFileSync } from 'node:fs'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@vivliostyle/cli'

const publicationRoot = dirname(fileURLToPath(import.meta.url))
const workRoot = resolve(publicationRoot, '.work')
const build = JSON.parse(readFileSync(resolve(workRoot, 'build.json'), 'utf8'))
const fullPublication = build.mode === 'full'
const format = fullPublication && process.env.PUBLICATION_FORMAT === 'b5' ? 'b5' : 'a4'

const globalThemes = fullPublication
  ? [
      resolve(publicationRoot, 'theme.css'),
      resolve(workRoot, 'typography-fonts.css'),
      resolve(publicationRoot, 'typography.css'),
      resolve(publicationRoot, 'typ09d1-emphasis.css'),
      resolve(publicationRoot, 'page-furniture.css'),
      resolve(publicationRoot, 'formats', `${format}.css`)
    ]
  : [resolve(publicationRoot, 'theme.css')]
const divisionIds = new Set(['part-i', 'part-ii', 'part-iii', 'part-iv', 'part-v', 'part-vi'])
const divisionRectoTheme = resolve(publicationRoot, 'division-recto-entry.css')
const contentEntries = build.entries.map((entry) => ({
  path: entry.source,
  title: entry.title,
  ...(fullPublication && divisionIds.has(entry.id) ? { theme: [...globalThemes, divisionRectoTheme] } : {})
}))

const hasFrontMatter = build.mode === 'full' || build.mode === 'primer'
const entries = hasFrontMatter
  ? [
      { path: build.titlePage, title: build.title, rel: 'titlepage' },
      ...(fullPublication ? [{ path: build.imprintPage, title: 'Imprint / provenance' }] : []),
      { path: build.contentsPage, output: 'contents.html', title: 'Contents', rel: 'contents' },
      ...contentEntries
    ]
  : contentEntries

const outputName = format === 'b5' && fullPublication
  ? `${build.output.slice(0, -extname(build.output).length)}-b5.pdf`
  : build.output

export default defineConfig({
  title: build.title,
  language: build.language,
  size: format === 'b5' ? '176mm,250mm' : 'A4',
  entryContext: resolve(workRoot, 'source'),
  entry: entries,
  theme: globalThemes,
  toc: {
    htmlPath: hasFrontMatter ? 'contents.html' : 'index.html',
    title: 'Contents',
    sectionDepth: 1
  },
  workspaceDir: resolve(workRoot, `vivliostyle-${format}`),
  output: { path: resolve(publicationRoot, 'dist', outputName), format: 'pdf' }
})
