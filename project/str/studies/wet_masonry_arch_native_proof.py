"""Authenticate/replay the actual coupled masonry alternative; no native solves.

Complete archived responses, exact requests and execution-start identities are
required. Closed balances remain checks on the declared elastic-frame model.
"""
import argparse
import copy
import hashlib
import json
import math
import tarfile
from pathlib import Path

from foundation_solid_weight import disjoint_solid_union
from floor_section_model import load_source
from floor_section_proof import validate_full, cases
from wet_masonry_arch_comparison import CHOICES, EVIDENCE, ROOT

D=Path(__file__).resolve().parent
ARCHIVE=D/'wet-masonry-arch-native-captures.tar.xz'
PROOF=D/'wet-masonry-arch-native-proof.json'
METHODS=['project/str/studies/wet_masonry_arch_native.py','project/str/studies/wet_masonry_arch_native_proof.py',
         'project/str/studies/wet_masonry_arch_comparison.py','project/str/studies/foundation_solid_weight.py']
sha=lambda raw:hashlib.sha256(raw).hexdigest()


def expected_requests(source):
    native=json.loads(EVIDENCE.read_text())['request'];c=json.loads(CHOICES.read_text())
    base={'schema':'str-wet-masonry-arch-native-request/2','caseId':'WET-MASONRY-ARCH-NATIVE-FLOOR-E3000-16-B8-ORIENTED',
          'archChoices':c,'archSegments':16,'masonryElasticModulusMPa':3000,'bearingCellsY':8,
          'floorNormalComplianceMmPerMPa':.1,'nativeCase':native}
    soft=copy.deepcopy(base);soft.update(caseId='WET-MASONRY-ARCH-NATIVE-FLOOR-E1500-16-B8',masonryElasticModulusMPa=1500)
    suction=copy.deepcopy(base);suction['caseId']='WET-MASONRY-ARCH-NATIVE-FLOOR-ZEROG-SUCTION'
    v=suction['nativeCase']['bearingCase']['masonryCase']['verticalCase'];v['freshUniformLiveKPa']=0
    v['monolithicCase']['houseCase']['boundary']['physicalGFactor']=0
    old=next(c for name,c in cases(source) if name=='wet-zeroG-roof-suction')
    suction['nativeCase']['bearingCase']['roofControls']['roofSurfacePressure']=copy.deepcopy(old['bearingCase']['roofControls']['roofSurfacePressure'])
    return {'oriented':base,'soft':soft,'suction':suction}


def arch_balance(native):
    a=native['experimentalArch']['arch'];total=[0.]*6
    def add(force,point,moment=(0,0,0)):
        x,y,z=point;fx,fy,fz=force
        row=[fx,fy,fz,moment[0]+(y*fz-z*fy)/1000,moment[1]+(z*fx-x*fz)/1000,moment[2]+(x*fy-y*fx)/1000]
        for i,v in enumerate(row):total[i]+=v
    for p in a['piers']:
        w=p['recovery']['physicalEndWrenchesKN_KNmm'];add(w[:3],p['baseXYZMm'],[v/1000 for v in w[3:6]])
    for r in a['floorBearingFibres']:add([0,0,r['actualState']['forceKN']],[*r['xyMm'],3170.])
    factor=native['request']['bearingCase']['masonryCase']['verticalCase']['monolithicCase']['houseCase']['boundary']['physicalGFactor']
    for r in a['materialGOrigins']:add([0,0,-factor*r['weightKN']],r['originXYZMm'])
    c=native['experimentalRequest']['archChoices']
    for y in c['tieBearingFacesYMm']:add([0,0,-factor*a['tieHardwareGrossEnvelopeGKN']/2],[a['geometry']['lowerWallAxisXMm'],y,c['tieCentreZMm']])
    if max(map(abs,total))>1e-6:raise ValueError('Actual masonry/contact/grid six-wrench free body fails')
    return total


def core_area(n):
    solids=[{'id':r['id'],'kind':'ordinary','boxXYZMm':[r['rectangleXYMm'][0],r['rectangleXYMm'][1],0,r['rectangleXYMm'][2],r['rectangleXYMm'][3],1]}
            for r in n['nativeVertical']['normalCoreGeometry'] if r['materialKind']=='source-core-material-unqualified']
    return math.fsum((r['boxXYZMm'][3]-r['boxXYZMm'][0])*(r['boxXYZMm'][4]-r['boxXYZMm'][1]) for r in disjoint_solid_union(solids))


