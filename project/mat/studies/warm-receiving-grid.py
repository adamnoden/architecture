"""One warm receiving-grid concept; source-bound geometry/load and air-backed heat probes."""
from pathlib import Path
import json,math,sys
import numpy as np
from scipy.sparse import coo_matrix
from scipy.sparse.linalg import spsolve
OUT=Path(__file__).resolve().parent
BASE='f462415c6832e6470fdb7045e2f9b2e207b700df'
STR='5ffcc6b28251cdd0732fa634b090568ea456f4b7'
MAIN='6a3c15d6ffb8dac628c42533ba7ea64ac0de2cce'

def thermal(kind,la,step=5):
 x=np.arange(-1800+step/2,500 if kind=='perimeter' else 1800,step)
 z=np.arange(-1600+step/2,1200,step);X,Z=np.meshgrid(x,z);K=np.zeros(X.shape)
 def put(mask,k):K[mask]=k
 if kind=='perimeter':
  wall=(X>=-492.5)&(X< -352.5);room=X< -519.5
  beam=(X>=-572.5)&(X< -272.5);bearing=beam
  put((X< -492.5)&(Z>=-15)&(Z<0),2);put((X< -492.5)&(Z>=-80)&(Z< -15),1.4)
  put((X< -492.5)&(Z>=-280)&(Z< -80),1.75)
  put((X< -492.5)&(Z>=-600)&(Z< -280),.041)
  put((X>=-801.25)&(X<48.75)&(Z>=-1065)&(Z< -765),1.75)
  put(wall&(Z>=-80),.77);put((X>=-519.5)&(X< -492.5)&(Z>=0),.57)
  put((X>=-352.5)&(X< -152.5)&(Z>=-80),.041)
  put((X>=-102.5)&(X<0)&(Z>=-765),.77)
  put((X>=-102.5)&(X<0)&(Z>=120)&(Z<270),1.3)
  # Actual120cheek, not an unchanged200label around a wider warm beam.
  put((X>=-272.5)&(X< -152.5)&(Z>=-765)&(Z< -80),.041)
  put((X>=-692.5)&(X< -572.5)&(Z>=-765)&(Z< -280),.041)
  warm=room&(Z>=0);floorL=(1800-519.5)/1000;wallL=1.2
 else:
  wall=(X>=-70)&(X<70);room=(X< -97)|(X>=97)
  beam=(X>=-220)&(X<220);bearing=(X>=-150)&(X<150)
  put(((X< -70)|(X>=70))&(Z>=-15)&(Z<0),2);put(((X< -70)|(X>=70))&(Z>=-80)&(Z< -15),1.4)
  put((Z>=-280)&(Z< -80),1.75);put((Z>=-600)&(Z< -280),.041)
  put((X>=-300)&(X<300)&(Z>=-1065)&(Z< -765),1.75)
  put(wall&(Z>=-80),.77)
  put((((X>=-97)&(X< -70))|((X>=70)&(X<97)))&(Z>=0),.57)
  # Full385glass shoulder infill; no cold void under the70warm overhangs.
  put((X>=-340)&(X<340)&(Z>=-765)&(Z< -280),.041)
  warm=room&(Z>=0);floorL=2*(1800-97)/1000;wallL=0
 put(beam&(Z>=-380)&(Z< -80),1.75)
 put(bearing&(Z>=-605)&(Z< -390),la)
 put(bearing&(Z>=-390)&(Z< -380),.87)
 put(bearing&(Z>=-615)&(Z< -605),.87)
 put(bearing&(Z>=-765)&(Z< -615),1.3)
 assert np.all(K[((X< -352.5) if kind=='perimeter' else np.ones(X.shape,bool))&(Z>=-80)&(Z<0)]>0), 'No coldair slot under plaster/finish is part of this geometry'
 ix=-np.ones(K.shape,int);ix[K>0]=np.arange(np.count_nonzero(K));nn=(K>0).sum()
 rr=[];cc=[];vv=[];rhs=np.zeros(nn);diag=np.zeros(nn);faces=[]
 for j,i in zip(*np.nonzero(K>0)):
  p=ix[j,i]
  for dj,di in [(1,0),(-1,0),(0,1),(0,-1)]:
   jj,ii=j+dj,i+di
   if not(0<=jj<K.shape[0] and 0<=ii<K.shape[1]):continue
   if K[jj,ii]>0:
    g=2*K[j,i]*K[jj,ii]/(K[j,i]+K[jj,ii]);diag[p]+=g;rr.append(p);cc.append(ix[jj,ii]);vv.append(-g)
   else:
    temp=1 if warm[jj,ii] else 0;h=1/.13 if temp else 25
    g=1/((step/2000)/K[j,i]+1/h)*(step/1000)
    diag[p]+=g;rhs[p]+=g*temp;faces.append((p,g,temp))
 rr.extend(np.arange(nn));cc.extend(np.arange(nn));vv.extend(diag)
 T=spsolve(coo_matrix((vv,(rr,cc)),shape=(nn,nn)).tocsr(),rhs)
 qi=sum(g*(1-T[p]) for p,g,t in faces if t);qo=sum(g*T[p] for p,g,t in faces if not t)
 Rfloor=.13+.015/2+.065/1.4+.2/1.75+.32/.041+.04
 Rwall=.13+.027/.57+.14/.77+.2/.041+.04
 assert abs(qi-qo)<1e-8
 return {'kind':kind,'AACLambda':la,'grid':step,'Qroom':float(qi),'Qoutside':float(qo),'balance':float(qi-qo),'planarFloorU':1/Rfloor,'psi':float(qi-floorL/Rfloor-wallL/Rwall),'limit':'Air-backed2D only; allnonroomvoidscold, no soil/radiation/pointbridges or ISO13370 compliance. Internal bearing-line losses must be summed separately, not hidden in perimeterP/A.'}

