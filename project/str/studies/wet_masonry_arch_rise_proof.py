"""Actual native geometry comparison and exact room costs; no solve on replay."""
import argparse
import copy
import hashlib
import html
import json
import math
import tarfile
from pathlib import Path

import wet_masonry_arch_native_proof as elastic
import wet_masonry_arch_released_proof as released
from wet_masonry_arch_rise import ROOT,METHOD,lower_arch_house
from wet_masonry_arch_comparison import geometry,CHOICES
from floor_section_model import load_source

D=Path(__file__).resolve().parent
PROCESS='project/str/studies/wet_masonry_arch_rise_proof.py'
ARCHIVE=D/'wet-masonry-arch-rise-captures.tar.xz'
PROOF=D/'wet-masonry-arch-rise-proof.json'
SVG=D/'wet-masonry-arch-rise-comparison.svg'
sha=lambda b:hashlib.sha256(b).hexdigest()


def requests(source):
    original=released.requests(source);result={}
    for rise in (450,600):
        for name in ('oriented','combined'):
            r=copy.deepcopy(original[name]);r['schema']='str-wet-masonry-arch-rise-request/1';r['archRiseMm']=rise
            r['caseId']=r['caseId'].replace('RELEASED','RISE'+str(rise));result[f'rise{rise}-{name}']=r
    null=copy.deepcopy(result['rise450-combined']);null['caseId']='WET-MASONRY-ARCH-RISE450-G0P9-Q0-NULLROOF'
    null['nativeCase']['bearingCase']['roofControls']['roofSurfacePressure']=None;result['rise450-null']=null
    return result


def geometry_costs(h,grid,rise):
    revised=lower_arch_house(h,rise) if rise!=300 else h;c=json.loads(CHOICES.read_text());g=geometry(c,revised,grid)
    p=g['archPhysicalGeometry'];radius=p['sourceInnerRadiusMm']-27;cz=p['sourceCurveCentreZMm'];cy=g['centreYMm']
    def head(y):return cz+math.sqrt(radius**2-(y-cy)**2)
    clear=g['finishedClearOpeningYMm'];minimum=min(head(y) for y in clear)
    height_width={}
    for z in (2000,2250,2400,2535,2680):
        width=min(c['finishedClearSpanMm'],2*math.sqrt(max(0.,radius**2-(z-cz)**2))) if z<=cz+radius else 0.
        # Declared50mm exposed tie envelope remains at2560 across the opening.
        height_width[str(z)]=width if z<=c['tieCentreZMm']-25 else 0.
    return {'geometry':g,'minimumFinishedIntradosAcrossOpeningMm':minimum,
        'minimumClearIncludingTieEnvelopeMm':min(minimum,c['tieCentreZMm']-25),
        'finishedOpeningWidthAtDeclaredBodyHeightsMm':height_width,
        'radiatorPull600BandMinimumIntradosMm':head(9150),
        'stairSouthPierPlanOverlapYMm':[8627.5,8949.5],
        'zeroOffsetStairIntrusionMm':12,'offsetRemovalEarned':False,
        'source2680ServicePacketAppliesToThisNewLivingArch':False,
        'protected2250AssemblyDutyAutomaticallyInherited':False,
        'roomOperationsOrAppearanceAccepted':False}


def geometry_change(old,new):
    a=old['experimentalArch']['arch'];b=new['experimentalArch']['arch']
    if old['nativeVertical']['plate']['cellsXYMm']!=new['nativeVertical']['plate']['cellsXYMm'] or old['nativeVertical']['plate']['holesXYMm']!=new['nativeVertical']['plate']['holesXYMm']:
        raise ValueError('Only lower-arch rise edit changed the actual floor mesh')
    if a['geometry']['lowerCoreRectangleXYMm']!=b['geometry']['lowerCoreRectangleXYMm']:raise ValueError('Rise edit changed the wall footprint')
    delta=b['grossMasonryGKN']-a['grossMasonryGKN'];actual=new['mass']['joinedPhysicalGKN']-old['mass']['joinedPhysicalGKN']
    if abs(delta-actual)>1e-7:raise ValueError('Actual rise mass edit differs from exact new masonry material')
    factor=new['request']['bearingCase']['masonryCase']['verticalCase']['monolithicCase']['houseCase']['boundary']['physicalGFactor']
    fz=-factor*delta;x=b['geometry']['lowerWallAxisXMm'];y=b['geometry']['centreYMm'];expected=[0,0,fz,y*fz/1000,-x*fz/1000,0]
    actual_wrench=[u-v for u,v in zip(new['nativeVertical']['native']['externalWrenchKN_KNm'],old['nativeVertical']['native']['externalWrenchKN_KNm'])]
    residual=[u-v for u,v in zip(actual_wrench,expected)]
    if max(map(abs,residual))>1e-6:raise ValueError('Rise edit changed source wrench beyond exact masonry G and first moments')
    return {'actualFloorCellsAndHolesIdentical':True,'exactAddedMasonryGKN':delta,'actualJoinedGChangeKN':actual,
        'sourceWrenchResidualFromAddedMaterialKN_KNm':residual,'onlyGrossMasonryGeometryChangesG':True}


