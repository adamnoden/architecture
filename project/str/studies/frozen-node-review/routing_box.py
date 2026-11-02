"""Private read-only specialist reproduction. Frozen source bee433780a6a72e2a352ec6b913a9c51c93c486b.
Geometry only: no complete joint force field or construction adequacy claimed.
Units mm. Local origin global(4200,7750), centre local(300,300).
Path ids0..7 correspond P1..P8. Box: each independent centreline +/-5 per coordinate.
"""
import math,itertools,json
from pathlib import Path
bars=[[300+141*math.cos(math.radians(22.5+45*i)),300+141*math.sin(math.radians(22.5+45*i))] for i in range(8)]
def seg_distance(p0, p1, q0, q1):
    sub = lambda a, b: tuple((x - y for x, y in zip(a, b)))
    dot = lambda a, b: sum((x * y for x, y in zip(a, b)))
    u = sub(p1, p0)
    v = sub(q1, q0)
    w = sub(p0, q0)
    a = dot(u, u)
    b = dot(u, v)
    c = dot(v, v)
    d = dot(u, w)
    e = dot(v, w)

    def at(t, z):
        return math.dist(tuple((p0[i] + t * u[i] for i in range(3))), tuple((q0[i] + z * v[i] for i in range(3))))
    values = [at(0, max(0, min(1, e / c))), at(1, max(0, min(1, (e + b) / c))), at(max(0, min(1, -d / a)), 0), at(max(0, min(1, (b - d) / a)), 1)]
    det = a * c - b * b
    if det > 1e-10:
        t = (b * e - c * d) / det
        z = (a * e - b * d) / det
        if 0 <= t <= 1 and 0 <= z <= 1:
            values.append(at(t, z))
    return min(values)

def path_clear(a, b):
    return min((seg_distance(p, q, r, t) for p, q in zip(a['points'], a['points'][1:]) for r, t in zip(b['points'], b['points'][1:]))) - (a['dia'] + b['dia']) / 2 - 0.1

def paths(opts):
    out = []
    for i, (xy, opt) in enumerate(zip(bars, opts)):
        x, y = xy
        plane = (-352, -292)[opt]
        z0 = plane - 331
        pts = [(x, y, -1000), (x, y, z0)]
        for t in range(2, 91, 2):
            a = math.radians(t)
            pts.append((x, y + 331 * (1 - math.cos(a)), z0 + 331 * math.sin(a)))
        p = pts[-1]
        pts.append((p[0], p[1] + 1170, p[2]))
        out.append(dict(id=str(i), dia=22, points=pts))
    return out

import numpy as np
from scipy.optimize import lsq_linear
pp=paths((0,0,0,0,1,1,1,1))
fixed=[]
for q in (58,110,300,490,542):
 fixed += [dict(id='EW'+str(q),dia=20,points=[(-550,q,-642),(600,q,-642)]),dict(id='NS'+str(q),dia=20,points=[(q,0,-622),(q,2050,-622)])]
for q in (58,300,542):
 fixed += [dict(id='topEW'+str(q),dia=20,points=[(-550,q,-238),(600,q,-238)]),dict(id='topNS'+str(q),dia=20,points=[(q,0,-258),(q,2050,-258)])]
for y in range(650,2051,50):fixed.append(dict(id='NL'+str(y),dia=8,points=[(44,y,-636),(556,y,-636),(556,y,-244),(44,y,-244),(44,y,-636)]))
for x in (54,546):
 for z in (-400,-520): fixed.append(dict(id='NSside'+str(x)+'z'+str(z),dia=12,points=[(x,600,z),(x,2050,z)]))
for i,(x,y) in enumerate(bars): fixed.append(dict(id='nextVertical'+str(i),dia=22,points=[(x,y+1825,-1200),(x,y+1825,-180)]))
def boxclear(a,b,tol=5):
 best=1e9;r=(a['dia']+b['dia'])/2+.1;shift=tol*2
 for p,q in zip(a['points'],a['points'][1:]):
  for s,t in zip(b['points'],b['points'][1:]):
   nominal=seg_distance(p,q,s,t)-r
   if nominal-math.sqrt(3)*shift>=best:continue
   p,q,s,t=map(np.array,(p,q,s,t));u=q-p;v=t-s;w=p-s
   A=np.column_stack((u,-v,-np.eye(3)))
   fit=lsq_linear(A,-w,bounds=([0,0,-shift,-shift,-shift],[1,1,shift,shift,shift]),tol=1e-11,max_iter=200)
   d=np.linalg.norm(A@fit.x+w)-r
   best=min(best,d)
 return best
pairs=sorted((boxclear(a,b),a['id'],b['id']) for i,a in enumerate(pp) for b in pp[:i]);print('pair box',pairs[:5],flush=True)
checks=sorted((boxclear(a,b),a['id'],b['id']) for a in pp for b in fixed);print('fixed box',checks[:10],flush=True)
print('fixed nominal min',min(path_clear(a,b) for a in pp for b in fixed),flush=True)
json.dump(dict(paths=pp,fixed=fixed,pair_box=pairs,fixed_box=checks),open(Path(__file__).with_name('geometry-result.json'),'w'),indent=2)