qmax=88.489125+1.35*(.44*.3*25);qmin=.9*(54.2475+.44*.3*25);t=297
receivers=[]
for name,N,M,L in [('wet',71.13795,1.442435,1044),('stair',72.48863,2.22228,844)]:
 ex=M/N*1000+20+5;ey=5;point=N*1000/(t*L)
 receivers.append({'name':name,'N_ULS':N,'M_ULS':M,'lineULSIncludingWarmGirder':qmax,'lineMinGIncludingWarmGirder':qmin,'effectiveWidth':t,'effectiveLength':L,'ex':ex,'ey':ey,'maxMpa':qmax/t+point*(1+6*ex/t+6*ey/L),'minEnvelopeMpa':qmin/t+point*(1-6*ex/t-6*ey/L),'fdComparator':4.9/3,'limit':'Concept45degreefan through300warmRC; actual reinforcedspreader/foundationelasticity/contact/shear/creep unproved. FullM retained; minimum0.9Gline combinedadversarially withmaxpointenvelope, not a normative combination.'})
cases=[thermal(k,la) for la in (.29,.18) for k in ('perimeter','internal')]+[thermal(k,.29,2.5) for k in ('perimeter','internal')]
v={'status':'ONE unadopted warm receiving concept. Not foundation selection, fulljunction proof, material admission or sitefact.',
 'source':{'startingMain':BASE,'currentMain':MAIN,'STRloadSource':STR,'ownership':'MAT geometry/thermal/constituents; STR owns warm/cold receiver/frame/cap and actual load/envelope design. No STR source changed.'},
 'recipe':{'floorRoomToVoid':[15,65,200,320],'floorZ':[0,-15,-80,-280,-600],'warmGridTop':-80,'warmGridSoffit':-380,'perimeterWidth':300,'internalReceivingWidth':440,'AACsingleUnit':[440,300,215],'AACZ':[-605,-390],'M4beds':[[-615,-605],[-390,-380]],'mineralDPC':[-765,-615],'DPCrecipe':'Two65 solid Ketley WCBL65 engineering-brick courses plus two10 M4 beds; actual300-wide bonded full/cut unit arrangement and compression/capillary/bond evidence remain unqualified. Authored thermal lambda1.3, not a declared product value.','coldBeamTop':-765,'coldBeamSoffitHypothesis':-1065,'coldPerimeterWidthHypothesis':850,'coldInternalWidthHypothesis':600,'cheeks':120,'shoulderFill':'Internal440beam over300bearing:70shoulders eachside filled385glass (200+185cutfrom200stock); no coldair pocket or load throughglass. Sidecheeks down toDPCbottom. Exactretain/joints unqualified.', 'weatherLeaf':'Independent coldweatherleaf load on widenedcoldreceiver; never on warmfloor/foam. No coldtie/starter crossesAAC/DPC toshortcircuit it.'},
 'depth':{'memberOnlyLowest':1065,'heaveStress':300,'constructionLoss':50,'ventilation':150,'memberOnlyRequired':1565,'memberOnlyDcost':1600,'actualLowestColdCap':'Not frozen. A deeper finite coldreceiver/node governs if required; member-onlyD1600 is NOT earned wholehouse clearance. No unchanged570cap quietly inherited or deleted.'},
 'product':{'identity':'H+H HighStrength7.3 foundationblock440×215face/300width,730kg/m3. Existing product, not new catalogue.', 'page':'https://www.hplush.com/en-uk/aircrete/products/foundation-blocks','datasheet':'https://www.hplush.com/fileadmin/UK/Datasheets_Factsheets/MLM012.00_H_H_datasheet_-_FOUNDATION_BLOCKS_2023_2025.pdf','strength':'https://www.hplush.com/fileadmin/UK/TSD_Files/TSD03_Characteristic_strength_of_masonry__Jun_2025_.pdf','strengthScope':'June2025EC6Table3,215height/250+width HighStrengthM4 fk4.9; NOT unitmean7.3 or withdrawnBS5628table. Gamma3 retained.','thermal':'Producerbelowground.29 used asstress; protectedaboveDPC.18 is sensitivity only, not a retained dry installation assumption.','joints':'FullM4beds/perps selected, not marketingpermission toomit belowgroundperps. Exactmortar formulation/gradepaint/mouldrelease/creep still require disclosed evidence; no syntheticexception.'},
 'receivers':receivers,'thermalCases':cases,
 'internalLimits':['Warm pier/floor/grillage must be monolithic above course; actual positivecontact/lateralrestraint/shear and movement-compatiblecoldfoundation are designrequirements, not inventedpinnedbase.','Credible deepestcoldreceiver/actualweatherleafsupport must be supplied bySTR beforefreezingD/approachcost.','Currentthreshold105mineral-seat detail cannot be copied toRCtop−80; localpan/support/air/DPC join mustbe redrawn ifthisconceptsurvives.','Field/moisture/air/gas functions and lateralDPC/cavity/door transitions still need actual joints; loosebareglass is not a sealed boundary.'],
 'decision':'Arrangement removes directcoldRCpier bypass in concept and moves pointbearing into an actual warmspreader problem. Receiver screens and both internal/perimeter heatpaths are shown. No whole-envelope recommendation or depth is selected.'}
