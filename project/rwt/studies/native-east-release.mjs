/** One conventional manual-release reference. Necessary geometry, not an installed-method pass. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {control} from './closed-east-control.mjs';
const rad=d=>d*Math.PI/180,g=9.81;
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const add=(a,b,k=1)=>a.map((v,i)=>v+k*b[i]);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];

/** One derived whole-assembly rewind, retaining both old controls rather than tuning their clearances. */
export function recomposedAccess(){
 const slope=50/4250,theta=Math.atan(slope),normal=[Math.cos(theta),0,-Math.sin(theta)],u=[0,1,0],v=cross(normal,u),
  face=[7350,7000,-775],corner=[6575,7000,-775+(7350-6575)*slope],
  horizontal=add(corner,normal,303),top=add(corner,v,303),outletX=corner[0]+(-200-corner[2])*Math.tan(theta),
  box=[6490,6905,-855+(corner[2]-(-770.5882352941177)),460,190,460],body=[7100,6575],
  toolLength=511,working=450,gripFlexWest=150,headOffset=100,shaftRadius=12,clearance=5,
  pairs=[],outsideBox=p=>!(p[0]>box[0]-17&&p[0]<box[0]+box[3]+17&&p[1]>box[1]-17&&p[1]<box[1]+box[4]+17&&p[2]>box[2]-17&&p[2]<box[2]+box[5]+17);
 function bestPose(clock,bolt,z,side){
  const a=rad(clock+bolt*45),head=add(add(add(face,normal,side*headOffset),u,120*Math.cos(a)),v,120*Math.sin(a)),
   shoulder=[body[0]+side*150,body[1]+75,z],flex=side===-1?gripFlexWest:0,projection=Math.sqrt(working**2-flex**2)/working;
  let best=null;
  for(let angle=0;angle<360;angle+=.5){
   let reach=0,valid=true,minNeck=Infinity,minFloor=Infinity;
   // The west nut rotates11.25°; the east bolt head is positively counterheld, hence no countertool stroke.
   for(let step=0;step<=(side===-1?16:0)&&valid;step++){
    const t=rad(angle+(side===-1?-5.625+11.25*step/16:0)),direction=u.map((x,j)=>projection*(x*Math.cos(t)+v[j]*Math.sin(t))-normal[j]*flex/working),
     grip=add(head,direction,working),tail=add(head,direction,toolLength);
    reach=Math.max(reach,distance(grip,shoulder));minFloor=Math.min(minFloor,tail[2]+1200-50,grip[2]+1200-50);
    if(minFloor<0||tail[1]<6320||tail[1]>7380){valid=false;break;}
    for(let k=0;k<=32;k++){
     const p=add(head,direction,toolLength*k/32),r=p.map((x,j)=>x-face[j]),along=dot(r,normal),neck=Math.hypot(...r.map((x,j)=>x-along*normal[j]))-85-shaftRadius-clearance;
     minNeck=Math.min(minNeck,neck);
     if(neck<0||!outsideBox(p)){valid=false;break;}
    }
   }
   if(valid&&(!best||reach<best.maximumReach))best={shoulder,head,handleAngle:angle,maximumReach:reach,minStraightNeckReserve:minNeck,minFloorHandReserve:minFloor};
  }
  return best;
 }
 for(let clock=20.5;clock<=24.5;clock++)for(let bolt=0;bolt<8;bolt++){
  let best=null;
  for(const z of [-550,-350]){
   const west=bestPose(clock,bolt,z,-1),east=bestPose(clock,bolt,z,1);
   if(west&&east){const reach=Math.max(west.maximumReach,east.maximumReach);if(!best||reach<best.maximumReach)best={clock,bolt,shoulderZ:z,maximumReach:reach,west,east};}
  }
  pairs.push(best??{clock,bolt,maximumReach:null,geometryFailed:true});
 }
 const finite=pairs.filter(x=>x.maximumReach!==null),worst=finite.reduce((a,b)=>!a||b.maximumReach>a.maximumReach?b:a,null),
  base=x=>x<=outletX?-187-(x-6125)*13/(outletX-6125):-200+(x-outletX)*20/(7375-outletX),
  headMinimumX=7350-headOffset*Math.cos(theta)-120*Math.sin(theta),
  directionMinimumX=-(gripFlexWest/working)*Math.cos(theta)-Math.sqrt(working**2-gripFlexWest**2)/working*Math.sin(theta),
  tailMinimumX=headMinimumX+511*directionMinimumX,handMinimumX=tailMinimumX-50,
  eastHeadMaximumX=7350+headOffset*Math.cos(theta)+120*Math.sin(theta)+25,
  flangeMinimumX=7350-25*Math.cos(theta)-142.5*Math.sin(theta);
 return {identity:'ONE600west-native-bend /200west-flange access recomposition',accepted:false,selectedGeometryChanged:false,
  geometry:{nativeCorner:corner,nativeHorizontalPort:horizontal,nativeTopPort:top,nativePortToJointAxialMm:(face[0]-horizontal[0])/normal[0],
   collectorOutlet:[outletX,7000,-200],joint:face,downstreamJoint:[12250,7000,-775-(12250-7350)*slope],pipeLength:4900,
   fallMm:4900*slope,unchangedFall:slope,wholeFactoryReservation:box,
   collectorControls:[[6125,7000,base(6125)],[outletX,7000,-200],[7375,7000,base(7375)]],
   collectorFloor:'Piecewise linear west−187 to low−200 to east−180, plus .025*abs(y−7000). Same one outlet, cover count/footprints and water assignment; second north cassette now carries low point. Actual new walls/seams/closure/force/firstwet require coherent consumer regeneration before adoption.',
   southWestBridgeUndersideReserves:[6111.5,6418.5].map(x=>-176+.005*Math.abs(x-6241.5)-1.5-(base(x)+.025*130)),
   exportCost:{draw:4900,park:[12250,17150],stage:[12250,8100,5100,1200],requiredDeckEnd:17350,extraBeyondRetainedClosedControl:200}},
  control400:{factoryBoxMaximumX:7150,conservativeHandXMinimum:handMinimumX,unconditionalFactoryBoxSeparation:false,
   overlapMm:7150-handMinimumX,
   boundary:'400setback does not earn unconditional X separation of full hand/tool and conservative factory box. It needs an actual curved-body/pose proof; do not promote the earlier optimistic straight-neck reference.600buys whole-box separation.'},
  clearanceDerivation:{activeFullTailMinimumX:tailMinimumX,
   conservativeHandXMinimum:handMinimumX,
   formerFactoryMaximumX:7550,requiredWestSetbackFor25Reserve:7550-handMinimumX+25,
   chosenWestSetback:600,actualWholeBoxToHandXReserve:handMinimumX-(box[0]+box[3]),
   role:'Derived whole-body clearance then rounded600 shift; no iteration of50mm cover or shallow beam passes.'},
  operator:{centre:body,radius:300,bodyPlan:[6800,6275,600,600],shoulderBreadth:300,forwardShoulderOffset:75,
   shoulderHeightsAboveFloor:[650,850],floor:-1200,
   posture:'Explicit seated reference: shoulders150each side and75north of body centre; both tools share ONE shoulder height per bolt. All shoulder points remain within R300. Actual knees/torso/head/seat, both hand placement/removal and loaded trial remain physical requirements.',
   bodyToFactorySouthGap:box[1]-(body[1]+300),bodyToFlangePlanGap:Math.hypot(flangeMinimumX-body[0],7000-142.5-body[1])-300},
  tools:{count:2,ratchet:'HAZET916GL',socket:'HAZET900-30',socketSource:'https://www.hazet.de/en/products/hand-tools/nut-driver/socket/product/ean-4000896042937',
   nativeSocket:{length:50,outputDiameter:40.1,driveDiameter:28,depth:23.3,wrenchSize:30},
   fullHandleLength:511,workingGrip:450,activeFlexWest:gripFlexWest,activeStrokeDegrees:11.25,counterStrokeDegrees:0,
   headPlaneOffset:headOffset,headDiameterReservation:50,headAxialThicknessReservation:50,
   stack:'Project M20/30AF reference,25flange+3washer+50native socket+22head-centre reserve =100each side. Native PCD/fastener/gasket/engagement and actual ratchet head must be confirmed; no complete native joint pass.',
   fullBodyMaximumEastX:eastHeadMaximumX,firstBridgeStart:7650,minimumHeadToFirstBridgeReserve:7650-eastHeadMaximumX,
   headToStraight170NeckReserve:120-25-85,minimumBetweenTwoToolPlanes:2*headOffset,
   at200NmActiveHandN:200/(Math.sqrt(450**2-150**2)/1000),at200NmCounterHandN:200/.45,
   torqueAccepted:false,bodyBoxScreened:true,
   sampling:'Five actual clock samples,720handle angles,17active stroke positions and33shaft positions. Counterhead fixed; no convenient shortening of active return stroke. Sampling is a necessary reference, not continuous contact proof.'},
  pairedPoses:pairs,maximumReferenceReach:worst?.maximumReach??null,worstPose:worst,geometryFailures:pairs.length-finite.length,
  referenceWithin600:finite.length===pairs.length&&worst.maximumReach<=600,
  supportInterface:{movingFrameAndPipeReference:'Reprice full4900body/850gross frame and unchanged blocked masses. No previous4700/251.5kg handling result transfers.',
   initialSupportX:[7750,12000],railY:[6525,7275],padPlanEach:[200,150],
   firstPadReservations:[[7650,6450,200,150],[7650,7200,200,150]],staffPadMaximumX:7625,planReserveFromStaffPads:25,
   crewToWestSupportXReserve:7750-(body[0]+300),
   hold:'Actual separate carrier pedestals, coupled screw supports, guide/stops and lower rails still require full bodies/load paths. No staff-platform or pile load is borrowed. The worker leaves before any pipe motion.'},
  status:'One complete-access geometric rewind for root review; no HAD adoption or actual pressure/firstwet/material/site/physical release. Native final torque may reject manual actuation. Actual supports and downstream work position remain finite exits.'};
}

