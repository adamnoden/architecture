"""One specified clevis family: source-bound necessary component screens, never a house proof.

N/mm/MPa internally. The beam-strip contact model is an exploratory local model,
not validated3D RC resistance. No native producer, retained response or source
account is modified. A failed200mm cover route is preserved, not waived.
"""
import argparse,ast,copy,hashlib,json,math
from pathlib import Path
from xml.sax.saxutils import escape
import xml.etree.ElementTree as ET
import separated_floor_bearing as bearing

ROOT=Path(__file__).resolve().parents[3]
D=Path(__file__).parent
INPUT=D/'three-clevis-inputs.json'

def digest(b):return hashlib.sha256(b).hexdigest()
def gitblob(b):return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
def area(d):return math.pi*d*d/4
def finite_positive(x):return type(x) in (int,float) and math.isfinite(x) and x>0
def load():
    c=json.loads(INPUT.read_bytes())
    for path,expected in c['sourceGitBlobs'].items():
        if gitblob((ROOT/path).read_bytes())!=expected:raise ValueError('Changed owning source: '+path)
    settings,raw=bearing.load()
    # Owning pure geometry and pressure recipe only; no module/native solve is run.
    base,h,grid,furniture=bearing.derive(settings,raw)
    cage_ns={}
    p=ROOT/'project/str/studies/continuous_rc_cage.py'
    tree=ast.parse(p.read_text())
    exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='reference_cage_case'],type_ignores=[]),str(p),'exec'),cage_ns)
    cage=cage_ns['reference_cage_case']()
    floor_ns={'reference_cage_case':lambda:cage}
    p=ROOT/'project/str/studies/floor_reinforcement.py';tree=ast.parse(p.read_text())
    exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='reference_floor_reinforcement_settings'],type_ignores=[]),str(p),'exec'),floor_ns)
    floor=floor_ns['reference_floor_reinforcement_settings']()
    return c,base,h,grid,furniture,cage,floor

def admit(c):
    if c['schema']!='str-three-clevis-inputs/1' or c['status']!='SOURCE-ONLY MINIMUM-SCREEN DEVELOPMENT':raise ValueError('Explicit bounded source required')
    def walk(v):
        if isinstance(v,dict):
            for x in v.values():walk(x)
        elif isinstance(v,list):
            for x in v:walk(x)
        elif type(v) in (int,float) and not math.isfinite(v):raise ValueError('Finite inputs required')
    walk(c)
    for section in ('geometry','movement'):
        for k,v in c[section].items():
            if type(v) in (int,float) and v<=0:raise ValueError('Positive dimensions required: '+k)
    if any(v is not False for v in c['evidence'].values()):raise ValueError('No acceptance injection')
    if c['movement']['shoulderPinClampsCheeks']:raise ValueError('Retainers must clamp pin ends, never cheeks')
    g=c['geometry']
    if not 0<g['pinEndBoreMm']<g['pinDiameterMm'] or g['slotHeightMm']<=g['slotWidthMm']:raise ValueError('Physical pin/slot required')
    if c['material']['comparisonYieldMPa']>c['material']['minimumProofMPa'] or c['material']['comparisonNetFractureMPa']>c['material']['minimumUltimateMPa']:raise ValueError('No strength enhancement')
    if c['demand']['fullHouseDemandAvailable'] or c['material']['frictionIsVerifiedUpperBound']:raise ValueError('Uncomputed global/material facts cannot be admitted')

def dense_solve(a,b):
    n=len(b);a=[list(row)+[v] for row,v in zip(a,b)]
    for k in range(n):
        p=max(range(k,n),key=lambda i:abs(a[i][k]))
        if abs(a[p][k])<1e-10:raise ValueError('Singular local analytical system')
        a[k],a[p]=a[p],a[k]
        d=a[k][k]
        for j in range(k,n+1):a[k][j]/=d
        for i in range(n):
            if i==k:continue
            d=a[i][k]
            for j in range(k,n+1):a[i][j]-=d*a[k][j]
    return [row[-1] for row in a]

def beam_element(ei,l):
    z=ei/l**3
    return [[z*x for x in row] for row in (
        (12,6*l,-12,6*l),(6*l,4*l*l,-6*l,2*l*l),
        (-12,-6*l,12,-6*l),(6*l,2*l*l,-6*l,4*l*l))]

