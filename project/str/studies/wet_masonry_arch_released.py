"""Actual three-hinge idealisation through existing finite mapped frame energy.

Four independent scalar rotations release the two spring ends and both crown
faces. Translation, transverse rotation and every external source stay native.
This authors ideal joints, not physical masonry pins or accepted rocking nodes.
"""
import copy
import hashlib
import json
from pathlib import Path

import wet_masonry_arch_native as base
from finite_mapped_frame import node_trace, mapped_frame_member, recover_mapped_member

ROOT=base.ROOT
METHOD='project/str/studies/wet_masonry_arch_released.py'
RELEASES={0:(0,),7:(1,),8:(0,),15:(1,)}


def released_member(frame,identifier,a,b,section,material,ends,y_axis):
    """Use native energy with explicit independent endpoint rotationX DOFs."""
    maps=node_trace(a)+node_trace(b);rotations=[]
    for end in ends:
        physical=(a,b)[end];node=frame.node(identifier+'/free-rx/'+str(end),frame.nodes[physical])
        # These five unused coordinates are gauges, absent from ALL work maps.
        for axis in (0,1,2,4,5):frame.fixed[(node,axis)]=0.
        maps[6*end+3]=[(node,[0,0,0,1,0,0])]
        rotations.append({'end':end,'node':node,'physicalJointNode':physical,'axisGlobal':[1,0,0]})
    item=mapped_frame_member(frame,identifier,frame.nodes[a],frame.nodes[b],section,material,maps,y_axis)
    item['releasedRotations']=rotations
    return item


class ReleasedArchAdapter(base.NativeArchAdapter):
    def build(self,model,legacy_setting,h,required_stations=()):
        if self.arch_segments!=16:raise ValueError('Explicit16-segment released-joint topology required')
        frame=model['model'];original=frame.member;self.released={}
        def member(name,a,b,section,material,physical_start=None,physical_end=None,y_axis=None):
            if name.startswith('WET-ARCH/ring-member/'):
                index=int(name.rsplit('/',1)[1])
                if index in RELEASES:
                    if physical_start is not None or physical_end is not None:raise ValueError('Release requires actual coincident ring endpoint')
                    self.released[name]=released_member(frame,name,a,b,section,material,RELEASES[index],y_axis)
                    return
            return original(name,a,b,section,material,physical_start,physical_end,y_axis)
        try:
            frame.member=member
            return super().build(model,legacy_setting,h,required_stations)
        finally:frame.member=original

    def finish(self,model,raw,g_factor):
        amended={**raw,'memberEndWrenchesKN_KNmm':dict(raw['memberEndWrenchesKN_KNmm'])};joints=[]
        for identifier,item in self.released.items():
            recovery=recover_mapped_member(item,raw['displacements'])
            amended['memberEndWrenchesKN_KNmm'][identifier]=recovery['physicalEndWrenchesKN_KNmm']
            for r in item['releasedRotations']:
                moment=recovery['physicalEndWrenchesKN_KNmm'][6*r['end']+3]
                if abs(moment)>1e-5:raise ValueError('Actual released ring end retained a significant in-plane couple')
                joints.append({**r,'memberId':identifier,'releasedMomentKNmm':moment,
                    'independentRotationRad':raw['displacements'][r['node']][3],
                    'adjacentJointRotationRad':raw['displacements'][r['physicalJointNode']][3],
                    'sameTranslationsAndOtherRotationsMapped':True,
                    'physicalPinOrRockingNodeQualified':False})
        result=super().finish(model,amended,g_factor)
        result['arch']['idealReleasedJoints']=joints
        result['arch']['actualMasonryTensionAccepted']=False
        return result


def run(request,root=ROOT,checkpoint_path=None):
    if not isinstance(request,dict) or request.get('schema')!='str-wet-masonry-arch-released-request/1' or request.get('jointHypothesis')!='spring-and-crown-independent-global-rx':
        raise ValueError('Explicit ideal released-joint hypothesis required')
    before=hashlib.sha256((Path(root)/METHOD).read_bytes()).hexdigest()
    native_request=copy.deepcopy(request);native_request.pop('jointHypothesis');native_request['schema']='str-wet-masonry-arch-native-request/2'
    original=base.NativeArchAdapter
    try:
        base.NativeArchAdapter=ReleasedArchAdapter
        n=base.run(native_request,root,checkpoint_path)
    finally:base.NativeArchAdapter=original
    if before!=hashlib.sha256((Path(root)/METHOD).read_bytes()).hexdigest():raise ValueError('Released-joint source changed during actual execution')
    n['schema']='str-experimental-wet-masonry-released-comparison/1'
    n['executedBaseExperimentalRequest']=n['experimentalRequest'];n['experimentalRequest']=copy.deepcopy(request)
    n['experimentalMethodSHA256'][METHOD]=before
    n['floorSection']['finishStairServiceEvidenceApplicable']=False
    n['floorSection']['architecturalApplicabilityDiagnostic']='EXPERIMENTAL_LOWER_ARCH_SUPPORT_REPLACES_SOURCE_HOUSE_INTERFACES'
    n['diagnostics'].append('Three-hinge ring is an authored ideal rotation release; physical normal/shear/rocking/tie/sideways/node/DPC paths are unqualified.')
    return n


if __name__=='__main__':
    import argparse
    from datetime import datetime,timezone
    from four_l_joint_observer import numerical_runtime
    p=argparse.ArgumentParser();p.add_argument('--request',type=Path,required=True);p.add_argument('--out',type=Path,required=True);a=p.parse_args()
    if a.out.exists():raise ValueError('Refuse overwriting actual released-joint evidence')
    value=json.loads(a.request.read_text());record={'schema':'str-wet-masonry-released-execution-start/1',
        'startedAt':datetime.now(timezone.utc).isoformat(),'requestFileSHA256':hashlib.sha256(a.request.read_bytes()).hexdigest(),
        'methodSHA256':hashlib.sha256((ROOT/METHOD).read_bytes()).hexdigest(),'numericalRuntime':numerical_runtime(),
        'caseId':value['caseId'],'accepted':False}
    a.out.with_suffix('.execution-start.json').write_text(json.dumps(record,indent=2)+'\n')
    recovery=a.out.with_suffix('.unvalidated.json');n=run(value,checkpoint_path=recovery)
    temporary=a.out.with_suffix('.writing.json');temporary.write_text(json.dumps(n,allow_nan=False));temporary.replace(a.out);recovery.unlink()
