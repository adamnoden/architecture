"""Unselected outer renewal comparisons; no complete ordinary route is accepted.

Units:mm, L/s, kg. Run normally to regenerate this source's JSON, or --check.
The existing50 kg/m and75 kg head load envelopes remain in every stock trial.
"""
from pathlib import Path
import argparse
import hashlib
import json
import math
import roof_water_edges as e
import roof_water_heads as h

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
INPUTS=['project/rof/studies/roof_water_edges.py','project/rof/studies/roof_water_heads.py',
    'project/rof/studies/roof_water_movement.json','project/mat/studies/ring-roof-family.json',
    'project/had/studies/water-replan.json','project/rwt/studies/court-service-selection.json',
    'project/rwt/studies/selected-water-event.json','project/rwt/studies/over-roof-site-envelope.json',
    'project/mat/studies/plant-threshold.json','project/had/studies/current-house-services.json',
    'project/str/studies/reconciled-house-interface.json']


def side_opening(H,diameter=100,cd=.6,strips=16000):
    """Free unprimed circular side opening: integrate submerged strips in SI."""
    H/=1000;diameter/=1000;r=diameter/2;dz=min(H,diameter)/strips
    return 1000*cd*sum(2*math.sqrt(max(0,r*r-((i+.5)*dz-r)**2))
        *math.sqrt(2*9.81*(H-(i+.5)*dz))*dz for i in range(strips))


def required_head(q,diameter=100,cd=.6):
    lo,hi=0.,1000.
    for _ in range(45):
        mid=(lo+hi)/2
        if side_opening(mid,diameter,cd,4000)<q:lo=mid
        else:hi=mid
    return (lo+hi)/2


def movement(label,field='rangeMM'):
    return max(abs(v) for row in h.movement['queries'] if label in row['label'] for v in row[field])


def primary_frame(wall=4,backing=2):
    """Owning frame equations with only crossarm wall/backing varied."""
    width,water,spacing=350.,180.,e.p_perimeter*1000/64
    root=h.section(50,100,4);arm=h.section(160,25,wall)
    gravity=(1.35*50+1.5*width*water/1000)*9.81/1000;wind=2.25*width/1000
    line=gravity+wind;load=line*spacing;ratio=(1.35*50*9.81/1000+wind)/line
    rail=h.beam_screen(line/2,spacing,h.section(80,25,2))
    pressure=(1.5*9.81*water/1000+2.25+.25)/1000
    plate=h.beam_screen(pressure,200,{'I':backing**3/12,'Z':backing**2/6})
    rib=h.beam_screen(pressure*200,width,h.section(20,25,2))
    serial=rail['deflectionMm']+plate['deflectionMm']+rib['deflectionMm']
    root_length=160+332.5;ei=180000*root['I']
    def at(offset):
        length=width+offset;moment=load*(offset+width/2)
        arm_d=load/width*(3*length**4-4*length*offset**3+offset**4)/(24*180000*arm['I'])
        translation=load*root_length**3/(3*ei)+moment*root_length**2/(2*ei)
        rotation=load*root_length**2/(2*ei)+moment*root_length/ei
        return translation+length*rotation+arm_d+serial,arm_d,moment/arm['Z']
    whole,arm_d,stress=at(10);released=at(50)[0]
    return {'wallMM':wall,'backingMM':backing,'areaMM2':arm['area'],
        'crossarmStressMPa':stress,'crossarmDeflectionMM':arm_d,'wholeFrameMM':whole,
        'dryReleasedFrameMM':released*ratio,'wetReleasedFrameMM':released}


