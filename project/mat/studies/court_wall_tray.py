"""South court cavity drainage alongside the retained threshold."""
from html import escape


def compare_court_tray(control, sources):
    model = sources['HAD']['model']
    court_x, court_y, court_width, _ = model['court']
    threshold = model['southCourtThresholdReference']
    jamb = threshold['jambs']['cavityTray']
    apron_w, apron_e = jamb['leftApron'], jamb['rightApron']
    landing = model['sections']['waterLevels']['southLandingStart']
    loggia = sources['loggia']['cavityTray']
    brick, drain, glass = sources['ordinaryOuter']['occurrence']['ordinaryPerpendicularLayers_mm'][:3]
    assert brick[1] == 0 and brick[2] == drain[1] and drain[2] == glass[1]
    leaf_depth = brick[2]
    cavity_depth = glass[2] - leaf_depth
    local_pocket = sources['court']['wholePanLowerReveal']['owningSTRProposal']['lowerPocket']
    assert local_pocket['normalY'] == [court_y - leaf_depth, court_y]
    # STR locates the local base at 120. The second elevation is a comparison, not an adopted court course.
    band_base, band_top = loggia['outerDpc']
    assert band_base == local_pocket['z'][1] + local_pocket['distanceFromDPCAt120']
    face = control['outletInvertAtFace_mm']
    root = face + leaf_depth / control['spoutRunPerRise']
    tip = face - control['outwardProjection_mm'] / control['spoutRunPerRise']
    rear = root + cavity_depth / control['trayCrossfallRunPerRise']
    gauge = control['gauge_mm']
    tongue = control['jambTongue']
    grade_error = tongue['adverseEndLevelError_mm']
    wings = []
    for (lo, hi), apron in [((court_x, apron_w['x'][0]), apron_w),
                            ((apron_e['x'][1], court_x + court_width), apron_e)]:
        assert lo < hi and apron['y'][1] == court_y
        quarter = (hi - lo) / 4
        ridge = quarter / control['troughRunPerRise']
        end_rise = quarter / tongue['receivingEndRunPerRise']
        wings.append({'wingX_mm': [lo, hi], 'weepX_mm': [lo + quarter, hi - quarter],
                      'maxRunToWeep_mm': quarter, 'localSaddleRise_mm': ridge, 'jambEndRise_mm': end_rise,
                      'endDamTopAtTrough_mm': root + end_rise + control['endDamHeight_mm'],
                      'apronTopToTroughAtEnd_mm': root + end_rise - apron['z'][1]})
    bed = [court_y - glass[2], court_y - leaf_depth, court_y, court_y + control['outwardProjection_mm']]
    old = loggia['outerWeep']
    shoe = model['northProtectiveReturn']['sideShoes'][0]['weepBottom']
    # These are separate wet faces. Keep the low air-bridge discharge on its
    # existing apron; the high jamb flashing laps over the stopped wall tray.
    challenge = sources['court']['wholePanLowerReveal']['sharedAuthoredChallenge_mm']
    bridge = sources['court']['joinedCandidate']['upperBridge']
    bridge_x, bridge_y, bridge_z = bridge['roofDischargeXYZ_mm']
    front_edge = [point for point in bridge['roofXYZ_mm'] if point[1] == bridge_y]
    assert len(front_edge) == 2
    bridge_landing = min(bridge_x - apron_w['x'][0], apron_w['x'][1] - bridge_x,
                         bridge_y - apron_w['y'][0], apron_w['y'][1] - bridge_y) - challenge
    assert bridge_landing > 0
    clear_cavity = [court_y - drain[2], court_y - drain[1]]
    y0, y1 = tongue['outsideY_mm']
    rough = threshold['retained']['roughX']
    returns = []
    for wing, end, jamb_x, direction in [(wings[0], apron_w['x'][0], rough[0], 1),
                                         (wings[1], apron_e['x'][1], rough[1], -1)]:
        tip_x = end - direction * tongue['tipOverlap_mm']
        root_x = jamb_x - direction * tongue['setbackFromRoughJamb_mm']
        run = direction * (root_x - tip_x)
        rise = run / tongue['fallRunPerRise']
        receiving_weep = min(wing['weepX_mm'], key=lambda x: abs(x - tip_x))
        receiving_run = direction * (tip_x - receiving_weep)
        assert 0 < receiving_run <= wing['maxRunToWeep_mm']
        tip_z = tongue['tipFloorZ_mm']
        # Bound the full-width stop even at the high back edge of its sloping
        # bed. The +455 back turn stays on the inner side, outside the tongue.
        stop_ceiling = wing['endDamTopAtTrough_mm'] + rear - root
        returns.append({'rootX_mm': root_x, 'tipX_mm': tip_x, 'stopX_mm': end,
                        'rootFloorZ_mm': tip_z + rise, 'tipFloorZ_mm': tip_z,
                        'dripBottomZ_mm': tip_z - tongue['dripDownstand_mm'] - gauge,
                        'stopCrestUpperBoundZ_mm': stop_ceiling,
                        'dripClearOfStop_mm': tip_z - tongue['dripDownstand_mm'] - gauge - stop_ceiling - challenge,
                        'overlapAfterMovement_mm': tongue['tipOverlap_mm'] - challenge,
                        'roughOpeningGapAfterMovement_mm': tongue['setbackFromRoughJamb_mm'] - challenge,
                        'fallAfterAdverseEndLevelError_mm': rise - grade_error,
                        'receivingWeepX_mm': receiving_weep, 'dripToWeepRun_mm': receiving_run,
                        'receivingFallAfterAdverseEndLevelError_mm': receiving_run / tongue['receivingEndRunPerRise'] - grade_error})
    side_gaps = [y0 - clear_cavity[0] - challenge, clear_cavity[1] - y1 - challenge]
    assert y1 - y0 > 2 * gauge and min(side_gaps) > 0
    assert all(min(item[key] for key in ('dripClearOfStop_mm', 'overlapAfterMovement_mm',
                                         'roughOpeningGapAfterMovement_mm', 'fallAfterAdverseEndLevelError_mm',
                                         'receivingFallAfterAdverseEndLevelError_mm')) > 0 for item in returns)
    return {'trial': control, 'wingGeometry': wings, 'sectionY_mm': bed,
            'invertAtOutletStationZ_mm': [rear, root, face, tip],
            'backTurnTopZ_mm': control['backTurnTopZ_mm'],
            'backTurnToFaceInvert_mm': control['backTurnTopZ_mm'] - face,
            'landingZ_mm': landing, 'floorVoidBoundaryZ_mm': model['sections']['groundFloorRC']['top'],
            'outletAboveLanding_mm': face - landing,
            'metalUndersideAboveComparedBandAtFace_mm': face - gauge - band_top,
            'outerMineralBandComparedZ_mm': [band_base, band_top],
            'historicLoggiaOutletAboveLanding_mm': old - landing,
            'northProtectiveShoeMouthAboveLanding_mm': shoe - landing,
            'apronX_mm': [apron_w['x'], apron_e['x']],
            'primaryGrateX_mm': [threshold['primaryTray']['plan'][0],
                                 threshold['primaryTray']['plan'][0] + threshold['primaryTray']['plan'][2]],
            'jambReturn': {'westAndEast': returns, 'clearCavityY_mm': clear_cavity,
                           'sideGapsAfterMovement_mm': side_gaps, 'relativeChallenge_mm': challenge,
                           'lowBridgeDischargeWestXYZ_mm': [bridge_x, bridge_y, bridge_z],
                           'lowBridgeFrontEdgeWestXYZ_mm': front_edge,
                           'lowBridgeAboveApron_mm': bridge_z - apron_w['z'][1],
                           'minimumApronEdgeMarginAfterMovement_mm': bridge_landing,
                           'lowBridgeBelowHighTrough_mm': root + wings[0]['jambEndRise_mm'] - bridge_z},
            'quietStageZ_mm': model['firstWetReference']['permittedQuietStage'],
            'scope': 'Two straight wings and the two-level jamb handoff. Full jamb collection, corner ends, below-tray wetting, thermal bridging, supports, masonry set-out and installed performance remain open.'}


