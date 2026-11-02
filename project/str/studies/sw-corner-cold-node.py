"""Conditional SW cold-node replan; invoked by sw-corner-station.py.

Geometry is a development challenger, not member, anchorage or site approval.
All clearances include 0.1 mm numerical discretisation allowance only.
"""
import math

def segdist(p0,p1,q0,q1):
 sub=lambda a,b:tuple(x-y for x,y in zip(a,b));dot=lambda a,b:sum(x*y for x,y in zip(a,b));u=sub(p1,p0);v=sub(q1,q0);w=sub(p0,q0);a=dot(u,u);b=dot(u,v);c=dot(v,v);d=dot(u,w);e=dot(v,w)
 def at(t,z):return math.dist(tuple(p0[i]+t*u[i] for i in range(3)),tuple(q0[i]+z*v[i] for i in range(3)))
 vals=[at(0,max(0,min(1,e/c))),at(1,max(0,min(1,(e+b)/c))),at(max(0,min(1,-d/a)),0),at(max(0,min(1,(b-d)/a)),1)];det=a*c-b*b
 if det>1e-10:
  t=(b*e-c*d)/det;z=(a*e-b*d)/det
  if 0<=t<=1 and 0<=z<=1:vals.append(at(t,z))
 return min(vals)
def clear(a,b):
 best=1e9
 for p,q in zip(a['points'],a['points'][1:]):
  for r,t in zip(b['points'],b['points'][1:]):
   lb=math.sqrt(sum(max(min(p[i],q[i])-max(r[i],t[i]),min(r[i],t[i])-max(p[i],q[i]),0)**2 for i in range(3)))
   if lb<best:best=min(best,segdist(p,q,r,t))
 return best-(a['dia']+b['dia'])/2-.1
def minimum(A,B):
 v,a,b=min((clear(a,b),a['id'],b['id']) for a in A for b in B);return {'clear_mm':v,'a':a,'b':b}
def within(A):
 v,a,b=min((clear(a,b),a['id'],b['id']) for i,a in enumerate(A) for b in A[i+1:]);return {'clear_mm':v,'a':a,'b':b}
# Finite cylinders, any cardinal axis, exact point distance; distance along a
# segment is convex. Golden-section minimization and endpoints bound it.
def headseg(h,a,b,dia):
 axis=h['axis'];other=[k for k in range(3) if k!=axis];c=h['center'];D=[b[k]-a[k] for k in range(3)]
 def f(t):
  p=[a[k]+D[k]*t for k in range(3)];rad=max(math.hypot(p[other[0]]-c[other[0]],p[other[1]]-c[other[1]])-h['radius'],0);ax=max(abs(p[axis]-c[axis])-h['thick']/2,0);return math.hypot(rad,ax)
 lo=0.;hi=1.;g=(math.sqrt(5)-1)/2;x=hi-g*(hi-lo);y=lo+g*(hi-lo);fx=f(x);fy=f(y)
 for _ in range(80):
  if fx<fy:hi=y;y=x;fy=fx;x=hi-g*(hi-lo);fx=f(x)
  else:lo=x;x=y;fx=fy;y=lo+g*(hi-lo);fy=f(y)
 return min(f(0),f(1),fx,fy)-dia/2-.1
def headbars(H,B,own=False):
 vals=[]
 for h in H:
  for b in B:
   if own and h['owner']==b.get('owner'):continue
   for a,z in zip(b['points'],b['points'][1:]):vals.append((headseg(h,a,z,b['dia']),h['id'],b['id']))
 v,a,b=min(vals);return {'clear_mm':v,'a':a,'b':b}
def headhead(H):
 vals=[]
 for i,a in enumerate(H):
  for b in H[i+1:]:
   # All head axes in this candidate are vertical.
   rad=max(math.hypot(a['center'][0]-b['center'][0],a['center'][1]-b['center'][1])-a['radius']-b['radius'],0)
   dz=max(abs(a['center'][2]-b['center'][2])-(a['thick']+b['thick'])/2,0)
   vals.append((math.hypot(rad,dz)-.1,a['id'],b['id']))
 v,a,b=min(vals);return {'clear_mm':v,'a':a,'b':b}
def corner_bar(q,r,d,z,name):
 pts=[(2050,q,z),(q+r,q,z)]
 for i in range(1,46):
  a=math.pi*i/90;pts.append((q+r-r*math.sin(a),q+r-r*math.cos(a),z))
 pts.append((q,2050,z));return {'id':name,'dia':d,'points':pts,'inside_mandrel_mm':2*r-d}
