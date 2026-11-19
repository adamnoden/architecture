"""Located plan of the P32 starter trial. Regenerate from the numerical record."""
from html import escape
from math import cos, radians, sin
from pathlib import Path
import runpy


def figure(record):
    model=runpy.run_path(str(Path(__file__).with_name('court_tie_starter_paths.py')))
    path=model['starter']
    roots=[(141*cos(radians(22.5+45*i)),141*sin(radians(22.5+45*i))) for i in range(8)]
    ink,muted='#1d3038','#4c6167'
    green,blue,orange,purple='#12735c','#3e6c93','#bb5134','#775080'
    paper='#fcfbf7'
    svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1250 650" width="1250" height="650" role="img" aria-labelledby="title desc">',
         '<title id="title">P32 starter routing past pile P45</title>',
         '<desc id="desc">Plan of five north starters and one west starter at P32. A second horizontal bend takes the west tail past the eight vertical P45 axes. Two enlarged plans show the proposed bottom and top H20 rows.</desc>',
         '<rect width="1250" height="650" fill="#fcfbf7"/>',
         '<g font-family="DejaVu Sans,Arial,sans-serif">']
    def text(x,y,s,size=14,color=ink,weight=400,anchor='start'):
        svg.append(f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="{anchor}" fill="{color}" font-size="{size}" font-weight="{weight}">{escape(str(s))}</text>')
    def line(pts,color,w=1,dash=None):
        xy=' '.join(f'{x:.2f},{y:.2f}' for x,y in pts)
        style=f' stroke-dasharray="{dash}"' if dash else ''
        svg.append(f'<polyline points="{xy}" fill="none" stroke="{color}" stroke-width="{w}" stroke-linejoin="round"{style}/>')
    def box(x,y,w,h,fill,stroke='none'):
        svg.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" fill="{fill}" stroke="{stroke}"/>')
    def dot(x,y,r,fill,stroke='none'):
        svg.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{r:.2f}" fill="{fill}" stroke="{stroke}"/>')
    text(28,39,'P32   Six starter tails around the court hold-down',27,weight=700)
    text(29,68,'Plan coordinates are local to the P32 shaft. North is up. Dimensions are in mm.',16,muted)
    line([(28,87),(1222,87)],'#c3cdcb')
    text(28,119,'01   Court wall and stair header',19,weight=700)
    text(671,119,'02   H20 rows through the P32 cap',19,weight=700)
    line([(639,108),(639,552)],'#c9d0cb')

    scale=.208
    def plan(x,y):
        return 457+scale*x,477-scale*y
    def field(x0,y0,x1,y1,fill,stroke=None):
        x,y=plan(x0,y1);box(x,y,(x1-x0)*scale,(y1-y0)*scale,fill,stroke or 'none')
    # Draw the actual widths, cropped along the two main receiving arms.
    px,py=record['P45offset']
    # P45's other 600-wide member is the stair-post run. Only its node
    # stub is shown; it continues north away from the west tail.
    field(px-300,-159.5,px+300,480,'#e4e9e1')
    field(-1960,-300,0,300,'#e4e9e1')
    field(-300,-382.5,300,1625,'#e4e9e1')
    for x,y,name in ((0,0,'P32'),(px,py,'P45')):
        field(x-300,y-300,x+300,y+300,'#d3ded2','#8d9f98')
        cx,cy=plan(x,y);dot(cx,cy,200*scale,'none','#6e8179')
        for a,b in roots:dot(*plan(x+a,y+b),2.45,'#50646b')
    # The five individual upper/lower tails share three plan lanes.
    for indices,z,color in ((record['northLowerIndices'],record['northLowerUpperZ'][0],green),
                              (record['northUpperIndices'],record['northLowerUpperZ'][1],blue)):
        for i in indices:
            _,_,segments,_=path(i,roots,z,(0,1))
            coords=[plan(*seg[0][:2]) for seg in segments]+[plan(*segments[-1][1][:2])]
            # Dashed upper layer lets coincident lower tails remain visible.
            line(coords,color,2.5,'6 4' if color==blue else None)
    i=record['westBarIndex']; angle=radians(record['firstHeadingSouthOfWestDeg'])
    _,_,segments,_=path(i,roots,record['finalTailEndLocal'][2],(-cos(angle),-sin(angle)),angle,record['interbendStraightMm'])
    pts=[plan(*s[0][:2]) for s in segments]+[plan(*segments[-1][1][:2])]
    assert max(abs(v-w) for v,w in zip(segments[-1][1],record['finalTailEndLocal']))<.001
    line(pts,orange,4)
    oldy=roots[i][1]
    line([plan(px-250,oldy),plan(roots[i][0],oldy)],'#9b9281',1.5,'4 4')
    for a,b in ((-32.5,-60),(-32.5,60)):
        dot(*plan(a,b),3.5,purple,'white')
    leader=plan(-850,record['finalTailEndLocal'][1])
    line([leader,(leader[0]-12,leader[1]+22),(77,leader[1]+22)],orange,1)
    text(76,leader[1]+42,'West H22 passes south of P45',13,orange,700)
    text(30,164,'Five north tails',14,green,700)
    text(30,185,'Three at Z−355, two at Z−296.',13,muted)
    line([(264,180),(372,180),plan(0,1390)],green,1)
    text(29,251,'Due-west control',14,'#6d645b',700)
    text(29,272,'Crosses a P45 vertical bar.',13,muted)
    line([(208,267),(233,267),plan(px-130,oldy)],'#9b9281',1,'4 3')
    text(29,329,'Two blind tie ends',14,purple,700)
    line([(177,325),(341,325),plan(-32.5,60)],purple,1)
    text(*plan(px,360),'P45',15,ink,700,'middle')
    text(*plan(0,-402),'P32',15,ink,700,'middle')

    def mat_panel(origin, name, key):
        ox,oy=origin;w=202;side=w/600
        text(ox,151,name,16,weight=700)
        box(ox,oy,w,w,'#edf1eb','#899d94')
        dot(ox+w/2,oy+w/2,200*side,'none','#bac6c0')
        for a,b in roots:
            dot(ox+(a+300)*side,oy+(300-b)*side,2.9,'#74847b')
        for direction,color in (('EW',orange),('NS',blue)):
            positions=record['P32trialMats'][key+direction]['stationAndZ']
            base=min(z for q,z in positions)
            for station,z in positions:
                if direction=='EW':
                    y=oy+(300-station)*side; points=[(ox,y),(ox+w,y)]
                else:
                    x=ox+(300+station)*side; points=[(x,oy),(x,oy+w)]
                line(points,color,2,'5 3' if z!=base else None)
    mat_panel((677,167),'Bottom mat','bottom')
    mat_panel((968,167),'Top mat','top')
    text(677,396,'EW at Z−572 / −520',13,orange,700)
    text(677,418,'NS at Z−552 / −500',13,blue,700)
    text(968,396,'EW at Z−238',13,orange,700)
    text(968,418,'NS at Z−258',13,blue,700)
    text(677,451,'Dashed rows sit on the higher bottom layers.',13,muted)
    text(677,473,'Dark dots show the initial eight H22 axes.',13,muted)
    text(677,505,'Bottom NS centroid shifts 41.56 east and 20.8 up.',14,ink,700)
    text(677,528,'The changed mat forces and continuation require a new check.',13,muted)
    line([(28,580),(1222,580)],'#b3c2bf')
    w=record['groups']['westToP45'];r=record['groups']['allP32ToTransplantedMats']
    text(28,607,f"West H22 to P45 verticals ≥{w['nominalIntervalMm'][0]:.2f} nominal, ≥{w['afterTwo5mmSetoutsLowerMm']:.2f} after two 5 mm shifts.",15,ink,700)
    text(29,631,f"All P32 H22 to the named H20 rows ≥{r['afterTwo5mmSetoutsLowerMm']:.2f} after the same shifts. P45 bends and cap confinement remain open.",14,muted)
    return '\n'.join(svg+['</g></svg>'])+'\n'
