"""Reproducible connected-house calculation checkpoint, not design adoption."""
from pathlib import Path
import argparse,hashlib,json,time
from dataclasses import asdict
import numpy as np
from floor_portal_house import House,Parameters,ContactSolve
from floor_portal_loads import Case,gravity,roof_gravity,roof_goods,wind
from floor_portal_frame import controls as frame_controls

D=Path(__file__).resolve().parent


def recover(h,case,u,reaction,contact):
    expected=h.rigid.T@case.f;balance=h.rigid.T@(case.f+reaction)
    assert np.max(abs(balance[:3]))<.01 and np.max(abs(balance[3:]))<10.,balance
    heads=[]
    for row in h.heads:
        i=h.heads[row];r=reaction[i:i+6]
        heads.append({'id':row,'xy':h.f.points[i//6][:2].tolist(),'N_Cx_Cy_Vx_Vy_Yaw':[float(r[2]/1000),float(-r[4]/1e6),float(r[3]/1e6),float(-r[0]/1000),float(-r[1]/1000),float(-r[5]/1e6)]})
    members={};physical={};foot=[]
    for family,es in h.members.items():
        vals=[]
        for e in es:
            action=e['k']@e['t']@u[e['ids']]-case.ends.get(id(e),np.zeros(12));vals.append(action.reshape(2,6))
            physical[id(e)]=action
        vv=np.concatenate(vals) if vals else np.zeros((1,6))
        members[family]={'maxAbsLocal_N_Vy_Vz_T_My_Mz':np.max(abs(vv),axis=0).tolist()}
    for j in h.jambs:
        face,at=j['face'],j['u'];es=[e for e in h.members['jamb'] if e['name']==f'jamb-{face}-{at:g}']
        first=min(es,key=lambda e:e['a'][2]);q=physical[id(first)][:6];force=first['R'].T@q[:3];moment=first['R'].T@q[3:];barrier=np.r_[h.f.points[j['dpc'][1]//6][:2],-40.]
        moment+=np.cross(first['a']-barrier,force)
        foot_e=next(e for e in h.members['jamb'] if e['name']=='jamb-foot' and np.linalg.norm(e['b'][:2]-barrier[:2])<1e-6);qf=physical[id(foot_e)][:6]
        foot.append({'face':face,'station':at,'barrierXYZ':barrier.tolist(),'reactionOnUpperColumnAtBarrier_N_Nmm':np.r_[force,moment].tolist(),'reactionOnColumnAtFoot_N_Nmm':np.r_[foot_e['R'].T@qf[:3],foot_e['R'].T@qf[3:]].tolist()})
    cap=[]
    for e in h.cap_links:
        f=e['k']@e['t']@u[e['ids']]
        cap.append({'name':e['name'],'forceAndMomentAtActualPoint':f.tolist()})
    return {'name':case.name,'load':case.totals(),'balanceResidualN_Nmm':balance.tolist(),
            'activeContacts':int(sum(contact['active'])),'contactIterations':contact['iterations'],'contactConstitutiveErrorN':contact['errorN'],
            'maximumAbsoluteTranslationMM':float(max(np.max(abs(u[6*i:6*i+3])) for i in range(len(h.f.points)))),
            'headCards':heads,'memberEndBounds':members,'jambBarrierAndFoot':foot,'capLinks':cap,
            'maximumHeadTensionKN':max(0.,-min(row['N_Cx_Cy_Vx_Vy_Yaw'][0] for row in heads))}


def run(parameters=None,component_only=False):
    started=time.time();h=House(parameters);control={'frame':frame_controls(),'house':h.controls()}
    print('Coupled physical assembly controls passed.',flush=True)
    if component_only:
        f=np.zeros(h.f.size);h.f.point(f,h.jambs[0]['top'],[0,0,-1000]);solve=ContactSolve(h.k,h.fixed,h.contacts);u,r,c=solve(f)
        balance=h.rigid.T@(f+r);assert max(abs(balance))<.01
        return {'status':'ASSEMBLY CONTROLS ONLY; no structural adoption','parameters':asdict(h.p),'controls':control,'unitContact':{'iterations':c['iterations'],'errorN':c['errorN'],'sixBalance':balance.tolist()}}
    G,Q,base_receipt=gravity(h);Rg,Rq,Ru,roof_receipt=roof_gravity(h);Dg,Wq,extra,uncertainty,goods_receipt=roof_goods(h)
    totalG=Case.combination(h,'G characteristic with declared adverse budgets',[(1,G),(1,Rg),(1,Dg)])
    totalQ=Case.combination(h,'Q characteristic including blocked water',[(1,Q),(1,Rq),(1,Wq)])
    pressure=wind(h,(1,0));suction=Case.combination(h,'source and added roof suction',[(1,Ru),(-1,extra)])
    cases=[totalG,totalQ,Case.combination(h,'ULS simultaneous gravity and full blocked water',[(1.35,totalG),(1.5,totalQ)]),
           Case.combination(h,'positive X wind and roof suction without favourable G',[(1,pressure),(1,suction)])]
    print('Physical load origins and single-owned mass ledger assembled.',flush=True)
    solve=ContactSolve(h.k,h.fixed,h.contacts);results=[]
    for case in cases:
        u,r,c=solve(case.f);results.append(recover(h,case,u,r,c));print('Solved: '+case.name,flush=True)
    return {'status':'UNSELECTED CONNECTED COMPARISON; STR-FLOOR-PORTAL INCOMPLETE','parameters':asdict(h.p),'controls':control,
            'sources':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in [D/'floor_portal_frame.py',D/'floor_portal_roof.py',D/'floor_portal_house.py',D/'floor_portal_loads.py',D/'current-house-grid.json',D/'current-house-head-actions.py']},
            'gravityLedger':base_receipt,'roofLedger':roof_receipt,'goodsLedger':goods_receipt,'cases':results,
            'unresolved':['All20 roof caps now use located steel anchors, positive keys and compression contact; compatible coupler/stub/weld stack, cover, anchorage and finite movement are still unqualified.',
                          'Ordinary160 and local250 corner/flared jamb cage remains unselected; current model has no local corner250 widening.',
                          'All signed/partial/biaxial winds, independent24 cassette mass endpoints, pressure groups, thermal, shortening and52 head motions require the same assembly.',
                          'Joint-zone stiffness sensitivity, mesh convergence and physical anchorage/cage/room replay remain outstanding.',
                          '52 heads use an explicit kinematic fixed-reference comparison; no site or shaft resistance is assigned.'],
            'elapsedSecondsInformational':time.time()-started}


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--components',action='store_true');parser.add_argument('--output');parser.add_argument('--check',action='store_true');args=parser.parse_args()
    result=run(component_only=args.components)
    if args.check:
        expected=json.loads((D/'floor-portal-coupled-checkpoint.json').read_text())
        assert result['sources']==expected['sources'],'Checkpoint source identities are stale'
        assert len(result['cases'])==len(expected['cases'])
        for new,old in zip(result['cases'],expected['cases']):
            assert new['name']==old['name']
            assert np.allclose(new['load']['sixResultants'],old['load']['sixResultants'],rtol=1e-10,atol=.01)
            assert [r['id'] for r in new['headCards']]==[r['id'] for r in old['headCards']]
            assert np.allclose([r['N_Cx_Cy_Vx_Vy_Yaw'] for r in new['headCards']],[r['N_Cx_Cy_Vx_Vy_Yaw'] for r in old['headCards']],rtol=1e-7,atol=1e-5)
        print('Recorded source identities, load resultants and all52 head cards reproduced.',flush=True)
    if args.output:Path(args.output).write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps({'status':result['status'],'controls':result['controls'],'cases':[{'name':r['name'],'headTensionKN':r['maximumHeadTensionKN']} for r in result.get('cases',[])]},indent=2),flush=True)
