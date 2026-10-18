import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@vivliostyle/cli'

const specimenRoot = dirname(fileURLToPath(import.meta.url))
const format = process.env.DRW04D_FORMAT === 'b5' ? 'b5' : 'a4'

export default defineConfig({
  title: `DRW-04D paired floor-plan proof — ${format.toUpperCase()}`,
  language: 'en-GB',
  size: format === 'b5' ? 'B5' : 'A4',
  entryContext: specimenRoot,
  entry: [{ path: '.work/source/specimen.html', title: 'Reference House paired floor-plan proof' }],
  theme: [resolve(specimenRoot, 'common.css'), resolve(specimenRoot, `${format}.css`)],
  workspaceDir: resolve(specimenRoot, '.work', format),
  output: {
    path: resolve(specimenRoot, 'dist', `drw04d-${format}.pdf`),
    format: 'pdf'
  }
})
