"""Three views of the heat and cylinder decision. Geometry comes from the calculated result."""
def render(data):
    v, site = data['vessel'], data['site']
    drawn=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 820" role="img" aria-label="Cold-day water and room duty, cylinder envelope and outside plant plan">',
           '<rect width="1100" height="820" fill="#fcfaf4"/><style>text{font:15px sans-serif;fill:#203c42}.h{font:bold 22px sans-serif}.t{font:bold 29px sans-serif}.s{font:13px sans-serif}</style>']
    def text(x,y,label,kind=''):
        drawn.append(f'<text x="{x:.2f}" y="{y:.2f}" class="{kind}">{label}</text>')
    def line(x1,y1,x2,y2,color='#697978',width=1,dash=''):
        drawn.append(f'<line x1="{x1:.2f}" y1="{y1:.2f}" x2="{x2:.2f}" y2="{y2:.2f}" stroke="{color}" stroke-width="{width}" stroke-dasharray="{dash}"/>')
    def rect(x,y,w,h,fill,stroke):
        drawn.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" fill="{fill}" stroke="{stroke}"/>')
    def poly(points,color,width):
        coords=' '.join(f'{x:.2f},{y:.2f}' for x,y in points)
        drawn.append(f'<polyline points="{coords}" fill="none" stroke="{color}" stroke-width="{width}"/>')
    text(30,42,'Winter heat, hot water and the plant room','t')
    text(30,68,'House design comparison  ·  −10°C outdoor trial  ·  conditional W9 branch  ·  dimensions in mm')
    line(30,86,1070,86)
    text(30,122,'One cold day with four draws','h')
    text(30,146,'Mixed store (°C), 300 L  ·  grey bars reserve the heat pump for water')
    left,top,w,h=70,170,530,145
    tx=lambda t:left+w*t/1440
    ty=lambda c:top+h*(65-c)/30
    for a,n in data['windows']:rect(tx(a),top,w*n/1440,h,'#e3ded0','none')
    for c in [40,50,60]:
        line(left,ty(c),left+w,ty(c),'#b9c3bd');text(40,ty(c)+5,str(c),'s')
    poly([(tx(t),ty(temp)) for t,temp,_ in data['profile10min']],'#287e83',2.5)
    line(left,top+h,left+w,top+h)
    for hour in [0,6,12,18,24]:text(tx(hour*60)-6,top+h+20,str(hour),'s')
    text(40,365,'Room heat deferred, kWh  ·  recovery limited to the 8 kW emitter duty','s')
    dy=lambda energy:420-11*energy
    for a,n in data['windows']:rect(tx(a),374,w*n/1440,46,'#e3ded0','none')
    line(left,420,left+w,420);poly([(tx(t),dy(debt)) for t,_,debt in data['profile10min']],'#a65a37',2.3)
    text(40,382,'4','s');text(40,424,'0','s')
    text(30,453,'Traces every 10 min. The one-minute ledger records each draw and peak.','s')
    line(635,100,635,460)
    text(664,122,'Cylinder and clear opening','h')
    text(664,147,'Stock on floor. Proposed cylinder on 100 mm trolley.')
    k=.111; floor=432
    rect(697,floor-2075*k,748*k,2075*k,'#d5b9a9','#586f70')
    rect(837,floor-(100+v['proposedHeight'])*k,v['proposedDiameter']*k,v['proposedHeight']*k,'#a8cdc6','#586f70')
    rect(837,floor-100*k,v['proposedDiameter']*k,100*k,'#697f7b','#536e70')
    line(678,floor,1015,floor);line(678,floor-2300*k,1040,floor-2300*k,'#8a674f',1.5,'5 4')
    text(916,floor-2300*k-3,'Door +2300','s')
    text(681,451,'FTC7 package','s');text(825,451,'Mineral trial','s')
    line(30,471,1070,471);text(30,505,'East plant and independent ground transfer','h')
    # True house coordinates. North up and east right.
    px=lambda x:43+(x-9300)*.081
    # Use one equal scale in both axes.
    py=lambda y:792-(y-2500)*.081
    def plan(b,fill,stroke):
        x,y,dx,dy=b;rect(px(x),py(y+dy),dx*.081,dy*.081,fill,stroke)
    # Crop the y range to the hardware, not the whole site reservation.
    plan([9397,3797,2173.5,1983.5],'#ebe6d8','#6e786f')
    plan([12130,3400,2100,1950],'#d2d9d1','#707e70');plan(site['lift'],'#e8ddbc','#927244')
    plan(site['openGroundZone'],'none','#ba7650');plan(site['equipmentPad'],'#dde6e1','#83918b')
    plan(site['machineFacingEast'],'#84b5ad','#33776f');plan([12000,5475,450,300],'#dbc1b2','#9d6653')
    for r,color in zip(site['routes'],['#24648b','#a85c33']):
        poly([(px(x),py(y)) for x,y,_ in r['centreline']],color,1.8)
    text(px(9420),py(4870),'Plant','s');text(px(12330),py(3970),'Dock','s');text(px(14500),py(3970),'Lift','s')
    text(811,544,'Outside plant','h')
    for i,label in enumerate(['Two primary lines share the plan','at Y5370 at different levels.','Sleeves are 150 apart in the room.',
                             'Orange line encloses the R290 zone.','Retain its full height to 300 above','ground with no unpriced openings.',
                             'A 1600 × 1800 lift is a space budget.','Foundation, drain, weather seal and','service isolation still need proof.']):
        text(812,577+i*23,label,'s')
    line(45,779,126,779,'#203c42',3);text(139,784,'1 m   ·   north up   ·   pipe levels −940 and −1090','s')
    drawn.append('</svg>');return '\n'.join(drawn)+'\n'
