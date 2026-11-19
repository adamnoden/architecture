"""Independent complete axis-route and bounded coupled-leaf geometry checks.
The600 circle/600 reach assumptions are diagnostics, not human/compliance proof.
"""
from pathlib import Path
import json,math,os
import numpy as np
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
import matplotlib
matplotlib.use('Agg')
matplotlib.rcParams['svg.fonttype']='none'
matplotlib.rcParams['svg.hashsalt']='ovid-str-house-20261030'
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Circle
d=json.loads((OUT/'house-plan.json').read_text());R=300.

def rectgap(p,r):
    x,y,w,h=r;return math.hypot(max(x-p[0],p[0]-x-w,0),max(y-p[1],p[1]-y-h,0))
def seggap(p,a,b):
    p=np.array(p);a=np.array(a);b=np.array(b);v=b-a
    t=max(0,min(1,float(np.dot(p-a,v)/np.dot(v,v))))
    return float(np.linalg.norm(p-a-t*v))
def axis_rect_gap(a,b,r):
    assert a[0]==b[0] or a[1]==b[1]
    x,y,w,h=r;dx=max(x-max(a[0],b[0]),min(a[0],b[0])-x-w,0);dy=max(y-max(a[1],b[1]),min(a[1],b[1])-y-h,0)
    return math.hypot(dx,dy)
def walls_rects(ws):
    result=[]
    for w in ws:
        x,y=w['a'];xx,yy=w['b'];hor=y==yy;lo=x if hor else y;hi=xx if hor else yy;at=y if hor else x
        pp=[lo,*sorted([q for z in w['holes'] for q in z]),hi]
        for a,b in zip(pp,pp[1:]):
            if b<=a or any(a>=p and b<=q for p,q in w['holes']):continue
            result.append((a,at-w['t']/2,b-a,w['t']) if hor else(at-w['t']/2,a,w['t'],b-a))
    return result
def check_axis(points,obs,leaf=None):
    gap=1e9
    for a,b in zip(points,points[1:]):
        gap=min(gap,min(axis_rect_gap(a,b,r)-R for r in obs))
        if leaf:
            # For these authored open/closed axis leaves, use their rectangular
            #44 thickness bound rather than infer round-corner clearance.
            h,t=leaf;rr=(min(h[0],t[0])-22,min(h[1],t[1])-22,abs(h[0]-t[0])+44,abs(h[1]-t[1])+44)
            gap=min(gap,axis_rect_gap(a,b,rr)-R)
    return {'clear':gap>=-1e-7,'minimum_clearance':gap}

rear_obs=walls_rects(d['first_walls'])+list(d['first_objects'].values())+[d['stair'],d['void'],(3832.5,3832.5,4335,4335)]
hinge=(2902.5,10350);open_tip=(2002.5,10350);closed_tip=(2902.5,11250)
rear_paths={
 'entry_open':[[3300,10800],[2600,10800],[1600,10800],[1582.5,10800],[1582.5,10250]],
 'WC_closed':[[2402.5,11070],[1600,11070],[1600,11180]],
 'basin_closed':[[2402.5,11070],[1600,11070],[1600,10500],[1500,10500],[1500,9470],[1200,9470]],
 'shower_closed':[[2402.5,11070],[2402.5,10250],[2320,10250]],
 'cabinet_closed':[[2402.5,11070],[1600,11070],[1600,10500],[1500,10500],[1500,10480],[900,10480]]
}
rear={k:check_axis(p,rear_obs,(hinge,open_tip if k=='entry_open' else closed_tip)) for k,p in rear_paths.items()}

# Proposed guest WC door reverses the source outward swing. Its900x44 leaf is
# hinged at7650/2650 and opens south; body follows handle450 south during closure.
ground_obs=walls_rects(d['ground_walls'])+list(d['ground_objects'].values())+[d['stair'],(3832.5,3832.5,4335,4335)]
gh=np.array([7650.,2650.]);aa=np.linspace(-math.pi/2,0,901);station=820.;length=900.
hand=np.array([gh+station*np.array([math.cos(a),math.sin(a)]) for a in aa]);body=hand+np.array([0.,-450.])
tip=np.array([gh+length*np.array([math.cos(a),math.sin(a)]) for a in aa])
da=aa[1]-aa[0]
mins=[min(rectgap(p,r)-R for r in ground_obs) for p in body]
leafmins=[seggap(p,gh,t)-R-22 for p,t in zip(body,tip)]
boundmins=[min(p[0]-7285-R,9215-p[0]-R,p[1]-417.5-R,2565-p[1]-R) for p in body]
guest_coupled={'body_static_clearance_bound':min(mins)-station*da/2,'body_leaf_clearance_bound':min(leafmins)-(station+length)*da/2,
 'room_clearance_bound':min(boundmins)-station*da/2,'handle_reach':450.,'body_handle_clearance':50.,'body_arc_5deg':body[::50].tolist(),
 'hinge':gh.tolist(),'open_tip':tip[0].tolist(),'closed_tip':tip[-1].tolist()}
