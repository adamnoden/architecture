#!/usr/bin/env python3
"""Current short-bridge design comparison; authored load/section envelope, not construction approval."""
from pathlib import Path
import hashlib,json,math,sys
R=Path(__file__).resolve().parents[3];P=R/'project/had/studies/water-replan.json';raw=P.read_bytes()
assert hashlib.sha256(raw).hexdigest()=='dbfff5eb4fa36dbdf6635702e853792e6412d73df1c58f9e1c1ede1bcff205b8'
v=json.loads(raw);h=v['model'];old=json.loads((R/'project/had/studies/open-north-loggia.json').read_text());legacy=json.loads((R/'project/str/studies/open-loggia-support.json').read_text())
for key in ['upperWalls','roofDevelopment','stair']:assert h[key]==old[key],key
assert h['openings']['FIRST']==old['openings']['FIRST']
A=lambda d:math.pi*d*d/4
B=v['bridge'];SPAN=(B['supportAxesY'][1]-B['supportAxesY'][0])/1000
fyd=500/1.15;fcd=.85*30/1.5;E=22000*(38/10)**.3
# Same C30/S500/45degree reference family as owning open-loggia method.
# JRC2008Walraven thin-wall model. The cell is conservatively clipped inside
# actual main-bar centrelines; no2026UKNA compliance is claimed.
def section(b,depth,nbar,dia,cover,link,pitch,G,Q,P):
 edge=cover+link+dia/2;d=depth-edge;As=nbar*A(dia)
 x=As*fyd/(.8*b*fcd);lever=min(d-.4*x,.9*d)
 MR=As*fyd*(d-.4*x)/1e6
 w=1.35*G+1.5*Q;L=SPAN
 M=w*L*L/8+P*L/4 # worst position, not a claimed actual midpoint roofseat
 V=w*L/2+P # allpointtooneend bounds actual asymmetry
 def cracked_part(w,p,phi):
  Ec=E/(1+phi);n=200000/Ec;xx=(-n*As+math.sqrt((n*As)**2+2*b*n*As*d))/b;I=b*xx**3/3+n*As*(d-xx)**2;mm=SPAN*1000
  return (5*w*mm**4/384+p*1000*mm**3/48)/(Ec*I)
 delta=cracked_part(G,max(0,P-7.5)/1.35,3.5)+cracked_part(Q,5,0)+400e-6*(SPAN*1000)**2/(8*depth)
 # Construction/service force and physical eccentricity are kept separately.
 return dict(width=b,depth=depth,d=d,cover=cover,steel=f'{nbar}H{dia} each TOP/BOTTOM',As=As,neutral_axis=x,ductility=x/d,MR=MR,M=M,V=V,lever=lever,edge=edge,linkDiameter=link,linkPitch=pitch,deflectionIncluding400microstrain=delta,deflectionComparator=SPAN*1000/250)
def mechanics(s,T):
 b,d,H=s['width'],s['d'],s['depth'];tef=max(b*H/(2*(b+H)),2*s['edge'])
 Ak=(b-tef)*(H-tef);uk=2*(b+H-2*tef)
 vr=.528*fcd*b*.9*d/2/1000;tr=.528*fcd*Ak*tef/1e6
 shear_leg=s['V']*1000/(4*.9*d*fyd);torsion_leg=T*1e6/(2*Ak*fyd);provided=A(s['linkDiameter'])/s['linkPitch']
 torsion_As=T*1e6*uk/(2*Ak*fyd);flex_As=s['M']*1e6/(fyd*s['lever'])
 # Uniform flexural strain consumes EACH corner's proportional stress capacity;
 # do not allocate all bending to an imaginary central bar first.
 dia=int(s['steel'].split('H')[1].split()[0]);corner=torsion_As/(4*A(dia))+flex_As/s['As']
 s.update(torsionWall=tef,Ak=Ak,T=T,torsionSteelRequired=torsion_As,flexuralSteelRequired=flex_As,bottomCornerInteraction=corner,
  shearTorsionStrut=s['V']/vr+T/tr,outerLegRequired=shear_leg+torsion_leg,outerLegProvided=provided,
  minVerticalMainBarClear=H-2*s['edge']-dia,
  passChecks={'flexure':s['M']<=s['MR'],'ductility':s['ductility']<=.45,'longitudinalCorner':corner<=1,'closedLink':shear_leg+torsion_leg<=provided,'strut':s['V']/vr+T/tr<=1,'verticalBarClear':H-2*s['edge']-dia>=21,'serviceDeflection':s['deflectionIncluding400microstrain']<=s['deflectionComparator']})
 s['pass']=all(s['passChecks'].values());return s
