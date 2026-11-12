"""Inspect correlated jamb/collector end states from the demand-domain run.

These are END sections. Interior force fields, second order, links, bond and
joint zones remain separate. A failed exact end state is a valid adverse result;
a passed screen alone is not section/cage admission.
"""
from pathlib import Path
from collections import defaultdict
import argparse,json,math
import numpy as np
from floor_portal_sections import curve,utilisation,jamb_bars,floor_bars,controls


def many(values,contour):
    if not len(contour):return np.full(len(values),1e9)
    d=np.roll(contour,-1,axis=0)-contour
    det=values[:,0,None]*d[None,:,1]-values[:,1,None]*d[None,:,0]
    good=abs(det)>1e-8
    t=np.divide((contour[:,0]*d[:,1]-contour[:,1]*d[:,0])[None,:],det,out=np.zeros_like(det),where=good)
    s=np.divide(contour[None,:,0]*values[:,1,None]-contour[None,:,1]*values[:,0,None],det,out=np.zeros_like(det),where=good)
    choices=np.where((t>0)&(s>=-1e-7)&(s<=1+1e-7)&good,t,np.inf)
    smallest=np.min(choices,axis=1)
    return np.where(np.linalg.norm(values,axis=1)<1e-6,0.,np.where(np.isfinite(smallest),1/smallest,1e9))


def run(path):
    mat=np.load(path);meta=json.loads(Path(str(path)+'.json').read_text());actions=mat['actions'];groups=defaultdict(list)
    for i,e in enumerate(meta['members']):
        if e['family'] not in ('jamb','collector'):continue
        for end in (0,1):
            point=np.array(e['a' if end==0 else 'b']);sign=1 if end==0 else -1;local=actions[:,i,6*end:6*end+6]*sign;R=np.array(e['basis'])
            if e['family']=='jamb':
                if e['name']=='jamb-foot':continue
                face=int(e['name'].split('-')[1]);norm=np.array([(0,1,0),(-1,0,0),(0,-1,0),(1,0,0)][face]);along=np.array([(1,0,0),(0,1,0),(-1,0,0),(0,-1,0)][face])
                force=local[:,:3]@R;moment=local[:,3:]@R;N=force[:,2]
                first=np.c_[-moment[:,1],moment[:,0],np.zeros(len(moment))]
                values=np.c_[N,first@norm,first@along]
                z=point[2];frac=max(0,min(1,(z-2770)/400,(4320-z)/400));width=180+70*frac;q=312.5+20*frac;height=205.
                bars=jamb_bars(z,q);family='jamb'
            else:
                values=np.c_[local[:,0],-local[:,5],local[:,4]];width=e['width'];height=e['depth'];family=e['name']
                axis=int(abs(e['b'][0]-e['a'][0])<1e-6);station=min(point[axis],12000-point[axis])
                bars=floor_bars('outer' if height==750 else 'court',width,corner_station=station)
            # Opposed5 mm placement deviations move each bar towards the
            # actual centroid. They are not an extra concrete strength credit.
            adverse=tuple((a-math.copysign(min(5.,abs(a)),a),b-math.copysign(min(5.,abs(b)),b),d) for a,b,d in bars)
            key=(family,round(width,7),height,tuple(tuple(round(v,7) for v in b) for b in adverse))
            groups[key].append((i,end,point,values))
    worst={};sample_grid=5000.
    for group,rows in groups.items():
        family,width,height,bars=group;values=np.concatenate([r[3] for r in rows]);rounddown=np.floor(values[:,0]/sample_grid).astype(int)
        rough=np.zeros(len(values))
        # Adjacent axial contours identify candidates; exact same-N section
        # states below decide the recorded result. No rounded N is reported
        # as the force from a solved case.
        for k in np.unique(rounddown):
            ids=np.flatnonzero(rounddown==k)
            rough[ids]=np.maximum(many(values[ids,1:],curve(k*sample_grid,width,height,bars,120)),many(values[ids,1:],curve((k+1)*sample_grid,width,height,bars,120)))
        chosen=np.argsort(rough)[-min(12,len(rough)):]
        for flat in chosen:
            row,case=divmod(int(flat),len(meta['cases']));i,end,point,raw=rows[row];N,Qy,Qz=raw[case]
            fine=utilisation(N,Qy,Qz,width,height,bars,240);coarse=utilisation(N,Qy,Qz,width,height,bars,120)
            if family not in worst or fine>worst[family]['exact240']:
                worst[family]=dict(exact240=fine,exact120=coarse,caseIndex=case,case=meta['cases'][case],member=i,end=end,at=point.tolist(),N_Qnormal_Qother=[N,Qy,Qz],width=width,height=height,adverseBars=bars,bracketCandidateRatio=float(rough[flat]))
        print(f'{family} section width{width:g}: current exact worst {worst[family]["exact240"]:.6f}',flush=True)
    return dict(status='ADVERSE END-SECTION SCREEN ONLY; no structural or cage adoption',controls=controls(),cases=len(meta['cases']),testedEndGeometryGroups=len(groups),worst=worst,
                limits=['Exact same-N120/240-angle analysis is applied to12 candidates per geometry group. The bracket search is a screening procedure, not an exhaustive same-N certification.','Actual simultaneous end N and two moments are retained; unrelated case maxima are never combined.','Interior section extrema, global/local second order, torsion/shear, anchorage, joint confinement and assembly remain separate.'])

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('matrix');p.add_argument('--output',required=True);a=p.parse_args();r=run(a.matrix);Path(a.output).write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r['worst'],indent=2))
