"""Small work-conjugate frame/plate assembly for the actual floor/portal join.

N, mm, radians. This is a calculation component, not an RC design acceptance.
All member bases are proper rotations built from actual global geometry.
"""
from dataclasses import dataclass
import math
import numpy as np
from scipy.sparse import coo_matrix, csc_matrix
from scipy.sparse.linalg import splu


def skew(r):
    x, y, z = r
    return np.array([[0., -z, y], [z, 0., -x], [-y, x, 0.]])


def offset(r):
    t = np.eye(6)
    t[:3, 3:] = -skew(r)
    return t


def torsion(b, h):
    a, t = max(b, h), min(b, h)
    return a*t**3*(1/3-.21*t/a*(1-t**4/(12*a**4)))


def beam_matrix(length, EA, EIy, EIz, GJ, GA=None):
    """Local X axial, Y width, Z depth; optional Timoshenko shear."""
    L = length
    k = np.zeros((12, 12))
    for ids, value in [([0, 6], EA/L), ([3, 9], GJ/L)]:
        k[np.ix_(ids, ids)] += value*np.array([[1., -1.], [-1., 1.]])
    for ids, ei, sign in [([1, 5, 7, 11], EIz, 1.), ([2, 4, 8, 10], EIy, -1.)]:
        phi = 12*ei/(GA*L**2) if GA else 0.
        base = np.array([[12, 6*L, -12, 6*L],
                         [6*L, (4+phi)*L**2, -6*L, (2-phi)*L**2],
                         [-12, -6*L, 12, -6*L],
                         [6*L, (2-phi)*L**2, -6*L, (4+phi)*L**2]])
        s = np.diag([1., sign, 1., sign])
        k[np.ix_(ids, ids)] += s@base@s*ei/(L**3*(1+phi))
    return k


def hermite(t, L):
    return np.array([1-3*t*t+2*t**3, (t-2*t*t+t**3)*L,
                     3*t*t-2*t**3, (-t*t+t**3)*L])


def hermite_derivative(t, L):
    return np.array([(-6*t+6*t*t)/L, 1-4*t+3*t*t,
                     (6*t-6*t*t)/L, -2*t+3*t*t])


