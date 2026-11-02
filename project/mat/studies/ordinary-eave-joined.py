"""FIRST outer-north ordinary eave: source topology and finite section checks.

Three coordinate cuts and a joint schedule, not a buildable assembly or approval.
"""
from pathlib import Path
import hashlib,json,math,subprocess,sys

ROOT=Path(__file__).resolve().parents[3]; OUT=Path(__file__).with_suffix('')
EXPECTED={
 'project/had/studies/open-north-loggia.json':'25faad2c4d40df2b7da7212f73808843a88d2f52',
 'project/had/studies/open-north-facade-projection.json':'621d7c41da4ebb9b9fa810be239f8b35eb442106',
 'project/str/studies/open-loggia-support.json':'20dec4384d09a0d02075fdd34a247e775532763b',
 'project/mat/studies/loggia-roof-edge.json':'731c85d24e775259f1cf84d264d4ceaf75d89774',
 'project/mat/studies/loggia-roof-wall-thermal.json':'3e6c7e91d80249e3ca1c16081d76bd36c88a4345'}
GENERATOR_SHA256='cfab4dffa6dd8212dac041577b67e675d0419adc6b3387af1cd27f186558a9b7'
def git(*a):return subprocess.check_output(['git',*a],cwd=ROOT,text=True).strip()
def blob(raw):return hashlib.sha1(f'blob {len(raw)}\0'.encode()+raw).hexdigest()
def load(path,expected):
 raw=(ROOT/path).read_bytes();assert blob(raw)==expected,(path,'source changed')
 # Bootstrap permits precisely the newly generated projection before the
 # author commits it. The final --check is always against tracked bytes.
 if '--bootstrap' not in sys.argv:
  assert expected==git('rev-parse',f'HEAD:{path}'),(path,'untracked or changed input')
 return json.loads(raw),{'path':path,'blob':expected}
assert hashlib.sha256((ROOT/'project/had/studies/open-north-loggia.mjs').read_bytes()).hexdigest()==GENERATOR_SHA256
h,hi=load('project/had/studies/open-north-loggia.json',EXPECTED['project/had/studies/open-north-loggia.json'])
occ,oi=load('project/had/studies/open-north-facade-projection.json',EXPECTED['project/had/studies/open-north-facade-projection.json'])
s,si=load('project/str/studies/open-loggia-support.json',EXPECTED['project/str/studies/open-loggia-support.json'])
e,ei=load('project/mat/studies/loggia-roof-edge.json',EXPECTED['project/mat/studies/loggia-roof-edge.json'])
t,ti=load('project/mat/studies/loggia-roof-wall-thermal.json',EXPECTED['project/mat/studies/loggia-roof-wall-thermal.json'])
st=s['actual_roof'];g=e['geometry'];frame=e['air']['primaryFrame'];wall=occ['first']['outerNorth']
assert occ['selectedHAD']==h['selection']['identity']
assert wall['id']=='outer-north' and wall['finishedFaces']==[11570.5,12000] and wall['thickness']==429.5
assert not any(o['centre']+o['width']/2>4377.5 and o['centre']-o['width']/2<7622.5 for o in wall['openings'])
assert [x['t'] for x in occ['ground']['loggiaWeather']]==[519.5,519.5]
assert st['north_frames_x']==[4377.5,7622.5] and st['seat_y']==[8082.5,11667.5]
assert st['collector']['section']['b']==260 and st['collector']['top']==6680 and st['collector']['bottom']==6540
assert e['ordinaryWall']['roomToWeather']==[27,140,110,50,102.5] and g['normalStack']==500.7
assert [g['endPurlinQ'],g['postNormal'],g['endRows']]==[450,346,[8200,11550]]
assert t['geometry']['collector']==e['collector']['bounds']
domains=occ['first']['protectedRoofClosureDomains']['rectangles']
def protected(x,y):return any(x0<=x<=x0+dx and y0<=y<=y0+dy for _,(x0,y0,dx,dy) in domains)
assert not protected(6000,11550) and not protected(4377.5,11550)
assert h['roofDevelopment']['protectedCeiling']['bottom']==6444 # negative control only

