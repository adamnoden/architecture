import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {derivePostRowGridAxes} from './current-design/inlet-plant-post-row-bridge.js'
import {plantTankedWalkingSurface,plantGrateRimOutsideExclusions,type PlantWalkControl,type PlantWalkApparatus} from './current-design/inlet-plant-tanked-walk.js'
const read=(p:string)=>JSON.parse(readFileSync(new URL('../../project/had/studies/'+p,import.meta.url),'utf8'))
const raw=read('inlet-plant-tanked-walk-candidate.json'),services=read('current-house-services.json').plant,v=read('inlet-store-vessel-candidate.json')
const near=(a:number,b:number,t=1e-5)=>assert.ok(Math.abs(a-b)<t,a+' != '+b)
// The selected geometry is owned by the same input as the whole-room producer.
// Only the immutable comparison pan below remains an explicit unit fixture.
const control={...raw.appliancePlatform,loadedPadBlankUpperMm:raw.panCompression.footBlank.maximumMeasuredThicknessMm}
const bridge={...raw.bridge,topology:'outer-grid-post-row' as const,thicknessMm:40,pieceCount:15,postRow:{innerGirderXMm:11490,outerGirderXMm:12080,plankInnerXMm:11440,plankOuterXMm:12130,sharedPostColumnIndex:6,sharedPostYMm:[4080,4363.5,4647,4930.5,5214],innerGirderEndYMm:[4080,5214]as const,innerSeatPackerMm:30,girderSectionWHtMm:[100,100,8]as const,maximumGirderWallMm:8.5,capThicknessMm:35,capWidthYMm:80,railCorbelLXtMm:[50,30]as const,matchedSeatErrorMm:3,grateToBridgeGapMm:6,perimeterGapMm:35,postSectionWHtMm:[60,60,5]as const,sharedPostDesignCeilingN:9000,maximumMechanicallyCapturedGirderKg:60}}
const choice={...raw,bridge,appliancePlatform:control} as PlantWalkControl
const source=(objectPath:string)=>({path:'project/had/studies/current-house-services.json',gitBlob:'e649805e78244527fe6498b516fa5f23734ac5ea',objectPath})
const C=services.cylinder,B=services.primaryBuffer,axis=C.centre as [number,number],dryCG=raw.appliancePlatform.storeFactoryDryCGHalfExtentsMm as [number,number],ba=[B.body[0]+B.body[2]/2,B.body[1]+B.body[3]/2]as const,
 box=(r:readonly number[])=>[r[0],r[1],r[0]+r[2],r[1]+r[3]]as const,
 bufferFluid=Math.PI/4*B.body[2]**2*B.height/1e6*raw.apparatusDesign.maximumPrimaryFluidDensityKgM3/1000,
 apparatus:PlantWalkApparatus[]=[{id:'Plant/cylinder',source:source('plant.cylinder'),homePlanMm:C.body,bodyBottomAbsoluteMm:680,bodyHeightMm:C.height,normalFilledMassUpperKg:v.handling.maximumCompleteDryCargoKg+v.maximumBodyAndPortsLitres,requiredPanelLiftMm:12,platformSource:{id:'Plant/cylinder',source:source('plant.cylinder'),homePlanMm:C.body,axisXYMm:axis,lowestWettedLocalMm:v.inner.lowestWettedZMm,supportMode:'bespoke-three-pickups',components:[{id:'complete-dry-including-factory-base',role:'dry',maximumKg:v.handling.maximumCompleteDryCargoKg,cgPlanMinMaxMm:[axis[0]-dryCG[0],axis[1]-dryCG[1],axis[0]+dryCG[0],axis[1]+dryCG[1]],sourceRequirement:'Unprocured factory CG envelope; no measured acceptance',wholeEnvelopeCountercaseMm:box(C.body)},{id:'whole-store-water',role:'liquid',maximumKg:v.maximumBodyAndPortsLitres,cgPlanMinMaxMm:[axis[0],axis[1],axis[0],axis[1]],ports:{maximumWaterKg:v.maximumWettedPortsAndAccessoriesLitres,planMinMaxMm:[axis[0]-C.cartRadius,axis[1]-C.cartRadius,axis[0]+C.cartRadius,axis[1]+C.cartRadius]}}]}},{id:'Plant/buffer',source:source('plant.primaryBuffer'),homePlanMm:B.station,bodyBottomAbsoluteMm:750,bodyHeightMm:B.height,normalFilledMassUpperKg:B.dryFullKg[0]+raw.apparatusDesign.maximumBufferRetainedAncillaryDryKg+bufferFluid,requiredPanelLiftMm:12,platformSource:{id:'Plant/buffer',source:source('plant.primaryBuffer'),homePlanMm:B.station,bodyPlanMm:B.body,axisXYMm:ba,supportMode:'buffer-four-gravity',components:[{id:'source-body-dry',role:'dry',maximumKg:B.dryFullKg[0],cgPlanMinMaxMm:box(B.body)},{id:'retained-ancillary-dry',role:'dry',maximumKg:raw.apparatusDesign.maximumBufferRetainedAncillaryDryKg,cgPlanMinMaxMm:box(B.station)},{id:'source-outer-cylinder-fluid-upper',role:'liquid',maximumKg:bufferFluid,cgPlanMinMaxMm:[ba[0],ba[1],ba[0],ba[1]]}]}}]
