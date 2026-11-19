/** Recovered 20-state native upper bridge motion, source-derived only.
 * The heavy original loop is reduced to streaming minima rather than
 * retaining millions of probe records; its exact geometry and deduction
 * formulae are preserved. Not a physical rig or selected-house adoption.
 */
import {segmentBoxDistance,segmentDistance} from './service-interface-geometry.mjs';
import {fileURLToPath} from 'node:url';
const dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const mix=(a,b,t)=>a.map((v,i)=>v+t*(b[i]-v));
const B=[[0,0,0],[0,0,90],[120,160,90],[120,160,90],[120,260,90],[120,380,90],[120,410,90],
 [120,605,90],[120,605,-15],[120,605,-15],[625,605,-15],[680,605,-15],[1040,605,-15],
 [1040,605,-15],[1950,605,-15],[2000,605,-15],[2000,430,-15],[2320,430,-15],[2818,430,-15],[2818,430,-103]];
const fork={west:[10335,3900,2064,100,140,99],east:[10835,3900,2064,100,140,99]};
const fixed={...fork,westPost:[10100,3800,20,80,80,2024],westBase:[10070,3770,0,140,140,20],
 eastPlate:[11000,3760,2003,160,47,200]};
const arms=[{id:'westArm',a:[10140,3840,2064],b:[10385,3970,2064]},
 {id:'eastArm',a:[11100,3797,2064],b:[10885,3970,2064]}];
