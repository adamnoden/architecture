import {execFileSync} from 'node:child_process'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {sha256SemanticFingerprint} from '../../core/identity.js'
import {expandPlan,intersectPlan,validPlanRectangle,type PlanRectangle} from './inlet-orthogonal-plan.js'

/** Geometry comes from the single saved distributedFloor width. No HAD width. */
export type InletCornerContext={
 schema:'had-distributed-corner-context/1';controllingStage:'distributedFloor';controllingField:'cornerWidthsMm.SE';stageCaseDigest:string;nativeReaderMethodSHA256:string
 geometry:{schema:'str-native-corner-section-geometry/1';cornerId:'SE';widthMm:number;originXYMm:readonly[number,number];rectanglesXYMm:readonly PlanRectangle[];areaMm2:number;sourceSHA256:Readonly<Record<string,string>>;caseAccepted:false;finishOrRoomGeometryIncluded:false}
}
export function admitInletCornerContext(value:unknown,expectedOrigin:readonly number[]):InletCornerContext{
 const c=value as InletCornerContext,g=c?.geometry
 if(c?.schema!=='had-distributed-corner-context/1'||c.controllingStage!=='distributedFloor'||c.controllingField!=='cornerWidthsMm.SE'||!/^[a-f0-9]{64}$/.test(c.stageCaseDigest)||!/^[a-f0-9]{64}$/.test(c.nativeReaderMethodSHA256)
  ||g?.schema!=='str-native-corner-section-geometry/1'||g.cornerId!=='SE'||!Number.isFinite(g.widthMm)||g.widthMm<140||g.widthMm>240||g.caseAccepted!==false||g.finishOrRoomGeometryIncluded!==false
  ||!Array.isArray(g.originXYMm)||g.originXYMm.length!==2||g.originXYMm.some((v,k)=>v!==expectedOrigin[k])||!Array.isArray(g.rectanglesXYMm)||g.rectanglesXYMm.length!==2||g.rectanglesXYMm.some(r=>!validPlanRectangle(r))
  ||!Number.isFinite(g.areaMm2)||Math.abs(g.rectanglesXYMm.reduce((n,r)=>n+(r[2]-r[0])*(r[3]-r[1]),0)-g.areaMm2)>1e-8
  ||!g.sourceSHA256||Object.keys(g.sourceSHA256).length!==4||Object.entries(g.sourceSHA256).some(([p,h])=>!/^project\/str\/studies\/[A-Za-z0-9_.-]+$/.test(p)||!/^[a-f0-9]{64}$/.test(h)))throw Error('Fresh same-stage native SE geometry context required')
 if(intersectPlan(g.rectanglesXYMm[0],g.rectanglesXYMm[1])||Math.abs(g.rectanglesXYMm[0][2]-g.rectanglesXYMm[0][0]-g.widthMm)>1e-8||Math.abs(g.rectanglesXYMm[1][3]-g.rectanglesXYMm[1][1]-g.widthMm)>1e-8)throw Error('Native corner width/union is inconsistent')
 return structuredClone(c)
}
const root=new URL('../../../',import.meta.url),reader='project/str/studies/finite_joint_geometry.py'
const readerHash=()=>createHash('sha256').update(readFileSync(new URL(reader,root))).digest('hex')
/** Native geometry read only: no finite house is built or solved. */
export function readInletCornerContext(widthMm:number,stageCaseDigest:string):InletCornerContext{
 const geometry=JSON.parse(execFileSync('python3',['-B',fileURLToPath(new URL(reader,root)),String(widthMm),'--corner','SE','--root',fileURLToPath(root)],{encoding:'utf8',maxBuffer:1024*1024}))
 return{schema:'had-distributed-corner-context/1',controllingStage:'distributedFloor',controllingField:'cornerWidthsMm.SE',stageCaseDigest,nativeReaderMethodSHA256:readerHash(),geometry}
}
export function replayInletCornerContext(value:unknown,expectedOrigin:readonly number[]){
 const c=admitInletCornerContext(value,expectedOrigin),fresh=readInletCornerContext(c.geometry.widthMm,c.stageCaseDigest)
 if(sha256SemanticFingerprint(c)!==sha256SemanticFingerprint(fresh))throw Error('Stale or modified same-stage SE native geometry')
 return c
}
export function utilityCornerBoundary(context:InletCornerContext,room:readonly number[],finishThicknessMm:number){
 if(room.length!==4||!room.every(Number.isFinite)||!Number.isFinite(finishThicknessMm)||finishThicknessMm<=0||finishThicknessMm>50)throw Error('Bound occupied room and actual lining required')
 const envelope=[room[0],room[1],room[0]+room[2],room[1]+room[3]] as const,finished=context.geometry.rectanglesXYMm.map(r=>expandPlan(r,finishThicknessMm)),notches=finished.flatMap(r=>{const p=intersectPlan(envelope,r);return p?[p]:[]})
 return{schema:'had-utility-native-corner-boundary/1',context:structuredClone(context),contextDigest:sha256SemanticFingerprint(context),physicalCoreRectanglesXYMm:context.geometry.rectanglesXYMm,liningThicknessMm:finishThicknessMm,finishedCoreRectanglesXYMm:finished,actualPanExclusionsXYMm:notches,roomEnvelopePlanMm:room,wholeRoomEnvelopeUnchanged:true,sourceWidthControlAdded:false,oldRectangularPanEvidenceApplicable:notches.length===0,installedAcceptance:false}
}
export function runUtilityCornerHost(context:InletCornerContext,liningThicknessMm:number,waterTerminalLocalMm:readonly number[],carrierChoice?:unknown,maximumGaugeBar?:number){
 const path='project/had/studies/utility-corner-host.py',request={geometry:context.geometry,liningThicknessMm,waterTerminalLocalMm,...(carrierChoice?{carrierChoice,maximumGaugeBar}: {})},output=JSON.parse(execFileSync('python3',['-B',fileURLToPath(new URL(path,root))],{input:JSON.stringify(request),encoding:'utf8',maxBuffer:4*1024*1024}))
 if(output.schema!=='had-utility-corner-host-result/1'||sha256SemanticFingerprint(output.nativeCornerGeometry)!==sha256SemanticFingerprint(context.geometry)||output.physicalHandlingPressureMaterialAndSupportAccepted!==false||typeof output.necessaryGeometryComparisons!=='boolean')throw Error('Utility corner host lost actual geometry or qualification boundary')
 for(const [p,h] of Object.entries(output.sourceSHA256??{}))if(!/^project\/[A-Za-z0-9/_.-]+$/.test(p)||p.split('/').includes('..')||createHash('sha256').update(readFileSync(new URL(p,root))).digest('hex')!==h)throw Error('Stale Utility corner host source: '+p)
 return output as typeof output&{necessaryGeometryComparisons:boolean;sourceSHA256:Record<string,string>;revisedUtility:{sink:number[];seatPlan:number[][];rearServiceChase:number[];acquiredBranchFloor:number[];waterConnectionAxis:number[];retainedWasteCap:number[];localWasherStopRetired:true;ordinaryIsolation:string;wholeRoomEnvelopeChanged:false}}
}
