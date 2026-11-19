"""Plan of the raised ridge and three north-side channel centre-lines (mm)."""
from html import escape


def ring_plan(model, cap):
    roof = model['roofDevelopment']
    side = model['shell']
    cx, cy, cw, ch = model['court']
    eave = -roof['overhang']
    court = side - (cy + ch) + roof['overhang']
    assert cx + roof['overhang'] == court and cw == ch and cx * 2 + cw == side
    ridge = roof['ridgeInset']
    curb, board, _ = cap['ventCurbPanelEndAndDripFromRidge']
    direct, hip, valley = cap['fieldVentRoutes']['ordinaryClearBayStationMm'], 1000, 3400
    assert eave < hip < ridge - board and ridge + board < valley < court < direct
    half = side / 2
    paper = '#fcfbf7'
    ink = '#202e35'
    note = '#425765'
    outer = '#e7f0ee'
    inner = '#ebedf4'
    zinc = '#aac0ad'
    green, orange, purple = '#116859', '#a24812', '#6a4e9a'
    out = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="1250" height="640" '
        'viewBox="0 0 1250 640" role="img" aria-labelledby="title desc">',
        '<title id="title">Cold roof channels at the raised ridge</title>',
        '<desc id="desc">A square roof and an enlarged north-side plan compare a direct '
        'eave-to-ridge route, an outer route ending at a hip, and an inner route '
        'starting at a valley. Valley and hip openings are unproven.</desc>',
        f'<rect width="1250" height="640" fill="{paper}"/>',
        '<g font-family="DejaVu Sans, Arial, sans-serif" fill="#202e35">',
    ]

    def label(x, y, value, size=14, color=ink, weight=400, anchor='start'):
        out.append(f'<text x="{x:.2f}" y="{y:.2f}" fill="{color}" font-size="{size}" '
                   f'font-weight="{weight}" text-anchor="{anchor}">{escape(str(value))}</text>')

    def stroke(points, color, width=1, dash=''):
        coords = ' '.join(f'{x:.2f},{y:.2f}' for x, y in points)
        pattern = f' stroke-dasharray="{dash}"' if dash else ''
        out.append(f'<polyline points="{coords}" fill="none" stroke="{color}" '
                   f'stroke-width="{width}" stroke-linejoin="round"{pattern}/>')

    def fill(points, color):
        coords = ' '.join(f'{x:.2f},{y:.2f}' for x, y in points)
        out.append(f'<polygon points="{coords}" fill="{color}"/>')

    def at(origin_x, origin_y, width):
        scale = width / (side - 2 * eave)
        return lambda x, q: (origin_x + (x - eave) * scale, origin_y + (q - eave) * scale)

    def square(map_point, inset):
        near, far = inset, side - inset
        return [map_point(x, q) for x, q in (
            (near, near), (far, near), (far, far), (near, far), (near, near))]

    def north_face(map_point, a, b):
        return [map_point(x, q) for x, q in (
            (a, a), (side - a, a), (side - b, b), (b, b))]

    label(30, 42, 'Which roof channels reach the raised ridge?', 28, weight=700)
    label(31, 69, 'Straight north-side section projected on the full square ring. Distances are in millimetres.', 15, note)
    stroke([(30, 88), (1220, 88)], '#b9c4c4')
    label(30, 120, '01   Whole roof', 19, weight=700)
    label(475, 120, '02   North face, enlarged', 19, weight=700)

    small = at(42, 158, 368)
    for inset, color in ((eave, outer), (ridge, inner), (court, paper)):
        fill(square(small, inset), color)
    # Draw the mitres as nested squares. The change from outer hip to inner
    # valley occurs at the four centre-line corners, not the curb corners.
    fill(square(small, ridge - curb), zinc)
    fill(square(small, ridge + curb), inner)
    fill(square(small, court), paper)
    for x_sign, q_sign in ((1, 1), (-1, 1), (1, -1), (-1, -1)):
        def corner(v):
            return small(half + x_sign * (v - half), half + q_sign * (v - half))
        stroke([corner(eave), corner(ridge)], '#62766e', 1.2)
        stroke([corner(ridge), corner(court)], '#747993', 1.2)
    for inset, color, dashes in ((eave, ink, ''), (court, ink, ''),
                                  (ridge - board, note, '2 2'), (ridge + board, note, '2 2'),
                                  (ridge, ink, '5 3')):
        stroke(square(small, inset), color, 1.1, dashes)
    label(226, 148, f'{side - 2 * eave:g} outer eave · north', 14, weight=700, anchor='middle')
    label(226, 341, 'Court eave', 13, weight=700, anchor='middle')
    label(226, 359, f'{side - 2 * court:g}', 14, anchor='middle')
    label(42, 559, 'Grey diagonals meet at the ridge corners.', 14, note)
    label(42, 582, 'The enlarged plan shows the north face only.', 14, note)

    large = at(475, 161, 743)
    for a, b, color in ((eave, ridge - curb, outer), (ridge - curb, ridge + curb, zinc),
                        (ridge + curb, court, inner)):
        fill(north_face(large, a, b), color)
    for i in (eave, court):
        stroke([large(i, i), large(side - i, i)], ink, 1.7)
    for reflected in (False, True):
        def end(i):
            return large(side - i if reflected else i, i)
        stroke([end(eave), end(ridge)], '#62766e', 1.5)
        stroke([end(ridge), end(court)], '#747993', 1.5)
    for i, dash, color in ((ridge - board, '3 3', note), (ridge + board, '3 3', note),
                           (ridge, '6 4', ink)):
        stroke([large(i, i), large(side - i, i)], color, 1.2, dash)

    def arrow(x, start, end, color, name, hollow=False):
        p, tip = large(x, start), large(x, end)
        direction = 1 if tip[1] > p[1] else -1
        stroke([p, tip], color, 3.3)
        fill([tip, (tip[0] - 5, tip[1] - direction * 9),
              (tip[0] + 5, tip[1] - direction * 9)], color)
        out.append(f'<circle cx="{p[0]:.2f}" cy="{p[1]:.2f}" r="3.8" '
                   f'fill="{paper if hollow else color}" stroke="{color}" stroke-width="2"/>')
        label(p[0] + 9, (p[1] + tip[1]) / 2 + 4, name, 15, color, 700)

    arrow(hip, eave, hip, orange, 'B')
    arrow(direct, eave, ridge - board, green, 'A')
    arrow(valley, valley, ridge + board, purple, 'C', hollow=True)
    label(large(side * .75, eave)[0], 149, f'Outer eave  q = {eave:g}', 13, note, anchor='middle')
    label(large(half, court)[0], large(half, court)[1] + 22, f'Court eave  q = {court:g}', 13, note, anchor='middle')
    # A compact key keeps labels clear of all three physical traces.
    y = 489
    stroke([(478, y), (507, y)], ink, 1.5, '6 4')
    label(515, y + 4, f'Ridge axis q = {ridge:g}', 13)
    fill([(685, y - 5), (711, y - 5), (711, y + 5), (685, y + 5)], zinc)
    label(719, y + 4, f'Mitred curb ±{curb:g}', 13)
    stroke([(885, y), (914, y)], note, 1.5, '3 3')
    label(923, y + 4, f'Upper-board cutoff ±{board:g}', 13)
    for yy, key, x, color, title in (
        (524, 'A', direct, green, 'Exterior eave to field-board end.'),
        (552, 'B', hip, orange, 'Exterior eave to hip. The straight ridge misses this channel.'),
        (580, 'C', valley, purple, 'Valley to field-board end. No valley inlet is established.'),
    ):
        label(475, yy, f'{key}   X{x:g}', 14, color, 700)
        label(573, yy, title, 14, ink)
    stroke([(30, 601), (1220, 601)], '#b9c4c4')
    label(31, 626, 'Arrows trace potential uphill air paths. Water falls from the ridge towards the eaves. A hip outlet or valley inlet needs its own exterior detail.', 14, note)
    return '\n'.join(out + ['</g>', '</svg>']) + '\n'
