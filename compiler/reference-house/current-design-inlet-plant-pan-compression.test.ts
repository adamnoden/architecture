import test from 'node:test'
import assert from 'node:assert/strict'
import {inletRoomPocket,drawInletRoomPocket} from './current-design/inlet-room-pocket.js'
import {plantMatchedPanCompression} from './current-design/inlet-plant-tanked-walk.js'
const room=[9397,3797,2173.5,1983.5] as const
const levels={mineralCourse:[0,150],dryRC:[150,300],glass:[300,450],accessibleDistribution:[450,515],finish:[515,530],ffl:530,coldGridTop:-130} as const
const grid={girders:{south:{axis:'x',datum:3797,extent:[9397,11570.5]as const,width:200,z:[-300,-130]as const},north:{axis:'x',datum:5780.5,extent:[9397,11570.5]as const,width:200,z:[-300,-130]as const},west:{axis:'y',datum:9397,extent:[3797,5780.5]as const,width:200,z:[-300,-130]as const},east:{axis:'y',datum:11570.5,extent:[3797,5780.5]as const,width:200,z:[-300,-130]as const}},crossBeams:{},heads:[]}
const original={levels,roomPlanMm:room,depthMm:195,isolationGapMm:50,grid,rcDensityKNm3:24,mineralDensityKNm3:20,roomId:'plant'as const}
const floorInput={...original,plantCompression:{schema:'had-plant-pan-compression/1'as const,settingEachMm:10,sourceCorePlans:[{id:'source/service-spine',rectangleMm:[9230,3797,9370,5780.5]as const},{id:'source/plant-intermediate-arch',rectangleMm:[9397,3630,11570.5,3770]as const},{id:'source/plant-north',rectangleMm:[9397,5807.5,11570.5,5947.5]as const}]}}
const floor=()=>inletRoomPocket(floorInput)
const cells=(offset=0)=>{
 const face=(id:string,x:number,xx:number,step:number)=>({id,cornersMm:[[x,3797,315+(x-9397)*.01+step+offset],[xx,3797,315+(xx-9397)*.01+step+offset],[xx,5780.5,315+(xx-9397)*.01+9.9175+step+offset],[x,5780.5,315+(x-9397)*.01+9.9175+step+offset]]})
 return[face('pan/west',9397,10500,0),face('pan/east',10500,11570.5,5)]
}
const parts=()=>[{id:'Plant/foot/0/0',kind:'solid-foot-pad',boxMm:[9397,3797,312.8,120,120,8]as const,metalVolumeMm3:115200,displacementOuterBoxRequired:true,installedAcceptance:false as const},{id:'Plant/post/0/0',kind:'RHS-post-bound',boxMm:[9442,3842,320.8,30,30,259.2]as const,metalVolumeMm3:324*259.2,displacementOuterBoxRequired:true,installedAcceptance:false as const},{id:'Plant/bridge-foot/exterior',kind:'bridge-pad',boxMm:[12070,3840,312.8,120,120,8]as const,metalVolumeMm3:115200,displacementOuterBoxRequired:true,installedAcceptance:false as const}]
const context=()=>({floorCase:floor(),panCells:cells(),panInternalStepFaces:[{id:'pan/real-step',normal:[1,0,0],cornersMm:[[10500,3797,326.03],[10500,5780.5,335.9475],[10500,5780.5,340.9475],[10500,3797,331.03]]}],panMetalMm:4,panDensityKgM3:8960,design:{minimumMachinedFootThicknessMm:8,stockThicknessMm:180,compressiveWorkingFactor:3,minimumEffectiveContactFraction:.95}})
const run=(c=context())=>{const p=parts();return{result:plantMatchedPanCompression({context:c,roomPlanMm:room,parts:p,maximumWaterMm:660,footDesignN:7000,steelDensityKgM3:8000}),parts:p}}
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-7,a+' != '+b)
test('optional floor physically replaces the inset RC and uniform upper stack, preserving omitted legacy shapes',()=>{
 const old=inletRoomPocket(original),now=floor()
 assert.ok(old.local&&now.local&&'plantCompression'in now)
 assert.equal('plantCompression'in old,false)
 assert.equal(old.local.levelBoxes.length,5)
 assert.equal(now.local.levelBoxes.length,2)
 assert.equal(now.local.quantityBounds.glassM3,0)
 assert.deepEqual(now.local.levelBoxes.map(b=>b.id),['mineralCourse','dryRC'])
 assert.deepEqual(now.levels,old.levels)
 assert.deepEqual(now.local.bodyMinMaxMm,[9397,3797,11570.5,5780.5])
 assert.ok(now.plantCompression!.replacementRcM3>now.plantCompression!.referenceRcM3)
 assert.ok(now.plantCompression!.rcMineralDeltaWrenchAboutGlobalZeroKN_KNm[2]<0)
 assert.ok(now.plantCompression!.sourceCoreChecks.every(c=>c.afterTwoSettingsMm===7))
 assert.equal(now.plantCompression!.actualSourceProfileZAndCoreInterfaceAccepted,false)
 const svg=drawInletRoomPocket(now.local)
 assert.match(svg,/uniform glass, service layer and continuous finish are retired/)
 assert.doesNotMatch(svg,/Local glass/)
 assert.equal(inletRoomPocket({...original}).local!.quantityBounds.glassM3,old.local.quantityBounds.glassM3)
})
test('same-pan machined feet have exact wedge volume and changed post lengths, with exterior receivers kept separate',()=>{
 const {result:r,parts:p}=run(),foot=r.feet.find(f=>f.id==='Plant/foot/0/0')!
 assert.ok(foot.necessaryMatchedContact&&'steelTopMm'in foot)
 near(foot.steelTopMm!,324.8)
 near(foot.actualPostLengthMm!,255.2)
 near(p[1].boxMm[2]+p[1].boxMm[5],580)
 near(p[0].metalVolumeMm3,120*120*8.9)
 assert.ok(r.necessaryPanFootPressureComparisons)
 assert.equal(r.feet.find(f=>f.id.includes('exterior'))!.outsidePanReceiverRequired,true)
 assert.equal(r.actualCompleteSupportAccepted,false)
 assert.equal(r.actualCoreProfileRCPlateAndColdGridTransferAccepted,false)
 assert.equal(r.localDifferentialCompressionDrainageAndPanDentAccepted,false)
 assert.ok(foot.slopeHorizontalDemandUpperN!>70)
 assert.ok(r.thicknessRangeMm[0]>140&&r.thicknessRangeMm[1]<178)
 assert.ok(r.necessaryStockEnvelope)
 assert.ok(r.tiles.every(t=>t.minimumInfillMm>=150&&t.stockBlankMassUpperKg<9))
 assert.ok(r.tiles.some(t=>t.facets.length>1))
 assert.equal(r.stepNotches.length,1)
 assert.deepEqual(r.stepNotches[0].planMinMaxMm,[10500,3797,10504,5780.5])
 assert.ok(r.tiles.some(t=>t.subtractNormalSheetPrismIds.length>0))
 assert.equal(r.bedVolumeM3IsUnnotchedConservativeUpper,true)
 assert.equal(r.actualNetMachinedVolumeM3,null)
 near(r.bedFacets.reduce((n,f)=>n+f.massUpperKg,0),r.normalMassUpperKg)
 near(r.normalOrigins.reduce((n,f)=>n+f.wrenchKN_KNm.Fz,0),-r.normalMassUpperKg*9.81/1000)
 assert.equal(r.oldUniformGlassPhysicalGeometryRetired,true)
})
test('real pan perturbations change bed G and foot lengths; cyclic corner ordering preserves geometry',()=>{
 const base=run(),up=run({...context(),panCells:cells(1)})
 near(up.result.bedVolumeM3-base.result.bedVolumeM3,room[2]*room[3]/1e9)
 near(up.result.normalMassUpperKg-base.result.normalMassUpperKg,room[2]*room[3]/1e9*181.5)
 near(up.parts[1].boxMm[5],base.parts[1].boxMm[5]-1)
 const rotated=run({...context(),panCells:cells().map(c=>({...c,cornersMm:[...c.cornersMm.slice(1),c.cornersMm[0]]}))})
 near(rotated.result.normalMassUpperKg,base.result.normalMassUpperKg)
 assert.equal(run({...context(),panCells:cells(10)}).result.necessaryStockEnvelope,false)
})
test('mixed floor output, old inset body, duplicate pan facets and missing RC contact reject instead of laundering support',()=>{
 const changed=floor();changed.local!.levelBoxes.find(b=>b.id==='dryRC')!.zMm=[20,171]
 assert.throws(()=>run({...context(),floorCase:changed}),/same-source replay/)
 assert.throws(()=>run({...context(),floorCase:inletRoomPocket(original)}),/actual.*floor producer/i)
 assert.throws(()=>run({...context(),panCells:[...cells(),cells()[0]]}),/Overlapping pan facets/)
 assert.throws(()=>run({...context(),panCells:cells().slice(0,1)}),/Continuous pan coverage/)
 const hit={...floorInput,plantCompression:{...floorInput.plantCompression,sourceCorePlans:[{id:'real-core-intersection',rectangleMm:[9390,3797,9400,5780.5]as const}]}}
 const bad=inletRoomPocket(hit)
 assert.ok('plantCompression'in bad&&!bad.plantCompression!.necessaryCoreXYSeparation)
 assert.equal(bad.local!.constructionAdmitted,false)
 const diagonal=inletRoomPocket({...floorInput,plantCompression:{...floorInput.plantCompression,sourceCorePlans:[{id:'diagonal-corner',rectangleMm:[11585.5,5795.5,11600,5810]as const}]}})
 assert.ok('plantCompression'in diagonal)
 assert.ok(diagonal.plantCompression!.sourceCoreChecks[0].nominalGapMm>20)
 assert.equal(diagonal.plantCompression!.necessaryCoreXYSeparation,false)
 assert.ok(diagonal.plantCompression!.sourceCoreChecks[0].afterTwoSettingsMm<0)
})
