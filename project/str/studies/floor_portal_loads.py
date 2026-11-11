"""Physical load origins for the coupled floor/portal comparison.

All forces are N, coordinates mm. Historical head reactions are never loaded
back onto the house. Gross masonry/finish allowances remain labelled adverse
budgets; actual RC intersections are removed by a disjoint solid ledger.
"""
from collections import defaultdict
from contextlib import redirect_stdout
from io import StringIO
from itertools import pairwise
from pathlib import Path
import ast,json,math,runpy,sys
import numpy as np
from floor_portal_house import A,B,C,E,D,H,GRID,xy,inward,along,local,inside
from floor_portal_frame import offset


class Case:
    def __init__(self,house,name):
        self.h=house;self.name=name;self.f=np.zeros(house.f.size);self.origins=[];self.ends=defaultdict(lambda:np.zeros(12))
    def origin(self,tag,point,force,moment=(0.,0.,0.)):
        p=np.asarray(point);f=np.asarray(force);m=np.asarray(moment)
        self.origins.append((tag,p,f,m))
    def port(self,port,point,force,moment=(0.,0.,0.),tag=''):
        ids,t=port;v=np.r_[force,moment];np.add.at(self.f,ids,t.T@v)
        self.origin(tag,point,force,moment)
    def node(self,node,point,force,moment=(0.,0.,0.),tag=''):
        self.port(self.h.f.port(node,point),point,force,moment,tag)
    def beam(self,e,t,point,force,moment=(0.,0.,0.),tag=''):
        out=self.h.f.beam_load(self.f,e,t,force,moment,point)
        self.ends[id(e)]+=out;self.origin(tag,point,force,moment)
    def member(self,elements,point,force,moment=(0.,0.,0.),tag=''):
        point=np.asarray(point)
        def distance(e):
            d=e['b']-e['a'];t=float(np.clip(np.dot(point-e['a'],d)/np.dot(d,d),0,1))
            return np.linalg.norm(point-e['a']-t*d),t
        e=min(elements,key=lambda e:distance(e)[0]);_,t=distance(e)
        self.beam(e,t,point,force,moment,tag)
    def ground(self,name,point,force,moment=(0.,0.,0.),tag=''):
        if name in self.h.heads:self.node(self.h.heads[name],point,force,moment,tag);return
        es=[e for e in self.h.members['ground'] if e['name']==name]
        if not es:raise ValueError(('Unknown physical ground receiver',name,point))
        self.member(es,point,force,moment,tag)
    def floor(self,point,force,moment=(0.,0.,0.),tag=''):
        point=np.asarray(point,float);pt=point[:2]
        for j in self.h.jambs:
            if inside(pt,j['rect'],1e-7):self.node(j['joint'],point,force,moment,tag);return
        for L in self.h.Ls:
            if any(inside(pt,r,1e-7) for r in L['foot']):self.node(L['joint'],point,force,moment,tag);return
        for c in self.h.collectors:
            if inside(pt,c['rect'],1e-7):
                self.member([e for e in self.h.members['collector'] if e['name']==c['kind']+'-collector' and abs(local(c['face'],e['a'][:2])[1]-c['q'])<1e-5],point,force,moment,tag);return
        for tr in self.h.trimmers:
            if inside(pt,tr['rect'],1e-7):self.member([e for e in self.h.members['trimmer'] if e['name']=='trimmer-'+tr['name']],point,force,moment,tag);return
        # A load inside a plate uses that actual finite element. No new node,
        # support, or nearest-beam relocation is introduced by a load.
        indices=[int(np.searchsorted(self.h.cuts[ax],pt[ax],side='right')-1) for ax in (0,1)]
        candidates=[self.h.floor_cell_lookup.get((round(self.h.cuts[0][i],7),round(self.h.cuts[1][j],7))) for i in (indices[0],indices[0]-1) for j in (indices[1],indices[1]-1) if 0<=i<len(self.h.cuts[0])-1 and 0<=j<len(self.h.cuts[1])-1]
        cell=next((c for c in candidates if c and inside(pt,c['rect'],1e-7)),None)
        if cell is None:raise ValueError(('Load has no physical first-floor receiver',point.tolist(),tag))
        a,b,c,d=cell['rect'];x=(pt[0]-a)/(c-a);y=(pt[1]-b)/(d-b)
        weights=[(1-x)*(1-y),x*(1-y),x*y,(1-x)*y]
        # Work at its actual source point: nodal force interpolation has the
        # right plan centroid; the vertical lever arm remains an explicit port.
        for w,port in zip(weights,cell['ports']):
            ids,t=port;tr=offset([0,0,point[2]-3270])@t
            np.add.at(self.f,ids,tr.T@np.r_[np.asarray(force)*w,np.asarray(moment)*w])
        self.origin(tag,point,force,moment)
    def totals(self):
        wanted=np.zeros(6);by=defaultdict(lambda:np.zeros(6))
        for tag,p,f,m in self.origins:
            row=np.r_[f,m+np.cross(p,f)];wanted+=row;by[tag]+=row
        actual=self.h.rigid.T@self.f
        error=np.max(abs(actual-wanted),initial=0)
        assert error<max(.01,np.max(abs(wanted))*1e-10),(self.name,error,actual,wanted)
        return {'sixResultants':wanted.tolist(),'virtualWorkErrorNOrNmm':float(error),'families':{k:v.tolist() for k,v in sorted(by.items())},'originCount':len(self.origins)}
    @classmethod
    def combination(cls,house,name,terms):
        out=cls(house,name)
        for scale,case in terms:
            out.f+=scale*case.f
            out.origins.extend((tag,p,scale*f,scale*m) for tag,p,f,m in case.origins)
            for k,v in case.ends.items():out.ends[k]+=scale*v
        return out


