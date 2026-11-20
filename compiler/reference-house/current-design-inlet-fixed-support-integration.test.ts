import assert from 'node:assert/strict'
import test from 'node:test'
import {readCurrentDesignResolution} from './current-design/resolve.js'
import {readInletSillInsertCase,runInletSillInsertCase} from './current-design/inlet-sill-insert.js'
import {readInletFaultCase,runInletFaultCase} from './current-design/inlet-fault.js'
import {compileFixedInletCandidate,readFixedInletSettings} from './current-design/inlet-fixed-entry.js'
import {compareCurrentFixedInletSupport} from './current-design/inlet-fixed-support-integration.js'

function source(){
  const resolved=readCurrentDesignResolution(),insertCase=readInletSillInsertCase(resolved).insert
  const insert=runInletSillInsertCase(resolved,insertCase),faultCase=readInletFaultCase(resolved,insertCase).fault
  const joined={insert,faultCase,fault:runInletFaultCase(resolved,faultCase,insertCase)}
  const settings={...readFixedInletSettings(),riserYMm:600}
  return {resolved,joined,settings,candidate:compileFixedInletCandidate(resolved,settings,joined)}
}

test('the current adapter binds actual portal/cage sources, both thermal paths and complete receiver wrenches',()=>{
  const {resolved,candidate}=source(),result=compareCurrentFixedInletSupport(resolved,candidate)
  assert.equal(result.source.candidateCaseDigest,candidate.source.caseDigest)
  assert.equal(result.source.faultCaseDigest,candidate.source.faultCaseDigest)
  assert.equal(Object.keys(result.source.inputs).length,3)
  assert.deepEqual(result.hostWindow.candidateClearXMm,[9400,10400])
  assert.deepEqual(result.hostWindow.acceptedClearXMm,[9700,10700])
  assert.equal(result.hostWindow.sillZMm,750)
  assert.equal(result.hostWindow.headZMm,2850)
  assert.equal(result.hostWindow.status,'conditional-structural-rewind')
  assert.equal(result.hostWindow.source.openingEditsGitBlob,result.source.inputs[result.hostWindow.source.openingEditsPath])
  assert.equal(result.thermal.length,2)
  for(const receiver of Object.values(result.receivers)){
    assert.equal(receiver.sourceContext.sourceCage.transverseDiameterMm,null)
    assert.equal(receiver.anchorScreen.sourceHoopOutsideCoverMm,null)
    assert.equal(receiver.anchorScreen.authoredTransverseComparison,null)
    assert.equal(receiver.anchorScreen.sourceTransverseSchedule.status,'unresolved')
    assert.deepEqual(receiver.anchorScreen.authoredTransverseSensitivities.map(row=>[row.transverseDiameterMm,row.nominalOutsideCoverMm]),[[8,24],[6,26]])
    assert.ok(receiver.diagnostics.includes('SOURCE_JAMB_TRANSVERSE_SCHEDULE_UNRESOLVED'))
    assert.ok(!receiver.diagnostics.includes('SOURCE_JAMB_CAGE_COVER_FAILS_REQUIRED25'))
  }
  assert.equal(result.evidence.completeSupportCapacity,false)
  for(const [i,thermal] of result.thermal.entries()){
    assert.deepEqual(result.receivers.guidedRoute.actions.thermalActionWrenches[i].fixedPoint,thermal.result.combinedFixedPointWrench)
    assert.deepEqual(thermal.result.lowerSubroute.fullyFixedTerminalMm,candidate.branches[i].pressurePathMm[0])
  }
  for(const mount of result.receivers.guidedRoute.geometry.pipeMounts){
    assert.equal(mount.pipeWeldedToSupport,false)
    assert.equal(mount.rawArmTipToBareTubeAfter5Mm,16)
    assert.equal(mount.mountingPlateToBareTubeAfter5Mm,11)
    const plate=mount.plateBodyMm
    for(const lug of mount.rearLugs){
      const body=lug.blankBodyMm
      assert.equal(body[1],plate[1]+plate[4])
      assert.ok(body[0]>=plate[0]&&body[0]+body[3]<=plate[0]+plate[3])
      assert.ok(body[2]>=plate[2]&&body[2]+body[5]<=plate[2]+plate[5])
      assert.equal(lug.plateContactFaceMm[3]*lug.plateContactFaceMm[5],120)
    }
  }
  for(const arm of result.receivers.guidedRoute.geometry.fixedPointArms){
    const box=arm.bodyMm
    assert.equal(box[1]+box[4],candidate.settings.riserYMm-35)
  }
  for(const post of result.receivers.guidedRoute.geometry.guidePosts){
    const body=post.bodyMm,arm=post.armBodyMm
    assert.equal(arm[1],body[1]+body[4])
    assert.ok(arm[2]>=body[2]&&arm[2]+arm[5]<=body[2]+body[5])
    assert.equal(post.armPostContactFaceMm[3]*post.armPostContactFaceMm[5],2400)
  }
  assert.equal(result.receivers.guidedRoute.mass.mountingPlatesKg,.384)
  assert.equal(result.compactReceiver.sourceContext.receiver,result.receivers.guidedRoute.schema)
  assert.equal(result.compactReceiver.basis.socketReservationSource.gitBlob,result.source.inputs[result.compactReceiver.basis.socketReservationSource.path])
})

