import {compareFixedInletReceiver,fixedInletReceiverFacts,fixedInletSupportLayout} from './inlet-fixed-receiver.js'

type Receiver=ReturnType<typeof compareFixedInletReceiver>
type Point=readonly [number,number,number]
type Box=readonly [number,number,number,number,number,number]
type Mass={id:string;level:number;pointMm:Point;massUpperKg:number;basis:'net-section'|'gross-profile-upper-bound'}
type Operating={hoods:readonly {branch:string;bodyMm:readonly number[];metalFunnelDropMm:number;normalOpeningBodyMm:readonly number[];normalFrontDrawMm:number}[];
  renewals:readonly {branch:string;translationMm:readonly number[];sweptCentrelineBoxesMm:readonly (readonly number[])[];bareRadiusMm:number;curveHausdorffMm:number;jacketStripped:boolean}[];
  toolPoses:readonly {branch:string;cycle:number;joint:string;jawOpeningClosedAnd100mmApproachBoundMm:readonly number[]}[]}
const r=(n:number)=>Number(n.toFixed(6))||0
const add=(a:readonly number[],b:readonly number[])=>a.map((n,i)=>n+b[i])
const rectangle=(a:number,b:number,t:number)=>({area:a*b-(a-2*t)*(b-2*t),ia:(a*b**3-(a-2*t)*(b-2*t)**3)/12,ib:(b*a**3-(b-2*t)*(a-2*t)**3)/12})
const boxCentre=(b:Box):Point=>[b[0]+b[3]/2,b[1]+b[4]/2,b[2]+b[5]/2]
const volume=(b:Box)=>b[3]*b[4]*b[5]
const weldStress=(a:number,b:number,leg:number,f:readonly number[],m:readonly number[])=>{
  const t=leg/Math.SQRT2,L=2*(a+b),ia=t*(2*a*(b/2)**2+2*b**3/12),ib=t*(2*b*(a/2)**2+2*a**3/12)
  const normal=f[1]/(t*L)+m[0]/(ia/(b/2))+m[2]/(ib/(a/2))
  const shear=Math.hypot(f[0],f[2])/(t*L)+m[1]*Math.hypot(a/2,b/2)/(ia+ib)
  return Math.hypot(normal,Math.sqrt(3)*shear)
}
export const fixedInletCompactSocketSource={path:'project/str/studies/reconciled-house-interface.py',gitBlob:'c4f0b0777a061c3b9dfc09ca3fa7895d99fd3b9c'} as const

