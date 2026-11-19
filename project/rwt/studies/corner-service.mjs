// First-motion comparison, mm. Trial equipment has no installed rating.
import {readFileSync} from 'node:fs';
const read = name => JSON.parse(readFileSync(new URL(name,import.meta.url)));
const renewal=read('live-receiver-renewal.json'), corner=read('live-receiver-corner-failure.json');
const centre=read('middle-eave-exchange.json'), vac=read('ground-high-eave-control.json');
const had=read('../../had/studies/water-replan.json').renewal;
const event=read('selected-water-event.json');
const A=renewal.profiles.A, guard=renewal.profiles.guard;
const southY=corner.south[0].y, secondary=renewal.world.secondary[1];
const far=A.modules[0].p[1], near=A.p[0], diag=Math.SQRT2;

export function ordinaryHead(gutter,shoe,bendR=100) {
  const [back,front]=gutter.y;
  const outerR=25, returnLeg=260, inletDrop=150;
  const minAxis=back+5+shoe, maxAxis=front-5-outerR;
  const above=gutter.front+30, below=gutter.bottom+5;
  const gripZ=[1000,1500], socket=t=>t+returnLeg-inletDrop;
  return {gutter:gutter.y,shoe,axisRange:[minAxis,maxAxis],tipRange:[below,above],
    shieldSideReserve:minAxis-outerR-secondary,
    poleOutsideGutter:minAxis+2*bendR-outerR-front,
    shoeToSecondaryOnDescent:maxAxis-shoe-secondary,
    requiredPole:[socket(above)-gripZ[0],socket(below)-(vac.geometry.trialFloor+100)],
    reachToInsideEdge:minAxis-shoe-back,reachToOutsideEdge:front-(maxAxis+outerR),
    maximumCrown:above+returnLeg+bendR+outerR};
}

export function floorStations(closedWellWalking = false, lowerGrip = 1000){
  // One person, both wet intakes remain clear; closed well panels are not a foot station.
  const exclusions=[[4250,7300,1000,395],[5250,7400,1950,350],...(closedWellWalking?[]:[had.courtIntakeWell]),
    [6025,6950,100,450],[5600,5530,640,590]];
  const clear=(x,y)=>x>=4550 && x<=7450 && y>=4550 && y<=7450 && exclusions.every(([a,b,w,h])=>
    Math.hypot(Math.max(a-x,0,x-a-w), Math.max(b-y,0,y-b-h))>=300);
  const fit={};
  for(let face=0;face<4;face++){
    const missed=[];
    for(let p=4505;p<=7495;p+=10){
      // Wider modular U: lowest pole axis 4510+300 and highest during raised approach 4870+300.
      const positions=[4810,4970,5170];
      const maps=(p,q)=>[[p,q],[12000-q,p],[12000-p,12000-q],[q,12000-p]][face];
      const pole=positions.map(q=>maps(p,q));
      const [px,py]=pole[1];
      let common=false;
      for(let dx=-525;dx<=525 && !common;dx+=25)for(let dy=-525;dy<=525 && !common;dy+=25){
        const x=px+dx,y=py+dy;
        if(clear(x,y) && pole.every(([u,v])=>Math.hypot(x-u,y-v,1450-lowerGrip)<=600))common=true;
      }
      if(!common)missed.push(p);
    }
    fit[['S','E','N','W'][face]]={positions:300,missed};
  }
  return fit;
}

// Extend the *same* court fall south without modifying either existing guard shadow.
// Conservatively delete the deepest quarter by rank; 1 mm midpoint strips, fractional last strip.
export function extendedIntake(extension,approachLoss) {
  const [west,north]=event.inlet.gradedIntervals;
  const known=had.courtCollector.actualOpenEntries.west;
  const slope=(known.crestEnds[1]-known.crestEnds[0])/(known.y[1]-known.y[0]);
  const strips=[];
  for(const [a,b] of [[west[0]-extension,west[1]],north]){
    for(let y=a+.5;y<b;y++){
      const crest=known.crestEnds[0]+slope*(y-known.y[0]);
      const head=event.duty.quietStageMm-approachLoss-crest;
      strips.push(Math.sqrt(9.81)*(Math.max(0,head)/2000)**1.5);
    }
  }
  strips.sort((a,b)=>a-b);
  const count=.75*strips.length, whole=Math.floor(count);
  return strips.slice(0,whole).reduce((sum,v)=>sum+v,0)+(count-whole)*strips[whole];
}

