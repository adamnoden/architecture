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

const roomRequest=()=>({choice,plant:p,vesselChoice:read('project/had/studies/inlet-store-vessel-candidate.json'),mat:read('project/mat/studies/whole-house-service-baseline.json'),maximumSourceApertureMm:10.5,services:read('project/had/studies/current-house-services.json'),servicesGitBlob:'e649805e78244527fe6498b516fa5f23734ac5ea',waterReplan:read('project/had/studies/water-replan.json'),waterReplanGitBlob:'089f0dac2f2e89272dc2ea85a10c2208f2fd797d',sourceSettings:read('project/had/studies/inlet-plant-tanked-supply-candidate.json').settings})
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
 assert.ok(r.outfalls.profiles.every(p=>p.convergence.necessary&&p.convergence.fineChangeMm!==null&&p.convergence.fineChangeMm<=.01))
 assert.ok(r.walking.necessaryMemberComparisons,JSON.stringify(r.walking.memberChecks.filter(p=>!p.necessary)))
 assert.equal(r.normalHeatedInventory.necessaryThermalInventory,true,JSON.stringify(r.normalHeatedInventory))
 assert.equal(r.walking.apparatusInterfaces.length,0)
 assert.equal(r.walking.appliancePlatform!.chassis.length,2)
 assert.equal(r.walking.appliancePlatform!.retiredIndependentPedestalCount,8)
 assert.equal(r.bufferNormal.installedBodyBottomAbsoluteMm,r.levels.walkingMm+r.choice.appliancePlatform!.bufferCradleRiseMm)
 assert.equal(r.normalMetalTemperature.necessarySourceDutyCoverage,true)
 assert.equal(r.walking.renewal.everyPanelIndependentOfApparatusRemoval,false)
 assert.ok(r.walking.renewal.apparatusRemovalBeforePanelIds.length>0)
 assert.ok(r.vessel.expansion.necessaryNormalThermalComparison)
 assert.equal(r.vessel.geometry.groundFflMm,680)
 assert.equal(r.vessel.connections.hot.upperTreeJoinLocalMm[2]+r.vessel.geometry.groundFflMm,2945+530)
 assert.ok(r.containment.necessaryClosedPressureNetworkVolumeScreen,JSON.stringify(r.containment))
 assert.ok(r.containment.reserveL>0)
 assert.ok(Math.abs(r.containment.availableIncrementalRoomLowerL-r.inventory.fullInstantPressureNetworkDesignReleaseL-r.containment.reserveL)<1e-7)
 assert.equal(r.inventory.vesselMaximumDesignL,330)
 const dir=process.env.HAD_UTILITY_ROUTE_PROOF_DIR
 if(dir){writeFileSync(join(dir,'Plant-tanked-current-source-comparison.json'),JSON.stringify(r,null,2));writeFileSync(join(dir,'Plant-tanked-owner-plan-section.svg'),drawInletPlantTankedRoom(r))}
 console.info('PLANT_TANK_CURRENT_CONTAINMENT '+JSON.stringify({levels:r.levels,containment:r.containment,inventory:r.inventory.fullInstantPressureNetworkDesignReleaseL,normalGeometry:r.normalInstallation.geometryFailures,normalAuthority:r.normalInstallation.regulator.regulatorAuthorityReserveBar}))
 const svg=drawInletPlantTankedRoom(r),savedDrawing=new URL('../../project/had/studies/plant-tanked-walk-development.svg',import.meta.url);assert.ok(svg.includes(r.source.caseDigest));assert.ok(svg.includes('No thermal/nonreturn seal'));console.info('PLANT_OWNER_REVIEW_SVG '+JSON.stringify(svg));if(existsSync(savedDrawing))assert.equal(readFileSync(savedDrawing,'utf8'),svg,'Ordinary source drawing is stale; regenerate from the same computed case.')
 console.info('PLANT_TANK_COMPLETE_STATIC '+JSON.stringify({levels:r.levels,sourceProfiles:r.outfalls.profiles.map(p=>({id:p.id,pool:p.initialSourcePoolMm,freeDrop:p.freeDropReserveMm,necessary:p.necessaryFreeSourceProfile,refinements:p.refinements.map(r=>r.state)})),inventory:r.inventory.fullInstantPressureNetworkDesignReleaseL,containment:r.containment,hotNetwork:r.inventory.normalHotAndReturnNetworkDesignUpperL,normalHeated:r.normalHeatedInventory,apparatus:r.walking.apparatusInterfaces.map(a=>({id:a.id,geometry:a.necessarySeparateStandGeometry,loadN:'designOnePostN'in a?a.designOnePostN:null,cutouts:'panelCutoutIntersections'in a?a.panelCutoutIntersections?.length:null})),steelKg:r.walking.normalMassUpperKg,walkingFailures:r.walking.memberChecks.filter(p=>!p.necessary),frame:r.fittedFrame}))
})
test('actual floor, outlet and inventory perturbations invalidate dependent design evidence',()=>{
 const i=roomRequest(),r=inletPlantTankedRoom(i),low=structuredClone(i)
 low.choice.walkingRiseAboveHouseFflMm=0
 assert.throws(()=>inletPlantTankedRoom(low),/vertical stack|compression post|direct bearing length|actual stack/i,'The actual lower floor cannot contain the same unaltered platform; obsolete evidence must not survive an impossible geometry.')
 const mixed=structuredClone(i);mixed.plant.resolvedInput.branch.paths[0].points[0][0]+=1
 assert.throws(()=>inletPlantTankedRoom(mixed),/Mixed or modified/)
 assert.throws(()=>inletPlantTankedRoom({...i,maximumSourceApertureMm:10.4}),/source aperture/)

 const revised=structuredClone(i);revised.choice.walkingRiseAboveHouseFflMm=100
 revised.choice.frame.clearHeightMm=2350
 revised.choice.normalAssembly.prvAxisHouseLocalZMm=1260
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
 console.info('PLANT_TANK_COMPLETE_ALTERNATIVE '+JSON.stringify({choice:{rise:100,clearWidth:600,metal:5},levels:b.levels,inventory:b.inventory.fullInstantPressureNetworkDesignReleaseL,containment:b.containment,steelKg:b.walking.normalMassUpperKg,frame:b.fittedFrame,normalGeometry:b.normalInstallation.geometryFailures}))

})

