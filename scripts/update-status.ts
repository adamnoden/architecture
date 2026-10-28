import { writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderStatusDocument, renderWorkstreamCodeRegister } from '../project/control/render.js'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

writeFileSync(join(repoRoot, 'STATUS.md'), `${renderStatusDocument(repoRoot)}\n`)
writeFileSync(join(repoRoot, 'project/workstream-codes.md'), `${renderWorkstreamCodeRegister()}\n`)

console.log('Updated STATUS.md and project/workstream-codes.md from canonical typed sources.')