def subtract_box(a,b):
    # Stored order xlo,ylo,xhi,yhi,zlo,zhi.
    lo=np.maximum([a[0],a[1],a[4]],[b[0],b[1],b[4]])
    hi=np.minimum([a[2],a[3],a[5]],[b[2],b[3],b[5]])
    if np.any(hi<=lo+1e-9):return [a]
    current=np.array([[a[0],a[2]],[a[1],a[3]],[a[4],a[5]]],float);out=[]
    def flatten(v):return [v[0,0],v[1,0],v[0,1],v[1,1],v[2,0],v[2,1]]
    for j in range(3):
        if current[j,0]<lo[j]:v=current.copy();v[j,1]=lo[j];out.append(flatten(v));current[j,0]=lo[j]
        if current[j,1]>hi[j]:v=current.copy();v[j,0]=hi[j];out.append(flatten(v));current[j,1]=hi[j]
    return out


def rc_origins(h,case):
    claimed=[];volumes=defaultdict(float);pieces=[]
    ordered=sorted(h.rc_boxes,key=lambda row:{'L':0,'jamb':1,'collector':2,'trimmer':3}[row[2]])
    for name,box,kind in ordered:
        rows=[box]
        for old in claimed:rows=[r for b in rows for r in subtract_box(b,old)]
        claimed.append(box)
        for b in rows:
            volume=(b[2]-b[0])*(b[3]-b[1])*(b[5]-b[4])/1e9
            p=np.array([(b[0]+b[2])/2,(b[1]+b[3])/2,(b[4]+b[5])/2]);force=[0,0,-25000*volume]
            volumes[kind]+=volume;pieces.append((name,b,volume))
            if kind in ('collector','trimmer'):case.floor(p,force,tag='RC '+kind+' disjoint solid')
            elif kind=='L':
                L=next(L for L in h.Ls if any(inside(p,r,1e-6) for r in L['foot']))
                if 3170<=p[2]<=3920:case.node(L['joint'],p,force,tag='RC L disjoint solid')
                else:case.member([e for e in h.members['L'] if np.linalg.norm((e['a']+e['b'])[:2]/2-L['centroid'])<1e-5],p,force,tag='RC L disjoint solid')
            else:
                j=next(j for j in h.jambs if abs(local(j['face'],p[:2])[0]-j['u'])<102.5+1e-7 and abs(local(j['face'],p[:2])[1]-312.5)<180)
                if 3170<=p[2]<=3920:case.node(j['joint'],p,force,tag='RC jamb disjoint solid')
                else:case.member([e for e in h.members['jamb'] if e['name']==f'jamb-{j["face"]}-{j["u"]:g}' or e['name']=='jamb-foot' and abs(local(j['face'],e['a'][:2])[0]-j['u'])<1e-5],p,force,tag='RC jamb disjoint solid')
    for row in h.flare_solids:
        for t,w in zip([.5-.5/math.sqrt(3),.5+.5/math.sqrt(3)],[.5,.5]):
            q0,q1=np.array(row['q0'])*(1-t)+np.array(row['q1'])*t;z=row['za']*(1-t)+row['zb']*t
            volume=(q1-q0)*205*(row['zb']-row['za'])*w/1e9;p=[*xy(row['face'],(q0+q1)/2,row['u']),z]
            es=[e for e in h.members['jamb'] if e['name']==f'jamb-{row["face"]}-{row["u"]:g}']
            case.member(es,p,[0,0,-25000*volume],tag='RC tapered jamb solid');volumes['jamb-taper']+=volume
    for cell in h.floor_cells:
        r=cell['rect'];area=cell['area']/1e6;p=[(r[0]+r[2])/2,(r[1]+r[3])/2,3270.]
        case.floor(p,[0,0,-5000*area],tag='RC floor field');volumes['slab']+=area*.2
    # Actual union outside the full jamb rectangles: clear 1000-wide curved
    # opening intrados to the real soffit. Arch and spandrel are not summed.
    ri=1000**2/(8*300)+150;zc=2850-ri
    gx,gw=np.polynomial.legendre.leggauss(5)
    for arch in h.arch_strips:
        face,centre,dz=arch['face'],arch['centre'],arch['dz']
        es=[e for e in h.members['arch'] if abs(local(face,(e['a']+e['b'])[:2]/2)[1]-312.5)<1e-5 and centre-501<local(face,(e['a']+e['b'])[:2]/2)[0]<centre+501 and dz+2500<(e['a'][2]+e['b'][2])/2<dz+3200]
        for a,b in pairwise(np.linspace(centre-500,centre+500,h.p.arch_divisions+1)):
            for t,w in zip(gx,gw):
                u=(a+b)/2+(b-a)*t/2;bottom=zc+dz+math.sqrt(ri**2-(u-centre)**2);top=arch['top']
                v=180*(top-bottom)*(b-a)*w/2/1e9;p=[*xy(face,312.5,u),(bottom+top)/2]
                case.member(es,p,[0,0,-25000*v],tag='RC clear arch and spandrel union');volumes['clear-arch-spandrel']+=v
    return {'volumeM3':dict(volumes),'totalM3':sum(volumes.values()),'rectangularDisjointPieces':len(pieces),'solidOwnershipOrder':['L','jamb','collector','trimmer','remaining slab','clear arch/spandrel']}


