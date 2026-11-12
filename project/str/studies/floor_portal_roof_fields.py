"""Exact Euler fields in the retained native ring and outer roof rafters.

The source roof uses Euler beams in these members. Located point loads keep
their fixed-end actions and local displacement bubbles. This module recovers
that same model; it does not introduce any new support or beam stiffness.
N/mm/radians, proper local X/Y/Z bases, signed simultaneous six-actions.
"""
import math
import numpy as np
from floor_portal_frame import beam_matrix,offset,hermite,hermite_derivative


def element(a,b,pa,pb,section,key):
    delta=np.asarray(pb)-pa;L=np.linalg.norm(delta);x=delta/L
    y=np.array([-x[1],x[0],0.]);y/=np.linalg.norm(y);z=np.cross(x,y);R=np.array([x,y,z])
    rot=np.zeros((6,6));rot[:3,:3]=rot[3:,3:]=R
    ia,ta=a;ib,tb=b;t=np.zeros((12,12));t[:6,:6]=rot@ta;t[6:,6:]=rot@tb
    B,H,w=section['B'],section['H'],section['t'];J=4*((B-w)*(H-w))**2/(2*(B-w+H-w)/w)
    EA,EIy,EIz,GJ=200000.*section['A'],200000.*section['I'],200000.*section['Iminor'],77000.*J
    return dict(a=np.asarray(pa),b=np.asarray(pb),L=L,R=R,ids=np.r_[ia,ib],t=t,
                k=beam_matrix(L,EA,EIy,EIz,GJ),EA=EA,EIy=EIy,EIz=EIz,GJ=GJ,
                load_key=key,width=B,depth=H)


def elements(h):
    if hasattr(h,'roof_field_elements'):return h.roof_field_elements
    p=h.roof.p;out={}
    for a,b in p['rings']:
        key=('native ring',tuple(a),tuple(b))
        out[key]=element(h.roof.port(a),h.roof.port(b),np.r_[a,6600.],np.r_[b,6600.],p['collectorSection'](a,b),key)
    for crown,(outer,inner) in p['crowns'].items():
        native=[p['highD'](crown,j) for j in range(3)]+[p['rRot'](crown,j) for j in range(3)]
        ids=np.array([h.roof.mounted[h.roof.lookup[i]] for i in native])
        high=(ids,offset([0,0,-200.]));pa=np.r_[outer,p['zheel']];pb=np.r_[crown,p['zhigh']]
        key=('native outer rafter',tuple(outer),tuple(crown))
        out[key]=element(h.roof.port(outer,pa),high,pa,pb,p['w']['sections']['primary'],key)
    h.roof_field_elements=out
    return out


def local_load(e,t,force,moment=(0.,0.,0.),at=None):
    point=e['a']+(e['b']-e['a'])*t;force=np.asarray(force)
    moment=np.asarray(moment)+np.cross(np.zeros(3) if at is None else np.asarray(at)-point,force)
    f=e['R']@force;m=e['R']@moment;out=np.zeros(12);L=e['L']
    out[[0,6]]=f[0]*np.array([1-t,t]);out[[3,9]]=m[0]*np.array([1-t,t])
    out[[1,5,7,11]]=f[1]*hermite(t,L)+m[2]*hermite_derivative(t,L)
    out[[2,4,8,10]]=(f[2]*hermite(t,L)-m[1]*hermite_derivative(t,L))*[1,-1,1,-1]
    return out,np.r_[f,m]


def field(e,u,ends,loads,x,side=1,eigen=None):
    """Actual section field at x; side chooses a point-load jump endpoint.

    Actions are the forces on the member from the material to its left,
    transported to this cut. Thus the right endpoint is minus its end action.
    """
    x=float(x);v=np.asarray(u);a=e['k']@v-ends;N,Vy,Vz,T,My,Mz=a[:6]
    displacement=v[:6].copy()
    displacement[0]+=-N*x/e['EA']
    displacement[1]+=v[5]*x-Mz*x*x/(2*e['EIz'])+Vy*x**3/(6*e['EIz'])
    displacement[2]+=-v[4]*x+My*x*x/(2*e['EIy'])+Vz*x**3/(6*e['EIy'])
    displacement[3]+=-T*x/e['GJ']
    displacement[4]+=-(My*x+Vz*x*x/2)/e['EIy']
    displacement[5]+=(-Mz*x+Vy*x*x/2)/e['EIz']
    action=np.r_[a[:3],a[3:6]+np.cross([-x,0,0],a[:3])]
    for at,load in loads:
        d=x-at
        if d<0 or (d==0 and side<0):continue
        f,m=load[:3],load[3:];action[:3]+=f;action[3:]+=m+np.cross([-d,0,0],f)
        displacement[0]+=-f[0]*d/e['EA'];displacement[3]+=-m[0]*d/e['GJ']
        displacement[1]+=(-m[2]*d*d/2+f[1]*d**3/6)/e['EIz']
        displacement[2]+=(m[1]*d*d/2+f[2]*d**3/6)/e['EIy']
        displacement[4]+=-(m[1]*d+f[2]*d*d/2)/e['EIy']
        displacement[5]+=(-m[2]*d+f[1]*d*d/2)/e['EIz']
    if eigen is not None:
        action-=np.r_[eigen[:3],eigen[3:6]+np.cross([-x,0,0],eigen[:3])]
    return displacement,action


