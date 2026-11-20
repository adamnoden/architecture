import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import test from 'node:test'
import {readCurrentDesignResolution} from './current-design/resolve.js'
import {readInletSillInsertCase,runInletSillInsertCase} from './current-design/inlet-sill-insert.js'
import {readInletFaultCase,runInletFaultCase} from './current-design/inlet-fault.js'
import {compileFixedInletCandidate,readFixedInletSettings} from './current-design/inlet-fixed-entry.js'
import {compareCurrentFixedInletSupport} from './current-design/inlet-fixed-support-integration.js'
import {compareFixedInletWetSupport} from './current-design/inlet-fixed-wet-support.js'
import {compareCurrentSharedFixedInletServiceFrame,compareSharedFixedInletServiceFrame,sharedServiceFrameBeamReference} from './current-design/inlet-fixed-shared-service-frame.js'

const close=(a:number,b:number,tolerance=1e-6)=>assert.ok(Math.abs(a-b)<tolerance,`${a} != ${b}`)
function current(overrides:Partial<ReturnType<typeof readFixedInletSettings>>={}){
  const resolved=readCurrentDesignResolution(),ic=readInletSillInsertCase(resolved).insert,insert=runInletSillInsertCase(resolved,ic),faultCase=readInletFaultCase(resolved,ic).fault,fault=runInletFaultCase(resolved,faultCase,ic)
  const candidate=compileFixedInletCandidate(resolved,{...readFixedInletSettings(),riserYMm:600,controlHoodEastAllowanceMm:60,...overrides},{insert,faultCase,fault})
  const read=(p:string)=>readFileSync(new URL('../../'+p,import.meta.url),'utf8')
  const wet=compareFixedInletWetSupport(candidate,{wetCellsText:read('project/had/studies/south-inlet-wet-box.json'),servicesText:read('project/had/studies/current-house-services.json'),portalText:read('project/str/studies/floor-portal-interface-review.json')})
  const support=compareCurrentFixedInletSupport(resolved,candidate)
  return {candidate,support,wet,result:compareCurrentSharedFixedInletServiceFrame(candidate,support,wet)}
}

test('the actual elastic element agrees with cantilever and distributed-gravity controls including physical end offsets',()=>{
  const L=1000,F=100,E=200000,tip=sharedServiceFrameBeamReference({spanMm:L,tipDownwardN:F,selfWeight:false,rootOffsetMm:[0,0,0]})
  close(tip.tipTranslationMm[2],-F*L**3/(3*E*tip.section.iy))
  close(tip.rootWrench[2],F);close(tip.rootWrench[4],-F*L)
  const weight=sharedServiceFrameBeamReference({spanMm:L,tipDownwardN:0,selfWeight:true,rootOffsetMm:[0,0,0]}),q=weight.massKg*9.81/L
  close(weight.tipTranslationMm[2],-q*L**4/(8*E*weight.section.iy))
  close(weight.rootWrench[2],q*L);close(weight.rootWrench[4],-q*L**2/2)
  const offset=sharedServiceFrameBeamReference({spanMm:L,tipDownwardN:F,selfWeight:true,rootOffsetMm:[-65,-67.5,0]})
  close(offset.rootWrench[3],(F+q*L)*67.5)
  close(offset.rootWrench[4],-(F*(L+65)+q*L*(L/2+65)))
  close(offset.tipTranslationMm[2],tip.tipTranslationMm[2]+weight.tipTranslationMm[2])
})

test('one frame replaces both old frames with physical removable interfaces and preserved socket lanes',()=>{
  const {result}=current(),g=result.geometry
  assert.equal(g.noOldLowChassis,true);assert.equal(g.noOldSingleJambCantilever,true)
  assert.equal(g.pipeAndWetBracketsSeparate,true)
  assert.deepEqual(g.backboneRails.map(b=>[b[1],b[1]+b[4],b[2]+b[5]/2]),[[430,490,850],[430,490,1450]])
  assert.equal(g.wallPosts.length,2)
  assert.deepEqual(g.wallPosts[0].pads.flatMap(p=>p.anchorPointsMm.map(a=>a[2])),[630,830,1550,1750])
  assert.ok(g.knownLocalSocketHoopToNewAnchorAfterTwo5Mm>0)
  assert.equal(g.sourceGeneralTransverseSchedule,null)
  assert.equal(g.sourceSocketToolGuardEnvelope,null)
  assert.equal(g.removableBracketInterfaces.length,8)
  for(const j of g.removableBracketInterfaces){
    assert.equal(j.bolts.length,4)
    assert.ok(j.axis==='Y'?j.body[1]===j.reinforcement[1]+j.reinforcement[4]:j.body[2]===j.reinforcement[2]+j.reinforcement[5])
    assert.equal(j.boltHeadReservationQualified,false)
  }
  assert.ok(result.quantities.backboneSteelKg>65&&result.quantities.backboneSteelKg<72)
  assert.equal(result.selected,false)
  assert.equal(g.windowObstruction.projectedRailAreaMm2,160000)
  assert.deepEqual(g.windowObstruction.railsWithinConditionalOpeningZMm,[[810,890],[1410,1490]])
})

