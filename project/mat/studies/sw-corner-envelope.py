#!/usr/bin/env python3
"""Source-located SW mineral/air/thermal corner, with rejected crossing controls."""
import ast, hashlib, json, math, re, subprocess, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[3]
OUT=Path(__file__).resolve().parent
EXPECTED={
 'project/had/studies/open-north-loggia.json':'25faad2c4d40df2b7da7212f73808843a88d2f52',
 'project/had/studies/open-north-loggia.mjs':'92df870ae7ff8de65ea16566dda449cacc1c39b7',
 'project/had/studies/open-north-facade-projection.json':'eb70d77ee57571088c4a73caa076681dc00590cd',
 'project/str/studies/physical-slab-join.json':'79b28df58f00fcf6e31a97cd376efe15a6c2566f',
 'project/mat/studies/warm-receiving-grid.json':'a5bff9f37b8d78dfb32359427314b4013fe8a45e'}
def blob(data):return hashlib.sha1(f'blob {len(data)}\0'.encode()+data).hexdigest()
def git(*args):return subprocess.check_output(['git',*args],cwd=ROOT,text=True).strip()
src={}
for path,sha in EXPECTED.items():
 raw=(ROOT/path).read_bytes();assert blob(raw)==sha,(path,'content drift')
 assert git('rev-parse','HEAD:'+path)==sha,(path,'input not tracked at HEAD')
 src[path]=raw
h=json.loads(src['project/had/studies/open-north-loggia.json'])
had=src['project/had/studies/open-north-loggia.mjs'].decode()
outer=ast.literal_eval(re.search(r'const outerDefs=(\[.*?\]);',had).group(1))
assert h['selection']['identity']=='HAD-B-OPEN-LOGGIA-2026-11-02'
assert [(v[0],v[1],v[2]) for v in outer if v[0] in ('outer-south','outer-west')]==[
 ('outer-south',[0,208.75],[12000,208.75]),('outer-west',[208.75,417.5],[208.75,11582.5])]
assert h['envelope']==429.5 and h['finishRewind']['dry']['total']==27
slab=json.loads(src['project/str/studies/physical-slab-join.json'])
assert slab['inner_axis_rectangle_mm']==[332.5,332.5,11667.5,11667.5]
warm=json.loads(src['project/mat/studies/warm-receiving-grid.json'])
assert warm['recipe']['AACZ']==[-605,-390] and warm['recipe']['mineralDPC']==[-765,-615]
assert warm['recipe']['floorZ']==[0,-15,-80,-280,-600]
assert warm['recipe']['warmGridTop']==-80 and warm['recipe']['warmGridSoffit']==-380

wall=[('weather brick',0,102.5),('drained cavity',102.5,152.5),
      ('bare glass',152.5,262.5),('140 core',262.5,402.5),('27 finish',402.5,429.5)]
pad=(262.5,562.5);cold=(0,600)
points=[(x,y) for x in (322.5,502.5) for y in (322.5,502.5)]
roof=(332.5,332.5)
bar_d=20;bore_d=60;band=385;embed=225
assert all(pad[0]+bore_d/2<=u<=pad[1]-bore_d/2 for p in points for u in p)
assert all(cold[0]+bore_d/2<=u<=cold[1]-bore_d/2 for p in points for u in p)
edge_ligament=min(min(u-pad[0]-bore_d/2,pad[1]-u-bore_d/2) for p in points for u in p)
clear=180-bore_d
assert edge_ligament==30 and clear==120 and pad[0]<roof[0]<pad[1]
assert min(p[0] for p in points)<roof[0]<max(p[0] for p in points)
assert min(p[1] for p in points)<roof[1]<max(p[1] for p in points)
area=math.pi*(bore_d/2)**2;bar_area=math.pi*(bar_d/2)**2
net=4*area;steel=4*bar_area;annulus=net-steel
assert math.isclose(net/300**2,math.pi/25)
minor=(roof[0]-322.5)/180;weights=[(1-minor)**2,minor*(1-minor),minor*(1-minor),minor**2]
assert math.isclose(sum(weights),1) and min(weights)>0
two=[(337.5,337.5),(487.5,487.5)]
two_near=(487.5-roof[0])/150
assert two_near>1 # tension-only two-tie interpolation requires negative far tie