def compare():
    q=e.normal_q;roll=movement('cross-section R520 minus R170')
    native=movement('moving R170 minus lower R670')
    low_local=h.frames[1]['wholeSupportDeflectionAtCombinedLoad']
    sleeve=.770*.090*.001*8940;clips=4*.020*.040*.002*8000
    joint=sleeve+clips+.1+.1
    frames=[]
    for wall,backing in [(4,2),(3,2),(4,1.8),(4,1.5)]:
        row=primary_frame(wall,backing)
        saving=64*.4*(h.section(160,25,4)['area']-row['areaMM2'])*.008/e.p_perimeter
        saving+=.350*(2-backing)/1000*8000
        row.update({'stockSavingKGPerM':saving,'scheduledWith64JointsKGPerM':e.p_dry-saving+64*joint/e.p_perimeter,
            'framePlusNativeRollMM':row['wholeFrameMM']+roll,
            'wetReleaseAnalogueMM':native+roll*40/350+row['wetReleasedFrameMM']+low_local,
            'dryReleaseMM':movement('moving R170 minus lower R670','dryDiversionRangeMM')
                +movement('cross-section R520 minus R170','dryDiversionRangeMM')*40/350
                +row['dryReleasedFrameMM']+h.frames[1]['dryReleasedSupportDeflectionWithSameWind']})
        row['lowerClearanceAt161DropMM']=e.min_drop[0]+4-27-10-5-row['wetReleaseAnalogueMM']
        frames.append(row)
    assert abs(frames[0]['wholeFrameMM']-h.frames[0]['wholeSupportDeflectionAtCombinedLoad'])<1e-12
    assert frames[0]['scheduledWith64JointsKGPerM']>50
    assert frames[1]['scheduledWith64JointsKGPerM']<50 and frames[1]['framePlusNativeRollMM']<11
    assert frames[-1]['framePlusNativeRollMM']>11
    inlet=[]
    for meaning,H in [('30 water above bed',10),('30 above invert',30),('30 above centre',80)]:
        inlet.append({'meaning':meaning,'headAboveInvertMM':H,
            'waterAboveBedMM':20+H,'oneCd06Lps':side_opening(H),
            'oneCd062Lps':side_opening(H,cd=.62),'oneIdealCd1Lps':side_opening(H,cd=1)})
    needed=required_head(q)
    assert 2*side_opening(30,cd=1)<q and side_opening(80)<q
    assert abs(side_opening(80,strips=4000)-side_opening(80,strips=32000))<.00002
    pipes=[]
    for length in [1000,1500,2000,3000]:
        area=math.pi*.1**2/4;velocity=q/1000/area;vh=velocity**2/(2*9.81)*1000
        pipes.append({'lengthMM':length,'boreMM':100,'DarcyF':.06,'localK':6,'exitK':1,
            'requiredTotalHeadMM':(1+6+.06*(length/1000)/.1)*vh})
    scuppers=[]
    for width in [200,250]:
        head=((q/1000)/(.6*(2/3)*(width/1000)*math.sqrt(2*9.81)))**(2/3)*1000
        scuppers.append({'widthMM':width,'Cd':.6,'invertMM':20,'headForFullFlowMM':head,
            'frontReserveAfter10Setting25Splash11MovementMM':130-20-head-46})
    boots=[]
    for width in [40,46,50]:
        depth=119;area=width*depth/1e6;v=q/1000/area;dh=4*area/((width+2*depth)/1000)
        loss=(1+6+.06*.5/dh)*v*v/(2*9.81)*1000
        boots.append({'clearAlongWidthMM':width,'grossWithTwo2WallsMM':width+4,
            'trial60SeamReserveAfter10SettingMM':60-width-4-10,
            'grantedWaterDepthAndHeadMM':119,'runMM':500,'K':6,'f':.06,'requiredHeadMM':loss})
    arm_trials=[]
    for centre in [6240,6205,6200,6195]:
        drop=6600-centre;wind_couple=h.leader_wind*1000*(7400-centre)
        moment=h.top_vertical_load*h.top_lever+wind_couple
        d=h.top_vertical_load*h.top_lever**3/(3*180000*h.top_arm['I'])
        d+=wind_couple*h.top_lever**2/(2*180000*h.top_arm['I'])
        d+=moment*drop*h.top_lever/(180000*h.top_arm['I'])
        d+=h.top_vertical_load*drop/(180000*h.top_arm['area'])
        mass=h.top_arm['area']*.008*(h.top_lever+drop)/1000
        arm_trials.append({'centreMM':centre,'dropFrom6600MM':drop,'topMM':centre+100,'bottomMM':centre-100,
            'armMassKG':mass,'wholeHeadMassKG':sum(h.head_mass_schedule.values())-h.top_arm_mass+mass,
            'armStressMPa':moment/h.top_arm['Z'],'wholeDeflectionMM':d+h.fork_deflection+h.plate_deflection,
            'lowerCarrierReserveAfter50Native6Local10SettingMM':e.lower_min-27-(centre+100)-66,
            '5900Floor6025RimTrayReserveAfterSame66MM':centre-100-6025-66})
    chosen=arm_trials[2]
    assert chosen['armMassKG']<32 and chosen['wholeHeadMassKG']<75 and chosen['wholeDeflectionMM']<6
    assert min(chosen['lowerCarrierReserveAfter50Native6Local10SettingMM'],chosen['5900Floor6025RimTrayReserveAfterSame66MM'])>0
    body_bay=[{'body':r['name'],'rootPitchHypothesisMM':r['rootSpacing'],
        'selectedModuleLengthKnown':False,'existing600BayEdgeReserveAfter10MM':300-r['rootSpacing']/2-10}
        for r in h.frames]
    result={'status':'UNSELECTED; NO COMPLETE ORDINARY RENEWAL ROUTE ACCEPTED',
        'startingDevelopmentCommit':'a9f7fddc18103ef36f99a5e0e8fd0d86e09b4986',
        'flowLps':q,'jointCandidate':{'selected':False,'copperSleeveKG':sleeve,'four20x40x2ClipsKG':clips,
            'fastenersAllowanceKG':.1,'leadFreeSolderAllowanceKG':.1,'totalKG':joint,
            'geometry':'Full770 mm developed profile;1 mm Cu;70 mm projected along width (10 seam+30 overlap each side),90 developed width including10 downward fold.',
            'conditions':'Actual module/corner inventory, metal seal, fatigue, thermal restraint and repeated joint losses are unjoined. The70 mm sleeve does not create70 mm clear space.'},
        'primaryStockTrials':frames,'retainedArmTrials':arm_trials,
        'roundSideInlet':{'formula':'Cd integral[0,min(H,D)] 2sqrt((D/2)^2-(z-D/2)^2) sqrt(2g(H-z)) dz',
            'rows':inlet,'requiredHeadCd06MM':needed,'frontReserveAfter46MM':130-20-needed-46,
            'scope':'Unprimed free inlet; full area at30 head is not valid. Downstream pipe priming is not inferred.'},
        'fullPipeSensitivities':pipes,'broadScupperInlets':scuppers,'narrowBootTrials':boots,
        'conditional60SeamCounterexample':{'hypotheticalSeamMM':60,'100Bore2WallODMM':104,'minimumTurnEnvelopeMM':104,
            'nominalMarginMM':-44,'actualWallPointsRadialAlongZRelativeToBed':[[290,103,-1],[520,103,70]],
            'walls':'Downward leg crosses the retained neighbour floor; outward leg crosses its front. No imaginary wall is placed across the open end.',
            'authorityLimit':'The source60 gap belongs to the17.84 m long-arm expansion context. It is NOT an every-root wet-module seam.'},
        'wholeApronTrials':{'foldHalfMM':12.85,'first10OutTopToSlateNominalMM':-2.85,
            'first40OutTopToSlateAfter10Setting6LocalMM':11.15,
            'lift120ToeOverFrontAfter50Native6Local10SettingMM':19,
            'toeOuterAfter400TotalOutMM':672.85,'lowerOuterMM':670,
            'conditions':'Real top clips/underlap, retained turn-down and complete captured rest are missing. Retained neighbour bed-level water cannot be assigned to a top lid.'},
        'bodyRestTrials':body_bay,
        'headLoadInterface':{'sourceHeadSpoolCaptureBoundKG':25,'spoutKG':4,'catchLinerKG':11,'returnKG':5,
            'possibleCatchPostsRailsKG':3,'combinedBeforeBearingPlateOrArmKG':48,
            'splitBearingPlateKG':h.plate_mass,
            'condition':'Native paired-body states must include every absent head part. This receipt does not establish that a revised native family has passed.'},
        'unproved':['Actual one-root module, corner, joint, centroid and complete carrier inventory.',
            'Contained local rain interception before any release, including retained side-end flow and reverse order.',
            'Ground rig/fixed apron relative motion; source dry-diversion release is not a wet-rig proof.',
            'The6200 arm needs joined fork/shoulder/collar/6000-joint geometry and actual native added-wind motions within50 mm.',
            'TheR625-start tray misses the lowerR125..625 footprint andR146 secondary toe; the low dry collar/outlets remain unjoined.',
            'Full body rest/guard/ground-nest capacity and geometry;400 withdrawal is not complete landing.'],
        'validation':{'owningFrameBaselineReproduced':True,'inletQuadratureConverged':True,
            'stockAndGeometryNegativeControlsRetained':True,'wholeRouteAccepted':False}}
    paths=INPUTS+[str(Path(__file__).relative_to(ROOT))]
    result['sourceHashes']={p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in paths}
    return result


def rounded(value):
    if isinstance(value,dict):return {k:rounded(v) for k,v in value.items()}
    if isinstance(value,(list,tuple)):return [rounded(v) for v in value]
    return round(value,9) if isinstance(value,float) else value


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--check',action='store_true')
    args=parser.parse_args();result=compare();content=json.dumps(rounded(result),indent=2)+'\n'
    target=Path(__file__).with_suffix('.json')
    if args.check:assert target.read_text()==content,'Regenerate the unselected outer comparison'
    else:target.write_text(content)
    print(json.dumps({'status':result['status'],'validation':result['validation']},indent=2))
