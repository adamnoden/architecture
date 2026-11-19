"""Two bathing fixtures with a private rear WC. Study coordinates mm, positive north."""
import hashlib
import json
import math
from itertools import pairwise
from pathlib import Path
import sys

D=Path(__file__).resolve().parent
P=D.parents[1]
def load(path):return json.loads(path.read_text())
def blob(path):
    b=path.read_bytes()
    return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
sources=[P/'had/studies/water-replan.json',P/'mat/studies/whole-house-service-baseline.json',
         D/'selected-family-convergence.json',D/'family-door-push-path.json',
         P/'str/studies/reconciled-house-interface.json']
H=load(sources[0])['model'];S=load(sources[1]);F=load(sources[2]);push=load(sources[3])
# Existing check renders each rect from the owning finished faces, with 18 trim.
def rects():
    out={}
    for w in H['upperWalls']:
        k=0 if w['a'][1]==w['b'][1] else 1
        lo,hi=sorted([w['a'][k],w['b'][k]])
        u,v=w['finishedFaces']
        cuts=[lo,*[n for ab in w.get('holes',[]) for n in ab],hi]
        for i in range(0,len(cuts)-1,2):
            a,b=cuts[i:i+2]
            out[w['id']+str(i)]=((a-18,u-18,b-a+36,v-u+36) if k==0 else (u-18,a-18,v-u+36,b-a+36))
    out.update(H['upperFurniture']);out.update(H['fixedObstacles']['FIRST'])
    out['court']=(3820.5-18,3820.5-18,4359+36,4359+36)
    out['stair']=H['stair'];out['void']=H['void']
    out.update(H['stairGuard']['firstFloorGuards'])
    return out
def pt_rect(p,r):
    x,y,w,h=r
    return math.hypot(max(x-p[0],0,p[0]-x-w),max(y-p[1],0,p[1]-y-h))
def distance(p,a,b):
    dx=b[0]-a[0];dy=b[1]-a[1];t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy or 1)))
    return math.dist(p,(a[0]+t*dx,a[1]+t*dy))
def segment_rect(a,b,r):
    # slab intersection first, then corner/end distances for disjoint segments
    low,high=0.,1.
    for j in (0,1):
        d=b[j]-a[j];left,right=r[j],r[j]+r[j+2]
        if not d:
            if a[j]<left or a[j]>right:low=2;break
        else:
            t,s=sorted(((left-a[j])/d,(right-a[j])/d));low=max(low,t);high=min(high,s)
    if low<=high:return 0.
    return min(pt_rect(a,r),pt_rect(b,r),*[distance((x,y),a,b) for x in (r[0],r[0]+r[2]) for y in (r[1],r[1]+r[3])])
def closest(path,objects,radius=300):
    return min((segment_rect(a,b,r)-radius,k) for a,b in pairwise(path) for k,r in objects.items())
