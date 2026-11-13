import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {deriveCurrentHouse} from './current-house.mjs';
import {assertBridgeNativeHouse,nativeBoxGaps,receiverNative,segmentGaps,uprightBodyGaps} from './incoming-water-bridge-native.mjs';
import {exactSegmentBoxDistance,finiteBends} from './incoming-water-geometry.mjs';
import {lowerCapComparator} from './incoming-water-lower-cap.mjs';
import {segmentDistance} from './service-interface-geometry.mjs';

const add=(a,b)=>a.map((v,i)=>v+b[i]);
const subtract=(a,b)=>a.map((v,i)=>v-b[i]);
const scale=(a,k)=>a.map(v=>v*k);
const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0);
const cross=([a,b,c],[d,e,f])=>[b*f-c*e,c*d-a*f,a*e-b*d];
const plan=([x,y])=>[x,y,0];
const norm=a=>Math.hypot(...a);
function minimum(rows){
  assert(rows.length,'A clearance witness requires at least one candidate');
  return rows.reduce((a,b)=>{
    assert(Number.isFinite(b.gapMM),'A clearance witness requires finite geometry');
    return a.gapMM<=b.gapMM?a:b;
  },{gapMM:Infinity});
}
const guideLevels=[650,850];
const supportLevels=[405,130];
const braceRadius=Math.hypot(10,10);
const guideEnd=[55,400.0307];
const guideTangent=68;
const stroke=260;
const steelE=200000;
const braceArea=20**2-14**2;
const postI=(50*30**3-40*20**3)/12;
const loadCases=[[[100,0],[0,0]],[[0,100],[0,0]],[[0,0],[6000,0]],[[0,0],[0,6000]]];

const nearBraces=[
  {id:'upper normal',a:[42,92,405],b:[120,92,20]},
  {id:'upper tangent',a:[27,126,405],b:[42,28,20]},
  {id:'lower normal',a:[50,92,130],b:[89,92,20]},
  {id:'lower tangent',a:[27,124,130],b:[42,62,20]},
];

const floorGrid=JSON.parse(readFileSync(new URL('../../str/studies/current-house-grid.json',import.meta.url),'utf8'));
const occupiedFloor=JSON.parse(readFileSync(new URL('../../str/studies/current-house-occupied-interfaces.json',import.meta.url),'utf8')).groundFloor;
const threshold=JSON.parse(readFileSync(new URL('../../mat/studies/plant-threshold.json',import.meta.url),'utf8'));
const beam=floorGrid.crossBeams['plant-intermediate'];
assert.deepEqual(beam,{a:[9300,3700],b:[11667.5,3700],start:'spine',end:'outer-E',width:600,z:[-630,-180]});
assert.equal(occupiedFloor.preferredField.bar,12);
assert.equal(occupiedFloor.preferredField.pitch,100);

function support(side,nearToeShift=0){
  const map=([n,t,z])=>[side==='near'?n:462-n,t,z];
  const box=(id,[n,t,z,w,d,h])=>({id:side+' '+id,box:[side==='near'?n:462-n-w,t,z,w,d,h]});
  const braces=nearBraces.map(({id,a,b})=>{
    const start=map(a),end=map(add(b,[nearToeShift,0,0]));
    const axis=subtract(end,start),length=norm(axis);
    return {id:side+' '+id,a:start,b:end,direction:scale(axis,1/length),length,axialStiffness:steelE*braceArea/length};
  });
  const boxes=[
    box('upper RHS',[27,77,405,30,50,456]),
    box('lower crosshead',[27,86,117,30,40,26]),
    ...guideLevels.map(z=>side==='near'?box('guide end plate Z'+z,[50,60,z-11,7,40,22]):{id:side+' guide end plate Z'+z,box:[guideEnd[1],60,z-11,415-guideEnd[1],40,22]}),
    ...braces.map(({id,b:[n,t]})=>({id:id+' foot envelope',box:[n-10,t-10,0,20,20,20]})),
  ];
  return {side,braces,boxes};
}

function solveTranslation(braces,force){
  const stiffness=[0,1].map(i=>[0,1].map(j=>braces.reduce((sum,{direction,axialStiffness})=>sum+axialStiffness*direction[i]*direction[j],0)));
  const [[a,b],[c,d]]=stiffness,[x,y]=force,det=a*d-b*c;
  assert(det>0,'The brace plane requires two independent load directions');
  return [(d*x-b*y)/det,(a*y-c*x)/det];
}

function resolveSupport({side,braces},force,couple,seat,travel){
  const guidePoint=seat+travel+5;
  const span=guideEnd[1]-guideEnd[0];
  const share=side==='near'?(guideEnd[1]-guidePoint)/span:(guidePoint-guideEnd[0])/span;
  const [lower,upper]=guideLevels,[top,bottom]=supportLevels;
  const upperLoad=scale(subtract(couple,scale(force,lower-380)),share/(upper-lower));
  const lowerLoad=subtract(scale(force,share),upperLoad);
  const moment=add(scale(lowerLoad,lower-top),scale(upperLoad,upper-top));
  const bottomLoad=scale(moment,-1/(top-bottom));
  const topLoad=subtract(scale(force,share),bottomLoad);
  const topMovement=solveTranslation(braces.slice(0,2),topLoad);
  const bottomMovement=solveTranslation(braces.slice(2),bottomLoad);
  const slope=scale(subtract(topMovement,bottomMovement),1/(top-bottom));
  const flex=(z,loadZ)=>{
    const p=Math.min(z,loadZ)-top,q=Math.max(z,loadZ)-top;
    return p*p*(3*q-p)/(6*steelE*postI);
  };
  const guides=guideLevels.map(z=>add(add(topMovement,scale(slope,z-top)),add(scale(lowerLoad,flex(z,lower)),scale(upperLoad,flex(z,upper)))));
  const toes=braces.map(({id,b,direction,axialStiffness},i)=>{
    const axial=-axialStiffness*dot(direction.slice(0,2),i<2?topMovement:bottomMovement);
    return {id,b,axial,force:scale(direction,-axial)};
  });
  const sum=toes.reduce((total,toe)=>add(total,toe.force),[0,0,0]);
  assert(norm(subtract(sum.slice(0,2),scale(force,share)))<1e-8);
  const railN=side==='near'?guideEnd[0]:guideEnd[1];
  const reference=[railN,guideTangent,0];
  const toesMoment=toes.reduce((total,toe)=>add(total,cross(subtract(toe.b,reference),toe.force)),[0,0,0]);
  const inputMoment=add(cross([0,0,lower],[...lowerLoad,0]),cross([0,0,upper],[...upperLoad,0]));
  return {guides,guideLoads:[lowerLoad,upperLoad],toes,reference,otherFloorForce:[0,0,-sum[2]],unallocatedBaseMoment:subtract(inputMoment,toesMoment),share};
}

