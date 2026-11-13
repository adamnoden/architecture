/** Recovered private dimensional review of the bridge first break. Millimetres/newtons.
 * This defines a custom reference assembly, not an available fitting or a
 * physical handling result. No repository selection is changed by this file.
 * Restored under the generation-4 HAD lease from the exact generation-3
 * source blob; only its import and provenance were adapted to the main repo.
 */
import {segmentDistance,segmentBoxDistance,segmentBodyDistance} from './service-interface-geometry.mjs';
import {exactSegmentBoxDistance} from './incoming-water-geometry.mjs';
import {writeFileSync} from 'node:fs';
import {deriveCurrentHouse} from './current-house.mjs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const mix=(a,b,t)=>a.map((v,i)=>v+t*(b[i]-v));
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
export const boxGap=(a,b)=>Math.hypot(...[0,1,2].map(i=>Math.max(a[i]-b[i]-b[i+3],b[i]-a[i]-a[i+3],0)));
const min=rows=>rows.reduce((a,b)=>a.value<b.value?a:b,{value:Infinity});
const boxes={
 openPlantLeaf:[9397,3534,0,762,44,3100],
 westPier:[9300,3585,0,395,230,3100],eastPier:[10880,3585,0,1120,230,3100],
 radiator:[10980,3797,100,550,200,600],
 westBase:[10070,3770,0,140,140,20],westPost:[10100,3800,20,80,80,2024],westBraceFoot:[9800,3650,0,100,100,80],southBraceFoot:[10090,3605,0,120,80,80],westBrace:[9830,3680,20,330,180,2044],southBrace:[10120,3625,20,50,235,2044],
 westDriveInputs:[9985,3725,1535,30,30,130],westDriveShaft:[9987.5,3727.5,1665,25,25,475],westDriveHead:[9975,3715,2115,50,50,50],westDriveTop:[9987.5,3727.5,2127.5,165,125,25],
 westTopArm:[10110,3810,2044,305,190,40],westFork:[10335,3900,2064,100,140,99],
 eastPierPlate:[11000,3760,2003,160,47,200],eastTopArm:[10855,3777,2044,275,223,40],
 eastFork:[10835,3900,2064,100,140,99],
 eastWall:[11570.5,0,0,429.5,4100,3100],controls:[10895.5,5480.5,0,650,300,2300],
 riser:[9400,4700,0,550,700,3100]
};
const cylinders={cylinder:{centre:[9830,4250],z:[0,1650],r:380},heat:{centre:[11225,3900],z:[100,2945],r:84},buffer:{centre:[10450,5325],z:[0,1975],r:300}};
const braceAxes=[['westBrace',[9850,3700,20],[10140,3840,2044]],['southBrace',[10150,3645,20],[10140,3840,2044]]];
export function bridgeRetirementGeometry(){
 return structuredClone({boxes,cylinders,braceAxes});
}
function nativeCylinderDistance(a,b,{centre,z,r}){
 if(a[2]>=z[0]&&a[2]<=z[1]&&b[2]>=z[0]&&b[2]<=z[1]){
  const axis=[...centre,0];
  return Math.max(0,segmentDistance([a[0],a[1],0],[b[0],b[1],0],axis,axis)-r);
 }
 return segmentBodyDistance(a,b,centre,z,r);
}
export const segmentGaps=(a,b,r,omit=[])=>[
 ...Object.entries(boxes).filter(([id])=>!omit.includes(id)&&!['westBrace','southBrace'].includes(id)).map(([id,q])=>({id,value:exactSegmentBoxDistance(a,b,q)-r})),
 ...Object.entries(cylinders).map(([id,q])=>({id,value:nativeCylinderDistance(a,b,q)-r})),
 ...braceAxes.map(([id,c,d])=>({id,value:segmentDistance(a,b,c,d)-Math.hypot(20,20)-r}))
];

export function uprightBodyGaps(centre, height, radius){
 const point=[...centre,0];
 return [
  ...Object.entries(boxes).filter(([id,q])=>!['westBrace','southBrace'].includes(id)&&q[2]<height&&q[2]+q[5]>0)
   .map(([id,q])=>({id,value:segmentBoxDistance(point,point,[q[0],q[1],0,q[3],q[4],1])-radius})),
  ...Object.entries(cylinders).filter(([,q])=>q.z[0]<height&&q.z[1]>0)
   .map(([id,q])=>({id,value:Math.hypot(q.centre[0]-centre[0],q.centre[1]-centre[1])-q.r-radius})),
  ...braceAxes.map(([id,a,b])=>({id,value:segmentDistance(point,point,[a[0],a[1],0],[b[0],b[1],0])-Math.hypot(20,20)-radius})),
 ];
}

