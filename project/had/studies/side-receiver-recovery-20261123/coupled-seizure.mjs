import{writeFileSync}from'node:fs'
import{factor,matvec,sub}from'./frame-kernel.ts'
process.env.OVID_SIDE_SILENT='1'
const {source,room,bank,K,own,free,es,dofs,nodes,members,rowNodes,stress}=await import('./frame.mjs'),N=K.length
const pipeSections=[{id:'nominal28x1.2',od:28,wall:1.2},{id:'stock-adverse28.1x1.38',od:28.1,wall:1.38}],valveStiffness=[null,1e6,1e4,1e3],all=[]
for(const pipe of pipeSections)for(const kValve of valveStiffness)for(const uSeized of [false,true])for(const pSeized of [false,true]){
 const springs=['utility','plant'].map((branch,k)=>{const below=rowNodes.find(v=>v.receiver.branch===branch&&v.receiver.side==='below'),above=rowNodes.find(v=>v.receiver.branch===branch&&v.receiver.side==='above'),c=Array(N).fill(0)
  for(let j=0;j<2;j++){c[above.bearings[j]*6+2]+=above.weights[j];c[below.bearings[j]*6+2]-=below.weights[j]}
  const span=above.receiver.centreMm[2]-below.receiver.centreMm[2],valveFace=room.indoorCuts.productEvidence.bellows.faceMm,copperLength=span-valveFace,area=Math.PI/4*(pipe.od**2-(pipe.od-2*pipe.wall)**2),kTube=117200*area/copperLength,stiffness=kValve===null?kTube:1/(1/kTube+1/kValve)
  return{branch,c,spanMm:span,valveFaceMm:valveFace,copperLengthMm:copperLength,tubeAreaMm2:area,tubeStiffnessNPerMm:kTube,valveAxialStiffnessNPerMm:kValve,seriesStiffnessNPerMm:stiffness,seized:k===0?uSeized:pSeized,below,above}
 }),A=K.map(row=>[...row])
 for(const s of springs)if(s.seized)for(let i=0;i<N;i++)if(s.c[i])for(let j=0;j<N;j++)if(s.c[j])A[i][j]+=s.seriesStiffnessNPerMm*s.c[i]*s.c[j]
 const solve=factor(free.map(i=>free.map(j=>A[i][j])))
 for(const uPressure of [-1,1])for(const pPressure of [-1,1])for(const uTemperature of [-40,40])for(const pTemperature of [-40,40]){
  const f=[...own],states=[]
  for(let k=0;k<springs.length;k++){
   const s=springs[k],base=bank.reactions.find(v=>v.branch===s.branch),temperature=k===0?uTemperature:pTemperature,pressureSign=k===0?uPressure:pPressure,
    sourceP=room.indoorCuts.valves.find(v=>v.branch===s.branch).pressureCutClearBoreComparisonN,
    localForce=pressureSign*sourceP-base.localReferenceGravityN,freeGrowth=(.017/1000*s.copperLengthMm+.017/1000*s.valveFaceMm)*temperature
   for(let j=0;j<2;j++)f[s.below.bearings[j]*6+2]+=localForce*s.below.weights[j]
   if(s.seized)for(let j=0;j<N;j++)f[j]+=s.seriesStiffnessNPerMm*freeGrowth*s.c[j]
   states.push({branch:s.branch,seized:s.seized,temperatureK:temperature,pressureSign,localPressureGravityForceN:localForce,freeGrowthMm:freeGrowth,rigidReceiverAxialComparatorN:s.seriesStiffnessNPerMm*freeGrowth})
  }
  const u=Array(N).fill(0),answer=solve(free.map(d=>f[d]));free.forEach((d,k)=>u[d]=answer[k]);const reaction=sub(matvec(A,u),f),residual=Math.max(...free.map(d=>Math.abs(reaction[d]))),memberStress=members.map((m,k)=>{const end=sub(matvec(es[k].k,matvec(es[k].T,dofs[k].map(d=>u[d]))),es[k].f);return{id:m.id,stressMPa:stress(m,es[k],end)}}),peak=memberStress.reduce((a,b)=>a.stressMPa>b.stressMPa?a:b)
  all.push({pipe:pipe.id,valveStiffnessNPerMm:kValve,states:states.map((v,k)=>({...v,relativeFrameMovementMm:springs[k].c.reduce((n,a,j)=>n+a*u[j],0),compatibleAxialForceN:v.seized?springs[k].seriesStiffnessNPerMm*(v.freeGrowthMm-springs[k].c.reduce((n,a,j)=>n+a*u[j],0)):0})),peak,maxTranslationMm:Math.max(...Array.from({length:nodes.length},(_,n)=>Math.hypot(...u.slice(n*6,n*6+3)))),residual})
 }
}
const result={source:source.source,comparison:'Explicit scalar vertical seized-guide/two-tail/valve spring joined to the full finite side-frame; rigid master clamp beam at its two wing bearings. Normal full3D outer-route, friction, actual valve stiffness/thermal law, clamp/guide/contact/seal and wall resistance not qualified. This is not an actual-force bound.',cases:all}
writeFileSync(new URL('coupled-seizure.results.json',import.meta.url),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({cases:all.length,maxForceN:Math.max(...all.flatMap(v=>v.states.map(s=>Math.abs(s.compatibleAxialForceN)))),maxStress:all.reduce((a,b)=>a.peak.stressMPa>b.peak.stressMPa?a:b),byLaw:pipeSections.flatMap(pipe=>valveStiffness.map(k=>{const rows=all.filter(v=>v.pipe===pipe.id&&v.valveStiffnessNPerMm===k);return{pipe:pipe.id,kValve:k,maxForceN:Math.max(...rows.flatMap(v=>v.states.map(s=>Math.abs(s.compatibleAxialForceN)))),maxStressMPa:Math.max(...rows.map(v=>v.peak.stressMPa))}}))},null,2))
