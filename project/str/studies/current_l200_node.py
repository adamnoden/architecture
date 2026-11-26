"""Source-only L200 section and node comparison; never changes the house solve.

Inputs are the actual full signed-proof summary and one raw same-source capture.
The section method is a genuine biaxial strain field in the disjoint L union.
Node chord/free-edge checks are necessary comparisons, not D-region acceptance.
"""
import argparse
import copy
import hashlib
import gzip
import itertools
import json
import math
from pathlib import Path

import numpy as np
from scipy.optimize import least_squares
from continuous_rc_cage import reference_cage_case
from floor_section_successor import necessary_strain_section
from joined_successor_kernel import cross, l_section

METHOD='project/str/studies/current_l200_node.py'

def read_capture(path):
    p=Path(path);value=json.loads(gzip.decompress(p.read_bytes()) if p.suffix=='.gz' else p.read_text())
    return value['result'] if value.get('schema')=='str-current-finite-signed-case/1' else value

def digest(value):
    return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':'),allow_nan=False).encode()).hexdigest()

def controls():
    c=reference_cage_case()
    return {'schema':'str-l200-node-controls/1','barDiameterMm':12.,'linkDiameterMm':c['linkDiameterMm'],
            'linkMandrelMm':c['linkMandrelMm'],'nominalLinkCoverMm':c['nominalLinkCoverMm'],
            'minimumCoverMm':c['minimumCoverMm'],'cageSettingMm':c['cageSettingToleranceMm'],
            'barSettingMm':c['relativeBarBoxToleranceMm'],'minimumParallelClearMm':c['minimumIndependentBarClearanceMm'],
            'steelYieldMPa':c['steelYieldMPa'],'steelComparisonMPa':c['steelYieldMPa']*c['strengthSteelFraction'],
            'concreteCompressionMPa':c['concreteCompressionMPa'],'goodBondMPa':c['goodBondMPa'],
            'poorBondMPa':c['goodBondMPa']*c['poorBondFactor'],'steelModulusMPa':200000.,
            'concretePlateauStrain':.00175,'conservativeConcreteStrainLimit':.00175,
            'linkPitchMm':75.,'ordinaryLinkPitchMm':100.,'fibrePitchMm':25.,
            'floorToLinkIndependentSettingMm':2*c['cageSettingToleranceMm']+c['relativeBarBoxToleranceMm'],
            'floorTrials':[{'barDiameterMm':12.,'pitchMm':100.},{'barDiameterMm':12.,'pitchMm':55.},
                           {'barDiameterMm':14.,'pitchMm':75.},{'barDiameterMm':16.,'pitchMm':80.}]}

