import assert from 'node:assert/strict';
import {exactSegmentBoxDistance} from './incoming-water-geometry.mjs';
import {segmentBodyDistance,segmentDistance} from './service-interface-geometry.mjs';

const least=rows=>rows.reduce((a,b)=>a.gap<=b.gap?a:b);
const shiftX=(point,x)=>[point[0]+x,...point.slice(1)];
const segmentGap=([,a,b,r],[,c,d,s])=>segmentDistance(a,b,c,d)-r-s;
const boxGap=([,a,b,r],box)=>exactSegmentBoxDistance(a,b,box)-r;
const planGap=([x,y],[a,b,w,d])=>Math.hypot(Math.max(a-x,x-a-w,0),Math.max(b-y,y-b-d,0));

function sideReactions(stability,railsY,pickupsX,frameZ,shift){
  const {massKG,centreOfMass:[cx,cy,cz],restrainedCarrierTrial:{verticalChallengeN,lateralChallengeN}}=stability;
  const [x0,x1]=pickupsX,[y0,y1]=railsY;
  const momentArm=frameZ-cz-shift[2];
  return [0,massKG*9.81,verticalChallengeN].flatMap(verticalN=>[-1,1].flatMap(sx=>[-1,1].map(sy=>{
    const rollNMM=verticalN*(cy+shift[1]-(y0+y1)/2)+sy*lateralChallengeN*momentArm;
    const pitchNMM=verticalN*(cx-(x0+x1)/2)+sx*lateralChallengeN*momentArm;
    const forcesN=[-1,1].flatMap(x=>[-1,1].map(y=>verticalN/4+x*pitchNMM/(2*(x1-x0))+y*rollNMM/(2*(y1-y0))));
    assert(Math.abs(forcesN.reduce((sum,v)=>sum+v,0)-verticalN)<1e-8);
    assert(Math.abs((forcesN[2]+forcesN[3]-forcesN[0]-forcesN[1])*(x1-x0)/2-pitchNMM)<1e-8);
    assert(Math.abs((forcesN[1]+forcesN[3]-forcesN[0]-forcesN[2])*(y1-y0)/2-rollNMM)<1e-8);
    return {verticalN,horizontalN:[sx*lateralChallengeN,sy*lateralChallengeN],rollNMM,pitchNMM,forcesN};
  })));
}

