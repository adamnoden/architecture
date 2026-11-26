import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,mkdirSync,writeFileSync,existsSync} from 'node:fs'
import {join} from 'node:path'
import {plantPotableInventory} from './current-design/inlet-plant-potable-inventory.js'
import {readInletSourceEnvelopeSettings} from './current-design/inlet-source-envelope.js'
import {inletPlantTankedRoom,drawInletPlantTankedRoom} from './current-design/inlet-plant-tanked.js'
import {inletSplitPlantRoom} from './current-design/inlet-split-plant-room.js'
const read=(p:string)=>JSON.parse(readFileSync(new URL('../../'+p,import.meta.url),'utf8'))
const receipt=read('project/had/studies/inlet-local-pocket.results.json'),p=receipt.splitPlantRoom?.comparison,choice=read('project/had/studies/inlet-plant-tanked-walk-candidate.json')
test('source Plant pan fixture is explicitly530 geometry, never a new native force result',()=>{
 assert.ok(p&&p.state==='unadopted-threshold-drainage-successor','Actual saved local-pocket Plant comparison required; no fallback fixture')
 assert.equal(p.ground.ffl,530)
 assert.ok(p.resolvedInput&&p.pan&&p.bridge&&p.outfalls)
 const replay=inletSplitPlantRoom(p.resolvedInput)
 assert.deepEqual(JSON.parse(JSON.stringify(replay.pan)),p.pan,'JSON control normalises signed zero; no source or numerical receipt is edited.')
 assert.equal(choice.closedDuctStorageCreditLitres,0)
 assert.equal(choice.legacyFinishUndersideProtectedMm,505)
 assert.equal(choice.walkingRiseAboveHouseFflMm,150)
 const rows={scope:'Exact existing source-geometry fixture only. New grated surface and body translations are not yet active; source-native force/evidence identity is not adopted.',keys:Object.keys(p),inputKeys:Object.keys(p.resolvedInput),ground:p.ground,pocket:p.pocket,pan:p.pan,bridge:p.bridge,room:p.branchRoomMm??p.resolvedInput.branch.roomPlanMm,sourceQ:p.sourceOnlyLmin,threshold:p.resolvedInput.threshold,goods:p.resolvedInput.branch.goods,sourceServiceGeometry:p.resolvedInput.branch.resolvedInput,grid:p.resolvedInput.grid}
 const dir=process.env.HAD_UTILITY_ROUTE_PROOF_DIR
 if(dir){mkdirSync(dir,{recursive:true});writeFileSync(join(dir,'Plant-actual-tanked-geometry-source.json'),JSON.stringify(rows,null,2))}
 console.info('PLANT_ACTUAL_TANKED_GEOMETRY '+JSON.stringify({ground:p.ground,inputKeys:rows.inputKeys,panKeys:Object.keys(p.pan),pocketKeys:Object.keys(p.pocket),bridge:p.bridge.boxMm,room:rows.room,sourceQ:p.sourceOnlyLmin,goods:rows.goods.map((g:any)=>({id:g.id,maximumCompleteHeightMm:g.maximumCompleteHeightMm,completeRadiusMm:g.completeRadiusMm}))}))
})