def plate_strip(load_n,width,t,young,bolt_k,concrete_e,core,contact=True):
    """Symmetric250mm plate strip; two actual rods at±80mm and source-face compression.
    Return actual force/energy closure, not a guessed prying multiplier.
    Local springs use E_c/core; stiffness sensitivity is explicit, not3D qualification.
    """
    if not all(finite_positive(x) for x in (width,t,young,bolt_k,concrete_e,core)) or not finite_positive(load_n):raise ValueError('Positive finite plate test')
    ys=[0.,20.,40.,60.,80.,95.,110.,125.];n=2*len(ys);ei=young*width*t**3/12
    kb=[[0.]*n for _ in range(n)];elements=[]
    for k,(a,b) in enumerate(zip(ys,ys[1:])):
        ke=beam_element(ei,b-a);ids=[2*k,2*k+1,2*k+2,2*k+3];elements.append((ke,ids))
        for i,I in enumerate(ids):
            for j,J in enumerate(ids):kb[I][J]+=ke[i][j]
    trib=[(ys[min(i+1,len(ys)-1)]-ys[max(0,i-1)])/2 for i in range(len(ys))]
    fk=[concrete_e/core*width*l if contact else 0. for l in trib]
    free=[i for i in range(n) if i!=1] # actual symmetry rotation zero at plate centre
    force=[0.]*n;force[0]=load_n/2
    active=set();seen=set()
    for iteration in range(40):
        key=tuple(sorted(active))
        if key in seen:raise ValueError('Local compression active-set cycle')
        seen.add(key)
        k=[row[:] for row in kb];k[8][8]+=bolt_k
        for i in active:k[2*i][2*i]+=fk[i]
        reduced=dense_solve([[k[i][j] for j in free] for i in free],[force[i] for i in free])
        u=[0.]*n
        for i,v in zip(free,reduced):u[i]=v
        next_active={i for i in range(len(ys)) if fk[i] and u[2*i]<-1e-12}
        if next_active==active:break
        active=next_active
    else:raise ValueError('Local contact failed to converge')
    rod=bolt_k*u[8];compression=[max(0.,-fk[i]*u[2*i]) for i in range(len(ys))]
    maximum_moment=0.
    for ke,ids in elements:
        f=[math.fsum(row[j]*u[ids[j]] for j in range(4)) for row in ke]
        maximum_moment=max(maximum_moment,abs(f[1]),abs(f[3]))
    twice_energy=math.fsum(u[i]*math.fsum(kb[i][j]*u[j] for j in range(n)) for i in range(n))
    twice_energy+=bolt_k*u[8]**2+math.fsum(fk[i]*u[2*i]**2 for i in active)
    work=math.fsum(a*b for a,b in zip(force,u))
    residual=load_n-2*rod+2*math.fsum(compression)
    pressure=max((v/(width*l) for v,l in zip(compression,trib) if l),default=0.)
    return {'rowLoadN':load_n,'perRodTensionN':rod,'pryingRatio':2*rod/load_n,
        'maxElasticBendingMPa':6*maximum_moment/(width*t*t),'maxConcreteSpringCompressionMPa':pressure,
        'perHalfContactCompressionN':sum(compression),'forceResidualN':residual,
        'twiceEnergyNmm':twice_energy,'externalWorkNmm':work,'workResidualNmm':twice_energy-work,
        'centreDeflectionMm':u[0],'contactNodeYmm':[ys[i] for i in sorted(active)],
        'localModelQualified':False}

def pin_screen(g,m,n,v=0.,axial=0.):
    d,b=g['pinDiameterMm'],g['pinEndBoreMm'];a=area(d)-area(b)
    z=math.pi*(d**4-b**4)/(32*d)
    span=g['cheekInsideGapMm']+g['cheekThicknessMm']
    resultant=math.hypot(n,v);moment=resultant*span/4
    # Full24mm axial bore at every section is conservative against two36mm end bores.
    bending=moment/z;normal=abs(axial)/a;shear=resultant/(2*a)
    vm=math.sqrt((bending+normal)**2+3*shear**2)
    return {'resultantTransverseN':resultant,'spanMm':span,'annularAreaMm2':a,'sectionModulusMm3':z,
        'bendingStressMPa':bending,'doubleShearMPa':shear,'axialStressMPa':normal,
        'vonMisesMPa':vm,'yieldUtilization':vm/m['comparisonYieldMPa']}

