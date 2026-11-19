import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('current-house composition preserves the frozen drawing contract except explicit applicability and placement', () => {
  const historical = readFileSync(new URL('../../publication/plates.ts', import.meta.url), 'utf8')
  const current = readFileSync(new URL('../../publication/plates-current.ts', import.meta.url), 'utf8')
  const qualifier = 'Historical predecessor; not the current 12 m square house. '
  assert.equal(current.split(qualifier).length - 1, 17, 'each retained drawing needs its historical qualifier')
  const normalised = current
    .replaceAll(qualifier, '')
    .replace('## Roof and courtyard water', '## The courtyard manages only itself')
    .replace(
      'The current design exposes these questions so that adverse findings can change the house.',
      'The architecture’s current claim is prior and narrower: it has not knowingly created a form that must be rescued by inaccessible drainage or excessive active systems under the bounded virtual assumptions used so far.'
    )
  assert.equal(normalised, historical, 'successor must preserve all view specifications, scales, style and composition apart from the two declared anchor moves and caption qualifiers')
})
