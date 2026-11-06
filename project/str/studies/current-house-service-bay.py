"""Suspended rare-access bay, independent of the tube sled.
Three formed sides and a floor. No pile capacity or soil contact is inferred.
Positive downward vertical reactions; downward N at x gives Cx=N*(x-xHead).
"""
from pathlib import Path
import json,math,sys,hashlib
D=Path(__file__).resolve().parent
def read(n):return json.loads((D/n).read_text())
grid=read('current-house-grid.json');nodes=read('current-house-nodes.json')['nodes'][0]['nodes']
assert [r['axis'] for r in nodes]==[[7950,6100],[7950,7700]]
floor=[5945,6070,7650,7580,-1340,-1200]
walls=[[5945,6070,7650,6250,-1200,0],[5945,7400,7650,7580,-1200,0],[5945,6250,6125,7400,-1200,0]]
bx=[6125,6250,7650,7400];X=7650;ys=[6160,7490];L=1.33
for w,n in zip(walls,nodes):
    x,y,b,h=n['plan'];assert x==X and y<=w[1] and w[3]<=y+h and n['z']==[-750,-180]
def vol(r):return (r[2]-r[0])*(r[3]-r[1])*(r[5]-r[4])/1e9
concrete=sum(map(vol,[floor,*walls]));G=concrete*25
fy=500/1.15;fc=.85*30/1.5;E=33000
# 140 +/-5 suspended slab, one central pair of orthogonal H10/100 bars,
# north-south flexural bars above cross bars, common nominal midplane +/-5,
# allow an extra 3 mm placing error. Symmetric resistance both load senses.
def section(b,d,As):
    xx=As*fy/(.8*b*fc);mr=As*fy*(d-.4*xx)/1e6
    v=.12*min(2,1+math.sqrt(200/d))*(100*min(.02,As/(b*d))*30)**(1/3)*b*d/1000
    return mr,v
b=200;d=135/2-5-3;As=math.pi*10**2/4*(b/100);mr,vr=section(b,d,As)
gSl=.145*25+.5;qp=5;qa=5;wup=9.81*1.34
Mu=(1.35*gSl+1.5*qa)*b/1000*L*L/8+1.5*qp*L/4
Vu=(1.35*gSl+1.5*qa)*b/1000*L/2+1.5*qp
mUp=1.5*wup*b/1000*L**2/8
# No artificial effective width beyond the actual 200 mm equipment pad.
# A bare point, smaller foot or wheel is not qualified by this comparison.
# For bending, full point at midspan bounds the actual distributed print.
assert Mu<mr and Vu<vr and mUp<mr,(Mu,mr,Vu,vr,mUp)
# Support reaction fully checked at each formed cheek, both signs: the
# central bars terminate in a 180 wall with a 90-degree bend and a 300
# vertical leg, not a 90 mm plain bar stub. Charge poor bond, actual V*d.
tsteel=1.25*Vu*1000/As
ld=10*tsteel/(4*2.1);assert ld<300
# Face cross-loading as a one-side asymmetric hydrostatic action to datum 0.
# Deck/closed vessel pressure is not a soil surcharge. A dry 500 mm void
# exists below the slab only if local ground is at or below -1840.
# Compare one-side water against one metre of vertical wall strip; use a
# separate, deliberately adverse retained-earth/surcharge comparison.
hw=1.34;MwH=1.5*9.81*hw**3/6;FwH=1.5*9.81*hw**2/2
MrWall,VrWall=section(1000,180-50-10-6,math.pi*12**2/4*1000/125)
MwSoil=1.5*(10*hw**2/2+30*hw**3/6)
wallLen=1.705;lever=wallLen/2
# Isolate each cheek in plan with no help from a closed east wall. Apply
# one-sided water over its full length through the head. No soil reaction.
Hface=FwH*wallLen;Mplan=Hface*lever
# The 570 node-depth intersects only six interrupted horizontal wall bars
# at most. Positively reserve four H16 each face throughout that neck, plus
# two vertical flexural chords each of 2H16 near its top/bottom. Test the
# same bars under combined in-plane and out-of-plane bending, taking 100%
# vertical chord force IN ADDITION to the four-bar plan-bending requirement.
arm=.376;planZ=.105
# Conservatively put all fixed equipment and crew at west outside face,
# and allow all live load onto one cheek for the chord/anchor comparison.
Pcrew=5;Aclear=(bx[2]-bx[0])*(bx[3]-bx[1])/1e6
# Exact gravity/first moments from volume centroids: opposing first moments
# and the two wall reactions enter actual P36/P37, not an imaginary floor post.
def centroid(r):return [(r[0]+r[2])/2,(r[1]+r[3])/2]
per=[{'N':0.,'Cx':0.,'Cy':0.} for _ in nodes]
# 0.5 kPa floor finish and 1.5 kN/m3 added reinforcement/fitment allowance.
# Upper bound can include gross concrete at 25 plus embedded reinforcing.
sources=[('fixed',26.5*vol(r),centroid(r)) for r in [floor,*walls]]
sources.append(('finish',.5*Aclear,centroid(bx)))
sourceN=sum(n for _,n,_ in sources);sourceMx=sum(n*p[0]/1000 for _,n,p in sources)
for _,n,p in sources:
    f=(p[1]-ys[0])/(ys[1]-ys[0])
    for i,t in enumerate([1-f,f]):
        hd=nodes[i]['axis'];z=per[i];z['N']+=n*t;z['Cx']+=n*t*(p[0]-hd[0])/1000;z['Cy']+=n*t*(ys[i]-hd[1])/1000
