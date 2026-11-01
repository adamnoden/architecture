"""J-RC3: conditional joined reference, not an engineering release.

Standard-library calculation and deterministic inspection drawing. --check compares
the owning outputs; independent equilibrium, scaling and adverse checks run first.
"""
from pathlib import Path
import hashlib
import json
import math
import sys
from html import escape

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[2]
PINS = {
    'house-plan.json': '193805456e26533026814bebe8c6be862e26a7d944c360dbb6047a1bde2d2282',
    'house-bedroom-options.json': '57137bfc955d9dc26ad3037952cbf193753649a7464d2c1b9113bcac23e259b9',
    'house-source.json': '071dbcb60d5b61d6f3b9aa5ccbda120725f4e88b39812ed64f5de2a250f5bc73',
    'house-riser-trim.json': '73e1f78a590f2daf2dd3a339d74114fdcc06901ce80cdc9150ad20e2d028c323',
}
for name, pin in PINS.items():
    actual = hashlib.sha256((OUT / name).read_bytes()).hexdigest()
    if actual != pin:
        raise SystemExit(f'Input changed: {name}; re-evaluate owning geometry, do not refresh pin blindly')

def beam_uniform(w, length):
    if w < 0 or length <= 0:
        raise ValueError('positive span / nonnegative load required')
    return dict(M_kNm=w*length**2/8, V_kN=w*length/2)

def section(b, h, d, steel, fck=30, fyk=500):
    """Rectangular block; no redistribution; concrete shear without shear steel.
    Width/depth mm, steel mm2. Capacities conditional on all recorded inputs.
    """
    if min(b, h, d, steel, fck, fyk) <= 0 or d >= h:
        raise ValueError('invalid section')
    fyd = fyk/1.15
    fcd = .85*fck/1.5
    x = steel*fyd/(.8*b*fcd)
    z = d-.4*x
    rho = min(.02, steel/(b*d))
    k = min(2, 1+math.sqrt(200/d))
    shear_stress = max(.12*k*(100*rho*fck)**(1/3), .035*k**1.5*math.sqrt(fck))
    return dict(b_mm=b, h_mm=h, d_mm=d, As_mm2=steel,
                As_min_mm2=max(.26*2.9/500, .0013)*b*d,
                x_mm=x, x_over_d=x/d, z_mm=z,
                MR_kNm=steel*fyd*z/1e6,
                VRdc_kN=shear_stress*b*d/1000,
                ductility_screen=x/d <= .45)

area = lambda diameter: math.pi*diameter**2/4
floor_L = (11667.5-9300)/1000
floor_w = 1.35*7.5+1.5*2
floor_action = beam_uniform(floor_w, floor_L)
floor_action['M_kNm'] += 1.35*1.0*floor_L/4
floor_action['V_kN'] += 1.35*1.0/2
floor_sec = section(800, 200, 160, area(10)*800/150)

# Conservative elastic stiffness sensitivities, not inferred cracked EI / creep.
E = 22000*(38/10)**.3
Ig = 1000*200**3/12
floor_elastic = 5*9.5*(floor_L*1000)**4/(384*E*Ig)

# Ground cap: full 600-clear tray plus insulation and finite 100-wide RC walls.
clear = 600
outside = clear+2*(1.5+100+100)
rc_clear = outside-200
cap_L = (rc_clear+100)/1000
cap_udl = beam_uniform(1.35*6.5*.4+1.5*2*.4, cap_L)
# Separate point case: permanent mass plus 2 kN trial point, no co-applied Q UDL.
cap_point = beam_uniform(1.35*6.5*.4, cap_L)
cap_point['M_kNm'] += 1.5*2*cap_L/4
cap_point['V_kN'] += 1.5*2/2
cap_sec = section(400, 100, 62, area(8)*400/100)

# Masonry crossings bypass the trough: supports wholly outside its outer faces.
# 700 travel-length solid spreader, 300 finite seat each side. Envelope includes
# floor reaction, upper masonry and roof allowance; not an actual selected roof.
bridge_L = (outside+300)/1000
bridge_G = 7.5*floor_L/2 + .14*3.1*20 + 10 + .7*.12*25
bridge_Q = 2*floor_L/2 + 3
bridge_w = 1.35*bridge_G+1.5*bridge_Q
bridge_action = beam_uniform(bridge_w, bridge_L)
bridge_sec = section(700, 120, 82, area(10)*7)
bridge_seat_MPa = bridge_action['V_kN']*1000/(700*300)
bridge_bad_cover = section(700, 100, 52, area(10)*7)

