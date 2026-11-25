"""Replay the source-bound ideal-release/native house comparison, no new solve."""
import argparse
import copy
import hashlib
import json
import tarfile
from pathlib import Path

import wet_masonry_arch_native_proof as elastic
from floor_section_model import load_source
from wet_masonry_arch_released import ROOT,METHOD,RELEASES

D=Path(__file__).resolve().parent
ARCHIVE=D/'wet-masonry-arch-released-captures.tar.xz'
PROOF=D/'wet-masonry-arch-released-proof.json'
PROCESS='project/str/studies/wet_masonry_arch_released_proof.py'
sha=lambda b:hashlib.sha256(b).hexdigest()


def requests(source):
    result=elastic.expected_requests(source)
    for value in result.values():
        value['schema']='str-wet-masonry-arch-released-request/1'
        value['jointHypothesis']='spring-and-crown-independent-global-rx'
        value['caseId']=value['caseId'].replace('NATIVE-FLOOR','RELEASED')
    # Existing authored combined programme, carried onto this same27density
    # candidate. It is solved together, never added as a linear increment.
    from roof_surface_pressure_proof import pressure_controls
    owner=next(c for name,c in pressure_controls(source['bearing']['base']) if name=='uniform-suction')
    combined=copy.deepcopy(result['oriented']);combined['caseId']='WET-MASONRY-ARCH-RELEASED-G0P9-Q0-SUCTION'
    v=combined['nativeCase']['bearingCase']['masonryCase']['verticalCase'];original=owner['verticalCase']
    v['monolithicCase']['houseCase']['boundary']['physicalGFactor']=original['monolithicCase']['houseCase']['boundary']['physicalGFactor']
    v['freshUniformLiveKPa']=original['freshUniformLiveKPa']
    combined['nativeCase']['bearingCase']['roofControls']['roofSurfacePressure']=copy.deepcopy(owner['roofCoupling']['roofSurfacePressure'])
    result['combined']=combined
    return result


def unchanged_controls(a,b):
    if a['nativeVertical']['plate']['cellsXYMm']!=b['nativeVertical']['plate']['cellsXYMm'] or a['nativeVertical']['plate']['holesXYMm']!=b['nativeVertical']['plate']['holesXYMm']:
        raise ValueError('Actual release comparison changed plate cells/holes')
    if abs(a['mass']['joinedPhysicalGKN']-b['mass']['joinedPhysicalGKN'])>1e-8:raise ValueError('Actual release comparison changed physicalG')
    if max(abs(x-y) for x,y in zip(a['nativeVertical']['native']['externalWrenchKN_KNm'],b['nativeVertical']['native']['externalWrenchKN_KNm']))>1e-8:
        raise ValueError('Actual release comparison changed external source wrench')
    return {'actualPlateCellsAndHolesIdentical':True,'physicalGWithin1eMinus8KN':True,'externalWrenchWithin1eMinus8KN_KNm':True}


def pier_screens(n):
    rows=[]
    for pier in n['experimentalArch']['arch']['piers']:
        width=pier['intervalYMm'][1]-pier['intervalYMm'][0]
        w=pier['recovery']['physicalEndWrenchesKN_KNmm']
        for end,sign in ((0,1),(1,-1)):
            q=w[6*end:6*end+6];compression=sign*q[2]
            rows.append({'id':pier['id'],'end':end,'grossSectionNormalXYMm':[140,width],
                'axialCompressionKN':compression,'momentXKNmm':q[3],'momentYKNmm':q[4],
                'grossAffineBiaxialKernRatio':6*abs(q[3])/(compression*width)+6*abs(q[4])/(compression*140) if compression>1e-12 else None,
                'resultantInside140ByPierRectangle':compression>1e-12 and abs(q[3])<=compression*width/2 and abs(q[4])<=compression*70,
                'grossStressFieldOrFiniteNodeAccepted':False})
    return rows


