"""Couple eight two-storey corner portals to the original pitched roof and cut RC floor.

N and mm internally. The portal substructure is condensed at its four true normal
ties. The ring uses its actual beam span (including local fixed-end flexibility)
and the membrane its original retained and interior displacement fields.
"""
from itertools import pairwise
from pathlib import Path
import json
import math
import runpy
import sys

D = Path(__file__).resolve().parent
read = lambda name: json.loads((D / name).read_text())
rewind = read('house-corner-rewind.json')
guard = read('current-house-window-receivers.json')['guard']['body']
guard_stock=read('current-house-guard-bracket.json')['massPerWindowKg']['authoredMassComparisonWithFivePercentOnOtherStockAnd1p5kgExecution']
rail=json.loads((D.parents[1]/'oas/studies/north-export-occurrence.json').read_text())['guard']
foundation = read('current-house-joined-foundation.json')
fields = read('open-loggia-support.json')['floor_fields']
slate=runpy.run_path(str(D/'reconciled-slate-roof.py'))
args = sys.argv[:]
sys.argv = [args[0], '--check']
roof = globals().get('roofKernel')
if roof is None:
    roof = runpy.run_path(str(D/'current-house-roof-bracing.py'))
ceiling = runpy.run_path(str(D/'current-house-arch-jambs.py'))
sys.argv = args
kernel = runpy.run_path(str(D/'arch-space-kernel.py'))
factor = roof['fac']
dot = lambda a, b: sum(x*y for x,y in zip(a,b))
mul = lambda m, v: [dot(row,v) for row in m]
faces = ['outer-south','outer-east','outer-north','outer-west']
base, floor, top = roof['base'], roof['ff'], roof['rr']
axes = (1497.5,2702.5)
ri = 1000**2/(8*300)+150
angle = math.asin(500/ri)
zc = 2850-ri
ground, upstairs = rewind['changes'][:8], rewind['changes'][8:]
assert [(o['side'],o['new']) for o in ground] == [(o['side'],o['new']) for o in upstairs]


def in_plane_station(o, x):
    return x if o['new']==2100 else 12000-x


def strip_at(o, u, level):
    face = o['side']
    axis = int(face in ('outer-west','outer-east'))
    coord = in_plane_station(o,u)
    if level:
        return ceiling['ceiling_load'](face,axis,coord)
    normal = 1-axis
    datum = roof['A'] if face in ('outer-south','outer-west') else roof['B']
    value = 0.
    for field in fields:
        r = field['rectangle']
        if ((field['direction']=='EW') == (normal==0)
                and datum in (r[normal],r[normal+2]) and r[axis]<=coord<r[axis+2]):
            value += (1.35*field['G']+1.5*field['Q'])*(r[normal+2]-r[normal])/2000
    return value


def opening_centroid(sill, offset):
    h = 2550+offset-sill
    cap = ri*ri*(angle-math.sin(angle)*math.cos(angle))
    cap_z = zc+offset+4*ri*math.sin(angle)**3/(3*(2*angle-math.sin(2*angle)))
    return (1000*h*(sill+h/2)+cap*cap_z)/(1000*h+cap)


