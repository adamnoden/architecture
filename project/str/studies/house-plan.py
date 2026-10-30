"""Unadopted joined-plan comparison. Coordinates are authored proposals.
No member, arch, door, product or sanitary system is accepted by this script.
Run from the repository root with --check to compare retained JSON/SVG,
or --preview to write inspection PNGs under the system temporary directory.
"""
from pathlib import Path
from collections import deque
import json, math, os
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

os.environ.setdefault('MPLCONFIGDIR',str(Path(tempfile.gettempdir())/'ovid-str-house-mpl-cache'))
import numpy as np

source=json.loads((OUT/'house-source.json').read_text())
inv=source['sourceInventory']
E=417.5; R=300.; STEP=10.
# id,x1,y1,x2,y2,finished thickness,door intervals along the line.
def W(name,x,y,xx,yy,t=170,holes=()):return dict(id=name,a=[x,y],b=[xx,yy],t=t,holes=list(holes))
def interval(c,w):return [c-w/2,c+w/2]
first=[
 W('bed2-east',4800,0,4800,2650),
 W('bed2-north-main',2817.5,2650,4800,2650,holes=[interval(3900,900)]),
 W('bed2-L-return',2817.5,2650,2817.5,3247.5),W('bed2-L-north',0,3247.5,2817.5,3247.5),
 W('bed3-west',7200,0,7200,2650),W('bed3-north-main',7200,2650,9300,2650,holes=[interval(8700,900)]),
 W('wet-spine',9300,2650,9300,8290,holes=[interval(5900,900)]),
 W('bed3-L-north',9300,3700,12000,3700),W('bath-north',9300,6500,12000,6500),
 W('rear-west',0,8852.5,4450,8852.5,holes=[interval(3550,900)]),
 W('rear-west-return',4450,8012.5,4450,8852.5,245),
 W('rear-east',7750,8290,12000,8290,245,[interval(8700,900),interval(10900,900)]),
 W('rear-divider',7400,8167.5,7400,12000,245),
 W('rear-wet-east',2902.5,8852.5,2902.5,12000,170,[interval(10800,900)])
]
ground=[
 W('study-east',4800,0,4800,1200), W('cloak-east',4800,1200,4800,2650,holes=[interval(2100,800)]),
 W('cloak-west',3400,1200,3400,2650),W('cloak-south',3400,1200,4800,1200),
 W('study-cloak-north',2817.5,2650,4800,2650),
 W('study-L-return',2817.5,2650,2817.5,3247.5),W('study-L-north',0,3247.5,2817.5,3247.5,holes=[interval(1800,900)]),
 W('wc-west',7200,0,7200,2650),W('wc-north',7200,2650,9300,2650,holes=[interval(8100,900)]),
 W('service-spine',9300,0,9300,8290,holes=[interval(3200,900)]),
 W('utility-north',9300,2550,12000,2550,holes=[interval(10700,900)]),
 W('plant-intermediate-arch',9300,3700,12000,3700,holes=[interval(10350,1400)]),
 W('plant-north',9300,6500,12000,6500),
 W('rear-west',0,8852.5,4450,8852.5,holes=[interval(3550,900)]),
 W('rear-west-return',4450,8012.5,4450,8852.5,245),
 W('rear-east',7750,8290,12000,8290,245,[interval(8700,900),interval(10900,900)]),
 W('rear-divider',7400,8167.5,7400,12000,245,[interval(10200,1500)]),
 W('rear-reading-east',2902.5,8852.5,2902.5,12000,170,[interval(10150,1500)])
]
stair=(417.5,4432.5,2400,4335)
void=(4885,417.5,2230,2317.5)
court=(3832.5,3832.5,4335,4335)
objects={
 'bed2':(1040,1062.5,1500,2000),'bed2-head':(1040,3062.5,1500,100),
 'bed2-wardrobe':(4055,600,660,1500),
 'bed3':(9450,1525,1500,2000),'bed3-head':(9450,3525,1500,90),
 'bed3-wardrobe':(7285,900,660,1500),
 'bed4':(5150,9492.5,1500,2000),'bed4-head':(5150,11492.5,1500,90),
 'bed4-island-wardrobe':(3000,9800,1500,660),
 'principal':(9150,9492.5,1600,2000),'principal-head':(9150,11492.5,1600,90),
 'principal-wardrobe':(7522.5,9300,660,1500),
 'rear-shower1000':(1817.5,8937.5,1000,1000),
 'rear-WC':(717.5,11000,560,355),
 'rear-basin':(1000,8937.5,400,220),
 'rear-cabinet':(417.5,10800,300,750),
 'rear-west-low-box':(417.5,9937.5,150,862.5),
 'principal-shower900':(9385,6585,900,900),
 'principal-WC':(11022.5,7100,560,355),
 'principal-basin':(9385,7600,220,400),
 'family-bath1700':(9460,3785,1700,700),
 'family-WC':(11022.5,5900,560,355),
 'family-basin':(9800,6195,400,220),
 'family-service-cabinet':(9385,4675,600,750)
}
ground_objects={
 'study-desk':(600,600,1600,700),'study-chair':(1000,1400,1000,900),
 'cloak-hanging':(3537.5,1337.5,1125,600),
 'guest-WC-pan':(8700,600,400,650),'guest-WC-basin':(7450,600,400,400),
 'plant-water-reserve':(9485,3900,700,700),'plant-riser':(9410,4700,550,700),
 'Q350-body':(9862.5,5550,570,725),
 'pantry-shelf-comparison':(9385,6800,600,1150),
 'rear-stack':(417.5,10800,300,750),
 'reading-sofa1900x850':(500,9300,1900,850),
 'reading-side-table300':(2450,9600,300,300),
 'family-sofa1900x750':(3650,9600,750,1900),
 'family-side-table300':(4000,9200,300,300),
 'dining-table1200x800':(5200,8800,800,1200),
 'dining-chair-west-south':(4700,8850,500,500),
 'dining-chair-west-north':(4700,9450,500,500),
 'dining-chair-east-south':(6000,8850,500,500),
 'dining-chair-east-north':(6000,9450,500,500),
 'north-sink-station':(8700,10982.5,900,600),
 'north-cooking-station':(10800,10982.5,600,600),
 'dry-prep-table':(8500,9400,1200,600),
 'cold-storage':(9700,8412.5,650,650)
}
ground_task_fields={
 'Q350-front-service':(10432.5,5550,1000,725),
 'plant-working-revised':(10662.5,2800,920,3615),
 'rear-stack-south-task':(600,10180,600,600),
 'guest-WC-front-assumed-north':(8600,1250,600,600),
 'guest-basin-front-assumed-north':(7350,1000,600,600)
}
occupied_dining_fields={
 'west-south':(4600,8800,600,600),'west-north':(4600,9400,600,600),
 'east-south':(6000,8800,600,600),'east-north':(6000,9400,600,600)
}
ground_rechecks={
 'old_guest_pan_intersection_with_new_spine':{'old_pan':[9000,600,400,650],'new_spine_faces':[9215,9385],'overlap_width':170,'new_pan':[8700,600,400,650]},
 'plant_arch_retained_packing_failure':{'old_water':[9862.5,3600,700,700],'arch_opening_x':[9650,11050],'left_right_gaps':[212.5,487.5],'circle600_can_pass_either_side':False},
 'repacked_service_geography':{'water_to_riser_y_gap':100,'riser_to_Q350_y_gap':150,'Q350_to_plant_north_face_gap':140,'old_working_strip_north_y':6500,'new_north_y':6415,'lost_working_strip_depth':85,'system_selected':False},
 'furniture_authority':'HAD two-sofa and table positions are unadopted furnishing trials, not fixed owner counts. Reallocation/reduction is an explicit design choice, not automatically a permission blocker.',
 'retained_dining_field_conflict':{'source_chair_field':[2800,8400,2000,2800],'new_wet_wall_faces_x':[2817.5,2987.5],'new_rear_west_wall_faces_y':[8767.5,8937.5],'retained_field_pass':False},
 'relocated_two_sofa_control':{'south_sofa':[600,9300,1900,850],'north_sofa':[750,10800,1900,750],'between_faces':650,'meaning':'A600 empty-circle passage is not a seated-people/legs/coffee-table action. This is a comparison, not a claimed shared-living solution.'},
 'shared_living_dining_status':'Two source-sized sofas are retained, one rotated. A new1200x800 four-place table replaces the1600x800 trial. The1200x550 coffee table is explicitly replaced by two300x300 side-table envelopes. Actual products and comfortable shared occupation remain unselected; house-ground-actions.json tests the joined route and door comparisons.',
 'four_place_dining':{'table':[5200,8800,800,1200],'chair_envelopes':'500x500 authored comparison; each600x600 occupied/pullback field is separate, not a product or universal ergonomic rule.','nominal_east_strip_beyond_fields':677.5,'six_place_source_retained':False},
 'bed2_front_wardrobe_control':{'rectangle':[2400,417.5,900,600],'left_bed_side_and_window_route':'Not found on10mm lattice. The wardrobe intrudes into the foot route; no general continuous-space impossibility is inferred.','revised':'Source-sized1500x660 wardrobe placed on solid east wall4055–4715, y600–2100.'}
}
ground_rechecks['utility_access']={'source':'900 opening in x9500 service spine at y1500 gives access through guest WC.','comparison':'Close that opening on the shifted x9300 spine. Add900 in utility north y2550, interval10250–11150, from the plant vestibule.','vestibule_y':[2635,3615],'clear_depth':980,'door_operation':'Separate door-open900x44 leaf comparison in house-ground-actions.json; no actual frame, product or coupled manipulation is selected.'}
ground_rechecks['family_sofa_arch_control']={'rejected_sofa':[3000,9600,750,1900],'reason':'The source-sized sofa against the reading-cell wall covers1300 of its1500 opening height in plan;200 remains below it. A600 approach cannot be retained in that strip.','revised_sofa':[3650,9600,750,1900],'rear_access_strip':662.5}
service_disposition={
 'old_upper_lining':[9862.5,2762.5,250,5405],
 'retained_lining_bed3_overlap':[9862.5,2762.5,250,762.5],
 'former_Bed3_ensuite_branch_and_lining':'Retire this former wet occurrence; it cannot remain through the new bed. Return actual distribution/terminal duties to IAS/services.',
 'new_local_family_service_cabinet':[9385,4675,600,750],
 'new_stacked_gross_riser':[9410,4700,550,700],
 'riser_vs_cabinet_margins':[25,25,25,25],
 'meaning':'Gross packing/location comparison, not a structural opening or proven internal free area. No300 unassigned old gap is retained as an access tunnel.',
 'family_door_comparison':'Gallery-side surface slider may park y4475–5425 on x~9140–9215; service panel and parked leaf require different operating states. Actual clear door, rail, fixings and fire/privacy duties remain unselected.',
 'wet_floor':'Rear1000 and principal900 tray geometries do not inherit an IAS raised-tray/pipe slope result. New actual outlet/stack lengths, trap datums, containment and floor layers must be rebound.'
}