export function nativeBoxGaps(box,world,local){
 const corners=[0,box[3]].flatMap(dx=>[0,box[4]].map(dy=>world(box[0]+dx,box[1]+dy,box[2])));
 const lo=[Math.min(...corners.map(p=>p[0])),Math.min(...corners.map(p=>p[1])),box[2]];
 const hi=[Math.max(...corners.map(p=>p[0])),Math.max(...corners.map(p=>p[1])),box[2]+box[5]];
 const planBox=[box[0],box[1],0,box[3],box[4],1];
 const envelope=[...lo,...hi.map((v,i)=>v-lo[i])];
 return [
  ...Object.entries(boxes).filter(([id])=>!['westBrace','southBrace'].includes(id))
   .map(([id,q])=>({id,value:boxGap(envelope,q)})),
  ...Object.entries(cylinders).map(([id,q])=>{
   const [x,y]=local([...q.centre,0]);
   const planGap=Math.max(segmentBoxDistance([x,y,0],[x,y,0],planBox)-q.r,0);
   const heightGap=Math.max(q.z[0]-hi[2],lo[2]-q.z[1],0);
   return {id,value:Math.hypot(planGap,heightGap)};
  }),
  ...braceAxes.map(([id,a,b])=>({id,value:segmentBoxDistance(local(a),local(b),box)-Math.hypot(20,20)})),
 ];
}
const workers={west:{body:[10545,3750],x:10195,sector:[-55,5],counterAngle:40},east:{body:[11215,4337],x:11075,sector:[55,115],counterAngle:140}};
const deg=Math.PI/180;
function toolFiniteGap(a,b,q){
 const plan=segmentBoxDistance([a[0],a[1],0],[b[0],b[1],0],[q[0],q[1],0,q[3],q[4],1])-35.75;
 const z=Math.max(q[2]-a[2]-6.4,a[2]-6.4-q[2]-q[5],0);
 return Math.hypot(Math.max(plan,0),z);
}
function toolChecks(){
 const step=.25,L=297,penalty=L*step*deg/2,rows=[];
 const assembledMetal={};
 for(const[side,x]of [['west',10195],['east',11075]]){
  assembledMetal[side+'CarrierStrut']=[x+21,3960,1191,18,20,884];
  assembledMetal[side+'CarrierShoulder']=[x+20,3952,1185,20,36,6];
  assembledMetal[side+'CarrierActuator']=[x+12.5,3958,1705,8,12,370];
  for(const z of [1730,1750])assembledMetal[side+'CarrierCleat'+z]=[x+12.5,3950,z-5,26.5,10,10];
 }
 for(const[side,w]of Object.entries(workers)){
  const shoulder=[...w.body,1450],checks=[],reaches=[];
  for(const role of ['turning','counterhold']){
   const angles=role==='turning'?Array.from({length:241},(_,i)=>w.sector[0]+i*step):[w.counterAngle];
   const zs=role==='turning'?[1086,1146]:[1047];
   for(const angle of angles)for(const z of zs){
    const a=[w.x,3970,z],b=[w.x+L*Math.cos(angle*deg),3970+L*Math.sin(angle*deg),z];
    for(const[id,q]of Object.entries(boxes))checks.push({side,role,angle,z,kind:'tool',id,value:toolFiniteGap(a,b,q)-penalty});
    for(const[id,q]of Object.entries(cylinders)){
     const plan=segmentBodyDistance([a[0],a[1],0],[b[0],b[1],0],q.centre,[0,1],q.r)-35.75;
     const v=Math.max(q.z[0]-z-6.4,z-6.4-q.z[1],0);
     checks.push({side,role,angle,z,kind:'tool',id,value:Math.hypot(Math.max(plan,0),v)-penalty});
    }
    for(const[id,q]of Object.entries(assembledMetal)){
     checks.push({side,role,angle,z,kind:'tool',id,value:toolFiniteGap(a,b,q)-penalty});
     checks.push({side,role,angle,z,kind:'hand',id,value:segmentBoxDistance(b,b,q)-50-penalty});
     checks.push({side,role,angle,z,kind:'arm',id,value:segmentBoxDistance(shoulder,b,q)-40-penalty});
    }
    checks.push(...segmentGaps(b,b,50).map(r=>({...r,side,role,angle,z,kind:'hand',value:r.value-penalty})));
    checks.push(...segmentGaps(shoulder,b,40).map(r=>({...r,side,role,angle,z,kind:'arm',value:r.value-penalty})));
    reaches.push({role,angle,z,value:distance(shoulder,b)+penalty});
   }
  }
  rows.push({side,body:w.body,turningSector:w.sector,counterholdAngle:w.counterAngle,
   minimum:min(checks),byKind:Object.fromEntries(['tool','hand','arm'].map(k=>[k,min(checks.filter(r=>r.kind===k))])),
   maxReach:reaches.reduce((a,b)=>a.value>b.value?a:b),
   bands:{counterhold:[1040.6,1053.4],turningMade:[1079.6,1092.4],turningBacked:[1139.6,1152.4],minimumHeadVerticalGap:26.2},
   completeTool:{length:L,headWidth:71.5,thickness:12.8},samplingPenalty:penalty});
 }
 return rows;
}

function nativeCarrier(){
 const R=37,bar={x:[21,39],y:[-10,10],z:[1191,2075]},rod={x:[12.5,20.5],y:[-12,0],z:[1705,2075]},plate={x:[20,40],y:[-18,18],z:[1185,1191]};
 const union={madeZ:[1040,1100],nutMovingZ:[1070,1100],nutBackedZ:[1130,1160],maximumNutR:38/Math.sqrt(3),backoff:60,lift:90,minimumFullReleaseGap:1040+90-1100};
 return {status:'DIMENSIONAL_CONTRACT_UNQUALIFIED',bar,rod,plate,union,
  barCornerR:Math.hypot(39,10),rodCornerR:Math.hypot(20.5,12),shoulderCornerR:Math.hypot(40,18),
  rodToBarGap:bar.x[0]-rod.x[1],rodToBarePipeGap:rod.x[0]-11,
  nutToCarrierVerticalGap:plate.z[0]-union.nutBackedZ[1],
  shoulderToBarePipeGap:20-11,shoulderBearingArea:2*20*4,shoulderBearingStress:500/(2*20*4),
  old1100StrutFailsNutSweep:21-union.maximumNutR,
  nominalStrutMassKg:2*.02*.018*(2075-1191)/1000*7850,
  scope:'The shortened struts carry their own shoulder plates. No shoulder or nut flange is invented on the pressure fitting. A 60 mm axial captive-nut withdrawal and a non-undercut mating interface must fit this complete union reservation; actual selected union dimensions and pressure/material qualification remain required.'};
}

