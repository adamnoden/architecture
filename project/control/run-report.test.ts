import assert from 'node:assert/strict'
import test from 'node:test'
import { elapsedMinutes, packetCoverage, parseSwarmRun, progressDelta, progressSnapshot, renderRunReport, validateCloseout, type SwarmRun, type RunCloseout } from './run-report.js'
import type { ControlNode } from './types.js'
const ref='a'.repeat(40), at='2026-10-29T12:00:00.000Z'
const node=(id:string,lifecycle:ControlNode['lifecycle']='planned',owners:ControlNode['owners']=['PCO']):ControlNode=>({id,owners,title:id,lifecycle,dependencies:[],agentDispatch:{mode:'self-service'},closeoutEvidence:[]})
const baseline=progressSnapshot([node('A'),node('B','complete'),node('C','cancelled')],ref,new Date(at))
const run=():SwarmRun=>({schemaVersion:1,mode:'swarm',startedAt:at,baseline,merges:[]})
const closeout:RunCloseout={reason:'execution-limit',detail:'Actual host execution deadline reached',validation:'CI passed on exact submitted head',leases:'released',cleanup:'clean'}
test('packet coverage excludes cancelled work and never invents a percent for an empty scope',()=>{
 assert.deepEqual(packetCoverage(baseline.nodes),{done:1,total:2,cancelled:1,percent:50})
 assert.equal(packetCoverage([]).percent,null)
 assert.equal(packetCoverage(progressSnapshot([node('C','cancelled')],ref).nodes).percent,null)
})
test('shared nodes count once globally, with explicit ownership in each stream',()=>{
 const snap=progressSnapshot([node('SHARED','complete',['PCO','ACO']),node('A')],ref)
 assert.equal(packetCoverage(snap.nodes).percent,50)
 assert.equal(packetCoverage(snap.nodes.filter(n=>n.owners.includes('ACO'))).percent,100)
 assert.match(renderRunReport({...run(),baseline:snap},snap,{allWorkstreams:true}),/rows must not be summed/)
})
test('scope growth and requeue can lower percentage despite shipped work; deltas remain explicit',()=>{
 const after=progressSnapshot([node('A','complete'),node('B'),node('D'),node('E')],ref,new Date('2026-10-29T12:30:00Z'))
 const delta=progressDelta(baseline,after)
 assert.deepEqual(delta.added,['D','E']);assert.deepEqual(delta.removed,['C']);assert.deepEqual(delta.reopened,['B']);assert.deepEqual(delta.completed,['A'])
 assert.equal(packetCoverage(after.nodes).percent,25)
 const r=run();r.merges=[{node:'A',pr:'https://github.com/o/r/pull/1',merge:ref}]
 const text=renderRunReport(r,after,{closeout})
 assert.match(text,/30 min elapsed/);assert.match(text,/1\/2 \(50%\) → 1\/4 \(25%\)/);assert.match(text,/may include other agents/)
})
test('session attribution is the explicit merge journal, not all concurrent completions',()=>{
 const r=run();r.merges=[{node:'A',pr:'https://github.com/o/r/pull/1',merge:ref}]
 const after=progressSnapshot([node('A','complete'),node('B'),node('OTHER','complete')],ref,new Date('2026-10-29T12:10:00Z'))
 assert.match(renderRunReport(r,after),/1 merged packet\(s\) currently complete/)
 const reopened=progressSnapshot([node('A'),node('B')],ref,new Date('2026-10-29T12:11:00Z'))
 assert.match(renderRunReport(r,reopened),/0 merged packet\(s\) currently complete/)
 assert.match(renderRunReport(r,reopened),/Reopened\/removed since merge/)
})
test('stop reason cannot disguise arbitrary packet caps and residue cannot disappear',()=>{
 assert.throws(()=>validateCloseout(run(),{...closeout,reason:'scope-complete'}),/no invented packet-count cap/)
 assert.doesNotThrow(()=>validateCloseout({...run(),mode:'directed'},{...closeout,reason:'scope-complete'}))
 assert.throws(()=>validateCloseout(run(),{...closeout,detail:''}),/concrete detail/)
 assert.throws(()=>validateCloseout(run(),{...closeout,leases:'residue'}),/exact residue/)
 assert.doesNotThrow(()=>validateCloseout(run(),{...closeout,cleanup:'residue',residue:'PR branch x: repo admin to remove after checking active refs'}))
})
test('timestamps and journals reject malformed state; new packets added during the run are recordable',()=>{
 assert.equal(elapsedMinutes(at,'2026-10-29T12:01:30Z'),1.5)
 assert.throws(()=>elapsedMinutes(at,'bad'))
 assert.throws(()=>elapsedMinutes(at,'2026-10-29T11:59:00Z'))
 assert.throws(()=>parseSwarmRun(JSON.stringify({...run(),schemaVersion:2})))
 const r=run();r.merges=[{node:'NEW',pr:'https://github.com/o/r/pull/2',merge:ref}]
 assert.doesNotThrow(()=>parseSwarmRun(JSON.stringify(r)))
 assert.throws(()=>parseSwarmRun(JSON.stringify({...r,merges:[...r.merges,...r.merges]})),/duplicate/)
})
test('manual gate reasons and live occupancy uncertainty survive the concise report',()=>{
 const snap=progressSnapshot([{...node('MANUAL'),agentDispatch:{mode:'manual',reason:'Actual-size owner print verdict'}}],ref,new Date('2026-10-29T12:20:00Z'))
 const text=renderRunReport(run(),snap)
 assert.match(text,/MANUAL: Actual-size owner print verdict/)
 assert.match(text,/not queried; structural READY does not establish availability/)
 assert.match(text,/Checkpoint only; continue/)
})
