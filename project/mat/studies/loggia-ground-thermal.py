from pathlib import Path
import json, sys, math
import numpy as np
OUT=Path(__file__).resolve().parent
from scipy.sparse import coo_matrix
from scipy.sparse.linalg import spsolve

def solve(glass,aac,la=.29,step=5):
 x=np.arange(-1800+step/2,100,step);z=np.arange(-1000+step/2,1200,step)
 X,Z=np.meshgrid(x,z);K=np.zeros(X.shape)
 def put(mask,k):K[mask]=k
 # Actual heatedfield meets coreface; upperfinish stops at0.
 fld=X< -492.5
 put(fld&(Z<0)&(Z>=-15),2)
 put(fld&(Z< -15)&(Z>=-80),1.4)
 put(fld&(Z< -80)&(Z>=-80-glass),.041)
 put(fld&(Z< -80-glass)&(Z>=-280-glass),1.75)
 beamtop=-405 if aac else -180
 put((X>=-600)&(X<=0)&(Z<beamtop)&(Z>=beamtop-450),1.75)
 # core,DPC,inner thermalcourse. No crosscavityAAC/missingcoldweatherleaf.
 core=(X>=-492.5)&(X< -352.5)
 put(core&(Z>=-30),.77)
 put(core&(Z>=-180)&(Z< -30),1.3)
 if aac:
  put(core&(Z>=-395)&(Z< -180),la)
  put(core&(Z>=-405)&(Z< -395),.87)
 put((X>=-519.5)&(X< -492.5)&(Z>=0),.57)
 put((X>=-352.5)&(X< -152.5)&(Z>=beamtop),.041)
 put((X>=-102.5)&(X<0)&(Z>=beamtop),.77)
 put((X>=-102.5)&(X<0)&(Z>=120)&(Z<270),1.3)
 warm=(X< -519.5)&(Z>=0)
 ix=-np.ones(K.shape,int);ix[K>0]=np.arange(np.count_nonzero(K));nn=(K>0).sum()
 rr=[];cc=[];vv=[];rhs=np.zeros(nn);diag=np.zeros(nn);faces=[]
 for j,i in zip(*np.nonzero(K>0)):
  p=ix[j,i]
  for dj,di in [(1,0),(-1,0),(0,1),(0,-1)]:
   jj,ii=j+dj,i+di
   if not(0<=jj<K.shape[0] and 0<=ii<K.shape[1]):continue # domaincutsadiabatic
   if K[jj,ii]>0:
    g=2*K[j,i]*K[jj,ii]/(K[j,i]+K[jj,ii]);diag[p]+=g;rr.append(p);cc.append(ix[jj,ii]);vv.append(-g)
   else:
    temp=1 if warm[jj,ii] else 0;h=1/.13 if temp else 25
    g=1/((step/2000)/K[j,i]+1/h)*(step/1000)
    diag[p]+=g;rhs[p]+=g*temp;faces.append((p,g,temp))
 rr.extend(np.arange(nn));cc.extend(np.arange(nn));vv.extend(diag)
 T=spsolve(coo_matrix((vv,(rr,cc)),shape=(nn,nn)).tocsr(),rhs)
 qi=sum(g*(1-T[p]) for p,g,t in faces if t);qo=sum(g*T[p] for p,g,t in faces if not t)
 Rfloor=.13+.015/2+.065/1.4+glass/1000/.041+.2/1.75+.04
 Rwall=.13+.027/.57+.14/.77+.2/.041+.04
 floorL=(1800-519.5)/1000;wallH=1.2
 psi=qi-floorL/Rfloor-wallH/Rwall
 return {'glass':glass,'aac':aac,'lambdaAAC':la,'grid':step,'Qroom':qi,'Qoutside':qo,'balance':qi-qo,'UfloorAir':1/Rfloor,'Uwall':1/Rwall,'psi':psi,'floorEffectiveProbe':1/Rfloor+psi*(61.904/93.459),'minimumT':float(T.min()),'maxT':float(T.max())}
