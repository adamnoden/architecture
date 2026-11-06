/** One unadopted replacement for the selected free plunge; not a general flow solver. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readSelected,mouthFlow} from './selected-water-event.mjs';
const g=9.81;
export function compare(steps=6000,roughnesses=[0,.009,.012,.02,.03]){
 const s=readSelected(),r=s.model.renewal,e=r.courtCollector.actualOpenEntries;
 const x0=e.west.planeX,x1=r.shield.clearOutlet.planeX,z0=-150,z1=r.shield.clearOutlet.z[0];
 const dx=(x1-x0)/1000,drop=(z0-z1)/1000,R=.4;
 // Straight inclined floor plus a tangent circular toe ending horizontally.
 let lo=0,hi=1;
 for(let i=0;i<90;i++){
  const a=(lo+hi)/2,d=(dx-R*Math.sin(a))*Math.tan(a)+R*(1-Math.cos(a));
  if(d<drop)lo=a;else hi=a;
 }
 const angle=(lo+hi)/2,straight=(dx-R*Math.sin(angle))/Math.cos(angle),toe=R*angle,L=straight+toe;
 const q=s.model.hydraulicProbe.assignedInwardRoofAndCourtLps;
 const branches=[
  {id:'S225',inlet:[6950,7175],startWidthMm:225,endWidthMm:225,maximumFlowLps:q,reason:'Entire assigned duty may use the larger actual inlet; no nominal split assumption.'},
  {id:'S225-to350',inlet:[6950,7175],startWidthMm:225,endWidthMm:350,maximumFlowLps:q,reason:'Explicit splay candidate, allowing a zero-friction energy bound without600 spread; actual plan turn and transition remain unadopted.'},
  {id:'N100-unwidened',inlet:[7275,7375],startWidthMm:100,endWidthMm:100,maximumFlowLps:mouthFlow(-35,[[7275,7375]]),reason:'Clean actual100 entry at quiet stage bounds its individual inflow; the other branch supplies any remainder.'},
  {id:'N100-to225',inlet:[7275,7375],startWidthMm:100,endWidthMm:225,maximumFlowLps:mouthFlow(-35,[[7275,7375]]),reason:'Authored gradual splay, not uniform600 spreading credit. Needs complete plan-turn and release construction before selection.'}
 ];
 const cases=branches.flatMap(b=>roughnesses.map(n=>{
  const Q=b.maximumFlowLps/1000,w0=b.startWidthMm/1000,w1=b.endWidthMm/1000;
  const yc=(Q*Q/(g*w0*w0*Math.cos(angle)))**(1/3);
  let a=1e-7,c=yc;
  // Fast supercritical starting branch gets ALL quiet-stage-to-floor energy;
  // no entrance impact/friction loss is credited to manufacture a favourable result.
  const H=(-35-z0)/1000;
  for(let i=0;i<90;i++){const y=(a+c)/2,E=y*Math.cos(angle)+(Q/(w0*y))**2/(2*g);if(E>H)a=y;else c=y;}
  let y=(a+c)/2;const initial=y,ds=L/steps;
  const derivative=(at,h)=>{
   assert(h>0);
   const theta=at<=straight?angle:Math.max(0,angle-(at-straight)/R),dTheta=at<=straight?0:-1/R;
   const width=w0+(w1-w0)*at/L,dWidth=(w1-w0)/L,V=Q/(width*h),radius=width*h/(width+2*h);
   const friction=n*n*V*V/radius**(4/3),den=Math.cos(theta)-V*V/(g*h);
   assert(den<0,'Smooth supercritical branch lost: a located transition is required');
   return (Math.sin(theta)-friction+h*Math.sin(theta)*dTheta+V*V/g*dWidth/width)/den;
  };
  for(let i=0;i<steps;i++){
   const at=i*ds,k1=derivative(at,y),k2=derivative(at+ds/2,y+ds*k1/2),k3=derivative(at+ds/2,y+ds*k2/2),k4=derivative(at+ds,y+ds*k3);
   y+=ds*(k1+2*k2+2*k3+k4)/6;
  }
  const v=Q/(w1*y),Fr=v/Math.sqrt(g*y),conjugate=y/2*(Math.sqrt(1+8*Fr*Fr)-1)*1000;
  return {branch:b.id,flowLps:b.maximumFlowLps,roughness:n,initialDepthMm:initial*1000,toeDepthMm:y*1000,toeVelocityMps:v,
   horizontalConjugateComparisonMm:conjugate,nominal100DepthReserveMm:100-conjugate,
   toeNormalAccelerationOverGravity:v*v/(g*R),
   finalSpecificEnergyMm:1000*(y+v*v/(2*g)),initialSpecificEnergyMm:H*1000};
 }));
 return {identity:'RWT-UNADOPTED-GRADED-TRANSFER-COMPARISON-2026-11-06',selectedSource:s.blob,
  selectedGeometryChanged:false,sourceRun:{x:[x0,x1],floor:[z0,z1],horizontalRunMm:dx*1000},
  candidateProfile:{straightAngleDegrees:angle*180/Math.PI,straightLengthMm:straight*1000,toeRadiusMm:R*1000,toeHorizontalRunMm:R*Math.sin(angle)*1000,totalArcLengthMm:L*1000,endingAngleDegrees:0},
  branches,cases,
  interpretation:'Finite-length inclined-flow comparison, not a selected construction or hydraulic admission. The narrow branch must be widened or otherwise controlled; nominal flow partition is not sufficient.',
  bounds:[
   'n=0 is the zero-friction energy counterexample; n=.009..03 are authored sensitivity bounds, not calibrated roughness of a selected alloy or assembled surface.',
   'Integration uses inclined hydrostatic normal depth and Manning friction. Circular-toe nonhydrostatic pressure, waves and a located hydraulic jump are not solved; acceleration ratio is exposed, not silently ignored.',
   'No600-width distribution is assumed. Gradual100-to225 expansion is an explicit candidate wall profile, not evidence of full-width mixing.',
   'The required lateral shifts/plan turns, 100depth carrier entry, actual cover/chute panel extraction before stairs and temporary canopy-pipe energy/landing still need a joined construction. This section-only comparison cannot adopt those missing joins.',
   'The2m-high canopy drain does not inherit the ordinary court quiet-stage energy boundary. Its terminal needs its own contained transition.',
   'Quiet−35, protected crest15, house and well bounds remain unchanged. No deeper stagnant sump or structural250bridge alternative is adopted.'
  ],
  basis:'Specific energy E=z+h cos(theta)+Q²/(2gb²h²), dE/ds=−Sf; variable-width derivative integrated on the supercritical branch with RK4. Horizontal conjugate-depth comparison is applied only AFTER the tangent toe, not on the steep slope.',
  source:'https://www.hec.usace.army.mil/confluence/rasdocs/ras1dtechref/6.2/theoretical-basis-for-one-dimensional-and-two-dimensional-hydrodynamic-calculations/1d-steady-flow-water-surface-profiles/applications-of-the-momentum-equation'};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const p='project/rwt/studies/graded-transfer-comparison.json',text=JSON.stringify(compare(),null,2)+'\n';
 if(process.argv.includes('--check'))assert.equal(fs.readFileSync(p,'utf8'),text);else fs.writeFileSync(p,text);
 console.log('Unadopted graded transfer comparison reproduced; no selected geometry changed.');
}