def wall_rects(walls,holes=True):
    rs=[]
    for w in walls:
        x,y=w['a'];xx,yy=w['b'];h=y==yy;at=y if h else x
        lo=x if h else y;hi=xx if h else yy
        stops=sorted([q for a,b in (w['holes'] if holes else []) for q in [max(lo,a),min(hi,b)] if lo<=q<=hi])
        cuts=[lo,*stops,hi]
        for a,b in zip(cuts,cuts[1:]):
            if b<=a or holes and any(a>=aa and b<=bb for aa,bb in w['holes']):continue
            rs.append((a,at-w['t']/2,b-a,w['t']) if h else (at-w['t']/2,a,w['t'],b-a))
    return rs

obstacles=wall_rects(first)+[court,stair,void]+list(objects.values())
xs=np.arange(0,12000+STEP/2,STEP);ys=xs
X,Y=np.meshgrid(xs,ys)
def free_motion(x1,y1,x2,y2,rr=R,obs=obstacles):
    good=(np.minimum(x1,x2)>=E+rr)&(np.minimum(y1,y2)>=E+rr)&(np.maximum(x1,x2)<=12000-E-rr)&(np.maximum(y1,y2)<=12000-E-rr)
    for x,y,w,h in obs:
        dx=np.maximum(np.maximum(x-np.maximum(x1,x2),np.minimum(x1,x2)-x-w),0)
        dy=np.maximum(np.maximum(y-np.maximum(y1,y2),np.minimum(y1,y2)-y-h),0)
        good&=dx*dx+dy*dy>=rr*rr-1e-7
    return good

