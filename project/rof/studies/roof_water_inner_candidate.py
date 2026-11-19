"""Private, read-only-source inner-cassette candidate. N, mm, MPa.

This is a new comparison, NOT recovered private source or an adopted design.
Its source references and explicit failed/unknown boundaries accompany JSON.
The fixed rails have moved above the actual courtyard window arch envelope.
"""
from pathlib import Path
import argparse, hashlib, json, math
from itertools import product
import numpy as np

ROOT = Path(__file__).resolve().parents[3]
E=180000.; G=E/2.6; RHO=8000.; FY=165/1.1

def section(b,h,t):
    a=b*h-(b-2*t)*(h-2*t)
    iz=(h*b**3-(h-2*t)*(b-2*t)**3)/12
    iy=(b*h**3-(b-2*t)*(h-2*t)**3)/12
    j=4*((b-t)*(h-t))**2/(2*(b-t+h-t)/t)
    return dict(B=b,H=h,t=t,A=a,Iy=iy,Iz=iz,J=j,Wy=2*iy/h,Wz=2*iz/b,kgm=a*.008)

def local_matrix(length,s):
    k=np.zeros((12,12)); L=length
    for ids,m in [([0,6],E*s['A']/L*np.array([[1,-1],[-1,1]])),
                  ([3,9],G*s['J']/L*np.array([[1,-1],[-1,1]]))]:
        k[np.ix_(ids,ids)]+=m
    b=np.array([[12,6*L,-12,6*L],[6*L,4*L**2,-6*L,2*L**2],[-12,-6*L,12,-6*L],[6*L,2*L**2,-6*L,4*L**2]])
    k[np.ix_([1,5,7,11],[1,5,7,11])]+=E*s['Iz']/L**3*b
    sig=np.diag([1,-1,1,-1])
    k[np.ix_([2,4,8,10],[2,4,8,10])]+=E*s['Iy']/L**3*(sig@b@sig)
    return k