def movement(g,v):
    diam=g['pinDiameterMm']+g['pinDiameterToleranceMm'];width=g['slotWidthMm']-g['slotMachiningToleranceMm']
    height=g['slotHeightMm']-g['slotMachiningToleranceMm'];setting=2*v['wallFloorIndependentSettingEachMm']
    tilt=v['otherRotationRad'];projected=diam/math.cos(tilt)+g['bladeThicknessMm']*math.tan(tilt)
    vertical=(height-diam)/2-setting-v['verticalSlipMm']-g['bladeThicknessMm']/2*math.tan(tilt)
    guide=(g['cheekInsideGapMm']-g['bladeThicknessMm'])/2-setting-v['guideSlipMm']-g['bladeHeightMm']/2*math.sin(tilt)
    axis=width-projected-2*v['commonPinAxisAlignmentMm']
    keep=(g['pinLengthMm']-(g['cheekInsideGapMm']+2*g['cheekThicknessMm']))/2
    # Pin MUST slide axially to retain NW along-wall freedom; keepers are another end stop.
    keeper=keep-setting-v['guideSlipMm']-g['bladeHeightMm']/2*math.sin(tilt)
    extraction=g['pinExtractionMm']-(g['pinLengthMm']/2+(g['cheekInsideGapMm']+2*g['cheekThicknessMm'])/2)
    return {'verticalReserveMm':vertical,'guideReserveMm':guide,'matchedAxisReserveMm':axis,
        'keeperTravelReserveMm':keeper,'pinExtractionReserveMm':extraction,
        'unmatchedIndependent10MmAxisWouldFit':width-projected-2*setting>=0,
        'allSpecifiedTravelGeometricallyPossible':min(vertical,guide,axis,keeper,extraction)>0,
        'pinAxisRotationRad':v['pinAxisRotationRad'],'otherRotationRad':tilt,
        'zeroRotationalStiffnessProven':False,'slotEndIsVerticalTieWhenTravelExhausted':True}

def placing(c,cage,floor):
    g,v=c['geometry'],c['movement'];tol=cage['relativeBarBoxToleranceMm'];setting=cage['cageSettingToleranceMm']
    env=g['linkExternalEnvelopeMm'];main=g['mainBarExternalEnvelopeMm'];cover=cage['nominalLinkCoverMm']
    minimum=cage['minimumCoverMm'];mandrel=cage['linkMandrelMm']
    bend=(mandrel+env)/2;centre=cover+env/2+bend
    face=cover+cage['linkDiameterMm']/2+(mandrel+cage['linkDiameterMm'])/2
    corner=math.sqrt(2)*(abs(face-centre)+tol)
    loop_inside=bend-env/2-main/2
    old_cover=cover-setting-g['facePlateThicknessMm']
    extra=(g['comparisonCoreMm']-g['currentCoreMm'])/2
    new_cover=cover+extra-setting-g['facePlateThicknessMm']
    # Actual rod shafts traverse the200mm original cage at y=key±80.
    stations=[face,200-face,(200-face)+800/3,(200-face)+1600/3,1000-face]
    bars=sorted({(x,y) for x in stations for y in (face,200-face)}|{(x,y) for y in stations for x in (face,200-face)})
    rod_y=[650-g['throughRodAlongHalfPitchMm'],650+g['throughRodAlongHalfPitchMm']]
    rod_main=min(abs(y-a) for y in rod_y for a in stations)-2*tol-(g['throughRodExternalEnvelopeMm']+main)/2
    link_rod=[]
    for zs,planes in ((g['westRodZMm'],g['westOldLinkZMm']),(g['southRodZMm'],g['southOldLinkZMm'])):
        link_rod.extend(abs(z-p)-2*tol-(g['throughRodExternalEnvelopeMm']+env)/2 for z in zs for p in planes)
    arm_plane=min(abs(a-b) for a in g['westOldLinkZMm'] for b in g['southOldLinkZMm'])-env-2*tol
    normal_parallel=g['floorAnchorPitchMm']-g['floorAnchorExternalEnvelopeMm']-2*floor['independentBarToleranceMm']
    transverse_parallel=g['transverseMatPitchMm']-g['transverseMatExternalEnvelopeMm']-2*floor['independentBarToleranceMm']
    return {'actualMinimumConcreteCoverMm':minimum,
        'unchanged200RecessedPlateAdverseConcreteCoverMm':old_cover,'unchanged200RouteMeetsCover':old_cover>=minimum,
        'comparison300RecessedPlateAdverseConcreteCoverMm':new_cover,'comparison300RouteMeetsCover':new_cover>=minimum,
        'prospectiveOriginal16H12CoordinatesRelativeOuterCornerMm':[list(x) for x in bars],
        'maximumH8ExternalEnvelopeConditionalMm':env,'maximumH12ExternalEnvelopeConditionalMm':main,
        'sourceH8MandrelAndRibEnvelopeCornerReserveMm':loop_inside-corner,
        'rodToMainCylinderAdverseClearMm':rod_main,'rodToLinkCylinderAdverseClearMm':min(link_rod),
        'orthogonalOldLinkPlanesCylinderAdverseClearMm':arm_plane,
        'floorAnchorParallelAdverseClearMm':normal_parallel,'transverseMatParallelAdverseClearMm':transverse_parallel,
        'parallelMinimumRequiredMm':floor['minimumIndependentClearMm'],
        'coverIsConcreteNotMetalThickness':True,
        'additional300CoreTransverseConfinementAndHookPathsQualified':False,
        'singleInterfaceFieldCrossingsUseCoupledNonpenetratingStack':True,
        'twoIndependentSWNormalAnchorGroupsShareLayersAndFail':True,
        'supplierRibEnvelopeMeasured':False,'completeCageQualified':False}