class Frame:
    def __init__(self):
        self.points, self.names, self.index = [], [], {}
        self.blocks, self.elements, self.links = [], [], []
        self.size = 0
        self.rigid_extra = []

    def node(self, name, point):
        if name in self.index:
            i = self.index[name]
            assert np.max(np.abs(self.points[i//6]-point)) < 1e-7
            return i
        assert self.size == 6*len(self.points), 'Append external substructures only after physical frame nodes'
        i = self.size
        self.index[name] = i
        self.names.append(name)
        self.points.append(np.array(point, dtype=float))
        self.size += 6
        return i

    def extra(self, k, rigid):
        """Append a source substructure whose physical rigid modes are known."""
        ids = np.arange(self.size, self.size+len(k))
        self.size += len(k)
        self.add(ids, k)
        self.rigid_extra.append((ids, rigid))
        return ids

    def add(self, ids, k):
        self.blocks.append((np.asarray(ids, dtype=int), np.asarray(k, dtype=float)))

    def port(self, node, at=None):
        p = self.points[node//6]
        return np.arange(node, node+6), offset(np.zeros(3) if at is None else np.asarray(at)-p)

    def link(self, a, b, stiffness, name):
        ia, ta = a; ib, tb = b
        ids = np.r_[ia, ib]
        t = np.c_[ta, -tb]
        k = np.diag(stiffness) if np.ndim(stiffness) == 1 else np.asarray(stiffness)
        self.add(ids, t.T@k@t)
        record = dict(name=name, ids=ids, t=t, k=k, ports=(a,b))
        self.links.append(record)
        return record

    def beam(self, a, b, width, depth, name, E=33000., G=None, crack=.25,
             normal=None, ra=(0.,0.,0.), rb=(0.,0.,0.), EA=None, shear=True, section=None):
        pa, pb = self.points[a//6]+ra, self.points[b//6]+rb
        delta = pb-pa; L = np.linalg.norm(delta); assert L > 1e-5, (name, pa, pb)
        x = delta/L
        n = np.asarray(normal if normal is not None else ((0.,1.,0.) if abs(x[1])<.8 else (1.,0.,0.)))
        y = n-x*np.dot(n,x); y /= np.linalg.norm(y); z = np.cross(x,y)
        R = np.array([x,y,z]); assert np.linalg.det(R) > .999999
        G = E/2.4 if G is None else G
        area,iy,iz,jtor = section if section is not None else (width*depth,width*depth**3/12,depth*width**3/12,torsion(width,depth))
        axial=E*area if EA is None else EA
        local = beam_matrix(L,axial,crack*E*iy,crack*E*iz,crack*G*jtor,
                            G*area*5/6 if shear else None)
        t = np.zeros((12,12)); rot = np.zeros((6,6)); rot[:3,:3]=rot[3:,3:]=R
        t[:6,:6]=rot@offset(ra); t[6:,6:]=rot@offset(rb)
        ids = np.r_[np.arange(a,a+6),np.arange(b,b+6)]
        self.add(ids,t.T@local@t)
        e=dict(name=name,ids=ids,t=t,k=local,R=R,L=L,a=pa,b=pb,width=width,depth=depth,EA=axial,area=area)
        self.elements.append(e)
        return e

    def point(self, f, node, force, moment=(0.,0.,0.), at=None):
        ids,t=self.port(node,at)
        f[ids] += t.T@np.r_[force,moment]

    def beam_load(self, f, e, t, force, moment=(0.,0.,0.), at=None):
        """Consistent Euler field loads; rigid-resultant equivalence is exact.

        Shear interpolation is a discretisation comparison, resolved by mesh
        refinement; it is not used to invent additional support stiffness.
        """
        p=e['a']+(e['b']-e['a'])*t
        force=np.asarray(force); moment=np.asarray(moment)+np.cross(np.zeros(3) if at is None else np.asarray(at)-p,force)
        fl=e['R']@force; ml=e['R']@moment; L=e['L']; out=np.zeros(12)
        out[[0,6]] += fl[0]*np.array([1-t,t]); out[[3,9]] += ml[0]*np.array([1-t,t])
        h=hermite(t,L); dh=hermite_derivative(t,L)
        out[[1,5,7,11]] += fl[1]*h+ml[2]*dh
        out[[2,4,8,10]] += (fl[2]*h-ml[1]*dh)*np.array([1.,-1.,1.,-1.])
        np.add.at(f,e['ids'],e['t'].T@out)
        return out

    def matrix(self):
        rr,cc,vv=[],[],[]
        for ids,k in self.blocks:
            i,j=np.nonzero(k)
            rr.extend(ids[i]);cc.extend(ids[j]);vv.extend(k[i,j])
        return coo_matrix((vv,(rr,cc)),shape=(self.size,self.size)).tocsc()

    def rigid(self, origin=(0.,0.,0.)):
        out=np.zeros((self.size,6))
        for j,p in enumerate(self.points):out[6*j:6*j+6]=offset(p-np.asarray(origin))
        for ids,r in self.rigid_extra:out[ids]=r@offset(-np.asarray(origin))
        return out


class Solve:
    def __init__(self,k,fixed):
        self.k=csc_matrix(k); self.fixed=np.array(sorted(set(fixed)),dtype=int)
        rows=np.asarray(abs(self.k).sum(axis=1)).ravel()
        self.unused=np.flatnonzero(rows==0)
        self.free=np.setdiff1d(np.arange(len(rows)),np.r_[self.fixed,self.unused])
        # Rotation units are radians. Symmetric diagonal scaling improves
        # conditioning without changing stiffness or a physical spring.
        a=self.k[self.free][:,self.free]
        self.scale=1/np.sqrt(abs(a.diagonal()))
        from scipy.sparse import diags
        d=diags(self.scale)
        self.factor=splu((d@a@d).tocsc())

    def __call__(self,f,prescribed=None):
        f=np.asarray(f); one=f.ndim==1
        if one:f=f[:,None]
        assert np.max(abs(f[self.unused]),initial=0)<1e-10
        u=np.zeros_like(f)
        if prescribed is not None:u[self.fixed]=np.asarray(prescribed).reshape(len(self.fixed),-1)
        rhs=f[self.free]-self.k[self.free][:,self.fixed]@u[self.fixed]
        u[self.free]=self.scale[:,None]*self.factor.solve(self.scale[:,None]*rhs)
        return u[:,0] if one else u


def membrane_triangle(points,E=1200.,nu=.15,thickness=200.,G=440.):
    xy=np.asarray(points); a=np.c_[np.ones(3),xy]
    area=abs(np.linalg.det(a))/2
    grad=np.linalg.inv(a)[1:]
    B=np.zeros((3,6))
    for j in range(3):B[:,2*j:2*j+2]=[[grad[0,j],0],[0,grad[1,j]],[grad[1,j],grad[0,j]]]
    D=E/(1-nu**2)*np.array([[1,nu,0],[nu,1,0],[0,0,(1-nu)/2]])
    D[2,2]=G
    return B.T@D@B*thickness*area,area


def plate_rectangle(width,height,E=8250.,nu=.2,thickness=200.):
    """Rectangular MITC4 plate, node order bottom-left, right, top-right, left.

    Physical nodal DOFs Uz,Rx,Ry; director shear=(w,x+Ry,w,y-Rx).
    Both constant-curvature energy and rigid fields are independently checked.
    """
    sx=np.array([-1,1,1,-1]);sy=np.array([-1,-1,1,1]);jac=width*height/4
    def shape(x,y):
        N=(1+sx*x)*(1+sy*y)/4
        dx=sx*(1+sy*y)/(2*width);dy=sy*(1+sx*x)/(2*height)
        return N,dx,dy
    def shear(x,y,axis):
        N,dx,dy=shape(x,y);b=np.zeros(12)
        for j in range(4):b[3*j]=dx[j] if axis==0 else dy[j];b[3*j+(2 if axis==0 else 1)]=N[j]*(1 if axis==0 else -1)
        return b
    D=E*thickness**3/(12*(1-nu**2))*np.array([[1,nu,0],[nu,1,0],[0,0,(1-nu)/2]])
    G=E/(2*(1+nu));k=np.zeros((12,12))
    for x in (-1/math.sqrt(3),1/math.sqrt(3)):
        for y in (-1/math.sqrt(3),1/math.sqrt(3)):
            N,dx,dy=shape(x,y);B=np.zeros((3,12))
            for j in range(4):B[:,3*j:3*j+3]=[[0,0,dx[j]],[0,-dy[j],0],[0,-dx[j],dy[j]]]
            S=np.array([(1-y)/2*shear(0,-1,0)+(1+y)/2*shear(0,1,0),
                        (1-x)/2*shear(-1,0,1)+(1+x)/2*shear(1,0,1)])
            k+=(B.T@D@B+S.T@S*(5/6*G*thickness))*jac
    return k


def controls():
    f=Frame();a=f.node('a',[0,0,0]);b=f.node('b',[1000,0,0])
    e=f.beam(a,b,100,200,'control',E=200000,crack=1,shear=False)
    k=f.matrix();load=np.zeros(f.size);load[b+2]=-1000
    u=Solve(k,range(6))(load)
    analytic=-1000*1000**3/(3*200000*(100*200**3/12))
    assert abs(u[b+2]/analytic-1)<1e-10
    dense=np.linalg.solve(k.toarray()[6:,6:],load[6:])
    assert np.max(abs(dense-u[6:]))<1e-10
    r=f.rigid();res=np.asarray(k@r)
    assert np.max(abs(res))<1e-5
    load[:]=0;force=np.array([13.,-17.,29.]);moment=np.array([31.,-41.,53.]);at=np.array([370.,27.,19.])
    f.beam_load(load,e,.37,force,moment,at)
    expected=np.r_[force,moment+np.cross(at,force)]
    err=np.max(abs(r.T@load-expected));assert err<1e-8
    rng=np.random.default_rng(729);d=rng.normal(size=6);p=rng.normal(size=6);t=offset([19.,-27.,41.])
    assert abs(p@(t@d)-(t.T@p)@d)<1e-11
    plate=plate_rectangle(600.,400.);xy=[(-300.,-200.),(300.,-200.),(300.,200.),(-300.,200.)]
    D=8250*200**3/(12*(1-.2**2))*np.array([[1,.2,0],[.2,1,0],[0,0,.4]])
    pe=[]
    for curv in [np.array([1e-5,0.,0.]),np.array([0.,1e-5,0.]),np.array([0.,0.,1e-5])]:
        cx,cy,cxy=curv
        v=np.array([q for x,y in xy for q in [-cx*x*x/2-cy*y*y/2-cxy*x*y/2,-cy*y-cxy*x/2,cx*x+cxy*y/2]])
        target=curv@D@curv*600*400
        error=abs(v@plate@v/target-1);assert error<1e-10
        pe.append(error)
    plate_rigid=[]
    # One mm translations and one mrad rotations: report physical residuals,
    # avoiding a one-radian round-off comparison against a1e10 Nmm matrix.
    for field in [[q for x,y in xy for q in [1.,0.,0.]],
                  [q for x,y in xy for q in [.001*y,.001,0.]],
                  [q for x,y in xy for q in [-.001*x,0.,.001]]]:
        residual=float(np.max(abs(plate@field)));plate_rigid.append(residual)
        assert residual<1e-7
    # Link force must be the actual two-port displacement difference.
    g=Frame();aa=g.node('a',[0,0,0]);bb=g.node('b',[0,0,0]);diag=np.array([11.,13.,17.,19.,23.,29.]);link=g.link(g.port(aa),g.port(bb),diag,'relative')
    ld=np.r_[np.zeros(6),[31.,37.,41.,43.,47.,53.]];gg=Solve(g.matrix(),range(6))(ld)
    recovered=link['k']@link['t']@gg[link['ids']]
    assert np.max(abs(recovered+ld[6:]))<1e-10
    return dict(cantileverMM=float(u[b+2]),analyticMM=analytic,offsetLoadResultantError=float(err),
                beamRigidResidual=float(np.max(abs(res))),plateCurvatureRelativeErrors=pe,
                plateRigidResidualsNOrNmm=plate_rigid,
                relativeLinkForceError=float(np.max(abs(recovered+ld[6:]))))


if __name__=='__main__':
    import json
    print(json.dumps(controls(),indent=2))
