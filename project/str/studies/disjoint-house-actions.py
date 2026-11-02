#!/usr/bin/env python3
"""Disjoint trial first-storey core volumes and aligned opening actions.

Rectangular voids/straight cores are explicit design trials, not as-built mass.
"""
import ast,hashlib,json,math,re,sys
from pathlib import Path
R=Path(__file__).resolve().parents[3]
paths=['project/had/studies/open-north-loggia.json','project/had/studies/open-north-loggia.mjs','project/str/studies/physical-slab-join.json','project/str/studies/spine-opening-join.json']
expected=['542781c6bb1d277b20492e8433cea498e98eaea5db2e737a5ec7e9655f9d18fd','d69be48865be9b1471cbe2d6fa31e388214f9c73534622589b981413b3278ba6','9740fa55322013fd642bf33d09fbedcad447e4dd9c3edd390488bf6e41f2f45c','4f747ea2c98a774bb50abf0f3e647ff1c96f029ec4dd81699b86cbc01168872b']
raw=[(R/p).read_bytes() for p in paths]
sha=[hashlib.sha256(x).hexdigest() for x in raw]
assert sha==expected, 'Source changed; re-evaluate geometry: '+str(sha)
h=json.loads(raw[0]); js=raw[1].decode(); slab=json.loads(raw[2]); prior=json.loads(raw[3])
# The generator's eight enclosure axes are consumed and authenticated rather
# than treating the internal groundWalls/upperWalls arrays as the whole shell.
m=re.search(r'const outerDefs=(\[.*?\]);',js); assert m
outer=ast.literal_eval(m.group(1))
assert [x[0] for x in outer]==['outer-south','outer-north','outer-west','outer-east','court-south','court-north','court-west','court-east']
assert outer==[['outer-south',[0,208.75],[12000,208.75]],['outer-north',[0,11791.25],[12000,11791.25]],['outer-west',[208.75,417.5],[208.75,11582.5]],['outer-east',[11791.25,417.5],[11791.25,11582.5]],['court-south',[3832.5,4041.25],[8167.5,4041.25]],['court-north',[3832.5,7958.75],[8167.5,7958.75]],['court-west',[4041.25,4250],[4041.25,7750]],['court-east',[7958.75,4250],[7958.75,7750]]]
assert h['envelope']==429.5 and h['finishRewind']['dry']['total']==27 and h['shell']==12000 and h['court']==[4250,4250,3500,3500]
# Candidate 140 core sits behind the 27 room finish. At each corner the two
# cores are extended/trimmed to meet, an explicit structural trial (not an
# exported HAD polygon). Cavity, facing, wraps and actual arches remain out.
core=140.; finish=27.; env=h['envelope']; shell=h['shell']; c0=h['court'][0]; c1=c0+h['court'][2]
o0=env-finish-core; o1=shell-o0; o_inner=o0+core; o_high=o1-core
c_lo=c0-env+finish; c_hi=c1+env-finish; c_inner_lo=c_lo+core; c_inner_hi=c_hi-core
rects={
'outer-south':[o0,o0,o1,o_inner], 'outer-north':[o0,o_high,o1,o1],
'outer-west':[o0,o_inner,o_inner,o_high], 'outer-east':[o_high,o_inner,o1,o_high],
'court-south':[c_lo,c_lo,c_hi,c_inner_lo], 'court-north':[c_lo,c_inner_hi,c_hi,c_hi],
'court-west':[c_lo,c_inner_lo,c_inner_lo,c_inner_hi], 'court-east':[c_inner_hi,c_inner_lo,c_hi,c_inner_hi]}
# Rectangular apertures use actual source width/sill/head and knowingly remove
# more material than the true segmental opening above its spring. Internal
# 2250 is a declared rectangular trial, not an actual source arch height.
walls=[]
for name,_,_ in outer:
 rect=rects[name]; horiz=name.endswith(('north','south')); holes=[]
 for o in h['openings']['FIRST']:
  if o['wall']!=name: continue
  assert o['kind']=='window' and 'sill' in o and 'head' in o
  holes.append((o['centre']-o['width']/2,o['centre']+o['width']/2,o['sill'],o['head']))
 walls.append({'id':name,'rect':rect,'horizontal':horiz,'holes':holes,'family':'enclosure'})
for w in h['upperWalls']:
 horiz=w['a'][1]==w['b'][1]; assert horiz or w['a'][0]==w['b'][0]
 lo,hi=sorted((w['a'][0 if horiz else 1],w['b'][0 if horiz else 1])); c=w['structuralCore']
 rect=[lo,c[0],hi,c[1]] if horiz else [c[0],lo,c[1],hi]
 walls.append({'id':w['id'],'rect':rect,'horizontal':horiz,'holes':[(a,b,0,2250) for a,b in w['holes']],'family':'internal'})
assert len(walls)==25 and len({w['id'] for w in walls})==25
xs=set();ys=set();zs={0,3100}
for w in walls:
 x0,y0,x1,y1=w['rect'];assert x0<x1 and y0<y1
 xs.update([x0,x1]);ys.update([y0,y1])
 for a,b,z0,z1 in w['holes']:
  (xs if w['horizontal'] else ys).update([a,b]);zs.update([z0,z1])
