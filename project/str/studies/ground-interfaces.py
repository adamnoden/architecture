"""Source-bound STR-GROUND option geometry and dimensionless movement diagnostics.

Not a foundation design. No soil stiffness, pile count/depth, beam size or capacity
is inferred. Run with --check to compare deterministic JSON/SVG outputs.
"""
from pathlib import Path
import hashlib, json, math, sys
import matplotlib
assert matplotlib.__version__ == '3.10.8', 'Use the declared Matplotlib 3.10.8 study renderer'
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Circle

OUT=Path(__file__).resolve().parent
ROOT=OUT.parents[2]
INPUTS=['project/str/studies/house-plan.json','project/str/studies/house-source.json',
        'project/str/studies/span-envelopes.json','compiler/reference-house/georgian/section-exemplar.ts',
        'project/mat/envelope-ground-boundary.md','docs/reference-house/ground-water-policy.md',
        'project/mat/studies/suspended-ground-section.json',
        'project/mat/studies/suspended-ground-vent-connection.json']
source={p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in INPUTS}
plan=json.loads((ROOT/INPUTS[0]).read_text())
house=json.loads((ROOT/INPUTS[1]).read_text())
assert house['sourceDimensions']['shell']==12000
assert house['sourceDimensions']['court']==dict(x=4250,y=4250,width=3500,depth=3500)
assert plan['service_disposition']['new_stacked_gross_riser']==[9410,4700,550,700]
assert plan['opening_changes'][0]['comparison_interval']==[5100,6900]

# Source leaf centre lines, not adopted footing or bearing centre lines.
outer=[332.5,11667.5]; court=[3917.5,8082.5]
rings=[]
for name,lo,hi in [('outer',*outer),('court',*court)]:
 for side,a,b in [('south',[lo,lo],[hi,lo]),('east',[hi,lo],[hi,hi]),
                  ('north',[lo,hi],[hi,hi]),('west',[lo,lo],[lo,hi])]:
  rings.append(dict(id=name+'-'+side,a=a,b=b,role='both leaves require continuous common support; line is inner-leaf axis'))
routes=[]
for w in plan['ground_walls']:
 a=w['a'].copy();b=w['b'].copy()
 for p in [a,b]:
  for i in [0,1]:
   if p[i]==0:p[i]=outer[0]
   if p[i]==12000:p[i]=outer[1]
 routes.append(dict(id=w['id'],a=a,b=b,holes=w['holes'],core_mm=w['t']-30,
  role='load reservation including masonry above openings; arch thrust is not calculated'))
# Retain the actual B bridge reaction footprint instead of the old court opening.
links=[dict(id='rear-divider-return',a=[7400,8082.5],b=[7400,8167.5]),
       dict(id='rear-east-return',a=[7750,8082.5],b=[7750,8290])]
bridge=[dict(id='bridge-west',a=[4785,332.5],b=[4785,3917.5]),
        dict(id='bridge-east',a=[7215,332.5],b=[7215,3917.5])]
lengths={r['id']:math.dist(r['a'],r['b']) for r in routes+rings}

mat_floor=json.loads((ROOT/INPUTS[6]).read_text())
mat_vent=json.loads((ROOT/INPUTS[7]).read_text())
assert mat_floor['floorStack']==330 and mat_vent['levels']['soffit']==-330

def solve2(K,b):
 det=K[0][0]*K[1][1]-K[0][1]*K[1][0]
 assert det>0
 return [(b[0]*K[1][1]-K[0][1]*b[1])/det,
         (K[0][0]*b[1]-b[0]*K[1][0])/det]

# Two equal axial springs + rotation-restrained beam idealisation.
# Beam differential stiffness kb=12EI/L^3; rho=kb/k. Support-ground offsets
# are prescribed inputs, not computed clay motion or forecast settlement.
relative=[]
for rho in [0,0.1,1,10]:
 d=15/(1+2*rho)
 relative.append(dict(rho=rho,prescribed_support_ground_difference_mm=15,
  resulting_difference_mm=d,redistribution_over_k_mm=rho*d,
  end_moment_over_EI_per_mm=(6*d/3585**2 if rho else None),
  gradient_ratio=3585/d))
