// Court coordinates and elevations are millimetres, flow is litres/second.
import {capacity} from '../../rwt/studies/short-inlet-review.mjs';
import {channelAtFlow} from '../../rwt/studies/selected-water-event.mjs';

const g=9.81;
const criticalHead=(flow,width)=>2000*Math.cbrt((flow/width)**2/g);
const rectGap=(r,within)=>[r[0]-within[0],r[1]-within[1],within[0]+within[2]-r[0]-r[2],within[1]+within[3]-r[1]-r[3]];

export function entrance(six, selected, required, stage) {
  const {collector:c,mouth}=six, source=selected.renewal.courtCollector.actualOpenEntries.catchCover;
  // Independent entrance (K=1), deepest quarter of the complete width obstructed.
  const oldSix=[...mouth.southIntervals,...mouth.northHungLatch];
  const intervals=[[6625,7398.5]], asBuilt=[[6630,7393.5]];
  const qOld=(span,length)=>capacity(span,stage,0,'deepestTotalQuarter',length);
  const cases=[100,150,200].map(length=>{
    const q=z=>capacity(intervals,z,0,'deepestTotalQuarter',length);
    let lo=-55,hi=-15;
    for(let i=0;i<30;i++){const m=(lo+hi)/2;if(q(m)<required)lo=m;else hi=m;}
    return {length,flow:q(stage),stageForDuty:(lo+hi)/2,flowOnUniform5HighLip:q(stage-5),pairedEdgeHighAndShort:capacity(asBuilt,stage-5,0,'deepestTotalQuarter',length),oldSix:qOld(oldSix,length),oldSix5High:capacity(oldSix,stage-5,0,'deepestTotalQuarter',length)};
  });
  const wetSeams=[6430,6735,7040,7290], start=c.westUnderlap.wetPanWallInnerX;
  const spoutEnd=7390, throat=[6935,7165], cutX=source.receivingHoodNotch.planeX;
  const north=(x,y)=>-189-.015*(x-start)-18*wetSeams.filter(s=>s<=x).length+
    .025*Math.max(throat[0]-y,0,y-throat[1]);
  const south=(x,y)=>-135-31*(y-c.southWestWetY[0])/(6830-c.southWestWetY[0])+.005*Math.abs(x-6241.5);
  const bridge=(x,y)=>-166-3*(y-6830)/40+.005*Math.abs(x-6241.5);
  const probes=[c.bridge.plan[0],6241.5,c.bridge.plan[0]+c.bridge.plan[2]];
  const treadMinimum=[[6125,6325,-260],[6325,6525,-440],[6525,6725,-620]].map(([a,b,z])=>
    Math.min(...[a,b].flatMap(x=>[north(x,7000),south(x,6830),bridge(x,6870)]))-1.5-z);
  const throatAt=cutX,spoutZ=north(spoutEnd,7000),notch=[6915,7185,-310,-110];
  const northWidth=550,westWidth=330,remainingWidths=[305,305,305,360],sheet=1.5;
  const moduleMass=(dx,dy,depth)=>{
    const area=dx*dy;
    return {plan:[dx,dy],waterKg:area*depth/1e6,
      fiveFaceSheetKg:(area+2*(dx+dy)*depth)*sheet*8960/1e9};
  };
  const depth=300;
  return {intervals,asBuilt,oldSix,continuousApron:[5925,6625,200,773.5],cases,oldWestFlow:capacity([[6950,7175],[7275,7375]],stage,0,'deepestTotalQuarter',100),
    sixWet:true,wetSeams,structuralSeams:[6430,6735,7040,7345],wetEdgeX:start,
    northWestZ:-189,grade:.015,step:18,underlap:25,
    fixedNorthernGable:{brinkEndY:7398.5,outerSheetY:7400,apronToeX:6135,terminalY:7370,terminalZ:-155},
    newWesternRelease:{captureThenEast:50,initialLeftX:6100,releasedLeftX:6150,fixedGableX:6135,nominalGap:15,pairedGap:5},sheet,pairedStepClear:18-sheet-2*5,
    northSouthBridgeGaps:probes.map(x=>bridge(x,6870)-sheet-north(x,6870)),
    treadMinimum,fifthWetOverhang:7345-7290,lastSaddleEnds:7290+50,
    saddleToHood:cutX-(7290+50),originalSaddlePastSpout:7345+50-source.spoutEndX,
    westUnderlapExit:six.renewal.westernPanFirstMotion,sourceClosedRiseToEast:c.controls.at(-1)[2]-c.closedOutletBinding.axis[2],
    spout:{endX:spoutEnd,y:throat,z:spoutZ,notch,openingPlaneX:cutX,atOpening:north(throatAt,7000),
      undersideToBottomAfterTwo5:north(throatAt,7000)-sheet-notch[2]-10,
      grossSideRise:100,quarterBlockedHead:criticalHead(required,.75*(throat[1]-throat[0])),
      sideReserve:100-10-criticalHead(required,.75*(throat[1]-throat[0])),
      hoodTopReserve:notch[3]-north(throatAt,7000)-10-criticalHead(required,.75*(throat[1]-throat[0])),
      nominalXIntoBasket:spoutEnd-7365,nominalNorthInBasket:7180-throat[1]},
    moduleDepthEnvelope:depth,northBodies:[westWidth,...remainingWidths].map(w=>moduleMass(w,northWidth,depth)),
    southWestBody:moduleMass(330,550,200),fifthLiftTop:1700,fifthLiftBottom:1700-depth,
    historical:HISTORIC};
}
const HISTORIC='Original N18 low point collects westward at X7181.71; do not attach the open spout to the old profile.';

