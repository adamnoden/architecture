#!/usr/bin/env python3
"""Raised central arch tie with statically equivalent end shoes. No voussoir drilling or physical approval."""
from pathlib import Path
import hashlib,json,math,sys
from html import escape
R=Path(__file__).resolve().parents[3];P=R/'project/had/studies/water-replan.json';raw=P.read_bytes()
assert hashlib.sha256(raw).hexdigest()=='735bdb0475c25ff2b83426152b5545d583b8d175fc4549f4c6a0ac6055da54bc'
h=json.loads(raw)['model'];legacy=json.loads((R/'project/str/studies/open-loggia-support.json').read_text());arch=legacy['north_arches'];portal=h['northNormalRoute']['portal']
assert math.isclose(portal['rawRadius'],arch['Ri']*1000,abs_tol=1e-9) and portal['centreZ']==724.666666666667
# Horizontal formed bore, original cage, outer150plate,60washer and50nut stay.
rodZ=2200;padZ=2150;strapZ=2240;strap=[100,20];span=2600;E=200000;steelWeight=78.5;fyd=200/1.1
rodCapacity=561*fyd/1000
L=span;I=strap[0]*strap[1]**3/12;q=strap[0]*strap[1]/1e6*steelWeight
sag=5*q*L**4/(384*E*I) # q kN/m numerically N/mm; ZERO favourable arch tension
strapTension=strap[0]*strap[1]*fyd/1000
rows=[]
for name,band in zip(['court-north','outer-north'],portal['coreBands']):
 case=arch['cases'][name+'/actual-window-arch-transfer'];H=case['H'];offset=strapZ-rodZ
 C=H*offset/(rodZ-padZ);rod=H+C
 assert math.isclose(rod-C,H) and math.isclose(C*(rodZ-padZ),H*offset)
 # Resultant force on the pier is identical to H applied at the raised strap.
 assert math.isclose((rod*rodZ-C*padZ)/H,strapZ)
 floor=-110-(band[0]-7750)/100;loadtop=floor+h['southCourtThresholdReference']['maintainedState']['incoming']['transportEnvelope'][2]
 head=strapZ-strap[1]/2-sag-loadtop
 padstress=C*1000/(150*50)
 # Two20-thick cheeks; conservative150minimum effective depth (not full175).
 cheekN=rod*1000/(2*20*150);cheekM=H*offset*1000/(2*20*150**2/6)
 crossheadStress=rod*.110/4*1e6/((175-34)*20**2/6)
 toeStress=C*.110/4*1e6/(50*25**2/6)
 assert crossheadStress<fyd and toeStress<fyd
 row={'portal':name,'actualCoreBandY':band,'sourceCase':name+'/actual-window-arch-transfer','archThrustULS':H,
  'endRodTension':rod,'compressionPadForce':C,'padStressMPa':padstress,'strapTensionCapacity':strapTension,'rodCapacity':rodCapacity,
  'crossheadNetStripStressMPa':crossheadStress,'toePlateStressMPa':toeStress,'cheekCombinedStressMPa':cheekN+cheekM,'steelDesignStressMPa':fyd,'originalTieUnderside':2175,'completeIncomingTop':loadtop,
  'raisedUndersideAfterZeroTensionSag':strapZ-strap[1]/2-sag,'headReserveAfterSag':head,'requiredReferenceHeadReserve':25,
  'netForceOnPier':H,'effectiveForceHeightOnPier':strapZ,
  'pierTieMomentOld':H*(arch['hinge_z']-2.2),'pierTieMomentNew':H*(arch['hinge_z']-strapZ/1000)}
 assert head>=25 and rod<rodCapacity and H<strapTension and padstress<.85*30/1.5 and cheekN+cheekM<fyd
 rows.append(row)
