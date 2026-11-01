"""Source-bound whole-floor/support development for HAD's open N loggia.

An honest calculation checkpoint, not a construction release. --check reproduces
the record and drawing after checking mechanics. No adopted source is written.
"""
from pathlib import Path
import hashlib
import json
import math
import subprocess
import sys
from html import escape

OUT=Path(__file__).resolve().parent
ROOT=OUT.parents[2]
HAD_PATH='project/had/studies/open-north-loggia.json'
HAD_COMMIT='1068dd38dc5f9fd682b11bb64c395eede4d4f090'
HAD_SHA='a181df7876311b8bb92eac88a880468e64bbd5033d0d465f10ddc65f12f3c911'
local=ROOT/HAD_PATH
raw=local.read_bytes() if local.exists() else subprocess.check_output(['git','show',HAD_COMMIT+':'+HAD_PATH],cwd=ROOT)
if hashlib.sha256(raw).hexdigest()!=HAD_SHA:
    raise SystemExit('HAD geometry changed: re-evaluate actual axes/finished faces before rebinding')
had=json.loads(raw)
uw={w['id']:w for w in had['upperWalls']}
gw={w['id']:w for w in had['groundWalls']}
assert gw['loggia-west-weather']['structuralCore']==[4307.5,4447.5]
assert gw['loggia-east-weather']['structuralCore']==[7552.5,7692.5]
assert uw['rear-divider']['a'][0]==7622.5
assert uw['rear-west-return']['a'][0]==4377.5
assert not any(w['id']=='rear-reading-east' for w in had['groundWalls'])

def udl(w,L):
    if w<0 or L<=0: raise ValueError('invalid load or span')
    return {'M':w*L*L/8,'V':w*L/2}

def rc(b,h,d,As,cover):
    if not 0<d<h or min(b,As,cover)<=0: raise ValueError('invalid concrete section')
    fyd=500/1.15;fcd=.85*30/1.5
    x=As*fyd/(.8*b*fcd);z=d-.4*x
    rho=min(.02,As/(b*d));k=min(2,1+math.sqrt(200/d))
    v=max(.12*k*(100*rho*30)**(1/3),.035*k**1.5*math.sqrt(30))
    return dict(b=b,h=h,d=d,As=As,cover=cover,x=x,x_d=x/d,z=z,
                MR=As*fyd*z/1e6,VRdc=v*b*d/1000,
                As_min=max(.26*2.9/500,.0013)*b*d,
                ductility=x/d<=.45)

area=lambda dia:math.pi*dia**2/4
E=22000*(38/10)**.3
def cracked(b,h,d,As,G,Q,L,phi):
    delta=0
    for w,creep in [(G,phi),(Q,0)]:
        Ec=E/(1+creep);n=200000/Ec
        x=(-n*As+math.sqrt((n*As)**2+2*b*n*As*d))/b
        I=b*x**3/3+n*As*(d-x)**2
        delta+=5*w*(L*1000)**4/(384*Ec*I)
    return delta

def links(b,d,dia,pitch):
    steel=2*area(dia)/pitch
    return dict(diameter=dia,pitch=pitch,VRs=steel*.9*d*(500/1.15)/1000,
                VRmax=.528*17*b*.9*d/2/1000,
                minimum_ratio=.08*math.sqrt(30)/500*b,
                provided_ratio=steel,maximum_pitch=.75*d)

