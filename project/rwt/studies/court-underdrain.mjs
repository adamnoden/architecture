// mm, L/s, kPa. Each case puts the entire event on one mechanism unless stated.
import assert from 'node:assert/strict';
import {capacity} from './short-inlet-review.mjs';

const g=9.81;
function solve(fn,lo,hi){
  assert(fn(lo)<=0 && fn(hi)>=0,'water level is outside the declared bracket');
  for(let i=0;i<45;i++){const m=(lo+hi)/2;if(fn(m)<0)lo=m;else hi=m;}
  return (lo+hi)/2;
}
const velocityHead=v=>1000*v*v/(2*g);

export function feeder(h,old){
  const [x,y,L,width]=h.inlet.continuousApron, north=7400, datum=-96, slope=.03;
  const floorAt=yy=>(datum+(north-yy)*slope)/1000, south=-30, breakZ=floorAt(y)*1000;
  const q=(span,stage)=>capacity([span],stage,0,'deepestTotalQuarter',L,128,{slope,floorAt});
  const duty=h.incoming.duty, span=h.inlet.asBuilt[0], stage=h.limits.quiet-5;
  const local=h.frame.chambers.eastThroat.y;
  const cover=old.underApron, newRoofClear=floorAt(cover.nozzle[2])*1000-cover.upper-cover.gauge-10;
  const resolveGrade=(xx,yy)=>{const w=Math.max(0,Math.min(1,(xx-5250)/(5925-5250),(6600-xx)/(6600-6125)));
    const old=-30-.04*(yy-5750), aligned=yy<y?south-(yy-5750)*(south-breakZ)/(y-5750):floorAt(yy)*1000;
    return old+w*(aligned-old);};
  const gate=h.basket.removal.gate;
  return {blendX:[5250,5925,6125,6600],northWestLip:resolveGrade(5000,7300),
    maximumEWSlopes:[7.75/675,7.75/475],gateAdapterAtEnds:gate.map(yy=>-80-resolveGrade(6075,yy)),
    unchangedSouthRamp:resolveGrade(6800,6300),apron:[x,y,L,width],actualSpan:span,floor:[[5750,south],[y,breakZ],[north,datum]],
    slopes:[(south-breakZ)/(y-5750),slope],northLipMismatch:floorAt(7300)*1000-(-92),
    stairLandingZ:-80,adjacentAtStair:breakZ+(y-6600)*(south-breakZ)/(y-5750),
    duty,stage,capacity:q(span,stage),withTwoMore:q(span,stage-2),stageReserve:stage-solve(z=>q(span,z)-duty,-52,-35),
    concentratedAfterSetout:q([local[0]+5,local[1]-5],stage),coveredFeed:cover.nozzle,oldRoofClearOnNewFloor:newRoofClear,
    fittedFeed:{invert:cover.nozzle[3]-8,roofUnderside:cover.upper-8,topPlate:9,trialPoint:5000,span:190,effectiveWidth:100,
      bendingMPa:1.5*5000*190/(100*9**2),deflection:5000*190**3/(4*200000*100*9**3),
      pairedSurfaceReserve:newRoofClear+8-(9-cover.gauge),pairedUndersideToPan:cover.pairedUndersideToPan-8,
      freeboard:cover.channelCases.at(-1).freeboard,sourceToNoseReserve:cover.channelCases.at(-1).reserveFromOldSill+8},
    coveredFeedAssignedReserve:cover.channelCases.at(-1).reserveFromOldSill,
    isolation:'The E chamber needs its own connected low covered feeder. Isolate, drain and retract its nose before raising the west carrier.'};
}