test('upper wet beam and low crossbar have full physical weld faces instead of edge-only unions',()=>{
  const {result}=current(),g=result.geometry,upper=g.wetBeams.find(b=>b.id==='upper-wet-beam')!.bodyMm,lower=g.wetBeams.find(b=>b.id==='lower-wet-crossbar')!.bodyMm
  assert.equal(upper[0],g.wetUpperBeamEndplatesMm[0][0]+g.wetUpperBeamEndplatesMm[0][3])
  assert.equal(upper[0]+upper[3],g.wetUpperBeamEndplatesMm[1][0])
  for(const stay of g.wetStays){
    assert.equal(lower[1],stay[1]+stay[4])
    const overlapX=Math.min(lower[0]+lower[3],stay[0]+stay[3])-Math.max(lower[0],stay[0])
    const overlapZ=Math.min(lower[2]+lower[5],stay[2]+stay[5])-Math.max(lower[2],stay[2])
    assert.equal(overlapX*overlapZ,1600)
  }
  for(const rib of g.wetFloorRibs[0].ribs)close(lower[2]+lower[5],rib.carrierSeatNotchBodyMm[2]+rib.carrierSeatNotchBodyMm[5])
  for(const stanchion of g.plantShortStanchionsMm){
    close(stanchion[2],lower[2]+lower[5])
    close(stanchion[2]+stanchion[5],g.plantCarrierBodyMm[2]+g.plantCarrierBodyMm[5])
  }
  for(const c of result.mechanics.cases)for(const joint of c.wetJointResults){
    assert.equal(joint.contactAreaMm2,1600)
    assert.ok(joint.returned4MmWeldStressMpa<result.mechanics.allowableComparisonMpa)
    assert.ok(joint.upperEndplate12MmStressMpa<result.mechanics.allowableComparisonMpa)
  }
})

test('all six pipe wrenches are retained and incompatible normal, wet-fault and cold cases remain separate',()=>{
  const {candidate,support,result}=current(),cases=result.mechanics.cases
  assert.equal(cases.length,4)
  for(const c of cases){
    assert.ok(c.maximumMemberStressMpa<result.mechanics.allowableComparisonMpa)
    assert.ok(c.maximumWeldStressMpa<result.mechanics.allowableComparisonMpa)
    assert.ok(c.maximumRemovableJointStressMpa<result.mechanics.allowableComparisonMpa)
    assert.ok(c.maximumIsolatedAnchorInteraction<1)
    for(const v of c.deadAndFixedLoadEquilibrium.forceResidualN)assert.ok(Math.abs(v)<1e-4)
    for(const v of c.deadAndFixedLoadEquilibrium.momentResidualNmm)assert.ok(Math.abs(v)<1e-3)
  }
  const normal=cases[0],fault=cases[1],cold=cases[2]
  assert.equal(normal.jetIncluded,false);assert.equal(normal.manualPullIncluded,false)
  assert.equal(fault.jetIncluded,true);assert.equal(fault.manualPullIncluded,false)
  assert.equal(cold.pressureAndSourceRouteThermalIncluded,false);assert.equal(cold.fullStructuralWetInventoryIncluded,false);assert.equal(cold.jetIncluded,false)
  assert.equal(cold.manualPullIncluded,true);close(cold.coldAxialEachN!,2167.054726,1e-5)
  assert.ok(cold.loads.some(l=>l.id==='utility-additional40mm-keeper-stock'&&l.force[2]<0))
  assert.ok(normal.loads.some(l=>l.id==='utility-fixedPointWrench-3'&&l.moment.some(v=>v!==0)))
  assert.ok(normal.loads.some(l=>l.id.startsWith('plant-guideWrench')&&l.node!==normal.loads.find(l=>l.id==='plant-fixedPointWrench-3')!.node))
  for(const [i,t] of result.mechanics.thermalTerminalScope.entries()){
    assert.deepEqual(t.outerTerminal,support.thermal[i].result.outerTerminalWrench)
    assert.equal(t.fullLodgeNetworkEstablished,false)
  }
  assert.equal(result.source.candidateCaseDigest,candidate.source.caseDigest)
})

test('filled-water inventory has a real computed centroid rather than the old fore-edge anchor screen',()=>{
  const {result,wet}=current()
  for(const water of result.mechanics.structuralWaterInventory){
    const source=wet.branches.find(b=>b.branch===water.branch)!
    close(water.massKg,source.waterMassUpperKg,1e-6)
    assert.ok(water.centreMm[1]>540&&water.centreMm[1]<620)
    close(water.centreMm[2],water.prisms.reduce((n,p)=>n+p.volume*p.centre[2],0)/water.prisms.reduce((n,p)=>n+p.volume,0))
  }
})

