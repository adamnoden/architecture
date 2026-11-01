/** Principal B wetroom: connected design trial, not product/physical admission. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../../../',import.meta.url),out=new URL('./',import.meta.url);
const assert=(p,m)=>{if(!p)throw Error(m)};
const pins={
 'project/str/joined-rc-reference.md':'f53292c7cbe97772e3a0b2efd8fc2a6bcfcd094b7c39debe72d278407408e797',
 'project/str/studies/house-plan.json':'193805456e26533026814bebe8c6be862e26a7d944c360dbb6047a1bde2d2282',
 'project/str/studies/house-bedroom-options.json':'57137bfc955d9dc26ad3037952cbf193753649a7464d2c1b9113bcac23e259b9',
 'project/had/studies/court-b-joined.json':'2916038341433d5a35ab7e9fc0caaeae4518e80add0384a2542d60c7718fc829',
 'docs/reference-house/material-policy.md':'a1002d7ecea0de2fe27b541785c61ea45f65fbbb7bd9dda235a1fb6c7be2511e'
};
for(const [p,h]of Object.entries(pins))assert(createHash('sha256').update(readFileSync(new URL(p,root))).digest('hex')===h,'Reappraise changed source '+p);
const sharedPath='project/mat/studies/services-b-joined-inventory.json';
const serviceDoc=JSON.parse(readFileSync(new URL(sharedPath,root)));
const S=serviceDoc.interfaces.principalShowerDrop,R=serviceDoc.boundedRewindLedger;
assert(S.schemaVersion===1&&S.id==='B-PRINCIPAL-SHOWER-DROP-01'&&S.units==='mm','Reassess shared service interface version');
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const sharedHash=createHash('sha256').update(JSON.stringify(canonical(S))).digest('hex');
assert(sharedHash==='30a685afb41a0329a43ae5e8ab0786912ac6326125db0a0d6911ea11ced0b40a','Reappraise changed canonical shower-drop contract');
const sharedProvenance={logicalSource:sharedPath,object:'interfaces.principalShowerDrop',interfaceSHA256:sharedHash,hashConvention:'Recursive key sort, JSON.stringify with JavaScript numeric normalization',owningHead:'38d4d803ea042abec878877e6fa4d37be7b697ae',owningBlob:'4680446018e2e530caf09e29bd8c90cbe26d3e5c',direction:'Services owns the lower interface; interiors consumes it. No reverse source hash.'};
const B=JSON.parse(readFileSync(new URL('project/str/studies/house-plan.json',root)));
assert(JSON.stringify(B.first_objects['principal-shower900'])==='[9385,6585,900,900]','Foreign shower occurrence');
const overlap=(a,b)=>Math.min(a[0]+a[2],b[0]+b[2])>Math.max(a[0],b[0])+1e-7&&Math.min(a[1]+a[3],b[1]+b[3])>Math.max(a[1],b[1])+1e-7;
const hull=(a,b,w,h)=>[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.abs(a[0]-b[0])+w,Math.abs(a[1]-b[1])+h];
const room=[9400,6600,2167.5,1552.5];
const objects={tray:[9400,6600,900,900],basin:[9400,7600,340,450],WC:[10972.5,7412.5,355,560],northChase:[10800,7972.5,767.5,180],stack:[11342.5,7950,180,180]};
const door={rough:[9900,10800],frameAllowance:25,closedLeaf:[9875,8430,950,44],openLeaf:[9050,8430,950,44],travel:825,netOpen:[10000,10775],insideGrip:[10050,8360],thresholdRise:20};
const walls=[['west',[9215,6500,185,1667.5]],['south',[9300,6415,2700,185]],['north-west',[9300,8152.5,600,260]],['north-east',[10800,8152.5,1200,260]],['east',[11567.5,6500,432.5,5500]]];
const obstacleEntries=[...Object.entries(objects).filter(([k])=>k!=='tray'),...walls,['open room leaf',door.openLeaf]];
function distanceSegment(a,b,r){assert(a[0]===b[0]||a[1]===b[1],'Only whole axis segments');return Math.hypot(Math.max(r[0]-Math.max(a[0],b[0]),Math.min(a[0],b[0])-r[0]-r[2],0),Math.max(r[1]-Math.max(a[1],b[1]),Math.min(a[1],b[1])-r[1]-r[3],0));}
function route(start,end,radius=320,extra=0){
 const step=5,queue=[start],key=p=>p.join(','),prev=new Map([[key(start),null]]),obs=[...obstacleEntries,['tray',objects.tray]].map(([id,r])=>[id,[r[0]-extra,r[1]-extra,r[2]+2*extra,r[3]+2*extra]]);
 for(let n=0;n<queue.length&&!prev.has(key(end));n++){const a=queue[n];for(const d of [[step,0],[-step,0],[0,step],[0,-step]]){const b=[a[0]+d[0],a[1]+d[1]];if(b[0]<10000||b[0]>11200||b[1]<6900||b[1]>8050||prev.has(key(b)))continue;if(obs.some(([,r])=>distanceSegment(a,b,r)<radius))continue;prev.set(key(b),a);queue.push(b);}}
 assert(prev.has(key(end)),'No whole-circle shower path');let chain=[],p=end;while(p){chain.push(p);p=prev.get(key(p))}chain.reverse();let simple=[];for(const p of chain){if(simple.length>1&&(simple.at(-2)[0]===simple.at(-1)[0]&&p[0]===simple.at(-1)[0]||simple.at(-2)[1]===simple.at(-1)[1]&&p[1]===simple.at(-1)[1]))simple[simple.length-1]=p;else simple.push(p)}return simple;
}
const bodyRoutes={entry:[[10400,8850],[10400,7850]],shower:route([10400,7850],[10700,7100]),basin:[[10400,7850],[10070,7850]],WC:route([10400,7850],[11150,7000],320)};
const bodyResults={};
for(const [name,path]of Object.entries(bodyRoutes)){
 let spare=Infinity,governing='';
 const obs=[...obstacleEntries,['tray',objects.tray]];
 for(let i=1;i<path.length;i++)for(const [id,r]of obs){const d=distanceSegment(path[i-1],path[i],r)-300;if(d<spare){spare=d;governing=id}assert(d>=0,name+' circle hits '+id)}
 bodyResults[name]={radius:300,minimumSpare:spare,governing};
}
// Full tray+frame handling envelope is an ADMISSION LIMIT, not a supplied product size.
const handling={maximumAssembly:[900,900,250],initial:[9400,6600],firstShift:[9440,6600],verticalLift:400,rotationAxis:'north-south through envelope centre',rotationRadius:Math.hypot(900,250)/2,rotationCentre:[9890,7050,525],onEdge:[9765,6600,250,900],translated:[10275,6600,250,900],bedroomStage:[10275,8540,250,900]};
const rotationSweep=[9890-handling.rotationRadius,6600,2*handling.rotationRadius,900];
const rotationVertical=[525-handling.rotationRadius,525+handling.rotationRadius];
const noTrayObs=obstacleEntries;
// Service nose and branch are disconnected/removed before full module movement.
for(const [id,r]of noTrayObs){assert(!overlap(hull(handling.initial,handling.firstShift,900,900),r),'First full-body shift hits '+id);assert(!overlap(rotationSweep,r),'Rotation sweep hits '+id);assert(!overlap(hull([handling.onEdge[0],6600],[10275,6600],250,900),r),'On-edge east movement hits '+id);assert(!overlap(hull([10275,6600],[10275,8540],250,900),r),'Bedroom transfer hits '+id);}
assert(rotationVertical[0]>0&&rotationVertical[1]<1100,'Rotation floor/headroom limit');
assert(handling.bedroomStage[1]+900<B.first_objects.principal[1],'Staging hits retained principal bed');
const drain={allowedWasteBodyPlan:[9965,6730,250,160],allowedWasteZ:[40,95],supportKeepouts:[[9428,6628,100,100],[10172,6628,100,100],[9428,7372,100,100],[10172,7372,100,100]],railKeepouts:[[9400,6600,30,900],[10270,6600,30,900],[9400,6600,900,30],[9400,7470,900,30]],railZ:[85,95],trayAperture:[10090,6810],diameter:90,orientation:'corner rotated to southeast',matchedWaste:'BetteCompact+ B568; manufacturer family compatibility, no configured kit admission',wasteHeight:55,outletAxisZ:null,outletAxisTarget:60,formedPortCentre:S.formedFloorPort.slice(0,2),formedBore:S.formedFloorPort[2],sleeveOutside:100,sleeveWall:1.5,sleeveInside:97,maximumRetainedTailOutside:75,sealAndSupportFootprint:[S.formedFloorPort[0]-75,S.formedFloorPort[1]-75,150,150],firstJointTargetGlobal:S.unionA.point,firstJointLocalZ:S.unionA.point[2]-3450,secondJointGlobal:S.unionB.point,firstReleaseVector:S.renewal.firstMovement,workingBox:S.clearUndersideAperture,outerCoverFrame:S.outerApertureFrame,maximumLowerSpoolPlan:[S.renewal.installedSpoolBounds[0],S.renewal.installedSpoolBounds[1],S.renewal.installedSpoolBounds[3],S.renewal.installedSpoolBounds[4]],lowerSpoolLowestGlobal:S.renewal.firstMovementLowest,actualConnectionEnvelopes:null};
for(const foot of drain.supportKeepouts){assert(!overlap(drain.allowedWasteBodyPlan,foot),'Waste body enters support keepout');assert(!overlap(drain.sealAndSupportFootprint,foot),'Floor seal enters foot bearing');}
for(const rail of drain.railKeepouts)assert(!overlap(drain.allowedWasteBodyPlan,rail),'Waste body enters actual authored perimeter-rail territory');
const branchPath=S.path.map(p=>p.slice(0,2));
const length=branchPath.slice(1).reduce((a,p,i)=>a+Math.hypot(p[0]-branchPath[i][0],p[1]-branchPath[i][1]),0);
const branch={level:'GROUND ceiling, not the upper walking surface',maximumFittingOutside:S.turnT.maxEnvelope[0],path:branchPath,centrelineLength:length,fallRatio:S.fallDenominator,startAxisGlobal:S.turnT.point[2],endAxisGlobal:S.soilJoin[2],nominalPipeOutside:S.pipeOD,lowest100FittingGlobal:S.boxing.lowestFittingAtJoin,supportReservation:S.boxing.supportDepth,finalAirReserve:S.boxing.finalAirReserve,ceilingBoxInnerTop:S.boxing.panelTop,ceilingPanelThickness:S.boxing.panelThickness,ceilingBoxUndersideTarget:S.boxing.finishedUnderside,existingSoilZoneUnderside:2540,actualConnectedCapacity:null,soilPort:R.principalPort.slice(0,2),soilBoreTerritory:[R.principalPort[0]-80,R.principalPort[1]-80,160,160],outerStructuralLeafWest:R.eastStructuralFace,ligament:R.portToStructuralFace,eastWindowProjection:[6900,7900],groundEFullBand:[6623.5,7626.5],PcollectorJoin:S.soilJoin};
assert(length===S.length,'Shared branch station length changed');
assert(branch.startAxisGlobal-length/S.fallDenominator===branch.endAxisGlobal,'Shared branch fall changed');
assert(branch.lowest100FittingGlobal-branch.supportReservation-branch.finalAirReserve===branch.ceilingBoxInnerTop,'Full fitting/support/air stack changed');
assert(branch.ceilingBoxInnerTop-branch.ceilingPanelThickness===branch.ceilingBoxUndersideTarget,'Complete panel thickness omitted');
assert(branch.ceilingBoxUndersideTarget>=branch.existingSoilZoneUnderside,'Shower adds depth below existing soil service zone');
assert(S.renewal.fullyLoweredHighest<branch.ceilingBoxUndersideTarget,'Spool has not cleared the finished underside after second lowering');
assert(objects.stack[1]>7900,'Full-height soil column crosses east window');

const splitRenewal={first:'Support trap/tail and both downstream members independently; disconnect two actual true unions in ceiling box',lowerSpoolTranslation:S.renewal.firstMovement,lowerSpoolSubsequentMovement:S.renewal.subsequentLowering,lowerSpoolFullyLoweredHighest:S.renewal.fullyLoweredHighest,flangeRelease:'Three B568 screws from above only after lower body supported; exact manufacturer sequence must agree',trayFrameMaximum:[900,900,250],excludedFromModule:['trap body','450-deep tail','lower spool','floor sleeve and seal'],tailLowestLocal:S.unionA.point[2]-3450,stripBeforeUpperWithdrawal:'Actual upper unionA half, nuts and clamps wider than75 must remove below the floor. Installed100 profile is retained only for the ordinary lower-spool task.',tailMaximumOutside:75,clearSleeveInside:97,upperWithdrawal:500,tailLowestAfterWithdrawal:50,maximumTrapTopAfterWithdrawal:595,floorSleeveTop:20,seatReleaseRequirement:'All upper flange/ring/screws free; no retaining neck/collar interlocks with tray aperture. Initial solid-part check is a required unseated state, not delivered B568 seat dimensions.',temporarySupport:'Independent removable cradle; no load on waterproofing or loose tail',openBoundary:'With tail and annular seals removed, sleeve is an OPEN floor water/air/fire/acoustic path',temporaryClosure:'Isolate wet use and affected lower area; fit removable qualified sleeve cap/closure until compatible annular and penetration seals reinstated/tested',sealSequence:'Fixed sleeve remains; demountable pipe seal is released only after tray module out; floor/fire/acoustic seals reinstated and tested'};
const overlap3=(a,b)=>overlap(a,b)&&Math.min(a[4]+a[5],b[4]+b[5])>Math.max(a[4],b[4])+1e-7;
const trap3=[...drain.allowedWasteBodyPlan,40,55];
const initialModuleParts=[...drain.supportKeepouts.map(r=>[...r,0,85]),...drain.railKeepouts.map(r=>[...r,85,10]),[9400,6600,900,900,95,25]];
for(const part of initialModuleParts)assert(!overlap3(part,trap3),'Initial tray/frame lift strikes retained trap');
assert(splitRenewal.tailLowestAfterWithdrawal>splitRenewal.floorSleeveTop,'Tail not fully withdrawn');
assert(splitRenewal.tailMaximumOutside<splitRenewal.clearSleeveInside,'Tail trapped by fixed sleeve');
const spoolStart=drain.maximumLowerSpoolPlan,spoolEnd=[spoolStart[0]+S.renewal.firstMovement[0],spoolStart[1]+S.renewal.firstMovement[1]];
const spoolSweep=hull([spoolStart[0],spoolStart[1]],spoolEnd,spoolStart[2],spoolStart[3]);
assert(spoolSweep[0]>=drain.workingBox[0]&&spoolSweep[1]>=drain.workingBox[1]&&spoolSweep[0]+spoolSweep[2]<=drain.workingBox[0]+drain.workingBox[2]&&spoolSweep[1]+spoolSweep[3]<=drain.workingBox[1]+drain.workingBox[3],'Lower spool cannot cross working aperture');
const bedroomTrial={status:'Explicit concurrent HAD assumption; not merged adopted house',bed:[9492.5,9175,2090,1600],wardrobe:[7707.5,9300,660,1500],maintenanceBed:[9492.5,9675,2090,1600],temporaryTranslation:[0,500],outsideEntry:[10400,8850]};
assert(!overlap(hull([9492.5,9175],[9492.5,9675],2090,1600),bedroomTrial.wardrobe),'Temporary whole bed movement hits wardrobe');
assert(bedroomTrial.maintenanceBed[1]+1600<11582.5,'Temporary bed leaves house');
assert(!overlap(handling.bedroomStage,bedroomTrial.maintenanceBed),'Module staging hits moved whole bed');
assert(overlap(handling.bedroomStage,bedroomTrial.bed),'Do not hide ordinary bed/staging conflict');
assert(distanceSegment([10400,8850],[10400,7850],bedroomTrial.bed)>=300,'Actual outside entry hits new bed');
const entryBedSpare=distanceSegment([10400,8850],[10400,7850],bedroomTrial.bed)-300;if(entryBedSpare<bodyResults.entry.minimumSpare)bodyResults.entry={radius:300,minimumSpare:entryBedSpare,governing:'concurrent HAD bed trial'};
const highStepBenchmark={status:'Rejected first direction: above-floor fall imposes250 rim and long return',rim:250,frameH:200,mineralBearingPlinth:50,firstJointNorth:[10090,7535,180],aboveFloorLength:3577.5,fallAt1in40:89.4375,last100FittingBottom:40.5625,decision:'Choose formed local port and below-slab accessible branch; no new floor hole accepted by this comparison'};

const adverse={oldSoilDropHitsE:overlap([11412.5,7197.5,160,160],[7750,6623.5,4250,1003]),oldDoorEntersMovedWC:distanceSegment([10900,8850],[10900,7850],objects.WC)<300,flatTrayDoesNotPassNetDoor:900>door.netOpen[1]-door.netOpen[0],oldCornerNoRotationRoom:9400+450-Math.hypot(900,250)/2<9400,highStackAtOld7827HitsWindow:7747.5<7900};
assert(Object.values(adverse).every(Boolean),'Adverse control lost its failure');
const stressRoute=(radius,extra)=>{try{route([10400,7850],[11150,7000],radius,extra);return true}catch{return false}};
const sensitivity={criterion:'Authored20 radial route reserve; not human or legal validation',WCSearchRadius:320,showerSearchRadius:320,plus10EachFaceRadius300:stressRoute(300,10),plus10EachFaceRadius320:stressRoute(320,10),plus20EachFaceRadius320:stressRoute(320,20),wetFinishExtra15:'Explicitly consumed on all four local wetroom faces; global outer envelope remains417.5',northStackSpare:8152.5-8130,eastStackSpare:11567.5-11522.5,plus10NorthFinishStackSpare:12.5,showerThroat:10972.5-10300,plus20EachSideShowerThroat:10972.5-10300-40,doorNetAfter10EachSide:755};
const showerScreen={status:'Unselected inward-folding screen compatibility requirement',clearOpeningMinimum:700,maximumFoldProjectionIntoTray:450,openPark:[9850,7450,450,50],operatorStation:[10700,7090],insideStation:[9850,7090],handleEnvelope:[[10300,6810],[10300,7420]],reachComparison:600,coupledOperation:null,gasketsAndHinges:'unknown/unapproved; no substituted or omitted seals'};
for(const handle of showerScreen.handleEnvelope)assert(Math.hypot(handle[0]-showerScreen.operatorStation[0],handle[1]-showerScreen.operatorStation[1])<=showerScreen.reachComparison,'Required screen grip edge exceeds target reach');
const screenPath=[[10700,7090],[9850,7090]];
for(const [,r]of [...obstacleEntries,['folded screen',showerScreen.openPark]])assert(distanceSegment(...screenPath,r)>=300,'Whole body cannot pass open screen');
assert(!sensitivity.plus20EachFaceRadius320,'Tolerance stress must reject unearned20 reserve');

const result={sharedProvenance,sharedLowerInterface:S,initialModuleParts,spoolSweep,splitRenewal,bedroomTrial,highStepBenchmark,showerScreen,sensitivity,status:'Connected internal development direction; material/physical admission rejected pending named corrections',basisMain:'6a953ef6d3131364aca740eaff2a06f301adbc2e',pins,sourceRoom:[9385,6585,2197.5,1582.5],sourceDoor:[10450,11350],sourceObjects:{tray:B.first_objects['principal-shower900'],basin:B.first_objects['principal-basin'],WC:B.first_objects['principal-WC']},room,objects,door,bodyRoutes,bodyResults,handling,rotationSweep,rotationVertical,drain,branch,adverse,section:{rim:120,bowlNominal:95,upstandTop:155,bearing:0,floorStructureTop:-80,floorFinish:0,floorLayers:[['stone',15],['bedding',5],['waterproofing',2],['formed mineral screed',58]],wetWallLayers:[['ceramic',10],['bedding',3],['waterproofing',2],['mineral render',15]],inheritedFinish:15,newWetFinish:30,threshold:20},unearned:['exact 900 frame code/geometry and all constituents','configured tray/upstand maximum and release','output axis and mating kit; 50 release stroke and tools are targets','structural bore, floor support and arch/door relocation','connected drainage/ventilation and physical discharge','complete waterproofing system compatibility and material admission','coupled room/shower door hardware and real handling equipment']};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="#faf8f2"/><style>text{font-family:DejaVu Sans,sans-serif;fill:#233b42}.n{font-size:2.7px}.small{font-size:2.3px}.h{font-size:4px;font-weight:bold}line,path,rect{stroke-linejoin:round}</style>`;
const t=(x,y,s,c='n')=>{svg+=`<text x="${x}" y="${y}" class="${c}">${esc(s)}</text>`};
const line=(a,b,c='#405d67',dash='')=>{svg+=`<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" fill="none" stroke="${c}" stroke-width=".5" ${dash?'stroke-dasharray="2 1"':''}/>`};
t(15,15,'PRINCIPAL B / CONNECTED WETROOM REPLAN','h');t(15,22,'Internal reference design. Required polymers remain unapproved; product, structure and physical admission are not earned.');
svg+=`<defs><clipPath id="plan"><rect x="15" y="29" width="180" height="157"/></clipPath></defs><g clip-path="url(#plan)">`;
const px=x=>20+(x-9200)/20,py=y=>182-(y-6500)/20;
const rect=(r,fill,stroke='#54707a',dash='')=>{svg+=`<rect x="${px(r[0])}" y="${py(r[1]+r[3])}" width="${r[2]/20}" height="${r[3]/20}" fill="${fill}" stroke="${stroke}" stroke-width=".35" ${dash?'stroke-dasharray="2 1"':''}/>`};
for(const [,r]of walls)rect(r,'#b9c1bc');
for(const [id,r]of Object.entries(objects))rect(r,id.includes('Chase')?'#d5c7a7':id==='stack'?'#c47759':id==='tray'?'#d9ebe8':'#e6e0d2');
rect(door.openLeaf,'#85a6a7');rect(door.closedLeaf,'none','#85a6a7',true);
rect(handling.bedroomStage,'none','#916c9a',true);rect(showerScreen.openPark,'none','#617ba0',true);line([px(9900),py(8152.5)],[px(10800),py(8152.5)],'#b8833c');
for(const p of Object.values(bodyRoutes))for(let i=1;i<p.length;i++)line([px(p[i-1][0]),py(p[i-1][1])],[px(p[i][0]),py(p[i][1])],'#3a8982');
for(const p of [[10400,7850],[10700,7100]])svg+=`<circle cx="${px(p[0])}" cy="${py(p[1])}" r="${300/20}" fill="none" stroke="#3a8982" stroke-width=".35"/>`;
for(let i=1;i<branchPath.length;i++)svg+=`<path d="M${px(branchPath[i-1][0])} ${py(branchPath[i-1][1])}L${px(branchPath[i][0])} ${py(branchPath[i][1])}" stroke="#b65e36" stroke-width="${100/20}" opacity=".22"/>`;
for(let i=1;i<branchPath.length;i++)line([px(branchPath[i-1][0]),py(branchPath[i-1][1])],[px(branchPath[i][0]),py(branchPath[i][1])],'#b65e36');
svg+=`<circle cx="${px(10090)}" cy="${py(6810)}" r="${45/20}" fill="#b65e36"/>`;
t(px(9450),py(6800),'900 body / rim +120');t(px(9420),py(7800),'340 × 450 basin');t(px(10980),py(7600),'WC faces south');t(px(10900),py(8040),'180 service band');t(23,88,'Door −550; 20 saddle; leaf parks west');t(56,33,'On-edge staging 250 × 900');svg+='</g>';t(24,192,'PLAN 1:20 at A3 · all whole-segment paths use radius300 circle');t(24,199,'Brown: lower-storey ceiling branch projected here; no upper-floor chase.');
t(200,39,'SECTION / WATER AND SUPPORT','h');
const sx=x=>205+x/10,sz=z=>110-z/10;
const sr=(x,z,w,h,fill)=>{svg+=`<rect x="${sx(x)}" y="${sz(z+h)}" width="${w/10}" height="${h/10}" fill="${fill}" stroke="#54707a" stroke-width=".3"/>`};
sr(0,-280,1100,200,'#c4cbc4');sr(0,-80,1100,58,'#d6d0bf');sr(0,-22,1100,2,'#ba7359');sr(0,-20,1100,5,'#b7b1a2');sr(0,-15,1100,15,'#e0d9c8');
sr(0,95,900,25,'#d9ebe8');sr(-30,0,30,155,'#b9c1bc');sr(0,120,3,35,'#77a5a4');
// Actual authored perimeter rail keep-outs are tested in plan; this cut crosses only east/west rails.
sr(0,85,30,10,'#b5b5ab');sr(870,85,30,10,'#b5b5ab');
sr(565,40,250,55,'#c47759');sr(745,-280,110,280,'#faf8f2');sr(750,-280,1.5,300,'#54707a');sr(848.5,-280,1.5,300,'#54707a');sr(725,0,150,20,'#85a6a7');sr(775,-450,50,510,'#c47759');sr(750,S.unionA.point[2]-3450-S.unionA.maxAxialLength/2,S.unionA.maxOD,S.unionA.maxAxialLength,'#b65e36');line([sx(800),sz(S.unionA.point[2]-3450-S.unionA.maxAxialLength/2)],[sx(800),sz(S.turnT.point[2]-3450)],'#b65e36');line([sx(800),sz(S.turnT.point[2]-3450)],[sx(1100),sz(S.turnT.point[2]-3450)],'#b65e36');t(319,177,'N branch projected beyond cut','small');
line([sx(690),sz(60)],[sx(800),sz(60)],'#b65e36');
t(205,52,'30 wall = 15 render +2 seal +3 bed +10 ceramic');t(205,59,'Replace inherited15; tray +15 east and north.');t(205,68,'35 Upstand / 12 overlap: concealed tape + bonded seal stay.');
t(205,78,'H120 frame; required perimeter30 rail reservations, not supplied parts.');t(205,87,'Ø110 formed port + fixed sleeve; first true union below slab.');
t(205,188,'FFL0 / rim120 / bowl95 / upstand155; section1:10');t(205,195,'RC200 top−80 / soffit−280; tail ends−450; first union global3000.');t(205,202,'Independent trap/tail cradle; two true unions, removable lower spool.');
t(15,207,'RENEWAL: ALL CONNECTIONS AND WATER BOUNDARY RELEASED FIRST','h');
const notes=[
 '1 Open pantry ceiling box; support parts; release both true unions; spool50 S/50 down, then400 down below finished2645.',
 '2 Release flange screws from above; leave trap and tail supported. Remove screen and complete bonded wall boundary.',
 '3 Retain loaded support until the whole tray/frame module is supported. Lift400; shift40 east; rotate about N–S axis.',
 '4 Maximum900 ×900 ×250 envelope rotates inside934.08-wide sweep; vertical range57.96..992.04 above FFL.',
 '5 Move whole bed500 N first; module passes net775 door to y8540..9440. Independently withdraw trap/tail500 up.',
 '6 Tail withdrawal OPENS floor boundary: isolate wet use/lower area, cap sleeve temporarily, then reinstate/test every annular seal.',
 'Ground-ceiling D50 '+length+' long /1:'+S.fallDenominator+' fall '+S.fall+'; full fitting '+S.boxing.lowestFittingAtJoin+' −support25 −air25 −panel20 →'+S.boxing.finishedUnderside+'.',
 'No metal-only wetroom: B568 body/PP connections are plastic; concealed seal, pads, fittings, binders and screen remain unadmitted.'
];notes.forEach((s,i)=>t(15,217+i*8,s));
svg+='</svg>\n';
for(const [name,text]of [['interiors-b-wetroom-assembly.json',JSON.stringify(result,null,2)+'\n'],['interiors-b-wetroom-assembly.svg',svg]]){
 const path=new URL(name,out);if(process.argv.includes('--check'))assert(readFileSync(path,'utf8')===text,'Stale generated '+name);else writeFileSync(path,text);
}
console.log(JSON.stringify({bodyResults,adverse,rotationVertical,branchLength:length,minimumBranchBottom:branch.minimumBottomBeforeFittings}));
