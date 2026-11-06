"""All actual upper gravity plus signed ring effects on the first-floor edge.
Unit short-span influence, release of passive supports and court hold shift.
This is a lower-bound static topology, not compatibility of the opened gaps.
"""
from pathlib import Path
import json,math,runpy,sys
from itertools import pairwise
from collections import defaultdict
D=Path(__file__).resolve().parent;j=runpy.run_path(str(D/'current-house-joined-foundation.py'));W=j['W'];edge=j['edge']
events=j['edgeEvents'];wind=[]
for wi in range(len(j['plane']['actual'])):
    eventsW=[]
    for g in j['rings'].values():
        for r in j['windrows'](g,wi):
            p=tuple(r['xy']);eventsW.append((edge['wallat'](p),p,r['n']))
    wind.append(eventsW)
spans={};adj=defaultdict(list)
for w,(i,datum,lo,hi,us) in W.items():
    for a,b in pairwise(us):spans[w,a,b]={a,b}
def local(ev):
    by=defaultdict(dict)
    for w,p,n in ev:
        i,d,l,r,us=W[w];c=p[i]
        for a,b in pairwise(us):
            if a+1e-7<c<b-1e-7:
                k=(w,a,b);spans[k].add(c);v=by[k];v[c]=v.get(c,0)+n;break
    return by
loads=[(local(e),l,h) for e,l,h in events];winds=[local(e) for e in wind]
for src,l,h in loads:
    for k,rs in src.items():adj[k].append((rs,l,h))
for p,(t,s,_) in j['shifts'].items():
    w=edge['wallat'](t);i=W[w][0]
    for k,pts in spans.items():
        if k[0]==w:
            for v in [p[i],t[i],s[i]]:
                if k[1]<v<k[2]:pts.add(v)
def influence(rs,a,b,x):
    left=sum(n*(b-c)/(b-a) for c,n in rs.items())
    vl=left-sum(n for c,n in rs.items() if c<x);vr=vl-rs.get(x,0.)
    return [sum(n*(min(x-a,c-a)-(x-a)*(c-a)/(b-a))/1000 for c,n in rs.items()),vl,vr]
def release(n,a,b,t,x):
    return [n*(min(x-a,t-a)-(x-a)*(t-a)/(b-a))/1000,n*((b-t)/(b-a)-(t<x)),n*((b-t)/(b-a)-(t<=x))]
def add(lo,hi,rr,a,b):
    for i,n in enumerate(rr):lo[i]+=min(n*a,n*b);hi[i]+=max(n*a,n*b)
def row(k,x):
    w,a,b=k;i,d,lo,hi,us=W[w];L=[0.,0.,0.];U=L[:]
    for rs,l,h in adj[k]:add(L,U,influence(rs,a,b,x),l,h)
    vv=[influence(src[k],a,b,x) if k in src else [0.,0.,0.] for src in winds]
    for z in range(3):L[z]+=min([0]+[v[z] for v in vv]);U[z]+=max([0]+[v[z] for v in vv])
    # A passive stop may lift under negative force. Remove its tension and
    # carry it along the real signed edge between captive corner stations.
    for p in j['loPads']-j['caps']:
        if edge['wallat'](p)!=w:continue
        t=p[i];ends=j['ends'](p);aa,bb=sorted(q[i] for q,n in ends)
        if not aa<=x<=bb:continue
        # Before the projection into the two corners.
        nlo=j['rawAll'][p][0]
        add(L,U,release(1,aa,bb,t,x),min(0,nlo),0)
    # Negative corner reaction n is an upwards tip load on the continuation
    # to a hold at T and passive balance at S. In downward-positive load
    # convention, include n at old corner, -beta*n at T and
    # -(1-beta)*n at S; signed moment = -sum(F*(x-u)), for all F left.
    for p,(t,s,_) in j['shifts'].items():
        if edge['wallat'](t)!=w:continue
        coef=j['splitStop'](p)[0][1];pp=[(p[i],1),(t[i],-coef),(s[i],coef-1)]
        m=-sum((x-u)*f/1000 for u,f in pp if u<x)
        v1=-sum(f for u,f in pp if u<x);v2=-sum(f for u,f in pp if u<=x)
        add(L,U,[m,v1,v2],min(j['cornerRaw'][p][0],0),0)
    return [L[0],U[0],min(L[1:]),max(U[1:])]
