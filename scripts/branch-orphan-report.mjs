#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const DAY_MS = 24 * 60 * 60 * 1000

function parseArgs(argv) {
  const options = {
    input: 'branch-hygiene-audit.json',
    retentions: 'project/branch-hygiene-retentions.json',
    markdown: 'branch-orphan-report.md',
    json: 'branch-orphan-report.json',
    recentDays: 14,
  }

  for (const arg of argv) {
    if (arg.startsWith('--input=')) options.input = arg.slice('--input='.length)
    else if (arg.startsWith('--retentions=')) options.retentions = arg.slice('--retentions='.length)
    else if (arg.startsWith('--markdown=')) options.markdown = arg.slice('--markdown='.length)
    else if (arg.startsWith('--json=')) options.json = arg.slice('--json='.length)
    else if (arg.startsWith('--recent-days=')) options.recentDays = Number(arg.slice('--recent-days='.length))
    else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: node scripts/branch-orphan-report.mjs [options]\n\nOptions:\n  --input=<path>         branch-hygiene audit JSON (default: branch-hygiene-audit.json)\n  --retentions=<path>    explicit retention reasons JSON\n  --markdown=<path>      Markdown report output\n  --json=<path>          machine-readable report output\n  --recent-days=<n>      age window treated as clearly recent (default: 14)\n\nThis reporter is read-only with respect to the repository. Suspicious branches are reported; they are never deleted or rewritten.`)
      process.exit(0)
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  if (!Number.isFinite(options.recentDays) || options.recentDays < 0) {
    throw new Error('--recent-days must be a non-negative number')
  }
  return options
}

function loadJson(path) {
  return JSON.parse(readFileSync(resolve(path), 'utf8'))
}

function loadRetentions(path) {
  if (!existsSync(resolve(path))) return {}
  const value = loadJson(path)
  if (value.schemaVersion !== 1 || typeof value.retainedBranches !== 'object' || value.retainedBranches === null || Array.isArray(value.retainedBranches)) {
    throw new Error(`Invalid retention file: ${path}`)
  }

  const retained = {}
  for (const [branch, reason] of Object.entries(value.retainedBranches)) {
    if (typeof reason !== 'string' || !reason.trim()) {
      throw new Error(`Retention reason for ${branch} must be a non-empty string`)
    }
    retained[branch] = reason.trim()
  }
  return retained
}

function escapeCell(value) {
  return String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ')
}

function branchRow(branch, generatedAtMs, recentDays, retentions) {
  const committedAtMs = Date.parse(branch.committedAt)
  if (!Number.isFinite(committedAtMs)) throw new Error(`Invalid committedAt for ${branch.name}: ${branch.committedAt}`)

  const ageDays = Math.max(0, (generatedAtMs - committedAtMs) / DAY_MS)
  const openPullRequests = (branch.pullRequests ?? []).filter((pr) => pr.state === 'open')
  const retentionReason = retentions[branch.name] ?? null

  let status
  if (openPullRequests.length > 0) status = 'open-pr'
  else if (retentionReason) status = 'retained'
  else if (ageDays <= recentDays) status = 'recent'
  else status = 'suspicious'

  return {
    name: branch.name,
    headSha: branch.headSha,
    committedAt: branch.committedAt,
    ageDays: Number(ageDays.toFixed(1)),
    status,
    openPullRequests: openPullRequests.map((pr) => ({
      number: pr.number,
      draft: Boolean(pr.draft),
      url: pr.url,
      headSha: pr.headSha,
    })),
    retentionReason,
    behindMain: branch.behindMain,
    aheadOfMain: branch.aheadOfMain,
    headIsAncestorOfMain: Boolean(branch.headIsAncestorOfMain),
    branchOnlyCommitCount: (branch.branchOnlyCommits ?? []).length,
    nonMergeBranchOnlyCommitCount: (branch.nonMergeBranchOnlyCommits ?? []).length,
    patchEquivalence: {
      uniquePatchCount: branch.patchEquivalence?.uniquePatchCount ?? 0,
      equivalentPatchCount: branch.patchEquivalence?.equivalentPatchCount ?? 0,
      allCherryPatchesEquivalent: Boolean(branch.patchEquivalence?.allCherryPatchesEquivalent),
    },
  }
}

function makeMarkdown(report) {
  const lines = [
    '# Branch orphan audit',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    `Main: \`${report.mainBranch}\` at \`${report.mainSha}\``,
    `Recent window: **${report.recentDays} days**`,
    '',
    `Branches audited: **${report.summary.total}** — open PR: **${report.summary.openPr}**, recent: **${report.summary.recent}**, explicitly retained: **${report.summary.retained}**, suspicious: **${report.summary.suspicious}**.`,
    '',
    '> Suspicious is a review signal only. This workflow never deletes, rewrites or pushes branch refs.',
    '',
    '| Status | Branch | Age | Open PR | Ahead / behind | Branch-only commits | Unique / equivalent patches | Retention reason |',
    '|---|---|---:|---|---:|---:|---:|---|',
  ]

  for (const branch of report.branches) {
    const prs = branch.openPullRequests.length
      ? branch.openPullRequests.map((pr) => `#${pr.number}${pr.draft ? ' (draft)' : ''}`).join(', ')
      : '—'
    const retention = branch.retentionReason ?? '—'
    lines.push(
      `| ${escapeCell(branch.status)} | \`${escapeCell(branch.name)}\` | ${branch.ageDays} d | ${escapeCell(prs)} | ${branch.aheadOfMain} / ${branch.behindMain} | ${branch.branchOnlyCommitCount} | ${branch.patchEquivalence.uniquePatchCount} / ${branch.patchEquivalence.equivalentPatchCount} | ${escapeCell(retention)} |`,
    )
  }

  const suspicious = report.branches.filter((branch) => branch.status === 'suspicious')
  lines.push('', '## Suspicious branches', '')
  if (suspicious.length === 0) lines.push('None.')
  else {
    for (const branch of suspicious) {
      lines.push(
        `- \`${branch.name}\` — ${branch.ageDays} days old; no open PR; no explicit retention reason; ahead/behind ${branch.aheadOfMain}/${branch.behindMain}; branch-only commits ${branch.branchOnlyCommitCount}; unique/equivalent patches ${branch.patchEquivalence.uniquePatchCount}/${branch.patchEquivalence.equivalentPatchCount}.`,
      )
    }
  }
  lines.push('')
  return `${lines.join('\n')}\n`
}

