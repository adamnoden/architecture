"""Draw permanent guard transfer, shared steel stations and the temporary barrier."""
import html
import json
from pathlib import Path
import sys

D=Path(__file__).resolve().parent
def read(name):
    return json.loads((D/f'current-house-{name}.json').read_text())
b=read('guard-bracket')
w=read('window-renewal')
scene=w['temporaryBarrier']['occupied']
north=next(x for x in scene if x['face']=='north' and x['centre']==1800)
west=next(x for x in scene if x['face']=='west' and x['centre']==10200)
parts=['<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="960" viewBox="0 0 1500 960" role="img" aria-labelledby="title"><title id="title">Guard anchorage, temporary barrier and lifting clearance</title><rect width="1500" height="960" fill="#f9f7f0"/>']
ink='#20343d'; muted='#4d686b'; blue='#327694'; rust='#ad552f'; rc='#acd0c3'; tan='#d4b889'
def rect(x,y,dx,dy,col,stroke='none'):
    parts.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{dx:.2f}" height="{dy:.2f}" fill="{col}" stroke="{stroke}"/>')
def label(x,y,text,size=17,col=ink,bold=False):
    parts.append(f'<text x="{x:.1f}" y="{y:.1f}" font-family="DejaVu Sans,sans-serif" font-size="{size}" fill="{col}" font-weight="{700 if bold else 400}">{html.escape(text)}</text>')
def line(x,y,xx,yy,col,width=2):
    parts.append(f'<line x1="{x:.2f}" y1="{y:.2f}" x2="{xx:.2f}" y2="{yy:.2f}" stroke="{col}" stroke-width="{width}"/>')
def dot(x,y,r,col):
    parts.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{r:.2f}" fill="{col}"/>')
label(34,48,'Corner window    /    guard transfer and supported release',34,ink,True)
label(36,81,'North-west reference  ·  proposed hardware and temporary works  ·  dimensions in mm',19,muted)
line(36,103,1463,103,muted)
label(38,143,'Permanent guard  /  near jamb in plan',22,ink,True)
label(38,171,'Section at a receiver row. Normal coordinate q increases toward the room.',16)
SX=lambda x:65+(x-1140)*1.3
SY=lambda q:210+(q+35)*.78
def plan(x1,x2,q1,q2,colour,stroke='none'):
    rect(SX(x1),SY(q1),SX(x2)-SX(x1),SY(q2)-SY(q1),colour,stroke)
plan(1140,1300,0,102.5,tan)
plan(1140,1300,262.5,402.5,rc)
plan(1140,1300,402.5,429.5,'#d5d1c2')
plan(1170,1295,0,32,blue,ink)
plan(1175,1215,32,242.5,blue,ink)
plan(1145,1245,242.5,262.5,'#587d88',ink)
plan(1155,1235,402.5,416.5,'#587d88',ink)
plan(1182,1208,262.5,402.5,'#f9f7f0',blue)
line(SX(1195),SY(235),SX(1195),SY(431),rust,4)
plan(1210,1290,-30,0,rust,ink)
plan(1290,1387.5,-30,0,rust,ink)
plan(1362.5,1387.5,0,130,rust,ink)
plan(1360,1410,130,160,'#52616a',ink)
for x in [1230,1270]:dot(SX(x),SY(-10),4,'#fff3de')
for y,t in [(230,'Common removable bracket'),(279,'32 plate and offset M12 studs'),(330,'102.5 weather leaf'),(370,'160 cavity and projecting tube'),(439,'20 wet-face plate'),(501,'140 RC  /  M16 in 26 sleeve'),(556,'14 rear plate and room pocket')]:
    label(438,y,t,16)
line(722,124,722,582,'#b5c3bd')
label(753,143,'Shared cage  /  opposite jamb',22,ink,True)
label(753,171,'One elevation schedule controls both sockets and guard rods.',16)
x0=790;zmap=lambda z:542-(z-4300)*.245
rect(x0,zmap(5640),112,zmap(4300)-zmap(5640),rc)
import runpy
cage=runpy.run_path(str(D/'arch-link-schedule.py'))
for z in cage['jamb']:
    if 4300<=z<=5640:line(x0+9,zmap(z),x0+103,zmap(z),muted,1)
for z,rad in [(4400,8.5),(4720,8.5),(5430,13),(5570,13)]:
    dot(x0+57,zmap(z),rad*.38,rust)
    label(936,zmap(z)+6, f'{z}    '+('M12 temporary socket' if rad<10 else 'M16 permanent guard rod'),16)
label(754,567,'H6/55 nominal. At +5 inward cage setout, both arch and jamb exceed link capacity.',15)
line(38,603,1462,603,'#b5c3bd')
label(38,645,'Release sequence  /  independent support at each transfer',22,ink,True)
label(40,680,'1    Fit the room barrier before opening the window or detaching the external guard.',17)
label(40,712,'2    Capture the grille on two blades and four cuffs. Support each fork and withdraw both collars 100.',17)
label(40,744,f"3    Draw the grille {w['capture']['guardDraw']}, or the closed frame {w['capture']['closedFrameDraw']} on four external fittings, to q −520.",17)
label(40,776,'4    Transfer onto the lifting yoke before releasing the carriage. Retract the blades and lower clear of the rails.',17)
label(40,825,'Occupied-room check',20,ink,True)
label(40,855,f"Rear north  /  barrier bottom {north['panelBottom']}; radiator top 700. Rear west  /  a socket at Y11020 falls behind fixed joinery.",16)
label(40,886,'The cabinet height and access are unbound. That west occurrence stays unresolved; a clear external travel path cannot release it.',16)
label(40,921,'The permanent receiver still needs a proven concrete stress field, fitted seals and joint assembly. The mobile support needs its ground and handling proof.',15,muted)
parts.append('</svg>')
data='\n'.join(parts)+'\n';path=Path(__file__).with_suffix('.svg')
if '--check' in sys.argv:assert path.read_text()==data
else:path.write_text(data)