class Portal(kernel['SpaceArch']):
    def __init__(self, crack, divisions=16):
        self.model = {'p':roof,'mul':mul}
        self.crack = crack
        self.arcs = []
        for offset in (0,3450):
            self.arcs.append([(2100+(ri+107.5)*math.sin(-angle+2*angle*j/divisions),
                               offset+zc+(ri+107.5)*math.cos(-angle+2*angle*j/divisions))
                              for j in range(divisions+1)])
        self.levels = sorted({base,floor,top,5430,5570,4700,5800,1250,2350,
                              *(arc[0][1] for arc in self.arcs)})
        self.nodes = sorted({*[(x,z) for x in axes for z in self.levels],
                             *self.arcs[0],*self.arcs[1]})
        self.index = {p:6*i for i,p in enumerate(self.nodes)}
        self.size = 6*len(self.nodes)
        self.matrix = [[0.]*self.size for _ in self.nodes for _ in range(6)]
        self.elements = []
        for x in axes:
            for lo,hi in pairwise(self.levels):
                self.member((x,lo),(x,hi),180,205,'jamb')
        for arc in self.arcs:
            for a,b in pairwise(arc):
                self.member(a,b,180,215,'arch')
            for point,x in zip((arc[0],arc[-1]),axes):
                self.member((x,point[1]),point,180,215,'knee')
        self.feet = [self.index[(x,base)]+i for x in axes for i in range(3)]
        self.ties = [self.index[(x,z)]+1 for z in (floor,top) for x in axes]
        self.fixed = self.feet+self.ties
        self.free = [i for i in range(self.size) if i not in self.fixed]
        self.solve = factor([[self.matrix[i][j] for j in self.free] for i in self.free])
        empty = [0.]*self.size
        self.modes = [self.response(empty,[int(i==j) for j in range(4)]) for i in range(4)]
        self.K = [[m[1][6+i] for m in self.modes] for i in range(4)]
        assert max(abs(self.K[i][j]-self.K[j][i]) for i in range(4) for j in range(4))<.001

    def position(self, point):
        return point[0],-20.,point[1]

    def response(self, load, tie=(0.,0.,0.,0.)):
        d = [0.]*self.size
        for i,v in zip(self.ties,tie):d[i]=v
        force = [load[i]-sum(self.matrix[i][j]*d[j] for j in self.ties) for i in self.free]
        for i,v in zip(self.free,self.solve(force)):d[i]=v
        reactions=[dot(self.matrix[i],d)-load[i] for i in self.fixed]
        return d,reactions

    def normal(self, rhs, side, force, elevation, node_z, at=None):
        x=axes[side]
        self.point(rhs,(x,node_z),(0.,force,0.),(x if at is None else at,-20.,elevation))

    def gravity_load(self, o):
        rhs=[0.]*self.size
        for e in self.elements:
            # Consistent beam self weight. Spandrel integrated at the actual
            # outer radius over the horizontal projection of each chord.
            a,b=e['left'],e['right']
            u=(a[0]+b[0])/2
            offset=3450 if (a[1]+b[1])/2>floor else 0
            solid=e['width']*e['depth']*e['length']
            other=0.
            if e['kind']=='arch':
                z_out=zc+offset+math.sqrt((ri+215)**2-(u-2100)**2)
                solid+=180*max(0,(6540 if offset else 3170)-z_out)*abs(b[0]-a[0])
                along=int(o['side'] in ('outer-west','outer-east'))
                cuts=set(ceiling['ledger']['cuts'][along]) if offset else {
                    field['rectangle'][idx] for field in fields for idx in (along,along+2)}
                xs=sorted({a[0],b[0],*(in_plane_station(o,x) for x in cuts
                          if a[0]<in_plane_station(o,x)<b[0])})
                other=sum((v-u)*strip_at(o,(u+v)/2,bool(offset)) for u,v in pairwise(xs))
            total=1.35*25*solid/1e6
            g=(0.,0.,-total)
            axial,normal,radial=e['axes']
            e['gravityEnd']={'axialHalf':dot(g,axial)/2000}
            for key,axis in [('weak',normal),('strong',radial)]:
                f=dot(g,axis)
                e['gravityEnd'][key]=[f/2000,f*e['length']/12e6,f/2000,-f*e['length']/12e6]
            moment=kernel['cross'](e['axes'][0],(0.,0.,-total))
            for side,point in enumerate((a,b)):
                self.point(rhs,point,(0.,0.,-total/2))
                if other:
                    self.point(rhs,point,(0.,0.,-other/2),(point[0],0.,point[1]))
                for j in range(3):
                    rhs[self.index[point]+j+3]+=(1 if side==0 else -1)*moment[j]*e['length']/12
        # Net frame/glass allowance is a design limit on EACH installed unit.
        for side,x in enumerate(axes):
            for z in (1250,4700):
                self.point(rhs,(x,z),(0.,0.,-1.35*200*9.81/2),(x,-85.,z))
            self.point(rhs,(x,5430),(0.,0.,-guard['guardMassULSKN']*1000/2),(x,-185.,5430))
            self.point(rhs,(x,5430),(0.,0.,-1.35*guard_stock*9.81/2),(x,-185.,5430))
        return rhs

    def pressure(self, lower, upper):
        rhs=[0.]*self.size
        old=[0.]*4
        for o,offset in ((lower,0),(upper,3450)):
            area=o['area']
            centre=opening_centroid(o['sill'],offset)
            # Upper guard and opening share the ONE gross wind patch. Separating
            # their forces/centroids conserves total force and elevation moment.
            pieces=[(area,centre,False)]
            if offset:
                rail_area=guard['steelProjectedAreaM2']
                rail_z=3450+(rail['bottom']+rail['top'])/2
                pieces=[(rail_area,rail_z,True),(area-rail_area,(area*centre-rail_area*rail_z)/(area-rail_area),False)]
            lower_z,upper_z=(floor,top) if offset else (base,floor)
            gross=(axes[1]-axes[0]+205)*(upper_z-lower_z)/1e6
            opaque=gross-area
            # Residual sill/spandrel and jamb fields span horizontally between
            # the two solid returns. Allocate that shell pressure once as well.
            pieces.append((opaque,(gross*(upper_z+lower_z)/2-area*centre)/opaque,False))
            for part,z,is_guard in pieces:
                force=2250*part/2
                for side in range(2):
                    pair=(5430,5570) if is_guard else ((4700,5800) if offset else (1250,2350))
                    v=(z-pair[0])/(pair[1]-pair[0])
                    for h,w in zip(pair,(1-v,v)):
                        self.normal(rhs,side,force*w,h,h,300+rail['boltXs'][side] if is_guard else None)
                    if z<=floor:old[side]+=force*(z-base)/(floor-base)
                    else:
                        v=(z-floor)/(top-floor)
                        old[side]+=force*(1-v);old[side+2]+=force*v
        return rhs,old

    def guard_point(self, side):
        rhs=[0.]*self.size
        # 1500 N retained crowd point near either rail end. Force and first
        # moment distributed to both jambs by the actual station of that end.
        at=rail['outsideX'][side]
        left,right=rail['boltXs']
        t=(at-left)/(right-left)
        ht=3450+rail['top']
        for j,w in enumerate((1-t,t)):
            split=(ht-5430)/140
            for z,q in zip((5430,5570),(1-split,split)):
                self.normal(rhs,j,1500*w*q,z,z,300+rail['boltXs'][j])
        return rhs

    def result(self, rhs):
        d,reactions=self.response(rhs)
        net=rhs[:]
        for i,v in zip(self.fixed,reactions):net[i]+=v
        residual=self.global_totals(net)
        assert max(abs(v) for v in residual) < .0001
        return d,reactions