cases=[solve(100,False,.29),solve(240,True,.29),solve(360,True,.29),solve(360,True,.5),solve(100,False,.29,2.5),solve(240,True,.29,2.5)]
for c in cases:
 for key,val in c.items():
  if isinstance(val,np.floating):c[key]=float(val)
 assert abs(c['balance'])<1e-8 and 0<=c['minimumT']<=c['maxT']<=1
result={'authority':'Bounded internal2Dair-backed comparison only; NO ISO13370/ENISO10211/house/material/site acceptance. Coupled240AAC trial NOT selected/admitted.',
 'nodeStatus':'Currentprimaryjoint unearned; no beam/node changes adopted. RCpier continuity would bypassAAC unless actual bearing/starter joint is redesigned.',
 'assumptions':{'roomAir':1,'coldAir':0,'filmRsi':.13,'outsideH':25,'masonryLambda':.77,'dpcLambda':1.3,'mortarLambda':.87,'rcLambda':1.75,'stoneLambda':2,'screedLambda':1.4,'plasterLambda':.57,'glassLambda':.041,'AACwetComparator':.29,'AACwetterStress':.5,'domainMm':[-1800,100,-1000,1200],'domainCuts':'Adiabatic; allnonroomvoids treatedcoldventilatedair, no soilcoupling/cavityradiation/watertransient/pointbridges.'},
 'candidateGeometry':{'floor':[15,65,240,200],'floorZ':[0,-15,-80,-320,-520],'aacBlock':[-395,-180],'aacBed':[-405,-395],'dpc':[-180,-30],'beam':[-855,-405],'wallGlassDownTo':-405,'slabAACcontact':[-395,-320],'shortestTopAACToColdSlab':140,'requiredD':1355,'authoredDtrial':1400,'H':300,'constructionLoss':50,'vent':150,'frontSlopingRun':28000,'gardenPathTotal':29750},
 'loadScreen':{'source':'STRowner message/current114.76line/71.138N/1.442M receiver, not finalnodepass','conservativeAllLineOn140Mpa':114.76/140,'fk140M4':5.5,'gammaStress':3,'eccentricReductionStress':2/3,'effectiveDesignStressMpa':5.5/3*2/3,'pierAverageMpa':71.138e3/(260*450),'pierElasticMaxMpa':.892,'pierElasticMinMpa':.324,'pierFailure':'275×440singleunit doesnotcover450receiver; headjointaloneisnotmissingAAC. Fullbed/moment/actualpad/starteranchorage remains unearned.'},
 'sourceEvidence':{'product':'H+H HighStrength7.3/AAC140, traditionalM4 fulljoints (NOT Celfixthinlayer substitution)',
 'BBA':'https://www.hplush.com/fileadmin/UK/Certificates/BBA/BBA_Cert_01_3816_Sheet_2_High_and_Super_Strength__Jan_2026_.pdf',
 'strength':'https://www.hplush.com/fileadmin/UK/TSD_Files/TSD03_Characteristic_strength_of_masonry__Jun_2025_.pdf',
 'EPD':'https://www.hplush.com/fileadmin/UK/EPDs/MLM045.00_EPD_H_H_Celcon_High___Super_Strength_Grade_Products_2024.pdf',
 'materialScope':'EPD99.98%minerals/.02%metals and100yearreference are NOT exactcompletecomposition or1000yearproof. Lubricatedmoulds/gradepaint/mortar/additives remain exactunknown. No syntheticexception.'},
 'grossInternalGeometryProbe':{'floorArea':93.459,'perimeter':61.904,'scope':'Declared rectangleunion estimate for27finish candidate. NOT surveyed/acceptedISOground geometry.'},'cases':cases,
 'decision':'225AAC course +240field materiallyreduces modelheatflow but doesNOTearn completeenvelope recommendation. Field360 alone stillleaves edge penalty; exactreceivingjoint and thermal/materialqualification remain unresolved beforeselection.'}
def output(name,data):
 p=OUT/name
 if '--check' in sys.argv:
  if p.read_text()!=data:raise SystemExit(str(p)+' stale')
 else:p.write_text(data)