nodes=free_motion(X,Y,X,Y)
right=free_motion(X[:,:-1],Y[:,:-1],X[:,1:],Y[:,1:])
up=free_motion(X[:-1,:],Y[:-1,:],X[1:,:],Y[1:,:])
targets={
 'bed2-left':(720,2100),'bed2-right':(2900,2100),'bed2-window':(1800,740),
 'bed2-wardrobe':(3740,1500),
 'bed3-left-lower':(9130,2100),'bed3-right':(11270,2100),'bed3-window':(10200,740),'bed3-wardrobe':(8250,1700),
 'bed4-left':(4830,10900),'bed4-right':(6960,10500),'bed4-wardrobe':(3750,9480),'bed4-north-window':(3900,11280),
 'principal-left':(8800,10500),'principal-right':(11100,10500),'principal-wardrobe':(8500,10000),
 'rear-shower-north':(2320,10250),'rear-WC-front':(1600,11180),'rear-basin':(1200,9470),'rear-cabinet-south':(900,10480),
 'principal-shower-north':(9950,7800),'principal-WC-front':(10700,7270),'principal-basin-front':(9950,7800),
 'family-bath-entry':(9700,5900),'family-bath-front':(10500,4800),
 'family-WC-front':(10700,6070),'family-basin-front':(10000,5890),
 'family-service-front':(10300,5050),'stair-arrival':(2300,4100)
}
idx=lambda p:(int(round(p[1]/STEP)),int(round(p[0]/STEP)))
start=idx((6000,3250));assert nodes[start]
parents={start:None};q=deque([start]);pending={idx(p) for p in targets.values() if nodes[idx(p)]}
while q and pending:
    r,c=q.popleft();pending.discard((r,c));n=[]
    if c+1<len(xs) and right[r,c]:n.append((r,c+1))
    if c and right[r,c-1]:n.append((r,c-1))
    if r+1<len(ys) and up[r,c]:n.append((r+1,c))
    if r and up[r-1,c]:n.append((r-1,c))
    for p in n:
        if p not in parents:parents[p]=(r,c);q.append(p)
