"""Compare two native family-bath wastes and locate one direct upper downturn."""
import argparse
import json
from math import acos, degrees, hypot
from pathlib import Path

HERE = Path(__file__).resolve().parent


def evaluate():
    project = HERE.parents[1]
    model = json.loads((project/'had/studies/water-replan.json').read_text())['model']
    services = json.loads((project/'mat/studies/whole-house-service-baseline.json').read_text())
    bath = model['architecturalServices']['familyBathDrop']
    assert bath == services['interfaces']['familyBathDrop']
    native, upper, lower = bath['primarySource'], bath['upperConfiguredKit'], bath['lower']
    assert native['nativeModel'] == '363-1'
    x, y, width, depth = native['body']
    assert native['body'] == model['upperFurniture']['family-bath1700']
    dx,dy,diameter = native['nativeWasteHole']
    ox,oy,oz = native['nativeOverflowCentre']
    assert oy == dy and diameter == 52
    hole_z = native['nativeWasteHoleLocalZ']
    assert native['selectedRim']-native['depthIncludingWaste'] == hole_z
    # Use the same drain-seat plane in each shell/kit comparison. Real
    # component datums and gasket stack must agree at the installed interface.
    horiz,vert = hypot(ox-dx,oy-dy),oz-hole_z
    assert 145 <= horiz <= 260 and 230 <= vert <= 460  # Geberit 150.770.21.6
    assert 100 <= horiz <= 260 and 180 <= vert <= 400  # Viega 6162.1
    heights = []
    floor = upper['completeBodyZLocal'][0]
    for rim in native['actualPermittedRimRange']:
        seat = rim-native['depthIncludingWaste']
        heights.append(dict(rim=rim,seat=seat,geberitBottom=seat-89,geberitAxis=seat-89+59,
                            viegaBottom=seat-110,viegaAxis=seat-110+75))
    assert heights[1]['geberitAxis'] == upper['requiredTrapOutlet'][2]
    # Rotating the whole supplied straight outlet preserves its radial length.
    # The trial points towards the front (north) and foot end (east). It uses
    # the longer available swing; the 100 degree side cannot serve this ray.
    direction = (.6,.8)
    assert abs(hypot(*direction)-1) < 1e-9
    turn = degrees(acos(-direction[0]))
    assert 100 < turn < 130
    def point(distance):
        return [dx+distance*direction[0],dy+distance*direction[1]]
    shoulder, tip, port = [point(s) for s in (140,240,300)]
    old = bath['port']['centre']
    keepout = bath['port']['sealKeepoutDiameter']/2
    front, end = y+depth,x+width
    px,py = port
    panel = upper['upperServicePanel']
    assert panel['frontY'] == front and panel['clearX'][0] < shoulder[0] < tip[0] < px < panel['clearX'][1]
    assert front-py-keepout > 0 and end-px-keepout > 0
    assert px-native['nativeFootAxes'][0][0]-keepout == 220
    hatch = lower['clearHatch']
    shift = [px-old[0],py-old[1]]
    moved = [hatch[0]+shift[0],hatch[1]+shift[1],*hatch[2:]]
    ax,ay,aw,ah = lower['qualifiedEquipmentField']
    hx,hy,hw,hh = moved
    assert ax <= hx and ay <= hy and hx+hw <= ax+aw and hy+hh <= ay+ah
    ex,ey,ez = lower['route'][-1]
    length = abs(ey-py)+abs(ex-px)
    assert lower['gradient'] == 40 and lower['route'][-2][1] == ey
    return dict(body=native['body'],hole=[dx,dy,hole_z],overflow=[ox,oy,oz],offset=[horiz,vert],
                heights=heights,floor=floor,oldPort=old,oldPortRadius=hypot(old[0]-dx,old[1]-dy),
                shoulder=shoulder,tip=tip,port=port,angle=turn,keepout=keepout,
                panel=panel['clearX'],front=front,axisToPanel=front-py,
                sealToBathFront=front-py-keepout,sealToBathEnd=end-px-keepout,
                nativeFootAxes=native['nativeFootAxes'],footWidth=native['nativeFootWidthMaximum'],
                lowerHatch=hatch,movedHatch=moved,shift=shift,returnLength=length,
                newLowerTurnZ=ez+length/lower['gradient'],oldLowerTurnZ=lower['T'][2])