const independentVectorBound=([a,b,c,d])=>Math.hypot(a,b)+Math.hypot(c,d);
function planarBound([a,b,c,d]){
  const spectral=(u,v)=>{
    const x=dot(u,u),y=dot(v,v);
    return Math.sqrt((x+y+Math.hypot(x-y,2*dot(u,v)))/2);
  };
  return spectral(a,b)+spectral(c,d);
}
function supportBounds(frame,seat,world){
  const ends=[0,stroke].map(travel=>({travel,rows:loadCases.map(([force,couple])=>resolveSupport(frame,force,couple,seat,travel))}));
  const end=ends.reduce((a,b)=>a.rows[0].share>=b.rows[0].share?a:b);
  const {rows,travel}=end;
  const [first]=rows;
  const beamNorthEdge=beam.a[1]+beam.width/2;
  const transferLineY=3920;
  const toes=first.toes.map(({id,b},i)=>{
    const [x,y]=world(...b);
    const axialAbsN=independentVectorBound(rows.map(row=>row.toes[i].axial));
    const forceAbsN=[0,1,2].map(axis=>independentVectorBound(rows.map(row=>row.toes[i].force[axis])));
    const reachMM=Math.max(0,y-transferLineY);
    const rigidStripI=60*40**3/12;
    return {id,worldXY:[x,y],insideBeamMarginMM:beamNorthEdge-y,axialAbsN,forceAbsN,transferReachMM:reachMM,
      transferVerticalMomentBoundNmm:forceAbsN[2]*reachMM,
      transferIdealSteelDeflectionMM:forceAbsN[2]*reachMM**3/(3*steelE*rigidStripI)};
  });
  const anchorXY=frame.side==='near'?[[10190,3880],[10280,3880],[10190,3920],[10280,3920]]:
    [[10460,3760],[10530,3760],[10460,3880],[10530,3880]];
  const centroid=scale(anchorXY.reduce(add,[0,0]),1/anchorXY.length);
  const relative=anchorXY.map(p=>subtract(p,centroid));
  const sumX2=relative.reduce((n,[x])=>n+x*x,0),sumY2=relative.reduce((n,[,y])=>n+y*y,0);
  const origin=world(0,0,0);
  const anchorResponses=rows.map(row=>{
    const loads=row.guideLoads.map(([n,t])=>subtract(world(n,t,0),origin));
    const force=loads.reduce(add,[0,0,0]);
    const moments=loads.map((f,i)=>cross(subtract(world(row.reference[0],guideTangent,guideLevels[i]),[...centroid,beam.z[1]]),f));
    const moment=moments.reduce(add,[0,0,0]);
    const anchors=relative.map(([x,y])=>[
      force[0]/4-moment[2]*y/(sumX2+sumY2),
      force[1]/4+moment[2]*x/(sumX2+sumY2),
      moment[0]*y/sumY2-moment[1]*x/sumX2,
    ]);
    assert(norm(subtract(anchors.reduce(add,[0,0,0]),force))<1e-8);
    assert(norm(subtract(anchors.map((f,i)=>cross([...relative[i],0],f)).reduce(add,[0,0,0]),moment))<1e-8);
    return anchors;
  });
  const anchors=anchorXY.map(([x,y],i)=>({worldXY:[x,y],
    inBeamPlanMarginMM:Math.min(x-beam.a[0],beam.b[0]-x,y-(beam.a[1]-beam.width/2),beamNorthEdge-y),
    shearBoundN:planarBound(anchorResponses.map(row=>row[i].slice(0,2))),
    tensionOrCompressionBoundN:independentVectorBound(anchorResponses.map(row=>row[i][2])),
  }));
  return {governingTravelMM:travel,railShare:first.share,toes,anchors,
    nearestToeSpacingMM:Math.min(...toes.flatMap((a,i)=>toes.slice(i+1).map(b=>norm(subtract(a.worldXY,b.worldXY))))),
    guideIdealDisplacementMM:guideLevels.map((z,i)=>({z,mm:planarBound(rows.map(row=>row.guides[i]))})),
    otherVerticalFloorReactionBoundN:independentVectorBound(rows.map(row=>row.otherFloorForce[2])),
    unallocatedBaseMomentBoundNmm:[0,1,2].map(axis=>independentVectorBound(rows.map(row=>row.unallocatedBaseMoment[axis]))),
    signedForce100Couple6000:resolveSupport(frame,[100,0],[6000,0],seat,travel)};
}

function frameGeometry(frames,world,local,seat,portZ){
  const braces=frames.flatMap(frame=>frame.braces);
  const boxes=frames.flatMap(frame=>frame.boxes);
  const parts=[...braces,...boxes];
  const gap=(a,b,p)=>p.box?exactSegmentBoxDistance(a,b,p.box):segmentDistance(a,b,p.a,p.b)-braceRadius;
  const staticGap=minimum([
    ...braces.flatMap(p=>segmentGaps(world(...p.a),world(...p.b),braceRadius).map(q=>({part:p.id,to:q.id,gapMM:q.value}))),
    ...boxes.flatMap(p=>nativeBoxGaps(p.box,world,local).map(q=>({part:p.id,to:q.id,gapMM:q.value}))),
  ]);
  const braceGap=minimum(braces.flatMap((a,i)=>braces.slice(i+1).map(b=>({part:a.id,to:b.id,gapMM:gap(a.a,a.b,b)-braceRadius}))));
  const tail=finiteBends([[0,0,portZ],[seat,0,portZ],[seat,0,1100]],75,1);
  const movingGap=minimum(Array.from({length:stroke/2+1},(_,i)=>i*2).flatMap(s=>{
    const moved=tail.path.map(p=>add(p,[s,0,0]));
    return parts.flatMap(p=>[
      {part:'tail',to:p.id,stroke:s,gapMM:Math.min(...moved.slice(1).map((b,j)=>gap(moved[j],b,p)))-20-tail.hausdorffError-1},
      ...guideLevels.map(z=>({part:'link Z'+z,to:p.id,stroke:s,gapMM:gap([seat+s+20,guideTangent,z],[seat+s,0,z],p)-11})),
    ]);
  }));
  const shoulder=local([10545,4250,625]);
  const toolGap=minimum([-37,37].flatMap(t=>[-12,12].flatMap(dz=>Array.from({length:121},(_,i)=>{
    const z=portZ+dz,angle=((t>0?45:15)-15+i*.25)*Math.PI/180;
    const end=[115,t,z],grip=[115+60*Math.sin(angle),t+60*Math.cos(angle),z];
    const tools=[['shaft',[15,t,z],end,7],['lever',end,grip,5],['hand',grip,grip,50],['arm',shoulder,grip,40]];
    return tools.flatMap(([part,a,b,r])=>parts.map(p=>({part,to:p.id,gapMM:gap(a,b,p)-r-(part==='shaft'?0:60*.25*Math.PI/360)})));
  }).flat())));
  return {staticGap,braceGap,movingGap,toolGap,parts};
}

