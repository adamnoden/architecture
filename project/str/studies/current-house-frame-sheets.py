"""Two inspected project drawings: actual proposed roof massing and finite
load path to located shafts. No visual selection of a site or façade system.
"""
from pathlib import Path
import json,math,sys,html
D=Path(__file__).resolve().parent
read=lambda n:json.loads((D/n).read_text())
H=json.loads((D.parents[1]/'had/studies/water-replan.json').read_text())['model']
R=read('current-house-roof-route.json');L=read('current-house-joined-foundation.json');F=read('current-house-floor-stops.json');M=read('current-house-membrane-reactions.json');T=read('current-house-ground-ties.json');B=read('current-house-service-bay.json')
def svg(w,h):return [f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}"><rect width="100%" height="100%" fill="#fbfaf6"/><g font-family="sans-serif" fill="#24383d">']
def text(x,y,s,n=16,color='#24383d'):u.append(f'<text x="{x}" y="{y}" font-size="{n}" fill="{color}">{html.escape(str(s))}</text>')
def poly(pts,fill,stroke='#53646a',w=1.3):u.append('<polygon points="'+' '.join(f'{x:.2f},{y:.2f}' for x,y in pts)+f'" fill="{fill}" stroke="{stroke}" stroke-width="{w}"/>')
def line(pts,color='#354950',w=2,dash=None):u.append('<polyline points="'+' '.join(f'{x:.2f},{y:.2f}' for x,y in pts)+f'" fill="none" stroke="{color}" stroke-width="{w}"'+(f' stroke-dasharray="{dash}"' if dash else '')+'/>')
def done(n):
    u.append('</g></svg>');s='\n'.join(u)+'\n';q=D/n
    if '--check' in sys.argv:assert q.read_text()==s
    else:q.write_text(s)
u=svg(1460,880);text(40,48,'The shifted roof on the current house',29);text(40,79,'Actual +197.52 mm height comparison • four roof pitches • court opening retained • no change to the selected house.',18)
e=R['referenceElevations']['eave'];rz=R['referenceElevations']['ridgeCover'];edge=e-200*math.tan(math.radians(25))
def square(lo):return [(lo,lo),(12000-lo,lo),(12000-lo,12000-lo),(lo,12000-lo)]
def iso(x,y,z):return (413+.030*(.82*x-.61*y),597+.030*(-.35*x-.45*y-.81*z))
def shape3(P,col):poly([iso(*q) for q in P],col)
for face in [3,0]:
    a,b=square(0)[face],square(0)[(face+1)%4];shape3([(*a,-1800),(*b,-1800),(*b,0),(*a,0)],'#9b9990');shape3([(*a,0),(*b,0),(*b,e),(*a,e)],'#ddceb9' if face==0 else '#c2ae92')
def arch(q,z0):
    c=q['centre'];w=q['width'];si=q.get('sill',0);hd=q.get('head',2850);sp=q.get('spring',2550);hh=hd-sp
    if hh<=0:return [(c-w/2,z0+si),(c-w/2,z0+hd),(c+w/2,z0+hd),(c+w/2,z0+si)]
    r=(w*w/4+hh**2)/(2*hh);zz=hd-r
    return [(c-w/2,z0+si)]+[(c-w/2+w*i/32,z0+zz+math.sqrt(max(0,r*r-(-w/2+w*i/32)**2))) for i in range(33)]+[(c+w/2,z0+si)]
for name,z in [('GROUND',0),('FIRST',3450)]:
 for q in H['openings'][name]:
    if q['wall']=='outer-south':shape3([(x,0,zz) for x,zz in arch(q,z)],'#627b7e')
    if q['wall']=='outer-west':shape3([(0,x,zz) for x,zz in arch(q,z)],'#63777b')
O=square(-200);P=square(2125);I=square(4450)
# Inner roof faces on the far side of the central opening first; pitched
# facets with the same true vertical fall and the four actual hip ridges.
pan=[]
for j in range(4):
    k=(j+1)%4
    for f,pts in [(j,[(*O[j],edge),(*O[k],edge),(*P[k],rz),(*P[j],rz)]),(j+4,[(*P[j],rz),(*P[k],rz),(*I[k],edge),(*I[j],edge)])]:
        pan.append((sum(x+y for x,y,z in pts),f,pts))
# A court is open to sky but the far courtyard masonry is visible from
# this eye. Clip it to the true inner eave aperture; do not draw sky through
# the building as if the entire roof were a floating ring.
poly([iso(x,y,edge) for x,y in I],'#bda88a')
clip=' '.join(f'{iso(x,y,edge)[0]:.2f},{iso(x,y,edge)[1]:.2f}' for x,y in I)
u.append('<defs><clipPath id="court"><polygon points="'+clip+'"/></clipPath></defs><g clip-path="url(#court)">')
for f0,k,nm in [(1,2,'court-east'),(2,3,'court-north')]:
    a0,b0=square(4250)[f0],square(4250)[k]
    shape3([(*a0,0),(*b0,0),(*b0,e),(*a0,e)],'#ceb99d' if f0==2 else '#b5a186')
    for op in H['openings']['FIRST']:
        if op['wall']==nm:
            qz=arch(op,3450);shape3([(x,7750,z) if f0==2 else (7750,x,z) for x,z in qz],'#698084')
