type Point=readonly [number,number,number]
const sub=(a:Point,b:Point):Point=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]]
const add=(a:Point,b:Point):Point=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]]
const scale=(a:Point,s:number):Point=>[a[0]*s,a[1]*s,a[2]*s]
const dot=(a:Point,b:Point)=>a.reduce((n,v,i)=>n+v*b[i],0)
const cross=(a:Point,b:Point):Point=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
const r=(n:number)=>Number(n.toFixed(8))||0
const zero:Point=[0,0,0]
const basis:readonly Point[]=[[1,0,0],[0,1,0],[0,0,1]]

function solve(matrix:readonly (readonly number[])[],rhs:readonly number[]){
  const a=matrix.map((row,i)=>{
    const s=Math.max(...row.map(Math.abs))
    if(!(s>0))throw new Error('Thermal flexibility has an unsupported zero row')
    return [...row.map(v=>v/s),rhs[i]/s]
  }),n=rhs.length
  for(let j=0;j<n;j++){
    let pivot=j
    for(let i=j+1;i<n;i++)if(Math.abs(a[i][j])>Math.abs(a[pivot][j]))pivot=i
    if(Math.abs(a[pivot][j])<1e-13)throw new Error('Thermal flexibility is singular for this declared support arrangement')
    ;[a[j],a[pivot]]=[a[pivot],a[j]]
    const divisor=a[j][j]
    for(let k=j;k<=n;k++)a[j][k]/=divisor
    for(let i=0;i<n;i++)if(i!==j){const f=a[i][j];for(let k=j;k<=n;k++)a[i][k]-=f*a[j][k]}
  }
  const out=a.map(row=>row[n])
  const residual=Math.max(...rhs.map((v,i)=>Math.abs(matrix[i].reduce((s,m,j)=>s+m*out[j],0)-v)))
  if(residual>1e-7*Math.max(1,...rhs.map(Math.abs)))throw new Error('Thermal flexibility residual exceeds its numerical allowance')
  return out
}

type ThermalInput={
  readonly pathMm:readonly Point[]
  readonly fixedPointZMm:number
  readonly guideZMm:number
  readonly temperatureExcursionK:number
  readonly pipe:{readonly outerDiameterMm:number;readonly wallMm:number;readonly elasticModulusMpa:number;readonly poissonRatio:number;readonly expansionMmMK:number}
}

