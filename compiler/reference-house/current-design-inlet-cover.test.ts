import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { prepareCurrentDesignCompile } from './current-design/compile.js'
import { readGeorgianDesignSnapshot } from './current-design/georgian-source.js'

const design = readGeorgianDesignSnapshot()
const compile = prepareCurrentDesignCompile(design)
const cli = (mode: string, input: unknown) => spawnSync(process.execPath,
  ['--import', 'tsx', 'scripts/compile-current-design.ts', mode, '-'],
  { input: JSON.stringify(input), encoding: 'utf8' })

test('the model sustains a straight release and an offset first rest for each branch with the washer parked', async () => {
  const requests = await compile.readInletCoverCases()
  const [utility, plant] = await Promise.all(requests.map(({ cover }) => compile.inletCover(cover)))
  assert.deepEqual([utility.branch, plant.branch], ['utility', 'plant'])
  assert.deepEqual([utility.calculation.beyondFrontToTurnMm, plant.calculation.beyondFrontToTurnMm], [132, 167])
  assert.deepEqual([utility.calculation.frontBridgeAvailableMm, plant.calculation.frontBridgeAvailableMm], [43, 78])
  assert.deepEqual(utility.calculation.firstRest.boundsMm, { x: [9909, 10033], y: [670, 797] })
  assert.deepEqual(plant.calculation.firstRest.boundsMm, { x: [10332, 10456], y: [670, 832] })
  for (const result of [utility, plant]) {
    assert.equal(result.status, 'within-conditional-cover-screen')
    assert.equal(result.calculation.clearStationaryRiserMm, 84)
    assert.equal(result.calculation.parkedCarrierClearanceMm, 5)
    assert.equal(result.calculation.carrierTravelToContactMm, null)
    assert.equal(result.calculation.sideLandReserveMm, 3)
    assert.equal(result.calculation.receiverBearingReserveMm, 1)
    assert.equal(result.calculation.firstRest.captureQualified, false)
    assert.equal(result.evidence.wetClosure, 'unqualified')
    assert.match(result.source.gitBlob, /^[a-f\d]{40}$/)
  }
  assert.ok(utility.calculation.firstRest.boundsMm.x[1] < plant.calculation.firstRest.boundsMm.x[0])

  const exported = cli('--read-inlet-cover', design)
  assert.equal(exported.status, 0, exported.stderr)
  assert.deepEqual(JSON.parse(exported.stdout), requests)
  const compiled = cli('--inlet-cover', requests[0])
  assert.equal(compiled.status, 0, compiled.stderr)
  assert.deepEqual(JSON.parse(compiled.stdout), JSON.parse(JSON.stringify(utility)))
})

test('an inline cover rest blocks the carrier and the installed washer blocks both side-transfer starts', async () => {
  const requests = await compile.readInletCoverCases()
  for (const [{ cover }, washerDeficit] of requests.map((request, i) => [request, [7, 42][i]] as const)) {
    const inline = await compile.inletCover({ ...cover, axialTravelMm: 84, sideTravelMm: 0 })
    assert.equal(inline.status, 'blocked')
    assert.equal(inline.calculation.carrierTravelToContactMm, 84)
    assert.ok(inline.diagnostics.some(({ code }) => code === 'FIRST_REST_OVERLAPS_CARRIER_CORRIDOR'))
    assert.equal(inline.diagnostics.some(({ code }) => code === 'RISER_STILL_ENGAGED'), false)

    const installed = await compile.inletCover({ ...cover, washer: 'installed' })
    assert.equal(installed.status, 'blocked')
    assert.equal(installed.calculation.washerAxialAvailableMm, 125)
    assert.equal(installed.calculation.washerTravelReserveMm, -washerDeficit)
    assert.ok(installed.diagnostics.some(({ code }) => code === 'WASHER_OBSTRUCTS_AXIAL_RELEASE'))

    const early = await compile.inletCover({ ...cover, axialTravelMm: cover.axialTravelMm - 5 })
    assert.equal(early.calculation.turnReserveMm, -5)
    assert.ok(early.diagnostics.some(({ code }) => code === 'TURN_CROSSES_RETAINED_FRONT'))
  }
})

