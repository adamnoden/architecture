"""One current complete PERINSUL course, using the same finite-volume solver as AAC."""
from pathlib import Path
import ast,json,sys,math
here=Path(__file__).resolve().parent
source=ast.parse((here/'loggia-ground-thermal.py').read_text())
# Load the common solver and its imports without running its six archived control cases.
ns={};exec(compile(ast.Module(body=[n for n in source.body if isinstance(n,(ast.Import,ast.ImportFrom,ast.FunctionDef))],type_ignores=[]),'loggia-ground-thermal.py','exec'),ns)
course={'width':360,'height':140,'lambda':.068,'beamTop':-380,'top':-230,'dpcTop':-80,'axis':-420}
cases=[]
for label,width,axis in [('stock215',215,-422.5),('factoryScope360',360,-420)]:
 for grid in (5,2.5):
  c={**course,'width':width,'axis':axis};r=ns['solve'](320,False,.29,grid,c);r['courseIdentity']=label;r['course']=c;cases.append(r)
for case in cases:
 for k,v in case.items():
  if hasattr(v,'item'):case[k]=v.item()
 assert abs(case['balance'])<1e-8
G=2*.14*3.1*20+2*7.5*3.585/2+10;Q=2*2*3.585/2+3;N=1.35*G+1.5*Q
screens=[]
for gamma in (3,2.7,2.3):
 t=212;e=7+1.5;phi=1/(1+6*e/t)
 screens.append({'gammaM':gamma,'brittleFactorStress':1.2,'minimumWidth':t,'eccentricityStress':e,'phi':phi,'fk':1.6,'NRdKnPerM':phi*t*1.6/(gamma*1.2),'demandKnPerM':N})
v={'status':'Comparison only. Complete current product retained; no material/structural admission or ground recommendation.',
 'sources':{'PDS':'https://www.foamglas.com/-/media/project/foamglas/public/shared/files/foamglas-b/perinsul-hl/pds/pds-perinsul-hl-uk.pdf','PDSEdition':'22 October2025','ETA':'https://www.foamglas.com/-/media/project/foamglas/public/shared/files/certifications/b---common-certificates/eta-180636-perinsul-hl.pdf','ETAedition':'18/0636 version03,22April2025','oldGuidelineLimit':'TG2April2017 and BBA2019 are not substituted for current facing/thermal/shear values.'},
 'geometry':{'completeCourse':course,'courseZ':[-370,-230],'M10bottomBed':[-380,-370],'independentDenseDpcZ':[-230,-80],'receivingDpcWidth':360,'wallWidthAbove':140,'bearingFaces':[-600,-240],'floorLayers':[15,65,320,200],'floorRC':[-600,-400],'beam':[-830,-380],'slabBeamOverlap':200,'coldContact':'DPC TOP−80 preserves FULL15+65 above widened receivingfoot; no50mm screed deletion. Field RC begins−400 below course−370. Commonbeam/outerleaf retained. Wider receivingDPC locally replaces floorinsulation and increases heatflow.','DStress':{'deepest':830,'heave':300,'loss':50,'vent':150,'required':1330,'trial':1400,'remaining':70,'limitation':'Current fullfoundation/pile/pier receivingjoint remains unproved; D1400 not selected.'}},
 'fullMakeup':'Cellular-glass core plus upper/lower bitumen coating and retained green printed PE/glass-fleece liner. PE is polyethylene. Exact bitumen modifiers/printing/fleece sizing quantities unknown; bitumen is not automatically synthetic polymer. No stripping, no exception assumed.',
 'joint':'Single linear course, full M10 beds with actual compatible masonry; tight dry butt joints per manufacturer system detail. Separate DPC retained; no product capillarity-to-complete-DPC inference. Exact mortar/waterproofing/receiving chemistry and the outer-leaf/cavity transition remain.',
 'structural':{'source':'Current ETA Table3 solid Group1 clay15/M10 gives fk1.6; unit mean2.9 is not fd. Current Table4 fvko.05/friction.40, not oldBBA.13/.35.','load':{'G':G,'Q':Q,'innerNuls':N,'wetReceiverN':71.138,'wetReceiverM':1.442,'receiverFootprint':[260,450]},'screens':screens,'failure':'Stock215 course cannot directly support260-wide RC receiver. Width/tolerance/eccentricity and moment transfer need actual spreader/joint; continuing RC bypasses it. Gamma3 stress fails wall demand; lower gamma sensitivity does not select execution class or NA.','factoryScope':'ETA permits90–365width/5steps and50–200height, but currentUKPDS stocks≤215. Factory360 is a bounded geometry within assessment scope, NOT confirmed supply/qualification. Single course retained; no side-by-side two-row assumption.', 'creep':'ETA100high tested1.2MPa≥1yr:0.1creep/1.0totalmm at50yr extrapolation; residual mean1.4 after long load. No transfer to1000yr or full pier joint.','thermalDataLimit':'Current text/PDSλ.068 used in both directions conservatively. ETA AnnexIII retains older R values inconsistent with.068; not imported.'},
 'method':'Same air-backed2D solver/contact model as AAC. Matched planar subtraction, no soil/ISO13370, cavity radiation or point bridges. Effective P/A number is an authored probe, not regulatory U.',
 'widerCapacityScreen':{'minimumWidth':357,'eccentricityStress':11,'phi':1/(1+6*11/357),'NRdKnPerM':357*1.6/3/1.2/(1+6*11/357),'limit':'Full360wide M10/masonry spreader fan and260x450 receiver require actual N/M/shear/positivecontact. No continuing RC/starter through thermalcourse.'},
 'cases':cases,'decision':'Much stronger thermal course than AAC per depth is a credible comparison. It does not earn a whole-envelope selection: retained PE conflicts with current no-synthetic policy and current stock width/RC receiving continuity fails the joined pier application. D1600/half-metre field is NOT selected merely because AAC was weak.'}