export function compareFixedInletThermalRoute(input:ThermalInput){
  if(input.pathMm.length<3||input.pathMm.some(p=>p.length!==3||p.some(n=>!Number.isFinite(n)))||
      [input.fixedPointZMm,input.guideZMm,input.temperatureExcursionK,...Object.values(input.pipe)].some(n=>!Number.isFinite(n))||
      input.temperatureExcursionK<0||input.temperatureExcursionK>80||input.pipe.wallMm<=0||input.pipe.outerDiameterMm<=2*input.pipe.wallMm||
      input.pipe.elasticModulusMpa<=0||input.pipe.poissonRatio<0||input.pipe.poissonRatio>=.5||input.pipe.expansionMmMK<=0)throw new Error('Actual finite tube route and positive supported pipe properties are required')
  const locate=(z:number)=>{
    const index=input.pathMm.slice(1).findIndex((b,i)=>Math.abs(b[0]-input.pathMm[i][0])<1e-7&&Math.abs(b[1]-input.pathMm[i][1])<1e-7&&input.pathMm[i][2]<=z&&b[2]>=z)
    if(index<0)throw new Error('Declared support must lie on the actual straight ascending inlet riser')
    return {index,point:[input.pathMm[index][0],input.pathMm[index][1],z] as Point}
  }
  const fixed=locate(input.fixedPointZMm),guide=locate(input.guideZMm)
  if(input.guideZMm<=input.fixedPointZMm)throw new Error('The axial sliding guide must be above the fixed point')
  const vertices:Point[]=[fixed.point]
  for(let i=fixed.index+1;i<input.pathMm.length;i++){
    if(i===guide.index+1&&Math.hypot(...sub(guide.point,vertices.at(-1)!))>1e-7)vertices.push(guide.point)
    if(Math.hypot(...sub(input.pathMm[i],vertices.at(-1)!))>1e-7)vertices.push(input.pathMm[i])
  }
  const lowerVertices:Point[]=[fixed.point,...input.pathMm.slice(0,fixed.index+1).reverse()]
  const upperSubroute=routeFlexibility(vertices,guide.point,input)
  const lowerSubroute=routeFlexibility(lowerVertices,null,input)
  const forceBounds=basis.map((_,i)=>upperSubroute.independentSegmentTemperatureBound.fixedPointComponentBoundsN[i]+lowerSubroute.independentSegmentTemperatureBound.fixedPointComponentBoundsN[i])
  const momentBounds=basis.map((_,i)=>upperSubroute.independentSegmentTemperatureBound.fixedPointMomentComponentBoundsNmm[i]+lowerSubroute.independentSegmentTemperatureBound.fixedPointMomentComponentBoundsNmm[i])
  return {schema:'had-fixed-inlet-thermal-flexibility/2' as const,sourceContext:input,fixedPointMm:fixed.point,
    upperSubroute,lowerSubroute,
    combinedFixedPointWrench:{pointMm:fixed.point,forceComponentBoundsN:forceBounds.map(r),momentComponentBoundsNmm:momentBounds.map(r),
      uniformForceN:basis.map((_,i)=>r(upperSubroute.uniformTemperature.fixedPointForceN[i]+lowerSubroute.uniformTemperature.fixedPointForceN[i])),
      uniformMomentNmm:basis.map((_,i)=>r(upperSubroute.uniformTemperature.fixedPointMomentNmm[i]+lowerSubroute.uniformTemperature.fixedPointMomentNmm[i])),
      law:'Independent signed segment-temperature absolute-sum bounds from BOTH subroutes meeting the fixed clamp; all force and moment components retained.'},
    guideWrench:{pointMm:guide.point,forceComponentBoundsN:[...upperSubroute.independentSegmentTemperatureBound.guideLateralComponentBoundsN,0],momentComponentBoundsNmm:[0,0,0],axialFrictionQualified:false},
    outerTerminalWrench:{pointMm:lowerVertices.at(-1)!,forceComponentBoundsN:lowerSubroute.independentSegmentTemperatureBound.terminalForceComponentBoundsN,
      momentComponentBoundsNmm:lowerSubroute.independentSegmentTemperatureBound.terminalMomentComponentBoundsNmm,
      scope:'first authored outer cut point only; its assumed six-axis restraint is not a source-bound Lodge/network restraint'},
    upperTerminalWrench:{pointMm:vertices.at(-1)!,forceComponentBoundsN:upperSubroute.independentSegmentTemperatureBound.terminalForceComponentBoundsN,
      momentComponentBoundsNmm:upperSubroute.independentSegmentTemperatureBound.terminalMomentComponentBoundsNmm},
    whollyRestrainedAxialComparisonN:r(input.pipe.elasticModulusMpa*Math.PI*(input.pipe.outerDiameterMm**2-(input.pipe.outerDiameterMm-2*input.pipe.wallMm)**2)/4*input.pipe.expansionMmMK/1000*input.temperatureExcursionK),
    fullLodgeAndHouseSupportNetworkEstablished:false,actualClampGuideAndTerminalStiffnessQualified:false,
    remaining:'Retain complete fixed-point force AND moment envelopes, guide force at its actual height and both terminal wrenches in the receiver. Qualify the actual clamp/guide law and extend the outer route to a real declared support; no full-Lodge thermal admission follows from an outer repair-cut endpoint.'}
}

