"""Place the north eave, hip and ridge weather stack on the welded STR proposal."""
import argparse
import json
import math
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parents[1]


def read(path):
    return json.loads((PROJECT / path).read_text())


def compare():
    roof = read('had/studies/water-replan.json')['model']['roofDevelopment']
    old = read('mat/studies/ordinary-eave-joined.json')
    edge = read('mat/studies/loggia-roof-edge.json')
    network = read('str/studies/current-house-welded-network.json')
    heel = read('str/studies/current-house-welded-heel.json')
    elevations = read('str/studies/current-house-roof-route.json')['referenceElevations']
    angle = math.radians(roof['pitch'])
    cosine, slope = math.cos(angle), math.tan(angle)
    layers = dict(roof['normalLayers'])
    deck_depth = roof['totalNormal'] - layers['primary']
    assert abs(deck_depth-sum(v for k,v in layers.items() if k != 'primary')) < 1e-6
    eave, ridge = elevations['eave'], elevations['ridgeCover']
    axis_y = old['occurrence']['structuralAxisWorldY']
    axis_q = 12000-axis_y
    assert math.isclose(ridge, eave+roof['ridgeInset']*slope, abs_tol=.001)
    ordinary, hip = (heel['node'][k] for k in ('ordinary','hip'))
    board_at_heel = eave+axis_q*slope-deck_depth/cosine
    proposed_pack = 10  # normal to the weather plane at the limiting hip edge
    raw_pack = (board_at_heel-hip['roofStructuralTopNeed'])*cosine
    lift = (proposed_pack-raw_pack)/cosine
    hip_cross_rise = network['sections']['primary']['B']/2*slope/math.sqrt(2)
    rings = heel['ring']
    cassette = 300  # the square welded cassette, not the inclined heel shoe
    assert '300 square cassette' in rings['connection']
    glass_outer = edge['ordinaryWall']['glass'][0]
    axes = network['ordinaryStations']
    roof_delta = eave+lift-roof['eavesDatum']
    cold = old['cold']
    outlets = [cold['zincEdgeZ']+roof_delta, cold['breatherDripZ']+roof_delta]
    gutter = [cold[k]+roof_delta for k in ('gutterBottom','gutterFrontSpill','gutterBackCrest')]
    # The vertical 150-deep ridge purlin in the roof-route solver straddles
    # two descending faces. The outboard top corners govern, not its axis.
    purlin = network['sections']['secondary']
    upper = elevations['ridgePurlinCentre']+purlin['H']/2
    toe = purlin['B']/2
    low_board_at_ridge = ridge+lift-deck_depth/cosine
    board_at_corner = low_board_at_ridge-toe*slope
    clearance = upper + proposed_pack/cosine - board_at_corner
    # A raised local saddle with the same pitch on both sides. Its aprons
    # step DOWN onto the main sheets; the existing 25-degree field stays.
    cap_half = 250
    cap_apex = ridge+lift+clearance
    cap_edges = cap_apex-cap_half*slope
    vent_top = (layers['zinc']+layers['openBoards'])/cosine
    vent_bottom = vent_top + layers['ventCounterrail']/cosine
    # Cut back only the zinc and upper boards. The secondary weather layer
    # continues below the exterior vent pocket and falls back towards the eave.
    pocket_width, hood_projection, lip = 40, 80, 75
    mouth_allowance = 10
    net_outlet = (min(pocket_width, hood_projection-pocket_width)-mouth_allowance)*cold['meshOpenMinimum']
    lip_z = cap_apex-(cap_half+hood_projection)*slope-lip
    field_under_lip = ridge+lift-(cap_half+hood_projection)*slope
    bare_deck = ridge-deck_depth/cosine
    result = {
        'ordinaryFrameX':axes, 'frameAxisY':axis_y, 'heelStationInwardQ':axis_q,
        'formerPrimarySeatX':[pt[0] for pt in old['plan']['seatWorldXY']],
        'retainedDepthToLowerBoardUndersideNormal':deck_depth,
        'strWallLineAndRidgeCoverZ':[eave,ridge], 'existingDeckAtHeelZ':board_at_heel,
        'hipEdgeNormalReserveBeforePacking':raw_pack, 'fieldLiftVertical':lift,
        'trialWallLineAndFieldRidgeZ':[eave+lift,ridge+lift],
        'ordinaryVerticalSeatAtHeel':board_at_heel+lift-ordinary['roofStructuralTopNeed'],
        'hipEdgeAndCentreVerticalSeat':[proposed_pack/cosine,proposed_pack/cosine+hip_cross_rise],
        'ringAndCassetteWidth':[rings['section']['B'],cassette],
        'remainingWallGlassAtRingAndCassette':[axis_q-w/2-glass_outer for w in (rings['section']['B'],cassette)],
        'zincAndBreatherDripQ':[cold['zincEdgeQWorldY'][0],cold['breatherDripQWorldY'][0]],
        'zincAndBreatherDripZ':outlets, 'gutterBottomFrontBackZ':gutter,
        'secondaryToBackCrest':outlets[1]-gutter[2], 'ventThroatAndNet':[cold['ventGrossThroat'],cold['netEquivalent']],
        'deckUnderOriginalStrRidgeZ':bare_deck, 'purlinCentreZ':elevations['ridgePurlinCentre'],
        'purlinTopAndCornerOffset':[upper,toe],
        'fieldDeckAtRidgeCentreAndCorner':[low_board_at_ridge,board_at_corner],
        'fieldInterferenceAtTopCorner':upper-board_at_corner, 'additionalCapLiftVertical':clearance,
        'trialRidgeCapHalfWidth':cap_half,'trialRidgeCapApexAndEdgeZ':[cap_apex,cap_edges],
        'ventCurbPanelEndAndDripFromRidge':[cap_half,cap_half+pocket_width,cap_half+hood_projection],
        'screenAllowanceAndNet':[mouth_allowance,net_outlet], 'hoodDrop':lip,
        'hoodLipAboveField':lip_z-field_under_lip,
        'ventTopAndBottomVerticalDepth':[vent_top,vent_bottom],
        'upperClearanceNormal':(cap_apex-toe*slope-deck_depth/cosine-upper)*cosine,
    }
    assert min(result['remainingWallGlassAtRingAndCassette']) > 0
    assert abs(raw_pack) < .01 and upper > low_board_at_ridge and clearance > 150
    assert math.isclose(result['upperClearanceNormal'],proposed_pack,abs_tol=1e-6)
    assert math.isclose(result['secondaryToBackCrest'],edge['weather']['secondary']['clearOverBackCrest'])
    assert net_outlet >= cold['netEquivalent'] and lip_z > field_under_lip
    return result


