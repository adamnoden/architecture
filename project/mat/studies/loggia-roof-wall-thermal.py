"""Conditional 2D heat-flow screen at the ordinary roof/collector/wall edge.

This is a dry steady-state comparison, not ISO 10211/13788, a condensation
assessment, a whole-roof U-value or a product/fire/material admission.
"""
from pathlib import Path
import hashlib, json, math, subprocess, sys
import numpy as np
from scipy.sparse import coo_matrix
from scipy.sparse.linalg import spsolve

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
EDGE=HERE/'loggia-roof-edge.json'
HAD=ROOT/'project/had/studies/open-north-loggia.json'
STR=ROOT/'project/str/studies/open-loggia-support.json'
EXPECTED_BLOBS={'HAD':'25faad2c4d40df2b7da7212f73808843a88d2f52',
                'STR':'20dec4384d09a0d02075fdd34a247e775532763b',
                'MATroofEdge':'731c85d24e775259f1cf84d264d4ceaf75d89774'}
def git(*args):return subprocess.check_output(['git',*args],cwd=ROOT,text=True).strip()
def blob(raw):return hashlib.sha1(f'blob {len(raw)}\0'.encode()+raw).hexdigest()
def tracked(path):
 raw=path.read_bytes(); rel=str(path.relative_to(ROOT)); commit=git('log','-1','--format=%H','--',rel)
 assert blob(raw)==git('rev-parse',f'{commit}:{rel}'),f'{rel} differs from tracked source'
 return dict(path=rel,commit=commit,blob=blob(raw))
source={name:tracked(p) for name,p in [('HAD',HAD),('STR',STR),('MATroofEdge',EDGE)]}
for name,identity in source.items():assert identity['blob']==EXPECTED_BLOBS[name],f'{name} source changed; deliberately rebind and rerun'
e=json.loads(EDGE.read_text()); h=json.loads(HAD.read_text()); st=json.loads(STR.read_text())['actual_roof']
old_str_raw=subprocess.check_output(['git','show','9867b1994533f0d0f3114919225aa89b50eb2f1a:project/str/studies/open-loggia-support.json'],cwd=ROOT)
assert blob(old_str_raw)=='f2414b24637533e93a0be9d0e0e639a899d18803'
oldst=json.loads(old_str_raw)['actual_roof']
for field in ('north_frames_x','seat_y','normal_recipe','total_normal','primary_centre','ordinary_tie','purlin_rows','roof_extent_from_seat'):
 assert oldst[field]==st[field],f'STR {field} changed; thermal geometry must be revised'
for field in ('section','top','bottom','ordinary_core','projection_each','clear_window_max','seats_each','axis_span'):
 assert oldst['collector'][field]==st['collector'][field],f'STR collector {field} changed'
assert e['ordinaryWall']['roomToWeather']==[27,140,110,50,102.5]
assert h['envelope']==429.5 and h['roofDevelopment']['totalNormal']==500.7
assert e['collector']['bounds']==[202.5,462.5,6540,6680]
assert e['ceiling']['top']==6620 and e['ceiling']['finished']==6444 and e['ceiling']['completeDepth']==176
assert st['collector']['section']['b']==260 and st['north_frames_x']==e['air']['primaryFrame']['axesX']
assert st['collector']['top']==6680 and st['collector']['bottom']==6540
assert st['collector']['projection_each']==60 and st['collector']['actual_offset_requires_links'] is True
assert st['collector']['concrete_only_actual_shear_pass'] is False
assert math.isclose(oldst['collector']['V'],12.1503375) and math.isclose(st['collector']['V'],20.48955360576923)
PITCH=math.radians(25); TAN=math.tan(PITCH); COS=math.cos(PITCH)
def rz(q,d):return 7100+q*TAN-d/COS
# All dimensions in mm. The finite computational cut is adiabatic at q=1200,
# z=5900 and z=7900; both horizontal and lower-cut sensitivity are reported.
Q0,Q1,Z0,Z1=-300.,1200.,5900.,7900.
BOARD_AVCL_NORMAL=25/(24/.14+1/15.)
LAMBDA={'brick':.77,'core':.77,'plaster':.57,'glass':.041,'RC':1.75,
        'boardAVCLnormal':BOARD_AVCL_NORMAL,'steel':15.}