test('side shift and bearing allowances show specific changed geometry and keep stale evidence excluded', async () => {
  const [{ cover }] = await compile.readInletCoverCases()
  const nominal = await compile.inletCover(cover)
  const tooNear = await compile.inletCover({ ...cover, sideTravelMm: cover.sideTravelMm + 10, receiverRailWidthMm: 12 })
  assert.equal(tooNear.status, 'blocked')
  assert.equal(tooNear.calculation.parkedCarrierClearanceMm, -5)
  assert.equal(tooNear.calculation.receiverBearingReserveMm, -1)
  assert.notEqual(tooNear.source.caseDigest, nominal.source.caseDigest)
  assert.notDeepEqual(tooNear.drawing.primitives, nominal.drawing.primitives)
  assert.equal(tooNear.source.removalCaseDigest, nominal.source.removalCaseDigest)
  const wide = await compile.inletCover({ ...cover, cheekMm: 25, minimumFrontBridgeMm: 44 })
  assert.equal(wide.calculation.sideLandReserveMm, -2)
  assert.deepEqual(wide.diagnostics.map(({ code }) => code),
    ['SIDE_LAND_OVERBOOKED', 'FRONT_BRIDGE_TOO_SHORT', 'FIRST_REST_OVERLAPS_CARRIER_CORRIDOR'])
  await assert.rejects(compile.inletCover({ ...cover, removalCaseDigest: 'other-removal' }), /source binding/)
  await assert.rejects(compile.inletCover({ ...cover, sideTravelMm: Number.MAX_VALUE }), /screened motion range/)
  await assert.rejects(compile.inletCover({ ...cover, anotherField: true }), /versioned south inlet cover case/)
})

test('the installed filler and formed vent are screened separately from the opened cover sweep', async () => {
  const [{ cover: utility }, { cover: plant }] = await compile.readInletCoverCases()
  const west = await compile.inletCover(utility)
  const east = await compile.inletCover(plant)
  assert.equal(west.status, 'within-conditional-cover-screen')
  assert.equal(west.installedClosure.status, 'blocked')
  assert.equal(west.installedClosure.clearance.installedCoverToCellSideAfterSettingMm, -45)
  assert.equal(east.installedClosure.clearance.installedCoverToCellSideAfterSettingMm, 18)
  assert.equal(east.installedClosure.clearance.formedVentBelowWallReturnAfterSettingMm, 27.61)
  assert.equal(east.installedClosure.clearance.collarRadialSealLandAfterSettingMm, 2)
  const deepReturn = await compile.inletCover({ ...plant, closure: { notchLapMm: 10, collarSealLandMm: 4, collarOutsideDiameterMm: 92, wallReturnDepthMm: 41 } })
  assert.equal(deepReturn.installedClosure.clearance.formedVentBelowWallReturnAfterSettingMm, -1.39)
  assert.ok(deepReturn.installedClosure.diagnostics.includes('WALL_RETURN_INTERCEPTS_FORMED_VENT'))
  assert.deepEqual(east.installedClosure.diagnostics, ['COLLAR_RADIAL_SEAL_LAND_SHORT'])

  const closure = { notchLapMm: 10, collarSealLandMm: 4, collarOutsideDiameterMm: 92, wallReturnDepthMm: 10 }
  const refit = await compile.inletCover({ ...plant, closure })
  assert.equal(refit.installedClosure.status, 'within-conditional-closure-fit')
  assert.equal(refit.installedClosure.clearance.formedVentBelowWallReturnAfterSettingMm, 29.61)
  assert.equal(refit.installedClosure.clearance.collarInsideFillerAfterSettingMm, 1)
  assert.equal(refit.installedClosure.wetClosureQualified, false)
  assert.equal(refit.installedClosure.splitFillerReleaseQualified, false)
  assert.deepEqual((await compile.inletCover({ ...utility, closure })).installedClosure.diagnostics,
    ['RECTANGULAR_COVER_EXCEEDS_INSTALLED_CELL_PLAN'])
  await assert.rejects(compile.inletCover({ ...plant, closure: { ...closure, notchLapMm: 0 } }), /closure comparison/)
  await assert.rejects(compile.inletCover({ ...plant, closure: null }), /closure comparison/)
})

