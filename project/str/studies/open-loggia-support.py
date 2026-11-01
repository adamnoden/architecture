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
HAD_COMMIT='0b2f7d48c82459214cae4b6778c3ced7b3e6c54b'
HAD_SHA='9984a61f84943abe8b95b59db6da675b43999e9d1530b2508b7ade67062c2936'
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
assert gw['rear-east']['a'][0]==7552.5
assert uw['rear-east']['a'][0]==7552.5
for w in had['upperWalls']:
    if 'finishedFaces' in w: assert math.isclose(w['t'],w['finishedFaces'][1]-w['finishedFaces'][0])
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
 ('south-W-gallery','NS',[2917.5,2650,4800,3917.5],1267.5,7.5),
 ('south-E-gallery','NS',[7200,2650,9300,3917.5],1267.5,7.5),
 ('east-gallery','EW',[8082.5,3917.5,9300,8082.5],1217.5,7.5),
 ('west-south','NS',[332.5,3247.5,2817.5,4332.5],1085,7.5),
 ('SW-collector-bay','NS',[2917.5,3917.5,3917.5,4332.5],415,7.5),
 ('west-stair-gallery','EW',[2917.5,4432.5,3917.5,8082.5],1000,7.5),
 ('west-stair-gallery-N','EW',[2917.5,8082.5,4377.5,8852.5],1460,7.5),
 ('east-gallery-N','EW',[7622.5,8082.5,9300,8290],1677.5,7.5),
 ('NW-W','EW',[332.5,8852.5,2902.5,11667.5],2570,7.5),
 ('NW-E','EW',[2902.5,8852.5,4377.5,11667.5],1475,7.5),
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

# Actual support-line coverage. Union intervals detect unsupported PARTS of an
# edge; a nominal span or a nearby corner cannot make an absent wall continuous.
horizontal={332.5:[(332.5,11667.5,'outer-S')],11667.5:[(332.5,11667.5,'outer-N')],
            2650:[(2817.5,4800,'front-W'),(7200,9300,'front-E')],
            3247.5:[(332.5,2817.5,'L-north')],
            3917.5:[(2917.5,3917.5,'CW-collector'),(3917.5,8082.5,'court-S'),(8082.5,9300,'CE-collector')],
            4332.5:[(332.5,3917.5,'stair-header')],8852.5:[(332.5,4377.5,'rear-W')],
            8290:[(7552.5,11667.5,'rear-E-extended')]}
vertical={332.5:[(332.5,11667.5,'outer-W')],11667.5:[(332.5,11667.5,'outer-E')],
          3917.5:[(3917.5,8082.5,'court-W')],8082.5:[(3917.5,8082.5,'court-E')],
          9300:[(332.5,8290,'spine')],4377.5:[(7750,11667.5,'loggia-W')],
          7622.5:[(7750,11667.5,'loggia-E')],2902.5:[(8852.5,11667.5,'actual-wet-beam')],2917.5:[(2650,8852.5,'return-and-trimmer')]}
def edge_covered(interval,segments):
    cursor=interval[0]
    for lo,hi,name in sorted(segments):
        if hi<=cursor: continue
        if lo>cursor+1e-8:return False
        cursor=max(cursor,hi)
        if cursor>=interval[1]-1e-8:return True
    return False
for f in floor:
    x1,y1,x2,y2=f['rectangle']
    if f['direction']=='NS':
        pairs=[([x1,x2],horizontal.get(y,[])) for y in [y1,y2]]
    else:pairs=[([y1,y2],vertical.get(x,[])) for x in [x1,x2]]
    assert all(edge_covered(*p) for p in pairs),f['id']+' has an unsupported edge'
    f['both_finite_edges_covered']=True
assert not edge_covered([2817.5,3917.5],[(3917.5,8082.5,'court-S')])

# The removed ground reading wall requires an ACTUAL beam under its upper wall.
# All adjacent NW slab tributary width is conservatively collected by this beam.
wet_trib=(2902.5-332.5+4377.5-2902.5)/2/1000
wet_G=7.5*wet_trib+.14*3.1*20+.2*.15*25
wet_Q=2*wet_trib
wet_section=rc(200,350,311,3*area(16),25)
wet_w=1.35*wet_G+1.5*wet_Q
# North receiver remains INSIDE the actual inner-core north face11737.5.
# Shift its reaction to11512.5 and calculate the155 loaded overhang explicitly.
wet_L=2.660;wet_a=.155;wet_total=wet_L+wet_a
wet_RN=wet_w*wet_total**2/(2*wet_L);wet_RS=wet_w*wet_total-wet_RN
wet_M=wet_RS**2/(2*wet_w);wet_MN=-wet_w*wet_a**2/2
wet_action=dict(M=wet_M,V=max(wet_RS,wet_RN),south_reaction=wet_RS,north_reaction=wet_RN,
                north_support_hogging=wet_MN,loaded_length=wet_total,
                reaction_equilibrium=wet_RS+wet_RN-wet_w*wet_total,
                moment_equilibrium=wet_RN*wet_L-wet_w*wet_total**2/2)
wet_links=links(200,311,6,100)
wet=dict(axis_x=2902.5,support_axes_y=[8852.5,11512.5],span=2660,loaded_north_overhang=155,
         top=3370,bottom=3020,finished_soffit=3005,upstand_above_FFL=0,
         tributary_width=wet_trib*1000,G=wet_G,Q=wet_Q,
         section=wet_section,action=wet_action,links=wet_links,
         south_receiving_core=[2772.5,8627.5,260,450],
         south_receiving_finished=had['structuralChanges']['newWetWallBeam']['southReceiverFinished'],
         north_receiving_core=[2772.5,11287.5,260,450],
         north_receiving_finished=had['structuralChanges']['newWetWallBeam']['northReceiverFinished'],
         door_edge_x=3100,north_window_edge_x=3050,
         actual_receiving_pier_material='RC260x450;H6/100;4H16;16mm maximum aggregate',
         shear_links_required=wet_action['V']>wet_section['VRdc'],resolved=False)
# Retain longer2815 sensitivity for sagging; no fictitious span shortening credit.
wet['fully_cracked_phi3_deflection_mm']=cracked(200,350,311,wet_section['As'],wet_G,wet_Q,2.815,3)
wet['differential_shrinkage_300microstrain_mm']=300e-6/350*2815**2/8
wet['L250_comparator_mm']=2815/250
wet['top_hogging_section']=rc(200,350,314,2*area(10),25)
assert wet_action['M']<wet_section['MR'] and wet_section['ductility']
assert abs(wet_MN)<wet['top_hogging_section']['MR']
assert wet_action['V']<min(wet_links['VRs'],wet_links['VRmax'])
assert abs(wet_action['reaction_equilibrium'])<1e-9 and abs(wet_action['moment_equilibrium'])<1e-9

# Finite wet receiver reinforcement: all coordinates local x/y, absolute z.
# Curve chords2degrees have <0.036mm maximum radial error; clearances below
# include0.1mm subtraction. No made-up tolerance is added to physical spacing.
def seg_distance(p0,p1,q0,q1):
    sub=lambda a,b:tuple(x-y for x,y in zip(a,b))
    dot=lambda a,b:sum(x*y for x,y in zip(a,b))
    u=sub(p1,p0);v=sub(q1,q0);w=sub(p0,q0)
    a=dot(u,u);b=dot(u,v);c=dot(v,v);d=dot(u,w);e=dot(v,w)
    def at(t,z):return math.dist(tuple(p0[i]+t*u[i] for i in range(3)),tuple(q0[i]+z*v[i] for i in range(3)))
    values=[at(0,max(0,min(1,e/c))),at(1,max(0,min(1,(e+b)/c))),
            at(max(0,min(1,-d/a)),0),at(max(0,min(1,(b-d)/a)),1)]
    det=a*c-b*b
    if det>1e-10:
        t=(b*e-c*d)/det;z=(a*e-b*d)/det
        if 0<=t<=1 and 0<=z<=1:values.append(at(t,z))
    return min(values)
def path_clear(a,b):
    return min(seg_distance(p,q,r,t) for p,q in zip(a['points'],a['points'][1:])
               for r,t in zip(b['points'],b['points'][1:]))-(a['dia']+b['dia'])/2-.1
joint_bars=[]
def bent_bar(name,x,z,dia,mandrel,tail):
    R=(mandrel+dia)/2;leg_y=90;start_y=leg_y+R
    points=[(x,450,z),(x,start_y,z)]
    points += [(x,start_y-R*math.sin(math.radians(t)),z-R*(1-math.cos(math.radians(t)))) for t in range(2,91,2)]
    points.append((x,leg_y,z-R-tail))
    return dict(id=name,dia=dia,points=points,mandrel=mandrel,tail=tail,
                anchorage_length=450-start_y+math.pi*R/2+tail,
                bond_MPa=(2.1 if dia==10 else 3),
                full_yield_lbrqd=dia/4*(500/1.15)/(2.1 if dia==10 else 3),
                bend_required_at_full_fyd=area(dia)*(500/1.15)*(1/(20 if dia==16 else 40)+1/(2*dia))/17)
for i,x in enumerate([90,130,170]):joint_bars.append(bent_bar('B'+str(i+1),x,3059,16,450,600))
for i,x in enumerate([90,170]):joint_bars.append(bent_bar('T'+str(i+1),x,3334,10,180,110))
for a in joint_bars:
    assert a['mandrel']>=a['bend_required_at_full_fyd']
    assert a['anchorage_length']>=a['full_yield_lbrqd']
    assert a['tail']>=5*a['dia']
column_bars=[dict(id='C'+str(i+1),dia=16,points=[(x,y,0),(x,y,3330)])
             for i,(x,y) in enumerate([(39,39),(39,411),(221,39),(221,411)])]
column_links=[]
for z in list(range(2160,2961,100))+[3010,3110,3210,3270]:
    column_links.append(dict(id='CL'+str(z),dia=6,points=[(28,28,z),(232,28,z),(232,422,z),(28,422,z),(28,28,z)]))
beam_links=[dict(id='BL'+str(y),dia=6,points=[(58,y,3048),(202,y,3048),(202,y,3342),(58,y,3342),(58,y,3048)]) for y in [350,450]]
checks=[]
for i,a in enumerate(joint_bars):
    for b in joint_bars[i+1:]+column_bars+column_links+beam_links:
        # Beam longitudinal bars physically contact their own stirrup by design.
        if b['id'].startswith('BL'):
            assert all(p[1]<350 for p in a['points'][2:]) # onlystraightentrytoucheshoop
            continue
        checks.append(dict(a=a['id'],b=b['id'],clear=path_clear(a,b)))
for a in column_bars:
    for b in beam_links:checks.append(dict(a=a['id'],b=b['id'],clear=path_clear(a,b)))
