#!/usr/bin/env python3
"""Actual upper-wall/lower-support interval join, with integral RC200 transfer-strip screens."""
from pathlib import Path
import hashlib,json,math,sys
R=Path(__file__).resolve().parents[3];P=R/'project/had/studies/water-replan.json';raw=P.read_bytes()
assert hashlib.sha256(raw).hexdigest()=='dbfff5eb4fa36dbdf6635702e853792e6412d73df1c58f9e1c1ede1bcff205b8'
h=json.loads(raw)['model'];S=json.loads((R/'project/str/studies/open-loggia-support.json').read_text())
# Source structural core lines at the enclosure, not weather-wall axes.
outer=[{'id':'outer-W','a':[332.5,332.5],'b':[332.5,11667.5],'structuralCore':[262.5,402.5],'holes':[]},
 {'id':'outer-E','a':[11667.5,332.5],'b':[11667.5,11667.5],'structuralCore':[11597.5,11737.5],'holes':[]},
 {'id':'outer-S','a':[332.5,332.5],'b':[11667.5,332.5],'structuralCore':[262.5,402.5],'holes':[]},
 {'id':'outer-N','a':[332.5,11667.5],'b':[11667.5,11667.5],'structuralCore':[11597.5,11737.5],'holes':[]}]
# Openings in these outer lines need their own head/RCpier route; none of the
# internal wall intersections below lands in a source outer opening.
for w in outer:
 wall={'outer-W':'outer-west','outer-E':'outer-east','outer-S':'outer-south','outer-N':'outer-north'}[w['id']]
 w['holes']=[[o['centre']-o['width']/2,o['centre']+o['width']/2]for o in h['openings']['GROUND']if o['wall']==wall]
def axis(w):return 0 if w['a'][1]==w['b'][1]else 1
def support_at(u,wall,g):
 ax=axis(wall);ga=axis(g);fixed=wall['a'][1-ax]
 if ga==ax:
  if not g['structuralCore'][0]<=fixed<=g['structuralCore'][1]:return False
  lo,hi=sorted([g['a'][ax],g['b'][ax]])
  return lo<=u<=hi and not any(a<u<b for a,b in g.get('holes',[]))
 lo,hi=sorted([g['a'][ga],g['b'][ga]])
 return g['structuralCore'][0]<=u<=g['structuralCore'][1] and lo<=fixed<=hi and not any(a<fixed<b for a,b in g.get('holes',[]))
# RC200 remains inside the current slab; it does not add a downstand to rooms.
def section(width,n,dia,G,Q,L):
 H=200;d=H-25-8-dia/2;As=n*math.pi*dia**2/4;fyd=500/1.15;fcd=.85*30/1.5
 x=As*fyd/(.8*width*fcd);MR=As*fyd*(d-.4*x)/1e6
 Ec=22000*(38/10)**.3
 def bend(q,phi):
  effectiveE=Ec/(1+phi);ratio=200000/effectiveE;xx=(-ratio*As+math.sqrt((ratio*As)**2+2*width*ratio*As*d))/width;I=width*xx**3/3+ratio*As*(d-xx)**2
  return 5*q*(L*1000)**4/(384*effectiveE*I)
 delta=bend(G,3.5)+bend(Q,0)+400e-6*(L*1000)**2/(8*H)
 return {'deflection':delta,'L250':L*1000/250,'servicePass':delta<=L*1000/250,'b':width,'h':H,'d':d,'As':As,'steel':f'{n}H{dia} each TOP/BOTTOM','xOverD':x/d,'MR':MR,'ductility':x/d<=.45}