paths={}
def turns(path):
    if not path or len(path)<3:return path
    out=[path[0]]
    for a,b,c in zip(path,path[1:],path[2:]):
        if (b[0]-a[0])*(c[1]-b[1])!=(b[1]-a[1])*(c[0]-b[0]):out.append(b)
    out.append(path[-1]);return out
def simplify_verified(path):
    if not path:return path
    out=[path[0]];i=0
    while i<len(path)-1:
        a=path[i];chosen=None
        for j in range(len(path)-1,i,-1):
            b=path[j]
            for c in[[a[0],b[1]],[b[0],a[1]]]:
                if bool(free_motion(*a,*c))and bool(free_motion(*c,*b)):
                    chosen=(j,c,b);break
            if chosen:break
        assert chosen
        i,c,b=chosen
        if c!=out[-1]:out.append(c)
        if b!=out[-1]:out.append(b)
    return turns(out)
for name,p in targets.items():
    at=idx(p)
    if at not in parents:paths[name]=None;continue
    path=[]
    while at is not None:path.append([float(xs[at[1]]),float(ys[at[0]])]);at=parents[at]
    paths[name]=simplify_verified(turns(path[::-1]))
    for a,b in zip(paths[name],paths[name][1:]):
        assert (a[0]==b[0] or a[1]==b[1]) and bool(free_motion(*a,*b)),f'Collapsed route failed:{name}'

