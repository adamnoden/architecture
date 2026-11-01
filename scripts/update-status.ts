import { writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderControlGraphDocument } from '../project/control/mermaid.js'
import { controlNodes } from '../project/control/nodes/index.js'
import { renderStatusDocument, renderWorkstreamCodeRegister } from '../project/control/render.js'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

writeFileSync(join(repoRoot, 'STATUS.md'), `${renderStatusDocument(repoRoot)}\n`)
writeFileSync(join(repoRoot, 'project/workstream-codes.md'), `${renderWorkstreamCodeRegister()}\n`)
writeFileSync(join(repoRoot, 'project/control/graph.md'), `${renderControlGraphDocument(controlNodes)}\n`)

console.log('Updated STATUS.md, workstream codes and project/control/graph.md from canonical typed sources.')
