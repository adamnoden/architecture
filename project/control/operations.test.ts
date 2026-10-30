import assert from 'node:assert/strict'
import test from 'node:test'
import {assertBriefSource,declaredWork,operationsBrief,reconcileCompletedClaims,validatePacketDeclaration,type PullRequestObservation} from './operations.js'
import {createClaimRecord,type ClaimRecord} from './claims.js'
import type {ClaimStore,StoredClaim} from './claim-store.js'
import type {ControlNode} from './types.js'
const at=new Date('2026-10-29T12:00:00Z')
const node:ControlNode={id:'PCO-TEST',owners:['PCO'],title:'fixture',lifecycle:'planned',dependencies:[],agentDispatch:{mode:'self-service'},closeoutEvidence:[]}
const claim=()=>createClaimRecord({node:node.id,leaseId:'uuid',generation:1,holder:{kind:'chatgpt'},now:at,branch:'work/test',pr:123})
const body='Work: PCO-TEST\nLease: PCO-TEST / uuid / generation 1'
const pr:PullRequestObservation={number:123,title:'test',url:'https://github.com/o/r/pull/123',branch:'work/test',head:'a'.repeat(40),base:'main',repository:'o/r',merged:true,body}
function store(){let stored:StoredClaim={record:claim(),sha:'before'};let writes=0;return {get writes(){return writes},get record(){return stored.record},async read(){return {stored,observedAt:at}},async list(){return {claims:[stored],observedAt:at}},async create(){throw Error('unexpected')},async update(_node:string,sha:string,record:ClaimRecord){assert.equal(sha,stored.sha);writes++;stored={record,sha:'after'};return {stored,observedAt:at}}} satisfies (ClaimStore & {readonly writes:number;readonly record:ClaimRecord})}
test('packet contract rejects omissions, ambiguous work and stale lease identity',()=>{
 assert.deepEqual(validatePacketDeclaration(body,[node],[claim()],'work/test',123),[node.id])
 for(const b of ['', 'Work: none', 'Work: PCO-TEST\nWork: PCO-OTHER',body.replace('uuid','ghost'),body.replace('generation 1','generation 2')])assert.throws(()=>validatePacketDeclaration(b,[node],[claim()],'work/test',123))
 assert.throws(()=>validatePacketDeclaration(body,[node],[claim()],'other',123))
 assert.deepEqual(declaredWork('Work: none\nWork reason: fixing prose only'),[])
})
test('unknown claims never become an empty available frontier',()=>{
 const r=operationsBrief([node],null,at,'a'.repeat(40),'o/r',null,'Network unavailable')
 assert.equal(r.snapshot.available,null)
 assert.equal(r.snapshot.safeForAutomaticClaim,null)
 assert.match(r.markdown,/unknown — claims unavailable/)
})
test('briefing preserves ranking, stale heartbeat uncertainty and recovery evidence',()=>{
 const c={...claim(),checkpoint:{evidence:'PR #123',next:'Inspect evidence'}}
 const r=operationsBrief([node],[c],new Date(at.getTime()+16*60000),'a'.repeat(40),'o/r',[pr])
 assert.equal(r.snapshot.occupied?.[0].health.responsiveness,'unknown')
 assert.equal(r.snapshot.occupied?.[0].checkpoint?.next,'Inspect evidence')
 assert.equal(r.snapshot.prs?.[0].head,pr.head)
})
test('post-merge reconciler releases only terminal, merged, matching provenance',async()=>{
 const s=store(),terminal={...node,lifecycle:'complete' as const}
 const result=await reconcileCompletedClaims([terminal],s,'o/r',async()=>pr)
 assert.equal(result[0].action,'released');assert.equal(s.writes,1);assert.equal(s.record.state,'released')
 for(const altered of [{...pr,merged:false},{...pr,branch:'other'},{...pr,base:'other'},{...pr,repository:'evil/r'},{...pr,body:'Work: OTHER'}]){const x=store();await reconcileCompletedClaims([terminal],x,'o/r',async()=>altered);assert.equal(x.writes,0)}
 const active=store();await reconcileCompletedClaims([node],active,'o/r',async()=>pr);assert.equal(active.writes,0)
})
test('reassignment while checking PR provenance cannot release the replacement lease',async()=>{
 const s=store(),terminal={...node,lifecycle:'complete' as const}
 const result=await reconcileCompletedClaims([terminal],s,'o/r',async()=>{await s.update(node.id,'before',{...claim(),generation:2,leaseId:'replacement'});return pr})
 assert.equal(result[0].action,'retained');assert.equal(s.record.leaseId,'replacement');assert.equal(s.writes,1)
})