test('complete source-design potable inventory uses external tubes/full fitting bodies, not minimum IDs or170L history',()=>{
 const mat=read('project/mat/studies/whole-house-service-baseline.json'),r=plantPotableInventory(mat,choice.inventory)
 assert.equal(r.minimumBoresUsedAsMaximum,false)
 assert.equal(r.sourcePipeBodiesAndFittingsDeliberatelyCountedAsWater,true)
 assert.equal(r.retiredUtilityColdDutyIncluded,false)
 assert.ok(r.wholeSelectedTrunkBranchAndDeviceDesignUpperL>240)
 assert.equal(r.actualRiserAndAllTerminalJoinsAccepted,false)
 assert.equal(r.actualAllApparatusReservoirBackfeedExcluded,false)
 const dir=process.env.HAD_UTILITY_ROUTE_PROOF_DIR
 if(dir)writeFileSync(join(dir,'Plant-actual-source-potable-inventory.json'),JSON.stringify(r,null,2))
 console.info('PLANT_SOURCE_POTABLE_UPPER '+JSON.stringify({totals:r.totals,upper:r.wholeSelectedTrunkBranchAndDeviceDesignUpperL,rows:r.rows.length,offset:r.sectionOffsetRadiusUpperMm}))
 const restored=structuredClone(mat);restored.trunks.find((t:any)=>t.id==='ground-utility').duties.push('cold')
 const hazardous=plantPotableInventory(restored,choice.inventory)
 assert.equal(hazardous.retiredUtilityColdDutyIncluded,true)
 assert.ok(hazardous.wholeSelectedTrunkBranchAndDeviceDesignUpperL>r.wholeSelectedTrunkBranchAndDeviceDesignUpperL)
 const stale=structuredClone(mat);stale.trunks[0].selected3DProfile[0][0]+=10
 assert.throws(()=>plantPotableInventory(stale,choice.inventory),/source contradiction/)
 const tooLarge=structuredClone(choice.inventory);tooLarge.maximumCompletePressureDeviceBodyMm=[80,80,600]
 assert.throws(()=>plantPotableInventory(mat,tooLarge),/exceeds source work territory/)
})