def assess(c,base,cage,floor):
    admit(c);g,m,v=c['geometry'],c['material'],c['movement']
    source=max(base['maximumAbsoluteThreeConstraintForceKN'])
    if abs(source-c['demand']['minimumPressureOnlyForceKN'])>1e-9:raise ValueError('Minimum screen lost actual pressure provenance')
    if base['slabZMm']!=[3170,3370] or base['firstFFLMm']!=3450:raise ValueError('Changed actual datums require reauthoring')
    n=source*1000*c['demand']['developmentReserve'];fc=floor['concreteCompressionMPa']
    fy=floor['steelYieldMPa']*floor['strengthSteelFraction']
    lo,hi=base['slabZMm'];a=g['floorAnchorExternalEnvelopeMm'];b=g['transverseMatExternalEnvelopeMm']
    cover=floor['mainBarNominalCoverMm'];xb=lo+cover+a/2;xt=hi-cover-a/2;yb=lo+cover+a+b/2;yt=hi-cover-a-b/2
    root=g['floorRootNearXMm']+g['floorRootThicknessMm'];pinx=262.5+200+(g['comparisonCoreMm']-200)/2+g['pinFromComparisonInnerFaceMm']
    floor_arm=root-pinx;wall_arm=g['pinFromComparisonInnerFaceMm']
    asface=g['floorAnchorCountPerFace']*area(g['floorAnchorNominalDiameterMm'])
    rows=[]
    for mu in m['frictionScenarioCoefficients']:
        # Coulomb disk sampled in actual simultaneous directions, NOT mixed maxima.
        for theta in [k*math.pi/12 for k in range(24)] if mu else [0.]:
            vertical=mu*n*math.cos(theta);along=mu*n*math.sin(theta)
            p=pin_screen(g,m,n,vertical,along)
            bar=max(abs(n/(2*asface)+s*vertical*floor_arm/((xt-xb)*asface)) for s in (-1,1))
            floor_shear=abs(vertical)/(2*asface)
            steel_vm=math.sqrt(bar*bar+3*floor_shear*floor_shear)
            rod_z=max(g['southRodZMm']);ecc=abs((sum(g['southRodZMm'])/2)-(lo+hi)/2)+abs(vertical/n)*wall_arm
            row_load=n*(.5+ecc/g['throughRodRowPitchMm'])
            strips=[]
            for ec in m['concreteSpringMPa']:
                strip=plate_strip(row_load,g['bladeHeightMm']/2,g['facePlateThicknessMm'],m['elasticModulusMPa'],
                    m['elasticModulusMPa']*g['throughRodStressAreaMm2']/g['comparisonCoreMm'],ec,g['comparisonCoreMm'])
                # Deliberately full friction resultant per rod; no quarter-shear credit.
                rod_shear=math.hypot(vertical,along)/g['throughRodStressAreaMm2']
                rod_normal=strip['perRodTensionN']/g['throughRodStressAreaMm2']
                strip['rodVonMisesMPa']=math.sqrt(rod_normal**2+3*rod_shear**2)
                strip['concreteSpringMPa']=ec;strips.append(strip)
            moment_floor=abs(vertical)*floor_arm
            weld_length=2*g['bladeHeightMm'];weld_a=g['weldThroatMm']*weld_length
            blade_net=g['bladeThicknessMm']*(g['bladeHeightMm']-g['slotHeightMm'])
            blade_bearing=math.hypot(n,vertical)/(g['pinDiameterMm']*g['bladeThicknessMm'])
            slot_lig=(g['bladeHeightMm']-g['slotHeightMm'])/2
            # Both ends of vertical slot: end bearing +2-ligament tearout; no friction needed to create stop.
            slot_stop=2*g['bladeThicknessMm']*slot_lig*m['comparisonYieldMPa']/math.sqrt(3)
            cheek_net=g['cheekThicknessMm']*(g['bladeHeightMm']-g['pinDiameterMm'])
            full_reaction=math.sqrt(n*n+vertical*vertical+along*along) # worst ONE cheek takes full load
            cheek_bearing=full_reaction/(g['pinDiameterMm']*g['cheekThicknessMm'])
            cheek_moment=abs(vertical)*floor_arm
            cheek_z=g['cheekThicknessMm']*g['bladeHeightMm']**2/6
            cheek_weak_z=g['bladeHeightMm']*g['cheekThicknessMm']**2/6
            cheek_arm=g['floorRootNearXMm']-pinx
            weak_full=abs(along)*cheek_arm/cheek_weak_z
            # At least one of two unbraced flat cheeks carries>=half the side force.
            # Even equal sharing is a necessary lower bound on maximum weak-axis stress.
            weak_best=weak_full/2
            rows.append({'mu':mu,'slipDirectionRad':theta,'forceOnFloorN':[n,along,vertical],
                'floorRootMomentNmm':moment_floor,'wallRodGroupMomentNmm':abs(vertical)*wall_arm,
                'pin':p,'bladeNetStressMPa':math.hypot(n,vertical)/blade_net,
                'bladeBearingMPa':blade_bearing,'bladeFreeEndTearoutMPa':math.hypot(n,vertical)/(2*g['bladeThicknessMm']*(g['bladePastPinMm']-g['slotWidthMm']/2)),
                'slotVerticalStopShearYieldN':slot_stop,
                'fullLoadOnOneCheekBearingMPa':cheek_bearing,'fullLoadOnOneCheekNetStressMPa':full_reaction/cheek_net,
                'oneCheekRootBendingMPa':cheek_moment/cheek_z,
                'oneCheekWeakAxisBendingMPa':weak_full,'bestEqualShareCheekWeakAxisMPa':weak_best,
                'cheekWeakAxisLeverMm':cheek_arm,'weldDirectComparisonShearMPa':full_reaction/weld_a,
                'weldMomentAndBimetalProcedureQualified':False,
                'floorAnchorBarVonMisesMPa':steel_vm,'floorAnchorStraightDevelopmentMm':g['floorAnchorNominalDiameterMm']*steel_vm/(4*floor['bondMPa']),
                'floorAnchorAvailableStraightMm':g['floorAnchorStraightLengthMm'],'facePlateStripModels':strips})
    by_mu=[]
    for mu in m['frictionScenarioCoefficients']:
        same=[r for r in rows if r['mu']==mu]
        by_mu.append({'mu':mu,'pinVMMaxMPa':max(r['pin']['vonMisesMPa'] for r in same),
            'floorBarVMMaxMPa':max(r['floorAnchorBarVonMisesMPa'] for r in same),
            'floorDevelopmentMaxMm':max(r['floorAnchorStraightDevelopmentMm'] for r in same),
            'bestEqualShareCheekWeakAxisMaxMPa':max(r['bestEqualShareCheekWeakAxisMPa'] for r in same),
            'fullOneCheekWeakAxisMaxMPa':max(r['oneCheekWeakAxisBendingMPa'] for r in same),
            'rodVMMaxMPa':max(s['rodVonMisesMPa'] for r in same for s in r['facePlateStripModels']),
            'plateBendingMaxMPa':max(s['maxElasticBendingMPa'] for r in same for s in r['facePlateStripModels']),
            'concreteSpringPeakMaxMPa':max(s['maxConcreteSpringCompressionMPa'] for r in same for s in r['facePlateStripModels']),
            'pryingRatioMax':max(s['pryingRatio'] for r in same for s in r['facePlateStripModels'])})
    pl=placing(c,cage,floor);travel=movement(g,v)
    inter=yt-yb-b-2*floor['independentBarToleranceMm']
    keeper_stress=n*max(m['frictionScenarioCoefficients'])/g['pinRetainerStressAreaMm2']
    cover_stress=(g['coverPointLoadKN']*1000*g['coverClearSpanMm']/4)/(g['coverEffectiveStripWidthMm']*g['coverThicknessMm']**2/6)
    cover_deflection=g['coverPointLoadKN']*1000*g['coverClearSpanMm']**3/(48*m['elasticModulusMPa']*(g['coverEffectiveStripWidthMm']*g['coverThicknessMm']**3/12))
    anchors=[912.5+(i-(g['floorAnchorCountPerFace']-1)/2)*g['floorAnchorPitchMm'] for i in range(g['floorAnchorCountPerFace'])]
    crossing=[(x,y,z) for x in anchors if root<=x<=root+g['floorAnchorStraightLengthMm']
        for y in anchors if root<=y<=root+g['floorAnchorStraightLengthMm'] for z in (xb,xt)]
    sw_root_overlap=g['floorRootThicknessMm']**2*g['floorRootHeightMm']
    # Full seizure has no Coulomb upper bound. Strong metal can transfer major vertical force.
    unit=pin_screen(g,m,1.)
    transverse_capacity=m['comparisonYieldMPa']/unit['vonMisesMPa']
    seizure_vertical=math.sqrt(max(0.,transverse_capacity**2-n*n))
    # Metal volumes are actual geometric primitives: slot + drilled holes subtracted, no nut estimate hidden.
    slot_area=math.pi*(g['slotWidthMm']/2)**2+g['slotWidthMm']*(g['slotHeightMm']-g['slotWidthMm'])
    blade_projection=g['pinFromComparisonInnerFaceMm']+g['bladePastPinMm']
    blade_volume=g['bladeThicknessMm']*(g['bladeHeightMm']*blade_projection-slot_area)
    plate_volume=2*(g['facePlateWidthMm']*g['facePlateHeightMm']-4*area(g['throughRodHoleMm']))*g['facePlateThicknessMm']
    cheek_volume=2*g['cheekThicknessMm']*(g['bladeHeightMm']*(floor_arm+g['cheekAlongNormalHalfDepthAtPinMm'])-area(g['pinDiameterMm']))
    pin_volume=area(g['pinDiameterMm'])*g['pinLengthMm']-2*area(g['pinEndBoreMm'])*g['pinBoreDepthMm']
    root_volume=g['floorRootThicknessMm']*g['floorRootWidthMm']*g['floorRootHeightMm']
    mass={k:v*1e-9*m['densityKgPerM3'] for k,v in {'blade':blade_volume,'facePlates':plate_volume,'cheeks':cheek_volume,'pin':pin_volume,'rootPlate':root_volume}.items()}
    return {'schema':'str-three-clevis-minimum-screen/1','status':'SPECIFIED FLAT-CHEEK FAMILY REJECTED;200 COVER FAILS;300 COVER CHANGE DOES NOT CLOSE CONNECTION',
        'sourceGitBlobs':c['sourceGitBlobs'],'sourceParentCommit':c['parentSourceCommit'],
        'actualSourceDatums':{'slabZMm':base['slabZMm'],'FIRSTMm':base['firstFFLMm'],'oldCoreMm':200},
        'sourcePressureMinimumKN':source,'screenNormalForceKN':n/1000,'developmentReserveIsLoadCombination':False,
        'materialComparisonMPa':{'yield':m['comparisonYieldMPa'],'netFracture':m['comparisonNetFractureMPa'],'concrete':fc,'reinforcement':fy},
        'threeInterfacePointsXYMm':[[pinx,912.5],[912.5,pinx],[pinx,11087.5]],
        'placing':pl,'movement':travel,
        'floorLocalMat':{'normalBarCentresZMm':[xb,xt],'transverseBarCentresZMm':[yb,yt],
            'adverseInterMatParallelClearMm':inter,'barCountsEachFace':g['floorAnchorCountPerFace'],
            'normalBarPositionsAlongMm':[912.5+(i-(g['floorAnchorCountPerFace']-1)/2)*g['floorAnchorPitchMm'] for i in range(g['floorAnchorCountPerFace'])],
            'transverseAreaMm2PerM':area(g['transverseMatNominalDiameterMm'])*1000/g['transverseMatPitchMm'],
            'prospectiveNormalBarsReplaceFieldOver400Mm':True,'floorStrengthOrPocketFramingQualified':False,
            'bimetalWeldAndAnchorageConfinementQualified':False},
        'frictionScenarioSummary':by_mu,'simultaneousFrictionDirections':rows,
        'keeperM24PureAxialStressAtMu1MPa':keeper_stress,'keeperPlatePryingQualified':False,
        'cover5KNPointScreen':{'bendingMPa':cover_stress,'deflectionMm':cover_deflection,'frameAndFinishQualified':False},
        'seizure':{'muIsNotASeizureBound':True,'pinOnlyAdditionalVerticalYieldCapacityAtScreenHKN':seizure_vertical/1000,
            'slotStopCanTransmitVerticalForce':True,'globalLockedKeyForcesCalculated':False,
            'normalOnlyGlobalSolveSufficientForAdoption':False},
        'concreteEdgeActions':{'facePlateHoleEdgeLigamentMm':(g['facePlateWidthMm']/2-g['throughRodAlongHalfPitchMm'])-g['throughRodHoleMm']/2,
            'plateToActualLArmEndMm':1262.5-(912.5+g['facePlateWidthMm']/2),
            'necessaryNominalCompressionMPa':n/(g['facePlateWidthMm']*g['facePlateHeightMm']),
            'transverseSplittingTieDevelopmentScreenKN':n*.5/1000,
            'tieScreenIsComplete3DConcreteResistance':False,'throughRodAvoidsShortBondConeClaim':True,
            'wallStrutSplittingEdgeAndExistingCageConfinementQualified':False},
        'partialMetalMassKgPerInterface':mass,'partialThreeInterfaceMetalGKN':sum(mass.values())*3*9.81/1000,
        'partialMassExcludesRodsNutsKeepersCoversRebarAndConcreteReplacement':True,
        'renewal':{'pinMustBeUnloadedWithTemporaryRatedHorizontalBrace':True,'pinExtractionMm':g['pinExtractionMm'],
            'normalPinCentreSWMm':pinx,'floorRootBarStartSWMm':root,
            'NWServicePocketXmm':[522.5,g['floorRootNearXMm']],
            'NWExistingWCLeftMm':729.5,'proposedNWTemporaryWCEastShiftMm':v['temporaryNWToiletEastShiftMm'],
            'NWRearcabinetAndLowBoxMustBeRemoved':True,'SWBedTemporaryEastShiftMm':v['temporaryBedEastShiftMm'],
            'renewalServicesConnectionsAndLiftingQualified':False},
        'decisions':{'unchanged200RecessedPlateFamilyRejected':not pl['unchanged200RouteMeetsCover'],
            'comparison300ConcreteCoverScreenPasses':pl['comparison300RouteMeetsCover'],
            'wholeSeparatedHouseSolveFundedByThisScreen':False,
            'currentUnbracedFlatCheekFamilyRejectedAtMu06EvenEqualShare':max(r['bestEqualShareCheekWeakAxisMaxMPa'] for r in by_mu if r['mu']==.6)>m['comparisonYieldMPa'],
            'currentSWTwoIndependentFloorAnchorDetailsRejected':bool(crossing) or sw_root_overlap>0,
            'requiredBeforeHouseFunding':['Complete300 local confinement/link-hook and bimetal/root-weld force path,3D concrete face bearing/splitting and eccentric wall section',
                'A physically braced fork or other genuine side-force path without blocking slot/guide travel;200 floor-height envelope remains controlling',
                'One unioned, fabricated SW root assembly and coordinated orthogonal anchorage; independent steel plates/bars currently interpenetrate',
                'Actual pocket perimeter framing and gravity-seat notch geometry; same local mat opening included',
                'Qualified wear pair/maintainable lubrication compatible with no-plastic rule, friction/seizure envelope and ordinary removable covers',
                'Actual renewal space and service disconnections; new outside profile/300core and ground-footprint owner comparison']},
        'physicalRejections':{
            'twoSWRootPlatesInterpenetrateMm3':sw_root_overlap,
            'twoIndependentSWNormalAnchorCylinderCrossingCount':len(crossing),
            'twoIndependentSWNormalAnchorCrossingClearMm':-g['floorAnchorExternalEnvelopeMm'],
            'crossingCoordinatesXYZMm':crossing,
            'rawPressureMu06BestEqualShareCheekWeakAxisMPa':.6*source*1000*(g['floorRootNearXMm']-pinx)/(2*g['bladeHeightMm']*g['cheekThicknessMm']**2/6),
            'crossingsAreNotIntentionalNonpenetratingTiedContacts':True,
            'stiffenedForkAndCoordinatedCrossRootAndMatHaveNotBeenAuthored':True},
        'evidence':copy.deepcopy(c['evidence']),
        'scope':'Necessary source-bound sizing, actual clash/cover/travel and exploratory elastic plate/prying model. No actual house redistribution, full six-wrench interface demand, product, physical, owner or complete RC resistance acceptance.'}