def length(path):return sum(math.dist(a,b) for a,b in pairwise(path))
obs=rects()
# Select the real WC/basin in both rear WC variants. The package had not been
# built: omitting a proposed form is different from filling an existing hole.
rear=H['upperFurniture'];assert rear['rear-shower1000']==[1802.5,8952.5,1000,1000]
old_bath=rear['family-bath1700']
native=S['interfaces']['familyBathDrop']['primarySource']
oldWaste=native['nativeWasteHole'][:2];end=old_bath[0]+old_bath[2]
bath=[end-1600,old_bath[1],1600,700];rim=580
assert native['nativeModel']=='363-1' and old_bath==[9460,3800,1700,700]
waste=[end-310,bath[1]+350,rim-430];overflow=[waste[0]+206,waste[1],rim-70]
assert waste[:2]==oldWaste and waste[2]==native['nativeWasteHoleLocalZ'] and 561<=rim<=586
assert 145<=206<=260 and 230<=overflow[2]-waste[2]<=460
foot=[end-410,end-410-690];port=[waste[0]+.6*300,waste[1]+.8*300];seal_r=100
assert port==[11030,4390]
foot_y=waste[1]+445/2;dy=max(0,port[1]-foot_y)
max_half_foot_x=port[0]-foot[0]-math.sqrt(seal_r**2-dy**2)
assert bath[1]+bath[3]-port[1]-seal_r==10 and end-port[0]-seal_r==30
# Do not transfer hydraulic capacity from within a figure label. Each real
# endpoint is counted once, and the shower mixer shares the bath's two feeds.
fixture={f['id']:f for f in S['fixtures']}
duties=lambda key:sum(key in q['duties'] for q in fixture.values())
old_counts=[duties('cold'),duties('hot')]
assert old_counts==[14,9] and set(fixture['rear-shower']['duties'])=={'cold','hot','waste'}
extract={q['id']:q for q in S['extract']};fans=sum(q['normalLps'] for q in extract.values())
assert len(extract)==6 and fans==78
# The current whole-house witnesses meet at the shared south landing. Derive
# the path INTO the CLOSED family door's real push, as well as the older open
# entry comparator. Ground-floor cross doors have no role on this floor.
w={q['id']:q for q in H['actions']['witnesses']}
bd=w['bed4-to-protected-stair']['points'];pr=w['principal-to-protected-stair']['points']
assert bd[3]==pr[3] and pr[1]==[8700,3485]
open_route=[*bd[:4],pr[2],pr[1],[pr[1][0],5840],F['family']['entry'][0]]
closed_route=[*bd[:4],pr[2],pr[1],[pr[1][0],push[0][1]],push[0]]
assert length(open_route)==13570 and length(closed_route)==13260
# Recheck the added corridor-to-closed-handle link. Feeding a person into the
# older OPEN entry point never opens the actual self-closing family leaf.
closed_approach=closest(closed_route[-2:],obs)
assert closed_approach[0]>0
assert F['push']['fixedLower']>0 and F['push']['armLower']>0 and F['push']['reachUpper']<=600
assert F['transfer']['heldHandle']['reachUpper']<600
# The 1600 bath is a strict subset of the prior bath. Check the complete
# current joined fixture inventory, including a larger close-coupled WC.
roomobs={k:r for k,r in obs.items() if k not in ['family-bath1700','family-WC','court']}
roomobs['family-bath']=bath;roomobs['larger-family-WC-reference']=[10907.5,5722.5,650,355]
bath_route=F['family']['taskPaths']['bath']
bath_clear=closest(bath_route,roomobs)
# Foot/shower zone at east end; returns hang inside the bath. Three sides
# enclose a shower zone only, leaving the backrest dry end available for entry.
curtain=[10050,3800,1075,665];standing=[10665,4132.5]
torso=min(standing[0]-curtain[0],curtain[0]+curtain[2]-standing[0],
          standing[1]-curtain[1],curtain[1]+curtain[3]-standing[1])-300
assert torso==32.5
frontGap=curtain[2]-2*85
assert frontGap==905 and bath_clear[0]>0
# Independently audit the current FIRST Bed4 entry reservation. The open leaf
# obstacle is centred at the jamb; it cannot also be a fitted 900 leaf in a
# 900 rough opening. Follow an outward-push alternative in the actual space.
# Its current-house swing is a replan, so its end margin and closed states are
# priced rather than transferred from the source bedroom.
hinge=[3140,8735.5]
door_obs={**obs,'left-door-jamb':[3100,8755.5,37.5,194],
          'right-door-jamb':[3904.5,8755.5,95.5,194]}
# E20 frame builds into the actual rough opening. Do not double-charge the
# general square trim across that opening and the detailed new jamb lining.
for k,w0 in list(door_obs.items()):
    if k.startswith('rear-west0'):door_obs[k]=[w0[0],w0[1],3100-w0[0],w0[3]]
    elif k.startswith('rear-west2'):door_obs[k]=[4000,w0[1],w0[0]+w0[2]-4000,w0[3]]