function controls(){
 const rows=[];
 for(const[side,w]of Object.entries(workers)){
  const shoulder=[...w.body,1450];
  const points=[['shoeLockLower',[w.x+49,4075,1730]],['shoeLockUpper',[w.x+49,4075,1750]],
   ['capturePins',side==='west'?[10000,3647,1550]:[11025,3885,1600]],
   ['catchJack',side==='west'?[10000,3647,1600]:[11025,3885,1650]],
   ['forkJaws',side==='west'?[10000,3647,1650]:[11025,3885,1700]]];
  for(const[id,p]of points){
   const touch=[];
   const rows=segmentGaps(shoulder,p,40,touch.filter(Boolean));
   // West grip is93mm south of its socket; the east grip is70mm north.
   rows.push(...segmentGaps(p,p,40,touch).map(r=>({...r,id:r.id+' hand'})));
  const reach=distance(shoulder,p);
   const ownPipe=segmentDistance(p,p,[w.x,3970,1100],[w.x,3970,2075])-11-40;
   // The separate native driver contract locates the socket/offset head;
   // these are the complete hand/arm envelopes, not bare contact points.
   rows.push({id:'ownBarePipe',value:ownPipe});
   rows.sort((a,b)=>a.value-b.value);
   const summary={side,id,point:p,reach,minimum:min(rows),lowest:rows.slice(0,3)};
   // keep each independently named operation available to the reviewer
   controlRows.push(summary);
  }
 }
 return rows;
}
let controlRows=[];

