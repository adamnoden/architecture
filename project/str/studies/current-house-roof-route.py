"""The high roof closes through the actual ridge row, pitched primary pairs,
base ties and wall-head rings. Comparison only; no perfect rigid cap or
twelve extra horizontal compression braces assumed. Units kN, kNm, mm.
"""
from pathlib import Path
import json,math,sys,runpy,hashlib
D=Path(__file__).resolve().parent;p=runpy.run_path(str(D/'current-house-roof-bracing.py'))
w=p['w'];heel=p['heel'];S=w['sections'];cases=p['space'];gd=p['highD'];E=200000.;fy=200/1.1
def signed(cases,kind):
    return [q[0] for q in p['extrema'](cases,kind)]
def maxRidge(cases):
    peak={k:[0.,None] for k in ['moment','shear','normal','displacement','legBaseVertical']}
    def hi(k,n,where):
        if n>peak[k][0]:peak[k]=[n,where]
    for idx,ca in enumerate(cases):
        _,u,forces,_,_=ca;vertical,_=p['caseLoads'](ca)
        for point,n in vertical.items():hi('legBaseVertical',abs(n),[idx,point])
        for (kind,a,b),N in forces.items():
            if kind!='ridge':continue
            L=math.dist(a,b);xx=(b[0]-a[0])/L;yy=(b[1]-a[1])/L
            o=-yy*(u[gd(a,0)]-u[gd(b,0)])+xx*(u[gd(a,1)]-u[gd(b,1)])
            t1,t2=u[p['phiD'](a,b,0)],u[p['phiD'](a,b,1)]
            mm=[E*S['secondary']['Iminor']/L*(6*o/L+A*t1+B*t2)/1e6 for A,B in [(4,2),(2,4)]]
            mh=max(map(abs,mm));sh=abs(sum(mm))/(L/1000)
            # Purlin in ridge plane, vertical 150 deep to support both pitches.
            # Existing full signed gravity row and selfweight, no flange bracing credit.
            mg=(6.3*.55+1.35*S['secondary']['lineG'])*(L/1000)**2/8
            sig=mh*1e6/S['secondary']['Wminor']+mg*1e6/S['secondary']['W']+abs(N)*1000/S['secondary']['A']
            hi('moment',mh,[idx,a,b]);hi('shear',sh,[idx,a,b]);hi('normal',sig,[idx,a,b])
            hi('displacement',math.hypot(u[gd(a,0)],u[gd(a,1)]),[idx,a])
    return peak
peak=maxRidge(cases);assert peak['normal'][0]<fy
# Each side of the crown pin sees its real signed incremental upper-leg
# force; it is not assumed to pass a bending moment across the pin.
leg=max(map(abs,signed(cases,'leg')));radial=max(map(abs,signed(cases,'radial')))
pinDemand=math.hypot(60,70)+leg
def pin(d):
    vv=pinDemand*1000/(2*math.pi*d**2/4);m=pinDemand*1000*(24/2+2+16/2)/2
    return math.hypot(m/(math.pi*d**3/32),math.sqrt(3)*vv)
assert pin(40)>fy and pin(45)<fy
# Take both gravity-heel envelope and simultaneous extra planar force. The
# radial tie force runs from the cassette through the existing shoe/cheek
# into the two rails, not through the crown. The separate inclined leg force
# is carried in the primary. Charge every leg and tie at their own moment arm,
# even if the maxima are not simultaneous. Strengthen only the existing weld.
V=70+peak['legBaseVertical'][0];N=60+radial+leg;T=10.
leverM=60*.09+70*.07+radial*.11+leg*.20
cheekDemand=math.hypot((V/2+T/.14)/2+leverM/2/.16,(N/2+T/.14)/2)
# The previous two 80x7 throat segments comparison cannot be reused here.
aw=9;cheekR=2*80*aw*.1;assert cheekDemand<cheekR
a,b=160,180;footw=10;Af=2*footw*(a+b);Ix=footw*(a*b*b/2+b**3/6);Iy=footw*(b*a*a/2+a**3/6)
sg=V*1000/Af+T*1e6*(b/2)/Ix+leverM*1e6*(a/2)/Iy
sv=N*1000/Af+T*math.sin(math.radians(25))*1e6*math.hypot(a,b)/2/(Ix+Iy)
foot=math.hypot(sg,sv);assert foot<100
Fweb=V/2+T/.14+leverM/.16;skin=Fweb*1000*6/(160*20**2/6)
assert skin<fy and Fweb*1000/(2*160*8)<100
# Unbraced length is the real twin-rail length, majority of its gravity
# action is tension; combine the adverse compression separately in each bar.
rails=[]
for f in w['frames']:
    G=f['independentAdverse']['H'];Ncomp=max(0,-G[0]-signed(cases,'radial')[0]);Ntens=G[1]+signed(cases,'radial')[1]
    sec=w['individualTieRail'];L=f['axisSpanM']*1000;Pe=math.pi**2*E*sec['Iminor']/L**2/1000;nc=Ncomp/2
    M=nc*L/350/1000/(1-nc/Pe);sig=nc*1000/sec['A']+M*1e6/sec['Wminor']
    assert sig<fy and nc<Pe/2 and Ntens/2*1000/sec['A']<fy
    rails.append({'frame':f['id'],'wholeCompressionTension':[Ncomp,Ntens],'individualEuler':Pe,'individualCompressionVM':sig,'initialBowL350':L/350})
