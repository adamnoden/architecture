import assert from 'node:assert/strict'
import test from 'node:test'
import {readFileSync} from 'node:fs'
import {compareFixedInletReceiver,inletReceiverBeam} from './current-design/inlet-fixed-receiver.js'

function fixture(){
  const portal=JSON.parse(readFileSync(new URL('../../project/str/studies/floor-portal-interface-review.json',import.meta.url),'utf8'))
  const cage=JSON.parse(readFileSync(new URL('../../project/str/studies/reconciled-house-interface.json',import.meta.url),'utf8')).jambAndTies
  const jambAxesXMm=portal.geometry.occurrences.filter((r:{face:string;opening:string})=>r.face==='outer-south'&&r.opening==='south-window-4').map((r:{jambAxisPmm:number})=>r.jambAxisPmm)
  return {jambAxesXMm,jambNormalFacesYMm:portal.geometry.jambQmm,jambAlongWidthMm:portal.geometry.jambNormalAlongMM[1],finishedWallYMm:429.5,
    sourceCage:{longitudinalDiameterMm:12,transverseDiameterMm:null,normalBarAxesMm:cage.continuousJambH12Q,
      alongBarOffsetsMm:cage.continuousJambH12X,requiredCoverMm:25},
    branches:[{id:'utility',pipeAxisXMm:10080,riserYMm:600,pressureEndForceN:463.24669,fullyRestrainedThermalForceN:13336.0,knownStockMassKg:5,lowerRepairCutZMm:975,secondUpperRepairCutZMm:1525},
      {id:'plant',pipeAxisXMm:10285,riserYMm:600,pressureEndForceN:463.24669,fullyRestrainedThermalForceN:13336.0,knownStockMassKg:7,lowerRepairCutZMm:975,secondUpperRepairCutZMm:1525}],pipe:{outerDiameterMm:28,wallMm:1.2,stockMassKgM:.84},toolActionN:null}
}

test('receiver beam agrees with independent centred point and uniform-load controls',()=>{
  const point=inletReceiverBeam(1000,[{xMm:500,forceN:100}])
  assert.equal(point.leftN,50)
  assert.equal(point.rightN,50)
  assert.equal(point.maximumAbsoluteMomentNmm,25000)
  const uniform=inletReceiverBeam(1000,[],1)
  assert.equal(uniform.maximumAbsoluteMomentNmm,125000)
  assert.equal(uniform.leftN,500)
  assert.throws(()=>inletReceiverBeam(1000,[{xMm:1001,forceN:1}]),/actual receiver span/)
})

test('near-load steel retains unresolved source confinement and unknown tool/group evidence',()=>{
  const input=fixture(),result=compareFixedInletReceiver(input)
  assert.equal(result.anchorScreen.sourceHoopOutsideCoverMm,null)
  assert.equal(result.anchorScreen.authoredTransverseComparison,null)
  assert.ok(result.diagnostics.includes('SOURCE_JAMB_TRANSVERSE_SCHEDULE_UNRESOLVED'))
  assert.ok(result.diagnostics.includes('ACTUAL_TOOL_AND_COUNTERHOLD_ACTION_UNKNOWN'))
  assert.equal(result.geometry.noFloorOrDpcFixings,true)
  assert.equal(result.geometry.noLinerFloorOrRibTransfer,true)
  assert.deepEqual(result.geometry.rail.levelsZMm,[850,1450])
  assert.equal(result.geometry.wallAfter5Mm,5.5)
  assert.equal(result.actions.caseCount,64)
  for(const [i,record] of result.actions.thermalActionWrenches.entries()){
    const force=input.branches[i].fullyRestrainedThermalForceN
    assert.deepEqual(record.fixedPoint.forceComponentBoundsN,[2*force,2*force,2*force])
    assert.deepEqual(record.guide.forceComponentBoundsN,[force,force,0])
    assert.equal(result.actions.fullRestraintReference[i].lockedPipeMomentEnvelopeEstablished,false)
    assert.equal(result.actions.fullRestraintReference[i].fullLodgeAndHouseNetworkBound,false)
  }
  for(const c of result.actions.cases)for(const j of c.jambs){
    assert.equal(j.forceResidualN,0)
    assert.equal(j.momentResidualNmm,0)
  }
  assert.equal(result.completeSupportCapacity,false)
  assert.equal(result.anchorScreen.actualGroupResistanceEstablished,false)
  assert.ok(result.mass.knownFabricatedSteelKg>150)
  assert.deepEqual(compareFixedInletReceiver(JSON.parse(JSON.stringify(input))),result)
})

