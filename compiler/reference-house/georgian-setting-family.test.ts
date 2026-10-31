import assert from 'node:assert/strict'
import {test} from 'node:test'
import {createCurrentSettingScene,settingSource} from './georgian/setting-family.js'
import {layoutRevision as design,revisionOpenings} from './georgian/layout-revision.js'

test('current setting retains the documented surrogate and derives the changed court without importing old technical results',()=>{
 assert.equal(settingSource.surrogateWidth,15500);assert.equal(settingSource.sideClearance,1750)
 assert.deepEqual(settingSource.court,design.court);assert.equal(settingSource.realSite,false);assert.equal(settingSource.accessVerified,false)
 for(const scale of [200,100] as const){
  const s=createCurrentSettingScene('SETTING',scale),shell=s.primitives.find(p=>p.id==='shell')!,court=s.primitives.find(p=>p.id==='court')!
  assert.ok(shell.kind==='rect'&&court.kind==='rect');assert.equal(shell.width,12000/scale);assert.equal(court.width,3500/scale);assert.equal(court.x-shell.x,4250/scale)
  assert.equal(s.primitives.filter(p=>p.kind==='rect').length,2,'No closed plot or equipment footprint')
  const overlay=createCurrentSettingScene('EXTERNAL-OBLIGATIONS',scale)
  for(const q of s.primitives.filter(p=>!p.id.startsWith('key-')))assert.deepEqual(overlay.primitives.find(p=>p.id===q.id),q)
  const op=overlay.primitives.find(p=>p.id==='plant-opening')!,source=revisionOpenings('GROUND').find(o=>o.wall==='outer-east'&&o.kind==='door')!
  assert.ok(op.kind==='line');assert.equal(Math.abs(op.b.y-op.a.y),source.width/scale)
 }
})
test('no method, route, compliance or physical acceptance is inferred from a setting diagram',()=>{
 assert.ok(settingSource.absences.includes('legal-boundary'));assert.ok(settingSource.absences.includes('equipment-method'))
 const s=createCurrentSettingScene('EXTERNAL-OBLIGATIONS',200),captions=s.primitives.filter(p=>p.kind==='text').map(p=>p.value).join(' ')
 for(const phrase of ['remain unverified','remain unresolved','unselected','does not prove'])assert.ok(captions.includes(phrase))
 assert.equal(settingSource.physicalAcceptance,false)
})