# The source's 18-wide architrave cannot project across the hinge cheek:
# locally finish the last 40 mm of the west leg flush to the wall.
near=door_obs.pop('rear-west0')
door_obs['west-return-trim']=(near[0],near[1],3060-near[0],near[3])
door_obs['west-flush-cheek']=(3060,8755.5,40,194)
poses=load(D/'shared-bathing-door-paths.json')
def arm_and_body(p,theta,side,objects):
    a=math.radians(theta);u=(math.cos(a),-math.sin(a));n=(-math.sin(a),-math.cos(a))
    proj=lambda a,b:a[0]*b[0]+a[1]*b[1]
    dx=(p[0]-hinge[0],p[1]-hinge[1]);local=(proj(dx,u),proj(dx,n))
    grip=[hinge[j]+700*u[j]+side*n[j] for j in (0,1)]
    near_rects={k:r for k,r in objects.items() if r[0]<4600 and r[0]+r[2]>2600 and r[1]<9800 and r[1]+r[3]>7300}
    return [min(pt_rect(p,r) for r in near_rects.values())-300,
            min(pt_rect(local,r) for r in ([0,0,762,44],[650,-90,85,90],[650,44,85,90]))-300,
            min(segment_rect(p,grip,r) for r in near_rects.values())-40,
            min(segment_rect(local,[700,side],r) for r in ([0,0,762,44], [650,44,85,90] if side<0 else [650,-90,85,90]))-40,
            600-math.dist(p,grip)]
def phase(name,pts,angles,side,objects=door_obs):
    assert len(pts)==len(angles)
    low=[math.inf]*5
    for left,right,A,B in zip(pts,pts[1:],angles,angles[1:]):
        # Subdivide each straight-body/rotating-leaf interval. The respective
        # endpoint speeds bound body, leaf and the interpolated shoulder-arm
        # to the rotating grip (Hausdorff distance), even between samples.
        count=4
        body_step=math.dist(left,right)/(2*count)
        dtheta=math.radians(abs(B-A))/(2*count)
        leaf_step=math.hypot(762,44)*dtheta;grip_step=math.hypot(700,side)*dtheta
        bound=[body_step,body_step+leaf_step,max(body_step,grip_step),
               max(body_step,grip_step)+leaf_step,body_step+grip_step]
        for i in range(count+1):
            t=i/count;p=[a+(b-a)*t for a,b in zip(left,right)]
            margins=arm_and_body(p,A+(B-A)*t,side,objects)
            low=[min(v,k-d) for v,k,d in zip(low,margins,bound)]
    assert min(low)>0,(name,low)
    return dict(zip(('fixedBody','leafBody','fixedArm','leafArm','spareReach'),[round(v,3) for v in low]))
push4,pull4,hold4=(poses[k] for k in ('push','pull','held'))
exchange=pull4[-1];assert exchange==hold4[-1] and hold4[0]==push4[-1]
p0=phase('push room to gallery',push4,[i/2 for i in range(201)],-70)
p1=phase('hold at 100',hold4,[100]*len(hold4),-70)
p2=phase('held return to 75',[exchange]*51,[100-i/2 for i in range(51)],-70)
p3=phase('pull from gallery',pull4,[i/2 for i in range(151)],114)
swap=[arm_and_body(exchange,75,side,door_obs) for side in (-70,114)]
assert min(min(v) for v in swap)>0
wait_reserve=math.dist(exchange,hinge)-math.hypot(762,44)-300
assert wait_reserve>30
first_approach=[[3550,9300],[push4[0][0],9300],push4[0]]
gallery_approach=[[3450,7725],[3450,pull4[0][1]],pull4[0]]
bedroom_clear=closest(first_approach,door_obs);gallery_clear=closest(gallery_approach,door_obs)
closed_leaf=[hinge[0],hinge[1]-44,762,44]
assert min(bedroom_clear[0],gallery_clear[0],closest(gallery_approach,{'leaf':closed_leaf})[0])>0
to_shared=[exchange,[3450,exchange[1]],*closed_route[3:]]
after=closest(to_shared[:3],door_obs)
assert after[0]>0
# Where the open leaf goes in relation to the protected west gallery:
# At 90 the leaf is west of the existing x3450 movement axis; its last 600
# of approach near the Bed4 threshold is occupied during the swing.
open_gap=3450-hinge[0]-300
assert open_gap==10
# Matching 700-station, 70-deep handles on the original family frame.
# Transform only the coordinates. The actual room, larger WC, and new north
# service front are verified in their original (x,y) frame when appropriate.
def T(p):return [hinge[0]-(p[1]-6281),hinge[1]-(p[0]-9409)]
def inv(p):return [9409-(p[1]-hinge[1]),6281-(p[0]-hinge[0])]
def TR(r):
    x,y=T([r[0]+r[2],r[1]+r[3]])
    return [x,y,r[3],r[2]]
