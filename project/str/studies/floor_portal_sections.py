"""Bounded C30/B500 rectangular-section biaxial comparison.

N>0 compression; (Qy,Qz) are first moments of compressive axial stress, not
physical My/Mz. Source method: current-house-ground-ties.py; EC2 2014 JRC
worked examples (EUR26566), concrete rectangular block eta1/lambda0.8,
epsilon_cu0.0035, fcd=.85*30/1.5. The retained0.92 steel factor reserves the
same margin as the source L-section comparison. This is section strength,
not bond, buckling, shear, torsion, joint confinement or construction approval.
"""
from functools import lru_cache
import math,json
import numpy as np

FCD=.85*30/1.5
FYD=.92*500/1.15
ES=200000.


def rectangle_block(width,height,theta,depth):
    """Exact area and first moments of a clipped rectangular stress block.

    Inclusion/exclusion of the four corner triangles is vectorised. No fibre
    grid can accidentally add concrete outside the actual section.
    """
    dx,dy=np.cos(theta),np.sin(theta);a,b=abs(dx),abs(dy);d=.8*np.asarray(depth)
    area=np.zeros_like(d);sx=np.zeros_like(d);sy=np.zeros_like(d)
    both=(a>1e-8)&(b>1e-8)
    for x,y,sign in ((0.,0.,1),(width,0.,-1),(0.,height,-1),(width,height,1)):
        t=np.maximum(d-a*x-b*y,0.);den=np.where(both,2*a*b,1.)
        v=t*t/den;area+=sign*v
        sx+=sign*(np.where(both,t*t*t/(6*np.where(both,a*a*b,1.)),0.)+x*v)
        sy+=sign*(np.where(both,t*t*t/(6*np.where(both,a*b*b,1.)),0.)+y*v)
    ix=a<=1e-8
    y=np.minimum(height,d/np.maximum(b,1e-30));area[ix]=width*y[ix];sx[ix]=width*width*y[ix]/2;sy[ix]=width*y[ix]**2/2
    iy=b<=1e-8
    x=np.minimum(width,d/np.maximum(a,1e-30));area[iy]=height*x[iy];sx[iy]=height*x[iy]**2/2;sy[iy]=height*height*x[iy]/2
    return area,np.sign(dx)*(width*area/2-sx),np.sign(dy)*(height*area/2-sy)


@lru_cache(maxsize=4096)
def curve(N,width,height,bars,angles=120):
    # bars=(y,z,diameter), measured about the concrete centroid.
    points=np.asarray(bars,float);xy=points[:,:2];As=np.pi*points[:,2]**2/4
    area=width*height;steel=float(sum(As));nmin=-steel*FYD;nmax=(area-steel)*FCD+steel*FYD
    if not nmin+1e-6<N<nmax-1e-6:return np.empty((0,2))
    theta=np.arange(angles)*2*math.pi/angles;dx,dy=np.cos(theta),np.sin(theta)
    extreme=abs(dx)*width/2+abs(dy)*height/2;projection=dx[:,None]*xy[None,:,0]+dy[:,None]*xy[None,:,1]
    def at(depth):
        A,Qy,Qz=rectangle_block(width,height,theta,depth)
        eps=.0035*(1-(extreme[:,None]-projection)/depth[:,None]);stress=np.clip(ES*eps,-FYD,FYD)
        force=(stress-FCD*(projection>=extreme[:,None]-.8*depth[:,None]))*As
        axial=FCD*A+np.sum(force,axis=1)
        return axial,np.stack((FCD*Qy+force@xy[:,0],FCD*Qz+force@xy[:,1]),axis=1)
    lo=np.full(angles,.0001);hi=np.full(angles,100*(width+height))
    for _ in range(48):
        mid=(lo+hi)/2;n,m=at(mid);low=n<N;lo=np.where(low,mid,lo);hi=np.where(low,hi,mid)
    axial,moments=at((lo+hi)/2)
    assert max(abs(axial-N))<.003,(N,max(abs(axial-N)))
    return moments


def utilisation(N,Qy,Qz,width,height,bars,angles=120):
    contour=curve(float(N),float(width),float(height),tuple(tuple(float(x) for x in p) for p in bars),angles)
    if not len(contour):return 1e9
    v=np.array([Qy,Qz]);nxt=np.roll(contour,-1,axis=0);d=nxt-contour
    determinant=v[0]*d[:,1]-v[1]*d[:,0];good=abs(determinant)>1e-8
    t=np.divide(contour[:,0]*d[:,1]-contour[:,1]*d[:,0],determinant,out=np.zeros(len(d)),where=good)
    s=np.divide(contour[:,0]*v[1]-contour[:,1]*v[0],determinant,out=np.zeros(len(d)),where=good)
    accepted=t[(t>0)&(s>=-1e-7)&(s<=1+1e-7)&good]
    return float(1/min(accepted)) if len(accepted) else 0. if np.linalg.norm(v)<1e-6 else 1e9


