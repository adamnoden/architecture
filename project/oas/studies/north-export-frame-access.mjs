/** Authored occurrence-access trials; dimensional proxy screens only, not equipment, strength or product approval. Run from repository root. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
function pinned(path,sha){const b=execFileSync('git',['show','e93c643d36dfb0ee72a2bd2035899dfc5cc94f74:'+path]);const h=createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');assert.equal(h,sha);return JSON.parse(b);}
const H=pinned('project/had/studies/open-north-loggia.json','25faad2c4d40df2b7da7212f73808843a88d2f52');
const S=pinned('project/mat/studies/whole-house-service-baseline.json','2d8f7243fb87d350763f2bca3d103b89b9d14b7d');
const fixtures=Object.entries(H.upperFurniture).filter(([id])=>id.startsWith('rear-')).map(([id,r])=>[id,[r[0],r[1],0,r[2],r[3],id==='rear-shower1000'?250:3100]]);
const rad=S.interfaces.architecturalServices.emitters.find(e=>e.id==='rear-N'); fixtures.push(['radiator',[...rad.completePlanWithValvesAndBrackets.slice(0,2),rad.bottomLocal,...rad.completePlanWithValvesAndBrackets.slice(2),rad.topLocal-rad.bottomLocal]]);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0), sub=(a,b)=>a.map((v,i)=>v-b[i]),add=(a,b)=>a.map((v,i)=>v+b[i]),scale=(a,t)=>a.map(v=>v*t);
function gap(a,b,r,z){const lo=[r[0],r[1],z[0]],hi=[r[0]+r[2],r[1]+r[3],z[1]],d=sub(b,a),cuts=[0,1];for(let k=0;k<3;k++)if(d[k])for(const face of [lo[k],hi[k]]){let t=(face-a[k])/d[k];if(t>0&&t<1)cuts.push(t);}cuts.sort((a,b)=>a-b);let best=Infinity;const f=t=>a.reduce((q,n,k)=>q+Math.max(lo[k]-n-d[k]*t,n+d[k]*t-hi[k],0)**2,0);for(let i=1;i<cuts.length;i++){let l=cuts[i-1],u=cuts[i],m=(l+u)/2,A=0,B=0;for(let k=0;k<3;k++){let p=a[k]+d[k]*m;if(p<lo[k]||p>hi[k]){let q=a[k]-(p<lo[k]?lo[k]:hi[k]);A+=d[k]**2;B+=2*q*d[k];}}let t=A?Math.max(l,Math.min(u,-B/(2*A))):m;best=Math.min(best,f(l),f(u),f(t));}return Math.sqrt(best);}
const rectgap=(x,y,b)=>Math.hypot(Math.max(b[0]-x,x-b[0]-b[3],0),Math.max(b[1]-y,y-b[1]-b[4],0));
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const axisBox=b=>({axes:[[1,0,0],[0,1,0],[0,0,1]],v:[0,b[3]].flatMap(x=>[0,b[4]].flatMap(y=>[0,b[5]].map(z=>[b[0]+x,b[1]+y,b[2]+z])))});
function leafBox(L,b){return {axes:[L.u,L.n,[0,0,1]],v:[b[0],b[1]].flatMap(x=>[b[2],b[3]].flatMap(y=>[b[4],b[5]].map(z=>L.P(x,y,z))))};}
function sat(A,B){let v=-Infinity;for(let a of [...A.axes,...B.axes,...A.axes.flatMap(x=>B.axes.map(y=>cross(x,y)))]){let n=Math.hypot(...a);if(n<1e-8)continue;a=scale(a,1/n);let p=A.v.map(x=>dot(x,a)),q=B.v.map(x=>dot(x,a));v=Math.max(v,Math.min(...p)-Math.max(...q),Math.min(...q)-Math.max(...p));}return v;}
function segSeg(p1,q1,p2,q2){let d1=sub(q1,p1),d2=sub(q2,p2),r=sub(p1,p2),a=dot(d1,d1),e=dot(d2,d2),f=dot(d2,r),s=0,t=0;if(a<1e-9&&e<1e-9)return Math.hypot(...r);if(a<1e-9)t=Math.max(0,Math.min(1,f/e));else{let c=dot(d1,r);if(e<1e-9)s=Math.max(0,Math.min(1,-c/a));else{let b=dot(d1,d2),den=a*e-b*b;if(den!==0)s=Math.max(0,Math.min(1,(b*f-c*e)/den));t=(b*s+f)/e;if(t<0){t=0;s=Math.max(0,Math.min(1,-c/a));}else if(t>1){t=1;s=Math.max(0,Math.min(1,(b-c)/a));}}}return Math.hypot(...sub(add(p1,scale(d1,s)),add(p2,scale(d2,t))));}
// The candidate has four side fastener levels and three head fasteners.
// A jamb/head-only fastener schedule is a design duty, not a capacity claim.
const tasks=[];
for(const [side,bx,x,lo,hi] of [['W',1100,1360,650,1450],['E',2500,2240,2150,2950]])for(const z of [1100,1500,2000,2400])tasks.push({side,bx,x,z,lo,hi,deck:z-1100});
for(const [x,z] of [[1600,2745],[1800,2785],[2000,2745]])tasks.push({side:'HEAD',bx:1800,x,z,lo:1000,hi:2600,deck:z-1100});
const rawR=(500**2+300**2)/600,cz0=2850-rawR;for(const t of tasks.filter(t=>t.side==='HEAD')){const dx=t.x-1800,outer=cz0+Math.sqrt((rawR-35)**2-dx**2),inner=cz0+Math.sqrt((rawR-95)**2-dx**2);assert(t.z<outer&&t.z>inner);}
const anchors=[1230,1270,2330,2370].flatMap(x=>[2000,2100].map(z=>[x-6,12000,z-6,12,40,12]));
const struts=[[1530,10950,1080,40,2250,40],[2030,10950,1080,40,2250,40]];
let arm=Infinity,tool=Infinity,own=Infinity,body=Infinity,platformStrut=Infinity,platformAnchor=Infinity,reach=0,reveal=Infinity;
for(const t of tasks){const d=t.deck,rails=[[t.lo,12240,d, t.hi-t.lo,20,150],[t.lo,12240,d+540,t.hi-t.lo,20,20],[t.lo,12240,d+1090,t.hi-t.lo,20,20],[t.lo,12240,d,20,20,1110],[t.hi-20,12240,d,20,20,1110],[t.lo,12250,d+1090,20,800,20],[t.hi-20,12250,d+1090,20,800,20],[t.lo,12250,d+540,20,800,20],[t.hi-20,12250,d+540,20,800,20],[t.lo,13040,d+540,t.hi-t.lo,20,20],[t.lo,13040,d+1090,t.hi-t.lo,20,20],[t.lo,13040,d,20,20,1110],[t.hi-20,13040,d,20,20,1110]],deck=[t.lo,12250,d-50,t.hi-t.lo,800,50];
 for(const p of [deck,...rails]){for(const q of struts)platformStrut=Math.min(platformStrut,sat(axisBox(p),axisBox(q)));for(const q of anchors)platformAnchor=Math.min(platformAnchor,sat(axisBox(p),axisBox(q)));}
 const shoulder=[t.bx,12370,d+1470],B=[t.bx,12570];
 for(const p of rails)if(p[2]<d+1800&&p[2]+p[5]>d)body=Math.min(body,rectgap(...B,p)-300);
 for(let n=0;n<=30;n++){const y=11710+n,grip=[t.x,y+350,t.z],L=Math.hypot(...sub(shoulder,grip)),end=add(grip,scale(sub(shoulder,grip),70/L));reach=Math.max(reach,L);own=Math.min(own,segSeg(shoulder,end,[t.x,y+4,t.z],[t.x,y+290,t.z])-44,segSeg(shoulder,end,[t.x,y+290,t.z],[t.x,y+350,t.z])-60);
 for(const p of [...rails,...struts,...anchors,[-1000,11570,-1000,2327,430,6000],[2273,11570,-1000,2000,430,6000]]){let ag=gap(shoulder,grip,[p[0],p[1],p[3],p[4]],[p[2],p[2]+p[5]])-40;arm=Math.min(arm,ag);tool=Math.min(tool,gap([t.x,y+4,t.z],[t.x,y+290,t.z],[p[0],p[1],p[3],p[4]],[p[2],p[2]+p[5]])-4,gap([t.x,y+290,t.z],[t.x,y+350,t.z],[p[0],p[1],p[3],p[4]],[p[2],p[2]+p[5]])-20);}
 }
 // Clear finished reveal inset27 at z up to its circular arch; max tool radius20.
 let dx=Math.abs(t.x-1800),r=500**2/600+300**2/600-27,cz=2850-(500**2+300**2)/600;reveal=Math.min(reveal,473-dx-20,t.z-877-20,cz+Math.sqrt(r*r-dx*dx)-t.z-20);
}
assert(Math.min(arm,tool,own,body,platformStrut,platformAnchor,reveal)>.5&&reach+.5<600);
console.log(JSON.stringify({tasks:tasks.length,armLower:arm-.5,toolLower:tool-.5,ownArmLower:own-.5,bodyLower:body-.5,platformStrutLower:platformStrut,platformAnchorLower:platformAnchor,revealLower:reveal,reachUpper:reach+.5,scope:'Authored access proxies only; actual basket, travel, fixing and capture profile, roof, ground and capacity are not admitted.'},null,2));
// Conservative frame perimeter / four exterior-face capture pads, translated north.
// The rectangular head overbounds the curved head for strut/anchor checking only;
// the actual collar clearance remains the concentric 8 mm construction.
const perimeter=[[1335,11570,885,930,140,60],[1335,11570,945,60,140,1605],[2205,11570,945,60,140,1605],[1335,11570,2450,930,140,365]];
const pads=[1340,2210].flatMap(x=>[1250,2150].map(z=>[x,11710,z,50,30,100]));
let movingGap=Infinity,padGap=Infinity;
for(let n=0;n<=1640;n++){for(const p of perimeter){const m=[p[0],p[1]+n,p[2],p[3],p[4],p[5]];for(const q of [...struts,...anchors])movingGap=Math.min(movingGap,sat(axisBox(m),axisBox(q)));}for(const p of pads){const m=[p[0],p[1]+n,p[2],p[3],p[4],p[5]];for(const q of [...struts,...anchors])padGap=Math.min(padGap,sat(axisBox(m),axisBox(q)));}}
assert(movingGap>.5&&padGap>.5);assert.equal(11570+1640-13200,10);
console.log(JSON.stringify({frameTranslation:1640,backEdgeBeyondStruts:10,perimeterToStrutsAndAnchorLower:movingGap-.5,padsToStrutsAndAnchorLower:padGap-.5,rawFinishJoint:35-27,scope:'Nominal moving solids only; full capture, collar/gasket contact, hoist and actual tolerances remain unmodeled.'}));