export function compareCompactFixedInletReceiver(reference:Receiver,operating:Operating){
  if(reference.design!=='guided-route')throw new Error('Compact receiver requires the actual guided-route six-component actions')
  const input=reference.sourceContext,steel=fixedInletReceiverFacts.steel,anchor=fixedInletReceiverFacts.anchor
  const layout=input.layout??fixedInletSupportLayout,guideZ=layout.guideZMm
  const density=steel.densityKgM3/1e9,allowable=steel.comparisonProofStressMpa/1.5
  const jambX=Math.max(...input.jambAxesXMm),face=Math.max(...input.jambNormalFacesYMm),railY=480
  const west=Math.min(...input.branches.map(b=>b.pipeAxisXMm))-50,span=jambX-west
  if(!(span>0)||input.branches.some(b=>b.pipeAxisXMm>=jambX||b.riserYMm<=railY+65))throw new Error('Both real pipes must lie on the inner-jamb cantilever')
  const rail={normalMm:60,verticalMm:80,wallMm:4,axisYMm:railY,levelsZMm:[850,1450]}
  const railSection=rectangle(60,80,4),armSection=rectangle(40,60,4),postSection=rectangle(40,40,3)
  const plates=[{level:850,bottom:610,top:1150,anchors:[650,1110],portZ:[900,1000]},
    {level:1450,bottom:1340,top:1760,anchors:[1370,1730],portZ:null}]
  const masses:Mass[]=[],body=(id:string,level:number,b:Box,netVolume=volume(b),basis:Mass['basis']='net-section')=>{
    masses.push({id,level,pointMm:boxCentre(b),massUpperKg:netVolume*density,basis})
    return b
  }
  const backplates=plates.map(p=>{
    const b:Box=[jambX-95,face+14,p.bottom,190,16,p.top-p.bottom]
    const plateBodyMm=body('endplate-'+p.level,p.level,b,volume(b)-(p.portZ?80*100*16:0))
    if(p.portZ){const entry=masses.at(-1)!;entry.pointMm=[jambX,face+22,(volume(b)*(p.bottom+p.top)/2-80*100*16*950)/(volume(b)-80*100*16)]}
    const port=p.portZ?[jambX-40,face+14,p.portZ[0],80,16,100] as Box:null
    const packing=p.anchors.map(z=>body('packing-'+z,p.level,[jambX-45,face,z-30,90,14,60]))
    const toes=[-1,1].map(side=>body('toe-packing-'+p.level+'-'+side,p.level,[jambX+(side<0?-95:75),face,p.bottom,20,14,p.top-p.bottom]))
    const pad=body('rail-weld-pad-'+p.level,p.level,[jambX-75,face+30,p.level-40,75,railY-30-face-30,80])
    return {levelZMm:p.level,bodyMm:plateBodyMm,throughPortMm:port,packingBlocksMm:packing,toePackingStripsMm:toes,weldPadMm:pad,
      anchorAxesMm:p.anchors.map(z=>[jambX,face,z] as Point),sourceSocketAccess:'authored80×100 access reservation at950; separate gap1150..1340 retains1270; actual guard/key operation remains to be demonstrated'}
  })
  const railBoxes=plates.map(p=>body('rail-'+p.level,p.level,[west,railY-30,p.level-40,span,60,80],railSection.area*span))
  const mounts=input.branches.flatMap(b=>[850,guideZ].map(z=>{
    const fixed=z===850,level=fixed?850:1450,height=fixed?40:20,bore=fixed?input.pipe.outerDiameterMm:input.pipe.outerDiameterMm+1
    const plate=body(b.id+'-mounting-plate-'+z,level,[b.pipeAxisXMm-20,b.riserYMm-35,z-30,40,12,60])
    const lugs=[-1,1].map(side=>body(b.id+'-lug-'+z+'-'+side,level,[b.pipeAxisXMm+(side<0?-20:14),b.riserYMm-23,z-height/2,6,16,height],undefined,'gross-profile-upper-bound'))
    const ears=[-1,1].map(side=>body(b.id+'-ear-'+z+'-'+side,level,[b.pipeAxisXMm+(side<0?-45:19),b.riserYMm-12,z-(fixed?36:16)/2,26,24,fixed?36:16],undefined,'gross-profile-upper-bound'))
    masses.push({id:b.id+'-ring-'+z,level,pointMm:[b.pipeAxisXMm,b.riserYMm,z],massUpperKg:Math.PI*(44**2-bore**2)/4*height*density,basis:'gross-profile-upper-bound'})
    return {branch:b.id,kind:fixed?'fixed-clamp':'axial-guide',centreMm:[b.pipeAxisXMm,b.riserYMm,z] as Point,outerDiameterMm:44,boreDiameterMm:bore,axialHeightMm:height,
      mountingPlateBodyMm:plate,rearLugBlanksMm:lugs,earBlanksMm:ears,boltAxesMm:[-32,32].map(dx=>[[b.pipeAxisXMm+dx,b.riserYMm-12,z],[b.pipeAxisXMm+dx,b.riserYMm+12,z]]),
      bolt:{nominalDiameterMm:10,tensileAreaMm2:58,authoredProofStressMpa:200,minimumPreloadEachN:fixed?1800:0,guideSpacerThicknessMm:fixed?null:1},
      fabrication:'subtract outer44 ring from fitted lug/ear blanks, leave full6×height roots against platefrontY−23; M10 ears have13 edge distance. Fixed matched nominal bore28 has no inherited0.4mm diametral slack; actual tube roundness, matched machining, contact and preload require evidence. Guide has positive all-metal parting spacers and1mm diametral clearance.',
      firstCouplingParkClearAfter5Mm:fixed?b.lowerRepairCutZMm-96-z-height/2-5:null,
      mountingPlateToBareTubeAfter5Mm:23-input.pipe.outerDiameterMm/2-5}
  }))
  const fixedArms=input.branches.map(b=>{
    const length=b.riserYMm-35-(railY+30)
    return {branch:b.id,bodyMm:body(b.id+'-fixed-arm',850,[b.pipeAxisXMm-20,railY+30,820,40,length,60],armSection.area*length)}
  })
  const guides=input.branches.map(b=>{
    const length=b.riserYMm-35-(railY+20)
    return {branch:b.id,postBodyMm:body(b.id+'-guide-post',1450,[b.pipeAxisXMm-20,railY-20,1490,40,40,guideZ+30-1490],postSection.area*(guideZ+30-1490)),
      armBodyMm:body(b.id+'-guide-arm',1450,[b.pipeAxisXMm-20,railY+20,guideZ-30,40,length,60],armSection.area*length)}
  })
  const wrenchAt=(branch:typeof input.branches[number],guide:boolean)=>guide?branch.guidedThermalActions!.guideWrench:branch.guidedThermalActions!.fixedPointWrench
  const mechanicalPoints=plates.map((p,index)=>input.branches.map(b=>{
    const w=wrenchAt(b,index===1),water=reference.actions.pipeWaterMassKg.find(row=>row.id===b.id)!.massKg
    return {id:b.id,pointMm:w.pointMm,forceN:w.forceComponentBoundsN.map((f,k)=>f+(index===0&&k>0?b.pressureEndForceN:0)+(index===0&&k===2?(b.knownStockMassKg+water)*9.81:0)),momentNmm:w.momentComponentBoundsNmm}
  }))
  const absoluteWrench=(points:readonly {pointMm:readonly number[];forceN:readonly number[];momentNmm:readonly number[]}[],about:Point)=>{
    let force=[0,0,0],moment=[0,0,0]
    for(const p of points){
      const d=p.pointMm.map((n,i)=>Math.abs(n-about[i]))
      force=add(force,p.forceN)
      moment=add(moment,add(p.momentNmm,[d[1]*p.forceN[2]+d[2]*p.forceN[1],d[2]*p.forceN[0]+d[0]*p.forceN[2],d[0]*p.forceN[1]+d[1]*p.forceN[0]]))
    }
    return {pointMm:about,forceComponentBoundsN:force.map(r),momentComponentBoundsNmm:moment.map(r)}
  }
  const loadPoints=plates.map((p,i)=>[...mechanicalPoints[i],...masses.filter(m=>m.level===p.level).map(m=>({pointMm:m.pointMm,forceN:[0,0,m.massUpperKg*9.81],momentNmm:[0,0,0]}))])
  const jointResults=plates.map((p,index)=>{
    const centreZ=(p.anchors[0]+p.anchors[1])/2,spacing=p.anchors[1]-p.anchors[0],toe=90
    const wall=absoluteWrench(loadPoints[index],[jambX,face,centreZ]),f=wall.forceComponentBoundsN,m=wall.momentComponentBoundsNmm
    const pryingFactor=1.25,anchorTension=pryingFactor*(f[1]/2+m[0]/spacing+m[2]/(2*toe))
    const anchorShear=Math.hypot(f[2]/2,f[0]/2+m[1]/spacing)
    const netWidth=190-(p.portZ?80:0),netHeight=p.top-p.bottom-(p.portZ?100:0)
    const plateStress=f[1]/(netWidth*16)+6*m[0]/(netWidth*16**2)+6*m[2]/(netHeight*16**2)
    const bearingForce=2*anchorTension+f[1],bearingArea=20*netHeight,bearingStress=3*bearingForce/bearingArea
    const weldWrench=absoluteWrench(loadPoints[index],[jambX-37.5,railY-30,p.level]),wf=weldWrench.forceComponentBoundsN,wm=weldWrench.momentComponentBoundsNmm
    const throat=6/Math.SQRT2,L=2*(75+80),ix=throat*(2*75*40**2+2*80**3/12),iz=throat*(2*80*37.5**2+2*75**3/12)
    const normal=wf[1]/(throat*L)+wm[0]/(ix/40)+wm[2]/(iz/37.5)
    const shear=Math.hypot(wf[0],wf[2])/(throat*L)+wm[1]*Math.hypot(40,37.5)/(ix+iz)
    const root=absoluteWrench(loadPoints[index],[jambX,railY,p.level]),rf=root.forceComponentBoundsN,rm=root.momentComponentBoundsNmm
    const railNormal=rf[0]/railSection.area+rm[1]/(railSection.ia/40)+rm[2]/(railSection.ib/30)
    const railShear=Math.hypot(rf[1],rf[2])/railSection.area+rm[0]/(2*56*76*4)
    const weldVm=Math.hypot(normal,Math.sqrt(3)*shear),railVm=Math.hypot(railNormal,Math.sqrt(3)*railShear)
    return {levelZMm:p.level,wallWrench:wall,railRootWrench:root,weldWrench,
      anchors:p.anchors.map(z=>({pointMm:[jambX,face,z],normalTensionBoundN:r(anchorTension),shearBoundN:r(anchorShear),
        isolatedCatalogueLinearInteraction:r(anchorTension/anchor.isolatedCrackedC20PermissibleTensionAt50N+anchorShear/anchor.isolatedCrackedC20PermissibleShearAt50N)})),
      pryingFactor,compressionToeLeverAfter5Mm:toe,plateNetWidthMm:netWidth,plateNetHeightMm:netHeight,plateBendingAndDirectStressMpa:r(plateStress),
      concreteToeCompressionBoundN:r(bearingForce),concreteToeBearingAreaMm2:bearingArea,toeBearingPeakFactor:3,requiredConcreteToeBearingStressMpa:r(bearingStress),
      railCombinedStressMpa:r(railVm),returnedWeldLegMm:6,returnedWeldCombinedStressMpa:r(weldVm),
      equation:'Independent component absolute sums about each real source point; plate N/2+Mx/s+Mz/(2toe), then explicit1.25 prying sensitivity. Opposite toe compression and central anchor tension form the along-wall couple.'}
  })
  const local=input.branches.map(b=>{
    const fixed=mechanicalPoints[0].find(p=>p.id===b.id)!,f=fixed.forceN,m=fixed.momentNmm
    const localPoints=(index:number)=>[mechanicalPoints[index].find(p=>p.id===b.id)!,...masses.filter(entry=>entry.level===(index===0?850:1450)&&entry.id.startsWith(b.id+'-')).map(entry=>({pointMm:entry.pointMm,forceN:[0,0,entry.massUpperKg*9.81],momentNmm:[0,0,0]}))]
    const arm=absoluteWrench(localPoints(0),[b.pipeAxisXMm,railY+30,850]),af=arm.forceComponentBoundsN,am=arm.momentComponentBoundsNmm
    const post=absoluteWrench(localPoints(1),[b.pipeAxisXMm,railY,1490]),pf=post.forceComponentBoundsN,pm=post.momentComponentBoundsNmm
    const mount=absoluteWrench(localPoints(0),[b.pipeAxisXMm,b.riserYMm-23,850]),mf=mount.forceComponentBoundsN,mm=mount.momentComponentBoundsNmm
    const armNormal=af[1]/armSection.area+am[0]/(armSection.ia/30)+am[2]/(armSection.ib/20),armShear=Math.hypot(af[0],af[2])/armSection.area+am[1]/(2*36*56*4)
    const postStress=pf[2]/postSection.area+(pm[0]+pm[1])/(postSection.ia/20)+Math.sqrt(3)*(Math.hypot(pf[0],pf[1])/postSection.area+pm[2]/(2*37**2*3))
    const plateStress=6*mm[0]/(40*12**2)+6*mm[2]/(60*12**2)
    const lugNormal=mf[1]/(2*6*40)+mm[0]/(2*6*40**2/6)+mm[2]/(2*40*6**2/6)
    const contactWidth=40,D=input.pipe.outerDiameterMm,t=input.pipe.wallMm,transverse=f[0]+f[1],contactMoment=m[0]+m[1]
    const contactPressure=transverse/(D*contactWidth)+6*contactMoment/(D*contactWidth**2),openingLoad=contactPressure*D*contactWidth/2
    const preload=1800,boltLoad=preload+openingLoad/2,boltStress=boltLoad/58,earStress=boltLoad*10/(36*12**2/6)
    const frictionDemand=f[2]+m[2]/(D/2),minimumFriction=frictionDemand/(2*Math.PI*preload)
    const pipeArea=Math.PI*(D**2-(D-2*t)**2)/4,fluidPressure=b.pressureEndForceN/(Math.PI*(D-2*t)**2/4)
    const tubeStress=(contactPressure+fluidPressure)*D/(2*t)+f[2]/pipeArea
    const idealBuckling=2*steel.elasticModulusMpa/Math.sqrt(3*(1-.3**2))*(t/D)**3
    const rootWeld=weldStress(40,60,4,af,am)
    const lugWeld=weldStress(6,40,4,mf.map(n=>n/2),mm.map(n=>n/2))
    const ga=absoluteWrench(localPoints(1),[b.pipeAxisXMm,railY+20,guideZ])
    const guideArmWeld=weldStress(40,60,4,ga.forceComponentBoundsN,ga.momentComponentBoundsNmm)
    const postWeld=weldStress(40,40,3,[pf[0],pf[2],pf[1]],[pm[0],pm[2],pm[1]])
    const earWeld=boltLoad/(2*36*4/Math.SQRT2)+boltLoad*10/(2*(4/Math.SQRT2)*36**2/6)
    const sectionValues={arm:r(Math.hypot(armNormal,Math.sqrt(3)*armShear)),guidePost:r(postStress),mountingPlate:r(plateStress),lug:r(lugNormal),ear:r(earStress),bolt:r(boltStress),
      armReturnedWeld:r(rootWeld),lugReturnedWeld:r(lugWeld),guideArmReturnedWeld:r(guideArmWeld),postBaseReturnedWeld:r(postWeld),earWeld:r(earWeld)}
    return {branch:b.id,steelStressMpa:sectionValues,localArmRootWrench:arm,localPostBaseWrench:post,
      localWeightBoundary:'Each local connection also receives all represented branch steel gravity as a conservative bound; the global takeoff still counts each body once.',
      clamp:{axialHeightMm:40,matchedNominalBoreMm:D,pressureContactEnvelopeMpa:r(contactPressure),halfRingOpeningLoadBoundN:r(openingLoad),
      boltTensionIncludingPreloadBoundN:r(boltLoad),preloadEachBoltN:preload,minimumRequiredFrictionCoefficient:r(minimumFriction),
      contactLaw:'Rigid conformal40mm cylindrical seat, projected bearing p=F/(DL)+6M/(DL²); hoop+axial absolute tube stress and ideal elastic external-pressure buckling are conditional checks, not measured local contact/ovalisation resistance.',
      tubeHoopPlusAxialAbsoluteStressMpa:r(tubeStress),idealElasticExternalBucklingMpa:r(idealBuckling),bucklingComparisonWith1p5:r(idealBuckling/1.5),
      actualFrictionConformityAndPreloadRetentionQualified:false},
      passesAuthoredSteelComparison:Object.values(sectionValues).every(value=>value<=allowable),
      passesConditionalTubeContactComparison:tubeStress<=allowable&&contactPressure<=idealBuckling/1.5}
  })
  const knownHoops=[950,1270,1980,2120].flatMap(z=>[z-45,z+45]),anchorRows=plates.flatMap(p=>p.anchors)
  const knownLocalHoopClear=Math.min(...anchorRows.flatMap(z=>knownHoops.map(h=>Math.abs(z-h)-6-3-10)))
  const hoodReview=operating.hoods.map(hood=>{
    const b=input.branches.find(b=>b.id===hood.branch)
    if(!b||hood.bodyMm.length!==6)throw new Error('Compact receiver needs each actual candidate hood')
    const h=hood.bodyMm,eastAllowance=h[0]+h[3]-b.pipeAxisXMm,proposedEast=Math.max(55,eastAllowance)
    return {branch:b.id,currentBodyMm:h,proposedBodyMm:[h[0],h[1],h[2],110+proposedEast,h[4],h[5]],
      currentM10EarToEastSideAfter3MetalAnd5SettingMm:r(eastAllowance-45-8),
      proposedM10EarToEastSideAfter3MetalAnd5SettingMm:r(proposedEast-45-8),
      fixedClampBottomToActualFunnelTopAfter3MetalAnd5SettingMm:r(850-20-h[2]-hood.metalFunnelDropMm-8),
      fixedArmBottomToActualFunnelTopAfter3MetalAnd5SettingMm:r(820-h[2]-hood.metalFunnelDropMm-8),
      guideArmBottomToActualHoodTopAfter3MetalAnd5SettingMm:r(guideZ-30-h[2]-h[5]-8),
      normalOpeningBottomToFixedClampTopAfter5Mm:r(hood.normalOpeningBodyMm[2]-870-5),
      normalFrontDrawMm:hood.normalFrontDrawMm,normalOpeningBodyMm:hood.normalOpeningBodyMm,
      proposedStatus:'bounded15mm-east-hood-replacement-unless-already-source-adopted' as const}
  })
  if(hoodReview.length!==2)throw new Error('Compact receiver needs both actual candidate hoods')
  const sortedHoods=[...hoodReview].sort((a,b)=>a.proposedBodyMm[0]-b.proposedBodyMm[0])
  const proposedSiblingGap=sortedHoods[1].proposedBodyMm[0]-sortedHoods[0].proposedBodyMm[0]-sortedHoods[0].proposedBodyMm[3]-16
  const supportBodies:readonly number[][]=[...railBoxes,...backplates.flatMap(p=>[p.bodyMm,p.weldPadMm]),...fixedArms.map(a=>a.bodyMm),...guides.flatMap(g=>[g.postBodyMm,g.armBodyMm]),
    ...mounts.flatMap(m=>[m.mountingPlateBodyMm,...m.rearLugBlanksMm,...m.earBlanksMm])].map(b=>[...b])
  const toolPoseReview=operating.toolPoses.map(p=>({...p,supportBodiesAfter5Mm:r(Math.min(...supportBodies.map(b=>Math.max(...[0,1,2].map(i=>Math.max(b[i]-p.jawOpeningClosedAnd100mmApproachBoundMm[i]-p.jawOpeningClosedAnd100mmApproachBoundMm[i+3],p.jawOpeningClosedAnd100mmApproachBoundMm[i]-b[i]-b[i+3])))))-5)}))
  const structuralBodies=[...railBoxes,...backplates.flatMap(p=>[p.bodyMm,p.weldPadMm]),...fixedArms.map(a=>a.bodyMm),...guides.flatMap(g=>[g.postBodyMm,g.armBodyMm]),...mounts.map(m=>m.mountingPlateBodyMm)]
  const lowerRenewalReview=operating.renewals.map(renewal=>{
    const clearance=Math.min(...renewal.sweptCentrelineBoxesMm.flatMap(a=>structuralBodies.map(b=>Math.max(...[0,1,2].map(i=>Math.max(b[i]-a[i]-a[i+3],a[i]-b[i]-b[i+3]))))))-renewal.bareRadiusMm-5-renewal.curveHausdorffMm
    const forward=renewal.translationMm[0]===0&&renewal.translationMm[1]>0&&renewal.translationMm[2]===0
    return {branch:renewal.branch,actualTranslationMm:renewal.translationMm,bareTubeToPermanentSupportAfter5AndCurveMm:r(clearance),
      rearProfileReleaseLaw:'Remove FRONT cap. Every point of the retained rear half hasY≤pipeaxis and radius≥bareR; translating the bare tube in+Y monotonically increases distance. Fitted lugs are outsideR22, rear ear inner edgeX19 gives5mm tobareR14. Nominal mating contact atstart is not a free clearance.',
      frontCapRemoved:true,jacketStripped:renewal.jacketStripped,
      rearHalfReleasePass:forward&&renewal.jacketStripped,wholeLowerDrawClear:forward&&renewal.jacketStripped&&clearance>=0}
  })
  const currentHoodFits=hoodReview.every(h=>h.currentM10EarToEastSideAfter3MetalAnd5SettingMm>=0)
  const funnelClear=hoodReview.every(h=>h.fixedClampBottomToActualFunnelTopAfter3MetalAnd5SettingMm>=0&&h.fixedArmBottomToActualFunnelTopAfter3MetalAnd5SettingMm>=0)
  const railAndConnectionPass=jointResults.every(j=>Math.max(j.plateBendingAndDirectStressMpa,j.railCombinedStressMpa,j.returnedWeldCombinedStressMpa)<=allowable)
  return {schema:'had-fixed-inlet-compact-receiver/1' as const,status:'preferred-bounded-conventional-development' as const,
    recommendation:'Replace the full-width bridge and continuous backplates with this single-jamb cantilever only if the declared steel/anchor/contact comparisons and actual STR jamb duty are satisfied; no construction or supplier capacity admission follows.',
    sourceContext:{receiver:reference.schema,input,operating},basis:{steel,allowableComparisonMpa:r(allowable),strengthDivisor:1.5,anchor,
      socketReservationSource:{...fixedInletCompactSocketSource,interpretation:'local socket rows950/1270/1980/2120, H6 pairs±45; reservations are not a general jamb confinement schedule'},
      assumedFrictionCoefficient:.1,actualToolActionN:input.toolActionN,realGrossDeadloadEstablished:false,platePryingFactor:1.25,
      loadLaw:'All six point wrenches retained at actual pipe/guide heights. Represented body gravity uses actual centres, no uniform smearing; gross fitted-blank masses are upper bounds and may not be credited against uplift. Every force/moment capacity envelope adds absolute gravity action.'},
    geometry:{layout,jambAxisXMm:jambX,jambFaceYMm:face,rail,railBoxesMm:railBoxes,backplates,fixedArms,guides,pipeMounts:mounts,
      hoodReview,proposedSiblingHoodGapAfterTwo3MetalAndTwo5SettingMm:r(proposedSiblingGap),
      socketAccessReservations:{sourceRowsZMm:[950,1270,1980,2120],localHoopStationsZMm:knownHoops,throughPlatePortMm:backplates[0].throughPortMm},
      noFloorDpcOrWindowFixings:true,knownLocalSocketHoopDrillClearAfterTwo5Mm:r(knownLocalHoopClear),generalTransverseScheduleKnown:false},
    operatingReview:{toolPoses:toolPoseReview,nativeJawToSupportBoundsClear:toolPoseReview.every(p=>p.supportBodiesAfter5Mm>=0),
      normalHoodOpeningClear:hoodReview.every(h=>h.normalOpeningBottomToFixedClampTopAfter5Mm>=0&&h.guideArmBottomToActualHoodTopAfter3MetalAnd5SettingMm>=0),
      actualCurrentHoodsFitM10Ears:currentHoodFits,proposedBroaderHoodsFitM10Ears:hoodReview.every(h=>h.proposedM10EarToEastSideAfter3MetalAnd5SettingMm>=0)&&proposedSiblingGap>=0,
      actualFunnelToSupportBoundsClear:funnelClear,
      coldLowerRenewal:'Lodge-isolated, drained bare L translates in the ACTUAL positiveY direction toward the washer first rest after the FRONT clamp cap is removed. The retained rear arm/rail lie behind the moving vertical leg; no whole-frame removal or new pressure gland is required.',
      lowerRenewalReview,lowerRenewalWithCurrentWeldedArmPass:lowerRenewalReview.length===2&&lowerRenewalReview.every(row=>row.wholeLowerDrawClear),actualMachineAndHandToolMotionQualified:false},
    mass:{ledger:masses,representedSteelUpperBoundKg:r(masses.reduce((n,m)=>n+m.massUpperKg,0)),
      netSectionSteelKg:r(masses.filter(m=>m.basis==='net-section').reduce((n,m)=>n+m.massUpperKg,0)),
      excludes:'fasteners, weld metal, wet bodies and extra fittings; no complete installed deadload is claimed'},
    joints:jointResults,local,internalComparisons:{railPlateAndWeldPass:railAndConnectionPass,localSteelPass:local.every(row=>row.passesAuthoredSteelComparison),
      conditionalTubeContactPass:local.every(row=>row.passesConditionalTubeContactComparison),
      isolatedCatalogueScreenPass:jointResults.every(j=>j.anchors.every(a=>a.isolatedCatalogueLinearInteraction<=1)),
      actualCompleteSupportCapacity:false},
    strDuty:{jambAxisXMm:jambX,perConnection:jointResults.map(j=>({levelZMm:j.levelZMm,wallWrench:j.wallWrench,anchorActions:j.anchors,toeBearingStressMpa:j.requiredConcreteToeBearingStressMpa})),
      sourceJambSizeNormalAlongMm:[Math.max(...input.jambNormalFacesYMm)-Math.min(...input.jambNormalFacesYMm),input.jambAlongWidthMm],
      sourceLongitudinalCage:input.sourceCage,missing:'Actual continuous transverse diameter/pitch/bends/cover/tolerances, concrete class and cracked group/edge/splitting/shear resistance, local and global jamb/foot/portal load addition. Central drills require an all-steel schedule; no sourced reinforcement repair is invented.'},
    diagnostics:[...(!railAndConnectionPass?['COMPACT_RAIL_PLATE_OR_WELD_COMPARISON_FAILS']:[]),...(!local.every(row=>row.passesAuthoredSteelComparison)?['COMPACT_LOCAL_STEEL_COMPARISON_FAILS']:[]),
      ...(!currentHoodFits?['CURRENT_HOOD_EAST_SIDE_INTERCEPTS_COMPACT_M10_EARS']:[]),
      ...(!lowerRenewalReview.every(row=>row.wholeLowerDrawClear)?['ACTUAL_POSITIVE_Y_LOWER_RENEWAL_SUPPORT_INTERFERENCE']:[]),
      ...(!funnelClear?['COMPACT_SUPPORT_INTERCEPTS_ACTUAL_FUNNEL']:[]),...(!toolPoseReview.every(p=>p.supportBodiesAfter5Mm>=0)?['NATIVE_JAW_POSE_INTERCEPTS_COMPACT_SUPPORT']:[]),
      ...(!local.every(row=>row.passesConditionalTubeContactComparison)?['COMPACT_CONDITIONAL_TUBE_CONTACT_COMPARISON_FAILS']:[]),
      ...(!jointResults.every(j=>j.anchors.every(a=>a.isolatedCatalogueLinearInteraction<=1))?['COMPACT_ISOLATED_ANCHOR_CATALOGUE_SCREEN_FAILS']:[]),
      'ACTUAL_TOOL_VECTOR_AND_GROSS_DEADLOAD_UNRESOLVED','SOURCE_JAMB_TRANSVERSE_SCHEDULE_UNRESOLVED','ACTUAL_ANCHOR_GROUP_AND_JOINED_JAMB_RESISTANCE_UNQUALIFIED',
      'ACTUAL_CLAMP_CONTACT_FRICTION_PRELOAD_AND_AXIAL_GUIDE_UNQUALIFIED','ACTUAL_PLATE_PRYING_BEARING_AND_LOCAL_RHS_FACE_UNQUALIFIED','ACTUAL_WELD_AND_COMPLETE_MATERIAL_DISCLOSURE_UNQUALIFIED'],
    completeSupportCapacity:false,selectedHouseAdoption:false,installedAcceptance:false}
}
