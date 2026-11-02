"""Bounded source-bound gravity/lateral destinations for the open-loggia trial.

This is an action and interface ledger, not a pile, masonry or diaphragm design.
Run without --check to write its JSON; --check compares the committed result.
"""
from pathlib import Path
import hashlib
import json
import math
import sys

ROOT = Path(__file__).resolve().parents[3]
HERE = Path(__file__).resolve().parent
SOURCES = {
    'project/had/studies/open-north-loggia.json': '542781c6bb1d277b20492e8433cea498e98eaea5db2e737a5ec7e9655f9d18fd',
    'project/str/studies/open-loggia-support.json': 'b5f08104c0da327613b84e055420d58f7709c354facd205634bcfd69a05e09b5',
    'project/str/studies/house-supports.json': 'f0594e0afd90334d20614330fdbe5ad676f8dc9f4d2aca4fa9fdb2881b6e8388',
    'project/mat/studies/warm-receiving-grid.json': 'a2b15c9505ee3888ffb892aa7e5182f80f4aa5a70bd5058a915df6e3bec4de99',
}
source = {}
for name, digest in SOURCES.items():
    raw = (ROOT / name).read_bytes()
    if hashlib.sha256(raw).hexdigest() != digest:
        raise SystemExit(f'{name} changed: rebind the actual source before recalculating')
    source[name] = json.loads(raw)
had = source['project/had/studies/open-north-loggia.json']
struc = source['project/str/studies/open-loggia-support.json']
early = source['project/str/studies/house-supports.json']
warm = source['project/mat/studies/warm-receiving-grid.json']
routes = struc['lower_grid']['actual_routes']

def ground_territory(xy):
    options = []
    for name, a, b, width in routes:
        axis = 0 if a[0] != b[0] else 1
        fraction = max(0, min(1, (xy[axis]-a[axis])/(b[axis]-a[axis])))
        foot = [a[i] + fraction*(b[i]-a[i]) for i in range(2)]
        options.append((math.dist(xy,foot), name, foot, width))
    distance, name, foot, width = min(options)
    return dict(route=name, axis=foot, offset_mm=[xy[i]-foot[i] for i in range(2)],
                inside_drawn_width=distance<=width/2,
                status='Plan territory only; no warm spreader, cold node or support-share capacity')

def line(w):
    a, b = w['a'], w['b']
    axis = 0 if a[0] == b[0] else 1
    return (axis, a[axis], min(a[1-axis],b[1-axis]), max(a[1-axis],b[1-axis]))

def opposite_segment(upper, ground):
    axis, datum, lo, hi = line(upper)
    if line(ground)[:2] != (axis,datum): return 0
    _, _, gl, gh = line(ground)
    return max(0,min(hi,gh)-max(lo,gl))

def aligned_opening_overlap(upper, ground):
    axis, datum, lo, hi = line(upper)
    if line(ground)[:2] != (axis,datum): return 0
    _, _, gl, gh = line(ground)
    return sum(max(0,min(hi,gh,b)-max(lo,gl,a)) for a,b in ground['holes'])

# These are gross wall-load challenges: actual openings do not magically delete
# the weight above their heads. Some loads share the floor allowance, and the
# northwest wet beam already owns one upper wall. Do not add every row to a
# total and call it independent building mass.
wall_height_m = 3.1
wall_density = 20
walls = []
for w in had['upperWalls']:
    axis, datum, lo, hi = line(w)
    length = (hi-lo)/1000
    core_m=(w['structuralCore'][1]-w['structuralCore'][0])/1000
    line_ULS=1.35*wall_height_m*core_m*wall_density
    aligned = [(g['id'],opposite_segment(w,g)) for g in had['groundWalls']]
    aligned = [(name,round(mm,3)) for name,mm in aligned if mm>0]
    lower_open = sum(aligned_opening_overlap(w,g) for g in had['groundWalls'])
    holes = sum(b-a for a,b in w['holes'])
    # Holes specify horizontal interruptions, not a subtraction height.
    key = 'wet-beam-included' if w['id']=='rear-wet-east' else 'direct-line-or-transfer-unproved'
    midpoint = [(w['a'][i]+w['b'][i])/2 for i in range(2)]
    walls.append(dict(id=w['id'],axis='x' if axis==0 else 'y',datum=datum,
                      length_mm=hi-lo,core_mm=w['structuralCore'][1]-w['structuralCore'][0],
                      line_ULS_kN_per_m=line_ULS,gross_ULS_kN=line_ULS*length,opening_intervals_mm=w['holes'],
                      opening_total_mm=holes,aligned_ground_segments=aligned,
                      aligned_lower_opening_mm=lower_open,
                      route_at_midpoint=ground_territory(midpoint),accounting=key,
                      destination='Opening arch/head and floor/ground transfer required; alignment alone is not capacity'))
