import { runGit } from '../project/control/git-command.js'
import { existsSync, readFileSync, renameSync, writeFileSync, realpathSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { controlNodes } from '../project/control/nodes/index.js'
import { canonicalNodeId } from '../project/control/claims.js'
import { parseSwarmRun, progressSnapshot, renderRunReport, type RunCloseout, type SwarmRun } from '../project/control/run-report.js'

const git = (args: string[]) => runGit(args).trim()
function flags(args: string[]) {
  const result = new Map<string,string>()
  for (let i=0;i<args.length;i+=2) {
    if (!args[i].startsWith('--') || !args[i+1] || args[i+1].startsWith('--')) throw new Error(`Expected --name value near ${args[i]}`)
    if (result.has(args[i].slice(2))) throw new Error(`Duplicate ${args[i]}`)
    result.set(args[i].slice(2),args[i+1])
  }
  return result
}
function required(f: Map<string,string>, name:string) {
  const v=f.get(name)?.trim(); if(!v)throw new Error(`--${name} is required`);return v
}
function currentSnapshot() {
  git(['fetch','origin','main','--quiet'])
  const ref=git(['rev-parse','HEAD']), main=git(['rev-parse','origin/main'])
  if(ref!==main)throw new Error('Capture from a current main checkout; reports must not count unmerged branch lifecycle changes')
  const paths=['project/control/nodes','project/control/types.ts','project/control/derive.ts','project/control/workstreams.ts']
  if(git(['diff','HEAD','--name-only','--',...paths]))throw new Error('Capture requires clean authoritative graph sources')
  return progressSnapshot(controlNodes,ref)
}
function externalPath(value:string) {
  const path=resolve(value), root=realpathSync(git(['rev-parse','--show-toplevel']))
  const parent=realpathSync(dirname(path)), rel=relative(root,parent)
  if(!(rel==='..'||rel.startsWith('..'+sep)||isAbsolute(rel)))throw new Error('Run journals belong outside the repository (they are not another durable control plane)')
  return path
}
function save(path:string,run:SwarmRun) {
  parseSwarmRun(JSON.stringify(run))
  writeFileSync(path+'.tmp',JSON.stringify(run,null,2)+'\n',{mode:0o600})
  renameSync(path+'.tmp',path)
}
function liveSummary(f:Map<string,string>, at:string) {
  const path=f.get('dispatch-json')
  if(!path)return undefined
  const s=JSON.parse(readFileSync(path,'utf8'))
  const age=Date.parse(at)-Date.parse(s.observedAt)
  if(!Number.isFinite(age)||age<0||age>5*60*1000||typeof s.safeForAutomaticClaim!=='boolean'||!Number.isInteger(s.totalCandidates)||s.totalCandidates<0||!Array.isArray(s.candidates)||!Array.isArray(s.claimed)||!Array.isArray(s.manualReady)||!Array.isArray(s.activeUnclaimed))throw new Error('Need a fresh canonical control:next JSON snapshot (at most five minutes old)')
  if(f.get('stop-reason')==='frontier-empty'&&(!s.safeForAutomaticClaim||s.totalCandidates!==0))throw new Error('Cannot report an empty frontier when dispatch is unsafe or candidates remain')
  return `${s.safeForAutomaticClaim?'safe':'UNSAFE'} at ${s.observedAt}; ${s.totalCandidates} ${s.safeForAutomaticClaim?'available':'structurally eligible, not claimable while unsafe'} self-service candidate(s), ${s.claimed.length} claimed, ${s.manualReady.length} manual-ready, ${s.activeUnclaimed.length} active-unclaimed. Next: ${s.candidates.map((n:{node:string})=>n.node).join(', ')||'none'}.`
}
function main() {
  const [command,...args]=process.argv.slice(2), f=flags(args)
  const path=externalPath(required(f,'run'))
  if(command==='start') {
    if(existsSync(path))throw new Error('Run file already exists; resume it or choose a new path')
    const mode=f.get('mode')??'swarm'
    if(!['swarm','directed'].includes(mode))throw new Error('--mode must be swarm or directed')
    const baseline=currentSnapshot()
    save(path,{schemaVersion:1,mode:mode as SwarmRun['mode'],startedAt:baseline.observedAt,baseline,merges:[]})
    console.log(`Started ${mode} run ${path} at ${baseline.observedAt}`)
    return
  }
  const run=parseSwarmRun(readFileSync(path,'utf8')), current=currentSnapshot()
  runGit(['merge-base','--is-ancestor',run.baseline.ref,current.ref])
  if(command==='record') {
    const node=canonicalNodeId(required(f,'node'),controlNodes), pr=required(f,'pr'), merge=required(f,'merge')
    if(!/^[a-f0-9]{40}$/.test(merge))throw new Error('Use the full merge SHA')
    if(run.merges.some(m=>m.node===node))throw new Error('Packet already recorded in this run')
    if(run.baseline.nodes.find(n=>n.id===node)?.lifecycle==='complete')throw new Error('Packet was already complete at run start; do not claim it as new session output')
    if(current.nodes.find(n=>n.id===node)?.lifecycle!=='complete')throw new Error('Packet is not complete on current main')
    runGit(['merge-base','--is-ancestor',merge,current.ref])
    let predatesBaseline=false
    try { runGit(['merge-base','--is-ancestor',merge,run.baseline.ref]); predatesBaseline=true } catch { /* newer merge */ }
    if(predatesBaseline)throw new Error('Merge predates the run baseline; do not attribute historical work to this session')
    // The agent must also verify the PR's merged state and node ownership before recording.
    run.merges.push({node,pr,merge});save(path,run);console.log(`Recorded ${node}`)
    return
  }
  if(command!=='report')throw new Error('Use start, record or report')
  const closeout=f.has('stop-reason')?{
    reason:required(f,'stop-reason'),detail:required(f,'detail'),validation:required(f,'validation'),
    leases:required(f,'leases'),cleanup:required(f,'cleanup'),residue:f.get('residue')
  } as RunCloseout:undefined
  if(closeout?.reason==='frontier-empty'&&!f.has('dispatch-json'))throw new Error('Empty frontier requires fresh --dispatch-json evidence')
  const live=liveSummary(f,current.observedAt)
  const markdown=renderRunReport(run,current,{closeout,allWorkstreams:f.get('all')==='true',liveSummary:live})
  if(f.get('output'))writeFileSync(externalPath(f.get('output')!),markdown)
  console.log(markdown)
}
try{main()}catch(e){console.error(e instanceof Error?e.message:String(e));process.exitCode=1}