def section_geometry(capture,c):
    g=capture['audit']['solidGeometry'];rects=g['lowerLRectanglesXYMm']
    low=min(r[0] for r in rects);end=max(r[2] for r in rects);width=rects[0][2]-rects[0][0]
    expected=l_section(low,width,end)
    if width!=200 or end-low!=1000 or [list(r) for r in expected['rectangles']]!=rects:
        raise ValueError('Actual disjoint 1000×1000 L200 geometry required')
    if max(abs(a-b) for a,b in zip(expected['centreUV'],g['wallCentroidXYMm']))>1e-7:
        raise ValueError('Actual finite wall cut must be at the L centroid')
    face=c['nominalLinkCoverMm']+c['linkDiameterMm']/2+(c['linkMandrelMm']+c['linkDiameterMm'])/2
    stations=[face,width-face,(width-face)+(end-low-width)/3,(width-face)+2*(end-low-width)/3,end-low-face]
    # Two orthogonal two-face rows; the four intersection bars belong once.
    bars=sorted({(low+x,low+y) for x in stations for y in (face,width-face)}|
                {(low+x,low+y) for y in stations for x in (face,width-face)})
    a=math.pi*c['barDiameterMm']**2/4
    pairs=[]
    for p,q in itertools.combinations(bars,2):
        adverse=math.hypot(*(max(0.,abs(x-y)-2*c['barSettingMm']) for x,y in zip(p,q)))-c['barDiameterMm']
        pairs.append(adverse)
    surface=min(min(p[0]-low,p[1]-low,end-p[0],end-p[1],
                    max(low+width-p[0],low+width-p[1])) for p in bars)-c['barDiameterMm']/2-c['cageSettingMm']-c['barSettingMm']
    return {'rectanglesXYMm':rects,'centroidXYMm':expected['centreUV'],'areaMm2':expected['A'],
            'barCoordinatesXYMm':[list(p) for p in bars],'barCount':len(bars),'steelAreaMm2':len(bars)*a,
            'steelAreaFraction':len(bars)*a/expected['A'],'mainBarCentreFaceMm':face,
            'minimumIndependentMainBarClearMm':min(pairs),'minimumMainBarAdverseCoverMm':surface,
            'minimumLinkAdverseCoverMm':c['nominalLinkCoverMm']-c['cageSettingMm'],
            'barPlacementScreenPasses':min(pairs)>=c['minimumParallelClearMm'] and surface>=c['minimumCoverMm'],
            'barZContinuationMm':[g['slabZMm'][0]-1000,g['upperEndZMm']+1000],
            'linkPlanesAtJointMm':{'westArm':[3193.,3268.,3343.],'southArm':[3209.,3284.,3359.]},
            'linkArrangement':'Two closed rectangular arm hoops, physically staggered16mm; intermediate bars need independently anchored cross-ties. This nominal arrangement is tested, not adopted.'}

def fibres(g,pitch):
    x=[];y=[];area=[]
    gauss=(-1/math.sqrt(3),1/math.sqrt(3))
    for a,b,c,d in g['rectanglesXYMm']:
        xs=np.linspace(a,c,math.ceil((c-a)/pitch)+1);ys=np.linspace(b,d,math.ceil((d-b)/pitch)+1)
        for x0,x1 in zip(xs,xs[1:]):
            for y0,y1 in zip(ys,ys[1:]):
                for u,v in itertools.product(gauss,repeat=2):
                    x.append((x0+x1)/2+u*(x1-x0)/2);y.append((y0+y1)/2+v*(y1-y0)/2);area.append((x1-x0)*(y1-y0)/4)
    return np.array(x),np.array(y),np.array(area)

def compatible_section(g,c,demand,pitch=None):
    """Find a plane strain equilibrium witness; do not infer limit capacity.

    Compression is positive, moments about the actual global XY centroid.
    Bilinear no-tension concrete fc*min(e/.00175,1), elastic/plastic steel.
    A deliberately stricter .00175 maximum compression is used for every case.
    Concrete at each discrete bar is subtracted, avoiding double-counted area.
    """
    x,y,a=fibres(g,pitch or c['fibrePitchMm']);cx,cy=g['centroidXYMm']
    b=np.array([[1.,(yy-cy)/1000,-(xx-cx)/1000] for xx,yy in zip(x,y)])
    sb=np.array([[1.,(yy-cy)/1000,-(xx-cx)/1000] for xx,yy in g['barCoordinatesXYMm']])
    bararea=math.pi*c['barDiameterMm']**2/4;target=np.array(demand,float)
    concrete=lambda e:c['concreteCompressionMPa']*np.clip(e/c['concretePlateauStrain'],0.,1.)
    def evaluate(p):
        es=sb@p*.001;stress=np.clip(c['steelModulusMPa']*es,-c['steelComparisonMPa'],c['steelComparisonMPa'])
        force=concrete(b@p*.001)*a
        replaced=(stress-concrete(es))*bararea
        return (b.T@force+sb.T@replaced)/1000,es,stress
    scales=np.array([max(100.,abs(target[0])),max(50.,abs(target[1])),max(50.,abs(target[2]))])
    best=None
    for start in (np.zeros(3),np.array([.1,.2,.2]),np.array([.1,-.2,-.2])):
        fit=least_squares(lambda p:(evaluate(p)[0]-target)/scales,start,xtol=1e-11,ftol=1e-11,gtol=1e-11,max_nfev=150)
        residual=max(abs(evaluate(fit.x)[0]-target))
        if best is None or residual<best[0]:best=(residual,fit.x)
        if residual<1e-7:break
    residual,p=best;actual,es,stress=evaluate(p)
    vertices={point for r in g['rectanglesXYMm'] for point in ((r[0],r[1]),(r[2],r[1]),(r[2],r[3]),(r[0],r[3]))}
    strains=[np.dot([1.,(yy-cy)/1000,-(xx-cx)/1000],p)*.001 for xx,yy in vertices]
    passed=residual<1e-5 and max(strains)<=c['conservativeConcreteStrainLimit']+1e-10 and max(abs(es))<.01
    return {'demandN_Mx_MyKN_KNm':target.tolist(),'integratedN_Mx_MyKN_KNm':actual.tolist(),
            'equilibriumResidualKN_KNm':residual,'strainParametersMilli':p.tolist(),'maximumConcreteCompressionStrain':max(strains),
            'maximumBarAbsoluteStrain':float(max(abs(es))),'barStressesMPa':stress.tolist(),
            'maximumAbsoluteBarStressMPa':float(max(abs(stress))),'compatibleSectionWitnessExists':bool(passed)}