test('the same active P source aperture drives delivery and fault; an insufficient real duct roof rejects its free profile',()=>{
 const active=roomRequest(),r=inletPlantTankedRoom(active),old=structuredClone(active)
 old.sourceSettings.plantApertureNominalMm=10.4
 const historical=inletPlantTankedRoom(old)
 assert.ok(r.source.sourceMaximumDischargeLmin>260)
 assert.ok(r.source.sourceMaximumDischargeLmin>historical.source.sourceMaximumDischargeLmin)
 assert.ok(r.levels.sourcePoolMm>historical.levels.sourcePoolMm)
 assert.ok(r.containment.reserveL<historical.containment.reserveL)
 assert.notEqual(r.source.caseDigest,historical.source.caseDigest)
 const lowRoof=structuredClone(active);lowRoof.choice.outfalls.clearHeightMm=75
 const failed=inletPlantTankedRoom(lowRoof)
 assert.equal(failed.containment.necessaryClosedPressureNetworkVolumeScreen,false)
 assert.ok(failed.outfalls.profiles.some(p=>typeof p.minimumSteadyClosedRoofAirReserveMm==='number'&&p.minimumSteadyClosedRoofAirReserveMm<0))
})

test('same Plant normal assembly controls inventory, source authority, route and case invalidation',()=>{
 const i=roomRequest(),r=inletPlantTankedRoom(i),larger=structuredClone(i)
 assert.equal(r.inventory.feedPathsFromSameNormalAssembly,true)
 assert.equal(r.normalInstallation.regulator.placedBeforeBothActualColdBranches,true)
 assert.ok(r.inventory.inlineRegulatorNetAddedOuterWaterUpperL>6)
 assert.deepEqual(r.inventory.feedRows.map((v:any)=>v.id),r.normalInstallation.branch.paths.map(v=>v.id))
 larger.choice.normalAssembly.prvCompleteEnvelopeMm=[160,160,300]
 const b=inletPlantTankedRoom(larger)
 assert.ok(b.inventory.fullInstantPressureNetworkDesignReleaseL>r.inventory.fullInstantPressureNetworkDesignReleaseL)
 assert.notEqual(b.source.caseDigest,r.source.caseDigest)
 const poor=structuredClone(i);poor.choice.normalAssembly.minimumKv=.3
 const failed=inletPlantTankedRoom(poor)
 assert.equal(failed.normalInstallation.regulator.necessaryAuthorityComparison,false)
 assert.equal(failed.normalHeatedInventory.necessaryRegulatorAuthorityComparison,false)
 assert.notEqual(failed.source.caseDigest,r.source.caseDigest)
 console.info('PLANT_SAME_ASSEMBLY '+JSON.stringify({inventory:r.inventory.fullInstantPressureNetworkDesignReleaseL,inline:r.inventory.inlineRegulatorNetAddedOuterWaterUpperL,reserve:r.containment.reserveL,normalGeometry:r.normalInstallation.geometryFailures,unions:r.normalInstallation.unionRenewal.tasks.map(p=>({id:p.id,necessary:p.necessaryExternalTwoToolGeometry,failures:p.rows.filter(v=>Math.min(v.minimumRoomMm,v.minimumObjectMm,v.minimumShaftPipeMm,v.minimumHeadOtherPipeMm,v.minimumOwnBodyMm,v.minimumArmMm)<0||v.reachWithSettingsMm>600)}))}))
})

