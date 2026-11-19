// Paired 5 mm setout and source coordinates in millimetres.
const limit=(v,a,b)=>Math.max(a-v,v-b,0);
const old=y=>-30-.04*(y-5750);
const full=y=>y<=6850?-30-.05*(y-5750):-96+.02*(7400-y);
export function floor(x,y){
  const west=4750+Math.min(500,Math.max(0,y-6800));
  const fraction=Math.max(0,Math.min(1,(x-west)/(5500-west),(6600-x)/(6600-6050)));
  return old(y)+fraction*(full(y)-old(y));
}
export function occupied(h,home,grid){
  const rectangleGap=(p,b)=>Math.hypot(limit(p[0],b[0],b[0]+b[2]),limit(p[1],b[1],b[1]+b[3]));
  const r=home.renewal, N=h.frame.chambers.normal, E=[5450,6075,450,450], rack=[5925,5840,600,350];
  const routes=h.frame.cases.map(c=>{
    const R=c.corner==='SE'?[[7250,5400],[7500,5400],[7500,6300],[5675,6300]]:c.pipeRoutes.east.map((p,i)=>i>=2?[p[0],6300]:p);
    // Each route is orthogonal. Subtract half-pipe and half-column square envelopes in both directions.
    const pairedClearToTower=Math.min(...h.frame.pads.flatMap(p=>R.slice(1).map((b,i)=>{
      const a=R[i];return rectangleGap(p,[Math.min(a[0],b[0])-150,Math.min(a[1],b[1])-150,Math.abs(a[0]-b[0])+300,Math.abs(a[1]-b[1])+300]);})))-10;
    const [x,y,w,d]=h.frame.serviceDeck.ladderPlan;
    const ladderClear=route=>Math.min(...route.slice(1).map((b,i)=>{
      const a=route[i],west=Math.min(a[0],b[0])-80,east=Math.max(a[0],b[0])+80,
        south=Math.min(a[1],b[1])-80,north=Math.max(a[1],b[1])+80;
      return Math.hypot(Math.max(x-east,west-x-w,0),Math.max(y-north,south-y-d,0))-10;
    }));
    return {corner:c.corner,east:R,normal:c.pipeRoutes.normal,pairedClearToTower,
      eastToLadder:ladderClear(R),normalToLadder:ladderClear(c.pipeRoutes.normal)};});
  const north=[[5900,7140],[5900,7530],[7000,7530],[7000,12800],[5300,12800],[5300,14100]];
  const ties=grid.heads.map(({id,xy,capXY})=>{
    const rect=[xy[0]-capXY[0]/2,xy[1]-capXY[1]/2,...capXY];
    const clear=Math.min(...north.slice(1).map((b,i)=>{
      const a=north[i],dx=Math.max(rect[0]-Math.max(a[0],b[0]),Math.min(a[0],b[0])-rect[0]-rect[2],0);
      const dy=Math.max(rect[1]-Math.max(a[1],b[1]),Math.min(a[1],b[1])-rect[1]-rect[3],0);return Math.hypot(dx,dy)-100;
    }));return {id,clear};}).sort((a,b)=>a.clear-b.clear).slice(0,5);
  const gate=h.basket.removal.gate, w=home.model.maintenanceRainReference.eastMaintenance.weatherEnclosure.entry;
  const dx=(x,y)=>(floor(x+.001,y)-floor(x-.001,y))/.002, dy=(x,y)=>(floor(x,y+.001)-floor(x,y-.001))/.002;
  let slopeX=0,slopeY=0,downNorth=Infinity;
  for(let x=4750.5;x<6600;x+=2)for(let y=5750.5;y<7400;y+=2){
    slopeX=Math.max(slopeX,Math.abs(dx(x,y)));slopeY=Math.max(slopeY,Math.abs(dy(x,y)));downNorth=Math.min(downNorth,-dy(x,y));
  }
  // 100 = 8 full pitches plus 4; nine millimetre holes leave at least 24 mm
  // of metal across any 100 mm stripe. The two accounted bearing strips are real.
  const gauge=24,net=24,span=6825-6550+10,wheel=5000;
  const plate={wetGauge:gauge,supportCentreY:[6550,6825,7090,7360],webPer100:net,
    pairedMaxSpan:span,bendMPa:1.5*wheel*span/(net*gauge**2),
    deflectionMm:wheel*span**3/(4*200000*net*gauge**3),
    firstGrossWeightKg:350*(6825-6550)*gauge*8000/1e9};
  return {plate,originalNWestLip:floor(5000,7300),rampAt6800:floor(6800,6300),gate:gate.map(y=>({y,approach:floor(w.innerPlaneX,y),adapter:r.courtIntakeAccess.topLandingZ-floor(w.innerPlaneX,y)})),
    maxGradient:{x:slopeX,y:slopeY,minimumFallNorth:downNorth},corner:{N,E,rack,aisle:E[0]-N[0]-N[2],routes},northNearCaps:ties};
}

