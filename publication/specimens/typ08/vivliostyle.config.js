import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from '@vivliostyle/cli'

const repoRoot = resolve(import.meta.dirname, '../../..')
const publicationRoot = resolve(repoRoot, 'publication')
const workRoot = resolve(publicationRoot, '.work')
const proofRoot = resolve(publicationRoot, '.proof/typ08a')
const format = process.env.TYP08_FORMAT === 'a4' ? 'a4' : 'b5'
const build = JSON.parse(readFileSync(resolve(workRoot, 'build.json'), 'utf8'))

if (build.mode !== 'full') throw new Error(`TYP-08A requires full mode, received ${build.mode}.`)

const contentEntries = build.entries.map((entry) => ({
  path: entry.source,
  title: entry.title
}))

const entries = [
  {
    path: build.titlePage,
    title: build.title,
    rel: 'titlepage'
  },
  {
    path: build.contentsPage,
    output: 'contents.html',
    title: 'Contents',
    rel: 'contents'
  },
  ...contentEntries
]

export default defineConfig({
  title: `TYP-08A full-book candidate — ${format.toUpperCase()}`,
  language: build.language,
  size: format === 'b5' ? '176mm,250mm' : 'A4',
  entryContext: resolve(workRoot, 'source'),
  entry: entries,
  theme: [
    resolve(workRoot, 'typ08a/fonts.css'),
    resolve(import.meta.dirname, 'common.css'),
    resolve(import.meta.dirname, `${format}.css`)
  ],
  toc: {
    htmlPath: 'contents.html',
    title: 'Contents',
    sectionDepth: 1
  },
  workspaceDir: resolve(workRoot, `typ08a/vivliostyle-${format}`),
  output: {
    path: resolve(proofRoot, format, `typ08a-full-book-${format}.pdf`),
    format: 'pdf'
  }
})
