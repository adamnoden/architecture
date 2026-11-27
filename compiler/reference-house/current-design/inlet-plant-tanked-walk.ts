import {sha256SemanticFingerprint} from '../../core/identity.js'
import {inletRoomPocket,plantUnfacedF2025} from './inlet-room-pocket.js'
import {derivePostRowBridge,derivePostRowGridAxes,type PostRowBridgeControl,type PostRowBridgeInput} from './inlet-plant-post-row-bridge.js'
import {plantAppliancePlatform,type AppliancePlatformChoice,type AppliancePlatformSource} from './inlet-plant-appliance-platform.js'
type B=readonly[number,number,number,number,number,number]
type P=readonly[number,number,number,number]
type Section=readonly[number,number,number]
export type PlantWalkControl={
 appliancePlatform?:(AppliancePlatformChoice&{perimeterInsetMm:number;postColumnRelocation:{sourceColumnIndex:number;targetXMm:number};bufferFootPlanMm:readonly[number,number];loadedNodeBlockLWtMm:Section;loadedPadBlankUpperMm:number;cutEdgeRimMm:number;additionalCutPanelHardwareKg:number;railPocketSideClearanceMm:number});schema:string;id:string;walkingRiseAboveHouseFflMm:number;bridgeAboveWalkingMm:number
 material:{densityKgM3:number;elasticModulusMPa:number;allowableComparisonMPa:number;thermalExpansionPerK?:number}
 grating:{bearingBarHeightMm:number;bearingBarThicknessMm:number;bearingBarPitchMm:number;crossBarHeightMm:number;crossBarThicknessMm:number;crossBarPitchMm:number;maximumBearingSpanMm:number;maximumPanelXMm:number;maximumPanelYMm:number;rimHeightMm:number;rimThicknessMm:number;maximumCompletePanelKg:number;hardwareBudgetEachKg:number;panelJointGapMm:number;maximumRelativeSeatErrorMm?:number;locatingPinDiameterMm?:number;locatingHoleMaximumMm?:number;locatingEngagementMm?:number;maximumFactoryLocatingPositionErrorMm?:number;maximumUniformTemperatureExcursionK?:number}
 walkingFrame:{beamSectionKind?:'solid'|'rhs';maximumRemovableBeamSegmentKg?:number;headPlateLWtMm?:Section;beamSectionWHtMm:Section;minimumBeamIMm4:number;maximumBeamSpanMm:number;postSectionWHtMm:Section;footPadSideMm:number;footPadThicknessMm:number;maximumSinglePostDesignN:number}
 bridge:{topology?:'outer-grid-post-row';postRow?:PostRowBridgeControl['postRow'];thicknessMm:number;pieceCount:number;railYMm:readonly number[];railSectionWHtMm:Section;minimumRailIMm4:number;maximumRailDeflectionMm:number;crossBeamSectionWHtMm:Section;crossBeamSupportYMm:readonly[number,number];insideRailSeatXMm:number;outsideRailSeatXMm:number}
}
export type PlantWalkApparatus={platformSource?:AppliancePlatformSource;id:string;source:{path:string;gitBlob:string;objectPath:string};homePlanMm:P;bodyBottomAbsoluteMm:number;bodyHeightMm:number;normalFilledMassUpperKg:number;requiredPanelLiftMm:number}
export type PlantPanCompressionSupport={floorCase:ReturnType<typeof inletRoomPocket>;panCells:readonly{id:string;cornersMm:readonly(readonly number[])[]}[];panInternalStepFaces:readonly{id:string;cornersMm:readonly(readonly number[])[];normal:readonly number[]}[];panMetalMm:number;panDensityKgM3:number;design:{minimumMachinedFootThicknessMm:number;stockThicknessMm:number;compressiveWorkingFactor:number;minimumEffectiveContactFraction:number}}
type Input={bridgeRenewalContext?:{externalRestPlanMm:P;door:PostRowBridgeInput['door'];obstacles:NonNullable<PostRowBridgeInput['obstacles']>};compressionSupport?:PlantPanCompressionSupport;apparatus?:readonly PlantWalkApparatus[];choice:PlantWalkControl;roomPlanMm:P;houseFflMm:number;initialWaterMm:number;maximumWaterMm:number;wheelN:number;panMinimumMm:number;panMaximumMm:number;bridgeInnerXMm:number;bridgeOuterXMm:number;bridgePlateYMm:readonly[number,number];outfallRoofMaximumMm:number;sourceRoofAtExternalBeamMm?:number;settingEachMm?:number}
type Part={id:string;kind:string;boxMm:B;metalVolumeMm3:number;displacementOuterBoxRequired:boolean;installedAcceptance:false;compressionDesignN?:number;compressionMomentBoundsNm?:{Mx:readonly[number,number];My:readonly[number,number]};planPolygonMm?:readonly(readonly[number,number])[];subtractBoxesMm?:readonly B[];subtractPlanPrisms?:readonly{polygonMm:readonly(readonly[number,number])[];zMm:number;heightMm:number}[];axisStartEndXYMm?:readonly[readonly[number,number],readonly[number,number]];unionAssemblyId?:string}
const volume=(b:B)=>b[3]*b[4]*b[5]
const section=(s:Section,solid=false)=>{const[w,h,t]=s;return solid?{area:w*h,I:w*h**3/12,Z:w*h**2/6}:{area:w*h-(w-2*t)*(h-2*t),I:(w*h**3-(w-2*t)*(h-2*t)**3)/12,Z:(w*h**3-(w-2*t)*(h-2*t)**3)/(6*h)}}
const finite=(a:readonly number[])=>a.every(Number.isFinite)
const between=(a:number,b:number,z:number,h:number)=>Math.max(0,Math.min(b,z+h)-Math.max(a,z))
const clippedVolume=(b:B,r:P,a:number,z:number)=>Math.max(0,Math.min(b[0]+b[3],r[0]+r[2])-Math.max(b[0],r[0]))*Math.max(0,Math.min(b[1]+b[4],r[1]+r[3])-Math.max(b[1],r[1]))*between(a,z,b[2],b[5])
const maxGap=(s:readonly number[])=>Math.max(...s.slice(1).map((v,k)=>v-s[k]))
/** Exact rectangular cut stock, after applying the same fabrication clearance
 * to EVERY excluded pickup/deck/perimeter region. No filled polygon bounding
 * box is accepted as a substitute for a nonrectangular exclusion. */
export function plantGrateRimOutsideExclusions(i:{planMinMaxMm:readonly[number,number,number,number];excludedPlanMinMaxMm:readonly(readonly[number,number,number,number])[];clearanceMm:number}){
 type R=readonly[number,number,number,number]
 const valid=(p:R)=>p.every(Number.isFinite)&&p[2]>p[0]&&p[3]>p[1]
 if(!valid(i.planMinMaxMm)||!Number.isFinite(i.clearanceMm)||i.clearanceMm<0||i.excludedPlanMinMaxMm.some(p=>!valid(p)))throw Error('Actual positive rectangular rim and true excluded plans required')
 let pieces:R[]=[i.planMinMaxMm]
 for(const q of i.excludedPlanMinMaxMm){
  const e=[q[0]-i.clearanceMm,q[1]-i.clearanceMm,q[2]+i.clearanceMm,q[3]+i.clearanceMm]as const,next:R[]=[]
  for(const p of pieces){
   const a=Math.max(p[0],e[0]),b=Math.max(p[1],e[1]),z=Math.min(p[2],e[2]),w=Math.min(p[3],e[3])
   if(z<=a||w<=b){next.push(p);continue}
   if(p[1]<b)next.push([p[0],p[1],p[2],b])
   if(w<p[3])next.push([p[0],w,p[2],p[3]])
   if(p[0]<a)next.push([p[0],b,a,w])
   if(z<p[2])next.push([z,b,p[2],w])
  }
  pieces=next
 }
 return pieces
}
/** Actual proposed steel geometry and conservative water displacement.
 * RHS outer boxes count their entire sealed void as displaced water. Overlap
 * of cross/bearing bars is subtracted exactly; joined hardware/bridge overlaps
 * otherwise remain counted twice, conservatively REDUCING available storage.
 * A member comparison does not admit its receiver, weld, foot or installation. */
