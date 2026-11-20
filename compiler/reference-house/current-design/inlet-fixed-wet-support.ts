import {createHash} from 'node:crypto'
import type {compileFixedInletCandidate} from './inlet-fixed-entry.js'
import {fixedInletReceiverFacts} from './inlet-fixed-receiver.js'

type Candidate=ReturnType<typeof compileFixedInletCandidate>
type Point=readonly [number,number,number]
type Box=readonly [number,number,number,number,number,number]
type XY=readonly [number,number]
type Cell={id:string;case:{plan:XY[];roofZ:number;permanentLowerTroughLipZ:number};vent:{outer:Point;inner:Point;formedDiameterMM:number}}
type Sources={wetCellsText:string;servicesText:string;portalText:string}
const paths={wet:'project/had/studies/south-inlet-wet-box.json',services:'project/had/studies/current-house-services.json',portal:'project/str/studies/floor-portal-interface-review.json'} as const
const blob=(s:string)=>createHash('sha1').update('blob '+Buffer.byteLength(s)+'\0').update(s).digest('hex')
const r=(n:number)=>Number(n.toFixed(6))||0
const area=(p:readonly XY[])=>Math.abs(p.reduce((n,a,i)=>n+a[0]*p[(i+1)%p.length][1]-a[1]*p[(i+1)%p.length][0],0))/2
const perimeter=(p:readonly XY[])=>p.reduce((n,a,i)=>n+Math.hypot(a[0]-p[(i+1)%p.length][0],a[1]-p[(i+1)%p.length][1]),0)
const gap=(a:readonly number[],b:readonly number[])=>Math.max(...[0,1,2].map(i=>Math.max(b[i]-a[i]-a[i+3],a[i]-b[i]-b[i+3])))
const rectSection=(a:number,b:number,t:number)=>({area:a*b-(a-2*t)*(b-2*t),iy:(a*b**3-(a-2*t)*(b-2*t)**3)/12,iz:(b*a**3-(b-2*t)*(a-2*t)**3)/12})
const insideCircleMargin=(plan:readonly XY[],centre:XY,radius:number)=>Math.min(...plan.map((a,i)=>{
  const b=plan[(i+1)%plan.length],dx=b[0]-a[0],dy=b[1]-a[1]
  return (dx*(centre[1]-a[1])-dy*(centre[0]-a[0]))/Math.hypot(dx,dy)-radius
}))
const frontAtX=(plan:readonly XY[],x:number)=>Math.max(...plan.flatMap((a,i)=>{
  const b=plan[(i+1)%plan.length]
  if(x<Math.min(a[0],b[0])-1e-8||x>Math.max(a[0],b[0])+1e-8)return []
  if(a[0]===b[0])return [a[1],b[1]]
  return [a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0])]
}))

export const fixedInletWetSupportFacts={
  saw:{model:'Bahco228',overallLengthMm:270,bladeLengthMm:150,frameHeightMm:60,massKg:.18,teethPerInch:32,
    source:'https://www.bahco.com/int_en/junior-hacksaws-with-steel-profile-frame-and-wooden-handle-150-mm-pb_228_.html',
    measuredOutOfPlaneThicknessMm:null,requiredMaximumThicknessMm:50,authoredStrokeMm:60,
    instruction:'https://www.viega.co.uk/content/dam/viegadm/en/showpad-migration/uk/Sanpress%20Inox%20Instructions.pdf',
    instructionSections:'3.3.5 and3.4.3–3.4.4 permit a fine-toothed hacksaw, square cut and internal/external deburring; no oil, flame or abrasive disc'},
  steel:fixedInletReceiverFacts.steel,sourceCheckedOn:'2026-11-20',
  backSheetMm:5,frontAndSideSheetMm:3,cellWallMm:2,floorMm:3,roofMm:3,neckWallMm:3,
  manualHoodPullN:150,declaredSourceForceMeasured:false,
} as const

