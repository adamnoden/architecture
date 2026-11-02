"""Source-bound joined ordinary north-eave geometry and conditional joint schedule.

No fabrication, air test, thermal acceptance, classified perimeter, or site approval.
"""
from pathlib import Path
import hashlib, json, math, subprocess, sys

ROOT=Path(__file__).resolve().parents[3]
OUT=Path(__file__).with_suffix('')
def git(*a): return subprocess.check_output(['git',*a],cwd=ROOT,text=True).strip()
def blob(b): return hashlib.sha1(f'blob {len(b)}\0'.encode()+b).hexdigest()
def source(p,expected):
    raw=(ROOT/p).read_bytes(); commit=git('log','-1','--format=%H','--',p)
    assert blob(raw)==expected==git('rev-parse',f'{commit}:{p}'), f'Deliberately rebind {p}'
    return json.loads(raw),dict(path=p,commit=commit,blob=expected)

e,ei=source('project/mat/studies/loggia-roof-edge.json','731c85d24e775259f1cf84d264d4ceaf75d89774')
s,si=source('project/str/studies/open-loggia-support.json','20dec4384d09a0d02075fdd34a247e775532763b')
t,ti=source('project/mat/studies/loggia-roof-wall-thermal.json','3e6c7e91d80249e3ca1c16081d76bd36c88a4345')
h,hi=source('project/had/studies/open-north-loggia.json','25faad2c4d40df2b7da7212f73808843a88d2f52')
st=s['actual_roof']; g=e['geometry']; a=e['air']; c=e['ceiling']; w=e['weather']
assert h['envelope']==429.5 and e['ordinaryWall']['roomToWeather']==[27,140,110,50,102.5]
assert st['north_frames_x']==[4377.5,7622.5] and st['collector']['section']['b']==260
assert [g['endPurlinQ'],g['postNormal'],g['normalStack']]==[450,346,500.7]
assert g['endRows']==[8200,11550] and a['primaryFrame']['atQ']==550
assert c['completeDepth']==176 and c['requiredClosedReturn']==96
assert w['vent']['continuousChannels']==[490.8333333333,50]
assert t['geometry']['collector']==e['collector']['bounds']

left,right=st['north_frames_x']; pitch=(right-left)/6
rails=[round(left+i*pitch,6) for i in range(7)]
channels=[[round(x+25,6),round(y-25,6)] for x,y in zip(rails,rails[1:])]
assert all(abs(b-a-490.8333333333)<1e-5 for a,b in channels)
posts=[dict(x=x,y=8200,q=450,kind='endpoint frame/post compound joint' if i in (0,6) else 'intermediate post collar',
            airCrossQ=g['postAvclCrossingQ']) for i,x in enumerate(rails)]
