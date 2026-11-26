import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {plantTankedWalkingSurface,type PlantWalkControl,type PlantWalkApparatus} from './current-design/inlet-plant-tanked-walk.js'
const read=(p:string)=>JSON.parse(readFileSync(new URL('../../project/had/studies/'+p,import.meta.url),'utf8'))
const raw=read('inlet-plant-tanked-walk-candidate.json'),services=read('current-house-services.json').plant,v=read('inlet-store-vessel-candidate.json')
const near=(a:number,b:number,t=1e-5)=>assert.ok(Math.abs(a-b)<t,a+' != '+b)
const control={schema:'had-appliance-platform/1' as const,id:'HAD/one-unified-appliance-platform',loadedPadSideMm:230,loadedPadMinimumThicknessMm:25,loadedHeadLWtMm:[40,80,35]as const,webWHMm:[40,70]as const,maximumCapturedMemberKg:22,hardwareEachChassisKg:3,mountBoltDiameterMm:12,mountBoltHoleMm:14,bufferCradleRiseMm:70,factoryBaseTopLocalMm:500,factoryBaseLegSideMm:40,maximumMatchedMountErrorMm:3,factoryPositionErrorEachMm:.25,minimumSteelDensityKgM3:7850,perimeterInsetMm:25,postColumnRelocation:{sourceColumnIndex:4,targetXMm:10770},bufferFootPlanMm:[200,150]as const,loadedNodeBlockLWtMm:[180,140,60]as const,loadedPadBlankUpperMm:46,cutEdgeRimMm:6,additionalCutPanelHardwareKg:.5,railPocketSideClearanceMm:25}
const choice={...raw,walkingRiseAboveHouseFflMm:150,appliancePlatform:control,walkingFrame:{...raw.walkingFrame,footPadSideMm:150,footPadThicknessMm:25},grating:{...raw.grating,bearingBarHeightMm:70,bearingBarThicknessMm:6,rimHeightMm:70,maximumCompletePanelKg:18}} as PlantWalkControl
const source=(objectPath:string)=>({path:'project/had/studies/current-house-services.json',gitBlob:'e649805e78244527fe6498b516fa5f23734ac5ea',objectPath})
const C=services.cylinder,B=services.primaryBuffer,axis=C.centre as [number,number],ba=[B.body[0]+B.body[2]/2,B.body[1]+B.body[3]/2]as const,
 box=(r:readonly number[])=>[r[0],r[1],r[0]+r[2],r[1]+r[3]]as const,
 bufferFluid=Math.PI/4*B.body[2]**2*B.height/1e6*raw.apparatusDesign.maximumPrimaryFluidDensityKgM3/1000,
 apparatus:PlantWalkApparatus[]=[{id:'Plant/cylinder',source:source('plant.cylinder'),homePlanMm:C.body,bodyBottomAbsoluteMm:680,bodyHeightMm:C.height,normalFilledMassUpperKg:v.handling.maximumCompleteDryCargoKg+v.maximumBodyAndPortsLitres,requiredPanelLiftMm:12,platformSource:{id:'Plant/cylinder',source:source('plant.cylinder'),homePlanMm:C.body,axisXYMm:axis,lowestWettedLocalMm:v.inner.lowestWettedZMm,supportMode:'bespoke-three-pickups',components:[{id:'complete-dry-including-factory-base',role:'dry',maximumKg:v.handling.maximumCompleteDryCargoKg,cgPlanMinMaxMm:[axis[0]-30,axis[1]-30,axis[0]+30,axis[1]+30],sourceRequirement:'Unprocured factory CG envelope; no measured acceptance',wholeEnvelopeCountercaseMm:box(C.body)},{id:'whole-store-water',role:'liquid',maximumKg:v.maximumBodyAndPortsLitres,cgPlanMinMaxMm:[axis[0],axis[1],axis[0],axis[1]],ports:{maximumWaterKg:v.maximumWettedPortsAndAccessoriesLitres,planMinMaxMm:[axis[0]-C.cartRadius,axis[1]-C.cartRadius,axis[0]+C.cartRadius,axis[1]+C.cartRadius]}}]}},{id:'Plant/buffer',source:source('plant.primaryBuffer'),homePlanMm:B.station,bodyBottomAbsoluteMm:750,bodyHeightMm:B.height,normalFilledMassUpperKg:B.dryFullKg[0]+raw.apparatusDesign.maximumBufferRetainedAncillaryDryKg+bufferFluid,requiredPanelLiftMm:12,platformSource:{id:'Plant/buffer',source:source('plant.primaryBuffer'),homePlanMm:B.station,bodyPlanMm:B.body,axisXYMm:ba,supportMode:'buffer-four-gravity',components:[{id:'source-body-dry',role:'dry',maximumKg:B.dryFullKg[0],cgPlanMinMaxMm:box(B.body)},{id:'retained-ancillary-dry',role:'dry',maximumKg:raw.apparatusDesign.maximumBufferRetainedAncillaryDryKg,cgPlanMinMaxMm:box(B.station)},{id:'source-outer-cylinder-fluid-upper',role:'liquid',maximumKg:bufferFluid,cgPlanMinMaxMm:[ba[0],ba[1],ba[0],ba[1]]}]}}]
