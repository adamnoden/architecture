"""Straight fall-line ventilation geometry on the two faces of a square roof ring."""
import math


def ring_routes(model, cap, cold):
    roof = model['roofDevelopment']
    shell = model['shell']
    cx, cy, cw, ch = model['court']
    ridge, overhang = roof['ridgeInset'], roof['overhang']
    assert cx == cy and cw == ch and 2*cx + cw == shell and 2*ridge == cx
    curb, board, drip = cap['ventCurbPanelEndAndDripFromRidge']
    loss, cap_net = cap['screenAllowanceAndNet']
    run_net, mesh, depth = cold['netEquivalent'], cold['meshOpenMinimum'], cold['sixChannelsDepth']
    slope = math.tan(math.radians(roof['pitch']))
    assert 0 < curb < board < drip < ridge and 0 < mesh <= 1 and loss >= 0
    assert math.isclose(run_net, cold['ventGrossThroat']*mesh)
    assert math.isclose(cap_net, (min(board-curb, drip-board)-loss)*mesh)
    assert math.isclose(depth, dict(roof['normalLayers'])['ventCounterrail'])

    # q increases from the north outer wall towards the court; p runs along that wall.
    # A square offset q has north-face interval [q, shell-q]. Its ends are diagonal mitres.
    def width(q):
        return shell-2*q

    def on_face(p, q):
        return q < p < shell-q

    outer_eave, inner_eave = -overhang, cx+overhang
    outer_cut, inner_cut = ridge-board, ridge+board
    outer_curb, inner_curb = ridge-curb, ridge+curb
    lost_outer = outer_cut-outer_eave
    low_deficit = inner_eave-inner_cut
    transition = board-curb
    assert math.isclose(lost_outer, low_deficit)
    assert width(outer_eave) == width(outer_curb)+2*(lost_outer+transition)
    assert width(inner_curb) == width(inner_eave)+2*(low_deficit+transition)

    # Classify finite witness strips independently of the width arithmetic, at both ends.
    for reflect in (lambda p:p, lambda p:shell-p):
        p = reflect((outer_eave+outer_cut)/2)
        assert on_face(p,outer_eave) and not on_face(p,outer_cut)
        p = reflect((outer_cut+outer_curb)/2)
        assert on_face(p,outer_cut) and not on_face(p,outer_curb)
        p = reflect((inner_cut+inner_eave)/2)
        assert on_face(p,inner_cut) and not on_face(p,inner_eave)
        p = reflect((inner_curb+inner_cut)/2)
        assert on_face(p,inner_curb) and not on_face(p,inner_cut)

    cases = []
    for end in (0,100):
        # Seal the full terminal turn for this length measured from each curb mitre.
        # A rail-bounded strip may not turn sideways to escape the seal.
        outer_limit, inner_limit = outer_curb+end, inner_curb+end
        assert inner_limit < inner_eave
        witness = outer_curb+50
        assert on_face(witness,outer_eave) and on_face(witness,outer_cut)
        cases.append({'sealedLengthEachCurbEndMm':end,
                      'outerOpenIntervalP':[outer_limit,shell-outer_limit],
                      'courtOpenIntervalP':[inner_limit,shell-inner_limit],
                      'outerEaveWidthReachingOpenCurbMm':width(outer_limit),
                      'courtEaveWidthReachingOpenCurbMm':width(max(inner_eave,inner_limit)),
                      'outerEaveWitnessP':witness, 'outerWitnessHasExit':on_face(witness,outer_limit)})

    # Each diagonal serves one corner on EACH of the two adjacent faces. The sloping
    # length includes two equal plan components but only one component of vertical rise.
    diagonal_factor = math.sqrt(2+slope*slope)
    diagonal_area = 2*lost_outer*run_net
    diagonal_length = lost_outer*diagonal_factor
    corner_duty = lost_outer*run_net
    return {
        'ringSides':4, 'pitchedFields':8,
        'levels':{'order':['physical eave','field board cutoff','curb'],
                  'outerQ':[outer_eave,outer_cut,outer_curb], 'courtQ':[inner_eave,inner_cut,inner_curb],
                  'outerFaceWidthsMm':list(map(width,(outer_eave,outer_cut,outer_curb))),
                  'courtFaceWidthsMm':list(map(width,(inner_eave,inner_cut,inner_curb)))},
        'outer':{'directEaveToFullCurbTurnMm':width(outer_curb),
                 'eaveWidthMeetingHipBeforeCutMm':2*lost_outer,
                 'certainNoRouteFractionOfEave':2*lost_outer/width(outer_eave),
                 'cutToCurbMitreTransitionEachEndMm':transition},
        'court':{'directEaveToFullCurbTurnMm':width(inner_eave),
                 'cutWidthTracingToValleyWithoutEaveMm':2*low_deficit,
                 'unfedFractionOfFieldCut':2*low_deficit/width(inner_cut),
                 'curbOutsideFieldCutEachEndMm':transition},
        'ridgeAxisAreaBookkeeping':{'sideLengthMm':width(ridge),'perimeterMm':4*width(ridge),
                                    'outerEquivalentMm':run_net*width(outer_eave)/width(ridge),
                                    'courtEquivalentMm':run_net*width(inner_eave)/width(ridge)},
        'diagonalComparisons':{'eaveToCutHorizontalAdvanceMm':lost_outer,'eaveToCutSlopingLengthMm':diagonal_length,
                               'areaAtOneOuterHipMm2':diagonal_area,'areaAtOneInnerValleyMm2':2*low_deficit*run_net,
                               'equivalentMmAlongEitherDiagonal':diagonal_area/diagonal_length},
        'endClosureCases':cases,
        'cornerHeaderTrial':{'clearWidthBorrowedFromCapHalfMm':curb,'clearDepthBorrowedFromFieldMm':depth,
                             'unmeshedGrossMm2':curb*depth,'oneOuterFaceCornerDemandMm2':corner_duty,
                             'minimumClearWidthAtFieldDepthMm':corner_duty/depth},
        'courtIntakeTrial':{'equalAreaForWholeFieldCutMm2':width(inner_cut)*run_net,
                            'grossSlotAtPhysicalEaveMm':width(inner_cut)*run_net/(width(inner_eave)*mesh)},
        'scope':'Projected routes on eight pitched fields around a four-sided square ring. The 40 mm corner transition requires a formed return. '
                'Nominal equivalent areas are sensitivities against the inherited eave comparison. The header assumes '
                'an unobstructed transverse section. The valley is an intake-area analogy only. Actual rails, screens, '
                'rain, fire, flow, local resistance, construction and removable terminations still govern.'}
