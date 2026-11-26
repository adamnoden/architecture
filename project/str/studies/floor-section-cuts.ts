/** Thin evidence producer: existing native solver plus the shared cut consumer. */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { recoverFloorSectionCuts, compareFloorSectionCuts, type FloorBendingField } from '../../../compiler/reference-house/current-design/structural-floor-cuts.js'
import { recoverFloorTransverseShear, recoverFloorTransverseCuts } from '../../../compiler/reference-house/current-design/structural-floor-transverse.js'

const root = new URL('../../../',import.meta.url)
const directory = new URL('./',import.meta.url)
const proofPath = new URL('floor-section-cuts-proof.json',directory)
const sourcePaths = ['compiler/reference-house/current-design/structural-floor-cuts.ts',
  'compiler/reference-house/current-design/structural-floor-transverse.ts',
  'project/str/studies/floor-section-cuts-inputs.json','project/str/studies/floor-section-cuts.ts',
  'project/str/studies/floor-refinement-execution-limit.json']
const sha = (value: string | Buffer) => createHash('sha256').update(value).digest('hex')
const authored = JSON.parse(readFileSync(new URL('floor-section-cuts-inputs.json',directory),'utf8'))
const python = (args: string[]) => execFileSync('python3',['-B',...args],{
  cwd:root,encoding:'utf8',maxBuffer:8*1024*1024,env:{...process.env,OPENBLAS_NUM_THREADS:'1',OMP_NUM_THREADS:'1'} })
const cases = JSON.parse(python(['-c',"import sys,json;from pathlib import Path;sys.path.insert(0,'project/str/studies');from floor_section_model import load_source;from floor_section_proof import cases;print(json.dumps(cases(load_source(Path('.')))))"])) as [string,Record<string,any>][]
const identities = { ...cases[0]![1].sourceSHA256,...Object.fromEntries(sourcePaths.map(path=>[path,sha(readFileSync(new URL(path,root)))])) }
const equal = (a: unknown,b: unknown) => JSON.stringify(a)===JSON.stringify(b)
const meshCases: [string,Record<string,any>][] = authored.meshPitchesMm.map((pitch: number) => {
  const c=structuredClone(cases.find(([name])=>name==='wet-shifted-quadrature8')![1])
  const v=c.bearingCase.masonryCase.verticalCase
  v.maxPitchMm=pitch;v.monolithicCase.houseCase.joinedCase.floor.maxPitchMm=pitch
  return ['wet-floor-mesh-'+pitch,c]
})
meshCases.push(...authored.operatorSeparatedMeshControls.map((control: {id:string;verticalPitchMm:number;inPlanePitchMm:number}) => {
  const c=structuredClone(cases.find(([name])=>name==='wet-shifted-quadrature8')![1])
  const v=c.bearingCase.masonryCase.verticalCase
  v.maxPitchMm=control.verticalPitchMm;v.monolithicCase.houseCase.joinedCase.floor.maxPitchMm=control.inPlanePitchMm
  return [control.id,c] as [string,Record<string,any>]
}))
const executionLimit = JSON.parse(readFileSync(new URL('floor-refinement-execution-limit.json',directory),'utf8'))
if (executionLimit.schema!=='str-floor-refinement-execution-limit/2'
  || !Array.isArray(executionLimit.attemptedRefinements)
  || executionLimit.attemptedRefinements.some((r:any)=>r.completeNativeResultAvailable!==false || r.convergenceResultAvailable!==false || r.candidateAccepted!==false)) throw new Error('Historical failed execution record changed scope')
// Old killed workers remain historical evidence. They cannot suppress a current complete run.
const selected=[...cases,...meshCases]
const historicalExecutionFailures={state:'historical-source-only',currentExecutionEvidence:false,record:executionLimit}

