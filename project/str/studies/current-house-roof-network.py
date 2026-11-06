#!/usr/bin/env python3
"""Conserved finite row/hip roof; actual discrete steel origins and adverse independent rows."""
from pathlib import Path
import json,math,hashlib,sys
R=Path(__file__).resolve().parents[3];P=R/'project/had/studies/water-replan.json';raw=P.read_bytes();assert hashlib.sha256(raw).hexdigest()=='547a0a5515878fd522ceb108c57c37b8aad29f5d2efe33848d93cedd89d65ad4'
v=json.loads(raw);h=v['model'];LP=R/'project/str/studies/open-loggia-support.json';lr=LP.read_bytes();a=json.loads(lr)['actual_roof'];E=200000;fy=200/1.1

def box(H,B,t):
 A=B*H-(B-2*t)*(H-2*t);I=(B*H**3-(B-2*t)*(H-2*t)**3)/12;J=(H*B**3-(H-2*t)*(B-2*t)**3)/12;Ak=(H-t)*(B-t)
 return dict(H=H,B=B,t=t,A=A,I=I,Iminor=J,W=2*I/H,Wminor=2*J/B,MR=2*I/H*fy/1e6,TR=2*Ak*t*fy/math.sqrt(3)/1e6,lineG=A/1e6*78.5)
primary=box(200,140,12);secondary=box(150,80,8);tie=box(150,100,8);collector=box(250,140,16)
welded='--welded-geometry' in sys.argv
station=4700 if welded else 4377.5
if welded:
 # Two physically separate ties flank the uncut primary box. Use twice the
 # area/mass for axial response; weak-axis buckling is checked per free rail.
 rail=box(120,60,8);tie=rail.copy()
 for key in ['A','I','Iminor','W','Wminor','MR','TR','lineG']:tie[key]*=2
 collector=box(120,220,20)
pitch=math.radians(25);qG=1.5/math.cos(pitch);qQ=1.5

def coeff(x,L,tanA,z):
 RA=1-x/L;RB=x/L;H=(RA*L/2-max(0,L/2-x))/(L/2*tanA)
 moment=RA*max(0,z)+RB*max(0,z-L)-max(0,z-x)-H*max(0,min(z,L-z))*tanA
 V=RA-(1 if z>=x else 0)+(RB if z>L else 0);angle=math.atan(tanA)*(1 if z<=L/2 else-1)
 N=H*math.cos(angle)+V*math.sin(angle) if 0<=z<=L else 0
 return [RA,RB,H,moment,N]
def bound(items,index,lo,hi):
 cs=[(c[index]*weight,low,high)for c,weight,low,high in items]
 return [sum(x*(l if x>=0 else u)for x,l,u in cs),sum(x*(u if x>=0 else l)for x,l,u in cs)]
