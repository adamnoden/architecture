"""Incremental roof reactions for the identified severe Capital/Sarket prototype."""
import math
from itertools import pairwise

SOURCE={'PR':1438,'commit':'53c6ad32f3acddc43461b2b4309876ebef9038a0',
        'resultBlob':'28afcd1cd63aa4d17cd8dfeb433dba1885b92478',
        'path':'project/mat/studies/ring-roof-family.json'}
CAP=8645.327095641296
def origins(p,solver):
    # Published component masses include laps. Unlike a uniform addition to
    # the roof field, this preserves each ridge line and diagonal's geometry.
    cheeks=1039.9396852791033;roll=215.52960000000002
    hip=157.6540346603396;valley=204.45232680506578;blanks=88.17120000000001
    g=[0.]*p['spaceSize'];strip=g[:];placed=[]
    A,C=p['A'],p['C']; mid=(A+C)/2
    def weight(tag,point,kg,on_crown):
        point=tuple(point)
        k=p['highD'](point,2) if on_crown else p['vDO'](point,0)
        g[k]+=(-1 if on_crown else 1)*kg*9.81
        placed.append((tag,point,kg))
    for face in range(4):
        cuts=[mid,4700,7300,12000-mid]
        for a,b in pairwise(cuts):
            kg=(b-a)/31000*(cheeks+roll)
            for x in (a,b):weight('cheeks and roll',p['pt'](face,mid,x),kg/2,True)
        peak=p['pt'](face,mid,mid)
        for label,mass,edge,tip in [('outer hip',hip,A,-200),('court valley',valley,C,4525)]:
            # One diagonal from the true eave to ridge, including the eave
            # cantilever beyond the structural heel. Conserve both plan moments.
            t=((tip+mid)/2-mid)/(edge-mid)
            heel=p['pt'](face,edge,edge)
            weight(label,heel,mass*t/4,False);weight(label,peak,mass*(1-t)/4,True)
            weight('terminal blank',heel,blanks/12,False)
        weight('corner saddle blank',peak,blanks/12,True)
        # Extra 75 mm overhang: one quarter of the square annulus, applied
        # upwards on the existing court wall-head ring with its true overhang
        # moment. Integrate linear tributary widths at three Gauss stations.
        for q,w in [(4487.5-37.5*math.sqrt(.6),5/9),(4487.5,8/9),(4487.5+37.5*math.sqrt(.6),5/9)]:
            ring=p['sides'][face,'inner']
            cuts=sorted({q,12000-q,*(x for x in ring if q<x<12000-q)})
            for lo,hi in pairwise(cuts):
                station=(lo+hi)/2;F=-2.25*(hi-lo)*37.5*w/1000
                a,b=next((a,b) for a,b in pairwise(ring) if a<=station<=b)
                t=(station-a)/(b-a)
                for x,v in ((a,1-t),(b,t)):
                    pt=p['pt'](face,C,x);source=p['pt'](face,q,x)
                    strip[p['vDO'](pt,0)]+=F*v
                    for j in (0,1):strip[p['vDO'](pt,1+j)]+=F*v*(source[j]-pt[j])
    def reactions(vectors):
        d=solver(vectors)
        R={pt:40*d[p['vDO'](pt,0)] for pt in p['upperSupports']}
        return d,R
    d_lead,Rg=reactions(g);d_strip,Ru=reactions(strip)
    kg=sum(m for _,_,m in placed);n=sum(Rg.values());u=sum(Ru.values())
    assert abs(kg-(cheeks+roll+hip+valley+blanks))<1e-6
    assert abs(n-kg*.00981)<1e-6 and abs(u+2.25*.9075)<1e-6
    # Symmetric stock/support locations. This vertically loaded roof can also
    # deliver balancing horizontal thrust through its four lateral returns.
    for j in (0,1):
        assert abs(sum(m*(pt[j]-6000) for _,pt,m in placed))<.0001
        assert abs(sum(v*(pt[j]-6000) for pt,v in Rg.items()))<.001
        assert abs(sum(v*(pt[j]-6000) for pt,v in Ru.items()))<.001
    return d_lead,d_strip,{'source':SOURCE,'fieldEaveRidgeAndCapZ':[7418.423322641297,8409.327095641296,CAP],
        'unselectedPrecursorCapZ':8464.73365326618,'slateMassKg':5215.049429076929,
        'severeCapitalAverageResidualKgPerM2':9.500704941628587,'fullLeadMassKg':kg,
        'leadKgPerM':{'ridge':(cheeks+roll)/31,'valley':valley/(4*3.573859358261183)},
        'sourceWeightsKg':{'cheeks':cheeks,'roll':roll,'outerHips':hip,'valleys':valley,'blanks':blanks},
        'leadGkKN':n,'slateExtraCourtPlanM2':.9075,'extraStrippedUpliftKN':u,
        'roofSupportOriginOrder':['lead Gk kN','additional uniform suction kN'],
        'roofSupportOrigins':{','.join(map(str,pt)):[round(Rg[pt],5),round(Ru[pt],5)] for pt in sorted(Rg)}}