function dockComparison(cylinder,wholeU,nativeReceiver){
  const [west,east,south,north]=threshold.dock.plan;
  const [plateSouth,plateNorth]=threshold.section.servicePlateWidthY;
  const cart=threshold.cargo.find(row=>row.item==='Cylinder');
  assert.deepEqual(threshold.opening.roughY,cylinder.doorRaw);
  assert.equal(threshold.opening.clearY[1]-threshold.opening.clearY[0],cylinder.minDoor[0]);
  assert.equal(threshold.opening.height,cylinder.minDoor[1]);
  assert.equal(cart.centreY,cylinder.path.at(-1)[1]);
  const r=cylinder.cartRadius,guard=50,remote=25,settings=10;
  const boxDistance=([x,y],[ax,ay,,w,d])=>Math.hypot(Math.max(ax-x,x-ax-w,0),Math.max(ay-y,y-ay-d,0));
  const oldEndpoint=cylinder.path.at(-1);
  const requiredEndpoint=[cart.requiredCentreX,cart.centreY];
  const oldGapMM=boxDistance(oldEndpoint,wholeU.box)-r;
  const requiredGapMM=boxDistance(requiredEndpoint,wholeU.box)-r;
  const retainedTailRest=[12260,4220,0,275,190,1150];
  const tailRestShift=-465;
  const parkedTailRest=retainedTailRest.map((v,i)=>i===1?v+tailRestShift:v);
  const northPath=[oldEndpoint,[12500,4804],[12540,4847],[cart.requiredCentreX,4847]];
  const plateVoids=[[threshold.section.collectorX[0],south,0,west-threshold.section.collectorX[0],plateSouth-south,1],
    [threshold.section.collectorX[0],plateNorth,0,west-threshold.section.collectorX[0],north-plateNorth,1]];
  const obstacles=[wholeU,...plateVoids.map((box,i)=>({id:'open collector outside plate '+i,box}))];
  const route=minimum(northPath.slice(1).flatMap((b,i)=>obstacles.map(({id,box})=>{
    const centreBox=[box[0],box[1],-1,box[3],box[4],2];
    return {to:id,leg:i+1,gapMM:exactSegmentBoxDistance([...northPath[i],0],[...b,0],centreBox)-r};
  })).concat(northPath.map(([x,y],i)=>({to:'inside dock guard',leg:i,
    gapMM:Math.min(east-guard-x,y-south-guard,north-guard-y)-r}))));
  const movedX=remote-requiredGapMM;
  const retiredShiftY=-525;
  const unloadedParkedU=wholeU.box.map((v,i)=>i===1?v+retiredShiftY:v);
  const fullUGeometry=wholeU.box;
  const separationBetweenParkedReceivers=fullUGeometry[0]-(parkedTailRest[0]+parkedTailRest[3]);
  const eastHandlerX=Math.max(...nativeReceiver.rows.filter(row=>row.side==='east').map(row=>row.shoulder[0]));
  const northEndpointMinimumY=wholeU.box[1]+wholeU.box[4]+Math.sqrt((r+remote+settings)**2-(wholeU.box[0]-requiredEndpoint[0])**2);
  const northEndpointMaximumY=north-guard-r-remote-settings;
  return {thresholdSource:'project/mat/studies/plant-threshold.json',dock:threshold.dock.plan,
    scaffoldBoardPlan:threshold.dock.scaffoldBoardPlan,scaffoldMustBeCleared:true,
    cylinder:{oldEndpoint,oldGapMM,requiredEndpoint,requiredGapMM},
    wholeUShiftChallenger:{eastShiftMM:movedX,eastHandlerToInsideGuardMM:east-guard-eastHandlerX-movedX-300},
    retainedWholeUNorthDogleg:{path:northPath,route,settingAllowanceMM:settings,afterSettingsMM:route.gapMM-settings,
      northEndpointMinimumY,northEndpointMaximumY},
    emptyWholeUReceiverParking:{from:wholeU.box,to:unloadedParkedU,shiftYMM:retiredShiftY,
      parkedToRequiredCartMM:boxDistance(requiredEndpoint,unloadedParkedU)-r,
      lateralCartClearanceLowerMM:requiredEndpoint[1]-unloadedParkedU[1]-unloadedParkedU[4]-r,
      parkedInsideSouthGuardMM:unloadedParkedU[1]-south-guard,
      separationFromParkedTailReceiverMM:separationBetweenParkedReceivers,
      bodyGapBetweenParkedReceiversMM:separationBetweenParkedReceivers-600,
      bodyGapToSouthGuardMM:unloadedParkedU[1]-south-guard-600,
      scope:'Plan space for an empty receiver after supported whole-U export. Actual detachable structural mount, transporter, load restraint and north-side crew movement are required.'},
    tailRest:{landingEnvelope:retainedTailRest,southParkedEnvelope:parkedTailRest,southShiftMM:tailRestShift,
      landingToRequiredCartMM:boxDistance(requiredEndpoint,retainedTailRest)-r,
      parkedToRequiredCartMM:boxDistance(requiredEndpoint,parkedTailRest)-r,
      parkedInsideSouthGuardMM:parkedTailRest[1]-south-guard},
    releaseOrder:'Resolve positive tail receiver capture and park it south on the dry dock. Export the whole-U load and clear its receiver before the straight cylinder dock comparison. A retained whole-U receiver and the required straight cylinder endpoint cannot be occupied together.',
  };
}

