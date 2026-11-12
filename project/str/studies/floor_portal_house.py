"""Coupled floor/portal/roof/ground comparison on actual source geometry.

The named contact and stiffness parameters are comparison inputs. No soil
capacity, RC joint strength or construction acceptance is inferred from a solve.
"""
from pathlib import Path
from itertools import pairwise
from collections import defaultdict
from dataclasses import dataclass
import json
import math
import numpy as np
from scipy.linalg import solve as dense_solve
from scipy.sparse import csc_matrix
from floor_portal_frame import Frame,Solve,offset,membrane_triangle,plate_rectangle
from floor_portal_roof import Roof,outer_root

D=Path(__file__).resolve().parent
H=json.loads((D.parents[1]/'had/studies/water-replan.json').read_text())['model']
GRID=json.loads((D/'current-house-grid.json').read_text())
A,B,C,E=332.5,11667.5,3917.5,8082.5
FACES=['outer-south','outer-east','outer-north','outer-west']


def xy(face,q,u):return np.array([(u,q),(12000-q,u),(12000-u,12000-q),(q,12000-u)][face],dtype=float)
def inward(face):return np.array([(0,1,0),(-1,0,0),(0,-1,0),(1,0,0)][face],dtype=float)
def along(face):return np.array([(1,0,0),(0,1,0),(-1,0,0),(0,-1,0)][face],dtype=float)
def local(face,p):return [(p[0],p[1]),(p[1],12000-p[0]),(12000-p[0],12000-p[1]),(12000-p[1],p[0])][face]
def key(p):return tuple(round(float(x),7) for x in p)
def inside(p,r,tol=0):return r[0]-tol<=p[0]<=r[2]+tol and r[1]-tol<=p[1]<=r[3]+tol
def rectangle(face,u0,u1,q0,q1):
    v=np.array([xy(face,q,u) for q in (q0,q1) for u in (u0,u1)])
    return [*v.min(axis=0),*v.max(axis=0)]


@dataclass
class Parameters:
    mesh:float=1400.
    arch_divisions:int=12
    jamb_width:float=250.
    jamb_q:float=332.5
    local_flare:bool=True
    collector_width:float=160.
    corner_width:float=160.
    corner_end:float=1430.
    corner_haunch:float=0.
    joint_rigid_scale:float=1.
    crack:float=.25
    membrane_E:float=1200.
    masonry_E:float=3000.
    head_rotation:str='fixed'
    cap_scale:float=1.
    cap_anchor_length:float=805.
    L_cap_anchor_length:float=1320.
    cap_bearing_depth:float=180.
    cap_key_width:float=90.
    cap_key_thickness:float=10.
    cap_key_depth:float=60.
    L_key_width:float=90.
    L_key_thickness:float=10.
    L_key_depth:float=60.
    L_key_centres:tuple=((70.,70.),(900.,70.),(70.,900.))
    key_profile:str='historical tip-compliance control'
    key_direction_mode:str='cruciform'
    dpc_scale:float=1.
    dpc_anchor_length:float=1106.
    court_width:float=280.
    court_wall:float=25.


class ContactSolve:
    """Condense finite unilateral links against the complete elastic house.

    Each U column is the force conjugate of an ACTUAL two-port displacement
    difference. q>=0 pushes its positive port away from its negative port.
    """
    def __init__(self,k,fixed,contacts):
        self.base=Solve(k,fixed);self.k=k;self.contacts=contacts
        self.U=np.zeros((k.shape[0],len(contacts)))
        self.stiffness=np.array([r['stiffness'] for r in contacts])
        for j,r in enumerate(contacts):np.add.at(self.U[:,j],r['ids'],r['row'])
        self.X=self.base(self.U);self.C=self.U.T@self.X
        assert np.max(abs(self.C-self.C.T))<1e-8

    def __call__(self,f,prescribed=None):
        u0=self.base(f,prescribed);g0=self.U.T@u0
        active=g0<0;q=np.zeros(len(active));iterations=0
        for iterations in range(60):
            q[:]=0;ii=np.flatnonzero(active)
            if len(ii):q[ii]=dense_solve(self.C[np.ix_(ii,ii)]+np.diag(1/self.stiffness[ii]),-g0[ii],assume_a='sym')
            gap=g0+self.C@q
            new=np.where(active,q>1e-7,gap<-1e-9)
            if np.array_equal(new,active):break
            active=new
        else:raise AssertionError('Contact active set did not settle')
        u=u0+self.X@q
        actual=self.U.T@u
        error=np.max(abs(q-self.stiffness*np.maximum(-actual,0)),initial=0)
        assert error<.03,(error,iterations)
        reaction=self.k@u-np.asarray(f)-self.U@q
        return u,reaction,dict(force=q,gap=actual,active=active,iterations=iterations+1,errorN=float(error))