export function lowRelief(h,buried){
  const inlet=h.inlet,b=h.basket,expected=inlet.spout.z+inlet.spout.grossSideRise;
  // Both gutters are integral WITHIN the 510 high-plan dimension of the east carrier.
  const galleries=[[6850,6960],[7250,7360]], slots=[[6750,7040,-224],[7040,7290,-244],[7290,7340,-255]];
  function bed(x,y){return inlet.northWestZ-inlet.grade*(x-inlet.wetEdgeX)-inlet.step*inlet.wetSeams.filter(v=>x>=v).length+
    .025*Math.max(inlet.spout.y[0]-y,0,y-inlet.spout.y[1]);}
  const aboveBeds=slots.map(([a,,crest])=>Math.min(...[galleries[0][1],galleries[1][0]].map(y=>crest-bed(a,y))));
  // Each piece loses 5 at both ends. The quarter of total clear width offering
  // the deepest head is blanked first, not a quarter arbitrarily spread everywhere.
  function weir(q,count){
    const widths=slots.map(([a,b])=>count*(b-a-10));let remove=widths.reduce((a,b)=>a+b)/4;
    for(let i=widths.length-1;i>=0;i--){const d=Math.min(remove,widths[i]);widths[i]-=d;remove-=d;}
    const stage=solve(z=>widths.reduce((sum,width,i)=>sum+width*Math.sqrt(g)*(Math.max(0,z-slots[i][2]-5)/2000)**1.5,0)-q,-270,-100);
    return {count,remaining:widths,stage,marginToLowSide:expected-5-stage};
  }
  // A finite submerged rectangle with free downstream jet. Cap at actual height;
  // when the receiver rises above its sill, rerun the two-reservoir case.
  function window(q,width,tail){
    const crest=-620+5,top=-455-5, effective=(width-10)*.75/1000,cd=.55;
    const split=Math.max(crest,Math.min(tail,top)), root=d=>Math.sqrt(Math.max(d,0)/1000);
    function Q(z){
      const submerged=(split-crest)/1000*root(z-tail);
      const free=2/3*(root(z-split)**3-root(z-top)**3);
      return 1000*cd*effective*Math.sqrt(2*g)*(submerged+free);
    }
    return {width,clear:1000*effective,stage:solve(z=>Q(z)-q,Math.max(crest,tail),-40),crest,top,cd,tail};

  }
  const absGrade=.02, grateBed=-395, channelWidth=(110-2*1.5)*.75, run=590;
  const nozzleArea=(200-10)*(95-10)*.75/1e6;
  const cases=[h.incoming.duty,h.incoming.longBackup].map((flow,i)=>{
    const branch=buried.tails[i], hoodBore=(150-10)*(120-10)*.75/1e6;
    const hoodLoss=3*velocityHead(flow/1000/hoodBore);
    const tail=branch.faultHead+hoodLoss;
    const reverseCell=window(flow,130,b.cases[i].impactPool); // equivalent 90 net: ((80-10)+(60-10))*.75
    const transferLoss=(4+.06*1.2/buried.hydraulicDiameter)*velocityHead(branch.v);
    const reverseGrade=Math.max(reverseCell.stage,-650)+hoodLoss+transferLoss;
    const depth=solve(d=>{const a=channelWidth*d/1e6,p=(channelWidth+2*d)/1000;
      return 1000/.025*a*(a/p)**(2/3)*Math.sqrt(absGrade)-flow;},.001,200);
    const localV=flow/1000/(channelWidth*depth/1e6),exitLoss=3*velocityHead(flow/1000/nozzleArea);
    return {flow,hoodLoss,hoodPool:tail,reverseCell,transferLoss,reverseGrade,reverseCupMargin:-425-reverseGrade,both:weir(flow,2),one:weir(flow,1),impactCell:window(flow,80,tail),quietCell:window(flow,60,tail),
      galleryDepth:depth,filmWithOneBend:grateBed+5+depth+velocityHead(localV),
      slotToHighestGallery:slots.at(-1)[2]-5-(grateBed+5+depth+velocityHead(localV)),
      bottomNozzleLoss:exitLoss,bottomExitReserve:depth-exitLoss-10};
  });
  return {formerFirstSide:expected,retainedSpout:inlet.spout,galleries,slots,aboveBeds,
    originalFifthWidth:inlet.northBodies.at(-1).plan[0],centralFloorWidth:galleries[1][0]-galleries[0][1],
    gallery:{run,width:110,bedAtBothEnds:grateBed,lowBedAtSlotEdges:[grateBed-absGrade*170,grateBed-absGrade*220],grade:absGrade,n:.025,netWidth:channelWidth,
      bottomSlots:[[6920,6860,200,95],[6920,7260,200,95]],dryCatchMouths:[[6900,6845,240,135],[6900,7245,240,135]],
      nozzleBottom:-445,receiverRim:-420,pairedEngagement:25-10,pairedRimToGallery: -399.4-1.5-(-420)-10,afterSetoutCapture:[10,5]},
    basket:{x:[7372.5,7452.5,7467.5,7527.5],originalNorthFace:b.basket[1]+b.basket[3],stationaryNorthFace:7200,
      deflectorAtLowerHeight:b.diverterFoot[0],crest:-620,windowTop:-455,outerPocket:[7350,7200,200,140],
      bottomCoupling:{axis:[7450,7270,-915],clear:[150,120],land:[25,10],
        sourceHoodBottom:-900,releaseLift:40,projectedPressureArea:.15*.12,
        extraProjectionWest:0,screen:'Pressure joint at well bottom; no open cup between the new pocket and the independent line. Use restrained top-release rods, a proved blind, line drain and test joint.'},
      maxOrdinaryImpact:b.cases.at(-1).impactPool,clearAboveNormalImpact:-620-5-b.cases.at(-1).impactPool},
    cases};
}

