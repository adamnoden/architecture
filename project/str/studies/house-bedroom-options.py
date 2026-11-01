"""Source-bound compact-bedroom versus aligned front-allocation comparison.
No geometry adoption, occupancy brief, member capacity or human-use approval.
--check compares deterministic JSON/SVG; --preview writes disposable PNG.
"""
from pathlib import Path
from collections import deque
import copy, hashlib, io, json, math, os, sys, tempfile
os.environ.setdefault('MPLCONFIGDIR', '/tmp/str-bedroom-mpl')
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Polygon
OUT=Path(__file__).resolve().parent
NAMES=['house-plan.json','house-bedside.json','house-supports.json','house-quantities.json','house-source.json']
raw={n:(OUT/n).read_bytes() for n in NAMES}
b=json.loads(raw['house-plan.json'])
# This comparison consumes frozen2D B inputs. The original full-family guard
# remains unchanged: its section/roof rendering source was revised by1192.
source=json.loads(raw['house-source.json']);repo=OUT.parents[2]
current_source_blobs={}
for path,expected in source['source']['files'].items():
 payload=(repo/path).read_bytes();actual=hashlib.sha1(b'blob '+str(len(payload)).encode()+b'\0'+payload).hexdigest()
 if path=='compiler/reference-house/georgian/layout-family.ts':
  # Diff reviewed: section/context projection and shared roof adaptor;
  # no plan/source dimensions change. This is not a roof/section revalidation.
  expected='61c2e9c744e05e98838ae01738852d7508282731'
 assert actual==expected,('Source changed; re-evaluate bedroom comparison',path,actual)
 current_source_blobs[path]=actual
E=417.5; R=300.; STEP=10.

def wall_rects(walls):
 out=[]
 for w in walls:
  x,y=w['a'];xx,yy=w['b'];hor=y==yy;lo=x if hor else y;hi=xx if hor else yy;at=y if hor else x
  cuts=sorted({lo,hi,*[v for ab in w['holes'] for v in ab if lo<v<hi]})
  for a,z in zip(cuts,cuts[1:]):
   if z<=a or any(a>=i and z<=j for i,j in w['holes']):continue
   out.append((w['id'],[a,at-w['t']/2,z-a,w['t']] if hor else [at-w['t']/2,a,w['t'],z-a]))
 return out

def clearance(p, rect):
 x,y,w,h=rect; px,py=p
 return math.hypot(max(x-px,px-x-w,0),max(y-py,py-y-h,0))

def segment_clear(a,z,obs,r=320.):
 # Exact for axis-aligned retained segments: distance between their rectangle and each obstacle.
 assert a[0]==z[0] or a[1]==z[1]
 if min(*a,*z)<E+r or max(*a,*z)>12000-E-r:return False
 for _,(x,y,w,h) in obs:
  dx=max(x-max(a[0],z[0]),min(a[0],z[0])-x-w,0)
  dy=max(y-max(a[1],z[1]),min(a[1],z[1])-y-h,0)
  if dx*dx+dy*dy<r*r-1e-7:return False
 return True