test('actual jaws, manual saws and whole bare lower-L draw clear the represented frame while shell closure cannot pass',()=>{
  const {result}=current(),o=result.operating
  assert.equal(o.representedPermanentGeometryPass,true)
  assert.ok(o.tools.every(p=>p.frameAfter5Mm>9))
  assert.ok(o.renewals.every(p=>p.frameAfterBareRadius5AndCurveMm>3))
  for(const renewal of o.renewals)close(renewal.frameAfterBareRadius5AndCurveMm,3.996281,1e-6)
  assert.equal(result.geometry.retainedPipeMounts.length,4)
  assert.ok(result.geometry.retainedPipeMounts.every(m=>m.mountingPlateBodyMm[1]+m.mountingPlateBodyMm[4]===577))
  assert.ok(o.rearClampCapReleaseEvidence.every(e=>e.rearHalfReleasePass))
  assert.ok(o.saws.every(p=>p.frameAfter5Mm>=21))
  assert.equal(o.roomReview?.allRepresentedFrameClear,true)
  assert.equal(Object.keys(o.roomReview!.inputs).length,4)
  assert.equal(result.geometry.hoodArmInterface.dimensionedPassiveClosure,null)
  assert.equal(result.geometry.hoodArmInterface.wetBodyLoadTransferToPipeAdmitted,false)
  assert.ok(result.diagnostics.includes('FIXED850_ARM_CROSSES_BACK_SHELL_WITHOUT_DIMENSIONED_PASSIVE_CLOSURE'))
  assert.equal(result.operating.completePanelSweepAndOperatorSpaceQualified,false)
  assert.equal(result.completeSupportCapacity,false)
})

test('temperature and guide changes recompute the actual frame while unaltered host and floor controls remain bound',()=>{
  const before=current(),hot=current({localPipeTemperatureRangeK:80}),higher=current({upperPipeGuideZMm:1820}),rear=current({riserYMm:595})
  const load=(r:typeof before.result)=>r.mechanics.cases[0].loads.find(l=>l.id==='utility-fixedPointWrench-3')!
  for(let k=0;k<3;k++)close(load(hot.result).moment[k],2*load(before.result).moment[k],1e-5)
  assert.notEqual(hot.result.mechanics.cases[0].maximumIsolatedAnchorInteraction,before.result.mechanics.cases[0].maximumIsolatedAnchorInteraction)
  assert.deepEqual(hot.result.geometry,before.result.geometry)
  assert.notDeepEqual(higher.result.geometry.members,before.result.geometry.members)
  assert.notEqual(rear.result.mechanics.cases[0].maximumMemberStressMpa,before.result.mechanics.cases[0].maximumMemberStressMpa)
  assert.deepEqual(rear.result.source.hostWindow,before.result.source.hostWindow)
  assert.deepEqual(higher.result.mechanics.structuralWaterInventory,before.result.mechanics.structuralWaterInventory)
  assert.throws(()=>compareSharedFixedInletServiceFrame(before.candidate,hot.support,before.wet),/one actual candidate revision/)
})

test('each assembly can be mechanically removed without making the other assembly its structural support',()=>{
  const {candidate,support,wet}=current()
  for(const subsystem of ['pipe-only','wet-only'] as const){
    const result=compareSharedFixedInletServiceFrame(candidate,support,wet,subsystem)
    assert.equal(result.mechanics.representedSubsystem,subsystem)
    assert.ok(result.quantities.representedWholeSteelKg>result.quantities.backboneSteelKg)
    for(const c of result.mechanics.cases){
      assert.ok(c.maximumMemberStressMpa<result.mechanics.allowableComparisonMpa)
      assert.ok(c.maximumRemovableJointStressMpa<result.mechanics.allowableComparisonMpa)
      assert.ok(c.maximumIsolatedAnchorInteraction<1)
    }
    if(subsystem==='pipe-only')assert.ok(result.geometry.members.every(m=>!m.id.startsWith('wet-')&&!m.id.startsWith('lower-wet-')&&!m.id.startsWith('upper-wet-')))
    else assert.ok(result.mechanics.cases.every(c=>c.loads.every(l=>!l.id.includes('fixedPointWrench')&&!l.id.includes('cold-upper-keeper'))))
  }
  const shorter=compareSharedFixedInletServiceFrame(candidate,support,wet,'pipe-only',160)
  assert.ok(shorter.mechanics.cases[0].maximumIsolatedAnchorInteraction>1)
  assert.ok(shorter.diagnostics.includes('SHARED_FRAME_ISOLATED_ANCHOR_SCREEN_FAILS'))
})

test('missing and stale room-service context cannot acquire an actual spatial pass',()=>{
  const {candidate,support,wet}=current(),without=compareSharedFixedInletServiceFrame(candidate,support,wet)
  assert.equal(without.operating.roomReview,null)
  assert.ok(without.diagnostics.includes('CURRENT_SPATIAL_CONTEXT_NOT_SUPPLIED'))
  const stale={...candidate,source:{...candidate.source,inputs:{...candidate.source.inputs,'project/had/studies/utility-wide-capture.json':'0'.repeat(40)}}}
  assert.throws(()=>compareCurrentSharedFixedInletServiceFrame(stale,support,wet),/spatial context differs from the actual candidate/)
})
