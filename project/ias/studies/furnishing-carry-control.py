"""PROJECT conditional carrying control; NOT a furnishing/crew/repair admission.
Optional external Shapely2.1.2; no repository dependency or maintained test suite.
Owning WIP: ../ias-03-modular-furnishing-handoff.md.
"""
import json,math,hashlib
from pathlib import Path
from shapely.geometry import box,Point,LineString
from shapely.ops import unary_union
p=Path(__file__).resolve().parents[2]/'had/studies/water-replan.json';b=p.read_bytes();assert hashlib.sha1(f'blob {len(b)}\0'.encode()+b).hexdigest()=='f7324121f59cc5f1707ea47640dd2b20c26b9bbb'
m=json.loads(b)['model'];assert len(m['groundFurniture'])==38
rs={k:tuple(r) for k,r in m['groundFurniture'].items()}
for k,r in m['fixedObstacles']['GROUND']:
 x,y,w,h=r;g=18 if k.startswith('wetBeam')else 0;rs[k]=(x-g,y-g,w+2*g,h+2*g)
rs['stair']=tuple(m['stair'])
assert m['court']==[4250,4250,3500,3500] and m['envelope']==429.5
x,y,w,h=m['court']; e=m['envelope']; rs['COURT AND COMPLETE WEATHER ENCLOSURE']=(x-e,y-e,w+2*e,h+2*e)
# Entire courtyard excluded: no missing inherited enclosure, cover or outdoor shortcut.
# FIRST-floor void is not a ground hole.
for w in m['groundWalls']:
 a,z=w['a'],w['b'];v=a[0]==z[0];lo=min(a[1]if v else a[0],z[1]if v else z[0]);hi=max(a[1]if v else a[0],z[1]if v else z[0]);f=w.get('finishedFaces',[a[0 if v else 1]-w['t']/2,a[0 if v else 1]+w['t']/2]);cur=lo
 for i,(l,r)in enumerate(sorted(w.get('holes',[]))+[[hi,hi]]):
  if w['id']=='rear-west' and l!=hi:l+=27;r-=27
  if l>cur:rs[f"wall:{w['id']}:{i}"]=(f[0],cur,f[1]-f[0],l-cur)if v else(cur,f[0],l-cur,f[1]-f[0])
  cur=max(cur,r)
# Budgeted protected openings, preserving source OPEN leaves as separate solids.
for door in m['protectedRoute']['doors']:
 if door['id']not in {'FD-WEST-CROSS','FD-EAST-CROSS'}:continue
 l,r=door['rough'];frame=door['frameEach'];a=l+frame;z=door['open'][0];c=(a+z)/2;half=door['minimumClearBudget']/2;y=door['axis']
 rs[door['id']+' trimL']=(l,y-150,c-half-l,300)
 rs[door['id']+' trimR']=(c+half,y-150,r-c-half,300)
 rs[door['id']+' leaf']=tuple(door['open'])
# Whole indoor bounding territory; never an outdoor/entrance-void detour.
rs.update({'W':(-10000,0,10429.5,12000),'E':(11570.5,0,10000,12000),'S':(0,-10000,12000,10429.5),'N':(0,11564.5,12000,10000)})
# Final park is not walked through; crew approaches its west side.
park=(9900,10000,950,900);rs['final park']=park
obs=unary_union([box(x,y,x+w,y+h)for x,y,w,h in rs.values()]);radius=350
start=(3500,9350);goal=(9000,8750)
def free(p):return obs.distance(Point(p))>=radius and not obs.contains(Point(p))
def edge(a,b):return obs.distance(LineString([a,b]))>=radius and not obs.intersects(LineString([a,b]))
assert free(start) and free(goal)
# Retain one explicit path, not the private finite-search machinery.
path=[(3500,9350),(3450,7375),(3400,4025),(3500,3650),(3600,3525),(3825,3450),(8225,3450),(8425,3550),(8525,3700),(8650,4125),(8800,8550),(8900,8675),(9000,8750)]
for a,b in zip(path,path[1:]):assert edge(a,b),(a,b)
print("Conditional indoor carrying path",sum(math.dist(a,b)for a,b in zip(path,path[1:])),"mm")
print("Minimum path gap",min(obs.distance(LineString([a,b]))-325 for a,b in zip(path,path[1:])))
# Same480x300 person; actual proposed parts, not a reduced human proxy.
profiles={"clothed body":(-150,-240,300,480),"sideframe":(175,-175,95,350),"half deck":(175,-225,40,450),"crossrail":(175,-47.5,45,95),"soft pad":(150,-200,100,400),"table packet":(175,-150,45,300)}
for k,(x,y,w,h)in profiles.items():
 assert max(math.hypot(u,v)for u in(x,x+w)for v in(y,y+h))<=325,k
# A450-wide100-thick pad is NOT inside this R325 contract.
assert math.hypot(250,225)>325
# Rotate inside the certified circle at9000/8750, then walk EAST.
assert free(path[-1])
def east_facing_translation(a,b):
 for k,(x,y,w,h)in profiles.items():
  swept=box(min(a[0],b[0])+x,min(a[1],b[1])+y,max(a[0],b[0])+x+w,max(a[1],b[1])+y+h)
  assert not obs.intersects(swept) and obs.distance(swept)>=25,(k,a,b,obs.distance(swept))
east_facing_translation((9000,8750),(10375,8750))
# Forty northward while still facing east; actual ordinary lateral step is a qualification duty.
east_facing_translation((10375,8750),(10375,8790))
assert free((10375,8790)) # rotation to north stays within R325
assert edge((10375,8790),(10375,9630))
# Negative control: the discarded private shortcut crossed the court enclosure.
court=box(*[rs['COURT AND COMPLETE WEATHER ENCLOSURE'][i] for i in (0,1)],rs['COURT AND COMPLETE WEATHER ENCLOSURE'][0]+rs['COURT AND COMPLETE WEATHER ENCLOSURE'][2],rs['COURT AND COMPLETE WEATHER ENCLOSURE'][1]+rs['COURT AND COMPLETE WEATHER ENCLOSURE'][3])
assert court.intersects(LineString([(4200,7400),(7825,7400)]))
# Park itself clears every source fixture/wall; no relocated dining chair/table.
P=box(park[0],park[1],park[0]+park[2],park[1]+park[3])
for k,(x,y,w,h)in rs.items():
 if k=='final park':continue
 O=box(x,y,x+w,y+h);assert not P.intersects(O) and P.distance(O)>=25,(k,P.distance(O))
print("Held-part vertices <=R325; original450 soft-pad negative retained; oriented dining passage and park clear >=25")
print("ALL38 ordinary furniture retained; full court excluded; protected leaves assumed OPEN, not an operation proof")
print("No actual furnishing product, first release, storage handling, rolling lift, whole repair or physical admission")