def route(start, target, obs):
 R=320. #300body plus20radial routing reserve; the coupled curve remains300.
 # Full axis-segment predicates, not just free endpoints.
 xs=np.arange(700.,11310.,STEP);ys=np.arange(700.,3831.,STEP)
 X,Y=np.meshgrid(xs,ys)
 def good(x1,y1,x2,y2):
  ok=(np.minimum(x1,x2)>=E+R)&(np.minimum(y1,y2)>=E+R)&(np.maximum(x1,x2)<=12000-E-R)&(np.maximum(y1,y2)<=12000-E-R)
  for _,(x,y,w,h) in obs:
   dx=np.maximum(np.maximum(x-np.maximum(x1,x2),np.minimum(x1,x2)-x-w),0)
   dy=np.maximum(np.maximum(y-np.maximum(y1,y2),np.minimum(y1,y2)-y-h),0)
   ok &= dx*dx+dy*dy>=R*R-1e-7
  return ok
 nodes=good(X,Y,X,Y);right=good(X[:,:-1],Y[:,:-1],X[:,1:],Y[:,1:]);up=good(X[:-1,:],Y[:-1,:],X[1:,:],Y[1:,:])
 def connect(p):
  candidates=[]
  for r in range(max(0,int((p[1]-700)/STEP)-3),min(len(ys),int((p[1]-700)/STEP)+5)):
   for c in range(max(0,int((p[0]-700)/STEP)-3),min(len(xs),int((p[0]-700)/STEP)+5)):
    if not nodes[r,c]:continue
    q=[float(xs[c]),float(ys[r])]
    for mid in [[p[0],q[1]],[q[0],p[1]]]:
     if segment_clear(p,mid,obs) and segment_clear(mid,q,obs):candidates.append((math.dist(p,q),(r,c),[p,mid,q]));break
  assert candidates,('invalid route endpoint',p)
  return min(candidates,key=lambda v:v[0])[1:]
 a,ap=connect(start);z,zp=connect(target);prev={a:None};q=deque([a])
 while q and z not in prev:
  r,c=q.popleft();ns=[]
  if c+1<len(xs) and right[r,c]:ns.append((r,c+1))
  if c and right[r,c-1]:ns.append((r,c-1))
  if r+1<len(ys) and up[r,c]:ns.append((r+1,c))
  if r and up[r-1,c]:ns.append((r-1,c))
  for n in ns:
   if n not in prev:prev[n]=(r,c);q.append(n)
 assert z in prev,('route not found',start,target)
 chain=[];n=z
 while n is not None:chain.append([float(xs[n[1]]),float(ys[n[0]])]);n=prev[n]
 path=ap+list(reversed(chain))+list(reversed(zp))
 simple=[]
 for p in path:
  if simple and p==simple[-1]:continue
  if len(simple)>=2 and (simple[-2][0]==simple[-1][0]==p[0] or simple[-2][1]==simple[-1][1]==p[1]):simple[-1]=p
  else:simple.append(p)
 assert all(segment_clear(a,z,obs) for a,z in zip(simple,simple[1:]))
 return simple

compact=copy.deepcopy(b)
compact['first_objects']['bed2']=[1125,1062.5,900,2000]
compact['first_objects']['bed2-head']=[1125,3062.5,900,100]
compact['first_objects']['bed2-wardrobe']=[4055,1017.5,660,900]
compact['first_objects']['bed3']=[10033.75,1525,900,2000]
compact['first_objects']['bed3-head']=[10033.75,3525,900,90]
compact['first_objects']['bed3-wardrobe']=[7285,1017.5,660,1500]

# Explicit C: aligned front walls north 475, not a shell change.
c=copy.deepcopy(b)
for lev,ids in [('first_walls',['bed2-east','bed2-north-main','bed2-L-return','bed3-west','bed3-north-main','wet-spine']),('ground_walls',['cloak-east','cloak-west','study-cloak-north','study-L-return','wc-west','wc-north'])]:
 for w in c[lev]:
  if w['id'] not in ids:continue
  w['a']=[v+475 if i==1 and v==2650 else v for i,v in enumerate(w['a'])]
  w['b']=[v+475 if i==1 and v==2650 else v for i,v in enumerate(w['b'])]
c['first_objects']['bed2']=[1040,1040,1500,2000]
c['first_objects'].pop('bed2-head')
c['first_objects']['bed3']=[8300,1040,1500,2000]
c['first_objects'].pop('bed3-head')
# C removes/repositions wardrobes to test a best-case bed envelope; no retained wardrobe pass.
c['first_objects'].pop('bed2-wardrobe');c['first_objects'].pop('bed3-wardrobe')

obs=wall_rects(compact['first_walls'])+[('court',[3832.5,3832.5,4335,4335]),('stair',b['stair']),('void',b['void'])]+list(compact['first_objects'].items())

# Conservative rotating capsule for the44mm leaf. Own host/frame contact is intentional.
def point_segment(p,a,z):
 v=np.array(z)-a;u=np.array(p)-a;t=max(0,min(1,float(np.dot(u,v)/np.dot(v,v))))
 return float(np.linalg.norm(np.array(p)-(np.array(a)+t*v)))