rows=[];failures=[]
for w in h['upperWalls']:
 ax=axis(w);lo,hi=sorted([w['a'][ax],w['b'][ax]]);cuts={lo,hi}
 for g in h['groundWalls']+outer:
  if axis(g)==ax:
   if g['structuralCore'][0]<=w['a'][1-ax]<=g['structuralCore'][1]:
    cuts.update(z for z in [g['a'][ax],g['b'][ax]]+sum(g.get('holes',[]),[])if lo<z<hi)
  else:cuts.update(z for z in g['structuralCore']if lo<z<hi)
 cuts=sorted(cuts);spans=[]
 for a,b in zip(cuts,cuts[1:]):
  names=[g['id']for g in h['groundWalls']+outer if support_at((a+b)/2,w,g)]
  spans.append({'a':a,'b':b,'direct':bool(names),'support':names})
 # Merge adjacent unsupported segments; retain finite core faces as seats.
 runs=[]
 for span in spans:
  if not span['direct']:
   if runs and runs[-1][1]==span['a']:runs[-1][1]=span['b']
   else:runs.append([span['a'],span['b']])
 width=w['structuralCore'][1]-w['structuralCore'][0];Gwall=width/1000*3.17*20
 transfers=[]
 for a,b in runs:
  # Geometry beyond the outer core axes is enclosed-wall junction mass, not a
  # suspended room-span. It returns through the common enclosure core.
  if b<=332.5 or a>=11667.5:continue
  a=max(a,332.5);b=min(b,11667.5);L=(b-a)/1000
  # Integral600 slab strip, clipped on a void edge when applicable.
  strip=600;fixed=w['a'][1-ax];vx,vy,vw,vl=h['void'];void=[vx,vy,vx+vw,vy+vl]
  uVoid=[void[ax],void[ax+2]];fVoid=[void[1-ax],void[3-ax]]
  if max(a,uVoid[0])<min(b,uVoid[1]):
   if fixed<=fVoid[0]:strip=min(strip,300+fVoid[0]-fixed)
   elif fixed>=fVoid[1]:strip=min(strip,300+fixed-fVoid[1])
   else:strip=0
  # 1.2m is a declared maximum floor tributary to this wall transfer, not
  # replacement of the independent floor-field support calculation.
  G=Gwall+7.5*1.2;Q=2*1.2;wu=1.35*G+1.5*Q;M=wu*L**2/8;V=wu*L/2
  candidates=[section(strip,n,d,G,Q,L)for n,d in [(4,12),(3,16),(4,16),(4,20)]if strip>0]
  chosen=next((s for s in candidates if s['ductility']and s['MR']>=M and s['servicePass']),None)
  row={'unsupportedInterval':[a,b],'clearSpan':L*1000,'slabStripWidth':strip,'Gwall':Gwall,'GfloorBudget':9,'QfloorBudget':2.4,'M':M,'V':V,'chosen':chosen,'seatEach':300,'bearingStressOn140core':V*1000/(140*300),'scope':'Source-wall transfer inside current RC200; floor tributary limit1.2m, actual field reactions not added again to whole-building mass.'}
  if not chosen:failures.append({'wall':w['id'],**row})
  transfers.append(row)
 rows.append({'id':w['id'],'sourceLine':[w['a'],w['b']],'grossUpperWallG':Gwall*(hi-lo)/1000,'directSupportedLength':sum(s['b']-s['a']for s in spans if s['direct']),'transfers':transfers})
result={'status':'Calculated upper-wall transfer-strip candidate; end/edge integration and whole-house allocation remain active','source':{'path':str(P.relative_to(R)),'sha256':hashlib.sha256(raw).hexdigest()},'units':'mm, kN, kNm, MPa unless stated','wallRows':rows,'failedSectionScreens':failures,'actualLoadTransferComplete':False,
 'boundary':'These strips join actual source upper walls to actual lower core faces and preserve RC200. Positive section capacity alone does not earn a missing end seat, void-edge torsion or a new room bearing. Gross wall G is a conservative line envelope, not disjoint whole-house mass.'}
out=Path(__file__).with_suffix('.json');text=json.dumps(result,indent=2,sort_keys=True)+'\n'
if '--check'in sys.argv:assert out.read_text()==text;print('Current upper-wall/lower-support interval and strip screens reproduce')
else:out.write_text(text);print(json.dumps({'transfers':sum(len(x['transfers'])for x in rows),'failures':failures},indent=2))
