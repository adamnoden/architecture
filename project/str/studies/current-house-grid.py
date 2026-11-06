"""Trace a candidate common grid to every proposed 400 mm shaft. No soil springs assumed.
Horizontal transfer remains explicit via small eccentricities between shaft and beam.
Run without arguments to regenerate; --check compares committed artefacts.
"""
from pathlib import Path
from itertools import combinations
import json, math, hashlib, sys
D=Path(__file__).resolve().parent
ROOT=D.parents[2]
def read(path,sha):
    raw=(ROOT/path).read_bytes(); assert hashlib.sha256(raw).hexdigest()==sha,path
    return json.loads(raw)
src={'project/had/studies/water-replan.json':'547a0a5515878fd522ceb108c57c37b8aad29f5d2efe33848d93cedd89d65ad4','project/str/studies/open-loggia-support.json':'b5f08104c0da327613b84e055420d58f7709c354facd205634bcfd69a05e09b5'}
H,O=(read(p,s) for p,s in src.items())
B=H['bridge'];grid=O['lower_grid'];lat=json.loads((D/'current-house-lateral.json').read_text());src['project/str/studies/current-house-lateral.json']=hashlib.sha256((D/'current-house-lateral.json').read_bytes()).hexdigest()
hd={}; beams={}
def head(x,y,role):
    key=(x,y)
    if key not in hd: hd[key]={'id':'P%02d'%(len(hd)+1),'xy':[x,y],'roles':[]}
    if role not in hd[key]['roles']:hd[key]['roles'].append(role)
    return hd[key]['id']
for corner in lat['RClegs']['piers']:
    for p in corner['cornerPileGroup']:head(*p,'stability corner group')
def girder(name,axis,datum,lo,hi,points,width=600,z=(-630,-180)):
    # A projected shaft centre never silently moves the real application point.
    idx=0 if axis=='x' else 1;pts=[]
    for x,y in points:
        q=(x,y);u=q[idx];v=q[1-idx]
        assert abs(v-datum)+200<=width/2+1e-6,(name,q,'head outside footprint; widen or redesign')
        pts.append({'id':head(x,y,name),'u':u,'offset':v-datum})
    pts.sort(key=lambda p:p['u']);us=[p['u'] for p in pts]
    assert len(set(us))==len(us) and len(us)>=2
    beams[name]=dict(axis=axis,datum=datum,extent=[lo,hi],width=width,z=list(z),heads=pts,maximumPitch=max(b-a for a,b in zip(us,us[1:])),endCantilevers=[max(0,us[0]-lo),max(0,hi-us[-1])])
def row(name,axis,d,lo,hi,us,w=600,z=(-630,-180)):
    girder(name,axis,d,lo,hi,[(u,d) if axis=='x' else (d,u) for u in us],w,z)
