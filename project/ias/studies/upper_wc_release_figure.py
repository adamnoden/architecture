"""Draw the two actual WC clearances, tilted waste route and removable water connection."""
from html import escape


def figure(data):
    svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="845" viewBox="0 0 1200 845">',
         '<title>Two upper WCs with supported first release</title><desc>North-up plans of the family and principal bathrooms, showing the approach, soil columns and full movement to each first rest. Lower section shows the water bridge and leak tongue.</desc>',
         '<rect width="1200" height="845" fill="#faf8f0"/>']
    def text(x,y,s,size=14,weight='normal',colour='#23332e'):
        svg.append(f'<text x="{x}" y="{y}" font-family="sans-serif" font-size="{size}" font-weight="{weight}" fill="{colour}">{escape(s)}</text>')
    def line(points,colour,w=2,dash=''):
        pts=' '.join(f'{x:.1f},{y:.1f}' for x,y in points)
        svg.append(f'<polyline points="{pts}" fill="none" stroke="{colour}" stroke-width="{w}" stroke-linejoin="round" stroke-dasharray="{dash}"/>')
    def rect(x,y,w,h,fill,stroke='#a4a59a'):
        svg.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" fill="{fill}" stroke="{stroke}"/>')
    def dot(x,y,r,c):
        svg.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{r}" fill="{c}"/>')
    text(38,44,'Two upper WCs with a supported first release',29,'bold')
    text(39,72,'Selected open-back trial  /  north up  /  room dimensions in mm',16)
    for off,name,title,xmin,ymax,top in [(40,'family','Family bathroom',9250,6450,149),
                                           (627,'principal','Principal shower room',9250,9230,149)]:
        d=data[name];k=.14
        text(off,117,title,21,'bold')
        def xy(pt):
            return off+70+(pt[0]-xmin)*k,top+(ymax-pt[1])*k
        def roomrect(r,fill,stroke):
            x,y,w,h=r;X,Y=xy((x,y+h));rect(X,Y,w*k,h*k,fill,stroke)
        roomrect([9397,3800,2170.5,2600] if name=='family' else [9400,6600,2167.5,1552.5],'#edf0e7','#667d70')
        for obstacle in d['fixed']:
            roomrect(obstacle,'#d2d6cc','#9aa596')
        x,y=d['back']; sx,sy=d['front'];a,b=d['soil']['stackAxis']
        turn=[x+sx*38,y+sy*38]
        line(list(map(xy,[[x+sx*205,y+sy*205],turn,[a,b]])),'#596e9b',5)
        line(list(map(xy,d['feedCentreline'])),'#07746b',3)
        roomrect(d['suite'],'#e0b58a','#7a542f')
        # The stack branch is drawn again as a dashed hidden line across the ceramic back.
        line(list(map(xy,[[x+sx*205,y+sy*205],turn,[a,b]])),'#596e9b',2,'3 3')
        line(list(map(xy,d['trimmedCarrierCentrePath'])),'#b76535',3,'6 3')
        line(list(map(xy,d['ordinaryWCApproach'])),'#588477',2,'3 3')
        for pt in [d['tailPort'],d['fixedPort']]:dot(*xy(pt),3.2,'#00766c')
        dot(*xy(d['wetWitness']['sideLip']),2.6,'#b04449')
        dot(*xy(d['operator']),3.5,'#1f3830')
        if name=='family':
            dot(*xy(data['bath']['keeper']),3.2,'#a54c2e')
            line([xy(pt[:2]) for pt in data['bath']['path']],'#b96056',1.5,'3 3')
        if name=='family':
            text(*xy((9690,4240)),'Existing bath',12,'normal','#56675c')
            text(*xy((9470,5060)),'Cabinet',11,'normal','#56675c')
        else:
            # Opening in the north wall, with the slider parked for this exchange.
            line([xy((9900,8152.5)),xy((10800,8152.5))],'#faf8f0',2)
            text(*xy((10605,8840)),'Bedroom rest',12,'normal','#805433')
            text(*xy((9450,7000)),'Shower tray',12,'normal','#56675c')
        text(off,553,'Axial pull 150 mm  ·  '+('30 mm' if name=='family' else '12.5 mm')+' to the closest fixed item',15,'bold')
        text(off,577,'Copper supply and paired release ports shown in green.',13)
        text(off,597,'Dashed amber is the complete fixture’s route to first rest.',13)
    line([(40,627),(1160,627)],'#bfc2b6',1)
    text(40,661,'Why the water is disconnected before the soil joint moves',20,'bold')
    rect(61,735,73,37,'#d5d7c9','#a7ab96')
    line([(98,736),(98,709),(166,709),(166,736)],'#207c70',5)
    line([(166,736),(166,759),(260,759)],'#207c70',3)
    line([(64,782),(190,786),(229,791)],'#ab5545',3)
    text(278,704,'1. Isolate, drain and support the complete suite.',15)
    text(278,729,'2. Lift the two-ended water bridge 25 mm. The fixed feed stays on the wall bracket.',15)
    text(278,754,'3. Pull the braked carrier 150 mm against an independently held soil adaptor.',15)
    text(278,779,'4. Reconnect, flush and inspect the visible lip before closing the room.',15)
    text(40,822,'Blue represents the foul branch. Red marks the inspection lip and the revised family bath path. Fitting, bearing and seal performance remain to be verified.',13)
    return '\n'.join(svg+['</svg>'])+'\n'
