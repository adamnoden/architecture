import assert from 'node:assert/strict'
import test from 'node:test'
import {execFileSync} from 'node:child_process'
import {readCurrentDesignResolution} from './current-design/resolve.js'
import {readGeorgianDesignSnapshot} from './current-design/georgian-source.js'
import {readEngineeringDocument,compileEngineeringDocument} from './current-design/engineering-document.js'
import {readInletSourceEnvelopeCase,runInletSourceEnvelopeCase} from './current-design/inlet-source-envelope.js'
const resolved=readCurrentDesignResolution(),request=readInletSourceEnvelopeCase(resolved)
const baseline=runInletSourceEnvelopeCase(resolved,request.sourceEnvelope)
const run=(edit:object)=>runInletSourceEnvelopeCase(resolved,{...request.sourceEnvelope,settings:{...request.sourceEnvelope.settings,...edit}})

test('distinct authored duties recover Utility operation and decisively reject the old Plant receiver',()=>{
 const [u,p]=baseline.branches
 assert.equal(u.requiredDeliveryEachLmin,20);assert.equal(p.requiredDeliveryEachLmin,45)
 assert.equal(baseline.joinedDirection.designDuties.commonSourceSimultaneousLmin,65)
 assert.equal(u.minimumResidualScreen,true);assert.ok(Math.abs(u.residualPressureComparisonBar-1.225392)<1e-6)
 assert.equal(u.existingReceiver.limitedFault.necessaryChannelAndReceiverScreen,true)
 assert.equal(u.feasibleNominalApertureIntervalMm.existsForNecessaryScreens,true)
 assert.equal(p.minimumResidualScreen,true,'Chosen larger Plant bore restores delivery only')
 assert.equal(p.existingReceiver.limitedFault.necessaryChannelAndReceiverScreen,false)
 assert.equal(p.feasibleNominalApertureIntervalMm.existsForNecessaryScreens,false)
 assert.equal(p.feasibleNominalApertureIntervalMm.optimisticCdOneIntervalExists,false)
 assert.ok(Math.abs(p.feasibleNominalApertureIntervalMm.minimumForDelivery!-10.112074)<1e-6)
 assert.ok(Math.abs(p.feasibleNominalApertureIntervalMm.maximumForExistingReceiver-6.794418)<1e-6)
 assert.equal(baseline.preSiteArrangementComplete,false)
})

test('flow upper bound is independent of delivery Cd, includes bore tolerance and never borrows crown-only capacity',()=>{
 const u=baseline.branches[0],d=.0066,independent=Math.PI*d*d/4*Math.sqrt(2*1010000/990)*60000
 assert.ok(Math.abs(u.maximumLimitedEachLmin-independent)<1e-6)
 assert.equal(u.minimumDiameterMm,6.4);assert.equal(u.maximumDiameterMm,6.6)
 assert.ok(Math.abs(u.existingReceiver.maximumScreenedLmin-101.179931)<1e-6)
 assert.ok(u.existingReceiver.crownOnlyCapacityLmin>u.existingReceiver.maximumScreenedLmin+20)
 assert.ok(u.existingReceiver.limitedFault.staticHeadReserveMm!>8)
 const worse=run({dischargeCoefficientComparison:.5})
 assert.equal(worse.bound.maximumCombinedLmin,baseline.bound.maximumCombinedLmin)
 assert.ok(worse.branches[0].pressureLossComparisonBar>u.pressureLossComparisonBar)
 assert.equal(worse.branches[0].dischargeCoefficientQualified,false)
 assert.equal(run({requiredUtilityLmin:22}).branches[0].minimumResidualScreen,false)
 assert.equal(run({requiredUtilityLmin:22}).branches[1].maximumLimitedEachLmin,baseline.branches[1].maximumLimitedEachLmin)
})

