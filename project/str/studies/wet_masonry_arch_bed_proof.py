"""Current-source normal-bed replay. Actual captures, no native solve on replay."""
import argparse,copy,hashlib,html,json,math,tarfile
from pathlib import Path
from floor_section_model import load_source
from wet_masonry_arch_native_proof import summary
from lower_core_bodies import partition_free_body_receivers
from wet_masonry_arch_bed import ROOT,METHOD,admit_bed
D=Path(__file__).resolve().parent
ARCHIVE=D/'wet-masonry-arch-bed-captures.tar.xz'
PROOF=D/'wet-masonry-arch-bed-proof.json'
SVG=D/'wet-masonry-arch-bed.svg'
sha=lambda b:hashlib.sha256(b).hexdigest()


def beam_coverage(rectangle,grid):
    receivers=[]
    for name,row in grid['girders'].items():
        a,b=row['extent'];d=row['datum'];w=row['width']/2
        bounds=[d-w,a,d+w,b] if row['axis']=='y' else [a,d-w,b,d+w]
        receivers.append({'id':'GRID/'+name,'kind':'beam','boundsXYMm':bounds})
    a,b,c,d=rectangle
    parts=partition_free_body_receivers([{'id':'actual-foot','boxXYZMm':[a,b,-181,c,d,-180]}],receivers)
    if not parts or any(not p['receiverIds']['beam'] for p in parts):raise ValueError('Actual complete bed footprint lacks beam-only receiver coverage')
    return {'exactBeamOnlyPartition':parts,'capOrClosureCredit':False,'uncoveredPieces':[],
            'overlappingBeamBranchIsAnIdealisation':True,'physicalCrossingJointQualified':False}


def row(n):
    s=summary(n);a=n['experimentalArch']['arch'];piers=[]
    grid=json.loads((ROOT/'project/str/studies/current-house-grid.json').read_bytes())
    for p in a['piers']:
        b=p['normalBed'];N=b['normalCompressionKN'];fx,fy,mz=b['idealKeyRequiredFxFyKNAndMzKNmm']
        piers.append({'id':p['id'],'rectangleXYMm':b['rectangleXYMm'],'coverage':beam_coverage(b['rectangleXYMm'],grid),
         'normalCompressionKN':N,'centreOfPressureRelativeToFootMm':[ -b['normalFirstMomentsKNmm'][1]/N,b['normalFirstMomentsKNmm'][0]/N] if N>1e-5 else None,
         'peakSampledPressureMPa':b['peakSampledPressureMPa'],'normalFirstMomentsKNmm':b['normalFirstMomentsKNmm'],
         'sampledActiveFibres':sum(f['actualState']['active'] for f in b['fibres']),'sampledFibreCount':len(b['fibres']),
         'idealKeyRequiredFxFyKNAndMzKNmm':[fx,fy,mz],'normalBoundaryResidualKN_KNmm':b['physicalPierNormalBoundaryResidualKN_KNmm'],
         'actualFootNormalCoordinatesUzRxRy': [b['actualFootDisplacementMmRad'][k] for k in (2,3,4)],
         'actualHybridPierBaseCoordinatesMmRad':p['recovery']['physicalEndDisplacementsMmRad'][:6],
         'coordinateOwnership':'UX/UY/RZ are actual receiving-grid key traces; UZ/RX/RY are the separate normal-foot coordinates, not grid rotations.',
         'maximumRigidWorkResidual':b['maximumRigidWorkResidual'],'unusedGaugeSupportWrenchKN_KNmm':b['unusedGaugeSupportWrenchKN_KNmm'],
         'sampleReceiverIds':sorted({f['receiverId'] for f in b['fibres']}),'samplePressureMPa':[f['pressureMPa'] for f in b['fibres']],
         'fullAreaContactEstablishedBySamples':False,'contactConverged':False,'materialAndKeyResistanceAccepted':False})
    return {'heads':s['heads'],'globalWrenchResidualKN_KNm':s['globalWrenchResidualKN_KNm'],'archFreeBodyResidualKN_KNm':s['archFreeBodyResidualKN_KNm'],
     'joinedPhysicalGKN':s['joinedPhysicalGKN'],'ringScreen':s['necessaryCompressionOnlyRingScreen'],'piers':piers,
     'frameEnergyRelativeResidual':s['frameEnergyRelativeResidual'],'plateWorkRelativeResidual':s['plateWorkRelativeResidual'],
     'wholeHouseAccepted':False,'candidateAccepted':False}