def node_transfer(lower,upper,geometry):
    mid=sum(geometry['slabZMm'])/2000
    out=np.zeros(6)
    for force,z in ((lower,geometry['slabZMm'][0]/1000),(upper,geometry['upperEndZMm']/1000)):
        f=np.array(force,float);f[3:]+=np.cross([0.,0.,z-mid],f[:3]);out+=f
    return out.tolist()

def floor_trial(g,c,trial,transfer_max):
    bar,pitch=trial['barDiameterMm'],trial['pitchMm'];area=math.pi*bar**2/4*1000/pitch
    cover=50.;tol=c['cageSettingMm']+c['barSettingMm'];d=200-cover-1.5*bar-tol
    strip=necessary_strain_section({'settings':{'concreteCompressionMPa':c['concreteCompressionMPa'],
        'steelYieldMPa':c['steelYieldMPa'],'strengthSteelFraction':c['steelComparisonMPa']/c['steelYieldMPa']},
        'section':{'adverseInnerEffectiveDepthMm':d,'barAreaPerMetreEachFaceDirectionMm2':area},
        'momentInspectionKNmPerM':transfer_max})
    # Two orthogonal bars per face; own top and bottom arrays are literal Z.
    layers=[3170+cover+bar/2,3170+cover+1.5*bar,3370-cover-1.5*bar,3370-cover-bar/2]
    link=c['linkDiameterMm']
    coordinated_window=layers[2]-layers[1]-bar-link-2*c['barSettingMm']
    window=layers[2]-layers[1]-bar-link-2*c['floorToLinkIndependentSettingMm']
    minimum_two_hoop_centre_distance=link+2*c['barSettingMm']
    available_end=200-cover-bar/2-tol
    stress=transfer_max*1e6/(.9*d*area)
    lbd=max(bar*stress/(4*c['poorBondMPa']),10*bar,100.)
    full=bar*c['steelYieldMPa']/(4*c['poorBondMPa'])
    return {**trial,'steelAreaEachFaceDirectionMm2PerM':area,'fourLayerGrossSteelFraction':4*area/(1000*200),
            'minimumParallelAdverseClearMm':pitch-bar-2*c['barSettingMm'],'layerCentresZMm':layers,
            'necessaryZeroAxialStrip':strip,'nodeChordStressUsingActualOneMetreWallLengthMPa':stress,'oneMetreChordStressComparatorPasses':stress<=c['steelComparisonMPa'],
            'straightDevelopmentAtChordStressMm':lbd,'fullYieldPoorBondDevelopmentMm':full,
            'actualStraightWallWidthAvailableMm':available_end,'straightFreeEdgeAnchoragePasses':available_end>=lbd,
            'interMatPermissibleLinkCentreWindowMm':window,'minimumTwoIndependentHoopPlaneSpacingMm':minimum_two_hoop_centre_distance,
            'twoHoopsFitInterMatWindow':window>=minimum_two_hoop_centre_distance,
            'nominalDrawnHoopToMatMinimumAdverseClearMm':min(abs(z-h) for z in layers for levels in g['linkPlanesAtJointMm'].values() for h in levels)-(bar+link)/2-c['floorToLinkIndependentSettingMm'],
            'coordinatedSharedCageInterMatWindowMm':coordinated_window,
            'sharedCageCoordinationIsEstablished':False,
            'scope':'One-metre chord bound uses the actual wall length, not an invented wider effective strip. It is a necessary force/geometry test, not internal finite-solid slab moment recovery.'}

