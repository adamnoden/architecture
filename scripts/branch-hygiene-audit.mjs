#!/usr/bin/env node

import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

function parseArgs(argv) {
  const options = {
    remote: 'origin',
    main: 'main',
    branches: [],
    output: null,
    repo: process.env.GITHUB_REPOSITORY ?? null,
    fetch: true,
    prs: true,
  }

  for (const arg of argv) {
    if (arg === '--skip-fetch') options.fetch = false
    else if (arg === '--skip-prs') options.prs = false
    else if (arg.startsWith('--remote=')) options.remote = arg.slice('--remote='.length)
    else if (arg.startsWith('--main=')) options.main = arg.slice('--main='.length)
    else if (arg.startsWith('--repo=')) options.repo = arg.slice('--repo='.length)
    else if (arg.startsWith('--output=')) options.output = arg.slice('--output='.length)
    else if (arg.startsWith('--branches=')) {
      options.branches.push(...arg.slice('--branches='.length).split(',').filter(Boolean))
    } else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: node scripts/branch-hygiene-audit.mjs [options]\n\nOptions:\n  --remote=<name>      remote to audit (default: origin)\n  --main=<name>        main branch name (default: main)\n  --branches=a,b       audit only named branches after enumerating all remote refs\n  --repo=owner/name    GitHub repository for PR association (auto-detected when possible)\n  --output=<path>      write JSON to a file instead of stdout\n  --skip-fetch         do not run git fetch --all --prune first\n  --skip-prs           omit GitHub pull-request association lookup\n\nThe tool is read-only with respect to the remote repository. It never pushes, deletes,\nor updates remote refs.`)
      process.exit(0)
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  options.branches = [...new Set(options.branches)]
  return options
}

function runGit(args, { allowStatus = [] } = {}) {
  const result = spawnSync('git', args, { encoding: 'utf8' })
  if (result.error) throw result.error
  if (result.status !== 0 && !allowStatus.includes(result.status)) {
    const stderr = result.stderr.trim()
    throw new Error(`git ${args.join(' ')} failed (${result.status})${stderr ? `: ${stderr}` : ''}`)
  }
  return { status: result.status, stdout: result.stdout.trimEnd(), stderr: result.stderr.trimEnd() }
}

function git(args, options) {
  return runGit(args, options).stdout
}

function parseCommitLines(value) {
  if (!value) return []
  return value.split('\n').map((line) => {
    const [sha, committedAt, ...subjectParts] = line.split('\t')
    return { sha, committedAt, subject: subjectParts.join('\t') }
  })
}

function stablePatchId(sha) {
  const patch = execFileSync('git', ['show', '--pretty=format:', '--patch', '--binary', sha], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
  const result = spawnSync('git', ['patch-id', '--stable'], { input: patch, encoding: 'utf8' })
  if (result.status !== 0) {
    throw new Error(`git patch-id --stable failed for ${sha}: ${result.stderr.trim()}`)
  }
  const firstLine = result.stdout.trim().split('\n')[0]
  return firstLine ? firstLine.split(/\s+/)[0] : null
}

function parseChangedFiles(value) {
  if (!value) return { counts: {}, files: [] }
  const counts = {}
  const files = value.split('\n').map((line) => {
    const [status, ...paths] = line.split('\t')
    const kind = status[0]
    counts[kind] = (counts[kind] ?? 0) + 1
    return { status, paths }
  })
  return { counts, files }
}

function parseCherry(value) {
  if (!value) return []
  return value.split('\n').map((line) => ({
    equivalence: line[0] === '-' ? 'patch-equivalent' : 'unique-patch',
    sha: line.slice(2).trim(),
  }))
}

function detectRepoSlug(remote) {
  const url = git(['remote', 'get-url', remote])
  const ssh = url.match(/github\.com:(?<slug>[^/]+\/[^/]+?)(?:\.git)?$/)
  if (ssh?.groups?.slug) return ssh.groups.slug.replace(/\.git$/, '')
  const https = url.match(/github\.com\/(?<slug>[^/]+\/[^/]+?)(?:\.git)?$/)
  if (https?.groups?.slug) return https.groups.slug.replace(/\.git$/, '')
  return null
}

async function fetchPullRequests(repo) {
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? null
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'house-kernel-branch-hygiene-audit',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const pulls = []
  for (let page = 1; ; page += 1) {
    const response = await fetch(
      `https://api.github.com/repos/${repo}/pulls?state=all&per_page=100&page=${page}`,
      { headers },
    )
    if (!response.ok) {
      throw new Error(`GitHub PR lookup failed (${response.status} ${response.statusText})`)
    }
    const batch = await response.json()
    pulls.push(...batch)
    if (batch.length < 100) break
  }
  return pulls
}

