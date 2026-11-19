"""Source-bound shared-bearing comparison, not a supplier or structural design.

Uses the joined, unadopted B plan. It changes no existing model or diagnostic.
Run with --check to verify the retained JSON and dimensioned A3 SVG.
"""
from pathlib import Path
from hashlib import sha256
from html import escape
import json
import sys

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[2]
plan = json.loads((OUT / 'house-plan.json').read_text())
support = json.loads((OUT / 'house-supports.json').read_text())

# Do not attach a new result to stale predecessor inputs.
for record in support['sources'].values():
    actual = sha256((ROOT / record['path']).read_bytes()).hexdigest()
    if actual != record['sha256']:
        raise SystemExit('Reappraise changed predecessor source: ' + record['path'])

spine = next(w for w in plan['first_walls'] if w['id'] == 'wet-spine')
lower = next(w for w in plan['ground_walls'] if w['id'] == 'service-spine')
assert spine['a'][0] == spine['b'][0] == lower['a'][0] == lower['b'][0]
assert spine['t'] == lower['t'] == 170
centre = spine['a'][0]
finish = 15  # Paired B plan: 140 core + two 15 finishes, not selected products.
original_core = spine['t'] - 2 * finish
shell = 12000
span = support['accepted_span_geometry']
court_core = [shell - n for n in reversed(span['courtLeafIntervalMm'])]
outer_core = [shell - n for n in reversed(span['outerLeafIntervalMm'])]
court_finish = court_core[1] + finish
outer_finish = outer_core[0] - finish
bed = plan['first_objects']['bed3']
riser = plan['service_disposition']['new_stacked_gross_riser']
rear = next(w for w in plan['first_walls'] if w['id'] == 'rear-east')
rear_door_end = rear['holes'][0][1]
assert rear_door_end == 9150

def scenario(name, core, axis):
    structural = [axis - core / 2, axis + core / 2]
    finished = [structural[0] - finish, structural[1] + finish]
    return {
        'id': name, 'core': core, 'axis': axis,
        'structural_faces': structural, 'finished_faces': finished,
        'gallery_clear': finished[0] - court_finish,
        'gallery_structural_face_gap': structural[0] - court_core[1],
        'wet_strip_structural_face_gap': outer_core[0] - structural[1],
        'bed3_west_head_gap': bed[0] - finished[1],
        'bed3_east_side_gap': outer_finish - bed[0] - bed[2],
        'riser_west_edge_to_core': riser[0] - structural[1],
        'rear_door_to_spine_finished_face': finished[0] - rear_door_end,
        'flush_object_intrusion': max(0, finished[1] - (centre + spine['t'] / 2)),
        'meaning': 'Other walls, apertures, fixtures and furniture held. A negative gap is overlap; no complete replan or route pass is inferred.'
    }

rows = [
    scenario('retained140', 140, centre),
    scenario('centred215', 215, centre),
    scenario('215_grows_east', 215, centre + (215 - 140) / 2),
    scenario('215_grows_west', 215, centre - (215 - 140) / 2),
]

# Reversible geometric comparisons use actual held object coordinates.
flush_objects = {
    name: {'box': box, 'west_face': box[0]}
    for name, box in {
        'family-service-cabinet': plan['first_objects']['family-service-cabinet'],
        'principal-shower900': plan['first_objects']['principal-shower900'],
        'principal-basin': plan['first_objects']['principal-basin'],
        'pantry-shelf-comparison': plan['ground_objects']['pantry-shelf-comparison'],
    }.items()
}
assert all(v['west_face'] == rows[0]['finished_faces'][1] for v in flush_objects.values())

shift = rows[1]['finished_faces'][1] - rows[0]['finished_faces'][1]
bed_compensation = {
    'east_translation_to_retain_existing_west_gap': shift,
    'existing_east_side_gap': rows[0]['bed3_east_side_gap'],
    'new_east_side_gap': rows[0]['bed3_east_side_gap'] - shift,
    'comparison_body_diameter': 600,
    'retains600_geometric_strip': rows[0]['bed3_east_side_gap'] - shift >= 600,
    'limit': '600 is the predecessor geometric diagnostic, not a universal human/accessibility rule. Retaining the old 65 west gap does not make bilateral bed access satisfactory.'
}