const armFrames=arms.map(a=>{
 const L=dist(a.a,a.b),ux=(a.b[0]-a.a[0])/L,uy=(a.b[1]-a.a[1])/L;
 return {...a,L,ux,uy,box:[0,-20,2044,L,40,40],point:p=>[(p[0]-a.a[0])*ux+(p[1]-a.a[1])*uy,-(p[0]-a.a[0])*uy+(p[1]-a.a[1])*ux,p[2]]};
});
const min=r=>r.reduce((a,b)=>a.gap<b.gap?a:b,{gap:Infinity});
const pointBox=(p,q)=>Math.hypot(...p.map((v,i)=>Math.max(q[i]-v,v-q[i]-q[i+3],0)));
function boxSweep(box,a,b,fixedBox){
 const half=box.slice(3).map(v=>v/2),centre=box.slice(0,3).map((v,i)=>v+half[i]);
 const q=[...fixedBox.slice(0,3).map((v,i)=>v-half[i]),...fixedBox.slice(3).map((v,i)=>v+2*half[i])];
 return segmentBoxDistance(centre.map((v,i)=>v+a[i]),centre.map((v,i)=>v+b[i]),q);
}
function boxArm(box,a,b,f){
 const h=box.slice(3).map(v=>v/2),c=box.slice(0,3).map((v,i)=>v+h[i]);
 const hh=[Math.abs(f.ux)*h[0]+Math.abs(f.uy)*h[1],Math.abs(f.uy)*h[0]+Math.abs(f.ux)*h[1],h[2]];
 const q=[...f.box.slice(0,3).map((v,i)=>v-hh[i]),...f.box.slice(3).map((v,i)=>v+2*hh[i])];
 return segmentBoxDistance(f.point(c.map((v,i)=>v+a[i])),f.point(c.map((v,i)=>v+b[i])),q);
}
const parts=[];
for(const[side,x]of [['west',10195],['east',11075]]){
 parts.push({id:side+'Strut',box:[x+21,3960,1191,18,20,884]});
 parts.push({id:side+'Shoulder',box:[x+20,3952,1185,20,36,6]});
 parts.push({id:side+'Actuator',box:[x+12.5,3958,1705,8,12,370]});
 for(const z of [1730,1750])parts.push({id:side+'Cleat'+z,box:[x+12.5,3950,z-5,26.5,10,10]});
}
for(const[side,x]of [['west',10385],['east',10885]])parts.push({id:side+'Heel',box:[x-38,3952,2108,76,36,36.68217893672365]});
const partsChecks=[],nativeCaptureChecks=[];
// Native shoe/heel extraction from its own fitted fork is checked by the
// separate throat/pin/vertical-lift contract. All lower solid parts are tested
// even during that lift; no exemption removes a moving strut/arm collision.
for(let i=1;i<B.length;i++)for(const part of parts){
 for(const[id,q]of Object.entries(fixed)){if(i===1&&part.id===id+'Heel')continue;partsChecks.push({phase:i,part:part.id,fixed:id,gap:boxSweep(part.box,B[i-1],B[i],q)});}
 for(const arm of armFrames){
  const row={phase:i,part:part.id,fixed:arm.id,gap:boxArm(part.box,B[i-1],B[i],arm)};
  if(i===1&&part.id===arm.id.replace('Arm','Heel'))nativeCaptureChecks.push(row);
  else partsChecks.push(row);
 }
}
// Keep only the governing rows. The original private prototype appended every
// arc/time/obstacle sample, which exhausts memory on an ordinary CI worker.
let pipeMinimum={gap:Infinity},pipeSamples=0;
const pipeMinByFixed=new Map();
function registerPipe(row){
  pipeSamples++;
  if(row.gap<pipeMinimum.gap)pipeMinimum=row;
  const old=pipeMinByFixed.get(row.fixed);
  if(!old||row.gap<old.gap)pipeMinByFixed.set(row.fixed,row);
}
const arc=[];
for(let k=0;k<=180;k++){
 const a=k*Math.PI/360;
 arc.push([10270-75*Math.cos(a),3970,2075+75*Math.sin(a)]);
 arc.push([11000+75*Math.cos(a),3970,2075+75*Math.sin(a)]);
}
const arcPointError=75*Math.sin(Math.PI/720);
for(let i=2;i<B.length;i++){
 const a=B[i-1],b=B[i],N=Math.max(100,Math.ceil(dist(a,b)/2)),motionPenalty=dist(a,b)/(2*N);
 for(let k=0;k<=N;k++){
  const t=mix(a,b,k/N);
  const crown=[[10270+t[0],3970+t[1],2150+t[2]],[11000+t[0],3970+t[1],2150+t[2]]];
  for(const[id,q]of Object.entries(fixed)){
   registerPipe({phase:i,fixed:id,part:'crownR37',gap:segmentBoxDistance(...crown,q)-37-motionPenalty});
   // The lower ends and long vertical legs are bare during this operation;
   // R23 bounds bare pipe plus its vertical shoe. Metal carriers are above.
   for(const x of [10195,11075])registerPipe({phase:i,fixed:id,part:'bareLegAndVerticalShoeR23',gap:segmentBoxDistance([x+t[0],3970+t[1],1040+t[2]],[x+t[0],3970+t[1],2084+t[2]],q)-23-motionPenalty});
   for(const p of arc)registerPipe({phase:i,fixed:id,part:'bareElbowAndShoeR32',gap:pointBox(p.map((v,j)=>v+t[j]),q)-32-motionPenalty-arcPointError});
  }
  for(const arm of armFrames){
   for(const x of [10195,11075])registerPipe({phase:i,fixed:arm.id,part:'bareLegAndVerticalShoeR23',gap:segmentBoxDistance(arm.point([x+t[0],3970+t[1],1040+t[2]]),arm.point([x+t[0],3970+t[1],2084+t[2]]),arm.box)-23-motionPenalty});
   registerPipe({phase:i,fixed:arm.id,part:'crownR37',gap:segmentBoxDistance(...crown.map(arm.point),arm.box)-37-motionPenalty});
   for(const p of arc)registerPipe({phase:i,fixed:arm.id,part:'bareElbowAndShoeR32',gap:pointBox(arm.point(p.map((v,j)=>v+t[j])),arm.box)-32-motionPenalty-arcPointError});
  }
 }
}
const minimaByFixed=r=>Object.fromEntries([...new Set(r.map(x=>x.fixed))].map(id=>[id,min(r.filter(x=>x.fixed===id))]));
const oldFork=[10220,3920,2113,100,100,50];
const oldCollision=segmentBoxDistance([10195,3970,2140],[10315,4130,2140],oldFork)-37;
const result={status:'NOMINAL_CONTINUOUS_CAPTURE_SWEEP',states:B,requiredMM:25,
 partsMinimum:min(partsChecks),partsByFixed:minimaByFixed(partsChecks),pipeMinimum,pipeByFixed:Object.fromEntries(pipeMinByFixed),pipeSamplesChecked:pipeSamples,
 nativeHeelToOwnArmDuringGuidedCapture:nativeCaptureChecks,
 retainedFailedOldCatchGap:oldCollision,
 method:'Exact convex segment/AABB distance for moving carrier solids. Arms use their real oriented40x40 cross-section, with conservative rotated carrier AABB. Pipe motion samples at<=2mm travel with half-step deduction; arc samples0.5degree with chord-neighbour deduction. The bare elbows and loadedR23/+9mm shoes fitR32; the central insulated crown remainsR37; the true contoured heels are separately bounded by76x36x36.683mm solids. Strut, shoulder and actuator are also explicit moving solids.',
 motionAllowance:{fixture:6,fabrication:.5,carryElastic:250*249**3/(3*200000*(20*18**3/12))+500*249/(200000*18*20),remainingMetal:32.8-6-.5-(250*249**3/(3*200000*(20*18**3/12))+500*249/(200000*18*20))},
 scope:'Own fitted shoe-to-fork guided lift is a native1mm fit, not a remote25mm gap. The separate first-capture module proves that native throat, pins,20mm jack travel and35mm final heel clearance. All other moving metal remains included.'};
export const bridgeNativeMotionResult=result;
if(process.argv[1]===fileURLToPath(import.meta.url)){
  console.log(JSON.stringify({
    status:result.status,pipeMinimum,partsMinimum:result.partsMinimum,
    pipeSamplesChecked:pipeSamples,retainedFailedOldCatchGap:oldCollision,
    motionAllowance:result.motionAllowance,
  },null,2));
}
