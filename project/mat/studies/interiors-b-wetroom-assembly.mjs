/** Principal B wetroom: connected design trial, not product/physical admission. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../../../',import.meta.url),out=new URL('./',import.meta.url);
const assert=(p,m)=>{if(!p)throw Error(m)};
const pins={
 'project/str/studies/house-plan.json':'193805456e26533026814bebe8c6be862e26a7d944c360dbb6047a1bde2d2282',
 'project/str/studies/house-bedroom-options.json':'57137bfc955d9dc26ad3037952cbf193753649a7464d2c1b9113bcac23e259b9',
 'project/had/studies/court-b-joined.json':'2916038341433d5a35ab7e9fc0caaeae4518e80add0384a2542d60c7718fc829',
 'docs/reference-house/material-policy.md':'a1002d7ecea0de2fe27b541785c61ea45f65fbbb7bd9dda235a1fb6c7be2511e'
};
for(const [p,h]of Object.entries(pins))assert(createHash('sha256').update(readFileSync(new URL(p,root))).digest('hex')===h,'Reappraise changed source '+p);
const B=JSON.parse(readFileSync(new URL('project/str/studies/house-plan.json',root)));
assert(JSON.stringify(B.first_objects['principal-shower900'])==='[9385,6585,900,900]','Foreign shower occurrence');
const overlap=(a,b)=>Math.min(a[0]+a[2],b[0]+b[2])>Math.max(a[0],b[0])+1e-7&&Math.min(a[1]+a[3],b[1]+b[3])>Math.max(a[1],b[1])+1e-7;
const hull=(a,b,w,h)=>[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.abs(a[0]-b[0])+w,Math.abs(a[1]-b[1])+h];
const room=[9400,6600,2182.5,1567.5];
const objects={tray:[9400,6600,900,900],basin:[9400,7600,340,450],WC:[10842.5,7800,560,355],stack:[11402.5,7970,180,180],southChase:[10300,6600,1282.5,180],eastChase:[11402.5,6600,180,1550],serviceNose:[10300,6710,60,250]};
// Low chases are fixed obstacles to walking/handling, not free floor.
const door={rough:[9900,10800],frameAllowance:25,closedLeaf:[9875,8430,950,44],openLeaf:[9050,8430,950,44],travel:825,netOpen:[10000,10775],insideGrip:[10050,8360],thresholdRise:20};
const walls=[['west',[9215,6500,185,1667.5]],['south',[9300,6415,2700,185]],['north-west',[9300,8167.5,600,245]],['north-east',[10800,8167.5,1200,245]],['east',[11582.5,6500,417.5,5500]]];
const obstacleEntries=[...Object.entries(objects).filter(([k])=>k!=='tray'),...walls,['open room leaf',door.openLeaf]];
function distanceSegment(a,b,r){assert(a[0]===b[0]||a[1]===b[1],'Only whole axis segments');return Math.hypot(Math.max(r[0]-Math.max(a[0],b[0]),Math.min(a[0],b[0])-r[0]-r[2],0),Math.max(r[1]-Math.max(a[1],b[1]),Math.min(a[1],b[1])-r[1]-r[3],0));}
function route(start,end,radius=305){
 const step=5,queue=[start],key=p=>p.join(','),prev=new Map([[key(start),null]]),obs=[...obstacleEntries,['tray',objects.tray]];
 for(let n=0;n<queue.length&&!prev.has(key(end));n++){const a=queue[n];for(const d of [[step,0],[-step,0],[0,step],[0,-step]]){const b=[a[0]+d[0],a[1]+d[1]];if(b[0]<10000||b[0]>11200||b[1]<6900||b[1]>8050||prev.has(key(b)))continue;if(obs.some(([,r])=>distanceSegment(a,b,r)<radius))continue;prev.set(key(b),a);queue.push(b);}}
 assert(prev.has(key(end)),'No whole-circle shower path');let chain=[],p=end;while(p){chain.push(p);p=prev.get(key(p))}chain.reverse();let simple=[];for(const p of chain){if(simple.length>1&&(simple.at(-2)[0]===simple.at(-1)[0]&&p[0]===simple.at(-1)[0]||simple.at(-2)[1]===simple.at(-1)[1]&&p[1]===simple.at(-1)[1]))simple[simple.length-1]=p;else simple.push(p)}return simple;
}
const bodyRoutes={entry:[[10400,8850],[10400,7850]],shower:route([10400,7850],[10700,7100]),basin:[[10400,7850],[10070,7850]],WC:[[10400,7850],[10520,7850],[10520,7900]]};
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
const noTrayObs=obstacleEntries.filter(([k])=>!['serviceNose','southChase'].includes(k));
// Service nose and branch are disconnected/removed before full module movement.
for(const [id,r]of noTrayObs){assert(!overlap(hull(handling.initial,handling.firstShift,900,900),r),'First full-body shift hits '+id);assert(!overlap(rotationSweep,r),'Rotation sweep hits '+id);assert(!overlap(hull([handling.onEdge[0],6600],[10275,6600],250,900),r),'On-edge east movement hits '+id);assert(!overlap(hull([10275,6600],[10275,8540],250,900),r),'Bedroom transfer hits '+id);}
assert(rotationVertical[0]>0&&rotationVertical[1]<1100,'Rotation floor/headroom limit');
assert(handling.bedroomStage[1]+900<B.first_objects.principal[1],'Staging hits retained principal bed');
const drain={trayAperture:[10090,6810],diameter:90,orientation:'corner rotated to southeast',matchedWaste:'BetteCompact+ B568, manufacturer family compatibility; exact configured kit not admitted',wasteHeight:55,outletAxisZ:null,firstJointTarget:[10335,6810,125],firstReleaseStrokeTarget:50,toolBox:[10300,6710,300,250],clearFascia:[10300,6600,0,200],actualSupportAperture:null};
const branchPath=[[10335,6810],[10335,6780],[11492.5,6780],[11492.5,8060]];
const length=branchPath.slice(1).reduce((a,p,i)=>a+Math.hypot(p[0]-branchPath[i][0],p[1]-branchPath[i][1]),0);
const branch={path:branchPath,centrelineLength:length,fallRatio:40,startAxisTarget:125,endAxisTarget:125-length/40,nominalPipeOutside:50,minimumBottomBeforeFittings:100-length/40,maximumChaseHeight:250,actualCouplingEnvelope:null,actualConnectedCapacity:null,stackCentre:[11492.5,8060],maximumBoreTerritory:[11412.5,7980,160,160],eastWindowProjection:[6900,7900],groundEFullBand:[6623.5,7626.5]};
assert(branch.maximumBoreTerritory[1]>7626.5,'New drop hits E water box');
assert(objects.stack[1]>7900,'Full-height stack crosses east window');
assert(branch.minimumBottomBeforeFittings>25,'Fall consumes floor clearance');
const adverse={oldSoilDropHitsE:overlap([11412.5,7197.5,160,160],[7750,6623.5,4250,1003]),oldDoorEntersMovedWC:distanceSegment([10900,8850],[10900,7850],objects.WC)<300,flatTrayDoesNotPassNetDoor:900>door.netOpen[1]-door.netOpen[0],oldCornerNoRotationRoom:9400+450-Math.hypot(900,250)/2<9400,highStackAtOld7827HitsWindow:7747.5<7900};
assert(Object.values(adverse).every(Boolean),'Adverse control lost its failure');
const result={status:'Connected internal development direction; material/physical admission rejected pending named corrections',basisMain:'6a953ef6d3131364aca740eaff2a06f301adbc2e',pins,sourceRoom:[9385,6585,2197.5,1582.5],sourceDoor:[10450,11350],sourceObjects:{tray:B.first_objects['principal-shower900'],basin:B.first_objects['principal-basin'],WC:B.first_objects['principal-WC']},room,objects,door,bodyRoutes,bodyResults,handling,rotationSweep,rotationVertical,drain,branch,adverse,section:{rim:200,bowlNominal:175,upstandTop:235,bearing:0,floorStructureTop:-80,floorFinish:0,floorLayers:[['stone',15],['bedding',5],['waterproofing',2],['formed mineral screed',58]],wetWallLayers:[['ceramic',10],['bedding',3],['waterproofing',2],['mineral render',15]],inheritedFinish:15,newWetFinish:30,threshold:20},unearned:['exact 900 frame code/geometry and all constituents','configured tray/upstand maximum and release','output axis and mating kit; 50 release stroke and tools are targets','structural bore, floor support and arch/door relocation','connected drainage/ventilation and physical discharge','complete waterproofing system compatibility and material admission','coupled room/shower door hardware and real handling equipment']};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="#faf8f2"/><style>text{font-family:DejaVu Sans,sans-serif;fill:#233b42}.n{font-size:2.7px}.small{font-size:2.3px}.h{font-size:4px;font-weight:bold}line,path,rect{stroke-linejoin:round}</style>`;
const t=(x,y,s,c='n')=>{svg+=`<text x="${x}" y="${y}" class="${c}">${esc(s)}</text>`};
const line=(a,b,c='#405d67',dash='')=>{svg+=`<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" fill="none" stroke="${c}" stroke-width=".5" ${dash?'stroke-dasharray="2 1"':''}/>`};
t(15,15,'PRINCIPAL B / CONNECTED WETROOM REPLAN','h');t(15,22,'Internal reference design. Required polymers remain unapproved; product, structure and physical admission are not earned.');
const px=x=>20+(x-9200)/16,py=y=>182-(y-6500)/16;
const rect=(r,fill,stroke='#54707a',dash='')=>{svg+=`<rect x="${px(r[0])}" y="${py(r[1]+r[3])}" width="${r[2]/16}" height="${r[3]/16}" fill="${fill}" stroke="${stroke}" stroke-width=".35" ${dash?'stroke-dasharray="2 1"':''}/>`};
for(const [,r]of walls)rect(r,'#b9c1bc');
for(const [id,r]of Object.entries(objects))rect(r,id.includes('Chase')?'#d5c7a7':id==='stack'?'#c47759':id==='tray'?'#d9ebe8':'#e6e0d2');
rect(door.openLeaf,'#85a6a7');rect(door.closedLeaf,'none','#85a6a7',true);
rect(handling.bedroomStage,'none','#916c9a',true);
for(const p of Object.values(bodyRoutes))for(let i=1;i<p.length;i++)line([px(p[i-1][0]),py(p[i-1][1])],[px(p[i][0]),py(p[i][1])],'#3a8982');
for(const p of [[10400,7850],[10700,7100]])svg+=`<circle cx="${px(p[0])}" cy="${py(p[1])}" r="${300/16}" fill="none" stroke="#3a8982" stroke-width=".35"/>`;
for(let i=1;i<branchPath.length;i++)line([px(branchPath[i-1][0]),py(branchPath[i-1][1])],[px(branchPath[i][0]),py(branchPath[i][1])],'#b65e36');
svg+=`<circle cx="${px(10090)}" cy="${py(6810)}" r="${45/16}" fill="#b65e36"/>`;
t(38,163,'900 body / rim +200');t(35,103,'340 × 450 basin');t(124,100,'WC +700 N');t(126,88,'180 stack');t(44,65,'Door moved −550; leaf parks west');t(56,33,'On-edge staging 250 × 900');t(24,192,'PLAN 1:16 at A3 · all whole-segment paths use radius300 circle');
t(200,39,'SECTION / WATER AND SUPPORT','h');
const sx=x=>205+x/6,sz=z=>150-z/6;
const sr=(x,z,w,h,fill)=>{svg+=`<rect x="${sx(x)}" y="${sz(z+h)}" width="${w/6}" height="${h/6}" fill="${fill}" stroke="#54707a" stroke-width=".3"/>`};
sr(0,-80,1100,58,'#d6d0bf');sr(0,-22,1100,2,'#ba7359');sr(0,-20,1100,5,'#b7b1a2');sr(0,-15,1100,15,'#e0d9c8');
sr(0,175,900,25,'#d9ebe8');sr(-30,0,30,235,'#b9c1bc');sr(0,200,3,35,'#77a5a4');
sr(65,0,100,165,'#b5b5ab');sr(735,0,100,165,'#b5b5ab');sr(70,165,760,10,'#b5b5ab');
sr(565,120,250,55,'#c47759');sr(900,0,60,200,'#e4d9c4');
line([sx(690),sz(145)],[sx(960),sz(125)],'#b65e36');
t(205,52,'30 wall = 15 render +2 seal +3 bed +10 ceramic');t(205,59,'Replace inherited15; tray +15 east and north.');t(205,68,'35 Upstand / 12 overlap: concealed tape + bonded seal stay.');
t(205,78,'Metal frame H200; pads/rails shown as RESERVED envelopes.');t(205,87,'Actual foot/rail/pad geometry and load bearing remain unknown.');
t(205,160,'FFL0 / rim200 / bowl175 / upstand235; section1:6');t(205,169,'Full east fascia removed; no loaded frame or foot is removed.');t(205,178,'First union target x10335, z125; 50 release is a requirement.');
t(15,207,'RENEWAL: ALL CONNECTIONS AND WATER BOUNDARY RELEASED FIRST','h');
const notes=[
 '1 Isolate supplies; disconnect actual east joint; support waste below before the three flange screws release.',
 '2 Remove screen, south branch/covers, east/north service faces and wall-edge ceramic strips; strip and renew the full bonded seal.',
 '3 Retain loaded support until the whole tray/frame module is supported. Lift400; shift40 east; rotate about N–S axis.',
 '4 Maximum900 ×900 ×250 envelope rotates inside934.08-wide sweep; vertical range57.96..992.04 above FFL.',
 '5 Move on edge east to x10275..10525, then north through net775 opening to y8540..9440. Bed starts9492.5.',
 '6 250 is a maximum admission envelope, not measured hardware. Larger Upstand/feet/fittings require a new whole route.',
 'No hydraulic pass: D50 route '+length+' long, 1:40 target fall '+(length/40).toFixed(2)+'; actual output axis, joints and venting unknown.',
 'No metal-only wetroom: B568 body/PP connections are plastic; concealed seal, pads, fittings, binders and screen remain unadmitted.'
];notes.forEach((s,i)=>t(15,217+i*8,s));
svg+='</svg>\n';
for(const [name,text]of [['interiors-b-wetroom-assembly.json',JSON.stringify(result,null,2)+'\n'],['interiors-b-wetroom-assembly.svg',svg]]){
 const path=new URL(name,out);if(process.argv.includes('--check'))assert(readFileSync(path,'utf8')===text,'Stale generated '+name);else writeFileSync(path,text);
}
console.log(JSON.stringify({bodyResults,adverse,rotationVertical,branchLength:length,minimumBranchBottom:branch.minimumBottomBeforeFittings}));
