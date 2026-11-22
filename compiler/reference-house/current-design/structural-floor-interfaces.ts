/** Source/request-bound named floor-to-L resultants; no whole-joint free body. */
import { sha256SemanticFingerprint } from '../../core/identity.js'

const record=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==='object'&&!Array.isArray(v)
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v)
const vector=(v:unknown,n:number):v is number[]=>Array.isArray(v)&&v.length===n&&v.every(finite)
const same=(a:unknown,b:unknown)=>sha256SemanticFingerprint(a)===sha256SemanticFingerprint(b)
const pointKey=(xy:number[])=>`${xy[0]},${xy[1]}`
const dot=(a:number[],b:number[])=>a.reduce((sum,v,i)=>sum+v*b[i]!,0)
const cross=(a:number[],b:number[])=>[a[1]!*b[2]!-a[2]!*b[1]!,a[2]!*b[0]!-a[0]!*b[2]!,a[0]!*b[1]!-a[1]!*b[0]!]

/** Transport a global six-wrench, using mm coordinates and kN/kNm actions. */
export function transportFloorInterfaceWrench(wrench:readonly number[], fromMm:readonly number[], toMm:readonly number[]) {
  if (!vector(wrench,6)||!vector(fromMm,3)||!vector(toMm,3)) throw new Error('Finite six-wrench and explicit mm origins required')
  const offset=fromMm.map((v,i)=>(v-toMm[i]!)/1000),moment=cross(offset,[...wrench.slice(0,3)])
  return [...wrench.slice(0,3),...wrench.slice(3).map((v,i)=>v+moment[i]!)]
}

/** Small, row-scaled least-squares solve of the actual three/six rigid-map coordinates. */
function solveMaps(rows:number[][],values:number[],count:number) {
  const k=Array.from({length:count},()=>Array(count).fill(0)),f=Array(count).fill(0)
  rows.forEach((row,i)=>{
    const scale=Math.max(...row.map(Math.abs));if (!(scale>0)) throw new Error('Empty physical displacement map')
    const a=row.map(v=>v/scale),b=values[i]!/scale
    for(let j=0;j<count;j++){f[j]+=a[j]!*b;for(let l=0;l<count;l++)k[j]![l]+=a[j]!*a[l]!}
  })
  for(let i=0;i<count;i++) {
    let pivot=i;for(let j=i+1;j<count;j++)if(Math.abs(k[j]![i]!)>Math.abs(k[pivot]![i]!))pivot=j
    if(Math.abs(k[pivot]![i]!)<1e-10)throw new Error('Physical displacement maps do not determine all actual rigid coordinates')
    ;[k[i],k[pivot]]=[k[pivot]!,k[i]!];[f[i],f[pivot]]=[f[pivot]!,f[i]!]
    const p=k[i]![i]!;for(let j=i;j<count;j++)k[i]![j]/=p;f[i]/=p
    for(let j=0;j<count;j++)if(j!==i){const a=k[j]![i]!;for(let l=i;l<count;l++)k[j]![l]-=a*k[i]![l]!;f[j]-=a*f[i]!}
  }
  if(rows.some((row,i)=>Math.abs(dot(row,f)-values[i]!)>1e-8*Math.max(1,Math.abs(values[i]!)))) throw new Error('Actual physical displacement field contradicts reconstructed rigid corner maps')
  return f as number[]
}