for a in column_links:
    for b in beam_links:checks.append(dict(a=a['id'],b=b['id'],clear=path_clear(a,b)))
assert min(c['clear'] for c in checks)>=21
wet['receiver_joint']=dict(coordinates='Receiver localx0..260/y0..450; zabsolute. NorthmirrorNS.',
                           bars=joint_bars,column_bars=column_bars,column_links=column_links,beam_links=beam_links,
                           clearance_minimum=min(c['clear'] for c in checks),critical=sorted(checks,key=lambda c:c['clear'])[:10],
                           minimum_clear=21,maximum_aggregate=16,curve_chord_radial_error_bound=.036,
                           links_omitted_from_longitudinal_clearance='Onlystraightentryownhoops350/450touchlongitudinalbars;hookcurvesareinsidethoseplanes.',
                           positive_and_negative_full_yield_anchorage=True,
                           link_planes='Columnlinks3010/3110 bracketbeam3059entry;topring3270belowtop3334entry;beamlinks350/450atstraightentry;noclosedbeamhoopcrossescurvedhook.',
                           holds='Columnlowerlap/groundjoint and uppermasonryloadentry remain separate. HAD must acceptwiderreceiver/windowgap.')

# Quantified lower-grid target, not a soil or installed foundation selection.
# Support pitch must remain <=3000 for this line envelope; cap below beam remains
# a finite separate envelope. No number is a geotechnical capacity.
grid_inner_G=2*.14*3.1*20+2*7.5*3.585/2+10
grid_weather_G=2*.1025*3.1*20
grid_G=grid_inner_G+grid_weather_G+.6*.45*25
grid_Q=2*2*3.585/2+3
grid_section=rc(600,450,392,3*area(20),40)
grid_action=udl(1.35*grid_G+1.5*grid_Q,3)
grid_links=links(600,392,8,100)
grid_links['VRs']*=2 # four actual legs: outer closed link plus inner crosstie.
grid_links['provided_ratio']*=2
torque_per_m=(1.35*grid_inner_G+1.5*grid_Q)*(-.1225)+(1.35*grid_weather_G)*.24875
grid_T=abs(torque_per_m)*3/2
Ak=500*350 # conservative effective torsion-cell area inside actual600x450 cage.
torsion_leg_ratio=grid_T*1e6/(2*Ak*(500/1.15))
shear_leg_ratio=grid_action['V']*1000/(.9*392*(500/1.15))/4
assert torsion_leg_ratio+shear_leg_ratio<area(8)/100
grid_TRmax=.528*17*Ak*100/1e6
assert grid_action['V']/grid_links['VRmax']+grid_T/grid_TRmax<1
torsion_u=2*(500+350)
torsion_As=grid_T*1e6*torsion_u/(2*Ak*(500/1.15))
bottom_flexure_As=grid_section['As']*grid_action['M']/grid_section['MR']
assert (grid_section['As']-bottom_flexure_As)/2>torsion_As/4
grid=dict(top=-180,bottom=-630,width=600,depth=450,maximum_support_pitch=3000,
          west_weather_beam_bounds_x=[4200,4800],east_weather_beam_bounds_x=[7200,7800],
          west_core_axis=4377.5,west_weather_axis=4748.75,west_beam_axis=4500,
          torsion_kNm=grid_T,distributed_torque_kNm_m=torque_per_m,
          torsion_effective_area_mm2=Ak,outer_link_torsion_plus_shear_ratio=torsion_leg_ratio+shear_leg_ratio,
          outer_link_provided_ratio=area(8)/100,
          longitudinal_cage='3H20 TOP +3H20 BOTTOM;2H12 on each side face;closed4legH8/100',
          torsion_longitudinal_total_required= torsion_As,
          bottom_flexural_As_required=bottom_flexure_As,
          bottom_corner_available_after_flexure_each=(grid_section['As']-bottom_flexure_As)/2,
          torsion_corner_required_each=torsion_As/4,
          TRmax=grid_TRmax,V_T_strut_utilisation=grid_action['V']/grid_links['VRmax']+grid_T/grid_TRmax,
          cap_envelope_bottom=-630,cap_size_xy=[600,600],minimum_cap_depth=450,
          cover_comparator=40,G=grid_G,Q=grid_Q,section=grid_section,
          action=grid_action,links=grid_links,shear_links_required=grid_action['V']>grid_section['VRdc'],
          four_arm_node_vertical_demand=4*grid_action['V'],
          pile_capacity=None,soil_stiffness=None,cap_adequacy=None,
          masonry_DPC='150 above grid top -180..-30 hypothesis; MAT moisture junction unqualified',
          target_D=1300,heave_stress=300,construction_loss=50,ventilation_comparator=150,
          lowest_member=-750,raw_clearance_below_lowest_member=550,post_heave_and_loss=200,ventilation_surplus=50,
          cavity_route='Drained tray above common beam; NOT225 clear cavity. MAT owns actual tray/weep return.',
          deck_cap_route='Integral600 nodes stay within600 weatherbeam footprint. No900 cap islands; independent sloped deck retains25gap. Lowties top-550/bottom-750 pass below depresseddeck.')
assert grid_action['M']<grid_section['MR'] and grid_section['ductility']
assert grid_action['V']<min(grid_links['VRs'],grid_links['VRmax'])

# Named ground supports: no arbitrary3m bay is asked to absorb concentrated
# wet-beam/pier or stair-frame reactions. Each special receiver is a cap node.
special_nodes=[
 dict(id='wet-S',xy=[2902.5,8852.5],point_ULS=wet_RS),
 dict(id='wet-N',xy=[2902.5,11512.5],point_ULS=wet_RN),
 dict(id='stair-post',xy=[2942.5,7132.5],point_ULS=100),
 dict(id='stair-header-W',xy=[332.5,4332.5],point_ULS=100),
 dict(id='stair-header-E',xy=[3917.5,4332.5],point_ULS=100),
 dict(id='entrance-W',xy=[4785,3917.5],point_ULS=100),
 dict(id='entrance-E',xy=[7215,3917.5],point_ULS=100),
]
# Conservative cap action envelope covers4wide-beam end reactions plus100point.
# This is a required pile reaction, not a claim that unknown ground supplies it.
cap_N=850 # required node-action ceiling >=4maximumwidebeamreactions+100point
assert cap_N>=4*grid_action['V']+100
cap_M=100 # authored biaxial moment ceiling; no cancellation of eccentricities.
cap_d=370;cap_lever=100
cap_tie=cap_N/2*cap_lever/cap_d+cap_M*1000/cap_d
cap_As=5*area(20)
cap=dict(plan=[600,600],minimum_depth=450,d=370,cover=40,
         N_envelope_kN=cap_N,M_envelope_kNm_each_axis=cap_M,
         specified_pile_head_diameter=400,pile_soil_capacity=None,
         average_head_stress_MPa=cap_N*1000/area(400),average_only_not_nodal_capacity=True,
         N_M_node_transfer_qualified=False,
         tie_demand_kN_each_direction=cap_tie,
         bottom_steel_each_direction='5H20, orthogonal layers;60/110/300/490/540 positions',As_each_direction=cap_As,
         tie_resistance_kN=cap_As*(500/1.15)/1000,
         continuous_straight_development_into_beam_arms=750,
         terminal_corner_mandrel=330,
         bottom_bar_positions_in_600=[60,110,300,490,540],
         pile_vertical_bar_centres=[[300+141*math.cos(math.radians(22.5+45*i)),300+141*math.sin(math.radians(22.5+45*i))] for i in range(8)],
         full_yield_bond_length_mm=20/4*(500/1.15)/3,
         available_straight_development_mm=750,
         footing_role='Integral grillage node, not isolated cap: bars continue into actual beam arms; terminal corner cages and pilehead lateral/uplift remain explicit admission duties.')
assert cap_tie<cap['tie_resistance_kN']
assert cap['available_straight_development_mm']>cap['full_yield_bond_length_mm']
cap['per_bar_force_kN']=cap_tie/5
cap['required_mandrel_mm']=cap['per_bar_force_kN']*1000*(1/50+1/(2*20))/17
assert cap['required_mandrel_mm']<=330
for v in cap['pile_vertical_bar_centres']:
    assert min(abs(v[0]-q) for q in cap['bottom_bar_positions_in_600'])>=41
    assert min(abs(v[1]-q) for q in cap['bottom_bar_positions_in_600'])>=41

def circle_NM(Ntarget,angle_deg,bar_dia=22,nstrip=400,epsmax=.0035,details=False):
    """Actual8bar circular section; resultant capacity for curvature angle.
    Parabolic-rectangular concrete, displaced concrete subtracted at steel.
    Returns BOTH moment components: no fictitious rotation of an axisymmetric cage.
    """
    R=200;rs=R-40-8-bar_dia/2;phi=math.radians(angle_deg)
    bars=[(rs*math.cos(math.radians(22.5+45*i)),rs*math.sin(math.radians(22.5+45*i))) for i in range(8)]
    def stress(e):return 0 if e<=0 else 17 if e>=.002 else 17*(1-(1-e/.002)**2)
    def calc(c):
        dz=400/nstrip;N=Mn=0;steel=[];Cs=0;Csx=0;Csy=0
        for k in range(nstrip):
            z=(k+.5)*dz;y=R-z
            F=stress(epsmax*(c-z)/c)*2*math.sqrt(max(0,R*R-y*y))*dz
            N+=F;Mn+=F*y
        Cgross=N;Cx=Mn*math.cos(phi);Cy=Mn*math.sin(phi)
        Mx=Cx;My=Cy
        for x,y in bars:
            z=R-(x*math.cos(phi)+y*math.sin(phi));e=epsmax*(c-z)/c
            s=max(-500/1.15,min(500/1.15,200000*e))
            F=area(bar_dia)*(s-stress(e))
            Cs+=area(bar_dia)*stress(e);Csx+=area(bar_dia)*stress(e)*x;Csy+=area(bar_dia)*stress(e)*y
            steel.append(dict(id='P'+str(len(steel)+1),x=x,y=y,strain=e,stress=s,force_kN=area(bar_dia)*s/1000))
            N+=F;Mx+=F*x;My+=F*y
        return N/1000,Mx/1e6,My/1e6,dict(concrete_kN=(Cgross-Cs)/1000,
                  concrete_centroid=[(Cx-Csx)/(Cgross-Cs),(Cy-Csy)/(Cgross-Cs)],steel=steel,epsmax=epsmax)
    lo,hi=1,2000000
    if calc(hi)[0]<Ntarget:raise ValueError('strain too small for axial compression')
    for _ in range(50):
        c=(lo+hi)/2
        if calc(c)[0]<Ntarget:lo=c
        else:hi=c
    N,Mx,My,detail=calc((lo+hi)/2)
    return dict(N=N,Mx=Mx,My=My,curvature_angle=angle_deg,c=(lo+hi)/2,**(detail if details else {}))

