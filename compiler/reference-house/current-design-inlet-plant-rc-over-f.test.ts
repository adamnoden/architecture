import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {plantRcOverUniformFPanSupport,plantMatchedPanCompression} from './current-design/inlet-plant-tanked-walk.js'
import {inletPlantTankedRoom} from './current-design/inlet-plant-tanked.js'
import {inletRoomPocket,type PlantRcOverUniformFStack} from './current-design/inlet-room-pocket.js'
const read=(p:string)=>JSON.parse(readFileSync(new URL('../../'+p,import.meta.url),'utf8'))
const saved=read('project/had/studies/inlet-local-pocket.results.json').splitPlantRoom.comparison,grid=read('project/str/studies/current-house-grid.json'),water=read('project/had/studies/water-replan.json')
/** Explicit optional DEVELOPMENT proposal, not a substitute for current C. The
 * whole-room owning adapter must pass its one selected C.stack into this API. */
export const proposedRcOverF:PlantRcOverUniformFStack={kind:'rc-over-uniform-F',lowerMineralMm:90,insulationMm:180,rcMm:200,bedding:{densityKNm3:20,minimumCompressiveMPa:30},retentionMassUpperKg:20,soffitRetention:{stud:{diameterMm:6,embedMm:60,heelMm:40,bendRadiusMm:12,threadTailMm:2},buttonDTMm:[80,5],collarDTMm:[50,3],sleeveODIDMm:[8,6.5],washerDTMm:[18,2],nutAFHeightCount:[10,6,2],pocketWDmm:[90,40],throughSquareMm:14,minimumMetalAboveBaseMm:15,maximumFactoryRelativeErrorMm:2,maximumPreloadN:500,maximumTileKg:10,handlingFactor:3,steel:{densityUpperKgM3:8000,conductivityUpperWmK:20,elasticModulusMPa:185000,allowableMPa:100}}}
const sourceCorePlans=water.model.groundWalls.filter((w:any)=>Array.isArray(w.structuralCore)).map((w:any)=>{const axis=w.a[0]===w.b[0]?1:0,lo=Math.min(w.a[axis],w.b[axis]),hi=Math.max(w.a[axis],w.b[axis]);return{id:'water-replan/groundWalls/'+w.id,rectangleMm:axis===1?[w.structuralCore[0],lo,w.structuralCore[1],hi]as const:[lo,w.structuralCore[0],hi,w.structuralCore[1]]as const}})
const base={levels:saved.ground,roomPlanMm:saved.resolvedInput.branch.roomPlanMm,depthMm:saved.choice.localPocketDepthMm,isolationGapMm:saved.choice.isolationGapMm,grid,rcDensityKNm3:saved.ground.rcDensityKNm3,mineralDensityKNm3:saved.ground.mineralDensityKNm3,roomId:'plant' as const},
 context={schema:'had-plant-pan-compression/1' as const,settingEachMm:10,sourceCorePlans}