const input={choice,apparatus,roomPlanMm:[9397,3797,2173.5,1983.5]as const,houseFflMm:530,initialWaterMm:438.37,maximumWaterMm:660,wheelN:3708.18,panMinimumMm:316.8,panMaximumMm:349.54,bridgeInnerXMm:11520.5,bridgeOuterXMm:12130,bridgePlateYMm:[4125,5075]as const,outfallRoofMaximumMm:482,sourceRoofAtExternalBeamMm:466,settingEachMm:10,bridgeRenewalContext:{externalRestPlanMm:raw.externalDeckPlanMm as readonly[number,number,number,number],door:{clearYMm:[4100,5100]as const,headAbsoluteMm:530+raw.walkingRiseAboveHouseFflMm+raw.frame.clearHeightMm},obstacles:[{id:'actual-source-cylinder',boxMm:[C.body[0],C.body[1],680,C.body[2],C.body[3],C.height]as const},{id:'actual-source-buffer-raised-cradle',boxMm:[B.body[0],B.body[1],750,B.body[2],B.body[3],B.height]as const}]}}

const run=(i:Parameters<typeof plantTankedWalkingSurface>[0]=input)=>plantTankedWalkingSurface(i)
const overlap=(a:readonly number[],b:readonly number[])=>[0,1,2].every(k=>Math.min(a[k]+a[k+3],b[k]+b[k+3])-Math.max(a[k],b[k])>1e-7)
test('segmented full-seat bridge uses five existing posts and removes conflicting inside supports and coplanar grates',()=>{
 const r=run(),p=r.postRowBridge!,d=r.bridgeIntegration!
 assert.ok(p&&d)
 const bridgeGrateCollisions=r.parts.filter(q=>q.kind==='grate'||q.kind==='unified-grate-cut-rim').flatMap(a=>p.planks.filter(b=>overlap(a.boxMm,b.boxMm)).map(b=>({grate:a.id,grateBoxMm:a.boxMm,plank:b.id,plankBoxMm:b.boxMm,overlapMm3:[0,1,2].reduce((n,k)=>n*(Math.min(a.boxMm[k]+a.boxMm[k+3],b.boxMm[k]+b.boxMm[k+3])-Math.max(a.boxMm[k],b.boxMm[k])),1)})))
 const summary={sourceDigest:r.sourceDigest,bridge:p,bridgeGrateCollisions,railCuts:d.railCuts,remainingPerimeterTailChecks:d.remainingPerimeterTailChecks,normalMassUpperKg:r.normalMassUpperKg,solidsIncrementUpperL:r.solidsIncrementUpperL,finalDemand:r.unifiedDetails!.finalDemandBasis,failedChecks:r.memberChecks.filter(q=>!q.necessary),physicalAcceptance:false}
 console.log('PLANT_POST_ROW_BRIDGE '+JSON.stringify(summary))
 if(process.env.RUNNER_TEMP){const dir=join(process.env.RUNNER_TEMP,'had-utility-west-proof');mkdirSync(dir,{recursive:true});writeFileSync(join(dir,'plant-post-row-bridge-current-case.json'),JSON.stringify(summary,null,2))}
 assert.equal(p.girderSegments.length,4)
 assert.equal(p.grateToBridgeFit.nominalGapMm,6);assert.equal(p.grateToBridgeFit.netMm,1)
 for(const q of [...p.sharedPostUpdates,...p.externalPostUpdates]){const foot=r.parts.find(f=>f.id===q.footId)!,post=r.parts.find(f=>f.id===q.postId)!;near(foot.compressionDesignN!,p.oneSharedPostDemandUpperN);assert.ok(foot.compressionMomentBoundsNm);assert.equal(post.boxMm[3],60);assert.equal(post.boxMm[4],60)}
 assert.ok(p.normalFootWrenchBounds.every(q=>q.MxBoundsNm[0]<0&&q.MyBoundsNm[0]<0&&!q.actual95PercentFootContactPeakAndNoAnchorAccepted))
 assert.equal(p.sharedPostUpdates.length,5)
 assert.equal(r.parts.filter(q=>q.id.startsWith('Plant/bridge-X-rail/')).length,0)
 assert.equal(r.parts.filter(q=>q.id.startsWith('Plant/bridge-post/11400/')||q.id.startsWith('Plant/bridge-foot/11400/')).length,0)
 assert.equal(r.parts.filter(q=>q.kind==='solid-foot-pad').length,56)
 assert.equal(r.parts.filter(q=>q.kind==='bridge-pad').length,2)
 assert.equal(p.planks.length,15)
 for(const q of p.planks){near(q.boxMm[0],11440);near(q.boxMm[3],690);near(q.boxMm[5],40);assert.ok(q.completeMassDesignUpperKg<15)}
 for(const q of p.sharedPostUpdates){const post=r.parts.find(b=>b.id===q.postId)!;near(post.boxMm[2]+post.boxMm[5],q.postTopMm);assert.ok(!r.parts.some(b=>b.id===q.headId))}
 const girder=r.parts.filter(q=>q.kind==='post-row-bridge-girder'),rails=r.parts.filter(q=>q.kind==='solid-beam')
 assert.ok(!girder.some(a=>rails.some(b=>overlap(a.boxMm,b.boxMm))),'Actual shortened rails cannot occupy the same steel as the lower girders')
 assert.deepEqual(bridgeGrateCollisions,[],'Actual cut grate solids cannot overlap the bridge planks')
 assert.ok(p.necessaryMemberComparisons,JSON.stringify(p.memberChecks.filter(q=>!q.necessary)))
 assert.ok(p.oneSharedPostDemandUpperN<9000)
 assert.equal(p.normalReactionBounds.oneFactoredWheelN,3708.18)
 assert.equal(p.normalReactionBounds.normalMinimumReactionN,0)
 assert.equal(p.normalReactionBounds.segmentedSimplySupportedInnerSpans,true)
 assert.equal(p.retired.quarterTurnRenewal,true)
 assert.equal(p.actualExternalReceiversLateralTiesBoltToolContactAndWholeHouseAccepted,false)
 // The explicit35mm shadowgap removes the nominal-edge tails. It remains
 // outside any claim of a qualified cargo-wheel or personnel walking surface.
 assert.equal(d.remainingPerimeterTailChecks.length,0);assert.equal(d.eastTailParts.length,0)
 assert.equal(d.perimeterGapMm,35);assert.ok(d.perimeterChecks.every(q=>q.necessary))
 assert.equal(r.renewal.actualCargoWheelRoutesAndPersonnelAtPerimeterAccepted,false)
 assert.ok(r.necessaryMemberComparisons,JSON.stringify(r.memberChecks.filter(q=>!q.necessary)))
 for(const q of r.parts.filter(p=>p.kind==='grate'||p.kind==='unified-grate-cut-rim')){assert.ok(q.boxMm[0]>=9397+35-1e-7&&q.boxMm[1]>=3797+35-1e-7);assert.ok(q.boxMm[0]+q.boxMm[3]<=11570.5-35+1e-7&&q.boxMm[1]+q.boxMm[4]<=5780.5-35+1e-7)}
})
test('same source grid, actual straight-X phase obstacles and finite roof envelope invalidate new bridge evidence',()=>{
 const r=run(),p=r.postRowBridge!
 assert.ok(p.necessaryRenewalGeometry)
 assert.ok(p.renewal.every(q=>q.doorReserveMm>=5-1e-6&&q.necessaryGeometricSweeps))
 const obstruction={id:'adverse-real-path-solid',boxMm:[12000,4500,710,100,150,100]as const},
  blocked=run({...input,bridgeRenewalContext:{...input.bridgeRenewalContext,obstacles:[...input.bridgeRenewalContext.obstacles,obstruction]}})
 assert.equal(blocked.postRowBridge!.necessaryRenewalGeometry,false)
 assert.notEqual(blocked.sourceDigest,r.sourceDigest)
 assert.ok(blocked.postRowBridge!.renewal.some(q=>q.obstacleChecks.some(c=>c.obstacle===obstruction.id&&c.reserveAfterSettingsMm<0)))
 const roof=run({...input,outfallRoofMaximumMm:510})
 assert.ok(!roof.postRowBridge!.memberChecks.find(q=>q.id.endsWith('inner-roof-setting-thermal-deflection'))!.necessary)
 const axes=derivePostRowGridAxes({roomPlanMm:input.roomPlanMm,maximumPanelXYMm:[choice.grating.maximumPanelXMm,choice.grating.maximumPanelYMm],jointMm:choice.grating.panelJointGapMm,footPadSideMm:choice.walkingFrame.footPadSideMm,perimeterInsetMm:control.perimeterInsetMm,columnRelocation:control.postColumnRelocation})
 assert.deepEqual(axes.xMm,r.geometry.postCentreXMm);assert.deepEqual(axes.yMm,r.geometry.postCentreYMm)
 assert.throws(()=>run({...input,choice:{...choice,bridge:{...bridge,postRow:{...bridge.postRow,sharedPostYMm:[4363.5,4647,4930.5]}}}}),/five-post/)
 assert.throws(()=>run({...input,bridgeRenewalContext:undefined}),/renewal context/)
 assert.throws(()=>run({...input,choice:{...choice,bridge:{...bridge,postRow:{...bridge.postRow,grateToBridgeGapMm:4}}}}),/five-post/)
 assert.throws(()=>run({...input,choice:{...choice,bridge:{...bridge,postRow:{...bridge.postRow,perimeterGapMm:28}}}}),/five-post/)
})
test('new bridge is optional and legacy geometry remains a scoped rejected historical comparison',()=>{
 const legacy=run({...input,choice:{...choice,bridge:{...raw.bridge,topology:undefined,postRow:undefined}},bridgeRenewalContext:undefined})
 assert.equal(legacy.postRowBridge,undefined)
 assert.equal(legacy.parts.filter(p=>p.id.startsWith('Plant/bridge-X-rail/')).length,3)
 assert.equal(legacy.parts.filter(p=>p.kind==='bridge-pad').length,4)
 assert.notEqual(legacy.sourceDigest,run().sourceDigest)
})