const roomRequest=()=>({choice,plant:p,vesselChoice:read('project/had/studies/inlet-store-vessel-candidate.json'),mat:read('project/mat/studies/whole-house-service-baseline.json'),maximumSourceApertureMm:10.5,services:read('project/had/studies/current-house-services.json'),servicesGitBlob:'e649805e78244527fe6498b516fa5f23734ac5ea',sourceSettings:readInletSourceEnvelopeSettings()})
test('one actual Plant pan feeds room, outfalls, occupied steel and complete communicating pressure-network volume',()=>{
 const r=inletPlantTankedRoom(roomRequest())
 assert.equal(r.levels.houseFflMm,530)
 assert.equal(r.levels.walkingMm,680)
 assert.equal(r.levels.maximumBulkWaterMm,660)
 assert.equal(r.outfalls.storageCreditL,0)
 assert.equal(r.containment.wholeInstallationCatastrophicApproval,false)
 assert.equal(r.containment.actualOutflowAirAndContinuingMainsTransientAccepted,false)
 assert.equal(r.installedAcceptance,false)
 assert.ok(r.inventory.fullInstantPressureNetworkDesignReleaseL>600)
 assert.ok(r.inventory.fullInstantPressureNetworkDesignReleaseL<800)
 assert.equal(r.inventory.network.minimumBoresUsedAsMaximum,false)
 assert.equal(r.source.nativeForceOrPositiveReceiptAcceptanceTransferred,false)
 assert.equal(r.serviceGeometry.actualFactoryPortAndServiceRenewalJoinsAccepted,false)
 assert.ok(r.outfalls.hydrostaticPlateNecessary)
 assert.ok(r.walking.necessaryMemberComparisons,JSON.stringify(r.walking.memberChecks.filter(p=>!p.necessary)))
 assert.equal(r.normalHeatedInventory.necessaryThermalInventory,true,JSON.stringify(r.normalHeatedInventory))
 assert.ok(r.walking.apparatusInterfaces.length===2)
 assert.equal(r.walking.renewal.everyPanelIndependentOfApparatusRemoval,false)
 assert.ok(r.walking.renewal.apparatusRemovalBeforePanelIds.length>0)
 assert.ok(r.vessel.expansion.necessaryNormalThermalComparison)
 assert.equal(r.vessel.geometry.groundFflMm,680)
 assert.equal(r.vessel.connections.hot.upperTreeJoinLocalMm[2]+r.vessel.geometry.groundFflMm,2945+530)
 assert.ok(r.containment.reserveL>150,JSON.stringify(r.containment))
 assert.equal(r.inventory.vesselMaximumDesignL,330)
 const dir=process.env.HAD_UTILITY_ROUTE_PROOF_DIR
 if(dir){writeFileSync(join(dir,'Plant-tanked-current-source-comparison.json'),JSON.stringify(r,null,2));writeFileSync(join(dir,'Plant-tanked-owner-plan-section.svg'),drawInletPlantTankedRoom(r))}
 const svg=drawInletPlantTankedRoom(r),savedDrawing=new URL('../../project/had/studies/plant-tanked-walk-development.svg',import.meta.url);if(existsSync(savedDrawing))assert.equal(readFileSync(savedDrawing,'utf8'),svg,'Ordinary source drawing is stale; regenerate from the same computed case.');assert.ok(svg.includes(r.source.caseDigest));assert.ok(svg.includes('No thermal/nonreturn seal'));console.info('PLANT_OWNER_REVIEW_SVG '+JSON.stringify(svg))
 console.info('PLANT_TANK_COMPLETE_STATIC '+JSON.stringify({levels:r.levels,sourceProfiles:r.outfalls.profiles.map(p=>({id:p.id,pool:p.initialSourcePoolMm,freeDrop:p.freeDropReserveMm,necessary:p.necessaryFreeSourceProfile,refinements:p.refinements.map(r=>r.state)})),inventory:r.inventory.fullInstantPressureNetworkDesignReleaseL,containment:r.containment,hotNetwork:r.inventory.normalHotAndReturnNetworkDesignUpperL,normalHeated:r.normalHeatedInventory,apparatus:r.walking.apparatusInterfaces.map(a=>({id:a.id,geometry:a.necessarySeparateStandGeometry,loadN:'designOnePostN'in a?a.designOnePostN:null,cutouts:'panelCutoutIntersections'in a?a.panelCutoutIntersections?.length:null})),steelKg:r.walking.normalMassUpperKg,walkingFailures:r.walking.memberChecks.filter(p=>!p.necessary),frame:r.fittedFrame}))
})
test('actual floor, outlet and inventory perturbations invalidate dependent design evidence',()=>{
 const i=roomRequest(),r=inletPlantTankedRoom(i),low=structuredClone(i)
 low.choice.walkingRiseAboveHouseFflMm=0
 const failed=inletPlantTankedRoom(low)
 assert.equal(failed.containment.necessaryClosedPressureNetworkVolumeScreen,false)
 assert.notEqual(failed.source.caseDigest,r.source.caseDigest)
 const mixed=structuredClone(i);mixed.plant.resolvedInput.branch.paths[0].points[0][0]+=1
 assert.throws(()=>inletPlantTankedRoom(mixed),/Mixed or modified/)
 assert.throws(()=>inletPlantTankedRoom({...i,maximumSourceApertureMm:10.4}),/source aperture/)

 const revised=structuredClone(i);revised.choice.walkingRiseAboveHouseFflMm=100
 revised.choice.frame.clearHeightMm=2350
 revised.choice.outfalls.clearWidthMm=600;revised.choice.outfalls.clearHeightMm=134
 revised.choice.outfalls.metalMm=5;revised.choice.outfalls.invertRiseAboveExistingMm=5
 revised.choice.outfalls.receiverClearWidthMm=650;revised.choice.externalRampRunMm=1200
 const b=inletPlantTankedRoom(revised)
 assert.ok(r.containment.reserveL>b.containment.reserveL+100)
 assert.ok(b.fittedFrame.cargoHeadReserveAfterTwoSettingsMm>=0)
 assert.ok(b.outfalls.hydrostaticPlateNecessary)
 assert.ok(b.walking.necessaryMemberComparisons,JSON.stringify(b.walking.memberChecks.filter(p=>!p.necessary)))
 assert.notEqual(b.source.caseDigest,r.source.caseDigest)
 const dir=process.env.HAD_UTILITY_ROUTE_PROOF_DIR
 if(dir)writeFileSync(join(dir,'Plant-tanked-rejected-tight-100mm600mm-comparison.json'),JSON.stringify(b,null,2))
 console.info('PLANT_TANK_COMPLETE_ALTERNATIVE '+JSON.stringify({choice:{rise:100,clearWidth:600,metal:5},levels:b.levels,inventory:b.inventory.fullInstantPressureNetworkDesignReleaseL,containment:b.containment,steelKg:b.walking.normalMassUpperKg,frame:b.fittedFrame}))

})