# These are isolated axial material indicators at fixed end temperatures, not
# a 3D point bridge, contact result, installed U, or surface-temperature check.
steel_lambda=50;concrete_lambda=1.75
steel_G=steel_lambda*(steel/1e6)/(band/1000)
rc_G=concrete_lambda*(300/1000)**2/(band/1000)
core_replaced=(300*140*2-140*140)/1e6
# Split-rod comparator: diaphragm is wholly within AAC; stop short of its faces.
plate_bottom,plate_top=-574,-571
assert -605 < plate_bottom < plate_top < -390
assert 6640-plate_top==7211 and plate_bottom-(-990)==416
assert (6640-plate_top)+(plate_bottom-(-990))+(plate_top-plate_bottom)==7630
assert math.isclose(core_replaced,.0644)
furniture_hits={level:[name for name,r in h[level].items() if r[0]<pad[1] and r[0]+r[2]>pad[0] and r[1]<pad[1] and r[1]+r[3]>pad[0]] for level in ('groundFurniture','upperFurniture')}
assert not any(furniture_hits.values())
result={
 'status':'Source-located SW corner interface; four-bore geometry is a conditional design enquiry, no structural/material/physical acceptance',
 'inputs':{k:{'path':k,'blob':v} for k,v in EXPECTED.items()},
 'occurrence':{'selectedHAD':h['selection']['identity'],'corner':'outer-south × outer-west, GROUND ordinary; not loggia sidewall or IAS NW window',
  'axis':[332.5,332.5],'outerSouthAxisY':208.75,'outerWestAxisX':208.75,
  'ordinaryPerpendicularLayers_mm':wall,'cornerLayerJoint':'L-shaped turn with min(x,y) shell-distance ownership is a MAT trial; HAD exports enclosure axes, not a bonded physical corner.'},
 'vertical':{'groundFFL':0,'floorRoomToVoid':[15,65,200,320],'floorZ':[0,-15,-80,-280,-600],
  'warmRC':[-380,-80],'upperMortar':[-390,-380],'AAC':[-605,-390],
  'lowerMortar':[-615,-605],'mineralDPC':[-765,-615],
  'coldRC':[-1215,-765],'continuousPier':[-80,6640],'roofCapPlate':[6640,6660],
  'continuousBarTrial':[-990,6640],
  'note':'Cold RC and local warm pad dimensions are coordinated provisional STR station inputs, not selected structural source. Warm-grid material/thermal values came from a 519.5 loggia sidewall and cannot transfer to this 429.5 SW corner.'},
 'plan':{'warmPadXY':[262.5,262.5,562.5,562.5],'coldReceiverXY':[0,0,600,600],
  'ordinaryCoreCornerXY':[262.5,262.5,402.5,402.5],
  'roofPointXY':roof,'barCentresXY':points,'barDiameter':bar_d,'boreDiameter':bore_d,
  'boreToPadEdgeMin':edge_ligament,'boreToBoreClearMin':clear,
  'roomProjectionBeyondFinish':pad[1]-429.5,'glassIntrusion':max(0,262.5-pad[0]),'drainedGapIntrusion':max(0,152.5-pad[0]),
  'boreAreaFraction':net/300**2,'fourBoreArea_mm2':net,'steelArea_mm2':steel,'annulusArea_mm2':annulus,
  'boreVolumeBand_m3':net*band/1e9,'annulusVolumeBand_m3':annulus*band/1e9,
  'fullHeightPierCoreReplaced_m2':core_replaced,'fullHeightRoomToePlan_m2':((pad[1]-429.5)/1000)**2,
  'furnitureRectangleIntersections':furniture_hits,
  'roofCapNominalGapToAssumedSHS_mm':6686.721-6660,
  'roofPointBilinearFractionsThoughtExperiment':weights,
  'limit':'These fractions only demonstrate one nonnegative roof-only equilibrium allocation; actual stiffness, bending, contact, tie capacity, wind combination and biaxial force path belong to STR. The pier replaces a joined 0.0644 m2 ordinary core overlap and projects a 133×133 mm toe into both storeys; furniture rectangles do not certify door/route/fire/roof clearances. Roof plate gap is an assumed inherited SHS level, not actual hip seat/tolerance.'},
 'continuousMetalFieldChallenger':{'fieldZ_mm':[-574,-573],'patchZ_mm':[-574,-571],'structuralPatch_mm':[262.5,262.5,562.5,562.5],'fieldThickness_trial_mm':1,'thickerPatch_trial_mm':3,'grossBounds_mm':[0,0,12000,12000],'grossSquareNotActualFloorArea_m2':144,'grossFieldMass_kg_at_7850':12000*12000*1/1e9*7850,'grossExtraPatchMass_kg_at_7850':300*300*2/1e9*7850,'freeExpansion12m_20K_mm_at_16e6':12000*20*16e-6,'meaning':'Whole-footprint welded sheet concept at local AAC datum, joined continuously to unpierced split-rod patch. A gross 12m bounding square is not a measured actual sheet area or takeoff. Sheet at this datum hangs below much of the suspended slab: an independent substrate/support and all crossings are unplanned.', 'failure':'No complete evidenced sheet assembly, perimeter/court connection, movement seam, rod weld/force route, moisture/gas test or repair strategy is established. Reject as a completed assembly; retain for coupled structural, moisture, thermal, construction and material challenge.'},
 'splitRodDiaphragmRedesign':{'plateXY':[262.5,262.5,562.5,562.5],'plateZ':[-574,-571],'plateThickness_mm':3,'upperRodZ':[-571,6640],'lowerRodZ':[-990,-574],'upperRodLength_mm':7211,'lowerRodLength_mm':416,'weldNote':'Four upper and four lower rod ends join opposite faces of one unperforated plate. Weld size, alloy, fatigue, anchorage, contact and construction access not designed.', 'plateMass_kg_at_7850':.3*.3*.003*7850,'thermalSeriesIndicator_WK':1/(2*(.382/2)/(50*(steel/1e6))+.003/(50*.3*.3)),'boundaryResult':'FAIL as a complete envelope: no evidenced gas-tight and capillary-tight junction from plate perimeter to actual field barrier, no compatible movement joint, and no admissible field gas barrier established. An unperforated plate alone does not close its perimeter or the rod/concrete interfaces.', 'movementChallenge':'Rigid welded crossing ties warm and cold receivers; imposed relative translation, rotation, shrinkage and temperature cycles load bars, welds, plate, concrete and perimeter joint. Their magnitudes and allowable movement require a coupled structural/thermal design; do not assert a sliding or sealed joint.', 'erection':'Prefabricate and inspect accessible rod-to-plate welds; survey and anchor lower rods before casting cold receiver; protect plate and join its perimeter before closing the warm work; position long upper rods and reinforcement, then cast warm receiver and pier. This is a proposed sequence requiring fit, temporary support and pre-concealment inspection, not a method statement.'},
 'controls':{
  'twoTensionOnly':{'centresXY':two,'nearInterpolation':two_near,'farInterpolation':1-two_near,'result':'FAIL: roof point outside their convex hull; far tie would be compression for roof-only uplift. Contact compression might change equilibrium; arbitrary biaxial moment remains unsolved.'},
  'centred300':{'padXY':[182.5,182.5,482.5,482.5],'glassIntrusion':80,'glassRemainingBeforeCavity':30,'drainedGapIntrusion':0,'result':'Not the selected full-glass corner; does not directly occupy the 50 drained slot.'},
  'solidRCBypass':{'samePlanXY':[262.5,262.5,562.5,562.5],'band':[-765,-380],'isolatedAxialG_WK':rc_G,'result':'Direct continuous RC heat/capillary bridge through the intended mineral break; rejected as a dry thermal-break substitution.'},
  'bareOrUnsealedBores':{'result':'FAIL: four penetrations interrupt 215 AAC, two 10 mortar beds and entire 150 mineral DPC; a 20 mm annulus is a reservation, not water/air/gas sealing or shear restraint.'}},
 'isolatedAxialIndicators':{'steelLambdaAuthored_WmK':steel_lambda,'fourShanksG_WK':steel_G,'solidRCG_WK':rc_G,
  'at20K_fourShanks_W':steel_G*20,'at20K_solidRC_W':rc_G*20,
  'limit':'Fixed-end one-dimensional steel/RC conductance only. Neither includes lateral conduction, full AAC/DPC/annulus, contact, films, soil or climatic temperatures. No ψ, U, fRsi, condensation or ISO result.'},
 'pathSchedule':[
  {'path':'signed force','sequence':'assumed roof cap at +6640..+6660 → four continuous pier bars and tied RC 300 square from +6640 to −80 → four Ø60 band crossings → cold grid','hold':'STR actual roof hip/seat, cap welded bar ends, cage ties, anchorage, signed N/M/V, stiffness/contact and cold grid; no equal sharing or AAC/DPC tension/shear credit'},
  {'path':'capillary','sequence':'cold grid → 150 mineral DPC → 215 AAC → warm pad / ordinary core','hold':'Four Ø60 bores destroy continuous mineral course unless exact bonded mineral/metal collars and anti-bypass termination are proved; ordinary room/cavity finishes cannot wick across'},
  {'path':'air/gas','sequence':'floor field and ordinary plaster → supported joint at warm pad/bores → sealed indoor boundary','hold':'No continuous seal at shanks, cold grid, brick/perps or floor edge defined; site gas duty distinct'},
  {'path':'thermal','sequence':'110 glass and floor320 glass return around full-height warm RC pier, four steel shanks and cold receiver','hold':'Pier replaces ordinary core and projects into both room corners; point and corner 3D conduction, condensation and drying; prior loggia 2D ψ does not transfer'},
  {'path':'rain/cavity','sequence':'102.5 weather brick → 50 drained cavity turning SW corner → exterior declaration, separate from DPC','hold':'Cavity head/base tray, fire closure, mortar droppings, splash and blocked discharge; no tie across drained slot'},
  {'path':'movement/repair','sequence':'cold RC/starter erection → bored mineral courses → full-height tied 300 RC pier and cap bars → floor/wall/roof glass, cavity and finishes','hold':'Core/cold differential motion, corrosion/electrochemistry, bored-unit bond/crack, cap-weld/tool/cage access, pre-concealment test and eventual embedded-anchor renewal method'}],
 'decision':'A split-rod unperforated diaphragm removes the four plate penetrations in principle but its perimeter and movement interface remain unresolved; neither crossing is a complete envelope. Reject bare shanks and solid RC bypass as complete envelope solutions. Do not infer conventional component availability, material approval, site suitability or six-row completion.'}

