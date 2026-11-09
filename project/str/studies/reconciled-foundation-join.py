"""Full 52-head stripped-uplift register for the provisional two-jamb successor."""
from collections import defaultdict


class WindFoundation:
    def __init__(self, joined, roof, host_units, backgrounds):
        self.j=joined
        self.p=roof
        self.feet=sorted(joined['loPads'])
        self.corners=sorted(roof['corners'])
        _,_,self.springs=roof['build'](False,True)
        self.host=[self.primary(d) for d in host_units]
        self.background=[self.primary(d) for d in backgrounds]
        self.old=[]
        self.legacy_totals=[]
        for wi,case in enumerate(roof['space']):
            pads=dict.fromkeys(self.feet,0.)
            for g in joined['rings'].values():
                for row in joined['windrows'](g,wi):
                    p=tuple(row['xy'])
                    for pad,w,_,_ in joined['routes']([(joined['virtual'](p),p,1.)]):
                        pads[pad]+=w*row['n']
            self.old.append([*pads.values(),*self.column_actions(case[3])])
            self.legacy_totals.append((joined['realState']({'U':1},wi)[3],joined['horizontal'](wi)[1]))
        self.bounds={}
        self.count=0
        self.peakStates={}

    def column_actions(self,forces):
        moment=[];shear=[]
        for p in self.corners:
            q=forces[p]
            for j in (0,1):
                moment.append((q[j]*(3370+750)+q[2+j]*(6600+750))/1e6)
                shear.append((q[j]+q[2+j])/1000)
        return [*moment,*shear]

    def primary(self,u):
        p=self.p;j=self.j
        pads=dict.fromkeys(self.feet,0.)
        for point in p['upperSupports']:
            force=40*u[p['vDO'](point,0)]
            for pad,w,_,_ in j['routes']([(j['virtual'](point),point,1.)]):pads[pad]+=force*w
        forces={}
        for point,(K,terms) in self.springs.items():
            d=[p['times'](t,u) for t in terms]
            forces[point]=[sum(k*v for k,v in zip(row,d)) for row in K]
        return [*pads.values(),*self.column_actions(forces)]

    def capture(self, wi, active, oset, responses, wind, point, guard_id, sign):
        # No favourable house/portal selfweight. Existing uniform roof suction
        # and named column system remain. Withdraw old pressure reactions on
        # the lower wall's ground half at the same force and first moment.
        j,p=self.j,self.p
        weights=[];at_heads=defaultdict(lambda:[0.,0.,0.]);foot_shear=defaultdict(lambda:[0.,0.])
        old_ground=[0.]*8
        state=wind if point is None else [x+sign*y for x,y in zip(wind,point)]
        for a,(o,(r,old)) in enumerate(zip(oset,responses)):
            face=['outer-south','outer-east','outer-north','outer-west'].index(o['side'])
            along=face%2;normal=1-along
            sn=1 if face in (0,3) else -1;sg=1 if o['new']==2100 else -1
            # Local positive y points into the building. Local x is measured
            # from the corresponding corner along that elevation.
            f=[r[1][1][k]*active[a]+sum(rm[1][k]*state[4*a+i] for i,rm in enumerate(self.portal.modes)) for k in range(10)]
            if guard_id and guard_id[0]==a:
                f=[x+sign*y for x,y in zip(f,r[2+guard_id[1]][1])]
            weights.extend(v+(old[k] if active[a] else 0.) for k,v in enumerate(f[6:]))
            for side,x in enumerate((1497.5,2702.5)):
                along_u=x if sg==1 else 12000-x
                xy=[0.,0.];xy[along]=along_u;xy[normal]=p['A'] if sn==1 else p['B']
                hf=[0.,0.];hf[along]=-sg*f[3*side]/1000;hf[normal]=-sn*f[3*side+1]/1000
                # Foundation head is Z-750; base pin is -180. The delivered
                # horizontal force has a real 570 mm arm, and local concrete
                # action is 20 mm outward from the old 140 mm core axis.
                v=f[3*side+2]/1000
                ids,frac=o['headPairs'][side]
                for head,w in zip(ids,frac):
                    at_heads[head][0]+=v*w
                    for k in (0,1):
                        at_heads[head][1+k]+=(hf[k]*.57+(-sn*.020*v if k==normal else 0))*w
                        foot_shear[head][k]+=hf[k]*w
                if active[a]:
                    ag=1.410*(p['rr']-p['base'])/1000*2.25/2-(old[side]+old[2+side])/1000
                    for i,corner in enumerate(self.corners):
                        share=(along_u-p['A'])/(p['B']-p['A'])
                        t=share if corner[along]==p['B'] else 1-share
                        old_ground[2*i+normal]+=sn*ag*t/2
        baseline=self.background[wi]
        hv=[v-b-sum(w*m[k] for w,m in zip(weights,self.host))
            for k,(v,b) in enumerate(zip(baseline,self.old[wi]))]
        n=len(self.feet);pm={};ph={}
        for i,corner in enumerate(self.corners):
            pm[corner]=[hv[n+2*i+k]-.57*old_ground[2*i+k] for k in (0,1)]
            ph[corner]=[hv[n+8+2*i+k]-old_ground[2*i+k] for k in (0,1)]
        g,_,_,vertical=j['realState']({'U':1},wi,dict(zip(self.feet,hv)),pm,at_heads)
        h,h0=j['horizontal'](wi,ph)
        for head,v in foot_shear.items():
            for k in (0,1):h[head][k]+=v[k]
        actual=[sum(vector[k] for vector in h.values()) for k in (0,1)]
        demand=[0.,0.]
        before,old_xy=self.legacy_totals[wi]
        wanted_m=before[1:];wanted_yaw=old_xy[2]
        for ax,code in enumerate(j['plane']['actual'][wi][0]):
            if code:
                width=12.4 if (code-1)%3==0 else 6.2
                orientation=1 if code<4 else -1
                demand[ax]=orientation*2.25*width*(self.cap+750)/1000
                dv=orientation*2.25*width*(self.cap-p['peak'])/1000
                wanted_m[ax]+=dv*((self.cap+p['peak'])/2+750)/1000
                face=(3 if code<4 else 1) if ax==0 else (0 if code<4 else 2)
                u=[6000,2900,9100][(code-1)%3];xy=p['pt'](face,p['A'],u)
                wanted_yaw+=dv*(xy[0] if ax==1 else -xy[1])/1000
        if guard_id:
            a,_=guard_id;face=['outer-south','outer-east','outer-north','outer-west'].index(oset[a]['side'])
            ax=1-face%2
            F=1.5*sign*(1 if face in (0,3) else -1)
            demand[ax]+=F
            wanted_m[ax]+=F*(3450+2790+750)/1000
            u=[1660,2540][guard_id[1]]
            along=u if oset[a]['new']==2100 else 12000-u
            wanted_yaw+=F*(along if ax==1 else -along)/1000
        assert max(abs(x-y) for x,y in zip(actual,demand))<.0001,(wi,actual,demand)
        yaw=sum((j['xy'](head)[0]*v[1]-j['xy'](head)[1]*v[0])/1000 for head,v in h.items())
        assert abs(yaw-wanted_yaw)<.002,(wi,guard_id,'yaw',yaw,wanted_yaw)
        assert max(abs(x-y) for x,y in zip(vertical[1:],wanted_m))<.002,(wi,guard_id,'overturn',vertical,wanted_m)
        assert abs(vertical[0]-j['D0']['U'][1][0])<.001,(wi,vertical)
        for head in j['heads']:
            card=[*g[head],*h[head]]
            ranges=self.bounds.setdefault(head,[[float('inf'),float('-inf')] for _ in card])
            for axis,(value,pair) in enumerate(zip(card,ranges)):
                for side,better in enumerate((value<pair[0],value>pair[1])):
                    if better:
                        pair[side]=value
                        if axis==0:self.peakStates[head,side]=[wi,guard_id,sign]
        self.count+=1

    def output(self):
        return {'cases':self.count,'state':'uniform stripped roof suction and complete new wind; zero favourable gravity',
                'headComponentOrder':['N','Cx','Cy','Vx','Vy'],
                'heads':{h:{'ranges':[[round(v,3) for v in q] for q in row],
                            'normalControl':[self.peakStates[h,i] for i in (0,1)]} for h,row in sorted(self.bounds.items())}}
