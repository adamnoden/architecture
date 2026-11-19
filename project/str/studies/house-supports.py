"""Reproducible HOUSE support/section comparisons, never a capacity calculation.

Run from any cwd: python project/str/studies/house-supports.py [--check]
Inputs are the adjacent paired B plan and the accepted STR-SPANS source data.
Only this script's JSON/SVG are written. No accepted house source is changed.
"""
from pathlib import Path
import hashlib
import json
import math
import sys
from html import escape

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[2]
INPUTS = {
    'paired_plan': OUT / 'house-plan.json',
    'paired_plan_generator': OUT / 'house-plan.py',
    'accepted_spans': ROOT / 'project/str/studies/span-envelopes.json',
    'layout_revision': ROOT / 'compiler/reference-house/georgian/layout-revision.ts',
    'layout_family': ROOT / 'compiler/reference-house/georgian/layout-family.ts',
    'section_source': ROOT / 'compiler/reference-house/georgian/section-source.ts',
    'section_exemplar': ROOT / 'compiler/reference-house/georgian/section-exemplar.ts',
}
plan = json.loads(INPUTS['paired_plan'].read_text())
accepted = json.loads(INPUTS['accepted_spans'].read_text())
source_hashes = {k: {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()}
                 for k, p in INPUTS.items()}

def emit(name, data):
    p = OUT / name
    if '--check' in sys.argv:
        if p.read_text() != data:
            raise SystemExit('STALE: ' + str(p))
    else:
        p.write_text(data)

def arch(span, spring, rise, ring, centre, patch=None):
    """Circular segment with radial ring; patch is a horizontal finite interval."""
    radius = span * span / (8 * rise) + rise / 2
    cz = spring + rise - radius
    result = dict(span=span, spring=spring, rise=rise, radial_ring=ring,
                  intrados_radius=radius, circle_centre_z=cz,
                  crown_intrados=spring+rise, crown_extrados=spring+rise+ring,
                  outer_skewback_left=centre-(span/2)*(radius+ring)/radius,
                  outer_skewback_right=centre+(span/2)*(radius+ring)/radius,
                  outer_skewback_z=cz+(radius-rise)*(radius+ring)/radius,
                  ideal_parabolic_UDL_H_over_W=span/(8*rise))
    if patch:
        samples = [patch[0], patch[1]] + ([centre] if patch[0] <= centre <= patch[1] else [])
        zs = [cz+math.sqrt((radius+ring)**2-(x-centre)**2) for x in samples]
        result.update(reaction_patch=patch, extrados_over_patch=[min(zs),max(zs)],
                      reserve_to_receiving_masonry_top_3160=[3160-max(zs),3160-min(zs)])
    return result

def overlap(a, b):
    return max(0, min(a[1],b[1])-max(a[0],b[0]))

sw = {w['id']:w for w in plan['first_walls']}
gw = {w['id']:w for w in plan['ground_walls']}
assert sw['wet-spine']['a'][0] == 9300
assert sw['rear-west']['b'][0] == 4450
assert gw['rear-east']['holes'][0] == [8250,9150]
assert plan['stair'] == [417.5,4432.5,2400,4335]
assert plan['void'] == [4885,417.5,2230,2317.5]

span = accepted['spanGeometry']
of = span['outerLeafIntervalMm']; cf = span['courtLeafIntervalMm']
trial_bearings = [[of[1]-100,of[1]],[cf[0],cf[0]+100]]
bridge_patches = [[4685,4885],[7115,7315]]
court_cases = []
for width in (2400,1800):
    op = [6000-width/2,6000+width/2]
    a = arch(width,2250,600,215,6000)
    a.update(opening_x=op, nominal_each_jamb=(3500-width)/2,
             finite_frame_patches_x=bridge_patches,
             patch_overlap_opening=[overlap(p,op) for p in bridge_patches],
             gap_patch_to_opening_jamb=[op[0]-bridge_patches[0][1],bridge_patches[1][0]-op[1]],
             left_patch_to_outer_skewback_x=a['outer_skewback_left']-bridge_patches[0][1])
    court_cases.append(a)