bath_wall = next(w for w in plan['first_walls'] if w['id'] == 'bath-north')
bay_y = bath_wall['a'][1] + (bath_wall['t'] - 2 * finish) / 2
bay = {
    'status': 'Authored investigation bay; panel/core/tie phase and end tolerances unselected',
    'y_interval': [bay_y, bay_y + 1200],
    'section_y': 7000,
    'court_remote_core': court_core,
    'external_remote_core': outer_core,
    'shared_core': rows[0]['structural_faces'],
    'gallery_clear_structural_field': rows[0]['gallery_structural_face_gap'],
    'wet_strip_clear_structural_field': rows[0]['wet_strip_structural_face_gap'],
    'riser_y_interval': [riser[1], riser[1] + riser[3]],
    'family_door_y_interval': spine['holes'][0],
    'remote_duties': 'Each remote end is a separate one-sided bearing enquiry; the 140 leaf width is not itself the prohibited two-sided narrow shared detail. Actual bearing and underlying court/external arch-spandrel capacity remain unproved.'
}
assert bay['y_interval'][0] > bay['riser_y_interval'][1]
assert bay['y_interval'][0] > bay['family_door_y_interval'][1]
assert bay['y_interval'][1] < rear['a'][1] - rear['t'] / 2

budgets = {
    'two_independent100_bearings_on140_before_joint': 140 - 2 * 100,
    'two100_bearings_on215_remainder': 215 - 2 * 100,
    'two100_plus20_joint_required_core': 2 * 100 + 20,
    'narrow140_end_bearings': None,
    'reason': 'Do not derive selected narrow end lengths by halving 140. The supplier tied/open-core detail has its own manufacturing, construction and tolerance design. The 215 remainder is not spare tolerance in addition to its joint.'
}
assert budgets['two_independent100_bearings_on140_before_joint'] < 0
assert rows[2]['bed3_west_head_gap'] < 0
assert rows[3]['rear_door_to_spine_finished_face'] < 0
assert not bed_compensation['retains600_geometric_strip']

result = {
    'status': 'Unadopted local comparison; no STR-HOUSE completion or structural adequacy',
    'units': 'mm',
    'source_fingerprints': {
        str(p.relative_to(ROOT)): sha256(p.read_bytes()).hexdigest()
        for p in [OUT / 'house-plan.json', OUT / 'house-supports.json']
    },
    'predecessor_source_fingerprints_verified': support['sources'],
    'scenarios': rows, 'existing_flush_objects': flush_objects,
    'bed_compensation': bed_compensation, 'candidate_full_width_bay': bay,
    'bearing_width_controls': budgets,
    'supplier_boundaries': {
        'ibstock_coltman': 'Published Dual Bearing on 140 Wall: 140 minimum, H12 bars in opened/grouted cores at 400 centres; full bearing at other end; designed temporary support retained until infill design strength. No project-specific bar length, nominal end bearing, capacity or HC150 applicability supplied.',
        'forterra': 'Different supplier: below 190 tied aligned opened cores; typically two cores per 1200 unit. Do not splice its core count into Ibstock 400 spacing.',
        'mpa_pff2019': 'Dated generic guidance: 215 recommended for opposed support; tied alternative never below 140; narrow support at one end only.',
    }
}

svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297">',
       '<rect width="420" height="297" fill="#fffef9"/>',
       '<style>text{font-family:DejaVu Sans,sans-serif;fill:#23343a;font-size:3px}.h{font-size:5px;font-weight:700}.s{font-size:2.6px}.dim{fill:none;stroke:#637b85;stroke-width:.3}.bad{fill:#a34836}.good{fill:#386d60}</style>']
def text(x, y, value, cls=''):
    svg.append(f'<text x="{x}" y="{y}" class="{cls}">{escape(str(value))}</text>')
def rect(x, y, w, h, fill, stroke='#52666e', dash=''):
    svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}" stroke-width=".3"{(" stroke-dasharray="+chr(34)+dash+chr(34)) if dash else ""}/>')
def line(x, y, xx, yy, stroke='#52666e', dash=''):
    svg.append(f'<path d="M{x},{y} L{xx},{yy}" fill="none" stroke="{stroke}" stroke-width=".35"{(" stroke-dasharray="+chr(34)+dash+chr(34)) if dash else ""}/>')
def fmt(v):
    return f'{v:g}'

text(14, 15, 'STR / one real shared support, with its room cost', 'h')
text(14, 23, 'Joined B comparison · east spine x9300 · no adopted geometry, selected slab or capacity', 's')
line(14, 28, 406, 28)
text(14, 39, 'A  Complete candidate panel bay / plan 1:20', 'h')
px = lambda x: 18 + (x - court_core[0]) / 20
py = lambda y: 116 - (y - bay_y) / 20
for a, b, color in [(court_core[0], court_core[1], '#ccd8dc'),
                     (rows[0]['structural_faces'][0], rows[0]['structural_faces'][1], '#d9b69b'),
                     (outer_core[0], outer_core[1], '#ccd8dc')]:
    rect(px(a), 52, (b-a)/20, 70, color)