def controls():
    # Independent split-element solve of a loaded, clamped Euler member.
    sec=dict(B=220.,H=120.,t=20.,A=12000.,I=20e6,Iminor=50e6)
    e=element((np.arange(6),np.eye(6)),(np.arange(6,12),np.eye(6)),np.array([0.,0.,0.]),np.array([1800.,0.,0.]),sec,('control',))
    at=713.;F=np.array([217.,-983.,1531.,47113.,-93171.,31871.]);load,ff=local_load(e,at/e['L'],F[:3],F[3:])
    prescribed=np.array([.12,-.7,.9,.0003,-.0002,.0005,-.31,.8,-.6,-.0004,.0008,-.0001])
    error=0.
    for x in (0.,331.,713.,1251.,1800.):
        cuts=sorted(set([0.,at,x,e['L']]));K=np.zeros((6*len(cuts),6*len(cuts)));rhs=np.zeros(len(K))
        for i,(a,b) in enumerate(zip(cuts,cuts[1:])):
            ids=np.r_[np.arange(6*i,6*i+6),np.arange(6*i+6,6*i+12)]
            K[np.ix_(ids,ids)]+=beam_matrix(b-a,e['EA'],e['EIy'],e['EIz'],e['GJ'])
        rhs[6*cuts.index(at):6*cuts.index(at)+6]=F
        fixed=np.r_[np.arange(6),np.arange(len(K)-6,len(K))];free=np.setdiff1d(np.arange(len(K)),fixed)
        solution=np.zeros(len(K));solution[fixed]=prescribed
        solution[free]=np.linalg.solve(K[np.ix_(free,free)],rhs[free]-K[np.ix_(free,fixed)]@prescribed)
        v,a=field(e,prescribed,load,[(at,ff)],x);reference=solution[6*cuts.index(x):6*cuts.index(x)+6]
        error=max(error,float(np.max(abs(v-reference))));assert np.max(abs(v-reference))<1e-9
    end=field(e,prescribed,load,[(at,ff)],e['L'])[1]
    end_error=float(max(abs(end+(e['k']@prescribed-load)[6:])))
    assert end_error<1e-6
    return dict(splitElementDisplacementMaximumError=error,signedRightEndEquilibriumErrorN_Nmm=end_error)


def native_controls(h):
    """Compare independent recovery matrices with the source's own terms."""
    import ast
    from pathlib import Path
    p=h.roof.p;rng=np.random.default_rng(72031);worst=0.;ring_error=0.
    if 'ringMoment' not in p:
        path=Path(p['__file__']);tree=ast.parse(path.read_text())
        body=[node for node in tree.body if isinstance(node,ast.FunctionDef) and node.name=='ringMoment']
        exec(compile(ast.Module(body=body,type_ignores=[]),str(path),'exec'),p)
    native=rng.normal(size=p['spaceSize'])*.0001
    global_u=np.zeros(h.f.size);global_u[h.roof.mounted]=native[h.roof.keep]
    for key,e in elements(h).items():
        values=e['k']@e['t']@global_u[e['ids']]
        if key[0]=='native ring':
            a,b=key[1:];reference=np.array(p['ringMoment'](native,a,b))*1e6
            ring_error=max(ring_error,float(max(abs(reference-values[[5,11]]*[1,-1]))))
            continue
        outer,crown=key[1:];reference=np.zeros(p['spaceSize'])
        terms,k=h.roof.props['leg',outer,crown];v=sum(weight*native[i] for i,weight in terms)
        for i,weight in terms:reference[i]+=weight*k*v
        for tag,terms,matrix in p['outerTerms'][outer,crown]:
            local=np.array([sum(weight*native[i] for i,weight in row) for row in terms]);action=np.array(matrix)@local
            for row,f in zip(terms,action):
                for i,weight in row:reference[i]+=weight*f
        own=np.zeros(h.f.size);np.add.at(own,e['ids'],e['t'].T@values)
        wanted=reference[h.roof.keep];error=max(abs(own[h.roof.mounted]-wanted));scale=max(abs(wanted))
        worst=max(worst,float(error/max(1.,scale)));assert error<max(.001,scale*1e-12),(key,error,scale)
    assert ring_error<1e-5,ring_error
    return dict(nativeOuterRafterRelativeActionError=worst,nativeRingPlanMomentErrorNmm=ring_error)