function main() {
  const options = parseArgs(process.argv.slice(2))
  const audit = loadJson(options.input)
  const retentions = loadRetentions(options.retentions)
  const generatedAtMs = Date.parse(audit.generatedAt)
  if (!Number.isFinite(generatedAtMs)) throw new Error(`Invalid audit generatedAt: ${audit.generatedAt}`)

  const branches = (audit.auditedBranches ?? [])
    .map((branch) => branchRow(branch, generatedAtMs, options.recentDays, retentions))
    .sort((a, b) => {
      const order = { suspicious: 0, retained: 1, recent: 2, 'open-pr': 3 }
      return order[a.status] - order[b.status] || a.name.localeCompare(b.name)
    })

  const report = {
    schemaVersion: 1,
    generatedAt: audit.generatedAt,
    repository: audit.repository,
    mainBranch: audit.mainBranch,
    mainSha: audit.mainSha,
    sourceEnumerationSha256: audit.enumeration?.sha256 ?? null,
    recentDays: options.recentDays,
    summary: {
      total: branches.length,
      openPr: branches.filter((branch) => branch.status === 'open-pr').length,
      recent: branches.filter((branch) => branch.status === 'recent').length,
      retained: branches.filter((branch) => branch.status === 'retained').length,
      suspicious: branches.filter((branch) => branch.status === 'suspicious').length,
    },
    branches,
  }

  writeFileSync(resolve(options.json), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  writeFileSync(resolve(options.markdown), makeMarkdown(report), 'utf8')
  process.stdout.write(`${JSON.stringify(report.summary)}\n`)
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
}
