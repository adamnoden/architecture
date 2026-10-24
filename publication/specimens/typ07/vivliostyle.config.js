import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@vivliostyle/cli'

const specimenRoot = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(specimenRoot, '../../..')
const format = process.env.TYP07_FORMAT === 'a4' ? 'a4' : 'b5'
const workRoot = resolve(repoRoot, 'publication/.work/typ07b', format)

export default defineConfig({
  title: `TYP-07B representative signature — ${format.toUpperCase()}`,
  language: 'en-GB',
  size: format === 'b5' ? 'B5' : 'A4',
  entryContext: workRoot,
  entry: [{ path: 'specimen.html', title: 'TYP-07B representative signature' }],
  theme: [
    resolve(specimenRoot, 'common.css'),
    resolve(workRoot, 'fonts.css'),
    resolve(specimenRoot, `${format}.css`)
  ],
  workspaceDir: resolve(workRoot, 'vivliostyle'),
  output: {
    path: resolve(workRoot, `typ07b-representative-${format}.pdf`),
    format: 'pdf'
  }
})