anomaly=[]
for rho in [0,0.1,1,10]:
 K=[[0.5+rho,-rho],[-rho,1+rho]]
 y=solve2(K,[1.,1.])
 # displacement is in units P/k, equal original nominal reactions P.
 anomaly.append(dict(rho=rho,anomalous_spring_ratio=0.5,
  displacements_over_P_div_k=y,difference_over_P_div_k=float(y[0]-y[1]),
  reaction_over_P=[float(.5*y[0]),float(y[1])],
  redistribution_over_P=float(rho*(y[0]-y[1]))))
# Checks independent of matching stored output: equilibrium, analytic limits,
# constant translation, and symmetry under swapping the two springs.
assert math.isclose(relative[0]['resulting_difference_mm'],15)
for r in anomaly:
 assert math.isclose(sum(r['reaction_over_P']),2,abs_tol=1e-12)
 rho=r['rho'];K=[[.5+rho,-rho],[-rho,1+rho]]
 shifted=solve2(K,[1+9*sum(row) for row in K])
 assert all(math.isclose(a,b+9) for a,b in zip(shifted,r['displacements_over_P_div_k']))
 swapped=solve2([row[::-1] for row in K[::-1]],[1,1])
 assert all(math.isclose(a,b) for a,b in zip(swapped,r['displacements_over_P_div_k'][::-1]))

spans=[('outer-to-court inner leaf axes',3585),('B court-south bridge reaction axes',2430),
       ('B short L return',597.5)]
gradients=[dict(id=n,L_mm=L,difference_mm=d,gradient_ratio=L/d)
           for n,L in spans for d in [1,5,15]]
voids=[dict(clear_trial_mm=c,soil_rise_trial_mm=g,construction_loss_trial_mm=loss,
 residual_mm=c-g-loss,contact=c-g-loss<=0)
 for c in [150,300,450] for g in [50,150,300] for loss in [0,50]]
service=[dict(length_mm=L,nominal_gradient_denominator=g,initial_fall_mm=L/g,
 adverse_vertical_relative_motion_mm=d,residual_fall_mm=L/g-d,
 residual_gradient=(L/g-d)/L,positive_fall=L/g-d>0)
 for L in [2000,4000] for g in [40,80] for d in [25,50]]
# 6000 radius is an AUTHOR'S EXCLUSION TEST, not a BS5837 RPA calculation.
tree=dict(centre_mm=[-3500,6000],exclusion_radius_trial_mm=6000,
 authority='Synthetic constraint only; no species, stem, actual tree, roots or legal RPA represented')
raceways={'west_control':[[-1200,-5000],[-1200,5050],[0,5050]],
          'east_trial':[[13000,-5000],[13000,5050],[12000,5050]]}
def point_segment_distance(p,a,b):
 v=[b[i]-a[i] for i in [0,1]]
 t=max(0,min(1,sum((p[i]-a[i])*v[i] for i in [0,1])/sum(x*x for x in v)))
 return math.dist(p,[a[i]+t*v[i] for i in [0,1]])
tree_routes={}
for n,pts in raceways.items():
 distance=min(point_segment_distance(tree['centre_mm'],a,b) for a,b in zip(pts,pts[1:]))
 tree_routes[n]=dict(length_mm=sum(math.dist(a,b) for a,b in zip(pts,pts[1:])),
  closest_distance_mm=distance,exclusion_overlap=distance<6000)

result=dict(status='Pre-site option comparison. No adopted foundation, assembly, site or capacity.',
 source_sha256=source,source_authority=house['source'],
 plan_basis='B joined unadopted candidate; accepted shell/court only. Rebind on C/facade/support change.',
 foundation_routes=rings+routes,proposed_connecting_returns=links,bridge_reaction_reservations=bridge,
 length_basis='Centreline routes; overlapping routes not deduplicated; no concrete quantities or pile count.',
 route_length_mm=lengths,gradient_diagnostics=gradients,
 spring_beam=dict(model='Two axial springs and a rotation-restrained Euler beam; rho=12EI/(k L^3). Linear, 1D, equal nominal load, no masonry, soil contact, group effects or torsion.',
  prescribed_movement=relative,half_stiffness_anomaly=anomaly),
 void_trials=voids,gravity_crossing=service,
 three_axis_joint_envelope_trial_mm=dict(axial=20,transverse=20,vertical=50,
  combined_translation=math.sqrt(20**2+20**2+50**2),
  meaning='Demand test only. No available joint or service is certified to accept it.'),
 synthetic_tree=tree,synthetic_tree_routes=tree_routes,
 section=dict(scale='1:10 only within dimensioned upper interface. Lower beam/pile continuation NTS and unsized.',
  accepted_wall_layers_mm=[102.5,160,140,15],ground_floor_source_reserve_mm=300,
  authored_floor_stack_from_MAT_mm=330,authored_clear_void_trial_mm=300,authored_external_grade_trial_mm=-630,
  authored_court_grade_trial_mm=-150,
  authored_DPC_lower_bed_trial_mm=-480,authored_DPC_upper_bed_trial_mm=-330,
  authored_cavity_fill_top_trial_mm=-705,
  statement='DPC dimensions are occupied envelope trials, not a brick/slate specification. Floor layers, junction, thermal/gas/air/fire and capacities remain unqualified.',
  external_DPC_to_grade_mm=150,court_DPC_to_grade_mm=-330,
  clear_cavity_below_lower_bed_mm=225,
  adverse_result='Court grade at -150 is 330 mm above lowest DPC bed: fails ordinary 150 mm exterior clearance at this junction. Outer raised-grade candidate gains clearance but needs accessible approach and no water-trapping moat.'))