# Polygon lower shoe never intrudes into the brick intrados. Upper shoe starts
# after4610; below thatx only the compression toe2125..2175 occupies the span.
shape=[[4520,2125],[4800,2125],[4800,2300],[4610,2300],[4610,2175],[4520,2175]]
def raw_intrados(x):return portal['centreZ']+math.sqrt(portal['rawRadius']**2-(x-6000)**2)
minimum=math.inf
for i in range(561):
 x=4520+i*.5;top=2175 if x<4610 else 2300;minimum=min(minimum,raw_intrados(x)-top)
assert minimum>=25
# The tempting thin strap is a retained failure: no unproved tension buys head.
def sag_for(z,width,depth):
 inertia=width*depth**3/12;load=width*depth/1e6*steelWeight
 return 5*load*L**4/(384*E*inertia)
oldThinSag=sag_for(2225,100,12);oldThinHead=2225-6-oldThinSag-rows[0]['completeIncomingTop']
assert oldThinHead<25
result={'status':'Preferred constructive Nportal tie challenger; not adopted until whole-house/current-source reconciliation',
 'source':{'path':str(P.relative_to(R)),'sha256':hashlib.sha256(raw).hexdigest(),'legacyActions':{'path':'project/str/studies/open-loggia-support.json','sha256':hashlib.sha256((R/'project/str/studies/open-loggia-support.json').read_bytes()).hexdigest()}},
 'oldControl':{'tie':portal['tie'],'courtHeadReserve':2175-rows[0]['completeIncomingTop'],'rejectedThinStrap':{'centre':2225,'section':[100,12],'zeroTensionSag':oldThinSag,'courtReserveAfterSag':oldThinHead}},
 'selectedCentralTie':{'centreZ':strapZ,'sectionNSxZ':strap,'freeSpanUsed':span,'stressBasis':'Conservative200MPa/1.1 steel reference, no supplier/certification credit','zeroTensionSelfWeightSag':sag,'axialTensionOnly':True,
  'noCredit':'No beneficial arch tension/fixedends reduces sag; no handling anchor or compression resistance credited. Actual thermal/creep/corrosion/fire and installation acceptance remain owning duties.'},
 'endShoes':{'westPolygonXZ':shape,'eastMirrorX':6000,'axialCoreBandsY':portal['coreBands'],'NSgross':150,'cheeks':2,'cheekThickness':20,
  'crosshead':{'x':[4610,4630],'z':[2125,2300],'NS':150,'rodHoleDiameter':34,'rodAxisZ':rodZ,'washer':[60,10],'nut':[50,30]},
  'pad':{'faceX':4520,'z':[2125,2175],'NS':150,'steelPlateThickness':25,'mineralContactTerritory':10},
  'strapOverlapWestX':[4700,4800],'shopWeldReference':{'filletLeg':6,'effectiveThroat':4.2,'lines':4,'lengthEach':100,'referenceShearStress':100,'capacity_kN':4*4.2*100*100/1000,'maximumDemand_kN':max(r['archThrustULS']for r in rows)},
  'rawIntradosMinimumReserve':minimum,
  'finishRewind':'Explicit formed metal/mineral collar replaces old50envelope locally within280glass/lining wrap; cheek150NS/175Z and central100NS/20Z slot are located. No masonry/RC removed, no voussoir drilled. Collar closure/fire/thermal/material qualification remains MAT/OAS/STRRECONCILE.',
  'assembly':'Shopfabricate shoe/strap withqualifiedweldprocedure before fittingnearmineralglass; retainpositivecapture and originalM30outeranchors/formed40bores. No hotworkagainst installedglass or moving permanent arch support without engineered temporaryworks.'},
 'equilibriumAndCapacityRows':rows,
 'additionalWeldGroups':{'crosshead':{'lines':4,'lengthEach':150,'throat':4.2,'stressBudget':100,'capacity_kN':252,'demand_kN':max(r['endRodTension']for r in rows)},'toe':{'lines':4,'lengthEach':50,'throat':4.2,'stressBudget':100,'capacity_kN':84,'demand_kN':max(r['compressionPadForce']for r in rows)}},
 'adoptionConditions':['Actual masonry ring/upperhead/roof collector action envelope must stay within sourcecases; their existing load/path limits survive.','RCface bearing/splitting and actual endplate/cage/rod threads, shopwelds, collars, corrosion, creep/thermal adjustment and constructionsequence require matched evidence.','Wholehouse lateral/uplift route bypasses compression-only archring through actual ring/RCpiers; this tie is not credited in compression.']}
