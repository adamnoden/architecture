import { sha256DplSemanticFingerprint } from './identity-order.js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { validateTargetSlice } from './target.js'
import type {
  InterfaceContractRef,
  LoadedPilotSite,
  PilotSiteIndex,
  RawTargetSlice,
  TargetAuthorityClass
} from './model.js'

const readText = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8')

const readJson = (path: string): unknown => JSON.parse(readText(path)) as unknown

const expectRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`)
  }
  return value as Record<string, unknown>
}

const expectString = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || value.length === 0) throw new Error(`${label} must be a non-empty string.`)
  return value
}

const expectArray = (value: unknown, label: string): readonly unknown[] => {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array.`)
  return value
}

export const loadTargetSlice = (
  path: string,
  authorityClass: TargetAuthorityClass
): { readonly authorityClass: TargetAuthorityClass; readonly target: RawTargetSlice } => ({
  authorityClass,
  target: validateTargetSlice(readJson(path), path)
})

const validatePilotIndex = (value: unknown, path: string): PilotSiteIndex => {
  const index = expectRecord(value, `Pilot index ${path}`)
  if (index.schemaVersion !== 'dpl.realSitePilotIndex.v1') {
    throw new Error(`Unsupported DPL pilot index schema ${String(index.schemaVersion)} at ${path}.`)
  }
  expectString(index.assuranceProfile, `Pilot index ${path} assuranceProfile`)
  const sites = expectArray(index.sites, `Pilot index ${path} sites`)

  for (const [siteIndex, site] of sites.entries()) {
    const item = expectRecord(site, `Pilot index ${path} sites[${siteIndex}]`)
    for (const key of ['id', 'displayName', 'borough', 'record', 'primaryIdentityBasis']) {
      expectString(item[key], `Pilot index ${path} sites[${siteIndex}].${key}`)
    }
    expectArray(item.challengeTags, `Pilot index ${path} sites[${siteIndex}].challengeTags`)
    expectArray(
      item.decisionCriticalUnknowns,
      `Pilot index ${path} sites[${siteIndex}].decisionCriticalUnknowns`
    )
  }

  return index as unknown as PilotSiteIndex
}

export const loadPilotSite = (
  siteId: string,
  indexPath = 'project/dpl/sites/corpus-1-pilot-index.json'
): LoadedPilotSite => {
  const index = validatePilotIndex(readJson(indexPath), indexPath)
  const site = index.sites.find((candidate) => candidate.id === siteId)
  if (!site) throw new Error(`Pilot site ${siteId} is not admitted by ${indexPath}.`)

  const recordPath = `project/dpl/sites/${site.record}`
  const recordText = readText(recordPath)

  return {
    indexEntry: site,
    recordPath,
    recordText,
    recordFingerprint: sha256DplSemanticFingerprint({ recordPath, recordText }),
    indexEntryFingerprint: sha256DplSemanticFingerprint(site)
  }
}

export const loadInterfaceContract = (
  id: string,
  path: string
): InterfaceContractRef => {
  const content = readText(path)
  return {
    id,
    path,
    semanticFingerprint: sha256DplSemanticFingerprint({ path, content })
  }
}

export const loadB2TargetComposition = () => [
  loadTargetSlice(
    'project/dpl/targets/england-structure-ground-moisture-materials-v1.json',
    'ENGLAND_BUILDING_CONTROL'
  ),
  loadTargetSlice(
    'project/dpl/targets/london-strategic-residential-design-v1.json',
    'LONDON_STRATEGIC_PLANNING'
  )
] as const

export const loadB2InterfaceContracts = () => [
  loadInterfaceContract(
    'DPL-08B-GROUND-DATUM-PLINTH-APPROACH',
    'project/dpl/dpl-08b-ground-datum-plinth-approach-interface.md'
  )
] as const
