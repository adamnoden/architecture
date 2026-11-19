/** ONE conventional ground vacuum control; reach is not receiver-renewal admission. */
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readSelected} from './selected-water-event.mjs';
const edgePath='project/mat/studies/loggia-roof-edge.json',edgeBlob='731c85d24e775259f1cf84d264d4ceaf75d89774';
export function groundService(){
 const s=readSelected(),raw=fs.readFileSync(edgePath,'utf8'),blob=crypto.createHash('sha1').update(`blob ${Buffer.byteLength(raw)}\0`).update(raw).digest('hex');
 assert.equal(blob,edgeBlob,'Actual ordinary-eave two-layer/sweep source changed');
 const edge=JSON.parse(raw),gutter=edge.weather.gutter;
 assert.deepEqual(gutter.planQ,[-370,-170]);assert.equal(gutter.bottom,6730);
 const trialFloor=-25,hand=[5900,5500,trialFloor+1200],head=[5900,4750,7090],length=Math.hypot(head[1]-hand[1],head[2]-hand[2]);
 const nominalPoleLength=6000,currentPoleKg=.316,poles=4;
 const setup=[4750,5950,640,590],operator=[5900,5500],R=300;
 const machineKg=24,drumL=72;
 return {identity:'RWT-UNADOPTED-GROUND-HIGH-EAVE-CONTROL-2026-11-06',
  source:{path:s.path,blob:s.blob,authority:s.authority,canonicalMain:s.canonicalMain,canonicalMainHadBlob:s.canonicalMainHadBlob,
   ordinaryEavePath:edgePath,ordinaryEaveBlob:blob,ordinaryEaveRole:'Unadopted MAT ordinaryface edge transferred adversely to SOUTHcourt wallY4250. Not an approved courtgutter, assignedcatchment or actual operational toolfit.'},
  accepted:false,selectedGeometryChanged:false,quietAccepted:false,physicalHandlingAccepted:false,qualifiedFirstHarm:null,
  recommendation:'Use one electric ground vacuum/camera control for ordinaryvisiblegutter inspection/clearing if actual neck/tool and handling earn it. Do not default everycleaningtask to a personlift. Receiver release/deeprepair remains separate and prohibited without live two-layer weather and actual supported access/lifting.',
  machine:{identity:'skyVac Commercial75Plus / CommercialPlus with Elite6pole9m package; no petrolgenerator selected',
   source:'https://skyvac.com/product/skyvac-commercial-75-plus/',reviewed:'2026-11-06',powerW:3300,voltage:240,
   nominalPowerDivVoltageA:3300/240,listedDryKg:machineKg,listedDrumLitres:drumL,listedBody:[590,640,1050],
   listedNoiseDb:76,noiseMeasurementDistanceAndMetric:null,
   poles:{packageLength:9000,assembledStraightNominalLength:nominalPoleLength,assembledPoles:poles,eachLength:1500,OD:50,
    currentListedKgEach:currentPoleKg,straightPoleSubtotalKg:poles*currentPoleKg,
    source:'https://skyvac.com/product/elite-pole-set/',
    historical280gBrochure:'Preserve difference: older primaryInterceptor brochure says280g. Current machine/pole pages say316g. Do not use280g or hybrid350g for this delivered kit. Vacrelease/clamps/neck/end tool/camera/hose and joint overlap are additional/unverified.'},
   neck:{identity:'Elite135hairpin',source:'https://skyvac.com/product/skyvac-elite-hairpin-neck-135-tool-holder/',
    listedEnvelope:[300,240,60],angle:135,actualCentrelineAndToolTip:null,
    limitation:'300×240×60 is a full productbox, not centreline radius, hookreach, insertionstroke or automatic200gutterfit. Bind its CAD/actual end tool in the roofsection before operational admission.'},
   hoseLength:7500,camera:'Manufacturer optional VacCam/SurveyCam; actual model/mass/view/light/mount and droppedpartretention still unbound.',
   massAndPower:'72Lwater alone adds72kg to24dry=96kg before wet debris/poles/hoses. Actual filllimit/float/filter/tipping/support and motorstarting/circuit/lead/RCD/wetconnection need actual instructions.3300/240=13.75A is a nominal arithmetic warning, not a13Aextension approval.',
   material:'Removable maintenanceequipment contains carbonfibre/resin/plastic/rubber/electricalcomponents. No permanent installedmaterial exception or residue admission is implied.'},
  geometry:{court:[4250,4250,3500,3500],ordinaryEaveDatum:7100,
   primaryHem:{y:4450,z:edge.geometry.edgeWeather},secondaryDrip:{y:4470,z:edge.weather.secondary.dripZ},
   sharedReceiver:{y:[4420,4620],bottom:6730,front:6840,back:6880},
   protectedPrimarySecondary:'Bothdistinctroofexits discharge into the SAMEvisiblegutter. Groundvacuum can target that sharedgutter without opening either rooflayer. Clearing concealed secondarychannels/mesh or roof water above this receiver is NOT inferred.',
   trialHand:hand,trialNeckTop:head,handHeightAboveTrialFloor:1200,trialFloor,
   requiredStraightLine:length,nominalSixMetreReserve:nominalPoleLength-length,
   upperTrialIsNotTip:'7090 is a trial topneck reservation above the7006.738hem; end tool must still descend inside6730gutter past6840frontcrest without touching either drip or roof. No endpoint chosen here proves that compound motion.',
   nominalPoleSubtotalKg:poles*currentPoleKg,minimumPoleOnlyHorizontalGravityMomentNm:poles*currentPoleKg*9.81*Math.abs(head[1]-hand[1])/2000,
   forceLimit:'Poleonly rigidstraight/uniformgravity moment about lowerhand; excludes neck/camera/hose/debris, two hand spacing, flex, insertion, suctionrelease/drag, wind and wholecrew. It is NOT an allowable force or humanhandling pass.',
   nominalNeckTopReserveAbovePrimary:head[2]-edge.geometry.edgeWeather,
   machineSetup:setup,operatorCentre:operator,operatorRadius:R,machineToOperatorWestGap:operator[0]-R-(setup[0]+setup[2]),
   northClearStripFromSetUp:7000-(setup[1]+setup[3]),
   ordinaryBodySouthOfWell:6300-(operator[1]+R),
   positionRule:'Trialfloor−25at5500 linearly interpolates the historicalMATcourt0at4250→−30at5750; actualfloor/handheight must be bound before deployment. No4%northinletgrade is extrapolated south through this different landing. BodyR300 at5900/5500 is south of actual eastwellY6300; apparatus stayssouthof7000. Hose/power route and approach retain controlleddryaccess and both livewaterdestinations.',
   delivery:'590×640 body can enter finished2400portal in plan; full1050height, actualcastors/handles/lead/hose route, threshold/ramp/cover loading and wheeled delivery remain unproved. Do not borrow an AWP jack/bridgepass.',
   independentSupport:false},
  tasks:[
   {task:'Ordinaryinspection / looseleaf/siltclearing',candidate:'Groundvacuum + camera; keep roof layers/receiver and both groundroutes intact',status:'CONDITIONAL / actual neck, view, force, noise/power and debris route unqualified'},
   {task:'Stubborn adheredblockage / guard or concealedsecondary repair',candidate:'Stopgroundtool before damagingdrips; actual protectedaccess intervention needed',status:'NOT earned by nominalreach; no force scraping or blindpuncture'},
   {task:'Rare receiver release/renewal',candidate:'Actual supportedworkdeck plus independentcradle/hoist and upstream primary + secondary interception',status:'FAIL / no joined liveweather/access/lifting route earned',
    retainedFailure:'Old6990cup misses secondary6913.887, overlapsgutter/down150/out400sweep. Groundvacuum does NOT fix it; receiver bolts remain closed.'},
   {task:'Major rooflayer/supportrepair',candidate:'Conventional scaffold/protecteddeck and independently drainingtemporaryweather only if actual wholeassembly fits',status:'UNADOPTED / no inherited overroof, AWP or q250pass',
    finiteExit:'One supported access/hoist section against primary7006.738, secondary6913.887, guttersweepY4420..5020/Z6580..6880 and actualcourt/door/egress; choose permanentcomponent/accessrevision if this cannot be earned. Do not expand another equipmentcatalogue.'}
  ],
  sequence:['Inspect bothroofexits/sharedgutter and downstreamN/E routes fromgroundcamera; keep doors/dropzone controlled and no canopy blocking pole approach.',
   'Bring/park actualvacuum on supportedclosedcourt southofinlet; locate power/hose outside accessibleexit and waterpaths. Assemble only requiredpoles and verify neck/camera retention fromground.',
   'Raise tool under controlledfull sweep, view actual tip/gutter, clear accessible debris while receiver stays live; use actual suctionrelease before overload rather than pulling fixed parts.',
   'Lower/capture waste and inspect both layerdrips/gutter/outlet; retain both passivegroundroutes. Clear apparatus/power/hoses and restore access.',
   'If actualtip/guard/power/noise/handling fails, stopgroundoperation. No receiverdisconnection or roofopening is authorised by this trial.'],
  remains:['Actual southcollector/profile, concentrated jets and assignedlocalroofsource; currentMATedge remains only an adverse reference.',
   'Actual toolpath/centreline, clearance to both drips/guard/mesh and loaded full sweep; power/quiet/material/debris disposal and wet court/occupant separation.',
   'Rare receiver and major repair must have their own constructive liveweather/lift/crew/reversal exit. An ordinaryclearingcontrol cannot substitute for them.']};
}
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
export function renderGround(o){
 const t=(x,y,s,n=18)=>`<text x="${x}" y="${y}" font-size="${n}">${esc(s)}</text>`;
 let s='<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="1000" viewBox="0 0 1500 1000"><rect width="100%" height="100%" fill="#fbfaf5"/><g font-family="sans-serif" fill="#263b42">';
 s+=t(30,38,'UNADOPTED · ONE electric ground vacuum / high-eave task split',27)+t(30,75,'Ordinaryclearing may use groundtools. Receiver release and major repair still lack liveweather/access/lifting.');
 const X=y=>70+(y-4250)*.23,Z=z=>820-z*.095;
 s+=`<path d="M${X(4250)} ${Z(7100)} L${X(4450)} ${Z(o.geometry.primaryHem.z)}" fill="none" stroke="#9c7b59" stroke-width="8"/>`;
 s+=`<path d="M${X(4470)} ${Z(o.geometry.secondaryDrip.z)} H${X(4440)}" stroke="#617a99" stroke-width="5"/><path d="M${X(4420)} ${Z(6880)} V${Z(6730)} H${X(4620)} V${Z(6840)}" fill="none" stroke="#557c80" stroke-width="5"/>`;
 s+=`<path d="M${X(5500)} ${Z(o.geometry.trialHand[2])} L${X(4750)} ${Z(7090)}" stroke="#31839a" stroke-width="10"/><rect x="${X(4450)}" y="${Z(7090)}" width="${300*.23}" height="${300*.095}" fill="#f0dcaa" stroke="#bd8b37" stroke-dasharray="6 4"/>`;
 s+=`<circle cx="${X(5500)}" cy="${Z(1700)}" r="14" fill="#7b8f7e"/><path d="M${X(5500)} ${Z(1550)} V${Z(100)}" stroke="#7b8f7e" stroke-width="20"/>`;
 s+=t(60,900,`Trialhand1175 / necktop7090: ${o.geometry.requiredStraightLine.toFixed(1)} vs6000nominal.`)+t(60,935,'Dashedheadbox is a reservation, NOT actual 135 neck/tipmotion.');
 s+=t(740,150,'ACTUAL CURRENT PRODUCT / ONE CONTROL',22)+t(740,195,'Commercial75Plus:24kg /590×640×1050 /72L /3300W.')+t(740,235,'6pole9m package; trial4×1.5m /50OD /316g each.')+t(740,275,'135hairpin productbox300×240×60; CAD/tip unbound.')+t(740,315,'Listed76dB has no distance/metric: quiet is unaccepted.')+t(740,355,'Nominal13.75A; no assumed13Alead or wetpower pass.')+t(740,420,'PRIMARY7006.738 / SECONDARY6913.887',21)+t(740,460,'Sharedgutter6730..6880 stays intact for ordinaryclearing.')+t(740,500,'Tool must enter past6840front without touching eitherdrip.')+t(740,540,'Camera/neck/hoses/wet debris/loadedforces remain actual exits.')+t(740,615,'RECEIVER RELEASE / MAJOR REPAIR',22)+t(740,655,'Oldcup6990 misses secondary by76.113: failure preserved.')+t(740,695,'Actual down150 / out400 sweep remains needed.')+t(740,735,'Groundreach is NOT a scaffold, worker position or hoist.')+t(740,775,'No inherited AWP, optional over-roof or q250adoption.')+t(740,850,'Selected7100datum; futureSTRroofrise is separate.',19);
 return s+'</g></svg>\n';
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const o=groundService();for(const[p,v]of [['ground-high-eave-control.json',JSON.stringify(o,null,2)+'\n'],['ground-high-eave-control.svg',renderGround(o)]]){
  const path='project/rwt/studies/'+p;if(process.argv.includes('--check'))assert.equal(fs.readFileSync(path,'utf8'),v);else fs.writeFileSync(path,v);
 }console.log('Unadopted ground high-eave control reproduced.');
}