ang=math.radians(25);cs=math.cos(ang);sn=math.sin(ang)
def roof(q,d=0):return 7100+q*math.tan(ang)-d/cs
def y(q):return 12000-q
axes=st['north_frames_x'];step=(axes[1]-axes[0])/6
rails=[round(axes[0]+i*step,6) for i in range(7)]
channels=[[round(x+25,6),round(z-25,6)] for x,z in zip(rails,rails[1:])]
assert all(abs(z-x-490.8333333333)<1e-5 for x,z in channels)
post={'bottomQZ':g['postBottom'],'headQZ':g['postHead'],'worldFootAtP6000':[6000,y(450),g['postBottom'][1]],
      'worldHeadAtP6000':[6000,y(g['postHead'][0]),g['postHead'][1]],
      'AVCLCrossQ':g['postAvclCrossingQ'],'AVCLCrossWorldY':y(g['postAvclCrossingQ'])}
assert abs(post['worldHeadAtP6000'][1]-11696.225918562282)<1e-6
assert abs(roof(-220,75.7)-6913.88717)<.01
ceiling={'family':'U-B4 / C-O70 ordinary at this FIRST bay','top':6620,'finish':6550,'depth':70,
 'localCollectorUndersideReservation':27,'localUnderside':6513,'dropBelowOrdinaryFinish':37,
 'receiver':'Mechanically supported mineral/metal underside receiver and complete constituent fit required; lime adhesion not assumed.',
 'negativeControl':'C-U176/96 belongs only to protected circulation/void domains, not these stations.'}
assert ceiling['top']-ceiling['finish']==70 and 6540-ceiling['localUnderside']==27
plateTop=st['collector']['top_of_plate'];primaryUnder=st['collector']['primary_under_at_support']
assert plateTop==6702 and 0<primaryUnder-plateTop<1
assert e['clearances']['plateVertical']>22 and e['clearances']['airAfterAllowance']>12
air=[(550,roof(550,396.7)),(550,6640),(489.5,6640),(489.5,6513),(429.5,6513),(429.5,6300)]
assert air[0][1]==frame['roofSheet'] and frame['upper']<air[0][1] and frame['lower']>6640
def spatial_gate(face='FIRST outer-north',ceiling_family='C-O70',collars=7,receiver=True,
                 clear_channels=6,vent_depth=50):
 return (face=='FIRST outer-north' and ceiling_family=='C-O70' and collars==7 and
         receiver and clear_channels==6 and vent_depth==50 and air[3]==(489.5,6513) and
         e['ordinaryWall']['roomToWeather']==[27,140,110,50,102.5])
assert spatial_gate()
assert not spatial_gate(collars=6)  # one post penetration left open
assert not spatial_gate(receiver=False)  # lower air edge ends in space
assert not spatial_gate(clear_channels=5)  # one EW vent block
assert not spatial_gate(face='GROUND loggia 519.5 / portal 775')
assert not spatial_gate(ceiling_family='C-U176/96')

