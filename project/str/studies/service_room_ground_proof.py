"""Replay explicit exploratory three-body captures; current saved route has two bodies.

The historical HAD receipt is an explicit test specimen, never current input.
Native/source identities, independent stock and all52 head controls stay strict.
"""
import hashlib,json,math,tarfile
from pathlib import Path
from service_room_ground import distinct_bodies,stock_wrench
from floor_section_model import load_source
from floor_section_proof import cases
D=Path(__file__).resolve().parent
ARCHIVE=D/'service-room-ground-comparison-captures.tar.xz'
PROOF=D/'service-room-ground-comparison.json'

def digest(data):return hashlib.sha256(data).hexdigest()
def close(a,b,tolerance=1e-6):
    if not math.isfinite(a) or not math.isfinite(b) or abs(a-b)>tolerance:raise ValueError('Independent ground capture control differs')
def receivers(body):
    rows={}
    for f in body['fibres']:
        x,y=f['xyMm'];force=f['baseCompressionKN'];w=rows.setdefault(f['receiverId'],[0.,0.,0.])
        for i,v in enumerate([force,force*y/1000,-force*x/1000]):w[i]+=v
    return rows

def produce():
    root=D.parents[2];source=load_source(root);current_case=dict(cases(source))['wet-aligned-quadrature8']
    method='project/str/studies/service_room_ground.py';method_sha=digest((root/method).read_bytes())
    with tarfile.open(ARCHIVE) as archive:
        data={m.name:archive.extractfile(m).read() for m in archive.getmembers() if m.isfile()}
    if digest(data['source-service_room_ground.py'])!=method_sha:raise ValueError('Archived executed method differs from current comparison')
    historical=json.loads(data['observed-HAD-local-receipt.json']);historical_sha=digest(data['observed-HAD-local-receipt.json'])
    if historical_sha!='182a05ef48c22ade4b58c9b62dda9d63267703b7de865b20d576ba0c3078d6d4':raise ValueError('Explicit historical HAD source changed')
    captured={name:json.loads(data[name+'.json']) for name in ['off','base','contact125','plate125','halfE']}
    baseline=captured['off'];reference=next(r for r in json.loads((D/'floor-section-proof.json').read_bytes())['controls'] if r['nativeCaseId']=='wet-aligned-quadrature8')
    old={h['id']:h['reactionKN_KNm'] for h in reference['heads']};rows=[]
    for name,r in captured.items():
        request=r['experimentalRequest'];native=r['native'];c=r['comparison']
        if request['nativeCase']!=current_case or r['sourceSHA256']!=source['identities'] or r['experimentalMethodSHA256']!={method:method_sha}:raise ValueError('Ground capture loses actual native request or current source identity')
        if request['structuralFloorBodies']!=historical['knownGravityInventory']['structuralFloorBodies'] or request['stockSource']['localReceiptSHA256']!=historical_sha:raise ValueError('Exploratory bodies lose their explicitly historical HAD source')
        if r['candidateAccepted'] or r['wholeHouseAccepted'] or r['removedNativeGKN']!=0 or r['baselineNativeGroundStockEvidence']['creditedWeightKN']!=0:raise ValueError('Unselected ground stock falsely admitted or double credited')
        heads={h['id']:h['reactionKN_KNm'] for h in native['heads']}
        if set(heads)!=set(old) or len(native['heads'])!=52 or any(len(w)!=6 or not all(math.isfinite(x) for x in w) for w in heads.values()):raise ValueError('Actual52-head catalogue lost')
        if max(map(abs,native['equilibriumResidualKN_KNm']))>1e-5:raise ValueError('Native52-head equilibrium lost')
        bodies=distinct_bodies(request['structuralFloorBodies']);wrench=[sum(stock_wrench(b)[1][i] for b in bodies) for i in range(6)]
        enabled=request['settings']['enabled'];weight=-wrench[2] if enabled else 0.
        close(r['mass']['joinedPhysicalGKN']-baseline['mass']['joinedPhysicalGKN'],weight)
        body_rows=[]
        if enabled:
            if len(c['bodies'])!=len(bodies):raise ValueError('Ground result loses physical body')
            for i,(b,result) in enumerate(zip(bodies,c['bodies'])):
                own=stock_wrench(b)[1];factor=c['physicalGFactorApplied'];top=base=0.;actual_wrench=[0.]*6
                for f in result['fibres']:
                    force=f['baseCompressionKN'];mineral=f['serialLaw']['bodyPhysicalGKN']*factor
                    close(force,f['topCompressionKN']+mineral);top+=f['topCompressionKN'];base+=force
                    x,y=f['xyMm'];at=[0,0,force,force*y/1000,-force*x/1000,0]
                    actual_wrench=[a+b for a,b in zip(actual_wrench,at)]
                close(base,-own[2]*factor)
                for u,v in zip(actual_wrench,own):close(u,-v*factor)
                close(top,stock_wrench(b)[0][0]['physicalGKN']*factor)
                if max(map(abs,result['topGravitySixWrenchResidualKN_KNm']+result['gridGravitySixWrenchResidualKN_KNm']))>1e-5:raise ValueError('Local independent wrench lost')
                close(result['plateWorkResidualKNmm'],0.,1e-6*max(1.,result['plateEnergyKNmm']))
                body_rows.append({'id':b['id'],'rcAndMineralGKN':-own[2],'plateEnergyKNmm':result['plateEnergyKNmm'],'peakSampledPressureMPa':result['peakSampledTopPressureMPa'],'openSamples':result['openingFibreCount'],'sampleCount':len(result['fibres']),'maximumOpeningMm':max(f['topOpeningMm'] for f in result['fibres']),'receiverBaseFzKN_MxMyKNm':receivers(result)})
        maximum=max(abs(a-b) for h,w in heads.items() for a,b in zip(w,old[h]))
        if name=='off':close(maximum,0.,1e-8)
        rows.append({'id':name,'captureSHA256':digest(data[name+'.json']),'settings':request['settings'],'addedUnfactoredKnownGKN':weight,'maximum312HeadComponentDifferenceFromOff':maximum,'nativeEnergyRelativeResidual':native['energyRelativeResidual'],'bodies':body_rows})
    by={r['id']:r for r in rows};changes=[]
    for name in ['contact125','plate125','halfE']:
        actual=by[name];comparisons=[]
        for a,b in zip(by['base']['bodies'],actual['bodies']):
            ar,br=a['receiverBaseFzKN_MxMyKNm'],b['receiverBaseFzKN_MxMyKNm']
            comparisons.append({'id':a['id'],'plateEnergyRelativeChange':b['plateEnergyKNmm']/a['plateEnergyKNmm']-1,'maximumReceiverBaseFzChangeKN':max(abs(br[k][0]-ar[k][0]) for k in ar),'maximumReceiverBaseMxMyChangeKNm':max(abs(br[k][i]-ar[k][i]) for k in ar for i in (1,2))})
        changes.append({'id':name,'bodies':comparisons})
    if by['halfE']['addedUnfactoredKnownGKN']!=by['base']['addedUnfactoredKnownGKN'] or max(v['maximumReceiverBaseFzChangeKN'] for v in changes[-1]['bodies'])<1e-4:raise ValueError('Stiffness perturbation loses unchanged G or real redistribution')
    return {'schema':'str-service-room-ground-comparison/1','sourceSHA256':{**source['identities'],method:method_sha},'captureArchiveSHA256':digest(ARCHIVE.read_bytes()),'historicalHADReceiptSHA256':historical_sha,'scope':'Explicit three-body historical wet-suite specimen, including unadopted lobby; current saved compiler regenerates two live room bodies instead. No source-ground/530-profile house adoption.','operatorOffMaximum312Difference':rows[0]['maximum312HeadComponentDifferenceFromOff'],'controls':rows,'separatePerturbations':changes,'contactConverged':False,'plateConverged':False,'materialStiffnessQualified':False,'fullInstalledInventoryIncluded':False,'completeReceiverCutsAvailable':False,'candidateAccepted':False,'wholeHouseAccepted':False}

if __name__=='__main__':
    import sys
    result=produce();content=json.dumps(result,indent=2,allow_nan=False)+'\n'
    if '--check' in sys.argv:
        if PROOF.read_text()!=content:raise ValueError('Stale known ground comparison')
    else:PROOF.write_text(content)
    print('Known floor G reaches actual grid; separate contact/plate sensitivity remains unqualified. Current saved route uses fresh HAD bodies.')
