"""Exact rectangular-cell topological check of private room boundaries.

Furniture, stair and entrance-void reservations cannot conceal a wall-end gap.
The graph is continuous point topology, not a person/door-clearance model.
"""
from pathlib import Path
from collections import deque
import copy,json
OUT=Path(__file__).resolve().parent

import sys, io, tempfile, hashlib
def emit(name, data):
    target = OUT / name
    if '--check' in sys.argv:
        if target.read_text() != data:
            raise SystemExit('STALE: ' + str(target))
    else:
        target.write_text(data)
def emit_svg(fig, name):
    buffer = io.StringIO()
    fig.savefig(buffer, format='svg', metadata={'Date': '2026-10-30'})
    emit(name, buffer.getvalue())
def preview(fig, name):
    if '--preview' in sys.argv:
        fig.savefig(Path(tempfile.gettempdir()) / name, dpi=170)

d=json.loads((OUT/'house-plan.json').read_text())
E=417.5
envelope=[(0,0,12000,E),(0,12000-E,12000,E),(0,0,E,12000),(12000-E,0,E,12000),(3832.5,3832.5,4335,4335)]

def wall_rects(ws):
    rs=[]
    for w in ws:
        x,y=w['a'];xx,yy=w['b'];hor=y==yy;lo=x if hor else y;hi=xx if hor else yy;at=y if hor else x
        cuts=sorted({lo,hi,*[v for h in w['holes'] for v in h if lo<=v<=hi]})
        for a,b in zip(cuts,cuts[1:]):
            if b<=a or any(a>=p and b<=q for p,q in w['holes']):continue
            rs.append((a,at-w['t']/2,b-a,w['t'])if hor else(at-w['t']/2,a,w['t'],b-a))
    return rs

def turns(path):
    if len(path)<3:return path
    return [path[0]]+[b for a,b,c in zip(path,path[1:],path[2:]) if (b[0]-a[0])*(c[1]-b[1])!=(b[1]-a[1])*(c[0]-b[0])]+[path[-1]]

def component(ws,origin,target=(6000,3250)):
    rs=envelope+wall_rects(ws)
    xs=sorted({0,12000,*[v for r in rs for v in (r[0],r[0]+r[2])]})
    ys=sorted({0,12000,*[v for r in rs for v in (r[1],r[1]+r[3])]})
    def inside(p,r):return r[0]<p[0]<r[0]+r[2]and r[1]<p[1]<r[1]+r[3]
    free={}
    for i,(a,b)in enumerate(zip(xs,xs[1:])):
        for j,(c,e)in enumerate(zip(ys,ys[1:])):
            p=((a+b)/2,(c+e)/2)
            if not any(inside(p,r)for r in rs):free[(i,j)]=p
    def cell(p):
        return next((ij for ij in free if xs[ij[0]]<=p[0]<=xs[ij[0]+1]and ys[ij[1]]<=p[1]<=ys[ij[1]+1]),None)
    start=cell(origin);end=cell(target)
    assert start is not None and end is not None,(origin,target)
    parent={start:None};q=deque([start])
    while q:
        i,j=q.popleft()
        for n in[(i-1,j),(i+1,j),(i,j-1),(i,j+1)]:
            if n in free and n not in parent:parent[n]=(i,j);q.append(n)
    area=sum((xs[i+1]-xs[i])*(ys[j+1]-ys[j])for i,j in parent)/1e6
    path=None
    if end in parent:
        path=[];at=end
        while at is not None:path.append(list(free[at]));at=parent[at]
        path=turns(path[::-1])
    return {'reaches_shared_hall':end in parent,'component_floor_area_m2_including_open_thresholds':area,'point_path_turns':path}

def close(ws,wall,hole):
    ws=copy.deepcopy(ws);w=next(w for w in ws if w['id']==wall)
    assert hole in w['holes'],(wall,hole,w['holes'])
    w['holes'].remove(hole);return ws

checks=[
 ('Bed2','first_walls','bed2-north-main',[3450,4350],(3600,2100)),
 ('Bed3','first_walls','bed3-north-main',[8250,9150],(8500,2100)),
 ('Bed4 with own ensuite','first_walls','rear-west',[3100,4000],(6000,9200)),
 ('Principal with own ensuite','first_walls','rear-east',[8250,9150],(8500,9000)),
 ('Rear ensuite','first_walls','rear-wet-east',[10350,11250],(1500,10000)),
 ('Principal ensuite','first_walls','rear-east',[10450,11350],(10500,7000)),
 ('Family bathroom','first_walls','wet-spine',[5450,6350],(10500,5000)),
 ('Guest WC','ground_walls','wc-north',[7650,8550],(8100,1700)),
 ('Utility from plant vestibule','ground_walls','utility-north',[10250,11150],(10600,1800)),
 ('Pantry','ground_walls','rear-east',[10450,11350],(10500,7400)),
 ('Study','ground_walls','study-L-north',[1350,2250],(2000,2000))
]
result=[]
for name,key,wall,hole,p in checks:
    op=component(d[key],p)
    closed=component(close(d[key],wall,hole),p)
    result.append({'space':name,'sole_shared_hall_opening':{'wall':wall,'interval':hole},'open_reaches_hall':op['reaches_shared_hall'],'closed_reaches_hall':closed['reaches_shared_hall'],'enclosure_earned':op['reaches_shared_hall']and not closed['reaches_shared_hall'],'closed_component_area_m2':closed['component_floor_area_m2_including_open_thresholds']})

old=copy.deepcopy(d['first_walls']);old=[w for w in old if w['id']!='rear-west-return']
next(w for w in old if w['id']=='rear-west')['b'][0]=4250
negative=component(close(old,'rear-west',[3100,4000]),(6000,9200))
assert negative['reaches_shared_hall'],'The old600 bypass must remain an adverse control.'
assert all(r['enclosure_earned']for r in result),result
out={'basis':'Exact axis-aligned cell decomposition at every finite wall face/end. Only cells sharing a positive-length edge connect. Door closure fills its actual wall thickness. No furniture or stair/void polygon is allowed to substitute for an enclosing wall.',
 'limits':'Continuous point connectivity establishes wall topology, not passage width, privacy performance, actual door/frame closure, accessible use, guarding or fire safety. External windows/doors are treated closed as envelope boundaries.',
 'checks':result,'old_rear_wall_without_return_control':negative,
 'utility_access_change':'The source WC-to-utility opening on the service spine is closed. A separate900 opening10250–11150 in the utility north wall2550 reaches the plant vestibule. Ground routes check the turn and an explicit open leaf; actual laundry equipment remains unselected.'}
emit('house-enclosure.json',json.dumps(out,indent=2)+'\n')
print(json.dumps({'checks':result,'old_rear_bypass_reaches_hall':negative['reaches_shared_hall']},indent=2))
