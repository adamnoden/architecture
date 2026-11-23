/** Necessary common 3D material bound; never a strength or sufficient material test. */
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
const at = (v: unknown, keys: string[]): unknown => keys.reduce<unknown>((value, key) => record(value) ? value[key] : undefined, v)
const positive = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0
const poisson = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v < .5

export function inspectSlabSolidCompatibility(request: unknown) {
  const vertical = at(request, ['bearingCase', 'masonryCase', 'verticalCase'])
  const plate = at(vertical, ['plateLaw'])
  const membrane = at(vertical, ['monolithicCase', 'houseCase', 'joinedCase', 'floor', 'membraneLaw'])
  const thickness = at(request, ['thicknessMm'])
  const limits = { commonSolidMaterialQualified: false as const, resistanceAccepted: false as const,
    nativeConstitutiveLawUnchanged: true as const }
  const unsupported = () => ({ status: 'unsupported' as const, ...limits,
    diagnostics: ['SLAB_SOLID_LAW/input-unsupported'], scope: 'Explicit finite current plate and membrane laws required' })
  if (!record(plate) || !record(membrane) || !positive(thickness)
    || !positive(plate.elasticModulusMPa) || !poisson(plate.poissonRatio) || !positive(plate.flexuralFactor)
    || !positive(membrane.elasticModulusMPa) || !poisson(membrane.poissonRatio) || !positive(membrane.shearModulusMPa)) {
    return unsupported()
  }
  // Common strain direction: εxx/κxx, with εyy=γxy=κyy=κxy=0.
  const a11NPerMm = membrane.elasticModulusMPa*thickness/(1-membrane.poissonRatio**2)
  const d11NMm = plate.elasticModulusMPa*plate.flexuralFactor*thickness**3/(12*(1-plate.poissonRatio**2))
  const ratioMm2 = d11NMm/a11NPerMm, boundMm2 = thickness**2/4
  const ratioToNecessaryBound = ratioMm2/boundMm2
  const isotropicShearMPa = membrane.elasticModulusMPa/(2*(1+membrane.poissonRatio))
  if (![a11NPerMm, d11NMm, ratioMm2, boundMm2, ratioToNecessaryBound, isotropicShearMPa].every(positive)) return unsupported()
  const commonModulusRuledOut = ratioToNecessaryBound > 1+1e-12
  return { status: commonModulusRuledOut ? 'common-modulus-ruled-out' as const : 'necessary-bound-not-exceeded' as const,
    ...limits, thicknessMm: thickness, a11NPerMm, d11NMm, ratioMm2, boundMm2, ratioToNecessaryBound,
    membraneShearMPa: membrane.shearModulusMPa, isotropicShearMPa,
    membraneIsotropicRelationMatches: Math.abs(membrane.shearModulusMPa/isotropicShearMPa-1) <= 1e-12,
    diagnostics: commonModulusRuledOut ? ['SLAB_SOLID_LAW/common-positive-modulus-impossible'] : [],
    scope: 'Necessary bound D11/A11 ≤ h²/4 for a common positive local through-thickness modulus. Separate positive native operators may remain valid numerical comparisons; no equivalent solid, strength or global stability qualification follows.' }
}
