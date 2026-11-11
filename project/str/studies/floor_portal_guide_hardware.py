"""Force-path screen for the selected STR-FLOOR-PORTAL guide topology.

This consumes a live full-domain receipt. It is intentionally a hardware
*screen*, not an execution specification: receiver splitting/confinement,
liner selection, weld procedure, corrosion system and anchorage remain separate
acceptance gates.
"""
from pathlib import Path
import argparse,json,math

from floor_portal_guide_fit import controls as fit_controls
from floor_portal_cap_stack import stack as cap_stack
from floor_portal_candidate import GUIDE_TRAVEL_RESERVE_MM,GUIDE_FRICTION_COMPARATOR

S355_FY_MPA=355.0
CONCRETE_FCK_MPA=30.0
CONCRETE_FCD_COMPARATOR_MPA=.85*CONCRETE_FCK_MPA/1.5
SLIDING_FRICTION_COMPARATOR=GUIDE_FRICTION_COMPARATOR


def family_max(bounds,prefix,key):
    rows=[(name,row) for name,row in bounds.items() if name.startswith(prefix)]
    assert rows,(prefix,key)
    return max(rows,key=lambda item:item[1][key])


def screen_family(name,row,width,thickness,depth):
    force_kn=row['maximumDirectionalForceKN']
    root=row['elasticPlateRootScreenMPa']
    shear=force_kn*1000/(width*thickness)
    vm=math.sqrt(root**2+3*shear**2)
    effective_bearing_area=width*depth*.75
    pressure=force_kn*1000/effective_bearing_area
    return dict(
        witness=name,
        forceCase=row['forceCase'],
        forceCaseName=row['forceCaseName'],
        designDirectionalForceKN=force_kn,
        maximumActiveShearMM=row['maximumActiveShearMM'],
        maximumReleasedTravelMM=row['maximumReleasedTravelMM'],
        bladeWidthMM=width,bladeThicknessMM=thickness,engagedDepthMM=depth,
        elasticRootBendingScreenMPa=root,
        directShearScreenMPa=shear,
        rootVonMisesComparatorMPa=vm,
        S355ParentMetalComparatorUtilisation=vm/S355_FY_MPA,
        effectiveTriangularBearingAreaMM2=effective_bearing_area,
        grossConcreteSideBearingPressureMPa=pressure,
        C30GrossBearingComparatorUtilisation=pressure/CONCRETE_FCD_COMPARATOR_MPA,
        radialFrictionForceAtBoundKN=SLIDING_FRICTION_COMPARATOR*force_kn,
    )


def run(receipt):
    params=receipt['parameters'];bounds=receipt['guideBounds'];fit=fit_controls();stack=cap_stack()
    jamb_name,jamb_row=family_max(bounds,'cap-key-','maximumDirectionalForceKN')
    L_name,L_row=family_max(bounds,'L-cap-key-','maximumDirectionalForceKN')
    jamb=screen_family(jamb_name,jamb_row,params['cap_key_width'],params['cap_key_thickness'],params['cap_key_depth'])
    L=screen_family(L_name,L_row,params['L_key_width'],params['L_key_thickness'],params['L_key_depth'])

    assert jamb['S355ParentMetalComparatorUtilisation']<1.,jamb
    assert L['S355ParentMetalComparatorUtilisation']<1.,L
    assert jamb['C30GrossBearingComparatorUtilisation']<1.,jamb
    assert L['C30GrossBearingComparatorUtilisation']<1.,L
    assert max(jamb['maximumReleasedTravelMM'],L['maximumReleasedTravelMM'])<=GUIDE_TRAVEL_RESERVE_MM
    assert fit['selected45JambGuideEL12C13NWeldableEnvelope']['minimumClearAfterTwo5MMSettingMM']>=5.
    assert stack['positionCoupler']['verticalClearAfter5MMSettingMM']>=25.
    assert fit['LGuides']['minimumPrimaryH20ClearAfterTwo5MMSettingMM']>=25.

    return dict(
        status='FORCE-PATH SCREEN ONLY; NOT A FABRICATION OR ANCHORAGE ACCEPTANCE',
        topology=dict(
            vertical='Existing cap compression contact and explicit vertical anchors remain separate; no guide friction or slot-end contact carries vertical or uplift duty.',
            horizontal='Roof-side radial tongue / RC-side guided receiver; broad faces transfer plan-tangential force while the radial axis remains a sliding degree of freedom.',
            root='Parent-metal-developing shop connection required. No partial fillet-weld capacity is credited by this screen.',
            receiver='Positive cast-in/mechanically anchored steel receiver required. Gross concrete side bearing is screened here; splitting, edge breakout, confinement and anchor-group transfer are not.',
            serviceability='Receiver/liner must be inspectable and replaceable without opening primary RC. Debris protection and corrosion isolation are mandatory.',
        ),
        materialComparators=dict(
            tongue='S355 steel strength comparator only; final steel grade, toughness and corrosion system unselected.',
            S355FyMPa=S355_FY_MPA,
            concrete='C30 gross local bearing comparator only; no splitting/confinement acceptance.',
            concreteFcdComparatorMPa=CONCRETE_FCD_COMPARATOR_MPA,
            slidingFrictionComparator=SLIDING_FRICTION_COMPARATOR,
            slidingFrictionBasis='EN 1337 PTFE-guide upper-bound comparator; material selection remains unresolved under MAT policy.',
        ),
        declaredReleasedTravelReservePlusMinusMM=GUIDE_TRAVEL_RESERVE_MM,
        jamb=jamb,L=L,finiteFit=fit,capStack=stack,
        unresolved=[
            'receiver plate/cheek thickness and local bending',
            'concrete splitting, edge breakout and local confinement',
            'receiver anchorage or cast-in shear-transfer detail',
            'shop weld preparation, inspection class and parent-metal development',
            'sliding liner/material pair, wear, corrosion isolation and debris seal',
            '8 percent guide-friction bound must pass the connected demand and movement replays; PTFE itself is not selected under the house material policy',
            'guide receiver/tongue mass and displaced concrete beyond the now-quantified cap couplers',
        ],
    )


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('receipt');p.add_argument('--output');a=p.parse_args()
    result=run(json.loads(Path(a.receipt).read_text()))
    if a.output:Path(a.output).write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({k:result[k] for k in ('status','declaredReleasedTravelReservePlusMinusMM','jamb','L','unresolved')},indent=2))
