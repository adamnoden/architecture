import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {plantTankedWalkingSurface,type PlantWalkControl} from './current-design/inlet-plant-tanked-walk.js'
const read=(p:string)=>JSON.parse(readFileSync(new URL('../../project/had/studies/'+p,import.meta.url),'utf8'))
const raw=read('inlet-plant-tanked-walk-candidate.json'),source=read('current-house-services.json').plant,vessel=read('inlet-store-vessel-candidate.json')
const {appliancePlatform:_futureSelectedPlatform,bridge:_activeBridge,...legacyFloor}=raw
const {topology:_activeTopology,postRow:_activePostRow,...legacyBridgeFields}=_activeBridge
const legacy={...legacyFloor,bridge:{...legacyBridgeFields,thicknessMm:36,pieceCount:13}}
const make=(side:number,t:number,H:number,maxX=400)=>({...legacy,walkingRiseAboveHouseFflMm:150,walkingFrame:{...raw.walkingFrame,footPadSideMm:side,footPadThicknessMm:t},grating:{...raw.grating,bearingBarThicknessMm:5,bearingBarHeightMm:H,rimHeightMm:H,maximumPanelXMm:maxX,maximumCompletePanelKg:15}}as PlantWalkControl)
const apparatus=[{id:'Plant/cylinder',source:{path:'project/had/studies/current-house-services.json',gitBlob:'e649805e78244527fe6498b516fa5f23734ac5ea',objectPath:'plant.cylinder'},homePlanMm:source.cylinder.body,bodyBottomAbsoluteMm:680,bodyHeightMm:source.cylinder.height,normalFilledMassUpperKg:vessel.handling.maximumCompleteDryCargoKg+vessel.maximumBodyAndPortsLitres,requiredPanelLiftMm:12},{id:'Plant/buffer',source:{path:'project/had/studies/current-house-services.json',gitBlob:'e649805e78244527fe6498b516fa5f23734ac5ea',objectPath:'plant.primaryBuffer'},homePlanMm:source.primaryBuffer.station,bodyBottomAbsoluteMm:680,bodyHeightMm:source.primaryBuffer.height,normalFilledMassUpperKg:source.primaryBuffer.dryFullKg[0]+raw.apparatusDesign.maximumBufferRetainedAncillaryDryKg+Math.PI/4*source.primaryBuffer.body[2]**2*source.primaryBuffer.height/1e6*raw.apparatusDesign.maximumPrimaryFluidDensityKgM3/1000,requiredPanelLiftMm:12}]
// Bounded dry steel/stand comparison on captured source plans. The selected
// whole-Plant producer separately supplies actual pan, F bed, pool and gravity.
const run=(choice=make(140,25,65))=>plantTankedWalkingSurface({choice,apparatus,roomPlanMm:[9397,3797,2173.5,1983.5],houseFflMm:530,initialWaterMm:438.37,maximumWaterMm:660,wheelN:3708.18,panMinimumMm:312.8,panMaximumMm:346.39,bridgeInnerXMm:11520.5,bridgeOuterXMm:12130,bridgePlateYMm:raw.bridge.plateWidthYMm as readonly[number,number],outfallRoofMaximumMm:482,sourceRoofAtExternalBeamMm:466,settingEachMm:10})
const near=(a:number,b:number)=>assert.ok(Math.abs(a-b)<1e-7,a+' != '+b)
test('rejected140 by25 shared feet retain manageable panels but clash with the actual cylinder stand',()=>{
 const r=run()
 assert.equal(r.panels.length,42)
 near(r.panels[0].completeMassDesignUpperKg,14.213033333333334)
 assert.ok(r.panels.every(p=>p.completeMassDesignUpperKg<15))
 assert.ok(r.necessaryMemberComparisons,JSON.stringify(r.memberChecks.filter(c=>!c.necessary)))
 assert.equal(r.apparatusInterfaces.length,2)
 const cylinder=r.apparatusInterfaces.find(a=>a.id==='Plant/cylinder')!,buffer=r.apparatusInterfaces.find(a=>a.id==='Plant/buffer')!
 assert.equal(cylinder.necessarySeparateStandGeometry,false)
 assert.equal(buffer.necessarySeparateStandGeometry,true)
 assert.ok('frameChecks'in cylinder&&cylinder.frameChecks?.some(c=>c.part.endsWith('/foot')&&c.existing.startsWith('Plant/foot/')&&c.afterTwoSettingsMm<0),'Actual common-sized stand/room feet must retain their collision; no legacy120-sized stand is substituted')
 const feet=r.parts.filter(p=>['solid-foot-pad','bridge-pad','apparatus-stand-pad'].includes(p.kind))
 assert.equal(feet.length,68)
 assert.ok(feet.every(p=>p.boxMm[3]===140&&p.boxMm[4]===140&&p.boxMm[5]===25))
 assert.ok(r.apparatusInterfaces.every(a=>'standDesign'in a&&a.standDesign?.padLWTMm.join(',')==='140,140,25'))
 assert.ok(r.apparatusInterfaces.every(a=>'designOnePostN'in a&&a.designOnePostN!<7000))
 near(r.geometry.postCentreXMm[0],9467)
 near(r.geometry.postCentreYMm[0],3867)
 assert.equal(r.geometry.panelCount,42)
 assert.equal(r.actualCompleteInstallationAccepted,false)
 assert.equal(r.actualRCPanSandwichBearingAndThermalBridgeAccepted,false)
 assert.equal(r.renewal.everyPanelIndependentOfApparatusRemoval,false)
})
test('whole common-pad trade retains mass and real stand counterexamples',()=>{
 const current=run(make(120,8,60)),selected=run(),tooHeavy=run(make(150,25,70)),morePanels=run(make(150,25,70,350))
 assert.ok(selected.normalMassUpperKg>current.normalMassUpperKg+200)
 assert.ok(selected.referenceMetalKg>current.referenceMetalKg)
 assert.ok(selected.solidsIncrementUpperL>current.solidsIncrementUpperL)
 assert.ok(selected.geometry.beamSpanWithSettingsMm<=current.geometry.beamSpanWithSettingsMm)
 assert.ok(selected.memberChecks.find(c=>c.id==='Plant/frame-foot-pad-conditional-contact')!.value!<current.memberChecks.find(c=>c.id==='Plant/frame-foot-pad-conditional-contact')!.value!)
 assert.ok(tooHeavy.panels.some(p=>p.completeMassDesignUpperKg>15))
 assert.equal(morePanels.panels.length,49)
 assert.ok(morePanels.panels.every(p=>p.completeMassDesignUpperKg<15))
 const buffer=morePanels.apparatusInterfaces.find(a=>a.id==='Plant/buffer')!
 assert.equal(buffer.necessarySeparateStandGeometry,false)
 assert.ok(buffer.diagnostics.includes('PLANT_WALK/apparatus-perimeter-stand-cannot-fit-real-footprint'))
 assert.equal(selected.actualFabricationAndMaterialTemperaturePropertiesAccepted,false)
})