def floor_vector(o,x):
    face=faces.index(o['side'])
    u=in_plane_station(o,x)
    along=face%2; normal=1-along
    xy=(u,roof['A'] if face==0 else roof['B']) if along==0 else (roof['A'] if face==3 else roof['B'],u)
    sign=1 if face in (0,3) else -1
    membrane=roof['membrane']
    terms=[(roof['spaceSize']-8+i,sign*v) for i,v in enumerate(membrane['reduced'](xy,normal))]
    return terms,(xy,normal,sign)


def ring_vector(o,x):
    face=faces.index(o['side'])
    pos=in_plane_station(o,x)
    u=pos if face<2 else 12000-pos
    cuts=roof['sides'][face,'outer']
    a,b=next((a,b) for a,b in pairwise(cuts) if a<=u<=b)
    t=(u-a)/(b-a); L=b-a
    # Wall-local outward-to-inward is the left normal of each directed span.
    sign=1 if face in (0,3) else -1
    ax=1-face%2
    terms=[]
    for at,w,tangent in ((a,1-3*t*t+2*t**3,L*t*(1-t)**2),
                          (b,3*t*t-2*t**3,L*t*t*(t-1))):
        p=roof['pt'](face,roof['A'],at)
        terms += [(roof['dof'](p,ax),w*sign),(roof['dof'](p,2),tangent)]
    return terms,(face,a,b,u)


def symmetric_ring(m,n):
    if m[:3]!=n[:3]:return 0.
    face,a,b,x=m
    L=b-a; x,y=sorted((x-a,n[3]-a))
    section=roof['collectorSection'](roof['pt'](face,roof['A'],a),roof['pt'](face,roof['A'],b))
    EI=roof['Es']*section['Iminor']
    return (L-y)**2*x*x*(3*y*L-(L+2*y)*x)/(6*EI*L**3)


def load_scope(programme,o):
    face=faces.index(o['side']); code=programme[1-face%2]
    if not code:return False
    target=((3 if code<4 else 1) if face%2 else (0 if code<4 else 2))
    u=o['new'] if face<2 else 12000-o['new']
    return face==target and ((code-1)%3==0 or ((code-1)%3==1)==(u<6000))