frame=a['primaryFrame']
assert frame['lower']<frame['upper']<frame['roofSheet'] and frame['lower']>6640
assert e['clearances']['plateAfterAllowance']>12 and e['clearances']['airAfterAllowance']>12
v=dict(status='Conditional connected ordinary north-eave bay and endpoint; no selected fabrication, material, roof, fire, thermal or physical admission.',
 inputs={'MATedge':ei,'STR':si,'MATthermal':ti,'HAD':hi},
 plan=dict(northEaveWallY=7750,frameAxesX=st['north_frames_x'],railCentresX=rails,clearVentChannelsX=channels,
           endPurlinY=8200,postGridAtEndRow=posts,
           qualification='The q450 row is a MAT/STR coordinated development delta, not the old STR JSON purlin row at8300. The endpoint post/frame/purlin convergence is an unresolved three-dimensional welded/bolted geometry, not a free bay collar.'),
 sections={'bay':{'post':{'bottom':g['postBottom'],'head':g['postHead'],'AVCLcrossQ':g['postAvclCrossingQ']},
                   'roofAVCL':'1 mm supported metal at lower face of320 glass; post has independent welded AVCL collar; no glass bears cover loads.',
                   'airReturn':'q550 down to z6640, q489.5 at collector finish; below collector underside6540 to ordinary q429.5 finish.',
                   'thermal':'500.7 normal roof/320 glass contacts ordinary 429.5 wall/110 glass; collector260 replaces60 locally, leaving50 glass; toe/retainer and wallhead/cavity cap unresolved.'},
               'frame':{'x':left,'airSheetZ':frame['roofSheet'],'primarySHSZ':[frame['lower'],frame['upper']],
                        'airReturnQ':550,'postX':left,'postQ':450,'compoundJoint':'Separate q450 post collar on field AVCL plus q550 frame-skin saddle; no unpierced q550 drop through steel. Their 100 mm plan separation is not a weld/access clearance proof.',
                        'ceiling':'Protected top6620/bottom6444 stops at collector finish489.5; independent support and complete classified96 return to soffit6540 remain required.'}},
 clearance=dict(purlinToPlateGross=e['clearances']['plateVertical'],purlinToPlateAfter10=e['clearances']['plateAfterAllowance'],
                purlinToAirGross=550-e['clearances']['bodyMaxQ'],purlinToAirAfter10=e['clearances']['airAfterAllowance'],
                airTurnToCarrierReserve=6640-c['carrierReserve'][1]),
 paths=dict(air='Room plaster → clamped finish transition → bay q550 return → supported roof AVCL. At discrete frame axes the separate upper/lower sheet edges must connect by an all-around qualified saddle to closed, sealed SHS skin; post collars are separate and remain finite at the q450 grid.',
            coldWater='Moving zinc hem discharges into receiver; separate breather laps over cold-side support to its own drip, also entering the same receiver. A blocked receiver is common failure, not redundancy.',
            ventilation='30 gross eave throat, minimum50 percent mesh yields15 equivalent; each of six 490.833×50 channels runs inward beside NS rails. No EW blocking. High exit/ridge/hip/valley/corners unqualified.',
            fire='The protected ceiling176 with100 wool and classified96 perimeter terminates at projecting collector face; never trim the family or run through RC.'),
 jointSchedule=[
  dict(id='A',operation='Set collector cage/seat and primary frame with access to its full skin; verify actual load path and linked shear.',hold='STR collector and frame ends/joints, closed skin, corrosion and weld-access proof; no frame as generic air seal.'),
  dict(id='B',operation='Set end purlin q450 and lower boards; fit post bases at all seven x, including two compound frame axes; reserve collar access before glass.',hold='STR owning row/source and local 3D purlin/frame/post weld, bolt, load, erection and 10 allowance.'),
  dict(id='C',operation='Join supported AVCL across lower board field; collar each post at q439.435; in bays fold q550 return; at frame axes weld distinct upper/lower saddle edges to closed SHS skin.',hold='Full all-around access, sealed frame ends, tested sheet/steel/plaster joint, differential movement, corrosion, serviceability and vapour performance.'),
  dict(id='D',operation='Fit320 bare glass and wall110 with actual50 neck around collector, toe support and movement-compatible retention; hold wall cavity head and fire closure.',hold='3D post/frame/collector heat and transient hygrothermal/drying, full constituents and mechanical retention.'),
  dict(id='E',operation='Complete protected176 ceiling on independent supports to collector finish; provide complete classified96 return at soffit6540.',hold='IAS/STR classified assembly and real end support; 12 mm z6640–6628 reservation is only a geometry screen.'),
  dict(id='F',operation='Install breather with separate collars at posts, cold NS rails, open EW boards, moving zinc hem, vent mesh and secondary drip.',hold='ROF system/fasteners, movement, high vent exit and water lap testing; no EW vent blockage.'),
  dict(id='G',operation='Use exterior access for inspection; renew gutter from its cold rail cradles, protect exposed roof temporarily for deeper sheet/glass repair.',hold='RWT common receiver blockage, catchment/capacity and maintainable weather state; roof is not a walking surface.')],
 thermalFalsifier=dict(source='MAT dry steady2D joined collector screen',bayMinimumC=16.750,solidContinuousFrameStressMinimumC=16.438,
     interpretation='At authored20/0C and films0.13/0.04, collector underside is sensitive. These cut-specific figures do not include finite post collars, hollow steel or installed vapour/air leakage; no surface, condensation, whole-U or ISO psi acceptance. A worse joined 3D/climate result or failed movement-compatible closure defeats this assembly.'),
 verdict='The bay and edge paths can be drawn together, but the two endpoint compound post/frame junctions, actual air weld access, classified perimeter and upper vent exits prevent selection. Six-row owning exit remains open.')

