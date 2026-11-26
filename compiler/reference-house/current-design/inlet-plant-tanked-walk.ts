import {sha256SemanticFingerprint} from '../../core/identity.js'
type B=readonly[number,number,number,number,number,number]
type P=readonly[number,number,number,number]
type Section=readonly[number,number,number]
export type PlantWalkControl={
 schema:string;id:string;walkingRiseAboveHouseFflMm:number;bridgeAboveWalkingMm:number
 material:{densityKgM3:number;elasticModulusMPa:number;allowableComparisonMPa:number;thermalExpansionPerK?:number}
 grating:{bearingBarHeightMm:number;bearingBarThicknessMm:number;bearingBarPitchMm:number;crossBarHeightMm:number;crossBarThicknessMm:number;crossBarPitchMm:number;maximumBearingSpanMm:number;maximumPanelXMm:number;maximumPanelYMm:number;rimHeightMm:number;rimThicknessMm:number;maximumCompletePanelKg:number;hardwareBudgetEachKg:number;panelJointGapMm:number;maximumRelativeSeatErrorMm?:number;locatingPinDiameterMm?:number;locatingHoleMaximumMm?:number;locatingEngagementMm?:number;maximumFactoryLocatingPositionErrorMm?:number;maximumUniformTemperatureExcursionK?:number}
 walkingFrame:{beamSectionKind?:'solid'|'rhs';maximumRemovableBeamSegmentKg?:number;headPlateLWtMm?:Section;beamSectionWHtMm:Section;minimumBeamIMm4:number;maximumBeamSpanMm:number;postSectionWHtMm:Section;footPadSideMm:number;footPadThicknessMm:number;maximumSinglePostDesignN:number}
 bridge:{thicknessMm:number;pieceCount:number;railYMm:readonly number[];railSectionWHtMm:Section;minimumRailIMm4:number;maximumRailDeflectionMm:number;crossBeamSectionWHtMm:Section;crossBeamSupportYMm:readonly[number,number];insideRailSeatXMm:number;outsideRailSeatXMm:number}
}
export type PlantWalkApparatus={id:string;source:{path:string;gitBlob:string;objectPath:string};homePlanMm:P;bodyBottomAbsoluteMm:number;bodyHeightMm:number;normalFilledMassUpperKg:number;requiredPanelLiftMm:number}
type Input={apparatus?:readonly PlantWalkApparatus[];choice:PlantWalkControl;roomPlanMm:P;houseFflMm:number;initialWaterMm:number;maximumWaterMm:number;wheelN:number;panMinimumMm:number;panMaximumMm:number;bridgeInnerXMm:number;bridgeOuterXMm:number;bridgePlateYMm:readonly[number,number];outfallRoofMaximumMm:number;sourceRoofAtExternalBeamMm?:number;settingEachMm?:number}
type Part={id:string;kind:string;boxMm:B;metalVolumeMm3:number;displacementOuterBoxRequired:boolean;installedAcceptance:false}
const volume=(b:B)=>b[3]*b[4]*b[5]
const section=(s:Section,solid=false)=>{const[w,h,t]=s;return solid?{area:w*h,I:w*h**3/12,Z:w*h**2/6}:{area:w*h-(w-2*t)*(h-2*t),I:(w*h**3-(w-2*t)*(h-2*t)**3)/12,Z:(w*h**3-(w-2*t)*(h-2*t)**3)/(6*h)}}
const finite=(a:readonly number[])=>a.every(Number.isFinite)
const between=(a:number,b:number,z:number,h:number)=>Math.max(0,Math.min(b,z+h)-Math.max(a,z))
const clippedVolume=(b:B,r:P,a:number,z:number)=>Math.max(0,Math.min(b[0]+b[3],r[0]+r[2])-Math.max(b[0],r[0]))*Math.max(0,Math.min(b[1]+b[4],r[1]+r[3])-Math.max(b[1],r[1]))*between(a,z,b[2],b[5])
const maxGap=(s:readonly number[])=>Math.max(...s.slice(1).map((v,k)=>v-s[k]))
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
 const pad=f.footPadSideMm,post=f.postSectionWHtMm,beam=f.beamSectionWHtMm,
  xs=[r[0]+pad/2,...Array.from({length:nx-1},(_,k)=>r[0]+(k+1)*px+(k+.5)*g.panelJointGapMm),r[0]+r[2]-pad/2],
  ys=[r[1]+pad/2,...Array.from({length:ny-1},(_,k)=>r[1]+(k+1)*py+(k+.5)*g.panelJointGapMm),r[1]+r[3]-pad/2],
  fBeam=section(beam,solid),fPost=section(post),beamSegments:{id:string;boxMm:B;referenceMetalKg:number;hardwareBudgetKg:number;completeMassDesignUpperKg:number;actualCaptureAndEndRetainersAccepted:false}[]=[]
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
  overhang=pad/2+two,Ib=g.bearingBarThicknessMm*g.bearingBarHeightMm**3/12,barStress=1.5*i.wheelN*bearingSpan/(g.bearingBarThicknessMm*g.bearingBarHeightMm**2),
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
 add('Plant/grate-wall-edge-cantilever','MPa',barCantilever,m.allowableComparisonMPa)
 add('Plant/grate-single-bar-deflection','mm',i.wheelN*bearingSpan**3/(48*m.elasticModulusMPa*Ib),2)
 add('Plant/frame-minimum-I-versus-sharp-geometry','mm4',f.minimumBeamIMm4,fBeam.I)
 add('Plant/frame-single-wheel-bending','MPa',beamStress,m.allowableComparisonMPa)
 add('Plant/frame-single-wheel-deflection','mm',beamDelta,2)
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
 const apparatusInterfaces=(i.apparatus??[]).map(a=>{
  const ap=a.homePlanMm
  if(!a.id||!a.source?.path||!/^[0-9a-f]{40}$/.test(a.source.gitBlob)||!a.source.objectPath||!finite([...ap,a.bodyBottomAbsoluteMm,a.bodyHeightMm,a.normalFilledMassUpperKg,a.requiredPanelLiftMm])||Math.min(ap[2],ap[3],a.bodyHeightMm,a.normalFilledMassUpperKg,a.requiredPanelLiftMm)<=0||a.bodyBottomAbsoluteMm<walk||ap[0]<r[0]||ap[1]<r[1]||ap[0]+ap[2]>r[0]+r[2]||ap[1]+ap[3]>r[1]+r[3])throw Error('Actual captured apparatus geometry, mass and absolute datum required')
  const side=120,padT=8,capT=30,postWHt=[30,30,3] as const,pv=section(postWHt),maxPostN=7000,
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
 const bruteMm3=parts.filter(p=>p.kind!=='hardware').reduce((n,p)=>n+clippedVolume(p.boxMm,r,i.initialWaterMm,i.maximumWaterMm),0),metalMm3=parts.reduce((n,p)=>n+p.metalVolumeMm3,0)-totalJointMm3,
  // Extra RHS metal/void is deliberately charged as SOLID for this normal
  // design mass upper. Actual fabrication/section tolerances remain unearned.
  fullEnvelopeMm3=parts.filter(p=>p.kind!=='hardware').reduce((n,p)=>n+(p.kind.includes('RHS')||p.kind==='RHS-beam'||p.kind==='RHS-post'?volume(p.boxMm):p.metalVolumeMm3),0)-totalJointMm3,
  hardwareKg=(panels.length+bridgePieces.length+beamSegments.length)*g.hardwareBudgetEachKg+apparatusInterfaces.reduce((n,a)=>n+('standHardwareBudgetKg'in a?(a.standHardwareBudgetKg??0):0),0),hardwareVolumeUpperL=hardwareKg/m.densityKgM3*1000,waterUpperL=(bruteMm3-wetJointMm3)/1e6+hardwareVolumeUpperL
 return{deadLoadBounds:{panelBarDeadN,frameDeadN,bridgePlateKg,bridgeRailKg,oneCrossKg,railCombinedN,crossCombinedN,footCombinedN,allDeadAtWorstPoint:true,RHSFullOuterBoxMassUpper:true},schema:'had-Plant-tanked-walking-surface/1',sourceDigest:sha256SemanticFingerprint(i),apparatusInterfaces,apparatusFilledMassUpperKg,normalMassExcludesFilledApparatus:true,parts,panels,bridgePieces,beamSegments,locators,walkingTopMm:walk,bridgeTopMm:bridgeTop,
  solidsIncrementUpperL:waterUpperL,referenceMetalKg:metalMm3/1e9*m.densityKgM3,normalMassUpperKg:fullEnvelopeMm3/1e9*m.densityKgM3+hardwareKg,
  volumeLedger:{sumFullOuterClippedMm3:bruteMm3,exactCrossBarIntersectionSubtractedMm3:wetJointMm3,joinedBridgeOrHardwareOverlapSubtracted:false,RHSVoidCountedAsSolid:true,closedDuctVoidCreditLitres:0,hardwareBelowWaterIncluded:true,apparatusGrateIntersectionsCountedTwiceConservatively:apparatusInterfaces.some(a=>'panelCutoutIntersections'in a&&!!a.panelCutoutIntersections?.length),hardwareSolidSteelVolumeUpperL:hardwareVolumeUpperL,hardwareRequirement:'Solid steel fasteners/handles only; whole mass budget counted wet. Any enclosed cavity requires a separately authored external volume bound.'},
  geometry:{panelCount:panels.length,panelSizeMm:[px,py],walkingRailSectionKind:solid?'solid':'rhs',wallParameterAppliesToWalkingRail:!solid,actualSolidSegmentFirstRestAndToolProofAccepted:false,postCentreXMm:xs,postCentreYMm:ys,panSupportLevelRangeMm:[i.panMinimumMm,i.panMaximumMm],postBoxesUseLowestPanForConservativeMass:true,actualPerFootPanContactNotInvented:true,matchedPanelSeat:{relativeErrorMm:relativeSeatError,radialFitMm:radialClearance,thermalMovementMm:thermalMovement,completeFitBudgetMm:fitBudget,minimumBearingMm:minimumSeat,requiredFirstVerticalReleaseMm:requiredFirstLift,oneRoundOneLongitudinalSlotRequired:true,locatorWeldsDoNotCutRHS:true,actualHardwareGeometryToolAndSlotQualificationAccepted:false},bearingSpanWithSettingsMm:bearingSpan,beamSpanWithSettingsMm:beamSpan,bridgeRailBottomMm:railBottom,crossBeamBottomMm:crossBottom},
  memberChecks:checks,necessaryMemberComparisons:checks.every(p=>p.necessary),memberScope:'Bars/beams, axial posts, head caps and conservative one-dimensional local-face strips. Face-strip law requires a full contact patch with pressure bounded by2x its mean; actual contact/certificates are not supplied by a global I.',actualRHSLocalFaceAndBearingLawAccepted:false,loadPaths:{wheelDesignN:i.wheelN,allWheelOnOneBarAndBeam:true,footDesignN:f.maximumSinglePostDesignN,footPressureUpperMPa:f.maximumSinglePostDesignN/pad**2,normalLoadPath:'Grating bars directly bear on actual selected steel rails; posts and aligned below-pan solids carry compression THROUGH a continuous pan. Pan bending and finish capacity are not credited.',requiredLateralAndUpliftConnections:'Positive bolted/welded retention and actual sway/rail connections must be sized; no friction or unspecified anchors are credited.'},
  renewal:{eachPanelHasIndependentGravitySupport:true,everyPanelIndependentOfApparatusRemoval:blockedPanelIds.length===0,apparatusRemovalBeforePanelIds:blockedPanelIds,actualApparatusStandCutoutAndRenewalAccepted:false,matchedLocatorsRequiredBeforeRelativeSettingCredit:true,panelsRequirePositiveCaptureBeforeRetainersRelease:true,bridgePiecesRequireSameSourceAndStoredEnergyIsolation:true,actualToolAccessQuarterTurnAndFirstRestAccepted:false,actualLateralStabilityDuringPieceRemovalAccepted:false,massLimitIsComparisonNotHumanQualification:true},
  actualRCPanSandwichBearingAndThermalBridgeAccepted:false,actualFabricationAndMaterialTemperaturePropertiesAccepted:false,actualCompleteInstallationAccepted:false,
  diagnostics:[...apparatusInterfaces.flatMap(a=>a.diagnostics),...checks.filter(q=>!q.necessary).map(q=>'PLANT_WALK/member-screen/'+q.id),'PLANT_WALK/actual-per-foot-pan-and-RC-contact-required','PLANT_WALK/RHS-local-face-web-and-contact-law-not-admitted','PLANT_WALK/actual-joints-and-lateral-stability-required','PLANT_WALK/round-slot-locators-and-12mm-capture-first-lift-required','PLANT_WALK/solid-steel-hardware-no-enclosed-void-requirement','PLANT_WALK/actual-piece-tools-and-renewal-sweeps-required','PLANT_WALK/fresh-whole-house-gravity-and-water-actions-required']}
}
