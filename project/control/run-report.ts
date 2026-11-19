import { derivedState } from './derive.js'
import type { ControlNode, DerivedNodeState, NodeLifecycle } from './types.js'

export interface ProgressNode {
  id: string
  owners: readonly string[]
  lifecycle: NodeLifecycle
  state: DerivedNodeState
  manualReason?: string
}
export interface ProgressSnapshot {
  ref: string
  observedAt: string
  nodes: readonly ProgressNode[]
}
export interface RunMerge { node: string; pr: string; merge: string }
export interface SwarmRun {
  schemaVersion: 1
  mode: 'swarm' | 'directed'
  startedAt: string
  baseline: ProgressSnapshot
  merges: RunMerge[]
}
export const stopReasons = ['frontier-empty', 'coordination-unavailable', 'owner-interruption', 'execution-limit', 'scope-complete'] as const
export type StopReason = typeof stopReasons[number]
export interface RunCloseout {
  reason: StopReason
  detail: string
  validation: string
  leases: 'released' | 'residue'
  cleanup: 'clean' | 'residue'
  residue?: string
}
export function progressSnapshot(nodes: readonly ControlNode[], ref: string, at = new Date()): ProgressSnapshot {
  return { ref, observedAt: at.toISOString(), nodes: nodes.map(n => ({
    id: n.id, owners: [...n.owners], lifecycle: n.lifecycle, state: derivedState(n, nodes),
    ...(n.agentDispatch?.mode === 'manual' ? { manualReason: n.agentDispatch.reason ?? 'Manual dispatch' } : {})
  })) }
}
export function packetCoverage(nodes: readonly ProgressNode[]) {
  const cancelled = nodes.filter(n => n.lifecycle === 'cancelled').length
  const total = nodes.length - cancelled
  const done = nodes.filter(n => n.lifecycle === 'complete').length
  return { done, total, cancelled, percent: total ? Math.round(1000 * done / total) / 10 : null }
}
export function progressDelta(before: ProgressSnapshot, after: ProgressSnapshot) {
  const a = new Map(before.nodes.map(n => [n.id, n])), b = new Map(after.nodes.map(n => [n.id, n]))
  return {
    added: after.nodes.filter(n => !a.has(n.id)).map(n => n.id),
    removed: before.nodes.filter(n => !b.has(n.id)).map(n => n.id),
    addedComplete: after.nodes.filter(n => !a.has(n.id) && n.lifecycle === 'complete').map(n => n.id),
    completed: after.nodes.filter(n => a.has(n.id) && a.get(n.id)!.lifecycle !== 'complete' && n.lifecycle === 'complete').map(n => n.id),
    reopened: after.nodes.filter(n => a.get(n.id)?.lifecycle === 'complete' && n.lifecycle !== 'complete' && n.lifecycle !== 'cancelled').map(n => n.id),
    cancelled: after.nodes.filter(n => a.has(n.id) && a.get(n.id)!.lifecycle !== 'cancelled' && n.lifecycle === 'cancelled').map(n => n.id),
    newlyReady: after.nodes.filter(n => n.state === 'ready' && a.get(n.id)?.state !== 'ready').map(n => n.id)
  }
}
function dateMs(value: string): number {
  const n = Date.parse(value)
  if (!Number.isFinite(n)) throw new Error(`Invalid timestamp: ${value}`)
  return n
}
export function elapsedMinutes(start: string, end: string): number {
  const delta = dateMs(end) - dateMs(start)
  if (delta < 0) throw new Error('Report time precedes run start')
  return Math.round(delta / 6000) / 10
}
export function parseSwarmRun(raw: string): SwarmRun {
  const r = JSON.parse(raw) as SwarmRun
  if (r.schemaVersion !== 1 || !['swarm', 'directed'].includes(r.mode) || !r.baseline || !Array.isArray(r.baseline.nodes) || !Array.isArray(r.merges)) throw new Error('Malformed swarm run')
  dateMs(r.startedAt); dateMs(r.baseline.observedAt)
  if (typeof r.baseline.ref !== 'string' || !/^[a-f0-9]{40}$/.test(r.baseline.ref)) throw new Error('Invalid baseline ref')
  const ids = new Set<string>()
  for (const n of r.baseline.nodes) {
    if (!/^[A-Z0-9][A-Z0-9-]*$/.test(n.id) || ids.has(n.id) || !Array.isArray(n.owners) || !n.owners.every((o: unknown) => typeof o === 'string' && /^[A-Z]{3}$/.test(o)) || !['planned','started','held','complete','cancelled'].includes(n.lifecycle) || !['ready','blocked','active','held','done','cancelled'].includes(n.state)) throw new Error('Invalid baseline node')
    ids.add(n.id)
  }
  const merged = new Set<string>()
  for (const m of r.merges) {
    if (!/^[A-Z0-9][A-Z0-9-]*$/.test(m.node) || merged.has(m.node) || !/^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+$/.test(m.pr) || !/^[a-f0-9]{40}$/.test(m.merge)) throw new Error('Invalid or duplicate merge entry')
    merged.add(m.node)
  }
  return r
}
export function validateCloseout(run: SwarmRun, closeout: RunCloseout): void {
  if (!stopReasons.includes(closeout.reason) || !closeout.detail.trim() || !closeout.validation.trim()) throw new Error('Final report needs a recognised stop reason, concrete detail and validation result')
  if (run.mode === 'swarm' && closeout.reason === 'scope-complete') throw new Error('An undirected swarm has no invented packet-count cap; use an evidenced stop reason')
  if (!['released','residue'].includes(closeout.leases) || !['clean','residue'].includes(closeout.cleanup)) throw new Error('Explicit lease and cleanup status required')
  if ((closeout.leases === 'residue' || closeout.cleanup === 'residue') && !closeout.residue?.trim()) throw new Error('Name the exact residue and action owner')
}
const coverageText = (nodes: readonly ProgressNode[]) => {
  const c = packetCoverage(nodes)
  return `${c.done}/${c.total} (${c.percent === null ? 'n/a' : c.percent + '%'})`
}
const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ')
export function renderRunReport(run: SwarmRun, after: ProgressSnapshot, options: { closeout?: RunCloseout; allWorkstreams?: boolean; liveSummary?: string } = {}): string {
  if (options.closeout) validateCloseout(run, options.closeout)
  const elapsed = elapsedMinutes(run.startedAt, after.observedAt), delta = progressDelta(run.baseline, after)
  const end = new Map(after.nodes.map(n => [n.id, n]))
  const shipped = run.merges.filter(m => end.get(m.node)?.lifecycle === 'complete')
  const invalidated = run.merges.filter(m => end.get(m.node)?.lifecycle !== 'complete')
  const touched = new Set(run.merges.flatMap(m => [...(end.get(m.node)?.owners ?? run.baseline.nodes.find(n => n.id === m.node)?.owners ?? [])]))
  const codes = [...new Set([...run.baseline.nodes, ...after.nodes].flatMap(n => [...n.owners]))].filter(c => options.allWorkstreams || touched.has(c)).sort()
  const states = (state: DerivedNodeState) => after.nodes.filter(n => n.state === state).length
  const lines = [
    `**Swarm ${options.closeout ? 'closeout' : 'checkpoint'} · ${elapsed} min elapsed · ${shipped.length} merged packet(s) currently complete**`, '',
    `Timing: ${run.startedAt} → ${after.observedAt}; wall time including setup/CI/waits since capture, not human effort or total agent compute.`,
    `Authority: ${run.baseline.ref} → ${after.ref}.`, '',
    '**This session shipped**', '',
    ...(shipped.length ? shipped.map(m => `- ${m.node}: [PR](${m.pr}) · merge ${m.merge.slice(0, 12)}`) : ['- None recorded.']),
    ...(invalidated.length ? [`- Reopened/removed since merge (not counted complete): ${invalidated.map(m => m.node).join(', ')}.`] : []), '',
    `**Programme packet coverage:** ${coverageText(run.baseline.nodes)} → ${coverageText(after.nodes)}.`,
    'Counts are canonical packets, not effort, architectural maturity, construction readiness or an ETA. Shared nodes count once globally and once in each owning workstream; rows must not be summed.', '',
    '| Workstream | Before | Now | Ready | Blocked | Active | Held | Cancelled |',
    '|---|---:|---:|---:|---:|---:|---:|---:|',
    ...codes.map(code => {
      const before = run.baseline.nodes.filter(n => n.owners.includes(code)), now = after.nodes.filter(n => n.owners.includes(code))
      return `| ${code} | ${coverageText(before)} | ${coverageText(now)} | ${['ready','blocked','active','held'].map(s => now.filter(n => n.state === s).length).join(' | ')} | ${packetCoverage(now).cancelled} |`
    }), '',
    `Scope changes: +${delta.added.length} added, −${delta.removed.length} removed, ${delta.cancelled.length} newly cancelled, ${delta.reopened.length} reopened. Previously tracked packets newly complete: ${delta.completed.length}; added already complete: ${delta.addedComplete.length}. These programme deltas may include other agents.`,
    ...(delta.reopened.length ? [`Reopened: ${delta.reopened.join(', ')}.`] : []),
    `Current structural frontier: ${states('ready')} ready, ${states('blocked')} blocked, ${states('active')} active, ${states('held')} held.`,
    `Newly ready: ${delta.newlyReady.join(', ') || 'none'}.`,
    `Live dispatch: ${options.liveSummary ?? 'not queried; structural READY does not establish availability.'}`, '',
    '**Manual ready gates**', '',
    ...(() => { const manual = after.nodes.filter(n => n.state === 'ready' && n.manualReason); return manual.length ? manual.map(n => `- ${n.id}: ${cell(n.manualReason!)}`) : ['- None.'] })(), '',
    ...(options.closeout ? [
      `**Stopped:** ${options.closeout.reason} — ${options.closeout.detail}`,
      `**Validation:** ${options.closeout.validation}`,
      `**Leases:** ${options.closeout.leases}. **Cleanup:** ${options.closeout.cleanup}.`,
      ...(options.closeout.residue ? [`**Residue / owner:** ${options.closeout.residue}`] : [])
    ] : ['Checkpoint only; continue the canonical dispatcher loop.'])
  ]
  return lines.join('\n') + '\n'
}
