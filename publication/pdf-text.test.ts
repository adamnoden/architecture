import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizePublicationPdfText } from './pdf-text.js'

test('the actual wrapped principal-section caption retains its complete authored text', () => {
  const expected = "Section through the entrance void and open court, looking west, with architectural floors at 0 and +3.45 m. Floor layers, foundation envelopes and the roof build-up are provisional representations, not selected construction. This section does not adopt the reinforced-concrete cage or the +715 mm raised-ground trial."
  const extracted = "Section through the entrance void and open court, looking west, with architectural floors at 0 and +3.45 m. Floor layers, foundation envelopes and the roof build-up are provisional representations, not selected construction. This section does not adopt the reinforced- concrete cage or the +715 mm raised-ground trial."
  assert.equal(normalizePublicationPdfText(extracted), expected)
  assert.ok(normalizePublicationPdfText("Current house — principal section 1:100 OPEN COURTYARD Entrance void Entrance hall Family / dining Bedroom 4 0.00 3.45 6.55 Twin 25-degree pitches; entrance void interrupts first floor Guard shown schematically; edge framing and fire strategy unresolved Nominal wall / floor / head assemblies; engineering unresolved Dashed support envelopes: diagram only; foundation type / depth unresolved 3 m 1:100 Section through the entrance void and open court, looking west, with architectural floors at 0 and +3.45 m. Floor layers, foundation envelopes and the roof build-up are provisional representations, not selected construction. This section does not adopt the reinforced- concrete cage or the +715 mm raised-ground trial.").includes(normalizePublicationPdfText(expected)))
})

test('line wrapping joins a retained compound hyphen and preserves existing discretionary-hyphen handling', () => {
  assert.equal(normalizePublicationPdfText('reinforced-\n concrete'), 'reinforced-concrete')
  assert.equal(normalizePublicationPdfText('repre\u00adsentations'), 'representations')
  assert.equal(normalizePublicationPdfText('repre\u2010\n sentations'), 'representations')
  const value = normalizePublicationPdfText('  reinforced-\n concrete  ')
  assert.equal(normalizePublicationPdfText(value), value)
})

test('normalization preserves authored hyphens, signs, dimensions and acceptance qualifiers', () => {
  for (const [before, after] of [
    ['reinforced-concrete', 'reinforced concrete'],
    ['re-sign', 'resign'],
    ['+715 mm', '−715 mm'],
    ['+715 mm', '+710 mm'],
    ['not selected construction', 'selected construction'],
    ['A - B', 'A-B'],
  ]) assert.notEqual(normalizePublicationPdfText(before), normalizePublicationPdfText(after))
})