export function compareFixedInletWetSupport(candidate:Candidate,sources:Sources){
  const inputs:Record<string,string>={}
  for(const [path,text] of [[paths.wet,sources.wetCellsText],[paths.services,sources.servicesText],[paths.portal,sources.portalText]]){
    const actual=blob(text)
    if(candidate.source.inputs[path]!==actual)throw new Error('Wet support requires the actual candidate source: '+path)
    inputs[path]=actual
  }
  const wet=JSON.parse(sources.wetCellsText) as {branches:Cell[]}
  const services=JSON.parse(sources.servicesText) as {utility:{washerFirstRest:readonly number[];PVinverter:readonly number[];PVinverterLocalZ:readonly number[]}}
  const portal=JSON.parse(sources.portalText) as {geometry:{jambQmm:number[];jambNormalAlongMM:number[]}}
  const facts=fixedInletWetSupportFacts,density=facts.steel.densityKgM3/1e9,allowable=facts.steel.comparisonProofStressMpa/1.5
  const face=Math.max(...portal.geometry.jambQmm),axes=[...candidate.supportFrame.jambAxesXMm].sort((a,b)=>a-b),span=axes[1]-axes[0]
  const washer:Box=[services.utility.washerFirstRest[0],services.utility.washerFirstRest[1],0,services.utility.washerFirstRest[2],services.utility.washerFirstRest[3],848]
  const inverter:Box=[services.utility.PVinverter[0],services.utility.PVinverter[1],services.utility.PVinverterLocalZ[0],services.utility.PVinverter[2],services.utility.PVinverter[3],services.utility.PVinverterLocalZ[1]-services.utility.PVinverterLocalZ[0]]
  const masses:{id:string;branch:string|null;massKg:number;pointMm:Point;basis:string}[]=[]
  const addMass=(id:string,branch:string|null,volumeMm3:number,pointMm:Point,basis='authored net stock')=>masses.push({id,branch,massKg:volumeMm3*density,pointMm,basis})
  const lowSection=rectSection(80,60,4)
  for(const z of [40,120])addMass('low-rail-'+z,null,lowSection.area*span,[(axes[0]+axes[1])/2,480,z])
  const wetEndplates=axes.map(x=>{
    const box:Box=[x-75,face+10,20,150,20,530]
    addMass('wet-endplate-'+x,null,150*20*530,[x,face+20,285])
    addMass('wet-packing-'+x,null,2*90*60*10,[x,face+5,350])
    const pads=[40,120].map(z=>[x===axes[0]?x:x-75,face+30,z-30,75,440-face-30,60] as Box)
    addMass('low-rail-weld-pads-'+x,null,2*75*(440-face-30)*60,[x+(x===axes[0]?37.5:-37.5),436.25,80])
    return {bodyMm:box,anchorAxesMm:[200,500].map(z=>[x,face,z]),dryWeldPadBodiesMm:pads,returnedWeldLegMm:6,fixtureMm:30,concreteDpcLevelKnown:false,requiredDpcTopAtOrBelowZMm:120}
  })
  const stays=[9900,10460].map(x=>{
    const box:Box=[x-20,520,10,40,40,1750]
    addMass('wet-stay-'+x,null,rectSection(40,40,4).area*1750,[x,540,885])
    return {bodyMm:box,lowRailContactFacesMm:[40,120].map(z=>[x-20,520,z-30,40,0,60]),weldLegMm:4}
  })
  const upperBeam:Box=[9920,520,1730,520,30,20]
  addMass('wet-upper-beam',null,rectSection(30,20,3).area*520,[10180,535,1740])
  const branchResults=candidate.branches.map((b,index)=>{
    const cell=wet.branches.find(c=>c.id===b.branch)
    if(!cell)throw new Error('Missing actual wet cell')
    const h=b.controlArrangementComparison.wholeOrdinaryValveHood,body=h.bodyMm,x=b.pressurePathMm[0][0],floor=b.fault.inheritedLowerReliefAndIndependentReceiver.geometry.lowerInvertZMm-3
    if(cell.case.roofZ!==body[2])throw new Error('Candidate and native wet-cell roof disagree')
    const minX=Math.min(...cell.case.plan.map(p=>p[0])),maxX=Math.max(...cell.case.plan.map(p=>p[0])),back=Math.min(...cell.case.plan.map(p=>p[1]))
    const flareStart=Math.max(450,Math.ceil((b.fault.inheritedLowerReliefAndIndependentReceiver.geometry.dryLimitZMm+20)/10)*10)
    const topPlan:XY[]=[[minX,back],[maxX,back],[maxX,candidate.settings.wetGuardFrontYMm],[minX,candidate.settings.wetGuardFrontYMm]]
    const throat=h.throatDiameterMm,neckOD=throat+2*facts.neckWallMm,centre:XY=[x,candidate.settings.riserYMm]
    const actualNeckMargin=insideCircleMargin(cell.case.plan,centre,neckOD/2)-2-5
    const flaredNeckMargin=insideCircleMargin(topPlan,centre,neckOD/2)-2-5
    const oldOuter76Margin=insideCircleMargin(cell.case.plan,centre,throat/2)-2-5
    const annulus=Math.PI*(throat**2-candidate.settings.protectedLowerDiameterMm**2)/4
    const velocity=h.authoredFlowLmin/60000/(annulus/1e6),head=velocity**2/(2*9.81*.6**2)*1000
    const kBudget=2*9.81*((h.metalFunnelDropMm-10)/1000)/velocity**2-1/.6**2
    const cellArea=area(cell.case.plan),topArea=area(topPlan),wetHeight=cell.case.roofZ-(floor+3)
    const cellWaterUpperKg=(cellArea*(flareStart-floor-3)+topArea*(cell.case.roofZ-flareStart))/1e6
    const funnelWaterUpperKg=body[3]*body[4]*h.metalFunnelDropMm/1e6
    const wallArea=perimeter(cell.case.plan)*(flareStart-floor)+Math.max(perimeter(cell.case.plan),perimeter(topPlan))*(cell.case.roofZ-flareStart)*1.15
    addMass('floor',b.branch,cellArea*3,[x,(back+665)/2,floor+1.5])
    addMass('cell-walls',b.branch,wallArea*2,[x,(back+665)/2,(floor+body[2])/2],'expanded-loft perimeter/slant upper bound')
    addMass('roof',b.branch,(topArea-Math.PI*neckOD**2/4)*3,[x,(back+685)/2,body[2]-1.5])
    addMass('roof-ribs',b.branch,2*170*10*50,[x,570,body[2]-25])
    const carrier:Box=[minX,560,floor-80,170,40,40]
    addMass('solid-carrier',b.branch,170*40*40,[x,580,floor-60])
    const stanchions=[-75,75].map(dx=>{
      const box:Box=[x+dx-10,520,10,20,40,floor-50]
      addMass('solid-stanchion-'+dx,b.branch,20*40*(floor-50),[x+dx,540,(floor-30)/2])
      return box
    })
    const ribs=[-40,20,70].map(dx=>{
      const front=Math.min(frontAtX(cell.case.plan,x+dx-5),frontAtX(cell.case.plan,x+dx+5))
      return {bodyMm:[x+dx-5,525,floor-50,10,front-525,50] as Box,
        carrierSeatNotchBodyMm:[x+dx-5,560,floor-50,10,40,10] as Box,carrierBearingAreaMm2:400,remainingSeatDepthMm:40}
    })
    addMass('floor-ribs',b.branch,3*10*50*140,[x+16.666667,595,floor-25],'unclipped normal140mm ribs are a mass upper bound')
    const roofBossAxes=[-60,60].flatMap(dx=>[480,660].map(y=>[x+dx,y,body[2]]))
    addMass('roof-blind-bosses-and-pads',b.branch,4*(Math.PI*6**2*12+20*20*4),[x,570,body[2]+6])
    addMass('upper-back-sheet-and-returns',b.branch,(body[3]+80)*facts.backSheetMm*(body[5]-80),[x-25,532,(body[2]+80+body[2]+body[5])/2],'foldedC-sheet upper bound; hems/centre strip additional')
    addMass('upper-other-fixed-sheet',b.branch,(2*body[4]+body[3])*3*Math.max(0,body[5]-510),[x-25,(body[1]+body[4]/2),body[2]+body[5]/2],'full fixed side/cap prism upper stock; intentionally overlaps removable-field takeoff as reserve')
    const frontMass=(body[3]+2*body[4])*510*3*density+2*(510+body[3]+body[4])*30*3*density
    addMass('normal-front-U-cover',b.branch,frontMass/density,[x-25,body[1]+body[4]/2,candidate.settings.valveCentreZMm+5])
    addMass('funnel-neck-and-flanges',b.branch,(body[3]*80*2+body[4]*80*2+Math.PI*neckOD*30)*3+4*30*30*3,[x,candidate.settings.riserYMm,body[2]+40],'four full80mm rectangular side strips bound sloped funnel stock')
    const jet=h.idealFullyReversedJetMomentumForceN
    const panelResults=[{side:'left',width:110,releaseX:-45,coverExtension:15},{side:'right',width:body[3]-110,releaseX:30,coverExtension:0}].map(p=>{
      const width=p.width,t=5,returnLength=20,height=body[5]-80,A=width*t+2*returnLength*t,cy=(width*t*t/2+2*returnLength*t*(t+returnLength/2))/A
      const iy=width*t**3/12+width*t*(t/2-cy)**2+2*(t*returnLength**3/12+returnLength*t*(t+returnLength/2-cy)**2)
      const iz=t*width**3/12+2*(returnLength*t**3/12+returnLength*t*(width/2-t/2)**2)
      const zy=iy/Math.max(cy,t+returnLength-cy),zz=iz/(width/2),j=(width+2*returnLength)*t**3/3
      const yArm=body[1]+body[4]-(body[1]+3-cy),xArm=width/2
      const jetVm=jet*Math.sqrt((height/zy)**2+(height/zz)**2+3*(yArm*t/j)**2+3*(xArm*t/j)**2)
      const manualVm=150*(h.normalControlOpening.uHoodBodyMm[2]+510-(body[2]+80))/zy
      const sheetMass=(width+2*returnLength)*5*height*density+Math.PI*(neckOD**2-throat**2)/4*30*density/2+frontMass*.15
      const startX=p.side==='left'?body[0]:x
      const box:Box=[startX-(p.side==='left'?0:0),body[1]-22,body[2]-3,p.width+p.coverExtension,body[4]+22,body[5]+35]
      const parked:Box=[box[0]+p.releaseX,box[1]+(index===0?600:350),box[2]+8,box[3],box[4],box[5]]
      return {side:p.side,bodyBoundMm:box,sheetMm:5,dryRearReturnMm:20,centreWetCoverStripWidthMm:30,
        frontWetFaceYMm:body[1]+3,proposedOuterBackYMm:body[1]-2,
        sourceStockMassUpperKg:r(sheetMass),closedJetVectorNormN:r(jet),closedJetFrobeniusStressMpa:r(jetVm),manualNormalPullStressMpa:r(manualVm),
        hookLiftMm:8,releaseTranslationMm:[p.releaseX,index===0?600:350,8],parkedBodyBoundMm:parked,
        bareStubAfterReleaseAnd5Mm:r(Math.abs(p.releaseX)-(p.side==='left'?p.coverExtension:0)-candidate.productFacts.pressurePipe.outerDiameterMm/2-5),
        parkedWasherAfter5Mm:r(gap(parked,washer)-5),parkedInverterAfter5Mm:r(gap(parked,inverter)-5),
        stockIsMeasuredGross:false,structuralSectionPass:Math.max(jetVm,manualVm)<=allowable}
    })
    const normalCoverSeatPointN=frontMass*9.81+Math.max(jet,150)
    const seatStress=6*normalCoverSeatPointN*50/(20*6**2)
    const retainerForce=500+Math.max(jet*(body[5]-80)/500,150*510/500)
    const topArmStress=6*Math.max(jet,150)*165/(20*10**2)+6*Math.max(jet,150)*165/(10*20**2)
    const normalSeats=h.normalControlOpening.lowerSeatCleatPointsMm.map(point=>({pointMm:point,bentSectionMm:[20,50,6],upturnedLipMm:5,normalClosedGravityBearing:true,calculatedBendingMpa:r(seatStress)}))
    const normalRetainers=h.normalControlOpening.upperCaptiveRetainerPointsMm.map(point=>({pointMm:point,captiveMetric:'M6',threadAreaMm2:20.1,authoredPreloadN:500,
      demandTensionBoundN:r(retainerForce),tensionStressMpa:r(retainerForce/20.1),dryLandingArmMm:[20,165,10],landingArmStressMpa:r(topArmStress)}))
    const roofMoment=Math.max(jet,150)*(body[2]+body[5]-body[2]),roofBoltTension=500+roofMoment/(2*180)+roofMoment/(2*120)
    const stanchionBending=roofMoment/2/(20*40**2/6),floorPressure=1000*9.81*wetHeight/1000/1e6
    const floorPlateStress=3*floorPressure*235.5**2/(4*3**2)
    const weldShear=(roofMoment/(80*2)+9.81*(cellWaterUpperKg+funnelWaterUpperKg+30)/2)/(4/Math.SQRT2*2*(20+40))
    return {branch:b.branch,sourcePlanMm:cell.case.plan,sourceRoofZMm:body[2],sourceFloorLowerFaceZMm:floor,
      collar:{clearBoreMm:throat,wallMm:3,outerDiameterMm:neckOD,actualCentreMm:centre,old76FootprintAfterLinerAnd5Mm:r(oldOuter76Margin),actual82BodyAfterLinerAnd5Mm:r(actualNeckMargin),
        flaredRoofPlanMm:topPlan,flareBeginsZMm:flareStart,aboveSourceDryLimitMm:r(flareStart-b.fault.inheritedLowerReliefAndIndependentReceiver.geometry.dryLimitZMm),
        flared82BodyAfterLinerAnd5Mm:r(flaredNeckMargin),frontDryFlangeMaxYMm:centre[1]+neckOD/2+30,
        frontDryFlangeToFlaredRoofAfter2LinerAnd5Mm:r(685-centre[1]-neckOD/2-30-7),clearFlowAreaMm2:r(annulus),idealHeadAtSourceFlowMm:r(head),additionalLossBudgetK:r(kBudget),
        sealedJointDescription:'Two side-split3mm neck halves. Centre-plane dry returns extend30mm rear/front outside the76clear bore; two M6 bolts clamp opposed dry cheeks.30mm returned seam and roof interface are geometry, not a tested gasket or spray result.',
        fittedCdSeamAndSprayQualified:false},
      floor:{plateMm:3,waterSideFloorZMm:floor+3,ribs,carrierBodyMm:carrier,solidStanchionBodiesMm:stanchions,
        ribToUpperLowRailNormalGapMm:5,ribSeatRemainingDepthMm:40,roofRibs:{sectionMm:[10,50],normalAxesYMm:[480,660],spanXMm:[minX,maxX]},roofBlindBossAxesMm:roofBossAxes,
        penetration:'Continuous welded skins, blind dry bosses and closed floor/rib welds. No bolt hole through the wet floor and no pipe reaction on the liner.'},
      panels:panelResults,normalSeats,normalRetainers,
      localConnectionScreens:{floorFull235p5SpanHydrostaticStressMpa:r(floorPlateStress),wallFull235p5SpanHydrostaticStressMpa:r(floorPlateStress*3**2/2**2),solidStanchionBendingMpa:r(stanchionBending),
        stanchionReturned4MmWeldShearMpa:r(weldShear),roofM6BlindBossTensionIncluding500NPreloadN:r(roofBoltTension),roofM6TensionStressMpa:r(roofBoltTension/20.1),
        roofAndRibLoadPath:'Upper wet beam/outer stays carry the hood. Dry lower locators/bosses carry sway; welded roof ribs and closed2mm skins transfer the cell into3mm floor, notched10×50 ribs, solid carrier and solid stanchions attached to both low rails.',
        pressureRatingOrPhysicalWeldQualification:false},
      waterMassUpperKg:r(cellWaterUpperKg+funnelWaterUpperKg),waterBound:'Full-to-roof/flared-prism plus full80mm funnel water is an adverse structural inventory, not an admitted blocked-relief hydraulic state.',
      jetPointMm:[x,body[1]+body[4],body[2]+body[5]] as Point,jetForceNormN:jet,
      normalCoverStockMassUpperKg:r(frontMass),normalControlPullN:150,normalControlForceMeasured:false,
      currentSourceGeometryAdopted:false}
  })
  const sawPoses=candidate.branches.flatMap((b,index)=>[1,2].flatMap(cycle=>b.repairZones.map((zone,joint)=>{
    const cut=cycle===1?zone.cutZMm:zone.secondPlainPipeCutZMm,x=b.pressurePathMm[0][0],y=candidate.settings.riserYMm
    const direction=index===0?-1:1,minX=index===0?x-225:x-105
    const box:Box=[minX,y-14,cut-25,330,88,50]
    const step=joint===0?0:200
    const hand:Point=[x+direction*180,y+100,cut],shoulder:Point=[index===0?9766:10066,1000,1250+step]
    const sibling=candidate.branches.find(o=>o.branch!==b.branch)!,otherX=sibling.pressurePathMm[0][0]
    return {branch:b.branch,cycle,joint:joint?'upper':'lower',cutCentreMm:[x,y,cut],sweptToolBoundMm:box,handCentreMm:hand,handClearanceRadiusMm:75,shoulderMm:shoulder,
      frameRearToClosedBackAfter5Mm:r((y-14)-(y-60+3)-5),siblingBareTubeAfter5Mm:r(Math.max(otherX-box[0]-box[3],box[0]-otherX)-14-5),
      handReachMm:r(Math.hypot(...hand.map((n,k)=>n-shoulder[k]))),reachLimitMm:650,stepPlatformHeightMm:step,
      washerBodyAfter5Mm:r(gap(box,washer)-5),inverterAfter5Mm:r(gap(box,inverter)-5),
      requiredMeasuredFrameThicknessAtMostMm:50,actualFrameThicknessMeasured:false,bladeDatumAndFrontFacingAttachmentQualified:false}
  })))
  const upperMass=masses.filter(m=>m.branch!==null&&!['floor','cell-walls','roof','roof-ribs','solid-carrier','floor-ribs'].includes(m.id)&&!m.id.startsWith('solid-stanchion')).reduce((n,m)=>n+m.massKg,0)
  const allSteel=masses.reduce((n,m)=>n+m.massKg,0),water=branchResults.reduce((n,b)=>n+b.waterMassUpperKg,0)
  const centreZ=80,gauge=80,totalNormal=branchResults.reduce((n,b)=>n+Math.max(b.jetForceNormN,facts.manualHoodPullN),0)
  const weight=9.81*(allSteel+water)
  const mx=branchResults.reduce((n,b)=>n+Math.max(b.jetForceNormN,facts.manualHoodPullN)*Math.abs(b.jetPointMm[2]-centreZ),0)+masses.reduce((n,m)=>n+m.massKg*9.81*(m.branch===null?Math.abs(m.pointMm[1]-480):205),0)+water*9.81*205
  const railNormal=totalNormal/2+mx/gauge
  const railMoment=railNormal*span/4,verticalMoment=(weight+totalNormal)*span/4
  const railStress=railMoment/(lowSection.iz/40)+verticalMoment/(lowSection.iy/30)
  const torqueShear=mx/(2*76*56*4)
  const railVm=Math.hypot(railStress,Math.sqrt(3)*torqueShear)
  const wetChassisJambs=axes.map((x,index)=>{
    const fraction=(pointX:number)=>Math.abs(index===0?(axes[1]-pointX)/span:(pointX-axes[0])/span)
    const branchFraction=(id:string)=>{
      const branch=candidate.branches.find(b=>b.branch===id)!,hood=branch.controlArrangementComparison.wholeOrdinaryValveHood.bodyMm
      const cell=wet.branches.find(b=>b.id===id)!
      return Math.max(fraction(Math.min(hood[0],...cell.case.plan.map(p=>p[0]))),fraction(Math.max(hood[0]+hood[3],...cell.case.plan.map(p=>p[0]))))
    }
    const normal=branchResults.reduce((n,b)=>n+Math.max(b.jetForceNormN,facts.manualHoodPullN)*fraction(b.jetPointMm[0]),0)
    const gravity=masses.reduce((n,m)=>n+m.massKg*9.81*(m.branch===null?fraction(m.pointMm[0]):branchFraction(m.branch)),0)+branchResults.reduce((n,b)=>n+b.waterMassUpperKg*9.81*branchFraction(b.branch),0)
    const vertical=gravity+normal
    const moment=branchResults.reduce((n,b)=>n+Math.max(b.jetForceNormN,facts.manualHoodPullN)*Math.abs(b.jetPointMm[2]-350)*fraction(b.jetPointMm[0]),0)+
      masses.reduce((n,m)=>n+m.massKg*9.81*(m.branch===null?Math.abs(m.pointMm[1]-face)*fraction(m.pointMm[0]):(685-face)*branchFraction(m.branch)),0)+
      branchResults.reduce((n,b)=>n+b.waterMassUpperKg*9.81*(685-face)*branchFraction(b.branch),0)
    const tension=1.25*(normal/2+moment/300+railMoment/(2*70)),shear=vertical/2
    const plateStress=6*moment/(150*20**2)+6*railMoment/(530*20**2)
    return {jambXMm:x,anchorRowsZMm:[200,500],normalTensionBoundEachN:r(tension),verticalShearBoundEachN:r(shear),plateBiaxialStressMpa:r(plateStress),
      isolatedCatalogueLinearInteraction:r(tension/5800+shear/18000),actualGroupAndJambCapacityEstablished:false}
  })
  const postSection=rectSection(40,40,4),upperF=totalNormal,lever=1740-80
  const stayNormal=(upperMass*9.81+upperF)/(2*postSection.area)+upperF*lever*Math.hypot(1/(postSection.iy/20),1/(postSection.iz/20))
  const hookStress=6*(upperMass*9.81/8+upperF)*5/(10*5**2)
  const beamSection=rectSection(30,20,3)
  const beamStress=(upperMass*9.81+upperF)*520/4/(beamSection.iy/10)+upperF*520/4/(beamSection.iz/15)
  const stayWeldShear=(upperF*lever/80+upperMass*9.81)/(4/Math.SQRT2*2*(40+60))
  return {schema:'had-fixed-inlet-wet-support/1' as const,status:'bounded-constructive-proposal-not-source-adoption' as const,
    source:{candidateCaseDigest:candidate.source.caseDigest,planDigest:candidate.source.planDigest,inputs},facts,
    recommendation:'Retain the pipe frame and front normal covers. For cold repair use the permitted front-facing manual saw before removing the two split back/funnel halves. A local flared upper collar above the admitted wet stage preserves76clear with real82OD. The low chassis fails the stated support screen; do not adopt it. Compare one conventional shared permanent frame with separately supported pipe and wet assemblies. No pipepA is added to this wet-only comparison.',
    geometry:{lowRailsMm:candidate.supportFrame.railBoxesMm,wetEndplates,outerStays:stays,upperWetBeamBodyMm:upperBeam,
      upperHook:{sheetMm:5,lipMm:3,liftMm:8,topZMm:1755,afterLiftToPipeGuideArmAfter5Mm:r(candidate.settings.upperPipeGuideZMm-30-1755-8-5),
        captiveMetric:'M6',normalKeeperSource:'Two front-reachable captive M6 per rear half, outside the wet face; blind metal bosses in dry beam, no household power',blindBossAndToolAccessQualified:false},
      noFloorDpcOrWindowFixings:true,waterAndPipeFrameRemainIndependent:true,
      upperPressurePipeExit:{dimensionedClosure:null,physicalSprayQualified:false,additionalThermalRestraintAdmitted:false}},
    branches:branchResults,sawPoses,
    serviceSequence:['Isolate both independent Lodge branches, exclude electricity, drain and prove zero pressure. Qualify temporary upper-stub grip before cutting.',
      'Remove front U covers and jackets. Use outward-handle front-facing fine-toothed saw at both plain cuts; hold the middle valve modules and remove them without reusing a pressed end.',
      'Strip upper-stub jacket through the hood height. Release dry rear seam bolts and captive upper hook keepers; lift8, move LEFT45 or RIGHT30, then forward to its branch-specific park. Utility pair first, then Plant pair.',
      'Remove split roof/funnel closure as specified. Now use the source native press-tool poses with all own back pieces outside their working bounds. Front cap removal releases the bare L in actual+Y.',
      'Restore the closed bosses, returns, M6 keepers, jackets, atmospheric vent and separate lower outlets; pressure/leak and fitted wet/spray tests precede charging.'],
    quantities:{steelLedger:masses,representedSteelUpperKg:r(allSteel),fullStructuralWaterUpperKg:r(water),upperEnclosureStockUpperKg:r(upperMass),
      excludes:'fasteners, weld metal, actual jacket and undisclosed wet hardware; reference stock is not measured gross takeoff'},
    mechanics:{allowableComparisonMpa:r(allowable),pressurePipeEndAndThermalForcesApplied:false,jetNormEachN:branchResults.map(b=>r(b.jetForceNormN)),
      lowRailNormalEnvelopeEachN:r(railNormal),lowRailCombinedStressMpa:r(railVm),wetStayStressMpa:r(stayNormal),upperBeamBiaxialStressMpa:r(beamStress),
      stayToBothLowRails4MmReturnedWeldShearMpa:r(stayWeldShear),hookBendingStressMpa:r(hookStress),jambs:wetChassisJambs,
      structuralActionEnvelopeEachN:branchResults.map(b=>Math.max(b.jetForceNormN,facts.manualHoodPullN)),
      law:'Adverse full water and declared reference stock upper masses. All branch gravity uses the fore685 boundary and worst branch X edge to bound uncertain takeoff centroids; exact rail/plate/stay geometry uses its own centre. Each branch envelopes127N closed-fault jet and150N cold-removal pull; these are separate operating states. Components are conservatively boxed. Folded panels use vector-norm/Frobenius bounds. Full low-rail couple and torsion are both retained as adverse stiffness envelopes, not a universal reaction-capacity proof. Each jamb receives its individual point-load or adverse branch-edge fraction and wall-axis moment, plus the full rail bending-end envelope; these are conservative connection screening demands, not exact frame-stiffness reactions.',
      completeCapacity:false},
    diagnostics:[...branchResults.filter(b=>b.collar.actual82BodyAfterLinerAnd5Mm<0).map(b=>b.branch+':CURRENT_CLEAR_THROAT_BODY_INTERCEPTS_CELL'),
      ...branchResults.filter(b=>b.panels.some(p=>!p.structuralSectionPass)).map(b=>b.branch+':FOLDED_BACK_SECTION_COMPARISON_FAILS'),
      ...(railVm>allowable?['WET_LOW_RAIL_STEEL_COMPARISON_FAILS']:[]),...(wetChassisJambs.some(j=>j.plateBiaxialStressMpa>allowable)?['WET_ENDPLATE_COMPARISON_FAILS']:[]),
      ...(wetChassisJambs.some(j=>j.isolatedCatalogueLinearInteraction>1)?['WET_JAMB_ISOLATED_CATALOGUE_SCREEN_FAILS']:[]),
      ...sawPoses.filter(p=>p.handReachMm>p.reachLimitMm).map(p=>p.branch+':MANUAL_SAW_REACH_FAILS'),
      'FLARED_COLLAR_AND_SPLIT_BACK_NOT_ADOPTED_SOURCE','M6_HOOK_RELEASE_AND_COMPLETE_MANUAL_TOOL_WIDTH_REQUIRE_PHYSICAL_PROOF','ACTUAL_UPPER_STUB_GRIP_AND_GROSS_PAYLOAD_UNQUALIFIED',
      'FIXED_850_ARM_BACK_SHELL_INTERFACE_NOT_DIMENSIONED','UPPER_PRESSURE_PIPE_EXIT_CLOSURE_NOT_DIMENSIONED','FITTED_SPLIT_SEAM_SPRAY_AND_DISCHARGE_COEFFICIENT_UNQUALIFIED','ACTUAL_MATERIAL_WELD_AND_JAMB_GROUP_RESISTANCE_UNQUALIFIED',
      'FULL_PARKING_SWEEPS_FASTENER_TOOLS_AND_OPERATOR_SPACE_UNQUALIFIED','NO_LIVE_FAULT_OPEN_ACCESS_CLAIM'],
    installedAcceptance:false,completeSupportCapacity:false,ownerAdoption:false}
}
