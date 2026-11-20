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

function routeFlexibility(vertices:readonly Point[],guidePoint:Point|null,input:ThermalInput){
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