// The whole native fitting/flange is rotated with the actual 50/4250 fall.
// This optimistic straight-neck screen intentionally does NOT invent an N18 outer bend curve.
export function boltReference({floor=-1200,clockMin=20.5,clockMax=24.5,clockStep=1,flexWest=250,standing=false}={}){
 const c=control(),normal=c.intakeTurn.factoryPortBinding.flangeFaceNormal,
  u=[0,1,0],v=cross(normal,u),face=[7550,7000,-775],headPlane=add(face,normal,-80),
  shoulders=standing?[floor+1450]:[floor+650,floor+850],results=[];
 for(let clock=clockMin;clock<=clockMax+1e-8;clock+=clockStep)for(let bolt=0;bolt<8;bolt++){
  const a=rad(clock+bolt*45),point=add(add(headPlane,u,120*Math.cos(a)),v,120*Math.sin(a));
  let best=null;
  for(let angle=0;angle<360;angle+=.5)for(const shoulderZ of shoulders){
   const shoulder=[7300,6575,shoulderZ];let valid=true,worst=0,minFloor=Infinity,minNeck=Infinity;
   for(let step=0;step<=16&&valid;step++){
    const t=rad(angle-5.625+11.25*step/16),direction=[0,0,0];
    for(let j=0;j<3;j++)direction[j]=(Math.sqrt(450**2-flexWest**2)/450)*(u[j]*Math.cos(t)+v[j]*Math.sin(t))-normal[j]*flexWest/450;
    const grip=add(point,direction,450),tail=add(point,direction,511);
    worst=Math.max(worst,distance(grip,shoulder));
    minFloor=Math.min(minFloor,tail[2]-floor-50,grip[2]-floor-50);
    if(minFloor<0||tail[1]<6300+20||tail[1]>7400-20){valid=false;break;}
    for(let k=0;k<=24;k++){
     const p=add(point,direction,511*k/24),relative=p.map((z,i)=>z-face[i]),axial=dot(relative,normal),
      transverse=relative.map((z,i)=>z-axial*normal[i]),neck=Math.hypot(...transverse)-85-12-5;
     minNeck=Math.min(minNeck,neck);if(neck<0){valid=false;break;}
    }
   }
   if(valid&&(!best||worst<best.worstGripReach))best={clockDegrees:clock,boltIndex:bolt,shoulder,handleAngleDegrees:angle,worstGripReach:worst,minFloorHandReserve:minFloor,minStraightNeckReserve:minNeck};
  }
  results.push(best??{clockDegrees:clock,boltIndex:bolt,worstGripReach:null,geometryFailed:true});
 }
 const finite=results.filter(x=>x.worstGripReach!==null),worst=finite.reduce((a,b)=>!a||b.worstGripReach>a.worstGripReach?b:a,null);
 return {floor,clockRange:[clockMin,clockMax],clockStep,shoulderHeightsAboveFloor:standing?[1450]:[650,850],
  shoulderRole:standing?'Rejected inherited standing shoulder':'Explicit low floor-seated reference and 200-high seat reference; actual body/tool trial required',
  shoulderXY:[7300,6575],bodyRadius:300,bodyPlan:[7000,6275,600,600],
  gripWorkingLength:450,toolFullLength:511,flexWest,flexAngleDegrees:Math.asin(flexWest/450)*180/Math.PI,
  torqueSensitivity:[50,100,150,200].map(torqueNm=>({torqueNm,tangentialHandForceN:torqueNm/(Math.sqrt(450**2-flexWest**2)/1000),rated:false})),
  headPlane,flangeFaceNormal:normal,assumedPitchCircleDiameter:240,assumedEightHolesDiameter:22,
  clockSpecification:'Project installation datum22.5° from +Y towards rotated+Z,±2°. Discrete clock/handle/stroke samples are a necessary reference, not continuous collision certification. Both matching faces must be indexed/witnessed before closing. Actual backing-ring/braze arrangement must permit/retain the datum; not native catalogue evidence.',
  sampleCount:results.length,geometryFailures:results.length-finite.length,maximumReferenceReach:worst?.worstGripReach??null,worstPose:worst,
  reachLimitHypothesis:600,referenceWithin600:finite.length===results.length&&worst.worstGripReach<=600,
  perBoltWorst:Array.from({length:8},(_,i)=>finite.filter(x=>x.boltIndex===i).reduce((a,b)=>!a||b.worstGripReach>a.worstGripReach?b:a,null)),
  accepted:false,
  omitted:'Only straight170OD neck +24diam shaft +5clearance are screened. Actual N18 curved body, 50diam head/socket, both bolt ends/counterholding, reaction/torque, head engagement, flange disc crossing, free511tail hand/body sweep and anthropometry need the actual matched assembly. Numerical reach alone is not a solved eight-bolt release.'};
}

