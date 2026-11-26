import assert from 'node:assert/strict'
import test from 'node:test'
import {inletOpenClosedOutfall,supercriticalOutfallProfile,type OpenClosedOutfallInput} from './current-design/inlet-open-closed-outfall.js'
const route:OpenClosedOutfallInput={id:'independent-East-route',maximumLmin:327.403857,mouthXYZMm:[11310.5,4345,318],closedClearCornersMm:[[11570.5,4145,312.8],[11570.5,4545,312.8],[12990,4545,284.41],[12990,4145,284.41],[11570.5,4145,452.8],[11570.5,4545,452.8],[12990,4545,424.41],[12990,4145,424.41]],openChuteClearWidthMm:400,openChuteSlopeRatio:50,indoorCoverUndersideMm:501,settingEachMm:10,receiverWaterMm:-50,outletState:'one-surviving-free-outlet'}
test('uniform steep normal-flow analytic oracle closes the forward standard-step energy equation',()=>{
 const q=.002,b=.2,y=.02,n=.015,v=q/(b*y),radius=b*y/(b+2*y),slope=n*n*v*v/radius**(4/3),p=supercriticalOutfallProfile({qLmin:q*60000,effectiveWidthMm:b*1000,lengthMm:1400,slope,inletDepthMm:y*1000,stationsMm:[260],steps:32})
 assert.equal(p.state,'resolved-supercritical-profile');assert.ok(p.points.every(r=>Math.abs(r.depthMm-20)<1e-8));assert.ok(p.points.every(r=>r.froude>1))
 const mild=supercriticalOutfallProfile({qLmin:120,effectiveWidthMm:200,lengthMm:1400,slope:.00001,inletDepthMm:20,stationsMm:[260],steps:32})
 assert.equal(mild.state,'unsupported-supercritical-profile');assert.equal(mild.points.length,0)
})
test('actual open mouth and downstream roof support a different domain than a uniform pool crown',()=>{
 const r=inletOpenClosedOutfall(route)
 assert.equal(r.state,'actual-route-free-surface-comparison');assert.equal(r.necessaryActualFreeSurfaceScreen,true)
 assert.equal(r.geometry!.openLengthMm,260);assert.ok(r.minimumClosedRoofAirReserveMm!>40);assert.ok(r.minimumIndoorCoverAirReserveMm!>15)
 assert.ok(r.requiredReservoirStageMm!>318+140-15+10,'Old uniform pool/crown screen is still negative')
 assert.equal(r.uniformPoolAtOpenMouthBelowClosedHeightIsRequired,false);assert.equal(r.pressureOrSubmergedFlowCredit,false)
 assert.ok(r.convergenceChangeMm!<=.01);assert.ok(r.coarseConvergenceChangeMm!<=.04)
 const shifted=inletOpenClosedOutfall({...route,mouthXYZMm:route.mouthXYZMm.map((v,k)=>v+[500,-400,200][k]),closedClearCornersMm:route.closedClearCornersMm.map(p=>p.map((v,k)=>v+[500,-400,200][k])),indoorCoverUndersideMm:701,receiverWaterMm:150})
 assert.ok(Math.abs(shifted.requiredReservoirStageMm!-r.requiredReservoirStageMm!-200)<1e-8);assert.ok(Math.abs(shifted.minimumClosedRoofAirReserveMm!-r.minimumClosedRoofAirReserveMm!)<1e-8)
})
test('stored sensitivity, low roof, broken join and high/blocked receiver never inherit a free-channel pass',()=>{
 const hot=inletOpenClosedOutfall({...route,maximumLmin:1808.1869319144914});assert.equal(hot.necessaryActualFreeSurfaceScreen,false)
 const low=inletOpenClosedOutfall({...route,closedClearCornersMm:route.closedClearCornersMm.map((p,k)=>p.map((v,j)=>j===2&&k>=4?v-60:v))});assert.equal(low.necessaryActualFreeSurfaceScreen,false)
 const broken=inletOpenClosedOutfall({...route,mouthXYZMm:[11320.5,4345,318]});assert.equal(broken.state,'unsupported-actual-route')
 for(const r of[{...route,outletState:'blocked' as const},{...route,outletState:'high-or-submerged' as const},{...route,receiverWaterMm:500}]){const p=inletOpenClosedOutfall(r);assert.equal(p.necessaryActualFreeSurfaceScreen,false);assert.equal(p.refinements.length,0)}
 const roofAtMouth=inletOpenClosedOutfall({...route,mouthXYZMm:[11570.5,4345,312.8]});assert.equal(roofAtMouth.state,'unsupported-actual-route')
})
test('sparse or absent geometry cannot enter the free-surface method',()=>{
 for(const bad of [{...route,mouthXYZMm:Array(3)},{...route,closedClearCornersMm:Array(8)},{...route,closedClearCornersMm:null}])assert.throws(()=>inletOpenClosedOutfall(bad as unknown as OpenClosedOutfallInput),/Unsupported/)
 const r=inletOpenClosedOutfall(route)
 assert.ok(Math.abs(r.refinements[2].profile.points.find(p=>p.sMm===260)!.depthMm-36.381891575)<.004,'Independent quadrature of dx/dy=(1-Fr²)/(S0-Sf), at the actual roof, within this specimen comparison only')
})
test('saved separate rooms propagate their actual roof geometry without admitting a connected suite',async()=>{
 const {readCurrentDesignResolution}=await import('./current-design/resolve.js'),{readGeorgianDesignSnapshot}=await import('./current-design/georgian-source.js'),{readInletSourceEnvelopeCase,readLocalUtilityPocketSettings}=await import('./current-design/inlet-source-envelope.js'),{readGroundSectionCase}=await import('./current-design/structural-ground.js'),{readEngineeringDocument,compileEngineeringDocument}=await import('./current-design/engineering-document.js'),
 resolved=readCurrentDesignResolution(),request=readInletSourceEnvelopeCase(resolved),ground=readGroundSectionCase(resolved),base=await readEngineeringDocument(readGeorgianDesignSnapshot()),doc={...base,stages:{groundSection:{caseId:ground.ground.caseId,settings:ground.ground.settings},inletSourceEnvelope:{...readLocalUtilityPocketSettings(),splitPlantRoom:request.sourceEnvelope.splitPlantRoom}}},compiled=await compileEngineeringDocument(doc),inlet=compiled.engineering.inletSourceEnvelope!,profiles=inlet.outfallProfiles
 assert.ok(profiles.utility&&profiles.plant)
 assert.ok(profiles.utility.sourceOnly.every(r=>r.necessaryActualFreeSurfaceScreen))
 assert.ok(profiles.plant.sourceOnly.every(r=>r.necessaryActualFreeSurfaceScreen))
 assert.ok(profiles.plant.combinedColdStress.every(r=>r.minimumClosedRoofAirReserveMm!>50))
 assert.ok(profiles.plant.highReceiver.every(r=>!r.necessaryActualFreeSurfaceScreen&&r.refinements.length===0))
 assert.ok(profiles.plant.blocked.every(r=>!r.necessaryActualFreeSurfaceScreen))
 assert.equal(profiles.installedAcceptance,false)
 assert.ok(profiles.utility.sourceOnly.every(r=>r.maximumLmin===inlet.bound.branchMaximumsLmin.utility))
 assert.ok(profiles.plant.sourceOnly.every(r=>r.maximumLmin===inlet.bound.branchMaximumsLmin.plant))
 const higher=structuredClone(doc);higher.stages.inletSourceEnvelope.splitPlantRoom.clearHeightMm+=10
 const changed=await compileEngineeringDocument(higher),after=changed.engineering.inletSourceEnvelope!
 assert.ok(Math.abs(after.outfallProfiles.plant!.sourceOnly[0].minimumClosedRoofAirReserveMm!-profiles.plant.sourceOnly[0].minimumClosedRoofAirReserveMm!-10)<1e-8)
 assert.deepEqual(after.outfallProfiles.utility,profiles.utility)
 assert.deepEqual(after.bound,inlet.bound);assert.deepEqual(changed.engineering.groundSection,compiled.engineering.groundSection)
 assert.notEqual(changed.documentIdentity.digest,compiled.documentIdentity.digest)
})
