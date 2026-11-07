/** One finite upper-first successor. Default710 bent-spool result remains reproducible and unadopted. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {bentSpool} from './bent-spool-control.mjs';
const g=9.81,pi=Math.PI;
const corners=b=>[0,1].flatMap(i=>[0,1].flatMap(j=>[0,1].map(k=>[b[0]+i*b[3],b[1]+j*b[4],b[2]+k*b[5]])));
const add=(a,b,k=1)=>a.map((x,i)=>x+k*b[i]);
const boxRange=b=>[0,1,2].map(i=>[b[i],b[i]+b[i+3]]);
const hull=points=>[0,1,2].map(i=>[Math.min(...points.map(p=>p[i])),Math.max(...points.map(p=>p[i]))]);
const expand=(r,d)=>r.map(x=>[x[0]-d,x[1]+d]);
const separation=(a,b)=>{
 const gaps=a.map((r,i)=>Math.max(r[0]-b[i][1],b[i][0]-r[1]));
 return {gaps,clearAxis:['X','Y','Z'][gaps.indexOf(Math.max(...gaps))],minimumGuaranteedAxisGap:Math.max(...gaps),separated:gaps.some(x=>x>0)};
};
function rearFixture(upper){
 const density=8000,parts=[],rhs=(id,box,section,axis)=>{
  const[H,B,t]=section,L=box[axis+3];parts.push({id,box,section,axis,nominalKg:(H*B-(H-2*t)*(B-2*t))*L/1e9*density});
 };
 rhs('EW-torsion-base',[6125,7225,-680,1525,100,100],[100,100,5],0);
 for(const x of[6662.5,7325]){
  rhs(`upright-${x}`,[x-25,7225,-580,50,100,240],[100,50,5],2);
  rhs(`NS-arm-${x}`,[x-25,7200,-340,50,140,100],[100,50,5],1);
 }
 for(const y of[7200,7340])rhs(`EW-bearing-${y}`,[6687.5,y-25,-340,612.5,50,100],[100,50,5],0);
 for(const x of[6750,7025])for(const y of[7200,7340])parts.push({id:`seat-${x}-${y}`,box:[x-15,y-15,-240,30,30,35],nominalKg:30*30*35/1e9*density});
 parts.push({id:'west-formed-drop-plate',box:[6117,7200,-700,8,150,495],nominalKg:8*150*495/1e9*density},
  {id:'east-formed-side-plate',box:[7650,7200,-700,8,150,425],nominalKg:8*150*425/1e9*density});
 const nominalBareKg=parts.reduce((a,p)=>a+p.nominalKg,0),attachmentsBudgetKg=4;
 const cases=[{id:'actual200-point',point:5,uniform:0,upset:0},{id:'5kPa-distributed',point:0,uniform:5*.305*.55,upset:0},
  {id:'point-plus-distributed-adverse',point:5,uniform:5*.305*.55,upset:0},{id:'reference-capture-upset',point:0,uniform:0,upset:-1.5}];
 const range=()=>[Infinity,-Infinity],bound={front:range(),rear:range(),west:range(),east:range(),globalMx:range(),torsionEachUnshared:0};
 const update=(r,x)=>{r[0]=Math.min(r[0],x);r[1]=Math.max(r[1],x);};let count=0,governingFront=null,governingRear=null;
 const metal=parts.map(p=>({F:p.nominalKg*g/1000,x:p.box[0]+p.box[3]/2,y:p.box[1]+p.box[4]/2}));
 const attachments=[{kg:0,x:6125,y:7175},...[6125,7650].flatMap(x=>[7175,7365].map(y=>({kg:attachmentsBudgetKg,x,y})))];
 for(const c of cases)for(const px of[6835,6940])for(const py of[6950,7300])for(const dx of upper.ranges[0])for(const dy of upper.ranges[1])for(const wf of[0,1])for(const wx of upper.ranges[0])for(const wy of upper.ranges[1])for(const attachment of attachments){
  const pan=[{F:upper.dryReferenceKg*g/1000,x:dx,y:dy},{F:upper.maximumWaterReferenceKg*g/1000*wf,x:wx,y:wy},
   {F:c.point,x:px,y:py},{F:c.uniform,x:6887.5,y:7125},{F:c.upset,x:upper.flangeCentre[0],y:6950}],
   panF=pan.reduce((s,p)=>s+p.F,0),rear=pan.reduce((s,p)=>s+p.F*(p.y-7200)/140,0),front=panF-rear,
   loads=[...pan,...metal,{F:attachment.kg*g/1000,x:attachment.x,y:attachment.y}],
   west=loads.reduce((s,p)=>s+p.F*(7650-p.x)/1525,0),east=loads.reduce((s,p)=>s+p.F*(p.x-6125)/1525,0),
   mx=loads.reduce((s,p)=>s+p.F*(p.y-7275)/1000,0),absoluteTorsion=loads.reduce((s,p)=>s+Math.abs(p.F*(p.y-7275)/1000),0);
  update(bound.front,front);update(bound.rear,rear);update(bound.west,west);update(bound.east,east);update(bound.globalMx,mx);
  bound.torsionEachUnshared=Math.max(bound.torsionEachUnshared,absoluteTorsion);count++;
  if(!governingFront||front>governingFront.front)governingFront={case:c.id,front,rear,px,py,waterFull:!!wf,dx,dy,wx,wy};
  if(!governingRear||rear<governingRear.rear)governingRear={case:c.id,front,rear,px,py,waterFull:!!wf,dx,dy,wx,wy};
 }
 const westReturn={type:'ONE proposed NS200×300 CANTILEVER into the proposed EW6025rim tied to actual court-W/E',box:[5925,6025,-480,200,1340,300],
  rootAxis:[6025,6025],rootEWSpanAxesX:[3950,7950],headLoadY:7275,loadArmM:1.25,freeEndY:7365,
  baselineRC:[-180,-380],proposedRC:[-180,-480],rawBoundingM3:.2*.3*1.34,rawBoundingConcreteKn:.2*.3*1.34*25,
  overlapWithAlreadyPricedEWRimM3:.2*.3*.1,outsideOverlapM3:.2*.3*1.24,
  incrementalOverRC200OutsideOverlapM3:.2*.1*1.24,netGlobalAdditionalGKn:.2*.1*1.24*25,
  baselineBoundingGKn:.2*1.34*7.5,extraBoundingConcreteGKn:.2*.1*1.34*25,
  localBoundingTotalGKn:.2*1.34*7.5+.2*.1*1.34*25,localBoundingQKn:.2*1.34*4,
  localRootVerticalReferenceKn:[bound.west[0]+2.68,bound.west[1]+2.68+1.072],
  localRootMomentReferenceKnM:[bound.west[0]*1.25+2.68*.67-bound.torsionEachUnshared,bound.west[1]*1.25+2.68*.67+1.072*.67+bound.torsionEachUnshared],
  loadRole:'The local screen conservatively retains the entire1340rectangular strip, including100overlap in the EW rim. Global addition deducts that overlap and the already-budgeted RC200. Baseline G is REROUTED, not added again. Independent action extrema here are a conservative pre-combination envelope, not an actual ULS load case.',
  supportRole:'A1.25m load arm is a real cantilever into the proposed4m EW rim and actual court-W/E lines. Its root moment becomes added EW-rim twist/joint demand. Actual T-joint torsion, longitudinal/closed steel, anchor cage, edge and positive support all require proof.',
  rejectedNorthSupport:{point:[6025,7700],existingEWGirder:false,authority:'STR current-house-grid: Y7700 head/bridge line is east-side only. No simply-supported NS beam or unowned north reaction is credited.'},
  structurallyAccepted:false};
 const I=(50*100**3-40*90**3)/12,Z=I/50,E=193000,
  crossbarPoint=Math.max(Math.abs(bound.front[0]),Math.abs(bound.front[1]),Math.abs(bound.rear[0]),Math.abs(bound.rear[1]))*1000,
  span=612.5,crossM=crossbarPoint*span/4,crossDef=crossbarPoint*span**3/(48*E*I),
  panOverhang=7200-6850,panPointMoment=5000*panOverhang;
 return {parts,westReturn,nominalBareKg,attachmentsBudgetKg,nominalFixedReferenceKg:nominalBareKg+attachmentsBudgetKg,
  entireBounds:hull(parts.flatMap(p=>corners(p.box))),positionAndDeformationEachFace:10,
  connectionForcePlanesX:[6125,7650],connectionReferenceZ:-630,memberTop:-580,memberBottom:-680,
  connectionType:'The100×100box is welded to deliberate end/drop plates.−580 is its TOP, not an under-bearing seat. Actual load transfer and positive anchors must be proved; no loose bearing is assumed.',
  panBearingY:[7200,7340],seatTop:-205,panCapture:'Positive front AND rear uplift capture is required during ordinary walking and joint-tool work. Capture upper assembly independently before releasing these TOP-access keepers, only after lower crew exits. No fixed undercut remains in the upward export.',
  nominalActionDomain:{cases:count,pointKn:5,pointPrint:[200,200],pointCentres:{x:[6835,6940],y:[6950,7300]},distributedKpa:5,
   upperDryReferenceKg:upper.dryReferenceKg,upperWaterKg:[0,upper.maximumWaterReferenceKg],upperMassLocationBounds:upper.ranges.slice(0,2),attachmentsKg:[0,4],
   proof:'Gravity/contact reactions are affine in inventories and their first moments. Independent0/full water, attachment0/max, permitted location endpoints and actual200square point-centre endpoints bound every intermediate state. Dry upper metal is a nominal fixed mass with bounded location; no full-wet-only reaction assumption.',
   reactionsKn:bound,governingFront,governingRear,
   frontRearRole:'Correlated PAN contacts; the entire pan case is conservatively assigned to one side/rail for local bearing and keeper demand. West/east are whole-fixture end-connection reactions. Do not add independent maxima as a simultaneous case.',
   torsionRole:'globalMx is the signed global NS eccentric moment. Each attachment must be checked against the unshared sum-absolute torsion requirement until STR proves an actual stiffness/distribution; no convenient50/50 torsion split is claimed.',
   referenceUpwardCaptureKn:1.5,captureForceQualified:false},
  isolatedSteelReference:{E,proofStressHypothesisMPa:170,crossbarI:I,crossbarZ:Z,crossbarWorstSimplePointKn:crossbarPoint/1000,
   crossbarSpan:span,crossbarRawStressMPa:crossM/Z,crossbarElasticDeflectionMm:crossDef,
   nominalPanSideRail:[100,50,5],panSouthOverhang:panOverhang,panPointOnlyRawStressMPa:panPointMoment/Z,
   role:'Isolated nominal section screens only. Welds, support stiffness, coupled fixture torsion, local bearing, captive keeper, actual material/wall/rounding and real pan/foot distribution are not accepted.'},
  serviceActions:{horizontalReferenceKn:.6,signedSeparate:['+Fx','-Fx','+Fy','-Fy'],application:[upper.flangeCentre[0],6950,-380],
   boltTorqueReferenceNm:200,flangeNormal:upper.normal,qualifiedRequiredTorque:false,
   role:'Price reference manual bolt reactions and actual attachment-level eccentricity separately from walking loads. This is not a qualified seal torque or a rolling torque transferred from the disconnected lower pipe.'},
  westSupport:{actualRC:[-180,-380],proposedFormedReturnRC:[-180,-480],headWindowZ:[-455,-205],baselineRC200HeadWindowQualified:false,beamTop:-580,beamCentroid:-630,beamBottom:-680,memberTopBelowSoffit:200,connectionCentroidBelowBaselineSoffit:250,connectionCentroidBelowProposedReturn:150,faceX:6125,
   proposedPlate:[6117,7200,-700,8,150,495],
   required:'A deliberately formed8mm drop/end plate and actual positive anchor system must return vertical/uplift/horizontal and eccentric torsion to the explicitly proposed200×300 cantilever deck return and its real EW6025T-joint. No free-edge anchor, unproved sleeve/plate or water-skin penetration pass. West mouth clear above the hanger remains a hydraulic requirement.'},
  eastSupport:{actualGirder:[-180,-630],faceX:7650,headWindowZ:[-425,-275],beamTop:-580,beamCentroid:-630,memberTopAboveSoffit:50,boxBottom:-680,
   proposedPlate:[7650,7200,-700,8,150,425],
   required:'A deliberately FORMED side/end plate and actual positive anchor system must fit the actual bottom bars/outer link. Beam centroid is at soffit while its upper50lies above it; do not substitute an under-beam seat; no afterthought drilling or borrowed P36/P37 capacity. Keep the existing water/renewal passage explicit.'},
  deliveredMassBoundEstablished:false,structurallyAccepted:false};
}
function nativeEndActions(c){
 const q=c.geometry,L=c.nominalSpoolLoads??c.loads,slope=q.fall,t=Math.atan(slope),n=[Math.cos(t),0,-Math.sin(t)],v=[Math.sin(t),0,Math.cos(t)],
  copperPerMm=8960*pi/4*(.159**2-.155**2)/1000,waterPerMm=1000*pi*.155**2/4/1000,wetPerMm=copperPerMm+waterPerMm,
  stubKg=q.upperStubMaximumCut*wetPerMm,bendKg=(L.twoCatalogueBendsMetalKg+L.bendWaterGrossBoxBoundKg)/2,H=L.remainingHardwareKg,HW=c.renewal.cgBound.hardwareX,
  radial=p=>{const r=p.map((x,i)=>x-q.axisAnchor[i]),along=r.reduce((s,x,i)=>s+x*n[i],0);return Math.hypot(...r.map((x,i)=>x-along*n[i]));},
  radii=[q.inletBox,q.outletBox].map(b=>Math.max(...corners(b).map(radial))),flangeRadius=Math.hypot(142.5,Math.abs(q.flange[2]-(-815+(7350-q.flange[0])*slope))/Math.cos(t)),
  knownTorque=bendKg*g*radii.reduce((s,r)=>s+r,0)/1000+(7+stubKg)*g*flangeRadius/1000,
  positionTorque=L.nominalSpoolFullWaterKg*g*.005;
 const ends=['inlet','outlet'].map(id=>{
  const inlet=id==='inlet',X=inlet?7350:12400,free=inlet?7350-q.horizontalIn[0]:q.horizontalOut[0]-12400,
   nativeLever=inlet?X-q.inletBox[0]:q.outletBox[0]+q.outletBox[3]-X,stubLever=Math.abs(7350-q.flange[0]),
   knownMass=bendKg+free*wetPerMm+(inlet?stubKg+7:0),knownMoment=(bendKg*nativeLever+free*wetPerMm*free/2+(inlet?(stubKg+7)*stubLever:0))*g/1000,
   hardwareLever=inlet?X-HW[0]:HW[1]-X;
  return{id,captureX:X,knownNominalWetEndKg:knownMass,knownMomentNm:knownMoment,hardwareAdverseKg:H,hardwareLever,
   combinedReferenceMomentNm:knownMoment+H*g*hardwareLever/1000,combinedReferenceShearKn:(knownMass+H)*g/1000};
 });
 assert(ends.every(e=>Number.isFinite(e.combinedReferenceMomentNm)));
 return {ends,correlation:'Each end plus ALL remaining hardware at that adverse end is a separate reference case, not both masses simultaneously. Fixed rear fixture and upper pan are separate from the moving4.5kN model.',
  rotation:{knownGrossBodyGravityNm:knownTorque,rigidPosition5Nm:positionTorque,unallocatedHardwareKg:H,hardware400mmGravityNm:H*g*.4,
   wholeUnrestrictedReferenceGravityNm:knownTorque+positionTorque+H*g*.4,workingDriveReferenceNm:500,holdingReferenceNm:1000,
   permittedRotatingMassMomentFor500KgM:(500-knownTorque-positionTorque)/g,
   unrestrictedGravityWithin500Reference:knownTorque+positionTorque+H*g*.4<=500,actualGearKeyFrictionAndForceAccepted:false,
   role:'500Nm drive adequacy is not inherited for the entire unrestricted hardware budget. Bound actual rotating versus frame-fixed kit and its moment before selecting a real drive/key/lock; no assumed friction or copper torsional stiffness.'},
  materialRole:'Reference actions, NOT a native braze/endfeed/collar or delivered copper wall/temper rating. Brazing requires annealed material evidence; isolated tube arithmetic supplies no joint/contact pass.',
  primaryEvidence:['https://www.copper.org/publications/pub_list/pdf/copper_tube_handbook.pdf','https://alloys.copper.org/alloy/C12200'],accepted:false};
}

function ordinaryUpperHandler({pan,dimensions,fullWetReferenceKg,bodyTop,roof,guard,allowance}){
 const hoist={model:'KITO CX003',capacityKg:250,nominalBareKg:2.4,standardLift:2500,standardFoldedHandChain:2000,
  topHookToHandChainBottom:2100,hookHeadroom:217,planDimensions:[88,84],ratedLoadAverageHandPullN:147,handChainTravelPerLift:33.8},
  pick=[pan[0]+pan[3]/2,pan[1]+pan[4]/2],headReach=Math.hypot(...hoist.planDimensions),
  installedTop=pan[2]+pan[5],handChainHighestBottom=roof-hoist.topHookToHandChainBottom,
  lidPlanEdgeGap=Math.min(pan[3],pan[4])/2-headReach,
  eyeInset=25,eyes=[[pan[0]+eyeInset,pan[1]+eyeInset],[pan[0]+pan[3]-eyeInset,pan[1]+pan[4]-eyeInset]],
  span=Math.hypot(eyes[1][0]-eyes[0][0],eyes[1][1]-eyes[0][1]),included=60,
  bridleHeight=(span/2)/Math.tan(included*pi/360),minimumBodyTop=guard+allowance+dimensions[2],
  greatestIdealBottomHookZ=roof-allowance-hoist.hookHeadroom,idealMaxBridleHeight=greatestIdealBottomHookZ-minimumBodyTop,
  referenceTrolley={model:'TSP2003',listedHeadroomInches:3.5,listedHeadroomMm:3.5*25.4,listedBareKg:10*.45359237,
   role:'Indicative published trolley dimension only; no local-model compatibility, coupled drawing, real rail or supported bearing plane established.'};
 return {id:'stock-centred-manual-CX003-and-direct-two-leg-bridle',accepted:false,hoist,referenceTrolley,
  primarySources:{cx:'https://kito.co.jp/en/products/cb/cx',manual:'https://kito.co.jp/__/download/63491ff4ea6f804c84950dff/OM-CX1ZZZ-MGE-08.pdf',
   trolley:'https://cdn.kito.ca/fr/manual-trolleys-beam-clamps/ts',role:'KITO CX3 dimension d is the standard top-hook to hand-chain bottom distance. Manual pp6–8 require vertical hand-chain operation, aligned hooks, no chain/load contact and people outside the lifted path. Page13 60° is the direct hook/slings illustration, not allowed hand-chain side pull. Pages12/14 do not qualify this local trolley match or a separation-force limiter.'},
  nominalFullWetPanFractionOfHoist:fullWetReferenceKg/hoist.capacityKg,
  firstPick:{pickXY:pick,installedLidTop:installedTop,roof,entireHeadDiagonalAsHorizontalChainOffsetBound:headReach,
   minimumLidPlanInteriorForAnyHeadYaw:lidPlanEdgeGap,highestStockHandChainBottom:handChainHighestBottom,
   verticalInterferenceAtLeast:installedTop-handChainHighestBottom,
   role:'Even placing the upper hook at the roof, a stock freely hanging loop through the head has legs below the installed walking lid. Both vertical chain projections are inside the continuous lid: even the entire compact plan diagonal is smaller than the shortest pick-to-edge distance. This is a centred stock-loop comparison, not a prohibition on every possible pickup. No chain guide, obstruction, altered chain or side pull credited.',accepted:false},
  guardTransit:{guard,roof,allowancePerBoundary:allowance,minimumBodyTop,greatestIdealBottomHookZ,idealMaxBridleHeight,
   directOppositeEyesXY:eyes,eyeSpan:span,directIncludedAngleLimitDegrees:included,minimumBridleHeight:bridleHeight,
   shortageEvenWithZeroTrolleyRailAndRiggingFittings:bridleHeight-idealMaxBridleHeight,
   earlierBodyTop:bodyTop,availableAboveEarlierBodyTop:roof-bodyTop-allowance,
   earlierBodyTopIndicativeStackDeficit:hoist.hookHeadroom+referenceTrolley.listedHeadroomMm-(roof-bodyTop-allowance),
   role:'An ideal level load and zero-depth trolley/rail are deliberately favourable. Equal-level opposite eyes at this span need at least half-span/tan30 vertical rise at a direct hook, even with perfect placement. This tests the stated simple direct sling geometry, not a master link, short custom yoke or every hoist. The hoist-only negative is independent of the indicative trolley dimension.',accepted:false},
  role:'The upper method fails before any diagonal rail, yaw or landing can be credited. Rating alone does not fix chain path or headroom. Retain the geometric bare-body export reference separately; no actual controlled release, operator/rigging sweep, support, tilt/CG, force limit, landing or reverse event accepted.'};
}

function lowerTrackReference(control,had){
 const {axisAnchor,fall,receiver,faultWater,ordinaryWater}=control.geometry;
 const frame=control.loads.frame,rails=had.renewal.joint.railReference;
 const [bed,bedEnd]=had.passage.bedEnds,axis=x=>axisAnchor[2]-(x-axisAnchor[0])*fall;
 assert.equal((bed[1]-bedEnd[1])/(bedEnd[0]-bed[0]),fall);
 const installedRailTop=x=>bed[1]-(x-bed[0])*fall+rails.topRelativeBed;
 const frameBottom=x=>axis(x)-frame.pipeAxisAboveFrameTop-frame.depth;
 const wheelDiameter=60,wheelTopBelowFrame=5,railTop=x=>frameBottom(x)-wheelTopBelowFrame-wheelDiameter;
 const capWidth=70,capDepth=12,armTopBelowTrack=65,armDepth=60;
 const wheelX=frame.wheelStations[0],crossmemberEndY=rails.axesY[0],legacyInterference=installedRailTop(wheelX)-frameBottom(wheelX);
 const posts=[...rails.supportX,16500,18050],sections=posts.slice(1).map((x,i)=>[posts[i],x]);
 const sectionI=(rails.sectionNS*rails.sectionVertical**3-(rails.sectionNS-2*rails.wall)*(rails.sectionVertical-2*rails.wall)**3)/12;
 const longest=Math.max(...sections.map(([a,b])=>b-a)),P=control.loads.supportReactionRequirement.compressionEachKn*1000,E=200000;
 const distalArmBottom=x=>railTop(x)-armTopBelowTrack-armDepth;
 const drawEnd=frame.wheelStations.at(-1)+control.renewal.translation,receiverEast=receiver[0]+receiver[2];
 const lastReceiverSupport=rails.supportX.filter(x=>x>receiver[0]&&x<receiverEast).at(-1);
 const keeperLegBeyondRailCentre=capWidth/2+5+8,keeperUnderCap=4+8,keeperLowerZ=x=>railTop(x)-capDepth-keeperUnderCap;
 const keeperY=[rails.axesY[0]-keeperLegBeyondRailCentre,rails.axesY[1]+keeperLegBeyondRailCentre];
 return {legacyRailRejected:{wheelX,crossmemberEndY,legacyTop:installedRailTop(wheelX),newFrameBottom:frameBottom(wheelX),
   newFrameTop:frameBottom(wheelX)+frame.depth,topProjectsIntoFrameDepthBy:legacyInterference,
   role:'At the proposed full crossmember to the rail axes, the selected old-bed rail top is inside the new frame depth, not under the wheels. This rejects the inherited under-frame arrangement. It does not infer the shape of unbuilt hardware.'},
  loweredTrack:{trackX:[7650,18050],firstAndLastWheelX:[wheelX,drawEnd],endReserve:18050-drawEnd,travelFall:fall,
   pairedTrackAxesY:rails.axesY,trackSection:[rails.sectionVertical,rails.sectionNS,rails.wall],cap:[capWidth,capDepth],
   wheelDiameter,wheelTopBelowFrame,axleBelowFrameBottom:wheelTopBelowFrame+wheelDiameter/2,railTopBelowAxis:frame.pipeAxisAboveFrameTop+frame.depth+wheelTopBelowFrame+wheelDiameter,
   clipSection:{capEdgeGap:5,keeperLeg:8,underCapClearance:4,keeperToeThickness:8,keeperToeInnerOffset:29,keeperY,
    nominalToeEngagement:capWidth/2-29,nominalToeToRailWeb:29-rails.sectionNS/2,
    referenceLateralMovement:3,engagementAfter3:capWidth/2-29-3,webClearanceAfter3:29-rails.sectionNS/2-3,
    completePlanYWith10:[keeperY[0]-10,keeperY[1]+10],bracketTopBelowTrack:armTopBelowTrack,
    verticalGapToArmAfter10:keeperLowerZ(wheelX)-(railTop(wheelX)-armTopBelowTrack)-10,
    role:'The reference hooks ride outside the cap and below its edges. Their gross envelopes stay above the arm. The much tighter lateral 3mm running-control comparison leaves just 1mm to the rail web. Positive centring, loaded clearances, shaft/fork, welding, seams and end stops remain unqualified.'},
   plateAndWheelRatingsAccepted:false,
   sourceRole:'This is one proposed lower bearing profile, with a new vertical datum. The selected HAD rail level remains a distinct old carrier control. Both rails must continue to the last translated wheel, while the separate lower-spool landing stage remains at Y8100.'},
  fixedSupport:{sections,knownSupportAxes:rails.supportX,proposedTemporarySupportAxes:[16500,18050],
   transverseArmGrossSpan:rails.axesY[0]-rails.sidePostY[0],armDepth,armTopBelowTrack,
   longestSection:longest,isolatedExistingSizeReference:{actionKn:P/1000,elasticModulusMPa:E,I:sectionI,
    pointMomentKnm:P*longest/4/1e6,pointStressMPa:P*longest/4/(sectionI/(rails.sectionVertical/2)),
    pointMidspanDeflection:P*longest**3/(48*E*sectionI),deflectionAlreadyAllowedPerFace:5,
    role:'One conservative single 8.5kN wheel action on an isolated bare, simply supported RHS at its worst midpoint. Section share, cap composite action, weld, correlated multi-wheel loading and actual rail deflection are unqualified.'},
   supportFootprintsAccepted:false,anchorsAndReceiverAccepted:false,
   role:'Use real existing support axes only as locations. An outboard 50 post inside the E receiver plan is neither a qualified water-structure interface nor a pad. At the new east stations, temporary foundations, side arms and the first and last cantilevers must be designed. No added column through the RC.'},
  localSiteConsequences:{receiverEast,ordinaryWater,faultWater,lastReceiverSupport,armBottomAtReceiverSupport:distalArmBottom(lastReceiverSupport),
   armFaultSubmergenceAtReceiverSupport:faultWater-distalArmBottom(lastReceiverSupport),ordinaryWaterGapAtReceiverSupport:distalArmBottom(lastReceiverSupport)-ordinaryWater,
   trackBottomAtReceiverEast:railTop(receiverEast)-capDepth-rails.sectionVertical,
   armBottomAtFarthestSupport:distalArmBottom(posts.at(-1)),localGradeFor500AtFarthestSupport:distalArmBottom(posts.at(-1))-500,
   role:'The lower rail/arm is inside the fault-water envelope where it runs over the active E receiver. It needs a real wet/open drainage/inspection and load path or a revised support position. Grade is a local clearance comparison, not a revised whole-house datum, geotechnical or site finding.'},
  wholeTrackAccepted:false};
}

export function upperFirst(){
 const gridText=fs.readFileSync('project/str/studies/current-house-grid.json','utf8'),grid=JSON.parse(gridText),
  baselineText=fs.readFileSync('project/rwt/studies/bent-spool-control.json','utf8'),baseline=JSON.parse(baselineText),
  c=bentSpool({installedAxisZ:-815,initialDrop:0}),slope=c.geometry.fall,t=Math.atan(slope),n=[Math.cos(t),0,-Math.sin(t)],v=[Math.sin(t),0,Math.cos(t)],u=[0,1,0],
  pan=[6735,6850,-205,305,550,205],F=c.geometry.flange,
  flange=[-142.5,142.5].flatMap(a=>[-142.5,142.5].flatMap(b=>[0,25].map(d=>add(add(add(F,n,a),u,b),v,d)))),
  ranges=hull([...corners(pan),...flange]),dimensions=ranges.map(r=>r[1]-r[0]),
  fixedStubMaximumCut=(180/v[2]+31+25)/1000,copperPerM=8960*pi/4*(.159**2-.155**2),waterPerM=1000*pi*.155**2/4,
  panFullGrossWaterKg=.305*.55*.205*1000,surfacePond15Kg=.305*.55*.015*1000,
  dryReferenceKg=30+7+fixedStubMaximumCut*copperPerM,maximumWaterReferenceKg=panFullGrossWaterKg+surfacePond15Kg+fixedStubMaximumCut*waterPerM,
  upper={pan,ranges,dimensions,flangeCentre:F,normal:v,dryReferenceKg,maximumWaterReferenceKg},fixture=rearFixture(upper),
  fixtureBox=expand(fixture.entireBounds,10),bodyChecks=c.completeAngularProof.sweeps.map(q=>({id:q.id,...separation(fixtureBox,q.angular.map(r=>[r.minimum-5,r.maximum+5]))})),
  axis=x=>-815-(x-7350)*slope,frameBox=expand([[7300,12450],[6475,7325],[axis(12450)-210,axis(7300)-130]],10),
  yawCentre=[(ranges[0][0]+ranges[0][1])/2,6900],radius=Math.hypot(dimensions[0]/2,dimensions[1]/2),
  bodyTop=1700,fullWetReferenceKg=dryReferenceKg+maximumWaterReferenceKg,roof=c.rimAndWeather.roofUnderside,guard=1100,allowance=10;
 const pointInGirder=(p,b)=>b.axis==='x'?p[0]>=b.extent[0]&&p[0]<=b.extent[1]&&Math.abs(p[1]-b.datum)<=b.width/2:p[1]>=b.extent[0]&&p[1]<=b.extent[1]&&Math.abs(p[0]-b.datum)<=b.width/2;
 const existingEWAtNorth=Object.entries(grid.girders).filter(([_,b])=>b.axis==='x'&&pointInGirder([6025,7700],b)).map(([id])=>id);
 assert.equal(existingEWAtNorth.length,0,'Reprove a changed actual north termination; never invent a simply-supported line');
 for(const[id,datum]of[['court-W',3950],['court-E',7950]]){assert.equal(grid.girders[id].datum,datum);assert(6025>=grid.girders[id].extent[0]&&6025<=grid.girders[id].extent[1]);}

 return {identity:'RWT-UPPER-FIRST-SAME-NATIVE-SPOOL-2026-11-07',source:{startingMain:'b0d3102d5522408d256fb8c4c03bb69939e77964',baselineControl:'710d5caa6c03a4abaa0d5c5b6e3668a9d4c66fb1',
   baselineJsonSha256:createHash('sha256').update(baselineText).digest('hex'),had:c.source,
   structuralGrid:{path:'project/str/studies/current-house-grid.json',sha256:createHash('sha256').update(gridText).digest('hex'),courtW:grid.girders['court-W'],courtE:grid.girders['court-E'],courtNW:grid.girders['court-NW'],existingEWAt6025_7700:existingEWAtNorth},
   roles:'Selected HAD is unchanged. This is ONE unadopted same-spool successor; default710 geometry/JSON stays reproducible. Its method text is not inherited into this different release sequence.'},
  selectedGeometryChanged:false,accepted:false,hydraulicAccepted:false,siteAccepted:false,physicalEventPerformed:false,firstSusceptible:null,
  decision:'Install the same pipe40lower and lift the independently captured upper pan/flange first. Eliminate heavy dynamic lowering; keep actual upper mass, positive support/keepers, full export and all native lower capture/lock duties explicit.',
  geometry:c.geometry,completeAngularProof:c.completeAngularProof,spatialStateProof:c.spatialStateProof,frameRollProof:c.frameRollProof,postTranslation:c.actualPostTranslation,
  nominalSpoolLoads:c.loads,pairedToolReference:c.verticalJointReference,wellAndCrew:c.wellAndCrew,rimWeather:c.rimAndWeather,nativeEndActions:nativeEndActions(c),renewal:{...c.renewal,releaseMethod:'UPPER FIRST; ignore the predecessor lower40 sequence. Full nominal CG domain retained; real lifting points/kit/tilt/wind and captured reversal remain unqualified.'},
  zeroDropAtOldDatumRejected:{installedAxis:-775,drop:0,bridgeClearance:baseline.spatialStateProof.bridgeCasesAfterDeformation.map(b=>({id:b.id,minimumClearance:b.minimumClearance-40})),
   proof:'Omitting the old40vertical translation raises EVERY old moving point40 with unchangedX/draw and envelopes. Subtract40 from each exact old bridge reserve. The first flange/bridge fails; zero-drop alone is not a solution.'},
  upperAssembly:{...upper,nominalDryPanBudgetKg:30,nominalFixedFlangeKg:7,fixedStubMaximumCutM:fixedStubMaximumCut,panFullGrossWaterKg,surfacePond15Kg,
   fullWetReferenceKg,captureGravityKn:fullWetReferenceKg*g/1000,referenceCaptureRequirementKn:1.5,
   waterRole:'Gross under-cover205depth plus a separate15mm geometric surface-pond reference.15 is NOT first harm or a qualified maximum head. All partial inventories remain allowed for reactions. Actual delivered mass/maximum water/handler rating is unproved.',
   firstNormalLift:40,firstLiftVector:v.map(x=>x*40),noPersonUnderLoad:'Lower crew/platform operator exits before upper lift. Pan remains fully seated/captured during all bolt work; no suspended-pan working state is inherited.',
   deliveredMassBoundEstablished:false,handlerAccepted:false},
  rearFixture:fixture,
  fullSolidSeparation:{fixtureBox,bodyChecks,frameCheck:separation(fixtureBox,frameBox),
   northWaterTerritoryStartsY:7400,minimumNorthWaterPlanGap:7400-fixtureBox[1][1],
   neighboringPanUnderside:-205,armTop:-240,minimumArmToNeighborAfter10:35-10,
   role:'All fixed rear parts are NORTH of the full inlet/flange/tube angular envelope, or WEST of the outlet. The frame is below them. The upper flangeY does not change during normal lift, so it passes south of both fixed rear bars. Only intended pan/stool contact remains; positive keepers must retract fully. Actual lower lock/drive/rail hardware is not included in this kit pass.',
   translationProof:'East draw0..the declared full translation leaves allY gaps unchanged; the outlet starts east of the fixture and only moves farther east. Falling-frameZ clearance increases with east draw. Locked incoming reversal traverses the same domain. Actual collar/lock hardware still needs its own complete solids.',
   actualKitAccepted:false},
  upperExport:{completeBodyRanges:ranges,bodyTop,bodyBottomAfter10:bodyTop-dimensions[2]-allowance,guardTop:guard,
   minimumOverGuardAfter10:bodyTop-dimensions[2]-allowance-guard,roofUnderside:roof,minimumBelowRoofAfter10:roof-bodyTop-allowance,
   yawCentre,continuousYawRadius:radius,completeYawPlan:[yawCentre[0]-radius-10,yawCentre[1]-radius-10,yawCentre[0]+radius+10,yawCentre[1]+radius+10],
   yawProof:'Translate ONLY after the entire body is above1100guard; then yaw90. Every point of the complete enclosing rectangle stays within its half-diagonal radius, including all intermediate extrema. This is not endpoint sampling.',
   combinedWestGateWeatherY:[6575,7200],unrotatedEachSideWith10:(625-dimensions[1]-20)/2,
   yaw90WidthWith10:dimensions[0]+20,yaw90MinimumEachSide:(625-dimensions[0]-20)/2,
   requiredActorOutsideAllSweeps:true,actorSweepAccepted:false,actualHandlerRiggingAndSweepAccepted:false},
  ordinaryUpperHandler:ordinaryUpperHandler({pan,dimensions,fullWetReferenceKg,bodyTop,roof,guard,allowance}),
  lowerTrackReference:lowerTrackReference(c,JSON.parse(fs.readFileSync('project/had/studies/water-replan.json','utf8'))),
  operations:['N independently full-duty and actual receiving/weather verified; isolate E and prove it drained/depressurised. Full-water weight is still charged. Failure to drain forbids bolt release; no hidden pump, timing credit or assumed free-outlet immunity to blockage.',
   'Keep all rated covers while erecting the same175rim/guard/weather control. Capture/remove nine covers and seam pieces; pan3 remains fully seated with positive walking uplift keepers on the new rear frame. Fit the temporary lower platform/ladder while lower pipe is captured on fixed-height rails.',
   'One lower worker releases all eight vertical-joint bolts with the actual paired tools/postures, captures gasket/nuts and retracts every bolt. Existing finite tool screen is necessary only; real torque/fasteners/full body remain unqualified. Worker exits before any upper lift.',
   'Capture upper pan3/flange/stub as ONE nominal80kg wet assembly using a qualified actual handler. Release its TOP-access walking keepers from above. Lift40 along the matched normal with lower spool stationary; stop/capture, confirm all faces/bolts/seats free. Gasket stiction and handler force limit require real evidence, not unlimited pulling.',
   'Lift the whole upper assembly above guard, translate to6900Y, yaw90 inside the full sweep and export through the real west gate/weather route. Keep personnel outside suspended body; land/restrain before releasing rigging. No30kg cover or manual staff pass is inherited.',
   'Capture/remove platform panels and ladder. The passive rear fixture may remain: its complete declared solids are clear of the full native roll and fixed frame. Roll the pipe90 on actual captured supports/positive locks, then draw only after both locks are witnessed; no heavy lowering occurs.',
   'Complete the actual long outgoing/incoming spool event with corrected independent-water CG. Reverse: return/latch pipe in the same fixed height, remove temporary clearance controls only in order, replace platform/ladder, yaw/return upper pan/flange, seat/capture before worker re-enters, restore joint and test while covers open. Reinstall/test all covers/collector/weather and receiver before E readmission.'],
  holds:['Actual80.44kg reference upper handler, attachment, roof/head/crew path, hard capture/force limit and full incoming reversal; no adopted hoist or physical lift.',
   'Rear steel pan/frame, walking bearing/uplift keepers, west formed RC200 return/hanger and east450girder side-seat/cage/weld/contact proof; no anchors borrowed.',
   'Actual lower collar/positive torque key/0-90 locks/drive/rails and all supported full-spool states; nominal frame/partial-water CG is not an actual-kit or lifting pass.',
   'Maximum hydraulic/temporary-canopy pressure/head, inlet/debris/jump/wave, first-wet, qualified first susceptible boundary, high-eave duties and exact conditional site handoff remain with RWT06.'],
  wholeMethodAccepted:false};
}
export function renderUpper(o){
 const esc=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;'),label=(x,y,s,size=19)=>`<text x="${x}" y="${y}" font-size="${size}">${esc(s)}</text>`;
 let s='<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1990" viewBox="0 0 1600 1990"><rect width="100%" height="100%" fill="#fbfaf5"/><g font-family="sans-serif" fill="#283e43">';
 s+=label(30,42,'UNADOPTED · upper-first release / one passive rear support',30)+label(30,80,'Same native bent spool at−815. Lift upper assembly; keep heavy pipe/frame at fixed height. No actual-kit or physical admission.');
 const X=x=>55+(x-5925)*.36,Y=y=>160+(y-6025)*.26,rect=(b,fill,stroke)=>`<rect x="${X(b[0])}" y="${Y(b[1])}" width="${b[3]*.36}" height="${b[4]*.26}" fill="${fill}" stroke="${stroke}"/>`;
 s+=label(40,125,'Plan · fixed rear support is north of complete native sweep',23)+rect(o.rearFixture.westReturn.box,'#e0d1bb','#9a825f')+rect([6125,6125,0,1525,1275,1],'#f3eee2','#8b806b');
 for(const p of o.rearFixture.parts)s+=rect(p.box,'#c6ccca','#637471');
 s+=rect(o.upperAssembly.pan,'#bdd8c6','#4f785d');
 const F=o.geometry.flange;s+=`<ellipse cx="${X(F[0])}" cy="${Y(F[1])}" rx="${142.5*.36}" ry="${142.5*.26}" fill="#b7d0de" stroke="#467e99"/>`;
 for(const q of o.completeAngularProof.sweeps.filter(x=>x.id.includes('inlet')||x.id.includes('flange'))){const a=q.angular;s+=`<rect x="${X(a[0].minimum)}" y="${Y(a[1].minimum)}" width="${(a[0].maximum-a[0].minimum)*.36}" height="${(a[1].maximum-a[1].minimum)*.26}" fill="none" stroke="#a9744c" stroke-dasharray="5 4"/>`;}
 s+=label(760,170,`Upper complete wet reference${o.upperAssembly.fullWetReferenceKg.toFixed(2)}kg incl15mm surface pond.`,19)+label(760,210,'Pan/frame/flange/stub water and metal are nominal reference inputs.',18);
 s+=label(760,250,'Two rear bearing lines7200/7340: native flange stays SOUTH while rising.',18)+label(760,290,'Front/rear walking reactions include real200square point and5kPa cases.',18);
 s+=label(760,330,`Passive fixture${o.rearFixture.nominalBareKg.toFixed(2)}kg inclplates +4kg unweighed attachments.`,19)+label(760,370,'West: proposed300return→proposedEW6025rim; actual3950/7950 ends.',18);
 s+=label(760,410,'East: box TOP−580 /centroid−630; actual side/endplate cage must fit.',18)+label(760,450,'No Y6850 seam beam, lowered heavy package or downstream platform.',18);
 s+=label(760,490,`Minimum fixture/declared moving-solid axis gap${Math.min(...o.fullSolidSeparation.bodyChecks.map(x=>x.minimumGuaranteedAxisGap)).toFixed(1)}mm.`,18)+label(760,530,'Actual lower collar/lock/rail kit and support capacity remain HOLD.',18);
 s+=label(40,650,'Upper fixed-flange export · direct40 release, then full-body lift/yaw above guard',23);
 const SZ=z=>1005-z*.16,SY=y=>90+(y-6600)*.7;
 s+=`<path d="M70 ${SZ(1100)} H700" stroke="#9f8268" stroke-width="4" stroke-dasharray="7 5"/>`+label(75,SZ(1100)-10,'1100guard',16);
 for(const[shift,color]of[[0,'#638b9a'],[40,'#c08850'],[1700,'#55846a']]){
  const r=o.upperAssembly.ranges;s+=`<rect x="${SY(r[1][0])}" y="${SZ(r[2][1]+shift)}" width="${(r[1][1]-r[1][0])*.7}" height="${(r[2][1]-r[2][0])*.16}" fill="${color}" fill-opacity=".14" stroke="${color}"/>`;
 }
 s+=label(760,710,`Body depth${o.upperAssembly.dimensions[2].toFixed(2)}mm; top1700 → guardreserve${o.upperExport.minimumOverGuardAfter10.toFixed(1)} after10.`,18);
 s+=label(760,750,`Roof1970 has${o.upperExport.minimumBelowRoofAfter10}mm to body after10; actual rigging/head still unqualified.`,18);
 s+=label(760,790,`Unrotated gate/weather each-side allowance${o.upperExport.unrotatedEachSideWith10.toFixed(2)}mm is not inherited as a method.`,18);
 s+=label(760,830,`Yaw90 above guard: full continuous radius${o.upperExport.continuousYawRadius.toFixed(2)} +10.`,19);
 s+=label(760,870,`Then width${o.upperExport.yaw90WidthWith10.toFixed(1)} gives${o.upperExport.yaw90MinimumEachSide.toFixed(1)}mm each side in combined625.`,19);
 s+=label(760,910,'No person remains below upper assembly; seated pan precedes joint work.',18)+label(760,950,'Open-faced incoming alignment, gasket capture/force and reversal remain required.',18);
 s+=label(45,1090,'Blue:seated0 · orange:first40normal lift · green:whole bodytop1700. All crew exits before lift.',16);
 s+=label(40,1120,`Fixed-height lower geometry retains bridge reserves${o.spatialStateProof.bridgeCasesAfterDeformation.map(b=>b.minimumClearance.toFixed(1)).join('/')}mm.`,20);
 s+=label(40,1160,`Corrected independent-water CG${o.renewal.cgBound.localX.map(x=>x.toFixed(1)).join('..')}; reference liftreserve${o.renewal.cgBound.liftMinimumCgReserve.toFixed(1)}mm.`,20);
 s+=label(40,1200,`Full draw${o.renewal.translation.toFixed(1)} /temporary work to${o.renewal.requiredDeckEnd}; no actual site/rigging/kit acceptance.`,20);
 s+=label(40,1250,'Old−775/no-lowering fails the first bridge. New−815 is a deliberate40mm installed replan, not an inherited datum.',19);
 s+=label(40,1290,'Free outlet fault gap66.14 nominal; maximum head, splash, vent, first-wet and real receiving still require proof.',19);
 s+=label(40,1350,'Beige:cantileverreturn · grey:ONE rear frame · green:retainedpan3 · blue:upper285flange · dashed:complete inlet angular hulls.',18);
 s+=label(40,1400,'Research candidate only. Selected HAD remains unchanged; RWT06 is STARTED and incomplete.',21);
 const handler=o.ordinaryUpperHandler,pick=handler.firstPick,transit=handler.guardTransit;
 s+=label(40,1470,'Stock centred CX003 fails before traverse',23);
 s+=label(40,1515,`Vertical hand chain crosses the seated lid by at least ${pick.verticalInterferenceAtLeast.toFixed(0)} mm.`,19);
 s+=label(40,1555,`Direct 60° bridle needs ${transit.minimumBridleHeight.toFixed(1)} mm rise. Ideal space is ${transit.idealMaxBridleHeight.toFixed(1)} mm even without a trolley.`,19);
 s+=label(40,1595,'Section at right shows the seated lid and plumb chain with the upper hook at the roof.',17);
 const HZ=z=>1650-(z+200)*.08,HX=x=>1370+(x-pick.pickXY[0])*.45;
 s+=`<path d="M${HX(pick.pickXY[0]-215)} ${HZ(pick.roof)} H${HX(pick.pickXY[0]+215)}" stroke="#637471" stroke-width="4"/><path d="M${HX(pick.pickXY[0]-152.5)} ${HZ(pick.installedLidTop)} H${HX(pick.pickXY[0]+152.5)}" stroke="#4f785d" stroke-width="5"/><path d="M${HX(pick.pickXY[0])} ${HZ(pick.roof)} V${HZ(pick.highestStockHandChainBottom)}" stroke="#a9744c" stroke-width="4" stroke-dasharray="6 3"/>`;
 s+=label(40,1655,'Actual balance, positive capture, release force, landing and crew reversal remain open.',18);
 const track=o.lowerTrackReference,trial=track.loweredTrack,site=track.localSiteConsequences;
 s+=label(40,1735,'Captured lower track comparison · selected rail level rejected',23);
 s+=label(40,1780,`Selected rail top overlaps the declared crossmember depth by ${track.legacyRailRejected.topProjectsIntoFrameDepthBy.toFixed(1)} mm.`,19);
 s+=label(40,1820,`Trial track supports the last wheel to X${trial.firstAndLastWheelX[1].toFixed(1)}. With a 3 mm lateral change, the keeper has 1 mm to the rail web.`,18);
 s+=label(40,1860,`Bare RHS point-load deflection ${track.fixedSupport.isolatedExistingSizeReference.pointMidspanDeflection.toFixed(2)} mm exceeds the 5 mm allowance.`,19);
 s+=label(40,1900,`Receiver arm at X${site.lastReceiverSupport} enters fault water by ${site.armFaultSubmergenceAtReceiverSupport.toFixed(1)} mm.`,18);
 s+=label(40,1940,`Trial far support requires local grade ${site.localGradeFor500AtFarthestSupport.toFixed(1)} for 500 mm clearance. Actual pads, track and locks remain open.`,18);
 return s+'</g></svg>\n';
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const o=upperFirst();for(const[name,content]of[['upper-first-release.json',JSON.stringify(o,null,2)+'\n'],['upper-first-release.svg',renderUpper(o)]]){
  const path='project/rwt/studies/'+name;if(process.argv.includes('--check'))assert.equal(fs.readFileSync(path,'utf8'),content);else fs.writeFileSync(path,content);
 }
 console.log('One upper-first support/release comparison reproduced; all physical/actual-kit admission remains false.');
}
