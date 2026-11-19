"""Compare actual service curvature with the old constant-peak-M bound.
Straight Euler rafters have a common translational ridge hinge, independent
rotations, full cantilever tails and a real tie 90 mm below the heel centre.
Add the current 3D one-sided saddle wind's actual vertical flexural shape.
"""
from pathlib import Path
import json,math,runpy,sys
from collections import defaultdict
D=Path(__file__).resolve().parent;p=runpy.run_path(str(D/'current-house-roof-bracing.py'));w=p['w'];S=w['sections'];E=200000;dT=90
def H(t,L):return [1-3*t*t+2*t**3,L*(t-2*t*t+t**3),3*t*t-2*t**3,L*(-t*t+t**3)]
def shape(frame):
    id=frame['id'];hip=id=='hip';mult=math.sqrt(2) if hip else 1.;L=frame['axisSpanM']*1000;mid=L/2;sl=math.tan(math.radians(25))/mult
    fs=defaultdict(float)
    for r in frame['rows']:
        x=r['x']*1000;fs[x]+=r['area']*(1.5/math.cos(math.radians(25))+1.5)+r['area']/r['rowWidth']*S['secondary']['lineG']
    fs[mid]+=.5
    lo=-532.5*mult;hi=L+532.5*mult
    pts=sorted({round(x,7) for x in [lo,hi,0,mid,L,*fs]});c=min(pts,key=lambda x:abs(mid-x));mid=c
    out=min(pts,key=lambda x:abs(L-x));ind={x:k for k,x in enumerate(pts)}
    n=3*len(pts)+1;KK=[[0.]*n for _ in range(n)];rhs=[0.]*n;els=[]
    def rot(x,s):return n-1 if x==mid and s>mid else 3*ind[x]+2
    for a,b in zip(pts,pts[1:]):
        left=(a+b)/2<mid;s=sl if left else -sl;le=(b-a)*math.sqrt(1+s*s);cx=1/math.sqrt(1+s*s);cz=s*cx
        uv=lambda x:[(3*ind[x],cx),(3*ind[x]+1,cz)]
        vv=lambda x:[(3*ind[x],-cz),(3*ind[x]+1,cx)]
        d=[vv(a),[(rot(a,b),1)],vv(b),[(rot(b,a),1)]]
        mm=[[12,6*le,-12,6*le],[6*le,4*le**2,-6*le,2*le**2],[-12,-6*le,12,-6*le],[6*le,2*le**2,-6*le,4*le**2]]
        p['insert'](KK,d,[[x*E*S['primary']['I']/le**3 for x in row] for row in mm]);p['add'](KK,[(k,-f) for k,f in uv(a)]+uv(b),E*S['primary']['A']/le)
        # Exact consistent loads for the actual inclined uniform steel dead load.
        wg=-S['primary']['lineG'];q=wg*cx
        for v,z in zip(d,[q*le/2,q*le*le/12,q*le/2,-q*le*le/12]):
            for k,cf in v:rhs[k]+=cf*z
        for x in [a,b]:
            for k,cf in uv(x):rhs[k]+=cf*wg*cz*le/2
        els.append((a,b,le,cx,cz,d))
    p['add'](KK,[(3*ind[0.],-1),(rot(0.,1),-dT),(3*ind[out],1),(rot(out,0),dT)],E*S['tie']['A']/L)
    for x,f in fs.items():rhs[3*ind[min(pts,key=lambda y:abs(y-x))]+1]-=1000*f
    fix={3*ind[0.],3*ind[0.]+1,3*ind[out]+1};free=[i for i in range(n) if i not in fix]
    u=[0.]*n
    for k,v in zip(free,p['fac']([[KK[i][j] for j in free] for i in free])([rhs[i] for i in free])):u[k]=v
    def at(x):
        a,b,le,cx,cz,d=next(e for e in els if e[0]-1e-6<=x<=e[1]+1e-6);t=(x-a)/(b-a);uv=lambda v:cx*u[3*ind[v]]+cz*u[3*ind[v]+1]
        uu=(1-t)*uv(a)+t*uv(b);ww=sum(q*sum(u[k]*f for k,f in r) for q,r in zip(H(t,le),d))
        # Exact missing particular quartic of uniform transverse load between ends.
        ww+=-S['primary']['lineG']*cx*le**4*t*t*(1-t)**2/(24*E*S['primary']['I'])
        return uu*cz+ww*cx
    reac=[sum(KK[i][j]*u[j] for j in range(n))-rhs[i] for i in range(n)]
    assert max(abs(reac[i]) for i in free)<.003
    assert abs(reac[3*ind[0.]+1]+reac[3*ind[out]+1]+sum(rhs[3*k+1] for k in range(len(pts))))<.003
    assert abs(reac[3*ind[out]+1]*out+sum(x*rhs[3*ind[x]+1]+rhs[3*ind[x]+2] for x in pts)+rhs[-1])<10
    # Midspan relative to its two actual eave bearings, not initial pitched height.
    return at,L
