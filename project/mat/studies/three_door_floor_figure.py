"""Plan and section details for the three counted threshold boundaries."""
from html import escape


def drawing(d):
    svg = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1180 890" role="img" aria-labelledby="title desc">',
        '<title id="title">Three door boundaries on the suspended floor</title>',
        '<desc id="desc">East reveal and equipment in plan, the cut lower cover and its discharge-facing notch, and separate water levels at the court, front and plant doors.</desc>',
        '<defs><clipPath id="room"><rect x="58" y="179" width="357" height="356"/></clipPath><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 6L6 0" stroke="#af6841" stroke-width="1.4"/></pattern><marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7Z" fill="#1c6d75"/></marker></defs>',
        '<style>text{font:16px system-ui,sans-serif;fill:#243742}.title{font-weight:700;font-size:32px}.h{font-weight:650;font-size:20px}.small{font-size:14px}.datum{font-size:13px;fill:#4a615e}</style>',
        '<rect width="1180" height="890" fill="#fbfaf5"/>']
    def t(x,y,s,cls=''):
        font = {'title':(32,700), 'h':(20,700), 'small':(14,400), 'datum':(13,400)}.get(cls,(16,400))
        svg.append(f'<text x="{x:g}" y="{y:g}" style="font-family:DejaVu Sans,sans-serif;font-size:{font[0]}px;font-weight:{font[1]}">{escape(s)}</text>')
    def line(x1,y1,x2,y2,color='#82928e',width=1,extra=''):
        svg.append(f'<line x1="{x1:.2f}" y1="{y1:.2f}" x2="{x2:.2f}" y2="{y2:.2f}" stroke="{color}" stroke-width="{width}" {extra}/>')
    def rect(x,y,w,h,fill,stroke='none',extra=''):
        svg.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" fill="{fill}" stroke="{stroke}" {extra}/>')
    def plan(ox,oy,x0,y0,k):
        def box(v,fill,stroke='none',extra=''):
            x,y,w,h=v
            rect(ox+(x-x0)*k,oy-(y+h-y0)*k,w*k,h*k,fill,stroke,extra)
        return box
    t(42,53,'Three doors, one floor exposure','title')
    t(42,84,'The wet returns stay outside. The recessed plant closure opens from the dry side.')
    line(42,105,1138,105)
    t(42,138,'01   East room and replacement opening','h')
    t(611,138,'02   South end lid and fixed upright','h')
    t(42,162,'Plan · north up · original and revised strips superimposed','small')
    t(611,162,'Enlarged plan · n increases into the room, to the left','small')
    e=d["eastOccupation"]; data=e["states"]
    svg.append('<g clip-path="url(#room)">')
    box=plan(58,534,10350,3770,.216)
    box([10350,3770,1650,1650],'#e9ede5','#91a39b')
    for y,h in ((3770,157),(5273,147)):box([11570.5,y,429.5,h],'#b5b9ad','#6f7a72')
    box(data["W9 machine"]["body"],'#dadacf','#718079')
    box(data["W9 service zone"]["body"],'none','#8c9890','stroke-dasharray="5 3"')
    box(data["60 mm wall controls"]["body"],'#d9b397','#996147')
    box(e["commonCover"],'url(#hatch)','#a96949')
    box(e["recessedCover"],'#56a5a6','#226a70')
    for y in [4050,4325,4600,4875,5150]:box([11610,y,140,0.5],'none','#234e56')
    box(e["singlePanelRest"],'#dbc981','#887643')
    for st in e["crewStations"].values():
        x,y=st["centre"]
        svg.append(f'<circle cx="{58+(x-10350)*.216:.1f}" cy="{534-(y-3770)*.216:.1f}" r="{300*.216:g}" fill="none" stroke="#508290" stroke-dasharray="4 3"/>')
    svg.append('</g>')
    t(74,208,'W9 body','small')
    t(436,230,'Recessed strip','small');t(436,250,'X11610–11750','datum')
    t(436,302,'R300 crew','small');t(436,323,'separate states','datum')
    t(68,558,'Warm room','small');t(324,558,'East wall →','small')
    t(42,588,'Hatched = common sill. Clay = controls. Gold = rest.','small')
    t(42,613,'Recessing the strip buys 39.5 mm to the W9 cabinets.','small')
    # South end panel: draw the long east-open corner cut with a second open edge on the south.
    turn=plan(646,495,11580,3925,1.15)
    turn([11610,3950,140,100],'#5a9e9f','#24676c')
    turn([11688,3950,62,80],'#fbfaf5','#24676c')
    turn([11698,3980,40,40],'#aa684c','#74442f')
    turn([11610,4050,140,100],'#e1e7df','#82928e')
    turn([11610,4030,140,100],'none','#266970','stroke-dasharray="6 4" stroke-width="2"')
    line(708,438,708,363,'#1c6d75',3,'marker-end="url(#arrow)"')
    t(857,249,'Lift 35, then move 80 north.','h')
    t(857,277,'The north panel mirrors this motion.','small')
    t(857,323,'Fixed leg and head fit within','small');t(857,346,'40 mm. Leave 10 on release.','small')
    t(857,400,'The two-edge cut leaves one','small');t(857,423,'20 mm finger, outside traffic.','small')
    t(857,474,'Remaining plates stay locked.','small')
    t(611,552,'Solid teal = installed end plate. Dashed = translated envelope.','small')
    t(611,578,'Brown = fixed upright. Remove the reveal trim first.','small')
    t(611,611,'Dimensions in mm. Handling and supports remain open.','small')
    line(42,640,1138,640)
    t(42,676,'03   Compare the actual wet levels','h')
    t(42,704,'Each column is its own event. A walking crest is visible above the earlier vulnerable joints.','small')
    for x,title,low,top,footer in [(43,'SOUTH COURT','−35 quiet court','+15 protective return','50 mm allocated to splash and setout'),
            (416,'FRONT','−37.94 blocked primary','−20 dry backdam','28.00 mm above the wet pan toe'),
            (790,'EAST PLANT','−62.89 blocked primary','−20 dry backdam','Only 2.89 mm below the wet toe')]:
        t(x,747,title,'h');line(x,762,x+323,762,'#a3aba4')
        t(x,787,low);t(x,813,top);t(x,849,footer,'small')
    svg.append('</svg>')
    return '\n'.join(svg)+'\n'