def source_origins():
    rows=[];args=sys.argv[:]
    try:
        sys.argv=['raw-coupled-origins','--check']
        with redirect_stdout(StringIO()):p=runpy.run_path(str(D/'current-house-head-actions.py'),init_globals={'originObserver':lambda c,k,n,p,rr:rows.append((c,k,n,p,rr))})
    finally:sys.argv=args
    return rows,p


def floor_fields(h,G,Q):
    fields=json.loads((D/'open-loggia-support.json').read_text())['floor_fields']
    bridge=[4885,2735,7115,3832.5];area=0.;finishes=0.
    for a,b in pairwise(h.cuts[0]):
        for c,d in pairwise(h.cuts[1]):
            p=[(a+b)/2,(c+d)/2,3370.]
            if any(inside(p,r,-1e-8) for r in h.holes):continue
            ar=(b-a)*(d-c)/1e6;area+=ar
            field=next((f for f in fields if inside(p,f['rectangle'])),None)
            rate=field['G']-5 if field else 2.5 if inside(p,bridge) else 3.5
            G.floor(p,[0,0,-ar*rate*1000],tag='first-floor finishes and non-RC allowance');Q.floor(p,[0,0,-ar*2000],tag='first-floor use')
            finishes+=ar*rate
    assert abs(area-100.5002)<1e-7,area
    return {'netAreaM2':area,'sourceAreaBeforeWetOpeningM2':100.6602,'wetPenetrationM2':.16,'finishGkKN':finishes,'useQkKN':2*area}