v={'status':'Conditional connected FIRST outer-north ordinary roof/wall/control section. Geometry and finite operations only; no material, weld, fire, moisture, structure, site or physical admission.',
 'inputs':{'HADselected':hi,'HADsceneProjection':oi,'HADgeneratorSHA256':GENERATOR_SHA256,'STR':si,'MATedge':ei,'MATthermal':ti},
 'historicalRejectedControl':{'remoteHead':'c622a56fd5497ed788d85ad0aa50d8479b9f1ca7',
  'error':'Earlier plan mapped q450 to y8200 and placed ordinary429.5 plus protected176/96 at x6000. The selected FIRST target is outer-north y12000−q and has ordinary70. Ground519.5 loggia sidewalls/775 portal are separate.'},
 'occurrence':{'level':'FIRST','face':'outer-north','pRange':axes,'qRange':[-370,900],
  'worldTransform':'p=x, y=12000−q, z=7100+q tan25−d/cos25 for roof normal depth d',
  'outerEnclosure':wall,'groundLoggiaNotThisWall':occ['ground']['loggiaWeather'],
  'northWindowsOutsideBay':[o for o in wall['openings'] if o['centre'] in [3700,8300]],
  'actualCoreQ':[262.5,402.5],'actualCoreWorldY':[11597.5,11737.5],'structuralAxisWorldY':11667.5,
  'collectorQZ':[202.5,462.5,6540,6680],'collectorFinishQ':489.5,'ordinaryFinishQ':429.5,
  'glassNeck':50,'ceiling':ceiling},
 'plan':{'railCentresP':rails,'sixClearChannelsP':channels,'purlinRowsQ':[450,900],
  'purlinRowsWorldY':[11550,11100],'endPostWorldFootAndHead':post,
  'clearBayCutP':round((rails[3]+rails[4])/2,6),'postCutP':6000,'primarySeatCutP':4377.5,
  'seatWorldXY':[[p,11667.5] for p in axes],
  'groundPortalJambDestinationsOnly':[{'p':[4307.5,4520],'worldY':[11560,11775]},
                                        {'p':[7480,7692.5],'worldY':[11560,11775]}],
  'qualification':'Ground jambs are named downstream territories, not columns through arches. STR q450/RHS120x60x5 is coordinated MAT delta, not owning STR source selection.'},
 'clearances':{'purlinLowToPlateGross':e['clearances']['plateVertical'],
  'purlinLowToPlateAfterAuthored10':e['clearances']['plateAfterAllowance'],
  'purlinBodyToAirGross':550-e['clearances']['bodyMaxQ'],
  'purlinBodyToAirAfter10':e['clearances']['airAfterAllowance'],
  'primarySeatPlateTop':plateTop,'primaryUndersideAtSeat':primaryUnder,
  'primarySeatGrossGap':primaryUnder-plateTop,
  'primarySeatDisposition':'0.586 mm nominal is NOT tolerance/bearing/hold-down proof. STR must give actual seat plate/grout/bolt/cage readback.'},
 'sections':{'clearBay':{'p':round((rails[3]+rails[4])/2,6),'warmAirPolylineQZ':air,
  'wall':'429.5 ordinary/110 glass;260 RC locally leaves50 neck; supported glass toe/contact required',
  'roof':'500.7 normal/320 glass/50 open vent; q900 is only next purlin cut, not ridge outlet',
  'ceiling':'U-B4 C-O70/70, local27 underside receiver to6513,37 drop; exact components/structural support held'},
  'post':{'p':6000,'post':post,'AVCLCollar':'Distinct continuous welded 1mm warm-sheet collar at q439.435; glass has no cover load.',
   'breatherCollar':'Distinct cold-side collar near post head crossing, with outward lap/drip; no warm/cold sheet short.',
   'warmReturn':'The same q550→6640→489.5→6513→429.5 path is retained behind the post; air continuity not supplied by a line touch.'},
  'primarySeat':{'p':4377.5,'SHSAtQ550Z':[frame['lower'],frame['upper']],
   'roofSheetAtQ550Z':frame['roofSheet'],'intersectionZ':frame['verticalIntersection'],
   'saddle':'Upper and lower sheet edges join all-around welded collar to closed SHS skin, then lower sheet reaches collector finish/underside receiver and ordinary plaster. Separate q450 post collar shares p but not q.',
   'seat':'At core q332.5/axis y11667.5 primary underside6702.586 over plate top6702; local bearing/hold-down/steel clearance unproved.',
   'ground':'Named portal jamb territories below are load destinations only; first-floor collector and support path must be proved.'}},
 'cold':{'zincEdgeQWorldY':[-200,12200],'zincEdgeZ':roof(-200),
  'breatherDripQWorldY':[-220,12220],'breatherDripZ':roof(-220,75.7),
  'gutterQ':[-370,-170],'gutterWorldY':[12370,12170],'gutterBottom':6730,
  'gutterBackCrest':6880,'gutterFrontSpill':6840,
  'ventGrossThroat':30,'meshOpenMinimum':.5,'netEquivalent':15,
  'sixChannelsDepth':50,'sharedReceiverFailure':'Zinc hem and secondary breather drip are distinct exits to SAME gutter. Blocked common receiver fails both.',
  'cavity':'Ordinary50 drained wall cavity has separately supported/weathered head and drainage to its own managed path; no direct leak into room or glass. Exact cap/fire and corner are unproved.',
  'highExit':'q900 is not a ridge; high ventilation/hip/valley/corner continuation remains ROF work.'},
 'operations':[
  {'step':'1 receiver','action':'Set RC260 collector on real upper masonry/seat territories, frame and plate; resolve linked structure and plate/grout/hold-down at0.586 nominal gap.','stop':'No fictitious member through ground portal arch; STR actual bearing/connection proof.'},
  {'step':'2 lower deck/post','action':'Install q450 and q900 purlins and lower board, then seven direct post bases, including two primary axes, with access before glass.','stop':'Owning STR q450 geometry, tolerance, frame/post/purlin collision and load path.'},
  {'step':'3 warm control','action':'Place supported1mm roof AVCL, seven distinct post collars, bay q550 return, and all-around primary skin saddles at two frame axes; continue lower sheet to q489.5 receiver then underside6513 and ordinary q429.5 plaster.','stop':'Full weld access, sealed frame ends, mechanically fixed mineral/plaster receiver, differential movement, corrosion, tested air/gas/vapour continuity.'},
  {'step':'4 thermal/ceiling','action':'Retain roof320 and wall110 with actual50 collector neck, toe/retainer, O70 ceiling and27 underside receiver below RC; keep cavity head independent.','stop':'Complete constituent fit and mechanical support, collector thermal 3D, vapour/air leak and transient climate/drying; if27 cannot fit, openly revise.'},
  {'step':'5 cold weather','action':'Independently collar post breather, maintain six clear50 NS channels, mesh30 eave throat, support separate drip and moving zinc hem to shared gutter.','stop':'No EW vent blockage or reverse lap; ROF ridge/hip/valley/corner/wind/weather proof.'},
  {'step':'6 renewal','action':'From external access lower gutter150 and move outward400 while hem/drip stay fixed; for deeper repair arrange temporary weather protection before dismantling layers.','stop':'RWT receiver blockage/capacity, access/handling; roof boards are not walking surface.'}],
 'negativeControls':['Remove post collar: warm air sheet pierced, FAIL','Remove local underside receiver: sheet terminates in space, FAIL',
  'Block one50 NS channel with EW transom: ventilation continuity FAIL','Substitute GROUND519.5 sidewall/775 portal for FIRST ordinary north enclosure: occurrence FAIL',
  'Use protected C-U176/96 at these FIRST stations: ceiling-domain FAIL'],
 'thermalFalsifier':{'ordinaryBayMinimumOccupiedC':16.750,'severeSolidContinuousFrameMinimumC':16.438,
  'limit':'Prior dry2D20/0C film0.13/0.04 source omits finite post/collar/hollow steel, actual27 receiver, void exchange and climate. It is a sensitivity locus, not a 3D/whole-U/condensation pass.'},
 'verdict':'Connected spatial candidate at genuine FIRST outer-north ordinary bay. Seat0.586, collar/fabrication, receiver constituents, 3D heat/moisture, cold high exits and six owning rows remain open; no selection.'}

