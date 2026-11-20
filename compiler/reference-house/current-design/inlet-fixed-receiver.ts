type Point = readonly [number,number,number]
type Box = readonly [number,number,number,number,number,number]
type Load = {readonly xMm:number;readonly normalN:number;readonly verticalN:number}
const r=(n:number)=>Number(n.toFixed(6))||0
const section=(normal:number,vertical:number,wall:number)=>({
  areaMm2:normal*vertical-(normal-2*wall)*(vertical-2*wall),
  normalInertiaMm4:(vertical*normal**3-(vertical-2*wall)*(normal-2*wall)**3)/12,
  verticalInertiaMm4:(normal*vertical**3-(normal-2*wall)*(vertical-2*wall)**3)/12,
})
export const fixedInletReceiverFacts={
  steel:{elasticModulusMpa:200000,densityKgM3:8000,comparisonProofStressMpa:200,
    source:'https://www.thyssenkrupp-materials.co.uk/stainless-steel-316-14401.html/index.html',
    status:'bare stainless fabricated reference sections; exact stock, weld filler, proof stress and complete constituents require certificates'},
  anchor:{model:'fischer FAZ II Plus12/10R',article:'564619',drillDiameterMm:12,standardEffectiveDepthMm:70,
    reducedEffectiveDepthMm:50,standardFixtureMm:10,reducedFixtureMm:30,minimumMemberThicknessAt50Mm:100,
    source:'https://www.fischer.co.uk/-/media/fixing-systems/rebrush/fiint/service/informationmaterial/documents/catalogues/installation-systems.pdf',
    loadTable:'https://fiproductmedia.azureedge.net/media/Load%20Tables/Load%20Tables%20fischer/LT_01-FAZ-II-PLUS-EN.pdf',
    isolatedCrackedC20PermissibleTensionAt50N:5800,isolatedCrackedC20PermissibleShearAt50N:18000,
    tableBoundary:'Isolated anchor requires spacing≥3hef and edges≥1.5hef. Group/combined action and concrete splitting need the fullETA19/0520 and EN1992-4. These catalogue values are a screen, not this group resistance.',
    constituents:'stainless mechanical anchor comparison; exact alloy, lubricant/coating and supplied constituents require disclosure; no resin is proposed'},
} as const

export function inletReceiverBeam(spanMm:number,loads:readonly {readonly xMm:number;readonly forceN:number}[],uniformNPerMm=0) {
  if(!(spanMm>0)||loads.some(load=>load.xMm<0||load.xMm>spanMm))throw new Error('Loads must lie on the actual receiver span')
  const left=loads.reduce((n,l)=>n+l.forceN*(spanMm-l.xMm)/spanMm,uniformNPerMm*spanMm/2)
  const right=loads.reduce((n,l)=>n+l.forceN*l.xMm/spanMm,uniformNPerMm*spanMm/2)
  const at=(x:number)=>left*x-loads.reduce((n,l)=>n+l.forceN*Math.max(0,x-l.xMm),0)-uniformNPerMm*x*x/2
  const breaks=[0,...loads.map(l=>l.xMm),spanMm].sort((a,b)=>a-b)
  const critical=[...breaks]
  if(uniformNPerMm)for(let i=1;i<breaks.length;i++){
    const lo=breaks[i-1],hi=breaks[i],passed=loads.filter(l=>l.xMm<=lo).reduce((n,l)=>n+l.forceN,0)
    const point=(left-passed)/uniformNPerMm
    if(point>lo&&point<hi)critical.push(point)
  }
  return {leftN:left,rightN:right,maximumAbsoluteMomentNmm:Math.max(...critical.map(x=>Math.abs(at(x)))),
    forceResidualN:r(left+right-loads.reduce((n,l)=>n+l.forceN,0)-uniformNPerMm*spanMm),
    momentResidualNmm:r(right*spanMm-loads.reduce((n,l)=>n+l.forceN*l.xMm,0)-uniformNPerMm*spanMm**2/2)}
}

type Wrench={readonly pointMm:readonly number[];readonly forceComponentBoundsN:readonly number[];readonly momentComponentBoundsNmm:readonly number[]}
export const fixedInletSupportLayout={fixedPointZMm:850,upperRailZMm:1450,guideZMm:1680} as const
type Input={
  readonly layout?:{readonly fixedPointZMm:number;readonly upperRailZMm:number;readonly guideZMm:number}
  readonly jambAxesXMm:readonly number[]
  readonly jambNormalFacesYMm:readonly number[]
  readonly jambAlongWidthMm:number
  readonly finishedWallYMm:number
  readonly sourceCage:{readonly longitudinalDiameterMm:number;readonly transverseDiameterMm:number|null;
    readonly normalBarAxesMm:readonly number[];readonly alongBarOffsetsMm:readonly number[];readonly requiredCoverMm:number}
  readonly branches:readonly {readonly id:string;readonly pipeAxisXMm:number;readonly riserYMm:number;
    readonly pressureEndForceN:number;readonly fullyRestrainedThermalForceN:number;readonly guidedThermalActions?:{readonly fixedPointWrench:Wrench;readonly guideWrench:Wrench};readonly knownStockMassKg:number;readonly lowerRepairCutZMm:number;readonly secondUpperRepairCutZMm:number}[]
  readonly pipe:{readonly outerDiameterMm:number;readonly wallMm:number;readonly stockMassKgM:number}
  readonly toolActionN:number|null
}

