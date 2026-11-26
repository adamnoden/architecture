import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {readInletCornerContext,replayInletCornerContext,utilityCornerBoundary,runUtilityCornerHost} from './current-design/inlet-utility-corner.js'
import {inletRoomPan} from './current-design/inlet-room-pan.js'
import {inletRoomPocket} from './current-design/inlet-room-pocket.js'
import {planArea,intersectPlan} from './current-design/inlet-orthogonal-plan.js'
const room=[9397,429.5,2173.5,2023.5] as const,origin=[11667.5,332.5],stage='a'.repeat(64)
const close=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`)
const panInput={roomPlanMm:room,outletXmm:[9640,10160],inletYmm:689.5,invertMm:325,slopeRatio:100,floorMm:530,floorUndersideMm:515,distributionBottomMm:270,datumMm:-180,settingMm:10,metalMm:2,insulationMm:20,chuteWidthMm:400,chuteHeightMm:150,chuteSlopeRatio:50,waterStageComparisonsMm:{blocked:530}}
test('same-stage native SE geometry replays exactly; source or shape tampering never becomes a corner',()=>{
 const c=readInletCornerContext(200,stage),r=replayInletCornerContext(c,origin)
 assert.deepEqual(r.geometry.rectanglesXYMm,[[11537.5,262.5,11737.5,1262.5],[10737.5,262.5,11537.5,462.5]])
 assert.equal(r.controllingField,'cornerWidthsMm.SE');assert.equal(r.geometry.caseAccepted,false)
 const b=utilityCornerBoundary(r,room,27)
 assert.equal(b.wholeRoomEnvelopeUnchanged,true);assert.equal(b.sourceWidthControlAdded,false);assert.equal(b.oldRectangularPanEvidenceApplicable,false)
 const stale=structuredClone(c);(stale.geometry.sourceSHA256 as Record<string,string>)[Object.keys(stale.geometry.sourceSHA256)[0]]='b'.repeat(64)
 assert.throws(()=>replayInletCornerContext(stale,origin),/Stale or modified/)
 const forged=structuredClone(c);(forged.geometry.rectanglesXYMm[0] as unknown as number[])[0]++
 assert.throws(()=>replayInletCornerContext(forged,origin))
})
test('the actual notched pan and separated RC/mineral union conserve area, pressure and gravity',()=>{
 const c=readInletCornerContext(200,stage),b=utilityCornerBoundary(c,room,27),old=inletRoomPan(panInput),pan=inletRoomPan({...panInput,planExclusionsMm:b.actualPanExclusionsXYMm})
 close(old.projectedAreaM2-pan.projectedAreaM2,.0996);assert.ok(pan.necessaryGeometryScreen);assert.deepEqual(pan.outletMouthsMm,old.outletMouthsMm)
 assert.ok(pan.cells.every(cell=>b.actualPanExclusionsXYMm.every(e=>!intersectPlan([cell.cornersMm[0][0],cell.cornersMm[0][1],cell.cornersMm[2][0],cell.cornersMm[2][1]],e))))
 const hydro=pan.hydrostaticCases[0].summedSurfaceWrenchKN_KNm,water=pan.waterLoadOrigins.reduce((n,r)=>n+r.massKg,0)
 close(hydro.Fx,0);close(hydro.Fy,0);close(hydro.Fz,-water*9.81/1000)
 assert.ok(pan.afterLowerSettingGrossWaterToFloorUpperKg!<old.afterLowerSettingGrossWaterToFloorUpperKg!)
 const grid=JSON.parse(readFileSync(new URL('../../project/str/studies/current-house-grid.json',import.meta.url),'utf8')),input={levels:{mineralCourse:[0,150] as const,dryRC:[150,350] as const,glass:[350,450] as const,accessibleDistribution:[450,515] as const,finish:[515,530] as const,ffl:530,coldGridTop:-180},roomPlanMm:room,depthMm:245,isolationGapMm:50,grid,rcDensityKNm3:25,mineralDensityKNm3:20},oldFloor=inletRoomPocket(input).local!,floor=inletRoomPocket({...input,planExclusionsMm:b.actualPanExclusionsXYMm}).local!
 assert.ok(floor.bodyMinMaxIsEnvelopeOnly);assert.ok(floor.bodyPlanRectanglesXYMm)
 close((planArea(floor.bodyMinMaxMm)-floor.bodyPlanRectanglesXYMm.reduce((n,r)=>n+planArea(r),0))/1e6,.0996)
 close(oldFloor.quantityBounds.slabAndMineralWeightKN-floor.quantityBounds.slabAndMineralWeightKN,.7968)
 close(floor.loadOrigins.reduce((n,r)=>n-r.wrenchKN_KNm.Fz,0),floor.quantityBounds.slabAndMineralWeightKN)
 for(const cell of floor.disjointContactCells)assert.ok(floor.bodyPlanRectanglesXYMm.some(r=>intersectPlan(r,cell.rectangleMm)&&planArea(intersectPlan(r,cell.rectangleMm)!)>=planArea(cell.rectangleMm)-1e-8))
 assert.equal(floor.constructionAdmitted,false)
})
test('compact host preserves actual washer reservation/rest/terminal and rejects a wider incompatible core',()=>{
 const c=readInletCornerContext(200,stage),host=runUtilityCornerHost(c,27,[10760,1250,1000])
 assert.equal(host.necessaryGeometryComparisons,true);assert.equal(host.sinkShiftWestMm,80);assert.equal(host.westDrawMm,120);assert.equal(host.fixedExistingFirstRestPreserved,true)
 assert.deepEqual(host.revisedUtility.sink,[10855,740,600,600]);assert.deepEqual(host.revisedUtility.rearServiceChase,[10050,510,1440,190])
 assert.equal(host.checks.actualUtilityTerminalInRetainedCapDomain,true);assert.equal(host.checks.carrierContinuouslySupported,true);assert.equal(host.physicalHandlingPressureMaterialAndSupportAccepted,false)
 const wider=runUtilityCornerHost(readInletCornerContext(240,stage),27,[10760,1250,1000])
 assert.equal(wider.necessaryGeometryComparisons,false);assert.ok(wider.checks.internalCarrierBodyGapMm<25)
 assert.throws(()=>runUtilityCornerHost(c,27,[10800,1250,1000]))
})