def esc(a):return str(a).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
def text(x,y,s,size=3.2,color='#243d49'):return f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}">{esc(s)}</text>'
def line(points,color='#a7443d',width=.6,dash=''):
 return '<polyline points="'+' '.join(f'{x:.2f},{y:.2f}' for x,y in points)+f'" fill="none" stroke="{color}" stroke-width="{width}" {dash}/>'
def rect(x,y,w,h,fill):return f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" fill="{fill}" stroke="#607681" stroke-width=".3"/>'
def poly(a,fill):return '<polygon points="'+' '.join(f'{x:.2f},{y:.2f}' for x,y in a)+f'" fill="{fill}" stroke="#607681" stroke-width=".3"/>'
svg=['<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297">',rect(0,0,420,297,'white'),'<g font-family="Arial,sans-serif">',
 text(12,13,'FIRST OUTER-NORTH · one ordinary bay / actual p–q–world transform',5),
 text(12,21,'p=x 4377.5..7622.5; q=12000−y. Ground loggia walls and portal are distinct below.',3.2),
 rect(13,29,394,129,'#f5f6f3'),text(18,37,'PLAN · upper 429.5 enclosure across this bay, windows3700/8300 outside',4)]
PX=lambda p:38+(p-4377.5)*.104
QY=lambda q:44+(q+370)*.06
svg += [rect(PX(4377.5),QY(0),PX(7622.5)-PX(4377.5),QY(429.5)-QY(0),'#d8c3a4'),
        line([(PX(4377.5),QY(450)),(PX(7622.5),QY(450))],'#7b8290',.8),
        line([(PX(4377.5),QY(900)),(PX(7622.5),QY(900))],'#7b8290',.8)]