stair_cases = [arch(1000,2550,300,215,4600,p) for p in ([4332.5,4532.5],[4232.5,4432.5])]
for a in stair_cases:
    a['member_patch_intrusion_into_clear_aperture'] = overlap(a['reaction_patch'],[4432.5,8767.5])
    a['east_support_patch_gap_to_court_window_4650'] = 4650-a['reaction_patch'][1]
    a['seat_reserve_by_declared_header_downstand'] = [
        {'downstand_below_HC_soffit': d, 'receiving_masonry_top': 3160-d,
         'reserve_over_arch_patch':[3160-d-a['extrados_over_patch'][1],3160-d-a['extrados_over_patch'][0]]}
        for d in (0,50,100,150)]
lowered_window = arch(1000,2300,300,215,4600,[4232.5,4432.5])
lowered_window.update(declared_header_downstand=250,
    slab_bearing_top=3170, header_bottom=2920, receiving_masonry_top=2910,
    reserve_over_patch=[2910-lowered_window['extrados_over_patch'][1],2910-lowered_window['extrados_over_patch'][0]],
    authored_fire_protection_reserve=15, protected_header_underside=2905,
    original_trial_crown_intrados=2850, crown_intrados_loss=250,
    exterior_interface='Lower the actual inner and weather-leaf arch/window profiles together; actual outer leaf, cavity closure, water management and frame assembly must be redrawn, not inferred from this inner structural ring.',
    limit='250 is an occupancy sensitivity, not a sized beam or adequate bearing. Header remains wholly south of clear stair aperture.')

floor = {
    'FFL':3450, 'finished_ceiling_underside':3100,
    'basic_layers_top_down':{'finish':20,'upper_functions':35,'topping':75,'HC':150,'services':55,'ceiling':15},
    'basic_HC_soffit_at_support':3170,'basic_HC_top_at_support':3320,
    'authored_bearing_contact_reserve':10,'receiving_masonry_top':3160,
    'camber_reservation_alternative': {
        'scope':'A 15 mm combined positive camber/tolerance allowance is authored, NOT a manufacturer prediction.',
        'finish':[3430,3450], 'renewable_upper_interface':[3410,3430],
        'topping_top':3410,'minimum_topping_at_crown':75,
        'HC_soffit_at_support':3170,'HC_top_at_support':3320,
        'max_HC_soffit_at_crown':3185,'max_HC_top_at_crown':3335,
        'topping_at_support':90,'topping_at_max_crown':75,
        'minimum_service_zone':[3115,3170], 'ceiling':[3100,3115],
        'combined_positive_camber_tolerance_allowance':15,
        'extra_topping_mass_upper_bound_KN_per_m2_at25':0.015*25,
        'limitation':'20 mm is a required-function reserve, not a proved acoustic/thermal/wet-floor assembly. Negative deviations and actual tolerances require their own treatment.'
    },
    'one_sided_trial_bearings':trial_bearings,
    'trial_bearing_centres':[sum(p)/2 for p in trial_bearings],
    'trial_bearing_centre_gap':sum(trial_bearings[1])/2-sum(trial_bearings[0])/2,
    'trial_slab_end_to_end':trial_bearings[1][1]-trial_bearings[0][0],
    'trial_bearing_eccentricity_from_each_140_leaf_centre':[20,-20],
    'two_opposed_100_ends_on_140_deficit_before_joint':60,
    'two_opposed_100_ends_on_215_balance_before_joint':15,
}
assert sum(floor['basic_layers_top_down'].values()) == 350
assert floor['basic_HC_soffit_at_support']-55-15 == 3100

