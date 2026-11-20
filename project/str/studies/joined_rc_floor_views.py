from html import escape


def draw_joined_rc_floor(model,result):
    joined=model['joinedFloor'];floor=joined['floor'];scale=.057
    def x(value):return 65+value*scale
    def y(value):return 810-value*scale
    svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 1160">','<rect width="920" height="1160" fill="#faf8f2"/>',
        '<style>text{font:12px sans-serif;fill:#243339}.small{font-size:10px}.tiny{font-size:7px}</style>',
        '<text x="35" y="25">JOINED PERFORATED FLOOR / CONTINUOUS RC PORTALS / ACTUAL52HEADS</text>',
        '<text x="35" y="46">'+escape(result['name'])+' — conditional numerical comparison, no house adoption</text>']
    for triangle in floor['meshTrianglesXYMm']:
        svg.append('<polygon points="'+' '.join(f'{x(a)},{y(b)}' for a,b in triangle)+'" fill="#edf1df" stroke="#cad1be" stroke-width=".25"/>')
    for row in joined['physicalHoles']:
        a,b,c,d=row['bounds'];svg.append(f'<rect x="{x(a)}" y="{y(d)}" width="{(c-a)*scale}" height="{(d-b)*scale}" fill="#d8b9ac" stroke="#9a6f5f" stroke-width=".5"/>')
    for loop in floor['bands']:
        axis,datum,lo,hi,width=[loop[key] for key in ('axis','datum','lo','hi','width')]
        a,b,c,d=[lo,datum-width/2,hi,datum+width/2] if axis==0 else [datum-width/2,lo,datum+width/2,hi]
        svg.append(f'<rect x="{x(a)}" y="{y(d)}" width="{(c-a)*scale}" height="{(d-b)*scale}" fill="#95b6c4"/>')
    for receiver in floor['finiteBeamBoundaryReceivers']:
        a,b,c,d=receiver['lo'],receiver['datum']-receiver['width']/2,receiver['hi'],receiver['datum']+receiver['width']/2
        svg.append(f'<rect x="{x(a)}" y="{y(d)}" width="{(c-a)*scale}" height="{(d-b)*scale}" fill="#3e7569"/>')
        for station in receiver['stations']:svg.append(f'<circle cx="{x(station["x"])}" cy="{y(receiver["datum"])}" r="2" fill="#d29d31"/>')
    for corner in joined['corners']:
        for a,b,c,d in corner['rectangles']:
            svg.append(f'<rect x="{x(a)}" y="{y(d)}" width="{(c-a)*scale}" height="{(d-b)*scale}" fill="#7b9a91" stroke="#344d54"/>')
    heads={row['id']:row for row in result['heads']}
    for row in model['grid']['heads']:
        rx,ry=row['xy'];fz=heads[row['id']]['reactionKN_KNm'][2];color='#a94e3d' if fz<0 else '#345b8c'
        svg.append(f'<circle cx="{x(rx)}" cy="{y(ry)}" r="3.5" fill="{color}"/>')
        svg.append(f'<text class="tiny" x="{x(rx)+5}" y="{y(ry)-4}">{row["id"]} {fz:+.2f}</text>')
    svg.extend(['<text x="35" y="849">Green centralnorth strips: full3Dupstand owns material; no duplicate slab band/chord.</text>',
        '<text x="35" y="870">Gold dots: internal beam work stations. Blue/red head labels: signedFz kN, not soil capacity.</text>'])
    for index,row in enumerate(result['portalNormalContactResults']):
        x0,y0,x1,y1=row['effectiveContactFootprintXYMm'];origin_x=45+index*215;origin_y=925;s=.6
        svg.append(f'<rect x="{origin_x}" y="{origin_y}" width="{(x1-x0)*s}" height="{(y1-y0)*s}" fill="#eee9dc" stroke="#344d54"/>')
        inspection=row['continuousPlaneContactInspection'];polygon=inspection['physicalCompressedPolygonXYMm']
        if polygon:svg.append('<polygon points="'+' '.join(f'{origin_x+(a-x0)*s},{origin_y+(y1-b)*s}' for a,b in polygon)+'" fill="#ad5942"/>')
        label=row['pierId'].replace('NORTH/LOWER-RC/','')
        svg.append(f'<text class="small" x="{origin_x}" y="{origin_y-12}">{escape(label)}</text>')
        svg.append(f'<text class="small" x="{origin_x}" y="{origin_y+145}">A {inspection["contactAreaFraction"]*100:.2f}% / p {inspection["maximumNormalCompressionMPa"]:.2f}MPa</text>')
        svg.append(f'<text class="small" x="{origin_x}" y="{origin_y+162}">gap {inspection["maximumOpeningGapMm"]:.4f}mm</text>')
    svg.extend(['<text x="35" y="1125">Contact polygons inspect the solved plane; bedding/key strengths and actual minimumG are unqualified.</text>',
        '<text x="35" y="1147">All28 complete receiving duties remain open. No roof, installed or owner appearance acceptance.</text>','</svg>'])
    return '\n'.join(svg)+'\n'
