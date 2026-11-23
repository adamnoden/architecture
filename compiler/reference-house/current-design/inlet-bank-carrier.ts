/** Finite flat-shelf rejection screen for the actual source-bound indoor bank.
 * Existing signed pressure/locked-thermal comparisons remain challenges, not solved guide reactions.
 * This deliberately does not substitute a fabricated clamp or a guessed masonry resistance. */
import type {inletBankReceiver} from './inlet-bank-receiver.js'
import type {inletIndoorRoutes} from './inlet-indoor-routes.js'
import type {inletEntrySideCuts} from './inlet-indoor-cuts.js'
import {segmentBoxDistance} from '../../../project/had/studies/service-interface-geometry.mjs'
type Box=readonly[number,number,number,number,number,number]
export type InletBankShelfCandidate={shelfThicknessMm:number;clampShiftUpMm:number;backplateThicknessMm:number;backplateHeightMm:number;steelElasticModulusMPa:number;steelDensityKgM3:number;steelProofComparisonMPa:number;proofDivisor:number}
const candidateKeys=['shelfThicknessMm','clampShiftUpMm','backplateThicknessMm','backplateHeightMm','steelElasticModulusMPa','steelDensityKgM3','steelProofComparisonMPa','proofDivisor'] as const
type Input={bank:ReturnType<typeof inletBankReceiver>;routes:ReturnType<typeof inletIndoorRoutes>;cuts:ReturnType<typeof inletEntrySideCuts>;candidate:InletBankShelfCandidate}
const gap=(a:Box,b:Box)=>{const d=[0,1,2].map(k=>Math.max(a[k]-b[k]-b[k+3],b[k]-a[k]-a[k+3]));return d.some(v=>v>0)?Math.hypot(...d.map(v=>Math.max(0,v))):Math.max(...d)}
export function compareInletBankShelfCarrier(i:Input){
 const s=i?.candidate,b=i?.bank,r=i?.routes,c=i?.cuts
 if(!s||!b||!r||!c||Object.keys(s).length!==candidateKeys.length||candidateKeys.some(key=>!Object.hasOwn(s,key))||Object.values(s).some(v=>!Number.isFinite(v))||s.shelfThicknessMm<=0||s.clampShiftUpMm<0||s.backplateThicknessMm<=0||s.backplateHeightMm<=0||s.steelElasticModulusMPa<=0||s.steelDensityKgM3<=0||s.steelProofComparisonMPa<=0||s.proofDivisor<1||b.receivers.length!==4||b.reactions.length!==2||r.paths.length!==4)throw Error('Unsupported complete finite bank shelf candidate')
 if(b.reactions.some(v=>!v.cases.length||v.cases.some(load=>load.pipeComparisonForceN.length!==3||load.pipeComparisonForceN.some(n=>!Number.isFinite(n)))))throw Error('Unsupported finite bank source action cases')
 if(b.reactions.some(v=>v.cases.some(load=>load.pipeComparisonForceN[0]!==0||load.pipeComparisonForceN[1]!==0)))throw Error('Horizontal source force requires a different carrier model')
 if(b.datum.groundFflMm!==c.groundStage.fflMm)throw Error('Bank carrier ground revision/datum mismatch')
 const coreFaceY=b.datum.wallCoreYMm[0],rootY=coreFaceY-s.backplateThicknessMm,
  allowable=s.steelProofComparisonMPa/s.proofDivisor,setting=r.pipe.settingEachPipeMm,
  rows=b.receivers.map(receiver=>{
   const source=b.reactions.find(v=>v.branch===receiver.branch)
   if(!source)throw Error('Bank carrier missing branch action reference')
   const [x,y,z0]=receiver.centreMm,z=z0+s.clampShiftUpMm,width=receiver.metalComparisonBoxMm[3],stripH=receiver.metalComparisonBoxMm[5],frontY=receiver.metalComparisonBoxMm[1],length=rootY-frontY,arm=rootY-y
   if(length<=0||arm<=0||arm>length)throw Error('Finite shelf must join the actual bank to the north bare-core face')
   const metal:Box=[x-width/2,frontY,z-stripH/2-s.shelfThicknessMm,width,length,s.shelfThicknessMm],
    plate:Box=[x-width/2,rootY,z-s.backplateHeightMm/2,width,s.backplateThicknessMm,s.backplateHeightMm],
    wrapping=r.pipe.radialInsulationMm+r.pipe.jacketEachSideMm,
    // One joined cover is required at the pipe; the wall pocket is a separately unqualified thermal/material interface.
    cover:Box=[metal[0]-wrapping,metal[1]-wrapping,metal[2]-wrapping,width+2*wrapping,length+2*wrapping,stripH+s.shelfThicknessMm+2*wrapping],
    shelfKg=width*length*s.shelfThicknessMm*s.steelDensityKgM3/1e9,plateKg=width*s.backplateThicknessMm*s.backplateHeightMm*s.steelDensityKgM3/1e9,
    lower=receiver.centreMm[2]-receiver.adjacentJacketAxialGapMm/2,upper=receiver.centreMm[2]+receiver.adjacentJacketAxialGapMm/2,
    lowerReserve=metal[2]-lower-setting,upperReserve=upper-(z+stripH/2)-setting,
    calculate=(thickness:number,forceN:number)=>{
     const ownN=width*length*thickness*s.steelDensityKgM3/1e9*9.81,
      inertia=width*thickness**3/12,sectionModulus=width*thickness**2/6,
      signedRootMomentNmm=forceN*arm-ownN*length/2,
      bendingMPa=Math.abs(signedRootMomentNmm)/sectionModulus,
      maximumShearMPa=1.5*Math.abs(forceN-ownN)/(width*thickness),
      stressComparisonMPa=Math.hypot(bendingMPa,Math.sqrt(3)*maximumShearMPa),
      clampDeflectionMm=forceN*arm**3/(3*s.steelElasticModulusMPa*inertia)-ownN/length*arm**2*(6*length**2-4*length*arm+arm**2)/(24*s.steelElasticModulusMPa*inertia)
     return{ownGravityN:ownN,signedRootMomentNmm,bendingMPa,maximumShearMPa,stressComparisonMPa,clampDeflectionMm}
    },
    cases=source.cases.map(load=>{
     const force=load.pipeComparisonForceN[2],response=calculate(s.shelfThicknessMm,force),shelfN=shelfKg*9.81,plateN=plateKg*9.81,
      // All actions refer to the same actual core plane; no centroid-to-foundation mapping occurs.
      coreWrenchN_Nm=[0,0,force-shelfN-plateN,(y-coreFaceY)/1000*force-((frontY+rootY)/2-coreFaceY)/1000*shelfN-(rootY+s.backplateThicknessMm/2-coreFaceY)/1000*plateN,0,0],
      shiftedLowerReserve=lowerReserve+Math.min(0,response.clampDeflectionMm),shiftedUpperReserve=upperReserve-Math.max(0,response.clampDeflectionMm)
     return{pressureSign:load.pressureSign,thermalSign:load.thermalSign,sourceForceN:force,...response,coreOriginMm:[x,coreFaceY,z+c.groundStage.fflMm],coreWrenchN_Nm,
      lowerReserveAfterSettingsAndElasticMm:shiftedLowerReserve,upperReserveAfterSettingsAndElasticMm:shiftedUpperReserve,
      necessaryShelfStressAndAxialSlotComparison:response.stressComparisonMPa<=allowable&&Math.min(shiftedLowerReserve,shiftedUpperReserve)>=0,
      actualClampWeldBoltGroupAndMasonryResistanceQualified:false}
    }),
    minimumStrengthThickness=(()=>{let lo=.01,hi=100;for(let k=0;k<70;k++){const mid=(lo+hi)/2; if(source.cases.every(v=>calculate(mid,v.pipeComparisonForceN[2]).stressComparisonMPa<=allowable))hi=mid;else lo=mid}return hi})(),
    obstacles=[{id:'joined-insulated-carrier',box:cover},{id:'core-backplate',box:plate}].flatMap(part=>r.checkedObstacles.map(o=>({part:part.id,obstacle:o.id,reserveMm:gap(part.box,o.boxMm)-setting}))),
    otherPipes=r.paths.filter(p=>!p.id.startsWith(receiver.branch+'/')).flatMap(p=>p.pointsMm.slice(1).map((end,k)=>({path:p.id,segment:k,reserveMm:segmentBoxDistance(p.pointsMm[k],end,cover)-r.pipe.maximumOuterDiameterMm/2-wrapping-2*setting}))),
    arms=c.valves.flatMap(v=>v.grips.map(g=>segmentBoxDistance(c.ordinaryOperator.shoulderMm,g.pointMm,cover)-c.ordinaryOperator.armRadiusMm-setting))
   return{id:receiver.id+'/flat-shelf',branch:receiver.branch,side:receiver.side,sourceReceiverId:receiver.id,sourceCaseBranch:source.branch,
    proposedClampCentreMm:[x,y,z],shelfBoxMm:metal,backplateBoxMm:plate,joinedInsulationJacketBoxMm:cover,
    wallPocketAndThermalBridgeQualified:false,fullWallWrapPenetrationMm:Math.max(0,cover[1]+cover[4]-coreFaceY),
    actualRootYMm:rootY,loadArmMm:arm,shelfFullLengthMm:length,shelfKg,backplateKg:plateKg,
    exactShelfCentroidMm:[x,(frontY+rootY)/2,metal[2]+s.shelfThicknessMm/2+c.groundStage.fflMm],
    exactBackplateCentroidMm:[x,rootY+s.backplateThicknessMm/2,z+c.groundStage.fflMm],
    lowerReserveAfterSettingMm:lowerReserve,upperReserveAfterSettingMm:upperReserve,
    maximumShelfThicknessInAxialSlotMm:receiver.adjacentJacketAxialGapMm-stripH-2*setting,
    minimumShelfThicknessForSourceStressComparisonMm:minimumStrengthThickness,
    sourceStressThicknessFitsEvenOptimallyRecenteredSlot:minimumStrengthThickness<=receiver.adjacentJacketAxialGapMm-stripH-2*setting,
    minimumObstacleReserveMm:Math.min(...obstacles.map(v=>v.reserveMm)),minimumOtherBranchPipeReserveMm:Math.min(...otherPipes.map(v=>v.reserveMm)),
    minimumOrdinaryArmReserveMm:Math.min(...arms),obstacleConflicts:obstacles.filter(v=>v.reserveMm<0),otherBranchPipeConflicts:otherPipes.filter(v=>v.reserveMm<0),cases,
    allSourceChallengesWithinShelfAndSlotComparison:cases.every(v=>v.necessaryShelfStressAndAxialSlotComparison),
    actualClampBearingBoltCentresToolCaptureAndRenewalQualified:false}
  })
 const necessaryCarrierComparison=rows.every(v=>v.allSourceChallengesWithinShelfAndSlotComparison&&v.minimumObstacleReserveMm>=0&&v.minimumOtherBranchPipeReserveMm>=0&&v.minimumOrdinaryArmReserveMm>=0)
 return{schema:'had-bank-flat-shelf-carrier/1',state:'unadopted-flat-shelf-development-comparison',candidate:s,steelComparisonAllowableMPa:allowable,
  rows,referenceCarrierSteelKg:rows.reduce((n,v)=>n+v.shelfKg+v.backplateKg,0),
  anySourceStressThicknessFitsSlot:rows.some(v=>v.sourceStressThicknessFitsEvenOptimallyRecenteredSlot),
  necessaryCarrierComparison,
  mechanics:'Each finite full-width shelf is an ideal fixed-root Euler–Bernoulli plate strip, with actual signed point force at the pipe axis and exact uniform shelf selfweight. The gross section combines maximum bending and rectangular shear as a conservative comparison. Core wrenches add shelf/backplate gravity once. Actual local plate/clamp contact, welds, prying, rod group, masonry and intermediate flexibility remain unsolved.',
  sourceActionScope:'Each pickup receives the complete source branch signed pressure/locked-thermal challenge separately. Above/below pickup cases are NONCONCURRENT alternative load-path challenges, never four simultaneous branch forces. Nominal valve/tail gravity is already in the source force and is not added again.',
  gravityScope:'Four manufactured shelves and backplates are distinct real stock. Clamps, rods/sleeves, weld stock, closures/insulation and complete handling payload remain unweighed.',
  decision:necessaryCarrierComparison?'The declared shelf/slot/obstacle comparison holds; actual clamps, carrier connections, thermal closure and core resistance remain unqualified.':'Reject the thin flat shelf as the current complete pressure/thermal carrier. Do not relieve the locked source demand by assuming sliding clamps. Develop a finite deeper/side receiver and solve actual flexibility, or revise the bank/tails with their complete occupied interfaces.',
  nativeStructuralActionsAdopted:false,actualIndependentCarrierSelected:false,wholeOccupiedArrangementComplete:false}
}