test('main movement before release retains the lease and reports why',async()=>{
 const s=store()
 const result=await reconcileCompletedClaims([{...node,lifecycle:'complete'}],s,'o/r',async()=>pr,async()=>{throw Error('main moved')})
 assert.equal(s.writes,0);assert.equal(result[0].action,'retained');assert.match(result[0].reason,/main moved/)
})


test('runtime push entry point has read-only authority and delegates implementation to main',async()=>{
 const {readFileSync}=await import('node:fs')
 const shim=readFileSync('project/control/runtime-operations-workflow.yml','utf8')
 assert.match(shim,/branches: \[runtime\/claims\]/)
 assert.match(shim,/uses: adamnoden\/architecture\/.github\/workflows\/operations-report.yml@main/)
 assert.doesNotMatch(shim,/contents: write|run:|secrets:/)
 const shared=readFileSync('.github/workflows/operations-report.yml','utf8')
 assert.match(shared,/ref: main/)
 assert.doesNotMatch(shared,/contents: write/)
})


test('briefing tolerates only generated main advances and records both source and observed revisions',()=>{
 assert.doesNotThrow(()=>assertBriefSource(true,false,['STATUS.md','project/control/graph.md']))
 assert.throws(()=>assertBriefSource(false,false,[]))
 assert.throws(()=>assertBriefSource(true,true,[]))
 assert.throws(()=>assertBriefSource(true,false,['project/control/nodes/pco.ts']))
 assert.throws(()=>assertBriefSource(true,false,['scripts/control-operations.ts']))
 const r=operationsBrief([node],[],at,'a'.repeat(40),'o/r',[],undefined,'b'.repeat(40))
 assert.equal(r.snapshot.main,'a'.repeat(40));assert.equal(r.snapshot.currentMain,'b'.repeat(40))
 assert.match(r.markdown,/only generated projection files differ/)
})

test('crash recovery briefing separates surviving PR evidence from actual integration',()=>{
 const earlier=createClaimRecord({node:node.id,leaseId:'old',generation:1,
   holder:{kind:'chatgpt'},now:new Date('2026-10-29T09:00:00Z'),
   branch:'work/preserved',pr:123,
   checkpoint:{evidence:'PR #123 old head',next:'Reconcile and validate'}})
 const open={...pr,merged:false}
 const r=operationsBrief([node],[earlier],at,'a'.repeat(40),'o/r',[open])
 assert.equal(r.snapshot.recovery.claimable?.[0].node,node.id)
 assert.equal(r.snapshot.recovery.claimable?.[0].previousGeneration,1)
 assert.equal(r.snapshot.recovery.preservedUnmergedPRs?.[0].number,123)
 assert.match(r.markdown,/Preserved unmerged/)
 assert.match(r.markdown,/not shipped/)
})

test('unknown lease availability stays unknown even when surviving PR is observable',()=>{
 const r=operationsBrief([node],null,at,'a'.repeat(40),'o/r',[{...pr,merged:false}])
 assert.equal(r.snapshot.recovery.claimable,null)
 assert.equal(r.snapshot.recovery.preservedUnmergedPRs?.length,1)
 assert.match(r.markdown,/Recoverable claim availability unknown/)
})
