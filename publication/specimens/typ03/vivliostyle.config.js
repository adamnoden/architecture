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
const fontRights = candidate === 'baseline' ? 'system-baseline' : process.env.TYP03_FONT_RIGHTS
const blindLabel = process.env.TYP03_BLIND_LABEL?.trim() || null
const isPdfBuild = process.argv.some((argument) => argument === 'build')
const identity = blindLabel ? `set-${blindLabel.toLowerCase()}` : candidate

if (candidate !== 'baseline' && isPdfBuild && fontRights !== 'pdf-embed-ok') {
  throw new Error(
    `Refusing TYP-03 PDF build for ${candidate}: set TYP03_FONT_RIGHTS=pdf-embed-ok only when the supplied font licence permits PDF embedding. Use vivliostyle preview for preview-only evaluation fonts.`
  )
}

export default defineConfig({
  title: blindLabel
    ? `TYP-03 Set ${blindLabel} — ${format.toUpperCase()} / ${rhythm} / ${alignment}`
    : `TYP-03 ${candidate} — ${format.toUpperCase()} / ${rhythm} / ${alignment}`,
  language: 'en-GB',
  size: format === 'b5' ? 'B5' : 'A4',
  entryContext: workRoot,
  entry: [{ path: 'source/specimen.md', title: blindLabel ? `TYP-03 Set ${blindLabel}` : `TYP-03 ${candidate}` }],
  theme: [
    resolve(specimenRoot, 'common.css'),
    resolve(workRoot, 'candidate.css'),
    resolve(specimenRoot, `${format}.css`)
  ],
  workspaceDir: resolve(workRoot, 'vivliostyle', `${identity}-${format}-${rhythm}-${alignment}`),
  output: {
    path: resolve(workRoot, 'dist', `typ03-${identity}-${format}-${rhythm}-${alignment}.pdf`),
    format: 'pdf'
  }
})
