"""Finite jamb roof-cap coupler-stack geometry for STR-FLOOR-PORTAL.

Dimensions are current nVent LENTON catalogue inputs, not product acceptance.
The purpose is to prove that the large position coupler is kept out of the
60 mm radial-guide zone and to bind the resulting conservative axial-compliance
length into the connected model.

Official sources:
https://www.nvent.com/sites/default/files/acquiadam/assets/LENTON-CAT-CP7J-TaperThreadedRebarSystem-UKEN.pdf
https://www.nvent.com/sites/default/files/acquiadam/assets/C1335S-EUEN.pdf
"""
import json,math

from floor_portal_candidate import (
    JAMB_CAP_ANCHOR_EQUIVALENT_LENGTH_MM,
    JAMB_GUIDE_WIDTH_MM,
    leading_parameters,
)

CAP_UNDERSIDE_Z=6515.0
CAP_TOP_Z=6540.0
GUIDE_DEPTH=60.0
GUIDE_BOTTOM_Z=CAP_UNDERSIDE_Z-GUIDE_DEPTH

# EL12C13N weldable half: conservative full-length use of its maximum20 mm OD.
C13_LENGTH=40.0
C13_DIAMETER_MAX=20.0
C13_BAR_DEPTH=19.0
C13_MASS_KG=0.06

# EL12P13LN position coupler. Full open envelope is the adverse geometry/mass
# placement control; its actual external profile is no larger than25 mm OD.
P13_LENGTH_CLOSED=124.1
P13_LENGTH_OPEN=159.3
P13_DIAMETER_MAX=25.0
P13_BAR_DEPTH=19.0
P13_BAR_GAP_CLOSED=86.1
P13_BAR_GAP_OPEN=121.3
P13_BODY_LENGTH=74.7
P13_MASS_KG=0.36

# Short factory taper-threaded H12 piece between the weldable half and P13.
# 100 mm is a geometry comparator pending fabricator minimum handling/threading.
STUB_LENGTH=100.0
BAR_DIAMETER=12.0
STEEL_DENSITY_KG_M3=7850.0
SETTING_VERTICAL=5.0
MIN_VERTICAL_SEPARATION=25.0

DEVELOPMENT_COMPARISON=621.0
CAP_EQUIVALENT=25.0