def segseg(a,z,p,q):
 def cross(u,v):return u[0]*v[1]-u[1]*v[0]
 v=np.array(z)-a;w=np.array(q)-p;d=cross(v,w)
 if abs(d)>1e-9:
  t=cross(np.array(p)-a,w)/d;u=cross(np.array(p)-a,v)/d
  if 0<=t<=1 and 0<=u<=1:return 0.
 return min(point_segment(a,p,q),point_segment(z,p,q),point_segment(p,a,z),point_segment(q,a,z))
def segrect(a,z,rect):
 x,y,w,h=rect
 if x<=a[0]<=x+w and y<=a[1]<=y+h:return 0.
 if x<=z[0]<=x+w and y<=z[1]<=y+h:return 0.
 ps=[[x,y],[x+w,y],[x+w,y+h],[x,y+h]]
 return min(segseg(a,z,p,q) for p,q in zip(ps,ps[1:]+ps[:1]))

doors={}
for room,hinge,sgn,vec in [('bed2',[3450.,2650.],-1,[600.,-375.]),('bed3',[9150.,2650.],1,[-350.,-400.])]:
 sign=1 if room=='bed2' else -1
 host=room+'-north-main';dt=math.pi/3600
 samples=[];bodymargin=leafmargin=float('inf');reach=[]
 total=2200 if room=='bed2' else 1800
 for k in range(total+1):
  t=sgn*k*dt;co,si=math.cos(t),math.sin(t)
  rot=lambda v:[hinge[0]+co*v[0]-si*v[1],hinge[1]+si*v[0]+co*v[1]]
  moving_vec=[450+150*k/total,-375] if room=='bed2' else vec
  body=rot(moving_vec);tip=rot([sign*900,0]);handle=rot([sign*820,-100])
  bm=min([clearance(body,r)-300 for _,r in obs]+[body[0]-E-300,12000-E-body[0]-300,body[1]-E-300])
  lm=min(segrect(hinge,tip,r)-22 for name,r in obs if name!=host)
  # Leaf/body distance is rotationally invariant; handle is a point100mm inside the leaf face, not a hardware envelope.
  bm=min(bm,point_segment(body,hinge,tip)-322)
  
  if bm<bodymargin:
   worst=(k,body,sorted([(clearance(body,r)-300,name) for name,r in obs])[:2])
  bodymargin=min(bodymargin,bm);leafmargin=min(leafmargin,lm)
  reach.append(math.dist(body,handle))
  if k%100==0:samples.append({'angle':k*.05,'body':body,'tip':tip})
 # Every point moves no faster than its hinge radius; half-step gives continuous clearance lower bound.
 body_speed=math.hypot(*vec)+(150/(total*dt) if room=='bed2' else 0)
 bodybound=bodymargin-body_speed*dt/2
 leafbound=leafmargin-900*dt/2
 assert bodybound>0,(room,'body',bodybound,worst)
 assert leafbound>0,(room,'leaf',leafbound)
 assert max(reach)<600
 closed=samples[0]['body'];opened=samples[-1]['body']
 # At cardinal angles leaf capsule fits conservative22mm axis box.
 oprect=[hinge[0]-22,1750,44,900]
 tip=samples[-1]['tip'];leafrects=[]
 for j in range(30):
  a=[hinge[i]+(tip[i]-hinge[i])*j/30 for i in [0,1]];z=[hinge[i]+(tip[i]-hinge[i])*(j+1)/30 for i in [0,1]]
  leafrects.append((room+'-open-leaf',[min(a[0],z[0])-22,min(a[1],z[1])-22,abs(a[0]-z[0])+44,abs(a[1]-z[1])+44]))
 clrect=[min(hinge[0],hinge[0]+sign*900),2628,900,44]
 openobs=obs+leafrects
 closedobs=obs+[(room+'-closed-leaf',clrect)]
 x,y,w,h=compact['first_objects'][room]
 targets={'left-lower':[x-325,y+500],'left-head':[x-325,y+1700],'right-lower':[x+w+325,y+500],'right-head':[x+w+325,y+1700],'foot':[x+w/2,y-325]}
 targets['wardrobe']=[3725,1500] if room=='bed2' else [8275,1700]
 targets['window-front']=[3850,740] if room=='bed2' else [10200,740]
 paths={'hall_to_open_body':route([3500,3500] if room=='bed2' else [8700,3500],opened,openobs)}
 for name,target in targets.items():paths['closed_'+name]=route(closed,target,closedobs)
 doors[room]={'hinge':hinge,'rotation_degrees':sgn*total*.05,'leaf_length':900,'capsule_radius':22,'body_radius':300,'body_hinge_vector_closed':[450,-375] if room=='bed2' else vec,'body_vector_rule':'Bed2 first coordinate increases linearly450 to600 over110degrees; Bed3 vector constant','handle_vector_closed':[sign*820,-100],'handle_reach':max(reach),'minimum_body_to_handle_point':min(reach),'body_continuous_clearance_lower_bound':bodybound,'leaf_fixed_clearance_lower_bound':leafbound,'angle_step_degrees':.05,'samples':samples,'paths':paths,'sequence':'Enter with leaf open; reach body witness; follow reversible coupled curve to closed state; reach closed-room side/head/foot and wardrobe stations; reverse to reopen and exit.'}

