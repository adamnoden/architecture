import test from 'node:test'
import assert from 'node:assert/strict'
import {MVB_MAILBOX_ISSUE,assertGatewayEvent,assertGatewayPrBinding,parseGatewayCommand} from '../../scripts/mvb-issue-gateway.js'
import {createClaimRecord} from './claims.js'

const id='aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'
const at=new Date('2026-10-30T10:00:00Z')
function event(body:string):any {
  return {
    action:'created',repository:{full_name:'adamnoden/architecture',default_branch:'main',owner:{id:107278274}},
    issue:{number:MVB_MAILBOX_ISSUE,locked:true},sender:{id:107278274},
    comment:{id:6500000001,created_at:at.toISOString(),body,user:{id:107278274}}
  }
}
test('exactly three commands and bounded checkpoint fields',()=>{
  assert.deepEqual(parseGatewayCommand('MVB/1 {"cmd":"claim-next"}'),{cmd:'claim-next'})
  assert.deepEqual(parseGatewayCommand('MVB/1 {"cmd":"release","node":"PCO-GATEWAY","leaseId":"'+id+'","generation":2,"reason":"handoff"}'),
    {cmd:'release',node:'PCO-GATEWAY',leaseId:id,generation:2,reason:'handoff'})
  const renew='MVB/1 '+JSON.stringify({cmd:'renew',node:'PCO-GATEWAY',leaseId:id,generation:2,
    checkpoint:{evidence:'PR #12 at head abc',next:'Validate'}})
  assert.equal(parseGatewayCommand(renew).cmd,'renew')
})
test('unknown commands, extra fields and injection strings fail closed',()=>{
  for(const body of [
    'MVB/1 {"cmd":"force"}','MVB/1 {"cmd":"status"}',
    'MVB/1 {"cmd":"claim-next","branch":"work/forged"}',
    'MVB/1 {"cmd":"release","node":"PCO-GATEWAY","leaseId":"'+id+'","generation":1,"reason":"completed"}',
    'MVB/1 {"cmd":"renew","node":"PCO-GATEWAY; echo secret","leaseId":"'+id+'","generation":1}',
    'MVB/1 {"cmd":"renew","node":"PCO-GATEWAY","leaseId":"'+id+'","generation":1,"checkpoint":{"evidence":"a","next":"b","sh":"id"}}',
    'MVB/1 {"cmd":"renew","node":"PCO-GATEWAY","leaseId":"'+id+'","generation":-1}',
    'MVB/1 {"cmd":"renew","node":"PCO-GATEWAY","leaseId":"'+id+'","generation":1,"checkpoint":{"evidence":"line\\nnext","next":"Do"}}',
    'MVB/1 {"cmd":"claim-next"} extra',
  ]) assert.throws(()=>parseGatewayCommand(body))
})
test('owner-only locked mailbox event and short expiry',()=>{
  assert.equal(assertGatewayEvent(event('MVB/1 {"cmd":"claim-next"}'),'adamnoden/architecture',at).id,6500000001)
  for(const change of [
    {issue:{number:42,locked:true}},{issue:{number:MVB_MAILBOX_ISSUE,locked:false}},
    {issue:{number:MVB_MAILBOX_ISSUE,locked:true,pull_request:{url:'PR'}}},
    {sender:{id:1}},{comment:{...event('').comment,user:{id:1}}},
    {repository:{full_name:'evil/clone',default_branch:'main',owner:{id:107278274}}},
    {action:'edited'}
  ]) assert.throws(()=>assertGatewayEvent({...event('MVB/1 {"cmd":"claim-next"}'),...change},'adamnoden/architecture',at))
  assert.throws(()=>assertGatewayEvent(event('MVB/1 {"cmd":"claim-next"}'),'adamnoden/architecture',new Date(at.getTime()+11*60000)))
})


test('renew accepts optional positive PR number without adding a command',()=>{
 const command=parseGatewayCommand('MVB/1 '+JSON.stringify({
   cmd:'renew',node:'PCO-GATEWAY',leaseId:id,generation:2,pr:1090,
   checkpoint:{evidence:'PR #1090 current head',next:'Merge after CI'}}))
 assert.equal(command.cmd,'renew')
 if(command.cmd==='renew') assert.equal(command.pr,1090)
 for(const pr of [0,-3,1.5,'1090',Number.MAX_SAFE_INTEGER+1,null]){
   assert.throws(()=>parseGatewayCommand('MVB/1 '+JSON.stringify({
     cmd:'renew',node:'PCO-GATEWAY',leaseId:id,generation:2,pr
   })))
 }
 assert.throws(()=>parseGatewayCommand('MVB/1 '+JSON.stringify({
   cmd:'release',node:'PCO-GATEWAY',leaseId:id,generation:2,reason:'abandoned',pr:1090
 })))
})