def output(path,body):
 p=OUT/path
 if '--check' in sys.argv:assert p.read_text()==body,path+' stale'
 else:p.write_text(body)
output('sw-corner-envelope.json',json.dumps(result,indent=2)+'\n')

def rect(x,y,w,h,fill,stroke='#394957',sw=.35):return f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def line(x1,y1,x2,y2,c='#394957',sw=.5,dash=''):return f'<path d="M{x1:.2f},{y1:.2f} L{x2:.2f},{y2:.2f}" fill="none" stroke="{c}" stroke-width="{sw}" {f"stroke-dasharray={chr(34)+dash+chr(34)}" if dash else ""}/>'
def label(x,y,s,n=3):return f'<text x="{x:.2f}" y="{y:.2f}" font-size="{n}" fill="#263e4a">{s}</text>'
svg=['<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297">',rect(0,0,420,297,'#fff'),'<g font-family="Arial,sans-serif">',
 label(12,13,'SW ordinary corner · four reserved bores / negative controls',5),
 label(12,21,'Source-located GROUND axes (332.5,332.5). Provisional STR contact geometry; no DPC/air/gas or capacity pass.',3.2)]
# A: actual plan to scale, 0..700 mm projected into a 120 mm panel.
X=lambda u:18+u*.17;Y=lambda u:30+u*.17
colors=['#a86657','#fcf3e4','#e8d588','#c7b8a6','#e5ded1']
for (name,a,b),c in zip(wall,colors):
 svg.extend([rect(X(a),Y(b),(b-a)*.17,(700-b)*.17,c),rect(X(b),Y(a),(700-b)*.17,(b-a)*.17,c),rect(X(a),Y(a),(b-a)*.17,(b-a)*.17,c)])