def foot_work(n):
    rows=[]
    for p in n['experimentalArch']['arch']['piers']:
        u=p['recovery']['physicalEndDisplacementsMmRad'][:6];w=p['recovery']['physicalEndWrenchesKN_KNmm'][:6]
        products=[a*b/1000 for a,b in zip(u,w)]
        rows.append({'id':p['id'],'actualReceiverId':p['receiverId'],'physicalBaseXYZMm':p['baseXYZMm'],
            'actualSixGridTraceDisplacementsMmRad':u,'actualFootWrenchKN_KNmm':w,
            'signedBoundaryWrenchDisplacementComponentProductsKNm':products,
            'translationProductKNm':sum(products[:3]),'rotationProductKNm':sum(products[3:]),
            'totalBoundaryProductKNm':sum(products),
            'physicalWeldDPCOrBearingAccepted':False,
            'scope':'Actual all-six elastic grid trace at the pier foot. Wrench-times-displacement products are signed boundary work diagnostics, not a causal partition or masonry strain energy. All-six compatibility remains an unqualified physical weld; no friction/resistance is inferred.'})
    return rows


def pressure_only_change(null,combined):
    a=copy.deepcopy(null['experimentalRequest']);b=copy.deepcopy(combined['experimentalRequest']);a.pop('caseId');b.pop('caseId')
    a['nativeCase']['bearingCase']['roofControls']['roofSurfacePressure']=b['nativeCase']['bearingCase']['roofControls']['roofSurfacePressure']
    if a!=b:raise ValueError('Matched roof-pressure-only control changes another authored input')
    if null['nativeVertical']['plate']['cellsXYMm']!=combined['nativeVertical']['plate']['cellsXYMm'] or null['mass']['joinedPhysicalGKN']!=combined['mass']['joinedPhysicalGKN']:raise ValueError('Pressure-only control changes floor mesh or G')
    actual=[x-y for x,y in zip(combined['nativeVertical']['native']['externalWrenchKN_KNm'],null['nativeVertical']['native']['externalWrenchKN_KNm'])]
    expected=combined['roofCoupling']['roofSurfacePressure']['pressureWrenchKN_KNm'];residual=[x-y for x,y in zip(actual,expected)]
    if max(map(abs,residual))>1e-6:raise ValueError('Matched pressure edit loses actual additional roof source wrench')
    return {'onlyRoofPressureAndCaseIdChanged':True,'actualPlateCellsAndPhysicalGIdentical':True,
        'sourceRoofPressureWrenchResidualKN_KNm':residual,
        'scope':'Separate complete nonlinear0.9G/Q0 null-roof and suction solves, not superposition.'}


