import { execFileSync } from 'node:child_process'
import { spawnSync } from 'node:child_process'
import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, writeFileSync, renameSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { GitConnectorClaimStore, readGitClaimSnapshot, connectorMailbox, gitBlobSha, type ClaimGitSnapshot, type ConnectorWriteRequest } from './git-connector-claim-store.js'
import { acquireClaimFromStore, ClaimConflictError, ClaimStoreUnavailableError } from './claim-store.js'
import { createClaimRecord, serializeClaimRecord } from './claims.js'
import type { ControlNode } from './types.js'
const node:ControlNode={id:'PCO-TEST',owners:['PCO'],title:'test',lifecycle:'planned',dependencies:[],closeoutEvidence:[]}
const at=new Date('2026-10-29T12:00:00Z')
const record=createClaimRecord({node:node.id,generation:1,leaseId:'test-lease',holder:{kind:'chatgpt'},now:at})
const file=(content:string)=>({path:'.pco/claims/PCO-TEST.json',content,sha:gitBlobSha(content)})
test('same-node connector CAS race has one winner through the unchanged canonical acquire protocol',async()=>{
 let files:ClaimGitSnapshot['files']=[]
 const requests:ConnectorWriteRequest[]=[]
 const store=new GitConnectorClaimStore('o/r',async()=>({files,observedAt:at}),async request=>{
  requests.push(request)
  const current=files.find(f=>f.path===request.path)
  if(current?.sha!==request.expectedSha)return {schemaVersion:1,requestId:request.requestId,outcome:'conflict'}
  files=[file(request.content)]
  return {schemaVersion:1,requestId:request.requestId,outcome:'written',contentSha:files[0].sha}
 })
 const results=await Promise.allSettled([1,2].map(i=>acquireClaimFromStore(store,node.id,[node],{holder:{kind:'chatgpt',label:String(i)}})))
 assert.equal(results.filter(r=>r.status==='fulfilled').length,1)
 assert.equal(results.filter(r=>r.status==='rejected').length,1)
 assert.ok(requests.every(r=>r.branch==='runtime/claims'&&r.operation==='create'&&!r.expectedSha))
})
test('reads never infer freedom from malformed records, mismatched hashes or duplicate files',async()=>{
 for(const files of [[file('{bad')],[{...file(serializeClaimRecord(record)),sha:'a'.repeat(40)}],[file(serializeClaimRecord(record)),file(serializeClaimRecord(record))]]){
  const store=new GitConnectorClaimStore('o/r',async()=>({files,observedAt:at}))
  await assert.rejects(()=>store.list())
 }
})
test('wrong request reply, unverified success and explicit conflict do not acquire a lease',async()=>{
 const snap=async()=>({files:[],observedAt:at})
 const mismatch=new GitConnectorClaimStore('o/r',snap,async r=>({schemaVersion:1,requestId:'wrong',outcome:'written',contentSha:gitBlobSha(r.content)}))
 await assert.rejects(()=>mismatch.create(node.id,record),/Mismatched/)
 const notStored=new GitConnectorClaimStore('o/r',snap,async r=>({schemaVersion:1,requestId:r.requestId,outcome:'written',contentSha:gitBlobSha(r.content)}))
 await assert.rejects(()=>notStored.create(node.id,record),/not verified/)
 const conflict=new GitConnectorClaimStore('o/r',snap,async r=>({schemaVersion:1,requestId:r.requestId,outcome:'conflict'}))
 await assert.rejects(()=>conflict.update(node.id,'a'.repeat(40),record),ClaimConflictError)
 const noTransport=new GitConnectorClaimStore('o/r',snap)
 await assert.rejects(()=>noTransport.create(node.id,record),ClaimStoreUnavailableError)
})
test('update carries exact expected blob SHA and verifies fresh stored content',async()=>{
 let files=[file(serializeClaimRecord(record))]
 const before=files[0].sha
 const next={...record,heartbeatAt:'2026-10-29T12:01:00.000Z'}
 const store=new GitConnectorClaimStore('o/r',async()=>({files,observedAt:at}),async r=>{
  assert.equal(r.operation,'update');assert.equal(r.expectedSha,before)
  files=[file(r.content)]
  return {schemaVersion:1,requestId:r.requestId,outcome:'written',contentSha:files[0].sha}
 })
 assert.equal((await store.update(node.id,before,next)).stored.record.heartbeatAt,next.heartbeatAt)
})
test('mailbox is bounded, atomic, outside the repository and needs no token',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'aco-bridge-'))
 try{
  const request:ConnectorWriteRequest={schemaVersion:1,requestId:'request',repository:'o/r',branch:'runtime/claims',operation:'create',path:'.pco/claims/PCO-TEST.json',content:serializeClaimRecord(record),message:'test'}
  const exchange=connectorMailbox(process.cwd(),dir,1000)
  const pending=exchange(request)
  const written=JSON.parse(readFileSync(join(dir,'request.request.json'),'utf8'))
  assert.equal(written.content,request.content)
  const response={schemaVersion:1,requestId:'request',outcome:'conflict'}
  writeFileSync(join(dir,'reply.tmp'),JSON.stringify(response));renameSync(join(dir,'reply.tmp'),join(dir,'request.response.json'))
  assert.deepEqual(await pending,response)
  const timeout=connectorMailbox(process.cwd(),dir,5)
  await assert.rejects(()=>timeout({...request,requestId:'timeout'}),/remote outcome unknown/)
  assert.ok(readdirSync(dir).includes('timeout.request.json'))
  assert.throws(()=>connectorMailbox(process.cwd(),process.cwd()),/outside/)
  await delay(1)
 }finally{rmSync(dir,{recursive:true,force:true})}
})

