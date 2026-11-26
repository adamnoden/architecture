"""Passive actual spring/body observation inside the full finite-house solve."""
import hashlib
from pathlib import Path
from current_finite_rc_joint import in_patch,run_current_finite_joint

METHOD='project/str/studies/finite_joint_normal_observer.py'


def run_observed_current_joint(case,settings,root):
    if not settings['enabled']:return run_current_finite_joint(case,settings,root)
    import floor_section_model as native
    root=Path(root);identity=hashlib.sha256((root/METHOD).read_bytes()).hexdigest();original=native.solve_vertical_frame;observed=[]
    base=case['bearingCase']['masonryCase'];factor=base['verticalCase']['monolithicCase']['houseCase']['boundary']['physicalGFactor'];density=base['lowerCoreBodies']['masonryUnitWeightKNPerM3']
    def passive(frame,vertical):
        raw=original(frame,vertical);states={s['id']:s for s in raw['springs']};rows=[]
        for fibre in vertical['fibres']:
            if not in_patch(fibre['xyMm']):continue
            top=states[fibre['id']];body_nodes=[node for node,row in top['terms'] if node.startswith('LOWER-CORE/body-top/') and row[2]==-1]
            if len(body_nodes)!=1:raise ValueError('Actual separate lower body/top contact required')
            node=body_nodes[0];index=node.rsplit('/',1)[1];body=states['LOWER-CORE/axial/'+index]
            weight=fibre['areaMm2']*fibre['heightMm']/1e9*density*factor
            applied=frame.loads.get(node,[0.]*6)
            if any(abs(v)>1e-12 for i,v in enumerate(applied) if i!=2) or abs(applied[2]+weight/2)>1e-9:
                raise ValueError('Actual lower body consistent self-G top card differs from geometry')
            top_compression=-top['forceKN'];base_compression=-body['forceKN']+weight/2
            residual=base_compression-top_compression-weight
            if abs(residual)>1e-7 or top_compression < -1e-9:raise ValueError('Actual separate body base=top+ownG equilibrium fails')
            rows.append({'fibreId':fibre['id'],'xyMm':fibre['xyMm'],'areaMm2':fibre['areaMm2'],'heightMm':fibre['heightMm'],
                'actualTopSpringId':top['id'],'actualBodySpringId':body['id'],'topActive':top['active'],'topRelativeMm':top['relativeMm'],
                'topCompressionKN':top_compression,'actualAxialSpringForceKN':body['forceKN'],'appliedBodyOwnGKN':weight,
                'actualBodyTopAppliedLoadKN':applied[2],'baseCompressionKN':base_compression,'baseMinusTopMinusOwnGKN':residual,
                'bodyAxialRelativeMm':body['relativeMm'],'actualLowerGridTrace':[(n,r) for n,r in body['terms'] if n!=node]})
        observed.append(rows)
        return raw
    try:
        native.solve_vertical_frame=passive
        result=run_current_finite_joint(case,settings,root)
    finally:native.solve_vertical_frame=original
    if len(observed)!=1:raise ValueError('One actual whole-house solve observation required')
    if identity!=hashlib.sha256((root/METHOD).read_bytes()).hexdigest():raise ValueError('Passive support observer changed during execution')
    rows=observed[0]
    if {r['fibreId'] for r in rows}!=set(result['audit']['actualNormalContactIds']):raise ValueError('Actual physical remapped support catalogue differs')
    port_forces={p['contactIndex']:r for p,r in zip(result['finiteJoint']['ports'],result['finiteJoint']['portReactionKN_KNm']) if p['kind']=='normal'}
    for index,value in port_forces.items():
        if abs(rows[index]['topCompressionKN']-value)>1e-6:raise ValueError('Actual solid port and top-contact action differ')
    result['normalSupportObservation']={'schema':'str-actual-finite-normal-support-observation/1','methodSHA256':{METHOD:identity},
        'actualContactCount':len(rows),'activeContactCount':sum(r['topActive'] for r in rows),'rows':rows,
        'maximumIndependentBodyEquilibriumResidualKN':max((abs(r['baseMinusTopMinusOwnGKN']) for r in rows),default=0),
        'staging':'Same simultaneous zero-gap source assembly: body own-G acts while the contact/slab/frame are solved together. No prestress, delayed closure, construction pre-shortening reset or artificial contact activation.',
        'addedForceStiffnessRestraintOrGauge':False,'candidateAccepted':False}
    return result