def jamb_bars(z,centroid_q=312.5):
    def drift(offset):
        r=(400**2+offset**2)/(4*abs(offset))
        def one(t):
            t=float(np.clip(t,0,400));a=min(t,400-t);v=r-math.sqrt(r*r-a*a)
            return v if t<=200 else abs(offset)-v
        v=one(z-2770) if z<3170 else abs(offset) if z<=3920 else abs(offset)-one(z-3920)
        return math.copysign(v,offset)
    return tuple((q+drift(move)-centroid_q,along,12.) for q,move in ((260.5,-10.),(364.5,50.)) for along in (-32.,32.))


def s_offset(station,start,length,offset):
    """Offset along two tangent circular arcs, including straight endpoints."""
    if not offset:return 0.
    t=float(np.clip(station-start,0.,length));r=(length**2+offset**2)/(4*abs(offset))
    a=min(t,length-t);v=r-math.sqrt(max(0.,r*r-a*a))
    return math.copysign(v if t<=length/2 else abs(offset)-v,offset)


def floor_bars(kind='outer',width=160.,corner_station=None,ordinary_width=160.,corner_end=1430.):
    height,rows=(750.,3) if kind=='outer' else (650.,2);out=[]
    steel_width=width
    if kind=='outer' and corner_station is not None and width>ordinary_width:
        steel_width-=2*s_offset(corner_station,corner_end-200.,200.,(width-ordinary_width)/2)
    for side in (-1.,1.):
        for row in range(rows):
            z=side*(height/2-61-75*row)
            for q in (-steel_width/2+51,steel_width/2-51):out.append((q,z,16.))
    for row in range(4):
        for q in (-steel_width/2+49,steel_width/2-49):out.append((q,(row-1.5)*55,12.))
    return tuple(out)


def controls():
    # Independent polygon clipping reference for the exact block geometry.
    def polygon(angle,depth,w,h):
        normal=np.array([math.cos(angle),math.sin(angle)]);limit=(abs(normal)*[w/2,h/2]).sum()-.8*depth
        pp=[(-w/2,-h/2),(w/2,-h/2),(w/2,h/2),(-w/2,h/2)];out=[]
        for p,q in zip(pp,pp[1:]+pp[:1]):
            p=np.array(p);q=np.array(q);a=p@normal-limit;b=q@normal-limit
            if a>=0:out.append(p)
            if (a>=0)!=(b>=0):out.append(p+a/(a-b)*(q-p))
        area=mx=my=0.
        for p,q in zip(out,out[1:]+out[:1]):
            c=p[0]*q[1]-p[1]*q[0];area+=c;mx+=(p[0]+q[0])*c;my+=(p[1]+q[1])*c
        return np.array([area/2,mx/6,my/6])
    maximum=0.
    for angle in (.0,.17,.7,1.2,math.pi/2,2.1,4.2,5.9):
        for depth in (.01,30.,100.,240.,500.):
            row=np.array(rectangle_block(180.,205.,np.array([angle]),np.array([depth]))).ravel()
            ref=polygon(angle,depth,180.,205.);maximum=max(maximum,float(np.max(abs(row-ref))))
            assert np.allclose(row,ref,rtol=1e-8,atol=.001),(angle,depth,row,ref)
    bars=tuple((q,z,12.) for q in (-52.,52.) for z in (-32.,32.))
    c=curve(0.,180.,205.,bars,120);symmetry=float(np.max(abs(c+np.roll(c,60,axis=0))))
    assert symmetry<.1
    x=utilisation(0.,4e6,3e6,180.,205.,bars,120);fine=utilisation(0.,4e6,3e6,180.,205.,bars,240)
    assert abs(x-fine)/fine<.005
    assert floor_bars('outer',250.,1430.)==floor_bars('outer',160.)
    assert floor_bars('outer',250.,1230.)==floor_bars('outer',250.)
    for t in np.linspace(0,200,21):assert abs(s_offset(1230+t,1230,200,45)+s_offset(1430-t,1230,200,45)-45)<1e-10
    return dict(blockPolygonMaximumAreaOrFirstMomentError=maximum,zeroAxialReflectionErrorNmm=symmetry,biaxial120=x,biaxial240=fine,steelOnlyTensionLimitKN=4*math.pi*12**2/4*FYD/1000,
                squareCornerSteelTransition='Two tangent circular arcs R233.472222 mm;45 mm per bar plane over200 mm; exact old/new endpoints and reflection checked')

if __name__=='__main__':print(json.dumps(controls(),indent=2))