pile_domain=[]
for N in [0,50,100,150,200,300,500,700,850]:
    for angle in range(0,46,5):
        a=circle_NM(N,angle)
        a['resultant']=math.hypot(a['Mx'],a['My'])
        pile_domain.append(a)
        assert abs(a['N']-N)<.01
pile_min=min(a['resultant'] for a in pile_domain)
assert pile_min>math.sqrt(2)*100
for a in pile_domain:
    if a['curvature_angle']==45:
        assert abs(a['Mx']-a['My'])<.01
        assert a['Mx']>100 and a['My']>100
coarse=circle_NM(850,0,nstrip=200)
fine=circle_NM(850,0,nstrip=800)
assert abs(coarse['Mx']-fine['Mx'])/fine['Mx']<.002
cap['pile_head_section']=dict(diameter=400,C='C30',steel='8H22 at22.5+45kdegrees;R141',
                              concrete_law='parabolic-rectangle;epsc2=.002,epscu=.0035;no tension',
                              displaced_concrete_subtracted=True,
                              sampled_N_domain=[0,850],sampled_curvature_angles=[0,45,5],
                              moment_vector_demand=[100,100],resultant_demand=math.sqrt(2)*100,
                              sampled_minimum_resultant=pile_min,samples=pile_domain,
                              convergence_200_to_800_relative=abs(coarse['Mx']-fine['Mx'])/fine['Mx'],
                              admission='Finite section screen; exact N-M vector interpolation,head/arm anchorage and site axial/lateral/group response remain to review.')
# ACTUAL traction decomposition at the signed100/100 load pair, distinct
# from section boundary capacity. A uniform N/A is not substituted for this.
head_states=[]
for Ntarget in [0,100,300,850]:
    lo,hi=.000001,.0035
    for iteration in range(42):
        eps=(lo+hi)/2
        try: state=circle_NM(Ntarget,45,epsmax=eps,details=True)
        except ValueError:lo=eps;continue
        if state['Mx']<100:lo=eps
        else:hi=eps
    state=circle_NM(Ntarget,45,epsmax=(lo+hi)/2,details=True)
    state['steel_compression_kN']=sum(max(0,b['force_kN']) for b in state['steel'])
    state['steel_tension_kN']=-sum(min(0,b['force_kN']) for b in state['steel'])
    state['concrete_max_MPa']=17 if state['epsmax']>=.002 else 17*(1-(1-state['epsmax']/.002)**2)
    state['compression_segment_depth']=min(400,state['c'])
    t=max(-1,min(1,(200-state['c'])/200))
    state['concrete_compressed_gross_area']=200**2*(math.acos(t)-t*math.sqrt(1-t*t))
    state['compression_area_average_MPa']=state['concrete_kN']*1000/state['concrete_compressed_gross_area']
    state['cracked_strut_8p976_area_required']=state['concrete_kN']*1000/(.528*17)
    state['CTT_node_control_MPa']=.75*(1-30/250)*17
    state['unredistributed_peak_below_CTT_control']=state['concrete_max_MPa']<=state['CTT_node_control_MPa']
    assert abs(state['N']-Ntarget)<.01 and abs(state['Mx']-100)<.01 and abs(state['My']-100)<.01
    assert abs(state['concrete_kN']+sum(b['force_kN'] for b in state['steel'])-Ntarget)<.01
    assert abs(state['concrete_kN']*state['concrete_centroid'][0]/1000+sum(b['force_kN']*b['x']/1000 for b in state['steel'])-100)<.01
    head_states.append(state)
cap['actual_head_N_M_interface']=dict(loadpairs=head_states,
    meaning='Signed concretecompressedsector+eightactualsteelforces reproduce N/Mx/My; this is boundarytraction,NOTcapnodalstrutcapacity.',
    node_qualified=False,
    primary_node_source='https://www.concretecentre.com/TCC/media/TCCMediaLibrary/PDF%20attachments/Lecture-4-Analysis-cg-12-Oct-2017.pdf',
    distinction='0.6nuprimefcd8.976iscrackedSTRUTcontrol;CTTnode0.75nuprimefcd11.22.CorrectcoefficientaloneisNOTstressfieldproof.',
    intrinsic_remaining='Each starter bends its signedverticalforce into a realarm; capcompressionfield/bendbearing/confining transversecage must close thisforcecouple. AverageN/Aisnotnodalcapacity.')
cap['pile_bar_development']=dict(bar='H22',full_yield_straight_required=22/4*(500/1.15)/2.1,
                                  bond_MPa=2.1,poor_bond_eta1=.7,
                                  proposed_horizontal_straight_after_bend=1200,
                                  internal_mandrel=560,centreline_radius=291,
                                  bend_start_heights_above_pilehead_cutoff=[7,57],
                                  horizontal_layers_above_regular_node_bottom=[298,348],
                                  receiver_arms='At least2 actual full-height arms;600wide development zones for1700 from nodecentre, no bar anchored into lowtie alone.',
                                  terminal_routing='Eight starters assigned4peravailablearm with two horizontal layers; actual node-by-node routes/congestion still to verify.',
                                  no_anchorage_acceptance=True)
cap['pile_bar_development']['full_yield_bend_force_kN']=area(22)*(500/1.15)/1000
cap['pile_bar_development']['required_mandrel_at_ab30_mm']=area(22)*(500/1.15)*(1/30+1/44)/17
assert cap['pile_bar_development']['required_mandrel_at_ab30_mm']<560
assert cap['pile_bar_development']['full_yield_straight_required']<1200
cap['pile_bar_development']['rebar_layers_mm_regular_node']=dict(bottom_EW=58,bottom_NS=78,
                                                                 pile_horizontal=[298,348],top_beam=392)
assert 392-348-(10+11)>=20
assert 348-298-22>=20
cap['cage_limit']='Checks cover stated straight/orthogonal projections. Terminal bend routes,arm availability and all eight physical starter routes remain actual 3D detailing debt, not passed by section strength.'

# Actual unsupported slab corners get finite collectors, not relabelled supports.
corner_W_line=(1.35*7.5+1.5*2)*(1.2675+.415)/2+1.35*.2*.05*25
corner_E_line=(1.35*7.5+1.5*2)*1.2675/2+1.35*.2*.05*25
corner_section=rc(200,250,210,2*area(14),25)
corner_W=udl(corner_W_line,1)
corner_E=udl(corner_E_line,1.2175)
collectors=[dict(id='CW',axis_y=3917.5,x_supports=[2917.5,3917.5],section=corner_section,action=corner_W),
            dict(id='CE',axis_y=3917.5,x_supports=[8082.5,9300],section=corner_section,action=corner_E)]
for c in collectors:
    assert c['action']['M']<c['section']['MR'] and c['action']['V']<c['section']['VRdc']
return_reaction=corner_W['V']*1.2675/1.6825+(1.35*.2*.05*25)*1.6825/2
return_sec=rc(200,250,210,2*area(14),25)
return_w=1.35*.2*.05*25
return_L=1.6825;return_P=corner_W['V'];return_a=1.2675
return_RL=return_w*return_L/2+return_P*(return_L-return_a)/return_L
return_M=max(return_RL*x-return_w*x*x/2-return_P*max(0,x-return_a)
             for x in [return_L*i/500 for i in range(501)])
return_links=links(200,210,6,100)
assert return_M<return_sec['MR'] and max(return_RL,return_reaction)<return_links['VRs']
# Actual source-bound stair; scalar2700 and old1100flight are superseded.
sg=had['stairGuard'];tg=sg['treadGeometry']
assert tg['bearingAxesY']==[4332.5,7257.5]
stair_angle=math.radians(tg['pitchDegrees']);stair_span=tg['bearingSpan']/1000
stair_G=.15/math.cos(stair_angle)*25+.1725/2*25+.9
stair_flight=udl(1.35*stair_G+1.5*3,stair_span)
stair_flight_reaction=stair_flight['V']*sg['bodyTerritoryEach']/1000
stair_sec=rc(1000,150,119,area(12)*1000/125,25)
stair_axial=stair_flight['V']*math.sin(stair_angle)
assert stair_flight['M']/stair_sec['MR']+stair_axial*1000/(stair_sec['As']*(500/1.15))<1
assert stair_flight['V']<stair_sec['VRdc']
# The waist depth is NORMAL to the pitch, while span and vertical loading use
# horizontal coordinates. Vertical unit-load work integrates along ds=dx/cosθ:
# both the EI deflection and imposed-normal-curvature displacement need secθ.
stair_secant=1/math.cos(stair_angle)
stair_vertical_phi3=cracked(1000,150,119,stair_sec['As'],stair_G,3,stair_span,3)*stair_secant
stair_vertical_shrink=300e-6/150*(stair_span*1000)**2/8*stair_secant
# Independent dimensionless virtual-work quadrature: M=q*x*(L-x)/2 and
# m=min(x,L-x)/2. This also checks the horizontal limit, without hardcoding
# this stair's numerical deflection or duplicating the cracked-EI calculation.
for angle in [0,stair_angle]:
    n=2000;t=[(i+.5)/n for i in range(n)]
    bending_work=sum(.25*x*(1-x)*min(x,1-x) for x in t)/(n*math.cos(angle))
    curvature_work=sum(.5*min(x,1-x) for x in t)/(n*math.cos(angle))
    assert math.isclose(bending_work,5/(384*math.cos(angle)),rel_tol=1e-6)
    assert math.isclose(curvature_work,1/(8*math.cos(angle)),rel_tol=1e-6)
