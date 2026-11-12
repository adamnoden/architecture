"""Finite plan-fit controls for the generation-3 radial roof-guide comparator.

This is a swept-pocket geometry control, not a product or construction detail.
The pocket envelope includes a declared +/-10 mm released-direction travel
reserve, 2 mm running allowance at every pocket edge, and the same independent
+/-5 mm steel-setting budgets used by the finite-detail cage checks.
"""
from pathlib import Path
import json,math
import numpy as np

from floor_portal_house import House,xy,along,inward
from floor_portal_candidate import leading_parameters,SIX_L_KEYS,GUIDE_TRAVEL_RESERVE_MM
from floor_portal_receiver import geometry as receiver_geometry

D=Path(__file__).resolve().parent
JAMB=json.loads((D/'reconciled-house-interface.json').read_text())['jambAndTies']
GROUND=json.loads((D/'current-house-ground-ties.json').read_text())['outer']

TRAVEL_RESERVE=GUIDE_TRAVEL_RESERVE_MM
RUNNING=2.0
SETTING_EACH=5.0
COMBINED_SETTING=2*SETTING_EACH


def point_to_oriented_rectangle(point,centre,long_axis,half_long,half_width):
    e=np.asarray(long_axis,dtype=float);e/=np.linalg.norm(e);n=np.array([-e[1],e[0]])
    d=np.asarray(point,dtype=float)-np.asarray(centre,dtype=float)
    a=max(abs(float(d@e))-half_long,0.)
    b=max(abs(float(d@n))-half_width,0.)
    return math.hypot(a,b)


def footprint_corners(centre,long_axis,half_long,half_width):
    e=np.asarray(long_axis,dtype=float);e/=np.linalg.norm(e);n=np.array([-e[1],e[0]])
    c=np.asarray(centre,dtype=float)
    return [c+s*e*half_long+t*n*half_width for s in (-1,1) for t in (-1,1)]


def jamb_clearance(h,width,obstruction_diameter=12.,half_width=None):
    half_long=width/2+TRAVEL_RESERVE+RUNNING
    half_width=h.p.cap_key_thickness/2+RUNNING if half_width is None else float(half_width)
    bar_radius=obstruction_diameter/2
    minimum=float('inf');cap_margin=float('inf');witness=None
    for j in h.jambs:
        face,u=j['face'],j['u'];qcap,_=h.jamb_section(6515.)
        centre=xy(face,qcap,u)
        radial=centre-np.array([6000.,6000.]);radial/=np.linalg.norm(radial)
        bars=[centre+along(face)[:2]*s+inward(face)[:2]*(q-qcap)
              for s in JAMB['continuousJambH12X'] for q in JAMB['continuousJambH12Q']]
        for bar in bars:
            clear=point_to_oriented_rectangle(bar,centre,radial,half_long,half_width)-bar_radius-COMBINED_SETTING
            if clear<minimum:minimum=clear;witness=(face,u,bar.tolist())
        for corner in footprint_corners(centre,radial,half_long,half_width):
            d=corner-centre
            margin=min(205/2-abs(float(d@along(face)[:2])),180/2-abs(float(d@inward(face)[:2])))
            cap_margin=min(cap_margin,margin)
    return dict(bladeWidthMM=width,obstructionDiameterMM=obstruction_diameter,
                sweptPocketHalfLengthMM=half_long,sweptPocketHalfWidthMM=half_width,
                minimumClearAfterTwo5MMSettingMM=minimum,
                minimumGrossCapEdgeMarginMM=cap_margin,witness=witness)


def point_segment_gap_2d(p,a,b):
    """Euclidean distance from a finite point to a finite plan segment."""
    p=np.asarray(p,dtype=float);a=np.asarray(a,dtype=float);b=np.asarray(b,dtype=float)
    d=b-a;den=float(d@d)
    t=0. if den==0 else max(0.,min(1.,float((p-a)@d)/den))
    return float(np.linalg.norm(p-a-t*d))


def L_union_edge_margin(p,arm_width_mm):
    """Exact exposed boundary of two joined 1000 mm L arms, not both rectangles.

    The re-entrant seams at x=w or y=w inside the 0..w square are *not*
    external concrete faces. Treating a rectangle edge there as cover
    invents a false failure on widened corner comparators.
    """
    x,y=map(float,p);w=float(arm_width_mm)
    assert 0<w<1000
    inside=(0<=x<=1000 and 0<=y<=w) or (0<=x<=w and 0<=y<=1000)
    assert inside,(p,w)
    boundary=((0.,0.),(1000.,0.),(1000.,w),(w,w),(w,1000.),(0.,1000.))
    return min(point_segment_gap_2d(p,boundary[i],boundary[(i+1)%6])
               for i in range(6))


