/** Dimension and water-budget stress only. No scaffold, drain or weather-system approval. */
import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root = new URL('../../../', import.meta.url);
const source = readFileSync(new URL('project/had/studies/open-north-loggia.json', root));
const blob = createHash('sha1').update(`blob ${source.length}\0`).update(source).digest('hex');
if (blob !== '25faad2c4d40df2b7da7212f73808843a88d2f52') throw Error('HAD source moved: review this candidate');
const house = JSON.parse(source);
for (const [path,expected] of [['project/rwt/studies/integrated-neighbour-clearance.json','4e5ba02bf23587e6e2bc2a1f5c85a1a49ff8c909'],['project/rwt/studies/manufacturer-access-comparison.json','8d0998ac04e7492837603a4d938fb0640b69347c'],['project/mat/studies/loggia-roof-edge.json','731c85d24e775259f1cf84d264d4ceaf75d89774']]) { const b=readFileSync(new URL(path,root)); if(createHash('sha1').update(`blob ${b.length}\0`).update(b).digest('hex')!==expected) throw Error(`Source moved: ${path}`); }
if (house.shell !== 12000 || house.roofDevelopment.eavesDatum !== 7100 || house.roofDevelopment.pitch !== 25) throw Error('House geometry moved');
const width=15.4, bay=2.57, bays=7, length=bay*bays, area=width*length, rate=216;
const flow=area*rate/3600, ridge=10050+width*1000/2*Math.tan(18*Math.PI/180);
const secondaryDrip=JSON.parse(readFileSync(new URL('project/mat/studies/loggia-roof-edge.json',root))).weather.secondary.dripZ;
const halfRun=length*1000/2, fall=halfRun/200, sideFlow=flow/2;
const fullPipeVelocity=(sideFlow/1000)/(Math.PI*(0.1/2)**2);
const result={status:'UNADMITTED geometric and rainfall sensitivity; not an operating method',hadBlob:blob,
  assumptions:{coverWidthM:width,bayM:bay,bays,lengthM:length,xMm:[-1700,13700],yMm:[-2995,14995],eaveZmm:10050,pitchDegrees:18,beamHeightMm:750,houseShellMm:house.shell},
  derived:{horizontalAreaM2:area,flowLitresPerSecond:flow,existingLocalEventLitresPerSecond:3.60375,outsideShellProjectionM2:area-144,ridgeZmm:ridge,assumedBeamLowerEnvelopeZmm:9300,sourceHouseRidgeZmm:8090.903773579372,assumedRidgeGapMm:9300-8090.903773579372},
  gantryPlanTrial:{model:'REID PGRS20; two unloaded nominal placements',beamLengthMm:2000,maximumClearSpanMm:1500,sourceRoofOpeningMm:[4450,7550],beamXMm:[[4550,6550],[5450,7450]],frameClearSpanXMm:[[4800,6300],[5700,7200]],boundingYMm:[4886,6044],receiverMm:[4350,7650],numberOfModules:7,minimumEyeAboveDeckMm:1445,minimumBeamTopAboveDeckMm:1776,minimumRollerTopAboveDeckMm:1856,rollerTopAtDeck5540Mm:7396,maxDeckWithRollerBelowSecondaryMm:secondaryDrip-1856,maxEyeWithRollerBelowSecondaryMm:secondaryDrip-1856+1445,receiverLoweredTopMm:6540,eyeGapUnderDripMm:secondaryDrip-1856+1445-6540,firstAndLastCentreMm:[4350+3300/14,7650-3300/14],endModuleMinShiftMm:4800-(4350+3300/14),status:'Plan arithmetic only; clear frame span is not proven hook travel; 100 mm beam edge reservation is not real collision clearance'},
  egressReservation:{sourceFrontDoorCentreXmm:6000,sourceRoughWidthMm:1800,candidateCorridorXmm:[5000,7000],candidateCorridorYmm:[-2995,0],nominalGatePlaneYmm:-2995,idealEqualLeafWidthMm:1000,idealOutwardSweepLimitYmm:-3995,status:'Reservation only: no door, latch, first-motion, grading, fire or safe-destination proof'},
  scaffoldAxisTrial:{sourceStructuralSpanMm:13400,frameWidthMm:730,westernAxesMm:[-1065,-335],easternAxesMm:[12335,13065],bayAxesYMm:Array.from({length:8},(_,i)=>-2995+2570*i),houseToInnerAxisMm:335,projected205mmWingClearanceMm:232.5,onePoint09mFrameWingClearanceMm:52.5},
  gutterTrial:{westXMm:[-1900,-1600],eastXMm:[13600,13900],yMm:[-2995,14995],highInvertZmm:9800,endInvertZmm:9800-fall,topZmm:9950,halfRunMm:halfRun,fallMm:fall,oneEndBlockedMinimumStaticRiseMm:fall,remainingOneSideLitresPerSecond:sideFlow,full100mmPipeIdealVelocityMperS:fullPipeVelocity,outletCentresMm:[[-1750,-2800],[-1750,14800],[13750,-2800],[13750,14800]]},
  limits:['Roof outline is a trial, not authenticated support axes or net sheet dimensions','Seven bays and all bracing, connections, eave extensions and actual height require OEM confirmation','No site boundary, load path, egress or discharge established','Water rates are horizontal uniform-rain sensitivity, not hydraulic sizing']};