export function nativeRelease(){
 const c=control(),steelDensity=8000,E=193000,proofStressHypothesis=170;
 const deck={plan:[6125,6250,1525,1150],top:-1200,barDepth:50,barWidth:5,pitch:30,barCount:52,barSpan:1150,
  crossTieCount:13,crossTieSection:[6,5],frameSection:[100,50,4],frameLength:5350,
  feet:[[6300,6425],[7475,6425],[6300,7225],[7475,7225]],pad:[300,300,8],legSection:[50,50,3],
  gradeComparison:-1800,installed:false,carrierSupported:false};
 const area=(h,b,t)=>h*b-(h-2*t)*(b-2*t),I=(h,b,t)=>(b*h**3-(b-2*t)*(h-2*t)**3)/12,
  kg=(area,length)=>area*length/1e9*steelDensity,
  bars=kg(50*5,52*1150),crossTies=kg(6*5,13*1525),frame=kg(area(100,50,4),5350),
  legs=kg(area(50,50,3),4*500),pads=kg(300*300*8,4),braces=kg(50*5,4*Math.hypot(1175,500)),
  // Connections are explicitly budgeted, not a weighed bill of material.
  connectionsBudget=15,platformMass=bars+crossTies+frame+legs+pads+braces+connectionsBudget,
  dead=platformMass*g/1000,A=1.525*1.150,liveUniform=5*A,
  barPointN=5000*30/200,barUniformNPerMm=5*30/1000,
  barMoment=barPointN*(2*1150-200)/8+barUniformNPerMm*1150**2/8,
  barI=5*50**3/12,barStress=barMoment/(5*50**2/6),
  barDeflection=barPointN*(8*1150**3-4*1150*200**2+200**3)/(384*E*barI)+5*barUniformNPerMm*1150**4/(384*E*barI),
  frameMoment=5000*1225/4+liveUniform*1000/2*1225/8,
  frameStress=frameMoment/(I(100,50,4)/50);
 const reactions=[];
 // Full200square load footprint stays on deck. Horizontal case is an authored0.5kN service disturbance,
 // not a claimed guard standard; a locked upper guard is retained independently.
 for(const x of [6225,7550])for(const y of [6350,7300]){
  const fx=(x-6300)/1175,fy=(y-6425)/800;
  for(let i=0;i<4;i++){
   const weight=(i%2?fx:1-fx)*(i<2?1-fy:fy),vertical=dead/4+5*weight,
    horizontalAdverse=.5*1.8/.8/2;
   reactions.push({loadCentre:[x,y],footIndex:i,pointAndDeadCompressionKn:vertical,
    plusUniformCompressionKn:vertical+liveUniform/4,withAdverseHorizontalKn:vertical-horizontalAdverse});
  }
 }
 const frameMass=kg(area(100,50,4),2*4700+3*800),movingWet=c.loads.movingTubeAndTwoCatalogFlangesWetKg+frameMass,
  designMovingKn=3,hardwareAllowanceKg=designMovingKn*1000/g-movingWet,
  designPointEachRail=designMovingKn*1000/2,drawI=I(100,50,4),drawSpan=4700,
  drop=40,firstEntry=c.carrier.movingFlangeClearance.rotatedDisc.firstLeadingPointEntryTranslation;
 return {identity:'RWT-NATIVE-E-MANUAL-RELEASE-REFERENCE-2026-11-06',selectedHadBlob:c.selectedSource,
  question:'Can ordinary manual access and a supported draw-out carrier replace the unearned remote staff and RC service box?',
  selectedGeometryChanged:false,accepted:false,physicalEventPerformed:false,siteAccepted:false,
  nativeAssembly:{flange:'Endex89719/N1FMGI159',bend:'Endex89710/N18',tool:'HAZET916GL',
   sources:['https://aalberts-ips.co.uk/products/item/89719/','https://aalberts-ips.co.uk/products/item/89710/',
    'https://aalberts-ips.co.uk/wp-content/uploads/2023/12/Endex-09969088_56035915_Brochure_2023.pdf',
    'https://www.hazet.de/en/products/hand-tools/nut-driver/operating-tool-nut-driver/product/ean-4000896202485'],
   inspectedDate:'2026-11-06',toolNativeFacts:{length:511,hingeGreaterThanDegrees:180,teeth:32,returnAngle:11.25,manual:true},
   productHolds:'Endex catalogue conflicts retained. Actual PCD/bolts, backing-ring rotation/retention, bolt tightening/loosening torque, gasket, head/socket dimensions and complete delivered N18 body are not sourced by the reference dimensions.'},
  manualReference:boltReference(),standingControl:boltReference({standing:true}),originalFloorControl:boltReference({floor:-950}),
  uncontrolledStraightToolControl:boltReference({clockMin:0,clockMax:44,clockStep:2,flexWest:0}),
  nextWholeAccess:recomposedAccess(),
  platform:{...deck,material:'316L stainless reference; density/E/170MPa proof stress are explicit calculation hypotheses, not a supplied section/weld/material acceptance',
   materialSource:'https://www.outokumpu.com/-/media/files/products/supra/outokumpu-supra-range-datasheet.pdf',
   materialSourceBoundary:'Supra316L/4404 ASTM A240 sheet/plate table gives170MPa; density8.0 and ambient E200GPa.193GPa is a lower calculation hypothesis. No actual RHS/bar/weld product certificate, corrosion/water exposure or whole assembly is accepted.',
   massesKg:{bars,crossTies,frame,legs,pads,braces,connectionsBudget,total:platformMass},deadKn:dead,
   pointLoad:{kn:5,footprint:[200,200],boundary:'Uniform pressure over the actual200square print, wholly on deck; not an isolated toe on one bar.'},uniformLiveKpa:5,
   steelScreen:{E,proofStressHypothesis,barStressMPa:barStress,barDeflectionMm:barDeflection,frameStressMPa:frameStress,
    boundary:'Elastic isolated bars/frame; welded grating load transfer, lateral stability, joints, fatigue, slip, corrosion and real contact remain open.'},
   padReactions:reactions,minimumPointAndDeadKn:Math.min(...reactions.map(r=>r.pointAndDeadCompressionKn)),
   maximumPlusUniformKn:Math.max(...reactions.map(r=>r.plusUniformCompressionKn)),minimumWithHorizontalKn:Math.min(...reactions.map(r=>r.withAdverseHorizontalKn)),
   horizontalControl:{forceKn:.5,applicationZ:0,heightAboveComparisonGrade:1800,role:'Authored maintenance disturbance at upper hand datum; not a claimed guard/ladder standard. Independent existing guard is retained.'},
   padBoundary:'Four300square pads entirely within well plan with25 reserve. Four actual independently qualified compression/lateral/uplift foundations are required. Freestanding contact is NOT an earned support under the adverse lateral case; no borrowing of P36/P37, waterproof box, piles or unsurveyed bearing.',
   geometry:{frameUnderside:-1300,comparisonGroundClearance:500,clearanceAllowanceBeyond500:0,
    boundary:'D1800 gives only500 below100deep platform, before pads/actual ground variation. Grade and heave/ventilation reserve must be qualified locally; D1800 is a comparison, not a site promise.'},
   waterBoundary:'Open platform is not the court water skin or a retaining wall. Keep separate metal flange/track leak catch and80outlet with visible accessible drainage. No credit for full duty, common receiver backwater or groundwater. No resident or essential service depends on dewatering.',
   rcComparator:{commit:'23a0f92d12a1dd3c6340ab7906edc945bffb9a5b',path:'project/str/studies/current-house-service-bay.json',
    fixedKn:36.5298955,cageClearance:6.958,requiredClearance:25,accepted:false,
    reason:'No retained-earth duty is earned600above D1800grade. Heavy suspended RC box fails actual cage; no reason to inherit it as the ordinary staff floor.'}},
  access:{type:'Removable near-vertical service ladder; not ordinary stair',width:600,run:200,rise:1120,
   angleDegrees:Math.atan2(1120,200)*180/Math.PI,plan:[6125,6600,200,600],lowerBodyRoute:[[6625,6900],[6625,6575],[7300,6575]],
   sequence:'Both complete passive water/weather routes arranged and tested as source requires; all ten well covers captured/removed before ladder installation. Positively secure head/feet and handholds; separately lower restrained tools. Keep ladder/exit clear of operator, pipe and catch. Evacuate before any carrier motion.',
   holds:'Exact loaded ladder body/head/heel interface, hand transitions, recovery, temporary roof/head clearance and protected entry still require source solids and forces. The inherited4×180/3×200 stair cannot silently serve this level.'},
  carrierSupport:{section:[100,50,4],materialHypothesis:'316L stainless',length:4700,grossWidth:850,
   railCentresY:[6500,7300],crossMembersX:[7800,9900,12000],frameAxisBelowPipe:150,
   bareFrameKg:frameMass,tubeWaterAndMovingFlangesKg:c.loads.movingTubeAndTwoCatalogFlangesWetKg,
   combinedKnownWetKg:movingWet,designMovingKn,remainingHardwareBudgetKg:hardwareAllowanceKg,
   endOnlySpan:drawSpan,pointLoadEachRailN:designPointEachRail,
   conservativeMidpointStressMPa:(designPointEachRail*drawSpan/4)/(drawI/50),
   conservativeMidpointDeflectionMm:designPointEachRail*drawSpan**3/(48*E*drawI),
   supportCoordinates:[[7550,6500],[7550,7300],[12250,6500],[12250,7300]],
   boundary:'Separate retained rail/grid foundations and captured lifting saddles, not the staff platform. Full3kN retained even after drain; includes blocked tube water. Four end-level screw supports/positive mechanical stops and lower running rails require real full bodies, feet, brake/reaction, loaded contact and support ownership before use. No personnel beneath load, no flange carries it.',
   initialMotion:{gasketSeparation:10,drop,firstNativeFlangeEntryTranslation:firstEntry,
    remainingAxialBeforeBeamWhenDropStarts:firstEntry-10,
    nativeGapAfterLoweringAtEntry:c.carrier.movingFlangeClearance.rotatedDisc.firstEntryTopGap+drop,
    larger290MovingEnvelopeGap:c.carrier.movingFlangeClearance.rotatedDisc.firstEntryTopGap+drop-2.5,
    oldFloorWouldIntersectFrame:true,frameLowAtWestAfterDrop:-775-150-50-drop,
    newFloorReserve:-775-150-50-drop-(-1200),
    sequence:'Remove/support downstream terminal first, opening east end. Load captured frame supports, separate west gasket10east while still at installed level; stop and positively hold. Lower whole assembly40 on locked/captured supports BEFORE further draw. Prove all initial supports/tolerances, then engage lower rails and draw. Reverse: stop10short, raise40, then close axial10. No sloping cam/free gravity drop.'}},
  recommendation:'Develop the open independently supported metal staff platform and one rigid draw-out carrier. Reject the RC enclosure preference and inherited standing/reach assumptions. The ordinary manual tool is a necessary finite reference only: native bolt/counterhold and complete support geometry remain genuine internal exits, so release is HOLD.',
  hold:'No new route, platform, ladder, seal, clock, frame or sequence is adopted. Resolve actual matched flange/counterhold and first support bodies before claiming eight-bolt release; real grade/foundation/drainage and physical use remain named site/physical admission boundaries.'};
}

