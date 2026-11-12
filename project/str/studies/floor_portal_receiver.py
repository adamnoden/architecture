"""Metal-only radial-guide receiver screen for STR-FLOOR-PORTAL.

The receiver is an open-topped, mechanically retained cassette:
- steel guide tongue;
- replaceable graphite/bronze bimetal sliding plates;
- thin steel carrier continuously backed by concrete;
- local closed links for bursting/confinement;
- positive steel retention for the radial sliding-friction force.

Main tangential guide force is transferred by direct bearing into concrete.
The retention steel is not credited for that primary compression path.
"""
from pathlib import Path
import argparse,json,math

from floor_portal_candidate import GUIDE_FRICTION_COMPARATOR,GUIDE_TRAVEL_RESERVE_MM
from floor_portal_cap_stack import stack as cap_stack

STEEL_DENSITY=7850.
BRONZE_DENSITY=8800.
CONCRETE_DENSITY=25000/9.81  # Same25 kN/m3 physical RC basis as the coupled mass ledger.
FCK=30.
FCD=.85*FCK/1.5
REBAR_FYD=500/1.15
BOND_COMPARATOR=2.1

RUNNING_EACH=2.
SLIDE_PLATE_THICKNESS_RESERVE=5.
CARRIER_CHEEK_THICKNESS=6.
CARRIER_BASE_THICKNESS=6.
GUIDE_DEPTH=60.
TONGUE_THICKNESS=20.
H8_AREA=math.pi*8**2/4
H8_TWO_LEG_YIELD_KN=2*H8_AREA*REBAR_FYD/1000
RETENTION_LEG_LENGTH=150.
CBM_STATIC_MIN_MPA=260.

# Current UK/Ireland GGB range: GGB-CBM sliding plates, graphite solid
# lubricant in bronze-based matrix, metallic backing, dry friction0.10..0.20,
# static capacity260..280 MPa.
CBM_REFERENCE='https://www.ggbearings.com/sites/default/files/2025-05/ggb-uk-ireland-product-range-bearings-bushings-plates_04-25_0.pdf'


def family_geometry(tongue_width,count,concrete_width):
    slide_length=tongue_width+2*GUIDE_TRAVEL_RESERVE_MM+2*RUNNING_EACH
    clear_slot=TONGUE_THICKNESS+2*RUNNING_EACH
    outer_slot=clear_slot+2*(SLIDE_PLATE_THICKNESS_RESERVE+CARRIER_CHEEK_THICKNESS)
    receiver_depth=GUIDE_DEPTH+CARRIER_BASE_THICKNESS

    tongue_volume=tongue_width*GUIDE_DEPTH*TONGUE_THICKNESS/1e9
    carrier_volume=(2*slide_length*GUIDE_DEPTH*CARRIER_CHEEK_THICKNESS+
                    slide_length*outer_slot*CARRIER_BASE_THICKNESS)/1e9
    slide_volume=2*slide_length*GUIDE_DEPTH*SLIDE_PLATE_THICKNESS_RESERVE/1e9
    displaced_volume=slide_length*outer_slot*receiver_depth/1e9
    hardware_mass=tongue_volume*STEEL_DENSITY+carrier_volume*STEEL_DENSITY+slide_volume*BRONZE_DENSITY

    return dict(
        tongueWidthMM=tongue_width,tongueThicknessMM=TONGUE_THICKNESS,engagedDepthMM=GUIDE_DEPTH,
        releasedTravelReservePlusMinusMM=GUIDE_TRAVEL_RESERVE_MM,
        clearSlidingLengthMM=slide_length,clearSlotWidthMM=clear_slot,
        slidePlateThicknessReserveMM=SLIDE_PLATE_THICKNESS_RESERVE,
        carrierCheekThicknessMM=CARRIER_CHEEK_THICKNESS,carrierBaseThicknessMM=CARRIER_BASE_THICKNESS,
        outerReceiverWidthMM=outer_slot,receiverDepthMM=receiver_depth,
        concreteWidthForBurstingMM=concrete_width,count=count,
        massPerAssemblyKg=hardware_mass,allAssembliesKg=count*hardware_mass,
        concreteDisplacementPerAssemblyM3=displaced_volume,
        concreteDisplacementAllM3=count*displaced_volume,
        assemblyCentroidZ=6515.-receiver_depth/2,
    )


def family_max(bounds,prefix,key):
    rows=[(name,row) for name,row in bounds.items() if name.startswith(prefix)]
    assert rows,(prefix,key)
    return max(rows,key=lambda item:item[1][key])