for i,p in enumerate(rails):
 svg += [line([(PX(p),QY(-200)),(PX(p),QY(900))],'#527384',.6),
         f'<circle cx="{PX(p):.2f}" cy="{QY(450):.2f}" r="2" fill="{ "#ad473e" if i in (0,6) else "#30798b"}"/>']
svg += [text(19,139,'q−200 edge/worldy12200 · q450/y11550 posts · q900/y11100 next row',3),
        text(19,148,'Six490.833×50 vent channels; primary seats p4377.5/7622.5 at worldy11667.5.',3),
        rect(13,167,192,113,'#f5f6f3'),rect(214,167,193,113,'#f5f6f3'),
        text(19,176,'CONNECTED DUTIES',4),
        text(19,187,'Air: roof sheet → post collars / frame saddles',3),
        text(19,196,'→ q550 descent → z6640 → q489.5 finish',3),
        text(19,205,'→ underside receiver z6513 → q429.5 plaster.',3),
        text(19,216,'O70 top6620/finish6550; local27 reservation',3),
        text(19,225,'under collector to6513:37 below ordinary finish.',3),
        text(19,237,'Collector50 glass neck is the thermal locus.',3),
        text(19,249,'Plate6702 / primary underside6702.586:',3),
        text(19,258,'0.586 nominal is NOT bearing tolerance proof.',3,'#a7443d'),
        text(220,176,'INDEPENDENT COLD PATHS / REPAIR',4),
        text(220,187,'Moving zinc hem q−200 → shared gutter.',3),
        text(220,196,'Breather/drip q−220/z6913.887 → same.',3),
        text(220,205,'30 throat×≥50% mesh=15 equivalent.',3),
        text(220,216,'Wall cavity50 needs own cap/fire/drainage.',3),
        text(220,225,'Gutter q−370..−170; bottom6730.',3),
        text(220,237,'External release: lower150/outward400;',3),
        text(220,246,'temporary weather for deeper repair.',3),
        text(220,258,'q900 is NOT ridge/high vent exit.',3,'#a7443d'),
        text(13,291,'Three genuine cuts and finite operation/negative-control schedule on companion sheet/data. No material, fire, 3D heat or site admission.',3),'</g></svg>\n']

