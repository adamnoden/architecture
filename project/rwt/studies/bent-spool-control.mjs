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

export function bentSpool(){
 const s=readSelected(),slope=50/4250,theta=Math.atan(slope),n=[Math.cos(theta),0,-Math.sin(theta)],v=[Math.sin(theta),0,Math.cos(theta)],u=[0,1,0],
  anchor=[7350,6950,-775],axis=x=>anchor[2]-(x-anchor[0])*slope,
  inletCorner=[6575,6950,axis(6575)],outletCorner=[12950,6950,axis(12950)],
  inletPort=add(inletCorner,v,303),horizontalIn=add(inletCorner,n,303),horizontalOut=add(outletCorner,n,-303),freeOutlet=add(outletCorner,v,-303),
  flangeZ=-380,flange=add(inletCorner,v,(flangeZ-inletCorner[2])/v[2]),collector=add(inletCorner,v,(-200-inletCorner[2])/v[2]),
  fixedFlangeAxial=25,movingFlangeAxial=25,R=142.5,tolerance=5,drop=40;
 const inletBox=[6490,6855,inletCorner[2]-85,460,190,460],outletBox=[12575,6855,outletCorner[2]-375,460,190,460];
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
  wholeMinimumX=Math.min(xMin,6400-tolerance),wholeMaximumX=Math.max(xMax,13100+tolerance),
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
 const portDistance=(horizontalOut[0]-horizontalIn[0])/n[0],socketEngagement=303-272,
  straightCut=portDistance+2*socketEngagement,upperStubPortToFace=(flangeZ-inletPort[2])/v[2],
  copperPerM=8960*pi/4*(.159**2-.155**2),waterPerM=1000*pi*.155**2/4,
  upperStubMaximumCut=upperStubPortToFace+31+25,
  tubeMetal=(straightCut+upperStubMaximumCut)/1000*copperPerM,tubeWater=(straightCut+upperStubMaximumCut)/1000*waterPerM,
  bendsMetal=2*6.15,bendsWaterGrossBound=2*.380*.170*.380*1000,movingFlange=7,
  spoolWetBound=tubeMetal+tubeWater+bendsMetal+bendsWaterGrossBound+movingFlange;
 const frameLength=6700,frameStart=6400,frameEnd=frameStart+frameLength,steelDensity=8000,
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
 const hardwareMinimum=6400,hardwareMaximum=13100,straightWet=straightCut/1000*(copperPerM+waterPerM),
  stubWet=upperStubMaximumCut/1000*(copperPerM+waterPerM),bendWetEach=(bendsMetal+bendsWaterGrossBound)/2,
  frameRailMass=rhsArea*(2*frameLength)/1e9*steelDensity,frameCrossMass=frameMetal-frameRailMass,
  knownMomentMin=straightWet*(horizontalIn[0]+horizontalOut[0])/2+stubWet*flange[0]+bendWetEach*(inletBox[0]+outletBox[0])+movingFlange*flange[0]+frameRailMass*(frameStart+frameEnd)/2+frameCrossMass*wheelStations.reduce((a,b)=>a+b,0)/4,
  knownMomentMax=knownMomentMin+bendWetEach*(inletBox[3]+outletBox[3]),packageMass=designMovingKn*1000/g,
  cgMin=(knownMomentMin+remainingHardwareKg*hardwareMinimum)/packageMass,
  cgMax=(knownMomentMax+remainingHardwareKg*hardwareMaximum)/packageMass,
  parkedCg=[cgMin+translation,cgMax+translation],cradles=[12900,17800],liftPoints=[7900+translation,11600+translation],
  misplacedDraw=1400;
 const postSources=s.model.renewal.joint.railReference;
 const lockedAllY=[Math.min(...gated.map(o=>o.locked90Y[0]),frameY[0]),Math.max(...gated.map(o=>o.locked90Y[1]),frameY[1],7300+25+tolerance+deformation)];
 const template=s.model.model.maintenanceRainReference.eastMaintenance,oldRoofArea=template.roof.regions.reduce((a,p)=>a+p[2]*p[3]/1e6,0),
  addedRoofArea=2.325*.100;
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
  completeAngularProof:{method:'For each vertex of each full enclosing solid, each coordinate is A+Bcos(phi)+Csin(phi). Enumerate0/90and every interior stationary angle atan2(C,B)+k*pi. A linear coordinate reaches its extrema at a prism vertex. This proves the WHOLE CONTINUOUS0..90solid hull, not sparse angle samples.',
   angleDegrees:[0,90],rollDirection:'Inlet leg SOUTH, outlet leg NORTH',dropBeforeRoll:drop,toleranceEachFace:tolerance,
   toleranceRole:'Explicit5mm rigid-position/construction envelope. It is not a measured fabrication tolerance or an allowance for arbitrary support deflection.',
   sweeps,downstreamNorthReserve:7375-downSweep.angular[1].maximum,downstreamSouthReserve:downSweep.angular[1].minimum-6425,
   inletFlangeSouthReserve:flangeSweep.angular[1].minimum-6425,
   rootWarning:'Intermediate angles govern. The nominal native-outlet box peaks north at about76degrees; endpoint-only clearance is invalid.',bridgeCases},
  spatialStateProof:{gated,fieldY,rigidEnvelope:tolerance,deformationEnvelope:deformation,
   role:'Bends/flange roll outside all actual bridge X for the ENTIRE angular interval. Only round tube and fixed carrier frame occupy the bridge during roll. Both ends enter supports only after positive90lock; constant950strip comparison above remains visible.',
   lockedTranslationMinimumSouthReserve:lockedSouth,lockedTranslationMinimumNorthReserve:lockedNorth,
   frameY,bridgeCasesAfterDeformation:bridgeCases.map(b=>({...b,minimumClearance:b.minimumClearance-deformation})),
   controls:{misplacedDraw,misplacedFlangeAllX:[flangeSweep.angular[0].minimum+misplacedDraw,flangeSweep.angular[0].maximum+misplacedDraw],
    misplacedWholeFlangeInsideCourtBeam:flangeSweep.angular[0].minimum+misplacedDraw>7650&&flangeSweep.angular[0].maximum+misplacedDraw<8250,
    unlockedFullRotationInPortalMaximumZ:flangeSweep.angular[2].maximum+deformation-misplacedDraw*slope,
    portalUnderside:-630,unlockedWouldHitBridge:flangeSweep.angular[2].maximum+deformation-misplacedDraw*slope>-630,
    fullAngularConstantStripAfterDeformation:7375-downSweep.angular[1].maximum-deformation,
    latterSatisfies25:false},
   locks:'Independent positive0/90locks at inlet-side and driven collars. Capture/verify BOTH90locks before draw; a drive brake alone cannot be treated as a rigid lock along the copper tube. Actual metal interlock prevents draw with unlocked/misplaced roll; it is not an operator reminder.'},
  renewal:{translation,rolledMinimumX:xMin,rolledMaximumX:xMax,wholePackageMinimumX:wholeMinimumX,wholePackageMaximumX:wholeMaximumX,
   park:[12250,parkEnd],stage:[12250,8100,stageLength,1200],
   requiredDeckEnd:deckEnd,originalSelectedDeckEnd:16200,extensionBeyondSelected:deckEnd-16200,
   stageGrowthBeyondOld4700Control:stageLength-4900,
   terminalReceiverOrdinaryDuringDraw:false,
   handling:'No worker occupies the receiving basin. Once captured, open native outlet moves WITH full spool; moving projection/residual discharge can leave the basin during renewal, so drain/isolate, positively cap/capture residual liquid BEFORE roll. Full wet mass remains charged despite this operation. Existing80catch is no full-event backup.',
   framing:'7000long reference includes full6700carrier, complete bends/flange and5mm envelope; the frame rather than the bare pipe governs park. Support as rare temporary work is permitted in principle, not automatically permanent-deck enlargement.',
   lowerCradleX:[12900,17800],liftingPointLocalX:[7900,11600],
   cgBound:{packageMassKg:packageMass,unallocatedHardwareKg:remainingHardwareKg,hardwareX:[hardwareMinimum,hardwareMaximum],
    localX:[cgMin,cgMax],parkedX:parkedCg,liftingPointWorldX:liftPoints,
    basis:'Uniform straight/stub tubes, native bend wet gross-box masses anywhere within their FULL X bounds, native flange, actual rails/crossmembers; ALL remaining hardware anywhere in6400..13100. No convenient centred hardware assumption.',
    liftMinimumCgReserve:Math.min(parkedCg[0]-liftPoints[0],liftPoints[1]-parkedCg[1]),
    lowerCradleMinimumCgReserve:Math.min(parkedCg[0]-cradles[0],cradles[1]-parkedCg[1]),
    lowerCradleReactionRangesKn:cradles.map((_,i)=>parkedCg.map(x=>designMovingKn*(i?(x-cradles[0]):(cradles[1]-x))/(cradles[1]-cradles[0])))},
   hoist:'Actual rated hoist/spreader/rigging must carry full package and complete3D incoming/outgoing envelope. Use explicit at-least7.5kN support-action screen for a5kN suspended load including rigging; no old5kN/1700lift pass is inherited. Outgoing leaves before incoming enters; no loaded upperbearers.',
   actualSupportsAndSiteAccepted:false,fullExportSweepAccepted:false},
  actualPostTranslation:{source:'HAD renewal.joint.railReference',supportX:postSources.supportX,sidePostY:postSources.sidePostY,
   actualPostSection:postSources.postSection,wholeLockedY:lockedAllY,
   minimumToSouthColumn:lockedAllY[0]-(6350+25),minimumToNorthColumn:(7450-25)-lockedAllY[1],
   includes13500:true,
   role:'Full translation invariant Y bound checks every actual50column including13500, separately from narrower RC node/bridge faces. Wheel is REMOVED before draw; otherwise its200radius can hit a post. Shaft25radius included. Real larger footings/connection plates are not silently reduced to50column.',
   anchorsAndFootingsAccepted:false},
  loads:{tubeMetalKg:tubeMetal,tubeWaterKg:tubeWater,twoActualBendsMetalKg:bendsMetal,bendWaterGrossBoxBoundKg:bendsWaterGrossBound,
   movingFlangeKg:movingFlange,fixedUpperFlangeKg:7,spoolWetBoundKg:spoolWetBound,
   bendWaterBoundary:'Gross380×170×380 outer boxes bound water in the two real bends; deliberately loose, not a measured bore volume. No dry-only lifting assumption.',
   frame:{section:[80,40,4],length:frameLength,start:frameStart,end:frameEnd,grossY:[6475,7325],bareKg:frameMetal,
    wheelStations,maxInternalSpan,westOverhang:wheelStations[0]-frameStart,pipeAxisAboveFrameTop:130,depth:80,
    boundary:'Four captured rolling supports plus fixed lower rails are separate real solids/load paths; these bare rails/crossmembers do not prove clamps, rotation bearings, wheels or guides.'},
   knownWetIncludingBareFrameKg:spoolWetBound+frameMetal,designMovingKn,remainingHardwareKg,
   supportReactionRequirement:{compressionEachKn:8.5,upliftEachKn:4.0,totalCorrelatedGravityKn:4.5,
    basis:'Adjacent1550support pair with1350overhang:4.5*(1+1350/1550)=8.419compression and4.5*1350/1550=3.919uplift bound even the whole design load at the adverse tip. These are correlated requirements, not34kN simultaneous gravity. Actual multi-contact/frame/rail elasticity still must be checked.'},
   capture:'Broad150long metal-lined split saddles isolate thin copper from point roller contact.220OD/170ID/40axial steel races; two50rollers per station; 0/90positive pins. Do not put loaded hard rollers or chain jaws directly on159×2copper and invent a denting pass.',
   rollTorqueRequirement:{workingNm:500,holdingNm:1000,manualRatio:60,handwheelRadiusMm:200,
    efficiencies:[.15,.25,.4].map(efficiency=>({efficiency,handForceN:500/(60*efficiency*.2)})),
    actualGearRated:false,actualHandAndRestraintAccepted:false},
   driveState:'Driven collar12400 is outside bridge and before outletbox12568. Vertical input atY7300 to+1250 stays clear of pipe/bend; removable200radius handwheel operates ABOVE1100guard from fixedNfield. Remove wheel before draw; shaft/collar stay outside all bridgeX throughout east translation. Operator does not follow into posts/rack.',
   upstreamLock:'Second independent collar lock near7000 must be positively operated/witnessed through a small retained low-force link from fixedcourt; do not substitute copper torsional stiffness or a downstream brake. Actual link/lock/interlock solids and operator sweep remain an internal exit.',
   supportHold:'Do not borrow the previous3kN/4700frame result. Actual initial1350west overhang, bends/gross blocked water, four moving support reactions, fixed rail/post/drop-bracket/head reactions, deformation and all translated states must be priced against current STR. No imaginary post through RC.'},
  wellAndCrew:{oldWell:[6125,6300,1525,1100],proposedClearWell:[6125,6200,1525,1200],southWidening:100,
   existingFloor:-950,proposedCatchFloor:-1100,localLowering:150,crewPlatformLevel:-800,
   operatorCentre:[7000,6525],radius:300,bodyPlan:[6700,6225,600,600],minimumSouthOpeningReserve:25,
   retainedPanDuringFirstRelease:{module:2,plan:[6430,6850,305,550],status:'Fully seated and positively captured on qualified fixed seats; never suspended over the worker.',
    bodyPlanGap:25,localBottomThicknessProposal:3,undersideClearanceControl:-205,
    reason:'Bottom/walking frame must leave actual upper bolt/socket/withdrawal toolspace, not use an unlocated stiffener. Extra metal and pressure/blocked-water/cover loads require actual pan design.'},
   platformPlan:[6700,6225,600,600],
   platform:'Retain−800 working level on a temporary600square platform, wholly SOUTH of pipe and retained pan2. Two independently supported/joined300×600 captured halves pass actual west gate/weather/parked leaf. Both bridles attach BY HAND while supported/occupied; remove joining/foot restraints only with positive capture, exit, THEN lift halves. Full5kN/200square and5kPa/feet/joints remain real. Remove before roll.',
   entry:'New near-vertical south service ladder uses the same finite south gate/ramp control, not the old west4-rise stair under retained north module2. Upper south opening/edge/guard must move with the100well widening; a deeper floor alone makes no head aperture.',
   head:'Full R300 head/body domain must clear retained pan2 and fixed upperfloor. Other nine covers/gutters and small seam piece are captured/removed before entry; pan2 remains until inlet joint released and crew/platform have exited. No inherited all-ten-removed sequence pass.',
   catchFloor:'Catch floor/tray is not a soil-retaining RC box or staff-load platform. Price separate support, local80gravity drain/head, corrosion/leak witness and bounded remaining pipe-water spill. Ordinary/fault receiving and groundwater remain real site conditions.'},
  rimAndWeather:{roofSouth:6100,oldRoofSouth:6200,roofAddedM2:addedRoofArea,roofGrossM2:oldRoofArea+addedRoofArea,
   newSouthPosts:[[5450,6050],[7625,6050]],oldSouthPosts:template.roof.temporaryPosts.slice(0,2),postFoot:100,
   southBund:6150,oldSouthBund:6250,roofUnderside:1970,southGateClear:[6650,7350],gateY:6150,
   southRamp:[6675,5750,650,450],rise:30,slope:30/450,
   consequence:'Deliberate100south well/rim replan: upper opening, guard/gate, rim support, one captured100strip closure, shortened ordinary ramp/removable tip, sealed bund and BOTH south temporary posts shift. The existing south feet otherwise lie on the moved bund; no collision is hidden.',
   rainAccounting:{addedGrossLps:addedRoofArea*216/3600,addedNetAssignedCatchmentM2:0,
    boundary:'Added100roof strip is wholly within current court4250..7750square; it redirects already assigned court rain to N, not a new catchment credit. Existing outside-court roof strips and actual N full-event/temporary-pipe duty still need the complete overlap ledger.'},
   ordinaryAndWeatherAccepted:false},
  sequence:['Verify intact N full-duty and actual receiving/weather conditions before E isolation. All selected/admitted passive states remain required.',
   'Erect the source-owned enlarged roof/bund/entry, moved south feet and guarded south service opening while all walking covers intact; prove real drainage/laps/escape.',
   'Capture/remove nine covers/gutters and seam piece; keep ONLY north module2 fully seated/captured. Install/capture actual temporary lower work platform and south ladder; supported pipe frame/rotation restraints already engaged.',
   'Enter clear R300 staff zone. Operate ONE vertical inlet joint with actual top tool/lower counter-spanner. Retain gasket/nuts/bolts; retract every bolt clear. No downstream connector exists.',
   'Use captured support to separate gasket/drop pipe initially; staff exits. From above remove the retained pan2/upper flange, then capture/remove platform halves and ladder. Keep pipe locked on real supports; no overhead pan/platform manipulation with crew below.',
   'With all personnel outside sweep, lower total40 and roll complete spool90SOUTH on captured positively controlled bearings. Stop/lock at every state; full blocked mass and independent anti-roll/axial retention remain.',
   'Draw complete rolled spool east along actual falling captured rails through ALL three actual bridges; land/restrain before any hoist transfer. Pay full derived long stage, outgoing removal and incoming delivery.',
   'Reverse complete incoming spool: lower locked orientation, draw WEST, rotate back only in actual well/receiver clearances, install supported staff platform/ladder then pan2/upper flange, align/raise and restore inlet joint with crew outside load path. Test joint/catch/free outlet while covers open, then all cover/weather/ordinary access states in order.'],
  technicalHolds:['Actual vertical-joint whole tool/nut/bolt withdrawal and head/torso/hand solids/torque; catalogue flange/fastener/gasket/braze/clock still require exact source. No native hardware pass is assumed.',
   'Captured roll bearings/positive stops/brake, full wet/obstruction masses, initial/translated support reactions, wheels/rail/sidepost/drop brackets and entire export/incoming/hoist states. Bare frame is not proof.',
   'Actual100upperfloor/rim/guard-weather reconstruction and600×900 staff-platform support/half-module joints/entry/exit. No fixed floor aperture or old stair pass is inherited.',
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
 let s='<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1220" viewBox="0 0 1600 1220"><rect width="100%" height="100%" fill="#fbfaf5"/><g fill="#283e43" font-family="sans-serif">';
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
 s+=text(45,1052,`Known wet spool${o.loads.spoolWetBoundKg.toFixed(2)}kg +bareframe${o.loads.frame.bareKg.toFixed(2)} =${o.loads.knownWetIncludingBareFrameKg.toFixed(2)}kg BEFORE hardware.`,20);
 s+=text(45,1088,'Locked90only: actual bridge crown36.0/50.1/78.0 after rigid+deformation envelopes; misplaced/unlocked roll hits bridge.',18);
 s+=text(45,1124,'Actual13500columns checked separately; no larger footing/collar/drive/rail support pass follows from the50column.',18);
 s+=text(45,1160,'Well/upperrim100south, catchfloor−1100, temporary−800crewplatform, retainedpan first-release and all reversal still require joined solids.',18);
 s+=text(45,1195,'No downstream working platform. No hydraulic/first-wet/site/physical adoption. RWT06 remains STARTED and incomplete.',18);
 return s+'</g></svg>\n';
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
 const o=bentSpool();for(const[p,t]of[['bent-spool-control.json',JSON.stringify(o,null,2)+'\n'],['bent-spool-control.svg',renderBent(o)]]){
  const path='project/rwt/studies/'+p;if(process.argv.includes('--check'))assert.equal(fs.readFileSync(path,'utf8'),t);else fs.writeFileSync(path,t);
 }
 console.log('One-ended native bent-spool continuous angular control reproduced; adoption remains false.');
}