output('loggia-ground-thermal.json',json.dumps(result,indent=2)+'\n')
# Actualconstructionprofiles,1:10 atA3. Not a heatmap masquerading asproductevidence.
def rect(x,y,w,h,c):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}" stroke="#475569" stroke-width=".3"/>'
def text(x,y,s,n=3):return f'<text x="{x}" y="{y}" font-size="{n}">{s}</text>'
svg='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><g font-family="Arial,sans-serif" fill="#223747">'
svg+=text(16,16,'Ground thermal junction: full contact geometry before selection',6)+text(16,24,'Matched2Dair-backed finite-volume comparison · actualstructuralnode/receiver NOT earned ·1:10 constructionprofiles atA3',3.3)
for bx,g,a,title in [(128,100,False,'A  FAILED100FIELD / NO AAC CONTROL'),(328,240,True,'B  COUPLED240FIELD +225AAC TRIAL')]:
 X=lambda x:bx+x/10;Z=lambda z:92-z/10;bt=-405 if a else -180
 svg+=text(bx-110,42,title,3.5)
 for x,w,k in [(-519.5,27,'#ece4d5'),(-492.5,140,'#cabaaa'),(-352.5,200,'#f5d57d'),(-152.5,50,'#edf5f6'),(-102.5,102.5,'#b97761')]:
  if x==-519.5:svg+=rect(X(x),Z(450),w/10,45,k)
  else:svg+=rect(X(x),Z(450),w/10,(450-bt)/10,k)
 for off,th,col in [(0,15,'#c7b18b'),(15,65,'#e5dccb'),(80,g,'#f5d57d'),(80+g,200,'#b8c5ce')]:svg+=rect(X(-1100),Z(-off),(1100-492.5)/10,th/10,col)
 svg+=rect(X(-600),Z(bt),60,45,'#b8c5ce')
 svg+=rect(X(-492.5),Z(-30),14,15,'#8c7f9e')
 if a:
  svg+=rect(X(-492.5),Z(-180),14,21.5,'#9dbdac')+rect(X(-492.5),Z(-395),14,1,'#d8cebb')
  svg+=text(bx-110,188,'AAC225incl10bed;sidecontact−320..−395',3)+text(bx-110,195,'only140 fromAACtop−180 to coldslabtop−320.',3)
 else:svg+=text(bx-110,188,'Field380 /beam−180..−630',3)
svg+=text(16,208,'B:beam−405..−855;fieldRC−320..−520 intersectsbeam115 vertically. NoAACthroughcoldweatherleaf or commonbeam.',3)
svg+=text(16,215,'855+H300+loss50+vent150=1355→D1400;28m frontslopingapproach,29.75m gardenrouteincllandings. NOT adopted.',3)
svg+=text(16,226,'5mm model: controlQ1.128/ψ.440;240AACQ.610/ψ.176 W/mK. 360fieldaloneψ.165;wetAAC.50 raisesψ.212.',3)
svg+=text(16,233,'Q subtracts matchedplanarwall/floor to obtainψ. Air-backed/P-A probe is NOT ISO13370 whole-floor U or a compliance verdict.',3)
svg+=text(16,240,'ActualRCpier continuity bypassesAAC;71.138kN/1.442kNm receiver max.892MPa and full450footprint/anchorage must be earned.',3)
svg+=text(16,247,'H+H Jan2026BBA gives.18protected/.19exposed/.29belowground;use.29here. EPDlubricatedmould/gradepaint residues unqualified.',3)
svg+=text(16,254,'TraditionalM4 fullbeds/perps, independent150DPC, floorair/gas/rain paths remain distinct. No thin-joint/polymer exception assumed.',3)
svg+=text(16,265,'Decision: usefulcoupledbenefit, insufficient for wholeenvelope recommendation. Pause at explicitjoint/thermal/material limits.',3)
svg+='<line x1="16" y1="279" x2="66" y2="279" stroke="#223747"/>'+text(16,286,'500modelmm=50paper mm; source/assumptions/results: loggia-ground-thermal.py/.json',2.8)+'</g></svg>\n'
output('loggia-ground-thermal.svg',svg)
print(json.dumps({'cases':[{k:c[k] for k in ['glass','aac','lambdaAAC','grid','Qroom','psi','floorEffectiveProbe']} for c in cases]},indent=2))