const dist=(a,b)=>Math.hypot(b[0]-a[0],b[1]-a[1]);
function pointSegment(p,a,b){
  const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)));
  return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);
}
export function services(h,home,grid,temp){
  const walk=home.renewal.courtIntakeOperatorPlatform;
  const north=[[5900,7140],[5900,7530],[7000,7530],[7000,12800],[5300,12800],[5300,14100]];
  let length=0;const heights=north.map((p,i)=>{if(i)length+=dist(p,north[i-1]);return [...p,-1025-.015*length];});
  const ties=['low-tie-8050','low-tie-11667'].map(id=>{
    const member=grid.crossBeams[id],y=member.a[1]-member.width/2,invert=heights[2][2]-.015*(y-7530);
    return {id,southFace:y,invert,pairedBelowSoffit:-750-(invert+175)-10};
  });
  const E=[[5900,6900],[5900,7540],[7450,7540],[7450,6975],[7580,6975]];
  // The final 130 mm turn is a shallow rectangular plenum. It is not a third R150 fitting.
  const eastLength=E.slice(1).reduce((s,p,i)=>s+dist(p,E[i]),0)+2*(75*Math.PI-300);
  const sourceOD=temp.pipe.maximumOutside;
  const tempPipe=[[7675,7000],[6880,7000],[6520,6640],[5950,6640]],pipeLength=tempPipe.slice(1).reduce((s,p,i)=>s+dist(p,tempPipe[i]),0);
  const upperX=5950-(1550-pipeLength/30+160)/30,crew=[[4600,6950],[5650,6950],[5650,8100]];
  const clearance=Math.min(...crew.slice(1).map((p,i)=>pointSegment([upperX,6640],p,crew[i])))-sourceOD/2-10;
  const footprint=[5700,6550,350,810],newPost=[6130,7275],oldCatch=h.frame.apronLatch.catch;
  const travel=h.basket.removal.gate, aperture=home.model.maintenanceRainReference.eastMaintenance.weatherEnclosure.entry;
  const tip=[7440,6800,140,350],park=[7360,6800,140,350];
  // Centreline at N/S pipe crossings; heights are falling in their respective flow directions.
  // The original north liner profile is known. The RC slab/pedestal are new purchased vertical envelopes.
  const liner=-213.75+.01*(7750-7540)+.01*(5900-5025);
  const toRoundCrown=-635-.01*(640+1550+75*Math.PI-300)+100;
  return {receiver:footprint,approach:[5500,6625,200,725],gateOpening:travel,westGate:h.access.westGatePark,
    southRamp:h.frame.ramp.layout,Ework:{platform:walk,floorZ:home.renewal.courtIntakeOperatorPlatformZ,
      centres:[[walk[0]+300,walk[1]+300],[walk[0]+300,walk[1]+walk[3]-300]],
      legAfterSetout:7450-100-walk[0]-walk[2]-10,boxAfterSetout:7360-walk[0]-walk[2]-10,
      box:[7360,6745,190,450],toe:tip,parkedToe:park,
      parkedSeparation:7550-park[0]-park[2]-10,operatingDog:[7360,6975,-460],
      controlsReach:Math.hypot(7360-7025,(-460)-(-800+650)),landing:aperture.walkingZ,
      upperPack:[190,450,185],cart:[585,550],stage:[4730,5135,750,750]},
    Nwork:{crew,tempPipe,bore:temp.pipe.minimumBore,maxPipeOD:sourceOD,takeoff:[7675,7000,1850],lowerAxis:1550,
      terminal:[5950,6640,-160],dedicatedCover:[5870,6560,160,160],runningSlope:1/30,length:pipeLength,
      upperOffsetX:upperX,remainingAroundR300:clearance-300,first90Allowance:1850-1550-temp.offset.twoActual90PortLegs/2,
      plan45Straight:Math.hypot(360,360)-2*temp.offset.two45.a,longLineX:temp.longPipe.axisX,
      longCrewRestrictionX:6650,longChaseRetained:temp.longPipe.minimumStraightGapBelowPrimary},
    guard:{newPost,catch:oldCatch,lever:dist(newPost,oldCatch),oldLever:h.frame.apronLatch.planLever,rib:[[4250,6200],[6170,6200],[6170,7275]],
      length:2995,sectionReservation:[150,150],axisZ:-465,underTopTreadGap:(-260)-(-465+75),gapToWestSkirt:newPost[0]-25-6080,
      clearForebaySide:6170-75-6050,clearStairY:newPost[1]-25-7200},
    buried:{north:heights,fall:.015,length,developedBudget:12000,remaining:12000-length,ties,
      newWestOfSkirt:6075-6050,returnY:7380,northEnds:[7360,7380,7400],
      east:E,radius:150,bends:2,developedEast:eastLength,northLinerAt5900_7540:liner,
      referenceAt5900:'At X5900 the conservative local liner envelope is −203. Use an independently spanned −515 underside through the actual E crossing.',
      boughtDeckUnderside:-515,upperBoundOnPipeCrown:-635+100,
      pairedRoofClearance:-515-(-635+100)-10,roundCrownNearTurn:toRoundCrown,
      trench:'Two independently supported fixed pipes with exterior access and cleanouts. Avoid piling, preserve the intervening N drain seat, enclose and test every reinstated wet crossing.'}};
}