def L_clearance(h,half_width=None,arm_width_mm=140.,stations=SIX_L_KEYS):
    """Plan-only L-arm footprint comparator; the House model is not amended.

    A widened-arm result does not prove its roof connection, force stiffness,
    actual reinforcement relocation, increased mass or occupied rooms.
    """
    half_long=h.p.L_key_width/2+TRAVEL_RESERVE+RUNNING
    half_width=h.p.L_key_thickness/2+RUNNING if half_width is None else float(half_width)
    main=np.asarray(GROUND['primaryBarXY'],dtype=float)
    minimum_main=float('inf');minimum_h12=float('inf');minimum_edge=float('inf');witness=None
    for L in h.Ls:
        sg=np.asarray(L['sg'],dtype=float)
        for centre0 in stations:
            centre=np.asarray(centre0,dtype=float)
            point=L['origin']+sg*centre
            radial=point-np.array([6000.,6000.]);radial/=np.linalg.norm(radial)
            local_axis=radial*sg;local_axis/=np.linalg.norm(local_axis)
            normal=np.array([-local_axis[1],local_axis[0]])
            for bar in main:
                clear=point_to_oriented_rectangle(bar,centre,local_axis,half_long,half_width)-20/2-COMBINED_SETTING
                if clear<minimum_main:minimum_main=clear;witness=(L['corner'],centre0,bar.tolist())
            # Intermediate H12s are known at stations350/600 in each leg but
            # their across-leg lane is not credited. Treat them as if they
            # occupy the worst across coordinate and clear only by station.
            leg_axis=0 if centre0[0]>centre0[1] else 1
            projected=abs(local_axis[leg_axis])*half_long+abs(normal[leg_axis])*half_width
            for station in (350.,600.):
                minimum_h12=min(minimum_h12,abs(centre[leg_axis]-station)-projected-12/2-COMBINED_SETTING)
            for corner in footprint_corners(centre,local_axis,half_long,half_width):
                minimum_edge=min(minimum_edge,L_union_edge_margin(corner,arm_width_mm))
    return dict(LArmWidthMM=arm_width_mm,guideCentres=[list(p) for p in stations],
                bladeWidthMM=h.p.L_key_width,sweptPocketHalfLengthMM=half_long,
                sweptPocketHalfWidthMM=half_width,
                minimumPrimaryH20ClearAfterTwo5MMSettingMM=minimum_main,
                minimumIntermediateH12StationClearAfterTwo5MMSettingMM=minimum_h12,
                minimumGrossLArmEdgeMarginMM=minimum_edge,witness=witness)