type ThermalLinearSystem={matrix:number[][];expansions:number[][];restraints:{point:Point;station:number;force:Point;moment:Point}[];fixedPoint:Point}
function routeFlexibility(vertices:readonly Point[],guidePoint:Point|null,input:ThermalInput,capture?:(system:ThermalLinearSystem)=>void){
  const fixedPoint=vertices[0]
  const stations=[0]
  for(let i=1;i<vertices.length;i++)stations.push(stations.at(-1)!+Math.hypot(...sub(vertices[i],vertices[i-1])))
  const guideIndex=vertices.findIndex(p=>Math.hypot(...sub(p,guidePoint??zero))<1e-7)
  const end=vertices.at(-1)!,last=stations.at(-1)!
  const restraints=[...basis.map(force=>({point:end,station:last,force,moment:zero})),
    ...basis.map(moment=>({point:end,station:last,force:zero,moment})),
    ...(guidePoint?basis.slice(0,2).map(force=>({point:guidePoint,station:stations[guideIndex],force,moment:zero})):[])]
  const n=restraints.length,matrix=Array.from({length:n},()=>Array<number>(n).fill(0))
  const d=input.pipe.outerDiameterMm,inner=d-2*input.pipe.wallMm
  const area=Math.PI*(d*d-inner*inner)/4,inertia=Math.PI*(d**4-inner**4)/64
  const E=input.pipe.elasticModulusMpa,G=E/(2*(1+input.pipe.poissonRatio)),alpha=input.pipe.expansionMmMK/1000
  const expansions:number[][]=[]
  for(let k=1;k<vertices.length;k++){
    const a=vertices[k-1],b=vertices[k],delta=sub(b,a),ds=Math.hypot(...delta),t=scale(delta,1/ds),midStation=(stations[k-1]+stations[k])/2
    const free=restraints.map(restraint=>restraint.station>=stations[k]-1e-8?alpha*dot(delta,restraint.force):0)
    expansions.push(free)
    for(const [fraction,weight] of [[0,1/6],[.5,4/6],[1,1/6]]){
      const point=add(a,scale(delta,fraction))
      const fields=restraints.map(restraint=>{
        if(restraint.station<midStation)return {axial:0,moment:zero,torsion:0}
        const moment=add(restraint.moment,cross(sub(restraint.point,point),restraint.force))
        return {axial:dot(restraint.force,t),moment,torsion:dot(moment,t)}
      })
      for(let i=0;i<n;i++)for(let j=0;j<n;j++)matrix[i][j]+=ds*weight*(fields[i].axial*fields[j].axial/(E*area)+
        (dot(fields[i].moment,fields[j].moment)-fields[i].torsion*fields[j].torsion)/(E*inertia)+fields[i].torsion*fields[j].torsion/(G*2*inertia))
    }
  }
  capture?.({matrix,expansions,restraints,fixedPoint})
  const uniformFree=restraints.map((_,i)=>expansions.reduce((s,v)=>s+v[i],0)*input.temperatureExcursionK)
  const reactions=solve(matrix,uniformFree.map(v=>-v))
  const segmentResponses=expansions.map(free=>solve(matrix,free.map(v=>-v)))
  const reactionBounds=restraints.map((_,i)=>segmentResponses.reduce((s,v)=>s+Math.abs(v[i]),0)*input.temperatureExcursionK)
  const fixedWrench=(reaction:readonly number[])=>{
    const guideForce:Point=[reaction[6]??0,reaction[7]??0,0]
    const force=scale(add(reaction.slice(0,3) as unknown as Point,guideForce),-1)
    const moment=scale(add(add(reaction.slice(3,6) as unknown as Point,cross(sub(end,fixedPoint),reaction.slice(0,3) as unknown as Point)),
      cross(sub(guidePoint??fixedPoint,fixedPoint),guideForce)),-1)
    return [...force,...moment]
  }
  const fixed= fixedWrench(reactions)
  const segmentFixedWrenches=segmentResponses.map(fixedWrench)
  const fixedBounds=Array.from({length:6},(_,i)=>segmentFixedWrenches.reduce((sum,reaction)=>sum+Math.abs(reaction[i]),0)*input.temperatureExcursionK)
  const stressCoefficient=(reaction:readonly number[])=>{
    let peak=0
    for(let k=1;k<vertices.length;k++){
      const a=vertices[k-1],b=vertices[k],t=scale(sub(b,a),1/Math.hypot(...sub(b,a))),midStation=(stations[k-1]+stations[k])/2
      for(const point of [a,b]){
        let force:Point=zero,moment:Point=zero
        for(let i=0;i<n;i++)if(restraints[i].station>=midStation){
          force=add(force,scale(restraints[i].force,reaction[i]))
          moment=add(moment,scale(add(restraints[i].moment,cross(sub(restraints[i].point,point),restraints[i].force)),reaction[i]))
        }
        const axial=Math.abs(dot(force,t))/area,torsion=dot(moment,t),bend=Math.sqrt(Math.max(0,dot(moment,moment)-torsion*torsion))
        peak=Math.max(peak,Math.hypot(axial+bend*d/2/inertia,Math.sqrt(3)*Math.abs(torsion)*d/2/(2*inertia)))
      }
    }
    return peak
  }
  return {schema:'had-fixed-inlet-thermal-subroute/1' as const,sourceContext:{pathMm:vertices,guideMm:guidePoint,pipe:input.pipe,temperatureExcursionK:input.temperatureExcursionK},
    method:'Linear three-dimensional thin centreline beam flexibility; both end translations/rotations fixed, optional declared lateral guide with axial slide. Simpson integration is exact for each straight chord flexibility integrand.',
    sourceRouteVertices:vertices.length,fixedPointMm:fixedPoint,lateralGuideMm:guidePoint,fullyFixedTerminalMm:end,
    uniformTemperature:{temperatureExcursionK:input.temperatureExcursionK,freeTerminalTranslationMm:uniformFree.slice(0,3).map(r),
      terminalForceN:reactions.slice(0,3).map(r),terminalMomentNmm:reactions.slice(3,6).map(r),guideLateralForceN:reactions.slice(6).map(r),
      fixedPointForceN:fixed.slice(0,3).map(r),fixedPointMomentNmm:fixed.slice(3).map(r),
      elasticExtremeFibreStressMpa:r(stressCoefficient(reactions)),
      guideFreeAxialThermalTravelMm:guidePoint?r(alpha*(guidePoint[2]-fixedPoint[2])*input.temperatureExcursionK):null,
      guideAxialTravelIncludingElasticMm:guidePoint?r(alpha*(guidePoint[2]-fixedPoint[2])*input.temperatureExcursionK+reactions[2]*(guidePoint[2]-fixedPoint[2])/(E*area)):null},
    independentSegmentTemperatureBound:{eachSegmentAbsoluteExcursionK:input.temperatureExcursionK,
      terminalForceComponentBoundsN:reactionBounds.slice(0,3).map(r),terminalMomentComponentBoundsNmm:reactionBounds.slice(3,6).map(r),guideLateralComponentBoundsN:reactionBounds.slice(6).map(r),fixedPointComponentBoundsN:fixedBounds.slice(0,3).map(r),fixedPointMomentComponentBoundsNmm:fixedBounds.slice(3).map(r),
      interpretation:'Linear absolute-sum force envelope for independently signed segment temperatures; does not depend on uniform-route expansion cancellation. Different component maxima need not be simultaneous.'},
    validity:{actualSlidingGuideFrictionQualified:false,extraClampsOrUnmodelledRestraintsAllowed:false,
      thermalGradientsAcrossTheTubeWallIncluded:false,pipeBendOvalisationOrStressIntensificationIncluded:false,
      pressureDeadloadAndToolActionsIncluded:false,actualValveBodyStiffnessIncluded:false,physicalGuideAndPipeStressAcceptance:false},
    remaining:'Qualify the actual fixed clamp and axial sliding guide, real remaining support positions and terminal stiffness; retain full restrained bound when a guide seizes or runs out of travel. This calculation does not itself select the lighter support or prove tube/fitting stress capacity.'}
}