export function plantTankedWalkingSurface(i:Input){
 const c=i.choice,g=c?.grating,f=c?.walkingFrame,b=c?.bridge,m=c?.material,s=i.settingEachMm??10,two=2*s,r=i.roomPlanMm
 if(c?.schema!=='had-plant-tanked-walk/1'||!c.id||!g||!f||!b||!m||!Array.isArray(r)||r.length!==4||!finite([...r,i.houseFflMm,i.initialWaterMm,i.maximumWaterMm,i.wheelN,i.panMinimumMm,i.panMaximumMm,i.bridgeInnerXMm,i.bridgeOuterXMm,i.outfallRoofMaximumMm,s,c.walkingRiseAboveHouseFflMm,c.bridgeAboveWalkingMm,f.minimumBeamIMm4,f.maximumBeamSpanMm,f.footPadSideMm,f.footPadThicknessMm,f.maximumSinglePostDesignN,b.thicknessMm,b.pieceCount,b.minimumRailIMm4,b.maximumRailDeflectionMm,...Object.values(g),m.densityKgM3,m.elasticModulusMPa,m.allowableComparisonMPa,...i.bridgePlateYMm,...f.beamSectionWHtMm,...f.postSectionWHtMm,...b.railSectionWHtMm,...b.crossBeamSectionWHtMm,...b.crossBeamSupportYMm,b.insideRailSeatXMm,b.outsideRailSeatXMm])
  ||Math.min(r[2],r[3],i.wheelN,m.densityKgM3,m.elasticModulusMPa,m.allowableComparisonMPa)<=0||s<10||(i.sourceRoofAtExternalBeamMm!==undefined&&!Number.isFinite(i.sourceRoofAtExternalBeamMm))||!Number.isInteger(b.pieceCount)||b.pieceCount<1||f.minimumBeamIMm4<=0||b.minimumRailIMm4<=0||f.maximumSinglePostDesignN<i.wheelN||i.panMinimumMm>i.panMaximumMm||i.panMaximumMm>=i.initialWaterMm||i.maximumWaterMm<=i.initialWaterMm||g.panelJointGapMm<=0||g.rimHeightMm!==g.bearingBarHeightMm||g.crossBarHeightMm>g.bearingBarHeightMm||g.bearingBarPitchMm<=g.bearingBarThicknessMm||g.crossBarPitchMm<=g.crossBarThicknessMm||g.maximumPanelYMm>g.maximumBearingSpanMm||b.railYMm.length!==3||b.railYMm.some((v,k)=>!Number.isFinite(v)||k>0&&v<=b.railYMm[k-1])||b.crossBeamSupportYMm[1]<=b.crossBeamSupportYMm[0]||b.outsideRailSeatXMm<=b.insideRailSeatXMm||i.bridgeOuterXMm<=i.bridgeInnerXMm
  ||[f.postSectionWHtMm,b.railSectionWHtMm,b.crossBeamSectionWHtMm].some(([w,h,t])=>Math.min(w,h,t)<=0||2*t>=Math.min(w,h))||Math.min(f.beamSectionWHtMm[0],f.beamSectionWHtMm[1])<=0||!['solid','rhs',undefined].includes(f.beamSectionKind)||f.beamSectionKind!=='solid'&&(f.beamSectionWHtMm[2]<=0||2*f.beamSectionWHtMm[2]>=Math.min(f.beamSectionWHtMm[0],f.beamSectionWHtMm[1])))throw Error('Actual bounded Plant walk, steel sections, pan levels and receiver geometry required')
 const solid=f.beamSectionKind==='solid',head=f.headPlateLWtMm,cap=solid?head?.[2]??0:0
 if(solid&&(!head||!finite(head)||Math.min(...head)<=0||head[0]<2*s+30||head[1]<f.beamSectionWHtMm[0]||!Number.isFinite(f.maximumRemovableBeamSegmentKg)||f.maximumRemovableBeamSegmentKg!<=0))throw Error('Solid removable walking rails require real head plates and a complete segment mass ceiling')
 const parts:Part[]=[],checks:{id:string;quantity:string;value:number|null;limit:number;necessary:boolean}[]=[],add=(id:string,quantity:string,value:number|null,limit:number)=>checks.push({id,quantity,value,limit,necessary:value!==null&&Number.isFinite(value)&&value<=limit+1e-8}),
  make=(id:string,kind:string,boxMm:B,metalVolumeMm3=volume(boxMm),sealed=true)=>{const p:Part={id,kind,boxMm,metalVolumeMm3,displacementOuterBoxRequired:sealed,installedAcceptance:false};parts.push(p);return p},
  walk=i.houseFflMm+c.walkingRiseAboveHouseFflMm,top=walk,barBottom=top-g.bearingBarHeightMm,beamTop=barBottom,beamBottom=beamTop-f.beamSectionWHtMm[1],
  nx=Math.ceil(r[2]/g.maximumPanelXMm),ny=Math.ceil(r[3]/g.maximumPanelYMm),px=(r[2]-(nx-1)*g.panelJointGapMm)/nx,py=(r[3]-(ny-1)*g.panelJointGapMm)/ny,
  panels: {id:string;planMm:P;parts:string[];completeMassDesignUpperKg:number;metalMassKg:number;barCount:number;crossBarCount:number;clearBarGapMm:number;crossBarJointOverlapMm3:number;waterJointOverlapMm3:number}[]=[]
 if(nx<1||ny<1||Math.min(px,py)<=2*g.rimThicknessMm+g.bearingBarThicknessMm)throw Error('Grating panels cannot fit actual room')
 let totalJointMm3=0,wetJointMm3=0
 for(let a=0;a<nx;a++)for(let k=0;k<ny;k++){
  const x=r[0]+a*(px+g.panelJointGapMm),y=r[1]+k*(py+g.panelJointGapMm),id='Plant/grate/'+a+'/'+k,local:Part[]=[],rim=g.rimThicknessMm,lx=px-2*rim,ly=py-2*rim,
   nbar=Math.ceil((lx-g.bearingBarThicknessMm)/g.bearingBarPitchMm)+1,pitch=(lx-g.bearingBarThicknessMm)/(nbar-1),nCross=Math.max(1,Math.ceil(ly/g.crossBarPitchMm)-1),crossPitch=ly/(nCross+1)
  const put=(label:string,box:B)=>{const p=make(id+'/'+label,'grate',box);local.push(p)}
  put('west-rim',[x,y,barBottom,rim,py,g.rimHeightMm]);put('east-rim',[x+px-rim,y,barBottom,rim,py,g.rimHeightMm])
  put('south-rim',[x+rim,y,barBottom,lx,rim,g.rimHeightMm]);put('north-rim',[x+rim,y+py-rim,barBottom,lx,rim,g.rimHeightMm])
  for(let q=0;q<nbar;q++)put('bearing/'+q,[x+rim+q*pitch,y+rim,barBottom,g.bearingBarThicknessMm,ly,g.bearingBarHeightMm])
  for(let q=0;q<nCross;q++)put('cross/'+q,[x+rim,y+rim+(q+1)*crossPitch-g.crossBarThicknessMm/2,top-g.crossBarHeightMm,lx,g.crossBarThicknessMm,g.crossBarHeightMm])
  const overlap=nbar*nCross*g.bearingBarThicknessMm*g.crossBarThicknessMm*g.crossBarHeightMm,
   wetOverlap=nbar*nCross*g.bearingBarThicknessMm*g.crossBarThicknessMm*between(i.initialWaterMm,i.maximumWaterMm,top-g.crossBarHeightMm,g.crossBarHeightMm),
   metal=local.reduce((n,p)=>n+p.metalVolumeMm3,0)-overlap,mass=metal/1e9*m.densityKgM3
  totalJointMm3+=overlap;wetJointMm3+=wetOverlap
  panels.push({id,planMm:[x,y,px,py],parts:local.map(p=>p.id),completeMassDesignUpperKg:mass+g.hardwareBudgetEachKg,metalMassKg:mass,barCount:nbar,crossBarCount:nCross,clearBarGapMm:pitch-g.bearingBarThicknessMm,crossBarJointOverlapMm3:overlap,waterJointOverlapMm3:wetOverlap})
  add(id+'/complete-mass','kg',mass+g.hardwareBudgetEachKg,g.maximumCompletePanelKg)
  add(id+'/wheel-cannot-fit-between-bars','mm',pitch-g.bearingBarThicknessMm,25)
 }
 const pad=f.footPadSideMm,post=f.postSectionWHtMm,beam=f.beamSectionWHtMm,perimeterInset=c.appliancePlatform?.perimeterInsetMm??0,
  xs=[r[0]+pad/2+perimeterInset,...Array.from({length:nx-1},(_,k)=>r[0]+(k+1)*px+(k+.5)*g.panelJointGapMm),r[0]+r[2]-pad/2-perimeterInset],
  ys=[r[1]+pad/2+perimeterInset,...Array.from({length:ny-1},(_,k)=>r[1]+(k+1)*py+(k+.5)*g.panelJointGapMm),r[1]+r[3]-pad/2-perimeterInset],
  fBeam=section(beam,solid),fPost=section(post),beamSegments:{id:string;boxMm:B;referenceMetalKg:number;hardwareBudgetKg:number;completeMassDesignUpperKg:number;actualCaptureAndEndRetainersAccepted:false}[]=[]
 if(c.appliancePlatform){if(!Number.isFinite(m.thermalExpansionPerK)||!Number.isFinite(g.maximumUniformTemperatureExcursionK))throw Error('Actual authored steel expansion and temperature range required');const q=c.appliancePlatform.postColumnRelocation;if(!Number.isInteger(q.sourceColumnIndex)||q.sourceColumnIndex<=0||q.sourceColumnIndex>=xs.length-1||!Number.isFinite(q.targetXMm)||q.targetXMm<=xs[q.sourceColumnIndex-1]||q.targetXMm>=xs[q.sourceColumnIndex+1]||!Number.isFinite(perimeterInset)||perimeterInset<25)throw Error('One explicit ordered unified post-column move and real perimeter clearance required');xs[q.sourceColumnIndex]=q.targetXMm}
 if(beamBottom-cap-i.panMaximumMm<=f.footPadThicknessMm)throw Error('Pan/post/grating vertical stack has no direct bearing length')
 if(solid){const cuts=[r[0],...xs.slice(1,-1),r[0]+r[2]]
  for(let y=0;y<ys.length;y++)for(let k=1;k<cuts.length;k++){const x=cuts[k-1]+(k===1?0:g.panelJointGapMm/2),L=cuts[k]-cuts[k-1]-(k===1?0:g.panelJointGapMm/2)-(k===cuts.length-1?0:g.panelJointGapMm/2),p=make('Plant/solid-walk-segment/'+y+'/'+k,'solid-beam',[x,ys[y]-beam[0]/2,beamBottom,L,beam[0],beam[1]],fBeam.area*L),metal=p.metalVolumeMm3/1e9*m.densityKgM3
   beamSegments.push({id:p.id,boxMm:p.boxMm,referenceMetalKg:metal,hardwareBudgetKg:g.hardwareBudgetEachKg,completeMassDesignUpperKg:metal+g.hardwareBudgetEachKg,actualCaptureAndEndRetainersAccepted:false});add(p.id+'/complete-mass','kg',metal+g.hardwareBudgetEachKg,f.maximumRemovableBeamSegmentKg!)}
 }else for(let k=0;k<ys.length;k++)make('Plant/walk-beam/'+k,'RHS-beam',[r[0],ys[k]-beam[0]/2,beamBottom,r[2],beam[0],beam[1]],fBeam.area*r[2])
 for(let x=0;x<xs.length;x++)for(let y=0;y<ys.length;y++){
  // Longest bounding post spans the actual MINIMUM pan; the whole range is
  // retained as a receiver requirement, never silently seated at panMaximum.
  const z=i.panMinimumMm+f.footPadThicknessMm,h=beamBottom-cap-z
  if(solid)make('Plant/head-plate/'+x+'/'+y,'solid-head-plate',[xs[x]-head![0]/2,ys[y]-head![1]/2,beamBottom-cap,head![0],head![1],cap])
  make('Plant/post/'+x+'/'+y,'RHS-post-bound',[xs[x]-post[0]/2,ys[y]-post[1]/2,z,post[0],post[1],h],fPost.area*h)
  make('Plant/foot/'+x+'/'+y,'solid-foot-pad',[xs[x]-pad/2,ys[y]-pad/2,i.panMinimumMm,pad,pad,f.footPadThicknessMm])
 }
 const locatorValues=[g.maximumRelativeSeatErrorMm,g.locatingPinDiameterMm,g.locatingHoleMaximumMm,g.locatingEngagementMm,g.maximumFactoryLocatingPositionErrorMm,g.maximumUniformTemperatureExcursionK,m.thermalExpansionPerK],
  locatorSpecified=locatorValues.every(v=>typeof v==='number'&&Number.isFinite(v)&&v>=0)&&g.locatingPinDiameterMm!>=8&&g.locatingHoleMaximumMm!>=g.locatingPinDiameterMm!&&g.locatingEngagementMm!>=10,
  relativeSeatError=locatorSpecified?g.maximumRelativeSeatErrorMm!:two,radialClearance=locatorSpecified?(g.locatingHoleMaximumMm!-g.locatingPinDiameterMm!)/2:null,
  thermalMovement=locatorSpecified?Math.max(px,py)*m.thermalExpansionPerK!*g.maximumUniformTemperatureExcursionK!:null,
  fitBudget=locatorSpecified?radialClearance!+2*g.maximumFactoryLocatingPositionErrorMm!+thermalMovement!:null,
  minimumSeat=beam[0]/2-g.panelJointGapMm/2-g.rimThicknessMm-relativeSeatError,
  requiredFirstLift=locatorSpecified?g.locatingEngagementMm!+relativeSeatError:null,
  locators=panels.map(p=>{const[x,y,w,h]=p.planMm,nearest=(v:number)=>ys.reduce((a,b)=>Math.abs(b-v)<Math.abs(a-v)?b:a),px1=x+g.rimThicknessMm+g.bearingBarThicknessMm+p.clearBarGapMm/2,px2=x+w-g.rimThicknessMm-g.bearingBarThicknessMm-p.clearBarGapMm/2,py1=Math.max(y+10,nearest(y)),py2=Math.min(y+h-10,nearest(y+h)),L=Math.hypot(px2-px1,py2-py1),positions=[[px1,py1,barBottom],[px2,py2,barBottom]];
   if(locatorSpecified)for(const[k,q]of positions.entries()){const tw=g.locatingPinDiameterMm!+2*g.rimThicknessMm,tl=g.locatingHoleMaximumMm!+2*g.bearingBarThicknessMm;make(p.id+'/locator-tab/'+k,'hardware',[q[0]-tw/2,q[1]-tl/2,q[2],tw,tl,g.rimThicknessMm]);make(p.id+'/locator-stud-envelope/'+k,'hardware',[q[0]-g.locatingPinDiameterMm!/2,q[1]-g.locatingPinDiameterMm!/2,q[2],g.locatingPinDiameterMm!,g.locatingPinDiameterMm!,g.locatingEngagementMm!],Math.PI/4*g.locatingPinDiameterMm!**2*g.locatingEngagementMm!)}
   return{id:p.id+'/matched-locators',positionsMm:positions,longitudinalSlotAxisXYMm:[(px2-px1)/L,(py2-py1)/L],roundPinDiameterMm:g.locatingPinDiameterMm??null,roundHoleMaximumMm:g.locatingHoleMaximumMm??null,secondLongitudinalSlotWHMm:locatorSpecified?[g.locatingHoleMaximumMm!,g.locatingHoleMaximumMm!+2*relativeSeatError]:null,factoryRelativePositionBoundEachMm:g.maximumFactoryLocatingPositionErrorMm??null,engagementMm:g.locatingEngagementMm??null,locateOnlyNotVerticalLoadSupport:true,studWeldsDoNotDrillRHS:true,actualFabricationAndThermalFitAccepted:false}})
 add('Plant/matched-panel-seat-fit','mm',locatorSpecified?fitBudget!:null,relativeSeatError)
 add('Plant/single-bar-end-bearing','MPa',minimumSeat>0?i.wheelN/(minimumSeat*g.bearingBarThicknessMm):null,m.allowableComparisonMPa)
 const bearingSpan=Math.max(maxGap(ys),Math.max(...panels.map(p=>p.planMm[3])))+two,beamSpan=maxGap(xs)+two,
  overhang=Math.max(xs[0]-r[0],r[0]+r[2]-xs.at(-1)!,ys[0]-r[1],r[1]+r[3]-ys.at(-1)!)+two,Ib=g.bearingBarThicknessMm*g.bearingBarHeightMm**3/12,barStress=1.5*i.wheelN*bearingSpan/(g.bearingBarThicknessMm*g.bearingBarHeightMm**2),
  barCantilever=6*i.wheelN*overhang/(g.bearingBarThicknessMm*g.bearingBarHeightMm**2),beamStress=i.wheelN*beamSpan/(4*(f.minimumBeamIMm4/(beam[1]/2))),
  beamDelta=i.wheelN*beamSpan**3/(48*m.elasticModulusMPa*f.minimumBeamIMm4),postLength=beamBottom-cap-i.panMinimumMm-f.footPadThicknessMm
 if(solid){const endSeat=head![0]/2-g.panelJointGapMm/2-two,over=Math.max(0,(head![0]-post[0])/2)+two
  add('Plant/solid-segment-head-seat','MPa',endSeat>0?f.maximumSinglePostDesignN/(endSeat*head![1]):null,m.allowableComparisonMPa)
  add('Plant/head-plate-cantilever','MPa',6*f.maximumSinglePostDesignN*over/(head![1]*cap**2),m.allowableComparisonMPa)
 }
 const meanBarPressure=minimumSeat>0?i.wheelN/(minimumSeat*g.bearingBarThicknessMm):null
 add('Plant/walking-rail-local-face','MPa',solid?0:meanBarPressure===null?null:.75*meanBarPressure*(beam[0]-2*beam[2])**2/beam[2]**2,m.allowableComparisonMPa)
 add('Plant/grate-declared-nominal-span','mm',bearingSpan-two,g.maximumBearingSpanMm)
 add('Plant/frame-declared-nominal-span','mm',beamSpan-two,f.maximumBeamSpanMm)
 add('Plant/grate-single-bearing-bar','MPa',barStress,m.allowableComparisonMPa)
 add('Plant/frame-wall-edge-cantilever','MPa',(i.wheelN+g.hardwareBudgetEachKg*9.81)*overhang/(f.minimumBeamIMm4/(beam[1]/2)),m.allowableComparisonMPa)
 add('Plant/frame-wall-edge-cantilever-deflection','mm',i.wheelN*overhang**3/(3*m.elasticModulusMPa*f.minimumBeamIMm4),2)
 add('Plant/grate-wall-edge-cantilever','MPa',barCantilever,m.allowableComparisonMPa)
 add('Plant/grate-single-bar-deflection','mm',i.wheelN*bearingSpan**3/(48*m.elasticModulusMPa*Ib),2)
 add('Plant/frame-minimum-I-versus-sharp-geometry','mm4',f.minimumBeamIMm4,fBeam.I)
 add('Plant/frame-single-wheel-bending','MPa',beamStress,m.allowableComparisonMPa)
 add('Plant/frame-single-wheel-deflection','mm',beamDelta,2)
 add('Plant/frame-foot-pad-conditional-contact','MPa',3*(f.maximumSinglePostDesignN/pad**2)*((pad-post[0])/2+two)**2/f.footPadThicknessMm**2,m.allowableComparisonMPa)
 add('Plant/frame-post-axial','MPa',f.maximumSinglePostDesignN/fPost.area,m.allowableComparisonMPa)
 add('Plant/frame-post-pinned-Euler','N',f.maximumSinglePostDesignN,Math.PI**2*m.elasticModulusMPa*fPost.I/postLength**2)
 const bridgeTop=walk+c.bridgeAboveWalkingMm,plateBottom=bridgeTop-b.thicknessMm,railTop=plateBottom,railBottom=railTop-b.railSectionWHtMm[1],crossTop=railBottom,crossBottom=crossTop-b.crossBeamSectionWHtMm[1],
  bridgeY=i.bridgePlateYMm,bridgeL=i.bridgeOuterXMm-i.bridgeInnerXMm,
  joint=g.panelJointGapMm,pieceX=(bridgeL-(b.pieceCount-1)*joint)/b.pieceCount,bridgePieces=[]
 if(pieceX<=25||bridgeY[0]>=bridgeY[1])throw Error('Actual bridge strip or load band cannot fit')
 for(let k=0;k<b.pieceCount;k++){
  const p=make('Plant/bridge-piece/'+k,'bridge-plate',[i.bridgeInnerXMm+k*(pieceX+joint),bridgeY[0],plateBottom,pieceX,bridgeY[1]-bridgeY[0],b.thicknessMm]),
   mass=p.metalVolumeMm3/1e9*m.densityKgM3
  bridgePieces.push({id:p.id,boxMm:p.boxMm,referenceSheetKg:mass,completeMassDesignUpperKg:mass+g.hardwareBudgetEachKg,actualCaptureToolsAndRestAccepted:false})
  add(p.id+'/complete-mass','kg',mass+g.hardwareBudgetEachKg,g.maximumCompletePanelKg)
 }
 const railSection=section(b.railSectionWHtMm),crossSection=section(b.crossBeamSectionWHtMm),railSpan=b.outsideRailSeatXMm-b.insideRailSeatXMm,
  railDef=i.wheelN*railSpan**3/(48*m.elasticModulusMPa*b.minimumRailIMm4),crossSpan=b.crossBeamSupportYMm[1]-b.crossBeamSupportYMm[0],
  crossDef=i.wheelN*crossSpan**3/(48*m.elasticModulusMPa*crossSection.I)
 for(let k=0;k<b.railYMm.length;k++)make('Plant/bridge-X-rail/'+k,'bridge-RHS',[b.insideRailSeatXMm,b.railYMm[k]-b.railSectionWHtMm[0]/2,railBottom,railSpan,b.railSectionWHtMm[0],b.railSectionWHtMm[1]],railSection.area*railSpan)
 for(const x of [b.insideRailSeatXMm,b.outsideRailSeatXMm]){
  make('Plant/bridge-cross/'+x,'bridge-RHS',[x-b.crossBeamSectionWHtMm[0]/2,b.crossBeamSupportYMm[0],crossBottom,b.crossBeamSectionWHtMm[0],crossSpan,b.crossBeamSectionWHtMm[1]],crossSection.area*crossSpan)
  for(const y of b.crossBeamSupportYMm){const h=crossBottom-i.panMinimumMm-f.footPadThicknessMm;make('Plant/bridge-post/'+x+'/'+y,'bridge-RHS-post',[x-post[0]/2,y-post[1]/2,i.panMinimumMm+f.footPadThicknessMm,post[0],post[1],h],fPost.area*h);make('Plant/bridge-foot/'+x+'/'+y,'bridge-pad',[x-pad/2,y-pad/2,i.panMinimumMm,pad,pad,f.footPadThicknessMm])}
 }
 const patchStress=(load:number,contactWidth:number,contactLength:number,clearSpan:number,t:number)=>{const peak=2*load/(contactWidth*contactLength),a=Math.min(contactLength/2,clearSpan);return 6*peak*a*(2*clearSpan-a)/(8*t*t)}
 add('Plant/bridge-rail-local-face','MPa',patchStress(i.wheelN,25,b.railSectionWHtMm[0],b.railSectionWHtMm[0]-2*b.railSectionWHtMm[2],b.railSectionWHtMm[2]),m.allowableComparisonMPa)
 add('Plant/bridge-cross-local-face','MPa',patchStress(i.wheelN,b.railSectionWHtMm[0],b.crossBeamSectionWHtMm[0]/2,b.crossBeamSectionWHtMm[0]-2*b.crossBeamSectionWHtMm[2],b.crossBeamSectionWHtMm[2]),m.allowableComparisonMPa)
 add('Plant/bridge-minimum-rail-I','mm4',b.minimumRailIMm4,railSection.I)
 add('Plant/bridge-plate-between-rails','MPa',1.5*i.wheelN*(maxGap(b.railYMm)+two)/(25*b.thicknessMm**2),m.allowableComparisonMPa)
 add('Plant/bridge-X-rail-bending','MPa',i.wheelN*railSpan/(4*(b.minimumRailIMm4/(b.railSectionWHtMm[1]/2))),m.allowableComparisonMPa)
 add('Plant/bridge-X-rail-deflection','mm',railDef,b.maximumRailDeflectionMm)
 add('Plant/bridge-cross-beam-bending','MPa',i.wheelN*crossSpan/(4*crossSection.Z),m.allowableComparisonMPa)
 add('Plant/bridge-cross-beam-deflection','mm',crossDef,2)
 add('Plant/bridge-rail-under-roof','mm',i.outfallRoofMaximumMm+two+railDef,railBottom)
 add('Plant/external-cross-under-roof','mm',(i.sourceRoofAtExternalBeamMm??i.outfallRoofMaximumMm)+two+crossDef,crossBottom)
 // Deadweight is combined with the factored one-wheel action. For hollow
 // members their FULL outer envelope bounds dead mass, independent of an
 // unprocured wall/section certificate. Every dead load below is pessimistically
 // concentrated at its member's worst point; no favourable load sharing.
 const massOuter=(p:Part)=>volume(p.boxMm)/1e9*m.densityKgM3,
  maxPanelKg=Math.max(...panels.map(p=>p.completeMassDesignUpperKg)),
  maxSegmentKg=solid?Math.max(...beamSegments.map(p=>p.completeMassDesignUpperKg)):r[2]*beam[0]*beam[1]/1e9*m.densityKgM3,
  panelBarDeadN=Math.max(...panels.map(p=>{const local=parts.filter(q=>p.parts.includes(q.id)),bar=Math.max(...local.filter(q=>q.id.includes('/bearing/')).map(q=>q.metalVolumeMm3)),cross=local.filter(q=>q.id.includes('/cross/')).reduce((n,q)=>n+q.metalVolumeMm3,0);return((bar+cross)/1e9*m.densityKgM3+g.hardwareBudgetEachKg)*9.81})),
  frameDeadN=(4*maxPanelKg+maxSegmentKg)*9.81,
  bridgePlateKg=bridgePieces.reduce((n,p)=>n+p.completeMassDesignUpperKg,0),
  bridgeRailKg=parts.filter(p=>p.id.includes('bridge-X-rail/')).reduce((n,p)=>n+massOuter(p),0),
  oneRailKg=bridgeRailKg/b.railYMm.length,
  oneCrossKg=Math.max(...parts.filter(p=>p.id.includes('bridge-cross/')).map(massOuter)),
  oneBridgePostKg=Math.max(...parts.filter(p=>p.id.includes('bridge-post/')).map(massOuter)),
  oneBridgeFootKg=Math.max(...parts.filter(p=>p.id.includes('bridge-foot/')).map(massOuter)),
  railCombinedN=i.wheelN+(bridgePlateKg+oneRailKg)*9.81,
  crossCombinedN=i.wheelN+(bridgePlateKg+bridgeRailKg+oneCrossKg)*9.81,
  footCombinedN=i.wheelN+(bridgePlateKg+bridgeRailKg+oneCrossKg/2+oneBridgePostKg+oneBridgeFootKg)*9.81,
  railSettingsSpan=railSpan+two,crossSettingsSpan=crossSpan+two,
  railCombinedDelta=railCombinedN*railSettingsSpan**3/(48*m.elasticModulusMPa*b.minimumRailIMm4),
  crossCombinedDelta=crossCombinedN*crossSettingsSpan**3/(48*m.elasticModulusMPa*crossSection.I),
  bridgePieceN=i.wheelN+Math.max(...bridgePieces.map(p=>p.completeMassDesignUpperKg))*9.81
 add('Plant/grate-bar-wheel-and-dead','MPa',barStress*(i.wheelN+panelBarDeadN)/i.wheelN,m.allowableComparisonMPa)
 add('Plant/grate-edge-wheel-and-dead','MPa',barCantilever*(i.wheelN+panelBarDeadN)/i.wheelN,m.allowableComparisonMPa)
 add('Plant/frame-wheel-and-dead','MPa',beamStress*(i.wheelN+frameDeadN)/i.wheelN,m.allowableComparisonMPa)
 add('Plant/frame-wheel-and-dead-deflection','mm',beamDelta*(i.wheelN+frameDeadN)/i.wheelN,2)
 add('Plant/bridge-plate-wheel-and-dead','MPa',1.5*bridgePieceN*(maxGap(b.railYMm)+two)/(25*b.thicknessMm**2),m.allowableComparisonMPa)
 add('Plant/bridge-rail-wheel-and-dead','MPa',railCombinedN*railSettingsSpan/(4*(b.minimumRailIMm4/(b.railSectionWHtMm[1]/2))),m.allowableComparisonMPa)
 add('Plant/bridge-rail-wheel-and-dead-deflection','mm',railCombinedDelta,b.maximumRailDeflectionMm)
 add('Plant/bridge-cross-wheel-and-dead','MPa',crossCombinedN*crossSettingsSpan/(4*crossSection.Z),m.allowableComparisonMPa)
 add('Plant/bridge-cross-wheel-and-dead-deflection','mm',crossCombinedDelta,2)
 add('Plant/bridge-post-wheel-and-dead','N',footCombinedN,f.maximumSinglePostDesignN)
 add('Plant/bridge-rail-face-wheel-and-dead','MPa',patchStress(bridgePieceN,25,b.railSectionWHtMm[0],b.railSectionWHtMm[0]-2*b.railSectionWHtMm[2],b.railSectionWHtMm[2]),m.allowableComparisonMPa)
 add('Plant/bridge-cross-face-wheel-and-dead','MPa',patchStress(railCombinedN,b.railSectionWHtMm[0],b.crossBeamSectionWHtMm[0]/2,b.crossBeamSectionWHtMm[0]-2*b.crossBeamSectionWHtMm[2],b.crossBeamSectionWHtMm[2]),m.allowableComparisonMPa)
 add('Plant/bridge-rail-roof-wheel-and-dead','mm',i.outfallRoofMaximumMm+two+railCombinedDelta,railBottom)
 add('Plant/external-cross-roof-wheel-and-dead','mm',(i.sourceRoofAtExternalBeamMm??i.outfallRoofMaximumMm)+two+crossCombinedDelta,crossBottom)
 // Actual apparatus are independently seated on four authored compression
 // pedestals. Their plan comes from the captured source, not a nominal catalogue
 // cylinder. Pedestals deliberately have a separate load budget from the walk.
 // The existing rectangular grating remains visible: intersections become REAL
 // cutout/detail failures, never unearned silent deletion of bars or beams.
 const apparatusInterfaces=(c.appliancePlatform?[]:(i.apparatus??[])).map(a=>{
  const ap=a.homePlanMm
  if(!a.id||!a.source?.path||!/^[0-9a-f]{40}$/.test(a.source.gitBlob)||!a.source.objectPath||!finite([...ap,a.bodyBottomAbsoluteMm,a.bodyHeightMm,a.normalFilledMassUpperKg,a.requiredPanelLiftMm])||Math.min(ap[2],ap[3],a.bodyHeightMm,a.normalFilledMassUpperKg,a.requiredPanelLiftMm)<=0||a.bodyBottomAbsoluteMm<walk||ap[0]<r[0]||ap[1]<r[1]||ap[0]+ap[2]>r[0]+r[2]||ap[1]+ap[3]>r[1]+r[3])throw Error('Actual captured apparatus geometry, mass and absolute datum required')
  const side=f.footPadSideMm,padT=f.footPadThicknessMm,capT=30,postWHt=[30,30,3] as const,pv=section(postWHt),maxPostN=f.maximumSinglePostDesignN,
   inset=side/2+two,candidateX=xs.slice(1).map((v,k)=>(v+xs[k])/2).filter(x=>x>=ap[0]+inset&&x<=ap[0]+ap[2]-inset),
   footX=candidateX.length>=2?[candidateX[0],candidateX.at(-1)!]:[],footY=[ap[1]+inset,ap[1]+ap[3]-inset],before=parts.length
  if(footX.length!==2||footY[1]<=footY[0])return{id:a.id,source:a.source,necessarySeparateStandGeometry:false,diagnostics:['PLANT_WALK/apparatus-perimeter-stand-cannot-fit-real-footprint'],actualCompleteSupportAccepted:false}
  for(const x of footX)for(const y of footY){
   const prefix=a.id+'/independent-stand/'+x+'/'+y,z=i.panMinimumMm+padT,h=a.bodyBottomAbsoluteMm-capT-z
   if(h<=0)throw Error('No actual independent apparatus post length')
   make(prefix+'/foot','apparatus-stand-pad',[x-side/2,y-side/2,i.panMinimumMm,side,side,padT])
   make(prefix+'/post','apparatus-RHS-post',[x-15,y-15,z,30,30,h],pv.area*h)
   make(prefix+'/head','apparatus-stand-cap',[x-side/2,y-side/2,a.bodyBottomAbsoluteMm-capT,side,side,capT])
  }
  const members=parts.slice(before),standMassUpperKg=members.reduce((n,p)=>n+volume(p.boxMm)/1e9*m.densityKgM3,0)+4*g.hardwareBudgetEachKg,designOnePostN=(a.normalFilledMassUpperKg+standMassUpperKg)*9.81,
   bearingCorners=footX.flatMap(x=>footY.map(y=>[x,y] as const)),postLength=a.bodyBottomAbsoluteMm-capT-i.panMinimumMm-padT,
   existing=parts.slice(0,before).filter(p=>p.kind!=='grate'&&p.kind!=='hardware'),
   boxGap=(a:B,b:B)=>{const d=[0,1,2].map(k=>Math.max(a[k]-b[k]-b[k+3],b[k]-a[k]-a[k+3]));return d.some(v=>v>0)?Math.hypot(...d.map(v=>Math.max(0,v))):Math.max(...d)},
   frameChecks=members.flatMap(p=>existing.map(q=>({part:p.id,existing:q.id,afterTwoSettingsMm:boxGap(p.boxMm,q.boxMm)-two}))),
   panelCutoutIntersections=panels.flatMap(p=>{const hits=members.filter(q=>p.parts.some(id=>{const bar=parts.find(b=>b.id===id)!;return boxGap(q.boxMm,bar.boxMm)<two}));return hits.length?[{panel:p.id,standParts:hits.map(q=>q.id),memberEndsAndWheelCapacityAfterCutoutAccepted:false}]:[]}),
   liftCases=panels.flatMap(p=>{
    const x=Math.max(p.planMm[0],ap[0]),y=Math.max(p.planMm[1],ap[1]),w=Math.min(p.planMm[0]+p.planMm[2],ap[0]+ap[2])-x,d=Math.min(p.planMm[1]+p.planMm[3],ap[1]+ap[3])-y
    if(w<=0||d<=0)return[]
    const netHead=a.bodyBottomAbsoluteMm-walk-two
    return[{panel:p.id,overlapPlanMm:[x,y,w,d],panelFirstLiftMm:a.requiredPanelLiftMm,bodyHeadReserveAfterTwoSettingsMm:netHead,necessaryInitialLiftClear:netHead>=a.requiredPanelLiftMm,apparatusRemovalRequired:netHead<a.requiredPanelLiftMm,actualTranslationAfterFirstLiftAccepted:false}]
   })
  add(a.id+'/independent-post-demand','N',designOnePostN,maxPostN)
  add(a.id+'/independent-post-axial','MPa',maxPostN/pv.area,m.allowableComparisonMPa)
  add(a.id+'/independent-post-Euler','N',maxPostN,Math.PI**2*m.elasticModulusMPa*pv.I/postLength**2)
  add(a.id+'/independent-head-cap','MPa',6*maxPostN*((side-postWHt[0])/2+two)/(side*capT**2),m.allowableComparisonMPa)
  add(a.id+'/independent-foot-pad','MPa',3*(maxPostN/side**2)*((side-postWHt[0])/2+two)**2/padT**2,m.allowableComparisonMPa)
  return{id:a.id,source:a.source,homePlanMm:ap,bodyBottomAbsoluteMm:a.bodyBottomAbsoluteMm,bodyTopAbsoluteMm:a.bodyBottomAbsoluteMm+a.bodyHeightMm,normalFilledMassUpperKg:a.normalFilledMassUpperKg,standParts:members.map(p=>p.id),standFullSolidMassUpperKg:standMassUpperKg,standHardwareBudgetKg:4*g.hardwareBudgetEachKg,standDesign:{postSectionWHtMm:postWHt,padLWTMm:[side,side,padT],headPlateLWTMm:[side,side,capT],gravityOnlyNoFrictionOrAnchorCredit:true,actualLateralAndUpliftTieAccepted:false},designOnePostN,maximumPostDesignN:maxPostN,allApparatusAndStandDeadAtOnePost:true,standFeetAbsoluteMm:bearingCorners.map(p=>[p[0],p[1],i.panMinimumMm]),actualPanFootContactRangeMm:[i.panMinimumMm,i.panMaximumMm],footprintToleranceInsetMm:inset,actualPerFootHeightNotAssumed:true,frameChecks,panelCutoutIntersections,liftCases,
   necessarySeparateStandGeometry:frameChecks.every(p=>p.afterTwoSettingsMm>=0),
   actualCutoutsAndReframedBarEndsAccepted:false,actualFactoryFootAndStandConnectionAccepted:false,actualRCPanSandwichBearingAndThermalBridgeAccepted:false,actualCompleteSupportAccepted:false,
   renewal:'Isolate, cool, drain and capture the apparatus before lifting hidden floor panels. Remove stand members independently only with apparatus already carried on a qualified external support. Walking frame does not carry apparatus; no live vessel or buffer on grating.',
   diagnostics:[...(frameChecks.some(p=>p.afterTwoSettingsMm<0)?['PLANT_WALK/apparatus-stand-hits-walking-frame']:[]),...(panelCutoutIntersections.length?['PLANT_WALK/actual-apparatus-pedestal-cutouts-and-bar-end-support-required']:[]),'PLANT_WALK/apparatus-factory-foot-stand-RC-and-thermal-receivers-unqualified']}
 })
 const blockedPanelIds=[...new Set(apparatusInterfaces.flatMap(a=>'liftCases'in a?(a.liftCases??[]).filter(p=>p.apparatusRemovalRequired).map(p=>p.panel):[]))],apparatusFilledMassUpperKg=(i.apparatus??[]).reduce((n,a)=>n+a.normalFilledMassUpperKg,0)

 let postRowBridge:ReturnType<typeof derivePostRowBridge>|null=null,postRowInput:PostRowBridgeInput|null=null
 const bridgeIntegration:{railCuts:{sourceId:string;replacementIds:string[];yMm:number}[];eastTailParts:string[];perimeterGapMm:number|null;perimeterChecks:{id:string;gapMm:number;requiredCoverMm:number;necessary:boolean}[];remainingPerimeterTailChecks:{id:string;nominalGapMm:number;requiredSettingAndSteelMm:number;necessary:false}[];actualCollector?:{sourcePanelIds:string[];actualPhysicalPieceIds:string[];actualRailIds:string[];uniqueCollectedMassUpperKg:number;perCorbelDeadUpperN:{yMm:number;deadUpperN:number}[];oneWheelAddedOnlyOnce:boolean}|null}={railCuts:[],eastTailParts:[],perimeterGapMm:null,perimeterChecks:[],remainingPerimeterTailChecks:[]}
 if(b.topology==='outer-grid-post-row'){
  if(!b.postRow||!c.appliancePlatform||!i.bridgeRenewalContext)throw Error('Post-row bridge requires its actual current apparatus grid and source-bound renewal context')
  const commonGrid=derivePostRowGridAxes({roomPlanMm:r,maximumPanelXYMm:[g.maximumPanelXMm,g.maximumPanelYMm],jointMm:g.panelJointGapMm,footPadSideMm:pad,perimeterInsetMm:c.appliancePlatform.perimeterInsetMm,columnRelocation:c.appliancePlatform.postColumnRelocation})
  if(JSON.stringify(commonGrid.xMm)!==JSON.stringify(xs)||JSON.stringify(commonGrid.yMm)!==JSON.stringify(ys))throw Error('Bridge and walking floor do not share their actual post grid')
  postRowInput={bridge:{...b,postRow:b.postRow},grid:commonGrid,walkingTopMm:walk,plateYMm:i.bridgePlateYMm,externalReceiverXMm:b.outsideRailSeatXMm,panMinimumMm:i.panMinimumMm,wheelN:i.wheelN,material:m,settingEachMm:s,thermalPerMm:(m.thermalExpansionPerK??0)*(g.maximumUniformTemperatureExcursionK??0),walkingDeadAtOneNodeN:frameDeadN,sharedFootMaximumStockKg:pad**2*c.appliancePlatform.loadedPadBlankUpperMm/1e9*m.densityKgM3,sharedFootSideMm:pad,sharedFootMinimumMm:f.footPadThicknessMm,postSectionWHtMm:post,sourceRoofMaximumMm:i.outfallRoofMaximumMm,sourceRoofAtExternalBeamMm:i.sourceRoofAtExternalBeamMm??i.outfallRoofMaximumMm,panelJointMm:g.panelJointGapMm,hardwareEachKg:g.hardwareBudgetEachKg,grateMaximumRelativeSeatErrorMm:relativeSeatError,...i.bridgeRenewalContext}
  postRowBridge=derivePostRowBridge(postRowInput)
  for(const p of [...parts])if(p.id.startsWith('Plant/bridge-piece/')||p.id.startsWith('Plant/bridge-X-rail/')||p.id.startsWith('Plant/bridge-cross/')||p.id.startsWith('Plant/bridge-post/'+b.insideRailSeatXMm+'/')||p.id.startsWith('Plant/bridge-foot/'+b.insideRailSeatXMm+'/'))parts.splice(parts.indexOf(p),1)
  for(let k=checks.length-1;k>=0;k--)if(checks[k].id.startsWith('Plant/bridge-')||checks[k].id.startsWith('Plant/external-cross-'))checks.splice(k,1)
  bridgePieces.splice(0,bridgePieces.length,...postRowBridge.planks)
  for(const q of postRowBridge.retiredGridSupports)for(const id of [q.postId,q.headId,q.footId]){
   const old=parts.find(p=>p.id===id);if(!old)throw Error('Retired outer-row support is not actual occupied geometry '+id);parts.splice(parts.indexOf(old),1)
  }
  for(const q of [...postRowBridge.sharedPostUpdates,...postRowBridge.externalPostUpdates]){
   if('createNew'in q&&q.createNew)continue
   const p=parts.find(p=>p.id===q.postId);if(!p)throw Error('Bridge receiver is not an actual existing post '+q.postId)
   if(q.postTopMm<=p.boxMm[2])throw Error('Shortened existing bridge post has no positive length')
   const sec=q.postSectionWHtMm,L=q.postTopMm-p.boxMm[2];p.metalVolumeMm3=section(sec).area*L;p.boxMm=[q.xyMm[0]-sec[0]/2,q.xyMm[1]-sec[1]/2,p.boxMm[2],sec[0],sec[1],L]
   if('headId'in q){const old=parts.find(p=>p.id===q.headId);if(!old)throw Error('Shared existing post head is missing');parts.splice(parts.indexOf(old),1)}
  }
  const perimeter=b.postRow.perimeterGapMm;bridgeIntegration.perimeterGapMm=perimeter
  for(const axis of [0,1]){const required=two+2*r[axis+2]*postRowInput.thermalPerMm;bridgeIntegration.perimeterChecks.push({id:'Plant/post-row-bridge/perimeter/'+axis,gapMm:perimeter,requiredCoverMm:required,necessary:perimeter>=required})}
  for(const p of [...parts].filter(p=>p.kind==='solid-beam')){const lo=Math.max(p.boxMm[0],r[0]+perimeter),hi=Math.min(p.boxMm[0]+p.boxMm[3],r[0]+r[2]-perimeter);if(hi<=lo){parts.splice(parts.indexOf(p),1);continue}p.metalVolumeMm3*=(hi-lo)/p.boxMm[3];p.boxMm=[lo,p.boxMm[1],p.boxMm[2],hi-lo,p.boxMm[4],p.boxMm[5]]}
  for(const p of [...parts].filter(p=>p.kind==='solid-beam')){
   const y=p.boxMm[1]+p.boxMm[4]/2;if(!postRowBridge.sharedGridYMm.includes(y)||p.boxMm[0]+p.boxMm[3]<=postRowBridge.walkingRailEndXMm)continue
   const [x0,y0,z0,w0,d0,h0]=p.boxMm,end=x0+w0,ids:string[]=[];parts.splice(parts.indexOf(p),1)
   if(x0<postRowBridge.walkingRailEndXMm){const q=make(p.id+'/bridge-west','solid-beam',[x0,y0,z0,postRowBridge.walkingRailEndXMm-x0,d0,h0]);ids.push(q.id)}
   if((y<i.bridgePlateYMm[0]||y>i.bridgePlateYMm[1])&&end>postRowBridge.walkingRailResumeXMm){
    const x=Math.max(x0,postRowBridge.walkingRailResumeXMm),q=make(p.id+'/bridge-east-tail','solid-beam',[x,y0,z0,end-x,d0,h0]);ids.push(q.id);bridgeIntegration.eastTailParts.push(q.id)
    const corbel=make(p.id+'/east-positive-corbel','post-row-solid-corbel',[x,y-b.postRow.capWidthYMm/2,beamBottom-b.postRow.railCorbelLXtMm[1],end-x,b.postRow.capWidthYMm,b.postRow.railCorbelLXtMm[1]]);bridgeIntegration.eastTailParts.push(corbel.id)
    const gap=r[0]+r[2]-end,required=two+2*r[2]*postRowInput.thermalPerMm
    bridgeIntegration.remainingPerimeterTailChecks.push({id:q.id+'/pan-edge-unresolved',nominalGapMm:gap,requiredSettingAndSteelMm:required,necessary:false})
   }
   bridgeIntegration.railCuts.push({sourceId:p.id,replacementIds:ids,yMm:y})
  }
  parts.push(...postRowBridge.parts)
 }
 const platformSources=c.appliancePlatform?(i.apparatus??[]).map(a=>{const q=a.platformSource;if(!q||q.id!==a.id||JSON.stringify(q.homePlanMm)!==JSON.stringify(a.homePlanMm)||JSON.stringify(q.source)!==JSON.stringify(a.source)||Math.abs(q.components.reduce((n,c)=>n+c.maximumKg,0)-a.normalFilledMassUpperKg)>1e-6)throw Error('Unified mode requires actual separate source mass components; no total-mass-as-CG shortcut');return q}):[]
 let unified=c.appliancePlatform?plantAppliancePlatform({choice:c.appliancePlatform,apparatus:platformSources,postXMm:xs,postYMm:ys,walkingMm:walk,barBottomMm:barBottom,steelDensityKgM3:m.densityKgM3,elasticModulusMPa:m.elasticModulusMPa,allowableMPa:m.allowableComparisonMPa,wheelN:i.wheelN,walkingDeadAtOneNodeN:frameDeadN+(c.appliancePlatform.loadedPadSideMm**2*c.appliancePlatform.loadedPadBlankUpperMm+volume([0,0,0,...c.appliancePlatform.loadedNodeBlockLWtMm])+volume([0,0,0,...c.appliancePlatform.loadedHeadLWtMm])+c.appliancePlatform!.pickupSideMm**2*(walk-barBottom)+c.appliancePlatform!.hardwareEachChassisKg/m.densityKgM3*1e9+post[0]*post[1]*(beamBottom-i.panMinimumMm))/1e9*m.densityKgM3*9.81,settingEachMm:s,minimumBarSeatMm:minimumSeat,bearingBarThicknessMm:g.bearingBarThicknessMm,steelThermalMovementPerMm:(m.thermalExpansionPerK??0)*(g.maximumUniformTemperatureExcursionK??0),sourceMovementCoverXYMm:[two+(r[2]+Math.max(...platformSources.map(a=>a.homePlanMm[2])))*(m.thermalExpansionPerK??0)*(g.maximumUniformTemperatureExcursionK??0),two+(r[3]+Math.max(...platformSources.map(a=>a.homePlanMm[3])))*(m.thermalExpansionPerK??0)*(g.maximumUniformTemperatureExcursionK??0)]}):null
 if(unified)for(const a of i.apparatus??[]){const q=unified.chassis.find(q=>q.id===a.id)!;if(Math.abs(a.bodyBottomAbsoluteMm-q.bodyBearingPlaneMm)>1e-8)throw Error('Actual source apparatus body bottom must follow its selected factory pickup or above-floor buffer cradle')}
 const unifiedDetails=unified?applyUnifiedPlatform({platform:unified,control:c.appliancePlatform!,parts,panels,make,beamSegments,barBottomMm:barBottom,beamBottomMm:beamBottom,walkingMm:walk,postSection:post,steel:m,hardwareEachPanelKg:g.hardwareBudgetEachKg,initialWaterMm:i.initialWaterMm,maximumWaterMm:i.maximumWaterMm,room:r,normalPadMm:pad,walkingRailWidthMm:beam[0],steelThermalMovementPerMm:(m.thermalExpansionPerK??0)*(g.maximumUniformTemperatureExcursionK??0),settingEachMm:s,bridgeCutoutMm:postRowBridge?.grateExclusionPlanMm,perimeterGapMm:postRowBridge?b.postRow?.perimeterGapMm:undefined}):null

 if(unified&&unifiedDetails){
  const finalPanelMaximum=Math.max(...panels.map(p=>p.completeMassDesignUpperKg)),finalSegmentMaximum=Math.max(...beamSegments.map(p=>p.completeMassDesignUpperKg)),finalFrameDead=(4*finalPanelMaximum+finalSegmentMaximum)*9.81,kitBound=(c.appliancePlatform!.loadedPadSideMm**2*c.appliancePlatform!.loadedPadBlankUpperMm+volume([0,0,0,...c.appliancePlatform!.loadedNodeBlockLWtMm])+volume([0,0,0,...c.appliancePlatform!.loadedHeadLWtMm])+post[0]*post[1]*(beamBottom-i.panMinimumMm))/1e9*m.densityKgM3*9.81,
   again=plantAppliancePlatform({choice:c.appliancePlatform!,apparatus:platformSources,postXMm:xs,postYMm:ys,walkingMm:walk,barBottomMm:barBottom,steelDensityKgM3:m.densityKgM3,elasticModulusMPa:m.elasticModulusMPa,allowableMPa:m.allowableComparisonMPa,wheelN:i.wheelN,walkingDeadAtOneNodeN:finalFrameDead+kitBound,settingEachMm:s,minimumBarSeatMm:minimumSeat,bearingBarThicknessMm:g.bearingBarThicknessMm,steelThermalMovementPerMm:(m.thermalExpansionPerK??0)*(g.maximumUniformTemperatureExcursionK??0),sourceMovementCoverXYMm:[two+(r[2]+Math.max(...platformSources.map(a=>a.homePlanMm[2])))*(m.thermalExpansionPerK??0)*(g.maximumUniformTemperatureExcursionK??0),two+(r[3]+Math.max(...platformSources.map(a=>a.homePlanMm[3])))*(m.thermalExpansionPerK??0)*(g.maximumUniformTemperatureExcursionK??0)]})
  if(JSON.stringify(again.loadedNodes.map(n=>n.xyMm))!==JSON.stringify(unified.loadedNodes.map(n=>n.xyMm)))throw Error('Post-trim G refresh changed actual appliance support topology')
  unified=again
  unifiedDetails.finalDemandBasis={maximumCompletePhysicalPanelKg:Math.max(...unifiedDetails.physicalPanelPieces.map(p=>p.completeMassUpperKg)),maximumContainerAllPiecesKg:finalPanelMaximum,maximumCompleteRailSegmentKg:finalSegmentMaximum,frameDeadAtOneNodeN:finalFrameDead,loadedNodeKitGravityBoundN:kitBound,allDemandRecomputedAfterActualCutRimsAndStocks:true}
  for(const n of unified.loadedNodes){const foot=parts.find(p=>p.kind==='solid-foot-pad'&&Math.abs(p.boxMm[0]+p.boxMm[3]/2-n.xyMm[0])<1e-6&&Math.abs(p.boxMm[1]+p.boxMm[4]/2-n.xyMm[1])<1e-6)!;foot.compressionDesignN=n.compressionN
   const suffix=foot.id.slice('Plant/foot/'.length),head=CHead(),postSection=post,headChecks=unifiedDetails.componentChecks.filter(q=>q.id.startsWith('Plant/unified-node/'+suffix+'/head-strip/'))
   for(const q of headChecks){const axis=Number(q.id.at(-1)),w=head[axis],l=head[1-axis];q.value=6*n.compressionN*((w-postSection[axis])/2+two)/(l*head[2]**2);q.necessary=q.value<=q.limit}
   const axial=unifiedDetails.componentChecks.find(q=>q.id==='Plant/unified-node/'+suffix+'/post-axial')!;axial.value=n.compressionN/section(post).area;axial.necessary=axial.value<=axial.limit
  }
  unifiedDetails.necessaryNodeComponentComparisons=unifiedDetails.componentChecks.every(q=>q.necessary)
  function CHead(){return c.appliancePlatform!.loadedHeadLWtMm}
  const update=(id:string,value:number)=>{const q=checks.find(q=>q.id===id);if(!q)throw Error('Missing actual dead-demand check '+id);q.value=value;q.necessary=value<=q.limit+1e-8}
  update('Plant/grate-bar-wheel-and-dead',barStress*(i.wheelN+finalPanelMaximum*9.81)/i.wheelN)
  update('Plant/grate-edge-wheel-and-dead',barCantilever*(i.wheelN+finalPanelMaximum*9.81)/i.wheelN)
  update('Plant/frame-wheel-and-dead',beamStress*(i.wheelN+finalFrameDead)/i.wheelN)
  update('Plant/frame-wheel-and-dead-deflection',beamDelta*(i.wheelN+finalFrameDead)/i.wheelN)
  update('Plant/frame-wall-edge-cantilever',(i.wheelN+finalFrameDead)*overhang/(f.minimumBeamIMm4/(beam[1]/2)))
  for(const panel of unifiedDetails.physicalPanelPieces)add(panel.id+'/complete-actual-piece','kg',panel.completeMassUpperKg,g.maximumCompletePanelKg)
 }

 if(unified){for(const a of unified.chassis){checks.push({id:a.id+(a.supportMode==='bespoke-three-pickups'?'/factory-dry-CG-containment-for-bolted-pickups':'/combined-gravity-contact-stability'),quantity:'condition',value:(a.supportMode==='bespoke-three-pickups'?a.necessaryFactoryDryCGContainment:a.necessarySelectedGravityCG)?0:1,limit:0,necessary:a.supportMode==='bespoke-three-pickups'?a.necessaryFactoryDryCGContainment:a.necessarySelectedGravityCG});checks.push({id:a.id+'/matched-mount-fit',quantity:'mm',value:a.matchedMount.completeFitBudgetMm,limit:a.matchedMount.maximumRelativeErrorMm,necessary:a.matchedMount.necessaryMatchedFit})}for(const a of unified.chassis)if(a.bufferBearingProjection)checks.push({id:a.id+'/source-circle-bearing-patch-fit',quantity:'mm',value:-a.bufferBearingProjection.minimumRadialReserveMm!,limit:0,necessary:a.bufferBearingProjection.necessaryProjectedCircleFit});for(const q of unifiedDetails?.normalNodeRestoringCases??[])checks.push({id:q.id,quantity:'N-normal-compression',value:-q.minimumNormalPanCompressionN,limit:0,necessary:q.necessaryNoNormalFloorAnchor});for(const q of unifiedDetails?.componentChecks??[])checks.push({id:q.id,quantity:'MPa',value:q.value,limit:q.limit,necessary:q.necessary});for(const q of unifiedDetails?.footPanClearances??[])checks.push({id:q.id,quantity:'mm',value:q.requiredCoverMm,limit:q.nominalGapMm,necessary:q.afterSettingsAndSteelThermalMm>=0});for(const a of unified.chassis)for(const q of a.memberChecks)checks.push({id:a.id+'/'+q.id,quantity:q.id.includes('deflection')?'mm':q.id.includes('mass')?'kg':'MPa',value:q.value,limit:q.limit,necessary:q.necessary});if(unifiedDetails){totalJointMm3=unifiedDetails.totalJointMm3;wetJointMm3=unifiedDetails.wetJointMm3;blockedPanelIds.splice(0,blockedPanelIds.length,...unifiedDetails.apparatusBlockedPanelIds)}}
 if(postRowBridge&&postRowInput){
  const finalWalkingDead=unifiedDetails?.finalDemandBasis?.frameDeadAtOneNodeN??frameDeadN,tailGravity=parts.filter(p=>bridgeIntegration.eastTailParts.includes(p.id)).reduce((n,p)=>n+p.metalVolumeMm3/1e9*m.densityKgM3*9.81,0),
   continuous=postRowBridge.supportMode==='two-end-continuous',
   corbelYs=postRowBridge.sharedGridYMm,
   lastColumnPanels=continuous?panels.filter(p=>p.planMm[0]>=r[0]+(nx-1)*(px+g.panelJointGapMm)-1e-6&&[p.planMm[1],p.planMm[1]+p.planMm[3]].some(y=>corbelYs.some(z=>Math.abs(z-y)<=g.panelJointGapMm))):[],
   collectorPanelIds=new Set(lastColumnPanels.map(p=>p.id)),
   collectorPieces=unifiedDetails?.physicalPanelPieces.filter(p=>collectorPanelIds.has(p.sourcePanel))??[],
   collectorRails=continuous?beamSegments.filter(p=>p.boxMm[0]>=xs[xs.length-2]-g.panelJointGapMm&&corbelYs.some(y=>Math.abs(y-(p.boxMm[1]+p.boxMm[4]/2))<1e-6)):[],
   uniqueCollectedG=collectorPieces.reduce((n,p)=>n+p.completeMassUpperKg,0)+collectorRails.reduce((n,p)=>n+p.completeMassDesignUpperKg,0),
   perCorbel=corbelYs.map(y=>({yMm:y,deadUpperN:9.81*(collectorPieces.filter(p=>{const panel=lastColumnPanels.find(a=>a.id===p.sourcePanel)!;return Math.abs(panel.planMm[1]-y)<=g.panelJointGapMm||Math.abs(panel.planMm[1]+panel.planMm[3]-y)<=g.panelJointGapMm}).reduce((n,p)=>n+p.completeMassUpperKg,0)+collectorRails.filter(p=>Math.abs(p.boxMm[1]+p.boxMm[4]/2-y)<1e-6).reduce((n,p)=>n+p.completeMassDesignUpperKg,0))})),
   removedBeforeGirderRenewal=new Set<string>([
    ...lastColumnPanels.flatMap(p=>parts.filter(q=>q.id===p.id||q.id.startsWith(p.id+'/')).map(q=>q.id)),
    ...collectorRails.map(p=>p.id),
    ...postRowBridge.parts.filter(p=>p.kind==='bridge-plate'||p.kind==='post-row-solid-seat').map(p=>p.id),
    ...postRowBridge.innerAssemblyPartIds,
    ...postRowBridge.caps.filter(p=>p.id.includes('/shared-cap/')).map(p=>p.id)
   ]),
   retainedWalkingObstacles=continuous?parts.filter(p=>!removedBeforeGirderRenewal.has(p.id)).map(p=>({id:p.id,boxMm:p.boxMm})):undefined
  if(continuous&&(!unifiedDetails||lastColumnPanels.length!==6||collectorRails.length!==6||collectorPieces.length<6))throw Error('Actual six east panel containers, their physical pieces and six last rail stocks are required')
  postRowBridge=derivePostRowBridge({...postRowInput,walkingDeadAtOneNodeN:continuous?uniqueCollectedG*9.81:finalWalkingDead+tailGravity,...(continuous?{collectedCorbelLoads:perCorbel,retainedWalkingObstacles}:{})})
  if(continuous)postRowBridge.innerGirderRenewal!.removedActualWalkingPartIds=[...removedBeforeGirderRenewal].filter(id=>!postRowBridge!.innerAssemblyPartIds.includes(id)&&!id.includes('/shared-cap/'))
  bridgeIntegration.actualCollector=continuous?{sourcePanelIds:[...collectorPanelIds],actualPhysicalPieceIds:collectorPieces.map(p=>p.id),actualRailIds:collectorRails.map(p=>p.id),uniqueCollectedMassUpperKg:uniqueCollectedG,perCorbelDeadUpperN:perCorbel,oneWheelAddedOnlyOnce:true}:null
  for(const q of [...postRowBridge.sharedPostUpdates,...postRowBridge.externalPostUpdates]){const foot=parts.find(p=>p.id===q.footId)!;foot.compressionDesignN=postRowBridge.oneSharedPostDemandUpperN;const moments=postRowBridge.normalFootWrenchBounds.find(w=>w.footId===foot.id)!;foot.compressionMomentBoundsNm={Mx:moments.MxBoundsNm,My:moments.MyBoundsNm}}
  if(continuous){
   const requiredCover=[r[2],r[3]].map(v=>two+2*v*postRowInput!.thermalPerMm)
   for(const q of postRowBridge.sharedPostUpdates){
    const foot=parts.find(p=>p.id===q.footId)!
    for(const axis of [0,1]){const nominal=Math.min(foot.boxMm[axis]-r[axis],r[axis]+r[axis+2]-foot.boxMm[axis]-foot.boxMm[axis+3]);add(q.footId+'/actual-pan-edge/'+axis,'mm',requiredCover[axis],nominal)}
   }
   for(const cap of postRowBridge.caps.filter(q=>q.id.includes('/shared-cap/')))for(const axis of [0,1]){const nominal=Math.min(cap.boxMm[axis]-r[axis],r[axis]+r[axis+2]-cap.boxMm[axis]-cap.boxMm[axis+3]);add(cap.id+'/actual-pan-edge/'+axis,'mm',requiredCover[axis],nominal)}
  }
  for(const q of postRowBridge.memberChecks)checks.push(q)
  for(const q of bridgeIntegration.perimeterChecks)add(q.id,'mm',q.requiredCoverMm,q.gapMm)
  for(const q of bridgeIntegration.remainingPerimeterTailChecks)add(q.id,'mm',q.requiredSettingAndSteelMm,q.nominalGapMm)
 }
 const floorEvidence=i.compressionSupport?.floorCase,rcOverF=!!(floorEvidence&&'plantCompression'in floorEvidence&&floorEvidence.plantCompression?.rcOverUniformF),
  rcOverInsulationSupport=rcOverF?plantRcOverUniformFPanSupport({context:i.compressionSupport!,roomPlanMm:r,parts,maximumWaterMm:i.maximumWaterMm,footDesignN:f.maximumSinglePostDesignN,steelDensityKgM3:m.densityKgM3}):null,
  compressionSupport=i.compressionSupport&&!rcOverF?plantMatchedPanCompression({context:i.compressionSupport,roomPlanMm:r,parts,maximumWaterMm:i.maximumWaterMm,footDesignN:f.maximumSinglePostDesignN,steelDensityKgM3:m.densityKgM3}):null
 const matchedSupport=compressionSupport??rcOverInsulationSupport
 if(matchedSupport)for(const a of apparatusInterfaces){
  if(!('standParts'in a)||!a.standParts)continue
  const members=parts.filter(p=>a.standParts!.includes(p.id)),existing=parts.filter(p=>!a.standParts!.includes(p.id)&&p.kind!=='grate'&&p.kind!=='hardware'),gap=(a:B,b:B)=>{const ds=[0,1,2].map(k=>Math.max(a[k]-b[k]-b[k+3],b[k]-a[k]-a[k+3]));return ds.some(v=>v>0)?Math.hypot(...ds.map(v=>Math.max(0,v))):Math.max(...ds)}
  a.frameChecks=members.flatMap(p=>existing.map(q=>({part:p.id,existing:q.id,afterTwoSettingsMm:gap(p.boxMm,q.boxMm)-two})))
  a.necessarySeparateStandGeometry=a.frameChecks.every(q=>q.afterTwoSettingsMm>=0)
  a.panelCutoutIntersections=panels.flatMap(p=>{const hits=members.filter(q=>p.parts.some(id=>gap(q.boxMm,parts.find(b=>b.id===id)!.boxMm)<two));return hits.length?[{panel:p.id,standParts:hits.map(q=>q.id),memberEndsAndWheelCapacityAfterCutoutAccepted:false as const}]:[]})
  a.standFullSolidMassUpperKg=members.reduce((n,p)=>n+volume(p.boxMm)/1e9*m.densityKgM3,0)+(a.standHardwareBudgetKg??0)
  a.designOnePostN=(a.normalFilledMassUpperKg!+a.standFullSolidMassUpperKg)*9.81
  const demand=checks.find(q=>q.id===a.id+'/independent-post-demand')
  if(demand){demand.value=a.designOnePostN;demand.necessary=a.designOnePostN<=demand.limit}
  a.standFeetAbsoluteMm=members.filter(p=>p.kind==='apparatus-stand-pad').map(p=>[p.boxMm[0]+p.boxMm[3]/2,p.boxMm[1]+p.boxMm[4]/2,p.boxMm[2]])
  a.diagnostics=a.diagnostics.filter(d=>d!=='PLANT_WALK/apparatus-stand-hits-walking-frame')
  if(!a.necessarySeparateStandGeometry)a.diagnostics.push('PLANT_WALK/apparatus-stand-hits-walking-frame')
 }
 if(compressionSupport&&!postRowBridge){const actualFootKg=Math.max(...parts.filter(p=>p.kind==='bridge-pad').map(p=>p.metalVolumeMm3/1e9*m.densityKgM3));add('Plant/bridge-matched-foot-wheel-and-dead','N',footCombinedN+Math.max(0,actualFootKg-oneBridgeFootKg)*9.81,f.maximumSinglePostDesignN)}
 if(postRowBridge)for(const q of [...postRowBridge.sharedPostUpdates,...postRowBridge.externalPostUpdates]){
  const p=parts.find(p=>p.id===q.postId)!,foot=parts.find(p=>p.id===q.footId)!,N=postRowBridge.oneSharedPostDemandUpperN,L=p.boxMm[5],actualPost=section(b.postRow!.postSectionWHtMm)
  add(q.postId+'/post-row-actual-Euler','N',N,Math.PI**2*m.elasticModulusMPa*actualPost.I/L**2)
  for(const axis of [0,1]){const w=foot.boxMm[axis+3],depth=f.footPadThicknessMm,over=(w-b.postRow!.postSectionWHtMm[axis])/2+two;add(q.footId+'/post-row-steel-pad/'+axis,'MPa',3*N/(foot.boxMm[3]*foot.boxMm[4])*over**2/depth**2,m.allowableComparisonMPa)}
 }
 const standThermalClearance=matchedSupport?apparatusInterfaces.flatMap(a=>{
  if(!('standParts'in a)||!a.standParts||!a.homePlanMm)return[]
  const alpha=m.thermalExpansionPerK??NaN,temperature=g.maximumUniformTemperatureExcursionK??NaN,cover=[r[2]+a.homePlanMm[2],r[3]+a.homePlanMm[3],2*(walk-i.panMinimumMm)].map(v=>v*alpha*temperature),
   stand=parts.filter(p=>a.standParts!.includes(p.id)),others=parts.filter(p=>!a.standParts!.includes(p.id)&&p.kind!=='grate'&&p.kind!=='hardware'),
   gap=(a:B,b:B)=>{const d=[0,1,2].map(k=>Math.max(a[k]-b[k]-b[k+3],b[k]-a[k]-a[k+3]));return d.some(v=>v>0)?Math.hypot(...d.map(v=>Math.max(0,v))):Math.max(...d)},
   checks=stand.flatMap(p=>others.map(q=>{const b=p.boxMm.map((v,k)=>k<3?v-cover[k]:v+2*cover[k-3]) as unknown as B;return{part:p.id,existing:q.id,afterSettingsAndSteelThermalMm:gap(b,q.boxMm)-two}}))
  return[{id:a.id,coefficientPerK:alpha,temperatureExcursionK:temperature,relativeSteelMovementCoverEachAxisMm:cover,minimumAfterSettingsAndSteelThermalMm:Math.min(...checks.map(p=>p.afterSettingsAndSteelThermalMm)),necessaryConditionalSteelThermalSeparation:finite([alpha,temperature,...cover])&&checks.every(p=>p.afterSettingsAndSteelThermalMm>=0),fixedSlidingDatumsPanAndRCResponseAndPressureGuidesAccepted:false,scope:'Bounding steel free expansion from any datum within the room plus independent apparatus-stand footprint; mechanical restraint, RC/F movement and force-driven sway are separate.',failures:checks.filter(p=>p.afterSettingsAndSteelThermalMm<0)}]
 }):[]
 const bruteMm3=parts.filter(p=>p.kind!=='hardware').reduce((n,p)=>n+clippedVolume(p.boxMm,r,i.initialWaterMm,i.maximumWaterMm),0),metalMm3=parts.reduce((n,p)=>n+p.metalVolumeMm3,0)-totalJointMm3,
  // Extra RHS metal/void is deliberately charged as SOLID for this normal
  // design mass upper. Actual fabrication/section tolerances remain unearned.
  fullEnvelopeMm3=parts.filter(p=>p.kind!=='hardware').reduce((n,p)=>n+(p.kind.includes('RHS')||p.kind==='RHS-beam'||p.kind==='RHS-post'?volume(p.boxMm):p.metalVolumeMm3),0)-totalJointMm3,
  hardwareKg=(unifiedDetails?.additionalCutHardwareKg??0)+(unified?.chassis.reduce((n,a)=>n+c.appliancePlatform!.hardwareEachChassisKg,0)??0)+(panels.length+bridgePieces.length+beamSegments.length)*g.hardwareBudgetEachKg+apparatusInterfaces.reduce((n,a)=>n+('standHardwareBudgetKg'in a?(a.standHardwareBudgetKg??0):0),0),hardwareVolumeUpperL=hardwareKg/m.densityKgM3*1000,waterUpperL=(bruteMm3-wetJointMm3)/1e6+hardwareVolumeUpperL
 return{...(rcOverInsulationSupport?{rcOverInsulationSupport}:{}),...(postRowBridge?{postRowBridge,bridgeIntegration}:{}),...(unified?{appliancePlatform:unified,unifiedDetails}:{}),...(compressionSupport?{compressionSupport}:{}),...(matchedSupport?{standThermalClearance}:{}),deadLoadBounds:{...(unifiedDetails?.finalDemandBasis?{postTrimBasis:unifiedDetails.finalDemandBasis}:{}),panelBarDeadN:unifiedDetails?.finalDemandBasis?.maximumContainerAllPiecesKg?unifiedDetails.finalDemandBasis.maximumContainerAllPiecesKg*9.81:panelBarDeadN,frameDeadN:unifiedDetails?.finalDemandBasis?.frameDeadAtOneNodeN??frameDeadN,...(postRowBridge?{bridgePlateKg:postRowBridge.planks.reduce((n,p)=>n+p.completeMassDesignUpperKg,0),bridgeRailKg:0,oneCrossKg:postRowBridge.bridgeDeadUpperKg,railCombinedN:0,crossCombinedN:postRowBridge.oneSharedPostDemandUpperN,footCombinedN:postRowBridge.oneSharedPostDemandUpperN}:{bridgePlateKg,bridgeRailKg,oneCrossKg,railCombinedN,crossCombinedN,footCombinedN}),allDeadAtWorstPoint:true,RHSFullOuterBoxMassUpper:true},schema:'had-Plant-tanked-walking-surface/1',sourceDigest:sha256SemanticFingerprint(i),apparatusInterfaces,apparatusFilledMassUpperKg,normalMassExcludesFilledApparatus:true,parts,panels,bridgePieces,beamSegments,locators,walkingTopMm:walk,bridgeTopMm:bridgeTop,
  solidsIncrementUpperL:waterUpperL,referenceMetalKg:metalMm3/1e9*m.densityKgM3,normalMassUpperKg:fullEnvelopeMm3/1e9*m.densityKgM3+hardwareKg+(compressionSupport?.normalMassUpperKg??0)+(rcOverInsulationSupport?.gradedBeddingMassUpperKg??0),
  volumeLedger:{sumFullOuterClippedMm3:bruteMm3,exactCrossBarIntersectionSubtractedMm3:wetJointMm3,joinedBridgeOrHardwareOverlapSubtracted:false,RHSVoidCountedAsSolid:true,closedDuctVoidCreditLitres:0,hardwareBelowWaterIncluded:true,apparatusGrateIntersectionsCountedTwiceConservatively:apparatusInterfaces.some(a=>'panelCutoutIntersections'in a&&!!a.panelCutoutIntersections?.length),hardwareSolidSteelVolumeUpperL:hardwareVolumeUpperL,hardwareRequirement:'Solid steel fasteners/handles only; whole mass budget counted wet. Any enclosed cavity requires a separately authored external volume bound.'},
  geometry:{panelCount:panels.length,panelSizeMm:[px,py],walkingRailSectionKind:solid?'solid':'rhs',wallParameterAppliesToWalkingRail:!solid,actualSolidSegmentFirstRestAndToolProofAccepted:false,postCentreXMm:xs,postCentreYMm:ys,...(postRowBridge?.supportMode==='two-end-continuous'?{cartesianPostGridApplies:false,actualPostYsByColumn:xs.map((_,k)=>k===b.postRow!.sharedPostColumnIndex?[...postRowBridge!.actualEndPostYMm,...ys.filter(y=>!postRowBridge!.retiredGridSupports.some(q=>Math.abs(q.yMm-y)<1e-6))].sort((a,b)=>a-b):ys)}:{}),panSupportLevelRangeMm:[i.panMinimumMm,i.panMaximumMm],postBoxesUseLowestPanForConservativeMass:!compressionSupport&&!rcOverInsulationSupport,actualPerFootPanContactNotInvented:true,...(compressionSupport||rcOverInsulationSupport?{postBoxesUseActualMatchedPanFaces:true,footContactQualificationAccepted:false}:{}),matchedPanelSeat:{relativeErrorMm:relativeSeatError,radialFitMm:radialClearance,thermalMovementMm:thermalMovement,completeFitBudgetMm:fitBudget,minimumBearingMm:minimumSeat,requiredFirstVerticalReleaseMm:requiredFirstLift,oneRoundOneLongitudinalSlotRequired:true,locatorWeldsDoNotCutRHS:true,actualHardwareGeometryToolAndSlotQualificationAccepted:false},bearingSpanWithSettingsMm:bearingSpan,beamSpanWithSettingsMm:beamSpan,bridgeRailBottomMm:postRowBridge?.girderBottomMm??railBottom,crossBeamBottomMm:postRowBridge?.externalGirderBottomMm??crossBottom},
  memberChecks:checks,necessaryMemberComparisons:checks.every(p=>p.necessary),memberScope:'Bars/beams, axial posts, head caps and conservative one-dimensional local-face strips. Face-strip law requires a full contact patch with pressure bounded by2x its mean; actual contact/certificates are not supplied by a global I.',actualRHSLocalFaceAndBearingLawAccepted:false,loadPaths:{wheelDesignN:i.wheelN,allWheelOnOneBarAndBeam:true,footDesignN:f.maximumSinglePostDesignN,footPressureUpperMPa:f.maximumSinglePostDesignN/pad**2,normalLoadPath:rcOverInsulationSupport?'Steel feet -> continuous pan -> engineered graded mineral bed -> spanning RC -> ACTUAL net F/cold-grid contact mask. The central retained soffit F is not a load-bearing span.':'Grating bars directly bear on actual selected steel rails; posts and aligned below-pan solids carry compression THROUGH a continuous pan. Pan bending and finish capacity are not credited.',requiredLateralAndUpliftConnections:'Positive bolted/welded retention and actual sway/rail connections must be sized; no friction or unspecified anchors are credited.'},
  renewal:{eachPanelHasIndependentGravitySupport:true,everyPanelIndependentOfApparatusRemoval:blockedPanelIds.length===0,apparatusRemovalBeforePanelIds:blockedPanelIds,actualApparatusStandCutoutAndRenewalAccepted:false,matchedLocatorsRequiredBeforeRelativeSettingCredit:true,panelsRequirePositiveCaptureBeforeRetainersRelease:true,bridgePiecesRequireSameSourceAndStoredEnergyIsolation:true,actualToolAccessQuarterTurnAndFirstRestAccepted:false,...(postRowBridge?{selectedBridgeRenewalMode:'straight-X-after-positive-capture',quarterTurnComparisonApplies:false,actualStraightXObstacleScreen:postRowBridge.necessaryRenewalGeometry,actualCrewCaptureAndToolAcceptance:false,perimeterShadowGapMm:bridgeIntegration.perimeterGapMm,perimeterGapExceeds25mmWheelContact:true,actualCargoWheelRoutesAndPersonnelAtPerimeterAccepted:false}:{}),actualLateralStabilityDuringPieceRemovalAccepted:false,massLimitIsComparisonNotHumanQualification:true},
  actualRCPanSandwichBearingAndThermalBridgeAccepted:false,actualFabricationAndMaterialTemperaturePropertiesAccepted:false,actualCompleteInstallationAccepted:false,
  diagnostics:[...(rcOverInsulationSupport?.diagnostics??[]),...apparatusInterfaces.flatMap(a=>a.diagnostics),...checks.filter(q=>!q.necessary).map(q=>'PLANT_WALK/member-screen/'+q.id),'PLANT_WALK/actual-per-foot-pan-and-RC-contact-required','PLANT_WALK/RHS-local-face-web-and-contact-law-not-admitted','PLANT_WALK/actual-joints-and-lateral-stability-required','PLANT_WALK/round-slot-locators-and-12mm-capture-first-lift-required','PLANT_WALK/solid-steel-hardware-no-enclosed-void-requirement','PLANT_WALK/actual-piece-tools-and-renewal-sweeps-required','PLANT_WALK/fresh-whole-house-gravity-and-water-actions-required']}
}

