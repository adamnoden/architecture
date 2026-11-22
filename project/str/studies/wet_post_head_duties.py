"""Post-head development duties, not a concrete/anchorage resistance model.

Consumes the same retained native assessment input as the shared cage method.
No material strength, restraint or native action is changed by this screen.
"""
import copy
import hashlib
import json
import math
from pathlib import Path
import wet_support_cage_comparison as cage


def digest(value):
    return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest()


def section_wrench(top,body_kn_per_mm,below_top_mm):
    """Translate the head wrench to a lower cut, add centred post body gravity.

    r(head relative to section)=(0,0,+depth); r x F=(-depth*Fy,+depth*Fx,0).
    Wrenches retain kN/kNmm, with upward globalZ and right-hand moments.
    """
    if len(top)!=6 or not all(math.isfinite(x) for x in [*top,body_kn_per_mm,below_top_mm]) or min(body_kn_per_mm,below_top_mm)<0:
        raise ValueError('Unsupported wrench transport')
    fx,fy,fz,mx,my,mz=top
    return [fx,fy,fz-body_kn_per_mm*below_top_mm,mx-below_top_mm*fy,my+below_top_mm*fx,mz]


def first_compression_depth(top,q,width,depth,height):
    # Piecewise-affine criterion: retain sign changes of both transported moments.
    breaks={0.,height}
    for m,slope in ((top[3],-top[1]),(top[4],top[0])):
        if slope and 0 < -m/slope < height:breaks.add(-m/slope)
    def gap(z):
        w=section_wrench(top,q,z)
        return 6*(abs(w[3])/depth+abs(w[4])/width)+w[2]
    levels=sorted(breaks)
    if gap(0)<=1e-9:return 0.
    for a,b in zip(levels,levels[1:]):
        ga,gb=gap(a),gap(b)
        if ga<=1e-9:return a
        if gb<=1e-9:return a+(b-a)*ga/(ga-gb)
    return None


def post_duty(post):
    a,b,c,d=post['rectangleXYMm']; width=c-a; depth=d-b
    height=post['physicalTopZMm']-post['physicalBottomZMm']
    forces=post['recovery']['physicalEndWrenchesKN_KNmm']
    if len(forces)!=12 or not all(math.isfinite(x) for x in forces) or min(width,depth,height)<=0:
        raise ValueError('Unsupported finite post geometry or actions')
    bottom,top=forces[:6],forces[6:];N=-top[2];mx,my=top[3]/1000,top[4]/1000
    body=bottom[2]-N
    if body < -1e-7 or N < -1e-7:
        raise ValueError('Tension or negative body load requires a different model')
    q=max(body,0)/height
    base_plane=section_wrench(top,q,height)
    if max(abs(bottom[i]+base_plane[i]) for i in range(6))>1e-6:
        raise ValueError('Post requires non-centred/nonuniform body-load model')
    criterion=6*(abs(mx)/(depth/1000)+abs(my)/(width/1000))
    loaded=N>1e-8
    if not loaded and max(abs(mx),abs(my),abs(top[0]),abs(top[1]),abs(top[5]))>1e-7:
        raise ValueError('Actions without compression are unsupported')
    z=first_compression_depth(top,q,width,depth,height)
    return {'id':post['id'],'headWrenchKN_KNmm':top,'baseWrenchKN_KNmm':bottom,
        'compressionKN':N,'bodyGravityKN':body,'bodyGravityKNPerMm':q,
        'transportedBaseWrenchKN_KNmm':base_plane,
        'fullCompressionRequiredAxialAtHeadKN':criterion,
        'headResultantFromAxisMm':[my*1000/N,-mx*1000/N] if loaded else None,
        'headGrossFullCompressionRatio':criterion/N if loaded else None,
        'fullCompressionFirstPossibleDepthMm':z,
        'withinPostHeight':z is not None,
        'status':'loaded-compression' if loaded else 'not-loaded-not-applicable',
        'headDRegionAccepted':False,'scope':'Affine gross-section no-tension condition with full head-wrench transport and centred body gravity only; not a shear/torsion/anchorage resistance model.'}


