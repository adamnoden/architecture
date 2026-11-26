import {sha256SemanticFingerprint} from '../../core/identity.js'
type P=readonly number[]
type Family={takeoffMm:number;nutAFMm:number}
export type PlantInventoryControl={trunkMaximumBareOuterDiameterMm:number;terminalAndReturnMaximumBareOuterDiameterMm:number;maximumCompletePressureDeviceBodyMm:readonly[number,number,number];maximumTerminalAddedDevelopedFactorOfWorkTerritory:number;fitting:{twentyTwo:Family;fifteen:Family;twentyEight:Family}}
type Trunk={id:string;duties:string[];selected3DProfile:P[];profileLengthMM:number}
type Fixture={id:string;duties:string[];waterBranchPlanDuties?:string[];waterBranchPlan:P[];waterBranchLengthIncludingDropMM:number;requiredValveWorkTerritory:P}
type MAT={trunks:Trunk[];fixtures:Fixture[];pipeInsulation:{sectionCentres:{id:string;xy:P}[]}}
const length=(p:readonly P[])=>p.slice(1).reduce((s,b,k)=>s+Math.hypot(...b.map((v,j)=>v-p[k][j])),0)
const path=(p:readonly P[],n:number)=>Array.isArray(p)&&p.length>=2&&p.every(v=>Array.isArray(v)&&v.length===n&&v.every(Number.isFinite))
const volume=(od:number,L:number)=>Math.PI/4*od**2*L/1e6
const tee=(f:Family)=>{const r=f.nutAFMm/(2*Math.cos(Math.PI/6));return 2*(f.takeoffMm+r)*(f.takeoffMm+2*r)*2*r/1e6}
/** Deliberately conservative complete SOURCE-DESIGN inventory requirement.
 * Bare OUTER tubes, full bare fitting boxes, end devices and joint overlap are
 * counted as water. No minimum-ID, nominal useful litre or actual product
 * performance is substituted. Offset paths/end spools remain explicit required
 * geometry bounds until their actual joins are compiled. */
