/** Exterior-access trial; nominal geometry only, no equipment or capacity admission. */
import assert from 'node:assert/strict';
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0), sub=(a,b)=>a.map((v,i)=>v-b[i]),add=(a,b)=>a.map((v,i)=>v+b[i]),scale=(a,t)=>a.map(v=>v*t);
function gap(a,b,r,z){const lo=[r[0],r[1],z[0]],hi=[r[0]+r[2],r[1]+r[3],z[1]],d=sub(b,a),cuts=[0,1];for(let k=0;k<3;k++)if(d[k])for(const face of [lo[k],hi[k]]){let t=(face-a[k])/d[k];if(t>0&&t<1)cuts.push(t);}cuts.sort((a,b)=>a-b);let best=Infinity;const f=t=>a.reduce((q,n,k)=>q+Math.max(lo[k]-n-d[k]*t,n+d[k]*t-hi[k],0)**2,0);for(let i=1;i<cuts.length;i++){let l=cuts[i-1],u=cuts[i],m=(l+u)/2,A=0,B=0;for(let k=0;k<3;k++){let p=a[k]+d[k]*m;if(p<lo[k]||p>hi[k]){let q=a[k]-(p<lo[k]?lo[k]:hi[k]);A+=d[k]**2;B+=2*q*d[k];}}let t=A?Math.max(l,Math.min(u,-B/(2*A))):m;best=Math.min(best,f(l),f(u),f(t));}return Math.sqrt(best);}
const rectgap=(x,y,b)=>Math.hypot(Math.max(b[0]-x,x-b[0]-b[3],0),Math.max(b[1]-y,y-b[1]-b[4],0));

function segSeg(p1,q1,p2,q2){let d1=sub(q1,p1),d2=sub(q2,p2),r=sub(p1,p2),a=dot(d1,d1),e=dot(d2,d2),f=dot(d2,r),s=0,t=0;if(a<1e-9&&e<1e-9)return Math.hypot(...r);if(a<1e-9)t=Math.max(0,Math.min(1,f/e));else{let c=dot(d1,r);if(e<1e-9)s=Math.max(0,Math.min(1,-c/a));else{let b=dot(d1,d2),den=a*e-b*b;if(den!==0)s=Math.max(0,Math.min(1,(b*f-c*e)/den));t=(b*s+f)/e;if(t<0){t=0;s=Math.max(0,Math.min(1,-c/a));}else if(t>1){t=1;s=Math.max(0,Math.min(1,(b-c)/a));}}}return Math.hypot(...sub(add(p1,scale(d1,s)),add(p2,scale(d2,t))));}

