// One conditional architectural exchange for the open E well. Coordinates and displacements in mm.
import { readFileSync } from 'node:fs';
import { capacity } from './short-inlet-review.mjs';
import { channelAtFlow, readSelected } from './selected-water-event.mjs';
import { cornerService } from './corner-service.mjs';

const gravity = 9.81;
const read = name => JSON.parse(readFileSync(new URL(name, import.meta.url)));
const clip = (rect, other) => [0, 1].map(i =>
  Math.max(0, Math.min(rect[i] + rect[i+2], other[i] + other[i+2]) - Math.max(rect[i], other[i])));

// Signed Euler–Bernoulli overhang with the guide seated at two positively restrained bearings.
// q includes one conservative full tributary plus plate and one RHS, P is at either extreme.
function rail(trial, pointX) {
  const [left,, length, width] = trial, right = left + length;
  const area = 120*60 - 110*50, inertia = (60*120**3-50*110**3)/12, E = 200000;
  const [a,b] = [5275,5725], P = 5000, tributary = 655, density = 7850;
  const w = .005*tributary + (area + width*15)*density*gravity/1e9;
  const rb = (P*(pointX-a) + w*length*((left+right)/2-a))/(b-a);
  const ra = P+w*length-rb, pos = x => Math.max(0,x);
  const curve = x => ra*pos(x-a)**3/6 + rb*pos(x-b)**3/6 - P*pos(x-pointX)**3/6 - w*pos(x-left)**4/24;
  const slope = (curve(b)-curve(a))/(b-a);
  const displacement = x => (curve(x)-curve(a)-(x-a)*slope)/(E*inertia);
  return {pointX, totalLoadN:P+w*length, reactionsN:[ra,rb], deflectionMm:[5975,6025,right].map(displacement),
    bearingDisplacementMm:[a,b].map(displacement), area, inertia, deckKg:length*width*15*density/1e9};
}

function inlet(entries, stage, required) {
  const {west} = entries, [south,north] = west.y, foot = west.excluded.northCornerFoot[0];
  const prev = read('short-inlet-review.json');
  const options = {existing:west.creditedIntervals, removeBeam:[[south,foot]], clear450:[[south,north]],
    retainFootExtend50:[[south-50,foot]], retainSupportsExtend300:[[south-300,west.creditedIntervals[0][1]],west.creditedIntervals[1]],
    sixWetClosed:prev.sixWetHungLatch.intervals};
  return Object.fromEntries(Object.entries(options).map(([key, spans])=>{
    const get = (length,lipK) => capacity(spans,stage,lipK,'deepestTotalQuarter',length);
    const edge = [100,150,200].map(length => ({length, entry:get(length,0), lip:get(length,1)}));
    let limitingLength = null;
    if(edge[0].entry >= required && edge[2].entry < required){
      let lo=100,hi=200;
      for(let i=0;i<22;i++){const mid=(lo+hi)/2;if(get(mid,0)>=required)lo=mid;else hi=mid;}
      limitingLength=(lo+hi)/2;
    }
    return [key,{spans,edge,limitingLength}];
  }));
}