# Continuous longtrimmer, not independent simply supported reactions summed.
# Three-moment compatibility integrates actualpiecewise tributary widths.
def beam_line(xs,supports,loads):
    n=len(xs);K=[[0.0]*(2*n) for _ in range(2*n)];F=[0.0]*(2*n);els=[]
    for i,(x0,x1,q) in enumerate(zip(xs,xs[1:],loads)):
        L=x1-x0;k=[[12,6*L,-12,6*L],[6*L,4*L*L,-6*L,2*L*L],[-12,-6*L,12,-6*L],[6*L,2*L*L,-6*L,4*L*L]]
        k=[[v/L**3 for v in row] for row in k];f=[-q*L/2,-q*L*L/12,-q*L/2,q*L*L/12];dofs=[2*i,2*i+1,2*i+2,2*i+3]
        for a,ia in enumerate(dofs):
            F[ia]+=f[a]
            for b,ib in enumerate(dofs):K[ia][ib]+=k[a][b]
        els.append((L,k,f,dofs,q))
    fixed=[2*i for i in supports];free=[i for i in range(2*n) if i not in fixed]
    A=[[K[i][j] for j in free]+[F[i]] for i in free]
    for k in range(len(free)):
        pivot=max(range(k,len(free)),key=lambda i:abs(A[i][k]));A[k],A[pivot]=A[pivot],A[k]
        v=A[k][k];assert abs(v)>1e-10
        A[k]=[x/v for x in A[k]]
        for i in range(len(free)):
            if i==k:continue
            v=A[i][k];A[i]=[x-v*y for x,y in zip(A[i],A[k])]
    u=[0.0]*(2*n)
    for i,d in enumerate(free):u[d]=A[i][-1]
    reactions=[sum(K[2*i][j]*u[j] for j in range(2*n))-F[2*i] for i in supports]
    member=[]
    for L,k,f,dofs,q in els:
        end=[sum(k[a][b]*u[dofs[b]] for b in range(4))-f[a] for a in range(4)]
        values=[-end[1]+end[0]*x-q*x*x/2 for x in [L*i/1000 for i in range(1001)]]
        member.append(dict(L=L,q=q,end_forces=end,Mpositive=max(values),Mnegative=min(values),Vmax=max(abs(end[0]),abs(end[2]))))
    assert abs(sum(reactions)-sum(e[0]*e[4] for e in els))<1e-8
    assert abs(sum(R*xs[i] for R,i in zip(reactions,supports))-sum((xs[k]+L/2)*L*q for k,(L,_,_,_,q) in enumerate(els)))<1e-8
    return dict(reactions=reactions,elements=member)
control=beam_line([0,2],[0,1],[8])
assert math.isclose(control['reactions'][0],8) and math.isclose(control['elements'][0]['Mpositive'],4)
long_x=[0,2.925,3.750,4.520];long_width=[.5,.5,.73]
long_cases=[]
for leftQ,rightQ in [(0,0),(1,0),(0,1),(1,1)]:
    loads=[1.35*(7.5*b+.2*.15*25+1)+(1.5*2*b*(leftQ if i==0 else rightQ)) for i,b in enumerate(long_width)]
    c=beam_line(long_x,[0,1,3],loads);c['Qpattern']=[leftQ,rightQ];long_cases.append(c)
long_spans=[dict(M=max(max(abs(e['Mpositive']),abs(e['Mnegative'])) for e in c['elements']),
                 V=max(e['Vmax'] for e in c['elements'])) for c in long_cases]
long_reaction_max=[max(c['reactions'][i] for c in long_cases) for i in range(3)]
landing_L=1.595;landing_G=5.5;landing_Q=3
landing_action=udl(1.35*landing_G+1.5*landing_Q,landing_L)
landing_sec=rc(1000,200,169,area(12)*1000/150,25)
assert landing_action['M']<landing_sec['MR'] and landing_action['V']<landing_sec['VRdc']
mid_L=2.610;mid_w=(1.35*landing_G+1.5*landing_Q)*landing_L/2+1.35*.25*.17*25
mid_points=[(stair_flight_reaction,(sum(sg[k])/2-332.5)/1000) for k in ['lowerFlightX','upperFlightX']]
mid_RL=mid_w*mid_L/2+sum(P*(mid_L-a)/mid_L for P,a in mid_points)
mid_RR=mid_w*mid_L/2+sum(P*a/mid_L for P,a in mid_points)
mid_M=max(mid_RL*x-mid_w*x*x/2-sum(P*max(0,x-a) for P,a in mid_points) for x in [mid_L*i/1000 for i in range(1001)])
mid_sec=rc(250,370,327,2*area(20),25);mid_links=links(250,327,8,125)
assert mid_M<mid_sec['MR'] and max(mid_RL,mid_RR)<min(mid_links['VRs'],mid_links['VRmax'])
mid_post_N=mid_RR+long_reaction_max[1]+1.35*.25*.25*3.55*25
mid_post_Pcr=math.pi**2*.25*E*(250**4/12)/3550**2/1000
mid_post_M=(mid_post_N*.02+long_reaction_max[1]*.025)/(1-mid_post_N/mid_post_Pcr)
mid_post_NR=.6*17*(250**2-4*area(16))/1000
mid_post_sec=rc(250,250,211,2*area(16),25)
assert mid_post_N/mid_post_NR+mid_post_M/mid_post_sec['MR']<1
# Header is supported by outer AND court walls, not by its own hanging trimmer.
header_L=3.585
header_points=[(long_reaction_max[0]+return_reaction,(2917.5-332.5)/1000),
               (stair_flight_reaction,(sum(sg['upperFlightX'])/2-332.5)/1000)]
header_w=1.35*.2*.15*25+(1.35*7.5+1.5*2)*1.085/2
header_RL=header_w*header_L/2+sum(P*(header_L-a)/header_L for P,a in header_points)
header_RR=header_w*header_L/2+sum(P*a/header_L for P,a in header_points)
header_M=max(header_RL*x-header_w*x*x/2-sum(P*max(0,x-a) for P,a in header_points)
             for x in [header_L*i/1000 for i in range(1001)])
header_sec=rc(200,300,259,3*area(16),25)
header_link=links(200,259,8,100)
assert header_M<header_sec['MR']
assert max(header_RL,header_RR)<min(header_link['VRs'],header_link['VRmax'])
frame=dict(corner_collectors=collectors,
           west_return=dict(axis_x=2917.5,y_supports=[2650,4332.5],point_from_CW=corner_W['V'],north_reaction=return_reaction,
                            section=return_sec,M=return_M,reactions=[return_RL,return_reaction],links=return_links),
           long_trimmer=dict(axis_x=2917.5,y_supports=[4332.5,7257.5,8852.5],spans=long_spans,continuous_cases=long_cases,reaction_envelope=long_reaction_max,load_break_y=8082.5,top_steel='2H10 continuous;negativeMchecked',section=rc(200,350,310,2*area(16),25),links=links(200,310,6,100)),
           stair_header=dict(axis_y=4332.5,x_supports=[332.5,3917.5],points=header_points,
                             M=header_M,reactions=[header_RL,header_RR],section=header_sec,links=header_link,
                             footprint=[262.5,4232.5,3725,200],
                             top=3370,bottom=3070,finished_soffit=3055,
                             west_window_arch_rewind=dict(centre_y=4600,from_spring=2550,to_spring=2450,from_crown=2850,to_crown=2750,
                                                           ring=215,actual_patch=[4232.5,4432.5],seat=3060,min_reserve=113.157316509265)),
           stair=dict(risers=20,rise=172.5,going=300,pitch_degrees=tg['pitchDegrees'],
                      bearing_axes_y=tg['bearingAxesY'],bearing_span=stair_span*1000,
                      landing_depth=sg['midlandingDepth'],flight_body_width=sg['bodyTerritoryEach'],
                      between_rails=sg['handrail']['betweenRails'],after20_position_loss=sg['handrail']['after20Loss'],
                      waist=150,waist_normal=True,waist_section=stair_sec,
                      steel='H12/125 main eachface;H10/150 distribution',
                      G=stair_G,Q=3,flight_action=stair_flight,flight_end_reaction=stair_flight_reaction,
                      axial_sensitivity=stair_axial,main_nose_levels=[0,1725,3450],
                      upper_floor80_not_added_to_final_riser=True,
                      vertical_displacement_basis='Normal150waist;verticalunit-loadwork ds=dx/cos(pitch), bothtermsinclude sec(pitch).',
                      vertical_projection_factor=stair_secant,
                      fully_cracked_phi3_mm=stair_vertical_phi3,
                      differential_shrinkage_300microstrain_mm=stair_vertical_shrink,
                      combined_vertical_sensitivity_mm=stair_vertical_phi3+stair_vertical_shrink,
                      L250_comparator=stair_span*1000/250,
                      midlanding_slab=dict(top=1725,bottom=1525,NSsupport_axes=[7257.5,8852.5],
                                          full_north_seat=[8782.5,8922.5],section=landing_sec,action=landing_action,
                                          actual_northwall_bearing_admission=False),
                      midlanding_beam=dict(footprint=[262.5,7132.5,2805,250],support_axes_x=[332.5,2942.5],
                                          top=1725,bottom=1355,normal_waist_soffit_last_lower=1552.5-150/math.cos(stair_angle),
                                          section=mid_sec,links=mid_links,point_loads=mid_points,udl=mid_w,M=mid_M,reactions=[mid_RL,mid_RR],
                                          steel='2H20bottom/2H10top;H8/125',
                                          west_RC_sill_receiver=[262.5,6200,140,2100],receiver_top=1725,receiver_bottom=1355,
                                          west_RC_pier=[262.5,7007.5,140,500],
                                          window_sill=1750,frame_bearing_joint_height=25,
                                          actual_joint_cage_anchorage_qualified=False),
                      midlanding_post_core=[2817.5,7132.5,250,250],post_end=3370,
                      post_section=dict(steel='4H16/H6/100',N=mid_post_N,M=mid_post_M,Pcr=mid_post_Pcr,NR=mid_post_NR,MR=mid_post_sec['MR'],
                                        actual_RC_joint_cage_qualified=False),
                      ground_toe_support=dict(control_RC_top=-180,new_MAT_thermal_level_unjoined=True),
                      guard_load_and_anchor_capacity_qualified=False,
                      actual_midlanding_EWbeam_and_post_design_pending=True),
           NE_return=dict(original_endpoint=7750,required_endpoint=7552.5,overlap_core=[7552.5,7692.5],
                          reason='Full140 material junction to loggia core; source rewind required, no57.5void.'))
for a in long_spans:
    assert a['M']<min(frame['long_trimmer']['section']['MR'],rc(200,350,314,2*area(10),25)['MR'])
    assert a['V']<frame['long_trimmer']['links']['VRs']

floor_reactions=[]
for f in floor:
    x1,y1,x2,y2=f['rectangle'];L=f['axis_span']/1000
    endpoints=[([x1,y1,x2,y1],[x1,y2,x2,y2])] if f['direction']=='NS' else [([x1,y1,x1,y2],[x2,y1,x2,y2])]
    for pair in endpoints:
        for e in pair:floor_reactions.append(dict(field=f['id'],support_segment=e,G_per_m=f['G']*L/2,Q_per_m=f['Q']*L/2,
                                                 ULS_per_m=(1.35*f['G']+1.5*f['Q'])*L/2))
for i,a in enumerate(floor):
    ax,ay,bx,by=a['rectangle']
    for b in floor[:i]:
        cx,cy,dx,dy=b['rectangle'];assert max(0,min(bx,dx)-max(ax,cx))*max(0,min(by,dy)-max(ay,cy))==0
