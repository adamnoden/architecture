import assert from 'node:assert/strict'
import test from 'node:test'
import {compareFixedInletThermalRoute} from './current-design/inlet-fixed-thermal.js'
import {readCurrentDesignResolution} from './current-design/resolve.js'
import {readInletSillInsertCase,runInletSillInsertCase} from './current-design/inlet-sill-insert.js'
import {readInletFaultCase,runInletFaultCase} from './current-design/inlet-fault.js'
import {compileFixedInletCandidate,readFixedInletSettings} from './current-design/inlet-fixed-entry.js'
import {compareFixedInletReceiver} from './current-design/inlet-fixed-receiver.js'

const pipe={outerDiameterMm:28,wallMm:1.2,elasticModulusMpa:200000,poissonRatio:.3,expansionMmMK:.0165}

test('a fully end-restrained straight control retains EAalphaDeltaT instead of inventing thermal release',()=>{
  const result=compareFixedInletThermalRoute({pathMm:[[0,0,0],[0,0,1000],[0,0,2000]],fixedPointZMm:850,guideZMm:1650,temperatureExcursionK:40,pipe})
  assert.ok(Math.abs(result.upperSubroute.uniformTemperature.terminalForceN[2]+result.whollyRestrainedAxialComparisonN)<1e-5)
  assert.equal(result.upperSubroute.uniformTemperature.guideFreeAxialThermalTravelMm,.528)
  assert.equal(result.upperSubroute.uniformTemperature.terminalForceN[0],0)
  assert.equal(result.upperSubroute.uniformTemperature.terminalForceN[1],0)
  assert.deepEqual(result.upperSubroute.uniformTemperature.terminalMomentNmm,[0,0,0])
  assert.ok(Math.abs(result.lowerSubroute.uniformTemperature.terminalForceN[2]-result.whollyRestrainedAxialComparisonN)<1e-5)
  assert.deepEqual(result.combinedFixedPointWrench.uniformForceN,[0,0,0])
  assert.ok(Math.abs(result.combinedFixedPointWrench.forceComponentBoundsN[2]-2*result.whollyRestrainedAxialComparisonN)<1e-5)
})

