#!/usr/bin/env python3
"""Source-bound four-corner RC stability candidate: explicit force, geometry and ground conditions."""
from pathlib import Path
import hashlib,json,math,sys
R=Path(__file__).resolve().parents[3];P=R/'project/had/studies/water-replan.json';raw=P.read_bytes();assert hashlib.sha256(raw).hexdigest()=='dbfff5eb4fa36dbdf6635702e853792e6412d73df1c58f9e1c1ede1bcff205b8'
h=json.loads(raw)['model'];roof=json.loads(Path(__file__).with_name('current-house-roof.json').read_text());top=roof['sourceRewind']['ridgeNew'];base=-180
# Entire facade rectangle up to ridge is loaded, including portions that are
# actually open or triangular. No favourable dead weight stabilises uplift.
width=(h['shell']+2*h['roofDevelopment']['overhang'])/1000
pressure=2.25;H=(top-base)/1000;w=pressure*width;V=w*H;M=w*H*H/2
perV=V/4;perM=M/4
# Four parallel900x140 legs per direction; the perpendicular L flange is
# ignored for in-plane capacity. Symmetric stiffness locations avoid an
# invented favourable torsional distribution.
length=900;thick=140;cover=25;bar=20;link=8;fyd=500/1.15;fcd=.85*30/1.5;Ec=22000*(38/10)**.3
# Two rows at each end, two bars across the wall at each row.
barX=[50,100,800,850];bars=[x for x in barX for _ in range(2)];Ab=math.pi*bar*bar/4
assert 140-2*(cover+link+bar/2)-bar>=25

def capacity_at(Ntarget):
 def calc(c):
  N=moment=0.;dx=length/900
  for i in range(900):
   x=(i+.5)*dx;strain=.0035*(c-x)/c
   stress=0 if strain<=0 else fcd if strain>=.002 else fcd*(1-(1-strain/.002)**2)
   force=stress*thick*dx;N+=force;moment+=force*(length/2-x)
  for x in bars:
   strain=.0035*(c-x)/c;stress=max(-fyd,min(fyd,200000*strain))
   concrete=0 if strain<=0 else fcd if strain>=.002 else fcd*(1-(1-strain/.002)**2)
   force=(stress-concrete)*Ab;N+=force;moment+=force*(length/2-x)
  return N/1000,moment/1e6
 lo,hi=1.,10000.
 for _ in range(90):
  c=(lo+hi)/2
  if calc(c)[0]<Ntarget:lo=c
  else:hi=c
 return {'N':Ntarget,'MR':calc((lo+hi)/2)[1],'neutralAxis':(lo+hi)/2}
NM=[capacity_at(N)for N in [-100,0,250,500]]
assert min(r['MR']for r in NM)>perM
# Fully cracked stiffness25% of gross, declared service deflection comparator
# only. Service wind is1.5kPa; whole height cantilever, no floor-fixity credit.
Lactual=1000; A1=thick*Lactual; A2=(Lactual-thick)*thick; c1=Lactual/2; c2=thick/2; cy=(A1*c1+A2*c2)/(A1+A2)
Ig=thick*Lactual**3/12+A1*(c1-cy)**2+(Lactual-thick)*thick**3/12+A2*(c2-cy)**2
I=.25*Ig;delta=(w/1.5/4)*(H*1000)**4/(8*Ec*I)
assert delta<H*1000/500
Hp=(6940-base)/1000;extra=H-Hp;ww=w/1.5/4;Pt=ww*extra;Mt=ww*extra**2/2
def sway(z):
 zz=z*1000;hp=Hp*1000
 return ww*zz**2*(6*hp**2-4*hp*zz+zz**2)/(24*Ec*I)+Pt*1000*zz**2*(3*hp-zz)/(6*Ec*I)+Mt*1e6*zz**2/(2*Ec*I)
yFirst=sway((3370-base)/1000);yRoof=sway(Hp)
storeyDrift=[yFirst,yRoof-yFirst]
# Full L gross inertia is used only at declared25% cracked stiffness; no floor-fixity credit.
Vr=2*math.pi*10**2/4/150*.9*(length-50)*fyd/1000
assert perV<Vr
# A real foundation couple avoids silently sending265kNm into a100kNm pilehead.
pileLever=.860;pair=perM/pileLever;compression=500/2+pair;uplift=100+pair
assert compression<850
# Whole roof/floor horizontal collectors: ties/chords route around actualcourt
# andvoid. FullglobalVassigned to EACH ring arm is a conservative action bound.
chord=M/((11667.5-332.5)/1000)
chordAs=4*math.pi*20**2/4;chordCapacity=chordAs*fyd/1000
assert chord<chordCapacity
# RC200 diaphragm section, H12/150 eachface/twoaxes; no plaster/friction capacity.
shearStress=V*1000/(200*3100);shearBudget=.5
assert shearStress<shearBudget
polygon=[[262.5,262.5],[1262.5,262.5],[1262.5,402.5],[402.5,402.5],[402.5,1262.5],[262.5,1262.5]]
piers=[]
for sx,sy in [(1,1),(-1,1),(1,-1),(-1,-1)]:
 trans=lambda p:[p[0]if sx==1 else 12000-p[0],p[1]if sy==1 else 12000-p[1]]
 piers.append({'polygon':[trans(p)for p in polygon],'cornerPileGroup':[trans(p)for p in [[332.5,332.5],[1192.5,332.5],[332.5,1192.5]]],'z':[-180,6940]})
