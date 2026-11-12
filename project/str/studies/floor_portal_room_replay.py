"""Source-bound affected-room replay for STR-FLOOR-PORTAL.

This is deliberately narrower than HAD/IAS maintenance design. It proves that
the selected structural correction has a finite occupied-room/service overlay
and closes the two wardrobe wall-disengagement defects preserved by the
generation-2 recovery handoff. Pre-existing IAS maintenance holds remain IAS.
"""
from pathlib import Path
import argparse,hashlib,json,math

D=Path(__file__).resolve().parent
ROOT=D.parents[2]
H_PATH=ROOT/'project/had/studies/water-replan.json'
IAS_PATH=ROOT/'project/ias/studies/selected-family-convergence.json'
EXPECTED_H_BLOB='089f0dac2f2e89272dc2ea85a10c2208f2fd797d'
EXPECTED_IAS_BLOB='7922be5910c40198563d5bd67f4cf306ea221dbd'
# Nominal swept clearance only. A distinct handling, installation and setting
# tolerance envelope must still be resolved by IAS before physical release.
MIN_SWEEP_GAP_MM=5.0
MIN_WALL_DISENGAGEMENT_MM=25.0


def blob(path):
    data=path.read_bytes()
    return hashlib.sha1(f'blob {len(data)}\0'.encode()+data).hexdigest()


def overlap(a,b,eps=1e-7):
    return (a[0]<b[0]+b[2]-eps and a[0]+a[2]>b[0]+eps and
            a[1]<b[1]+b[3]-eps and a[1]+a[3]>b[1]+eps)


def rect_gap(a,b):
    dx=max(b[0]-a[0]-a[2],a[0]-b[0]-b[2],0.)
    dy=max(b[1]-a[1]-a[3],a[1]-b[1]-b[3],0.)
    return math.hypot(dx,dy)


def point_segment(p,a,b):
    dx=b[0]-a[0];dy=b[1]-a[1];d=dx*dx+dy*dy
    t=0. if d==0 else max(0.,min(1.,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/d))
    return math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)


def point_rect(p,r):
    return math.hypot(max(r[0]-p[0],p[0]-r[0]-r[2],0.),
                      max(r[1]-p[1],p[1]-r[1]-r[3],0.))


def orient(a,b,c):
    return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])


def on_segment(a,b,p,eps=1e-9):
    return (min(a[0],b[0])-eps<=p[0]<=max(a[0],b[0])+eps and
            min(a[1],b[1])-eps<=p[1]<=max(a[1],b[1])+eps and
            abs(orient(a,b,p))<=eps)


def segments_intersect(a,b,c,d):
    o1,o2,o3,o4=orient(a,b,c),orient(a,b,d),orient(c,d,a),orient(c,d,b)
    if (o1>0) != (o2>0) and (o3>0) != (o4>0):return True
    return any((abs(o)<=1e-9 and on_segment(x,y,p)) for o,x,y,p in
               ((o1,a,b,c),(o2,a,b,d),(o3,c,d,a),(o4,c,d,b)))


def segment_rect_gap(a,b,r):
    x,y,w,h=r;corners=[(x,y),(x+w,y),(x+w,y+h),(x,y+h)]
    if point_rect(a,r)==0 or point_rect(b,r)==0:return 0.
    for c,d in zip(corners,corners[1:]+corners[:1]):
        if segments_intersect(a,b,c,d):return 0.
    return min(point_rect(a,r),point_rect(b,r),
               *(point_segment(c,a,b) for c in corners))


def moving_rect_path_gap(a,b,size,obstacle):
    """Exact minimum axis-aligned moving-rectangle gap on a straight path."""
    w,h=size;ox,oy,ow,oh=obstacle
    expanded=[ox-w,oy-h,ow+w,oh+h]
    return segment_rect_gap(a,b,expanded)