rows=[];globalG=globalQ=globalRA=globalRB=globalUp=0.;purlinLength=0
for name,mult,d in [('ordinary',8,1),('hip',4,math.sqrt(2))]:
 L=3.585*d;tanA=math.tan(pitch)/d
 fields=[((y-8082.5)*d/1000,w*((y-(12000-station))/1000 if name=='hip'else((12000-2*station)+y-(12000-station))/2000),w)for y,w in zip(a['purlin_rows'],a['tributaries'])]
 area=sum(A for x,A,w in fields)
 primaryLength=4.65*d/math.cos(math.atan(tanA));primaryG=primaryLength*primary['lineG'];tieG=L*tie['lineG']
 # Two 1kN commonhaunches,0.5kN crown and one twelfth of8.5kN bracing.
 nodesG=2.;crownG=.5;bracingG=8.5/12
 points=[(L/4-.26625*d,primaryG/2),(3*L/4+.26625*d,primaryG/2),(0,tieG/2+1+bracingG/2),(L,tieG/2+1+bracingG/2),(L/2,crownG)]
 purlinG=sum(A/w*secondary['lineG']for x,A,w in fields);purlinLength+=mult*sum(A/w for x,A,w in fields)
 Gi=qG*area+purlinG+sum(g for x,g in points);Qi=qQ*area
 cuts=sorted(set([0,L/2,L]+[x for x,A,w in fields]+[x for x,g in points]));envelopes={k:[math.inf,-math.inf]for k in ['RA','RB','H','M','N']};serviceM=0
 for z in cuts:
  # Independent adverse rowpressure[-2.25,+6.3], plus actual discrete metal
  # placed independently0..1.35G. This overbounds favourableG, not globally summed.
  items=[(coeff(x,L,tanA,z),A,-2.25,6.3)for x,A,w in fields]
  items +=[(coeff(x,L,tanA,z),A/w*secondary['lineG'],0,1.35)for x,A,w in fields]
  items +=[(coeff(x,L,tanA,z),g,0,1.35)for x,g in points]
  for idx,key in enumerate(envelopes):
   lo,hi=bound(items,idx,0,0);envelopes[key]=[min(envelopes[key][0],lo),max(envelopes[key][1],hi)]
  sitems=[(coeff(x,L,tanA,z),A,-1.5,4.5)for x,A,w in fields]+[(coeff(x,L,tanA,z),A/w*secondary['lineG'],0,1)for x,A,w in fields]+[(coeff(x,L,tanA,z),g,0,1)for x,g in points]
  serviceM=max(serviceM,*map(abs,bound(sitems,3,0,0)))
 # Conserved actual ULS uniformcase uses backgroundG+Q and discreteG ONCE.
 actual=[0,0,0,0,0]
 for x,A,w in fields:
  C=coeff(x,L,tanA,0);load=(1.35*qG+1.5*qQ)*A+1.35*A/w*secondary['lineG']
  actual=[actual[i]+load*C[i]for i in range(5)]
 for x,g in points:
  C=coeff(x,L,tanA,0);actual=[actual[i]+1.35*g*C[i]for i in range(5)]
 assert math.isclose(actual[0]+actual[1],1.35*Gi+1.5*Qi,rel_tol=1e-12)
 torque=.075*(area*6.3+1.35*(primaryG+purlinG+nodesG+crownG+bracingG))
 assert max(envelopes['RA'][1],envelopes['RB'][1])<=70 and min(envelopes['RA'][0],envelopes['RB'][0])>=-25
 assert max(map(abs,envelopes['H']))<=60 and torque<=10
 Nb=min(.3*primary['A']*fy/1000,.5*math.pi**2*E*primary['Iminor']/5100**2/1000)
 primaryUtil=max(map(abs,envelopes['N']))/Nb+max(map(abs,envelopes['M']))/primary['MR']+torque/primary['TR']
 assert primaryUtil<1
 strutLength=primaryLength/2
 # Cantilever-curvature bound for each actual halfrafter, plus free tie stretch.
 stretch=max(map(abs,envelopes['H']))*1000*L*1000/(E*tie['A'])
 defl=serviceM*1e6*(strutLength*1000)**2/(2*E*primary['I'])+stretch/(2*tanA)
 assert defl<strutLength*1000/250
 rows.append(dict(id=name,count=mult,axisSpanM=L,rows=[{'x':x,'area':A,'rowWidth':w}for x,A,w in fields],planArea=area,primaryLengthM=primaryLength,tieLengthM=L,purlinG=purlinG,primaryG=primaryG,tieG=tieG,nodeG=nodesG,crownG=crownG,bracingG=bracingG,backgroundG=qG*area,G=Gi,Q=Qi,actualUniformULS={'RA':actual[0],'RB':actual[1],'H':actual[2]},independentAdverse=envelopes,oneSeatAbsoluteTorque=torque,primaryCombined=primaryUtil,serviceM=serviceM,curvatureAndTieStretchBound=defl,strutL250=strutLength*1000/250))
 globalG+=mult*Gi;globalQ+=mult*Qi;globalRA+=mult*actual[0];globalRB+=mult*actual[1];globalUp+=mult*area*-2.25