# These finite rectangles locate the intended structural support fields. The
# stair/entrance holes are separate members, never filled by an area calculation.
fields=[
 ('SW-L','NS',[332.5,332.5,2817.5,3247.5],2915,7.5),
 ('SW-main','NS',[2817.5,332.5,4800,2650],2317.5,7.5),
 ('SE-front','NS',[7200,332.5,9300,2650],2317.5,7.5),
 ('east-strip','EW',[9300,332.5,11667.5,8290],2367.5,7.5),
 ('south-W-gallery','NS',[2817.5,2650,4800,3917.5],1267.5,7.5),
 ('south-E-gallery','NS',[7200,2650,9300,3917.5],1267.5,7.5),
 ('east-gallery','EW',[8082.5,3917.5,9300,8082.5],1217.5,7.5),
 ('west-south','EW',[332.5,3247.5,3917.5,4332.5],3585,7.5),
 ('west-stair-gallery','EW',[2917.5,4432.5,3917.5,8767.5],1000,7.5),
 ('NW','NS',[332.5,8852.5,4377.5,11667.5],2815,7.5),
 ('above-loggia','EW',[4377.5,8082.5,7622.5,11667.5],3245,8.5),
 ('NE','NS',[7622.5,8290,11667.5,11667.5],3377.5,7.5),
]
floor=[]
for name,direction,rect,Lmm,G in fields:
    L=Lmm/1000
    # H12/150 each face/direction;25 trial indoor cover; second main layer and
    # placement reserve produce d157. Exposed soffit anchor map remains separate.
    s=rc(1000,200,157,area(12)*1000/150,25)
    a=udl(1.35*G+1.5*2,L)
    delta=cracked(1000,200,157,s['As'],G,2,L,3)
    shrink=300e-6/200*(Lmm**2)/8
    floor.append(dict(id=name,direction=direction,rectangle=rect,axis_span=Lmm,
                      G=G,Q=2,section=s,action=a,fully_cracked_phi3_mm=delta,
                      differential_shrinkage_300microstrain_mm=shrink,
                      L250_comparator_mm=Lmm/250,
                      passes_declared_sensitivity=delta+shrink<=Lmm/250))
    assert s['ductility'] and s['As']>=s['As_min']
    assert a['M']<s['MR'] and a['V']<s['VRdc']

# The removed ground reading wall requires an ACTUAL beam under its upper wall.
# All adjacent NW slab tributary width is conservatively collected by this beam.
wet_trib=(2902.5-332.5+4377.5-2902.5)/2/1000
wet_G=7.5*wet_trib+.14*3.1*20+.14*.15*25
wet_Q=2*wet_trib
wet_section=rc(140,350,310,2*area(18),25)
wet_action=udl(1.35*wet_G+1.5*wet_Q,2.815)
wet_links=links(140,310,6,100)
wet=dict(axis_x=2902.5,support_axes_y=[8852.5,11667.5],span=2815,
         top=3520,bottom=3170,upstand_above_FFL=70,
         tributary_width=wet_trib*1000,G=wet_G,Q=wet_Q,
         section=wet_section,action=wet_action,links=wet_links,
         south_receiving_core=[2832.5,8702.5,140,300],
         south_receiving_finished=[2817.5,8687.5,170,330],
         north_receiving_core=[2832.5,11517.5,140,300],
         door_edge_x=3100,north_window_edge_x=3050,
         south_pier_projection_beyond_140_wall_each_side=80,
         actual_receiving_pier_material='RC140x300 trial, not an assumed masonry capacity',shear_links_required=wet_action['V']>wet_section['VRdc'],
         resolved=False)
assert wet_action['M']<wet_section['MR'] and wet_section['ductility']
assert wet_action['V']<min(wet_links['VRs'],wet_links['VRmax'])

# Quantified lower-grid target, not a soil or installed foundation selection.
# Support pitch must remain <=3000 for this line envelope; cap below beam remains
# a finite separate envelope. No number is a geotechnical capacity.
grid_G=2*.14*3.1*20+2*7.5*3.585/2+10+.25*.45*25
grid_Q=2*2*3.585/2+3
grid_section=rc(250,450,391,2*area(22),40)
grid_action=udl(1.35*grid_G+1.5*grid_Q,3)
grid_links=links(250,391,8,100)
grid=dict(top=-180,bottom=-630,width=250,depth=450,maximum_support_pitch=3000,
          cap_envelope_bottom=-680,cap_size_xy=[650,650],cap_depth=500,
          cover_comparator=40,G=grid_G,Q=grid_Q,section=grid_section,
          action=grid_action,links=grid_links,shear_links_required=grid_action['V']>grid_section['VRdc'],
          four_arm_node_vertical_demand=4*grid_action['V'],
          pile_capacity=None,soil_stiffness=None,cap_adequacy=None,
          masonry_DPC='150 above grid top -180..-30 hypothesis; MAT moisture junction unqualified',
          target_D=1200,heave_stress=300,construction_loss=50,ventilation_comparator=150,
          raw_clearance_below_cap=520,post_heave_and_loss=170,ventilation_surplus=20)
assert grid_action['M']<grid_section['MR'] and grid_section['ductility']
assert grid_action['V']<min(grid_links['VRs'],grid_links['VRmax'])