def gravity(h):
    G,Q=Case(h,'G characteristic adverse'),Case(h,'Q characteristic')
    geometry=rc_origins(h,G);floor=floor_fields(h,G,Q);rows,source=source_origins()
    source_totals=defaultdict(float);adjustments=defaultdict(float)
    excluded={'roof','roof signed rows','steel wall-head ring','first-floor fields','first-floor bridge','first-floor residual RC and finish','upper frame downstands'}
    for cat,kind,n,p,receivers in rows:
        source_totals[cat+' / '+kind]+=n
        if cat in excluded or kind not in ('G','Q') or abs(n)<1e-12:continue
        case=G if kind=='G' else Q;force=np.array([0.,0.,-n*1000]);point=np.array([*p,-180.])
        if cat=='upper core and finish budget' or cat=='ground core and finish budget':
            upper=cat.startswith('upper');height=3170. if upper else 3350.;fraction=1.
            core_part=3.5/3.9 #140 mm source core at25 plus0.4 kN/m2 face allowance
            portal=None
            for face in range(4):
                u,q=local(face,p)
                if 262.5-1e-6<=q<=402.5+1e-6:
                    for centre in (2100.,9900.):
                        if centre-705<=u<=centre+705:portal=(face,centre,u)
            if portal is not None or any(any(inside(p,r,1e-7) for r in L['foot']) for L in h.Ls):fraction=1-core_part
            elif upper:
                for col in h.collectors:
                    if inside(p,col['rect']):fraction-=core_part*(min(6540,3170+col['depth'])-3370)/height;break
            adjustments[cat+' removed RC-replaced body kN']+=n*(1-fraction);force*=fraction
            if upper:
                case.floor([*p,3370.],force,tag=cat+' retained non-RC allowance');continue
        if cat=='independent ceiling envelope':
            # Retain the source physical span receivers. If an outer receiver
            # lies on a new portal, load its upper arch/jamb, not the floor twice.
            correction=np.asarray(p)-sum(np.asarray(q)*w for name,q,w in receivers)
            for name,q,w in receivers:
                if not w:continue
                actual=np.asarray(q)+correction
                found=False
                for face in range(4):
                    u,normal=local(face,q)
                    if abs(normal-A)>1:continue
                    js=[j for j in h.jambs if j['face']==face and abs(j['u']-u)<=102.5]
                    if js:case.node(js[0]['top'],[*actual,6515.],force*w,tag=cat);found=True;break
                    arches=[a for a in h.arch_strips if a['face']==face and a['dz']==3450 and abs(a['centre']-u)<=500]
                    if arches:
                        ar=arches[0];es=[e for e in h.members['arch'] if 6000<(e['a'][2]+e['b'][2])/2 and abs(local(face,(e['a']+e['b'])[:2]/2)[1]-312.5)<1e-5 and abs(local(face,(e['a']+e['b'])[:2]/2)[0]-ar['centre'])<501]
                        case.member(es,[*actual,6515.],force*w,tag=cat);found=True;break
                if not found:case.floor([*actual,3370.],force*w,tag=cat)
            continue
        # The two flights' first-floor header share belongs to the real header;
        # the midlanding/post shares retain their separate lower receiver.
        projected=sum(np.asarray(q)*w for name,q,w in receivers);delta=np.asarray(p)-projected
        for name,q,w in receivers:
            if abs(w)<1e-12:continue
            at=np.array([*(np.asarray(q)+delta),-180.]);f=force*w
            if name.startswith('@') or name=='stair-header' and cat=='two stair flights':case.floor([*at[:2],3370.],f,tag=cat)
            else:case.ground(name,at,f,tag=cat)
    # Below-sill infill is separate retained material. The old Portal.gravity
    # routine did not contain it after removal of the gross1410 patch.
    layout=json.loads((D/'reconciled-corner-portals.json').read_text()) if (D/'reconciled-corner-portals.json').exists() else {}
    for face in range(4):
        side=['outer-south','outer-east','outer-north','outer-west'][face]
        for centre in (2100.,9900.):
            for level,bottom,zfloor in [('GROUND',-180.,False),('FIRST',3370.,True)]:
                choices=[o for o in H['openings'][level] if o['wall']==side]
                physical_centre=centre if face<2 else 12000-centre
                opening=min(choices,key=lambda o:abs({1800:2100,10200:9900}.get(o['centre'],o['centre'])-physical_centre))
                sill=opening['sill']+(3450 if level=='FIRST' and opening['sill']<3000 else 0)
                vol=1000*140*max(0,sill-bottom)/1e9;pt=[*xy(face,A,centre),(sill+bottom)/2]
                if zfloor:G.floor(pt,[0,0,-25000*vol],tag='retained below-sill opaque infill')
                else:
                    ground='outer-'+['S','E','N','W'][face]
                    if face==2:ground='outer-NW' if pt[0]<6000 else 'outer-NE'
                    G.ground(ground,pt,[0,0,-25000*vol],tag='retained below-sill opaque infill')
    # The installed frame200 kg/unit and guard stock are real adverse mass
    # allowances separate from removed gross opening masonry.
    guard=json.loads((D/'current-house-window-receivers.json').read_text())['guard']['body']
    guard_stock=json.loads((D/'current-house-guard-bracket.json').read_text())['massPerWindowKg']['authoredMassComparisonWithFivePercentOnOtherStockAnd1p5kgExecution']
    for j in h.jambs:
        for z in (1250.,4700.):G.node(j['levels'][z],[*xy(j['face'],227.5,j['u']),z],[0,0,-200*9.81/2],tag='window frame and glass200kg per unit')
        G.node(j['levels'][5430.],[*xy(j['face'],127.5,j['u']),5430.],[0,0,-(guard['guardMassULSKN']*1000/1.35+guard_stock*9.81)/2],tag='actual upper guard and bracket allowance')
    return G,Q,{'RC':geometry,'floor':floor,'sourceTotalsKN':dict(source_totals),'sourceAdjustmentsKN':dict(adjustments)}


