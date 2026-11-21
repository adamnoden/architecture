import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'
import { hasPhysicalPlateTrace, validateRoofSurfacePressure } from './current-design/structural-house-coupling.js'

// Actual source roof assembly and fixed-ring particular recovery; no stored whole-house reactions.
const fixture = JSON.parse(execFileSync('python3', ['-B', '-c', `
import json,sys
from pathlib import Path
import numpy as np
sys.path.insert(0,'project/str/studies')
from roof_floor_compatibility import load_roof_only_source,build_roof_only_operator
from roof_stock_gravity import assemble_roof_stock_gravity
from roof_surface_pressure import reference_roof_surface_pressure_settings,assemble_roof_surface_pressure,serial_roof_surface_pressure,recover_combined_roof_primary_actions
op=build_roof_only_operator(load_roof_only_source(Path.cwd()))
s=reference_roof_surface_pressure_settings(op);s['uniformKPa']=-2.25
s['rowMultipliers']['ROOF-ROW/0/0']=0.5
surface=assemble_roof_surface_pressure(op,s);stock=assemble_roof_stock_gravity(op,{'unitWeightKNPerM3':78.5})
full=np.zeros(op['scope']['spaceSize']);load=surface['fullForceN']+.9*stock['fullForceN']
full[op['interiorIndices']]=np.linalg.solve(op['interiorStiffnessN'],load[op['interiorIndices']])
actions=recover_combined_roof_primary_actions(surface,op,full,stock,.9)
ledger={**serial_roof_surface_pressure(surface),'actualLocalActions':actions}
print(json.dumps({'sources':op['sourceSHA256'],'settings':s,'roof':{'roofSurfacePressureIntegrated':True,'roofSurfacePressure':ledger,'roofSteelGravity':{'actualLocalActions':actions}}}))
`], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 }))

test('actual signed roof rows and combined load particular recovery survive admission; detached evidence rejects', () => {
  assert.doesNotThrow(() => validateRoofSurfacePressure(fixture.roof, fixture.settings, fixture.sources))
  for (const edit of [
    (f: typeof fixture) => { f.roof.roofSurfacePressure.origins[0].forceKN[2] *= -1 },
    (f: typeof fixture) => { f.roof.roofSurfacePressure.origins.pop() },
    (f: typeof fixture) => { f.roof.roofSurfacePressure.actualLocalActions[0].appliedSurfaceVerticalDownKN += 1 },
    (f: typeof fixture) => { f.roof.roofSurfacePressure.sourceSHA256['project/str/studies/roof_surface_pressure.py'] = 'historical' },
    (f: typeof fixture) => { f.roof.roofSurfacePressure.actualLocalActions.find((row: { physicalHalfKind: string }) => row.physicalHalfKind === 'finite-outer').actualStrongEndVectorN_Nmm[0] += 1 },
    (f: typeof fixture) => { f.roof.roofSurfacePressure.actualLocalActions.find((row: { physicalHalfKind: string }) => row.physicalHalfKind === 'pin-ended-inner').localReleasedBending.releasedRotationLawPreserved = false },
    (f: typeof fixture) => { f.roof.roofSurfacePressure.facadePressureCorrelationQualified = true },
  ]) {
    const changed = JSON.parse(JSON.stringify(fixture)); edit(changed)
    assert.throws(() => validateRoofSurfacePressure(changed.roof, changed.settings, changed.sources))
  }
  assert.throws(() => validateRoofSurfacePressure(fixture.roof, null, fixture.sources), /Unrequested/)
})

test('equal XY and inventory counts cannot substitute for physical plate participation', () => {
  const trace = { physicalPlateParticipation: { schema: 'str-retained-plate-operator-participation/1', physicalTraceConfirmed: true,
    traceSource: 'actual-physical-mesh-point-trace', createdScalarCoordinateCount: 0, participatingPortCount: 2,
    allCoefficientRowsUsedByPhysicalElements: true, assembledTraceRowMaxAbs: 14.5, condensedTraceRowMaxAbs: .8, portIndices: [12, 30] } }
  assert.equal(hasPhysicalPlateTrace(trace), true)
  assert.equal(hasPhysicalPlateTrace({ xyMm: [3800, 6800], nodeId: 'NORMAL/(3800,6800)' }), false)
  for (const delta of [{ createdScalarCoordinateCount: 1 }, { allCoefficientRowsUsedByPhysicalElements: false },
    { condensedTraceRowMaxAbs: 0 }, { assembledTraceRowMaxAbs: 0 }, { portIndices: [12, 12] }, { physicalTraceConfirmed: false }]) {
    assert.equal(hasPhysicalPlateTrace({ physicalPlateParticipation: { ...trace.physicalPlateParticipation, ...delta } }), false)
  }
})
