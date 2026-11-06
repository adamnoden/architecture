/** One project-designed reference; geometry is not a weather/product approval. */
import assert from 'node:assert/strict';

export function deriveSouthCourtThreshold(door) {
  assert.deepEqual(door.rough,[5100,6900]);
  assert.deepEqual(door.frameDepth,[4110,4250]);
  assert.equal(door.leafBottom,19);
  const v={
    status:'PROJECT-DESIGNED CONSTRUCTIVE REFERENCE; NOT QUALIFIED WEATHER OR FIRST-HARM PERFORMANCE',
    retained:{roughX:door.rough,frameDepthY:door.frameDepth,hinges:door.hinges,
      leafEach:door.leafEach,leafBottom:door.leafBottom,leafTop:door.leafTop,gaps:door.gaps},
    frame:{outerX:[5110,6890],jambEach:40,installationGapEach:10,
      timberFootZ:30,depthY:door.frameDepth,
      materialAuthority:'E0 conventional replaceable family retained. OAS material/product is still open. Any timber is a protected dry core, never a weather-exposed or water-contact material credited by this reference.',
      wetFace:{materialRole:'Continuous metal/mineral wet-face reference, not an admitted alloy or complete doorset',
        jambMetalReturnTopZ:150,leafOuterFaceZ:[19,2119],leafShoeZ:[19,100],
        leafDryCoreBottomZ:25,shoeOuterDrainZ:22,shoeInnerReturnTopZ:100,
        role:'Whole outside faces and bottom/end-grain territories are protected. Leaf shoe bottom19 preserves existing leaf clearance; dry core starts25 behind it. No fastener below100 through the shoe wet pocket; outward22 drain discharges above the primary tray. Actual continuous cap/meeting/jamb joints must qualify before any dry-timber claim.'},
      explicitRewind:'50mm jamb becomes40 with10 installation gap each. Hinges, clear opening, leaves,1800 rough and140 depth stay unchanged. Member strength/fixing/weather qualification required.'},
    primarySill:{materialRole:'Project-designed metal/mineral sill reference; no supplier/weather claim',
      bodyPlan:[5150,4110,1700,140],bodyZ:[-35,15],
      crest:{y:4220,z:15},leafClearance:4,
      forwardWeeps:[{x:5350,y:4250,z:-5,width:40,height:10},
        {x:6000,y:4250,z:-5,width:40,height:10},
        {x:6650,y:4250,z:-5,width:40,height:10}],
      wetVoid:{plan:[5150,4230,1700,20],z:[-15,-5]},
      meeting:{centreX:6000,leafGap:3,metalCapPlan:[5975,4206,50,44],bottomZ:19,
        jointRole:'Meeting-stile weather joint drains forward into the sill wet void; no pressure or gasket rating.'}},
    pan:{materialRole:'1.5mm formed metal reference, actual alloy/seams/corrosion/bedding unqualified',
      outerX:[5102,6898],thickness:1.5,fallY:[[4090,-45],[4450,-55]],
      rear:{planeY:4090,crestZ:15},ends:{x:[5102,6898],crestZ:75},
      dryFold:{y:[4030,4090],crestZ:15,
        role:'Rear leg folds to a dry-side floor apron behind the15 crest; clamp fixings stay on this dry side, never through the wet pan floor.'},
      bearingPads:[{x:[5110,5150],y:[4110,4250]},
        {x:[5980,6020],y:[4110,4250]},{x:[6850,6890],y:[4110,4250]}],
      bearingRole:'Explicit forty-wide mineral bearing strips on supported pan. Water passes between strips; no concealed full-width dam or sill fixing through pan. Pan compression/slip, sill span/load and thermal bridge require STR/MAT.',
      permanentSeat:{plan:[5050,4060,1900,400],rcZ:[-380,-180],
        mineralBearingBottomZ:-180,mineralBearingTop:'Follows pan underside: wet-floor level minus1.5; no timber or insulation carries the sill.',
        role:'Local RC200 support reservation continuous with the actual ground slab and court-south support. Actual bearings/cage/thermal/capillary/sliding capacity remain STR/MAT.'},
      secondaryOutlet:{planeY:4450,x:[5150,6850],lipZ:-55},
      renewal:'Remove door leaves/frame/sill after erecting temporary weather screen and diverting rain; lift separately retained front grates/trays, release dry-side clamps/end captures, withdraw pan NORTH. No demolition of masonry or wet-floor fastener release is assumed.'},
    primaryTray:{plan:[5050,4250,1900,100],topZ:0,bedZ:-25,metalThickness:1.5,
      removableModules:10,moduleLength:190,
      outlet:{point:[5050,4300,-25],clear:[75,25]},
      route:[[5050,4300,-25],[5000,4300,-35],[5000,7750,-140]],
      formedChannelClear:[100,20],walkingGrateThickness:6,
      normalJoin:{point:[5000,7750,-140],receivingCarrierBottom:-213.75,freeDrop:73.75,
        role:'Open downward entry inside the actual existing Nnormal250clear liner at centre5025. Not a discharge onto the−110 walking plane.'},
      destination:'Ordinary N court route; distinct from the E secondary channel. Actual N head, shallow channel debris/cleanout and losses remain RWT proof.'},
    secondaryTray:{plan:[5050,4450,1900,100],topZ:0,bedZ:-80,
      outlet:{point:[6950,4500,-80],clear:[100,40]},
      route:[[6950,4500,-80],[7350,4500,-95],[7350,6300,-125]],
      formedChannelClear:[100,50],destination:'Separate E collector upstream of its accessible intake; bypasses primary sill weeps/tray/N mouth. Do not join the primary drain before this distinct route.',
      intakeJoin:{openEndPlaneY:6300,x:[7300,7400],outletFloorZ:-125,outletRimZ:-75,
        receivingCollectorFloorZ:-200,freeDrop:75,
        role:'Open south-boundary side entry into the existing collector low channel. No north−110 crest or solid guard plinth is inserted across this100-wide opening; actual capture/splash/debris remains RWT.'},
      walkingCover:'Separately lift-out metal grates in190mm modules; support/heel/access/load/handling qualification remains open.'},
    jambs:{left:{frameX:[5110,5150],panEndX:5102},right:{frameX:[6850,6890],panEndX:6898},
      cavityTray:{bottomZ:75,wallDpcZ:150,returnHeight:75,
        leftApron:{x:[5050,5110],y:[4090,4250],z:[75,150]},
        rightApron:{x:[6890,6950],y:[4090,4250],z:[75,150]},
        role:'Formed jamb aprons bridge pan end return75 to wall cavity/DPC150, with accessible mechanical laps outside the clear door path. No reliance on an invisible sealant bead.'},
      wallBase:{exposedMetalUpstandZ:150,protectedInnerFloorPlaneZ:-180},
      airGas:{planeY:4090,floorPlaneZ:-180,foldCrestZ:15,
        role:'Mineral inner-floor/wall closure rises on the protected side to the rear metal fold; dry-side mechanically clamped metal/mineral transition. Actual gasket/mineral compound, continuity, movement and air/gas/water qualification remain open.'}},
    fixings:{jambAnchorX:[5128,6872],y:4140,z:[400,1100,1900],diameterBudget:8,
      masonryEmbedmentBudget:60,panFloorPenetrations:0,
      sillRestraint:'Captured at jamb ends and mineral bearing strips; no under-sill fixing through wet pan. Actual anchor/member capacities are not selected.'},
    maintainedState:{
      temporaryWeatherLine:{plan:[5050,3930,1900,40],z:[0,2450],
        supports:[{plan:[4900,3700,150,500],z:[0,300]},{plan:[6950,3700,150,500],z:[0,300]}],
        materialRole:'Removable metal/mineral weather screen reference, captured at jambs outside pan; no synthetic sheet or floor penetration assumed.',
        scope:'Blocks the court door during work. Protected front exit remains available; no claim that the temporary screen is a permanent rated external doorset.'},
      handlingReference:{base:[1100,800],height:2400,massCapacityRequiredKg:70,
        turntableCentre:[5700,5200],basePlanAtTurn:[5150,4800,1100,800],
        completePlanTurnRadius:Math.hypot(1100,800)/2,
        operator:{centre:[6950,5150],radius:300,handle:[6500,5150,1100],shoulderZ:1450,reach:600},
        role:'Project-dimensioned captured leaf/doorset handling frame with fixed-base turntable.70kg is inherited leaf load requirement, not an admitted kit rating. Base/turntable/clamps/stability/forces and actual procurement remain IAS/OAS/MAT.'},
      leafTask:{capturedCentresClosed:[[5572.75,4228],[6427.25,4228]],
        firstTranslationNorth:500,turnCentre:[5700,5200],turnDegrees:90,
        hingeRelease:{z:[400,1100,1900],maximumToolStroke:60,
          bodyCentres:[[5150,4600],[6850,4600]],toolContactY:4310,
          shoulderByHingeZ:{400:750,1100:1450,1900:1450},
          role:'Capture and unload leaf first. Independently accessible leaf-side hinge screws are released outward; no upward hinge-pin motion through the transom.'},
        uprightStorage:{plan:[4350,5000,200,1000],height:2200,
          role:'Two845.5-wide leaves park edge-on side by side in separate captured slots; no leaf lies across N inlet or E collector.'}},
      panTask:{wholeBodyMaximum:[1796,360,130],
        pullNorth:500,clearDrawPlan:[5050,4090,1900,1360],
        raisedEmptyHandlingField:[5050,4500,1900,1600],
        planRotationRadius:Math.hypot(1796,360)/2,turnCentre:[5700,5200],
        operator:{centre:[6950,5150],radius:300,handle:[6500,5150,1100],shoulderZ:1450,reach:600},
        storage:{plan:[4600,4350,150,1900],height:400,orientation:'Upright on long edge in captured rack after90degree plan turn'},
        role:'Frame/sill removed before pan. Capture entire pan, release dry-side floor clamps and accessible end laps, pull NORTH500 then lift in the clear exterior field; rear/end returns do not pass through retained frame. No wet-floor fastener cut.'},
      incoming:{transportEnvelope:[600,850,2300],turnRadius:Math.hypot(600,850)/2,
        headLanding:[6350,12000,2400,2400],
        path:[[7600,12600],[5500,12600],[5500,5800],[5700,5200]],
        operatorRearOffset:825,turnControl:{fixedCartCentre:[5500,12600],operatorCentre:[6600,12600],
          fixedSideCrank:[6100,12600,1200],cartBrakedBeforeRegrip:true,
          role:'Captured/braked turntable rotates the component inside1040diameter before changing travel direction; the operator remains on the existing terrace. No1100-wide assembled handling frame turns here.'},
        operatorHandover:{cart:[5500,7800],sideBody:[6600,7800],rearBody:[5500,8625],
          role:'Brake/capture cart before regrip from east-side control to north-trailing push; body then staysx5500, west of fixed Ewellguard. No uncaptured rolling transfer.'},
        handlerAssemblyField:[5150,4500,1900,1600],
        role:'Components arrive edge-on on the captured600×850 transport reference;2300 includes150 wheeled-base budget under2100 leaf. Pan1796 fits vertically. The1100×800/2400 handling frame is assembled INSIDE the empty court field from base halves≤550×800 and uprights≤1200, never assumed to turn whole through a1200 landing. Head landing is explicitly enlarged2400 for this task and stops at8750, before the separate kitchen foul route9150. Actual assembly/load/stability and full externalstack envelope qualification remains IAS/OAS/MAT.',
        state:'N intact and covers restored; inspect a dry broad walking route before incoming. No delivery through a failed/ponded N mouth. Temporary weather screen remains until replacement verified.'},
      sequence:['Verify intact full-duty N and separate E collector; isolate/divert threshold runoff before opening grates or a weather boundary.',
        'Install and test temporary inner weather screen while doorset intact; close this court access, retain front exit and grade-level garden bypass.',
        'Capture each leaf before independent hinge release; translate north500, turn in the reserved frame field and store edge-on. Do one leaf at a time.',
        'Capture/remove frame and separately retained sill; lift primary/secondary trays and short grates to the empty reserved handling field.',
        'Release only accessible dry-side clamps/end laps; withdraw whole pan north500, lift and park. Permanent masonry and RC seat stay.',
        'Receive captured edge-on replacement components through the open north loggia in600×850×2300 transport envelope, with the2400 head landing, captured-turn/regrip and intact closed N covers. Assemble the larger handling frame in the court field. Reverse, reinstate all laps/clamps/trays and test water/air/operation before removing screen or reopening access.'],
      ordinaryUseRestriction:'No simultaneous court-west window cleaning, normal court passage or second component storage in the same handling field. E well/guard and N inlet remain outside the turn/storage envelopes; rain diversion and temporary-screen weather duty must be verified before work.'},
    limitingLevels:{lowestIntentionallyWetWeepZ:-5,secondaryPanFloorLowZ:-55,
      lowestUnbackedInteriorOverflowZ:15,timberLeafBottomZ:19,timberJambFootZ:30,
      status:'15 is a geometric rear-crest entry limit, not first-leak or flood-resistance certification. Every pan/cap/jamb/meeting/air joint remains explicitly unqualified.'},
    levelBudget:{referencePassiveActivationZ:-110,headBudget:75,splashBudget:25,toleranceBudget:25,
      maximumQuietOperatingStageZ:-35,
      authority:'Project allocation only. RWT must bind actual activation (including the higher well lip), flow, debris, losses, receiver/backwater, wind/splash and maintenance; no ideal-flow probe is an acceptance.'},
    admission:{geometricReference:false,material:false,weatherPhysical:false,hydraulic:false,
      firstSusceptibleQualifiedZ:null,site:false},
    remaining:['Full pan/primary-sill support cross section and thermal junction require MAT/STR.',
      'Actual exterior channels must be joined to court paving/support/guard/window/occupied operation before architectural selection.',
      'Material/seam/gasket/meeting/fixing/movement/weather and physical qualification remain downstream.']
  };
  assert.equal(v.frame.outerX[0]-v.retained.roughX[0],v.frame.installationGapEach);
  assert.equal(v.retained.roughX[1]-v.frame.outerX[1],v.frame.installationGapEach);
  assert.equal(v.frame.outerX[0]+v.frame.jambEach,door.hinges[0][0]);
  assert.equal(v.frame.outerX[1]-v.frame.jambEach,door.hinges[1][0]);
  assert.equal(door.leafBottom-v.primarySill.crest.z,v.primarySill.leafClearance);
  assert(v.pan.outerX[0]>door.rough[0]&&v.pan.outerX[1]<door.rough[1]);
  assert(v.pan.outerX[0]+v.pan.thickness<v.frame.outerX[0]);
  assert(v.pan.outerX[1]-v.pan.thickness>v.frame.outerX[1]);
  for(const t of [v.primaryTray,v.secondaryTray])for(let i=1;i<t.route.length;i++)
    assert(t.route[i][2]<t.route[i-1][2],'No down-and-up drain route');
  assert(v.pan.secondaryOutlet.lipZ>v.secondaryTray.bedZ);
  assert(v.primarySill.forwardWeeps.every(w=>w.z>v.primaryTray.bedZ));
  assert(v.fixings.z.every(z=>z>v.pan.ends.crestZ));
  const b=v.levelBudget;
  assert.equal(b.referencePassiveActivationZ+b.headBudget+b.splashBudget+b.toleranceBudget,
    v.limitingLevels.lowestUnbackedInteriorOverflowZ);
  assert.equal(b.maximumQuietOperatingStageZ+b.splashBudget+b.toleranceBudget,15);
  return v;
}