def delta(u,base,inner,q,t):
    z0=-u[p['vDO'](base,0)];z1=u[p['highD'](q,2)];z2=-u[p['vDO'](inner,0)]
    if t<=.5:
        hh=2*t;baseline=(1-hh)*z0+hh*z1
        mode,dm,mat=next(e for e in p['outerTerms'][base,q] if e[0]=='strong')
        le=math.sqrt(math.dist(base,q)**2+(p['zhigh']-p['zheel'])**2);local=[sum(u[k]*v for k,v in d) for d in dm]
        extra=sum(f*x for f,x in zip(H(hh,le),local))-((1-hh)*local[0]+hh*local[2])
        baseline+=extra*math.dist(base,q)/le
    else:
        hh=2*t-1;baseline=(1-hh)*z1+hh*z2
    return baseline-((1-t)*z0+t*z2)
rows=[]
for f in w['frames']:
    at,L=shape(f);ts=[v/80 for v in range(81)];g=[at(t*L) for t in ts];wi=combo=0.;peak=None
    for q,(b,i) in p['crowns'].items():
        hip=b[0]!=i[0] and b[1]!=i[1]
        if hip!=(f['id']=='hip'):continue
        for idx,case in enumerate(p['space']):
            for j,t in enumerate(ts):
                ww=delta(case[1],b,i,q,t)/1.5
                wi=max(wi,abs(ww))
                if abs(g[j]+ww)>combo:combo=abs(g[j]+ww);peak=[idx,b,q,t]
    rows.append({'frame':f['id'],'previousPeakCurvaturePlusOffset':p['heel']['node'][f['id']]['deflectionWithTieOffset'],'actualUniformGplusQPeak':max(map(abs,g)),'windServiceVerticalRelativeToHeelChord':wi,'coherentUniformGplusQplusFullWindSLS':combo,'L250':f['strutL250'],'governs':peak,'sampleMarginMM':.10})
    bound=rows[-1]['previousPeakCurvaturePlusOffset']+wi+.10
    rows[-1]['priorIndependentPatternPlusFullWindAndSampleReserve']=bound
    assert max(combo+.10,bound)<f['strutL250'],rows[-1]
out={'role':'Service comparison, not final roof guarantee. Uses actual full uniform row G + Q simultaneously with full 2.25/1.5 wind in each actual 3D state, without favourable combination factors. Separately retain previous independent variable row-pattern gravity-only component bounds. Frame deflections relative to the chord through both heels; finite vertical ring settlements / total cover fall must be checked separately. Primary pin and purlin roof-layer actual clearance, differential construction, site actions and vibration remain open.','frames':rows,'admitted':False}
dest=Path(__file__).with_suffix('.json');s=json.dumps(out,indent=2,sort_keys=True)+'\n'
if '--check' in sys.argv:assert dest.read_text()==s
else:dest.write_text(s)
print('Service G/Q + wind, mm',[(z['frame'],z['coherentUniformGplusQplusFullWindSLS'],z['L250']) for z in rows])