def stack():
    c13_top=CAP_UNDERSIDE_Z
    c13_bottom=c13_top-C13_LENGTH
    upper_stub_tip=c13_bottom+C13_BAR_DEPTH
    lower_stub_tip=upper_stub_tip-STUB_LENGTH
    p13_top=lower_stub_tip+P13_BAR_DEPTH
    p13_bottom_closed=p13_top-P13_LENGTH_CLOSED
    p13_bottom_open=p13_top-P13_LENGTH_OPEN
    lower_bar_tip_closed=p13_bottom_closed+P13_BAR_DEPTH
    lower_bar_tip_open=p13_bottom_open+P13_BAR_DEPTH

    # Independent arithmetic identity: bar-tip separation must reproduce the
    # manufacturer's closed/open bar-gap values.
    assert abs((lower_stub_tip-lower_bar_tip_closed)-P13_BAR_GAP_CLOSED)<1e-9
    assert abs((lower_stub_tip-lower_bar_tip_open)-P13_BAR_GAP_OPEN)<1e-9

    vertical_clear=GUIDE_BOTTOM_Z-p13_top
    assert GUIDE_BOTTOM_Z<c13_bottom<CAP_UNDERSIDE_Z,(GUIDE_BOTTOM_Z,c13_bottom,CAP_UNDERSIDE_Z)
    assert vertical_clear-SETTING_VERTICAL>=MIN_VERTICAL_SEPARATION,(vertical_clear,SETTING_VERTICAL)

    equivalent=(DEVELOPMENT_COMPARISON+P13_LENGTH_OPEN+STUB_LENGTH+C13_LENGTH+CAP_EQUIVALENT)
    assert abs(equivalent-JAMB_CAP_ANCHOR_EQUIVALENT_LENGTH_MM)<1e-9,(equivalent,JAMB_CAP_ANCHOR_EQUIVALENT_LENGTH_MM)

    area_bar=math.pi*BAR_DIAMETER**2/4
    stub_mass=area_bar*STUB_LENGTH*STEEL_DENSITY_KG_M3/1e9
    per_line_mass=C13_MASS_KG+P13_MASS_KG+stub_mass

    # Net additional concrete displacement above the pre-existing H12 bar
    # envelope. The full20/25 mm cylindrical envelopes are conservative.
    net_extra_volume=(
        math.pi*(C13_DIAMETER_MAX**2-BAR_DIAMETER**2)/4*C13_LENGTH+
        math.pi*(P13_DIAMETER_MAX**2-BAR_DIAMETER**2)/4*P13_LENGTH_OPEN
    )/1e9

    # Four force lines per jamb, sixteen jambs.
    lines=4*16
    return dict(
        status='FINITE COUPLER-STACK GEOMETRY; FABRICATION AND COVER NOT YET ACCEPTED',
        guide=dict(
            bladeWidthMM=JAMB_GUIDE_WIDTH_MM,
            topZ=CAP_UNDERSIDE_Z,
            bottomZ=GUIDE_BOTTOM_Z,
            depthMM=GUIDE_DEPTH,
        ),
        weldableHalf=dict(
            product='EL12C13N',topZ=c13_top,bottomZ=c13_bottom,
            maximumEnvelopeDiameterMM=C13_DIAMETER_MAX,lengthMM=C13_LENGTH,
            barDepthMM=C13_BAR_DEPTH,massKg=C13_MASS_KG,
            overlapsGuideDepthMM=max(0.,min(c13_top,CAP_UNDERSIDE_Z)-max(c13_bottom,GUIDE_BOTTOM_Z)),
        ),
        threadedStub=dict(
            nominalLengthMM=STUB_LENGTH,
            upperTipZ=upper_stub_tip,lowerTipZ=lower_stub_tip,
            diameterMM=BAR_DIAMETER,massKg=stub_mass,
            manufacturingMinimumLengthQualified=False,
        ),
        positionCoupler=dict(
            product='EL12P13LN',topZ=p13_top,
            bottomZClosed=p13_bottom_closed,bottomZOpen=p13_bottom_open,
            maximumEnvelopeDiameterMM=P13_DIAMETER_MAX,
            lengthClosedMM=P13_LENGTH_CLOSED,lengthOpenMM=P13_LENGTH_OPEN,
            barGapClosedMM=P13_BAR_GAP_CLOSED,barGapOpenMM=P13_BAR_GAP_OPEN,
            bodyLengthMM=P13_BODY_LENGTH,massKg=P13_MASS_KG,
            verticalClearBelowGuideMM=vertical_clear,
            verticalClearAfter5MMSettingMM=vertical_clear-SETTING_VERTICAL,
            overlapsGuide=False,
        ),
        lowerBarTipAdjustmentWindowZ=[lower_bar_tip_open,lower_bar_tip_closed],
        lowerBarTipAdjustmentRangeMM=lower_bar_tip_closed-lower_bar_tip_open,
        conservativeH12EquivalentAxialLengthMM=equivalent,
        hardwareMass=dict(
            perForceLineKg=per_line_mass,perJambKg=4*per_line_mass,
            all16JambsKg=lines*per_line_mass,
            excludesGuideReceiverTongueWeldAndProtection=True,
        ),
        netAdditionalConcreteDisplacement=dict(
            perForceLineM3=net_extra_volume,
            all16JambsM3=lines*net_extra_volume,
            note='Full cylindrical20/25 mm coupler envelopes minus the H12 bar volume; actual profiles are smaller.',
        ),
        unresolved=[
            '100 mm double-taper-threaded H12 stub fabrication/handling minimum',
            'EL12C13N weld preparation and parent-metal-developing shop weld',
            'position-coupler installation access and required torque/inspection',
            'local concrete cover/fire/durability around the25 mm coupler envelope',
            'final closure-pour sequence and consolidation around four couplers',
        ],
    )


if __name__=='__main__':
    result=stack()
    print(json.dumps(result,indent=2))
