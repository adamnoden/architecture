/** UNADOPTED finite correction of the 788 side-slot/lap geometry. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readSelected,manningFlow,channelAtFlow} from './selected-water-event.mjs';
const g=9.81,lerp=(a,b,t)=>a+(b-a)*t;
export function canopy(){
 const selected=readSelected(),maintenance=selected.model.model.maintenanceRainReference.northMaintenance;
 const q=selected.model.hydraulicProbe.assignedInwardRoofAndCourtLps;
 const start=7750,end=13550,axis=6800,clear=200,height=150,sheet=1.5,flange=25;
 const invert=y=>lerp(1845,1825,(y-start)/(end-start));
 const roofValley=maintenance.courtRoof.weatherTopEast;
 const stations=[7750,8800,10300,11750,12650,13350,13550].map(y=>{
  const bed=invert(y),crown=bed+height+sheet,foldContactStart=crown-5,foldEnd=foldContactStart-50;
  return {y,invert:bed,bottom:bed-sheet,crown,roofValley,
   hoodTop:roofValley+20,sideSlotX:[[axis-clear/2,axis-clear/2+15],[axis+clear/2-15,axis+clear/2]],
   flashing:{bendRadiusBudget:5,sidewallContactZ:[foldEnd,foldContactStart],verticalContactLength:foldContactStart-foldEnd,
    roofToFoldEnd:roofValley-foldEnd,topAirGap:roofValley-crown,
    returnEndsAbove90Trial:foldEnd-(bed+90),
    definition:'Roof crosses ABOVE the uninterrupted box sidewall; its return follows the INSIDE wall through a15-wide top side-entry slot. The hood covers the centre170, not the side-entry slots. After the5 bend allowance,50 of real vertical wall contact remains. Not a diagonal50 claim or a fixed global sidewall hole.'}};
 });
 const R=200,arcLength=Math.PI*R/2,turnDrop=arcLength*.01,headerStart=1825-turnDrop;
 const turn={centre:[6600,13550],centreRadius:R,insideWetRadius:R-clear/2,grossOuterRadius:R+clear/2+sheet,
  tangentIn:[6800,13550,1825],tangentOut:[6600,13750,headerStart],
  header:[[6600,13750,headerStart],[5000,13750,headerStart-16]],terminal:[5000,13750,-600],direction:'VERTICALLY DOWN'};
 const flow={inwardAndCourtLps:q,loggiaM2:maintenance.loggiaRoof.plan[2]*maintenance.loggiaRoof.plan[3]/1e6,
  loggiaRainLps:216*maintenance.loggiaRoof.plan[2]*maintenance.loggiaRoof.plan[3]/1e6/3600};
 flow.combinedLps=q+flow.loggiaRainLps;
 flow.straightCases=[.015,.02,.025].flatMap(n=>[1,.75,.5].map(remainingWidthFraction=>{
  const width=clear/1000*remainingWidthFraction,normal=channelAtFlow(flow.combinedLps,width,n,20/5800);
  return {n,remainingWidthFraction,uniformDepthMm:normal.depthMm,
   capacityAt90Lps:1000*manningFlow(width,.09,n,20/5800),
   returnEndReserveAtUniformDepthMm:height+sheet-55-normal.depthMm,
   satisfies90Depth:normal.depthMm<=90,
   boundary:'Authored uniform rectangular roughness/effective-width sensitivity; not a calibrated roof-slot, bend or blockage rating.'};
 }));
 flow.headerCleanAt90Lps=1000*manningFlow(.2,.09,.025,.01);
 flow.blockedReceiverCases=[1500,750].map(width=>{
  const head=1000*(flow.combinedLps/1000/(Math.sqrt(g)/(1.5**1.5)*width/1000))**(2/3);
  return {clearSpillWidthMm:width,idealSpillHeadMm:head,waterZ:-700+head,reserveToDeclaredFaultedMaximum:-650-(-700+head),
   reserveBelowActiveTerminal:-600-(-700+head),boundary:'Ideal broad edge energy screen; actual receiving/erosion/terrain remains conditional.'};
 });
 const maximumInputHead=Math.max(maintenance.courtRoof.weatherTopWest,maintenance.loggiaRoof.weatherMaximum);
 flow.terminalImpact={maximumInputHead,waterPlane:-800,dryBedMaximum:-1000,
  waterImpactSpeed:Math.sqrt(2*g*(maximumInputHead+800)/1000),dryImpactSpeed:Math.sqrt(2*g*(maximumInputHead+1000)/1000),
  dryMomentumFluxN:flow.combinedLps*Math.sqrt(2*g*(maximumInputHead+1000)/1000),
  dryPowerW:flow.combinedLps*g*(maximumInputHead+1000)/1000,qualifiedSplash:false};
 const crewLast=stations.find(s=>s.y===12650);
 const volume=clear*height*(end-start+arcLength+1600)/1e6;
 const metalArea=(2*(clear+height)*(end-start+arcLength+1600)+2*flange*(end-start))/1e6;
 return {identity:'RWT-UNADOPTED-NORTH-CANOPY-CORRECTION-2026-11-06',selectedSource:selected.blob,selectedGeometryChanged:false,
  correction:'Only the actual falling chase and side-entry/lap geometry is corrected here. No correction/adoption of the accepted old manual-staff or fast-chute failures.',
  straight:{axisX:axis,y:[start,end],invert:[1845,1825],clear:[clear,height],sheet,flangeEach:flange,
   grossX:[axis-clear/2-sheet-flange,axis+clear/2+sheet+flange],slope:20/5800},
  stations,turn,
  takeoff:{gutter:[7675,7000,2000],closedRoute:[[7675,7000,1920],[7450,7000,1910],[6800,7750,1845]],
   tubeInsideDiameter:125,expansionTo:[200,150],flowBeforeLoggiaLps:q,
   boundary:'Complete closed court/NW route precedes N isolation; no open2m jet into E well. Actual turn/fitting/entry losses and support remain unqualified.'},
  hood:{centreWidth:170,sideTopSlotEach:15,moduleMaximumLength:1000,saddle:[100,20,40],
   removal:'Captured top clamps and100 saddle/20butt/40laps open from ABOVE before a segment lifts. Roof returns leave before chase separation. No horizontal withdrawal through a folded sheet is assumed.'},
  supports:{frameAxesY:[8800,10300,11750,13350],bypass:{stubAxesX:[6600,7000],stubWidth:40,member:[80,40,4],underside:2056.5,capTop:2138,
   minimumHorizontalGapToGrossFlange:6673.5-6620,minimumVerticalGapAboveHood:2056.5-(roofValley+20),tieUnderside:2175,tieReserve:37},
   addedNorthPost:{axis:[7000,13350],postPlan:100,footPlan:250,bodyZ:[0,2138],
    chaseToPostFaceGap:6950-(axis+clear/2+sheet),
    headerCantilever:[[7000,13350],[5000,13750]],cantileverLength:Math.hypot(2000,400)},
   saddle:'Side-edge saddles only; NO hanging fastener or seat below the1.5mm box bottom. Changed200×150 section,1000pitch, bypasses and cantilever need actual STR reactions/anchorage.'},
  crew:{heightProxy:1800,lastY:12650,minimumWallWithinCrewBand:crewLast.bottom,nominalReserve:crewLast.bottom-1800,
   phase:'Retain short-before-long phase until full crew/tool/module swept envelopes and erection/reversal are earned. A26.6mm nominal straight-wall reserve alone does not remove it.'},
  loads:{fullBlockedPrismaticWaterKg:volume,straightAndHeaderSheetOnlyKg:metalArea*.0015*7850,
   exclusions:'Sheet-only excludes hood overlaps, clamps, brackets, takeoff, vertical tail, posts and frame. Their previous≈1tonne temporary-works comparator is not erased. Water mass is closed-box maximum, not just uniform-flow content.'},
  flow,
  receiver:{source:'project/rwt/studies/selected-receiving-interface.json',bounds:[4250,13450,1500,1700],ordinaryMaximum:-800,bedMaximum:-1000,
   terminalNearEdgeReserve:13750-clear/2-13450,siteAccepted:false},
  phaseMatrix:[
   {state:'ORDINARY',courtDestination:'N or E',chase:false,requiredDutyLps:q},
   {state:'E OPEN',courtDestination:'N',chase:false,requiredDutyLps:q,roof:'Retained separate E weather enclosure/gutter/downpipe; no transfer of N-work chase roof.'},
   {state:'N SHORT OPEN',courtDestination:'North receiver through new court takeoff/chase',chase:true,loggiaRoof:false,requiredDutyLps:q,
    admission:'UNADOPTED: erect/test all closed north drainage first; retain old sequence until actual short-crew roof/tool clearance is proved.'},
   {state:'N LONG OPEN',courtDestination:'North receiver through new court takeoff plus loggia chase',chase:true,loggiaRoof:true,requiredDutyLps:flow.combinedLps,
    admission:'UNADOPTED: revised combined receiver/entry/turn/impact and actual crew/support/weather checks required; E stays assembled independently.'}
  ],
  accepted:false,qualifiedMaterial:false,physicalWeatherAccepted:false,qualifiedFirstHarm:null,
  remaining:['Actual125ID court takeoff, two plan turns, entry slot distribution and terminal impact are not uniform-flow sections.',
   'At n.025 and25%effective width lost, the90mm trial FAILS; do not delete this adverse case or assume a clean temporary drain.',
   'Retain actual roofs/closed laps, guard access, fixed supports and short/long phased erection. Canopy geometry alone does not complete high-eave cleaning or receiver renewal.',
   'The outer roof source domain144.15m2 is not assigned inward47.8125 plus court12.25=60.0625m2; neither source is silently expanded by this proposal.']};
}
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
export function renderCanopy(o){
 const t=(x,y,s,n=18)=>`<text x="${x}" y="${y}" font-size="${n}">${esc(s)}</text>`;
 let s='<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1050" viewBox="0 0 1600 1050"><rect width="100%" height="100%" fill="#fbfaf5"/><g font-family="sans-serif" fill="#263b42">';
 s+=t(30,35,'UNADOPTED · falling north chase / real50mm vertical lap',27)+t(30,65,'Corrected geometry; preserved old hydraulic/operator failures and all material/physical/site holds.');
 const X=x=>60+(x-4250)*.15,Y=y=>760-(y-7750)*.09;
 s+=`<rect x="${X(4800)}" y="${Y(13550)}" width="360" height="522" fill="#e7e6d7" stroke="#77827b"/><rect x="${X(4250)}" y="${Y(15150)}" width="225" height="153" fill="#add0be" stroke="#567967"/>`;
 const arc=Array.from({length:25},(_,i)=>{const a=i*Math.PI/48;return[6600+200*Math.cos(a),13550+200*Math.sin(a)];});
 const route=[[6800,7750],...arc,...o.turn.header];
 s+=`<polyline points="${route.map(p=>`${X(p[0])},${Y(p[1])}`).join(' ')}" fill="none" stroke="#327e94" stroke-width="15"/>`;
 for(const y of o.supports.frameAxesY)s+=`<path d="M${X(6600)} ${Y(y)} H${X(7000)}" stroke="#996d4e" stroke-width="7"/>`;
 s+=t(35,805,'200×150 clear; invert1845→1825; actualR200 turn to y13750.')+t(35,835,'Header falls to1805.86; vertical terminal5000/13750/−600.')+t(35,865,'N receiver4.43895L/s; no2m jet into E well.')+t(35,895,'Full blocked water + sheet loads are exposed; no temporary-work admission.');
 const a=o.stations[0],b=o.stations.at(-1),cx=x=>780+(x-6600)*.65,cz=z=>480-(z-1800)*1.1;
 for(const[v,j]of [[a,0],[b,1]]){
  const ox=j*390,xx=x=>cx(x)+ox;
  s+=t(760+ox,125,`SECTION y${v.y}`,21);
  s+=`<rect x="${xx(6698.5)}" y="${cz(v.crown)}" width="${203*.65}" height="${153*1.1}" fill="#c4dfe9" stroke="#26768b" stroke-width="2"/>`;
  s+=`<path d="M${xx(6600)} ${cz(v.roofValley)} H${xx(6701.5)} V${cz(v.flashing.sidewallContactZ[0])} M${xx(7000)} ${cz(v.roofValley)} H${xx(6898.5)} V${cz(v.flashing.sidewallContactZ[0])}" fill="none" stroke="#a6713b" stroke-width="4"/>`;
  s+=`<path d="M${xx(6715)} ${cz(v.hoodTop)} H${xx(6885)} M${xx(6700)} ${cz(v.invert+90)} H${xx(6900)}" stroke="#496a76" stroke-width="3" stroke-dasharray="5 4"/>`;
  s+=t(760+ox,535,`Crown${v.crown.toFixed(1)}; roof${v.roofValley}.`)+t(760+ox,565,`Return${v.flashing.roofToFoldEnd.toFixed(1)} long;50contact.`)+t(760+ox,595,'After5bend, wall contact remains50.');
 }
 s+=t(760,655,'Roof is above actual falling crown at EVERY station.',22)+t(760,690,'15mm TOP SIDE slots flank170mm removable hood.')+t(760,725,'No global2030 slot through nonexistent sidewall.')+t(760,760,'Crossover cap2138; tie2175:37mm nominal reserve.')+t(760,795,`Crew-band bottom${o.crew.minimumWallWithinCrewBand.toFixed(1)}; reserve${o.crew.nominalReserve.toFixed(1)} over1800.`);
 s+=t(760,855,'n=.025 /90deep:5.535L/s clean;25%width loss FAILS.',20)+t(760,890,'Full loss/entry/turn, blocked mass, weather and actual access remain open.');
 s+=t(35,935,'Court takeoff7675/7000→6800/7750 stays CLOSED below the actual roof.')+t(30,1010,'Reference proposal only. Quiet−35 / geometric crest+15 / selected HAD and actual source catchments remain unchanged.',20);
 return s+'</g></svg>\n';
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const o=canopy();for(const [p,v]of [['north-canopy-correction.json',JSON.stringify(o,null,2)+'\n'],['north-canopy-correction.svg',renderCanopy(o)]]){
  const path='project/rwt/studies/'+p;if(process.argv.includes('--check'))assert.equal(fs.readFileSync(path,'utf8'),v);else fs.writeFileSync(path,v);
 }
 console.log('Unadopted actual north canopy correction reproduced.');
}
