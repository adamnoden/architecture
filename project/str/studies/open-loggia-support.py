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
from bisect import bisect_right
from html import escape

OUT=Path(__file__).resolve().parent
ROOT=OUT.parents[2]
HAD_PATH='project/had/studies/open-north-loggia.json'
HAD_COMMIT='a510f30cc82cf9d0142664b72bc272406aed3076'
HAD_SHA='f3d2bd0962dffdbc3129522720501889265a2b6ab623d707542c38a13217ed47'
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
stair_waist=170;stair_d=139
stair_G=stair_waist/1000/math.cos(stair_angle)*25+.1725/2*25+.9
stair_flight=udl(1.35*stair_G+1.5*3,stair_span)
stair_flight_reaction=stair_flight['V']*sg['bodyTerritoryEach']/1000
stair_sec=rc(1000,stair_waist,stair_d,area(12)*1000/125,25)
stair_axial=stair_flight['V']*math.sin(stair_angle)
assert stair_flight['M']/stair_sec['MR']+stair_axial*1000/(stair_sec['As']*(500/1.15))<1
assert stair_flight['V']<stair_sec['VRdc']
# The waist depth is NORMAL to the pitch, while span and vertical loading use
# horizontal coordinates. Vertical unit-load work integrates along ds=dx/cosθ:
# both the EI deflection and imposed-normal-curvature displacement need secθ.
stair_secant=1/math.cos(stair_angle)
stair_vertical_phi3=cracked(1000,stair_waist,stair_d,stair_sec['As'],stair_G,3,stair_span,3)*stair_secant
stair_vertical_shrink=300e-6/stair_waist*(stair_span*1000)**2/8*stair_secant
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
landing_sec=rc(1000,200,170,area(10)*1000/125,25)
assert landing_action['M']<landing_sec['MR'] and landing_action['V']<landing_sec['VRdc']
landing_patch_G=.05*25;patch_on_span=.325;patch_overhang=.125
patch_mid_G=landing_patch_G*(patch_overhang+patch_on_span-patch_on_span**2/(2*landing_L))
patch_north_G=landing_patch_G*patch_on_span**2/(2*landing_L)
mid_L=2.610;mid_w=(1.35*landing_G+1.5*landing_Q)*landing_L/2+1.35*(.25*.19*25+patch_mid_G)
mid_points=[(stair_flight_reaction,(sum(sg[k])/2-332.5)/1000) for k in ['lowerFlightX','upperFlightX']]
mid_RL=mid_w*mid_L/2+sum(P*(mid_L-a)/mid_L for P,a in mid_points)
mid_RR=mid_w*mid_L/2+sum(P*a/mid_L for P,a in mid_points)
mid_M=max(mid_RL*x-mid_w*x*x/2-sum(P*max(0,x-a) for P,a in mid_points) for x in [mid_L*i/1000 for i in range(1001)])
mid_sec=rc(250,390,347,2*area(20),25);mid_links=links(250,347,8,125)
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
header_sec=rc(200,300,258,3*area(16),25)
header_link=links(200,258,8,100)
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
                      between_rails=sg['handrail']['betweenRailsMinimum'],after20_position_loss=sg['handrail']['lowerAfter20Loss'],
                      waist=stair_waist,waist_normal=True,waist_section=stair_sec,
                      steel='H12/125 main eachface;H10/150 distribution',
                      G=stair_G,Q=3,flight_action=stair_flight,flight_end_reaction=stair_flight_reaction,
                      axial_sensitivity=stair_axial,main_nose_levels=[0,1725,3450],
                      upper_floor80_not_added_to_final_riser=True,
                      vertical_displacement_basis='Normal170waist;verticalunit-loadwork ds=dx/cos(pitch), bothtermsinclude sec(pitch).',
                      vertical_projection_factor=stair_secant,
                      fully_cracked_phi3_mm=stair_vertical_phi3,
                      differential_shrinkage_300microstrain_mm=stair_vertical_shrink,
                      combined_vertical_sensitivity_mm=stair_vertical_phi3+stair_vertical_shrink,
                      L250_comparator=stair_span*1000/250,
                      midlanding_slab=dict(top=1725,bottom=1525,NSsupport_axes=[7257.5,8852.5],
                                          full_north_seat=[8782.5,8922.5],section=landing_sec,action=landing_action,
                                          actual_northwall_bearing_admission=False),
                      midlanding_beam=dict(footprint=[262.5,7132.5,2805,250],support_axes_x=[332.5,2942.5],
                                          top=1725,bottom=1335,normal_waist_soffit_last_lower=1552.5-stair_waist/math.cos(stair_angle),
                                          section=mid_sec,links=mid_links,point_loads=mid_points,udl=mid_w,M=mid_M,reactions=[mid_RL,mid_RR],
                                          steel='2H20bottom/2H10top;H8/125',
                                          west_RC_sill_receiver=[262.5,6200,140,2100],receiver_top=1725,receiver_bottom=1335,
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
sill_G=.14*.39*25+1.0 # includes authored1kN/m window/frame dead-loadbudget.
sill_N=mid_RL+1.35*sill_G*2.1+1.35*.14*.7*1.535*20
sill_e=20;sill_bearing_area=2*140*275
sill_max_bearing=sill_N*1000/sill_bearing_area*(1+6*sill_e/140)
sill_H=mid_RL/2*200/(1680-1416)
sill_strut=math.hypot(mid_RL/2,sill_H)
assert sill_H<area(12)*(500/1.15)/1000
assert sill_strut*1000/(140*150)<.528*17
sill=dict(concrete=[262.5,6200,140,2100],top=1725,bottom=1335,
          two_NS_bearing_patches=[[6920,7195],[7320,7595]],masonry_territory=[262.5,6907.5,140,700],
          vertical_load=mid_RL,total_with_sill_window_wall=sill_N,window_G_budget_per_m=1,
          minimum_eccentricity=sill_e,required_simple_bearing_fd=sill_max_bearing,
          masonry_modulus_second_order_admission=False,
          strut_nodes_relative_to_7257p5=[[-200,1416],[0,1680],[200,1416]],
          strut_force=sill_strut,strut_area=140*150,strut_stress=sill_strut*1000/(140*150),
          continuous_bottom_tie=dict(bar='H12',x=350,z=1416,y=[6557.5,7957.5],demand=sill_H,
                                     capacity=area(12)*(500/1.15)/1000,straight_beyond_each_node=500,full_fyd_lbrqd=12/4*(500/1.15)/3),
          cantilever_top='2H10continuousNSx310.5/354.5,z1688,y6225..8275;fullpoorbonddevelopmentbeyond700masonrysupport',
          full_ground_moment_from_32p5axis_offset=sill_N*(.020+.0325),
          geometry_and_force_path_only=True)
# ALL enumerated barpaths, including corner-column bars andlinkplanes. East
#downhooks; westH20turnshorizontallyoppositeNSinsidetheactualsillreceiver.
mid_e=[];mid_w=[]
for i,y in enumerate([85,165]):
    R=220;start=185-R
    points=[(-200,y,1378),(start,y,1378)]
    points += [(start+R*math.sin(math.radians(t)),y,1378-R*(1-math.cos(math.radians(t)))) for t in range(2,91,2)]
    points.append((185,y,408));mid_e.append(dict(id='EB'+str(i+1),dia=20,points=points))
    direction=-1 if i==0 else 1
    start=310.5+R;global_y=7132.5+y
    points=[(700,global_y,1378),(start,global_y,1378)]
    points += [(start-R*math.sin(math.radians(t)),global_y+direction*R*(1-math.cos(math.radians(t))),1378) for t in range(2,91,2)]
    points.append((310.5,global_y+direction*(R+750),1378));mid_w.append(dict(id='WB'+str(i+1),dia=20,points=points))
for i,y in enumerate([85,165]):
    R=95;start=185-R
    points=[(-200,y,1650),(start,y,1650)]
    points += [(start+R*math.sin(math.radians(t)),y,1650-R*(1-math.cos(math.radians(t)))) for t in range(2,91,2)]
    points.append((185,y,1445));mid_e.append(dict(id='ET'+str(i+1),dia=10,points=points))
    direction=-1 if i==0 else 1;start=310.5+R;global_y=7132.5+y
    points=[(700,global_y,1650),(start,global_y,1650)]
    points += [(start-R*math.sin(math.radians(t)),global_y+direction*R*(1-math.cos(math.radians(t))),1650) for t in range(2,91,2)]
    points.append((310.5,global_y+direction*(R+550),1650));mid_w.append(dict(id='WT'+str(i+1),dia=10,points=points))
mid_column=[dict(id='PC'+str(i),dia=16,points=[(x,y,-180),(x,y,3345)]) for i,(x,y) in enumerate([(39,39),(39,211),(211,39),(211,211)])]
post_link_z=[z for z in range(-150,3251,100) if z not in [1350,1550,1650,3050]]+[1310,1410,1520,1620,1720,3010,3110,3290]
mid_column += [dict(id='PL'+str(z),dia=6,points=[(28,28,z),(222,28,z),(222,222,z),(28,222,z),(28,28,z)]) for z in post_link_z]
mid_e_clear=[dict(a=a['id'],b=b['id'],clear=path_clear(a,b)) for i,a in enumerate(mid_e) for b in mid_e[:i]+mid_column]
assert min(c['clear'] for c in mid_e_clear)>=21,sorted(mid_e_clear,key=lambda c:c['clear'])[:4]
sill_fixed=[dict(id='SILLtie',dia=12,points=[(350,6557.5,1416),(350,7957.5,1416)])]
sill_fixed += [dict(id='SILLtop'+str(x),dia=10,points=[(x,6225,1688),(x,8275,1688)]) for x in [310.5,354.5]]
mid_w_clear=[dict(a=a['id'],b=b['id'],clear=path_clear(a,b)) for i,a in enumerate(mid_w) for b in mid_w[:i]+sill_fixed]
assert min(c['clear'] for c in mid_w_clear)>=21,sorted(mid_w_clear,key=lambda c:c['clear'])[:4]
mid_bend20=area(20)*(500/1.15)*(1/40+1/40)/17
assert mid_bend20<420 and 20/4*(500/1.15)/3<750
assert 10/4*(500/1.15)/2.1<550
sill_hoops=[dict(id='SH'+str(y),dia=6,points=[(290.5,y,1363),(374.5,y,1363),(374.5,y,1697),(290.5,y,1697),(290.5,y,1363)])
             for y in [6250,6450,6650,6850,7050,7100,7257.5,7415,7500,7700,7900,8100,8250]]
sill_hoop_clear=[dict(a=a['id'],b=b['id'],clear=path_clear(a,b)) for a in mid_w+sill_fixed for b in sill_hoops]
# Ownlongitudinalbarsinsideownstirrupsdonotneedaggregateclearspacing; nointerpenetration.
assert min(c['clear'] for c in sill_hoop_clear)>=0
assert max(b-a for a,b in zip([h['points'][0][1] for h in sill_hoops],[h['points'][0][1] for h in sill_hoops][1:]))<=200
sill['actual_H6_hoops']=sill_hoops;sill['own_hoop_physical_min']=min(c['clear'] for c in sill_hoop_clear)
sill['stirrup_capacity']=links(140,309,6,200)
sill['top_cantilever_M']=1.35*sill_G*.8075**2/2
sill['top_cantilever_capacity']=rc(140,390,353,2*area(10),25)['MR']
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
mid_delta=beam_SLS_bound(landing_G*landing_L/2+.25*.19*25+patch_mid_G,landing_Q*landing_L/2,
                         2*stair_G*stair_span/2*1.094,2*3*stair_span/2*1.094,mid_L,mid_sec)
frame['stair']['midlanding_beam']['fully_cracked_phi3_central_point_bound_mm']=mid_delta
frame['stair']['midlanding_beam']['shrinkage300microstrain_mm']=300e-6/390*(mid_L*1000)**2/8
frame['stair']['midlanding_beam']['L250_comparator_mm']=mid_L*1000/250
assert mid_delta+300e-6/390*(mid_L*1000)**2/8<mid_L*1000/250
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
stair_sens=[]
for case,h,d,phi,shrink,added_G in [('control',150,119,3,300,0),('creep3p5',150,119,3.5,300,0),
                                  ('shrink400',150,119,3,400,0),('waist-minus5',145,114,3,300,0),
                                  ('extra-permanent0p25',150,119,3,300,.25)]:
    G=h/1000/math.cos(stair_angle)*25+.1725/2*25+.9+added_G
    defl=cracked(1000,h,d,stair_sec['As'],G,3,stair_span,phi)*stair_secant
    imposed=shrink*1e-6/h*(stair_span*1000)**2/8*stair_secant
    stair_sens.append(dict(case=case,normal_h=h,d=d,phi=phi,differential_microstrain=shrink,added_G=added_G,
                           deflection=defl,imposed=imposed,total=defl+imposed,
                           reserve=stair_span*1000/250-defl-imposed))
frame['stair']['merged150_sensitivities']=stair_sens
frame['stair']['reserve_warning']='Historical150control reserve0.534mm is narrow. These separate authored perturbations are not actual tolerances/creep forecasts and do not combine safely by a binaryPASS; actual as-built section, servicecriteria, creep/finishes and movement budget must earn the proposition.'
# One constructive continuation, kept distinct from the merged150 control until
# its actual receiving hooks/sill/window guard are regenerated and reconciled.
new_h=170;new_d=139
new_G=new_h/1000/math.cos(stair_angle)*25+.1725/2*25+.9
new_end=udl(1.35*new_G+1.5*3,stair_span)['V']*1.094
new_mid_w=frame['stair']['midlanding_beam']['udl']
new_mid_points=[(new_end,a) for P,a in mid_points]
new_mid_RL=new_mid_w*mid_L/2+sum(P*(mid_L-a)/mid_L for P,a in new_mid_points)
new_mid_RR=new_mid_w*mid_L/2+sum(P*a/mid_L for P,a in new_mid_points)
new_mid_M=max(new_mid_RL*x-new_mid_w*x*x/2-sum(P*max(0,x-a) for P,a in new_mid_points)
              for x in [mid_L*i/1000 for i in range(1001)])
new_stair_cases=[]
for case,h,d,phi,shrink,added in [('nominal170',170,139,3,300,0),('adverse165',165,134,3.5,400,.25)]:
    G=h/1000/math.cos(stair_angle)*25+.1725/2*25+.9+added
    delta=cracked(1000,h,d,stair_sec['As'],G,3,stair_span,phi)*stair_secant
    imposed=shrink*1e-6/h*(stair_span*1000)**2/8*stair_secant
    new_stair_cases.append(dict(case=case,h=h,d=d,phi=phi,microstrain=shrink,added_G=added,
                               total=delta+imposed,reserve=11.7-delta-imposed))
frame['stair']['stair170_development']=dict(status='Active170waist390beam technical trial; nominal incoming waist/lap/header paths now enumerated; guard, groundtoe and construction admission remain',
    normal_waist=170,steel='H12/125 eachface retained',G=new_G,ULS_flight_end=new_end,
    sensitivities=new_stair_cases,last_lower_waist_soffit=1552.5-170/math.cos(stair_angle),
    existing_beam_bottom=1355,existing_contact_reserve=1552.5-170/math.cos(stair_angle)-1355,
    current_midbeam=[250,390],top=1725,bottom=1335,mid_actions=dict(M=new_mid_M,RW=new_mid_RL,RE=new_mid_RR),
    mid_section_screen=rc(250,390,347,2*area(20),25),
    changed_joint='ActualEWmidbeam/sillcages and incoming waist/lap/header paths enumerated below. Nominal clearance is not a placement-tolerance proof; guard, header ends and groundtoe remain unearned. No fulljoint PASS transfers.',
    HAD_readback='2026-11-02:390beam and250localpatch are inside stair/landingaperture, outside credited occupied/head/windowroute. Nose/landingTOP1725 and sill1750held; fixedWest7400guard remains conditional.',
    no_second_stair_authority=True)

frame['stair']['current_sensitivities']=new_stair_cases
frame['stair']['midlanding_slab']['local_patch']=dict(x=[429.5,2817.5],y=[7132.5,7582.5],top=1725,bottom=1475,G_extra=landing_patch_G,mid_G_per_m=patch_mid_G,north_G_per_m=patch_north_G,reason='Receives the enumerated170waist barfillets with25nominal cover; line reaction is conservatively applied across2610beam span, wider than2388physicalpatch.')

# Actual170 waist/landing/header bar paths. The flight steel is continuous through
# the upper flight; the lower ground-toe anchorage remains a separate named join.
# H12 turns only through the pitch angle, with a240 INTERNAL mandrel. The local
#250 landing patch is concrete that receives the approach, not missing cover.
def waist_fillet(x,yref,zref,slope,target_z,direction,start_y,end_y,name):
    angle=math.atan(slope);R=126;tangent=R*math.tan(abs(angle)/2)
    u=(target_z-zref)/slope
    start=u-tangent*math.cos(angle)
    cy=u+tangent;cz=target_z-(R if angle>0 else -R)
    a0=math.pi/2+angle if angle>0 else -math.pi/2+angle
    a1=math.pi/2 if angle>0 else -math.pi/2
    count=math.ceil(abs(math.degrees(angle))/2)
    points=[(x,start_y,zref+slope*direction*(start_y-yref)),
            (x,yref+direction*start,target_z-tangent*math.sin(angle))]
    points += [(x,yref+direction*(cy+R*math.cos(a0+(a1-a0)*i/count)),
                cz+R*math.sin(a0+(a1-a0)*i/count)) for i in range(1,count+1)]
    points.append((x,end_y,target_z))
    return dict(id=name,dia=12,points=points,internal_mandrel=240,
                tangent_end_y=yref+direction*cy,target_z=target_z)

lower_x=[460.5+125*i for i in range(8)]+[1458.5]
upper_x=[1754.5+125*i for i in range(8)]+[2752.5]
waist_paths=[];mid_waist=[];header_waist=[]
for side,positions in [('L',lower_x),('U',upper_x)]:
    for i,x in enumerate(positions):
        for face,depth,target in [('B',139,1556),('T',31,1683)]:
            is_lower=side=='L';refz=(1552.5 if is_lower else 1725)-depth/math.cos(stair_angle)
            mid=waist_fillet(x,7132.5,refz,math.tan(stair_angle)*(1 if is_lower else -1),
                             target,1,6500,8300,f'{side}{face}{i+1}')
            mid_waist.append(mid)
            if not is_lower:
                head=waist_fillet(x,4432.5,3277.5-depth/math.cos(stair_angle),math.tan(stair_angle),
                                  3201 if face=='B' else 3339,-1,5000,3450,f'H{face}{i+1}')
                header_waist.append(head)
                full={**mid,'points':list(reversed(head['points']))+mid['points']}
                waist_paths.append(full)
            else:waist_paths.append(mid)

# The finite receiving EW bars were previously checked at each end separately.
# Join their real straight middle before checking incoming waist crossings.
mid_complete=[]
for i,w in enumerate(mid_w):
    e=mid_e[i]
    pts=list(reversed(w['points']))+[(2817.5+x,7132.5+y,z) for x,y,z in e['points']]
    mid_complete.append(dict(id='MID'+w['id'],dia=w['dia'],points=pts))
mid_hoop_x=list(range(548,1549,125))+[1648]+list(range(1692,2693,125))
mid_hoops=[dict(id='MH'+str(x),dia=8,points=[(x,7161.5,1364),(x,7353.5,1364),
              (x,7353.5,1696),(x,7161.5,1696),(x,7161.5,1364)]) for x in mid_hoop_x]
assert max(b-a for a,b in zip(mid_hoop_x,mid_hoop_x[1:]))<=170
frame['stair']['midlanding_beam']['links']=links(250,347,8,170)
frame['stair']['midlanding_beam']['steel']='2H20bottom1378;2H10top1650;H8actual125/transitionmax169'
frame['stair']['midlanding_beam']['joint_paths']['midbeam_stirrup_stations_x']=mid_hoop_x

# Ordinary H10 landing steel is lapped to the H12 flight bars only in the actual
# landing, after the pitch-angle bend. There is no duplicate NSbar on the same
# line. Max203 spacing across the well governs the conservative landing section.
lap_positions=[x+34 for x in lower_x+upper_x]
landing_NS=[]
for face,z in [('B',1555),('T',1683)]:
    for i,x in enumerate(lap_positions):
        landing_NS.append(dict(id=f'LP{face}{i}',dia=10,points=[(x,7525,z),(x,8897.5,z)]))
    for i,x in enumerate([300.5,1585.5,2911.5,2968.5]):
        if face=='T' and x==300.5:continue # reuse/extend actual SILLtop310.5, not a duplicate nearbybar
        landing_NS.append(dict(id=f'EX{face}{i}',dia=10,points=[(x,7132.5,z),(x,8897.5,z)]))
for bar in sill_fixed:
    if bar['id']=='SILLtop310.5':bar['points'][-1]=(310.5,8897.5,1688)
all_landing_x=sorted(lap_positions+[300.5,1585.5,2911.5,2968.5])
assert max(b-a for a,b in zip(all_landing_x,all_landing_x[1:]))<=205
landing_EW=[]
for y in [7395,7520]+list(range(7645,8771,125))+[8890]:
    for face,z in [('B',1505 if y<7582.5 else 1589),('T',1650)]:
        if face=='T' and y<7520:continue
        landing_EW.append(dict(id=f'LE{face}{y}',dia=10,points=[(429.5,y,z),(2817.5,y,z)]))
landing_sec=rc(1000,200,170,area(10)*1000/205,25)
assert landing_action['M']<landing_sec['MR'] and landing_action['V']<landing_sec['VRdc']
frame['stair']['midlanding_slab']['section']=landing_sec
frame['stair']['midlanding_slab']['steel']='ActualH10NSmax203 after flightlaps;transverseH10max225local/125ordinary;explicitplanes/rows'

# Actual header rows avoid the waist entry. Its H8 planes are phased between
# the upperflight mainbars; the ordinary topEWmesh locally becomes H16/200.
header_main=[dict(id=f'HB{i}',dia=16,points=[(290,y,3112),(3960,y,3112)])
             for i,y in enumerate([4274.5,4321.75,4370])]
header_main += [dict(id='HT0',dia=10,points=[(290,4271.5,3294),(3960,4271.5,3294)]),
                dict(id='HT1',dia=16,points=[(290,4390,3310),(3960,4390,3310)])]
header_hoops=[dict(id='HH'+str(x),dia=8,points=[(x,4261.5,3099),(x,4403.5,3099),
                    (x,4403.5,3341),(x,4261.5,3341),(x,4261.5,3099)]) for x in range(317,3943,125)]
header_topmesh=[dict(id='HE4195',dia=16,points=[(300,4195,3303),(3950,4195,3303)])] # HT1 is the same northmeshbar, not a duplicate
header_laps=[dict(id=f'HL{face}{i}',dia=12,points=[(x+34,3450,z),(x+34,4200,z)])
             for i,x in enumerate(upper_x) for face,z in [('B',3201),('T',3339)]]
header_link=links(200,258,8,125)
assert max(header_RL,header_RR)<min(header_link['VRs'],header_link['VRmax'])
frame['stair_header']['links']=header_link

def clear_matrix(bars,receivers):
    return [dict(a=a['id'],b=b['id'],clear=path_clear(a,b)) for a in bars for b in receivers]
mid_incoming_clear=clear_matrix(mid_waist,mid_complete+mid_hoops+landing_EW)
header_incoming_clear=clear_matrix(header_waist,header_main+header_hoops+header_topmesh)
landing_lap_clear=clear_matrix(mid_waist,landing_NS)
header_lap_clear=clear_matrix(header_waist,header_laps)
landing_cross_clear=clear_matrix(landing_NS,landing_EW)
global_mid_column=[{**b,'points':[(2817.5+x,7132.5+y,z) for x,y,z in b['points']]} for b in mid_column]
landing_receiver_clear=clear_matrix(landing_NS,mid_complete+mid_hoops+global_mid_column)
landing_sill_clear=clear_matrix(landing_NS,sill_fixed)
receiving_own=[*clear_matrix(mid_complete,mid_hoops),*clear_matrix(header_main,header_hoops)]
# H20 to H8 at1378/1364 is an exact intended straight-layer contact; all
# independent incoming bars still require21clear. Curves meet no such exception.
for v in receiving_own:
    raw=v['clear']+.1
    if raw<.1:
        assert v['a'].startswith('MIDWB') and math.isclose(raw,0,abs_tol=1e-7),v
    else:assert raw>=.1,v
for label,values in [('MIDincoming',mid_incoming_clear),('HEADERincoming',header_incoming_clear),
                     ('landinglaps',landing_lap_clear),('headerlaps',header_lap_clear),
                     ('landingcross',landing_cross_clear),('landingreceiver',landing_receiver_clear),
                     ('landingsill',landing_sill_clear)]:
    assert min(v['clear'] for v in values)>=21,(label,sorted(values,key=lambda v:v['clear'])[:4])

# A displacement is not proof of concrete cover: check the actual receiving
# solid at every curved MID point. Concrete steps add material above the waist;
# at/after the landing nose its exposed top is the actual1725 plane.
cover_checks=[];header_cover=[]
def boundary_points(points,boundaries):
    probes=list(points)
    for p,q in zip(points,points[1:]):
        if p[1]==q[1]:continue
        for boundary in boundaries:
            for y in [boundary-.001,boundary,boundary+.001]:
                t=(y-p[1])/(q[1]-p[1])
                if 0<t<1:probes.append(tuple(p[i]+t*(q[i]-p[i]) for i in range(3)))
    return probes
for bar in mid_waist:
    for x,y,z in boundary_points(bar['points'],[7132.5,7382.5,7582.5]):
        if y<7132.5:continue
        bottom=1335 if y<=7382.5 else (1475 if y<=7582.5 else 1525)
        cover_checks.append(min(z-bar['dia']/2-bottom,1725-z-bar['dia']/2))
assert min(cover_checks)>=25
for bar in header_waist:
    for x,y,z in boundary_points(bar['points'],[4232.5,4432.5]):
        if y>4432.5:continue
        bottom=3070 if y>=4232.5 else 3170
        header_cover.append(min(z-bar['dia']/2-bottom,3370-z-bar['dia']/2))
assert min(header_cover)>=25
top_patch_section=rc(1000,200,133,area(16)*1000/200,25)
assert top_patch_section['MR']>=rc(1000,200,157,area(12)*1000/150,25)['MR']
landing_bound=udl(1.35*(landing_G+landing_patch_G)+1.5*landing_Q,landing_L)
assert landing_bound['M']<landing_sec['MR'] and landing_bound['V']<landing_sec['VRdc']
landing_delta=cracked(1000,200,170,landing_sec['As'],landing_G+landing_patch_G,landing_Q,landing_L,3)
landing_shrink=300e-6/200*(landing_L*1000)**2/8
assert landing_delta+landing_shrink<landing_L*1000/250
frame['stair']['midlanding_slab'].update(fully_cracked_phi3_mm=landing_delta,
    shrinkage300_mm=landing_shrink,L250_mm=landing_L*1000/250,
    full_span_G_upper_bound=landing_G+landing_patch_G,
    transverse_local_minimum=rc(1000,200,137,area(10)*1000/225,25))
lap_lbr=1.5*12/4*(500/1.15)/3
assert lap_lbr<750
mandrel12=area(12)*(500/1.15)*(1/31+1/(2*12))/17
assert mandrel12<240
end_tension_per_bar=landing_bound['V']*.205 # fullV, exceeds shiftedV/2 endtie control
end_sigma=end_tension_per_bar*1000/area(10)
end_lbd=max(.3*10/4*end_sigma/3,100,10*10)
assert 8897.5-8782.5>=end_lbd
lap_transfer=landing_bound['M']/(landing_sec['z']/1000)*.205+end_tension_per_bar+stair_axial*.125
assert lap_transfer<area(10)*(500/1.15)/1000
frame['stair']['waist_joints']=dict(waist_paths=waist_paths,mid_complete_bars=mid_complete,
    mid_hoops=mid_hoops,landing_NS=landing_NS,landing_EW=landing_EW,
    header_main=header_main,header_hoops=header_hoops,header_topmesh=header_topmesh,header_laps=header_laps,
    min_clear=dict(mid=min(v['clear'] for v in mid_incoming_clear),header=min(v['clear'] for v in header_incoming_clear),
                   landing_lap=min(v['clear'] for v in landing_lap_clear),header_lap=min(v['clear'] for v in header_lap_clear)),
    additional_clear=dict(landing_cross=min(v['clear'] for v in landing_cross_clear),
                          landing_receiver=min(v['clear'] for v in landing_receiver_clear),
                          landing_sill=min(v['clear'] for v in landing_sill_clear)),
    mid_min_cover=min(cover_checks),header_min_cover=min(header_cover),
    own_receiving_physical_min=min(v['clear']+.1 for v in receiving_own),
    intentional_contact='MIDH20/H8straightbottom layers1378/1364 only;no independentbar orcurve exception',
    landing_reused_topbar='SILLtop310.5 extended to8897.5, not a duplicate nearbyH10',
    local_top_EW_patch=top_patch_section,landing_patch_full_span_bound=landing_bound,
    H12_internal_mandrel=240,H12_demand_mandrel=mandrel12,
    straight_lap=750,fullfy_H12_lap_comparator=lap_lbr,landing_H10_end_straight=115,
    end_tie_force_per_bar=end_tension_per_bar,end_sigma=end_sigma,end_required_lbd=end_lbd,
    lap_ULS_force_bound=lap_transfer,H10_yield_transfer=area(10)*(500/1.15)/1000,
    placement_allowance_qualified=False,
    limit='Enumerated nominal paths/cover/bond only; smallest21.527clear has only0.527 above21. No Cartesian tolerance or fabrication qualification follows. Header end/masonry anchorage, lowergroundtoe, actualguard/lateralmesh,exposure/fire and complete construction acceptance still separate. No blanket joint release.')

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

# Actual over-structure roof: own immutable MAT input, never a copied300mm band.
MAT_ROOF_COMMIT='f376a8a75a12838b2026a9a971ac33bfef470469'
MAT_ROOF_PATH='project/mat/studies/loggia-roof-section.json'
MAT_ROOF_SHA='f3ac7756f1b326a9271869732442083a59f604eca8361f157827f01d748c4b8c'
roof_raw=subprocess.check_output(['git','show',MAT_ROOF_COMMIT+':'+MAT_ROOF_PATH],cwd=ROOT)
assert hashlib.sha256(roof_raw).hexdigest()==MAT_ROOF_SHA
mat_roof=json.loads(roof_raw)
pitch=math.radians(had['roofDevelopment']['pitch']);cosroof=math.cos(pitch)
assert had['roofDevelopment']['overhang']==200
assert had['roofDevelopment']['normalLayers'][-1]==['zinc',.7]
assert math.isclose(sum(t for _,t in mat_roof['layersWeatherToRoom']),500.7)
assert mat_roof['counterrailGrid']['assembly'].startswith('NS rails ONLY')
roof_area=12.4**2-3.1**2
roof_regions=[dict(id='central-'+k,plan_area=3.1*4.65) for k in ['N','S','E','W']]
roof_regions += [dict(id='corner-'+k,plan_area=4.65**2) for k in ['NW','NE','SW','SE']]
assert math.isclose(sum(r['plan_area'] for r in roof_regions),roof_area)
rows=mat_roof['purlins']['rows']
edges=[7550]+[(a+b)/2 for a,b in zip(rows,rows[1:])]+[12200]
roof_trib=[(b-a)/1000 for a,b in zip(edges,edges[1:])]
assert math.isclose(sum(roof_trib),4.65)

def tied_frame(loads,L,angle):
    """Three-hinged two-rafter frame, axial tie at equal-height seat axes.

    Vertical loads include real cantilevers. Crown moment equilibrium determines
    tie force; no parabolic-arch ratio substitutes for the actual roof profile.
    """
    loads=sorted(loads);pos=[x for x,p in loads];P=[0];PX=[0]
    for x,p in loads:P.append(P[-1]+p);PX.append(PX[-1]+x*p)
    RB=PX[-1]/L;RA=P[-1]-RB;f=L/2*math.tan(angle)
    j=bisect_right(pos,L/2);H=(RA*L/2-(L/2*P[j]-PX[j]))/f
    def cut(x):
        j=bisect_right(pos,x)
        V=(RA if x>=0 else 0)+(RB if x>=L else 0)-P[j]
        M=(RA*x if x>=0 else 0)+(RB*(x-L) if x>=L else 0)-x*P[j]+PX[j]
        h=H if 0<=x<=L else 0;theta=angle if x<=L/2 else -angle
        M-=h*min(x,L-x)*math.tan(angle)
        return M,h*math.cos(theta)+V*math.sin(theta)
    samples=[cut(pos[0]+(pos[-1]-pos[0])*k/2000) for k in range(2001)]
    # Actual force/moment closure and crown hinge; these constrain the mechanics.
    assert math.isclose(RA+RB,P[-1],abs_tol=1e-9)
    assert abs(cut(L/2)[0])<1e-8
    assert abs(cut(pos[-1]+.001)[0])<1e-8
    return dict(RA=RA,RB=RB,tie=H,max_abs_M=max(abs(m) for m,n in samples),
                max_compression=max(n for m,n in samples),min_N=min(n for m,n in samples)),cut

def steel_screen(A,I,W,L,fy=355):
    # Rounded section properties below are from SCI/Tata P363, not sharp corners.
    # Curve c is an explicit conservative screening assumption, not a complete
    # EN1993 beam-column/connection/fire verification.
    Ncr=math.pi**2*210000*I/(L*1000)**2/1000
    slender=math.sqrt(A*fy/1000/Ncr)
    phi=.5*(1+.49*(slender-.2)+slender**2)
    chi=min(1,1/(phi+math.sqrt(phi**2-slender**2)))
    return dict(A=A,I=I,Wel=W,Lcr=L,fy=fy,alpha=.49,Ncr=Ncr,slenderness=slender,
                chi=chi,Nb=chi*A*fy/1000,Mel=W*fy/1e6)

roof_cases={}
for name,q in [('ULS-down',1.35*3+1.5*1.5),('service',3+1.5),('uplift-stress',-1.5*1.5)]:
    loads=[((y-8082.5)/1000,q*1.55*w) for y,w in zip(rows,roof_trib)]
    action,_=tied_frame(loads,3.585,pitch)
    action['primary_SHS80x80x5']=steel_screen(1470,1370000,34200,3.585/(2*cosroof))
    ss=action['primary_SHS80x80x5']
    action['linear_Nb_Mel_screen']=max(action['max_compression'],0)/ss['Nb']+action['max_abs_M']/ss['Mel']
    # Full corner square collapsed onto its diagonal is a conservative ACTION
    # collector only. It does not prove the jack spans or their actual loadshare.
    diag_total=4.65*math.sqrt(2);diag_over=.5325*math.sqrt(2);n=1600;ds=diag_total/n
    diag_load=[((i+.5)*ds-diag_over,q*2*min((i+.5)*ds,diag_total-(i+.5)*ds)*ds) for i in range(n)]
    diag,_=tied_frame(diag_load,3.585*math.sqrt(2),math.atan(math.tan(pitch)/math.sqrt(2)))
    assert math.isclose(sum(p for x,p in diag_load),q*4.65**2,rel_tol=1e-12)
    diag['SHS120x120x6p3_section_only']=steel_screen(2820,6030000,100000,
                    3.585*math.sqrt(2)/(2*math.cos(math.atan(math.tan(pitch)/math.sqrt(2)))))
    diag['limit']='Action envelope ONLY: finite jack/purlin spans, actual sharing and hip joints remain internal work. Not a selected complete corner frame.'
    roof_cases[name]=dict(q_horizontal=q,ordinary_frame=action,corner_action_envelope=diag)
assert math.isclose(8*roof_cases['ULS-down']['ordinary_frame']['RA']*2+
                    4*roof_cases['ULS-down']['corner_action_envelope']['RA']*2,
                    roof_cases['ULS-down']['q_horizontal']*roof_area)

# Actual upperwindows prevent calling every roof seat a continuous masonry pier.
roof_seats=[]
for side in ['N','S','W','E']:
    for transverse in [4377.5,7622.5]:
        ends=([8082.5,11667.5] if side in ['N','E'] else [332.5,3917.5])
        for i,end in enumerate(ends):
            xy=[transverse,end] if side in ['N','S'] else [end,transverse]
            wall=('outer-' if i==(1 if side in ['N','E'] else 0) else 'court-')+{'N':'north','S':'south','W':'west','E':'east'}[side]
            coordinate=xy[0] if side in ['N','S'] else xy[1]
            below=[o['id'] for o in had['openings']['FIRST'] if o['wall']==wall and abs(o['centre']-coordinate)<o['width']/2]
            roof_seats.append(dict(id=f'{side}-{transverse}-{i}',xy=xy,wall=wall,opening_below=below,
                                   R_down=roof_cases['ULS-down']['ordinary_frame']['RA'],
                                   R_uplift=roof_cases['uplift-stress']['ordinary_frame']['RA']))
assert any(s['opening_below'] for s in roof_seats)
collector_sec=rc(260,140,103,2*area(12),25)
collector_P=roof_cases['ULS-down']['ordinary_frame']['RA']
collector_w=1.35*.26*.14*25
collector_M=collector_P*1.3/4+collector_w*1.3**2/8
collector_V=collector_P/2+collector_w*1.3/2
assert collector_M<collector_sec['MR'] and collector_V<collector_sec['VRdc'] and collector_sec['ductility']
purlin_M=roof_cases['ULS-down']['q_horizontal']*max(roof_trib)*3.245**2/8
purlin_delta=5*(3+1.5)*max(roof_trib)*(3245**4)/(384*210000)*(cosroof**2/2410000+math.sin(pitch)**2/812000)
roof=dict(source=dict(commit=MAT_ROOF_COMMIT,path=MAT_ROOF_PATH,sha256=MAT_ROOF_SHA),
          weather_eave=7100,physical_outer_edge=7100-200*math.tan(pitch),ridge=mat_roof['ridge'],
          normal_recipe=mat_roof['layersWeatherToRoom'],total_normal=mat_roof['totalNormal'],
          primary_centre=mat_roof['primaryCentre'],ordinary_tie=mat_roof['tie'],
          purlin_under_at_support=mat_roof['purlins']['underside'],ceiling_top=6620,
          support_clearance=mat_roof['purlins']['underside']-6620,
          clearance_limit='38.45 is at the core support; overhang steel lies lower OUTSIDE the protected ceiling territory. No global underside assertion.',
          regions=roof_regions,plan_area=roof_area,normal_area=roof_area/cosroof,
          loads=dict(Gmax=3,Q=1.5,Gmin_uplift=0,wind_stress=1.5,
                limit='Authored horizontal load challenges, not site loads or automatic wind-normal conversion. Roof G3 is a maximum action budget, not derived actual mass; independently supported ceilings retain their separate wall reactions. Uplift takes no favourable dead weight.'),
          north_frames_x=[4377.5,7622.5],seat_y=[8082.5,11667.5],roof_extent_from_seat=532.5,primary_cantilever_each=332.5,
          purlin_rows=rows,tributaries=roof_trib,edge_cantilever=200,seats=roof_seats,cases=roof_cases,
          purlin=dict(section=[120,60,4],span=3245,source='SCI P3632015B-31;Hybox rounded properties Iy241/Iz81.2cm4,Wy40.1/Wz27.1cm3',
                full_UDL_M_bound=purlin_M,biaxial_elastic_stress=purlin_M*1e6*(cosroof/40100+math.sin(pitch)/27100),
                full_UDL_service_vertical_mm=purlin_delta,L250=3245/250,
                limit='Two-axis section/deflection screen; actual postpoints, cleats, torsion, buckling, bracing and corner jacks not qualified.'),
          collector=dict(status='Constructive roofpoint bypass proposal; not adopted or a completed ring joint',section=collector_sec,
                top=6680,bottom=6540,ordinary_core=140,projection_each=60,
                steel='2H12top and2H12bottom;H6/75;25cover',clear_window_max=1000,seats_each=300,axis_span=1300,
                M=collector_M,V=collector_V,upper_window_ring_extrados=6515,ring_clearance=25,
                plate=[140,240,12],mineral_grout=10,top_of_plate=6702,
                primary_under_at_support=mat_roof['primaryCentre']-40/cosroof,
                links=links(260,103,6,75),
                SLS_phi3_point_bound_mm=beam_SLS_bound(.26*.14*25,0,3*1.55*4.65/2,1.5*1.55*4.65/2,1.3,collector_sec),
                SLS_shrink300_mm=300e-6/140*1300**2/8,
                scope='No eccentric roofpoint assigned directly to an upperwindow arch. Actual pier bearing/cage continuity, plate/hold-down and lateral ring joints remain intrinsic work. Ordinary6550ceiling local15lining underside6525 means25drop; protected6444 hides beam.'),
          remaining=['Corner jack/topology and complete bearing/hip/crown/tie joints','Actual gravity mass ledger including ceiling versus Gmax/Gmin',
                     'Roof collector pier bearing and continuous lateral/hold-down connections','Actual normal/tangential site wind, snow and load patterns',
                     'Mechanical/thermal/fire/weather support admission; no roof storage'])

# Lower north circular arches, actual repaired HAD geometry and upperwindows.
# The mean-line hinge radius gives true circular equilibrium, not an ideal
# parabolic H=qL^2/8f used as a ring-capacity assertion.
def north_arch_controls(n=1600):
    Ri=2.1253333333333333;Rm=Ri+.1075;Ro=Ri+.215;zc=.7246666666666667
    angle=math.asin(1.48/Ri);a=Rm*math.sin(angle);ys=zc+Rm*math.cos(angle);f=zc+Rm-ys;L=2*a
    dx=L/n;xs=[-a+(i+.5)*dx for i in range(n)]
    own=[22*.215**2*Rm/math.sqrt(Rm**2-x*x)*dx+
         22*.215*(3.17-zc-math.sqrt(Ro**2-x*x))*dx for x in xs]
    answer={}
    for side in ['outer-north','court-north']:
        wins=[o for o in had['openings']['FIRST'] if o['wall']==side and 4520<o['centre']<7480]
        for mode in ['self','gross-upper','actual-window-arch-transfer','rejected-central-roofpoint']:
            loads=list(zip(xs,own));heads=[]
            for o in wins:
                # The source upper1000/rise300 geometry. Head/spandrel vertical
                # weight is delivered to its two mean-ring springing lines.
                uR=(o['width']/2000)**2/(2*.3)+.3/2;um=uR+.1075
                aa=um*(o['width']/2000)/uR
                heads.append(dict(c=(o['centre']-6000)/1000,half=o['width']/2000,R=uR,
                                  zc=2.55-math.sqrt(uR*uR-(o['width']/2000)**2),a=aa,W=0))
            if mode!='self':
                for x in xs:
                    h=next((h for h in heads if abs(x-h['c'])<=h['a']),None)
                    if mode=='gross-upper' or h is None:base=3.1
                    else:
                        r=abs(x-h['c']);base=.75 if r<=h['half'] else 2.55
                        top=h['zc']+math.sqrt(h['R']**2-r*r) if r<=h['half'] else 2.55
                        h['W']+=20*.14*(3.1-top)*dx
                    loads.append((x,20*.14*base*dx))
                if mode!='gross-upper':
                    for h in heads:loads.extend([(h['c']-h['a'],h['W']/2),(h['c']+h['a'],h['W']/2)])
            # The collector itself spans FIRST windows. Its own UDL therefore
            # reaches this lower arch through its actual1300 bearing-axis span,
            # not through the window void. Preserve force AND first moment when
            # replacing each span's UDL by its two bearing reactions.
            cw=.26*.14*25
            collector_transfers=[dict(c=(o['centre']-6000)/1000,
                                     lo=(o['centre']-6000)/1000-.65,
                                     hi=(o['centre']-6000)/1000+.65,
                                     RA=cw*.65,RB=cw*.65) for o in wins]
            collector_loads=[]
            for x in xs:
                segments=[(x-dx/2,x+dx/2)]
                for t in collector_transfers:
                    pieces=[]
                    for lo,hi in segments:
                        if hi<=t['lo'] or lo>=t['hi']:pieces.append((lo,hi))
                        else:
                            if lo<t['lo']:pieces.append((lo,t['lo']))
                            if hi>t['hi']:pieces.append((t['hi'],hi))
                    segments=pieces
                collector_loads.extend(((lo+hi)/2,cw*(hi-lo)) for lo,hi in segments)
            for t in collector_transfers:
                assert -a<t['lo']<t['hi']<a
                collector_loads.extend([(t['lo'],t['RA']),(t['hi'],t['RB'])])
            assert math.isclose(sum(p for x,p in collector_loads),cw*L,rel_tol=1e-12)
            assert abs(sum(x*p for x,p in collector_loads))<1e-10
            loads.extend(collector_loads)
            loads=[(x,1.35*p) for x,p in loads]
            if mode=='rejected-central-roofpoint':loads.append((0,collector_P))
            W=sum(p for x,p in loads);RB=sum(p*(x+a)/L for x,p in loads);RA=W-RB
            H=(RA*a-sum(p*(-x) for x,p in loads if x<0))/f;cuts=[]
            for k in range(1,400):
                x=-a+L*k/400;y=zc+math.sqrt(Rm**2-x*x)-ys
                V=RA-sum(p for xp,p in loads if xp<=x)
                theta=math.atan(-x/math.sqrt(Rm**2-x*x));N=H*math.cos(theta)+V*math.sin(theta)
                M=RA*(x+a)-sum(p*(x-xp) for xp,p in loads if xp<x)-H*y
                e=M/N;comp=3*(.215/2-abs(e))
                pressure=(N/(.215*.215)*(1+6*abs(e)/.215) if abs(e)<=.215/6
                          else (2*N/(.215*comp) if comp>0 else None))
                cuts.append(dict(x=x,N=N,M=M,e=e,ULS_peak_MPa=None if pressure is None else pressure/1000))
            worst=max(cuts,key=lambda c:abs(c['e']))
            answer[side+'/'+mode]=dict(W=W,RA=RA,RB=RB,H=H,max_abs_e=abs(worst['e']),worst_cut=worst,
                    kern=.215/6,half_ring=.215/2,
                    load_basis='ULS1.35G; adverse centralpoint uses actual roof ULSP separately',
                    ULS_required_compression_MPa=(None if any(c['ULS_peak_MPa'] is None for c in cuts)
                         else max(c['ULS_peak_MPa'] for c in cuts)),
                    pier_vertical_eccentricity=1.58625-a,pier_tie_vertical_offset=ys-2.2,
                    pier_moments_absolute_sum=dict(west=abs(H*(ys-2.2))+abs(RA*(1.58625-a)),
                                                   east=abs(H*(ys-2.2))+abs(RB*(1.58625-a))),
                    pier_M_absolute_sum=max(abs(H*(ys-2.2))+abs(R*(1.58625-a)) for R in [RA,RB]),
                    upperwindow_heads=heads,collector_weight_transfer=collector_transfers)
    return dict(Ri=Ri,Rm=Rm,Ro=Ro,hinge_span=L,hinge_z=ys,rise=f,tie_z=2200,tie_visible=[2175,2225],
                raw_jambs=[4520,7480],RC_pier=[212.5,215],axial_wrap=775,
                cases=answer,limit='Sampled unilateral compression equilibrium only; brick/mortar directional strength, shear/slip, actual windowhead joints/steel bypass, asymmetry, pier/plate/bore/cage and robustness remain internal/adoption work. No masonry ring pass.')
arches=north_arch_controls()
arches_fine=north_arch_controls(3200)
for key,c in arches['cases'].items():
    assert abs(c['H']-arches_fine['cases'][key]['H'])<.025
assert arches['cases']['court-north/rejected-central-roofpoint']['max_abs_e']>arches['cases']['court-north/rejected-central-roofpoint']['half_ring']
assert arches['cases']['court-north/actual-window-arch-transfer']['max_abs_e']>arches['cases']['court-north/actual-window-arch-transfer']['kern']
lower_pier_section=rc(215,212.5,173.5,2*area(12),25)
lower_pier_actions=[]
for side in ['outer-north','court-north']:
    a=arches['cases'][side+'/actual-window-arch-transfer']
    for pier,reaction in [('west',a['RA']),('east',a['RB'])]:
        N=reaction+collector_P+1.35*.2125*.215*3.17*25
        ring_M=a['pier_moments_absolute_sum'][pier]
        M=ring_M+collector_P*.03625+N*.020
        I=215*212.5**3/12;Pcr=math.pi**2*.25*E*I/3200**2/1000
        M/=1-N/Pcr
        lower_pier_actions.append(dict(side=side,pier=pier,ring_reaction=reaction,ring_M=ring_M,N=N,M=M,Pcr=Pcr,
            note='Coherent same-pier planar action budget: ringreaction/moment, roofpoint, RCself, absolute roofseat36.25ecc andminimum20ecc. Adjacent floor/wall tributaries and lateral effects remain to join. Not an all-house pier capacity.'))
arches['lower_pier_section_only']=lower_pier_section
arches['lower_pier_actions']=lower_pier_actions
arches['lower_pier_governing_M_case']=max(lower_pier_actions,key=lambda p:p['M'])
arches['tie_and_bore']=dict(rod_dia=30,thread='M30 reference stressarea561',fy_trial=200,gamma=1.1,
    tie_tension_max=max(arches['cases'][s+'/actual-window-arch-transfer']['H'] for s in ['outer-north','court-north']),
    rod_thread_yield_screen=561*200/1.1/1000,bore_dia=40,bore_axis_z=2200,bore_axis_NS=107.5,
    pier_vertical_bar_trial='4H12/H8;centres39/173.5EW and39/176NS',
    bore_to_vertical_bar_clear=68.5-20-6,near_bore_link_z=[2150,2250],bore_to_link_clear=50-20-4,
    plate=[150,150,15],plate_NS_centred=True,washer=[60,10],nut=[50,30],
    limit='Tension-section and geometric bore separation ONLY. Pierhead bar development below radial bevel, plate/concrete bearing/splitting, threads/end details, link/bore tolerance and thermalfire collars remain intrinsic/adoption work. No voussoir drilling.')
# Negative mechanism control for the actual ordinary roofpoint above an upper
# window. This is ring selfweight plus point, not a complete window loadcase;
# removing that point by a collector must be a real physical support change.
uRi=.5**2/(2*.3)+.3/2;uRm=uRi+.1075;ua=uRm*.5/uRi
uys=uRm*math.sqrt(1-(.5/uRi)**2);uf=uRm-uys;uL=2*ua
u_step=uL/1600
u_loads=[(-ua+(i+.5)*u_step,1.35*22*.215*.14*uRm/
          math.sqrt(uRm**2-(-ua+(i+.5)*u_step)**2)*u_step) for i in range(1600)]
u_loads.append((-.2225,collector_P))
uRB=sum(p*(x+ua)/uL for x,p in u_loads);uRA=sum(p for x,p in u_loads)-uRB
uH=(uRA*ua-sum(p*(-x) for x,p in u_loads if x<0))/uf;u_e=[]
for k in range(1,400):
    x=-ua+uL*k/400;y=math.sqrt(uRm**2-x*x)-uys
    V=uRA-sum(p for xp,p in u_loads if xp<=x);angle=math.atan(-x/math.sqrt(uRm**2-x*x))
    N=uH*math.cos(angle)+V*math.sin(angle)
    M=uRA*(x+ua)-sum(p*(x-xp) for xp,p in u_loads if xp<x)-uH*y
    u_e.append(abs(M/N))
roof['upper_window_eccentric_roof_control']=dict(raw_width=1000,rise=300,radial_ring=215,axial=140,
    point_ULS=collector_P,point_offset=-222.5,max_abs_e=max(u_e),half_ring=.1075,
    fails_trial_mechanism=max(u_e)>.1075,
    limit='Ring1.35selfweight+actualULSroofpoint, not fullwindow/spandrelcase. Exposes unsafe directpoint assumption; does not prove no alternative thrustline or masonry capacity. Selected collector must physically bypass point to real piers.')
assert roof['upper_window_eccentric_roof_control']['fails_trial_mechanism']

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
            actual_roof=roof,north_arches=arches,
            node_review_known_gaps=['Onlyenumeratedcageclearances;4leginnerlink/H12sidebarsmissing,coincidentEW/NStoprows,terminalmaintiedevelopmentandN-Mstrutfieldunearned.Specialistownsnextnodecorrection.'],
            fire_field_comparator=dict(thickness=200,outer_main_axis=31,reference_hs=60,reference_a=10,
                                       route='TCC linked2018StructuralFireDesign SlabsTable5 firstgeneration one-wayREI30 comparator ONLY',
                                       source='https://www.concretecentre.com/TCC/media/TCCMediaLibrary/Events/Online%20course/CCIP_HowToComp_Feb18.pdf',
                                       rating_qualified=False,holds='Current edition/UKNA,fireactions,supports,spalling,actualports/edges/seals'),
            retained_open_items=[
                'HAD finishedFaces/t corrected at owning source; actual cabinet/lining fit remains to reconcile.',
                'Roof/arch controls now calculated; finite corner jacks, collectors/lateral and actual joint/reaction destinations remain.',
                'Rear/east/transient WC ports must bind the complete services inventory, not the three-bore witness.',
                'HADa510 repairs wet-receiver door/window geography; new roofcollector projection still needs owning reconciliation.',
                'Wetjoint3H16downhooks/4H16pier: finite3Dclearance/development calculated; lowercolumnjoint remains.',
                'Frozen bee43378 and specialist adverse controls preserve actual failed node/cage duties; no joint PASS.',
                'Actual775 wrapped portal and2890loggia soffit are bound; pierhead, anchor and thermal/fire joins remain.',
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
txt(16,24,'HADa510f30c · RC200 whole upper floor · unadopted / incomplete support design, not for construction')
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
txt(304,175,'HAD27finishx2745.5–3059.5; new700northwindowstarts3350; HAD body geometry separate from structural admission.')

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
txt(12,22,'HADa510f30c / 27finish / 1094body +200well;1004betweenrails / unadopted; no body,guard or whole-house PASS')
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
for i,line in enumerate([f'Flightbearing2925, pitch{tg["pitchDegrees"]:.3f}°,170normalwaist.',
 f'Per1mM{stair_flight["M"]:.2f}/MR{stair_sec["MR"]:.2f}; eachend{stair_flight_reaction:.2f}kN.',
 f'Verticalwaistphi3+shrink{stair_vertical_phi3+stair_vertical_shrink:.3f} <{stair_span*1000/250:.3f}L/250;sec(pitch)bothterms.',
 f'Midbeam250×390/top1725/bottom1335,M{mid_M:.2f}.',
 f'WestR{mid_RL:.2f}/EastR{mid_RR:.2f};postN{mid_post_N:.2f}/M{mid_post_M:.2f}.',
 f'Continuoustrimmerpostreaction{long_reaction_max[1]:.2f}, nottwoindependentbays.',
 'WestH20horizN/Shooks→actualRC140sill;H12tie+2struts.',
 f'Actualmasonrypadsneedfd≥{sill_max_bearing:.3f}MPa beforesecondorder/bedadmission.',
 'EastH20/postcage and nominal waist/landing/headerpaths enumerated.',
 'Guardposts/anchors,fullphysicalslabedge/portmass andwindow25jointunearned.']):txt(215,45+i*8,line)
txt(215,125,'170control8.624 / adverse165+creep+shrink10.312; nominaljointdetail on companion sheet.')
txt(215,134,'C / PROJECTED FLIGHT SECTIONS · 1:30','title')
fx=lambda y:220+(y-4332.5)/30
fz=lambda z:264-z/30
box(fx(4232.5),fz(3370),200/30,300/30,'#c5cfca')
box(fx(7132.5),fz(1725),250/30,390/30,'#c5cfca')
box(fx(7132.5),fz(1725),(8922.5-7132.5)/30,200/30,'#d9e2de')
box(fx(7382.5),fz(1525),200/30,50/30,'#c5cfca')
for direction,first_y,base,colour in [(1,4432.5,0,'#4b716c'),(-1,7132.5,1725,'#b4753c')]:
    pts=[]
    for i in range(10):
        y=first_y+direction*300*i;z=base+172.5*(i+1)
        if i:pts.append((fx(y),fz(z-172.5)))
        pts.append((fx(y),fz(z)))
    parts.append('<path d="M'+' L'.join(f'{x:.3f},{y:.3f}' for x,y in pts)+f'" fill="none" stroke="{colour}" stroke-width=".7"/>')
    y0=first_y;y1=first_y+direction*2700;drop=stair_waist/math.cos(stair_angle)
    ln(fx(y0),fz(base-drop),fx(y1),fz(base+1552.5-drop),colour)
txt(215,277,'Greenlower/ochreupperprojected; differentxterritories, notoverlappingflights.')
txt(12,289,'ONEcurrentcandidate: actualwaist/beamgeometry, tributaryloadsandcontinuouscompatibility. Frozen rejected node evidence preserved; no foundation release.')
parts.append('</svg>\n');stair_svg='\n'.join(parts)
parts=['<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297">',
       '<style>text{font-family:DejaVu Sans,sans-serif;fill:#243a44;font-size:2.9px}.title{font-size:4.3px;font-weight:bold}</style>',
       '<rect width="420" height="297" fill="#faf8f1"/>']
txt(12,13,'STAIR / actual nominal flight–landing–header bar paths','title')
txt(12,23,'170normal waist / 390midbeam / 250local landing patch / c25 and21independentbar clear / not construction release')
def stair_profile(x0,y0,which,title):
    txt(x0,y0,title,'title')
    fy=lambda y:x0+(y-(3400 if which=='H' else 6900))/8
    top=3370 if which=='H' else 1725
    fz=lambda z:y0+13+(top-z)/8
    clip='profile'+which
    parts.append(f'<defs><clipPath id="{clip}"><rect x="{x0}" y="{y0+8}" width="190" height="54"/></clipPath></defs>')
    if which=='H':
        y1,y2=4432.5,4920
        z1,z2=3277.5,3277.5-math.tan(stair_angle)*(y2-y1)
    else:
        y1,y2=6900,7132.5
        z2=1552.5 if which=='L' else 1725
        z1=z2-math.tan(stair_angle)*(y2-y1)*(1 if which=='L' else -1)
    drop=170/math.cos(stair_angle)
    polygon=[(fy(y1),fz(z1)),(fy(y2),fz(z2)),(fy(y2),fz(z2-drop)),(fy(y1),fz(z1-drop))]
    parts.append(f'<polygon clip-path="url(#{clip})" points="'+ ' '.join(f'{x:.3f},{y:.3f}' for x,y in polygon)+'" fill="#e2e8e2" stroke="#345460" stroke-width=".35"/>')
    if which=='H':
        box(fy(3400),fz(3370),(4432.5-3400)/8,200/8,'#e2e8e2')
        box(fy(4232.5),fz(3170),200/8,100/8,'#bccbc2')
        bars=[b for b in header_waist if b['id'] in ['HB1','HT1']]
        for b in header_main:
            xx,yy,zz=b['points'][0]
            parts.append(f'<circle cx="{fy(yy):.3f}" cy="{fz(zz):.3f}" r="{b["dia"]/16}" fill="#5b7671"/>')
        for z in [3201,3339]:ln(fy(3450),fz(z)+1.6,fy(4200),fz(z)+1.6,'#b4753c')
        txt(x0,y0+63,'HeaderRC3070..3370; receiving slab3170..3370.')
        txt(x0,y0+71,'H12floor laps750 at+34EWoffset; localEWtopH16/200.')
    else:
        box(fy(7132.5),fz(1725),250/8,390/8,'#bccbc2')
        box(fy(7382.5),fz(1725),200/8,250/8,'#cdd8cf')
        box(fy(7582.5),fz(1725),(8400-7582.5)/8,200/8,'#e2e8e2')
        bars=[b for b in mid_waist if b['id'] in [which+'B1',which+'T1']]
        for z in [1378,1650]:
            for yy in [7217.5,7297.5]:
                parts.append(f'<circle cx="{fy(yy):.3f}" cy="{fz(z):.3f}" r="{(20 if z==1378 else 10)/16}" fill="#5b7671"/>')
        for z in [1555,1683]:ln(fy(7525),fz(z)+1.6,fy(8300),fz(z)+1.6,'#b4753c')
        txt(x0,y0+72,'Top1725; beam1335 / patch1475 / ordinary landing1525.')
        txt(x0,y0+80,'H12fillets:240internal mandrel; landingH10laps750.')
    parts.append(f'<g clip-path="url(#{clip})">')
    for b in bars:
        pts=b['points'];d='M'+' L'.join(f'{fy(y):.3f},{fz(z):.3f}' for x,y,z in pts)
        parts.append(f'<path d="{d}" fill="none" stroke="{"#9d4e48" if "B" in b["id"] else "#b4753c"}" stroke-width="1.5"/>')
    parts.append('</g>')
    txt(x0,y0+88,'Profile1:8. Orthogonal bars are circles; lap offset is EW, not vertical.')
stair_profile(12,37,'L','A / LOWER FLIGHT → MIDLANDING')
stair_profile(220,37,'U','B / UPPER FLIGHT → MIDLANDING')
stair_profile(12,151,'H','C / UPPER FLIGHT → FIRST FLOOR')
txt(220,151,'D / NOMINAL CHECKS AND BOUNDARIES','title')
for i,t in enumerate([
    f'MIDminclear{min(v["clear"] for v in mid_incoming_clear):.3f}; HEADER{min(v["clear"] for v in header_incoming_clear):.3f}mm.',
    'Landing/headerlap minima22.900/21.900; cover25.000.',
    'Smallest21.527 leaves0.527 over21: placement NOT qualified.',
    f'H12benddemand{mandrel12:.1f}<240; fullfy lap{lap_lbr:.1f}<750.',
    f'LandingH10forcebound{lap_transfer:.2f}<34.15kN/bar.',
    f'NorthH10end115≥{end_lbd:.0f}required at declared demand.',
    f'LandingSLS{landing_delta+landing_shrink:.3f}<6.380mm, phi3+300micro.',
    'FirstEWmidstirrup548 is beyond curved westH20 hook.',
    'OwnH20/H8straightbottom contact intentional; no curved contact.',
    'Open: header ends, groundtoe, guard, exposure/fire and tolerances.'
]):txt(220,164+8*i,t)
txt(12,280,'Paths are the actual calculation polylines, not generic reinforcing symbols. All elevations absolute; steps/finished noses held.')
txt(12,289,'ONE developing stair proposition; no blanket joint, stair, foundation or whole-house PASS follows from nominal path checks.')
parts.append('</svg>\n');stair_joint_svg='\n'.join(parts)
parts=['<svg xmlns="http://www.w3.org/2000/svg" width="594mm" height="420mm" viewBox="0 0 594 420">',
       '<style>text{font-family:DejaVu Sans,sans-serif;fill:#243a44;font-size:3.1px}.title{font-size:4.5px;font-weight:bold}</style>',
       '<rect width="594" height="420" fill="#faf8f1"/>']
txt(12,16,'ROOF / NORTH ARCH · SOURCE-BOUND DEVELOPMENT · NO WHOLE-HOUSE OR COMPONENT RELEASE','title')
txt(12,24,'HADa510f30c + MATf376a8a7 · 7100 wallline eave / 200 overhang / 500.7 NORMAL recipe · STR-HOUSE incomplete')
txt(12,37,'A / DISJOINT ROOF LOAD REGIONS · PLAN1:100','title')
px=lambda x:24+x/100;py=lambda y:177-y/100
box(px(-200),py(12200),124,124,'#dfd5be')
box(px(4450),py(7550),31,31,'#faf8f1')
for x,y,w,h in [(4450,7550,3100,4650),(4450,-200,3100,4650),(-200,4450,4650,3100),(7550,4450,4650,3100)]:
    box(px(x),py(y+h),w/100,h/100,'#c7d9d4')
for s in roof_seats:box(px(s['xy'][0])-1,py(s['xy'][1])-1,2,2,'#b85c40' if s['opening_below'] else '#345460')
for x,y,xx,yy in [(332.5,332.5,3917.5,3917.5),(11667.5,332.5,8082.5,3917.5),
                  (332.5,11667.5,3917.5,8082.5),(11667.5,11667.5,8082.5,8082.5)]:ln(px(x),py(y),px(xx),py(yy),'#9a7654')
for i,t in enumerate(['4central strips14.415m² each +4corner squares21.6225m² each.',
                      'Sum144.15m²; retained physical edges−200/12200 and4450/7550.',
                      'RedordinaryseatsoverFIRSTwindows require roofcollector.',
                      'Corner diagonal lines are ACTION ENVELOPES, not earned jackframes.']):txt(12,194+7*i,t)
txt(202,37,'B / ACTUAL NORTH STRIP · SECTION1:30','title')
sx=lambda y:208+(y-7550)/30;sz=lambda z:186-(z-6200)/30
weather=lambda y:7100+min(12000-y,y-7750)*math.tan(pitch)
for a,b in [(7550,9875),(9875,12200)]:
    ln(sx(a),sz(weather(a)),sx(b),sz(weather(b)),'#976938')
    aa=max(a,7750);bb=min(b,12000)
    ln(sx(aa),sz(weather(aa)-(500.7-40)/cosroof),sx(bb),sz(weather(bb)-(500.7-40)/cosroof),'#345460')
    ln(sx(aa),sz(weather(aa)-(420.7+120)/cosroof),sx(bb),sz(weather(bb)-(420.7+120)/cosroof),'#758c85')
for y in [8082.5,11667.5]:
    box(sx(y)-4,sz(6680),8,140/30,'#bdc9c2')
    box(sx(y)-2.333,sz(6702),4.666,12/30,'#345460')
ln(sx(8082.5),sz(mat_roof['primaryCentre']),sx(11667.5),sz(mat_roof['primaryCentre']),'#a15f46')
ln(sx(8167.5),sz(6620),sx(11582.5),sz(6620),'#6f728a')
ln(sx(8167.5),sz(6444),sx(11582.5),sz(6444),'#6f728a')
for i,t in enumerate(['Roofextent532.5 = primary332.5 + secondary200 beyond purlins.',
                      'Primarycentre6746.721; tie6721.721–6771.721.',
                      'Purlinunderside6658.451 ATSEAT; ceilingTOP6620,38.451reserve.',
                      'Ceiling6444–6620 only in actual protected territory, outside tips lower.',
                      f"ULS per ordinaryseat{collector_P:.3f}kN; tie{roof_cases['ULS-down']['ordinary_frame']['tie']:.3f}kN.",
                      'Collector260×140,6540–6680;25 above windowring6515.',
                      '10mineral bed+12plate→6702; actual cleat/hold-down unearned.']):txt(202,194+7*i,t)
txt(399,37,'C / ACTUAL NORTH PORTAL · XZ1:20','title')
ax=lambda x:400+(x-4250)/20;az=lambda z:182-(z-2100)/20
Ri=arches['Ri']*1000;Ro=arches['Ro']*1000;alpha=math.asin(1480/Ri);zc=724.6666666667
inner=[(ax(6000+Ri*math.sin(-alpha+2*alpha*i/120)),az(zc+Ri*math.cos(-alpha+2*alpha*i/120))) for i in range(121)]
outer=[(ax(6000+Ro*math.sin(alpha-2*alpha*i/120)),az(zc+Ro*math.cos(alpha-2*alpha*i/120))) for i in range(121)]
parts.append('<polygon points="'+' '.join(f'{x:.3f},{y:.3f}' for x,y in inner+outer)+'" fill="#d7b08b" stroke="#976938" stroke-width=".4"/>')
for pts in [[(4307.5,2100),(4520,2100),(4520,2250),(4370.282309,2404.303639),(4307.5,2404.303639)],
            [(7480,2100),(7692.5,2100),(7692.5,2404.303639),(7629.717691,2404.303639),(7480,2250)]]:
    parts.append('<polygon points="'+' '.join(f'{ax(x):.3f},{az(y):.3f}' for x,y in pts)+'" fill="#bdc9c2" stroke="#345460" stroke-width=".4"/>')
ln(ax(4307.5),az(2200),ax(7692.5),az(2200),'#a15f46')
for x in [4307.5,7692.5]:box(ax(x)-.375,az(2275),.75,7.5,'#345460')
for i,t in enumerate(['215radial×215axial brickring;775 including facewrap (not shown).',
                      'RC212.5×215 ends at RADIALSKEWBACK; no RC through ring.',
                      'Tie2200/50envelope2175–2225;formed40bore, no voussoirdrill.',
                      'Central head2285court/2327.5garden; 127.152 tie/hinge offset.',
                      'Court windowhead-transfer e exceeds kern, but remains inside ring.',
                      'Required compression is a DEMAND, not masonry strength acceptance.',
                      'Pierhead anchorage/plate splitting/thermalcollars remain internal work.']):txt(399,194+7*i,t)
txt(12,266,'D / ACTIONS AND EXPLICIT LIMITS','title')
for i,(key,c) in enumerate(arches['cases'].items()):
    pressure='OUTSIDE RING' if c['ULS_required_compression_MPa'] is None else f"requiredp{c['ULS_required_compression_MPa']:.3f}MPa"
    txt(12,276+6*i,f"{key}: H{c['H']:.2f}kN / e{1000*c['max_abs_e']:.1f}mm / {pressure}")
txt(12,338,'The central-roofpoint case is rejected; actual roofpoints use the collector/endpier proposal.')
for i,t in enumerate(['Corner square collapse is a support-action ceiling, not a proof of actual jack/cantilever members or loadsharing.',
                      'Uppercollector: gravity section screen only; continuous loops, pier reactions, hold-down and lateral closures still to earn.',
                      'Lowerarches: actual courtwindows create point reactions; gross uniform masonry cannot replace that transfer.',
                      'Known400pilejoint remains rejected; D1300 is only the earlier conditional connected-foundation concept.',
                      'Stair11.166/11.700mm sensitivity leaves0.534mm; actual tolerances, creep and finishes require qualification.']):txt(12,355+7*i,t)
txt(12,407,'Reproduce: python project/str/studies/open-loggia-support.py --check · No construction, geometry adoption or STR-HOUSE completion.')
parts.append('</svg>\n');roof_arch_svg='\n'.join(parts)
for name,content in [('open-loggia-support.json',json.dumps(result,indent=2,allow_nan=False)+'\n'),('open-loggia-support.svg',main_svg),('open-loggia-node.svg',node_svg),('open-loggia-wet-joint.svg',joint_svg),('open-loggia-stair.svg',stair_svg),('open-loggia-stair-joint.svg',stair_joint_svg),('open-loggia-roof-arch.svg',roof_arch_svg)]:
    p=OUT/name
    if '--check' in sys.argv:
        if not p.exists() or p.read_text()!=content: raise SystemExit('STALE '+str(p))
    else:p.write_text(content)
print('OPEN-N support checkpoint: source pin, equilibrium/scaling, finite field and conditional member checks passed')
