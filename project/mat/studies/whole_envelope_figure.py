"""Four measured details in the proposed material family."""
from html import escape

def figure(d):
    out=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1260 1040" role="img" aria-label="Garden shelf, two-tier valley, Study glazing and outlet gasket">',
         '<rect width="1260" height="1040" fill="#f6f3eb"/><style>text{font-family:Arial,sans-serif;fill:#20353c}.h1{font-size:35px;font-weight:700}.h2{font-size:21px;font-weight:700}.body{font-size:15px}.small{font-size:13px}.tag{font-size:12px;font-weight:700;letter-spacing:1px}</style>']
    def text(x,y,v,cls='body'):
        out.append(f'<text x="{x}" y="{y}" class="{cls}">{escape(str(v))}</text>')
    def rect(x,y,w,h,fill,stroke='none'):
        out.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{fill}" stroke="{stroke}"/>')
    def path(points,color,width=2):
        out.append('<polyline fill="none" stroke="'+color+'" stroke-width="'+str(width)+'" points="'+' '.join(f'{x:.1f},{y:.1f}' for x,y in points)+'"/>')
    def lines(x,y,*ss):
        for i,s in enumerate(ss):text(x,y+i*22,s,'small')
    text(39,35,'MATERIAL INTEGRITY   /   FOUR CONSEQUENTIAL JUNCTIONS','tag')
    text(39,81,'What carries the load, keeps out water and comes apart?','h1')
    text(41,113,'Development offer for the drained pre-site house. Dimensions in millimetres. Load and heat figures are bounded comparisons.')
    for a,b in ((36,143),(640,143),(36,572),(640,572)):rect(a,b,584,409,'#fffefa','#cbd1c8')
    text(57,180,'01   Carry the garden-facing brick','h2')
    text(57,207,'Section northward across the 140 × 750 concrete ring.','small')
    rect(93,242,94,210,'#c4c9cc','#64767b')
    rect(187,236,65,107,'#b0ccbc','#697d70')
    rect(282,237,63,106,'#bb907a','#816756')
    path([(88,455),(88,236),(192,236),(192,455),(88,455)],'#35535a',6)
    path([(192,347),(330,347),(330,354),(192,354),(192,417),(266,354)],'#9a572f',5)
    lines(360,256,'Six built-in collars.','Keep all steel outside','the existing RC cage.')
    lines(360,341,'Outer face Y11737.5','Shelf toe Y11977.5','80 brick bearing,','75 after 5 outward error.')
    lines(58,490,'Outer collars stop 25 clear of the two reserved roof-rod spreaders.',
          'The 72.5 glass overlap isolates the otherwise exposed portal shoulder.')
    text(660,180,'02   Separate the two valley waters','h2')
    text(661,207,'Diagram along the 18.25° valley. The upper laps drain downhill.','small')
    for i in range(3):
        a=681+i*150;b=a+181;z=252+i*32;path([(a,z),(b,z+37)],'#af7548',8)
    path([(679,282),(1164,385),(1176,400)],'#276b76',6)
    path([(679,297),(1158,399)],'#7b8180',9)
    text(683,363,'300 upper lap','small');text(905,446,'One continuous 3824 lower blank','small')
    lines(661,487,'316L sheet replaces the lead specials. Each lower strip arrives unformed',
          'on a 602 outside-diameter coil and is drawn uphill on supported guides.')
    text(57,610,'03   Three individually replaceable panes','h2')
    text(57,638,'Study at X2100 on SAP-C1. Diagram through its rectangular opening tier.','small')
    rect(81,675,468,132,'#e8e2d6','#7d8177')
    for x,z in [(143,'weather'),(270,'middle'),(391,'room')]:
        rect(x,686,11,113,'#8fc3cc','#367784')
        text(x-13,831,z,'small')
    path([(154,722),(270,722)],'#688d78');text(195,714,'18','small')
    path([(281,754),(391,754)],'#688d78');text(323,745,'16','small')
    lines(58,875,'Two warm carriers share the original moving envelope. The middle',
          '794 × 1108 frame can pass the 810 × 1124 throat with 4 on each',
          'side after the paired 2 mm allowance. Test the complete window.')
    text(660,610,'04   Meter the small E-outlet residue','h2')
    text(661,638,'One removable U at X10050. The scale across the land is enlarged.','small')
    rect(692,689,484,23,'#aab5b7','#52646a');rect(692,752,484,23,'#aab5b7','#52646a')
    rect(856,712,153,40,'#b47b56','#815236')
    text(690,800,'6.825','small');text(887,800,'6.35 wet strip','small');text(1091,800,'6.825','small')
    lines(661,875,'Four stops bypass excess preload. Hold a measured 0.74–0.84 thick',
          'lot at 0.480 nominal gap. Qualify wet seating, repeated release and',
          'ageing. This local silicone exception has no owner approval.')
    text(41,1017,'The raised roof, plate loads and cuffed wet junctions remain subject to their assembly and site checks.','small')
    return '\n'.join(out+['</svg>',''])