a,b=332.5,11667.5;near,far=1192.5,10807.5
row('outer-W','y',a,a,b,[a,near,3247.5,4332.5,6500,8852.5,far,b],700)
row('outer-E','y',b,a,b,[a,near,3400,6000,7800,far,b],900)
row('outer-S','x',a,a,b,[a,near,3400,4800,7200,9300,far,b],700)
row('outer-NW','x',b,a,4500,[a,near,2902.5,4500],700)
row('outer-NE','x',b,7500,b,[7500,9300,far,b],700)
row('loggia-W','y',4500,8050,b,[8050,9875,b])
row('loggia-E','y',7500,8050,b,[8050,9875,b])
row('court-W','y',3950,3950,8050,[4332.5,6200,8050])
row('court-E','y',7950,3950,8050,[3950,6100,7700])
# Court-S centre and 600-wide footprint unchanged; a short terminal link transfers
# the 32.5/382.5 offsets to the opposed column through the same concrete joint.
girder('court-S','x',3950,3950,8050,[(4785,3917.5),(6000,3950),(7215,3917.5),(7950,3950)])
row('court-NW','x',8050,3950,4500,[3950,4500])
# East return is a short corbel physically continued from the loggia/court arms.
# Substituting a second head only 450mm east of the west one is an adverse control;
# span from the loggia head to the existing 350mm-off-line court node by a skew arm.
row('spine','y',9300,a,8290,[a,2650,4100,6100,7700],900)
row('stair-post','y',2942.5,4173,8949.5,[4332.5,7257.5,8852.5])
girder('stair-header','x',4332.5,a,3950,[(a,4332.5),(2942.5,4332.5),(3950,4332.5)])
girder('rear-W','x',8852.5,a,4500,[(a,8852.5),(2942.5,8852.5)])
girder('wet','y',2902.5,8852.5,b,[(2942.5,8852.5),(2902.5,b)])
# Small interior ground partitions have ribs; consolidate nearly-coincident
# independent heads only through a declared terminating cantilever or cross-beam.
row('study-east','y',4800,a,2650,[a,1200,2650])
row('cloak-west','y',3400,1200,2650,[1200,2650])
row('study-north','x',2650,2817.5,4800,[3400,4800])
row('wc-west','y',7200,a,2650,[a,2650])
girder('wc-north','x',2650,7200,9300,[(7200,2650),(9300,2650)])
# Explicit transverse transfers to named continuous girders. End forces then
# enter their actual adjacent pile spans; no pile is invented at an intersection.
links={}
def link(name,p,q,start,end,width=600,z=(-630,-180)):
    links[name]=dict(a=p,b=q,start=start,end=end,width=width,z=list(z))
link('rear-W-end',[2942.5,8852.5],[4500,8852.5],'stair-post','loggia-W')
beams['rear-W']['extent'][1]=2942.5;beams['rear-W']['endCantilevers'][1]=0
link('rear-E',[7500,8290],[b,8290],'loggia-E','outer-E')
link('court-NE',[7500,8050],[7950,8050],'loggia-E','court-E')
link('cloak-south',[3400,1200],[4800,1200],'cloak-west','study-east')
link('study-L-north',[a,3247.5],[2817.5,3247.5],'outer-W','study-L-return')
link('study-L-return',[2817.5,2650],[2817.5,4332.5],'study-north','stair-header')
link('utility-north',[9300,2550],[b,2550],'spine','outer-E')
link('plant-intermediate',[9300,3700],[b,3700],'spine','outer-E')
# Wall axes vary from head axes at both sides of the 1.2m outdoor room. A
# straight wide rib stays behind the portal faces; do not skew its edge into water.
link('passage-S',[9300,6100],[b,6100],'spine','outer-E',650)
link('passage-N',[9300,7700],[b,7700],'spine','outer-E',650)
link('protected-W',[2817.5,4250],[3950,4250],'study-L-return','court-W')
link('protected-E',[7950,4250],[9300,4250],'court-E','spine')
for t in grid['low_loggia_ties']:
    y=t['y'] if t['y']<11000 else b
    link('low-tie-'+str(int(y)),[4500,y],[7500,y],'loggia-W','loggia-E',600,(-750,-550))
# Separate skew/overlap accounting needed for all concrete; rectangular union
# is computed from physical faces, NOT beam-length times averaged width.
def rects():
    for k,g in beams.items():
        lo,hi=g['extent'];d=g['datum'];w=g['width']/2
        yield k,([lo,d-w,hi,d+w] if g['axis']=='x' else [d-w,lo,d+w,hi]),g['z']
    for k,g in links.items():
        (x,y),(xx,yy)=g['a'],g['b'];w=g['width']/2;assert x==xx or y==yy
        yield k,([x,y-w,xx,yy+w] if y==yy else [x-w,y,xx+w,yy]),g['z']
for g in hd.values():
    x,y=g['xy']; wet=x in [7950,9300] and y in [6100,7700]
    outer=x==b and y in [6000,7800]
    g['capXY']=[900 if x in [9300,b] else 600,650 if wet else 600]
    g['capZ']=[-750,-180];g['shaftDiameter']=400
    g['siteResistance']=None