test('a rounded Utility lid proves the shape and declares the axial withdrawal stages without inventing a qualified seal', async () => {
  const [{ cover: utility }, { cover: plant }] = await compile.readInletCoverCases()
  const closure = { profile: 'rounded-taper' as const, notchLapMm: 10, collarSealLandMm: 4,
    collarOutsideDiameterMm: 92, wallReturnDepthMm: 10, fillerAndCollarClear: true, taperDetached: true }
  const attempted = await compile.inletCover({ ...utility, closure })
  const taper = attempted.installedClosure.roundedTaper
  assert.ok(taper)
  assert.equal(taper.centreToTaperMm, 54.402)
  assert.equal(taper.maximumConcentricLapAfterSettingMm, 7.402)
  assert.equal(taper.minimumConcentricLapForCollarMm, 9)
  assert.equal(taper.fillerToTaperAfterSettingMm, -2.598)
  assert.deepEqual(attempted.installedClosure.diagnostics, ['ROUND_FILLER_INTERSECTS_TAPER'])
  assert.equal(attempted.roundedRelease?.status, 'within-declared-rounded-release-screen')
  assert.equal(attempted.roundedRelease?.assembledCandidateStatus, 'blocked')
  assert.equal(attempted.roundedRelease?.axialStrokeToClearRiserMm, 84)
  assert.equal(attempted.roundedRelease?.axialStrokeBeforeSideTransferMm, 132)
  assert.equal(attempted.drawing.primitives.filter(item => item.id.startsWith('rounded-outer-closed-')).length, 5)
  assert.equal(attempted.drawing.primitives.filter(item => item.id.startsWith('rounded-notch-arc-')).length, 16)

  const narrowLap = await compile.inletCover({ ...utility, closure: { ...closure, notchLapMm: 7 } })
  assert.ok(narrowLap.installedClosure.diagnostics.includes('COLLAR_EXCEEDS_FILLER'))
  const reducedLand = { ...closure, notchLapMm: 7, collarSealLandMm: 2, collarOutsideDiameterMm: 88 }
  const conditional = await compile.inletCover({ ...utility, closure: reducedLand })
  assert.equal(conditional.installedClosure.roundedTaper?.fillerToTaperAfterSettingMm, 0.402)
  assert.equal(conditional.roundedRelease?.assembledCandidateStatus, 'within-conditional-fit-and-withdrawal')
  assert.equal(conditional.roundedRelease?.captureQualified, false)
  assert.equal(conditional.roundedRelease?.splitFillerWithdrawalQualified, false)

  const locked = await compile.inletCover({ ...utility, closure: {
    ...reducedLand, taperDetached: false, fillerAndCollarClear: false,
  } })
  assert.equal(locked.roundedRelease?.assembledCandidateStatus, 'blocked')
  assert.deepEqual(locked.roundedRelease?.diagnostics, ['FILLER_AND_COLLAR_REMAIN_ENGAGED', 'UTILITY_TAPER_REMAINS_ATTACHED'])
  await assert.rejects(compile.inletCover({ ...plant, closure }), /rounded Utility taper/)
})