assert len(walls)==len(had['upperWalls'])
assert next(w for w in walls if w['id']=='rear-wet-east')['accounting']=='wet-beam-included'
assert next(w for w in walls if w['id']=='rear-west')['aligned_lower_opening_mm']==900

ground_wall_height_m=3.17  # source's structural first-floor soffit above ground FFL
assert had['sections']['firstFloorRC']['bottom']==3170
ground_walls=[]
for w in had['groundWalls']:
    axis,datum,lo,hi=line(w)
    core_m=(w['structuralCore'][1]-w['structuralCore'][0])/1000
    xy=[(w['a'][i]+w['b'][i])/2 for i in range(2)]
    ground_walls.append(dict(id=w['id'],length_mm=hi-lo,core_mm=core_m*1000,
                             opening_intervals_mm=w['holes'],
                             gross_ULS_kN=1.35*ground_wall_height_m*core_m*wall_density*(hi-lo)/1000,
                             ground=ground_territory(xy),
                             status='Gross masonry challenge to ground line; arches, piers, doors and upper/floor tributaries require separate nonduplicated transfer'))

# Actual B entrance: bridge infill starts beyond the 2230-wide void. Treat the
# slab and its two finite side members as distinct G/Q loads; distribute by
# force/first moment on the stated short-side axes, not a floating wall edge.
void_x, void_y, void_w, void_l = had['void']
bridge_y0, bridge_y1 = early['entrance']['bridge_finished_y']
patches = early['entrance']['finite_side_support_patches']
support_y = early['entrance']['short_side_member_support_axes_y']
assert (void_x,void_w,void_y+void_l)==(4885,2230,bridge_y0)
assert patches==[[4685,4885],[7115,7315]] and support_y==[2650,3917.5]
bridge_area = void_w*(bridge_y1-bridge_y0)/1e6
bridge_slab_G, bridge_slab_Q = 7.5*bridge_area, 2*bridge_area
member_G_gross = 2*.2*.35*((support_y[1]-support_y[0])/1000)*25
# Each 200-wide side beam overlaps a neighbouring axis floor rectangle by
# 115 mm along its 1267.5 mm support span. Derive these overlaps from the
# actual source rectangles. Its upper 200 mm RC is already in that floor
# field's G5 slab term; remove only that RC volume, not its finishes.
overlap_area_mm2=0
for x0,x1 in patches:
    for field in struc['floor_fields']:
        a,b,c,d=field['rectangle']
        overlap_area_mm2 += max(0,min(x1,c)-max(x0,a))*max(0,min(support_y[1],d)-max(support_y[0],b))
assert math.isclose(overlap_area_mm2,2*115*1267.5)
overlap_slab_G = overlap_area_mm2/1e6*.2*25
member_G = member_G_gross-overlap_slab_G
bridge_ULS = 1.35*(bridge_slab_G+member_G)+1.5*bridge_slab_Q
seat_y_reaction = bridge_ULS/4
bridge_seats=[]
for x0,x1 in patches:
    for y in support_y:
        xy=[(x0+x1)/2,y]
        bridge_seats.append(dict(xy=xy,vertical_ULS_kN=seat_y_reaction,
                                 ground=ground_territory(xy)))
assert math.isclose(sum(s['vertical_ULS_kN'] for s in bridge_seats),bridge_ULS)
assert math.isclose(sum(s['vertical_ULS_kN']*s['xy'][1] for s in bridge_seats),
                    bridge_ULS*(bridge_y0+bridge_y1)/2)
arch = early['entrance']['court_arch_cases'][1]
assert arch['opening_x']==[5100,6900]

floor = struc['lower_grid']['current_house_concept_join']['floor_level_inventory']
floor_reactions = struc['finite_floor_frame']['floor_reaction_inventory']['reactions']
assert len(floor_reactions)==32 and math.isclose(floor['ULS'],sum(
    r['ULS_per_m']*math.dist(r['support_segment'][:2],r['support_segment'][2:])/1000
    for r in floor_reactions),rel_tol=1e-10)
floor_edge = []
for r in floor_reactions:
    a=r['support_segment'][:2];b=r['support_segment'][2:]
    xy=[(a[i]+b[i])/2 for i in range(2)]
    floor_edge.append(dict(field=r['field'],segment=r['support_segment'],
                           vertical_ULS_kN=r['ULS_per_m']*math.dist(a,b)/1000,
                           ground=ground_territory(xy),
                           status='First-floor support-edge action; do not add to wet/stair transfer reactions'))

