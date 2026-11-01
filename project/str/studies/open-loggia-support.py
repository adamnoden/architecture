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
HAD_COMMIT='c83a06f26cf3b146d7cdc8254b4799f390508196'
HAD_SHA='bf98f77a4cc2a8704adf931ef469ceaf3228811dd666cf9250050d0c9d9b32c2'
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
          7622.5:[(7750,11667.5,'loggia-E')],2917.5:[(2650,8852.5,'return-and-trimmer')]}
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
wet_G=7.5*wet_trib+.14*3.1*20+.14*.15*25
wet_Q=2*wet_trib
wet_section=rc(140,350,310,2*area(18),25)
wet_action=udl(1.35*wet_G+1.5*wet_Q,2.815)
wet_links=links(140,310,6,100)
wet=dict(axis_x=2902.5,support_axes_y=[8852.5,11667.5],span=2815,
         top=3370,bottom=3020,finished_soffit=3005,upstand_above_FFL=0,
         tributary_width=wet_trib*1000,G=wet_G,Q=wet_Q,
         section=wet_section,action=wet_action,links=wet_links,
         south_receiving_core=[2832.5,8702.5,140,300],
         south_receiving_finished=[2817.5,8687.5,170,330],
         north_receiving_core=[2832.5,11517.5,140,300],
         door_edge_x=3100,north_window_edge_x=3050,
         south_pier_projection_beyond_140_wall_each_side=80,
         actual_receiving_pier_material='RC140x300 trial, not an assumed masonry capacity',shear_links_required=wet_action['V']>wet_section['VRdc'],
         resolved=False)
wet['fully_cracked_phi3_deflection_mm']=cracked(140,350,310,wet_section['As'],wet_G,wet_Q,2.815,3)
wet['differential_shrinkage_300microstrain_mm']=300e-6/350*2815**2/8
wet['L250_comparator_mm']=2815/250
assert wet_action['M']<wet_section['MR'] and wet_section['ductility']
assert wet_action['V']<min(wet_links['VRs'],wet_links['VRmax'])

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
 dict(id='wet-S',xy=[2902.5,8852.5],point_ULS=wet_action['V']),
 dict(id='wet-N',xy=[2902.5,11667.5],point_ULS=wet_action['V']),
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
         head_stress_MPa=cap_N*1000/area(400),concrete_node_limit_MPa=.528*17,
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
assert cap['head_stress_MPa']<cap['concrete_node_limit_MPa']
assert cap_tie<cap['tie_resistance_kN']
assert cap['available_straight_development_mm']>cap['full_yield_bond_length_mm']
cap['per_bar_force_kN']=cap_tie/4
cap['required_mandrel_mm']=cap['per_bar_force_kN']*1000*(1/50+1/(2*20))/17
assert cap['required_mandrel_mm']<=330
for v in cap['pile_vertical_bar_centres']:
    assert min(abs(v[0]-q) for q in cap['bottom_bar_positions_in_600'])>=41
    assert min(abs(v[1]-q) for q in cap['bottom_bar_positions_in_600'])>=41

