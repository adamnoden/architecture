import {execFileSync} from 'node:child_process'
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {fileURLToPath} from 'node:url'
import {deriveCurrentHouse} from '../../had/studies/current-house.mjs'
import {inletRoomPocket,inletServiceRoomPlans} from '../../../compiler/reference-house/current-design/inlet-room-pocket.js'
import {inletKnownFloorBody} from '../../../compiler/reference-house/current-design/inlet-known-gravity.js'
import {readLocalUtilityPocketSettings} from '../../../compiler/reference-house/current-design/inlet-source-envelope.js'
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
const sourcePaths=['compiler/reference-house/current-design/inlet-room-pocket.ts','compiler/reference-house/current-design/inlet-known-gravity.ts','compiler/reference-house/current-design/inlet-source-envelope.ts','project/had/studies/inlet-split-plant-room-candidate.json','project/str/studies/dry_side_ground_section.py','project/str/studies/dry-side-ground-section.json','project/ias/studies/utility-host-revised-route.py','project/ias/studies/utility-host-revised-route.json','project/ias/studies/utility-host-revised-route.svg']
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