def roof_point(h,case,u,point):
    """Physical displacement at a point rigidly offset from the ring axis."""
    point=np.asarray(point);p=h.roof.p
    candidates=[]
    for key,e in elements(h).items():
        if key[0]!='native ring':continue
        x=float(np.dot(point-e['a'],e['b']-e['a'])/e['L'])
        plan=e['a']+x*(e['b']-e['a'])/e['L']
        if -1e-7<=x<=e['L']+1e-7:
            candidates.append((np.linalg.norm(point[:2]-plan[:2]),key,e,x,plan))
    distance,key,e,x,plan=min(candidates,key=lambda row:row[0])
    assert distance<=120.,('Point is not within the actual box width',point,distance)
    local,_=field(e,e['t']@u[e['ids']],case.ends.get(key,np.zeros(12)),case.field_loads.get(key,[]),x)
    physical=np.r_[e['R'].T@local[:3],e['R'].T@local[3:]]
    return offset(point-plan)@physical


def spandrel_clearance(h,case,u):
    """Finite source arch-section offset comparison at the6515 top edge.

    Upper spandrel material is carried with the arch section in this bounded
    kinematic comparator; an independent infill shear field is not invented.
    This is an elastic gap requirement, not a tolerance or fire closure proof.
    """
    from floor_portal_house import xy
    rows=[]
    for strip in h.arch_strips:
        if strip['dz']!=3450.:continue
        for station,z,node,at in strip['points']:
            for normal in (222.5,402.5):
                top=np.r_[xy(strip['face'],normal,station),6515.];ids,t=h.f.port(node,top)
                column=t@u[ids];steel=roof_point(h,case,u,top+[0,0,25.]);gap=25+steel[2]-column[2]
                rows.append(dict(face=strip['face'],openingCentre=strip['centre'],station=station,normal=normal,
                                 gapMM=float(gap),steelUzMM=float(steel[2]),archOffsetUzMM=float(column[2])))
    return dict(scope='Upper arch-section rigid-offset comparator at13 stations per opening and both normal faces; roof local fixed-end flexibility included',
                minimumGap=min(rows,key=lambda r:r['gapMM']),maximumGap=max(rows,key=lambda r:r['gapMM']),
                requirements='Add geometric tolerances, the actual upper infill field and material/closure movement before admission')


def recover(h,case,u):
    rows=[];end_error=0.;maximum=np.zeros(6);witness=[None]*6;translation=0.
    for key,e in elements(h).items():
        v=e['t']@u[e['ids']];loads=case.field_loads.get(key,[]);ends=case.ends.get(key,np.zeros(12));eigen=case.native_eigen.get(key,np.zeros(12))
        right,_=field(e,v,ends,loads,e['L']);end_error=max(end_error,float(max(abs(right-v[6:]))))
        cuts=sorted(set([0.,e['L'],*[x for x,f in loads]]))
        samples=set(cuts)
        # Displacement is cubic and moments linear between these located
        # point loads. Include all derivative roots, not just a coarse grid.
        for a,b in zip(cuts,cuts[1:]):
            if b-a<1e-8:continue
            L=b-a;origin,action=field(e,v,ends,loads,a)
            N,Vy,Vz,My,Mz=action[0],action[1],action[2],action[4],action[5]
            derivative=e['R'].T@np.array([[0.,0.,-N/e['EA']],[Vy/(2*e['EIz']),-Mz/e['EIz'],origin[5]],[Vz/(2*e['EIy']),My/e['EIy'],-origin[4]]])
            for coefficients in derivative:
                roots=np.roots(np.trim_zeros(np.array(coefficients),'f')) if any(coefficients) else []
                samples.update(a+float(r.real) for r in roots if abs(r.imag)<1e-8 and 0<r.real<L)
        for x in sorted(samples):
            for side in (-1,1) if x in cuts else (1,):
                d,a=field(e,v,ends,loads,x,side,eigen);global_d=e['R'].T@d[:3];translation=max(translation,float(max(abs(global_d))))
                for j in np.flatnonzero(abs(a)>maximum):
                    maximum[j]=abs(a[j]);witness[j]=dict(member=[key[0],list(key[1]),list(key[2])],stationMM=x,side=side,actions=a.tolist())
        rows.append(dict(member=[key[0],list(key[1]),list(key[2])],a=e['a'].tolist(),b=e['b'].tolist(),endDisplacement=v.tolist(),fixedEndLoads=ends.tolist(),eigenstrainEndForces=eigen.tolist(),pointLoads=[(x,f.tolist()) for x,f in loads]))
    assert end_error<1e-6,('Roof local fixed-end displacement mismatch',end_error)
    return dict(scope='Retained Euler ring and outer rafter fields; no inner-primary or secondary-member interior certificate',
                maximumGlobalTranslationComponentMM=translation,endpointDisplacementErrorMMOrRad=end_error,
                maxAbsLocal_N_Vy_Vz_T_My_Mz=maximum.tolist(),witness=witness,fields=rows)


if __name__=='__main__':
    import json
    print(json.dumps(controls(),indent=2))
