"""Explicit compatibility sensitivities on the same connected house.

Temperature and net RC dimensional strain are named comparison ranges, not
site temperatures or a shrinkage prediction. Unit head movements supply
requirements per millimetre, not an allowable settlement or soil resistance.
"""
from pathlib import Path
from itertools import product
import argparse,json,math,time
import numpy as np
from scipy.sparse import csc_matrix
from floor_portal_frame import Frame,Solve,membrane_triangle
from floor_portal_house import House,ContactSolve
from floor_portal_loads import Case,gravity,roof_gravity,roof_goods
from floor_portal_coupled import recover
from floor_portal_candidate import named_parameters,update_bounds,finalise_bounds,GuideFrictionSolve


def contact_controls():
    f=Frame();a=f.node('base',[0,0,0]);b=f.node('moving',[0,0,0]);f.link(f.port(b),f.port(a),[10,0,0,0,0,0],'positive tie')
    K=f.matrix();fixed=list(range(6))+list(range(7,12));c=[dict(ids=np.r_[np.arange(6,12),np.arange(6)],row=np.r_[[1,0,0,0,0,0],[-1,0,0,0,0,0]],stiffness=90.,name='compression contact')]
    solve=ContactSolve(K,fixed,c);checks=[]
    for load,shift,want,force in [(-100.,0.,-1.,90.),(100.,0.,10.,0.),(-100.,2.,1.,90.)]:
        rhs=np.zeros(12);rhs[6]=load;given=np.array([shift if i==a else 0. for i in fixed]);u,r,state=solve(rhs,given);assert abs(u[6]-want)<1e-10 and abs(state['force'][0]-force)<1e-10
        independent=Solve(K+csc_matrix((solve.U*90)@solve.U.T) if load<0 else K,fixed)(rhs,given)
        assert np.max(abs(independent-u))<1e-10
        checks.append(dict(loadN=load,baseShiftMM=shift,movingMM=float(u[6]),contactN=float(state['force'][0])))
    return checks


def roof_strain(h,strain,affine=False):
    from floor_portal_roof_fields import elements
    c=Case(h,('roof reference-coordinate affine' if affine else 'roof actual axial member')+f' free strain{strain:g}')
    p=h.roof.p
    if affine:
        field=np.zeros(len(h.roof.keep))
        for key,j in h.roof.keys.items():
            kind,q,axis=key if len(key)==3 else (None,None,None)
            if kind=='ringPlan' and axis<2:field[j]=(q[axis]-6000)*strain
            elif kind=='purlin' and axis<3:field[j]=((q[axis]-6000) if axis<2 else p['zhigh']+p['seatZ']-6600)*strain
        c.f[h.roof.mounted]=h.roof.k@field
    else:
        for (kind,a,b),(terms,k) in h.roof.props.items():
            length=math.dist(a,b)
            if kind=='leg':length=math.hypot(length,p['zhigh']-p['zheel'])
            force=k*length*strain
            for native,weight in terms:c.f[h.roof.mounted[h.roof.lookup[native]]]+=force*weight
    # Local mechanical forces subtract the same eigenstrain load. Without
    # this entry, an interior-field report would falsely count free expansion
    # as mechanical stress even though the global load vector was correct.
    for key,e in elements(h).items():
        if affine:
            free=np.zeros(h.f.size);free[h.roof.mounted]=field
            c.native_eigen[key]+=e['k']@e['t']@free[e['ids']]
        else:
            c.native_eigen[key][[0,6]]+=np.array([-1.,1.])*e['EA']*strain
    # Equivalent eigenstrain forces are self-equilibrated at all three axes.
    residual=h.rigid.T@c.f;assert max(abs(residual[:3]))<.01 and max(abs(residual[3:]))<1.,residual
    return c


def superstructure_strain(h,strain):
    c=Case(h,f'superstructure net free dimensional strain{strain:g}')
    for family in ('jamb','L','arch','web','collector','trimmer'):
        for e in h.members[family]:
            if e['name'] in ('jamb-foot','L-foot'):continue
            local=np.zeros(12);local[0]=-e['EA']*strain;local[6]=e['EA']*strain
            np.add.at(c.f,e['ids'],e['t'].T@local);c.ends[id(e)]+=local
    # The same imposed net membrane dimensional change reaches the actual
    # RC200 field, rather than shrinking only its perimeter chord.
    for cell in h.floor_cells:
        a,b,r,t=cell['rect'];pts=np.array([(a,b),(r,b),(r,t),(a,t)],float);ports=cell['ports']
        for tri in ((0,1,2),(0,2,3)):
            km,_=membrane_triangle(pts[list(tri)],E=h.p.membrane_E);tr=np.zeros((6,18));ids=np.concatenate([ports[j][0] for j in tri])
            for k,j in enumerate(tri):tr[2*k:2*k+2,6*k:6*k+6]=ports[j][1][:2]
            free=((pts[list(tri)]-6000)*strain).ravel();np.add.at(c.f,ids,tr.T@km@free)
    residual=h.rigid.T@c.f;assert max(abs(residual[:3]))<.01 and max(abs(residual[3:]))<1.,residual
    return c


