import {execFileSync} from 'node:child_process'
import {appendFileSync,readFileSync,writeFileSync} from 'node:fs'
import {GitConnectorClaimStore,readGitClaimSnapshot} from '../project/control/git-connector-claim-store.js'
import {GitHubClaimStore} from '../project/control/github-claim-store.js'
import {controlNodes} from '../project/control/nodes/index.js'
import {operationsBrief,reconcileCompletedClaims,validatePacketDeclaration,type PullRequestObservation} from '../project/control/operations.js'
import {leaseTemporalState} from '../project/control/claims.js'
const git=(args:string[])=>execFileSync('git',args,{encoding:'utf8',timeout:30000,stdio:['ignore','pipe','pipe']}).trim()
const root=git(['rev-parse','--show-toplevel'])
const repository=process.env.GITHUB_REPOSITORY??git(['remote','get-url','origin']).replace(/^https:\/\/github.com\//,'').replace(/\.git$/,'')
if(!/^[\w.-]+\/[\w.-]+$/.test(repository))throw new Error('Set GITHUB_REPOSITORY=owner/repo')
const token=process.env.GH_TOKEN??process.env.GITHUB_TOKEN
async function api(path:string):Promise<any>{
 const r=await fetch(`https://api.github.com/repos/${repository}/${path}`,{headers:{Accept:'application/vnd.github+json',...(token?{Authorization:`Bearer ${token}`}:{})},signal:AbortSignal.timeout(20000)})
 if(!r.ok)throw new Error(`GitHub ${r.status} reading ${path}`)
 return r.json()
}
function pr(value:any):PullRequestObservation {
 return {number:value.number,title:value.title,url:value.html_url,branch:value.head.ref,head:value.head.sha,base:value.base.ref,repository:value.base.repo.full_name,merged:Boolean(value.merged_at),body:value.body??''}
}
async function main(){
 const command=process.argv[2]??'brief'
 const readStore=new GitConnectorClaimStore(repository,async()=>readGitClaimSnapshot(root))
 if(command==='packet-check'){
  const event=JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH??'', 'utf8'))
  if(!event.pull_request)throw new Error('packet-check requires a pull_request event')
  const p=pr(event.pull_request),listed=await readStore.list()
  const ids=validatePacketDeclaration(p.body,controlNodes,listed.claims.map(c=>c.record),p.branch,p.number)
  for(const id of ids){const c=listed.claims.find(c=>c.record.node===id)!;if(leaseTemporalState(c.record,listed.observedAt)!=='live')throw new Error(`${id}: live lease required at CI observation`)}
  if(!ids.length&&git(['diff','--name-only',`${event.pull_request.base.sha}...${event.pull_request.head.sha}`,'--','project/control/nodes']))throw new Error('Work: none cannot change canonical packet lifecycle sources')
  console.log(`Packet contract valid: ${ids.join(', ')||'explicit non-packet exemption'}. Observation only; repeat publication preflight before merge.`)
  return
 }
 git(['fetch','origin','main','--quiet'])
 if(git(['rev-parse','HEAD'])!==git(['rev-parse','origin/main'])||git(['status','--porcelain','--untracked-files=no']))throw new Error('Operations require clean current main sources; do not publish a feature branch as programme state')
 if(command==='reconcile'){
  if(!token)throw new Error('Reconciliation requires configured GitHub mutation credentials')
  const authority=git(['rev-parse','HEAD'])
  const result=await reconcileCompletedClaims(controlNodes,new GitHubClaimStore(repository,token),repository,async n=>pr(await api(`pulls/${n}`)),async()=>{
    git(['fetch','origin','main','--quiet'])
    if(git(['rev-parse','origin/main'])!==authority)throw new Error('Main changed during reconciliation; retaining lease until a current-main retry')
  })
  const report=['# Post-merge lease reconciliation','',...result.map(r=>`- ${r.node}: ${r.action} — ${r.reason}`),''].join('\n')
  console.log(report)
  if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,report)
  return
 }
 if(command!=='brief')throw new Error('Use brief, packet-check or reconcile')
 let claims=null,at=new Date(),prs:PullRequestObservation[]|null=null
 const warnings:string[]=[]
 if(process.env.RECONCILE_RESULT==='failure')warnings.push('Post-merge reconciliation failed; inspect the reconcile job before assuming cleanup')
 try{const listed=await readStore.list();claims=listed.claims.map(c=>c.record);at=listed.observedAt}catch(e){warnings.push(String(e))}
 try{const values=await api('pulls?state=open&per_page=100');prs=values.map(pr);if(values.length===100)warnings.push('PR list truncated at 100; inspect GitHub for additional PRs')}catch(e){warnings.push(String(e))}
 const report=operationsBrief(controlNodes,claims,at,git(['rev-parse','HEAD']),repository,prs,warnings.join('; ')||undefined)
 const json=process.argv.indexOf('--json'),markdown=process.argv.indexOf('--markdown')
 if(json>=0){if(!process.argv[json+1])throw new Error('--json requires a path');writeFileSync(process.argv[json+1],JSON.stringify(report.snapshot,null,2)+'\n')}
 if(markdown>=0){if(!process.argv[markdown+1])throw new Error('--markdown requires a path');writeFileSync(process.argv[markdown+1],report.markdown)}
 console.log(report.markdown)
 if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,report.markdown)
 if(claims===null)process.exitCode=2
}
main().catch(e=>{console.error(String(e));process.exitCode=1})
