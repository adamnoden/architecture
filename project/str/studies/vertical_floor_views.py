import html
import math


def draw_vertical_floor(result):
    cells=result['plate']['cellsXYMm'];points={tuple(row['xyMm']):row['displacementMmRad'][0] for row in result['plate']['physicalRecovery']['points']};bounds=[min(r[0] for r in cells),min(r[1] for r in cells),max(r[2] for r in cells),max(r[3] for r in cells)];width=max(bounds[2]-bounds[0],bounds[3]-bounds[1]);scale=780/width
    def px(x):return 60+(x-bounds[0])*scale
    def py(y):return 930-(y-bounds[1])*scale
    rows=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1080">','<rect width="1200" height="1080" fill="#faf8f2"/>',
        '<style>text{font:13px sans-serif;fill:#243339}.small{font-size:10px}.tiny{font-size:8px}.hold{fill:#a84f3e}</style>',
        '<text x="35" y="28">RC200 VERTICAL FLOOR / FINITE NORMAL RECEIVERS / ACTUAL 52 HEADS</text>',
        '<text x="35" y="52">'+html.escape(result['native']['caseId'])+' · sourceground0 control · no physical or complete-house acceptance</text>',
        f'<text x="35" y="76">Known-domain plate {result["mass"]["newPlateAreaM2"]:.6f}m² / selfG {result["mass"]["newPlatePhysicalSelfGKN"]:.3f}kN before explicit factor</text>',
        f'<text x="35" y="100">Plate |w|max {result["plate"]["physicalRecovery"]["maximumDeflectionMm"]:.4f}mm / field colour is computed vertical displacement</text>']
    limit=max(abs(v) for v in points.values()) or 1
    for x0,y0,x1,y1 in cells:
        value=sum(points[p] for p in ((x0,y0),(x1,y0),(x1,y1),(x0,y1)))/4/limit
        if value<=0:red,green,blue=(round(242+value*112),round(245+value*63),round(246+value*26))
        else:red,green,blue=(round(246-value*18),round(245-value*96),round(242-value*112))
        rows.append(f'<rect x="{px(x0):.3f}" y="{py(y1):.3f}" width="{(x1-x0)*scale:.3f}" height="{(y1-y0)*scale:.3f}" fill="rgb({red},{green},{blue})" stroke="#d7dddb" stroke-width=".15"/>')
    a,b,c,d=result['principalWetReservationXYMm'];rows.append(f'<rect x="{px(a):.3f}" y="{py(d):.3f}" width="{(c-a)*scale:.3f}" height="{(d-b)*scale:.3f}" fill="#e5d3b8" fill-opacity=".7" stroke="#aa7443" stroke-dasharray="4 3"/>')
    for core in result['normalCoreGeometry']:
        a,b,c,d=core['rectangleXYMm'];rows.append(f'<rect x="{px(a):.3f}" y="{py(d):.3f}" width="{(c-a)*scale:.3f}" height="{(d-b)*scale:.3f}" fill="none" stroke="#4a775d" stroke-width=".8"/>')
    for strip in result['northUpstandStrips']:
        a,b,c,d=strip['rectangleXYMm'];rows.append(f'<rect x="{px(a):.3f}" y="{py(d):.3f}" width="{(c-a)*scale:.3f}" height="{(d-b)*scale:.3f}" fill="#877d9e" stroke="#4b425d" stroke-width="1"/>')
    for strip in result.get('additionalBeamReceivers',[]):
        a,b,c,d=strip['rectangleXYMm'];rows.append(f'<rect x="{px(a):.3f}" y="{py(d):.3f}" width="{(c-a)*scale:.3f}" height="{(d-b)*scale:.3f}" fill="#4e9997" stroke="#175552" stroke-width="1"/>')
    wet=result.get('seatedWetSupportGeometry')
    if wet is not None:
        for post in wet['posts']:
            a,b,c,d=post['rectangleXYMm'];rows.append(f'<rect x="{px(a):.3f}" y="{py(d):.3f}" width="{(c-a)*scale:.3f}" height="{(d-b)*scale:.3f}" fill="none" stroke="#243339" stroke-width="1"/>')
            a,b,c,d=post['padFit']['nominalRectangleXYMm'];rows.append(f'<rect x="{px(a):.3f}" y="{py(d):.3f}" width="{(c-a)*scale:.3f}" height="{(d-b)*scale:.3f}" fill="#eac159" stroke="#845a14" stroke-width=".6"/>')
        rows.append('<text x="35" y="1057">Teal: actual seated wet beam; outlined260x450 posts / yellow pads. No cage, pad or closure acceptance.</text>')
    native={row['id']:row['reactionKN_KNm'] for row in result['native']['heads']};largest=max(abs(v[2]) for v in native.values()) or 1
    for head in result['headPositions']:
        x,y=head['xyMm'];value=native[head['id']][2];radius=2.5+4*math.sqrt(abs(value)/largest);color='#354b72' if value>=0 else '#b54f35'
        rows.append(f'<circle cx="{px(x):.3f}" cy="{py(y):.3f}" r="{radius:.2f}" fill="{color}" stroke="white" stroke-width=".6"/>')
        rows.append(f'<text class="tiny" x="{px(x)+7:.3f}" y="{py(y)+3:.3f}">{html.escape(head["id"])}</text>')
    missing={tuple(row['contactSubrectangleXYMm']) for row in result['missingGroundContactFibres']}
    for a,b,c,d in missing:rows.append(f'<rect x="{px(a):.3f}" y="{py(d):.3f}" width="{(c-a)*scale:.3f}" height="{(d-b)*scale:.3f}" fill="#c34831" stroke="#8c2e22" stroke-width="1"/>')
    pressures=[row['normalPressureMPa'] for row in result['bearings']];active=sum(row['active'] for row in result['bearings']);line=160
    notes=[('NORMAL RECEIVING COMPARISON',False),(f'{len(result["bearings"])} evaluated normal fibres',False),(f'{active} active / {len(result["bearings"])-active} open',False),
        (f'Max pressure {max(pressures):.4f}MPa',False),('Masonry/joint properties authored;',True),('no source material acceptance.',True),('',False),
        ('SIGNED VERTICAL HEAD REACTIONS',False),('Blue: upward / orange: downward',False),(f'Min {min(v[2] for v in native.values()):.3f}kN',False),(f'Max {max(v[2] for v in native.values()):.3f}kN',False),('No soil or full permanent-load proof.',True),('',False),
        ('MATERIAL OWNERSHIP',False),('Plate owns net200mm material.',False),('Purple: full northupstands own',False),('their entire removed strips once.',False),('Old floorG/Q cards removed;',False),('no old fixed-base increments.',False),('',False),
        ('OPEN ENGINEERING',True),(f'Ground contact gap {result["missingGroundContactAreaMm2"]/1e6:.8f}m²',True),('Red: no invented ground receiver.',True),('Principal wet territory withheld;',True),('its complete openings are unknown.',True),('Round services use explicit square',False),('structural opening comparisons.',False),('Current north cage / cap-grid / Lties,',True),('thermal, waterstop and roof open.',True)]
    for text,hold in notes:
        rows.append(f'<text x="865" y="{line}" class="{"small hold" if hold else "small"}">{html.escape(text)}</text>');line+=22
    rows.extend(['<text x="35" y="980">Green: actual clear-core candidate footprints; plate rotations are free outside bound RC sections.</text>',
        '<text x="35" y="1004">All geometry, deflections, active fibres and signed head reactions come from the same current result.</text>',
        '<text class="hold" x="35" y="1032">Conditional mechanics only: source0 case cannot be silently moved to a raised occupied floor.</text>','</svg>'])
    return '\n'.join(rows)+'\n'