# E02 service port geometric envelope only; actual circular compression ring and
# springing ties are the next calculation, never replaced by the ideal ratio.
port=dict(wall='plant-north',axis_y=6500,centre_x=10800,clear_width=240,
          spring=2740,rise=120,intrados_crown=2860,radial_ring=215,
          extrados_crown=3075,upper_slab_soffit=3170,vertical_remainder=95,
          outside_ring_x=[10465,11135],east_abutment_territory=447.5,
          permitted_assembly_OD=160,annular_geometric_clearance=40,capacity=None)

for w,L in [(12.7,3.245),(0,1)]:
    a=udl(w,L)
    assert math.isclose(2*a['V'],w*L)
    assert math.isclose(udl(w,L*2)['M'],4*a['M'])
assert not rc(140,200,162,2*area(16),25)['ductility']
assert all(f['passes_declared_sensitivity'] for f in floor)
for a in [wet_links,grid_links]:
    assert a['pitch']<=a['maximum_pitch'] and a['provided_ratio']>=a['minimum_ratio']

result=dict(identity='OPEN-N / first whole-floor support calculation checkpoint, unadopted',
            source=dict(path=HAD_PATH,commit=HAD_COMMIT,sha256=HAD_SHA),
            units='mm / kN / kPa / MPa',floor_fields=floor,wet_wall_beam=wet,
            lower_grid=grid,E02_service_port=port,
            retained_open_items=[
                'HAD finishedFaces/t disagreement and cabinet lining collision must be corrected at source.',
                'Actual stair reactions/finite frame, entrance bridge, all tied arches and roof heel/reaction envelope remain design work.',
                'Rear/east/transient WC ports must bind the complete services inventory, not the three-bore witness.',
                'Wet-wall beam receiving RC piers project80 beyond original wall faces; HAD must check actual door/sofa tasks.',
                'Ground cap envelope, actual reinforcement/pilehead/node behaviour and DPC/floor moisture route not yet resolved.',
                'Exposed-soffit anchors/rails/wind and2930 finished soffit require actual arch/head coordination.',
                'No house pass, adopted geometry, site/soil capacity, installation or competent acceptance follows.'])

parts=['<svg xmlns="http://www.w3.org/2000/svg" width="594mm" height="420mm" viewBox="0 0 594 420">',
       '<style>text{font-family:DejaVu Sans,sans-serif;fill:#243a44;font-size:3.2px}.title{font-size:5px;font-weight:bold}</style>',
       '<rect width="594" height="420" fill="#faf8f1"/>']
def txt(x,y,t,cls=''):
    parts.append(f'<text x="{x}" y="{y}" class="{cls}">{escape(t)}</text>')
def box(x,y,w,h,fill,stroke='#345460'):
    parts.append(f'<rect x="{x:.3f}" y="{y:.3f}" width="{w:.3f}" height="{h:.3f}" fill="{fill}" stroke="{stroke}" stroke-width=".35"/>')
def ln(x1,y1,x2,y2,c='#345460'):
    parts.append(f'<path d="M{x1},{y1} L{x2},{y2}" fill="none" stroke="{c}" stroke-width=".65"/>')
txt(16,15,'OPEN N / actual whole-floor support checkpoint','title')
txt(16,24,'HAD1068dd38 · RC200 whole upper floor · unadopted / incomplete support design, not for construction')
txt(16,36,'A / UPPER STRUCTURAL FIELDS · 1:50','title')
xx=lambda x:20+x/50
yy=lambda y:286-y/50
box(xx(262.5),yy(11737.5),11475/50,11475/50,'#e5ebe7')
box(xx(3987.5),yy(8012.5),4025/50,4025/50,'#faf8f1')
for x,y,w,h in [had['stair'],had['void']]:box(xx(x),yy(y+h),w/50,h/50,'#faf8f1')
for f in floor:
    x1,y1,x2,y2=f['rectangle']
    box(xx(x1),yy(y2),(x2-x1)/50,(y2-y1)/50,'none','#98a6a4')
    txt(xx((x1+x2)/2)-6,yy((y1+y2)/2),f['id'])
    txt(xx((x1+x2)/2)-6,yy((y1+y2)/2)+5,f"{f['direction']} {f['axis_span']:g}")
for w in had['upperWalls']:
    ax,ay=w['a'];bx,by=w['b'];ln(xx(ax),yy(ay),xx(bx),yy(by),'#4b716c')
