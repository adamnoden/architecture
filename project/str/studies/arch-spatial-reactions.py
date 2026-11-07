"""Recover force, overturning and torque at the real floor pads and L foundations."""
import math

class Transfer:
    def __init__(self,s,j,st,modes,crack,bearing):
        self.s=s;self.j=j;self.st=st;self.modes=modes;self.cr=crack;self.bearing=bearing
        self.pads=sorted(j['loPads']);self.corner=s['corner_keys'];self.npad=len(self.pads);self.size=self.npad+20
        self.unit=[self.primary(m.response,m) for m in modes]
        self.origins=[]

    def primary(self,u,m=None):
        s=self.s;P0=s['p'];out=[0.]*self.size;end=[s['dot'](a,u) for a in s['terminal']]
        for i,P in enumerate(self.corner):
            k=s['new_stiffness'][P];ends=s['mul'](k,end[4*i:4*i+4]);n=0.;M=[0.,0.];H=[0.,0.];yaw=0.
            for Q,z,axis,der,f in (m.column if m else []):
                if P!=Q:continue
                g=s['mul'](k,s['terminal_cross'](P,z,der,axis));ends=[x-f*y for x,y in zip(ends,g)]
                M[axis]+=f*(1 if der else z+P0['base']+750)/1e6
                if not der:H[axis]+=f/1000
            for Q,z,f in (m.twist if m else []):
                if Q==P:yaw+=f/1e6
            for dof,f in (m.scalar.items() if m else []):
                if s['modes'][dof][0]==P and s['modes'][dof][3]==1:n-=f/1000
            out[self.pads.index(P)]+=n
            for axis in range(2):
                cent=(s['c0']-s['A'])*(1 if P[axis]==s['A'] else -1)
                M[axis]+=(ends[axis]*(3370+750)+ends[2+axis]*(6600+750))/1e6+n*cent/1000
                H[axis]+=(ends[axis]+ends[2+axis])/1000
                out[self.npad+2*i+axis]=M[axis];out[self.npad+8+2*i+axis]=H[axis]
            out[self.npad+16+i]=yaw
        for q in P0['upperSupports']:
            force=40*u[P0['vDO'](q,0)]
            for pad,f,dx,dy in self.j['routes']([(self.j['virtual'](q),q,1.)]):
                assert abs(dx)+abs(dy)<.00001;out[self.pads.index(pad)]+=force*f
        if m:
            for dof,f in m.scalar.items():
                for (two,k,p),g in s['floor_unit_reactions'].items():
                    if bool(self.bearing)==two and k==dof:out[self.pads.index(p)]+=f*g/1000
        return out

    def result(self,d,fixed,kernels,external):
        rr=[]
        for i,k in enumerate(kernels):rr.extend(self.s['mul'](k,d[i*6:i*6+6]))
        rr=[a+b for a,b in zip(rr,fixed)]+d[96:]
        assert len(rr)==len(self.unit)
        return [v-sum(r[j]*f for r,f in zip(self.unit,rr)) for j,v in enumerate(external)]

    def old_wind(self,i):
        out=[0.]*self.size;s=self.s
        for roof in self.j['rings'].values():
            for row in self.j['windrows'](roof,i):
                p=tuple(row['xy']);n=row['n']
                for pt,f,dx,dy in self.j['routes']([(self.j['virtual'](p),p,1.)]):out[self.pads.index(pt)]+=n*f
        for k,P in enumerate(self.corner):
            q=self.j['plane']['actual'][i][3][P]
            for j in range(2):
                out[self.npad+2*k+j]=(q[j]*(3370+750)+q[2+j]*(6600+750))/1e6
                out[self.npad+8+2*k+j]=(q[j]+q[2+j])/1000
        return out

    def totals(self,r):
        M=[[r[self.npad+2*i+k] for k in [0,1]] for i in range(4)];V=[[r[self.npad+8+2*i+k] for k in [0,1]] for i in range(4)]
        return [sum(r[:self.npad]),*[sum(n*p[k]/1000 for n,p in zip(r,self.pads))+sum(v[k] for v in M) for k in range(2)],*[sum(v[k] for v in V) for k in range(2)],sum((v[1]*p[0]-v[0]*p[1])/1000 for p,v in zip(self.corner,V))+sum(r[-4:])]

    def applied(self,a,orig):
        s=self.s;P,_,_,axis,sg=s['corner_windows'][a];normal=1-axis;sn=1 if P[normal]==s['A'] else -1;v=[0.]*6
        for x,z,n in orig:
            pos=[0.,0.];pos[axis]=x if sg>0 else 12000-x;pos[normal]=P[normal];F=[0.,0.];F[normal]=sn*n/1000
            v[normal+1]+=F[normal]*(z+750)/1000;v[normal+3]+=F[normal];v[5]+=(pos[0]*F[1]-pos[1]*F[0])/1000
        return v

    def at_heads(self,wind,extra,routed,factors):
        j=self.j;M={p:extra[self.npad+2*i:self.npad+2*i+2] for i,p in enumerate(self.corner)}
        V={p:extra[self.npad+8+2*i:self.npad+8+2*i+2] for i,p in enumerate(self.corner)}
        yaw={p:extra[-4+i] for i,p in enumerate(self.corner)}
        g,_,_,tot=j['realState'](factors,wind,dict(zip(self.pads,extra)),M,routed)
        shear,h=j['horizontal'](wind,V,yaw)
        return {p:[*g[p],*shear[p]] for p in j['heads']},[*tot,*h]