# Existing heel and ridge levels. The actual purlin sits above the crown
# axis: the 200 mm eccentricity is an explicit collector fitting load, not
# a proof that the input plane passes through a pair of intersecting tubes.
# Two longitudinal neighbours can contribute at each end of the corner.
ridgeN=max(map(abs,signed(cases,'ridge')));localF=2*math.hypot(ridgeN,peak['shear'][0])
seatM=localF*.200;couple=seatM/.240
# 160x240x16 plate plus two 180x200x12 webs. Positive four-lane saddle
# secured to ONE closed rafter half only, on the outer side of the actual
# pin; do not weld across the intentional hinge. No concealed bolt preload.
a0,b0=160,240;aw0=7;A0=2*aw0*(a0+b0)
Ix0=aw0*(a0*b0*b0/2+b0**3/6);Iy0=aw0*(b0*a0*a0/2+a0**3/6)
ws=math.hypot(couple*1000/A0+seatM*1e6*max(a0,b0)/2/min(Ix0,Iy0),localF*1000/A0)
assert ws<100
# Ridge purlin moment around a hip transfers web/flange forces through an
# end diaphragm. Count only the narrow separated vertical sides for yaw,
# two developed 100mm lines on each side at 7 throat and actual 72 arm.
rdF=peak['moment'][0]/.072+ridgeN/2
wr=2*100*7*.1;assert rdF<wr
saddleKg=(160*240*16+2*180*200*12+2*140*80*12)*7850/1e9
reserve=8.5/0.00981-12*saddleKg
assert reserve>0
out={'sources':{str(f.relative_to(D.parents[2])):hashlib.sha256(f.read_bytes()).hexdigest() for f in [D/'current-house-welded-network.json',D/'current-house-welded-heel.json',D/'current-house-membrane.py',D/'current-house-roof-bracing.py']},'role':'Existing purlin/primary/tie space frame instead of twelve additional plan CHS. Perforated finite first-floor membrane, fixed L bases and project wind hypotheses; no construction or site adoption.','coherentWindStates':len(cases),'referenceElevations':{'ringCentre':p['rr'],'rafterHeelCentre':p['zheel'],'rafterCrownCentre':p['zhigh'],'eave':heel['height']['eave'],'ridgeCover':heel['height']['ridge']},'comparison':{'bracedTubeLengthM':sum(math.dist(a,b) for a,b in p['braces'])/1000,'bracedTubeMassKg':p['tubeG']/0.00981,'roofDeflections':[max(math.hypot(u[p['dof'](loc,0)],u[p['dof'](loc,1)]) for _,u,*_ in ss for loc in p['nodes']) for ss in [p['actual'],p['control'],cases]],'comparisonRoles':['12 horizontal CHS and flat elevated couple','existing lower rings and ties, flat elevated couple','actual pitched legs/ridge row plus finite vertical rings on 22 springs40kN/mm']},'exactSpaceModel':'At ridge the continuous horizontal purlin carries axial force and finite weak-axis bending, with an unrestrained pin between the two pitched primary rafters. Existing radial twin rails at 6770, pitched legs at 6860, vertical/moment/roll flexibility of both real collector rings at6600. The roof pressure band above the ring is split between the ring and 12 crown nodes preserving its signed force, location and first moment. Each leg returns a vertical and a horizontal component to its own heel. Both N and N*x/y are conserved; independently re-solved 2D ring spring forces must match all 22 reactions to 0.001 kN in every wind programme. Actual cladding/purlin pressure transfer, upper-station stiffness, first-floor membrane and soil flexibility remain qualifications.','ridgeJointRotationalSpringNmmPerRad':p['jointSpring'],'ridgeJointMaterialComplianceMMPerN':p['sideCompliance'],'axialRanges':{k:signed(cases,k) for k in ['radial','leg','ridge','ring']},'ridge':peak,'weldedHeel':{'componentN_V_T':[N,V,T],'additionalLeverMoment':leverM,'two80mmStationSegmentsRequiredAt9':cheekDemand,'two80mmAt7Previous':112,'two80mmAt9Resistance':cheekR,'sole160x180Throat10Stress':foot,'maximumShoeToThroughWebOffset':6,'skinStressAt6':skin,'remaining':'Actual weld preparation, distortion/tolerance with 6 mm alignment budget, off-plane roof loads, section/fire/corrosion protection. The fitted webs must line up under both normal and 45 degree heels.'},'crown':{'maximumResultant':pinDemand,'40pinCombined':pin(40),'45pinCombined':pin(45),'outerHalfRidgeSaddleForce':localF,'saddleMomentAt200Ecc':seatM,'singleHalfPositive240Couple':couple,'nominalWeldStress':ws,'ridgeCornerFlangeForce':rdF,'twoDeveloped100x7WeldResistance':wr,'nominalSaddleGrossKgEach':saddleKg,'remaining8point5kNAllowanceKgAfter12Saddles':reserve,'remaining':'The purlin underside clears the existing clevis only after actual 3D end plate/diaphragm and roof-layer placement. Verify one-sided saddle, restraints and deflection of the 200 mm eccentric connection in both directions. A rigid weld through both opposing rafter halves would defeat the assumed crown hinge.'},'tieRailChecks':rails,'admitted':False}
dest=Path(__file__).with_suffix('.json');ss=json.dumps(out,indent=2,sort_keys=True)+'\n'
if __name__=='__main__':
    if '--check' in sys.argv:assert dest.read_text()==ss
    else:dest.write_text(ss)
print('Space roof ridge stress, 45 pin, leg/heel',peak['normal'][0],pin(45),leg,cheekDemand)