test('actual eastern perimeter-rim regression witness is removed as real stock, retaining the full six millimetre gap',()=>{
 const formerRim=[11529.5,4080.5,610,6,282.5,70]as const,plank=[11440,4125,640,690,62.4,40]as const
 assert.ok(overlap(formerRim,plank))
 const intersection=[0,1,2].reduce((n,k)=>n*(Math.min(formerRim[k]+formerRim[k+3],plank[k]+plank[k+3])-Math.max(formerRim[k],plank[k])),1)
 near(intersection,14976)
 const plans=plantGrateRimOutsideExclusions({planMinMaxMm:[11529.5,4080.5,11535.5,4363],excludedPlanMinMaxMm:[[11434.5,4119.5,12135.5,5080.5]],clearanceMm:.5})
 assert.deepEqual(plans,[[11529.5,4080.5,11535.5,4119]])
 const r=run(),actual=r.parts.find(p=>p.id==='Plant/grate/5/1/cut-edge-rim/9/3/piece/0')
 assert.ok(actual,'Source-derived perimeter rim must exist as the correctly shortened physical stock')
 assert.deepEqual(actual.boxMm,[11529.5,4080.5,610,6,38.5,70])
 assert.equal(actual.subtractPlanPrisms,undefined,'Rim correction is actual cut stock rather than a bounding-box waiver')
 assert.equal(actual.boxMm[1]+actual.boxMm[4],plank[1]-6)
 assert.ok(!overlap(actual.boxMm,plank))
 console.log('PLANT_BRIDGE_RIM_REGRESSION '+JSON.stringify({formerRimId:'Plant/grate/5/1/cut-edge-rim/9/3',formerRimBoxMm:formerRim,plankId:'Plant/bridge-piece/0',plankBoxMm:plank,formerIntersectionMm3:intersection,actualRimId:actual.id,actualRimBoxMm:actual.boxMm,actualIntersection:false}))
})