const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const axisBox=b=>({axes:[[1,0,0],[0,1,0],[0,0,1]],v:[0,b[3]].flatMap(x=>[0,b[4]].flatMap(y=>[0,b[5]].map(z=>[b[0]+x,b[1]+y,b[2]+z])))});
function leafBox(L,b){return {axes:[L.u,L.n,[0,0,1]],v:[b[0],b[1]].flatMap(x=>[b[2],b[3]].flatMap(y=>[b[4],b[5]].map(z=>L.P(x,y,z))))};}
function sat(A,B){let v=-Infinity;for(let a of [...A.axes,...B.axes,...A.axes.flatMap(x=>B.axes.map(y=>cross(x,y)))]){let n=Math.hypot(...a);if(n<1e-8)continue;a=scale(a,1/n);let p=A.v.map(x=>dot(x,a)),q=B.v.map(x=>dot(x,a));v=Math.max(v,Math.min(...p)-Math.max(...q),Math.min(...q)-Math.max(...p));}return v;}
// Plan: north is +Y. Walking surface Z1200; underside Z1150.
const guardRails=[['front toe',[900,12190,1200,1800,20,150]],['front mid',[900,12190,1740,1800,20,20]],['front top',[900,12190,2290,1800,20,20]],['left post',[900,12190,1200,20,20,1110]],['right post',[2680,12190,1200,20,20,1110]],['left mid',[900,12200,1740,20,800,20]],['right mid',[2680,12200,1740,20,800,20]],['left top',[900,12200,2290,20,800,20]],['right top',[2680,12200,2290,20,800,20]],['rear mid',[900,12990,1740,1800,20,20]],['rear top',[900,12990,2290,1800,20,20]]];
const struts=[[1530,10950,1080,40,2250,40],[2030,10950,1080,40,2250,40]];
const deck=[900,12200,1150,1800,800,50];
assert.equal(deck[2]-(1080+40),30);
let leastArm=Infinity,leastTool=Infinity,leastOwn=Infinity,leastBody=Infinity,maxReach=0;
// Two fasteners through each guard-side arm and eight separate root nuts;
// front tool heads move out 30 during release, all at 2000 or 2100.
for(const x of [1230,1270,1375,2225,2330,2370])for(const z of [2000,2100])for(let i=0;i<=30;i++){
 const y=12040+i, shoulder=[x,12320,2250], grip=[x,y+100,z], body=[x,12520], end=add(grip,scale(sub(shoulder,grip),70/Math.hypot(...sub(shoulder,grip))));
 maxReach=Math.max(maxReach,Math.hypot(...sub(shoulder,grip)));
 let own=Math.min(segSeg(shoulder,end,[x,y+4,z],[x,y+60,z])-44,segSeg(shoulder,end,[x,y+60,z],[x,y+100,z])-60);leastOwn=Math.min(leastOwn,own);
 for(const[,b]of guardRails){leastArm=Math.min(leastArm,gap(shoulder,grip,[b[0],b[1],b[3],b[4]],[b[2],b[2]+b[5]])-40);leastTool=Math.min(leastTool,gap([x,y+4,z],[x,y+60,z],[b[0],b[1],b[3],b[4]],[b[2],b[2]+b[5]])-4,gap([x,y+60,z],[x,y+100,z],[b[0],b[1],b[3],b[4]],[b[2],b[2]+b[5]])-20);if(b[2]<2500&&b[2]+b[5]>1200)leastBody=Math.min(leastBody,rectgap(...body,b)-300);}
}
assert(Math.min(leastArm,leastTool,leastOwn,leastBody)>.5&&maxReach+.5<600);
// Independent 40 mm struts pass the 88 mm gaps throughout outward translation.
const strutSideGap=Math.min(1530-1506,1594-1570,2030-2006,2094-2070);
const bottomGap=1080-960, outerFrameGap=1530-1410, jambHeadroom=1375-6-1327;
assert.equal(strutSideGap,24);assert.equal(bottomGap,120);assert.equal(outerFrameGap,120);assert.equal(jambHeadroom,42);
// Opening is free of permanent receiver stubs: plate/anchors occupy x1210..1290 and 2310..2390.
assert(1290<1300&&2310>2300);
console.log(JSON.stringify({platform:{deck,deckToStrut:30,workerBodyLower:leastBody-.5,armLower:leastArm-.5,toolLower:leastTool-.5,ownForearmLower:leastOwn-.5,reachUpper:maxReach+.5},guardWithdrawal:{strutSideGap,bottomGap,outerFrameGap,jambHeadroom,translationMinimum:13210-11840},scope:'Proxy only: full platform model, travel, exterior rig, load, guard/standoff engagement, weather collar, roof and ground must still be checked.'},null,2));
// After the guard screws have disengaged by 30, withdraw complete brackets.
// A 14×14 clearance bore surrounds each 12×12 conservative anchor shaft.
let bore=Infinity,standoffOther=Infinity,wall=Infinity,guardContact=Infinity;
for(const side of [-1,1])for(const z of[2000,2100]){
 const lo=side<0?1210:2310,hi=lo+80, studs=side<0?[1230,1270]:[2330,2370], tubeX=side<0?1362.5:2212.5;
 const chunks=[];let cur=lo;for(const x of studs){chunks.push([cur,12000,z-50,x-7-cur,30,100]);chunks.push([x-7,12000,z-50,14,30,43],[x-7,12000,z+7,14,30,43]);cur=x+7;}chunks.push([cur,12000,z-50,hi-cur,30,100]);
 const arm=side<0?[1250,12010,z-10,137.5,20,20]:[2212.5,12010,z-10,137.5,20,20],tube=[tubeX,11870,z-12.5,25,160,25],bolt=[tubeX+6.5,11870,z-6,12,200,12];
 const moving=[...chunks,arm,tube,bolt], anchors=studs.map(x=>[x-6,12000,z-6,12,40,12]), column=side<0?[1360,11840,910,50,30,1840]:[2190,11840,910,50,30,1840], wallBox=side<0?[-1000,11570,0,2327,430,3100]:[2273,11570,0,2000,430,3100];
 for(let n=0;n<=100;n++){for(const p of moving){const moved=[p[0],p[1]+n,p[2],p[3],p[4],p[5]];wall=Math.min(wall,sat(axisBox(moved),axisBox(wallBox)));guardContact=Math.min(guardContact,sat(axisBox(moved),axisBox(column)));for(const q of struts)standoffOther=Math.min(standoffOther,sat(axisBox(moved),axisBox(q)));}for(const p of chunks){const moved=[p[0],p[1]+n,p[2],p[3],p[4],p[5]];for(const q of anchors)bore=Math.min(bore,sat(axisBox(moved),axisBox(q)));}}
}
assert(bore>=1-1e-9&&standoffOther>0&&wall>=0&&guardContact>=0);
console.log(JSON.stringify({bracketWithdrawalMm:100,anchorBoreGap:bore,guardContact,wallContact:wall,strutGap:standoffOther,scope:'Screw and root-nut removal, holes and straight withdrawal only; shared rig, load and capture interactions remain unmodeled.'}));
