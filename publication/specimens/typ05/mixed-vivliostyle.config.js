import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@vivliostyle/cli'

const specimenRoot = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(specimenRoot, '../../..')
const format = process.env.TYP05_FORMAT === 'a4' ? 'a4' : 'b5'
const workRoot = resolve(repoRoot, 'publication/.work/typ05b', format)

export default defineConfig({
  title: `TYP-05B mixed-content specimen — ${format.toUpperCase()}`,
  language: 'en-GB',
  size: format === 'b5' ? 'B5' : 'A4',
  entryContext: workRoot,
  entry: [{ path: 'specimen.html', title: 'TYP-05B mixed-content specimen' }],
  theme: [
    resolve(specimenRoot, 'mixed-common.css'),
    resolve(workRoot, 'fonts.css'),
    resolve(specimenRoot, `mixed-${format}.css`)
  ],
  workspaceDir: resolve(workRoot, 'vivliostyle'),
  output: {
    path: resolve(workRoot, `typ05b-mixed-content-${format}.pdf`),
    format: 'pdf'
  }
})
