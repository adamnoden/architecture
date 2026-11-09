"""Draw the actual family programme, door and local wet connections."""
from pathlib import Path
from html import escape
import json,math,sys
D=Path(__file__).resolve().parent
j=json.loads((D/'shared-family-bathing.json').read_text());p=json.loads((D/'shared-bathing-door-paths.json').read_text())
H=json.loads((D.parents[1]/'had/studies/water-replan.json').read_text())['model']
art=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1320 715" role="img" aria-labelledby="title"><title id="title">Shared bathing with a retained private rear WC</title><rect width="1320" height="715" fill="#faf8f0"/><style>text{font-family:DejaVu Sans,Arial,sans-serif;fill:#233741}.cap{font-size:14px;font-weight:bold;fill:#40696a}.h{font-size:23px;font-weight:bold}.m{font-size:16px}.s{font-size:13px}</style>']
def t(x,y,s,c='m'):art.append(f'<text x="{x}" y="{y}" class="{c}">{escape(s)}</text>')
def line(pts,col,w=2,dash=''):
    art.append(f'<polyline points="{" ".join(f"{x:.2f},{y:.2f}" for x,y in pts)}" stroke="{col}" stroke-width="{w}" fill="none" stroke-linejoin="round" stroke-dasharray="{dash}"/>')
def rect(x,y,w,h,fill,stroke='none'):
    art.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" fill="{fill}" stroke="{stroke}"/>')
def box(m,r,fill,stroke='none'):
    a,b=m([r[0],r[1]+r[3]]);c,d=m([r[0]+r[2],r[1]])
    rect(a,b,c-a,d-b,fill,stroke)
def pl(m,pts,col,w=2,dash=''):line([m(v) for v in pts],col,w,dash)
def dot(x,y,r,col):art.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{r:.2f}" fill="{col}"/>')
def walls(m,ws):
    for wall in ws:
        a,b=wall['a'],wall['b'];axis=int(a[0]==b[0]);u,v=wall['finishedFaces'];lo,hi=sorted((a[axis],b[axis]))
        pts=[lo,*[n for h in wall.get('holes',[]) for n in h],hi]
        for i in range(0,len(pts)-1,2):
            p0,p1=pts[i:i+2];box(m,(p0,u,p1-p0,v-u) if not axis else (u,p0,v-u,p1-p0),'#81898c')
t(30,37,'Bedroom 4 shares a bathing fixture and keeps its private WC','h')
t(30,64,'Provisional house choice  ·  dimensions in mm  ·  north up  ·  occupied shoulder diameter 600')
for x in [22,456,888]:rect(x,88,410,568,'#fffef8','#d3d0c5')
for x,n,s in [(38,'01','Upper-floor journey'),(472,'02','Two-sided Bed 4 door'),(904,'03','Bath, supply and service')]:
    t(x,118,n,'cap');t(x,147,s,'h')
m=lambda p:(47+p[0]*.0305,548-p[1]*.0305)
box(m,[0,0,12000,12000],'#e8e4d7','#384347');box(m,[430,430,11140,11140],'#fffdf5')
box(m,H['court'],'#dfeadf','#83947e');box(m,H['stair'],'#e2dfd6','#9b9991');walls(m,H['upperWalls'])
for key in ('bed4','bed4-island-wardrobe','rear-WC','rear-basin','family-basin','family-WC','family-service-cabinet','family-local-soil-column','service-emitter-family-E'):
    if key in H['upperFurniture']:box(m,H['upperFurniture'][key],'#d2c9b4','#a19275')
box(m,H['upperFurniture']['rear-shower1000'],'#f0c8bc','#bc6e54');box(m,j['room']['tub'],'#c2dbe1','#467c90')
main=[[3550,9300],[3550,8500],[3450,8500],[3450,3782.5],[3450,3485],[8700,3485],[8700,5511],[8752.5,5511],[10380,5800],[10450,5750],[10450,4820]]
pl(m,main,'#176e77',3)
t(40,580,'Red is the omitted shower and proposed well.','s');t(40,603,'The bedroom and both private WC fixtures stay.','s');t(40,626,'The green route stays indoors around the court.','s')
art.append('<defs><clipPath id="middle-plan"><rect x="463" y="158" width="395" height="397"/></clipPath></defs><g clip-path="url(#middle-plan)">')
n=lambda p:(472+(p[0]-2750)*.204,553-(p[1]-7500)*.179)
for r,col in [([2817.5,7500,50,1255.5],'#9a9d96'),([3802.5,7500,480,697.5],'#dfeadf'),([2902.5,8755.5,197.5,194],'#81898c'),([4000,8755.5,377.5,194],'#81898c'),([3042,9800,1500,45],'#d2c9b4')]:box(n,r,col)
hinge=j['access']['bed4DoorTarget']['hinge']
for a,col in [(0,'#807063'),(75,'#b47937'),(100,'#985343')]:
    a=math.radians(a);pl(n,[hinge,[hinge[0]+762*math.cos(a),hinge[1]-762*math.sin(a)]],col,4)
pl(n,p['push'],'#176e77',3);pl(n,p['held'],'#176e77',2,'5 3');pl(n,p['pull'],'#9a6344',3)
dot(*n(p['pull'][-1]),5,'#284e59');art.append('</g>');t(473,580,'Teal pushes out and travels with the held leaf.','s');t(473,603,'Ochre pulls the closed door on returning.','s');t(473,626,'At 75° both grips are reached from one stance.','s')
b=lambda p:(911+(p[0]-9300)*.153,514-(p[1]-3650)*.226)
box(b,[9397,3800,2170.5,1400],'#f4f1e8');box(b,j['room']['tub'],'#dfeaf0','#477b91')
box(b,[9630,3855,1470,590],'#f9fbfa','#86abb7');box(b,[10625,4500,500,16],'#b8955d')
r=j['room']['shower'];pl(b,[[r['endX'][0],3800],[r['endX'][0],4465],[r['endX'][1],4465],[r['endX'][1],3800]],'#5d8179',2,'5 4')
for k,col in [('hot','#af5943'),('cold','#4b7197')]:pl(b,r['pipesHotCold'][k],col,3)
dot(*b(j['room']['waste']),4,'#35444c');dot(*b(j['room']['proposedDrop']),5,'#7c5843');dot(*b([10775,4150]),7,'#176e77')
pl(b,[[10450,4910],[10450,4140],[10775,4140]],'#176e77',2,'5 3')
t(905,550,'Red / blue are the proposed independent feeds.','s');t(905,576,'The original waste axis stays at 10850 / 4150.','s')
t(905,602,'North access panel stays clear up to Z500.','s');t(905,626,'The 580 rim still has to be stepped over.','s')
t(30,687,'The routes test geometry. Actual doorsets, shower parts, footing, handling, wet seals and household suitability require their named decisions.','s')
payload='\n'.join(art+[ '</svg>',''])
path=D/'shared-family-bathing.svg'
if '--check' in sys.argv:assert path.read_text()==payload
else:path.write_text(payload)
