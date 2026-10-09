import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@vivliostyle/cli'

const publicationRoot = dirname(fileURLToPath(import.meta.url))
const build = JSON.parse(
  readFileSync(resolve(publicationRoot, '.work/build.json'), 'utf8')
)

export default defineConfig({
  title: build.title,
  language: build.language,
  size: 'A4',
  entryContext: resolve(publicationRoot, '.work/source'),
  entry: build.entries.map((entry) => ({
    path: entry.source,
    title: entry.title
  })),
  theme: resolve(publicationRoot, 'theme.css'),
  toc: {
    title: 'Contents',
    sectionDepth: 1
  },
  workspaceDir: resolve(publicationRoot, '.work/vivliostyle'),
  output: {
    path: resolve(publicationRoot, 'dist', build.output),
    format: 'pdf'
  }
})