FILM={'inside':.13,'outside':.04} # Authored R in m2 K/W, not a declared compliance setup.
T_IN,T_OUT=20.,0. # Linear solver: results also reported as temperature factors.

def geometry(step,collector=True,frame=False,void_k=.10,ceiling_k=.06,q_end=Q1,z_start=Z0):
 q=np.arange(Q0+step/2,q_end,step); z=np.arange(z_start+step/2,Z1,step)
 Q,Z=np.meshgrid(q,z); sh=Q.shape
 # 0: outside fixed air; 1: inside fixed air; 2: unknown void;
 # 3+: named solids. A missing cavity/wall-head cap is not silently sealed:
 # the joined glass profile itself is a conditional closure hypothesis.
 names=['outside','inside','void','brick','core','plaster','glass','RC','boardAVCLnormal','steel','ceiling']
 ids={n:i for i,n in enumerate(names)}
 M=np.full(sh,ids['void'],np.int8)
 M[Q<152.5]=ids['outside']
 M[(Q>429.5)&(Z<6620)]=ids['inside']
 top=rz(Q,0); vent=rz(Q,75.7); glassbottom=rz(Q,395.7); deckbottom=rz(Q,420.7)
 M[Z>top]=ids['outside']
 # The vent is exterior-connected in this dry heat screen. Zinc and open
 # boards are on its cold side and not credited as additional insulation.
 M[(Z>=vent)&(Z<=top)]=ids['outside']
 wall=(Z>=z_start)&(Z<deckbottom)
 M[wall&(Q>=0)&(Q<102.5)&(Z<6900)]=ids['brick']
 M[wall&(Q>=102.5)&(Q<152.5)]=ids['outside'] # drained cavity, no closed-air R
 M[wall&(Q>=152.5)&(Q<262.5)&(Z<glassbottom)]=ids['glass']
 M[wall&(Q>=262.5)&(Q<402.5)]=ids['core']
 M[wall&(Q>=402.5)&(Q<429.5)]=ids['plaster']
 # Conditional bevelled roof-to-wall glass contact. Roof glass ends at
 # q152.5, lowerboards at q262.5, exactly as the edge source describes.
 M[(Q>=152.5)&(Z<vent)&(Z>=glassbottom)]=ids['glass']
 # 24 board + 1 AVCL is subgrid at 5 mm. Use its exact *normal* series
 # resistance through a 25 mm zone. No lateral steel-sheet fin is credited.
 M[(Q>=262.5)&(Z<glassbottom)&(Z>=deckbottom)]=ids['boardAVCLnormal']
 # The complete RC collector displaces the 110 wall glass to a 50 neck.
 # The alternate no-collector state is a model reference, not a design option.
 if collector:
  M[(Q>=202.5)&(Q<462.5)&(Z>=6540)&(Z<6680)]=ids['RC']
  M[(Q>=462.5)&(Q<489.5)&(Z>=6540)&(Z<6680)]=ids['plaster']
 # The 176 protected ceiling is an actual occupied volume. Its classified
 # 2x12 skins/140 web/12 fillets and 100 wool are not equivalent to one
 # homogeneous k: the bracket is an explicit effective-property sensitivity.
 M[(Q>=489.5)&(Z>=6444)&(Z<6620)]=ids['ceiling']
 if frame:
  # Deliberately severe infinite-depth frame-plane bound: a *solid* 80 mm
  # steel strip below the deck. Actual hollow SHS, discrete frames, collars
  # and lateral 3D heat spreading are NOT represented by this bound.
  M[(Q>=332.5)&(Z<deckbottom)&(Z>=rz(Q,500.7))]=ids['steel']
 k=np.zeros(sh)
 for n,val in LAMBDA.items():k[M==ids[n]]=val
 k[M==ids['void']]=void_k;k[M==ids['ceiling']]=ceiling_k
 return q,z,M,k,ids

