import { resolve } from 'node:path'
import { defineConfig } from '@vivliostyle/cli'

const root = import.meta.dirname

export default defineConfig({
  title: 'PLT-03B.1 ground-plan WALL scale comparison',
  language: 'en-GB',
  size: 'A2',
  entryContext: root,
  entry: [{ path: '.work/source/wall-comparison.html', title: 'PLT-03B.1 A2 WALL scale comparison' }],
  theme: [resolve(root, 'a2.css')],
  workspaceDir: resolve(root, '.work', 'a2'),
  output: {
    path: resolve(root, 'dist', 'plt03b1-a2.pdf'),
    format: 'pdf'
  }
})