family_fixed=dict(roomobs)
for k in list(family_fixed):
    if k.startswith('wet-spine0'):family_fixed[k]=(9203,2632,194,5450-2632)
    elif k.startswith('wet-spine2'):family_fixed[k]=(9203,6350,194,6518-6350)
family_fixed['south-door-jamb']=(9203,5450,194,66.5)
family_fixed['north-door-jamb']=(9203,6283.5,194,66.5)
family_fixed['bath-front-water-rail']=[10780,4500,455,85]
family_fixed['bath-end-mixer-rail']=[11175,3800,105,785]
f_objects={k:TR(r) for k,r in family_fixed.items()}
f_push,f_pull,f_hold=(poses['family-'+k] for k in ('push','pull','held'))
assert f_hold[0]==f_push[-1] and f_hold[-1]==f_pull[-1]==exchange
f_phases=[phase('family push',f_push,[i/2 for i in range(171)],-70,f_objects),
          phase('family held open',f_hold,[85]*len(f_hold),-70,f_objects),
          phase('family handoff',[exchange]*21,[85-i/2 for i in range(21)],-70,f_objects),
          phase('family pull',f_pull,[i/2 for i in range(151)],114,f_objects)]
# At transfer the two shoulder points are separated by 180 across the leaf.
# Their independent 40-radius paths lie on opposite faces over the entire
# reach. The measured separation excludes a mathematical shared-arm origin.
ua=(math.cos(math.radians(75)),-math.sin(math.radians(75)))
na=(ua[1],-ua[0])
dv=[exchange[i]-hinge[i] for i in (0,1)];u0=sum(v*n for v,n in zip(dv,ua));n0=sum(v*n for v,n in zip(dv,na))
min_arm_spacing=min(114,n0+90)-max(-70,n0-90)-80
assert min_arm_spacing>90
hand_gaps={}
for name,objects in [('Bed4',door_obs),('family',f_objects)]:
    hand_gaps[name]=[]
    for side,sign in [(-70,-1),(114,1)]:
        shoulder=[exchange[i]+sign*90*na[i] for i in (0,1)]
        grip=[hinge[i]+700*ua[i]+side*na[i] for i in (0,1)]
        fixed=min(segment_rect(shoulder,grip,r)-40 for r in objects.values())
        wall=segment_rect((u0,n0+sign*90),(700,side),(0,0,762,44))-40
        reach=600-math.dist(shoulder,grip)
        assert min(fixed,wall,reach)>0,(name,fixed,wall,reach)
        hand_gaps[name].append([round(x,2) for x in (fixed,wall,reach)])
f_start,f_in,f_return=inv(f_push[0]),inv(exchange),inv(f_pull[0])
joint=[exchange,[3450,exchange[1]],bd[3],pr[2],pr[1],[8700,f_start[1]],f_start]
assert closest(joint[:3],door_obs)[0]>0 and closest(joint[-2:],family_fixed)[0]>0
bathway=[f_in,[f_in[0],5750],F['family']['closedBody'],*bath_route[1:]]
returnway=[*reversed(bath_route),f_return]
assert min(closest(bathway,family_fixed)[0],closest(returnway,family_fixed)[0])>0
# Only one operated leaf per state: both are closed while the middle corridor
# is traversed. Every other path is either an exact subsection of the HAD
# witness or is checked directly against the joined room.
outbound_length=sum(length(v) for v in (first_approach,push4,hold4,joint,f_push,f_hold,bathway))
# Feed the new thermostatic bath/shower diverter from the two existing bath
# isolators. Expose the under-rim supply above the entire withdrawal panel.
family_isolation=S['interfaces']['familyBathDrop']['upperConfiguredKit']['waterIsolationTargets']
assert family_isolation['hot']==[10800,4450,350] and family_isolation['cold']==[10900,4450,350]
hot=[[10800,4450,350],[10800,4480,350],[10800,4480,548],[10800,4565,548],[11255,4565,548],[11255,3820,548],[11255,3820,1310],[10435,3820,1310],[10435,3820,1260],[10435,3850,1260]]
cold=[[10900,4450,350],[10900,4480,350],[10900,4480,548],[10900,4520,548],[11210,4520,548],[11210,3820,548],[11210,3820,1210],[10285,3820,1210],[10285,3820,1260],[10285,3850,1260]]
water_r=18;panel_top=500
def axial_gap(a,b,c,d):
    return math.sqrt(sum(max(min(a[i],b[i])-max(c[i],d[i]),min(c[i],d[i])-max(a[i],b[i]),0)**2 for i in (0,1,2)))
