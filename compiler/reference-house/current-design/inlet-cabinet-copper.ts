import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {sha256SemanticFingerprint} from '../../core/identity.js'
import type {CurrentDesignResolution} from './resolve.js'
import {compareFixedInletThermalWithReceiver} from './inlet-fixed-thermal.js'
import {finiteBends} from '../../../project/had/studies/incoming-water-geometry.mjs'

type P=readonly [number,number,number]
type B=readonly [number,number,number,number,number,number]
const sourcePaths=['project/had/studies/south-inlet-under-sill.json','project/had/studies/current-house-services.json','project/had/studies/south-inlet-wet-box.json','project/had/studies/utility-wide-capture.json','project/had/studies/utility-dry-bowl-release.json','project/str/studies/floor-portal-interface-review.json','project/str/studies/reconciled-house-interface.json'] as const
export const inletCabinetStageFields=['cabinetXMm','cabinetWidthMm','frontYMm','bottomZMm','topZMm','riserOffsetXMm','riserYMm','valveZMm','fixedZMm','guideZMm','temperatureRangeK','pressureBar','flowEachLmin','pipeElasticModulusMpa','pipeWallMm','sheetMm'] as const
export type InletCabinetSettings=Readonly<Record<typeof inletCabinetStageFields[number],number>>
export const readInletCabinetSettings=():InletCabinetSettings=>({cabinetXMm:9760,cabinetWidthMm:850,frontYMm:680,bottomZMm:140,topZMm:1900,riserOffsetXMm:130,riserYMm:600,valveZMm:1100,fixedZMm:1900,guideZMm:2100,temperatureRangeK:40,pressureBar:9,flowEachLmin:90,pipeElasticModulusMpa:117200,pipeWallMm:1.2,sheetMm:1.5})
export const inletCabinetProductFacts={
  checkedOn:'2026-11-20',
  pipe:{model:'Lawton TY0283',description:'28×1.2mm R250 EN1057 plain copper; no22mm substitution',outerDiameterMm:28,nominalWallMm:1.2,minimumWallMm:1.02,densityKgM3:8960,expansionMmMK:.017,
    source:'https://lawtontubes.co.uk/product/copper-tube-plain-straight-length/',toleranceSource:'https://lawtontubes.com/lt-product/28mm-copper-pipe/',
    elasticComparison:'117200MPa C12200/Cu-DHP reference; actual R250 tube certificate not supplied;130000 sensitivity remains authored',elasticSource:'https://alloys.copper.org/alloy/C12200',markingAndLubricantConstituentsQualified:false},
  coupling:{model:'Conex301 DZR',sku:'HH-5020301--',sizeMm:28,lengthMm:53,tubeInsertionMm:26,spannerMm:39},
  elbow:{model:'Conex401 DZR',sku:'HH-5020401--',sizeMm:28,portToVirtualCornerMm:42,tubeInsertionMm:26},
  joint:{method:'metal cone/olive/capnut on EN1057 R250 copper',torqueNm:[50,60],turnsAfterHandTight:.75,additionalWaterSealantRequired:false,
    source:'https://conexbanninger.com/en/wp-content/uploads/sites/12/2024/08/Conex-Compression-Tech-Brochure-International-17-02-25-New-Branding-WEB.pdf',dimensions:'https://conexbanninger.co.uk/wp-content/uploads/2024/02/Conex-Compression-Technical-Brochure.pdf',actualFactoryLubricantsAndAllConstituentsQualified:false},
  valve:{model:'ConexS701 DZR28',sku:'HH-5012701--',axialMm:99.5,fullStemReservationMm:138,handwheelWidthMm:56,pnBar:10,maximumTemperatureC:65,
    source:'https://conexbanninger.com/wp-content/uploads/2024/02/Compression-Valve-Tech-brochure-.pdf',knownPolymerItems:['PTFE packing','PTFE sealing gasket','EPDM seat constituent'],knownPolymerItemsPerValve:3,ownerExceptionApproved:false,flowCoefficient:null},
  steel:{densityKgM3:8000,comparisonElasticModulusMpa:200000,comparisonProofStressMpa:200,source:'https://www.thyssenkrupp-materials.co.uk/stainless-steel-316-14401.html/index.html'},
  tools:{acrossFlatsMm:39,authoredHandleLengthMm:400,authoredHeadDiameterMm:92,authoredShaftWidthMm:40,authoredSwingDegrees:25,wholeToolAndOperatorEnvelopeMeasured:false},
} as const
const blob=(b:Buffer)=>createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex')
function binding(resolved:CurrentDesignResolution){
  if(resolved.design.source.kind!=='georgian-layout-revision'||!resolved.disciplineBindings.length)throw new Error('Copper cabinet requires the admitted Georgian plan and actual discipline source bindings')
  const inputs:Record<string,string>={}
  const data:Record<string,unknown>={}
  for(const path of sourcePaths){const bytes=readFileSync(new URL('../../../'+path,import.meta.url)),actual=blob(bytes),expected=resolved.disciplineBindings.flatMap(b=>b.identities[path]?[b.identities[path]]:[])
    if(!expected.length||expected.some(v=>v!==actual))throw new Error('Stale copper-cabinet source: '+path)
    inputs[path]=actual;data[path]=JSON.parse(bytes.toString('utf8'))
  }
  const methods=Object.fromEntries(['compiler/reference-house/current-design/inlet-cabinet-copper.ts','compiler/reference-house/current-design/inlet-fixed-thermal.ts','project/had/studies/incoming-water-geometry.mjs'].map(path=>[path,blob(readFileSync(new URL('../../../'+path,import.meta.url)))]))
  const owning=resolved.disciplineBindings.find(f=>f.id==='had-fixed-inlet-arrangement')
  if(!owning||Object.entries(methods).some(([path,hash])=>owning.identities[path]!==hash))throw new Error('Copper-cabinet methods are not admitted by the owning current family')
  return {planDigest:sha256SemanticFingerprint(resolved.design),bindingDigest:sha256SemanticFingerprint({inputs,methods,productFacts:inletCabinetProductFacts}),inputs,methods,data}
}
export function readInletCabinetCase(resolved:CurrentDesignResolution){const b=binding(resolved);return {schema:'had-copper-cabinet-request/1' as const,design:resolved.design,cabinet:{schema:'had-copper-cabinet-case/1' as const,planDigest:b.planDigest,bindingDigest:b.bindingDigest,settings:readInletCabinetSettings()}}}
function admit(value:unknown):InletCabinetSettings{
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==inletCabinetStageFields.length||inletCabinetStageFields.some(k=>!Object.hasOwn(value,k)))throw new Error('Complete authored copper-cabinet settings required; derived results cannot be injected')
  const s=value as InletCabinetSettings
  if(inletCabinetStageFields.some(k=>!Number.isFinite(s[k]))||s.cabinetWidthMm<600||s.cabinetWidthMm>1500||s.frontYMm<600||s.frontYMm>900||s.bottomZMm<0||s.topZMm>2200||s.topZMm-s.bottomZMm<1400||s.riserOffsetXMm<90||s.riserOffsetXMm>300||s.riserYMm<520||s.riserYMm>650||s.valveZMm<900||s.valveZMm>1400||s.fixedZMm!==s.topZMm||s.guideZMm<s.fixedZMm+100||s.guideZMm>2400||s.temperatureRangeK<0||s.temperatureRangeK>80||s.pressureBar<=0||s.pressureBar>10||s.flowEachLmin<=0||s.flowEachLmin>90||s.pipeElasticModulusMpa<110000||s.pipeElasticModulusMpa>130000||s.pipeWallMm!==1.2||s.sheetMm<1||s.sheetMm>3)throw new Error('Copper cabinet settings exceed the declared comparison domain')
  return s
}
const r=(n:number)=>Number(n.toFixed(6))||0
const gap=(a:readonly number[],b:readonly number[])=>Math.max(...[0,1,2].map(i=>Math.max(b[i]-a[i]-a[i+3],a[i]-b[i]-b[i+3])))
const length=(p:readonly P[])=>p.slice(1).reduce((n,b,i)=>n+Math.hypot(...b.map((v,k)=>v-p[i][k])),0)
const rectOverlap=(a:readonly number[],b:readonly number[])=>Math.max(0,Math.min(a[0]+a[2],b[0]+b[2])-Math.max(a[0],b[0]))*Math.max(0,Math.min(a[1]+a[3],b[1]+b[3])-Math.max(a[1],b[1]))
export function runInletCabinetCase(resolved:CurrentDesignResolution,input:unknown){
  const b=binding(resolved),keys=['schema','planDigest','bindingDigest','settings']
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length!==keys.length||keys.some(k=>!Object.hasOwn(input,k)))throw new Error('Versioned source-bound copper-cabinet case required')
  const v=input as Record<string,unknown>;if(v.schema!=='had-copper-cabinet-case/1'||v.planDigest!==b.planDigest||v.bindingDigest!==b.bindingDigest)throw new Error('Stale copper-cabinet source, method or design binding')
  const s=admit(v.settings),facts=inletCabinetProductFacts
  const native=b.data[sourcePaths[0]] as {branches:{id:string;coordinates:P[]}[]},services=b.data[sourcePaths[1]] as {utility:{washer:number[];washerFirstRest:number[];PVinverter:number[];PVinverterLocalZ:number[];PVworkingField:number[]}},cells=b.data[sourcePaths[2]] as {branches:{id:string;case:{permanentLowerTroughLipZ:number};vent:{inner:P;outer:P;formedDiameterMM:number}}[]}
  const hot=b.data[sourcePaths[3]] as {hot:{backbone:P[];terminal:P[]}},bowl=b.data[sourcePaths[4]] as {capture:{clearSweeps:{box:B}[]}},portal=b.data[sourcePaths[5]] as {geometry:{jambQmm:number[];occurrences:{face:string;opening:string;jambAxisPmm:number}[]}}
  const back=native.branches[0].coordinates[1][1],body:B=[s.cabinetXMm,back,s.bottomZMm,s.cabinetWidthMm,s.frontYMm-back,s.topZMm-s.bottomZMm],right=body[0]+body[3],partition=(native.branches[0].coordinates[1][0]+native.branches[1].coordinates[1][0])/2
  const u=services.utility,washer:B=[u.washer[0],u.washer[1],0,u.washer[2],u.washer[3],848],washerRest:B=[u.washerFirstRest[0],u.washerFirstRest[1],0,u.washerFirstRest[2],u.washerFirstRest[3],848],pv:B=[u.PVinverter[0],u.PVinverter[1],u.PVinverterLocalZ[0],u.PVinverter[2],u.PVinverter[3],u.PVinverterLocalZ[1]-u.PVinverterLocalZ[0]]
  const branches=native.branches.map((n,index)=>{
    const entry=n.coordinates[1],axisX=entry[0]+(index===0?-s.riserOffsetXMm:s.riserOffsetXMm),slope=(entry[2]-n.coordinates[0][2])/(entry[1]-n.coordinates[0][1]),cornerZ=entry[2]+(s.riserYMm-back)*slope
    const lower:P[]=[[entry[0],-300,entry[2]+(-300-back)*slope],[entry[0],s.riserYMm,cornerZ],[axisX,s.riserYMm,cornerZ],[axisX,s.riserYMm,s.valveZMm]]
    const upper=n.coordinates.slice(3).map((p,i)=>[i===0?axisX:p[0],i<=1?s.riserYMm:p[1],index===1&&i<=2?2585:p[2]] as P)
    const formedUpper=finiteBends([lower.at(-1)!,...upper],114)
    const vertices:P[]=[...lower.slice(0,-1),...formedUpper.path] as P[]
    // Conex lower elbows use the catalogue virtual centres. This is a tube-only flexibility comparison,
    // not qualified cast fitting/joint stiffness. The upper route retains its actual source destination.
    const pipe={outerDiameterMm:28,wallMm:s.pipeWallMm,elasticModulusMpa:s.pipeElasticModulusMpa,poissonRatio:.34,expansionMmMK:facts.pipe.expansionMmMK}
    const thermal=compareFixedInletThermalWithReceiver({pathMm:vertices,fixedPointZMm:s.fixedZMm,guideZMm:s.guideZMm,temperatureExcursionK:s.temperatureRangeK,pipe},{baseZMm:100,postAxisXYMm:[axisX,s.riserYMm-80],topZMm:s.guideZMm+30,widthXMm:60,depthYMm:80,wallMm:4,elasticModulusMpa:200000,poissonRatio:.3})
    const actualLength=length(vertices)-47.5-2-4*(facts.elbow.portToVirtualCornerMm-facts.elbow.tubeInsertionMm),metalArea=Math.PI*(28**2-(28-2*s.pipeWallMm)**2)/4,waterArea=Math.PI*(28-2*s.pipeWallMm)**2/4
    const lowerPhysicalGap=s.riserOffsetXMm-2*facts.elbow.portToVirtualCornerMm
    const cellLeft=index===0?body[0]:partition,cellRight=index===0?partition:right,headRadius=facts.tools.authoredHeadDiameterMm/2
    const insideHandleProjection=(s.frontYMm-s.riserYMm)*Math.tan(facts.tools.authoredSwingDegrees*Math.PI/180)+facts.tools.authoredShaftWidthMm/2
    const valveSideMargin=Math.min(axisX-cellLeft,cellRight-axisX)-facts.valve.fullStemReservationMm-5
    const wrenchSideMargin=Math.min(axisX-cellLeft,cellRight-axisX)-Math.max(headRadius,insideHandleProjection)-5
    const straightWaterVelocity=s.flowEachLmin/60000/(waterArea/1e6),howdenVelocity=50/60000/(waterArea/1e6)
    const materialResidues=facts.valve.knownPolymerItems.map((material,i)=>({id:n.id+'-valve-polymer-'+i,material,quantity:1,part:facts.valve.sku,ownerExceptionApproved:false}))
    const fixed=thermal.fixedPointWrench,guide=thermal.guideWrench
    const pressureEnd=s.pressureBar*.1*waterArea,jet=2*1000*s.flowEachLmin/60000*Math.sqrt(2*s.pressureBar*1e5/1000)
    const zLow=Math.min(lower[0][2],lower[1][2])-14,zHigh=Math.max(lower[0][2],lower[1][2])+14
    const transport:B=[entry[0]-14,-300,zLow,28,s.riserYMm+300-16,zHigh-zLow],draw=back+10+300,drawn:B=[transport[0],transport[1]+draw,transport[2],transport[3],transport[4],transport[5]]
    const inCabinetTubeStockKg=(s.topZMm-cornerZ+s.riserOffsetXMm+s.riserYMm-back)/1e9*metalArea*facts.pipe.densityKgM3
    return {id:n.id,entryAxisMm:entry,riserAxisMm:[axisX,s.riserYMm],lowerVerticesMm:lower,upperVerticesMm:upper,pathMm:vertices,
      catalogueLowerElbowStraightGapMm:r(lowerPhysicalGap),pipeStockLengthUpperMm:r(actualLength),pipeStockScope:'Known service gaps deducted from the tube-only centreline; upper1degree arc chords carry their stated approximation. Cast fitting/valve stiffness and final bought-part masses remain separate.',pipeMetalKg:r(actualLength*metalArea*facts.pipe.densityKgM3/1e9),pipeWaterKg:r(length(vertices)*waterArea/1e6),inCabinetTubeStockKg:r(inCabinetTubeStockKg),
      valveBodyMm:[axisX-28,s.riserYMm-28,s.valveZMm-49.75,56,56,99.5] as B,valveFullStemReservationMm:[axisX-138,s.riserYMm-28,s.valveZMm-28,276,56,56] as B,
      valveSideAfter5Mm:r(valveSideMargin),wrenchSideAfter5Mm:r(wrenchSideMargin),wrenchFrontOpenSweepMm:[s.frontYMm,s.riserYMm+facts.tools.authoredHandleLengthMm],
      thermal,receiverActions:{fixedPointWrench:fixed,guideWrench:guide,independentUpperTerminal:thermal.upperTerminalWrench,outerRepairCutTerminal:thermal.outerTerminalWrench,sourcePressureEndComponentBoundN:r(pressureEnd),jetReversalNormN:r(jet),completeLodgeRestraintInvented:false},
      flow:{tubeNominalIdMm:28-2*s.pipeWallMm,howdenRequiredMm:28,howdenRequiredLmin:50,nominalVelocityAtHowdenFlowMps:r(howdenVelocity),faultVelocityMps:r(straightWaterVelocity),fittingAndValveLossCoefficient:null,guaranteedHowdenDuty:false},
      renewal:{throughWallStraightDrawMm:draw,drawnTubeBodyMm:drawn,drawToInstalledWasherAfter5Mm:r(gap(drawn,washer)-5),drawToFirstRestWasherAfter5Mm:r(gap(drawn,washerRest)-5),
        upperRiserFirstReleaseZMm:upper[0][2],requiredUnseatTravelMm:27,upperNetworkMustBeIndependentlyRetained:true,pressureJointZeroRetreatClaimed:false,completeToolAndOperatorSweepQualified:false},
      materialResidues,
      componentTakeoff:{lowerElbows:{sku:facts.elbow.sku,quantity:2},plainCouplers:{sku:facts.coupling.sku,quantity:2},valve:{sku:facts.valve.sku,quantity:1},upperShapedTubeAndConnections:'Upper path is a source-bound tube-only flexibility route; actual formed/fitting schedule and joint stiffness remain unresolved.'}}
  })
  const density=facts.steel.densityKgM3/1e9,W=body[3],D=body[4],H=body[5],sheetVolume=(2*W*H+3*D*H+2*W*D)*s.sheetMm
  const frameLength=4*(H+s.bottomZMm)+4*W+6*D,frameArea=30*30-24*24,steelKg=sheetVolume*density+frameLength*frameArea*density+4*100*100*10*density
  const doors=Array.from({length:4},(_,i)=>({id:'front-panel-'+i,bodyMm:[body[0],s.frontYMm-s.sheetMm,s.bottomZMm+i*H/4,W,s.sheetMm,H/4] as B,flatSheetKg:r(W*s.sheetMm*H/4*density),foldsRetainersAndHandlingMassQualified:false}))
  const perCellWater=cells.branches.map((c,i)=>({id:c.id,maximumWaterZMm:c.case.permanentLowerTroughLipZ,planMm:[i===0?body[0]:partition,back,i===0?partition-body[0]:right-partition,D],upperPrismWaterKg:r(Math.max(0,c.case.permanentLowerTroughLipZ-s.bottomZMm)*(i===0?partition-body[0]:right-partition)*D/1e6),actualReliefRouteReconciled:false}))
  const pressurePostArea=80*60-72*52,pressurePostLength=s.guideZMm+30-100
  const pressureSupports=branches.map(c=>{
    const x=c.riserAxisMm[0],y=s.riserYMm-80,post:B=[x-30,y-40,100,60,80,pressurePostLength],base:B=[x-60,y-65,88,120,130,12]
    const arms=[s.fixedZMm,s.guideZMm].map(z=>[x-20,y+40,z-30,40,s.riserYMm-y-40,60] as B)
    const postKg=pressurePostArea*pressurePostLength*density,baseKg=120*130*12*density,armArea=40*60-32*52,armKg=arms.reduce((n,a)=>n+armArea*a[4]*density,0)
    const sx=(60*80**3-52*72**3)/12/40,sy=(80*60**3-72*52**3)/12/30,force=c.receiverActions.fixedPointWrench.forceComponentBoundsN,moment=c.receiverActions.fixedPointWrench.momentComponentBoundsNmm,guide=c.receiverActions.guideWrench.forceComponentBoundsN,pressure=c.receiverActions.sourcePressureEndComponentBoundN
    const fx=force[0]+guide[0]+pressure,fy=force[1]+guide[1]+pressure,fz=force[2]+pressure+(c.pipeMetalKg+c.pipeWaterKg+13.533495+postKg+baseKg+armKg)*9.81
    const mx=moment[0]+(force[1]+pressure)*(s.fixedZMm-100)+guide[1]*(s.guideZMm-100)+fz*80,my=moment[1]+(force[0]+pressure)*(s.fixedZMm-100)+guide[0]*(s.guideZMm-100),stress=fz/pressurePostArea+mx/sx+my/sy
    return {id:c.id,postBodyMm:post,baseBodyMm:base,armsMm:arms,steelKg:r(postKg+baseKg+armKg),baseToFinishedBackAfter5Mm:r(base[1]-back-5),receiverForceBoundsN:[r(fx),r(fy),r(fz)],receiverMomentBoundsNmm:[r(mx),r(my),r(moment[2])],
      grossSectionNormalStressMpa:r(stress),grossSectionComparisonLimitMpa:200/1.5,actualClampGripLocalJointBaseAnchorFloorAndCombinedTorsionQualified:false,
      law:'Independent source thermal wrench, sliding-guide force, adverse pA per horizontal axis and full route gravity charged to an explicit grounded post; straight gross-section normal stress only. Not a complete 3D frame, contact, local buckling, torsion or base resistance proof.'}
  })
  const pressureSupportKg=pressureSupports.reduce((n,c)=>n+c.steelKg,0)
  const unqualifiedFittingStockKg=branches.length*(2*Math.PI*46**2/4*53+2*2*66*46*46+99.5*138*56)*9000/1e9
  const pipeFullKg=branches.reduce((n,b)=>n+b.pipeMetalKg+b.pipeWaterKg,0),waterKg=perCellWater.reduce((n,c)=>n+c.upperPrismWaterKg,0),grossKg=steelKg+pressureSupportKg+unqualifiedFittingStockKg+pipeFullKg+waterKg
  const footprintWaterDuty={compartments:perCellWater,partitionPlaneXMm:partition,partitionContinuousToClosedRoof:true,sharedPrimaryReceiverCredited:false,sourceIndependentOutletsRetainedByIdentity:cells.branches.map(c=>c.id),newPanToOutletJunctionQualified:false}
  const controls={washerAfter5Mm:r(gap(body,washer)-5),inverterAfter5Mm:r(gap(body,pv)-5),energisedPvFieldAfter10Mm:r(u.PVworkingField[1]-s.frontYMm-10),bowlTransportAfter5Mm:Math.min(...bowl.capture.clearSweeps.map(row=>r(gap(body,row.box)-5)))}
  const acceptedOpening=resolved.design.storeys.GROUND.openings.find(o=>o.id==='GROUND/south-window-4'),edits=b.data[sourcePaths[6]] as {openingEdits:{level:string;side:string;id:string;old:number;new:number;sill:number;head:number}[]}
  const edit=edits.openingEdits.find(e=>e.level==='GROUND'&&e.side==='outer-south'&&e.id==='south-window-4')
  if(!acceptedOpening||!edit||acceptedOpening.centreMm!==edit.old||edit.head<=edit.sill)throw new Error('Copper cabinet needs reconciled nominal and conditional opening sources')
  const nominalWindow:[number,number,number,number]=[acceptedOpening.centreMm-acceptedOpening.widthMm/2,edit.sill,acceptedOpening.widthMm,edit.head-edit.sill],conditionalWindow:[number,number,number,number]=[edit.new-acceptedOpening.widthMm/2,edit.sill,acceptedOpening.widthMm,edit.head-edit.sill],projection=[body[0],body[2],body[3],body[5]]
  const sourceHost={nominal:nominalWindow,conditional:conditionalWindow,nominalBoundingWindowObscuredMm2:rectOverlap(projection,nominalWindow),conditionalBoundingWindowObscuredMm2:rectOverlap(projection,conditionalWindow),archedWindowAndDaylightPerformanceAccepted:false}
  const floorReceiving={basis:'Proposed independent cabinet gravity plinth onto the actual structural floor through sleeved finish interruptions; no strength or dry-side DPC capacity is supplied by a finish datum.',sourceGroundFinishZMm:0,proposedSeatZMm:s.bottomZMm,
    gravityUpperN:r(grossKg*9.81),fourWetFootGravityOnlyN:r((steelKg+waterKg)*9.81/4),twoIndependentPipeFeetGravityOnlyN:r((pressureSupportKg+unqualifiedFittingStockKg+pipeFullKg)*9.81/2),worstSingleSideWaterGravityN:r((steelKg+unqualifiedFittingStockKg+pipeFullKg+Math.max(...perCellWater.map(c=>c.upperPrismWaterKg)))*9.81),actualLoadDistributionAndFloorCapacityQualified:false,
    pipeAndWetAssembliesIndependentlySupported:true,frictionOnlyHorizontalResistanceCredited:false,pressureFrameAndCabinetWallRestraintActions:branches.map(c=>c.receiverActions),actualJambCageAndAnchorGroupQualified:false}
  const diagnostics=[...branches.filter(c=>c.catalogueLowerElbowStraightGapMm<10).map(c=>c.id+':LOWER_ELBOW_INSTALLATION_GAP_FAILS'),...branches.filter(c=>c.valveSideAfter5Mm<0||c.wrenchSideAfter5Mm<0).map(c=>c.id+':VALVE_OR_SPANNER_INTERCEPTS_CASE'),...Object.entries(controls).filter(([,v])=>v<0).map(([k])=>'CABINET_INTERCEPTS_'+k),
    ...pressureSupports.filter(c=>c.baseToFinishedBackAfter5Mm<0).map(c=>c.id+':PIPE_BASE_INTERCEPTS_FINISHED_BACK'),...pressureSupports.filter(c=>c.grossSectionNormalStressMpa>c.grossSectionComparisonLimitMpa).map(c=>c.id+':PIPE_POST_GROSS_SECTION_COMPARISON_FAILS'),'CONEX_VALVE_KNOWN_POLYMERS_HAVE_NO_OWNER_EXCEPTION','ACTUAL_POTABLE_FLOW_LOSS_AND_UPPER_FITTING_SCHEDULE_UNQUALIFIED','STATIC_BULKHEADS_AND_DOOR_SEAMS_REQUIRE_DIMENSIONED_WET_PROOF','NEW_INDEPENDENT_PANS_TO_EXISTING_OUTLETS_UNQUALIFIED','ACTUAL_FLOOR_SEAT_MOISTURE_PATH_AND_WALL_GROUP_RESISTANCE_UNQUALIFIED','UPPER_TERMINAL_AND_LODGE_SUPPORT_LAWS_NOT_QUALIFIED','STATIC_BULKHEAD_RELATIVE_MOVEMENT_AND_COUPLING_NOT_SOLVED','SOURCE_BOUND_TUBE_FLEXIBILITY_IS_NOT_CAST_FITTING_STIFFNESS','FROST_AND_WARM_ENVELOPE_STRATEGY_REQUIRES_WHOLE_ROUTE','OWNER_WINDOW_AND_ROOM_APPEARANCE_REVIEW_REQUIRED']
  const result={schema:'had-copper-cabinet-comparison/1' as const,status:'unselected-whole-arrangement-comparison' as const,source:{caseDigest:sha256SemanticFingerprint(v),planDigest:b.planDigest,bindingDigest:b.bindingDigest,inputs:b.inputs,methods:b.methods},settings:s,productFacts:facts,
    architecture:{bodyMm:body,backWetFaceYMm:back,compartmentDividerXMm:partition,doors,sourceHost,roomControls:controls,noSlidingUpperPackingProposal:true,no850ArmThroughBackShell:true,noSourcePressToolOrViegaValveEnvelopeReused:true},branches,pressureSupports,
    quantities:{knownSteelGrossKg:r(steelKg+pressureSupportKg),cabinetSteelGrossKg:r(steelKg),independentPipeSupportSteelKg:r(pressureSupportKg),grossSolidBrassFittingValveUpperKg:r(unqualifiedFittingStockKg),wholeRoutePipeAndWaterKg:r(pipeFullKg),retainedPanWaterUpperKg:r(waterKg),totalDeclaredGrossUpperKg:r(grossKg),excludes:'Actual seals, fasteners, welds, jackets and bought-part masses; gross solid brass reservations deliberately include voids and cannot be called a net mass or favorable counterweight.'},footprintWaterDuty,floorReceiving,diagnostics,
    operating:{ordinaryInsideIsolation:'Each house branch retains its own reachable ordinary indoor stopvalve. Opening a known wet/faulted compartment requires independent Lodge isolation first; no live-fault-open containment is claimed.',
      coldSequence:['Close both independent Lodge cuts; exclude electricity, drain and prove zero pressure. Move washer to its restrained first rest before a wall-tube draw.','Remove the four independent front panels. Independently retain the actual upper network before loosening its first source-bound overhead connection and the separate pipe clamp.','Use two39mm spanners; withdraw the released upper plain riser27mm from the lower valve compression socket before removing it forward. Do not claim zero retreat or a reusable damaged olive.','Remove the valve and separate lower dogleg tubes after releasing their ordinary compression nuts. Withdraw the now-straight wall tube by the computed travel, with separate wall wet closures opened.','Restore the pressure fittings, static bulkheads, independent pans/returns, all protective boundaries and electrical field; pressure/leak and fitted fault/spray checks precede charging.'],
      sourcePressJawRequired:false,completeRemovalAndOperatorAcceptance:false},selected:false,installedAcceptance:false,preSiteArrangementComplete:false}
  return {...result,reviewSvg:renderCabinet(result)}
}
function renderCabinet(v:{architecture:{bodyMm:B;compartmentDividerXMm:number;sourceHost:{nominalBoundingWindowObscuredMm2:number};doors:readonly {bodyMm:B}[]};branches:readonly {id:string;riserAxisMm:number[];valveBodyMm:B}[];quantities:{totalDeclaredGrossUpperKg:number;knownSteelGrossKg:number};source:{bindingDigest:string}}){
  const b=v.architecture.bodyMm,k=.27,x=(a:number)=>70+(a-b[0])*k,y=(z:number)=>600-(z-b[2])*k
  const lines=[`<rect x="70" y="${y(b[2]+b[5])}" width="${b[3]*k}" height="${b[5]*k}" fill="none" stroke="black" stroke-width="2"/>`,`<path d="M${x(v.architecture.compartmentDividerXMm)} ${y(b[2])}V${y(b[2]+b[5])}" stroke="black"/>`]
  for(const c of v.branches)lines.push(`<path d="M${x(c.riserAxisMm[0])} ${y(b[2]+100)}V${y(b[2]+b[5]+100)}" stroke="#333" stroke-width="4"/>`,`<rect x="${x(c.valveBodyMm[0])}" y="${y(c.valveBodyMm[2]+c.valveBodyMm[5])}" width="${c.valveBodyMm[3]*k}" height="${c.valveBodyMm[5]*k}" fill="white" stroke="black"/>`,`<text x="${x(c.riserAxisMm[0])-20}" y="${y(b[2])-12}" font-size="12">${c.id}</text>`)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="760" viewBox="0 0 1100 760"><rect width="1100" height="760" fill="white"/><g font-family="Arial,sans-serif" fill="#222"><text x="40" y="40" font-size="25">One copper isolation cabinet · whole-arrangement challenger</text><text x="40" y="69" font-size="14">Source-bound study; not selected, certified or released for construction.</text>${lines.join('')}<text x="450" y="145" font-size="18">${b[3]} wide × ${b[4]} deep · top Z${b[2]+b[5]}</text><text x="450" y="180" font-size="15">Two independent wet compartments; no sliding top gland.</text><text x="450" y="215" font-size="15">28mm copper + matching Conex metal-sealing joints.</text><text x="450" y="250" font-size="15">Steel ${v.quantities.knownSteelGrossKg}kg · declared full gross bound ${v.quantities.totalDeclaredGrossUpperKg}kg</text><text x="450" y="285" font-size="15">Nominal bounding-window loss ${(v.architecture.sourceHost.nominalBoundingWindowObscuredMm2/1e6).toFixed(3)}m².</text><text x="450" y="340" font-size="15">Known valve PTFE/EPDM has no owner exception.</text><text x="450" y="375" font-size="15">Actual floor seat, wall/pipe restraints, bulkhead seals,</text><text x="450" y="400" font-size="15">pan/outlet joints, flow and whole movement remain open.</text><text x="40" y="667" font-size="14">The generous cabinet buys service space by spending window area; the owner judges that trade.</text><text x="40" y="699" font-size="12">Nominal plan and conditional service/structure host remain distinct. Diagram does not adopt either.</text><text x="40" y="730" font-size="10">Source ${v.source.bindingDigest}</text></g></svg>`
}