def vertical_tail_trial(g,c):
    """Actually draw one conventional alternative, retaining its collisions.

    H12/55 four-layer trial:90deg turns of200mm inside mandrel into real
    continuous L wall,600mm straight tails. No U bend in the200mm slab.
    This path set is rejected if ordinary independent positioning clashes;
    it is not a claim that every possible vertical-tail arrangement fails.
    """
    low=min(r[0] for r in g['rectanglesXYMm']);end=low+1000.;bar=12.;radius=(200.+bar)/2
    stations=[100.+55*i for i in range(17)];paths=[];tails=[]
    for direction in ('x','y'):
        # The shared first corner leg is not duplicated or counted twice.
        active=stations if direction=='x' else stations[1:]
        for along in active:
            for face,z,turn in (('top',3314. if direction=='x' else 3302.,-1),('bottom',3226. if direction=='x' else 3238.,1)):
                fixed=low+along;stem=low+100.;tangent=stem+radius
                points=[]
                for i in range(25):
                    t=(math.pi/2)*i/24;across=tangent-radius*math.sin(t);height=z+turn*radius*(1-math.cos(t))
                    points.append([across,fixed,height] if direction=='x' else [fixed,across,height])
                finish=list(points[-1]);finish[2]+=turn*600.;points.append(finish)
                name=f'{direction}/{face}/{along:g}'
                paths.append({'id':name,'diameterMm':bar,'insideMandrelMm':200.,'pointsXYZMm':points,
                              'verticalStraightTailMm':600.,'bendPlusTailMm':math.pi*radius/2+600.,
                              'fullYieldPoorBondRequiredMm':bar*c['steelYieldMPa']/(4*c['poorBondMPa'])})
                tails.append((name,points[-2],points[-1]))
    comparisons=[];relative=2*(c['cageSettingMm']+c['barSettingMm'])
    for name,a,b in tails:
        for index,p in enumerate(g['barCoordinatesXYMm']):
            separation=math.hypot(*(max(0.,abs(x-y)-relative) for x,y in zip(a[:2],p)))-(bar+c['barDiameterMm'])/2
            comparisons.append({'tailId':name,'longitudinalBarIndex':index,'adverseParallelClearMm':separation})
    worst=min(comparisons,key=lambda x:x['adverseParallelClearMm'])
    minimum_cover=min(min(a[0]-low,a[1]-low,end-a[0],end-a[1],
                          math.hypot(max(0.,low+200-a[0]),max(0.,low+200-a[1]))) for _,a,_ in tails)-bar/2-c['cageSettingMm']-c['barSettingMm']
    return {'schema':'str-l200-conventional-vertical-tail-trial/1','barDiameterMm':bar,'matPitchMm':55.,
            'pathCount':len(paths),'paths':paths,
            'necessaryFullYieldBendMandrelMm':(math.pi*bar**2/4*c['steelYieldMPa'])*(1/(c['minimumCoverMm']+bar/2)+1/(2*bar))/c['concreteCompressionMPa'],'independentCageAndBarRelativeSettingMm':relative,
            'minimumAdverseParallelClearMm':worst['adverseParallelClearMm'],'governingParallelPair':worst,
            'parallelPairsBelow21Mm':sum(x['adverseParallelClearMm']<c['minimumParallelClearMm'] for x in comparisons),
            'minimumTailWallEndAdverseCoverMm':minimum_cover,
            'allTailBondLengthsSufficient':all(p['bendPlusTailMm']>=p['fullYieldPoorBondRequiredMm'] for p in paths),
            'candidateAccepted':False,
            'decision':'REJECT this unshifted vertical-tail field: adequate bond length alone does not avoid column-bar clashes and the actual wall end. Recompose exact tail stations/bar rows before adoption.'}