def solve(step,collector=True,frame=False,void_k=.10,ceiling_k=.06,q_end=Q1,z_start=Z0):
 q,z,M,k,ids=geometry(step,collector,frame,void_k,ceiling_k,q_end,z_start)
 assert not np.any(((M[:,:-1]==0)&(M[:,1:]==1))|((M[:,:-1]==1)&(M[:,1:]==0)))
 assert not np.any(((M[:-1,:]==0)&(M[1:,:]==1))|((M[:-1,:]==1)&(M[1:,:]==0)))
 nz,nq=M.shape; active=M>=2
 ix=np.full(M.shape,-1,np.int32);ix[active]=np.arange(active.sum())
 row=[];col=[];val=[];b=np.zeros(active.sum());diag=np.zeros(active.sum())
 # Unique cell pairs, harmonic conduction in solids; half-cell plus film
 # resistance at a fixed-air boundary. Face length is step/1000 m.
 for da,db in [(0,1),(1,0)]:
  if da==0:
   a=(slice(None),slice(None,-1));c=(slice(None),slice(1,None))
  else:
   a=(slice(None,-1),slice(None));c=(slice(1,None),slice(None))
  ia=ix[a].ravel();ib=ix[c].ravel();ka=k[a].ravel();kb=k[c].ravel();ma=M[a].ravel();mb=M[c].ravel()
  both=(ia>=0)&(ib>=0)
  aa=ia[both];bb=ib[both]
  g=2*ka[both]*kb[both]/(ka[both]+kb[both]) # face length / centre distance cancels
  np.add.at(diag,aa,g);np.add.at(diag,bb,g)
  row.extend([aa,bb]);col.extend([bb,aa]);val.extend([-g,-g])
  for live,fix,kl,ml,mf in [(ia,ib,ka,ma,mb),(ib,ia,kb,mb,ma)]:
   edge=(live>=0)&(fix<0)
   if not np.any(edge):continue
   rr=live[edge];r=np.where(mf[edge]==1,FILM['inside'],FILM['outside'])
   gg=(step/1000)/(step/2000/kl[edge]+r)
   np.add.at(diag,rr,gg);np.add.at(b,rr,gg*np.where(mf[edge]==1,T_IN,T_OUT))
 row.append(np.arange(active.sum()));col.append(np.arange(active.sum()));val.append(diag)
 A=coo_matrix((np.concatenate(val),(np.concatenate(row),np.concatenate(col))),shape=(active.sum(),)*2).tocsr()
 T=np.full(M.shape,np.nan);T[M==0]=T_OUT;T[M==1]=T_IN;T[active]=spsolve(A,b)
 flux={'inside':0.,'outside':0.};surf={'inside':[],'outside':[]};surfacePoints=[]
 Q,Z=np.meshgrid(q,z)
 for ax in [0,1]:
  if ax==0:a=(slice(None),slice(None,-1));c=(slice(None),slice(1,None))
  else:a=(slice(None,-1),slice(None));c=(slice(1,None),slice(None))
  for live,fix in [(a,c),(c,a)]:
   ml=M[live];mf=M[fix];edge=(ml>=2)&(mf<2)
   kl=k[live][edge];tt=T[live][edge];which=mf[edge]
   r=np.where(which==1,FILM['inside'],FILM['outside'])
   g=(step/1000)/(step/2000/kl+r)
   target=np.where(which==1,T_IN,T_OUT)
   flow=g*(target-tt)
   flux['inside']+=flow[which==1].sum();flux['outside']+=flow[which==0].sum()
   surface=target-flow/(step/1000)*r
   for key,num in [('inside',1),('outside',0)]:surf[key].extend(surface[which==num].tolist())
   faceQ=(Q[a]+step/2 if ax==0 else Q[a])[edge]
   faceZ=(Z[a] if ax==0 else Z[a]+step/2)[edge]
   surfacePoints.extend((float(temp),float(fq),float(fz)) for temp,fq,fz in zip(surface[which==1],faceQ[which==1],faceZ[which==1]))
 cold=min(surfacePoints)
 # Adiabatic cuts are intentionally distant, but their impact needs a
 # domain-width sensitivity before a junction coefficient can be asserted.
 return dict(step=step,collector=collector,frameSolidPlaneStress=frame,voidK=void_k,ceilingEffectiveK=ceiling_k,qEnd=q_end,zStart=z_start,
             unknownCells=int(active.sum()),heatFromRoomWperM=flux['inside'],heatToOutsideWperM=-flux['outside'],
             energyResidualWperM=flux['inside']+flux['outside'],
             minimumInsideSurfaceC=min(surf['inside']),minimumInsideTemperatureFactor=(min(surf['inside'])-T_OUT)/(T_IN-T_OUT),
             coldestInsideFace=dict(q=cold[1],z=cold[2]))