svg.append(f'<rect x="{X(262.5):.2f}" y="{Y(262.5):.2f}" width="{300*.17:.2f}" height="{300*.17:.2f}" fill="#89aec3" fill-opacity=".78" stroke="#bd453f" stroke-width="1.1"/>')
svg.append(rect(X(0),Y(0),600*.17,600*.17,'none','#5483a2',.7))
for x,y in points:
 svg.append(f'<circle cx="{X(x):.2f}" cy="{Y(y):.2f}" r="{30*.17:.2f}" fill="#eee9dd" stroke="#a34e39" stroke-width=".7"/>')
 svg.append(f'<circle cx="{X(x):.2f}" cy="{Y(y):.2f}" r="{10*.17:.2f}" fill="#657b83"/>')
svg.append(f'<circle cx="{X(332.5):.2f}" cy="{Y(332.5):.2f}" r="1" fill="#d41e3d"/>')
svg.extend([label(18,157,'A  PLAN · x east / y north; 300 warm pad, 600 cold receiver',3.4),
 label(18,163,'Four Ø60 bores, Ø20 shanks; roof point 10 inside low anchor axes.',3),
 label(18,169,'Full-height pier toe133×133 room;30 edge ligament/120 bore clear.',3)])
# B and C: orthogonal x-z and y-z sections at the opposite bore row.
for bx,title in [(166,'B  WEST WALL · east-west at y502.5'),(299,'C  SOUTH WALL · south-north at x502.5')]:
 Q=lambda u:bx+u*.16;Z=lambda z:85-z*.065
 svg.append(label(bx,34,title,3.4))
 for (name,a,b),c in zip(wall,colors):svg.append(rect(Q(a),Z(700), (b-a)*.16,(700)*.065,c))
 svg.extend([rect(Q(429.5),Z(-80),(700-429.5)*.16,200*.065,'#a9bcc7'),
  rect(Q(429.5),Z(-280),(700-429.5)*.16,320*.065,'#ead886'),
  rect(Q(262.5),Z(700),300*.16,1080*.065,'#89aec3'),
  rect(Q(262.5),Z(-390),300*.16,215*.065,'#a8c6a5'),
  rect(Q(262.5),Z(-615),300*.16,150*.065,'#9b89a7'),
  rect(Q(0),Z(-765),600*.16,450*.065,'#90aec1')])
 for a,b in [(-390,-380),(-615,-605)]:svg.append(rect(Q(262.5),Z(b),300*.16,(b-a)*.065,'#c4b99e'))
 for u in (322.5,502.5):
  svg.append(rect(Q(u-30),Z(-380),60*.16,385*.065,'#fff7e1','#a34e39',.7))
  svg.append(rect(Q(u-10),Z(700),20*.16,1690*.065,'#536e79'))
 svg.extend([line(Q(0),Z(0),Q(700),Z(0),'#cf3d47',.6,'3,2'),
  label(bx,178,'DPC −615..−765 PERFORATED',3),
  label(bx,184,'Air/gas + capillary collars unresolved.',2.8)])
