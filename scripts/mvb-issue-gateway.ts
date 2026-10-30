import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { GitHubClaimStore } from '../project/control/github-claim-store.js'

/** GitHub issue comments are a transport, not a scheduler or ownership authority. */
export const MVB_MAILBOX_ISSUE = 1089
export const MAX_REQUEST_AGE_MS = 10 * 60_000
const NODE = /^[A-Z0-9][A-Z0-9-]{0,79}$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type Command =
  | { cmd: 'claim-next' }
  | { cmd: 'renew'; node: string; leaseId: string; generation: number; checkpoint?: {evidence:string;next:string;blocker?:string} }
  | { cmd: 'release'; node: string; leaseId: string; generation: number; reason: 'handoff' | 'abandoned' }

function object(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === 'object' && !Array.isArray(x)
}
function exactKeys(x: Record<string, unknown>, allowed: readonly string[]) {
  if (Object.keys(x).some(key => !allowed.includes(key))) throw new Error('Unexpected command field')
}
function nonempty(x: unknown, limit: number) {
  return typeof x === 'string' && x.trim() === x && x.length > 0 && x.length <= limit && !/[\r\n]/.test(x)
}
export function parseGatewayCommand(raw: string): Command {
  if (raw.length > 1000 || !raw.startsWith('MVB/1 ')) throw new Error('Expected MVB/1 command envelope')
  let value: unknown
  try { value = JSON.parse(raw.slice(6)) } catch { throw new Error('Invalid command JSON') }
  if (!object(value)) throw new Error('Expected command object')
  if (value.cmd === 'claim-next') {
    exactKeys(value, ['cmd'])
    return {cmd:'claim-next'}
  }
  if (value.cmd === 'renew' || value.cmd === 'release') {
    exactKeys(value, value.cmd === 'renew'
      ? ['cmd','node','leaseId','generation','checkpoint']
      : ['cmd','node','leaseId','generation','reason'])
    if (typeof value.node !== 'string' || !NODE.test(value.node) ||
        typeof value.leaseId !== 'string' || !UUID.test(value.leaseId) ||
        !Number.isSafeInteger(value.generation) || Number(value.generation) < 1)
      throw new Error('Invalid canonical lease identity')
    if (value.cmd === 'release') {
      if (value.reason !== 'handoff' && value.reason !== 'abandoned') throw new Error('Release requires handoff or abandoned')
      return {cmd:'release',node:value.node,leaseId:value.leaseId,generation:Number(value.generation),reason:value.reason}
    }
    let checkpoint: {evidence:string;next:string;blocker?:string} | undefined
    if (value.checkpoint !== undefined) {
      if (!object(value.checkpoint)) throw new Error('Invalid checkpoint')
      exactKeys(value.checkpoint,['evidence','next','blocker'])
      if (!nonempty(value.checkpoint.evidence,300) || !nonempty(value.checkpoint.next,200) ||
          (value.checkpoint.blocker !== undefined && !nonempty(value.checkpoint.blocker,200)))
        throw new Error('Checkpoint requires bounded evidence and next action')
      checkpoint = {evidence:value.checkpoint.evidence as string,next:value.checkpoint.next as string,
        ...(value.checkpoint.blocker ? {blocker:value.checkpoint.blocker as string} : {})}
    }
    return {cmd:'renew',node:value.node,leaseId:value.leaseId,generation:Number(value.generation),
      ...(checkpoint ? {checkpoint} : {})}
  }
  throw new Error('Unsupported gateway command')
}

export function assertGatewayEvent(event: any, repository: string, now: Date): { id: number; createdAt: Date; command: Command } {
  if (event.action !== 'created' || event.repository?.full_name !== repository ||
      event.repository?.default_branch !== 'main' ||
      event.issue?.number !== MVB_MAILBOX_ISSUE || event.issue?.pull_request ||
      event.issue?.locked !== true ||
      !Number.isSafeInteger(event.comment?.id) ||
      !Number.isSafeInteger(event.sender?.id) ||
      event.sender.id !== event.repository?.owner?.id ||
      event.comment?.user?.id !== event.sender.id)
    throw new Error('Unauthorised or incorrectly scoped issue event')
  const createdAt = new Date(event.comment.created_at)
  if (!Number.isFinite(createdAt.getTime()) || Math.abs(now.getTime() - createdAt.getTime()) > MAX_REQUEST_AGE_MS)
    throw new Error('Stale or clock-uncertain request; post a new comment after inspection')
  if (typeof event.comment.body !== 'string') throw new Error('Missing request body')
  return {id:event.comment.id,createdAt,command:parseGatewayCommand(event.comment.body.trim())}
}