const input={choice,apparatus,roomPlanMm:[9397,3797,2173.5,1983.5]as const,houseFflMm:530,initialWaterMm:438.37,maximumWaterMm:660,wheelN:3708.18,panMinimumMm:316.8,panMaximumMm:349.54,bridgeInnerXMm:11520.5,bridgeOuterXMm:12130,bridgePlateYMm:[4125,5075]as const,outfallRoofMaximumMm:482,sourceRoofAtExternalBeamMm:466,settingEachMm:10}
const run=(i:Parameters<typeof plantTankedWalkingSurface>[0]=input)=>plantTankedWalkingSurface(i)
test('one actual platform replaces eight duplicate supports and has real positive coped seats and above-floor six-bar buffer cradle',()=>{
 const r=run(),p=r.appliancePlatform!,d=r.unifiedDetails!
 const summary={sourceDigest:r.sourceDigest,githubCommit:process.env.GITHUB_SHA??null,normalMassUpperKg:r.normalMassUpperKg,solidsIncrementUpperL:r.solidsIncrementUpperL,physicalPanelPieceCount:d.physicalPanelPieces.length,maximumCompletePanelPieceKg:Math.max(...d.physicalPanelPieces.map(p=>p.completeMassUpperKg)),minimumFootPanAfterSettingsAndSteelThermalMm:Math.min(...d.footPanClearances.map(c=>c.afterSettingsAndSteelThermalMm)),finalDemandBasis:d.finalDemandBasis,normalNodeRestoringCases:d.normalNodeRestoringCases,chassis:p.chassis.map(a=>({id:a.id,nodes:a.nodes,caseCount:a.cases.length,minimumFactoryDryKg:a.minimumFactoryCompleteDryKgFromBaseGeometry,minimumPermanentChassisSteelMassKg:a.minimumPermanentChassisSteelMassKg,minimumSignedBodyMountN:Math.min(...a.demand.map(n=>n.minimumBodyMountForceN)),normalMaximumBoltTensionN:Math.max(...a.demand.map(n=>n.normalChassisTensionN)),maximumCompressionWithOneWheelN:Math.max(...a.demand.map(n=>n.compressionN)),matchedMount:a.matchedMount,memberChecks:a.memberChecks,selectedBodyGravityAllCompressive:a.necessarySelectedGravityCG,selectedFactoryDryCgCondition:a.necessaryFactoryDryCGContainment})),factoryPressureBoltToolAndPeakAcceptance:false}
 console.log('PLANT_UNIFIED_PLATFORM_CASE '+JSON.stringify(summary))
 if(process.env.RUNNER_TEMP){const dir=join(process.env.RUNNER_TEMP,'had-utility-west-proof');mkdirSync(dir,{recursive:true});writeFileSync(join(dir,'plant-unified-platform-current-case.json'),JSON.stringify(summary,null,2))}
 assert.ok(p&&d)
 assert.equal(r.parts.filter(p=>p.kind==='apparatus-stand-pad'||p.kind==='apparatus-RHS-post'||p.kind==='apparatus-stand-cap').length,0)
 assert.equal(p.retiredIndependentPedestalCount,8)
 assert.equal(p.loadedNodes.length,7)
 assert.equal(r.parts.filter(p=>p.kind==='solid-foot-pad').length,56)
 const s=p.chassis.find(a=>a.id==='Plant/cylinder')!,b=p.chassis.find(a=>a.id==='Plant/buffer')!
 assert.equal(s.nodes.length,3);assert.equal(b.nodes.length,4)
 assert.equal(s.edges.length,0);assert.equal(b.edges.length,6);assert.equal(b.ledges.length,8)
 assert.deepEqual(b.nodes,[[10121.333333333334,4930.5],[10770,4930.5],[10770,5680.5],[10121.333333333334,5680.5]])
 assert.equal(s.bodyBearingPlaneMm,680);assert.equal(b.bodyBearingPlaneMm,750)
 assert.ok(b.edges.every(e=>e.webTopMm===750&&e.webTopMm-e.webWHMm[1]>=680))
 assert.ok(b.ledges.every(e=>e.boxMm[2]===680&&e.boxMm[2]+e.boxMm[5]===705))
 assert.equal(b.bufferBodyBearingPatches.length,4)
 assert.ok(d.actualCompressionMates.every((m:any)=>m.verticalCompressionGapMm===0&&m.lateralAfterTwoSettingsMm>=5))
 assert.ok(d.physicalPanelPieces.length>=42)
 assert.ok(d.physicalPanelPieces.every(p=>p.completeMassUpperKg<=18),JSON.stringify(d.physicalPanelPieces.filter(p=>p.completeMassUpperKg>18)))
 assert.ok(d.footPanClearances.every(c=>c.afterSettingsAndSteelThermalMm>=0),JSON.stringify(d.footPanClearances.filter(c=>c.afterSettingsAndSteelThermalMm<0)))
 assert.ok(d.finalDemandBasis!.allDemandRecomputedAfterActualCutRimsAndStocks)
 assert.ok(r.necessaryMemberComparisons,JSON.stringify(r.memberChecks.filter(q=>!q.necessary)))
 assert.ok(d.necessaryNodeComponentComparisons,JSON.stringify(d.componentChecks.filter(q=>!q.necessary)))
 assert.equal(r.renewal.everyPanelIndependentOfApparatusRemoval,false)
 assert.equal(r.actualCompleteInstallationAccepted,false)
})
test('actual component CG cases give signed unique store reactions and feasible four-contact bounds without equal sharing',()=>{
 const r=run(),p=r.appliancePlatform!,s=p.chassis[0],b=p.chassis[1]
 assert.ok(s.necessaryFactoryDryCGContainment);assert.equal(s.wholeEnvelopeCountercaseGravityCG,false)
 assert.ok(s.demand.some(d=>d.counterTensionN>0))
 assert.ok(b.necessarySelectedGravityCG)
 assert.ok(r.unifiedDetails!.normalNodeRestoringCases.every(c=>c.necessaryNoNormalFloorAnchor))
 assert.ok(b.cases.some(c=>c.id.includes('source-body-dryMass=0')))
 assert.ok(b.cases.some(c=>c.id.includes('retained-ancillary-dryMass=0')))
 assert.ok(b.cases.some(c=>Math.abs(c.permanentSteelDensityKgM3-7850)<1e-7)&&b.cases.some(c=>Math.abs(c.permanentSteelDensityKgM3-8000)<1e-7))
 near(s.minimumFactoryCompleteDryKgFromBaseGeometry!,19.9704)
 assert.ok(s.demand.some(n=>n.normalChassisTensionN>0))
 assert.ok(s.cases.some(c=>c.liquidFraction===0)&&s.cases.some(c=>c.liquidFraction===.5)&&s.cases.some(c=>c.liquidFraction===1)&&s.cases.some(c=>c.bodyRemoved))
 for(const c of s.cases){near(c.sumForceResidualN!,0);near(c.firstXMomentResidualNMm!,0);near(c.firstYMomentResidualNMm!,0)}
 for(const c of b.cases){assert.equal(c.mountCompressionPositiveN,null);for(const forces of c.admissibleExtremeContactsN){assert.ok(forces.every(f=>f>=-1e-6));near(forces.reduce((n,f)=>n+f,0),c.totalMassUpperKg*9.81);near(forces.reduce((n,f,k)=>n+f*b.nodes[k][0],0),c.sourceFirstMassMomentsKgMm[0]*9.81);near(forces.reduce((n,f,k)=>n+f*b.nodes[k][1],0),c.sourceFirstMassMomentsKgMm[1]*9.81)}}
 near(b.dryMaximaWeightedCGBoxMm[0],10161.346153846154)
 assert.ok(b.matchedMount.necessaryMatchedFit)
 assert.equal(s.factoryBaseGeometry!.massAlreadyIncludedInCompleteDryCargo,true)
 assert.equal(s.actualFactoryBodyBaseLoadIntroductionAccepted,false)
})
test('unearned body shift, inherited zero perimeter clearance and whole factory CG counterexample remain real failures',()=>{
 const noShift=structuredClone(input);noShift.apparatus[1].bodyBottomAbsoluteMm=680
 assert.throws(()=>run(noShift),/body bottom/)
 const edge=structuredClone(input);edge.choice.appliancePlatform!.perimeterInsetMm=0
 assert.throws(()=>run(edge),/perimeter clearance/)
 const heat=structuredClone(input);heat.choice.grating.maximumUniformTemperatureExcursionK=100
 const h=run(heat);assert.ok(h.appliancePlatform!.chassis.some(c=>!c.matchedMount.necessaryMatchedFit))
 const altered=structuredClone(input);altered.apparatus[0].platformSource={...altered.apparatus[0].platformSource!,components:altered.apparatus[0].platformSource!.components.map((q,k)=>k===0?{...q,cgPlanMinMaxMm:box(C.body)}:q)}
 const bad=run(altered);assert.equal(bad.appliancePlatform!.chassis[0].necessaryFactoryDryCGContainment,false)
 const density=structuredClone(input);density.choice.appliancePlatform!.minimumSteelDensityKgM3=7500
 const lighter=run(density)
 assert.ok(lighter.unifiedDetails!.normalNodeRestoringCases[0].minimumOwnLocalGravityN<run().unifiedDetails!.normalNodeRestoringCases[0].minimumOwnLocalGravityN)
 assert.notEqual(lighter.sourceDigest,run().sourceDigest)
})
