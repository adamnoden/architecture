/** Finite UNADOPTED chute, manual retrieval and temporary rain-control proposal. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {compare} from './graded-transfer-comparison.mjs';
import {readSelected,manningFlow} from './selected-water-event.mjs';
const g=9.81,rho=7850,E=200e9;
const mix=(a,b,t)=>a+(b-a)*t,smooth=t=>t*t*(3-2*t);
export function geometry(){
 const source=readSelected(),energy=compare(),r=source.model.renewal,profile=energy.candidateProfile;
 const x0=6125,x1=7550,z0=energy.sourceRun.floor[0],z1=energy.sourceRun.floor[1],R=profile.toeRadiusMm;
 const angle=profile.straightAngleDegrees*Math.PI/180,xt=x1-R*Math.sin(angle);
 const bed=x=>x<xt?z0-(x-x0)*Math.tan(angle):z1+R*(1-Math.sqrt(1-((x1-x)/R)**2));
 const branches=[{id:'S',start:[6950,7175],end:[6605,6945]},{id:'N',start:[7275,7375],end:[6980,7195]}];
 const sections=Array.from({length:101},(_,i)=>{
  const u=i/100,x=mix(x0,x1,u),t=smooth(u);
  return {x,bed:bed(x),bankHeight:Math.min(100,-65-bed(x),100-5*Math.max(0,(x-xt)/(x1-xt))),
   channels:branches.map(b=>({id:b.id,wetY:b.start.map((y,j)=>mix(y,b.end[j],t)),wall:1.5,dryFlange:10}))};
 });
 for(const s of sections){
  assert(s.bankHeight>=85,'Wet bank must remain actual positive height');
  assert(s.bed+s.bankHeight<=-65,'Chute bank intersects plain cover bottom−60');
  assert(s.channels[1].wetY[0]-s.channels[0].wetY[1]>=23,'Inner dry flanges collide');
 }
 const guide=[6070,6900,1385],station={plan:[6125,6700,375,400],topRange:[590,660],support:'Cantilevered from the same captured guide base; NO restored cover blocks a deep panel drawing upward. Tray hinges UP along its SOUTH edgeY6700 during initial extraction, then locks DOWN after panel bottom is above735. Matched side-flange cradles set each panel seat from its actual floor profile.'};
 const tubes=[40,35,30,25].map(OD=>({OD,wall:1.5,length:1000,massKg:rho*Math.PI/4*((OD/1000)**2-((OD-3)/1000)**2)}));
 const panels=branches.flatMap(b=>Array.from({length:5},(_,i)=>{
  const a=x0+i*305,end=Math.min(x1,a+305),centre=(a+end)/2,t=smooth((centre-x0)/(x1-x0));
  const wet=b.start.map((y,j)=>mix(y,b.end[j],t)),width=wet[1]-wet[0],length=end-a+25;
  const materialArea=length/1000*(width/1000+2*.1)+2*.01*length/1000;
  const mass=materialArea*.0015*rho+.9;
  assert(mass<=4);
  const head=[centre,(wet[0]+wet[1])/2,bed(centre)+120],delta=head.map((v,j)=>(v-guide[j])/1000),L=Math.hypot(...delta),axis=delta.map(v=>v/L);
  assert(L<=2.7,'Four captured tubes cannot reach this panel');
  const extension=(L-.6)/3;
  assert(extension>=0&&extension<=.7,'Tube overlap below300');
  const spans=tubes.map((tube,j)=>({a:-.4+j*extension,b:.6+j*extension,...tube}));
  const weightMoment=x=>spans.reduce((m,t)=>{
   const a=Math.max(x,t.a),b=t.b;if(b<=a)return m;
   return m+t.massKg*g*((b-x)**2-(a-x)**2)/2;
  },0);
  const transverse=Math.hypot(axis[0],axis[1]),payload=mass*g;
  const n=1500,ds=L/n;let deflection=0,stress=0;
  for(let k=0;k<n;k++){
   const at=(k+.5)*ds,active=spans.filter(t=>t.a<=at&&t.b>=at);
   const OD=Math.min(...active.map(t=>t.OD))/1000,I=Math.PI/64*(OD**4-(OD-.003)**4);
   const M=1.5*transverse*(payload*(L-at)+weightMoment(at));
   deflection+=M*(L-at)/(E*I)*ds;stress=Math.max(stress,M*(OD/2)/I);
  }
  const moment=1.5*transverse*(payload*L+weightMoment(0)),bearingCouple=moment/.3;
  const axialPull=1.5*(mass+tubes.reduce((q,t)=>q+t.massKg,0))*g*Math.abs(axis[2])+.1*2*bearingCouple;
  const crossing=(6075-guide[0])/(head[0]-guide[0]),gateY=mix(guide[1],head[1],crossing);
  const widthGross=width+23;
  const waypoints=[head,[head[0],head[1],950],[6241.391365,6900,950],[6241.391365,6900,810]];
  let minimumForward=Infinity,maximumRearTop=-Infinity;
  for(let leg=0;leg<waypoints.length-1;leg++)for(let k=0;k<=100;k++){
   const p=waypoints[leg].map((v,j)=>mix(v,waypoints[leg+1][j],k/100)),d=p.map((v,j)=>v-guide[j]),span=Math.hypot(...d);
   minimumForward=Math.min(minimumForward,span);
   assert(span>=450&&span<=2700,'Actual captured tool path exceeds its strokes');
   const rear=Math.max(400,1000-span),top=guide[2]-rear*d[2]/span+20;
   maximumRearTop=Math.max(maximumRearTop,top);
   assert(top<1970,'Actual staff rear hits the temporary roof');
  }

  const belowRing=120+bed(centre)-bed(end)+20;
  assert(gateY-widthGross/2>=6575&&gateY+widthGross/2<=7225);
  return {id:b.id+(i+1),x:[a,end],grossMaximumPlan:[length,widthGross],floorEnds:[bed(a),bed(end)],
   completeVerticalBudget:100+Math.abs(bed(a)-bed(end))+20,massHypothesisKg:mass,captureHead:head,matchedSeatZ:810-belowRing,
   extractionWaypoints:waypoints,minimumForwardAlongPath:minimumForward,maximumRearTopAlongPath:maximumRearTop,
   tool:{actualForwardReachMm:L*1000,minimumOverlapMm:1000-extension*1000,gateCentreY:gateY,
    factoredGuideMomentNm:moment,guideBearingCoupleN:bearingCouple,axialPullSensitivityN:axialPull,
    sixMmStopPinDoubleShearDemandMpa:bearingCouple/(2*Math.PI*.006**2/4)/1e6,
    pairedTubePinBearingDemandMpa:bearingCouple/(2*.0015*.006)/1e6,
    elasticTipDeflectionMm:deflection*1000,maximumBendingStressMpa:stress/1e6}};
 }));
 const maximumMoment=Math.max(...panels.map(p=>p.tool.factoredGuideMomentNm));
 const ballast={blocks:2,each:[150,300,65],density:rho,centreX:5550,frontSupportX:6100};
 ballast.massKg=2*.15*.3*.065*rho;
 ballast.restoringMomentNm=ballast.massKg*g*(ballast.frontSupportX-ballast.centreX)/1000;
 assert(ballast.restoringMomentNm>1.5*maximumMoment);
 const pipe={clear:[150,150],wall:1.5,axisX:6800,y:[7750,13550],inverts:[1900,1841.5126050420167],
  grossX:[6698.5,6901.5],lowestStraightWall:1840.0126050420167,crewHeight:1800,crewBandMaximumY:12650,lowestWallInCrewBand:1849.0882352941176,minimumCrewProxyReserve:49.08823529411757,
  tieUnderside:2175,maximumStraightCrown:2051.5,
  northTurn:{plan:[6650,13550,226.5,226.5],centre:[6650,13550],centreRadius:150,clearInsideRadius:75,grossOuterRadius:226.5,
   tangentIn:[6800,13550,1841.5126050420167],tangentOut:[6650,13700,1839.137812316612],header:[[6650,13700,1839.137812316612],[5000,13700,1822.637812316612]],terminal:[5000,13700,-600],direction:'VERTICALLY DOWN',
   lowestHeaderWall:1821.137812316612,exclusion:'Header/terminal Y13623.5..13776.5 is beyond every current N liner operator ending12650. No ordinary crew stands below it.'},
  courtTakeoff:{insideDiameter:125,outsideDiameter:128,fromGutter:[7675,7000,2000],bottom:[7675,7000,1920],
   expansion:{x:[7550,7650],from125RoundTo:[150,150],role:'Closed visible temporary transition; no free discharge into the E well.'},
   route:[[7675,7000,1920],[7450,7000,1910],[6800,7750,1900]],minimumInvert:1900},
  flashedChase:{roofOpeningX:[6695,6905],sheetLapEach:50,flangeEach:25,sideEntryBottom:1980,sideEntryTop:2030,
   frameBypass:{axesY:[8800,10300,11750,13350],sideStubsX:[6650,6950],member:[80,40,4],underside:2056.5,topWithMetalCap:2138,
    role:'Actual80-high dry crossover bridges interrupted temporary EW roof rails above the chase, with side returns48.5 clear of its gross flanges. No cut rail is assumed to retain its old capacity. Temporary loads/wind/fixings remain a specific STR demand.'},
   sheet:'Two temporary metal weather planes fall to side-entry slots. Each50 lap turns down into the box ABOVE its calculated flow; removable100 saddle/20butt/40laps and top clamps repeat at≤1000 segments. No pipe is drawn through an uncut roof or rail.'},
  supports:{addedNorthPost:{axis:[7000,13350],postPlan:100,footPlan:250,footBounds:[6875,13225,250,250],operatorSetback:575,headerCantileverPlan:[[7000,13350],[5000,13700]],headerCantileverLength:Math.hypot(2000,350),role:'Actual extra temporary north post replaces a hidden2026.5 overhang. It is outside N receiver and controlled crew lane; header has its own2030.4 diagonal cantilever demand, not an invented support at the wet outlet.'},maximumPitch:1000,seatDepthBelowInvert:0,fastenersBelowBottom:0,role:'Independent side-edge saddles carry the closed chase from the temporary roof rails. No low hanging clamp below1838.5; actual load reactions and member/fixing acceptance remain explicit temporary-work duties.'},
  flow:{courtAndInwardRoofLps:3.60375,loggiaPlanM2:2.4*5.8,loggiaDirectLps:216*2.4*5.8/3600},
  erection:['With both permanent paths/covers intact, erect the temporary roof frames and actual interrupted-rail crossovers; install/test the closed north chase and independent vertical terminal while N receiver is accessible.',
   'Fit court takeoff/closed transition and all roof side-entry laps; apply water and establish both canopy catchments reach N receiver without entering E well. Existing E remains the independent court route.',
   'Only after the high chase/support/terminal are complete and checked may its1838.5 lowest solid replace the old1700 lowpipe phase restriction. Shortmodule1100 bail and1800 crew must be checked against EVERY turn/support lowpoint, not only straight pipe.',
   'Renew N short then long modules with E intact; restore/test N before opening chase saddles, removing roof laps or exporting any temporary drain. No pipe removal while it is the live canopy route.'],
  admitted:false};
 pipe.flow.combinedLps=pipe.flow.courtAndInwardRoofLps+pipe.flow.loggiaDirectLps;
 pipe.flow.fullHeadVerticalImpact={maximumSourceHead:2051.5,waterPlane:-800,dryBedMaximum:-1000,velocityAtWater:Math.sqrt(2*g*2.8515),velocityAtDryBed:Math.sqrt(2*g*3.0515),forceAtDryBedN:pipe.flow.combinedLps*Math.sqrt(2*g*3.0515),powerAtDryBedW:pipe.flow.combinedLps*g*3.0515,qualifiedSplash:false};
 pipe.flow.blockedReceiver50percentWidth={clearWidth:750,crest:-700,idealHeadMm:1000*(pipe.flow.combinedLps/1000/(Math.sqrt(g)/(1.5**1.5)*.75))**(2/3)};
 pipe.flow.cleanRectangularSensitivityLps=[.015,.02,.025].map(n=>({n,at75DepthLps:1000*manningFlow(.15,.075,n,60/5950)}));
 return {identity:'RWT-UNADOPTED-GRADED-TRANSFER-GEOMETRY-2026-11-06',source:source.blob,selectedGeometryChanged:false,
  status:'UNADOPTED finite construction proposal; no material/first-wet/temporary-work/physical admission',
  well:r.courtIntakeWell,profile,sections,panels,
  construction:{wall:1.5,bankMaximum:100,earlyBank:85,plainCoverBottom:-60,lap:25,topRelease:'Each independent channel panel has four captive lift lugs and two dry-edge top cams. Capture the indexed four-point yoke before either cam is released. Upstream 25 mm OVERlap sits ABOVE the downstream panel. Both top cams and open upward saddle release before VERTICAL first lift. No panel is trapped under its neighbour or pushed into fixed court.',
   stationsX:[6125,6430,6735,7040,7345,7550],endOverlapToX:7575,terminalLanding:{dropToBody:5,minimumSheetUndersideGap:3.5,bankAtToe:95,role:'Final 25 mm nose slopes with the receiving carrier, five above its wet floor;1.5 mm sheet remains3.5 mm clear. No uphill sheet stack or deep final plunge.'},
   sequence:['E weather controls tested; N independently full-duty; isolate/drain E. Keep guard/gate and rated neighbouring plain covers.',
    'Lock guide/base and folded tray with both paths/covers intact before the E isolation operation. Open first cover column; capture its two independent pieces. Keep the column OPEN: restoring its cover would block later deep pieces.',
    'Open the next cover column including its 25 mm downstream overlap margin. Capture/release the piece, raise vertically free of its OVERlap to ring 950 mm with tray folded. Lock tray DOWN only after bottom exceeds 735 mm. Translate above tray to retrieval point, then lower to its matched cradle before handover. Every leg is guided/indexed under retention; no person enters well or stands below load.',
    'After ALL chute pieces, capture tool/tray and well covers leave, remove hood and use the existing stairs/platform. Incoming is reverse: finish body/hood work, clear people/stairs, install chute from above, then plain covers; water-test before E admission.'],
   qualifiedMaterial:false},
  manualRetrieval:{guide,station,tubes,steelModulusHypothesisPa:E,payloadFactor:1.5,minimumStageOverlap:300,capturedHousingRunout:150,minimumForwardAfterRunout:450,
   indexedMotion:'Four1000 tubes, positive300minimum overlap, three separately pinned700max strokes. Guide retains two closed bearing collars300apart and independent stop. Retract in captured indexed strokes; no unsupported hand-over-hand telescope. Gimballed four-point head keeps the panel under positive antiroll retention.',
   deposit:{collapsedForward:600,pivotDegrees:Math.asin((guide[2]-810)/600)*180/Math.PI,head:[guide[0]+Math.sqrt(600**2-(guide[2]-810)**2),guide[1],810],
    method:'Collapsed tool pivots in its captured guide to place the panel on its matched590..660 cradle; only after tray contact may the indexed yoke release. Crouched manual handover occurs from retained court, never below suspended load.'},
   operator:{centre:[5700,6850,50],handoverCentre:[5800,6850,50],bodyRadius:300,shoulderStanding:1500,shoulderCrouched:1000,reach:600},
   base:{plan:[5450,6525,650,650],top:50,levellingFeet:'Four feet wholly on fixedcourt west of6125; actual court grade−60..−90 sets their lengths. No foot is on N intake or removedwell cover.',ballast},
   weatherEntry:{innerPlaneX:6075,outerPlaneX:5375,sideWallsY:[6500,7250],roofUnderside:1970,
    operation:'The actual covered vestibule is closed on BOTH sides and WEST outer flap is locked before the EAST inner flap opens. Inner flap remains open for tool retrieval/handover; the outer closed flap and side walls protect the well. Close inner flap before opening outer flap to export a supported panel. No moving-shaft weather hole or simultaneously open doors are assumed.'},
   claim:'Calculated load/moment/elastic demands for a source-built manual tool, not an OEM rating. Tube/pin/bearing/stop strength, retention/jamming and physical human operation remain specific tests; no person lift or powered crane is borrowed.'},
  temporaryCanopyDrain:pipe,
  unresolved:['Three-dimensional plan curvature, curved-toe pressure, wave/splash and first wetting need their own bounded assessment; the sectional energy comparison is not a full flow pass.',
   'Chase court NW turn and roof frame/cap details must be reviewed against all temporary solids before replacing the selected rain-control source.',
   'The northreceiver must be assessed at combined4.43895L/s during Nmaintenance; existing3.60375 screens alone do not cover that state.',
   'Every physical/material/site flag stays false. This proposal changes no selected HAD geometry until the joined decision.']};
}

const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
export function render(o){
 let s='<svg xmlns="http://www.w3.org/2000/svg" width="1900" height="1550" viewBox="0 0 1900 1550"><rect width="100%" height="100%" fill="#fbfaf5"/><g font-family="sans-serif" fill="#24323b">';
 const text=(x,y,t,size=20)=>`<text x="${x}" y="${y}" font-size="${size}">${escape(t)}</text>`;
 s+=text(35,40,'UNADOPTED · actual graded transfer / manual retrieval / temporary canopy drain',28);
 s+=text(35,75,'Same selected well and quiet/protection budget. Joined proposal for inspection; no hydraulic/material/site admission.',20);
 const px=x=>60+(x-6075)*.43,py=y=>130+(7400-y)*.43;
 s+=text(50,115,'Well plan · two controlled channels, no assumed 600 mm stream',23);
 s+=`<rect x="${px(6125)}" y="${py(7400)}" width="${1525*.43}" height="${1100*.43}" fill="#eee7d7" stroke="#455b67"/>`;
 for(let j=0;j<2;j++){
  const points=o.sections.map(v=>`${px(v.x)},${py(v.channels[j].wetY[0])}`).concat([...o.sections].reverse().map(v=>`${px(v.x)},${py(v.channels[j].wetY[1])}`)).join(' ');
  s+=`<polygon points="${points}" fill="${j?'#8db4cf':'#72aaa6'}" stroke="#295c6f" stroke-width="2"/>`;
 }
 for(const x of o.construction.stationsX)s+=`<path d="M${px(x)} ${py(7400)} V${py(6600)}" stroke="#9c6f38" stroke-dasharray="5 4"/>`;
 s+=`<rect x="${px(6125)}" y="${py(7200)}" width="${600*.43}" height="${600*.43}" fill="none" stroke="#777" stroke-dasharray="6 5"/><rect x="${px(6725)}" y="${py(7350)}" width="${600*.43}" height="${900*.43}" fill="none" stroke="#777" stroke-dasharray="6 5"/>`;
 s+=text(50,625,'Dashed: existing stair / platform, unavailable until chute is removed.',17);
 s+=text(50,655,'West: 225 + 100 mm credited entries. East: 340 + 215 mm wet channels.');
 s+=text(50,685,'35 mm wet gap → 12 mm between actual walls + dry flanges.');
 s+=text(50,715,'Ten separate ≤ 330 × 363 mm panels; all leave before stair access.');
 const sx=x=>60+(x-6125)*.43,sz=z=>790-z*.38;
 s+=text(50,750,'Section · monotone floor with tangent toe; panels follow actual depth',23);
 s+=`<path d="${o.sections.map((p,i)=>`${i?'L':'M'}${sx(p.x)} ${sz(p.bed)}`).join(' ')}" fill="none" stroke="#26768b" stroke-width="5"/>`;
 s+=`<path d="M${sx(6125)} ${sz(-60)} H${sx(7550)}" stroke="#777" stroke-dasharray="8 5"/>`;
 s+=text(50,1200,'Floor −150 → −792.647 mm; final 25 mm nose remains 5 mm over E floor.');
 s+=text(50,1230,'Bank 85 → 100 → 95 mm; final nose drops 5 mm onto selected E floor.');
 s+=text(50,1260,'Two-piece E carrier remains at its selected levels; no deeper stagnant sump.');
 s+=text(50,1310,'Sectional energy ≠ plan-turn / pressure / splash or first-wetting proof.',21);
 s+=text(50,1130,'Existing well floor −950 mm',17);
 const nx=y=>970+(y-7750)*.12,nz=z=>430-(z-1800)*.6;
 s+=text(960,115,'North-going canopy chase · direct to N receiver',23);
 s+=`<path d="M${nx(7750)} ${nz(2175)} H${nx(13700)}" stroke="#835f54" stroke-width="4"/>`;
 s+=`<path d="M${nx(o.temporaryCanopyDrain.y[0])} ${nz(o.temporaryCanopyDrain.inverts[0])} L${nx(o.temporaryCanopyDrain.y[1])} ${nz(o.temporaryCanopyDrain.inverts[1])}" stroke="#26768b" stroke-width="6"/>`;
 s+=`<path d="M${nx(7750)} ${nz(1800)} H${nx(13700)}" stroke="#ad634b" stroke-dasharray="6 5"/>`;
 s+=text(1710,195,'Tie 2175 mm',16)+text(1710,425,'Crew 1800 mm',16);
 s+=text(960,475,'150 × 150 clear; straight invert 1900 → 1841.51 mm.');
 s+=text(960,505,'Crew band: lowest wall 1849.1 mm, 49.1 mm over 1800 mm proxy.');
 s+=text(960,535,'Chase crown ≤ 2051.5 mm; capped frame bypass 2138 mm.');
 s+=text(960,565,'Tie underside 2175 mm → 37 mm over actual bypass cap.');
 s+=text(960,595,'Flashed side entries + 50 mm laps; no pipe through an uncut roof.');
 s+=text(960,625,'Court 3.60375 + loggia 0.8352 = 4.43895 L/s to N receiver.');
 s+=text(960,655,'North turn / west header → vertical outlet 5000,13700,−600 mm.');
 const tx=x=>950+(x-5350)*.35,tz=z=>1250-z*.2;
 s+=text(960,720,'Captured manual retrieval · retract, raise, then lower to locked tray',23);
 s+=`<path d="M${tx(5450)} ${tz(50)} H${tx(6100)}" stroke="#777" stroke-width="8"/>`;
 const far=o.panels.reduce((a,b)=>a.tool.actualForwardReachMm>b.tool.actualForwardReachMm?a:b),guide=o.manualRetrieval.guide;
 s+=`<path d="M${tx(guide[0])} ${tz(guide[2])} L${tx(far.captureHead[0])} ${tz(far.captureHead[2])}" stroke="#3c7e91" stroke-width="7"/>`;
 s+=`<path d="M${tx(6125)} ${tz(630)} H${tx(6500)}" stroke="#9d774a" stroke-width="8"/>`;
 s+=`<polyline points="${far.extractionWaypoints.map(p=>`${tx(p[0])},${tz(p[2])}`).join(' ')}" fill="none" stroke="#a26445" stroke-dasharray="6 5" stroke-width="3"/>`;
 s+=`<circle cx="${tx(5700)}" cy="${tz(1500)}" r="18" fill="#a26f45"/><path d="M${tx(5700)} ${tz(1450)} V${tz(50)}" stroke="#a26f45" stroke-width="18"/>`;
 s+=text(960,1460,'Four captured 1000 mm tubes; ≥300 mm overlap. Independent hinged retrieval tray.');
 s+=text(960,1490,`Ballast ${o.manualRetrieval.base.ballast.massKg.toFixed(1)} kg; max factored guide moment ${Math.max(...o.panels.map(p=>p.tool.factoredGuideMomentNm)).toFixed(1)} N·m.`);
 return s+'</g></svg>\n';
}
export function renderCanopy(o){
 const p=o.temporaryCanopyDrain,x=a=>65+(a-4250)*.09,y=a=>960-(a-7000)*.09;
 const text=(a,b,t,size=19)=>`<text x="${a}" y="${b}" font-size="${size}">${escape(t)}</text>`;
 const rect=(a,c)=>`<rect x="${x(a[0])}" y="${y(a[1]+a[3])}" width="${a[2]*.09}" height="${a[3]*.09}" fill="${c}" fill-opacity=".45" stroke="#53616a"/>`;
 let s='<svg xmlns="http://www.w3.org/2000/svg" width="1450" height="1100" viewBox="0 0 1450 1100"><rect width="100%" height="100%" fill="#fbfaf5"/><g font-family="sans-serif" fill="#24323b">';
 s+=text(35,35,'UNADOPTED · temporary canopy drain and flashed roof chase',27);
 s+=text(35,70,'Source-bound geometry; proposed replacement for the deep E-well discharge. Material/physical/site admission remains false.');
 s+=rect([4800,7750,2400,5800],'#c5d9dd')+rect([4250,13450,1500,1700],'#91b7a1');
 const arc=Array.from({length:17},(_,i)=>{const a=i*Math.PI/32;return [p.northTurn.centre[0]+150*Math.cos(a),p.northTurn.centre[1]+150*Math.sin(a)];});
 const route=[...p.courtTakeoff.route,p.northTurn.tangentIn,...arc,...p.northTurn.header,p.northTurn.terminal];
 s+=`<polyline points="${route.map(a=>`${x(a[0])},${y(a[1])}`).join(' ')}" fill="none" stroke="#26768b" stroke-width="14"/>`;
 s+=`<circle cx="${x(5000)}" cy="${y(13700)}" r="7" fill="#994d34"/>`;
 s+=text(430,160,'N receiver: 4250..5750 / 13450..15150 mm');
 s+=text(430,190,'Vertical terminal 5000 / 13700 / −600 mm');
 s+=text(430,220,'Required ordinary receiving water ≤ −800 mm');
 s+=text(430,250,'150 mm terminal leaves 175 mm near-edge setback.');
 s+=text(430,295,'150 × 150 clear header turns WEST at y13700,');
 s+=text(430,325,'invert 1839.14 → 1822.64 mm before the vertical tail.');
 s+=text(430,385,'North chase: x6800; R150 turn starts at y13550 mm.');
 s+=text(430,415,'Invert 1900 → 1841.51; closed, self-draining.');
 s+=text(430,475,'Actual court takeoff 125 ID / 128 OD;');
 s+=text(430,505,'closed expansion to 150 × 150 before NW turn.');
 s+=text(430,535,'No high-energy open discharge in the E well.');
 const cx=a=>930+(a-6500)*.65,cz=a=>525-(a-1800)*.65;
 s+=text(900,120,'Actual chase / roof-frame section',23);
 s+=`<rect x="${cx(6723.5)}" y="${cz(2051.5)}" width="${153*.65}" height="${153*.65}" fill="#8fb5c7" fill-opacity=".5" stroke="#26768b" stroke-width="2"/>`;
 s+=`<path d="M${cx(6500)} ${cz(2001.5)} H${cx(6698.5)} L${cx(6725)} ${cz(1980)} M${cx(7100)} ${cz(2001.5)} H${cx(6901.5)} L${cx(6875)} ${cz(1980)}" stroke="#8d713f" stroke-width="4" fill="none"/>`;
 s+=`<rect x="${cx(6650)}" y="${cz(2138)}" width="${300*.65}" height="${80*.65}" fill="none" stroke="#58616a" stroke-width="3"/>`;
 s+=`<path d="M${cx(6500)} ${cz(2175)} H${cx(7100)} M${cx(6500)} ${cz(1800)} H${cx(7100)}" stroke="#a16a50" stroke-dasharray="6 5"/>`;
 s+=text(900,600,'150 clear + 1.5 mm walls, 25 mm dry flanges.');
 s+=text(900,630,'50 mm turned-down sheet laps enter side slots.');
 s+=text(900,660,'Crossover underside 2056.5 / cap 2138 mm.');
 s+=text(900,690,'37 mm below actual tie underside 2175 mm.');
 s+=text(900,720,'Crew-band wall 1849.1 mm: 49.1 mm above');
 s+=text(900,750,'1800 mm crew proxy; fasteners stay above it.');
 s+=text(430,815,'Combined duty: 3.60375 + 0.8352 = 4.43895 L/s.',21);
 s+=text(430,845,'At 75 mm depth, n=.025 /1:99.17 gives 5.063 L/s.');
 s+=text(430,875,'Necessary clean section sensitivity; actual entries/turn/head remain to be checked.');
 s+=text(430,925,'Erect and test chase, NW takeoff, header and free terminal before N release.');
 s+=text(430,955,'Only complete-source clearances may replace the old low-pipe phase restriction.');
 s+=text(35,1040,'Blue roof/pipe is temporary; green receiver is a conditional RWT territory. No real plot, terrain or disposal is accepted.');
 return s+'</g></svg>\n';
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const o=geometry(),files=new Map([['project/rwt/studies/graded-transfer-geometry.json',JSON.stringify(o,null,2)+'\n'],['project/rwt/studies/graded-transfer-geometry.svg',render(o)],['project/rwt/studies/graded-transfer-canopy.svg',renderCanopy(o)]]);
 for(const[p,s]of files)if(process.argv.includes('--check'))assert.equal(fs.readFileSync(p,'utf8'),s);else fs.writeFileSync(p,s);
 console.log('Unadopted finite geometry reproduced; selected house unchanged.');
}
