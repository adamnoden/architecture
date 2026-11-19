"""Normal bending, St Venant torsion and actual interface loads of one curved arch."""
import math
from itertools import pairwise


def rectangular_j(b,d):
    a,h=sorted([b,d])
    return h*a**3*(1/3-.21*(a/h)*(1-a**4/(12*h**4)))


class NormalArch:
    def __init__(self,model,crack):
        self.s=model;self.cr=crack
        self.arc=model['arch'];self.jamb=[(model['xJ'],z) for z in sorted({*[v[1] for v in model['right']],4700,5430,5570,5800})]
        self.nodes=sorted(set(self.arc+self.jamb));self.index={p:3*i for i,p in enumerate(self.nodes)}
        self.n=3*len(self.nodes);self.k=[[0.]*self.n for _ in range(self.n)];self.elements=[]
        self.ends=[self.index[q]+j for q in [self.arc[0],self.jamb[0]] for j in range(3)]
        for a,b in pairwise(self.arc):self.member(a,b,140,215,'arch')
        for a,b in pairwise(self.jamb):self.member(a,b,model['jamb_normal_width']((a[1]+b[1])/2),205,'jamb')
        self.member(self.arc[-1],self.jamb[-1],140,215,'knee')
        self.free=[j for j in range(self.n) if j not in self.ends]
        self.solve=model['p']['fac']([[self.k[i][j] for j in self.free] for i in self.free]);self.kend=[]
        for c in range(6):
            response=self.response([int(i==c) for i in range(6)],[0.]*self.n)
            self.kend.append(response[1])
        assert max(abs(self.kend[i][j]-self.kend[j][i]) for i in range(6) for j in range(6))<.001

    def member(self,a,b,width,depth,kind):
        l=math.dist(a,b);tx=(b[0]-a[0])/l;tz=(b[1]-a[1])/l
        P=self.index[a];Q=self.index[b]
        # w is the normal displacement. Rotations are about the window's
        # horizontal X and vertical Z axes. Edge rotations use milliradians
        # in the support coupling; element rotations are ordinary radians.
        do=[[(P,1)],[(P+1,-tz),(P+2,tx)],[(Q,1)],[(Q+1,-tz),(Q+2,tx)]]
        twist=[(P+1,-tx),(P+2,-tz),(Q+1,tx),(Q+2,tz)]
        m=[[12,6*l,-12,6*l],[6*l,4*l*l,-6*l,2*l*l],[-12,-6*l,12,-6*l],[6*l,2*l*l,-6*l,4*l*l]]
        ei=self.cr*33000*depth*width**3/12
        m=[[v*ei/l**3 for v in row] for row in m]
        self.s['p']['insert'](self.k,do,m);gj=self.cr*33000/2.4*rectangular_j(width,depth)
        self.s['p']['add'](self.k,twist,gj/l)
        self.elements.append((kind,a,b,do,twist,m,gj/l))

    def response(self,ends,load):
        d=[0.]*self.n
        for i,(j,v) in enumerate(zip(self.ends,ends)):d[j]=v/(1000 if i%3 else 1)
        rhs=[load[k]-sum(self.k[k][j]*d[j] for j in self.ends) for k in self.free]
        for j,v in zip(self.free,self.solve(rhs)):d[j]=v
        re=[(sum(c*w for c,w in zip(self.k[j],d))-load[j])/(1000 if k%3 else 1) for k,j in enumerate(self.ends)]
        return d,re

    def point(self,rhs,point,value,offset_x=0.):
        k=self.index[point];rhs[k]+=value;rhs[k+2]+=value*offset_x

    def loads(self,sill,wind,guard_point=None):
        s=self.s;rhs=[0.]*self.n;direct=[0.]*6;orig=[]
        # Collect actual normal pressure loci before replacing their old
        # horizontal resultants at floor and roof levels in the house model.
        # Strip load on the arch includes its exposed band and spandrel.
        def add(p,force,x=None,z=None):
            self.point(rhs,p,force,0. if x is None else x-p[0]);orig.append((p[0] if x is None else x,p[1] if z is None else z,force))
        for kind,a,b,*_ in self.elements:
            xm=(a[0]+b[0])/2;zm=(a[1]+b[1])/2
            if kind=='arch':
                top=s['cz']+math.sqrt(s['ro']**2-(xm-1800)**2)
                area=215*math.dist(a,b)+max(0,6540-top)*abs(b[0]-a[0])
            elif kind=='jamb':area=205*math.dist(a,b)
            else:continue
            # Split line load into two nodal actions. This produces a
            # statically exact piecewise-lumped pressure model. Local force
            # and mesh sensitivity remain separate from global conservation.
            for node in [a,b]:add(node,wind*area/2e6*1000)
        height=s['cz']-sill
        w=s['ri'];a0=500;theta=math.asin(a0/w)
        segment=a0*math.sqrt(w*w-a0*a0)+w*w*theta
        area=1000*height+segment
        q2=1000*(s['cz']**2-sill**2+w*w)-2*a0**3/3+2*s['cz']*segment
        centre_z=q2/(2*area)
        # At both jambs the complete aperture load lands at two actual
        # proposed normal-fixing heights. The near side bears directly on
        # the L, not a fictitious left jamb. Its torque/force is exposed as
        # a direct interface load for the real house at that same elevation.
        near=[]
        def distribute_to_jambs(far,force,zload,xload,levels):
            u=(zload-levels[0])/(levels[1]-levels[0]);xj=s['xJ'] if far else s['xL']
            for z,frac in zip(levels,[1-u,u]):
                if far:self.point(rhs,(xj,z),force*frac,xload-xj)
                else:near.append((xload,z,force*frac))
            orig.append((xload,zload,force))
        G=wind*s['guard_body_area']*1000
        gross=wind*area/1e6*1000
        F=gross-G
        if F:centre_z=(gross*centre_z-G*5300)/F
        for far,x in [(False,1300),(True,2300)]:distribute_to_jambs(far,F/2,centre_z,x,[4700,5800])
        P,xpoint=guard_point or (0,1800)
        for total,x,z in [(G,1800,5300),(P,xpoint,6240)]:
            if not total:continue
            frac=(x-1375)/850
            for far,xfix,part in [(False,1375,1-frac),(True,2225,frac)]:distribute_to_jambs(far,total*part,z,xfix,[5430,5570])
        return rhs,near,orig