const near=(a:number,b:number,t=1e-7)=>assert.ok(Math.abs(a-b)<t,a+' != '+b)
test('optional flat RC-over-F uses actual grid contacts and twenty real captured stock tiles',()=>{
 const r=inletRoomPocket({...base,plantCompression:{...context,stack:proposedRcOverF}})
 assert.ok(r.local&&'plantCompression'in r&&r.plantCompression)
 const p=r.plantCompression!,f=p.rcOverUniformF!,a=f.retention,q=r.local.quantityBounds
 const summary={caseDigest:p.caseDigest,levels:r.local.levelBoxes,quantity:q,contacts:f.loadBearingContactPlans,grossColdContactM2:f.contactUnionM2,netFContactM2:f.netInsulationContactM2,unsupportedSoffitM2:f.unsupportedSoffitM2,retention:a,precastPanelUpperKg:f.precastInitialBuildPanelMassUpperKg,installedAcceptance:false}
 console.log('PLANT_RC_OVER_F_OPTIONAL '+JSON.stringify(summary))
 if(process.env.RUNNER_TEMP){const dir=join(process.env.RUNNER_TEMP,'had-utility-west-proof');mkdirSync(dir,{recursive:true});writeFileSync(join(dir,'plant-rc-over-F-optional.json'),JSON.stringify(summary,null,2))}
 assert.deepEqual(r.levels.mineralCourse,[-180,-90]);assert.deepEqual(r.levels.glass,[-90,90]);assert.deepEqual(r.levels.dryRC,[90,290])
 assert.deepEqual(r.local.retainedGlobal.mineralCourse,[0,150]);assert.equal(r.levels.ffl,530)
 near(f.contactUnionM2,1.70632475);near(f.unsupportedSoffitM2,2.6048125)
 assert.equal(f.fullAreaSoilOrInsulationSupportAssumed,false)
 assert.equal(a.tiles.length,20);assert.equal(a.captures.length,40)
 assert.ok(a.tiles.every(t=>t.maximumStockMassKg<10&&t.stockBlankMm[0]===600&&t.stockBlankMm[1]===450&&t.stockBlankMm[2]===180))
 assert.ok(a.necessaryGeometryAndMemberScreens,JSON.stringify(a.checks.filter(c=>!c.necessary)))
 assert.ok(a.captures.every(c=>c.steelBottomMm-(-90)>=19-1e-7))
 assert.ok(a.netFContactM2<a.grossColdContactM2)
 near(a.grossColdContactM2-a.netFContactM2,a.contactVoidDeductionM2)
 near(q.uniformFVolumeM3!,4.31113725*.18-a.removedFVolumeM3)
 near(q.uniformFMassUpperKg!,q.uniformFVolumeM3!*181.5)
 near(q.retentionMassUpperKg!,a.captures.reduce((n,c)=>n+c.stockMassUpperKg,0))
 assert.ok(q.retentionMassUpperKg!<20&&q.retentionMassUpperKg!>10)
 const F=r.local.levelBoxes.find(b=>b.id==='glass')!
 assert.ok(F.voidsAreActualSubtractiveGeometry&&F.subtractBoxesXYZMm?.length===80)
 near(-r.local.loadOrigins.reduce((n,c)=>n+c.wrenchKN_KNm.Fz,0),q.completeStackWeightUpperKN!)
 assert.ok(f.precastInitialBuildPanelMassUpperKg>2300&&f.precastInitialBuildPanelMassUpperKg<2400)
 assert.equal(f.renewal500kgRouteApplies,false)
 assert.equal(f.actualFPressureDistributionAccepted,false)
 assert.equal(a.actualFactoryConcretePasteExclusionAndPocketInspectionAccepted,false)
 assert.ok(a.thermal.steelOnlyConductanceUpperWperK>0)
 assert.equal(a.thermal.voidAirRadiationJointsAndWholeBridgeAccepted,false)
})
test('layer and real capture perturbations invalidate geometry, G or the supported domain',()=>{
 const current=inletRoomPocket({...base,plantCompression:{...context,stack:proposedRcOverF}}),changed=inletRoomPocket({...base,plantCompression:{...context,stack:{...proposedRcOverF,insulationMm:160}}})
 assert.ok('plantCompression'in current&&'plantCompression'in changed)
 assert.notEqual(current.plantCompression!.caseDigest,changed.plantCompression!.caseDigest)
 assert.deepEqual(changed.levels.dryRC,[70,270])
 assert.notEqual(current.local!.quantityBounds.completeStackWeightUpperKN,changed.local!.quantityBounds.completeStackWeightUpperKN)
 const bad=structuredClone(proposedRcOverF);bad.soffitRetention.pocketWDmm=[90,25]
 const short=inletRoomPocket({...base,plantCompression:{...context,stack:bad}})
 assert.ok('plantCompression'in short)
 assert.equal(short.plantCompression!.rcOverUniformF!.retention.necessaryGeometryAndMemberScreens,false)
 assert.equal(short.local!.necessaryGeometryScreen,false)
 const small=inletRoomPocket({...base,roomPlanMm:[9397,3797,180,983.5],plantCompression:{...context,stack:proposedRcOverF}})
 assert.ok('plantCompression'in small)
 const smallCapture=small.plantCompression!.rcOverUniformF!.retention
 assert.equal(smallCapture.necessaryGeometryAndMemberScreens,false);assert.equal(small.local!.necessaryGeometryScreen,false)
 assert.ok(smallCapture.checks.filter(c=>c.id==='counterpocket-within-own-tile-after-fit'||c.id==='opposed-hook-heel-within-own-half-tile-after-fit').every(c=>!c.necessary))
 assert.throws(()=>inletRoomPocket({...base,planExclusionsMm:[[10000,4000,10100,4100]as const],plantCompression:{...context,stack:proposedRcOverF}}),/one actual unnotched RC plan/)
})
test('existing above-RC F and old pocket remain unchanged optional controls',()=>{
 const omitted=inletRoomPocket({...base,plantCompression:context}),explicit=inletRoomPocket({...base,plantCompression:{...context,stack:undefined}})
 assert.deepEqual(JSON.parse(JSON.stringify(omitted)),JSON.parse(JSON.stringify(explicit)),'Serialisable optional control normalises undefined input properties; actual layer values remain exact below')
 assert.deepEqual(omitted.levels.dryRC,[-30,170])
 assert.equal(omitted.local!.quantityBounds.glassM3,0)
 assert.ok('plantCompression'in omitted)
 assert.equal(omitted.plantCompression!.rcOverUniformF,undefined)
 const legacy=inletRoomPocket(base)
 assert.equal(legacy.local!.isolationGapMm,50)
 assert.deepEqual(legacy.levels.glass,[170,270])
})

