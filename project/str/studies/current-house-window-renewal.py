"""A room-side temporary barrier and short controlled window/guard withdrawal."""
import hashlib
import json
import math
from itertools import product
from pathlib import Path
import sys

D=Path(__file__).resolve().parent
H=json.loads((D.parents[1]/'had/studies/water-replan.json').read_text())['model']
old_occurrence=D.parents[1]/'oas/studies/north-export-occurrence.json'
old_pad_source=D.parents[1]/'oas/studies/north-export-frame-access.mjs'
O=json.loads(old_occurrence.read_text())
frame=O['frame'];guard=O['guard']
assert frame['outsideX']==[1335,2265] and frame['outsideZ']==[885,2815] and frame['normal']==[290,430]
assert guard['outsideX']==[1360,2240] and [guard['bottom'],guard['top']]==[910,2790]
assert guard['normal']==[130,160] and guard['face']==50 and guard['massMaximumKg']==50
assert guard['boltXs']==[1375,2225] and guard['boltZ']==[2000,2100]
assert 'const pads=[1340,2210].flatMap(x=>[1250,2150].map(z=>[x,11710,z,50,30,100]));' in old_pad_source.read_text()
B=json.loads((D/'current-house-guard-bracket.json').read_text())
# The screen is installed from the occupied room while the original closed
# window AND permanent external guard remain in place. Four independent
# warm-side fixing sockets are below the external guard's high through-rods.
# Whole-window method retains the closed leaves and uses external release.
axes=[980.,2402.5];posts=[965.,2420.];levels=[950,1270];top=1200
room_q=[455,495];loads=[]
for x,P in product(posts,[-1.5,1.5]):
    f=(x-axes[0])/(axes[1]-axes[0]);support=[(1-f)*P,f*P]
    for i,reaction in enumerate(support):
        high=reaction*(top-levels[0])/(levels[1]-levels[0]);low=reaction-high
        loads.append({'post':i,'pointX':x,'point':P,'rows':[low,high]})
        assert abs(low+high-reaction)<1e-10 and abs(low*levels[0]+high*levels[1]-reaction*top)<1e-7
socket_load=max(abs(y) for a in loads for y in a['rows'])
span=axes[1]-axes[0];I=(40**4-34**4)/12
rail_stress=1500*span/4/(I/20);rail_deflection=1500*span**3/(48*200000*I)
# SFCP12060 (older manual designation SFCP1260): 17 OD, 60 deep,
# transverse 50x10 pin. Set the pin ALONG THE WALL. Its full 50 mm width
# must clear the actual longitudinal bars at the socket level. No lifting duty.
shared=__import__('runpy').run_path(str(D/'arch-link-schedule.py'))
intervals=[]
for x in axes:
    for z in levels:
        global_z=3450+z
        f=max(0,min(1,(global_z-4000)/1000))
        other=([262.5+850-105*f,262.5+950-135*f,262.5+600] if x==axes[0] else [2352.647059,2455.882353])
        clear=min(abs(x-p)-8.5-(10 if x==axes[0] else 8) for p in other)
        side='near' if x==axes[0] else 'opposite'
        pin=min(abs(x-p)-25-5-(10 if side=='near' else 8) for p in other)
        hoop=shared['clear'](side,[global_z],17)
        assert min(pin,hoop)>10,(side,z,pin,hoop)
        intervals.append({'socketX':x,'z':global_z,'barSurfaceNominal':clear,'afterTwo5':clear-10,'horizontalPinToLongitudinalAfterTwo5':pin-10,'socketToSharedClosedLinkAfterTwo5':hoop-10})
