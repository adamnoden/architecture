import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, symlinkSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { declaredWork } from '../project/control/operations.js'

function object(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`Invalid ${name}`)
  return value as Record<string, unknown>
}
function text(value: unknown, name: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing ${name}`)
  return value
}

export function parsePreflightEvent(value: unknown) {
  const event = object(value, 'event')
  const pr = object(event.pull_request, 'pull request')
  const head = object(pr.head, 'head')
  const base = object(pr.base, 'base')
  const repository = text(object(base.repo, 'base repository').full_name, 'repository')
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) throw new Error('Invalid repository')
  if (object(head.repo, 'head repository').full_name !== repository) throw new Error('Publication preflight requires a same-repository branch')
  if (base.ref !== 'main') throw new Error('Publication preflight requires main')
  const sha = text(head.sha, 'head SHA')
  if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error('Invalid head SHA')
  const branch = text(head.ref, 'head branch')
  const body = typeof pr.body === 'string' ? pr.body : ''
  const ids = declaredWork(body)
  const declarations = [...body.matchAll(/^Lease:\s*([A-Z0-9-]+)\s*\/\s*(\S+)\s*\/\s*generation\s+(\d+)\s*$/gmi)]
  const leases = ids.map(node => {
    const matches = declarations.filter(match => match[1] === node)
    if (matches.length !== 1) throw new Error(`Exactly one lease declaration required for ${node}`)
    const generation = Number(matches[0][3])
    if (!Number.isSafeInteger(generation) || generation < 1) throw new Error('Invalid lease generation')
    return { node, leaseId: matches[0][2], generation }
  })
  return { repository, head: sha, branch, leases }
}

export function runPublicationPreflight(eventPath: string, root = process.cwd()) {
  const request = parsePreflightEvent(JSON.parse(readFileSync(eventPath, 'utf8')))
  if (!request.leases.length) {
    console.log('Non-packet exemption: no canonical lease preflight applies. Required CI and merge-source checks still apply.')
    return []
  }
  const git = (args: string[], cwd = root) => execFileSync('git', args, {cwd, encoding: 'utf8', timeout: 30000}).trim()
  git(['check-ref-format', '--branch', request.branch])
  git(['fetch', 'origin', `refs/heads/main:refs/remotes/origin/main`, `refs/heads/${request.branch}:refs/remotes/origin/${request.branch}`, '--quiet'])
  if (git(['rev-parse', `origin/${request.branch}`]) !== request.head) throw new Error('PR head moved after validation began')
  git(['merge-base', '--is-ancestor', 'origin/main', request.head])
  if (git(['rev-parse', 'HEAD^{tree}']) !== git(['rev-parse', `${request.head}^{tree}`])) throw new Error('Validated source tree differs from the exact publication head')
  const directory = mkdtempSync(join(tmpdir(), 'ovids-house-preflight-'))
  let attached = false
  try {
    git(['worktree', 'add', '--detach', directory, request.head])
    attached = true
    symlinkSync(join(root, 'node_modules'), join(directory, 'node_modules'), 'dir')
    const results = request.leases.map(lease => {
      const stdout = execFileSync(process.execPath, [
        '--import', 'tsx', 'scripts/project-claims.ts', 'merge-check', lease.node,
        '--lease-id', lease.leaseId, '--generation', String(lease.generation),
        '--branch', request.branch, '--head', request.head, '--transport', 'connector'
      ], {cwd: directory, encoding: 'utf8', timeout: 120000, env: {...process.env, GITHUB_REPOSITORY: request.repository}})
      const result = JSON.parse(stdout)
      console.log(JSON.stringify(result))
      return result
    })
    console.log('Read-only canonical preflight observation after validation; not an atomic merge permission. Recheck after delay or source/lease change.')
    return results
  } finally {
    if (attached) {
      rmSync(join(directory, 'node_modules'), {force: true})
      git(['worktree', 'remove', directory])
    } else {
      rmSync(directory, {recursive: true, force: true})
    }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    runPublicationPreflight(text(process.env.GITHUB_EVENT_PATH, 'GITHUB_EVENT_PATH'))
  } catch (error) {
    console.error(String(error))
    process.exitCode = 1
  }
}
