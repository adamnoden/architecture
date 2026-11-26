/** Joined cold/hot normal observer: one current choice, one source geometry.
 * Head-first/bolted-member renewal is current; full-tree parking is history. */
import {sha256SemanticFingerprint} from '../../core/identity.js'
import {inletUtilityRearTree,admitUtilityRearTreeChoice} from './inlet-utility-rear-tree.js'
import {deriveUtilityHotHead,type UtilityHotHeadChoice} from '../../../project/had/studies/utility-hot-head.mjs'
import {inletUtilityOrdinaryCapture} from './inlet-utility-member-renewal.js'
import type {readUtilityCurrentGeometrySource} from './inlet-utility-proof-source.js'
type B=readonly[number,number,number,number,number,number]
type P=readonly[number,number,number]
const gap=(a:B,b:B)=>{const d=[0,1,2].map(k=>Math.max(a[k]-b[k]-b[k+3],b[k]-a[k]-a[k+3]));return d.some(v=>v>0)?Math.hypot(...d.map(v=>Math.max(v,0))):Math.max(...d)}
export function inletUtilityWetAssembly(i:{source:ReturnType<typeof readUtilityCurrentGeometrySource>;choice?:unknown}){
 const s=i.source,c=admitUtilityRearTreeChoice(i.choice??s.choice),
  solidHead=(c.coldDistribution as unknown as{prefabSinkHead:{topSolidPlansMm:readonly(readonly[number,number,number,number])[];topZMm:readonly[number,number]}}).prefabSinkHead,
  headBoards=solidHead.topSolidPlansMm.map((p,k)=>({id:'current-prefab-board/'+k,boxMm:[p[0],p[1],solidHead.topZMm[0],p[2],p[3],solidHead.topZMm[1]-solidHead.topZMm[0]] as B,presence:'head-before-strip' as const})),
  boundContext={...s.rearTreeContext,obstacles:s.rearTreeContext.obstacles.flatMap(q=>q.id==='current-prefab-board/0'?headBoards:q.id.startsWith('current-prefab-board/')?[]:[q])},
  boundSource={...s,rearTreeContext:boundContext},
  cold=inletUtilityRearTree({choice:c,context:boundContext}),
  d=c.coldDistribution,h=d.prefabSinkHead,
  hotChoice=(d as unknown as {hotService:UtilityHotHeadChoice}).hotService
 if(!hotChoice||hotChoice.minimumRequiredGaugeRatingBar<s.input.maximumGaugeBar||hotChoice.normalWaterDesignTemperatureC<60||!s.rearTreeContext.obstacles.length||s.actualHot.backbone.length!==5)throw Error('Current source-bound hot choice/context required')
 const bowl:B=[h.bowlPlanMm[0],h.bowlPlanMm[1],h.bowlBottomMm,h.bowlPlanMm[2],h.bowlPlanMm[3],h.floodRimMm-h.bowlBottomMm],
  fixed=boundContext.obstacles.filter(o=>o.presence!=='carry-bar-after-park').map(o=>({id:o.id,boxMm:o.boxMm})),
  coldNormal=cold.geometry.parts.filter(p=>!p.cap).map(p=>({id:'current-cold/'+p.id,boxMm:p.wrapped})),
  hotInput={choice:hotChoice,sourceHotVertices:s.actualHot.backbone,head:h,obstacles:[...fixed,{id:'current-prefab-bowl',boxMm:bowl},...coldNormal],settingEachMm:s.rearTreeContext.settingEachMm},
  hotBeforeCapture=deriveUtilityHotHead(hotInput),
  ordinaryCapture=inletUtilityOrdinaryCapture({source:boundSource,wet:{choice:c,cold,hot:hotBeforeCapture}}),
  hot=deriveUtilityHotHead({...hotInput,capturePhase:ordinaryCapture.sourceBoundCapturePhase,captureBindingDigest:ordinaryCapture.sourceDigest}),
  unionVsCold=coldNormal.flatMap(p=>hot.normalPermanentEnvelopes.map(q=>({id:p.id+'/'+q.id,reserveMm:gap(p.boxMm,q.boxMm)-2*s.rearTreeContext.settingEachMm}))).sort((a,b)=>a.reserveMm-b.reserveMm),
  headBeforeHotSpoolLiftMm=hot.headFirstRelease.headFirstUpMm-hot.headFirstRelease.thenCapturedSpoolUpMm-2*s.rearTreeContext.settingEachMm,
  normalNecessary=cold.geometry.normalNecessary&&hot.geometry.necessarySpecifiedGeometry&&ordinaryCapture.normalCompleteHeadNecessary
 cold.geometry.checks.push(...ordinaryCapture.normalHeadChecks.map(q=>({...q,phase:'normal'})))
 cold.geometry.failures.push(...ordinaryCapture.normalHeadFailures.map(q=>({...q,phase:'normal'})))
 cold.geometry.normalNecessary=cold.geometry.normalNecessary&&ordinaryCapture.normalCompleteHeadNecessary
 hot.geometry.checks.push(...ordinaryCapture.normalHeadChecks.map(q=>({id:q.id,kind:'normal-complete-head',reserveMm:q.reserveMm})))
 hot.geometry.failures.push(...ordinaryCapture.normalHeadFailures.map(q=>({id:q.id,kind:'normal-complete-head',reserveMm:q.reserveMm})))
 hot.geometry.necessarySpecifiedGeometry=hot.geometry.necessarySpecifiedGeometry&&ordinaryCapture.normalCompleteHeadNecessary
 return{schema:'had-utility-current-wet-assembly/1',choice:c,source:{bindingDigest:s.bindingDigest,caseDigest:sha256SemanticFingerprint({choice:c,context:boundContext}),currentSavedDocumentAdmitted:false},cold,hot,ordinaryCapture,
  normal:{necessaryKnownGeometry:normalNecessary,wholeHeadGeometryIncluded:true,headFailures:ordinaryCapture.normalHeadFailures,coldHotMinimum:unionVsCold[0],coldHotChecks:unionVsCold,coldFailures:cold.geometry.failures.filter(q=>['normal','operation','fitting-legs','nonmate-metal'].includes(q.phase)),hotFailures:hot.geometry.failures},
  renewal:{method:'head-first-and-independently-bolted-frame-members',wholeColdTreeRemovalRequired:false,mainSourceUnionStaysMadeForOrdinaryMainBodyReplacement:true,headBeforeSpoolReserveAfterTwoSettingsMm:headBeforeHotSpoolLiftMm,actualColdAndHotIsolationAndDrainingQualified:false,actualIndependentWaterSupportsAndMemberToolsQualified:false,frontUpperRailMustBeRemovedBeforeSpoolNorth:true,conditionalHotSpoolSweepGeometry:hot.renewalGeometry,headFullRemovalAndTemporaryStabilityProofAccepted:false},
  inventories:{coldControlledReceiver:cold.inventory,hotH0LowerBranchUpperLitres:hot.inventory.isolatedH0LowerBranchUpperL,hotReceiverMinimumLitres:hot.receiver.requiredVerifiedNetL,hotMaximumBatchLitres:hot.receiver.maximumPartialBatchL,sourceStopStoreOrMachineInventoriesSilentlyBounded:false},
  physicalInstallationAdmitted:false,completeInstallationAccepted:false}
}