def out(name,data):
 p=OUT/name
 if '--check' in sys.argv:
  if p.read_text()!=data:raise SystemExit(str(p)+' stale')
 else:p.write_text(data)
out('warm-receiving-grid.json',json.dumps(v,indent=2)+'\n')
def rect(x,y,w,h,c):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c}" stroke="#42596c" stroke-width=".2"/>'
def txt(x,y,s,n=3):return f'<text x="{x}" y="{y}" font-size="{n}">{s}</text>'
svg='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><g font-family="Arial,sans-serif" fill="#203746">'
svg+=txt(15,15,'ONE WARM RECEIVING GRID · actual pointbearing / thermal contact',5)+txt(15,24,'Unadopted foundation concept ·1:10 profiles · no coldstarter throughcourse / no inventedrocker / no D selection',3.4)
for bx,internal,title in [(135,False,'A  PERIMETER300 / WEATHERLEAF SEPARATE'),(335,True,'B  INTERNAL440 / CONTINUOUS RECEIVING LINE')]:
 X=lambda x:bx+x/10;Z=lambda z:80-z/10
 svg+=txt(bx-115,39,title,3.4)
 if not internal:
  for x,w,c in [(-519.5,27,'#e7ddca'),(-492.5,140,'#cabaa5'),(-352.5,200,'#ecd17a'),(-102.5,102.5,'#b87962')]:svg+=rect(X(x),Z(300),w/10,(300+(765 if x==-102.5 else 80))/10,c)
  left,right,bl,br,al,ar,cl,cr=-1100,-492.5,-572.5,-272.5,-572.5,-272.5,-801.25,48.75
 else:left,right,bl,br,al,ar,cl,cr=-1000,700,-220,220,-150,150,-300,300
 svg+=rect(X(left),Z(0),(right-left)/10,8,'#ded1b9')+rect(X(left),Z(-80),(right-left)/10,20,'#c2ced6')+rect(X(left),Z(-280),(right-left)/10,32,'#ecd17a')
 if internal:svg+=rect(X(-340),Z(-380),68,38.5,'#ecd17a')
 else:svg+=rect(X(-692.5),Z(-280),12,48.5,'#ecd17a')+rect(X(-272.5),Z(-80),12,68.5,'#ecd17a')
 svg+=rect(X(bl),Z(-80),(br-bl)/10,30,'#a6bdcc')+rect(X(al),Z(-390),(ar-al)/10,21.5,'#9bb8a7')+rect(X(al),Z(-380),(ar-al)/10,1,'#d9cbb3')+rect(X(al),Z(-605),(ar-al)/10,1,'#d9cbb3')+rect(X(al),Z(-615),(ar-al)/10,15,'#8e809b')+rect(X(cl),Z(-765),(cr-cl)/10,30,'#c2ced6')
 if internal:
  svg+=rect(X(-70),Z(300),14,38,'#cabaa5')+rect(X(-97),Z(300),2.7,30,'#e7ddca')+rect(X(70),Z(300),2.7,30,'#e7ddca')
  svg+=txt(bx-115,47,'140 wall shown; local RC point receiver is a separate 3D bridge.',2.8)
 svg+=txt(bx-115,198,'WarmRC−80..−380 /AAC−605..−390 /DPC−765..−615.',2.9)