def drawing(r):
    art=['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="690" viewBox="0 0 1200 690" role="img" aria-labelledby="t">',
         '<title id="t">Family bath waste and proposed floor drop</title>',
         '<style>text{font-family:DejaVu Sans,Arial,sans-serif;fill:#19363d}.h{font-size:28px;font-weight:bold}.s{font-size:20px;font-weight:bold}.m{font-size:15px}.n{font-size:13px}</style>',
         '<rect width="1200" height="690" fill="#fcfcf8"/>']
    def text(x,y,v,cls='m'):
        art.append(f'<text x="{x:.1f}" y="{y:.1f}" class="{cls}">{v}</text>')
    def line(x,y,xx,yy,col='#567275',w=1,dash=''):
        art.append(f'<line x1="{x:.1f}" y1="{y:.1f}" x2="{xx:.1f}" y2="{yy:.1f}" stroke="{col}" stroke-width="{w}" stroke-dasharray="{dash}"/>')
    def circle(x,y,rad,fill,stroke,dash=''):
        art.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{rad:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="2" stroke-dasharray="{dash}"/>')
    def rect(x,y,w,h,fill,stroke):
        art.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{fill}" stroke="{stroke}"/>')
    wet,old='#197883','#ae652f'
    text(32,45,'A standard trap at the family bath','h')
    text(33,76,'Kaldewei 363-1  ·  Geberit PushControl 150.770.21.6  ·  No change to the 560 mm rim')
    line(32,95,1166,95)
    text(33,131,'Plan at the waste end','s')
    text(33,156,'North is toward the open service front. Dimensions in mm.','n')
    X=lambda x:44+(x-10580)*.75
    Y=lambda y:492-(y-4100)*.75
    bx,by,bw,bd=r['body']; dx,dy,_=r['hole']; ox,oy,_=r['overflow']
    line(X(10580),Y(r['front']),X(bx+bw),Y(r['front']), '#234e55',2)
    line(X(bx+bw),Y(r['front']),X(bx+bw),Y(4065),'#234e55',2)
    line(X(r['panel'][0]),Y(r['front']),X(r['panel'][1]),Y(r['front']),wet,6)
    text(X(10583),Y(r['front'])-10,'500 clear front opening','n')
    # Only the documented foot axis and outer transverse span are represented.
    fx,fy=r['nativeFootAxes'][0]
    line(X(fx),Y(fy+r['footWidth']/2),X(fx),Y(4070),'#8b7c66',2,'5 4')
    text(X(10584),Y(4250),'Foot axis','n')
    for pos,rad,color,dash in [(r['oldPort'],55,old,'4 4'),(r['port'],r['keepout'],wet,'5 4'),(r['port'],55,wet,'')]:
        circle(X(pos[0]),Y(pos[1]),rad*.75,'none',color,dash)
    for a,b,col,w in [(r['hole'],r['tip'],wet,5),(r['tip'],r['port'],wet,2)]:
        line(X(a[0]),Y(a[1]),X(b[0]),Y(b[1]),col,w)
    circle(X(dx),Y(dy),7,'#19363d','#19363d');circle(X(ox),Y(oy),4,'#19363d','#19363d')
    text(X(dx)-64,Y(dy)+24,'Waste hole','n');text(X(ox)-20,Y(oy)+24,'Overflow','n')
    text(X(10590),Y(4390)+5,'New floor axis','m');line(X(10726),Y(4390),X(r['port'][0])-47,Y(4390))
    text(X(10934),Y(4085),'Existing floor axis','n')
    text(34,545,'New 110 hole and 200 seal zone in green. Existing 110 hole in orange.','n')
    text(34,568,'The new seal ends 10 before the front and 30 before the foot end.','n')
    line(605,111,605,590,'#b9c7c5')
    text(630,131,'Section from the bath waste seat','s')
    text(630,157,'Local elevations with the shell and fitting seat planes aligned.','n')
    z=lambda h:478-h*1.45
    for h,name in [(150,'Waste seat 150'),(120,'Geberit outlet 120'),(61,'Geberit bottom 61'),(40,'Housing limit 40'),(20,'Floor-seal top 20'),(0,'Floor 0')]:
        line(657,z(h),850,z(h),wet if h in (120,61) else '#98aaa9',2 if h in (120,61) else 1)
        text(865,z(h)+5,name)
    rect(690,z(150),22,z(61)-z(150),'#c7e2df',wet)
    rect(768,z(150),22,z(40)-z(150),'#efdbc5',old)
    text(630,520,'Green  ·  Geberit, 89 deep. Brown  ·  Viega Multiplex, 110 to trap bottom.','n')
    text(630,545,'With the rim at 545, the two bottoms fall to 46 and 25 respectively.','n')
    text(630,568,'Boxes show overall depths only. The native adapters and grips need gauging.','n')
    line(32,603,1166,603)
    text(33,635,'The 240 mm straight outlet cannot turn directly down at the existing floor axis 100 mm from the waste.')
    text(33,659,'The diagonal trial retains the native connector. A compatible downturn, independently supported joints and a relocated lower hatch remain design duties.','n')
    return '\n'.join([*art,'</svg>'])+'\n'


if __name__ == '__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--check',action='store_true')
    check=parser.parse_args().check
    result=evaluate()
    svg=HERE/'family-bath-outlet.svg'
    if check:
        assert svg.read_text()==drawing(result), 'Regenerate the family bath drawing'
    else:
        svg.write_text(drawing(result))
    print(f"Family bath: {result['angle']:.2f} degrees, port {result['port']}, lower branch {result['returnLength']} mm.")
