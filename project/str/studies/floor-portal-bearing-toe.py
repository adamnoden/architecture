"""Independent gravity seat and reversible bearing tooth trial at the north Ls."""
from hashlib import sha256
from json import dumps, loads
from math import cos, pi, radians, sin, sqrt
from pathlib import Path
from sys import argv

root, here = Path(argv[1]), Path(__file__).resolve().parent
sources = [
    'project/str/studies/floor-portal-north-collar.json',
    'project/str/studies/current-house-ground-ties.json',
    'project/str/studies/open-loggia-support.json',
    'project/had/studies/open-north-loggia.json',
    'project/mat/studies/loggia-soffit.json',
]
raw = [(root / name).read_bytes() for name in sources]
collar, ground, floor, house, section = map(loads, raw)
soffit, slab_top = section['section']['slabZ']
force = collar['old_new_chord'][1]
width = 860
# U is positive roomward. V starts at the real corner pile axis.
# Put the bearing tooth wholly in slab depth and seat the slab on the wall.
u_wall, u_key = 110., 215.
v_ends, v_ties = [400,640], [441,599]
z_ties = [3240,3300]
setting = 10
load_area_factor = .75
fck, fyd = 30., 500/1.15
f_strut = .6*(1-fck/250)*(.85*fck/1.5)

def positive_bearing(outstand):
    face = (slab_top-soffit-setting)*(outstand-setting)*load_area_factor
    per = force*1000/face
    return {'projectionMm':outstand,'adverseEffectiveFaceMM2':face,'meanPressureMPa':per,
            'meanWithinAuthoredCrackedStrut':per<f_strut}

def pressure_centroid():
    # The most eccentric possible resultant under the declared pressure
    # cap fills the outermost available strip at that cap. Reversal loads
    # the matching opposite V face, never both.
    effective_height=(slab_top-soffit-setting)*load_area_factor
    strip=force*1000/(f_strut*effective_height)
    return u_key-setting/2-strip/2

def gravity(name):
    row=next(r for r in floor['floor_fields'] if r['id']==name)
    v=row['action']['V']*width/1000
    seat_width=100.
    seat_centre=20.
    load_point=190.
    z=row['section']['z']
    return {'field':name,'sourceMKNmPerM':row['action']['M'],'sourceMRKNmPerM':row['section']['MR'],
            'wingVerticalKN':v,'horizontalSeatURangeMm':[seat_centre-seat_width/2,seat_centre+seat_width/2],
            'seatMeanPressureMPa':v*1000/(seat_width*width),'adverseReceivedAtUMm':load_point,
            'independentTieSensitivityKN':v*(load_point-seat_centre)/z}

def offset_witness():
    # Shift both primary face axes together; no change to the lower
    # ground-tie block or unperforated DPC. This is a geometric dogleg.
    move,R,angle=15.,300.,radians(10)
    straight=(move-2*R*(1-cos(angle)))/sin(angle)
    length=2*R*sin(angle)+straight*cos(angle)
    primary=ground['outer']['primaryBarXY']
    u_positions=sorted(set(x-70 for x,y in primary if x<140))
    moved=[u+move for u in u_positions]
    return {'exactLowerPrimaryLocalXYMm':[[x-70,y-70] for x,y in primary],
            'oldAndMovedPairUMm':[u_positions,moved],
            'doglegRAndAngleMmDeg':[R,10],
            'trialStartEndZMm':[2850,2850+length],
            'H8OutsideCoverAfter5Mm':[
                70+moved[0]-10-8-5,u_wall-moved[1]-10-8-5],
            'H10OutsideCoverAfter5Mm':[70+moved[0]-10-10-5,u_wall-moved[1]-10-10-5],
            'fullyYieldedBendTurnForcePerH20KN':2*fyd*pi*10**2*sin(angle/2)/1000}

def tension():
    hard_tip = force*(u_key-u_wall)/1000
    pressured = force*(pressure_centroid()-u_wall)/1000
    lever=(v_ties[1]-v_ties[0])/1000
    reduced_lever=lever-.010
    normal=hard_tip/reduced_lever
    each=normal/2
    heff=124
    vertical=z_ties[1]-z_ties[0]
    # Unbounded cracked group axial cone comparison only. It deliberately
    # omits splitting, head and edge reduction and is not a rated KSN group.
    ideal_cone=8.9*sqrt(fck)*heff**1.5/1.2*(1+vertical/(3*heff))/1000
    bare=2*pi*8**2*fyd/1000
    l=each*1000/(pi*16*2.1)
    available=u_wall-(-35)
    return {'rootMomentAtTipKNm':hard_tip,'rootMomentForBoundedPressureKNm':pressured,
            'normalPairLeverAfter10Mm':reduced_lever*1000,'normalPairTensionAtTipKN':normal,
            'eachOfTwoH16TensionKN':each,'twoBarSteelYieldKN':bare,
            'oldProjectedPoorBondAvailableMm':available,'requiredStraightH16BondMm':l,
            'shortHeadTrialEmbedmentMM':heff,
            'idealCrackedHeadPairConeBeforeSplittingKN':ideal_cone,
            'idealConeMarginToTipKN':ideal_cone-normal,
            'idealConeMinimumVSeparationBefore10Mm':hard_tip*1000/ideal_cone+10,
            'tensionUnderUniformCapMomentKN':pressured/reduced_lever,
            'KSN16SManualGuaranteedFullSpacingMm':1.5*heff,
            'availableRawVerticalPairSpacingMm':vertical,
            'scope':'The ideal axial breakout screen omits confinement, actual design resistance, load sharing and support stiffness. Proprietary slab-box lateral shear is outside the published method.'}

