"""Unadopted rectangular-return geometry, before any local resistance claim.

Reuses the existing complete laps, ramp, post cage, links and geometric checks.
The smaller end mandrel is an explicit hypothesis, not a full-yield exemption.
"""
from __future__ import annotations
import copy
import math
from wet_support_cage_comparison import beam_loop, build_paths, _arc, _line, _path
from wet_support_cage_comparison import longitudinal_intersections
from wet_support_cage_comparison import validate_settings
from continuous_rc_cage import _corner_force_witness
from wet_support_cage_comparison import validate_inputs, collision_report, internal_closure_report, cover_report, support_solids, quantity
from wet_post_head_fan import cage_geometry_digest, recover_wet_head_fans


def rectangular_loop(g, s, index, mandrel_mm):
    validate_settings(s)
    bar=s['mainDiameterMm'];radius=(mandrel_mm+bar)/2
    if type(mandrel_mm) not in (int,float) or not math.isfinite(mandrel_mm) or mandrel_mm<4*bar:
        raise ValueError('explicit end mandrel below the stated first-generation4phi comparison')
    original=beam_loop(g,s,index)
    parts=original['parts'];x=parts[0]['points'][0][0]
    top=parts[4]['points'][-1][2];bottom=parts[6]['points'][0][2]
    south=g['beamSouthEndYMm']+s['beamMainFaceMm']
    north=g['beamNorthEndYMm']-s['beamMainFaceMm']
    if 2*radius>top-bottom or north-south<=2*radius:
        raise ValueError('end corners leave no actual straight return')
    sy=south+radius;ny=north-radius;error=s['curveChordErrorMm']
    last_ramp=parts[3]['points'][-1];lap_end=parts[-1]['points'][-1]
    if not sy<parts[0]['points'][0][1]<lap_end[1]<last_ramp[1]<ny:
        raise ValueError('existing full lap/ramp leaves the candidate straight field')
    candidate=copy.deepcopy(parts[:4])+[
        _line(last_ramp,[x,ny,top]),
        _arc(lambda t:[x,ny+radius*math.cos(t),top-radius+radius*math.sin(t)],math.pi/2,0,radius,error),
        _line([x,north,top-radius],[x,north,bottom+radius]),
        _arc(lambda t:[x,ny+radius*math.cos(t),bottom+radius+radius*math.sin(t)],0,-math.pi/2,radius,error),
        _line([x,ny,bottom],[x,sy,bottom]),
        _arc(lambda t:[x,sy+radius*math.cos(t),bottom+radius+radius*math.sin(t)],-math.pi/2,-math.pi,radius,error),
        _line([x,south,bottom+radius],[x,south,top-radius]),
        _arc(lambda t:[x,sy+radius*math.cos(t),top-radius+radius*math.sin(t)],math.pi,math.pi/2,radius,error),
        _line([x,sy,top],lap_end),
    ]
    path=_path(original['id'],bar,candidate,'beam-main-loop')
    path.update({key:copy.deepcopy(value) for key,value in original.items() if key not in
                 ['parts','centrelineLengthLowerMm','centrelineLengthUpperMm','bendMandrelMm','endReturnRegionsYMm']})
    path.update(endReturnShape='two-quarter-bends-and-vertical-return',endReturnMandrelMm=mandrel_mm,
                lapRampMandrelMm=s['beamReturnMandrelMm'],
                endReturnRegionsYMm=[[south,sy],[ny,north]],
                southLowerStraightTangentYMm=sy,northLowerStraightTangentYMm=ny,
                sourceTopAndBottomRowsZMm=[top,bottom],
                bendPressureAccepted=False,forceIntroductionAccepted=False,anchorageAccepted=False)
    return path


def rectangular_paths(wet,settings,mandrel_mm):
    main,links=build_paths(wet,settings)
    result=copy.deepcopy(main)
    for index in (0,1):result[index]=rectangular_loop(wet['settings'],settings,index,mandrel_mm)
    return result,links