function stilling(r, flow, roofPipe) {
  const {clearOutlet,plan} = r.shield, [invert,soffit] = clearOutlet.z;
  const q=flow/1000, slots=8, openSlots=6, portSide=40, basket=[7355,6605,190,590];
  const tailDepth=channelAtFlow(flow,.6,.02,50/4250).depthMm, tail=invert+tailDepth;
  const crest=-769.5, bottom=-875, ports=[-852,-812], top=-140, dividerX=7460;
  const v=q/(openSlots*(portSide/1000)**2), portLoss=8*1000*v*v/(2*gravity);
  const qHead = width => 2000*Math.cbrt((q/(width/1000))**2/gravity);
  const maxHead=soffit-20-(tail+10);
  const minimumEffective=1000*q/Math.sqrt(gravity*(maxHead/2000)**3);
  const screens=[200,250,300,400,412.5,435,442.5,450].map(width=>{
    const head=qHead(width),stage=crest+head;
    return {width,head,stage,lowerReserve:crest-tail-10,upperReserve:soffit-20-stage,
      feasibleCrestRange:[tail+10,soffit-20-head],
      stressedCrestRange:[tail+5+10+5,soffit-20-head-5]};
  });
  const reference=screens.find(s=>s.width===300);
  const [pipeX,,pipeZ]=roofPipe.route.at(-1), bore=roofPipe.insideDiameter/1000;
  const longDuty=read('temporary-two-path-control.json').states.find(item=>item.combinedEBackupDutyLps).combinedEBackupDutyLps;
  const pipeJets=[flow,longDuty].map(flowLps=>{
    const rate=flowLps/1000, pipeSpeed=rate/(Math.PI*bore*bore/4);
    const speed=Math.sqrt(pipeSpeed**2+2*gravity*(pipeZ-top)/1000);
    const radius=1000*Math.sqrt(rate/(Math.PI*speed));
    return {flowLps,radius,dividerIntrusion:radius-Math.abs(dividerX-pipeX)};
  });
  // Horizontal-jet analogue only, at the narrow impact cell. A vertical plunge is different.
  const spoutZ=r.courtCollector.actualOpenEntries.catchCover.gutterBedEnds[1];
  const impactSpeed=Math.sqrt(2*gravity*(spoutZ-bottom)/1000);
  const y1=q/(.2*impactSpeed), fr=impactSpeed/Math.sqrt(gravity*y1);
  return {plan,basket,bottom,top,dividerX,spoutZ,spoutEnd:r.courtCollector.actualOpenEntries.catchCover.spoutEndX,
    ports,portCentresY:Array.from({length:slots},(_,i)=>6680+i*50),lipX:7545,lipY:[6660,7060],crest,
    roofPipeTerminal:roofPipe.route.at(-1),pipeJets,tailDepth,tail,invert,soffit,minimumEffective,minimumGrossAtQuarter:minimumEffective/.75,
    stressedMinimumGross:1000*q/Math.sqrt(gravity*((maxHead-15)/2000)**3)/.75,screens,v,portLoss,
    inletStage:reference.stage+portLoss,operatingDepth:reference.stage+portLoss-bottom,
    lowerReserveAtRaisedTail:crest-(tail+5)-10,upperReserveAtRaisedCrest:reference.upperReserve-5,
    jetDepth:500*y1*(Math.sqrt(1+8*fr*fr)-1),removableBlockedWaterKg:basket[2]*basket[3]*(r.shield.z[1]-bottom)/1e6};
}

let result;
export function courtDecision(){
  if(result)return structuredClone(result);
  const source=readSelected(),v=source.model,m=v.model,r=v.renewal, entries=r.courtCollector.actualOpenEntries;
  const stage=m.firstWetReference.permittedQuietStage, duty=v.hydraulicProbe.assignedInwardRoofAndCourtLps;
  const original=m.courtEastWindow6850.cleaning.closedWalkingCoverReference.accessAdapter;
  const [x,y,len,width]=original.plan, east=x+len, ramp=[x-225,y,len+225,width], motion=180;
  const parked=[ramp[0]-motion,y,ramp[2],width], corner=cornerService(), turnout=corner.chamber;
  const southAccess=read('collector-access-recomposition.json').ordinaryAccess;
  const southRamp=southAccess.ramp, [footX,footY]=corner.compare.feet[1];
  const padSize=read('live-receiver-renewal.json').profiles.guard.padSquare;
  const supportB=[footX-padSize/2,footY-padSize/2,padSize,padSize];
  const firstPanX=entries.west.planeX-25, gate=r.guardGate, hingeY=gate.clearY[0]+2.5;
  const [leaf,thickness]=gate.completeLeaf, parkNorth=hingeY+thickness/2;
  const rails=[rail(ramp,east),rail(ramp,ramp[0])], deckUnder=x=>Math.min(0,original.courtEndZ+(x-ramp[0])*(-original.courtEndZ)/len)-original.deckThickness;
  const safeGap=[5975,6025].map((station,i)=>deckUnder(station)-stage+rails[0].deflectionMm[i]-5);
  const toClear=east-turnout.east[0]+30;
  result={source:source.blob,duty,stage,firstHarm:m.firstWetReference.qualifiedFirstSusceptibleZ,
    geometricCrest:m.firstWetReference.limitingLocatedJoin.z,inlet:inlet(entries,stage,duty),
    ramp:{original:original.plan,ramp,parked,rails,safeGap,firstPanX,panIntrusion:east-firstPanX,
      panParkGap:firstPanX-(east-motion),railEnds:[east,east-30],northRailY:[7255,7315],
      minimumMovingKg:rails[0].deckKg+(2*ramp[2]-30)*rails[0].area*7850/1e9,
      sweepToRail:7255-(hingeY+Math.hypot(leaf,thickness/2)),parkToModule:6900-275-parkNorth,
      moduleToWeather:7200-(6900+275),wetExtensionWithFold:50+10+1.5},
    southernAccess:{ramp:southRamp,supportB,supportOverlap:clip(southRamp,supportB),
      tipToPad:clip(southAccess.removableTip.plan,supportB),eastChamberOverlap:clip(southRamp,turnout.east)},
    chambers:{normal:turnout.normal,east:turnout.east,selectedRampOverlap:clip(original.plan,turnout.east),installedOverlap:clip(ramp,turnout.east),
      storedOverlap:clip(parked,turnout.east),normalInstalledOverlap:clip(ramp,turnout.normal),
      normalStoredOverlap:clip(parked,turnout.normal),strokeToClearEast:toClear,
      wallOvershoot:m.court[0]-(ramp[0]-toClear),blockedStaticKPa:turnout.blockedStaticKPa,
      blockedCoverLiftKN:turnout.coverLiftKN},
    stilling:stilling(r,duty,m.maintenanceRainReference.northMaintenance.courtRoof.pipe)};
  return structuredClone(result);
}