def recessed_bearing_land():
    active_end = 200.
    face_recess = 15.
    edge_setting = 5.
    anchors = tension()
    lever_m = anchors['normalPairLeverAfter10Mm']/1000
    nominal_moment = force*(active_end-u_wall)/1000
    adverse_moment = force*(active_end+edge_setting-u_wall)/1000
    return {
        'activeFace':positive_bearing(active_end-u_wall),
        'bearingEndUMm':active_end,
        'recessedEndUMm':u_key,
        'eachSideRecessMm':face_recess,
        'recessAfterPairedSettingsMm':face_recess-setting,
        'tipContactCeilingKNm':nominal_moment,
        'tipContactCeilingWithEdgeSettingKNm':adverse_moment,
        'adverseAnchorPairDemandKN':adverse_moment/lever_m,
        'marginBelowIdealConeKN':anchors['idealCrackedHeadPairConeBeforeSplittingKN']-adverse_moment/lever_m,
        'admitted':False,
    }

def local_key_boxes():
    axis_a,axis_b=332.5,11667.5
    return {
        'NW north':[axis_a+v_ends[0],axis_b-u_key,axis_a+v_ends[1],axis_b-u_wall],
        'NW west':[axis_a+u_wall,axis_b-v_ends[1],axis_a+u_key,axis_b-v_ends[0]],
        'NE north':[axis_b-v_ends[1],axis_b-u_key,axis_b-v_ends[0],axis_b-u_wall],
        'NE east':[axis_b-u_key,axis_b-v_ends[1],axis_b-u_wall,axis_b-v_ends[0]],
    }

num={
    'status':'Keep independent wall-core gravity bearing as development. Reject the unqualified roomward tooth as structural selection.',
    'sourceHashes':dict(zip(sources,(sha256(b).hexdigest() for b in raw))),
    'geometry':{'backedArmULimitsMm':[-70,u_wall],'keyULimitsMm':[u_wall,u_key],
                'keyVLimitsMm':v_ends,'keyZLimitsMm':[soffit,slab_top],
                'keyBoxesXYXYMm':local_key_boxes(),
                'NWRearCabinetXYWidthDepthMm':house['upperFurniture']['rear-cabinet'],
                'NEPrincipalNorthEmitterXYWidthDepthMm':house['upperFurniture']['service-emitter-principal-N'],
                'normalRestraintGroupVMm':v_ties,'normalRestraintTwoLevelsZMm':z_ties,
                'shiftOfRoomFinishIfAppliedAlongWallMm':u_wall-70,
                'rawWindowPlanReserveAtExistingWingEndMm':
                    min(x['nearestRawPlanReserveMm'] for x in collar['cornerCandidate']['allNearestApertures'].values()),
                'ordinaryInsulationCavityAndBrickMm':collar['cornerCandidate']['unchangedExteriorGlassCavityAndBrickMm']},
    'gravity':[gravity(x) for x in ('NW-W','NE')],
    'toe':offset_witness(),
    'lateral':{'isolatedHistoricalForceKN':force,'crackedStrutPressureComparatorMPa':f_strut,
               'unchanged80ProjectionControl':positive_bearing(80),
               'proposed105Projection':positive_bearing(u_key-u_wall),
               'maxResultantUUnderPressureCapMm':pressure_centroid(),
               'rootMeanShearMPa':force*1000/((v_ends[1]-v_ends[0])*(slab_top-soffit)),
               'tensionComparison':tension(),
               'recessedBearingLand':recessed_bearing_land()},
}
assert not num['lateral']['unchanged80ProjectionControl']['meanWithinAuthoredCrackedStrut']
assert num['lateral']['proposed105Projection']['meanWithinAuthoredCrackedStrut']
assert tension()['requiredStraightH16BondMm']>tension()['oldProjectedPoorBondAvailableMm']
assert tension()['idealConeMarginToTipKN']<0
assert recessed_bearing_land()['activeFace']['meanWithinAuthoredCrackedStrut']
assert recessed_bearing_land()['marginBelowIdealConeKN'] > 0
assert min(offset_witness()['H10OutsideCoverAfter5Mm'])>25
assert v_ties[0]-v_ends[0]-8-5>=25 and v_ends[1]-v_ties[1]-8-5>=25

target=here/'floor-portal-bearing-toe.json'
text=dumps(num,indent=2,sort_keys=True)+'\n'
if '--check' in argv:
    assert target.read_text()==text
else:
    target.write_text(text)