def longitudinal_alternatives(capture,c,section_rows):
    answers=[]
    for diameter,count in ((10.,5),(16.,4)):
        alt=copy.deepcopy(c);alt['barDiameterMm']=diameter;g=section_geometry(capture,alt)
        if count==4:
            low=min(r[0] for r in g['rectanglesXYMm']);f=g['mainBarCentreFaceMm'];stations=[f,200-f,531.,931.]
            g['barCoordinatesXYMm']=[list(p) for p in sorted({(low+x,low+y) for x in stations for y in (f,200-f)}|{(low+x,low+y) for y in stations for x in (f,200-f)})]
            g['barCount']=len(g['barCoordinatesXYMm']);g['steelAreaMm2']=g['barCount']*math.pi*diameter**2/4
        else:stations=[69.,131.,397.6666666666667,664.3333333333334,931.]
        witnesses=[{'windIndex':r['windIndex'],'cut':r['cut'],**compatible_section(g,alt,r['section']['demandN_Mx_MyKN_KNm'])} for r in section_rows]
        greatest=max(witnesses,key=lambda r:r['maximumAbsoluteBarStressMPa'])
        spacing=max(b-a for a,b in zip(stations,stations[1:]))
        answers.append({'barCount':g['barCount'],'diameterMm':diameter,'steelAreaMm2':g['steelAreaMm2'],
                        'all192SectionWitnessesExist':all(x['compatibleSectionWitnessExists'] for x in witnesses),
                        'governingSectionWitness':greatest,'largestAlongFaceSpacingMm':spacing,
                        'conservativeColumn12MmDiameterComparatorPasses':diameter>=12.,
                        'torsion350MmLongitudinalSpacingComparatorPasses':spacing<=350.,
                        'decision':'Section feasibility alone does not qualify this smaller-diameter or fewer-bar alternative. Retain16H12 while member classification and anchored transverse layout are completed.'})
    return answers