test('the actual finite current routes recompute their thermal reactions with an explicit axial-sliding guide',()=>{
  const resolution=readCurrentDesignResolution(),insertCase=readInletSillInsertCase(resolution).insert
  const insert=runInletSillInsertCase(resolution,insertCase),faultCase=readInletFaultCase(resolution,insertCase).fault
  const candidate=compileFixedInletCandidate(resolution,{...readFixedInletSettings(),riserYMm:600},
    {insert,faultCase,fault:runInletFaultCase(resolution,faultCase,insertCase)})
  const longer=compileFixedInletCandidate(resolution,{...readFixedInletSettings(),riserYMm:600,outerCutYMm:-400},
    {insert,faultCase,fault:runInletFaultCase(resolution,faultCase,insertCase)})
  const thermal:ReturnType<typeof compareFixedInletThermalRoute>[]=[]
  for(const branch of candidate.branches){
    const input={pathMm:branch.pressurePathMm,fixedPointZMm:850,guideZMm:1680,temperatureExcursionK:40,pipe}
    const result=compareFixedInletThermalRoute(input)
    thermal.push(result)
    assert.ok(Math.max(...result.upperSubroute.independentSegmentTemperatureBound.fixedPointComponentBoundsN)<7)
    assert.ok(Math.max(...result.upperSubroute.independentSegmentTemperatureBound.guideLateralComponentBoundsN)<7)
    assert.ok(result.whollyRestrainedAxialComparisonN>13336)
    assert.ok(result.combinedFixedPointWrench.forceComponentBoundsN[1]>(branch.branch==='plant'?300:100))
    assert.ok(result.combinedFixedPointWrench.momentComponentBoundsNmm[0]>(branch.branch==='plant'?60000:30000))
    assert.equal(result.lowerSubroute.lateralGuideMm,null)
    assert.deepEqual(result.lowerSubroute.fullyFixedTerminalMm,branch.pressurePathMm[0])
    assert.equal(result.fullLodgeAndHouseSupportNetworkEstablished,false)
    assert.equal(result.upperSubroute.validity.actualSlidingGuideFrictionQualified,false)
    assert.equal(result.upperSubroute.validity.extraClampsOrUnmodelledRestraintsAllowed,false)
    const doubled=compareFixedInletThermalRoute({...input,temperatureExcursionK:80})
    assert.ok(Math.abs(doubled.upperSubroute.uniformTemperature.fixedPointForceN[1]-2*result.upperSubroute.uniformTemperature.fixedPointForceN[1])<1e-7)
    assert.deepEqual(doubled.fixedPointMm,result.fixedPointMm)
    assert.deepEqual(doubled.upperSubroute.fullyFixedTerminalMm,result.upperSubroute.fullyFixedTerminalMm)
    const zero=compareFixedInletThermalRoute({...input,temperatureExcursionK:0})
    assert.deepEqual(zero.combinedFixedPointWrench.uniformForceN,[0,0,0])
    assert.equal(JSON.stringify(compareFixedInletThermalRoute(JSON.parse(JSON.stringify(input)))),JSON.stringify(result))
    const changed=compareFixedInletThermalRoute({...input,pathMm:longer.branches.find(b=>b.branch===branch.branch)!.pressurePathMm})
    assert.deepEqual(changed.upperSubroute,result.upperSubroute)
    assert.notDeepEqual(changed.lowerSubroute,result.lowerSubroute)
    assert.notDeepEqual(changed.combinedFixedPointWrench,result.combinedFixedPointWrench)
  }
  const receiverInput={jambAxesXMm:[9297.5,10502.5],jambNormalFacesYMm:[222.5,402.5],jambAlongWidthMm:205,finishedWallYMm:429.5,
    sourceCage:{longitudinalDiameterMm:12,transverseDiameterMm:null,normalBarAxesMm:[260.5,364.5],alongBarOffsetsMm:[-32,32],requiredCoverMm:25},
    pipe:{outerDiameterMm:28,wallMm:1.2,stockMassKgM:.84},toolActionN:null,
    branches:candidate.branches.map((b,i)=>({id:b.branch,pipeAxisXMm:b.pressurePathMm[0][0],riserYMm:600,
      pressureEndForceN:b.support.blockedEndThrustN,fullyRestrainedThermalForceN:b.support.whollyRestrainedThermalForceN,knownStockMassKg:b.support.centrelineStockMassKg,
      lowerRepairCutZMm:b.repairZones[0].cutZMm,secondUpperRepairCutZMm:b.repairZones[1].secondPlainPipeCutZMm,
      guidedThermalActions:{fixedPointWrench:thermal[i].combinedFixedPointWrench,guideWrench:thermal[i].guideWrench}}))}
  const receiver=compareFixedInletReceiver(receiverInput,'guided-route')
  for(const axis of [0,1,2]){
    const noCouple=compareFixedInletReceiver({...receiverInput,branches:receiverInput.branches.map(b=>({...b,guidedThermalActions:{...b.guidedThermalActions,
      fixedPointWrench:{...b.guidedThermalActions.fixedPointWrench,momentComponentBoundsNmm:b.guidedThermalActions.fixedPointWrench.momentComponentBoundsNmm.map((m,k)=>k===axis?0:m)}}}))},'guided-route')
    const field=axis===0?'torsionalMomentEnvelopeNmm':axis===1?'verticalBendingMomentEnvelopeNmm':'normalBendingMomentEnvelopeNmm'
    assert.ok(receiver.actions.cases[0].railResults[0][field]>noCouple.actions.cases[0].railResults[0][field])
    assert.deepEqual(receiver.geometry,noCouple.geometry)
  }
  assert.equal(receiver.completeSupportCapacity,false)
  assert.ok(receiver.diagnostics.includes('SOURCE_JAMB_TRANSVERSE_SCHEDULE_UNRESOLVED'))
})

test('unlocated support elevations do not earn a thermal result',()=>{
  assert.throws(()=>compareFixedInletThermalRoute({pathMm:[[0,0,0],[0,0,1000],[500,0,1000]],fixedPointZMm:850,guideZMm:1650,temperatureExcursionK:40,pipe}),/actual straight ascending inlet riser/)
  assert.throws(()=>compareFixedInletThermalRoute({pathMm:[[0,0,0],[0,0,1000],[0,0,2000]],fixedPointZMm:850,guideZMm:1650,temperatureExcursionK:40,pipe:{...pipe,poissonRatio:.5}}),/positive supported pipe properties/)
  assert.throws(()=>compareFixedInletThermalRoute({pathMm:[[0,0,0],[0,0,NaN],[0,0,2000]],fixedPointZMm:850,guideZMm:1650,temperatureExcursionK:40,pipe}),/Actual finite tube route/)
})