wet_collected=sum(r['G_per_m'] for r in floor_reactions if r['field'] in ['NW-W','NW-E'] and r['support_segment'][0]==r['support_segment'][2]==2902.5)
assert math.isclose(wet_collected,7.5*wet_trib)
frame['floor_reaction_inventory']=dict(reactions=floor_reactions,axis_fields_nonoverlapping=True,
    NW_resolution='TwoEWfields2570/1475physicallyendatwetbeam;theirfloorloadisNOTalsosummedontorearW/outerN.',
    limits='Supportaxisrectanglesomitwallwidth/cantileverbands,entrancebridgeandactualports;fullslabphysicalmass/edge/supportopeningadmissionstillrequired.')
frame['actual_ground_receivers']=[dict(id='stair-midpost',xy=[2942.5,7257.5],N=mid_post_N,M=mid_post_M),
                                    dict(id='stair-mid-W',xy=[332.5,7257.5],vertical_ULS=mid_RL),
                                    dict(id='header-W',xy=[332.5,4332.5],vertical_ULS=header_RL),
                                    dict(id='header-E',xy=[3917.5,4332.5],vertical_ULS=header_RR)]
frame['frozen_node_submodel']=dict(review_input='bee433780a6a72e2a352ec6b913a9c51c93c486b',
    meaning='Nodefunctions/parametersunchangedawaitspecialist;actualstairreceivercoordinatesandloadsaboverequirebinding,notimplicitN850admission.')

# A finite conventional westreceiver: RC140window-sill beam, not a wider
#column obstructing the stair. Its two deliberate masonry bearing patches and
#two-strut/continuous-H12tie transfer are explicit and material-strength bounded.
sill_G=.14*.37*25+1.0 # includes authored1kN/m window/frame dead-loadbudget.
sill_N=mid_RL+1.35*sill_G*2.1+1.35*.14*.7*1.535*20
sill_e=20;sill_bearing_area=2*140*275
sill_max_bearing=sill_N*1000/sill_bearing_area*(1+6*sill_e/140)
sill_H=mid_RL/2*200/(1680-1436)
sill_strut=math.hypot(mid_RL/2,sill_H)
assert sill_H<area(12)*(500/1.15)/1000
assert sill_strut*1000/(140*150)<.528*17
sill=dict(concrete=[262.5,6200,140,2100],top=1725,bottom=1355,
          two_NS_bearing_patches=[[6920,7195],[7320,7595]],masonry_territory=[262.5,6907.5,140,700],
          vertical_load=mid_RL,total_with_sill_window_wall=sill_N,window_G_budget_per_m=1,
          minimum_eccentricity=sill_e,required_simple_bearing_fd=sill_max_bearing,
          masonry_modulus_second_order_admission=False,
          strut_nodes_relative_to_7257p5=[[-200,1436],[0,1680],[200,1436]],
          strut_force=sill_strut,strut_area=140*150,strut_stress=sill_strut*1000/(140*150),
          continuous_bottom_tie=dict(bar='H12',x=350,z=1436,y=[6557.5,7957.5],demand=sill_H,
                                     capacity=area(12)*(500/1.15)/1000,straight_beyond_each_node=500,full_fyd_lbrqd=12/4*(500/1.15)/3),
          cantilever_top='2H10continuousNSx310.5/354.5,z1650,y6225..8275;fullpoorbonddevelopmentbeyond700masonrysupport',
          full_ground_moment_from_32p5axis_offset=sill_N*(.020+.0325),
          geometry_and_force_path_only=True)
# ALL enumerated barpaths, including corner-column bars andlinkplanes. East
#downhooks; westH20turnshorizontallyoppositeNSinsidetheactualsillreceiver.
mid_e=[];mid_w=[]
for i,y in enumerate([85,165]):
    R=220;start=185-R
    points=[(-200,y,1398),(start,y,1398)]
    points += [(start+R*math.sin(math.radians(t)),y,1398-R*(1-math.cos(math.radians(t)))) for t in range(2,91,2)]
    points.append((185,y,428));mid_e.append(dict(id='EB'+str(i+1),dia=20,points=points))
    direction=-1 if i==0 else 1
    start=310.5+R;global_y=7132.5+y
    points=[(700,global_y,1398),(start,global_y,1398)]
    points += [(start-R*math.sin(math.radians(t)),global_y+direction*R*(1-math.cos(math.radians(t))),1398) for t in range(2,91,2)]
    points.append((310.5,global_y+direction*(R+750),1398));mid_w.append(dict(id='WB'+str(i+1),dia=20,points=points))
for i,y in enumerate([85,165]):
    R=95;start=185-R
    points=[(-200,y,1687),(start,y,1687)]
    points += [(start+R*math.sin(math.radians(t)),y,1687-R*(1-math.cos(math.radians(t)))) for t in range(2,91,2)]
    points.append((185,y,1482));mid_e.append(dict(id='ET'+str(i+1),dia=10,points=points))
    direction=-1 if i==0 else 1;start=310.5+R;global_y=7132.5+y
    points=[(700,global_y,1687),(start,global_y,1687)]
    points += [(start-R*math.sin(math.radians(t)),global_y+direction*R*(1-math.cos(math.radians(t))),1687) for t in range(2,91,2)]
    points.append((310.5,global_y+direction*(R+550),1687));mid_w.append(dict(id='WT'+str(i+1),dia=10,points=points))
mid_column=[dict(id='PC'+str(i),dia=16,points=[(x,y,-180),(x,y,3345)]) for i,(x,y) in enumerate([(39,39),(39,211),(211,39),(211,211)])]
post_link_z=[z for z in range(-150,3251,100) if z!=3050]+[3010,3110,3290]
mid_column += [dict(id='PL'+str(z),dia=6,points=[(28,28,z),(222,28,z),(222,222,z),(28,222,z),(28,28,z)]) for z in post_link_z]
mid_e_clear=[dict(a=a['id'],b=b['id'],clear=path_clear(a,b)) for i,a in enumerate(mid_e) for b in mid_e[:i]+mid_column]
assert min(c['clear'] for c in mid_e_clear)>=21
sill_fixed=[dict(id='SILLtie',dia=12,points=[(350,6557.5,1436),(350,7957.5,1436)])]
sill_fixed += [dict(id='SILLtop'+str(x),dia=10,points=[(x,6225,1650),(x,8275,1650)]) for x in [310.5,354.5]]
mid_w_clear=[dict(a=a['id'],b=b['id'],clear=path_clear(a,b)) for i,a in enumerate(mid_w) for b in mid_w[:i]+sill_fixed]
assert min(c['clear'] for c in mid_w_clear)>=21
mid_bend20=area(20)*(500/1.15)*(1/40+1/40)/17
assert mid_bend20<420 and 20/4*(500/1.15)/3<750
assert 10/4*(500/1.15)/2.1<550
sill_hoops=[dict(id='SH'+str(y),dia=6,points=[(290.5,y,1383),(374.5,y,1383),(374.5,y,1697),(290.5,y,1697),(290.5,y,1383)])
             for y in [6250,6450,6650,6850,7050,7100,7257.5,7415,7500,7700,7900,8100,8250]]
sill_hoop_clear=[dict(a=a['id'],b=b['id'],clear=path_clear(a,b)) for a in mid_w+sill_fixed for b in sill_hoops]
# Ownlongitudinalbarsinsideownstirrupsdonotneedaggregateclearspacing; nointerpenetration.
assert min(c['clear'] for c in sill_hoop_clear)>=0
assert max(b-a for a,b in zip([h['points'][0][1] for h in sill_hoops],[h['points'][0][1] for h in sill_hoops][1:]))<=200
sill['actual_H6_hoops']=sill_hoops;sill['own_hoop_physical_min']=min(c['clear'] for c in sill_hoop_clear)
sill['stirrup_capacity']=links(140,289,6,200)
sill['top_cantilever_M']=1.35*sill_G*.8075**2/2
sill['top_cantilever_capacity']=rc(140,370,295,2*area(10),25)['MR']
assert sill['top_cantilever_M']<sill['top_cantilever_capacity']
# Central-pointplacementmaximisespositive simple-span deflection: this is a
#declaredupperboundforthetwoactualflightpointloads, notanUDLsubstitution.
def beam_SLS_bound(Gw,Qw,GP,QP,L,section,phi=3):
    answer=0
    for q,P,creep in [(Gw,GP,phi),(Qw,QP,0)]:
        Ec=E/(1+creep);n=200000/Ec;b=section['b'];d=section['d'];As=section['As']
        x=(-n*As+math.sqrt((n*As)**2+2*b*n*As*d))/b
        I=b*x**3/3+n*As*(d-x)**2
        answer+=5*q*(L*1000)**4/(384*Ec*I)+P*1000*(L*1000)**3/(48*Ec*I)
    return answer
mid_delta=beam_SLS_bound(landing_G*landing_L/2+.25*.17*25,landing_Q*landing_L/2,
                         2*stair_G*stair_span/2*1.094,2*3*stair_span/2*1.094,mid_L,mid_sec)
frame['stair']['midlanding_beam']['fully_cracked_phi3_central_point_bound_mm']=mid_delta
frame['stair']['midlanding_beam']['shrinkage300microstrain_mm']=300e-6/370*(mid_L*1000)**2/8
frame['stair']['midlanding_beam']['L250_comparator_mm']=mid_L*1000/250
assert mid_delta+300e-6/370*(mid_L*1000)**2/8<mid_L*1000/250
frame['stair']['west_receiver']=sill
frame['stair']['midlanding_beam']['west_RC_pier']=None
frame['stair']['midlanding_beam']['joint_paths']=dict(east=mid_e,west=mid_w,column_cage=mid_column,sill_fixed=sill_fixed,sill_hoops=sill_hoops,midbeam_stirrup_stations_x=list(range(600,2726,125)),
    east_min_clear=min(c['clear'] for c in mid_e_clear),west_min_clear=min(c['clear'] for c in mid_w_clear),
    east_critical=sorted(mid_e_clear,key=lambda c:c['clear'])[:5],west_critical=sorted(mid_w_clear,key=lambda c:c['clear'])[:5],
    H20_full_fyd_mandrel_required=mid_bend20,H20_selected_mandrel=420,H20_after_curve=750,
    H10_selected_mandrel=180,H10_after_curve_east=110,H10_after_curve_west=550,
    scope='Mainhooks/columncage/sillhoopstakenin3D;midbeamhoops600..2725onlystraightentry,maximumendgap198<.75d. Uppertrimmer/waistcagethroughpost,windowframebedandmasonrybearingstillunearned.Noentirejointrelease.')
frame['actual_ground_receivers'].append(dict(id='stair-west-masonry',xy=[332.5,7257.5],N=sill_N,M=sill_N*.02,
                                           grid_axis=[300,7257.5],grid_moment=sill['full_ground_moment_from_32p5axis_offset']))