def assess(summary,capture,settings=None):
    c=controls() if settings is None else copy.deepcopy(settings)
    if set(c)!=set(controls()) or any(type(c[k]) not in (int,float) or not math.isfinite(c[k]) or c[k]<=0 for k in c if k not in ('schema','floorTrials')):
        raise ValueError('Explicit positive L node settings required')
    allowed={'barDiameterMm','linkPitchMm','fibrePitchMm','floorTrials'}
    if any(c[k]!=v for k,v in controls().items() if k not in allowed) or not 8<=c['barDiameterMm']<=16 or not 10<=c['fibrePitchMm']<=50 or not 50<=c['linkPitchMm']<=150:
        raise ValueError('Material/cover source assumptions must remain bound; unsupported L comparison')
    if not isinstance(c['floorTrials'],list) or not c['floorTrials'] or any(set(t)!={'barDiameterMm','pitchMm'} or not 8<=t['barDiameterMm']<=16 or not 50<=t['pitchMm']<=200 for t in c['floorTrials']):
        raise ValueError('Explicit bounded floor-bar trials required')
    if summary.get('status')!='all96-current-source-programmes-replayed' or len(summary['cases'])!=96 or {r['windIndex'] for r in summary['cases']}!=set(range(96)):
        raise ValueError('Complete actual96 source programmes required; never mix component extrema')
    if any(summary[k]!=capture[k] for k in ('sourceSHA256','methodSHA256')) or any(summary['runtime'][k]!=capture['runtime'][k] for k in ('numpy','scipy','scikit-fem')):
        raise ValueError('Same source, finite method and runtime capture required')
    document=json.loads(Path('project/ccr/studies/working-house-comparison.json').read_text())
    if digest({'design':document['design'],'stages':document['stages']})!=summary['controllingChoicesSHA256']:
        raise ValueError('Saved controlling house choices changed; signed evidence is stale')
    floor=capture['authoredNativeCase']['bearingCase']['masonryCase']['verticalCase']['monolithicCase']['houseCase']['joinedCase']['floor']
    if floor['cornerWidthsMm']!=document['stages']['distributedFloor']['cornerWidthsMm'] or floor['cornerWidthsMm']!=dict.fromkeys(('NW','NE','SW','SE'),200):
        raise ValueError('Actual uniform200 source widths required')
    if capture['audit']['solidGeometry']['slabZMm']!=[3170.,3370.] or capture['audit']['solidGeometry']['upperEndZMm']!=4370.:
        raise ValueError('Changed actual node datums require re-detailing')
    if capture['settings']!={'enabled':True,'solidPitchMm':140,'youngMPa':8250}:
        raise ValueError('Actual uniform200/140-pitch/8250 comparison required')
    from current_finite_joint_replay import replay
    replay(capture)
    g=section_geometry(capture,c);geometry=capture['audit']['solidGeometry'];rows=[];transfers=[]
    for case in summary['cases']:
        for side in ('lower','upper'):
            w=case['jointWallCutActionsKN_KNm'][side];normal=1 if side=='lower' else -1
            comp=compatible_section(g,c,[normal*w[2],normal*w[3],normal*w[4]])
            # Conservative single-leg flow for simultaneous shear and full
            # torsion assigned to the smaller disjoint arm cell. No shared
            # corner torsion area or two-leg strength enhancement is credited.
            face=g['mainBarCentreFaceMm'];width=200.;arm_depth=800.;cell_b=width-2*face;cell_d=arm_depth-2*face
            cell_area=cell_b*cell_d-(4-math.pi)*((c['linkMandrelMm']+c['linkDiameterMm'])/2)**2
            z=.9*(arm_depth-face-c['barSettingMm']);q_shear=(abs(w[0])+abs(w[1]))*1000/z;q_torsion=abs(w[5])*1e6/(2*cell_area)
            supply=math.pi*c['linkDiameterMm']**2/4*c['steelComparisonMPa']/c['linkPitchMm']
            # Torsion/shear longitudinal demand is deliberately spread over
            # ALL bars only as a uniform additional stress reservation; no
            # unqualified sectional steel strength is added to the house K.
            long_force=(abs(w[0])+abs(w[1]))*1000+q_torsion*2*(cell_b+cell_d)
            added=long_force/g['steelAreaMm2']
            rows.append({'windIndex':case['windIndex'],'cut':side,'physicalWrenchKN_KNm':w,'section':comp,
                         'singleLegCombinedFlowNPerMm':q_shear+q_torsion,'singleLegSupplyNPerMm':supply,
                         'singleLegFlowRatio':(q_shear+q_torsion)/supply,'additionalLongitudinalReservationMPa':added,
                         'largestSectionStressPlusReservationMPa':comp['maximumAbsoluteBarStressMPa']+added,
                         'scope':'Necessary six-component sectional reservations. The disjoint-arm thin-cell torsion/strut model and the local D-region are not qualified.'})
        transfers.append({'windIndex':case['windIndex'],'wrenchAboutActualSlabMidplaneKN_KNm':node_transfer(case['jointWallCutActionsKN_KNm']['lower'],case['jointWallCutActionsKN_KNm']['upper'],geometry)})
    greatest=max(transfers,key=lambda r:max(abs(r['wrenchAboutActualSlabMidplaneKN_KNm'][3]),abs(r['wrenchAboutActualSlabMidplaneKN_KNm'][4])))
    maximum=max(abs(v) for r in transfers for v in r['wrenchAboutActualSlabMidplaneKN_KNm'][3:5])
    main_anchor=c['barDiameterMm']*c['steelYieldMPa']/(4*c['goodBondMPa'])
    return {'schema':'str-current-l200-node-comparison/1','controls':c,'geometry':g,
            'signedSummarySHA256':digest(summary),'controllingChoicesSHA256':summary['controllingChoicesSHA256'],'geometryCaptureSHA256':digest(capture),'sourceSHA256':summary['sourceSHA256'],'methodSHA256':summary['methodSHA256'],
            'consumerSHA256':{path:hashlib.sha256(Path(path).read_bytes()).hexdigest() for path in (METHOD,'project/str/studies/continuous_rc_cage.py','project/str/studies/joined_successor_kernel.py','project/str/studies/floor_section_successor.py','project/str/studies/current_finite_joint_replay.py')},
            'sourceCommit':summary['sourceCommit'],'signedProofRuntime':summary['runtime'],'geometryCaptureRuntime':capture['runtime'],'caseCount':96,'physicalCutCount':len(rows),'sectionCases':rows,
            'allBiaxialCompatibleSectionWitnessesExist':all(r['section']['compatibleSectionWitnessExists'] for r in rows),
            'governingCompatibleSectionStress':max(rows,key=lambda r:r['section']['maximumAbsoluteBarStressMPa']),
            'governingSixComponentReservation':max(rows,key=lambda r:r['largestSectionStressPlusReservationMPa']),
            'governingLinkFlow':max(rows,key=lambda r:r['singleLegFlowRatio']),
            'wallNetActionsAtSlabMidplane':transfers,'governingNodeCouple':greatest,
            'floorTrials':[floor_trial(g,c,t,maximum) for t in c['floorTrials']],
            'verticalTailTrial':vertical_tail_trial(g,c),'longitudinalAlternatives':longitudinal_alternatives(capture,c,rows),
            'longitudinalContinuity':{'barDiameterMm':c['barDiameterMm'],'fullYieldGoodBondDevelopmentMm':main_anchor,
                'availableEachSideOfActualCutMm':1000-c['barSettingMm'],'necessaryStraightBondFits':1000-c['barSettingMm']>=main_anchor,
                'lapInsideSlabOrUpperStubProposed':False,'wholeWallFoundationAndRoofAnchorageAccepted':False},
            'decision':'REJECT the nominal two-arm cage plus straight-ended four-layer slab as a complete monolithic node. Compatible L sections do not resolve link/mat packing, anchored intermediate-bar restraints, slab end anchorage or the D-region.',
            'candidateAccepted':False,'resistanceAccepted':False,'reinforcementAccepted':False,'anchorageAccepted':False,'completeHouseProof':False,
            'nextConstructiveChoice':'Develop fewer larger local slab bars with vertical tails in the actual continuous RC wall, verifying every tail against longitudinal bars and links; or compare direct floor bearing with continuous RC lateral/roof corners through a fresh physical model. No new load path is credited here.'}

