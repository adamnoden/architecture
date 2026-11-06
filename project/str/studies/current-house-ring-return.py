"""Closed-ring grillage: no imaginary torsion fixity or flexural moment receiver at a masonry anchor."""
from pathlib import Path
import json,math,runpy,sys
D=Path(__file__).resolve().parent;factor=runpy.run_path(str(D/'structural-linear.py'))['factor']
heel=json.loads((D/'current-house-welded-heel.json').read_text());net=json.loads((D/'current-house-welded-network.json').read_text());c=net['sections']['collector'];E=200000;G=77000.;a,b,t=c['B'],c['H'],c['t']
J=4*((a-t)*(b-t))**2/(2*(a-t+b-t)/t)
anchors={tuple(r['xy']) for r in heel['ring']['stations']};H=json.loads((D.parents[1]/'had/studies/water-replan.json').read_text())['model'];results={}
def mvec(m,x):return [sum(p*q for p,q in zip(row,x)) for row in m]
upperOnly='--floor-clips' in sys.argv
localStations={}
if upperOnly:
 anchors=set()
 for name in heel['ring']['faces']:
    outer=name.startswith('outer');lo,hi=(332.5,11667.5) if outer else (3917.5,8082.5)
    d=lo if name.endswith(('south','west')) else hi;i=0 if name.endswith(('south','north')) else 1
    us=([4700,7300] if i==0 else [3800,6000,8200]) if outer else ([5925] if name=='court-north' else [6000])
    for u in us:
        assert all(abs(u-op['centre'])>=op['width']/2+275 for op in H['openings']['FIRST'] if op['wall']==name),(name,u)
    localStations[name]=[lo,*us,hi]
    anchors.update(((u,d) if i==0 else (d,u)) for u in localStations[name])