assert abs(sum(z['N'] for z in per)-sourceN)<1e-8
assert abs(sum(z['N']*nodes[i]['axis'][0]/1000+z['Cx'] for i,z in enumerate(per))-sourceMx)<1e-8
Mvert=1.35*max(abs(z['Cx'])-.300*z['N'] for z in per)+1.5*(qa*Aclear*wallLen/2+Pcrew*wallLen)
Vvert=1.35*max(z['N'] for z in per)+1.5*(qa*Aclear+Pcrew)
# Sustained water under ENTIRE base, no deduction of G for uplift design.
Qhyd=9.81*hw*(floor[2]-floor[0])*(floor[3]-floor[1])/1e6
MuHyd=1.5*Qhyd*lever/2
Mvert=max(Mvert,MuHyd);Vvert=max(Vvert,1.5*Qhyd/2)
As16=math.pi*16**2/4
Tvert=Mvert/arm;Tplan=Mplan/planZ
# Two bars share the chord; four share wall-plan bending within 570 high
# actual joint. All eight wall/neck horizontals placed in four levels.
singleCheekBarT=Tvert/2+Tplan/4
# The whole intact floor carries horizontal shear as a cantilever diaphragm.
# Opposite east-west chords at the cheek centrelines form the plan couple.
# Differential elevation of side water and the node produces a roll couple.
# All four flexural chord bars are real: two at each of two nearby levels.
planChord=Mplan/L;rollCouple=Hface*abs(-2*hw/3+.465)/L
Tvert+=rollCouple*wallLen/arm
barT=Tvert/4+planChord/4;barSig=barT*1000/As16;need=16*barSig/(4*2.1)
# Straight bar toward east cannot assume a clear path THROUGH vertical pile
# starters. Report both gross node anchorage and next potential collision.
embedded=600-50;grossBond=math.pi*16*embedded*2.1/1000
starterFirst=300-200 # guaranteed shaft envelope begins 100 from face
assert MwH<MrWall and FwH<VrWall and barSig<fy and need<embedded,(barSig,need)
assert singleCheekBarT*1000/As16>fy
webV=Hface*1000/(135*1330);matR=As16*fy/1000
assert webV<.5 and planChord<2*matR
# Explicit eight vertical starter positions: section lanes only, bent cage
# paths still open. Min radial clearance to these straight lines in plan.
barLanes=[[y-32,y+32] for y in ys]
clearToStarter=min(abs(l-(n['axis'][1]+141*math.sin(math.radians(22.5+i*45))))-19 for nn,n in enumerate(nodes) for l in barLanes[nn] for i in range(8))
# Horizontal base shear from one wet long side is transferred positively
# across the existing concrete nose by roughened/keyed cast interfaces.
# No unknown friction credited: charge two integral shear keys on a cheek.
keyA=2*80*100;keyP=math.hypot(Vvert,Hface)*1000/keyA
assert keyP<.85*fc
out={'status':'Finite suspended RC work-bay comparator only; ground, water, cage and access not selected.','sourceGrid':hashlib.sha256((D/'current-house-grid.json').read_bytes()).hexdigest(),'sourceNode':hashlib.sha256((D/'current-house-nodes.json').read_bytes()).hexdigest(),'clearInsideXY':bx,'floorXYZ':floor,'threeWallXYZ':walls,'concreteM3':concrete,'RCGrossKN':G,'fixedIncludingAllowanceKN':sourceN,'floorTopUnderside':[-1200,-1340],'conditionalGradeFor500AirGap':-1840,'incrementAgainstD1800':40,'floodDesign':'One side, external/internal hydrostatic water to Z0; separate full underside pressure without G. No retaining earth, surcharge, groundwater/site acceptance or waterproofing. Do not backfill a suspended pit designed for air.','floor':{'centralBars':'H10/100 each way, positive 300 mm bent ends and 40 mm internal mandrel diameter; central slab mats, not four face layers. Smaller equipment footprint, bent cage, crack/water and service floor finish/level/drain remain open.','minimumEffectiveDepth':d,'referenceLoadedPrint':[200,200],'pointKN':qp,'floorLiveKPa':qa,'M_V': [Mu,Vu],'MR_VR':[mr,vr],'upwardM':mUp,'endDevelopmentNeededAvailable':[ld,300]},'cheeks':{'waterFaceMoment_Shear':[MwH,FwH],'wallMR_VR':[MrWall,VrWall],'earthControlWallMomentOnly':MwSoil,'hydroOneSide_H_Mplan':[Hface,Mplan],'fullUnderbaseCharacteristicKN':Qhyd,'wallNeckV_M':[Vvert,Mvert],'retiredSingleCheekMaximumBarKN':singleCheekBarT,'wholeFloorDiaphragmChordKN':planChord,'rollVerticalCoupleKN':rollCouple,'membraneGrossShearMPa':webV,'floorPlanWidthMM':1330,'jointChordAndPlanT':[Tvert,planChord],'fourH16EachFaceSharedMaximumBarKN':barT,'worstBarStress':barSig,'developmentGrossRequiredAvailable':[need,embedded],'firstUnresolvedPileStarterEnvelope':starterFirst,'positiveKeyTwo80x100NominalPressure':keyP,'horizontalBarLevels':[-252,-302,-628,-678],'barYLanes':barLanes,'nominalMinimumClearToVerticalPileBars':clearToStarter,'qualifications':'In plan, existing 140 mm base must act as the full 1.33 m wide diaphragm: east-west opposite wall chords and transverse shear at both nodes, including lower-to-upper force turn. A single 180 mm wall as an isolated sideways cantilever FAILS. Four H16 levels in 180 wall, two bars each level; minimum calculated starter clearance is less than 25 mm, so no anchored joint pass. Neck gross length is not clear development past the earlier cage. Need actual eight bar lanes, return into west box, hydrostatic uplift/anchorage, crack, differential movement and watertight construction; no buried seal or substitute rail support credited.'},'receivingHeads':[{**z,'at':nodes[i]['axis'],'support':next(h['id'] for h in grid['heads'] if h['xy']==nodes[i]['axis'])} for i,z in enumerate(per)],'crewVariableDistribution':'Global upper live total 5 kPa ×1.75375 m² plus 5 kN. Concentrate mobile 5 kN on the actual 200 mm pad; for connection envelope, all live load may reach one cheek at full west lever. Carrier rails are outside this slab; no 200 kg sled load applied.','admitted':False}
dest=Path(__file__).with_suffix('.json');s=json.dumps(out,indent=2,sort_keys=True)+'\n'
if '--check' in sys.argv:assert dest.read_text()==s
else:dest.write_text(s)
print('Bay floor M / MR; V / VR',Mu,mr,Vu,vr,'neck bond gross',need,embedded,'concrete',concrete)