function check(proof: any) {
  if (proof.schema!=='str-fixed-floor-cut-comparison/2' || !equal(proof.sourceSHA256,identities)
    || !equal(proof.authored,authored) || proof.controls.length!==selected.length) throw new Error('Stale or missing actual floor-cut proof')
  proof.controls.forEach((row: any,i: number)=>{
    const expected=selected[i]!
    if(row.caseId!==expected[0] || !equal(row.executedRequest,expected[1]) || !/^[a-f0-9]{64}$/.test(row.fullResultSHA256)
      || !equal(row.sectionCuts.cuts.map((c: any)=>({id:c.id,normal:c.normal,positionMm:c.positionMm,intervalMm:c.intervalMm})),authored.cuts)
      || row.sectionCuts.stripResistanceAccepted!==false || row.sectionCuts.localStressConvergenceProven!==false
      || row.transverseSectionCuts.completeJointWrenchAvailable!==false || row.transverseSectionCuts.resistanceAccepted!==false
      || !equal(row.transverseSectionCuts.cuts.map((c:any)=>({id:c.id,normal:c.normal,positionMm:c.positionMm,intervalMm:c.intervalMm})),authored.cuts)
      || row.transverseEnergy.relativeResidual>row.transverseEnergy.maximumRelativeResidual
      || row.physicalWetBeamElementCutsAvailable !== (expected[1].wetSupport != null)
      || row.completeWetBeamDemandEnvelopeAvailable !== false
      || (row.wetReceivingGrid !== null && (row.wetReceivingGrid.completePhysicalGridDemandEnvelopeAvailable !== false || row.wetReceivingGrid.gridResistanceAccepted !== false))
      || row.heads.length!==52 || new Set(row.heads.map((h: any)=>h.id)).size!==52) throw new Error('Floor cut evidence lost actual request, material sections,52heads or proof limits')
  })
  if (!equal(proof.historicalExecutionFailures,historicalExecutionFailures)) throw new Error('Historical failures became current numerical evidence')
  for (const [key,from,to] of [['mesh700To500','wet-floor-mesh-700','wet-floor-mesh-500'],['mesh500To250','wet-floor-mesh-500','wet-floor-mesh-250'],['inPlane500To250','wet-floor-mesh-500','wet-floor-mixed-m250-v500'],['vertical500To250AtInPlane250','wet-floor-mixed-m250-v500','wet-floor-mesh-250'],['vertical500To250','wet-floor-mesh-500','wet-floor-mixed-m500-v250'],['inPlane500To250AtVertical250','wet-floor-mixed-m500-v250','wet-floor-mesh-250']]) {
    const a=proof.controls.find((r:any)=>r.caseId===from),b=proof.controls.find((r:any)=>r.caseId===to)
    if (!a||!b||!equal(proof[key!],compareFloorSectionCuts(a,b,authored.stabilityComparison))) throw new Error('Stale or mispaired mesh comparison')
  }
  if (proof.candidateAccepted!==false || proof.completeHouseProof!==false || proof.localCornerJointAccepted!==false) throw new Error('Unearned floor cut acceptance')
}