def drawing(report):
    g=report['geometry'];low=min(r[0] for r in g['rectanglesXYMm']);scale=.44
    xy=lambda p:(55+(p[0]-low)*scale,90+(1000-(p[1]-low))*scale)
    out=['<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="730" viewBox="0 0 1120 730">',
         '<style>text{font-family:Arial,sans-serif;fill:#252525} .small{font-size:14px} .title{font-size:22px;font-weight:bold}</style>',
         '<rect width="1120" height="730" fill="#fcfaf5"/>',
         '<text class="title" x="40" y="35">L200 actual-section / rejected complete-node comparison</text>',
         '<text class="small" x="40" y="62">One finite SW joint · 96 simultaneous source cases · no adopted RC resistance or cage</text>']
    for a,b,c,d in g['rectanglesXYMm']:
        x,y=xy([a,d]);out.append(f'<rect x="{x}" y="{y}" width="{(c-a)*scale}" height="{(d-b)*scale}" fill="#ddd9cf" stroke="#666"/>')
    for p in g['barCoordinatesXYMm']:
        x,y=xy(p);out.append(f'<circle cx="{x}" cy="{y}" r="{report["controls"]["barDiameterMm"]*.5*scale}" fill="#a2452d"/>')
    for rect in ([low+49,low+49,low+151,low+951],[low+49,low+49,low+951,low+151]):
        a,b,c,d=rect;x,y=xy([a,d]);out.append(f'<rect x="{x}" y="{y}" width="{(c-a)*scale}" height="{(d-b)*scale}" rx="{20*scale}" fill="none" stroke="#246080" stroke-width="{8*scale}"/>')
    lines=[f'{g["barCount"]}H12 longitudinal bars / {g["steelAreaMm2"]:.1f} mm² / {100*g["steelAreaFraction"]:.3f}% gross',
           f'Min adverse main clear {g["minimumIndependentMainBarClearMm"]:.1f} mm; cover {g["minimumMainBarAdverseCoverMm"]:.1f} mm',
           'Two H8 rounded arm hoops shown at different Z planes.',
           'Intermediate anchored cross-ties are NOT resolved by this drawing.',
           f'All 192 compatible biaxial cut witnesses: {report["allBiaxialCompatibleSectionWitnessesExist"]}',
           f'Max section stress {report["governingCompatibleSectionStress"]["section"]["maximumAbsoluteBarStressMPa"]:.2f} MPa',
           f'Largest actual node couple {max(abs(v) for v in report["governingNodeCouple"]["wrenchAboutActualSlabMidplaneKN_KNm"][3:5]):.2f} kNm',
           'Necessary one-metre slab chord and actual free-edge run follow below.']
    for i,t in enumerate(lines):out.append(f'<text class="small" x="540" y="{115+27*i}">{t}</text>')
    for i,r in enumerate(report['floorTrials']):
        text=f'H{r["barDiameterMm"]:g}/{r["pitchMm"]:g}: node stress {r["nodeChordStressUsingActualOneMetreWallLengthMPa"]:.1f} MPa; anchor {r["straightDevelopmentAtChordStressMm"]:.0f}/{r["actualStraightWallWidthAvailableMm"]:.0f} mm; two-hoop fit {r["twoHoopsFitInterMatWindow"]}'
        out.append(f'<text class="small" x="540" y="{385+30*i}">{text}</text>')
    out.extend(['<text class="small" x="40" y="620">Finite slab Z3170–3370; lower cut3170; upper stub to4370. Global XY section centroid584.722/584.722 mm.</text>',
                '<text class="small" x="40" y="650">REJECT complete-node adoption: ordinary sectional steel alone does not establish a buildable, anchored monolithic load path.</text>',
                '<text class="small" x="40" y="680">Reference design — not released for construction. No solver geometry, stiffness, mass or head action changed.</text>','</svg>'])
    return ''.join(out)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--summary',required=True);p.add_argument('--capture',required=True);p.add_argument('--out',required=True);p.add_argument('--svg',required=True);a=p.parse_args()
    result=assess(json.loads(Path(a.summary).read_text()),read_capture(a.capture))
    result['inputArtifactSHA256']={'signedSummary':hashlib.sha256(Path(a.summary).read_bytes()).hexdigest(),'geometryCapture':hashlib.sha256(Path(a.capture).read_bytes()).hexdigest()}
    Path(a.out).write_text(json.dumps(result,indent=2,allow_nan=False)+'\n');Path(a.svg).write_text(drawing(result)+'\n')
    print(json.dumps({k:result[k] for k in ('caseCount','physicalCutCount','allBiaxialCompatibleSectionWitnessesExist','decision')},allow_nan=False))
