import argparse
import hashlib
import json
import math
from pathlib import Path

from continuous_rc_closed_links import closed_wire, main_to_wire_clearance, reference_closed_link_case, transform_wire
from continuous_rc_closed_links_proof import canonical_receipt, reproduction_diagnostics

D=Path(__file__).resolve().parent
ROOT=D.parents[2]


def reference_case():
    return {'schema':'str-portal-architectural-simplification-case/1','masonrySeatProjectionMm':180.,
        'abutmentBottomMm':-180.,'abutmentTopMm':2600.,'masonryNormalMm':215.,
        'rcNormalMm':290.,'largerPostAlongXMm':300.,'postBottomMm':-180.,'postTopMm':3170.,
        'concreteUnitWeightKNM3':25.,'masonryTrialUnitWeightKNM3':20.,'roomSideLiningMm':27.,
        'mineralLiningMm':40.,'assessed':False}


def derive(case,model,grid):
    base=reference_case()
    if set(case)!=set(base) or case['schema']!=base['schema'] or case['assessed'] is not False:raise ValueError('Authored comparison case only; no approval/source/result injection')
    variable={'masonrySeatProjectionMm','largerPostAlongXMm','concreteUnitWeightKNM3','masonryTrialUnitWeightKNM3'}
    if any(case[k]!=v for k,v in base.items() if k not in variable):raise ValueError('Changed material/level/normal geometry requires an explicit new comparison')
    if any(type(v) not in (int,float) or not math.isfinite(v) for k,v in case.items() if k not in ('schema','assessed')):raise ValueError('Finite numeric authored comparison required')
    if min(case['concreteUnitWeightKNM3'],case['masonryTrialUnitWeightKNM3'],case['rcNormalMm'],case['masonryNormalMm'])<=0:raise ValueError('Positive materials and dimensions required')
    if not 0<case['masonrySeatProjectionMm']<280 or not 212.5<case['largerPostAlongXMm']<=312.5:raise ValueError('Candidate exceeds available jamb or cap support envelope')
    caps=[r for r in grid['heads'] if r['id'] in ('P25','P26','P28','P30')]
    if len(caps)!=4 or any(r['capXY']!=[600,600] or r['capZ'][-1]!=case['postBottomMm'] for r in caps):raise ValueError('Direct-bearing candidate requires exact four source cap bodies')
    cap_west_min=min(r['xy'][0]-r['capXY'][0]/2 for r in caps)
    p=model['insulatedPortal'];ri=p['rawRadius'];ro=ri+p['ring'];centre=6000.;cz=p['centreZ']
    west=p['piers']['westEW'];inner=west[1]+case['masonrySeatProjectionMm'];a=centre-inner
    theta=math.asin(a/ri);spring=cz+ri*math.cos(theta);outer_x=centre-ro*math.sin(theta);outer_z=cz+ro*math.cos(theta)
    top=case['abutmentTopMm'];bottom=case['abutmentBottomMm']
    if not bottom<spring<outer_z<top or not west[1]<=outer_x<=inner:raise ValueError('Actual radial masonry seat is outside authored abutment body')
    if inner>centre-p['finishedWidthAtVerticalJambs']/2:raise ValueError('Abutment enters finished clear opening')
    area=(ro*ro-ri*ri)*theta/1e6;volume=area*case['masonryNormalMm']/1000
    half_area=area*1e6/2;first=(ro**3-ri**3)/3*(1-math.cos(theta));rm=(ri+ro)/2
    mean_a=rm*math.sin(theta);rise=rm*(1-math.cos(theta));weight=volume*case['masonryTrialUnitWeightKNM3'];v=weight/2
    h=case['masonryNormalMm']/1000*case['masonryTrialUnitWeightKNM3']*(mean_a*half_area-first)/rise/1e6
    tangent=[math.cos(theta),math.sin(theta)];normal=h*tangent[0]+v*tangent[1];shear=abs(-h*tangent[1]+v*tangent[0])
    seat_area=p['ring']*case['masonryNormalMm'];reaction=math.hypot(h,v)
    slope=(outer_z-spring)/(outer_x-inner);clip_x=inner+(top-spring)/slope
    polygon=[[west[1],bottom],[inner,bottom],[inner,spring],[clip_x,top],[west[1],top]]
    abutment_area=abs(sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(polygon,polygon[1:]+polygon[:1])))/2
    abutment_volume=4*abutment_area*case['rcNormalMm']/1e9
    integral=lambda radius:radius*radius*math.asin(p['rawSpan']/2/radius)+p['rawSpan']/2*math.sqrt(radius*radius-(p['rawSpan']/2)**2)
    removed_ring_volume=2*(integral(ro)-integral(ri))*case['rcNormalMm']/1e9
    delta=case['largerPostAlongXMm']-(west[1]-west[0]);newwest=west[0];inner_b=newwest+case['largerPostAlongXMm'];neweast=12000-newwest
    raw_b=2*(centre-inner_b);spring_b=cz+math.sqrt(ri*ri-(centre-inner_b)**2)
    primitive=lambda radius,a:radius*radius*math.asin(a/radius)+a*math.sqrt(radius*radius-a*a)
    new_ring=2*(primitive(ro,raw_b/2)-primitive(ri,raw_b/2))*case['rcNormalMm']/1e9
    btrial=larger_joint_trial(inner_b,p)
    rc=4*delta*case['rcNormalMm']*(case['postTopMm']-case['postBottomMm'])/1e9
    return {'schema':'str-portal-architectural-simplification/1','case':case,'sourcePortal':p,
        'A':{'type':'Independent compression masonry ring below straight RC frame with full-height inward direct-bearing RC abutments',
            'westAbutmentXYZMm':[west[1],p['piers']['courtNS'][0]-(case['rcNormalMm']-215)/2,bottom,inner,p['piers']['courtNS'][1]+(case['rcNormalMm']-215)/2,top],
            'westAbutmentPolygonXZMm':polygon,'abutmentTopIsActualRadialSeat':True,
            'twoRemovedRCRingsM3':removed_ring_volume,'twoRemovedRCRingsWeightKN':removed_ring_volume*case['concreteUnitWeightKNM3'],
            'partialNetWeightChangeKN':abutment_volume*case['concreteUnitWeightKNM3']+2*weight-removed_ring_volume*case['concreteUnitWeightKNM3'],
            'netWeightScope':'Abutments plus two masonry rings minus two cropped RC rings only. New spandrel/attachments/reinforcement and frame/floor redistribution not included.',
            'innerSpringXZMm':[inner,spring],'outerSeatXZMm':[outer_x,outer_z],
            'rawStructuralSpanMm':2*a,'rawStructuralRiseMm':p['rawCrown']-spring,
            'finishedWidthMm':p['finishedWidthAtVerticalJambs'],'finishedCrownMm':p['finishedCrown'],
            'minimumFinishedJambReserveMm':centre-p['finishedWidthAtVerticalJambs']/2-inner,
            'localCellularGlassReserveMm':centre-p['finishedWidthAtVerticalJambs']/2-inner-case['mineralLiningMm'],
            'fourGrossAbutmentsRCM3':abutment_volume,'fourGrossAbutmentsWeightKN':abutment_volume*case['concreteUnitWeightKNM3'],
            'oneMasonryRingM3':volume,'oneRingTrialWeightKN':weight,
            'ownRingOnlyThreeHingeWitness':{'horizontalReactionKN':h,'verticalReactionKN':v,'resultantKN':reaction,'radialSeatCompressionKN':normal,'radialSeatTangentialKN':shear,'requiredFrictionRatioWithoutMechanicalKey':shear/normal,'meanGrossSeatPressureMPa':normal*1000/seat_area},
            'witnessScope':'Symmetric gravity-only three-hinge idealisation of ring self-weight. No spandrel, frame, wind, floor or roof actions, no thrust-line containment, strength or friction acceptance.',
            'crossingCurvedRCCageRemoved':True,'directBearingToCap':bottom==case['postBottomMm'],'capInwardPlanReserveMm':min(r['xy'][0]+r['capXY'][0]/2-inner for r in caps if r['xy'][0]<centre),'masonryOutOfPlaneRestraintAccepted':False,'abutmentReinforcementAccepted':False,'wholeHouseProofAccepted':False},
        'B':{'type':'Wider inward RC posts and deliberate conventional joint; curved RC ring retained',
            'westPostXMm':[newwest,inner_b],'eastPostXMm':[12000-inner_b,neweast],
            'outboardRoomProjectionMm':0.,'inwardJambConsumptionMm':delta,'remainingJambReserveMm':(raw_b-p['finishedWidthAtVerticalJambs'])/2,'jambCellularGlassMm':(raw_b-p['finishedWidthAtVerticalJambs'])/2-case['mineralLiningMm'],'newWestRoomFinishXMm':newwest-case['roomSideLiningMm'],'newEastRoomFinishXMm':neweast+case['roomSideLiningMm'],
            'rawSpanMm':raw_b,'rawSpringMm':spring_b,'rawRiseMm':p['rawCrown']-spring_b,'rawIntradosRadiusMm':ri,'finishedWidthMm':p['finishedWidthAtVerticalJambs'],'finishedAxialMm':p['finishedAxial'],
            'cellularGlassEachNormalFaceMm':(p['finishedAxial']-case['rcNormalMm'])/2-case['mineralLiningMm'],
            'fourPostGrossAdditionalRCM3':rc,'twoCroppedRingNewVolumeM3':new_ring,'ringOverlapRemovedM3':removed_ring_volume-new_ring,'totalAdditionalRCUnionM3':rc+new_ring-removed_ring_volume,'totalAdditionalRCUnionWeightKN':(rc+new_ring-removed_ring_volume)*case['concreteUnitWeightKNM3'],
            'capOutboardConcreteEdgeReserveMm':newwest-cap_west_min,'knownRoomEnvelopeOverlaps':[],'barTieTrial':btrial,'sourceCapEccentricityXMm':4500-sum(west)/2,'newCapEccentricityXMm':4500-(newwest+inner_b)/2,
            'eightMainBarJointConflictRemovedByGeometryAlone':False,'completeEnclosureProvided':False,'wholeHouseProofAccepted':False},
        'recommendation':'Develop A first. The single explicit inward-enlarged B cage trial still fails. A removes the crossed curved-RC cage, while retaining finished2400/775. Its60mm local jamb glass and enlarged bearing/ground interface must be earned; neither alternative is selected.',
        'ownerAppearanceAccepted':False,'selectedOrInstalled':False,'sourceNative48ForcesReused':False}


