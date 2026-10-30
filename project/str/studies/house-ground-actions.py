"""Bounded joined ground routes, occupied dining fields and explicit door controls.
Positive paths verify every whole axis segment. A missing lattice path is not
a proof of continuous-space impossibility. Hard rectangle clashes are separate.
"""
from pathlib import Path
from collections import deque
import json,math
import numpy as np
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
E=417.5;R=300.;STEP=10.

def walls_rects(ws):
    rr=[]
    for w in ws:
        x,y=w['a'];xx,yy=w['b'];hor=y==yy;lo=x if hor else y;hi=xx if hor else yy;at=y if hor else x
        cuts=sorted({lo,hi,*[v for h in w['holes']for v in h if lo<=v<=hi]})
        for a,b in zip(cuts,cuts[1:]):
            if b<=a or any(a>=p and b<=q for p,q in w['holes']):continue
            rr.append((a,at-w['t']/2,b-a,w['t'])if hor else(at-w['t']/2,a,w['t'],b-a))
    return rr
def overlap(a,b):
    w=max(0,min(a[0]+a[2],b[0]+b[2])-max(a[0],b[0]));h=max(0,min(a[1]+a[3],b[1]+b[3])-max(a[1],b[1]));return w*h
def pair(width,y,toward):
    L=width/2
    return [(6000-L-22,y if toward>0 else y-L,44,L),(6000+L-22,y if toward>0 else y-L,44,L)]
def turns(p):
    if len(p)<3:return p
    return[p[0]]+[b for a,b,c in zip(p,p[1:],p[2:])if(b[0]-a[0])*(c[1]-b[1])!=(b[1]-a[1])*(c[0]-b[0])]+[p[-1]]

# A narrow side table replaces the former coffee-table comparison. The second
# sofa faces WEST: its front access is the662.5 strip toward the reading arch.
# The east side is its back, not a second claimed access side.
fields=list(d['occupied_dining_fields'].values())
common=walls_rects(d['ground_walls'])+list(d['ground_objects'].values())+fields+[d['stair'],(3832.5,3832.5,4335,4335),
 (11128,1650,44,900), # new utility north door, high hinge, open south
 (7628,1750,44,900), # guest WC inward door, already coupled separately
 (11328,8290,44,900)] # pantry high-hinge inward kitchen comparison
targets={
 'study-chair-side-approach':(2320,1850),'stair-entry':(2300,4100),
 'utility-room-via-plant':(10600,1800),'plant-vestibule-turn':(9800,3200),
 'plant-water-front':(10500,4300),'plant-riser-front':(10300,5050),'Q350-front':(10900,5900),
 'pantry-shelf-front':(10400,7400),
 'reading-sofa-front':(1700,10500),'reading-stack-south':(900,10480),
 'family-sofa-front-south':(3330,10000),'family-sofa-front-north':(3330,11200),
 'kitchen-sink-front':(9150,10670),'kitchen-cooking-front':(11100,10670),
 'kitchen-prep-south':(9000,9080),'cold-storage-front':(10000,9380),
 'garden-pair-centre':(6000,11250),'dining-east-passage':(6950,9500)
}
xs=np.arange(0,12000+STEP/2,STEP);ys=xs;X,Y=np.meshgrid(xs,ys)
def motion(x1,y1,x2,y2,obs,r=R):
    ok=(np.minimum(x1,x2)>=E+r)&(np.minimum(y1,y2)>=E+r)&(np.maximum(x1,x2)<=12000-E-r)&(np.maximum(y1,y2)<=12000-E-r)
    for x,y,w,h in obs:
        dx=np.maximum(np.maximum(x-np.maximum(x1,x2),np.minimum(x1,x2)-x-w),0)
        dy=np.maximum(np.maximum(y-np.maximum(y1,y2),np.minimum(y1,y2)-y-h),0)
        ok&=dx*dx+dy*dy>=r*r-1e-7
    return ok
def axis_gap(a,b,obs):
    g=min(min(a[0],b[0])-E,min(a[1],b[1])-E,12000-E-max(a[0],b[0]),12000-E-max(a[1],b[1]))-R
    for x,y,w,h in obs:
        dx=max(x-max(a[0],b[0]),min(a[0],b[0])-x-w,0);dy=max(y-max(a[1],b[1]),min(a[1],b[1])-y-h,0)
        g=min(g,math.hypot(dx,dy)-R)
    return g