export function plantPotableInventory(matValue:unknown,control:PlantInventoryControl){
 const m=matValue as MAT,c=control
 if(!m||!Array.isArray(m.trunks)||!m.trunks.length||!Array.isArray(m.fixtures)||m.fixtures.length!==14||!m.pipeInsulation?.sectionCentres?.length
  ||![c.trunkMaximumBareOuterDiameterMm,c.terminalAndReturnMaximumBareOuterDiameterMm,c.maximumTerminalAddedDevelopedFactorOfWorkTerritory,...c.maximumCompletePressureDeviceBodyMm,...Object.values(c.fitting).flatMap(f=>[f.takeoffMm,f.nutAFMm])].every(n=>Number.isFinite(n)&&n>0)
  ||c.trunkMaximumBareOuterDiameterMm<22.1||c.terminalAndReturnMaximumBareOuterDiameterMm<15.1||c.maximumTerminalAddedDevelopedFactorOfWorkTerritory<2
  ||new Set(m.trunks.map(t=>t.id)).size!==m.trunks.length||new Set(m.fixtures.map(f=>f.id)).size!==m.fixtures.length
  ||m.pipeInsulation.sectionCentres.some(p=>!Array.isArray(p.xy)||p.xy.length!==2||p.xy.some(v=>!Number.isFinite(v))))throw Error('Actual complete MAT source and conservative pipe/fitting/device controls required')
 const offset=Math.max(...m.pipeInsulation.sectionCentres.map(p=>Math.hypot(...p.xy))),rows:{id:string;duty:string;kind:string;sourceLengthMm:number;offsetAndEndLengthUpperMm:number;terminalSpoolLengthUpperMm:number;pipeOuterWaterUpperL:number;fullFittingBoxUpperL:number;completeDeviceOuterUpperL:number;turnRadians:number}[]=[]
 for(const t of m.trunks){
  const duties=t.duties.filter(d=>['cold','hot','hot-return'].includes(d));if(!duties.length)continue
  if(!path(t.selected3DProfile,3)||!Number.isFinite(t.profileLengthMM)||t.profileLengthMM<=0)throw Error('Actual source3D potable trunk required: '+t.id)
  const p=t.selected3DProfile.filter((v,k,a)=>k===0||v.some((n,j)=>n!==a[k-1][j])),L=length(p)
  if(Math.abs(L-t.profileLengthMM)>1e-5)throw Error('Trunk developed-length source contradiction: '+t.id)
  let angle=0
  for(let k=1;k<p.length-1;k++){const a=p[k].map((v,j)=>v-p[k-1][j]),b=p[k+1].map((v,j)=>v-p[k][j]),dot=a.reduce((s,v,j)=>s+v*b[j],0)/Math.hypot(...a)/Math.hypot(...b);angle+=Math.acos(Math.max(-1,Math.min(1,dot)))}
  for(const duty of duties){const ret=duty==='hot-return',od=ret?c.terminalAndReturnMaximumBareOuterDiameterMm:c.trunkMaximumBareOuterDiameterMm,f=ret?c.fitting.fifteen:c.fitting.twentyTwo,extra=offset*angle+2*offset
   rows.push({id:t.id,duty,kind:'trunk',sourceLengthMm:L,offsetAndEndLengthUpperMm:extra,terminalSpoolLengthUpperMm:0,pipeOuterWaterUpperL:volume(od,L+extra),fullFittingBoxUpperL:tee(f)*Math.max(p.length-2,0),completeDeviceOuterUpperL:0,turnRadians:angle})
  }
 }
 for(const f of m.fixtures){
  const duties=(f.waterBranchPlanDuties??f.duties).filter(d=>['cold','hot'].includes(d));if(!duties.length)continue
  if(!path(f.waterBranchPlan,2)||!Array.isArray(f.requiredValveWorkTerritory)||f.requiredValveWorkTerritory.length!==3||f.requiredValveWorkTerritory.some(v=>!Number.isFinite(v)||v<=0)||!Number.isFinite(f.waterBranchLengthIncludingDropMM)||f.waterBranchLengthIncludingDropMM<length(f.waterBranchPlan))throw Error('Actual source fixture/drop/work territory required: '+f.id)
  if([...c.maximumCompletePressureDeviceBodyMm].sort((a,b)=>a-b).some((v,k)=>v>[...f.requiredValveWorkTerritory].sort((a,b)=>a-b)[k]))throw Error('Complete pressure device exceeds source work territory: '+f.id)
  const extra=c.maximumTerminalAddedDevelopedFactorOfWorkTerritory*f.requiredValveWorkTerritory.reduce((a,b)=>a+b,0)
  for(const duty of duties)rows.push({id:f.id,duty,kind:'fixture-branch',sourceLengthMm:f.waterBranchLengthIncludingDropMM,offsetAndEndLengthUpperMm:0,terminalSpoolLengthUpperMm:extra,pipeOuterWaterUpperL:volume(c.terminalAndReturnMaximumBareOuterDiameterMm,f.waterBranchLengthIncludingDropMM+extra),fullFittingBoxUpperL:tee(c.fitting.fifteen)*(f.waterBranchPlan.length+1),completeDeviceOuterUpperL:c.maximumCompletePressureDeviceBodyMm.reduce((a,b)=>a*b,1)/1e6,turnRadians:0})
 }
 const totals={pipeOuterWaterUpperL:rows.reduce((s,r)=>s+r.pipeOuterWaterUpperL,0),fullFittingBoxUpperL:rows.reduce((s,r)=>s+r.fullFittingBoxUpperL,0),completeDeviceOuterUpperL:rows.reduce((s,r)=>s+r.completeDeviceOuterUpperL,0)},
  upper=Object.values(totals).reduce((a,b)=>a+b,0)
 return{schema:'had-Plant-actual-source-potable-inventory/1',sourceDigest:sha256SemanticFingerprint({mat:m,control:c}),control:c,rows,totals,wholeSelectedTrunkBranchAndDeviceDesignUpperL:upper,
  sectionOffsetRadiusUpperMm:offset,sourcePipeBodiesAndFittingsDeliberatelyCountedAsWater:true,minimumBoresUsedAsMaximum:false,retiredUtilityColdDutyIncluded:rows.some(r=>r.duty==='cold'&&['ground-utility','utility-sink-PROPOSED','washer-PROPOSED'].includes(r.id)),newPlantInletStoreRisersExpansionAndSafetyBodiesIncluded:false,
  requirements:['Actual tube axes must remain within the source section offset bound; no hidden coil/longer detour is admitted.','Complete final pressure device per source potable duty must fit the authored full external body bound.','Terminal connector developed length must fit the full work-territory detour bound.','Actual riser paths, fixture air gaps/hose geometry and every source/backfeed cut must be supplied by the complete installation.'],
  actualAllApparatusReservoirBackfeedExcluded:false,actualRiserAndAllTerminalJoinsAccepted:false,actualInstalledReleaseQualified:false}
}