# Full-length side-strip bounds under all finite wall/furniture transitions.
sides={}
for room in ['bed2','bed3']:
 x,y,w,h=compact['first_objects'][room];cuts=sorted({y,y+h,*[v for name,r in obs if name!=room for v in [r[1],r[1]+r[3]] if y<v<y+h]})
 rows=[]
 for a,z in zip(cuts,cuts[1:]):
  mid=(a+z)/2;left=E;right=12000-E
  for name,(xx,yy,ww,hh) in obs:
   if name==room or not yy<mid<yy+hh:continue
   if xx+ww<=x:left=max(left,xx+ww)
   elif xx>=x+w:right=min(right,xx)
   else:raise AssertionError(('bed overlap',room,name))
  rows.append({'y':[a,z],'left':x-left,'right':right-x-w})
 sides[room]={'bed':compact['first_objects'][room],'sections':rows,'minimum_left':min(r['left'] for r in rows),'minimum_right':min(r['right'] for r in rows)}
 assert sides[room]['minimum_left']>=600 and sides[room]['minimum_right']>=600

# C paired support line creates an exact plant-entry collision, not just a route-search failure.
cross=[9215,3040,85,170] # north WC wall end at service-spine aperture
assert 2750<3040 and 3210<3650
def whole_wall(w,t=None):
 x,y=w['a'];xx,yy=w['b'];t=w['t'] if t is None else t
 return [x,y-t/2,xx-x,t] if y==yy else [x-t/2,y,t,yy-y]
def union_difference(inc,exc):
 rs=inc+exc;xs=sorted({v for r in rs for v in [r[0],r[0]+r[2]]});ys=sorted({v for r in rs for v in [r[1],r[1]+r[3]]})
 inside=lambda r,x,y:r[0]<x<r[0]+r[2] and r[1]<y<r[1]+r[3]
 return sum((z-a)*(h-y) for a,z in zip(xs,xs[1:]) for y,h in zip(ys,ys[1:]) if any(inside(r,(a+z)/2,(y+h)/2) for r in inc) and not any(inside(r,(a+z)/2,(y+h)/2) for r in exc))/1e6
env=[[0,0,12000,E],[0,12000-E,12000,E],[0,0,E,12000],[12000-E,0,E,12000],[3832.5,3832.5,4335,4335]]
quantities={}
for name,data in [('B_compact',compact),('C_front_shift',c)]:
 quantities[name]={}
 for level in ['ground','first']:
  ws=data[level+'_walls'];remaining=union_difference([[0,0,12000,12000]],env+[whole_wall(w) for w in ws]);core=union_difference([whole_wall(w,w['t']-30) for w in ws],env)
  quantities[name][level]={'remaining_before_stair_void_m2':remaining,'gross_core_footprint_m2':core,'gross_core_volume_at3100_m3':core*3.1}
