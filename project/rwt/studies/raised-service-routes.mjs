// One-at-a-time repair at the raised court eaves. All geometry in mm, flow in L/s.
import {readFileSync} from 'node:fs';
import {ordinaryHead} from './corner-service.mjs';
import {relief} from './south-eave-relief.mjs';
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const {A}=read('./live-receiver-renewal.json').profiles;
const middle=read('./middle-eave-exchange.json'), roof=read('../../mat/studies/ring-roof-family.json');
const g=9.81;
const critical=(q,width)=>1000*Math.cbrt((q/width)**2/g);
export function raisedService(had){
  const w=had.frame.capture, wall=4250, centre=6000, gable=2*centre;
  const [pMin,pMax]=[w.primaryQ,gable-w.primaryQ], sky=(pMax-pMin)/1000;
  const ridge=roof.catchment.outerCourtRidgeSides[2]/1000;
  const rate=read('./selected-water-event.json').duty.syntheticRainfallMmPerHour/3600;
  const perMetre=(ridge-sky)/2*rate, valley=roof.catchment.revisedCourt.valleyLps;
  const face=sky*perMetre, roofDuty=4*(face+valley), directCourt=sky**2*rate;
  const drips=[w.primaryQ,w.secondaryQ], nearestTurn=drips[1];
  const trough=A.q.map(q=>wall-q).reverse(), boot=[140,250], bootZ=6640;
  const stroke=90, dry=[4565,4745], endDry=[4565,4675], endWet=endDry.map(q=>q-stroke);
  const localBays=A.modules.slice(1,-1).map(({p},i)=>{
    const [lo,hi]=p, direct=(hi-lo)*perMetre/1000;
    const upstream=(lo<=centre&&centre<=hi?0:Math.min(Math.abs(lo-centre),Math.abs(hi-centre)))*perMetre/1000;
    const upstreamSeam=hi<=centre?hi:lo>=centre?lo:null;
    // The headward neighbour keeps its own gravity transfer while this panel is absent.
    const scupper=upstreamSeam===null?null:(hi<=centre?[hi+35,hi+135]:[lo-135,lo-35]);
    const pickupRise=upstreamSeam===null?null:2*critical(upstream,100*.75);
    return {bay:i+1,p,direct,upstream,upstreamScupperP:scupper,pickupWater:pickupRise===null?null:6615+5+pickupRise,boots:[[lo-boot[1],lo-boot[0]],[hi+boot[0],hi+boot[1]]],
      turningDripReserve:Math.min(lo-boot[1]-nearestTurn,gable-nearestTurn-hi-boot[1])};
  });
  const terminal=middle.bypass.invertAtEnds, crest=middle.bypass.crownZ+175;
  // Maximum still-air horizontal throw from any free outlet between its invert and crest.
  const launchZ=Math.max(terminal,(crest+A.bottom)/2);
  const freeThrow=2*Math.sqrt((crest-launchZ)*(launchZ-A.bottom));
  const floorUpper=A.centreInvert+Math.max(...[...endDry,...endWet].map(y=>Math.abs(wall-y-A.valleyQ)*A.crossFall));
  const lowerGap=bootZ-floorUpper-10, sides=endDry[1]-endDry[0], clearSide=sides-2*A.gauge;
  // Under a squared boot four edges can discharge. Allow NO credit for two obstructed edges.
  const lowerArea=2*clearSide*lowerGap/1e6, available=crest-20-10-A.front;
  const qRows=[had.incoming.duty,had.incoming.longBackup].map(q=>{
    const rimHead=2*critical(q,clearSide*.75), u=q/1000/lowerArea, escapeK4=4000*u*u/(2*g);
    return {q,rimHead,rimReserve:175-20-10-rimHead,lowerEscapeK4:escapeK4,
      floodedBootControlReserve:available-escapeK4};
  });
  // Bed follows A's actual 1% ridge-to-leader fall and 1% transverse fold.
  const reliefControl=relief();
  const oldTool=ordinaryHead({y:trough,front:A.front,bottom:A.bottom},155,150);
  const radius=150+25, throatQ=oldTool.axisRange[0]+150, highestShoe=oldTool.tipRange[1];
  const envelope=(leg,errorQ)=>highestShoe+leg+Math.sqrt(radius**2-(throatQ-w.secondaryQ-errorQ)**2);
  return {reach:{gutter:trough,inletAxis:oldTool.axisRange,shoeRange:oldTool.tipRange,returnLeg:240,
      formerNominalGap:w.secondaryZ-envelope(260,0),formerAdverse:w.secondaryZ-10-envelope(260,10),
      shortenedAdverse:w.secondaryZ-10-envelope(240,10),minimumPoleEffective:oldTool.requiredPole.map(x=>x-20),
      poleClearOfGutter:oldTool.poleOutsideGutter},
    tributary:{sky,run:(ridge-sky)/2,perMetre,face,valley,oneCorner:face+valley,roofDuty,directCourt,combined:roofDuty+directCourt},
    straight:{oldPark:middle.bypass.dryQ.map(q=>wall-q).reverse(),dry,endDry,endWet,stroke,
      wetEndPickup:drips.map(q=>Math.min(q-endWet[0],endWet[1]-q)),frontReserve:trough[1]-endDry[1],
      sideHeight:175,crest,secondaryToCrest:w.secondaryZ-crest,bootIntervalFromSeam:boot,bootZ,bootClearSide:clearSide,
      transverseRemaining:trough[1]-trough[0]-2*A.gauge-sides,freeThrow,unhoodedLanding:A.moduleLength-150,
      parkedApronGap:boot[0]+middle.apron.parkedJ[0],minBedDischargeGapAfterTwo5:lowerGap,
      lowerAreaTwoEdgesM2:lowerArea,lowerExitBelowSpill:A.front-bootZ,rows:qRows,bays:localBays,
      wallRelief:{scope:'Two end scuppers on the south face, with native vented relief to the opposite leader.',sill:reliefControl.sill,ceiling:reliefControl.ceiling,upstreamReserve:reliefControl.donorReserve}},
    major:{equipmentFootprint:read('./over-roof-site-envelope.json').screening.equipmentPlusConditionalFrontGateAabb,
      separateRoofFlow:read('./over-roof-service.json').derived.flowLitresPerSecond,
      corners:roof.renewal.pitchedEnvelopeGapsAtCentreAndCorner,cornerAfter250:roof.renewal.cornerAfter250CoverRiseAndTwoMetres,
      unsupportedReach:roof.renewal.sideStageEdgeToApexStraightMm}};
}