plt.rcParams.update({'font.family':'DejaVu Sans','font.size':8,'svg.fonttype':'none','svg.hashsalt':'str-ground-v1'})
COL=dict(ink='#22313b',green='#236954',red='#b54736',blue='#245f91',grey='#bfc4c6',light='#f1f2ef')
def figure(w,h,title,sub):
 f=plt.figure(figsize=(w/25.4,h/25.4),facecolor='white')
 f.text(15/w,1-12/h,title,fontsize=17,weight='bold',color=COL['ink'])
 f.text(15/w,1-21/h,sub,fontsize=8,color=COL['ink'])
 f.text(15/w,9/h,'STR-GROUND | Reference design — not released for construction | 1 November 2026',fontsize=7,color=COL['ink'])
 return f

def axes(f,w,h,left,bottom,width,height,xlim,ylim):
 a=f.add_axes([left/w,bottom/h,width/w,height/h]);a.set_xlim(*xlim);a.set_ylim(*ylim)
 a.set_aspect('equal',adjustable='box');a.axis('off');return a

def text(a,x,y,s,**kw): a.text(x,y,s,color=COL['ink'],**kw)
def box(a,x,z,w,h,**kw):a.add_patch(Rectangle((x,z),w,h,**kw))
def note(f,w,h,x,y,s,size=8):f.text(x/w,1-y/h,s,fontsize=size,va='top',color=COL['ink'],linespacing=1.5)
def save(f,name):
 path=OUT/name
 temp=OUT/(name+'.tmp')
 f.savefig(temp,format='svg',metadata={'Date':None,'Creator':'STR-GROUND source-bound generator'})
 data=temp.read_text();temp.unlink()
 if '--check' in sys.argv:
  assert path.read_text()==data,'STALE: '+name
 else:path.write_text(data)
 if '--preview' in sys.argv:f.savefig('/tmp/'+name.replace('.svg','.png'),dpi=100)
 plt.close(f)

# A3 plan: an exact 1:50 12000-square field uses 240 mm.
w,h=420,297;f=figure(w,h,'Ground support follows the house','G-01 | Foundation ROUTES on source-bound B plan | 1:50 at A3 landscape, print 100%')
a=axes(f,w,h,15,25,245,245,[-125,12125],[-125,12125])
box(a,0,0,12000,12000,fill=False,ec=COL['grey'],lw=1)
box(a,4250,4250,3500,3500,fill=False,ec=COL['grey'],lw=1)
for r in rings:
 a.plot(*zip(r['a'],r['b']),c=COL['green'],lw=2)
for r in routes:
 a.plot(*zip(r['a'],r['b']),c=COL['green'],lw=1.5)
 # door breaks interrupt the wall, not necessarily the foundation beam.
 axis=1 if r['a'][0]==r['b'][0] else 0
 for lo,hi in r['holes']:
  aa=r['a'].copy();bb=r['a'].copy();aa[axis]=lo;bb[axis]=hi
  a.plot(*zip(aa,bb),c='#e8b85b',lw=3,alpha=.9)
for r in links:a.plot(*zip(r['a'],r['b']),c=COL['blue'],lw=2)
for r in bridge:a.plot(*zip(r['a'],r['b']),c=COL['blue'],ls='--',lw=1.4)
for r in rings:
 a.scatter(*r['a'],s=16,facecolor='white',edgecolor=COL['green'],zorder=4)