field_comparisons = [
 {'id':'ordinary outer/court','direction':'normal to parallel walls','clear_structural_faces':3445,'status':'Reference only; does not cover corners or holes'},
 {'id':'SW room rotated primary alternative','direction':'EW','clear_structural_faces':4800-70-402.5,'status':'Avoids south-room slab ends on L-north; longer HC field, door/arch at x4800 and lower cloak contacts remain explicit'},
 {'id':'SW L extension','direction':'EW','clear_structural_faces':2817.5-70-402.5,'status':'Supports outer-west to L-return; upper L-north wall runs parallel to plank edges'},
 {'id':'east gallery rotated alternative','direction':'NS','clear_structural_faces':8290-107.5-(2650+70),'status':'Avoids opposed ends on spine9300, but front wall2650 can then receive opposed ends from south field'},
 {'id':'NW rooms','direction':'NS','clear_structural_faces':11597.5-(8852.5+70),'status':'Split around heavy parallel wall2902.5'},
 {'id':'NE corner','direction':'NS','clear_structural_faces':11597.5-(8290+107.5),'status':'Reactions on actual rear-east245-finished wall; door arches receive them'},
 {'id':'east wet strip','direction':'EW','clear_structural_faces':11597.5-(9300+70),'status':'One-sided bearing at spine only if gallery end direction changes'},
]

services = []
for body in (75,190,250):
    for downstand in (0,50,100):
        total = body+25+25+15
        services.append(dict(body=body,declared_downstand=downstand,
                             gross_vertical=total,structure_bottom=3170-downstand,
                             finished_bulkhead_soffit=3170-downstand-total))

study_arch = arch(900,2250,225,215,1800)
study_box = [1712.5,2280,175,140]
study_intrados_min = study_arch['circle_centre_z'] + math.sqrt(study_arch['intrados_radius']**2-(175/2)**2)
plant_arch = arch(900,2250,450,215,3200)
plant_box = [3000,2310,400,315]
plant_intrados_min = plant_arch['circle_centre_z'] + math.sqrt(plant_arch['intrados_radius']**2-200**2)
riser = plan['ground_objects']['plant-riser']
cabinet = plan['first_objects']['family-service-cabinet']

roof = accepted['roof']
diag = (3917.5-332.5)*math.sqrt(2)
headroom = []
for soffit in (3100,3105,3055,2905,2805):
    headroom.append({'soffit':soffit,
        'last_continuous_pitch_y_with_2000_clear':4432.5+(soffit-2000-172.5)*300/172.5,
        'tread6_y_z_clear':[5932.5,1035,soffit-1035],
        'tread7_y_z_clear':[6232.5,1207.5,soffit-1207.5]})