/** Same-case full-plan RC -> unfaced, machined F -> continuous metal pan ->
 * individually matched steel feet. No pressure spreading or pan bending is
 * credited. Product test values screen an authored working requirement only. */
export function plantMatchedPanCompression(i:{context:PlantPanCompressionSupport;roomPlanMm:P;parts:Part[];maximumWaterMm:number;footDesignN:number;steelDensityKgM3:number}){
 const c=i.context,actual=c.floorCase,d=c.design
 if(!actual.local||!('plantCompression'in actual)||!actual.plantCompression)throw Error('Actual optional full-Plant floor producer required')
 if(actual.plantCompression.rcOverUniformF)throw Error('Old F-under-foot pressure law is not applicable to RC-over-F; use its distinct support producer')
 const replay=inletRoomPocket(actual.plantCompression.resolvedInput)
 if(sha256SemanticFingerprint(replay)!==sha256SemanticFingerprint(actual))throw Error('Compression floor result is not its actual same-source replay')
 if(!finite([c.panMetalMm,c.panDensityKgM3,...Object.values(d)])||c.panMetalMm<=0||c.panDensityKgM3<=0||d.minimumMachinedFootThicknessMm<8||d.stockThicknessMm<40||d.stockThicknessMm>180||d.compressiveWorkingFactor<3||d.minimumEffectiveContactFraction<.95||d.minimumEffectiveContactFraction>1)throw Error('Matched F bed, minimum foot and conservative working/contact requirements required')
 const p=i.roomPlanMm,r=[p[0],p[1],p[0]+p[2],p[1]+p[3]] as const,rc=actual.local.levelBoxes.find(b=>b.id==='dryRC')!
 if(JSON.stringify(actual.local.roomMinMaxMm)!==JSON.stringify(r))throw Error('Bed and optional floor must describe the same actual Plant room')
 type R=readonly[number,number,number,number]
 const area=(r:R)=>(r[2]-r[0])*(r[3]-r[1]),clip=(a:R,b:R):R|null=>{const r=[Math.max(a[0],b[0]),Math.max(a[1],b[1]),Math.min(a[2],b[2]),Math.min(a[3],b[3])]as const;return r[2]>r[0]&&r[3]>r[1]?r:null},
  corners=(r:R)=>[[r[0],r[1]],[r[2],r[1]],[r[2],r[3]],[r[0],r[3]]],
  rcPlans=rc.planRectanglesXYMm??[rc.planMinMaxMm],
  cells=c.panCells.map(q=>{
   if(!q.id||q.cornersMm.length!==4||q.cornersMm.some(p=>p.length!==3||!finite(p)))throw Error('Actual four-corner rectangular pan facets required')
   const pts=q.cornersMm,[a,b,e]=pts,u=b.map((v,k)=>v-a[k]),v=e.map((z,k)=>z-a[k]),det=u[0]*v[1]-u[1]*v[0]
   if(Math.abs(det)<1e-8)throw Error('Degenerate pan facet')
   const ax=(u[2]*v[1]-v[2]*u[1])/det,ay=(u[0]*v[2]-v[0]*u[2])/det,cc=a[2]-ax*a[0]-ay*a[1],plan=[Math.min(...pts.map(p=>p[0])),Math.min(...pts.map(p=>p[1])),Math.max(...pts.map(p=>p[0])),Math.max(...pts.map(p=>p[1]))] as const,
    surface=(x:number,y:number)=>ax*x+ay*y+cc,offset=c.panMetalMm*Math.sqrt(1+ax*ax+ay*ay)
   if(pts.some(p=>Math.abs(p[2]-surface(p[0],p[1]))>1e-7)||corners(plan).some(p=>!pts.some(q=>q[0]===p[0]&&q[1]===p[1])))throw Error('Nonplanar or nonrectangular pan facet not supported')
   return{id:q.id,plan,ax,ay,surface,offset}
  })
 if(!Array.isArray(c.panInternalStepFaces))throw Error('Actual pan internal step faces are required for physical bed cutouts')
 const stepNotches=c.panInternalStepFaces.map((f:PlantPanCompressionSupport['panInternalStepFaces'][number])=>{
  if(!f.id||f.cornersMm.length!==4||f.cornersMm.some(p=>p.length!==3||!finite(p))||f.normal.length!==3||!finite(f.normal)||f.normal[2]!==0||Math.abs(f.normal[0])+Math.abs(f.normal[1])!==1)throw Error('Actual orthogonal vertical pan step normal prism required')
  const axis=f.normal[0]!==0?0:1,datum=f.cornersMm[0][axis]
  if(f.cornersMm.some(p=>Math.abs(p[axis]-datum)>1e-8))throw Error('Pan step must lie in its actual vertical normal plane')
  const extruded=f.cornersMm.map(p=>p.map((v,k)=>v+f.normal[k]*c.panMetalMm)),points=[...f.cornersMm,...extruded],plan=[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))]as const
  return{id:f.id+'/bed-normal-prism-notch',sourceFaceId:f.id,flowFaceCornersMm:f.cornersMm,normal:f.normal,extrusionMm:c.panMetalMm,solidCornersMm:points,planMinMaxMm:plan,subtractiveGeometryOnlyNoWaterCredit:true}
 })
 if(!cells.length||cells.some(c=>area(clip(c.plan,r)??[0,0,0,0])<area(c.plan)-1e-6))throw Error('Actual pan facets must remain within Plant')
 for(let a=0;a<cells.length;a++)for(let b=a+1;b<cells.length;b++)if(clip(cells[a].plan,cells[b].plan))throw Error('Overlapping pan facets cannot be counted twice')
 const panArea=cells.reduce((n,c)=>n+area(c.plan),0),roomArea=area(r)
 if(Math.abs(panArea-roomArea)>1e-5)throw Error('Continuous pan coverage including real exclusions required')
 const bedFacets=cells.map(c=>{
  const a=area(c.plan),mid=[(c.plan[0]+c.plan[2])/2,(c.plan[1]+c.plan[3])/2],thickness=c.surface(mid[0],mid[1])-c.offset-rc.zMm[1],depths=corners(c.plan).map(p=>c.surface(p[0],p[1])-c.offset-rc.zMm[1]),covered=rcPlans.reduce((n,p)=>n+area(clip(c.plan,p)??[0,0,0,0]),0),volume=a*thickness,
   mass=volume/1e9*181.5,x=mid[0]+c.ax*(c.plan[2]-c.plan[0])**2/(12*thickness),y=mid[1]+c.ay*(c.plan[3]-c.plan[1])**2/(12*thickness)
  if(thickness<=0||Math.abs(covered-a)>1e-5)throw Error('Every F bed facet requires real RC beneath its whole footprint')
  return{id:c.id+'/unfaced-F',planMinMaxMm:c.plan,bottomMm:rc.zMm[1],topPlaneABC:[c.ax,c.ay,c.surface(0,0)-c.offset],thicknessRangeMm:[Math.min(...depths),Math.max(...depths)],volumeMm3:volume,massUpperKg:mass,originMm:[x,y,rc.zMm[1]],wrenchKN_KNm:{Fx:0,Fy:0,Fz:-mass*9.81/1000,Mx:0,My:0,Mz:0},wholeFacetDirectRCCoverage:true,subtractNormalSheetPrismIds:stepNotches.filter(n=>clip(c.plan,n.planMinMaxMm)).map(n=>n.id),volumeIsUnnotchedConservativeUpper:true}
 })
 // Larger stock pieces carry a machined, piecewise planar upper face. Thin
 // hydraulic facet strips are not misrepresented as sub-150mm insulation tiles.
 const rows=Math.ceil(p[3]/450),rowH=p[3]/rows,cols=Math.ceil(p[2]/600),colW=p[2]/cols,tiles=[]
 for(let row=0;row<rows;row++){
  const cuts=[r[0],...Array.from({length:cols+(row%2)},(_,k)=>r[0]+(row%2?(k+.5):k+1)*colW).filter(x=>x>r[0]&&x<r[2]),r[2]]
  for(let k=1;k<cuts.length;k++){
   const plan=[cuts[k-1],r[1]+row*rowH,cuts[k],r[1]+(row+1)*rowH]as const,facets=cells.flatMap(c=>{const q=clip(plan,c.plan);return q?[{panFacet:c.id,planMinMaxMm:q,topPlaneABC:[c.ax,c.ay,c.surface(0,0)-c.offset]}]:[]})
   tiles.push({id:'Plant/unfaced-F-tile/'+row+'/'+k,planMinMaxMm:plan,stockBlankMm:[600,450,d.stockThicknessMm],minimumInfillMm:Math.min(plan[2]-plan[0],rowH),stockBlankMassUpperKg:600*450*d.stockThicknessMm/1e9*181.5,facets,subtractNormalSheetPrismIds:stepNotches.filter(n=>clip(plan,n.planMinMaxMm)).map(n=>n.id),eachFacetIsMachinedIntoThisLargerPiece:true,matchedSurveyAndFabricationAccepted:false})
  }
 }
 const minimumThickness=Math.min(...bedFacets.map(f=>f.thicknessRangeMm[0])),maximumThickness=Math.max(...bedFacets.map(f=>f.thicknessRangeMm[1])),feet=i.parts.filter(p=>['solid-foot-pad','apparatus-stand-pad','bridge-pad'].includes(p.kind)).map(foot=>{
  const b=foot.boxMm,designN=foot.compressionDesignN??i.footDesignN
  if(d.minimumMachinedFootThicknessMm<b[5]-1e-8)throw Error('Matched foot cannot be machined thinner than the same selected complete steel pad')
  const plan=[b[0],b[1],b[0]+b[3],b[1]+b[4]]as const,hits=cells.flatMap(c=>{const p=clip(plan,c.plan);return p?[{cell:c,plan:p}]:[]}),covered=hits.reduce((n,h)=>n+area(h.plan),0)
  if(Math.abs(covered-area(plan))>1e-5)return{id:foot.id,necessaryMatchedContact:false,outsidePanReceiverRequired:true,actualReceiverAccepted:false}
  const maximum=Math.max(...hits.flatMap(h=>corners(h.plan).map(p=>h.cell.surface(p[0],p[1])))),minimum=Math.min(...hits.flatMap(h=>corners(h.plan).map(p=>h.cell.surface(p[0],p[1])))),top=maximum+d.minimumMachinedFootThicknessMm,
   before=foot.metalVolumeMm3,exactVolume=hits.reduce((n,h)=>n+area(h.plan)*(top-h.cell.surface((h.plan[0]+h.plan[2])/2,(h.plan[1]+h.plan[3])/2)),0),
   postId=foot.id.includes('/bridge-foot/')?foot.id.replace('/bridge-foot/','/bridge-post/'):foot.id.includes('/foot/')?foot.id.replace('/foot/','/post/'):foot.id.replace(/\/foot$/,'/post'),post=i.parts.find(p=>p.id===postId)
  if(!post)throw Error('Matched foot has no actual same-assembly post')
  const oldPost=post.boxMm,postTop=oldPost[2]+oldPost[5],newLength=postTop-top
  if(newLength<=0)throw Error('Actual matched pan has no positive post length')
  foot.boxMm=[b[0],b[1],minimum,b[3],b[4],top-minimum];foot.metalVolumeMm3=exactVolume
  post.boxMm=[oldPost[0],oldPost[1],top,oldPost[3],oldPost[4],newLength];post.metalVolumeMm3*=newLength/oldPost[5]
  const slope=Math.max(...hits.map(h=>Math.hypot(h.cell.ax,h.cell.ay))),footMass=exactVolume/1e9*i.steelDensityKgM3,
   pressure=designN/(area(plan)*d.minimumEffectiveContactFraction)*1000+Math.max(0,i.maximumWaterMm-minimum)*9.81/1000+c.panMetalMm/1000*c.panDensityKgM3*9.81/1000+footMass*9.81/(area(plan)/1e6)/1000+181.5*Math.max(...bedFacets.map(f=>f.thicknessRangeMm[1]))/1000*9.81/1000
  return{id:foot.id,postId,necessaryMatchedContact:true,outsidePanReceiverRequired:false,footPlanMinMaxMm:plan,matchedFacetContacts:hits.map(h=>({panFacet:h.cell.id,planMinMaxMm:h.plan,bottomPlaneABC:[h.cell.ax,h.cell.ay,h.cell.surface(0,0)]})),steelTopMm:top,footThicknessRangeMm:[d.minimumMachinedFootThicknessMm,top-minimum],exactMetalVolumeMm3:exactVolume,metalMassChangeKg:(exactVolume-before)/1e9*i.steelDensityKgM3,actualPostLengthMm:newLength,designN,normalMomentBoundsNm:foot.compressionMomentBoundsNm??null,momentDistributionExcludedFromConditionalMeanPressure:true,positiveNDoesNotProveFullContactOrNoAnchor:!!foot.compressionMomentBoundsNm,bedCompressiveMeanKPa:pressure,contactFractionRequirement:d.minimumEffectiveContactFraction,uniformPressureDistributionIsAuthoredRequirementOnly:true,actualPeakContactPressureAccepted:false,workingLimitKPa:1558/d.compressiveWorkingFactor,creepComparisonKPa:600,necessaryWorkingPressureComparison:pressure<=1558/d.compressiveWorkingFactor&&pressure<=600,slopeHorizontalDemandUpperN:designN*slope,positiveLateralRetentionAccepted:false,fullAreaContactAndPanLocalContactAccepted:false,actualReceiverAccepted:false}
 })
 const mass=bedFacets.reduce((n,f)=>n+f.massUpperKg,0)
 return{schema:'had-plant-matched-pan-compression/1',floorCaseDigest:actual.plantCompression.caseDigest,sourceDigest:sha256SemanticFingerprint({context:c,roomPlanMm:p,maximumWaterMm:i.maximumWaterMm,footDesignN:i.footDesignN}),source:{pds:'https://www.foamglas.com/-/media/project/foamglas/public/shared/files/foamglas-b/foamglas-f/pds/pds-foamglas-f-uk.pdf',date:'2025-04-02',unfacedSlabOnly:true,organicFacingsOrAdhesiveAdopted:false,slabMm:[600,450],thicknessToleranceMm:2,densityUpperKgM3:181.5,characteristicCompressionKPa:1558,creepTestKPa:600,conductivityUpperWmK:.050},bedFacets,tiles,stepNotches,physicalBedGeometry:'Union of facet-bounded bed cells MINUS the actual normal-thickness internal pan-step prisms; cut each larger stock tile against that same constructive solid.',normalOriginsUseUnnotchedUpperStock:true,actualNetMachinedVolumeM3:null,feet,normalMassUpperKg:mass,bedVolumeM3IsUnnotchedConservativeUpper:true,bedVolumeM3:bedFacets.reduce((n,f)=>n+f.volumeMm3,0)/1e9,thicknessRangeMm:[minimumThickness,maximumThickness],necessaryStockEnvelope:minimumThickness>=40&&maximumThickness<=d.stockThicknessMm-2&&tiles.every(t=>t.minimumInfillMm>=150),necessaryPanFootPressureComparisons:feet.filter(f=>f.necessaryMatchedContact).every(f=>'necessaryWorkingPressureComparison'in f&&f.necessaryWorkingPressureComparison),normalOrigins:bedFacets.map(f=>({id:f.id,originMm:f.originMm,wrenchKN_KNm:f.wrenchKN_KNm})),necessarySourceCoreXYSeparation:actual.plantCompression.necessaryCoreXYSeparation,oldUniformGlassPhysicalGeometryRetired:actual.local.physicalUniformGlassAndServiceAndFinishRetired===true,rcMineralDeltaWrenchAboutGlobalZeroKN_KNm:actual.plantCompression.rcMineralDeltaWrenchAboutGlobalZeroKN_KNm,maximumPublished50YearCompressionAt600KPaMm:maximumThickness*.015,localDifferentialCompressionDrainageAndPanDentAccepted:false,gravityFitOnlyNoPressureSpreadingOrFrictionCredit:true,pressureComparisonScope:'Mean full-foot pressure with the required effective contact fraction. Actual peak stress distribution through pad/pan/F is not bounded by this mean calculation; no installed load rating.',actualPeakContactPressureDistributionAccepted:false,renewal:'Drain and remove the apparatus and steel members, capture and lift the continuous pan, then remove dry-laid machined insulation tiles. Record matched coordinates; no insulation piece is claimed independently accessible through an occupied pan.',actualBedMachiningFitContactWaterproofingAccepted:false,actualCoreProfileRCPlateAndColdGridTransferAccepted:false,actualCompleteSupportAccepted:false,diagnostics:['PLANT_COMPRESSION/actual-peak-contact-pressure-and-matched-foot-pan-contact-unqualified','PLANT_COMPRESSION/positive-lateral-retention-required','PLANT_COMPRESSION/long-term-differential-compression-and-pan-drainage-unqualified','PLANT_COMPRESSION/exterior-bridge-receivers-separate','PLANT_COMPRESSION/fresh-current-floor-contact-and-whole-house-gravity-required']}
}