# All facade opening positions from source; B court-south override disclosed.
for o in house['sourceInventory']['openings']['GROUND']:
 wall=o['wall'];c=o['centre'];d=o['width']/2
 if not wall.startswith(('outer-','court-')):continue
 if o['id']=='grand-court-entry-south':d=900
 if wall.startswith('outer'):
  pos={'south':outer[0],'north':outer[1],'west':outer[0],'east':outer[1]}[wall.split('-')[1]]
 else:pos={'south':court[0],'north':court[1],'west':court[0],'east':court[1]}[wall.split('-')[1]]
 if wall.endswith(('north','south')):a.plot([c-d,c+d],[pos,pos],c='#e8b85b',lw=3)
 else:a.plot([pos,pos],[c-d,c+d],c='#e8b85b',lw=3)
# Source stack centre and candidate protected passage, no utility combination.
a.plot([9685,12000],[5050,5050],c=COL['red'],ls='--',lw=2)
a.scatter(9685,5050,c=COL['red'],s=20);text(a,9900,5400,'P1',fontsize=8)
text(a,6000,6100,'OPEN COURT',ha='center',fontsize=9)
text(a,6000,5550,'no water into void',ha='center',fontsize=7)
text(a,6000,460,'SOUTH / ENTRANCE',ha='center',fontsize=7)
text(a,9400,7800,'x9300 spine',fontsize=7,rotation=90)
text(a,350,11900,'N ↑',fontsize=9)
a.plot([500,3500],[11400,11400],c=COL['ink'],lw=1)
for x in [500,1500,2500,3500]:a.plot([x,x],[11300,11500],c=COL['ink'],lw=.7)
text(a,2000,11000,'3 m',ha='center',fontsize=7)
note(f,w,h,275,35,'GREEN / continuous foundation routes\nInner-leaf source axes shown. Both cavity\nleaves need a common verified support.\nNo line thickness is a beam dimension.\n\nAMBER / openings above\nBeam route continues beneath opening;\narch impost thrust, pier moments and\nlocal bearing remain separate demands.\n\nBLUE / B bridge reaction reservations\nx4785 / 7215; centre spacing 2430 mm.\n1800 court opening x5100–6900 is B only.\n\nP1 / moving-service passage trial\nFrom stack centre x9685,y5050 to east.\nLocate structural port before beam design;\ndo not core a selected beam afterwards.\nBelow door geography is not a free port.\n\nOpen circles / ring junction demands\nNot piles, pile locations or a pile count.\nInternal junctions also need calculated\nload collection and located supports.\n\nREJECTION RULE\nAny changed facade, courtyard, wall,\narch/tie or roof reaction rebinds this grid.\nC south extension cannot inherit it.\nBlue rear returns are proposed ties at\nx7400 (85) / x7750 (207.5), not sizes.\n\nSources / house-plan.json; house-source.json;\nspan-envelopes.json. Exact hashes in JSON.',8)
save(f,'ground-grid.svg')