function captureTrial({world,local,seat,rails,boxes,braces,packageParts,yokeParts}){
  const tailN=seat+stroke;
  const receiverPost=[tailN+58,-108];
  const firstCaptureFrame=[
    {id:'independent capture mast',a:[...receiverPost,20],b:[...receiverPost,820],r:18},
    {id:'capture mast south brace',a:[...receiverPost,650],b:[tailN+58,-212,20],r:15},
    {id:'capture mast normal brace',a:[...receiverPost,650],b:[tailN+169,-108,20],r:15},
    ...[610,790].map(z=>({id:`releasable tail pickup Z${z}`,a:[...receiverPost,z],b:[tailN+19,-10,z],r:10})),
  ];
  const portableYoke=yokeParts.map(p=>({...p,a:local(p.a),b:local(p.b)}));
  const captureFrameClearance=members=>minimum(members.flatMap(member=>{
    const a=world(...member.a),b=world(...member.b);
    const outside=segmentGaps(a,b,member.r);
    const guides=rails.map(q=>({id:q.id,value:segmentDistance(member.a,member.b,q.a,q.b)-20-member.r}));
    const frame=boxes.map(q=>({id:q.id,value:exactSegmentBoxDistance(member.a,member.b,q.box)-member.r}));
    const bracesLocal=braces.map(q=>({id:q.id,value:segmentDistance(member.a,member.b,q.a,q.b)-braceRadius-member.r}));
    const tailMetal=packageParts.filter(q=>q.id!=='elbow or tube'||!member.id.startsWith('releasable tail pickup')||
      Math.min(q.a[2],q.b[2])>member.a[2]||Math.max(q.a[2],q.b[2])<member.a[2])
      .map(q=>({id:q.id,value:segmentDistance(a,b,q.a,q.b)-member.r-q.r}));
    return [...outside,...guides,...frame,...bracesLocal,...tailMetal]
      .map(q=>({part:member.id,to:q.id,gapMM:q.value}));
  }));
  const firstCaptureClearance=captureFrameClearance(firstCaptureFrame);
  const yokeToMast=minimum(portableYoke.flatMap(p=>firstCaptureFrame.map(q=>({
    part:p.id,to:q.id,gapMM:segmentDistance(p.a,p.b,q.a,q.b)-p.r-q.r,
  }))));
  const yokeToUnremovedGuides=minimum(portableYoke.flatMap(p=>rails.map(q=>({
    part:p.id,to:q.id,gapMM:segmentDistance(p.a,p.b,q.a,q.b)-p.r-20,
  }))));
  const yokeToGuideFrame=minimum(portableYoke.flatMap(p=>[
    ...boxes.map(q=>({to:q.id,gapMM:exactSegmentBoxDistance(p.a,p.b,q.box)-p.r})),
    ...braces.map(q=>({to:q.id,gapMM:segmentDistance(p.a,p.b,q.a,q.b)-p.r-braceRadius})),
  ].map(q=>({part:p.id,...q}))));
  const lowPickupControl=firstCaptureFrame.filter(member=>member.id.startsWith('releasable tail pickup')).slice(0,1)
    .map(member=>({...member,a:[...member.a.slice(0,2),550],b:[...member.b.slice(0,2),550]}));
  const lowPickupClearance=captureFrameClearance(lowPickupControl);
  const footAnchorXY=[receiverPost,[tailN+58,-212],[tailN+169,-108],[tailN+169,-212]]
    .map(([n,t])=>world(n,t,0).slice(0,2));
  const shortestAnchorFootToBeamEdgeMM=Math.min(...footAnchorXY.map(([x,y])=>Math.min(
    x-beam.a[0],beam.b[0]-x,beam.width/2-Math.abs(y-beam.a[1]))));
  const captureVerticalTrialN=2*6*9.81,captureLateralTrialN=100;
  const captureEccentricityMM=norm(subtract(receiverPost,[tailN,0]));
  const capturePitchDemandNm=(captureVerticalTrialN*captureEccentricityMM+captureLateralTrialN*1110)/1000;
  const anchorMinGaugeMM=Math.min(111,104);
  const anchorRowDemandN=capturePitchDemandNm*1000/anchorMinGaugeMM;
  return {firstCaptureFrame,firstCaptureClearance,lowPickupClearance,portableYoke,yokeToMast,yokeToUnremovedGuides,yokeToGuideFrame,
    footAnchorXY,shortestAnchorFootToBeamEdgeMM,
    finishToRCRiseMM:-beam.z[1],captureVerticalTrialN,captureLateralTrialN,captureEccentricityMM,
    capturePitchDemandNm,anchorMinGaugeMM,anchorRowDemandN,
    initialPickupRole:'Install independent capture structure, take the measured vertical load through positive non-pressure shoes, then remove the unloaded guide cartridges. Retain pitch and roll until the portable yoke takes both catches.',
  };
}