test('the symmetric50/50 predecessor remains reproducible as an explicit adverse request and recovery is not permanent loss',()=>{
 const old={requiredUtilityLmin:50,requiredPlantLmin:50,utilityApertureNominalMm:9,plantApertureNominalMm:9,
  utilityNetworkLossBar:.5,plantNetworkLossBar:.5,dischargeCoefficientComparison:.62}
 assert.ok(run(old).branches.every(b=>!b.feasibleNominalApertureIntervalMm.existsForNecessaryScreens))
 const recovered=run({...old,utilityApertureNominalMm:6.5,plantApertureNominalMm:6.5,dischargeCoefficientComparison:1,pressureRecoveryFractionComparison:.9})
 assert.ok(recovered.branches.every(b=>b.minimumResidualScreen&&b.nonnegativeThroatPressureScreen&&b.existingReceiver.limitedFault.necessaryChannelAndReceiverScreen))
 const noRecovery=run({...old,utilityApertureNominalMm:6.5,plantApertureNominalMm:6.5,dischargeCoefficientComparison:1})
 assert.equal(noRecovery.bound.maximumCombinedLmin,recovered.bound.maximumCombinedLmin)
 assert.ok(noRecovery.branches.every(b=>!b.minimumResidualScreen))
 const ideal=run({...old,utilityApertureNominalMm:6.5,plantApertureNominalMm:6.5,dischargeCoefficientComparison:1,
  pressureRecoveryFractionComparison:1,sourceMinimumDynamicBar:3,requiredResidualBar:2.5})
 assert.ok(ideal.branches.every(b=>b.feasibleNominalApertureIntervalMm.existsForNecessaryScreens))
 assert.ok(run({...ideal.settings,pressureRecoveryFractionComparison:.999}).branches.every(b=>!b.feasibleNominalApertureIntervalMm.existsForNecessaryScreens))
 assert.equal(recovered.bound.pressureRecoveryAndCavitationQualified,false)
})

test('joined direction prices cold backfeed, open-bowl taps, actual stored release and separate outdoor PV without false approval',()=>{
 const j=baseline.joinedDirection
 assert.equal(j.transfer.jacketMaximumMm,80.1,'28.1mm tube must retain actual25mm radial insulation and1mm jackets, not borrow22mm pipe envelope')
 assert.equal(j.designDuties.fixtureIds.length,14)
 assert.deepEqual(j.topology.directUtilityColdOnly,['utility-sink-PROPOSED','washer-PROPOSED'])
 assert.match(j.topology.retireColdTreeConnection,/ground-utility/)
 assert.equal(j.topology.oldColdConnectionRetiredInOccupiedSource,false)
 assert.equal(j.topology.requiredSink.mixingOnlyInOpenBowl,true)
 assert.equal(j.storedRelease.actualMaximumRetainedAndDrainableL,null)
 assert.equal(j.storedRelease.catalogueOrMinimumUsedAsMaximum,false)
 assert.equal(j.storedRelease.houseSideFlowLimitedByLodgeAperture,false)
 assert.equal(j.room.newMainboard.actualBoardContentsSelected,false)
 assert.equal(j.pv.combinedIndoorBoardPvRejected,true)
 assert.deepEqual(j.pv.existingDnoClearBayMm,[795,1100,250])
 assert.ok(j.pv.requiredWidthMm>j.pv.existingDnoClearBayMm[0])
 assert.equal(j.pv.moduleStringsAndCablesMatched,false)
 assert.equal(j.room.doorOpenSprayPass,false)
 assert.equal(j.receivingAndThermal.newPipeAndWetLoadsIn52HeadSolve,false)
 assert.ok(j.receivingAndThermal.rejectTransplantedBase.afterTwo5MmSettings<0)
 assert.equal(j.completeArrangementSelected,false)
 assert.equal(j.hadPacketComplete,false)
 assert.equal(baseline.materials.knownPolymerItemsAcrossTwoValves,6)
 assert.equal(baseline.materials.ownerExceptionsApproved,0)
})

