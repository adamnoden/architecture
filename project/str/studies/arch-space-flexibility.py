"""Generalized flexibility of the actual L, perimeter floor edge, and perforated floor."""
from dataclasses import dataclass,field
from itertools import pairwise
import math

@dataclass
class Coordinate:
    column:list=field(default_factory=list)  # corner, relative z, axis, derivative, factor
    floor:dict=field(default_factory=dict)   # force-dual to in-plane displacement
    roof:dict=field(default_factory=dict)
    twist:list=field(default_factory=list)   # actual corner L torsion at height
    edge:list=field(default_factory=list)    # torsion of the continuous 140x750 upstand
    scalar:dict=field(default_factory=dict)  # existing vertical edge modes / axial strain

class Structure:
    def __init__(self,s,torsion_fraction):
        self.s=s;self.p=s['p'];self.floor=s['m'];self.coords=[];self.inputs=[]
        self.frac=torsion_fraction;self.jambs=s['corner_windows'];self.J=__import__('runpy').run_path(str(s['D']/'arch-normal-kernel.py'))['rectangular_j']
        self.shear_mod=33000/2.4*self.frac;self.mode_map=[];self.A=s['A'];self.B=s['B']
        # Preserve existing bending coordinates. Positive local Z is upward.
        for i,(P,J,axis,dof,terms,ff,_,_) in enumerate(s['modes']):
            m=Coordinate(column=[(P,s['h0'],k,d,c) for k,d,c in terms],floor=ff.copy(),scalar={i:1})
            self.coords.append(m)
        for a,(P,J,L0,axis,sg) in enumerate(self.jambs):
            normal=1-axis;sn=1 if P[normal]==self.A else -1
            self.coords.append(self.near_normal(a,s['xL'],s['zs']))
            self.coords.append(Coordinate(column=[(P,s['h0'],normal,1,-1000*sn)]))
            chirality=(1 if axis==0 else -1)*sg*sn
            self.coords.append(Coordinate(twist=[(P,s['h0'],1000*chirality)]))
            for dof in ['normal','tip','yaw']:
                mode=Coordinate();station=J[axis];wall=(axis,J[normal]);u=(station-self.A)/(self.B-self.A)
                if dof=='yaw':
                    # Average actual patch rotation over its 205 mm front.
                    lo=list(J);hi=list(J);lo[axis]-=s['jamb_width']/2;hi[axis]+=s['jamb_width']/2
                    mode.floor[tuple(lo),normal]=-sg*sn*1000/s['jamb_width'];mode.floor[tuple(hi),normal]=-mode.floor[tuple(lo),normal]
                else:
                    # Rotation about the wall-horizontal axis is delivered by
                    # torsion of the continuous floor edge to its two L ends.
                    # No transverse slab-strip stiffness is silently added.
                    lever=-s['floorRadius'] if dof=='normal' else 1000
                    if dof=='normal':mode.floor[J,normal]=sn
                    for end,weight in [(self.A,1-u),(self.B,u)]:
                        c=list(J);c[axis]=end
                        mode.column.append((tuple(c),self.p['ff']-self.p['base'],normal,1,-sn*weight*lever))
                    mode.edge.append((wall,J[axis]-self.A,lever))
                self.coords.append(mode)
        self.physical=len(self.coords)
        # Couple floor and roof patch yaw to the actual torsion of each L.
        # Zero or finite/rigid constraint stiffness are explicit sensitivity
        # choices. Free local floor yaw is read through two real patch nodes.
        for P in s['corner_keys']:
            sign=1 if P[0]==self.A else -1;other=max((q for q in self.floor['patches'][P] if abs(q[1]-P[1])<1e-8),key=lambda q:abs(q[0]-P[0]));dx=other[0]-P[0];assert abs(dx)>50
            self.coords.append(Coordinate(floor={(other,1):-1000/dx,(P,1):1000/dx},twist=[(P,self.p['ff']-self.p['base'],1000)]))
            self.coords.append(Coordinate(roof={self.p['dof'](P,2):-1000},twist=[(P,self.p['rr']-self.p['base'],1000)]))
        for m in self.coords:self.prepare(m)

    def near_normal(self,a,x,z):
        P,J,L0,axis,sg=self.jambs[a];normal=1-axis;sn=1 if P[normal]==self.A else -1
        chirality=(1 if axis==0 else -1)*sg*sn
        return Coordinate(column=[(P,z-self.p['base'],normal,0,sn)],twist=[(P,z-self.p['base'],chirality*(x-self.A))])

    def prepare(self,m):
        s=self.s;v=[0.]*s['nd']
        for P,h,axis,derivative,f in m.column:
            weights=s['mul'](s['new_stiffness'][P],s['terminal_cross'](P,h,derivative,axis))
            for terms,w in zip(self.p['wdof'](P,True),weights):
                for i,q in terms:v[i]+=f*w*q
        for (xy,axis),f in m.floor.items():
            for i,q in enumerate(self.floor['reduced'](xy,axis)):v[-8+i]+=f*q
        for i,f in m.roof.items():v[i]+=f
        m.vector=v;m.response=s['fullSolve'](v)
        m.floor_extra=self.floor['recover']([0.]*8,m.floor)[0] if m.floor else []
        m.floor_terms=[(i,f*q) for (xy,ax),f in m.floor.items() for i,q in self.floor['basis'](xy,ax)]

    def flexibility(self,m,n,positive_floor):
        s=self.s;value=s['dot'](m.vector,n.response)
        if m.floor_terms and n.floor_extra:value+=sum(n.floor_extra[i]*f for i,f in m.floor_terms)
        for P,h,k,d,f in m.column:
            for Q,j,b,e,g in n.column:
                if P!=Q:continue
                a=s['terminal_cross'](P,h,d,k);c=s['terminal_cross'](P,j,e,b)
                value+=f*g*(s['pier_compliance'](P,h,j,d,e,k,b)-s['dot'](a,s['mul'](s['new_stiffness'][P],c)))
        for P,h,f in m.twist:
            for Q,j,g in n.twist:
                if P!=Q:continue
                # Sum the two thin rectangular legs, excluding their overlap.
                # Actual cracked torsion and floor-/roof-to-pier joints remain
                # testable assumptions; neither a perfectly rigid box nor zero
                # twist is imposed at the skewback itself.
                length=min(h,j);breaks=sorted({0,length,*[z-self.p['base'] for z in [s['fill_bottom'],s['fill_top']] if 0<z-self.p['base']<length]})
                for low,high in pairwise(breaks):
                    leg=1037.5 if s['fill_bottom']<self.p['base']+(low+high)/2<s['fill_top'] else 1000.
                    width=s.get('wide_normal',140) if leg==1037.5 else 140
                    J=self.J(leg+width-140,width)+self.J(leg-140,width)
                    value+=f*g*(high-low)/(self.shear_mod*J)
        L=self.B-self.A
        for wall,x,f in m.edge:
            for other,y,g in n.edge:
                if wall==other:value+=f*g*(min(x,y)-x*y/L)/(self.shear_mod*self.J(750,140))
        # Old planar scalar flexibilities: the vertical edge and L shortening.
        for i,f in m.scalar.items():
            P,J,_,d,*_=s['modes'][i]
            for j,g in n.scalar.items():
                Q,J2,_,e,*_=s['modes'][j]
                value+=f*g*s['floor_cases'][0 if positive_floor else 1][0][i][j]
                if P==Q and d==e==1:
                    extra=s['h0']-(s['fill_bottom']-self.p['base']);value+=f*g*((s['h0']-extra)/s['narrow'][0]+extra/s['wide'][0])/33000
        return value

    def background(self,m,u,floor_extra):
        return self.s['dot'](m.vector,u)+sum(f*floor_extra[i] for i,f in m.floor_terms)
