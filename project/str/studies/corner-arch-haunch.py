"""Reproduce a near-spring haunch comparison without changing selected house geometry."""
import json
import math
import runpy
import sys
from pathlib import Path
from xml.sax.saxutils import escape

HERE = Path(__file__).resolve().parent
STEM = 'corner-arch-haunch'
profile = runpy.run_path(str(HERE / f'{STEM}-profile.py'))


def figure(geom, rows):
    width, height = 1080, 600
    cx, cz = geom['centreXZ_mm']
    a, r, h = geom['halfAngle_rad'], geom['insideRadius_mm'], geom['existingDepth_mm']
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
           '<title>The haunch stiffens the spring while the four retained bars keep their old lever</title>',
           '<desc>Elevation showing the added radial sector and its overlap with the corner pier. '
           'A second panel compares bending and interaction for the same house load case.</desc>',
           '<rect width="100%" height="100%" fill="#faf9f4"/><g font-family="Arial, sans-serif" fill="#213a42">']
    def label(x, y, text, size=15, colour='#213a42', anchor='start'):
        svg.append(f'<text x="{x:g}" y="{y:g}" font-size="{size}" text-anchor="{anchor}" fill="{colour}">{escape(str(text))}</text>')

    def xy(x, z):
        return 42 + .48 * (x-990), 440 - .48 * (z-5940)

    def polar(st, offset):
        phi = -a + 2*a*st/(geom['stationCount']-1)
        return xy(cx + (r+offset)*math.sin(phi), cz + (r+offset)*math.cos(phi))

    def path(points, colour, fill='none', weight=1.5, close=False, dash=''):
        pts = ' '.join(('M' if i == 0 else 'L')+f'{x:.2f},{y:.2f}' for i,(x,y) in enumerate(points))
        extra = f' stroke-dasharray="{dash}"' if dash else ''
        svg.append(f'<path d="{pts}{" Z" if close else ""}" fill="{fill}" stroke="{colour}" stroke-width="{weight}"{extra}/>')

    label(34, 42, 'A 45 mm haunch at the corner-window spring', 27)
    label(34, 71, 'Near half of one inner arch. Opening, outer brick ring and wall-normal width are held fixed.', 16)
    label(34, 114, 'Elevation · millimetres', 20)
    stations = [i/20 for i in range(181)]
    rx = geom['nearPierRightX_mm']
    high = geom['upperPierBandZ_mm'][1]
    bottom = 5850
    narrow = geom['narrowPierRightX_mm']
    path([xy(1000,bottom),xy(rx,bottom),xy(rx,high),xy(narrow,high),xy(narrow,6475),xy(1000,6475)],
         '#adb5ad', '#e5e7df', 1, True)
    path([polar(s,0) for s in stations]+[polar(s,h) for s in reversed(stations)], '#516164', '#d4dbd5', 1.5, True)
    half = [s for s in stations if s <= 4]
    path([polar(s,h+profile['extra_depth'](s,geom['addition_mm'])) for s in half]+[polar(s,h) for s in reversed(half)], '#9f5739', '#cf916d', 1.5, True)
    # Near the spring the two original bars project onto these two paths in elevation.
    for depth in (49, h-49):
        path([polar(s,depth) for s in stations], '#2c686e', weight=2)
    for station in (0,1,4):
        x,y = polar(station,h+profile['extra_depth'](station,geom['addition_mm']))
        px,py = polar(station,0)
        path([(px,py),(x,y)], '#546464', weight=1, dash='4 4')
        label(x-3,y-10,f'{station}',13,anchor='middle')
    label(53,465,'Corner pier',14)
    label(304,345,'Window opening',16)
    path([(395,460),(443,460)], '#43585c', weight=2)
    label(419,482,'100 mm',12,anchor='middle')
    label(42,509,'Rust: local thickening   ·   Green: retained H16 paths',15)
    label(42,539,f'{100*geom["fractionWithinPier"]:.1f}% of the wedge volume overlaps the modeled pier.',15)
    label(552,114,'Same load case, four retained bars',20)
    label(552,158,'18 members · |M|',15)
    label(873,158,'Existing',15,anchor='end')
    label(1033,158,'Haunched',15,anchor='end')
    for y, name, key, fmt in [(205,'Strong-axis moment (kNm)','Ms','.2f'),
                               (250,'Weak-axis moment (kNm)','Mw','.2f'),
                               (295,'Bending interaction','ratio','.3f')]:
        label(552,y,name,16)
        for x,row in zip((873,1033),rows[:2]):
            label(x,y,format(row[key],fmt),19,anchor='end')
    label(552,355,'The model checks the spring after redistributing',16)
    label(552,381,'the actions through all eight inner arches.',16)
    label(552,433,f'36-member haunch comparison: {rows[2]["ratio"]:.3f}.',17)
    label(552,477,'The project interaction limit is 1.000.',16)
    label(34,578,'Local design comparison. Joint anchorage, placing, performance of a relocated cage and house selection remain open.',14)
    svg.append('</g></svg>')
    return '\n'.join(svg) + '\n'


if __name__ == '__main__':
    check = '--check' in sys.argv
    geometry = profile['detailing']()
    cards = runpy.run_path(str(HERE / 'arch-haunch-card.py'))['compare_cards'](profile['extra_depth'])
    result = {'geometry': geometry, 'loadComparison': cards, 'admitted': False}
    rows = [{'Ms':abs(c['signedEnd']['minusNormalKNm']), 'Mw':abs(c['signedEnd']['radialKNm']),
             'ratio':c['retained']['binnedInteraction']} for c in cards['cases']]
    outputs = {HERE / f'{STEM}.json': json.dumps(result, indent=2, ensure_ascii=False) + '\n',
               HERE / f'{STEM}.svg': figure(geometry, rows)}
    for output, content in outputs.items():
        if check:
            if output.read_text() != content:
                raise ValueError(f'Stale haunch study: {output.name}')
        else:
            output.write_text(content)
    print('Corner-arch haunch comparison reproduces.')