# Surface audit only. The three mutually separate gross openings are exact HAD
# rectangles; the actual physical slab perimeter, wall bands, local patches and
# rims are not specified by this subtraction. The remainder is an area/action
# ceiling, never an assigned reaction or net slab quantity.
stair_area=had['stair'][2]*had['stair'][3]/1e6
court_area=had['court'][2]*had['court'][3]/1e6
entrance_void_area=void_w*void_l/1e6
gross_surface_domain=144-court_area-stair_area-entrance_void_area
landing_rectangle_area=struc['finite_floor_frame']['stair']['landing_depth']*had['stair'][2]/1e6
unassigned_surface=max(0,gross_surface_domain-floor['axis_field_area']-bridge_area)
assert 23<unassigned_surface<27
assert math.isclose(gross_surface_domain,116.177975)

roof = struc['lower_grid']['current_house_concept_join']
assert math.isclose(sum(e['roof_ULS'] for e in roof['roof_control_exits']),roof['roof_ULS_conserved'])
uplift_abs = struc['actual_roof']['plan_area']*2.25
assert math.isclose(roof['roof_ULS_conserved'],908.145)
assert math.isclose(uplift_abs,324.3375)
receivers = []
for r in struc['finite_floor_frame']['actual_ground_receivers']:
    if r['id'] in ('stair-mid-W','header-W','header-E'):
        # These can be internal transfers already represented by the named
        # post/wall path. Retain their identity but do not sum them twice.
        accounting='intermediate-or-overlapping'
    else: accounting='distinct-demand-with-origin-audit-required'
    receivers.append(dict(id=r['id'],xy=r['xy'],N_ULS_kN=r.get('N',r.get('vertical_ULS')),
                          M_ULS_kNm=r.get('M'),ground=ground_territory(r['xy']),
                          accounting=accounting))

# Unit horizontal action exposes the global anchorage couple without inventing
# a site wind pressure, diaphragm stiffness or sharing between masonry piers.
outer_axes_m=(11667.5-332.5)/1000
roof_height_m=struc['actual_roof']['primary_centre']/1000
lateral=dict(reference_H_kN=1,roof_application_height_m=roof_height_m,
             outer_axis_separation_m=outer_axes_m,
             unit_base_shear_kN=1,unit_base_overturning_kNm=roof_height_m,
             unit_boundary_couple_kN=roof_height_m/outer_axes_m,
             both_axes='Apply Hx and Hy separately with reversal; this is global equilibrium, not a split to individual walls.',
             candidate_wall_lines=dict(Hx=['outer-S/N inner core with actual openings',
                                           'court-S/N and rear-west/rear-east segmented lines with arch and loggia interruptions'],
                                       Hy=['outer-W/E inner core with actual windows',
                                           'service spine x9300, court-W/E and loggia x4377.5/7622.5 tied returns']),
             candidate_status='These are route candidates from actual geometry, not assigned shares or credited shear-wall capacities.',
             path=['roof rail/post/purlin signed cleats and ordinary/corner frames',
                   'continuous warm collector/tie/roof diaphragm with verified chord and shear joints',
                   'selected transverse/longitudinal RC wall and masonry restraint lines around court, void and loggia',
                   'floor diaphragm/anchored upper-wall supports and warm reinforced spreader',
                   'tested AAC/mineral-DPC shear and tension interface to cold grid',
                   'cold grid, support groups and actual ground'],
             open=['No site wind Hx/Hy/pressure distribution or directional stiffness; 1 kN is a unit demand only',
                   'No roof/floor diaphragm shear, collector continuity, arch pierhead/tie anchor or torsional response',
                   'No warm/cold horizontal or uplift crossing detail; steel starter bypass would defeat thermal separation',
                   'No support-group lateral/uplift, tree/heave and settlement action combination'])