cases=[]
for step in (10.,5.):
 for name,kw in [('bay',{}),('noCollectorReference',{'collector':False}),('solidFramePlaneStress',{'frame':True}),
                 ('stillVoid',{'void_k':.026}),('mixedVoid',{'void_k':.30}),
                 ('ceilingLowerK',{'ceiling_k':.04}),('ceilingHigherK',{'ceiling_k':.12})]:
  x=solve(step,**kw);x['name']=name;cases.append(x)
  assert abs(x['energyResidualWperM'])<1e-5
for name,kw in [('wideBay',{'q_end':1400.}),('wideNoCollectorReference',{'q_end':1400.,'collector':False})]:
 x=solve(5.,**kw);x['name']=name;cases.append(x)
 assert abs(x['energyResidualWperM'])<1e-5
for name,kw in [('deeperBay',{'z_start':5700.}),('deeperNoCollectorReference',{'z_start':5700.,'collector':False}),
                ('shallowerBay',{'z_start':6100.}),('shallowerNoCollectorReference',{'z_start':6100.,'collector':False})]:
 x=solve(5.,**kw);x['name']=name;cases.append(x)
 assert abs(x['energyResidualWperM'])<1e-5
for name,kw in [('bay',{}),('noCollectorReference',{'collector':False})]:
 x=solve(2.5,**kw);x['name']=name;cases.append(x)
 assert abs(x['energyResidualWperM'])<1e-5
by={(x['step'],x['name']):x for x in cases}
for hstep in (10.,5.,2.5):
 by[(hstep,'bay')]['collectorPenaltyVsNoCollectorWperMK']=(by[(hstep,'bay')]['heatFromRoomWperM']-by[(hstep,'noCollectorReference')]['heatFromRoomWperM'])/(T_IN-T_OUT)
