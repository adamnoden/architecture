import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs'
import {join,dirname} from 'node:path'
import {execFileSync} from 'node:child_process'

// Fixed artifact and endpoints only: this job creates Git blobs, never refs or commits.
const repository='adamnoden/architecture'
const sourceHead='22b7bb2e2b37e7bfdca2429cae0a99a6cef84f71'
const runId=45825263728,artifactId=15119877731
const zipSHA='eb51210564cb720d31782566f4f88cf328676bc93320aff425ddb0a31ec5b778'
const patchSHA='a63ff6f00e30eb6b8554027873bf9addf3205ebe637f8e8e257a2421999d4d52'
const root=join(process.env.RUNNER_TEMP,'study-lighting-preservation')
mkdirSync(root,{recursive:true})
const directory=join(root,'verified-artifact')
const token=process.env.GITHUB_TOKEN
assert.ok(token)
const sha256=data=>createHash('sha256').update(data).digest('hex')
const gitblob=data=>createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex')
const json=path=>JSON.parse(readFileSync(path,'utf8'))
const headers={Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}
async function get(path){
 const response=await fetch('https://api.github.com/repos/'+repository+'/'+path,{headers})
 assert.ok(response.ok,'Artifact read failed '+response.status)
 return response
}
const observedRun=await(await get('actions/runs/'+runId)).json()
assert.equal(observedRun.head_sha,sourceHead)
assert.equal(observedRun.conclusion,'success')
const observedArtifact=await(await get('actions/artifacts/'+artifactId)).json()
assert.equal(observedArtifact.workflow_run.id,runId)
assert.equal(observedArtifact.workflow_run.head_sha,sourceHead)
assert.equal(observedArtifact.digest,'sha256:'+zipSHA)
assert.equal(observedArtifact.expired,false)
const archive=Buffer.from(await(await get('actions/artifacts/'+artifactId+'/zip')).arrayBuffer())
assert.equal(sha256(archive),zipSHA)
const archivePath=join(root,'verified.zip')
writeFileSync(archivePath,archive)
execFileSync('python3',['-B','-c',[
'import sys,zipfile,pathlib',
'with zipfile.ZipFile(sys.argv[1]) as z:',
' for item in z.infolist():',
'  p=pathlib.PurePosixPath(item.filename)',
'  assert not p.is_absolute() and ".." not in p.parts',
'  assert ((item.external_attr >> 16) & 0o170000) != 0o120000',
' z.extractall(sys.argv[2])',
].join('\n'),archivePath,directory])
const outcome=json(join(directory,'outcome.json'))
assert.equal(outcome.success,true)
assert.equal(outcome.error,null)
assert.equal(outcome.sourceCommit,sourceHead)
assert.equal(outcome.noRefPublication,true)
assert.equal(outcome.generatedPatchSHA256,patchSHA)
assert.equal(sha256(readFileSync(join(directory,'generated.patch'))),patchSHA)
const proof=json(join(directory,'actual-case-summary.json'))
assert.equal(proof.sourceCommit,sourceHead)
assert.equal(proof.witnessCount,136)
assert.equal(proof.minimumBoardFixedClearanceMm,10)
assert.equal(proof.unchangedFloorAndFurniture,true)
assert.equal(proof.physicalAcceptance,false)
assert.equal(proof.ownerAcceptance,false)
const audit=json(join(directory,'source-audit.json'));assert.deepEqual(audit.findings,[])
const commands=json(join(directory,'commands.json'))
for(const name of ['lighting-strict','room-views-strict','types','focused29','room-views-regenerate']){
 assert.ok(commands.some(c=>c.name===name&&c.status===0),'Missing exact successful command '+name)
}
const focused=readFileSync(join(directory,'focused29.log'),'utf8')
for(const [name,count]of [['tests',29],['pass',29],['fail',0],['skipped',0],['cancelled',0]]){
 assert.ok(new RegExp('\\b'+name+'\\s+'+count+'\\b').test(focused),'Wrong test count '+name)
}
const documentPath='project/ccr/studies/working-house-comparison.json'
const accountPath='project/ccr/studies/source-coverage.json'
const paths=[accountPath,documentPath,...[
'adaptable-study-lighting-comparison.svg','adaptable-study-lighting-corner.svg','adaptable-kitchen-lighting.svg',
'adaptable-study-lighting-routes.svg','adaptable-study-lighting-construction.svg','adaptable-study-lighting-common-depth.svg',
'adaptable-study-lighting.results.json','working-study-lighting-circuit.svg','working-study-lighting.results.json',
'crafted-study-eye-level-day.svg','crafted-study-eye-level-evening.svg','working-study-floor.svg',
'working-study-wall-kit.svg','working-study-tile-eye-level.svg',
].map(name=>'project/ias/studies/'+name)]
const allowed=new Set(paths)
const manifest=json('project/ias/studies/lighting-circuit-recovery-20261126.json')
const testedSource=json(join(directory,'source-head.json'))
assert.equal(testedSource.commit,sourceHead)
assert.deepEqual(testedSource.sourceFiles,manifest.files)
for(const row of manifest.files){
 const data=execFileSync('git',['show',sourceHead+':'+row.path],{maxBuffer:16*1024*1024})
 assert.equal(sha256(data),row.sha256)
 assert.equal(gitblob(data),row.gitBlob)
}
const generated=json(join(directory,'generated-files.json'))
assert.equal(new Set(generated.map(r=>r.path)).size,generated.length)
for(const row of generated){
 assert.ok(allowed.has(row.path),'Unexpected artifact path '+row.path)
 const data=readFileSync(join(directory,'generated',row.path))
 assert.equal(sha256(data),row.sha256)
 assert.equal(gitblob(data),row.gitBlob)
}
const current=json(documentPath),actual=json(join(directory,'generated',documentPath))
assert.deepEqual(actual.design,current.design)
assert.deepEqual(actual.stages,current.stages)
assert.equal(sha256(JSON.stringify(actual.stages.studyRoomKit.ordinaryHandling,null,2)+'\n'),
 '40f66fcf4c8257a3a31cca51110f951b06e89894e3b8fecd6e9460e3c57bb435')