assert quantities['B_compact']['ground']['remaining_before_stair_void_m2']==97.990875
assert quantities['C_front_shift']['ground']['remaining_before_stair_void_m2']==97.829375
assert quantities['B_compact']['first']==quantities['C_front_shift']['first']
# Actual paired finite collision, not an inference from a missing lattice path.
new_wc=next(w for w in c['ground_walls'] if w['id']=='wc-north')
assert whole_wall(new_wc)==[7200,3040,2100,170]
assert [min(9300,9385)-max(7200,9215),3210-3040]==[85,170]
assert 4055-(3450+22)==583<600
result={'status':'Unadopted comparison; HOUSE remains open. Compact front rooms are a conditional4-bedroom programme, not4double bedrooms.','current_source_blobs':current_source_blobs,'source_applicability':'Nine original controlling blobs unchanged; layout-family61c2e9c7 reviewed for2D plan use only. Original full-family guard remains stale; no roof/section refresh.','planning_quantities':quantities,'source_sha256':{n:hashlib.sha256(v).hexdigest() for n,v in raw.items()},'basis_head':'7c0e2c50','unchanged':['12x12shell','3500court','all B wall/support/opening coordinates in compact option','stair','void','riser/cabinet','rear double beds'],'compact_changes':{k:compact['first_objects'][k] for k in ['bed2','bed2-head','bed2-wardrobe','bed3','bed3-head','bed3-wardrobe']},'compact_full_length_sides':sides,'routing_body_radius':300,'routing_radius_including_reserve':320,'wardrobe_frontage_comparison':{'B2_original':1500,'B2_compact':900,'reduction_percent':40,'B3_retained':1500,'south_setback_both':600},'front_door_operations':doors,'bed2_rejected90degree_throat':{'between_leaf_capsule_and_wardrobe':583,'circle_diameter':600,'negative_width_margin':-17},'front_reallocation_C':{'north_shift':475,'new_main_wall_axis':3125,'main_finished_depth':2622.5,'south_gallery_clear':622.5,'double_task_envelope':[2700,2600],'nominal_remaining_depth':22.5,'lower_mirroring_required':True,'plant_entry_original_interval':[2750,3650],'new_ground_WC_wall_faces':[3040,3210],'plant_entry_divided_clear_intervals':[290,440],'plant_entry_collision_rectangle':cross,'wardrobes_retained':False,'verdict':'Reject as a complete substitution: aligned ground wall bisects plant entry; moving upper only introduces475 sideways transfer; double-box fit removes wardrobes and leaves22.5 depth and circulation margins.'},'claim_limits':['600 circle/600reach and900single/1500double beds are authored comparisons; household programme and comfort brief unconfirmed.','Rotating leaf uses conservative44capsule; intended own host/frame contact excluded. Handles are reach points, not limbs/strength/hardware.','Side/head/foot strips and closed-room routes are geometric witnesses; no wardrobe door opening, bed-making, furniture delivery, assistance or statutory compliance proof.','No roof/floor/member/arch/foundation capacity is selected. Existing joined support/section enquiries still require actual compatible junctions.']}