assert result['endShoes']['shopWeldReference']['capacity_kN']>max(r['archThrustULS']for r in rows)
out=Path(__file__).with_suffix('.json');text=json.dumps(result,indent=2,sort_keys=True)+'\n'
# Actual XZ diagram (scoped near west end); mirrored construction is identical.
px=lambda x:70+(x-4250)*.9;pz=lambda z:650-(z-2050)*1.4
svg='<svg xmlns="http://www.w3.org/2000/svg" width="1250" height="850" viewBox="0 0 1250 850"><rect width="1250" height="850" fill="#fbfaf5"/><g font-family="sans-serif" fill="#222">'
t=lambda x,y,q,n=16:f'<text x="{x}" y="{y}" font-size="{n}">{escape(q)}</text>'
svg+=t(35,35,'CURRENT NPORTAL · RAISED TIE / ORIGINAL FORMED BORE',24)
pier=[[4307.5,2050],[4520,2050],[4520,2250],[4370.282309,2404.303639],[4307.5,2404.303639]]
svg+='<defs><clipPath id="diagram"><rect x="60" y="90" width="570" height="610"/></clipPath></defs><g clip-path="url(#diagram)">'
svg+='<polygon points="'+' '.join(f'{px(x)},{pz(z)}'for x,z in pier)+'" fill="#aaa69d"/>' 
pts=' '.join(f'{px(x)},{pz(z)}'for x,z in shape);svg+=f'<polygon points="{pts}" fill="#557b8d"/>'
svg+=f'<line x1="{px(4307.5)}" y1="{pz(2200)}" x2="{px(4640)}" y2="{pz(2200)}" stroke="#a35642" stroke-width="8"/>'
svg+=f'<rect x="{px(4700)}" y="{pz(2250)}" width="{450*.9}" height="28" fill="#a35642"/>'
svg+=f'<polyline points="'+ ' '.join(f'{px(x)},{pz(raw_intrados(x))}'for x in range(4520,5151,5))+'" fill="none" stroke="#766f5d" stroke-width="4"/>'
svg+='</g>'
for y,q in [(125,'M30 at2200 remains in formed40bore; original cage unchanged.'),(160,'100×20 central strap2240; no favourable tension reduces sag.'),(195,f'Zero-tension sag {sag:.3f}mm over2600; courtload2300 reserve {rows[0]["headReserveAfterSag"]:.3f}mm.'),(230,'Offset40: pad0.8H at2150 + rod1.8H at2200 = resultantH at2240.'),(265,f'Rawarch clearance {minimum:.3f}mm; no voussoirdrilling.'),(300,'Bracket/collar remains an explicit thermal/fire/material rewind.'),(335,'Right end mirrors aboutX6000; both actual portal bands share detail.')]:svg+=t(650,y,q)
svg+=t(35,765,'Blue: offset shoe; red: M30stub/raisedstrap; grey: RCpier. Final splitting/threads/welds/collars/temporaryworks are unqualified.')
svg+=t(35,805,'The old2175 underside and the thin12strap sag are rejected controls, not silently revised history.')+'</g></svg>\n'
outputs={out:text,Path(__file__).with_suffix('.svg'):svg}
for path,value in outputs.items():
 if '--check'in sys.argv:assert path.read_text()==value,path
 else:path.write_text(value)
print(json.dumps({'minimumRawArchReserve':minimum,'zeroTensionSag':sag,'courtHeadReserve':rows[0]['headReserveAfterSag'],'gardenHeadReserve':rows[1]['headReserveAfterSag'],'maximumRod':max(r['endRodTension']for r in rows)},indent=2))
