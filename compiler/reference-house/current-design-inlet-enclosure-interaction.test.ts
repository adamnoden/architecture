import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
import test from 'node:test'
import {compileEngineeringDocument,readEngineeringDocument} from './current-design/engineering-document.js'
import {readGeorgianDesignSnapshot} from './current-design/georgian-source.js'

// Exercise the production saved document and public CLI, rather than reconstructing a parallel case.
test('saved inlet temperature drives compatible enclosure forces, review drawing and invalidation through the public bundle',async()=>{
  const full=await readEngineeringDocument(readGeorgianDesignSnapshot())
  const document={...full,stages:{inletSillInsert:full.stages.inletSillInsert,inletFault:full.stages.inletFault,fixedInlet:{...full.stages.fixedInlet,localPipeTemperatureRangeK:0}}}
  const baseline=await compileEngineeringDocument(JSON.parse(JSON.stringify(document)))
  const edited={...document,stages:{...document.stages,fixedInlet:{...document.stages.fixedInlet,localPipeTemperatureRangeK:40}}}
  const saved=JSON.stringify(edited),changed=await compileEngineeringDocument(JSON.parse(saved))
  const frame=(r:typeof baseline)=>{
    const f=r.engineering.fixedInlet!.sharedServiceFrameDevelopment
    assert.ok('mechanics' in f)
    return f
  }
  const original=frame(baseline),hot=frame(changed)
  assert.equal(original.mechanics.enclosureInteraction.conditionalSteelPass,true)
  assert.equal(hot.mechanics.enclosureInteraction.conditionalSteelPass,false)
  assert.notEqual(hot.mechanics.enclosureInteraction.reviewSvg,original.mechanics.enclosureInteraction.reviewSvg)
  assert.match(hot.mechanics.enclosureInteraction.reviewSvg,/40 K local pipe range/)
  assert.match(original.mechanics.enclosureInteraction.reviewSvg,/fixed-arm\/back-shell opening remains unresolved/)
  assert.deepEqual(hot.geometry,original.geometry)
  assert.deepEqual(changed.plans,baseline.plans)
  assert.deepEqual(changed.manifest.filter(m=>m.stage!=='fixedInlet'),baseline.manifest.filter(m=>m.stage!=='fixedInlet'))
  assert.notEqual(changed.manifest.find(m=>m.stage==='fixedInlet')!.resultDigest,baseline.manifest.find(m=>m.stage==='fixedInlet')!.resultDigest)
  assert.equal(frame(await compileEngineeringDocument(JSON.parse(JSON.stringify(document)))).mechanics.enclosureInteraction.reviewSvg,original.mechanics.enclosureInteraction.reviewSvg)
  const cli=spawnSync(process.execPath,['--import','tsx','scripts/compile-current-design.ts','--bundle','-'],{input:saved,encoding:'utf8',maxBuffer:64*1024*1024})
  assert.equal(cli.status,0,cli.stderr)
  assert.deepEqual(JSON.parse(cli.stdout),JSON.parse(JSON.stringify(changed)))
  await assert.rejects(compileEngineeringDocument({...edited,bindings:{...edited.bindings,implementations:{...edited.bindings.implementations,'compiler/reference-house/current-design/inlet-fixed-shared-service-frame.ts':'0'.repeat(40)}}}),/Stale engineering source or implementation binding/)
  await assert.rejects(compileEngineeringDocument({...edited,stages:{...edited.stages,fixedInlet:{...edited.stages.fixedInlet,enclosureInteraction:hot.mechanics.enclosureInteraction}}}),/Unknown fixed inlet engineering setting or derived identity supplied/)
})
