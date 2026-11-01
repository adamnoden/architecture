import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { test } from 'node:test'

// Launch fresh processes: changing process.env after ICU initializes does not
// prove independence from a different host default locale.
const identityScript = `
import { stableJsonStringify, sha256SemanticFingerprint } from './compiler/core/identity.ts'
import { createReferenceHouseSource } from './compiler/reference-house/fixture.ts'
import { referenceHouseSourceFingerprint, calculationMethodSemanticFingerprint, referenceHouseSemanticResultManifest } from './compiler/reference-house/identity.ts'
import { compileReferenceHouseSystem } from './compiler/reference-house/system-compile.ts'
import { privateStairGeometryMethod } from './compiler/rhc5/method.ts'
import { loadCanonicalReferenceSiteManifest, compileCanonicalReferenceSiteCase } from './compiler/dpl/canonical.ts'
import { compareDplIdentityStrings, sha256DplSemanticFingerprint } from './compiler/dpl/identity-order.ts'

const labels = ['z', 'ä', 'Z', 'a', 'A', 'İ', 'I', 'ı', 'i', 'é', 'e\\u0301']
const keyed = Object.fromEntries(labels.map(label => [label, label]))
const source = createReferenceHouseSource()
// These sources probe the identity boundary, without claiming valid architecture
// for deliberately changed IDs. The ordinary compile below uses the valid fixture.
source.spaces = labels.map((id, index) => ({ ...source.spaces[index % source.spaces.length], id }))
const method = structuredClone(privateStairGeometryMethod)
method.criteria = labels.map((id, index) => ({ ...method.criteria[index % method.criteria.length], id }))
const compiled = compileReferenceHouseSystem(createReferenceHouseSource())
const manifestInput = structuredClone(compiled)
manifestInput.diagnostics.house = labels.map(code => ({ code, status: 'PASS', subjectIds: ['z', 'ä'] }))
const site = loadCanonicalReferenceSiteManifest()
site.claims = site.claims.map(claim => ({ ...claim, unknownComponents: [...labels] }))
const siteReversed = structuredClone(site)
siteReversed.claims.reverse()
siteReversed.claims.forEach(claim => claim.unknownComponents.reverse())
console.log(JSON.stringify({
  locale: new Intl.Collator().resolvedOptions().locale,
  json: stableJsonStringify(keyed),
  finite: sha256SemanticFingerprint(keyed),
  nonFinite: sha256SemanticFingerprint({ ...keyed, invalid: NaN }),
  source: referenceHouseSourceFingerprint(source),
  sourceReversed: referenceHouseSourceFingerprint({ ...source, spaces: [...source.spaces].reverse() }),
  method: calculationMethodSemanticFingerprint(method),
  methodReversed: calculationMethodSemanticFingerprint({ ...method, criteria: [...method.criteria].reverse() }),
  result: sha256SemanticFingerprint(referenceHouseSemanticResultManifest(manifestInput)),
  currentCompile: compiled.identity.compile.fingerprint,
  dpl: compileCanonicalReferenceSiteCase({ siteManifest: site }).resultFingerprint,
  dplReversed: compileCanonicalReferenceSiteCase({ siteManifest: siteReversed }).resultFingerprint,
  dplKeys: sha256DplSemanticFingerprint({ ...keyed, reviewer: 1, reviews: 2, reviewScopeClauseIds: 3 }),
  dplOrder: [...labels].sort(compareDplIdentityStrings),
  dplOrderReversed: [...labels].reverse().sort(compareDplIdentityStrings)
}))
`

test('core, Reference House and DPL identities survive distinct process locales and Unicode permutations', () => {
  const outputs = ['en_US.UTF-8', 'sv_SE.UTF-8', 'tr_TR.UTF-8'].map((locale) => {
    const output = execFileSync(process.execPath, ['--import', 'tsx', '--input-type=module', '--eval', identityScript], {
      cwd: process.cwd(),
      env: { ...process.env, LANG: locale, LC_ALL: locale, LANGUAGE: locale },
      encoding: 'utf8', timeout: 30_000
    })
    return JSON.parse(output) as Record<string, unknown>
  })
  assert.equal(new Set(outputs.map(({ locale }) => locale)).size, 3, 'probe must exercise different default locales')
  const identities = outputs.map(({ locale: _locale, ...identity }) => identity)
  for (const identity of identities) {
    assert.deepEqual(identity, identities[0])
    assert.equal(identity.source, identity.sourceReversed)
    assert.equal(identity.method, identity.methodReversed)
    assert.equal(identity.dpl, identity.dplReversed)
    assert.deepEqual(identity.dplOrder, identity.dplOrderReversed)
  }
})