export function renderNative(o){
 const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
 const text=(x,y,t,n=18)=>`<text x="${x}" y="${y}" font-size="${n}">${esc(t)}</text>`;
 let s='<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="1050" viewBox="0 0 1500 1050"><rect width="100%" height="100%" fill="#fbfaf5"/><g font-family="sans-serif" fill="#273d43">';
 s+=text(30,40,'UNADOPTED · conventional native release / open working platform',28)+text(30,75,'Necessary access/load reference. No RC retaining duty, native8bolt pass or unowned support is invented.');
 const x=X=>70+(X-6125)*.36,y=Y=>500-(Y-6250)*.30;
 s+=text(35,120,'Located plan · staff support and carrier support are separate',22);
 s+=`<rect x="${x(6125)}" y="${y(7400)}" width="549" height="345" fill="#e8e2d3" stroke="#637974"/>`;
 for(const[X,Y]of o.platform.feet)s+=`<rect x="${x(X-150)}" y="${y(Y+150)}" width="108" height="90" fill="#b4cec1" stroke="#527b6b"/>`;
 s+=`<path d="M${x(7175)} ${y(7000)} H${x(7750)}" stroke="#42859a" stroke-width="50"/><rect x="${x(7550)}" y="${y(7142.5)}" width="9" height="85.5" fill="none" stroke="#8f7258" stroke-width="4"/>`;
 for(const Y of [6500,7300])s+=`<path d="M${x(7550)} ${y(Y)} H${x(7850)}" stroke="#8c6a99" stroke-width="12"/>`;
 s+=`<ellipse cx="${x(7300)}" cy="${y(6575)}" rx="108" ry="90" fill="none" stroke="#ad6e45" stroke-dasharray="7 4"/><rect x="${x(6125)}" y="${y(7200)}" width="72" height="180" fill="none" stroke="#486476"/>`;
 s+=text(730,165,'Green:300square actual pad reservations',20)+text(730,200,'Pads avoid known node face X7650 by25')+text(730,235,'Orange:R300 low seated service reference')+text(730,270,'Blue:native bend/285flange comparator')+text(730,305,'Purple:separate draw-frame rails/supports')+text(730,340,'Grey:removable service ladder, not stair')+text(730,390,'Actual pad anchors/grade remain conditional.')+text(730,425,'Freestanding adverse lateral support fails.');
 const z=Z=>585+(-Z-630)*.20;
 s+=text(35,565,'Section / loads · a working floor600above comparison grade is not a retaining pit',22);
 s+=`<path d="M80 ${z(-630)} H660" stroke="#8b877e" stroke-width="14"/><circle cx="200" cy="${z(-775)}" r="28.5" fill="none" stroke="#8f7258" stroke-width="4"/>`;
 s+=`<path d="M80 ${z(-1200)} H660" stroke="#527b6b" stroke-width="12"/><path d="M80 ${z(-1300)} H660 M80 ${z(-1800)} H660" stroke="#8b877e" stroke-dasharray="7 4"/>`;
 s+=text(730,595,`Metal staff floor ${o.platform.massesKg.total.toFixed(1)}kg / ${o.platform.deadKn.toFixed(2)}kN reference`,20)+text(730,630,'RC box36.53kN and cage6.96/25FAIL retained')+text(730,665,'−1200 deck /−1300 frame /−1800 grade comparator')+text(730,700,'500belowframe leaves no extra grade allowance')+text(730,735,`Tube+water+flanges+bare drawframe ${o.carrierSupport.combinedKnownWetKg.toFixed(1)}kg`)+text(730,770,'3kN moving budget; actual clamps/rigging still needed');
 s+=text(35,885,`Tilted8bolt reference: maximumgrip ${o.manualReference.maximumReferenceReach.toFixed(1)}mm under600hypothesis; NOT physical/counterhold proof.`)+text(35,920,'Originalfloor/standing controls retained. Full curved bend/head/bolts/clock/torque/loaded support remain internal exits.')+text(35,955,'Open platform preserves separate leak catch and80drain. No full-duty credit, pump or groundwater exclusion is invented.')+text(35,1000,'HOLD first release. No HAD adoption; RWT06 remains STARTED and incomplete.',20);
 return s+'</g></svg>\n';
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const o=nativeRelease();for(const[p,s]of[['native-east-release.json',JSON.stringify(o,null,2)+'\n'],['native-east-release.svg',renderNative(o)]]){
  const path='project/rwt/studies/'+p;if(process.argv.includes('--check'))assert.equal(fs.readFileSync(path,'utf8'),s);else fs.writeFileSync(path,s);
 }console.log('Native E manual-release reference reproduced; release remains HOLD.');
}