def cracked_deflection(b,h,d,As,G,Q,L,creep=0):
    """Fully cracked transformed section; separate G creep and immediate Q.
    No tension stiffening credited. Creep is a sensitivity, not a prediction.
    """
    result=0
    for w,phi in [(G,creep),(Q,0)]:
        Ec=E/(1+phi); n=200000/Ec
        x=(-n*As+math.sqrt((n*As)**2+2*b*n*As*d))/b
        I=b*x**3/3+n*As*(d-x)**2
        result+=5*w*(L*1000)**4/(384*Ec*I)
    return result

bridge_sls={str(phi):cracked_deflection(700,120,82,area(10)*7,bridge_G,bridge_Q,bridge_L,phi) for phi in [0,1,2,3]}
bridge_sls['differential_shrinkage_300_microstrain_mm']=300e-6/120*(bridge_L*1000)**2/8
bridge_sls['L_over_250_comparator_mm']=bridge_L*1000/250
bridge_sls['cracking_moment_kNm']=2.9*700*120**2/6/1e6
bridge_sls['SLS_moment_kNm']=(bridge_G+bridge_Q)*bridge_L**2/8
assert bridge_sls['3']+bridge_sls['differential_shrinkage_300_microstrain_mm']<bridge_sls['L_over_250_comparator_mm']

# Fixed U-box spans longitudinally between real supports at court and outer
# inner-leaf axes. Its two sidewalls are beams, never soil-supported by default.
u_depth = 839.5-280
u_clear_length = 3585/1000
u_design_length = 4.25  # deliberately exceeds axis interval; bearing layout must fit.
concrete_G = 25*(outside/1000*.1+2*.1*(u_depth-.1*1000)/1000)
# Cover/finish 6.5kPa on full width; tray/foam authored .30kN/m allowance;
# full 600x260 water block =1.56kN/m, separate from 2kPa occupied cover action.
u_G = concrete_G + 6.5*outside/1000 + 1.0
u_Q = 2*outside/1000 + .6*.26*10
u_w = (1.35*u_G+1.5*u_Q)/2
u_action = beam_uniform(u_w, u_design_length)
u_sec = section(100, u_depth, 503, 2*area(12))
u_seat_MPa = u_action['V_kN']*1000/(100*300)

u_links_VR_kN=(2*area(6)/150)*.9*503*(500/1.15)/1000
u_base_action=beam_uniform(1.35*(2.5+.12+.12+2.6),cap_L)
u_base_section=section(1000,100,62,area(8)*1000/100)
assert u_base_action['M_kNm']<u_base_section['MR_kNm']
assert u_base_action['V_kN']<u_base_section['VRdc_kN']
u_end_seats_N=[[x,y,100,300] for x in [6098.5,7001.5] for y in [7932.5,11517.5]]
u_end_seats_E=[[x,y,300,100] for x in [7932.5,11517.5] for y in [6623.5,7526.5]]

holes = [(9500,4850,50,'22 water'),(9700,4850,50,'22 return'),(9800,5200,160,'110 soil-stack comparator')]
feet = [(9435,4700),(9835,4700),(9435,5300),(9835,5300)]
for x,y,d,_ in holes:
    assert 9410 <= x-d/2 and x+d/2 <= 9960
    assert 4700 <= y-d/2 and y+d/2 <= 5400
    for fx,fy in feet:
        nx,ny=max(fx,min(x,fx+100)),max(fy,min(y,fy+100))
        assert math.hypot(x-nx,y-ny)>d/2

# Actual mechanics checks: force equilibrium, load/span laws, failed altered
# cover and failed overload. They catch calculation errors rather than literals.
for w,L in [(3.7,.903),(13.2,4.25),(0,1)]:
    a=beam_uniform(w,L)
    assert math.isclose(2*a['V_kN'],w*L)
    assert math.isclose(beam_uniform(2*w,L)['M_kNm'],2*a['M_kNm'])
    assert math.isclose(beam_uniform(w,2*L)['M_kNm'],4*a['M_kNm'])
for invalid in [(-1,1),(1,0)]:
    try: beam_uniform(*invalid)
    except ValueError: pass
    else: raise AssertionError('invalid action accepted')
