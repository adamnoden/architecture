"""Physical quantities of one outward width comparison, including the near-L body."""
from pathlib import Path
from math import pi, asin, cos, sqrt
import json

D=Path(__file__).resolve().parent
H=json.loads((D.parents[1]/'had/studies/water-replan.json').read_text())['model']
opening=next(row for row in H['openings']['FIRST'] if row['wall']=='outer-south' and row['centre']==1800)
rise=opening['head']-opening['spring']
radius=opening['width']**2/(8*rise)+rise/2
angle=asin(opening['width']/2/radius)
arc_length=2*(radius+107.5)*angle
spring=3450+opening['head']-radius+(radius+107.5)*cos(angle)

def control(width):
    extra=width-140
    assert extra in (0,20,40)
    # The fixed foot is 225 normal through Z3020..4000, then tapers over550.
    # All new concrete is outward of the current warm-face plane.
    upper_length=spring-4550
    jamb_extra=205*extra*(upper_length+550/2)
    arch_extra=extra*215*arc_length
    x_arch_end=1800+(radius+107.5)*sin_angle()
    knee_extra=abs(2402.5-x_arch_end)*extra*215
    # At each corner the two arms form ONE L. Count their intersection once.
    leg=1037.5
    old_area=2*leg*140-140**2
    new_area=2*(leg+extra)*width-width**2
    near_extra=(new_area-old_area)*1200
    volume=(8*(jamb_extra+arch_extra+knee_extra)+4*near_extra)/1e9
    # Actual steel centre distances, with the room-side bar held at normal91.
    normal_bars=(49-extra,91)
    nominal_gap=normal_bars[1]-normal_bars[0]-16
    # Opposite adverse5 shifts compress the bar spread by10. The two former
    # 58mm sleeve bays remain geometrically shared; width alone cannot free them.
    max_cover=40
    minimum_width=width-10
    minimum_radial_depth=205
    resistance_area=cage(width,"arch",6000,True)["cellArea"]
    glass=110-extra
    R_other=.13+.1025/.77+.04
    localU=1/(R_other+width/1000/1.7+glass/1000/.045)
    priorU=1/(R_other+.14/1.7+.110/.045)
    surface=8*(205*(upper_length+550/2)+215*arc_length)/1e6
    return {
        'normalWidthNominal':width,'minimumAsBuiltWidthComparison':minimum_width,
        'insideConcreteFace':140,'outsideConcreteFace':140-width,
        'normalH16Centres':normal_bars,'parallelBarClearAfterTwo5':nominal_gap-10,
        'minimumRadialDepthComparison':minimum_radial_depth,'maximumCoverComparison':max_cover,
        'minimumH6CellAreaMm2':resistance_area,
        'remainingOrdinaryGlass':glass,'drainedCavity':50,
        'unchangedFootNormal':225,'unchangedFootGlass':25,
        'nearLNormalBandZ':[5000,6200],'nearLGrossNormalWidth':width,'nearLInsideLegEnds':1037.5,
        'newConcreteM3AcrossEight':volume,'additionalCharacteristicKN':volume*25,
        'newNearLConcreteM3AcrossFour':4*near_extra/1e9,
        'oneDimensionalAddedWPerKOnArchAndJamb':surface*(localU-priorU),
        'oneDimensionalAddedWPerKOnNearBands':8*(leg+extra)/1000*1.2*(localU-priorU),
        'thermalScope':'Separate gross face screens, before 3D thermal returns and overlap reconciliation. Remaining glass is a nominal geometric thickness, not a delivered product guarantee.',
        'sourceRoles':'Gross additions into the old insulation, BEFORE near-L/ring intersection reconciliation and without crediting a displaced masonry weight. The RC arch radial depth and full window opening remain the reference. Verify exposed corners, cast steps, main-bar restraint, local shear-centre transition and 3D thermal/cavity joints.',
        'admitted':False
    }

def sin_angle():
    return opening['width']/2/radius


def cage(width, kind, height, adverse=False):
    """One H16/H6 geometry for strength and actual enclosed torsion area.

    Four H16 axes and the outside H6 loop determine its centreline, not the
    gross concrete box. Adverse cast width/depth -10 and both inward setout5
    challenges are cumulative comparison conditions, not measured tolerances.
    """
    base=json.loads((D/'current-house-arch-detail.json').read_text())['oppositeJambBase']
    fraction=max(0.,min(1.,(4550-height)/550)) if kind=='jamb' else 0.
    b=width+(225-width)*fraction;h=205 if kind=='jamb' else 215
    xs=tuple(v-2300 for v in base['verticalX']) if kind=='jamb' else (49.,166.)
    absolute_normal=tuple(a*(1-fraction)+z*fraction for a,z in zip((49-(width-140),91),base['verticalNormalAtFloor']))
    outside=140-b
    ys=tuple(v-outside for v in absolute_normal)
    loss=10 if adverse else 0;shift=5 if adverse else 0
    xs=(xs[0]+shift,xs[1]-loss-shift)
    ys=(ys[0]+shift,ys[1]-loss-shift)
    # Each H6 centreline lies H16radius8 + H6radius3 outside the main axis.
    radial=xs[1]-xs[0]+22;normal=ys[1]-ys[0]+22
    assert radial>0 and normal>0
    return {'b':b-loss,'h':h-loss,'xs':xs,'ys':ys,
            'cellRadial':radial,'cellNormal':normal,'cellArea':radial*normal,
            'cellPerimeter':2*(radial+normal),'fraction':fraction}
