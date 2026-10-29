import { writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderControlGraphDocument, renderControlMermaid } from '../project/control/mermaid.js'
import { controlNodes } from '../project/control/nodes/index.js'
import { renderStatusDocument, renderWorkstreamCodeRegister } from '../project/control/render.js'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

writeFileSync(join(repoRoot, 'STATUS.md'), `${renderStatusDocument(repoRoot)}\n`)
writeFileSync(join(repoRoot, 'project/workstream-codes.md'), `${renderWorkstreamCodeRegister()}\n`)
writeFileSync(join(repoRoot, 'project/control/graph.md'), `${renderControlGraphDocument(controlNodes)}\n`)
writeFileSync(join(repoRoot, 'docs/project/graph-source.ts'), [
  '// Generated from project/control/ by npm run status:update; do not hand-edit.',
  `export const currentMermaid = ${JSON.stringify(renderControlMermaid(controlNodes))}`,
  `export const completeMermaid = ${JSON.stringify(renderControlMermaid(controlNodes, { includeDone: true }))}`,
  ''
].join('\\n'))
writeFileSync(join(repoRoot, 'docs/project/dependency-graph.md'), [
  '# Project dependency graph',
  '',
  'This is the current structural dependency graph for **Ovid’s House**, generated from the canonical project-control DAG.',
  '',
  '**Click the preview to open the full-size, pannable vector graph in a new tab.** The full viewer supports drag-to-pan, zoom, Fit and 100%.',
  '',
  '<ControlGraph />',
  '',
  '## Complete history',
  '',
  'The current view omits completed and cancelled work so the execution frontier remains discernible.',
  '',
  '[Open the complete DAG in the full-size viewer](?view=full&graph=all){target="_blank" rel="noopener noreferrer"}',
  '',
  '## What the colours mean',
  '',
  '**Ready** — prerequisites satisfied · **Active** — durably started · **Blocked** — awaiting prerequisites · **Held** — deliberately paused. Completed work appears in the historical viewer.',
  '',
  'The graph shows durable structural state, not live agent occupancy. ACO claims are maintained separately on the runtime branch.',
  ''
].join('\\n'))

console.log('Updated STATUS.md, workstream codes and structural control-graph projections from canonical typed sources.')