assert frame['stair']['fully_cracked_phi3_mm']+frame['stair']['differential_shrinkage_300microstrain_mm']<frame['stair']['L250_comparator']

# Wet-beam RC piers: conditional second-order screen with no favourable masonry
# stiffness. Pinned3200,0.25EcIg, minimum20 eccentricity, no primary lateral role.
pier_N=wet_action['V']+1.35*.26*.45*3.2*25
pier_I=450*260**3/12
pier_Pcr=math.pi**2*(E*.25)*pier_I/3200**2/1000
pier_amp=1/(1-pier_N/pier_Pcr)
pier_M=pier_N*.02*pier_amp
pier_sec=rc(450,260,221,2*area(16),25)
pier_NR=.6*17*(260*450-4*area(16))/1000
wet['receiving_pier_check']=dict(core=[260,450],height=3200,steel='4H16;H6/100 closed links',
                              N=pier_N,Pcr=pier_Pcr,EI_fraction=.25,amplification=pier_amp,
                              e0=20,M=pier_M,NR_screen=pier_NR,MR_screen=pier_sec['MR'],
                              linear_interaction=pier_N/pier_NR+pier_M/pier_sec['MR'],
                              limit='No unbalanced arch thrust/wind accepted; ties must close actual springing forces locally.')
assert wet['receiving_pier_check']['linear_interaction']<1

# Support-node locations are physical plan rectangles. Weather beams share one
#600wide body; low axial ties cross OPEN ground loggia instead of a raised beam
# intersecting its sloping deck.
ground_routes=[
 ('outer-W',(300,300),(300,11700),600),('outer-E',(11700,300),(11700,11700),600),
 ('outer-S',(300,300),(11700,300),600),
 ('outer-N-W',(300,11700),(4500,11700),600),('outer-N-E',(7500,11700),(11700,11700),600),
 ('loggia-W',(4500,8050),(4500,11700),600),('loggia-E',(7500,8050),(7500,11700),600),
 ('rear-W',(300,8852.5),(4500,8852.5),250),
 ('wet-wall-node-line',(2902.5,8852.5),(2902.5,11667.5),250),
 ('stair-post-node-line',(2942.5,4332.5),(2942.5,8852.5),250),
 ('stair-header-line',(300,4332.5),(3950,4332.5),250),
 ('court-W',(3950,3950),(3950,8050),600),('court-E',(8050,3950),(8050,8050),600),
 ('court-S',(3950,3950),(8050,3950),600),
 ('court-N-W',(3950,8050),(4500,8050),600),('court-N-E',(7500,8050),(8050,8050),600),
 ('spine',(9300,300),(9300,8290),250),('rear-E',(7500,8290),(11700,8290),250),
]
# Every retained actual lower core gets a ground route, not just the attractive
# north study. Planning ends0/12000 meet the actual perimeter support axes.
ground_routes=[(ident,a,b,600) for ident,a,b,width in ground_routes]
for w in had['groundWalls']:
    if w['id'].startswith('loggia-'):continue
    a=tuple(max(332.5,min(11667.5,v)) for v in w['a'])
    b=tuple(max(332.5,min(11667.5,v)) for v in w['b'])
    if a==b:continue
    vertical_wall=a[0]==b[0]
    covered=False
    for ident,c,d,width in ground_routes:
        if vertical_wall and c[0]==d[0]==a[0] and min(c[1],d[1])<=min(a[1],b[1]) and max(c[1],d[1])>=max(a[1],b[1]):covered=True
        if not vertical_wall and c[1]==d[1]==a[1] and min(c[0],d[0])<=min(a[0],b[0]) and max(c[0],d[0])>=max(a[0],b[0]):covered=True
    if not covered:ground_routes.append(('actual-'+w['id'],a,b,600))
cap_nodes={}
for ident,a,b,width in ground_routes:
    length=math.dist(a,b);cuts=max(1,math.ceil(length/3000))
    for i in range(cuts+1):
        p=tuple(a[k]+(b[k]-a[k])*i/cuts for k in range(2))
        cap_nodes[p]=dict(xy=p,source=ident,point_ULS=0)
# Literal orthogonal intersections are nodes, not an invisible beam/pile event.
for i,(ia,a,b,wa) in enumerate(ground_routes):
    for ib,c,d,wb in ground_routes[i+1:]:
        if a[0]==b[0] and c[1]==d[1]:
            p=(a[0],c[1])
            if min(a[1],b[1])<=p[1]<=max(a[1],b[1]) and min(c[0],d[0])<=p[0]<=max(c[0],d[0]):cap_nodes[p]=dict(xy=p,source=ia+' x '+ib,point_ULS=0)
        elif a[1]==b[1] and c[0]==d[0]:
            p=(c[0],a[1])
            if min(c[1],d[1])<=p[1]<=max(c[1],d[1]) and min(a[0],b[0])<=p[0]<=max(a[0],b[0]):cap_nodes[p]=dict(xy=p,source=ia+' x '+ib,point_ULS=0)
for s in special_nodes:
    p=tuple(s['xy']);cap_nodes[p]=dict(xy=p,source=s['id'],point_ULS=s['point_ULS'])
# Merge coincident/nearby mandatory/intersection nodes so400pileheads never overlap.
merged={}
for p,node in sorted(cap_nodes.items(),key=lambda item:-item[1]['point_ULS']):
    near=next((q for q in merged if math.dist(p,q)<500),None)
    if near is None:merged[p]=node
    else:
        merged[near]['point_ULS']+=node['point_ULS']
        merged[near].setdefault('connected_nearby_axes',[]).append(p)
cap_nodes=merged
for p,node in cap_nodes.items():
    x,y=p
    exterior=isinstance(y,(int,float)) and y>=7750 and (4050<=x<=4950 or 7050<=x<=7950)
    local_deck_top=-180-max(0,min(y,12000)-7750)*.01 if exterior else -180
    node.update(cap_size=[600,600],top=-180,bottom=-630,
                outside_deck_notch_25=False,
                role='Integral continuous-grid node; all600weatherbeam edges remainoutside independentdeck.')
grid['actual_routes']=ground_routes
grid['actual_cap_nodes']=list(cap_nodes.values())
grid['width_reason']='Uniform600 prototype permits two actual8starter references. All othernodearmroutesstillrequireliteralassignment; no hidden850developmentinto250orlowties. Thisisamaterial/cost/thermalprice,notoptimisedsitefoundation.'
deck_q=1.35*7.5+1.5*2
deck_line_reaction=deck_q*4.25/2 # includes both300 exterior panel overhangs.
deck_total_reaction=deck_line_reaction*2.35
low_own=1.35*.6*.2*25
low_M=deck_total_reaction*(3/4-2.35/8)+low_own*3**2/8
low_V=(deck_total_reaction+low_own*3)/2
low_sec=rc(600,200,140,3*area(20),40)
low_link=links(600,140,8,100)
low_link['VRs']*=2;low_link['provided_ratio']*=2
low_axial=100
low_required_As=low_M*1e6/(low_sec['z']*(500/1.15))+low_axial*1000/(2*(500/1.15))
assert low_required_As<low_sec['As']
assert low_V<min(low_link['VRs'],low_link['VRmax'])
grid['low_loggia_ties']=[dict(y=y,x_supports=[4500,7500],top=-550,bottom=-750,
                                  section=low_sec,steel='3H20 TOP+BOTTOM;4legH8/100',links=low_link,
                                  axial_action_ceiling=100,gravity_wall_load=0,
                                  outdoor_deck_line_reaction=deck_line_reaction,
                                  loaded_width=2350,loaded_x=[4825,7175],M=low_M,V=low_V,
                                  As_combined_axial_flexure=low_required_As,
                                  deck_bearing='Finite100NS wide RC bearing rail on beam,top follows actualslabunderside;Cu liner carriesNO floor reaction.',
                                  depressed_soffit_lowest=-522.5,minimum_height_to_depressed_soffit=27.5)
                               for y in [8050,11700]]
for node in grid['actual_cap_nodes']:
    if min(math.dist(node['xy'],[x,y]) for x in [4500,7500] for y in [8050,11700])<500:
        node['bottom']=-750;node['local_depth']=570
        node['role']+=' Local lowtie receiver extends to-750; barlayer/headclearance remains explicit.'
assert all(n['point_ULS']<=200 for n in cap_nodes.values())
assert 4*grid_action['V']+100+low_V<cap_N

# Two literal joined reference nodes: the outerSW regular450 node and
# loggiaNW lowreceiver570. All8starters have named routes into ACTUAL twoarms;
# no arm is invented at another node merely because this reference works.
starter_options=[0,0,2,2,1,0,2,3]
starter_paths=[]
for i,opt in enumerate(starter_options):
    direction,plane=[('E',-332),('E',-282),('N',-332),('N',-282)][opt]
    x,y=cap['pile_vertical_bar_centres'][i];z0=plane-291
    points=[(x,y,-1000),(x,y,z0)]
    for t in range(2,91,2):
        a=math.radians(t);r=291*(1-math.cos(a));z=z0+291*math.sin(a)
        points.append((x+r if direction=='E' else x,y+r if direction=='N' else y,z))
    p=points[-1];points.append((p[0]+(1200 if direction=='E' else 0),p[1]+(1200 if direction=='N' else 0),p[2]))
    starter_paths.append(dict(id='P'+str(i+1),dia=22,points=points,direction=direction,
                              horizontal_plane=plane,bend_start=z0,internal_mandrel=560,
                              straight_after_bend=1200))
starter_pairs=[dict(a=a['id'],b=b['id'],clear=path_clear(a,b))
               for i,a in enumerate(starter_paths) for b in starter_paths[:i]]
