"""Recover local physical arm/hanger movement from the frozen frame source.

Exact Euler-Bernoulli interpolation includes the uniform-load quartic bubble
and section rotation. Native roof/facade motion is not cancelled or included.
"""
from pathlib import Path
import importlib.util,hashlib,json,math
import numpy as np
P=np.polynomial.Polynomial
SOURCE=Path(__file__).with_name('roof_water_inner_candidate.py')
spec=importlib.util.spec_from_file_location('candidate',SOURCE);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
original=m.Frame.solve
active={};all_results=[]

def interpolants(frame,e,u,distributed):
    ids=[*range(6*e['i'],6*e['i']+6),*range(6*e['j'],6*e['j']+6)]
    d=e['T']@u[ids];L=e['L'];s=e['s'];rot=e['T'][:3,:3]
    wind=rot@np.array(distributed(e) if distributed else[0,0,0])
    t=P([0,1]);h1=1-3*t*t+2*t**3;h2=t-2*t*t+t**3;h3=3*t*t-2*t**3;h4=-t*t+t**3
    bubble=t*t*(1-t)**2
    axial=(1-t)*d[0]+t*d[6];torsion=(1-t)*d[3]+t*d[9]
    v=h1*d[1]+h2*L*d[5]+h3*d[7]+h4*L*d[11]+bubble*wind[1]*L**4/(24*m.E*s['Iz'])
    w=h1*d[2]-h2*L*d[4]+h3*d[8]-h4*L*d[10]+bubble*wind[2]*L**4/(24*m.E*s['Iy'])
    dis=[axial,v,w];ang=[torsion,-w.deriv()/L,v.deriv()/L]
    return [[sum((rot[j,i]*a[j] for j in range(3)),P([0])) for i in range(3)] for a in [dis,ang]]

def extrema(poly,lo,hi):
    at=[lo,hi]
    for r in poly.deriv().roots():
        if abs(r.imag)<1e-9 and lo<r.real<hi:at.append(float(r.real))
    return [(float(poly(t)),t) for t in at]

def record(station,component,values,e,offset):
    key=(station,component)
    for value,t in values:
        if key not in active['controls'] or abs(value)>abs(active['controls'][key]['valueMM']):
            active['controls'][key]=dict(valueMM=value,scenarioIndex=active['counter'],element=e['name'],
                elementFraction=t,sectionOffsetPqZMM=list(offset))

def wrapped(self,forces,distributed=None):
    u,receipt=original(self,forces,distributed)
    circuit=active['circuit'];c=m.families[circuit]
    for e in self.members:
        a,b=self.nodes[e['i']],self.nodes[e['j']]
        if circuit=='primary':
            if e['name'] not in ['fixed-socket-stub','moving-transverse-arm']:continue
            qlo=max(4325,min(a[1],b[1]));qhi=min(4345,max(a[1],b[1]))
            if qhi<qlo:continue
            lo=(qlo-a[1])/(b[1]-a[1]);hi=(qhi-a[1])/(b[1]-a[1])
            offsets=[(p,0,z) for p in [-75,75] for z in [-12.5,12.5]]
        else:
            if e['name']!='fixed-hanger-drop':continue
            zlo=max(6579.25,min(a[2],b[2]));zhi=min(6633.5,max(a[2],b[2]))
            if zhi<zlo:continue
            lo=(zlo-a[2])/(b[2]-a[2]);hi=(zhi-a[2])/(b[2]-a[2])
            offsets=[(p,q,0) for p in [-100,100] for q in [-10,10]]
        lo,hi=min(lo,hi),max(lo,hi)
        dis,ang=interpolants(self,e,u,distributed)
        for rp,rq,rz in offsets:
            along=dis[0]+ang[1]*rz-ang[2]*rq
            normal=dis[1]+ang[2]*rp-ang[0]*rz
            record(a[0],'along',extrema(along,lo,hi),e,(rp,rq,rz))
            record(a[0],'normal',extrema(normal,lo,hi),e,(rp,rq,rz))
    active['counter']+=1
    return u,receipt

m.Frame.solve=wrapped
for circuit,c in m.families.items():
    for j,root in enumerate(c['roots']):
        active=dict(circuit=circuit,root=root,counter=0,controls={})
        comparison=m.local_cassette(circuit,c,j)
        for (station,component),control in active['controls'].items():
            s=comparison['scenarios'][control['scenarioIndex']]
            control.update(circuit=circuit,rootP=root,stationP=station,component=component,
                loadCase=dict(water=s['waterDepthByStation'],wind=s['windSigns'],gravity=s['gravityFactor']))
            all_results.append(control)
        del comparison

p_bounds={x['stationP']:abs(x['valueMM']) for x in all_results if x['circuit']=='primary' and x['component']=='along'}
l_bounds={x['stationP']:abs(x['valueMM']) for x in all_results if x['circuit']=='lower' and x['component']=='along'}
pairs=[]
for p in m.families['primary']['stations']:
    for q in m.families['lower']['stations']:
        gap=abs(p-q)-75-100
        if gap<=50:
            local=p_bounds[p]+l_bounds[q]
            pairs.append(dict(primaryStationP=p,lowerStationP=q,nominalPGapMM=gap,
                primaryLocalAbsoluteAlongMM=p_bounds[p],lowerLocalAbsoluteAlongMM=l_bounds[q],
                opposedSettingMM=10,remainingForNativeRelativeAndOtherMotionMM=gap-local-10))
result=dict(status='LOCAL FRAME MOVEMENT RECOVERY ONLY; native pair/facade motion and added apron-frame wind still required',
    candidateSourceSHA256=hashlib.sha256(SOURCE.read_bytes()).hexdigest(),sourceSHA256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
    method='Exact cubic beam interpolation plus consistent-load quartic displacement; exact polynomial extrema over the overlap; physical section rotation included.',
    points=dict(primaryOverlapQ=[4325,4345],primaryLocalZ=[6579.25,6604.25],nativePrimaryGradeExpandedZ=[6579.25,6633.5],
        lowerHangerQ=[4325,4345],lowerQueriedZ=[6579.25,6633.5]),
    controls=all_results,pairs=pairs,
    qualification='The frozen local model retains declared nonframe stock/guide/corner limitations. These local displacements cannot substitute for native relative movement or added pressure.')
path=Path(__file__).with_suffix('.json');path.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(dict(path=str(path),pairMinimumRemaining=min(x['remainingForNativeRelativeAndOtherMotionMM'] for x in pairs),
    maxLocalHangerNormal=max(abs(x['valueMM']) for x in all_results if x['circuit']=='lower' and x['component']=='normal')),indent=2))