test('directories beginning with two dots are still inside the repository',()=>{
 const inside=mkdtempSync(join(process.cwd(),'..aco-boundary-'))
 try{
  assert.throws(()=>connectorMailbox(process.cwd(),inside),/outside/)
  const child=spawnSync(process.execPath,['--import','tsx','scripts/swarm-run.ts','start','--run',join(inside,'run.json')],{cwd:process.cwd(),encoding:'utf8'})
  assert.notEqual(child.status,0)
  assert.match(child.stderr,/outside the repository/)
 }finally{rmSync(inside,{recursive:true,force:true})}
})


test('fresh claim fetch leaves an unrelated FETCH_HEAD untouched and reads only the claim branch',()=>{
 const dir=mkdtempSync(join(tmpdir(),'aco-ref-isolation-'))
 const seed=join(dir,'seed'), origin=join(dir,'origin.git'), checkout=join(dir,'checkout')
 const git=(cwd:string,args:string[])=>execFileSync('git',args,{cwd,encoding:'utf8',timeout:30000,stdio:['ignore','pipe','pipe']}).trim()
 try{
  git(dir,['init','--initial-branch=main',seed])
  git(seed,['config','user.name','Fixture']);git(seed,['config','user.email','fixture@example.invalid'])
  writeFileSync(join(seed,'main-marker'),'main source only')
  git(seed,['add','.']);git(seed,['commit','-m','main source'])
  git(seed,['checkout','--orphan','runtime/claims']);git(seed,['rm','-rf','.'])
  mkdirSync(join(seed,'.pco/claims'),{recursive:true})
  writeFileSync(join(seed,'.pco/claims/PCO-TEST.json'),serializeClaimRecord(record))
  git(seed,['add','.']);git(seed,['commit','-m','claim record'])
  git(dir,['init','--bare',origin]);git(seed,['remote','add','origin',origin]);git(seed,['push','origin','main','runtime/claims'])
  git(dir,['clone','--branch','main',origin,checkout])
  git(checkout,['fetch','origin','main'])
  const mainFetch=git(checkout,['rev-parse','FETCH_HEAD'])
  const snapshot=readGitClaimSnapshot(checkout)
  assert.equal(snapshot.files.length,1)
  assert.equal(snapshot.files[0].content,serializeClaimRecord(record))
  assert.equal(git(checkout,['rev-parse','FETCH_HEAD']),mainFetch,'claim reads must not consume or overwrite shared FETCH_HEAD')
 }finally{rmSync(dir,{recursive:true,force:true})}
})