function applyUnifiedPlatform(i:{platform:ReturnType<typeof plantAppliancePlatform>;control:NonNullable<PlantWalkControl['appliancePlatform']>;parts:Part[];panels:{id:string;planMm:P;parts:string[];completeMassDesignUpperKg:number;metalMassKg:number;barCount:number;crossBarCount:number;crossBarJointOverlapMm3:number;waterJointOverlapMm3:number}[];make:(id:string,kind:string,box:B,metal?:number,sealed?:boolean)=>Part;beamSegments:{id:string;boxMm:B;referenceMetalKg:number;hardwareBudgetKg:number;completeMassDesignUpperKg:number;actualCaptureAndEndRetainersAccepted:false}[];barBottomMm:number;beamBottomMm:number;walkingMm:number;postSection:Section;steel:PlantWalkControl['material'];hardwareEachPanelKg:number;initialWaterMm:number;maximumWaterMm:number;room:P;normalPadMm:number;walkingRailWidthMm:number;steelThermalMovementPerMm:number;settingEachMm:number;bridgeCutoutMm?:P;perimeterGapMm?:number}){
 type Q=readonly[number,number]
 const c=i.control,parts=i.parts,rho=i.steel.densityKgM3,block=c.loadedNodeBlockLWtMm,head=c.loadedHeadLWtMm,
  polygon=(a:Q,b:Q,w:number):Q[]=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]),x=-(b[1]-a[1])*w/(2*L),y=(b[0]-a[0])*w/(2*L);return[[a[0]+x,a[1]+y],[a[0]-x,a[1]-y],[b[0]-x,b[1]-y],[b[0]+x,b[1]+y]]},
  bounds=(p:readonly Q[])=>[Math.min(...p.map(q=>q[0])),Math.min(...p.map(q=>q[1])),Math.max(...p.map(q=>q[0])),Math.max(...p.map(q=>q[1]))]as const,
  rectPoly=(b:B):Q[]=>[[b[0],b[1]],[b[0]+b[3],b[1]],[b[0]+b[3],b[1]+b[4]],[b[0],b[1]+b[4]]],
  clip=(poly:readonly Q[],axis:number,bound:number,greater:boolean):Q[]=>{const out:Q[]=[];for(let k=0;k<poly.length;k++){const a=poly[k],b=poly[(k+1)%poly.length],inside=greater?a[axis]>=bound:a[axis]<=bound,next=greater?b[axis]>=bound:b[axis]<=bound;if(inside)out.push(a);if(inside!==next){const t=(bound-a[axis])/(b[axis]-a[axis]);out.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])])}}return out},
  clipRect=(poly:readonly Q[],r:readonly[number,number,number,number])=>clip(clip(clip(clip(poly,0,r[0],true),0,r[2],false),1,r[1],true),1,r[3],false),
  polyArea=(p:readonly Q[])=>Math.abs(p.reduce((n,a,k)=>{const b=p[(k+1)%p.length];return n+a[0]*b[1]-b[0]*a[1]},0))/2,
  polyPart=(id:string,kind:string,poly:readonly Q[],z:number,h:number,metal?:number)=>{const b=bounds(poly),q=i.make(id,kind,[b[0],b[1],z,b[2]-b[0],b[3]-b[1],h],metal??polyArea(poly)*h);q.planPolygonMm=poly;return q},
  nodeBlocks:Part[]=[],pickupParts:Part[]=[],checks:{id:string;value:number;limit:number;necessary:boolean}[]=[],mates:unknown[]=[]
 if(block[0]<180||block[1]<140||block[2]<60||head[2]<30||c.cutEdgeRimMm<6||c.loadedPadBlankUpperMm<44)throw Error('Real coped node blocks, strong flange/cut rims and complete blank bounds required')
 for(const n of i.platform.loadedNodes){
  const source=i.platform.chassis.find(a=>a.demand.some(q=>q.xyMm[0]===n.xyMm[0]&&q.xyMm[1]===n.xyMm[1]))!,buffer=source.supportMode==='buffer-four-gravity',footLW=buffer?c.bufferFootPlanMm:[c.loadedPadSideMm,c.loadedPadSideMm],
   foot=parts.find(p=>p.kind==='solid-foot-pad'&&Math.abs(p.boxMm[0]+p.boxMm[3]/2-n.xyMm[0])<1e-6&&Math.abs(p.boxMm[1]+p.boxMm[4]/2-n.xyMm[1])<1e-6)
  if(!foot)throw Error('Loaded appliance node must be one existing unified platform foot')
  const suffix=foot.id.slice('Plant/foot/'.length),post=parts.find(p=>p.id==='Plant/post/'+suffix)!,oldHead=parts.find(p=>p.id==='Plant/head-plate/'+suffix)!,old=foot.boxMm,[x,y]=n.xyMm,blockZ=i.barBottomMm-block[2],headZ=blockZ-head[2]
  foot.boxMm=[x-footLW[0]/2,y-footLW[1]/2,old[2],footLW[0],footLW[1],c.loadedPadMinimumThicknessMm];foot.metalVolumeMm3=footLW[0]*footLW[1]*c.loadedPadMinimumThicknessMm;foot.compressionDesignN=n.compressionN
  const pb=post.boxMm,newH=headZ-pb[2]
  if(newH<=0)throw Error('Unified node has no real compression post below its block/head')
  post.boxMm=[pb[0],pb[1],pb[2],pb[3],pb[4],newH];post.metalVolumeMm3*=newH/pb[5]
  oldHead.boxMm=[x-head[0]/2,y-head[1]/2,headZ,...head];oldHead.metalVolumeMm3=volume(oldHead.boxMm)
  const id='Plant/unified-node/'+suffix,b=i.make(id,'unified-node-block',[x-block[0]/2,y-block[1]/2,blockZ,...block])
  // Actual positive shelves: floor-rail ends enter60mm-deep pockets; central
  //60mm solid web retains a direct compression path to the post head.
  const pocketZ=i.beamBottomMm,depth=i.barBottomMm-pocketZ,pocketWidth=i.walkingRailWidthMm+2*c.railPocketSideClearanceMm
  if(c.railPocketSideClearanceMm<25||block[1]<pocketWidth+40)throw Error('Node pockets must preserve independent rail/node settings and real side walls')
  b.subtractBoxesMm=[[x-block[0]/2,y-pocketWidth/2,pocketZ,(block[0]-60)/2,pocketWidth,depth],[x+30,y-pocketWidth/2,pocketZ,(block[0]-60)/2,pocketWidth,depth]]
  nodeBlocks.push(b)
  const pickup=i.make(id+'/factory-pickup','unified-factory-pickup',[x-c.pickupSideMm/2,y-c.pickupSideMm/2,i.barBottomMm,c.pickupSideMm,c.pickupSideMm,(i.walkingMm-i.barBottomMm)])
  pickupParts.push(pickup)
  mates.push({id,postHeadTopMm:headZ+head[2],blockBottomMm:blockZ,blockTopMm:i.barBottomMm,pickupBottomMm:i.barBottomMm,bodyBearingTopMm:pickup.boxMm[2]+pickup.boxMm[5],walkingRailPocketWidthMm:pocketWidth,walkingRailWidthMm:i.walkingRailWidthMm,lateralGapEachMm:c.railPocketSideClearanceMm,lateralAfterTwoSettingsMm:c.railPocketSideClearanceMm-2*i.settingEachMm,nominalRailSeatMm:(block[0]-60)/2,seatAfterTwoSettingsMm:(block[0]-60)/2-2*i.settingEachMm,verticalCompressionGapMm:0,actualBoltsBearingCaptureAndToleranceAccepted:false})
  for(const[axis,w,l]of[[0,head[0],head[1]],[1,head[1],head[0]]]as const){const stress=6*n.compressionN*((w-i.postSection[axis])/2+2*i.settingEachMm)/(l*head[2]**2);checks.push({id:id+'/head-strip/'+axis,value:stress,limit:i.steel.allowableComparisonMPa,necessary:stress<=i.steel.allowableComparisonMPa})}
  checks.push({id:id+'/post-axial',value:n.compressionN/section(i.postSection).area,limit:i.steel.allowableComparisonMPa,necessary:n.compressionN/section(i.postSection).area<=i.steel.allowableComparisonMPa})
 }
 // Rail stocks are shortened to the central pocket faces, not left intersecting
 // completed node blocks. The pockets are actual subtractive mating geometry.
 for(const p of [...parts].filter(p=>p.kind==='solid-beam')){
  let intervals:[[number,number]]|[number,number][]=[[p.boxMm[0],p.boxMm[0]+p.boxMm[3]]]
  for(const b of nodeBlocks)if(p.boxMm[1]+p.boxMm[4]>b.boxMm[1]&&p.boxMm[1]<b.boxMm[1]+b.boxMm[4]){const centre=b.boxMm[0]+b.boxMm[3]/2,lo=centre-30,hi=centre+30;intervals=intervals.flatMap(([a,z])=>z<=lo||a>=hi?[[a,z]as[number,number]]:[...(a<lo?[[a,lo]as[number,number]]:[]),...(z>hi?[[hi,z]as[number,number]]:[])])}
  if(intervals.length===1&&intervals[0][0]===p.boxMm[0]&&intervals[0][1]===p.boxMm[0]+p.boxMm[3])continue
  parts.splice(parts.indexOf(p),1)
  for(const[k,[a,z]]of intervals.entries())if(z>a)i.make(p.id+'/coped/'+k,p.kind,[a,p.boxMm[1],p.boxMm[2],z-a,p.boxMm[4],p.boxMm[5]])
 }
 const webs:Part[]=[...pickupParts],flanges:Part[]=[...nodeBlocks],newChassisParts:Part[]=[]
 for(const a of i.platform.chassis)for(const e of a.edges){
  const poly=polygon(e.startXYMm,e.endXYMm,e.webWHMm[0]),web=polyPart(e.id+'/web','unified-chassis-web',poly,e.webTopMm-e.webWHMm[1],e.webWHMm[1]);web.subtractBoxesMm=[];web.axisStartEndXYMm=[e.startXYMm,e.endXYMm]
  // Cradle webs are ABOVE walking floor. They do not trim or partition any
  // floor panel; pickup-only node holes are the sole active grate cutouts.
  newChassisParts.push(web)
 } 
 for(const a of i.platform.chassis)for(const q of a.ledges){const p=i.make(q.id,'unified-cradle-side-ledge',q.boxMm);newChassisParts.push(p)}

 const union=(rows:readonly[number,number][])=>{const out:[number,number][]=[];for(const r of [...rows].sort((a,b)=>a[0]-b[0])){const last=out.at(-1);if(last&&r[0]<=last[1])last[1]=Math.max(last[1],r[1]);else out.push([r[0],r[1]])}return out},
  perimeter=i.perimeterGapMm?i.perimeterGapMm-.5:0,edgePolys=perimeter?[[i.room[0],i.room[1],perimeter,i.room[3]],[i.room[0]+i.room[2]-perimeter,i.room[1],perimeter,i.room[3]],[i.room[0],i.room[1],i.room[2],perimeter],[i.room[0],i.room[1]+i.room[3]-perimeter,i.room[2],perimeter]].map(p=>rectPoly([p[0],p[1],i.barBottomMm,p[2],p[3],i.walkingMm-i.barBottomMm])):[],
  cuts:unknown[]=[],cutPanelIds=new Set<string>(),allWebPolys=[...webs.map(p=>p.planPolygonMm??rectPoly(p.boxMm)),...(i.bridgeCutoutMm?[rectPoly([i.bridgeCutoutMm[0],i.bridgeCutoutMm[1],i.barBottomMm,i.bridgeCutoutMm[2],i.bridgeCutoutMm[3],i.walkingMm-i.barBottomMm])]:[]),...edgePolys]
 for(const p of [...parts].filter(p=>p.kind==='grate')){
  const b=p.boxMm,axis=b[3]>=b[4]?0:1,short=1-axis,polyRange:[number,number][]=[]
  for(const poly of allWebPolys){const q=clip(clip(poly,short,b[short],true),short,b[short]+b[short+3],false);if(q.length>=3&&polyArea(q)>1e-9){const lo=Math.max(b[axis],Math.min(...q.map(v=>v[axis]))-.5),hi=Math.min(b[axis]+b[axis+3],Math.max(...q.map(v=>v[axis]))+.5);if(hi>lo)polyRange.push([lo,hi])}}
  const remove=union(polyRange)
  if(!remove.length)continue
  const panel=i.panels.find(q=>q.parts.includes(p.id))!
  if(!panel)throw Error('Actual grate member has no owning panel')
  cutPanelIds.add(panel.id);parts.splice(parts.indexOf(p),1);panel.parts=panel.parts.filter(id=>id!==p.id)
  let cursor=b[axis]
  for(const[k,[lo,hi]]of [...remove,[b[axis]+b[axis+3],b[axis]+b[axis+3]]as[number,number]].entries()){
   if(lo>cursor){const q=[...b]as[number,number,number,number,number,number];q[axis]=cursor;q[axis+3]=lo-cursor;const part=i.make(p.id+'/trim/'+k,p.kind,q);panel.parts.push(part.id)}
   cursor=Math.max(cursor,hi)
  }
  cuts.push({part:p.id,panel:panel.id,axis,removedIntervalsMm:remove,newBarEndsDirectlyOnSameChassisSeatFlanges:true,settingAllowanceEachMm:i.settingEachMm,actualFactoryWeldedTrimmedPanelAccepted:false})
 }
 // Continuous factory cut-edge rims connect the cut bars into renewable panel
 // units. Every rim is cut from the same web boundary; intersecting solid webs
 // are explicit subtractive geometry, not an invisible double physical stock.
 for(const panel of i.panels)if(cutPanelIds.has(panel.id)){
  const inner=i.perimeterGapMm??0,R=[Math.max(panel.planMm[0],i.room[0]+inner),Math.max(panel.planMm[1],i.room[1]+inner),Math.min(panel.planMm[0]+panel.planMm[2],i.room[0]+i.room[2]-inner),Math.min(panel.planMm[1]+panel.planMm[3],i.room[1]+i.room[3]-inner)]as const
  for(const[wi,poly]of allWebPolys.entries())for(let k=0;k<poly.length;k++){
   const a=poly[k],z=poly[(k+1)%poly.length],dx=z[0]-a[0],dy=z[1]-a[1],L=Math.hypot(dx,dy);if(L<=1e-8)continue
   const sign=poly.reduce((n,p,j)=>{const q=poly[(j+1)%poly.length];return n+p[0]*q[1]-q[0]*p[1]},0)>=0?1:-1,nx=sign*dy/L,ny=-sign*dx/L,gap=.5,t=c.cutEdgeRimMm,
    edge=clipRect([[a[0]+nx*gap,a[1]+ny*gap],[z[0]+nx*gap,z[1]+ny*gap],[z[0]+nx*(gap+t),z[1]+ny*(gap+t)],[a[0]+nx*(gap+t),a[1]+ny*(gap+t)]],R)
   if(edge.length<3||polyArea(edge)<1e-7)continue
   if(i.bridgeCutoutMm||i.perimeterGapMm){
    const trueRect=(p:readonly Q[])=>{const r=bounds(p);if(new Set(p.map(q=>q[0]+','+q[1])).size!==4||Math.abs(polyArea(p)-(r[2]-r[0])*(r[3]-r[1]))>1e-6||p.some(q=>q[0]!==r[0]&&q[0]!==r[2]||q[1]!==r[1]&&q[1]!==r[3]))throw Error('Current rim splitting requires actual rectangular polygons, never filled polygon bounding boxes');return r},
     plans=plantGrateRimOutsideExclusions({planMinMaxMm:trueRect(edge),excludedPlanMinMaxMm:allWebPolys.map(trueRect),clearanceMm:gap})
    for(const[j,p]of plans.entries()){const rim=polyPart(panel.id+'/cut-edge-rim/'+wi+'/'+k+'/piece/'+j,'unified-grate-cut-rim',rectPoly([p[0],p[1],i.barBottomMm,p[2]-p[0],p[3]-p[1],i.walkingMm-i.barBottomMm]),i.barBottomMm,i.walkingMm-i.barBottomMm);panel.parts.push(rim.id)}
   }else{
    const rim=polyPart(panel.id+'/cut-edge-rim/'+wi+'/'+k,'unified-grate-cut-rim',edge,i.barBottomMm,(i.walkingMm-i.barBottomMm));rim.subtractPlanPrisms=webs.map(w=>({polygonMm:w.planPolygonMm??rectPoly(w.boxMm),zMm:w.boxMm[2],heightMm:w.boxMm[5]}));panel.parts.push(rim.id)
   }
  }
 }
 const intersect=(a:B,b:B):B|null=>{const p=[0,1,2].map(k=>Math.max(a[k],b[k])),q=[0,1,2].map(k=>Math.min(a[k]+a[k+3],b[k]+b[k+3]));return q.every((v,k)=>v>p[k])?[p[0],p[1],p[2],q[0]-p[0],q[1]-p[1],q[2]-p[2]]:null}
 let totalJointMm3=0,wetJointMm3=0
 for(const panel of i.panels){
  const local=parts.filter(p=>panel.parts.includes(p.id)),bars=local.filter(p=>p.id.includes('/bearing/')),crosses=local.filter(p=>p.id.includes('/cross/'));let overlap=0,wet=0
  for(const a of bars)for(const b of crosses){const q=intersect(a.boxMm,b.boxMm);if(q){overlap+=volume(q);wet+=clippedVolume(q,i.room,i.initialWaterMm,i.maximumWaterMm)}}
  totalJointMm3+=overlap;wetJointMm3+=wet
  panel.metalMassKg=(local.reduce((n,p)=>n+p.metalVolumeMm3,0)-overlap)/1e9*rho
  panel.completeMassDesignUpperKg=panel.metalMassKg+i.hardwareEachPanelKg+(cutPanelIds.has(panel.id)?c.additionalCutPanelHardwareKg:0)
  panel.crossBarJointOverlapMm3=overlap;panel.waterJointOverlapMm3=wet
 }
 const updated=parts.filter(p=>p.kind==='solid-beam').map(p=>({id:p.id,boxMm:p.boxMm,referenceMetalKg:p.metalVolumeMm3/1e9*rho,hardwareBudgetKg:i.hardwareEachPanelKg,completeMassDesignUpperKg:p.metalVolumeMm3/1e9*rho+i.hardwareEachPanelKg,actualCaptureAndEndRetainersAccepted:false as const}))
 i.beamSegments.splice(0,i.beamSegments.length,...updated)
 const removedLocatorIds:string[]=[]
 for(const p of [...parts].filter(p=>p.kind==='hardware')){const q=rectPoly(p.boxMm);if(allWebPolys.some(web=>polyArea(clipRect(web,[p.boxMm[0],p.boxMm[1],p.boxMm[0]+p.boxMm[3],p.boxMm[1]+p.boxMm[4]]))>1e-8)&&p.boxMm[2]+p.boxMm[5]>i.barBottomMm){removedLocatorIds.push(p.id);parts.splice(parts.indexOf(p),1)}}

 const physicalPanelPieces:{id:string;sourcePanel:string;partIds:string[];metalStockUpperKg:number;hardwareKg:number;completeMassUpperKg:number}[]=[]
 for(const panel of i.panels){
  const local=parts.filter(p=>panel.parts.includes(p.id)),remaining=new Set(local.map(p=>p.id)),components:Part[][]=[]
  for(const part of local)if(part.planPolygonMm&&Math.abs(polyArea(part.planPolygonMm)-part.boxMm[3]*part.boxMm[4])>1e-5)throw Error('Current panel connectivity proof requires actual orthogonal pickup cutouts, not diagonal AABB connectivity')
  const touch=(a:B,b:B)=>[0,1,2].every(k=>Math.max(a[k],b[k])<=Math.min(a[k]+a[k+3],b[k]+b[k+3])+1e-7)
  while(remaining.size){const id=remaining.values().next().value!,start=local.find(p=>p.id===id)!,group=[start];remaining.delete(id);for(let k=0;k<group.length;k++)for(const p of local)if(remaining.has(p.id)&&touch(group[k].boxMm,p.boxMm)){group.push(p);remaining.delete(p.id)}components.push(group)}
  for(const[k,group]of components.entries()){let overlap=0;for(const a of group.filter(p=>p.id.includes('/bearing/')))for(const b of group.filter(p=>p.id.includes('/cross/'))){const q=intersect(a.boxMm,b.boxMm);if(q)overlap+=volume(q)}const metal=(group.reduce((n,p)=>n+p.metalVolumeMm3,0)-overlap)/1e9*rho,hardware=i.hardwareEachPanelKg+(cutPanelIds.has(panel.id)?c.additionalCutPanelHardwareKg:0);physicalPanelPieces.push({id:panel.id+'/physical-piece/'+k,sourcePanel:panel.id,partIds:group.map(p=>p.id),metalStockUpperKg:metal,hardwareKg:hardware,completeMassUpperKg:metal+hardware})}
  panel.completeMassDesignUpperKg=physicalPanelPieces.filter(p=>p.sourcePanel===panel.id).reduce((n,p)=>n+p.completeMassUpperKg,0)
 }


 const normalNodeRestoringCases=i.platform.loadedNodes.map(n=>{
  const [x,y]=n.xyMm,source=i.platform.chassis.find(a=>a.nodes.some(q=>q[0]===x&&q[1]===y))!,k=source.nodes.findIndex(q=>q[0]===x&&q[1]===y),
   node=nodeBlocks.find(b=>Math.abs(b.boxMm[0]+b.boxMm[3]/2-x)<1e-7&&Math.abs(b.boxMm[1]+b.boxMm[4]/2-y)<1e-7)!,
   pickup=pickupParts.find(b=>Math.abs(b.boxMm[0]+b.boxMm[3]/2-x)<1e-7&&Math.abs(b.boxMm[1]+b.boxMm[4]/2-y)<1e-7)!,
   headVolume=c.loadedHeadLWtMm[0]*c.loadedHeadLWtMm[1]*c.loadedHeadLWtMm[2],
   pocketVolume=(node.subtractBoxesMm??[]).reduce((v,b)=>v+volume(b),0),hole=Math.max(c.mountBoltHoleMm,c.floatingHoleMm,c.slidingSlotLengthMm),
   // The central through-hole plus two pocket retainer holes are conservatively
   // subtracted as square bores. No maximum frame deadweight restores uplift.
   blockMinimumVolume=Math.max(0,volume(node.boxMm)-pocketVolume-hole**2*(block[2]+2*(block[2]-(i.barBottomMm-i.beamBottomMm)))),
   headMinimumVolume=Math.max(0,headVolume-hole**2*c.loadedHeadLWtMm[2]),pickupMinimumVolume=Math.max(0,volume(pickup.boxMm)-hole**2*pickup.boxMm[5]),
   minimumLocalKg=(blockMinimumVolume+headMinimumVolume+pickupMinimumVolume)/1e9*c.minimumSteelDensityKgM3,
   minimumLocalGravityN=minimumLocalKg*9.81,minimumBodyMountN=source.demand[k].minimumBodyMountForceN,
   minimumNormalPanCompressionN=minimumBodyMountN+minimumLocalGravityN
  return{id:source.id+'/normal-foundation/'+k,xyMm:n.xyMm,minimumDensityDesignKgM3:c.minimumSteelDensityKgM3,blockMinimumVolumeMm3:blockMinimumVolume,headMinimumVolumeMm3:headMinimumVolume,pickupMinimumVolumeMm3:pickupMinimumVolume,minimumOwnLocalMetalKg:minimumLocalKg,minimumOwnLocalGravityN:minimumLocalGravityN,minimumSignedBodyMountN:minimumBodyMountN,normalBodyBoltTensionDemandN:source.demand[k].normalChassisTensionN,minimumNormalPanCompressionN,necessaryNoNormalFloorAnchor:minimumNormalPanCompressionN>=0,sourceFactoryBodyBoltsToThreadedNodeReceiversRequired:true,actualM12ThreadToolsAndFaultCapacityAccepted:false,globalUpperFrameDeadNeverUsedAsRestoring:true}
 })
 const footPanClearances=parts.filter(p=>p.kind==='solid-foot-pad').flatMap(p=>{const b=p.boxMm,gaps=[b[0]-i.room[0],i.room[0]+i.room[2]-b[0]-b[3],b[1]-i.room[1],i.room[1]+i.room[3]-b[1]-b[4]],cover=[2*i.settingEachMm+2*i.room[2]*i.steelThermalMovementPerMm,2*i.settingEachMm+2*i.room[3]*i.steelThermalMovementPerMm];return gaps.map((g,k)=>({id:p.id+'/actual-pan-edge/'+k,nominalGapMm:g,requiredCoverMm:cover[k<2?0:1],afterSettingsAndSteelThermalMm:g-cover[k<2?0:1],sourcePanAndPlatformIndependentSettingsRetained:true,actualMeasuredFactoryFitAccepted:false}))})
 const apparatusBlockedPanelIds=i.panels.filter(p=>i.platform.chassis.some(a=>{const r=a.homePlanMm;return p.planMm[0]<r[0]+r[2]&&p.planMm[0]+p.planMm[2]>r[0]&&p.planMm[1]<r[1]+r[3]&&p.planMm[1]+p.planMm[3]>r[1]})).map(p=>p.id)
 return{schema:'had-unified-platform-details/1',normalNodeRestoringCases,footPanClearances,physicalPanelPieces,finalDemandBasis:null as null|{maximumCompletePhysicalPanelKg:number;maximumContainerAllPiecesKg:number;maximumCompleteRailSegmentKg:number;frameDeadAtOneNodeN:number;loadedNodeKitGravityBoundN:number;allDemandRecomputedAfterActualCutRimsAndStocks:boolean},retiredIndependentPedestalCount:i.platform.retiredIndependentPedestalCount,loadedNodeBlocks:nodeBlocks.map(p=>p.id),bodyPickupParts:pickupParts.map(p=>p.id),actualCompressionMates:mates,chassisPartIds:newChassisParts.map(p=>p.id),cutBars:cuts,trimmedPanelIds:[...cutPanelIds],removedObstructedLocatorIds:removedLocatorIds,apparatusBlockedPanelIds,totalJointMm3,wetJointMm3,additionalCutHardwareKg:physicalPanelPieces.reduce((n,p)=>n+p.hardwareKg,0)-i.panels.length*i.hardwareEachPanelKg,componentChecks:checks,necessaryNodeComponentComparisons:checks.every(c=>c.necessary),physicalGeometry:'Union of coped node blocks, actual shortened rail ends and swept chassis profiles. Each declared pocket/cope is removed from its owning solid. Gross joined stock remains conservative G and water-displacement upper; intersection material is never extra capacity.',actualTrimmedPanelLocatorsFactoryRimWeldsToolsAndFirstRestAccepted:false,actualBoltedNodeShelfAndPickupConnectionsAccepted:false,pressureSeizedGuideSwayAndWholePlatformHoldDownAccepted:false,actualCompleteInstallationAccepted:false,renewal:'Isolate/cool/drain and remove the one apparatus before releasing its chassis or obscured trimmed panels. Retain the other full apparatus and aisle-wheel case. Capture each member mechanically before releasing bolts; no manual handling qualification is inferred from a mass budget.'}
}