function extractionTrial({world,local,rails,boxes,braces,packageParts,captureMembers}){
  return rails.map(rail=>{
    const railMoveGaps=(direction,travel)=>minimum(Array.from({length:Math.ceil(travel/5)+1},(_,i)=>{
      const steps=Math.ceil(travel/5);
      const displacement=scale(direction,travel*i/steps);
      const a=add(rail.a,displacement),b=add(rail.b,displacement),r=20;
      const staticGaps=segmentGaps(world(...a),world(...b),r);
      const fixtureGaps=boxes.filter(q=>!q.id.includes('guide end plate Z'+rail.a[2])).map(q=>({
        id:q.id,value:exactSegmentBoxDistance(a,b,q.box)-r,
      })).concat(braces.map(q=>({id:q.id,value:segmentDistance(a,b,q.a,q.b)-braceRadius-r})));
      const packageGaps=packageParts.map(q=>({id:q.id,value:segmentDistance(world(...a),world(...b),q.a,q.b)-q.r-r}));
      return minimum([...staticGaps,...fixtureGaps,...packageGaps].map(q=>({
        to:q.id,travelMM:travel*i/steps,gapMM:q.value-travel/(2*steps),
      })));
    }));
    const railBarWidth=20, releasedNear=guideEnd[0]+14,releasedFar=guideEnd[1]-14;
    const liftShortBar=([start,end],extraRetained=[])=>{
      const span=subtract(end,start),travel=norm(span);
      const samples=Math.ceil(travel/2);
      return minimum(Array.from({length:samples+1},(_,i)=>{
        const [n,t,z]=add(start,scale(span,i/samples));
        const box=[n+releasedNear,t-railBarWidth/2,z-railBarWidth/2,releasedFar-releasedNear,railBarWidth,railBarWidth];
        const fixed=nativeBoxGaps(box,world,local);
        const fixtureGaps=boxes.filter(q=>!q.id.includes('guide end plate Z'+rail.a[2])).map(q=>({
          id:q.id,value:Math.hypot(...[0,1,2].map(i=>Math.max(q.box[i]-box[i]-box[i+3],box[i]-q.box[i]-q.box[i+3],0))),
        })).concat(braces.map(q=>({id:q.id,value:exactSegmentBoxDistance(q.a,q.b,box)-braceRadius})));
        const packageGaps=packageParts.map(q=>({id:q.id,value:exactSegmentBoxDistance(local(q.a),local(q.b),box)-q.r}));
        const otherGuides=extraRetained.map(q=>({id:q.id,value:exactSegmentBoxDistance(q.a,q.b,box)-20}));
        const captureGaps=captureMembers.map(q=>({id:q.id,value:exactSegmentBoxDistance(q.a,q.b,box)-q.r}));
        return minimum([...fixed,...fixtureGaps,...packageGaps,...otherGuides,...captureGaps].map(q=>({
          to:q.id,z,n,t,gapMM:q.value-travel/(2*samples),
        })));
      }));
    };
    const sameAxisRetained=rails.filter(q=>q.id!==rail.id);
    const z=rail.a[2],stagedLiftMM=40,stagedTravelMM=170;
    const shortRailAt=(z,t=guideTangent)=>[0,t,z];
    const liftFirst=liftShortBar([shortRailAt(z),shortRailAt(z+stagedLiftMM)],sameAxisRetained);
    const slideSecond=liftShortBar([shortRailAt(z+stagedLiftMM),shortRailAt(z+stagedLiftMM,guideTangent+stagedTravelMM)],sameAxisRetained);
    const receiverOffsetT=guideTangent+stagedTravelMM;
    const shelfDepth=26,shelfWidth=45,lowerToRestMM=20;
    const shelfTop=z+stagedLiftMM-railBarWidth/2-lowerToRestMM;
    const restCentres=[releasedNear+30,releasedFar-30];
    const restLands=restCentres.map(n=>[n-shelfWidth/2,receiverOffsetT-shelfDepth/2,shelfTop-8,shelfWidth,shelfDepth,8]);
    const restPosts=restCentres.map(n=>({id:'independent rail rest post',a:[n,receiverOffsetT+24,20],b:[n,receiverOffsetT+24,shelfTop],r:12}));
    const restTies=restCentres.map(n=>({id:'rail rest shelf tie',a:[n,receiverOffsetT+10,shelfTop-8],
      b:[n,receiverOffsetT+24,shelfTop-8],r:5}));
    const restPostGap=minimum(restPosts.flatMap(p=>{
      const native=segmentGaps(world(...p.a),world(...p.b),p.r);
      const fixture=boxes.map(q=>({id:q.id,value:exactSegmentBoxDistance(p.a,p.b,q.box)-p.r}));
      return [...native,...fixture].map(q=>({to:q.id,gapMM:q.value}));
    }));
    const lowerThird=liftShortBar([shortRailAt(z+stagedLiftMM,receiverOffsetT),
      shortRailAt(z+stagedLiftMM-lowerToRestMM,receiverOffsetT)],sameAxisRetained);
    const railTareKG=(releasedFar-releasedNear)*railBarWidth**2*7850/1e9;
    const supportLoadsN=restLands.map(()=>2*railTareKG*9.81/restLands.length);
    const landGapAtRestMM=z+stagedLiftMM-lowerToRestMM-railBarWidth/2-shelfTop;
    const rest={receiverOffsetT,restLands,restPosts,restTies,restPostGap,lowerThird,railTareKG,supportLoadsN,
      landGapAtRestMM,minimumLateralBearingOverhangMM:(shelfDepth-railBarWidth)/2};
    return {id:rail.id,normalNear:railMoveGaps([-1,0,0],120),normalFar:railMoveGaps([1,0,0],120),
      towardsYoke:railMoveGaps([0,-1,0],80),awayFromYoke:railMoveGaps([0,1,0],80),
      up:railMoveGaps([0,0,1],100),down:railMoveGaps([0,0,-1],100),
      releasedShortBar:{railBarWidth,releasedNear,releasedFar,
        firstLift100MM:liftShortBar([shortRailAt(z),shortRailAt(z+100)],sameAxisRetained),
        firstLift250MM:liftShortBar([shortRailAt(z),shortRailAt(z+250)],sameAxisRetained),
        staged:{stagedLiftMM,stagedTravelMM,liftFirst,slideSecond,rest}}};
  });
}

