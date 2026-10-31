import { existsSync, readFileSync } from 'node:fs'
import { posix, resolve } from 'node:path'

import { publicationFigurePlacements } from '../../figures.js'
import { publicationPlatePlacements } from '../../plates.js'
import { publicationEntries } from '../../publication.js'
import {
  typ07ProductionDebt,
  typ07ProofUnits,
  typ07RequiredFontFaces,
  typ07RequiredProofClasses,
  type Typ07FontFace,
  type Typ07ProofClass
} from './manifest.js'

const repoRoot = resolve(import.meta.dirname, '../../..')

const readRepo = (path: string): string => readFileSync(resolve(repoRoot, path), 'utf8')
const countOccurrences = (haystack: string, needle: string): number => haystack.split(needle).length - 1

const assertUniqueAnchor = (source: string, anchor: string): void => {
  const count = countOccurrences(source, anchor)
  if (count !== 1) throw new Error(`TYP-07A expected one source anchor ${JSON.stringify(anchor)}; found ${count}.`)
}

const assertMarkdownTableAfter = (source: string, heading: string): void => {
  assertUniqueAnchor(source, heading)
  const tail = source.slice(source.indexOf(heading) + heading.length)
  const lines = tail.split('\n')
  const separator = /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/
  const tableIndex = lines.findIndex((line, index) => line.includes('|') && separator.test(lines[index + 1] ?? ''))
  if (tableIndex < 0) throw new Error(`TYP-07A expected a Markdown table after ${heading}.`)
}

const assertAsset = (entrySource: string, asset: string): string => {
  const sourceDirectory = posix.dirname(entrySource)
  const repoPath = posix.normalize(posix.join(sourceDirectory, asset))
  if (repoPath.startsWith('../') || !existsSync(resolve(repoRoot, repoPath))) {
    throw new Error(`TYP-07A asset does not resolve from ${entrySource}: ${asset} -> ${repoPath}`)
  }
  return repoPath
}

const proofClasses = new Set<Typ07ProofClass>()
const fontFaces = new Set<Typ07FontFace>()
const sourceIdentities: Record<string, { source: string; selector: string }> = {}

for (const unit of typ07ProofUnits) {
  if (!existsSync(resolve(repoRoot, unit.source))) throw new Error(`TYP-07A missing source: ${unit.source}`)
  const source = readRepo(unit.source)

  for (const proofClass of unit.proofClasses) proofClasses.add(proofClass)
  for (const fontFace of unit.fontFaces) fontFaces.add(fontFace)

  switch (unit.selector.kind) {
    case 'heading-section': {
      const { heading } = unit.selector
      assertUniqueAnchor(source, heading)
      sourceIdentities[unit.id] = { source: unit.source, selector: heading }
      break
    }
    case 'first-markdown-table-after': {
      const { heading } = unit.selector
      assertMarkdownTableAfter(source, heading)
      sourceIdentities[unit.id] = { source: unit.source, selector: `${heading} -> first table` }
      break
    }
    case 'publication-contents': {
      const { partEntryIds } = unit.selector
      const ids = new Set(publicationEntries.map((entry) => entry.id))
      for (const id of partEntryIds) {
        if (!ids.has(id)) throw new Error(`TYP-07A contents manifest lost required entry: ${id}`)
      }
      const backMatterCount = publicationEntries.filter((entry) => entry.kind === 'back-matter').length
      if (backMatterCount < 5) throw new Error(`TYP-07A expected the current five-entry back-matter family; found ${backMatterCount}.`)
      sourceIdentities[unit.id] = { source: unit.source, selector: `publicationEntries (${publicationEntries.length} entries)` }
      break
    }
    case 'figure-placement': {
      const { image } = unit.selector
      const entryId = unit.entryId
      const matches = publicationFigurePlacements().filter((placement) =>
        placement.image === image && (!entryId || placement.entryId === entryId)
      )
      if (matches.length !== 1) throw new Error(`TYP-07A expected one figure placement for ${image}; found ${matches.length}.`)
      const placement = matches[0]
      const assetPath = assertAsset(unit.source, placement.image)
      assertUniqueAnchor(source, placement.anchor)
      sourceIdentities[unit.id] = { source: unit.source, selector: `${placement.image} -> ${assetPath}` }
      break
    }
    case 'plate-placement': {
      const { pageClass, title } = unit.selector
      const matches = publicationPlatePlacements().filter((placement) =>
        placement.pageClass === pageClass &&
        placement.views.some((view) => view.title === title)
      )
      if (matches.length !== 1) throw new Error(`TYP-07A expected one ${pageClass} placement for ${title}; found ${matches.length}.`)
      const placement = matches[0]
      assertUniqueAnchor(source, placement.anchor)
      if (pageClass === 'PLATE_PAIR' && placement.views.length !== 2) {
        throw new Error(`TYP-07A paired plate ${title} no longer contains exactly two views.`)
      }
      for (const view of placement.views) assertAsset(unit.source, view.image)
      if (title === 'Ground-floor plan' && !placement.views.some((view) => view.title === 'First-floor plan')) {
        throw new Error('TYP-07A canonical plan pair no longer includes First-floor plan.')
      }
      sourceIdentities[unit.id] = {
        source: unit.source,
        selector: `${pageClass}: ${placement.views.map((view) => view.title).join(' + ')}`
      }
      break
    }
    case 'long-url-reference-set': {
      const { minimumUrls } = unit.selector
      const urls = source.match(/https?:\/\/[^\s)]+/g) ?? []
      if (urls.length < minimumUrls) {
        throw new Error(`TYP-07A expected at least ${minimumUrls} URLs in ${unit.source}; found ${urls.length}.`)
      }
      if (!source.includes('*')) throw new Error(`TYP-07A reference source no longer contains italic work-title material: ${unit.source}`)
      sourceIdentities[unit.id] = { source: unit.source, selector: `${urls.length} reader-facing URLs` }
      break
    }
  }
}

for (const proofClass of typ07RequiredProofClasses) {
  if (!proofClasses.has(proofClass)) throw new Error(`TYP-07A representative corpus does not cover required proof class: ${proofClass}`)
}
for (const fontFace of typ07RequiredFontFaces) {
  if (!fontFaces.has(fontFace)) throw new Error(`TYP-07A representative corpus does not exercise required font face: ${fontFace}`)
}

const theme = readRepo(typ07ProductionDebt.theme)
for (const marker of typ07ProductionDebt.requiredLegacyMarkers) {
  if (!theme.includes(marker)) throw new Error(`TYP-07A production-theme audit changed: missing legacy marker ${JSON.stringify(marker)}.`)
}
const plates = readRepo(typ07ProductionDebt.plates)
for (const marker of typ07ProductionDebt.plateLegacyMarkers) {
  if (!plates.includes(marker)) throw new Error(`TYP-07A plate-furniture audit changed: missing legacy marker ${JSON.stringify(marker)}.`)
}

console.log(JSON.stringify({
  packet: 'TYP-07A',
  result: 'PASS',
  proofClasses: [...proofClasses],
  fontFaces: [...fontFaces],
  sourceIdentities,
  productionBoundary: {
    theme: 'working-system legacy; do not use as TYP-07 proof authority',
    plates: 'canonical placement metadata retained; proof-only typography rebinding required for DRW v1 SVG text',
    canonicalMutation: false
  }
}, null, 2))