svg.extend([label(12,213,'Failed controls',4),
 label(12,221,'Two diagonal tension-only ties: roof point outside hull; one tie would compress under roof-only uplift.',3.2),
 label(12,228,'Four unsealed bores: 12.57% of nominal band footprint bored; replacement grout/contact unqualified.',3.2),
 label(12,235,'Solid 300 RC bypass: continuous structural concept but direct thermal and capillary bridge.',3.2),
 label(12,247,'Isolated axial indicator: four Ø20 steel G0.1632 W/K; solid RC 300² G0.4091 W/K across385 mm.',3.2),
 label(12,254,'Fixed-end 1D only; no 3D ψ/U/surface temperature, no moisture or structural capacity result.',3.2),
 label(12,266,'Actual collar/bond, reinforcement, signed load, movement, cavity drain, installation and renewal are HOLDS.',3.3),
 label(12,277,'Source: selected HAD scene, physical slab axis and prior unadopted warm-grid recipe. STR station dimensions coordinated provisional.',3.1),'</g></svg>'])
output('sw-corner-envelope.svg',''.join(svg)+'\n')
print(json.dumps({'fourBoreAreaFraction':net/300**2,'edge':edge_ligament,'steelG':steel_G,'rcG':rc_G,'status':'conditional, no sealed crossing'}))

# Closed folded-metal pan around the local warm receiver, joined to a
# supported field above the slab: dimensional topology, not tested tanking.
pan_side_m2=4*.3*((574-80)/1000)
pan_side_mass=pan_side_m2*.001*7850
pan={'status':'finite continuous metal surface hypothesis; structural interruption and complete field/perimeter integrity unresolved',
 'patchXY_mm':[262.5,262.5,562.5,562.5], 'diaphragmZ_mm':[-574,-571],
 'outerFieldZ_mm':[-80,-79], 'sideReturnsZ_mm':[-574,-80], 'sideThickness_trial_mm':1,
 'grossSideArea_m2':pan_side_m2,'grossSideMass_kg_at_7850':pan_side_mass,
 'topology':'Continuous full-penetration welded field-to-four vertical sides-to-unpierced bottom patch; four upper and lower rod pieces welded to opposite plate faces. No direct cold-to-warm concrete allowed through plate.',
 'hardHold':'Four sides cut through nominally monolithic warm RC pad/slab at their intersection. Structural discontinuity, slab/pier reinforcement, edge loads, shear, collector loads and weld access require a redesigned receiver and a new STR analysis.',
 'otherHolds':'Air/gas/pressure-water and capillary integrity at all welds, wall/court/service field edges, differential movement, fatigue, corrosion, cover, 3D thermal field, practical erection, leak testing and repair are unproved. Dimensions and pier cap remain provisional pending actual STR station.',
 'grossAreaLimit':'Only four 300×494 mm flat sides before weld overlap, corners, openings and fabrication waste. No system takeoff.'}
