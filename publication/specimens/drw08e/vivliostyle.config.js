import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@vivliostyle/cli'

const root = dirname(fileURLToPath(import.meta.url))
const format = process.env.DRW08E_FORMAT === 'b5' ? 'b5' : 'a4'
export default defineConfig({
  title: `DRW-08E synthetic setting proof — ${format.toUpperCase()}`,
  language: 'en-GB',
  size: format === 'b5' ? 'B5' : 'A4',
  entryContext: root,
  entry: [{ path: '.work/source/specimen.html', title: 'Reference House synthetic setting proof' }],
  theme: [resolve(root, 'common.css'), resolve(root, `${format}.css`)],
  workspaceDir: resolve(root, '.work', format),
  output: { path: resolve(root, 'dist', `drw08e-${format}.pdf`), format: 'pdf' }
})
