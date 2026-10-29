import assert from 'node:assert/strict'
import test from 'node:test'
import {selectProofScope} from './proof-scope.mjs'
import {readFileSync,readdirSync} from 'node:fs'
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