def esc(x): return str(x).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
def tx(x,y,s,size=3.3,fill='#203746'):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}">{esc(s)}</text>'
svg=['<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297">',
     '<rect width="420" height="297" fill="white"/><g font-family="Arial,sans-serif">',
     tx(12,13,'JOINED NORTH ORDINARY EAVE · plan and orthogonal sections · unselected development',5),
     tx(12,21,'q is plan inward from wall weather line y7750; x axes and z are project millimetres.',3.2),
     '<rect x="12" y="28" width="193" height="117" fill="#f5f6f3" stroke="#58717c" stroke-width=".3"/>',
     tx(17,35,'PLAN · one 3245 span / seven NS rail centres',4)]
X=lambda x:22+(x-left)*.052
Y=lambda y:117-(y-7750)*.14
for i,x in enumerate(rails):
    svg += [f'<line x1="{X(x):.2f}" y1="42" x2="{X(x):.2f}" y2="119" stroke="#517687" stroke-width="1.2"/>',
            f'<circle cx="{X(x):.2f}" cy="{Y(8200):.2f}" r="2.2" fill="{ "#a04439" if i in (0,6) else "#39747b"}"/>']
svg += [f'<line x1="22" y1="{Y(8200):.2f}" x2="{X(right):.2f}" y2="{Y(8200):.2f}" stroke="#6f7984" stroke-width="1.2"/>',
        f'<line x1="22" y1="{Y(7750):.2f}" x2="{X(right):.2f}" y2="{Y(7750):.2f}" stroke="#a17861" stroke-width="1"/>',
        tx(17,127,'Red endpoints: post + frame axis; blue five posts: separate AVCL collars.',2.8),
        tx(17,134,'Six clear 490.833 × 50 channels inward; no EW blocker.',2.8),
        '<rect x="211" y="28" width="197" height="117" fill="#f5f6f3" stroke="#58717c" stroke-width=".3"/>',
        tx(216,35,'BAY SECTION q–z · intermediate x6000',4),
        tx(216,46,'Zinc /24 board /50 clear vent /1 breather',3.2),
        tx(216,55,'320 bare glass /1 supported AVCL /24 board /80 SHS',3.2),
        tx(216,64,'q450 post crosses AVCL at q439.435; two distinct collars',3.2),
        tx(216,73,'q550 air drops to6640 → collector finish q489.5',3.2),
        tx(216,82,'260 RC at q202.5–462.5, z6540–6680;50 glass neck',3.2),
        tx(216,91,'176 protected ceiling z6444–6620; classified96 return',3.2),
        tx(216,100,'Plate gap22.212; after authored10 =12.212 mm',3.2),
        tx(216,109,'Air/purlin gap22.097; after10 =12.097 mm',3.2),
        tx(216,121,'Collector underside is the dry2D thermal sensitivity locus.',3.1),
        '<rect x="12" y="151" width="193" height="100" fill="#f5f6f3" stroke="#58717c" stroke-width=".3"/>',
        tx(17,159,'FRAME SECTION x4377.5 · compound endpoint',4),
        tx(17,170,'Roof AVCL at z6918.759',3.2),
        tx(17,179,'Primary SHS at q550: z6804.008–6892.278',3.2),
        tx(17,188,'Return intersects 88.270 mm steel. Saddle to sealed skin.',3.2),
        tx(17,197,'Post at q450 is distinct, though on same frame axis.',3.2),
        tx(17,206,'All-around weld/access and movement remain UNSOLVED.',3.2,'#a04439'),
        tx(17,215,'No sheet penetrates steel; no open SHS cavity credited.',3.2),
        tx(17,225,'Air turn z6640; carrier reserve to6628 is only12.',3.2),
        tx(17,237,'Full classified96 return to soffit6540 still open.',3.2),
        '<rect x="211" y="151" width="197" height="100" fill="#f5f6f3" stroke="#58717c" stroke-width=".3"/>',
        tx(216,159,'INDEPENDENT PATHS AND FAILURE',4),
        tx(216,170,'Warm: plaster → return → roof sheet; frame skin local.',3.1),
        tx(216,179,'Cold: moving zinc hem; separate breather drip.',3.1),
        tx(216,188,'Vent: 30 gross ×50% mesh =15 equivalent;',3.1),
        tx(216,197,'six NS channels50 clear; ridge/hips still open.',3.1),
        tx(216,206,'Both water sheets share one receiver; blockage common.',3.1),
        tx(216,215,'50 glass neck + frame stress: no 3D/moisture pass.',3.1),
        tx(216,225,'Roof repair needs temporary weather protection.',3.1),
        tx(216,237,'No material, fire, site, physical or whole-U admission.',3.1,'#a04439'),
        tx(12,266,'Source-bound geometry; q450 is a coordinated STR/MAT delta awaiting owning STR source. See joint schedule and six open exits.',3.4),
        tx(12,277,'Thermal screen: bay Tmin16.750°C, severe continuous solid-frame stress16.438°C at authored20/0°C; neither tests collars or climate.',3.2),
        tx(12,286,'This sheet is a spatial falsifier and construction sequence prompt, not a fabrication or classified assembly drawing.',3.2),'</g></svg>\n']
