"""Plans and elevations use the same selected 1700 bath and 1000 shower as the numeric result."""
from html import escape
import math


def draw(d):
    a=['<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="875" viewBox="0 0 1280 875">',
       '<title>Rear shower and family bath service sections</title><desc>Three alternatives and the physical interfaces: a flush shower well, a raised shower return, the family bath floor drop and the worker position below.</desc>',
       '<rect width="1280" height="875" fill="#fbf8ef"/>']
    def txt(x,y,s,size=14,bold=False,c='#263b34'):
        a.append(f'<text x="{x}" y="{y}" font-family="sans-serif" font-size="{size}" font-weight="{"bold" if bold else "normal"}" fill="{c}">{escape(s)}</text>')
    def rect(x,y,w,h,fill,stroke):
        a.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" fill="{fill}" stroke="{stroke}"/>')
    def line(pts,c,width=2,dash=''):
        s=' '.join(f'{x:.2f},{y:.2f}' for x,y in pts)
        a.append(f'<polyline points="{s}" fill="none" stroke="{c}" stroke-width="{width}" stroke-dasharray="{dash}" stroke-linejoin="round"/>')
    def dot(p,r,c):
        a.append(f'<circle cx="{p[0]:.2f}" cy="{p[1]:.2f}" r="{r}" fill="{c}"/>')
    txt(35,43,'The permanent wet sections',30,True)
    txt(35,71,'Three-bathing house  /  dimensions in mm  /  source choices for coordination',16)
    txt(38,118,'01   Rear shower',22,True)
    txt(662,118,'02   Family bath',22,True)
    r=d['rearSideOption']; u=r['u']; fam=d['family'];f=fam['fixture']; lower=fam['hatches'][1]
    x0,y0=1430,10030
    def rear(x,y):return 48+(x-x0)*.30,148+(y0-y)*.30
    def rrect(box,fill,stroke):
        x,y,w,h=box;rx,ry=rear(x,y+h);rect(rx,ry,w*.30,h*.30,fill,stroke)
    rrect(r['tray'],'#e5ece4','#718474');rrect(r['apron'],'#eadccd','#9c7755')
    rrect(r['old400Well'],'none','#8a8982')
    cx,cy=r['nativeDrainCentre'];sx,sy=rear(cx,cy);dot((sx,sy),6,'#887151')
    tx,ty=r['unchangedSmallPort'][:2];dot(rear(tx,ty),6,'#566ba0')
    ys=u['firstTipY']; dy=u['planSpacing']/2;mx=u['weldEndX']-u['straightTangent']
    pts=[(cx,cy),(u['matingX'],ys),(mx,ys)]
    for i in range(1,41):
        rad=math.pi*i/40;pts.append((mx-u['radius']*math.sin(rad),ys+dy*(1-math.cos(rad))))
    pts.extend([(u['matingX'],ys+2*dy),(tx-75,ys+2*dy)])
    for i in range(1,21):
        t=math.pi*i/40;pts.append((tx-75+75*math.sin(t),ys+2*dy-75*(1-math.cos(t))))
    pts.append((tx,ty));line([rear(x,y) for x,y in pts],'#087a72',3)
    txt(46,526,'Grey square · formed 400 well for the flush control',14)
    txt(46,549,'Green · removable return for the +155 side-service option',14)
    txt(46,572,'Blue point · retained Ø110 floor port for the side-service option',14)
    def upper(x,y):return 678+(x-10520)*.48,148+(4590-y)*.48
    def urect(x,y,w,h,fill,stroke):
        X,Y=upper(x,y+h);rect(X,Y,w*.48,h*.48,fill,stroke)
    urect(10550,3890,610,610,'#e4ebe3','#a0a496')
    X,Y=f['newFloorPort'][:2]
    urect(X-100,Y-100,200,200,'#eee1c9','#ad8a5e')
    wx,wy,_=f['wasteHole'];line([upper(wx,wy),upper(*f['nativeTip']),upper(X,Y)],'#087a72',4)
    dot(upper(wx,wy),6,'#34473c');dot(upper(X,Y),6,'#ab6b37');dot(upper(10950,4150),5,'#747d88')
    tx,ty=upper(10950,4150);txt(tx+9,ty+19,'Former axis',13)
    px,py=upper(X,Y);txt(px+10,py-8,'New downturn',14,True)
    txt(681,526,'Black point · original 52 mm waste at (10850,4150)',14)
    txt(681,549,'Nominal 24 mm insertion gives the Ø110 drop at (11012,4366).',14)
    txt(681,572,'The 200 mm water seal zone stays inside the bath footprint.',14)
    line([(36,605),(1244,605)],'#c8c8ba',1)
    txt(39,645,'03   What moves below the bath',21,True)
    # Vertical diagram, deliberately broken in horizontal direction to show the accessible working face.
    def z(v):return 687+(3000-v)*.25
    for v,n in [(3000,'Old A 3000'),(2860,'New A 2860'),(2733.65,'Turn 2733.65'),(2587.5,'Ceiling 2587.5')]:
        line([(49,z(v)),(170,z(v))],'#aaa999',1);txt(180,z(v)+4,n,13)
    line([(104,z(3000)),(104,z(2860)),(104,z(2733.65)),(145,z(2733.65))],'#087a72',4)
    dot((104,z(2860)),5,'#a96836')
    txt(439,687,'450 clear ceiling hatch. Its frame is independent of the Ø110 RC opening.',16)
    txt(439,722,'Support the spool before releasing it. The worker retreats before the 470 mm descent.',15)
    txt(439,756,'The 870 mm deck serves a supported extension at 2550 mm.',15)
    txt(439,790,'Whole-stem retirement needs 690 mm of upward travel with the bath cleared.',15)
    txt(39,849,'Development sections. Fixing, fire/acoustic restoration, working equipment, seals and material exceptions must match the actual assembly.',14)
    return '\n'.join(a+['</svg>'])+'\n'