def run(obs):
    good=motion(X,Y,X,Y,obs);right=motion(X[:,:-1],Y[:,:-1],X[:,1:],Y[:,1:],obs);up=motion(X[:-1,:],Y[:-1,:],X[1:,:],Y[1:,:],obs)
    idx=lambda p:(round(p[1]/STEP),round(p[0]/STEP))
    start=idx((6000,3250));assert good[start]
    parents={start:None};q=deque([start]);pending={idx(p)for p in targets.values()if good[idx(p)]}
    while q and pending:
        row,col=q.popleft();pending.discard((row,col));ns=[]
        if col and right[row,col-1]:ns.append((row,col-1))
        if col+1<len(xs)and right[row,col]:ns.append((row,col+1))
        if row and up[row-1,col]:ns.append((row-1,col))
        if row+1<len(ys)and up[row,col]:ns.append((row+1,col))
        for n in ns:
            if n not in parents:parents[n]=(row,col);q.append(n)
    out={}
    for name,p in targets.items():
        at=idx(p);path=None;clear=None
        if at in parents:
            pp=[]
            while at is not None:pp.append([float(xs[at[1]]),float(ys[at[0]])]);at=parents[at]
            raw=turns(pp[::-1]);path=[raw[0]];i=0
            while i<len(raw)-1:
                a=raw[i];chosen=None
                for j in range(len(raw)-1,i,-1):
                    b=raw[j]
                    for c in[[a[0],b[1]],[b[0],a[1]]]:
                        if bool(motion(*a,*c,obs))and bool(motion(*c,*b,obs)):
                            chosen=(j,c,b);break
                    if chosen:break
                assert chosen
                i,c,b=chosen
                if c!=path[-1]:path.append(c)
                if b!=path[-1]:path.append(b)
            path=turns(path);clear=min(axis_gap(a,b,obs)for a,b in zip(path,path[1:]))
            assert clear>=-1e-7,(name,clear)
        out[name]={'route_found':path is not None,'whole_segment_min_clearance':clear,'turn_points':path}
    return out

controls={}
for width in[2400,1800]:
    leaves=pair(width,8167.5,1)
    clashes=[]
    for i,r in enumerate(leaves):
        for k,v in d['ground_objects'].items():
            a=overlap(r,v)
            if a:clashes.append({'open_leaf':i,'object':k,'overlap_mm2':a})
    controls[f'court_north_{width}_inward_90deg']={'actual_object_clashes':clashes,'failed_by_positive_area_intersection':bool(clashes),'meaning':'A static clash at90deg already rejects this particular whole-open state. Other handing, angle sequences or furniture arrangements remain alternatives.'}

scenarios={}
for width in[2400,1800]:
    obs=common+pair(width,11582.5,-1)
    scenarios[f'garden{width}_inward_court_north_outward']={'garden_width':width,'garden_open_leaves':pair(width,11582.5,-1),'routes':run(obs)}

# A six-place1600 table with end chairs is a separate negative physical field:
# source-sized top at same south datum; end field extends into the garden sweep.
six={'table':[5200,8800,800,1600],'south_end_field':[5300,8200,600,600],'north_end_field':[5300,10400,600,600],
     'meaning':'This adds two end places and a400-longer table. It is not silently substituted for the four-place comparison. Exact leaf sweep, occupied turn and served-seat actions are not earned.'}
out={'basis':'house-plan.json joined B, source envelope held,10mm lattice,600 circle, complete axis-segment verification; no actual chair/person/door hardware selection.',
 'chosen_furnishing_comparison':'Two source-sized sofas; second faces west into its662.5 strip/reading arch. New four-place1200x800 table with500x500 chair rectangles and separate600x600 occupied/pullback envelopes. Two300 side tables replace the former coffee table.',
 'operating_states':'Utility and pantry are checked with explicit900x44 leaves fully open; guest door is its separate inward comparison. Court-north outward opening removes indoor leaf footprint but requires an actual courtyard/threshold/handing study. Garden2400 and1800 inward states remain separate.',
 'chair_fields':d['occupied_dining_fields'],'nominal_east_dining_route_width':677.5,'nominal_sofa_front_strip':662.5,
 'scenarios':scenarios,'negative_controls':controls,'six_place_comparison':six,
 'limits':['A route beside occupied fields does not prove entry, sitting, standing, chair withdrawal, shared comfort or real furniture fit. The500/600 rectangles are declared authored comparisons.',
 'A missing lattice path is only not-found evidence. Positive-area object/leaf clashes and measured narrow strips are separate geometric findings.',
 'The family sofa front strip is consumed by seated legs; simultaneous passage and seating are not earned. Reading and family sofas remain separate small seating territories, not an eight-person shared group.',
 'Utility is a changed access topology; actual laundry appliances, connections, human handling and renewal are not selected.',
 'Kitchen objects are source-sized reservations. Dishwasher/product actions and station-window tolerances remain unresolved; an empty route is not a working-kitchen acceptance.',
 'No external ground level, threshold safety, court-water escape or outward-leaf weather/access performance is invented.']}
emit('house-ground-actions.json',json.dumps(out,indent=2)+'\n')
print(json.dumps({'routes':{k:{n:z['route_found']for n,z in s['routes'].items()}for k,s in scenarios.items()},'controls':controls},indent=2))