# Two coordinate sections. The frame plane is drawn at its actual q-z occupancy;
# the endpoint post also lies on this x plane, but the q separation is not access.
ang=math.radians(25); slope=math.tan(ang); cos=math.cos(ang)
def roof(q,d): return 7100+q*slope-d/cos
BX=lambda q:24+q*.242
BZ=lambda z:260-(z-6400)*.245
FX=lambda q:216+(q-300)*.31
FZ=lambda z:251-(z-6500)*.29
def poly(points,fill,stroke='#657987'):
    return '<polygon points="'+' '.join(f'{x:.2f},{y:.2f}' for x,y in points)+f'" fill="{fill}" stroke="{stroke}" stroke-width=".45"/>'
def band(q0,q1,d0,d1,X,Z,fill):
    return poly([(X(q0),Z(roof(q0,d0))),(X(q1),Z(roof(q1,d0))),
                 (X(q1),Z(roof(q1,d1))),(X(q0),Z(roof(q0,d1)))],fill)
def rect(q0,q1,z0,z1,X,Z,fill):
    return poly([(X(q0),Z(z0)),(X(q1),Z(z0)),(X(q1),Z(z1)),(X(q0),Z(z1))],fill)
def path(points,X,Z,col='#ad403c',dash=''):
    return '<polyline points="'+' '.join(f'{X(q):.2f},{Z(z):.2f}' for q,z in points)+f'" fill="none" stroke="{col}" stroke-width="1.35" {dash}/>'
