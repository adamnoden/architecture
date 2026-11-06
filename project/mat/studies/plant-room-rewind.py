#!/usr/bin/env python3
"""One whole-cell rewind, with rejected local controls and unearned handling visible."""
from pathlib import Path
import argparse,hashlib,json,math,subprocess,html
ROOT=Path(__file__).resolve().parents[3];BASE=Path(__file__).with_suffix('')
def cross(a,b,c):return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
def pointseg(p,a,b):
 dx=b[0]-a[0];dy=b[1]-a[1];t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy))) if dx or dy else 0
 return math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)
def edges(p):return list(zip(p,p[1:]+p[:1]))
def inside(p,poly):
 vals=[cross(a,b,p) for a,b in edges(poly)];return all(v>=-1e-9 for v in vals) or all(v<=1e-9 for v in vals)
def segdist(a,b,c,d):
 if cross(a,b,c)*cross(a,b,d)<=0 and cross(c,d,a)*cross(c,d,b)<=0:
  if max(min(a[0],b[0]),min(c[0],d[0]))<=min(max(a[0],b[0]),max(c[0],d[0]))+1e-9 and max(min(a[1],b[1]),min(c[1],d[1]))<=min(max(a[1],b[1]),max(c[1],d[1]))+1e-9:return 0
 return min(pointseg(a,c,d),pointseg(b,c,d),pointseg(c,a,b),pointseg(d,a,b))
def pointpoly(p,poly):return 0 if inside(p,poly) else min(pointseg(p,a,b) for a,b in edges(poly))
def segpoly(a,b,p):return 0 if inside(a,p) or inside(b,p) else min(segdist(a,b,c,d) for c,d in edges(p))
def polydist(p,q):return 0 if inside(p[0],q) or inside(q[0],p) else min(segdist(a,b,c,d) for a,b in edges(p) for c,d in edges(q))
def rect(r):x,y,w,h=r;return [[x,y],[x+w,y],[x+w,y+h],[x,y+h]]
def hull(ps):
 ps=sorted(set(map(tuple,ps)));lo=[];hi=[]
 for p in ps:
  while len(lo)>1 and cross(lo[-2],lo[-1],p)<=0:lo.pop()
  lo.append(p)
 for p in reversed(ps):
  while len(hi)>1 and cross(hi[-2],hi[-1],p)<=0:hi.pop()
  hi.append(p)
 return [list(x) for x in lo[:-1]+hi[:-1]]
def circlepath(path,r,obstacles):
 margins={}
 for id,o in obstacles.items():
  ds=[]
  for a,b in zip(path,path[1:]):
   ds.append(pointseg(o['circle'][:2],a,b)-o['circle'][2]-r if 'circle'in o else segpoly(a,b,rect(o['rect']))-r)
  margins[id]=min(ds)
 worst=min(margins,key=margins.get)
 return {'radius_mm':r,'polyline_mm':path,'minimumInflatedMargin_mm':margins[worst],'limiting':worst,'allMargins_mm':margins,'planPass':margins[worst]>=-1e-7}
def cartpath(path,obstacles):
 # Exact convex swept union for each fixed-heading translation; no sampling gap.
 sw=[hull([[x+dx,y+dy] for x,y in [a,b] for dx,dy in [(-625,-304.5),(625,-304.5),(625,304.5),(-625,304.5)]]) for a,b in zip(path,path[1:])]
 margins={id:min(pointpoly(o['circle'][:2],p)-o['circle'][2]-25 if 'circle'in o else polydist(p,rect(o['rect']))-25 for p in sw) for id,o in obstacles.items()};worst=min(margins,key=margins.get)
 return {'completeCarrier_mm':[1250,609],'reserve_mm':25,'polyline_mm':path,'minimumMargin_mm':margins[worst],'limiting':worst,'allMargins_mm':margins,'planPass':margins[worst]>=-1e-7,'scope':'Exact fixed-heading body sweep only; no wheel/support/CG/force/hand-grip or complete operator turn admission.'}
def immutable(path,blob):
 raw=subprocess.check_output(['git','show','50093457642f65eca288e5cc233a77d8aac6bc29:'+path],cwd=ROOT)
 assert hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()==blob
 return json.loads(raw)