# A2 sheet: exactly 1:10 upper domains; lower supports intentionally broken/NTS.
w,h=594,420;f=figure(w,h,'Ground contact is three separate interfaces','G-02 | Outer / court / internal-bearing comparisons | 1:10 upper domains at A2 landscape, print 100%')
for left,title,grade in [(15,'A / MAT raised-floor reference',-630),(225,'B / court retained-grade control',-150)]:
 a=axes(f,w,h,left,145,200,210,[-600,1400],[-1000,1100])
 # Source wall above FFL, separated leaves. Lower base is a candidate envelope.
 for x,width,fc in [(0,102.5,'#d4c1ae'),(262.5,140,'#c4c8c8'),(402.5,15,'#e8e8e3')]:
  box(a,x,-740,width,1740,fc=fc,ec=COL['ink'],lw=.7)
 # DPC occupied envelope: no selected number of units/bed thickness.
 for x,width in [(0,102.5),(262.5,140)]:box(a,x,-480,width,150,fc='#b5bb82',ec=COL['ink'],lw=.8,hatch='///')
 # Cavity fill at -375 with a 225 clear gap to the lower DPC bed.
 box(a,102.5,-740,160,35,fc='#c8c9c4',ec=COL['grey'],lw=.5)
 a.plot([102.5,262.5],[-705,-705],c=COL['blue'],lw=1)
 # Existing MAT authored 330 stack; no member or assembly is adopted.
 for z,depth,label,fc in [(-15,15,'15 finish','#ded8c8'),(-80,65,'65 distribution','#dedbd0'),
                          (-180,100,'100 insulation','#eee6b2'),(-330,150,'150 structure','#c6ceca')]:
  box(a,417.5,z,970,depth,fc=fc,ec=COL['ink'],lw=.5)
  if depth>15:text(a,900,z+depth/2,label,ha='center',va='center',fontsize=6.5)
 # No invented bearing overlap or moisture/air/gas closure.
 a.scatter(425,-330,s=28,facecolor='white',edgecolor=COL['red'],zorder=10)
 text(a,500,90,'J1 — bearing / thermal / air-gas closure OPEN',fontsize=7)
 # Maintained void comparison inherited from MAT, not adopted site level.
 a.plot([417.5,1400],[-630,-630],c=COL['green'],lw=1)
 text(a,900,-440,'300 free-void TEST',ha='center',fontsize=8)
 a.annotate('',xy=(1230,-330),xytext=(1230,-630),arrowprops=dict(arrowstyle='<->',color=COL['green'],lw=.7))
 # YA13/YB11 nominal component-envelope probe. Inner throat and weather
 # protection remain unqualified; do not draw a complete 417.5 sleeve.
 box(a,0,-565,50,65,fill=False,ec=COL['blue'],lw=.8)
 box(a,82.5,-565,200,65,fill=False,ec=COL['blue'],lw=.8)
 a.plot([282.5,417.5],[-532.5,-532.5],c=COL['red'],ls='--',lw=.9)
 text(a,500,-560,'J3 — vent inner throat / water protection OPEN',fontsize=6.5)
 a.plot([-600,0],[grade,grade],c=COL['green'],lw=1.5)
 text(a,-570,grade+70,'grade '+str(grade),fontsize=7)
 text(a,-570,700,'102.5 / 160 / 140 / 15',fontsize=7)
 text(a,-570,570,'source wall layers, mm',fontsize=7)
 a.annotate('225 clear',xy=(182.5,-590),xytext=(500,400),fontsize=7,color=COL['ink'],arrowprops=dict(arrowstyle='->',lw=.6))
 # Named downward drainage exit: required route only, no constructed outlet.
 a.annotate('',xy=(-120,-660),xytext=(180,-660),arrowprops=dict(arrowstyle='->',color=COL['blue'],lw=1))
 text(a,-570,-870,'Common support / ties / pile group BELOW BREAK',fontsize=7)
 for z in [-770,-800]:a.plot([-20,120,260,430],[z,z-25,z+15,z-20],c=COL['ink'],lw=1)
 text(a,-570,-980,'Lower foundation continuation NTS; no beam / pile sizes',fontsize=7)
 a.plot([-500,0],[1000,1000],c=COL['ink'],lw=1);text(a,-250,1040,'500 mm',ha='center',fontsize=7)
 note(f,w,h,left,40,title,11)
 note(f,w,h,left,290,('A: MAT 330 floor + 300 void = 630 mm, not source 300.\nLowest DPC bed −480; grade −630 → 150 mm TEST.\nFill top −705 → 225 mm clear; discharge unproved.\nYA13/YB11 reference, not a complete qualified wall vent.' if grade==-630 else
 'B: MAT lowest bed −480; retained court grade −150.\nDPC is 330 mm BELOW grade: reject this combined control.\nDo not splice a new below-bearing band into old levels.\nRaise floor / independent wall DPC: rebind thresholds, RWT.'),8)
# Third internal-bearing detail at same physical scale in remaining width.
a=axes(f,w,h,445,180,130,170,[-650,650],[-600,1100])
box(a,-70,-550,140,1550,fc='#c4c8c8',ec=COL['ink'],lw=.7)
box(a,-70,-480,140,150,fc='#b5bb82',ec=COL['ink'],lw=.7,hatch='///')
for lo,hi in [(-650,-70),(70,650)]:
 box(a,lo,-330,hi-lo,330,fill=False,ec=COL['ink'],ls='--',lw=.9)
 a.plot([lo,hi],[-330,-330],c=COL['red'],ls='--',lw=1.3)
 a.scatter(-85 if hi<0 else 85,-330,s=25,fc='white',ec=COL['red'])