for i,c in enumerate(cases[:4]):svg+=txt(15,215+i*7,f'{c["kind"]} /AAC lambda{c["AACLambda"]}: Q{c["Qroom"]:.4f}, psi{c["psi"]:.4f} W/mK; field air-U{c["planarFloorU"]:.4f}',3)
svg+=txt(15,244,'2.5 mm refinement: outer/internal psi '+str(round(cases[4]['psi'],5))+'/'+str(round(cases[5]['psi'],5))+'; all energy balances checked.',3)
svg+=txt(15,250,'Internalbearing-line losses must be added: a perimeterP/A probe alone cannot claim this whole floor. No ISO13370/compliance result.',3)+txt(15,258,'Member-only−1065+H300+loss50+vent150=1565→D1600 COST; actualdeepercoldnode/cap still controls andmust be earned.',3)+txt(15,266,'FullRCspreader/contact/shear/creep and threshold/air/gas/cavityjoints remain internal work. This is one constructive geometry, not productselection.',3)+txt(15,274,'Yellow glass / blue RC / green AAC / purple mineral DPC / brown masonry; 10 mm beds shown. Geometry and loads remain conditional.',3)+'</g></svg>\n'
out('warm-receiving-grid.svg',svg)
print(json.dumps({'receivers':receivers,'thermalCases':cases},indent=2))
