import {sha256SemanticFingerprint} from '../../core/identity.js'
export type BridgeBox=readonly[number,number,number,number,number,number]
type P=readonly[number,number,number,number]
type S=readonly[number,number,number]
export type PostRowBridgeControl={thicknessMm:number;pieceCount:number;crossBeamSupportYMm:readonly[number,number];postRow:{innerGirderXMm:number;outerGirderXMm:number;plankInnerXMm:number;plankOuterXMm:number;sharedPostColumnIndex:number;sharedPostYMm:readonly number[];innerGirderEndYMm:readonly[number,number];innerSeatPackerMm:number;girderSectionWHtMm:S;maximumGirderWallMm:number;capThicknessMm:number;capWidthYMm:number;railCorbelLXtMm:readonly[number,number];matchedSeatErrorMm:number;sharedPostDesignCeilingN:number;maximumMechanicallyCapturedGirderKg:number}}
export type PostRowPart={id:string;kind:string;boxMm:BridgeBox;metalVolumeMm3:number;displacementOuterBoxRequired:boolean;installedAcceptance:false}
export type PostRowBridgeInput={bridge:PostRowBridgeControl;grid:{xMm:readonly number[];yMm:readonly number[]};walkingTopMm:number;plateYMm:readonly[number,number];externalReceiverXMm:number;panMinimumMm:number;wheelN:number;material:{densityKgM3:number;elasticModulusMPa:number;allowableComparisonMPa:number};settingEachMm:number;thermalPerMm:number;walkingDeadAtOneNodeN:number;sharedFootMaximumStockKg:number;postSectionWHtMm:S;sourceRoofMaximumMm:number;sourceRoofAtExternalBeamMm:number;panelJointMm:number;hardwareEachKg:number;externalRestPlanMm:P;door:{clearYMm:readonly[number,number];headAbsoluteMm:number};obstacles?:readonly{id:string;boxMm:BridgeBox}[]}
const vol=(b:BridgeBox)=>b[3]*b[4]*b[5]
const rhs=([w,h,t]:S)=>({area:w*h-(w-2*t)*(h-2*t),I:(w*h**3-(w-2*t)*(h-2*t)**3)/12,Z:(w*h**3-(w-2*t)*(h-2*t)**3)/(6*h)})
const finite=(v:readonly number[])=>v.every(Number.isFinite)
export function derivePostRowGridAxes(i:{roomPlanMm:P;maximumPanelXYMm:readonly[number,number];jointMm:number;footPadSideMm:number;perimeterInsetMm:number;columnRelocation:{sourceColumnIndex:number;targetXMm:number}}){
 const [x,y,w,h]=i.roomPlanMm,nx=Math.ceil(w/i.maximumPanelXYMm[0]),ny=Math.ceil(h/i.maximumPanelXYMm[1]),px=(w-(nx-1)*i.jointMm)/nx,py=(h-(ny-1)*i.jointMm)/ny,
  xMm=[x+i.footPadSideMm/2+i.perimeterInsetMm,...Array.from({length:nx-1},(_,k)=>x+(k+1)*px+(k+.5)*i.jointMm),x+w-i.footPadSideMm/2-i.perimeterInsetMm],
  yMm=[y+i.footPadSideMm/2+i.perimeterInsetMm,...Array.from({length:ny-1},(_,k)=>y+(k+1)*py+(k+.5)*i.jointMm),y+h-i.footPadSideMm/2-i.perimeterInsetMm]
 if(!finite([...i.roomPlanMm,...i.maximumPanelXYMm,i.jointMm,i.footPadSideMm,i.perimeterInsetMm,i.columnRelocation.targetXMm])||nx<1||ny<1||px<=0||py<=0||!Number.isInteger(i.columnRelocation.sourceColumnIndex)||i.columnRelocation.sourceColumnIndex<=0||i.columnRelocation.sourceColumnIndex>=xMm.length-1)throw Error('Actual ordered current post grid required')
 xMm[i.columnRelocation.sourceColumnIndex]=i.columnRelocation.targetXMm
 if(xMm.some((x,k)=>k>0&&x<=xMm[k-1]))throw Error('Moved post column is not ordered')
 return{xMm,yMm,panelXYMm:[px,py]as const}
}
/** Ordinary segmented beams on existing posts. No moment continuity, favourable
 * sharing, friction, pan anchorage or installed receiver capacity is credited. */
