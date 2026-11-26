/** Owner-authored pressure-store interior and connections. No supplier assembly,
 * pressure rating, safety setpoint, material exception or installed fit is admitted.
 * Inputs use local occupied groundFFL; the result translates Z exactly once. */
import {sha256SemanticFingerprint} from '../../core/identity.js'
type P=readonly[number,number,number]
export type StoreVesselChoice={
 schema:'had-store-vessel/1';id:'HAD/plant-domestic-store-vessel';revision:1;units:'mm-L-kg-bar-C';datum:'local-occupied-groundFFL'
 nominalUsableLitres:number;maximumBodyAndPortsLitres:number;maximumWettedPortsAndAccessoriesLitres:number
 inner:{diameterMm:number;straightHeightMm:number;domeDepthMm:number;lowestWettedZMm:number}
 minimumInsulationMm:number;settingEachMm:number
 connections:{
  cold:{wetPointLocalMm:P;maximumFactoryBoreMm:number}
  drain:{frontOffsetYMm:number;externalAxisZMm:number;maximumFactoryBoreMm:number;maximumPickupLipMm:number;retainedBossLengthMm:number;maximumOtherRetainedCavityLitres:number}
  tAndP:{sensePointLocalMm:P;maximumProbeRadiusMm:number;maximumProbeLengthMm:number;maximumWetNeckBoreMm:number}
  immersion:{axisZMm:number;maximumElementRadiusMm:number;maximumToolRadiusMm:number;minimumTipWallReserveMm:number}
  hot:{wetPointLocalMm:P;externalPortLocalMm:P;maximumFactoryBoreMm:number;maximumTubeInsideMm:number;routeToUpperTreeLocalMm:readonly P[]}
 }
 operating:{normalDhwTemperatureC:number;normalColdTemperatureC:number;maximumColdMaintenanceTemperatureC:number;pressureBoundaryMaximumGaugeBar:number;maximumFaultTemperatureC:null}
 expansion:{id:'HAD/plant-domestic-expansion';totalInternalCapacityLitres:number;maximumDrainableWaterLitres:number;gasWaterSeparation:'factory-all-metal-separator-design-requirement';prechargeAbsoluteBar:number;prechargeTemperatureC:number;normalRegulatorGaugeBar:number;normalPressureCeilingGaugeBar:number;maximumHeatedExternalInventoryLitres:number;maximumGasTemperatureC:number;coldDensityUpperKgM3:number;hotDensityLowerKgM3:number}
 handling:{maximumCompleteDryCargoKg:number;maximumCargoResidualKg:number;cargoDynamicFactor:number}
}
export type StoreVesselSource={
 bindingDigest:string;groundFflMm:number
 cylinder:{centreLocalXYMm:readonly[number,number];outerRadiusMm:number;outerTopLocalMm:number;family:string}
 coldPortLocalMm:P;tAndPMountLocalMm:P;immersionPortLocalXYMm:readonly[number,number]
 immersionElementLengthMm:number;immersionToolDrawMm:number;upperHotTreeJoinLocalMm:P
 inletMaximumAbsoluteBar:number;outsideMinimumAbsoluteBar:number;outsideMaximumAbsoluteBar:number;sourceMinimumDynamicGaugeBar:number
}
const record=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v)
const exact=(v:unknown,keys:string[])=>record(v)&&Object.keys(v).sort().join(',')===[...keys].sort().join(',')
const point=(v:unknown,n=3)=>Array.isArray(v)&&v.length===n&&v.every(x=>typeof x==='number'&&Number.isFinite(x))
const same=(a:readonly number[],b:readonly number[])=>a.length===b.length&&a.every((v,k)=>Math.abs(v-b[k])<1e-7)
const length=(a:P,b:P)=>Math.hypot(...a.map((v,k)=>v-b[k]))
const boreLitres=(diameterMm:number,lengthMm:number)=>Math.PI*diameterMm**2/4*lengthMm/1e6
const numericFields=(v:Record<string,unknown>,omit:string[]=[])=>Object.entries(v).every(([k,w])=>omit.includes(k)||(typeof w==='number'&&Number.isFinite(w)))
const allNumbers=(v:unknown):boolean=>record(v)?Object.values(v).every(allNumbers):Array.isArray(v)?v.every(allNumbers):typeof v!=='number'||Number.isFinite(v)
export function admitStoreVesselChoice(value:unknown):StoreVesselChoice{
 if(!exact(value,['schema','id','revision','units','datum','nominalUsableLitres','maximumBodyAndPortsLitres','maximumWettedPortsAndAccessoriesLitres','inner','minimumInsulationMm','settingEachMm','connections','operating','expansion','handling']))throw Error('Unsupported store vessel choice')
 const c=value as unknown as StoreVesselChoice,n=c.connections,e=c.expansion,o=c.operating
 if(c.schema!=='had-store-vessel/1'||c.id!=='HAD/plant-domestic-store-vessel'||c.revision!==1||c.units!=='mm-L-kg-bar-C'||c.datum!=='local-occupied-groundFFL'
  ||!exact(c.inner,['diameterMm','straightHeightMm','domeDepthMm','lowestWettedZMm'])||!exact(n,['cold','drain','tAndP','immersion','hot'])
  ||!exact(n.cold,['wetPointLocalMm','maximumFactoryBoreMm'])||!exact(n.drain,['frontOffsetYMm','externalAxisZMm','maximumFactoryBoreMm','maximumPickupLipMm','retainedBossLengthMm','maximumOtherRetainedCavityLitres'])
  ||!exact(n.tAndP,['sensePointLocalMm','maximumProbeRadiusMm','maximumProbeLengthMm','maximumWetNeckBoreMm'])||!exact(n.immersion,['axisZMm','maximumElementRadiusMm','maximumToolRadiusMm','minimumTipWallReserveMm'])
  ||!exact(n.hot,['wetPointLocalMm','externalPortLocalMm','maximumFactoryBoreMm','maximumTubeInsideMm','routeToUpperTreeLocalMm'])
  ||!exact(o,['normalDhwTemperatureC','normalColdTemperatureC','maximumColdMaintenanceTemperatureC','pressureBoundaryMaximumGaugeBar','maximumFaultTemperatureC'])
  ||!exact(e,['id','totalInternalCapacityLitres','maximumDrainableWaterLitres','gasWaterSeparation','prechargeAbsoluteBar','prechargeTemperatureC','normalRegulatorGaugeBar','normalPressureCeilingGaugeBar','maximumHeatedExternalInventoryLitres','maximumGasTemperatureC','coldDensityUpperKgM3','hotDensityLowerKgM3'])
  ||!exact(c.handling,['maximumCompleteDryCargoKg','maximumCargoResidualKg','cargoDynamicFactor'])||!allNumbers(c)
  ||!numericFields(c as unknown as Record<string,unknown>,['schema','id','revision','units','datum','inner','connections','operating','expansion','handling'])||!numericFields(c.inner)||!numericFields(c.handling)
  ||!numericFields(n.cold,['wetPointLocalMm'])||!numericFields(n.drain)||!numericFields(n.tAndP,['sensePointLocalMm'])||!numericFields(n.immersion)||!numericFields(n.hot,['wetPointLocalMm','externalPortLocalMm','routeToUpperTreeLocalMm'])
  ||!numericFields(o,['maximumFaultTemperatureC'])||!numericFields(e,['id','gasWaterSeparation'])
  ||![n.cold.wetPointLocalMm,n.tAndP.sensePointLocalMm,n.hot.wetPointLocalMm,n.hot.externalPortLocalMm].every(p=>point(p))
  ||!Array.isArray(n.hot.routeToUpperTreeLocalMm)||n.hot.routeToUpperTreeLocalMm.length<2||n.hot.routeToUpperTreeLocalMm.length>32||!n.hot.routeToUpperTreeLocalMm.every(p=>point(p))
  ||c.nominalUsableLitres<=0||c.maximumBodyAndPortsLitres<c.nominalUsableLitres||c.maximumBodyAndPortsLitres>1000||c.maximumWettedPortsAndAccessoriesLitres<0||c.maximumWettedPortsAndAccessoriesLitres>100
  ||c.inner.diameterMm<100||c.inner.diameterMm>1500||c.inner.straightHeightMm<=0||c.inner.straightHeightMm>3000||c.inner.domeDepthMm<=0||c.inner.domeDepthMm>c.inner.diameterMm/2||c.inner.lowestWettedZMm<0
  ||c.minimumInsulationMm<25||c.minimumInsulationMm>100||c.settingEachMm<10||c.settingEachMm>25
  ||[n.cold.maximumFactoryBoreMm,n.drain.maximumFactoryBoreMm,n.tAndP.maximumWetNeckBoreMm,n.hot.maximumFactoryBoreMm,n.hot.maximumTubeInsideMm].some(v=>v<=0||v>100)
  ||Math.abs(n.drain.frontOffsetYMm)>200||n.drain.externalAxisZMm<0||n.drain.maximumPickupLipMm<0||n.drain.maximumPickupLipMm>c.inner.domeDepthMm||n.drain.retainedBossLengthMm<0||n.drain.maximumOtherRetainedCavityLitres<0
  ||n.tAndP.maximumProbeRadiusMm<=0||n.tAndP.maximumProbeRadiusMm>20||n.tAndP.maximumProbeLengthMm<=0||n.tAndP.maximumProbeLengthMm>1000
  ||n.immersion.maximumElementRadiusMm<=0||n.immersion.maximumToolRadiusMm<n.immersion.maximumElementRadiusMm||n.immersion.minimumTipWallReserveMm<0
  ||o.normalColdTemperatureC<0||o.normalColdTemperatureC>30||o.normalDhwTemperatureC<=o.normalColdTemperatureC||o.normalDhwTemperatureC>65||o.maximumColdMaintenanceTemperatureC<0||o.maximumColdMaintenanceTemperatureC>40
  ||o.pressureBoundaryMaximumGaugeBar<=0||o.pressureBoundaryMaximumGaugeBar>25||o.maximumFaultTemperatureC!==null
  ||e.id!=='HAD/plant-domestic-expansion'||e.gasWaterSeparation!=='factory-all-metal-separator-design-requirement'||e.totalInternalCapacityLitres<=0||e.totalInternalCapacityLitres>100
  ||e.maximumDrainableWaterLitres<e.totalInternalCapacityLitres||e.prechargeAbsoluteBar<=0||e.prechargeTemperatureC<0||e.prechargeTemperatureC>30||e.normalRegulatorGaugeBar<=0||e.normalPressureCeilingGaugeBar<=e.normalRegulatorGaugeBar
  ||e.maximumHeatedExternalInventoryLitres<0||e.maximumGasTemperatureC<o.normalDhwTemperatureC||e.maximumGasTemperatureC>100
  ||e.coldDensityUpperKgM3<990||e.coldDensityUpperKgM3>1010||e.hotDensityLowerKgM3<970||e.hotDensityLowerKgM3>=e.coldDensityUpperKgM3
  ||c.handling.maximumCompleteDryCargoKg<100||c.handling.maximumCompleteDryCargoKg>500||c.handling.maximumCargoResidualKg<=0||c.handling.maximumCargoResidualKg>20||c.handling.cargoDynamicFactor<1.5||c.handling.cargoDynamicFactor>2)throw Error('Unsupported store vessel choice domain')
 return structuredClone(c)
}
function admitSource(s:StoreVesselSource){
 if(!exact(s,['bindingDigest','groundFflMm','cylinder','coldPortLocalMm','tAndPMountLocalMm','immersionPortLocalXYMm','immersionElementLengthMm','immersionToolDrawMm','upperHotTreeJoinLocalMm','inletMaximumAbsoluteBar','outsideMinimumAbsoluteBar','outsideMaximumAbsoluteBar','sourceMinimumDynamicGaugeBar'])
  ||typeof s.bindingDigest!=='string'||!s.bindingDigest||!exact(s.cylinder,['centreLocalXYMm','outerRadiusMm','outerTopLocalMm','family'])||typeof s.cylinder.family!=='string'||!s.cylinder.family||!point(s.cylinder.centreLocalXYMm,2)||!point(s.immersionPortLocalXYMm,2)
  ||![s.coldPortLocalMm,s.tAndPMountLocalMm,s.upperHotTreeJoinLocalMm].every(p=>point(p))||!allNumbers(s)
  ||!numericFields(s as unknown as Record<string,unknown>,['bindingDigest','cylinder','coldPortLocalMm','tAndPMountLocalMm','immersionPortLocalXYMm','upperHotTreeJoinLocalMm'])||!numericFields(s.cylinder,['centreLocalXYMm','family'])
  ||s.groundFflMm<0||s.groundFflMm>2000||s.cylinder.outerRadiusMm<250||s.cylinder.outerRadiusMm>750||s.cylinder.outerTopLocalMm<=0||s.immersionElementLengthMm<=0||s.immersionToolDrawMm<=0
  ||Math.abs(s.immersionPortLocalXYMm[1]-s.cylinder.centreLocalXYMm[1])>1e-7||Math.abs(s.immersionPortLocalXYMm[0]-s.cylinder.centreLocalXYMm[0]-s.cylinder.outerRadiusMm)>1e-7
  ||s.outsideMinimumAbsoluteBar<=0||s.outsideMaximumAbsoluteBar<s.outsideMinimumAbsoluteBar||s.inletMaximumAbsoluteBar<=s.outsideMaximumAbsoluteBar||s.sourceMinimumDynamicGaugeBar<=0)throw Error('Unsupported store vessel source')
 return structuredClone(s)
}
/** One full ellipsoid split into its two end domes; no outer-case water credit. */
export function storeVesselInnerVolumeLitres(value:unknown){
 const c=admitStoreVesselChoice(value),r=c.inner.diameterMm/2
 return Math.PI*r*r*(c.inner.straightHeightMm+4*c.inner.domeDepthMm/3)/1e6
}
export function storeVesselPointInside(value:unknown,centreXY:readonly[number,number],p:P){
 const c=admitStoreVesselChoice(value),g=c.inner,r=g.diameterMm/2,z=p[2],low=g.lowestWettedZMm,a=low+g.domeDepthMm,b=a+g.straightHeightMm,top=b+g.domeDepthMm
 if(!point(centreXY,2)||!point(p)||z<low||z>top)return false
 const dz=z<a?(z-a)/g.domeDepthMm:z>b?(z-b)/g.domeDepthMm:0
 return (p[0]-centreXY[0])**2+(p[1]-centreXY[1])**2<=r*r*(1-dz*dz)+1e-9
}
/** Axisymmetric interior distance. Quarter-ellipse boundary is minimised in
 * bounded subintervals; endpoints are included. This checks a sphere at a
 * point, not the swept factory neck or the complete service tool path. */
