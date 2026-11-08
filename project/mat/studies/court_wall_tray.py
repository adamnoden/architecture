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
    wings = []
    for (lo, hi), apron in [((court_x, apron_w['x'][0]), apron_w),
                            ((apron_e['x'][1], court_x + court_width), apron_e)]:
        assert lo < hi and apron['y'][1] == court_y
        quarter = (hi - lo) / 4
        ridge = quarter / control['troughRunPerRise']
        wings.append({'wingX_mm': [lo, hi], 'weepX_mm': [lo + quarter, hi - quarter],
                      'maxRunToWeep_mm': quarter, 'localSaddleRise_mm': ridge,
                      'endDamTopAtTrough_mm': root + ridge + control['endDamHeight_mm'],
                      'apronTopToTroughAtEnd_mm': root + ridge - apron['z'][1]})
    bed = [court_y - glass[2], court_y - leaf_depth, court_y, court_y + control['outwardProjection_mm']]
    old = loggia['outerWeep']
    shoe = model['northProtectiveReturn']['sideShoes'][0]['weepBottom']
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
            'quietStageZ_mm': model['firstWetReference']['permittedQuietStage'],
            'scope': 'Trial geometry for two straight wings only. Below-tray rain and capillary bypass, both corner and apron ends, thermal bridging, support, actual joint set-out, surface runoff and first harm remain unqualified.'}


def tray_figure(result):
    """One developed elevation and one transverse cut at a spout."""
    w, e = result['wingGeometry']
    x0, x1 = w['wingX_mm'][0], e['wingX_mm'][1]
    ys, zs = result['sectionY_mm'], result['invertAtOutletStationZ_mm']
    band_lo, band_hi = result['outerMineralBandComparedZ_mm']
    top = result['backTurnTopZ_mm']
    ink, wet, sand = '#243b40', '#176d74', '#eee1ce'
    svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="1020" height="490" viewBox="0 0 1020 490">',
           '<title>South courtyard wall drainage beside the door</title>',
           f'<rect width="1020" height="490" fill="#faf9f5"/><g font-family="sans-serif" fill="{ink}">']
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
    text(32, 459, 'Straight-run comparison. End flashings, lower-wall wetting, masonry seating and installed drainage remain unresolved.', 14)
    return '\n'.join([*svg, '</g></svg>', ''])