gpaths={
 'entry_open':[[8100,3250],[8100,1380],[7650,1380]],
 'pan_closed':[[8470,2200],[8900,2200],[8900,1560]],
 'basin_closed':[[8470,2200],[8100,2200],[8100,1320],[7650,1320]]}
guest={k:check_axis(p,ground_obs,(gh.tolist(),tip[0].tolist() if k=='entry_open' else tip[-1].tolist())) for k,p in gpaths.items()}

result={'basis':'Joined unadopted B in house-plan.json; all mm',
 'rear_paths':rear_paths,'rear_results':rear,'rear_coupled_bounds':{k:v for k,v in d['door'].items() if k!='body_path_illustrative_5deg'},
 'guest_paths':gpaths,'guest_results':guest,'guest_coupled':guest_coupled,
 'limits':['Circle/capsule and600 reach comparisons omit hands, effort, actual body shape, products, frame/stop contact and human safety assessment.',
 'Both doors are explicit candidate handing changes. Routine use requires the stated door state; no simultaneous incompatible state is claimed.',
 'Rear routine stack access is from its south end; remote WC connection requires actual east-face access/pan removal. The geometry does not prove all fitting/withdrawal duties.',
 'Principal ensuite positive open-door room paths do not yet establish its own complete leaf/slider sequence.']}
emit('house-wet-actions.json',json.dumps(result,indent=2)+'\n')
fig,axs=plt.subplots(1,2,figsize=(12,7))
for ax,kind in zip(axs,['rear','guest']):
    if kind=='rear':
        bounds=(417.5,8937.5,2400,2645);objs={k:r for k,r in d['first_objects'].items() if k.startswith('rear-')};hs=hinge;ot=open_tip;ct=closed_tip
        arc=np.array(d['door']['body_path_illustrative_5deg']);pp=rear_paths
    else:
        bounds=(7285,417.5,1930,2147.5);objs={k:r for k,r in d['ground_objects'].items() if k.startswith('guest-')};hs=gh;ot=tip[0];ct=tip[-1];arc=body[::50];pp=gpaths
    ax.add_patch(Rectangle(bounds[:2],bounds[2],bounds[3],fc='#f7f2e8',ec='#555'))
    for k,r in objs.items():
        ax.add_patch(Rectangle(r[:2],r[2],r[3],fc='#c3d5d7',ec='#5d777b',lw=.7))
        ax.text(r[0]+r[2]/2,r[1]+r[3]/2,k.replace('rear-','').replace('guest-WC-','').replace('guest-',''),ha='center',va='center',fontsize=7)
    ax.plot([hs[0],ot[0]],[hs[1],ot[1]],color='#ad6a43',lw=3,label='Open leaf')
    ax.plot([hs[0],ct[0]],[hs[1],ct[1]],color='#ad6a43',lw=1,ls='--',label='Closed leaf')
    ax.plot(arc[:,0],arc[:,1],color='#a23d44',lw=2,label='Coupled closing body path')
    for name,ppp in pp.items():
        ar=np.array(ppp);ax.plot(ar[:,0],ar[:,1],lw=1,label=name.replace('_',' '))
    ax.add_patch(Circle(arc[0],R,fc='none',ec='#a23d44',ls='--',lw=.8))
    ax.set_xlim(bounds[0]-100,bounds[0]+bounds[2]+650);ax.set_ylim(bounds[1]-100,bounds[1]+bounds[3]+450)
    ax.set_aspect('equal');ax.set_xlabel('x / mm');ax.set_ylabel('y / mm; north up')
    ax.set_title('Rear1000 shower / new northwest stack' if kind=='rear' else 'Guest WC / explicit inward door',fontsize=11)
    ax.legend(fontsize=7,ncol=2,loc='upper left',bbox_to_anchor=(0,-.12))
fig.suptitle('Complete route sequences under declared geometric proxies\nOpen entry → coupled close → closed-door tasks → reverse to leave; no product/human approval',fontsize=13)
fig.subplots_adjust(bottom=.22,wspace=.25,top=.88)
preview(fig,'house-wet-actions.png');emit_svg(fig,'house-wet-actions.svg')
print(json.dumps({'rear':rear,'guest':guest,'guest_coupled':{k:v for k,v in guest_coupled.items() if k!='body_arc_5deg'}},indent=2))