record = {
 'status':'Unadopted HOUSE support comparison. Geometry reservations and declared models, no member sizing, capacity, product selection or whole-house pass.',
 'units':'mm except explicitly labelled angles, ratios and loads',
 'sources':source_hashes,
 'paired_plan_snapshot':{k:plan[k] for k in ('status','geometry_source_head','stair','void','ground_walls','first_walls','service_disposition')},
 'accepted_span_geometry':span,
 'floor':floor,'field_comparisons':field_comparisons,
 'entrance':{'bridge_finished_y':[2735,3832.5],'bridge_depth':1097.5,
             'finite_side_support_patches':bridge_patches,
             'short_side_member_support_axes_y':[2650,3917.5],
             'long_side_member_control_axes_y':[332.5,3917.5],
             'court_arch_cases':court_cases,
             'limits':'Frame widths are occupancy comparisons. Actual bearing length, support patch, member depth, eccentricity and arch load spreading remain to be designed.'},
 'stair':{'short_header_patch_y':[4232.5,4432.5],
          'header_route':'outer-west structural inner leaf to court-west structural inner leaf; two supports',
          'inner_trimmer_patch_x':[2817.5,3017.5],
          'north_support_axis_y':8852.5,'north_door_starts_x':3100,
          'north_patch_to_door_gap':82.5,'window_arch_cases':stair_cases,
          'lowered_arch_250_downstand_alternative':lowered_window,
          'headroom_diagnostics':headroom,
          'limit':'Actual source stair nosings and complete frame/fire protection/ceiling faces control; a 200 mm plan width is not a member design.'},
 'service':{
   'one_body_vertical_comparisons':services,
   'south_gallery_plan':[1800,3350,7115,400],
   'gallery_y':[3350,3750],'gallery_width':400,
   'gap_to_L_north_finished_face':3350-(3247.5+85),
   'gap_to_court_south_finished_face':3832.5-3750,
   'study_arch':study_arch,'study_transom_box_x_z_w_h':study_box,
   'study_intrados_min_over_box':study_intrados_min,'study_box_top_margin':study_intrados_min-2420,
   'plant_exit_semicircle_alternative':plant_arch,'plant_transom_box_y_z_w_h':plant_box,
   'plant_intrados_min_over_box':plant_intrados_min,'plant_box_top_margin':plant_intrados_min-2625,
   'plant_transition_each_side_gross':[900,600,900],
   'plant_transition_west_plan':[8315,2900,900,600],
   'plant_transition_east_plan':[9385,2900,900,600],
   'plant_transition_clear_of_court_east_face':8315-8167.5,
   'riser_gross':riser,'upper_cabinet_gross':cabinet,
   'riser_gap_to_spine_core_east_face':riser[0]-(9300+70),
   'riser_full_gross_within_cabinet':all((riser[0]>=cabinet[0],riser[1]>=cabinet[1],riser[0]+riser[2]<=cabinet[0]+cabinet[2],riser[1]+riser[3]<=cabinet[1]+cabinet[3])),
   'illustrative_structural_service_bay':[9370,4650,700,800],
   'limits':'No duct system, flows, bend radii, acoustic/fire performance, clear internal cabinet area, maintenance reach or service-bay trimmer capacity is accepted.'},
 'roof':{'source':roof,'corner_diagonal_reference_supports_SW':[[332.5,332.5],[3917.5,3917.5]],
         'corner_diagonal_plan_length':diag,'diagonal_pitch_deg':math.degrees(math.atan(math.tan(math.radians(25))/math.sqrt(2))),
         'ridge_corner':[2125,2125,roof['ridgeMm']],
         'roof_lower_trace_at_structural_support_centre':6800+332.5*math.tan(math.radians(25))-300,
         'mechanism':'Tied diagonal girder/truss plus orthogonal boundary trusses and supported jack/purlin fields. Ridge is a node, not an assumed wall support.',
         'limits':'Finite corner bearings, heel depth, actual roof layers, storage, bracing, joints, uplift and thermal/moisture interfaces remain unproved.'},
 'vault':{'exposed200':accepted['vault']['exposedComparator']['cases'][0],
          'exposed500':accepted['vault']['exposedComparator']['cases'][1],
          'UDL_ratio_at_3445_and_rise200':3445/(8*200),
          'UDL_ratio_at_3545_and_rise200':3545/(8*200),
          'service_bulkhead_under_springing3100_for250body':3100-(250+25+25+15),
          'model_limit':'Three-hinged parabolic UDL diagnostic H/W=L/(8f), W=2V; not a solution for nonuniform fill, wall loads, a real vault or support capacity.'},
 'demand_symbols':{'q':'actual distributed design action for a field, with combinations to establish',
                   'w_u':'upper masonry line load including openings and eccentricity',
                   'R_i':'finite vertical reaction and its footprint at named support i',
                   'H_a':'local door/window arch horizontal reaction',
                   'H_v':'vault springing reaction, distinct from H_a',
                   'T_c':'collector/tie action including opening bypass and roof anchorage',
                   'M_offset':'H times vertical offset when an elevated collector replaces a springing-level tie'},
}
assert record['service']['study_box_top_margin'] > 0
assert record['service']['plant_box_top_margin'] > 0
assert court_cases[1]['patch_overlap_opening'] == [0,0]
assert stair_cases[1]['member_patch_intrusion_into_clear_aperture'] == 0
emit('house-supports.json',json.dumps(record,indent=2)+'\n')