def drawing(c,value):
    g=c['geometry'];s=bearing.Svg(1500,1160,'Three ordinary clevis interfaces: physical development comparison')
    s.text(40,42,'Three clevis interfaces — physical minimum screen','title')
    s.text(40,72,'UNCALCULATED HOUSE / NO PRODUCT OR PHYSICAL ACCEPTANCE /200mm recessed-plate route REJECTED','sub red')
    s.text(40,101,f'Actual floor3170–3370; FIRST3450. Pressure-only minimum94.581kN; component screen{value["screenNormalForceKN"]:.4f}kN.','note')
    s.text(40,135,'SW WEST SECTION /300mm local-core alternative','sub')
    ox,oy,scale=65,740,1.1
    def q(x,z):return ox+(x-150)*scale,oy-(z-3000)*scale
    def rect(x,z,w,h,fill):
        X,Y=q(x,z+h);s.rect(X,Y,w*scale,h*scale,fill)
    rect(212.5,3000,300,750,'#d7e4ef')
    rect(262.5,3000,200,750,'#b3c8dc')
    rect(522.5,3000,140,130,'#ded1b5')
    rect(522.5,3130,140,40,'#fff4df')
    rect(782.5,3170,350,200,'#eee8d9')
    rect(212.5,3155,40,250,'#626b74');rect(472.5,3155,40,250,'#626b74')
    for z in g['westRodZMm']:
        rect(182.5,z-15,360,30,'#8c969e')
    rect(512.5,3175,210,190,'#b6c1c9')
    # Section through blade slot; actual cheeks lie±55mm along the pin.
    X,Y=q(622.5,3270);s.a.append(f'<rect x="{X-32*scale}" y="{Y-52*scale}" width="{64*scale}" height="{104*scale}" rx="{32*scale}" fill="#fff" stroke="#6b737b"/>')
    s.a.append(f'<circle cx="{X}" cy="{Y}" r="{30*scale}" fill="#315c86"/>')
    rect(782.5,3175,40,190,'#626b74')
    for z in value['floorLocalMat']['normalBarCentresZMm']:rect(822.5,z-9,300,18,'#a1262f')
    for x in (331.5,393.5):rect(x,3000,14,750,'#a1262f')
    rect(522.5,3438,260,12,'#626b74')
    for z,label in ((3450,'FIRST3450'),(3370,'slab3370'),(3170,'seat3170'),(3130,'local seat recess40')):
        X,Y=q(170,z);s.line(X,Y,1160,Y,'#aab2b9','stroke-dasharray="4 4"');s.text(1180,Y+4,label,'small')
    s.text(65,175,'Original200 continuity+cage retained inside prospective300 concrete.','note blue')
    s.text(65,199,'50mm added each face;40mm recessed plates retain50mm adverse cover.','note blue')
    s.text(65,223,'Core change, outside110mm glass profile, footing/room/bodyG require actual redesign.','small red')
    s.text(550,280,'D60 pin /24mm end bores','note blue')
    s.text(550,304,'40blade;64×104vertical slot','note')
    s.text(550,328,'2×20cheeks /90inside gap','note')
    s.text(550,352,'4M30 through-rods /250×250×40plates','note')
    s.text(550,376,'16H16 local floor anchor bars:1000straight','note')
    s.text(550,400,'H14/56 transverse mat replaces local H16 field','note')
    s.text(550,424,'Pocket interrupts gravity seat: no normal force through key','small red')
    s.text(550,448,'Plate/prying is a local beam-strip model, not3D concrete proof','small red')
    s.text(40,800,'PIN AXIS / along-wall travel and renewal','sub')
    x0,y0,k=70,865,1.7
    def rr(a,b,w,h,fill):s.rect(x0+a*k,y0+b*k,w*k,h*k,fill)
    rr(30,-30,180,60,'#315c86')
    rr(55,-60,20,120,'#626b74');rr(165,-60,20,120,'#626b74')
    rr(100,-60,40,120,'#c5cdd4')
    rr(14,-50,16,100,'#87929c');rr(210,-50,16,100,'#87929c')
    s.text(70,995,'Keepers clamp PIN ENDS;25mm nominal gap to cheeks.','small')
    s.text(70,1017,'160mm withdrawal +75mm tool; temporary lateral brace first.','small red')
    s.text(70,1039,'NW cabinet +low box removal and70mm WC move; SW bed200mm east.','small red')
    s.text(630,805,'NON-CLAMPING DOES NOT MEAN FRICTIONLESS','sub red')
    for i,row in enumerate(value['frictionScenarioSummary']):
        s.text(630,838+28*i,f'μ={row["mu"]:g}: pinVM{row["pinVMMaxMPa"]:.1f}; rodVM{row["rodVMMaxMPa"]:.1f}; plate{row["plateBendingMaxMPa"]:.1f}MPa','note')
    s.text(630,955,'Flat-cheek weak-axis friction and SW root/mat clashes REJECT family.','small red')
    s.text(630,979,'Dry stainless μ and galling are unqualified; μ0/.3/.6/1 are scenarios.','small red')
    s.text(630,1003,'Seizure/slot ends can restore vertical force and finite frame moments.','small red')
    s.text(630,1027,'Concrete splitting, complete links/hooks, root weld and pocket framing OPEN.','small red')
    s.text(40,1105,'Do not fund a nominal frictionless full-house programme from this component screen. Resolve the listed physical boundaries first.','sub red')
    return s.finish()

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--out',type=Path,required=True);args=ap.parse_args()
    c,base,h,grid,furniture,cage,floor=load();value=assess(c,base,cage,floor)
    args.out.mkdir(parents=True,exist_ok=True);svg=drawing(c,value);ET.fromstring(svg)
    (args.out/'three-clevis-section.svg').write_text(svg)
    value['sourceSHA256']={p:digest((ROOT/p).read_bytes()) for p in list(c['sourceGitBlobs'])+['project/str/studies/three_clevis.py','project/str/studies/three-clevis-inputs.json','project/str/studies/three_clevis_test.py']}
    value['svgSHA256']=digest(svg.encode())
    data=json.dumps(value,indent=2,allow_nan=False)+'\n';(args.out/'three-clevis-comparison.json').write_text(data)
    summary={k:value[k] for k in ('status','sourcePressureMinimumKN','screenNormalForceKN','placing','movement','floorLocalMat','frictionScenarioSummary','seizure','concreteEdgeActions','partialMetalMassKgPerInterface','partialThreeInterfaceMetalGKN','renewal','physicalRejections','decisions','evidence','sourceSHA256','svgSHA256')}
    print('THREE_CLEVIS_SUMMARY '+json.dumps(summary,allow_nan=False))
    print('COMPARISON_SHA256 '+digest(data.encode()))
    print('SVG_SOURCE three-clevis-section.svg '+svg.encode().hex())
if __name__=='__main__':main()
