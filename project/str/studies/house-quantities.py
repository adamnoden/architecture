"""Exact rectangle-union planning areas; gross core quantities before openings."""
from pathlib import Path
import json
OUT=Path(__file__).resolve().parent

import sys, io, tempfile, hashlib
def emit(name, data):
    target = OUT / name
    if '--check' in sys.argv:
        if target.read_text() != data:
            raise SystemExit('STALE: ' + str(target))
    else:
        target.write_text(data)
def emit_svg(fig, name):
    buffer = io.StringIO()
    fig.savefig(buffer, format='svg', metadata={'Date': '2026-10-30'})
    emit(name, buffer.getvalue())
def preview(fig, name):
    if '--preview' in sys.argv:
        fig.savefig(Path(tempfile.gettempdir()) / name, dpi=170)

s=json.loads((OUT/'house-source.json').read_text());d=json.loads((OUT/'house-plan.json').read_text())
def wallrect(w,t=None):
    x,y=w['a'];xx,yy=w['b'];t=w['t'] if t is None else t
    return (x,y-t/2,xx-x,t) if y==yy else(x-t/2,y,t,yy-y)
env=[(0,0,12000,417.5),(0,11582.5,12000,417.5),(0,0,417.5,12000),(11582.5,0,417.5,12000),(3832.5,3832.5,4335,4335)]
inside=lambda r,x,y:r[0]<x<r[0]+r[2] and r[1]<y<r[1]+r[3]
def area(inc,exc):
    allr=inc+exc;xs=sorted({q for r in allr for q in[r[0],r[0]+r[2]]});ys=sorted({q for r in allr for q in[r[1],r[1]+r[3]]});v=0
    for a,b in zip(xs,xs[1:]):
        for c,e in zip(ys,ys[1:]):
            x=(a+b)/2;y=(c+e)/2
            if any(inside(r,x,y)for r in inc)and not any(inside(r,x,y)for r in exc):v+=(b-a)*(e-c)
    return v/1e6
whole=[(0,0,12000,12000)];ring=area(whole,env)
rows=[]
for level,key in [('GROUND','ground_walls'),('FIRST','first_walls')]:
    sourcewalls=[{**w,'t':125}for w in s['sourceInventory']['partitions'][level]]
    for name,ws in [('source125',sourcewalls),('proposedB',d[key])]:
        rr=[wallrect(w)for w in ws];after=area(whole,env+rr)
        openings=[]
        if level=='FIRST':openings=[d['stair'],d['void']]if name=='proposedB'else[(417.5,3832.5,2400,4335),(4862.5,417.5,2275,2295)]
        cores=[wallrect(w,w['t']-30)for w in ws]if name=='proposedB'else[]
        corearea=area(cores,env)if cores else None
        rows.append({'level':level,'scheme':name,'ring_area_before_partitions_m2':ring,'remaining_before_stair_void_m2':after,
                     'wall_reservation_m2':ring-after,'net_after_full_stair_aperture_and_void_m2':area(whole,env+rr+openings)if openings else None,
                     'gross_core_footprint_union_m2':corearea,'gross_core_volume_at3100_before_openings_m3':corearea*3.1 if corearea else None,
                     'quantity_scope':'Internal cores only, gross before door/arch openings, height3100 only, no roof extension, foundations, envelope or density. Finished reservations include doorway thresholds.'})

def box(x,y,xx,yy):return(x,y,xx-x,yy-y)
rooms={
 'Bed2':[box(417.5,417.5,4800,2650),box(417.5,2650,2817.5,3247.5)],
 'Bed3':[box(7200,417.5,11582.5,2650),box(9300,2650,11582.5,3700)],
 'Bed4':[box(2902.5,8852.5,7400,11582.5),box(4450,8167.5,7400,8852.5)],
 'Principal':[box(7400,8290,11582.5,11582.5),box(7400,8167.5,7750,8290)],
 'Rear1000ensuite':[box(417.5,8852.5,2902.5,11582.5)],
 'Principal900ensuite':[box(9300,6500,11582.5,8290)],
 'FamilyBathroom':[box(9300,3700,11582.5,6500)]}
roomareas={k:area(v,env+[wallrect(w)for w in d['first_walls']])for k,v in rooms.items()}
grooms={
 'GuestWC':[box(7200,417.5,9300,2650)],'Utility':[box(9300,417.5,11582.5,2550)],
 'PlantIncludingBothSidesOfNewArch':[box(9300,2550,11582.5,6500)],
 'Pantry':[box(9300,6500,11582.5,8290)],
 'RearReading':[box(417.5,8852.5,2902.5,11582.5)],
 'RearFamilyDining':[box(2902.5,8852.5,7400,11582.5),box(4450,8167.5,7400,8852.5)],
 'Kitchen':[box(7400,8290,11582.5,11582.5),box(7400,8167.5,7750,8290)]}
groundareas={k:area(v,env+[wallrect(w)for w in d['ground_walls']])for k,v in grooms.items()}
res={'basis':'source and joined B files in this folder; exact axis-aligned union','rows':rows,'proposed_upper_room_areas_m2':roomareas,'proposed_ground_room_areas_m2':groundareas,
 'authority':'Planning reservation/quantity comparison, not statutory net internal area, accessible usable area or measured material takeoff.'}
emit('house-quantities.json',json.dumps(res,indent=2)+'\n')
print(json.dumps(res,indent=2))