u.append('</g>')
for _,f,pts in sorted(pan,reverse=True):shape3(pts,['#8199a2','#b1c0c5','#c1ccd0','#8fa5ac','#a8b9bc','#849ea4','#728d95','#a6babd'][f])
text(39,658,'South-west view. The pitch stays at 25° and the open court stays open.',17)
fx=lambda x:848+(x+200)*.042;fz=lambda z:597-(z+1800)*.042
for z0,z1,c in [(-1800,0,'#aaa99f'),(0,e,'#d7c4a7')]:poly([(fx(0),fz(z0)),(fx(12000),fz(z0)),(fx(12000),fz(z1)),(fx(0),fz(z1))],c)
poly([(fx(x),fz(z)) for x,z in [(-200,edge),(2125,rz),(9875,rz),(12200,edge)]],'#8a9fa7')
line([(fx(-200),fz(7100-200*math.tan(math.radians(25)))),(fx(12200),fz(7100-200*math.tan(math.radians(25))))],'#964d35',2,'6 4')
for nm,z in [('GROUND',0),('FIRST',3450)]:
 for q in H['openings'][nm]:
    if q['wall']=='outer-south':poly([(fx(x),fz(zz)) for x,zz in arch(q,z)],'#70898c')
text(845,638,'Front elevation • dashed: selected physical eave',16)
text(844,110,'Roof height belongs to a proposal',22);text(844,138,f'Eave datum {e:,.2f} mm  /  ridge {rz:,.2f} mm',17)
text(844,160,'The roof steel joins below the ridge cover.',16)
line([(40,704),(1410,704)],'#bcc6c3',1)
text(40,750,'What changes',20);text(40,781,'A 220 × 120 collector and paired horizontal ties carry the pitched frames.',16);text(40,810,'The actual roof ridge purlin participates in wind delivery; the roof deck is not a rigid plate.',16)
text(847,750,'What the image cannot settle',20);text(847,781,'Arch movement, full-frame renewal and fire / weather closure.',16);text(847,810,'Shown plinth −1800 is a trial section, not a site datum.',16)
done('current-house-shifted-massing.svg')
u=svg(1500,970);text(40,47,'How the roof and floor reach the proposed shafts',29);text(40,78,'Signed comparison under the actual shifted roof. Named wind programmes conserve force, both first moments and horizontal yaw.',17)
def plan(x,y):return 55+x*.045,679-y*.045
def path(P,col,w):line([plan(*q) for q in P],col,w)
def sq(v,c,w):path(square(v)+[square(v)[0]],c,w)
sq(332.5,'#5b7677',8);sq(3917.5,'#5b7677',8);sq(2125,'#aa7040',5)
for j in range(4):
 def pt(n,u):return [(u,n),(12000-n,u),(12000-u,12000-n),(n,12000-u)][j]
 for x,y in zip([332.5,4700,7300,11667.5],[3917.5,4700,7300,8082.5]):path([pt(332.5,x),pt(3917.5,y)],'#a8b1ad',2)
for q in L['heads']:
    xx,yy=plan(*q['xy']);lo=q['separateComponentBounds_N_Cx_Cy'][0][0];ra=5+min(5,-lo/120)
    u.append(f'<circle cx="{xx:.2f}" cy="{yy:.2f}" r="{ra:.2f}" fill="'+('#a6503e' if lo< -100 else '#4e7884')+'" stroke="#fff" stroke-width="1.2"/>')
for t in L['courtTies']:
    path([t['oldCorner'],t['newHold']],'#ef9c41',5)
text(45,735,'52 proposed shafts. Rust: independent tensile bound exceeds 100 kN.',15)
text(45,762,'Gold: actual ridge loop. Amber: four courtyard holds shifted to real shafts.',15)
text(665,132,'Force returned through the pitched frame',22)
x=lambda a:682+a*.162;y=lambda z:365-(z-6440)*.139
for z,c in [(6600,'#4e7478'),(6770,'#96806d')]:line([(x(0),y(z)),(x(3585),y(z))],c,5)
rt=R['referenceElevations'];line([(x(0),y(6860)),(x(1792.5),y(rt['rafterCrownCentre'])),(x(3585),y(6860))],'#ac7449',8)
for a in [0,3585]:line([(x(a),y(6540)),(x(a),y(6860))],'#6b8688',7)
for a in [0,3585]:line([(x(a),y(6540)),(x(a),397)],'#4e7478',3)
text(1022,203,'45 mm crown pin',15);text(695,417,'Inclined steel returns real horizontal and vertical forces into both heels.',16)
text(665,474,'Two floor loops, different depths',22);text(665,505,'Outer 140 × 750; court 140 × 650. Soffit stays at +3170.',17)
text(665,532,'The slab has the court, stair and entry removed; the 400 mm wet well is challenged too.',15)
text(665,560,'Eight mid-height H12 bars address the narrow stair-side strip and in-plane edge forces.',15)
text(665,620,'An open result at the water bay',22);text(665,650,'140 mm suspended floor at −1200; 180 mm side walls.',17)
text(665,676,'The staff slab passes its 5 kN / 200 mm print. The joint does not:',16)
text(665,702,'7 mm clear at the pile starters versus 25 mm. No moving sled load on this slab.',16)
line([(40,808),(1455,808)],'#bec8c7',1);text(40,850,'Scope',19);text(40,881,'The 52 positions are a structural comparison. Negative head actions require a positive ground path; they are not demonstrated soil resistance.',16)
text(40,909,'Steel/RC detailing, construction stages, capillary edges, window renewal, site stiffness and the full bay cage remain open.',16)
done('current-house-joined-frame.svg')