assert math.isclose(sum(r['count']*r['planArea']for r in rows),144.15)
assert math.isclose(globalRA+globalRB,1.35*globalG+1.5*globalQ)
assert globalG<=3*144.15
# Rotatedsecondaryservice uses BOTH inertias, not strongaxis alone.
L=(station+200)/1000;w=4.5*.55+secondary['lineG'];M=(6.3*.55+1.35*secondary['lineG'])*L**2/8
biaxial=M*math.cos(pitch)/secondary['MR']+M*math.sin(pitch)/(secondary['Wminor']*fy/1e6)
deflection=5*w*(L*1000)**4/(384*E)*(math.cos(pitch)**2/secondary['I']+math.sin(pitch)**2/secondary['Iminor'])
assert biaxial<1 and deflection<L*1000/250
result={'status':'Conserved finite roof network and actual signed action candidate; common welded seat/hip and whole-house adoption still active','sources':[{'path':str(P.relative_to(R)),'sha256':hashlib.sha256(raw).hexdigest()},{'path':str(LP.relative_to(R)),'sha256':hashlib.sha256(lr).hexdigest()}],'units':'mm,kN,kNm,MPa unless stated','sections':{'primary':primary,'secondary':secondary,'tie':tie,'collector':collector},'frames':rows,
 'globalOrigins':{'planArea':144.15,'G':globalG,'Q':globalQ,'ULSdown':globalRA+globalRB,'upliftNoFavourableG':globalUp,'G3Budget':432.45,'margin':432.45-globalG,'purlinPhysicalLengthM':purlinLength,'collectorSeparateWallHeadOrigin':'New250x140x16 steelcollector is NOT inthisroofG; deleteoldRC260x140collector andaddactualsteelringONCE inwhole-houseledger. Noarbitraryloadlabelmove.'},
 'secondary':{'maxPlanSpan':L*1000,'biaxialULS':biaxial,'serviceVerticalBothAxes':deflection,'L250':L*1000/250,'endBearing':'Positivewelded/boltedcleatsforbothsigns; actualinner127.5mm axisgap uses commonterminaldiaphragm, NOT a shortRHS+twocleats. Atrow7750 ordinary/hipsolidsmerge inonejoint; rowweight/reactionsremaininthisledger.'},
 'nodeBudget':{'down':70,'up':25,'tieEitherSign':60,'rafterAxisTorque':10,'role':'BoundsactualindependentrowsanddiscreteGabove, notownerinvariants. Commonclosedhaunch mustjoinrafter/tiebranchsolids andtransfertorsionwithoutasingleplanarknife.'},
 'rainCatchment':v['hydraulicProbe']['catchment'],'method':'Exactrowinfluencecoefficients ofexistingtwo-strut/tieframe; rowsindependentlyrange[-2.25,+6.3]equivalentplanpressure. Actualuniformmassledgerusesthedeclared1.5kPanormalnonsteelbudget andeverymetaloriginonce. Primary full4.65planextent explicitlyincludes200overhangbeyondoldprimaryends. Sitewind/snow/material/actualjointsremainseparate.'}
if welded:
 result.update(status='Separated inner eaves and twin exterior tie rails; signed row actions for common welded saddle candidate',
  ordinaryStations=[station,12000-station],innerEaveOrdinaryHipAxisSeparation=station-4450,individualTieRail=rail,
  actualCombinedTieMass=2*rail['lineG'],ringSeparateOrigin=collector['lineG']*62)
 result['secondary']['endBearing']='New ordinary axes 4700/7300. Shortest row at7750 has450mm ordinary-to-hip axis separation; at the actual eave there is250mm. Opposed positive web cleats remain inside the measured clear zone. No crossed primary noses.'
 result['globalOrigins']['collectorSeparateWallHeadOrigin']='120x220x20 continuous ring is counted separately in the whole-house wall-head mass; this roof G contains every twin tie rail and 1kN allowance per heel.'
out=Path(__file__).with_name('current-house-welded-network.json') if welded else Path(__file__).with_suffix('.json');text=json.dumps(result,indent=2,sort_keys=True)+'\n'
if '--check'in sys.argv:assert out.read_text()==text;print('Conserved finite roof rows, signed metal origins and adverse cases reproduce')
else:out.write_text(text);print(json.dumps({'global':result['globalOrigins'],'frames':[{'id':r['id'],'actions':r['independentAdverse'],'torsion':r['oneSeatAbsoluteTorque'],'util':r['primaryCombined'],'defl':r['curvatureAndTieStretchBound'],'limit':r['strutL250']}for r in rows]},indent=2))