def mass_replacement(old,new):
    w=old['seatedWetSupport'];a=new['experimentalArch']['arch'];area_delta=core_area(new)-core_area(old)
    height=3350.;density=20.;g=w['settings']
    restored_strip=g['beamWidthMm']*200*(g['beamNorthEndYMm']-g['beamSouthEndYMm'])*g['concreteUnitWeightKNPerM3']/1e9
    terms={'removedOldBeamPostGKN':-w['beamPhysicalGKN']-sum(p['physicalGKN'] for p in w['posts']),
           'removedOldPadGKN':-sum(p['padPhysicalGKN'] for p in w['posts']),
           'addedArchMasonryGKN':a['grossMasonryGKN'],'addedGrossTieHardwareGKN':a['tieHardwareGrossEnvelopeGKN'],
           'restoredRC200StripGKN':restored_strip,'restoredAdjacentClearMasonryGKN':area_delta*height*density/1e9}
    expected=sum(terms.values());actual=new['mass']['joinedPhysicalGKN']-old['mass']['joinedPhysicalGKN']
    if abs(expected-actual)>1e-7:raise ValueError('Independent remove/add whole-model material ledger fails')
    return {'terms':terms,'actualCoreUnionAreaDifferenceMm2':area_delta,'expectedTotalGChangeKN':expected,'actualTotalGChangeKN':actual,
            'residualKN':actual-expected,'scope':'Actual native gross-material and retained-core union account. Product/delivered weights, pocket removals, finishes and eventual material qualification remain unearned.'}


def summary(n):
    a=n['experimentalArch']['arch'];native=n['nativeVertical']['native'];fibres=a['floorBearingFibres'];ring=[]
    for row in a['members']:
        if row['kind']!='elastic-ring':continue
        vector=[b-a for a,b in zip(row['start'],row['end'])];length=math.sqrt(sum(v*v for v in vector));axis=[v/length for v in vector]
        w=row['rawEndWrenchesKN_KNmm'];normal=(sum(w[i]*axis[i] for i in range(3))-sum(w[6+i]*axis[i] for i in range(3)))/2
        cuts=[]
        # Native localY is globalX; localZ is tangent cross globalX.
        # These are necessary rectangular-section resultant screens, not a
        # qualified masonry stress field, joint law or collapse calculation.
        local_z=[0.,axis[2],-axis[1]]
        for end,sign in ((0,1),(1,-1)):
            q=w[6*end:6*end+6];compression=sign*sum(q[i]*axis[i] for i in range(3))
            in_plane=q[3];out_plane=sum(q[3+i]*local_z[i] for i in range(3))
            cuts.append({'end':end,'axialCompressionKN':compression,'inPlaneMomentKNmm':in_plane,
                'outOfPlaneMomentKNmm':out_plane,
                'inPlaneEccentricityMm':abs(in_plane)/compression if compression>1e-12 else None,
                'outOfPlaneEccentricityMm':abs(out_plane)/compression if compression>1e-12 else None,
                'grossAffineBiaxialKernRatio':6*abs(in_plane)/(compression*215)+6*abs(out_plane)/(compression*140) if compression>1e-12 else None,
                'resultantInside215By140Rectangle':compression>1e-12 and abs(in_plane)<=compression*107.5 and abs(out_plane)<=compression*70})
        ring.append({'id':row['id'],'axialCompressionKN':normal,'rawEndWrenchesKN_KNmm':w,'physicalStartEndXYZMm':[row['start'],row['end']],'cutScreens':cuts})
    cuts=[{'id':r['id'],**c} for r in ring for c in r['cutScreens']]
    positive=[r for r in cuts if r['grossAffineBiaxialKernRatio'] is not None]
    # Explicit postprocessing override; the executed capture stays immutable.
    floor_section={**n['floorSection'],'finishStairServiceEvidenceApplicable':False,
        'architecturalApplicabilityDiagnostic':'EXPERIMENTAL_LOWER_ARCH_SUPPORT_REPLACES_SOURCE_HOUSE_INTERFACES'}
    return {'nativeCaseId':native['caseId'],'heads':native['heads'],'externalWrenchKN_KNm':native['externalWrenchKN_KNm'],
        'globalWrenchResidualKN_KNm':native['equilibriumResidualKN_KNm'],'archFreeBodyResidualKN_KNm':arch_balance(n),
        'frameEnergyRelativeResidual':native['energyRelativeResidual'],'plateWorkRelativeResidual':n['nativeVertical']['plate']['physicalRecovery']['workRelativeResidual'],
        'plateAreaM2':n['mass']['newPlateAreaM2'],'plateSelfGKN':n['mass']['newPlatePhysicalSelfGKN'],
        'joinedPhysicalGKN':n['mass']['joinedPhysicalGKN'],'maximumPlateDeflectionMm':n['nativeVertical']['plate']['physicalRecovery']['maximumDeflectionMm'],
        'rawPointMomentInspectionKNmPerM':n['plateBending']['maximumAbsoluteBendingPlusTwistingKNmPerM'],
        'tieState':a['tieState'],'floorNormalCompressionKN':sum(-r['actualState']['forceKN'] for r in fibres),
        'activeNormalFibres':sum(r['actualState']['active'] for r in fibres),'normalFibreCount':len(fibres),
        'minimumRawNormalCompressionKN':min(-r['actualState']['forceKN'] for r in fibres),
        'maximumRigidWorkResidual':a['maximumFloorBearingRigidWorkResidual'],
        'ringMemberAxialRangeKN':[min(r['axialCompressionKN'] for r in ring),max(r['axialCompressionKN'] for r in ring)],
        'actualRingMemberEndActions':ring,'masonryLaw':a['masonryLaw'],
        'necessaryCompressionOnlyRingScreen':{'worstPositiveCompressionCut':max(positive,key=lambda r:r['grossAffineBiaxialKernRatio']) if positive else None,
            'nonCompressiveCutCount':sum(r['axialCompressionKN']<=1e-12 for r in cuts),
            'resultantOutsideSectionCount':sum(not r['resultantInside215By140Rectangle'] for r in cuts),
            'fixedRecoveredActionsAdmitCompressionOnlySection':all(r['resultantInside215By140Rectangle'] for r in cuts),
            'scope':'Necessary section-resultant bounds only. Failure rejects compression-only admission of these fixed elastic actions; does not establish arch collapse or exclude a genuinely released/contact redistribution.'},
        'floorSection':floor_section,
        'captureApplicabilityOverride':{'capturedInheritedValue':n['floorSection']['finishStairServiceEvidenceApplicable'],
            'derivedApplicable':False,'captureAltered':False,'executedBackendSHA256Retained':True},
        'candidateAccepted':False,
        'masonryStressTensionAndJointResistanceAccepted':False,'completeSignedLoadEnvelope':False}