# One paired whole-house sheet and focused C inset: all geometry read from source records.
plt.rcParams.update({'font.family':'DejaVu Sans','svg.hashsalt':'house-bedroom-options','font.size':8})
fig=plt.figure(figsize=(16.54,11.69),facecolor='white')
gs=fig.add_gridspec(2,3,width_ratios=[1,1,.86],height_ratios=[1,.42],left=.035,right=.975,top=.88,bottom=.065,wspace=.19,hspace=.26)
col={'wall':'#537e80','object':'#dce6da','red':'#aa3e38','blue':'#305a78','amber':'#b96a2e'}
def draw(ax,data,level,title,front=False):
 ax.set_aspect('equal');ax.set_title(title,loc='left',fontweight='bold',fontsize=11,pad=10)
 for r in [(0,0,12000,E),(0,12000-E,12000,E),(0,E,E,12000-2*E),(12000-E,E,E,12000-2*E),(3832.5,3832.5,4335,4335)]:ax.add_patch(Rectangle(r[:2],*r[2:],facecolor='#ddd8cc',edgecolor='#a79b85',lw=.6))
 ax.add_patch(Rectangle((4250,4250),3500,3500,facecolor='white',edgecolor='#a79b85',lw=.6))
 source=json.loads(raw['house-source.json'])
 changes={o['id']:o for o in data['opening_changes'] if o['level']==('FIRST' if level=='first' else 'GROUND')}
 for o in source['sourceInventory']['openings']['FIRST' if level=='first' else 'GROUND']:
  wall=o['wall']
  if not wall.startswith(('outer-','court-')):continue
  lo,hi=changes[o['id']]['comparison_interval'] if o['id'] in changes else (o['centre']-o['width']/2,o['centre']+o['width']/2)
  if wall=='outer-south':r=[lo,0,hi-lo,E]
  elif wall=='outer-north':r=[lo,12000-E,hi-lo,E]
  elif wall=='outer-west':r=[0,lo,E,hi-lo]
  elif wall=='outer-east':r=[12000-E,lo,E,hi-lo]
  elif wall=='court-south':r=[lo,3832.5,hi-lo,E]
  elif wall=='court-north':r=[lo,7750,hi-lo,E]
  elif wall=='court-west':r=[3832.5,lo,E,hi-lo]
  else:r=[7750,lo,E,hi-lo]
  ax.add_patch(Rectangle(r[:2],*r[2:],facecolor='white',edgecolor='#7a99a8',lw=.5))
 for name,r in wall_rects(data[level+'_walls']):ax.add_patch(Rectangle(r[:2],*r[2:],facecolor=col['wall'],edgecolor='none'))
 objs=data['first_objects' if level=='first' else 'ground_objects']
 for name,r in objs.items():ax.add_patch(Rectangle(r[:2],*r[2:],facecolor='#dce9ef' if any(s in name for s in ['WC','bath','basin','shower','cabinet','water','riser']) else col['object'],edgecolor='#80948d',lw=.45))
 for name in ['stair','void'] if level=='first' else ['stair']:
  r=data[name];ax.add_patch(Rectangle(r[:2],*r[2:],facecolor='#edf3f6',edgecolor='#7a99a8',lw=.6))
 if level=='first' and data is compact:
  for room,dd in doors.items():
   h=dd['hinge'];sgn=1 if room=='bed2' else -1
   tip=dd['samples'][-1]['tip'];ax.plot([h[0],tip[0]],[h[1],tip[1]],color=col['amber'],lw=1)
   ax.plot([s['body'][0] for s in dd['samples']],[s['body'][1] for s in dd['samples']],color=col['amber'],lw=.8)
   for path in dd['paths'].values():ax.plot(*zip(*path),color=col['blue'],lw=.45,alpha=.65)
   x,y,w,h=objs[room];ax.add_patch(Rectangle((x-600,y),w+1200,h,fill=False,edgecolor=col['blue'],linestyle='--',lw=.7))
 for x,y,s in [(1800,2050,'STUDY' if level=='ground' else ('DOUBLE 2' if data is c else 'SINGLE 2')),(10500,2400,'UTILITY' if level=='ground' else ('DOUBLE 3' if data is c else 'SINGLE 3')),(5550,10700,'FAMILY / DINING' if level=='ground' else 'DOUBLE4'),(10100,10800,'KITCHEN' if level=='ground' else 'PRINCIPAL'),(6000,6000,'COURT'),(10400,5300,'PLANT' if level=='ground' else 'FAMILY BATH')]:ax.text(x,y,s,ha='center',va='center',fontsize=7,color='#203746',bbox=dict(facecolor='white',edgecolor='none',alpha=.75,pad=1),clip_on=True)
 ax.set_xlim(-100,12100);ax.set_ylim(-100,12100);ax.set_xticks([0,6000,12000]);ax.set_yticks([0,6000,12000]);ax.tick_params(labelsize=6);ax.grid(alpha=.12);ax.set_xlabel('mm; source southwest origin',fontsize=7)
 if front:ax.set_xlim(7000,11700);ax.set_ylim(2100,3900)