def tray_figure(result):
    """One developed elevation and one transverse cut at a spout."""
    w, e = result['wingGeometry']
    x0, x1 = w['wingX_mm'][0], e['wingX_mm'][1]
    ys, zs = result['sectionY_mm'], result['invertAtOutletStationZ_mm']
    band_lo, band_hi = result['outerMineralBandComparedZ_mm']
    top = result['backTurnTopZ_mm']
    ink, wet, sand = '#243b40', '#176d74', '#eee1ce'
    svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="1020" height="780" viewBox="0 0 1020 780">',
           '<title>South courtyard wall drainage beside the door</title>',
           f'<rect width="1020" height="780" fill="#faf9f5"/><g font-family="sans-serif" fill="{ink}">']
    def text(x, y, words, size=15):
        svg.append(f'<text x="{x:g}" y="{y:g}" font-size="{size}">{escape(words)}</text>')
    def box(x, y, width, height, colour):
        svg.append(f'<rect x="{x:g}" y="{y:g}" width="{width:g}" height="{height:g}" fill="{colour}"/>')
    def line(points, colour, stroke):
        coords = ' '.join(f'{x:g},{y:g}' for x, y in points)
        svg.append(f'<polyline points="{coords}" fill="none" stroke="{colour}" stroke-width="{stroke:g}"/>')
    text(32, 40, 'South courtyard wall drainage beside the door', 25)
    text(32, 68, 'Two straight tray wings. Elevations in millimetres relative to the ground floor.')
    text(32, 112, 'COURT FACE', 14)
    sx = (535 - 32) / (x1 - x0)
    xp = lambda x: 32 + (x-x0)*sx
    for wing in (w, e):
        lo, hi = wing['wingX_mm']
        box(xp(lo), 228-band_hi*sx, (hi-lo)*sx, (band_hi-band_lo)*sx, sand)
        y_weep = 228 - zs[2]*sx
        line([(xp(lo), y_weep), (xp(hi), y_weep)], wet, 2)
        for x in wing['weepX_mm']:
            box(xp(x)-2, y_weep-4, 4, 5, wet)
            text(xp(x)-14, y_weep-11, f'{x:g}', 12)
    a, b = result['primaryGrateX_mm']
    box(xp(a), 219, (b-a)*sx, 9, '#b0bdbe')
    line([(32, 228), (535, 228)], ink, 1)
    text(209, 190, 'Door and jamb aprons')
    text(178, 253, 'Separate threshold grate')
    text(32, 310, 'Four cleanable outlets discharge onto the landing.', 16)
    text(32, 340, 'Each wing has two low points and a closed end at each side.')
    text(32, 369, 'The door pan and its removable grates keep their own routes.')
    text(592, 112, 'SECTION AT ONE OUTLET', 14)
    yp = lambda y: 635 + (y-ys[0])*.62
    zp = lambda z: 400 - z*.55
    box(yp(ys[1]), zp(band_hi), (ys[2]-ys[1])*.62, (band_hi-band_lo)*.55, sand)
    line([(yp(ys[2]),zp(0)),(972,zp(0))], ink, 2)
    line([(yp(ys[0]),zp(top)), *[(yp(y),zp(z)) for y,z in zip(ys,zs)]],wet,3)
    text(yp(ys[0])+8, zp(top)+1, f'+{top:g} back turn')
    text(yp(ys[3])+10, zp(zs[2])+3, f'+{zs[2]:g} weep')
    text(yp(ys[3])+10, zp(band_hi)+31, f'+{band_lo:g} to +{band_hi:g}')
    text(yp(ys[3])+10, zp(band_hi)+51, 'compared DPC band')
    text(yp(ys[2])+15, zp(0)-10, 'Landing 0')
    line([(32, 425), (988, 425)], '#bcc6c0', 1)
    text(32, 462, 'WEST JAMB  /  DEVELOPED SECTION', 14)
    text(32, 489, 'The fixed high flashing drains left over the stop. The lower bridge drains onto its own apron.')
    detail = result['jambReturn']
    tongue = result['trial']['jambTongue']
    j = detail['westAndEast'][0]
    xx = lambda x: 65 + 2.05 * (x - (j['stopX_mm'] - 90))
    zz = lambda z: 715 - .76 * (z - 150)
    stop_x, tip_x, heel_x = map(xx, [j['stopX_mm'], j['tipX_mm'], j['rootX_mm']])
    floor_z = zs[1] + w['jambEndRise_mm']
    line([(xx(j['stopX_mm']-85), zz(zs[1])), (stop_x, zz(floor_z)),
          (stop_x, zz(j['stopCrestUpperBoundZ_mm']))], ink, 3)
    line([(heel_x, zz(j['rootFloorZ_mm']+tongue['sideUpstand_mm'])), (heel_x, zz(j['rootFloorZ_mm'])),
          (tip_x, zz(j['tipFloorZ_mm'])), (tip_x, zz(j['dripBottomZ_mm']))], wet, 4)
    bx, _, bz = detail['lowBridgeDischargeWestXYZ_mm']
    apron_z = bz - detail['lowBridgeAboveApron_mm']
    bridge_edge = detail['lowBridgeFrontEdgeWestXYZ_mm']
    line([(xx(x), zz(z)) for x, _, z in bridge_edge], wet, 3)
    bridge_label_x = max(xx(x) for x, _, _ in bridge_edge) + 10
    line([(xx(result['apronX_mm'][0][0]), zz(apron_z)),
          (xx(result['apronX_mm'][0][1]), zz(apron_z))], ink, 3)
    for x, za, zb in [(tip_x, j['dripBottomZ_mm'], floor_z), (xx(bx), bz, apron_z)]:
        svg.append(f'<path d="M{x:g} {zz(za)+3:g} V{zz(zb)-4:g}" stroke="{wet}" fill="none" stroke-dasharray="3 4"/>')
    text(75, 635, 'Wing to spouts', 13)
    text(heel_x+14, zz(j['rootFloorZ_mm'])+4, 'High return', 14)
    text(bridge_label_x, zz(bz)+5, f'Bridge +{bz:g}', 14)
    text(bridge_label_x, zz(apron_z)+5, f'Apron +{apron_z:g}', 14)
    text(577, 530, 'AT THE HIGH DRIP', 14)
    text(577, 563, f"1 in {tongue['fallRunPerRise']:g} fall, with a {tongue['dripDownstand_mm']:g} mm downturned nose")
    text(577, 595, f"{j['dripClearOfStop_mm']:g} mm clear above the bounded stop")
    text(577, 627, f"{j['overlapAfterMovement_mm']:g} mm remains inside the receiving wing")
    text(577, 659, f"{j['roughOpeningGapAfterMovement_mm']:g} mm remains outside the rough opening")
    text(577, 691, f"Clearances include one {detail['relativeChallenge_mm']:g} mm relative error.")
    text(32, 753, 'West end shown, east end mirrored. Concealed support, jamb collection, lower-wall wetting and installed drainage remain open.', 14)
    return '\n'.join([*svg, '</g></svg>', ''])