def draw_shell(shell):
    """Sections perpendicular to the two independent pitch axes, with dimensions from the model."""
    inside, outdoor = shell['inside'], shell['outdoor']
    length, width, depth = shell['pack']
    a = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 490" width="1120" height="490">',
         '<title>Original 1700 bath through the family window</title>',
         '<desc>End view of the supported roll inside the bathroom and side view of the independently supported pitch outside.</desc>',
         '<rect width="1120" height="490" fill="#fbf8ef"/>']
    def label(x, y, t, size=15, bold=False):
        a.append(f'<text x="{x}" y="{y}" font-family="sans-serif" font-size="{size}" font-weight="{"bold" if bold else "normal"}" fill="#263b34">{escape(t)}</text>')
    def envelope(cx, cy, scale, wide, high, before, after):
        rad = math.hypot(wide, high) * scale / 2
        a.append(f'<circle cx="{cx}" cy="{cy}" r="{rad:.3f}" fill="none" stroke="#a48e71" stroke-dasharray="4 4"/>')
        for w, h, color in [(wide, high, before), (high, wide, after)]:
            a.append(f'<rect x="{cx-w*scale/2:.3f}" y="{cy-h*scale/2:.3f}" width="{w*scale:.3f}" height="{h*scale:.3f}" stroke="{color}" stroke-width="2" fill="none"/>')
        a.append(f'<circle cx="{cx}" cy="{cy}" r="4" fill="#263b34"/>')
    label(28, 40, 'Renewing the original 1700 mm family bath', 27, True)
    label(28, 69, 'The cradle rolls about its long axis inside. Outside, a separate pitch bed stands the goods upright.')
    label(28, 108, '01   Bathroom end view', 19, True)
    label(565, 108, '02   Outdoor side view', 19, True)
    for cx, cy, sc, w, h, bound in [(273, 240, .235, width, depth, 437.5),
                                     (830, 240, .115, length, width, outdoor['proposedPivotDeck'][2]/2)]:
        for side in [-1, 1]:
            x = cx + side*bound*sc
            a.append(f'<path d="M{x:.3f} 123 V359" fill="none" stroke="#a79985" stroke-width="2"/>')
        envelope(cx, cy, sc, w, h, '#748c81', '#087a72')
    label(28, 387, f'720 × 450 around Y{inside["axleYZ"][0]:g} at +{inside["axleYZ"][1]:g}.')
    label(28, 412, f'Wall and cabinet leave {inside["afterTwo5"]:.2f} mm after two 5 mm errors.')
    label(565, 387, f'1790 × 720 on the 2000 mm bed, axis at +{outdoor["centre"][2]:g}.')
    label(565, 412, f'End reserve {outdoor["pairedTo2mEnds"]:.2f} mm. Shelter soffit at least +{outdoor["shelterMinCeiling"]:.0f} mm.')
    label(28, 464, 'Grey-green = received orientation. Teal = locked after turning. Dotted circle = full corner sweep.', 14)
    return '\n'.join(a + ['</svg>']) + '\n'
