/** ONE reuse comparison: existing temporary court and loggia pipes, two actual destinations. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readSelected} from './selected-water-event.mjs';
const g=9.81;
export function twoPath(){
 const s=readSelected(),n=s.model.model.maintenanceRainReference.northMaintenance;
 const court=n.courtRoof.pipe,loggia=n.loggiaRoof.pipe,q=s.model.hydraulicProbe.assignedInwardRoofAndCourtLps;
 assert.deepEqual(court.temporaryPipeCover.clearHole,[7370,6920,160,160]);
 assert.deepEqual(court.temporaryPipeCover.pipeCentre,[7450,7000]);
 assert.equal(loggia.axisX,6800);assert.equal(n.loggiaRoof.pipeExclusion.operatorMaximumX,6650);
 const pipe={OD:133,wall:1.5,nominalID:130,minimumBore:128.65,maximumOutside:133.9,
  product:'Lawton TableX hard copper; stacked .2mean/.7ovality and15%wall sensitivity, not delivered certification',
  primarySource:'https://lawtontubes.co.uk/wp-content/uploads/2022/02/Plumbing-Tube-Working-Pressures-Data-Sheet.pdf'};
 const offset=225,a=120,Za=85,betweenVertices=offset*Math.SQRT2,portDrop=offset+2*a;
 const volumePerM=1000*Math.PI*(pipe.nominalID/1000)**2/4;
 const metalPerM=8960*Math.PI*((pipe.OD/1000)**2-(pipe.nominalID/1000)**2)/4;
 const loggiaQ=216*n.loggiaRoof.plan[2]*n.loggiaRoof.plan[3]/1e6/3600;
 const freeWeir=(flow,width)=>1000*(flow/1000/(Math.sqrt(g)/2**1.5*width/1000*.75))**(2/3);
 const longPipe={axisX:6800,insideInvertSouth:1620,insideInvertNorth:1680,y:[7750,13700],
  fallSouth:60,length:5950,axisSouth:1685,axisNorth:1745,
  southOutsideCrown:1685+pipe.maximumOutside/2,northOutsideCrown:1745+pipe.maximumOutside/2,
  primaryChaseUndersideSouth:1843.5,primaryChaseUndersideNorth:1823.5,
  crewBodyMaximumX:6650,lateralReserve:6800-pipe.maximumOutside/2-6650,
  normalStandingHeadPass:false,
  sequence:'Retain short-before-long. Lastshort crew6875/8100 uses this band BEFORE pipe installation; long crew/body stays wholly west of6650. Do not replace body maximum with centreline. Reverse sequence before shortmodule return.',
  sourceChange:'Existing loggia125 pipe falls NORTH1700→1640. Regrade this same component territory to SOUTH1680→1620; reconnect south end to existing court E drop. A falling line is not its actual elbows/joints/entry/support proof.'};
 longPipe.minimumStraightGapBelowPrimary=Math.min(longPipe.primaryChaseUndersideSouth-longPipe.southOutsideCrown,longPipe.primaryChaseUndersideNorth-longPipe.northOutsideCrown);
 const hydraulics=[1,.75,.5].map(f=>{
  const d=pipe.minimumBore/1000*f,capacity=1000*Math.PI*d*d/4*(d/4)**(2/3)*Math.sqrt(60/5950)/.025;
  return {remainingDiameterFraction:f,fullUniformCapacityLps:capacity,loggiaOnlyDutyLps:loggiaQ,passesLoggiaOnlyScreen:capacity>=loggiaQ,
   boundary:'n.025 full circular uniform comparison. .75/.5 are equivalent DIAMETER losses, not actual debris or a calibrated allowance. No priming, inlet, air, bend, slope tolerance or installed blockage pass.'};
 });
 return {identity:'RWT-UNADOPTED-TEMPORARY-TWO-PATH-CONTROL-2026-11-06',
  source:{path:s.path,blob:s.blob,authority:s.authority,canonicalMain:s.canonicalMain,canonicalMainHadBlob:s.canonicalMainHadBlob},
  selectedGeometryChanged:false,accepted:false,physicalWeatherAccepted:false,qualifiedFirstHarm:null,
  recommendation:'Reuse the existing court E drop and regrade the existing loggia pipe towardE alongside the north chase. Develop actual passive entries before adding another system. This comparison does NOT close the current canopy blockage failure.',
  existing:{court,loggia,operatorExclusion:n.loggiaRoof.pipeExclusion,phaseControls:n.phaseControls},pipe,
  actualCourtPassage:{hole:court.temporaryPipeCover.clearHole,axis:[7450,7000],nominalRadialReserve:(160-pipe.maximumOutside)/2,
   rejected159RadialReserve:(160-159.9)/2,qualifiedFlashing:false,
   coverRule:'Replace ONE notchedsame-support305×550cartridge BEFORE N release while N remains intact. Courtclosed, no person on this cartridge; pipe/aperture/clamps/seal supported independently of removable wetpan. Restore ordinarypanel before reopening court.'},
  offset:{oldHorizontalOffset:offset,oldGutterDrop:300,twoActual90PortLegs:506,oldTwo90Fit:false,
   two45:{product:'Endex N21/89711 133; current139×139×300,2.73kg each; brochurea120/Za85/35socket, BRAZING ONLY',
    sources:['https://aalberts-ips.co.uk/products/item/89711/','https://aalberts-ips.co.uk/wp-content/uploads/2022/07/09969088_56035915_ENDEX_Brochure_2017.pdf'],
    a,Za,engagement:a-Za,betweenVertices,betweenPortFaces:betweenVertices-2*a,connectingTubeCut:betweenVertices-2*Za,
    requiredPortDrop:portDrop,additionalDropAgainstOld300:portDrop-300,
    candidatePorts:[[7675,7000,1850],[7675,7000,1730],[7450,7000,1505],[7450,7000,1385]],
    terminal:[7450,7000,-80],tailStraight:1465,
    limitation:'Port coordinates are a finite 45offset comparator. Actual fabricated fitting orientation, tolerances, installation/removal, support, joints and entry/vent remain unqualified. No253mm90 stuffed into a225mm offset.'}},
  courtCollectorRewind:{oldGutterInvert:2000,weatherLowEdge:2001.5,oldAvailableHead:1.5,
   proposedGutterWidth:150,proposedInvertAtOutlet:1850,proposedLongitudinalGrade:.015,
   proposedBedEnds:[1891.25,1860.425],proposedCollector:[7550,6875,250,250],collectorFloor:1850,collectorTop:2001.5,
   canopyEastEdge:7750,proposedCollectorEast:7800,extraTemporaryProjection:50,
   EPrimary:'Existing courtpipe, reformed as actual 133 tube/two45offset; enclosed terminal remains7450/7000/−80 inside easttailwetbody.',
   NAlternate:{weirCrest:1900,clearWidth:200,K1Remaining75IdealHead:freeWeir(q,200),idealStage:1900+freeWeir(q,200),
    interpretation:'Finite ideal critical/weir energy screen only. Backwater from actual north transfer can drown this weir. Actual bank/lap, branch geometry and source air entry are NOT earned.'},
   actualNewBranchAndSupportQualified:false,
   price:'Lower the actual gutter150, author both collector outlets/vent and actual support/roof ties rather than borrowing old2000invert.250body projects50 past temporary roof east; clashes with every real rail/roof support, full water mass and erection/reversal must be located. House footprint/catchment is unchanged.'},
  northOverflow:{location:'ONE south end chamber at6800/7550..7750 outside the north flowing straight; not four sidefunnels',
   crest:1935,clearWidth:200,loggiaOnlyDutyLps:loggiaQ,K1Remaining75IdealHead:freeWeir(loggiaQ,200),
   idealStage:1935+freeWeir(loggiaQ,200),roofValley:2001.5,
   actualChamberOutletAndJunctionQualified:false,
   limitation:'Water from a blocked NORTH outlet must have continuous access back along the200×150chase to this high weir, then drop into the regradedloggia pipe. No upstand is silently placed inside its200normal section. A local chase debris dam or shared roofslot obstruction can isolate flow from both paths. Actual side chamber/closedjunction, roof laps under backwater, entry/air and short crew sweep remain unproved.'},
  longPipe,hydraulics,
  loads:{loggiaStraightDryKg:metalPerM*5.95,loggiaStraightFullWaterKg:volumePerM*5.95,
   courtLowerTailStraightDryKg:metalPerM*1.465,courtLowerTailFullWaterKg:volumePerM*1.465,two45DryKg:5.46,
   exclusions:'Add actual top/bottom adaptors, interpipejunction, overflowchamber, north collector/hood, sockets, couplings, clamps, supports, temporary roof and both outletblocked masses. No nominal125pipe or oldtemporaryframe budget is a full bill.'},
  pressure:{localRoofWaterHead:2051.5,terminal:-80,staticRoofToTerminalMm:2131.5,
   undissipatedHouseRoofHead:7100,undissipatedRoofToTerminalMm:7180,
   firstWet:'−80terminal is100 above easttailfloor−180 inside the newly coveredcollector, not a2m openwelljet. That100 does NOT prove impact/air/vent/cover pressure or harmless first leak. Closedbranch/cover/collar must be rated against actual head; no PN16label transfer.',
   ventAndRoddingQualified:false},
  states:[
   {state:'ORDINARY/E OPEN',status:'No newtemporary credit',rule:'Retain ordinaryN/E routes; Ework separateweathertopology. Restore plaincartridge before ordinarycourtaccess.'},
   {state:'N SHORT OPEN',courtPrimary:'E existingtemporarydrop',courtAlternate:'N chase toNreceiver',loggiaRain:false,admission:false,rule:'Eassembled/closed/tested before N release; directcourt Efeed must actually exist. Longpipe absent for actual short crew.'},
   {state:'N LONG OPEN',courtPrimary:'E existingtemporarydrop',courtAlternate:'N chase',loggiaPrimary:'N chase',loggiaAlternate:'regradedexisting loggia pipe→court Edownpipe',combinedEBackupDutyLps:q+loggiaQ,admission:false},
   {state:'E pipeblocked',survivingCandidate:'Court+loggia4.43895 viaN chase',admission:false,remaining:'ActualNentry/turn and25%width adverse90depthFAIL remain; Eblock does not erase them.'},
   {state:'N outletblocked',survivingCandidate:'Court3.60375 directE plusloggia0.8352 viahigh weir/regradedpipe→E',admission:false},
   {state:'Sharedcapture/chasedam, both outfalls high, or bothbranches blocked',status:'FAIL / no harmless passive destination earned',admission:false}
  ],
  exits:['Actual independent primary/alternate mouths and passive split/vent, full court/loggia source capture and both onebranchfaults must be modelled at the real roof/floor/lap sections.',
   'Regradedloggia pipe minimum straight gap is small; socket OD/sag/fitting/drop and actual northheader/roofsupports must fit without borrowing standing head or changing controlledcrew.',
   'Keep two receivingterritories conditional and firstsusceptible null; no forecast, repairresponse, sump, pump or favourable dissipation replaces a missing path.']};
}
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
export function renderTwoPath(o){
 const t=(x,y,s,n=18)=>`<text x="${x}" y="${y}" font-size="${n}">${esc(s)}</text>`;
 let s='<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="1000" viewBox="0 0 1500 1000"><rect width="100%" height="100%" fill="#fbfaf5"/><g font-family="sans-serif" fill="#263b42">';
 s+=t(30,38,'UNADOPTED · reuse existing TWO temporary pipes / actual passive entries',27)+t(30,73,'Eremainingassembled is not a waterconnection. Both onebranchfaults still need physical proof.');
 const Y=y=>680-(y-7000)*.07,X=x=>50+(x-4250)*.12;
 s+=`<rect x="${X(4250)}" y="${Y(7750)}" width="420" height="241.5" fill="#eee8d7" stroke="#889387"/><rect x="${X(4800)}" y="${Y(13550)}" width="288" height="406" fill="#e0eadc" stroke="#889387"/>`;
 s+=`<polyline points="${X(7675)},${Y(7000)} ${X(6800)},${Y(7750)} ${X(6800)},${Y(13550)} ${X(6600)},${Y(13750)} ${X(5000)},${Y(13750)}" fill="none" stroke="#327e94" stroke-width="10"/>`;
 s+=`<path d="M${X(6800)} ${Y(13700)} V${Y(7750)} L${X(7450)} ${Y(7000)}" fill="none" stroke="#bb7a38" stroke-width="5" stroke-dasharray="10 6"/>`;
 s+=`<circle cx="${X(7450)}" cy="${Y(7000)}" r="12" fill="#bb7a38"/><rect x="${X(4250)}" y="${Y(15150)}" width="180" height="119" fill="#acd3bf" stroke="#496f60"/>`;
 s+=t(35,770,'Blue: north chase to N. Amber: reused loggia pipe falls SOUTH.',16)+t(35,805,'South end joins the existing E drop; actual junction unresolved.',16)+t(35,840,'Short crew first; long crew body stays west of X6650.',16);
 const xx=y=>780+(y-7750)*.095,zz=z=>570-(z-1600)*.7;
 s+=t(750,135,'LONGITUDINAL STACK AT X6800',22);
 s+=`<path d="M${xx(7750)} ${zz(1843.5)} L${xx(13550)} ${zz(1823.5)}" stroke="#327e94" stroke-width="5"/><path d="M${xx(7750)} ${zz(1751.95)} L${xx(13700)} ${zz(1811.95)} L${xx(13700)} ${zz(1678.05)} L${xx(7750)} ${zz(1618.05)} Z" fill="#e8ccb0" stroke="#bb7a38" stroke-width="2"/>`;
 s+=t(750,635,`New pipe inside invert1620S→1680N; fallsS60/5950.`)+t(750,670,`Straight gap belowN chase≥${o.longPipe.minimumStraightGapBelowPrimary.toFixed(2)}; fittings/sag not earned.`)+t(750,705,'ONE southhigh weir1935: loggia0.8352→ideal1964.35.')+t(750,740,'CourtNalternatecrest1900→ideal1977.79; realbackwater unknown.')+t(750,775,'Oldgutter2000→roof2001.5 gives only 1.5 head: lower actualgutter.')+t(750,810,'133.9maxOD /160hole:13.05 each;159.9 leaves0.05 FAIL.')+t(750,845,'Twoactual45s buy465 vertical; old300drop is165 short.');
 s+=t(30,915,'No actual entry/junction/vent/support/roof lap or first leak admission.50%equivalentdiameter loggia pipe0.83165 <0.8352 FAIL.',20)+t(30,960,'SelectedHAD unchanged. This finite reuse direction preserves canopyblocked failures; it does not manufacture an installed two-path pass.',19);
 return s+'</g></svg>\n';
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const o=twoPath();for(const[p,v]of [['temporary-two-path-control.json',JSON.stringify(o,null,2)+'\n'],['temporary-two-path-control.svg',renderTwoPath(o)]]){
  const path='project/rwt/studies/'+p;if(process.argv.includes('--check'))assert.equal(fs.readFileSync(path,'utf8'),v);else fs.writeFileSync(path,v);
 }console.log('Unadopted existingpipe two-path comparison reproduced.');
}