assert not bridge_bad_cover['ductility_screen']
for a,s in [(floor_action,floor_sec),(cap_udl,cap_sec),(cap_point,cap_sec),(bridge_action,bridge_sec),(u_action,u_sec)]:
    assert s['ductility_screen'] and s['As_mm2']>=s['As_min_mm2']
    assert a['M_kNm']<s['MR_kNm'] and a['V_kN']<s['VRdc_kN']
assert 2*bridge_action['M_kNm'] > bridge_sec['MR_kNm']

data = dict(
    identity='J-RC3 compact-B joined RC reference; conditional internal design, unadopted',
    startingMain='1e7b2cbce408834ca3cbb91c286af37eda066829', sourceSha256=PINS,
    units='mm; actions kN, kN/m or kPa as labelled; stresses MPa',
    upper=dict(section=dict(FFL=3450,finish=20,IAS_function=60,slab_top=3370,slab_soffit=3170,services=55,ceiling=15,ceiling_underside=3100),
               old_opening=[9370,4650,700,800],gross_riser=[9410,4700,550,700],cabinet=[9385,4675,600,750],
               formed_holes=holes,contact_plinths_100_square=feet,
               floor_action=floor_action,section_check=floor_sec,
               elastic_deflection_mm={str(f):floor_elastic/f for f in [1,.25,.1]},
               elastic_E_MPa=E,actual_cracked_EI=None,actual_creep=None),
    cap=dict(clear_service_width=clear,RC_clear_span=rc_clear,support_axis_span=cap_L*1000,outside_width=outside,
             RC_thickness=100,module_length=400,section_check=cap_sec,UDL=cap_udl,point_alternative=cap_point,
             bare_RC_mass_kg=outside/1000*.4*.1*2500,
             mass_with_80mm_mineral_upper_at_2200_kg_m3=outside/1000*.4*(.1*2500+.08*2200)),
    bridge=dict(travel_length=700,RC_thickness=120,overall_cross_width=outside+600,seat_each_side=300,
                support_axis_span=bridge_L*1000,G_envelope_kN_m=bridge_G,Q_envelope_kN_m=bridge_Q,
                ULS_kN_m=bridge_w,action=bridge_action,section_check=bridge_sec,
                seat_stress_MPa=bridge_seat_MPa,rejected_RC100_cover35=bridge_bad_cover,SLS=bridge_sls),
    fixed_U=dict(outer_width=outside,sidewall_depth=u_depth,base_top=-739.5,base_bottom=-839.5,
                 side_RC=100,base_RC=100,physical_inner_leaf_axis_gap=u_clear_length*1000,
                 conservative_calculation_span=u_design_length*1000,G_kN_m=u_G,Q_kN_m=u_Q,
                 per_sidewall_action=u_action,sidewall_section=u_sec,seat_stress_MPa=u_seat_MPa,
                 seat_length=300,actual_support_stiffness=None,links_H6_at_150_VR_kN=u_links_VR_kN,base_transverse_action=u_base_action,base_section=u_base_section,end_seats_N_xywh=u_end_seats_N,end_seats_E_xywh=u_end_seats_E),
    ground=dict(FFL=0,field_RC200_bottom=-380,cover_RC100_bottom=-280,bridge_RC120_bottom=-300,tray_bottom=-639.5,
                U_bottom=-839.5,grade=-1300,raw_soil_clearance=460.5,
                authored_heave_stress=300,declared_final_reserve=50,surplus_beyond_reserve=60.5,
                separate_construction_loss_50_residual_clearance=110.5,
                N_axis=6600,N_service_band=[6300,6900],N_outer_U=[6098.5,7101.5],
                E_axis=7125,E_service_band=[6825,7425],E_outer_U=[6623.5,7626.5]),
    limits=['No selected roof, reinforcement procurement, masonry/ground capacity, firestop, acoustic/wet-floor qualification or engineer acceptance.',
            'Two22 pipes and110 stack comparator do not fit or qualify the whole riser programme; future penetrations require structural recalculation.',
            'Wide permanent bridges bypass trough; mineral wall plinth through insulation creates a named thermal bridge requiring calculation.',
            '25mm cover is an explicit trial; rejected RC100 at35mm invalidates its ductility screen. RC120 is the corrected candidate. No durability/fire requirement is waived.',
            'Fixed U sidewall seats and bridge seats must connect to distinct named grillage supports; no soil bearing or DPC sliding capacity inferred.'])

