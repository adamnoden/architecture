import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs'
import {join,dirname} from 'node:path'
import {spawnSync,execFileSync} from 'node:child_process'
import {stableJsonStringify} from '../../../compiler/core/identity.js'
import {readEngineeringDocument} from '../../../compiler/reference-house/current-design/engineering-document.js'
import {prepareCurrentDesignCompile} from '../../../compiler/reference-house/current-design/compile.js'
import {auditSourceCoverage} from '../../ccr/studies/source-coverage.js'

// Owner-directed combined-source, fixed-command proof. It cannot publish refs, accept materials
// or edit design/stage inputs. Remove this recovery driver after integration.
const directory=process.env.IAS_RECOVERY_PROOF_DIR
assert.ok(directory,'IAS_RECOVERY_PROOF_DIR is required')
mkdirSync(directory,{recursive:true})
const documentPath='project/ccr/studies/working-house-comparison.json'
const accountPath='project/ccr/studies/source-coverage.json'
const manifestPath='project/ias/studies/lighting-circuit-recovery-20261126.json'
const manifest=JSON.parse(readFileSync(manifestPath,'utf8'))
const digest=bytes=>createHash('sha256').update(bytes).digest('hex')
const blob=bytes=>createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex')
const json=path=>JSON.parse(readFileSync(path,'utf8'))
const save=(name,value)=>writeFileSync(join(directory,name),JSON.stringify(value,null,2)+'\n')
const controls=d=>({design:d.design,stages:d.stages})
const frozen=stableJsonStringify(controls(json(documentPath)))
const baseline=json('project/ias/studies/working-study-lighting.results.json').lighting
const commands=[]
const lightingOutputs=[
'adaptable-study-lighting-comparison.svg','adaptable-study-lighting-corner.svg','adaptable-kitchen-lighting.svg',
'adaptable-study-lighting-routes.svg','adaptable-study-lighting-construction.svg','adaptable-study-lighting-common-depth.svg',
'adaptable-study-lighting.results.json','working-study-lighting-circuit.svg','working-study-lighting.results.json',
].map(name=>'project/ias/studies/'+name)
const roomOutputs=[
'crafted-study-eye-level-day.svg','crafted-study-eye-level-evening.svg','working-study-floor.svg',
'working-study-wall-kit.svg','working-study-tile-eye-level.svg',
].map(name=>'project/ias/studies/'+name)
const sourcePaths=[
'compiler/reference-house/current-design/assemblies/study-structural-renewal.ts',
'compiler/reference-house/current-design/assemblies/study-room-kit.ts',
'project/ias/studies/study-structural-renewal.py','project/ias/studies/study-floor-handling.py',
'compiler/reference-house/current-design/assemblies/study-lighting.ts',
'compiler/reference-house/current-design/assemblies/study-lighting-corner.ts',
'compiler/reference-house/current-design-study-lighting.test.ts',
'compiler/reference-house/current-design/assemblies/study-furniture-motion.ts',
'project/ias/studies/adaptable-study-lighting.mjs',
'compiler/reference-house/current-design/assemblies/study-lighting-views.ts',
'compiler/reference-house/current-design-study-lighting-circuit.test.ts',
'compiler/reference-house/current-design/assemblies/study-lighting-circuit.ts',
'project/ias/studies/lighting-component-references.json',
'compiler/reference-house/current-design/assemblies/study-ordinary-handling.ts',
documentPath,'project/ias/adaptable-room-lighting-result.md',
]
const methodRoots=[
'compiler/reference-house/current-design/assemblies/study-structural-renewal.ts',
'compiler/reference-house/current-design/assemblies/study-room-kit.ts',
'project/ias/studies/study-structural-renewal.py','project/ias/studies/study-floor-handling.py',
'compiler/reference-house/current-design/assemblies/study-ordinary-handling.ts',
'compiler/reference-house/current-design/assemblies/study-furniture-motion.ts',
'project/ias/studies/study-furniture-motion.py',
]
function run(name,args,allowStaleBindings=false){
 const result=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:64*1024*1024,timeout:12*60*1000})
 writeFileSync(join(directory,name+'.log'),(result.stdout??'')+(result.stderr??''))
 const row={name,args,status:result.status,signal:result.signal,error:result.error?.message??null}
 commands.push(row);save('commands.json',commands)
 if(result.status!==0){
  const expected=allowStaleBindings&&result.status===1&&(result.stderr??'').includes('Stale canonical working-house bindings; explicitly review/refresh after owning regeneration')
  if(!expected)throw Error(name+' failed: '+JSON.stringify(row))
  return false
 }
 return true
}
async function refreshBindings(name){
 const d=json(documentPath)
 assert.equal(stableJsonStringify(controls(d)),frozen,'Design/stage source changed')
 const observed=await readEngineeringDocument(d.design)
 save(name+'.json',{before:d.bindings,after:observed.bindings,controlsSHA256:digest(frozen)})
 writeFileSync(documentPath,JSON.stringify({...d,bindings:observed.bindings},null,2)+'\n')
 assert.equal(stableJsonStringify(controls(json(documentPath))),frozen)
}
async function regenerateLighting(name){
 if(!run(name,['--import','tsx','project/ias/studies/adaptable-study-lighting.mjs','--write'],true)){
  await refreshBindings(name+'-explicit-bindings')
  run(name+'-fixedpoint',['--import','tsx','project/ias/studies/adaptable-study-lighting.mjs','--write'])
 }
}
let success=false,error=null
try{
 assert.equal(manifest.status,'WIP_FOLLOWON_SOURCE_NOT_VERIFIED')
 assert.deepEqual([...manifest.files.map(f=>f.path)].sort(),[...sourcePaths].sort())
 for(const file of manifest.files){
  const bytes=readFileSync(file.path)
  assert.equal(digest(bytes),file.sha256,'Recovered author bytes differ: '+file.path)
  assert.equal(blob(bytes),file.gitBlob,'Recovered author blob differs: '+file.path)
 }
 const d=json(documentPath),plan=d.stages.studyRoomKit.ordinaryHandling
 assert.equal(digest(JSON.stringify(plan,null,2)+'\n'),'40f66fcf4c8257a3a31cca51110f951b06e89894e3b8fecd6e9460e3c57bb435')
 assert.equal(plan.protocols.length,136)
 assert.equal(plan.minimumBoardFixedClearanceMm,10)
 assert.equal(plan.maximumTravelMm,1450)
 assert.equal(d.stages.distributedFloor.cornerWidthsMm.SW,200)
 save('source-head.json',{commit:process.env.GITHUB_SHA,tree:execFileSync('git',['rev-parse','HEAD^{tree}'],{encoding:'utf8'}).trim(),
  manifest:blob(readFileSync(manifestPath)),controlsSHA256:digest(frozen),sourceFiles:manifest.files,installedAcceptance:false})
 // Authenticate only exact recovered authoring; never rehash a stale receipt.
 const account=json(accountPath)
 for(const familyId of ['ias-study-lighting','ias-study-room-perspective']){
  const family=account.families.find(f=>f.id===familyId);assert.ok(family)
  for(const path of methodRoots)if(!family.authorRoots.includes(path))family.authorRoots.push(path)
 }
 for(const path of sourcePaths.filter(path=>path!==documentPath).concat(methodRoots)){
  const bytes=readFileSync(path)
  assert.equal(blob(bytes),execFileSync('git',['rev-parse','HEAD:'+path],{encoding:'utf8'}).trim(),'Non-committed author: '+path)
  account.gitBlobs[path]=blob(bytes)
 }
 writeFileSync(accountPath,JSON.stringify(account,null,2)+'\n')
 await regenerateLighting('lighting-regenerate')
 const diagnosticKit=await prepareCurrentDesignCompile(d.design).studyRoomKit({schema:'ias-study-room-kit-case/1',units:'mm',...d.stages.studyRoomKit},d.stages.distributedFloor)
 const diagnosticResult=await prepareCurrentDesignCompile(d.design).studyLighting({schema:'ias-study-lighting-case/1',units:'mm',...d.stages.studyLighting},diagnosticKit)
 save('candidate-geometry.json',{status:diagnosticResult.lighting.status,issues:diagnosticResult.lighting.circuit.issues,homeRuns:diagnosticResult.lighting.construction.localHomeRunComparison,corner:diagnosticResult.lighting.corner})
 const dr=diagnosticResult.lighting,cr=dr.circuit.closedSourceFloorRenewal
 save('candidate-closed-room.json',cr)
 console.log('CANDIDATE_GEOMETRY '+JSON.stringify({status:dr.status,issues:dr.circuit.issues,local:dr.construction.localHomeRunComparison.issues,rest:dr.construction.localHomeRunComparison.fieldReservesMm,operation:dr.circuit.applianceLead.operation,appliancePreparedForFloor:dr.circuit.appliancePreparedForFloor,witnessCount:cr?.ordinaryHandling?.witnessCount,preparation:cr?.preparation,furniture:cr?.furniture,failedParts:cr?.ordinaryHandling?.parts.filter(p=>p.state!=='joined-geometry-witness').slice(0,10)}))
 if(dr.circuit.issues.length||dr.construction.localHomeRunComparison.issues.length||cr?.status!=='computed-geometry-witnesses')throw Error('Actual candidate geometry rejected; inspect named witnesses before broader tests')


 // This producer proves current bindings before writing its five actual views.
 run('room-views-regenerate',['--import','tsx','project/ias/studies/crafted-study-eye-level.mjs','--write'])
 const afterViews=json(accountPath),family=afterViews.families.find(f=>f.id==='ias-study-room-perspective')
 for(const path of roomOutputs){
  assert.ok(family.receipts.includes(path),'Room output is outside owning receipts: '+path)
  afterViews.gitBlobs[path]=blob(readFileSync(path))
 }
 writeFileSync(accountPath,JSON.stringify(afterViews,null,2)+'\n')
 await refreshBindings('room-views-explicit-bindings')
 await regenerateLighting('lighting-after-room')
 run('lighting-strict',['--import','tsx','project/ias/studies/adaptable-study-lighting.mjs','--check'])
 run('room-views-strict',['--import','tsx','project/ias/studies/crafted-study-eye-level.mjs','--check'])
 run('types',['node_modules/typescript/bin/tsc','--noEmit'])
 run('focused-lighting',['--import','tsx','--test','compiler/reference-house/current-design-study-lighting.test.ts',
  'compiler/reference-house/current-design-study-lighting-circuit.test.ts','compiler/reference-house/current-design-lighting-producer.test.ts'])
 run('part-plan-controls',['--import','tsx','--test','compiler/reference-house/current-design-study-plan-applicability.test.ts','compiler/reference-house/current-design-study-structural-consequence.test.ts'])
 const document=json(documentPath),compiler=prepareCurrentDesignCompile(document.design)
 const kit=await compiler.studyRoomKit({schema:'ias-study-room-kit-case/1',units:'mm',...document.stages.studyRoomKit},document.stages.distributedFloor)
 const result=await compiler.studyLighting({schema:'ias-study-lighting-case/1',units:'mm',...document.stages.studyLighting},kit)
 const lighting=result.lighting,replay=lighting.circuit.closedSourceFloorRenewal
 assert.equal(replay.status,'computed-geometry-witnesses')
 assert.equal(replay.ordinaryHandling.witnessCount,136)
 assert.equal(replay.ordinaryHandling.partCount,136)
 assert.equal(replay.ordinaryHandling.minimumBoardFixedClearanceMm,10)
 assert.ok(replay.ordinaryHandling.parts.every(p=>p.boardFixedPlanClearanceMm>=10-1e-7))
 assert.deepEqual(replay.preparation.conflictingPhaseIds,[])
 assert.deepEqual(replay.furniture.conflictingPhaseIds,[])
 assert.equal(replay.physicalAcceptance,false)
 assert.equal(replay.ownerAcceptance,false)
 assert.deepEqual(lighting.commonRoom.floorFaces,baseline.commonRoom.floorFaces)
 assert.deepEqual(lighting.commonRoom.occupied,baseline.commonRoom.occupied)
 assert.deepEqual(lighting.commonRoom.bands,baseline.commonRoom.bands)
 assert.deepEqual(lighting.circuit.cableStock.references,['Pyrotenax2L2.5'])
 assert.deepEqual(lighting.circuit.issues,[])
 for(const [name,accepted]of Object.entries(lighting.circuit.qualifications))assert.equal(accepted,name==='designNetsSpecified')
 save('closed136-actual.json',replay)
 save('actual-case-summary.json',{sourceCommit:process.env.GITHUB_SHA,caseDigest:lighting.caseDigest,
  circuitDigest:lighting.circuit.designDigest,contextDigest:replay.contextDigest,requestDigest:replay.requestDigest,
  witnessCount:136,minimumBoardFixedClearanceMm:Math.min(...replay.ordinaryHandling.parts.map(p=>p.boardFixedPlanClearanceMm)),
  physicalAcceptance:false,ownerAcceptance:false,unchangedFloorAndFurniture:true,wholeFeederInstallationFinished:false})
 const audit=auditSourceCoverage();save('source-audit.json',audit);assert.deepEqual(audit.findings,[])
 assert.equal(stableJsonStringify(controls(json(documentPath))),frozen)
 for(const file of manifest.files.filter(f=>f.path!==documentPath))assert.equal(digest(readFileSync(file.path)),file.sha256)
 const changed=execFileSync('git',['diff','--name-only'],{encoding:'utf8'}).trim().split('\n').filter(Boolean)
 const allowed=new Set([accountPath,documentPath,...lightingOutputs,...roomOutputs])
 assert.ok(changed.every(path=>allowed.has(path)),'Unexpected tracked mutation: '+changed)
 save('generated-files.json',changed.map(path=>({path,sha256:digest(readFileSync(path)),gitBlob:blob(readFileSync(path))})))
 success=true
}catch(caught){error=caught?.stack??String(caught);writeFileSync(join(directory,'failure.log'),error+'\n')}
finally{
 const patch=execFileSync('git',['diff','--binary'],{maxBuffer:64*1024*1024})
 writeFileSync(join(directory,'generated.patch'),patch)
 for(const path of [accountPath,documentPath,...lightingOutputs,...roomOutputs]){
  const target=join(directory,'generated',path);mkdirSync(dirname(target),{recursive:true});copyFileSync(path,target)
 }
 save('outcome.json',{sourceCommit:process.env.GITHUB_SHA,success,error,generatedPatchSHA256:digest(patch),
  noRefPublication:true,noInstallationMaterialPhysicalOrOwnerAcceptance:true,requiresIntegrationReview:true})
 console.log(JSON.stringify({success,error,sourceCommit:process.env.GITHUB_SHA,artifactDirectory:directory,
  generatedPatchSHA256:digest(patch),noRefPublication:true}))
}
if(!success)process.exitCode=1
