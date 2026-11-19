import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { posix } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = new URL('../../../', import.meta.url)
const read = path => readFileSync(new URL(path, root), 'utf8')
const contract = JSON.parse(read('project/ccr/studies/source-consumers.json'))
const executable = /\.(?:ts|mjs|js|py)$/
const reference = /['"`]((?:\.{1,2}\/)*(?:[\w.-]+\/)*[\w.-]+\.(?:ts|mjs|js|py|json)|\w+\/studies\/[\w/-]+)['"`]/g

function recursiveFiles(directory) {
  return readdirSync(new URL(directory + '/', root), { withFileTypes: true }).flatMap(entry => {
    const path = directory + '/' + entry.name
    if (entry.isDirectory()) return recursiveFiles(path)
    return entry.isFile() && executable.test(path) ? [path] : []
  }).sort()
}

const inRepository = path => /^(?:project|compiler|publication|docs)\//.test(path)
const isFile = path => {
  if (!inRepository(path)) return false
  const url = new URL(path, root)
  return existsSync(url) && statSync(url).isFile()
}

function resolveReference(owner, value) {
  const relative = /^\w+\/studies\//.test(value) ? `project/${value}` : value
  const path = posix.normalize(inRepository(relative) ? relative : posix.join(posix.dirname(owner), relative))
  const tries = path.endsWith('.js') ? [path, path.replace(/\.js$/, '.ts')] : [path, path + '.json']
  return tries.find(isFile)
}

export function inventoryConsumerSources() {
  const classifications = new Map()
  const findings = []
  for (const family of contract.families) {
    if (!isFile(family.decision)) findings.push({ kind: 'missing-decision-source', family: family.id, path: family.decision })
    for (const path of family.entries) {
      if (classifications.has(path)) findings.push({ kind: 'duplicate-entry-classification', path })
      classifications.set(path, family.id)
    }
  }
  const uncovered = new Set(classifications.keys())
  for (const entry of contract.roots.flatMap(recursiveFiles)) {
    if (!classifications.has(entry)) findings.push({ kind: 'unclassified-entry-source', path: entry })
    uncovered.delete(entry)
  }
  for (const path of uncovered) findings.push({ kind: 'unavailable-entry-source', path })

  const edges = new Map()
  function visit(path) {
    if (edges.has(path) || !executable.test(path) || !isFile(path)) return
    const direct = [...new Set([...read(path).matchAll(reference)]
      .map(([, name]) => resolveReference(path, name)).filter(Boolean))].sort()
    edges.set(path, direct)
    for (const target of direct) visit(target)
  }
  for (const path of [...classifications.keys()].sort()) visit(path)
  return {
    families: contract.families,
    references: Object.fromEntries([...edges.entries()].sort(([a], [b]) => a < b ? -1 : a === b ? 0 : 1)),
    findings,
  }
}

if (process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = inventoryConsumerSources()
  process.stdout.write(JSON.stringify(result, null, 2) + '\n')
  if (result.findings.length) process.exitCode = 1
}