def produce():
    source=load_source(ROOT);prior=released.produce();expected=requests(source)
    methods={p:sha((ROOT/p).read_bytes()) for p in [METHOD,PROCESS,released.METHOD,released.PROCESS,*elastic.METHODS]}
    h=json.loads((ROOT/'project/had/studies/water-replan.json').read_text())['model'];grid=json.loads((ROOT/'project/str/studies/current-house-grid.json').read_text())
    costs={str(r):geometry_costs(h,grid,r) for r in (300,450,600)};controls={};fulls={};provenance={};runtime=None
    with tarfile.open(ARCHIVE,'r:xz') as tar:
        manifest=json.load(tar.extractfile('manifest.json'))
        if manifest['schema']!='str-wet-masonry-arch-rise-captures/1' or manifest['candidateAccepted'] is not False:raise ValueError('Actual rise capture scope differs')
        for name,request in expected.items():
            values={}
            for suffix in ('request.json','full.json','execution-start.json'):
                path=name+'-'+suffix;raw=tar.extractfile(path).read()
                if manifest['files'][path]!={'bytes':len(raw),'sha256':sha(raw)}:raise ValueError('Actual rise capture bytes differ: '+path)
                values[suffix]=json.loads(raw)
            n=values['full.json'];start=values['execution-start.json'];native=n['nativeVertical']['native'];a=n['experimentalArch']['arch']
            if values['request.json']!=request or n['experimentalRequest']!=request or n['schema']!='str-experimental-wet-masonry-rise-comparison/1':raise ValueError('Actual rise request/schema differs')
            if n['sourceSHA256']!=source['identities']:raise ValueError('Actual rise current58 source differs')
            if set(n['experimentalMethodSHA256'])!={METHOD,released.METHOD,elastic.METHODS[0],elastic.METHODS[2]}:raise ValueError('All four actual additive method identities required')
            if any(methods[p]!=v for p,v in n['experimentalMethodSHA256'].items()):raise ValueError('Actual executed rise method differs')
            if start['methodSHA256']!=methods[METHOD] or start['requestFileSHA256']!=manifest['files'][name+'-request.json']['sha256']:raise ValueError('Actual rise execution start differs')
            if runtime is None:runtime=start['numericalRuntime']
            elif runtime!=start['numericalRuntime']:raise ValueError('Actual rise compared runtimes differ')
            if native['caseId']!=request['caseId'] or len(native['heads'])!=52 or len({r['id'] for r in native['heads']})!=52:raise ValueError('Actual rise52head identity differs')
            if max(map(abs,native['equilibriumResidualKN_KNm']))>1e-5 or native['energyRelativeResidual']>1e-7:raise ValueError('Actual rise native balance/energy fails')
            if n['floorSection']['finishStairServiceEvidenceApplicable'] is not False:raise ValueError('Actual rise silently inherits architectural evidence')
            if a['geometry']!=costs[str(request['archRiseMm'])]['geometry']:raise ValueError('Actually executed rise geometry differs from current authored geometry')
            if a['actualMITC4PlateAndCSTMaterialRetained'] is not True or a['floorMomentFixityOrFrictionCredited'] is not False or min(-r['actualState']['forceKN'] for r in a['floorBearingFibres'])< -1e-7:raise ValueError('Native plate/normal-only contact scope lost')
            joints=a['idealReleasedJoints']
            if len(joints)!=4 or max(abs(r['releasedMomentKNmm']) for r in joints)>1e-5:raise ValueError('Actual rise ring releases not recovered')
            controls[name]={**elastic.summary(n),'actualPierNecessarySectionScreens':released.pier_screens(n),'actualReleasedJoints':joints,'actualPierFootWork':foot_work(n)}
            fulls[name]=n;provenance[name]=manifest['files'][name+'-full.json']
    changes={}
    with tarfile.open(released.ARCHIVE,'r:xz') as tar:
        for name,n in fulls.items():
            if name=='rise450-null':continue
            counterpart=name.split('-',1)[1];old=json.load(tar.extractfile(counterpart+'-full.json'));changes[name]=geometry_change(old,n)
    if any(sha((ROOT/p).read_bytes())!=v for p,v in source['identities'].items()) or methods!={p:sha((ROOT/p).read_bytes()) for p in methods}:raise ValueError('Current rise/source methods changed during replay')
    return {'schema':'str-wet-masonry-arch-rise-proof/1','sourceSHA256':source['identities'],'processingMethodSHA256':methods,
        'archiveSHA256':sha(ARCHIVE.read_bytes()),'actualCaptureProvenance':provenance,'actualNumericalRuntime':runtime,
        'released300PredecessorArchiveSHA256':prior['archiveSHA256'],'geometryAndRoomCosts':costs,
        'controls':controls,'independentGeometryEditChecks':changes,
        'matchedRoofPressureOnlyChange':pressure_only_change(fulls['rise450-null'],fulls['rise450-combined']),
        'sourceFoundationBoundary':'All52sourceheads are ideal translation-pinned/rotation-free, not fixed-rotation or soil-qualified. Individual52head rotations are not retained; actual local receiving-grid six-coordinate pier-foot traces are retained above.',
        'nativeSolvesExecutedByThisReplay':False,'candidateAccepted':False,'wholeHouseAccepted':False,
        'scope':'Actual lower450/600rise geometry with unchanged head2850/ring215/RC200/offset12/tie2560 and same native original laws, all52heads, both1.35G/Q2 and0.9G/Q0/suction controls. No physical joint/contact/masonry/tie/grid strength, complete signed envelope, new-rise zeroG diagnostic, owner architectural or current-house acceptance.'}