test('temperature and riser changes reach the actual current support consumer while source fault controls stay unchanged',()=>{
  const {resolved,candidate,settings,joined}=source(),before=compareCurrentFixedInletSupport(resolved,candidate)
  const hotCandidate=compileFixedInletCandidate(resolved,{...settings,localPipeTemperatureRangeK:80},joined)
  const hot=compareCurrentFixedInletSupport(resolved,hotCandidate)
  assert.notEqual(hot.caseDigest,before.caseDigest)
  assert.ok(Math.abs(hot.thermal[0].result.combinedFixedPointWrench.forceComponentBoundsN[1]-2*before.thermal[0].result.combinedFixedPointWrench.forceComponentBoundsN[1])<1e-6)
  assert.notDeepEqual(hot.receivers.guidedRoute.elasticComparisons,before.receivers.guidedRoute.elasticComparisons)
  assert.deepEqual(hot.receivers.guidedRoute.geometry,before.receivers.guidedRoute.geometry)
  assert.deepEqual(hot.source.inputs,before.source.inputs)
  assert.deepEqual(hot.hostWindow,before.hostWindow)
  assert.equal(before.compactReceiver.internalComparisons.railPlateAndWeldPass,true)
  assert.equal(hot.compactReceiver.internalComparisons.railPlateAndWeldPass,false)
  assert.equal(hot.compactReceiver.internalComparisons.conditionalTubeContactPass,false)
  assert.equal(hot.source.faultCaseDigest,before.source.faultCaseDigest)
  const rearCandidate=compileFixedInletCandidate(resolved,{...settings,riserYMm:595},joined)
  const rear=compareCurrentFixedInletSupport(resolved,rearCandidate)
  assert.notDeepEqual(rear.thermal,before.thermal)
  assert.notDeepEqual(rear.receivers.guidedRoute.geometry,before.receivers.guidedRoute.geometry)
  assert.notDeepEqual(rear.receivers.guidedRoute.mass,before.receivers.guidedRoute.mass)
  assert.equal(rear.source.faultCaseDigest,before.source.faultCaseDigest)
  assert.deepEqual(rear.source.inputs,before.source.inputs)
})

test('missing or stale structural references and mixed candidate revisions cannot earn current support evidence',()=>{
  const {resolved,candidate}=source()
  const stale={...resolved,disciplineBindings:resolved.disciplineBindings.map(b=>({...b,identities:{...b.identities,
    ...(b.identities['project/str/studies/reconciled-house-interface.json']?{'project/str/studies/reconciled-house-interface.json':'0'.repeat(40)}:{})}}))}
  assert.throws(()=>compareCurrentFixedInletSupport(stale,candidate),/Stale current fixed-inlet support source/)
  const missing={...resolved,disciplineBindings:resolved.disciplineBindings.map(b=>({...b,
    identities:Object.fromEntries(Object.entries(b.identities).filter(([path])=>path!=='project/str/studies/reconciled-house-interface.json'))}))}
  assert.throws(()=>compareCurrentFixedInletSupport(missing,candidate),/Stale current fixed-inlet support source/)
  assert.throws(()=>compareCurrentFixedInletSupport(resolved,{...candidate,source:{...candidate.source,planDigest:'wrong'}}),/same resolved design/)
  assert.throws(()=>compareCurrentFixedInletSupport(resolved,{...candidate,method:{...candidate.method,gitBlob:'0'.repeat(40)}}),/Stale current fixed-inlet candidate method/)
  const mixed={...candidate,source:{...candidate.source,inputs:{...candidate.source.inputs,'project/str/studies/floor-portal-interface-review.json':'0'.repeat(40)}}}
  assert.throws(()=>compareCurrentFixedInletSupport(resolved,mixed),/mix candidate and portal revisions/)
})
