import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@vivliostyle/cli'

const root = dirname(fileURLToPath(import.meta.url))
const format = process.env.DRW01E_FORMAT === 'b5' ? 'b5' : 'a4'

export default defineConfig({
  title: `DRW-01E doctrine specimen — ${format.toUpperCase()}`,
  language: 'en-GB',
  size: format === 'b5' ? 'B5' : 'A4',
  entryContext: root,
  entry: [{ path: 'specimen.html', title: 'DRW-01E doctrine specimen' }],
  theme: resolve(root, `${format}.css`),
  workspaceDir: resolve(root, '.work', format),
  output: {
    path: resolve(root, 'dist', `drw01e-${format}.pdf`),
    format: 'pdf'
  }
})