xs=sorted(xs);ys=sorted(ys);zs=sorted(zs)
vol={w['id']:0. for w in walls}; gross={w['id']:0. for w in walls}
headrows=prior['eight_opening_comparison']['rows']; headvol={r['upper']:0. for r in headrows}; headmom={r['upper']:0. for r in headrows}
# Add head interval cuts so their occurrence allocations have exact plan edges.
for row in headrows:
 w=next(w for w in walls if w['id']==row['upper']); (xs if w['horizontal'] else ys).extend(row['hole_mm'])
xs=sorted(set(xs));ys=sorted(set(ys))
def present(w,x,y,z,cut=True):
 x0,y0,x1,y1=w['rect']
 if not (x0<x<x1 and y0<y<y1):return False
 u=x if w['horizontal'] else y
 return not cut or not any(a<u<b and z0<z<z1 for a,b,z0,z1 in w['holes'])
for x0,x1 in zip(xs,xs[1:]):
 x=(x0+x1)/2
 for y0,y1 in zip(ys,ys[1:]):
  y=(y0+y1)/2
  candidates=[w for w in walls if present(w,x,y,0,False)]
  if not candidates:continue
  area=(x1-x0)*(y1-y0)
  for z0,z1 in zip(zs,zs[1:]):
   z=(z0+z1)/2; hits=[w for w in candidates if present(w,x,y,z)]
   if not hits:continue
   amount=area*(z1-z0)/1e9
   for w in hits:gross[w['id']]+=amount
   owner=hits[0] # enclosure first, then exact source order: intersection once
   vol[owner['id']]+=amount
   for row in headrows:
    if owner['id']!=row['upper']:continue
    u=x if owner['horizontal'] else y
    if row['hole_mm'][0]<u<row['hole_mm'][1]:
     headvol[owner['id']]+=amount; headmom[owner['id']]+=amount*u
assert sum(vol.values())<=sum(gross.values())
rows=[]
for row in headrows:
 floor=sum(x['ULS_kN'] for x in row['included_actions'] if x['field']!='upper-wall-gross')
 wall=headvol[row['upper']]*20*1.35
 # Exact centroid of allocated solid cells and each floor overlap gives the
 # resultant; simple support axes are 100 mm beyond each rough opening.
 transfer=next(t for t in slab['upper_wall_opening_transfers'] if t['upper']==row['upper'] and t['lower']==row['lower'])
 left,right=row['hole_mm'][0]-100,row['hole_mm'][1]+100
 moment=sum(x['ULS_kN']*(sum(x['interval_mm'])/2-left) for x in row['included_actions'] if x['field']!='upper-wall-gross') + (headmom[row['upper']]-left*headvol[row['upper']])*20*1.35
 rr=moment/(right-left); rl=floor+wall-rr
 assert math.isclose(rl+rr,floor+wall,rel_tol=1e-12)
 rows.append({'upper':row['upper'],'lower':row['lower'],'head_interval_mm':row['hole_mm'],'floor_ULS_nonwall_budget_kN':floor,'upper_core_trial_ULS_kN':wall,'sum_kN':floor+wall,'left_trial_ULS_kN':rl,'right_trial_ULS_kN':rr,'left_ground_route':transfer['left_ground_route'],'right_ground_route':transfer['right_ground_route'],'trial_patch_plan_fit':row['patches_within_source_wall_plan']})
result={'status':'disjoint conditional first-storey core and bounded nonwall floor budget; no selected structure or actual takeoff', 'sources':dict(zip(paths,sha)), 'method':{'core_width_mm':140,'room_finish_mm':27,'storey_height_mm':3100,'internal_rectangular_opening_height_mm':2250,'density_kN_m3':20,'enclosure':'Eight axes authenticated from HAD generator; 140 core behind 27 finish, extended/trimmed to meet at corners as a STR trial. FIRST windows use source width, sill and head as rectangular voids; real segmental arches retain additional material.','intersection_owner':'Enclosure first, then HAD upperWalls order; each 3D core cell assigned once. Reordering alters allocation, not union.','floor_budget':'RC200=5 kPa G, plus separate 2.5 kPa maximum for non-wall layers/services/ceiling, explicitly excludes all named wall cores; Q=2 kPa. Actual nonwall build-up must fit budget. Remaining exposed-loggia extra 1 kPa omitted here where not in eight head floor segments. Floor line distribution is an assumption.'}, 'slab_RC200_G_kN':slab['RC200_mass']['physical_gross_slab_G_kN'], 'upper_core_trial_volume_m3':sum(vol.values()),'naive_sum_before_junction_ownership_m3':sum(gross.values()),'per_occurrence_core_volume_m3':vol,'head_actions':rows,'exclusions':'Actual arch geometry, wall finish/weather leaves, enclosure portals at ground, roof/floor support sharing, spandrel/crown/steel/RC substitutions, local slab openings, nonwall material actual mass, site wind, ground grid and foundation mass are not complete. Ground walls and weather leaves remain unquantified. Values are a single trial geometry, not site design, structural adequacy or a total whole-house weight.'}
out=R/'project/str/studies/disjoint-house-actions.json'; text=json.dumps(result,indent=2,sort_keys=True)+'\n'
if '--check' in sys.argv:
 assert out.read_text()==text;print('disjoint trial core union and head actions verified')
else:out.write_text(text);print(json.dumps({'volume':sum(vol.values()),'sum_before_junction':sum(gross.values()),'heads':rows},indent=2))