export function compareStandSideHandoff({standTravel,movingBoxes,movingSegments,staticBoxes,staticCylinders,carriedBox,carriedSegment,stability,dock,floorDoors,receivingGirder}){
  const [,approach,exit]=standTravel;
  assert.deepEqual(approach.slice(1),exit.slice(1));
  const endShift=exit[0],inboardShift=1420;
  const xInterval=[11400,12900],railYs=[4185,4960],supportXs=[11505,12620];
  const frameZ=2010,railRadius=30,legRadius=28,keeperRadius=42,keeperHalfLength=45;
  const pickupsX=[10050,10240];
  const localFrameZ=frameZ-approach[2],localSideY=railYs.map(y=>y-approach[1]);
  const crossPins=pickupsX.map((x,i)=>['carried cross pin '+i,[x,localSideY[0]+100,localFrameZ],[x,localSideY[1]-100,localFrameZ],20]);
  const trunnionMounts=pickupsX.flatMap((x,i)=>localSideY.flatMap((y,j)=>{
    const direction=j===0?1:-1;
    const base=[x,y+100*direction,localFrameZ];
    const elbow=[x,y+64*direction,localFrameZ+58];
    const cap=[x,y,localFrameZ+58];
    return [
      ['trunnion upstand '+i+'/'+j,base,elbow,8],
      ['trunnion top ear '+i+'/'+j,elbow,cap,8],
    ];
  }));
  const pitchTies=[3920,3965].map((y,i)=>['carried pitch tie '+i,[pickupsX[0],y,localFrameZ],[pickupsX[1],y,localFrameZ],14]);
  const pickupPins=[1870,1930].map((z,i)=>['north-face post pin '+i,[10170,3868,z],[10170,3920,z],8]);
  const attachment=['carried post link',[10170,3910,1870],[10170,3920,1950],12];
  const keeperSegments=pickupsX.flatMap((x,i)=>localSideY.map((y,j)=>['moving keeper '+i+'/'+j,
    [x-keeperHalfLength,y,localFrameZ],[x+keeperHalfLength,y,localFrameZ],keeperRadius]));
  const keeperCrowns=pickupsX.flatMap((x,i)=>localSideY.map((y,j)=>['keeper crown '+i+'/'+j,
    [x,y,localFrameZ+36],[x,y,localFrameZ+58],7]));
  const frame=[...keeperCrowns,...crossPins,...trunnionMounts,...pitchTies,...pickupPins,attachment,...keeperSegments];
  const rails=railYs.map((y,i)=>['fixed side rail '+i,[xInterval[0],y,frameZ],[xInterval[1],y,frameZ],railRadius]);
  const portalHeadZ=2310,kneeRiseMM=240,kneeRunMM=170;
  const offsetLegY=railYs.map((y,i)=>y+(i===0?-96:96));
  const railHangers=supportXs.flatMap(x=>railYs.map((y,i)=>['trial offset rail hanger ' +x+'/'+i,[x,offsetLegY[i],frameZ+21],[x,y,frameZ+21],10]));
  const legs=supportXs.flatMap(x=>offsetLegY.map((y,i)=>['dry support '+x+'/'+i,[x,y,legRadius],[x,y,portalHeadZ],legRadius]));
  const longitudinalBraces=railYs.map((y,i)=>['trial longitudinal brace '+i,
    [supportXs[0],y,frameZ-railRadius-120],[supportXs[1],y,legRadius],15]);
  const crossHeads=supportXs.map(x=>['overhead transverse tie '+x,[x,offsetLegY[0],portalHeadZ],[x,offsetLegY[1],portalHeadZ],15]);
  const kneeBraces=supportXs.flatMap(x=>offsetLegY.map((y,i)=>['overhead knee '+x+'/'+i,
    [x,y,portalHeadZ-kneeRiseMM],[x,y+(i===0?kneeRunMM:-kneeRunMM),portalHeadZ],12]));
  const braceStandoffs=supportXs.flatMap((x,i)=>railYs.map((y,j)=>{
    const z=i===0?frameZ-railRadius-120:legRadius;
    return ['longitudinal brace standoff '+i+'/'+j,[x,y,z],[x,offsetLegY[j],z],15];
  }));
  const fixed=[...railHangers,...rails,...legs,...longitudinalBraces,...braceStandoffs,...crossHeads,...kneeBraces];
  const throughAisleBrace=['adverse transverse diagonal',
    [supportXs[1],railYs[0],frameZ-railRadius],[supportXs[1],railYs[1],legRadius],15];
  const native=(segment,penalty)=>[
    ...staticBoxes.map(({id,box})=>({part:segment[0],to:id,gap:boxGap(segment,box)-penalty})),
    ...Object.entries(staticCylinders).map(([id,{centre,z,r}])=>({part:segment[0],to:id,
      gap:segmentBodyDistance(segment[1],segment[2],centre,z,r)-segment[3]-penalty})),
  ];
  const shiftAt=x=>[x,...approach.slice(1)];
  const translated=(segment,x)=>carriedSegment(segment,shiftAt(x));
  const count=Math.ceil((endShift-inboardShift)/10);
  const step=(endShift-inboardShift)/count;
  const stations=Array.from({length:count+1},(_,i)=>inboardShift+step*i);
  const moving=(segment,x,penalty,omit=[])=>[
    ...movingBoxes.filter(({id})=>!omit.includes(id)).map(item=>({part:segment[0],to:item.id,
      gap:boxGap(segment,carriedBox(item,shiftAt(x)))-penalty})),
    ...movingSegments.map(item=>({part:segment[0],to:item[0],
      gap:segmentGap(segment,translated(item,x))-penalty})),
  ];
  const rigidFrameToRails=least(stations.flatMap(x=>[...crossPins,...trunnionMounts,...pitchTies,...pickupPins,attachment]
    .flatMap(item=>rails.map(rail=>({part:item[0],to:rail[0],gap:segmentGap(translated(item,x),rail)-step/2})))));
  const frameToNative=least(stations.flatMap(x=>frame.flatMap(item=>native(translated(item,x),step/2))));
  const preEntrySpan=inboardShift-approach[0];
  const preEntrySamples=Math.ceil(preEntrySpan/10);
  const preEntryStep=preEntrySpan/preEntrySamples;
  const preEntryClearance=least(Array.from({length:preEntrySamples+1},(_,i)=>approach[0]+i*preEntryStep)
    .flatMap(x=>frame.flatMap(item=>native(translated(item,x),preEntryStep/2))));

  const installAt=inboardShift,installTravelY=80,installSteps=16;
  const nearSideKeepers=keeperSegments.filter(([id])=>id.endsWith('/0'));
  const farSideKeepers=keeperSegments.filter(([id])=>id.endsWith('/1'));
  const sideInstallation=[nearSideKeepers,farSideKeepers].map((keepers,side)=>least(
    Array.from({length:installSteps+1},(_,i)=>installTravelY*(1-i/installSteps)*(side===0?-1:1)).flatMap(dy=>
      keepers.flatMap(item=>{
        const [id,a,b,r]=translated(item,installAt);
        const installing=[id,[a[0],a[1]+dy,a[2]],[b[0],b[1]+dy,b[2]],r];
        return [...native(installing,installTravelY/(2*installSteps)),...moving(installing,installAt,installTravelY/(2*installSteps))];
      }))));
  const verticalInstallation=[-1,1].map(sign=>least(
    Array.from({length:installSteps+1},(_,i)=>installTravelY*(1-i/installSteps)*sign).flatMap(dz=>
      keeperSegments.flatMap(item=>{
        const [id,a,b,r]=translated(item,installAt);
        const installing=[id,[a[0],a[1],a[2]+dz],[b[0],b[1],b[2]+dz],r];
        return [...native(installing,installTravelY/(2*installSteps)),...moving(installing,installAt,installTravelY/(2*installSteps))];
      }))));
  const frameToStand=least(frame.flatMap(item=>moving(translated(item,inboardShift),inboardShift,0,
    item[0].startsWith('north-face post pin')?['westPost']:[])));
  const keeperJaws=pickupsX.flatMap((x,i)=>localSideY.flatMap((y,j)=>{
    const side=j===0?1:-1;
    const corners=[[y-19*side,localFrameZ-50],[y+46*side,localFrameZ-50],
      [y+46*side,localFrameZ+54],[y,localFrameZ+59]];
    return [-12,12].flatMap(dx=>corners.slice(1).map((end,k)=>['slotted C jaw '+i+'/'+j+'/'+dx+'/'+k,
      [x+dx,...corners[k]],[x+dx,...end],7]));
  }));
  const jawToStand=least(keeperJaws.flatMap(item=>moving(translated(item,inboardShift),inboardShift,0)));
  const jawToFixed=least(stations.flatMap(x=>keeperJaws.flatMap(item=>
    [...native(translated(item,x),step/2),...[...legs,...longitudinalBraces,...braceStandoffs,...crossHeads,...kneeBraces].map(other=>({
      part:item[0],to:other[0],gap:segmentGap(translated(item,x),other)-step/2}))])));
  const jawToHangers=least(stations.flatMap(x=>keeperJaws.flatMap(item=>
    railHangers.map(hanger=>({part:item[0],to:hanger[0],gap:segmentGap(translated(item,x),hanger)-step/2})))));
  const jawToRail=least(stations.flatMap(x=>keeperJaws.flatMap(item=>
    rails.map(rail=>({part:item[0],to:rail[0],gap:segmentGap(translated(item,x),rail)-step/2})))));
  const keeperToHangers=least(stations.flatMap(x=>[...keeperSegments,...keeperCrowns].flatMap(item=>
    railHangers.map(hanger=>({part:item[0],to:hanger[0],gap:segmentGap(translated(item,x),hanger)-step/2})))));
  const fixedToNative=least(fixed.flatMap(item=>native(item,0)));
  const fixedToStand=least(stations.flatMap(x=>fixed.flatMap(item=>moving(item,x,step/2))));
  const overheadToStand=least(stations.flatMap(x=>[...crossHeads,...kneeBraces].flatMap(item=>moving(item,x,step/2))));
  const overheadToNative=least([...crossHeads,...kneeBraces].flatMap(item=>native(item,0)));
  const [[scaffoldX0,scaffoldX1],[scaffoldY0,scaffoldY1]]=dock.dock.scaffoldBoardPlan;
  const [girderMinX,girderMaxX]=[-1,1].map(sign=>receivingGirder.datum+sign*receivingGirder.width/2);
  const [girderMinY,girderMaxY]=receivingGirder.extent;
  const feet=legs.map(([id,[x,y]])=>({id,xy:[x,y],
    girderEdgeInsetMM:Math.min(x-girderMinX,girderMaxX-x,y-girderMinY,girderMaxY-y)-legRadius,
    gapToCoverMM:planGap([x,y],floorDoors.eastOccupation.recessedCover)-legRadius,
    gapToScaffoldMM:planGap([x,y],[scaffoldX0,scaffoldY0,scaffoldX1-scaffoldX0,scaffoldY1-scaffoldY0])-legRadius,
    gapToCollectorMM:Math.max(dock.section.collectorX[0]-x,x-dock.section.collectorX[1],0)-legRadius}));
  const workerLocalX=10630,workerY=4570,workerRadius=300,workerHeight=2000;
  const workerBody=[0,workerHeight];
  const grip=translated(movingSegments.find(([id])=>id==='captured operator handle'),0)[2];
  const workerShoulder=[workerLocalX,workerY,1380];
  const workerReachMM=Math.hypot(...workerShoulder.map((v,i)=>v-grip[i]));
  const workerChecks=stations.map(x=>{
    const body=shiftX([workerLocalX,workerY,0],x);
    const toBox=({id,box},penalty)=>{
      const xy=planGap(body,[box[0],box[1],box[3],box[4]])-workerRadius;
      const vertical=Math.max(box[2]-workerHeight,-box[2]-box[5],0);
      return {part:'crew body',to:id,gap:(vertical?Math.hypot(Math.max(0,xy),vertical):xy)-penalty};
    };
    const cylinderGap=(base,centre,r,z)=>{
      const xy=Math.hypot(base[0]-centre[0],base[1]-centre[1])-r-workerRadius;
      const vertical=Math.max(z[0]-workerHeight,-z[1],0);
      return vertical?Math.hypot(Math.max(0,xy),vertical):xy;
    };
    const toSegments=(segments,penalty)=>segments.map(([id,a,b,r])=>({part:'crew body',to:id,
      gap:segmentBodyDistance(a,b,body,workerBody,workerRadius)-r-penalty}));
    const arm=['crew arm',shiftX(workerShoulder,x),shiftX(grip,x),40];
    const hand=['crew hand',shiftX(grip,x),shiftX(grip,x),50];
    const allMoving=[...frame,...movingSegments.filter(([id])=>id!=='captured operator handle')].map(item=>translated(item,x));
    const openAisle=least([
      ...staticBoxes.map(item=>toBox(item,step/2)),
      ...Object.entries(staticCylinders).map(([id,{centre,r,z}])=>({part:'crew body',to:id,
        gap:cylinderGap(body,centre,r,z)-step/2})),
      ...movingBoxes.map(item=>toBox({id:item.id,box:carriedBox(item,shiftAt(x))},0)),
      ...toSegments(fixed,step/2),...toSegments(allMoving,0),
      ...[arm,hand].flatMap(item=>[...native(item,step/2),
        ...movingBoxes.map(p=>({part:item[0],to:p.id,gap:boxGap(item,carriedBox(p,shiftAt(x)))})),
        ...[...fixed,...allMoving].map(other=>({part:item[0],to:other[0],gap:segmentGap(item,other)-step/2}))]),
    ]);
    return {openAisle,closedAisle:toSegments([throughAisleBrace],step/2)[0]};
  });
  const workerClearance=least(workerChecks.map(({openAisle})=>openAisle));
  const transverseBraceWorkerClearance=least(workerChecks.map(({closedAisle})=>closedAisle));
  const transverseBraceStandClearance=least(stations.flatMap(x=>moving(throughAisleBrace,x,step/2)));
  const reactions=sideReactions(stability,railYs,pickupsX,frameZ,approach);
  const keeperForces=reactions.flatMap(({forcesN})=>forcesN);
  const maximumUpliftN=-Math.min(...keeperForces);
  const splitGateOpeningDegrees=80;
  const splitGateRadiusMM=Math.hypot(64,37);
  const splitKeeperTrials=keeperSegments.map(([id,[localX,localY]])=>{
    const x=localX+keeperHalfLength+inboardShift+34;
    const y=localY+approach[1],z=frameZ;
    const side=y===railYs[0]?1:-1;
    const hinge=[x,y+side*46,z-20];
    const samples=32;
    const arc=splitGateOpeningDegrees*Math.PI/180;
    const samplePenalty=splitGateRadiusMM*arc/(2*samples);
    const body=Array.from({length:samples+1},(_,i)=>{
      const angle=arc*i/samples;
      const horizontal=-64*Math.cos(angle)+37*Math.sin(angle);
      const vertical=-64*Math.sin(angle)-37*Math.cos(angle);
      return ['trial hinge gate',hinge,[x,hinge[1]+side*horizontal,hinge[2]+vertical],6];
    });
    const targetRail=rails[y===railYs[0]?0:1];
    const otherSupports=fixed.filter(item=>item!==targetRail);
    const closedGate=body[0];
    const gateCentreY=(closedGate[1][1]+closedGate[2][1])/2;
    const gateStop=['trial keeper gate stop', [x,gateCentreY,z-48],[x,gateCentreY,z-55],6];
    const hingeLink=['trial hinge link',[x,y+side*46,z-20],[x-22,y+side*46,z-20],6];
    const lockLink=['trial latch return',[x,gateCentreY,z-55],[x-22,gateCentreY,z-55],6];
    const atOutboard=part=>[part[0],shiftX(part[1],endShift-inboardShift),shiftX(part[2],endShift-inboardShift),part[3]];
    const outboardFixedSweep=least(body.map(atOutboard).flatMap(item=>[...native(item,samplePenalty),...moving(item,endShift,samplePenalty),
      ...otherSupports.map(other=>({part:item[0],to:other[0],gap:segmentGap(item,other)-samplePenalty}))]));
    const carriageSweep=least(stations.flatMap(shift=>[closedGate,gateStop,hingeLink,lockLink].map(part=>[part[0],shiftX(part[1],shift-inboardShift),shiftX(part[2],shift-inboardShift),part[3]])
      .flatMap(item=>[...native(item,step/2),...moving(item,shift,0),
        ...otherSupports.map(other=>({part:item[0],to:other[0],gap:segmentGap(item,other)-step/2}))])));

    const rodStrokeMM=40;
    const handleOffsetMM=id.startsWith('moving keeper 0')?500:310;
    const linkageAt=(shift,stroke=0)=>{
      const axisX=x+shift-inboardShift;
      const points=[[axisX,y+side*46,z-20],[axisX,y+side*130,z-80],[axisX,y+side*130,1490],
        [axisX+handleOffsetMM+stroke,y+side*130,1490]];
      return points.slice(1).map((end,i)=>['remote keeper actuation rod '+i,points[i],end,8]);
    };
    const xHands=[inboardShift,endShift].map(shift=>{
      const linkage=linkageAt(shift);
      const target=linkage.at(-1)[2];
      const nominalBody=[target[0]+90,4570,0];
      const shoulder=[nominalBody[0],nominalBody[1],1380];
      const strokeSamples=8;
      const rodPositions=Array.from({length:strokeSamples+1},(_,i)=>shiftX(target,rodStrokeMM*i/strokeSamples));
      const armAndHand=rodPositions.flatMap(grip=>[['keeper operator arm',shoulder,grip,40],['keeper operator hand',grip,grip,50]]);
      const reaches=Math.max(...rodPositions.map(grip=>Math.hypot(...shoulder.map((v,i)=>v-grip[i]))));
      const crewBodyR=300;
      const bodyToStand=least(movingBoxes.map(item=>{
        const box=carriedBox(item,shiftAt(shift));
        const gap=planGap(nominalBody,[box[0],box[1],box[3],box[4]])-crewBodyR;
        const vertical=Math.max(box[2]-2000,-box[2]-box[5],0);
        return {part:'operator body',to:item.id,gap:vertical?Math.hypot(Math.max(0,gap),vertical):gap};
      }).concat(movingSegments.filter(([id])=>id!=='captured operator handle').map(item=>{
        const [to,a,b,r]=translated(item,shift);
        return {part:'operator body',to,gap:segmentBodyDistance(a,b,nominalBody,[0,2000],crewBodyR)-r};
      })));
      const bodyToFabric=least([
        ...staticBoxes.map(({id,box})=>{
          const gap=planGap(nominalBody,[box[0],box[1],box[3],box[4]])-crewBodyR;
          const vertical=Math.max(box[2]-2000,-box[2]-box[5],0);
          return {part:'operator body',to:id,gap:vertical?Math.hypot(Math.max(0,gap),vertical):gap};
        }),
        ...fixed.map(([to,a,b,r])=>({part:'operator body',to,gap:segmentBodyDistance(a,b,nominalBody,[0,2000],crewBodyR)-r})),
      ]);
      const gripHalfStep=rodStrokeMM/(2*strokeSamples);
      const gaps=armAndHand.flatMap(item=>[...native(item,gripHalfStep),...moving(item,shift,gripHalfStep),
        ...fixed.map(other=>({part:item[0],to:other[0],gap:segmentGap(item,other)-gripHalfStep}))]);
      return {reaches,rodStrokeMM,bodyToStand,bodyToFabric,gap:least(gaps),linkage:least(linkage.flatMap(item=>[...native(item,0),...moving(item,shift,0),...fixed.map(other=>({part:item[0],to:other[0],gap:segmentGap(item,other)}))]))};
    });
    const parkedClearance=least(xHands.flatMap(({bodyToStand,bodyToFabric,gap})=>[bodyToStand,bodyToFabric,gap]));
    const actuatorSweep=least(stations.flatMap(shift=>linkageAt(shift,rodStrokeMM).flatMap(item=>[
      ...native(item,step/2),...moving(item,shift,0),...otherSupports.map(other=>({
        part:item[0],to:other[0],gap:segmentGap(item,other)-step/2})),
    ])));
    const latchPinDiameterMM=8,lugThicknessMM=5;
    const leverToRailMM=Math.abs(hinge[1]-y);
    const leverToLatchMM=Math.abs(hinge[1]-closedGate[2][1]);
    const latchShearN=maximumUpliftN*leverToRailMM/leverToLatchMM;
    const latchDoubleShearMPa=latchShearN/(Math.PI*latchPinDiameterMM**2/2);
    const latchLugBearingMPa=latchShearN/(latchPinDiameterMM*lugThicknessMM);
    const gateLinksClearance=least([hingeLink,lockLink].map(part=>({part:part[0],to:targetRail[0],gap:segmentGap(part,targetRail)})));
    return {id,hinge,latchPinDiameterMM,latchShearN,latchDoubleShearMPa,latchLugBearingMPa,xHands,parkedClearance,actuatorSweep,gateLinksClearance,closedGateToJaw:least(keeperJaws.map(item=>({part:closedGate[0],to:item[0],gap:segmentGap(closedGate,translated(item,inboardShift))}))),outboardFixedSweep,carriageSweep,sweep:least(body.flatMap(item=>[...native(item,samplePenalty),...moving(item,inboardShift,samplePenalty),
      ...otherSupports.map(other=>({part:item[0],to:other[0],gap:segmentGap(item,other)-samplePenalty}))])),
      railSweep:least(body.map((part,i)=>({i,part:part[0],to:targetRail[0],gap:segmentGap(part,targetRail)-samplePenalty})))};
  });
  const overlapAt=x=>pickupsX.map(pickup=>Math.max(0,
    Math.min(pickup+x+keeperHalfLength,xInterval[1])-Math.max(pickup+x-keeperHalfLength,xInterval[0])));
  const installedStandLeadingX=Math.max(...movingBoxes.map(({box})=>box[0]+box[3]))+inboardShift;
  const installedStandTrailingX=Math.min(...movingBoxes.map(({box})=>box[0]))+endShift;
  const handovers={inboard:{xShift:inboardShift,keeperRailOverlapMM:overlapAt(inboardShift),
    standToPlateMM:dock.section.bearingX[0][0]-installedStandLeadingX},
  outboard:{xShift:endShift,keeperRailOverlapMM:overlapAt(endShift),
    standBeyondCollectorMM:installedStandTrailingX-dock.section.collectorX[1]}};
  const legSpan=supportXs[1]-supportXs[0];
  const supportForces=[inboardShift,endShift].flatMap(x=>reactions.flatMap(({forcesN})=>railYs.flatMap((_,i)=>{
    const outboard=pickupsX.reduce((sum,pickup,j)=>sum+forcesN[2*j+i]*(pickup+x-supportXs[0])/legSpan,0);
    return [forcesN[i]+forcesN[2+i]-outboard,outboard];
  })));
  const maxKeeperN=Math.max(...keeperForces),minKeeperN=Math.min(...keeperForces);
  const trialTube={outerDiameterMM:railRadius*2,legOuterDiameterMM:legRadius*2,wallMM:5,steelE_MPa:200000};
  const tubeI=Math.PI*(trialTube.outerDiameterMM**4-(trialTube.outerDiameterMM-2*trialTube.wallMM)**4)/64;
  const singleWheelMidspanDeflectionMM=maxKeeperN*legSpan**3/(48*trialTube.steelE_MPa*tubeI);
  const remainingGateRailClearanceMM=Math.min(...splitKeeperTrials.map(row=>row.railSweep.gap))-singleWheelMidspanDeflectionMM;
  const singleWheelMidspanStressMPa=maxKeeperN*legSpan*railRadius/(4*tubeI);
  const legI=Math.PI*(trialTube.legOuterDiameterMM**4-(trialTube.legOuterDiameterMM-2*trialTube.wallMM)**4)/64;
  const lateralChallengeN=stability.restrainedCarrierTrial.lateralChallengeN;
  const unsupportedLegHeightMM=frameZ-railRadius;
  const diagonalLengthMM=Math.hypot(legSpan,unsupportedLegHeightMM-120-legRadius);
  const nominalBraceAxialN=lateralChallengeN*diagonalLengthMM/legSpan;
  const oneKneeAxialN=lateralChallengeN*Math.hypot(kneeRunMM,kneeRiseMM)/kneeRunMM;
  const inboardTransferRiseMM=-receivingGirder.z[1];
  const transverseBaseCoupleN=lateralChallengeN*(frameZ+inboardTransferRiseMM)/(offsetLegY[1]-offsetLegY[0]);
  const dockSurfaceZ=-(supportXs[1]-dock.dock.fallStartsX)/80;
  const dockBaseCoupleN=lateralChallengeN*(frameZ-dockSurfaceZ)/(offsetLegY[1]-offsetLegY[0]);
  const fullAxisCantileverDeflectionMM=lateralChallengeN*unsupportedLegHeightMM**3/(3*trialTube.steelE_MPa*legI);
  const singleLegAxisChallengeMomentNm=lateralChallengeN*unsupportedLegHeightMM/1000;
  return {xInterval,railYs,supportXs,offsetLegY,frameZ,pickupsX,handovers,jawToStand,jawToFixed,jawToHangers,jawToRail,keeperToHangers,rigidFrameToRails,frameToNative,preEntryClearance,sideInstallation,verticalInstallation,frameToStand,fixedToNative,fixedToStand,
    feet,overheadToStand,overheadToNative,workerClearance,workerReachMM,splitKeeperTrials,transverseBraceWorkerClearance,transverseBraceStandClearance,reactions,maxKeeperN,minKeeperN,maxSupportN:Math.max(...supportForces),minSupportN:Math.min(...supportForces),
    trialTube,remainingGateRailClearanceMM,singleWheelMidspanDeflectionMM,singleWheelMidspanStressMPa,fullAxisCantileverDeflectionMM,singleLegAxisChallengeMomentNm,
    nominalBraceAxialN,oneKneeAxialN,transverseBaseCoupleN,dockBaseCoupleN,inboardDryTopOverGirderMM:inboardTransferRiseMM,limit:'Geometric comparison after frame installation. Positive mounting at the stand and dry substrates, actual keeper contact, rail continuity, bracing, anchor stress and interlocked occupied sequence require separate proof.'};
}
