import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { eastGroundReceiving, type EastGroundReceivingReference } from '../../../project/rwt/studies/east-ground-outfall.mjs'
import { readCurrentCourtIntake } from '../../../project/rwt/studies/selected-water-event.mjs'
import { sha256SemanticFingerprint } from '../../core/identity.js'
import type { DrawingSceneV2 } from '../../publication-drawing-v2/model.js'
import type { CurrentDesignResolution } from './resolve.js'

const receivingPath = 'project/rwt/studies/selected-receiving-interface.json'
const sourcePath = 'project/rwt/studies/east-ground-outfall.mjs'
const portId = 'east-receiver-far-end'

function readReference(resolved: CurrentDesignResolution) {
  const binding = resolved.disciplineBindings.find(value => value.id === 'rwt-conditional-receiving')
  if (!binding) throw new Error('East ground reception requires an applicable current RWT source')
  const intake = readCurrentCourtIntake()
  const bytes = readFileSync(new URL('../../../' + receivingPath, import.meta.url))
  const receivingBlob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
  if (binding.identities[receivingPath] !== receivingBlob || binding.identities[intake.path] !== intake.blob) {
    throw new Error('The east outfall input differs from the resolved current RWT source binding')
  }
  const gitBlob = binding.identities[sourcePath]
  if (!gitBlob) throw new Error('Missing current east outfall method identity')
  const receiving = JSON.parse(bytes.toString('utf8')) as EastGroundReceivingReference
  return {
    planDigest: binding.applicability.planDigest, bindingDigest: binding.digest, receiving,
    inputs: { [receivingPath]: receivingBlob, [intake.path]: intake.blob },
    method: { id: 'RWT-06-EAST-GROUND-OUTFALL', sourcePath, gitBlob, entryPoints: ['eastGroundReceiving', 'lane'] },
    assignedFlowsLps: [intake.model.incoming.duty, intake.model.incoming.longBackup],
    maximumLevelMm: receiving.east.blockedOutletSpill.farEndMaximumWater,
  }
}

export function readEastGroundReceivingCase(resolved: CurrentDesignResolution) {
  const reference = readReference(resolved)
  return {
    schema: 'rwt-east-ground-receiving-request/1' as const,
    design: resolved.design,
    receiving: {
      schema: 'rwt-east-ground-receiving-case/1' as const,
      planDigest: reference.planDigest, bindingDigest: reference.bindingDigest,
      portId, farEndWaterLevelMm: reference.maximumLevelMm,
    },
  }
}

export function runEastGroundReceivingCase(resolved: CurrentDesignResolution, input: unknown) {
  const reference = readReference(resolved)
  const keys = ['schema', 'planDigest', 'bindingDigest', 'portId', 'farEndWaterLevelMm']
  if (!input || typeof input !== 'object' || Array.isArray(input) ||
      Object.keys(input).length !== keys.length || keys.some(key => !Object.hasOwn(input, key))) {
    throw new Error('Expected a versioned east ground receiving case with one explicit level')
  }
  const trial = input as ReturnType<typeof readEastGroundReceivingCase>['receiving']
  if (trial.schema !== 'rwt-east-ground-receiving-case/1' || trial.portId !== portId) {
    throw new Error('East ground receiving supports only the bound far-end water level')
  }
  if (trial.planDigest !== reference.planDigest || trial.bindingDigest !== reference.bindingDigest) {
    throw new Error('Stale east ground receiving source binding')
  }
  if (!Number.isFinite(trial.farEndWaterLevelMm)) {
    throw new Error('East ground receiving requires a finite far-end water level')
  }

  const schedule = eastGroundReceiving(reference.receiving, reference.assignedFlowsLps, trial.farEndWaterLevelMm)
  const source = { planDigest: reference.planDigest, bindingDigest: reference.bindingDigest,
    caseDigest: sha256SemanticFingerprint(trial), inputs: reference.inputs }
  const scaleDenominator = 25
  const top = schedule.crest
  const point = (xMm: number, zMm: number) => ({ x: 12 + (xMm - schedule.start) / scaleDenominator,
    y: 18 + (top - zMm) / scaleDenominator })
  const primitives: DrawingSceneV2['primitives'] = [
    { kind: 'text', id: 'source-level-key', x: 12, y: 8, role: 'note',
      value: `Source Z${reference.maximumLevelMm} mm` },
    { kind: 'text', id: 'trial-level-key', x: 12, y: 13, role: 'note',
      value: `Trial Z${schedule.tail} mm at X${schedule.end}` },
    { kind: 'line', id: 'bed', a: point(schedule.start, schedule.bed), b: point(schedule.end, schedule.endBed),
      role: 'primary', metadata: { xStartMm: schedule.start, xEndMm: schedule.end, planDigest: source.planDigest, bindingDigest: source.bindingDigest } },
    ...([
      { id: 'source-level', level: reference.maximumLevelMm, role: 'secondary' },
      { id: 'trial-level', level: schedule.tail, role: 'primary' },
    ] as const).map(({ id, level, role }) => ({ kind: 'line' as const, id, role,
      a: point(schedule.end - 300, level), b: point(schedule.end, level),
      metadata: { portId, xMm: schedule.end, zMm: level, planDigest: source.planDigest,
        bindingDigest: source.bindingDigest, caseDigest: source.caseDigest } })),
  ]
  const drawing: DrawingSceneV2 = {
    viewId: 'RWT-E-GROUND-OUTFALL-SECTION', sourceId: portId,
    title: 'East ground outfall · far-end water level',
    description: 'Local section through the lined spill continuation showing the fixed bed and the source and trial water levels.',
    widthMm: 24 + (schedule.end - schedule.start) / scaleDenominator,
    heightMm: 30 + (top - schedule.endBed) / scaleDenominator,
    scaleDenominator, primitives,
  }
  return { schema: 'rwt-east-ground-receiving-result/1' as const,
    status: schedule.flows.every(row => row.ordinaryReserve > 0 && row.faultReserve > 0 && row.downstreamSeparation > 0)
      ? 'within-receiving-sensitivity' : 'exceeds-receiving-sensitivity',
    source, method: reference.method, schedule, drawing,
    diagnostics: [{ portId, code: 'SITE_AND_INSTALLED_ADMISSION_OUTSIDE_SCOPE',
      message: 'Bounded subcritical level comparison. Survey, spill direction, actual losses and installed admission remain open.' }],
  }
}