def house_interfaces():
    solver,_,_=roof['build'](False,True)
    membrane=roof['membrane']
    vectors=[]; supports=[]
    for o in ground:
        for make in (floor_vector,ring_vector):
            for x in axes:
                terms,where=make(o,x)
                v=[0.]*roof['spaceSize']
                for i,f in terms:v[i]+=f
                vectors.append(v);supports.append(where)
    deformed=[solver(v) for v in vectors]
    floor_free={s:membrane['recover']([0.]*8,{(s[0],s[1]):s[2]})[0] for s in supports if len(s)==3}
    C=[[dot(v,disp) for disp in deformed] for v in vectors]
    for i,m in enumerate(supports):
        for j,n in enumerate(supports):
            if len(m)==len(n)==4:C[i][j]+=symmetric_ring(m,n)
            if len(m)==len(n)==3:C[i][j]+=m[2]*sum(f*floor_free[n][k] for k,f in membrane['basis'](m[0],m[1]))
    assert max(abs(C[i][j]-C[j][i]) for i in range(32) for j in range(32))<1e-7
    backgrounds=[];full_backgrounds=[]
    cap=slate['CAP']
    lead_d,strip_d,roof_data=slate['origins'](roof,solver)
    lead_bg=[1.35*dot(v,lead_d) for v in vectors]
    strip_bg=[dot(v,strip_d) for v in vectors]
    for idx,(programme,u,*_) in enumerate(roof['space']):
        assert list(programme)==foundation['coherentSignedStates'][idx]['programme']
        raw=roof['floorLoadCases'][id(u)]
        free=membrane['recover']([0.]*8,raw)[0]
        # Replace prior projected wind top with the proposed cap maximum over
        # the complete face. This is a bounding rectangular projection, used
        # in both whole- and half-coverage tests; it is not added roof weight.
        f=[0.]*len(u)
        for ax,code in enumerate(programme):
            if not code:continue
            sign=1 if code<4 else -1;mode=(code-1)%3
            face=(3 if sign==1 else 1) if ax==0 else (0 if sign==1 else 2)
            low,high=(-200 if mode!=2 else 6000),(12200 if mode!=1 else 6000)
            outer=roof['sides'][face,'outer'];inner=roof['sides'][face,'inner']
            crowns=sorted({(roof['A']+roof['C'])/2,4700,7300,12000-(roof['A']+roof['C'])/2})
            cuts=sorted({low,high,*(x for x in [*outer,*inner,*crowns,4250,7750] if low<x<high)})
            for l,r in pairwise(cuts):
                x=(l+r)/2
                force=sign*2.25*(r-l)*(cap-roof['peak'])/1000
                arm=(cap+roof['peak'])/2-top
                high_f=force*arm/(roof['zhigh']+roof['seatZ']-top)
                use_inner=idx>=48 and 4250<x<7750
                for coords,norm,load,high_dof in ((crowns,crowns[0],high_f,True),
                      (inner if use_inner else outer,roof['C'] if use_inner else roof['A'],force-high_f,False)):
                    j=next((n for n in range(len(coords)-1) if x<=coords[n+1]),len(coords)-2)
                    a,b=coords[j:j+2];share=(x-a)/(b-a)
                    for at,w in ((a,1-share),(b,share)):
                        point=roof['pt'](face,norm,at)
                        k=(roof['highD'] if high_dof else roof['dof'])(point,ax)
                        f[k]+=load*w
        extra=solver(f)
        screen=[a+b for a,b in zip(u,extra)]
        full_backgrounds.append([a+b for a,b in zip(screen,strip_d)])
        values=[dot(v,screen) for v in vectors]
        for i,s in enumerate(supports):
            if len(s)==3:values[i]+=s[2]*sum(f*free[k] for k,f in membrane['basis'](s[0],s[1]))
        backgrounds.append(values)
    return C,backgrounds,deformed,full_backgrounds,lead_bg,strip_bg,roof_data