if(process.argv[2]==='--read-cases') { process.stdout.write(JSON.stringify({sourceSHA256:identities,cases:selected})+'\n') }
else if(process.argv[2]==='--check') { check(JSON.parse(readFileSync(proofPath,'utf8')));process.stdout.write('Current source-bound fixed floor cut comparison checked\n') }
else if(process.argv[2]==='--write') {
  // Reuse only full source/request/checksum-verified captures; absence reruns the solver.
  python(['project/str/studies/floor_section_proof.py','--write'])
  const baseDir=join(tmpdir(),'ovid-seated-wet-controls')
  const meshDir=join(tmpdir(),'ovid-floor-mesh',sha(JSON.stringify(cases[0]![1].sourceSHA256)));mkdirSync(meshDir,{recursive:true})
  const controls=selected.map(([name,request])=>{
    let requestPath: string,full: string,manifest: string
    if(name.startsWith('wet-floor-')) {
      requestPath=join(meshDir,name+'.request.json');full=join(meshDir,name+'.full.json');manifest=join(meshDir,name+'.capture.json')
      if(existsSync(requestPath) && !equal(JSON.parse(readFileSync(requestPath,'utf8')),request)) throw new Error('Mesh capture request differs; preserve and explicitly replace stale capture')
      writeFileSync(requestPath,JSON.stringify(request))
    } else {
      const dirs=readdirSync(baseDir).flatMap(id=>readdirSync(join(baseDir,id)).filter(child=>child.startsWith(name+'-')).map(child=>join(baseDir,id,child)))
      const matches=dirs.filter(d=>{const p=join(d,'request.json');return existsSync(p)&&equal(JSON.parse(readFileSync(p,'utf8')),request)})
      if(matches.length!==1) throw new Error('Ambiguous/missing actual floor capture: '+name)
      requestPath=join(matches[0]!,'request.json');full=join(matches[0]!,'result.full.json');manifest=join(matches[0]!,'capture.json')
    }
    python(['project/str/studies/floor_section_proof.py',existsSync(full)&&existsSync(manifest)?'--verify-capture':'--capture',name,requestPath,full,manifest])
    const result=JSON.parse(readFileSync(full,'utf8')),receipt=JSON.parse(readFileSync(manifest,'utf8'))
    if(sha(readFileSync(full))!==receipt.fullResultSHA256) throw new Error('Full native response checksum changed')
    const support=result.seatedWetSupport
    const transverse=recoverFloorTransverseShear(result.nativeVertical)
    return {caseId:name,executedRequest:request,fullResultSHA256:receipt.fullResultSHA256,
      heads:result.nativeVertical.native.heads,
      sectionCuts:recoverFloorSectionCuts(result.plateBending as FloorBendingField,authored.cuts),
      transverseSectionCuts:recoverFloorTransverseCuts(transverse,authored.cuts),transverseEnergy:transverse.energy,
      wetBearingExactDeclaredFields:support?.posts.map((post:any)=>({id:post.id,...post.exactDeclaredNormalField}))??[],
      physicalWetBeamElementCutsAvailable:support?.plateAttachmentAudit.physicalBeamElementCutsAvailable??false,
      completeWetBeamDemandEnvelopeAvailable:false,
      wetReceivingGrid:support ? Object.fromEntries(['memberIds','physicalElementCutsAvailable','completePhysicalGridDemandEnvelopeAvailable','gridResistanceAccepted','originCount','memberCuts','interiorMemberCuts','memberLoadEquilibrium','nativeSupportReactionsUnchanged','scope','diagnostics'].filter(k=>Object.hasOwn(support.receivingGridCuts,k)).map(k=>[k,support.receivingGridCuts[k]])) : null,
      wetBeamSimultaneousCuts:[...result.nativeVertical.native.memberCuts,...result.nativeVertical.native.interiorMemberCuts].filter((row:any)=>row.memberId.startsWith('WET-SUPPORT/')),
      capturedSourceEquilibriumResidualKN_KNm:receipt.summary.independent52HeadBalanceResidualKN_KNm }
  })
  const compare=(from:string,to:string)=>compareFloorSectionCuts(controls.find(c=>c.caseId===from)!,controls.find(c=>c.caseId===to)!,authored.stabilityComparison)
  const proof={schema:'str-fixed-floor-cut-comparison/2',sourceSHA256:identities,authored,controls,
    mesh700To500:compare('wet-floor-mesh-700','wet-floor-mesh-500'),mesh500To250:compare('wet-floor-mesh-500','wet-floor-mesh-250'),
    inPlane500To250:compare('wet-floor-mesh-500','wet-floor-mixed-m250-v500'),
    vertical500To250AtInPlane250:compare('wet-floor-mixed-m250-v500','wet-floor-mesh-250'),
    vertical500To250:compare('wet-floor-mesh-500','wet-floor-mixed-m500-v250'),
    inPlane500To250AtVertical250:compare('wet-floor-mixed-m500-v250','wet-floor-mesh-250'),historicalExecutionFailures,
    candidateAccepted:false,completeHouseProof:false,localCornerJointAccepted:false,
    scope:'Actual source-bound physical fixed cuts and independently identified52 heads. Plate and in-plane mesh controls separate numerical changes; no resistance, local joint, continuum convergence or house selection follows from a stability screen.'}
  check(proof);writeFileSync(proofPath,JSON.stringify(proof,null,2)+'\n');process.stdout.write(JSON.stringify({mesh700To500:proof.mesh700To500,mesh500To250:proof.mesh500To250,inPlane500To250:proof.inPlane500To250,vertical500To250AtInPlane250:proof.vertical500To250AtInPlane250})+'\n')
} else throw new Error('Use --read-cases, --write or --check')