def produce():
    source=load_source(ROOT);expected=requests(source);elastic_proof=elastic.produce()
    methods={p:sha((ROOT/p).read_bytes()) for p in [METHOD,PROCESS,*elastic.METHODS]}
    controls={};provenance={};runtime=None;fulls={}
    with tarfile.open(ARCHIVE,'r:xz') as tar:
        manifest=json.load(tar.extractfile('manifest.json'))
        if manifest['schema']!='str-wet-masonry-arch-released-captures/1' or manifest['candidateAccepted'] is not False:raise ValueError('Released capture scope differs')
        for name,request in expected.items():
            values={}
            for suffix in ('request.json','full.json','execution-start.json'):
                path=name+'-'+suffix;raw=tar.extractfile(path).read()
                if manifest['files'][path]!={'bytes':len(raw),'sha256':sha(raw)}:raise ValueError('Actual released bytes differ: '+path)
                values[suffix]=json.loads(raw)
            n=values['full.json'];start=values['execution-start.json'];native=n['nativeVertical']['native']
            if values['request.json']!=request or n['experimentalRequest']!=request or n['schema']!='str-experimental-wet-masonry-released-comparison/1':raise ValueError('Actual released request/schema differs')
            if n['sourceSHA256']!=source['identities']:raise ValueError('Actual current58 source differs')
            for p,h in n['experimentalMethodSHA256'].items():
                if methods[p]!=h:raise ValueError('Actual released execution method differs: '+p)
            if set(n['experimentalMethodSHA256'])!={METHOD,elastic.METHODS[0],elastic.METHODS[2]}:raise ValueError('Complete executed method identity required')
            if start['methodSHA256']!=methods[METHOD] or start['requestFileSHA256']!=manifest['files'][name+'-request.json']['sha256']:raise ValueError('Actual released start identity differs')
            if runtime is None:runtime=start['numericalRuntime']
            elif runtime!=start['numericalRuntime']:raise ValueError('Actual compared numerical runtimes differ')
            if native['caseId']!=request['caseId'] or len(native['heads'])!=52 or len({r['id'] for r in native['heads']})!=52:raise ValueError('Actual52head identity required')
            if max(map(abs,native['equilibriumResidualKN_KNm']))>1e-5 or native['energyRelativeResidual']>1e-7:raise ValueError('Released native balance/energy fails')
            if n['floorSection']['finishStairServiceEvidenceApplicable'] is not False:raise ValueError('Experimental release inherited architectural applicability')
            a=n['experimentalArch']['arch'];joints=a['idealReleasedJoints']
            wanted={(f'WET-ARCH/ring-member/{i}',end) for i,ends in RELEASES.items() for end in ends}
            if len(joints)!=4 or {(r['memberId'],r['end']) for r in joints}!=wanted:raise ValueError('Actual four released end identities differ')
            if any(abs(r['releasedMomentKNmm'])>1e-5 or r['physicalPinOrRockingNodeQualified'] is not False for r in joints):raise ValueError('Actual release moment or physical scope differs')
            if a['actualMITC4PlateAndCSTMaterialRetained'] is not True or a['floorMomentFixityOrFrictionCredited'] is not False or min(-r['actualState']['forceKN'] for r in a['floorBearingFibres'])< -1e-7:raise ValueError('Actual native plate/normal-only bearing scope differs')
            fulls[name]=n;controls[name]={**elastic.summary(n),'actualReleasedJoints':joints,'actualPierNecessarySectionScreens':pier_screens(n)}
            provenance[name]=manifest['files'][name+'-full.json']
    same={}
    with tarfile.open(elastic.ARCHIVE,'r:xz') as tar:
        for name,n in fulls.items():
            if name=='combined':continue  # No actual v2 counterpart is claimed.
            old=json.load(tar.extractfile(name+'-full.json'))
            same[name]=unchanged_controls(old,n)
    stiffness_controls=unchanged_controls(fulls['oriented'],fulls['soft'])
    if any(sha((ROOT/p).read_bytes())!=h for p,h in source['identities'].items()):raise ValueError('Native source changed during retained release replay')
    if methods!={p:sha((ROOT/p).read_bytes()) for p in methods}:raise ValueError('Release processing source changed')
    return {'schema':'str-wet-masonry-arch-released-proof/1','sourceSHA256':source['identities'],
        'processingMethodSHA256':methods,'archiveSHA256':sha(ARCHIVE.read_bytes()),
        'actualCaptureProvenance':provenance,'actualNumericalRuntime':runtime,
        'elasticPredecessorProofArchiveSHA256':elastic_proof['archiveSHA256'],
        'unchangedElasticToReleasedControls':same,'stiffnessEditUnchangedControls':stiffness_controls,
        'loadOwnership':{
            'oriented':'Actual1.35G/Q2/rho27 floor-section control; source native31 programme unchanged.',
            'soft':'Only masonry E changes3000 to1500; actual same load, mass and floor mesh.',
            'suction':'Zero physicalG/Q0 with authored−2.25kPa roof pressure: separate nonlinear diagnostic, not preloaded full design combination or grounds to reject all gravity masonry.',
            'combined':'Existing roof_surface_pressure_proof uniform-suction programme:0.9G/Q0/−2.25kPa, ported unchanged onto this rho27 candidate. Full joined solve; not superposition. No actual v2 counterpart or complete signed/code envelope is asserted.'},
        'controls':controls,'nativeSolvesExecutedByThisReplay':False,
        'candidateAccepted':False,'wholeHouseAccepted':False,
        'scope':'Ideal spring/crown globalRX releases through existing native mapped energy, same exact floor mesh/material/source wrench. Physical pins or rocking/contact law, masonry tension/shear/constituents, transverse stability, tie/node/base/grid resistance and complete signed envelope remain unqualified.'}


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--write',action='store_true');p.add_argument('--check',action='store_true');a=p.parse_args();result=produce()
    if a.write:PROOF.write_text(json.dumps(result,indent=2,allow_nan=False)+'\n')
    elif a.check:
        if json.loads(PROOF.read_text())!=result:raise ValueError('Stale actual released-ring comparison')
    else:print(json.dumps(result,allow_nan=False))