export type InletFiniteReceiver={baseZMm:number;postAxisXYMm:readonly [number,number];topZMm:number;widthXMm:number;depthYMm:number;wallMm:number;elasticModulusMpa:number;poissonRatio:number}
/** The existing pipe flexibility kernels joined by one finite, fixed-base receiver.
 * End restraints remain the explicit source endpoint laws; this does not invent a Lodge. */
export function compareFixedInletThermalWithReceiver(input:ThermalInput,receiver:InletFiniteReceiver){
  const legacy=compareFixedInletThermalRoute(input)
  if(Object.values(receiver).flat().some(v=>!Number.isFinite(v))||receiver.baseZMm>=input.fixedPointZMm||receiver.topZMm<input.guideZMm||receiver.wallMm<=0||receiver.widthXMm<=2*receiver.wallMm||receiver.depthYMm<=2*receiver.wallMm||receiver.elasticModulusMpa<=0||receiver.poissonRatio<0||receiver.poissonRatio>=.5)throw new Error('Actual finite receiver geometry and positive material law required')
  let upper:ThermalLinearSystem|undefined,lower:ThermalLinearSystem|undefined
  routeFlexibility(legacy.upperSubroute.sourceContext.pathMm,legacy.upperSubroute.sourceContext.guideMm,input,s=>upper=s)
  routeFlexibility(legacy.lowerSubroute.sourceContext.pathMm,null,input,s=>lower=s)
  if(!upper||!lower)throw new Error('Thermal source systems missing')
  const systems=[upper,lower],restraints=[...upper.restraints,...lower.restraints],n=restraints.length,uCount=upper.restraints.length,fixed=legacy.fixedPointMm as Point,guide=[fixed[0],fixed[1],input.guideZMm] as Point
  type W={point:Point;force:Point;moment:Point}
  const postBasis:W[][]=restraints.map((restraint,i)=>{
    const rootMoment=add(restraint.moment,cross(sub(restraint.point,fixed),restraint.force))
    const loads:W[]=[{point:fixed,force:restraint.force,moment:rootMoment}]
    if(i<uCount&&i>=6)loads.push({point:guide,force:scale(restraint.force,-1),moment:zero})
    return loads
  })
  const B=receiver.widthXMm,D=receiver.depthYMm,t=receiver.wallMm,E=receiver.elasticModulusMpa,G=E/(2*(1+receiver.poissonRatio))
  const area=B*D-(B-2*t)*(D-2*t),ix=(B*D**3-(B-2*t)*(D-2*t)**3)/12,iy=(D*B**3-(D-2*t)*(B-2*t)**3)/12,j=4*((B-t)*(D-t))**2/(2*(B+D-2*t)/t)
  const cuts=[...new Set([receiver.baseZMm,input.fixedPointZMm,input.guideZMm,receiver.topZMm])].sort((a,b)=>a-b)
  const field=(loads:readonly W[],z:number)=>{
    let force:Point=zero,moment:Point=zero
    const at:Point=[...receiver.postAxisXYMm,z]
    for(const load of loads)if(load.point[2]>=z-1e-9){force=add(force,load.force);moment=add(moment,add(load.moment,cross(sub(load.point,at),load.force)))}
    return {force,moment}
  }
  const product=(a:readonly W[],b:readonly W[])=>{
    let out=0
    for(let k=1;k<cuts.length;k++)for(const [fraction,weight] of [[0,1/6],[.5,4/6],[1,1/6]]){
      // At a point-load boundary the value on its lower segment belongs to that segment.
      const z=cuts[k-1]+(cuts[k]-cuts[k-1])*fraction,mid=(cuts[k-1]+cuts[k])/2
      const fa=field(a.filter(l=>l.point[2]>=mid),z),fb=field(b.filter(l=>l.point[2]>=mid),z)
      out+=(cuts[k]-cuts[k-1])*weight*(fa.force[2]*fb.force[2]/(E*area)+fa.moment[0]*fb.moment[0]/(E*ix)+fa.moment[1]*fb.moment[1]/(E*iy)+fa.moment[2]*fb.moment[2]/(G*j))
    }
    return out
  }
  const postMatrix=postBasis.map(a=>postBasis.map(b=>product(a,b))),matrix=postMatrix.map(row=>[...row])
  let offset=0
  for(const system of systems){for(let i=0;i<system.matrix.length;i++)for(let k=0;k<system.matrix.length;k++)matrix[offset+i][offset+k]+=system.matrix[i][k];offset+=system.matrix.length}
  const thermalVectors=systems.flatMap((system,index)=>system.expansions.map(v=>[...Array<number>(index===0?0:uCount).fill(0),...v,...Array<number>(index===0?lower!.restraints.length:0).fill(0)]))
  const uniformFree=thermalVectors.reduce((a,v)=>a.map((n,i)=>n+v[i]),Array<number>(n).fill(0)),responses=thermalVectors.map(v=>solve(matrix,v.map(a=>-a))),uniform=solve(matrix,uniformFree.map(a=>-a*input.temperatureExcursionK))
  const rootWrench=(reaction:readonly number[])=>{
    let force:Point=zero,moment:Point=zero
    restraints.forEach((restraint,i)=>{force=add(force,scale(restraint.force,-reaction[i]));moment=add(moment,scale(add(restraint.moment,cross(sub(restraint.point,fixed),restraint.force)),-reaction[i]))})
    return [...force,...moment]
  }
  const segmentRoot=responses.map(rootWrench),rootBound=Array.from({length:6},(_,i)=>segmentRoot.reduce((sum,w)=>sum+Math.abs(w[i])*input.temperatureExcursionK,0))
  const pointMovement=(point:Point)=>Array.from({length:6},(_,component)=>{
    const virtual:W={point,force:component<3?basis[component]:zero,moment:component>=3?basis[component-3]:zero},coefficients=postBasis.map(loads=>product([virtual],loads))
    return {uniform:coefficients.reduce((sum,a,i)=>sum+a*uniform[i],0),bound:responses.reduce((sum,v)=>sum+Math.abs(v.reduce((n,a,i)=>n+a*coefficients[i],0))*input.temperatureExcursionK,0)}
  })
  const rootMove=pointMovement(fixed),guideMove=pointMovement(guide),uniformWrench=rootWrench(uniform)
  const compatibilityResidual=Math.max(...uniformFree.map((value,i)=>Math.abs(value*input.temperatureExcursionK+matrix[i].reduce((sum,a,k)=>sum+a*uniform[k],0))))
  return {schema:'had-inlet-finite-receiver-thermal/1' as const,sourceContext:{input,receiver},
    method:'Same upper/lower3D tube-flexibility kernels, joined by exact Simpson receiver strain-energy integrals and all physical fixed/guide lever moments. One14-redundant compatible solve; independently signed segment temperatures retained. Fixed-base post, rigid arms and source six-axis endpoint laws are explicit comparison assumptions.',
    fixedPointMm:fixed,fixedPointWrench:{pointMm:fixed,forceComponentBoundsN:rootBound.slice(0,3).map(r),momentComponentBoundsNmm:rootBound.slice(3).map(r),uniformForceN:uniformWrench.slice(0,3).map(r),uniformMomentNmm:uniformWrench.slice(3).map(r)},
    guideWrench:{pointMm:guide,forceComponentBoundsN:[...Array.from({length:2},(_,i)=>r(responses.reduce((sum,v)=>sum+Math.abs(v[6+i])*input.temperatureExcursionK,0))),0],axialSlide:true,actualGripAndFrictionQualified:false},
    fixedPointReceiverMotion:{uniformTranslationMm:rootMove.slice(0,3).map(v=>r(v.uniform)),translationBoundsMm:rootMove.slice(0,3).map(v=>r(v.bound)),rotationBoundsRad:rootMove.slice(3).map(v=>r(v.bound))},
    guideReceiverMotion:{uniformTranslationMm:guideMove.slice(0,3).map(v=>r(v.uniform)),translationBoundsMm:guideMove.slice(0,3).map(v=>r(v.bound))},
    compatibilityResidual:r(compatibilityResidual),postComplianceSymmetryError:r(Math.max(...postMatrix.flatMap((row,i)=>row.map((v,k)=>Math.abs(v-postMatrix[k][i]))))),
    upperTerminalWrench:{pointMm:upper.restraints[0].point,forceComponentBoundsN:Array.from({length:3},(_,i)=>r(responses.reduce((n,v)=>n+Math.abs(v[i])*input.temperatureExcursionK,0))),momentComponentBoundsNmm:Array.from({length:3},(_,i)=>r(responses.reduce((n,v)=>n+Math.abs(v[3+i])*input.temperatureExcursionK,0)))},
    outerTerminalWrench:{pointMm:lower.restraints[0].point,forceComponentBoundsN:Array.from({length:3},(_,i)=>r(responses.reduce((n,v)=>n+Math.abs(v[uCount+i])*input.temperatureExcursionK,0))),momentComponentBoundsNmm:Array.from({length:3},(_,i)=>r(responses.reduce((n,v)=>n+Math.abs(v[uCount+3+i])*input.temperatureExcursionK,0)))},
    rigidReceiverControl:legacy,actualTerminalClampFittingAndFloorStiffnessQualified:false,completeInstalledThermalAcceptance:false}
}


