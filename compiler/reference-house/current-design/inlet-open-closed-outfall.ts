type Point=readonly number[]
const finitePoint=(p:Point)=>Array.isArray(p)&&p.length===3&&p.every(Number.isFinite)
const close=(a:number,b:number)=>Math.abs(a-b)<=1e-7*Math.max(1,Math.abs(a),Math.abs(b))
export type OpenClosedOutfallInput={id:string;maximumLmin:number;mouthXYZMm:Point;closedClearCornersMm:readonly Point[];openChuteClearWidthMm:number;openChuteSlopeRatio:number;indoorCoverUndersideMm:number;settingEachMm:number;receiverWaterMm:number;outletState:'one-surviving-free-outlet'|'blocked'|'high-or-submerged'}

/** Standard-step on the supercritical branch. Explicit inlet depth is useful
 * for the independent uniform-normal-flow oracle; actual route admission
 * below always uses its critical reservoir entry, coherent steep bed and
 * independently free exterior receiver. No critical-depth-only roof credit.
 */
export function supercriticalOutfallProfile(i:{qLmin:number;effectiveWidthMm:number;lengthMm:number;slope:number;inletDepthMm:number;stationsMm:readonly number[];steps:number}){
 if(![i.qLmin,i.effectiveWidthMm,i.lengthMm,i.slope,i.inletDepthMm,i.steps,...i.stationsMm].every(Number.isFinite)||Math.min(i.qLmin,i.effectiveWidthMm,i.lengthMm,i.slope,i.inletDepthMm)<=0||!Number.isInteger(i.steps)||i.steps<2||i.stationsMm.some(s=>s<0||s>i.lengthMm))throw Error('Unsupported supercritical outfall profile domain')
 const q=i.qLmin/60000,b=i.effectiveWidthMm/1000,g=9.81,n=.015,yc=Math.cbrt(q*q/(g*b*b)),
  energy=(y:number)=>y+(q/(b*y))**2/(2*g),sf=(y:number)=>{const a=b*y,r=a/(b+2*y);return n*n*(q/a)**2/r**(4/3)},
  unsupported=(reason:string)=>({state:'unsupported-supercritical-profile' as const,reason,points:[] as {sMm:number;depthMm:number;froude:number}[],criticalDepthMm:yc*1000,normalDepthMm:null as number|null})
 if(i.slope<=sf(yc)*(1+1e-12))return unsupported('bed-not-strictly-steep-relative-to-critical-friction')
 let low=yc*1e-6,high=yc
 for(let k=0;k<80;k++){const mid=(low+high)/2;if(sf(mid)>i.slope)low=mid;else high=mid}
 const yn=(low+high)/2,start=i.inletDepthMm/1000
 if(start>yc*(1+1e-10)||start<yn*(1-1e-10))return unsupported('inlet-depth-not-on-normal-to-critical-supercritical-branch')
 const stations=[...new Set([0,i.lengthMm,...i.stationsMm,...Array.from({length:i.steps+1},(_,k)=>i.lengthMm*k/i.steps)])].sort((a,b)=>a-b),points=[{sMm:0,depthMm:start*1000,froude:q/(b*start)/Math.sqrt(g*start)}]
 let y=start
 for(let k=1;k<stations.length;k++){
  const dx=(stations[k]-stations[k-1])/1000,rhs=energy(y)+i.slope*dx-sf(y)*dx/2,
   residual=(depth:number)=>energy(depth)+sf(depth)*dx/2-rhs
  let lo=yc*1e-6,hi=yc
  if(residual(lo)<=0||residual(hi)>=0)return unsupported('supercritical-energy-root-not-bracketed')
  for(let j=0;j<70;j++){const mid=(lo+hi)/2;if(residual(mid)>0)lo=mid;else hi=mid}
  const next=(lo+hi)/2
  if(next>y+1e-10||next<yn-1e-10||next>=yc*(1-1e-12))return unsupported('normal-bound-or-monotone-supercritical-branch-lost')
  y=next;points.push({sMm:stations[k],depthMm:y*1000,froude:q/(b*y)/Math.sqrt(g*y)})
 }
 return{state:'resolved-supercritical-profile' as const,reason:null,points,criticalDepthMm:yc*1000,normalDepthMm:yn*1000}
}