def produce():
 hp='project/had/studies/water-replan.json';sp='project/mat/studies/whole-house-service-baseline.json'
 h=immutable(hp,'089f0dac2f2e89272dc2ea85a10c2208f2fd797d')['model'];s=immutable(sp,'049161ebac29b24e0acc7d8085302fca906fe9d2')
 current=json.loads((ROOT/hp).read_text())['model'];assert all(current[k]==h[k] for k in ['groundWalls','groundFurniture','plantReferenceDoor','utilityDisposition','servicesInterface'])
 p=s['plant'];u=s['rewinds']['utility'];finish=h['finishRewind']['dry']['total'];assert finish==27
 uw=next(w for w in h['groundWalls'] if w['id']=='utility-north');iw=next(w for w in h['groundWalls'] if w['id']=='plant-intermediate-arch')
 uj=[uw['holes'][0][0]+finish,uw['holes'][0][1]-finish];ij=[iw['holes'][0][0]+finish,iw['holes'][0][1]-finish]
 south=uw['finishedFaces'][1];north=5780.5;west=9397;east=11570.5;door=[v+finish*(1 if i==0 else -1) for i,v in enumerate(p['cylinder']['doorRaw'])]
 doorref=h['plantReferenceDoor'];op=doorref['effectiveOpenClearY'];leaf=doorref['fullyOpenEastLeaf']
 fixed={'cylinder':{'circle':[9860,4250,297.5]},'riser':{'rect':p['riserGross']},'controls':{'rect':[10920.5,3797,650,300]},'emitter':{'rect':[9727,2647,550,200]},'buffer':{'circle':[11245.5,3097,300]},'W9':{'rect':[10400,5147,1006,597]}}
 walls={'utility-west-pier':{'rect':[west,uw['finishedFaces'][0],uj[0]-west,uw['t']]},'utility-east-pier':{'rect':[uj[1],uw['finishedFaces'][0],east-uj[1],uw['t']]},'intermediate-west-pier':{'rect':[west,iw['finishedFaces'][0],ij[0]-west,iw['t']]},'intermediate-east-pier':{'rect':[ij[1],iw['finishedFaces'][0],east-ij[1],iw['t']]},'north-wall':{'rect':[west,north,east-west,520]},'east-south':{'rect':[east,0,500,door[0]]},'east-north':{'rect':[east,door[1],500,6300-door[1]]},'west-south':{'rect':[9203,0,194,op[0]]},'west-north':{'rect':[9203,op[1],194,6300-op[1]]}}
 utility={k:{'rect':v} for k,v in h['groundFurniture'].items() if k.startswith('service-utility-') or k=='service-emitter-utility-E'}
 openobs={**walls,**utility,**fixed,'parked-leaf':{'rect':leaf}}
 hinge=doorref['northHingeReference'];closedobs={**walls,**utility,**fixed,'closed-leaf':{'rect':[hinge[0]-22,hinge[1]-762,44,762]}}
 def obs(mode='open',exclude=()):return {k:v for k,v in (openobs if mode=='open' else closedobs).items() if k not in exclude}
 bw=fixed['W9']['rect'];R=325;minimum_old=10683+math.sqrt(R*R-25*25)
 locals=[{'id':'existing-south-host','rawUtilityX':uw['holes'][0],'finishedUtilityX':uj,'maximumCentreX_mm':uj[1]-R,'minimumCentreX_mm':minimum_old,'planPass':False},
 {'id':'W9-west200','body':[9477,2672,1006,597],'frontField':[9477,3269,1006,600],'westPierOverlap_mm':[200,194],'openLeafFrontOverlap_mm':[682,44],'planPass':False},
 {'id':'utility-east200-only','rawUtilityX':[10450,11350],'finishedUtilityX':[10477,11323],'maximumCentreX_mm':11323-R,'minimumCentreX_mm':minimum_old,'stillShort_mm':minimum_old-(11323-R),'planPass':False},
 {'id':'north-emitter-only','body':[10540,4397,1006,597],'cylinderWorkingOverlap_mm':[570,328],'cylinderBuffer425ExitBlocked':True,'planPass':False}]
 tasks={'plant-entry':circlepath(doorref['operatorCentrePath'],325,obs()),'utility-curved-entry':circlepath([[10800,1725],[10610,2000],[10610,2900],[10550,3400],[10550,4250]],325,obs()),'buffer-west-service':circlepath([[10620.5,3097],[10620.5,3097]],300,obs()),'controls-north-service':circlepath([[11245.5,4422],[11245.5,4422]],300,obs()),'emitter-routine':circlepath([[10002,3172],[10002,3172]],300,obs()),'emitter-pulled-closed-door':circlepath([[10002,3322],[10002,3322]],300,obs('closed'))}
 bp=[[11245.5,3097],[10800,3097],[10580,3250],[10425,3400],[10425,4250],[10500,4575],[12500,4575]]
 buffer=circlepath(bp,425,obs('closed',('buffer',)))
 cylinder=circlepath(p['cylinder']['replacementCentrePath'],425,obs(exclude=('cylinder',)))
 cp=[[10903,5445.5],[10903,4575],[12500,4575]];carrier=cartpath(cp,obs(exclude=('W9',)))
 crew=circlepath([[x-403,y-629.5] for x,y in cp],325,obs(exclude=('W9',)))
 crew_station=circlepath([[x-403,y-629.5] for x,y in cp],300,{**obs(exclude=('W9',)),'complete-cylinder-station':{'rect':p['cylinder']['station']}})
 throat=math.hypot(10898-9860,3797-4250)-297.5
 assert throat<850 and buffer['allMargins_mm']['east-south']<0
 rad=fixed['emitter']['rect'];sweepgap=math.hypot(rad[0]-hinge[0],hinge[1]-(rad[1]+rad[3]))-math.hypot(762,22)
 assert locals[2]['stillShort_mm']>0 and locals[1]['westPierOverlap_mm'][0]>0
 assert not crew['planPass'] # do not silently promote a body-only cart route
 return {'status':'Whole-room comparison in development; current HAD/Services unchanged; no geometry/apparatus/handling adoption','sourceCommit':'50093457642f65eca288e5cc233a77d8aac6bc29','sources':{'HAD':{'path':hp,'blob':'089f0dac2f2e89272dc2ea85a10c2208f2fd797d'},'Services':{'path':sp,'blob':'049161ebac29b24e0acc7d8085302fca906fe9d2'}},'sourceRoles':{'utilityRawX':uw['holes'][0],'utilityFinishedX':uj,'intermediateFinishedX':ij,'eastArchitecturalFinishedMouthY':door,'eastDoorsetMinimumRequiredClear_mm':1000,'note':'Architectural finished mouth is not actual installed doorset clear. Retain1000 minimum and full native frame/leaf/threshold/closer/source qualification.425 is the retained complete cart/apparatus circle including its25mm allowance, not a mandatory shape for every possible actual handling method.'},'rejectedLocalControls':locals,'proposal':{'W9':bw,'W9FrontSouth600':[10400,4547,1006,600],'bufferStation':[10920.5,2772,650,650],'bufferMaximumRoundBody_mm':600,'bufferUsableAlwaysConnectedLitres':100,'bufferPortFace':'WEST proposed; actual native ports/isolation/drain/support and usable volume unqualified','controls':fixed['controls']['rect'],'controlsFront':'NORTH','emitter':fixed['emitter']['rect'],'cylinderBodyUnchanged':p['cylinder']['body'],'cylinderWorkingEast':[10210,4097,900,700],'riserUnchanged':p['riserGross'],'permanentBodies':fixed,'emitterToFullReferenceLeafSweep_mm':sweepgap,'emitterSweepRole':'Exact reference quarter-disc outer radius; ~20mm remains, not25 and not classified-kit/trim/closer or fixing approval.'},'taskComparisons':tasks,'buffer425RenewalClosedDoor':buffer,'unchangedCylinderPierPhysicalThroat_mm':throat,'cylinder425Renewal':cylinder,'W9CarrierBodyOnly':carrier,'W9AuthoredCrewFirstAttempt':crew,'W9Crew300Complete700StationControl':crew_station,'decision':'Retain this one whole-room candidate for joined development. Local south-host/arch-only and emitter-only north controls fail. No layout adopted: finish full buffer/crew supported method and W9 operator regrip/exit, native GL/cart datum/CG/support, ports/duct/condensate and moved hydraulic thermal/support consequences before source adoption.','unearned':['Actual W9 cart operator regrip/exit and whole-tool lift/setdown; a cart-body sweep is not whole handling','Buffer supported first lift/complete425-carrier/crew through intermediate arch and closed protected leaf; no relabelled old export route','Actual riser service/230mm clamp tasks: only450mm remains between riser east9950 and W9 west10400 at overlappingY5147..5400; no600body+25 parallel stance or whole access pass supplied','Moved controls/buffer/emitter supports, finite filled loads and actual pipe/port/air/heat loss consequences','W9 native72mm UVLL cover access through rimmed receiver, actual base seat/feet and independently supported discharge/receptor','No source-qualified floor drain/outfall, safety/material exception, site works or selected air target'], 'admission':{'owningGeometryAdopted':False,'wholeRoomHandlingPass':False,'apparatusAccepted':False,'packetComplete':False}}
