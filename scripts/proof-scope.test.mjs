import assert from 'node:assert/strict'
import test from 'node:test'
import {selectProofScope} from './proof-scope.mjs'
import {readFileSync,readdirSync} from 'node:fs'
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
 assert.equal(proofs.length,13)
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
