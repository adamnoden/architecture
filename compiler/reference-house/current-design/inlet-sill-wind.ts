type Bounds = { readonly x: readonly [number, number]; readonly z: readonly [number, number] }
type Resultant = { readonly forceKN: number; readonly firstMomentXKNm: number; readonly firstMomentZKNm: number }

export type SillNativeWind = {
  readonly schema: 'had-south-inlet-sill-native-wind/1'
  readonly method: string
  readonly sources: Readonly<Record<string, string>>
  readonly windowId: string
  readonly pressureKPa: number
  readonly portalAxesXMm: readonly [number, number]
  readonly grossProjectedBay: Bounds
  readonly resultants: { readonly window: Resultant; readonly combinedOpaque: Resultant; readonly gross: Resultant }
}

function at(forceKN: number, xMm: number, zMm: number): Resultant {
  return { forceKN, firstMomentXKNm: forceKN * xMm / 1000, firstMomentZKNm: forceKN * zMm / 1000 }
}

function sum(actions: readonly Resultant[]): Resultant {
  return {
    forceKN: actions.reduce((total, action) => total + action.forceKN, 0),
    firstMomentXKNm: actions.reduce((total, action) => total + action.firstMomentXKNm, 0),
    firstMomentZKNm: actions.reduce((total, action) => total + action.firstMomentZKNm, 0),
  }
}

function subtract(a: Resultant, b: Resultant): Resultant {
  return {
    forceKN: a.forceKN - b.forceKN,
    firstMomentXKNm: a.firstMomentXKNm - b.firstMomentXKNm,
    firstMomentZKNm: a.firstMomentZKNm - b.firstMomentZKNm,
  }
}

const zero = (action: Resultant) => Object.values(action).every(value => Math.abs(value) < 1e-8)
const rounded = (value: number) => Math.abs(value) < 5e-10 ? 0 : Number(value.toFixed(9))
const display = (action: Resultant) => ({
  forceKN: rounded(action.forceKN),
  firstMomentXKNm: rounded(action.firstMomentXKNm),
  firstMomentZKNm: rounded(action.firstMomentZKNm),
})

function area({ x, z }: Bounds) {
  return (x[1] - x[0]) * (z[1] - z[0]) / 1e6
}

function rectangularPressure(bounds: Bounds, pressureKPa: number) {
  const [left, right] = bounds.x
  const [base, head] = bounds.z
  return at(area(bounds) * pressureKPa, (left + right) / 2, (base + head) / 2)
}

function balanceOnAxes(action: Resultant, [left, right]: readonly [number, number]) {
  const x = 1000 * action.firstMomentXKNm / action.forceKN
  const z = 1000 * action.firstMomentZKNm / action.forceKN
  if (!(left < right && x >= left && x <= right)) {
    throw new Error('The wind resultant lies outside the two declared bearing axes')
  }
  const east = action.forceKN * (x - left) / (right - left)
  return [{ xMm: left, zMm: z, forceKN: action.forceKN - east }, { xMm: right, zMm: z, forceKN: east }]
}

function recover(points: ReturnType<typeof balanceOnAxes>) {
  return sum(points.map(({ xMm, zMm, forceKN }) => at(forceKN, xMm, zMm)))
}

export function replaceSillWindPatch(native: SillNativeWind, aperture: Bounds, frameAxes: readonly [number, number],
  rawSillZ: number, jambExtent: readonly [number, number]) {
  const { pressureKPa, grossProjectedBay: bay, portalAxesXMm: portalAxes } = native
  const { window, combinedOpaque, gross } = native.resultants
  if (pressureKPa <= 0 || bay.x.some((value, index) => value !== jambExtent[index]) ||
      aperture.x[0] < bay.x[0] || aperture.x[1] > bay.x[1] ||
      aperture.z[0] < bay.z[0] || aperture.z[1] > rawSillZ || area(aperture) <= 0) {
    throw new Error('The candidate sill aperture is outside the native opaque ground bay')
  }
  if (!zero(subtract(sum([window, combinedOpaque]), gross)) ||
      !zero(subtract(rectangularPressure(bay, pressureKPa), gross))) {
    throw new Error('The native window and opaque fields do not reconcile to the gross ground bay')
  }

  const patch = rectangularPressure(aperture, pressureKPa)
  const remainder = subtract(combinedOpaque, patch)
  if (!(remainder.forceKN > 0)) throw new Error('The candidate aperture consumes the retained opaque ground bay')
  const windowOnPortal = balanceOnAxes(window, portalAxes)
  const opaqueOnPortal = balanceOnAxes(remainder, portalAxes)
  const patchOnPortal = balanceOnAxes(patch, portalAxes)
  const patchOnFrame = balanceOnAxes(patch, frameAxes)
  const replacement = sum([recover(windowOnPortal), recover(opaqueOnPortal), recover(patchOnFrame)])
  const residual = subtract(replacement, gross)
  if (!zero(residual) || !zero(subtract(recover(patchOnPortal), patch))) {
    throw new Error('Sill wind replacement does not conserve world force and both first moments')
  }

  const centreXMm = 1000 * patch.firstMomentXKNm / patch.forceKN
  const centreZMm = 1000 * patch.firstMomentZKNm / patch.forceKN
  const equalPortalShare = patch.forceKN / 2
  const equalPortalRemoval = sum(portalAxes.map(x => at(equalPortalShare, x, centreZMm)))
  return {
    pressureKPa,
    units: 'Normal force in kN. First moments weight the world X and Z coordinates in metres.',
    sourceBay: bay,
    originalFields: { window: display(window), combinedOpaque: display(combinedOpaque), gross: display(gross) },
    removedPatch: { aperture, areaM2: area(aperture), centreXMm, centreZMm, ...display(patch) },
    replacementFields: { window: display(window), opaqueRemainder: display(remainder), independentInsert: display(patch) },
    supports: {
      scope: 'Equivalent normal forces at the field centroid elevation for static accounting only.',
      portalAxesXMm: portalAxes, frameAxesXMm: frameAxes,
      retainedWindowAndOpaquePortal: { window: windowOnPortal, opaqueRemainder: opaqueOnPortal },
      independentlySupportedPatch: patchOnFrame,
      samePatchAtPortalAxesComparison: patchOnPortal,
      equalPortalSplitComparisonEachKN: equalPortalShare,
    },
    conservation: { recovered: display(replacement), residual: display(residual) },
    adverseControls: {
      addPatchWithoutRemoval: display(subtract(sum([gross, patch]), gross)),
      subtractEqualSplitThenAddTruePatch: display(subtract(patch, equalPortalRemoval)),
    },
    restraintOrStrengthVerified: false,
  }
}
