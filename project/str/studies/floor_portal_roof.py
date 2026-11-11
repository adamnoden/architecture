"""Source-bound roof substructure with real extra cap stations.

Historical roof files are read unchanged. The old floor, fixed-base pier and
absolute vertical support blocks are removed before joining the actual house.
"""
from pathlib import Path
from itertools import pairwise
import ast
import hashlib
import math
import numpy as np
from scipy.linalg import solve
from floor_portal_frame import offset

D=Path(__file__).resolve().parent


def namespace(court_width=280.,court_wall=25.):
    path=D/'current-house-roof-bracing.py'
    source=path.read_text(); boundary=source.index('\nactual=state(')
    p={'__file__':str(path),'__name__':'source_bound_floor_portal_roof'}
    if court_width!=220 or court_wall!=20:
        import json
        outer=json.loads((D/'current-house-welded-network.json').read_text())['sections']['collector']
        c=outer.copy();b,h,t=court_width,outer['H'],court_wall
        c.update(B=b,t=t,A=b*h-(b-2*t)*(h-2*t),I=(b*h**3-(b-2*t)*(h-2*t)**3)/12,
                 Iminor=(h*b**3-(h-2*t)*(b-2*t)**3)/12)
        c.update(W=c['I']/(h/2),Wminor=c['Iminor']/(b/2),lineG=c['A']*78.5/1e6)
        p['collectorSections']={'outer':outer,'court':c}
    exec(compile(source[:boundary],str(path),'exec'),p)
    return p,hashlib.sha256(source.encode()).hexdigest()


def enrich(p):
    """Split, never attach new supports by a Hermite-only interpolation."""
    axes=[1497.5,2702.5,9297.5,10502.5]
    cap_points={p['pt'](face,p['A'],u) for face in range(4) for u in axes}
    rings=[]
    for a,b in p['rings']:
        axis=0 if a[1]==b[1] else 1
        middle=[q for q in cap_points if q[1-axis]==a[1-axis] and min(a[axis],b[axis])<q[axis]<max(a[axis],b[axis])]
        points=sorted([a,*middle,b],key=lambda q:q[axis],reverse=b[axis]<a[axis])
        rings.extend(pairwise(points))
    p['rings']=rings
    for face in range(4):p['sides'][face,'outer']=sorted(set(p['sides'][face,'outer'])|set(axes))
    p['nodes']=sorted({q for e in rings for q in e});p['ind']={q:i for i,q in enumerate(p['nodes'])}
    p['nr']=3*len(p['nodes']);p['size']=p['nr']+3
    p['spaceSize']=p['size']+4*len(p['crowns'])+3*len(p['nodes'])+2*len(p['ridgePairs'])+3*len(p['crowns'])+8
    p['outerTerms'].clear();p['floorLoadCases'].clear()
    assert len(cap_points)==16 and len(p['upperSupports'])==22
    return cap_points


def semantic(p):
    keys={}
    for q in p['nodes']:
        for j in range(3):keys['ringPlan',q,j]=p['dof'](q,j);keys['ringVertical',q,j]=p['vDO'](q,j)
    for q in p['highNodes']:
        for j in range(4):keys['purlin',q,j]=p['highD'](q,j)
        for j in range(3):keys['rafterRotation',q,j]=p['rRot'](q,j)
    for a,b in p['ridgePairs']:
        for j in range(2):keys['ridgeEndYaw',a,b,j]=p['phiD'](a,b,j)
    return keys


def rigid(p):
    r=np.zeros((p['spaceSize'],6))
    for q in p['nodes']:
        z=offset([*q,6600.])
        for j,physical in enumerate((0,1,5)):r[p['dof'](q,j)]=z[physical]
        for j,physical,sg in ((0,2,-1),(1,4,1),(2,3,-1)):r[p['vDO'](q,j)]=sg*z[physical]
    for q in p['highNodes']:
        z=offset([*q,p['zhigh']+p['seatZ']])
        for j in range(3):r[p['highD'](q,j)]=z[j];r[p['rRot'](q,j),3+j]=1
        r[p['highD'](q,3),5]=1
    for a,b in p['ridgePairs']:
        for j in (0,1):r[p['phiD'](a,b,j),5]=1
    return r