test('real transfer elevation and enclosure edits propagate adverse clearance and actual drawing without moving the source house',()=>{
 const changed=run({plantTransferZMm:2220,mainboardNorthOffsetMm:400})
 assert.ok(baseline.joinedDirection.transfer.bufferAfter10Mm>0)
 assert.ok(changed.joinedDirection.transfer.bufferAfter10Mm<0)
 assert.ok(changed.joinedDirection.room.newMainboard.northWallAfter10Mm<0)
 assert.notEqual(changed.reviewSvg,baseline.reviewSvg)
 assert.deepEqual(changed.joinedDirection.room.retainedFurniture,baseline.joinedDirection.room.retainedFurniture)
 assert.deepEqual(changed.joinedDirection.transfer.retainedPlantCylinderPathMm,baseline.joinedDirection.transfer.retainedPlantCylinderPathMm)
 assert.equal(changed.joinedDirection.room.replacementOccupiedHouseCompiled,false)
})

test('complete pressure and renewal states do not bound stored water or bypass with the restriction',()=>{
 const state=(id:string)=>baseline.states.find(s=>s.id===id)!
 assert.match(state('downstream-house-cut-closed').result,/full-source-static-pressure/)
 assert.ok(state('restriction-missing-eroded-or-bypassed').eachLmin!>1300)
 assert.equal(state('upstream-of-restriction-rupture').eachLmin,null)
 assert.equal(state('both-branches-rupture').combinedLmin,baseline.bound.maximumCombinedLmin)
 assert.equal(state('both-reliefs-blocked').result,'reject-unattended-event')
 assert.equal(state('downstream-indoor-cut-or-upper-joint-fault').result,'reject-uncontained-upper-network')
 assert.match(state('frost-or-loss-of-warmth').result,/whole-route/)
 for(const b of baseline.branches){assert.equal(b.internalHouseCut.required,true);assert.equal(b.internalHouseCut.suppliedByLodge,false)}
})

test('stale identities, unknown branch/duty and injected results reject; exact data round-trip replays',()=>{
 assert.throws(()=>runInletSourceEnvelopeCase(resolved,{...request.sourceEnvelope,bindingDigest:'old'}),/Stale/)
 assert.throws(()=>runInletSourceEnvelopeCase(resolved,{...request.sourceEnvelope,selected:true}),/Versioned/)
 assert.throws(()=>run({sourceMaximumTotalBar:NaN}),/comparison domain/)
 assert.throws(()=>run({requiredUtilityLmin:17}),/comparison domain/)
 assert.throws(()=>run({sourceMinimumDynamicBar:9.1}),/comparison domain/)
 assert.throws(()=>run({derivedMaximumFlow:90}),/Complete authored/)
 assert.throws(()=>run({...request.sourceEnvelope.settings,requiredEachLmin:50}),/Complete authored/)
 const missing={...resolved,disciplineBindings:resolved.disciplineBindings.map(f=>f.id==='had-fixed-inlet-arrangement'?{...f,identities:{...f.identities,'project/had/studies/south-inlet-relief.json':'missing'}}:f)}
 assert.throws(()=>readInletSourceEnvelopeCase(missing),/missing inlet source-envelope binding/)
 assert.deepEqual(runInletSourceEnvelopeCase(resolved,JSON.parse(JSON.stringify(request.sourceEnvelope))),baseline)
})