def difference(a,b,criteria):
    heads=max(abs(x-y) for r,s in zip(a['heads'],b['heads']) for x,y in zip(r['reactionKN_KNm'],s['reactionKN_KNm']))
    if [r['id'] for r in a['heads']]!=[r['id'] for r in b['heads']]:raise ValueError('Changed52head identity')
    rows=[]
    for p,q in zip(a['piers'],b['piers']):
        if p['id']!=q['id'] or p['rectangleXYMm']!=q['rectangleXYMm']:raise ValueError('Changed actual foot geometry')
        force=abs(q['normalCompressionKN']-p['normalCompressionKN']);limit=max(criteria['forceAbsoluteKN'],criteria['forceRelative']*max(abs(q['normalCompressionKN']),abs(p['normalCompressionKN'])))
        centre=max(abs(x-y) for x,y in zip(p['centreOfPressureRelativeToFootMm'],q['centreOfPressureRelativeToFootMm'])) if p['centreOfPressureRelativeToFootMm'] and q['centreOfPressureRelativeToFootMm'] else None
        rows.append({'id':p['id'],'forceChangeKN':force,'forceToleranceKN':limit,'centreOfPressureChangeMm':centre,
         'centreToleranceMm':criteria['centreOfPressureAbsoluteMm'],'peakSampledPressureChangeMPa':q['peakSampledPressureMPa']-p['peakSampledPressureMPa'],
         'forceAndCentroidScreenPasses':force<=limit and centre is not None and centre<=criteria['centreOfPressureAbsoluteMm']})
    return {'maximum52HeadComponentDifferenceKN_KNm':heads,'headToleranceKN_KNm':criteria['maximum52HeadComponentDifferenceKN_KNm'],'piers':rows,
     'monitoredNumericalScreenPasses':heads<=criteria['maximum52HeadComponentDifferenceKN_KNm'] and all(r['forceAndCentroidScreenPasses'] for r in rows),
     'exactAffinePadOracleApplicable':False,'physicalBedOrMasonryAccepted':False}


def produce():
    source=load_source(ROOT);criteria_path=D/'wet-bearing-refinement-inputs.json';criteria=json.loads(criteria_path.read_bytes())['criteria']
    controls={};provenance={};full={};runtime=None
    methods={p:sha((ROOT/p).read_bytes()) for p in [METHOD,'project/str/studies/wet_masonry_arch_bed_proof.py','project/str/studies/wet_masonry_arch_rise.py','project/str/studies/wet_masonry_arch_released.py','project/str/studies/wet_masonry_arch_native.py','project/str/studies/wet_masonry_arch_comparison.py','project/str/studies/lower_core_bodies.py']}
    with tarfile.open(ARCHIVE,'r:xz') as t:
        manifest=json.load(t.extractfile('manifest.json'))
        for cells in (4,8,16):
            name='bed'+str(cells);parts={}
            for suffix in ('.request.json','.full.json','.full.execution-start.json'):
                raw=t.extractfile(name+suffix).read();identity={'bytes':len(raw),'sha256':sha(raw)}
                if manifest['files'][name+suffix]!=identity:raise ValueError('Actual bed archive differs')
                parts[suffix]=json.loads(raw)
            n=parts['.full.json'];r=parts['.request.json'];start=parts['.full.execution-start.json'];bed=admit_bed(r['normalBed'])
            if r!=n['experimentalRequest'] or r['schema']!='str-wet-masonry-arch-bed-request/1' or r['archRiseMm']!=450 or bed['cellsPerAxis']!=cells or bed['normalComplianceMmPerMPa']!=.1 or not bed['enabled']:raise ValueError('Actual normal-bed request differs')
            if n['sourceSHA256']!=source['identities'] or r['nativeCase']['sourceSHA256']!=source['identities']:raise ValueError('Current58 native sources differ')
            for p,v in n['experimentalMethodSHA256'].items():
                if sha((ROOT/p).read_bytes())!=v:raise ValueError('Actual experimental method differs: '+p)
            if start['methodSHA256']!=methods[METHOD] or start['requestSHA256']!=manifest['files'][name+'.request.json']['sha256'] or start['accepted'] is not False:raise ValueError('Actual start/method identity differs')
            if runtime is None:runtime=start['numericalRuntime']
            elif runtime!=start['numericalRuntime']:raise ValueError('Compared runtime differs')
            if n['experimentalArch']['arch']['pierFootAllSixWeldRetained'] is not False or n['floorSection']['finishStairServiceEvidenceApplicable'] is not False:raise ValueError('Comparison silently retains welded/architectural acceptance')
            controls[name]=row(n);full[name]=n;provenance[name]=manifest['files'][name+'.full.json']
            if max(map(abs,controls[name]['globalWrenchResidualKN_KNm']))>1e-5 or max(map(abs,controls[name]['archFreeBodyResidualKN_KNm']))>1e-6:raise ValueError('Actual house/arch source-wrench balance fails')
    with tarfile.open(D/'wet-masonry-arch-rise-captures.tar.xz','r:xz') as t:old=json.load(t.extractfile('rise450-null-full.json'))
    unchanged={}
    baseline=copy.deepcopy(old['experimentalRequest']);baseline.pop('caseId')
    for name,n in full.items():
        actual=copy.deepcopy(n['experimentalRequest']);actual.pop('caseId');actual.pop('normalBed');actual['schema']='str-wet-masonry-arch-rise-request/1'
        if actual!=baseline:raise ValueError('Bed comparison changes other actual inputs')
        if n['mass']!=old['mass'] or n['nativeVertical']['plate']['cellsXYMm']!=old['nativeVertical']['plate']['cellsXYMm'] or n['nativeVertical']['plate']['holesXYMm']!=old['nativeVertical']['plate']['holesXYMm']:raise ValueError('Bed changes physical mass/floor material')
        delta=[a-b for a,b in zip(n['nativeVertical']['native']['externalWrenchKN_KNm'],old['nativeVertical']['native']['externalWrenchKN_KNm'])]
        if max(map(abs,delta))>1e-7:raise ValueError('Bed changes source load inventory')
        unchanged[name]={'massInventoryAndPlateCellsHolesExactlyEqual':True,'sourceWrenchDeltaKN_KNm':delta}
    result={'schema':'str-normal-bed-source-proof/1','sourceSHA256':source['identities'],'processingMethodSHA256':methods,'archiveSHA256':sha(ARCHIVE.read_bytes()),
     'criteriaSHA256':sha(criteria_path.read_bytes()),'criteria':criteria,'actualNumericalRuntime':runtime,'actualCaptureProvenance':provenance,
     'welded450NullPredecessorArchiveSHA256':sha((D/'wet-masonry-arch-rise-captures.tar.xz').read_bytes()),'controls':controls,'unchangedControls':unchanged,
     'normalQuadratureComparisons':{'4to8':difference(controls['bed4'],controls['bed8'],criteria),'8to16':difference(controls['bed8'],controls['bed16'],criteria)},
     'nativeSolvesExecutedByReplay':False,'candidateAccepted':False,'physicalMasonryBedKeysOrWholeHouseAccepted':False,
     'scope':'Actual450-rise0.9G/Q0/null-roof comparison only, with finite normal beds and ideal centroid keys. Reuses force/centroid/head numerical criteria without the inapplicable affine lower-plane oracle. Sample pressures/contact flags and failed refinement earn no physical contact/stress convergence. Every tested case retains eight outside-section ring cuts; this declared bed is not a successful repair of the fixed elastic masonry candidate.'}
    return result