# Gross load budgets bound openings without pretending to be a masonry takeoff.
# Ground3.35 and upper3.17 match actual-180/3170/3370/6540 reference datums.
core_axis=h['court'][0]+h['court'][2]+h['envelope']-27-70
spine=next(w for w in h['groundWalls']if w['id']=='gallery-east-water-weather')
groundH=(h['sections']['firstFloorRC']['bottom']-B['localSupportBeamZ'][1])/1000
upperH=(legacy['actual_roof']['collector']['bottom']-h['sections']['firstFloorRC']['top'])/1000
core=.14*(groundH+upperH)*20;court_weather=.1025*(h['roofDevelopment']['eavesDatum']-B['localSupportBeamZ'][1])/1000*20;spine_weather=.1025*groundH*20
first_gallery=(B['supportAxesX'][1]-core_axis)/2000;ground_gallery=(B['supportAxesX'][1]-B['supportAxesX'][0])/2000;east_floor=(B['outerSupportReservation']['axisX']-B['supportAxesX'][1])/2000
roofP=next(p for p in legacy['actual_roof']['seats']if p['id']=='E-7622.5-0')['R_down']
inputs=[dict(id='court',width=600,bars=4,barDiameter=20,coreG=core,weatherG=court_weather,floorG=7.5*(first_gallery+ground_gallery),ceilingG=1.5*first_gallery,Q=2*(first_gallery+ground_gallery),coreE=(core_axis-B['supportAxesX'][0])/1000,weatherE=(h['court'][0]+h['court'][2]+51.25-B['supportAxesX'][0])/1000,floorE=B['localSupportBeamWidths'][0]/2000,ceilingE=(core_axis-B['supportAxesX'][0])/1000,roofPoint=roofP,roofE=(core_axis-B['supportAxesX'][0])/1000),
 dict(id='spine',width=900,bars=4,barDiameter=25,coreG=core,weatherG=spine_weather,floorG=7.5*(first_gallery+east_floor+ground_gallery)+3*east_floor,ceilingG=1.5*(first_gallery+east_floor),Q=2*(first_gallery+east_floor+ground_gallery+east_floor),coreE=0,weatherE=(spine['finishedFaces'][1]-51.25-B['supportAxesX'][1])/1000,floorE=B['localSupportBeamWidths'][1]/2000,ceilingE=.07,roofPoint=0,roofE=0)]
rows=[]
for inp in inputs:
 choices=[]
 for depth in [200,250,300,350,450]:
  for cover in [40,50]:
   G=inp['coreG']+inp['weatherG']+inp['floorG']+inp['ceilingG']+inp['width']*depth/1e6*25
   # All absolute signed ingredients to ONE end is an upper bound; no assumed
   # equal torsional restraint or favourable leaf cancellation buys capacity.
   distributed=sum(abs(inp[g]*inp[e]) for g,e in [('coreG','coreE'),('weatherG','weatherE'),('floorG','floorE'),('ceilingG','ceilingE')])
   T=SPAN*1.35*distributed+SPAN*1.5*inp['Q']*abs(inp['floorE'])+abs(inp['roofPoint']*inp['roofE'])+7.5*inp['width']/2000
   s=section(inp['width'],depth,inp['bars'],inp['barDiameter'],cover,10,75,G,inp['Q'],inp['roofPoint']+7.5);choices.append(mechanics(s,T))
 preferred=next((D for D in [200,250,300,350,450]if all(s['pass']for s in choices if s['depth']==D)),None)
 rows.append({'line':inp,'capacityComparison':choices,'minimumPassingDepthAtBothCovers':preferred})
assert all(r['minimumPassingDepthAtBothCovers']is not None for r in rows)
result={'status':'Calculated preliminary short-bridge envelope; whole-house/node/connection selection still in progress','source':{'path':str(P.relative_to(R)),'sha256':hashlib.sha256(raw).hexdigest()},
 'methodSource':'JRC Eurocodes2008 Walraven EN1992_1_Walraven.pdf, torsion slides83–89; existing project RC bending/shear family. Historical method provenance, not current-code or National-Annex approval.',
 'methodURL':'https://eurocodes.jrc.ec.europa.eu/sites/default/files/2022-06/EN1992_1_Walraven.pdf',
 'assumptions':{'materials':'Declared C30/S500; actual constituent/strength/cover/adoption remains owning qualification','G':'Core/weather density20kN/m3 maximum reference, grosssolidheight envelopes. RC25kN/m3. Floors7.5 including5RC+2.5nonwall max; separate1.5ceiling max; exterior deck3. These are enforceable design budgets, not actual takeoff.','Q':2,'railVariablePoint':'5kN characteristic complete wet/carriage designbudget (7.5ULS), alltoonebridge andedge; actual combinedweight/water must stayinside orreopen. No hoist supportedovergallery.','loadFactors':[1.35,1.5],'axisSpanM':SPAN,'actualClearSpanM':SPAN-B['supportNodes']['plan'][1]/1000,'torsion':'All absolute force*eccentricity to one end; no cancellation/equalstiffness. FourlegclosedH10/75, three/fourH20topbottom; uniform flexure+torsion corner stress superposition.',
 'excludedFromLocalBeam':'CourtNEhip at8082.5 beyond7700 support must meet its own adjacent node/collector. No missingroof action silently enters localbound; whole-houseledger must route it. Node/pile/cage anchorage, stage/robustness/fire/site still require joined design.'},
 'members':rows,'next':'Draw/resolve the900EWnode cage/bearing and actual tie endshoe; then join all wholehouse gravity/signed destinations. No HADdepth/grade is changed by this comparison.'}
out=Path(__file__).with_suffix('.json');text=json.dumps(result,indent=2,sort_keys=True)+'\n'
if '--check'in sys.argv:assert out.read_text()==text;print('Current bridge load/eccentricity/section comparison reproduces')
else:out.write_text(text);print(json.dumps([{'line':r['line']['id'],'depth':r['minimumPassingDepthAtBothCovers'],'200adverse':next(s for s in r['capacityComparison']if s['depth']==200 and s['cover']==50)['passChecks']}for r in rows],indent=2))
