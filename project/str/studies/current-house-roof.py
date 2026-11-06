#!/usr/bin/env python3
"""Finite roof-member/collector candidate. Explicit height rewind; selected HAD remains unchanged."""
from pathlib import Path
import hashlib,json,math,sys
R=Path(__file__).resolve().parents[3]
P=R/'project/had/studies/water-replan.json';raw=P.read_bytes();assert hashlib.sha256(raw).hexdigest()=='547a0a5515878fd522ceb108c57c37b8aad29f5d2efe33848d93cedd89d65ad4'
h=json.loads(raw)['model'];LP=R/'project/str/studies/open-loggia-support.json';lr=LP.read_bytes();a=json.loads(lr)['actual_roof']
# Fabricated, sharp-corner closed boxes: computed section properties are a
# PROJECT fabrication reference, not rounded commercial RHS properties.
fy=200/1.1;E=200000;rho=78.5

def box(H,B,t):
 area=B*H-(B-2*t)*(H-2*t);I=(B*H**3-(B-2*t)*(H-2*t)**3)/12
 J=(H*B**3-(H-2*t)*(B-2*t)**3)/12;Ak=(B-t)*(H-t)
 return {'H':H,'B':B,'t':t,'A':area,'Imajor':I,'Iminor':J,'Wmajor':2*I/H,'Wminor':2*J/B,'Ak':Ak,'MRmajor':2*I/H*fy/1e6,'MRminor':2*J/B*fy/1e6,'TR':2*Ak*t*(fy/math.sqrt(3))/1e6,'kgPerM':area/1e6*7850}
primary=box(250,150,12);purlin=box(150,80,8)
q=1.35*a['loads']['Gmax']+1.5*a['loads']['Q']; qs=a['loads']['Gmax']+a['loads']['Q'];qu=-2.25
pitch=math.radians(h['roofDevelopment']['pitch']); c=math.cos(pitch)
# The longest corner secondary member runs from the diagonal hip to the
# adjacent ordinary primary, rather than inheriting the central3245 span.
outer=-h['roofDevelopment']['overhang'];frame=a['north_frames_x'][0]
L=(frame-outer)/1000;spacing=.55;inclined=L/c
w=q*spacing;ws=qs*spacing
M=w*L*L/8;delta=5*ws*(L*1000)**4/(384*E*purlin['Imajor'])
# Resolve vertical load into BOTH local section axes; no fictitious zero minor bending.
major=M*c;minor=M*math.sin(pitch);util=major/purlin['MRmajor']+minor/purlin['MRminor']
assert util<1 and delta<L*1000/250
# All loads from an entire central strip plus BOTH adjacent corners are placed
# on EACH ordinary frame as a conservative local envelope. This deliberately
# overcounts sharing and must NEVER be summed as building weight.
central=a['regions'][0]['plan_area'];corner=a['regions'][4]['plan_area'];localArea=central+2*corner
scale=localArea/central # old ordinary reference includes half central strip
# Old ordinary frame owns half central strip, hence additional factor2.
scale*=2
rows=[]
for name,base in [('ordinary',a['cases']['ULS-down']['ordinary_frame']),('hip',a['cases']['ULS-down']['corner_action_envelope'])]:
 mult=scale if name=='ordinary' else 1
 N=base['max_compression']*mult;moment=base['max_abs_M']*mult
 # No Euler restraint from unknown purlin cleats: conservatively full5.1m member.
 Lcr=5100;Ncr=math.pi**2*E*primary['Iminor']/Lcr**2/1000
 # Deliberately low buckling resistance0.3 times yield, also below Euler.
 Nb=min(.3*primary['A']*fy/1000,.5*Ncr)
 combined=N/Nb+moment/primary['MRmajor']
 # Finite side cleats carry vertical bearing at <=75 eccentricity, NOT
 # cantilever-jack root moments. Entire local frame load is an adverse torsion bound.
 vertical=q*(localArea if name=='ordinary' else corner)
 torsion=vertical*.075
 torsionCombined=combined+torsion/primary['TR']
 assert torsionCombined<1, (name,N,Nb,moment,primary['MRmajor'],torsion,primary['TR'],torsionCombined)
 rows.append({'id':name,'localAreaBound':localArea if name=='ordinary' else corner,'N':N,'M':moment,'T':torsion,'NbDeclared':Nb,'Ncr':Ncr,'combinedLinearScreen':torsionCombined,'endDownBound':vertical/2,'endUpliftBound':abs(qu)*(localArea if name=='ordinary' else corner)/2})