conv={n:dict(heatRelative=abs(by[(5.,n)]['heatFromRoomWperM']-by[(10.,n)]['heatFromRoomWperM'])/by[(5.,n)]['heatFromRoomWperM'],surfaceDeltaC=by[(5.,n)]['minimumInsideSurfaceC']-by[(10.,n)]['minimumInsideSurfaceC']) for n in ('bay','noCollectorReference','solidFramePlaneStress')}
fineConv={n:dict(heatRelative=abs(by[(2.5,n)]['heatFromRoomWperM']-by[(5.,n)]['heatFromRoomWperM'])/by[(2.5,n)]['heatFromRoomWperM'],surfaceDeltaC=by[(2.5,n)]['minimumInsideSurfaceC']-by[(5.,n)]['minimumInsideSurfaceC']) for n in ('bay','noCollectorReference')}
widePenalty=(by[(5.,'wideBay')]['heatFromRoomWperM']-by[(5.,'wideNoCollectorReference')]['heatFromRoomWperM'])/(T_IN-T_OUT)
deepPenalty=(by[(5.,'deeperBay')]['heatFromRoomWperM']-by[(5.,'deeperNoCollectorReference')]['heatFromRoomWperM'])/(T_IN-T_OUT)
shallowPenalty=(by[(5.,'shallowerBay')]['heatFromRoomWperM']-by[(5.,'shallowerNoCollectorReference')]['heatFromRoomWperM'])/(T_IN-T_OUT)
v=dict(status='Conditional steady 2D heat-flow screen only; no ISO10211/13788, whole U, condensation or assembly acceptance.',
       inputs=source,sourceReconciliation=dict(olderSTRBlob='f2414b24637533e93a0be9d0e0e639a899d18803',unchangedGeometry=['collector section260x140/top6680/bottom6540/projection60','north frame axes and seats','roof normal recipe/primary centre/purlin rows'],changedEngineering='Actual offset transfers raise collector shear V from12.150 to20.490kN. Concrete-only actual shear fails; links are required. This dry thermal screen does not approve the collector structure.'),
       geometry=dict(qDomain=[Q0,Q1],zDomain=[Z0,Z1],pitch=25,ordinaryWall=e['ordinaryWall'],weatherLeafHeadHypothesisZ=6900,collector=e['collector']['bounds'],roofNormal=500.7,roofGlassNormal=320,roofGlassEndQ=152.5,lowerBoardEndQ=262.5,ceiling=[6444,6620],ceilingWoolInClassifiedSystem=100,framePlanesX=st['north_frames_x']),
       model=dict(temperatureC={'room':T_IN,'outdoorVent':T_OUT},surfaceFilmM2KperW=FILM,conductivityWperMK=LAMBDA,primaryVoidK=.10,primaryCeilingEffectiveK=.06,
                  geometryLimit='Dry section with authored glass-to-glass bevel closure. Drained wall cavity and roof 50 ventilation held at outdoor temperature. Weather-leaf head and cap not resolved as a qualified joint. q/z cuts adiabatic. The 24board+1mm AVCL are a 25mm exact normal-series resistance, omitting sheet lateral fin and collars. The 176 ceiling is a homogenized effective-property bracket, not the classified profile. No radiative/cavity airflow or wind-driven rain.',
                  frameLimit='Solid 80-normal steel plane is a deliberately severe 2D infinite-width bound, not a hollow SHS, its finite x distribution, 1 mm collar, weld or 3D heat transfer. Post/plate/rail/corner bridges excluded.',
                  referenceLimit='No-collector comparison is a numerical counterfactual with the same roof/wall/ceiling cut. Its ΔL is not an ISO ψ or an available design option. Boundary-width and ceiling-property sensitivities prevent a compliance claim.'),
       cases=cases,convergence=conv,fineConvergence=fineConv,wideCutSensitivity=dict(qEnd=1400,collectorPenaltyWperMK=widePenalty,penaltyDifferenceFromPrimary=widePenalty-by[(5.,'bay')]['collectorPenaltyVsNoCollectorWperMK'],surfaceDifferenceC=by[(5.,'wideBay')]['minimumInsideSurfaceC']-by[(5.,'bay')]['minimumInsideSurfaceC']),
       lowerCutSensitivity=dict(baselineZ=Z0,shallowerZ=6100,deeperZ=5700,penaltiesWperMK={'shallower':shallowPenalty,'baseline':by[(5.,'bay')]['collectorPenaltyVsNoCollectorWperMK'],'deeper':deepPenalty},surfacesC={'shallower':by[(5.,'shallowerBay')]['minimumInsideSurfaceC'],'baseline':by[(5.,'bay')]['minimumInsideSurfaceC'],'deeper':by[(5.,'deeperBay')]['minimumInsideSurfaceC']}),
       open=['Actual classified ceiling conductivity/skin/web/fillets and protected void radiation/convection','All-around frame/post collars and metal-sheet fin effects in 3D','Indoor moisture production, climate/weather series and constituent vapour/permeance data for transient moisture','Wall-head cavity cap/drip, plaster and water/air/gas closure, site and physical verification'])

def out(p,s):
 if '--check' in sys.argv:assert p.read_text()==s,f'{p} stale'
 else:p.write_text(s)