def measures(portal, disp, reactions, gravity=False):
    v={'footAlongKN':[reactions[0]/1000,reactions[3]/1000],
       'footNormalKN':[reactions[1]/1000,reactions[4]/1000],
       'footVerticalKN':[reactions[2]/1000,reactions[5]/1000],
       'floorTieKN':[x/1000 for x in reactions[6:8]],
       'roofTieKN':[x/1000 for x in reactions[8:]],
       'tieTravelMM':[disp[i] for i in portal.ties]}
    def normal_at(x,z):
        lo,hi=next((a,b) for a,b in pairwise(portal.levels) if a<=z<=b)
        t=(z-lo)/(hi-lo)
        return ((1-t)*disp[portal.index[(x,lo)]+1]+t*disp[portal.index[(x,hi)]+1])
    v['facePlaneDepartureMM']=[]
    v['roughOpeningTangentialChangeMM']=[]
    for arc,lo,hi in zip(portal.arcs,(1250,4700),(2350,5800)):
        # Three-point rigid face datum. The opposite upper fixing and crown
        # have to follow/float relative to it. Ground and first stay separate.
        a,b=axes
        def plane(x,z):
            return (normal_at(a,lo)+(normal_at(b,lo)-normal_at(a,lo))*(x-a)/(b-a)
                    +(normal_at(a,hi)-normal_at(a,lo))*(z-lo)/(hi-lo))
        for pt in [(b,hi),*arc[::4]]:
            v['facePlaneDepartureMM'].append(disp[portal.index[pt]+1]-plane(*pt))
        for z in (lo,hi,arc[0][1]):
            v['roughOpeningTangentialChangeMM'].append(disp[portal.index[(b,z)]]-disp[portal.index[(a,z)]])
    actions=portal.local_actions(disp,[e['gravityEnd'] for e in portal.elements] if gravity else None)
    for kind in ('arch','jamb','knee'):
        members=[x for x in actions if x['kind']==kind]
        for label,col,ix in [('AxialKN','axial',None),('TorsionKNm','torsion',None),
                             ('StrongMomentKNm','strong',(1,3)),('WeakMomentKNm','weak',(1,3))]:
            v[kind+label]=[a[col] for a in members] if ix is None else [a[col][j] for a in members for j in ix]
    return v