def roof_load_type(h):
    path=D.parents[1]/'rof/studies/roof_water_current_trial.py';source=path.read_text();tree=ast.parse(source)
    body=[n for n in tree.body if isinstance(n,(ast.FunctionDef,ast.ClassDef)) and n.name in ('shape','find_segment','Load')]
    p=h.roof.p;segments=[]
    for name in ('outer','court'):
        for aa,bb in p['rings']:
            inner=all(C<=v<=E for q in (aa,bb) for v in q)
            if inner!=(name=='court'):continue
            axis=int(aa[0]==bb[0]);a,b=sorted((aa,bb),key=lambda q:q[axis])
            segments.append(dict(key=(name,len(segments)),a=a,b=b,length=math.dist(a,b),axis=axis,normal=(0,1) if axis==0 else (-1,0)))
    ns=dict(p=p,segments=segments,defaultdict=defaultdict)
    exec(compile(ast.Module(body=body,type_ignores=[]),str(path),'exec'),ns)
    return ns['Load'],source


def import_roof_load(h,load,name,scale=1.):
    case=Case(h,name);case.f[h.roof.mounted]=np.asarray(load.vector)[h.roof.keep]*scale
    for row in load.placed:case.origin(row['tag'],row['source'],np.array([row['FxN'],row['FyN'],-row['downN']])*scale)
    case.totals();return case


def high_port(h,q,pin=False):
    p=h.roof.p
    native=[p['highD'](q,j) for j in range(3)]+[p['rRot'](q,j) for j in range(3)]
    ids=np.array([h.roof.mounted[h.roof.lookup[i]] for i in native])
    return ids,offset([0,0,-200.]) if pin else np.eye(6)


def radial_point(h,case,inner,outer,x,L,down,tag):
    """Outer Euler receiver; inner source pin-ended primary comparison.

    Outer loads use the exact native bending basis and fixed-end load vector.
    Inner primary bending remains the source's separate member calculation;
    its equivalent pin reactions retain the physical force and all moments.
    """
    p=h.roof.p;inner,outer=np.array(inner),np.array(outer);crown=tuple((inner+outer)/2)
    plan=inner+(outer-inner)*x/L;z=p['zhigh']-abs(2*x/L-1)*(p['zhigh']-p['zheel']);point=np.r_[plan,z];force=np.array([0.,0.,-down])
    if x<=L/2:
        t=2*x/L
        # Pin reactions extrapolate for the explicit source inner overhang.
        for weight,port,at in [(1-t,h.roof.port(inner,[*inner,p['zheel']]),[*inner,p['zheel']]),(t,high_port(h,crown,True),[*crown,p['zhigh']])]:
            ids,tr=port;np.add.at(case.f,ids,tr.T@np.r_[force*weight,[0.,0.,0.]])
        case.origin(tag,point,force);return
    aa=np.r_[outer,p['zheel']];bb=np.r_[crown,p['zhigh']];delta=bb-aa;length=np.linalg.norm(delta);xx=delta/length
    yy=np.array([-xx[1],xx[0],0.]);yy/=np.linalg.norm(yy);zz=np.cross(xx,yy);R=np.array([xx,yy,zz]);rot=np.zeros((6,6));rot[:3,:3]=rot[3:,3:]=R
    ia,ta=h.roof.port(outer,aa);ib,tb=high_port(h,crown,True);tr=np.zeros((12,12));tr[:6,:6]=rot@ta;tr[6:,6:]=rot@tb
    e=dict(ids=np.r_[ia,ib],a=aa,b=bb,L=length,R=R,t=tr)
    case.beam(e,float(np.clip(2*(1-x/L),0,1)),point,force,tag=tag)