function boundaryDistanceMm(c:StoreVesselChoice,xy:readonly[number,number],p:P){
 const g=c.inner,r=g.diameterMm/2,h=g.domeDepthMm,rho=Math.hypot(p[0]-xy[0],p[1]-xy[1]),lo=g.lowestWettedZMm+h,hi=lo+g.straightHeightMm
 let best=Math.hypot(r-rho,Math.max(lo-p[2],0,p[2]-hi))
 for(const [centre,sign]of[[lo,-1],[hi,1]]){
  const distance=(t:number)=>Math.hypot(r*Math.cos(t)-rho,centre+sign*h*Math.sin(t)-p[2])
  for(let k=0;k<16;k++){
   let a=k*Math.PI/32,b=(k+1)*Math.PI/32
   best=Math.min(best,distance(a),distance(b))
   for(let j=0;j<60;j++){const x=a+(b-a)/3,y=b-(b-a)/3;if(distance(x)<distance(y))b=y;else a=x}
   best=Math.min(best,distance((a+b)/2))
  }
 }
 return storeVesselPointInside(c,xy,p)?best:-best
}
export function inletStoreVessel(i:{choice:unknown;source:StoreVesselSource}){
 if(!exact(i,['choice','source']))throw Error('Unsupported store vessel request')
 const c=admitStoreVesselChoice(i.choice),s=admitSource(i.source),[cx,cy]=s.cylinder.centreLocalXYMm,g=c.inner,n=c.connections,e=c.expansion,r=g.diameterMm/2,
  low=g.lowestWettedZMm,lowerShoulder=low+g.domeDepthMm,upperShoulder=lowerShoulder+g.straightHeightMm,top=upperShoulder+g.domeDepthMm,
  absolute=(p:P):P=>[p[0],p[1],p[2]+s.groundFflMm],lowPoint:P=[cx,cy,low],
  offset=n.drain.frontOffsetYMm,drainX=Math.abs(offset)<=s.cylinder.outerRadiusMm?cx+Math.sqrt(s.cylinder.outerRadiusMm**2-offset**2):NaN,drainPort:P=[drainX,cy+offset,n.drain.externalAxisZMm],
  drainPath=[lowPoint,drainPort],drainLength=length(lowPoint,drainPort),drainFall=low-n.drain.externalAxisZMm,
  pickup=n.drain.maximumPickupLipMm,residualDomeLitres=Math.PI*r*r*(pickup**2/g.domeDepthMm-pickup**3/(3*g.domeDepthMm**2))/1e6,
  drainPassageLitres=boreLitres(n.drain.maximumFactoryBoreMm,drainLength),drainBossLitres=boreLitres(n.drain.maximumFactoryBoreMm,n.drain.retainedBossLengthMm),
  knownResidualLitres=residualDomeLitres+drainPassageLitres+drainBossLitres,residualUpperKg=(knownResidualLitres+n.drain.maximumOtherRetainedCavityLitres)*e.coldDensityUpperKgM3/1000,
  innerVolume=storeVesselInnerVolumeLitres(c),bodyAndPorts=innerVolume+c.maximumWettedPortsAndAccessoriesLitres,
  coldPath=[s.coldPortLocalMm,n.cold.wetPointLocalMm],coldLength=length(coldPath[0],coldPath[1]),
  probePath=[s.tAndPMountLocalMm,n.tAndP.sensePointLocalMm],probeLength=length(probePath[0],probePath[1]),
  hotNeck=[n.hot.wetPointLocalMm,n.hot.externalPortLocalMm],hotNeckLength=length(hotNeck[0],hotNeck[1]),
  knownPortWaterLitres=drainPassageLitres+drainBossLitres+boreLitres(n.cold.maximumFactoryBoreMm,coldLength)+boreLitres(n.tAndP.maximumWetNeckBoreMm,probeLength)+boreLitres(n.hot.maximumFactoryBoreMm,hotNeckLength),
  route=n.hot.routeToUpperTreeLocalMm,hotRouteLength=route.slice(1).reduce((v,p,k)=>v+length(route[k],p),0),
  hotRouteJoined=same(route[0],n.hot.externalPortLocalMm)&&same(route.at(-1)!,s.upperHotTreeJoinLocalMm),
  coldPointInside=storeVesselPointInside(c,s.cylinder.centreLocalXYMm,n.cold.wetPointLocalMm),sensePointInside=storeVesselPointInside(c,s.cylinder.centreLocalXYMm,n.tAndP.sensePointLocalMm),
  hotPointInside=storeVesselPointInside(c,s.cylinder.centreLocalXYMm,n.hot.wetPointLocalMm),
  probeWallDistance=boundaryDistanceMm(c,s.cylinder.centreLocalXYMm,n.tAndP.sensePointLocalMm),
  probeTipReserve=probeWallDistance-n.tAndP.maximumProbeRadiusMm-2*c.settingEachMm,
  heaterPort:P=[...s.immersionPortLocalXYMm,n.immersion.axisZMm],heaterTip:P=[heaterPort[0]-s.immersionElementLengthMm,heaterPort[1],heaterPort[2]],
  heaterTipReserve=boundaryDistanceMm(c,s.cylinder.centreLocalXYMm,heaterTip)-n.immersion.maximumElementRadiusMm-2*c.settingEachMm,
  heaterInStraight=n.immersion.axisZMm-n.immersion.maximumElementRadiusMm-2*c.settingEachMm>=lowerShoulder&&n.immersion.axisZMm+n.immersion.maximumElementRadiusMm+2*c.settingEachMm<=upperShoulder,
  radialWallBudget=s.cylinder.outerRadiusMm-r-c.minimumInsulationMm-2*c.settingEachMm,topWallBudget=s.cylinder.outerTopLocalMm-top-c.minimumInsulationMm-2*c.settingEachMm,
  sourceGauge=s.inletMaximumAbsoluteBar-s.outsideMinimumAbsoluteBar,pressureBoundaryScreen=c.operating.pressureBoundaryMaximumGaugeBar+1e-9>=sourceGauge&&c.operating.pressureBoundaryMaximumGaugeBar+1e-9>=e.normalPressureCeilingGaugeBar,
  coldRegulatorAbsolute=e.normalRegulatorGaugeBar+s.outsideMaximumAbsoluteBar,gasInitial=Math.min(e.totalInternalCapacityLitres,e.totalInternalCapacityLitres*e.prechargeAbsoluteBar*(c.operating.normalColdTemperatureC+273.15)/(e.prechargeTemperatureC+273.15)/coldRegulatorAbsolute),
  initialExpansionWater=e.totalInternalCapacityLitres-gasInitial,heatedInventory=c.maximumBodyAndPortsLitres+e.maximumHeatedExternalInventoryLitres,
  thermalExpansion=heatedInventory*(e.coldDensityUpperKgM3/e.hotDensityLowerKgM3-1),gasFinal=gasInitial-thermalExpansion,
  hotGasAbsolute=gasFinal>0?e.prechargeAbsoluteBar*e.totalInternalCapacityLitres*(e.maximumGasTemperatureC+273.15)/(e.prechargeTemperatureC+273.15)/gasFinal:null,
  hotGauge=hotGasAbsolute===null?null:hotGasAbsolute-s.outsideMinimumAbsoluteBar,
  thermalScreen=hotGauge!==null&&hotGauge<=e.normalPressureCeilingGaugeBar&&e.normalRegulatorGaugeBar<s.sourceMinimumDynamicGaugeBar,
  bodyWaterKg=c.maximumBodyAndPortsLitres*e.coldDensityUpperKgM3/1000,completeDry=c.handling.maximumCompleteDryCargoKg,cargo=completeDry+c.handling.maximumCargoResidualKg,
  bodyInventoryScreen=bodyAndPorts<=c.maximumBodyAndPortsLitres+1e-9&&knownPortWaterLitres+n.drain.maximumOtherRetainedCavityLitres<=c.maximumWettedPortsAndAccessoriesLitres,
  residualScreen=residualUpperKg<=c.handling.maximumCargoResidualKg+1e-9,
  geometryScreen=radialWallBudget>=0&&topWallBudget>=0&&drainFall>=0&&Number.isFinite(drainLength)&&coldPointInside&&sensePointInside&&hotPointInside&&hotRouteJoined&&probeLength+2*c.settingEachMm<=n.tAndP.maximumProbeLengthMm&&probeTipReserve>=0&&heaterInStraight&&heaterTipReserve>=n.immersion.minimumTipWallReserveMm,
  diagnostics=[
   ...(!bodyInventoryScreen?['STORE_VESSEL/body-and-ports-exceed-design-cap']:[]),
   ...(!residualScreen?['STORE_VESSEL/cold-cargo-residual-exceeds-budget']:[]),
   ...(!Number.isFinite(drainLength)||drainFall<0?['STORE_VESSEL/factory-lowpoint-drain-not-continuously-descending']:[]),
   ...(!coldPointInside?['STORE_VESSEL/cold-inlet-does-not-reach-inner-water']:[]),
   ...(!sensePointInside?['STORE_VESSEL/TP-sense-point-outside-inner-water']:[]),
   ...(probeTipReserve<0?['STORE_VESSEL/TP-tip-radius-and-two-settings-exceed-interior-clearance']:[]),
   ...(probeLength+2*c.settingEachMm>n.tAndP.maximumProbeLengthMm?['STORE_VESSEL/TP-probe-length-exceeds-authored-bound']:[]),
   ...(!hotPointInside||!hotRouteJoined?['STORE_VESSEL/authored-hot-outlet-does-not-join-upper-tree']:[]),
   ...(!heaterInStraight||heaterTipReserve<n.immersion.minimumTipWallReserveMm?['STORE_VESSEL/immersion-envelope-exceeds-inner-domain']:[]),
   ...(radialWallBudget<0||topWallBudget<0?['STORE_VESSEL/inner-body-insulation-settings-exceed-case']:[]),
   ...(!pressureBoundaryScreen?['STORE_VESSEL/pressure-design-boundary-below-actual-source']:[]),
   ...(!thermalScreen?['STORE_VESSEL/normal-expansion-comparison-outside-domain']:[]),
   'STORE_VESSEL/factory-pressure-wall-nozzles-safety-and-material-qualification-missing',
   'STORE_VESSEL/expansion-regulator-capacity-gas-separator-and-control-qualification-missing',
   'STORE_VESSEL/actual-port-neck-supports-tool-path-and-upper-tree-fit-unqualified',
   'STORE_VESSEL/charged-fault-temperature-jet-and-connected-inventory-not-qualified'
  ]
 return{
  schema:'had-store-vessel-comparison/1' as const,id:c.id,choice:c,source:{bindingDigest:s.bindingDigest,input:s,caseDigest:sha256SemanticFingerprint({choice:c,source:s}),method:'axisymmetric-cylinder-oblate-domes-and-explicit-factory-connections/1'},
  ownerSelectedDesignEnvelope:true,supplierSelected:false,physicalInstallationAdmitted:false,installedAcceptance:false,
  geometry:{datum:c.datum,groundFflMm:s.groundFflMm,centreLocalXYMm:s.cylinder.centreLocalXYMm,dimensionsAreMaximumWettedBounds:true,innerDiameterMm:g.diameterMm,innerLowestLocalMm:low,innerTopLocalMm:top,innerLowestAbsoluteMm:low+s.groundFflMm,innerTopAbsoluteMm:top+s.groundFflMm,straightLocalZMm:[lowerShoulder,upperShoulder],outerRadiusMm:s.cylinder.outerRadiusMm,outerTopLocalMm:s.cylinder.outerTopLocalMm,radialWallAndHardwareBudgetAfterInsulationAndTwoSettingsMm:radialWallBudget,topWallAndHardwareBudgetAfterInsulationAndTwoSettingsMm:topWallBudget,actualPressureWallThicknessMm:null,necessaryGeometryScreen:geometryScreen},
  inventory:{nominalUsableDesignLitres:c.nominalUsableLitres,nominalUsableDeliveryQualified:false,innerGeometricLitres:innerVolume,maximumPortsAndAccessoriesDesignLitres:c.maximumWettedPortsAndAccessoriesLitres,knownFactoryPassagesConservativeLitres:knownPortWaterLitres,knownPassageAuditIncludesInnerInsertionsConservatively:true,knownPassageAuditAddedAgainToBodyUpper:false,portsBudgetIsMaximumAdditionalOutsideInnerWater:true,remainingPortsAndAccessoriesBudgetLitres:c.maximumWettedPortsAndAccessoriesLitres-knownPortWaterLitres-n.drain.maximumOtherRetainedCavityLitres,bodyAndPortsUpperLitres:bodyAndPorts,maximumBodyAndPortsDesignLitres:c.maximumBodyAndPortsLitres,necessaryFiniteBodyInventoryScreen:bodyInventoryScreen,outerCaseCylinderComparisonLitres:Math.PI*s.cylinder.outerRadiusMm**2*s.cylinder.outerTopLocalMm/1e6,outerCaseComparisonAppliesToWaterInventory:false,externalExpansionMaximumWaterLitres:e.maximumDrainableWaterLitres,bodyPlusExpansionDesignUpperLitres:c.maximumBodyAndPortsLitres+e.maximumDrainableWaterLitres,upperColdHotReturnRisersAndFittingsIncluded:false,primaryBufferIncluded:false,actualMaximumWholeConnectedReleaseLitres:null},
  connections:{
   cold:{origin:'retained-source-cold-port' as const,pathLocalMm:coldPath,pathAbsoluteMm:coldPath.map(absolute),factoryPressureRiseMm:n.cold.wetPointLocalMm[2]-s.coldPortLocalMm[2],wetPointInside:coldPointInside,matchedPressureNozzleQualified:false},
   drain:{origin:'dedicated-factory-lowpoint-port' as const,pathLocalMm:drainPath,pathAbsoluteMm:drainPath.map(absolute),requiredMaximumDirectPassageLengthMm:drainLength,requiredContinuousFallMm:drainFall,nonRisingPath:drainFall>=0,lowestPickupLipMm:pickup,retainedBossLengthMm:n.drain.retainedBossLengthMm,pressureWallAndNoBottomPocketQualified:false},
   tAndP:{origin:'retained-direct-TP-mount' as const,pathLocalMm:probePath,pathAbsoluteMm:probePath.map(absolute),requiredProbeLengthMm:probeLength,requiredProbeLengthAfterTwoSettingsMm:probeLength+2*c.settingEachMm,maximumProbeLengthMm:n.tAndP.maximumProbeLengthMm,sensePointInside,nearestInnerWallMm:probeWallDistance,tipEnvelopeReserveAfterTwoSettingsMm:probeTipReserve,factoryProbePressureNeckAndResponseQualified:false},
   immersion:{origin:'retained-source-immersion-face-XY-with-authored-Z' as const,portLocalMm:heaterPort,portAbsoluteMm:absolute(heaterPort),tipLocalMm:heaterTip,tipAbsoluteMm:absolute(heaterTip),elementLengthMm:s.immersionElementLengthMm,toolDrawMm:s.immersionToolDrawMm,withdrawalEndLocalMm:[heaterPort[0]+s.immersionElementLengthMm+s.immersionToolDrawMm,heaterPort[1],heaterPort[2]],maximumToolRadiusMm:n.immersion.maximumToolRadiusMm,tipWallReserveAfterTwoSettingsMm:heaterTipReserve,axisAndElementInStraightDomain:heaterInStraight,completeToolAndRemovalObstacleFitQualified:false},
   hot:{origin:'new-owner-authored-hot-draw-nozzle-not-D1-relief-manifold' as const,neckLocalMm:hotNeck,neckAbsoluteMm:hotNeck.map(absolute),routeToUpperTreeLocalMm:route,routeToUpperTreeAbsoluteMm:route.map(absolute),upperTreeJoinLocalMm:s.upperHotTreeJoinLocalMm,routeJoined:hotRouteJoined,additionalLocalConnectionWaterUpperLitres:boreLitres(n.hot.maximumTubeInsideMm,hotRouteLength),actualSeparateTubeCentrelineAndSupportsQualified:false}
  },
  coldCargo:{maximumBodyBottomResidualLitres:residualDomeLitres,maximumFactoryPassageResidualLitres:drainPassageLitres,maximumBossResidualLitres:drainBossLitres,knownResidualLitres,maximumOtherRetainedCavityLitres:n.drain.maximumOtherRetainedCavityLitres,maximumResidualKg:residualUpperKg,residualDesignBudgetKg:c.handling.maximumCargoResidualKg,necessaryResidualScreen:residualScreen,maximumCompleteDryCargoKg:completeDry,completeColdCargoDesignKg:cargo,oneWheelIncludingDynamicN:cargo*9.81*c.handling.cargoDynamicFactor,emptyingPhysicallyProved:false,actualDryCGLocalMm:null},
  normalFilled:{maximumBodyWaterKg:bodyWaterKg,completeDryMassDesignCeilingKg:completeDry,bodyDryPlusWaterDesignCeilingKg:completeDry+bodyWaterKg,bodyDryPlusWaterGravityN:(completeDry+bodyWaterKg)*9.81,expansionAndPermanentAncillariesIncluded:false,innerSymmetricWaterCentroidLocalMm:[cx,cy,(low+top)/2],actualCompleteFilledCGLocalMm:null,notColdCargo:true},
  operating:{...c.operating,actualSourceMaximumGaugeBar:sourceGauge,sourceMinimumDynamicGaugeBar:s.sourceMinimumDynamicGaugeBar,necessaryPressureDesignBoundaryScreen:pressureBoundaryScreen,normalTemperatureLimitPhysicallyQualified:false,pressureMaterialAndSafetyControlsQualified:false,pipeTemperatureChangeUsedAsWaterTemperature:false,maximumFaultTemperatureQualified:false,safetyReliefSetpointGaugeBar:null},
  expansion:{...e,totalCapacityIsIndependentMaximumWaterBound:true,legacy25LitresImported:false,thermalMethod:'ideal separated gas pV/T; authored water-density bounds; all precharge/control/temperature conditions explicit' as const,propertyBoundsQualified:false,maximumNormalHeatedInventoryLitres:heatedInventory,initialWaterUpperLitres:initialExpansionWater,thermalExpansionUpperLitres:thermalExpansion,finalGasLitres:gasFinal,maximumNormalGasAbsoluteBar:hotGasAbsolute,maximumNormalGaugeBar:hotGauge,necessaryNormalThermalComparison:thermalScreen,regulatorLossAndSimultaneousDutyQualified:false,actualGasSeparatorPrechargeAndReliefQualified:false,actualExpansionPortRouteAndSupportQualified:false},
  diagnostics
 }
}