test('westward Utility toe relief preserves the wall heel and replays filler, purge and baffle fit together', async () => {
  const [{ cover: utility }, { cover: plant }] = await compile.readInletCoverCases()
  const closure = { profile: 'rounded-taper' as const, notchLapMm: 9, collarSealLandMm: 4,
    collarOutsideDiameterMm: 92, wallReturnDepthMm: 10, fillerAndCollarClear: true, taperDetached: true }
  const nominal = await compile.inletCover({ ...utility, closure: { ...closure, taperToeReliefMm: 0 } })
  assert.deepEqual(nominal.installedClosure.diagnostics, ['ROUND_FILLER_INTERSECTS_TAPER', 'TAPER_RELIEF_INTERSECTS_BAFFLE'])
  assert.deepEqual(nominal.installedClosure.roundedTaper?.relief, {
    heelMm: [9995, 522], boundToeMm: [10058, 665], trialToeMm: [10058, 665],
    minimumToeReliefForSelectedFillerMm: 3.1172, minimumToeReliefForBaffleMm: 3.7073,
    purgeBodyReserveAfterAccessSettingMm: 30.8205, baffleWestReserveAfterFabricationSettingMm: -3.1888,
  })

  const candidate = await compile.inletCover({ ...utility, closure: { ...closure, taperToeReliefMm: 4 } })
  const taper = candidate.installedClosure.roundedTaper
  assert.deepEqual(taper?.relief.trialToeMm, [10054, 665])
  assert.equal(taper?.fillerToTaperAfterSettingMm, 0.4537)
  assert.equal(taper?.relief.purgeBodyReserveAfterAccessSettingMm, 28.2662)
  assert.equal(taper?.relief.baffleWestReserveAfterFabricationSettingMm, 0.2517)
  assert.equal(candidate.roundedRelease?.assembledCandidateStatus, 'within-conditional-fit-and-withdrawal')
  assert.equal(candidate.installedClosure.wetClosureQualified, false)
  assert.equal(candidate.roundedRelease?.captureQualified, false)
  assert.deepEqual(candidate.calculation, nominal.calculation)
  assert.notEqual(candidate.source.caseDigest, nominal.source.caseDigest)
  assert.equal(candidate.source.removalCaseDigest, nominal.source.removalCaseDigest)
  assert.ok(candidate.drawing.primitives.some(item => item.id === 'utility-taper-relief-trial'))

  const excessive = await compile.inletCover({ ...utility, closure: { ...closure, taperToeReliefMm: 62 } })
  assert.deepEqual(excessive.installedClosure.diagnostics, ['TAPER_RELIEF_INTERSECTS_PURGE_STANCE'])
  assert.equal(excessive.roundedRelease?.assembledCandidateStatus, 'blocked')
  await assert.rejects(compile.inletCover({ ...utility, closure: { ...closure, taperToeReliefMm: 63 } }), /positive taper slope/)
  await assert.rejects(compile.inletCover({ ...utility, closure: { ...closure, taperToeReliefMm: -1 } }), /non-negative/)
  assert.equal((await compile.inletCover(plant)).installedClosure.roundedTaper, null)
})