def roof_gravity(h):
    p=h.roof.p;w=json.loads((D/'current-house-welded-network.json').read_text())
    G,Q,U=Case(h,'roof Gmax characteristic'),Case(h,'roof Q characteristic'),Case(h,'roof uniform suction')
    mat=json.loads((D.parents[1]/'mat/studies/whole-envelope.json').read_text())['roof']
    special_kg=mat['steelSpecialsKg']+mat['lowerTraysKg']+mat['steelSupportBedsKg']
    normal_area=sum(fr['count']*sum(row['area'] for row in fr['rows'])/math.cos(math.radians(25)) for fr in w['frames'])
    residual_rate=1.5-special_kg*9.81/1000/normal_area
    assert residual_rate>0
    for fr in w['frames']:
        ordinary=fr['id']=='ordinary';L=fr['axisSpanM'];ds=1 if ordinary else math.sqrt(2)
        radials=[(o,i) for o,i in p['radials'] if ((o[0]==i[0] or o[1]==i[1])==ordinary)]
        for outer,inner in radials:
            for row in fr['rows']:
                area=row['area'];g=area*residual_rate/math.cos(math.radians(25))+area/row['rowWidth']*w['sections']['secondary']['lineG']
                for case,value,tag in [(G,g,'roof located residual weather budget and secondary steel'),(Q,area*1.5,'roof imposed pressure'),(U,-2.25*area,'roof source suction area')]:radial_point(h,case,inner,outer,row['x'],L,value*1000,tag)
            for x,g in [(L/4-.26625*ds,fr['primaryG']/2),(3*L/4+.26625*ds,fr['primaryG']/2),(0,fr['tieG']/2+1),(L,fr['tieG']/2+1),(L/2,.5)]:radial_point(h,G,inner,outer,x,L,g*1000,'roof primary tie and connection source stock')
    for q,n in p['braceG'].items():G.port(h.roof.port(q),[*q,6600.],[0,0,-n*1000],tag='uninstalled roof-plane stock reserve')
    # Current316L replaces the lead family. Allocate its actual mass to the
    # same documented ridge/hip/valley stock origins, inside the1.5 budget.
    lead_parts=dict(cheeks=1039.9396852791033,roll=215.52960000000002,hip=157.6540346603396,valley=204.45232680506578,blanks=88.17120000000001)
    scale=mat['steelSpecialsKg']/sum(lead_parts.values());mid=(A+C)/2
    def weight(q,kg,crown,tag):
        at=[*q,p['zhigh']+200 if crown else 6600.]
        G.port(high_port(h,q) if crown else h.roof.port(q),at,[0,0,-kg*9.81],tag=tag)
    for face in range(4):
        cuts=[mid,4700.,7300.,12000-mid]
        for a,b in pairwise(cuts):
            kg=(b-a)/31000*(lead_parts['cheeks']+lead_parts['roll'])*scale
            for x in (a,b):weight(tuple(xy(face,mid,x)),kg/2,True,'current316L ridge specials')
        peak=tuple(xy(face,mid,mid))
        for label,kg,edge,tip in [('outer hip',lead_parts['hip'],A,-200.),('court valley',lead_parts['valley'],C,4525.)]:
            share=((tip+mid)/2-mid)/(edge-mid);heel=tuple(xy(face,edge,edge))
            weight(heel,kg*scale*share/4,False,'current316L '+label);weight(peak,kg*scale*(1-share)/4,True,'current316L '+label)
            weight(heel,lead_parts['blanks']*scale/12,False,'current316L terminal blank')
        weight(peak,lead_parts['blanks']*scale/12,True,'current316L corner saddle blank')
        fraction=(mat['valleyLength']/2+100)/(mat['valleyLength']+250)*(4525-mid)/(C-mid);kg=(mat['lowerTraysKg']+mat['steelSupportBedsKg'])/4
        weight(tuple(xy(face,C,C)),kg*fraction,False,'current independent valley tray and bed');weight(peak,kg*(1-fraction),True,'current independent valley tray and bed')
    before_ring=-G.totals()['sixResultants'][2]/1000
    assert abs(before_ring-w['globalOrigins']['G'])<1e-7,(before_ring,w['globalOrigins']['G'])
    Load,_=roof_load_type(h);ring=Load('actual wall-head ring stock')
    for aa,bb in p['rings']:
        sec=p['collectorSection'](aa,bb);point=(np.asarray(aa)+bb)/2;inner=all(C<=v<=E for q in (aa,bb) for v in q)
        face=next(i for i in range(4) if abs(local(i,point)[1]-(C if inner else A))<1e-7)
        ring.place('court' if inner else 'outer',face,-(C if inner else A),local(face,point)[0],down=math.dist(aa,bb)/1000*sec['lineG']*1000,tag='actual wall-head steel ring')
    ringcase=import_roof_load(h,ring,'ring G')
    G=Case.combination(h,'roof Gmax characteristic',[(1,G),(1,ringcase)])
    return G,Q,U,{'sourceRoofGmaxKN':before_ring,'currentSpecialsKgWithinWeatherBudget':special_kg,'residualWeatherRateKNPerSlopeM2':residual_rate,'sourceNormalAreaM2':normal_area,'actualRingGkKN':-ringcase.totals()['sixResultants'][2]/1000,'uninstalledBraceReserveKN':sum(p['braceG'].values()),'minimumRoofMassCredit':0}