def drawing(p):
    parts=['<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="690" viewBox="0 0 1100 690"><rect width="1100" height="690" fill="#f5f2e9"/><g fill="#252b33" font-family="sans-serif"><text x="35" y="40" font-size="22">Lower masonry: finite normal beds, actual receiving grid</text><text x="35" y="67" font-size="14">Unselected450-rise /0.9G /Q0 /null-roof. Sample pressure; no physical contact or resistance acceptance.</text>']
    for k,pier in enumerate(p['controls']['bed16']['piers']):
        x=45+k*505;y=110;parts.append(f'<text x="{x}" y="{y-15}" font-size="16">{html.escape(pier["id"])}</text>')
        peak=max(pier['samplePressureMPa'])
        for j,value in enumerate(pier['samplePressureMPa']):
            i,jj=divmod(j,16);shade=int(245-150*value/peak)
            parts.append(f'<rect x="{x+i*12}" y="{y+jj*20}" width="12" height="20" fill="rgb({shade},{min(255,shade+20)},245)" stroke="#ddd" stroke-width=".3"/>')
        labels=[f'N {pier["normalCompressionKN"]:.6f}kN',f'Peak sample {peak:.6f}MPa',f'Active samples {pier["sampledActiveFibres"]}/256',f'Key Fx/Fy {pier["idealKeyRequiredFxFyKNAndMzKNmm"][0]:.6f}/{pier["idealKeyRequiredFxFyKNAndMzKNmm"][1]:.6f}kN',f'Key Mz {pier["idealKeyRequiredFxFyKNAndMzKNmm"][2]/1000:.6f}kNm']
        for j,label in enumerate(labels):parts.append(f'<text x="{x+210}" y="{y+28+j*26}" font-size="14">{label}</text>')
    parts+=['<text x="35" y="485" font-size="18">The ideal weld was not the successful repair</text>']
    for j,(name,c) in enumerate(p['controls'].items()):
        screen=c['ringScreen'];e=screen['worstPositiveCompressionCut']['inPlaneEccentricityMm']
        parts.append(f'<text x="35" y="{518+j*25}" font-size="15">{name}: {screen["resultantOutsideSectionCount"]} outside-section ring cuts; governing eccentricity {e:.3f}mm /107.5mm half-depth.</text>')
    parts+=['<text x="35" y="615" font-size="14">Actual full footprints have beam-only source coverage. Overlapping receiver branch and keys remain idealisations.</text>','<text x="35" y="642" font-size="14">Both4→8 and8→16 force/centroid/head screens remain explicit in the receipt; no sampled-contact acceptance.</text>','<text x="35" y="668" font-size="12">Schematic maps: X across, Y down; shading normalised separately to each foot peak. Not to physical scale.</text>','</g></svg>']
    return ''.join(parts)


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--check',action='store_true');a=p.parse_args();r=produce();text=json.dumps(r,indent=2)+'\n';svg=drawing(r)+'\n'
    if a.check:
        if PROOF.read_text()!=text or SVG.read_text()!=svg:raise ValueError('Stale normal-bed proof/figure')
    else:PROOF.write_text(text);SVG.write_text(svg)
    print(json.dumps({k:v['monitoredNumericalScreenPasses'] for k,v in r['normalQuadratureComparisons'].items()}))
