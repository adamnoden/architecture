import assert from 'node:assert/strict'
import test from 'node:test'
import {deriveCurrentHouse} from '../../project/had/studies/current-house.mjs'
import {readFileSync} from 'node:fs'
import {inletEntrySideCuts,inletIndoorCuts,indoorCutProductEvidence} from './current-design/inlet-indoor-cuts.js'
const read=(name:string)=>JSON.parse(readFileSync(new URL('../../project/had/studies/'+name,import.meta.url),'utf8'))
const current=read('inlet-source-envelope.results.json').joinedDirection,
  source=read('south-inlet-under-sill.json'),room=current.room,house=deriveCurrentHouse(),model=house.model??house,
  plantWall=model.groundWalls.find((w:any)=>w.id==='plant-intermediate-arch'),
  input={roomPlanMm:room.wetUtilityPlanMm,portalXMm:room.northOpeningXMm,wallFacesYMm:room.northWallFacesYMm,
    jambFinishMm:27,shieldPlaneXMm:room.electricalScreen.barrierPlaneMm.x,
    washerFirstRestMm:[10076,1500,598,600],maintenancePlanMm:room.maintenanceFields[0].platform,
    maintenanceTopMm:3100,operatorXYZMm:[10650,2430,1450],
    frameCoversMm:room.electricalScreen.supportFrame.connections.filter((c:any)=>c.wallId==='utility-north').map((c:any)=>c.oppositeCoverEnvelopeMm),
    bankXMm:11350,bankYMm:2350,utilityAxisZMm:1350,plantAxisZMm:1860,maintenanceShiftXMm:-100,maintenanceShiftYMm:-20,wheelInboardMm:40,
    utilityLmin:20,plantLmin:45,maximumGaugeBar:9,groundFflMm:0,
    plantWall:{facesYMm:plantWall.finishedFaces,openingXMm:plantWall.holes[0]},
    retainedFurniture:{...room.retainedFurniture,...Object.fromEntries(Object.entries(model.groundFurniture).filter(([k])=>/plant-water|plant-riser|plant-controls|plant-primary-buffer|service-emitter-plant/.test(k)))},
    protectedDoorOpenLeafMm:model.plantReferenceDoor.fullyOpenEastLeaf} as Parameters<typeof inletEntrySideCuts>[0]
test('doorway controls retain the300mm body and650mm reach with the actual washer rest occupied',()=>{
  const r=inletEntrySideCuts(input)
  assert.equal(r.necessaryOrdinaryOperationEnvelopeScreen,true)
  assert.deepEqual(r.diagnostics,[])
  assert.ok(r.ordinaryOperator.connectedWallAndOpenLeafAfterSettingMm>12.99)
  assert.ok(r.ordinaryOperator.occupiedWasherRestAfterSettingMm>19.99)
  assert.ok(r.valves.every(v=>v.maximumGripReachMm<650))
  assert.ok(r.valves.every(v=>v.minimumFixedFrameCoverAfterSettingMm>0))
  assert.ok(r.valves.every(v=>v.minimumSourceMaintenanceAfterSettingMm<0))
  assert.ok(r.valves.every(v=>v.minimumMovedMaintenanceAfterSettingMm>14))
  assert.deepEqual(r.sourceMaintenancePlanMm.slice(2),r.candidateMaintenancePlanMm.slice(2))
  assert.equal(r.door.necessaryDoorEventScreen,true)
  assert.ok(r.door.continuousBoundsMm.maximumReachMm<650)
  assert.ok(Object.entries(r.door.continuousBoundsMm).filter(([k])=>k!=='maximumReachMm').every(([,v])=>v>0))
  assert.ok(r.door.connectedAfterMm>17.9)
  assert.equal(r.fullOccupiedArrangementComplete,false)
  assert.equal(r.ordinaryOperator.closedToOpenDoorOperatorRouteQualified,false)
  assert.equal(r.selectedProduct,false)
  assert.ok(r.valves.every(v=>v.actualWheelCentreFitsAuthoredEnvelopeVerified===false))
  assert.equal(r.sourceAndBackfeed.sourceFaultAperturesAnd327LminEnvelopeChanged,false)
})
test('the actual narrow jamb, wheel plane and full maintenance field invalidate convenient local passes',()=>{
  assert.equal(inletEntrySideCuts({...input,maintenanceShiftXMm:0,maintenanceShiftYMm:0}).necessaryOrdinaryOperationEnvelopeScreen,false)
  assert.equal(inletEntrySideCuts({...input,operatorXYZMm:[10650,2600,1450]}).necessaryOrdinaryOperationEnvelopeScreen,false)
  assert.equal(inletEntrySideCuts({...input,wheelInboardMm:80}).necessaryOrdinaryOperationEnvelopeScreen,false)
  assert.ok(inletEntrySideCuts({...input,portalXMm:[10250,11150]}).door.diagnostics.includes('wet-door/shieldMm'))
  const changed=inletEntrySideCuts({...input,plantLmin:50}),base=inletEntrySideCuts(input)
  assert.ok(changed.valves[1].fullyOpenKv12ComparisonLossBar>base.valves[1].fullyOpenKv12ComparisonLossBar)
  assert.deepEqual(changed.valves[0],base.valves[0])
  assert.throws(()=>inletEntrySideCuts({...input,maximumGaugeBar:NaN}),/Unsupported/)
})
test('retain the rejected west trial actual crossing instead of crediting a standing point as complete access',()=>{
  const r=inletIndoorCuts({roomPlanMm:room.wetUtilityPlanMm,washerPlanMm:[10076,800,598,600],washerHeightMm:848,
    washerFirstRestPlanMm:input.washerFirstRestMm,maintenancePlanMm:input.maintenancePlanMm,
    maintenanceTopMm:3100,nominalCeilingMm:3100,utilitySourcePathMm:source.branches[0].coordinates,
    plantSourcePathMm:source.branches[1].coordinates,plantTransferStartMm:current.transfer.pathMm[0],
    bankXMm:9680,bankYMm:1750,utilityAxisZMm:1050,plantAxisZMm:1450,utilityDutyLmin:20,plantDutyLmin:45,maximumTotalGaugeBar:9})
  assert.ok(r.operator.bodyChecks.every(b=>Object.values(b.afterSettingMm).every(v=>v>0)))
  assert.equal(r.necessaryEnvelopeScreen,false)
  assert.ok(r.diagnostics.includes('independent-route-collision'))
  assert.equal(r.connectedWasherRestAccessQualified,false)
  assert.equal(indoorCutProductEvidence.bellows.actualPotableQualification,false)
  assert.match(indoorCutProductEvidence.ordinaryPotable.defaultMaterialPolicyDisposition,/excluded/)
})

test('saved ground FFL maps the exact local valve/door geometry without adopting a raised force source',()=>{
  const base=inletEntrySideCuts(input),raised=inletEntrySideCuts({...input,groundFflMm:530})
  assert.deepEqual(base.valves,raised.valves)
  assert.deepEqual(raised.groundStage.absoluteValveAxesMm,[[11350,2350,1880],[11350,2350,2390]])
  assert.equal(raised.groundStage.adoptedInNativeStructure,false)
  assert.equal(inletEntrySideCuts({...input,plantWall:{...input.plantWall,openingXMm:[9650,10600]}}).door.necessaryDoorEventScreen,false)
})