assert min(v['afterTwo5'] for v in intervals)>0
# Place the nearest H6/H10 hoop above and below the cast socket rather than
# passing the anchorage pin through an already-drawn link. Horizontal shell
# OD and horizontal pin both have to fit. The horizontal pin leaves 25 mm of
# axial reach each side at a deeper Y; copy no previous phase from guard rows.
# The two surfaces have different roles: the crosspin sits inside the tied
# cage while the tube penetrates the warm-side longitudinal layer only.
far_core=[2300,2505];edge=min(axes[1]-far_core[0],far_core[1]-axes[1])-5
assert edge>=1.5*60 and levels[1]-levels[0]-10>=5*60
mass_limit=25;Wbar=mass_limit*.00981
# No friction credit: finite bolt shear and the couple due to the 95 mm
# projection between RC face and barrier rail. Separate installation torque
# warning is not used to claim preload bearing against a hollow finish.
axial=1.25*(socket_load+Wbar*.095/.32)
shear=Wbar/2+.25 # vertical self-weight plus a local vertical component comparison
interaction=axial/5+shear/(5*.65)
assert interaction<1 and rail_stress<200/1.1
# Thermal and occupied price: face of cap can be flush with the existing
# 27 mm finish. A solid 27 mm steel packing sleeve bears on actual RC when
# the bracket is fitted. The removable rail lies beyond the closed frame's
# warm face. The near NW toilet/radiator make a mid-room generic clear area
# invalid, so report the actual shoulder approaches and mapped plan conflicts.
scene=[]
for face,centre in product(['south','north','west','east'],[1800,10200]):
    a,b=posts if centre==1800 else [12000-posts[1],12000-posts[0]]
    if face in ['south','north']:
        y,z=room_q if face=='south' else (12000-room_q[1],12000-room_q[0]);rect=(a,y,b,z)
    else:
        x,t=room_q if face=='west' else (12000-room_q[1],12000-room_q[0]);rect=(x,a,t,b)
    sill=next(o['sill'] for o in H['openings']['FIRST'] if o['wall']=='outer-'+face and o['centre']==centre)
    hits=[]
    for name,(x,y,w,h) in H['upperFurniture'].items():
        if min(x+w,rect[2])>max(x,rect[0]) and min(y+h,rect[3])>max(y,rect[1]):hits.append(name)
    heights={entry['id']:entry['topLocal'] for entry in H['architecturalServices']['emitters']}
    known={'principal-head':H['furnitureRequirements']['principalBed']['maxHeadHeight']}
    known.update({'service-emitter-'+key:value for key,value in heights.items()})
    unknown=[name for name in hits if name not in known]
    vertical={name:sill-20-known[name] for name in hits if name in known}
    socket_locations=[]
    for axis in axes:
        along=axis if centre==1800 else 12000-axis
        warm=429.5 if face in ['south','west'] else 12000-429.5
        sx,sy=(along,warm) if face in ['south','north'] else (warm,along)
        covered=[name for name,(xx,yy,ww,hh) in H['upperFurniture'].items() if xx<=sx<=xx+ww and yy<=sy<=yy+hh]
        socket_locations.append({'xy':[sx,sy],'furnitureAtFinishFace':covered})
    scene.append({'socketAccess':socket_locations,'panelToKnownTop':vertical,'unboundHeightAtPanel':unknown,'face':face,'centre':centre,'plan':rect,'panelBottom':sill-20,'panelTop':top,'planOverlaps':hits})
# The original interior L barrier has two 40 mm struts through the 88 mm
# grille gaps. Keeping that arrangement would require the 1640 mm frame draw.
# Independently supported internal screen leaves the entire outward path free.
# The ordinary guard point is the existing NW control. Its captured cradle
# clamps stay on its actual two side columns, not on seven 12 mm infill bars.
def box(x0,x1,q0,q1,z0,z1):return [x0,x1,q0,q1,z0,z1]
clip_parts=[]
for x,mast in [(1385,1450),(2215,2150)]:
    clip_parts.append(box(x-30,x+30,-390,175,890,910))
    clip_parts.append(box(mast-20,mast+20,65,105,910,2380))
    for z in [1400,2350]:
        clip_parts.append(box(min(x,mast)-7,max(x,mast)+7,85,120,z-15,z+15))
        clip_parts.append(box(x-30,x+30,118,172,z-15,z+15))