def figure(r):
 out=['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1050" viewBox="0 0 1200 1050">','<rect width="1200" height="1050" fill="#f4f1e9"/>']
 def t(x,y,s,n=18,c='#21363b'):out.append(f'<text x="{x}" y="{y}" font-family="Arial,sans-serif" font-size="{n}" fill="{c}">{html.escape(s)}</text>')
 sx=.18;ox=55;oy=150
 def xy(x,y):return ox+(x-9300)*sx,oy+(5900-y)*sx
 def rr(b,col):x,y,w,h=b;xx,yy=xy(x,y+h);out.append(f'<rect x="{xx}" y="{yy}" width="{w*sx}" height="{h*sx}" fill="{col}" stroke="#21363b"/>')
 t(35,42,'One whole plant-room rewind — method still OPEN',28);t(35,77,'Same functions; no structural arch change or owning source adoption',19)
 for id,o in r['proposal']['permanentBodies'].items():
  if 'rect'in o:rr(o['rect'],'#b4cec4' if id!='W9' else '#d4a766');cx=o['rect'][0]+o['rect'][2]/2;cy=o['rect'][1]+o['rect'][3]/2
  else:
   cx,cy,rad=o['circle'];xx,yy=xy(cx,cy);out.append(f'<circle cx="{xx}" cy="{yy}" r="{rad*sx}" fill="#a8c6cc" stroke="#21363b"/>')
  xx,yy=xy(cx,cy);t(xx-30,yy+5,id,15)
 rr([9397,3603,280,194],'#a7a091');rr([10898,3603,672.5,194],'#a7a091')
 rr([9397,2453,880,194],'#a7a091');rr([11123,2453,447.5,194],'#a7a091')
 for key,col in [('buffer425RenewalClosedDoor','#75609a'),('cylinder425Renewal','#355f7a'),('W9CarrierBodyOnly','#a66b21')]:
  pts=' '.join(f'{xy(x,y)[0]},{xy(x,y)[1]}' for x,y in r[key]['polyline_mm']);out.append(f'<polyline points="{pts}" fill="none" stroke="{col}" stroke-width="3"/>')
 t(650,155,'Compare full events, not only body packing',21)
 rows=[('Old south host: utility/jamb approach fails.',False),('West200: full front field hits west pier.',False),('East200 arch only: finished throat still short.',False),('Emitter-only north: tank work/exit blocked.',False)]
 for i,(s,_)in enumerate(rows):t(650,202+i*35,s,18,'#8c402e')
 y=365
 for key in ['buffer425RenewalClosedDoor','cylinder425Renewal','W9CarrierBodyOnly','W9AuthoredCrewFirstAttempt']:
  q=r[key];margin=q.get('minimumMargin_mm',q.get('minimumInflatedMargin_mm'));t(650,y,key,17);t(650,y+26,f"{q['planPass']} / min margin {margin:.1f} mm / {q['limiting']}",16,'#355f7a' if q['planPass'] else '#8c402e');y+=77
 t(35,825,'Retain source duties and expose the next decisive test',24)
 for i,s in enumerate(['850 buffer control needs its real supported/crew route through the intermediate arch with the leaf closed.',
 'The W9 body path does not earn the first authored operator regrip/exit; no shrink to make it pass.',
 'Moved buffer/controls/emitter require real supports, pipes, thermal and hydraulic/control consequences.',
 'Native UVLL72mm plus support opening does not establish base datum, withdrawal or discharge/receptor.',
 'Current HAD/Services geometry stays unchanged; no apparatus, handling, material or MAT completion.']):t(35,865+i*35,s,18)
 out.append('</svg>');return '\n'.join(out)+'\n'
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');args=ap.parse_args();r=produce()
 for p,s in [(BASE.with_suffix('.json'),json.dumps(r,indent=2)+'\n'),(BASE.with_suffix('.svg'),figure(r))]:
  if args.check:assert p.read_text()==s,'Stale '+p.name
  else:p.write_text(s)
 print('Reproduces source-bound rejected controls and unresolved whole-room/crew methods; no adoption')
if __name__=='__main__':main()