# Core-width RC roof ring, actual upper window width1000 and300 end seats.
# P200 includes the larger local primary end reaction. No masonry-arch thrust
# is credited as a hold-down or lateral restraint.
b=140;H=400;cover=25;link=8;dia=20;As=2*math.pi*dia**2/4;d=H-cover-link-dia/2;fyd=500/1.15;fcd=.85*30/1.5
x=As*fyd/(.8*b*fcd);MR=As*fyd*(d-.4*x)/1e6
span=1.3;point=200;selfG=b*H/1e6*25
Mc=point*span/4+1.35*selfG*span**2/8;Vc=point/2+1.35*selfG*span/2
VRs=2*math.pi*8**2/4/75*.9*d*fyd/1000
assert Mc<MR and x/d<.45 and Vc<VRs
assert max(r['endDownBound']for r in rows)<point
# Actual gross member occupies current140core, with no extra floor area.
# Bottom6540 stays25 above the existing upper masonry-ring extrados6515.
ringBottom=6540;ringTop=ringBottom+H;plate=12;grout=10
newPrimaryBottom=ringTop+plate+grout
oldPrimaryBottom=6702.5859723120175
heightRise=newPrimaryBottom-oldPrimaryBottom+(250-80)/c
newEave=h['roofDevelopment']['eavesDatum']+heightRise
oldRidge=a['ridge'];newRidge=oldRidge+heightRise
# Project corner connection: same-centreline purlins bear on side cleats.
# Two M16 shear bolts +100x100x12seat per end, no vertical depth stacking.
endReaction=w*L/2;boltShear=2*157*100/1000
seatStress=endReaction*.04*1e6/(100*12**2/6)
assert endReaction<boltShear and seatStress<fy
# Explicit upper-bound member lengths, including secondary overrun allowance.
ordinaryLength=8*2*math.sqrt(2.325**2+(2.325*math.tan(pitch))**2)
hipLength=4*2*math.sqrt((2.325*math.sqrt(2))**2+(2.325*math.tan(pitch))**2)
secondaryLength=350
tieSection=box(150,100,8);tieLength=8*4.65+4*4.65*math.sqrt(2)
steelG=((ordinaryLength+hipLength)*primary['kgPerM']+secondaryLength*purlin['kgPerM']+tieLength*tieSection['kgPerM'])*9.81/1000+30
nonsteelG=1.5*a['normal_area'];roofMassBound=steelG+nonsteelG
assert roofMassBound<3*a['plan_area']
maxTie=max(a['cases']['ULS-down']['ordinary_frame']['tie']*scale,a['cases']['ULS-down']['corner_action_envelope']['tie'])
reverseTie=max(abs(a['cases']['uplift-stress']['ordinary_frame']['tie'])*scale,abs(a['cases']['uplift-stress']['corner_action_envelope']['tie']))
tieNcr=math.pi**2*E*tieSection['Iminor']/(4.65*math.sqrt(2)*1000)**2/1000
assert maxTie<tieSection['A']*fy/1000 and reverseTie<tieNcr*.5
result={'status':'Calculated conventional end-supported roof candidate; explicit structural/architectural rewind NOT selected',
 'sources':[{'path':str(P.relative_to(R)),'sha256':hashlib.sha256(raw).hexdigest()},{'path':str(LP.relative_to(R)),'sha256':hashlib.sha256(lr).hexdigest()}],
 'units':'mm, kN, kNm, MPa unless stated',
 'network':{'ordinaryFrames':8,'diagonalHipFrames':4,'primary':primary,'secondary':purlin,
 'cornerMethod':'For each of four corner squares, secondary rows at <=550 plan spacing terminate on the actual diagonal hip and adjacent ordinary primary. Both ends have bearing cleats. Mirror/rotate this plan about the house centre. No free cantilever jack or assumed moment-fixed purlin is used.',
 'longestSecondaryPlanSpan':L*1000,'ordinaryCentralSpan':3245,'secondaryEndCleat':{'seat':[100,100,12],'bearingCantilever':40,'bolts':'2M16 per end, declared100MPa shear stress budget','verticalEndReaction':endReaction,'boltShearScreen':boltShear,'seatBendingStress':seatStress},
 'secondaryActions':{'Mmajor':major,'Mminor':minor,'biaxialScreen':util,'serviceDeflection':delta,'L250':L*1000/250},
 'primaryActions':rows,'localEnvelopeAccounting':'Each ordinary frame receives the WHOLE central strip plus BOTH adjacent corner squares as an adverse bound. These overlapping local envelopes are not independent building mass. Global roof G/Q/uplift remain exact original144.15m2 once.',
 'ties':{'section':tieSection,'fullLength':tieLength,'maxTension':maxTie,'maxCompression':reverseTie,'compressionEulerHalf':tieNcr*.5,'scope':'Positive two-way box ties replace a tension-only flat tie for roof wind reversal; actual endplates/bolts/anchors must meet these forces.'},
 'massBudget':{'primaryLengthM':ordinaryLength+hipLength,'secondaryLengthUpperBoundM':secondaryLength,'tieLengthM':tieLength,'steelIncluding30kNConnectionAllowance':steelG,'nonsteelMaximumNormalAreaBudget':1.5,'nonsteelG':nonsteelG,'totalG':roofMassBound,'G3PlanLimit':3*a['plan_area'],'margin':3*a['plan_area']-roofMassBound,'scope':'Actual member list and constituent mass must remain inside these maxima; this is a mass budget, not a supplier takeoff.'},
 'temporaryStability':'Erect tied complete frames with positive lateral shores before adding secondary rows. Completed roof has continuous perimeter/court rings and diagonal roof-plane straps; no compression-only arch tie is used for wind reversal.'},
 'roofCollector':{'section':[b,H],'z':[ringBottom,ringTop],'steel':'2H20 TOP +2H20 BOTTOM; closedH8/75;25cover','axisSpan':1300,'windowClear':1000,'bearingLengthEach':300,'pointBudget':point,'M':Mc,'MR':MR,'V':Vc,'VRs':VRs,'xOverD':x/d,'ringExtradosReserve':25,
 'destination':'Each end bears on a core-width RC pier/solid wall strip. Selected pier coordinates, axial/lateral load and base/DPC transfer must be joined before whole-house selection.',
 'holdDown':'4M20 threaded rods per seat; tensile-area245 each, declared200/1.1 MPa gives178.18kN. Continue into RC collector/pier vertical steel. Actual anchor heads/development and corrosion/fire detail require matched evidence.'},
 'sourceRewind':{'oldPrimaryNormal':80,'newPrimaryNormal':250,'oldRing':[260,140],'newRing':[140,400],'oldPrimarySupportBottom':oldPrimaryBottom,'newPrimarySupportBottom':newPrimaryBottom,'weatherHeightIncrease':heightRise,'eavesOld':h['roofDevelopment']['eavesDatum'],'eavesNew':newEave,'ridgeOld':oldRidge,'ridgeNew':newRidge,
 'protectedCeilingTop':6620,'primaryBottomReserve':newPrimaryBottom-6620,'collectorBottomAboveUpperRing':25,'planStructuralLoadAreaUnchanged':a['plan_area'],'consequences':'Approximately0.45m added exterior eave/ridge height is a visible proportion and site/fire-height cost. Court, hips, overhang and pitch retain plan geometry; gutter/outfall positions retain plan only and need updated vertical falls. Roof constituent loadG3 must include actual new steel; quantity ledger is not yet complete.'},
 'openInternalDuties':['Actual local primary-end collector/pier coordinates and lateral bracing anchorage; full whole-house load allocation. These are finite design duties before selection, not delegated physical certification.'],
 'physicalAdmission':False}
out=Path(__file__).with_suffix('.json');text=json.dumps(result,indent=2,sort_keys=True)+'\n'
if '--check'in sys.argv:assert out.read_text()==text;print('Current finite roof-member/collector candidate reproduces')
else:out.write_text(text);print(json.dumps({'primary':rows,'purlin':result['network']['secondaryActions'],'height':result['sourceRewind']},indent=2))