def redistribute_top_levels(wet,settings,raise_mm):
    """Raise the top level by redistributing every existing station.

    Do not move just the last station: that could violate the existing pitch.
    Count/lengths/steel mass stay unchanged only if the same count can meet pitch.
    """
    if not math.isfinite(raise_mm) or raise_mm<0:raise ValueError('Unsupported top-level edit')
    authored={**settings,'postTopLevelRaiseMm':raise_mm}
    cage.validate_settings(authored)
    main,new=cage.build_paths(wet,authored);changes=[]
    for i,post in enumerate(wet['posts']):
        top=post['physicalTopZMm']
        lo=post['physicalBottomZMm']+settings['linkNominalCoverMm']+settings['linkDiameterMm']/2+settings['postCrossTiePlaneOffsetMm']
        hi=top-settings['postTopEndInsetMm']-settings['postCrossTiePlaneOffsetMm']-10+raise_mm
        count=math.ceil((hi-lo)/settings['linkPitchMm'])
        pitch=(hi-lo)/count
        top_cover=top-(hi+settings['postCrossTiePlaneOffsetMm'])-settings['linkDiameterMm']/2-settings['cageInstallationToleranceMm']-settings['linkFabricationToleranceMm']
        changes.append({'postId':post['id'],'levelCount':count+1,'pitchMm':pitch,
            'topPerimeterDepthMm':top-hi,'highestCrossTieDepthMm':top-hi-settings['postCrossTiePlaneOffsetMm'],
            'topPlaneCoverBeforeCurveBoundMm':top_cover,'pitchWithinDuty':pitch<=settings['linkPitchMm'],
            'topCoverWithinDuty':top_cover>=settings['minimumConcreteCoverMm']})
    return main,new,changes


def review(proof,root,geometry_checks=True):
    settings=cage.comparison_settings();rows=[];wet_reference=None
    if digest(proof['settings'])!=proof['settingsCanonicalSHA256']:
        raise ValueError('Stale cage choices')
    for row in proof['controls']:
        if 'exactAssessmentInput' not in row:continue
        native=row['exactAssessmentInput']
        if digest(native)!=row['exactAssessmentInputSHA256']:raise ValueError('Stale retained assessment input')
        for path,sha in native['sourceSHA256'].items():
            if hashlib.sha256((root/path).read_bytes()).hexdigest()!=sha:raise ValueError('Stale native source: '+path)
        wet=native['seatedWetSupport'];wet_reference=wet_reference or wet
        rows.append({'nativeCaseId':row['nativeCaseId'],'fullResultSHA256':row['fullResultSHA256'],
            'assessmentInputSHA256':row['exactAssessmentInputSHA256'],'actualWetConcreteWeightKNPerM3':wet['settings']['concreteUnitWeightKNPerM3'],
            'posts':[post_duty(p) for p in wet['posts']]})
    if not rows:raise ValueError('No actual wet controls')
    variants=[]
    for raise_mm in (0.,10.,15.,20.):
        main,links,changes=redistribute_top_levels(wet_reference,settings,raise_mm)
        item={'topLevelRaiseMm':raise_mm,'posts':changes,
            'quantities':cage.quantity(main,links,wet_reference,settings),
            'headDRegionAccepted':False,'anchorageAccepted':False,'nativeWeightFeedbackApplied':False}
        if geometry_checks:
            grid_path=root/'project/str/studies/current-house-grid.json'
            grid=json.loads(grid_path.read_text())
            item['independentPairs']=cage.collision_report(main,links,settings)
            item['internalClosures']=cage.internal_closure_report(main,links,settings)
            item['cover']=cage.cover_report(main+links,cage.support_solids(wet_reference,grid),settings)
        variants.append(item)
    return {'schema':'str-wet-post-head-duties/1','parentSettingsCanonicalSHA256':proof['settingsCanonicalSHA256'],'authoredComparisonSettings':settings,'controls':rows,'topLevelComparisons':variants,
        'nativeSolvesExecuted':0,'headDRegionAccepted':False,'scope':'Development duties and candidate cage geometry only; no physical concrete, bond, splitting/bursting or anchorage resistance.'}


if __name__=='__main__':
    root=Path(__file__).resolve().parents[3]
    proof=json.loads((Path(__file__).with_name('wet-support-cage-comparison-proof.json')).read_text())
    result=review(proof,root)
    paths=['project/str/studies/wet_post_head_duties.py','project/str/studies/wet_support_cage_comparison.py','project/str/studies/wet-support-cage-comparison-settings.json','project/str/studies/wet-support-cage-comparison-proof.json']
    result['processingSourceSHA256']={p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in paths}
    print(json.dumps(result,indent=2,allow_nan=False))
