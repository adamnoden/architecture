"""Explicit deeper-ring geometry on the unchanged released/native comparison.

Only the new lower arch is changed; canonical house/service arch controls stay
untouched. The wall footprint,12mm offset, tie and head/ring/soffit stay fixed.
"""
import copy
import hashlib
import json
from pathlib import Path

import wet_masonry_arch_released as released

ROOT=released.ROOT
METHOD='project/str/studies/wet_masonry_arch_rise.py'


def lower_arch_house(h,rise):
    if type(rise) not in (int,float) or rise not in (450,600):raise ValueError('Only explicit450/600mm rise comparison supported')
    result=copy.deepcopy(h);c=result['internalArchControls']
    if (c['head'],c['spring'],c['rise'],c['radialRing'],c['upperRCUnderside'],c['ringCrown'])!=(2850,2550,300,215,3170,3065):
        raise ValueError('Changed source head/ring/soffit requires coordinated rebase')
    c.update(spring=2850-rise,rise=rise)
    return result


class RiseArchAdapter(released.ReleasedArchAdapter):
    def __init__(self,*args,arch_rise,**kwargs):
        self.arch_rise=arch_rise
        super().__init__(*args,**kwargs)

    def build(self,model,legacy_setting,h,required_stations=()):
        return super().build(model,legacy_setting,lower_arch_house(h,self.arch_rise),required_stations)


def run(request,root=ROOT,checkpoint_path=None):
    if not isinstance(request,dict) or request.get('schema')!='str-wet-masonry-arch-rise-request/1' or request.get('archRiseMm') not in (450,600):
        raise ValueError('Explicit450/600mm lower-arch geometry request required')
    before=hashlib.sha256((Path(root)/METHOD).read_bytes()).hexdigest()
    native=copy.deepcopy(request);rise=native.pop('archRiseMm');native['schema']='str-wet-masonry-arch-released-request/1'
    original=released.ReleasedArchAdapter
    try:
        released.ReleasedArchAdapter=lambda *args,**kwargs:RiseArchAdapter(*args,arch_rise=rise,**kwargs)
        n=released.run(native,root,checkpoint_path)
    finally:released.ReleasedArchAdapter=original
    if before!=hashlib.sha256((Path(root)/METHOD).read_bytes()).hexdigest():raise ValueError('Actual lower-arch geometry source changed during execution')
    n['schema']='str-experimental-wet-masonry-rise-comparison/1';n['executedReleasedExperimentalRequest']=n['experimentalRequest']
    n['experimentalRequest']=copy.deepcopy(request);n['experimentalMethodSHA256'][METHOD]=before
    n['diagnostics'].append('Only the new lower arch has explicit changed rise/spring; canonical service arch controls remain source geometry. Same head2850/ring215/soffit3170/12mm eccentricity/tie2560.')
    return n


if __name__=='__main__':
    import argparse
    from datetime import datetime,timezone
    from four_l_joint_observer import numerical_runtime
    p=argparse.ArgumentParser();p.add_argument('--request',type=Path,required=True);p.add_argument('--out',type=Path,required=True);a=p.parse_args()
    if a.out.exists():raise ValueError('Refuse overwriting actual rise evidence')
    r=json.loads(a.request.read_text());record={'schema':'str-wet-masonry-rise-execution-start/1',
        'startedAt':datetime.now(timezone.utc).isoformat(),'requestFileSHA256':hashlib.sha256(a.request.read_bytes()).hexdigest(),
        'methodSHA256':hashlib.sha256((ROOT/METHOD).read_bytes()).hexdigest(),'numericalRuntime':numerical_runtime(),'caseId':r['caseId'],'accepted':False}
    a.out.with_suffix('.execution-start.json').write_text(json.dumps(record,indent=2)+'\n')
    recovery=a.out.with_suffix('.unvalidated.json');n=run(r,checkpoint_path=recovery)
    temporary=a.out.with_suffix('.writing.json');temporary.write_text(json.dumps(n,allow_nan=False));temporary.replace(a.out);recovery.unlink()