result=dict(status='Joined reaction destinations only; incomplete conditional house/foundation concept',
            sources=SOURCES,unit_system='mm, m, kN; authored ULS action comparisons',
            parent_roof=dict(area_m2=struc['actual_roof']['plan_area'],
                             downward_ULS_kN=roof['roof_ULS_conserved'],
                             signed_uplift_no_favourable_G_kN=-uplift_abs,
                             exits=len(roof['roof_control_exits']),
                             scope='Collapsed corners are conservative action exits, not finite jack/hip paths; q450 delta excluded'),
            axis_floor=dict(area_m2=floor['axis_field_area'],ULS_kN=floor['ULS'],
                            support_edges=floor_edge,
                            surface_audit=dict(gross_12x12_m2=144,court_clear_m2=court_area,
                                               entrance_void_m2=entrance_void_area,stair_aperture_m2=stair_area,
                                               gross_outside_openings_m2=gross_surface_domain,
                                               explicit_bridge_m2=bridge_area,
                                               remaining_surface_domain_m2=unassigned_surface,
                                               landing_inside_stair_upper_rectangle_m2=landing_rectangle_area,
                                               bound_ULS_if_all_remaining_8p5G_2Q_kN=unassigned_surface*(1.35*8.5+1.5*2),
                                               status='Upper rectangular area/action challenge only. Walls, bands, trims and actual landing have no disjoint physical mass or support destination in this remainder.'),
                            exclusions=['Wall-width and cantilever bands','Physical slab openings and service trim',
                                        'Entrance bridge','Heavy walls and stair; do not add intermediate reactions twice']),
            upper_internal_wall_challenge=dict(trial_height_m=wall_height_m,
                                                density_kN_m3=wall_density,
                                                rows=walls,
                                                scope='Gross actual 140/215-core internal wall challenge only. External leaves and void/head reactions omitted; wet-wall beam already includes its wall.'),
            ground_internal_wall_challenge=dict(trial_height_m=ground_wall_height_m,
                                                rows=ground_walls,
                                                scope='Gross source-wall base selfweight challenge, not exact mass. Opening/arch RC substitution and external leaves omitted.'),
            entrance_bridge=dict(area_m2=bridge_area,slab_G_kN=bridge_slab_G,slab_Q_kN=bridge_slab_Q,
                                 two_member_gross_G_kN=member_G_gross,
                                 overlap_with_axis_slab_G_already_counted_kN=overlap_slab_G,
                                 two_member_incremental_G_kN=member_G,
                                 ULS_kN=bridge_ULS,seats=bridge_seats,
                                 court_opening_mm=arch['opening_x'],patch_to_jamb_mm=arch['gap_patch_to_opening_jamb'],
                                 skewback_clearance_mm=arch['left_patch_to_outer_skewback_x'],
                                 status='Four finite action destinations, not adequate bearing: west/east south lines and court-south piers/arch still require actual joint and thrust resolution'),
            named_stair_wet_receivers=receivers,
            lateral=lateral,
            preferred_foundation=dict(warm='RC ground slab and integral reinforced warm reaction spreader support inner wall/bridge/stair loads',
                                      authored_vertical_z=dict(warm_grid_top=warm['recipe']['warmGridTop'],
                                                               warm_grid_soffit=warm['recipe']['warmGridSoffit'],
                                                               AAC=warm['recipe']['AACZ'],DPC=warm['recipe']['mineralDPC'],
                                                               cold_grid_top=warm['recipe']['coldBeamTop'],
                                                               cold_member_soffit=warm['recipe']['coldBeamSoffitHypothesis']),
                                      receiver_screen=[{'name':r['name'],'N_ULS':r['N_ULS'],'M_ULS':r['M_ULS'],
                                                        'maximum_contact_MPa':r['maxMpa'],
                                                        'status':'Rounded single-node screen; not combined whole-house acceptance'}
                                                       for r in warm['receivers']],
                                      interface='Engineered continuous mineral bearing/DPC with explicit contact, shear, restraint, differential movement and no thermal-bypassing starter assumption',
                                      cold='Connected RC grid supports inner and separately weather-leaf load routes; node depth/size and support sharing follow combined N/M/H/uplit actions',
                                      site='Deep-support G1 leading pre-site hypothesis; raft/piled raft and site-justified alternatives retained',
                                      rejected=['Old 400 pile joint/cage is failed','850/100/100 node load ceiling not re-earned by this ledger','D1800 is member-only cost control, not selected whole-house depth'],
                                      unresolved=['Complete physical slab and wall/external-leaf/ceiling mass and opening head schedule',
                                                  'Corner jack/hip and q450 receiving system; signed ordinary uplift anchors',
                                                  'Actual diaphragm, wall-line distribution, arch thrust, assembled masonry and load combinations',
                                                  'Warm/cold interface contact, force transfer and cap/beam node N-M-H-uplift response',
                                                  'Site ground, water, heave, tree, pile/group and construction data']),
            no_aggregate_adequacy=True)
out = HERE/'whole-house-reaction-join.json'
rendered = json.dumps(result,indent=2,ensure_ascii=False)+'\n'
if '--check' in sys.argv:
    if out.read_text()!=rendered: raise SystemExit('stale whole-house-reaction-join.json')
else:
    out.write_text(rendered)
print(f'whole-house reaction join: {len(walls)} upper-wall rows, {len(floor_edge)} floor edges, '
      f'{len(bridge_seats)} bridge seats; roof {roof["roof_ULS_conserved"]:.3f} kN, '
      f'axis floor {floor["ULS"]:.3f} kN, bridge {bridge_ULS:.3f} kN; no node pass')
