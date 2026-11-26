"""Read actual chord-free W0 inputs; reject or retain one ordinary L200 cage trial.
Pure geometry only: no new house solve, new envelope or RC resistance claim.
"""
import argparse,copy,gzip,hashlib,json,math
from pathlib import Path

def paired_bend_crossing(top,bottom,radius,stem,along_top,along_bottom):
    if not all(math.isfinite(v) for v in (top,bottom,radius,stem,along_top,along_bottom)) or radius<=0 or top<bottom:
        raise ValueError('Finite ordered bend geometry required')
    gap=top-bottom
    if gap>2*radius:return {'samePlaneCentrelineCrossing':False,'reason':'Vertical separation exceeds two bend radii'}
    across=stem+radius-math.sqrt(max(0.,radius**2-(radius-gap/2)**2))
    return {'samePlaneCentrelineCrossing':along_top==along_bottom,'crossingAcrossMm':across,
            'crossingZMm':(top+bottom)/2,'crossingPlaneSeparationMm':abs(along_top-along_bottom)}

def arc_column_clear(stem,radius,along,direction,main,bar,main_bar,relative_box):
    # Exact XY closest approach to a full-height vertical main bar. Every bend
    # point is inside the continuous proposed main-bar Z zone in this trial.
    across,station=main if direction=='x' else main[::-1]
    dx=max(0.,stem-across,across-(stem+radius))
    dy=abs(along-station)
    nominal=math.hypot(dx,dy)-(bar+main_bar)/2
    adverse=math.hypot(max(0.,dx-relative_box),max(0.,dy-relative_box))-(bar+main_bar)/2
    return {'nominalCylinderClearMm':nominal,'adverseCylinderClearLowerMm':adverse}