export function buriedReach(h,site,grid,crews){
  const xy=[[7000,6940],[7000,12800],[5300,12800],[5300,14100]],
    route=[];let length=0;
  for(let i=0;i<xy.length;i++){if(i)length+=Math.hypot(xy[i][0]-xy[i-1][0],xy[i][1]-xy[i-1][1]);
    route.push([...xy[i],-1025-.015*length]);}
  const n=site.north,bore=150, collared=200;
  const crosses=['low-tie-8050','low-tie-11667'].map(id=>{
    const beam=grid.crossBeams[id],south=beam.a[1]-beam.width/2;
    const crown=route[0][2]-.015*(south-route[0][1])+(bore+collared)/2;
    return {id,firstY:south,beamSoffit:beam.z[0],pipeCrown:crown,pairedClear:beam.z[0]-crown-10};
  });
  const capClearances=grid.heads.map(p=>{
    const [x,y]=p.xy,[a,b]=p.capXY;
    const d=Math.min(...xy.slice(1).map(([X,Y],i)=>{const [u,v]=xy[i];
      return Math.hypot(Math.max(Math.min(u,X)-x-a/2,x-a/2-Math.max(u,X),0),
        Math.max(Math.min(v,Y)-y-b/2,y-b/2-Math.max(v,Y),0));}));
    return {id:p.id,clear:d-collared/2};}).sort((a,b)=>a.clear-b.clear);
  // 12 m total developed budget includes drops/manifold/bends beyond the 8.5 m trunk.
  // Lowering the available cross-section and hydraulic diameter separately is adverse.
  const lengthBudget=12, area=Math.PI*(bore/2000)**2*.75, dia=.75*bore/1000;
  const wet=site.north.blockedOutletSpill.maximumFaultedReceiverWater;
  const tails=[h.incoming.duty,h.incoming.longBackup].map(flow=>{
    const v=flow/1000/area, loss=(14+.06*lengthBudget/dia)*velocityHead(v);
    return {flow,v,loss,normalHead:n.maximumWater+loss,faultHead:wet+loss,
      belowGalleryRim:-420-(wet+loss),belowBasketCrest:-620-(wet+loss)};
  });
  return {route,length,trunkID:bore,maxFittingOD:collared,lengthBudget,fall:.015,area,hydraulicDiameter:dia,
    crosses,nearestCap:capClearances[0],loggiaPileIDs:capClearances.slice(0,3),
    remainingFittingLength:1000*lengthBudget-length,
    branches:[{from:'south cup',axis:[[7020,6912.5,-960],[7000,6940,-1025]]},
      {from:'hood pocket',axis:[[7450,7270,-1030],[7160,7270,-1031],[7000,7400,-1031.9]]},
      {from:'north cup',axis:[[7020,7312.5,-965],[7000,7180,-1028.6]]}],receiver:[5050,13800,500,600],forebayFloor:-1350,
    forebayOpenEdge:-900,siteBasin:n.receiverBounds,basinBed:n.bedMaximum,normalTail:n.maximumWater,faultTail:wet,
    originalN:n.outlet,outerPipeBottom:route.at(-1)[2]-(collared-bore)/2,crew:crews.platformXYZ,
    tails,scope:'Separate buried leg to the existing N site basin. It has no independent destination when that basin or its continuation is lost.'};
}