test('saved document and public CLI carry branch and room edits through the existing transport then reverse',async()=>{
 const original=await readEngineeringDocument(readGeorgianDesignSnapshot())
 assert.ok(!Object.hasOwn(original.stages,'inletSourceEnvelope'))
 const doc={...original,stages:{inletSourceEnvelope:request.sourceEnvelope.settings}}
 const first=await compileEngineeringDocument(JSON.parse(JSON.stringify(doc)))
 const changedDoc={...doc,stages:{inletSourceEnvelope:{...request.sourceEnvelope.settings,utilityApertureNominalMm:6.7,plantTransferZMm:2220,mainboardBaseZMm:2600}}}
 const changed=JSON.parse(execFileSync(process.execPath,['--import','tsx','scripts/compile-current-design.ts','--bundle','-'],{input:JSON.stringify(changedDoc),encoding:'utf8',maxBuffer:24*1024*1024}))
 const a=first.engineering.inletSourceEnvelope!,c=changed.engineering.inletSourceEnvelope
 assert.notEqual(a.branches[0].maximumLimitedEachLmin,c.branches[0].maximumLimitedEachLmin)
 assert.notEqual(a.branches[0].existingReceiver.limitedFault.entranceHeadMm,c.branches[0].existingReceiver.limitedFault.entranceHeadMm)
 assert.deepEqual(a.branches[1],c.branches[1])
 assert.ok(c.joinedDirection.transfer.bufferAfter10Mm<0)
 assert.equal(c.joinedDirection.room.newMainboard.proposedGrossBoxMm[2],2600)
 assert.equal(c.joinedDirection.room.electricalScreen.visibility.allDirectPortalRaysIntercepted,false)
 assert.notEqual(a.reviewSvg,c.reviewSvg)
 assert.deepEqual(changed.plans,JSON.parse(JSON.stringify(first.plans)))
 assert.equal(changed.manifest.find((r:any)=>r.stage==='occupiedServices').applicability.controllingStage,'inletSourceEnvelope')
 assert.ok(changed.coordinationDiagnostics.some((r:any)=>r.code==='INLET_SOURCE_AND_ROOM_REPLAN_NOT_COORDINATED'))
 assert.deepEqual((await compileEngineeringDocument(doc)).engineering.inletSourceEnvelope,a)
 const standalone=JSON.parse(execFileSync(process.execPath,['--import','tsx','scripts/compile-current-design.ts','--inlet-source-envelope','-'],{input:JSON.stringify({...request,sourceEnvelope:{...request.sourceEnvelope,settings:changedDoc.stages.inletSourceEnvelope}}),encoding:'utf8',maxBuffer:4*1024*1024}))
 assert.deepEqual(standalone,c)
})

test('actual elevated mainboard and complete portal shield join geometry, source actions and sheet quantities',()=>{
 const room=baseline.joinedDirection.room,shield=room.electricalScreen
 assert.equal(room.newMainboard.proposedGrossBoxMm[2],900)
 assert.ok(shield.nominalClearHeightMm >= 3000)
 assert.equal(shield.visibility.allDirectPortalRaysIntercepted,true)
 assert.ok(shield.visibility.portalToShieldReserveMm>0)
 assert.ok(shield.ordinaryRouteAfterSettingMm>300)
 assert.ok(shield.actions.totalFlatSheetOnlyKg>90)
 assert.equal(shield.wetBoundary.assembledElectricalOrInstalledAcceptance,false)
 assert.equal(shield.actions.localImpactPanelAndIndependentFloorCeilingSupportQualified,false)
 assert.equal(shield.changedGroundOrSlabHeightAcceptanceTransferred,false)
 const raised=run({mainboardBaseZMm:2600})
 assert.equal(raised.joinedDirection.room.electricalScreen.visibility.allDirectPortalRaysIntercepted,false)
 assert.ok(raised.joinedDirection.diagnostics.includes('MAINBOARD_SCREEN_DIRECT_PORTAL_INTERCEPTION_FAILS'))
 assert.deepEqual(raised.branches,baseline.branches,'Board elevation does not alter the hydraulic branches')
 assert.notEqual(raised.reviewSvg,baseline.reviewSvg)
 const stronger=run({plantApertureNominalMm:10.4})
 assert.ok(stronger.joinedDirection.room.electricalScreen.actions.simultaneousPairN>shield.actions.simultaneousPairN)
 assert.deepEqual(stronger.joinedDirection.room.electricalScreen.panels,shield.panels)
 assert.throws(()=>run({mainboardBaseZMm:0}),/comparison domain/)
})