# Positive four-sided cuffs around actual 50x30 side columns plus solid
# bearing under their bases. Clear the bolt/arm bands during the entire 100
# outward draw, while the independently caught grille stays stationary.
arms=B['access']['commonBoxesXMinMaxQMinMaxZMinMax'];moving=[]
for i,(xl,xh,bolt,collar) in enumerate([(1210,1290,1375,1362.5),(2310,2390,2225,2212.5)]):
    moving.append(box(xl,xh,-30,0,1950,2150))
    a=arms[i];moving.append(box(a[0],a[1],a[2],a[3],a[4]-3450,a[5]-3450))
    for z in [2000,2100]:moving.append(box(collar,collar+25,-30,130,z-12.5,z+12.5))

def gap(a,b):
    return math.sqrt(sum(max(a[i]-b[i+1],b[i]-a[i+1],0)**2 for i in [0,2,4]))
# All motions are translations, so the union of the axis boxes is exact.
closest=min(gap([a[0],a[1],a[2]-100,a[3],a[4],a[5]],b) for a in moving for b in clip_parts)
assert closest>15,closest
# Two independent little support shoes carry each complete fork BEFORE its
# four nuts are removed. A front stop and removable keeper prevent overturn;
# collars withdraw together. The working platform is independent of the main
# captured carriage. Straight travel makes all root studs clear their bores.
bracket_mass=B['massPerWindowKg'];one_bracket=(bracket_mass['movingPlates']+bracket_mass['newClosedArms']+bracket_mass['nativeCollarsSolidUpper'])/2
support_shoes=[{'x':x,'qRangeBefore':[-32,0],'bearingZ':1950,'draw':100,'designVerticalKN':2*one_bracket*.00981} for x in [1250,2350]]
# Short translation until the vertical suspension / lower path clears the
# 200 mm overhang. Across actual component depth price the whole width, not
# just its centre. Reserve 100 for further gutter, hook half-envelope and
# swing; the final site rig must be measured and weather restricted.
park=-520;guard_draw=145-park;frame_draw=360-park
park_guard=[130-guard_draw,160-guard_draw];park_frame=[290-frame_draw,430-frame_draw]
assert max(park_guard+park_frame)<-300
# NW raw sill 850 and 27 finish. Fork blades fit below the grille. They do
# NOT fit below the complete window frame. The frame uses the four external
# capture-pad territories instead. Actual load-bearing threaded lugs on a
# matched frame are a new interface, not glass suction or a hidden drill.
fork_reserve=910-20-(850+27)-5
frame_underfork=885-20-(850+27)-5
assert fork_reserve>0 and frame_underfork<0
# Bound the temporary carriage reactions, without balancing on a worker or
# on either permanent jamb. q decreases as the carriage moves outwards.
# Rails are outside the 930 mm frame. Front/rear crossheads straddle the
# clear lowering lane. The worker platform retreats before the loaded draw.
rail_x=[1100,2500];wheel_q=[-260,-760];supports_q=[-260,-1900];rail_q=[-1950,-175];moving_budget=300.;fixed=[];max_ground=[]
for full_mass,X,q,Fx,Fq,e in product([0.,moving_budget],[1335,2265],[-800,430],[-1.5,1.5],[-1.5,1.5],[2.1]):
    W=1.5*full_mass*.00981;n=[]
    # Equilibrate N, x and q first moments with four point supports on the
    # captured bogies. Gross operating mass covers a 200 kg closed window
    # and a 100 kg carriage, or the individually captured 50 kg guard.
    for ix,xx in enumerate(rail_x):
        cx=(rail_x[1]-X)/(rail_x[1]-rail_x[0]) if ix==0 else (X-rail_x[0])/(rail_x[1]-rail_x[0]);
        for iq,qq in enumerate(wheel_q):
            cy=(q-wheel_q[1])/(wheel_q[0]-wheel_q[1]) if iq==0 else (wheel_q[0]-q)/(wheel_q[0]-wheel_q[1]);
            n.append(W*cx*cy+Fx*e/(1.4)*(1 if ix else -1)/2+Fq*e/.5*(1 if iq==0 else -1)/2)
    assert abs(sum(n)-W)<1e-7
    fixed+=n
    for draw in [0,guard_draw,frame_draw,frame_draw+100]:
        assert wheel_q[1]-draw>rail_q[0] and wheel_q[0]-draw<rail_q[1]
        reactions=[]
        for ix in [0,1]:
            for support in [0,1]:
                reactions.append(sum(n[2*ix+iq]*((wheel_q[iq]-draw-supports_q[1])/(supports_q[0]-supports_q[1]) if support==0 else (supports_q[0]-wheel_q[iq]+draw)/(supports_q[0]-supports_q[1])) for iq in [0,1]))
        max_ground+=reactions
