"""Kitchen plan and intake section for the hydronic cooker study."""
from html import escape

def figure(result,furniture):
    svg=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1060 710" role="img"><title>Kitchen supply on the south pier and furniture retained for renewal</title><rect width="1060" height="710" fill="#fbfaf5"/><g font-family="DejaVu Sans, sans-serif" fill="#20373e">']
    def text(x,y,s,n=14,bold=False):
        svg.append(f'<text x="{x}" y="{y}" font-size="{n}" font-weight="{700 if bold else 400}">{escape(s)}</text>')
    def rect(x,y,w,h,fill,line):
        svg.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" fill="{fill}" stroke="{line}"/>')
    def poly(points,col,weight=2,dash=''):
        xy=' '.join(f'{x:.1f},{y:.1f}' for x,y in points)
        svg.append(f'<polyline points="{xy}" fill="none" stroke="{col}" stroke-width="{weight}" stroke-dasharray="{dash}"/>')
    def pos(x,y):return 35+(x-7550)*.14,75+(11600-y)*.14
    def box(bounds,fill,line):
        x,y,w,h=bounds;a,b=pos(x,y+h);rect(a,b,.14*w,.14*h,fill,line)
    data=result['roomAndRelease']; blue='#27678a'; green='#267060'; orange='#a55532'; grey='#82908e'
    text(32,35,'The kitchen keeps its east radiator',24,True)
    text(32,61,'Plan · north up',15,True);text(647,61,'One horizontal supply unit',16,True)
    box([7719.5,8424.5,3851,3146],'#f0f2ea','#82908e')
    poly([pos(8277,8424.5),pos(9123,8424.5)],'#f0f2ea',3)
    for k,b in furniture.items():
        box(b,'#e4e7e3',grey)
    for b in data['parkedChairs']:box(b,'#dcebe6',green)
    box(data['reachableField'],'none',blue)
    box(data['unitPlan'],'#b6d8c6',green)
    for k in ('dining-table1200x800','north-cooking-station','cold-storage'):
        b=furniture[k];x,y=pos(b[0]+18,b[1]+b[3]/2);text(x,y,{'dining-table1200x800':'Table','north-cooking-station':'Hob','cold-storage':'Fridge'}[k],12)
    x,y=pos(10200,10990);text(x,y,'Sink / larder',11)
    poly([pos(*p[:2]) for p in data['lowExport']],orange,3)
    poly([pos(*p[:2]) for p in data['chairPaths'][0]],green,1.5,'5 3')
    x,y=pos(8350,7930);text(x,y,'To east gallery',12)
    text(647,95,'Outside air → filter, coil and fan → kitchen',14)
    # A west-to-east schematic. The unit mounts on the solid partition.
    rect(675,128,45,30,'#d6e2e5',blue);rect(721,136,82,14,'#e1e8e7',blue)
    rect(804,119,97,48,'#bfddce',green);rect(902,136,100,14,'#e1e8e7',blue)
    text(653,190,'West outlet',12);text(799,190,'972 mm unit',12);text(929,190,'East intake',12)
    text(647,234,'HOT COOKING',13,True);text(647,259,'Prove ≥48 L/s at the hood and ≥18°C supply.')
    text(647,284,'Largest coil call 3.38 kW, kitchen 1.381 kW.')
    text(647,309,'East emitter supplies 1.443 kW at 55/45°C.')
    text(647,353,'STANDBY',13,True);text(647,378,'12–15 L/s through the small outlet.')
    text(647,403,'Kitchen stays between −4.34 and −2.00 Pa.')
    text(647,447,'RENEWAL',13,True);text(647,472,'Park the two east chairs. The table stays.')
    text(647,497,'Isolate and drain, support, then release.')
    text(647,522,'Turn the low 1020 × 450 cart at the doorway.')
    text(33,670,'Green dash · first chair move     Blue frame · service steps     Rust · drained unit on cart',13)
    text(33,692,'All dimensions are design comparisons. Qualify controls, bracket loads, tools and the occupied route.',12)
    svg.append('</g></svg>\n');return ''.join(svg)