result={'status':'Preferred stability candidate calculated; current-source joint/mass/reaction integration and architectural adoption remain active',
 'source':{'path':str(P.relative_to(R)),'sha256':hashlib.sha256(raw).hexdigest()},'units':'mm, kN, kNm, MPa unless stated',
 'wind':{'designPressure':pressure,'characteristicPressure':1.5,'basis':'Authored whole-facade rectangular envelope, not a site wind assessment. Entire ridge-height rectangle; no favourableG. ±X and±Y separately; oppositecorner symmetry. Site action above this bound reopens design.','facadeWidthM':width,'heightAboveGrillageM':H,'globalV':V,'globalBaseM':M,'perLegV':perV,'perLegM':perM,'loadAboveRoofCollector':'Actual roof steel/bracing routes wind above6940 into closedcollector; no masonryarch/ceiling credited.'},
 'RClegs':{'conservativeSection':[140,900],'actualLpolygonLegPhysicalLength':1000,'grossLInertia':Ig,'crackedInertiaFraction':.25,'barCentresAlongLeg':barX,'barsAcrossCore':[43,97],'longitudinal':'8H20 per leg, four at each end; symmetric N-M section includes displaced concrete. HorizontalH10/150 bothfaces.','Ndomain':[-100,500],'sectionNM':NM,'shearResistance':Vr,'serviceCrackedDeflection':delta,'serviceComparator':'Declared fullheight/500 design screen; not a regulatory/site acceptance' ,'H500':H*1000/500,'actualCollectorTopSway':yRoof,'actualFirstFloorSway':yFirst,'storeyRacking':storeyDrift,'requiredMovementInterface':'Reserve ±10mm relative wind movement at nonstructural infill/RC returns; current plain bonded masonry/plaster and window/arch junctions do NOT automatically earn compatibility from H/500. Locate final local slip/head/arch-abutment interface before adoption; physicalweather/firefinish acceptance remains downstream.','piers':piers,
 'architecturalChange':'Replace the inner140core at each outercorner by RC L-pier, including a deliberate formed RC transition where existing inner-leaf arch spring/ring territory overlaps. Rawwindow aperture remains37.5clear ofpier; outerweatherbrickarch unchanged. This is a material/load-path rewind, not an unchanged historic masonryjoint.'},
 'horizontalRoute':{'roof':'Tied steel primary/hip frames -> positive diagonalroof straps -> continuous140x400RCcourt/outerrings -> fourRCcornerL-piers. No unsupported jack-root moments or compression arch tie credited.','firstFloor':'RC200 diaphragm withH12/150 bothfaces/twoaxes; chords4H20 inactualperimeter/court/voidedge strips; collectorforces continue toRCcornerlegs. Localvoidreturn/chordanchorfinalfabrication remainsSTR-RECONCILE, not a missing stabilitysystem.','grillage':'ActualRCcornerbase group at860lever resolvesmomentasaxialcouple. Continuous600x450grillage arms and threepileheads percorner areexplicit; no soil/friction/upliftcapacity inferred.','chordDemand':chord,'chordResistance':chordCapacity,'diaphragmShearMPa':shearStress,'declaredShearBudgetMPa':shearBudget},
 'foundationRequiredDomain':{'cornerPairLever':pileLever,'lateralCoupleForce':pair,'maxCompressionWithN500':compression,'minUpliftResistanceRequired':uplift,'pileSection':'400diameter8H22 historicalsection has tensile steel >1.3MN atdeclaredS500; groundbond, pilegroup, wetground/lateralcapacity remain required siteadmissibility conditions.','belowGrillageFacade':'Wind on exposedplinth below−180 is a separate ground/node action and must be included in actualfoundation design, not additionalupperpier bending.'},
 'capillarySplice':{'plateZ':[-50,-30],'plateThickness':20,'plan':'ExacteachLpolygon','role':'Unperforatedstructuralmetalplate: alignedanchoredlongitudinalsteel terminatesatopposedfaces; no continuousbar/hole bypasses thecapillaryplane. Compression/tension/shear cross thefiniteplatesplice. MATowns edgeDPC/air/gas continuity andthermalcost; plate/anchorforces must matchthiscard.','governingCard':{'Ncompression':500,'Nuplift':100,'V':75,'M':300},'physicalAdmission':False},
 'wholeHouseStructuralSelection':False}
out=Path(__file__).with_suffix('.json');text=json.dumps(result,indent=2,sort_keys=True)+'\n'
if '--check'in sys.argv:assert out.read_text()==text;print('Current four-corner RC stability and exact force/footprint candidate reproduces')
else:out.write_text(text);print(json.dumps({'wind':result['wind'],'NM':NM,'delta':delta,'foundation':result['foundationRequiredDomain']},indent=2))
