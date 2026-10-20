import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@vivliostyle/cli'

const root = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(root, '../../..')
const format = process.env.DRW11F_FORMAT === 'b5' ? 'b5' : 'a4'

export default defineConfig({
  title: `DRW-11F early-book FLOW proof — ${format.toUpperCase()}`,
  language: 'en-GB',
  size: format === 'b5' ? 'B5' : 'A4',
  entryContext: repoRoot,
  entry: [{ path: 'publication/specimens/drw11f/specimen.html', title: 'DRW-11F early-book FLOW proof' }],
  theme: [resolve(root, 'common.css'), resolve(root, `${format}.css`)],
  workspaceDir: resolve(root, '.work', format),
  output: {
    path: resolve(root, 'dist', `drw11f-${format}.pdf`),
    format: 'pdf'
  }
})