test('actual Plant frame, door and bridge keep the same raised walking datum and technical cassettes',()=>{
 const r=inletPlantTankedRoom(roomRequest()),f=r.normalInstallation.branch.fittedFrame
 assert.equal(f.outerFrameWidthMm,1300);assert.equal(f.effectiveOpenWidthMm,1000)
 assert.deepEqual(f.infills.map(p=>p.widthMm),[150,150])
 assert.equal(f.sourceAxisYMm,4025)
 assert.ok(f.exactOuterArchGeometry?.necessaryExactRectangleFit)
 assert.equal(r.roomCoordination.fittedDoor.parkedLeafBoxMm[2],150)
 assert.equal(r.roomCoordination.fittedDoor.hingeMm[2],150)
 assert.ok(r.roomCoordination.fittedDoor.poses.every(p=>p.shoulderMm[2]===f.choice.operatorShoulderHeightMm+150))
 assert.ok(!r.roomCoordination.fittedDoor.diagnostics.includes('PLANT_FITTED_DOOR/frame-header-raw-arch'))
 assert.equal(r.walking.bridgePieces[0].boxMm[4],950)
 assert.equal(r.roomCoordination.bridge?.boxMm[2],r.walking.bridgePieces[0].boxMm[2])
 assert.deepEqual(r.roomCoordination.bridge?.railCentresYMm,r.choice.bridge.railYMm)
 assert.ok(r.roomCoordination.bridge?.railAboveOutfallPackageReserveMm!==null)
 assert.ok(r.roomCoordination.bridge!.removablePieces.pieces.every(p=>p.startBoxMm[2]===114))
 assert.ok(r.roomCoordination.bridge!.removablePieces.pieces.every(p=>p.minimumAuthoredFrameReserveMm>0&&p.minimumHomeObstacleReserveMm>0&&p.minimumActualPipeReserveMm>0))
 assert.ok(r.roomCoordination.bridge!.removablePieces.pieces.every(p=>p.phases.some(q=>q.id==='quarter-turn-on-exterior-deck')))
 assert.ok(r.roomCoordination.bridge!.removablePieces.pieces.every(p=>typeof p.externalTurnDeckReserveMm==='number'&&p.externalTurnDeckReserveMm>0))
 console.info('PLANT_ACTUAL_RAISED_ROOM_JOIN '+JSON.stringify({frame:f.exactOuterArchGeometry,sourceY:f.sourceAxisYMm,normal:r.normalInstallation.geometryFailures,door:{minima:r.roomCoordination.fittedDoor.minima,diagnostics:r.roomCoordination.fittedDoor.diagnostics,goods:r.roomCoordination.fittedDoor.goodsChecks},bridge:{box:r.roomCoordination.bridge?.boxMm,railCentres:r.roomCoordination.bridge?.railCentresYMm,verticalReserve:r.roomCoordination.bridge?.railAboveOutfallPackageReserveMm,pieces:r.roomCoordination.bridge?.removablePieces.pieces.map(p=>({id:p.id,kg:p.completeBudgetKg,frame:p.minimumAuthoredFrameReserveMm,obstacle:p.minimumHomeObstacleReserveMm,pipes:p.minimumActualPipeReserveMm,obstacleFailures:p.obstacleFailures,pipeFailures:p.pipeFailures,fittingFailures:p.fittingFailures})),diagnostics:r.roomCoordination.diagnostics},normalAuthority:r.normalInstallation.regulator.regulatorAuthorityReserveBar}))
})