def calculate():
    C,bg,host_units,full_backgrounds,lead_bg,strip_bg,roof_data=house_interfaces()
    joined=runpy.run_path(str(D/'current-house-joined-foundation.py'))
    wind_foundation=runpy.run_path(str(D/'reconciled-foundation-join.py'))['WindFoundation']
    output=[]
    for crack in (.2,.35):
        portal=Portal(crack)
        register=wind_foundation(joined,roof,host_units,full_backgrounds)
        register.portal=portal;register.cap=slate['CAP'];register.extra_u=roof_data['extraStrippedUpliftKN']
        units=[]
        measures_units=[]
        for o,up in zip(ground,upstairs):
            pres,old=portal.pressure(o,up)
            loads=[portal.gravity_load(o),pres,portal.guard_point(0),portal.guard_point(1)]
            responses=[portal.result(f) for f in loads]
            units.append((responses,old))
            measures_units.append([measures(portal,*r,gravity=i==0) for i,r in enumerate([*responses,*portal.modes])])
        # 2 kN/mm is a required minimum assembled tie stiffness, not a product
        # attribution. Include its actual compliance rather than fixing a point.
        k_tie=2000.
        Ct=[[v+(1/k_tie if i==j else 0.) for j,v in enumerate(row)] for i,row in enumerate(C)]
        compat=[[float(i==j)+sum(Ct[i][4*(j//4)+k]*portal.K[k][j%4] for k in range(4))
                 for j in range(32)] for i in range(32)]
        solve=factor(compat)
        def coupled(background,which):
            fixed=[];rm=[]
            for (responses,old),weights in zip(units,which):
                fixed.extend(sum(q*r[1][6+i] for q,r in zip(weights,responses)) for i in range(4))
                rm.extend(old[j]*weights[1] for j in range(4))
            return solve([v-a-b for v,a,b in zip(background,mul(Ct,fixed),mul(C,rm))])
        zeros=[0.]*32
        # Local response recovery for one active point on one upper guard.
        increments=[]
        for target in range(8):
            for side in range(2):
                w=[[0.,0.,0.,0.] for _ in ground];w[target][2+side]=1.
                increments.append((target,side,coupled(zeros,w)))
        # For any linear scalar response the largest effect of one guard is the
        # greatest absolute unit increment. Keeping coherent base row + one
        # permitted guard sign/position obtains extrema without combining guards.
        peaks={};critical={}
        for a,table in enumerate(measures_units):
            for key,value in table[0].items():
                if key not in peaks:peaks[key]=[math.inf,-math.inf]
                for j in range(len(value)):
                    unit=[r[key][j] for r in table]
                    inc=[(abs((unit[2+side] if target==a else 0.)+dot(u[4*a:4*a+4],unit[4:])),target,side)
                         for target,side,u in increments]
                    critical[a,key,j]=max(inc)
        head_bounds={}
        for wi,background in enumerate(bg):
            prog=foundation['coherentSignedStates'][wi]['programme']
            active=[load_scope(prog,o) for o in ground]
            which=[[1.,float(on),0.,0.] for on in active]
            d=coupled([a+b for a,b in zip(background,lead_bg)],which)
            d_wind=coupled([a+b for a,b in zip(background,strip_bg)],[[0.,float(on),0.,0.] for on in active])
            for a,table in enumerate(measures_units):
                for key,value in table[0].items():
                    lo,hi=peaks[key]
                    for j,g in enumerate(value):
                        main=g+active[a]*table[1][key][j]+sum(d[4*a+k]*table[4+k][key][j] for k in range(4))
                        extra=critical[a,key,j][0]
                        lo=min(lo,main-extra);hi=max(hi,main+extra)
                    peaks[key]=[lo,hi]
            # Map each actual foot V to the two existing perimeter heads.
            # Include transfer of guard-induced vertical couples, one guard at
            # a time. These are portal origin cards, not old whole-head totals.
            for guard_case in [None,*increments]:
                for sign in ([0] if guard_case is None else [-1,1]):
                    register.capture(wi,active,ground,units,d_wind,guard_case[2] if guard_case else None,
                                     guard_case[:2] if guard_case else None,sign)
                    heads={}
                    vertical=0.;mom=[0.,0.]
                    home=roof['A'];away=roof['B']
                    for a,o in enumerate(ground):
                        for side,x in enumerate(axes):
                            table=measures_units[a];key='footVerticalKN'
                            vc=table[0][key][side]+active[a]*table[1][key][side]+sum(
                                d[4*a+k]*table[4+k][key][side] for k in range(4))
                            if guard_case:
                                target,pos,du=guard_case
                                vc+=sign*((table[2+pos][key][side] if target==a else 0.)+
                                          sum(du[4*a+k]*table[4+k][key][side] for k in range(4)))
                            ids,weights=o['headPairs'][side]
                            for name,f in zip(ids,weights):heads[name]=heads.get(name,0.)+vc*f
                            axis=faces.index(o['side'])%2
                            xy=[0.,0.];xy[axis]=in_plane_station(o,x)
                            xy[1-axis]=home if o['side'] in ('outer-south','outer-west') else away
                            vertical+=vc
                            for k in (0,1):mom[k]+=vc*xy[k]
                    grid={h['id']:h['xy'] for h in grid_heads}
                    assert abs(sum(heads.values())-vertical)<1e-7
                    assert all(abs(sum(v*grid[n][i] for n,v in heads.items())-mom[i])<1e-4 for i in (0,1))
                    for n,v in heads.items():
                        pair=head_bounds.setdefault(n,[math.inf,-math.inf]);pair[0]=min(pair[0],v);pair[1]=max(pair[1],v)
        output.append({'crackedEI':crack,'cases':len(bg)*33,'bounds':{k:[round(x,4) for x in vals] for k,vals in peaks.items()},
                       'strippedSignedFoundation':register.output(),
                       'portalOriginHeadVKN':{n:[round(x,4) for x in vals] for n,vals in sorted(head_bounds.items())}})
    return {'model':'Two-storey paired continuous jambs on perimeter girders; physically new portal origin only.',
            'jambAxes':axes,'supportZ':[base,floor,top],'tieMinimumNPerMM':2000,
            'trialWindowPerStoreyMaxCharacteristicKN':1.962,'windProjectedTopMM':round(slate['CAP'],5),'slateRoof':roof_data,
            'oldRoofWindProjectedTopMM':roof['peak'],'coherentWholeHouseWinds':len(bg),
            'simultaneousUpperGuardPoints':1,'results':output}


grid_heads=read('current-house-grid.json')['heads']
if not globals().get('definitionsOnly',False):
    result=calculate()
    target=Path(__file__).with_suffix('.json')
    contents=json.dumps(result,indent=2)+'\n'
    if '--check' in sys.argv:
        assert target.read_text()==contents, 'Rebuild the portal reaction handoff'
    else:
        target.write_text(contents)
    print('Eight two-storey portals, 96 roof/floor winds, and one two-sided guard point per state.')