test('the shaped lid draws both actual first-rest contacts and checks a declared minimum per rail', async () => {
  const [{ cover: utility }, { cover: plant }] = await compile.readInletCoverCases()
  const closure = { profile: 'rounded-taper' as const, notchLapMm: 9, collarSealLandMm: 4,
    collarOutsideDiameterMm: 92, wallReturnDepthMm: 10, fillerAndCollarClear: true, taperDetached: true,
    taperToeReliefMm: 4 }
  const surveyed = await compile.inletCover({ ...utility, closure })
  const receiver = surveyed.roundedRelease?.receiver
  assert.equal(receiver?.requiredFullWidthContactMm, null)
  assert.equal(receiver?.lengthRequirementMet, null)
  assert.deepEqual(receiver?.contact.map(({ side, fullWidthContactMm }) => [side, fullWidthContactMm]),
    [['west', 29.0599], ['east', 127]])
  assert.deepEqual(receiver?.contact[0].boundsMm?.x, [9915, 9923])
  assert.equal(receiver?.contact[0].boundsMm?.y[0], 670)
  assert.equal(surveyed.calculation.receiverBearingReserveMm, 1)
  assert.equal(surveyed.roundedRelease?.captureQualified, false)

  const westContact = surveyed.drawing.primitives.find(item => item.id === 'receiver-full-width-contact-0')
  assert.equal(westContact?.metadata?.yMaxMm, receiver?.contact[0].boundsMm?.y[1])
  assert.ok(surveyed.drawing.primitives.some(item => item.id === 'rounded-first-rest-notch-west'))
  assert.ok(surveyed.drawing.primitives.some(item => item.id === 'rounded-after-axial-release-notch-east'))
  assert.ok(!surveyed.drawing.primitives.some(item => item.id === 'first-rest-0'))

  const tooShort = await compile.inletCover({ ...utility, closure: { ...closure, minimumReceiverContactMm: 30 } })
  assert.deepEqual(tooShort.roundedRelease?.diagnostics, ['ROUNDED_RECEIVER_CONTACT_TOO_SHORT'])
  assert.equal(tooShort.roundedRelease?.assembledCandidateStatus, 'blocked')
  const inside = await compile.inletCover({ ...utility, closure: { ...closure, minimumReceiverContactMm: 29 } })
  assert.equal(inside.roundedRelease?.receiver?.lengthRequirementMet, true)
  assert.equal(inside.roundedRelease?.assembledCandidateStatus, 'within-conditional-fit-and-withdrawal')
  assert.notEqual(inside.source.caseDigest, tooShort.source.caseDigest)

  const bound = await compile.inletCover({ ...utility, closure: { ...closure, taperToeReliefMm: 0 } })
  assert.deepEqual(bound.roundedRelease?.receiver?.contact.map(row => row.fullWidthContactMm), [26.0744, 127])
  assert.equal((await compile.inletCover(plant)).roundedRelease, null)
  await assert.rejects(compile.inletCover({ ...utility, closure: { ...closure, minimumReceiverContactMm: 0 } }), /positive Utility minimum/)
})

test('the held-heel taper reports the simultaneous three-interface reserve interval and governing limits', async () => {
  const [{ cover }] = await compile.readInletCoverCases()
  const closure = { profile: 'rounded-taper' as const, notchLapMm: 9, collarSealLandMm: 4,
    collarOutsideDiameterMm: 92, wallReturnDepthMm: 10, fillerAndCollarClear: true, taperDetached: true,
    taperToeReliefMm: 4, minimumTaperReservesMm: { filler: 5, baffle: 5, purge: 5 } }
  const narrow = await compile.inletCover({ ...cover, closure })
  const envelope = narrow.installedClosure.roundedTaper?.relief.reserveEnvelope
  const range = envelope?.toeReliefRangeMm
  assert.ok(range)
  assert.ok(Math.abs(range.minimum - 12.8189) < 0.0001)
  assert.ok(Math.abs(range.maximum - 30.9822) < 0.0001)
  assert.equal(range.maximumIncluded, true)
  for (const taperToeReliefMm of [range.minimum, range.maximum]) {
    const limit = await compile.inletCover({ ...cover, closure: { ...closure, taperToeReliefMm } })
    assert.deepEqual(limit.installedClosure.roundedTaper?.relief.reserveEnvelope?.trialMisses, [])
  }
  assert.deepEqual(envelope?.trialMisses, ['filler', 'baffle'])
  assert.deepEqual(envelope?.bestCommonReserve, { afterSettingsMm: 11.0756, toeReliefMm: 24.6507,
    attained: true, controllingInterfaces: ['filler', 'purge'] })
  assert.deepEqual(narrow.installedClosure.diagnostics, ['TAPER_RELIEF_MISSES_DECLARED_RESERVES'])

  const balanced = await compile.inletCover({ ...cover, closure: { ...closure, taperToeReliefMm: 20 } })
  assert.deepEqual(balanced.installedClosure.roundedTaper?.relief.reserveEnvelope?.trialMisses, [])
  assert.equal(balanced.roundedRelease?.assembledCandidateStatus, 'within-conditional-fit-and-withdrawal')
  assert.deepEqual(balanced.roundedRelease?.receiver?.contact.map(row => row.fullWidthContactMm), [46.4506, 127])
  assert.equal(balanced.roundedRelease?.captureQualified, false)
  assert.equal(balanced.installedClosure.wetClosureQualified, false)

  const separate = await compile.inletCover({ ...cover, closure: { ...closure, taperToeReliefMm: 20,
    minimumTaperReservesMm: { ...closure.minimumTaperReservesMm, baffle: 20 } } })
  assert.deepEqual(separate.installedClosure.roundedTaper?.relief.reserveEnvelope?.trialMisses, ['baffle'])
  const impossible = await compile.inletCover({ ...cover, closure: { ...closure,
    minimumTaperReservesMm: { filler: 12, baffle: 12, purge: 12 } } })
  assert.equal(impossible.installedClosure.roundedTaper?.relief.reserveEnvelope?.toeReliefRangeMm, null)
  await assert.rejects(compile.inletCover({ ...cover, closure: { ...closure,
    minimumTaperReservesMm: { filler: -1, baffle: 5, purge: 5 } } }), /separate finite non-negative/)
})