def screen_family(name,row,geometry,friction):
    force=row['maximumDirectionalForceKN']
    pressure=force*1000/(geometry['tongueWidthMM']*GUIDE_DEPTH*.75)
    friction_force=friction*force

    # Conservative partial-discontinuity screen: use the20 mm tongue thickness
    # as the loaded width even though the actual face is much longer.
    a=TONGUE_THICKNESS;b=geometry['concreteWidthForBurstingMM']
    bursting=.25*(1-a/b)*force
    bond_per_leg=friction_force*1000/2/(math.pi*8*BOND_COMPARATOR) if friction_force else 0.

    assert pressure<CBM_STATIC_MIN_MPA,(name,pressure)
    assert pressure<FCD,(name,pressure,FCD)
    assert bursting<H8_TWO_LEG_YIELD_KN,(name,bursting,H8_TWO_LEG_YIELD_KN)
    assert friction_force<H8_TWO_LEG_YIELD_KN,(name,friction_force,H8_TWO_LEG_YIELD_KN)
    assert bond_per_leg<RETENTION_LEG_LENGTH,(name,bond_per_leg)

    return dict(
        witness=name,forceCase=row['forceCase'],forceCaseName=row['forceCaseName'],
        designTangentialGuideForceKN=force,
        drySlidingFrictionCoefficient=friction,
        maximumRadialFrictionForceKN=friction_force,
        grossConcreteBearingPressureMPa=pressure,
        C30GrossBearingComparatorUtilisation=pressure/FCD,
        GGB_CBM_StaticCapacityComparatorUtilisation=pressure/CBM_STATIC_MIN_MPA,
        partialDiscontinuityBurstingTieDemandKN=bursting,
        oneClosedH8TwoLegYieldComparatorKN=H8_TWO_LEG_YIELD_KN,
        burstingTieYieldComparatorUtilisation=bursting/H8_TWO_LEG_YIELD_KN,
        radialRetentionYieldComparatorUtilisation=friction_force/H8_TWO_LEG_YIELD_KN,
        H8RetentionBondLengthAt2p1MPaPerLegMM=bond_per_leg,
        providedStraightRetentionLegComparatorMM=RETENTION_LEG_LENGTH,
        maximumActiveShearMM=row['maximumActiveShearMM'],
        maximumReleasedTravelMM=row['maximumReleasedTravelMM'],
    )


def geometry():
    # 16 jamb caps and four L piers x six guide stations.
    return dict(
        jamb=family_geometry(45.,16,180.),
        L=family_geometry(70.,24,140.),
    )


def mass_ledger():
    g=geometry();stack=cap_stack()
    receiver_mass=g['jamb']['allAssembliesKg']+g['L']['allAssembliesKg']
    receiver_displacement=g['jamb']['concreteDisplacementAllM3']+g['L']['concreteDisplacementAllM3']
    stack_mass=stack['hardwareMass']['all16JambsKg']
    stack_displacement=stack['netAdditionalConcreteDisplacement']['all16JambsM3']
    total_mass=receiver_mass+stack_mass
    total_displacement=receiver_displacement+stack_displacement
    displaced_concrete_mass=total_displacement*CONCRETE_DENSITY
    return dict(
        guideTongueReceiverAndSlideKg=receiver_mass,
        jambCouplerStackKg=stack_mass,
        totalAddedHardwareKg=total_mass,
        guideReceiverConcreteDisplacementM3=receiver_displacement,
        jambCouplerConcreteDisplacementM3=stack_displacement,
        totalConcreteDisplacementM3=total_displacement,
        displacedConcreteKg=displaced_concrete_mass,
        netAddedMassKg=total_mass-displaced_concrete_mass,
        netAddedGravityKN=(total_mass-displaced_concrete_mass)*9.81/1000,
        note='5 mm graphite/bronze plate thickness is a design reserve pending supplier section selection.'
    )


def run(receipt):
    bounds=receipt['guideBounds'];friction=float(receipt.get('guideFriction',{}).get('coefficient',GUIDE_FRICTION_COMPARATOR) or GUIDE_FRICTION_COMPARATOR)
    g=geometry()
    jname,jrow=family_max(bounds,'cap-key-','maximumDirectionalForceKN')
    lname,lrow=family_max(bounds,'L-cap-key-','maximumDirectionalForceKN')
    jamb=screen_family(jname,jrow,g['jamb'],friction)
    L=screen_family(lname,lrow,g['L'],friction)
    return dict(
        status='RECEIVER FORCE-PATH SCREEN; FINAL FABRICATION/ANCHORAGE DETAIL UNSELECTED',
        slidingMaterialComparator=dict(
            family='GGB-CBM graphite/bronze bimetal sliding plate',
            reference=CBM_REFERENCE,
            dryCoefficientRange=[.10,.20],usedCoefficient=friction,
            minimumStaticCapacityMPa=CBM_STATIC_MIN_MPA,
            materialPolicy='Non-polymer functional comparator. Exact backing alloy, graphite/binder/processing constituents and any supplied film remain MAT qualification duties.',
        ),
        topology=dict(
            mainForce='Tongue -> graphite/bronze slide -> metallic carrier cheek -> continuously backed concrete compression.',
            confinement='Three local closed H8 links at nominal50 mm pitch over the first150 mm below the receiver are the finite comparator; one link already exceeds the conservative bursting tie demand by yield.',
            retention='One H8 U/hairpin two-leg comparator with150 mm developed legs retains the cassette against bounded radial friction only; main tangential guide force is not assigned to this anchor.',
            access='Open-topped cassette; sliding plates must be mechanically retained and replaceable from above when roof-side tongue is disconnected. No adhesive retention is credited.',
        ),
        geometry=g,jamb=jamb,L=L,massLedger=mass_ledger(),
        unresolved=[
            'actual GGB-CBM grade and supplied constituent/film disclosure',
            'carrier cheek/base welds and removable slide mechanical retention',
            '3D link/U-bar lanes around the real H12/H20 cap cages and coupler stacks',
            'concrete edge/splitting check using final receiver/anchor geometry rather than this conservative partial-discontinuity screen',
            'durability/fire cover and corrosion pair for carrier, tongue and bimetal backing',
            'construction sequence, consolidation and inspection access',
        ],
    )


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('receipt');p.add_argument('--output');a=p.parse_args()
    result=run(json.loads(Path(a.receipt).read_text()))
    if a.output:Path(a.output).write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result,indent=2))
