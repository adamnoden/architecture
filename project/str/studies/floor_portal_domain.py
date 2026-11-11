"""Correlated connected-house demand cases; no combination of marginal maxima.

The stored component bounds are separate extrema with their own case witness.
A named coherent gravity state and signed full/half face pressures are solved
with the actual unilateral contacts, never by summing their response envelopes.
"""
from pathlib import Path
from dataclasses import asdict
from itertools import product
import argparse,hashlib,json,time
import numpy as np
from floor_portal_house import House,Parameters,ContactSolve
from floor_portal_loads import Case,gravity,roof_gravity,roof_goods,wind

D=Path(__file__).resolve().parent


def member_actions(h,case,u):
    return np.array([e['k']@e['t']@u[e['ids']]-case.ends.get(id(e),np.zeros(12)) for es in h.members.values() for e in es])


def run(parameters=None,full=True,matrix_path=None):
    start=time.time();h=House(parameters);controls=h.controls();print('Domain physical assembly ready.',flush=True)
    G,Q,ledger=gravity(h);rg,rq,ru,roofledger=roof_gravity(h);dg,water,extra,massgroups,goodsledger=roof_goods(h)
    G=Case.combination(h,'adverse G budgets',[(1,G),(1,rg),(1,dg)])
    Q=Case.combination(h,'full use and blocked water',[(1,Q),(1,rq),(1,water)])
    U=Case.combination(h,'complete roof suction',[(1,ru),(-1,extra)])
    gravitycase=Case.combination(h,'1.35G+1.5Q',[(1.35,G),(1.5,Q)])
    solve=ContactSolve(h.k,h.fixed,h.contacts);print('Domain contact compliance factored.',flush=True)
    members=[(family,e) for family,es in h.members.items() for e in es]
    metadata=[dict(family=family,name=e['name'],a=e['a'].tolist(),b=e['b'].tolist(),basis=e['R'].tolist(),width=e['width'],depth=e['depth']) for family,e in members]
    heads=list(h.heads);hi=np.array([[h.heads[name]+j for j in range(6)] for name in heads]);scales=np.array([1e-3,1e-3,1e-3,1e-6,1e-6,1e-6])
    names=[];memberrows=[];headrows=[];jointrows=[];allloads=[];contactcounts=[];maximum_balance=np.zeros(6);worst_trans=(0.,None);minimum_head=(0.,None,None)
    bounds={family:dict(maxAbs=np.zeros(6),witness=[None]*6) for family in h.members}
    offsets=np.cumsum([0]+[len(es) for es in h.members.values()])
    def one(case):
        nonlocal worst_trans,minimum_head,maximum_balance
        u,r,c=solve(case.f);balance=h.rigid.T@(r+case.f)
        assert max(abs(balance[:3]))<.03 and max(abs(balance[3:]))<20.,(case.name,balance)
        maximum_balance=np.maximum(maximum_balance,abs(balance));values=member_actions(h,case,u)
        row=r[hi]*scales;cards=row[:,[2,4,3,0,1,5]]*np.array([1,-1,1,-1,-1,-1]);headrows.append(cards)
        index=len(names);names.append(case.name);contactcounts.append(int(sum(c['active'])));allloads.append(h.rigid.T@case.f)
        if matrix_path:memberrows.append(values)
        # Every peak retains the simultaneous complete six-action member end.
        for j,(family,es) in enumerate(h.members.items()):
            rows=values[offsets[j]:offsets[j+1]].reshape(-1,6);maximum=np.max(abs(rows),axis=0)
            for axis in np.flatnonzero(maximum>bounds[family]['maxAbs']):
                k=int(np.argmax(abs(rows[:,axis])));e=es[k//2]
                bounds[family]['maxAbs'][axis]=maximum[axis]
                bounds[family]['witness'][axis]=dict(case=index,member=int(offsets[j]+k//2),end=k%2,at=e['a' if k%2==0 else 'b'].tolist(),actions=rows[k].tolist())
        # The actual relative-link force is retained, not a force inferred
        # from an absolute roof or column displacement.
        links=h.cap_links+h.dpc_links
        jointrows.append(np.array([e['k']@e['t']@u[e['ids']] for e in links]))
        trans=float(max(np.max(abs(u[6*i:6*i+3])) for i in range(len(h.f.points))))
        if trans>worst_trans[0]:worst_trans=(trans,index)
        ii=int(np.argmin(cards[:,0]))
        if cards[ii,0]<minimum_head[0]:minimum_head=(float(cards[ii,0]),heads[ii],index)
        if index%24==0:print(f'Solved domain case{index}: {case.name}',flush=True)
    one(G);one(Q);one(gravitycase)
    programmes=[p for p in product(range(7),repeat=2) if any(p)] if full else [(1,0),(4,0),(0,1),(0,4),(1,1),(4,4)]
    for inner in (False,True) if full else (False,):
        for height in (6000.,7400.) if full else (7400.,):
            # Assemble each pressure primitive once; two-axis programmes are
            # precisely their sum before contact response is recalculated.
            basis={}
            for axis in (0,1):
                for code in range(1,7):
                    pp=[0,0];pp[axis]=code;basis[axis,code]=wind(h,pp,inner,height)
            for programme in programmes:
                parts=[(1,basis[axis,code]) for axis,code in enumerate(programme) if code]
                label=f'W{programme};court={inner};goodsZ={height:g}'
                one(Case.combination(h,'zero favourable G; U; '+label,[(1,U)]+parts))
                one(Case.combination(h,'1.35G+1.5Q; downward roof pressure; '+label,[(1,gravitycase),(-1,U)]+parts))
                one(Case.combination(h,'1.35G+1.5Q; roof suction; '+label,[(1,gravitycase),(1,U)]+parts))
    hh=np.array(headrows);jj=np.array(jointrows);headcards=[]
    for i,name in enumerate(heads):
        limits=[]
        for axis in range(6):
            lo=int(np.argmin(hh[:,i,axis]));hi0=int(np.argmax(hh[:,i,axis]));limits.append(dict(min=float(hh[lo,i,axis]),minCase=lo,max=float(hh[hi0,i,axis]),maxCase=hi0))
        headcards.append(dict(id=name,components_N_Cx_Cy_Vx_Vy_Yaw=limits))
    if matrix_path:
        np.savez_compressed(matrix_path,actions=np.array(memberrows),headCards=hh,jointForces=jj,loads=np.array(allloads))
        Path(str(matrix_path)+'.json').write_text(json.dumps(dict(cases=names,members=metadata,links=[e['name'] for e in h.cap_links+h.dpc_links],heads=heads),indent=2)+'\n')
    return dict(status='CORRELATED DEMAND DOMAIN ONLY; physical sections and joints remain unselected',parameters=asdict(h.p),controls=controls,
                caseCount=len(names),caseNames=names,memberGeometry=metadata,memberBounds={k:dict(maxAbsLocal_N_Vy_Vz_T_My_Mz=v['maxAbs'].tolist(),witness=v['witness']) for k,v in bounds.items()},
                all52HeadBounds=headcards,maximumBalanceResidual=maximum_balance.tolist(),minimumHeadN_KN_Id_Case=minimum_head,
                maximumTranslationMM_Case=worst_trans,activeContactCounts=contactcounts,
                sourceHashes={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in [D/'floor_portal_frame.py',D/'floor_portal_roof.py',D/'floor_portal_house.py',D/'floor_portal_loads.py',Path(__file__)]},
                gravityLedger=ledger,roofLedger=roofledger,goodsLedger=goodsledger,
                separateUnfinishedDomains=['24 independent cassette dry centroid groups and actual independent pressure faces','guard point/release states','roof thermal, RC shortening and all52 head movements','section/joint/soil acceptance, finite cage/assembly and occupied room interfaces'],elapsedSecondsInformational=time.time()-start)

def matrix_receipt(path):
    """Reconstruct signed reaction/section witnesses from retained solve data."""
    from floor_portal_house import GRID
    a=np.load(path);meta=json.loads(Path(str(path)+'.json').read_text());hh=a['headCards'];forces=a['actions'];links=a['jointForces'];members=meta['members'];names=meta['cases']
    xy={r['id']:r['xy'] for r in GRID['heads']};result=np.zeros((len(names),6))
    headcards=[]
    for i,name in enumerate(meta['heads']):
        card=hh[:,i];F=np.c_[-card[:,3],-card[:,4],card[:,0]]*1000.;M=np.c_[card[:,2],-card[:,1],-card[:,5]]*1e6
        result[:,:3]+=F;result[:,3:]+=M+np.cross(np.array([*xy[name],-750.]),F)
        rows=[]
        for j in range(6):
            lo=int(np.argmin(card[:,j]));hi=int(np.argmax(card[:,j]));rows.append(dict(min=float(card[lo,j]),minCase=lo,max=float(card[hi,j]),maxCase=hi))
        headcards.append(dict(id=name,components_N_Cx_Cy_Vx_Vy_Yaw=rows))
    residual=result+a['loads'];maximum=np.max(abs(residual),axis=0)
    assert max(maximum[:3])<.03 and max(maximum[3:])<20.,maximum
    bounds={}
    for family in sorted({m['family'] for m in members}):
        indices=[i for i,m in enumerate(members) if m['family']==family];values=forces[:,indices].reshape(len(names),len(indices),2,6);witness=[]
        for j in range(6):
            idx=np.unravel_index(np.argmax(abs(values[:,:,:,j])),values[:,:,:,j].shape);case,member,end=map(int,idx);i=indices[member]
            witness.append(dict(case=case,member=i,end=end,at=members[i]['a' if end==0 else 'b'],actions=values[case,member,end].tolist()))
        bounds[family]=dict(maxAbsLocal_N_Vy_Vz_T_My_Mz=np.max(abs(values),axis=(0,1,2)).tolist(),witness=witness)
    link_rows=[]
    for i,name in enumerate(meta['links']):
        rows=[]
        for j in range(6):
            lo=int(np.argmin(links[:,i,j]));hi=int(np.argmax(links[:,i,j]));rows.append(dict(min=float(links[lo,i,j]),minCase=lo,max=float(links[hi,i,j]),maxCase=hi))
        link_rows.append(dict(name=name,actualPointFx_Fy_Fz_Mx_My_Mz=rows))
    loc=np.unravel_index(np.argmin(hh[:,:,0]),hh[:,:,0].shape);case,head=map(int,loc)
    return dict(status='CORRELATED579-CASE END DEMANDS; no physical design adoption',caseCount=len(names),caseNames=names,parameters=asdict(Parameters()),
                receipt='Reconstructed directly from stored coherent solve matrices after repairing a NumPy witness-index JSON conversion. Every solve completed its contact and equilibrium assertions before the matrices were written. The six force/moment balances below are independently recomputed from all52 signed head cards.',
                maximumBalanceResidualN_Nmm=maximum.tolist(),minimumHeadN_KN_Id_Case=[float(hh[case,head,0]),meta['heads'][head],case],
                all52HeadBounds=headcards,memberGeometry=members,memberBounds=bounds,actualJointLinkBounds=link_rows,
                sourceHashes={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in [D/'floor_portal_frame.py',D/'floor_portal_roof.py',D/'floor_portal_house.py',D/'floor_portal_loads.py']},
                remaining=['Independent pressure and installed-mass domains','Guard point/release, continuous internal section extrema, second order and physical strength checks','Finite cap/foot/corner cage and occupied-room selection','Actual site support resistance and movement domain'])


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--quick',action='store_true');p.add_argument('--output',required=True);p.add_argument('--matrix');p.add_argument('--summary-matrix');args=p.parse_args()
    out=matrix_receipt(args.summary_matrix) if args.summary_matrix else run(full=not args.quick,matrix_path=args.matrix)
    Path(args.output).write_text(json.dumps(out,indent=2)+'\n')
    print(json.dumps({k:out[k] for k in ['caseCount','maximumBalanceResidual','maximumBalanceResidualN_Nmm','minimumHeadN_KN_Id_Case','maximumTranslationMM_Case','elapsedSecondsInformational'] if k in out},indent=2),flush=True)