def larger_joint_trial(inner,portal):
    case=reference_closed_link_case();left=portal['piers']['westEW'][0];face=71.;rb=87.;ri=portal['rawRadius'];ro=ri+portal['ring'];cz=portal['centreZ'];paths=[]
    for layer,radius,tail in [('intrados',ri+face,inner-face-8),('extrados',ro-face,left+face+8)]:
        fx=tail+rb;fz=cz+math.sqrt((radius-rb)**2-(fx-6000)**2)
        tx=6000+radius/(radius-rb)*(fx-6000);tz=cz+radius/(radius-rb)*(fz-cz)
        angle=math.atan2(tz-cz,tx-6000);bend=math.atan2(tz-fz,tx-fx)
        for sign in (-1,1):
            points=[[tail,sign*case['archTailNormalOffsetMm'],fz-500],[tail,sign*case['archTailNormalOffsetMm'],fz]]
            points.extend([[fx+rb*math.cos(t),sign*case['archTailNormalOffsetMm'],fz+rb*math.sin(t)] for t in [math.pi+(bend-math.pi)*i/40 for i in range(1,41)]])
            for i in range(1,161):
                t=angle+(math.pi/2-angle)*i/160;x=6000+radius*math.cos(t);q=max(0,min(1,(x-inner)/(5000-inner)));y=case['archTailNormalOffsetMm']+(74-case['archTailNormalOffsetMm'])*q*q*(3-2*q)
                points.append([x,sign*y,cz+radius*math.sin(t)])
            paths.append({'id':layer+'/'+str(sign),'pointsMm':points})
    for x in (left+face,inner-face):
        for y in (-74.,74.):paths.append({'id':'post/'+str(x)+'/'+str(y),'pointsMm':[[x,y,1700],[x,y,2600]]})
    trials=[]
    for z in range(2200,2601,25):
        wire=closed_wire((inner-left)/2-49.5,95.5,case)
        points=transform_wire(wire,[(left+inner)/2,0,z],[1,0,0],[0,1,0],[0,0,1])
        row=main_to_wire_clearance(points,paths,case);trials.append({'stationZMm':z,'clearance':row,'passes':row['adverseSurfaceLowerBoundMm']>=0})
    accepted=[r['stationZMm'] for r in trials if r['passes']]
    return {'mainBarAxesHalfPaths':paths,'postLinkHalfCellMm':[(inner-left)/2-49.5,95.5],'stationTrials':trials,
        'negativeWitnesses':[r for r in trials if not r['passes']],
        'maximumAcceptedTrialGapWithSettingMm':max([b-a for a,b in zip(accepted,accepted[1:])] or [math.inf])+4,
        'assemblyFabricationAccepted':False,'scope':'One ordinary horizontal post-link remapping, recomputed radius/tangencies/legs and post axes. No exhaustive alternative search, no curved-link/post-link mutual fit, upstand transition, cap or joint strength credit.'}


