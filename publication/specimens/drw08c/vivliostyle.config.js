import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@vivliostyle/cli'

const root = dirname(fileURLToPath(import.meta.url))
const format = process.env.DRW08C_FORMAT === 'b5' ? 'b5' : 'a4'
export default defineConfig({
  title: `DRW-08C garden elevation proof — ${format.toUpperCase()}`,
  language: 'en-GB',
  size: format === 'b5' ? 'B5' : 'A4',
  entryContext: root,
  entry: [{ path: '.work/source/specimen.html', title: 'Reference House garden elevation proof' }],
  theme: [resolve(root, 'common.css'), resolve(root, `${format}.css`)],
  workspaceDir: resolve(root, '.work', format),
  output: { path: resolve(root, 'dist', `drw08c-${format}.pdf`), format: 'pdf' }
})
