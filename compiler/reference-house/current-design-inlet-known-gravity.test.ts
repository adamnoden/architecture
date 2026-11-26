import assert from 'node:assert/strict'
import test from 'node:test'
import {normalizeKnownGravity,type GravityReference} from './current-design/inlet-known-gravity.js'
const global:GravityReference={id:'independent1000kg',force:[0,0,-9810],forceUnit:'N',moment:[-29430,19620,0],momentUnit:'Nm',wrenchOriginXYZMm:[0,0,0],applicationXYZMm:[2000,3000,4000],referenceCentre:true,massKg:1000,gravityMps2:9.81,basis:'independent uniform mass',datum:'absolute test datum',event:'G'}
test('kg/N/global-Nm normalize to kN/kNmm without duplicating the orbital moment',()=>{
 const r=normalizeKnownGravity(global)
 assert.deepEqual(r.pointLoadKN_KNmm,[0,0,-9.81,0,0,0])
 assert.deepEqual(r.globalWrenchAtZeroKN_KNm,[0,0,-9.81,-29.43,19.62,0])
 assert.equal(r.eligibleForNativeSTRTransfer,false)
 assert.throws(()=>normalizeKnownGravity({...global,wrenchOriginXYZMm:global.applicationXYZMm}),/duplicated orbital moment/)
 assert.throws(()=>normalizeKnownGravity({...global,force:[0,0,-9.81]}),/does not match/)
})
test('already-kN/kNm rows preserve gravity and integrated force-density rows are never converted through kg',()=>{
 const source={...global,id:'200kg',force:[0,0,-1.962],forceUnit:'kN' as const,moment:[-.981,.981,0],momentUnit:'kNm' as const,wrenchOriginXYZMm:[1000,2000,-180],applicationXYZMm:[1500,2500,70],massKg:200},r=normalizeKnownGravity(source)
 assert.deepEqual(r.pointLoadKN_KNmm,[0,0,-1.962,0,0,0]);assert.deepEqual(r.globalWrenchAtZeroKN_KNm,[0,0,-1.962,-4.905,2.943,0])
 const forceDensity=normalizeKnownGravity({...source,id:'one-cubic-metre-RC',force:[0,0,-25],moment:[0,0,0],wrenchOriginXYZMm:[1500,2500,-180],massKg:null,gravityMps2:null,basis:'25kN/m³ ×1m³'})
 assert.equal(forceDensity.forceKN[2],-25);assert.equal(forceDensity.massKg,null)
 assert.deepEqual(forceDensity.intrinsicMomentKNmm,[0,0,0])
 assert.equal(normalizeKnownGravity({...source,id:'native-steel-force-density',force:[0,0,-78.5],moment:[0,0,0],wrenchOriginXYZMm:source.applicationXYZMm,massKg:null,gravityMps2:null,basis:'78.5kN/m³ ×1m³ native convention'}).forceKN[2],-78.5)
 const shifted=normalizeKnownGravity({...global,wrenchOriginXYZMm:[0,0,-530],applicationXYZMm:[2000,3000,3470]})
 assert.deepEqual(shifted.globalWrenchAtZeroKN_KNm,normalizeKnownGravity(global).globalWrenchAtZeroKN_KNm)
})
test('horizontal/pressure/yaw, malformed and duplicate-unit inputs cannot enter a gravity overlay',()=>{
 for(const row of [{...global,force:[1,0,-9810]},{...global,moment:[-29430,19620,1]},{...global,force:[0,0,9810]},{...global,applicationXYZMm:[NaN,0,0]},{...global,momentUnit:'Nmm'}])assert.throws(()=>normalizeKnownGravity(row as GravityReference),/Gravity normalizer|Unsupported/)
 const before=JSON.stringify(global);normalizeKnownGravity(global);assert.equal(JSON.stringify(global),before,'Normalizer does not mutate authored input')
})
test('saved inlet model emits separate current component references, finite receiver footprints and explicit unsupported transfer',async()=>{
 const {readCurrentDesignResolution}=await import('./current-design/resolve.js'),{readGeorgianDesignSnapshot}=await import('./current-design/georgian-source.js'),{readInletSourceEnvelopeCase,readLocalUtilityPocketSettings}=await import('./current-design/inlet-source-envelope.js'),{readGroundSectionCase}=await import('./current-design/structural-ground.js'),{readEngineeringDocument,compileEngineeringDocument}=await import('./current-design/engineering-document.js'),
  resolved=readCurrentDesignResolution(),request=readInletSourceEnvelopeCase(resolved),ground=readGroundSectionCase(resolved),base=await readEngineeringDocument(readGeorgianDesignSnapshot()),doc={...base,stages:{roofPitch:base.stages.roofPitch,groundSection:{caseId:ground.ground.caseId,settings:ground.ground.settings},inletSourceEnvelope:{...readLocalUtilityPocketSettings(),splitPlantRoom:request.sourceEnvelope.splitPlantRoom,wetServiceSuite:request.sourceEnvelope.wetServiceSuite}}},result=await compileEngineeringDocument(doc),ledger=result.engineering.inletSourceEnvelope!.knownGravityInventory
 assert.equal(ledger.activeAssemblySelected,false);assert.equal(ledger.combinedInstalledMassKg,null);assert.equal(ledger.actualMaximumRetainedWaterKg,null);assert.equal(ledger.combinedNativeNodalLoads,null)
 assert.equal(ledger.datum.savedGroundFflMm,530);assert.equal(ledger.datum.coldGridTopMm,-180);assert.equal(ledger.datum.nominalFrameFflMm,0)
 assert.equal(ledger.datum.rigidWholeInventoryZTransformApplied,false)
 const rows=ledger.groups.flatMap(g=>g.rows);assert.equal(new Set(rows.map(r=>r.id)).size,rows.length)
 const branch=ledger.groups.find(g=>g.id==='HAD/plant/independent-branch-reference')!,valve=branch.rows.find(r=>r.id==='HAD/plant/nominal-valve-reference')!
 assert.equal(valve.forceKN[2],-.05886);assert.ok(valve.intrinsicMomentKNmm.every(v=>Math.abs(v)<1e-9))
 assert.ok(Math.abs(branch.rows.reduce((s,r)=>s-r.forceKN[2],0)-.3947797202554922)<1e-9)
 const threshold=ledger.groups.find(g=>g.id==='HAD/plant/threshold-piece-reference')!
 assert.ok(Math.abs(threshold.rows.reduce((s,r)=>s+r.massKg!,0)-145.34278)<1e-8,'Actual joint gaps are removed from cut sheet reference; gross slab not added again')
 assert.equal(threshold.rows[0].applicationXYZMm[2],515.5)
 const floor=ledger.groups.find(g=>g.id==='HAD/utility/local-floor-force-density')!
 assert.ok(Math.abs(floor.rows.reduce((s,r)=>s-r.forceKN[2],0)-25.00609925)<1e-8);assert.ok(floor.rows.every(r=>r.massKg===null&&r.gravityMps2===null))
 const body=ledger.structuralFloorBodies.find(b=>b.id==='HAD/local-utility-service-pocket')!
 assert.deepEqual(body.rcRectangleXYMm,[9447,479.5,11520.5,2403]);assert.deepEqual(body.rcZMm,[-30,170]);assert.deepEqual(body.mineralZMm,[-180,-30])
 assert.equal(body.rcUnitWeightKNPerM3,25);assert.equal(body.mineralUnitWeightKNPerM3,20);assert.equal(body.materialElasticModulusMPa,null)
 assert.equal(body.sourceObjectDigest.length,64);assert.equal(body.source.groundCaseDigest,ledger.source.groundCaseDigest)
 assert.ok(Math.abs(body.independentKnownGravity.rcGKN-2073.5*1923.5*200/1e9*25)<1e-9)
 assert.ok(Math.abs(body.independentKnownGravity.mineralGKN-1.688071*.15*20)<1e-9)
 assert.ok(Math.abs(body.independentKnownGravity.combinedGlobalWrenchAtZeroKN_KNm[2]+25.00609925)<1e-9)
 assert.equal(body.requiredUnrepresentedPlinthMm,0);assert.equal(body.receiverReactions,null)
 assert.ok(ledger.groups.find(g=>g.id==='HAD/wet-suite/gutter-stock-delta')!.unknowns.some(s=>s.includes('overlaps')))
 assert.ok(rows.every(r=>r.receiverReactions===null&&!r.eligibleForNativeSTRTransfer))
 const changed=structuredClone(doc);changed.stages.inletSourceEnvelope.pipeJacketDensityComparisonKgM3+=100
 const second=await compileEngineeringDocument(changed),other=second.engineering.inletSourceEnvelope!.knownGravityInventory,
  changedBranch=other.groups.find(g=>g.id===branch.id)!
 assert.ok(changedBranch.rows.reduce((s,r)=>s-r.forceKN[2],0)>branch.rows.reduce((s,r)=>s-r.forceKN[2],0))
 assert.deepEqual(other.groups.find(g=>g.id===floor.id),floor);assert.deepEqual(second.engineering.groundSection,result.engineering.groundSection);assert.deepEqual(second.engineering.roofPitch,result.engineering.roofPitch)
 assert.notEqual(other.source.inletCaseDigest,ledger.source.inletCaseDigest)
 assert.deepEqual(other.structuralFloorBodies.map(({source,...body})=>body),ledger.structuralFloorBodies.map(({source,...body})=>body))
 const higher=structuredClone(doc);higher.stages.groundSection.settings={...higher.stages.groundSection.settings,courseBottomMm:Number(higher.stages.groundSection.settings.courseBottomMm)+20}
 const raised=await compileEngineeringDocument(higher),raisedLedger=raised.engineering.inletSourceEnvelope!.knownGravityInventory,
  raisedBody=raisedLedger.structuralFloorBodies.find(b=>b.id===body.id)!
 assert.deepEqual(raisedBody.rcZMm,[-10,190]);assert.equal(raisedBody.profile.fflMm,550);assert.equal(raisedBody.profile.coldGridTopMm,-180)
 assert.equal(raisedBody.requiredUnrepresentedPlinthMm,20);assert.notEqual(raisedBody.sourceObjectDigest,body.sourceObjectDigest)
 assert.notEqual(raisedBody.source.groundCaseDigest,body.source.groundCaseDigest);assert.equal(raisedBody.materialElasticModulusMPa,null)
})