/** Exact current pan mouth → open chute → actual closed copper roof. Both
 * source axes are supported by the ordered eight-corner prism exported by
 * inletClosedOutfall; arbitrary or mismatched geometry is unsupported.
 */
export function inletOpenClosedOutfall(i:OpenClosedOutfallInput){
 if(!i.id||!Number.isFinite(i.maximumLmin)||i.maximumLmin<=0||!finitePoint(i.mouthXYZMm)||i.closedClearCornersMm.length!==8||!i.closedClearCornersMm.every(finitePoint)||![i.openChuteClearWidthMm,i.openChuteSlopeRatio,i.indoorCoverUndersideMm,i.settingEachMm,i.receiverWaterMm].every(Number.isFinite)||i.settingEachMm<10||i.openChuteSlopeRatio<=0||!['one-surviving-free-outlet','blocked','high-or-submerged'].includes(i.outletState))throw Error('Unsupported actual open/closed outfall input')
 const common={schema:'had-open-closed-outfall/1',id:i.id,sourceGeometry:'Current computed pan mouth and eight-corner closed body; no historical result input.',maximumLmin:i.maximumLmin,selected:false,actualMouthJetDebrisRoughnessAndSiteQualified:false,actualWalkingCoverAndVentilationQualified:false,velocityHeadCoefficientComparison:1,rateScope:'Declared steady source/adverse comparison; not an actual stored-release peak.',methodReferences:['https://www.hec.usace.army.mil/confluence/rasdocs/ras1dtechref/7.0/theoretical-basis-for-one-dimensional-and-two-dimensional-hydrodynamic-calculations/1d-steady-flow-water-surface-profiles/equations-for-basic-profile-calculations','https://www.hec.usace.army.mil/confluence/rasdocs/ras1dtechref/6.1/theoretical-basis-for-one-dimensional-and-two-dimensional-hydrodynamic-calculations/1d-steady-flow-water-surface-profiles/friction-loss-evaluation']},
  unsupported=(reason:string)=>({...common,state:'unsupported-actual-route' as const,reason,necessaryActualFreeSurfaceScreen:false,geometry:null,refinements:[],convergenceChangeMm:null,minimumClosedRoofAirReserveMm:null,minimumIndoorCoverAirReserveMm:null,requiredReservoirStageMm:null})
 const [a,b,c,d,aa,bb,cc,dd]=i.closedClearCornersMm,
  width=Math.hypot(b[0]-a[0],b[1]-a[1]),closedLength=Math.hypot(d[0]-a[0],d[1]-a[1]),height=aa[2]-a[2],
  start=[(a[0]+b[0])/2,(a[1]+b[1])/2,a[2]],end=[(c[0]+d[0])/2,(c[1]+d[1])/2,d[2]]
 if(width<=0||closedLength<=0||height<=47||!close(a[2],b[2])||!close(c[2],d[2])||!close((b[0]-a[0])*(d[0]-a[0])+(b[1]-a[1])*(d[1]-a[1]),0)||!close(c[0],b[0]+d[0]-a[0])||!close(c[1],b[1]+d[1]-a[1])||![a,b,c,d].every((p,k)=>{const up=[aa,bb,cc,dd][k];return close(up[0],p[0])&&close(up[1],p[1])&&close(up[2]-p[2],height)}))return unsupported('closed-body-not-the-current-constant-height-rectangular-prism')
 const axis=[(end[0]-start[0])/closedLength,(end[1]-start[1])/closedLength],offset=start.map((v,k)=>v-i.mouthXYZMm[k]),openLength=offset[0]*axis[0]+offset[1]*axis[1],slope=(start[2]-end[2])/closedLength
 if(openLength<=0||slope<=0||!close(offset[0],openLength*axis[0])||!close(offset[1],openLength*axis[1])||!close(i.mouthXYZMm[2]-start[2],openLength*slope)||!close(width,i.openChuteClearWidthMm)||!close(slope,1/i.openChuteSlopeRatio))return unsupported('pan-mouth-open-chute-and-closed-roof-do-not-join-exactly')
 const length=openLength+closedLength,q=i.maximumLmin/60000,effectiveWidth=width/2/1000,g=9.81,yc=Math.cbrt(q*q/(g*effectiveWidth**2)),
  freeDrop=end[2]-i.settingEachMm-i.receiverWaterMm-25,requiredReservoir=i.mouthXYZMm[2]+32+2250*yc+i.settingEachMm,
  geometry={mouthXYZMm:[...i.mouthXYZMm],closedRoofStartXYZMm:start,terminalXYZMm:end,openLengthMm:openLength,closedLengthMm:closedLength,totalLengthMm:length,clearWidthMm:width,survivingWidthMm:width/2,clearHeightMm:height,actualBedSlope:slope,bedDepositMm:32,airAllowanceMm:15,entranceKComparison:1.5,manningNComparison:.015,freeDropReserveMm:freeDrop,outletWholeSettingMm:i.settingEachMm}
 if(i.outletState!=='one-surviving-free-outlet'||freeDrop<0)return{...unsupported('exterior-receiver-is-blocked-high-submerged-or-not-independently-free'),geometry}
 const refinements=[32,64,128].map(steps=>{
  const profile=supercriticalOutfallProfile({qLmin:i.maximumLmin,effectiveWidthMm:width/2,lengthMm:length,slope,inletDepthMm:yc*1000,stationsMm:[openLength],steps})
  if(profile.state!=='resolved-supercritical-profile')return{steps,profile,minimumClosedRoofAirReserveMm:null,maximumIndoorWaterMm:null,terminalDepthMm:null}
  const closed=profile.points.filter(p=>p.sMm>=openLength-1e-9),indoor=profile.points.filter(p=>p.sMm<=openLength+1e-9),
   roofReserve=Math.min(...closed.map(p=>height-32-p.depthMm-15)),indoorWater=Math.max(requiredReservoir,...indoor.map(p=>i.mouthXYZMm[2]-slope*p.sMm+32+p.depthMm+i.settingEachMm))
  return{steps,profile,minimumClosedRoofAirReserveMm:roofReserve,maximumIndoorWaterMm:indoorWater,terminalDepthMm:profile.points.at(-1)!.depthMm}
 }),last=refinements[2],diff=(a:typeof last,b:typeof last)=>a.minimumClosedRoofAirReserveMm===null||b.minimumClosedRoofAirReserveMm===null?null:Math.max(Math.abs(a.minimumClosedRoofAirReserveMm-b.minimumClosedRoofAirReserveMm),Math.abs(a.terminalDepthMm!-b.terminalDepthMm!),Math.abs(a.maximumIndoorWaterMm!-b.maximumIndoorWaterMm!)),coarse=diff(refinements[1],refinements[0]),fine=diff(last,refinements[1]),
  converged=refinements.every(r=>r.profile.state==='resolved-supercritical-profile')&&coarse!==null&&fine!==null&&coarse<=.04&&fine<=.01&&fine<=coarse+1e-9,
  coverReserve=last.maximumIndoorWaterMm===null?null:i.indoorCoverUndersideMm-i.settingEachMm-15-last.maximumIndoorWaterMm,
  necessary=converged&&last.minimumClosedRoofAirReserveMm!==null&&last.minimumClosedRoofAirReserveMm>=0&&coverReserve!==null&&coverReserve>=0
 return{...common,state:converged?'actual-route-free-surface-comparison' as const:'unsupported-actual-route' as const,reason:converged?null:'strict-supercritical-profile-or-frozen-convergence-criteria-failed',geometry,refinements,coarseConvergenceChangeMm:coarse,coarseConvergenceToleranceMm:.04,convergenceChangeMm:fine,convergenceToleranceMm:.01,minimumClosedRoofAirReserveMm:converged?last.minimumClosedRoofAirReserveMm:null,minimumIndoorCoverAirReserveMm:converged?coverReserve:null,requiredReservoirStageMm:requiredReservoir,necessaryActualFreeSurfaceScreen:necessary,uniformPoolAtOpenMouthBelowClosedHeightIsRequired:false,pressureOrSubmergedFlowCredit:false,wholeArrangementAccepted:false}
}
