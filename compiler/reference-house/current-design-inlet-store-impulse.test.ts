import assert from 'node:assert/strict'
import test from 'node:test'
import {inletStoreImpulseBarrier,type StoreImpulseInput} from './current-design/inlet-store-impulse.js'
const tank:StoreImpulseInput={planMm:[0,0,2000,1000],exclusions:[],panHighestAfterIndependentSettingMm:50,initialStageMm:100,safeStageMm:300,sourceLmin:10,minimumOutflowAtAndAboveInitialLmin:10,outletState:'free-surviving-outlet',additionalUnrepresentedDisplacementLitres:0,completeMaximumFiniteReleaseLitres:400}
test('rectangular tank analytic constant-source/constant-outflow oracle gives the exact impulse boundary',()=>{
 const r=inletStoreImpulseBarrier(tank)
 // Two square metres, 0.2m rise: 0.4m³. Equal constant inflow/outflow
 // leaves an instantaneous400L release on that boundary for every later t.
 assert.equal(r.conditionalMaximumInventoryLitres,400);assert.equal(r.conditionalInventoryScreen,true)
 const excess=inletStoreImpulseBarrier({...tank,completeMaximumFiniteReleaseLitres:400.001})
 assert.equal(excess.conditionalInventoryScreen,false)
 assert.equal(r.installedContainmentAccepted,false)
})
test('overlapping object footprints reserve their union once and extra displacement consumes the actual cap',()=>{
 const r=inletStoreImpulseBarrier({...tank,exclusions:[{id:'A',planMm:[0,0,500,1000]},{id:'B',planMm:[250,0,500,1000]}],additionalUnrepresentedDisplacementLitres:20,completeMaximumFiniteReleaseLitres:230})
 assert.equal(r.excludedAreaM2,.75);assert.equal(r.afterKnownExclusionsCapLitres,250);assert.equal(r.conditionalMaximumInventoryLitres,230);assert.equal(r.conditionalInventoryScreen,true)
 assert.equal(inletStoreImpulseBarrier({...r.resolvedInput,completeMaximumFiniteReleaseLitres:231}).conditionalInventoryScreen,false)
 const second=inletStoreImpulseBarrier({...tank,planMm:[4000,-2000,1000,1000],initialStageMm:200,safeStageMm:500,panHighestAfterIndependentSettingMm:150,completeMaximumFiniteReleaseLitres:300})
 assert.equal(second.conditionalMaximumInventoryLitres,300);assert.equal(second.conditionalInventoryScreen,true)
})
test('changed stage/source duty and adverse unavailable outlets cannot retain a storage assurance',()=>{
 assert.equal(inletStoreImpulseBarrier({...tank,safeStageMm:250}).conditionalMaximumInventoryLitres,300)
 assert.equal(inletStoreImpulseBarrier({...tank,initialStageMm:150}).conditionalMaximumInventoryLitres,300)
 for(const x of[{...tank,sourceLmin:11},{...tank,outletState:'both-blocked' as const},{...tank,outletState:'submerged-or-unqualified' as const}]){
  const r=inletStoreImpulseBarrier(x);assert.equal(r.afterKnownExclusionsCapLitres,0);assert.equal(r.conditionalInventoryScreen,false)
  assert.ok(r.diagnostics.includes('STORE_IMPULSE/no-continuous-source-drain-barrier'))
 }
 const dry=inletStoreImpulseBarrier({...tank,panHighestAfterIndependentSettingMm:101});assert.equal(dry.wettedDomain,false);assert.equal(dry.conditionalInventoryScreen,false)
})
test('missing complete inventory or floor displacement remains unknown and malformed ownership rejects',()=>{
 const missing=inletStoreImpulseBarrier({...tank,additionalUnrepresentedDisplacementLitres:null,completeMaximumFiniteReleaseLitres:null})
 assert.equal(missing.afterKnownExclusionsCapLitres,400);assert.equal(missing.conditionalMaximumInventoryLitres,null);assert.equal(missing.conditionalInventoryScreen,null)
 assert.equal(missing.diagnostics.length,2)
 for(const x of[{...tank,completeMaximumFiniteReleaseLitres:NaN},{...tank,additionalUnrepresentedDisplacementLitres:-1},{...tank,exclusions:[{id:'same',planMm:[0,0,10,10] as const},{id:'same',planMm:[20,20,10,10] as const}]}])assert.throws(()=>inletStoreImpulseBarrier(x),/Unsupported/)
 const before=JSON.stringify(tank);inletStoreImpulseBarrier(tank);assert.equal(JSON.stringify(tank),before)
})
test('current saved Plant choice recomputes the impulse cap without borrowing catalogue litres or changing Utility',async()=>{
 const {readCurrentDesignResolution}=await import('./current-design/resolve.js'),{readGeorgianDesignSnapshot}=await import('./current-design/georgian-source.js'),
  {readInletSourceEnvelopeCase,readLocalUtilityPocketSettings}=await import('./current-design/inlet-source-envelope.js'),{readGroundSectionCase}=await import('./current-design/structural-ground.js'),
  {readEngineeringDocument,compileEngineeringDocument}=await import('./current-design/engineering-document.js'),
  resolved=readCurrentDesignResolution(),request=readInletSourceEnvelopeCase(resolved),ground=readGroundSectionCase(resolved),base=await readEngineeringDocument(readGeorgianDesignSnapshot()),
  doc={...base,stages:{roofPitch:base.stages.roofPitch,groundSection:{caseId:ground.ground.caseId,settings:ground.ground.settings},inletSourceEnvelope:{...readLocalUtilityPocketSettings(),splitPlantRoom:request.sourceEnvelope.splitPlantRoom}}},
  before=await compileEngineeringDocument(JSON.parse(JSON.stringify(doc))),changed=structuredClone(doc)
 changed.stages.inletSourceEnvelope.splitPlantRoom.clearHeightMm+=10
 const after=await compileEngineeringDocument(changed),a=before.engineering.inletSourceEnvelope!,b=after.engineering.inletSourceEnvelope!,pa=a.splitPlantRoom.comparison!,pb=b.splitPlantRoom.comparison!
 if(pa.state!=='unadopted-threshold-drainage-successor'||pb.state!=='unadopted-threshold-drainage-successor')throw Error('Actual saved Plant ground required')
 assert.ok(pa.storedImpulse.conditionalGeometricCapAfterKnownExclusionsLitres>0)
 assert.ok(pa.storedImpulse.conditionalGeometricCapAfterKnownExclusionsLitres<300)
 assert.ok(pb.storedImpulse.conditionalGeometricCapAfterKnownExclusionsLitres>pa.storedImpulse.conditionalGeometricCapAfterKnownExclusionsLitres)
 assert.equal(pa.storedImpulse.settingCases[0].comparison.conditionalInventoryScreen,null)
 assert.equal(pa.storedImpulse.settingCases[0].comparison.conditionalMaximumInventoryLitres,null)
 assert.equal(pa.storedImpulse.knownChannelAndBridgeGeometryScreen,true)
 assert.equal(pb.storedImpulse.knownChannelAndBridgeGeometryScreen,false,'A taller hydraulic section must still charge its real bridge collision')
 assert.equal(inletStoreImpulseBarrier({...pa.storedImpulse.settingCases[0].comparison.resolvedInput,additionalUnrepresentedDisplacementLitres:0,completeMaximumFiniteReleaseLitres:300}).conditionalInventoryScreen,false,'300L is an explicit challenge, never an inferred maximum inventory')
 assert.equal(pa.storedImpulse.bothBlocked.afterKnownExclusionsCapLitres,0);assert.equal(pa.storedImpulse.highSubmerged.afterKnownExclusionsCapLitres,0)
 assert.equal(pa.storedImpulse.steadySourcePlusStoreAdverseRejected,true);assert.equal(a.preSiteArrangementComplete,false)
 assert.deepEqual(a.bound,b.bound);assert.deepEqual(a.roomCatchment,b.roomCatchment);assert.deepEqual(a.joinedDirection,b.joinedDirection)
 assert.deepEqual(before.engineering.groundSection,after.engineering.groundSection);assert.deepEqual(before.engineering.roofPitch,after.engineering.roofPitch)
 const {inletSplitPlantRoom}=await import('./current-design/inlet-split-plant-room.js'),bounds=pa.storedImpulse.retainedGeometryBounds,
  upperInput=structuredClone(pa.resolvedInput)
 assert.equal(bounds.clearWidthUpperMm,401);assert.equal(bounds.clearHeightUpperMm,139)
 upperInput.choice.clearWidthMm=bounds.clearWidthUpperMm;upperInput.choice.clearHeightMm=bounds.clearHeightUpperMm
 const upper=inletSplitPlantRoom(upperInput)
 if(upper.state!=='unadopted-threshold-drainage-successor')throw Error('Actual saved Plant ground required')
 assert.equal(upper.storedImpulse.knownChannelAndBridgeGeometryScreen,true)
 assert.ok(upper.storedImpulse.conditionalGeometricCapAfterKnownExclusionsLitres<300)
 for(const field of ['clearWidthMm','clearHeightMm'] as const){const over=structuredClone(upperInput);over.choice[field]++
  const rejected=inletSplitPlantRoom(over);if(rejected.state!=='unadopted-threshold-drainage-successor')throw Error('Actual saved Plant ground required')
  assert.equal(rejected.storedImpulse.knownChannelAndBridgeGeometryScreen,false)
 }
 assert.ok(pa.storedImpulse.generousWholeRawArchControl.grossImpulseCapLitres<300)
 assert.equal(pa.storedImpulse.generousWholeRawArchControl.constructibleArrangement,false)
 const pressure=structuredClone(doc);pressure.stages.inletSourceEnvelope.sourceMaximumTotalBar+=1
 const adverse=await compileEngineeringDocument(pressure),p=adverse.engineering.inletSourceEnvelope!.splitPlantRoom.comparison!
 if(p.state!=='unadopted-threshold-drainage-successor')throw Error('Actual saved Plant ground required')
 assert.ok(p.storedImpulse.conditionalGeometricCapAfterKnownExclusionsLitres<pa.storedImpulse.conditionalGeometricCapAfterKnownExclusionsLitres)
})
