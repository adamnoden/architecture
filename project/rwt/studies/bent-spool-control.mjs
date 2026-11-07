/** ONE one-ended native bent-spool control. Exact angular extrema of enclosing solids, not endpoint sampling. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readSelected} from './selected-water-event.mjs';
const g=9.81,pi=Math.PI;
const add=(a,b,k=1)=>a.map((x,i)=>x+k*b[i]);
const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const corners=b=>[0,1].flatMap(i=>[0,1].flatMap(j=>[0,1].map(k=>[b[0]+i*b[3],b[1]+j*b[4],b[2]+k*b[5]])));
// Rodrigues p(phi)=A+B*cos(phi)+C*sin(phi). All stationary points and endpoints are enumerated.
export function trigRange(A,B,C){
 const candidates=[0,pi/2],t=Math.atan2(C,B);
 for(let k=-2;k<=2;k++){const q=t+k*pi;if(q>0&&q<pi/2)candidates.push(q);}
 const values=candidates.map(phi=>({phi,value:A+B*Math.cos(phi)+C*Math.sin(phi)}));
 return {min:values.reduce((a,b)=>a.value<b.value?a:b),max:values.reduce((a,b)=>a.value>b.value?a:b)};
}
function coefficients(p,anchor,n){
 const r=p.map((x,i)=>x-anchor[i]),parallel=n.map(x=>x*dot(r,n));
 return {A:add(anchor,parallel),B:r.map((x,i)=>x-parallel[i]),C:cross(n,r)};
}
function boundsAt(vertices,anchor,n,phi,drop){
 const points=vertices.map(p=>{const a=coefficients(p,anchor,n);return a.A.map((x,i)=>x+a.B[i]*Math.cos(phi)+a.C[i]*Math.sin(phi)-(i===2?drop:0));});
 return [0,1,2].map(i=>[Math.min(...points.map(p=>p[i])),Math.max(...points.map(p=>p[i]))]);
}
function completeSweep(vertices,anchor,n,drop,tolerance){
 return [0,1,2].map(i=>{
  const ranges=vertices.map((p,index)=>{const a=coefficients(p,anchor,n);return {index,...trigRange(a.A[i]-(i===2?drop:0),a.B[i],a.C[i])};}),
   min=ranges.reduce((a,b)=>a.min.value<b.min.value?a:b),max=ranges.reduce((a,b)=>a.max.value>b.max.value?a:b);
  return {axis:['X','Y','Z'][i],minimum:min.min.value-tolerance,maximum:max.max.value+tolerance,
   minimumAtDegrees:min.min.phi*180/pi,maximumAtDegrees:max.max.phi*180/pi,minimumVertex:min.index,maximumVertex:max.index};
 });
}

function verticalJointReference(flange,inletCorner,n,v,{northFacing=false,body=[7000,6525],pan=[6430,6850,305,550],swap=false}={}){
 const u=[0,1,0],panUnderside=-205,poses=[];
 const delta=[flange[0]-body[0],flange[1]-body[1]],len=Math.hypot(...delta),forward=northFacing?[0,1]:delta.map(x=>x/len),side=[forward[1],-forward[0]];
 const segmentDistance=(p,a,b)=>{const d=b.map((x,i)=>x-a[i]),t=Math.max(0,Math.min(1,dot(p.map((x,i)=>x-a[i]),d)/dot(d,d)));return Math.hypot(...p.map((x,i)=>x-a[i]-t*d[i]));};
 const triangleDistance=(a,b)=>a>=0&&b>=0&&a+b<=303?0:Math.min(segmentDistance([a,b],[0,0],[303,0]),segmentDistance([a,b],[303,0],[0,303]),segmentDistance([a,b],[0,303],[0,0]));
 function pose(clock,bolt,z,upper){
  const beta=(clock+bolt*45)*pi/180,head=add(add(add(flange,n,120*Math.cos(beta)),u,120*Math.sin(beta)),v,upper?100:-38),
   shoulder=[body[0]+75*forward[0]+(upper?150:-150)*(swap?-1:1)*side[0],body[1]+75*forward[1]+(upper?150:-150)*(swap?-1:1)*side[1],z],L=upper?511:405.5,working=upper?450:350,headRadius=upper?25:21.5;
  let best=null;
  for(let angle=0;angle<360;angle++){
   let valid=true,reach=0,minCurve=Infinity,minPan=Infinity,minStem=Infinity;
   for(let step=0;step<=(upper?16:0)&&valid;step++){
    const a=(angle+(upper?-5.625+11.25*step/16:0))*pi/180,
     direction=n.map((x,i)=>(upper?1:Math.cos(pi/12))*(x*Math.cos(a)+u[i]*Math.sin(a))-(upper?0:Math.sin(pi/12))*v[i]),
     grip=add(head,direction,working),tail=add(head,direction,L);
    reach=Math.max(reach,Math.hypot(...grip.map((x,i)=>x-shoulder[i])));
    if(tail[0]<6145||tail[0]>7630||tail[1]<6220||tail[1]>7380||tail[2]-50<-800){valid=false;break;}
    for(let j=0;j<=24;j++){
     const p=add(head,direction,L*j/24),r=p.map((x,i)=>x-flange[i]),along=dot(r,v),radial=Math.hypot(...r.map((x,i)=>x-along*v[i])),
      stem=radial-85-(j===0?headRadius:12)-5;
     minStem=Math.min(minStem,stem);if(stem<0){valid=false;break;}
     const toolR=j===0?headRadius:12;
     if(p[0]>pan[0]-toolR&&p[0]<pan[0]+pan[2]+toolR&&p[1]>pan[1]-toolR&&p[1]<pan[1]+pan[3]+toolR){
      const gap=panUnderside-(p[2]+toolR+5);minPan=Math.min(minPan,gap);if(gap<0){valid=false;break;}
     }
     const q=p.map((x,i)=>x-inletCorner[i]),aLocal=dot(q,n),bLocal=dot(q,v),y=dot(q,u);
     if(bLocal<=303+2){
      const gap=Math.hypot(triangleDistance(aLocal,bLocal),y)-85-toolR-5;
      minCurve=Math.min(minCurve,gap);if(gap<0){valid=false;break;}
     }
    }
   }
   if(valid&&(!best||reach<best.maximumHandReach))best={head,shoulder,handleAngle:angle,maximumHandReach:reach,
    minimumStraightStemReserve:minStem,minimumPanReserve:Number.isFinite(minPan)?minPan:null,
    minimumConditionalCurveReserve:Number.isFinite(minCurve)?minCurve:null};
  }
  return best;
 }
 for(let clock=20.5;clock<=24.5;clock++)for(let bolt=0;bolt<8;bolt++){
  let best=null;for(const z of[-150,50]){const upper=pose(clock,bolt,z,true),counter=pose(clock,bolt,z,false);
   if(upper&&counter){const reach=Math.max(upper.maximumHandReach,counter.maximumHandReach);if(!best||reach<best.maximumHandReach)best={clock,bolt,shoulderZ:z,maximumHandReach:reach,upper,counter};}}
  poses.push(best??{clock,bolt,failed:true,maximumHandReach:null});
 }
 const finite=poses.filter(x=>!x.failed),worst=finite.reduce((a,b)=>!a||b.maximumHandReach>a.maximumHandReach?b:a,null);
 return {tools:{upper:'HAZET916GL +900-30 for initial torque/break only',counter:'HAZET600N-30',
   sources:['https://www.hazet.de/en/products/hand-tools/nut-driver/operating-tool-nut-driver/product/ean-4000896202485',
    'https://www.hazet.de/en/products/hand-tools/wrenches/combination-wrench/product/ean-4000896023233',
    'https://www.hazet.de/en/products/hand-tools/nut-driver/socket/product/ean-4000896042937'],
   counterNative:{length:405.5,ringThickness:17.5,openThickness:12.2,ringWidth:43,openWidth:63,headAngle:15,massKg:.59},
   counterHandleDirection:'DOWN15degrees to avoid climbing into the lower flange; actual shank/box-head transition remains required.',
   activeStroke:11.25,counterStroke:0,workingGrip:[450,350],handAt200NmN:[200/.45,200/(.35*Math.cos(pi/12))]},
  operator:{centre:body,radius:300,platform:-800,shouldersAboveFloor:[650,850],breadth:300,forwardOffset:75,
   forwardDirection:forward,handAssignment:swap?'upperLEFT/counterRIGHT':'upperRIGHT/counterLEFT',facing:northFacing?'North-facing reference':'Face actual inlet flange from the same R300 station; not a changed floor/body envelope',
   role:'One common posture per bolt; actual hand/head/torso, knee support, bracing and tool installation/removal still require proof.'},
  referenceClock:[20.5,24.5],nominalClock:22.5,assumedPCD:240,assumedHole:22,
  curveBound:{accepted:false,
   statement:'Conditional convex90centreline envelope inside the triangle joining theoretical corner and both303port centres, expanded85mm; cap at actual upper endfeed face. Uses NO inventedR300radius. Family diagram supports the convex form;159may be fabricated, so specific delivered full body MUST be shown inside this bound before use.',
   limit:'This narrower TOOL bound is NOT asserted as native measured evidence. Complete460boxes still govern continuous roll. Actual fabricated bend outside the tool bound invalidates these poses.'},
  retainedPan:pan,maximumPanUnderside:panUnderside,minimumLocalBottomThickness:3,
  fastenerSequence:{project:'M20×80,30AF,25each flange/3washers/16nut reference; exact native hole/bolt/gasket stack remains unqualified',
   head:'HEADS TOP, nuts below. Counter-spanner retains nut; remove full ratchet after breaking preload, before bolt rises into pan. Use compact socket/ring for subsequent low-torque turns.',
   boltRetreat:62,retreatRole:'Retain each bolt in upper fixed assembly; lower end must clear moving face by10 before any drop. Capture actual nuts/gasket; no dropped pieces or hand under unsupported pipe.',
   topSocketAtRetreatMaximumZ:flange[2]+78+62+2,
   minimumPanGapAtRetreat:panUnderside-(flange[2]+78+62+2),
   acceptance:false},
  sampledPoses:poses,geometryFailures:poses.length-finite.length,maximumReferenceHandReach:worst?.maximumHandReach??null,worstPose:worst,
  installedMethodAccepted:false,torqueAccepted:false,wholeDeliveredBodyAccepted:false};
}

// Dedicated finite CG domain for this bent-spool assembly. Each bounded water inventory may be partial/asymmetric.
function bentSpoolCgDomain({metals,water,hardwareBudgetKg,hardwareX,liftX,cradleX,translation}){
 const reactions={lift:[[Infinity,-Infinity],[Infinity,-Infinity]],cradle:[[Infinity,-Infinity],[Infinity,-Infinity]]};
 let minimum=null,maximum=null,count=0,minMass=Infinity,maxMass=-Infinity;
 for(let mask=0;mask<2**water.length;mask++)for(const hardware of[{mass:0,x:hardwareX[0]},{mass:hardwareBudgetKg,x:hardwareX[0]},{mass:hardwareBudgetKg,x:hardwareX[1]}])for(const side of[0,1]){
  const inventory=water.map((c,i)=>({id:c.id,massKg:mask&(1<<i)?c.maximumKg:0,x:c.x[side]})),
   mass=metals.reduce((a,c)=>a+c.massKg,0)+inventory.reduce((a,c)=>a+c.massKg,0)+hardware.mass,
   moment=metals.reduce((a,c)=>a+c.massKg*c.x[side],0)+inventory.reduce((a,c)=>a+c.massKg*c.x,0)+hardware.mass*hardware.x,
   cg=moment/mass,state={mask,positionSide:side===0?'minimumX':'maximumX',massKg:mass,localCgX:cg,hardware,water:inventory};
  count++;minMass=Math.min(minMass,mass);maxMass=Math.max(maxMass,mass);
  if(!minimum||cg<minimum.localCgX)minimum=state;if(!maximum||cg>maximum.localCgX)maximum=state;
  for(const[id,points]of[['lift',liftX],['cradle',cradleX.map(x=>x-translation)]]){
   const r=[g/1000*(points[1]*mass-moment)/(points[1]-points[0]),g/1000*(moment-points[0]*mass)/(points[1]-points[0])];
   r.forEach((value,i)=>{reactions[id][i][0]=Math.min(reactions[id][i][0],value);reactions[id][i][1]=Math.max(reactions[id][i][1],value);});
  }
 }
 const localX=[minimum.localCgX,maximum.localCgX],parkedX=localX.map(x=>x+translation);
 return {domain:'NOMINAL-METAL / independently variable water and hardware budget; NOT an actual delivered-kit upper bound',
  proof:'Straight water is partitioned at the actual7350/9300/10850/12400 capture/support stations into five disjoint axial reaches. Each reach, stub and each bend may hold ANY mass0..its full nominal volume at ANY X within its complete allowed bounds. For fixed other variables, CG is fractional-linear in each mass and monotone in each X, with a strictly positive fixed metal mass. Therefore mass endpoints0/full and location endpoints bound EVERY partial/asymmetric state. All positions at their minimum/maximum simultaneously bound the corresponding CG direction; both hardware endpoints and0/max mass are enumerated. Reactions are affine in masses/moments, so these same endpoint cases bound their ranges.',
  cases:count,metalComponents:metals,waterComponents:water,hardwareBudgetKg,hardwareX,nominalModelMassRangeKg:[minMass,maxMass],minimumState:minimum,maximumState:maximum,
  localX,parkedX,liftingPointLocalX:liftX,liftingPointWorldX:liftX.map(x=>x+translation),
  liftMinimumCgReserve:Math.min(localX[0]-liftX[0],liftX[1]-localX[1]),
  lowerCradleMinimumCgReserve:Math.min(parkedX[0]-cradleX[0],cradleX[1]-parkedX[1]),
  liftReactionRangesKn:reactions.lift,lowerCradleReactionRangesKn:reactions.cradle,
  reactionsRole:'Correlated nominal gravity-only endpoint cases, not independent simultaneous maxima or actual rigging/hoist/rail/contact acceptance.',
  deliveredMassBoundEstablished:false,actualKitCgAccepted:false};
}

export function bentSpool({installedAxisZ=-775,initialDrop=40,lockPlayDegrees=[]}={}){
 const s=readSelected(),slope=50/4250,theta=Math.atan(slope),n=[Math.cos(theta),0,-Math.sin(theta)],v=[Math.sin(theta),0,Math.cos(theta)],u=[0,1,0],
  anchor=[7350,6950,installedAxisZ],axis=x=>anchor[2]-(x-anchor[0])*slope,
  inletCorner=[6875,6950,axis(6875)],outletCorner=[12950,6950,axis(12950)],
  inletPort=add(inletCorner,v,303),horizontalIn=add(inletCorner,n,303),horizontalOut=add(outletCorner,n,-303),freeOutlet=add(outletCorner,v,-303),
  flangeZ=-380,flange=add(inletCorner,v,(flangeZ-inletCorner[2])/v[2]),collector=add(inletCorner,v,(-200-inletCorner[2])/v[2]),
  fixedFlangeAxial=25,movingFlangeAxial=25,R=142.5,tolerance=5,drop=initialDrop;
 const inletBox=[inletCorner[0]-85,6855,inletCorner[2]-85,460,190,460],outletBox=[12575,6855,outletCorner[2]-375,460,190,460];
 // The orthogonal prism encloses every point of the complete285OD/25axial moving disc.
 // Retain the overbound: no use of a too-small two-dimensional flange projection.
 const flangePrism=[-R,R].flatMap(a=>[-R,R].flatMap(b=>[-movingFlangeAxial,0].map(c=>add(add(add(flange,n,a),u,b),v,c))));
 const solids=[{id:'native-inlet460box',vertices:corners(inletBox)},{id:'native-outlet460box',vertices:corners(outletBox)},
  {id:'complete-moving285flange-prism',vertices:flangePrism},
  {id:'straight-tube-conservative160square',vertices:[horizontalIn,horizontalOut].flatMap(p=>[-79.95,79.95].flatMap(a=>[-79.95,79.95].map(b=>add(add(p,u,a),v,b))))}];
 const sweeps=solids.map(o=>({id:o.id,angular:completeSweep(o.vertices,anchor,n,drop,tolerance),
  start:boundsAt(o.vertices,anchor,n,0,drop),rolled:boundsAt(o.vertices,anchor,n,pi/2,drop)}));
 const downSweep=sweeps.find(x=>x.id==='native-outlet460box'),flangeSweep=sweeps.find(x=>x.id==='complete-moving285flange-prism');
 const allRolled=solids.flatMap(o=>o.vertices.map(p=>{const a=coefficients(p,anchor,n);return a.A.map((x,i)=>x+a.C[i]-(i===2?drop:0));})),
  xMin=Math.min(...allRolled.map(p=>p[0]))-tolerance,xMax=Math.max(...allRolled.map(p=>p[0]))+tolerance,
  wholeMinimumX=Math.min(xMin,7300-tolerance),wholeMaximumX=Math.max(xMax,12450+tolerance),
  translation=12250-wholeMinimumX,parkEnd=wholeMaximumX+translation,stageLength=Math.ceil((parkEnd-12250+200)/100)*100,deckEnd=12250+stageLength;
 const structural=JSON.parse(fs.readFileSync('project/str/studies/current-house-occupied-interfaces.json','utf8')),
  spans=structural.aboveBridgeCarrier.profiles[0].sections.map(x=>({id:x.beam,x:x.xFaces,underside:-630}));
 const bridgeCases=spans.map(b=>{
  const entries=allRolled.filter(p=>p[0]<=b.x[1]).map(p=>{
   const draw=Math.max(0,b.x[0]-p[0]),x=p[0]+draw;
   return {draw,x,z:p[2]-draw*slope,clearance:b.underside-(p[2]-draw*slope)-tolerance};
  }).filter(p=>p.x>=b.x[0]&&p.x<=b.x[1]);
  return {...b,minimumClearance:Math.min(...entries.map(x=>x.clearance)),governing:entries.reduce((a,b)=>a.clearance<b.clearance?a:b)};
 });
 // Every point in a convex prism moves at most the chord of its largest
 // vertex radius. Bound that displacement in X and Z throughout lock play.
 const lockCases=lockPlayDegrees.map(play=>{
  assert(Number.isFinite(play)&&play>=0&&play<=90);
  const allowance=tolerance+5;
  const bounds=solids.map(({id,vertices})=>{
   const coeff=vertices.map(p=>coefficients(p,anchor,n));
   const radius=Math.max(...coeff.map(c=>Math.hypot(...c.B)));
   const chord=2*radius*Math.sin(play*pi/360);
   const rolled=coeff.map(c=>c.A.map((a,i)=>a+c.C[i]-(i===2?drop:0)));
   return {id,chord,xMin:Math.min(...rolled.map(p=>p[0])),xMax:Math.max(...rolled.map(p=>p[0])),
    crown:Math.max(...rolled.map(p=>p[2])),intercept:Math.max(...rolled.map(p=>p[2]+slope*p[0]))};
  });
  return {playDegrees:play,allowancePerCoordinateMm:allowance,
   bridges:spans.map(bridge=>{
    const entries=bounds.flatMap(b=>{
     const margin=b.chord+allowance;
     if(b.xMax+margin+translation<bridge.x[0]||b.xMin-margin>bridge.x[1])return [];
     // Along the falling track z + slope*x is invariant. Both its maximum
     // and the untranslated crown bound the whole prism for every draw.
     const crown=Math.min(b.crown+margin,b.intercept+margin*(1+slope)-slope*bridge.x[0]);
     return [{body:b.id,chordMm:b.chord,clearance:bridge.underside-crown}];
    });
    const governing=entries.reduce((a,b)=>a.clearance<b.clearance?a:b);
    return {id:bridge.id,minimumClearance:governing.clearance,governing,eligibleBodies:entries.map(e=>e.body)};
   })};
 });
 const portDistance=(horizontalOut[0]-horizontalIn[0])/n[0],socketEngagement=303-272,
  straightCut=portDistance+2*socketEngagement,upperStubPortToFace=(flangeZ-inletPort[2])/v[2],
  copperPerM=8960*pi/4*(.159**2-.155**2),waterPerM=1000*pi*.155**2/4,
  upperStubMaximumCut=upperStubPortToFace+31+25,
  tubeMetal=(straightCut+upperStubMaximumCut)/1000*copperPerM,tubeWater=(straightCut+upperStubMaximumCut)/1000*waterPerM,
  bendsMetal=2*6.15,bendsWaterGrossBound=2*.380*.170*.380*1000,movingFlange=7,
  spoolWetBound=tubeMetal+tubeWater+bendsMetal+bendsWaterGrossBound+movingFlange;
 const frameLength=5150,frameStart=7300,frameEnd=frameStart+frameLength,steelDensity=8000,
  rhsArea=80*40-72*32,frameMetal=rhsArea*(2*frameLength+4*750)/1e9*steelDensity,
  designMovingKn=4.5,remainingHardwareKg=designMovingKn*1000/g-spoolWetBound-frameMetal,
  wheelStations=[7750,9300,10850,12400],maxInternalSpan=1550;
 const deformation=5,fieldY=[6425,7375],bridgeWest=spans[0].x[0],bridgeEast=spans.at(-1).x[1],
  gated=sweeps.map(o=>({id:o.id,completeX:[o.angular[0].minimum,o.angular[0].maximum],
   outsideEveryBridgeWhileRolling:o.angular[0].maximum<bridgeWest||o.angular[0].minimum>bridgeEast,
   locked90Y:[o.rolled[1][0]-tolerance-deformation,o.rolled[1][1]+tolerance+deformation]})),
  frameY=[6475-tolerance-deformation,7325+tolerance+deformation],
  lockedSouth=Math.min(...gated.map(o=>o.locked90Y[0]),frameY[0])-fieldY[0],
  lockedNorth=fieldY[1]-Math.max(...gated.map(o=>o.locked90Y[1]),frameY[1]);
 const hardwareMinimum=wholeMinimumX,hardwareMaximum=wholeMaximumX,straightWet=straightCut/1000*(copperPerM+waterPerM),
  stubWet=upperStubMaximumCut/1000*(copperPerM+waterPerM),bendWetEach=(bendsMetal+bendsWaterGrossBound)/2,
  frameRailMass=rhsArea*(2*frameLength)/1e9*steelDensity,frameCrossMass=frameMetal-frameRailMass,
  knownMomentMin=straightWet*(horizontalIn[0]+horizontalOut[0])/2+stubWet*flange[0]+bendWetEach*(inletBox[0]+outletBox[0])+movingFlange*flange[0]+frameRailMass*(frameStart+frameEnd)/2+frameCrossMass*wheelStations.reduce((a,b)=>a+b,0)/4,
  knownMomentMax=knownMomentMin+bendWetEach*(inletBox[3]+outletBox[3]),packageMass=designMovingKn*1000/g,
  cgMin=(knownMomentMin+remainingHardwareKg*hardwareMinimum)/packageMass,
  cgMax=(knownMomentMax+remainingHardwareKg*hardwareMaximum)/packageMass,
  parkedCg=[cgMin+translation,cgMax+translation],cradles=[12900,17800],liftPoints=[7900+translation,11600+translation],
  misplacedDraw=1100;
 const straightStartX=horizontalIn[0]-socketEngagement*n[0],straightEndX=horizontalOut[0]+socketEngagement*n[0],
  straightBreaks=[straightStartX,7350,9300,10850,12400,straightEndX],positionEnvelope=tolerance+deformation,
  straightWater=straightBreaks.slice(1).map((hi,i)=>({id:`straight-water-reach${i+1}`,axisX:[straightBreaks[i],hi],
   maximumKg:(hi-straightBreaks[i])/n[0]/1000*waterPerM,
   x:[straightBreaks[i]-79.95*Math.abs(v[0])-positionEnvelope,hi+79.95*Math.abs(v[0])+positionEnvelope]})),
  stubVertices=[add(inletPort,v,-31),add(flange,v,25)].flatMap(p=>[-79.95,79.95].flatMap(a=>[-79.95,79.95].map(b=>add(add(p,n,a),u,b)))),
  stubSweep=completeSweep(stubVertices,anchor,n,drop,tolerance)[0],stubX=[stubSweep.minimum-deformation,stubSweep.maximum+deformation],
  angularX=id=>{const q=sweeps.find(x=>x.id===id).angular[0];return[q.minimum-deformation,q.maximum+deformation];},
  metalComponents=[{id:'nominal-uniform-straight-tube',massKg:straightCut/1000*copperPerM,x:[(straightStartX+straightEndX)/2-positionEnvelope,(straightStartX+straightEndX)/2+positionEnvelope]},
   {id:'nominal-stub',massKg:upperStubMaximumCut/1000*copperPerM,x:stubX},
   {id:'catalogue-inlet-bend',massKg:bendsMetal/2,x:angularX('native-inlet460box')},
   {id:'catalogue-outlet-bend',massKg:bendsMetal/2,x:angularX('native-outlet460box')},
   {id:'nominal-moving-flange',massKg:movingFlange,x:angularX('complete-moving285flange-prism')},
   {id:'nominal-uniform-frame-rails',massKg:frameRailMass,x:[(frameStart+frameEnd)/2-positionEnvelope,(frameStart+frameEnd)/2+positionEnvelope]},
   {id:'nominal-frame-crossmembers',massKg:frameCrossMass,x:[wheelStations.reduce((a,b)=>a+b,0)/4-positionEnvelope,wheelStations.reduce((a,b)=>a+b,0)/4+positionEnvelope]}],
  waterComponents=[...straightWater,{id:'stub-water',maximumKg:upperStubMaximumCut/1000*waterPerM,x:stubX},
   {id:'inlet-bend-water',maximumKg:bendsWaterGrossBound/2,x:angularX('native-inlet460box')},
   {id:'outlet-bend-water',maximumKg:bendsWaterGrossBound/2,x:angularX('native-outlet460box')}],
  cgDomain=bentSpoolCgDomain({metals:metalComponents,water:waterComponents,hardwareBudgetKg:remainingHardwareKg,
   hardwareX:[hardwareMinimum-deformation,hardwareMaximum+deformation],liftX:[7900,11600],cradleX:cradles,translation}),
  straightWaterKg=straightCut/1000*waterPerM,stubWaterKg=upperStubMaximumCut/1000*waterPerM,
  oldWaterMomentMin=straightWaterKg*(horizontalIn[0]+horizontalOut[0])/2+stubWaterKg*flange[0]+bendsWaterGrossBound/2*(inletBox[0]+outletBox[0]),
  oldWaterMomentMax=oldWaterMomentMin+bendsWaterGrossBound/2*(inletBox[3]+outletBox[3]),
  oldDryMass=spoolWetBound+frameMetal-tubeWater-bendsWaterGrossBound+remainingHardwareKg,
  oldDryX=[(knownMomentMin-oldWaterMomentMin+remainingHardwareKg*hardwareMinimum)/oldDryMass,
   (knownMomentMax-oldWaterMomentMax+remainingHardwareKg*hardwareMaximum)/oldDryMass];
 const postSources=s.model.renewal.joint.railReference;
 const lockedAllY=[Math.min(...gated.map(o=>o.locked90Y[0]),frameY[0]),Math.max(...gated.map(o=>o.locked90Y[1]),frameY[1],7300+25+tolerance+deformation)];
 const oldCorner=[6575,6950,axis(6575)],oldFlange=add(oldCorner,v,(flangeZ-oldCorner[2])/v[2]),
  oldFacing=verticalJointReference(oldFlange,oldCorner,n,v),
  oldNorth=verticalJointReference(oldFlange,oldCorner,n,v,{northFacing:true}),
  stations=[[6455,6520],[7270,6520]],pan=[6735,6850,305,550],
  stationRuns=stations.flatMap(body=>[false,true].map(swap=>verticalJointReference(flange,inletCorner,n,v,{northFacing:true,body,pan,swap}))),
  poses=stationRuns[0].sampledPoses.map((_,i)=>stationRuns.map(r=>({...r.sampledPoses[i],operatorCentre:r.operator.centre,handAssignment:r.operator.handAssignment})).filter(p=>!p.failed).sort((a,b)=>a.maximumHandReach-b.maximumHandReach)[0]??{failed:true}),
  jointReference={...stationRuns[0],operator:{...stationRuns[0].operator,centre:null,stations,
   role:'ONE worker uses two sequential stations, changing hand assignment as recorded per bolt. Both hands share one posture/shoulder height per bolt. This is not two simultaneous crew or an inherited stationary reach pass.'},
   sampledPoses:poses,geometryFailures:poses.filter(p=>p.failed).length,
   maximumReferenceHandReach:Math.max(...poses.filter(p=>!p.failed).map(p=>p.maximumHandReach)),
   worstPose:poses.filter(p=>!p.failed).sort((a,b)=>b.maximumHandReach-a.maximumHandReach)[0],
   singleStationControls:stationRuns.map(r=>({operator:r.operator,maximumReferenceHandReach:r.maximumReferenceHandReach})),
   samplingBoundary:'Five clocks at1degree intervals,360 handle angles,17 active-stroke and25 shaft positions. This is a necessary finite reference; no continuous tool/body contact or real torque/posture proof is claimed.'};
 const oldRailWitness=[12750,6950,outletBox[2]],witness=oldRailWitness.map((_,i)=>{
  const c=coefficients(oldRailWitness,anchor,n),phi=65*pi/180;return c.A[i]+c.B[i]*Math.cos(phi)+c.C[i]*Math.sin(phi)-(i===2?drop:0);
 }),oldRailZ=[axis(witness[0])-210-drop,axis(witness[0])-130-drop];
 const frameRollProof={frameX:[frameStart,frameEnd],rigidAndDeformationPerFace:tolerance+deformation,
  inletCompleteXMaximum:Math.max(...gated.filter(x=>x.id.includes('inlet')||x.id.includes('flange')).map(x=>x.completeX[1])),
  outletCompleteXMinimum:downSweep.angular[0].minimum,
  inletEndGapAfterAdditionalFrameAndDeformation:frameStart-(tolerance+deformation)-Math.max(...gated.filter(x=>x.id.includes('inlet')||x.id.includes('flange')).map(x=>x.completeX[1])),
  outletEndGapAfterAdditionalFrameAndDeformation:downSweep.angular[0].minimum-(frameEnd+tolerance+deformation),
  role:'The full inlet/flange and outlet solids roll outside the entire carrierX interval. No rail or crossmember runs under either bending sweep; straight tube, actual collars/drive and support shapes remain separate joined-body duties.',
  rejectedLongFrame:{frameEnd:13100,northRailY:[7285,7325],pointInsideRequiredOutletBound:oldRailWitness,angleDegrees:65,rolledPoint:witness,railZ:oldRailZ,
   collision:witness[0]>=7300&&witness[0]<=13100&&witness[1]>=7285&&witness[1]<=7325&&witness[2]>=oldRailZ[0]&&witness[2]<=oldRailZ[1],
   boundary:'A witness inside the required conservative full native-body envelope and the old rail. This rejects the old declared whole-solid control; it is not evidence that the measured delivered fitting occupies this corner.'},
  endCantilevers:{inletCollarX:7350,outletCollarX:12400,inletBodyMinimumX:inletBox[0],outletBodyMaximumX:outletBox[0]+outletBox[3],
   role:'Price the native wet bend/flange/stub moments and thin159×2tube/endfeed/braze/collar loads at these real end captures. Removing the obstructing rail does not qualify an unsupported native end.'},
  fullMethodAccepted:false};
 const route=[[7270,6520],[7270,6475],[6455,6475],[6455,6520]],bodyRadius=300,
  routeBounds=[Math.min(...route.map(p=>p[0]))-bodyRadius,Math.min(...route.map(p=>p[1]))-bodyRadius,
   Math.max(...route.map(p=>p[0]))+bodyRadius,Math.max(...route.map(p=>p[1]))+bodyRadius],
  flangePlanRadius=142.5,routeFlangeGap=6950-6475-bodyRadius-flangePlanRadius-tolerance;
 const template=s.model.model.maintenanceRainReference.eastMaintenance,oldRoofArea=template.roof.regions.reduce((a,p)=>a+p[2]*p[3]/1e6,0),
  addedRoofArea=2.325*.175;
 return {identity:'RWT-ONE-ENDED-FULL-NATIVE-BENT-SPOOL-2026-11-06',source:{hadBlob:s.blob,hadPath:s.path},
  recommendation:'Develop ONE vertical inlet disconnect and free native down-port, carrying both real bends with the tube. Price complete supported90roll and long export. No downstream joint/platform or trapped upturn is added.',
  selectedGeometryChanged:false,accepted:false,siteAccepted:false,physicalEventPerformed:false,
  geometry:{axisAnchor:anchor,fall:slope,inletCorner,inletPort,horizontalIn,horizontalOut,outletCorner,freeOutlet,
   flange,flangeNormal:v,collector,flangeFaceZ:flangeZ,portDistance,straightCut,stockLength:6000,stockReserve:6000-straightCut,
   upperStubMaximumCut,inletBox,outletBox,flangeOD:285,movingFlangeAxial,fixedFlangeAxial,
   freeOutletRole:'Native N18 open port is the terminal; no extra lower joint, no appended vertical pipe inherited from the old−1200 terminal. Exact delivered socket/open-edge geometry and splash/erosion remain required.',
   receiver:s.model.model.rwtReceivingInterface.east.receiverBounds,ordinaryWater:-1400,faultWater:-1250,
   nativeOutletAirGapOrdinary:freeOutlet[2]-(-1400),nativeOutletAirGapFault:freeOutlet[2]-(-1250),
   duringLoweredMaintenanceNativeGapFault:freeOutlet[2]-drop-(-1250)},
  verticalJointReference:jointReference,
  failedFixedStationControls:{originalFacing:{operator:oldFacing.operator,maximumReferenceHandReach:oldFacing.maximumReferenceHandReach,worstPose:oldFacing.worstPose},
   originalNorthFacing:{operator:oldNorth.operator,maximumReferenceHandReach:oldNorth.maximumReferenceHandReach,worstPose:oldNorth.worstPose},
   role:'The original inlet6575/fixed7000 station fails both facing references. Merely facing the flange is insufficient; the current ordinary layout really moves the inlet300east and pays two connected sequential crew stations.'},
  ...(lockCases.length?{lockCases}:{}),
  completeAngularProof:{method:'For each vertex of each full enclosing solid, each coordinate is A+Bcos(phi)+Csin(phi). Enumerate0/90and every interior stationary angle atan2(C,B)+k*pi. A linear coordinate reaches its extrema at a prism vertex. This proves the WHOLE CONTINUOUS0..90solid hull, not sparse angle samples.',
   angleDegrees:[0,90],rollDirection:'Inlet leg SOUTH, outlet leg NORTH',dropBeforeRoll:drop,toleranceEachFace:tolerance,
   toleranceRole:'Explicit5mm rigid-position/construction envelope. It is not a measured fabrication tolerance or an allowance for arbitrary support deflection.',
   sweeps,downstreamNorthReserve:7375-downSweep.angular[1].maximum,downstreamSouthReserve:downSweep.angular[1].minimum-6425,
   inletFlangeSouthReserve:flangeSweep.angular[1].minimum-6425,
   rootWarning:'Intermediate angles govern. The nominal native-outlet box peaks north at about76degrees; endpoint-only clearance is invalid.',bridgeCases},
  frameRollProof,
  spatialStateProof:{gated,fieldY,rigidEnvelope:tolerance,deformationEnvelope:deformation,
   role:'Bends/flange roll outside all actual bridge X for the ENTIRE angular interval. Only round tube and fixed carrier frame occupy the bridge during roll. Both ends enter supports only after positive90lock; constant950strip comparison above remains visible.',
   lockedTranslationMinimumSouthReserve:lockedSouth,lockedTranslationMinimumNorthReserve:lockedNorth,
   frameY,bridgeCasesAfterDeformation:bridgeCases.map(b=>({...b,minimumClearance:b.minimumClearance-deformation})),
   controls:{misplacedDraw,misplacedFlangeAllX:[flangeSweep.angular[0].minimum+misplacedDraw,flangeSweep.angular[0].maximum+misplacedDraw],
    misplacedWholeFlangeInsideCourtBeam:flangeSweep.angular[0].minimum+misplacedDraw>7650&&flangeSweep.angular[0].maximum+misplacedDraw<8250,
    unlockedFullRotationInPortalMaximumZ:flangeSweep.angular[2].maximum+deformation-misplacedDraw*slope,
    portalUnderside:-630,unlockedWouldHitBridge:flangeSweep.angular[2].maximum+deformation-misplacedDraw*slope>-630,
    fullAngularConstantStripAfterDeformation:7375-downSweep.angular[1].maximum-deformation,
    latterSatisfies25:7375-downSweep.angular[1].maximum-deformation>=25},
   locks:'Independent positive0/90locks at inlet-side and driven collars. Capture/verify BOTH90locks before draw; a drive brake alone cannot be treated as a rigid lock along the copper tube. Actual metal interlock prevents draw with unlocked/misplaced roll; it is not an operator reminder.'},
  renewal:{translation,rolledMinimumX:xMin,rolledMaximumX:xMax,wholePackageMinimumX:wholeMinimumX,wholePackageMaximumX:wholeMaximumX,
   park:[12250,parkEnd],stage:[12250,8100,stageLength,1200],
   requiredDeckEnd:deckEnd,originalSelectedDeckEnd:16200,extensionBeyondSelected:deckEnd-16200,
   stageGrowthBeyondOld4700Control:stageLength-4900,
   terminalReceiverOrdinaryDuringDraw:false,
   handling:'No worker occupies the receiving basin. Once captured, open native outlet moves WITH full spool; moving projection/residual discharge can leave the basin during renewal, so drain/isolate, positively cap/capture residual liquid BEFORE roll. Full wet mass remains charged despite this operation. Existing80catch is no full-event backup.',
   framing:'6600long reference includes full5150carrier, complete bends/flange and5mm envelope; the complete native bodies/flange now govern park; old frame rail through the outlet roll is rejected. Support as rare temporary work is permitted in principle, not automatically permanent-deck enlargement.',
   lowerCradleX:[12900,17800],liftingPointLocalX:[7900,11600],
   cgBound:{...cgDomain,
    rejectedFullWetOnlyGeneralBound:{nominalMassKg:packageMass,localX:[cgMin,cgMax],parkedX:parkedCg,
     rejection:'Full water is a mass maximum, NOT automatically a CG extreme. The same hardware budget with all tube/bend water removed already escapes both sides of this old interval; independently asymmetric/partial inventories govern the corrected domain.',
     dryCounterexample:{massKg:oldDryMass,localX:oldDryX},rejectedAsGeneralBound:true}},
   hoist:'Actual rated hoist/spreader/rigging must carry full package and complete3D incoming/outgoing envelope. Use explicit at-least7.5kN support-action screen for a5kN suspended load including rigging; no old5kN/1700lift pass is inherited. Outgoing leaves before incoming enters; no loaded upperbearers.',
   actualSupportsAndSiteAccepted:false,fullExportSweepAccepted:false},
  actualPostTranslation:{source:'HAD renewal.joint.railReference',supportX:postSources.supportX,sidePostY:postSources.sidePostY,
   actualPostSection:postSources.postSection,wholeLockedY:lockedAllY,
   minimumToSouthColumn:lockedAllY[0]-(6350+25),minimumToNorthColumn:(7450-25)-lockedAllY[1],
   includes13500:postSources.supportX.includes(13500),
   role:'Full translation invariant Y bound checks every actual50column including13500, separately from narrower RC node/bridge faces. Wheel is REMOVED before draw; otherwise its200radius can hit a post. Shaft25radius included. Real larger footings/connection plates are not silently reduced to50column.',
   anchorsAndFootingsAccepted:false},
  loads:{tubeMetalKg:tubeMetal,tubeWaterKg:tubeWater,twoCatalogueBendsMetalKg:bendsMetal,bendWaterGrossBoxBoundKg:bendsWaterGrossBound,
   movingFlangeKg:movingFlange,fixedUpperFlangeKg:7,nominalSpoolFullWaterKg:spoolWetBound,
   bendWaterBoundary:'Gross380×170×380 outer boxes bound water in the two real bends; deliberately loose, not a measured bore volume. No dry-only lifting assumption.',
   frame:{section:[80,40,4],length:frameLength,start:frameStart,end:frameEnd,grossY:[6475,7325],nominalBareKg:frameMetal,
    wheelStations,maxInternalSpan,westOverhang:wheelStations[0]-frameStart,pipeAxisAboveFrameTop:130,depth:80,
    boundary:'Four captured rolling supports plus fixed lower rails are separate real solids/load paths; these bare rails/crossmembers do not prove clamps, rotation bearings, wheels or guides.'},
   nominalFullWaterIncludingBareFrameKg:spoolWetBound+frameMetal,designMovingKn,remainingHardwareKg,
   supportReactionRequirement:{compressionEachKn:8.5,upliftEachKn:4.0,totalCorrelatedGravityKn:4.5,
    basis:'The preceding1350overhang8.5/4.0kN requirement is conservatively retained. The complete envelope now extends1024.17west of first wheel7750 and645.52east of last12400; a whole4.5kN tip load at the larger overhang gives7.473compression/2.973uplift at the adjacent1550pair. Actual pipe endfeed/bend and collar cantilevers are separate duties. These bounds cover even the whole design load at the adverse tip. These are correlated requirements, not34kN simultaneous gravity. Actual multi-contact/frame/rail elasticity still must be checked.'},
   massMeaning:{tube:'Nominal159OD/155ID uniform copper,8960kg/m3, source-authored cut/engagement budgets. No delivered wall/density/weight tolerance is established.',
    bendsAndFlange:'Catalogue/reference6.15kg per bend and7kg moving flange; actual delivered fabrication/composition/mass must be verified.',
    frame:'Nominal sharp-corner80×40×4 net area,8000kg/m3 and stated lengths; no delivered section tolerances, rounded-corner/weld/connection mass bound.',
    hardware:'remainingHardwareKg is the unweighed allowance within a4.5kN nominal full-water design model, not evidence that the actual required kit fits it.',
    actualKitUpperBoundEstablished:false,actualKitWeighed:false},
   capture:'Broad150long metal-lined split saddles isolate thin copper from point roller contact.220OD/170ID/40axial steel races; two50rollers per station; 0/90positive pins. Do not put loaded hard rollers or chain jaws directly on159×2copper and invent a denting pass.',
   rollTorqueRequirement:{workingNm:500,holdingNm:1000,manualRatio:60,handwheelRadiusMm:200,
    efficiencies:[.15,.25,.4].map(efficiency=>({efficiency,handForceN:500/(60*efficiency*.2)})),
    actualGearRated:false,actualHandAndRestraintAccepted:false},
   driveState:'Driven collar12400 is outside bridge and before outletbox12568. Vertical input atY7300 to+1250 stays clear of pipe/bend; removable200radius handwheel operates ABOVE1100guard from fixedNfield. Remove wheel before draw; shaft/collar stay outside all bridgeX throughout east translation. Operator does not follow into posts/rack.',
   upstreamLock:'Second independent collar lock near7350 must be positively operated/witnessed through a small retained low-force link from fixedcourt; do not substitute copper torsional stiffness or a downstream brake. Actual link/lock/interlock solids and operator sweep remain an internal exit.',
   supportHold:'Do not borrow the previous3kN/4700frame result. Actual complete1024.17west package overhang, bends/gross blocked water, four moving support reactions, fixed rail/post/drop-bracket/head reactions, deformation and all translated states must be priced against current STR. No imaginary post through RC.'},
  wellAndCrew:{oldWell:[6125,6300,1525,1100],proposedClearWell:[6125,6125,1525,1275],southWidening:175,
   rejected100Opening:{south:6200,bodySouthMinimum:routeBounds[1],intrusion:6200-routeBounds[1],role:'The original100south extension cannot contain the complete R300 route around the flange. It is rejected for this crew layout.'},
   existingFloor:-950,proposedCatchFloor:-1100,localLowering:150,crewPlatformLevel:-800,
   operatorCentres:stations,radius:bodyRadius,route,completeRouteBounds:routeBounds,
   routeProof:{method:'Each straight route segment swept by the R300 disc is a capsule. Axis-aligned extrema occur at its segment endpoints plus/minus300. The transverse segment has constantY6475 and spans the flangeX; its nearest disc-to-flange gap is475−300−142.5−5. The two short end segments remain farther away inX/Y.',
    minimumFlangePlanGapAfter5:routeFlangeGap,minimumSouthOpeningReserveAfter5:routeBounds[1]-6125-tolerance,
    minimumWestOpeningReserveAfter5:routeBounds[0]-6125-tolerance,
    retainedPanHeadPlanGapAfter5:6850-(6520+300)-tolerance,
    originalDirectCrossingWouldHit:6950-6520-bodyRadius-flangePlanRadius-tolerance<0,full3DPostureAccepted:false},
   retainedPanDuringFirstRelease:{module:3,plan:pan,status:'Fully seated and positively captured on qualified fixed seats; never suspended over the worker.',
    bodyPlanGap:6850-(6520+300),localBottomThicknessProposal:3,undersideClearanceControl:-205,
    reason:'Actual upper bolt/socket/withdrawal toolspace controls the underside; no unlocated stiffener, pressure/walking or delivered bend-body qualification is implied.'},
   platformPlan:[6250,6220,1150,600],
   platform:'ONE temporary1150×600 working platform at−800 connects both sequential crew stations and their south traverse. Feet are represented separately by a200square footprint; R300 is the larger body/head domain. Three independently supported/joined panels each1150/3×600 pass west650gate and weather entry with the smaller dimension across. Both bridles attach BY HAND while supported/occupied; capture each panel before releasing supports, exit, THEN lift. Full5kN/200square and5kPa loads/feet/joints/temporary support remain real. Remove before roll.',
   platformPanelPlan:[1150/3,600],platformAreaM2:1.15*.6,distributedLiveKn:1.15*.6*5,pointLoadKn:5,pointFootprint:[200,200],
   entry:'New near-vertical south service ladder, protected gate and actual enlarged upper opening; the old west4-rise stair under retained north covers is not inherited. Actual ladder/head/hand/tool handling remains to be joined.',
   head:'R300 head/body route stays south of retained pan3 and actual fixed upperfloor. Other nine covers/gutters and small seam piece leave before entry; pan3 remains until joint released and crew/platform exited. Full3D kneeling/bracing and tool installation/removal still require proof.',
   catchFloor:'Catch floor/tray is separate from the staff-load platform and is not a soil-retaining RC box. Price separate support, local80gravity drain/head, corrosion/leak witness and bounded residual pipe-water spill. Ordinary/fault receiving and groundwater remain real site conditions.'},
  rimAndWeather:{roofSouth:6025,oldRoofSouth:6200,roofAddedM2:addedRoofArea,roofGrossM2:oldRoofArea+addedRoofArea,
   newSouthPosts:[[5450,5975],[7625,5975]],oldSouthPosts:template.roof.temporaryPosts.slice(0,2),postFoot:100,
   southBund:6075,oldSouthBund:6250,roofUnderside:1970,southGateClear:[6550,7250],gateY:6075,
   southRamp:[6575,5750,650,375],rise:30,slope:30/375,
   consequence:'Deliberate175south well/rim replan: upper opening, guard/gate, rim support, one captured175strip closure, shortened ordinary ramp/removable tip, sealed bund and BOTH south temporary posts shift. The existing south feet otherwise lie on the moved bund; no collision is hidden.',
   rainAccounting:{addedGrossLps:addedRoofArea*216/3600,addedNetAssignedCatchmentM2:0,
    boundary:'Added175roof strip is wholly within current court4250..7750square; it redirects already assigned court rain to N, not a new catchment credit. Existing outside-court roof strips and actual N full-event/temporary-pipe duty still need the complete overlap ledger.'},
   structuralReservation:{owningSelectedAperture:[6125,6300,1525,1100],newStripAreaM2:1.525*.175,
    displacedDeckGravityKn:1.525*.175*7.5,displacedDeckVariableKn:1.525*.175*4,
    formedEdge:{axesX:[3950,7950],axisY:6025,plan:[3950,5925,4000,200],section:[200,300],top:-180,underside:-480,
     clearBetweenCourtGirders:3400,grossM3:.2*.3*4,grossConcreteKn:.2*.3*4*25,
     netAdditionalM3:.2*.1*4,netAdditionalConcreteKn:.2*.1*4*25,
     role:'Continuous source-proposed EW edge reaches BOTH actual court-W/E lines; no floating short trimmer. Gross6kN and net2kN differ because200depth may replace already-budgeted RC200. Deliberately formed cage/anchorage through P36 territory, torsion and local slab/door/roof clearance remain required; no face drilling.'},
    guardPostAxes:[[6500,6025],[7300,6025]],guardHorizontalPointKn:1,pointZ:1100,baseZ:-180,
    signedSeparatePostActions:[{Fx:1,Fy:0,My:1.28},{Fx:-1,Fy:0,My:-1.28},{Fx:0,Fy:1,Mx:-1.28},{Fx:0,Fy:-1,Mx:1.28}],
    baseControl:{type:'Ordinary formed wrap/bearing saddle comparison; NOT qualified',rimWidth:200,actualContactLever:120,
     nominalReactionFor1_28KnM:1.28/.12,fullGrossImpossibleLeverLowerBound:1.28/.2,
     requiredContacts:'Bind opposing40wide contacts with120centre lever separately in EW/NS; actual top/bottom plates, outside legs, fixed positive shear key and parent-cage interface remain unproved. No preload/friction credit or imaginary full200lever.',
     maximumNorthIntrusion:20,northLimit:6145,bodySouthMinimum:routeBounds[1],bodyGapAfter5:routeBounds[1]-6145-tolerance,
     accepted:false},
    gate:{clear:[6550,7250],width:700,leafReference:[695,1100,40],maximumReferenceMassKg:25,
     windPressureHypothesisKpa:1,windHorizontalKn:.695*1.1,windBaseMomentKnM:.695*1.1*(.55+.18),
     gravityKn:25*g/1000,gravityEccentricMomentKnM:25*g/1000*.695/2,
     role:'Gate wind is an explicit comparison hypothesis, not site wind acceptance; combine with relevant signed guard actions and real hinge/latch eccentricity. Close/capture before worker moves to WEST station; open inward leaf would intersect that route.',
     crew:'One person on lower platform plus one attendant outside south gate for entry/closure/tool transfer and recovery. No second person is charged to the one-person lower platform. Actual ladder/posture/loaded latch reach is still a joined-state duty.'},
    accepted:false},
   ordinaryAndWeatherAccepted:false},
  sequence:['Verify intact N full-duty and actual receiving/weather conditions before E isolation. All selected/admitted passive states remain required.',
   'Erect the source-owned enlarged roof/bund/entry, moved south feet and guarded south service opening while all walking covers intact; prove real drainage/laps/escape.',
   'Capture/remove nine covers/gutters and seam piece; keep ONLY north module3 fully seated/captured. Install/capture actual temporary lower work platform and south ladder; supported pipe frame/rotation restraints already engaged.',
   'Enter clear R300 staff zone. Operate ONE vertical inlet joint with actual top tool/lower counter-spanner. Retain gasket/nuts/bolts; retract every bolt clear. No downstream connector exists.',
   'Use captured support to separate gasket/drop pipe initially; staff exits. From above remove the retained pan3/upper flange, then capture/remove platform panels and ladder. Keep pipe locked on real supports; no overhead pan/platform manipulation with crew below.',
   'With all personnel outside sweep, lower total40 and roll complete spool90SOUTH on captured positively controlled bearings. Stop/lock at every state; full blocked mass and independent anti-roll/axial retention remain.',
   'Draw complete rolled spool east along actual falling captured rails through ALL three actual bridges; land/restrain before any hoist transfer. Pay full derived long stage, outgoing removal and incoming delivery.',
   'Reverse complete incoming spool: lower locked orientation, draw WEST, rotate back only in actual well/receiver clearances, install supported staff platform/ladder then pan3/upper flange, align/raise and restore inlet joint with crew outside load path. Test joint/catch/free outlet while covers open, then all cover/weather/ordinary access states in order.'],
  technicalHolds:['Actual vertical-joint whole tool/nut/bolt withdrawal and head/torso/hand solids/torque; catalogue flange/fastener/gasket/braze/clock still require exact source. No native hardware pass is assumed.',
   'Captured roll bearings/positive stops/brake, full wet/obstruction masses, initial/translated support reactions, wheels/rail/sidepost/drop brackets and entire export/incoming/hoist states. Bare frame is not proof.',
   'Actual175upperfloor/rim/guard-weather reconstruction and1150×600 staff-platform support/three-panel joints/entry/exit. No fixed floor aperture or old stair pass is inherited.',
   'Native open-end splash/pressure/vent/rod/first-wet and full receiving/site handoff; retained inlet/debris/hydraulic failures and high-eave duties remain.'],
  firstSusceptible:null,hydraulicAccepted:false,constructionAccepted:false};
}

export function renderBent(o){
 const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
 const text=(x,y,t,size=18)=>`<text x="${x}" y="${y}" font-size="${size}">${esc(t)}</text>`;
 const hull=points=>{
  const p=points.map(x=>[...x]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]),turn=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  const half=a=>{const r=[];for(const q of a){while(r.length>1&&turn(r.at(-2),r.at(-1),q)<=0)r.pop();r.push(q);}return r;};
  return [...half(p).slice(0,-1),...half([...p].reverse()).slice(0,-1)];
 };
 const n=[Math.cos(Math.atan(o.geometry.fall)),0,-Math.sin(Math.atan(o.geometry.fall))],anchor=o.geometry.axisAnchor;
 let s='<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1870" viewBox="0 0 1600 1870"><rect width="100%" height="100%" fill="#fbfaf5"/><g fill="#283e43" font-family="sans-serif">';
 s+=text(30,40,'UNADOPTED · one-ended full bent spool / exact continuous roll',29)+text(30,75,'One vertical inlet joint. Native free outlet. Actual crew/support/lock/hoist joins remain HOLD; no full-method pass.');
 const panel=(left,id,box,title)=>{
  const X=y=>left+(y-6200)*.43,Z=z=>165+(-z-300)*.35;
  s+=text(left,125,title,22);
  for(const y of[6425,7375])s+=`<path d="M${X(y)} 160 V530" stroke="#a6aaa1" stroke-dasharray="6 5"/>`;
  s+=text(left,555,'Dashed:constant950strip comparison, not roll location.',16);
  for(const[degrees,color]of[[0,'#4886a0'],[75.9419229,'#b66d48'],[90,'#4f8a6a']]){
   const points=corners(box).map(p=>{const a=coefficients(p,anchor,n),q=a.A.map((x,i)=>x+a.B[i]*Math.cos(degrees*pi/180)+a.C[i]*Math.sin(degrees*pi/180)-(i===2?40:0));return[X(q[1]),Z(q[2])];});
   s+=`<polygon points="${hull(points).map(p=>p.join(',')).join(' ')}" fill="${color}" fill-opacity=".10" stroke="${color}" stroke-width="2"/>`;
   if(box===o.geometry.inletBox){
    const v=[-n[2],0,n[0]],vertices=[-142.5,142.5].flatMap(a=>[-142.5,142.5].flatMap(b=>[-25,0].map(c=>add(add(add(o.geometry.flange,n,a),[0,1,0],b),v,c)))),
     f=vertices.map(p=>{const a=coefficients(p,anchor,n),q=a.A.map((x,i)=>x+a.B[i]*Math.cos(degrees*pi/180)+a.C[i]*Math.sin(degrees*pi/180)-(i===2?40:0));return[X(q[1]),Z(q[2])];});
    s+=`<polygon points="${hull(f).map(p=>p.join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="5 3"/>`;
   }
  }
  s+=text(left,590,id,17);
 };
 panel(60,'Inlet box / flange roll is wholly WEST of7650.',o.geometry.inletBox,'Inlet native body · Y/Z bounding-solid projection');
 panel(850,'Outlet north peak75.942°:28.90before deformation.',o.geometry.outletBox,'Outlet native body · actual intermediate extreme');
 s+=text(60,625,'Blue0° · orange75.942° · green90°. Whole angular proof enumerates every stationary point; these three views illustrate it.',18);
 const X=x=>45+(x-6125)*.105,Z=z=>685-z*.16;
 s+=text(30,675,'Longitudinal section · true bridge strips / long whole-frame park and temporary work reservation',22);
 for(const b of o.completeAngularProof.bridgeCases)s+=`<rect x="${X(b.x[0])}" y="${Z(-180)}" width="${(b.x[1]-b.x[0])*.105}" height="72" fill="#d7d3c9" stroke="#898779"/>`;
 s+=`<path d="M${X(o.geometry.flange[0])} ${Z(-380)} L${X(o.geometry.inletCorner[0])} ${Z(o.geometry.inletCorner[2])} L${X(o.geometry.outletCorner[0])} ${Z(o.geometry.outletCorner[2])} L${X(o.geometry.freeOutlet[0])} ${Z(o.geometry.freeOutlet[2])}" fill="none" stroke="#4886a0" stroke-width="10"/>`;
 const frame=o.loads.frame,axis=x=>-775-(x-7350)*o.geometry.fall;
 s+=`<path d="M${X(frame.start)} ${Z(axis(frame.start)-210-40)} L${X(frame.end)} ${Z(axis(frame.end)-210-40)}" stroke="#737d7c" stroke-width="8"/>`;
 const d=o.renewal.translation;
 s+=`<path d="M${X(frame.start+d)} ${Z(axis(frame.start+d)-210-40)} L${X(frame.end+d)} ${Z(axis(frame.end+d)-210-40)}" stroke="#b18450" stroke-width="10" stroke-dasharray="9 5"/>`;
 s+=`<path d="M${X(12250)} 970 H${X(o.renewal.requiredDeckEnd)}" stroke="#5d8d70" stroke-width="14"/>`;
 for(const p of o.renewal.lowerCradleX)s+=`<path d="M${X(p)} 930 V985" stroke="#8b6f4a" stroke-width="6"/>`;
 s+=text(45,1015,`Full-frame draw${o.renewal.translation.toFixed(0)} /park12250..${o.renewal.park[1].toFixed(0)} /work to${o.renewal.requiredDeckEnd}: +${o.renewal.extensionBeyondSelected} beyond selecteddeck.`,20);
 s+=text(45,1052,`Nominal full-water spool${o.loads.nominalSpoolFullWaterKg.toFixed(2)}kg +bareframe${o.loads.frame.nominalBareKg.toFixed(2)} =${o.loads.nominalFullWaterIncludingBareFrameKg.toFixed(2)}kg before unweighed hardware; actual-kit bound unearned.`,20);
 s+=text(45,1088,`Locked90only: bridge crowns${o.spatialStateProof.bridgeCasesAfterDeformation.map(b=>b.minimumClearance.toFixed(1)).join('/')}mm after rigid+deformation; misplaced roll fails.`,18);
 s+=text(45,1124,`CG independent-water domain${o.renewal.cgBound.localX.map(x=>x.toFixed(1)).join('..')} /liftreserve${o.renewal.cgBound.liftMinimumCgReserve.toFixed(1)}mm; old full-wet generalbound rejected.`,18);
 s+=text(45,1160,'Well175south /one1150×600 temporary platform/two sequential crew positions; actual native tools/torque/support remain HOLD.',18);
 s+=text(45,1195,'No downstream working platform. No hydraulic/first-wet/site/physical adoption. RWT06 remains STARTED and incomplete.',18);
 s+=text(35,1260,'Changed first-release plan · actual175 opening cost / one worker, two sequential positions',24);
 const PX=x=>50+(x-6125)*.38,PY=y=>1320+(y-5925)*.25;
 const rect=(b,fill,stroke)=>`<rect x="${PX(b[0])}" y="${PY(b[1])}" width="${b[2]*.38}" height="${b[3]*.25}" fill="${fill}" stroke="${stroke}"/>`;
 s+=rect([6125,6125,1525,1275],'#f5eee1','#8b755e')+rect([6125,6300,1525,1100],'none','#a1a49a');
 const crew=o.wellAndCrew,pan=crew.retainedPanDuringFirstRelease.plan;
 s+=rect([6125,6125,1525,175],'#e5c9bb','#ba7556')+rect(crew.platformPlan,'#dce4e2','#6f8585')+rect(pan,'#bfd9c7','#507a60');
 s+=`<g transform="translate(50 1320) scale(.38 .25)"><path d="${crew.route.map((p,i)=>`${i?'L':'M'}${p[0]-6125} ${p[1]-5925}`).join(' ')}" fill="none" stroke="#c0996f" stroke-width="600" stroke-linecap="round" stroke-linejoin="round" opacity=".24"/></g>`;
 for(const p of crew.operatorCentres)s+=`<ellipse cx="${PX(p[0])}" cy="${PY(p[1])}" rx="114" ry="75" fill="none" stroke="#b27b43" stroke-width="2"/>`;
 s+=`<ellipse cx="${PX(o.geometry.flange[0])}" cy="${PY(o.geometry.flange[1])}" rx="${142.5*.38}" ry="${142.5*.25}" fill="#b9d4e0" stroke="#477a95"/>`;
 s+=`<path d="M${PX(6125)} ${PY(6300)} H${PX(7650)}" stroke="#a95a44" stroke-dasharray="5 4"/>`;
 const b=o.rimAndWeather.structuralReservation.formedEdge;s+=rect([6125,b.plan[1],1525,b.plan[3]],'#d2cdbf','#817c6c');
 for(const[x,y]of o.rimAndWeather.structuralReservation.guardPostAxes)s+=rect([x-50,y-50,100,100],'#a9afb0','#586366');
 s+=text(710,1345,`Paired-tool reference${o.verticalJointReference.maximumReferenceHandReach.toFixed(1)}mm max; single station fails.`,20);
 s+=text(710,1385,'Sampled tool/clock/conditional bend bound; no installed torque or full3D posture pass.',18);
 s+=text(710,1425,'R300 route goes SOUTH around flange before moving west. Direct crossing hits it.',18);
 s+=text(710,1465,'FormerY6200 opening intrudes25mm into this route;175strip is a real replan.',18);
 s+=text(710,1505,'Retain only pan3, seated/captured. Platform and crew leave BEFORE any roll.',18);
 s+=text(710,1545,'Formed EW edge reaches trueX3950/7950 supports; shown cropped atwell.',18);
 s+=text(710,1585,'6kN gross /2kN extra conditional concrete. Actual cage/contact/guard joins HOLD.',18);
 s+=text(710,1625,'1.28kNm /120mm needs10.67kN opposing contact; no friction-only clamp pass.',18);
 s+=text(710,1665,'Old long northrail is inside the full outlet roll envelope at65°: rejected.',18);
 s+=text(710,1705,'New carrier ends outside both native angularX envelopes; end captures still required.',18);
 s+=text(35,1810,'Orange:R300 route · blue:285flange · green:retainedpan3 · red175strip · grey:temporaryplatform /formedrim.',18);
 s+=text(35,1845,'This is a source-owned unadopted comparison, not a changed selected HAD aperture or a construction/physical acceptance.',18);
 return s+'</g></svg>\n';
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
 const o=bentSpool();for(const[p,t]of[['bent-spool-control.json',JSON.stringify(o,null,2)+'\n'],['bent-spool-control.svg',renderBent(o)]]){
  const path='project/rwt/studies/'+p;if(process.argv.includes('--check'))assert.equal(fs.readFileSync(path,'utf8'),t);else fs.writeFileSync(path,t);
 }
 console.log('One-ended native bent-spool continuous angular control reproduced; adoption remains false.');
}