def run(heads=False,parameters=None,guide_friction=0.):
    h=House(parameters);controls=contact_controls();h.controls();G,Q,_=gravity(h);rg,rq,ru,_=roof_gravity(h);dg,w,extra,uncertainty,_=roof_goods(h)
    G=Case.combination(h,'adverse G reference',[(1,G),(1,rg),(1,dg)])
    rigid_solve=ContactSolve(h.k,h.fixed,h.contacts)
    solve=GuideFrictionSolve(h,guide_friction) if guide_friction else rigid_solve
    # Six prescribed rigid fields must create no relative contact or internal
    # restraint; this also verifies finite offsets at every one of52 heads.
    rigid_receipt=[]
    for j in range(6):
        unit=np.eye(6)[j]*(1 if j<3 else .001);wanted=h.rigid@unit;prescribed=wanted[h.fixed]
        u,r,c=rigid_solve(np.zeros(h.f.size),prescribed)
        retained=np.setdiff1d(np.arange(h.f.size),rigid_solve.base.unused);error=float(max(abs(u[retained]-wanted[retained])));reaction=float(max(abs(r)));assert error<.001 and reaction<1.,(j,error,reaction)
        rigid_receipt.append(dict(field=j,maximumDisplacementError=error,maximumReactionNOrNmm=reaction))
    results=[];guide_bounds={};friction_bound=dict(coefficient=float(guide_friction),maximumPointFrictionN=0.,sumPointFrictionMagnitudesN=0.,maximumIterations=0,witness=None)
    def friction(case,c):
        if not guide_friction:return
        gf=c['guideFriction'];friction_bound['maximumIterations']=max(friction_bound['maximumIterations'],gf['iterations'])
        friction_bound['sumPointFrictionMagnitudesN']=max(friction_bound['sumPointFrictionMagnitudesN'],gf['sumPointFrictionMagnitudesN'])
        if gf['maximumPointFrictionN']>friction_bound['maximumPointFrictionN']:
            friction_bound.update(maximumPointFrictionN=gf['maximumPointFrictionN'],witness=case)
    for strain in (-720e-6,720e-6):
        for affine in (False,True):
            eig=roof_strain(h,strain,affine);case=Case.combination(h,G.name+'; '+eig.name,[(1,G),(1,eig)])
            u,r,c=solve(case.f);friction(case.name,c);update_bounds(guide_bounds,h,u,len(results),case.name);results.append(recover(h,case,u,r,c));print('Solved '+case.name,flush=True)
    for strain in (-300e-6,300e-6):
        eig=superstructure_strain(h,strain);case=Case.combination(h,G.name+'; '+eig.name,[(1,G),(1,eig)])
        u,r,c=solve(case.f);friction(case.name,c);update_bounds(guide_bounds,h,u,len(results),case.name);results.append(recover(h,case,u,r,c));print('Solved '+case.name,flush=True)
    motions=[]
    if heads:
        for name,node in h.heads.items():
            for sign in (-1.,1.):
                given=np.array([sign if i==node+2 else 0. for i in h.fixed]);u,r,c=solve(G.f,given);label=f'head {name} vertical {sign:+g} mm';friction(label,c);update_bounds(guide_bounds,h,u,len(results)+len(motions),label);row=recover(h,G,u,r,c);motions.append(dict(head=name,verticalMM=sign,response=row));print('Solved '+label,flush=True)
    return dict(status='COMPATIBILITY COMPARISONS ONLY; not an allowable movement or selected thermal detail',parameters=dict(roofStrain=[-.000720,.000720],equivalentSteelTemperatureIfAlpha12e6=[-60,60],superstructureNetStrain=[-.0003,.0003],headVerticalUnitMM=[-1,1] if heads else []),
                contactControls=controls,rigidHeadControls=rigid_receipt,cases=results,all52HeadUnitMotions=motions,guideBounds=finalise_bounds(guide_bounds,h),guideFriction=friction_bound,
                interpretation=['The actual-axial roof case expands each source member along its real length and preserves the260/200/170 offsets. It holds those rigid offset arms at nominal dimensions.','The reference-affine roof case compares uniform expansion of native reference coordinates, including the finite-offset contribution in its equivalent forces. Actual cap port thermal offsets remain to detail.','Superstructure strain is a prescribed net dimensional-change sensitivity relative to the older ground grid; it is not an Ec/steel bond or creep prediction.','All52 vertical motions are independent unit requirements. The fixed6DOF head reference remains a kinematic comparison, not an assigned site resistance.'])

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--controls',action='store_true');p.add_argument('--heads',action='store_true');p.add_argument('--output');p.add_argument('--candidate',choices=('guided-t20',));p.add_argument('--guide-friction',type=float,default=0.);a=p.parse_args()
    params=named_parameters(a.candidate) if a.candidate else None;r=contact_controls() if a.controls else run(a.heads,params,a.guide_friction)
    if a.output:Path(a.output).write_text(json.dumps(r,indent=2)+'\n')
    if a.controls:print(json.dumps(r,indent=2))
    else:print(json.dumps(dict(caseCount=len(r['cases']),headMotionCount=len(r['all52HeadUnitMotions']),guideBounds=r['guideBounds'],guideFriction=r['guideFriction']),indent=2),flush=True)