const map=[]
for(const path of paths){
 const data=readFileSync(join(directory,'generated',path)),sha=gitblob(data)
 if(!generated.some(row=>row.path===path)){
  assert.equal(sha,execFileSync('git',['rev-parse',sourceHead+':'+path],{encoding:'utf8'}).trim(),'Unreported generated change '+path)
 }
 const response=await fetch('https://api.github.com/repos/'+repository+'/git/blobs',{
  method:'POST',headers:{...headers,'Content-Type':'application/json'},
  body:JSON.stringify({content:data.toString('base64'),encoding:'base64'}),
 })
 assert.ok(response.ok,'Git blob preservation failed '+path+':'+response.status)
 const result=await response.json()
 assert.equal(result.sha,sha,'Git blob identity mismatch '+path)
 const row={path,sha,sha256:sha256(data),size:data.length};map.push(row)
 console.log('PRESERVED_LIGHTING_FILE '+JSON.stringify(row))
}
execFileSync('git',['read-tree',sourceHead])
const temporary=['.github/workflows/study-lighting-circuit-recovery.yml',
'project/ias/studies/prove-lighting-circuit-recovery.mjs',
'project/ias/studies/lighting-circuit-recovery-20261126.json']
// Remove only index entries; preserve this runner's working files.
execFileSync('git',['update-index','--force-remove','--',...temporary])
for(const path of paths){mkdirSync(dirname(path),{recursive:true});copyFileSync(join(directory,'generated',path),path)}
execFileSync('git',['add','--',...paths])
for(const row of map)assert.equal(execFileSync('git',['rev-parse',':'+row.path],{encoding:'utf8'}).trim(),row.sha)
const tree=execFileSync('git',['write-tree'],{encoding:'utf8'}).trim()
const result={schema:'ias-lighting-generated-preservation/1',sourceBase:'9c3ed110c35fa9d1605104616fdc27a530a6b43e',
 sourceHead,proofRunId:runId,artifactId,artifactZipSHA256:zipSHA,generatedPatchSHA256:patchSHA,targetTree:tree,
 source:manifest.files.filter(f=>f.path!==documentPath),generated:map,excludedTemporaryPaths:temporary,
 gitBlobsOnly:true,noCommitOrRefPublication:true,requiresRootThreeWayIntegrationAndExactCI:true,
 physicalAcceptance:false,ownerAcceptance:false}
writeFileSync(join(root,'preservation-map.json'),JSON.stringify(result,null,2)+'\n')
console.log('PRESERVED_LIGHTING_TARGET '+JSON.stringify({sourceHead,targetTree:tree,generatedCount:map.length,excludedTemporaryPaths:temporary}))