test('actual exterior turning deck and the rejected interior quarter-turn invalidate dependent capture',()=>{
 const i=roomRequest(),r=inletPlantTankedRoom(i),bad=structuredClone(i)
 assert.equal(r.roomCoordination.fittedDoor.requiredExteriorDeckAbsoluteZMm,r.levels.walkingMm)
 assert.deepEqual(r.roomCoordination.fittedDoor.requiredClearExternalWorkDeckPlanMm,r.choice.externalDeckPlanMm)
 bad.choice.bridge.externalTurnCentreXYMm=[12300,4600]
 const b=inletPlantTankedRoom(bad)
 assert.ok(b.roomCoordination.bridge!.removablePieces.pieces.some(p=>typeof p.externalTurnDeckReserveMm==='number'&&p.externalTurnDeckReserveMm<0))
 assert.notEqual(b.source.caseDigest,r.source.caseDigest)
 const unsupported=structuredClone(i);unsupported.choice.bridge.externalTurnCentreXYMm=[13430,4450]
 assert.throws(()=>inletPlantTankedRoom(unsupported),/Actual external bridge turning station/)
 const interior=structuredClone(r.roomCoordination.resolvedInput);delete interior.bridgeRenewal
 const failed=inletSplitPlantRoom(interior)
 assert.ok(failed.bridge!.removablePieces.pieces.some(p=>p.minimumActualPipeReserveMm<0),'The former interior turn collides with the same current fixed P source, not a historical fixture.')
})

test('actual selected Plant pan and source walls own the same full RC, tapered F bed and matched feet',()=>{
 const r=inletPlantTankedRoom(roomRequest()),f=r.floorReplan.actualPocket,bed=r.walking.compressionSupport!
 assert.equal(f.local!.quantityBounds.glassM3,0)
 assert.deepEqual(f.local!.levelBoxes.map(b=>b.id),['mineralCourse','dryRC'])
 assert.deepEqual(f.local!.bodyMinMaxMm,[r.roomPlanMm[0],r.roomPlanMm[1],r.roomPlanMm[0]+r.roomPlanMm[2],r.roomPlanMm[1]+r.roomPlanMm[3]])
 assert.equal(bed.oldUniformGlassPhysicalGeometryRetired,true)
 assert.equal(bed.actualPeakContactPressureDistributionAccepted,false)
 assert.ok(bed.necessarySourceCoreXYSeparation)
 assert.ok(bed.necessaryStockEnvelope,JSON.stringify({thickness:bed.thicknessRangeMm,tiles:bed.tiles.map(t=>t.minimumInfillMm)}))
 assert.ok(bed.necessaryPanFootPressureComparisons,JSON.stringify(bed.feet.filter(f=>'necessaryWorkingPressureComparison'in f&&!f.necessaryWorkingPressureComparison)))
 assert.equal(bed.actualCompleteSupportAccepted,false)
 assert.ok(bed.normalMassUpperKg>100)
 assert.ok(bed.normalOrigins.length>0)
 assert.ok(bed.stepNotches.length>0)
 assert.equal(r.floorReplan.bedMassAlreadyIncludedInWalkingNormalUpperKg,true)
 const i=roomRequest(),changed=structuredClone(i),wall=changed.waterReplan.model.groundWalls.find((w:any)=>w.id==='plant-north');wall.structuralCore[0]=r.roomPlanMm[1]+r.roomPlanMm[3]-1
 const failed=inletPlantTankedRoom(changed)
 assert.equal(failed.walking.compressionSupport!.necessarySourceCoreXYSeparation,false)
 assert.notEqual(failed.source.caseDigest,r.source.caseDigest)
 console.info('PLANT_ACTUAL_COMPRESSION '+JSON.stringify({stockKg:r.walking.normalMassUpperKg,bedKg:bed.normalMassUpperKg,range:bed.thicknessRangeMm,tiles:bed.tiles.length,meanContact:bed.feet.filter(f=>'bedCompressiveMeanKPa'in f).map(f=>({id:f.id,kPa:f.bedCompressiveMeanKPa})),rcDelta:bed.rcMineralDeltaWrenchAboutGlobalZeroKN_KNm,core:'plantCompression'in f?f.plantCompression?.sourceCoreChecks:[],containment:r.containment}))
})