assert math.isclose(pan_side_m2,.5928) and math.isclose(pan_side_mass,4.65348)
output('sw-corner-pan.json',json.dumps(pan,indent=2)+'\n')
svg2='''<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="210mm" viewBox="0 0 420 210"><rect width="420" height="210" fill="white"/><style>text{font-family:Arial,sans-serif;fill:#263e4a;font-size:3px}.title{font-size:5px;font-weight:bold}.head{font-size:3.7px;font-weight:bold}.metal{fill:none;stroke:#b3352c;stroke-width:1.2}.rc{fill:#b8cbd4;stroke:#526772;stroke-width:.35}.mineral{fill:#c8d8b6;stroke:#526772;stroke-width:.35}.dim{fill:none;stroke:#526772;stroke-width:.35}</style><text x="10" y="12" class="title">SW: welded pan to supported upper field · conditional geometry</text><text x="10" y="20">Four sides close at lower diaphragm; 1 mm upper field on warm slab. No gas/water, structural or physical qualification.</text><text x="10" y="31" class="head">A PLAN · plate and four sides</text><rect x="17" y="38" width="90" height="90" class="rc"/><rect x="34" y="55" width="45" height="45" fill="#dfe8e5" stroke="#b3352c" stroke-width="1.2"/><circle cx="43" cy="64" r="2" fill="#283f4b"/><circle cx="70" cy="64" r="2" fill="#283f4b"/><circle cx="43" cy="91" r="2" fill="#283f4b"/><circle cx="70" cy="91" r="2" fill="#283f4b"/><text x="10" y="137">Pan x/y262.5..562.5; 300 square.</text><text x="10" y="143">Dots: four split-rod axes.</text><text x="10" y="149">Side joins at all four corners.</text><text x="10" y="158">Field must continue across entire</text><text x="10" y="164">floor, walls, court and services.</text><text x="125" y="31" class="head">B WEST CUT · x direction at y502.5</text><text x="272" y="31" class="head">C SOUTH CUT · y direction at x502.5</text>'''
for bx in (128,275):
 # section x coordinate map 0..700 and z −1000..0, all mm in source
 q=lambda x: bx+x*.15
 z=lambda v: 38-v*.09
 svg2+=f'<rect x="{q(0)}" y="{z(-80)}" width="{262.5*.15}" height="18" class="rc"/><rect x="{q(562.5)}" y="{z(-80)}" width="{137.5*.15}" height="18" class="rc"/>'
 svg2+=f'<rect x="{q(262.5)}" y="{z(-80)}" width="45" height="27" class="rc"/><rect x="{q(262.5)}" y="{z(-380)}" width="45" height="{194*.09}" class="mineral"/>'
 for a in (322.5,502.5):svg2+=f'<path d="M{q(a)} {z(-80)} V{z(-571)} M{q(a)} {z(-574)} V{z(-990)}" stroke="#263e4a" stroke-width="1"/>'
 svg2+=f'<path class="metal" d="M{q(0)} {z(-80)} H{q(262.5)} V{z(-574)} H{q(562.5)} V{z(-80)} H{q(700)}"/>'
 svg2+=f'<text x="{bx}" y="143">Field −80; pan bottom −574..−571.</text><text x="{bx}" y="149">Split ties: no plate through-hole.</text><text x="{bx}" y="155">Metal sides interrupt warm RC!</text>'
svg2+='''<text x="10" y="184">RED = proposed continuous metal surface; welds, transitions and movement remain unproved. Schematic, not a construction detail.</text><text x="10" y="191">Structural redesign: sides cross the intended monolithic slab/receiver. Seat, cage, lateral path and all barrier edges are holds.</text><text x="10" y="198">Cold anchor, ground gas/pressure, corrosion, tests, accessible repair and 3D thermal/moisture fields require separate evidence.</text></svg>'''
output('sw-corner-pan.svg',svg2+'\n')