function positiveCapture(){
 const shoe={innerR:20,outerR:23,loadedOffsetZ:9,assemblyOffsetZ:-9,frontEntryZ:8,
  heel:{plan:[76,36],loadedBottomZ:2108,minimumTopZ:2136,maximumTopZ:2159-Math.sqrt(23**2-18**2),
   topSurface:'z=2159-sqrt(23^2-y^2), for localY in[-18,18]. This matches the outer cylindrical shoe; no flat tangent weld is credited.',
   centres:[[10385,3970],[10885,3970]],cornerDistanceFromCrown:Math.hypot(42,18)},
  straightTailMM:160,verticalTailMM:150,
  shells:'North/south half-annular R20..23 shells around the R75 elbow,150mm down the vertical leg and160mm along the crown. Each contoured heel occupies the straight tail77..153mm inward of the crown tangent. Each lower actuator is connected to its own shoe half; mainX18×Y20 strut is monolithic and has141mm welded overlap with the vertical half shell.',
  assembly:[{name:'north main half clear',main:[0,25,-9],front:null},
   {name:'main half fitted around bare elbow',main:[0,0,-9],front:null},
   {name:'south half key-entry approach',main:[0,0,-9],front:[0,-25,-1]},
   {name:'T head admitted through large aperture',main:[0,0,-9],front:[0,0,-1]},
   {name:'front half slides8 down onto T neck',main:[0,0,-9],front:[0,0,-9]},
   {name:'two low M4 cross-locks prevent reverse slide',main:[0,0,-9],front:[0,0,-9]},
   {name:'jack takes up9 and heels are positively pinned',main:[0,0,0],front:[0,0,0]}],
  nativeShellMinimumDuringEntry:20-11-8,
  heelToBareCrownGapDuringEntry:2150-11-(2136-9+8),
  heelToBareCrownGapLoaded:2150-11-2136,
  key:{head:[12,4,12],neck:[6,5,8],headY:[-9,-5],headZ:[2117,2129],
   frontEntry:{x:[-6.5,6.5],z:[2108.5,2121.5]},retainingSlot:{x:[-3.5,3.5],z:[2115,2127.5]},
   internalPocket:{x:[-6.5,6.5],y:[-10,-5],z:[2108.5,2130]},
   minimumEntryGapEach:.5,neckToSlotEach:.5,headToPocketY:1,
   capturedLipArea:2*(6-3.5)*(2129-2121.5),pullApartDemandN:8000,
   lipBearingStress:8000/(2*2.5*7.5),neckShearStress:8000/(6*8),
   frontRetention:'One rectangular T key at heelX0, neckZ2123. It prevents separation and rotation; two low M4 pins between the actuator and welded cleats prevent its8mm unlocking stroke. No clamping friction is credited.',
   requiredManufacturingErrorEach:.2},
  lowLocks:{z:[1730,1750],pinDiameter:4,rod:[8,12],rodX:[12.5,20.5],rodY:[-12,0],rodZ:[1705,2075],
   mainStrutRemainsUndrilled:true,
   cleats:'Two8mm backing cleats atY−20..−12, with short welded returns to the main strut south face only atX21..39. Rod isX12.5..20.5; it does not overlap the main strut. PositiveM4 shoulder pins enter from north, with their full4mm shanks across the shear plane. Retain their heads and the0.5mm assembly fit mechanically.',
   maximumUnlockForcePairN:8000,pinMinimumProofStressMPa:900,
   pinSingleShearMPa:4000/(Math.PI*4**2/4),rodNetStressMPa:8000/((8-4.5)*12),
   cleatBearingMPa:4000/(4*8),rodBearingMPa:4000/(4*12),
   receiverClearanceAfterLanding:1705-103-1427,
   tool:'M4 cap head maximum7mm diameter on north face. Socket/gear head maximumR7 is centred atXleg+16.5/Y3990; it drives the north-facing pin through a short coaxial bit. An offset input atXleg+49/Y4075 carries the hand clear of pipe and tank. The tool is inserted from north and removed before carrying; native head/main-strut gap3mm is distinct from remote25mm clearance.',
   load:'Two positive pins, not friction screws. Their holes align only with the T key fully lowered. The rod stops at1705, above the receiving guides after landing; extending it to1205 collided with the receiver keeper. Actual pin retention and visible engagement remain a native drawing/qualification duty.'}};
 const pins={diameter:18,holeDiameter:20,centresX:[-25,25],z:2122,
  engagedY:[3930,4010],strokeSouth:78,parkedY:[3852,3932],
  earsY:[[3930,3946],[3994,4010]],earThickness:16,
  earOpenY:[[3904,3920],[4020,4036]],earClosingStroke:26,
  heelPadsY:[[3946,3951],[3989,3994]],padZ:[2108,2136],
  crossheadEngaged:[-38,3924,2114,76,6,16],crossheadParked:[-38,3846,2114,76,6,16],
  // Ear holes and the76x36heel are geometrically different solids. The two
  // Y-axis pins pass the heel on either side of its central T-key pocket.
  nominalBoreRadialGap:1,alignmentAllowanceEach:.25,
  heelToForkSideGap:1,
  peakSinglePinForceN:8000,effectiveBearingSpanMM:64,
  local250NmMomentToOpposedPinN:250000/50,
  bendingStressMPa:(8000*64/4)/(Math.PI*18**3/32),
  doubleShearMPa:8000/(2*Math.PI*18**2/4),
  combinedVonMisesMPa:Math.hypot((8000*64/4)/(Math.PI*18**3/32),Math.sqrt(3)*8000/(2*Math.PI*18**2/4)),
  heelNetEndLigamentMM:38-25-10,heelNetVerticalLigamentMM:14-10,
  heelEndTearOutStressMPa:8000/(2*3*36),heelVerticalTearOutStressMPa:8000/(2*4*36),
  pinToRectangularKeyPocketGapMM:25-10-6.5,
  conservativeKeySideWebShearMPa:8000/(2*(25-10-6.5)*7.5),
  positiveLock:'Both pin heads share a captive southward crosshead, with a positive indexed locking pin at engaged and fully withdrawn positions. A contained drive from below moves it78mm; no friction/self-locking assumption.'};
 const jack={seatStowed:2088,seatLoaded:2108,travel:20,freeApproach:11,takeup:9,
  armZ:[2044,2084],forkTop:2163,
  metalSeat:'The jack bears on the metal heel, and the inserted cross-pins lock the raised state. No insulation support and no permanent hand-held load are credited.',
  unloadedPinHoleZ:2113,loadedPinHoleZ:2122,
  lift:90,heelAfterLift:2198,forkClearance:35,
  normalSeatToInsulationGap:25,normalOpenEarToInsulationGap:13,
  assemblyOpenEarToHalfShellGap:50-(25+23),
  temporaryShoeEnvelopeR:46,straightPipeAndStrutEnvelopeR:37};
 const around=[];
 for(const[side,w]of Object.entries(workers)){
  const x=side==='west'?10385:10885;
  for(const xx of pins.centresX){
   const a=[x+xx,pins.parkedY[0],pins.z],b=[x+xx,pins.parkedY[1],pins.z];
   // Only remote surroundings: the fork bores are intentional fitted contact.
   around.push(...segmentGaps(a,b,9,['westFork','eastFork','westTopArm','eastTopArm']).map(r=>({...r,side,kind:'parked pin'})));
   // Fully lifted, conservativeR37 pipe leg translated120E/160N.
   const relativeA=[w.x-x-xx,3970,0],relativeB=[w.x+120-x-xx,4130,0];
   around.push({side,kind:'lifted leg to parked pin',id:'own pipe',value:segmentDistance(relativeA,relativeB,[0,pins.parkedY[0],0],[0,pins.parkedY[1],0])-37-9});
  }
  const box=boxes[side+'Fork'];
  around.push({side,kind:'lifted leg to complete own fork',id:'own fork',value:segmentBoxDistance([w.x,3970,2120],[w.x+120,4130,2120],box)-37});
  const q=[x-38,3846,2114,76,6,16];
  around.push({side,kind:'parked crosshead to pier',id:'eastPier',value:boxGap(q,boxes.eastPier)});
 }
 const strutWx=18*20**2/6,strutWy=20*18**2/6;
 const fullPipeLength=3035.619449019234,shoeLength=150+160+75*Math.PI/2;
 const heelCrossArea=2*(51*18-.5*(18*Math.sqrt(23**2-18**2)+23**2*Math.asin(18/23)));
 const strippedLength=2*(2075-1040)+2*(75*Math.PI/2+160),remainingInsulated=fullPipeLength-strippedLength;
 const masses={copper:Math.PI*(11**2-10**2)*fullPipeLength*8.94e-6,
  residualWater:Math.PI*10**2*fullPipeLength*1e-6,
  twoMainStruts:2*18*20*884*7.85e-6,twoActuators:2*8*12*370*7.85e-6,
  twoShells:2*Math.PI*(23**2-20**2)*shoeLength*7.85e-6,
  twoContouredHeels:2*76*heelCrossArea*7.85e-6,twoShoulders:2*20*36*6*7.85e-6,
  fourCleats:4*(26.5*8*10+18*2*10)*7.85e-6,
  remainingInsulationAt200:Math.PI*(36**2-11**2)*remainingInsulated*200e-9,
  remainingJacketAt8000:Math.PI*(37**2-36**2)*remainingInsulated*8000e-9};
 const knownMass=Object.values(masses).reduce((a,b)=>a+b,0);
 return {status:'CUSTOM_REFERENCE_GEOMETRY',shoe,pins,jack,minimumRemote:min(around),remote:around,
  permanentControls:{
   westInputSocket:[10000,3740,1550],eastInputSocket:[11025,3815,1600],westPortZ:[1550,1600,1650],eastPortZ:[1600,1650,1700],
   containment:'West drive is external: three30x30x30 input boxes at10000/3740 (eachR9 gear head has4mm clear inside its2mm shell), a25mm column toZ2140, then an overhead transfer into the arm end housing. This preserves the unperforated80mm structural post. The boxes are within the open arch below its2550mm spring. ThreeØ8 shafts inside the40×40×4 arm have centres[-8,-8],[8,-8],[0,8], outside extents±12 and4mm wall reserve. End gearsR9 are contained in the80mm head/100×140 fork housing. No permanent low shaft sits below the inward catch.',
   minimumShaftToShaftGap:8,shaftToInnerWall:4,
   shortDriver:'A100mm removable socket driver reaches the three low inputs. After final unpinning it fits a100×20×20 belt pouch wholly inside the declaredR300/H2000 body envelope, while the other hand retains the carrier. No600mm free tool is carried with the module.',
   qualification:'Dimension actual bevels, screw leads, bearings, guards, end stops and positive witness pins inside these owned envelopes. Prove jack/cheek/crosshead travel before issuing the method; no self-locking or invisible engagement is credited.'},
  mass:{knownComponentsKg:masses,knownSumKg:knownMass,remainingBudgetTo20:20-knownMass,
   pipeLengthMM:fullPipeLength,strippedLengthMM:strippedLength,remainingInsulatedLengthMM:remainingInsulated,
   scope:'Remove and separately store jacket/insulation on both full legs, elbows and160mm crown tails. This is a conservative inventory of copper, full residual water, dense remaining insulation/jacket and metal carrier. Actual unions, keys, grips, fasteners and welds must fit the remaining budget; weigh the complete moved assembly and check CG before handling.'},
  forceComparison:{eachCatchVertical:500,eachCatchHorizontal:250,eachCatchMomentNmm:250000,
   pinDemandIncludesLocalMomentCouple:true,comparisonSteelYield:355,divisor:1.1,
   arm:'40x40x4SHS, two real diagonal members; full bracket/post takes the added250Nm reaction.',
   armW:(40**4-32**4)/12/20,armStressMPa:(250000+500*Math.hypot(235,173))/((40**4-32**4)/12/20),
   retainedLegacy60mmUnbracedPostStressMPa:(500*Math.hypot(230,120)+250*2113+250000)/((60**4-52**4)/12/30),
   currentWestPost:'80x80x4 at10140/3840, braced to9850/3700 and10150/3645; post-stiffness.py owns its finite force/deflection comparison. The80mm post NE faces match the previous60mm post; it is not the old unbraced stiffness.',
   westBase:[10070,3770,140,140,20],westBaseAnchorGrid:110,
   westAnchorEach:{tension:10000,shear:2000},braceFootEachAnchor:{count:2,tension:5000,shear:1000},eastThroughBoltEach:{tension:3000,shear:1000},
   installedForkDisplacementBudgetMM:6,fabricationPlacementBudgetMM:.5,
   nativeStrutForkNominalGap:32.8,
   carriedGripZ:1685,firstContinuousShoeWeldZ:1934,carriedCantileverLengthMM:249,
   carryTransverseForceEachN:250,carryAxialForceEachN:500,
   carryElasticBoundMM:250*249**3/(3*200000*(20*18**3/12))+500*249/(200000*18*20),
   remainingAfterFixturePlacementAndCarryElastic:32.8-6-.5-(250*249**3/(3*200000*(20*18**3/12))+500*249/(200000*18*20)),
   carryScope:'During motion the hand applies a bounded250N transverse resultant and500N axial force to its249mm carrier cantilever. The separate250Nm fixture challenge is not silently applied as a free hand couple during transport. Actual handling and rate/load control must qualify this finite envelope; the physical check cannot be replaced by an elastic calculation.',
   actualCatchSpanMM:500,actualCarryGripSpanMM:880,actualCarryGripMidX:10663,
   catchGravityReactionsAt20kgAnd200mmCG:[20*9.81*(.5-200/500),20*9.81*(.5+200/500)],
   maximumCarryGravityReactionAt20kgAndSourceCG:20*9.81*(.5+228/880),
   carrierSectionXY:[18,20],carrierSectionModuliXY:[strutWx,strutWy],
   carrierAnyDirection250NmPlus500NStressMPa:500/(18*20)+250000*Math.hypot(1/strutWx,1/strutWy),
   rejected20x12WeakAxisStressMPa:500/(20*12)+250000/(20*12**2/6)},
  sequence:['Isolate, cool, drain, prove zero pressure; leave directly sensed safety relief connected as required.',
   'Remove local insulation; fit the two shoe halves with their reachable low actuators, engage the T key and both positive low cross-locks.',
   'Raise each metal heel9mm after11mm approach; close the two fork cheeks26mm and engage both positive fork pins. Verify their witness before touching either union.',
   'Use the finite counterhold/turning bands; back both nuts the full60mm, leaving the assembly supported and restrained on both locked forks.',
   'Both workers take their carrier grips; withdraw the fork pins78mm south while the heels remain seated. Each short driver is stowed inside its operator body/pouch envelope; retain both grips.',
   'Lift90mm; the complete heel clears the fixed fork by35mm. Execute the independently checked20-state carry/receiver sequence withR46 only at the upper shoes; the complete carrier legs fitR44; bare pipe/shoe legs areR23 and the explicitly swept lower metal has its own solids.'],
  nativeDuties:['Retain actual toroidal shoe solid, tangent cut planes, single T-key pocket, pin bores and rod guides in the fabrication drawing; these finite interfaces cannot be replaced by a solid capsule.',
   'Selected union, physical mass/CG and all welds/anchors require qualification against the declared forces. The geometric result does not provide those qualifications.']};
}