const overlap=(a,b)=>a[0]<b[0]+b[2]&&a[0]+a[2]>b[0]&&a[1]<b[1]+b[3]&&a[1]+a[3]>b[1];
const pointRect=(p,r)=>Math.hypot(Math.max(r[0]-p[0],0,p[0]-r[0]-r[2]),Math.max(r[1]-p[1],0,p[1]-r[1]-r[3]));
export function verifyThresholdMaintainedState(v,renewal){
  const m=v.maintainedState,p=m.panTask,l=m.leafTask,handler=m.handlingReference;
  assert(!overlap(l.uprightStorage.plan,p.storage.plan),'Stored leaves/pan collide');
  for(const [name,store]of [['leaf',l.uprightStorage.plan],['pan',p.storage.plan]]){
    assert(!overlap(store,renewal.courtIntakeWell),name+' storage blocks E well');
    assert(!overlap(store,renewal.courtCollector.plan),name+' storage blocks E collector');
    assert(store[1]+store[3]<7000,name+' storage blocks N inlet');
  }
  const reserveToStoredLeaves=pointRect(p.turnCentre,l.uprightStorage.plan)-p.planRotationRadius;
  const reserveToEGuard=pointRect(p.turnCentre,renewal.guardOuterPlan)-p.planRotationRadius;
  const bodyReserve=Math.hypot(p.operator.centre[0]-p.turnCentre[0],p.operator.centre[1]-p.turnCentre[1])-p.operator.radius-p.planRotationRadius;
  assert(reserveToStoredLeaves>=25,'Pan rotation hits stored leaf');
  assert(reserveToEGuard>=25,'Pan rotation hits fixed E guard');
  assert(bodyReserve>=25,'Pan rotation hits actual operator');
  for(const a of [handler.operator,p.operator])
    assert(Math.hypot(a.centre[0]-a.handle[0],a.centre[1]-a.handle[1],a.shoulderZ-a.handle[2])<=a.reach,'Handling grip out of reach');
  for(const z of l.hingeRelease.z)
    assert(Math.hypot(4600-l.hingeRelease.toolContactY,z-l.hingeRelease.shoulderByHingeZ[z])<=600,'Hinge release unreachable');
  return {pass:true,reserveToStoredLeaves,reserveToEGuard,bodyReserve,
    scope:'Exact reserved rotation/body/storage and release-reach screen; no clamp/force/kit/material/weather qualification.'};
}

