"""Plan, transverse cut and supported first release for the proposed soffit."""
from html import escape


def figure(data):
    out=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1240 1020" role="img" aria-label="Exposed loggia soffit, supports, wall head and panel renewal">',
         '<rect width="1240" height="1020" fill="#f6f4ee"/>',
         '<style>text{font-family:Arial,sans-serif;fill:#20343b}.title{font-size:35px;font-weight:700}.h{font-size:21px;font-weight:700}.body{font-size:15px}.dim{font-size:13px}.k{font-size:12px;letter-spacing:1.3px;font-weight:700;fill:#42666a}</style>']
    def box(x,y,w,h,fill,stroke='none',sw=1):
        out.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')
    def ln(x,y,xx,yy,col='#42575e',sw=1,dash=''):
        out.append(f'<path d="M{x:.2f} {y:.2f}L{xx:.2f} {yy:.2f}" stroke="{col}" stroke-width="{sw}" fill="none" stroke-dasharray="{dash}"/>')
    def t(x,y,s,cls='body',anchor='start'):
        out.append(f'<text x="{x}" y="{y}" class="{cls}" text-anchor="{anchor}">{escape(s)}</text>')
    def dot(x,y,r,fill):
        out.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{r}" fill="{fill}"/>')
    t(43,35,'MATERIALS  /  THE NORTH LOGGIA', 'k')
    t(42,83,'A ceiling that can come down one panel at a time','title')
    t(44,113,'Trial dimensions in mm. Upper-floor datum +3450. The two masonry portals, their ties and the water channel stay in place.')
    box(40,143,570,594,'#fffefa','#cad0c9')
    box(630,143,570,594,'#fffefa','#cad0c9')
    t(62,178,'01  |  Plan looking up','h')
    t(650,178,'02  |  West wall at the middle of the loggia','h')
    t(62,204,'Four 600 bays across. In plan, north is up.','dim')
    t(650,204,'Warm room to the left. The upper room spans the outdoor passage.','dim')
    x0,y0,scale=84,260,.118
    def px(x): return x0+(x-4800)*scale
    def py(y): return y0+(11280-y)*scale
    # Axial projection of each portal and the flat wall-to-wall area.
    box(x0,py(11555),2400*scale,275*scale,'#c8d2cc')
    box(x0,py(8470),2400*scale,275*scale,'#c8d2cc')
    box(x0,y0,2400*scale,2810*scale,'#e1eeea','#52685e')
    for ix in range(5):ln(px(4800+ix*600),y0,px(4800+ix*600),py(8470),'#6e8881',1.1)
    for yy in data['grid']['railY']:ln(px(4800),py(yy),px(7200),py(yy),'#314d50',2)
    for xx,yy in data['grid']['hangersXY']:dot(px(xx),py(yy),3.5,'#9b552f')
    for xx,yy in data['grid']['catchXY']:box(px(xx)-2.5,py(yy)-2.5,5,5,'#fffefa','#9b552f',1.5)
    # Extent of the unrelated lower water cover. Dashed outline only.
    for xx in (4825,5225):ln(px(xx),py(11555),px(xx),py(8195),'#3289a1',2,'5 4')
    for xx in data['service']['footLinesX']:
        for yy in (9650,10450):
            box(px(xx-100),py(yy+100),200*scale,200*scale,'none','#af6259',2)
    box(398,544,8,8,'#fffefa','#9b552f',1.5);t(417,552,'independent catch','dim')
    t(84,224,'Garden portal','dim');t(84,636,'Court portal','dim')
    ln(369,260,389,260);ln(369,592,389,592);ln(382,260,382,592)
    t(394,405,'2810 flat','dim');t(394,427,'Y8470–11280','dim')
    dot(402,466,4,'#9b552f');t(415,471,'primary hanger','dim')
    ln(396,492,411,492,'#3289a1',2,'4 3');t(418,497,'water cover below','dim')
    box(397,515,13,13,'none','#af6259',2);t(417,527,'200 square foot','dim')
    t(62,655,'The walking strip is 10.20 m². Only 6.744 m² is flat ceiling.')
    t(62,680,'The grey ends continue as separate curved, wrapped masonry.')
    t(62,706,'Lift from a supported station east of the 400-wide water cover.')
    # Orthogonal wall-head cut, at true relative scale in the main section.
    X=lambda q:739+(q+167)*.60
    Z=lambda z:379-(z-3170)*.53
    def section_box(a,b,l,u,colour):
        box(X(a),Z(u),X(b)-X(a),Z(l)-Z(u),colour,'#677572',.65)
    section_box(-167,550,3370,3450,'#e9dec9')
    section_box(-167,550,3170,3370,'#c7cccf')
    section_box(-167,-140,2720,3170,'#e9dec9')
    section_box(-140,0,2720,3170,'#ba8e77')
    section_box(0,200,2720,3170,'#a4c8bd')
    section_box(200,550,2930,3170,'#a4c8bd')
    section_box(250,352.5,2720,2870,'#bc8b72')
    section_box(352.5,550,2890,2930,'#d8c8ac')
    # Accessible folded cap over the weather leaf with a drip and open head.
    ln(X(247),Z(2885),X(358),Z(2877),'#237c89',2)
    ln(X(358),Z(2877),X(358),Z(2867),'#237c89',2)
    ln(X(-145),Z(2990),X(-145),Z(3169),'#a74c43',3)
    ln(X(-145),Z(3169),X(-167),Z(3169),'#a74c43',3)
    t(648,271,'+3370 RC top','dim');t(648,377,'+3170 soffit','dim')
    t(648,505,'+2930 glass','dim');t(648,530,'+2890 finish','dim')
    t(781,331,'RC200','body');t(971,453,'240 soffit glass','body')
    t(753,589,'140 core','dim');t(850,589,'200 glass','dim')
    t(982,589,'102.5 brick','dim')
    t(659,633,'Stop the weather leaf below the glass and turn its head flashing')
    t(659,657,'out over the face. Keep the 50 cavity free to drain. Bringing')
    t(659,681,'that cavity to the RC instead costs 19.67 W/m in the 20 K cut.')
    t(659,706,'The red line is the room-side air return, accessible from inside.','dim')
    box(40,757,1160,227,'#eef2ec','#cad0c9')
    t(61,791,'03  |  First supported release','h')
    for n,(left,title,lines) in enumerate([
        (60,'Hold the finish',['Keep both water routes available. Place the stage','on four pads east of the channel. Couple the','panel frame to a supported tray before release.']),
        (449,'Lower one cassette',['Undo four captive frame screws from below.','Lower 80 mm on the guided tray. The glass bears','on other shelves. Keep people out from below.']),
        (837,'Exchange and restore',['Remove the catch tray and independent ledge','under a supported glass bay. Refit both courses,','catches and finish. Check the drained joint.'])]):
        t(left,838,f'{n+1}   {title}','h')
        for i,s in enumerate(lines):t(left,870+23*i,s,'dim')
    t(62,961,'Design comparison only. The cast-in cage, render retention, platform and complete classified assembly require their own qualification.','dim')
    return '\n'.join(out+['</svg>',''])
