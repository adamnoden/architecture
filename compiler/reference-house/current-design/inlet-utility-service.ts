/** Actual cold-maintenance assembly for the separate Utility inlet.
 * All new pressure parts below are authored procurement requirements, not
 * manufacturer dimensions/ratings or installation acceptance. */
import {segmentDistance} from '../../../project/had/studies/service-interface-geometry.mjs'
import type {IndoorRoutesInput,InletRetainedRouteServices} from './inlet-indoor-routes.js'
import {exactSegmentBoxDistance} from '../../../project/had/studies/incoming-water-geometry.mjs'
import {inletUtilityFixedEnvelopes,type inletUtilityRoute} from './inlet-utility-route.js'
type P=readonly[number,number,number]
type B=readonly[number,number,number,number,number,number]
type M={id:string;boxMm:B}
export type UtilityColdServiceChoice={
 schema:'had-utility-cold-service/1'
 drainTeeZMm:number
 drainEndXMm:number
 drainValveXMm:number
 drainTipZMm:number
 drainControlNorthMm:number
 drainOrificeMm:number
 binOuterMm:B
 minimumVerifiedUsableBinL:number
 minimumUnionFaceReleaseMm:number
 terminalUnionFaceBelowTubeEndMm:number
 upstreamCouponZMm:readonly[number,number]
 downstreamCouponZMm:readonly[number,number]
 assemblyEastMovementMm:number
 cutShoulderMm:P
 carryShoulderMm:P
 drainShoulderMm:P
}
const tuple=(v:unknown,n:number)=>Array.isArray(v)&&v.length===n&&v.every(x=>typeof x==='number'&&Number.isFinite(x))
const distance=(a:readonly number[],b:readonly number[])=>Math.hypot(...a.map((v,k)=>v-b[k]))
const gap=(a:B,b:B)=>{const g=[0,1,2].map(k=>Math.max(a[k]-b[k]-b[k+3],b[k]-a[k]-a[k+3]));return g.some(v=>v>0)?Math.hypot(...g.map(v=>Math.max(v,0))):Math.max(...g)}
const moved=(b:B,offset:P):B=>[b[0]+offset[0],b[1]+offset[1],b[2]+offset[2],b[3],b[4],b[5]]
const centred=(p:P,d:P):B=>[p[0]-d[0]/2,p[1]-d[1]/2,p[2]-d[2]/2,...d]
const segment=(a:P,b:P,r:number):B=>[Math.min(a[0],b[0])-r,Math.min(a[1],b[1])-r,Math.min(a[2],b[2])-r,Math.abs(a[0]-b[0])+2*r,Math.abs(a[1]-b[1])+2*r,Math.abs(a[2]-b[2])+2*r]
const union=(boxes:readonly B[]):B=>{const lo=[0,1,2].map(k=>Math.min(...boxes.map(b=>b[k]))),hi=[0,1,2].map(k=>Math.max(...boxes.map(b=>b[k]+b[k+3])));return[lo[0],lo[1],lo[2],hi[0]-lo[0],hi[1]-lo[1],hi[2]-lo[2]]}
const expanded=(b:B,n:number):B=>[b[0]-n,b[1]-n,b[2]-n,b[3]+2*n,b[4]+2*n,b[5]+2*n]
export function admitUtilityColdService(value:unknown):UtilityColdServiceChoice{
 const c=value as UtilityColdServiceChoice,keys=['schema','drainTeeZMm','drainEndXMm','drainValveXMm','drainTipZMm','drainControlNorthMm','drainOrificeMm','binOuterMm','minimumVerifiedUsableBinL','minimumUnionFaceReleaseMm','terminalUnionFaceBelowTubeEndMm','upstreamCouponZMm','downstreamCouponZMm','assemblyEastMovementMm','cutShoulderMm','carryShoulderMm','drainShoulderMm']
 if(!c||Object.keys(c).sort().join(',')!==keys.sort().join(',')||c.schema!=='had-utility-cold-service/1'
 ||![c.drainTeeZMm,c.drainEndXMm,c.drainValveXMm,c.drainTipZMm,c.drainControlNorthMm,c.drainOrificeMm,c.minimumVerifiedUsableBinL,c.minimumUnionFaceReleaseMm,c.terminalUnionFaceBelowTubeEndMm,c.assemblyEastMovementMm].every(Number.isFinite)
 ||!tuple(c.binOuterMm,6)||!tuple(c.upstreamCouponZMm,2)||!tuple(c.downstreamCouponZMm,2)||![c.cutShoulderMm,c.carryShoulderMm,c.drainShoulderMm].every(p=>tuple(p,3))
 ||c.binOuterMm.slice(3).some(v=>v<=0)||c.drainTeeZMm<600||c.drainTeeZMm>800||c.drainTipZMm<350||c.drainTipZMm>500
 ||c.drainEndXMm<10200||c.drainEndXMm>10400||c.drainValveXMm<10180||c.drainValveXMm>c.drainEndXMm-42
 ||c.drainControlNorthMm<110||c.drainControlNorthMm>150||c.drainOrificeMm<=0||c.drainOrificeMm>3
 ||c.minimumVerifiedUsableBinL<=0||c.minimumVerifiedUsableBinL>25||c.minimumUnionFaceReleaseMm<10||c.minimumUnionFaceReleaseMm>30
 ||c.terminalUnionFaceBelowTubeEndMm<10||c.terminalUnionFaceBelowTubeEndMm>40||c.assemblyEastMovementMm<80||c.assemblyEastMovementMm>150
 ||[c.upstreamCouponZMm,c.downstreamCouponZMm].some(p=>p[1]-p[0]!==20))throw Error('Complete bounded authored Utility cold-service choice required')
 return structuredClone(c)
}
export function inletUtilityColdService(i:{route:ReturnType<typeof inletUtilityRoute>;choice:unknown;roomMm:readonly[number,number,number,number];washerReservationMm:readonly[number,number,number,number];washerBodyMm:readonly[number,number,number,number];washerHeightMm:number;maximumGaugeBar:number;input:IndoorRoutesInput;retained:InletRetainedRouteServices;host:any}){
 const c=admitUtilityColdService(i.choice),r=i.route,rearTree=(r.choice.coldDistribution as any)?.rearTree,rearJoint=rearTree?.sourceJoint,rear=rearTree?.schema==='had-utility-rear-cold-tree/1'&&rearJoint?.id==='U/rear-tree-horizontal-union',up=r.paths.find(p=>p.id==='utility/upstream')!,down=r.paths.find(p=>p.id==='utility/downstream')!,source=up.virtualPointsMm[0],terminal=down.virtualPointsMm.at(-1)!,
 axis:P=[r.valve.axisMm[0],r.valve.axisMm[1],r.valve.axisMm[2]],setting=r.geometry.twoIndependentSettingsMm,bareNutR=39/(2*Math.cos(Math.PI/6)),jacket=26,teeZ=c.drainTeeZMm,tee:P=[source[0],source[1],teeZ],
 tip:P=[c.drainEndXMm,source[1],c.drainTipZMm],wheel:P=[c.drainValveXMm,source[1]+c.drainControlNorthMm,teeZ],
 vent=down.virtualPointsMm[2] as P,faceZ=terminal[2]-c.terminalUnionFaceBelowTubeEndMm,
 checks:{id:string;reserveMm:number}[]=[],add=(id:string,n:number)=>checks.push({id,reserveMm:n})
 if(axis[0]!==9550||axis[1]!==1600||axis[2]!==1175||source[0]!==10080||source[1]!==600||Math.abs(source[2]-478.39)>1e-6||!(rear?JSON.stringify(terminal)===JSON.stringify(rearJoint.fixedFaceLocalMm)&&JSON.stringify(rearJoint.flowAxis)==='[1,0,0]'&&rearJoint.bareFaceLengthMm===60&&rearJoint.bareCrossMm===60&&rearJoint.captiveCapProjectionMm===25&&rearTree.loweringMm===210:terminal[0]===10760&&terminal[1]===1250&&terminal[2]===1000)||vent[0]!==9550||vent[1]!==1900||vent[2]!==Math.max(...down.virtualPointsMm.map(p=>p[2])))throw Error('Actual current low bridge, source, terminal and high corner required')
 // The equal28 tee has a real straight vertical run and east branch. DZR
 // 601EQ primary table gives42mm branch and83mm run. No reduced-run tee.
 const teeBare=union([segment([tee[0],tee[1],teeZ-41.5],[tee[0],tee[1],teeZ+41.5],bareNutR),segment(tee,[tee[0]+42,tee[1],teeZ],bareNutR)]),
 drainValveBare:B=[c.drainValveXMm-37.5,source[1]-35,teeZ-35,75,c.drainControlNorthMm+35,70],
 drainTube=segment([source[0]+42,source[1],teeZ],[c.drainEndXMm,source[1],teeZ],7.55),
 dropTube=segment([c.drainEndXMm,source[1],teeZ],tip,7.55),
 drainElbow=centred([c.drainEndXMm,source[1],teeZ],[75,45,75]),
 ventBare=union([segment([vent[0],vent[1],vent[2]-42],[vent[0],vent[1],vent[2]+42],bareNutR),segment([vent[0],vent[1]-42,vent[2]],vent,bareNutR)]),
 ventControlBare:B=[vent[0]-35,vent[1]-35,vent[2]+42,70,70,90],
 fixedUnionBare:B=rear?[terminal[0]-30,terminal[1]-30,terminal[2]-30,30,60,60]:[terminal[0]-30,terminal[1]-30,faceZ,60,60,terminal[2]+30-faceZ],
 movingUnionBare:B=rear?[terminal[0],terminal[1]-30,terminal[2]-30,30,60,60]:[terminal[0]-30,terminal[1]-30,faceZ-60,60,60,60],
 lowerContinuationBare=segment([terminal[0],terminal[1],faceZ-60],[terminal[0],terminal[1],750],14.05),
 fixedBlankBare:B=rear?[terminal[0],terminal[1]-30,terminal[2]-30,rearJoint.captiveCapProjectionMm,60,60]:[terminal[0]-30,terminal[1]-30,faceZ-25,60,60,25],
 normal:M[]=[{id:'utility/service/drain-tee',boxMm:expanded(teeBare,jacket)},{id:'utility/service/drain-control',boxMm:expanded(drainValveBare,jacket)},{id:'utility/service/drain-horizontal',boxMm:expanded(drainTube,jacket)},{id:'utility/service/drain-elbow',boxMm:expanded(drainElbow,jacket)},{id:'utility/service/drain-down',boxMm:expanded(dropTube,jacket)},{id:'utility/service/high-vent-tee',boxMm:expanded(ventBare,jacket)},{id:'utility/service/high-vent-control',boxMm:expanded(ventControlBare,jacket)},...(rear?[{id:'utility/service/terminal-horizontal-fixed-union',boxMm:expanded(fixedUnionBare,jacket)},{id:'utility/service/terminal-horizontal-moving-union',boxMm:expanded(movingUnionBare,jacket)}]:[{id:'utility/service/terminal-upper-union',boxMm:[terminal[0]-56,terminal[1]-56,faceZ,112,112,terminal[2]+56-faceZ] as B},{id:'utility/service/terminal-lower-union',boxMm:[terminal[0]-56,terminal[1]-56,faceZ-86,112,112,86] as B},{id:'utility/service/terminal-continuation',boxMm:expanded(lowerContinuationBare,jacket)}])],
 carrier:M[]=rear?[{id:'actual rear horizontal moving union',boxMm:movingUnionBare}]:[{id:'actual terminal lower union',boxMm:movingUnionBare},{id:'actual terminal continuation to750',boxMm:lowerContinuationBare}],
 nominalCarrierMove=(rear?[rearJoint.minimumAxialReleaseMm,0,-rearTree.loweringMm]:i.host.states.carrier[1]) as P,blankGap=gap(fixedBlankBare,moved(movingUnionBare,nominalCarrierMove))
 if(!rear){add('terminal-real-face-release',-nominalCarrierMove[2]-c.minimumUnionFaceReleaseMm);add('blank-versus-captured-lowered-half',blankGap-setting)}
 const fullTeeRunExtent=41.5+bareNutR+jacket,fullElbowExtent=42+bareNutR+jacket,requiredCentreSpacing=fullTeeRunExtent+fullElbowExtent+setting
 add('tee-above-retained-source-elbow',teeZ-source[2]-requiredCentreSpacing)
 add('tee-below-upper-source-elbow',up.virtualPointsMm[1][2]-teeZ-requiredCentreSpacing)
 for(const m of normal){const b=m.boxMm,room=i.roomMm;add(m.id+'/room',Math.min(b[0]-room[0],room[0]+room[2]-b[0]-b[3],b[1]-room[1],room[1]+room[3]-b[1]-b[4],b[2])-10)}

 // Current furniture/retained services and ordinary access join the same normal
 // pieces. A round union is checked by a covering capsule, not a false solid
 // square collision. This does not conceal its existing-main mating interfaces.
 for(const member of normal){
  const b=member.boxMm,isUnion=member.id.includes('terminal-'),isUpper=member.id.endsWith('terminal-upper-union'),isTube=member.id.endsWith('terminal-continuation'),rad=isTube?40.05:56,a:P=[terminal[0],terminal[1],isUpper?faceZ:isTube?750:faceZ-60],z:P=[terminal[0],terminal[1],isUpper?terminal[2]+30:isTube?faceZ-60:faceZ],
   toBox=(box:B)=>isUnion&&!rear?exactSegmentBoxDistance(a,z,box)-rad:gap(b,box)
  for(const obstacle of [...i.input.obstacles,...i.retained.boxes].filter(o=>!o.id.startsWith('ordinary-operator')&&!o.id.startsWith('wet-door-complete-moving')&&!['occupied-washer-rest','complete-shifted-utility-maintenance'].includes(o.id)))add(member.id+'/'+obstacle.id,toBox(obstacle.boxMm)-setting)
  for(const path of i.retained.paths)for(let k=1;k<path.pointsMm.length;k++)add(member.id+'/'+path.id+'/'+k,(isUnion&&!rear?segmentDistance(a,z,path.pointsMm[k-1],path.pointsMm[k])-rad:exactSegmentBoxDistance(path.pointsMm[k-1],path.pointsMm[k],b))-path.radiusWithSupportsMm-setting)
  if(b[2]<2000&&b[2]+b[5]>0)for(let k=1;k<r.ordinaryApproachMm.length;k++){const u=r.ordinaryApproachMm[k-1],v=r.ordinaryApproachMm[k];add(member.id+'/ordinary-body',exactSegmentBoxDistance([u[0],u[1],1000],[v[0],v[1],1000],[b[0],b[1],0,b[3],b[4],2000])-300-setting)}
 }
 const bin=c.binOuterMm,washer:B=[i.washerReservationMm[0],i.washerReservationMm[1],0,i.washerReservationMm[2],i.washerReservationMm[3],2000]
 add('bin-home-washer',gap(bin,washer)-setting)
 add('bin-south-room',bin[1]-i.roomMm[1]-10)
 add('bin-outlet-freefall',tip[2]-bin[2]-bin[5]-setting)
 add('tip-inside-bin-rim',Math.min(tip[0]-bin[0],bin[0]+bin[3]-tip[0],tip[1]-bin[1],bin[1]+bin[4]-tip[1])-setting)
 add('drain-control-reach',650-distance(c.drainShoulderMm,wheel))
 // Same300mm source plan body, lowered shoulder declared as a separate task.
 add('drain-body-west-wall',c.drainShoulderMm[0]-i.roomMm[0]-300-setting)
 const bodyToWasher=Math.hypot(Math.max(washer[0]-c.drainShoulderMm[0],c.drainShoulderMm[0]-washer[0]-washer[3],0),Math.max(washer[1]-c.drainShoulderMm[1],c.drainShoulderMm[1]-washer[1]-washer[4],0))-300-setting
 add('drain-body-home-washer',bodyToWasher)
 const solidWasher:B=[i.washerBodyMm[0],i.washerBodyMm[1],0,i.washerBodyMm[2],i.washerBodyMm[3],i.washerHeightMm]
 add('drain-arm-source-solid-washer',exactSegmentBoxDistance(c.drainShoulderMm,wheel,solidWasher)-40-setting)
 const bareElbows=r.paths.flatMap(p=>p.corners).filter(k=>k.kind==='boxed-compression-elbow').map(k=>k.boxMm.slice(3).map(v=>Math.max(v-52,0)).reduce((a,b)=>a*b,1)/1e6),
 extras=[teeBare,ventBare,ventControlBare,drainValveBare,drainTube,dropTube,drainElbow,fixedUnionBare,movingUnionBare,...(rear?[]:[lowerContinuationBare])],
 volumeExtrasL=extras.reduce((sum,b)=>sum+b[3]*b[4]*b[5]/1e6,0),
 moduleFullOuterL=r.choice.valveDesign!.maximumBareModuleMm.reduce((a,b)=>a*b,1)/1e6,
 inventoryCeilingL=r.quantities.referenceWaterKg+moduleFullOuterL+bareElbows.reduce((a,b)=>a+b,0)+volumeExtrasL,
 cylindricalBinGrossL=bin[3]*bin[4]*bin[5]/1e6
 add('bin-usable-versus-full-component-envelope-inventory',c.minimumVerifiedUsableBinL-inventoryCeilingL)
 add('bin-usable-below-gross-exterior-prism-ceiling',cylindricalBinGrossL-c.minimumVerifiedUsableBinL)
 const upCuts=c.upstreamCouponZMm,downCuts=c.downstreamCouponZMm,
 captureBare=union([centred(axis,r.choice.valveDesign!.maximumBareModuleMm),segment([axis[0],1300,upCuts[1]],[axis[0],1300,axis[2]],bareNutR),segment([axis[0],1300,axis[2]],[axis[0],1900,axis[2]],bareNutR),segment([axis[0],1900,axis[2]],[axis[0],1900,downCuts[0]],bareNutR),centred([axis[0],axis[1],axis[2]+80],[80,80,160])]),
 captureSweep:B=[captureBare[0],captureBare[1],captureBare[2],captureBare[3]+c.assemblyEastMovementMm,captureBare[4],captureBare[5]],
 parked=moved(captureBare,[c.assemblyEastMovementMm,0,0])
 add('upstream-coupon-above-drain-tee',upCuts[0]-teeZ)
 add('downstream-coupon-above-drain-tee',downCuts[0]-teeZ)
 add('cut-operator-upstream-reach',650-distance(c.cutShoulderMm,[axis[0],1300,upCuts[1]]))
 add('cut-operator-downstream-reach',650-distance(c.cutShoulderMm,[axis[0],1900,downCuts[0]]))
 add('parked-capture-home-washer',gap(parked,washer)-setting)
 add('carry-operator-body-versus-parked',exactSegmentBoxDistance([c.carryShoulderMm[0],c.carryShoulderMm[1],0],[c.carryShoulderMm[0],c.carryShoulderMm[1],2000],parked)-300-setting)
 checks.sort((a,b)=>a.reserveMm-b.reserveMm)
 return{schema:'had-utility-cold-service-result/1',choice:c,currentTerminalType:rear?'rear-horizontal-source-union':'historical-front-vertical-carrier',ordinaryMainBodyRenewalRequiresRearTreeRemoval:false,wholeTreeReleaseControl:{role:rear?'historical-stress-only-not-current-renewal-acceptance':'historical-front-carrier',nominalMovementMm:nominalCarrierMove,blankGapAfterTwoSettingsMm:blankGap-setting,actualFullPhaseAndToolQualification:false},normalPermanentEnvelopes:normal,actualCarrierAdditionalBareMembers:carrier,retainedColdBlank:{id:rear?'actual main-side rear blank after axial release and controlled tree lowering':'historical blank after carrier first50drop',boxMm:fixedBlankBare},capture:{bareAssemblyMm:captureBare,fullEastSweepMm:captureSweep,parkedMm:parked,upstreamCouponMm:[axis[0],1300,...upCuts],downstreamCouponMm:[axis[0],1900,...downCuts],minimumRealFaceReleaseMm:c.minimumUnionFaceReleaseMm,supportContactsAndResistancesQualified:false},
 inventory:{pipeCylindricalL:r.quantities.referenceWaterKg,fullModuleOuterEnvelopeL:moduleFullOuterL,fullBareElbowBoxesL:bareElbows.reduce((a,b)=>a+b,0),fullOtherComponentBoxesL:volumeExtrasL,isolatedBranchConservativeCeilingL:inventoryCeilingL,usableReceiverMinimumL:c.minimumVerifiedUsableBinL,exteriorPrismGrossReceiverCeilingL:cylindricalBinGrossL,unknownUpperNetworkOrStoreIncluded:false,additionalRearTreeInventoryRequiredBeforeWholeBranchReceiverPass:rear,wholeClosedUInventoryProvedHere:false,metalIncludedInFullBoxesDeliberatelyConservative:true},
 drain:{teeCentreMm:tee,outletMm:tip,controlGripMm:wheel,pipeHighPointGravityHeadMm:vent[2]-tip[2],maximumCountedWetVentEnvelopeTopMm:ventControlBare[2]+ventControlBare[5],maximumVentedGravityHeadMm:ventControlBare[2]+ventControlBare[5]-tip[2],maximumVentedStaticGaugeBar:(ventControlBare[2]+ventControlBare[5]-tip[2])*.0000981,idealOrificeFlowUpperLmin:Math.PI/4*(c.drainOrificeMm/1000)**2*Math.sqrt(2*9.81*(ventControlBare[2]+ventControlBare[5]-tip[2])/1000)*60000,waterBelowTeeRetained:true,retainedSourceRiserCylindricalL:Math.PI/4*(26.06/1000)**2*(teeZ-source[2]),wholeInletFullyEmptyClaimed:false,finiteInventoryBoundAppliesOnlyAfterRealDownstreamBlank:true},
 orderedMethod:rear?['Close actual LodgeU upstream cut and BOTH local washer/sink cold stops; keep internalU open. Independent Plant/hot energy stays behind its actual excluded boundaries. Verify zero pressure before any face release; a later blank is not isolation.','Open the actual high vent and controlled740 source drain with the verified20L receiver already placed. This observer bounds main components only; the same actual rear-tree inventory must be added before whole-U receiver acceptance. Lower tails can retain cold water and are not declared empty. The inlet below740 remains retained wet.','Keep the supported rear source union and local cold tree MADE during ordinary main-body renewal. Neither tree lowering/lobby parking nor assembled bench-frame withdrawal is required. The independent dry-frame members renew separately after head removal and positive temporary support; actual member access/stability proof remains explicit.','For main replacement positively capture the internal main and its adjacent elbows; remove the same two20mm coupons and move100mm east to its captured rest. Independently support both retained pipe ends. The whole connected upstream-of-local-stops inventory must fit the actual receiver; no rear union separation or later blank establishes isolation.','Rebuild, inspect, pressure/leak test, reinstate independently capped vent/drain, local joints and supports before reopening either source. Full local-tree/head/frame strip has its own source-derived phase comparison; no old front carrier is active.']:['Cool and isolate BOTH Lodge supplies, cylinder/store and actual upper networks; open actual fixture drains and verify zero pressure before terminal separation. No finite upper-network inventory is assumed.','Independently restrain the main, fit temporary carrier support, remove the cold split jacket and unmake the authored ground-face union. Existing carrier first50mm downward motion releases the actual joint before265mm east parking.','Fit the matched metal blank to the retained main-side union; only now does the local branch inventory ceiling apply. Open branch-side high vent and controlled east drain into the verified receiver. The inlet riser below the tee remains retained wet.','For retained-body bonnet service use a supported manufacturer-matched tool/withdrawal procedure within the authored upper reserve. No undocumented seat extraction method is accepted.','For complete replacement independently fix the retained upstream horizontal and downstream vertical pipes, capture the module AND its two adjacent elbows, then remove both20mm coupons with captured ordinary cutting tools.','Step from the cutting pose to the separate carrying pose before100mm east movement onto a positively stopped temporary receiver. No stopped compression coupling is a union and no pipe flex or unbalanced hand support is credited.','Rebuild the matched metal repair joints, inspect, pressure/leak test, close vent/drain with independently capped outlets, restore jackets/carrier/host and all local user isolation before occupied use.'],
 checks,failures:checks.filter(k=>k.reserveMm< -1e-6),necessarySpecifiedGeometry:checks.every(k=>k.reserveMm>= -1e-6),
 pressureTemperatureDomain:{minimumRequiredGaugeRatingBar:i.maximumGaugeBar,minimumNormalPartTemperatureRatingC:60,maximumVerifiedColdMaintenanceFluidC:25,actualZeroPressureAndTemperatureVerified:false,allThreadPackingSeatAndCoatingConstituentsAccepted:false},actualDownstreamNetworkIsolationAndBlankingQualified:false,actualUnionTeeDrainVentCapRepairJointProductsQualified:false,allNewExistingMainMatingInterfacesAndNormalLocalJointShapesResolved:false,actualNormalPressureThermalAndReceiverResistancesQualified:false,actualWholeFaultOrElectricalWaterExposureAccepted:false,completeInstallationAccepted:false}
}
