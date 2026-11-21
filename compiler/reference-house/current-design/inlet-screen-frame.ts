/** Finite, wall-hung reference frame. No floor, DPC, liner or ceiling support.
 * Steel checks are static necessary comparisons; masonry/group, weld, impact,
 * panel handling and installed acceptance remain separate unqualified duties.
 */
import { fixedInletReceiverFacts } from './inlet-fixed-receiver.js'

type Box = readonly [number,number,number,number,number,number]
type Wall = { id:string; coreY:readonly number[]; finishesY:readonly number[]; portalX:readonly number[] }
const oppositeCoreFaceForMass=(w:Wall,south:boolean)=>south?w.coreY[0]:w.coreY[1]
const rhs = (a:number,t:number) => ({ area:a*a-(a-2*t)**2, I:(a**4-(a-2*t)**4)/12, Z:(a**4-(a-2*t)**4)/(6*a) })
export function inletScreenFrame(input:{ planeXMm:number; board:readonly number[]; panelY:readonly number[]; panelZ:readonly number[];
  sheetKg:number; sourceReversalN:number; lowerConnectionZMm:number;anchorOffsetMm:number;clearHeightMm:number;walls:readonly Wall[]; panelCount:number }) {
  const {planeXMm:x,board:b,panelY:y,panelZ:z,walls}=input, steel=fixedInletReceiverFacts.steel
  if(walls.length!==2||y.length!==2||z.length!==2||![x,...b,...y,...z,input.sheetKg,input.sourceReversalN,input.lowerConnectionZMm,input.anchorOffsetMm,input.clearHeightMm].every(Number.isFinite)
    ||b.length!==6||y[1]<=y[0]||z[1]<=z[0]||input.sheetKg<=0||input.sourceReversalN<0||input.lowerConnectionZMm<500||input.lowerConnectionZMm>1500||input.panelCount!==8||input.anchorOffsetMm<60||input.anchorOffsetMm>250)throw new Error('Invalid shield frame domain')
  const members:{id:string;boxMm:Box;netSectionAreaMm2:number;stockLengthMm:number;massKg:number;basis:string}[]=[]
  const add=(id:string,box:Box,area:number,length:number,basis:string)=>{const m={id,boxMm:box,netSectionAreaMm2:area,stockLengthMm:length,massKg:area*length*steel.densityKgM3/1e9,basis};members.push(m);return m}
  const section=rhs(50,4), railSection=rhs(40,3), postAxisY=[y[0]+35,y[1]-35], postSpan=z[1]-z[0], railSpan=postAxisY[1]-postAxisY[0],
    rows=[input.lowerConnectionZMm,2700], anchorX=x+input.anchorOffsetMm, armLength=anchorX+75-(x+50), setting=10
  for(const [i,axis]of postAxisY.entries())add(`HAD/shield-post-${i+1}`,[x,axis-25,z[0],50,50,postSpan],section.area,postSpan,'50x50x4 reference RHS')
  for(let i=0;i<5;i++){const level=z[0]+i*postSpan/4;add(`HAD/shield-rail-${i+1}`,[x,postAxisY[0]+25,level-20,40,railSpan-50,40],railSection.area,railSpan-50,'40x40x3 rail ends meet post faces;4mm returned weld comparison')}
  const connections=walls.flatMap((w,i)=>rows.map((level,j)=>{
    if(w.coreY.length!==2||w.finishesY.length!==2||w.portalX.length!==2||w.coreY[1]<=w.coreY[0])throw new Error('Missing actual shield wall core')
    const south=i===0, face=south?w.finishesY[1]:w.finishesY[0], coreFace=south?w.coreY[1]:w.coreY[0],
      plateY=south?face+5:face-15, armY=south?plateY+10:plateY-50,
      backFace=south?w.finishesY[0]:w.finishesY[1],backPlateY=south?backFace-15:backFace+5,
      projection=40, coreDepth=w.coreY[1]-w.coreY[0], spacer=Math.abs(plateY+(south?0:10)-coreFace),
      backSpacer=Math.abs((south?backPlateY+10:backPlateY)-(south?w.coreY[0]:w.coreY[1]))
    const arm=add(`HAD/${w.id}/shield-arm-${j+1}`,[x+50,armY,level-25,armLength,50,50],section.area,armLength,'50x50x4 arm side welded to endplate; no interpenetrating stock')
    const plate=add(`HAD/${w.id}/front-plate-${j+1}`,[anchorX-75,plateY,level-75,150,10,150],150*10,150,'150x150x10 front plate')
    const back=add(`HAD/${w.id}/back-plate-${j+1}`,[anchorX-75,backPlateY,level-75,150,10,150],150*10,150,'150x150x10 opposed accessible backing plate')
    const rodLength=coreDepth+spacer+backSpacer+20+40, rods=[-50,50].flatMap(dx=>[-50,50].map(dz=>({pointMm:[anchorX+dx,(w.coreY[0]+w.coreY[1])/2,level+dz],diameterMm:20,clearBoreMm:22,minimumCutLengthMm:rodLength})))
    for(let k=0;k<4;k++){add(`HAD/${w.id}/through-rod-${j+1}-${k+1}`,[rods[k].pointMm[0]-10,Math.min(plateY,backPlateY)-20,rods[k].pointMm[2]-10,20,rodLength,20],Math.PI*20**2/4,rodLength,'M20 gross stock mass; nominal2.5mm pitch/root geometry comparison, supplied grade unqualified')
      const py=rods[k].pointMm[2],px=rods[k].pointMm[0]
      add(`HAD/${w.id}/front-core-spacer-${j+1}-${k+1}`,[px-22.5,Math.min(coreFace,plateY+(south?0:10)),py-22.5,45,spacer,45],Math.PI*(45**2-22**2)/4,spacer,'45OD/22ID bare-core sleeve; no finish bearing')
      add(`HAD/${w.id}/back-core-spacer-${j+1}-${k+1}`,[px-22.5,Math.min(oppositeCoreFaceForMass(w,south),backPlateY+(south?10:0)),py-22.5,45,backSpacer,45],Math.PI*(45**2-22**2)/4,backSpacer,'Separate opposite-face45OD/22ID sleeve; no fictitious sleeve through core')}
    add(`HAD/${w.id}/back-cover-${j+1}`,[anchorX-82,backPlateY-(south?17:0),level-82,164,40,164],164*3,164+2*40,'3mm returned metal cover stock budget; exact corners and fasteners additional')
    const oppositeCoreFace=south?w.coreY[0]:w.coreY[1]
    return{id:`HAD/${w.id}/shield-connection-${j+1}`,wallId:w.id,coreYMm:w.coreY,coreDepthMm:coreDepth,localZMm:level,
      pointMm:[anchorX,(w.coreY[0]+w.coreY[1])/2,level],frontPlateMm:plate.boxMm,backPlateMm:back.boxMm,armMm:arm.boxMm,
      oppositeCoverEnvelopeMm:[anchorX-82,south?backFace-projection:backFace,level-82,164,projection,164],
      rods,spacerToBareCoreMm:[spacer,backSpacer],finishRadialClearanceMm:(50-45)/2,
      minimumCoreEdgeAfterPlateAnd10Mm:anchorX-75-w.portalX[1]-10,oppositeCoreFaceMm:oppositeCoreFace,
      floorDpcOrLinerAnchor:false,caseOrPipeReactionCredited:false,substrateAndGroupResistanceQualified:false}
  }))
  const panelSeats=Array.from({length:8},(_,i)=>{const col=i%2,row=Math.floor(i/2),width=(y[1]-y[0])/2,bottom=z[0]+row*postSpan/4;
    return[.25,.75].map((q,k)=>({id:`HAD/shield-panel-${i+1}/seat-${k+1}`,boxMm:[x,y[0]+(col+q)*width-20,bottom+20,25,40,6],massKg:25*40*6*steel.densityKgM3/1e9,
      bearingAreaMm2:25*40,contact:'Foot underside bears on the actual rail top; local weld and positive retention remain unqualified.'}))}).flat(),
    panelRetainers=Array.from({length:8},(_,i)=>{const col=i%2,row=Math.floor(i/2),width=(y[1]-y[0])/2,bottom=z[0]+row*postSpan/4;
      return[.25,.75].flatMap(q=>[bottom+10,bottom+postSpan/4-10].map(level=>({id:`HAD/shield-panel-${i+1}/retainer-${q}-${level}`,
        axisXYZMm:[x,y[0]+(col+q)*width,level],shaftEnvelopeMm:[x-4,y[0]+(col+q)*width-3,level-3,60,6,6],
        reference:'M6x60 through the4mm sheet and40mm rail, workshop-captive rear nut/washer. Exact component, perforated rail section, washer bearing and local impact/weld qualification are not supplied.'}))) }).flat(),
    seatsKg=panelSeats.reduce((n,p)=>n+p.massKg,0),
    boltWasherNutBudgetKg=4, totalKg=input.sheetKg+members.reduce((n,m)=>n+m.massKg,0)+seatsKg+boltWasherNutBudgetKg,
    G=totalKg*9.81, designG=1.35*G, P=1.5*input.sourceReversalN, L=rows[1]-rows[0], lowerOverhang=rows[0]-z[0],upperOverhang=z[1]-rows[1],
    postMoment=Math.max(P*L/4,P*lowerOverhang,P*upperOverhang),postStress=postMoment/section.Z+designG/section.area,
    postDeflection=Math.max(P*L**3/(48*steel.elasticModulusMpa*section.I),... [lowerOverhang,upperOverhang].map(a=>P*a*a*(L+a)/(3*steel.elasticModulusMpa*section.I))),
    railMoment=P*railSpan/4, railStress=railMoment/railSection.Z, railDeflection=P*railSpan**3/(48*steel.elasticModulusMpa*railSection.I),
    attachmentHorizontal=P*(1+Math.max(lowerOverhang,upperOverhang)/L), armEccentricity=anchorX-(x+25),armStress=designG*armEccentricity/section.Z+attachmentHorizontal/section.area,
    attachmentNormalLever=Math.max(...postAxisY.map((v,i)=>Math.abs(v-(walls[i].coreY[0]+walls[i].coreY[1])/2))),boltTension=(designG*attachmentNormalLever+attachmentHorizontal*attachmentNormalLever)/(2*100),boltGroupMyNmm=designG*armEccentricity,boltGroupShearPolarMm2=4*(50**2+50**2),
    boltTorsionShearN=boltGroupMyNmm*50/boltGroupShearPolarMm2,boltShear=Math.hypot(designG/4+boltTorsionShearN,attachmentHorizontal/4+boltTorsionShearN),
    threadRootMm=20-1.227*2.5,tensileAreaMm2=Math.PI/4*(20-.9382*2.5)**2,rodBendingMpa=32*boltShear*45/(Math.PI*threadRootMm**3),
    boltStress=Math.sqrt((boltTension/tensileAreaMm2+rodBendingMpa)**2+3*(boltShear/tensileAreaMm2)**2),plateStress=6*boltTension*25/(37.5*10**2),allowable=steel.comparisonProofStressMpa/1.5,
    dryGap=b[0]-(x+50)-setting-postDeflection-railDeflection,
    staticSteelNecessary=Math.max(postStress,railStress,armStress,boltStress,plateStress)<=allowable&&dryGap>=0
  const result={state:'wall-hung-shield-frame-comparison' as const,selected:false as const,members,connections,panelSeats,panelRetainers,
    layout:{frameFrontXMm:x,frameBackXMm:x+50,postAxesYMm:postAxisY,attachmentRowsZMm:rows,anchorAxisXMm:anchorX,
      panelSeat:'Two25x40x6 feet each panel, underside20mm above sheet bottom, directly bearing on40mm rail top; no pressure pipe or liner support.',
      panelRetention:'Four captive M6 upper/side retainers per panel; exact weld/local panel and pressure impact resistance unqualified.',
      normalFloorClearanceMm:z[0]-20,topFrameBelowCeilingMm:input.clearHeightMm-z[1]-20,requiredInstallation:'Fit opposed backing plates and noncompressible sleeves directly to exposed core;50mm finish clear holes keep45mm sleeves independent of finish. Both room faces remain accessible.'},
    quantities:{sheetKg:input.sheetKg,frameAndPlatesAndRodStockKg:members.reduce((n,m)=>n+m.massKg,0),panelSeatKg:seatsKg,boltWasherNutBudgetKg,totalReferenceKg:totalKg,
      weldAndUnknownHardwareKg:null,exactSupplierMaximumLoadedMassQualified:false},
    staticComparison:{steel,proofDivisor:1.5,gravityActionFactor:1.35,sourceActionFactor:1.5,dynamicImpactFactorQualified:false,
      totalGravityN:G,gravityDesignN:designG,sourceDesignN:P,postStressMpa:postStress,railStressMpa:railStress,armStressMpa:armStress,
      boltTensionN:boltTension,boltShearN:boltShear,boltGroupMyNmm,boltGroupShearPolarMm2,boltTorsionShearN,boltCombinedMpa:boltStress,threadRootMm,tensileAreaMm2,rodFreeSpanComparisonMm:45,rodBendingMpa,frontPlateStripStressMpa:plateStress,allowableMpa:allowable,
      postDeflectionMm:postDeflection,railDeflectionMm:railDeflection,boardReserveAfter10AndDeflectionMm:dryGap,necessaryStaticSteelScreen:staticSteelNecessary,
      scope:'Full paired steady-reversal envelope is charged to either single rail/post at its worst height; full gravity charged to each bracket as a nonconcurrent resistance envelope. Not a measured jet/dynamic load, exact frame-stiffness/group solution or installed resistance.'},
    structuralHandoff:{massItems:members,panelSeats,panelRetainers,panelSheetKg:input.sheetKg,seatKg:seatsKg,hardwareBudgetKg:boltWasherNutBudgetKg,attachmentPointsMm:connections.map(c=>c.pointMm),
      globalGravityN:G,eachConnectionNonconcurrentEnvelope:{verticalN:designG,horizontalXN:attachmentHorizontal,boltTensionN:boltTension,boltShearN:boltShear},
      physicalInterfaces:connections.map(c=>{const i=walls.findIndex(w=>w.id===c.wallId),origin=[x+25,postAxisY[i],c.localZMm],offset=origin.map((v,k)=>v-c.pointMm[k]);return{
        id:c.id,owningWallId:c.wallId,originXYZMm:c.pointMm,frameLoadApplicationXYZMm:origin,
        forceComponentBoundsN:[[-attachmentHorizontal,attachmentHorizontal],[0,0],[-designG,0]],
        momentComponentBoundsNmm:[[-Math.abs(offset[1])*designG,Math.abs(offset[1])*designG],[-Math.abs(offset[0])*designG,Math.abs(offset[0])*designG],[-Math.abs(offset[1])*attachmentHorizontal,Math.abs(offset[1])*attachmentHorizontal]],
        scope:'Nonconcurrent resistance envelope at this actual core origin; do not sum all four into a global equilibrium load. Global mass items and source-hit alternatives remain authoritative for coupled analysis.',
        missingReceiverEvidence:'Actual140mm core material/reinforcement, four-hole group, local bearing/splitting, preload/prying, wall transfer to its ground receiver and coupled52-head representation.'}}),
      exactMasonryReceiverAnd52HeadModelUpdated:false,contactPreloadPryingAndFrameWeldsQualified:false},
    diagnostics:[...(!staticSteelNecessary?['SHIELD_FRAME_STATIC_STEEL_OR_CLEARANCE_SCREEN_FAILS']:[]),
      ...(connections.some(c=>c.minimumCoreEdgeAfterPlateAnd10Mm<0)?['SHIELD_FRAME_BACKPLATE_EXCEEDS_REAL_JAMB']:[]),
      ...((z[0]-20<10||input.clearHeightMm-z[1]-20<10)?['SHIELD_FRAME_FLOOR_OR_CEILING_CLEARANCE_FAILS']:[]),
      'SHIELD_FRAME_MASONRY_GROUP_PRYING_AND_RECEIVER_UNQUALIFIED','SHIELD_FRAME_IMPACT_LOCAL_PANEL_WELDS_AND_HANDLING_UNQUALIFIED','SHIELD_FRAME_LOADS_NOT_IN_52_HEAD_MODEL']}
  return{...result,reviewSvg:drawFrame(input,result)}
}