# The hook must take the complete cassette BEFORE its captured carriage
# disconnects. Check the clear vertical drop between fixed rail/post lines,
# including the wider complete window and an explicit sling sway allowance.
# Hoist carries only one assembly at a time, with its assigned lifting yoke.
yoke_mass=50;max_item=200;hook_mass=max_item+yoke_mass
sling_design=1.5*hook_mass*.00981
sling_each=sling_design/(2*math.cos(math.radians(30)))
drop_x=[1335-100,2265+100];drop_q=[min(park_frame+park_guard)-100,max(park_frame+park_guard)+100]
post_gap=min(drop_x[0]-(rail_x[0]+40),(rail_x[1]-40)-drop_x[1])
crosshead_gap=min((supports_q[0]-60)-drop_q[1],drop_q[0]-(supports_q[1]+60))
assert min(post_gap,crosshead_gap)>0
tip_after_hoist=175-guard_draw-100
assert min(park_guard)-tip_after_hoist>0
# Basket and both tag-line operators remain off the rail and the vertical
# drop. Fixed ground supports must also resist negative end reactions.
# Native SKF follower reference; these proposed roller reactions do not
# automatically qualify the track, eccentric studs, screw actuator or scaffold.
assert max(fixed)<15.7 and abs(min(fixed))<15.7,(min(fixed),max(fixed))
force=max(abs(min(fixed)),max(fixed));L=supports_q[0]-supports_q[1];b,h,t=80,150,6
Z=(b*h**3-(b-2*t)*(h-2*t)**3)/(6*h);M=force*L/4/1000
# Independent share control: one entire wheel force on the span plus a second
# same-sign maximum would be uncorrelated. Keep both as an explicit gross cap.
track_sigma=2*M*1e6/Z
result={'externalGeometrySources':{path.name:hashlib.sha256(path.read_bytes()).hexdigest() for path in [old_occurrence,old_pad_source]},'role':'Ordinary replacement control. Independent indoor barrier, supported common brackets, short captured draw, then outside vertical lowering. A conditional structural layout, with actual matched window, lifting attachment, work platform, ground and weather still required.',
 'temporaryBarrier':{'postSocketsX':axes,'rowsLocalZ':levels,'railNormal':room_q,'railTop':top,'quarterPointAndEndsBound':1.5,'sockets':'Euro Accessories SFCP12060 SS M12, 60 long, 17 OD, 50x10 crosspin. Manufacturer catalogue lists 5 kN; manual table29 reduces shear by edge distance. Fixing duty only. Minimum concrete25, pack the 27 finish to RC and respect the manufacturer torque limit. Compliance of the complete temporary barrier is not claimed.', 'nativeSource':'https://www.euroacc.co.uk/fixing-sockets-with-cross-pin','manual':'https://vjtechnology-pim.s3.eu-west-2.amazonaws.com/11784/Manual.pdf','shortenedEdgeAfter5':edge,'screenedAxialAndShear':[axial,shear],'linearInteractionAgainst5And3p25':interaction,'coverAndBarChecks':intervals,'topRail':{'section':[40,40,3],'stress':rail_stress,'deflection':rail_deflection},'occupied':scene,'limitations':'Confirm socket/pin cross section, real cage hoop/cover, combined load/torque, seated barrier installation and independent proof before releasing the exterior assembly.'},
 'capture':{'guardBodyMassLimit':50,'supportShoeEach':support_shoes,'newBracketToCapturedGuardRigDuring100':closest,'twoSillBlades':[60,20],'bladeToNWSillAfter5':fork_reserve,'sameBladesBelowFrameFailBy':-frame_underfork,'fourFramePads':'X1340..1390/2210..2260, q260..290, local Z1250..1350/2150..2250. All four must engage actual load-rated matched frame fittings while the closed frame is still fixed. Consumer OAS envelope alone does not provide those fittings.', 'guardDraw':guard_draw,'closedFrameDraw':frame_draw,'qAtPark':{'guard':park_guard,'frame':park_frame},'older1640':'The previous L-barrier retains projecting struts. Its 1640 frame draw and rejected tray export remain historical. This new room-side temporary support changes that event.'},
 'handling':{'hoistHandoff':{'axialSuspendedMassBudget':hook_mass,'slingVerticalFactor':1.5,'maximumTwoLegAngleFromVerticalDeg':30,'legForceAtEqualShareKN':sling_each,'oneLegFullVerticalFactoredKN':sling_design,'releaseOnlyAfterEntireLoadIsCaptured':True,'planDropEnvelopeWith100':{'x':drop_x,'q':drop_q},'toPostFace':post_gap,'toCrossheadFace':crosshead_gap,'toRetractedGuardBlade':min(park_guard)-tip_after_hoist,'sequence':'Erect positive room barrier with window still shut. Support whole grille on two blades plus four side cuffs. Support each fork and withdraw both collars 100. Retreat the separate worker basket. Move the retained assembly on both captured rails. Connect independent hoist, support all weight, disengage and retract the carriage 100, then lower into a restrained landing rack. For the whole frame capture all four external fitting territories before unfastening. Reverse after confirming both end captures. The assigned 50 kg yoke is a procurement condition. Actual suspension, support feet, setup and transfer remain unproven.'},'railX':rail_x,'upperSupportQ':supports_q,'movingWheelQInitial':wheel_q,'grossMovingKg':moving_budget,'installedCombinedWindowAndGuardLimitKg':200,'movingBodyAndYokeMassActuallyMeasured':False,'signedQOrXWindKN':1.5,'signedWheelKN':[min(fixed),max(fixed)],'signedRailEndKN':[min(max_ground),max(max_ground)],'rail150x80x6GrossStressMPa':track_sigma,'SKF':'KR52 PPA OD52, 20 stud, 24 running width, C15.7/C0 27 kN catalogue. Positive upper/lower rollers and separately guided lateral faces. Ordinary vertical hoist takes the captured cassette at q−520, with the worker basket independently retreated. Minimum actual WLL must include the cassette plus positive lifting yoke. Establish complete ground-supported rail/hoist heads, actuator brake, travel stops, wind/coordinated handling and erection before use.','rollerSource':'https://cdn.skfmediahub.skf.com/api/public/0901d196802809de/pdf_preview_medium/0901d196802809de_pdf_preview_medium.pdf','remaining':'Measured 200 mm roof overhang plus actual eaves/gutter/hoist and site assembly clearance. The inlet and outlet positions are reversible only after capture transfer to/from a real lowering rig and restrained landing rack.'},'admitted':False}
out=Path(__file__).with_suffix('.json');text=json.dumps(result,indent=2,sort_keys=True)+'\n'
if '--check' in sys.argv:assert out.read_text()==text
else:out.write_text(text)
print('Ordinary barrier/capture',socket_load,interaction,closest,guard_draw,frame_draw,min(fixed),max(fixed))