water_clear=min(axial_gap(a,b,c,d) for a,b in pairwise(hot) for c,d in pairwise(cold))-2*water_r
assert water_clear>=9
assert min(548-water_r-panel_top,580-548-water_r)>0
assert 4520-water_r-port[1]-seal_r>0
# Stay in the service strip on the east; occupy only the near side of the
# south wall with two exposed/guarded branches. These branches require
# their own clips; the removable bath/front and curtain do not support them.
curtain=[10050,3800,1075,665];standing=[10775,4150]
torso=min(standing[0]-curtain[0],curtain[0]+curtain[2]-standing[0],
          standing[1]-(3820+water_r),curtain[1]+curtain[3]-standing[1])-300
mixer=[10360,3950,1360];shoulder=[*standing,1650]
# Centre lever and diverter must lie in this space in their actual positions.
wet_reach=max(math.dist([mixer[0]+dx,mixer[1]+dy,mixer[2]+dz],shoulder)
              for dx in (-20,20) for dy in (-25,25) for dz in (-30,30))
mixer_clear=pt_rect(standing,[10235,3800,250,240])-300
assert mixer_clear>10
assert torso>=12 and wet_reach<600
rail_duty={'rearWallY':3800,'frontY':4465,'endX':[10050,11125],
           'clearDrawWithTwo85Parks':frontGap,'torsoClearMm':torso,
           'railZ':2200,'ceilingZ':3100,'twoSupportsWorkLengthMm':900,
           'hemMaxZ':480,'minimumCombinedHangingDrop':1720,
           'pipesHotCold':{'hot':hot,'cold':cold},'pipeAssemblyMaxOD':2*water_r,
           'mixerSpatialLimit':[10235,3800,250,240],'wholeMixerBodyClearMm':mixer_clear,'wetGripEnquiryCentre':mixer,'shoulder':shoulder,'controlReachMm':wet_reach,
           'head':[10775,3970,2250],'maxRailBelowRim':580-548-water_r,
           'totalAddedHotColdMM':[round(length(p),1) for p in (hot,cold)],'pipeToPipeClearMm':water_clear,
           'minRailAbovePanel':548-water_r-panel_top,'minFrontPipeToSealPlanMm':4520-water_r-port[1]-seal_r}
# A body can clear the lever while its opposite end hits a real stair guard
# or partition. Check all three complete moving boxes against fixed solids.
def hardware_clear(objects,limit):
    fixed={k:r for k,r in objects.items() if r[0]<4550 and r[0]+r[2]>2650 and r[1]<9700 and r[1]+r[3]>7400}
    rows=[]
    for x,y,w,h in ([0,0,762,44],[650,-90,85,90],[650,44,85,90]):
        best=(math.inf,None)
        radius=math.hypot(x+w,max(abs(y),abs(y+h)))
        for i in range(5*limit+1):
            a=math.radians(i/5);u=(math.cos(a),-math.sin(a));n=(-math.sin(a),-math.cos(a))
            p=[[hinge[k]+m*u[k]+v*n[k] for k in (0,1)] for m,v in ((x,y),(x+w,y),(x+w,y+h),(x,y+h))]
            for key,r in fixed.items():
                # Every fixed obstacle here is larger than the tiny corner
                # which could sit wholly inside a moving rectangle; also
                # check its corners in local coordinates to cover containment.
                signed=min(segment_rect(q,z,r) for q,z in zip(p,[*p[1:],p[0]]))
                for rx,ry in ((r[0],r[1]),(r[0]+r[2],r[1]),(r[0],r[1]+r[3]),(r[0]+r[2],r[1]+r[3])):
                    dx,dy=rx-hinge[0],ry-hinge[1]
                    if x<=dx*u[0]+dy*u[1]<=x+w and y<=dx*n[0]+dy*n[1]<=y+h:signed=0
                best=min(best,(signed,key))
        reserve=best[0]-radius*math.radians(.1)
        assert reserve>0,(best,reserve)
        rows.append([round(reserve,3),best[1]])
    return rows
