import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = new URL('../../../', import.meta.url)
const readSource = (path: string) => readFileSync(new URL(path, root))
type Algorithm = 'gitBlob' | 'sha256'
type FileReader = (path: string) => Buffer
type ReceiptEdge = {
  readonly receipt: string
  readonly location: readonly string[]
  readonly format: 'map' | 'path-and-blob'
  readonly algorithm: Algorithm
  readonly source?: string
}
type Family = {
  readonly id: string
  readonly state: 'selected-reference' | 'candidate-interface'
  readonly authority: string
  readonly decisions: readonly string[]
  readonly authorRoots: readonly string[]
  readonly authoredInputs: readonly string[]
  readonly historicalInputs?: readonly string[]
  readonly inputReceipts: readonly string[]
  readonly receipts: readonly string[]
  readonly consumers: readonly string[]
  readonly producerChecks: readonly string[]
}
interface SourceAccount {
  readonly families: readonly Family[]
  readonly gitBlobs: Readonly<Record<string, string>>
  readonly receiptEdges: readonly ReceiptEdge[]
}

const contract = JSON.parse(readSource('project/ccr/studies/source-coverage.json').toString('utf8')) as SourceAccount
const gitBlob = (bytes: Buffer) => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
const sha256 = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex')

/** Checks the source account, and the input identities claimed by existing receipts. */
export function auditSourceCoverage(read: FileReader = readSource) {
  const findings: Array<{ readonly kind: string; readonly [key: string]: unknown }> = []
  const observed = new Map<string, { bytes: Buffer; gitBlob: string; sha256: string }>()
  for (const [path, expectedGitBlob] of Object.entries(contract.gitBlobs)) {
    try {
      const bytes = read(path)
      const currentGitBlob = gitBlob(bytes)
      observed.set(path, { bytes, gitBlob: currentGitBlob, sha256: sha256(bytes) })
      if (expectedGitBlob !== currentGitBlob) {
        findings.push({ kind: 'changed-file', path, expected: expectedGitBlob, observed: currentGitBlob })
      }
    } catch {
      findings.push({ kind: 'unknown-file', path })
    }
  }

  function checkEdge(receipt: string, source: string, expected: unknown, algorithm: Algorithm) {
    const current = observed.get(source)?.[algorithm]
    if (current === undefined) findings.push({ kind: 'unknown-source-edge', receipt, source })
    else if (current !== expected) findings.push({
      kind: 'source-contradiction', receipt, source, algorithm, expected, observed: current,
    })
  }

  for (const { receipt, location, format, algorithm, source: expectedPath } of contract.receiptEdges) {
    const bytes = observed.get(receipt)?.bytes
    if (!bytes) continue
    try {
      const data = location.reduce((value, field) => value[field], JSON.parse(bytes.toString('utf8')))
      if (!data || Array.isArray(data) || typeof data !== 'object') throw new Error('Missing source record')
      if (format === 'path-and-blob') {
        if (data.path !== expectedPath || typeof data.blob !== 'string') {
          findings.push({ kind: 'source-path-contradiction', receipt, location, expected: expectedPath, observed: data.path })
          continue
        }
        checkEdge(receipt, data.path, data.blob, algorithm)
      } else {
        for (const [source, expected] of Object.entries(data)) checkEdge(receipt, source, expected, algorithm)
      }
    } catch {
      findings.push({ kind: 'unknown-receipt-identity', receipt, location })
    }
  }
  return {
    authority: 'source identity and consumer applicability only',
    families: contract.families,
    bindings: contract.families.map(family => {
      const resources = [...new Set([
        ...family.decisions, ...family.authorRoots, ...family.authoredInputs, ...(family.historicalInputs ?? []),
        ...family.inputReceipts, ...family.receipts, ...family.consumers,
      ])].sort()
      const identities = Object.fromEntries(resources.flatMap(path => {
        const current = observed.get(path)
        return current ? [[path, current.gitBlob]] : []
      }))
      const inputReceiptIdentities = Object.fromEntries(family.inputReceipts.flatMap(path => {
        const current = observed.get(path)
        return current ? [[path, current.gitBlob] as const] : []
      }))
      return {
        id: family.id, state: family.state, authority: family.authority,
        identities, inputReceiptIdentities, digest: sha256(Buffer.from(JSON.stringify(identities))),
      }
    }),
    findings,
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const audit = auditSourceCoverage()
  process.stdout.write(JSON.stringify(audit, null, 2) + '\n')
  if (audit.findings.length) process.exitCode = 1
}
