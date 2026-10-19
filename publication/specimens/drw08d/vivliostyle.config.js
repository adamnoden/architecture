import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@vivliostyle/cli'

const root = dirname(fileURLToPath(import.meta.url))
const format = process.env.DRW08D_FORMAT === 'b5' ? 'b5' : 'a4'
export default defineConfig({
  title: `DRW-08D courtyard elevation proof — ${format.toUpperCase()}`,
  language: 'en-GB',
  size: format === 'b5' ? 'B5' : 'A4',
  entryContext: root,
  entry: [{ path: '.work/source/specimen.html', title: 'Reference House courtyard elevation proof' }],
  theme: [resolve(root, 'common.css'), resolve(root, `${format}.css`)],
  workspaceDir: resolve(root, '.work', format),
  output: { path: resolve(root, 'dist', `drw08d-${format}.pdf`), format: 'pdf' }
})
