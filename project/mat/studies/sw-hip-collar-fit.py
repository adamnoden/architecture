#!/usr/bin/env python3
"""Reproduce the idealised SW hip/sheet fit; this is not a fabrication model."""
import hashlib, json, math, subprocess, sys
from pathlib import Path
R = Path(__file__).resolve().parents[3]
O = Path(__file__).resolve().parent
pins = {
 'project/str/studies/sw-corner-station.json': '2c215912f4b55ca4587e32763bf66160d4b433d0',
 'project/mat/studies/ground-metal-field.json': '3c07f8b20bad17b46d27f1cbb9af27a5a14cdfc0',
}
def blob(raw):
 return hashlib.sha1(f'blob {len(raw)}\0'.encode()+raw).hexdigest()
sources = {}
for path, expected in pins.items():
 raw=(R/path).read_bytes()
 assert blob(raw)==expected and subprocess.check_output(['git','rev-parse','HEAD:'+path],cwd=R,text=True).strip()==expected, path
 sources[path]=json.loads(raw)
hip=sources['project/str/studies/sw-corner-station.json']['finite_roof_candidate']['hip']
assert hip['primary_SHS_mm']==[120,120,6.3] and hip['outer_seat_xy_mm']==[332.5,332.5]
theta=math.atan(math.tan(math.radians(25))/math.sqrt(2))
assert math.isclose(math.degrees(theta),hip['hip_section_angle_degrees'])
q=262.5
zc=hip['outer_centre_z_mm']+(q-332.5)*math.tan(math.radians(25))
def cut(half):
 u=half*math.sqrt(2); dz=half/math.cos(theta); rise=u*math.tan(math.radians(25))/2
 return [[0,zc-dz],[u,zc+rise-dz],[u,zc+rise+dz],[0,zc+dz]]
steel=cut(60); sleeve=cut(65)
# 40 mm in-plane margins on the sleeve cut's axis-aligned bounds are a
# simple envelope, not a manufacturable fillet or claimed weld detail.
margin=40
bounds=[-margin, min(p[1] for p in sleeve)-margin, max(p[0] for p in sleeve)+margin, max(p[1] for p in sleeve)+margin]
clear_bottom=bounds[1]-6410
assert 0<clear_bottom<1 and math.isclose(zc,6519.079552999668)
data={'source_git_blobs':pins,'scope':'Ideal infinite-member section only; not a fabrication pattern, weld, movement, air/gas, fire or structural pass.',
 'coordinate_convention':'x east, y north, z up; u increases from (262.5,262.5) on either sheet face',
 'hip_centre_z_at_common_corner_mm':zc,'bare_hip_face_polygon_u_z_mm':steel,
 'trial_sleeve':'Concentric square 130 mm internal envelope around bare 120 mm SHS; 5 mm nominal per-side radial clearance. Actual wall thickness, end closures and assembly unresolved.',
 'sleeve_envelope_face_polygon_u_z_mm':sleeve,'trial_flange_bounding_margin_mm':margin,'trial_flange_axis_bounds_u_z_mm':bounds,
 'lower_margin_above_sheet_start_6410_mm':clear_bottom,'upper_margin_below_sheet_end_6660_mm':6660-bounds[3],
 'decision':'40 mm bounding flange on the 5 mm clear sleeve leaves less than 1 mm to the assumed +6410 sheet start; reject this arrangement as a credible untoleranced fabrication fit. A change of geometry and full load, movement, seal and installation design are required.'}
jsonout=json.dumps(data,indent=2)+'\n'
# Elevation is schematic; values and polygon geometry are the numerical authority.
def xy(p): return f'{100+p[0]*2:.2f},{500-(p[1]-6400)*1.4:.2f}'
def poly(p): return ' '.join(map(xy,p))
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="820" height="580" viewBox="0 0 820 580"><rect width="100%" height="100%" fill="white"/><text x="30" y="32" font-family="sans-serif" font-size="20">SW hip collar trial — face section, schematic</text><text x="30" y="56" font-family="sans-serif" font-size="14">Ideal member only; flange outline is a bounding rectangle, not a fabrication pattern</text><line x1="100" y1="{500-(6410-6400)*1.4:.2f}" x2="410" y2="{500-(6410-6400)*1.4:.2f}" stroke="#555" stroke-dasharray="5 4"/><line x1="100" y1="{500-(6660-6400)*1.4:.2f}" x2="410" y2="{500-(6660-6400)*1.4:.2f}" stroke="#555" stroke-dasharray="5 4"/><polygon points="{poly([[bounds[0],bounds[1]],[bounds[2],bounds[1]],[bounds[2],bounds[3]],[bounds[0],bounds[3]]])}" fill="#faf2c5" stroke="#b38300"/><polygon points="{poly(sleeve)}" fill="#e7efff" stroke="#315ea9" stroke-width="2"/><polygon points="{poly(steel)}" fill="#9bacc3" stroke="#20354e" stroke-width="2"/><text x="430" y="132" font-family="sans-serif" font-size="15">Sheet top +6660</text><text x="430" y="175" font-family="sans-serif" font-size="15">40 mm bound around sleeve cut</text><text x="430" y="210" font-family="sans-serif" font-size="15">130 mm internal sleeve envelope</text><text x="430" y="245" font-family="sans-serif" font-size="15">120 mm bare hip</text><text x="430" y="462" font-family="sans-serif" font-size="15">Sheet starts +6410</text><text x="30" y="550" font-family="sans-serif" font-size="15" fill="#a01818">Bottom margin {clear_bottom:.3f} mm: no tolerance, weld or assembly acceptance</text></svg>\n'''
outputs={O/'sw-hip-collar-fit.json':jsonout,O/'sw-hip-collar-fit.svg':svg}
if '--check' in sys.argv:
 for p,v in outputs.items(): assert p.read_text()==v,p
 print('SW hip collar fit: outputs reproduce')
else:
 for p,v in outputs.items(): p.write_text(v)
 print('Wrote',', '.join(str(p) for p in outputs))