def controls():
    h=House(leading_parameters())
    # Boundary negative control: the seam of the horizontal and vertical
    # rectangles is internal union material, not a false exposed face.
    assert abs(L_union_edge_margin((100.,100.),180.)-100.)<1e-9
    historical=jamb_clearance(h,90.,12.)
    previous50=jamb_clearance(h,50.,12.)
    selected_bar=jamb_clearance(h,h.p.cap_key_width,12.)
    selected_weldable=jamb_clearance(h,h.p.cap_key_width,20.)
    overlapping_position=jamb_clearance(h,h.p.cap_key_width,25.)
    receiver=receiver_geometry()
    jamb_receiver_h12=jamb_clearance(h,h.p.cap_key_width,12.,receiver['jamb']['outerReceiverWidthMM']/2)
    jamb_receiver_c13=jamb_clearance(h,h.p.cap_key_width,20.,receiver['jamb']['outerReceiverWidthMM']/2)
    L=L_clearance(h)
    L_receiver=L_clearance(h,receiver['L']['outerReceiverWidthMM']/2)
    assert historical['minimumClearAfterTwo5MMSettingMM']<0,historical
    assert previous50['minimumClearAfterTwo5MMSettingMM']>=5.,previous50
    assert selected_bar['minimumClearAfterTwo5MMSettingMM']>=5.,selected_bar
    # EL12C13N is the only coupler envelope intentionally permitted to
    # overlap the60 mm guide zone. The larger EL12P13LN must sit below it.
    assert selected_weldable['minimumClearAfterTwo5MMSettingMM']>=5.,selected_weldable
    assert overlapping_position['minimumClearAfterTwo5MMSettingMM']<5.,overlapping_position
    assert selected_weldable['minimumGrossCapEdgeMarginMM']>=25.,selected_weldable
    assert jamb_receiver_h12['minimumClearAfterTwo5MMSettingMM']>=5.,jamb_receiver_h12
    assert jamb_receiver_c13['minimumClearAfterTwo5MMSettingMM']>=5.,jamb_receiver_c13
    assert L_receiver['minimumPrimaryH20ClearAfterTwo5MMSettingMM']>=25.,L_receiver
    assert L_receiver['minimumIntermediateH12StationClearAfterTwo5MMSettingMM']>=25.,L_receiver
    assert L['minimumPrimaryH20ClearAfterTwo5MMSettingMM']>=25.,L
    assert L['minimumIntermediateH12StationClearAfterTwo5MMSettingMM']>=25.,L
    assert L['minimumGrossLArmEdgeMarginMM']>=10.,L
    # The selected 140 mm L arm leaves less gross concrete outside the
    # *complete* 46 mm receiver than a deliberately modest 25 mm cover
    # comparator, even before either independent 5 mm steel-setting allowance.
    # No bar clearance or strength pass substitutes for the exterior cover.
    minimum_edge=L_receiver['minimumGrossLArmEdgeMarginMM']
    edge_after_settings=minimum_edge-COMBINED_SETTING
    cover_comparator=25.
    assert minimum_edge<cover_comparator,(minimum_edge,cover_comparator)
    assert edge_after_settings<cover_comparator,(edge_after_settings,cover_comparator)
    assert minimum_edge>19.5 and minimum_edge<19.7,minimum_edge
    # Bounded alternative: widen the L arm from 140 to 180, moving all six
    # guide centres 20 mm inwards across each arm, retaining H20/H12 centres
    # for this local comparison only. No coupled structural re-solve or room
    # change is inferred from a fit computation.
    widened_centres=tuple(
        (x,y+20.) if x>y else (x+20.,y) for x,y in SIX_L_KEYS
    )
    wider_plan=L_clearance(
        h,receiver['L']['outerReceiverWidthMM']/2,
        arm_width_mm=180.,stations=widened_centres,
    )
    wider_after_settings=wider_plan['minimumGrossLArmEdgeMarginMM']-COMBINED_SETTING
    assert wider_after_settings>=cover_comparator,(wider_after_settings,cover_comparator)
    assert wider_plan['minimumPrimaryH20ClearAfterTwo5MMSettingMM']>=25.,wider_plan
    assert wider_plan['minimumIntermediateH12StationClearAfterTwo5MMSettingMM']>=25.,wider_plan
    widened_comparison=dict(
        status='PLAN-ONLY CHALLENGER; HOUSE/ROOF/FLOOR STIFFNESS UNREPLAYED',
        changedLArmWidthMM=180.,
        movedSixGuideCentresAcrossEachArmMM=20.,
        sectionCoverAfterSteelSettingsMM=wider_after_settings,
        sectionPasses25MMExploratoryComparator=True,
        retainedBarPlanClearancesChecked=True,
        necessaryNextProof='Rebuild actual L pier, ring/seat, member mass, foundation '
                           '52-head reactions, physical H20/H12 anchorage and room '
                           'interfaces; retest all 579 demand and head-motion states.',
        sourceNotAdopted=True,
        localGeometry=wider_plan,
    )
    cover_hold=dict(
        status='ADVERSE: COMPLETE L RECEIVER EDGE COVER NOT EARNED',
        currentLArmWidthMM=140.,
        receiverOuterSlotWidthMM=receiver['L']['outerReceiverWidthMM'],
        nominalCoverComparatorMM=cover_comparator,
        minimumGrossEdgeMarginBeforeSteelSettingsMM=minimum_edge,
        independentSettingAllowancesMM=[SETTING_EACH,SETTING_EACH],
        minimumEdgeMarginAfterBothSettingsMM=edge_after_settings,
        shortfallToNominalCoverComparatorAfterSettingsMM=cover_comparator-edge_after_settings,
        passes25MMGrossEdgeCoverWithSettings=False,
        interpretation='The 25 mm cover is an adverse local comparator, not an approved '
                       'statutory or product cover value. A coordinated L-arm, guide '
                       'orientation or cassette redesign must prove real side cover, '
                       'splitting, congestion and all load/room/roof consequences.',
    )
    return dict(status='FINITE SWEPT-POCKET FIT ONLY; hardware and anchorage unqualified',
                releasedDirectionTravelReservePlusMinusMM=TRAVEL_RESERVE,
                runningAllowanceEachPocketEdgeMM=RUNNING,
                independentSteelSettingEachMM=SETTING_EACH,
                historical90JambGuideBareH12Control=historical,
                previous50JambGuideBareH12=previous50,
                selected45JambGuideBareH12=selected_bar,
                selected45JambGuideEL12C13NWeldableEnvelope=selected_weldable,
                forbiddenSamePlaneEL12P13LNEnvelope=overlapping_position,
                fullJambReceiverToH12=jamb_receiver_h12,
                fullJambReceiverToEL12C13N=jamb_receiver_c13,
                LGuides=L,fullLReceiver=L_receiver,
                LReceiverEdgeCoverHold=cover_hold,
                widened180LArmPlanChallenger=widened_comparison)


if __name__=='__main__':
    print(json.dumps(controls(),indent=2))