export function hood(r,flow,longDuty) {
  const [invert,top]=r.shield.clearOutlet.z;
  const ceiling=top-20,crest=-752,lipWidth=520,slot=[6675,7135],slotHeight=40,occlusion=.25;
  const basket=[7365,6620,170,560], bottom=-875, topBasket=-110, width=slot[1]-slot[0];
  const subtractedArea=(1-occlusion)*width*slotHeight/1e6;
  const cases=[flow,longDuty].map(q=>{
    const depth=channelAtFlow(q,.6,.02,50/4250).depthMm,tail=invert+depth,raisedTail=tail+5;
    const v=q/1000/subtractedArea,velocityHead=1000*v*v/(2*g),systemK=4;
    const slotControl=Math.max(invert+slotHeight+5,raisedTail),requiredHead=systemK*velocityHead;
    const portV=q/1000/(6*.04**2),portLoss=8000*portV**2/(2*g),lipHead=criticalHead(q,lipWidth*.75);
    return {flow:q,depth,tail,raisedTail,slotControl,velocityHead,requiredHead,quietPool:slotControl+requiredHead,
      impactPool:slotControl+requiredHead+portLoss,portLoss,insideFreeboard:top-slotControl-requiredHead,
      reserveAgainst20:ceiling-slotControl-requiredHead,limitingK:(ceiling-slotControl)/velocityHead,
      halfObstructedReserve:ceiling-slotControl-requiredHead*(.75/.5)**2,
      allowedNominalTail:ceiling-requiredHead-5,
      lipHead,with25CrestRange:[tail+20,top+25-25-lipHead],freeLipMaxNominalTail:crest-20};
  });
  const yawCentre=[7040,6900],diag=Math.hypot(basket[2],basket[3]);
  const bounds=[yawCentre[0]-diag/2,yawCentre[1]-diag/2,diag,diag];
  const roofHeight=1970,beamX=7650,gate=[6597.5,7200];
  return {basket,bottom,topBasket,spoutNotchInBasketY:[6920,7180],diverterTop:[7532,-140],diverterFoot:[7460,-450],
    nozzle:[7450,7000,-80],fullPipeOD:128,fullNozzleWestEastClear:[7450-64-7365,7532-(7450+64)],
    shaftHalfSlack:[(200-basket[2])/2,(600-basket[3])/2],pairedShift:10,guideTiltDegrees:.25,
    minimumWidthAfterSkew:(200-basket[2])/2-10-(topBasket-bottom)*Math.tan(Math.PI*.25/180),
    shoe:{runX:[7525,7585],releasedX:[7550,7610],operatingJointX:7535,parkedGapToBasket:15,parkedGapToBeam:40,
      clearY:slot,outerWidth:510,operatingClearZ:[invert,invert+slotHeight],
      release:'Isolate, vent and drain. Capture above, loosen captive face dogs, move shoe east 25 to release basket before any basket lift. Remove shoe upward within pre-beam service bay before east body draw.'},
    inletPortCountAndSize:[8,40],slot,slotHeight,slotX:7550,invert,top,openAreaM2:subtractedArea,cases,
    maxDrainedSumpLitres:basket[2]*basket[3]*(invert-bottom)/1e6,fullWaterKg:basket[2]*basket[3]*(topBasket-bottom)/1e6,
    seamPressureKPa:(topBasket-invert)*.00981,rejectedLip:{crest,lipWidth,extraSideHeight:25,beamX},
    removal:{yawCentre,sweptBounds:bounds,yawMargin:rectGap(bounds,r.courtIntakeWell),gate,
      broadsideMargin:(gate[1]-gate[0]-basket[3])/2,travelWidthWithHandles:basket[2]+80,
      eachGateMargin:(gate[1]-gate[0]-basket[2]-80)/2,carryY:(gate[0]+gate[1])/2,
      liftedBottom:100,liftedTop:100+topBasket-bottom,roofHeight,overhead:roofHeight-(100+topBasket-bottom),
      stage:[4350,4500,1500,1500],selectedFirstRest:[4780,5490,650,360]}};
}
