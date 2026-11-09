"""Regenerate the two-storey entrance-void drawing and its numeric design limits."""
import json
import math
from pathlib import Path
import sys

from family_bath_davit import beam_study, read
from family_bath_void_plan import result as plan

HERE = Path(__file__).resolve().parent


def study():
    link = beam_study()
    house = read('../../had/studies/water-replan.json')['model']
    motion = plan(house)
    assert motion['housePaths']['lowerSourceClearance'][0] >= 325
    assert motion['housePaths']['westOperatorClearance'][0] >= 300
    protected = next(w for w in house['actions']['witnesses'] if w['id'] == 'principal-to-protected-stair')
    assert [8700,3485] in protected['points'] and [3450,3485] in protected['points']
    assert motion['mast'] == link['upper']['mast'] and motion['r'] == link['upper']['radiusAt75PercentWLL']
    assert min(motion['innerGapByBand']) > 10 and min(motion['pairedGateMargins']) > 20
    assert motion['lowerBeforeDoorClearance'] > 450 and motion['lowerAisleAfterTwo5'] >= 900
    assert min(motion['eastDoorApproachClearance'], motion['westDoorApproachClearance']) >= 425
    assert min(motion['settledPackAdverseGaps']) > 50
    assert link['additionAt85kgOperatingArc']['holdDown_kN']['NW'][0] < 0
    assert link['additionAt500kgAllDirections']['existingSeatAdditional_kN']['P38'][0] < -5
    link['plan'] = motion
    link['upper']['blockedEastBedroomEscape'] = protected['points']
    return link


def figure(data):
    # Two plans at the same drawing scale and orientation. All geometry comes from the study.
    m = data['plan']
    svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="690" viewBox="0 0 1120 690">',
           '<title>Bath exchange at the two-storey entrance</title><desc>Upper guard transfer and signed four-seat frame. Lower protected public side and isolated receiving bay.</desc>',
           '<rect width="1120" height="690" fill="#faf8f1"/>',
           '<defs><clipPath id="plot"><rect x="0" y="128" width="1120" height="416"/></clipPath></defs>',
           '<style>text{font-family:Arial,sans-serif;fill:#212f2a}.h{font-weight:bold;font-size:19px}.k{font-size:13px}.b{font-size:16px}</style>']
    def label(x,y,msg,style='b'):
        size = {'h': 20, 'b': 15, 'k': 13}[style]
        weight = 'bold' if style == 'h' else 'normal'
        svg.append(f'<text font-family="sans-serif" font-size="{size}" font-weight="{weight}" fill="#212f2a" x="{x}" y="{y}">{msg}</text>')
    label(32,44,'Intact bath exchange at the front entrance','h')
    label(32,72,'First-floor finish +3450 mm  /  ground floor 0  /  north up  /  pre-site design comparison','b')
    for off, level in [(44,'Upper bridge'),(598,'Ground entrance')]:
        label(off,116,level,'h')
        def xy(p):
            return (off+68+(p[0]-4350)*.10,146+(3800-p[1])*.10)
        def poly(points,fill,stroke,width=1,dash=''):
            pts=' '.join(f'{x:.2f},{y:.2f}' for x,y in map(xy,points))
            attr=f' stroke-dasharray="{dash}"' if dash else ''
            svg.append(f'<polyline clip-path="url(#plot)" points="{pts}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"{attr}/>')
        def rect(x,y,X,Y,fill,stroke):
            poly([(x,y),(X,y),(X,Y),(x,Y),(x,y)],fill,stroke)
        if level.startswith('Upper'):
            rect(4885,417.5,7115,2735,'#e5e9e6','#84938b')
            rect(5400,2785,6400,3700,'#e8d5b8','#926b37')
            for x in (4785,7215):
                rect(x-90,2650,x+90,3917.5,'#c5c5be','#758078')
            for y in (2920,3630):
                poly([(4785,y),(7215,y)],'none','#9a856a',4)
            for x,y in data['seats']['frameXY']:
                a,b=xy((x,y));svg.append(f'<circle cx="{a}" cy="{b}" r="4" fill="#4d5246"/>')
            poly([(4885,2760),(5400,2760)],'none','#29483e',4)
            poly([(6400,2760),(7115,2760)],'none','#29483e',4)
            poly([(5400,2760),(6400,2760)],'none','#9e4a29',3,'5 3')
            x,y=m['mast']
            samples=[(x+math.sqrt(m['r']**2-(c-y)**2),c) for c in range(2000,3251,10)]
            poly(samples,'none','#9e4a29',3)
            for cx,cy in [m['start'],m['end']]:
                rect(cx-240,cy-365,cx+240,cy+365,'#ebc181','#865c31')
            poly([m['mast'],m['end']],'none','#394f46',2)
            a,b=xy(m['mast']);svg.append(f'<circle cx="{a}" cy="{b}" r="5" fill="#1b534a"/>')
            label(off+88,482,'Entrance void','k')
            label(off,563,'Four steel-frame seats, one offset socket.','b')
            label(off,589,'Dashed opening needs two interlocked guards.','k')
            label(off,612,'The enclosure interrupts the east bedrooms’ route to the stair.','k')
        else:
            rect(4897,417.5,7101.5,2735,'#e9ebe5','#84938b')
            for x,y,X,Y in m['outsideBarriers']:
                rect(x,y,X,Y,'#ead3ba','#ad7958')
            rect(*m['receiverOuter'],'#d7a978','#865c31')
            for k in ('lowerPathToOperatingZone','eastDoorApproachPath','westDoorApproachPath'):
                poly([p for p in m[k] if p[1] >= 0],'none','#017666',2,'5 3' if k.startswith('west') else '')
            poly([(5100,270),(6000,270)],'none','#474f4c',3)
            poly([(6850,270),(6850,1214)],'none','#474f4c',3)
            label(off+120,330,'Receiving bay','k')
            label(off,563,'Stepped exclusion at left. Clear route at right.','b')
            label(off,589,'East leaf shown open. Dashed line is the west-leaf alternative.','k')
            label(off,612,'The measured leaf, retaining hardware and ramp still control.','k')
    label(32,660,'All upright load positions include a 480 × 730 mm cradle. Screens, guidance, floor anchors and door performance require qualification.','k')
    return '\n'.join(svg+['</svg>'])+'\n'


if __name__ == '__main__':
    evidence = study()
    outputs = {'family-bath-entrance-void.json': json.dumps(evidence,indent=2)+'\n',
               'family-bath-entrance-void.svg': figure(evidence)}
    for name, content in outputs.items():
        target = HERE / name
        if '--check' in sys.argv:
            if not target.is_file() or target.read_text() != content:
                raise SystemExit(f'Stale {name}')
        else:
            target.write_text(content)
    print('Entrance void: upright guarded slew, signed bridge actions, lower aisle, paired front door and upper vacancy.')