parts=['<svg xmlns="http://www.w3.org/2000/svg" width="594mm" height="420mm" viewBox="0 0 594 420">',
       '<style>text{font-family:DejaVu Sans,sans-serif;fill:#243a44} .small{font-size:3.1px} .title{font-size:5px;font-weight:bold} .note{font-size:3.6px} .line{stroke:#243a44;stroke-width:.4;fill:none}</style>',
       '<rect width="594" height="420" fill="#faf8f1"/>']
def text(x,y,t,cls='note'):
    parts.append(f'<text x="{x}" y="{y}" class="{cls}">{escape(t)}</text>')
def rect(x,y,w,h,fill='#c5d0cf',stroke='#243a44'):
    parts.append(f'<rect x="{x:.3f}" y="{y:.3f}" width="{w:.3f}" height="{h:.3f}" fill="{fill}" stroke="{stroke}" stroke-width=".35"/>')
def line(x1,y1,x2,y2,color='#243a44'):
    parts.append(f'<path d="M{x1},{y1} L{x2},{y2}" stroke="{color}" stroke-width=".4" fill="none"/>')
text(16,14,'J-RC3 / compact B: one joined reference with explicit acceptance limits','title')
text(16,22,'1 November 2026 · UNADOPTED · mm / kN · calculated assumptions are not installed or accepted capacities')
line(16,28,578,28)
text(16,39,'A / UPPER RISER · 1:10','title')
px=lambda x:20+(x-9200)/10
py=lambda y:47+(5500-y)/10
rect(px(9230),py(5500),14,90,'#aebeba')
rect(px(9370),py(5500),90,90,'#e4e9e7')
rect(px(9385),py(5425),60,75,'none','#aa6a35')
rect(px(9410),py(5400),55,70,'none','#6e91a0')
parts.append(f'<rect x="{px(9370)}" y="{py(5450)}" width="70" height="80" fill="none" stroke="#b35b60" stroke-dasharray="2 1" stroke-width=".4"/>')
for x,y,d,name in holes:
    parts.append(f'<circle cx="{px(x)}" cy="{py(y)}" r="{d/20}" fill="white" stroke="#243a44" stroke-width=".4"/>')
for x,y in feet: rect(px(x),py(y+100),10,10,'#ad8755')
text(139,57,'Solid RC200 replaces dashed 700 × 800 hole.','small')
text(139,64,'Two formed Ø50 / 22 copper examples.','small')
text(139,71,'One formed Ø160 / 110 stack comparator.','small')
text(139,78,'Other services remain unallocated.','small')
text(139,88,'Four 100 × 100 plinths contact RC directly.','small')
text(139,95,'Upper layers carry no cabinet gravity load.','small')
text(139,105,'Brown: fixed cabinet; blue: gross riser.','small')
text(139,112,'Grey: core x9230–9370; all other B faces retained.','small')
text(139,122,'Holes set before reinforcement / casting.','small')
text(139,129,'No ordinary service operation cuts the slab.','small')

text(300,39,'B / UPPER FLOOR & SERVICE SECTION · 1:5','title')
sx=310; sy=lambda z:80+(3450-z)/5
for z,h,c in [(3450,20,'#c1a57d'),(3430,60,'#e1d6b8'),(3370,200,'#aebeba'),(3170,55,'#eef1ed'),(3115,15,'#d1d6d2')]:
    rect(sx,sy(z),95,h/5,c)
for z,label in [(3450,'FFL +3450'),(3370,'RC top +3370'),(3170,'RC soffit +3170'),(3100,'ceiling +3100')]:
    line(407,sy(z),420,sy(z));text(424,sy(z)+1,label,'small')
text(310,53,'20 finish + 60 IAS + 200 RC + 55 services + 15 ceiling = 350.','small')
text(310,61,f"EW span {floor_L*1000:g}; M {floor_action['M_kNm']:.2f} / MR {floor_sec['MR_kNm']:.2f} kNm per metre.",'small')
text(310,69,'Net width 800; H10/150 each face/direction; d160, cover25 trial.','small')