def roof_goods(h):
    Load,source=roof_load_type(h)
    ns={'Load':Load,'p':h.roof.p,'math':math,'pairwise':pairwise,'INNER_DRY_KG_PER_M':60.,'COURT_WIDTH':h.p.court_width}
    block=source[source.index("wet = Load('new goods, blocked-water gravity')"):source.index('\ndef extra_horizontal(')]
    exec(compile(block,str(D.parents[1]/'rof/studies/roof_water_current_trial.py'),'exec'),ns)
    dry=import_roof_load(h,ns['dry'],'roof goods dry characteristic',1/1.35)
    water=Case.combination(h,'blocked water characteristic',[(1/1.5,import_roof_load(h,ns['wet'],'wet factored')) ,(-1.35/1.5,dry)])
    extra=import_roof_load(h,ns['wind_vertical'],'added roof-water vertical pressure')
    # Central characteristic comparator only; four actual centroid extremes
    # for each independent cassette remain explicit separate load components.
    inner=Load('inner cassette dry centre');uncertainty=[]
    for row in ns['court_support_cassettes']:
        for face in range(4):
            q=sum(row['qCentroidRange'])/2;station=sum(row['pCentroidRange'])/2
            inner.place('court',face,-q,station,down=row['dryKg']*9.81,z=row['rootAxisZ'],root_station=row['rootStation'],tag='inner '+row['circuit']+' dry allowance')
            extremes=[]
            for q in row['qCentroidRange']:
                for station in row['pCentroidRange']:
                    ld=Load('inner cassette dry extreme');ld.place('court',face,-q,station,down=row['dryKg']*9.81,z=row['rootAxisZ'],root_station=row['rootStation'],tag='independent cassette dry endpoint')
                    extremes.append(import_roof_load(h,ld,'inner dry endpoint'))
            uncertainty.append(extremes)
    dry=Case.combination(h,'all roof goods dry characteristic',[(1,dry),(1,import_roof_load(h,inner,'inner goods dry'))])
    return dry,water,extra,uncertainty,{'dryGkKN':-dry.totals()['sixResultants'][2]/1000,'blockedWaterQkKN':-water.totals()['sixResultants'][2]/1000,'additionalSkyAreaM2':ns['wind_area'],'independentInnerDryCentroidGroups':len(uncertainty),'source':'project/rof/studies/roof_water_current_trial.py load construction; no historical response added'}


def facade_floor(case,face,u,z,force,tag):
    h=case.h;at=np.r_[xy(face,A,u),z]
    if u<A or u>B:
        corner=xy(face,A,A if u<A else B);L=next(L for L in h.Ls if np.linalg.norm(np.array(L['corner'])-corner)<1e-6)
        case.node(L['joint'],at,force,tag=tag)
    else:case.floor(at,force,tag=tag)


def facade_ground(case,face,u,force,tag):
    h=case.h;plan=xy(face,A,u);name='outer-'+['S','E','N','W'][face]
    if face==2:
        if 4500<plan[0]<7500:
            for x,weight in [(4500,(7500-plan[0])/3000),(7500,(plan[0]-4500)/3000)]:
                case.ground('loggia-W' if x==4500 else 'loggia-E',[x,plan[1],-180.],np.asarray(force)*weight,tag=tag)
            return
        name='outer-NW' if plan[0]<=4500 else 'outer-NE'
    case.ground(name,[*plan,-180.],force,tag=tag)