export function recoverNamedFloorCornerInterfaces(nativeInput:unknown,manifestInput:unknown) {
  if(!record(nativeInput)||!record(manifestInput)||nativeInput.schema!=='str-coupled-floor-section-result/1'
    ||manifestInput.schema!=='str-named-floor-corner-port-manifest/1'||manifestInput.nonlinearSolvesExecuted!==0
    ||manifestInput.wholeJointDemandAvailable!==false||!record(nativeInput.nativeVertical)||!record(nativeInput.nativeVertical.native)
    ||!same(nativeInput.sourceSHA256,manifestInput.sourceSHA256)||!same(nativeInput.request,manifestInput.request)
    ||nativeInput.nativeVertical.native.caseId!==manifestInput.caseId)throw new Error('Exact source/request/case-bound native result and named port manifest required')
  const vertical=nativeInput.nativeVertical,native=vertical.native as Record<string,unknown>
  if(!record(vertical.plate)||!record(vertical.plate.physicalRecovery)||!Array.isArray(vertical.plate.physicalRecovery.points)
    ||!Array.isArray(vertical.plate.physicalRecovery.portGeneralizedReactions)||!Array.isArray(native.floorInterfacePorts)
    ||!Array.isArray(manifestInput.corners)||!manifestInput.corners.length||!Number.isSafeInteger(manifestInput.verticalPortCount)
    ||vertical.plate.physicalRecovery.portGeneralizedReactions.length!==manifestInput.verticalPortCount
    ||!vertical.plate.physicalRecovery.portGeneralizedReactions.every(finite))throw new Error('Complete actual plate reactions/points and named membrane ports required')
  const reactions=vertical.plate.physicalRecovery.portGeneralizedReactions as number[],points=new Map<string,number[]>()
  for(const p of vertical.plate.physicalRecovery.points){if(!record(p)||!vector(p.xyMm,2)||!vector(p.displacementMmRad,3)||points.has(pointKey(p.xyMm)))throw new Error('Unique finite actual plate points required');points.set(pointKey(p.xyMm),p.displacementMmRad)}
  const membrane=new Map<string,Record<string,unknown>>()
  for(const p of native.floorInterfacePorts){if(!record(p)||typeof p.id!=='string'||membrane.has(p.id))throw new Error('Unique actual membrane port IDs required');membrane.set(p.id,p)}
  const ids=new Set<string>(),usedIndices=new Set<number>()
  const corners=manifestInput.corners.map((raw:unknown)=>{
    if(!record(raw)||typeof raw.id!=='string'||!raw.id||ids.has(raw.id)||typeof raw.collectorNodeId!=='string'||!vector(raw.collectorNodeXYZMm,3)
      ||!Array.isArray(raw.ports)||raw.ports.length!==3||!Array.isArray(raw.physicalPlatePointTraces)||!raw.physicalPlatePointTraces.length)throw new Error('Unique named corner, actual node origin and three explicit port maps required')
    ids.add(raw.id);const origin=raw.collectorNodeXYZMm,byAxis=new Map<number,{index:number;row:number[]}>()
    for(const p of raw.ports){if(!record(p)||!Number.isSafeInteger(p.coordinate)||![0,1,2].includes(Number(p.coordinate))||byAxis.has(Number(p.coordinate))||!Number.isSafeInteger(p.index)
      ||Number(p.index)<0||Number(p.index)>=reactions.length||usedIndices.has(Number(p.index))||!vector(p.nodeDisplacementCoefficients,6)
      ||p.id!==`CORNER/${raw.id}/${p.coordinate}`)throw new Error('Unique stable corner coordinate/port index and finite node work map required')
      usedIndices.add(Number(p.index));byAxis.set(Number(p.coordinate),{index:Number(p.index),row:p.nodeDisplacementCoefficients})}
    const ports=[byAxis.get(0)!,byAxis.get(1)!,byAxis.get(2)!],indices=new Map(ports.map((p,i)=>[p.index,i]))
    const equations:number[][]=[],values:number[]=[]
    for(const trace of raw.physicalPlatePointTraces){if(!record(trace)||!vector(trace.xyMm,2)||!Array.isArray(trace.plateCoordinateCoefficients)||trace.plateCoordinateCoefficients.length!==3)throw new Error('Actual named physical plate traces required')
      const point=points.get(pointKey(trace.xyMm));if(!point)throw new Error('Named physical trace is missing from actual plate recovery')
      trace.plateCoordinateCoefficients.forEach((terms:unknown,axis:number)=>{
        if(!Array.isArray(terms)||!terms.length)throw new Error('Nonempty actual physical plate-coordinate map required')
        const row=[0,0,0]
        for(const term of terms){if(!Array.isArray(term)||term.length!==2||!Number.isSafeInteger(term[0])||!finite(term[1])||!indices.has(term[0]))throw new Error('Physical trace refers to an absent/different corner port');row[indices.get(term[0])!]+=term[1]}
        equations.push(row);values.push(point[axis]!)
      })}
    const portU=solveMaps(equations,values,3),m=membrane.get(raw.id)
    if(!m||!vector(m.physicalPointMm,3)||!vector(m.forceOnFloorKN_KNm,6)||!vector(m.displacementMmMrad,3)
      ||[2,3,4].some(i=>Math.abs((m.forceOnFloorKN_KNm as number[])[i]!)>1e-10))throw new Error('Named planar membrane point, three displacements and six-wrench required')
    const offset=m.physicalPointMm.map((v,i)=>v-origin[i]!),[dx,dy,dz]=offset
    const membraneRows=[[1,0,0,0,dz!,-dy!],[0,1,0,-dz!,0,dx!],[0,0,0,0,0,1000]]
    const nodeU=solveMaps([...ports.map(p=>p.row),...membraneRows],[...portU,...m.displacementMmMrad],6)
    const plateWrenchKN_KNmm=Array(6).fill(0)
    ports.forEach(p=>p.row.forEach((coefficient,j)=>plateWrenchKN_KNmm[j]+=reactions[p.index]!*coefficient))
    const plateWrenchKN_KNm=plateWrenchKN_KNmm.map((v,i)=>i<3?v:v/1000)
    const membraneWrenchKN_KNm=transportFloorInterfaceWrench(m.forceOnFloorKN_KNm,m.physicalPointMm,origin)
    const onFloor=plateWrenchKN_KNm.map((v,i)=>v+membraneWrenchKN_KNm[i]!)
    const actualPortWork=ports.reduce((sum,p,i)=>sum+reactions[p.index]!*portU[i]!,0)
      +dot(m.forceOnFloorKN_KNm.slice(0,2),m.displacementMmMrad.slice(0,2)) + m.forceOnFloorKN_KNm[5]!*m.displacementMmMrad[2]!
    const actualNodeWork=onFloor.reduce((sum,v,i)=>sum+v*nodeU[i]!*(i<3?1:1000),0)
    const workRelativeResidual=Math.abs(actualPortWork-actualNodeWork)/Math.max(1,Math.abs(actualPortWork),Math.abs(actualNodeWork))
    if(workRelativeResidual>1e-8)throw new Error('Actual corner force/displacement work-duality failed')
    return {id:raw.id,collectorNodeId:raw.collectorNodeId,originXYZMm:origin,verticalPortIndices:ports.map(p=>p.index),
      collectorDisplacementMmRad:nodeU,plateForceOnFloorKN_KNm:plateWrenchKN_KNm,membraneForceOnFloorKN_KNm:membraneWrenchKN_KNm,
      forceOnFloorKN_KNm:onFloor,floorForceOnCollectorKN_KNm:onFloor.map(v=>-v),
      work:{actualPortWorkKNmm:actualPortWork,actualCollectorWorkKNmm:actualNodeWork,relativeResidual:workRelativeResidual}}
  })
  return {schema:'str-named-floor-corner-interface-actions/1' as const,caseId:manifestInput.caseId,sourceSHA256:manifestInput.sourceSHA256,
    requestDigest:sha256SemanticFingerprint(nativeInput.request),manifestMethodSourceSHA256:manifestInput.methodSourceSHA256,corners,
    nonlinearSolvesExecuted:0 as const,wholeJointDemandAvailable:false as const,closedControlVolumeEquilibriumProven:false as const,resistanceAccepted:false as const,
    missingWholeJointEvidence:['Actual upper/lower L member-end actions at the collector and their physical load origins are not retained in the full native response.',
      'These are simultaneous floor-to-collector interface actions, not a closed joint control volume, design strip or local concrete/reinforcement demand envelope.'],
    scope:'Named current-builder plate port3-actions and membrane port3-actions, translated to the actual collector origin by work-dual maps. Source/request identity and physical rigid traces are checked. Full joint/member equilibrium, stress convergence, signed demand envelope and resistance remain unqualified.'}
}
