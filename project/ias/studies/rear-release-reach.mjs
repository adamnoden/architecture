import assert from 'node:assert/strict'

// Axial elevations below are intercepts at d=0. Subtract the as-fitted downward
// rim-to-flange offset d from each moving/socket elevation, never from the board.
export function rearReleaseTrial({rim, rcTop, rcUnderside, bodyDepth, fullTail,
  couplingLength, endGap, parkGap, boardThickness, drain, well, service}) {
  const boardTop = rcUnderside + boardThickness
  const tip = rim - fullTail, fixedTop = tip - endGap
  const landUpperBound = fullTail - bodyDepth
  const overlapSum = couplingLength - endGap, centred = overlapSum / 2
  const boardDebit = boardTop + couplingLength - tip
  const bestUpperOverlap = Math.min(landUpperBound, overlapSum)
  const maxD = centred - boardDebit, parkedTop = fixedTop - parkGap
  const freeEndZ = [fixedTop, fixedTop + couplingLength]
  assert(centred > 0 && centred <= bestUpperOverlap && maxD >= 0)
  assert.deepEqual(service.trayDrainEvidence.drainCentre, drain)
  const [wx, wy, ww, wh] = well, [dx, dy] = drain
  assert.deepEqual([wx + ww/2, wy + wh/2], drain)
  const [hx, hy, hw, hh] = service.clearHatch
  assert(wx >= hx && wy >= hy && wx + ww <= hx + hw && wy + wh <= hy + hh)

  // pecolift-static-reference.py: only X of the foot/shoulders varies. The
  // fixed foot Y and facing direction hold for all admitted basket origins.
  const footX = [2050 - 52.5 - 10, 2050 + 52.5 - 10], footY = 9517.5
  const shoulderZ = 1250 + 1450, headTop = 1250 + 1750, arm = 600, halfShoulders = 200
  const lowestMouth = boardTop + couplingLength
  const axisHeight = (sx, sy, sz) => sz + Math.sqrt(arm**2 - (sx-dx)**2 - (sy-dy)**2)
  // Endpoints suffice for far-hand extrema. The closest hand switches identity
  // when foot X equals drain X; include that interior worst case for one hand.
  assert(footX[0] <= dx && dx <= footX[1] && footX[1] - footX[0] < halfShoulders)
  const footCases = [footX[0], dx, footX[1]]
  const heights = footCases.map(fx => [-1,1].map(sign =>
    axisHeight(fx + sign * halfShoulders, footY, shoulderZ)))
  const oneAtEveryOrigin = Math.min(...heights.map(pair => Math.max(...pair)))
  const bothAtEveryOrigin = Math.min(...heights.map(pair => Math.min(...pair)))
  const bothAtBestOrigin = Math.max(...heights.map(pair => Math.min(...pair)))
  // Ideal straight centreline to the accessible lower axial datum; test its
  // intersection with the entire slab depth up to target, not a free reach
  // through adjacent RC. The lowest and highest eligible bottom Z bound all
  // intermediate rays; at the target the ray is already on the central axis.
  const closedBottom = tip + centred - couplingLength
  const remainingAtPlane = (sx, sy, z) => {
    const t = (rcUnderside - shoulderZ) / (z - shoulderZ)
    const px = sx + (dx-sx)*t, py = sy + (dy-sy)*t
    return Math.min(px-wx, wx+ww-px, py-wy, wy+wh-py)
  }
  const wellRayReserve = Math.min(...footCases.flatMap(fx => [-1,1].flatMap(sign =>
    [boardTop,closedBottom].map(z => remainingAtPlane(fx+sign*halfShoulders,footY,z)))))
  const hatchBodyReserve = Math.min(footX[0]-240-hx, hx+hw-footX[1]-240,
    footY-150-hy, hy+hh-footY-150)
  const hardwareTop = 1600 + (1250-300) // prospective one-to-one source equipment contract
  const spareHardwareRise = service.finishedPanelUnderside - hardwareTop
  const maxHeadPlanDistance = Math.max(...footX.map(fx => Math.hypot(fx-dx,footY-dy)))
  const oldShoulder = service.operatorShoulder
  const baselineReachZ = axisHeight(...oldShoulder)
  // Cold-task alternative has a published height, but its platform origin,
  // supported foot posture and both shoulders' plan coordinates are unknown.
  const ladderDeck = 1350, ladderShoulderZ = ladderDeck+1450
  const shoulderPlanLimit = z => Math.sqrt(arm**2 - (z-ladderShoulderZ)**2)
  assert(rcUnderside > shoulderZ && boardTop <= closedBottom && closedBottom < rcTop)
  assert(headTop < parkedTop-couplingLength-maxD && wellRayReserve > 0 && hatchBodyReserve >= 25)
  assert(shoulderZ + arm < lowestMouth && bothAtEveryOrigin < boardTop)
  assert(closedBottom <= oneAtEveryOrigin && closedBottom <= bothAtBestOrigin)
  // Fernco marks the second end at half the supplied width. Equal engagement at
  // both ends here additionally assumes prepared, abutting pipes on the same axis.
  // Keep the two manufacturer width records distinct. No pipe end gap is credited.
  const cuffWidths = [70, 80]
  const clampComparator = {
    part: 'Fernco PC56', outsidePipeRange: [48, 56], bandTorqueNm: 6,
    materials: 'EPDM cuff and stainless clamp bands',
    sources: {
      datasheet: 'https://www.fernco.de/wp-content/uploads/2024/01/Fernco_DC-PC_Data-Sheet-1.pdf',
      table: 'https://www.fernco.de/en/product/drain-coupling',
      installation: 'https://www.fernco.de/wp-content/uploads/2023/05/Fernco_EN_Produktkatalog_2023_einseitig-min-1.pdf',
      application: 'https://www.fernco.co.uk/product/rubber-plumbing-couplings'
    },
    abuttingEndTrials: cuffWidths.map(width => {
      const mark = width/2
      const bottom = tip-mark
      return {width, secondEndMark:mark, closedBottomToTopAtD0:[bottom,tip+mark],
        maxDAtBoard:bottom-boardTop, maxDFor25BoardClearance:bottom-boardTop-25,
        strokeToPark:mark+parkGap, clearRunOnFixedPipe:width+parkGap,
        parkedBottomAtD0:tip-parkGap-width,
        parkedPenetrationBelowBoardTopAtD0:boardTop-(tip-parkGap-width)}
    }),
    limits: 'Verify the supplied cuff width, actual straight clamping lands, resistance of the nested outlet to band load, complete band and driver envelope, supports and allowable tension before use.'
  }
  return {
    sources: {pecolift:'project/ias/studies/pecolift-static-reference.py',
      pecoliftBlob:'d5d122dc8003a09787f37ec0f9402a84b7b16991',
      zarges:'project/ias/ias-03-renewal-proportionality-result.md#cold-lower-access-has-a-different-equipment-question',
      services:'project/mat/studies/whole-house-service-baseline.json#interfaces.rearShowerDrop',
      scope:'Static proposed stations only. No equipment ingress, load, grip, tool or human acceptance.'},
    clampComparator,
    closed: {part:'Geberit Silent-PP 390.217.14.1', datum:'Subtract d from fitting elevations.',
      rcUnderside, rcTop, boardTop, upperPlusLowerOverlap:overlapSum, upperGrossExtentOnly:landUpperBound,
      boardClearance:'upperOverlap - boardDebit - d', boardDebit,
      centredOverlapEach:centred, centredBottomToTopAtD0:[closedBottom,tip+centred],
      maxCentredDForZeroBoardGap:maxD, maxAnyDForZeroBoardGap:bestUpperOverlap-boardDebit,
      case25ClearToBoard:{clearance:25,maxCentredD:maxD-25,maxAnyD:bestUpperOverlap-boardDebit-25}},
    parking: {lowerEndGap:endGap, additionalParkClearance:parkGap,
      stroke:'upperOverlap + endGap + parkGap', centredStroke:centred+endGap+parkGap,
      requiredClearStraightBelowFixedCut:couplingLength+parkGap,
      parkedBottomToTopAtD0:[parkedTop-couplingLength,parkedTop]},
    exchange: {fixedPipeTopAtD0:fixedTop,
      sleeveJustOffFixedPipeBottomToTopAtD0:freeEndZ,
      liftFromParkToJustClearFixedEnd:freeEndZ[0]-(parkedTop-couplingLength),
      minimumCoaxialOpeningBeyondEndGap:couplingLength-endGap,
      freeSleeveTopAboveSlabAtMaxCentredD:freeEndZ[1]-maxD-rcTop,
      order:['Open lower closure with retained branch independently restrained.',
        'Park original sleeve down, lift bolted tray to supported rest.',
        'Slide spent sleeve up off open pipe. Introduce and park new sleeve before incoming tray.',
        'Seat incoming tray on its supports and counterhold against upward insertion force.',
        'Raise new sleeve to verified seal engagements, retain and test before restoring closures.']},
    reach: {well, hatch:service.clearHatch, hatchBodyReserve, lowerDatumRayToWellEdge:wellRayReserve,
      servicesReference:{shoulder:oldShoulder, headTop:service.maximumHeadTop,
        headRadius:service.headPlanRadius, highestAxisDatum:baselineReachZ},
      zarges40336:{deck:ladderDeck, deckPlan:[380,260], shoulderZ:ladderShoulderZ,
        headTop:ladderDeck+1750, headToConcrete:rcUnderside-ladderDeck-1750,
        inherited300SquareFootContactDepthDeficit:300-260,
        maxPlanDistanceFromEachShoulderToCentredMouthAtD0:shoulderPlanLimit(tip+centred),
        maxPlanDistanceFromEachShoulderToLowestMouth:shoulderPlanLimit(lowestMouth),
        scope:'Necessary plan distances at the trial 600 mm reach. Stance and platform origin are unknown.'},
      pecolift:{deck:1250, footX, footY, halfShoulders, shoulderZ, headTop, headRadius:150, arm,
        hardwareTop, additionalRiseToCeilingAtChargedTravel:spareHardwareRise,
        furtherRiseKeeping25CeilingReserve:spareHardwareRise-25,
        highestAxisAtLeastOneHandEveryOrigin:oneAtEveryOrigin,
        highestAxisBothHandsEveryOrigin:bothAtEveryOrigin, highestAxisBothHandsBestOrigin:bothAtBestOrigin,
        reachableAxialBandAboveClosedBottomOneHandAllOriginsAtD0:oneAtEveryOrigin-closedBottom,
        bestClosedBottomShortfallForBothHandsAcrossAllOrigins:boardTop-bothAtEveryOrigin,
        lowestClosedUpperMouth:lowestMouth, minimumMouthShortfallEvenStraightUp:lowestMouth-shoulderZ-arm,
        maxHeadCentreToDrainInPlan:maxHeadPlanDistance,
        conditionalStraight50PipeAtHeadLevelMinimumPlanOverlap:150 + 25 - maxHeadPlanDistance},
      limit:'Axis targets only. The upper mouth is beyond direct hand reach. Head overlap with pipe requires a straight leg at head height. Its lower route and gripping surfaces are unbound.'}
  }
}