export function receiverNative(){
 const strutX=[21,39],strutY=[-10,10],guideX=[18,41],guideY=[-14,14],keeperClosedX=[14,18],bareR=11;
 const body={west:[13013,3865],east:[13840,4935]},members={base:[12960,4200,-26,1000,400,876]},rows=[];
 const gateSpecs=[{id:'Lower',z:1218,stow:1060},{id:'Upper',z:1408,stow:1140}];
 const gateParts=(x,g,z)=>({
  blade:[x+14,4374,z-15,4,52,30],southTab:[x+14,4374,z-15,8,4,30],northTab:[x+14,4422,z-15,8,4,30]
 });
 const handleParts=(x,sign,z)=>({
  root:[x+14,Math.min(4400,4400+sign*18),z-10,4,18,20],
  turn:[x-47,4400+sign*18-2,z-10,65,4,20],
  reach:[x-47,Math.min(4400+sign*18,4400+sign*115),z-10,4,97,20],
  grip:[x-55,4400+sign*115-10,z-10,20,20,20]
 });
 for(const[side,x]of [['west',13013],['east',13893]]){
  // The spine is2mm beyond the shoulder's east edge. Moving it1mm east
  // removes the earlier zero allowance after two0.5mm placement errors.
  members[side+'Spine']=[x+42,4300,850,20,200,530];
  members[side+'Neck']=[x+42,4360,1380,20,80,47];
  for(const[z,id]of [[1203,'Lower'],[1393,'Upper']]){
   members[side+id+'SouthSide']=[x+24,4374,z,29,12,30];
   members[side+id+'NorthSide']=[x+24,4414,z,29,12,30];
   members[side+id+'Back']=[x+41,4386,z,12,28,30];
  }
  // Real C-channel rails:9mm-wide,5mm-deep slots with a7mm back web.
  // Rails stand outside the36mm shoulder, rather than across its entry.
  for(const[sign,label]of [[-1,'South'],[1,'North']]){
   const y=sign<0?4366:4422,webY=sign<0?4366:4427;
   members[side+label+'RailWestLip']=[x+10.5,y,1041,3,12,386];
   members[side+label+'RailEastLip']=[x+22.5,y,1041,4,12,386];
   members[side+label+'RailWeb']=[x+13.5,webY,1041,9,7,386];
  }
  // The ledges stop1mm short of the gate tabs. Contact is only over
  // Y14..18 on each side of the shoulder: two20x4mm bearing lands.
  members[side+'SouthBearing']=[x+20,4379,1070,34,7,12];
  members[side+'NorthBearing']=[x+20,4414,1070,34,7,12];
 }
 const sweepBox=(q,a,b,f)=>{
  const h=q.slice(3).map(v=>v/2),c=q.slice(0,3).map((v,i)=>v+h[i]);
  const expanded=[...f.slice(0,3).map((v,i)=>v-h[i]),...f.slice(3).map((v,i)=>v+2*h[i])];
  return segmentBoxDistance(c.map((v,i)=>v+a[i]),c.map((v,i)=>v+b[i]),expanded);
 };
 const signedGap=(a,b)=>{
  const d=[0,1,2].map(i=>Math.max(a[i]-b[i]-b[i+3],b[i]-a[i]-a[i+3]));
  return d.some(x=>x>0)?Math.hypot(...d.map(x=>Math.max(x,0))):Math.max(...d);
 };
 const entryRows=[],gateMotionRows=[],contactRows=[],stowedMembers={};
 for(const[side,x]of [['west',13013],['east',13893]]){
  const sign=side==='west'?-1:1;
  for(const g of gateSpecs){
   for(const[id,q]of Object.entries(gateParts(x,g,g.stow)))stowedMembers[side+g.id+id]=q;
   for(const[id,q]of Object.entries(handleParts(x,sign,g.stow)))stowedMembers[side+g.id+'Handle'+id]=q;
  }
 }
 const phases=[{name:'full498mm east entry',a:[-498,0,-15],b:[0,0,-15]},
  {name:'lower88 onto shoulder bearings',a:[0,0,-15],b:[0,0,-103]}];
 for(const[side,x]of [['west',13013],['east',13893]]){
  const parts={strut:[x+21,4390,1191,18,20,884],shoulder:[x+20,4382,1185,20,36,6],
   lowerBarePipe:[x-11,4389,1040,22,22,850],actuator:[x+12.5,4388,1705,8,12,370]};
  for(const phase of phases)for(const[part,q]of Object.entries(parts))for(const[id,f]of Object.entries({...members,...stowedMembers})){
   const value=sweepBox(q,phase.a,phase.b,f);
   if(phase.name.startsWith('lower')&&part==='shoulder'&&id.startsWith(side)&&id.endsWith('Bearing')){
    contactRows.push({side,part,id,value,intendedContact:true,minimumVerticalSeparation:1185+phase.b[2]-(f[2]+f[5]),area:20*4});
   }else entryRows.push({side,phase:phase.name,part,id,value});
  }
  // Correct operation: upper rises first, while lower remains at1060;
  // then lower rises while upper is locked at1408. Release reverses this.
  for(const id of ['Upper','Lower']){
   const g=gateSpecs.find(q=>q.id===id),other=gateSpecs.find(q=>q.id!==id);
   const otherZ=id==='Upper'?other.stow:other.z;
   const otherParts=Object.fromEntries(Object.entries({...gateParts(x,other,otherZ),...Object.fromEntries(Object.entries(handleParts(x,side==='west'?-1:1,otherZ)).map(([k,v])=>['Handle'+k,v]))}).map(([k,v])=>[side+other.id+k,v]));
   for(const[part,q]of Object.entries({...gateParts(x,g,g.stow),...Object.fromEntries(Object.entries(handleParts(x,side==='west'?-1:1,g.stow)).map(([k,v])=>['Handle'+k,v]))})){
    for(const[fixed,f]of Object.entries({...members,...otherParts}))gateMotionRows.push({side,gate:id,part,fixed,value:sweepBox(q,[0,0,0],[0,0,g.z-g.stow],f)});
    for(const[partName,p]of Object.entries(parts))gateMotionRows.push({side,gate:id,part,fixed:'landed'+partName,value:sweepBox(q,[0,0,0],[0,0,g.z-g.stow],p.map((v,j)=>j===2?v-103:v))});
   }
  }
 }
 for(const[side,x]of [['west',13013],['east',13893]]){
  const sign=side==='west'?-1:1,shoulder=[...body[side],1450-(body[side][0]-12150)/80],hold=[x+28,4400+sign*30,1582];
  for(const g of gateSpecs){
   const other=gateSpecs.find(q=>q.id!==g.id),otherZ=g.id==='Upper'?other.stow:other.z;
   const otherParts={...gateParts(x,other,otherZ),...Object.fromEntries(Object.entries(handleParts(x,sign,otherZ)).map(([k,v])=>['otherHandle'+k,v]))};
   const closed=gateParts(x,g,g.z).blade,open=gateParts(x,g,g.stow).blade,checks=[];
   const handA=[x-45,4400+sign*115,g.z],handB=[x-45,4400+sign*115,g.stow],travel=g.z-g.stow;
   for(let i=0;i<=travel;i++){
    const p=mix(handB,handA,i/travel);
    for(const[id,q]of Object.entries({...members,...otherParts})){
     checks.push({id,kind:'arm',value:segmentBoxDistance(shoulder,p,q)-40-.5});
     checks.push({id,kind:'hand',value:segmentBoxDistance(p,p,q)-40-.5});
    }
    checks.push({id:'ownBarePipe',kind:'arm',value:segmentDistance(shoulder,p,[x,4400,937],[x,4400,2047])-11-40-.5});
    checks.push({id:'otherHoldingHand',kind:'hand',value:distance(p,hold)-80-.5});
   }
   rows.push({side,id:g.id,z:g.z,stowCentre:g.stow,travel,closed,open,openParts:gateParts(x,g,g.stow),
    openHandleParts:handleParts(x,sign,g.stow),closedHandleParts:handleParts(x,sign,g.z),
    handClosed:handA,handOpen:handB,shoulder,hold,minimum:min(checks),maxReach:Math.max(distance(shoulder,handA),distance(shoulder,handB)),
    trackFit:'End tabsX14..22/Y±22..26 run in real9mm-wide/5mm-deep channelsX13.5..22.5/Y±22..27. Two0.2mm fabrication errors leave0.1mm of the0.5mm side fit; this is a machined native fit, separate from remote25mm clearance.',
    keeperToBarePipe:14-11,keeperToStrut:21-18,keeperToShoulder:20-18,
    latch:'One captiveM6 pin from the worker-facing side retains the gate inZ. Its smooth shank enters an8mm-wide end tab; both tabs carry lateral load in the tracks. Operate through a removable driver at this hand station. Actual thread/shank engagement and positive witness remain required.',
    handleLink:'A4mm-thick/20mm-high strap startsX16/Y0, turns west atY±18 toX−45, then runs toY±115. It clears the real rail back webs by2mm and the bare pipe by3mm at its root. The1060/1140 stowed heights separate the two handles by80mm; upper closes first.'});
  }
 }
 const oldGate=[13013+15,4382,1449,4,36,30];
 const oldEntryBar=[13013-22+21,4390,1176,18,20,884];
 const wrongOrderGate=gateParts(13013,gateSpecs[0],1140).blade;
 const fixedUpper=gateParts(13013,gateSpecs[1],1140).blade;
 const I=200*20**3/12,L=577,l=47,M=1500*190,F=250,E=200000,frameI=(80**4-70**4)/12;
 const spineDeflection=(M*L**2/2+F*L**3/3)/(E*I)+(M*l**2/2+F*l**3/3)/E*(1/(80*20**3/12)-1/I);
 const baseDeflection=((M+F*L)*850**2/2+F*850**3/3)/(E*frameI);
 return {status:'NATIVE_ENTRY_AND_ACCESS_COMPARISON',strutX,strutY,guideX,guideY,keeperClosedX,bareR,phases,rows,members,stowedMembers,
  finalBridgeTranslation:[2818,430,-103],legAxes:[[13013,4400],[13893,4400]],
  fits:{barWest:3,barEast:2,yEach:4,shoulderToSpine:2,shoulderToKeeper:2,shoulderToRails:4},
  fabricationPlacementPerPart:.5,minimumFreeFitAfterTwoFabricationAllowances:1,machinedTrackTolerancePerPart:.2,trackSideGapAfterBoth:.1,
  entry:{minimum:min(entryRows),contacts:contactRows,allPositive:entryRows.every(r=>r.value>0)&&contactRows.every(r=>r.minimumVerticalSeparation===0),
   guideMotionMinimum:min(gateMotionRows),guideMotionAllPositive:gateMotionRows.every(r=>r.value>0),
   rejectedRaised56GateSignedGap:signedGap(oldEntryBar,oldGate),rejectedLowerFirstGateSignedGap:signedGap(wrongOrderGate,fixedUpper),
   method:'Exact segment/Minkowski-box distance for complete498mm entry,88mm landing, ordered268/158mm gate slides, actual slotted rail solids and handle straps. Only the two specified shoulder/bearing contacts are intentional. The old raised56mm gate still crossed the incoming long strut; reversing the required keeper order collides the two gates.'},
  shoulderBeforeLanding:{bottom:1170,top:1176,lowerGuideBottom:1203,gap:27,upperStowedGateTop:1155,gateGap:15},
  shoulderFinal:{bottom:1082,top:1088,bearingTop:1082},
  gateSequence:['Both gates stowed: lower1060, upper1140; both captive pins visibly indexed.',
   'Insert full carrier498mm east, lower88mm onto both shoulder bearings; both workers retain grips.',
   'Raise upper gate268mm to1408 and engage its positiveM6 witness pin before moving lower.',
   'Raise lower gate158mm to1218 and engage its positiveM6 witness pin; release handling only after all four witnesses are verified.',
   'Removal reverses this: lower gate down first, then upper; upper cannot be lowered through an elevated lower gate.'],
  gateMaximumStowedTop:1155,trackMaximumTop:1427,heldGripOriginalZ:1685,heldGripFinalZ:1582,holdToTrackVerticalGap:1582-40-1427,
  maximumOuterSpineX:13893+62,frameEast:13960,outerReserve:5,
  latchForceN:1500,latchShearMPa:1500/(Math.PI*6**2/4),gateClearSpan:44,
  gateBendingMPa:(1500*44/4)/(30*4**2/6),endTabBearingMPa:1500/(2*4*30),trackWestLipBendingMPa:(750*5)/(30*3**2/6),
  bearingContactAreaEach:160,bearingStressMPa:500/160,
  structuralComparison:{steelYieldMPa:355,comparisonDivisor:1.1,guideBandN:1500,eachShoulderN:500,horizontalN:250,
   rearSpineSection:[20,200],rearNeckSection:[20,80],spineTop:1427,spineHeight:L,neckHeight:l,
   spineStressMPa:(M+F*L)/(200*20**2/6),spineDeflectionMM:spineDeflection,
   baseFrame:'80x80x5 SHS perimeter/columns/crossbeams entirely below850, with actual moment connections or braces inside the reserved base.',
   baseColumnStressMPa:(M+F*L+F*850)/(frameI/40),baseColumnDeflectionMM:baseDeflection,
   remainingEastReserveAfterBothDeflectionsAnd1mmFabrication:5-spineDeflection-baseDeflection-1,
   anchorEach:{tension:2000,shear:500},floorAtWestEast:[-(12960-12150)/80,-(13960-12150)/80],levellingDifferenceMM:12.5,
   qualification:'These are signed comparison demands and elastic bounds, not installed capacities. Qualify actual base members, joints, floor, anchors, tolerance and deflection; do not claim freestanding stability or pan anchorage.'},
  frameChange:'The1000x400 frame is110mm east of the earlier comparator; finalR425 cylinder cart has35mm to its west edge. Two handle grips extend2mm west of the frame at their native stations and are separately enumerated; actual cart and crew checks must include them.'};
}

