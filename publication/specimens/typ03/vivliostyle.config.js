import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@vivliostyle/cli'

const specimenRoot = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(specimenRoot, '../../..')
const workRoot = resolve(repoRoot, 'publication/.work/typ03')
const format = process.env.TYP03_FORMAT === 'b5' ? 'b5' : 'a4'
const candidate = process.env.TYP03_CANDIDATE ?? 'baseline'
const rhythm = process.env.TYP03_RHYTHM ?? 'spaced'
const alignment = process.env.TYP03_ALIGN ?? 'ragged'

export default defineConfig({
  title: `TYP-03 ${candidate} — ${format.toUpperCase()} / ${rhythm} / ${alignment}`,
  language: 'en-GB',
  size: format === 'b5' ? 'B5' : 'A4',
  entryContext: workRoot,
  entry: [{ path: 'source/specimen.md', title: `TYP-03 ${candidate}` }],
  theme: [
    resolve(specimenRoot, 'common.css'),
    resolve(workRoot, 'candidate.css'),
    resolve(specimenRoot, `${format}.css`)
  ],
  workspaceDir: resolve(workRoot, 'vivliostyle', `${candidate}-${format}-${rhythm}-${alignment}`),
  output: {
    path: resolve(workRoot, 'dist', `typ03-${candidate}-${format}-${rhythm}-${alignment}.pdf`),
    format: 'pdf'
  }
})