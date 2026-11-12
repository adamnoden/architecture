/** Located utility first breaks. Dimensions are a reference assembly contract,
 * not a declaration that an undimensioned catalogue tail already fits it. */
import {finiteBends,exactSegmentBoxDistance as segmentBoxDistance} from './incoming-water-geometry.mjs';
import {pathSeparation,segmentBodyDistance} from './service-interface-geometry.mjs';

export const terminalVertices={
  coldWasher:[[10760,1250,1000],[10760,1250,950],[10800,1250,900],[10800,1250,750]],
  coldSink:[[10800,1250,900],[10800,835,900],[10800,835,500],[10800,1050,500],[11110,1050,500],[11110,1275,500],[11110,1275,595]],
  hotSink:[[10860,1250,1000],[10860,1250,950],[10860,750,950],[10800,750,950],[10800,750,400],[10800,1000,400],[11300,1000,400],[11300,1275,400],[11300,1275,595]]
};
export const utilityBreaks=[
  {id:'cold',point:[11110,1275,595],toolSector:[35,95]},
  {id:'hot',point:[11300,1275,595],toolSector:[75,135]}
];
export const utilityH0={id:'H0',axis:[10860,1250,1500],wheel:[10860,1345,1500],
  bodyBox:[10823,1213,1417.5,74,147,165],
  valveFaceLength:55,maxAdaptorsEach:55,wheelDiameter:69,
  orientation:'Vertical pipe with horizontal stem facing north; independently supported below the working wheel.'};
export const utilityReaction={rackLink:[10875,1100,535,30,65,40],crossRail:[10875,1100,535,460,30,40],
  coldArm:[11100,1130,550,20,105,20],hotArm:[11290,1130,550,20,105,20],
  coldKey:[11075,1235,562,70,80,15],hotKey:[11265,1235,562,70,80,15]};
export const utilityDrains=[
  {id:'cold',tee:[11110,1275,500],valve:[11110,1275,350],spout:[11110,1275,150]},
  {id:'hot',tee:[11300,1275,400],valve:[11300,1275,250],spout:[11300,1275,150]}
];
const swept=(box,a,b)=>[...box.slice(0,3).map((v,i)=>v+Math.min(a[i],b[i])),...box.slice(3).map((v,i)=>v+Math.abs(b[i]-a[i]))];
const boxesGap=(a,b)=>Math.hypot(...[0,1,2].map(i=>Math.max(a[i]-b[i]-b[i+3],b[i]-a[i]-a[i+3],0)));
const routeBoxGap=(route,box,r)=>Math.min(...route.path.slice(1).map((b,i)=>segmentBoxDistance(route.path[i],b,box)))-r-route.hausdorffError;
// Conservative plan capsule of the whole spanner, but its real bounded
// thickness in Z. Treating a 71.5 mm head as a sphere would invent thickness.
function toolGap(a,b,box){
  const plan=segmentBoxDistance([a[0],a[1],0],[b[0],b[1],0],[box[0],box[1],0,box[3],box[4],1])-35.75;
  const vertical=Math.max(box[2]-(a[2]+6.4),a[2]-6.4-box[2]-box[5],0);
  return Math.hypot(Math.max(plan,0),vertical);
}

