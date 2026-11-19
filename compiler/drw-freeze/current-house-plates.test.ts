import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { currentPublicationAssetPaths } from '../../publication/current-assets.js'
import { publicationPlatePlacements } from '../../publication/plates-current.js'
import { publicationPlatePlacements as historicalPlacements } from '../../publication/plates.js'

test('current-house composition preserves the frozen plate renderer while versioning its active view selection separately', () => {
  const historical = readFileSync(new URL('../../publication/plates.ts', import.meta.url), 'utf8')
  const current = readFileSync(new URL('../../publication/plates-current.ts', import.meta.url), 'utf8')
  const rendererBoundary = 'const plateStyle = '
  assert.ok(historical.includes(rendererBoundary))
  assert.ok(current.includes(rendererBoundary))
  assert.equal(
    current.slice(current.indexOf(rendererBoundary)),
    historical.slice(historical.indexOf(rendererBoundary)),
    'current view selection must retain the frozen page style, scale display, composition and duplicate/anchor diagnostics'
  )

  const activePaths = publicationPlatePlacements().flatMap(placement => placement.views.map(view => view.image.replace('../../', '')))
  assert.deepEqual(activePaths, [...currentPublicationAssetPaths])
  assert.equal(new Set(activePaths).size, activePaths.length)
  const historicalPaths = new Set(historicalPlacements().flatMap(placement => placement.views.map(view => view.image)))
  assert.ok(publicationPlatePlacements().every(placement => placement.views.every(view => !historicalPaths.has(view.image))))
})