/** A different physical assembly and result identity from the old F-under-foot
 * comparison. Only matched steel geometry is shared in meaning; no old F stress
 * receipt, pressure spreading, contact stiffness or approval is transferred. */
export function plantRcOverUniformFPanSupport(i:{context:PlantPanCompressionSupport;roomPlanMm:P;parts:Part[];maximumWaterMm:number;footDesignN:number;steelDensityKgM3:number}){
 const c=i.context,actual=c.floorCase
 if(!actual.local||!('plantCompression'in actual)||!actual.plantCompression?.rcOverUniformF)throw Error('Actual optional RC-over-uniform-F floor result required')
 const floor=actual.plantCompression.rcOverUniformF,replay=inletRoomPocket(actual.plantCompression.resolvedInput),stack=floor.choice,rc=actual.local.levelBoxes.find(p=>p.id==='dryRC')!,top=rc.zMm[1],p=i.roomPlanMm
 if(sha256SemanticFingerprint(replay)!==sha256SemanticFingerprint(actual)||JSON.stringify(actual.local.roomMinMaxMm)!==JSON.stringify([p[0],p[1],p[0]+p[2],p[1]+p[3]]))throw Error('New support assembly must replay the SAME actual floor and room')
 type R=readonly[number,number,number,number]
 const A=(r:R)=>(r[2]-r[0])*(r[3]-r[1]),corners=(r:R)=>[[r[0],r[1]],[r[2],r[1]],[r[2],r[3]],[r[0],r[3]]],
  clip=(a:R,b:R):R|null=>{const r=[Math.max(a[0],b[0]),Math.max(a[1],b[1]),Math.min(a[2],b[2]),Math.min(a[3],b[3])]as const;return r[2]>r[0]&&r[3]>r[1]?r:null},
  room=[p[0],p[1],p[0]+p[2],p[1]+p[3]]as const,rcPlans=rc.planRectanglesXYMm??[rc.planMinMaxMm],
  cells=c.panCells.map(q=>{
   if(q.cornersMm.length!==4||q.cornersMm.some(p=>p.length!==3||!finite(p)))throw Error('Actual four-corner pan facets required')
   const pts=q.cornersMm,[a,b,e]=pts,u=b.map((v,k)=>v-a[k]),v=e.map((z,k)=>z-a[k]),det=u[0]*v[1]-u[1]*v[0]
   if(Math.abs(det)<1e-8)throw Error('Degenerate actual pan facet')
   const ax=(u[2]*v[1]-v[2]*u[1])/det,ay=(u[0]*v[2]-v[0]*u[2])/det,cc=a[2]-ax*a[0]-ay*a[1],plan=[Math.min(...pts.map(p=>p[0])),Math.min(...pts.map(p=>p[1])),Math.max(...pts.map(p=>p[0])),Math.max(...pts.map(p=>p[1]))]as const,surface=(x:number,y:number)=>ax*x+ay*y+cc,offset=c.panMetalMm*Math.sqrt(1+ax*ax+ay*ay)
   if(pts.some(p=>Math.abs(p[2]-surface(p[0],p[1]))>1e-7)||corners(plan).some(p=>!pts.some(q=>q[0]===p[0]&&q[1]===p[1])))throw Error('Only true rectangular planar pan facets supported')
   return{id:q.id,plan,ax,ay,cc,surface,offset}
  })
 if(Math.abs(cells.reduce((n,c)=>n+A(c.plan),0)-A(room))>1e-5)throw Error('Actual pan facets must cover this whole RC plan')
 for(let a=0;a<cells.length;a++)for(let b=a+1;b<cells.length;b++)if(clip(cells[a].plan,cells[b].plan))throw Error('Actual pan facets overlap')
 const stepNotches=c.panInternalStepFaces.map(f=>{
  if(f.cornersMm.length!==4||f.normal.length!==3||f.normal[2]!==0||Math.abs(f.normal[0])+Math.abs(f.normal[1])!==1)throw Error('Actual orthogonal pan step prism required')
  const points=[...f.cornersMm,...f.cornersMm.map(p=>p.map((v,k)=>v+f.normal[k]*c.panMetalMm))]
  return{id:f.id+'/mineral-bed-normal-notch',sourceFaceId:f.id,normal:f.normal,extrusionMm:c.panMetalMm,solidCornersMm:points,planMinMaxMm:[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))]as const,actualSubtractiveGeometry:true}
 }),bedFacets=cells.map(c=>{
  const depths=corners(c.plan).map(p=>c.surface(p[0],p[1])-c.offset-top),minimum=Math.min(...depths),maximum=Math.max(...depths),mid=[(c.plan[0]+c.plan[2])/2,(c.plan[1]+c.plan[3])/2],mean=c.surface(mid[0],mid[1])-c.offset-top,area=A(c.plan),covered=rcPlans.reduce((n,p)=>n+A(clip(c.plan,p)??[0,0,0,0]),0),V=area*mean/1e9,mass=V*stack.bedding.densityKNm3/9.81*1000
  if(minimum<=0||Math.abs(covered-area)>1e-5)throw Error('Real graded mineral bed requires positive depth and full actual RC beneath every facet')
  return{id:c.id+'/engineered-mineral-bed',planMinMaxMm:c.plan,bottomMm:top,topPlaneABC:[c.ax,c.ay,c.cc-c.offset],thicknessRangeMm:[minimum,maximum],volumeM3Upper:V,massUpperKg:mass,originMm:[mid[0]+c.ax*(c.plan[2]-c.plan[0])**2/(12*mean),mid[1]+c.ay*(c.plan[3]-c.plan[1])**2/(12*mean),top+mean/2+(c.ax**2*(c.plan[2]-c.plan[0])**2+c.ay**2*(c.plan[3]-c.plan[1])**2)/(24*mean)],subtractNormalSheetPrismIds:stepNotches.filter(s=>clip(c.plan,s.planMinMaxMm)).map(s=>s.id),unnotchedGUpperWithoutVoidCredit:true}
 }),feet=i.parts.filter(p=>['solid-foot-pad','bridge-pad','apparatus-stand-pad'].includes(p.kind)).map(foot=>{
  const b=foot.boxMm,plan=[b[0],b[1],b[0]+b[3],b[1]+b[4]]as const,hits=cells.flatMap(cell=>{const planClip=clip(plan,cell.plan);return planClip?[{cell,plan:planClip}]:[]}),covered=hits.reduce((n,h)=>n+A(h.plan),0),designN=foot.compressionDesignN??i.footDesignN,moments=foot.compressionMomentBoundsNm??null
  if(Math.abs(covered-A(plan))>1e-5)return{id:foot.id,outsidePanReceiverRequired:true,necessaryMatchedContact:false,designN,normalMomentBoundsNm:moments,actualExternalReceiverAccepted:false}
  const levels=hits.flatMap(h=>corners(h.plan).map(p=>h.cell.surface(p[0],p[1]))),minimum=Math.min(...levels),steelTop=Math.max(...levels)+c.design.minimumMachinedFootThicknessMm,metal=hits.reduce((n,h)=>n+A(h.plan)*(steelTop-h.cell.surface((h.plan[0]+h.plan[2])/2,(h.plan[1]+h.plan[3])/2)),0),
   postId=foot.id.includes('/bridge-foot/')?foot.id.replace('/bridge-foot/','/bridge-post/'):foot.id.includes('/foot/')?foot.id.replace('/foot/','/post/'):foot.id.replace(/\/foot$/,'/post'),post=i.parts.find(p=>p.id===postId)
  if(!post)throw Error('New bed matching requires its actual same-source steel post')
  const old=post.boxMm,postTop=old[2]+old[5],length=postTop-steelTop
  if(length<=0)throw Error('Matched new bed leaves no positive post length')
  foot.boxMm=[b[0],b[1],minimum,b[3],b[4],steelTop-minimum];foot.metalVolumeMm3=metal
  post.boxMm=[old[0],old[1],steelTop,old[3],old[4],length];post.metalVolumeMm3*=length/old[5]
  const mean=designN/A(plan)
  return{id:foot.id,postId,outsidePanReceiverRequired:false,necessaryMatchedContact:true,footPlanMinMaxMm:plan,steelTopMm:steelTop,footThicknessRangeMm:[c.design.minimumMachinedFootThicknessMm,steelTop-minimum],exactMetalVolumeMm3:metal,actualPostLengthMm:length,designN,normalMomentBoundsNm:moments,matchedFacetContacts:hits.map(h=>({panFacet:h.cell.id,planMinMaxMm:h.plan,bottomPlaneABC:[h.cell.ax,h.cell.ay,h.cell.cc]})),mineralMeanPressureMPa:mean,mineralCompressionDesignRequirementMPa:stack.bedding.minimumCompressiveMPa,necessaryMeanOnlyMineralScreen:mean<=stack.bedding.minimumCompressiveMPa/3,actualMomentContactPeakPanLocalResistanceAndGlobalStabilityAccepted:false,scalarFootLoadIsNotFStress:true}
 })
 return{schema:'had-Plant-rc-over-uniform-F-pan-support/1',sourceDigest:sha256SemanticFingerprint(i.context),floorCaseDigest:actual.plantCompression.caseDigest,bedKind:'engineered-all-mineral-over-spanning-RC',materialDesign:{...stack.bedding,allConstituentsInorganicRequired:true,looseSandPerformanceNotAssumed:true,actualMixStrengthCreepMoistureAndConstructionAccepted:false},bedFacets,stepNotches,gradedBeddingMassUpperKg:bedFacets.reduce((n,f)=>n+f.massUpperKg,0),gradedBeddingVolumeUpperM3:bedFacets.reduce((n,f)=>n+f.volumeM3Upper,0),beddingThicknessRangeMm:[Math.min(...bedFacets.map(f=>f.thicknessRangeMm[0])),Math.max(...bedFacets.map(f=>f.thicknessRangeMm[1]))],feet,necessarySteelMatching:feet.filter(f=>!f.outsidePanReceiverRequired).every(f=>f.necessaryMatchedContact),necessaryMineralMeanScreen:feet.filter(f=>!f.outsidePanReceiverRequired).every(f=>'necessaryMeanOnlyMineralScreen'in f&&f.necessaryMeanOnlyMineralScreen),normalOrigins:bedFacets.map(f=>({id:f.id+'/G',originMm:f.originMm,wrenchKN_KNm:{Fx:0,Fy:0,Fz:-f.massUpperKg*9.81/1000,Mx:0,My:0,Mz:0}})),FAndRetentionAlreadyCountedInFloorOrigins:true,oldFUnderFootPressureResultApplies:false,uniformFContactMask:floor.loadBearingContactPlans,uniformFGrossContactM2:floor.contactUnionM2,uniformFNetContactM2:floor.netInsulationContactM2,uniformFMaterial:plantUnfacedF2025,retention:floor.retention,actualRCSpanningCageUnilateralFPressureAndColdGridAccepted:false,actualPerFootWrenchContactAndFrameStabilityAccepted:false,renewal:'Initial-build precast structural panel with captured soffit F is installed before house closure. The500kg service-cargo route does not qualify structural-panel or buried soffit renewal.',diagnostics:['PLANT_RC_OVER_F/actual-RC-span-cage-and-net-F-contact-distribution-unqualified','PLANT_RC_OVER_F/graded-mineral-mix-and-moment-contact-unqualified','PLANT_RC_OVER_F/cast-retainers-construction-thermal-and-buried-renewal-unqualified','PLANT_RC_OVER_F/fresh-current-house-profile-and-gravity-required']}
}
