import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'
import { compileEngineeringDocument, readEngineeringDocument } from './current-design/engineering-document.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'
import { readCurrentDesignResolution } from './current-design/resolve.js'
import { readInletCabinetCase, readInletCabinetSettings, runInletCabinetCase } from './current-design/inlet-cabinet-copper.js'

function cabinet(bundle: { engineering: object }) {
  const value = Reflect.get(bundle.engineering, 'inletCabinet') as ReturnType<typeof runInletCabinetCase> | undefined
  assert.ok(value, 'The saved document must execute the independent cabinet consumer')
  return value
}

test('a saved cabinet width changes its room envelope, actual quantities, load bound and CLI drawing then reverses', async () => {
  const source = await readEngineeringDocument(readGeorgianDesignSnapshot())
  assert.ok(!Object.hasOwn(source.stages, 'inletCabinet'), 'An unselected challenger must not replace the current default silently')
  const document = { ...source, stages: { inletCabinet: readInletCabinetSettings() } }
  const baselineBundle = await compileEngineeringDocument(JSON.parse(JSON.stringify(document)))
  const baseline = cabinet(baselineBundle)
  const edited = JSON.parse(JSON.stringify(document))
  edited.stages.inletCabinet.cabinetWidthMm += 50
  const changedBundle = JSON.parse(execFileSync(process.execPath, ['--import', 'tsx', 'scripts/compile-current-design.ts', '--bundle', '-'], {
    input: JSON.stringify(edited), encoding: 'utf8', maxBuffer: 24 * 1024 * 1024,
  }))
  const changed = cabinet(changedBundle)
  assert.equal(changed.architecture.bodyMm[3] - baseline.architecture.bodyMm[3], 50)
  assert.ok(changed.quantities.knownSteelGrossKg > baseline.quantities.knownSteelGrossKg)
  assert.ok(changed.quantities.retainedPanWaterUpperKg > baseline.quantities.retainedPanWaterUpperKg)
  assert.ok(changed.floorReceiving.gravityUpperN > baseline.floorReceiving.gravityUpperN)
  assert.notEqual(changed.reviewSvg, baseline.reviewSvg)
  assert.deepEqual(changed.branches.map(row => row.pathMm), baseline.branches.map(row => row.pathMm))
  assert.equal(changed.selected, false)
  assert.equal(changed.installedAcceptance, false)
  assert.equal(changed.preSiteArrangementComplete, false)
  const serializedBaseline = JSON.parse(JSON.stringify(baselineBundle))
  assert.deepEqual(changedBundle.plans, serializedBaseline.plans)
  assert.deepEqual(changedBundle.selectedWaterEvent, serializedBaseline.selectedWaterEvent)
  assert.ok(!changedBundle.manifest.find((row: { stage: string }) => row.stage === 'inletCabinet').dependsOn.includes('fixedInlet'))
  edited.stages.inletCabinet.cabinetWidthMm = document.stages.inletCabinet.cabinetWidthMm
  const restored = cabinet(await compileEngineeringDocument(edited))
  assert.deepEqual(restored, baseline)
})

test('cabinet authoring rejects stale press-era bindings, unsupported tube stock and injected results', async () => {
  const resolved = readCurrentDesignResolution()
  const { cabinet: request } = readInletCabinetCase(resolved)
  assert.throws(() => runInletCabinetCase(resolved, { ...request, bindingDigest: 'historical-press-case' }), /Stale copper-cabinet/)
  assert.throws(() => runInletCabinetCase(resolved, { ...request, accepted: true }), /Versioned source-bound/)
  assert.throws(() => runInletCabinetCase(resolved, { ...request, settings: { ...request.settings, pipeWallMm: .9 } }), /comparison domain/)
  const source = await readEngineeringDocument(readGeorgianDesignSnapshot())
  await assert.rejects(compileEngineeringDocument({ ...source, stages: { inletCabinet: { sourceSHA256: {} } } }), /Unknown inlet cabinet/)
  const first = runInletCabinetCase(resolved, JSON.parse(JSON.stringify(request)))
  const again = runInletCabinetCase(resolved, request)
  assert.deepEqual(again, first, 'A serialization no-op must preserve the exact cabinet case and result')
})

test('the public cabinet read/solve route matches saved authoring and withholds press-era service witnesses',async()=>{
 const source=await readEngineeringDocument(readGeorgianDesignSnapshot())
 const request=JSON.parse(execFileSync(process.execPath,['--import','tsx','scripts/compile-current-design.ts','--read-inlet-cabinet','-'],{input:JSON.stringify(readGeorgianDesignSnapshot()),encoding:'utf8',maxBuffer:8*1024*1024}))
 request.cabinet.settings.riserYMm+=20
 const standalone=JSON.parse(execFileSync(process.execPath,['--import','tsx','scripts/compile-current-design.ts','--inlet-cabinet','-'],{input:JSON.stringify(request),encoding:'utf8',maxBuffer:24*1024*1024}))
 const bundle=await compileEngineeringDocument({...source,stages:{inletSillInsert:source.stages.inletSillInsert,inletCabinet:request.cabinet.settings}})
 assert.deepEqual(JSON.parse(JSON.stringify(cabinet(bundle))),standalone)
 assert.equal(bundle.manifest.find(row=>row.stage==='inletSillInsert')?.applicability?.controllingStage,'inletCabinet')
 assert.equal(bundle.manifest.find(row=>row.stage==='occupiedServices')?.applicability?.controllingStage,'inletCabinet')
 assert.ok(bundle.coordinationDiagnostics.some(row=>row.code==='COPPER_CABINET_SERVICES_NOT_COORDINATED'))
 assert.notEqual(standalone.source.caseDigest,runInletCabinetCase(readCurrentDesignResolution(),readInletCabinetCase(readCurrentDesignResolution()).cabinet).source.caseDigest)
})
