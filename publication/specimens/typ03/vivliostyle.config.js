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
const anonymous = process.env.TYP03_ANONYMOUS === '1'
const blindLabel = process.env.TYP03_BLIND_LABEL
const displayLabel = anonymous ? blindLabel : candidate
const fontRights = candidate === 'baseline' ? 'system-baseline' : process.env.TYP03_FONT_RIGHTS
const isPdfBuild = process.argv.some((argument) => argument === 'build')

if (anonymous && !displayLabel) {
  throw new Error('TYP03_BLIND_LABEL is required when TYP03_ANONYMOUS=1')
}
if (candidate !== 'baseline' && isPdfBuild && fontRights !== 'pdf-embed-ok') {
  throw new Error(
    `Refusing TYP-03 PDF build for ${candidate}: set TYP03_FONT_RIGHTS=pdf-embed-ok only when the supplied font licence permits PDF embedding. Use vivliostyle preview for preview-only evaluation fonts.`
  )
}

const safeLabel = String(displayLabel).toLowerCase().replace(/[^a-z0-9-]+/g, '-')

export default defineConfig({
  title: `TYP-03 ${displayLabel} — ${format.toUpperCase()} / ${rhythm} / ${alignment}`,
  language: 'en-GB',
  size: format === 'b5' ? 'B5' : 'A4',
  entryContext: workRoot,
  entry: [{ path: 'source/specimen.md', title: `TYP-03 ${displayLabel}` }],
  theme: [
    resolve(specimenRoot, 'common.css'),
    resolve(workRoot, 'candidate.css'),
    resolve(specimenRoot, `${format}.css`)
  ],
  workspaceDir: resolve(workRoot, 'vivliostyle', `${safeLabel}-${format}-${rhythm}-${alignment}`),
  output: {
    path: resolve(workRoot, 'dist', `typ03-${safeLabel}-${format}-${rhythm}-${alignment}.pdf`),
    format: 'pdf'
  }
})