for x,y in [(7950,6100),(7950,7700),(9300,6100),(9300,7700),(b,6000),(b,7800)]: assert (x,y) in hd
for h in hd.values():
    x,y=h['xy']
    if x>=7750:assert not (6450 < y+h['capXY'][1]/2 and y-h['capXY'][1]/2 <7350), h
pairs=sorted([(math.dist(p,q),hd[p]['id'],hd[q]['id']) for p,q in combinations(hd,2)])
assert pairs[0][0]>=400
seat=H['model']['southCourtThresholdReference']['pan']['permanentSeat']
assert seat['plan']==[5050,4060,1900,400] and seat['rcZ']==[-380,-180]
beam=beams['court-S'];edge=beam['datum']+beam['width']/2;overhang=seat['plan'][1]+seat['plan'][3]-edge
assert overhang==210 and beam['datum']-beam['width']/2<=3987.5<4060<=edge
# Dimensioned vertical strip normalized to 1m width; 5 kN/m at the outermost
# edge envelopes a distributed sill/bearing line, not an unspread 5kN point.
M=1.35*7.5*(overhang/1000)**2/2+1.5*5*overhang/1000
steel=math.pi*12**2/4*1000/150;MR=steel*(500/1.15)*.9*155/1e6
assert M<MR
result={'status':'Located trial; gravity action/soil and constructive qualification separate','sources':src,'girders':beams,'crossBeams':links,'heads':list(hd.values()),'headCount':len(hd),'tightestHeadPairs':pairs[:8],'minimumClearBetween400Heads':pairs[0][0]-400,'comparison':'One reworked continuous grid; original 58 historical records and twelve corner points are not additive. Ordinary 400 diameter heads are not admitted tension bearings. All cuts, if pursued, need common grid exposure control, every actual shaft and a separate vertical/lateral force card.','seat':{'source':seat,'commonBeam':'court-S','beamFacesY':[3650,4250],'transitionY':[3987.5,4060],'projection':overhang,'cantileverULSkNmPerM':M,'topH12at150Resistance':MR,'detail':'RC200 integral to 600wide court beam; H12/150 top normal to edge, continuous at least650mm south past support face into slab. Local pads/bearing and concentrated heel remain distinct from distributed strip budget. No new wall, pile or capillary cut.'}}
def save(p,s):
    if '--check' in sys.argv:assert p.read_text()==s,p
    else:p.write_text(s)
save(D/'current-house-grid.json',json.dumps(result,indent=2)+'\n')
print(len(hd),'400 mm heads; tightest pitch and pair',pairs[0],'; threshold projection',overhang)
# Plan in the project's coordinates (north up); all four corners and every shaft.
def S(x,y):return 70+x/24,580-y/24
def boxsvg(r,fill):
    x,y=S(r[0],r[3]); return f'<rect x="{x}" y="{y}" width="{(r[2]-r[0])/24}" height="{(r[3]-r[1])/24}" fill="{fill}"/>'
k=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 660"><rect width="660" height="660" fill="#fffdf8"/><g font-family="sans-serif" fill="#243640"><text x="42" y="32" font-size="21">Common ground grid • 52 proposed pile heads</text><text x="42" y="55" font-size="12">12 × 12 m reference house  |  north ↑  |  development comparison</text>']
for _,r,z in rects():k.append(boxsvg(r,'#c4b89f' if z[0]==-750 else '#d2d7d1'))
k.append(boxsvg([7750,6450,12000,7350],'#a2dbea'))
for h in hd.values():
    x,y=S(*h['xy']);c='#9e493c' if 'stability corner group' in h['roles'] else '#415963'
    k.append(f'<circle cx="{x}" cy="{y}" r="8.33" fill="{c}"/><text x="{x}" y="{y+2.2}" fill="white" text-anchor="middle" font-size="6">{h["id"]}</text>')
k+=['<text x="42" y="614" font-size="12">Red: four stability groups (12 heads) · grey: remaining 40 · blue: protected water passage.</text><text x="42" y="636" font-size="12">Head positions are explicit. Pile group interaction, signed forces and site capacity are separate.</text></g></svg>']
save(D/'current-house-grid.svg','\n'.join(k)+'\n')