test('actual selected pan keeps its steel geometry while a distinct mineral/RC/contact-F producer replaces the point-F law',()=>{
 const choice=read('project/had/studies/inlet-plant-tanked-walk-candidate.json'),above=structuredClone(choice);delete above.panCompression.stack
 const current=inletPlantTankedRoom({choice:above,plant:saved,vesselChoice:read('project/had/studies/inlet-store-vessel-candidate.json'),mat:read('project/mat/studies/whole-house-service-baseline.json'),maximumSourceApertureMm:10.5,services:read('project/had/studies/current-house-services.json'),servicesGitBlob:'e649805e78244527fe6498b516fa5f23734ac5ea',waterReplan:water,waterReplanGitBlob:'089f0dac2f2e89272dc2ea85a10c2208f2fd797d',sourceSettings:read('project/had/studies/inlet-plant-tanked-supply-candidate.json').settings})
 const oldFloor=current.floorReplan.actualPocket
 assert.ok('plantCompression'in oldFloor&&oldFloor.plantCompression)
 const oldInput=oldFloor.plantCompression!.resolvedInput,stackFloor=inletRoomPocket({...oldInput,plantCompression:{...oldInput.plantCompression!,stack:proposedRcOverF}}),
  context={floorCase:stackFloor,panCells:current.panGeometry.cells,panInternalStepFaces:current.panGeometry.internalStepFaces,panMetalMm:choice.outfalls.metalMm,panDensityKgM3:choice.material.densityKgM3,design:choice.panCompression.design},
  parts=structuredClone(current.walking.parts),result=plantRcOverUniformFPanSupport({context,roomPlanMm:current.roomPlanMm,parts,maximumWaterMm:current.levels.maximumBulkWaterMm,footDesignN:choice.walkingFrame.maximumSinglePostDesignN,steelDensityKgM3:choice.material.densityKgM3})
 assert.equal(result.schema,'had-Plant-rc-over-uniform-F-pan-support/1')
 near(result.beddingThicknessRangeMm[0],22.79920007998408,1e-5);near(result.beddingThicknessRangeMm[1],55.53960001999803,1e-5)
 assert.equal(result.oldFUnderFootPressureResultApplies,false)
 assert.equal(result.FAndRetentionAlreadyCountedInFloorOrigins,true)
 assert.ok(result.necessarySteelMatching&&result.necessaryMineralMeanScreen)
 assert.equal(result.actualRCSpanningCageUnilateralFPressureAndColdGridAccepted,false)
 assert.equal(result.actualPerFootWrenchContactAndFrameStabilityAccepted,false)
 for(const p of parts){const before=current.walking.parts.find(q=>q.id===p.id)!;assert.deepEqual(p.boxMm,before.boxMm,'Exact same pan keeps the matched steel interfaces')}
 assert.ok(result.feet.some(f=>f.normalMomentBoundsNm!==null))
 const q=stackFloor.local!.quantityBounds
 const completeNew=q.completeStackWeightUpperKN!+result.gradedBeddingMassUpperKg*9.81/1000,
  completeOld=oldFloor.local!.quantityBounds.slabAndMineralWeightKN+current.walking.compressionSupport!.normalMassUpperKg*9.81/1000
 assert.ok(completeNew>completeOld)
 console.log('PLANT_RC_OVER_F_COMPLETE_COMPARISON '+JSON.stringify({newFloor:q,newUpperMineralKg:result.gradedBeddingMassUpperKg,newUpperBedMm:result.beddingThicknessRangeMm,oldCompleteStackKN:completeOld,newCompleteStackKN:completeNew,deltaKN:completeNew-completeOld,distinctSupport:result,actualAcceptance:false}))
 assert.throws(()=>plantMatchedPanCompression({context,roomPlanMm:current.roomPlanMm,parts:structuredClone(parts),maximumWaterMm:660,footDesignN:7000,steelDensityKgM3:8000}),/Old F-under-foot pressure law/)
 const lifted=inletRoomPocket({...oldInput,plantCompression:{...oldInput.plantCompression!,stack:{...proposedRcOverF,rcMm:260}}})
 assert.throws(()=>plantRcOverUniformFPanSupport({context:{...context,floorCase:lifted},roomPlanMm:current.roomPlanMm,parts:structuredClone(parts),maximumWaterMm:660,footDesignN:7000,steelDensityKgM3:8000}),/positive depth/)
})