test('actual frame weight is counted once and thermal relief cannot resolve the missing source cage schedule',()=>{
  const input=fixture(),full=compareFixedInletReceiver(input)
  const plus=full.actions.cases.find(c=>c.mask===63)!
  const jambTotal=plus.jambs.reduce((n,j)=>n+j.verticalN,0)
  const forceTotal=input.branches.reduce((n,b)=>n+b.pressureEndForceN+2*b.fullyRestrainedThermalForceN-(b.knownStockMassKg+b.knownStockMassKg/.84*Math.PI*(.0256**2)/4*1000)*9.81,0)-full.mass.knownFabricatedSteelKg*9.81
  assert.ok(Math.abs(jambTotal-forceTotal)<.0001)
  const released=compareFixedInletReceiver({...input,branches:input.branches.map(b=>({...b,fullyRestrainedThermalForceN:0}))})
  assert.ok(full.elasticComparisons.railMpa>released.elasticComparisons.railMpa*10)
  assert.ok(released.diagnostics.includes('SOURCE_JAMB_TRANSVERSE_SCHEDULE_UNRESOLVED'))
  assert.deepEqual(released.geometry,full.geometry)
})

test('unknown transverse steel cannot coerce to a cover pass and authored H8/H6 remain nominal sensitivities',()=>{
  const input=fixture(),unknown=compareFixedInletReceiver(input)
  assert.equal(unknown.sourceContext.sourceCage.transverseDiameterMm,null)
  assert.equal(unknown.anchorScreen.sourceHoopOutsideCoverMm,null)
  assert.equal(unknown.anchorScreen.authoredTransverseComparison,null)
  assert.equal(unknown.anchorScreen.sourceTransverseSchedule.owner,'STR')
  assert.deepEqual(Object.values(unknown.anchorScreen.sourceTransverseSchedule).filter(value=>value===null),[null,null,null,null,null])
  assert.deepEqual(unknown.anchorScreen.authoredTransverseSensitivities.map(row=>[row.transverseDiameterMm,row.nominalOutsideCoverMm,row.meetsNominalCoverScreen]),[[8,24,false],[6,26,true]])
  for(const diameter of [8,6]){
    const authored=compareFixedInletReceiver({...input,sourceCage:{...input.sourceCage,transverseDiameterMm:diameter}})
    assert.equal(authored.anchorScreen.sourceHoopOutsideCoverMm,null)
    assert.equal(authored.anchorScreen.authoredTransverseComparison!.nominalOutsideCoverMm,32-diameter)
    assert.equal(authored.anchorScreen.authoredTransverseComparison!.status,'authored-nominal-sensitivity-not-source-schedule')
    assert.equal(authored.anchorScreen.authoredTransverseComparison!.installedSourceConfinementPass,false)
    assert.equal(authored.anchorScreen.sourceTransverseSchedule.installedSourceConfinementPass,false)
    assert.equal(authored.anchorScreen.sourceCageRepairAdopted,false)
    assert.ok(authored.diagnostics.includes('SOURCE_JAMB_TRANSVERSE_SCHEDULE_UNRESOLVED'))
    assert.equal(authored.diagnostics.includes('AUTHORED_JAMB_TRANSVERSE_COMPARISON_FAILS_NOMINAL_COVER_SCREEN'),diameter===8)
    assert.deepEqual(authored.geometry,unknown.geometry)
    assert.deepEqual(authored.actions,unknown.actions)
    assert.equal(authored.completeSupportCapacity,false)
  }
  assert.ok(!unknown.diagnostics.includes('AUTHORED_JAMB_TRANSVERSE_COMPARISON_FAILS_NOMINAL_COVER_SCREEN'))
  for(const transverseDiameterMm of [0,-6,NaN,Infinity,undefined])assert.throws(()=>compareFixedInletReceiver({...input,
    sourceCage:{...input.sourceCage,transverseDiameterMm:transverseDiameterMm as number|null}}),/positive authored comparison or explicit unknown/)
})

