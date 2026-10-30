import { buildDispatchSnapshot } from './dispatch.js'
import { nodesByDerivedState } from './derive.js'
import { leaseHealth } from './lease-health.js'
import { releaseClaimInStore, type ClaimStore } from './claim-store.js'
import type { ClaimRecord } from './claims.js'
import type { ControlNode } from './types.js'

export interface PullRequestObservation {
  number: number; title: string; url: string; branch: string; head: string
  base: string; repository: string; merged: boolean; body: string
}
export function declaredWork(body: string): string[] {
  const lines = body.split('\n').filter(line => /^Work:/i.test(line))
  if (lines.length !== 1) throw new Error('PR requires exactly one Work: declaration')
  const value = lines[0].slice(5).trim()
  if (value === 'none') {
    if (!/^Work reason:\s*\S.+$/mi.test(body)) throw new Error('Work: none requires Work reason: explaining the exemption')
    return []
  }
  const ids = value.split(',').map(id => id.trim())
  if (!ids.length || ids.some(id => !/^[A-Z0-9][A-Z0-9-]*$/.test(id)) || new Set(ids).size !== ids.length) throw new Error('Work: must contain canonical packet IDs separated by commas')
  return ids
}
export function validatePacketDeclaration(body: string, nodes: readonly ControlNode[], claims: readonly ClaimRecord[], branch: string, pr: number) {
  const ids = declaredWork(body)
  for (const id of ids) {
    if (!nodes.some(node => node.id === id)) throw new Error(`Unknown canonical packet ${id}`)
    const lease = claims.find(claim => claim.node === id)
    if (!lease || lease.branch !== branch || (lease.pr !== undefined && lease.pr !== pr)) throw new Error(`${id}: PR branch/number is not bound to the current lease`)
    // A CI observation is not publication permission; final preflight still checks time and identity.
    const identity = [...body.matchAll(/^Lease:\s*([A-Z0-9-]+)\s*\/\s*(\S+)\s*\/\s*generation\s+(\d+)\s*$/gmi)].filter(m=>m[1]===id)
    if (identity.length !== 1 || identity[0][2] !== lease.leaseId || Number(identity[0][3]) !== lease.generation) throw new Error(`${id}: missing or superseded Lease: identity/generation`)
    if (lease.state !== 'claimed') throw new Error(`${id}: lease has been released`)
  }
  return ids
}
export async function reconcileCompletedClaims(nodes: readonly ControlNode[], store: ClaimStore, repository: string, getPR: (number: number) => Promise<PullRequestObservation>, beforeRelease: () => Promise<void> = async () => {}) {
  const {claims} = await store.list()
  const results: {node:string; action:'released'|'retained'; reason:string}[] = []
  for (const {record} of claims) {
    if (record.state !== 'claimed') continue
    const node = nodes.find(n => n.id === record.node)
    if (!node || !['complete','cancelled'].includes(node.lifecycle)) continue
    if (!record.pr || !record.branch) { results.push({node:record.node,action:'retained',reason:'Terminal node lacks PR/branch provenance; inspect manually'}); continue }
    try {
      const pr = await getPR(record.pr)
      if (!pr.merged || pr.repository !== repository || pr.base !== 'main' || pr.branch !== record.branch || !declaredWork(pr.body).includes(node.id)) {
        results.push({node:node.id,action:'retained',reason:'No matching merged main PR and packet declaration'}); continue
      }
      await beforeRelease()
      await releaseClaimInStore(store,node.id,nodes,{leaseId:record.leaseId,generation:record.generation,reason:node.lifecycle==='complete'?'completed':'abandoned'})
      results.push({node:node.id,action:'released',reason:`Merged PR #${pr.number}; terminal canonical node; exact lease CAS`})
    } catch (error) { results.push({node:node.id,action:'retained',reason:String(error)}) }
  }
  return results
}
const cell = (value: string) => value.replace(/[\r\n]+/g,' ').replace(/\|/g,'\\|').replace(/</g,'&lt;')
/** Read-only snapshots may span projection-only main advances, never source changes or feature branches. */
export function assertBriefSource(ancestor:boolean,dirty:boolean,changes:readonly string[]) {
  const tolerated=new Set(['STATUS.md','project/workstream-codes.md','project/control/graph.md','docs/project/dependency-graph.md','docs/project/graph-source.ts'])
  if(!ancestor||dirty||changes.some(path=>!tolerated.has(path)))throw new Error('Briefing requires clean canonical main sources; only generated projection advances are tolerated')
}
export function operationsBrief(nodes: readonly ControlNode[], claims: readonly ClaimRecord[] | null, at: Date, main: string, repository: string, prs: readonly PullRequestObservation[] | null, warning?: string, currentMain=main) {
  const groups=nodesByDerivedState(nodes)
  const dispatch=claims ? buildDispatchSnapshot(nodes,claims,at) : null
  // Evidence-bound recovery projection. PR existence and prior checkpoints do
  // not establish correctness, readiness to merge or a dead predecessor.
  const recoveryCandidates=dispatch?.safeForAutomaticClaim ? dispatch.candidates
    .filter(candidate=>candidate.previousClaim)
    .map(candidate=>({node:candidate.node.id,previousGeneration:candidate.previousClaim!.generation,
      predecessorBranch:candidate.previousClaim!.branch??null,
      predecessorPR:candidate.previousClaim!.pr??null,
      checkpoint:candidate.previousClaim!.checkpoint??null,
      resumeActive:!!candidate.resumeActive})) : null
  const recoveryReview=dispatch?.activeUnclaimed.map(node=>({node:node.id,
    reason:'Active packet lacks eligible self-service recovery evidence or is manually dispatched',
    previousClaim:claims?.find(c=>c.node===node.id)?.generation??null}))??null
  const preservedPRs=prs?.filter(p=>!p.merged&&safeWork(p.body).some(id=>nodes.some(node=>node.id===id)))
    .map(p=>({number:p.number,url:p.url,head:p.head,work:safeWork(p.body)}))??null
  const snapshot={schemaVersion:1,observedAt:at.toISOString(),main,currentMain,repository,claimsAvailable:claims!==null,prsAvailable:prs!==null,warning:warning??null,
    counts:Object.fromEntries(Object.entries(groups).map(([key,value])=>[key,value.length])),
    safeForAutomaticClaim:dispatch?.safeForAutomaticClaim??null,
    unsafeReasons:dispatch?.unsafeReasons??[],
    available:dispatch?.safeForAutomaticClaim?dispatch.candidates.map(c=>({node:c.node.id,title:c.node.title,depth:c.metrics.criticalDepth,recovery:c.previousClaim?{branch:c.previousClaim.branch,pr:c.previousClaim.pr,checkpoint:c.previousClaim.checkpoint,note:c.previousClaim.note}:null})):null,
    occupied:dispatch?.claimed.map(c=>({node:c.node.id,holder:c.claim.holder.label??c.claim.holder.kind,branch:c.claim.branch,pr:c.claim.pr,health:leaseHealth(c.claim,at),checkpoint:c.claim.checkpoint,note:c.claim.note}))??null,
    manual:dispatch?.manualReady.map(c=>({node:c.node.id,reason:c.reason}))??null,
    activeUnclaimed:dispatch?.activeUnclaimed.map(n=>n.id)??null,
    invalidClaims:dispatch?.invalidLiveClaims.map(c=>({node:c.node,reason:c.reason}))??null,
    prs:prs?prs.map(p=>({number:p.number,title:p.title,url:p.url,branch:p.branch,head:p.head,work:safeWork(p.body)})):null,
    recovery:{claimable:recoveryCandidates,needsReview:recoveryReview,preservedUnmergedPRs:preservedPRs}}
  const md=['# Operations snapshot','',`Observed **${snapshot.observedAt}** · source main revision \`${main}\``, '',
    ...(currentMain!==main?[`Observed main tip: \`${currentMain}\`; only generated projection files differ from the source revision.`, '']:[]),
    'Snapshot only. Read canonical live claims before acquisition or publication. Heartbeat age does not prove responsiveness.', '',
    ...(warning?[`**Observation warning:** ${cell(warning)}`,'']:[]),
    `Structural: ${groups.ready.length} ready · ${groups.blocked.length} blocked · ${groups.active.length} active · ${groups.held.length} held · ${groups.done.length} complete.`, '',
    `Automatic dispatch: **${dispatch?(dispatch.safeForAutomaticClaim?'safe at observation':'UNSAFE'):'unknown — claims unavailable'}**`,
    ...(dispatch?.unsafeReasons.map(r=>`- ${cell(r)}`)??[]),'',
    '## Available in dispatcher order','', '| Packet | Work | Critical depth | Recovery |','|---|---|---|---|',
    ...(snapshot.available?.length?snapshot.available.map(n=>`| ${n.node} | ${cell(n.title)} | ${n.depth} | ${cell(n.recovery?.checkpoint?.next??n.recovery?.branch??'—')} |`):[dispatch?.safeForAutomaticClaim?'| — | None | — | — |':'| — | Availability unknown or unsafe | — | — |']), '',
    '## Occupied','', '| Packet | Holder | Heartbeat age | Remaining | Next checkpoint |','|---|---|---|---|---|',
    ...(snapshot.occupied?.length?snapshot.occupied.map(n=>`| ${n.node} | ${cell(n.holder)} | ${n.health.heartbeatAgeMinutes} min | ${n.health.expiresInMinutes} min | ${cell(n.checkpoint?.next??n.note??'No checkpoint')} |`):[claims?'| — | None | — | — | — |':'| — | Unknown | — | — | — |']), '',
    '## Manual gates','',...(snapshot.manual?.map(n=>`- **${n.node}**: ${cell(n.reason)}`)??['Unknown']), '',
    '## Active without lease','',snapshot.activeUnclaimed?.join(', ')|| (dispatch?'None':'Unknown'), '',
    '## Crash recovery (read-only)','',
    'Claimable predecessor work requires fresh acquisition; old branches and CI are unverified evidence.', '',
    ...(recoveryCandidates===null?['- Recoverable claim availability unknown.']:
      recoveryCandidates.length?recoveryCandidates.map(c=>`- **${c.node}**: previous generation ${c.previousGeneration}; ${c.resumeActive?'guarded active resume':'planned reacquisition'}; ${cell(c.checkpoint?.next??c.predecessorBranch??'checkpoint missing')}`):['- No predecessor claims in current automatic frontier.']),
    ...(recoveryReview?.map(c=>`- **${c.node}**: review required (not automatically claimed).`)??[]),
    ...(preservedPRs===null?['- Unmerged PR observation unavailable.']:
      preservedPRs.map(p=>`- Preserved unmerged [#${p.number}](${p.url}) · ${p.work.join(', ')} · head \`${p.head.slice(0,8)}\` (not shipped)`)), '',
    'A crash cannot prove local-only work, session duration or a worker\'s death. Merge and release are distinct events.','',
    '## Open pull requests','',...(snapshot.prs?.map(p=>`- [#${p.number}](${p.url}) ${cell(p.title)} · ${p.work.join(', ')||'No valid packet declaration'} · \`${p.head.slice(0,8)}\``)??['PR observations unavailable']), '',
    '## Next action','',dispatch?.safeForAutomaticClaim?(dispatch.candidates.length?'Use `npm run control:claim-next` to acquire the current highest-ranked eligible packet; do not reserve it from this snapshot.':'No self-service candidate at observation. Inspect manual gates and active handoffs.'):'Resolve unavailable/invalid coordination state before new collision-prone work.', '',
    'Packet counts are execution coverage, not effort, architectural maturity or construction readiness.',''].join('\n')
  return {snapshot,markdown:md}
}
function safeWork(body:string) { try { return declaredWork(body) } catch { return [] } }