v['pointReceivers']=[]
for name,Nk,M in [('wet',71.138,1.442),('midpost',72.489,2.222)]:
 ex=M/Nk*1000+11;ey=8.5;t=357;l=647
 v['pointReceivers'].append({'name':name,'Nkn':Nk,'Mknm':M,'minimumFootprint':[t,l],'ex':ex,'ey':ey,'elasticMaxMpa':Nk*1000/(t*l)*(1+6*ex/t+6*ey/l),'stressComparator':1.6/3/1.2,'verdict':'FAIL this360x650foot. Full internal M assigned conservatively; no invented pinned/rocker release.'})
v['targetCalibration']={'authoredTarget':.18,'scope':'Combined air-backed planar+psi*P/A design stress only. Not identical to statutory floor-U test.','currentEnglandBackstop':{'edition':'ADL2021 incorporating2023 amendments','table':'4.1','floor':.18,'roof':.16,'source':'https://assets.publishing.service.gov.uk/media/662a2e3e55e1582b6ca7e592/Approved_Document_L__Conservation_of_fuel_and_power__Volume_1_Dwellings__2021_edition_incorporating_2023_amendments.pdf'},'2026Commencement':'24March2027 ordinary England work, subject transition; site/application/date not established here.','methodLimit':'Actual ground/void ISO13370/BR443 and thermal-bridge/whole-dwelling accounting must be resolved. Neither air-planar U nor this P/Aprobe is compliance proof.'}
def out(p,s):
 p=here/p
 if '--check' in sys.argv:
  if p.read_text()!=s:raise SystemExit(str(p)+' stale')
 else:p.write_text(s)