test('the ordinary receiver requires its actual released-route ceiling and retains all unqualified boundaries',()=>{
  const input=fixture()
  assert.throws(()=>compareFixedInletReceiver(input,'guided-route'),/complete source-positioned/)
  const bound={...input,branches:input.branches.map(b=>({...b,guidedThermalActions:{
    fixedPointWrench:{pointMm:[b.pipeAxisXMm,b.riserYMm,850],forceComponentBoundsN:[6,400,60],momentComponentBoundsNmm:[70000,1600,1000]},
    guideWrench:{pointMm:[b.pipeAxisXMm,b.riserYMm,1680],forceComponentBoundsN:[7,7,0],momentComponentBoundsNmm:[0,0,0]}}}))}
  const full=compareFixedInletReceiver(bound),ordinary=compareFixedInletReceiver(bound,'guided-route')
  assert.ok(ordinary.mass.knownFabricatedSteelKg<full.mass.knownFabricatedSteelKg/2)
  assert.ok(ordinary.elasticComparisons.railMpa<200)
  assert.ok(ordinary.elasticComparisons.backplateMpa<200)
  assert.ok(ordinary.anchorScreen.maximumIsolatedCatalogueInteraction<.2)
  assert.ok(ordinary.diagnostics.includes('SOURCE_JAMB_TRANSVERSE_SCHEDULE_UNRESOLVED'))
  assert.equal(ordinary.completeSupportCapacity,false)
  assert.equal(ordinary.anchorScreen.actualGroupResistanceEstablished,false)
  const alteredAdverseInput={...bound,branches:bound.branches.map(b=>({...b,fullyRestrainedThermalForceN:2*b.fullyRestrainedThermalForceN}))}
  const unchangedGuided=compareFixedInletReceiver(alteredAdverseInput,'guided-route')
  assert.deepEqual(unchangedGuided.actions.thermalActionWrenches,ordinary.actions.thermalActionWrenches)
  assert.deepEqual(unchangedGuided.elasticComparisons,ordinary.elasticComparisons)
  assert.deepEqual(unchangedGuided.geometry,ordinary.geometry)
})

test('retired bridge gravity retains real branch positions and the concrete-face eccentric couple',()=>{
  const base=fixture(),input={...base,branches:base.branches.map(b=>({...b,pressureEndForceN:0,fullyRestrainedThermalForceN:0,knownStockMassKg:0}))}
  const result=compareFixedInletReceiver(input),jambs=result.actions.cases[0].jambs
  const west=Math.min(...input.jambAxesXMm),span=Math.max(...input.jambAxesXMm)-west
  const pointEast=result.mass.gravityPointsByRail.flat().reduce((n,p)=>n+p.massKg*9.81*(p.pointMm[0]-west)/span,0)
  const directEast=(result.mass.backplatesKg+result.mass.packingKg)*9.81/2
  const expectedEast=pointEast+result.mass.railsKg*9.81/2+directEast
  assert.ok(Math.abs(-jambs[1].verticalN-expectedEast)<1e-4)
  assert.ok(-jambs[1].verticalN>-jambs[0].verticalN)
  assert.ok(jambs.every(j=>j.pointCoupleAndAxialAdditions.frameGravityWallMomentBoundNmm>0))
  assert.equal(result.disposition,'retired-continuous-backplate-comparison')
})