function dockKeeperTrial({keys,packageParts,firstRestShift,phases,bodyEnd,remoteBoxes,firstRestParts,gravityComparisonN}){
  const receiverClevises=keys.map(({a,b})=>{
    const keyLanding=add(a,firstRestShift);
    const [kx,ky,kz]=keyLanding;
    return {
      pinCentre:[kx+45,ky,kz],keyAxisAtLanding:[keyLanding,add(b,firstRestShift)],
      parts:[
        {id:`key south jaw Z${kz}`,box:[kx+34,ky-23,kz-28,23,9,40]},
        {id:`key north jaw Z${kz}`,box:[kx+34,ky+14,kz-28,23,9,40]},
        {id:`key low bridge Z${kz}`,box:[kx+34,ky-23,kz-28,23,46,14]},
        {id:`key cantilever Z${kz}`,box:[kx+57,ky-23,kz-28,75,46,14]},
        {id:`key spine connection Z${kz}`,box:[kx+129,ky+13,kz-28,21,30,14]},
      ],
    };
  });
  const receiverClevis=receiverClevises.flatMap(x=>x.parts);
  const receivingGap=(shift)=>{
    const gaps=packageParts.flatMap(p=>receiverClevis.map(q=>({part:p.id,to:q.id,
      gapMM:exactSegmentBoxDistance(add(p.a,shift),add(p.b,shift),q.box)-p.r})));
    return minimum(gaps);
  };
  const approachPhase=phases.at(-2);
  const approachStep=5;
  const approachTravel=norm(subtract(approachPhase.b,approachPhase.a));
  const approachSamples=Math.ceil(approachTravel/approachStep);
  const approachResult=minimum(Array.from({length:approachSamples+1},(_,i)=>{
    const shift=add(approachPhase.a,scale(subtract(approachPhase.b,approachPhase.a),i/approachSamples));
    const result=receivingGap(shift);
    return {...result,gapMM:result.gapMM-approachTravel/(2*approachSamples)};
  }));
  const settlingResult=minimum(Array.from({length:21},(_,i)=>{
    const result=receivingGap(add(firstRestShift,[0,0,i]));
    return {...result,gapMM:result.gapMM-0.5};
  }));
  const receiverWidthY=receiverClevises[0].parts.find(p=>p.id.startsWith('key low bridge')).box[4];
  const pinLeadOvertravelMM=5;
  const gripTravel=receiverWidthY+pinLeadOvertravelMM;
  const actuationTrial=(body,direction)=>{
    const shoulder=add(body,[0,0,900]);
    const grips=receiverClevises.map(({pinCentre})=>add(pinCentre,[103,-direction*198,10]));
    const gap=minimum(grips.flatMap(parkedGrip=>Array.from({length:gripTravel+1},(_,i)=>{
      const hand=add(parkedGrip,[0,direction*i,0]);
      return minimum([[hand,hand,50,'keeper hand'],[shoulder,hand,40,'keeper arm']].flatMap(([a,b,r,part])=>[
        ...packageParts.map(p=>({part,to:p.id,gapMM:segmentDistance(a,b,
          add(p.a,firstRestShift),add(p.b,firstRestShift))-p.r-r-0.5})),
        ...[...remoteBoxes,...receiverClevis].map(q=>({part,to:q.id,gapMM:exactSegmentBoxDistance(a,b,q.box)-r-0.5})),
      ]));
    })));
    const reachMM=Math.max(...grips.flatMap(grip=>[grip,add(grip,[0,direction*gripTravel,0])])
      .map(q=>norm(subtract(q,shoulder))));
    return {gap,reachMM,grips};
  };
  const northActuationTrial=actuationTrial(bodyEnd,-1);
  const secondOperator=[12650,3900,0];
  const secondOperatorPath=[[13275,3845,0],[12690,3845,0],secondOperator];
  const secondOperatorLegs=secondOperatorPath.slice(1).map((end,i)=>[secondOperatorPath[i],end]);
  const secondBodyGap=minimum([...remoteBoxes,...receiverClevis].map(q=>({
    to:q.id,gapMM:Math.min(...secondOperatorLegs.map(([start,end])=>exactSegmentBoxDistance(start,end,
      [q.box[0],q.box[1],0,q.box[3],q.box[4],1])))-300,
  })).concat(packageParts.map(p=>({
    to:p.id,gapMM:Math.min(...secondOperatorLegs.map(([start,end])=>segmentDistance(start,end,
      plan(add(p.a,firstRestShift)),plan(add(p.b,firstRestShift)))))-300-p.r,
  }))));
  const secondOperatorToFirstMM=Math.min(...secondOperatorLegs.map(([start,end])=>segmentDistance(start,end,bodyEnd,bodyEnd)))-600;
  const [,dockEast,dockSouth]=threshold.dock.plan;
  const guardInsetMM=50;
  const secondOperatorToDockGuardMM=Math.min(...secondOperatorPath.map(([x,y])=>
    Math.min(dockEast-guardInsetMM-x,y-dockSouth-guardInsetMM)))-300;
  const southActuationTrial=actuationTrial(secondOperator,1);
  const verticalForceN=gravityComparisonN;
  const lateralForceN=100;
  const [lowerPinZ,upperPinZ]=receiverClevises.map(x=>x.pinCentre[2]);
  const verticalLeverArmMM=upperPinZ-lowerPinZ;
  const upperReactionN=lateralForceN*(1110-lowerPinZ)/verticalLeverArmMM;
  const lowerReactionN=lateralForceN-upperReactionN;
  const pinDiameter=8;
  const combinedPinN=Math.hypot(verticalForceN,upperReactionN);
  const pinAreaMM2=Math.PI*pinDiameter**2/4;
  const forkExtension=firstRestParts[1].box[0]-receiverClevises[0].pinCentre[0];
  const baseAnchorGaugeMM=95;
  const baseLateralMomentNm=lateralForceN*1110/1000;
  const baseRowCoupleN=baseLateralMomentNm*1000/baseAnchorGaugeMM;
  const keyOuterDiameterMM=keys[0].r*2;
  const keyHoleTrialMM=8.4;
  return {
    receiverClevises,approachResult,settlingResult,
    seatingVerticalClearanceMM:6,lateralClearanceEachSideMM:6,
    keyOuterDiameterMM,keyHoleTrialMM,keeperPinDiameterMM:pinDiameter,pinTravelMM:gripTravel,
    receiverWidthY,pinLeadOvertravelMM,
    trialRadialNetLigamentMM:(keyOuterDiameterMM-keyHoleTrialMM)/2,
    trialEndNetLigamentMM:receiverClevises[0].keyAxisAtLanding[1][0]-receiverClevises[0].pinCentre[0]-keyHoleTrialMM/2,
    northActuationTrial,
    southActuationTrial:{secondOperatorPath,secondBodyGap,secondOperatorToFirstMM,secondOperatorToDockGuardMM,
      ...southActuationTrial},
    reactions:{verticalForceN,lateralForceN,verticalLeverArmMM,upperReactionN,lowerReactionN,combinedPinN,
      idealPinDoubleShearMPa:combinedPinN/(2*pinAreaMM2),idealPinSingleShearMPa:combinedPinN/pinAreaMM2,
      forkExtension,idealForkBendingNm:combinedPinN*forkExtension/1000,baseAnchorGaugeMM,
      baseLateralMomentNm,baseRowCoupleN},
    loadPath:'Seat both yoke keys, keep the two transport grips continuously held, then have a second worker use the south controls to lock both captive pins and read their engagement telltales. Opposite-direction load components need separate fork cheeks.',
    remaining:'Prove solid key and pin edge distances, actual pin grip and attachment, lateral cheek fit, bare tube isolation, lower land weld, spine/base load transfer and the independent dock floor restraint.',
  };
}