class Frame:
    def __init__(self):self.nodes=[];self.members=[];self.fixed=[]
    def node(self,p):
        p=tuple(float(v) for v in p)
        if p not in self.nodes:self.nodes.append(p)
        return self.nodes.index(p)
    def member(self,a,b,s,name):
        i,j=self.node(a),self.node(b)
        if i==j:return
        v=np.subtract(b,a);L=float(np.linalg.norm(v));x=v/L
        ref=np.array([0.,0.,1.]) if abs(x[2])<.9 else np.array([0.,1.,0.])
        y=np.cross(ref,x);y/=np.linalg.norm(y);z=np.cross(x,y)
        rot=np.array([x,y,z]);T=np.zeros((12,12))
        for q in range(4):T[3*q:3*q+3,3*q:3*q+3]=rot
        self.members.append(dict(i=i,j=j,L=L,s=s,name=name,T=T,k=local_matrix(L,s)))
    def solve(self,forces,distributed=None):
        n=6*len(self.nodes);K=np.zeros((n,n));F=np.zeros(n)
        for a,ff in forces:
            i=self.node(a)
            F[6*i:6*i+6]+=ff
        equivalent=[]; member_uniform=[]
        for e in self.members:
            ix=[*range(6*e['i'],6*e['i']+6),*range(6*e['j'],6*e['j']+6)]
            K[np.ix_(ix,ix)]+=e['T'].T@e['k']@e['T']
            w=np.array(distributed(e) if distributed else [0.,0.,0.]);wl=e['T'][:3,:3]@w;L=e['L']
            fx,fy,fz=wl
            fe=np.array([fx*L/2,fy*L/2,fz*L/2,0,-fz*L*L/12,fy*L*L/12,
                         fx*L/2,fy*L/2,fz*L/2,0,fz*L*L/12,-fy*L*L/12])
            F[ix]+=e['T'].T@fe;equivalent.append(fe);member_uniform.append(wl)
        free=[i for i in range(n) if i//6 not in self.fixed]
        u=np.zeros(n);u[free]=np.linalg.solve(K[np.ix_(free,free)],F[free])
        receipts=[]
        for e,fe,wl in zip(self.members,equivalent,member_uniform):
            ix=[*range(6*e['i'],6*e['i']+6),*range(6*e['j'],6*e['j']+6)]
            fl=e['k']@e['T']@u[ix]-fe;s=e['s']
            ends=[]
            for k in [0,6]:
                N,Vy,Vz,T,My,Mz=fl[k:k+6]
                normal=abs(N)/s['A']+abs(My)/s['Wy']+abs(Mz)/s['Wz']
                shear=abs(Vy)/(2*s['t']*(s['B']-2*s['t']))+abs(Vz)/(2*s['t']*(s['H']-2*s['t']))+abs(T)/(2*(s['B']-s['t'])*(s['H']-s['t'])*s['t'])
                ends.append(dict(normalMPa=normal,shearMPa=shear,comparisonMPa=math.hypot(normal,math.sqrt(3)*shear),forceNAndMomentNmm=[float(x) for x in fl[k:k+6]]))
            L=e['L'];fx,fy,fz=wl
            candidates={0.,L}
            if abs(fz)>1e-20:candidates.add(max(0.,min(L,-fl[2]/fz)))
            if abs(fy)>1e-20:candidates.add(max(0.,min(L,-fl[1]/fy)))
            interior=[]
            for x in sorted(candidates):
                values=[-fl[0]-fx*x,-fl[1]-fy*x,-fl[2]-fz*x,-fl[3],
                        -fl[4]-fl[2]*x-fz*x*x/2,-fl[5]+fl[1]*x+fy*x*x/2]
                interior.append(dict(xMM=x,forceNAndMomentNmm=[float(a) for a in values]))
            maximum=[max(abs(t['forceNAndMomentNmm'][j]) for t in interior) for j in range(6)]
            N,Vy,Vz,T,My,Mz=maximum
            normal=N/s['A']+My/s['Wy']+Mz/s['Wz']
            shear=Vy/(2*s['t']*(s['B']-2*s['t']))+Vz/(2*s['t']*(s['H']-2*s['t']))+T/(2*(s['B']-s['t'])*(s['H']-s['t'])*s['t'])
            receipts.append(dict(name=e['name'],length=e['L'],sectionMM=[s['B'],s['H'],s['t']],ends=ends,
                interiorCriticalSections=interior,componentEnvelope=dict(comparisonMPa=math.hypot(normal,math.sqrt(3)*shear),
                    scope='Conservative independently maximized N/V/T/My/Mz over exact uniform-load endpoint and interior extrema. Components need not occur at the same section.')))
        reaction=K@u-F
        force_balance=np.zeros(3);moment_balance=np.zeros(3)
        for i,p in enumerate(self.nodes):
            total=F[6*i:6*i+6]+reaction[6*i:6*i+6]
            force_balance+=total[:3];moment_balance+=total[3:]+np.cross(p,total[:3])
        self.last_equilibrium=dict(forceResidualN=[float(a) for a in force_balance],momentResidualNmm=[float(a) for a in moment_balance],
            maxFreeResidualNAndNmm=float(max(abs(reaction[free]))),fixedReactions=[dict(point=self.nodes[i],reaction=[float(a) for a in reaction[6*i:6*i+6]]) for i in self.fixed])
        return u,receipts

def benchmark():
    s=section(40,100,3);f=Frame();a=(0,0,0);b=(1000,0,0)
    f.member(a,b,s,'cantilever');f.fixed=[0]
    u,_=f.solve([(b,np.array([0,0,-1000,0,0,0]))])
    expected=-1000*1000**3/(3*E*s['Iy'])
    assert math.isclose(u[8],expected,rel_tol=1e-10)
    u2,member2=f.solve([],lambda _: [0,0,-1])
    expected2=-1000**4/(8*E*s['Iy'])
    assert math.isclose(u2[8],expected2,rel_tol=1e-10)
    assert math.isclose(member2[0]['ends'][0]['forceNAndMomentNmm'][2],1000.,rel_tol=1e-10)
    assert math.isclose(abs(member2[0]['ends'][0]['forceNAndMomentNmm'][4]),500000.,rel_tol=1e-10)
    # Both-ended vertical restraint, free end rotations: qL^2/8 at the true midspan.
    g=Frame();g.member(a,b,s,'simply-supported-uniform');g.fixed=[0,1]
    # A separate two-element cantilever checks equilibrium at a member interior station.
    h=Frame();mid=(500,0,0);h.member(a,mid,s,'inner-half');h.member(mid,b,s,'outer-half');h.fixed=[0]
    uh,mh=h.solve([],lambda _: [0,0,-1])
    assert math.isclose(uh[6*h.node(b)+2],expected2,rel_tol=1e-10)
    assert math.isclose(abs(mh[0]['ends'][1]['forceNAndMomentNmm'][4]),125000.,rel_tol=1e-10)
    return dict(tipN=1000,lengthMM=1000,computedMM=float(u[8]),closedFormMM=expected,
                uniformNmm=1,uniformComputedMM=float(u2[8]),uniformClosedFormMM=expected2)

families={
 'primary':dict(width=350,waterDepth=170,bed=6605.75,front=6715,rear=6795,inner=4375,outer=4725,railZ=6880,railQ=4235,rootQ=3850,baseZ=6668,dropQ=4235,releaseQ=4335,
    rail=section(80,120,2),root=section(60,120,3),drop=section(60,60,2),arm=section(150,25,2),backingT=1.2,backingPitch=200,roots=[5025,6000,6975],
    stations=[4800,5325,5775,6225,6675,7200],
    tributaries=[325,562.5,562.5,562.5,562.5,325],
    waterP=[4696.794871794872,5156.25,5718.75,6281.25,6843.75,7303.205128205128],
    waterQ=[4518.589743589743,4550,4550,4550,4550,4518.589743589743],
    breaks=[(4520,5422.5),(5452.5,6547.5),(6577.5,7480)],
    faceLength=2900,verticalWindHeight=700,apronLow=6680.75,apronHigh=7290.188717651048,apronQ=4590),
 'lower':dict(width=425,waterDepth=190,bed=6386.25,front=6511.25,rear=6511.25,inner=4375,outer=4800,railZ=6730,railQ=4235,rootQ=3985,baseZ=6668,dropQ=4335,releaseQ=4335,
    rail=section(80,120,2),root=section(60,120,3),drop=section(200,20,3),arm=section(150,25,2),backingT=1.2,backingPitch=150,roots=[5041.6666667,6000,6958.3333333],
    stations=[4600,5100,5550,6000,6450,6900,7400],
    tributaries=[287.5,450,450,450,450,450,287.5],
    waterP=[4705.072463768116,5100,5550,6000,6450,6900,7294.927536231884],
    waterQ=[4535.144927536232,4587.5,4587.5,4587.5,4587.5,4587.5,4535.144927536232],
    breaks=[(4520,5310),(5340,6660),(6690,7480)],
    faceLength=2825,verticalWindHeight=850,apronLow=6421.25,apronHigh=7107.33,apronQ=4346),
}

def bolt_mass(d,length,af,head_h,nut_h,washer_od,washer_id,washer_t):
    hex_area=math.sqrt(3)/2*af*af
    volume=math.pi*d*d/4*length+hex_area*head_h+(hex_area-math.pi*d*d/4)*nut_h
    volume+=2*math.pi/4*(washer_od**2-washer_id**2)*washer_t
    return volume*8e-6

def nonframe_stock(name,c):
    """Explicit whole-face stock, including the real mitred ring lengths.

    This is a fabrication *comparison*, with every proposed item dimensioned.
    Joining, hot forming, hidden constituents and material acceptance are not inferred.
    """
    items=[];face=c['faceLength'];n=len(c['stations'])
    def item(label,kg,route='fixed',geometry=None):
        items.append(dict(item=label,kgPerFace=kg,kgm=kg/(face/1000),loadRoute=route,geometry=geometry))
    def profile(label,points,t,rho=8000,route='fixed'):
        area=sum(math.dist(a,b)*(12000-a[0]-b[0]) for a,b in zip(points,points[1:]))
        item(label,area*t*rho/1e9,route,dict(profileQZMM=points,thicknessMM=t,areaPerFaceMM2=area))
    def flat(label,developed,q,t,rho=8000,route='fixed'):
        profile(label,[(q,0),(q,developed)],t,rho,route)
    if name=='primary':
        profile('copper wet body with both actual mitred walls',[(4375,190),(4375,0),(4725,0),(4725,110)],1,8940,'moving')
        flat('copper rear25 hem',25,4375,1,8940,'moving');flat('copper front25 hem',25,4725,1,8940,'moving')
        profile('cap100 top and two20 folds',[(4700,0),(4700,20),(4800,20),(4800,0)],.7,route='moving')
        profile('front spill215 drop after primary+30/front+10,50 crossing and40 hems',[(4730,215),(4730,0),(4780,0),(4780,40)],.7,route='moving')
        toe=7290.188717651048;end=toe-65*math.tan(math.radians(25))
        upper=(4525-120*math.cos(math.radians(25)),toe+120*math.sin(math.radians(25)))
        fixed_profile=[upper,(4525,toe),(4590,end),(4590,6880)]
        profile('fixed primary apron,120 roof lap and courtward wet turn',fixed_profile,.7)
        flat('captured primary lower leaf320,190 stroke,120 minimum lap',320,4593,.7)
        flat('fixed and moving primary apron40 hems each',80,4590,.7)
        apron_length=(12000-2*4590)/1000
        apron_developed=(sum(math.dist(a,b) for a,b in zip(fixed_profile,fixed_profile[1:]))+320+80)/1000
        stand=.355;end_perimeter=350+110+190;flange_rho=8940;flange_t=1
        apron_partitions=[4590,5437.5,6562.5,7410]
        backing_rib_lengths=[350]*16+[350]*8
    else:
        profile('316L lower liner with both actual125 walls',[(4375,125),(4375,0),(4800,0),(4800,125)],.7,route='moving')
        flat('lower rear15 hem',15,4375,.7,route='moving');flat('lower front15 hem',15,4800,.7,route='moving')
        lower_profile=[(4545,7107.3288),(4565,7085),(4346,6990),(4346,c['bed']+35)]
        profile('secondary turn exact slope plus fixed downleg',lower_profile,.7)
        flat('secondary downleg120 lap and40 hems',160,4346,.7)
        profile('rear shoe90,20 fold,60 retracting tongue',[(4310,20),(4310,0),(4400,0),(4400,60)],.7,route='moving')
        apron_length=(12000-2*4346)/1000
        apron_developed=(sum(math.dist(a,b) for a,b in zip(lower_profile,lower_profile[1:]))+160)/1000
        stand=.330;end_perimeter=425+250;flange_rho=8000;flange_t=.7
        apron_partitions=[4346,5325,6675,7654]
        backing_rib_lengths=[425]*20+[425]*10
    # Separate supported ends at every independent cassette; separate ribs per moving pan.
    rib_counts=[math.ceil((b-a)/150)+1 for a,b in zip(apron_partitions,apron_partitions[1:])]
    rib_count=sum(rib_counts)
    item('independent RHS20×20×1 apron ribs,at150 maximum with separate cassette ends',rib_count*apron_developed*section(20,20,1)['kgm'],
         geometry=dict(count=rib_count,cassetteCounts=rib_counts,lengthM=apron_developed,sectionMM=[20,20,1],maxPitchMM=150))
    item('apron radial standoffs20×20×1.5 at each rib',rib_count*stand*section(20,20,1.5)['kgm'],
         geometry=dict(count=rib_count,lengthM=stand,sectionMM=[20,20,1.5]))
    profile('independent backing with no composite credit',[(c['inner'],0),(c['outer'],0)],c['backingT'],route='moving')
    for q in [c['inner']+20,c['outer']-20]:
        item('moving longitudinal rail30×25×2',section(30,25,2)['kgm']*(12000-2*q)/1000,'moving',dict(q=q))
    item('separate moving-pan backing ribs20×25×2; corner lengths bounded by fullwidth',sum(backing_rib_lengths)/1000*section(20,25,2)['kgm'],'moving',dict(count=len(backing_rib_lengths),maxPitchMM=c['backingPitch'],lengthsMM=backing_rib_lengths))
    item('three root plates160×120×8',3*.160*.120*.008*8000,geometry=dict(count=3,sizeMM=[160,120,8]))
    item('root and elbow gussets,12 triangular80×80×5',12*.080*.080*.005/2*8000,geometry=dict(count=12))
    item('two continuous guide flats20×3',2*.020*.003*8000*apron_length,geometry=dict(lengthM=2*apron_length))
    item('two20 end-flange returns at every equivalent module',2*n*end_perimeter*20*flange_t*flange_rho/1e9,'moving',dict(count=2*n,developedMM=end_perimeter,flangeMM=20))
    item('replaceable seam strips20×0.7,each side of every module',2*n*end_perimeter*20*.7*8000/1e9,'moving',dict(count=2*n))
    item('sixM12×50 root bolts perroot,eachwithnut/twowashers',18*bolt_mass(12,50,19,8,10,24,13,2.5),geometry=dict(count=18))
    item('twoM10×45 capture bolts perarm,eachwithnut/twowashers',2*n*bolt_mass(10,45,17,6.4,8,20,10.5,2),'moving',dict(count=2*n))
    item('two captive socket plates60×40×6 perarm',2*n*.060*.040*.006*8000,geometry=dict(count=2*n))
    item('twoM8×35 pan locks perarm,eachwithnut/twowashers',2*n*bolt_mass(8,35,13,5.3,6.5,16,8.5,1.6),'moving',dict(count=2*n))
    clip_count=2*sum(rib_counts)
    item('apron clips30×60×0.7 and tabs30×30×3',clip_count*(.030*.060*.0007+.030*.030*.003)*8000,
         geometry=dict(count=clip_count))
    item('twoM6×25 guide bolts perclip,eachwithnut/twowashers',2*clip_count*bolt_mass(6,25,10,4,5,12,6.5,1.5),geometry=dict(count=2*clip_count))
    # Weld metal is actual finite triangular cross section, not an unspecified percentage.
    weld_length=2*face/1000+2*n*(c['width']/1000+.300)+3*2*(.160+.120)
    item('3mm equal-leg fillet weld metal along declared carrier/root seams',weld_length*(.003*.003/2)*8000,geometry=dict(lengthM=weld_length,legMM=3))
    if name=='primary':
        item('captured80-stroke spill: two315-long Cguides40developed×1.5 per module',2*n*.315*.040*.0015*8000,'moving',dict(count=2*n,lengthMM=315,developedMM=40,thicknessMM=1.5))
        item('twoM6×25 spill locks per module',2*n*bolt_mass(6,25,10,4,5,12,6.5,1.5),'moving',dict(count=2*n))
        item('four20×20×3 spill stops per module',4*n*.020*.020*.003*8000,'moving',dict(count=4*n))
    return items

def make_frame(name,c,root_index):
    root=c['roots'][root_index];lo,hi=c['breaks'][root_index];z=c['railZ'];rq=c['railQ'];f=Frame()
    base=(root,c['rootQ'],c['baseZ']);elbow=(root,c['rootQ'],z);r=(root,rq,z)
    f.member(base,elbow,c['root'],'collector-root-riser');f.member(elbow,r,c['root'],'radial-root')
    f.fixed=[f.node(base)]
    ids=[i for i,p in enumerate(c['stations']) if min(range(3),key=lambda j:abs(c['roots'][j]-p))==root_index]
    cuts=sorted({lo,hi,root,*[c['stations'][i] for i in ids]})
    for a,b in zip(cuts,cuts[1:]):f.member((a,rq,z),(b,rq,z),c['rail'],'independent-distribution-rail')
    load_nodes={};toe_nodes={}
    for i in ids:
        p=c['stations'][i];zz=c['bed']-14
        dq=c['dropQ'];at=(p,dq,z);low=(p,dq,zz)
        f.member((p,rq,z),at,section(60,60,2),'exterior-hanger-head-stub')
        f.member(at,low,c['drop'],'fixed-hanger-drop')
        # A load station at the true cell radial centroid; the p eccentricity is an applied couple.
        ns=sorted(set([dq,c['releaseQ'],c['inner'],c['waterQ'][i],c['outer']]))
        for a,b in zip(ns,ns[1:]):f.member((p,a,zz),(p,b,zz),c['arm'],'fixed-socket-stub' if b<=c['releaseQ'] else 'moving-transverse-arm')
        load_nodes[i]=(p,c['waterQ'][i],zz)
        toe_nodes[i]=(p,c['outer'],zz)
    return f,ids,load_nodes,toe_nodes

def force_at(force,source,node):
    value=np.array([*force,*np.cross(np.subtract(source,node),force)],dtype=float)
    intended=np.cross(source,force)
    represented=np.cross(node,value[:3])+value[3:]
    assert np.max(np.abs(intended-represented))<1e-6
    return value

def module_span(c,i,q):
    if i==0:return q,4875.
    if i==len(c['stations'])-1:return 7125.,12000-q
    return c['waterP'][i]-c['tributaries'][i]/2,c['waterP'][i]+c['tributaries'][i]/2

def local_cassette(name,c,root_index):
    f,ids,load_nodes,toe_nodes=make_frame(name,c,root_index)
    root=c['roots'][root_index];z=c['railZ'];rq=c['railQ'];r=(root,rq,z)
    scenarios=[];governing_witnesses={};maxima={}
    stock=nonframe_stock(name,c)
    moving_kgm=sum(a['kgm'] for a in stock if a['loadRoute']=='moving')
    fixed_kgm=sum(a['kgm'] for a in stock if a['loadRoute']=='fixed')
    for waters in product([0,c['waterDepth']],repeat=len(ids)):
      # Every corner of this component pressure box is checked. Its convex hull includes
      # cardinal winds, zero wind, either vertical sign and independently signed apron/body pressure.
      for signp,signq,signfront,apronp,apronq,signz,gravity_factor in product([-1,1],[-1,1],[-1,1],[-1,1],[-1,1],[-1,1],[0.,1.35]):
        forces=[]
        for i,water in zip(ids,waters):
            length=c['tributaries'][i];q=c['waterQ'][i];p=c['stations'][i]
            # Actual corners retain actual plan area and along centroid.
            dry=gravity_factor*moving_kgm*length/1000*9.81
            wet=1.5*c['width']*length*water/1e6*9.81
            vertical_wind=signz*2.25*c['width']*length/1000
            down=dry+wet+vertical_wind
            # Each physical wall has its own length and centroid, including the true mitred half corner.
            wall_height=(c['rear']-c['bed'])
            # Along-face wind sees the two exposed end/corner half-pan faces, not imaginary .7m-high faces at every joint.
            Fp=signp*2.25*wall_height*c['width']/1000 if i in (0,len(c['stations'])-1) else 0.
            node=load_nodes[i]
            forces.append((node,force_at([0,0,-wet],(c['waterP'][i],q,c['bed']+water/2),node)))
            forces.append((node,force_at([0,0,-vertical_wind],(c['waterP'][i],q,c['bed']),node)))
            # Uniform moving-stock distribution is a declared remaining qualification at corners.
            forces.append((node,force_at([0,0,-dry],(c['waterP'][i],c['outer'],c['bed']),node)))
            forces.append((node,force_at([Fp,0,0],(p,(c['inner']+c['outer'])/2,c['bed']+wall_height/2),node)))
            for wallq,top,sg in [(c['inner'],c['rear'],signq),(c['outer'],c['front'],signfront)]:
                left,right=module_span(c,i,wallq);height=top-c['bed']
                fq=sg*.00225*(right-left)*height
                forces.append((node,force_at([0,fq,0],((left+right)/2,wallq,(top+c['bed'])/2),node)))
            fixed_g=gravity_factor*fixed_kgm*length/1000*9.81
            left,right=module_span(c,i,c['apronQ'])
            fa=apronq*.00225*(c['apronHigh']-c['apronLow'])*(right-left)
            fp=apronp*.00225*(c['apronHigh']-c['apronLow'])*300 if i in (0,len(c['stations'])-1) else 0.
            fixednode=(p,rq,z)
            forces.append((fixednode,force_at([fp,fa,0],((left+right)/2,c['apronQ'],(c['apronHigh']+c['apronLow'])/2),fixednode)))
            forces.append((fixednode,force_at([0,0,-fixed_g],(p,c['apronQ'],z),fixednode)))
        def member_load(e):
            # Consistent full-stock selfweight; exposed-member wind bounded by its larger section dimension.
            w=np.array([0.,0.,-gravity_factor*e['s']['kgm']*9.81/1000])
            for ax,sg in [(0,signp),(1,signq)]:
                if sg:
                    transverse=math.sqrt(max(0,1-e['T'][0,ax]**2))
                    w[ax]=sg*.00225*max(e['s']['B'],e['s']['H'])*transverse
            return w
        u,member_receipts=f.solve(forces,member_load)
        disp=[]
        for i in ids:
            station=c['stations'][i];ti=6*f.node(toe_nodes[i]);ri=6*f.node((station,rq,z));rooti=6*f.node(r)
            bi=6*f.node((station,c['inner'],c['bed']-14))
            disp.append(dict(station=station,verticalMM=float(u[ti+2]),radialMM=float(u[ti+1]),alongMM=float(u[ti]),
                rearVerticalMM=float(u[bi+2]),pairedWidthRollMM=float(u[ti+2]-u[bi+2]),
                fixedRailVertical=float(u[ri+2]),fixedRailRotationP=float(u[ri+3]),fixedRailRotationQ=float(u[ri+4]),
                rootVertical=float(u[rooti+2]),rootRotationP=float(u[rooti+3]),rootRotationQ=float(u[rooti+4])))
        worst=max((m['componentEnvelope']['comparisonMPa'],m['name']) for m in member_receipts)
        scenario=dict(waterDepthByStation=dict(zip((str(c['stations'][i]) for i in ids),waters)),windSigns=dict(body=[signp,signq,signfront],apron=[apronp,apronq],vertical=signz),gravityFactor=gravity_factor,worstMPa=worst[0],governingMember=worst[1],toes=disp,equilibrium=f.last_equilibrium)
        metrics=dict(stress=worst[0],absoluteVertical=max(abs(t['verticalMM']) for t in disp),width=max(abs(t['pairedWidthRollMM']) for t in disp),radial=max(abs(t['radialMM']) for t in disp))
        for metric,value in metrics.items():
            if value>maxima.get(metric,-1):
                maxima[metric]=value;governing_witnesses[metric]=dict(scenario=scenario,members=member_receipts)
        scenarios.append(scenario)
    return dict(name=name,root=root,nodes=f.nodes,stockLengthByNameMM={tag:sum(e['L'] for e in f.members if e['name']==tag) for tag in sorted({e['name'] for e in f.members})},
      frameDryKg=sum(e['L']/1000*e['s']['kgm'] for e in f.members),scenarios=scenarios,governingWitnesses=governing_witnesses)

def strip_pressure(t,pitch,pressure):
    I=t**3/12;Z=t*t/6
    return dict(stressMPa=pressure*pitch*pitch/(8*Z),deflectionMM=5*pressure*pitch**4/(384*E*I))

def mass_inventory(name,c,cassettes):
    items=nonframe_stock(name,c)
    frame_kg=sum(x['frameDryKg'] for x in cassettes)
    items.append(dict(item='complete fixed root, rail, hanger and removable arm stock',kgPerFace=frame_kg,kgm=frame_kg/(c['faceLength']/1000),loadRoute='frame'))
    total=sum(x['kgm'] for x in items)
    cassette_rows=[]
    for assembly in cassettes:
        stations=list(assembly['scenarios'][0]['waterDepthByStation'])
        length=sum(c['tributaries'][c['stations'].index(float(v))] for v in stations)
        # Point root plates/bolts belong to their own cassette; the face-average allocation
        # below is only a first conservative screening distribution, not actual piece centroids.
        nonframe_kg=sum(x['kgPerFace'] for x in items if x['loadRoute']!='frame')*length/c['faceLength']
        pitch=(12000-2*((c['inner']+c['outer'])/2))/3
        native_bound=([58.5,67.5,58.5] if name=='primary' else [57.5,81.,57.5])[c['roots'].index(assembly['root'])]
        actual=assembly['frameDryKg']+nonframe_kg
        cassette_rows.append(dict(root=assembly['root'],tributaryLengthMM=length,screenedMassKg=actual,native60BoundKg=native_bound,reserveKg=native_bound-actual,
            qualification='Root plates/bolts and exact corner/mitred stock need actual finite-piece cassette allocation; this is not a centroid receipt.'))
    return dict(items=items,totalKgM=total,reserveAgainst50=50-total,reserveAgainst55=55-total,reserveAgainst60FaceAverage=60-total,completeDimensionedComparisonStock=True,
        completeFabricationInventory=False,cassetteMassScreen=cassette_rows)

def manning_depth(q,width):
    lo,hi=0.,1000.
    for _ in range(80):
        h=(lo+hi)/2;a=width*h/1e6
        flow=1000*a*(a/((width+2*h)/1000))**(2/3)*math.sqrt(.004)/.020
        if flow>q:hi=h
        else:lo=h
    return (lo+hi)/2

def flow_receipt(q,width,depth):
    d=manning_depth(q,width/2);v=q*1000/(width/2*d);k=4*v*v/19.62*1000
    return dict(flowLps=q,widthMM=width,halfObstructedDepth=d,K4HeadMM=k,
                settingMM=10,splashMM=25,movementMM=14,reserveMM=depth-d-k-49)

def current_geometry():
    out=dict(nominalFacadeQ=4250,authoredProjectionChallengeQ=4275,
        projectionQualification='25mm is an authored projection/setout challenge, not a recovered proud-brick dimension.',
        windowHeadZ=6300,outerArchTop=6515,courtRingSolidQZ=[3777.5,4057.5,6540,6660],
        rootFootPlates=dict(primary=[3790,3910,6660,6668],lower=[3925,4045,6660,6668]),
        newWallHeadRecess=dict(continuousQZ=[4180,4290,6640,6960],primaryLocalQZ=[4190,4280,6540,6880],
            primaryLocalHalfWidthP=50,residualAboveArchAtLocalPocket=25,
            qualification='A NEW explicit masonry/weather interface. Arch stability, remaining spandrel, closures and collector attachment are not qualified. Existing masonry is not treated as air.'),
        sourceCapQZ=[4700,4800,6820,6840],secondaryWetProfile=[(4545,7107.3288),(4565,7085),(4346,6990)],
        secondaryBaffleTop=[4565,7145],primarySlidingApron=dict(q=4593,length=320,stroke=190,lowToe=6680.75,highToe=6710,
            fixedToe=6880,minimumNormalLap=120.75,highestRetractedTop=7220,
            nominalRetractedToeToPrimaryRear=6870.75-families['primary']['rear']),
        capturedPrimarySpill=dict(stroke=80,installedTop=6715,retractedTop=6795,capUnderside=6820,nominalTopGap=25,
            lowestInstalledToe=6506.25,lowestRetractedToe=6586.25,minimumNominalLowerRimGap=75,
            qualification='The spill must retract and lock before horizontal primary movement; the old attached low toe collides with the lower front.'),
        lowerShoe=dict(q=[4310,4400],lipHeight=20,tongueStroke=60,downlegToeAboveLocalBed=35),families={})
    for name,c in families.items():
        out['families'][name]=dict(wetQ=[c['inner'],c['outer']],minimumBedZ=c['bed'],maximumBedZ=6635 if name=='primary' else 6415,
            frontZ=c['front'] if name=='primary' else [c['bed']+125,6540],rearZ=c['rear'] if name=='primary' else [c['bed']+125,6540],
            waterComparisonDepth=c['waterDepth'],railQZ=[c['railQ']-c['rail']['B']/2,c['railQ']+c['rail']['B']/2,c['railZ']-c['rail']['H']/2,c['railZ']+c['rail']['H']/2],
            hangerRadialQ=[c['dropQ']-c['drop']['H']/2,c['dropQ']+c['drop']['H']/2],carrierMaximumBelowWetFloor=26.9,
            minCarrierToWindowHead=c['bed']-26.9-6300,rootsP=c['roots'],stationsP=c['stations'],dryCassetteBreaks=c['breaks'])
    return out

def carrier_strip_checks(c):
    pressure=(1.5*9.81*c['waterDepth']/1000+2.25+.25)/1000
    plate=strip_pressure(c['backingT'],c['backingPitch'],pressure)
    rib=section(20,25,2);span=c['width']-40;line=pressure*c['backingPitch']
    rib_result=dict(spanMM=span,uniformNMM=line,stressMPa=line*span**2/(8*rib['Wy']),
        deflectionMM=5*line*span**4/(384*E*rib['Iy']))
    rail=section(30,25,2);cantilever=375. if c['width']==350 else 200.;line=pressure*c['width']/2
    rail_result=dict(cantileverMM=cantilever,uniformNMM=line,stressMPa=line*cantilever**2/(2*rail['Wy']),
        deflectionMM=line*cantilever**4/(8*E*rail['Iy']))
    return dict(plate=plate,transverseRib=rib_result,longitudinalCarrier=rail_result,
        summedVerticalBoundMM=plate['deflectionMM']+rib_result['deflectionMM']+rail_result['deflectionMM'],
        qualification='Separate linear strip/member envelopes, no composite action. Exact corner carrier articulation, joints and support contacts remain unproved.')

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-root',type=Path,default=ROOT)
    parser.add_argument('--native-receipt',type=Path)
    parser.add_argument('--output',type=Path,default=Path(__file__).with_suffix('.json'))
    args=parser.parse_args();root=args.source_root.resolve()
    sources=['project/had/studies/water-replan.json','project/mat/studies/ring-roof-family.json','project/rof/roof-water-recovery.md']
    hashes={name:hashlib.sha256((root/name).read_bytes()).hexdigest() for name in sources}
    result={'status':'UNSELECTED NEW CANDIDATE; NOT RECOVERED SOURCE OR AN ADOPTED ASSEMBLY','benchmark':benchmark(),
      'sourceHashes':hashes,'candidateSourceSHA256':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
      'runtime':dict(dependency='NumPy; current reference run2.3.5',units='N,mm,MPa',portable=True,privateFallbacks=False),
      'steel':dict(E=E,G=G,requiredProofAt100C=165,resistanceMPa=FY),
      'geometry':current_geometry(),'families':{},
      'nativeJoin':dict(status='NOT JOINED TO COMPLETE CURRENT INNER PRESSURE DOMAIN',
          receiptSHA256=hashlib.sha256(args.native_receipt.read_bytes()).hexdigest() if args.native_receipt else None,
          requirement='280court ring;350/425 wet widths;170/190 water; explicit60 per-cassette mass caps; own current pressure resultants and residual stock centroids.'),
      'loadDomain':dict(water='every0/full combination at actual arm cells',gravityFactors=[0,1.35],
          horizontal='simultaneous p/q pressure; rear/front and apron independently signed',verticalWindSigns=[-1,1],
          pressureKPa=2.25,interiorForces='Exact uniform-load component extrema, conservatively combined independently',
          missing=['Moving/fixed nonframe dry-stock arm allocation still uses equivalent line mass; exact residual piece centroids have not been joined.',
                   'The main local frame uses the lowest bed as a hanger-length comparison. Actual graded-bed skin/guide geometry and corner articulation are not represented by a rigid flat pan.',
                   'The apron uses a finite bounding pressure rectangle in the local frame; the separate pressure manifest preserves the detailed panel projection comparison.',
                   'Apron rib/contact and slide-guide deformation is not included in the main frame toe bound.']),
      'unknowns':['Whole L corner support/articulation must preserve the native half-pan root allocation.',
        'Actual wall/weather recess, arch stability and280 collector seat/diaphragm/root introduction remain unqualified.',
        'First normal-head/spout release needs an installed independent rain bridge, collar and complete dry-hole closure.',
        'The fixed handling trough and raised rests/gates are a new temporary stage; full deployment, supports, outlets, guards and reverse sequence are not proved.',
        'Wet module joints and apron overlaps must pass water without transferring unmodelled vertical force/torsion between independent roof cassettes.',
        'Full stock count is a dimensioned material comparison. Actual manufacturing, welding, materials, fastener access and exact installed contacts are not qualified.']}
    for name,c in families.items():
        sets=[local_cassette(name,c,i) for i in range(3)]
        inv=mass_inventory(name,c,sets);backing=carrier_strip_checks(c)
        result['families'][name]=dict(definition=c,cassettes=sets,inventory=inv,carrier=backing,
            maxLocalToeVerticalMM=max(abs(t['verticalMM']) for r in sets for s in r['scenarios'] for t in s['toes']),
            maxLocalPairedWidthMM=max(abs(t['pairedWidthRollMM']) for r in sets for s in r['scenarios'] for t in s['toes']),
            maxLocalNormalMM=max(abs(t['radialMM']) for r in sets for s in r['scenarios'] for t in s['toes']),
            worstMemberMPa=max(s['worstMPa'] for r in sets for s in r['scenarios']))
    result['temporaryCaptureComparison']=dict(kind='NEW independent ground-supported handling trough under the entire body path',
        floorZ=6100,rimZ=6250,restTopZ=6280,stageFloorZ=5540,guardTopZ=6640,
        partGateClosedBottom=6250,partGateOpenBottom=7140,partGateLift=890,
        fixedLowerGuardHeight=710,minimumInstalledLowerCarrierToRim=6386.25-26.9-6250,
        dutyLps=3.60375,status='NO FIRST-RELEASE OR WHOLE-PATH WATER PASS; part/guard concept only',
        failedOldGeometry='A continuous trough cannot coexist with the old5750 rest and full-height descending gates: it blocks lowering and gate closure.')
    result['outcome']='REJECT FOR SELECTION: useful finite stock/frame comparison; complete wind, geometry, residual mass and ordinary rain-safe renewal remain unproved.'
    args.output.write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(dict(status=result['status'],source=result['candidateSourceSHA256'],output=str(args.output),geometry=result['geometry'],outcome=result['outcome']),indent=2))
    for name,r in result['families'].items():
        print(name,dict(massKgM=r['inventory']['totalKgM'],stressMPa=r['worstMemberMPa'],localToeMM=r['maxLocalToeVerticalMM'],localWidthMM=r['maxLocalPairedWidthMM'],carrierMM=r['carrier']['summedVerticalBoundMM'],localNormalMM=r['maxLocalNormalMM']))

if __name__=='__main__':main()