export type InletExplicitThermalRoute={pathMm:readonly Point[];fixedPointMm:Point;guide?:{pointMm:Point;freeAxisMm:Point};pipe:ThermalInput['pipe'];temperatureExcursionK:number}
/** Same existing flexibility kernel, with an actual fixed station and optional
 * straight sliding guide in any cardinal direction. This is a comparison law,
 * never a declaration that the remaining network has those restraints. */
export function compareInletRouteThermal(i:InletExplicitThermalRoute){
 const finite=(p:readonly number[])=>p.length===3&&p.every(Number.isFinite),pipe=i.pipe
 if(!Array.isArray(i.pathMm)||i.pathMm.length<3||i.pathMm.some(p=>!finite(p))||!finite(i.fixedPointMm)||Math.hypot(...sub(i.pathMm[0],i.fixedPointMm))>1e-8
  ||!pipe||!Object.values(pipe).every(Number.isFinite)||pipe.wallMm<=0||pipe.outerDiameterMm<=2*pipe.wallMm||pipe.elasticModulusMpa<=0||pipe.poissonRatio<0||pipe.poissonRatio>=.5||pipe.expansionMmMK<=0
  ||!Number.isFinite(i.temperatureExcursionK)||i.temperatureExcursionK<0||i.temperatureExcursionK>80)throw Error('Actual explicit thermal route and positive pipe properties required')
 const path=i.pathMm.map(p=>[...p] as Point)
 if(path.slice(1).some((p,k)=>Math.hypot(...sub(p,path[k]))<1e-8))throw Error('Duplicate thermal route station')
 let Q:readonly Point[]=basis,guideIndex=-1
 if(i.guide){
  const axis=i.guide.freeAxisMm,p=i.guide.pointMm
  if(!finite(p)||!finite(axis)||axis.filter(v=>Math.abs(v)===1).length!==1||axis.some(v=>v!==0&&Math.abs(v)!==1))throw Error('Actual cardinal sliding guide axis required')
  const first=Math.abs(dot(axis,basis[0]))<.5?basis[0]:basis[1],second=cross(axis,first)
  Q=[first,second,axis]
  const leg=path.slice(1).findIndex((b,k)=>{const delta=sub(b,path[k]),l=Math.hypot(...delta),t=dot(sub(p,path[k]),delta)/(l*l);return t>=-1e-10&&t<=1+1e-10&&Math.hypot(...sub(add(path[k],scale(delta,t)),p))<1e-7})
  if(leg<0)throw Error('Sliding guide must lie on the actual straight route')
  guideIndex=path.findIndex(v=>Math.hypot(...sub(v,p))<1e-7)
  if(guideIndex<0){path.splice(leg+1,0,[...p]);guideIndex=leg+1}
  if(guideIndex===0||guideIndex===path.length-1)throw Error('Guide cannot replace either fixed endpoint')
 }
 const local=(p:Point)=>Q.map(row=>dot(row,sub(p,i.fixedPointMm))) as unknown as Point,
  world=(v:readonly number[])=>basis.map((_,j)=>Q.reduce((n,row,k)=>n+row[j]*(v[k]??0),0)),
  bound=(v:readonly number[])=>basis.map((_,j)=>Q.reduce((n,row,k)=>n+Math.abs(row[j])*(v[k]??0),0)),
  vertices=path.map(local),guide=guideIndex>=0?vertices[guideIndex]:null,
  input:ThermalInput={pathMm:vertices,fixedPointZMm:0,guideZMm:guide?.[2]??1,temperatureExcursionK:i.temperatureExcursionK,pipe},
  result=routeFlexibility(vertices,guide,input),u=result.uniformTemperature,b=result.independentSegmentTemperatureBound,
  area=Math.PI/4*(pipe.outerDiameterMm**2-(pipe.outerDiameterMm-2*pipe.wallMm)**2),
  alpha=pipe.expansionMmMK/1000
 return{schema:'had-explicit-station-thermal-comparison/1',sourceContext:i,localBasisRows:Q,
  fixedPointMm:i.fixedPointMm,guide:i.guide??null,terminalPointMm:path.at(-1)!,
  uniform:{freeTerminalTranslationMm:world(u.freeTerminalTranslationMm),fixedForceN:world(u.fixedPointForceN),fixedMomentNmm:world(u.fixedPointMomentNmm),
   terminalForceN:world(u.terminalForceN),terminalMomentNmm:world(u.terminalMomentNmm),guideForceN:world([...u.guideLateralForceN,0]),elasticExtremeFibreStressMPa:u.elasticExtremeFibreStressMpa},
  independentSegmentBounds:{fixedForceN:bound(b.fixedPointComponentBoundsN),fixedMomentNmm:bound(b.fixedPointMomentComponentBoundsNmm),
   terminalForceN:bound(b.terminalForceComponentBoundsN),terminalMomentNmm:bound(b.terminalMomentComponentBoundsNmm),guideForceN:bound([...b.guideLateralComponentBoundsN,0]),
   differentComponentMaximaNeedNotBeSimultaneous:true},
  whollyRestrainedStraightControl:{forceN:pipe.elasticModulusMpa*area*alpha*i.temperatureExcursionK,stressMPa:pipe.elasticModulusMpa*alpha*i.temperatureExcursionK,
   interpretation:'Separate straight-segment/seized restraint challenge; not substituted by the flexible-route result.'},
  sourceKernel:{schema:result.schema,vertices:result.sourceRouteVertices,method:result.method},
  actualJointGuideNetworkStiffnessAndFrictionQualified:false,actualPressureGravityAndToolActionsIncluded:false,
  actualBendOvalisationAndStressIntensificationIncluded:false,guideFreeTravelIncludingBendingSolved:false,
  allComponentAndReceiverResistanceAccepted:false,nativeStructuralActionsAdopted:false,
  interpretation:'Six-DOF fixed endpoint comparison, rigid tube/fitting beam joints and zero-friction axial guide. Both force AND moment envelopes preserved in actual world axes. Existing simple-riser guide travel shortcut is deliberately not used for this arbitrary route.'}
}
