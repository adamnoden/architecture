#!/usr/bin/env python3
"""Finite proposal screen. Reproduction is not whole-method acceptance."""
import hashlib,json,math,sys
from pathlib import Path
O=Path(__file__).resolve().parent;R=O.parents[2]
s=json.loads((O/'upper-access-renewal.json').read_text());raw=(R/s['hadSource']).read_bytes();h=json.loads(raw)
b,n,p=h['bridge'],h['renewal'],h['passage'];u,l,w=s['upperDrawer'],s['lowerReceiver'],s['workfield']
blob=hashlib.sha1(f'blob {len(raw)}\0'.encode()+raw).hexdigest()
bed=lambda x:p['bedEnds'][0][1]+(x-p['bedEnds'][0][0])*(p['bedEnds'][1][1]-p['bedEnds'][0][1])/(p['bedEnds'][1][0]-p['bedEnds'][0][0])
outer=b['outerSupportReservation'];cx=p['waterClear'][1]+p['waterClear'][3]/2
spineE=max(x+z/2 for x,z in zip(b['supportAxesX'],b['localSupportBeamWidths']))
upperX=n['bodyX'];lowerX=[spineE+l['westBeyondSpineBeam'],l['east']]
uw=u['carriageWidth'];lw=l['waterClear']+2*l['sheet']+2*l['flangeEach']+2*l['carriageExtraEach']
parkStart=n['selectedParkX'][0];upperPark=[parkStart,parkStart+upperX[1]-upperX[0]];lowerPark=[parkStart,parkStart+lowerX[1]-lowerX[0]]
assert lowerX[0]<upperX[1], 'No real receiving overlap'
assert parkStart>outer['fullX'][1]
# Heights compare at the same x, not unrelated extrema along the fall.
rimSeparation=-u['belowBed']-(l['bedOffset']+l['wetDepth'])
bracketSeparation=-u['belowBed']-u['railDepth']-(l['bedOffset']+l['wetDepth'])
assert rimSeparation>0 and bracketSeparation>0
postGap=min((cx-lw/2)-(s['upperRailSupports']['postY'][0]+s['upperRailSupports']['postHalfWidth']),s['upperRailSupports']['postY'][1]-s['upperRailSupports']['postHalfWidth']-(cx+lw/2));assert postGap>0
aperture=s['parkCovers']['clearY'];assert cx-lw/2>aperture[0] and cx+lw/2<aperture[1]
# Every moving rectangle is checked against actual node plans where x ranges overlap.
nodeFailures=[]
for name,xs,width in [('upper', [upperX[0],upperPark[1]],uw),('lower',[lowerX[0],lowerPark[1]],lw)]:
 for nx,ny,wx,wy in [(x,y,*b['supportNodes']['plan']) for x in b['supportAxesX'] for y in b['supportAxesY']]+[(outer['axisX'],y,*outer['nodePlan']) for y in outer['nodeAxesY']]:
  if xs[0]<nx+wx/2 and xs[1]>nx-wx/2 and cx-width/2<ny+wy/2 and cx+width/2>ny-wy/2:nodeFailures.append([name,nx,ny])
assert not nodeFailures,nodeFailures
# Cover hook held at its actual end, with the operator behind it. No shaft tail through a body.
c=s['parkCovers'];coverWidth=aperture[1]-aperture[0];handleRadius=coverWidth-c['handleInset'];coverMotion=[]
for i in range(901):
 theta=math.pi/2*i/900;hy=c['hingeY']+handleRadius*math.cos(theta);hz=handleRadius*math.sin(theta)
 dy=math.sqrt(c['openingToolLength']**2-(c['handHeight']-hz)**2);handY=hy+dy;bodyY=handY+c['bodyBehindHand']
 assert bodyY-c['bodyRadius']>aperture[1] and bodyY+c['bodyRadius']<=w['north']
 assert math.hypot(c['bodyBehindHand'],1450-c['handHeight'])<=600
 coverMotion.append(bodyY)
# Actual rails, not an imaginary -900 standing deck, determine the depth price.
railLow=min(bed(upperPark[1])-u['belowBed']-u['railDepth'],bed(lowerPark[1])+l['bedOffset']-l['belowBed']-l['railDepth'])
allow=h['groundEnvelope']['heaveStress']+h['groundEnvelope']['constructionLoss']+h['groundEnvelope']['ventilationReserve'];dmin=-railLow+allow
assert s['ground']['Dtrial']>=dmin
module=[]
for name,xs,pa,offset,below,lift,width in [('upper',upperX,upperPark,0,u['belowBed'],w['upperLift'],uw),('lower',lowerX,lowerPark,l['bedOffset'],l['belowBed'],w['lowerLift'],lw)]:
 assert min(bed(x)+offset-below+lift for x in pa)>s['deck']['top']
 sy=cx+w['northShift'];assert w['storage'][1]<=sy-width/2 and sy+width/2<=w['storage'][1]+w['storage'][3]
 assert pa[1]<=w['operator'][0] and pa[1]<=w['storage'][0]+w['storage'][2]
 module.append({'module':name,'installedX':xs,'parkX':pa,'translation':pa[0]-xs[0],'bedOffset':offset,'width':width,'lift':lift,'lowestAfterLift':min(bed(x)+offset-below+lift for x in pa)})
out={'identity':s['identity'],'status':s['status'],'hadBlob':blob,'modules':module,'innerFrameToReceiverRim':rimSeparation,'fixedUpperBracketToReceiverRim':bracketSeparation,'lowerCarriageToStaticPosts':postGap,'parkToOuterSupport':parkStart-outer['fullX'][1],'nodeCollisions':nodeFailures,'coverOperatorCentreY':[min(coverMotion),max(coverMotion)],'lowestKnownRail':railLow,'DminimumBeforeUnboundCatchDrain':dmin,'Dtrial':s['ground']['Dtrial'],'qualifiedFirstHarmMargin':None,'methodAcceptance':'INCOMPLETE: hatch/guard/captive staff and handover not yet proven; no capacity, material or water pass','activeHolds':s['activeHolds']}
q=O/'upper-access-renewal.results.json';v=json.dumps(out,indent=2)+'\n'
if '--check' in sys.argv:assert q.read_text()==v;print('Upper-access proposal reproduces; limited drawer/node/cover geometry passes, whole method INCOMPLETE')
else:q.write_text(v);print('Wrote finite upper-access proposal screen; whole method INCOMPLETE')