for x in [4377.5,7622.5]:ln(xx(x),yy(7750),xx(x),yy(12000),'#b47742')
ln(xx(2902.5),yy(8852.5),xx(2902.5),yy(11667.5),'#b95351')
for sx,sy,sw,sh in [wet['south_receiving_core'],wet['north_receiving_core']]:box(xx(sx),yy(sy+sh),sw/50,sh/50,'#b95351')
txt(16,300,'Green: actual upper wall axes; ochre: new ground loggia supports; red: real wet-wall transfer beam.')
txt(16,308,'No slab fills the stair/entrance holes. Fields are support rectangles, not a net-area union or full plate analysis.')
txt(16,316,'G7.5 internal /8.5 exposed-loggia, Q2; H12/150 each face/direction, d157, cover25 trial.')

txt(304,36,'B / WET-WALL BEAM & FINITE SUPPORTS','title')
txt(304,47,'Removed lower reading wall → upper140 masonry → real RC140×350 beam.')
txt(304,55,'2H18 bottom,2H10 top,H6/100; total350, z3170–3520, permanent70 upstand in wall.')
txt(304,63,f"G{wet_G:.3f}/Q{wet_Q:.3f} kN/m; M{wet_action['M']:.2f}/MR{wet_section['MR']:.2f}; V{wet_action['V']:.2f}/VRs{wet_links['VRs']:.2f}.")
box(320,88,140,10,'#aebeba')
box(320,78,140,10,'#aebeba')
box(320,68,140,10,'#aebeba')
box(320,98,10,40,'#aebeba');box(450,98,10,40,'#aebeba')
txt(320,148,'Diagrammatic elevation; actual span2815 and pier footprints in JSON.')
txt(304,159,'South RC140×300 receiving pier: x2832.5–2972.5, y8702.5–9002.5.')
txt(304,167,'Local pier projects80 beyond original140 wall each side; no invented300 bearing on140 wall.')
txt(304,175,'Door starts3100; north window starts3050. Actual finished pier/door tasks require HAD recheck.')

txt(304,196,'C / GROUND GRID TARGET, NOT SITE ACCEPTANCE','title')
txt(304,207,'RC250×450; 40 cover; 2H22 bottom, H8/100 links; pitch≤3000 under stated envelope.')
txt(304,215,f"M{grid_action['M']:.2f}/MR{grid_section['MR']:.2f}; V{grid_action['V']:.2f}/VRs{grid_links['VRs']:.2f}.")
txt(304,223,'Top−180 / bottom−630; separate650×650×500 cap envelope to−680 must still earn its node design.')
txt(304,231,f"Four-arm node vertical demand≈{grid['four_arm_node_vertical_demand']:.1f}kN; actual pile/soil capacity UNKNOWN.")
txt(304,239,'TargetD1200:680+H300+construction50+vent150=1180;20 excess. No inheritedD1300 or field-onlyD900.')
txt(304,247,'Masonry DPC ABOVE grid −180..−30 is a deliberate hypothesis; concrete/floor moisture route unqualified.')
txt(304,255,'No thin or omitted DPC is hidden beneath the cap. Grid/seat/cap geometry is still incomplete.')

txt(304,280,'D / E02 SERVICE ARCH GEOMETRY ONLY','title')
txt(304,291,'Plant-north y6500, x10800;240clear semicircle, spring2740/rise120/ring215.')
txt(304,299,'Extrados3075 leaves95 to slabsoffit3170;447.5 east abutment territory is NOT capacity.')
txt(304,307,'Actual pipe/socket,bends, ties, ring actions and downstream high-level branch still to join.')
txt(16,350,'WORK STILL TO DO','title')
for i,t in enumerate(result['retained_open_items']):txt(16,361+i*6,t)
txt(16,410,'REPRODUCIBLE CONDITIONAL DESIGN / calculations, exact source pins and adverse controls accompany every resistance. No programme completion claimed.')
parts.append('</svg>\n')
for name,content in [('open-loggia-support.json',json.dumps(result,indent=2)+'\n'),('open-loggia-support.svg','\n'.join(parts))]:
    p=OUT/name
    if '--check' in sys.argv:
        if not p.exists() or p.read_text()!=content: raise SystemExit('STALE '+str(p))
    else:p.write_text(content)
print('OPEN-N support checkpoint: source pin, equilibrium/scaling, finite field and conditional member checks passed')