sec=['<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297">',
     '<rect width="420" height="297" fill="white"/><g font-family="Arial,sans-serif">',
     tx(12,13,'JOINED NORTH EAVE · two actual q–z cuts · conditional section coordinates',5),
     tx(12,20,'Vertical is project z; q is plan inward. Sections have their own stated scales and schematic joint symbols.',3.2),
     '<rect x="12" y="27" width="192" height="239" fill="#f6f7f5" stroke="#647c86" stroke-width=".4"/>',
     '<rect x="210" y="27" width="198" height="239" fill="#f6f7f5" stroke="#647c86" stroke-width=".4"/>',
     tx(17,35,'A · intermediate post x6000 · q-z at 0.242 / z0.245',3.5),
     tx(215,35,'B · compound endpoint x4377.5 · enlarged q-z',3.5),
     '<defs><clipPath id="bay"><rect x="15" y="39" width="185" height="224"/></clipPath><clipPath id="frame"><rect x="213" y="39" width="191" height="224"/></clipPath></defs>',
     '<g clip-path="url(#bay)">',
     rect(202.5,462.5,6540,6680,BX,BZ,'#a9bbc9'),
     rect(262.5,402.5,6400,6540,BX,BZ,'#b9ad9c'),
     rect(152.5,262.5,6400,6540,BX,BZ,'#e9d083'),
     rect(202.5,262.5,6680,roof(202.5,395.7),BX,BZ,'#e9d083'),
     rect(489.5,700,6444,6620,BX,BZ,'#eadcc6'),
     band(152.5,550,75.7,395.7,BX,BZ,'#e9d083'),
     band(152.5,550,24.7,75.7,BX,BZ,'#d2e1e5'),
     band(152.5,550,0,24.7,BX,BZ,'#b99d78'),
     band(262.5,550,396.7,420.7,BX,BZ,'#b99d78'),
     path([g['postBottom'],g['postHead']],BX,BZ,'#4b7185'),
     path([(262.5,roof(262.5,396.7)),(550,roof(550,396.7)),(550,6640),(489.5,6640),(489.5,6540),(429.5,6540),(429.5,6400)],BX,BZ),
     path([(489.5,6444),(489.5,6540)],BX,BZ,'#aa6544','stroke-dasharray="2 1"'),
     '</g>',
     '<g clip-path="url(#frame)">',
     band(400,640,75.7,395.7,FX,FZ,'#e9d083'),
     band(400,640,24.7,75.7,FX,FZ,'#d2e1e5'),
     band(400,640,0,24.7,FX,FZ,'#b99d78'),
     band(400,640,396.7,420.7,FX,FZ,'#b99d78'),
     band(400,640,420.7,500.7,FX,FZ,'#8295a0'),
     path([g['postBottom'],g['postHead']],FX,FZ,'#4b7185'),
     path([(400,roof(400,396.7)),(640,roof(640,396.7))],FX,FZ),
     path([(550,roof(550,396.7)),(550,frame['upper'])],FX,FZ),
     path([(550,frame['lower']),(550,6640),(489.5,6640)],FX,FZ),
     '</g>',
     tx(330,220,'Red: air sheet',3.1),
     tx(330,228,'Blue: post',3.1),
     tx(330,236,'Gray: SHS',3.1),
     tx(330,244,'Joint unproved',3.1,'#a04439'),
     tx(17,278,'A: geometry at x6000 omits finite bridge/collar heat and qualified glass toe.',3),
     tx(17,287,'B: solid gray primary is actual occupied band; joint marks propose a saddle, not a weld detail or air test.',3),
     '</g></svg>\n']
outputs={str(OUT)+'.json':json.dumps(v,indent=2)+'\n',str(OUT)+'.svg':'\n'.join(svg),str(OUT)+'-sections.svg':'\n'.join(sec)}
for p,body in outputs.items():
    if '--check' in sys.argv: assert Path(p).read_text()==body, p+' stale'
    else: Path(p).write_text(body)
print(json.dumps({'rails':rails,'channels':len(channels),'endpointCompound':2,'bayPosts':5,'after10':[v['clearance']['purlinToPlateAfter10'],v['clearance']['purlinToAirAfter10']]}))