# Compact exact geometric evidence sheet; reserve shapes are explicitly labelled.
svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297">',
       '<rect width="420" height="297" fill="white"/>',
       '<style>text{font-family:Arial,sans-serif;fill:#223746;font-size:3px}.title{font-size:6px;font-weight:bold}.head{font-size:4px;font-weight:bold}.small{font-size:2.6px}.warn{fill:#a4422c} .dim{stroke:#677f8c;stroke-width:.35;fill:none}</style>']
def txt(x,y,s,cl=''):
    svg.append(f'<text x="{x}" y="{y}" class="{cl}">{escape(str(s))}</text>')
def rect(x,y,w,h,fill,stroke='#536b76',sw=.3):
    svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')
def line(x,y,xx,yy,colour='#536b76',sw=.35,dash=''):
    svg.append(f'<path d="M{x},{y} L{xx},{yy}" stroke="{colour}" stroke-width="{sw}" fill="none" '+(f'stroke-dasharray="{dash}"' if dash else '')+'/>')
txt(10,12,'HOUSE: located supports and complete section reservations','title')
txt(10,19,'Unadopted B candidate | geometry and topology only | no member, arch, connection or foundation capacity')
txt(10,30,'1  HC150 / held 350 mm floor','head')
scale=.12; xx=14; width=52; z0=3450; yy=38
layers=[('finish 20',20,'#d6c29f'),('upper functions 35',35,'#f5e3a9'),('topping 75',75,'#c6d1d6'),('HC150',150,'#acd0e1'),('services 55',55,'#ffffff'),('ceiling 15',15,'#d6dfe4')]
depth=0
for label,t,col in layers:
    rect(xx,yy+depth*scale,width,t*scale,col)
    txt(70,yy+(depth+t/2)*scale+1,label)
    depth+=t
txt(14,yy-3,'FFL +3450')
txt(14,yy+depth*scale+5,'Ceiling +3100')
txt(14,92,'HC soffit +3170; contact reserve 10; masonry top +3160','small')
txt(14,98,'Camber alternative: 20 interface + 15 camber reserve,','small')
txt(14,103,'topping min75 at crown / 90 at ends; same 350 total.','small')
txt(14,109,'15 is an authored limit, not predicted product camber.','small warn')

txt(143,30,'2  Court arch / 200-wide bridge-side patch comparison','head')
for idx,a in enumerate(court_cases):
    px=146+idx*128;py=98;s=.025
    def ax(x):return px+(x-4200)*s
    def az(z):return py-(z-2100)*s
    op=a['opening_x'];rad=a['intrados_radius'];cz=a['circle_centre_z']
    rect(ax(4250),az(3160),(op[0]-4250)*s,(3160-2100)*s,'#e8dfcf')
    rect(ax(op[1]),az(3160),(7750-op[1])*s,(3160-2100)*s,'#e8dfcf')
    pts=[]
    for n in range(101):
        x=op[0]+a['span']*n/100
        pts.append((ax(x),az(cz+math.sqrt(rad*rad-(x-6000)**2))))
    outer=[]
    theta=math.asin(a['span']/2/rad)
    for n in range(101):
        t=-theta+2*theta*n/100
        outer.append((ax(6000+(rad+215)*math.sin(t)),az(cz+(rad+215)*math.cos(t))))
    svg.append('<polygon points="'+' '.join(f'{x},{y}' for x,y in pts+list(reversed(outer)))+'" fill="#d0ab80" stroke="#765d44" stroke-width=".3"/>')
    for p in bridge_patches:
        rect(ax(p[0]),az(3360),200*s,200*s,'#acd0e1')
    txt(px,39,f'{a["span"]:.0f} opening / nominal jamb {a["nominal_each_jamb"]:.0f}','small')
    txt(px,105,f'Patch overlap opening: {a["patch_overlap_opening"][0]:.0f} each','small')
    txt(px,111,f'Ideal H/W = {a["ideal_parabolic_UDL_H_over_W"]:.3f}','small')