const lines=[
 ['Source house','12,000 × 12,000 mm; court 3,500 × 3,500 mm'],
 ['Trial cover','15,400 × 17,990 mm; 7 × 2,570 mm bays'],
 ['Plan margin','1,700 mm sides; 2,995 mm ends, before supports and ties'],
 ['216 mm/h','277.046 m² → 16.62276 L/s; no roof/court double-count'],
 ['Height sensitivity','+10,050 eave; straight-pitch ridge +12,552; not OEM section'],
 ['Support-axis trial','OEM L 13,400; 730 frames: inner axes 335 from house'],
 ['Blocked-end trial','44.975 mm static rise to crest; 8.31138 L/s at remaining outlet'],
 ['Precondition','OEM span, support, hydraulic head, dry-state and site unproved']];
const rect=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" ${c}/>`;
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 1680 1188"><rect width="1680" height="1188" fill="white"/><g font-family="Arial,sans-serif" fill="#20343e"><text x="45" y="52" font-size="29" font-weight="bold">Removable over-roof: bounded geometric and rainfall trial</text><text x="45" y="86" font-size="18">Unadmitted candidate: plan is sheet reservation, not structural axes, scaffold or site boundary</text>${rect(110,140,616,720,'fill="#e5f1f5" stroke="#24578c" stroke-width="3"')}${rect(178,260,480,480,'fill="#fff" stroke="#3c4b50" stroke-width="3"')}${rect(348,430,140,140,'fill="#dbeacb" stroke="#617448" stroke-width="2"')}${[-1065,-335,12335,13065].flatMap(x=>Array.from({length:8},(_,i)=>`<circle cx="${110+(x+1700)*0.04}" cy="${140+i*102.8}" r="4" fill="#be562b"/>`)).join('')}<text x="280" y="242" font-size="20">12 m house</text><text x="351" y="505" font-size="16">court</text><text x="208" y="897" font-size="20">Trial cover: 15.40 × 17.99 m</text><text x="210" y="930" font-size="18">End and side gutter / site route not drawn</text><text x="820" y="160" font-size="22" font-weight="bold">Finite arithmetic; not a joined system</text>${lines.map((a,i)=>`<text x="820" y="${210+i*70}" font-size="19" font-weight="bold">${a[0]}</text><text x="820" y="${238+i*70}" font-size="18">${a[1].replaceAll('&','&amp;')}</text>`).join('')}<text x="45" y="1040" font-size="20">Uncontrolled condensate, side rain, blocked drains and occupied-house protection still require a compatible complete assembly.</text><text x="45" y="1080" font-size="20">No operational, structural, hydraulic, egress or material-policy approval is implied.</text></g></svg>`;
const outputs=[['project/rwt/studies/over-roof-service.json',JSON.stringify(result,null,2)+'\n'],['project/rwt/studies/over-roof-service.svg',svg+'\n']];
for(const [path,contents] of outputs){const url=new URL(path,root);if(process.argv.includes('--check')){if(readFileSync(url,'utf8')!==contents)throw Error(`Stale: ${path}`)}else writeFileSync(url,contents)}
console.log(`Over-roof ${process.argv.includes('--check')?'check':'generated'}: ${area.toFixed(3)} m², ${flow.toFixed(5)} L/s`);