for a, b in [(court_core[1], rows[0]['structural_faces'][0]),
             (rows[0]['structural_faces'][1], outer_core[0])]:
    rect(px(a), py(bay_y+1200), (b-a)/20, 60, '#e8ede3')
    line(px((a+b)/2-130), 85, px((a+b)/2+130), 85, '#50705d')
    text(px((a+b)/2)-9, 80, fmt(b-a), 's')
line(px(court_core[0])-2, py(7000), px(outer_core[1])+2, py(7000), '#a34836', '2 1')
text(18, 49, 'Court-side leaf', 's')
text(px(centre)-7, 49, '140 core', 's')
text(px(outer_core[0])-21, 49, 'East structural leaf', 's')
text(18, 130, 'Bay y6570–7770; section at y7000; 1200 width is a grid trial.', 's')
text(18, 137, 'Both remote ends still need real bearing/arch-spandrel checks.', 's')
text(18, 144, 'Core alignment and tie positions are NOT selected by this plan.', 's')

text(220, 39, 'B  Width budgets / 1:5', 'h')
for yy, width, title in [(57, 140, '140 core: independent 100 + 100 FAIL'),
                         (94, 215, '215 core: 100 + 15 remainder + 100')]:
    x = 279 - width/10
    text(220, yy-5, title, 's')
    rect(x, yy, width/5, 12, '#d9b69b')
    rect(x, yy+2, 100/5, 8, 'none', '#386d60')
    rect(x+(width-100)/5, yy+2, 100/5, 8, 'none', '#a34836')
    if width < 200:
        rect(x+(width-100)/5, yy+2, (200-width)/5, 8, '#d7a295')
        text(316, yy+8, '60 overlap before any joint', 'bad')
    else:
        text(316, yy+8, '15 total remainder', 's')
text(220, 123, 'The real 140 alternative uses tied, opened/grouted cores.', 's')
text(220, 130, 'It does not pretend two independent 100 seats fit.', 's')
text(220, 137, 'Ibstock: designed temporary support + full remote bearing.', 's')
text(220, 144, 'Actual ends, infill extent and bar anchorage remain unknown.', 's')

line(14, 153, 406, 153)
text(14, 165, 'C  Widening must be paid for in the plan / dimensions mm', 'h')
columns = [14, 193, 245, 300, 356]
for x, t in zip(columns, ['Held object / interval', 'Retain 140', '215 centred', 'Grow east', 'Grow west']): text(x, 176, t, 's')
table = [
    ('East gallery, finished clear', 'gallery_clear'),
    ('Bed 3 west head-nook gap', 'bed3_west_head_gap'),
    ('Riser west edge to structural core', 'riser_west_edge_to_core'),
    ('Rear 900 door end to spine finish', 'rear_door_to_spine_finished_face'),
    ('Intrusion into flush fittings', 'flush_object_intrusion'),
]
for i, (label, key) in enumerate(table):
    y = 187 + i*10
    text(columns[0], y, label)
    for x, row in zip(columns[1:], rows): text(x, y, fmt(row[key]), 'bad' if row[key]<0 else '')
    line(14, y+3, 406, y+3, '#ccd1cc')
text(14, 244, 'A 37.5 eastward bed move restores the old 65 head gap but reduces the good east side 632.5 → 595.', 's')
text(14, 251, 'Negative gaps are actual overlaps. Other junctions are held; these are not four complete house designs.', 's')
text(14, 264, 'Disposition: investigate the supplier tied 140 detail first; wider 215 requires an explicit occupied/service replan.', 'good')
text(14, 272, 'No bearing, tie, upper-wall load path, diaphragm, fire duty, material exception or construction sequence is approved.', 's')
text(14, 284, 'A3 at 100% · sources and exact arithmetic: house-spine-bearing.json / house-spine-bearing-study.md', 's')
svg.append('</svg>')

for name, data in [('house-spine-bearing.json', json.dumps(result, indent=2)+'\n'),
                   ('house-spine-bearing.svg', '\n'.join(svg)+'\n')]:
    path = OUT / name
    if '--check' in sys.argv:
        if not path.exists() or path.read_text() != data:
            raise SystemExit('STALE: ' + str(path))
    else:
        path.write_text(data)
print(json.dumps({'scenarios': rows, 'bed_compensation': bed_compensation,
                  'bay_y': bay['y_interval'], 'bearing_width_controls': budgets}, indent=2))
