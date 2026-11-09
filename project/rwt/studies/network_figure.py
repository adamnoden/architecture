"""Draw the two high-level circuits and the ground territories they must avoid."""
from html import escape


def network_svg(house, service, outer_mm, ridge_mm, sky_mm, points, q_out, q_in, dock):
    sheet = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1260 815" width="1260" height="815" role="img" aria-labelledby="title">',
             '<title id="title">Outer roof collection and two failed courtyard connections</title>',
             '<rect width="1260" height="815" fill="#fcfaf5"/>',
             '<defs><pattern id="wet" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M0 7L7 0" stroke="#99bdc3" stroke-width="2"/></pattern></defs>']
    def label(x,y,s,size=17,bold=False,colour="#253d3e"):
        sheet.append(f'<text x="{x}" y="{y}" fill="{colour}" font-family="sans-serif" font-size="{size}" font-weight="{700 if bold else 400}">{escape(s)}</text>')
    def path(d,colour,width,dash=''):
        sheet.append(f'<path d="{d}" fill="none" stroke="{colour}" stroke-width="{width}" stroke-dasharray="{dash or "none"}"/>')
    scale=.022
    def point(x,y):
        return 165+scale*x, 470-scale*y
    def rect(x,y,w,h,fill,stroke="none"):
        px,py=point(x,y+h)
        sheet.append(f'<rect x="{px:.3f}" y="{py:.3f}" width="{w*scale:.3f}" height="{h*scale:.3f}" fill="{fill}" stroke="{stroke}"/>')
    def poly(pts,colour,width,dash=''):
        xy=[point(x,y) for x,y in pts]
        path('M'+' L'.join(f'{x:.2f} {y:.2f}' for x,y in xy),colour,width,dash)
    label(38,46,'Can the roof drain clear of the garden escape and the plant dock?',31,True)
    label(38,78,'Occupied house  /  vertical rain comparison  /  north up',16)
    path('M38 99H1220','#a1b7b2',1)
    label(38,132,'01    Outer roof and receiving territory',21,True)
    label(663,132,'02    Where the water goes',21,True)
    shell=house["shell"]
    for x,y,w,h in house["gardenFailureBypass"]["groundPathEnvelope"]:
        rect(x,y,w,h,"#d5e6cf")
    for landing in house["gardenFailureBypass"]["frontApproach"]["landings"]:
        rect(*landing["plan"],"#d5e6cf")
    for ramp in house["gardenFailureBypass"]["frontApproach"]["ramps"]:
        rect(*ramp["plan"],"#d5e6cf")
    for basin in service["ground"]["basins"]:
        rect(*basin["bounds"],"url(#wet)","#4b7f89")
    x1,x2,y1,y2 = dock
    rect(x1,y1,x2-x1,y2-y1,"#eed9b9","#c19d69")
    rect(0,0,shell,shell,"#ede9df","#837f73")
    for side,fill in [(ridge_mm,"#f5f0e8"),(sky_mm,"#fcfaf5")]:
        off=(shell-side)/2;rect(off,off,side,side,fill,"#9b9a8f")
    def near(v, side):
        return (shell-side)/2 if v == 0 else (shell+side)/2
    for x in [0,shell]:
        for y in [0,shell]:
            poly([(near(x,outer_mm),near(y,outer_mm)),(near(x,sky_mm),near(y,sky_mm))],"#bdbaad",1)
    for radius,col,dash in [(270,"#227b78",""),(397.5,"#9e4a38","4 3")]:
        poly([(-radius,-radius),(-radius,shell+radius),(shell+radius,shell+radius),
              (shell+radius,-radius),(-radius,-radius)],col,2,dash)
    # Mark the two mid-side crowns and the two downhill directions from each.
    for x in [-270, shell+270]:
        cx,cy=point(x,shell/2)
        path(f'M{cx-5} {cy} h10', '#253d3e', 2)
        for dy in [-1,1]:
            px,py=point(x,shell/2+dy*2600)
            path(f'M{px-4} {py+dy*6} L{px} {py} L{px+4} {py+dy*6}', '#227b78',2)
    for face,name,station,radius in points:
        col="#227b78" if name=="normal" else "#9e4a38"
        sign=1 if face=="north" else -1
        wall=shell if sign>0 else 0
        px,py=point(station,wall+sign*radius)
        poly([(station,wall+sign*radius),(station,wall+sign*3250)],col,2)
        sheet.append(f'<circle cx="{px:.2f}" cy="{py:.2f}" r="4" fill="{col}"/>')
    for x in (4500,7500):
        for y in (4500,7500):
            cx,cy=point(x,y)
            path(f'M{cx-3} {cy-3} l6 6 M{cx-3} {cy+3} l6 -6', '#772939', 2)
    label(268,342,'COURT',15,True)
    label(663,176,f'One outer face loads the eave at {q_out/2:.3f} L/s.',18)
    label(663,204,'West and east divide at mid-side. Each half falls',17)
    label(663,229,'round its corner to the north or south face.',17)
    label(663,267,f'Each end must receive {q_out:.3f} L/s at the trial event.',18,True)
    label(663,297,'Teal is the normal circuit. Broken red is the relief.',17)
    label(663,322,'Keep their collecting boxes and receiving channels separate.',16)
    label(663,347,'Green is the dry escape. Ochre is the plant exchange dock.',16)
    label(663,372,'Hatched areas belong to the courtyard outlets.',16)
    path('M663 402H1210','#a1b7b2',1)
    label(663,443,'03    The four courtyard downpipes',21,True)
    label(663,482,f'Inner roof and court together assign {q_in:.5f} L/s.',18)
    label(663,514,'Crosses mark the four feet. Permanent 450 mm boxes fail here.',17)
    label(663,543,'The north-west box covers 450 × 395 mm of the north inlet.',16)
    label(663,570,'The north-east box takes 50 × 75 mm of the crew platform.',16)
    label(663,614,'The temporary pipes work one corner at a time.',17,True)
    label(663,640,'A permanent connection must also work with the court occupied.',16)
    path('M38 733H1220','#a1b7b2',1)
    label(38,765,'Source geometry and trial flows. Gutter spacing is enlarged by line weight. The drawing assigns no site drainage or construction capacity.',16)
    sheet.append('</svg>')
    return '\n'.join(sheet)+'\n'