for which in ['outer','court']:
    lo,hi=(332.5,11667.5) if which=='outer' else (3917.5,8082.5)
    nodes=[];edges=[];stations=[]
    def N(p):
        if p not in nodes:nodes.append(p)
        return nodes.index(p)
    frames={}
    for way,i,u,rad in [('south',0,lo,(0,1)),('east',1,hi,(-1,0)),('north',0,hi,(0,-1)),('west',1,lo,(1,0))]:
        key=which+'-'+way;us=sorted(set([4700,7300]+(localStations[key] if upperOnly else [p['u'] for p in heel['ring']['faces'][key]['supports']])))
        coords=[(v,u) if i==0 else (u,v) for v in us]
        for p,q in zip(coords,coords[1:]):edges.append((N(p),N(q),math.dist(p,q),i))
        for v,p in zip(us,coords):
            if v in [4700,7300]:frames[N(p)]=rad
    for xx in [lo,hi]:
        for yy in [lo,hi]:frames[N((xx,yy))]=((1 if xx==lo else -1)/math.sqrt(2),(1 if yy==lo else -1)/math.sqrt(2))
    n=3*len(nodes);K=[[0.]*n for _ in range(n)];local=[];fixed={3*i for i,p in enumerate(nodes) if p in anchors}
    free=[i for i in range(n) if i not in fixed]
    unitG=[0.]*n
    for e,(i,j,L,axis) in enumerate(edges):
        # dofs: vertical force positive DOWN; thetaX,thetaY are local altitude
        # gradients along X,Y (not a mistaken common vertical-axis rotation).
        # Physical roll of X arm is slope along Y, and vice versa.
        do=[3*i,3*i+1+axis,3*j,3*j+1+axis,3*i+2-axis,3*j+2-axis]
        k=[[0.]*6 for _ in range(6)];EI=E*c['I'];values=[[12,6*L,-12,6*L],[6*L,4*L**2,-6*L,2*L**2],[-12,-6*L,12,-6*L],[6*L,2*L**2,-6*L,4*L**2]]
        for ii in range(4):
            for jj in range(4):k[ii][jj]=values[ii][jj]*EI/L**3
        kt=G*J/L;k[4][4]=k[5][5]=kt;k[4][5]=k[5][4]=-kt
        f=c['lineG'];g=[f*L/2,f*L**2/12,f*L/2,-f*L**2/12,0,0] # N/mm = kN/m
        for ii,x in enumerate(do):
            unitG[x]+=g[ii]
            for jj,y in enumerate(do):K[x][y]+=k[ii][jj]
        local.append((do,k,g))
    solve=factor([[K[i][j] for j in free] for i in free])
    # Unit cases use actual force/moment directions (a hip is NOT two full
    # ordinary heels). ± axes are conservatively independent local duties.
    cases=[('ringG',unitG,0,1.35)]
    for node,(rx,ry) in frames.items():
        down=[0.]*n;down[3*node]=1000;cases.append(('F'+str(node),down,-25,70))
        # applied bending about rafter axis makes vertical displacement across
        # rafter (perpendicular gradient); tie eccentricity induces along-slope.
        for tag,dx,dy,limit in [('torsion',-ry,rx,10),('eccentric',rx,ry,60*.09+70*.07)]:
            f=[0.]*n;f[3*node+1]=dx*1e6;f[3*node+2]=dy*1e6;cases.append((tag+str(node),f,-limit,limit))
    bounds={};influence={}
    def env(k,v,l,h):
        lo0,hi0=bounds.get(k,(0,0));bounds[k]=[lo0+min(v*l,v*h),hi0+max(v*l,v*h)]
    for label,loads,low,high in cases:
        sol=solve([loads[i] for i in free]);u=[0.]*n
        for i,dof in enumerate(free):u[dof]=sol[i]
        residual=[p-q for p,q in zip(mvec(K,u),loads)]
        assert max(abs(residual[i]) for i in free)<.002
        assert abs(sum(residual[0::3])+sum(loads[0::3]))<1e-4
        for q in fixed:env(('head',q//3),-residual[q]/1000,low,high)
        if label=='ringG':key='ringMass'
        else:
            prefix=''.join(z for z in label if not z.isdigit());node=int(label[len(prefix):]);key=prefix+':'+','.join(str(v) for v in nodes[node])
        influence[key]=[{'xy':nodes[q//3],'n':-residual[q]/1000} for q in sorted(fixed) if abs(residual[q])>.000001]
        for ei,(DO,k,selfG) in enumerate(local):
            Y=mvec(k,[u[i] for i in DO])
            if label=='ringG':Y=[y-g for y,g in zip(Y,selfG)]
            for p in [0,1]:
                env(('V',ei,p),Y[2*p]/1000,low,high);env(('M',ei,p),Y[2*p+1]/1e6,low,high);env(('T',ei,p),Y[4+p]/1e6,low,high)
    rowout=[]
    for i,(_,_,L,_) in enumerate(edges):
        M=max(abs(v) for p in (0,1) for v in bounds['M',i,p])+1.35*c['lineG']*(L/1000)**2/8
        T=max(abs(v) for p in (0,1) for v in bounds['T',i,p]);V=max(abs(v) for p in (0,1) for v in bounds['V',i,p])
        # Independent extreme bounds, including an intentionally separate 100kN
        # in-plane chord force and 10kNm yaw challenge in the weaker flexural plane.
        sigma=M*1e6/c['W']+10e6/c['Wminor']+100e3/c['A'];tau=T*1e6/(2*(a-t)*(b-t)*t)+V*1000/(2*t*(b-2*t))
        rowout.append(dict(endpoints=[nodes[edges[i][0]],nodes[edges[i][1]]],M=M,T=T,V=V,interaction=math.hypot(sigma,math.sqrt(3)*tau)/(200/1.1)))
    reactions=[{'xy':nodes[i//3],'range':bounds['head',i//3]} for i in sorted(fixed)]
    results[which]=dict(influence=influence,segments=rowout,stations=reactions,worstInteraction=max(q['interaction'] for q in rowout),minAnchor=min(q['range'][0] for q in reactions),maxAnchor=max(q['range'][1] for q in reactions))
print([(k,v['worstInteraction'],v['minAnchor'],v['maxAnchor']) for k,v in results.items()])

out={'role':'Closed steel ring, rotation-free vertical supports. Explicit force/torque and true hip axes. Half-scale hinge or full-height captive masonry is not implied.','stations':len(anchors),'upperFloorOnly':upperOnly,'rings':results}
def norm(v):
 if isinstance(v,dict):return {k:norm(z) for k,z in v.items()}
 if isinstance(v,(tuple,list)):return [norm(z) for z in v]
 return round(v,9) if isinstance(v,float) else v
target=D/('current-house-ring-floor-stations.json' if upperOnly else 'current-house-ring-fullheight-control.json')
txt=json.dumps(norm(out),indent=2)+'\n'
if '--check' in sys.argv:assert target.read_text()==txt
else:target.write_text(txt)