function departureGeometry({world,local,seat,portZ,frames,cylinder}){
  const tail=finiteBends([[stroke,0,portZ],[seat+stroke,0,portZ],[seat+stroke,0,1100]],75,1);
  const keys=[550,730].map(z=>{
    const root=world(seat+stroke,0,z);
    return {id:`east-projecting captive yoke key Z${z}`,a:root,b:add(root,[55,0,0]),r:8};
  });
  const yokeN=seat+stroke;
  const yokeBody=[{id:'portable yoke body',a:world(yokeN-26,10,550),b:world(yokeN-26,10,975),r:8},
    ...[550,730,975].map(z=>({id:`portable pickup Z${z}`,a:world(yokeN-26,10,z),b:world(yokeN-18,3,z),r:8})),
  ];
  const grips=[550,975].map(z=>({id:'removable grip Z'+z,a:world(seat+stroke,0,z),b:world(seat+stroke-20,119,z),r:12}));
  const packageParts=[
    ...tail.path.slice(1).map((b,i)=>({id:'elbow or tube',a:world(...tail.path[i]),b:world(...b),r:20+tail.hausdorffError})),
    {id:'released flange envelope',a:world(stroke-5,0,portZ),b:world(stroke+5,0,portZ),r:45},
    ...grips,...keys,...yokeBody,
  ];
  const braces=frames.flatMap(frame=>frame.braces),boxes=frames.flatMap(frame=>frame.boxes);
  const rails=guideLevels.map(z=>({id:'retained rail Z'+z,a:[guideEnd[0],guideTangent,z],b:[guideEnd[1],guideTangent,z]}));
  const nearEnd=world(seat+stroke,0,0);
  const temporaryCapture=captureTrial({world,local,seat,rails,boxes,braces,packageParts,yokeParts:[...yokeBody,...keys,...grips]});
  const railExtraction=extractionTrial({world,local,rails,boxes,braces,packageParts,
    captureMembers:temporaryCapture.firstCaptureFrame});
  const northTravel=520,eastTravel=12380-nearEnd[0];
  const bodyStart=[10545,4255,0],bodyNorth=[10670,4725,0],bodyEnd=add(bodyNorth,[eastTravel,0,0]);
  const entryY=(cylinder.doorRaw[0]+cylinder.doorRaw[1])/2;
  const [doorWidth,doorHeight]=cylinder.minDoor;
  const minY=entryY-doorWidth/2,maxY=entryY+doorWidth/2;
  const frameWalls=[
    {id:'south finished portal reveal',box:[11570.5,minY-500,0,429.5,500,3100]},
    {id:'north finished portal reveal',box:[11570.5,maxY,0,429.5,500,3100]},
    {id:'finished portal head',box:[11570.5,minY,doorHeight,429.5,doorWidth,800]},
  ];
  const u=receiverNative();
  const [ux,uy,,uw,ud]=u.members.base;
  const wholeU={id:'whole-U first-rest occupied envelope',box:[ux,uy,0,uw,ud,u.trackMaximumTop]};
  const firstRestParts=[
    {id:'lower-tail rest base',box:[12260,4240,0,275,130,20]},
    {id:'lower-tail rest spine',box:[12510,4350,20,22,40,980]},

  ];
  const remoteBoxes=[...frameWalls,wholeU,...firstRestParts];
  const actualFrameGaps=(a,b,r,retainedRails)=>{
    const localA=local(a),localB=local(b);
    return [
      ...boxes.map(p=>({id:p.id,value:exactSegmentBoxDistance(localA,localB,p.box)-r})),
      ...braces.map(p=>({id:p.id,value:segmentDistance(localA,localB,p.a,p.b)-braceRadius-r})),
      ...retainedRails.map(p=>({id:p.id,value:segmentDistance(localA,localB,p.a,p.b)-20-r})),
    ];
  };
  const occupiedBodyGaps=body=>{
    const p=local(body);
    return [
      ...uprightBodyGaps(body.slice(0,2),2000,300),
      ...boxes.map(q=>({id:q.id,value:exactSegmentBoxDistance(p,add(p,[0,0,2000]),q.box)-300})),
      ...braces.map(q=>({id:q.id,value:segmentDistance(p,add(p,[0,0,2000]),q.a,q.b)-braceRadius-300})),
      ...rails.map(q=>({id:q.id,value:segmentDistance(p,add(p,[0,0,2000]),q.a,q.b)-20-300})),
      ...remoteBoxes.map(({id,box})=>{
        const xy=exactSegmentBoxDistance(body,body,[box[0],box[1],0,box[3],box[4],1])-300;
        const z=Math.max(box[2]-2000,-box[2]-box[5],0);
        return {id,value:z?Math.hypot(Math.max(xy,0),z):xy};
      }),
    ];
  };
  const bodyPathGap=path=>minimum(path.slice(1).flatMap((b,i)=>{
    const a=path[i],samples=Math.ceil(norm(subtract(b,a))/10);
    return Array.from({length:samples+1},(_,j)=>{
      const body=add(a,scale(subtract(b,a),j/samples));
      return minimum(occupiedBodyGaps(body).map(q=>({to:q.id,body,gapMM:q.value-norm(subtract(b,a))/(2*samples)})));
    });
  }));
  const ordinaryPath=[[8800,3200,0],[10545,3200,0],[10545,3850,0],[10570,3970,0],bodyStart];
  const externalPath=[[12330,4725,0],[10670,4725,0],bodyStart];
  const phases=[
    {id:'lift 30 from positively opened catches',a:[0,0,0],b:[0,0,30],bodyA:bodyStart,bodyB:bodyStart},
    {id:'north separation',a:[0,0,30],b:[0,northTravel,30],bodyA:bodyStart,bodyB:bodyNorth},
    {id:'out through the finished opening',a:[0,northTravel,30],b:[eastTravel,northTravel,30],bodyA:bodyNorth,bodyB:bodyEnd},
    {id:'lower to separate bearing land',a:[eastTravel,northTravel,30],b:[eastTravel,northTravel,10],bodyA:bodyEnd,bodyB:bodyEnd},
  ];
  const endBypass=subtract(world(170,0,0),world(0,0,0));
  const bypassNorth=[endBypass[0],northTravel,30];
  const bypassBodyNorth=[10720,4725,0];
  const bypassPhases=[
    phases[0],
    {id:'outward 170 past the closed rail ends',a:phases[0].b,b:add(endBypass,[0,0,30]),bodyA:bodyStart,bodyB:bodyStart},
    {id:'north beyond the retained end posts',a:add(endBypass,[0,0,30]),b:bypassNorth,bodyA:bodyStart,bodyB:bypassBodyNorth},
    {id:phases[2].id,a:bypassNorth,b:phases[2].b,bodyA:bypassBodyNorth,bodyB:add(bypassBodyNorth,[eastTravel-endBypass[0],0,0])},
  ];
  const phaseResults=(retainedRails,motion=phases,parts=packageParts)=>motion.map(({id,a,b,bodyA,bodyB})=>{
    const move=subtract(b,a),bodyMove=subtract(bodyB,bodyA),samples=Math.ceil(Math.max(norm(move),norm(bodyMove))/10);
    const step=norm(move)/samples,relativeStep=norm(subtract(move,bodyMove))/samples;
    const rows=Array.from({length:samples+1},(_,i)=>{
      const fraction=i/samples,shift=add(a,scale(move,fraction)),body=add(bodyA,scale(bodyMove,fraction));
      const fixed=[],bodyToPackage=[];
      for(const part of parts){
        const start=add(part.a,shift),end=add(part.b,shift);
        const gaps=[
          ...segmentGaps(start,end,part.r),
          ...actualFrameGaps(start,end,part.r,retainedRails),
          ...remoteBoxes.map(q=>({id:q.id,value:exactSegmentBoxDistance(start,end,q.box)-part.r})),
        ];
        fixed.push(...gaps.map(q=>({part:part.id,to:q.id,fraction,gapMM:q.value-step/2})));
        bodyToPackage.push({part:part.id,fraction,gapMM:segmentDistance(plan(start),plan(end),body,body)-part.r-300-relativeStep/2});
      }
      const shoulder=add(body,[0,0,900]);
      const held=parts.filter(part=>part.id.startsWith('removable grip')).flatMap(part=>{
        const hand=add(part.b,shift);
        return [[hand,hand,50,'hand'],[shoulder,hand,40,'arm']].flatMap(([p,q,r,kind])=>[
          ...segmentGaps(p,q,r),
          ...actualFrameGaps(p,q,r,retainedRails),
          ...remoteBoxes.map(box=>({id:box.id,value:exactSegmentBoxDistance(p,q,box.box)-r})),
        ].map(result=>({part:kind+' '+part.id,to:result.id,fraction,gapMM:result.value-Math.max(step,norm(bodyMove)/samples)/2})));
      });
      const reach=Math.max(...parts.filter(part=>part.id.startsWith('removable grip')).map(part=>
        norm(subtract(add(part.b,shift),shoulder))))+relativeStep/2;
      const bodyGap=minimum(occupiedBodyGaps(body).map(q=>({to:q.id,body,gapMM:q.value-norm(bodyMove)/(2*samples)})));
      return {fixed:minimum(fixed),bodyToPackage:minimum(bodyToPackage),bodyGap,held:minimum(held),reach};
    });
    return {id,partGap:minimum(rows.map(row=>row.fixed)),bodyToPackage:minimum(rows.map(row=>row.bodyToPackage)),bodyGap:minimum(rows.map(row=>row.bodyGap)),handOrArmGap:minimum(rows.map(row=>row.held)),maximumReachMM:Math.max(...rows.map(row=>row.reach))};
  });
  const firstRestShift=phases.at(-1).b;
  const grip=packageParts.find(part=>part.id==='removable grip Z550');
  const gripEnd=add(grip.b,firstRestShift);
  const gripLand=add(add(grip.a,scale(subtract(grip.b,grip.a),55/119)),firstRestShift);
  const bearingLand=[12400,4380,543,132,7,5];
  const bearingTop=bearingLand[2]+bearingLand[5];
  const bearingGap=gripLand[2]-grip.r-bearingTop;
  const bearingLandProjection=gripLand.slice(0,2).every((v,i)=>v>bearingLand[i]&&v<bearingLand[i]+bearingLand[i+3]);
  assert.equal(bearingGap,0);
  assert(bearingLandProjection,'The lower grip must land within its bearing surface');
  const receiver={
    parts:firstRestParts,
    lowerBearingLand:bearingLand,
    gripEnd,gripLand,
    ownHandToBearingAtRestMM:exactSegmentBoxDistance(gripEnd,gripEnd,bearingLand)-50,
    pipeCentreToBearingSouthEdgeMM:bearingLand[1]-(nearEnd[1]+northTravel),
    nativeVerticalSeparationAtApproachMM:20,
    nativeVerticalSeparationAtRestMM:bearingGap,
    bearingLandProjection,
    gravityComparisonN:2*6*9.81,
    remainsHandheldUntil:'Actual carrier-to-shoe keys and receiver keeper engage positively. The receiver bearing trial does not earn a loaded release or overturning resistance.',
  };
  receiver.positiveDockKeeperTrial=dockKeeperTrial({keys,packageParts,firstRestShift,phases,bodyEnd,
    remoteBoxes,firstRestParts,gravityComparisonN:receiver.gravityComparisonN});
  const elongatedKeys=packageParts.map(part=>keys.includes(part)?{...part,b:add(part.b,[30,0,0])}:part);
  const longerKeeperKeyControl=minimum(phaseResults([],phases.slice(0,2),elongatedKeys).map(phase=>phase.partGap));
  return {ordinaryAccessWithFrame:bodyPathGap(ordinaryPath),externalAccessWithFrame:bodyPathGap(externalPath),
    receiver,temporaryCapture,railExtraction,dockComparison:dockComparison(cylinder,wholeU,u),
    retainedRailControl:phaseResults(rails),detachedRailChallenger:phaseResults([]),longerKeeperKeyControl,
    retainedEndBypassChallenger:phaseResults(rails,bypassPhases),firstRestTubeXY:[12380,nearEnd[1]+northTravel],
    handoff:'The detached comparison requires both spanning rail bars removed after independent positive capture. Grip attachment, rail release and withdrawal, hand sweeps, receiver bearing/latch, dock support and removal before the cylinder move remain explicit duties.'};
}

