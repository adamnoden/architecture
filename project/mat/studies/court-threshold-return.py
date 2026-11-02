#!/usr/bin/env python3
"""Finite court-door field return: geometry only, not a threshold specification."""
import hashlib,json,sys,subprocess
from pathlib import Path
R=Path(__file__).resolve().parents[3]; O=Path(__file__).resolve().parent
pins={'project/had/studies/open-north-loggia.json':'25faad2c4d40df2b7da7212f73808843a88d2f52','project/mat/studies/ground-metal-field.json':'3c07f8b20bad17b46d27f1cbb9af27a5a14cdfc0','project/str/studies/open-loggia-support.json':'20dec4384d09a0d02075fdd34a247e775532763b','project/mat/studies/warm-receiving-grid.json':'a5bff9f37b8d78dfb32359427314b4013fe8a45e'}
data={}
for p,want in pins.items():
 raw=(R/p).read_bytes(); actual=hashlib.sha1(f'blob {len(raw)}\0'.encode()+raw).hexdigest()
 assert actual==want and subprocess.check_output(['git','rev-parse','HEAD:'+p],cwd=R,text=True).strip()==want,p
 data[p]=json.loads(raw)
h=data['project/had/studies/open-north-loggia.json']
door=next(x for x in h['openings']['GROUND'] if x['id']=='grand-court-entry-south')
assert door['centre']==6000 and door['width']==1800 and h['court']==[4250,4250,3500,3500]
assert h['sections']['groundFloorRC']=={'top':-180,'bottom':-380}
# 40 mm jamb wings are a geometrical trial, not selected bearing or weld width.
opening=[door['centre']-door['width']/2,door['centre']+door['width']/2]
wing=40; x=[opening[0]-wing,opening[1]+wing]; y=[3987.5,4250]; width=x[1]-x[0]; run=y[1]-y[0]
assert width==1880 and run==262.5
grid=data['project/str/studies/open-loggia-support.json']['lower_grid']
route=next(r for r in grid['actual_routes'] if r[0]=='court-S')
assert route==['court-S',[3950,3950],[8050,3950],600] and grid['top']==-180 and grid['bottom']==-630
assert 3650 <= y[0] and y[1] <= 4250 and 3950 <= x[0] and x[1] <= 8050
warm=data['project/mat/studies/warm-receiving-grid.json']['recipe']
assert warm['mineralDPC']==[-765,-615] and warm['AACZ']==[-605,-390]
assert x[0]>3950 and x[1]<8050 # both local side closures would remain within the beam length
assert [r[0] for r in grid['actual_routes'] if r[0] in ('court-W','court-E')]==['court-W','court-E']
slab_top=-180; ffl=0; field_top=-380
out={'source_git_blobs':pins,'opening_x_mm':opening,'trial_jamb_wing_each_mm':wing,'trial_return_x_mm':x,'trial_return_y_mm':y,'field_top_mm':field_top,'trial_termination_at_slab_top_mm':slab_top,'ffl_mm':ffl,'shortfall_to_FFL_mm':ffl-slab_top,'vertical_height_to_slab_top_mm':slab_top-field_top,'vertical_height_to_FFL_mm':ffl-field_top,'horizontal_gross_area_m2':width*run/1e6,'vertical_to_FFL_gross_area_m2':width*(ffl-field_top)/1e6,'horizontal_plus_vertical_gross_area_m2':width*(run+ffl-field_top)/1e6,'historical_STR_court_S_comparator':{'x_bounds_mm':[3950,8050],'y_bounds_mm':[3650,4250],'z_bounds_mm':[-630,-180],'decision':'The whole trial horizontal return overlaps the historical concrete comparator if both are unchanged. The comparator and newer HAD/cold-grid datums are not reconciled; no selected beam is asserted.'},'below_receiver_wrap_control':{'sheet_z_mm':[-631,-630],'drop_from_field_top_mm':250,'sheet_bottom_depth_from_field_top_mm':251,'DPC_bottom_remaining_mm':134,'DPC_top_remaining_mm':15,'isolated_closures_x_mm':x,'court_axis_branches':['court-W','court-E'],'decision':'A width-limited wrap under court-S must close at x5060 and 6940, both inside the 3950..8050 beam. Those ends cross its concrete if the adjacent field remains at -380. A complete receiver/node routing or source reconciliation is required.'},'scope':'Trial dimensions only: no frame location, sill, bearing, drainage, actual sheet support, watertight join, accessibility or buildability is established.'}
svg='''<svg xmlns="http://www.w3.org/2000/svg" width="960" height="560" viewBox="0 0 960 560"><rect width="100%" height="100%" fill="white"/><g font-family="sans-serif"><text x="25" y="32" font-size="21">South court doorway — threshold return trial</text><text x="25" y="57" font-size="14">Schematic section; not to scale. Numeric source coordinates govern.</text><rect x="40" y="260" width="335" height="125" fill="#d9d9d9"/><text x="60" y="315" font-size="16">HAD RC200 candidate</text><text x="60" y="338" font-size="14">top −180 / soffit −380</text><line x1="40" y1="385" x2="675" y2="385" stroke="#2667a3" stroke-width="6"/><line x1="675" y1="385" x2="675" y2="260" stroke="#2667a3" stroke-width="6"/><line x1="675" y1="260" x2="675" y2="145" stroke="#c36b18" stroke-width="5" stroke-dasharray="8 6"/><line x1="40" y1="145" x2="895" y2="145" stroke="#777" stroke-dasharray="6 5"/><text x="700" y="150" font-size="15">FFL 0; actual sill unknown</text><text x="700" y="255" font-size="15">Slab top −180</text><text x="700" y="310" font-size="15">180 mm to FFL</text><text x="700" y="389" font-size="15">Field top −380</text><text x="390" y="430" font-size="15">y3987.5 → y4250: 262.5 mm</text><text x="390" y="454" font-size="15">Trial width 1880: 1800 opening + 40 wings</text><text x="40" y="510" font-size="15" fill="#a01818">Historical STR court-S comparator encloses the return: datum conflict, no selected beam.</text></g></svg>\n'''
outputs={O/'court-threshold-return.json':json.dumps(out,indent=2)+'\n',O/'court-threshold-return.svg':svg}
if '--check' in sys.argv:
 for p,s in outputs.items(): assert p.read_text()==s,p
 print('Court threshold return: outputs reproduce')
else:
 for p,s in outputs.items(): p.write_text(s)
 print('Wrote threshold geometry and schematic')
