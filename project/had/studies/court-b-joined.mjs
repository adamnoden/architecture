/** Joined compact-B room and court maintenance witness. No house adoption or hydraulic proof. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {layoutRevision,revisionOpenings} from '../../../compiler/reference-house/georgian/layout-revision.js';

const ROOT=new URL('../../../',import.meta.url);
const pins={
 'project/str/studies/house-plan.json':'193805456e26533026814bebe8c6be862e26a7d944c360dbb6047a1bde2d2282',
 'project/str/studies/house-bedroom-options.json':'57137bfc955d9dc26ad3037952cbf193753649a7464d2c1b9113bcac23e259b9',
 'compiler/reference-house/georgian/layout-revision.ts':'d05fd7755a286db5b19db022950131982c5eed7e798a6808fa103d19f9a3c670'
};
for(const [path,hash]of Object.entries(pins))if(createHash('sha256').update(readFileSync(new URL(path,ROOT))).digest('hex')!==hash)throw Error('Reassess joined B source: '+path);
const B=JSON.parse(readFileSync(new URL('project/str/studies/house-plan.json',ROOT),'utf8'));
const openings=revisionOpenings('GROUND').map(o=>o.id==='grand-court-entry-south'?{...o,width:1800}:o);
const assert=(x,s)=>{if(!x)throw Error(s)};
assert(B.ground_walls.find(w=>w.id==='service-spine').a[0]===9300,'B spine must be9300');
const overlap=(a,b)=>Math.min(a[0]+a[2],b[0]+b[2])-Math.max(a[0],b[0])>1e-7&&Math.min(a[1]+a[3],b[1]+b[3])-Math.max(a[1],b[1])>1e-7;
const hull=(a,b,w,h)=>[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.abs(a[0]-b[0])+w,Math.abs(a[1]-b[1])+h];
function wallRects(walls){
 const out=[];
 for(const w of walls){const [x,y]=w.a,[xx,yy]=w.b,h=y===yy,lo=h?x:y,hi=h?xx:yy,at=h?y:x;
 const cuts=[...new Set([lo,hi,...w.holes.flat().filter(q=>q>lo&&q<hi)])].sort((a,b)=>a-b);
 for(let i=1;i<cuts.length;i++){const a=cuts[i-1],b=cuts[i];if(w.holes.some(([l,r])=>a>=l&&b<=r))continue;out.push([w.id,h?[a,at-w.t/2,b-a,w.t]:[at-w.t/2,a,w.t,b-a]])}}
 return out;
}
const exterior=[
 ['outer-south',true,0,417.5,0,12000],['outer-north',true,11582.5,417.5,0,12000],
 ['outer-west',false,0,417.5,417.5,11582.5],['outer-east',false,11582.5,417.5,417.5,11582.5],
 ['court-south',true,3832.5,417.5,3832.5,8167.5],['court-north',true,7750,417.5,3832.5,8167.5],
 ['court-west',false,3832.5,417.5,4250,7750],['court-east',false,7750,417.5,4250,7750]
];
const shellWalls=[];
for(const [name,h,at,t,lo,hi]of exterior){
 const holes=openings.filter(o=>o.wall===name).map(o=>[o.centre-o.width/2,o.centre+o.width/2]);
 const cuts=[...new Set([lo,hi,...holes.flat().filter(x=>x>lo&&x<hi)])].sort((a,b)=>a-b);
 for(let i=1;i<cuts.length;i++){const a=cuts[i-1],b=cuts[i];if(holes.some(([l,r])=>a>=l&&b<=r))continue;shellWalls.push([name,h?[a,at,b-a,t]:[at,a,t,b-a]])}
}
const fixed=[...wallRects(B.ground_walls),...shellWalls,['stair',B.stair],['void',B.void]];
const slots={north:{axis:6600,clearBand:[6300,6900],outerBand:[6098.5,7101.5],run:[7750,12000]},east:{axis:7125,clearBand:[6825,7425],outerBand:[6623.5,7626.5],run:[7750,12000]}};
let ordinary=structuredClone(B.ground_objects);
const oldShelf=ordinary['pantry-shelf-comparison'];
const newShelf=[9450,7767.5,900,400];
ordinary['pantry-shelf-comparison']=newShelf;
const Eclear=[7750,6825,4250,600],Eouter=[7750,6623.5,4250,1003],Nouter=[6098.5,7750,1003,4250];
assert(overlap(oldShelf,Eclear),'Original pantry shelf conflict must remain witnessed');
assert(!overlap(newShelf,Eouter),'New shelf must clear full E box');
assert(!overlap(newShelf,[10450,7567.5,900,600]),'Shelf must not occupy actual pantry door approach');
assert(!overlap(newShelf,[10982.5,6900,600,1000]),'Shelf must retain600deep east window approach comparison');
assert(newShelf[1]+newShelf[3]===8167.5,'B pantry north finished face');
const maintenance=structuredClone(ordinary),moves=[];
function move(id,path){
 const a=maintenance[id];assert(path[0][0]===a[0]&&path[0][1]===a[1],'Move must start at actual state '+id);
 const obstacles=[...fixed,...Object.entries(maintenance).filter(([n])=>n!==id)];
 for(let j=1;j<path.length;j++){
  assert(path[j-1][0]===path[j][0]||path[j-1][1]===path[j][1],'Axis furniture translation only');
  const swept=hull(path[j-1],path[j],a[2],a[3]);
  for(const [name,r]of obstacles)assert(!overlap(swept,r),id+' hits '+name+' on '+JSON.stringify(swept));
 }
 maintenance[id]=[...path.at(-1),a[2],a[3]];
 moves.push({id,from:a,to:maintenance[id],path,meaning:'Exact translating furniture envelope; no person, grip, weight, disassembly or actual furniture product.'});
}
move('dining-chair-west-south',[[4700,8850],[4700,8200],[5300,8200]]);
move('dining-chair-west-north',[[4700,9450],[4700,8200]]);
move('family-side-table300',[[4000,9200],[4500,9200],[4500,10500],[5200,10500]]);
for(const [id,target]of [['dining-chair-west-north',[1600,10900]],['dining-chair-west-south',[1000,10900]],['dining-chair-east-south',[1000,10300]],['dining-chair-east-north',[1600,10300]]]){
 const a=maintenance[id],east=id.includes('east');
 const begin=east?[[a[0],a[1]],[6500,a[1]],[6500,8200],[4700,8200]]:[[a[0],a[1]],[4700,8200]];
 move(id,[...begin,[4700,8950],[3100,8950],[3100,10300],[target[0],10300],target]);
}
for(const [id,r]of Object.entries(maintenance))assert(!overlap(Nouter,r),'N first-release blocked by '+id);
assert(JSON.stringify(maintenance['dining-table1200x800'])===JSON.stringify(B.ground_objects['dining-table1200x800']),'Table must remain fixed');
const bodyPath=[[5400,7450],[5400,8483.75],[4886.25,8483.75],[4886.25,11250],[5400,11250],[5400,12500]];
function pointSeg(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],d=dx*dx+dy*dy,t=d?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/d)):0;return Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dy*t)}
function segmentRectDistance(a,b,r){
 assert(a[0]===b[0]||a[1]===b[1],'Axis body route only');
 const dx=Math.max(r[0]-Math.max(a[0],b[0]),Math.min(a[0],b[0])-r[0]-r[2],0),dy=Math.max(r[1]-Math.max(a[1],b[1]),Math.min(a[1],b[1])-r[1]-r[3],0);return Math.hypot(dx,dy);
}
const bodyObstacles=[...fixed,...Object.entries(maintenance),['open N box',Nouter]];
let minBody=Infinity,governing;
for(let i=1;i<bodyPath.length;i++)for(const [id,r]of bodyObstacles){const d=segmentRectDistance(bodyPath[i-1],bodyPath[i],r)-300;if(d<minBody){minBody=d;governing=id}assert(d>=-1e-7,'Maintenance body route hits '+id)}
const depths={finish:15,distribution:65,insulation:100,rcCap:100};
const cover=Object.values(depths).reduce((a,b)=>a+b,0),boxBottom=-638,liner=1.5,boxInsulation=100,rcBase=100,outerBottom=boxBottom-liner-boxInsulation-rcBase,D=1300,heaveStress=300,constructionLoss=50,reserve=50;
assert(cover===280,'Peer joined cover recipe changed');
const levels={cover,coverBottom:-cover,independentLidTop:-310,lidSteel:6,lidCopperSeal:2,lidClosureBottom:-318,inletCrown:-378,inletInvert:-538,outletInvert:-580.5,boxBottom,outerBottom,authoredSoil:-D,rawClearance:D+outerBottom,after300Stress:D+outerBottom-heaveStress,afterConstructionLoss:D+outerBottom-heaveStress-constructionLoss,beyondFinal50Reserve:D+outerBottom-heaveStress-constructionLoss-reserve};
assert(levels.beyondFinal50Reserve>=0,'Reject joined D1300 under authored heave stress');
const ledger={
 identity:'UNADOPTED compact B joined ground court/room design; not accepted RH layout',sourceSha256:pins,
 authority:'House-plan B geometry plus compact-front bedroom alternative; accepted layout supplies unchanged outer/court openings only, not9500spine.',
 slots,actualCrossings:{court:[7750,8167.5],spine:[9215,9385],outer:[11582.5,12000],plantNorthFaces:[6415,6585],pantryNorthFinishedFace:8167.5},
 pantry:{oldShelf,newShelf,oldFootprintM2:oldShelf[2]*oldShelf[3]/1e6,newFootprintM2:newShelf[2]*newShelf[3]/1e6,frontageLost:250,depthLost:200,footprintLossPercent:100*(1-900*400/(600*1150)),capacity:'Unknown. This is an explicit smaller furniture envelope, no equivalent storage claim.'},
 ordinaryCollisions:{N:Object.entries(ordinary).filter(([,r])=>overlap(Nouter,r)).map(([id])=>id),EoldShelf:true},
 maintenance:{moves,furniture:maintenance,tableFixed:true,firstReleaseFullOuterWidth:1003,firstReleaseClearOfAllFurniture:true,bodyRadius:300,bodyPath,minStaticBodyReserve:minBody,governing,limits:'Open door APERTURES only; actual leaf/handles, human handling, guarding, temporary rain diversion, safe lifting and egress approval not proved. Reading room deliberately becomes chair store; ordinary room use unavailable.'},
 levels,layerRecipe:depths,sectionScope:'Coordinated MAT/STR trial: other owners retain capacity, complete gas/water/material acceptance. Covers and containment are independent of carrier; no280universalminimum.',
 rejectedInherited:{cover100:100,completeCapDepth280:280,minimumCapAloneClashWithOldCrown:120,syntheticReceiver:-450,finalDeeperOutlet:-580.5,outletBelowReceiver:130.5,interpretation:'280cap already defeats100reserve; separate lower lid and bridge clearance further deepen final constructive case.'},
 siteCost:{D:1300,acceptedSchematicDifference:150,wholeHouseRise:1150,totalApproachAt1in20:26000,incrementalApproachAt1in20:23000,landings:'Additional; geometry and available plot unknown.',roofAndEavesRiseRelativeFixedGrade:1150,actualHeave:'Unknown;300heave,50constructionloss and50finalreserve are authored adverse comparison, not survey, law or universal margin.'},
 firstHarm:{openNorthDoorWalkingPlane:0,doorAperture:[4800,7200],doorCentre:6000,Naxis:6600,carrierCrown:-378,exposedEcrest:-75,actualClosedDoorLowestSusceptibleJoint:'UNRESOLVED: no product-bound sill/weep/end/meeting-stile/pan/frame fixing datum',firstHarmConclusion:'Open near-level doorway admits water at walking plane0. Neither that conditional datum nor−75activation proves a safe closed-doorset operating water level. Floor gas/cap joints and threshold water boundary remain unaccepted.'},
 disposition:'Develop D1300 as one constructive reference design; reject inherited100cover/300rise joined package. Do not adopt B, D1300, hydraulic flow, receiving levels or construction readiness. HAD03 incomplete; RWT06 blocked.'
};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const T=(x,y,s,size=3.1,weight='normal',color='#23323a')=>`<text x="${x}" y="${y}" font-family="DejaVu Sans,Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(s)}</text>`;
const R=(x,y,w,h,fill,stroke='#52616a',sw=.3)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const L=(x,y,xx,yy,color='#52616a',sw=.4,dash='')=>`<path d="M${x} ${y} L${xx} ${yy}" fill="none" stroke="${color}" stroke-width="${sw}" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
const P=(q,color='#186f70',sw=.7)=>`<polyline points="${q.map(p=>p.join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="${sw}"/>`;
const page=(title,subtitle,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297" role="img" aria-label="${esc(title)}"><rect width="420" height="297" fill="#fffdf8"/>${T(15,17,title,5,'bold')}${T(15,26,subtitle,2.9)}${L(15,32,405,32)}${body.join('')}${L(15,275,405,275)}${T(15,284,'UNADOPTED COMPACT B / 1 November 2026 / HAD03 incomplete; RWT06 blocked.',2.8)}${T(15,291,'Reference design, not released for construction. Primary source and unresolved physical/material/site duties accompany the result.',2.65)}</svg>\n`;
function drawPlan(x0,y0,objects,maint=false){
 const a=[],X=x=>x0+x/100,Y=y=>y0+(12000-y)/100;
 a.push(R(X(0),Y(12000),120,120,'#f3eddf'),R(X(4250),Y(7750),35,35,'#d9eee7'));
 for(const [,r]of [...shellWalls,...wallRects(B.ground_walls)])a.push(R(X(r[0]),Y(r[1]+r[3]),r[2]/100,r[3]/100,'#bec5c0','none'));
 a.push(R(X(B.stair[0]),Y(B.stair[1]+B.stair[3]),B.stair[2]/100,B.stair[3]/100,'#d4d3c7'),R(X(B.void[0]),Y(B.void[1]+B.void[3]),B.void[2]/100,B.void[3]/100,'#fffdf8'));
 a.push(R(X(Nouter[0]),Y(Nouter[1]+Nouter[3]),Nouter[2]/100,Nouter[3]/100,maint?'#c96b50':'#b5d2ca','#337678'),R(X(Eouter[0]),Y(Eouter[1]+Eouter[3]),Eouter[2]/100,Eouter[3]/100,'#dec7a6','#95673e'));
 for(const [id,r]of Object.entries(objects)){let c=id.includes('chair')?'#e0b86b':id.includes('shelf')?'#b29a75':'#ded9cd';a.push(R(X(r[0]),Y(r[1]+r[3]),r[2]/100,r[3]/100,c,'#6d7168',.2))}
 if(maint){a.push(P(bodyPath.map(([x,y])=>[X(x),Y(y)]),'#116d80',.7));for(const p of bodyPath.slice(1,-1))a.push(`<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="3" fill="none" stroke="#116d80" stroke-width=".25"/>`)}
 a.push(T(X(4700),Y(6000),'COURT',2.7),T(X(9400),Y(4900),'PLANT',2.2),T(X(9450),Y(7300),'PANTRY',2),T(X(750),Y(9000),'READING',2.1));
 a.push(T(X(6650),Y(10500),'N',3,'bold'),T(X(8500),Y(7100),'E',3,'bold'));
 return a;
}
const plans=[];
plans.push(T(20,44,'01 / ORDINARY OCCUPATION',3.7,'bold'),T(215,44,'02 / CONTROLLED N MAINTENANCE',3.7,'bold'));
plans.push(...drawPlan(20,51,ordinary),...drawPlan(215,51,maintenance,true));
plans.push(T(20,181,'Both plans 1:100 at A3. Outer box width1003, clear tray600.',2.9),T(215,181,'Four chairs + one side table move; main table stays.',2.9));
const notes=[
 ['N clear x6300–6900; full box x6098.5–7101.5.','Reading cell becomes chair store; both sofa envelopes retained.'],
 ['E clear y6825–7425; full box y6623.5–7626.5.','Blue circle route300radius; minimum static reserve13.75mm.'],
 ['B spine9215–9385; old accepted9500spine is not copied.','The front of table gap is632.5, before real finish/tolerance.'],
 ['Pantry shelf moves to north-west900×400; old600×1150 fails.','Open door apertures are represented; leaf/grasp not accepted.'],
 ['New shelf ends100 before pantry door x10450–11350.','Chair paths use the actual rear-west and reading arch openings.'],
 ['Pantry footprint0.69→0.36m²; storage capacity is unqualified.','N/E floor/threshold support stays in place during wet-piece work.'],
 ['Ordinary N cover overlaps two east chair envelopes.','E repair closes pantry approach; a temporary independent rain'],
 ['Closed cover loads and complete floor boundary need proof.','bypass must be admitted before losing permanent E relief.']
];notes.forEach((pair,i)=>{plans.push(T(20,196+i*9,pair[0],2.8),T(215,196+i*9,pair[1],2.8))});
const sections=[];
sections.push(T(20,45,'03 / TRANSVERSE JOINED SECTION · 1:10',3.6,'bold'));
const X=q=>75+q/10,Y=z=>50-z/10;
sections.push(R(X(-501.5),Y(-638),100.3,20.15,'#bfc6be'));
sections.push(R(X(-501.5),Y(-280),10,35.8,'#bfc6be'),R(X(401.5),Y(-280),10,35.8,'#bfc6be'));
sections.push(R(X(-401.5),Y(-280),10,35.8,'#e4d3ac'),R(X(301.5),Y(-280),10,35.8,'#e4d3ac'),R(X(-401.5),Y(-639.5),80.3,10,'#e4d3ac'));
sections.push(P([[X(-300),Y(-310)],[X(-300),Y(-638)],[X(300),Y(-638)],[X(300),Y(-310)]],'#2d8490',.7));
sections.push(R(X(-330),Y(-310),66,.6,'#6b8790'),R(X(-330),Y(-316),66,.2,'#b78658'));
let z=0;for(const [name,d]of Object.entries(depths)){sections.push(R(X(-501.5),Y(z),100.3,d/10,{finish:'#c1b79c',distribution:'#e1dbca',insulation:'#e4d3ac',separators:'#9bb1a5',rcCap:'#bfc6be'}[name]));z-=d}
sections.push(R(X(-100),Y(-378),20,16,'#78a6a1'),L(X(-650),Y(-1300),X(650),Y(-1300),'#8b7355',.6),L(X(-650),Y(-1000),X(650),Y(-1000),'#ba7654',.5,'2 1'));
sections.push(T(20,189,'Soil−1300;300rise→−1000;50loss→−950. Box underside−839.5.',2.8),T(20,198,'460.5 raw clear →110.5 after300H+50loss →60.5 beyond50 reserve.',2.8));
const right=[
 'All z relative proposed whole-house FFL0.',
 '15stone +65distribution +100foam +100RCcap =280.',
 'Separate lid:SS6+Cuseal2 below RC, top−310 / bottom−318.',
 'SS1.5 secondary tray stays while carrier is removed.',
 'Tray600clear +2×(1.5liner+100foam+100RC) =1003.',
 'RC cap/support design and thermal bridges belong to STR/MAT.',
 'Carrier outside200×160; crown−378; inlet invert−538.',
 'Separate tray inside bottom−638; lowest primary outlet−580.5.',
 'Independent containment outlet and joined floor gas seals',
 'remain subject to the material result; no hydraulic pass.',
 'D1300 is derived from839.5depth+300H+50loss+50reserve,',
 'rounded up60.5. Actual soil/heave/receiver evidence can fail it.'
];right.forEach((s,i)=>sections.push(T(180,49+i*8,s,2.9)));
sections.push(T(20,211,'04 / DOOR AND FIRST-HARM GEOGRAPHY',3.6,'bold'));
sections.push(T(20,221,'North door x4800–7200, centre6000; water axis6600. Support survives every carrier release.',2.9),T(20,230,'Open near-level door: walking plane0 is a water entry route; closed-doorset lowest joint UNKNOWN.',2.9),T(20,239,'Stormguard confirms drain/fixing holes; its weather claim supplies no installed flood datum.',2.9),T(20,248,'Separate lid at−310..−318 is a potential escape joint if secondary containment fills.',2.9),T(20,257,'Actual lowest threshold/end/weep joint and complete tray/lid penetration integrity remain unaccepted.',2.9),T(20,266,'Inherited100/300rise fails: final outlet−580.5 is130.5 below its synthetic−450 receiver.',2.9,'bold','#9f4534'));
const site=[];
site.push(T(20,45,'05 / ONE RAISED-PLINTH COMPARATOR, WITH ITS PLOT COST',3.8,'bold'));
const SX=x=>25+x/100,SY=z=>130-z/100;
site.push(P([[SX(0),SY(-1300)],[SX(28000),SY(0)],[SX(28000),SY(0)]],'#3e7475',1),L(SX(0),SY(-1300),SX(29000),SY(-1300),'#9f865e',.6,'3 1'));
site.push(T(25,102,'Principal approach:26000 horizontal at1:20 rises1300; landings/turns are additional.',3.1),T(25,112,'Grade and path are authored comparison datums, not a surveyed plot or access approval.',2.9));
site.push(T(SX(0),SY(-1300)+7,'arrival−1300',2.8),T(SX(24000),SY(0)-4,'houseFFL0',2.8));
site.push(T(20,165,'Accepted synthetic floor/grade150 → proposed1300: whole-house rise1150.',3.1),T(20,175,'All storeys, eaves and roof move1150 relative fixed exterior grade; internal stair heights stay.',3.1),T(20,185,'Actual eaves/ridge heights, street scale, planning limit and neighbouring levels need a real site.',2.9),T(20,195,'The26m straight route is deliberately expensive; a switchback spends landings, width and view.',2.9),T(20,205,'Garden doors also need a terrace or actual graded route; no1300 step is silently accepted.',2.9),T(20,215,'RWT must still calculate assigned rain, operating head and independent event-bound receivers.',2.9),T(20,225,'The existing−75 crest is only activation geometry; it does not prove operating water below harm.',2.9),T(20,240,'Decision: develop this one full-depth comparator; no adopted house or site claim.',3.4,'bold'),T(20,253,'The constructive section spends depth and plot length honestly; it retains explicit door/material holds.',3.0));
const files={'court-b-joined.json':JSON.stringify(ledger,null,2)+'\n','court-b-joined-plans.svg':page('COMPACT B / COURT PASSAGES IN OCCUPIED AND MAINTENANCE STATES','Source-bound B9300 spine / actual pantry door / fixed table / finite chair removal',plans),'court-b-joined-sections.svg':page('COMPACT B / FULL DEPTH AND FIRST-HARM BOUNDARY','D1300 sole constructive trial / independent carrier and containment / no material or water acceptance',sections),'court-b-joined-site.svg':page('COMPACT B / RAISED WHOLE HOUSE AND APPROACH COST','D1300 = authored reference design, not available site head',site)};
for(const [name,body]of Object.entries(files)){const url=new URL(name,import.meta.url);if(process.argv.includes('--check'))assert(readFileSync(url,'utf8')===body,'Stale joined B drawing '+name);else writeFileSync(url,body)}
console.log(JSON.stringify({files:Object.keys(files),minBodyReserve:minBody,governing,furnitureTranslations:moves.length,rawSoilClearance:levels.rawClearance,trial:'D1300, not adopted'}));