// This is a state overlay, not a simultaneous operating plan.
export function decisionDrawing(d){
  const {ramp:r,chambers:c,stilling:s}=d;
  const plan=(ox,deck,label)=>{
    const k=.148, x=a=>ox+(a-4200)*k, y=a=>268-(a-6400)*k;
    const rect=(v,fill,stroke,dash='')=>'<rect x="'+x(v[0])+'" y="'+y(v[1]+v[3])+'" width="'+(v[2]*k)+'" height="'+(v[3]*k)+'" fill="'+fill+'" stroke="'+stroke+'" stroke-dasharray="'+dash+'"/>';
    return '<text x="'+ox+'" y="84">'+label+'</text>'+rect([4250,6400,2150,1100],'#f6f4ee','#999')+
      rect(deck,'#d5e5e8','#376770')+rect(c.normal,'none','#a74f29','4 2')+rect(c.east,'url(#h)','#a74f29')+
      rect([6100,6850,330,550],'none','#48694c','3 2')+rect([6025,6900,100,475],'none','#316e93')+
      '<text class="small" x="'+x(4300)+'" y="291">West wall X4250</text>';
  };
  const h=415, x=80, k=.51, z=a=>h+(-140-a)*k;
  const level=(a,from,to,color)=>'<path d="M'+from+' '+z(a)+' H'+to+'" stroke="'+color+'" stroke-width="3"/>';
  const labels=(sx,sy,items)=>items.map((v,i)=>'<text class="small" x="'+sx+'" y="'+(sy+i*25)+'">'+v+'</text>').join('');
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 830 860" role="img" aria-label="Ramp and chamber conflicts in plan, with a section of the baffled east outlet">'+
    '<defs><pattern id="h" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 8L8 0" stroke="#a74f29" stroke-width="2"/></pattern></defs>'+
    '<rect width="830" height="860" fill="#fffdf7"/><style>text{font:17px sans-serif;fill:#223b42}.title{font:bold 25px sans-serif}.small{font:14px sans-serif}</style>'+
    '<text class="title" x="32" y="44">East court intake and service access</text>'+
    plan(34,r.ramp,'Installed deck')+plan(439,r.parked,'Deck retracted 180 mm')+
    labels(34,320,['Blue fill  ·  moving ramp      Hatched square  ·  east chamber      Dashed brown  ·  normal chamber',
    'Dashed green  ·  first pan envelope      Blue outline  ·  proposed wet approach; north foot retained'])+
    '<path d="M34 370H796" stroke="#aab9b8"/><text x="34" y="401">Open hood section through the divided basket</text>'+
    '<path d="M60 '+z(s.spoutZ)+'h70m-20 0v37l-6 -9m6 9l6 -9" fill="none" stroke="#316e93" stroke-width="3"/>'+
    '<path d="M'+x+' '+z(s.top)+'V'+z(s.bottom)+'H330V'+z(s.crest)+'H350" stroke="#40565c" stroke-width="4" fill="none"/>'+
    '<path d="M207 '+z(s.top)+'V'+z(s.ports[1])+'M207 '+z(s.ports[0])+'V'+z(s.bottom)+'" stroke="#40565c" stroke-width="5"/>'+
    level(s.inletStage,80,204,'#327d9b')+level(s.screens[2].stage,210,328,'#327d9b')+level(s.tail,348,388,'#327d9b')+
    level(s.soffit,348,389,'#6b635d')+level(s.invert,348,389,'#6b635d')+
    labels(415,450,['Left cell receives the high spout at −180.','Low ports feed the separate right cell.',
      'Eight 40 × 40 ports; six available in this case.','400 gross crest; 300 after obstruction.','Selected trial crest −769.5.',
      'Overflow cell −720.50; tail −780.42.','The actual outlet fixes a 100 mm height.',
      'A 5 mm tail rise consumes the free-nappe allowance.','A 5 mm rise in crest loses the top allowance.','Elevations in mm; horizontal section schematic.'])+
    '<text class="small" x="34" y="830">Design comparison · roof-corner service needs both chambers while E remains available.</text></svg>\n';
}