text(a,0,1040,'140 core',ha='center',fontsize=8)
text(a,0,-550,'J2 / BOTH SIDES',ha='center',fontsize=8)
note(f,w,h,445,40,'C / internal bearing',11)
note(f,w,h,445,260,'Both floor fields need qualified capillary separation.\nAny required floor barrier must join the DPC.\nArch thrust/ties cannot be assumed to\npass across a low-friction capillary break.\nNo membrane waiver, bearing or thermal pass.\n\nGREEN = motion / ground reference\nBLUE = cavity water duty\nRED = moisture + air/gas joint OPEN\nHATCH = occupied mineral DPC trial\nEvery floor side also owes fire/thermal\nand actual constituent qualification.',8)
save(f,'ground-sections.svg')

# A3 movement and service/tree sheet. Tree map at 1:100; service is a schematic.
w,h=420,297;f=figure(w,h,'Movement must stay out of the masonry and services','G-03 | Synthetic tree trial + three-axis crossing | No real plot or joint performance represented')
a=axes(f,w,h,15,65,235,200,[-10000,13500],[-6000,14000])
box(a,0,0,12000,12000,fill=False,ec=COL['ink'],lw=.9)
box(a,4250,4250,3500,3500,fill=False,ec=COL['grey'],lw=.7)
a.add_patch(Circle(tree['centre_mm'],6000,fc='#e4eadc',ec=COL['green'],lw=1,alpha=.7))
a.scatter(*tree['centre_mm'],marker='x',c=COL['green'],s=35)
text(a,-7000,12500,'Synthetic 6000 radius exclusion',fontsize=8)
text(a,6000,6000,'HOUSE',ha='center',fontsize=9)
for n,pts in raceways.items():
 a.plot(*zip(*pts),c=COL['red'] if n=='west_control' else COL['blue'],lw=1.7)
text(a,-7000,-5000,'west control: intersects',fontsize=8)
text(a,3500,-5000,'east trial: clear in this scenario',fontsize=8)
a.plot([-6500,-1500],[-3400,-3400],c=COL['ink'],lw=1);text(a,-4000,-2850,'5 m / map 1:100 at A3',ha='center',fontsize=7)
note(f,w,h,15,242,'The circle tests route avoidance, NOT root safety. West closest 2488 mm; east 15529 mm.\nEither route needs real root mapping, rig/load/working footprint and actual network positions.\nA clean centreline cannot authorise excavation, piling or a mixed-utility raceway.',8)
# Longitudinal crossing centreline, deliberately not a selected pipe section.
a=axes(f,w,h,260,90,145,90,[0,4000],[-1750,875])
a.plot([0,700],[0,0],c=COL['ink'],lw=2)
a.plot([2700,4000],[-25,-25],c=COL['green'],lw=2)
a.plot([700,2700],[0,-25],c=COL['blue'],lw=1.5)
a.plot([700,2700],[0,25],c=COL['red'],ls='--',lw=1.3)
for x in [700,2700]:a.scatter(x,0 if x==700 else -25,s=35,fc='white',ec=COL['ink'])
text(a,0,600,'HOUSE-FIXED',fontsize=8)
text(a,2500,600,'SOIL-FIXED',fontsize=8)
text(a,800,240,'2 m at 1:80 → 25 mm fall',fontsize=8)
text(a,300,-600,'+50 mm receiving end rise → −25 mm fall',fontsize=8)
text(a,300,-900,'Result: reverse fall. A joint cannot fix gravity.',fontsize=8)
text(a,300,-1350,'Centreline only / no pipe, port or beam dimensions',fontsize=7)
note(f,w,h,260,40,'Crossing result / conditional failure',11)
note(f,w,h,260,53,'Separate house-fixed port from a supported, accessible\nsite segment. Provide a replaceable transition before\nany soil-fixed receiver. Opening precedes beam design.\n\nDemand trial: ±20 axial, ±20 transverse, ±50 vertical;\ncombined translation 57.45 mm. Independent rotations\nand required joint lengths remain unknown.\nNo coupling, seal or service has passed this envelope.',8)
note(f,w,h,260,232,'No rigid cast-in crossing. No shared gas/water chamber\nassumed. Foul fall, roof water and court emergency path\nretain independent checks. A covered trench may flood;\nreject usable access that needs pumping or tanking.',8)
save(f,'ground-crossings.svg')

payload=json.dumps(result,indent=2,ensure_ascii=False)+'\n'
p=OUT/'ground-interfaces.json'
if '--check' in sys.argv:assert p.read_text()==payload,'STALE: '+p.name
else:p.write_text(payload)
print('STR-GROUND: source fingerprints, equilibrium/translation/symmetry checks and three SVG/JSON outputs '+('verified' if '--check' in sys.argv else 'generated'))
