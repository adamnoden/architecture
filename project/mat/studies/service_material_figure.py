"""Dimensioned consequences of the service-material choices."""
from html import escape

def figure(result):
    p=result['principal']; f=result['copperFireInterface']
    parts=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1050 930" role="img" aria-labelledby="title desc">',
           '<title id="title">Three interfaces that govern the service-material offer</title>',
           '<desc id="desc">A north bedroom radiator, a copper penetration through a masonry pier and the accessible living-room foul-stack repair. These comparison dimensions retain outstanding approvals.</desc>',
           '<rect width="1050" height="930" fill="#faf9f4"/>',
           '<g font-family="DejaVu Sans, sans-serif" fill="#182f31">']
    def text(x,y,label,size=14,bold=False):
        parts.append(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{700 if bold else 400}">{escape(label)}</text>')
    def rect(x,y,w,h,colour,stroke='none'):
        parts.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" fill="{colour}" stroke="{stroke}" stroke-width="1.5"/>')
    def circle(x,y,r,colour,stroke):
        parts.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{colour}" stroke="{stroke}" stroke-width="1.5"/>')
    text(35,43,'Service materials on the six-extract house',28,True)
    text(35,71,'Dimensions in mm. House dimensions and conditional product envelopes.')
    rect(35,93,980,2,'#397777')
    text(35,132,'01   The north bedroom radiator',20,True)
    text(525,132,'02   Fire separation at a copper service',20,True)
    text(35,155,'Plan. North is up. Bed shown in its service position.')
    text(525,155,'Transverse section through the provisional formed bore.')
    edge=11570.5; scale=.113
    def plan(box,colour,stroke):
        x,y,w,h=box
        rect(45+(x-7719.5)*scale,188+(edge-y-h)*scale,w*scale,h*scale,colour,stroke)
    plan([7719.5,8424.5,3851,3146],'#eef0e7','#67827e')
    plan(p['servicePark'],'#e5ceb0','#885f39')
    plan(p['trialH600L1200'],'#3a817b','#234f50')
    text(49,181,'North wall')
    text(152,340,'Parked bed',14,True)
    text(205,364,'1600 × 2090')
    text(275,223,'Proposed 1200 body')
    text(275,245,'25 to parked bed in X')
    text(55,505,'3851 × 3146 inside the two northeast walls')
    text(55,527,'63 kg dry. Price its supported first removal.')
    circle(643,294,98,'#c1c9bf','#465d57')
    circle(643,294,80,'#ece0b5','#726e53')
    circle(643,294,21.56,'#d69770','#844e34')
    circle(643,294,19.21,'#faf9f4','#844e34')
    text(765,237,'100 formed diameter',15,True)
    text(765,265,'82 across pipe and wool')
    text(765,292,'22 outside copper diameter')
    text(765,319,'9 radial space to bore')
    text(525,426,'Longitudinal fit',16,True)
    text(525,452,'150 assessed mortar depth against a 140 structural core.')
    text(525,478,'The two 27 finishes cannot be counted as tested mortar.')
    text(525,505,'The protected straight length also has to fit.')
    rect(35,558,980,2,'#397777')
    foul=result['rearFoulService']
    text(35,596,'03   The rear foul stack in the occupied living room',20,True)
    text(35,622,'Plan. Move the side table east before opening the front.')
    sx,sy=.206,.206
    def rear(box,colour,stroke):
        x,y,w,h=box
        rect(40+(x-400)*sx,653+(11570.5-y-h)*sy,w*sx,h*sy,colour,stroke)
    rear(foul['cabinet'],'#deded2','#60737a')
    rear(foul['table'],'#faf9f4','#967251')
    rear(foul['tablePark'],'#e5ceb0','#885f39')
    rx,ry=foul['rackCentre'];rear([rx-90,ry-100,180,200],'#b1cdc2','#315f5d')
    tx,ty=foul['task'];circle(40+(tx-400)*sx,653+(11570.5-ty)*sy,300*sx,'none','#41736f')
    px,py=foul['axis'];circle(40+(px-400)*sx,653+(11570.5-py)*sy,55*sx,'#b6bfc1','#273d43')
    text(44,835,'R-01 cabinet',13)
    text(212,817,'900 table move',13)
    text(42,865,'Circle shows the worker at the cabinet. The first rest is green.')
    text(525,645,'Elevation through the straight stack',15,True)
    text(525,675,'+1700     End of clear upper parking zone')
    text(525,703,'+1550     Upper joint')
    text(525,739,'600 long removable section, held independently')
    text(525,775,'+950       Lower joint')
    text(525,803,'+800       End of clear lower parking zone')
    text(525,842,'Two 130 sleeves. Reserve 150 straight at each end.')
    text(525,865,'The supplied fitting must demonstrate engagement and travel.')
    rect(35,889,980,2,'#397777')
    text(35,914,'Material status',14,True)
    text(164,914,'Conditional assembly proposals. Component replacement, house adoption and owner release remain separate.',13)
    parts.extend(['</g>','</svg>'])
    return '\n'.join(parts)+'\n'