assert min(c['clear'] for c in starter_pairs)>=22
assert min(c['clear'] for c in starter_pairs)+22>=60 # actualcentreclearance>=2ab30
profiles=[]
for ident,xy,base,rotation,arms in [
 ('SW-regular',[300,300],-630,0,[('outer-S','E',11700),('outer-W','N',11700)]),
 ('loggia-NW-lowreceiver',[4500,11700],-750,180,[('outer-N-W','W',4200),('loggia-W','S',3650)])]:
    assert any(math.dist(n['xy'],xy)<.01 for n in grid['actual_cap_nodes'])
    # Literal path in globalordinates; 180rotation preserves all actual barangles.
    sign=1 if rotation==0 else -1
    paths=[]
    for a in starter_paths:
        d=a['direction'] if sign==1 else {'E':'W','N':'S'}[a['direction']]
        arm=next(k for k in arms if k[1]==d)
        assert any(r[0]==arm[0] for r in ground_routes)
        points=[(xy[0]+sign*(x-300),xy[1]+sign*(y-300),z) for x,y,z in a['points']]
        # The1700developmentreceiver stays in a real600wide fullheight arm.
        assert arm[2]>=1700
        assert max(abs((p[0]-xy[0]) if d in ['E','W'] else (p[1]-xy[1])) for p in points)<1700
        b=dict(a,points=points,actual_direction=d,arm=arm[0],arm_available=arm[2])
        paths.append(b)
    # Compare ALLcurvedreturns against the two realnode bottommats and armtopbars.
    fixed=[]
    for q in [60,110,300,490,540]:
        fixed += [dict(id='bottomEW'+str(q),dia=20,points=[(-300,q,-572),(2050,q,-572)]),
                  dict(id='bottomNS'+str(q),dia=20,points=[(q,-300,-552),(q,2050,-552)])]
    for q in [60,300,540]:
        fixed += [dict(id='armtopE'+str(q),dia=20,points=[(0,q,-238),(2050,q,-238)]),
                  dict(id='armtopN'+str(q),dia=20,points=[(q,0,-238),(q,2050,-238)])]
    for station in range(650,2051,100):
        fixed += [dict(id='EL'+str(station),dia=8,points=[(station,44,-586),(station,556,-586),(station,556,-224),(station,44,-224),(station,44,-586)]),
                  dict(id='NL'+str(station),dia=8,points=[(44,station,-586),(556,station,-586),(556,station,-224),(44,station,-224),(44,station,-586)])]
    clearance=[dict(a=a['id'],b=b['id'],clear=path_clear(a,b)) for a in starter_paths for b in fixed]
    assert min(c['clear'] for c in clearance)>=22
    profiles.append(dict(id=ident,xy=xy,top=-180,bottom=base,pile_cutoff=base,
                         node_bottom_mats=[-572,-552],local_lowtie_steel=([-692,-608] if base==-750 else None),lowtie_anchorage_qualified=False,normal_arm_bottom=-630,
                         arm_top_steel=-238,pile_bend_starts=[-623,-573],pile_horizontal_planes=[-332,-282],
                         above_cutoff_bend_starts=[-623-base,-573-base],
                         actual_arms=arms,starters=paths,all8pair_minimum=min(c['clear'] for c in starter_pairs),
                         fixed_cage_minimum=min(c['clear'] for c in clearance),
                         critical_fixed=sorted(clearance,key=lambda c:c['clear'])[:10],
                         transverse_cage_limit='Armclosedlinksstart650fromnodeorigin;nodeinteriortransverseconfinement/STMstilltodesign.Nobodyclaimedall57nodesdetailed.'))
cap['named_starter_profiles']=profiles
cap['pile_bar_development'].update(bend_start_absolute=[-623,-573],horizontal_absolute=[-332,-282],
   horizontal_layers_above_regular_node_bottom=[298,348],
   bend_start_heights_above_pilehead_cutoff=[7,57],
   terminal_routing='8namedroutesintorealE/NarmsatSWregularandrotatedW/SarmsatloggiaNW570;allothernodesremainunassigned.',
   no_anchorage_acceptance=True)