test('the bare rounded lid centroid screens against the actual first-rest support polygon', async () => {
  const [{ cover }, { cover: plant }] = await compile.readInletCoverCases()
  const closure = { profile: 'rounded-taper' as const, notchLapMm: 9, collarSealLandMm: 4,
    collarOutsideDiameterMm: 92, wallReturnDepthMm: 10, fillerAndCollarClear: true, taperDetached: true,
    taperToeReliefMm: 4 }
  const baseline = await compile.inletCover({ ...cover, closure })
  const gravity = baseline.roundedRelease?.gravity
  assert.equal(gravity?.status, 'centre-inside-support')
  assert.equal(gravity?.lidAreaMm2, 7371.1396)
  assert.equal(gravity?.minimumSignedSupportEdgeMarginMm, 12.9871)
  assert.deepEqual(gravity?.centreOfMassMm?.map(value => Number(value.toFixed(4))), [9984.5871, 746.7528])
  assert.equal(gravity?.supportPolygonMm.length, 5)
  assert.ok(baseline.drawing.primitives.some(item => item.id === 'first-rest-lid-centre-x'))
  assert.equal(baseline.drawing.primitives.filter(item => item.id.startsWith('first-rest-support-polygon-')).length, 5)
  assert.equal(baseline.roundedRelease?.captureQualified, false)

  const widerRelief = await compile.inletCover({ ...cover, closure: { ...closure, taperToeReliefMm: 20 } })
  assert.equal(widerRelief.roundedRelease?.gravity?.minimumSignedSupportEdgeMarginMm, 13.4035)
  assert.equal(widerRelief.roundedRelease?.receiver?.contact[0].fullWidthContactMm, 46.4506)
  const translated = await compile.inletCover({ ...cover, closure, sideTravelMm: cover.sideTravelMm - 10 })
  assert.equal(translated.roundedRelease?.gravity?.minimumSignedSupportEdgeMarginMm, 12.9871)
  assert.ok(gravity?.centreOfMassMm && translated.roundedRelease?.gravity?.centreOfMassMm)
  assert.equal(gravity.centreOfMassMm[0] - translated.roundedRelease.gravity.centreOfMassMm[0], 10)

  const lostWest = await compile.inletCover({ ...cover, closure, cheekMm: 100 })
  assert.equal(lostWest.roundedRelease?.receiver?.contact[0].fullWidthContactMm, 0)
  assert.equal(lostWest.roundedRelease?.gravity?.status, 'centre-outside-support')
  assert.equal(lostWest.roundedRelease?.gravity?.minimumSignedSupportEdgeMarginMm, -24.2545)
  assert.ok(lostWest.roundedRelease?.diagnostics.includes('ROUNDED_LID_LACKS_POSITIVE_GRAVITY_RESERVE'))
  const lostBoth = await compile.inletCover({ ...cover, closure, receiverRailWidthMm: 12 })
  assert.equal(lostBoth.roundedRelease?.gravity?.status, 'no-full-width-support')
  assert.equal(lostBoth.roundedRelease?.gravity?.minimumSignedSupportEdgeMarginMm, null)
  assert.equal((await compile.inletCover(plant)).roundedRelease, null)
})