def drawing(result):
    rows=['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="620" viewBox="0 0 1200 620"><style>text{font-family:Arial,sans-serif;fill:#292825}.s{font-size:13px}.w{fill:#923b2b}</style><rect width="1200" height="620" fill="#faf8f2"/><text x="30" y="32" font-size="23">Lower wet arch: exact geometry comparison, unselected</text><text x="30" y="56" class="s">Same head2850 / ring215 / RC3170 soffit /12mm eccentric lower core / tie2560. Actual furnished room and physical masonry remain unaccepted.</text>']
    scale=.09
    for column,rise in enumerate((300,450,600)):
        c=result['geometryAndRoomCosts'][str(rise)];g=c['geometry'];p=g['archPhysicalGeometry'];left=38+column*390
        xx=lambda y:left+(y-8500)*scale
        zz=lambda z:420-z*scale
        cy=g['centreYMm'];cz=p['sourceCurveCentreZMm'];ri=p['sourceInnerRadiusMm'];ro=p['sourceOuterRadiusMm'];angle=p['seatAngleRad']
        def arc(radius):return ' '.join(f'{xx(cy+radius*math.sin(-angle+2*angle*i/80)):.3f},{zz(cz+radius*math.cos(-angle+2*angle*i/80)):.3f}' for i in range(81))
        lo,hi=g['rawOpeningYMm'];rect=g['lowerCoreRectangleXYMm']
        rows.append(f'<text x="{left}" y="90" font-size="19">Rise{rise} / spring{2850-rise}</text><rect x="{xx(rect[1]):.3f}" y="{zz(3170):.3f}" width="{(rect[3]-rect[1])*scale}" height="{3350*scale}" fill="#e1d7c6"/><polygon points="{xx(lo)},{zz(0)} {arc(ri)} {xx(hi)},{zz(0)}" fill="#faf8f2"/><polyline points="{arc(ro)}" fill="none" stroke="#8d6852" stroke-width="2"/><line x1="{xx(rect[1])}" x2="{xx(rect[3])}" y1="{zz(3170)}" y2="{zz(3170)}" stroke="#555" stroke-width="4"/><line x1="{xx(8700)}" x2="{xx(11650)}" y1="{zz(2560)}" y2="{zz(2560)}" stroke="#a38a46" stroke-width="3"/><rect x="{xx(9800)}" y="440" width="{750*scale}" height="10" fill="#879676"/><text x="{left}" y="471" class="s">Green: actual sofaY interval; height not authored.</text><text x="{left}" y="493" class="s">Minimum finished intrados{c["minimumFinishedIntradosAcrossOpeningMm"]:.1f}mm</text><text x="{left}" y="515" class="s">Clear incl.tie envelope{c["minimumClearIncludingTieEnvelopeMm"]:.1f}mm</text><text x="{left}" y="537" class="s">Gross masonry{g["wallMinusOpeningGrossVolumeM3"]:.4f}m³</text>')
    rows.append('<text x="30" y="577" class="s w">Ideal releases are not physical pins. Same south pier still overlaps stair322mm; deeper rise earns no automatic removal of12mm offset.</text><text x="30" y="600" class="s w">Rough openings shown;27finish included in stated clearances. Source-ground0; no complete signed envelope, material resistance or owner verdict.</text></svg>')
    return ''.join(rows)+'\n'


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--write',action='store_true');p.add_argument('--check',action='store_true');a=p.parse_args();r=produce();svg=drawing(r)
    if a.write:PROOF.write_text(json.dumps(r,indent=2,allow_nan=False)+'\n');SVG.write_text(svg)
    elif a.check:
        if json.loads(PROOF.read_text())!=r or SVG.read_text()!=svg:raise ValueError('Stale actual rise geometry/room comparison')
    else:print(json.dumps(r,allow_nan=False))