cap['cage_limit']='Twoactual450/570profilesclose8starterrouteandbarclearancegeometry;othernodearms,lowtieanchorageandnodeinteriortransverseconfinement/N-Mstruttransferremainintrinsicdesignwork.'
# E02 service port geometric envelope only; actual circular compression ring and
# springing ties are the next calculation, never replaced by the ideal ratio.
port=dict(wall='plant-north',axis_y=6500,centre_x=10800,clear_width=320,
          spring=2740,rise=160,intrados_crown=2900,radial_ring=215,
          extrados_crown=3115,upper_slab_soffit=3170,vertical_remainder=55,
          outside_ring_x=[10425,11175],east_abutment_territory=407.5,
          permitted_assembly_OD=160,annular_geometric_clearance=80,capacity=None)

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
            lower_grid=grid,cap=cap,special_ground_nodes=special_nodes,finite_floor_frame=frame,E02_service_port=port,
            node_review_known_gaps=['Onlyenumeratedcageclearances;4leginnerlink/H12sidebarsmissing,coincidentEW/NStoprows,terminalmaintiedevelopmentandN-Mstrutfieldunearned.Specialistownsnextnodecorrection.'],
            fire_field_comparator=dict(thickness=200,outer_main_axis=31,reference_hs=60,reference_a=10,
                                       route='TCC linked2018StructuralFireDesign SlabsTable5 firstgeneration one-wayREI30 comparator ONLY',
                                       source='https://www.concretecentre.com/TCC/media/TCCMediaLibrary/Events/Online%20course/CCIP_HowToComp_Feb18.pdf',
                                       rating_qualified=False,holds='Current edition/UKNA,fireactions,supports,spalling,actualports/edges/seals'),
            retained_open_items=[
                'HAD finishedFaces/t corrected at owning source; actual cabinet/lining fit remains to reconcile.',
                'Actual2925stairs/midlandingmemberreactionsnowcalculated;physicaljoints/guards,entrancebridge,tiedarchesandroofremain.',
                'Rear/east/transient WC ports must bind the complete services inventory, not the three-bore witness.',
                'Wet receivers260x450 andnorthsupport11512.5: actual door/window/spatial readback required.',
                'Wetjoint3H16downhooks/4H16pier: finite3Dclearance/development calculated; lowercolumnjoint remains.',
                'NodeFROZENbee43378: omittedinnerlinks/H12sidebars andcoincidenttoprows requireAstraredesign;no cage/nodePASS.',
                'Revised240glass+40lining→2890soffit requires actual arch/head/thermal coordination; anchorsunfinished.',
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
txt(16,24,'HAD0b2f7d48 · RC200 whole upper floor · unadopted / incomplete support design, not for construction')
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
txt(304,47,'Removed lower reading wall → upper140 masonry → real RC200×350 beam.')
txt(304,55,'3H16 bottom,2H10 top,H6/100; total350, z3020–3370; lined soffit3005, NO doorway upstand.')
txt(304,63,f"G{wet_G:.3f}/Q{wet_Q:.3f} kN/m; M{wet_action['M']:.2f}/MR{wet_section['MR']:.2f}; V{wet_action['V']:.2f}/VRs{wet_links['VRs']:.2f}.")
box(320,88,140,10,'#aebeba')
box(320,78,140,10,'#aebeba')
box(320,68,140,10,'#aebeba')
box(320,98,10,40,'#aebeba');box(450,98,10,40,'#aebeba')
txt(320,148,'Diagrammatic elevation; support2660+155overhang and pier footprints in JSON.')
txt(304,159,'South RC260×450 pier: x2772.5–3032.5, y8627.5–9077.5.')
txt(304,167,'Actual450downhooks+600tails; full-yieldbend/bond and3Dbarclearance checked.')
txt(304,175,'HAD27finishx2745.5–3059.5; new700northwindowstarts3350; actualbodytasknotpassed.')

txt(304,196,'C / GROUND GRID TARGET, NOT SITE ACCEPTANCE','title')
txt(304,207,'RC600×450 both leaves;40cover;3H20 top/bottom+sideH12;4legH8/100;actual point nodes.')
txt(304,215,f"M{grid_action['M']:.2f}/MR{grid_section['MR']:.2f}; V{grid_action['V']:.2f}/VRs{grid_links['VRs']:.2f}.")
txt(304,223,'Top−180/bottom−630;integral600×600×450 node/400pilehead;5H20eachdirectioncontinue750.')
txt(304,231,f"Node envelopeN{cap_N:g}/M100;tie{cap_tie:.1f}kN vssteel{cap['tie_resistance_kN']:.1f};pile/soilUNKNOWN.")
txt(304,239,'Lowtie/localnode−750 controlsD1300:750+H300+loss50+vent150=1250;50surplus.')
txt(304,247,'Masonry DPC ABOVE grid −180..−30 is a deliberate hypothesis; concrete/floor moisture route unqualified.')
txt(304,255,'No900cap/deckoverlap. Drainedtrayroute required;225clearcavity isNOTclaimed overwidebeam.')

txt(304,280,'D / E02 SERVICE ARCH GEOMETRY ONLY','title')
txt(304,291,'Plant-north y6500, x10800;320clear semicircle, spring2740/rise160/ring215.')
txt(304,299,'Extrados3115 leaves55 to slabsoffit3170;407.5 east abutment territory is NOT capacity.')
txt(304,307,'Actual pipe/socket,bends, ties, ring actions and downstream high-level branch still to join.')
txt(16,350,'WORK STILL TO DO','title')
for i,t in enumerate(result['retained_open_items']):txt(16,361+i*6,t)
txt(16,410,'REPRODUCIBLE CONDITIONAL DESIGN / calculations, exact source pins and adverse controls accompany every resistance. No programme completion claimed.')
parts.append('</svg>\n')
main_svg='\n'.join(parts)
parts=['<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297">',
       '<style>text{font-family:DejaVu Sans,sans-serif;fill:#243a44;font-size:3.1px}.title{font-size:4.6px;font-weight:bold}</style>',
       '<rect width="420" height="297" fill="#faf8f1"/>']
txt(14,14,'OPEN N / eight actual starter routes and signed head actions','title')
txt(14,23,'Two finite references: SWregular450(E/Narms) andloggiaNW570(W/Sarms); othernodeassignmentsstillintrinsicdesignwork')
txt(14,36,'A / ALL8ROUTES AT SW · 1:10','title')
nx=lambda x:15+x/10
ny=lambda y:247-y/10
box(nx(0),ny(2050),600/10,2050/10,'#e5ebe7')
box(nx(600),ny(600),1450/10,600/10,'#e5ebe7')
box(nx(0),ny(600),60,60,'#c5cfca')
parts.append(f'<circle cx="{nx(300)}" cy="{ny(300)}" r="20" fill="none" stroke="#557f90" stroke-width=".5"/>')
for a in starter_paths:
    d='M'+' L'.join(f'{nx(x):.3f},{ny(y):.3f}' for x,y,z in a['points'])
    colour='#a34f4d' if a['horizontal_plane']==-332 else '#b4753c'
    parts.append(f'<path d="{d}" fill="none" stroke="{colour}" stroke-width="1.1"/>')
    x,y,z=a['points'][0];txt(nx(x)+1,ny(y)-1,a['id'])
txt(14,250,'E: P1/P2/P5/P6→actualouter-S; N:P3/P4/P7/P8→outer-W.')
txt(14,258,'LoggiaNW rotates180: W→outer-N-W; S→loggia-W.')
txt(14,266,'Botharms600wide/full450deep;1700developmentterritory.')
txt(225,36,'B / ABSOLUTE z / ONE DATUM','title')
for i,line in enumerate(['ORDINATE              REGULAR450     LOW570',
                        'NodeTOP                    −180            −180',
                        'NodeBASE / pilecutoff      −630            −750',
                        'PrincipalEW/NSmats     −572/−552       −572/−552',
                        'BendSTARTS             −623/−573       −623/−573',
                        'H22horizontalplanes    −332/−282       −332/−282',
                        'NormalARMbottom           −630            −630',
                        'ArmTOPsteel               −238            −238']):txt(225,47+i*8,line)
txt(225,121,'H22internal560 / R291;1200straight vs1139POORbond.')
txt(225,129,f"Eightstarterpairclear≥{min(c['clear'] for c in starter_pairs):.2f}; fixedcagesandbendscheckedatdeclared22mmclear.")
txt(225,137,'Curvedreturnscheckedin3D; nodeinteriorconfinementstillopen.')
txt(225,153,'C / ACTUAL100/100 INTERFACE TRACTIONS','title')
for i,state in enumerate(head_states):
    txt(225,164+i*9,f"N{state['N']:.0f}: C{state['concrete_kN']:.1f}; steelT{state['steel_tension_kN']:.1f}/C{state['steel_compression_kN']:.1f}kN.")
txt(225,205,'Sectoravg10.3–10.9;unredistributedpeak17>CTT11.22.')
txt(225,213,'8.976iscrackedSTRUTcontrol;N/A6.76isnotN–Mproof.')
txt(225,225,'Signedsector+8steelforcescloseN/Mx/My; capstrutfield,')
txt(225,233,'bend-bearingconfinement andstartercoupletransferOPEN.')
txt(14,282,'INTERNALWORKREMAINS: allothernodearmrouting/interiortransversecage+N–Mcapcompressionfield. Site/soil/group/lateral/upliftacceptanceisseparate.')
txt(14,290,'Nojoinednode,floor,houseorfoundationPASS. Drawn450/570profilesareexplicitcalculationscope,notconstructionrelease.')
parts.append('</svg>\n')
node_svg='\n'.join(parts)
parts=['<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297">',
       '<style>text{font-family:DejaVu Sans,sans-serif;fill:#243a44;font-size:3.1px}.title{font-size:4.6px;font-weight:bold}</style>',
       '<rect width="420" height="297" fill="#faf8f1"/>']
txt(14,14,'OPEN N / wet beam–receiver joint, finite bars and hooks','title')
txt(14,23,'RC200×350 / receiver260×450 / c25,H6links,16maximumaggregate / no room or whole-house acceptance')
txt(14,36,'A / RECEIVER PLAN · 1:3','title')
box(20,45,260/3,150,'#d9e2de')
box(30,45,200/3,150,'none','#b4753c')
for a in column_bars:
    x,y,z=a['points'][0]
    parts.append(f'<circle cx="{20+x/3}" cy="{45+y/3}" r="{8/3}" fill="#4b716c"/>')
for a in joint_bars:
    x=a['points'][0][0]
    ln(20+x/3,45+90/3,20+x/3,195,'#a34f4d' if a['dia']==16 else '#b4753c')
txt(14,207,'Beam centred: localx30..230; bottomx90/130/170.')
txt(14,215,'Column4H16: x39/221,y39/411; linksH6 c25.')
txt(14,223,'Jointbeamlinks y350/450 only, beforecurves; ownbarcontactintentional.')
txt(150,36,'B / NS HOOK PROFILE · 1:6','title')
jx=lambda y:145+y/6
jz=lambda z:45+(3370-z)/6
box(jx(0),jz(3370),450/6,(3370-2100)/6,'#d9e2de')
box(jx(450),jz(3370),25,350/6,'#c5cfca')
for a in [joint_bars[0],joint_bars[3]]:
    d='M'+' L'.join(f'{jx(y):.3f},{jz(z):.3f}' for x,y,z in a['points'])
    parts.append(f'<path d="{d}" fill="none" stroke="{"#a34f4d" if a["dia"]==16 else "#b4753c"}" stroke-width="{a["dia"]/6}"/>')
for z in [3010,3110,3210,3270]:ln(jx(28),jz(z),jx(422),jz(z),'#8b9995')
txt(256,55,'Top3370 / beamsoffit3020 / lining3005.')
txt(256,65,'BottomH16: z3059, internalmandrel450;')
txt(256,73,'centrelineR233, verticaltail600 toz2226.')
txt(256,85,'TopH10: z3334, internalmandrel180;')
txt(256,93,'R95, tail110 toz3129, abovemainbars.')
txt(256,105,'Allhooks: leglocaly90; south/northmirrored.')
txt(256,117,f"Minimumindependentbarclear{wet['receiver_joint']['clearance_minimum']:.2f} >=21mm.")
txt(256,129,'Bottomfullfy lbrqd580; actualpath1093mm.')
txt(256,137,'TopPOORbond lbrqd518; actualpath524mm.')
txt(256,149,'Fullfyconcretebenddemand: H16~418<450;')
txt(256,157,'H10~151<180. No shortmandrelshortcut.')
txt(256,173,'Southsupport8852.5; north11512.5;')
txt(256,181,'loaded155cantileverto11667.5 explicit.')
txt(256,197,'Northpierends11737.5, insideinnercore;')
txt(256,205,'not projecting concrete into weathercavity.')
txt(14,278,'Separate downstream duties: lowercolumn/groundjoint, uppermasonryentry, localtolerances/exposure andHADdoor/windowfit.')
txt(14,287,'Curves2degreechords; numericalclearances subtract0.1mm >0.036mmchorderror. No site reinforcement acceptance follows.')
parts.append('</svg>\n')
joint_svg='\n'.join(parts)
parts=['<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297">',
       '<style>text{font-family:DejaVu Sans,sans-serif;fill:#243a44;font-size:2.9px}.title{font-size:4.4px;font-weight:bold}</style>',
       '<rect width="420" height="297" fill="#faf8f1"/>']
txt(12,13,'OPEN N / actual stair, midlanding and receiving frame','title')
txt(12,22,'HAD0b2f7d48 / 27finish / 1094body +200well;1004betweenrails / unadopted; no body,guard or whole-house PASS')
txt(12,34,'A / FINITE PLAN · 1:20','title')
sx=lambda x:12+(x-262.5)/20
sy=lambda y:274-(y-4332.5)/20
box(sx(429.5),sy(8755.5),2388/20,(8755.5-4432.5)/20,'#e5ebe7')
box(sx(1523.5),sy(7132.5),200/20,2700/20,'#faf8f1')
box(sx(262.5),sy(7382.5),2805/20,250/20,'#c5cfca')
box(sx(2817.5),sy(8852.5),200/20,(8852.5-4332.5)/20,'#c5cfca')
box(sx(2817.5),sy(7382.5),250/20,250/20,'#b95351')
box(sx(262.5),sy(8300),140/20,2100/20,'#b4753c')
box(sx(262.5),sy(4432.5),3725/20,200/20,'#c5cfca')
box(sx(332.5),sy(8922.5),(3987.5-332.5)/20,140/20,'#aebeba')
for i in range(10):
    y=4432.5+i*300
    ln(sx(429.5),sy(y),sx(1523.5),sy(y),'#4b716c')
    ln(sx(1723.5),sy(y),sx(2817.5),sy(y),'#b4753c')
    if i in [0,5,9]:txt(sx(470),sy(y)-1,f'{172.5*(i+1):g}')
txt(sx(550),sy(8150),'Landingdepth1623; RCtop1725.')
txt(sx(550),sy(7700),'Full140northseat8782.5..8922.5.')
txt(215,34,'B / MEMBER ACTIONS AND REAL LIMITS','title')
for i,line in enumerate([f'Flightbearing2925, pitch{tg["pitchDegrees"]:.3f}°,150normalwaist.',
 f'Per1mM{stair_flight["M"]:.2f}/MR{stair_sec["MR"]:.2f}; eachend{stair_flight_reaction:.2f}kN.',
 f'Verticalwaistphi3+shrink{stair_vertical_phi3+stair_vertical_shrink:.3f} <{stair_span*1000/250:.3f}L/250;sec(pitch)bothterms.',
 f'Midbeam250×370/top1725/bottom1355,M{mid_M:.2f}.',
 f'WestR{mid_RL:.2f}/EastR{mid_RR:.2f};postN{mid_post_N:.2f}/M{mid_post_M:.2f}.',
 f'Continuoustrimmerpostreaction{long_reaction_max[1]:.2f}, nottwoindependentbays.',
 'WestH20horizN/Shooks→actualRC140sill;H12tie+2struts.',
 f'Actualmasonrypadsneedfd≥{sill_max_bearing:.3f}MPa beforesecondorder/bedadmission.',
 'EastH20downhooks/postcageenumerated; upperwaist/trimmerjointstillopen.',
 'Guardposts/anchors,fullphysicalslabedge/portmass andwindow25jointunearned.']):txt(215,45+i*8,line)
txt(215,134,'C / PROJECTED FLIGHT SECTIONS · 1:30','title')
fx=lambda y:220+(y-4332.5)/30
fz=lambda z:264-z/30
box(fx(4232.5),fz(3370),200/30,300/30,'#c5cfca')
box(fx(7132.5),fz(1725),250/30,370/30,'#c5cfca')
box(fx(7132.5),fz(1725),(8922.5-7132.5)/30,200/30,'#d9e2de')
for direction,first_y,base,colour in [(1,4432.5,0,'#4b716c'),(-1,7132.5,1725,'#b4753c')]:
    pts=[]
    for i in range(10):
        y=first_y+direction*300*i;z=base+172.5*(i+1)
        if i:pts.append((fx(y),fz(z-172.5)))
        pts.append((fx(y),fz(z)))
    parts.append('<path d="M'+' L'.join(f'{x:.3f},{y:.3f}' for x,y in pts)+f'" fill="none" stroke="{colour}" stroke-width=".7"/>')
    y0=first_y;y1=first_y+direction*2700;drop=150/math.cos(stair_angle)
    ln(fx(y0),fz(base-drop),fx(y1),fz(base+1552.5-drop),colour)
txt(215,277,'Greenlower/ochreupperprojected; differentxterritories, notoverlappingflights.')
txt(12,289,'ONEcurrentcandidate: actualwaist/beamgeometry, tributaryloadsandcontinuouscompatibility. Frozenunearnednodeprototypecontinuesawaitspecialist.')
parts.append('</svg>\n');stair_svg='\n'.join(parts)
for name,content in [('open-loggia-support.json',json.dumps(result,indent=2)+'\n'),('open-loggia-support.svg',main_svg),('open-loggia-node.svg',node_svg),('open-loggia-wet-joint.svg',joint_svg),('open-loggia-stair.svg',stair_svg)]:
    p=OUT/name
    if '--check' in sys.argv:
        if not p.exists() or p.read_text()!=content: raise SystemExit('STALE '+str(p))
    else:p.write_text(content)
print('OPEN-N support checkpoint: source pin, equilibrium/scaling, finite field and conditional member checks passed')
