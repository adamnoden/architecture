import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import test from 'node:test'
import {prepareCurrentDesignCompile} from './current-design/compile.js'
import {readGeorgianDesignSnapshot} from './current-design/georgian-source.js'

test('the public floor and upper-bearing readers reach the existing shared methods with an explicit design',async()=>{
 const design=readGeorgianDesignSnapshot(),compile=prepareCurrentDesignCompile(design)
 const expected=[['--read-floor-section',await compile.readFloorSectionCase()],['--read-upper-roof-bearing',await compile.readUpperRoofBearingCase()]] as const
 for(const [mode,request]of expected){
  const actual=JSON.parse(execFileSync(process.execPath,['--import','tsx','scripts/compile-current-design.ts',mode,'-'],{input:JSON.stringify(design),encoding:'utf8'}))
  assert.deepEqual(actual,request)
 }
})
