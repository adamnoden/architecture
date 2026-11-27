import {sha256SemanticFingerprint} from '../../core/identity.js'
export type BridgeBox=readonly[number,number,number,number,number,number]
type P=readonly[number,number,number,number]
type S=readonly[number,number,number]
export type PostRowBridgeControl={thicknessMm:number;pieceCount:number;crossBeamSupportYMm:readonly[number,number];postRow:{supportMode?:'two-end-continuous';innerGirderWallMm?:number;maximumInnerGirderWallMm?:number;corbelWeldLegMm?:number;renewal?:{northTranslationMm:number;firstLiftMm:number;turnCentreAboveWalkingMm:number};innerGirderXMm:number;outerGirderXMm:number;plankInnerXMm:number;plankOuterXMm:number;sharedPostColumnIndex:number;sharedPostYMm:readonly number[];innerGirderEndYMm:readonly[number,number];innerSeatPackerMm:number;girderSectionWHtMm:S;maximumGirderWallMm:number;capThicknessMm:number;capWidthYMm:number;railCorbelLXtMm:readonly[number,number];matchedSeatErrorMm:number;grateToBridgeGapMm:number;perimeterGapMm:number;postSectionWHtMm:S;sharedPostDesignCeilingN:number;maximumMechanicallyCapturedGirderKg:number}}
export type PostRowPart={id:string;kind:string;boxMm:BridgeBox;metalVolumeMm3:number;displacementOuterBoxRequired:boolean;installedAcceptance:false}
export type PostRowBridgeInput={bridge:PostRowBridgeControl;grid:{xMm:readonly number[];yMm:readonly number[]};walkingTopMm:number;plateYMm:readonly[number,number];externalReceiverXMm:number;panMinimumMm:number;panMaximumMm?:number;openedStripPlanMm?:P;wheelN:number;material:{densityKgM3:number;elasticModulusMPa:number;allowableComparisonMPa:number;minimumDensityKgM3?:number};settingEachMm:number;thermalPerMm:number;walkingDeadAtOneNodeN:number;sharedFootMaximumStockKg:number;sharedFootSideMm?:number;sharedFootMinimumMm?:number;collectedCorbelLoads?:readonly{yMm:number;deadUpperN:number}[];walkingDeadCases?:readonly{sourcePartId:string;maximumN:number;sourceYMm:readonly[number,number];supportYMm?:readonly[number,number]}[];walkingWheelCases?:readonly{sourcePartId:string;wheelAtYMm:number;loads:readonly{yMm:number;forceN:number}[]}[];retainedWalkingObstacles?:readonly{id:string;boxMm:BridgeBox}[];postSectionWHtMm:S;sourceRoofMaximumMm:number;sourceRoofAtExternalBeamMm:number;panelJointMm:number;hardwareEachKg:number;grateMaximumRelativeSeatErrorMm:number;externalRestPlanMm:P;door:{clearYMm:readonly[number,number];headAbsoluteMm:number};obstacles?:readonly{id:string;boxMm:BridgeBox}[]}
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
 const b=i.bridge,c=b.postRow,m=i.material,s=i.settingEachMm,two=2*s,[gw,gh,gt]=c.girderSectionWHtMm,rel=c.matchedSeatErrorMm,continuous=c.supportMode==='two-end-continuous',innerWall=continuous?c.innerGirderWallMm??gt:gt,maximumInnerWall=continuous?c.maximumInnerGirderWallMm??c.maximumGirderWallMm:c.maximumGirderWallMm,
  top=i.walkingTopMm,plateBottom=top-b.thicknessMm,innerTop=plateBottom-c.innerSeatPackerMm,innerBottom=innerTop-gh,outerBottom=plateBottom-gh,
  x=i.grid.xMm[c.sharedPostColumnIndex],ys=[...c.sharedPostYMm],L=c.plankOuterXMm-c.plankInnerXMm,W=i.plateYMm[1]-i.plateYMm[0],joint=i.panelJointMm,pw=(W-(b.pieceCount-1)*joint)/b.pieceCount,
  sec=rhs(c.girderSectionWHtMm),innerSection=rhs([gw,gh,innerWall]),innerAreaUpper=rhs([gw,gh,maximumInnerWall]).area,areaUpper=rhs([gw,gh,c.maximumGirderWallMm]).area,corbelYs=continuous?i.grid.yMm.filter(y=>y>=ys[0]&&y<=ys.at(-1)!):ys,posts=rhs(c.postSectionWHtMm),postOuterArea=c.postSectionWHtMm[0]*c.postSectionWHtMm[1]
 if(!finite([top,plateBottom,innerTop,innerBottom,outerBottom,x,...ys,L,W,pw,...c.girderSectionWHtMm,c.maximumGirderWallMm,c.capThicknessMm,c.capWidthYMm,...c.railCorbelLXtMm,rel,c.grateToBridgeGapMm,c.perimeterGapMm,...c.postSectionWHtMm,i.grateMaximumRelativeSeatErrorMm,c.sharedPostDesignCeilingN,c.maximumMechanicallyCapturedGirderKg,i.externalReceiverXMm,i.panMinimumMm,i.wheelN,m.densityKgM3,m.elasticModulusMPa,m.allowableComparisonMPa,s,i.thermalPerMm,i.walkingDeadAtOneNodeN,i.sharedFootMaximumStockKg,...i.postSectionWHtMm,i.sourceRoofMaximumMm,i.sourceRoofAtExternalBeamMm,joint,i.hardwareEachKg,...i.externalRestPlanMm,...i.door.clearYMm,i.door.headAbsoluteMm])||b.thicknessMm!==40||b.pieceCount!==15||ys.length!==(continuous?2:5)||ys.some((y,k)=>!continuous&&!i.grid.yMm.some(v=>Math.abs(v-y)<1e-6)||k>0&&y<=ys[k-1])||!continuous&&(c.innerGirderEndYMm[0]!==ys[0]||c.innerGirderEndYMm[1]!==ys.at(-1))||ys[0]>i.plateYMm[0]||ys.at(-1)!<i.plateYMm[1]||Math.min(gw,gh,gt,m.densityKgM3,m.elasticModulusMPa,m.allowableComparisonMPa,L,W,pw)<=0||c.maximumGirderWallMm<gt||2*c.maximumGirderWallMm>=Math.min(gw,gh)||s<10||rel<3||c.perimeterGapMm<35||Math.min(c.postSectionWHtMm[0],c.postSectionWHtMm[1])<60||c.postSectionWHtMm[2]<5||2*c.postSectionWHtMm[2]>=Math.min(c.postSectionWHtMm[0],c.postSectionWHtMm[1])||c.grateToBridgeGapMm<6||c.grateToBridgeGapMm<rel+i.grateMaximumRelativeSeatErrorMm||c.capThicknessMm<35||c.sharedPostDesignCeilingN<9000||c.innerGirderXMm<=x||c.outerGirderXMm<=c.innerGirderXMm||Math.abs(c.plankInnerXMm-(c.innerGirderXMm-gw/2))>1e-6||Math.abs(c.plankOuterXMm-(c.outerGirderXMm+gw/2))>1e-6)throw Error('Actual five-post or two-end full-seat bridge geometry and finite source bounds required')
 if(continuous&&(!finite([innerWall,maximumInnerWall,c.corbelWeldLegMm!,i.sharedFootSideMm!,i.sharedFootMinimumMm!,c.renewal?.northTranslationMm!,c.renewal?.firstLiftMm!,c.renewal?.turnCentreAboveWalkingMm!])||innerWall<gt||maximumInnerWall<innerWall||2*maximumInnerWall>=Math.min(gw,gh)||c.corbelWeldLegMm!<4||i.sharedFootSideMm!<150||i.sharedFootMinimumMm!<25||corbelYs.length<1))throw Error('Actual end feet, corbel welds, captured renewal and inner-wall bounds required')
 const physicalInnerEndYMm:readonly[number,number]=continuous?[Math.min(ys[0],corbelYs[0]-c.capWidthYMm/2),Math.max(ys.at(-1)!,corbelYs.at(-1)!+c.capWidthYMm/2)]:[ys[0],ys.at(-1)!]
 if(continuous&&(!finite([i.panMaximumMm!,...(i.openedStripPlanMm??[])] )||!i.openedStripPlanMm||i.panMaximumMm!<i.panMinimumMm||!Number.isFinite(m.minimumDensityKgM3)||m.minimumDensityKgM3!<=0||m.minimumDensityKgM3!>m.densityKgM3||!i.walkingWheelCases?.length||i.walkingWheelCases.some(q=>!finite([q.wheelAtYMm,...q.loads.flatMap(p=>[p.yMm,p.forceN])]))))throw Error('Actual material lower density and signed one-wheel walking cases required')
 const parts:PostRowPart[]=[],checks:{id:string;quantity:string;value:number;limit:number;necessary:boolean}[]=[],
  add=(id:string,kind:string,boxMm:BridgeBox,metal=vol(boxMm))=>{const p:PostRowPart={id,kind,boxMm,metalVolumeMm3:metal,displacementOuterBoxRequired:true,installedAcceptance:false};parts.push(p);return p},
  check=(id:string,quantity:string,value:number,limit:number)=>checks.push({id:'Plant/post-row-bridge/'+id,quantity,value,limit,necessary:Number.isFinite(value)&&value<=limit+1e-8}),
  planks=Array.from({length:b.pieceCount},(_,k)=>{const p=add('Plant/bridge-piece/'+k,'bridge-plate',[c.plankInnerXMm,i.plateYMm[0]+k*(pw+joint),plateBottom,L,pw,b.thicknessMm]);return{id:p.id,boxMm:p.boxMm,referenceSheetKg:p.metalVolumeMm3/1e9*m.densityKgM3,completeMassDesignUpperKg:p.metalVolumeMm3/1e9*m.densityKgM3+i.hardwareEachKg,actualCaptureToolsAndRestAccepted:false as const}}),
  girderSegments:{id:string;boxMm:BridgeBox;clearLengthMm:number;supportYMm:number[];reactionLaw:string;maximumCompleteCapturedKg:number}[]=[],packers:PostRowPart[]=[],sharedPostUpdates:{postId:string;headId:string;footId:string;xyMm:number[];postTopMm:number;postSectionWHtMm:S;createNew?:boolean}[]=[],caps:{id:string;boxMm:BridgeBox;postXYMm:number[];girderXMm:number;maximumLoadEccentricityMm:number;matchedSeatErrorMm:number;actualBoltsSlotsWebBearingAndWeldsAccepted:boolean}[]=[]
 for(let k=1;k<ys.length;k++){
  const lo=continuous?physicalInnerEndYMm[0]:ys[k-1]+(k===1?0:joint/2),hi=continuous?physicalInnerEndYMm[1]:ys[k]-(k===ys.length-1?0:joint/2),length=hi-lo,
   p=add('Plant/post-row-bridge/inner-girder/'+k,'post-row-bridge-girder',[c.innerGirderXMm-gw/2,lo,innerBottom,gw,length,gh],innerAreaUpper*length)
  girderSegments.push({id:p.id,boxMm:p.boxMm,clearLengthMm:length,supportYMm:[ys[k-1],ys[k]],reactionLaw:continuous?'ONE simply-supported continuous member on two end posts. No interior support, equal sharing or beam splice is assumed.':'Independent simply-supported member; positive articulated captured end seats, no transfer of beam moment across the one millimetre joint.',maximumCompleteCapturedKg:p.metalVolumeMm3/1e9*m.densityKgM3+i.hardwareEachKg})
  const a=Math.max(lo,i.plateYMm[0]),z=Math.min(hi,i.plateYMm[1]);if(!continuous&&z>a)packers.push(add('Plant/post-row-bridge/inner-seat/'+k,'post-row-solid-seat',[c.innerGirderXMm-gw/2,a,innerTop,gw,z-a,c.innerSeatPackerMm]))
 }
 if(continuous){const cuts=[i.plateYMm[0],...corbelYs.filter(y=>y>i.plateYMm[0]&&y<i.plateYMm[1]),i.plateYMm[1]];for(let k=1;k<cuts.length;k++){const a=cuts[k-1]+(k===1?0:joint/2),z=cuts[k]-(k===cuts.length-1?0:joint/2);if(z>a)packers.push(add('Plant/post-row-bridge/inner-seat/'+k,'post-row-solid-seat',[c.innerGirderXMm-gw/2,a,innerTop,gw,z-a,c.innerSeatPackerMm]))}}
 const ey=i.bridge.crossBeamSupportYMm,outer=add('Plant/post-row-bridge/external-girder','post-row-bridge-girder',[c.outerGirderXMm-gw/2,ey[0],outerBottom,gw,ey[1]-ey[0],gh],areaUpper*(ey[1]-ey[0]))
 const capAt=(id:string,postX:number,y:number,girderX:number,bottom:number)=>{
  const a=Math.min(girderX-gw/2-rel,postX-c.postSectionWHtMm[0]/2-rel),z=Math.max(girderX+gw/2+rel,postX+c.postSectionWHtMm[0]/2+rel),
   cap=add(id,'post-row-solid-cap',[a,y-c.capWidthYMm/2,bottom-c.capThicknessMm,z-a,c.capWidthYMm,c.capThicknessMm])
  caps.push({id:cap.id,boxMm:cap.boxMm,postXYMm:[postX,y],girderXMm:girderX,maximumLoadEccentricityMm:Math.abs(girderX-postX)+rel,matchedSeatErrorMm:rel,actualBoltsSlotsWebBearingAndWeldsAccepted:false})
  return cap
 }
 for(const y of ys){
  const cap=capAt('Plant/post-row-bridge/shared-cap/'+y,x,y,c.innerGirderXMm,innerBottom),index=i.grid.yMm.findIndex(v=>Math.abs(v-y)<1e-6)
  if(continuous){
   const k=ys.indexOf(y),suffix=c.sharedPostColumnIndex+'/end-'+k,side=i.sharedFootSideMm!,minimum=i.sharedFootMinimumMm!,z=i.panMinimumMm+minimum,h=cap.boxMm[2]-z
   if(h<=0)throw Error('New end post has no positive source-bound compression length')
   add('Plant/foot/'+suffix,'solid-foot-pad',[x-side/2,y-side/2,i.panMinimumMm,side,side,minimum])
   add('Plant/post/'+suffix,'RHS-post-bound',[x-c.postSectionWHtMm[0]/2,y-c.postSectionWHtMm[1]/2,z,c.postSectionWHtMm[0],c.postSectionWHtMm[1],h],posts.area*h)
   sharedPostUpdates.push({postId:'Plant/post/'+suffix,headId:'Plant/head-plate/'+suffix,footId:'Plant/foot/'+suffix,xyMm:[x,y],postTopMm:cap.boxMm[2],postSectionWHtMm:c.postSectionWHtMm,createNew:true})
  }else{
   sharedPostUpdates.push({postId:'Plant/post/'+c.sharedPostColumnIndex+'/'+index,headId:'Plant/head-plate/'+c.sharedPostColumnIndex+'/'+index,footId:'Plant/foot/'+c.sharedPostColumnIndex+'/'+index,xyMm:[x,y],postTopMm:cap.boxMm[2],postSectionWHtMm:c.postSectionWHtMm})
   add('Plant/post-row-bridge/walk-corbel/'+y,'post-row-solid-corbel',[c.innerGirderXMm-gw/2-c.railCorbelLXtMm[0],y-c.capWidthYMm/2,top-70-40-c.railCorbelLXtMm[1],c.railCorbelLXtMm[0],c.capWidthYMm,c.railCorbelLXtMm[1]])
  }
 }
 if(continuous)for(const y of corbelYs){add('Plant/post-row-bridge/walk-corbel/'+y,'post-row-solid-corbel',[c.innerGirderXMm-gw/2-c.railCorbelLXtMm[0],y-c.capWidthYMm/2,top-70-40-c.railCorbelLXtMm[1],c.railCorbelLXtMm[0],c.capWidthYMm,c.railCorbelLXtMm[1]]);const leg=c.corbelWeldLegMm!,weldV=leg**2/2*2*(c.capWidthYMm+c.railCorbelLXtMm[1]);add('Plant/post-row-bridge/corbel-weld/'+y,'post-row-fillet-weld',[c.innerGirderXMm-gw/2-leg,y-c.capWidthYMm/2,top-70-40-c.railCorbelLXtMm[1],leg,c.capWidthYMm,c.railCorbelLXtMm[1]],weldV)}
 if(continuous)for(const [k,Y]of physicalInnerEndYMm.entries()){const clearW=gw-2*innerWall,clearH=gh-2*innerWall,capT=6;add('Plant/post-row-bridge/inner-sealed-end/'+k,'post-row-inner-end-closure',[c.innerGirderXMm-clearW/2,k===0?Y:Y-capT,innerBottom+innerWall,clearW,capT,clearH])}
 const externalPostUpdates=ey.map(y=>{const cap=capAt('Plant/post-row-bridge/external-cap/'+y,i.externalReceiverXMm,y,c.outerGirderXMm,outerBottom);return{postId:'Plant/bridge-post/'+i.externalReceiverXMm+'/'+y,footId:'Plant/bridge-foot/'+i.externalReceiverXMm+'/'+y,xyMm:[i.externalReceiverXMm,y],postTopMm:cap.boxMm[2],postSectionWHtMm:c.postSectionWHtMm,actualExternalReceiverAccepted:false}})
 const signedWheelCases=continuous?i.walkingWheelCases!.map(q=>{
  const loads=q.loads.filter(p=>corbelYs.includes(p.yMm)),span=ys[1]-ys[0],
   endForces=[loads.reduce((n,p)=>n+p.forceN*(ys[1]-p.yMm)/span,0),loads.reduce((n,p)=>n+p.forceN*(p.yMm-ys[0])/span,0)]
  return{...q,collectedLoads:loads,endForcesN:endForces}
 }):[],
  signedDeadCases=continuous?(i.walkingDeadCases??[]).map(q=>{
   const endpoints=q.sourceYMm.map(y=>{const loads=q.supportYMm?[{yMm:q.supportYMm[0],perUnitForce:(q.supportYMm[1]-y)/(q.supportYMm[1]-q.supportYMm[0])},{yMm:q.supportYMm[1],perUnitForce:(y-q.supportYMm[0])/(q.supportYMm[1]-q.supportYMm[0])}]:[{yMm:y,perUnitForce:1}],collected=q.supportYMm?loads.filter(p=>corbelYs.includes(p.yMm)):loads;
    return{applicationYMm:y,collectedLoads:collected,endForcesPerUnit:[collected.reduce((n,p)=>n+p.perUnitForce*(ys[1]-p.yMm)/(ys[1]-ys[0]),0),collected.reduce((n,p)=>n+p.perUnitForce*(p.yMm-ys[0])/(ys[1]-ys[0]),0)]}
   })
   return{...q,endpoints}
  }):[],
  deadEndUpper=continuous?[0,1].map(k=>signedDeadCases.reduce((n,q)=>n+q.maximumN*Math.max(0,...q.endpoints.map(p=>p.endForcesPerUnit[k])),0)):[i.walkingDeadAtOneNodeN,i.walkingDeadAtOneNodeN],
  maximumAbsoluteCollectedDeadN=continuous?signedDeadCases.reduce((n,q)=>n+q.maximumN*Math.max(...q.endpoints.map(p=>p.collectedLoads.reduce((sum,a)=>sum+Math.abs(a.perUnitForce),0))),0):i.walkingDeadAtOneNodeN,
  maximumCorbelDeadUpperN=continuous?Math.max(0,...corbelYs.map(y=>signedDeadCases.reduce((n,q)=>n+q.maximumN*Math.max(0,...q.endpoints.map(p=>Math.abs(p.collectedLoads.find(a=>a.yMm===y)?.perUnitForce??0))),0))):i.walkingDeadAtOneNodeN,
  maximumWheelAtEndN=continuous?Math.max(i.wheelN,...signedWheelCases.flatMap(p=>p.endForcesN)):i.wheelN,
  maximumAbsoluteCorbelWheelN=continuous?Math.max(i.wheelN,...signedWheelCases.flatMap(q=>q.collectedLoads.map(p=>Math.abs(p.forceN)))):i.wheelN,
  maximumAbsoluteCollectedWheelN=continuous?Math.max(i.wheelN,...signedWheelCases.map(q=>q.collectedLoads.reduce((n,p)=>n+Math.abs(p.forceN),0))):i.wheelN
 // All new bridge stock plus BOTH retained external feet/posts is charged to
 // ONE shared post. Walking G is added once; there is only ONE factored wheel.
 const gravityParts=continuous?parts.filter(p=>p.kind!=='solid-foot-pad'&&p.kind!=='RHS-post-bound'):parts,
  hardwareCount=continuous?gravityParts.filter(p=>!['post-row-solid-corbel','post-row-fillet-weld','post-row-inner-end-closure'].includes(p.kind)).length:gravityParts.length,
  newMass=gravityParts.reduce((n,p)=>n+p.metalVolumeMm3/1e9*m.densityKgM3,0)+hardwareCount*i.hardwareEachKg,
  retainedExternalUpperKg=2*(i.sharedFootMaximumStockKg+postOuterArea*Math.max(0,outerBottom-c.capThicknessMm-i.panMinimumMm)/1e9*m.densityKgM3),
  bridgeDeadUpperKg=newMass+retainedExternalUpperKg,
  sharedOwnUpperN=(i.sharedFootMaximumStockKg+postOuterArea*Math.max(0,innerBottom-c.capThicknessMm-i.panMinimumMm)/1e9*m.densityKgM3)*9.81,
  onePostN=maximumWheelAtEndN+bridgeDeadUpperKg*9.81+Math.max(...deadEndUpper)+sharedOwnUpperN,pointN=i.wheelN+Math.max(...planks.map(p=>p.completeMassDesignUpperKg))*9.81,
  girderN=i.wheelN+bridgeDeadUpperKg*9.81,span=Math.max(...ys.slice(1).map((y,k)=>y-ys[k]),ey[1]-ey[0])+two,
  plankSpan=c.outerGirderXMm-c.innerGirderXMm+two,plankI=25*b.thicknessMm**3/12,
  innerDelta=((continuous?maximumAbsoluteCollectedWheelN: i.wheelN)+bridgeDeadUpperKg*9.81+(continuous?maximumAbsoluteCollectedDeadN:0))*(Math.max(...ys.slice(1).map((y,k)=>y-ys[k]))+two)**3/(48*m.elasticModulusMPa*innerSection.I),
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
 const westLever=c.railCorbelLXtMm[0]+Math.abs(c.innerGirderXMm-x)+two,maxYLever=c.capWidthYMm/2+rel,bridgeLever=Math.abs(c.innerGirderXMm-x)+rel,externalLever=Math.abs(c.outerGirderXMm-i.externalReceiverXMm)+rel
 check('shared-post-conservative-biaxial','MPa',onePostN/posts.area+onePostN*(Math.max(westLever,bridgeLever)+maxYLever)/posts.Z,m.allowableComparisonMPa)
 check('external-post-conservative-biaxial','MPa',onePostN/posts.area+onePostN*(externalLever+maxYLever)/posts.Z,m.allowableComparisonMPa)
 check('shared-cap-strip','MPa',6*onePostN*(Math.abs(c.innerGirderXMm-x)+rel)/(c.capWidthYMm*c.capThicknessMm**2),m.allowableComparisonMPa)
 check('external-cap-strip','MPa',6*onePostN*(Math.abs(c.outerGirderXMm-i.externalReceiverXMm)+rel)/(c.capWidthYMm*c.capThicknessMm**2),m.allowableComparisonMPa)
 check('rail-corbel-strip','MPa',6*(maximumAbsoluteCorbelWheelN+maximumCorbelDeadUpperN)*(c.railCorbelLXtMm[0]+two)/(c.capWidthYMm*c.railCorbelLXtMm[1]**2),m.allowableComparisonMPa)
 check('segmented-end-seat','mm',20,c.capWidthYMm/2-joint/2-rel)
 check('inner-roof-setting-thermal-deflection','mm',i.sourceRoofMaximumMm+two+thermalCover+innerDelta,innerBottom)
 check('external-roof-setting-thermal-deflection','mm',i.sourceRoofAtExternalBeamMm+two+thermalCover+outerDelta,outerBottom)
 check('outer-girder-mechanical-capture','kg',outer.metalVolumeMm3/1e9*m.densityKgM3+i.hardwareEachKg,c.maximumMechanicallyCapturedGirderKg)
 const innerAssemblyParts=parts.filter(p=>p.id.startsWith('Plant/post-row-bridge/inner-girder/')||p.id.startsWith('Plant/post-row-bridge/walk-corbel/')||p.id.startsWith('Plant/post-row-bridge/corbel-weld/')||p.id.startsWith('Plant/post-row-bridge/inner-sealed-end/')),
  innerAssemblyUpperKg=innerAssemblyParts.reduce((n,p)=>n+p.metalVolumeMm3/1e9*m.densityKgM3,0)+(continuous?2*i.hardwareEachKg:0),
  retiredGridSupports=continuous?i.grid.yMm.flatMap((y,k)=>y>=ys[0]&&y<=ys.at(-1)!?[{postId:'Plant/post/'+c.sharedPostColumnIndex+'/'+k,headId:'Plant/head-plate/'+c.sharedPostColumnIndex+'/'+k,footId:'Plant/foot/'+c.sharedPostColumnIndex+'/'+k,yMm:y}]:[]):[]
 if(continuous){
  check('actual-one-signed-wheel-force-closure','N',Math.max(...i.walkingWheelCases!.map(q=>Math.abs(q.loads.reduce((n,p)=>n+p.forceN,0)-i.wheelN))),1e-6)
  check('actual-unique-walking-G-case-closure','N',Math.abs(signedDeadCases.reduce((n,q)=>n+q.maximumN,0)-i.walkingDeadAtOneNodeN),1e-6)
  const innerSpan=ys.at(-1)!-ys[0]+two,innerN=maximumAbsoluteCollectedWheelN+bridgeDeadUpperKg*9.81+maximumAbsoluteCollectedDeadN,globalInner=innerN*innerSpan/(4*innerSection.Z),
   corbelN=maximumAbsoluteCorbelWheelN+maximumCorbelDeadUpperN,a=Math.min(c.railCorbelLXtMm[1]/2,gh-2*innerWall),peak=2*corbelN/(c.capWidthYMm*c.railCorbelLXtMm[1]),
   webLocal=6*peak*a*(2*(gh-2*innerWall)-a)/(8*innerWall**2),webFibre=Math.max(Math.abs((top-70-40)- (innerBottom+gh/2)),Math.abs((top-70-40-c.railCorbelLXtMm[1])-(innerBottom+gh/2)))/(gh/2),
   weldThroat=c.corbelWeldLegMm!/Math.SQRT2,weldA=2*(c.capWidthYMm+c.railCorbelLXtMm[1])*weldThroat,
   weldI=weldThroat*(2*c.capWidthYMm*(c.railCorbelLXtMm[1]/2)**2+2*c.railCorbelLXtMm[1]**3/12),weldSigma=corbelN*c.railCorbelLXtMm[0]/(weldI/(c.railCorbelLXtMm[1]/2))
  check('inner-complete-walking-collector-bending','MPa',globalInner,m.allowableComparisonMPa)
  check('inner-complete-walking-collector-deflection','mm',innerN*innerSpan**3/(48*m.elasticModulusMPa*innerSection.I),2)
  check('corbel-web-local-plus-global-fibre-CONDITIONAL','MPa',webLocal+globalInner*webFibre,m.allowableComparisonMPa)
  check('corbel-full-perimeter-weld-combined','MPa',Math.hypot(weldSigma,Math.sqrt(3)*corbelN/weldA),m.allowableComparisonMPa)
  check('inner-whole-welded-assembly-capture','kg',innerAssemblyUpperKg,c.maximumMechanicallyCapturedGirderKg)
 }

 // Restoring G is ONLY known permanent metal at the declared material minimum.
 // Unknown cargo minima and upper bridge/blank budgets never restore uplift.
 const normalEndReactionLower=continuous?(()=>{
  const beam=parts.find(p=>p.id==='Plant/post-row-bridge/inner-girder/1')!,span=ys[1]-ys[0],
   minimumBeamN=innerSection.area*beam.boxMm[4]/1e9*m.minimumDensityKgM3!*9.81,
   beamCentreY=beam.boxMm[1]+beam.boxMm[4]/2,
   ownMinimum=sharedPostUpdates.map(q=>{
    const foot=parts.find(p=>p.id===q.footId)!,cap=parts.find(p=>p.id==='Plant/post-row-bridge/shared-cap/'+q.xyMm[1])!,shortestPostMm=Math.max(0,cap.boxMm[2]-i.panMaximumMm!-i.sharedFootMinimumMm!),
     volume=foot.boxMm[3]*foot.boxMm[4]*i.sharedFootMinimumMm!+posts.area*shortestPostMm
    return volume/1e9*m.minimumDensityKgM3!*9.81
   }),
   collectedGravityLower=[0,1].map(end=>signedDeadCases.reduce((n,q)=>n+q.maximumN*Math.min(0,...q.endpoints.map(p=>p.endForcesPerUnit[end])),0)),
   rawWheelMinimum=[0,1].map(end=>Math.min(0,...signedWheelCases.map(q=>q.endForcesN[end]))),
   beamRestoring=[minimumBeamN*(ys[1]-beamCentreY)/span,minimumBeamN*(beamCentreY-ys[0])/span],
   result=ownMinimum.map((g,k)=>g+beamRestoring[k]+rawWheelMinimum[k]+collectedGravityLower[k])
  check('normal-two-end-minimum-metal-and-signed-wheel','N',0,Math.min(...result))
  return{densityMinimumKgM3:m.minimumDensityKgM3!,minimumBeamGravityN:minimumBeamN,minimumOwnShortestPostAndActualMinimumFootGravityN:ownMinimum,capRetainerVoidsAndUpperBlankMassCreditedForRestoring:false,minimumGirderReactionN:beamRestoring,rawSignedWheelMinimumReactionN:rawWheelMinimum,minimumCollectedWalkingGravityReactionN:collectedGravityLower,normalMinimumFootResultantsN:result,planksUnknownCargoUpperMassOrFrictionCreditedForRestoring:false,duringStrippedRenewalMechanicalCaptureStillRequired:true,actual95PercentContactPeakBoltAnchorAndWholeFrameStabilityAccepted:false}
 })():null
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

 // Actual whole welded-girder renewal. Each true component is swept separately;
 // a rotated rectangular member never becomes the filled AABB of its whole bay.
 const innerGirderRenewal=continuous?(()=>{
  const q=c.renewal!,centreY=(ys[0]+ys.at(-1)!)/2,centreZ=innerBottom+gh/2,
   targets=[...(i.obstacles??[]),...(i.retainedWalkingObstacles??[])],
   phaseRows:{phase:string;partId:string;obstacle:string;reserveAfterSettingsAndSamplingMm:number}[]=[],
   phases:{id:string;from:{dy:number;dz:number;theta:number;dx:number};to:{dy:number;dz:number;theta:number;dx:number};sampleBoundMm:number}[]=[],
   pose=(dy:number,dz:number,theta=0,dx=0)=>({dy,dz,theta,dx}),
   lifted=pose(0,q.firstLiftMm),north=pose(q.northTranslationMm,q.firstLiftMm),
   high=pose(q.northTranslationMm,top+q.turnCentreAboveWalkingMm-centreZ),
   upright={...high,theta:Math.PI/2},
   assemblyMinX=Math.min(...innerAssemblyParts.map(p=>p.boxMm[0])),
   toEast=i.externalRestPlanMm[0]+two-assemblyMinX,
   outside={...upright,dx:toEast},aligned={...outside,dy:(i.door.clearYMm[0]+i.door.clearYMm[1])/2-centreY},
   horizontal={...aligned,theta:0},rest={...horizontal,dz:top-innerBottom},
   addPhase=(id:string,from:ReturnType<typeof pose>,to:ReturnType<typeof pose>,sampleBoundMm=0)=>phases.push({id,from,to,sampleBoundMm})
  addPhase('captured-first-lift-after-six-panel-and-six-rail-removal',pose(0,0),lifted)
  addPhase('north-slide-below-source-radiator',lifted,north)
  addPhase('raise-clear-of-walking-floor',north,high)
  const radius=Math.max(...innerAssemblyParts.flatMap(p=>[p.boxMm[1],p.boxMm[1]+p.boxMm[4]].flatMap(y=>[p.boxMm[2],p.boxMm[2]+p.boxMm[5]].map(z=>Math.hypot(y-centreY,z-centreZ))))),
   angularSteps=180,stepAngle=Math.PI/2/angularSteps,samplingBound=2*radius*Math.sin(stepAngle/4)
  addPhase('north-end-up-true-component-rotation',high,upright,samplingBound)
  addPhase('upright-straight-east-through-source-door',upright,outside)
  addPhase('align-over-actual-external-rest',outside,aligned)
  addPhase('external-captured-reverse-rotation',aligned,horizontal,samplingBound)
  addPhase('lower-horizontal-whole-member-to-external-rest',horizontal,rest)
  const geometry=(b:BridgeBox,p:ReturnType<typeof pose>)=>{
   const dy=b[1]+b[4]/2-centreY,dz=b[2]+b[5]/2-centreZ,co=Math.cos(p.theta),si=Math.sin(p.theta)
   return{centre:[b[0]+b[3]/2+p.dx,centreY+p.dy+dy*co-dz*si,centreZ+p.dz+dy*si+dz*co],half:[b[3]/2,b[4]/2,b[5]/2],co,si}
  },
   reserve=(b:BridgeBox,p:ReturnType<typeof pose>,o:BridgeBox)=>{
    const a=geometry(b,p),d=[o[0]+o[3]/2-a.centre[0],o[1]+o[4]/2-a.centre[1],o[2]+o[5]/2-a.centre[2]],h=[o[3]/2,o[4]/2,o[5]/2],
     axes=[[1,0,0],[0,1,0],[0,0,1],[0,a.co,a.si],[0,-a.si,a.co]],
     separations=axes.map(v=>Math.abs(d[0]*v[0]+d[1]*v[1]+d[2]*v[2])-(a.half[0]*Math.abs(v[0])+a.half[1]*Math.abs(v[1]*a.co+v[2]*a.si)+a.half[2]*Math.abs(-v[1]*a.si+v[2]*a.co)+h[0]*Math.abs(v[0])+h[1]*Math.abs(v[1])+h[2]*Math.abs(v[2])))
    return Math.max(...separations)
   },
   boxAt=(b:BridgeBox,p:ReturnType<typeof pose>)=>{const a=geometry(b,p),hy=Math.abs(a.co)*a.half[1]+Math.abs(a.si)*a.half[2],hz=Math.abs(a.si)*a.half[1]+Math.abs(a.co)*a.half[2];return[a.centre[0]-a.half[0],a.centre[1]-hy,a.centre[2]-hz,2*a.half[0],2*hy,2*hz]as BridgeBox},
   openedStripChecks:{phase:string;partId:string;minimumBottomMm:number;panTopBoundMm:number;edgeReserveAfterSettingsMm:number;necessary:boolean}[]=[],
   faceMates=caps.filter(v=>v.id.includes('/shared-cap/')).map(cap=>({capId:cap.id,faceZMm:cap.boxMm[2]+cap.boxMm[5],beamBottomMm:innerBottom,necessaryFaceOnlySeparation:Math.abs(cap.boxMm[2]+cap.boxMm[5]-innerBottom)<1e-8})),
   floorChecks:{phase:string;minimumBottomMm:number;requiredBottomMm:number;necessary:boolean}[]=[],
   doorChecks:{phase:string;minimumYMm:number;maximumYMm:number;maximumZMm:number;necessary:boolean}[]=[]
  for(const phase of phases){
   const rotating=Math.abs(phase.to.theta-phase.from.theta)>1e-8,samples=rotating?angularSteps:1
   for(const part of innerAssemblyParts){
    if(rotating){
     for(const o of targets){let minimum=Infinity;for(let k=0;k<=samples;k++){const p={...phase.from,theta:phase.from.theta+(phase.to.theta-phase.from.theta)*k/samples};minimum=Math.min(minimum,reserve(part.boxMm,p,o.boxMm))}phaseRows.push({phase:phase.id,partId:part.id,obstacle:o.id,reserveAfterSettingsAndSamplingMm:minimum-two-phase.sampleBoundMm})}
    }else{
     const a=boxAt(part.boxMm,phase.from),b=boxAt(part.boxMm,phase.to),
      swept=[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.min(a[2],b[2]),Math.max(a[0]+a[3],b[0]+b[3])-Math.min(a[0],b[0]),Math.max(a[1]+a[4],b[1]+b[4])-Math.min(a[1],b[1]),Math.max(a[2]+a[5],b[2]+b[5])-Math.min(a[2],b[2])]as BridgeBox
     for(const o of targets)phaseRows.push({phase:phase.id,partId:part.id,obstacle:o.id,reserveAfterSettingsAndSamplingMm:gap(swept,o.boxMm)-two})
     if(['captured-first-lift-after-six-panel-and-six-rail-removal','north-slide-below-source-radiator'].includes(phase.id)){
      const strip=i.openedStripPlanMm!,edge=Math.min(swept[0]-strip[0],strip[0]+strip[2]-swept[0]-swept[3],swept[1]-strip[1],strip[1]+strip[3]-swept[1]-swept[4])-two
      openedStripChecks.push({phase:phase.id,partId:part.id,minimumBottomMm:swept[2],panTopBoundMm:i.panMaximumMm!+two,edgeReserveAfterSettingsMm:edge,necessary:swept[2]>=i.panMaximumMm!+two&&edge>=0})
     }
    }
   }
   if(!['captured-first-lift-after-six-panel-and-six-rail-removal','north-slide-below-source-radiator'].includes(phase.id)){
    let bottom=Infinity
    for(const part of innerAssemblyParts)for(let k=0;k<=samples;k++){const p={dy:phase.from.dy+(phase.to.dy-phase.from.dy)*k/samples,dz:phase.from.dz+(phase.to.dz-phase.from.dz)*k/samples,theta:phase.from.theta+(phase.to.theta-phase.from.theta)*k/samples,dx:phase.from.dx+(phase.to.dx-phase.from.dx)*k/samples};bottom=Math.min(bottom,boxAt(part.boxMm,p)[2])}
    // At the final outside rest only the actual rest top is a mating plane.
    const required=phase.id==='lower-horizontal-whole-member-to-external-rest'?top:top+two+phase.sampleBoundMm
    floorChecks.push({phase:phase.id,minimumBottomMm:bottom,requiredBottomMm:required,necessary:bottom>=required-1e-8})
   }
   if(phase.id==='upright-straight-east-through-source-door'){
    const boxes=innerAssemblyParts.map(p=>boxAt(p.boxMm,phase.from)),lo=Math.min(...boxes.map(b=>b[1])),hi=Math.max(...boxes.map(b=>b[1]+b[4])),z=Math.max(...boxes.map(b=>b[2]+b[5]))
    doorChecks.push({phase:phase.id,minimumYMm:lo,maximumYMm:hi,maximumZMm:z,necessary:lo>=i.door.clearYMm[0]+two&&hi<=i.door.clearYMm[1]-two&&z<=i.door.headAbsoluteMm-two})
   }
  }
  const restBoxes=innerAssemblyParts.map(p=>boxAt(p.boxMm,rest)),restReserve=Math.min(...restBoxes.flatMap(b=>[b[0]-i.externalRestPlanMm[0],i.externalRestPlanMm[0]+i.externalRestPlanMm[2]-b[0]-b[3],b[1]-i.externalRestPlanMm[1],i.externalRestPlanMm[1]+i.externalRestPlanMm[3]-b[1]-b[4]]))-two,
   necessary=openedStripChecks.every(p=>p.necessary)&&faceMates.every(p=>p.necessaryFaceOnlySeparation)&&phaseRows.every(p=>p.reserveAfterSettingsAndSamplingMm>=0)&&floorChecks.every(p=>p.necessary)&&doorChecks.every(p=>p.necessary)&&restReserve>=0
  return{removedActualWalkingPartIds:[] as string[],wholeCapturedAssemblyPartIds:innerAssemblyParts.map(p=>p.id),wholeCapturedAssemblyUpperKg:innerAssemblyUpperKg,phases,obstacleChecks:phaseRows,openedStripChecks,floorChecks,doorChecks,externalRestReserveMm:restReserve,initialMatingFaces:faceMates,lowStripPhaseScope:'First lift and low north slide use the actual removed east-panel/rail strip and retained solid obstacles; no fictitious680mm floor plane is inserted into the deliberately opened strip. Pan contact and actual retained boundaries remain required.',angularSampleBoundMm:samplingBound,necessaryGeometricSweeps:necessary,requiredBeforeRelease:['isolate-cool-and-drain-actual-Plant-network','remove-fifteen-bridge-planks-and-four-top-packers','remove-six-east-column-panels-and-six-last-walking-rail-segments','mechanically-capture-whole-welded-girder-before-releasing-two-cap-retainers'],remainingFrameStabilityAccepted:false,actualCaptureCraneAntiRollBoltsToolsAndExternalRestAccepted:false}
 })():null
 return{schema:'had-post-row-bridge/1',sourceDigest:sha256SemanticFingerprint(i),panelSeatSignedDuties:{maximumWheelDownwardCorbelN:maximumAbsoluteCorbelWheelN,maximumWheelUpliftAtWalkingSeatN:continuous?Math.max(0,...signedWheelCases.flatMap(q=>q.loads.map(p=>-p.forceN))):0,gravityOnlyLocatorsAreNotHoldDowns:true,actualPanelRetainersCorbelTensionAndRailClipsAccepted:false},parts,planks,girderSegments,packers,caps,sharedPostUpdates,externalPostUpdates,deckCutoutPlanMm:[c.plankInnerXMm,i.plateYMm[0],L,W]as P,grateExclusionPlanMm:[c.plankInnerXMm-(c.grateToBridgeGapMm-.5),i.plateYMm[0]-(c.grateToBridgeGapMm-.5),L+2*(c.grateToBridgeGapMm-.5),W+2*(c.grateToBridgeGapMm-.5)]as P,grateToBridgeFit:{nominalGapMm:c.grateToBridgeGapMm,grateRelativeSeatErrorMm:i.grateMaximumRelativeSeatErrorMm,girderRelativeSeatErrorMm:rel,netMm:c.grateToBridgeGapMm-i.grateMaximumRelativeSeatErrorMm-rel,actualMatchedFactoryFitAccepted:false},walkingRailEndXMm:c.innerGirderXMm-gw/2,walkingRailResumeXMm:c.innerGirderXMm+gw/2,sharedGridYMm:corbelYs,supportMode:continuous?'two-end-continuous':'five-segmented-control',retiredGridSupports,actualEndPostYMm:ys,physicalInnerEndYMm,signedWheelCases,signedDeadCases,deadEndUpper,maximumCorbelDeadUpperN,normalEndReactionLower,maximumAbsoluteCorbelWheelN,maximumWheelAtEndN,innerAssemblyUpperKg,innerAssemblyPartIds:innerAssemblyParts.map(p=>p.id),girderBottomMm:innerBottom,girderTopMm:innerTop,externalGirderBottomMm:outerBottom,plateBottomMm:plateBottom,bridgeTopMm:top,bridgeDeadUpperKg,oneSharedPostDemandUpperN:onePostN,memberChecks:checks,necessaryMemberComparisons:checks.every(c=>c.necessary),renewal,innerGirderRenewal,necessaryRenewalGeometry:renewal.every(p=>p.necessaryGeometricSweeps)&&(!innerGirderRenewal||innerGirderRenewal.necessaryGeometricSweeps),normalFootWrenchBounds:[...sharedPostUpdates.map(p=>({footId:p.footId,xyMm:p.xyMm,maximumCompressionN:onePostN,MxBoundsNm:[-onePostN*maxYLever/1000,onePostN*maxYLever/1000]as const,MyBoundsNm:[-onePostN*westLever/1000,onePostN*bridgeLever/1000]as const,minimumRestoringGravityCreditedN:0,actual95PercentFootContactPeakAndNoAnchorAccepted:false})),...externalPostUpdates.map(p=>({footId:p.footId,xyMm:p.xyMm,maximumCompressionN:onePostN,MxBoundsNm:[-onePostN*maxYLever/1000,onePostN*maxYLever/1000]as const,MyBoundsNm:[-onePostN*externalLever/1000,0]as const,minimumRestoringGravityCreditedN:0,actual95PercentFootContactPeakAndNoAnchorAccepted:false}))],normalReactionBounds:{oneFactoredWheelN:i.wheelN,walkingGOnceN:i.walkingDeadAtOneNodeN,allBridgeDeadUpperKg:bridgeDeadUpperKg,ownSharedPostAndFootUpperN:sharedOwnUpperN,onePostMaximumN:onePostN,sharedPostCeilingN:c.sharedPostDesignCeilingN,segmentedSimplySupportedInnerSpans:!continuous,twoEndSimplySupportedInnerMember:continuous,actualCollectedCorbelLoads:continuous?null:i.collectedCorbelLoads??null,signedDeadCaseLedgerApplied:continuous,maximumCollectedDeadAtEitherEndN:Math.max(...deadEndUpper),maximumAbsoluteCollectedDeadN,wheelWithinOuterSupports:true,normalMinimumReactionN:normalEndReactionLower?Math.min(...normalEndReactionLower.normalMinimumFootResultantsN):0,positiveVerticalDoesNotProveFullFootContactOrNoAnchor:true,negativeReactionNotHiddenByUpperDeadMass:true},stock:{innerGirderMinimumWallMm:innerWall,innerGirderMaximumWallForGUpperMm:maximumInnerWall,girderMinimumWallMm:gt,girderMaximumWallForGUpperMm:c.maximumGirderWallMm,sealedOuterBoxStillUsedForWater:true,actualDeliveredStockAccepted:false},retired:{insideBridgePosts:2,insideBridgeFeet:2,XBridgeRails:3,quarterTurnRenewal:true},actualExternalReceiversLateralTiesBoltToolContactAndWholeHouseAccepted:false}
}