/** Dimensioned Y/Z section through one actual pickup, plus the common rejection table. */
export function drawInletBankShelfCarrier(r:ReturnType<typeof compareInletBankShelfCarrier>){
 const a=r.rows[0],y0=a.shelfBoxMm[1]-40,z0=a.proposedClampCentreMm[2],scale=2.1,
  X=(y:number)=>60+(y-y0)*scale,Y=(z:number)=>360-(z-z0)*scale,
  box=(b:readonly number[],fill:string,stroke:string)=>`<rect x="${X(b[1])}" y="${Y(b[2]+b[5])}" width="${b[4]*scale}" height="${b[5]*scale}" fill="${fill}" stroke="${stroke}"/>`,
  text=(x:number,y:number,t:string,size=16)=>`<text x="${x}" y="${y}" font-size="${size}">${t}</text>`
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="850" viewBox="0 0 1200 850"><rect width="1200" height="850" fill="#f5f1e6"/><g font-family="Arial,sans-serif" fill="#29271f">${text(35,45,'Indoor bank: actual flat-shelf carrier comparison',26)}${text(35,80,'Unadopted reference. Complete signed source challenge retained; no sliding-clamp or foundation credit.')}${text(35,125,'Y/Z SECTION · Utility lower pickup · dimensions in mm',18)}${box(a.joinedInsulationJacketBoxMm,'#ded2b8','#a79571')}${box(a.shelfBoxMm,'#64757c','#3b4b53')}${box(a.backplateBoxMm,'#64757c','#3b4b53')}<line x1="${X(a.proposedClampCentreMm[1])}" x2="${X(a.proposedClampCentreMm[1])}" y1="220" y2="500" stroke="#388997" stroke-width="4"/>${text(35,550,`Pipe Y${a.proposedClampCentreMm[1]}; plate face Y${a.actualRootYMm}; bare core Y${a.backplateBoxMm[1]+a.backplateBoxMm[4]}.`)}${text(35,580,`Shelf ${r.candidate.shelfThicknessMm} thick; clamp shift +${r.candidate.clampShiftUpMm}; actual load arm ${a.loadArmMm.toFixed(2)}.`)}${text(35,610,`Steel stock ${r.referenceCarrierSteelKg.toFixed(3)} kg before rods, clamps, welds and thermal closures.`)}${text(620,155,'Pickup · available thickness / required for stress',18)}${r.rows.map((v,k)=>text(620,200+k*60,`${v.branch}/${v.side}: ${v.maximumShelfThicknessInAxialSlotMm.toFixed(3)} / ${v.minimumShelfThicknessForSourceStressComparisonMm.toFixed(3)} mm.`)).join('')}${text(620,480,r.rows.every(v=>!v.sourceStressThicknessFitsEvenOptimallyRecenteredSlot)?'Full thermal source cannot fit this flat shelf in the slot.':'Stress thickness fits the slot; actual interface checks remain.')}${text(620,515,'Above/below challenges are separate, nonconcurrent cases.')}${text(620,550,'Root, clamp contact, welds and masonry remain unqualified.')}${text(620,585,'Full wrap intrudes the core; wall closure is unresolved.')}${text(35,710,r.necessaryCarrierComparison?'Bounded comparison holds; actual carrier connections and materials remain unqualified.':'Decision: replace the rejected carrier; preserve full source and interface duties.',18)}${text(35,750,'A flexible carrier requires actual guides, valve restraint, coupled tube analysis and complete occupied clearances.')}${text(35,810,'HAD remains OPEN · no physical support selection or native structural admission',17)}</g></svg>`
}