export function derivePostRowBridge(i:PostRowBridgeInput){
 const b=i.bridge,c=b.postRow,m=i.material,s=i.settingEachMm,two=2*s,[gw,gh,gt]=c.girderSectionWHtMm,rel=c.matchedSeatErrorMm,
  top=i.walkingTopMm,plateBottom=top-b.thicknessMm,innerTop=plateBottom-c.innerSeatPackerMm,innerBottom=innerTop-gh,outerBottom=plateBottom-gh,
  x=i.grid.xMm[c.sharedPostColumnIndex],ys=[...c.sharedPostYMm],L=c.plankOuterXMm-c.plankInnerXMm,W=i.plateYMm[1]-i.plateYMm[0],joint=i.panelJointMm,pw=(W-(b.pieceCount-1)*joint)/b.pieceCount,
  sec=rhs(c.girderSectionWHtMm),areaUpper=rhs([gw,gh,c.maximumGirderWallMm]).area,posts=rhs(i.postSectionWHtMm)
 if(!finite([top,plateBottom,innerTop,innerBottom,outerBottom,x,...ys,L,W,pw,...c.girderSectionWHtMm,c.maximumGirderWallMm,c.capThicknessMm,c.capWidthYMm,...c.railCorbelLXtMm,rel,c.sharedPostDesignCeilingN,c.maximumMechanicallyCapturedGirderKg,i.externalReceiverXMm,i.panMinimumMm,i.wheelN,...Object.values(m),s,i.thermalPerMm,i.walkingDeadAtOneNodeN,i.sharedFootMaximumStockKg,...i.postSectionWHtMm,i.sourceRoofMaximumMm,i.sourceRoofAtExternalBeamMm,joint,i.hardwareEachKg,...i.externalRestPlanMm,...i.door.clearYMm,i.door.headAbsoluteMm])||b.thicknessMm!==40||b.pieceCount!==15||ys.length!==5||ys.some((y,k)=>!i.grid.yMm.some(v=>Math.abs(v-y)<1e-6)||k>0&&y<=ys[k-1])||c.innerGirderEndYMm[0]!==ys[0]||c.innerGirderEndYMm[1]!==ys.at(-1)||ys[0]>i.plateYMm[0]||ys.at(-1)!<i.plateYMm[1]||Math.min(gw,gh,gt,m.densityKgM3,m.elasticModulusMPa,m.allowableComparisonMPa,L,W,pw)<=0||c.maximumGirderWallMm<gt||2*c.maximumGirderWallMm>=Math.min(gw,gh)||s<10||rel<3||c.capThicknessMm<35||c.sharedPostDesignCeilingN<9000||c.innerGirderXMm<=x||c.outerGirderXMm<=c.innerGirderXMm||Math.abs(c.plankInnerXMm-(c.innerGirderXMm-gw/2))>1e-6||Math.abs(c.plankOuterXMm-(c.outerGirderXMm+gw/2))>1e-6)throw Error('Actual five-post full-seat bridge geometry and finite source bounds required')
 const parts:PostRowPart[]=[],checks:{id:string;quantity:string;value:number;limit:number;necessary:boolean}[]=[],
  add=(id:string,kind:string,boxMm:BridgeBox,metal=vol(boxMm))=>{const p:PostRowPart={id,kind,boxMm,metalVolumeMm3:metal,displacementOuterBoxRequired:true,installedAcceptance:false};parts.push(p);return p},
  check=(id:string,quantity:string,value:number,limit:number)=>checks.push({id:'Plant/post-row-bridge/'+id,quantity,value,limit,necessary:Number.isFinite(value)&&value<=limit+1e-8}),
  planks=Array.from({length:b.pieceCount},(_,k)=>{const p=add('Plant/bridge-piece/'+k,'bridge-plate',[c.plankInnerXMm,i.plateYMm[0]+k*(pw+joint),plateBottom,L,pw,b.thicknessMm]);return{id:p.id,boxMm:p.boxMm,referenceSheetKg:p.metalVolumeMm3/1e9*m.densityKgM3,completeMassDesignUpperKg:p.metalVolumeMm3/1e9*m.densityKgM3+i.hardwareEachKg,actualCaptureToolsAndRestAccepted:false as const}}),
  girderSegments:{id:string;boxMm:BridgeBox;clearLengthMm:number;supportYMm:number[];reactionLaw:string;maximumCompleteCapturedKg:number}[]=[],packers:PostRowPart[]=[],sharedPostUpdates:{postId:string;headId:string;footId:string;xyMm:number[];postTopMm:number}[]=[],caps:{id:string;boxMm:BridgeBox;postXYMm:number[];girderXMm:number;maximumLoadEccentricityMm:number;matchedSeatErrorMm:number;actualBoltsSlotsWebBearingAndWeldsAccepted:boolean}[]=[]
 for(let k=1;k<ys.length;k++){
  const lo=ys[k-1]+(k===1?0:joint/2),hi=ys[k]-(k===ys.length-1?0:joint/2),length=hi-lo,
   p=add('Plant/post-row-bridge/inner-girder/'+k,'post-row-bridge-girder',[c.innerGirderXMm-gw/2,lo,innerBottom,gw,length,gh],areaUpper*length)
  girderSegments.push({id:p.id,boxMm:p.boxMm,clearLengthMm:length,supportYMm:[ys[k-1],ys[k]],reactionLaw:'Independent simply-supported member; positive articulated captured end seats, no transfer of beam moment across the one millimetre joint.',maximumCompleteCapturedKg:p.metalVolumeMm3/1e9*m.densityKgM3+i.hardwareEachKg})
  const a=Math.max(lo,i.plateYMm[0]),z=Math.min(hi,i.plateYMm[1]);if(z>a)packers.push(add('Plant/post-row-bridge/inner-seat/'+k,'post-row-solid-seat',[c.innerGirderXMm-gw/2,a,innerTop,gw,z-a,c.innerSeatPackerMm]))
 }
 const ey=i.bridge.crossBeamSupportYMm,outer=add('Plant/post-row-bridge/external-girder','post-row-bridge-girder',[c.outerGirderXMm-gw/2,ey[0],outerBottom,gw,ey[1]-ey[0],gh],areaUpper*(ey[1]-ey[0]))
 const capAt=(id:string,postX:number,y:number,girderX:number,bottom:number)=>{
  const a=Math.min(girderX-gw/2-rel,postX-i.postSectionWHtMm[0]/2-rel),z=Math.max(girderX+gw/2+rel,postX+i.postSectionWHtMm[0]/2+rel),
   cap=add(id,'post-row-solid-cap',[a,y-c.capWidthYMm/2,bottom-c.capThicknessMm,z-a,c.capWidthYMm,c.capThicknessMm])
  caps.push({id:cap.id,boxMm:cap.boxMm,postXYMm:[postX,y],girderXMm:girderX,maximumLoadEccentricityMm:Math.abs(girderX-postX)+rel,matchedSeatErrorMm:rel,actualBoltsSlotsWebBearingAndWeldsAccepted:false})
  return cap
 }
 for(const y of ys){
  const cap=capAt('Plant/post-row-bridge/shared-cap/'+y,x,y,c.innerGirderXMm,innerBottom),index=i.grid.yMm.findIndex(v=>Math.abs(v-y)<1e-6)
  sharedPostUpdates.push({postId:'Plant/post/'+c.sharedPostColumnIndex+'/'+index,headId:'Plant/head-plate/'+c.sharedPostColumnIndex+'/'+index,footId:'Plant/foot/'+c.sharedPostColumnIndex+'/'+index,xyMm:[x,y],postTopMm:cap.boxMm[2]})
  add('Plant/post-row-bridge/walk-corbel/'+y,'post-row-solid-corbel',[c.innerGirderXMm-gw/2-c.railCorbelLXtMm[0],y-c.capWidthYMm/2,top-70-40-c.railCorbelLXtMm[1],c.railCorbelLXtMm[0],c.capWidthYMm,c.railCorbelLXtMm[1]])
 }
 const externalPostUpdates=ey.map(y=>{const cap=capAt('Plant/post-row-bridge/external-cap/'+y,i.externalReceiverXMm,y,c.outerGirderXMm,outerBottom);return{postId:'Plant/bridge-post/'+i.externalReceiverXMm+'/'+y,footId:'Plant/bridge-foot/'+i.externalReceiverXMm+'/'+y,xyMm:[i.externalReceiverXMm,y],postTopMm:cap.boxMm[2],actualExternalReceiverAccepted:false}})
 // All new bridge stock plus BOTH retained external feet/posts is charged to
 // ONE shared post. Walking G is added once; there is only ONE factored wheel.
 const newMass=parts.reduce((n,p)=>n+p.metalVolumeMm3/1e9*m.densityKgM3,0)+parts.length*i.hardwareEachKg,
  retainedExternalUpperKg=2*(i.sharedFootMaximumStockKg+posts.area*Math.max(0,outerBottom-c.capThicknessMm-i.panMinimumMm)/1e9*m.densityKgM3),
  bridgeDeadUpperKg=newMass+retainedExternalUpperKg,
  sharedOwnUpperN=(i.sharedFootMaximumStockKg+posts.area*Math.max(0,innerBottom-c.capThicknessMm-i.panMinimumMm)/1e9*m.densityKgM3)*9.81,
  onePostN=i.wheelN+bridgeDeadUpperKg*9.81+i.walkingDeadAtOneNodeN+sharedOwnUpperN,pointN=i.wheelN+Math.max(...planks.map(p=>p.completeMassDesignUpperKg))*9.81,
  girderN=i.wheelN+bridgeDeadUpperKg*9.81,span=Math.max(...ys.slice(1).map((y,k)=>y-ys[k]),ey[1]-ey[0])+two,
  plankSpan=c.outerGirderXMm-c.innerGirderXMm+two,plankI=25*b.thicknessMm**3/12,
  innerDelta=girderN*(Math.max(...ys.slice(1).map((y,k)=>y-ys[k]))+two)**3/(48*m.elasticModulusMPa*sec.I),
  outerDelta=girderN*span**3/(48*m.elasticModulusMPa*sec.I),
  thermalCover=2*Math.max(ys.at(-1)!-ys[0],ey[1]-ey[0])*i.thermalPerMm,
  fullSeat=gw-two,meanPeak=2*pointN/(pw*fullSeat),a=Math.min(fullSeat/2,gw-2*gt),faceStress=6*meanPeak*a*(2*(gw-2*gt)-a)/(8*gt**2)
 check('plank-width','mm',25,pw)
 for(const p of planks)check(p.id+'/captured-mass','kg',p.completeMassDesignUpperKg,15)
 check('plank-wheel-and-dead','MPa',1.5*pointN*plankSpan/(25*b.thicknessMm**2),m.allowableComparisonMPa)
 check('plank-deflection','mm',pointN*plankSpan**3/(48*m.elasticModulusMPa*plankI),2)
 check('girder-whole-wheel-and-dead','MPa',girderN*span/(4*sec.Z),m.allowableComparisonMPa)
 check('girder-deflection','mm',outerDelta,2)
 check('girder-local-face-CONDITIONAL-two-mean-pressure','MPa',faceStress,m.allowableComparisonMPa)
 check('shared-post-combined-wheel-and-all-bridge-G','N',onePostN,c.sharedPostDesignCeilingN)
 check('shared-post-axial','MPa',onePostN/posts.area,m.allowableComparisonMPa)
 check('shared-cap-strip','MPa',6*onePostN*(Math.abs(c.innerGirderXMm-x)+rel)/(c.capWidthYMm*c.capThicknessMm**2),m.allowableComparisonMPa)
 check('external-cap-strip','MPa',6*onePostN*(Math.abs(c.outerGirderXMm-i.externalReceiverXMm)+rel)/(c.capWidthYMm*c.capThicknessMm**2),m.allowableComparisonMPa)
 check('rail-corbel-strip','MPa',6*(i.wheelN+i.walkingDeadAtOneNodeN)*(c.railCorbelLXtMm[0]+two)/(c.capWidthYMm*c.railCorbelLXtMm[1]**2),m.allowableComparisonMPa)
 check('segmented-end-seat','mm',20,c.capWidthYMm/2-joint/2-rel)
 check('inner-roof-setting-thermal-deflection','mm',i.sourceRoofMaximumMm+two+thermalCover+innerDelta,innerBottom)
 check('external-roof-setting-thermal-deflection','mm',i.sourceRoofAtExternalBeamMm+two+thermalCover+outerDelta,outerBottom)
 check('outer-girder-mechanical-capture','kg',outer.metalVolumeMm3/1e9*m.densityKgM3+i.hardwareEachKg,c.maximumMechanicallyCapturedGirderKg)
 const gap=(a:BridgeBox,b:BridgeBox)=>{const d=[0,1,2].map(k=>Math.max(a[k]-b[k]-b[k+3],b[k]-a[k]-a[k+3]));return d.some(v=>v>0)?Math.hypot(...d.map(v=>Math.max(0,v))):Math.max(...d)},
  lift=70,translation=i.externalRestPlanMm[0]+two-c.plankInnerXMm,restZ=top,renewal=planks.map(p=>{
   const home=p.boxMm,lifted=[home[0],home[1],home[2]+lift,home[3],home[4],home[5]]as BridgeBox,moved=[home[0]+translation,home[1],home[2]+lift,home[3],home[4],home[5]]as BridgeBox,rest=[moved[0],moved[1],restZ,home[3],home[4],home[5]]as BridgeBox,
    sweeps=[{phase:'capture-and-lift',boxMm:[home[0],home[1],home[2],home[3],home[4],home[5]+lift]as BridgeBox},{phase:'straight-X-to-external-first-rest',boxMm:[home[0],home[1],lifted[2],home[3]+translation,home[4],home[5]]as BridgeBox},{phase:'lower-onto-external-deck',boxMm:[moved[0],moved[1],restZ,home[3],home[4],moved[2]+home[5]-restZ]as BridgeBox}],
    obstacles=sweeps.flatMap(q=>(i.obstacles??[]).map(o=>({phase:q.phase,obstacle:o.id,reserveAfterSettingsMm:gap(q.boxMm,o.boxMm)-two}))),
    doorReserve=Math.min(home[1]-i.door.clearYMm[0],i.door.clearYMm[1]-home[1]-home[4])-two,
    restReserve=Math.min(rest[0]-i.externalRestPlanMm[0],i.externalRestPlanMm[0]+i.externalRestPlanMm[2]-rest[0]-rest[3],rest[1]-i.externalRestPlanMm[1],i.externalRestPlanMm[1]+i.externalRestPlanMm[3]-rest[1]-rest[4])-two,
    headReserve=i.door.headAbsoluteMm-(lifted[2]+home[5])-two
   return{id:p.id,homeBoxMm:home,liftedBoxMm:lifted,externalRestBoxMm:rest,sweeps,obstacleChecks:obstacles,doorReserveMm:doorReserve,externalRestReserveMm:restReserve,headReserveMm:headReserve,necessaryGeometricSweeps:doorReserve>=0&&restReserve>=0&&headReserve>=0&&obstacles.every(q=>q.reserveAfterSettingsMm>=0),actualPositiveCaptureCrewToolsAndRestCapacityAccepted:false}
  })
 return{schema:'had-post-row-bridge/1',sourceDigest:sha256SemanticFingerprint(i),parts,planks,girderSegments,packers,caps,sharedPostUpdates,externalPostUpdates,deckCutoutPlanMm:[c.plankInnerXMm,i.plateYMm[0],L,W]as P,walkingRailEndXMm:c.innerGirderXMm-gw/2,walkingRailResumeXMm:c.innerGirderXMm+gw/2,sharedGridYMm:ys,girderBottomMm:innerBottom,girderTopMm:innerTop,externalGirderBottomMm:outerBottom,plateBottomMm:plateBottom,bridgeTopMm:top,bridgeDeadUpperKg,oneSharedPostDemandUpperN:onePostN,memberChecks:checks,necessaryMemberComparisons:checks.every(c=>c.necessary),renewal,necessaryRenewalGeometry:renewal.every(p=>p.necessaryGeometricSweeps),normalReactionBounds:{oneFactoredWheelN:i.wheelN,walkingGOnceN:i.walkingDeadAtOneNodeN,allBridgeDeadUpperKg:bridgeDeadUpperKg,ownSharedPostAndFootUpperN:sharedOwnUpperN,onePostMaximumN:onePostN,sharedPostCeilingN:c.sharedPostDesignCeilingN,segmentedSimplySupportedInnerSpans:true,wheelWithinOuterSupports:true,normalMinimumReactionN:0,negativeReactionNotHiddenByUpperDeadMass:true},stock:{girderMinimumWallMm:gt,girderMaximumWallForGUpperMm:c.maximumGirderWallMm,sealedOuterBoxStillUsedForWater:true,actualDeliveredStockAccepted:false},retired:{insideBridgePosts:2,insideBridgeFeet:2,XBridgeRails:3,quarterTurnRenewal:true},actualExternalReceiversLateralTiesBoltToolContactAndWholeHouseAccepted:false}
}
