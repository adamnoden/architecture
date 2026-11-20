import {createHash} from 'node:crypto'
import {readFileSync} from 'node:fs'
import {sha256SemanticFingerprint} from '../../core/identity.js'
import type {CurrentDesignResolution} from './resolve.js'
import type {compileFixedInletCandidate} from './inlet-fixed-entry.js'
import {compareFixedInletThermalRoute} from './inlet-fixed-thermal.js'
import {compareFixedInletReceiver,fixedInletSupportLayout} from './inlet-fixed-receiver.js'
import {compareCompactFixedInletReceiver,fixedInletCompactSocketSource} from './inlet-fixed-compact-receiver.js'

type Candidate=ReturnType<typeof compileFixedInletCandidate>
const portalPath='project/str/studies/floor-portal-interface-review.json'
const cagePath='project/str/studies/reconciled-house-interface.json'
const blob=(bytes:Buffer)=>createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex')

function readBound<T>(resolved:CurrentDesignResolution,path:string,identities:Record<string,string>):T{
  const bytes=readFileSync(new URL('../../../'+path,import.meta.url)),actual=blob(bytes)
  const expected=resolved.disciplineBindings.flatMap(binding=>binding.identities[path]?[binding.identities[path]]:[])
  if(!expected.length||expected.some(value=>value!==actual))throw new Error('Stale current fixed-inlet support source: '+path)
  identities[path]=actual
  return JSON.parse(bytes.toString('utf8')) as T
}