def source_cut_screens(native,main,settings,mandrel_mm,cotangents):
    """Nominal same-row witnesses only; curved-return bar forces stay absent.

    The ordinary beam cannot resolve the local finite node. A straight-section
    axial equilibrium witness plus declared shear/torsion additions is only a
    necessary development comparison, never a compatible bar-force solution.
    """
    from math import pi
    validate_settings(settings)
    if (not cotangents or any(type(x) not in (int,float) or not math.isfinite(x) or not 1<=x<=2.5 for x in cotangents)):
        raise ValueError('explicit supported first-generation strut cotangents1..2.5 required')
    wet=native['seatedWetSupport'];g=wet['settings'];bar=settings['mainDiameterMm']
    rows=[r for key in ['memberCuts','interiorMemberCuts'] for r in native['nativeVertical']['native'][key]
          if r['memberId'].startswith('WET-SUPPORT/beam/')]
    if not rows:raise ValueError('actual simultaneous wet-beam cut catalogue required')
    threshold=wet['posts'][0]['padCentreXYMm'][1]+g['beamDepthMm']
    stations=sorted({r['physicalPointMm'][1] for r in rows if r['physicalPointMm'][1]>=threshold})
    if not stations:raise ValueError('actual end-review boundary cut unavailable')
    limit=stations[0]
    inset=settings['linkNominalCoverMm']+settings['linkDiameterMm']/2
    width=g['beamWidthMm']-2*inset;height=g['beamDepthMm']-2*inset
    radius=(settings['linkClosureMandrelMm']+settings['linkDiameterMm'])/2
    area=width*height-(4-pi)*radius**2
    perimeter=2*(width+height)-(8-2*pi)*radius
    result=[]
    for row in rows:
        actions=['axialCompressionKN','shearYKN','shearZKN','torsionKNm','bendingYKNm','bendingZKNm']
        if (row['breadthMm']!=g['beamWidthMm'] or row['depthMm']!=g['beamDepthMm']
            or row['physicalPointMm'][0]!=g['beamAxisXMm']
            or row['physicalPointMm'][2]!=g['beamTopZMm']-g['beamDepthMm']/2
            or not g['beamSouthEndYMm']<=row['physicalPointMm'][1]<=g['beamNorthEndYMm']
            or any(type(row[k]) not in (int,float) or not math.isfinite(row[k]) for k in actions)):
            raise ValueError('actual same-case finite beam geometry and six actions required')
        if row['physicalPointMm'][1]>limit:continue
        station=row['physicalPointMm'][1]
        steel=longitudinal_intersections(main,1,station,'beam-main-loop')
        record={'memberId':row['memberId'],'end':row['end'],'physicalPointMm':row['physicalPointMm'],
                'simultaneousSourceCut':copy.deepcopy(row),'actualStraightBarIntersections':steel,
                'compatibleBarForceAvailable':False,'finiteNodeAvailable':False,'bendPressureAccepted':False}
        # Every nominal corner must actually exist on a straight strand. A cut
        # through a curved return/ramp cannot inherit a four-straight-bar force.
        if len(steel)<4:
            record.update(status='unsupported-curved-return-or-ramp',diagnostic='RECTANGULAR_END_STRAIGHT_BAR_FORCE_UNAVAILABLE')
            result.append(record);continue
        xs=sorted({p['pointXYZMm'][0] for p in steel});zs=sorted({p['pointXYZMm'][2] for p in steel})
        corners=[p for p in steel if p['pointXYZMm'][0] in (xs[0],xs[-1]) and p['pointXYZMm'][2] in (zs[0],zs[-1])]
        if len(corners)!=4 or len(xs)!=2:
            record.update(status='unsupported-nonrectangular-straight-section',diagnostic='RECTANGULAR_END_CORNER_STRANDS_UNAVAILABLE')
            result.append(record);continue
        half_depth=(zs[-1]-zs[0])/2;half_breadth=(xs[-1]-xs[0])/2
        witness=_corner_force_witness(row,half_depth,half_breadth)
        ab=min(settings['minimumConcreteCoverMm']+bar/2,half_breadth)
        comparisons=[]
        for cot in cotangents:
            shear=(abs(row['shearYKN'])+abs(row['shearZKN']))*cot/4
            torsion=abs(row['torsionKNm'])*1000*perimeter*cot/(8*area)
            force=witness['maximumNecessaryTieTensionKN']+shear+torsion
            stress=force*1000/(pi*bar**2/4*settings['comparisonSteelFraction'])
            bend=force*1000/settings['sourceConcreteCompressionMPa']*(1/ab+1/(2*bar))
            comparisons.append({'cotTheta':cot,'fourCornerWitnessMaximumTieKN':witness['maximumNecessaryTieTensionKN'],
                'orthogonalShearShiftPerTensionBarKN':shear,'thinCellTorsionPerCornerKN':torsion,
                'declaredNominalForceComparisonKN':force,'requiredStressAtComparisonFractionMPa':stress,
                'basicPoorBondLengthMm':bar*stress/(4*settings['sourcePoorBondMPa']),
                'conservativeAbMm':ab,'bendPressureMandrelComparisonMm':bend,'barDamageMandrelComparisonMm':4*bar,
                'necessaryMandrelComparisonMm':max(4*bar,bend),'authoredEndMandrelMm':mandrel_mm,
                'necessaryMandrelScreenPasses':mandrel_mm>=max(4*bar,bend),
                'bendPressureAccepted':False,'bondAndAnchorageAccepted':False})
        record.update(status='nominal-straight-section-witness',creditedCornerStrands=corners,
                      additionalLapStrandsUncredited=len(steel)-4,equilibriumWitness=witness,comparisons=comparisons,
                      sourceMomentCapOnAdditionalShearNotCredited=True,positionToleranceForceRecoveryAvailable=False)
        result.append(record)
    return {'schema':'str-wet-beam-rectangular-end-source-cut-comparison/1','nativeCaseId':native['nativeVertical']['native']['caseId'],
            'requestedReviewThresholdYMm':threshold,'actualReviewBoundaryCutYMm':limit,
            'reviewExtentIsPhysicalDRegionQualification':False,'declaredStrutCotangents':list(cotangents),
            'declaredThinCellAreaMm2':area,'declaredThinCellPerimeterMm':perimeter,'cuts':result,
            'completeSignedLoadEnvelope':False,'continuousCutEnvelopeAvailable':False,'beamEndDRegionAccepted':False,
            'scope':'Same native row N/My/Mz four-corner axial equilibrium witness on actual straight corner strands, plus conservative orthogonal per-tension-bar shear additions and equal per-corner thin-cell torsion additions. Extra lap steel and maximum-moment cap are uncredited. No compatible bar stresses, curved-region forces, finite stress field, placement-force envelope, concrete node or anchorage acceptance.'}


