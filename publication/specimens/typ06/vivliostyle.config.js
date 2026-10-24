import { resolve } from 'node:path'
import { defineConfig } from '@vivliostyle/cli'

const repoRoot = resolve(import.meta.dirname, '../../..')
const format = process.env.TYP06_FORMAT === 'a4' ? 'a4' : 'b5'
const workRoot = resolve(repoRoot, 'publication/.work/typ06b', format)

export default defineConfig({
  title: `TYP-06B drawing-interface proof — ${format.toUpperCase()}`,
  language: 'en-GB',
  size: format === 'b5' ? 'B5' : 'A4',
  entryContext: workRoot,
  entry: [{ path: 'specimen.html', title: 'TYP-06B drawing-interface proof' }],
  workspaceDir: resolve(workRoot, 'vivliostyle'),
  output: {
    path: resolve(workRoot, `typ06b-drawing-interface-${format}.pdf`),
    format: 'pdf'
  }
})