# Source explicitly names the SW pile axes and the two actual E/N arms.
axes=roof['cap']['pile_vertical_bar_centres'];assert len(axes)==8
legacy=roof['cap']['named_starter_profiles'][0];assert legacy['id']=='SW-regular' and legacy['actual_arms'][0][1]=='E' and legacy['actual_arms'][1][1]=='N'
assert roof['cap']['specified_pile_head_diameter']==400 and roof['cap']['terminal_corner_mandrel']==330
piles=[];rods=[];heads=[];necks=[]
for i,(ox,oy) in enumerate(axes):
 # Outset to fit catalogue heads: a changed 420 mm pile trial, not old pile.
 scale=147/math.hypot(ox-300,oy-300);x=300+(ox-300)*scale;y=300+(oy-300)*scale;z=-1045 if i%2==0 else -1100;owner=f'P{i+1}'
 piles.append({'id':owner,'owner':owner,'dia':25,'points':[(x,y,-2575),(x,y,z)]})
 heads.append({'id':f'PH{i+1}','owner':owner,'axis':2,'center':(x,y,z),'radius':42.5,'thick':25})
 # Conservative full cylindrical M30 threaded preparation beyond bearing head.
 necks.append({'id':f'PN{i+1}','owner':owner,'dia':30,'points':[(x,y,z-12.5-29),(x,y,z-12.5)]})
for i,(x,y) in enumerate(patch):
 owner=f'R{i+1}';rods.append({'id':owner,'owner':owner,'dia':20,'points':[(x,y,-990),(x,y,6410)]})
 heads.append({'id':f'AH{i+1}','owner':owner,'axis':2,'center':(x,y,-990),'radius':32.5,'thick':20})
 necks.append({'id':f'RN{i+1}','owner':owner,'dia':24,'points':[(x,y,-980),(x,y,-956)]})
# Retain the preceding rejected translated source starter, rather than
# silently converting its failed geometry into a new pile capacity claim.
old_starters=[{'id':b['id'],'dia':b['dia'],'points':[(x,y,z-585) for x,y,z in b['points']]} for b in legacy['starters']]
old_translated_clear=minimum(old_starters,rods)
assert old_translated_clear['clear_mm']<22
bottom=[corner_bar(q,181,32,-1200,f'B{q}') for q in (100,385,540)]
top=[corner_bar(q,175,20,-870,f'T{q}') for q in (80,210,520)]
def rounded_hoop(z):
 # Trial Ø8 closed tie, inside bend diameter 32 mm (centre radius 20).
 # Closure is a candidate butt weld on the southern straight; actual weld
 # procedure, steel weldability and confinement resistance remain open.
 pts=[(300,-6,z),(713,-6,z)]
 for cx,cy,start in ((713,14,-90),(713,713,0),(14,713,90),(14,14,180)):
  first=(cx+20*math.cos(math.radians(start)),cy+20*math.sin(math.radians(start)),z)
  if math.dist(pts[-1],first)>1e-8:pts.append(first)
  for i in range(1,19):
   t=math.radians(start+5*i);pts.append((cx+20*math.cos(t),cy+20*math.sin(t),z))
 pts.append((300,-6,z))
 return {'id':f'L{z}','dia':8,'points':pts,'inside_bend_diameter_mm':32,'closure':'proposed butt weld at (300,-6); weldability, procedure and resistance unqualified'}
hoops=[rounded_hoop(z) for z in (-856,-920,-970,-1030,-1100,-1180)]
checks={}
for name,A,B in [('bottom_pile',bottom,piles),('bottom_hold',bottom,rods),('top_pile',top,piles),('top_hold',top,rods),('bottom_top',bottom,top),('pile_hold',piles,rods),('necks_bottom',necks,bottom),('necks_top',necks,top),('necks_hoops',necks,hoops),('pile_hoops',piles,hoops),('hold_hoops',rods,hoops)]:checks[name]=minimum(A,B)
for name,A in [('bottom_each',bottom),('top_each',top),('pile_each',piles),('hold_each',rods),('hoop_each',hoops)]:checks[name]=within(A)
for name,B in [('heads_piles',piles),('heads_holds',rods),('heads_necks',necks),('heads_bottom',bottom),('heads_top',top),('heads_hoops',hoops)]:checks[name]=headbars(heads,B,True)
checks['heads_each']=headhead(heads)
# Necks versus unrelated pile and hold-down stems; matching owner is intentional.
vals=[(clear(a,b),a['id'],b['id']) for a in necks for b in piles+rods if a['owner']!=b['owner']]
v,a,b=min(vals);checks['necks_other_stems']={'clear_mm':v,'a':a,'b':b}
checks['necks_each']=within(necks)
intentional={('L-856','T80'),('L-856','T210'),('L-856','T520'),('L-1180','B100'),('L-1180','B385'),('L-1180','B540')}
other=[]
for h in hoops:
 for b in bottom+top:
  v=clear(h,b)
  if (h['id'],b['id']) in intentional:assert -.100001<=v<=-.099999
  else:other.append((v,h['id'],b['id']))