const doorLeafEnd=v=>v.retained.hinges[0][0]+v.retained.gaps.left+v.retained.leafEach[0];
export function renderSouthCourtThreshold(v){
  const X=y=>65+(y-4000)*1.55,Z=z=>350-z*1.1;
  let s='<svg xmlns="http://www.w3.org/2000/svg" width="1300" height="720" viewBox="0 0 1300 720"><rect width="1300" height="720" fill="#fbfaf5"/>';
  const text=(x,y,t,size=12)=>`<text x="${x}" y="${y}" font-family="Arial" font-size="${size}">${t}</text>`;
  const line=(a,b,c='#245f76',width=2)=>`<line x1="${X(a[0])}" y1="${Z(a[1])}" x2="${X(b[0])}" y2="${Z(b[1])}" stroke="${c}" stroke-width="${width}"/>`;
  const rect=(y0,y1,z0,z1,c)=>`<rect x="${X(y0)}" y="${Z(z1)}" width="${(y1-y0)*1.55}" height="${(z1-z0)*1.1}" fill="${c}"/>`;
  s+=text(30,32,'SOUTH COURT THRESHOLD · ONE PROJECT REFERENCE / NOT WEATHER OR FIRST-HARM QUALIFIED',17);
  s+=text(30,57,'Centre section (north/right is outside): retained rough1800 / frame140 / leafbottom19; jamb50→40 +10 installation each.');
  s+=rect(4000,4090,-180,-15,'#d7d3c5')+rect(4000,4090,-15,0,'#a4a097');
  s+=rect(4110,4250,-35,15,'#c5b26f')+rect(4230,4250,-15,-5,'#fbfaf5');
  s+=rect(4206,4250,19,200,'#8b9caa');
  s+=line([4090,15],[4090,-45])+line([4090,-45],[4450,-55])+line([4090,15],[4060,15])+line([4060,15],[4060,0])+line([4060,0],[4030,0]);
  s+=line([4250,0],[4350,0],'#555')+line([4250,-25],[4350,-25],'#555')+line([4350,-25],[4350,0],'#555');
  s+=line([4450,0],[4550,0],'#555')+line([4450,-80],[4550,-80],'#555')+line([4550,-80],[4550,0],'#555');
  for(const z of [15,-35,-55,-80])s+=text(12,Z(z)+4,String(z));
  s+=text(75,105,'Metal wet face / dry core behind (material choice remains open)');
  s+=text(105,150,'No sill fixing through pan; jamb anchors at400/1100/1900');
  s+=text(X(4300)-55,510,'Primary tray → N');s+=text(X(4490)-40,538,'Secondary pan → E');
  const jx=x=>945+(x-5050)*1.8,jz=z=>305-z*.8;
  s+=text(945,95,'LEFT JAMB / FRONT SECTION');
  s+=`<rect x="${jx(v.frame.outerX[0])}" y="${jz(150)}" width="${v.frame.jambEach*1.8}" height="${(150-v.frame.timberFootZ)*.8}" fill="#8b9caa"/>`;
  s+=`<path d="M${jx(v.pan.outerX[0])},${jz(v.pan.ends.crestZ)} L${jx(v.pan.outerX[0])},${jz(-45)} L${jx(5180)},${jz(-45)}" fill="none" stroke="#245f76" stroke-width="3"/>`;
  const apron=v.jambs.cavityTray.leftApron;
  s+=`<path d="M${jx(apron.x[0])},${jz(apron.z[1])} L${jx(apron.x[0])},${jz(apron.z[0])} L${jx(v.pan.outerX[0])},${jz(apron.z[0])}" fill="none" stroke="#245f76" stroke-width="3"/>`;
  s+=text(945,365,'End75 / pan−45 / framefoot30');
  s+=text(945,384,'Apron75→DPC150; wet-face return150');
  s+=text(945,403,'6.5 clear pan-end to frame');
  s+=text(945,434,'MEETING / FRONT SECTION');
  const mx=x=>945+(x-5945)*2,mz=z=>525-(z-19)*.8;
  const leftEnd=doorLeafEnd(v),rightStart=leftEnd+v.retained.gaps.meeting;
  for(const [a,b] of [[5950,leftEnd],[rightStart,6050]]){
    s+=`<rect x="${mx(a)}" y="${mz(100)}" width="${(b-a)*2}" height="${(100-v.frame.wetFace.leafDryCoreBottomZ)*.8}" fill="#8b9caa"/>`;
    s+=`<path d="M${mx(a)},${mz(100)} L${mx(a)},${mz(19)} L${mx(b)},${mz(19)} L${mx(b)},${mz(100)}" fill="none" stroke="#245f76" stroke-width="3"/>`;
  }
  s+=text(945,550,'3 meeting gap; shoes19..100 / core25');
  s+=text(30,578,'Pan rear crest15; end dams75; jamb cavity apron75→150. Pan floor−45→−55; primary weep−5 / secondary outlet−55.');
  s+=text(30,601,'Centre/meeting:3 gap and50 metal cap; shoes19..100 with outward22 drains, protected core begins25. No wet-pocket fasteners.');
  s+=text(30,624,'Jamb:1796 outer pan within1800 rough;1.5 end walls leave6.5 to1780 outer frame.40 jamb retains original hinges5150/6850.');
  s+=text(30,647,'Geometric unbacked interior overflow15 = trial activation−110 +75 head +25 splash +25 tolerance. Quiet-stage limit−35.');
  s+=text(30,670,'This is an allocated geometric budget, not a computed operating stage. Qualified first susceptible level remains UNKNOWN.');
  s+=text(30,693,'Full channel/paver/support/renewal joins remain to be checked; actual seams, material, structural, hydraulic and weather acceptance unearned.');
  return s+'</svg>\n';
}