txt(145,118,'Blue rectangles show reaction occupancy only; vertical depth is not a sized member.','small warn')

txt(10,131,'3  Stair header on actual west-window arch','head')
sx=16;sy=187;s=.06;a=stair_cases[1]
def wx(v):return sx+(v-4000)*s
def wz(v):return sy-(v-2500)*s
rad=a['intrados_radius'];cz=a['circle_centre_z'];theta=math.asin(500/rad)
for ring in (0,215):
    pts=[]
    for n in range(81):
        t=-theta+2*theta*n/80
        pts.append((wx(4600+(rad+ring)*math.sin(t)),wz(cz+(rad+ring)*math.cos(t))))
    svg.append('<polyline points="'+' '.join(f'{x},{y}' for x,y in pts)+'" fill="none" stroke="#886747" stroke-width=".8"/>')
line(wx(4100),wz(3160),wx(5100),wz(3160),'#7b5550',.3,'2 1')
rect(wx(4232.5),wz(3310),200*s,150*s,'#acd0e1')
line(wx(4432.5),wz(2500),wx(4432.5),wz(3350),'#a4422c',.35,'2 1')
txt(14,197,'Patch y4232.5–4432.5 stays south of aperture.','small')
txt(14,203,f'Extrados {a["extrados_over_patch"][0]:.1f}–{a["extrados_over_patch"][1]:.1f}; to +3160:', 'small')
txt(14,209,f'{a["reserve_to_receiving_masonry_top_3160"][0]:.1f}–{a["reserve_to_receiving_masonry_top_3160"][1]:.1f} geometric reserve, not usable bearing depth.','small')
txt(14,215,'Downstand δ subtracts from this seat reserve; δ150 clashes.','small warn')

txt(143,131,'4  Accessible lowered service gallery','head')
rect(147,140,96,10,'#acd0e1');txt(249,146,'structure soffit +3170','small')
rect(163,153,60,30,'#f3d3a6');txt(249,169,'one 250 body + 25/25 clearances','small')
rect(147,186,96,1.8,'#d6dfe4');txt(249,189,'removable lid +2855','small')
txt(147,197,'400 gross plan width / 315 gross depth; local downstand δ lowers soffit by δ.','small')
txt(147,203,'South route y3350–3750 clears L wall by17.5 and court face by82.5.','small')
txt(147,209,'75 branch: 175×140 insert, z2280–2420, inside real900 / rise225 arch.','small')
txt(147,215,'250 plant exit: new900 semicircle, 400×315 insert z2310–2625.','small')

txt(10,229,'5  Roof corner mechanism','head')
ps=.012;ox=16;oy=280
def rp(x,y):return ox+x*ps,oy-y*ps
for p,q in [((332.5,332.5),(3917.5,332.5)),((332.5,332.5),(332.5,3917.5)),((3917.5,332.5),(3917.5,3917.5)),((332.5,3917.5),(3917.5,3917.5))]:
    line(*rp(*p),*rp(*q),'#657e88',.65)
line(*rp(332.5,332.5),*rp(3917.5,3917.5),'#b67545',1.2)
txt(73,240,'Diagonal tied girder: outer to court structural corner.','small')
txt(73,246,f'Reference plan length {diag:.1f}; diagonal pitch {record["roof"]["diagonal_pitch_deg"]:.2f}°.','small')
txt(73,252,'Boundary cross-ring trusses + triangular jack/purlin fields.','small')
txt(73,258,'Ridge corner is a node; finite support and all connections remain.','small')
txt(73,269,'Open: opposed slab ends on140; actual frame depth; riser framing;','small warn')
txt(73,275,'arch thrust closure and heel/ceiling junction. No whole-house pass.','small warn')
txt(10,290,'Source fingerprints, all arithmetic and assumptions: house-supports.json / .py. Paired B plan remains a separate unadopted study.','small')
svg.append('</svg>')
emit('house-supports.svg','\n'.join(svg)+'\n')
print('Wrote/checked house-supports.json and house-supports.svg; finite geometry only.')