# Coordinate sections: 3 panels, q −370..900, z6300..7400. Vary
# representation by p but retain common receiver and cold exits in each cut.
def cut(panel,kind):
 left=12+panel*136;X=lambda q:left+8+(q+370)*.089;Z=lambda z:251-(z-6300)*.175
 out=[rect(left,29,132,235,'#f7f7f5'),text(left+4,37,kind,3.5)]
 def R(q0,q1,z0,z1,color):return poly([(X(q0),Z(z0)),(X(q1),Z(z0)),(X(q1),Z(z1)),(X(q0),Z(z1))],color)
 def B(q0,q1,d0,d1,color):return poly([(X(q0),Z(roof(q0,d0))),(X(q1),Z(roof(q1,d0))),(X(q1),Z(roof(q1,d1))),(X(q0),Z(roof(q0,d1)))],color)
 out += [f'<g clip-path="url(#clip{panel})">',
  R(0,102.5,6300,6900,'#bd9078'),R(152.5,262.5,6300,6540,'#e8d17c'),
  R(262.5,402.5,6300,6540,'#b9ad9d'),R(202.5,462.5,6540,6680,'#9fb5c2'),
  R(202.5,462.5,6513,6540,'#c4b7a4'),R(489.5,900,6550,6620,'#e9dcc6'),
  R(202.5,262.5,6680,roof(202.5,395.7),'#e8d17c'),
  B(152.5,900,75.7,395.7,'#e8d17c'),B(-200,900,24.7,74.7,'#d2e1e6'),
  B(-200,900,0,24.7,'#bca37d'),B(-220,900,74.7,75.7,'#9684a2'),
  B(262.5,900,396.7,420.7,'#bca37d'),
  line([(X(-220),Z(roof(-220,75.7))),(X(-250),Z(roof(-220,75.7)-20)),(X(-250),Z(6885))],'#756684'),
  line([(X(-200),Z(roof(-200))),(X(-220),Z(roof(-200)-24)),(X(-220),Z(6887))],'#67798c'),
  R(-370,-170,6730,6740,'#9facb5'),
  line([(X(-370),Z(6730)),(X(-370),Z(6840))],'#7d8891'),
  line([(X(-170),Z(6730)),(X(-170),Z(6880))],'#7d8891'),
  line([(X(262.5),Z(roof(262.5,396.7))),(X(550),Z(roof(550,396.7)))])]
 if kind.startswith('A'):
  out += [line([(X(q),Z(z)) for q,z in air]),
          ]
 elif kind.startswith('B'):
  out += [line([(X(q),Z(z)) for q,z in [g['postBottom'],g['postHead']]],'#446e83',1.1),
          line([(X(q),Z(z)) for q,z in air]),
          f'<circle cx="{X(g["postAvclCrossingQ"]):.2f}" cy="{Z(roof(g["postAvclCrossingQ"],396.7)):.2f}" r="1.6" fill="#a7443d"/>',
          ]
 else:
  out += [R(212.5,452.5,6680,6702,'#708795'),B(332.5,900,420.7,500.7,'#7b8d97'),
          line([(X(550),Z(frame['roofSheet'])),(X(550),Z(frame['upper']))]),
          line([(X(550),Z(frame['lower']))]+[(X(q),Z(z)) for q,z in air[1:]]),
          line([(X(q),Z(z)) for q,z in [g['postBottom'],g['postHead']]],'#446e83',1.1),
          ]
 out += ['</g>',text(left+5,267,'Red air path to real receiver/finish;',2.5),
         text(left+5,274,'cold zinc/breather remain separate.',2.5)]
 return out
sections=['<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297">',rect(0,0,420,297,'white'),
 '<defs>'+''.join(f'<clipPath id="clip{i}"><rect x="{12+i*136+1}" y="39" width="130" height="221"/></clipPath>' for i in range(3))+'</defs>',
 '<g font-family="Arial,sans-serif">',text(12,13,'FIRST OUTER-NORTH · three actual p-station q–z cuts; z project mm',5),
 text(12,21,'A clear bay p6270.417 · B post p6000 · C primary/seat p4377.5. Common source geometry; joints schematic.',3.2)]
for i,name in enumerate(['A · clear bay','B · intermediate post','C · primary/seat']):sections+=cut(i,name)
sections += [text(12,286,'O70 finish6550, local27 under RC to6513; frame seat0.586 nominal. Gutter renewal150 down/400 out; deeper work needs weather cover.',3),
 text(12,293,'No weld/air, thermal/hygro, classified constituent, structural, material or physical acceptance.',3,'#a7443d'),'</g></svg>\n']
outputs={str(OUT)+'.json':json.dumps(v,indent=2,ensure_ascii=False)+'\n',str(OUT)+'.svg':'\n'.join(svg),str(OUT)+'-sections.svg':'\n'.join(sections)}
for path,body in outputs.items():
 if '--check' in sys.argv:assert Path(path).read_text()==body,path+' stale'
 else:Path(path).write_text(body)
print(json.dumps({'bay':v['occurrence']['face'],'postFoot':post['worldFootAtP6000'],'postHead':post['worldHeadAtP6000'],
 'seatGap':v['clearances']['primarySeatGrossGap'],'channels':len(channels),'gutterDrip':v['cold']['breatherDripZ']}))