function runCanonical(args: string[]): any {
  // No user-controlled shell; exact arguments to canonical main-source CLI.
  const output = execFileSync(process.execPath,['--import','tsx','scripts/project-claims.ts',...args],
    {encoding:'utf8',timeout:90_000,maxBuffer:512_000,stdio:['ignore','pipe','pipe']})
  return JSON.parse(output)
}

async function main() {
  const repository = process.env.GITHUB_REPOSITORY ?? ''
  const token = process.env.GITHUB_TOKEN ?? ''
  if (!/^adamnoden\/architecture$/.test(repository) || !token) throw new Error('Gateway repository/token unavailable')
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH ?? '', 'utf8'))
  const req = assertGatewayEvent(event,repository,new Date())
  const prefix = `MVB/1 RESULT ${req.id}\n`
  const url = `https://api.github.com/repos/${repository}/issues/${MVB_MAILBOX_ISSUE}/comments`
  async function api(method: 'GET'|'POST', body?:unknown, page?:number):Promise<any> {
    const response=await fetch(url+(page?`?per_page=100&page=${page}`:''),{
      method,headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json',
        'X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},
      ...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(20_000)})
    if(!response.ok)throw new Error(`GitHub comment API ${response.status}`)
    return response.json()
  }
  // Retries of an already-answered request are observations, never fresh effects.
  for(let page=1;page<=20;page++){
    const comments=await api('GET',undefined,page)
    if(!Array.isArray(comments))throw new Error('Invalid response listing')
    if(comments.some(c=>typeof c.body==='string'&&c.body.startsWith(prefix)&&c.user?.type==='Bot')){
      console.log(`Request ${req.id} already answered; no mutation`)
      return
    }
    if(comments.length<100)break
    if(page===20)throw new Error('Mailbox history exceeds bounded audit window; fail closed')
  }
  const store=new GitHubClaimStore(repository,token)
  const listed=await store.list()
  const current=listed.claims.map(c=>c.record)
  let result: unknown
  try{
    if(req.command.cmd==='claim-next'){
      const branch=`work/mvb-chat-${req.id}`,label=`issue-comment-${req.id}`
      // Reconcile an earlier successful claim whose reply was lost.
      const existing=current.find(c=>c.holder.label===label&&c.branch===branch)
      if(existing){
        result={reconciled:true,claim:{node:existing.node,generation:existing.generation,
          leaseId:existing.leaseId,state:existing.state,branch:existing.branch,
          expiresAt:existing.expiresAt,checkpoint:existing.checkpoint??null}}
      } else {
        result=runCanonical(['claim-next','--holder-kind','chatgpt','--holder-label',label,
          '--branch',branch,'--format','json'])
      }
    } else {
      const c=current.find(c=>c.node===('node' in req.command ? req.command.node : ''))
      if(!c || c.leaseId!==req.command.leaseId || c.generation!==req.command.generation)
        throw new Error('Missing or superseded lease; no mutation')
      if(req.command.cmd==='release'&&c.state==='released'){
        result={reconciled:true,node:c.node,state:c.state,generation:c.generation}
      } else if(req.command.cmd==='renew'&&c.state==='claimed'&&
          Date.parse(c.heartbeatAt)>=req.createdAt.getTime() &&
          (!req.command.checkpoint || JSON.stringify(c.checkpoint)===JSON.stringify(req.command.checkpoint))){
        result={reconciled:true,node:c.node,state:c.state,generation:c.generation,expiresAt:c.expiresAt}
      } else {
        const args=[req.command.cmd,req.command.node,'--lease-id',req.command.leaseId,
          '--generation',String(req.command.generation)]
        if(req.command.cmd==='release'){
          args.push('--reason',req.command.reason)
        } else if(req.command.checkpoint){
          args.push('--checkpoint-evidence',req.command.checkpoint.evidence,
            '--checkpoint-next',req.command.checkpoint.next)
          if(req.command.checkpoint.blocker)args.push('--checkpoint-blocker',req.command.checkpoint.blocker)
        }
        result=runCanonical(args)
      }
    }
  }catch(error){
    result={error:String(error),outcome:'unknown-or-refused',instruction:'Inspect live claims before posting another request'}
  }
  const body=prefix+'\`\`\`json\n'+JSON.stringify(result,null,2).slice(0,5500)+'\n\`\`\`\n' +
    'Observed response, not permission to merge. Verify current lease and validated head before publication.'
  await api('POST',{body})
  console.log(`Responded to request ${req.id}`)
}
if(process.env.GITHUB_EVENT_PATH)main().catch(error=>{console.error(String(error));process.exitCode=1})