draw(fig.add_subplot(gs[0,0]),compact,'ground','GROUND | B support and room lines retained')
draw(fig.add_subplot(gs[0,1]),compact,'first','UPPER | compact front rooms; rear doubles retained')
a=fig.add_subplot(gs[0,2]);a.axis('off')
a.text(0,1,'A choice about occupation',fontsize=13,fontweight='bold',va='top',color='#203746')
notes=[('B all-double','192.5 /65mm head-side minima remain.\n28 reachable stations do not prove full sides.'),('B compact front rooms','900 ×2000 beds; west wardrobe 1500 →900.\nBoth wardrobes stand 600 off the south face.\nWest door opens 110°; route radius 320.\nBed2:707.5 /707.5; Bed3:648.75 /648.75.\n600 circle;20 radial route reserve.\nSides, foot, wardrobe and window-front paths.'),('C aligned front expansion','Move main wall north 475 on BOTH floors.\n2622.5 front depth; 622.5 south-gallery width.\nHeadboard-free double box: 22.5 margin.\nGround WC wall bisects the plant entry.\nRemoving wardrobes is not a programme pass.'),('Decision','Prefer compact B for continued 12 ×12 study,\nconditional on the actual occupancy brief.\nReject C as an unchanged-layout substitution.\nNo wall/source adoption or HOUSE completion.')]
y=.9
for title,body in notes:
 a.text(0,y,title,fontsize=10,fontweight='bold',va='top',color=col['amber']);a.text(0,y-.045,body,fontsize=8.4,va='top',linespacing=1.4,color='#203746');y-=.22

ax=fig.add_subplot(gs[1,0]);draw(ax,c,'ground','C ground | exact plant-entry interruption',True)
ax.add_patch(Rectangle(cross[:2],*cross[2:],facecolor=col['red'],alpha=.8));ax.annotate('new WC wall through 900 entry',xy=(9300,3125),xytext=(7600,3700),arrowprops=dict(arrowstyle='->',color=col['red']),color=col['red'],fontsize=7)
ax=fig.add_subplot(gs[1,1]);draw(ax,c,'first','C upper | double box; wardrobes omitted')
ax.set_xlim(0,5000);ax.set_ylim(200,3500)
ax.add_patch(Rectangle((440,440),2700,2600,fill=False,edgecolor=col['amber'],linestyle='--',lw=.8))
ax.set_xticks([0,2500,5000]);ax.set_yticks([500,2000,3500])
ax=fig.add_subplot(gs[1,2]);ax.axis('off')
ax.text(0,1,'Admission limits',fontsize=11,fontweight='bold',va='top')
ax.text(0,.84,'Compact B retains all structural support coordinates.\nC changes two front support lines and floor fields.\n600 is an authored comparator, not a regulation.\nDoor curves: 44 capsule; own frame contact excepted.\nNo strength, handling, wardrobe-action or comfort proof.\nNo new occupancy requirement, material or product selected.\nReference design; not released for construction.',va='top',fontsize=9,linespacing=1.7)
fig.text(.035,.96,'Four bedrooms without silently requiring four doubles',fontsize=23,fontweight='bold',color='#203746')
fig.text(.035,.92,'STR-HOUSE | source-bound B compact and C aligned front-allocation comparison | unadopted; no structural adequacy claim',fontsize=11,color='#586b75')
fig.text(.035,.02,'Inputs '+ ' | '.join(n+':'+hashlib.sha256(v).hexdigest()[:10] for n,v in raw.items()),fontsize=7,color='#586b75')
buffer=io.StringIO();fig.savefig(buffer,format='svg',metadata={'Date':'2026-11-01'});svg='\n'.join(line.rstrip() for line in buffer.getvalue().splitlines())+'\n'
def emit(name,value):
 p=OUT/name
 if '--check' in sys.argv:
  assert p.read_text()==value,'STALE '+str(p)
 else:p.write_text(value)
emit('house-bedroom-options.json',json.dumps(result,indent=2)+'\n')
emit('house-bedroom-options.svg',svg)
if '--preview' in sys.argv:fig.savefig('/tmp/house-bedroom-options.png',dpi=160)
print(json.dumps({'sides':{k:{n:v[n] for n in ['minimum_left','minimum_right']} for k,v in sides.items()},'door_bounds':{k:{n:v[n] for n in ['body_continuous_clearance_lower_bound','leaf_fixed_clearance_lower_bound','handle_reach']} for k,v in doors.items()},'paths':sum(len(v['paths']) for v in doors.values())},indent=2))
