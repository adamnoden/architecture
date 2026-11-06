/** ONE unadopted six-wet/ten-cover access and collector recomposition. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readSelected} from './selected-water-event.mjs';
import {control as closedControl} from './closed-east-control.mjs';
const copper=8960;
export function proposal(){
 const s=readSelected(),v=s.model,r=v.renewal;
 const review=JSON.parse(fs.readFileSync('project/rwt/studies/short-inlet-review.json','utf8'));
 assert.equal(review.source.blob,s.blob,'Reproduce finite inlet review against the reconciled actual HAD proposal first');
 const closed=closedControl(),outletX=closed.collectingChange.outletAxis[0];
 const base=x=>x<=outletX?-187-(x-6125)*13/(outletX-6125):-200+(x-outletX)*20/(7375-outletX);
 const northFloor=(x,y)=>base(x)+Math.abs(y-7000)*.025;
 const bridgeX=[6111.5,6418.5],bridgeEndY=6870,bridgeEndTop=-176,bridgeSheet=1.5;
 const bridgeGap=bridgeX.map(x=>bridgeEndTop+.005*Math.abs(x-6241.5)-bridgeSheet-northFloor(x,bridgeEndY));
 const northBoxWaterKg=1.275*.55*.215*1000,swBoxWaterKg=.330*.55*.190*1000;
 const northSheet=(1.275*.55+2*(1.275+.55)*.215)*.0015*copper;
 const swSheet=(.330*.55+2*(.330+.55)*.190)*.0015*copper;
 const leaf=[6682.5,6250,40,695],body=[[7050,5900],[7050,6600],[7325,6850]],radius=300;
 return {identity:'RWT-UNADOPTED-SIX-WET-SOUTH-ACCESS-2026-11-06',
  source:{path:s.path,blob:s.blob,authority:s.authority,canonicalMain:s.canonicalMain,canonicalMainHadBlob:s.canonicalMainHadBlob},
  selectedGeometryChanged:false,accepted:false,quiet:-35,crest:15,qualifiedFirstHarm:null,
  recommendation:'Develop this ONE sixwet/fourplain collector with southordinaryaccess and the closed159control. Keep originalhinge as baseline; compare a priced raisednorthlatch if actual support/guard benefit earns it. Neither variant is adopted.600coverboundary tuning stays rejected.',
  retained:{well:r.courtIntakeWell,coverCount:10,walkingCoverEach:[305,550],northWet:5,southWet:1,southPlain:4,
   housePlan:[0,0,12000,12000],catchmentM2:60.0625,assignedLps:3.60375,bridgeDepth:450,
   westGate:r.guardGate,steps:r.courtIntakeAccess,platform:r.courtIntakeOperatorPlatform},
  mouth:{planeX:6125,approachX:[6025,6125],
   southIntervals:[[6311.5,6525],[6625,6838.5]],
   northRetainedHinge:[[6861.5,7197.5],[7247.5,7350]],northHungLatch:[[6861.5,7350]],
   realDryJoint:[6838.5,6861.5],newSouthSupportReservation:[6525,6625],northSupportReservation:[7350,7400],
   supportQualification:'South100/north50 are BOUGHT obstruction reservations, not authenticated anchor/baseplate sizes. Existing50hingefoot7197.5..7247.5 remains in retainedvariant. Any larger actual foot reduces the lip and must rerun the reference. No post is borrowed from RC or hidden in N collection.',
   guard:'Widen actual low open west slot/offsetledge to the sixwet intervals; keep guard bottom0, no kickplate. New supports/latch have real water-level clearances and must be designed; no unlocated foot credit.',
   feed:'Ordinaryramp moves SOUTH, removing the contradictory rising west under-ramp feed.100mm remains a finite bought approach; lateral court feed, free brink and real loss placement remain uncalibrated.'},
  collector:{northGross:[6100,6850,1275,550],southWestGross:[6100,6300,330,550],
   northWetY:[6861.5,7388.5],southWestWetY:[6311.5,6838.5],westWetX:6111.5,
   northFloorRule:'Westbase−187at6125→−200at the generated closed-control outletX7181.713; easttail−180at7375 fallsWEST to that outlet. Add .025*abs(y−7000) crossfall. One outlet follows the rigid native N18 rotated with50/4250fall; no65throat/raised sill or additionalcatchment.',
   closedOutletBinding:{axis:[outletX,7000,-200],source:'closed-east-control.mjs factoryPortBinding',shiftEW:outletX-7175},
   controls:[[6125,7000,northFloor(6125,7000)],[outletX,7000,-200],[7375,7000,-180]],
   southWestFloor:'Wetsurface−135atY6311.5 fallsN to−173.5at6830, then the captured flush/recessed seam bridge falls to−176at6870; receivingNfloor is lower. Crossfall .005 toX6241.5. No connectingtube below the well or down-and-up trap.',
   bridge:{plan:[bridgeX[0],6830,bridgeX[1]-bridgeX[0],40],sheet:bridgeSheet,wetEnds:[-173.5,bridgeEndTop],
    dryBodySeamY:6850,endsOverNorthFloorGapMm:bridgeGap,minimumSheetUndersideGap:Math.min(...bridgeGap),
    release:'ONE positively captured307×40seambridge/topcap releases from ABOVE before eitherwesternwetbody. Flush/recessedsouthseat prevents a1.5mm countersill. Actual saddle/lap/seal/clamp/movement and firstrelease remain unqualified; it is not a loose sheet resting over a butt.'},
   westUnderlap:{courtLipX:6125,wetPanWallInnerX:6111.5,zeroHorizontalJetPlanReserve:13.5,projectionUnderCourt:25,
    affectedBodies:['NW firstnorthcatchcassette','SW newwetpan'],capturedCompletePlan:[330,550],
    reason:'A vertical low-momentum drop at6125 must fall INSIDE the receivingpan, not onto an unpriced11.5drywall/flange.25westprojection pays that capture; it is not free verticalwithdrawal beneath fixedcourt.'},
   cassetteMaximumDepth:215,southWestMaximumDepth:190,
   existingFirstTread:-260,northWestMaximumNominalUnderside:-188.5,nominalFirstTreadGap:71.5,
   firstWet:'Covered collector and roofjet impact still require real wall/cover/seam pressure/splash, air/vent, obstruction and firstleak evidence. The fullclosedtube/roofhead demand is not reduced to the small nominal quiet reserve.'},
  ordinaryAccess:{ramp:[6725,5750,650,550],floorEnds:[-30,0],slope:30/550,deckThickness:15,
   gate:{planeY:6250,rawX:[6675,7425],clearX:[6700,7400],hinge:[6702.5,6250],leaf:[695,40,1100],
    opening:'NORTH/INWARD only while ALL ten walkingcovers locked and supported; close/latch/test before any cover release.',parkedLeafPlan:leaf,
    parkedLeafToR300Path:6750-(leaf[0]+leaf[2])},
   bodyRadius:radius,centreline:body,rampBodyReserves:[25,25],finalBodyEastCoverReserve:7650-(7325+radius),
   westNotchGap:6750-6225,turnStartsAfterBodySouthEdge:6600-radius,
   NCanopyFootX:[7425,7675],NCanopyFootReserve:7425-7375,EWorkRoofPostX:[7575,7675],EWorkRoofPostReserve:7575-7375,
   removableTip:{plan:[6725,6200,650,100],thickness:15,bundPlaneY:6250,
    sequence:'With coversLOCKED and southgateCLOSED, capture/remove last100tip; park/restraint on closedramp SOUTH of6200 before erecting continuous Eweatherbund/skirt. No permanent ramp pierces the bund. Keep ordinaryaccessclosed until enclosure removed, tip recaptured/reinstated/locked and gate tested.',
    parkedPlan:[6725,6090,650,100],actualCaptureForceSealQualified:false},
   role:'OrdinaryEwindowcleaning on lockedcovers only. Windowleaf/body/pole source stays. Southgate never grants access to an openwell; Erenewal retains WEST gate/steps. No new interiorroom or footprint change.',
   unproved:'Actual toe/endledges independent of removablecovers, gate/latch/forces, tip retention/loadedmotion, surface/step category and full erection/reversal require constructive/physical qualification.'},
  hingeTradeoff:{retained:{footY:[7197.5,7247.5],northSupportY:[7350,7400],
    price:'No gate rehang, keeps actual originalparkedleaf and hinge. Sixwet200approach adversarialreference FAILS; bought100/150 retain positive signs, not installed margins.'},
   raisedLatch:{southHinge:[6075,6577.5],parkedLeaf:[5430,6557.5,645,40],northLatchY:7222.5,latchZ:1000,
    parentPostCentreY:null,actualParentAnchorage:null,
    leverSensitivityMm:[152.5,177.5],
    price:'Remove oldnorthhingefoot only with actual southhinge and positive raisednorthcatch. Source cornerpost/anchor is NOT authenticated;50post and anchorfoot are not interchangeable. Price parentpost/foot, gate load, bending/torsion/deflection, hand/grip sweep and retained release/renewal. No RC node/support borrowed; short metalcantilever is not categorically rejected.',
    qualification:'Two152.5/177.5geometric lever sensitivities only, not fixed actualpostcentres, section or capacity.'}},
  renewal:{westGateClearY:[6575,7225],originalParkedLeafY:[7202.5,7242.5],weatherEntryY:[6550,7200],
   capturedBodyCrossingY:[6625,7175],parkedLeafReserve:27.5,weatherEntryNorthReserve:25,
   westernPanFirstMotion:{neighboursRemoved:['northmodule2','southmodule2'],bridgeRemoved:true,translationE:35,
    initialUnderlapX:[6100,6125],afterTranslationBodyX:[6135,6465],clearOfCourtFace:10,
    liftTop:1700,lowestLiftedBottom:1485,guardTop:1100,liftedGuardGap:385,rainRoofUnderside:1970,roofGap:270},
   sequence:['Nintact/full-duty, Eweathercontrols erected/tested, southgateclosed; retain guards/closed ratedcovers until eachcapture.',
    'Capture/remove small topseambridge, northmodule2 and southmodule2 FROMABOVE, with real retained crew/handler onfixedcourt. No person descends while anycatchbody remains.',
    'Capture/release eachNW/SWbody, translateE35 to free25undercourtprojection with10clear, THEN lift/transfer aboveguard and passactual550gate/weatherenvelope. Do not liftvertically into fixedcourtlip.',
    'Remove remaining covers/gutters. Only after all free bodies/guards are controlled use retainedWEST gate/stairs/platform; ordinarySOUTHgate staysclosed.',
    'Reverse: reinstate/test closedEpipe/terminal whileoutboardcoversOPEN, catchpans/seambridge/underlaps/clamps/guards, completewater/leakwitness, closecovers, then removeEweathercontrol and reinstate southtip/access.'],
   actualHandlerForceAndFullCrewSweepQualified:false},
  loads:{northBoundingFullWaterKg:northBoxWaterKg,southWestBoundingFullWaterKg:swBoxWaterKg,
   totalBoundingFullWaterKg:northBoxWaterKg+swBoxWaterKg,northSheetOnlyKg:northSheet,southWestSheetOnlyKg:swSheet,
   scope:'Conservative grossboxes fullto0,215/190deep; actual shaped volume smaller, not a storm-fill prediction. Sheet1.5copper includes fullrectangularbottom/sides but excludes overlaps/coverframes/clamps/eyes/capture/bridge apparatus. Walkingcover/blockedmodule/handling loads remain real; old30kg budget is not a signed mass or handlift pass.'},
  hydraulicReference:{path:'project/rwt/studies/short-inlet-review.json',
   retainedHinge:review.sixWetRetainedHinge.cases,hungLatch:review.sixWetHungLatch.cases,
   boundary:review.fixedAssumptions.boundary},
  stateRules:['Ordinary:both permanentroutes assembled; allten covers locked before southwindowaccess.',
   'Eopen:Nfullduty; southaccessclosed/tipremoved before continuousEskirts; westgate/steps onlyafterabove-removal.',
   'Nshort/Nlong:the correctedtemporarychase remainsUNADOPTED; blockedtemporarychase has noearnedpassivefallback toEmerelybecauseEassembled. This collector does not silentlyrepair thatfailure.',
   'Roofhigh-eaveordinaryclearing/receiverrepair/majorrenewal and realSITE-WATER-HANDOFF remain separatefiniteRWT06duties.']};
}
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
export function render(o){
 const t=(x,y,v,n=18)=>`<text x="${x}" y="${y}" font-size="${n}">${esc(v)}</text>`;
 const x=X=>50+(X-5000)*.30,y=Y=>150+(7500-Y)*.28;
 const box=(p,fill,stroke='#5e7472')=>`<rect x="${x(p[0])}" y="${y(p[1]+p[3])}" width="${p[2]*.30}" height="${p[3]*.28}" fill="${fill}" stroke="${stroke}"/>`;
 let s='<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1350" viewBox="0 0 1600 1350"><rect width="100%" height="100%" fill="#fbfaf5"/><g font-family="sans-serif" fill="#293f43">';
 s+=t(30,35,'UNADOPTED · one six-wet collector / south ordinary access',28)+t(30,68,'Ten550walkingcovers retained. OneSWwetpan +capturedseam; originalwestrenewal gate/steps. Raisedlatch is a priced alternative.');
 s+=t(30,120,'Located plan · allcovers CLOSED during ordinary access',22);
 s+=box(o.retained.well,'#e9e3d4');
 for(let i=0;i<5;i++){
  s+=box([6125+i*305,6850,305,550],'#c8dfd8');
  s+=box([6125+i*305,6300,305,550],i===0?'#c8dfd8':'#e9e3d4');
 }
 s+=box(o.collector.southWestGross,'none','#317e91')+box(o.collector.bridge.plan,'#a47b50');
 s+=box(o.ordinaryAccess.ramp,'#d8ddd6')+box(o.ordinaryAccess.removableTip.plan,'#e5b48a');
 s+=box(o.ordinaryAccess.gate.parkedLeafPlan,'#80786e');
 s+=box([5430,7202.5,645,40],'#80786e');
 s+=`<path d="M${x(6075)} ${y(6250)} V${y(6575)} M${x(6075)} ${y(7225)} V${y(7400)} H${x(7700)} V${y(6250)}" stroke="#746d64" stroke-width="5" fill="none"/>`;
 for(const[a,b]of [...o.mouth.southIntervals,...o.mouth.northRetainedHinge])s+=`<path d="M${x(6125)} ${y(a)} V${y(b)}" stroke="#2b876e" stroke-width="9"/>`;
 for(const[a,b]of[[6525,6625],[7197.5,7247.5],[7350,7400]])s+=`<path d="M${x(6125)} ${y(a)} V${y(b)}" stroke="#aa4f3b" stroke-width="9"/>`;
 s+=`<polyline points="${o.ordinaryAccess.centreline.map(p=>`${x(p[0])},${y(p[1])}`).join(' ')}" fill="none" stroke="#826a9a" stroke-width="4"/>`;
 for(const p of[o.ordinaryAccess.centreline[1],o.ordinaryAccess.centreline[2]])s+=`<circle cx="${x(p[0])}" cy="${y(p[1])}" r="90" fill="none" stroke="#826a9a" stroke-dasharray="6 4"/>`;
 s+=`<path d="M${x(6241.5)} ${y(6425)} V${y(7000)} H${x(o.collector.closedOutletBinding.axis[0])}" fill="none" stroke="#317e91" stroke-width="6"/>`;
 s+=t(30,715,'Green:priced clear lip. Red:100southfoot /50originalhinge /50northsupport reservations; actualanchors still unqualified.');
 s+=t(30,746,'Blue:ONE self-draining collector to7181.713/7000/−200closedoutlet. Brown:captured40seambridge, not a raisedbutt dam.');
 s+=t(980,150,'Ordinary access',22)+t(980,185,'650ramp:5750..6300,30rise.')+t(980,217,'700clear inwardgate; ALLcoverslocked.')+t(980,249,'R300:25each ramp /25eastwell /27.5leaf.')+t(980,281,'No west under-ramp feed assumed.')+t(980,333,'Ework:closeSgate,remove100tip,')+t(980,365,'then erect continuous6250bund/skirt.')+t(980,397,'West650gate/stairs remain for renewal.')+t(980,449,'SWpan:oneextra wetbody, same10covers.')+t(980,481,'Two westernbodyplans330×550 pay')+t(980,513,'25underlap; E35release precedeslift.')+t(980,565,'Raisedlatch option removes50hinge,')+t(980,597,'but parentpost/foot/anchor UNKNOWN.')+t(980,629,'No RCpost or bracket capacity borrowed.');
 s+=t(30,800,'Actual short-inlet reference · K1 /n.04 /deepest TOTAL25% blocked',23);
 const rows=[['Retainedhinge100',o.hydraulicReference.retainedHinge.find(v=>v.lengthMm===100&&v.block==='deepestTotalQuarter'&&v.lipK===0)],['Retainedhinge200',o.hydraulicReference.retainedHinge.find(v=>v.lengthMm===200)],['Raisedlatch100',o.hydraulicReference.hungLatch.find(v=>v.lengthMm===100&&v.block==='deepestTotalQuarter'&&v.lipK===0)],['Raisedlatch200',o.hydraulicReference.hungLatch.find(v=>v.lengthMm===200)]];
 rows.forEach(([name,v],i)=>{s+=t(30,837+i*33,`${name}: ${v.quietCapacityLps.toFixed(4)} L/s; stage${v.requiredStageMm.toFixed(3)}; quietreserve${v.quietReserveMm.toFixed(3)}mm. ${v.passesThisReference?'PositiveREFERENCEsign only':'FAIL'}`);});
 s+=t(30,995,'Hydrostatic virtualcontrol, equivalentsidewalls/blockage and authoredKlocation; actualfreebrink/lateralfeed/rapidflow uncalibrated.');
 s+=t(30,1030,'Not installed bounds or admission. No extra catchment, convenient roughness, quiet-stage relaxation or secondpipe.');
 s+=t(30,1090,'Full blocked pan-water grossbox screen: '+o.loads.totalBoundingFullWaterKg.toFixed(2)+'kg +sheet/coverframes/clamps/handler. No30kg or handlift claim.',20);
 s+=t(30,1125,'Firstmotion:remove neighbour2 +seambridge; E35 frees25underlap with10courtgap, THEN capturedlift aboveguard.');
 s+=t(30,1160,'Real pressure/leak/splash/obstruction, seam movement, actual crew/force/guards/support and full reversal remain unproved.');
 s+=t(30,1215,'N-work temporarychase blockage remains FAIL: Eassembled is not a connected passivebackup to interceptedroof/courtwater.');
 s+=t(30,1250,'Root review before HADadoption /coherentconsumer regeneration. High-eave duties and conditionalsitehandoff remain.',19);
 return s+'</g></svg>\n';
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const o=proposal();for(const[p,text]of[['collector-access-recomposition.json',JSON.stringify(o,null,2)+'\n'],['collector-access-recomposition.svg',render(o)]]){
  const path='project/rwt/studies/'+p;if(process.argv.includes('--check'))assert.equal(fs.readFileSync(path,'utf8'),text);else fs.writeFileSync(path,text);
 }console.log('Unadopted sixwet/southaccess proposal reproduced.');
}
