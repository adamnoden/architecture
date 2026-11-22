import assert from 'node:assert/strict'
import test from 'node:test'
import {selectProofScope} from './proof-scope.mjs'
import {mkdtempSync,mkdirSync,readFileSync,readdirSync,rmSync,writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createHash} from 'node:crypto'
import {publicationReviewManifest} from './publication-review-manifest.mjs'
import {spawnSync} from 'node:child_process'
const pkg=scripts=>JSON.stringify({name:'test',scripts,devDependencies:{tsx:'1'}})
const before=pkg({'test':'tests','control:brief':'old'})
const after=pkg({'test':'tests','control:brief':'new','control:other':'new'})
test('control-only script changes avoid unrelated specialised proofs',()=>{
 assert.equal(selectProofScope(['package.json','project/control/claims.ts','scripts/control-operations.ts'],before,after).run,false)
})
test('proof, dependency, lockfile, unknown and malformed inputs fail conservative',()=>{
 for(const path of ['compiler/any.ts','publication/anything','package-lock.json','scripts/new-helper.ts','.github/workflows/proof-scope.yml'])assert.equal(selectProofScope([path],before,after).run,true,path)
 assert.equal(selectProofScope(['package.json'],before,after.replace('"tsx":"1"','"tsx":"2"')).run,true)
 assert.equal(selectProofScope(['package.json'],before,pkg({test:'changed'})).run,true)
 assert.equal(selectProofScope(['package.json'],before,'broken').run,true)
 assert.equal(selectProofScope([],before,after).run,true)
 // A rename crossing the boundary exposes both deleted old and new paths.
 assert.equal(selectProofScope(['compiler/old.ts','project/control/new.ts'],before,after).run,true)
})
test('full health remains unconditional and every package-triggered proof uses the shared selector',()=>{
 const validate=readFileSync('.github/workflows/validate-pr.yml','utf8')
 assert.match(validate,/run: npm run check/)
 assert.doesNotMatch(validate,/proof-scope.yml/)
 const proofs=readdirSync('.github/workflows').filter(p=>readFileSync('.github/workflows/'+p,'utf8').includes("'package.json'"))
 assert.equal(proofs.length,14)
 for(const proof of proofs){const s=readFileSync('.github/workflows/'+proof,'utf8');assert.match(s,/uses: .\/.github\/workflows\/proof-scope.yml/);assert.match(s,/needs.scope.outputs.run != 'false'/)}
})

test('PLT may skip only opted-in compiler tests and READMEs, including mixed coordination changes',()=>{
 const paths=['compiler/reference-house/drawings.test.ts','compiler/architectural-drawing/README.md','compiler/reference-house/georgian/deep.test.ts','compiler/publication-drawing-v2/README.md']
 assert.equal(selectProofScope(paths,before,after).run,true,'Other proofs retain their existing policy')
 assert.equal(selectProofScope(paths,before,after,{compilerReview:true}).run,false)
 assert.equal(selectProofScope([...paths,'project/control/operations.ts'],before,after,{compilerReview:true}).run,false)
 for(const path of ['compiler/reference-house/fixture.ts','compiler/reference-house/georgian/plan.ts','compiler/publication-drawing-v2/svg.ts','publication/fonts.ts','publication/specimens/plt18/prepare.ts','publication/specimens/plt18/README.md','package-lock.json','.nvmrc','compiler/reference-house/notes.md']){
  assert.equal(selectProofScope([...paths,path],before,after,{compilerReview:true}).run,true,path)
 }
 // --no-renames retains the removed rendering input, so moving it into a test
 // filename cannot conceal a change to the retained proof's source.
 assert.equal(selectProofScope(['compiler/reference-house/fixture.ts','compiler/reference-house/fixture.test.ts'],before,after,{compilerReview:true}).run,true)
 assert.equal(selectProofScope([],before,after,{compilerReview:true}).run,true)
})

test('PLT retains all 48 PDF builds, explicit opt-in and full manual replay',()=>{
 const workflow=readFileSync('.github/workflows/plt-owner-feedback-proof.yml','utf8')
 assert.match(workflow,/compiler-review-only: true/)
 assert.match(workflow,/needs.scope.outputs.run != 'false'/)
 assert.match(workflow,/workflow_dispatch:/)
 assert.equal((workflow.match(/npx vivliostyle build/g)??[]).length,48)
 const manual=spawnSync(process.execPath,['scripts/proof-scope.mjs'],{encoding:'utf8',env:{...process.env,GITHUB_EVENT_NAME:'workflow_dispatch',SCOPE_COMPILER_REVIEW:'true',GITHUB_OUTPUT:'',GITHUB_STEP_SUMMARY:''}})
 assert.equal(manual.status,0,manual.stderr)
 assert.equal(JSON.parse(manual.stdout).run,true)
})


test('publication review fingerprints the checked editions and uploads only the manifest after rendered checks', t => {
 const root=mkdtempSync(join(tmpdir(),'publication-review-test-'))
 t.after(()=>rmSync(root,{recursive:true,force:true}))
 mkdirSync(join(root,'publication/dist'),{recursive:true})
 const pageSize={format:'A4',widthMm:210,heightMm:297,orientation:'portrait'}
 const workingEdition={file:'publication/dist/ovids-house.pdf',pages:24,pageSize}
 const primer={file:'publication/dist/ovids-house-primer.pdf',pages:8,pageSize}
 writeFileSync(join(root,'publication/metadata.json'),JSON.stringify({schemaVersion:1,workingEdition,primer}))
 const body='%PDF-1.7\nworking fixture'
 writeFileSync(join(root,workingEdition.file),body)
 writeFileSync(join(root,primer.file),'%PDF-1.7\nprimer fixture')
 const source={head:'head',base:'base',checkout:'checkout'}
 const manifest=publicationReviewManifest(root,source)
 assert.deepEqual(manifest.source,source)
 assert.deepEqual(manifest.objects[0],{edition:'workingEdition',...workingEdition,bytes:Buffer.byteLength(body),sha256:createHash('sha256').update(body).digest('hex')})
 assert.equal(manifest.objects[1].pages,8)
 writeFileSync(join(root,primer.file),'wrong file')
 assert.throws(()=>publicationReviewManifest(root,source),/Invalid rendered PDF/)
 const workflow=readFileSync('.github/workflows/validate-pr.yml','utf8')
 const candidate=workflow.slice(workflow.indexOf('- name: Retain candidate publication PDFs for visual review'),workflow.indexOf('- name: Check publication PDF metadata'))
 assert.match(candidate,/if: always\(\)/)
 assert.match(candidate,/name: publication-candidate-pdfs/)
 assert.match(candidate,/path: publication\/dist\/\*\.pdf/)
 assert.ok(workflow.indexOf('- name: Build publication PDFs')<workflow.indexOf(candidate))
 const retained=workflow.slice(workflow.indexOf('- name: Fingerprint validated publication PDFs'))
 assert.ok(workflow.indexOf('- name: Prove rendered nomenclature regressions')<workflow.indexOf(retained))
 assert.match(retained,/path: \$\{\{ runner\.temp \}\}\/publication-review-manifest\.json/)
 assert.doesNotMatch(retained,/publication\/dist|\.pdf(?:\s|$)/i)
})