# Independent coupled rear wet-door comparison. A900x44 leaf opens west from
# its south hinge; handle station820,100 radius. Body follows500 west/100 south
# of handle during closure. Sampling is bounded by maximum arc speed and half
# angular step, giving a conservative continuous-motion lower clearance bound.
hinge=np.array([2902.5,10350.]);station=820.;length=900.;half=22.;handle_r=100.
angles=np.linspace(math.pi,math.pi/2,901)
body=[];leaf=[];hand=[]
for a in angles:
    v=np.array([math.cos(a),math.sin(a)]);h=hinge+station*v
    body.append(h+np.array([-500.,-100.]));hand.append(h);leaf.append(hinge+length*v)
body=np.array(body);hand=np.array(hand);leaf=np.array(leaf)
def point_rect_gap(p,r):
    x,y,w,h=r;dx=max(x-p[0],p[0]-x-w,0);dy=max(y-p[1],p[1]-y-h,0);return math.hypot(dx,dy)
def point_segment_gap(p,a,b):
    ab=b-a;t=max(0,min(1,float(np.dot(p-a,ab)/np.dot(ab,ab))));return float(np.linalg.norm(p-(a+t*ab)))
static_gaps=[min(point_rect_gap(p,r)-R for r in obstacles) for p in body]
bounds_gaps=[min(p[0]-417.5-R,2817.5-p[0]-R,p[1]-8937.5-R,11582.5-p[1]-R) for p in body]
leaf_gaps=[point_segment_gap(p,hinge,l)-R-half for p,l in zip(body,leaf)]
handle_gaps=np.linalg.norm(body-hand,axis=1)-R-handle_r
da=abs(angles[1]-angles[0]);body_error=station*da/2
relative_error=(station+length)*da/2
# Leaf/fixture collision is conservatively checked by sampling every point on
# the segment at2 mm spacing, with1 mm nearest-sample bound and rotation bound.
wet_fixed=[objects[k] for k in ['rear-shower1000','rear-WC','rear-basin','rear-cabinet','rear-west-low-box']]
leaf_fixed_min=1e9
for l in leaf[::5]:
    for t in np.linspace(0,1,451):
        p=hinge+t*(l-hinge)
        leaf_fixed_min=min(leaf_fixed_min,min(point_rect_gap(p,r)-half for r in wet_fixed))
door={
 'hinge':hinge.tolist(),'leaf_length':length,'leaf_thickness':44,'handle_station':station,'handle_radius':100,
 'body_radius':R,'reach_comparison_max':600,'actual_body_to_handle':math.sqrt(500**2+100**2),
 'angle_step_deg':.1,'min_body_static_clearance_bound':min(static_gaps)-body_error,
 'min_body_room_boundary_clearance_bound':min(bounds_gaps)-body_error,
 'min_body_leaf_clearance_bound':min(leaf_gaps)-relative_error,
 'min_body_handle_clearance':float(min(handle_gaps)),
 'min_leaf_fixed_fixture_clearance_bound':leaf_fixed_min-1-length*da*5/2,
 'body_path_illustrative_5deg':body[::50].tolist(),'state_sequence':'Enter with leaf open; walk around west tip to start; close by the retained body/handle path; use room with leaf closed; reverse path to open and leave.',
 'limits':'No arms, grasp, strength, human body orientation, actual hardware, frame contact or product approval. This is a continuous geometric witness under declared circle/capsule/reach assumptions.'}