def assess(native,grid,settings,mandrel_mm,cotangents,with_geometry=True):
    """One actual source case drives this complete alternative postprocessing.

    The alternative never changes the solved native stiffness or bulk density.
    Those limitations also apply to the existing reference cage comparison.
    """
    validate_inputs(native,grid,settings)
    if (native.get('candidateAccepted') is not False or native.get('completeHouseProof') is not False
        or native.get('request',{}).get('wetSupport')!=native['seatedWetSupport']['settings']):
        raise ValueError('actual unadopted same-case native wet support required')
    main,links=rectangular_paths(native['seatedWetSupport'],settings,mandrel_mm)
    geometry=cage_geometry_digest({'settings':settings,'mainBars':main,'links':links})
    cage={'settings':settings,'mainBars':main,'links':links,'nativeSourceSHA256':native['sourceSHA256'],
          'nativeCaseId':native['nativeVertical']['native']['caseId']}
    binding={'sourceSHA256':native['sourceSHA256'],'request':native['request'],
             'nativeCaseId':cage['nativeCaseId'],'cageGeometrySHA256':geometry}
    result={'schema':'str-wet-beam-rectangular-return-development/1','status':'computed-development-comparison',
            'nativeCaseId':cage['nativeCaseId'],'nativeSourceSHA256':native['sourceSHA256'],
            'nativeRequest':copy.deepcopy(native['request']),
            'controls':{'endReturnMandrelMm':mandrel_mm,'strutCotangentComparisons':list(cotangents)},
            'authoredCageSettings':copy.deepcopy(settings),'mainBars':main,'links':links,
            'candidateCageGeometrySHA256':geometry,
            'sameCaseCutComparisons':source_cut_screens(native,main,settings,mandrel_mm,cotangents),
            'sameCasePostHeadFan':recover_wet_head_fans(native,cage,binding),
            'quantities':quantity(main,links,native['seatedWetSupport'],settings),
            'geometryChecksAvailable':with_geometry,'nativeSolveExecuted':False,
            'nativeCageMassFeedbackApplied':False,'candidateAccepted':False,
            'beamEndDRegionAccepted':False,'bendPressureAccepted':False,
            'bondAndAnchorageAccepted':False,'toleranceDomainAccepted':False,
            'completeSignedLoadEnvelope':False,'continuousCutEnvelopeAvailable':False,
            'scope':'Unselected rectangular-return alternative on one actual supplied native support/case. All complete laps, ramp, actual post/link paths and source geometry remain explicit. Straight-cut nominal force witnesses do not supply curved-bar or finite-end-node transfer. Native bulk mass/stiffness, signed loading, development, joint resistance and installed acceptance remain unqualified.'}
    if with_geometry:
        result['collisions']=collision_report(main,links,settings)
        result['internalClosures']=internal_closure_report(main,links,settings)
        result['cover']=cover_report(main+links,support_solids(native['seatedWetSupport'],grid),settings)
    return result
