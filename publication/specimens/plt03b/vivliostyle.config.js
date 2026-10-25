import { resolve } from 'node:path'
import { defineConfig } from '@vivliostyle/cli'

const root = import.meta.dirname
const format = ['b5', 'a4', 'a2'].includes(process.env.PLT03B_FORMAT ?? '')
  ? process.env.PLT03B_FORMAT
  : 'b5'
const isWall = format === 'a2'
const size = format === 'b5' ? 'B5' : format === 'a2' ? 'A2' : 'A4'
const entryName = isWall ? 'wall.html' : 'book.html'

export default defineConfig({
  title: `PLT-03B ground-plan proof — ${format.toUpperCase()}`,
  language: 'en-GB',
  size,
  entryContext: root,
  entry: [{ path: `.work/source/${entryName}`, title: 'PLT-03B ground-plan proof' }],
  theme: [resolve(root, 'common.css'), resolve(root, `${format}.css`)],
  workspaceDir: resolve(root, '.work', format),
  output: {
    path: resolve(root, 'dist', `plt03b-${format}.pdf`),
    format: 'pdf'
  }
})
