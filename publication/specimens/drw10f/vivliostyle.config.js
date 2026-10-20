import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@vivliostyle/cli'

const specimenRoot = dirname(fileURLToPath(import.meta.url))
const format = process.env.DRW10F_FORMAT === 'b5' ? 'b5' : 'a4'

export default defineConfig({
  title: `DRW-10F analytical-family proof — ${format.toUpperCase()}`,
  language: 'en-GB',
  size: format === 'b5' ? 'B5' : 'A4',
  entryContext: specimenRoot,
  entry: [{ path: '.work/source/specimen.html', title: 'Analytical-family proof' }],
  theme: [resolve(specimenRoot, 'common.css'), resolve(specimenRoot, `${format}.css`)],
  workspaceDir: resolve(specimenRoot, '.work', format),
  output: {
    path: resolve(specimenRoot, 'dist', `drw10f-${format}.pdf`),
    format: 'pdf'
  }
})