out(HERE/'loggia-roof-wall-thermal.json',json.dumps(v,indent=2)+'\n')
def esc(s):return str(s).replace('&','&amp;').replace('<','&lt;')
def txt(x,y,s,n=3):return f'<text x="{x}" y="{y}" font-size="{n}">{esc(s)}</text>'
svg='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297"><rect width="420" height="297" fill="white"/><g font-family="DejaVu Sans,Arial" fill="#213b45">'
svg+=txt(15,15,'ORDINARY ROOF / 50-GLASS COLLECTOR NECK · conditional thermal screen',4.8)
svg+=txt(15,24,'Steady 2D authored comparison; no complete ceiling, dynamic moisture, 3D bridge or U-value admission.',3.1)
# The drawing is an exact geometry key, while the numerical solution is in JSON.
X=lambda q:25+(q+300)/10;Y=lambda z:30+(7900-z)/10
def poly(coords,fill):return '<polygon points="'+' '.join(f'{X(q):.2f},{Y(z):.2f}' for q,z in coords)+f'" fill="{fill}" stroke="#566b70" stroke-width=".25"/>'
svg+=poly([(0,6300),(102.5,6300),(102.5,6900),(0,6900)],'#b87560')
svg+=poly([(152.5,6300),(262.5,6300),(262.5,rz(262.5,395.7)),(152.5,rz(152.5,395.7))],'#e6cb77')
svg+=poly([(262.5,6300),(402.5,6300),(402.5,rz(402.5,420.7)),(262.5,rz(262.5,420.7))],'#a9a094')
svg+=poly([(202.5,6540),(462.5,6540),(462.5,6680),(202.5,6680)],'#a7b6c4')
svg+=poly([(152.5,rz(152.5,395.7)),(1000,rz(1000,395.7)),(1000,rz(1000,75.7)),(152.5,rz(152.5,75.7))],'#e6cb77')
svg+=poly([(489.5,6444),(1000,6444),(1000,6620),(489.5,6620)],'#e3d8c7')
svg+=txt(215,43,'JOINED SOURCE GEOMETRY',4)
for i,s in enumerate(['429.5 ordinary wall =27 plaster+140 core+110 glass+50 cavity+102.5 brick',
                       '260 RC collector x202.5–462.5, z6540–6680; only50 glass locally',
                       '500.7 roof normal;320 glass; lowerboard endq262.5; glass toe q152.5',
                       'Protected ceiling6444–6620, 176 complete with100 wool retained',
                       'Wall cavity and50 roof vent use exterior-temperature boundary',
                       'Solid-frame plane is intentionally severe, NOT actual hollowSHS/3D']):svg+=txt(215,54+i*9,s,2.8)
svg+=txt(15,215,'10→5 mm finite-volume comparison / authored20°C room and0°C outdoor reference',3.5)
for i,n in enumerate(('bay','noCollectorReference','solidFramePlaneStress','stillVoid','mixedVoid','ceilingLowerK','ceilingHigherK')):
 x=by[(5.,n)];svg+=txt(15,225+i*7,f'{n}: Q {x["heatFromRoomWperM"]:.3f} W/m; Tmin inside {x["minimumInsideSurfaceC"]:.2f}°C; f {x["minimumInsideTemperatureFactor"]:.3f}',2.9)
svg+=txt(215,225,f'Collector penalty ΔL {by[(5.,"bay")]["collectorPenaltyVsNoCollectorWperMK"]:.4f} W/mK (counterfactual, not ψ).',2.8)
svg+=txt(215,233,f'Bay energy residual {by[(5.,"bay")]["energyResidualWperM"]:.2e} W/m.',2.8)
svg+=txt(215,241,f'Bay grid Q difference {conv["bay"]["heatRelative"]*100:.2f}% / surface {conv["bay"]["surfaceDeltaC"]:.2f}°C.',2.8)
svg+=txt(215,247,f'5→2.5mm: {fineConv["bay"]["heatRelative"]*100:.2f}% heat / {fineConv["bay"]["surfaceDeltaC"]:.2f}°C surface.',2.8)
svg+=txt(215,253,f'Wider cut: ΔL shift {v["wideCutSensitivity"]["penaltyDifferenceFromPrimary"]:.5f} W/mK.',2.8)
svg+=txt(215,261,f'Lower z6100/5900/5700: Tmin {v["lowerCutSensitivity"]["surfacesC"]["shallower"]:.2f}/{v["lowerCutSensitivity"]["surfacesC"]["baseline"]:.2f}/{v["lowerCutSensitivity"]["surfacesC"]["deeper"]:.2f}°C.',2.8)
svg+=txt(215,269,'No climate/humidity/μ, radiation, actual collar fin or complete joints.',2.8)
svg+=txt(15,287,'Numerical result only; geometry, classified ceiling, structural frame and material policy require their owning admissions.',2.9)+'</g></svg>\n'
out(HERE/'loggia-roof-wall-thermal.svg',svg)
print(json.dumps(dict(bay=by[(5.,'bay')],convergence=conv['bay'])))
