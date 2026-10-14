import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'

import { REFERENCE_HOUSE_OUTPUTS } from '../reference-house/output/contract.js'
import {
  buildReferenceHouseOutputBundle,
  renderReferenceHouseOutputManifest
} from '../reference-house/output/build.js'

describe('COA-06 successor output integration', () => {
  const bundle = buildReferenceHouseOutputBundle()
  const { outputs } = bundle

  test('all six human inspection outputs are deterministic committed projections', () => {
    assert.equal(outputs.length, 6)
    for (const { descriptor, content } of outputs) {
      assert.equal(readFileSync(descriptor.path, 'utf8'), content, descriptor.path)
    }
  })

  test('all successor outputs share the one canonical output-context compile identity', () => {
    const fingerprints = new Set(outputs.map(({ content }) => {
      const svg = content.match(/data-source-compile="([a-f0-9]+)"/)
      const report = content.match(/\*\*Source compile:\*\* `([a-f0-9]+)`/)
      return svg?.[1] ?? report?.[1]
    }))
    assert.equal(fingerprints.size, 1)
    assert.ok(!fingerprints.has(undefined))
    assert.equal([...fingerprints][0], bundle.context.result.identity.compile.fingerprint)
    assert.equal(bundle.manifest.sourceCompile.fingerprint, bundle.context.result.identity.compile.fingerprint)
  })

  test('manifest rendering is deterministic, complete and exactly committed', () => {
    const manifest = renderReferenceHouseOutputManifest(bundle.manifest)
    assert.equal(renderReferenceHouseOutputManifest(bundle.manifest), manifest)
    assert.equal(readFileSync(REFERENCE_HOUSE_OUTPUTS.outputManifest.path, 'utf8'), manifest)
    for (const { descriptor } of outputs) {
      assert.match(manifest, new RegExp(descriptor.id))
      assert.match(manifest, new RegExp(descriptor.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    }
  })

  test('legacy CH-frozen artefact paths remain separate from the successor family', () => {
    for (const legacy of [
      'docs/reference-house/rhc1-ground-floor.svg',
      'docs/reference-house/rhc1-first-floor.svg',
      'docs/reference-house/rhc1-principal-section.svg',
      'docs/reference-house/rhc2-structural-topology.svg',
      'docs/reference-house/rhc3-service-topology.svg',
      'docs/reference-house/rhc4-boundary-topology.svg'
    ]) {
      assert.ok(readFileSync(legacy, 'utf8').length > 0)
    }
    assert.equal(REFERENCE_HOUSE_OUTPUTS.outputManifest.path, 'docs/reference-house/generated/output-manifest.json')
  })
})