function pullRequestMap(pulls) {
  const byBranch = new Map()
  for (const pr of pulls) {
    const branch = pr.head?.ref
    if (!branch) continue
    const entry = {
      number: pr.number,
      state: pr.state,
      draft: Boolean(pr.draft),
      mergedAt: pr.merged_at,
      headSha: pr.head?.sha ?? null,
      url: pr.html_url,
    }
    const list = byBranch.get(branch) ?? []
    list.push(entry)
    byBranch.set(branch, list)
  }
  return byBranch
}

function remoteBranchRefs(remote, main) {
  const fullPrefix = `refs/remotes/${remote}/`
  return git(['for-each-ref', '--format=%(refname)\t%(objectname)', `refs/remotes/${remote}`])
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [fullRef, sha] = line.split('\t')
      const name = fullRef.startsWith(fullPrefix) ? fullRef.slice(fullPrefix.length) : fullRef
      return { ref: `${remote}/${name}`, name, headSha: sha }
    })
    .filter(({ name }) => name !== 'HEAD' && name !== main)
    .sort((a, b) => a.name.localeCompare(b.name))
}

function auditBranch({ remote, main, branch, prs }) {
  const mainRef = `refs/remotes/${remote}/${main}`
  const branchRef = `refs/remotes/${remote}/${branch}`
  const headSha = git(['rev-parse', branchRef])
  const committedAt = git(['show', '-s', '--format=%cI', branchRef])
  const mergeBase = git(['merge-base', mainRef, branchRef])
  const [behindMain, aheadOfMain] = git(['rev-list', '--left-right', '--count', `${mainRef}...${branchRef}`])
    .trim()
    .split(/\s+/)
    .map(Number)

  const ancestry = runGit(['merge-base', '--is-ancestor', branchRef, mainRef], { allowStatus: [1] })
  const branchOnlyCommits = parseCommitLines(
    git(['log', '--format=%H%x09%cI%x09%s', `${mainRef}..${branchRef}`]),
  )
  const nonMergeCommits = parseCommitLines(
    git(['log', '--no-merges', '--format=%H%x09%cI%x09%s', `${mainRef}..${branchRef}`]),
  ).map((commit) => ({ ...commit, stablePatchId: stablePatchId(commit.sha) }))
  const changedFiles = parseChangedFiles(
    git(['diff', '--name-status', '--find-renames', mergeBase, branchRef]),
  )
  const cherry = parseCherry(git(['cherry', mainRef, branchRef]))
  const uniquePatchCount = cherry.filter((entry) => entry.equivalence === 'unique-patch').length
  const equivalentPatchCount = cherry.length - uniquePatchCount

  return {
    name: branch,
    headSha,
    committedAt,
    mergeBase,
    behindMain,
    aheadOfMain,
    headIsAncestorOfMain: ancestry.status === 0,
    branchOnlyCommits,
    nonMergeBranchOnlyCommits: nonMergeCommits,
    changedFileSummary: changedFiles,
    patchEquivalence: {
      gitCherry: cherry,
      uniquePatchCount,
      equivalentPatchCount,
      allCherryPatchesEquivalent: cherry.length > 0 && uniquePatchCount === 0,
    },
    pullRequests: prs.get(branch) ?? [],
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))

  if (options.fetch) git(['fetch', '--all', '--prune'])

  const mainRef = `refs/remotes/${options.remote}/${options.main}`
  const mainSha = git(['rev-parse', mainRef])
  const enumerated = remoteBranchRefs(options.remote, options.main)
  const enumerationDigest = createHash('sha256')
    .update(enumerated.map(({ name, headSha }) => `${name}\t${headSha}`).join('\n'))
    .digest('hex')

  const names = new Set(enumerated.map(({ name }) => name))
  const selected = options.branches.length ? options.branches : enumerated.map(({ name }) => name)
  const missing = selected.filter((name) => !names.has(name))
  if (missing.length) throw new Error(`Requested remote branches not found: ${missing.join(', ')}`)

  let prs = new Map()
  let repo = options.repo
  if (options.prs) {
    repo ??= detectRepoSlug(options.remote)
    if (!repo) throw new Error('Could not determine GitHub repository; pass --repo=owner/name or --skip-prs')
    prs = pullRequestMap(await fetchPullRequests(repo))
  }

  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    repository: repo,
    remote: options.remote,
    mainBranch: options.main,
    mainSha,
    enumeration: {
      refNamespace: `refs/remotes/${options.remote}`,
      excluded: [`${options.remote}/HEAD`, `${options.remote}/${options.main}`],
      branchCount: enumerated.length,
      sha256: enumerationDigest,
      branches: enumerated,
    },
    auditedBranchCount: selected.length,
    auditedBranches: selected.map((branch) => auditBranch({ ...options, branch, prs })),
  }

  const json = `${JSON.stringify(report, null, 2)}\n`
  if (options.output) writeFileSync(resolve(options.output), json, 'utf8')
  else process.stdout.write(json)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