rows=[]
for k,pts in spans.items():
    allv=[(x,row(k,x)) for x in sorted(pts)];rr=[min(v[0] for x,v in allv),max(v[1] for x,v in allv),min(v[2] for x,v in allv),max(v[3] for x,v in allv)]
    gov=[next(x for x,v in allv if abs(v[n]-m)<1e-7) for n,m in enumerate(rr)]
    rows.append({'face':k[0],'span':[k[1],k[2]],'MminMax_VminMax':rr,'criticalStations':gov})
M=max(abs(v) for r in rows for v in r['MminMax_VminMax'][:2]);V=max(abs(v) for r in rows for v in r['MminMax_VminMax'][2:])
print('Full upper-edge signed M/V',M,V,'critical',[(r['face'],r['span']) for r in rows if any(abs(abs(v)-M)<1e-7 for v in r['MminMax_VminMax'][:2])])
o={'role':'Actual shifted roof, retained upper wall and floor loads. Every point-load or bearing position is a section: signed maxima exact for the declared piecewise-linear moment / piecewise-constant shear fields. Independent component envelopes can overestimate simultaneous demand. Route compatibility and local rods/curved arches remain separate.','extremeMomentShear':[M,V],'spans':rows}
# Deliberately keep the upper-only rod's clear central lane: 140-wide core,
# H12 in pairs at each level. Increase only the outer loop, below its sills.
# Both cage orientation and beam end development still require the complete
# 3-D joint. Extra concrete REPLACES the existing gross upper solid core
# already counted at 25 kN/m3. The upper G bound is not a minimum stabiliser.
cages={};msteel=0;grossVol=0
for loop,h,nrow,length in [('outer',750,4,4*(j['B']-j['A'])/1000),('court',650,3,4*(j['E']-j['C'])/1000)]:
    ss=edge['rectRC'](140,h,35,12,nrow,2)
    z=.9*ss['d'];vlinks=2*math.pi*8**2/4/100*z*500/1.15*1.5/1000
    vstrut=140*z*(.6*(1-30/250))*(.85*30/1.5)/(1.5+1/1.5)/1000
    mm=max(abs(v) for r in rows if r['face'].startswith(loop) for v in r['MminMax_VminMax'][:2])
    vv=max(abs(v) for r in rows if r['face'].startswith(loop) for v in r['MminMax_VminMax'][2:])
    # 5 mm adverse cover/depth each side; no compression steel or slab flange.
    rr=edge['rectRC'](140,h-5,40,12,nrow,2);zlo=.9*rr['d']
    assert mm<rr['MR'] and rr['xOverD']<.45 and vv<min(vlinks,vstrut)*zlo/z
    ln=2*(140-2*(35+4)+h-2*(35+4))*.001+.16
    kg=4*nrow*math.pi*.012**2/4*7850*length+math.ceil(length/.1)*ln*math.pi*.008**2/4*7850
    msteel+=kg;grossVol+=.14*h/1000*length
    cages[loop]={'coreWidthDepth':[140,h],'topBottomZ':[3170+h,3170],'heightAboveFFL':3170+h-3450,'minimumRawSillReserve':min(e['sill'] for e in edge['H']['openings']['FIRST'] if e['wall'].startswith(loop))-(3170+h-3450),'reinforcement':f'{nrow*2} H12 each face, pairs in {nrow} levels 25 clear; H8 closed at100','nominalSection':ss,'adverseSection':rr,'shearResistanceAtAdverseD':min(vlinks,vstrut)*zlo/z,'momentShearDemand':[mm,vv],'unlappedCageSteelKg':kg,'abovePrevious650ConcreteM3':.14*(h-650)/1000*length}
assert msteel<1250
o.update({'old650SixH12OuterMR':edge['actual']['MR'],'old650OuterRejected':M>edge['actual']['MR'],'newLoops':cages,'nominalGrossReinforcementBothKg':msteel,'includedWholeLedgerSteelBudgetKg':1250,'grossConcreteM3':grossVol,'interpretation':'The physically retained pressure/floor state is much lighter than the earlier maximum G budget. No partial removal global dead-weight exemption is needed for these components: these sections include even the broader independent 0-G residual release. The floor footprint/soffit and jamb width stay put. Upper opposing 25 mm clear row gaps and the old 30 mm centre lane use nominal cover; a 5 mm inward shift each side erodes that lane to 20 mm, so rod installation still needs separately controlled cage/rod positioning. Section bending is not a fitting clearance proof.'})
out=Path(__file__).with_suffix('.json');s=json.dumps(o,sort_keys=True,indent=2)+'\n'
if '--check' in sys.argv:assert out.read_text()==s
else:out.write_text(s)
