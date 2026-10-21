import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { sha256SemanticFingerprint } from '../core/identity.js'
import type {
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

const validateTargetSlice = (value: unknown, path: string): RawTargetSlice => {
  const target = expectRecord(value, `Target ${path}`)
  const schemaVersion = expectString(target.schemaVersion, `Target ${path} schemaVersion`)
  const allowedSchemas = new Set([
    'dpl.englandTechnicalSlice.v1',
    'dpl.londonStrategicPlanningSlice.v1'
  ])
  if (!allowedSchemas.has(schemaVersion)) {
    throw new Error(`Unsupported DPL target schema ${schemaVersion} at ${path}.`)
  }

  expectString(target.id, `Target ${path} id`)
  const methods = expectArray(target.methodClasses, `Target ${path} methodClasses`)
  const sources = expectArray(target.sourceSnapshots, `Target ${path} sourceSnapshots`)
  const obligations = expectArray(target.obligations, `Target ${path} obligations`)

  for (const [index, method] of methods.entries()) {
    const item = expectRecord(method, `Target ${path} methodClasses[${index}]`)
    expectString(item.id, `Target ${path} methodClasses[${index}].id`)
    expectString(item.kind, `Target ${path} methodClasses[${index}].kind`)
  }

  for (const [index, source] of sources.entries()) {
    const item = expectRecord(source, `Target ${path} sourceSnapshots[${index}]`)
    expectString(item.id, `Target ${path} sourceSnapshots[${index}].id`)
  }

  for (const [index, obligation] of obligations.entries()) {
    const item = expectRecord(obligation, `Target ${path} obligations[${index}]`)
    expectString(item.id, `Target ${path} obligations[${index}].id`)
    expectString(item.sourceSnapshot, `Target ${path} obligations[${index}].sourceSnapshot`)
    expectString(item.title, `Target ${path} obligations[${index}].title`)
    expectString(item.applicability, `Target ${path} obligations[${index}].applicability`)
    expectString(item.resolutionMethod, `Target ${path} obligations[${index}].resolutionMethod`)
  }

  return target as unknown as RawTargetSlice
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
    recordFingerprint: sha256SemanticFingerprint({ recordPath, recordText }),
    indexEntryFingerprint: sha256SemanticFingerprint(site)
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