# Original HAD wet-cell conflict is a specific failed comparison, not a claim
# no second ensuite can fit. Its accepted trial south face8292.5 is now over
# the new stair, and translating its internal north wall north blocks facade.
historical={'retained_wet_south_face':8292.5,'shifted_stair_north':8767.5,'stair_overlap_depth':475,
 'translation_to_new_south_face':645,'translated_old_north_wall_axis':11532.5,
 'translated_north_wall_faces_at170':[11447.5,11617.5],
 'outer_north_inside_face':11582.5,'overlap_into_outer_face':35,
 'meaning':'The old HAD cell cannot be retained or simply translated. The full-depth rearranged cell removes its internal north wall and moves fixtures.'}

def overlap1(a,b,c,d):return max(0,min(b,d)-max(a,c))
alignment=[]
for w in first:
    x,y=w['a'];xx,yy=w['b'];h=y==yy;lo=max(E,x if h else y);hi=min(11582.5,xx if h else yy);at=y if h else x
    matches=[g for g in ground if (g['a'][1]==g['b'][1])==h and (g['a'][1] if h else g['a'][0])==at]
    n=sum(overlap1(lo,hi,g['a'][0] if h else g['a'][1],g['b'][0] if h else g['b'][1]) for g in matches)
    alignment.append({'id':w['id'],'line_length':hi-lo,'collinear_below':n,'not_collinear':hi-lo-n})

result={'status':'Joined unadopted B candidate; task-proxy checks only, not a whole-house adoption or capacity verdict',
 'geometry_source_head':source['source']['head'],'new_policy_head':'68d0273f928681aed7222bba2927dc8a89ae5ead',
 'ground_walls':ground,'first_walls':first,'stair':stair,'void':void,'first_objects':objects,
 'ground_objects':ground_objects,'ground_task_fields':ground_task_fields,'ground_rechecks':ground_rechecks,'service_disposition':service_disposition,
 'occupied_dining_fields':occupied_dining_fields,
 'furniture_orientation':{'family-sofa1900x750':'Faces WEST;662.5 front strip toward reading arch. East side is its back, not a claimed passing route.'},
 'bedside_limitation_reference':'house-bedside.json distinguishes28 named station routes from full-length bilateral access: front head-nook minima Bed2 east192.5 and Bed3 west65 remain material limitations.',
 'opening_changes':[{'level':'GROUND','id':'grand-court-entry-south','source_interval':[4800,7200],'comparison_interval':[5100,6900],'authority':'Root-selected HOUSE comparison for floor/void support; not an adopted aperture.'},{'level':'FIRST','id':'court-north-1','source_interval':[6350,7350],'comparison_interval':[6200,7200],'authority':'Explicit150 westward comparison to clear the rear divider.'}],
 'upper_target_reachable':{k:v is not None for k,v in paths.items()},'upper_paths':paths,
 'door':door,'failed_HAD_translation':historical,'upper_to_lower_alignment':alignment,
 'material_open_items':['Finished170/245 are envelope comparisons, not selected masonry systems.',
 'Bed2 and Bed3 retain head-nook compromises. Positive lower-side stations do not prove four comfortable doubles; wider bedroom allocation or shell/court proportion comparison remains necessary if full-length bilateral access is required.',
 'Island wardrobe is a geometric furniture envelope; its tip restraint must be redesigned. Do not inherit a wall-mounted PAX approval.',
 'Principal900 shower is a new comparison, separate from rear1000; its door needs actual opening/parking and occupied sequencing.',
 'Ground furnishing retains two sofas but adopts a smaller four-place table and side tables;677.5 beside occupied chair fields is a tight comparison, not comfortable occupation acceptance.',
 'Every lower opening needs a real structural arch/pier/load path; collinearity is not adequate bearing.',
 'Riser/lining, roof reactions, all penetrations, external window tasks and full headroom remain coordinated design obligations.']}
emit('house-plan.json',json.dumps(result,indent=2)+'\n')

print(json.dumps({'upper_targets':len(result['upper_target_reachable']), 'positive':sum(result['upper_target_reachable'].values())}))