out('loggia-cellular-bearing.json',json.dumps(v,indent=2)+'\n')
def rect(x,y,w,h,col):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{col}" stroke="#42586a" stroke-width=".2"/>'
def text(x,y,s,n=3):return f'<text x="{x}" y="{y}" font-size="{n}">{s}</text>'
svg='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><g font-family="Arial,sans-serif" fill="#203746">'
svg+=text(15,15,'Complete cellular-glass bearing comparison · actual contact geometry',5)+text(15,24,'1:10 construction profiles. No material/admission pass. Current ETA03/PDS2025, no stripped coating/liner.',3.4)
for bx,w,axis,title in [(130,215,-422.5,'A  STOCK215: CURRENT LOAD FAILURE'),(330,360,-420,'B  ONE FACTORY-SCOPE360 GEOMETRY')]:
 X=lambda x:bx+x/10;Z=lambda z:90-z/10
 svg+=text(bx-112,40,title,3.6)
 for x,ww,col in [(-519.5,27,'#e8dfd0'),(-492.5,140,'#c7b8a5'),(-352.5,200,'#f1d17c'),(-152.5,50,'#eef5f5'),(-102.5,102.5,'#b97560')]:
  top,bottom=(400,0) if ww==27 else (400,-380)
  svg+=rect(X(x),Z(top),ww/10,(top-bottom)/10,col)
 for off,th,col in [(0,15,'#c7b18d'),(15,65,'#e5dccc'),(80,320,'#f1d17c'),(400,200,'#b6c3cc')]:svg+=rect(X(-1100),Z(-off),(1100-492.5)/10,th/10,col)
 svg+=rect(X(-600),Z(-380),60,45,'#b6c3cc')
 svg+=rect(X(axis-w/2),Z(-80),w/10,15,'#8f809b')+rect(X(axis-w/2),Z(-230),w/10,14,'#91b2a4')+rect(X(axis-w/2),Z(-370),w/10,1,'#d8cbbb')
 svg+=text(bx-112,183,f'{w}width; DPC−230..−80; course−370..−230',3)
 svg+=text(bx-112,190,'FULL15+65 above widenedfoot; no screed deletion.',3)
 c=next(x for x in cases if x['course']['width']==w and x['grid']==2.5)
 svg+=text(bx-112,199,f'2.5grid: Q{c["Qroom"]:.4f} / psi{c["psi"]:.4f} W/mK',3)
 svg+=text(bx-112,206,f'Air-planar U{c["UfloorAir"]:.4f}; P/Aprobe{c["floorEffectiveProbe"]:.4f}',3)
svg+=text(15,218,'Wider course earns a possible load footprint but also widens the warm mineral receiving/DPC path: thermal benefit is not isolatedR.',3)
svg+=text(15,225,'Beam−830..−380; fieldRC−600..−400 overlaps200.830+H300+loss50+vent150=1330→D1400 CONTROL, not selected.',3)
svg+=text(15,232,'Stock min212/e8.5: gamma3+brittle1.2 gives75.95&lt;88.49kN/m. Factory min357/e11 gives~134, before fullbearing/N-M/shear.',3)
svg+=text(15,239,'ETA factory widths90–365; current UK stock only≤215.360 supply/currentvariant unconfirmed; no two-row or stripped-product shortcut.',3)
svg+=text(15,246,'Complete product retains bitumen +printed PE/glass fleece. PE conflicts with policy; bitumen formulation/sizing remain exactunknown.',3)
svg+=text(15,253,'360×650pointfoot FAILS: wet.494 /midpost.558MPa&gt;.444; fullM retained. ContinuingRC/starter would bypass course.',3)
svg+=text(15,260,'Authored combined P/A target.18 is NOT statutory floorU. England ADL2021+2023 Table4.1 floor.18/roof.16 are separate backstops.',3)
svg+=text(15,267,'Air-backed2D excludes soil/void/radiation/pointbridges; ISO13370/BR443 and whole-energy accounting remain distinct. D1600 unselected.',3)
svg+='</g></svg>\n';out('loggia-cellular-bearing.svg',svg)
print(json.dumps({'cases':cases,'load':N,'screens':screens},indent=2))