function drawFrame(input:Parameters<typeof inletScreenFrame>[0],r:{members:readonly{boxMm:Box;id:string}[];quantities:{totalReferenceKg:number};staticComparison:{necessaryStaticSteelScreen:boolean;postStressMpa:number;boardReserveAfter10AndDeflectionMm:number}}){
 const y0=input.panelY[0],z0=input.panelZ[0],b=input.board,k=.22,ky=.45,
  ey=(y:number)=>65+(y-y0)*k,ez=(z:number)=>800-z*k,
  px=(x:number)=>1120+(x-(input.planeXMm-100))*ky,py=(y:number)=>170+(y-input.walls[0].coreY[0])*ky,
  text=(x:number,y:number,s:string,size=16)=>`<text x="${x}" y="${y}" font-size="${size}">${s}</text>`,
  elev=r.members.filter(m=>/shield-(post|rail)/.test(m.id)).map(m=>`<rect x="${ey(m.boxMm[1])}" y="${ez(m.boxMm[2]+m.boxMm[5])}" width="${m.boxMm[4]*k}" height="${m.boxMm[5]*k}" fill="#48636b" stroke="#20353b"/>`).join(''),
  plans=r.members.filter(m=>/shield-post|front-plate|back-plate|shield-arm/.test(m.id)).map(m=>`<rect x="${px(m.boxMm[0])}" y="${py(m.boxMm[1])}" width="${m.boxMm[3]*ky}" height="${m.boxMm[4]*ky}" fill="#526970" fill-opacity=".65" stroke="#20353b"/>`).join('')
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="950" viewBox="0 0 1600 950"><rect width="1600" height="950" fill="#f5f1e6"/><g fill="#25221c" font-family="Arial,sans-serif">
${text(40,42,'Wall-hung service shield · coordinated development candidate',26)}${text(40,76,'Unadopted Utility portal/transfer shift; actual support cores and full load ledger; no floor, DPC or ceiling anchors.')}
${text(45,120,'WEST ELEVATION · model mm',18)}${elev}
<rect x="${ey(y0)}" y="${ez(input.panelZ[1])}" width="${(input.panelY[1]-y0)*k}" height="${(input.panelZ[1]-z0)*k}" fill="#d2ddd8" fill-opacity=".3" stroke="#834a3b" stroke-width="2"/>
${[1,2,3].map(i=>`<line x1="${ey(y0)}" x2="${ey(input.panelY[1])}" y1="${ez(z0+i*(input.panelZ[1]-z0)/4)}" y2="${ez(z0+i*(input.panelZ[1]-z0)/4)}" stroke="#834a3b"/>`).join('')}
<line x1="${ey((y0+input.panelY[1])/2)}" x2="${ey((y0+input.panelY[1])/2)}" y1="${ez(z0)}" y2="${ez(input.panelZ[1])}" stroke="#834a3b"/>
${text(300,205,`Eight removable4mm sheets; bottom${z0}, top${input.panelZ[1]}mm.`)}
${text(300,245,'50 x50 x4 posts;40 x40 x3 rails; two feet per panel.')}
${text(300,285,`Lower/upper wall groups${input.lowerConnectionZMm}/2700mm.`)}
${text(300,325,'150-square opposed plates; four M20 rods each group.')}
${text(300,365,'45OD/22ID bare-core sleeves; finish remains clear.')}
${text(300,420,`Reference stock+sheet+fixing budget:${r.quantities.totalReferenceKg.toFixed(1)}kg.`)}
${text(300,460,`Static steel screen:${r.staticComparison.necessaryStaticSteelScreen?'PASS':'FAIL'}; post${r.staticComparison.postStressMpa.toFixed(1)}MPa.`)}
${text(300,500,`Board reserve after10mm+deflections:${r.staticComparison.boardReserveAfter10AndDeflectionMm.toFixed(1)}mm.`)}
${text(300,555,'Masonry group, splitting, prying and wall-to-ground transfer unqualified.')}
${text(300,595,'Local panel/seat/weld impact and loaded handling remain unqualified.')}
${text(1130,120,'PLAN · cropped at east service wall',18)}
${input.walls.map(w=>{const start=Math.max(input.planeXMm-100,w.portalX[1]);return `<rect x="${px(start)}" y="${py(w.coreY[0])}" width="${(b[0]+b[3]-start)*ky}" height="${(w.coreY[1]-w.coreY[0])*ky}" fill="#c8c3b8"/>`}).join('')}
<rect x="${px(b[0])}" y="${py(b[1])}" width="${b[3]*ky}" height="${b[4]*ky}" fill="#d4b580" stroke="#66512b"/>${plans}
<line x1="${px(input.planeXMm)}" x2="${px(input.planeXMm)}" y1="${py(input.panelY[0])}" y2="${py(input.panelY[1])}" stroke="#834a3b" stroke-width="3"/>
${text(40,850,'The opening width stays900mm; its westward100mm relocation and the elevated board remain counterfactual source choices.',17)}
${text(40,885,'No adopted house, measured jet resistance, substrate acceptance, material exception or owner appearance approval is claimed.',17)}
${text(40,920,'The52-head model does not yet consume these interface origins/loads. Read the source-bound result and named receiver obligations.',16)}
</g></svg>`
}