def extract(p):
    old=p['fac'];p['fac']=lambda k:k
    try:full,props,springs=p['build'](False,True)
    finally:p['fac']=old
    k=np.array(full);n=len(k)
    k[-8:,-8:]-=np.array(p['membrane']['Ke'])
    for matrix,terms in springs.values():
        t=np.zeros((4,n))
        for i,row in enumerate(terms):
            for j,c in row:t[i,j]+=c
        k-=t.T@matrix@t
    for q in p['upperSupports']:k[p['vDO'](q,0),p['vDO'](q,0)]-=40000.
    removed=sorted(set(range(p['nr'],p['nr']+3))|set(range(n-8,n)))
    keep=np.setdiff1d(np.arange(n),removed)
    assert np.max(abs(k[np.ix_(removed,keep)]))<1e-8
    return k[np.ix_(keep,keep)],keep,props


class Roof:
    def __init__(self,court_width=280.,court_wall=25.,caps=True):
        self.p,self.source_hash=namespace(court_width,court_wall)
        self.cap_points=enrich(self.p) if caps else set()
        self.k,self.keep,self.props=extract(self.p)
        self.lookup={int(old):i for i,old in enumerate(self.keep)}
        self.rigid=rigid(self.p)[self.keep]
        self.keys={key:self.lookup[i] for key,i in semantic(self.p).items()}
        self.mounted=None

    def mount(self,frame):
        self.mounted=frame.extra(self.k,self.rigid)
        return self.mounted

    def port(self,point,at=None):
        p=self.p;q=tuple(point)
        native=[p['dof'](q,0),p['dof'](q,1),p['vDO'](q,0),p['vDO'](q,2),p['vDO'](q,1),p['dof'](q,2)]
        ids=np.array([self.lookup[i] for i in native]);sg=np.diag([1.,1.,-1.,-1.,1.,1.])
        if self.mounted is not None:ids=self.mounted[ids]
        at=np.array([*q,6600.]) if at is None else np.asarray(at)
        return ids,offset(at-np.array([*q,6600.]))@sg

    def controls(self,original):
        old_keys=list(original.keys)
        retained=np.array([self.keys[key] for key in old_keys]);old=np.array([original.keys[key] for key in old_keys])
        extra=np.setdiff1d(np.arange(len(self.k)),retained)
        aa=self.k[np.ix_(retained,retained)]
        bb=self.k[np.ix_(extra,retained)]
        condensed=aa-bb.T@solve(self.k[np.ix_(extra,extra)],bb,assume_a='sym')
        reference=original.k[np.ix_(old,old)]
        error=np.max(abs(condensed-reference));relative=error/np.max(abs(reference))
        assert relative<1e-12
        residual=self.k@self.rigid@np.diag([1,1,1,.001,.001,.001])
        rows=[]
        for j in range(6):rows.append(float(np.max(abs(residual[:,j]))))
        assert max(rows)<1e-4
        # A cap at its actual normal/vertical offset has exactly the work of
        # that physical point for every rigid motion, including yaw.
        e=0.
        for q in self.cap_points:
            inward=np.array([1 if q[0]==self.p['A'] else -1 if q[0]==self.p['B'] else 0,
                              1 if q[1]==self.p['A'] else -1 if q[1]==self.p['B'] else 0,0])
            at=np.array([*q,6540.])+inward*10 #240 mm jamb centreq342.5
            ids,t=self.port(q,at)
            e=max(e,float(np.max(abs(t@self.rigid[ids]-offset(at)))))
        assert e<1e-10
        return dict(sourceSHA256=self.source_hash,originalDOFs=len(original.k),
                    enrichedDOFs=len(self.k),newCapStations=len(self.cap_points),
                    originalReceivingStations=len(self.p['upperSupports']),
                    condensedRelativeError=float(relative),condensedMaxEntryError=float(error),
                    rigidResidualNOrNmm=rows,capOffsetRigidError=e)


if __name__=='__main__':
    import json
    old=Roof(caps=False);new=Roof()
    print(json.dumps(new.controls(old),indent=2))