export function deriveReleaseSupport(){
  const house=deriveCurrentHouse().model;
  assertBridgeNativeHouse(house);
  const {candidateLowerPortXY:port,candidateLowerPortZ:portZ}=lowerCapComparator(house);
  const delta=subtract(house.architecturalServices.plant.cylinder.westSeat,port),seat=norm(delta);
  const normal=scale(delta,1/seat),tangent=[-normal[1],normal[0]];
  const world=(n,t,z)=>[...add(port,add(scale(normal,n),scale(tangent,t))),z];
  const local=([x,y,z])=>{const delta=subtract([x,y],port);return [dot(delta,normal),dot(delta,tangent),z];};
  const near=support('near'),far=support('far');
  const geometry=frameGeometry([near,far],world,local,seat,portZ);
  const directToeTrial=support('near',210);
  return {status:'DEVELOPMENT_NOT_ADOPTED',port,seat,
    geometry,departure:departureGeometry({world,local,seat,portZ,frames:[near,far],cylinder:house.architecturalServices.plant.cylinder}),near:supportBounds(near,seat,world),far:supportBounds(far,seat,world),
    directToeTrial:{geometry:frameGeometry([directToeTrial,far],world,local,seat,portZ),support:supportBounds(directToeTrial,seat,world)},
    supportModel:'Locked two-ended guide comparison. The end shares assume the rail ends are fixed axially and supported laterally; a single active axial stop redistributes the signed reaction.',
    floor:{beam,finishMM:15,distributionMM:65,glassMM:100,rcTopZ:-180,rcSoffitZ:-380,
      transferLineY:3920,plateStripComparisonMM:[60,40],massOrFrictionCredited:false,
      nearAccessRecessTrialXY:[10155,3870,180,195],farAccessRecessTrialXY:[10430,3740,120,165],
      anchorModel:'Equal spring rigid group at RC top. Pure lateral tool wrench only. No anchor, concrete, bar phase, vertical handling, bearing plate contact, prying or installed movement qualification.'}};
}

if(process.argv[1]===fileURLToPath(import.meta.url))console.log(JSON.stringify(deriveReleaseSupport(),null,2));