def wall_rects(walls):
    out=[]
    for w in walls:
        a,b=w['a'],w['b'];horizontal=abs(a[1]-b[1])<1e-9
        axis=0 if horizontal else 1;cross=1-axis
        lo,hi=sorted((a[axis],b[axis]));faces=w.get('finishedFaces',[a[cross]-w['t']/2,a[cross]+w['t']/2])
        cuts=sorted({lo,hi,*[v for hole in w.get('holes',[]) for v in hole if lo<v<hi]})
        for p,q in zip(cuts,cuts[1:]):
            mid=(p+q)/2
            if any(h0<mid<h1 for h0,h1 in w.get('holes',[])):continue
            rect=[p,faces[0],q-p,faces[1]-faces[0]] if horizontal else [faces[0],p,faces[1]-faces[0],q-p]
            out.append((w['id'],rect))
    return out


def path_receipt(name,start,size,path,obstacles,own_wall):
    assert tuple(path[0])==tuple(start),(name,start,path[0])
    own_parts=[r for oid,r in obstacles if oid==own_wall]
    assert own_parts,(name,'own mounting wall absent',own_wall)
    stages=[];current=list(start)
    for index,target in enumerate(path[1:]):
        gaps=sorted((moving_rect_path_gap(current,target,size,r),oid) for oid,r in obstacles)
        end=[*target,*size]
        own=min(rect_gap(end,r) for r in own_parts)
        assert own>=MIN_WALL_DISENGAGEMENT_MM-1e-7,(name,index+1,'wall end release',own)

        # The very first motion may start touching the wall the wardrobe was
        # mounted on. Only that precise initial contact is exempt: the rest of
        # the sweep and every other solid must have positive finite clearance.
        if index==0:
            start_rect=[*current,*size]
            touching=[r for r in own_parts if rect_gap(start_rect,r)<1e-7]
            assert touching,(name,'claimed initial mounting contact absent')
            first_clear=[current[j]+.01*(target[j]-current[j]) for j in range(2)]
            assert all(moving_rect_path_gap(first_clear,target,size,r)>1e-7
                       for r in touching),(name,'first motion does not disengage')
        unobstructed=[(g,oid) for g,oid in gaps
                      if not(index==0 and oid==own_wall)]
        assert unobstructed,(name,'no independently checked obstacles')
        collisions=[(oid,g) for g,oid in unobstructed
                    if g<MIN_SWEEP_GAP_MM-1e-7]
        assert not collisions,(name,index+1,'swept-path clearance failure',collisions)
        minimum,governor=min(unobstructed)
        stages.append(dict(
            index=index+1,fromXY=current,toXY=target,
            minimumObjectGapMM=gaps[0][0],
            minimumUnencumberedSweepGapMM=minimum,
            sweptClearanceGovernor=governor,
            nominalClearanceRequirementMM=MIN_SWEEP_GAP_MM,
            nominalSweepMarginMM=minimum-MIN_SWEEP_GAP_MM,
            governor=gaps[0][1],ownWallEndGapMM=own,
            contact=('Initial mounting wall contact only; released during first sweep.'
                     if index==0 else 'No contact.'),
        ))
        current=list(target)
    return dict(name=name,startXY=list(start),sizeWH=list(size),stages=stages,parkXY=current)


def swept_path_negative_controls():
    """A zero-valued distance must fail, not satisfy a tautological >=0 test."""
    mount=[100.,0.,10.,100.]
    other=[200.,0.,10.,100.]
    good=path_receipt('positive-control',[90.,40.],[10.,10.],
                      [[90.,40.],[65.,40.]],
                      [('mount',mount),('other',other)],'mount')
    assert good['stages'][0]['ownWallEndGapMM']==25.
    assert good['stages'][0]['minimumUnencumberedSweepGapMM']>MIN_SWEEP_GAP_MM
    bad_cases=(
        ('other-object-intersection',
         [[90.,40.],[65.,40.]],
         [('mount',mount),('obstacle',[70.,0.,10.,100.])]),
        ('second-stage-mount-reentry',
         [[90.,40.],[65.,40.],[150.,40.]],
         [('mount',mount),('other',other)]),
        ('insufficient-nominal-clearance',
         [[90.,40.],[65.,40.]],
         [('mount',mount),('obstacle',[80.,0.,10.,100.])]),
    )
    for case,way,objects in bad_cases:
        try:path_receipt(case,[90.,40.],[10.,10.],way,objects,'mount')
        except AssertionError:continue
        raise AssertionError(('swept-path negative control unexpectedly passed',case))


