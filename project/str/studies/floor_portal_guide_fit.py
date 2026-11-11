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


def jamb_clearance(h,width,obstruction_diameter=12.):
    half_long=width/2+TRAVEL_RESERVE+RUNNING
    half_width=h.p.cap_key_thickness/2+RUNNING
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


def L_clearance(h):
    half_long=h.p.L_key_width/2+TRAVEL_RESERVE+RUNNING
    half_width=h.p.L_key_thickness/2+RUNNING
    main=np.asarray(GROUND['primaryBarXY'],dtype=float)
    minimum_main=float('inf');minimum_h12=float('inf');minimum_edge=float('inf');witness=None
    for L in h.Ls:
        sg=np.asarray(L['sg'],dtype=float)
        for centre0 in SIX_L_KEYS:
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
            leg_axis=0 if centre0[1]==70 else 1
            projected=abs(local_axis[leg_axis])*half_long+abs(normal[leg_axis])*half_width
            for station in (350.,600.):
                minimum_h12=min(minimum_h12,abs(centre[leg_axis]-station)-projected-12/2-COMBINED_SETTING)
            for corner in footprint_corners(centre,local_axis,half_long,half_width):
                x,y=corner
                inside=(0<=x<=1000 and 0<=y<=140) or (0<=x<=140 and 0<=y<=1000)
                assert inside,(L['corner'],centre0,corner)
                if 0<=x<=1000 and 0<=y<=140:
                    margins=[x,1000-x,y,140-y]
                else:
                    margins=[x,140-x,y,1000-y]
                minimum_edge=min(minimum_edge,*margins)
    return dict(bladeWidthMM=h.p.L_key_width,sweptPocketHalfLengthMM=half_long,
                sweptPocketHalfWidthMM=half_width,
                minimumPrimaryH20ClearAfterTwo5MMSettingMM=minimum_main,
                minimumIntermediateH12StationClearAfterTwo5MMSettingMM=minimum_h12,
                minimumGrossLArmEdgeMarginMM=minimum_edge,witness=witness)


def controls():
    h=House(leading_parameters())
    historical=jamb_clearance(h,90.,12.)
    previous50=jamb_clearance(h,50.,12.)
    selected_bar=jamb_clearance(h,h.p.cap_key_width,12.)
    selected_weldable=jamb_clearance(h,h.p.cap_key_width,20.)
    overlapping_position=jamb_clearance(h,h.p.cap_key_width,25.)
    L=L_clearance(h)
    assert historical['minimumClearAfterTwo5MMSettingMM']<0,historical
    assert previous50['minimumClearAfterTwo5MMSettingMM']>=5.,previous50
    assert selected_bar['minimumClearAfterTwo5MMSettingMM']>=5.,selected_bar
    # EL12C13N is the only coupler envelope intentionally permitted to
    # overlap the60 mm guide zone. The larger EL12P13LN must sit below it.
    assert selected_weldable['minimumClearAfterTwo5MMSettingMM']>=5.,selected_weldable
    assert overlapping_position['minimumClearAfterTwo5MMSettingMM']<5.,overlapping_position
    assert selected_weldable['minimumGrossCapEdgeMarginMM']>=25.,selected_weldable
    assert L['minimumPrimaryH20ClearAfterTwo5MMSettingMM']>=25.,L
    assert L['minimumIntermediateH12StationClearAfterTwo5MMSettingMM']>=25.,L
    assert L['minimumGrossLArmEdgeMarginMM']>=10.,L
    return dict(status='FINITE SWEPT-POCKET FIT ONLY; hardware and anchorage unqualified',
                releasedDirectionTravelReservePlusMinusMM=TRAVEL_RESERVE,
                runningAllowanceEachPocketEdgeMM=RUNNING,
                independentSteelSettingEachMM=SETTING_EACH,
                historical90JambGuideBareH12Control=historical,
                previous50JambGuideBareH12=previous50,
                selected45JambGuideBareH12=selected_bar,
                selected45JambGuideEL12C13NWeldableEnvelope=selected_weldable,
                forbiddenSamePlaneEL12P13LNEnvelope=overlapping_position,
                LGuides=L)


if __name__=='__main__':
    print(json.dumps(controls(),indent=2))