test('a downward point load at the west front can govern despite positive bare-lid stability', async () => {
  const [{ cover }] = await compile.readInletCoverCases()
  const closure = { profile: 'rounded-taper' as const, notchLapMm: 9, collarSealLandMm: 4,
    collarOutsideDiameterMm: 92, wallReturnDepthMm: 10, fillerAndCollarClear: true, taperDetached: true,
    taperToeReliefMm: 4 }
  const short = await compile.inletCover({ ...cover, closure })
  const limit = short.roundedRelease?.gravity?.eccentricVerticalPointLoad
  assert.equal(limit?.status, 'finite-support-edge-limit')
  if (limit?.status !== 'finite-support-edge-limit') throw new Error('Expected a finite limit')
  assert.equal(limit.pointLoadToBareLidWeightAtEdge, 0.2762)
  assert.deepEqual(limit.governingVertexMm.map(value => Number(value.toFixed(4))), [9950.4089, 797])
  assert.deepEqual(limit.governingSupportEdgeMm.map(point => point.map(value => Number(value.toFixed(4)))),
    [[10019, 797], [9915, 699.0599]])
  assert.equal(short.roundedRelease?.captureQualified, false)

  const wider = await compile.inletCover({ ...cover, closure: { ...closure, taperToeReliefMm: 20 } })
  const widerLimit = wider.roundedRelease?.gravity?.eccentricVerticalPointLoad
  assert.equal(widerLimit?.status, 'finite-support-edge-limit')
  if (widerLimit?.status !== 'finite-support-edge-limit') throw new Error('Expected a finite limit')
  assert.equal(widerLimit.pointLoadToBareLidWeightAtEdge, 0.2582)
  assert.equal(wider.roundedRelease?.gravity?.minimumSignedSupportEdgeMarginMm, 13.4035)
  const unsupported = await compile.inletCover({ ...cover, closure, cheekMm: 100 })
  assert.equal(unsupported.roundedRelease?.gravity?.eccentricVerticalPointLoad, null)
})