export function cornerService() {
  const wetStart=4365, travel=150, wetEnd=wetStart+travel;
  const lower=A.bottom-A.carrierDepth-centre.handling.drop;
  const top=A.back-centre.handling.drop, halfRail=guard.tubeDiameter/2;
  const guardY=guard.platform[1], guardX=5475;
  const guardWidth=diag*(guardX-guardY)-2*halfRail;
  const firstRest=[5200,5200,600,600], stroke=900, translated=[near+stroke,far+stroke];
  const pickupX=[5300,5500], movingBand=far-near;
  const flow=event.duty.flowLps;
  const parkedSpool=[5200,4385], spoolRad=75, fixedTop=6200;
  const parkedGap=(parkedSpool[0]-parkedSpool[1]-2*spoolRad-movingBand)/diag;
  const crestWidth=250, yc=1000*Math.cbrt((flow/crestWidth)**2/9.81);
  // One wet end remains when its companion blocks; this does NOT produce a second fixed outlet.
  const sill=6605,rim=A.front,required=sill+5+2*yc;
  const pad0=guard.pads[0], padSize=guard.padSquare,well=had.courtIntakeWell;
  const padE=[12000-pad0[1]-padSize/2,12000-pad0[0]-padSize/2,padSize,padSize];
  const overlap=(a,b,n)=>Math.max(0,Math.min(a[n]+a[n+2],b[n]+b[n+2])-Math.max(a[n],b[n]));
  const crossLength=Math.hypot(900,900), crossWidth=250, depth=yc;
  const diameter=4*crossWidth*depth/(crossWidth+2*depth);
  const headerHead=6000+5+(1.5+(1.5+0.05*crossLength/diameter)/2)*yc;
  const rawDrop=6000, speed=Math.sqrt(2*9.81*rawDrop/1000);
  const jet=[200,250,600].map(width=>{
    const incoming=flow/width/speed, froude=speed/Math.sqrt(9.81*incoming);
    return {width,conjugate:500*incoming*(Math.sqrt(1+8*froude**2)-1)};
  });
  const chamberSill=50, baffleArea=0.3*0.06;
  const baffleV=flow/1000/baffleArea, baffleLoss=8*1000*baffleV**2/(2*9.81);
  const quietStage=chamberSill+5+2*yc, inletStage=quietStage+baffleLoss;
  const dropToGround=chamberSill+5-(-110), groundedV=Math.sqrt(2*9.81*dropToGround/1000+9.81*yc/1000);
  const localDepth=flow/250/groundedV, localFr=groundedV/Math.sqrt(9.81*localDepth);
  const localConjugate=500*localDepth*(Math.sqrt(1+8*localFr**2)-1);
  const pressureKPa=9.81*(6190-(-25))/1000;
  const feet=[[4500,5900],[7100,6050],[4500,6500]];
  const cornerReactions={};
  for(const [id,x,y] of [['SW',4350,4350],['SE',7650,4350],['NE',7650,7650],['NW',4350,7650]]){
    const b=(x-feet[0][0])/(feet[1][0]-feet[0][0]);
    const c=(y-feet[0][1]-b*(feet[1][1]-feet[0][1]))/(feet[2][1]-feet[0][1]);
    cornerReactions[id]=[1-b-c,b,c].map(k=>5*k);
  }
  return {flow,oldReturnLoss:corner.returnOverlapCeasesAt,
    oldClear:corner.adjacentDripsClearAt,
    duplicateLead:[A.outletsP[0],southY-200-A.permanentPipeQ],
    tray:{start:wetStart,end:wetEnd,travel,primaryActive:southY-wetStart,
      secondaryActive:secondary-wetStart,dryClear:wetEnd-secondary,armsTo:5450,
      untouchedStripAfterSeam:pickupX[0]-far,armOverlap:5450-pickupX[0]},
    moving:{p:[near,far],width:diag*movingBand,guardWidth,guardEach:(guardWidth-diag*movingBand)/2,
      lower,top,midClear:lower-(guard.midCentre+halfRail),topClear:guard.topCentre-halfRail-top,
      stroke,rest:firstRest,restExtents:translated,restReserve:Math.min(translated[0]-firstRest[0],
        firstRest[0]+firstRest[2]-translated[1]),oldGuardHitsCorner:guard.posts[0]===near && guardY<far},
    spool:{fixedTop,barePipeOD:2*spoolRad,park:parkedSpool,
      parkToPickup:pickupX[0]-parkedSpool[0]-spoolRad,
      sweptBandClear:parkedGap,fixedTopToDraw:lower-fixedTop},
    pickup:{x:pickupX,minPlanGap:(pickupX[0]-(4250-A.q[0])-movingBand)/diag,
      trialSill:sill,width:crestWidth,required,stageReserve:rim-required,
      disconnectedEndToPort:pickupX[0]-far},
    header:{from:[5400,4500],to:[4500,5400],length:crossLength,bed:6000,
      rim:6190,requiredHead:headerHead,headReserve:6190-headerHead,
      overheadToDraw:lower-6190,
      firstRestPlanReserve:(2*translated[0]-9900)/diag-crossWidth/2,
      directDrop:rawDrop,speed,jet},
    chamber:{normal:[4350,6775,450,450],east:[5550,6650,450,450],crewGap:5550-4800,
      sill:chamberSill,quietStage,inletStage,rimReserve:350-inletStage,baffleV,baffleLoss,
      dropToGround,localConjugate,impactForceN:flow*speed,jetPowerW:flow*9.81*rawDrop/1000,
      blockedStaticKPa:pressureKPa,coverLiftKN:pressureKPa*.4*.4},
    compare:{feet,cornerReactions,eastPad:padE,wellOverlap:[overlap(padE,well,0),overlap(padE,well,1)]},
    vacuum:{catalogue:vac.machine.neck,original:ordinaryHead(vac.geometry.sharedReceiver,85),
      narrowBendOnModular:ordinaryHead({y:[4250-A.q[1],4250-A.q[0]],front:A.front,bottom:A.bottom},155),
      modular:ordinaryHead({y:[4250-A.q[1],4250-A.q[0]],front:A.front,bottom:A.bottom},155,150)},
    originalHADChanged:false};
}