export function compareFixedInletReceiver(input:Input,design:'full-restraint'|'guided-route'='full-restraint') {
  const layout=input.layout??fixedInletSupportLayout
  if(layout.fixedPointZMm!==850||layout.upperRailZMm!==1450||!Number.isFinite(layout.guideZMm)||layout.guideZMm<1600||layout.guideZMm>2000)throw new Error('Receiver requires the declared fixed point, rail and actual guide within1600..2000')
  const axes=[...input.jambAxesXMm].sort((a,b)=>a-b),west=axes[0],east=axes[1],span=east-west
  if(axes.length!==2||!(span>0)||input.branches.length!==2)throw new Error('Receiver requires both actual jambs and pressure branches')
  if(input.toolActionN!==null&&(!Number.isFinite(input.toolActionN)||input.toolActionN<0))throw new Error('A tool action is a declared force or explicit unknown')
  if(input.sourceCage.transverseDiameterMm!==null&&(typeof input.sourceCage.transverseDiameterMm!=='number'||!Number.isFinite(input.sourceCage.transverseDiameterMm)||input.sourceCage.transverseDiameterMm<=0))throw new Error('A transverse diameter is a positive authored comparison or explicit unknown')
  if(design==='guided-route'&&input.branches.some(b=>{
    const actions=b.guidedThermalActions
    return !actions||[actions.fixedPointWrench,actions.guideWrench].some((w,i)=>
      [w.pointMm,w.forceComponentBoundsN,w.momentComponentBoundsNmm].some(v=>v.length!==3||v.some(n=>!Number.isFinite(n)))||
      [...w.forceComponentBoundsN,...w.momentComponentBoundsNmm].some(n=>n<0)||w.pointMm[0]!==b.pipeAxisXMm||w.pointMm[1]!==b.riserYMm||w.pointMm[2]!==(i===0?layout.fixedPointZMm:layout.guideZMm))
  }))throw new Error('The ordinary receiver requires complete source-positioned fixed-point and guide force/moment bounds for each branch')
  const wrench=(b:Input['branches'][number],index:number):Wrench=>design==='guided-route'?
    (index===0?b.guidedThermalActions!.fixedPointWrench:b.guidedThermalActions!.guideWrench):
    {pointMm:[b.pipeAxisXMm,b.riserYMm,index===0?layout.fixedPointZMm:layout.guideZMm],
      forceComponentBoundsN:index===0?[2*b.fullyRestrainedThermalForceN,2*b.fullyRestrainedThermalForceN,2*b.fullyRestrainedThermalForceN]:[b.fullyRestrainedThermalForceN,b.fullyRestrainedThermalForceN,0],momentComponentBoundsNmm:[0,0,0]}
  const face=Math.max(...input.jambNormalFacesYMm),back=Math.min(...input.jambNormalFacesYMm)
  const steel=fixedInletReceiverFacts.steel,anchor=fixedInletReceiverFacts.anchor
  const rail={normalMm:design==='guided-route'?60:80,verticalMm:design==='guided-route'?80:120,wallMm:design==='guided-route'?4:8,axisYMm:480,levelsZMm:[layout.fixedPointZMm,layout.upperRailZMm] as const}
  const railSection=section(rail.normalMm,rail.verticalMm,rail.wallMm)
  const railWeightNPerMm=railSection.areaMm2*steel.densityKgM3/1e9*9.81
  const plate={alongMm:150,normalMm:design==='guided-route'?16:30,bottomZMm:design==='guided-route'?650:200,topZMm:design==='guided-route'?1750:1740}
  const rowZ=design==='guided-route'?Array.from({length:6},(_,i)=>700+200*i):Array.from({length:10},(_,i)=>250+160*i),centreZ=rowZ.reduce((n,z)=>n+z,0)/rowZ.length
  const rowSquared=rowZ.reduce((n,z)=>n+(z-centreZ)**2,0)
  const arm={normalLengthMm:Math.max(...input.branches.map(b=>b.riserYMm-35))-(rail.axisYMm+rail.normalMm/2),alongMm:40,verticalMm:60,wallMm:design==='guided-route'?4:6}
  const armSection=section(arm.alongMm,arm.verticalMm,arm.wallMm)
  const post={squareMm:design==='guided-route'?40:60,wallMm:design==='guided-route'?3:6,fromZMm:layout.upperRailZMm+rail.verticalMm/2,toZMm:layout.guideZMm+arm.verticalMm/2,guideZMm:layout.guideZMm}
  const postSection=section(post.squareMm,post.squareMm,post.wallMm)
  const railMass=2*railSection.areaMm2*span/1e9*steel.densityKgM3
  const plateMass=2*plate.alongMm*plate.normalMm*(plate.topZMm-plate.bottomZMm)/1e9*steel.densityKgM3
  const armMass=input.branches.reduce((sum,b)=>sum+armSection.areaMm2*(b.riserYMm-35-rail.axisYMm-rail.normalMm/2+b.riserYMm-35-rail.axisYMm-post.squareMm/2)/1e9*steel.densityKgM3,0)
  const postMass=2*postSection.areaMm2*(post.toZMm-post.fromZMm)/1e9*steel.densityKgM3
  const mountingPlateMass=input.branches.length*2*40*5*60/1e9*steel.densityKgM3
  const packingDepth=30-plate.normalMm,weldPadDepth=rail.axisYMm-rail.normalMm/2-face-30
  const packingMass=2*rowZ.length*90*60*packingDepth/1e9*steel.densityKgM3
  const weldPadMass=4*75*rail.verticalMm*weldPadDepth/1e9*steel.densityKgM3
  const knownFrameMass=railMass+plateMass+armMass+postMass+mountingPlateMass+packingMass+weldPadMass
  const gravityPoints=rail.levelsZMm.map((z,index)=>[
    ...input.branches.flatMap(b=>{
      const start=rail.axisYMm+(index===0?rail.normalMm/2:post.squareMm/2),length=b.riserYMm-35-start,level=index===0?z:post.guideZMm
      return [{id:b.id+'-arm',pointMm:[b.pipeAxisXMm,start+length/2,level],massKg:armSection.areaMm2*length/1e9*steel.densityKgM3},
        {id:b.id+'-mounting-plate',pointMm:[b.pipeAxisXMm,b.riserYMm-32.5,level],massKg:mountingPlateMass/4},
        ...(index===1?[{id:b.id+'-post',pointMm:[b.pipeAxisXMm,rail.axisYMm,(post.fromZMm+post.toZMm)/2],massKg:postMass/2}]:[])]
    }),
    ...axes.map((x,i)=>({id:'weld-pad-'+i,pointMm:[x+(i===0?37.5:-37.5),face+30+weldPadDepth/2,z],massKg:weldPadMass/4}))
  ])
  const railGravityWallMoment=(railMass*9.81*Math.abs(rail.axisYMm-face)+gravityPoints.flat().reduce((sum,p)=>sum+p.massKg*9.81*Math.abs(p.pointMm[1]-face),0))
  const directPlateGravityWallMoment=(plateMass*9.81*(packingDepth+plate.normalMm/2)+packingMass*9.81*packingDepth/2)/2
  const waterMass=(b:Input['branches'][number])=>b.knownStockMassKg/input.pipe.stockMassKgM*Math.PI*((input.pipe.outerDiameterMm-2*input.pipe.wallMm)/1000)**2/4*1000
  const cases=Array.from({length:64},(_,mask)=>{
    const lower:Load[]=input.branches.map((b,i)=>({xMm:b.pipeAxisXMm-west,
      normalN:((mask&(1<<(3*i)))?1:-1)*(b.pressureEndForceN+wrench(b,0).forceComponentBoundsN[1]),
      verticalN:((mask&(1<<(3*i+1)))?1:-1)*(b.pressureEndForceN+wrench(b,0).forceComponentBoundsN[2])-(b.knownStockMassKg+waterMass(b))*9.81}))
    const upper:Load[]=input.branches.map((b,i)=>({xMm:b.pipeAxisXMm-west,
      normalN:((mask&(1<<(3*i+2)))?1:-1)*wrench(b,1).forceComponentBoundsN[1],verticalN:0}))
    const results=[lower,upper].map((loads,index)=>{
      const normal=inletReceiverBeam(span,loads.map(l=>({xMm:l.xMm,forceN:l.normalN})))
      const vertical=inletReceiverBeam(span,[...loads.map(l=>({xMm:l.xMm,forceN:l.verticalN})),
        ...gravityPoints[index].map(p=>({xMm:p.pointMm[0]-west,forceN:-p.massKg*9.81}))],-railMass/2*9.81/span)
      const local=loads.map((load,j)=>{
        const b=input.branches[j],w=wrench(b,index),ry=b.riserYMm-rail.axisYMm,rz=index===0?0:layout.guideZMm-layout.upperRailZMm,fx=w.forceComponentBoundsN[0]
        return {forceXBoundN:fx,momentBoundsNmm:[w.momentComponentBoundsNmm[0]+Math.abs(ry*load.verticalN)+Math.abs(rz*load.normalN),
          w.momentComponentBoundsNmm[1]+Math.abs(rz)*fx,w.momentComponentBoundsNmm[2]+Math.abs(ry)*fx]}
      })
      const momentBounds=[0,1,2].map(k=>local.reduce((sum,l)=>sum+l.momentBoundsNmm[k],0))
      momentBounds[0]+=gravityPoints[index].reduce((sum,p)=>sum+p.massKg*9.81*Math.abs(p.pointMm[1]-rail.axisYMm),0)
      const axialForceBound=local.reduce((sum,l)=>sum+l.forceXBoundN,0)
      const normalBending=normal.maximumAbsoluteMomentNmm+momentBounds[2]
      const verticalBending=vertical.maximumAbsoluteMomentNmm+momentBounds[1]
      const stress=normalBending/(railSection.normalInertiaMm4/(rail.normalMm/2))+
        verticalBending/(railSection.verticalInertiaMm4/(rail.verticalMm/2))+axialForceBound/railSection.areaMm2
      const torsionalShearMpa=momentBounds[0]/(2*(rail.normalMm-rail.wallMm)*(rail.verticalMm-rail.wallMm)*rail.wallMm)
      return {rail:index===0?'lower-fixed-point':'upper-guide',normal,vertical,localPointWrenchEnvelopes:local,
        normalBendingMomentEnvelopeNmm:normalBending,verticalBendingMomentEnvelopeNmm:verticalBending,
        torsionalMomentEnvelopeNmm:momentBounds[0],torsionalShearMpa,axialForceEnvelopeN:axialForceBound,
        additionalNormalBearingBoundN:momentBounds[2]/span,additionalVerticalBearingBoundN:momentBounds[1]/span,
        combinedExtremeFibreStressMpa:Math.hypot(stress,Math.sqrt(3)*torsionalShearMpa)}
    })
    const jambs=['west','east'].map((name,i)=>{
      const key=i===0?'leftN':'rightN'
      const normalN=results.reduce((n,row)=>n+row.normal[key],0)
      const verticalN=results.reduce((n,row)=>n+row.vertical[key],0)-(plateMass+packingMass)*9.81/2
      const globalMoment=results.reduce((n,row,j)=>n-((j===0?layout.fixedPointZMm:post.guideZMm)-centreZ)*row.normal[key],0)+
        input.branches.reduce((n,b)=>n+(b.riserYMm-face)*lower[input.branches.indexOf(b)].verticalN*(i===0?(east-b.pipeAxisXMm)/span:(b.pipeAxisXMm-west)/span),0)
      const normalByAnchor=rowZ.map(z=>normalN/rowZ.length+globalMoment*(z-centreZ)/rowSquared)
      const shearPerAnchor=verticalN/rowZ.length
      const normalExtra=results.reduce((n,row)=>n+row.additionalNormalBearingBoundN,0)
      const verticalExtra=results.reduce((n,row)=>n+row.additionalVerticalBearingBoundN,0)
      const horizontalExtra=results.reduce((n,row)=>n+row.axialForceEnvelopeN,0)
      const intrinsicMx=input.branches.reduce((sum,b)=>{
        const share=i===0?(east-b.pipeAxisXMm)/span:(b.pipeAxisXMm-west)/span
        return sum+(wrench(b,0).momentComponentBoundsNmm[0]+wrench(b,1).momentComponentBoundsNmm[0])*share
      },0)
      const mxExtra=intrinsicMx+railGravityWallMoment+directPlateGravityWallMoment+normalExtra*Math.max(...rail.levelsZMm.map(z=>Math.abs(z-centreZ)))+
        verticalExtra*Math.max(...input.branches.map(b=>Math.abs(b.riserYMm-face)))
      return {jamb:name,normalN,verticalN,momentAboutAnchorCentroidNmm:globalMoment,
        pointCoupleAndAxialAdditions:{normalN:normalExtra,verticalN:verticalExtra,horizontalN:horizontalExtra,momentAboutXBoundNmm:mxExtra,
          frameGravityWallMomentBoundNmm:railGravityWallMoment+directPlateGravityWallMoment},
        anchors:rowZ.map((z,k)=>{
          const nBound=Math.abs(normalByAnchor[k])+normalExtra/rowZ.length+mxExtra*Math.abs(z-centreZ)/rowSquared
          const vzBound=Math.abs(shearPerAnchor)+verticalExtra/rowZ.length,vxBound=horizontalExtra/rowZ.length
          return {pointMm:[axes[i],face,z] as Point,baseNormalN:normalByAnchor[k],baseVerticalShearN:shearPerAnchor,
            normalEnvelopeN:nBound,verticalShearEnvelopeN:vzBound,horizontalShearEnvelopeN:vxBound,
            isolatedCatalogueLinearInteraction:nBound/anchor.isolatedCrackedC20PermissibleTensionAt50N+
              Math.hypot(vzBound,vxBound)/anchor.isolatedCrackedC20PermissibleShearAt50N}
        }),
        forceResidualN:r(normalByAnchor.reduce((n,a)=>n+a,0)-normalN),
        momentResidualNmm:r(normalByAnchor.reduce((n,a,k)=>n+a*(rowZ[k]-centreZ),0)-globalMoment),
        residualScope:'Base signed force system only; independent point couples and axial actions are retained as explicit additional envelopes, not a fabricated single simultaneous case'}
    })
    return {mask,railResults:results,jambs}
  })
  const forceMax=Math.max(...input.branches.map(b=>b.pressureEndForceN+Math.max(...wrench(b,0).forceComponentBoundsN)))
  const fixedMomentBounds=[0,1,2].map(k=>Math.max(...input.branches.map(b=>wrench(b,0).momentComponentBoundsNmm[k])))
  const fixedX=Math.max(...input.branches.map(b=>wrench(b,0).forceComponentBoundsN[0]))
  const localSteelGravityBound=Math.max(...input.branches.map(b=>gravityPoints.flat().filter(p=>p.id.startsWith(b.id+'-')).reduce((sum,p)=>sum+p.massKg*9.81,0)))
  const armLength=Math.max(arm.normalLengthMm,...input.branches.map(b=>b.riserYMm-rail.axisYMm-post.squareMm/2))
  const armNormal=forceMax/armSection.areaMm2+((forceMax+localSteelGravityBound)*armLength+fixedMomentBounds[0])/(armSection.verticalInertiaMm4/(arm.verticalMm/2))+
    (fixedX*armLength+fixedMomentBounds[2])/(armSection.normalInertiaMm4/(arm.alongMm/2))
  const armShear=fixedMomentBounds[1]/(2*(arm.alongMm-arm.wallMm)*(arm.verticalMm-arm.wallMm)*arm.wallMm)
  const armStress=Math.hypot(armNormal,Math.sqrt(3)*armShear)
  const guideForceBounds=[0,1,2].map(k=>Math.max(...input.branches.map(b=>wrench(b,1).forceComponentBoundsN[k])))
  const guideMomentBounds=[0,1,2].map(k=>Math.max(...input.branches.map(b=>wrench(b,1).momentComponentBoundsNmm[k])))
  const postStress=(guideForceBounds[2]+localSteelGravityBound)/postSection.areaMm2+
    ((guideForceBounds[0]+guideForceBounds[1])*(post.guideZMm-layout.upperRailZMm)+localSteelGravityBound*armLength+guideMomentBounds.reduce((n,m)=>n+m,0))/(postSection.normalInertiaMm4/(post.squareMm/2))
  const maxRailStress=Math.max(...cases.flatMap(c=>c.railResults.map(row=>row.combinedExtremeFibreStressMpa)))
  const weld={legMm:design==='guided-route'?4:8,throatMm:(design==='guided-route'?4:8)/Math.SQRT2,rectangleAlongMm:75,rectangleVerticalMm:rail.verticalMm}
  const weldLength=2*(weld.rectangleAlongMm+weld.rectangleVerticalMm)
  const weldI=weld.throatMm*(2*weld.rectangleAlongMm*(weld.rectangleVerticalMm/2)**2+2*weld.rectangleVerticalMm**3/12)
  const maxRailMoment=Math.max(...cases.flatMap(c=>c.railResults.map(row=>row.normalBendingMomentEnvelopeNmm)))
  const maxVerticalMoment=Math.max(...cases.flatMap(c=>c.railResults.map(row=>row.verticalBendingMomentEnvelopeNmm)))
  const maxTorque=Math.max(...cases.flatMap(c=>c.railResults.map(row=>row.torsionalMomentEnvelopeNmm)))
  const maxEndNormal=Math.max(...cases.flatMap(c=>c.railResults.flatMap(row=>[Math.abs(row.normal.leftN),Math.abs(row.normal.rightN)])))
  const weldIz=weld.throatMm*(2*weld.rectangleVerticalMm*(weld.rectangleAlongMm/2)**2+2*weld.rectangleAlongMm**3/12)
  const weldNormal=maxEndNormal/(weld.throatMm*weldLength)+maxTorque/(weldI/(weld.rectangleVerticalMm/2))+maxRailMoment/(weldIz/(weld.rectangleAlongMm/2))
  const weldShear=maxVerticalMoment*Math.hypot(weld.rectangleAlongMm/2,weld.rectangleVerticalMm/2)/(weldI+weldIz)
  const weldStress=Math.hypot(weldNormal,Math.sqrt(3)*weldShear)
  const backplateStress=maxEndNormal*(design==='guided-route'?200:160)/4/(plate.alongMm*plate.normalMm**2/6)+maxTorque/(plate.alongMm*plate.normalMm**2/6)+maxRailMoment/(rail.verticalMm*plate.normalMm**2/6)
  const longitudinalOutsideCover=Math.min(...input.sourceCage.normalBarAxesMm.flatMap(q=>[q-back,face-q]))-input.sourceCage.longitudinalDiameterMm/2
  const transverseComparison=(diameterMm:number)=>({status:'authored-nominal-sensitivity-not-source-schedule' as const,
    transverseDiameterMm:diameterMm,nominalOutsideCoverMm:longitudinalOutsideCover-diameterMm,
    requiredCoverScreenMm:input.sourceCage.requiredCoverMm,meetsNominalCoverScreen:longitudinalOutsideCover-diameterMm>=input.sourceCage.requiredCoverMm,
    installedSourceConfinementPass:false,sourceCageRepairAdopted:false})
  const authoredTransverseComparison=input.sourceCage.transverseDiameterMm===null?null:transverseComparison(input.sourceCage.transverseDiameterMm)
  const edge=input.jambAlongWidthMm/2-5,spacing=160-10,drillToBar=Math.min(...input.sourceCage.alongBarOffsetsMm.map(x=>Math.abs(x)))-input.sourceCage.longitudinalDiameterMm/2-anchor.drillDiameterMm/2-5
  const parkingClear=Math.min(...input.branches.map(b=>b.lowerRepairCutZMm-96-layout.fixedPointZMm-10-5))
  const guideHoodClear=Math.min(...input.branches.map(b=>post.guideZMm-30-(b.secondUpperRepairCutZMm+98)-5))
  const diagnostics=[
    ...(parkingClear<0?['FIXED_CLAMP_INTERCEPTS_REAL_LOWER_COUPLING_PARK']:[]),
    ...(guideHoodClear<0?['UPPER_GUIDE_ARM_INTERCEPTS_REAL_HOOD_CAP']:[]),
    'SOURCE_JAMB_TRANSVERSE_SCHEDULE_UNRESOLVED',
    ...(authoredTransverseComparison&&!authoredTransverseComparison.meetsNominalCoverScreen?['AUTHORED_JAMB_TRANSVERSE_COMPARISON_FAILS_NOMINAL_COVER_SCREEN']:[]),
    ...(input.toolActionN===null?['ACTUAL_TOOL_AND_COUNTERHOLD_ACTION_UNKNOWN']:['TOOL_VECTOR_AND_APPLICATION_POINT_NOT_BOUND']),
    ...(maxRailStress>steel.comparisonProofStressMpa?['NEAR_RAIL_ELASTIC_COMPARISON_FAILS']:[]),
    ...(armStress>steel.comparisonProofStressMpa?['FIXED_POINT_ARM_ELASTIC_COMPARISON_FAILS']:[]),
    ...(postStress>steel.comparisonProofStressMpa?['UPPER_GUIDE_POST_ELASTIC_COMPARISON_FAILS']:[]),
    ...(weldStress>steel.comparisonProofStressMpa?['END_WELD_ELASTIC_COMPARISON_FAILS']:[]),
    ...(backplateStress>steel.comparisonProofStressMpa?['BACKPLATE_ELASTIC_COMPARISON_FAILS']:[]),
    'ACTUAL_PIPE_FIXED_POINT_AND_GUIDE_RATING_UNQUALIFIED','OUTER_CUT_AND_REMOTE_TERMINAL_SUPPORT_NETWORK_UNQUALIFIED','ACTUAL_JAMB_GROUP_SPLITTING_AND_COMBINED_RESISTANCE_UNQUALIFIED',
    'FRAME_END_ROTATION_AND_BACKPLATE_BEARING_UNQUALIFIED','ACTUAL_GUIDE_X_CONTACT_AND_END_ROTATION_UNQUALIFIED','JOINED_HOUSE_JAMB_LOAD_ADDITION_UNQUALIFIED','WELD_PROCEDURE_AND_COMPLETE_MATERIAL_DISCLOSURE_UNQUALIFIED',
  ]
  return {schema:'had-fixed-inlet-receiver-comparison/3' as const,design,status:'development-comparison-not-support-admission' as const,
    sourceContext:input,facts:fixedInletReceiverFacts,
    disposition:'retired-continuous-backplate-comparison' as const,
    recommendation:design==='guided-route'?'Retain as historical steel comparison only: continuous backplates obstruct the known socket access and a complete hole schedule is absent. Develop the finite cantilever replacement rather than select this bridge.':'Reject indiscriminate full-restraint strengthening: the heavy frame still fails its local backplate/catalogue screen; resolve actual movement or change the anchorage topology.',
    geometry:{pipeMounts:input.branches.flatMap(b=>[layout.fixedPointZMm,layout.guideZMm].map((z,i)=>({branch:b.id,kind:i===0?'split-fixed-clamp':'split-axial-guide',centreMm:[b.pipeAxisXMm,b.riserYMm,z],
        outerDiameterMm:44,boreDiameterMm:i===0?28.4:29,axialHeightMm:20,nominalPartingGapMm:1,
        boreIsFreeOfSupportSteel:true,clampOrGuideRatingQualified:false,pipeWeldedToSupport:false,
        rearMountingPlaneYMm:b.riserYMm-35,plateBodyMm:[b.pipeAxisXMm-20,b.riserYMm-35,z-30,40,5,60],
        rearLugs:[-1,1].map(side=>({blankBodyMm:[b.pipeAxisXMm+(side<0?-20:14),b.riserYMm-30,z-10,6,23,20],
          plateContactFaceMm:[b.pipeAxisXMm+(side<0?-20:14),b.riserYMm-30,z-10,6,0,20],
          rootJoint:'full6×20 butt contact on mounting plate front, no positive-volume plate overlap; returned welds and local plate/shell resistance remain unqualified',
          cutProfile:'subtract outer44 clamp cylinder from this blank; curved edge meets the rear clamp shell atR22; no lug enters the pressure bore'})),
        clampEarBlanksMm:[-1,1].map(side=>[b.pipeAxisXMm+(side<0?-29:19),b.riserYMm-9,z-8,10,18,16]),
        earProfile:'trim for the outer44 ring and preserve the bore; split at the clamp parting plane; two M5 bolts lie outside the pressure tube',
        boltAxesMm:[-24,24].map(dx=>[[b.pipeAxisXMm+dx,b.riserYMm-9,z],[b.pipeAxisXMm+dx,b.riserYMm+9,z]]),
        rawArmTipToBareTubeAfter5Mm:35-input.pipe.outerDiameterMm/2-5,
        mountingPlateToBareTubeAfter5Mm:30-input.pipe.outerDiameterMm/2-5,
        mountingMass:'the40×5×60 mounting plate is counted; clamps, guide shoes and fitted lug/ear profiles remain excluded until detailed; no gross assembly mass is claimed'}))),jambAxesXMm:axes,jambFaceYMm:face,rail,
      railBoxesMm:rail.levelsZMm.map(z=>[west,rail.axisYMm-rail.normalMm/2,z-rail.verticalMm/2,span,rail.normalMm,rail.verticalMm] as Box),
      backplates:axes.map(x=>({bodyMm:[x-plate.alongMm/2,face+packingDepth,plate.bottomZMm,plate.alongMm,plate.normalMm,plate.topZMm-plate.bottomZMm] as Box,
        underPlatePackingBlocksMm:rowZ.map(z=>[x-45,face,z-30,90,packingDepth,60]),drySteelWeldPadsMm:rail.levelsZMm.map(z=>[x===west?x:x-75,face+30,z-rail.verticalMm/2,75,weldPadDepth,rail.verticalMm]),anchorAxesMm:rowZ.map(z=>[x,face,z])})),
      fixedPointArms:input.branches.map(b=>({id:b.id,bodyMm:[b.pipeAxisXMm-20,rail.axisYMm+rail.normalMm/2,layout.fixedPointZMm-30,40,b.riserYMm-35-rail.axisYMm-rail.normalMm/2,60] as Box,
        splitClampCentreMm:[b.pipeAxisXMm,b.riserYMm,layout.fixedPointZMm],clampAxialHeightMm:20,
        lowerRepairCouplingParkingStartZMm:b.lowerRepairCutZMm-96,clampToParkingAfter5Mm:b.lowerRepairCutZMm-96-layout.fixedPointZMm-10-5,
        throughHoodBack:'closed solid arm, continuous static welded boss in fixed back; no pressure shaft or shared fluid path'})),
      guidePosts:input.branches.map(b=>({id:b.id,bodyMm:[b.pipeAxisXMm-post.squareMm/2,rail.axisYMm-post.squareMm/2,post.fromZMm,post.squareMm,post.squareMm,post.toZMm-post.fromZMm] as Box,
        armBodyMm:[b.pipeAxisXMm-20,rail.axisYMm+post.squareMm/2,post.guideZMm-30,40,b.riserYMm-35-rail.axisYMm-post.squareMm/2,60],
        armPostContactFaceMm:[b.pipeAxisXMm-20,rail.axisYMm+post.squareMm/2,post.guideZMm-30,40,0,60],
        armToRearMountingPlaneMm:[b.riserYMm-35-(rail.axisYMm+post.squareMm/2)],guideCentreMm:[b.pipeAxisXMm,b.riserYMm,post.guideZMm],toRealHoodCapAfter5Mm:post.guideZMm-30-b.secondUpperRepairCutZMm-98-5,
        axialRunningTravelMm:[-5,5],actualFrictionAndWear:'unqualified; all-metal guided geometry is not a rated thermal release'})),
      welds:{railBackplate:weld,armsAndGuidePosts:{armLegMm:design==='guided-route'?4:6,postLegMm:design==='guided-route'?3:6,fullReturnedPerimeter:true},actualWeldQualification:false,combinedWeldShearTorsionAndLocalRhsFaceResistanceEstablished:false},
      wallAfter5Mm:rail.axisYMm-rail.normalMm/2-input.finishedWallYMm-5,
      hoodBackAfter5Mm:Math.min(...input.branches.map(b=>b.riserYMm-60))-rail.axisYMm-rail.normalMm/2-5,
      extraWindowObscurationMm:2*rail.verticalMm,noFloorOrDpcFixings:true,noWindowCapacity:true,noLinerFloorOrRibTransfer:true},
    actions:{caseCount:cases.length,pressurePlusThermalMaximumComponentN:forceMax,thermalActionWrenches:input.branches.map(b=>({id:b.id,fixedPoint:wrench(b,0),guide:wrench(b,1)})),
      pipeWaterMassKg:input.branches.map(b=>({id:b.id,massKg:r(waterMass(b))})),law:design==='guided-route'?'All six combined LOWER-plus-UPPER fixed-point wrench components, separate guide wrench and exact heights retained.64 signed Y/Z force combinations plus independent point-couple and axial absolute envelopes; no scalar upper-route-only ceiling. Real guide friction and complete support network remain unqualified.':'Independent signs from both sides of each common fixed point:2EAalphaDeltaT per force component, with a separate single-legEAalphaDeltaT lateral guide challenge. No uniform-temperature cancellation is credited. This rejected force-only screen does not establish locked-pipe couples or a full Lodge/house network bound. All represented frame weight and stock weight are retained. Actual fittings/wet bodies/tool actions are additional.',
      fullRestraintReference:input.branches.map(b=>({id:b.id,singleLegAxialForceN:b.fullyRestrainedThermalForceN,
        independentTwoSidedFixedPointComponentBoundN:2*b.fullyRestrainedThermalForceN,separateGuideLateralComponentBoundN:b.fullyRestrainedThermalForceN,
        lockedPipeMomentEnvelopeEstablished:false,fullLodgeAndHouseNetworkBound:false})),
      cases,toolActionN:input.toolActionN,fullGrossDeadloadKnown:false,guideFrictionAndTubeStressAcceptance:false},
    mass:{railsKg:r(railMass),backplatesKg:r(plateMass),armsKg:r(armMass),postsKg:r(postMass),mountingPlatesKg:r(mountingPlateMass),packingKg:r(packingMass),weldPadsKg:r(weldPadMass),knownFabricatedSteelKg:r(knownFrameMass),
      gravityPointsByRail:gravityPoints,railGravityUniformNPerMm:railMass/2*9.81/span,
      frameGravityWallMomentBoundary:'Each jamb conservatively receives the entire rail/arm/post/mount/pad wall-normal gravity couple plus its own backplate/packing couple; no favourable cancellation or unproved torsional sharing is credited.',
      excludes:'bolts, pipe clamps, guide shoes, fitted lug/ear profiles, wet bodies and extra fittings'},
    elasticComparisons:{railMpa:r(maxRailStress),armMpa:r(armStress),guidePostMpa:r(postStress),endWeldCombinedMpa:r(weldStress),backplateMpa:r(backplateStress),
      comparisonProofStressMpa:steel.comparisonProofStressMpa,loadFactoring:'unfactored bounded-action elastic screen; not an issued limit-state design',
      endMomentBoundary:'Full simply-supported maximum moment also applied to each end weld/backplate as an adverse connection screen; actual stiffness, prying and local RHS face behaviour remain unqualified'},
    anchorScreen:{effectiveDepthMm:50,fixtureThicknessMm:30,drillingDepthFromConcreteFaceMm:70,edgeAfter5Mm:edge,spacingAfterTwo5Mm:(design==='guided-route'?200:160)-10,
      isolatedConeEdgeRequiredMm:75,isolatedConeSpacingRequiredMm:150,memberThicknessMm:face-back,minimumMemberThicknessMm:100,
      nominalDrillToLongitudinalSteelAfter5Mm:drillToBar,sourceHoopOutsideCoverMm:null,requiredCoverMm:input.sourceCage.requiredCoverMm,
      sourceTransverseSchedule:{owner:'STR',status:'unresolved' as const,diameterMm:null,pitchMm:null,bendGeometry:null,coverSpecification:null,placementToleranceMm:null,
        missing:'Continuous jamb transverse diameter, complete pitch/stations, closed-link bends/knee continuity, required nominal/minimum cover and independent cage/form setting tolerances; source H12/H16 lanes alone do not supply these.',
        installedSourceConfinementPass:false},
      authoredTransverseComparison,authoredTransverseSensitivities:[8,6].map(transverseComparison),
      actualHoopStationsKnown:false,drillingThroughSteelAllowed:false,
      maximumIsolatedCatalogueInteraction:r(Math.max(...cases.flatMap(c=>c.jambs.flatMap(j=>j.anchors.map(a=>a.isolatedCatalogueLinearInteraction))))),
      actualGroupResistanceEstablished:false,concreteStrengthClassEstablished:false,sourceCageRepairAdopted:false},
    alternative:{lighterPressureOnlyReceiver:'RHS80×60×4 near the same load levels is a finite conventional comparison; it cannot receive a pass for seized/fully restrained thermal actions without a solved guide/bend law.',
      massReason:'The two-sided2EAalphaDeltaT fixed-point rejection screen is approximately26.673kN per component at40K, plus the separate single-leg guide challenge. Reducing it requires evidence of movement and flexibility, not cancellation or inherited support capacity.'},
    diagnostics,completeSupportCapacity:false,selectedHouseAdoption:false,installedAcceptance:false}
}