def circle_NM(Ntarget,angle_deg,bar_dia=22,nstrip=400):
    """Actual8bar circular section; resultant capacity for curvature angle.
    Parabolic-rectangular concrete, displaced concrete subtracted at steel.
    Returns BOTH moment components: no fictitious rotation of an axisymmetric cage.
    """
    R=200;rs=R-40-8-bar_dia/2;phi=math.radians(angle_deg)
    bars=[(rs*math.cos(math.radians(22.5+45*i)),rs*math.sin(math.radians(22.5+45*i))) for i in range(8)]
    def stress(e):return 0 if e<=0 else 17 if e>=.002 else 17*(1-(1-e/.002)**2)
    def calc(c):
        dz=400/nstrip;N=Mn=0
        for k in range(nstrip):
            z=(k+.5)*dz;y=R-z
            F=stress(.0035*(c-z)/c)*2*math.sqrt(max(0,R*R-y*y))*dz
            N+=F;Mn+=F*y
        Mx=Mn*math.cos(phi);My=Mn*math.sin(phi)
        for x,y in bars:
            z=R-(x*math.cos(phi)+y*math.sin(phi));e=.0035*(c-z)/c
            s=max(-500/1.15,min(500/1.15,200000*e))
            F=area(bar_dia)*(s-stress(e))
            N+=F;Mx+=F*x;My+=F*y
        return N/1000,Mx/1e6,My/1e6
    lo,hi=1,2000
    for _ in range(50):
        c=(lo+hi)/2
        if calc(c)[0]<Ntarget:lo=c
        else:hi=c
    N,Mx,My=calc((lo+hi)/2)
    return dict(N=N,Mx=Mx,My=My,curvature_angle=angle_deg,c=(lo+hi)/2)

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
cap['pile_bar_development']=dict(bar='H22',full_yield_straight_required=22/4*(500/1.15)/3,
                                  proposed_horizontal_straight_after_bend=850,
                                  internal_mandrel=440,centreline_radius=231,
                                  bend_start_heights_above_pilehead_cutoff=[0,50],
                                  horizontal_layers_above_regular_node_bottom=[281,331],
                                  receiver_arms='At least2 actual full-height arms;600wide development zones for1250 from nodecentre, no bar anchored into lowtie alone.',
                                  terminal_routing='Eight starters assigned4peravailablearm with two horizontal layers; actual node-by-node routes/congestion still to verify.',
                                  no_anchorage_acceptance=True)
cap['pile_bar_development']['full_yield_bend_force_kN']=area(22)*(500/1.15)/1000
cap['pile_bar_development']['required_mandrel_at_ab50_mm']=area(22)*(500/1.15)*(1/50+1/44)/17
assert cap['pile_bar_development']['required_mandrel_at_ab50_mm']<440
assert cap['pile_bar_development']['full_yield_straight_required']<850
cap['pile_bar_development']['rebar_layers_mm_regular_node']=dict(bottom_EW=60,bottom_NS=80,
                                                                 pile_horizontal=[281,331],top_beam=392)
assert 392-331-(10+11)>=20
assert 331-281-22>=20
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
long_line=(1.35*7.5+1.5*2)*.5+1.35*(.2*.15*25+1.0)
long_spans=[udl(long_line,L) for L in [2.8,1.72]]
stair_angle=math.atan2(1.725,2.7)
stair_G=.15/math.cos(stair_angle)*25+.1725/2*25+.9
stair_flight=udl(1.35*stair_G+1.5*3,2.7)
stair_flight_reaction=stair_flight['V']*1.1
# Header is supported by outer AND court walls, not by its own hanging trimmer.
header_L=3.585
header_points=[(long_spans[0]['V']+return_reaction,(2917.5-332.5)/1000),
               (stair_flight_reaction,(2267.5-332.5)/1000)]
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
           long_trimmer=dict(axis_x=2917.5,y_supports=[4332.5,7132.5,8852.5],spans=long_spans,section=rc(200,350,310,2*area(16),25),links=links(200,310,6,100)),
           stair_header=dict(axis_y=4332.5,x_supports=[332.5,3917.5],points=header_points,
                             M=header_M,reactions=[header_RL,header_RR],section=header_sec,links=header_link,
                             footprint=[262.5,4232.5,3725,200],
                             top=3370,bottom=3070,finished_soffit=3055,
                             west_window_arch_rewind=dict(centre_y=4600,from_spring=2550,to_spring=2450,from_crown=2850,to_crown=2750,
                                                           ring=215,actual_patch=[4232.5,4432.5],seat=3060,min_reserve=113.157316509265)),
           stair=dict(risers=20,rise=172.5,going=300,landing_depth=1635,flight_clear_width=1100,
                      waist=150,waist_section=rc(1000,150,109,area(12)*1000/125,25),
                      G=stair_G,Q=3,flight_action=stair_flight,flight_end_reaction=stair_flight_reaction,
                      midlanding_post_core=[2817.5,7007.5,250,250],
                      finished_gallery_remaining=750,
                      actual_midlanding_EWbeam_and_post_design_pending=True),
           NE_return=dict(original_endpoint=7750,required_endpoint=7552.5,overlap_core=[7552.5,7692.5],
                          reason='Full140 material junction to loggia core; source rewind required, no57.5void.'))