v,a,b=min(other);checks['hoops_other_mats']={'clear_mm':v,'a':a,'b':b}
assert min(x['clear_mm'] for x in checks.values())>=22,checks
# Dextra's guide recommends stagger face gap >= max(thickness,20,aggregate+5).
# With 20 mm aggregate, pile-head stagger 55−25 = 30 mm; the near
# hold/pile face gap is 55−(25+20)/2 = 32.5 mm. Placement tolerance is open.
assert 55-25>=25 and 55-(25+20)/2>=25
# Actual outer dimensions and cover, exclusive of unknown placing tolerances.
assert 777-(540+181+16)>=40 and 600-(540+16)>=40
assert -1200-16-(-1257)>=40 and -6-4-(-50)>=40
assert 210-147-12.5-8>=40 # proposed Ø8 pile hoop envelope, not qualification
# Radius-181 S transition from −1200 to −1159; soffit −1257 to −1215.
R=181.;X=1000.;rise=41.
def rise_for(a):return 2*R*(1-math.cos(a))+(X-2*R*math.sin(a))*math.tan(a)
lo=0.;hi=.2
for _ in range(80):
 mid=(lo+hi)/2
 if rise_for(mid)<rise:lo=mid
 else:hi=mid
a=(lo+hi)/2;straight=(X-2*R*math.sin(a))/math.cos(a)
# The soffit is linear. First and second circular arcs are bounded by a
# 0.1 mm numerical sample allowance; placement tolerance is not modelled.
samples=[]
for i in range(1001):
 t=a*i/1000;samples.append((R*math.sin(t),R*(1-math.cos(t))))
for i in range(1001):
 t=straight*i/1000;samples.append((R*math.sin(a)+t*math.cos(a),R*(1-math.cos(a))+t*math.sin(a)))
x0=R*math.sin(a)+straight*math.cos(a);z0=R*(1-math.cos(a))+straight*math.sin(a)
for i in range(1001):
 t=a*i/1000;samples.append((x0+R*(math.sin(a)-math.sin(a-t)),z0+R*(math.cos(a-t)-math.cos(a))))
cover=min((-1200+z-16)-(-1257+42*x/1000) for x,z in samples);assert cover>=39.999
new=.827**2*.492+2*(2.05-.777)*.6*.492+2*.6*(.492+.45)/2
old=.6**2*.45+2*(3.05-.6)*.6*.45
cold_cage={'status':'preferred development challenger; not structural or site acceptance','node_xy_mm':[-50,-50,777,777],'node_z_mm':[-1257,-765],'pile_nominal_diameter_mm':420,'old_pile_diameter_mm':400,'pile_axes_radius_mm':147,'old_pile_axes':axes,'rejected_legacy_translated_starter_clearance':old_translated_clear,'pile_bars':piles,'hold_bars':rods,'heads':heads,'thread_envelopes':necks,'bottom_corner_returns':bottom,'top_corner_returns':top,'node_hoops':hoops,'intended_hoop_contacts':sorted(intentional),'clearance_checks':checks,'numerical_allowance_mm':.1,'placement_tolerance_mm':'not included','manufacturer_stagger_face_gap_mm':{'pile_to_pile':30,'pile_to_hold':32.5,'comparison_assuming_20mm_aggregate':25},'cover':{'node_bend_min_mm':777-(540+181+16),'node_hoop_mm':40,'local_arm_bottom_mm':41,'original_arm_after_transition_mm':40,'pile_hoop_envelope_mm':210-147-12.5-8},'arm_transition':{'range_mm':[2050,3050],'steel_z_mm':[-1200,-1159],'soffit_z_mm':[-1257,-1215],'radius_mm':R,'angle_degrees':math.degrees(a),'straight_mm':straight,'sampled_min_cover_mm':cover,'scope':'Both 600-wide E/N arms. Continuation beyond 3050 and other nodes are not detailed.'},'concrete_comparison':{'scope':'Union of local node and two E/N arms from node to coordinate 3050, excluding pile and all other intersections','old_m3':old,'candidate_m3':new,'difference_m3':new-old,'difference_G_kN_at_25':25*(new-old),'pile_added_cross_section_m2':math.pi*(.42**2-.4**2)/4,'pile_length':'not selected'},'sourcing':{'manufacturer':'Dextra BARTEC-FORTEC BFEAL25 and BFEAL20, B500B/B500C, static/quasi-static only','ETA':'https://www.dextragroup.com/wp-content/uploads/2024/09/Product-Bartec-Fortec-Headed-bars-ETA-24-0219-2-July-2024-en.pdf','catalogue':'https://www.dextragroup.com/wp-content/uploads/2023/12/Dextra-Bartec-Datasheet-PDS-002-Rev.17_es.pdf','design_guide':'https://www.dextragroup.com/?direct_download=1&file_id=44086&lang=en','meaning':'Product assessment is not node, pile, compression, fatigue, seismic, or site acceptance.'},'force_scope':'The inherited signed roof control and partial two-face resultant are non-additive; neither defines whole-house signed node demand. No arbitrary full-bar-yield requirement is asserted. Actual biaxial and vertical load paths, group interaction, anchorage and pile/arm transfer remain open.','holds':['head stress-spread and confinement including staggered and orthogonal interactions','actual signed whole-house gravity, uplift, lateral and diaphragm actions','head compression transfer, thread preparation and placement tolerances','actual hoop weld/closure, weldability and arm confinement reinforcement','pile cutoff, reinforced section, ground capacity and site interface','arm continuation beyond coordinate 3050 and adjacent-node connection','thermal, drainage, gas and moisture reconciliation with MAT']}
