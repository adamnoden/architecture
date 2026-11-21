import assert from 'node:assert/strict'
import test from 'node:test'
import {inletScreenFrame} from './current-design/inlet-screen-frame.js'
import {inletElectricalScreen} from './current-design/inlet-electrical-screen.js'
const base={planeXMm:11090.5,board:[11190.5,2897,900,380,610,605],panelY:[2652,3598],panelZ:[50,3050],sheetKg:90.816,sourceReversalN:457.7686006627,
 lowerConnectionZMm:1100,anchorOffsetMm:89.5,clearHeightMm:3100,panelCount:8,walls:[
  {id:'utility-north',coreY:[2480,2620],finishesY:[2453,2647],portalX:[10150,11050]},
  {id:'plant-intermediate-arch',coreY:[3630,3770],finishesY:[3603,3797],portalX:[9650,10925]}]}
test('finite wall-hung frame closes its actual stock ledger and exports named core-origin demands without floor credit',()=>{
 const r=inletScreenFrame(base)
 assert.equal(r.staticComparison.necessaryStaticSteelScreen,true)
 assert.ok(r.staticComparison.boardReserveAfter10AndDeflectionMm>20)
 assert.ok(r.staticComparison.postStressMpa<r.staticComparison.allowableMpa)
 assert.equal(r.connections.length,4)
 assert.ok(r.connections.every(c=>c.coreDepthMm===140&&c.rods.length===4&&!c.floorDpcOrLinerAnchor))
 assert.ok(r.connections.every(c=>c.minimumCoreEdgeAfterPlateAnd10Mm>=45))
 assert.ok(r.members.filter(m=>m.id.includes('core-spacer')).length===32)
 assert.equal(r.structuralHandoff.physicalInterfaces.length,4)
 assert.ok(r.structuralHandoff.physicalInterfaces.every(p=>p.forceComponentBoundsN.length===3&&p.momentComponentBoundsNmm.length===3))
 const expected=base.sheetKg+r.members.reduce((n,m)=>n+m.massKg,0)+r.quantities.panelSeatKg+r.quantities.boltWasherNutBudgetKg
 assert.ok(Math.abs(r.quantities.totalReferenceKg-expected)<1e-10)
 assert.equal(r.structuralHandoff.exactMasonryReceiverAnd52HeadModelUpdated,false)
 assert.equal(r.selected,false)
})
test('the former25mm gap and an increased fault action reject rather than borrowing a fitted frame',()=>{
 const tight=inletScreenFrame({...base,planeXMm:11165.5})
 assert.equal(tight.staticComparison.necessaryStaticSteelScreen,false)
 assert.ok(tight.staticComparison.boardReserveAfter10AndDeflectionMm<0)
 const longArm=inletScreenFrame({...base,anchorOffsetMm:189.5})
 assert.equal(longArm.staticComparison.necessaryStaticSteelScreen,false,'The full My torsional shear must reject the long arm')
 assert.ok(longArm.staticComparison.boltCombinedMpa>longArm.staticComparison.allowableMpa)
 const adverse=inletScreenFrame({...base,sourceReversalN:base.sourceReversalN*2})
 assert.equal(adverse.staticComparison.necessaryStaticSteelScreen,false)
 assert.deepEqual(adverse.members,inletScreenFrame(base).members)
 assert.throws(()=>inletScreenFrame({...base,lowerConnectionZMm:NaN}),/Invalid/)
})
test('finite floating sheet bounds cover every conservative portal-to-case ray with source settings; unmoved portal or board rejects',()=>{
 const input={boardBoxMm:base.board,lobbyYMm:[2647,3603],portalMinimumXMm:[10150,9650],portalMaximumXMm:[11050,10925],
 clearHeightMm:3100,ordinaryBody:{axisXMm:10545,radiusMm:300},fullReversalUpperN:[133.2469,324.5217],standOffMm:100,horizontalInsetMm:5,verticalInsetMm:50}
 const r=inletElectricalScreen(input)
 assert.equal(r.visibility.necessaryInterceptionAfterSettings,true)
 assert.ok(r.visibility.afterTwo5MmSettings!.every(v=>v>0))
 assert.equal(r.panels.length,8)
 assert.deepEqual(r.barrierPlaneMm.z,[50,3050])
 assert.equal(inletElectricalScreen({...input,portalMaximumXMm:[11150,10925]}).visibility.allDirectPortalRaysIntercepted,false)
 assert.equal(inletElectricalScreen({...input,boardBoxMm:[11190.5,2647,900,380,610,605]}).visibility.allDirectPortalRaysIntercepted,false)
})