def figure(r):
    import html
    out=['<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="485" viewBox="0 0 1000 485" role="img">',
         '<title>Raised weather stack across the north ridge purlin</title>',
         '<rect width="1000" height="485" fill="#faf9f5"/><g font-family="sans-serif" fill="#213638">']
    def text(x,y,value,n=16):
        out.append(f'<text x="{x}" y="{y}" font-size="{n}">{html.escape(value)}</text>')
    def line(points,col,width=2,dash=''):
        coords=' '.join(f'{325+.78*x:.2f},{382-(z-7700)*.38:.2f}' for x,z in points)
        out.append(f'<polyline points="{coords}" fill="none" stroke="{col}" stroke-width="{width}" stroke-dasharray="{dash}"/>')
    text(26,36,'The ridge purlin cuts through the continuous deck',25)
    text(26,62,'North roof section across the ridge. Vertical scale compressed. Dimensions and levels in mm.')
    ztop,half=r['purlinTopAndCornerOffset']
    centroid=r['purlinCentreZ']
    low=r['fieldDeckAtRidgeCentreAndCorner'][0]
    cap=r['trialRidgeCapApexAndEdgeZ'][0]
    field=r['trialWallLineAndFieldRidgeZ'][1]
    w=r['trialRidgeCapHalfWidth']
    slope=(cap-r['trialRidgeCapApexAndEdgeZ'][1])/w
    rise=r['additionalCapLiftVertical']
    for z,col,dash in ((field,'#8c7971','6 4'),(low,'#8c7971','6 4')):
        line([(-350,z-350*slope),(0,z),(350,z-350*slope)],col,2,dash)
    line([(-350,low-350*slope),(-w,low-w*slope),(-w,low+rise-w*slope),(0,low+rise),
          (w,low+rise-w*slope),(w,low-w*slope),(350,low-350*slope)],'#116963',3)
    curb, panel, drip = r['ventCurbPanelEndAndDripFromRidge']
    vent_top,vent_bottom=r['ventTopAndBottomVerticalDepth']
    for sign in (-1,1):
        line([(sign*350,field-350*slope-vent_bottom),(sign*curb,field-curb*slope-vent_bottom),
              (sign*curb,field-curb*slope-vent_top)],'#697ea1',2)
        line([(sign*350,field-350*slope),(sign*panel,field-panel*slope)],'#116963',3)
        line([(0,cap),(sign*drip,cap-drip*slope),(sign*drip,cap-drip*slope-r['hoodDrop'])],'#116963',3)
        line([(sign*curb,field-curb*slope-vent_top),(sign*curb,cap-curb*slope-vent_top)],'#63817c',2)
    bottom=2*centroid-ztop
    line([(-half,bottom),(-half,ztop),(half,ztop),(half,bottom),(-half,bottom)],'#202d33',4)
    line([(-half,centroid),(half,centroid)],'#75888d',1,'4 3')
    text(630,123,'Dashed   Continuous weather and deck',16)
    text(630,162,'Green   Raised pitched ridge and deck',16)
    text(630,201,'Black   Upright ridge purlin',16)
    text(630,226,'Blue   Field breather return',16)
    text(630,251,f"Top corner overlap   {r['fieldInterferenceAtTopCorner']:.1f}",17)
    text(630,283,f"Trial local rise   {rise:.1f}",17)
    text(630,315,f"Trial cap width   {2*w:.0f}",17)
    text(630,349,f"New weather apex   +{cap:.1f}",17)
    text(26,427,'Deck line is the underside of the lower boards. The two stepped lines bound the local envelope reservation.')
    text(26,453,'The hood laps the field edge. The breather returns outward; fixings, fire, drainage laps and end closures need a joined detail.',15)
    return '\n'.join([*out,'</g></svg>',''])


if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--check',action='store_true')
    opts=parser.parse_args()
    r=compare()
    for ext,body in [('json',json.dumps(r,indent=2,ensure_ascii=False)+'\n'),('svg',figure(r))]:
        p=Path(__file__).with_suffix('.'+ext)
        if opts.check:
            assert p.read_text()==body, f'Stale {p.name}'
        else:
            p.write_text(body)
