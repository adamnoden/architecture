import {execFileSync} from 'node:child_process'
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {deriveCurrentHouse} from '../../had/studies/current-house.mjs'
import {inletRoomPocket,inletServiceRoomPlans} from '../../../compiler/reference-house/current-design/inlet-room-pocket.js'
import {inletKnownFloorBody} from '../../../compiler/reference-house/current-design/inlet-known-gravity.js'
import {readLocalUtilityPocketSettings} from '../../../compiler/reference-house/current-design/inlet-source-envelope.js'
import {assertGroundPocketResponseIdentity,groundPocketPaths} from '../../../compiler/reference-house/current-design/structural-ground-pockets.js'
import {readGroundPocketSettings} from '../../../compiler/reference-house/current-design/structural-ground-pocket-settings.js'
import {admitSplitPlantRoomChoice} from '../../../compiler/reference-house/current-design/inlet-split-plant-room-choice.js'
import {auditSourceCoverage} from '../../ccr/studies/source-coverage.js'
import {sha256SemanticFingerprint as digest} from '../../../compiler/core/identity.js'
const root=fileURLToPath(new URL('../../../',import.meta.url))
const folder=process.argv[2]
if(!folder)throw Error('Explicit output folder required')
mkdirSync(folder,{recursive:true})
const sha=p=>createHash('sha256').update(readFileSync(root+p)).digest('hex')
const read=p=>JSON.parse(readFileSync(root+p,'utf8'))
const python=code=>JSON.parse(execFileSync('python3',['-B','-c',code],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024}))
// Only the previous authored REQUEST is read as a comparison recipe. No old
// numerical response, forces, reactions or body geometry supplies the new model.
const prior=python("import json,tarfile;from pathlib import Path;p=Path('project/str/studies/service-room-ground-receiver-captures-20261126.tar.xz');a=tarfile.open(p);v=json.load(a.extractfile('saved-document-and-result.json'));r=v['groundPocketLoads']['request'];print(json.dumps({'caseId':r['caseId'],'nativeCase':r['nativeCase'],'settings':r['settings'],'stockSource':r['stockSource'],'structuralFloorBodies':r['structuralFloorBodies']}))")
const ground=python("import json,sys;from pathlib import Path;sys.path.insert(0,'project/str/studies');from dry_side_ground_section import read_section_case,derive_section;r=Path('.');d=json.loads((r/'project/str/studies/dry-side-ground-section.json').read_text());c=read_section_case(d);raw={p:(r/p).read_bytes() for p in c['sources']};print(json.dumps({'case':c,'result':derive_section(c,raw)}))")
const house=deriveCurrentHouse(),plans=inletServiceRoomPlans(house.model),utility=readLocalUtilityPocketSettings(),plant=admitSplitPlantRoomChoice(read('project/had/studies/inlet-split-plant-room-candidate.json')),grid=read('project/str/studies/current-house-grid.json')
const authored={schema:'str-proposed-current-ground-stock-recipe/1',currentSavedDocumentAdmitted:false,groundCase:ground.case,utilityPocket:{depthMm:utility.catchmentPocketDepthMm,isolationGapMm:utility.catchmentIsolationGapMm},plantPocket:{depthMm:plant.localPocketDepthMm,isolationGapMm:plant.isolationGapMm}}
const z=ground.result.levelsMm
const levels={mineralCourse:z.mineralCourse,dryRC:z.dryRC,glass:z.glass,accessibleDistribution:z.accessibleDistribution,finish:z.finish,ffl:z.ffl,coldGridTop:z.coldGridTop}
const sourcePaths=['project/str/studies/current_two_room_proposed.mjs','compiler/reference-house/current-design/inlet-room-pocket.ts','compiler/reference-house/current-design/inlet-known-gravity.ts','compiler/reference-house/current-design/inlet-source-envelope.ts','project/had/studies/inlet-split-plant-room-candidate.json','project/str/studies/dry_side_ground_section.py','project/str/studies/dry-side-ground-section.json','project/ias/studies/utility-host-revised-route.py','project/ias/studies/utility-host-revised-route.json','project/ias/studies/utility-host-revised-route.svg']
const source={schema:'str-proposed-input-floor-body-source/1',currentSavedDocumentAdmitted:false,proposedRecipeDigest:digest(authored),actualSourceSHA256:Object.fromEntries(sourcePaths.map(p=>[p,sha(p)])),currentHouseInputGitBlobs:house.inputs}
const densities={rc:ground.case.settings.rcDensityKNm3,mineral:ground.case.settings.mineralDensityBudgetKNm3}
const pockets=['utility','plant'].map(roomId=>inletRoomPocket({levels,roomPlanMm:plans[roomId],...authored[roomId+'Pocket'],grid,rcDensityKNm3:densities.rc,mineralDensityKNm3:densities.mineral,roomId}))
const bodies=pockets.map(p=>{if(!p.local)throw Error('Actual local room pocket required');return inletKnownFloorBody(p.local,{source,groundFflMm:z.ffl,coldGridTopMm:z.coldGridTop,forceDensitiesKNm3:densities}).body})
const geometryKeys=['id','rcRectangleXYMm','rcZMm','rcUnitWeightKNPerM3','mineralZMm','mineralUnitWeightKNPerM3','disjointContactRectanglesXYMm','profile','independentKnownGravity','requiredUnrepresentedPlinthMm']
const physical=b=>Object.fromEntries(geometryKeys.map(k=>[k,b[k]]))
const sameGeometry=digest(bodies.map(physical))===digest(prior.structuralFloorBodies.map(physical))
const audit=auditSourceCoverage()
const report={schema:'str-proposed-current-ground-stock-preparation/1',currentSavedDocumentAdmitted:false,sourceCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),authored,source,plans,levels,structuralFloorBodies:bodies,physicalBodiesEqualPriorComparator:sameGeometry,priorRequestRecipe:{caseId:prior.caseId,nativeCase:prior.nativeCase,settings:prior.settings,stockSource:prior.stockSource},sourceAuditFindings:audit.findings,candidateAccepted:false,wholeHouseAccepted:false,newWaterLayoutCredit:false,legacyHost40mmMechanicalCredit:false}
writeFileSync(folder+'/proposed-current-ground-preparation.json',JSON.stringify(report,null,2)+'\n')
console.log('PROPOSED_CURRENT_GROUND_PREPARATION '+JSON.stringify({...report,priorRequestRecipe:{caseId:prior.caseId,settings:prior.settings,nativePhysicalRequestSHA256:digest(prior.nativeCase)},structuralFloorBodies:bodies.map(physical)}))
if(!sameGeometry)throw Error('Current pure owning functions do not reconstruct the previous two-room physical stock; stop before any native solve')