test('the selected complete platform carries every actual foot blank and refreshed source load',()=>{
 const r=inletPlantTankedRoom(roomRequest()),w=r.walking,bed=w.compressionSupport!,stock=r.floorReplan.steelFootBlank
 assert.equal(w.apparatusInterfaces.length,0)
 assert.equal(w.appliancePlatform!.retiredIndependentPedestalCount,8)
 assert.ok(w.unifiedDetails!.physicalPanelPieces.every(p=>p.completeMassUpperKg<=r.choice.grating.maximumCompletePanelKg))
 assert.ok(stock.necessaryGeometricStockAndMachiningComparison,JSON.stringify(stock))
 assert.equal(stock.everyActualFootprintIncluded,true)
 assert.ok(stock.stockRows.some(p=>p.planLWMM[0]===230&&p.planLWMM[1]===230&&p.fullFactoryBlankUpperKg>20))
 assert.ok(stock.stockRows.every(p=>p.fullFactoryBlankUpperKg<=stock.choice.maximumBlankKg))
 assert.equal(w.appliancePlatform!.choice.loadedPadBlankUpperMm,stock.choice.maximumMeasuredThicknessMm)
 assert.ok(w.necessaryMemberComparisons,JSON.stringify(w.memberChecks.filter(c=>!c.necessary)))
 assert.ok(bed.necessaryPanFootPressureComparisons)
 assert.equal(bed.actualPeakContactPressureDistributionAccepted,false)
 assert.equal(r.bufferNormal.actualBodyCaptureLiftAndLowerToSourceCarrierAccepted,false)
 const thin=structuredClone(roomRequest());thin.choice.panCompression.footBlank.minimumMeasuredThicknessMm=26
 const failed=inletPlantTankedRoom(thin)
 assert.equal(failed.floorReplan.steelFootBlank.necessaryGeometricStockAndMachiningComparison,false)
 assert.notEqual(failed.source.caseDigest,r.source.caseDigest)
 const narrow=structuredClone(roomRequest());narrow.choice.appliancePlatform.bufferFootPlanMm=[100,100]
 const overloaded=inletPlantTankedRoom(narrow)
 assert.equal(overloaded.walking.compressionSupport!.necessaryPanFootPressureComparisons,false)
 console.info('PLANT_COMPLETE_PLATFORM_SELECTION '+JSON.stringify({case:r.source.caseDigest,stock,platform:w.appliancePlatform!.chassis.map(a=>({id:a.id,nodes:a.nodes,mounts:a.mounts,bodyPlane:a.bodyBearingPlaneMm})),physicalPieces:w.unifiedDetails!.physicalPanelPieces.length,panelMaximumKg:Math.max(...w.unifiedDetails!.physicalPanelPieces.map(p=>p.completeMassUpperKg)),massUpperKg:w.normalMassUpperKg,volume:r.containment,meanFootPressure:bed.feet.filter(f=>'bedCompressiveMeanKPa'in f).map(f=>({id:f.id,kPa:f.bedCompressiveMeanKPa}))}))
})
test('normal source temperature and actual matched platform movement invalidate dependent evidence',()=>{
 const i=roomRequest(),r=inletPlantTankedRoom(i),hot=structuredClone(i)
 assert.equal(r.choice.grating.maximumUniformTemperatureExcursionK,80)
 assert.ok(r.walking.unifiedDetails!.footPanClearances.every(p=>p.afterSettingsAndSteelThermalMm>=0))
 hot.choice.grating.maximumUniformTemperatureExcursionK=100
 const failed=inletPlantTankedRoom(hot)
 assert.ok(failed.walking.appliancePlatform!.chassis.some(p=>!p.matchedMount.necessaryMatchedFit))
 assert.ok(failed.diagnostics.includes('PLANT_TANK/selected-platform-member-capture-or-fit-comparison-fails'))
 assert.notEqual(failed.source.caseDigest,r.source.caseDigest)
 const duty=structuredClone(i);duty.services.plant.heatPump.primary[0]=90
 const invalid=inletPlantTankedRoom(duty)
 assert.equal(invalid.normalMetalTemperature.necessarySourceDutyCoverage,false)
 assert.ok(invalid.diagnostics.includes('PLANT_TANK/normal-metal-temperature-design-range-does-not-cover-source-duty'))
})