def assert_clear(rect,obstacles,exclude=()):
    hits=[(name,o) for name,o in obstacles if name not in exclude and overlap(rect,o)]
    assert not hits,(rect,hits)


def run():
    swept_path_negative_controls()
    assert blob(H_PATH)==EXPECTED_H_BLOB,(blob(H_PATH),EXPECTED_H_BLOB)
    assert blob(IAS_PATH)==EXPECTED_IAS_BLOB,(blob(IAS_PATH),EXPECTED_IAS_BLOB)
    H=json.loads(H_PATH.read_text())['model'];IAS=json.loads(IAS_PATH.read_text())
    furniture={k:list(v) for k,v in H['upperFurniture'].items()}
    walls=wall_rects(H['upperWalls'])

    # Structural correction overlay preserved by the generation-2 room handoff.
    overlay={
        'bed2-radiator':[3425.,439.5,1050.,200.],
        'bed3-radiator':[7625.,439.5,1050.,200.],
        'bed4-radiator':[3102.5,11360.5,1050.,200.],
        'family-radiator':[11357.5,4525.,200.,650.],
        'principal-radiator':[10020.,11315.5,1350.,200.],
        'rear-radiator':[484.5,9250.,200.,650.],
        'rear-cabinet':[484.5,10557.5,362.5,750.],
        'rear-low-box':[484.5,9937.5,150.,620.],
        'rear-pan':[847.,10757.5,560.,355.],
        'principal-bed':[9260.,9150.,1600.,2090.],
        'family-basin-carrier':[11267.5,5205.,290.,470.],
        'family-basin-ceramic':[11302.5,5212.5,255.,455.],
        'family-soil-cabinet':[11297.5,6135.,260.,265.],
    }

    # Exact structural/finish-face ownership controls.
    assert overlay['bed2-radiator'][1]==439.5
    assert overlay['bed3-radiator'][1]==439.5
    assert abs(overlay['bed4-radiator'][1]+overlay['bed4-radiator'][3]-11560.5)<1e-9
    assert abs(overlay['principal-radiator'][1]+overlay['principal-radiator'][3]-11515.5)<1e-9
    for key in ('family-radiator','family-basin-carrier','family-soil-cabinet'):
        assert abs(overlay[key][0]+overlay[key][2]-11557.5)<1e-9
    for key in ('rear-radiator','rear-cabinet','rear-low-box'):
        assert overlay[key][0]==484.5

    # Candidate stationary fixtures versus the room's controlling retained solids.
    checks=[
        ('bed2-radiator',['bed2','bed2-wardrobe']),
        ('bed3-radiator',['bed3','bed3-wardrobe']),
        ('bed4-radiator',['bed4','bed4-head','bed4-island-wardrobe']),
        ('principal-radiator',['principal-wardrobe']),
        ('rear-radiator',['rear-shower1000','rear-basin']),
        ('rear-cabinet',['rear-basin']),
        ('family-radiator',['family-bath1700','family-WC','family-service-cabinet']),
        ('family-basin-carrier',['family-bath1700','family-WC','family-service-cabinet']),
        ('family-soil-cabinet',['family-WC','family-service-cabinet']),
    ]
    stationary=[]
    for key,names in checks:
        distances={n:rect_gap(overlay[key],furniture[n]) for n in names}
        assert min(distances.values())>=0
        assert all(not overlap(overlay[key],furniture[n]) for n in names)
        stationary.append(dict(candidate=key,minimumGapMM=min(distances.values()),gapsMM=distances))

    # Bedroom wardrobe wall-disengagement repairs. Replace the old source
    # radiator envelopes with the structural overlay before the swept replay.
    common=[(name,r) for name,r in walls]
    for name,r in furniture.items():
        if name in ('bed2-wardrobe','bed3-wardrobe','service-emitter-bed2-S','service-emitter-bed3-S'):continue
        common.append((name,r))
    common += [('bed2-radiator',overlay['bed2-radiator']),('bed3-radiator',overlay['bed3-radiator'])]

    b2=furniture['bed2-wardrobe'];assert b2==[4043,1067.5,660,900]
    b3=furniture['bed3-wardrobe'];assert b3==[7297,1047.5,660,1500]
    bed2=path_receipt('bed2-wardrobe',b2[:2],b2[2:],
                      [[4043.,1067.5],[4018.,1067.5],[4018.,900.5],[2320.,900.5]],
                      common,'bed2-east')
    bed3=path_receipt('bed3-wardrobe',b3[:2],b3[2:],
                      [[7297.,1047.5],[7322.,1047.5],[9180.,980.]],
                      common,'bed3-west')

    # The later HAD/IAS rear repair supersedes the private interruption handoff.
    rear=H['rearRenewalEmitterJoin']
    assert rear['pass'] is True and rear['trayReturnConflicts']==[]
    assert rear['independentEvidence']['geometryEquivalent'] is True
    assert IAS['rearEmitterRepair']['clearances']['trayEdgeAndReturnToBed4Radiator']==20.5

    # STR does not absorb a pre-existing IAS maintenance-state narrow transition.
    # The installed family WC remains comfortably inside the corrected east wet face.
    wc=furniture['family-WC'];east_wet=11557.5
    installed_wc_east_gap=east_wet-(wc[0]+wc[2])
    assert installed_wc_east_gap>=200.,installed_wc_east_gap
    family_wc=dict(
        installedStructuralGapToCorrectedEastWetFaceMM=installed_wc_east_gap,
        structuralWorsening=False,
        maintenanceDisposition='The generation-2 replay recorded20 mm on the fitted first sweep and5 mm on a later symmetric carrier. That maintenance-state sequencing pre-dates STR and remains an IAS duty; STR makes no pass claim for it.',
        owner='IAS',
    )

    return dict(
        status='STR AFFECTED ROOM/SERVICE REPLAY PASS; PRE-EXISTING IAS MAINTENANCE HOLDS RETAINED',
        sources={
            str(H_PATH.relative_to(ROOT)):EXPECTED_H_BLOB,
            str(IAS_PATH.relative_to(ROOT)):EXPECTED_IAS_BLOB,
        },
        structuralOverlay=overlay,
        stationaryChecks=stationary,
        wardrobeWallDisengagement=[bed2,bed3],
        wardrobeSweptProof=dict(
            nominalMinimumGapMM=min(s['minimumUnencumberedSweepGapMM']
                                    for path in (bed2,bed3) for s in path['stages']),
            nominalMinimumRequiredMM=MIN_SWEEP_GAP_MM,
            independentNegativeControls=3,
            physicalHandlingAndTwoSidedSettingToleranceAccepted=False,
            interpretation='Positive nominal swept separation only. The smallest '
                           'bedroom-3 clearance leaves little tolerance and requires '
                           'a separate IAS handling/installation qualification.',
        ),
        rearCurrentSource=dict(
            pass_=rear['pass'],trayReturnConflicts=rear['trayReturnConflicts'],
            selectedWardrobeTurnReserveMM=rear['selectedWardrobeTurn']['minimumReserve'],
            trayRadiatorGapMM=rear['northRadiatorGap'],
            independentIASGeometryEquivalent=rear['independentEvidence']['geometryEquivalent'],
        ),
        familyWC=family_wc,
        serviceAxisHold=dict(
            familyStackAxisXY=[11432.5,6267.5],
            familyFormedPortXYD=[11432.5,6260.,160.],
            rule='Do not recenter the soil/service axis from the narrowed cabinet centroid.',
        ),
        limits=[
            'Furniture mass, handling apparatus, grip, anti-tip release and human-force qualification remain IAS/physical duties.',
            'Family-WC symmetric maintenance carrier remains IAS-owned and is not converted into an STR pass.',
            'The bedroom-3 path passes nominal clearance but its north-wall first-stage gap is only 5.5 mm, leaving just 0.5 mm after the 5 mm screen. It does not prove two-sided setting, handling or physical release tolerances.',
            'This replay proves only geometry affected by the floor/portal correction; it does not re-adopt the HAD/IAS house sources.',
        ],
    )


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--output');a=p.parse_args();result=run()
    if a.output:Path(a.output).write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result,indent=2))
