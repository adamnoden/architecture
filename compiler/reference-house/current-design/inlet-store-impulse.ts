/** Finite-inventory impulse comparison. At/above the initial stage the declared
 * surviving outlet must drain the continuous source. Charging every finite
 * release instantly then bounds any slower release by the same total volume.
 * This is a hydrostatic lumped-volume barrier, not a jet/transient-network proof. */
export type StoreImpulseInput = {
  planMm: readonly [number,number,number,number]
  exclusions: readonly {id:string;planMm:readonly [number,number,number,number]}[]
  panHighestAfterIndependentSettingMm:number
  initialStageMm:number
  safeStageMm:number
  sourceLmin:number
  minimumOutflowAtAndAboveInitialLmin:number
  outletState:'free-surviving-outlet'|'submerged-or-unqualified'|'both-blocked'
  additionalUnrepresentedDisplacementLitres:number|null
  completeMaximumFiniteReleaseLitres:number|null
}
const rectangle=(p:unknown):p is readonly[number,number,number,number]=>Array.isArray(p)&&p.length===4&&[...p].every(Number.isFinite)&&p[2]>0&&p[3]>0
export function inletStoreImpulseBarrier(i:StoreImpulseInput){
 if(!i||!rectangle(i.planMm)||!Array.isArray(i.exclusions)||new Set(i.exclusions.map(e=>e.id)).size!==i.exclusions.length||i.exclusions.some(e=>!e.id||!rectangle(e.planMm))
  ||![i.panHighestAfterIndependentSettingMm,i.initialStageMm,i.safeStageMm,i.sourceLmin,i.minimumOutflowAtAndAboveInitialLmin].every(Number.isFinite)
  ||i.sourceLmin<=0||i.minimumOutflowAtAndAboveInitialLmin<0||!['free-surviving-outlet','submerged-or-unqualified','both-blocked'].includes(i.outletState)
  ||[i.additionalUnrepresentedDisplacementLitres,i.completeMaximumFiniteReleaseLitres].some(v=>v!==null&&(!Number.isFinite(v)||v<0)))throw Error('Unsupported finite-store impulse comparison')
 const [x,y,w,d]=i.planMm,ends=(k:0|1)=>[...new Set([i.planMm[k],i.planMm[k]+i.planMm[k+2],...i.exclusions.flatMap(e=>[Math.max(i.planMm[k],Math.min(i.planMm[k]+i.planMm[k+2],e.planMm[k])),Math.max(i.planMm[k],Math.min(i.planMm[k]+i.planMm[k+2],e.planMm[k]+e.planMm[k+2]))])])].sort((a,b)=>a-b),xs=ends(0),ys=ends(1)
 let excludedMm2=0
 for(let a=1;a<xs.length;a++)for(let b=1;b<ys.length;b++){
  const cx=(xs[a]+xs[a-1])/2,cy=(ys[b]+ys[b-1])/2
  if(i.exclusions.some(e=>cx>=e.planMm[0]&&cx<=e.planMm[0]+e.planMm[2]&&cy>=e.planMm[1]&&cy<=e.planMm[1]+e.planMm[3]))excludedMm2+=(xs[a]-xs[a-1])*(ys[b]-ys[b-1])
 }
 const totalAreaM2=w*d/1e6,excludedAreaM2=excludedMm2/1e6,remainingAreaM2=totalAreaM2-excludedAreaM2,
  wettedDomain=i.initialStageMm>=i.panHighestAfterIndependentSettingMm,
  sourceBarrier=i.outletState==='free-surviving-outlet'&&i.minimumOutflowAtAndAboveInitialLmin>=i.sourceLmin,
  stageRiseMm=Math.max(0,i.safeStageMm-i.initialStageMm),grossGeometricCapLitres=wettedDomain&&sourceBarrier?totalAreaM2*stageRiseMm:0,
  afterKnownExclusionsCapLitres=wettedDomain&&sourceBarrier?remainingAreaM2*stageRiseMm:0,
  conditionalMaximumInventoryLitres=i.additionalUnrepresentedDisplacementLitres===null?null:Math.max(0,afterKnownExclusionsCapLitres-i.additionalUnrepresentedDisplacementLitres),
  conditionalInventoryScreen=conditionalMaximumInventoryLitres===null||i.completeMaximumFiniteReleaseLitres===null?null:sourceBarrier&&wettedDomain&&i.safeStageMm>=i.initialStageMm&&i.completeMaximumFiniteReleaseLitres<=conditionalMaximumInventoryLitres,
  diagnostics=[...(!wettedDomain?['STORE_IMPULSE/pan-not-fully-wetted-at-initial-stage']:[]),...(!sourceBarrier?['STORE_IMPULSE/no-continuous-source-drain-barrier']:[]),...(i.safeStageMm<i.initialStageMm?['STORE_IMPULSE/no-open-stage-reserve']:[]),...(i.additionalUnrepresentedDisplacementLitres===null?['STORE_IMPULSE/additional-floor-support-displacement-unknown']:[]),...(i.completeMaximumFiniteReleaseLitres===null?['STORE_IMPULSE/complete-maximum-finite-inventory-unknown']:[]),...(conditionalInventoryScreen===false?['STORE_IMPULSE/finite-inventory-exceeds-conditional-cap']:[])]
 return{schema:'had-store-impulse-barrier/1',resolvedInput:structuredClone(i),method:'Instantaneously add all finite inventory to the source-equilibrium pool; nonnegative continuous outflow minus source prevents later growth through the declared open-stage interval.',
  totalAreaM2,excludedAreaM2,remainingAreaM2,exclusionsReservedThroughFullStageDepth:true,overlapExcludedOnce:true,wettedDomain,sourceBarrier,initialStageMm:i.initialStageMm,safeStageMm:i.safeStageMm,stageRiseMm,grossGeometricCapLitres,afterKnownExclusionsCapLitres,
  additionalUnrepresentedDisplacementLitres:i.additionalUnrepresentedDisplacementLitres,conditionalMaximumInventoryLitres,completeMaximumFiniteReleaseLitres:i.completeMaximumFiniteReleaseLitres,conditionalInventoryScreen,
  noManualOrAutomaticSourceClosureCredited:true,actualConnectedFreeVolumeAndHydraulicsQualified:false,pressureJetAirEntrainmentAndTransientNetworkQualified:false,installedContainmentAccepted:false,diagnostics}
}
