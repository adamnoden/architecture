import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { GitHubClaimStore } from '../project/control/github-claim-store.js'
import { validatePacketDeclaration } from '../project/control/operations.js'
import { controlNodes } from '../project/control/nodes/index.js'

const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

export function publicationPreflightRequest(event: unknown, repository: string) {
  if (repository !== 'adamnoden/architecture' || !object(event) || !object(event.repository)
      || event.repository.full_name !== repository || !object(event.pull_request)) {
    throw new Error('Publication preflight requires the expected repository pull-request event')
  }
  const pr = event.pull_request
  if (!object(pr.head) || !object(pr.base) || !object(pr.head.repo) || !object(pr.base.repo)
      || pr.head.repo.full_name !== repository || pr.base.repo.full_name !== repository
      || pr.base.ref !== 'main' || pr.state !== 'open' || pr.merged === true
      || !Number.isSafeInteger(pr.number) || Number(pr.number) < 1
      || typeof pr.head.ref !== 'string' || typeof pr.head.sha !== 'string'
      || !/^[0-9a-f]{40}$/.test(pr.head.sha) || typeof pr.body !== 'string') {
    throw new Error('Publication preflight rejects forks, wrong bases, missing declarations or invalid head identities')
  }
  return { number: Number(pr.number), branch: pr.head.ref, head: pr.head.sha, body: pr.body }
}

async function main() {
  const repository = process.env.GITHUB_REPOSITORY ?? ''
  const token = process.env.GITHUB_TOKEN
  const eventPath = process.env.GITHUB_EVENT_PATH
  if (!token || !eventPath) throw new Error('Publication preflight runner context is unavailable')
  const request = publicationPreflightRequest(JSON.parse(readFileSync(eventPath, 'utf8')), repository)
  const listed = await new GitHubClaimStore(repository, token).list()
  const claims = listed.claims.map(row => row.record)
  const declared = validatePacketDeclaration(request.body, controlNodes, claims, request.branch, request.number)
  const results = declared.map(node => {
    const claim = claims.find(row => row.node === node)
    if (!claim || claim.state !== 'claimed') throw new Error('Declared packet has no live canonical claim: ' + node)
    const output = execFileSync(process.execPath, ['--import', 'tsx', 'scripts/project-claims.ts',
      'merge-check', node, '--lease-id', claim.leaseId, '--generation', String(claim.generation),
      '--branch', request.branch, '--head', request.head], {
      encoding: 'utf8', timeout: 120000, maxBuffer: 1024 * 1024,
    })
    return JSON.parse(output)
  })
  process.stdout.write(JSON.stringify({ head: request.head, branch: request.branch, results,
    state: declared.length ? 'canonical-leases-verified' : 'not-applicable-no-leased-packets',
    ci: 'separate-exact-head-validation-required', atomicFence: false }, null, 2) + '\n')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { process.stderr.write(String(error) + '\n'); process.exitCode = 1 })
}
