/** Finite hydrostatic stress comparison for this court's actual short graded entries.
 * Not a generic drainage solver; no rapid-variation, lateral-feed or physical admission.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readSelected} from './selected-water-event.mjs';
const g=9.81,n=.04,required=3.60375,quiet=-35;
const floor=y=>(-30-(y-5750)*.04)/1000;
function root(fn,lo,hi){
 assert(fn(lo)<=0&&fn(hi)>=0,'Finite inlet root leaves declared bracket');
 for(let i=0;i<40;i++){const z=(lo+hi)/2;if(fn(z)<0)lo=z;else hi=z;}
 return (lo+hi)/2;
}
function integrate(fn,a,b,N){
 const h=(b-a)/N;let sum=fn(a)+fn(b);
 for(let i=1;i<N;i++)sum+=(i%2?4:2)*fn(a+i*h);
 return sum*h/3;
}
function reduced(intervals,block){
 if(block==='uniform')return{intervals,f:.75};
 assert.equal(block,'deepestTotalQuarter');
 let remove=.25*intervals.reduce((s,[a,b])=>s+b-a,0);const out=[];
 for(const[a,b]of intervals.toReversed()){
  const drop=Math.min(remove,b-a);remove-=drop;if(b-drop>a)out.unshift([a,b-drop]);
 }
 return {intervals:out,f:1};
}
export function capacity(original,stage,lipK,block,lengthMm,N=64,{slope=.04,floorAt=floor,sectionAt,extraHead=()=>0}={}){
 assert(slope>0);
 const {intervals,f}=reduced(original,block);
 return intervals.reduce((total,[a,b])=>{
  const W=(b-a)/1000,low=floorAt(b),high=floorAt(a);
  const geometry=sectionAt?(z=>sectionAt(z,a,b,f)):z=>{
   const w=Math.max(0,Math.min(W,(z-low)/slope)),T=f*w,A=T*(z-low-slope*w/2);
   const P=Math.hypot(T,slope*w)+Math.max(0,z-low)+Math.max(0,z-high);
   return {A,T,P};
  };
  const trial=(zc,returnFlow=false)=>{
   const c=geometry(zc),Q=Math.sqrt(g*c.A**3/c.T),criticalVelocityHead=c.A/(2*c.T);
   const energy=z=>{const d=geometry(z);return z+(Q/d.A)**2/(2*g);};
   const exit=lipK===0?zc:root(z=>energy(z)-energy(zc)-lipK*criticalVelocityHead,zc,zc+.3);
   const dxdy=z=>{
    const d=geometry(z),Fr2=Q*Q*d.T/(g*d.A**3),Sf=n*n*Q*Q/(d.A*d.A*(d.A/d.P)**(4/3));
    return Math.max(0,1-Fr2)/Sf;
   };
   const upstream=root(z=>integrate(dxdy,exit,z,N)-lengthMm/1000,exit,exit+.3);
   return returnFlow?Q*1000:energy(upstream)+(1-lipK)*criticalVelocityHead+extraHead(Q)-stage/1000;
  };
  const zc=root(z=>trial(z),low+.00001,stage/1000);
  return total+trial(zc,true);
 },0);
}
const round=v=>Math.round(v*1e8)/1e8;
function cases(intervals,extended=false){
 const specs=[['uniform',0,100],['uniform',1,100],['deepestTotalQuarter',0,100],['deepestTotalQuarter',1,100]];
 if(extended)specs.push(['deepestTotalQuarter',0,150],['deepestTotalQuarter',0,200]);
 return specs.map(([block,lipK,lengthMm])=>{
  const q=capacity(intervals,quiet,lipK,block,lengthMm),stage=root(z=>capacity(intervals,z,lipK,block,lengthMm)-required,-50,-15);
  return {block,entranceK:1-lipK,lipK,lengthMm,remainingIntervals:reduced(intervals,block).intervals,
   remainingWidthFactor:reduced(intervals,block).f,quietCapacityLps:round(q),requiredStageMm:round(stage),
   quietReserveMm:round(quiet-stage),passesThisReference:q>=required};
 });
}
let memo;
export function review(){
 if(memo)return structuredClone(memo);
 const s=readSelected();assert.equal(s.model.hydraulicProbe.assignedInwardRoofAndCourtLps,required);
 const selected=[[6950,7175],[7275,7375]],rejected600=[[6811.5,7175],[7275,7375]];
 const singleNorth=[[6861.5,7350]];
 const sixRetained=[[6311.5,6525],[6625,6838.5],[6861.5,7197.5],[7247.5,7350]];
 const sixHungLatch=[[6311.5,6525],[6625,6838.5],[6861.5,7350]];
 memo={identity:'RWT-UNADOPTED-SHORT-INLET-REFERENCE-2026-11-06',
  source:{path:s.path,blob:s.blob,authority:s.authority,canonicalMain:s.canonicalMain,canonicalMainHadBlob:s.canonicalMainHadBlob,startingMain:'80c0f94148ad11e3b2eaa83c52e28d06238993ed'},
  selectedGeometryChanged:false,accepted:false,requiredLps:required,quietMm:quiet,
  fixedAssumptions:{n,totalK:1,gravity:g,transverseSlope:.04,SimpsonPanels:64,
   section:'Common horizontal water surface within EACH finite interval; actual4% transverse bed. A=T(eta−zlow−.02w), T=f*w, w=clamp((eta−zlow)/.04,0,W). Equivalent wetted perimeter hypot(T,.04w)+bothside depths; uniform suppression is an equivalent geometry, not actual debris.',
   control:'Critical Q²T/(gA³)=1; E=eta+Q²/(2gA²). Allocate totalK1 between entry and lip, referenced to criticalvelocity headA/(2T). Integrate dx/deta=(1−Fr²)/Sf over actual100mm reference; retain150/200adverse sensitivities.',
   boundary:'Hydrostatic/quasi1D stress comparison to a virtual control. At a real free brink pressure is rapidly varying; neither critical-at-edge nor100mm as actual friction length is earned. No feed from behind an obstructed ramp is implied. No chosen Klocation/n/central estimate is a physical pass.'},
  selected:{intervals:selected,cases:cases(selected)},rejected600:{intervals:rejected600,cases:cases(rejected600)},
  singleNorth:{intervals:singleNorth,cases:cases(singleNorth)},
  sixWetRetainedHinge:{intervals:sixRetained,cases:cases(sixRetained,true)},
  sixWetHungLatch:{intervals:sixHungLatch,cases:cases(sixHungLatch,true)},
  recommendation:'Develop ONE sixwet/fourplain collector +southordinaryaccess control with unchangedten550covers. Compare retainedhinge against priced short hunglatch; keep actual seam/underlap release/guard/ramp/weather/body/blockedmass duties. No sixthpan or latch is already accepted.',
  reviewedAgainst:'Independent SciPy brentq/adaptivequad read-only comparison6Nov2026; n.04/L100/K1entry/uniform rejected6003.551943369, northOnly488.5deepest3.692126031. Reproduction/convergence is arithmetic evidence only.'};
 return structuredClone(memo);
}
export function convergenceProbe(){
 const I=[[6811.5,7175],[7275,7375]];
 return [64,128,256].map(panels=>({panels,capacity:capacity(I,-35,0,'uniform',100,panels)}));
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const p='project/rwt/studies/short-inlet-review.json',text=JSON.stringify(review(),null,2)+'\n';
 if(process.argv.includes('--check'))assert.equal(fs.readFileSync(p,'utf8'),text);else fs.writeFileSync(p,text);
 console.log('Finite unadopted short-inlet reference reproduced.');
}