def assess(packet,capture):
    if packet['schema']!='str-zero-extra-chord-W0-input/1' or capture['name']!='zero':
        raise ValueError('Actual independently retained zero-extra W0 inputs and response required')
    case=packet['cases']['zero'];b=case['bearingCase']['masonryCase'];f=b['floorReinforcement']
    floor=b['verticalCase']['monolithicCase']['houseCase']['joinedCase']['floor']
    if floor['edgeBand']['axialRigidityKN']!=0 or case['thicknessMm']!=200:
        raise ValueError('Exact-zero additional EA and200 concrete required')
    result=capture['result'];audit=result['audit'];g=audit['solidGeometry']
    if audit['retainedSteelChordEAKN']!=0 or audit['explicitConcreteBandEAKN']!=231000:
        raise ValueError('Zero extra steel must retain the actual concrete band EA')
    required={'mainBarNominalCoverMm':50.,'minimumCoverMm':40.,'cageSettingToleranceMm':5.,
              'independentBarToleranceMm':5.,'minimumIndependentClearMm':21.,'barDiameterMm':16.,'pitchMm':80.}
    # Read authority first. A different actual input requires an explicit new trial.
    for key,value in required.items():
        if f[key]!=value:raise ValueError('Actual controlling floor input changed: '+key)
    slab=g['slabZMm'];rects=g['lowerLRectanglesXYMm'];low=min(r[0] for r in rects)
    if slab!=[3170.,3370.] or rects!=[[low,low,low+200.,low+1000.],[low+200.,low,low+1000.,low+200.]]:
        raise ValueError('Exact actual disjoint L200 and slab datums required')
    bar=f['barDiameterMm'];cover=f['mainBarNominalCoverMm'];tol=f['cageSettingToleranceMm']+f['independentBarToleranceMm']
    top=slab[1]-cover-bar/2;bottom=slab[0]+cover+bar/2
    layers=[bottom,bottom+bar,top-bar,top]
    # ONE explicitly coordinated prospective family. This does not edit native
    # floor steel, mechanical stiffness, G, material choices or the saved account.
    main_bar=12.;link=6.;mandrel=28.;link_cover=45.
    face=link_cover+link/2+(mandrel+link)/2
    stations=[face,200-face,375.,655.,1000-face]
    mains=sorted(({(x,y) for x in stations for y in (face,200-face)}|
                  {(x,y) for y in stations for x in (face,200-face)})-{(200-face,200-face)})
    paths=[]
    for direction in ('x','y'):
        for name,z,turn,offset in [('top',top if direction=='x' else top-bar,-1,200.),
                                   ('bottom',bottom if direction=='x' else bottom+bar,1,235.)]:
            for i in range(11):
                along=offset+70*i
                paths.append({'id':direction+'/'+name+'/'+str(i),'direction':direction,'face':name,
                    'alongMm':along,'startZMm':z,'turn':turn,'stemMm':100.,'insideMandrelMm':300.,
                    'radiusMm':(300.+bar)/2,'straightTailMm':650.})
    comparisons=[]
    for p in paths:
        for index,main in enumerate(mains):
            c=arc_column_clear(p['stemMm'],p['radiusMm'],p['alongMm'],p['direction'],main,bar,main_bar,
                               2*f['independentBarToleranceMm'])
            comparisons.append({'path':p['id'],'mainIndex':index,**c})
    failures=[c for c in comparisons if c['adverseCylinderClearLowerMm']<0]
    nominal=[c for c in comparisons if c['nominalCylinderClearMm']<0]
    worst=min(comparisons,key=lambda c:c['adverseCylinderClearLowerMm'])
    pair_cross=paired_bend_crossing(top,bottom,(300.+bar)/2,100.,200.,235.)
    hoop_z=[3261.,3279.]
    coordinated_relative=f['independentBarToleranceMm']
    intermat=min(abs(z-h) for z in (layers[1],layers[2]) for h in hoop_z)-(bar+link)/2-coordinated_relative
    hoop_pair=abs(hoop_z[1]-hoop_z[0])-link-2*f['independentBarToleranceMm']
    original=paired_bend_crossing(3314.,3226.,106.,100.,100.,100.)
    # A conservative lower bound follows from plane separation alone, even if
    # two skew bend arcs share their XZ crossing under all other perturbations.
    skew_clear=35.-bar-2*f['independentBarToleranceMm']
    return {'schema':'str-current-l200-routed-placing/1','authority':'Actual chord-free W0 geometry and authored floor settings; prospective cage only',
        'sourceSHA256':packet['sourceSHA256'],'actualFloorReinforcement':copy.deepcopy(f),
        'actualAdditionalChordEAKN':audit['retainedSteelChordEAKN'],'actualConcreteBandEAKN':audit['explicitConcreteBandEAKN'],
        'actualSlabZMm':slab,'actualLRectanglesXYMm':rects,
        'originalRejectedH12TopBottomBendCrossing':original,
        'prospectiveChanges':{'localTailPitchMm':70.,'floorBarDiameterMm':bar,'insideMandrelMm':300.,'straightTailMm':650.,
            'topBottomStationOffsetMm':35.,'columnBarCount':len(mains),'columnBarDiameterMm':main_bar,
            'columnBarsRelativeXYMm':mains,'linkDiameterMm':link,'linkMandrelMm':mandrel,'linkSurfaceCoverMm':link_cover,
            'jointHoopPlanesMm':hoop_z,'commonCageCoordinationAssumption':'Common floor/link cage cancels separate whole-cage translation; each bar retains its actual5mm independent box tolerance. This coordination is prospective, not physically demonstrated.'},
        'baselineFloorMatLayerCentresMm':layers,'prospectivePaths':paths,
        'specificChecks':{'skewTopBottomArcCylinderClearLowerMm':skew_clear,
            'coordinatedIntermatHoopClearLowerMm':intermat,'independentHoopPlaneClearLowerMm':hoop_pair,
            'mainBarAdverseCoverMm':face-main_bar/2-tol,'linkAdverseCoverMm':link_cover-f['cageSettingToleranceMm'],
            'tailWallEndAdverseCoverMm':1000.-max(p['alongMm'] for p in paths)-bar/2-tol,
            'arcColumnNominalInterpenetrationCount':len(nominal),'arcColumnAdverseInterpenetrationCount':len(failures),
            'worstArcColumnPair':worst},
        'arcColumnComparisons':comparisons,
        'candidatePlacingAccepted':False,'newSignedEnvelopeAvailable':False,'resistanceAccepted':False,'nativeSolveExecuted':False,
        'decision':'REJECT this one coordinated ordinary family: staggered opposite-face bends remove their mutual crossing but physically intersect longitudinal column bars. Passing the intermat screen does not make the complete cage buildable.',
        'scope':'Removing the shared inner bar to form15 longitudinal bars, H6 links and new local floor stations are not strength-admitted or installed. No old96 force envelope is transferred, no finite-solid D-region or complete path-pair/cover/anchorage proof is claimed.'}

def main():
    p=argparse.ArgumentParser();p.add_argument('--inputs',type=Path,required=True);p.add_argument('--zero',type=Path,required=True);p.add_argument('--out',type=Path,required=True);a=p.parse_args()
    packet=json.loads(a.inputs.read_bytes());capture=json.loads(gzip.decompress(a.zero.read_bytes()))
    value=assess(packet,capture);value['inputFileSHA256']=hashlib.sha256(a.inputs.read_bytes()).hexdigest()
    value['zeroCaptureGzipSHA256']=hashlib.sha256(a.zero.read_bytes()).hexdigest()
    a.out.write_text(json.dumps(value,indent=2,allow_nan=False)+'\n')
    print('L200_PLACING_SUMMARY '+json.dumps({k:value[k] for k in ('originalRejectedH12TopBottomBendCrossing','specificChecks','decision','candidatePlacingAccepted')}))
if __name__=='__main__':main()
