import { resolve } from 'node:path'
import { defineConfig } from '@vivliostyle/cli'
const root = import.meta.dirname
const format = process.env.PLT03B2_FORMAT ?? 'b5'
if (!['b5', 'a4', 'a2'].includes(format)) throw new Error('Unknown PLT-03B.2 profile')
export default defineConfig({
  title: `Ground-floor ${format.toUpperCase()} physical proof`, language: 'en-GB',
  size: format === 'b5' ? '176mm 250mm' : format.toUpperCase(),
  entryContext: root,
  entry: [{ path: `.work/${format === 'a2' ? 'wall' : 'book'}.html` }],
  theme: [resolve(root, 'common.css'), resolve(root, `${format}.css`)],
  workspaceDir: resolve(root, '.work', format),
  output: { path: resolve(root, 'dist', `plt03b2-${format}.pdf`), format: 'pdf' }
})
