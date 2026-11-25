"""Full-array replay guards, separate from the immutable execution observer.

The 70/50 assembled fingerprints are execution observations, not reconstructed
matrix bytes. Only140 has an independent archived assembled fingerprint join.
"""
import argparse,json
from pathlib import Path
import numpy as np
from finite_floor_contour import rigid_port_modes
from finite_floor_contour_residency_control import check as check_execution

def check_arrays(value,ports,wrench):
    if set(value)!={'condensedStiffness','consistentLoad','loadPotentialConstantKNM'}:
        raise ValueError('explicit full condensation arrays required')
    n=len(ports);c=np.asarray(value['condensedStiffness'],dtype=float);f=np.asarray(value['consistentLoad'],dtype=float)
    potential=value['loadPotentialConstantKNM']
    if c.shape!=(n,n) or f.shape!=(n,) or not np.isfinite(c).all() or not np.isfinite(f).all() or type(potential) not in (int,float) or not np.isfinite(potential):
        raise ValueError('finite full condensation arrays required')
    scale=float(abs(c).max())
    if scale<=0 or float(abs(c-c.T).max())/scale>1e-9:
        raise ValueError('full condensed symmetry failed')
    modes=rigid_port_modes(ports)
    if float(abs(c @ modes).max())/scale>1e-9:
        raise ValueError('full six rigid-null identities failed')
    eigen=np.linalg.eigvalsh(c)
    if eigen[0]<-eigen[-1]*1e-9 or np.count_nonzero(eigen>eigen[-1]*1e-9)!=n-6:
        raise ValueError('six free and all relative modes required')
    if float(abs(modes.T @ f-np.asarray(wrench,dtype=float)).max())>1e-7:
        raise ValueError('full consistent load loses independent source wrench')

def check(root,path):
    receipt=json.loads(path.read_bytes())
    if [r['pitchMm'] for r in receipt['comparisons']]!=[140,70,50]:
        raise ValueError('all three explicit current comparisons required')
    for row in receipt['comparisons']:
        current=json.loads((root/f"project/str/studies/finite-floor-contour-captures/contour{row['pitchMm']}.json").read_bytes())
        check_arrays(row['predecessorCondensation'],current['ports'],current['distributedLoadWrenchKN_KNM'])
        check_arrays({k:current[k] for k in ['condensedStiffness','consistentLoad','loadPotentialConstantKNM']},current['ports'],current['distributedLoadWrenchKN_KNM'])
    return check_execution(root,path)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--root',type=Path,required=True);p.add_argument('--out',type=Path,required=True);a=p.parse_args()
    r=check(a.root,a.out);print(json.dumps({'comparisons':len(r['comparisons']),'fullArrayIdentitiesPassed':True,'physicalConvergenceAccepted':False}))
