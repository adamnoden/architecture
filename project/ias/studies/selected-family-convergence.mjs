/** Joined interior convergence; architectural reference geometry, never installed performance. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=new URL('../../../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const hadCommit='a324a50d047843603d6fc275c4062bc9d0c1cb90',hadPath='project/had/studies/open-north-loggia.json';
let hadText;
try{hadText=execFileSync('git',['show',hadCommit+':'+hadPath],{cwd:root,encoding:'utf8'});}catch{throw Error('Missing immutable HAD input. Fetch with git fetch origin '+hadCommit+'; do not add a fake parent.');}
const blob=s=>createHash('sha1').update('blob '+Buffer.byteLength(s)+'\0').update(s).digest('hex');
assert.equal(blob(hadText),'1412e628aa6b539664c8f5efd507595623cf2a21');
const H=JSON.parse(hadText);
const pointGap=(p,r)=>Math.hypot(Math.max(r[0]-p[0],p[0]-r[0]-r[2],0),Math.max(r[1]-p[1],p[1]-r[1]-r[3],0));
const segmentGap=(a,b,r)=>{assert(a[0]===b[0]||a[1]===b[1]);return Math.hypot(Math.max(r[0]-Math.max(a[0],b[0]),Math.min(a[0],b[0])-r[0]-r[2],0),Math.max(r[1]-Math.max(a[1],b[1]),Math.min(a[1],b[1])-r[1]-r[3],0));};
function walls(ws){return ws.flatMap(w=>{const hor=w.a[1]===w.b[1],j=hor?0:1,k=1-j,lo=w.a[j],hi=w.b[j],at=w.a[k];const cuts=[lo,...w.holes.flat().filter(n=>n>lo&&n<hi),hi].sort((a,b)=>a-b);return cuts.slice(0,-1).flatMap((a,i)=>!w.holes.some(([l,u])=>a>=l&&cuts[i+1]<=u)?[[w.id,hor?[a,at-w.t/2,cuts[i+1]-a,w.t]:[at-w.t/2,a,w.t,cuts[i+1]-a]]]:[]);});}
const family={id:'IAS-FAM-27-01',status:'Authored joined27dry/30wet trial; awaiting incorporation in HAD geometry, not adopted',
 room:[9397,3800,2170.5,2600],cabinet:[9397,4675,600,750],bath:[9460,3800,1700,700],
 basin:[11227.5,5300,340,450],pan:[10777.5,5800,560,355],serviceBand:[11337.5,4500,230,1900],column:[11342.5,6180,180,180],
 door:{roughY:[5450,6350],maxCompleteAssemblyHeight:2250,leaf:[762,44],frameOuterWidth:825,outerPackingEach:37.5,frameEach:29,netY:[5516.5,6283.5],hinge:[9397,6279],handleFromHinge:612,handleNormalOffset:55,
   scope:'762 leaf and825 complete width are compatibility budgets, not a classified supplied doorset. Required E20 assembly and protected upper closure remain whole.'},
 firstOpenBody:[10400,5750],closedBody:[9950,5750],radius:300,armRadius:40,reachSensitivity:650,
 entry:[[8750,5800],[10050,5800],[10400,5750]],
 taskPaths:{WC:[[9950,5750],[10450,5750],[10450,5975]],basin:[[9950,5750],[10350,5750],[10350,5475],[10880,5475]],bath:[[9950,5750],[10450,5750],[10450,4820]],cabinet:[[9950,5750],[10350,5750],[10350,5300],[10350,5050]]},
 limits:['All frame/packing/joint/seal and2250 upper-closure budgets need a complete compatible protected assembly; no constituent is omitted.',
 'Selected controlled self-closing assembly must retain compatible closer/latch/seals; actual forces, certified dimensions, rescue/accessibility and physical operation remain unearned.',
 'The27dry face and30wet fixture rewinds are explicit design input requirements, not an independent adopted house.']};
// The approach is orthogonal; insert one explicit elbow rather than test only endpoints.
family.entry=[[8750,5840],[10400,5840],[10400,5750]];
const fixed=[...walls(H.upperWalls).filter(([id])=>!['wet-spine','family-bath-north','bed3-plant'].includes(id)),
 ['family-west-south',[9215,3785,182,5450-3785]],['family-west-north',[9215,6350,182,8167.5-6350]],
 ['south-jamb',[9215,5450,182,66.5]],['north-jamb',[9215,6283.5,182,66.5]],
 ['family-north',[9397,6400,2170.5,185]],['family-south',[9397,3615,2170.5,185]],['family-east',[11567.5,3800,432.5,2600]],
 ['cabinet',family.cabinet],['bath',family.bath],['basin',family.basin],['WC',family.pan],['serviceBand',family.serviceBand],['soilColumn',family.column]];
// Keep actual imported wall pieces except duplicate old family edges/fixtures; check the local family in full.
const localFixed=fixed.filter(([id,r])=>!['bath-plant','bed3-north-main','bed3-north-east','wet-spine','family-bath-north','bed3-plant'].includes(id));
function pointSegment(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);}
const angle=t=>-Math.PI/2*t;
function leaf(t){const a=angle(t),u=[Math.cos(a),Math.sin(a)],n=[-u[1],u[0]],h=family.door.hinge,L=762,T=44;return [[0,0],[L,0],[L,T],[0,T]].map(([x,y])=>[h[0]+x*u[0]+y*n[0],h[1]+x*u[1]+y*n[1]]);}
function polygonGap(p,poly){let pos=false,neg=false;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],c=(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);pos||=c>1e-8;neg||=c< -1e-8;}if(!(pos&&neg))return 0;return Math.min(...poly.map((a,i)=>pointSegment(p,a,poly[(i+1)%poly.length])));}
function body(t){return family.firstOpenBody;}
function hand(t){const a=angle(t),u=[Math.cos(a),Math.sin(a)],n=[-u[1],u[0]],s=t<1/3?-55:99;return [9397+612*u[0]+s*n[0],6279+612*u[1]+s*n[1]];}
function segmentsGap(a,b,c,d){
 const cross=(u,v,w)=>(v[0]-u[0])*(w[1]-u[1])-(v[1]-u[1])*(w[0]-u[0]);
 const z=[cross(a,b,c),cross(a,b,d),cross(c,d,a),cross(c,d,b)];
 if(z[0]*z[1]<=0&&z[2]*z[3]<=0)return 0;
 return Math.min(pointSegment(a,c,d),pointSegment(b,c,d),pointSegment(c,a,b),pointSegment(d,a,b));
}
function armGap(b,g,p){return Math.min(...p.map((a,i)=>segmentsGap(b,g,a,p[(i+1)%p.length])))-40;}
const steps=3000;let armAt=0;let minArm=Infinity,minFixed=Infinity,minLeaf=Infinity,maxReach=0;
for(let i=0;i<=steps;i++){const t=i/steps,b=body(t),p=leaf(t),g=hand(t);if(armGap(b,g,p)<minArm){minArm=armGap(b,g,p);armAt=t;}minFixed=Math.min(minFixed,...localFixed.map(([,r])=>pointGap(b,r)-300));minLeaf=Math.min(minLeaf,polygonGap(b,p)-300);maxReach=Math.max(maxReach,Math.hypot(b[0]-g[0],b[1]-g[1]));}
const bodyBound=0,leafBound=Math.hypot(762,44)*Math.PI/2/(2*steps);
const coupling={sampleIntervals:steps,openReleaseStraightArmReserve:armGap(body(0),hand(0),leaf(0)),openReleaseReach:Math.hypot(...body(0).map((n,i)=>n-hand(0)[i])),minimumFixedSample:minFixed,minimumLeafSample:minLeaf,bodyHalfStepBound:bodyBound,leafHalfStepBound:leafBound,minimumFixedLowerBound:minFixed-bodyBound,minimumLeafLowerBound:minLeaf-bodyBound-leafBound,
 operation:'Enter with the complete closer-supported door OPEN; release the exposed outer handle at the waiting station; let the selected controlled closer shut/latch while the body waits outside the swept leaf; then walk to the closed-door task station. No mid-sweep regrip is selected.', rejectedPullControl:'A separate manual pull/regrip at30degrees had a13.604mm straight-arm collision despite clear body/reach; rejected.', armAndRegripAccepted:false, closerRequired:true, physicalForceAndCertifiedCompatibilityAccepted:false};
assert(coupling.minimumFixedLowerBound>=0,'Family coupled body hits fixed boundary');assert(coupling.minimumLeafLowerBound>=0,'Family coupled body hits moving leaf');assert(coupling.openReleaseStraightArmReserve>=0);assert(Math.hypot(...family.firstOpenBody.map((n,i)=>n-hand(0)[i]))<=650,'OPEN release reach exceeds sensitivity');
const pathResult=(path,opened)=>{const p=leaf(opened?0:1),xs=p.map(v=>v[0]),ys=p.map(v=>v[1]);const obs=[...localFixed,['door-'+(opened?'OPEN':'CLOSED'),[Math.min(...xs),Math.min(...ys),Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys)]]];let min=Infinity,governor='';for(let i=1;i<path.length;i++)for(const [id,r]of obs){const d=segmentGap(path[i-1],path[i],r)-300;if(d<min){min=d;governor=id;}}return {path,minimumReserve:min,governor,passes:min>=0,doorState:opened?'OPEN':'CLOSED'};};
const paths={entry:pathResult(family.entry,true),afterClosure:pathResult([[10400,5750],[9950,5750]],false),...Object.fromEntries(Object.entries(family.taskPaths).map(([k,p])=>[k,pathResult(p,false)]))};
for(const [id,p]of Object.entries(paths))assert(p.passes,'Family route fails '+id+':'+p.governor+' '+p.minimumReserve);
const pushPath=JSON.parse(read('project/ias/studies/family-door-push-path.json'));
assert.equal(pushPath.length,361);
let pushFixed=Infinity,pushLeaf=Infinity,pushArm=Infinity,pushReach=0,pushStep=0;
for(let i=0;i<pushPath.length;i++){const t=1-i/360,p=leaf(t),a=angle(t),g=[9397+612*Math.cos(a)+55*Math.sin(a),6279+612*Math.sin(a)-55*Math.cos(a)],b=pushPath[i];
 pushFixed=Math.min(pushFixed,...localFixed.map(([,r])=>pointGap(b,r)-300));pushLeaf=Math.min(pushLeaf,polygonGap(b,p)-300);pushArm=Math.min(pushArm,armGap(b,g,p));pushReach=Math.max(pushReach,Math.hypot(b[0]-g[0],b[1]-g[1]));if(i)pushStep=Math.max(pushStep,Math.hypot(b[0]-pushPath[i-1][0],b[1]-pushPath[i-1][1]));}
const pushBound=pushStep/2,angularBound=Math.PI/2/720,gripBound=Math.hypot(612,55)*angularBound;
const push={bodyPath:pushPath,angleIntervals:360,fixedLower:pushFixed-pushBound,leafLower:pushLeaf-pushBound-Math.hypot(762,44)*angularBound,armLower:pushArm-pushBound-gripBound,reachUpper:pushReach+pushBound+gripBound,scope:'One authored ordinary push-open trajectory; spherical300 body, straight40-radius arm,650 reach sensitivity. No force/accessibility acceptance.'};
assert(push.fixedLower>0&&push.leafLower>0&&push.armLower>0&&push.reachUpper<=650,'Push continuity bound fails');
const transfer=pathResult([pushPath.at(-1),[10400,pushPath.at(-1)[1]],[10400,5750]],true);assert(transfer.passes);
coupling.delayRequirement='The complete compatible closer must provide a controlled OPEN dwell sufficient for hand withdrawal before sweep; an arbitrary moving-leaf pause is not assumed. Actual delay, withdrawal time, force and classification are admission requirements.';
const data={status:'In-progress interior selection; no whole-house, material or physical admission',source:{hadCommit,hadPath,hadBlob:blob(hadText),fetch:'git fetch origin '+hadCommit},family,paths,coupling,push,transfer};
const dest='project/ias/studies/selected-family-convergence.json',content=JSON.stringify(data,null,2)+'\n';if(process.argv.includes('--check'))assert.equal(read(dest),content);else writeFileSync(new URL(dest,root),content);
console.log(JSON.stringify({paths:Object.fromEntries(Object.entries(paths).map(([k,v])=>[k,v.minimumReserve])),coupling}));


const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
const X=x=>70+(x-8500)*.14,Y=y=>120+(y-3500)*.14;
let svg='<svg xmlns="http://www.w3.org/2000/svg" width="1189mm" height="841mm" viewBox="0 0 1189 841"><rect width="1189" height="841" fill="white"/><style>text{font-family:sans-serif;fill:#172735}.small{font-size:10px}.label{font-size:13px}</style><text x="32" y="35" font-size="24">IAS selected interior convergence — family wet-room operation</text><text x="32" y="58" class="label">Authored 27 dry / 30 wet candidate; immutable HAD a324 plus explicit local rewind. Not adopted or classified.</text>';
for(const [id,r]of localFixed){if(r[0]+r[2]<8500||r[0]>12000||r[1]+r[3]<3500||r[1]>6600)continue;svg+=`<rect x="${X(r[0])}" y="${Y(r[1])}" width="${r[2]*.14}" height="${r[3]*.14}" fill="${['bath','basin','WC','cabinet'].includes(id)?'#cce0e5':'#dedcd6'}" stroke="#64737b" stroke-width=".5"/>`;if(['bath','basin','WC','cabinet','soilColumn'].includes(id))svg+=`<text x="${X(r[0])+3}" y="${Y(r[1])+12}" class="small">${id}</text>`;}
for(const t of [0,.25,.5,.75,1])svg+=`<polygon points="${leaf(t).map(p=>X(p[0])+','+Y(p[1])).join(' ')}" fill="${t===0?'#368e9b':'none'}" stroke="#367988" stroke-width="1"/>`;
svg+=`<polyline points="${pushPath.map(p=>X(p[0])+','+Y(p[1])).join(' ')}" fill="none" stroke="#a26923" stroke-width="2"/><circle cx="${X(10400)}" cy="${Y(5750)}" r="42" fill="none" stroke="#228150" stroke-width="1.5"/>`;
for(const [id,v]of Object.entries(paths))svg+=`<polyline points="${v.path.map(p=>X(p[0])+','+Y(p[1])).join(' ')}" fill="none" stroke="#228150" stroke-width="1.5" stroke-dasharray="5 3"/>`;
const notes=['SELECTED: north-hinged 762 × 44 leaf; 825 complete frame budget within 900 rough.', 'Net 767; remaining 37.5 each side requires classified joint or supported mineral build-out.', 'Maximum 2250 COMPLETE doorset; independent applicable upper closure above.', '1 Push open: finite body/arm/handle path (amber), no force or accessibility proof.', '2 Move to green waiting circle with door controlled OPEN; withdraw hand.', '3 Compatible delayed controlled closer shuts/latches; body remains outside sweep.', '4 Walk to green task paths after CLOSED. Entry reserve23.5; tasks20–25 mm.', 'Pull/regrip negative control collided13.6 mm; it is not a universal impossibility result.', 'Closer delay/forces/maintenance/constituents are a new whole-assembly MAT duty.', '700-wide bath renewal and rear1000 tray still need their own supported handling proof.', 'Source15 → dry27 is a deliberate HAD-owned rewind, not an unchanged drop-in.'];
notes.forEach((n,i)=>svg+=`<text x="650" y="${150+i*32}" class="small">${esc(n)}</text>`);svg+='</svg>';
const sd='project/ias/studies/selected-family-convergence.svg';if(process.argv.includes('--check'))assert.equal(read(sd),svg);else writeFileSync(new URL(sd,root),svg);