for a in long_spans:
    assert a['M']<frame['long_trimmer']['section']['MR']
    assert a['V']<frame['long_trimmer']['links']['VRs']

# Wet-beam RC piers: conditional second-order screen with no favourable masonry
# stiffness. Pinned3200,0.25EcIg, minimum20 eccentricity, no primary lateral role.
pier_N=wet_action['V']+1.35*.14*.3*3.2*25
pier_I=300*140**3/12
pier_Pcr=math.pi**2*(E*.25)*pier_I/3200**2/1000
pier_amp=1/(1-pier_N/pier_Pcr)
pier_M=pier_N*.02*pier_amp
pier_sec=rc(300,140,103,2*area(12),25)
pier_NR=.6*17*(140*300-4*area(12))/1000
wet['receiving_pier_check']=dict(core=[140,300],height=3200,steel='4H12;H6/100 closed links',
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
grid['width_reason']='Uniform600 prototype keeps all eight H22 pile starters inside real full-height arms; no hidden850mm development into250 or lowtie arms. This is a material/cost/thermal price, not an optimised site foundation.'
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
            lower_grid=grid,cap=cap,special_ground_nodes=special_nodes,finite_floor_frame=frame,E02_service_port=port,
            fire_field_comparator=dict(thickness=200,outer_main_axis=31,reference_hs=60,reference_a=10,
                                       route='TCC linked2018StructuralFireDesign SlabsTable5 firstgeneration one-wayREI30 comparator ONLY',
                                       source='https://www.concretecentre.com/TCC/media/TCCMediaLibrary/Events/Online%20course/CCIP_HowToComp_Feb18.pdf',
                                       rating_qualified=False,holds='Current edition/UKNA,fireactions,supports,spalling,actualports/edges/seals'),
            retained_open_items=[
                'HAD finishedFaces/t corrected at owning source; actual cabinet/lining fit remains to reconcile.',
                'Corner collectors and finite field edges now calculated. Actual midlanding/post, entrance bridge, tied arches and roof remain to complete.',
                'Rear/east/transient WC ports must bind the complete services inventory, not the three-bore witness.',
                'Wet-wall beam receiving RC piers project80 beyond original wall faces; HAD must check actual door/sofa tasks.',
                'Wetbeam2H18/pier4H12 jointbar clash remains: separate section strength is NOT a passed3Djoint.',
                'Integral600node S&T/cage model replaces900caps; terminal cages, actual pilehead/group/lateral/uplift and DPC/floor moisture remain to verify.',
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
txt(16,24,'HADc83a06f2 · RC200 whole upper floor · unadopted / incomplete support design, not for construction')
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
txt(304,55,'2H18 bottom,2H10 top,H6/100; total350, z3020–3370; lined soffit3005, NO doorway upstand.')
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
txt(304,207,'RC600×450 both leaves;40cover;3H20 top/bottom+sideH12;4legH8/100;actual point nodes.')
txt(304,215,f"M{grid_action['M']:.2f}/MR{grid_section['MR']:.2f}; V{grid_action['V']:.2f}/VRs{grid_links['VRs']:.2f}.")
txt(304,223,'Top−180/bottom−630;integral600×600×450 node/400pilehead;5H20eachdirectioncontinue750.')
txt(304,231,f"Node envelopeN{cap_N:g}/M100;tie{cap_tie:.1f}kN vssteel{cap['tie_resistance_kN']:.1f};pile/soilUNKNOWN.")
txt(304,239,'Lowtie/localnode−750 controlsD1300:750+H300+loss50+vent150=1250;50surplus.')
txt(304,247,'Masonry DPC ABOVE grid −180..−30 is a deliberate hypothesis; concrete/floor moisture route unqualified.')
txt(304,255,'No900cap/deckoverlap. Drainedtrayroute required;225clearcavity isNOTclaimed overwidebeam.')

txt(304,280,'D / E02 SERVICE ARCH GEOMETRY ONLY','title')
txt(304,291,'Plant-north y6500, x10800;240clear semicircle, spring2740/rise120/ring215.')
txt(304,299,'Extrados3075 leaves95 to slabsoffit3170;447.5 east abutment territory is NOT capacity.')
txt(304,307,'Actual pipe/socket,bends, ties, ring actions and downstream high-level branch still to join.')
txt(16,350,'WORK STILL TO DO','title')
for i,t in enumerate(result['retained_open_items']):txt(16,361+i*6,t)
txt(16,410,'REPRODUCIBLE CONDITIONAL DESIGN / calculations, exact source pins and adverse controls accompany every resistance. No programme completion claimed.')
parts.append('</svg>\n')
main_svg='\n'.join(parts)
parts=['<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297">',
       '<style>text{font-family:DejaVu Sans,sans-serif;fill:#243a44;font-size:3.1px}.title{font-size:4.6px;font-weight:bold}</style>',
       '<rect width="420" height="297" fill="#faf8f1"/>']
txt(14,14,'OPEN N / integral node, actual cage and N–M screen','title')
txt(14,23,'PROPOSED / no pile-soil or anchorage admission / actual bar coordinates, not a circularly smeared steel area')
txt(14,36,'A / 600 NODE PLAN · 1:3','title')
box(20,45,200,200,'#d9e2de')
parts.append('<circle cx="120" cy="145" r="66.6667" fill="none" stroke="#557f90" stroke-width=".5"/>')
for p in cap['bottom_bar_positions_in_600']:
    ln(20,45+p/3,220,45+p/3,'#b4753c')
    ln(20+p/3,45,20+p/3,245,'#8d6544')
for x,y in cap['pile_vertical_bar_centres']:
    parts.append(f'<circle cx="{20+x/3:.3f}" cy="{45+y/3:.3f}" r="3.6667" fill="#a34f4d"/>')
txt(20,253,'5H20 each direction:60/110/300/490/540; orthogonal planes60/80 above base.')
txt(20,260,'8H22 pile cage R141 at22.5+45k; minimum line/axis clearance checked.')
txt(20,267,'Brown: node bars / red: actual pile bars / blue:400 concrete pilehead.')
txt(242,36,'B / REPRESENTATIVE STARTERS · 1:4','title')
box(255,50,150,142.5,'#d9e2de')
box(280,180,100,65,'#c5cfca')
ln(255,162.5,405,162.5,'#8b9995')
ln(255,177.5,405,177.5,'#b4753c');ln(255,172.5,405,172.5,'#8d6544')
ln(255,64.5,405,64.5,'#b4753c')
parts.append('<path d="M316.5,245 L316.5,180 A57.75,57.75 0 0 0 258.75,122.25 L240,122.25" fill="none" stroke="#a34f4d" stroke-width="1.1"/>')
parts.append('<path d="M343.5,245 L343.5,167.5 A57.75,57.75 0 0 1 401.25,109.75 L415,109.75" fill="none" stroke="#a34f4d" stroke-width="1.1"/>')
txt(245,203,'Regular node450; local lowtie receiver570, bottom−750.')
txt(245,211,'H22 bend440 internal / centrelineR231; planes281/331.')
txt(245,219,'850 STRAIGHT after bend vs797 full-yield bond assumption.')
txt(245,227,'Actual arm/terminal route and all8starters still require review.')
txt(245,235,'Red depicts2representative routes; this is not a 3D shop drawing.')
txt(14,282,f"N samples0–850;curvature0–45/5degrees;min resultant{pile_min:.2f}kNm vs141.42; section screen ONLY.")
txt(14,290,'Lowtie/deck bearing, arch/frame/roof/ports and actual node/pile connection remain explicit duties; no joined or foundation pass.')
parts.append('</svg>\n')
node_svg='\n'.join(parts)
for name,content in [('open-loggia-support.json',json.dumps(result,indent=2)+'\n'),('open-loggia-support.svg',main_svg),('open-loggia-node.svg',node_svg)]:
    p=OUT/name
    if '--check' in sys.argv:
        if not p.exists() or p.read_text()!=content: raise SystemExit('STALE '+str(p))
    else:p.write_text(content)
print('OPEN-N support checkpoint: source pin, equilibrium/scaling, finite field and conditional member checks passed')