if(process.argv.includes('--capture')){
 const actual58=python("import json,sys;from pathlib import Path;sys.path.insert(0,'project/str/studies');from floor_section_model import load_source;print(json.dumps(load_source(Path('.'))['identities']))")
 if(Object.keys(actual58).length!==58)throw Error('Exact actual58 native source inventory required')
 // The prior authored native input is an explicit comparison recipe only.
 // Every source identity is replaced before genuine execution; no response or
 // force array is read. The owning native solver revalidates this request.
 const changedNativeSources=Object.keys(actual58).filter(p=>prior.nativeCase.sourceSHA256[p]!==actual58[p]).sort()
 if(JSON.stringify(changedNativeSources)!==JSON.stringify(['project/str/studies/distributed_floor_compatibility.py','project/str/studies/perforated_floor_condensation.py']))throw Error('Only exact two approved native corrections may differ from the previous authored recipe')
 const nativeCase=structuredClone(prior.nativeCase),rebound=[]
 const rebind=(node,path='')=>{
  if(!node||typeof node!=='object')return
  for(const [key,value] of Object.entries(node)){
   const here=path+'/'+key
   if(key==='sourceSHA256'){
    if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Unsupported authored source tuple')
    for(const p of Object.keys(value)){if(!actual58[p])throw Error('Authored native source outside actual58: '+p);value[p]=actual58[p]}
    rebound.push(here)
   }else rebind(value,here)
  }
 }
 rebind(nativeCase)
 if(digest(nativeCase.sourceSHA256)!==digest(actual58))throw Error('Native comparison lost complete current58')
 const controls=readGroundPocketSettings({schema:'str-ground-pocket-settings/1',id:'STR/HAD/known-ground-stock',execution:'compute',settings:prior.settings})
 const stockSource={schema:'str-proposed-current-ground-stock-source/1',currentSavedDocumentAdmitted:false,proposedRecipe:authored,actualSource:source,sourceAuditFindings:audit.findings,nativeInputRecipe:{origin:'previous authored comparison request; no retained response consumed',sourceArchive:'project/str/studies/service-room-ground-receiver-captures-20261126.tar.xz',sourceArchiveSHA256:sha('project/str/studies/service-room-ground-receiver-captures-20261126.tar.xz'),previousNativeInputDigest:digest(prior.nativeCase),currentNativeInputDigest:digest(nativeCase),sourceIdentityLocationsRebound:rebound},newWaterLayoutCredit:false,legacyHost40mmMechanicalCredit:false}
 const request={schema:'str-service-room-ground-request/1',caseId:prior.caseId,nativeCase,structuralFloorBodies:bodies,settings:controls.settings,stockSource}
 const method={id:'str-proposed-current-known-ground-stock/1',sourceSHA256:Object.fromEntries(groundPocketPaths.map(p=>[p,sha(p)]))}
 const before={...actual58,...source.actualSourceSHA256,...method.sourceSHA256}
 const verify=()=>{for(const [p,h] of Object.entries(before))if(sha(p)!==h)throw Error('Executed ground/native/geometry method changed: '+p)}
 const headIds=grid.heads.map(h=>h.id)
 if(headIds.length!==52||new Set(headIds).size!==52)throw Error('Actual current grid52head catalogue required')
 const execute=(label,req)=>{
  verify()
  const requestPath=folder+'/'+label+'.request.json',outPath=folder+'/'+label+'.full.json'
  for(const p of [requestPath,outPath]){try{readFileSync(p);throw Error('Refuse overwriting recoverable actual ground capture')}catch(e){if(e.code!=='ENOENT')throw e}}
  writeFileSync(requestPath,JSON.stringify(req,null,2)+'\n')
  const code="import json,sys;sys.path.insert(0,'project/str/studies');from service_room_ground import run;json.dump(run(json.load(sys.stdin)),sys.stdout,allow_nan=False)"
  const raw=execFileSync('python3',['-B','-c',code],{cwd:root,input:JSON.stringify(req),encoding:'utf8',maxBuffer:256*1024*1024,timeout:1200000,env:{...process.env,OPENBLAS_NUM_THREADS:'1',OMP_NUM_THREADS:'1'}})
  writeFileSync(outPath,raw)
  const response=JSON.parse(raw)
  assertGroundPocketResponseIdentity(response,req,headIds,method.sourceSHA256['project/str/studies/service_room_ground.py'])
  if(response.native.equilibriumResidualKN_KNm.some(v=>!Number.isFinite(v)||Math.abs(v)>1e-5)||response.native.heads.some(h=>h.reactionKN_KNm.length!==6||h.reactionKN_KNm.some(v=>!Number.isFinite(v))))throw Error('Actual52head six-wrench closure unavailable')
  const expectedG=bodies.reduce((s,b)=>s+b.independentKnownGravity.rcGKN+b.independentKnownGravity.mineralGKN,0)
  if(Math.abs(response.comparison.addedPhysicalGKN-expectedG)>1e-8)throw Error('Actual source-derived two-room stock gravity changed')
  verify()
  const wrapper={...response,status:'computed-proposed-input-unselected-comparison',request:req,method,currentSavedDocumentAdmitted:false,sourceAuditFindings:audit.findings,proposedInputSource:stockSource}
  const record={label,requestSHA256:createHash('sha256').update(readFileSync(requestPath)).digest('hex'),fullSHA256:createHash('sha256').update(raw).digest('hex'),fullBytes:Buffer.byteLength(raw),physicalHeads:52,knownUnfactoredGKN:expectedG,currentSavedDocumentAdmitted:false,candidateAccepted:false}
  writeFileSync(folder+'/'+label+'.wrapper.json',JSON.stringify(wrapper,null,2)+'\n')
  console.log('ACTUAL_CURRENT_TWO_ROOM_CAPTURE '+JSON.stringify(record))
  return{wrapper,response,record}
 }
 const baseline=execute('baseline',request),current=execute('current',request),fineRequest=structuredClone(request)
 fineRequest.caseId+=':contact125';fineRequest.settings.contactPitchMm=125
 const fine=execute('contact125',fineRequest)
 const m=new Map(baseline.response.native.heads.map(h=>[h.id,h.reactionKN_KNm]))
 const parity=Math.max(...current.response.native.heads.flatMap(h=>h.reactionKN_KNm.map((v,k)=>Math.abs(v-m.get(h.id)[k]))))
 if(parity>1e-7)throw Error('Independent same-input coupled312component parity exceeds unchanged1e-7')
 const capsule={schema:'str-proposed-current-two-room-capture-programme/1',currentSavedDocumentAdmitted:false,sourceAuditFindings:audit.findings,sourceCommit:report.sourceCommit,source,method,request,controls:[baseline.record,current.record,fine.record],independentCurrentVsBaselineMaximum312HeadDifferenceKN_KNm:parity,maximumPermittedDifferenceKN_KNm:1e-7,nativeSolvesExecuted:3,allResponseIdentityGuardsPassed:true,newWaterLayoutCredit:false,legacyHost40mmMechanicalCredit:false,candidateAccepted:false,wholeHouseAccepted:false}
 writeFileSync(folder+'/actual-two-room-capture-manifest.json',JSON.stringify(capsule,null,2)+'\n')
 console.log('ACTUAL_CURRENT_TWO_ROOM_PROGRAMME '+JSON.stringify({...capsule,sourceAuditFindingsCount:audit.findings.length,sourceAuditFindings:undefined,request:undefined}))
}