text(16,177,'C / FULL COURT BOX · 1:10 transverse','title')
cx=lambda v:25+(v+outside/2)/10
cz=lambda v:192+(-v)/10
# RC U, external foam + steel tray, and fully layered cap.
rect(cx(-outside/2),cz(-280),10,(739.5-280)/10,'#aebeba')
rect(cx(outside/2-100),cz(-280),10,(739.5-280)/10,'#aebeba')
rect(cx(-outside/2),cz(-739.5),outside/10,10,'#aebeba')
rect(cx(-401.5),cz(-280),10,359.5/10,'#d4c28b')
rect(cx(301.5),cz(-280),10,359.5/10,'#d4c28b')
rect(cx(-301.5),cz(-638),603/10,.3,'#7896a3')
rect(cx(-401.5),cz(-639.5),803/10,10,'#d4c28b')
for top,h,col in [(0,15,'#c1a57d'),(-15,65,'#e1d6b8'),(-80,100,'#d4c28b'),(-180,100,'#aebeba')]:
    rect(cx(-outside/2),cz(top),outside/10,h/10,col)
line(cx(-300),cz(-378),cx(300),cz(-378),'#477e98')
text(34,cz(-440),'600 CLEAR carrier space','small')
line(18,cz(-1300),240,cz(-1300),'#987852')
text(25,cz(-1300)-2,'soil/grade −1300; 460.5 raw clearance','small')
text(247,199,'Full width 1003, not 800.','small')
text(247,207,'Tray1.5 + foam100 each side.','small')
text(247,215,'RC clear 803; seats100.','small')
text(247,223,'Cap support axes 903.','small')
text(247,231,'Cap100 + foam100 + 65 + 15.','small')
text(247,239,'60 below bridge to crown −378.','small')
text(247,247,'Tray invert depth / flow by HAD.','small')
text(247,255,'U base underside −839.5.','small')
text(247,263,'No discharge to structural void.','small')
text(247,271,'D1300 after H300 + loss50','small')
text(247,279,'leaves 60.5 above final reserve50.','small')

text(363,177,'D / FINITE LOAD PATHS & ADVERSE BOUNDARIES','title')
rows=[
    ('Removable cap',cap_point,cap_sec),
    ('Permanent masonry bridge',bridge_action,bridge_sec),
    ('Fixed U / each sidewall',u_action,u_sec)]
y=192
for label,a,s in rows:
    text(363,y,label,'note');y+=8
    text(363,y,f"M {a['M_kNm']:.2f} / MR {s['MR_kNm']:.2f}; V {a['V_kN']:.2f} / VRdc {s['VRdc_kN']:.2f}",'small');y+=8
    text(363,y,f"b{int(s['b_mm'])} / h{s['h_mm']:g} / d{s['d_mm']:g}; As{s['As_mm2']:.1f}; x/d{s['x_over_d']:.3f}",'small');y+=12
text(363,y,'Masonry bridge: 700 along travel; 1603 across; 300 seats.','small');y+=8
text(363,y,'Seats outside U-box → permanent piers → reinforced grid.','small');y+=8
text(363,y,'Box: two 100 × 559.5 longitudinal beams; 2H12 stacked.','small');y+=8
text(363,y,'Box end seats 100 × 300; max calculation span 4250.','small');y+=8
text(363,y,'25 cover is a TRIAL; RC100 bridge rejected; RC120 checked.','small');y+=8
text(363,y,'Wall plinth through insulation needs thermal / DPC splice.','small');y+=8
text(363,y,'Cap 400 long: bare RC ≈100 kg; lifting equipment required.','small')
line(16,394,578,394)
text(16,402,'REFERENCE DESIGN ONLY / derived resistances require specified materials, bond, cover, detailing, bearings and competent acceptance.','small')
text(16,409,'Source pins, equations, load envelopes and falsifiers: joined-rc-reference.json + ../joined-rc-reference.md. No site, fire, acoustic or whole-house approval.','small')
parts.append('</svg>\n')

for name, content in [('joined-rc-reference.json',json.dumps(data,indent=2)+'\n'),('joined-rc-reference.svg','\n'.join(parts))]:
    target=OUT/name
    if '--check' in sys.argv:
        if not target.exists() or target.read_text()!=content:
            raise SystemExit('STALE: '+str(target))
    else: target.write_text(content)
print('J-RC3: source identities, equilibrium/scaling, negative cases and conditional component checks passed')