def produce():
    source=load_source(ROOT);method={p:sha((ROOT/p).read_bytes()) for p in METHODS};requests=expected_requests(source)
    fulls={};provenance={};runtimes={};archive_bytes=ARCHIVE.read_bytes()
    with tarfile.open(ARCHIVE,'r:xz') as tar:
        manifest=json.load(tar.extractfile('manifest.json'))
        if manifest['schema']!='str-wet-masonry-arch-native-captures/1' or manifest['candidateAccepted'] is not False:raise ValueError('Actual capture manifest scope differs')
        for name,request in requests.items():
            for suffix in ('request.json','full.json','execution-start.json'):
                path=name+'-'+suffix;raw=tar.extractfile(path).read();identity=manifest['files'][path]
                if identity!={'bytes':len(raw),'sha256':sha(raw)}:raise ValueError('Actual archived native file identity differs: '+path)
                if suffix=='request.json' and json.loads(raw)!=request:raise ValueError('Actual native request differs from current authored recipe')
                if suffix=='execution-start.json':
                    start=json.loads(raw)
                    runtimes[name]=start['numericalRuntime']
                    if start['methodSHA256']!=method[METHODS[0]] or start['requestFileSHA256']!=manifest['files'][name+'-request.json']['sha256']:raise ValueError('Actual native execution started from a different method/request')
                if suffix=='full.json':
                    n=json.loads(raw);fulls[name]=n;provenance[name]={'fullFileSHA256':sha(raw),'fullBytes':len(raw)}
                    if n['schema']!='str-experimental-wet-masonry-coupled-comparison/1' or n['experimentalRequest']!=request or n['sourceSHA256']!=source['identities']:raise ValueError('Actual experimental schema/request/source differs')
                    if n['experimentalMethodSHA256'][METHODS[0]]!=method[METHODS[0]] or n['experimentalMethodSHA256'][METHODS[2]]!=method[METHODS[2]]:raise ValueError('Actual native method changed')
                    if len(n['nativeVertical']['native']['heads'])!=52 or len({r['id'] for r in n['nativeVertical']['native']['heads']})!=52:raise ValueError('Actual52head result required')
                    if max(map(abs,n['nativeVertical']['native']['equilibriumResidualKN_KNm']))>1e-5 or n['nativeVertical']['native']['energyRelativeResidual']>1e-7:raise ValueError('Native balance/energy criterion failed')
                    a=n['experimentalArch']['arch']
                    if a['actualMITC4PlateAndCSTMaterialRetained'] is not True or a['floorMomentFixityOrFrictionCredited'] is not False:raise ValueError('Native plate or normal-only contact boundary lost')
                    if min(-r['actualState']['forceKN'] for r in a['floorBearingFibres'])< -1e-7:raise ValueError('Masonry floor bearing supplied tension')
        raw=tar.extractfile('predecessor-full.json').read();old=json.loads(raw)
        if sha(raw)!=json.loads(EVIDENCE.read_text())['fullResponseSHA256'] or manifest['files']['predecessor-full.json']!={'bytes':len(raw),'sha256':sha(raw)}:raise ValueError('Retained actual predecessor identity differs')
        validate_full(old,old['request'],source,old['nativeVertical']['native']['caseId'])
    control=fulls['oriented'];soft=fulls['soft']
    if any(value!=runtimes['oriented'] for value in runtimes.values()):raise ValueError('Actual numerical runtimes differ between compared cases')
    if control['nativeVertical']['plate']['cellsXYMm']!=soft['nativeVertical']['plate']['cellsXYMm'] or control['nativeVertical']['plate']['holesXYMm']!=soft['nativeVertical']['plate']['holesXYMm']:raise ValueError('Stiffness-only edit changed the actual floor mesh')
    if abs(control['mass']['joinedPhysicalGKN']-soft['mass']['joinedPhysicalGKN'])>1e-8:raise ValueError('Stiffness-only edit changed physicalG')
    if max(abs(a-b) for a,b in zip(control['nativeVertical']['native']['externalWrenchKN_KNm'],soft['nativeVertical']['native']['externalWrenchKN_KNm']))>1e-8:raise ValueError('Stiffness-only edit changed external source wrench')
    def head_change(a,b):
        ah={r['id']:r['reactionKN_KNm'] for r in a['nativeVertical']['native']['heads']};bh={r['id']:r['reactionKN_KNm'] for r in b['nativeVertical']['native']['heads']}
        if ah.keys()!=bh.keys():raise ValueError('Physical52head identities differ')
        rows=[{'id':k,'component':i,'before':av,'after':bv,'difference':bv-av} for k in sorted(ah) for i,(av,bv) in enumerate(zip(ah[k],bh[k]))]
        return {'componentCount':len(rows),'maximum':max(rows,key=lambda r:abs(r['difference']))}
    for k,v in source['identities'].items():
        if sha((ROOT/k).read_bytes())!=v:raise ValueError('Native source changed during retained replay')
    result={'schema':'str-wet-masonry-arch-native-proof/1','sourceSHA256':source['identities'],'processingMethodSHA256':method,
        'archiveSHA256':sha(archive_bytes),'actualFullCaptureProvenance':provenance,
        'controls':{name:summary(n) for name,n in fulls.items()},'independentMaterialReplacement':mass_replacement(old,control),
        'actualNumericalRuntime':runtimes['oriented'],
        'headChanges':{'predecessorToArch':head_change(old,control),'archE3000ToE1500':head_change(control,soft)},
        'stiffnessEditUnchangedControls':{'physicalGWithin1eMinus8KN':True,'actualPlateCellsAndHolesIdentical':True},
        'nativeSolvesExecutedByThisReplay':False,'candidateAccepted':False,'wholeHouseAccepted':False,
        'scope':'Three actually coupled elastic-frame masonry/nativeRC200 comparisons. No masonry tensile/compression/contact/material, finite-node/tie/base resistance, complete pressure/signed envelope, mesh convergence, raised-ground or owner acceptance.'}
    if method!={p:sha((ROOT/p).read_bytes()) for p in METHODS}:raise ValueError('Processing source changed during replay')
    return result


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--write',action='store_true');parser.add_argument('--check',action='store_true');a=parser.parse_args();r=produce()
    if a.write:PROOF.write_text(json.dumps(r,indent=2,allow_nan=False)+'\n')
    elif a.check:
        if json.loads(PROOF.read_text())!=r:raise ValueError('Stale actual native masonry comparison')
    else:print(json.dumps(r,allow_nan=False))