export function utilityTerminalStudy(model,host){
  const r=25,routes=Object.fromEntries(Object.entries(terminalVertices).map(([id,v])=>[id,finiteBends(v,25)]));
  const obstacles={};
  for(const[id,b]of Object.entries(host.geometry.frame))if(id!=='temporary carry bar')obstacles[id]=b;
  for(const[id,b]of Object.entries(host.geometry.carrier))if(!['water fitting and cap domain','compact carrier post'].includes(id)){
    obstacles[id]=[...b.slice(0,3),b[3]-30,...b.slice(4)];
    obstacles[id+' return']=[10875,1165,b[2],20,70,b[5]];
  }
  Object.assign(obstacles,{rackPost:[10875,1165,0,20,20,850],rackFoot:[10835,1100,0,70,100,10],
    rearLink300:[10875,700,300,20,485,20],rearLink800:[10875,700,800,20,485,20],
    washer:[10076,800,0,598,600,848],inheritedHeadBody:[10935,740,650,600,600,600],
    eastWall:[model.shell-model.envelope,0,0,300,2500,3500]});
  for(const[i,[x,y,w,d]]of host.floorAndWall.seatPlan.entries())obstacles['wholeFootWindow'+i]=[x,y,0,w,d,900];
  const pipeClearances=Object.fromEntries(Object.entries(routes).map(([id,route])=>[id,
    Object.entries(obstacles).map(([obstacle,b])=>({obstacle,gapMM:routeBoxGap(route,b,r)})).sort((a,b)=>a.gapMM-b.gapMM)]));
  const waste=[[11270,940,610],[10760,940,597.25],[10760,1275,588.875],[10875,1275,586]];
  const pair=(a,b)=>pathSeparation(routes[a].path,routes[b].path)-50-routes[a].hausdorffError-routes[b].hausdorffError;
  const shoulder=[10925,1725,800],toolZ=615,toolLength=297,step=.25;
  const angularPenalty=toolLength*step*Math.PI/360;
  const toolChecks=utilityBreaks.map(({id,point,toolSector})=>{
    let tool=Infinity,hand=Infinity,arm=Infinity,reach=0,otherPipe=Infinity;
    const other=utilityBreaks.find(b=>b.id!==id).point;
    for(let angle=toolSector[0];angle<=toolSector[1]+1e-8;angle+=step){
      const a=angle*Math.PI/180,p=[point[0],point[1],toolZ],tip=[p[0]+toolLength*Math.cos(a),p[1]+toolLength*Math.sin(a),toolZ];
      reach=Math.max(reach,Math.hypot(...tip.map((v,i)=>v-shoulder[i])));
      for(const box of [...Object.values(obstacles),...Object.values(utilityReaction)]){
        tool=Math.min(tool,toolGap(p,tip,box));
        hand=Math.min(hand,segmentBoxDistance(tip,tip,box)-50);
        arm=Math.min(arm,segmentBoxDistance(shoulder,tip,box)-40);
      }
      otherPipe=Math.min(otherPipe,segmentBodyDistance(p,tip,other.slice(0,2),[500,625],25)-35.75);
    }
    return {id,sector:toolSector,toolGapLowerMM:tool-angularPenalty,handGapLowerMM:hand-angularPenalty,
      armGapLowerMM:arm-angularPenalty,otherUnionGapLowerMM:otherPipe-angularPenalty,maxReachUpperMM:reach+angularPenalty};
  });
  const fixed={frame:[10935,740,0,600,600,900],washer:obstacles.washer,rackPost:obstacles.rackPost,
    rackFoot:obstacles.rackFoot,eastWall:obstacles.eastWall,H0:utilityH0.bodyBox,
    coldCap:[10723,1213,963,74,74,1799],hotCap:[10823,1213,963,74,74,2019]};
  const radiator=model.architecturalServices.emitters.find(e=>e.id==='utility-E');
  fixed.radiator=[...radiator.completePlanWithValvesAndBrackets.slice(0,2),radiator.bottomLocal,
    ...radiator.completePlanWithValvesAndBrackets.slice(2),radiator.topLocal-radiator.bottomLocal];
  const head=[10930,735,925,610,610,700],moves=[[0,0,0],[0,760,0],[-730,760,0],[-730,760,-575]];
  const headSweeps=[];
  for(let i=1;i<moves.length;i++)for(const[id,b]of Object.entries(fixed))
    headSweeps.push({stage:i,id,gapMM:boxesGap(swept(head,moves[i-1],moves[i]),b)});
  const h0Shoulder=[10800,1725,1450],h0Grip=[10860,1375,1500];
  const receiver=[11045,925,0,400,400,75],receiverChecks=Object.entries(obstacles).map(([id,b])=>({id,gapMM:boxesGap(receiver,b)}));
  const drainShoulder=[10950,1725,500];
  const drains=utilityDrains.map(d=>{
    const [x,y,z]=d.valve,box=[x-25,y-25,z-40,50,70,80],hand=[x,y+85,z];
    const teeBox=[d.tee[0]-25,d.tee[1]-25,d.tee[2]-25,50,50,50];
    const clearance=Object.entries({...obstacles,...utilityReaction}).map(([id,b])=>({id,
      pipeMM:segmentBoxDistance(d.tee,d.spout,b)-15,bodyMM:boxesGap(box,b),teeMM:boxesGap(teeBox,b),
      handMM:segmentBoxDistance(hand,hand,b)-40,armMM:segmentBoxDistance(drainShoulder,hand,b)-40}));
    return {...d,body:box,teeBody:teeBox,hand,shoulder:drainShoulder,
      reachMM:Math.hypot(...hand.map((v,i)=>v-drainShoulder[i])),clearance,
      outletToReceiverLipMM:d.spout[2]-receiver[5],
      teeScope:'The final elbow becomes an explicitly bounded three-port fitting. Its50mm box includes the feed turn and downward drain; no fictitious takeoff from a fillet vertex is assumed.'};
  });
  const insertion=swept(receiver,[0,525,0],[0,0,0]);
  const insertionGap=Math.min(...Object.values(obstacles).map(b=>boxesGap(insertion,b)));
  const h0Clearance=Object.entries(obstacles).map(([id,b])=>({id,handMM:segmentBoxDistance(h0Grip,h0Grip,b)-40,
    armMM:segmentBoxDistance(h0Shoulder,h0Grip,b)-40}));
  const reactionClearances=Object.entries(utilityReaction).flatMap(([id,b])=>Object.entries(obstacles)
    .filter(([name])=>!(id==='rackLink'&&['rackPost','middle pipe arm return'].includes(name)))
    .map(([obstacle,box])=>({id,obstacle,gapMM:boxesGap(b,box)}))).sort((a,b)=>a.gapMM-b.gapMM);
  const reactionI=(30*40**3-24*34**3)/12,reactionW=reactionI/20;
  return {status:'REFERENCE_ASSEMBLY',completeTerminalR:r,bendRadius:25,vertices:terminalVertices,
    pipeClearances,hotColdWasherGapMM:pair('hotSink','coldWasher'),hotColdSinkGapMM:pair('hotSink','coldSink'),
    wasteGapsMM:Object.fromEntries(Object.entries(routes).map(([id,route])=>[id,pathSeparation(route.path,waste)-50-route.hausdorffError])),
    breaks:utilityBreaks,unionMadeZ:[565,625],nutBackoffMM:60,headLiftToFullClearance:375,
    reactionSupport:{solids:utilityReaction,minimumNonContact:reactionClearances.slice(0,5),contact:'Each open key bears on its own lower union hex. The central shaped opening is occupied by the matched union, not a solid plate through a pipe. Fit and rate both contact faces; no torque through the sink top or unsupported copper.',
      keyMaximumTop:577,rotatingSpannerUnderside:608.6,verticalKeyToolGapMM:31.6,
      rackConnection:'The rackLink ends exactly atY1165 and meets the post and existing middle-arm return on their south face. They share a bolted/welded connection territory, not overlapping independent solids. The existing rack must receive the added force/torque.',
      preliminaryForceCase:{sectionMM:[30,40,3],secondMomentMM4:reactionI,sectionModulusMM3:reactionW,
        modulusNmm2:190000,minimumProofStressNmm2:150,verticalForceN:250,maximumTorqueNm:50,maximumCantileverMM:460,
        combinedBendingStressNmm2:(250*460+50000)/reactionW,tipDeflectionMM:250*460**3/(3*190000*reactionI),
        basis:'Authored conservative250N vertical plus50Nm wrench comparison; steel properties are minimum design inputs, not an identified product certificate. Qualify actual torsion, welds, keyed contact and rack/anchor load path before this service method is issued.'},
      loadPath:'Union body → removable open reaction key → front cantilever → common cross rail → existing independent rear rack. Remove lower feed/reaction assembly before underframe retirement; upper caps and H0 remain.'},
    tool:{body:[10925,1725,300],shoulder,toolLength,headWidth:71.5,thickness:12.8,toolZ,handR:50,armR:40,
      angularStepDeg:step,angularPenaltyMM:angularPenalty,checks:toolChecks,
      scope:'One rotating spanner and hand; positive independently fixed reaction keys replace an unproved simultaneous second handheld spanner. Actual hex fit, torque and captive-nut stroke remain matched-component qualifications.'},
    hotIsolation:{...utilityH0,shoulder:h0Shoulder,handCentre:h0Grip,handR:40,reachMM:Math.hypot(...h0Grip.map((v,i)=>v-h0Shoulder[i])),
      handToOwnPipeMM:h0Grip[1]-1250-37-40,
      fixedObjectClearances:h0Clearance,
      scope:'H0 stops the hot lower branch independently of the cold U0 lobby cut. Replacing H0 itself requires upstream domestic-store isolation and controlled inventory discharge, not merely closing H0.'},
    head:{centre:[11235,1040],plan:[610,610],retainedBelowRim:350,aboveRim:350,completeHeight:700,
      inheritedUnderhang:250,raised:head,moves,minimumSweeps:headSweeps.sort((a,b)=>a.gapMM-b.gapMM).slice(0,8),
      receiver:{plan:[10170,1465,670,670],rim:700,lowestRetainedPart:350,railWidth:15,outerInset:10,clearWidth:550,maximumLowerBodyWidth:530,
        scope:'The530 limit is transverse between two longitudinal rails, not a square throat. Keep cross-bracing below the350 lowest-part plane, with25 clear; locate actual upper lands and anti-tip capture before crew release.'},
      pickup:'Keep the existing four-legged frame on its seats. Capture the complete top independently against fall and pitch before the four head screws release. Head feet/fasteners/pickup remain IAS occurrence qualifications; this change provides reachable pipe breaks and a larger explicit moving package.'},
    controlledDrain:{receiver,requiredNetLitres:10,grossCuboidUpperLitres:12,minimumFixedGapMM:Math.min(...receiverChecks.map(v=>v.gapMM)),
      drains,receiverInsertion:[receiver.map((v,i)=>i===1?v+525:v),receiver],receiverInsertionMinimumMM:insertionGap,
      maximumControlledFlowLitresMinute:2,maximumBatchLitres:5,requiredFreeboardLitres:5,
      method:'Before first nut release, close U0 and H0, prove stopped/zero-pressure flow and vent locally. Drain one isolated branch at a time through its capped, independently supported local drain into this removable floor receiver. Close the drain before emptying; retain the normal2L witness as a different duty.',
      noCredit:'No unattended burst capture, automatic response, electrical safety certification or draining of the domestic vessel into10L.'}};
}