export function compareCurrentFixedInletSupport(resolved:CurrentDesignResolution,candidate:Candidate){
  if(!resolved.disciplineBindings.length||candidate.source.planDigest!==sha256SemanticFingerprint(resolved.design))throw new Error('Current inlet support requires the same resolved design and fixed-inlet candidate')
  if(candidate.method.gitBlob!==blob(readFileSync(new URL('./inlet-fixed-entry.ts',import.meta.url)))||
      candidate.method.operatingGitBlob!==blob(readFileSync(new URL('./inlet-fixed-operating.ts',import.meta.url))))throw new Error('Stale current fixed-inlet candidate method')
  const identities:Record<string,string>={}
  const portal=readBound<{geometry:{jambQmm:number[];jambNormalAlongMM:number[];occurrences:{face:string;opening:string;jambAxisPmm:number;jambPmm:number[]}[]}}>(resolved,portalPath,identities)
  const cageSource=readBound<{openingEdits:{level:string;side:string;id:string;old:number;new:number;sill:number;head:number}[];jambAndTies:{widthNormalAlong:number[];portalCoreQ:number[];continuousJambH12X:number[];continuousJambH12Q:number[]}}>(resolved,cagePath,identities)
  const cage=cageSource.jambAndTies
  if(JSON.stringify(cage.widthNormalAlong)!==JSON.stringify(portal.geometry.jambNormalAlongMM)||JSON.stringify(cage.portalCoreQ)!==JSON.stringify(portal.geometry.jambQmm))throw new Error('Current fixed-inlet receiver cage and portal geometry disagree')
  if(candidate.source.inputs[portalPath]!==identities[portalPath])throw new Error('Current fixed-inlet support cannot mix candidate and portal revisions')
  const hostJambs=portal.geometry.occurrences.filter(row=>row.face==='outer-south'&&row.opening==='south-window-4').sort((a,b)=>a.jambAxisPmm-b.jambAxisPmm)
  const axes=hostJambs.map(row=>row.jambAxisPmm)
  if(axes.length!==2)throw new Error('Current fixed-inlet support requires the actual paired south-window jambs')
  const edit=cageSource.openingEdits.find(row=>row.level==='GROUND'&&row.side==='outer-south'&&row.id==='south-window-4')
  const accepted=resolved.design.storeys.GROUND.openings.find(row=>row.id==='GROUND/south-window-4')
  const candidateClearXMm=[hostJambs[0].jambPmm[1],hostJambs[1].jambPmm[0]]
  if(!edit||!accepted||accepted.centreMm!==edit.old||candidateClearXMm[1]-candidateClearXMm[0]!==accepted.widthMm||
    (candidateClearXMm[0]+candidateClearXMm[1])/2!==edit.new||![edit.sill,edit.head].every(Number.isFinite)||edit.head<=edit.sill)throw new Error('Current fixed-inlet host window sources disagree')
  const hostWindow={id:accepted.id,wallId:accepted.hostWallId,candidateClearXMm,
    acceptedClearXMm:[accepted.centreMm-accepted.widthMm/2,accepted.centreMm+accepted.widthMm/2],
    sillZMm:edit.sill,headZMm:edit.head,jambsXMm:hostJambs.map(row=>row.jambPmm),jambNormalYMm:portal.geometry.jambQmm,
    status:'conditional-structural-rewind' as const,headDatum:'source arched-opening head; bounding datum is not a rectangular clear aperture',
    source:{openingEditsPath:cagePath,openingEditsGitBlob:identities[cagePath],jambsPath:portalPath,jambsGitBlob:identities[portalPath]}}
  const pipe=candidate.productFacts.pressurePipe
  const guideZ=candidate.settings.upperPipeGuideZMm
  if(typeof guideZ!=='number'||!Number.isFinite(guideZ))throw new Error('Current support requires the actual authored upperPipeGuideZMm setting')
  const layout={...fixedInletSupportLayout,guideZMm:guideZ}
  const thermal=candidate.branches.map(branch=>({branch:branch.branch,result:compareFixedInletThermalRoute({
    pathMm:branch.pressurePathMm,fixedPointZMm:layout.fixedPointZMm,guideZMm:layout.guideZMm,temperatureExcursionK:candidate.settings.localPipeTemperatureRangeK,
    pipe:{outerDiameterMm:pipe.outerDiameterMm,wallMm:pipe.minimumWallMm,elasticModulusMpa:pipe.elasticModulusMpa,poissonRatio:.3,expansionMmMK:pipe.expansionMmMK}})}))
  const receiverInput={layout,jambAxesXMm:axes,jambNormalFacesYMm:portal.geometry.jambQmm,jambAlongWidthMm:portal.geometry.jambNormalAlongMM[1],
    finishedWallYMm:candidate.branches[0].lowerTurn.finishedWallYMm,
    sourceCage:{longitudinalDiameterMm:12,transverseDiameterMm:null,normalBarAxesMm:cage.continuousJambH12Q,
      alongBarOffsetsMm:cage.continuousJambH12X,requiredCoverMm:25},
    pipe:{outerDiameterMm:pipe.outerDiameterMm,wallMm:pipe.minimumWallMm,stockMassKgM:pipe.massKgM},toolActionN:null,
    branches:candidate.branches.map((branch,i)=>({id:branch.branch,pipeAxisXMm:branch.pressurePathMm[0][0],riserYMm:candidate.settings.riserYMm,
      pressureEndForceN:branch.support.blockedEndThrustN,fullyRestrainedThermalForceN:branch.support.whollyRestrainedThermalForceN,knownStockMassKg:branch.support.centrelineStockMassKg,
      lowerRepairCutZMm:branch.repairZones[0].cutZMm,secondUpperRepairCutZMm:branch.repairZones[1].secondPlainPipeCutZMm,
      guidedThermalActions:{fixedPointWrench:thermal[i].result.combinedFixedPointWrench,guideWrench:thermal[i].result.guideWrench}}))}
  const receivers={guidedRoute:compareFixedInletReceiver(receiverInput,'guided-route'),fullRestraintAdverse:compareFixedInletReceiver(receiverInput,'full-restraint')}
  const socketBlob=blob(readFileSync(new URL('../../../'+fixedInletCompactSocketSource.path,import.meta.url)))
  if(socketBlob!==fixedInletCompactSocketSource.gitBlob)throw new Error('Stale compact receiver local socket source')
  identities[fixedInletCompactSocketSource.path]=socketBlob
  const compactReceiver=compareCompactFixedInletReceiver(receivers.guidedRoute,{hoods:candidate.branches.map(b=>{
    const h=b.controlArrangementComparison.wholeOrdinaryValveHood
    return {branch:b.branch,bodyMm:h.bodyMm,metalFunnelDropMm:h.metalFunnelDropMm,normalOpeningBodyMm:h.normalControlOpening.uHoodBodyMm,normalFrontDrawMm:h.normalControlOpening.frontDrawMm}
  }),renewals:candidate.branches.map(b=>{
    const curve=b.lowerTurn.drawingPathMm.slice(1,-1),radius=b.lowerTurn.radiusMm
    const curveHausdorffMm=Math.max(0,...curve.slice(1).map((p,i)=>{const chord=Math.hypot(...p.map((n,k)=>n-curve[i][k]));return radius-Math.sqrt(Math.max(0,radius**2-chord**2/4))}))
    return {branch:b.branch,translationMm:b.renewal.translationMm,sweptCentrelineBoxesMm:b.renewal.sweptCentrelineBoxesMm,
      bareRadiusMm:pipe.outerDiameterMm/2,curveHausdorffMm,jacketStripped:b.renewal.removableJacketStripped}
  }),toolPoses:candidate.operatingProof.toolPoses})
  const methodPaths=['inlet-fixed-support-integration.ts','inlet-fixed-thermal.ts','inlet-fixed-receiver.ts','inlet-fixed-compact-receiver.ts']
  const methods=Object.fromEntries(methodPaths.map(path=>[path,blob(readFileSync(new URL('./'+path,import.meta.url)))]))
  const source={planDigest:candidate.source.planDigest,candidateCaseDigest:candidate.source.caseDigest,
    insertCaseDigest:candidate.source.insertCaseDigest,faultCaseDigest:candidate.source.faultCaseDigest,
    candidateMethod:candidate.method,inputs:identities}
  return {schema:'had-current-fixed-inlet-support/2' as const,status:'source-bound-support-development-comparison' as const,
    source,caseDigest:sha256SemanticFingerprint({source,methods,receiverInput,hostWindow}),methods,hostWindow,
    constitutiveAssumptions:{poissonRatio:.3,status:'authored linear-elastic constitutive comparison'},
    thermal,receivers,compactReceiver,diagnostics:[...new Set([...receivers.guidedRoute.diagnostics,...receivers.fullRestraintAdverse.diagnostics,...compactReceiver.diagnostics])],
    evidence:{sameCandidateAndStructuralSources:true,actualToolActionN:null,clampGuideAndGroupCapacityQualified:false,
      fullLodgeAndHouseSupportNetworkEstablished:false,completeSupportCapacity:false,selectedHouseAdoption:false,installedAcceptance:false}}
}