physical=[hardware_clear(door_obs,100),hardware_clear(f_objects,85)]
# Bare bath tips onto an independent handling frame after the whole wetted
# boundary, indexed rails and feet are released. Pack dimensions are design
# limits; a 730 wide carrier clears a 767 throat only if actually centred.
pack=[510,730,1690];throat=F['family']['door']['netY']
payload_y=sum(throat)/2-pack[1]/2
cargo=[[10055,3835],[10055,payload_y],[8416.25,payload_y]]
assert pack[1]<throat[1]-throat[0] and min(cargo[0][1]-3820,payload_y-throat[0])>0
# Numeric loadout and source identities make the household choice reversible.
result={'basis':'bath-shower and private rear WC study; not adopted',
 'inputs':{str(f.relative_to(P.parent)):blob(f) for f in sources},
 'sources':{'Bath':'Kaldewei DYNA SET 626, 2627842-11','heldBath':'Kaldewei SANIFORM PLUS 363-1, 2627857-28'},
 'threeRoomComparators':{'retained':[4,2,1,6],'rearWCPlusSharedBathShower':[4,1,1,6],'fullyDeletedRear':[3,1,1,5],
                         'order':['WC count','dedicated shower count','bath count','extract count']},
 'room':{'transportPack':pack,'grossCargoThroatSideMargin':payload_y-throat[0],'candidateCargoPositions':cargo,'tub':bath,'originalTub':old_bath,'rim':rim,'waste':waste,'overflow':overflow,'footX':foot,
         'footMaxWidth':445,'unmeasuredFootHalfLengthCutoff':round(max_half_foot_x,3),'proposedDrop':port,
         'existingPort':S['interfaces']['familyBathDrop']['port']['centre'],'minVisibleTrapBottom':waste[2]-89,
         'servicePanel':S['interfaces']['familyBathDrop']['upperConfiguredKit']['upperServicePanel'],
         'shower':rail_duty,'operatingRoomBodyMin':bath_clear,'existingDoorTask':F['paths']['bath']['minimumReserve']},
 'access':{'openFamilyDoorDistance':length(open_route),'currentBed4OpenToClosedFamilyDoor':length(closed_route),
           'fullClosedFamilyApproachMargin':closed_approach,'twoOperatedDoorsAndBathArrivalMm':round(outbound_length,1),
           'familyNewPushStart':f_start,'familyArrivalAfterDoor':f_in,'familyClosedReturnStart':f_return,
           'familyNewDoorPhases':f_phases,'hardwareVsFixedBed4Family':physical,'twoShoulderHandOff':hand_gaps,'armMutualClear':min_arm_spacing,'familyPushStart':push[0],
           'bed4DoorTarget':{'hinge':hinge,'leaf':[762,44],'gripLength':700,'gripNormalFromFaces':70,
           'operatingAngles':[75,100],'handChange':exchange,'fixedFrameOnly':False,
           'push':p0,'hold':p1,'relax':p2,'pull':p3,'independentReturnUsesReversePush':True,
           'waitClearOfAnyLeafPosition':wait_reserve,'bladeOnlySpareToX3450At90':open_gap,
           'bedroomStart':push4[0],'galleryPullStart':pull4[0],'staticApproaches':[bedroom_clear,gallery_clear,after]}},
 'services':{'originalColdHot':old_counts,'withDiverter':[old_counts[0]-1,old_counts[1]-1],
             'rearShowerBranchesRemovedFromUseMm':fixture['rear-shower']['waterBranchLengthIncludingDropMM'],
             'normalSixLps':fans,'normalFiveLps':fans-extract['rear-bath']['normalLps'],
             'floorLps':S['air']['floorCriterionLps'],'bedroomLps':S['air']['bedroomCriterionLps'],
             'retainedRearPort':S['interfaces']['rearSource27']['retainedFloorPort']}}
path=Path(__file__).with_suffix('.json')
payload=json.dumps(result,indent=2)+'\n'
if '--check' in sys.argv:assert path.read_text()==payload
else:path.write_text(payload)
print('Four bedrooms, retained private rear WC, true closed-door family-bath route and complete reversible Bed4 handle transfer.')
