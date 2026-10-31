import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@vivliostyle/cli'

const specimenRoot = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(specimenRoot, '../../..')
const format = process.env.TYP04_FORMAT === 'a4' ? 'a4' : 'b5'
const workRoot = resolve(repoRoot, 'publication/.work/typ04', format)

export default defineConfig({
  title: `TYP-04B hierarchy specimen — ${format.toUpperCase()}`,
  language: 'en-GB',
  size: format === 'b5' ? 'B5' : 'A4',
  entryContext: workRoot,
  entry: [{ path: 'specimen.html', title: 'TYP-04B hierarchy specimen' }],
  theme: [
    resolve(specimenRoot, 'common.css'),
    resolve(workRoot, 'fonts.css'),
    resolve(specimenRoot, `${format}.css`)
  ],
  workspaceDir: resolve(workRoot, 'vivliostyle'),
  output: {
    path: resolve(workRoot, `typ04b-serif-led-${format}.pdf`),
    format: 'pdf'
  }
})
