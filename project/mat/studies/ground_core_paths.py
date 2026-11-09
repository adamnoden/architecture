"""Finite direct material paths from the proposed pile heads into the occupied floor."""
from html import escape


def shaft_core_paths(heads, cores, slab, ordinary_dpc, stair_soffit):
    """Keep only positive-area columns centred on a real shaft axis within both bodies."""
    paths = []
    for core in cores:
        x, y, width, length = core['core']
        core_top = stair_soffit if core['id'] == 'stair-midlanding-post' else core['topZ']
        if not core['baseZ'] == ordinary_dpc[0] < ordinary_dpc[1] < core_top:
            continue
        for head in heads:
            cx, cy = head['xy']
            cap_bottom, cap_top = head['capZ']
            if not cap_bottom < slab['bottom'] < cap_top == slab['top'] == core['baseZ']:
                continue
            radius = min(head['shaftDiameter'] / 2, *(size / 2 for size in head['capXY']),
                         cx - x, x + width - cx, cy - y, y + length - cy)
            if radius <= 0:
                continue
            paths.append({'shaft': head['id'], 'core': core['id'], 'axisXY_mm': [cx, cy],
                          'shaftDiameter_mm': head['shaftDiameter'], 'capXY_mm': head['capXY'],
                          'coreXYWH_mm': core['core'], 'inscribedRadius_mm': radius,
                          'shaftCapZ_mm': cap_bottom, 'lowerUpperPourZ_mm': slab['bottom'],
                          'coreBaseZ_mm': core['baseZ'], 'coreTopZ_mm': core_top,
                          'ordinaryDpcTopZ_mm': ordinary_dpc[1]})
    return paths


def paths_figure(paths):
    """Show each head in plan and the actual north wet-wall receiver in a local vertical cut."""
    ink, green, red, bg = '#23383d', '#537e78', '#b2583a', '#faf9f5'
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="1060" height="610" viewBox="0 0 1060 610"><title>Three direct concrete paths through the floor</title>',
           f'<rect width="1060" height="610" fill="{bg}"/><g font-family="sans-serif" fill="{ink}">']
    def label(x, y, words, size=15):
        svg.append(f'<text x="{x:g}" y="{y:g}" font-size="{size}">{escape(words)}</text>')
    def box(x, y, w, h, colour):
        svg.append(f'<rect x="{x:g}" y="{y:g}" width="{w:g}" height="{h:g}" fill="{colour}"/>')
    def circle(x, y, radius, fill, stroke):
        svg.append(f'<circle cx="{x:g}" cy="{y:g}" r="{radius:g}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>')
    label(32, 39, 'Three ground supports carry concrete through the ordinary damp-course level', 24)
    label(32, 69, 'Heads in plan at left. The north wet-wall receiver is cut north–south at the actual shaft axis.')
    label(32, 114, 'OVERLAP IN PLAN', 14)
    by_id = {row['core']: row for row in paths}
    titles = [('stair-midlanding-post', 'Stair post'), ('wet-wall-south-receiver', 'South receiver'),
              ('wet-wall-north-receiver', 'North receiver')]
    for i, (key, title) in enumerate(titles):
        p = by_id[key]
        cx, cy = 107 + i * 182, 229
        scale = .232
        cap_w, cap_h = p['capXY_mm']
        ax, ay = p['axisXY_mm']
        x, y, w, h = p['coreXYWH_mm']
        box(cx - cap_w*scale/2, cy - cap_h*scale/2, cap_w*scale, cap_h*scale, '#e8e4d8')
        box(cx+(x-ax)*scale, cy-(y+h-ay)*scale, w*scale, h*scale, '#a8c2ba')
        circle(cx, cy, p['shaftDiameter_mm']*scale/2, 'none', ink)
        circle(cx, cy, p['inscribedRadius_mm']*scale, '#dc9479', red)
        label(cx-66, 343, p['shaft']+' · '+title)
        label(cx-66, 366, f"Radius {p['inscribedRadius_mm']:g} mm")
    for y, shade, txt in [(410, '#e8e4d8', 'Pile cap'), (441, '#a8c2ba', 'Upper RC footprint'),
                          (472, '#dc9479', 'Continuous projected core')]:
        box(35, y-12, 16, 14, shade)
        label(65, y, txt)
    label(32, 525, 'Black circles show the shafts. The section shows the cap width only.')
    p = by_id['wet-wall-north-receiver']
    _, ay = p['axisXY_mm']
    _, y, _, length = p['coreXYWH_mm']
    cy, scale = 873, .38
    to_y = lambda yy: cy + (yy-ay)*scale
    to_z = lambda z: 230-z*scale
    cap_bot, joint, top = p['shaftCapZ_mm'], p['lowerUpperPourZ_mm'], p['coreBaseZ_mm']
    cap_h = p['capXY_mm'][1]
    radius = p['shaftDiameter_mm']/2
    label(622, 115, 'NORTH RECEIVER · P24', 14)
    box(to_y(ay-radius), to_z(cap_bot), 2*radius*scale, 28, '#d1cec4')
    box(to_y(ay-cap_h/2), to_z(joint), cap_h*scale, (joint-cap_bot)*scale, '#ddd9cd')
    box(to_y(ay-cap_h/2), to_z(top), cap_h*scale, (top-joint)*scale, '#d2cdbc')
    box(to_y(y), 150, length*scale, to_z(top)-150, '#a8c2ba')
    r = p['inscribedRadius_mm']
    box(to_y(ay-r), 150, 2*r*scale, to_z(cap_bot)+28-150, '#dc9479')
    for z, description in [(p['ordinaryDpcTopZ_mm'], 'DPC top'), (top, 'Core base'), (joint, 'Pour joint'), (cap_bot, 'Shaft head')]:
        pos = to_z(z)
        label(623, pos+4, f'{description} {z:g}', 14)
        svg.append(f'<path d="M 747 {pos:g} H 854" fill="none" stroke="{ink}" stroke-dasharray="3 3"/>')
    label(32, 580, 'Geometry identifies potential transfer. Water availability, permeability, cracks, joint openings and actual wetting require evidence.', 14)
    return '\n'.join([*svg, '</g></svg>', ''])