class House:
    def __init__(self,parameters=None):
        self.p=parameters or Parameters();self.f=Frame();self.contacts=[];self.members=defaultdict(list)
        self.jambs=[];self.Ls=[];self.joints={};self.floor_beams={};self.floor_cells=[]
        self.ground_lines={};self.ground_cuts={};self.ground_nodes={};self.heads={}
        self.pads=[];self.upper_links=[];self.cap_links=[];self.dpc_links=[]
        self.rc_boxes=[];self.arch_strips=[];self.flare_solids=[]
        self.roof=Roof(self.p.court_width,self.p.court_wall,extra_L_keys=self.p.L_key_centres)
        self.prepare_geometry()
        self.build_ground()
        self.build_vertical()
        self.build_collectors()
        self.build_trimmers()
        self.build_floor()
        self.build_lower_contacts()
        self.prepare_upper()
        self.roof.mount(self.f)
        self.build_roof_links()
        self.k=self.f.matrix();self.rigid=self.f.rigid()
        self.fixed=[d for node in self.heads.values() for d in range(node,node+(6 if self.p.head_rotation=='fixed' else 3))]

    def node(self,name,p):return self.f.node(name,key(p))

    def contact(self,a,b,k,name,axis=2,sign=1.):
        ia,ta=a;ib,tb=b
        self.contacts.append(dict(name=name,ids=np.r_[ia,ib],row=np.r_[ta[axis],-tb[axis]]*sign,stiffness=float(k),
                                  ports=(a,b),axis=axis,sign=sign))

    def prepare_geometry(self):
        p=self.p;f=self.f
        for name,g in GRID['girders'].items():
            axis=0 if g['axis']=='x' else 1
            a=[0.,0.];b=[0.,0.];a[axis],b[axis]=g['extent'];a[1-axis]=b[1-axis]=g['datum']
            self.ground_lines[name]=(np.array(a),np.array(b),g['width'],g['z'])
        for name,g in GRID['crossBeams'].items():self.ground_lines[name]=(np.array(g['a'],float),np.array(g['b'],float),g['width'],g['z'])
        for name,(a,b,w,z) in self.ground_lines.items():self.ground_cuts[name]={float(a[0] if a[0]!=b[0] else a[1]),float(b[0] if a[0]!=b[0] else b[1])}
        for name,(a,b,w,z) in self.ground_lines.items():
            axis=int(a[0]==b[0])
            for other,(c,d,ww,zz) in self.ground_lines.items():
                ax2=int(c[0]==d[0])
                if axis==ax2:continue
                point=np.array([0.,0.]);point[axis]=c[axis];point[ax2]=a[ax2]
                if min(a[axis],b[axis])-1e-8<=point[axis]<=max(a[axis],b[axis])+1e-8 and min(c[ax2],d[ax2])-1e-8<=point[ax2]<=max(c[ax2],d[ax2])+1e-8:self.ground_cuts[name].add(float(point[axis]))
        for head in GRID['heads']:
            for name,g in GRID['girders'].items():
                if any(row['id']==head['id'] for row in g['heads']):self.reserve_ground(name,head['xy'])
        self.holes=[[r[0],r[1],r[0]+r[2],r[1]+r[3]] for r in [H['court'],H['stair'],H['void']]]+[[1812.5,9252.5,2212.5,9652.5]]
        source_frame=json.loads((D/'open-loggia-support.json').read_text())['finite_floor_frame']
        self.trimmers=[]
        for row in source_frame['corner_collectors']:
            self.trimmers.append(dict(name=row['id'],axis=0,datum=row['axis_y'],lo=min(row['x_supports']),hi=max(row['x_supports']),width=row['section']['b'],depth=row['section']['h']))
        for name in ('west_return','long_trimmer','stair_header'):
            row=source_frame[name];axis=0 if 'axis_y' in row else 1;stations=row['x_supports'] if axis==0 else row['y_supports']
            self.trimmers.append(dict(name=name,axis=axis,datum=row['axis_y' if axis==0 else 'axis_x'],lo=min(stations),hi=max(stations),width=row['section']['b'],depth=row['section']['h']))
        wet=json.loads((D/'open-loggia-support.json').read_text())['wet_wall_beam']['section']
        self.trimmers.append(dict(name='wet-upper-beam',axis=1,datum=2902.5,lo=8852.5,hi=B,width=wet['b'],depth=wet['h']))
        self.trimmer_joints=[]
        for tr in self.trimmers:
            lo,hi,d,w=tr['lo'],tr['hi'],tr['datum'],tr['width']
            tr['rect']=[lo,d-w/2,hi,d+w/2] if tr['axis']==0 else [d-w/2,lo,d+w/2,hi]
            self.rc_boxes.append(('trimmer-'+tr['name'],tr['rect']+[3370.-tr['depth'],3370.],'trimmer'))
        for tr in self.trimmers:
            for other in self.trimmers:
                if tr['axis']==other['axis']:continue
                pt=np.array([tr['datum'] if tr['axis'] else other['datum'],other['datum'] if tr['axis'] else tr['datum']])
                if inside(pt,tr['rect']) and inside(pt,other['rect']):self.trimmer_joints.append((pt,[pt[0]-100,pt[1]-100,pt[0]+100,pt[1]+100]))
        self.collectors=[]
        for kind,lo,hi,depth in [('outer',A,B,750.),('court',C,E,650.)]:
            for face in range(4):
                q=lo if kind=='outer' else C
                # pt(face,C,lo..hi) describes the four court faces too.
                rect=rectangle(face,lo-p.collector_width/2,hi+p.collector_width/2,q-p.collector_width/2,q+p.collector_width/2)
                rectangles=[rect]
                if kind=='outer' and p.corner_width>p.collector_width+1e-9:
                    rectangles += [
                        rectangle(face,A,p.corner_end,q-p.corner_width/2,q+p.corner_width/2),
                        rectangle(face,12000-p.corner_end,B,q-p.corner_width/2,q+p.corner_width/2),
                    ]
                self.collectors.append(dict(kind=kind,face=face,q=q,lo=lo,hi=hi,depth=depth,z=3170+depth/2,rect=rect,rectangles=rectangles,cuts={lo,hi}))
                for body in rectangles:self.rc_boxes.append((f'{kind}-collector-{face}',body+[3170.,3170.+depth],'collector'))
        for face in range(4):
            for centre in (2100.,9900.):
                for u in (centre-602.5,centre+602.5):
                    rect=rectangle(face,u-102.5,u+102.5,p.jamb_q-p.jamb_width/2,p.jamb_q+p.jamb_width/2)
                    node=self.node(('jamb-floor',face,u),[*xy(face,p.jamb_q,u),3545.])
                    j=dict(face=face,u=u,centre=centre,rect=rect,joint=node)
                    self.jambs.append(j)
                    if p.local_flare:
                        old=rectangle(face,u-102.5,u+102.5,222.5,402.5)
                        for za,zb in [(-180.,2770.),(4320.,6515.)]:self.rc_boxes.insert(0,(f'jamb-{face}-{u:g}-{za:g}',old+[za,zb],'jamb'))
                        self.rc_boxes.insert(0,(f'jamb-{face}-{u:g}-joint',rect+[3170.,3920.],'jamb'))
                        self.flare_solids.extend([dict(face=face,u=u,za=2770.,zb=3170.,q0=(222.5,402.5),q1=(p.jamb_q-p.jamb_width/2,p.jamb_q+p.jamb_width/2)),dict(face=face,u=u,za=3920.,zb=4320.,q0=(p.jamb_q-p.jamb_width/2,p.jamb_q+p.jamb_width/2),q1=(222.5,402.5))])
                    else:self.rc_boxes.insert(0,(f'jamb-{face}-{u:g}',rect+[-180.,6515.],'jamb'))
                    self.reserve_ground('outer-'+['S','E','N','W'][face] if face!=2 else ('outer-NW' if xy(face,p.jamb_q,u)[0]<6000 else 'outer-NE'),xy(face,p.jamb_q,u))
        # Actual1000x140 L footprints, preserving source bar/DPC locations.
        rects=[(0.,0.,1000.,140.),(0.,140.,140.,1000.)]
        area=sum((b-a)*(d-c) for a,c,b,d in rects)
        cc=sum((b-a)*(d-c)*(a+b)/2 for a,c,b,d in rects)/area
        I=sum((d-c)*(b-a)**3/12+(b-a)*(d-c)*((a+b)/2-cc)**2 for a,c,b,d in rects)
        Ixy=sum((b-a)*(d-c)*((a+b)/2-cc)*((c+d)/2-cc) for a,c,b,d in rects)
        for corner in [(A,A),(B,A),(B,B),(A,B)]:
            sg=np.array([1 if v==A else -1 for v in corner]);origin=np.array(corner)-sg*70
            centroid=origin+sg*cc;foot=[]
            for l,b,r,t in rects:
                pts=np.array([origin+sg*np.array([x,y]) for x in (l,r) for y in (b,t)])
                rect=[*pts.min(axis=0),*pts.max(axis=0)];foot.append(rect)
                self.rc_boxes.insert(0,(f'L-{corner}-{len(foot)}',rect+[-180.,6515.],'L'))
            haunches=[]
            if p.corner_haunch>1e-9:
                start=np.array(corner)+sg*p.corner_width/2
                finish=start+sg*p.corner_haunch
                haunch=[*np.minimum(start,finish),*np.maximum(start,finish)]
                haunches.append(haunch)
                self.rc_boxes.insert(0,(f'L-{corner}-haunch',haunch+[3170.,3920.],'L'))
            vals,vec=np.linalg.eigh([[I,Ixy*sg[0]*sg[1]],[Ixy*sg[0]*sg[1],I]])
            j=dict(corner=corner,centroid=centroid,foot=foot,haunches=haunches,area=area,I=vals,normal=[*vec[:,0],0.],origin=origin,sg=sg)
            j['joint']=self.node(('L-floor',corner),[*centroid,3545.]);self.Ls.append(j)
            # Two real ground beam lines receive the footprint; the centroid
            # reference is linked through actual cap/beam offsets below.
            for name in (('outer-W' if corner[0]==A else 'outer-E'),('outer-S' if corner[1]==A else 'outer-NW' if corner[0]==A else 'outer-NE')):
                self.reserve_ground(name,corner)
        basecuts=[{A,B,C,E,A+80,B-80,C-80,C+80,E-80,E+80},{A,B,C,E,A+80,B-80,C-80,C+80,E-80,E+80}]
        collector_rects=[r for c in self.collectors for r in c['rectangles']]
        L_solids=[r for l in self.Ls for r in l['foot']+l['haunches']]
        for r in self.holes+[j['rect'] for j in self.jambs]+L_solids+collector_rects+[t['rect'] for t in self.trimmers]+[r for pt,r in self.trimmer_joints]:
            for axis in (0,1):basecuts[axis].update([r[axis],r[axis+2]])
        for wall in H['groundWalls']:
            a,b=np.array(wall['a'],float),np.array(wall['b'],float);axis=int(a[0]==b[0])
            basecuts[1-axis].add(float(a[1-axis]));basecuts[axis].update([a[axis],b[axis]])
            for hole in wall.get('holes',[]):basecuts[axis].update(hole)
        for op in H['openings']['GROUND']:
            face=next((i for i,n in enumerate(FACES) if op['wall']==n),None)
            court=op['wall'].startswith('court-')
            if face is None and court:face=['south','east','north','west'].index(op['wall'][6:])
            if face is None:continue
            centre={1800:2100,10200:9900}.get(op['centre'],op['centre']) if not court else op['centre']
            ends=[centre-op['width']/2,centre+op['width']/2]
            basecuts[int(face in (1,3))].update(v if face<2 else 12000-v for v in ends)
        for row in json.loads((D/'current-house-ground-ties.json').read_text())['court']:
            for ax in (0,1):basecuts[ax].add(row['floorRodGroup'][ax])
        # Header/trimmer/bridge are actual source lines, not nearest supports.
        for axis,values in ((0,[2817.5,2917.5,2942.5,4377.5,4785,7215,7622.5,9300]),(1,[2650,3247.5,3700,3917.5,4332.5,7257.5,8290,8852.5])):basecuts[axis].update(values)
        self.cuts=[]
        for vals in basecuts:
            vals=sorted(x for x in vals if A<=x<=B);out=[]
            for a,b in pairwise(vals):out.extend(a+(b-a)*i/max(1,math.ceil((b-a)/p.mesh)) for i in range(max(1,math.ceil((b-a)/p.mesh))))
            self.cuts.append(out+[B])
        self.prepare_pads()
        for col in self.collectors:
            face=col['face'];global_axis=int(face in (1,3))
            col['cuts'].update(local(face,[u,col['q']] if global_axis==0 else [col['q'],u])[0] for u in [])
            col['cuts'].update(u if face<2 else 12000-u for u in self.cuts[global_axis] if col['lo']<=u<=col['hi'])
            if col['kind']=='outer':
                if p.corner_width>p.collector_width+1e-9:
                    col['cuts'].update((p.corner_end,12000-p.corner_end))
                for centre in (2100.,9900.):
                    col['cuts'].update(centre+d for d in (-705.,-602.5,-500.,500.,602.5,705.))
                    ri=1000**2/(8*300)+150;radius=ri+107.5;angle=math.asin(500/radius)
                    col['cuts'].update(centre+radius*math.sin(-angle+2*angle*i/p.arch_divisions) for i in range(p.arch_divisions+1))
            for q in self.roof.p['upperSupports']:
                u,n=local(face,q)
                if abs(n-col['q'])<1e-7 and col['lo']<=u<=col['hi']:col['cuts'].add(float(u))
        for row in json.loads((D/'current-house-ground-ties.json').read_text())['court']:
            xy0=row['floorRodGroup'];self.reserve_ground(next(name for name in GRID['girders'] if name.startswith('court') and row['head'] in [r['id'] for r in GRID['girders'][name]['heads']]),xy0)

    def reserve_ground(self,name,point):
        a,b,w,z=self.ground_lines[name];axis=int(a[0]==b[0]);u=float(np.clip(point[axis],min(a[axis],b[axis]),max(a[axis],b[axis])))
        self.ground_cuts[name].add(u)
        return name,u

    def prepare_pads(self):
        mapping={'study-east':'study-east','cloak-east':'study-east','cloak-west':'cloak-west','cloak-south':'cloak-south','study-cloak-north':'study-north','study-L-return':'study-L-return','study-L-north':'study-L-north','wc-west':'wc-west','wc-north':'wc-north','service-spine':'spine','utility-north':'utility-north','plant-intermediate-arch':'plant-intermediate','plant-north':'passage-S','rear-west':'rear-W','rear-east':'rear-E','loggia-west-weather':'loggia-W','loggia-east-weather':'loggia-E','protected-stair-east':'stair-post','protected-west-cross':'protected-W','protected-east-cross':'protected-E','east-passage-north-weather':'passage-N'}
        rows=[]
        for wall in H['groundWalls']:
            if wall['id']=='gallery-east-water-weather':continue
            a,b=np.array(wall['a'],float),np.array(wall['b'],float);axis=int(a[0]==b[0]);lo,hi=sorted((max(A,min(a[axis],b[axis])),min(B,max(a[axis],b[axis]))))
            holes=wall.get('holes',[]);cuts=sorted({lo,hi,*[v for v in self.cuts[axis] if lo<v<hi]})
            for l,r in pairwise(cuts):
                if any(x<(l+r)/2<y for x,y in holes):continue
                midpoint=a.copy();midpoint[axis]=(l+r)/2
                if any(inside(midpoint,h,-1e-7) for h in self.holes):continue
                name=mapping[wall['id']]
                if name=='rear-W' and midpoint[0]>2942.5:name='rear-W-end'
                for v in (l,r):
                    point=a.copy();point[axis]=v
                    rows.append((point,(r-l)/2,140.,name,wall['id']))
        for face in range(4):
            name=FACES[face];global_axis=int(face in (1,3));holes=[]
            for op in H['openings']['GROUND']:
                if op['wall']!=name:continue
                centre=op['centre'];centre={1800:2100,10200:9900}.get(centre,centre)
                lo,hi=centre-op['width']/2,centre+op['width']/2
                if face>=2:lo,hi=12000-hi,12000-lo
                holes.append((lo,hi))
            cuts=sorted({A,B,*[u if face<2 else 12000-u for u in self.cuts[global_axis]],*[v for h in holes for v in h]})
            for l,r in pairwise(cuts):
                u=(l+r)/2
                if not A<=u<=B or any(lo<u<hi for lo,hi in holes):continue
                point=xy(face,A,u)
                if any(inside(point,j['rect']) for j in self.jambs) or any(inside(point,rr) for L in self.Ls for rr in L['foot']):continue
                ground='outer-'+['S','E','N','W'][face]
                if face==2:ground='outer-NW' if point[0]<=4500 else 'outer-NE'
                if face==2 and 4500<point[0]<7500:continue
                for v in (l,r):rows.append((xy(face,A,v),(r-l)/2,140.,ground,name))
        for face in range(4):
            name='court-'+['south','east','north','west'][face]
            holes=[]
            for op in H['openings']['GROUND']:
                if op['wall']==name:
                    lo,hi=op['centre']-op['width']/2,op['centre']+op['width']/2
                    if face>=2:lo,hi=12000-hi,12000-lo
                    holes.append((lo,hi))
            axis=int(face in (1,3));cuts=sorted({C,E,*[u if face<2 else 12000-u for u in self.cuts[axis] if C<u<E],*[v for h in holes for v in h if C<v<E]})
            for l,r in pairwise(cuts):
                u=(l+r)/2
                if any(lo<u<hi for lo,hi in holes):continue
                point=xy(face,C,u);ground='court-'+['S','E','N','W'][face]
                if face==2:
                    if 4500<point[0]<7500:continue
                    ground='court-NW' if point[0]<=4500 else 'court-NE'
                for v in (l,r):rows.append((xy(face,C,v),(r-l)/2,140.,ground,name))
        for point,length,width,ground,name in rows:
            self.reserve_ground(ground,point);self.pads.append(dict(point=point,length=length,width=width,ground=ground,name=name))

    def ground_node(self,name,u):
        a,b,w,z=self.ground_lines[name];axis=int(a[0]==b[0]);point=a.copy();point[axis]=u
        k=key(point)
        if k not in self.ground_nodes:self.ground_nodes[k]=self.node(('ground',k),[*point,-405.])
        return self.ground_nodes[k]

    def ground_port(self,name,point,z=-180.):
        a,b,w,zs=self.ground_lines[name];axis=int(a[0]==b[0]);u=float(np.clip(point[axis],min(a[axis],b[axis]),max(a[axis],b[axis])))
        node=self.ground_node(name,u)
        return self.f.port(node,[*point,z])

    def build_ground(self):
        for name,(a,b,w,z) in self.ground_lines.items():
            for lo,hi in pairwise(sorted(self.ground_cuts[name])):
                aa,bb=self.ground_node(name,lo),self.ground_node(name,hi);dz=(z[0]+z[1])/2+405
                e=self.f.beam(aa,bb,w,z[1]-z[0],name,crack=self.p.crack,ra=[0,0,dz],rb=[0,0,dz])
                self.members['ground'].append(e)
        for head in GRID['heads']:
            h=self.node(('head',head['id']),[*head['xy'],-750.]);self.heads[head['id']]=h
            name=next(name for name,g in GRID['girders'].items() if any(row['id']==head['id'] for row in g['heads']))
            a,b,w,z=self.ground_lines[name];axis=int(a[0]==b[0]);u=float(np.clip(head['xy'][axis],min(a[axis],b[axis]),max(a[axis],b[axis])))
            top=self.ground_node(name,u);target=np.array([*head['xy'],-630.]);rb=target-self.f.points[top//6]
            self.members['cap'].append(self.f.beam(h,top,*head['capXY'],'foundation-cap',ra=[0,0,0],rb=rb,crack=self.p.crack))
        assert len(self.heads)==52

    def dpc(self,lower,upper,points,area,name,face=None,foot_rects=None):
        # Source topology: continuous tensile bars through opposed blind
        # threads; a solid central metal band and positive shear keys.
        centre=self.f.points[upper//6]
        # One positively bearing leading key face per axis. Finite steel and
        # concrete compliance are in series; yaw follows the located faces.
        if face is not None:
            keypoints=[centre+along(face)*s+inward(face)*q for s in (-60/math.sqrt(3),60/math.sqrt(3)) for q in (-52.,52.)]
            directions=[(along(face),3600.),(inward(face),7200.)]
        else:
            keypoints=[centre+np.array([x,y,0.]) for x,y,As in points]
            directions=[(np.array([1.,0.,0.]),8400.),(np.array([0.,1.,0.]),8400.)]
        for direction,keyarea in directions:
            stiffness=1/(140/(77000*keyarea)+60/(33000*keyarea))*self.p.dpc_scale
            for pos in keypoints:
                k=np.zeros((6,6));k[:3,:3]=np.outer(direction,direction)*stiffness/len(keypoints)
                self.dpc_links.append(self.f.link(self.f.port(upper,pos),self.f.port(lower,pos),k,name+'-key'))
        for i,(x,y,As) in enumerate(points):
            at=centre+[x,y,0.]
            a=self.f.port(upper,at);b=self.f.port(lower,at);ia,ta=a;ib,tb=b;row=np.r_[ta[2],-tb[2]]
            k=200000*As/self.p.dpc_anchor_length*self.p.dpc_scale
            self.dpc_links.append(self.f.link(a,b,[0,0,k,0,0,0],name+f'-bar-{i}'))
        if face is not None:
            gp,gw=np.polynomial.legendre.leggauss(3)
            bearings=[(centre+along(face)*x*205/2+inward(face)*y*180/2,area*wx*wy/4) for x,wx in zip(gp,gw) for y,wy in zip(gp,gw)]
        else:
            gp,gw=np.polynomial.legendre.leggauss(2);bearings=[]
            for l,b,r,t in foot_rects:
                for x,wx in zip(gp,gw):
                    for y,wy in zip(gp,gw):bearings.append((np.array([(l+r)/2+x*(r-l)/2,(b+t)/2+y*(t-b)/2,-40.]),(r-l)*(t-b)*wx*wy/4))
        for i,(at,weight) in enumerate(bearings):
            self.contact(self.f.port(upper,at),self.f.port(lower,at),weight/(140/33000+20/200000)*self.p.dpc_scale,name+f'-bearing-{i}')

    def jamb_section(self,z):
        if not self.p.local_flare:return self.p.jamb_q,self.p.jamb_width
        fraction=max(0.,min(1.,(z-2770.)/400.,(4320.-z)/400.))
        return 312.5+fraction*(self.p.jamb_q-312.5),180.+fraction*(self.p.jamb_width-180.)

    def build_vertical(self):
        ri=1000**2/(8*300)+150;radius=ri+107.5;theta=math.asin(500/radius);arch_z=2850-ri+math.sqrt(radius**2-500**2)
        self.arch_z=arch_z
        for j in self.jambs:
            face,u=j['face'],j['u'];qfoot,wfoot=self.jamb_section(-180.);plan=xy(face,qfoot,u)
            ground='outer-'+['S','E','N','W'][face]
            if face==2:ground='outer-NW' if plan[0]<6000 else 'outer-NE'
            foot=self.ground_port(ground,plan,-180.)[0][0]
            lower=self.node(('jamb-dpc-lower',face,u),[*plan,-40.]);upper=self.node(('jamb-dpc-upper',face,u),[*plan,-40.])
            ra=np.array([*plan,-180.])-self.f.points[foot//6]
            self.members['jamb'].append(self.f.beam(foot,lower,wfoot,205.,'jamb-foot',normal=inward(face),ra=ra,rb=[0,0,-70.],crack=self.p.crack))
            points=[]
            for s in (-32.,32.):
                for q in (-(wfoot/2-38.),wfoot/2-38.):
                    d=along(face)*s+inward(face)*q;points.append((d[0],d[1],math.pi*12**2/4))
            self.dpc(lower,upper,points,wfoot*205.,f'jamb-{face}-{u:g}-DPC',face=face)
            levels=[-40.,1250.,2350.,arch_z,3545.,4700.,5430.,5570.,5800.,3450+arch_z,6515.]
            if self.p.local_flare:levels+= [z for z in (2770.,2870.,2970.,3070.,4020.,4120.,4220.,4320.) if abs(z-arch_z)>107.5]
            if self.p.joint_rigid_scale<1-1e-12:levels += [3170.,3920.]
            levels=sorted(levels)
            nodes={-40.:upper,3545.:j['joint']}
            for z in levels:
                if z not in nodes:nodes[z]=self.node(('jamb',face,u,z),[*xy(face,self.jamb_section(z)[0],u),z])
            j['levels']=nodes;j['top']=nodes[6515.];j['foot']=foot;j['dpc']=(lower,upper)
            half=lambda z:375.*self.p.joint_rigid_scale if z==3545. else 107.5*self.p.joint_rigid_scale if z in (arch_z,3450+arch_z) else 70. if z==-40. else 0.
            for za,zb in pairwise(levels):
                za_end,zb_end=za+half(za),zb-half(zb)
                pa=np.array([*xy(face,self.jamb_section(za_end)[0],u),za_end]);pb=np.array([*xy(face,self.jamb_section(zb_end)[0],u),zb_end])
                e=self.f.beam(nodes[za],nodes[zb],self.jamb_section((za_end+zb_end)/2)[1],205.,f'jamb-{face}-{u:g}',normal=inward(face),ra=pa-self.f.points[nodes[za]//6],rb=pb-self.f.points[nodes[zb]//6],crack=self.p.crack)
                self.members['jamb'].append(e)
        for L in self.Ls:
            corner=L['corner'];plan=L['centroid'];ground='outer-W' if corner[0]==A else 'outer-E'
            foot=self.ground_port(ground,corner,-180.)[0][0]
            lower=self.node(('L-dpc-lower',corner),[*plan,-40.]);upper=self.node(('L-dpc-upper',corner),[*plan,-40.])
            sec=(L['area'],L['I'][1],L['I'][0],2*(1000-70)*140**3/3)
            self.members['L'].append(self.f.beam(foot,lower,140,1000,'L-foot',normal=L['normal'],ra=np.array([*plan,-180.])-self.f.points[foot//6],rb=[0,0,-70],section=sec,crack=self.p.crack))
            source=json.loads((D/'current-house-ground-ties.json').read_text())['outer']['primaryBarXY'];pts=[]
            for x,y in source:
                v=L['origin']+L['sg']*np.array([x,y])-plan;pts.append((v[0],v[1],math.pi*20**2/4))
            self.dpc(lower,upper,pts,L['area'],f'L-{corner}-DPC',foot_rects=L['foot'])
            top=self.node(('L-top',corner),[*plan,6515.]);L['top']=top;L['foot_node']=foot
            cut=375*self.p.joint_rigid_scale
            self.members['L'].append(self.f.beam(upper,L['joint'],140,1000,'L-lower',normal=L['normal'],ra=[0,0,70],rb=[0,0,-cut],section=sec,crack=self.p.crack))
            self.members['L'].append(self.f.beam(L['joint'],top,140,1000,'L-upper',normal=L['normal'],ra=[0,0,cut],section=sec,crack=self.p.crack))
        for face in range(4):
            for centre in (2100.,9900.):
                ends=sorted([j for j in self.jambs if j['face']==face and j['centre']==centre],key=lambda j:j['u'])
                for dz in (0.,3450.):
                    points=[]
                    for i in range(self.p.arch_divisions+1):
                        angle=-theta+2*theta*i/self.p.arch_divisions;u=centre+radius*math.sin(angle);z=dz+2850-ri+radius*math.cos(angle)
                        if i==0 or i==self.p.arch_divisions:
                            node=ends[int(i>0)]['levels'][arch_z+dz]
                        else:node=self.node(('arch',face,centre,dz,i),[*xy(face,312.5,u),z])
                        at=np.array([*xy(face,312.5,u),z]);points.append((u,z,node,at))
                    for aa,bb in pairwise(points):
                        u,z,node,at=aa;v,zz,n2,at2=bb
                        self.members['arch'].append(self.f.beam(node,n2,180.,215.,'arch',normal=inward(face),ra=at-self.f.points[node//6],rb=at2-self.f.points[n2//6],crack=self.p.crack))
                    if dz==0:
                        # Actual central arch/spandrel material meets the floor
                        # soffit. Finite web strips, not normal-only springs.
                        for i,(u,z,node,at) in enumerate(points):
                            length=(points[min(i+1,len(points)-1)][0]-points[max(i-1,0)][0])/2
                            if length<=0:continue
                            zout=2850-ri+math.sqrt((ri+215)**2-(u-centre)**2)
                            top,at_top=self.collector_ref(face,'outer',u,3170.)
                            start=np.array([*xy(face,312.5,u),zout]);finish=np.array([*xy(face,312.5,u),3170.])
                            if finish[2]-start[2]>.01:self.members['web'].append(self.f.beam(node,top,180.,length,'lower-spandrel-web',normal=inward(face),ra=start-self.f.points[node//6],rb=finish-self.f.points[top//6],crack=self.p.crack))
                    self.arch_strips.append(dict(face=face,centre=centre,dz=dz,points=points,top=3170. if dz==0 else 6515.))

    def collector_ref(self,face,kind,u,z=None):
        col=next(c for c in self.collectors if c['kind']==kind and c['face']==face)
        plan=xy(face,col['q'],u);point=np.array([*plan,col['z'] if z is None else z])
        if kind=='outer':
            for j in self.jambs:
                if j['face']==face and abs(j['u']-u)<=102.5+1e-6:return j['joint'],point
            for L in self.Ls:
                if any(inside(plan,r,1e-6) for r in L['foot']+L['haunches']):return L['joint'],point
        k=(kind,face,round(u,7));
        # Corner coordinates are shared by the two adjacent collector lines.
        n=self.node(('collector',key([*plan,col['z']])),[*plan,col['z']]);self.floor_beams[k]=n
        return n,point

    def build_collectors(self):
        for c in self.collectors:
            for a,b in pairwise(sorted(c['cuts'])):
                aa,pa=self.collector_ref(c['face'],c['kind'],a);bb,pb=self.collector_ref(c['face'],c['kind'],b)
                if aa==bb:continue
                area=(12 if c['kind']=='outer' else 8)*math.pi*16**2/4+8*math.pi*12**2/4
                # Replace the old8H12 chord and weak beam entirely. The slab
                # does not occupy this strip, so its membrane is not duplicated.
                ea=200000*area
                midpoint=(a+b)/2
                width=self.p.corner_width if c['kind']=='outer' and (midpoint<self.p.corner_end or midpoint>12000-self.p.corner_end) else self.p.collector_width
                e=self.f.beam(aa,bb,width,c['depth'],c['kind']+'-collector',normal=inward(c['face']),ra=pa-self.f.points[aa//6],rb=pb-self.f.points[bb//6],EA=ea,crack=self.p.crack)
                self.members['collector'].append(e)

    def floor_port(self,point):
        pt=np.asarray(point);at=np.array([*pt,3270.])
        for j in self.jambs:
            if inside(pt,j['rect'],1e-6):return self.f.port(j['joint'],at)
        for L in self.Ls:
            if any(inside(pt,r,1e-6) for r in L['foot']+L['haunches']):return self.f.port(L['joint'],at)
        for c in self.collectors:
            if any(inside(pt,r,1e-6) for r in c['rectangles']):
                u,q=local(c['face'],pt);u=min(c['hi'],max(c['lo'],u))
                n,p=self.collector_ref(c['face'],c['kind'],u);return self.f.port(n,at)
        for t in self.trimmers:
            if inside(pt,t['rect'],1e-6):
                n=self.trimmer_ref(t,float(pt[t['axis']]))
                return self.f.port(n,at)
        n=self.node(('slab',key(pt)),at);return self.f.port(n)

    def trimmer_ref(self,tr,u):
        pt=np.array([u,tr['datum']] if tr['axis']==0 else [tr['datum'],u]);at=[*pt,3270.]
        for j in self.jambs:
            if inside(pt,j['rect'],1e-6):return j['joint']
        for L in self.Ls:
            if any(inside(pt,r,1e-6) for r in L['foot']+L['haunches']):return L['joint']
        for c in self.collectors:
            if any(inside(pt,r,1e-6) for r in c['rectangles']):
                v,q=local(c['face'],pt);return self.collector_ref(c['face'],c['kind'],min(c['hi'],max(c['lo'],v)))[0]
        for centre,rect in self.trimmer_joints:
            if inside(pt,rect,1e-6):return self.node(('trimmer',key(centre)),[*centre,3270.])
        return self.node(('trimmer',key(pt)),at)

    def build_trimmers(self):
        for tr in self.trimmers:
            cuts=sorted({tr['lo'],tr['hi'],*[u for u in self.cuts[tr['axis']] if tr['lo']<u<tr['hi']]})
            for lo,hi in pairwise(cuts):
                a,b=self.trimmer_ref(tr,lo),self.trimmer_ref(tr,hi)
                if a==b:continue
                pa=np.array([lo,tr['datum'],3370-tr['depth']/2] if tr['axis']==0 else [tr['datum'],lo,3370-tr['depth']/2])
                pb=pa.copy();pb[tr['axis']]=hi
                e=self.f.beam(a,b,tr['width'],tr['depth'],'trimmer-'+tr['name'],ra=pa-self.f.points[a//6],rb=pb-self.f.points[b//6],crack=self.p.crack)
                self.members['trimmer'].append(e)

    def build_floor(self):
        solids=[j['rect'] for j in self.jambs]+[r for L in self.Ls for r in L['foot']+L['haunches']]+[r for c in self.collectors for r in c['rectangles']]+[t['rect'] for t in self.trimmers]
        for a,b in pairwise(self.cuts[0]):
            for c,d in pairwise(self.cuts[1]):
                centre=((a+b)/2,(c+d)/2)
                if any(inside(centre,r,-1e-8) for r in self.holes+solids):continue
                pts=[(a,c),(b,c),(b,d),(a,d)];ports=[self.floor_port(p) for p in pts];ids=np.concatenate([port[0] for port in ports])
                transform=np.zeros((12,24))
                for j,(ii,t) in enumerate(ports):transform[3*j:3*j+3,6*j:6*j+6]=t[[2,3,4]]
                k=plate_rectangle(b-a,d-c,E=33000*self.p.crack)
                self.f.add(ids,transform.T@k@transform)
                for tri in ((0,1,2),(0,2,3)):
                    km,area=membrane_triangle([pts[j] for j in tri],E=self.p.membrane_E)
                    t=np.zeros((6,18));di=np.concatenate([ports[j][0] for j in tri])
                    for ii,j in enumerate(tri):t[2*ii:2*ii+2,6*ii:6*ii+6]=ports[j][1][:2]
                    self.f.add(di,t.T@km@t)
                self.floor_cells.append(dict(rect=[a,c,b,d],ports=ports,area=(b-a)*(d-c)))
        self.floor_cell_lookup={(round(c['rect'][0],7),round(c['rect'][1],7)):c for c in self.floor_cells}

    def build_lower_contacts(self):
        for p in self.pads:
            a=self.floor_port(p['point']);b=self.ground_port(p['ground'],p['point'])
            self.contact(a,b,self.p.masonry_E*p['width']*p['length']/3350.,p['name']+'-lower-contact')
        # Four actual relocated court tension routes; corners are NOT captive.
        for row in json.loads((D/'current-house-ground-ties.json').read_text())['court']:
            pt=row['floorRodGroup'];a=self.floor_port(pt);head=next(h for h in GRID['heads'] if h['id']==row['head']);b=self.f.port(self.heads[row['head']],[*pt,-750.])
            self.contact(a,b,200000*2*245/(3270+40),row['head']+'-court-hold',sign=-1.)

    def prepare_upper(self):
        for point in self.roof.p['upperSupports']:
            self.upper_links.append((point,self.floor_port(point)))
        for L in self.Ls:
            L['roofRoots']=[q for q in self.roof.p['nodes'] if any(inside(q,r,1e-7) for r in L['foot'])]

    def build_roof_links(self):
        def key_terms(width,thickness,depth):
            # Uniform pressure: resultant at h/2 and energy compliance h^3/20EI.
            # Triangular pressure rising towards the tip: centroid2h/3 and
            # integral (2/3-t+t^3/3)^2 dt=11/105, hence105EI/(11h^3).
            # The old8EI/h^3 remains ONLY its named historical comparator.
            if self.p.key_profile=='triangular depth bearing':factor,centre,area=105/11,2/3,.75
            else:factor,centre,area=8.,.5,1.
            steel=factor*200000*(width*thickness**3/12)/depth**3
            concrete=33000*width*area
            return 1/(1/steel+1/concrete)*self.p.cap_scale,depth*centre
        for q,floor in self.upper_links:
            kind='outer' if A in q or B in q else 'court';top=3920. if kind=='outer' else 3820.
            # Existing tension-only M24; source140x300 direct bearing remains
            # a separate compression path with its actual clear body height.
            a=self.roof.port(q,[*q,6540.]);ids,t=floor
            floor_at=offset([0,0,top+45-3270])@t;b=(ids,floor_at)
            self.contact(a,b,200000*353/(6540-top-45),'upper-M24-'+str(q),sign=-1.)
            self.contact(a,b,self.p.masonry_E*140*300/(6540-top),'upper-core-bearing-'+str(q))
        for j in self.jambs:
            q=xy(j['face'],A,j['u']);qcap,wcap=self.jamb_section(6515.);at=np.array([*xy(j['face'],qcap,j['u']),6540.])
            face=j['face'];width,depth=205.,wcap;area=width*depth
            # Four actual H12 force lines; source position-coupler length159,
            # explicit621 mm unbonded development-length compliance and25 cap.
            # No gross-plate EA is substituted for the tension connection.
            for s in (-32.,32.):
                for normal in (-52.,52.):
                    pos=at+along(face)*s+inward(face)*normal
                    # Two100 mm effective strips in series:25 mm cap and20 mm
                    # box bottom, simply supported200 mm web-centre span.
                    aa=qcap+normal-232.5;bb=200-aa
                    plate=sum(aa**2*bb**2/(3*200000*(100*t**3/12)*200) for t in (25.,20.))
                    k=1/(self.p.cap_anchor_length/(200000*math.pi*12**2/4)+plate)*self.p.cap_scale
                    self.cap_links.append(self.f.link(self.roof.port(q,pos),self.f.port(j['top'],pos),[0,0,k,0,0,0],f'cap-anchor-{face}-{j["u"]:g}-{s:g}-{normal:g}'))
            # Distributed compression contact on the real180x205 cap. The
            # named local bearing-depth sensitivity is separate from anchorage.
            gauss,weights=np.polynomial.legendre.leggauss(3)
            for x,wx in zip(gauss,weights):
                for y,wy in zip(gauss,weights):
                    pos=at+along(face)*x*width/2+inward(face)*y*depth/2
                    k=area*wx*wy/4/(self.p.cap_bearing_depth/33000+25/200000)*self.p.cap_scale
                    self.contact(self.roof.port(q,pos),self.f.port(j['top'],pos),k,f'cap-bearing-{face}-{j["u"]:g}')
            # The historical comparator is a two-axis cruciform. A radial
            # guide comparator instead uses one blade whose long axis points
            # to the house centre: it resists only the plan-tangential
            # component and deliberately admits radial roof breathing.
            if self.p.key_direction_mode=='radial-guide':
                radial=np.r_[at[:2]-6000.,0.];radial/=np.linalg.norm(radial)
                directions=((np.r_[-radial[1],radial[0],0.],radial),)
            else:
                directions=((inward(face),along(face)),(along(face),inward(face)))
            for direction,span in directions:
                stiffness,lever=key_terms(self.p.cap_key_width,self.p.cap_key_thickness,self.p.cap_key_depth)
                for x,wx in zip(gauss,weights):
                    pos=at+span*x*self.p.cap_key_width/2+[0,0,-25.-lever]
                    k=np.zeros((6,6));k[:3,:3]=np.outer(direction,direction)*stiffness*wx/2
                    self.cap_links.append(self.f.link(self.roof.port(q,pos),self.f.port(j['top'],pos),k,f'cap-key-{face}-{j["u"]:g}'))
        for L in self.Ls:
            source=json.loads((D/'current-house-ground-ties.json').read_text())['outer']['primaryBarXY']
            for i,bar in enumerate(source):
                pt=L['origin']+L['sg']*np.array(bar);q=outer_root(pt);at=[*pt,6540.]
                distance=min(100.,max(1.,100.+(pt[0]-q[0])+(pt[1]-q[1])))
                plate=sum(distance**2*(200-distance)**2/(3*200000*(100*t**3/12)*200) for t in (25.,20.))
                k=1/(self.p.L_cap_anchor_length/(200000*math.pi*20**2/4)+plate)*self.p.cap_scale
                self.cap_links.append(self.f.link(self.roof.port(q,at),self.f.port(L['top'],at),[0,0,k,0,0,0],f'L-cap-anchor-{L["corner"]}-{i}'))
            gp,gw=np.polynomial.legendre.leggauss(2)
            for l,b,r,t in L['foot']:
                for x,wx in zip(gp,gw):
                    for y,wy in zip(gp,gw):
                        pt=np.array([(l+r)/2+x*(r-l)/2,(b+t)/2+y*(t-b)/2]);q=outer_root(pt);at=[*pt,6540.];area=(r-l)*(t-b)*wx*wy/4
                        k=area/(self.p.cap_bearing_depth/33000+25/200000)*self.p.cap_scale
                        self.contact(self.roof.port(q,at),self.f.port(L['top'],at),k,'L-cap-bearing-'+str(L['corner']))
            # Each key has its own actual ring root. The radial-guide
            # comparator uses a single plan-tangential blade at each station
            # rather than a two-axis cruciform, so uniform affine roof growth
            # is a released kinematic mode rather than a flexure demand.
            for index,centre in enumerate(self.p.L_key_centres):
                pt=L['origin']+L['sg']*np.array(centre);q=outer_root(pt)
                stiffness,lever=key_terms(self.p.L_key_width,self.p.L_key_thickness,self.p.L_key_depth);at=[*pt,6515.-lever]
                if self.p.key_direction_mode=='radial-guide':
                    radial=np.r_[pt-[6000.,6000.],0.];radial/=np.linalg.norm(radial);direction=np.r_[-radial[1],radial[0],0.]
                    matrix=np.zeros((6,6));matrix[:3,:3]=np.outer(direction,direction)*stiffness
                else:
                    matrix=np.diag([stiffness,stiffness,0,0,0,0])
                self.cap_links.append(self.f.link(self.roof.port(q,at),self.f.port(L['top'],at),matrix,f'L-cap-key-{L["corner"]}-{index}'))

    def controls(self):
        r=self.rigid@np.diag([1,1,1,.001,.001,.001]);res=self.k@r
        maximum=float(np.max(abs(res)));assert maximum<.1,maximum
        uc=np.zeros((self.f.size,len(self.contacts)))
        for j,c in enumerate(self.contacts):np.add.at(uc[:,j],c['ids'],c['row'])
        contact_error=float(np.max(abs(uc.T@r)));assert contact_error<1e-9
        return dict(nodes=len(self.f.points),DOFs=self.f.size,elements={k:len(v) for k,v in self.members.items()},
                    plateCells=len(self.floor_cells),contacts=len(self.contacts),heads=len(self.heads),
                    rigidResidualNOrNmm=maximum,relativeContactRigidError=contact_error,
                    floorFieldAreaM2=sum(c['area'] for c in self.floor_cells)/1e6)


if __name__=='__main__':
    house=House();print(json.dumps(house.controls(),indent=2),flush=True)
