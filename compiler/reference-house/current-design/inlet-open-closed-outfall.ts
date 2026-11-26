type Point=readonly number[]
const finitePoint=(p:Point)=>Array.isArray(p)&&p.length===3&&[...p].every(Number.isFinite)
const close=(a:number,b:number)=>Math.abs(a-b)<=1e-7*Math.max(1,Math.abs(a),Math.abs(b))
export type OpenClosedOutfallInput={id:string;maximumLmin:number;mouthXYZMm:Point;closedClearCornersMm:readonly Point[];openChuteClearWidthMm:number;openChuteSlopeRatio:number;indoorCoverUndersideMm:number;settingEachMm:number;receiverWaterMm:number;outletState:'one-surviving-free-outlet'|'blocked'|'high-or-submerged'}

/** Standard-step on the supercritical branch. Explicit inlet depth is useful
 * for the independent uniform-normal-flow oracle; actual route admission
 * below always uses its critical reservoir entry, coherent steep bed and
 * independently free exterior receiver. No critical-depth-only roof credit.
 */
export function supercriticalOutfallProfile(i:{qLmin:number;effectiveWidthMm:number;lengthMm:number;slope:number;inletDepthMm:number;stationsMm:readonly number[];steps:number}){
 if(!Array.isArray(i.stationsMm)||![i.qLmin,i.effectiveWidthMm,i.lengthMm,i.slope,i.inletDepthMm,i.steps,...i.stationsMm].every(Number.isFinite)||Math.min(i.qLmin,i.effectiveWidthMm,i.lengthMm,i.slope,i.inletDepthMm)<=0||!Number.isInteger(i.steps)||i.steps<2||i.steps>4096||i.stationsMm.length>4096||i.stationsMm.some(s=>s<0||s>i.lengthMm))throw Error('Unsupported supercritical outfall profile domain')
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

/** Inspection sections derived from the same resolved physical routes. */
export function drawOpenClosedOutfallProfiles(rows:readonly {label:string;profile:ReturnType<typeof inletOpenClosedOutfall>}[]){
 const escape=(s:string)=>s.replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]!)),height=200+rows.length*290
 const sections=rows.map(({label,profile:r},k)=>{
  const top=170+k*290,text=(x:number,y:number,s:string,size=17)=>`<text x="${x}" y="${y}" font-size="${size}">${escape(s)}</text>`
  if(!r.geometry||r.state!=='actual-route-free-surface-comparison')return text(40,top,label+': unsupported; no historical profile substituted.')
  const g=r.geometry,last=r.refinements[2].profile.points,cover=g.indoorCoverUndersideMm,
   min=g.terminalXYZMm[2]-20,max=cover+20,x=(s:number)=>80+1040*s/g.totalLengthMm,y=(z:number)=>top+170-150*(z-min)/(max-min),
   bed=(s:number)=>g.mouthXYZMm[2]-g.actualBedSlope*s,
   pts=last.map(p=>`${x(p.sMm)},${y(bed(p.sMm)+32+p.depthMm)}`).join(' '),
   line=(x1:number,z1:number,x2:number,z2:number,color:string,dash='')=>`<line x1="${x(x1)}" y1="${y(z1)}" x2="${x(x2)}" y2="${y(z2)}" stroke="${color}" stroke-width="2"${dash?' stroke-dasharray="'+dash+'"':''}/>`
  return text(40,top-15,`${label} · ${r.maximumLmin.toFixed(3)} L/min`,21)
   +line(0,bed(0),g.totalLengthMm,bed(g.totalLengthMm),'#746a58')
   +line(g.openLengthMm,bed(g.openLengthMm)+g.clearHeightMm,g.totalLengthMm,bed(g.totalLengthMm)+g.clearHeightMm,'#8b5745')
   +line(0,cover,g.openLengthMm,cover,'#8b5745','6 4')
   +`<polyline points="${pts}" fill="none" stroke="#276c89" stroke-width="3"/>`
   +line(0,r.requiredReservoirStageMm!,0,r.requiredReservoirStageMm!-25,'#276c89')
   +text(80,top+200,'Open pan / chute')+text(x(g.openLengthMm)+15,top+200,'Roofed outlet starts '+g.openLengthMm.toFixed(0)+' mm downstream')
   +text(80,top+228,`Minimum roof air reserve ${r.minimumClosedRoofAirReserveMm!.toFixed(2)} mm; indoor cover reserve ${r.minimumIndoorCoverAirReserveMm!.toFixed(2)} mm. One outlet lost; half surviving width.`)
 })
 return`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}"><rect width="1200" height="${height}" fill="#f5f1e6"/><g font-family="Arial,sans-serif" fill="#29271f"><text x="40" y="42" font-size="27">Separate Utility and Plant · actual outfall sections</text><text x="40" y="75" font-size="17">Blue: free surface. Brown: bed / roof. Reservoir stage and downstream roof are different stations.</text><text x="40" y="100" font-size="17">32 mm deposit and 15 mm air retained. Steady comparison only; stores, site, support and installation remain unqualified.</text>${sections.join('')}</g></svg>`
}

/** Exact current pan mouth → open chute → actual closed copper roof. Both
 * source axes are supported by the ordered eight-corner prism exported by
 * inletClosedOutfall; arbitrary or mismatched geometry is unsupported.
 */
export function inletOpenClosedOutfall(i:OpenClosedOutfallInput){
 if(!i.id||!Number.isFinite(i.maximumLmin)||i.maximumLmin<=0||!finitePoint(i.mouthXYZMm)||!Array.isArray(i.closedClearCornersMm)||i.closedClearCornersMm.length!==8||![...i.closedClearCornersMm].every(finitePoint)||![i.openChuteClearWidthMm,i.openChuteSlopeRatio,i.indoorCoverUndersideMm,i.settingEachMm,i.receiverWaterMm].every(Number.isFinite)||i.settingEachMm<10||i.openChuteSlopeRatio<=0||!['one-surviving-free-outlet','blocked','high-or-submerged'].includes(i.outletState))throw Error('Unsupported actual open/closed outfall input')
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
  geometry={mouthXYZMm:[...i.mouthXYZMm],closedRoofStartXYZMm:start,terminalXYZMm:end,openLengthMm:openLength,closedLengthMm:closedLength,totalLengthMm:length,clearWidthMm:width,survivingWidthMm:width/2,clearHeightMm:height,actualBedSlope:slope,bedDepositMm:32,airAllowanceMm:15,entranceKComparison:1.5,manningNComparison:.015,freeDropReserveMm:freeDrop,outletWholeSettingMm:i.settingEachMm,indoorCoverUndersideMm:i.indoorCoverUndersideMm}
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