export function assertBridgeNativeHouse(H){
 // The recovered private calculation used authored 2026-11-11 dimensions.
 // Fail closed if its main-house geometry is no longer the same.
 // water-replan.json is an upstream historical geometry used to compose
 // the house; its raw 595 mm cylinder is not the selected inhabited service.
 // Bind the guard to the *composed* current selected house, not that input.
 assert.deepEqual(H.architecturalServices.plant.cylinder.body,[9450,3870,760,760]);
 assert.deepEqual(H.architecturalServices.plant.cylinder.centre,[9830,4250]);
 assert.deepEqual(H.architecturalServices.plant.cylinder.westSeat,[10195,3970]);
 assert.deepEqual(H.plantReferenceDoor.fullyOpenEastLeaf,[9397,3534,762,44]);
 assert.equal(H.shell-H.envelope,11570.5);
}

export function deriveBridgeNative(){
 assertBridgeNativeHouse(deriveCurrentHouse().model);
 controlRows=[];controls();
 return {status:'DEVELOPMENT_NOT_ADOPTED',units:'mm, N, kg',requiredRemoteClearance:25,bodyRadius:300,handRadius:50,armRadius:40,
  toolChecks:toolChecks(),nativeCarrier:nativeCarrier(),controlChecks:controlRows,positiveCapture:positiveCapture(),receiver:receiverNative(),
  assumptions:{massUpperBoundKg:20,bodyHeight:2000,shoulderHeight:1450,reachUpperBound:600},
  holds:['The nominal native geometry is a reference assembly contract; complete component drawings, manufacturing tolerances and loaded physical qualification remain required.',
   'Retained pressure ends and safety relief remain independently supported and connected as applicable. Isolate, cool, prove zero pressure and control retained water before the first union is touched.',
   'Physical fitting tolerances, actual mass/CG, welds, anchors, torque and native assembly qualification remain owned evidence duties.']};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const r=deriveBridgeNative();
 if(process.argv.includes('--write'))writeFileSync(new URL('bridge-native.json',import.meta.url),JSON.stringify(r,null,2)+'\n');
 console.log(JSON.stringify({tools:r.toolChecks.map(t=>({side:t.side,minimum:t.minimum,reach:t.maxReach})),controls:r.controlChecks,carrier:r.nativeCarrier,receiver:r.receiver.fits},null,2));
}