def proof():
    path=ROOT/'project/had/studies/water-replan.json';grid_path=D/'current-house-grid.json';model=json.loads(path.read_text())['model'];r=derive(reference_case(),model,json.loads(grid_path.read_text()))
    r['sourceSHA256']={'project/had/studies/water-replan.json':hashlib.sha256(path.read_bytes()).hexdigest(),'project/str/studies/current-house-grid.json':hashlib.sha256(grid_path.read_bytes()).hexdigest(),str(Path(__file__).relative_to(ROOT)):hashlib.sha256(Path(__file__).read_bytes()).hexdigest()}
    for name in ('continuous_rc_closed_links.py','continuous_rc_cage.py','continuous_rc_closed_links_proof.py','cage-requirements.txt'):
        path=D/name;r['sourceSHA256'][str(path.relative_to(ROOT))]=hashlib.sha256(path.read_bytes()).hexdigest()
    return r


def canonical_comparison_receipt(result):
    receipt=canonical_receipt(result)
    receipt['sourcePortal']=result['sourcePortal']
    receipt['receiptPrecision']['schema']='str-portal-derived-receipt-precision/1'
    receipt['receiptPrecision']['authoredCaseAndSourceIdentities']='Exact and unrounded, including sourcePortal'
    return receipt


def render_section(result):
    p=result['sourcePortal'];a=result['A'];b=result['B'];pieces=[]
    def chart(origin,kind):
        scale=.12
        xy=lambda x,z:(origin+(x-4150)*scale,540-(z+180)*scale)
        path=lambda rows:' '.join(('M' if i==0 else 'L')+f'{xy(x,z)[0]:.3f},{xy(x,z)[1]:.3f}' for i,(x,z) in enumerate(rows))+' Z'
        left,right=(p['piers']['westEW'] if kind=='A' else b['westPostXMm'])
        for lo,hi in ((left,right),(12000-right,12000-left)):
            pieces.append(f'<path d="{path([[lo,-180],[hi,-180],[hi,3170],[lo,3170]])}" fill="#bdc9d0" stroke="#333"/>')
        if kind=='A':
            for mirror in (False,True):
                poly=[[(12000-x if mirror else x),z] for x,z in a['westAbutmentPolygonXZMm']]
                pieces.append(f'<path d="{path(poly)}" fill="#8eabb9" stroke="#333"/>')
            theta=math.asin((6000-a['innerSpringXZMm'][0])/p['rawRadius'])
        else:theta=math.asin(b['rawSpanMm']/2/p['rawRadius'])
        ring=[]
        for radius,reverse in ((p['rawRadius'],False),(p['rawRadius']+p['ring'],True)):
            arc_theta=theta if kind=='A' else math.asin(b['rawSpanMm']/2/radius)
            angles=[math.pi/2+arc_theta-2*arc_theta*i/80 for i in range(81)]
            if reverse:angles.reverse()
            rows=[[6000+radius*math.cos(t),p['centreZ']+radius*math.sin(t)] for t in angles]
            ring.extend(rows)
        pieces.append(f'<path d="{path(ring)}" fill="{"#b67353" if kind=="A" else "#bdc9d0"}" stroke="#333"/>')
        finished=[]
        for i in range(81):
            angle=math.pi/2+math.asin(1200/p['finishedRadius'])-2*math.asin(1200/p['finishedRadius'])*i/80
            finished.append([6000+p['finishedRadius']*math.cos(angle),p['centreZ']+p['finishedRadius']*math.sin(angle)])
        pieces.append(f'<path d="{path(finished)[:-2]}" fill="none" stroke="#a21b24" stroke-width="2"/>')
        pieces.append(f'<text x="{origin}" y="90">{kind}: {"masonry arch; direct abutments" if kind=="A" else "inward300 RC posts; failed tie trial"}</text>')
    chart(30,'A');chart(620,'B')
    return '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="680" viewBox="0 0 1200 680"><rect width="1200" height="680" fill="white"/><g font-family="sans-serif" font-size="16" fill="#222"><text x="30" y="35" font-size="23">Architectural simplification comparison — neither selected</text>'+''.join(pieces)+f'<text x="30" y="590">A: raw{a["rawStructuralSpanMm"]:g}; finished2400; local jamb glass{a["localCellularGlassReserveMm"]:g}; +{a["fourGrossAbutmentsRCM3"]:.3f}m³ abutments</text><text x="620" y="590">B: raw{b["rawSpanMm"]:g}; jamb glass{b["jambCellularGlassMm"]:g}; +{b["totalAdditionalRCUnionM3"]:.3f}m³ net RC</text><text x="30" y="630">Red curve: unchanged finished profile. A requires new masonry/frame/thermal proof; B does not earn complete cage geometry.</text></g></svg>'


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args();result=proof();text=json.dumps(canonical_comparison_receipt(result),indent=2,allow_nan=False)+'\n';out=D/'portal-architectural-simplification.json'
    svg=render_section(result);drawing=D/'portal-architectural-simplification.svg'
    if args.check:
        differences={name:reproduction_diagnostics(path.read_text(),actual) for name,path,actual in (
            (out.name,out,text),(drawing.name,drawing,svg)) if path.read_text()!=actual}
        if differences:raise SystemExit('Architectural comparison differs\n'+json.dumps(differences,indent=2,allow_nan=False))
        print('Architectural comparison reproduces')
    else:out.write_text(text);drawing.write_text(svg);print('Authored architectural comparison written')


if __name__=='__main__':main()