test('an independent transverse front receiver supports the shaped solid bridge and enlarges the real bearing hull', async () => {
  const [{ cover }, { cover: plant }] = await compile.readInletCoverCases()
  const closure = { profile: 'rounded-taper' as const, notchLapMm: 9, collarSealLandMm: 4,
    collarOutsideDiameterMm: 92, wallReturnDepthMm: 10, fillerAndCollarClear: true, taperDetached: true,
    taperToeReliefMm: 20 }
  const baseline = await compile.inletCover({ ...cover, closure })
  const trial = { ...cover, closure: { ...closure, frontReceiver: { widthMm: 8, edgeInsetMm: 5 } } }
  const supported = await compile.inletCover(trial)
  const receiver = supported.roundedRelease?.frontReceiver
  assert.equal(receiver?.status, 'within-plan-contact-screen')
  assert.ok(receiver?.contact)
  assert.deepEqual(receiver.contact.y, [784, 792])
  assert.ok(Math.abs(receiver.contact.x[0] - 9937.717662537945) < 1e-8)
  assert.equal(receiver.contact.x[1], 10028)
  assert.equal(receiver.clearance.notchAfterSettingMm, 25)
  assert.equal(receiver.clearance.carrierAfterSettingMm, 5)
  assert.equal(receiver.anchoredSupportAndCaptureQualified, false)
  assert.deepEqual(supported.roundedRelease?.receiver, baseline.roundedRelease?.receiver)
  assert.deepEqual(supported.roundedRelease?.gravity?.centreOfMassMm, baseline.roundedRelease?.gravity?.centreOfMassMm)
  assert.equal(supported.roundedRelease?.gravity?.minimumSignedSupportEdgeMarginMm, 46.2737)
  const limit = supported.roundedRelease?.gravity?.eccentricVerticalPointLoad
  assert.equal(limit?.status, 'finite-support-edge-limit')
  if (limit?.status !== 'finite-support-edge-limit') throw new Error('Expected a bounded eccentric load')
  assert.equal(limit.pointLoadToBareLidWeightAtEdge, 8.3216)
  assert.ok(supported.drawing.primitives.some(item => item.id === 'front-receiver-0'))
  assert.equal(supported.roundedRelease?.captureQualified, false)
  const exported = cli('--inlet-cover', { schema: 'had-inlet-cover-request/1', design, cover: trial })
  assert.equal(exported.status, 0, exported.stderr)
  assert.deepEqual(JSON.parse(exported.stdout), JSON.parse(JSON.stringify(supported)))

  const inset = await compile.inletCover({ ...trial, closure: { ...trial.closure, frontReceiver: { widthMm: 8, edgeInsetMm: 15 } } })
  const insetLimit = inset.roundedRelease?.gravity?.eccentricVerticalPointLoad
  assert.ok(insetLimit?.status === 'finite-support-edge-limit')
  assert.equal(insetLimit.pointLoadToBareLidWeightAtEdge, 2.7546)
  const translated = await compile.inletCover({ ...trial, sideTravelMm: cover.sideTravelMm - 10 })
  assert.equal(translated.roundedRelease?.gravity?.minimumSignedSupportEdgeMarginMm, 46.2737)
  const notch = await compile.inletCover({ ...trial, closure: { ...trial.closure, frontReceiver: { widthMm: 40, edgeInsetMm: 5 } } })
  assert.ok(notch.roundedRelease?.diagnostics.includes('FRONT_RECEIVER_ENTERS_NOTCH'))
  assert.equal(notch.roundedRelease?.frontReceiver?.contact, null)
  assert.deepEqual(notch.roundedRelease?.gravity, baseline.roundedRelease?.gravity)
  const tooClose = await compile.inletCover({ ...trial, closure: { ...trial.closure, frontReceiver: { widthMm: 8, edgeInsetMm: 3 } } })
  assert.ok(tooClose.roundedRelease?.diagnostics.includes('FRONT_RECEIVER_EDGE_RESERVE_SHORT'))
  const carrier = await compile.inletCover({ ...trial, sideTravelMm: -100 })
  assert.ok(carrier.roundedRelease?.diagnostics.includes('FRONT_RECEIVER_ENTERS_CARRIER_CORRIDOR'))
  assert.equal(carrier.roundedRelease?.frontReceiver?.contact, null)
  const outside = await compile.inletCover({ ...trial, sideTravelMm: -600 })
  assert.ok(outside.roundedRelease?.diagnostics.includes('FRONT_RECEIVER_EXCEEDS_ROOM'))
  await assert.rejects(compile.inletCover({ ...trial, closure: { ...trial.closure,
    frontReceiver: { widthMm: 0, edgeInsetMm: 5 } } }), /front receiver width and edge inset/)
  await assert.rejects(compile.inletCover({ ...plant, closure: trial.closure }), /rounded Utility taper/)
})