def wind(h,programme,inside_court=False,goods_height=7400.):
    case=Case(h,'wind '+str(programme)+(' inner' if inside_court else ' outer'));Load,source=roof_load_type(h);roof=Load('physical face/roof pressure')
    p=h.roof.p;cap=8645.327095641296;peak_z=p['zhigh']+200;mid=(A+C)/2
    for axis,code in enumerate(programme):
        if not code:continue
        sign=1 if code<4 else -1;mode=(code-1)%3
        face=(3 if sign==1 else 1) if axis==0 else (0 if sign==1 else 2)
        low,high=(-200. if mode!=2 else 6000.),(12200. if mode!=1 else 6000.)
        cuts=sorted({low,high,*[x for x in [*p['sides'][face,'outer'],*p['sides'][face,'inner'],4250,7750,1395,2805,9195,10605] if low<x<high]})
        for l,r in pairwise(cuts):
            u=(l+r)/2;width=(r-l)/1000;direction=np.eye(3)[axis]*sign
            portal=next((c for c in (2100.,9900.) if c-705<=u<=c+705),None)
            if portal is not None:
                js=sorted([j for j in h.jambs if j['face']==face and j['centre']==portal],key=lambda j:j['u']);s=(u-js[0]['u'])/(js[1]['u']-js[0]['u'])
                for za,zb,brackets in [(-180.,3370.,(1250.,2350.)),(3370.,6600.,(4700.,5800.))]:
                    force=direction*2.25*width*(zb-za);z=(za+zb)/2;v=(z-brackets[0])/(brackets[1]-brackets[0])
                    for j,a in zip(js,(1-s,s)):
                        for node_z,b in zip(brackets,(1-v,v)):
                            case.node(j['levels'][node_z],[*xy(face,292.5,j['u']),node_z],force*a*b,tag='one gross portal pressure patch')
            else:
                lower=direction*2.25*width*(3370+180)/2;upper=direction*2.25*width*(6600-3370)/2
                facade_ground(case,face,u,lower,'lower facade base tributary')
                facade_floor(case,face,u,3370.,lower+upper,'generic facade floor tributary')
                root='court' if inside_court and 4250<u<7750 else 'outer';normal=C if root=='court' else A
                roof.place(root,face,-normal,u,fx=upper[0],fy=upper[1],tag='generic upper facade roof tributary')
            # Complete projected roof band, including the selected cap maximum;
            # the elevated force is placed at the real purlin datum.
            total=direction*2.25*width*(cap-6600);elevated=total*((cap+6600)/2-6600)/(peak_z-6600);remaining=total-elevated
            crowns=[mid,4700.,7300.,12000-mid];idx=next((i for i in range(3) if u<=crowns[i+1]),2);a,b=crowns[idx:idx+2];v=(u-a)/(b-a)
            for x,w in ((a,1-v),(b,v)):
                q=tuple(xy(face,mid,x));case.port(high_port(h,q),[*q,peak_z],elevated*w,tag='projected roof band at actual ridge purlin')
            root='court' if inside_court and 4250<u<7750 else 'outer';normal=C if root=='court' else A
            roof.place(root,face,-normal,u,fx=remaining[0],fy=remaining[1],tag='projected roof band ring balance')
    out=Case.combination(h,case.name,[(1,case),(1,import_roof_load(h,roof,'roof projected wind'))])
    # Retain the source adverse full leader envelope and added body widths.
    # Independent cassette/inner-pressure patterns remain separate components.
    tree=ast.parse(source);fn=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='extra_horizontal')
    ns=dict(Load=Load,p=p,BODY_LOW=6000.,BODY_HIGH=7400.,leader_locations=[('outer',0,1130,11150,'south normal'),('outer',0,1130,11750,'south relief'),('outer',2,1130,2975,'north normal'),('outer',2,1130,250,'north relief'),('court',0,-4500,4500,'inner SW normal'),('court',0,-4500,7500,'inner SE relief')])
    exec(compile(ast.Module(body=[fn],type_ignores=[]),'<source goods pressure>','exec'),ns)
    goods=import_roof_load(h,ns['extra_horizontal'](programme,goods_height),'source added goods horizontal pressure')
    return Case.combination(h,out.name,[(1,out),(1,goods)])
